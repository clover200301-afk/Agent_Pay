"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Star } from "lucide-react";
import { MOCK_PROVIDERS } from "@/lib/mock/providers";
import { useAppStore } from "@/stores/useAppStore";
import { useT } from "@/lib/i18n/context";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProviderComparison() {
  const t = useT();
  const workflowState = useAppStore((s) => s.workflowState);
  const activeIndex = useAppStore((s) => s.activeStepIndex);
  const selectedProviderId = useAppStore((s) => s.selectedProviderId);

  if (workflowState === "idle") return null;

  const revealed = activeIndex >= 2;
  const showSkeleton = !revealed;

  // i18n for taglines + badge
  const taglineFor = (id: string) => {
    if (id === "vision-api") return t.providers.visionTagline;
    if (id === "image-forge") return t.providers.forgeTagline;
    if (id === "pixel-mind") return t.providers.pixelTagline;
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#666666]">
          {t.providers.eyebrow}
        </div>
        <div className="text-[11px] tracking-tight text-[#999999]">
          {t.providers.sortedByPrice}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-[14px] border border-[#e5e5e5] bg-white p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="mt-5 h-7 w-20" />
                <div className="mt-4 flex gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            {MOCK_PROVIDERS.map((p) => {
              const selected = p.id === selectedProviderId;
              return (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "relative rounded-[14px] border bg-white p-4 transition-all",
                    selected
                      ? "border-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_36px_-18px_rgba(17,17,17,0.18)]"
                      : "border-[#e5e5e5]"
                  )}
                >
                  {selected && (
                    <motion.div
                      layoutId="selected-tag"
                      className="absolute -top-2.5 left-3 flex items-center gap-1 rounded-full bg-[#111111] px-2 py-0.5 text-[10px] font-medium tracking-tight text-white"
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      {t.providers.selected}
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-[14.5px] font-medium tracking-tight">{p.name}</div>
                    {p.badge && !selected && (
                      <span className="text-[10px] tracking-tight text-[#666666]">
                        {t.providers.badgeTopRated}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11.5px] leading-tight text-[#666666]">
                    {taglineFor(p.id)}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="tnum text-[22px] font-medium leading-none tracking-[-0.02em]">
                      {p.priceUsdc.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-[#666666]">USDC</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-[#666666] tnum">
                    <div>
                      {t.providers.uptime}{" "}
                      <span className="text-[#111111]">{p.uptime}%</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-[#111111] text-[#111111]" />
                      <span className="text-[#111111]">{p.rating}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
