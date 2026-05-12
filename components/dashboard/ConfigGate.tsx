"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useModelKeysStore } from "@/stores/useModelKeysStore";
import { useT } from "@/lib/i18n/context";

/**
 * Returns true when the active user has at least one base-model API key
 * configured. Lives alongside ConfigGate so callers can subscribe to the
 * boolean (e.g. ChatInput disables itself when false).
 */
export function useHasAnyModelKey(): boolean {
  return useModelKeysStore((s) =>
    Object.values(s.keys).some((v) => !!v && v.length > 0)
  );
}

/**
 * Top-of-workspace banner shown until the user configures at least one
 * model API key. Strong gating per the product decision: ChatInput is also
 * disabled in this state (see components/dashboard/ChatInput.tsx).
 */
export function ConfigGate() {
  const t = useT();
  const hasKey = useHasAnyModelKey();
  if (hasKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-8 mt-5 flex items-start gap-3 rounded-[14px] border border-[#f5a623]/40 bg-[#fff8eb] px-4 py-3"
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-white">
        <AlertCircle className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#8a5a00]">
          {t.gate.bannerEyebrow}
        </div>
        <div className="mt-0.5 text-[13.5px] font-medium tracking-tight text-[#111111]">
          {t.gate.bannerTitle}
        </div>
        <div className="mt-1 max-w-[68ch] text-[12.5px] leading-[1.55] text-[#666666]">
          {t.gate.bannerBody}
        </div>
      </div>
      <Link
        href="/dashboard/settings"
        className="shrink-0 self-center rounded-full border border-[#111111] bg-[#111111] px-4 py-2 text-[12px] font-medium tracking-tight text-white transition-opacity hover:opacity-90"
      >
        <span className="flex items-center gap-1.5">
          {t.gate.cta}
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </motion.div>
  );
}
