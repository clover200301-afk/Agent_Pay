"use client";

import { useCallback, useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits, type Address } from "viem";
import {
  AGENTPAY_ABI,
  ERC20_ABI,
  USDC_DECIMALS,
  getAgentPayAddress,
  getUsdcAddress,
} from "@/lib/contract";
import { generateApiKey } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { useApiKeysStore } from "@/stores/useApiKeysStore";
import { useT } from "@/lib/i18n/context";
import { toast } from "sonner";

/**
 * Payment hook for the demo's USDC flow on Monad Testnet:
 *   1. USDC.approve(AgentPay, amount)        —— allowance grant
 *   2. AgentPay.payWithUSDC(recipient, amount, taskRef) —— actual transfer
 *
 * Each step waits for receipt before continuing; both tx hashes land in
 * the store so the PaymentPanel can show two-stage progress.
 *
 * When the AgentPay contract address is missing (e.g. running before
 * deploy), we fall back to a mock txHash so the demo still flows.
 */
export type PayStatus =
  | "idle"
  | "approving"
  | "approve_confirming"
  | "paying"
  | "pay_confirming"
  | "success"
  | "error";

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
  const updateTask = useAppStore((s) => s.updateTask);
  const currentTaskId = useAppStore((s) => s.currentTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const addIssuedKey = useApiKeysStore((s) => s.addKey);

  const [status, setStatus] = useState<PayStatus>("idle");
  const [error, setError] = useState<string | undefined>();

  const approve = useCallback(async () => {
    if (!paymentIntent) {
      throw new Error("No payment intent in store");
    }
    if (!address) {
      throw new Error("Wallet not connected");
    }

    const contract = getAgentPayAddress();
    const usdc = getUsdcAddress();
    const amount = parseUnits(paymentIntent.amountUsdc.toString(), USDC_DECIMALS);
    const taskRef = paymentIntent.taskRef as `0x${string}`;
    const recipient = paymentIntent.recipient as Address;

    setError(undefined);
    setWorkflowState("paying");
    if (currentTaskId) updateTask(currentTaskId, { status: "paying" });

    try {
      let approveHash: `0x${string}`;
      let payHash: `0x${string}`;

      if (contract && publicClient) {
        // Step 1: approve USDC.
        setStatus("approving");
        approveHash = await writeContractAsync({
          abi: ERC20_ABI,
          address: usdc,
          functionName: "approve",
          args: [contract, amount],
        });
        setApproveTxHash(approveHash);

        setStatus("approve_confirming");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // Step 2: payWithUSDC.
        setStatus("paying");
        payHash = await writeContractAsync({
          abi: AGENTPAY_ABI,
          address: contract,
          functionName: "payWithUSDC",
          args: [recipient, amount, taskRef],
        });
        setTxHash(payHash);

        setStatus("pay_confirming");
        await publicClient.waitForTransactionReceipt({ hash: payHash });
      } else {
        // Pre-deploy fallback: mock both hashes so the demo can still run.
        approveHash = mockHash();
        payHash = mockHash();
        setApproveTxHash(approveHash);
        setStatus("approve_confirming");
        await wait(1200);
        setTxHash(payHash);
        setStatus("pay_confirming");
        await wait(1500);
      }

      // Mint the user-facing API key (mock —— real provisioning is out of scope).
      const apiKey = generateApiKey();
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
      if (task?.selectedProvider) {
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
      return { approveHash, payHash, apiKey };
    } catch (e) {
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
    setApiKey,
    setWorkflowState,
    updateTask,
    currentTaskId,
    tasks,
    addIssuedKey,
    t,
  ]);

  const reject = useCallback(() => {
    setStatus("idle");
    setWorkflowState("rejected");
    if (currentTaskId) updateTask(currentTaskId, { status: "rejected" });
  }, [setWorkflowState, currentTaskId, updateTask]);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(undefined);
  }, []);

  return { approve, reject, reset, status, error };
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
