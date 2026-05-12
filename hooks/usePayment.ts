"use client";

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits, type Address } from "viem";
import {
  AGENTPAY_ABI,
  ERC20_ABI,
  USDC_DECIMALS,
  USDC_TO_MON_BASE_SCALE,
  getAgentPayAddress,
  getUsdcAddress,
  type PaymentMode,
} from "@/lib/contract";
import { generateApiKey } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { useApiKeysStore } from "@/stores/useApiKeysStore";
import { useT } from "@/lib/i18n/context";
import { toast } from "sonner";

/**
 * Payment hook for the demo's Monad flow:
 *   USDC path (preferred, when wallet holds ≥ amount USDC):
 *     1. USDC.approve(AgentPay, amount)
 *     2. AgentPay.payWithUSDC(recipient, amount, taskRef)
 *   Native MON fallback (when USDC balance is insufficient):
 *     1. AgentPay.pay{value: amountMon}(recipient, taskRef)
 *        amountMon = amountUsdc * USDC_TO_MON_BASE_SCALE (1 USDC = 0.01 MON)
 *   Then: POST /api/issue-key with txHash + paymentMode →
 *     server verifies the PaymentCompleted event before minting an API key.
 *
 * When the AgentPay contract address is missing (pre-deploy), we fall back
 * to a mock txHash + local API key so the demo still flows.
 */
export type PayStatus =
  | "idle"
  | "approving"
  | "approve_confirming"
  | "paying"
  | "pay_confirming"
  | "verifying"
  | "success"
  | "issue_failed"
  | "error";

class IssueKeyError extends Error {
  constructor(message: string, public payHash: `0x${string}`) {
    super(message);
    this.name = "IssueKeyError";
  }
}

async function callIssueKey(
  txHash: `0x${string}`,
  paymentIntent: NonNullable<ReturnType<typeof useAppStore.getState>["paymentIntent"]>,
  paymentMode: PaymentMode,
): Promise<string> {
  const res = await fetch("/api/issue-key", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txHash, paymentIntent, paymentMode }),
  });
  const data = await res.json().catch(() => ({ ok: false, error: "bad_response" }));
  if (!res.ok || !data.ok) {
    throw new IssueKeyError(data.error ?? "issue_failed", txHash);
  }
  return data.apiKey as string;
}

export function usePayment() {
  const t = useT();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const paymentIntent = useAppStore((s) => s.paymentIntent);
  const setApproveTxHash = useAppStore((s) => s.setApproveTxHash);
  const setTxHash = useAppStore((s) => s.setTxHash);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const setWorkflowState = useAppStore((s) => s.setWorkflowState);
  const setPaymentMode = useAppStore((s) => s.setPaymentMode);
  const updateTask = useAppStore((s) => s.updateTask);
  const currentTaskId = useAppStore((s) => s.currentTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const txHash = useAppStore((s) => s.txHash);
  const lastPaymentMode = useAppStore((s) => s.paymentMode);
  const addIssuedKey = useApiKeysStore((s) => s.addKey);

  const [status, setStatus] = useState<PayStatus>("idle");
  const [error, setError] = useState<string | undefined>();

  const finalizeSuccess = useCallback(
    (apiKey: string, payHash: `0x${string}`) => {
      setApiKey(apiKey);
      setStatus("success");
      setWorkflowState("success");

      const tid = currentTaskId;
      const task = tid ? tasks.find((tt) => tt.id === tid) : undefined;
      if (tid) {
        updateTask(tid, {
          status: "completed",
          txHash: payHash,
          apiKey,
          completedAt: Date.now(),
        });
      }
      if (task?.selectedProvider && paymentIntent) {
        addIssuedKey({
          id: `key_${Date.now()}`,
          providerId: task.selectedProvider.id,
          providerName: task.selectedProvider.name,
          priceUsdc: paymentIntent.amountUsdc,
          apiKey,
          txHash: payHash,
          taskId: tid,
          createdAt: Date.now(),
        });
      }

      toast.success(t.tx.txConfirmedToast, { description: t.tx.apiKeyToast });
    },
    [
      setApiKey,
      setWorkflowState,
      currentTaskId,
      tasks,
      updateTask,
      paymentIntent,
      addIssuedKey,
      t,
    ],
  );

  const approve = useCallback(async () => {
    if (!paymentIntent) {
      throw new Error("No payment intent in store");
    }

    const contract = getAgentPayAddress();
    if (contract && !address) {
      throw new Error("Wallet not connected");
    }

    const usdc = getUsdcAddress();
    const amountUsdc = parseUnits(
      paymentIntent.amountUsdc.toString(),
      USDC_DECIMALS,
    );
    const amountMon = amountUsdc * USDC_TO_MON_BASE_SCALE;
    const taskRef = paymentIntent.taskRef as `0x${string}`;
    const recipient = paymentIntent.recipient as Address;

    setError(undefined);
    setWorkflowState("paying");
    if (currentTaskId) updateTask(currentTaskId, { status: "paying" });

    try {
      let approveHash: `0x${string}` | undefined;
      let payHash: `0x${string}`;
      let apiKey: string;
      let paymentMode: PaymentMode = "usdc";

      if (contract && publicClient) {
        // Decide path: USDC if wallet balance covers amount, else native MON.
        let usdcBalance = 0n;
        try {
          usdcBalance = (await publicClient.readContract({
            abi: ERC20_ABI,
            address: usdc,
            functionName: "balanceOf",
            args: [address!],
          })) as bigint;
        } catch {
          // RPC blip — treat as zero and fall through to MON fallback.
        }
        paymentMode = usdcBalance >= amountUsdc ? "usdc" : "mon";
        setPaymentMode(paymentMode);

        if (paymentMode === "usdc") {
          setStatus("approving");
          approveHash = await writeContractAsync({
            abi: ERC20_ABI,
            address: usdc,
            functionName: "approve",
            args: [contract, amountUsdc],
          });
          setApproveTxHash(approveHash);

          setStatus("approve_confirming");
          await publicClient.waitForTransactionReceipt({ hash: approveHash });

          setStatus("paying");
          payHash = await writeContractAsync({
            abi: AGENTPAY_ABI,
            address: contract,
            functionName: "payWithUSDC",
            args: [recipient, amountUsdc, taskRef],
          });
        } else {
          // Native MON path: single tx, no approval needed.
          setStatus("paying");
          payHash = await writeContractAsync({
            abi: AGENTPAY_ABI,
            address: contract,
            functionName: "pay",
            args: [recipient, taskRef],
            value: amountMon,
          });
        }
        setTxHash(payHash);

        setStatus("pay_confirming");
        await publicClient.waitForTransactionReceipt({ hash: payHash });

        setStatus("verifying");
        apiKey = await callIssueKey(payHash, paymentIntent, paymentMode);
      } else {
        // Pre-deploy fallback: mock hashes + local key, skip verification.
        paymentMode = "usdc";
        setPaymentMode(paymentMode);
        approveHash = mockHash();
        payHash = mockHash();
        setApproveTxHash(approveHash);
        setStatus("approve_confirming");
        await wait(1200);
        setTxHash(payHash);
        setStatus("pay_confirming");
        await wait(1500);
        apiKey = generateApiKey();
      }

      finalizeSuccess(apiKey, payHash);
      return { approveHash, payHash, apiKey, paymentMode };
    } catch (e) {
      if (e instanceof IssueKeyError) {
        const msg = e.message;
        setError(msg);
        setStatus("issue_failed");
        setWorkflowState("issue_failed");
        toast.error(t.tx.paymentFailedToast, {
          description: `${t.tx.issueFailedDesc} (${msg})`,
        });
        throw e;
      }
      const msg = e instanceof Error ? e.message : "Transaction rejected";
      setError(msg);
      setStatus("error");
      setWorkflowState("awaiting_approval");
      toast.error(t.tx.paymentFailedToast, { description: msg });
      throw e;
    }
  }, [
    paymentIntent,
    address,
    publicClient,
    writeContractAsync,
    setApproveTxHash,
    setTxHash,
    setWorkflowState,
    setPaymentMode,
    updateTask,
    currentTaskId,
    finalizeSuccess,
    t,
  ]);

  /**
   * Retry server-side key issuance using the existing payHash + intent.
   * Idempotent server-side, so repeated calls return the same key.
   */
  const retryIssueKey = useCallback(async () => {
    if (!paymentIntent) throw new Error("No payment intent");
    if (!txHash) throw new Error("No transaction hash to retry");

    setError(undefined);
    setStatus("verifying");
    setWorkflowState("paying");

    try {
      const apiKey = await callIssueKey(
        txHash as `0x${string}`,
        paymentIntent,
        lastPaymentMode ?? "usdc",
      );
      finalizeSuccess(apiKey, txHash as `0x${string}`);
      return apiKey;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Retry failed";
      setError(msg);
      setStatus("issue_failed");
      setWorkflowState("issue_failed");
      toast.error(t.tx.paymentFailedToast, {
        description: `${t.tx.issueFailedDesc} (${msg})`,
      });
      throw e;
    }
  }, [
    paymentIntent,
    txHash,
    lastPaymentMode,
    setWorkflowState,
    finalizeSuccess,
    t,
  ]);

  const reject = useCallback(() => {
    setStatus("idle");
    setError(undefined);
    setApproveTxHash(undefined);
    setTxHash(undefined);
    setPaymentMode(undefined);
    setWorkflowState("rejected");
    if (currentTaskId) updateTask(currentTaskId, { status: "rejected" });
  }, [
    setWorkflowState,
    setApproveTxHash,
    setTxHash,
    setPaymentMode,
    currentTaskId,
    updateTask,
  ]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
  }, []);

  return { approve, reject, reset, retryIssueKey, status, error };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mockHash(): `0x${string}` {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `0x${hex}` as `0x${string}`;
}
