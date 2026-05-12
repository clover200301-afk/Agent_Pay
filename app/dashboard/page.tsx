"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Bell, Settings as SettingsIcon, KeyRound } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatInput } from "@/components/dashboard/ChatInput";
import { ConfigGate } from "@/components/dashboard/ConfigGate";
import { TaskReviewView } from "@/components/dashboard/TaskReviewView";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { ProviderComparison } from "@/components/providers/ProviderComparison";
import { PaymentApprovalCard } from "@/components/payment/PaymentApprovalCard";
import { TransactionStatusCard } from "@/components/payment/TransactionStatusCard";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useAppStore } from "@/stores/useAppStore";
import { usePayment } from "@/hooks/usePayment";
import { useT } from "@/lib/i18n/context";

export default function DashboardPage() {
  const t = useT();
  const workflowState = useAppStore((s) => s.workflowState);
  const viewingTaskId = useAppStore((s) => s.viewingTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const resetWorkflow = useAppStore((s) => s.resetWorkflow);
  const { reset: resetPayment } = usePayment();

  const reviewingTask = viewingTaskId
    ? tasks.find((t) => t.id === viewingTaskId)
    : undefined;
  const isReviewing = !!reviewingTask;
  const isIdle = !isReviewing && workflowState === "idle";
  const isDone = workflowState === "success" || workflowState === "rejected";

  const startNew = () => {
    resetPayment();
    resetWorkflow();
  };

  return (
    <main className="grid h-screen w-full grid-cols-[260px_minmax(0,1fr)_400px] bg-white">
      <Sidebar />

      {/* Center column */}
      <section className="scrollbar-thin flex h-screen flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e5e5e5]/70 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-baseline gap-2">
            <div className="text-[15px] font-medium tracking-tight">
              {t.dashboard.runtime}
            </div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-[#999999]">
              {t.dashboard.workspace}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {isDone && !isReviewing && (
              <Button variant="secondary" size="sm" onClick={startNew}>
                <RotateCcw className="h-3.5 w-3.5" />
                {t.dashboard.newTask}
              </Button>
            )}
            <Link href="/dashboard/keys">
              <Button variant="ghost" size="icon" title={t.dashboard.apiList}>
                <KeyRound className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="ghost" size="icon" title={t.dashboard.messages}>
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon" title={t.dashboard.settings}>
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </Link>
            <div className="ml-1">
              <LanguageToggle size={32} />
            </div>
          </div>
        </header>

        {!isReviewing && <ConfigGate />}

        <div className="flex flex-1 flex-col gap-5 px-8 py-7">
          <AnimatePresence mode="wait">
            {isReviewing ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-1 flex-col"
              >
                <TaskReviewView />
              </motion.div>
            ) : isIdle ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-1 flex-col items-center justify-center pb-20"
              >
                <div className="max-w-[640px] text-center">
                  <div className="mb-2 text-[12px] font-medium tracking-[0.18em] uppercase text-[#666666]">
                    {t.dashboard.startEyebrow}
                  </div>
                  <h1 className="text-[34px] font-medium leading-[1.1] tracking-[-0.03em]">
                    {t.dashboard.startTitleLine1}
                    <br />
                    {t.dashboard.startTitleLine2}
                  </h1>
                  <p className="mt-4 text-[14px] leading-[1.55] text-[#666666]">
                    {t.dashboard.startSubtitle}
                  </p>
                </div>
                <div className="mt-10 w-full max-w-[720px]">
                  <ChatInput />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <ChatInput />
                <WorkflowTimeline />
                <ProviderComparison />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Right rail */}
      <aside className="scrollbar-thin h-screen overflow-y-auto border-l border-[#e5e5e5] bg-[#fafaf9]">
        <div className="sticky top-0 z-10 flex h-14 items-center border-b border-[#e5e5e5]/70 bg-[#fafaf9]/85 px-6 backdrop-blur-md">
          <div className="flex items-baseline gap-2">
            <div className="text-[15px] font-medium tracking-tight">
              {t.dashboard.paymentSubtitle}
            </div>
            <div className="text-[11px] tracking-[0.16em] uppercase text-[#999999]">
              {t.dashboard.payment}
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6">
          {isReviewing ? (
            <>
              <PaymentApprovalCard task={reviewingTask} />
              <TransactionStatusCard task={reviewingTask} />
            </>
          ) : workflowState === "idle" ? (
            <div className="rounded-[16px] border border-dashed border-[#e5e5e5] bg-white p-6 text-center">
              <div className="text-[12px] tracking-tight text-[#666666]">
                {t.dashboard.noApproval}
              </div>
              <div className="mt-1.5 text-[11px] leading-[1.55] text-[#999999]">
                {t.dashboard.noApprovalBody}
              </div>
            </div>
          ) : (
            <>
              <PaymentApprovalCard />
              <TransactionStatusCard />
            </>
          )}
        </div>
      </aside>
    </main>
  );
}
