"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/useAppStore";
import { usePayment } from "@/hooks/usePayment";
import { useT } from "@/lib/i18n/context";
import {
  ERC20_ABI,
  USDC_DECIMALS,
  USDC_TO_MON_BASE_SCALE,
  getUsdcAddress,
} from "@/lib/contract";
import type { Task } from "@/types/task";

export function PaymentApprovalCard({ task }: { task?: Task } = {}) {
  const t = useT();
  const workflowState = useAppStore((s) => s.workflowState);
  const paymentIntent = useAppStore((s) => s.paymentIntent);
  const { address } = useAccount();
  const { approve, reject, status } = usePayment();

  // Two modes: live workflow OR history review of a completed task.
  const reviewMode = !!task;

  // Source of truth: live mode reads from paymentIntent (set by the agent's
  // proposePayment tool or the mock workflow); review mode reads from the
  // persisted task record.
  const display = reviewMode
    ? task!.selectedProvider
      ? {
          providerName: task!.selectedProvider.name,
          amountUsdc: task!.selectedProvider.priceUsdc,
          reason: task!.selectedProvider.tagline,
        }
      : undefined
    : paymentIntent
    ? {
        providerName: paymentIntent.providerName,
        amountUsdc: paymentIntent.amountUsdc,
        reason: paymentIntent.reason,
      }
    : undefined;

  // Look up the wallet's USDC balance so the card can preview which path the
  // approve action will take (USDC if balance covers it, else native MON).
  const amountUsdcRaw = display
    ? parseUnits(display.amountUsdc.toString(), USDC_DECIMALS)
    : 0n;
  const { data: usdcBalance } = useReadContract({
    abi: ERC20_ABI,
    address: getUsdcAddress(),
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !reviewMode },
  });
  const willUseUsdc =
    !reviewMode && usdcBalance !== undefined && usdcBalance >= amountUsdcRaw;
  const willUseMon = !reviewMode && !willUseUsdc && !!address;
  const amountMonDisplay = display
    ? formatUnits(amountUsdcRaw * USDC_TO_MON_BASE_SCALE, 18)
    : "0";

  const visible = reviewMode
    ? !!display
    : !!display &&
      (workflowState === "awaiting_approval" ||
        workflowState === "paying" ||
        workflowState === "running");

  const enabled =
    !reviewMode && workflowState === "awaiting_approval" && status === "idle";

  return (
    <AnimatePresence>
      {visible && display && (
        <motion.div
          key="approval"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[18px] border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_48px_-24px_rgba(17,17,17,0.16)]"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
                {t.payment.eyebrow}
              </div>
              <div className="text-[14px] font-medium tracking-tight">
                {t.payment.title}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Row
              label={t.payment.service}
              value={display.providerName}
              hint={display.reason}
            />
            <Row
              label={t.payment.price}
              value={
                <span className="tnum">
                  {display.amountUsdc.toFixed(2)}
                  <span className="ml-1 text-[11px] text-[#666666]">USDC</span>
                </span>
              }
            />
            {willUseMon && (
              <Row
                label={t.payment.method}
                value={
                  <span className="tnum">
                    ≈ {amountMonDisplay}
                    <span className="ml-1 text-[11px] text-[#666666]">MON</span>
                  </span>
                }
                hint={t.payment.monFallbackHint}
              />
            )}
            <Row
              label={t.payment.network}
              value={
                <Badge variant="outline" className="px-2 py-0.5 text-[11px]">
                  {t.common.monadTestnet}
                </Badge>
              }
            />
            <Row label={t.payment.gasFee} value={<span className="tnum">~0.0001 MON</span>} />
            <Row label={t.payment.settlesIn} value={<span className="tnum">&lt; 1s</span>} />
          </div>

          <Separator className="my-5" />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              size="md"
              disabled={!enabled}
              onClick={reject}
            >
              <X className="h-4 w-4" />
              {t.payment.rejectBtn}
            </Button>
            <Button
              className="flex-[2]"
              size="md"
              disabled={!enabled}
              onClick={() => approve()}
            >
              {status !== "idle" && status !== "error"
                ? t.payment.confirming
                : t.payment.approveBtn}
            </Button>
          </div>

          <div className="mt-3 text-center text-[11px] leading-[1.5] text-[#999999]">
            {t.payment.disclaimer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="text-[12px] tracking-tight text-[#666666]">{label}</div>
      <div className="max-w-[55%] text-right">
        <div className="text-[13px] font-medium tracking-tight">{value}</div>
        {hint && (
          <div className="mt-0.5 text-[11px] leading-tight text-[#999999]">{hint}</div>
        )}
      </div>
    </div>
  );
}
