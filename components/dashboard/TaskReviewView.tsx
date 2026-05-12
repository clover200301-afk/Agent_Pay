"use client";

import { motion } from "framer-motion";
import { Check, KeyRound, MessageSquare, Copy, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { useAppStore } from "@/stores/useAppStore";
import { useT } from "@/lib/i18n/context";
import { EXPLORER_URL } from "@/lib/chain";
import { formatAddress } from "@/lib/utils";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  completed: "bg-[#0ea56b]",
  running: "bg-[#111111] pulse-dot",
  awaiting_approval: "bg-[#f5a623] pulse-dot",
  paying: "bg-[#111111] pulse-dot",
  rejected: "bg-[#999999]",
};

export function TaskReviewView() {
  const t = useT();
  const viewingTaskId = useAppStore((s) => s.viewingTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const setViewingTaskId = useAppStore((s) => s.setViewingTaskId);
  const task = viewingTaskId ? tasks.find((t) => t.id === viewingTaskId) : undefined;

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="text-[14px] font-medium tracking-tight">
          {t.taskReview.notFoundTitle}
        </div>
        <p className="mt-1 text-[12px] text-[#666666]">{t.taskReview.notFoundBody}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setViewingTaskId(undefined)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.taskReview.backToWorkspace}
        </Button>
      </div>
    );
  }

  const statusText = (() => {
    const map: Record<string, string> = {
      completed: t.workflow.state.success,
      running: t.workflow.state.running,
      awaiting_approval: t.workflow.state.awaiting,
      paying: t.workflow.state.paying,
      rejected: t.workflow.state.rejected,
    };
    return map[task.status] ?? task.status;
  })();

  const copyKey = async () => {
    if (!task.apiKey) return;
    await navigator.clipboard.writeText(task.apiKey);
    toast.success(t.tx.apiKeyCopied);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewingTaskId(undefined)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.taskReview.backToWorkspace}
        </Button>
        <div className="flex items-center gap-1.5 text-[11px] tracking-tight text-[#666666]">
          <span className={`h-1.5 w-1.5 rounded-full ${statusColor[task.status] ?? "bg-[#999999]"}`} />
          {statusText}
        </div>
      </div>

      <div className="rounded-[18px] border border-[#e5e5e5] bg-white p-5">
        <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
          {t.taskReview.eyebrow}
        </div>
        <h2 className="mt-1.5 text-[22px] font-medium leading-[1.2] tracking-[-0.02em]">
          {task.prompt}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] tracking-tight text-[#999999]">
          <span>{formatTime(task.createdAt)}</span>
          {task.completedAt && (
            <span>
              {t.taskReview.completedAt} · {formatTime(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      <WorkflowTimeline promptOverride={task.prompt} forceCompleted />

      {task.selectedProvider && (
        <div className="rounded-[18px] border border-[#e5e5e5] bg-white p-5">
          <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
            {t.taskReview.selectedProvider}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-medium tracking-tight">
                {task.selectedProvider.name}
              </div>
              <div className="mt-0.5 text-[12px] text-[#666666]">
                {task.selectedProvider.tagline}
              </div>
            </div>
            <div className="text-right">
              <div className="tnum text-[15px] font-medium tracking-tight">
                {task.selectedProvider.priceUsdc.toFixed(2)}{" "}
                <span className="text-[11px] text-[#666666]">USDC</span>
              </div>
              {task.txHash && (
                <a
                  href={`${EXPLORER_URL}/tx/${task.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] tracking-tight text-[#666666] hover:text-[#111111]"
                >
                  {formatAddress(task.txHash, 6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {task.apiKey && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0ea56b] text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <div className="text-[12px] font-medium tracking-tight text-[#0a7a4f]">
                  {t.tx.apiKeyTitle}
                </div>
                <Badge variant="success" className="ml-1 px-2 py-0.5 text-[10px]">
                  <KeyRound className="h-2.5 w-2.5" />
                  BYOK
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#fafaf9] px-2.5 py-2">
                <code className="flex-1 truncate font-mono text-[11.5px] tracking-tight">
                  {task.apiKey}
                </code>
                <Button variant="ghost" size="icon" onClick={copyKey}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="rounded-[18px] border border-dashed border-[#e5e5e5] bg-white p-6">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
          <MessageSquare className="h-3 w-3" />
          {t.taskReview.chatTitle}
        </div>
        <p className="mt-2 max-w-[60ch] text-[12.5px] leading-[1.55] text-[#999999]">
          {t.taskReview.chatPlaceholder}
        </p>
        <div className="mt-4">
          <Link href="/dashboard/settings">
            <Button variant="secondary" size="sm">
              {t.gate.cta}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
