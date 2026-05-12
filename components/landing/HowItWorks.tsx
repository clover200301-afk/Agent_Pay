"use client";

import { motion } from "framer-motion";
import { MessageSquareText, Search, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n/context";

export function HowItWorks() {
  const t = useT();
  const STEPS = [
    { icon: MessageSquareText, title: t.howItWorks.s1Title, body: t.howItWorks.s1Body },
    { icon: Search, title: t.howItWorks.s2Title, body: t.howItWorks.s2Body },
    { icon: ShieldCheck, title: t.howItWorks.s3Title, body: t.howItWorks.s3Body },
  ];

  return (
    <section id="how" className="border-t border-[#e5e5e5] bg-[#fafaf9]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-12 max-w-[640px]">
          <div className="text-[12px] font-medium tracking-[0.18em] text-[#666666] uppercase">
            {t.howItWorks.eyebrow}
          </div>
          <h2 className="mt-3 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.howItWorks.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-[18px] border border-[#e5e5e5] bg-white p-6 transition-shadow hover:shadow-[0_1px_2px_rgba(17,17,17,0.04),0_18px_36px_-18px_rgba(17,17,17,0.10)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111111] text-white">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="text-[12px] font-medium tracking-tight text-[#666666] tnum">
                  {t.howItWorks.step} {i + 1}
                </div>
              </div>
              <div className="mt-4 text-[18px] font-medium tracking-tight">{s.title}</div>
              <div className="mt-2 text-[14px] leading-[1.55] text-[#666666]">{s.body}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
