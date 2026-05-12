"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useAppStore } from "@/stores/useAppStore";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { useHasAnyModelKey } from "@/components/dashboard/ConfigGate";

export function ChatInput() {
  const t = useT();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { start: mockStart } = useWorkflow();
  const agentChat = useAgentChat();
  const workflowState = useAppStore((s) => s.workflowState);
  const isRunning = workflowState !== "idle" && workflowState !== "rejected";
  const hasModelKey = useHasAnyModelKey();
  const disabled = isRunning || !hasModelKey;

  // Use real agent when available, fall back to mock workflow
  const useRealAgent = agentChat.isAvailable;

  const EXAMPLE_PROMPTS = [
    t.chat.examples.cheapestImage,
    t.chat.examples.gptCredits,
    t.chat.examples.translation,
    t.chat.examples.renewSub,
  ];

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  useEffect(() => {
    if (workflowState === "idle") setValue("");
  }, [workflowState]);

  const submit = async (text: string) => {
    const tt = text.trim();
    if (!tt || disabled) return;
    setValue(tt);
    if (useRealAgent) {
      const ok = await agentChat.start(tt);
      if (!ok) void mockStart(tt); // fallback
    } else {
      void mockStart(tt);
    }
  };

  const placeholder = !hasModelKey
    ? t.gate.chatPlaceholderDisabled
    : t.chat.placeholder;

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative rounded-[18px] border bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_18px_36px_-18px_rgba(17,17,17,0.10)] transition-shadow",
          disabled
            ? "border-[#e5e5e5] opacity-90"
            : "border-[#e5e5e5] hover:shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_48px_-18px_rgba(17,17,17,0.14)]"
        )}
      >
        <div className="flex items-start gap-3 p-4">
          <div
            className={cn(
              "mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
              hasModelKey ? "bg-[#111111]" : "bg-[#999999]"
            )}
          >
            {hasModelKey ? (
              <Sparkles className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
          </div>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="min-h-[48px] flex-1 resize-none border-0 bg-transparent text-[16px] leading-[1.5] outline-none placeholder:text-[#999999] disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(value);
              }
            }}
          />
          <Button
            disabled={!value.trim() || disabled}
            onClick={() => submit(value)}
            size="icon"
            className="shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {!disabled && !value && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 text-[12px] text-[#666666] transition-all hover:border-[#111111] hover:text-[#111111]"
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
