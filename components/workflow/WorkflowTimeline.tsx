"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/mock/workflow";
import { useAppStore } from "@/stores/useAppStore";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { Dict } from "@/lib/i18n/en";

export function WorkflowTimeline({
  promptOverride,
  forceCompleted,
}: {
  /** Render this prompt instead of the live store value (used by history review). */
  promptOverride?: string;
  /** Mark every step as success — for read-only history playback. */
  forceCompleted?: boolean;
} = {}) {
  const t = useT();
  const activeIndex = useAppStore((s) => s.activeStepIndex);
  const liveState = useAppStore((s) => s.workflowState);
  const livePrompt = useAppStore((s) => s.currentPrompt);
  const workflowState = forceCompleted ? "success" : liveState;
  const prompt = promptOverride ?? livePrompt;

  if (workflowState === "idle") return null;

  const stateLabel = (s: string) => {
    const map: Record<string, string> = {
      running: t.workflow.state.running,
      awaiting_approval: t.workflow.state.awaiting,
      paying: t.workflow.state.paying,
      success: t.workflow.state.success,
      rejected: t.workflow.state.rejected,
      idle: t.workflow.state.idle,
    };
    return map[s] ?? t.workflow.state.idle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[18px] border border-[#e5e5e5] bg-white p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
            {t.workflow.eyebrow}
          </div>
          <div className="mt-1 text-[14px] tracking-tight text-[#111111] line-clamp-1">
            {prompt}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] tracking-tight text-[#666666]">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              workflowState === "running" && "bg-[#111111] pulse-dot",
              workflowState === "awaiting_approval" && "bg-[#f5a623] pulse-dot",
              workflowState === "paying" && "bg-[#111111] pulse-dot",
              workflowState === "success" && "bg-[#0ea56b]",
              workflowState === "rejected" && "bg-[#999999]"
            )}
          />
          {stateLabel(workflowState)}
        </div>
      </div>

      <ol className="space-y-2">
        {WORKFLOW_STEPS.map((step, i) => {
          const status: "pending" | "processing" | "success" = forceCompleted
            ? "success"
            : i < activeIndex
            ? "success"
            : i === activeIndex
            ? workflowState === "success"
              ? "success"
              : "processing"
            : workflowState === "success"
            ? "success"
            : "pending";

          const tt = t.workflow.steps[step.id as keyof Dict["workflow"]["steps"]];

          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{
                opacity: status === "pending" ? 0.55 : 1,
                x: 0,
              }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3 rounded-[10px] px-2 py-1.5"
            >
              <StepDot status={status} />
              <div className="flex-1">
                <div
                  className={cn(
                    "text-[13.5px] tracking-tight transition-colors",
                    status === "processing" && "font-medium"
                  )}
                >
                  {tt.title}
                </div>
                {tt.detail && (
                  <div className="mt-0.5 text-[11.5px] leading-tight text-[#999999]">
                    {tt.detail}
                  </div>
                )}
              </div>
              <AnimatePresence>
                {status === "processing" && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 56, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-[2px] rounded-full shimmer"
                  />
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}

function StepDot({ status }: { status: "pending" | "processing" | "success" }) {
  if (status === "success")
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0ea56b] text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </div>
    );
  if (status === "processing")
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#111111] bg-white">
        <Loader2 className="h-3 w-3 animate-spin text-[#111111]" />
      </div>
    );
  return <div className="h-5 w-5 rounded-full border border-[#e5e5e5] bg-white" />;
}
