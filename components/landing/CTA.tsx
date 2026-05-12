"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/context";

export function CTA() {
  const t = useT();
  return (
    <section className="border-t border-[#e5e5e5] bg-[#fafaf9]">
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-[24px] border border-[#e5e5e5] bg-white p-10 md:p-14"
        >
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[560px]">
              <h3 className="text-[32px] font-medium leading-[1.1] tracking-[-0.03em]">
                {t.cta.titleLine1}
                <br />
                {t.cta.titleLine2}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.55] text-[#666666]">{t.cta.body}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button size="lg" className="px-6">
                  {t.common.startAgent}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how">
                <Button size="lg" variant="ghost">
                  {t.cta.readMore}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-[#e5e5e5]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-3 px-6 py-8 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Logo size={20} wordmarkClassName="text-[13px]" />
          <span className="ml-2 text-[12px] text-[#666666]">{t.cta.footerTagline}</span>
        </div>
        <div className="text-[12px] text-[#666666]">© {new Date().getFullYear()} AgentPay</div>
      </div>
    </footer>
  );
}
