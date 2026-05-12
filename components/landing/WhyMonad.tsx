"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";

export function WhyMonad() {
  const t = useT();
  const STATS = [
    { label: t.whyMonad.tps, value: "10,000+", note: t.whyMonad.tpsNote },
    { label: t.whyMonad.finality, value: "<1s", note: t.whyMonad.finalityNote },
    { label: t.whyMonad.gas, value: "Sub-cent", note: t.whyMonad.gasNote },
    { label: t.whyMonad.compat, value: "EVM", note: t.whyMonad.compatNote },
  ];

  return (
    <section id="monad" className="border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-12 max-w-[640px]">
          <div className="text-[12px] font-medium tracking-[0.18em] text-[#666666] uppercase">
            {t.whyMonad.eyebrow}
          </div>
          <h2 className="mt-3 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.whyMonad.title}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-[#666666]">
            {t.whyMonad.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-[16px] border border-[#e5e5e5] bg-white p-5"
            >
              <div className="text-[11px] font-medium tracking-[0.16em] text-[#666666] uppercase">
                {s.label}
              </div>
              <div className="mt-2 text-[28px] font-medium leading-none tracking-[-0.02em] tnum">
                {s.value}
              </div>
              <div className="mt-3 text-[13px] leading-[1.5] text-[#666666]">{s.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
