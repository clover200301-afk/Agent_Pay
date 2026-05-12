"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";

export function AgentPreview({ className }: { className?: string }) {
  const t = useT();
  const PREVIEW_STEPS = [
    t.preview.steps.understanding,
    t.preview.steps.searching,
    t.preview.steps.comparing,
    t.preview.steps.selecting,
    t.preview.steps.awaiting,
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const total = PREVIEW_STEPS.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i >= total ? 0 : i + 1));
    }, 1100);
    return () => clearInterval(interval);
  }, [total]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white p-6 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_30px_60px_-30px_rgba(17,17,17,0.18)]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-white">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="text-[13px] font-medium tracking-tight">Agent</div>
        <div className="ml-auto text-[11px] tracking-tight text-[#666666]">
          {t.common.live}
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#0ea56b] pulse-dot" />
        </div>
      </div>

      <div className="mt-5 text-[13px] text-[#666666] leading-snug">
        <span className="text-[#111111] font-medium">{t.preview.task}</span> —{" "}
        {t.preview.taskExample}
      </div>

      <div className="mt-5 space-y-2.5">
        {PREVIEW_STEPS.map((label, i) => {
          const status =
            i < activeIndex ? "success" : i === activeIndex ? "processing" : "pending";
          return (
            <motion.div
              key={label}
              initial={false}
              animate={{ opacity: status === "pending" ? 0.5 : 1 }}
              className="flex items-center gap-3 rounded-[10px] px-1.5 py-1"
            >
              <StatusDot status={status} />
              <div
                className={cn(
                  "text-[13px] tracking-tight transition-colors",
                  status === "success" && "text-[#111111]",
                  status === "processing" && "text-[#111111] font-medium",
                  status === "pending" && "text-[#666666]"
                )}
              >
                {label}
              </div>
              <AnimatePresence>
                {status === "processing" && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 36, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-1 h-[2px] rounded-full shimmer"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { name: "VisionAPI", price: "3.2" },
          { name: "ImageForge", price: "4.1" },
          { name: "PixelMind", price: "4.9" },
        ].map((p, i) => (
          <motion.div
            key={p.name}
            animate={{
              borderColor: i === 0 && activeIndex >= 3 ? "#111111" : "#e5e5e5",
              opacity: activeIndex >= 2 ? 1 : 0.45,
            }}
            transition={{ duration: 0.4 }}
            className="rounded-[10px] border bg-white p-2.5"
          >
            <div className="text-[11px] font-medium tracking-tight">{p.name}</div>
            <div className="mt-1 text-[10px] text-[#666666] tnum">{p.price} USDC</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex >= total - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-[12px] border border-[#e5e5e5] bg-[#fafaf9] p-3 flex items-center gap-2"
          >
            <div className="text-[12px] font-medium tracking-tight">
              {t.preview.approveQuestion}
            </div>
            <div className="ml-auto rounded-[8px] bg-[#111111] px-2.5 py-1 text-[11px] font-medium text-white">
              {t.common.approve}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusDot({ status }: { status: "pending" | "processing" | "success" }) {
  if (status === "success")
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0ea56b] text-white">
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </div>
    );
  if (status === "processing")
    return (
      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#111111] bg-white">
        <Loader2 className="h-2.5 w-2.5 animate-spin text-[#111111]" />
      </div>
    );
  return <div className="h-4 w-4 rounded-full border border-[#e5e5e5] bg-white" />;
}
