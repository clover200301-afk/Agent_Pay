"use client";

import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/context";

export function DemoPreview() {
  const t = useT();
  return (
    <section id="demo" className="border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 max-w-[640px]">
          <div className="text-[12px] font-medium tracking-[0.18em] text-[#666666] uppercase">
            {t.demoPreview.eyebrow}
          </div>
          <h2 className="mt-3 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.demoPreview.title}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_30px_60px_-30px_rgba(17,17,17,0.18)]"
        >
          <div className="flex items-center gap-1.5 border-b border-[#e5e5e5] bg-[#fafaf9] px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#e5e5e5]" />
            <div className="ml-3 text-[11px] tracking-tight text-[#666666]">
              agentpay.app/dashboard
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 p-4">
            <div className="col-span-3 space-y-2">
              {[t.demoPreview.history1, t.demoPreview.history2, t.demoPreview.history3].map((tt) => (
                <div
                  key={tt}
                  className="rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2.5 text-[12px] text-[#666666]"
                >
                  {tt}
                </div>
              ))}
            </div>

            <div className="col-span-6 space-y-3">
              <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                <div className="text-[12px] text-[#666666]">{t.demoPreview.taskLabel}</div>
                <div className="mt-1 text-[14px]">{t.demoPreview.taskValue}</div>
              </div>
              <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                <div className="space-y-2.5">
                  {[
                    { label: t.preview.steps.understanding, state: "ok" },
                    { label: t.preview.steps.searching, state: "ok" },
                    { label: t.preview.steps.comparing, state: "ok" },
                    { label: t.preview.steps.selecting, state: "ok" },
                    { label: t.preview.steps.awaiting, state: "now" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 text-[12px]">
                      <span
                        className={
                          s.state === "ok"
                            ? "h-1.5 w-1.5 rounded-full bg-[#0ea56b]"
                            : "h-1.5 w-1.5 rounded-full bg-[#111111] pulse-dot"
                        }
                      />
                      <span className={s.state === "ok" ? "text-[#111111]" : "font-medium"}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-3 space-y-3">
              <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-4">
                <div className="text-[11px] tracking-tight text-[#666666]">
                  {t.demoPreview.approval}
                </div>
                <div className="mt-2 text-[14px] font-medium">{t.demoPreview.serviceName}</div>
                <div className="mt-3 flex items-center justify-between text-[12px] text-[#666666]">
                  <span>{t.demoPreview.price}</span>
                  <span className="text-[#111111] tnum">3.2 USDC</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[12px] text-[#666666]">
                  <span>{t.common.network}</span>
                  <span className="text-[#111111]">Monad</span>
                </div>
                <div className="mt-3 rounded-[8px] bg-[#111111] py-2 text-center text-[12px] font-medium text-white">
                  {t.demoPreview.approvePayment}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
