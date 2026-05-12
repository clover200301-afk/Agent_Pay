"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/useAppStore";
import { MOCK_PROVIDERS } from "@/lib/mock/providers";
import { usePayment } from "@/hooks/usePayment";
import { useT } from "@/lib/i18n/context";
import type { Task } from "@/types/task";

export function PaymentApprovalCard({ task }: { task?: Task } = {}) {
  const t = useT();
  const workflowState = useAppStore((s) => s.workflowState);
  const selectedProviderId = useAppStore((s) => s.selectedProviderId);
  const { approve, reject, status } = usePayment();

  // Two modes: live workflow OR history review of a completed task.
  const reviewMode = !!task;
  const provider = reviewMode
    ? task!.selectedProvider
    : MOCK_PROVIDERS.find((p) => p.id === selectedProviderId);

  const visible = reviewMode
    ? !!provider
    : workflowState === "awaiting_approval" ||
      workflowState === "paying" ||
      (workflowState === "running" && !!provider);

  const enabled =
    !reviewMode && workflowState === "awaiting_approval" && status === "idle";

  const taglineFor = (id: string | undefined) => {
    if (id === "vision-api") return t.providers.visionTagline;
    if (id === "image-forge") return t.providers.forgeTagline;
    if (id === "pixel-mind") return t.providers.pixelTagline;
    return "";
  };

  return (
    <AnimatePresence>
      {visible && provider && (
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
            <Row label={t.payment.service} value={provider.name} hint={taglineFor(provider.id)} />
            <Row
              label={t.payment.price}
              value={
                <span className="tnum">
                  {provider.priceUsdc.toFixed(2)}
                  <span className="ml-1 text-[11px] text-[#666666]">USDC</span>
                </span>
              }
            />
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
              onClick={() => approve(`task_${Date.now()}`)}
            >
              {status === "pending" || status === "confirming"
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
