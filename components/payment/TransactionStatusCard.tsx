"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, Copy, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/useAppStore";
import { usePayment } from "@/hooks/usePayment";
import { EXPLORER_URL } from "@/lib/chain";
import { formatAddress } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export function TransactionStatusCard({ task }: { task?: Task } = {}) {
  const t = useT();
  const liveWorkflowState = useAppStore((s) => s.workflowState);
  const liveTxHash = useAppStore((s) => s.txHash);
  const liveApiKey = useAppStore((s) => s.apiKey);
  const { status, hash } = usePayment();

  const reviewMode = !!task;
  const workflowState = reviewMode
    ? task!.status === "completed"
      ? "success"
      : task!.status === "paying"
      ? "paying"
      : "idle"
    : liveWorkflowState;
  const txHash = reviewMode ? task!.txHash : liveTxHash;
  const apiKey = reviewMode ? task!.apiKey : liveApiKey;

  const showHash = txHash ?? (reviewMode ? undefined : hash);
  const visible = workflowState === "paying" || workflowState === "success";
  if (!visible) return null;

  const phase: "pending" | "confirming" | "success" =
    workflowState === "success"
      ? "success"
      : reviewMode
      ? "pending"
      : status === "confirming"
      ? "confirming"
      : "pending";

  const copyKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    toast.success(t.tx.apiKeyCopied);
  };
  const copyHash = async () => {
    if (!showHash) return;
    await navigator.clipboard.writeText(showHash);
    toast.success(t.tx.txHashCopied);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tx-status"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[18px] border border-[#e5e5e5] bg-white p-5"
      >
        <div className="flex items-center gap-2">
          <PhaseIcon phase={phase} />
          <div>
            <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
              {t.tx.eyebrow}
            </div>
            <div className="text-[14px] font-medium tracking-tight">
              {phase === "success"
                ? t.tx.statusSuccess
                : phase === "confirming"
                ? t.tx.statusConfirming
                : t.tx.statusPending}
            </div>
          </div>
          <div className="ml-auto">
            <Badge
              variant={phase === "success" ? "success" : "outline"}
              className="px-2 py-0.5"
            >
              {phase === "success" ? t.tx.badgeSuccess : t.tx.badgePending}
            </Badge>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#666666]">{t.tx.network}</span>
            <span className="text-[12.5px] font-medium tracking-tight">
              {t.common.monadTestnet}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#666666]">{t.tx.txHash}</span>
            {showHash ? (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11.5px] tracking-tight">
                  {formatAddress(showHash, 6)}
                </span>
                <Button variant="ghost" size="icon" onClick={copyHash}>
                  <Copy className="h-3 w-3" />
                </Button>
                <a href={`${EXPLORER_URL}/tx/${showHash}`} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            ) : (
              <div className="h-3 w-32 rounded-full shimmer" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {phase === "success" && apiKey && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Separator className="my-5" />
              <div className="rounded-[12px] border border-[#bbf7d0] bg-[#ecfdf5] p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0ea56b] text-white">
                    <Key className="h-3 w-3" />
                  </div>
                  <div className="text-[12px] font-medium tracking-tight text-[#0a7a4f]">
                    {t.tx.apiKeyTitle}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2 rounded-[10px] border border-[#bbf7d0] bg-white px-2.5 py-2">
                  <code className="flex-1 truncate font-mono text-[11px] tracking-tight text-[#111111]">
                    {apiKey}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyKey}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-2 text-[11px] leading-tight text-[#0a7a4f]/80">
                  {t.tx.apiKeyHint}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

function PhaseIcon({ phase }: { phase: "pending" | "confirming" | "success" }) {
  if (phase === "success")
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0ea56b] text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </div>
    );
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#111111] bg-white">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#111111]" />
    </div>
  );
}
