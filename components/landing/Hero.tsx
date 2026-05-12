"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentPreview } from "./AgentPreview";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n/context";

export function Hero() {
  const t = useT();
  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(17,17,17,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 pb-24 pt-20 lg:grid-cols-2 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <Badge variant="outline" className="mb-5 w-fit gap-1.5 px-3 py-1 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0ea56b] pulse-dot" />
            {t.hero.badge}
          </Badge>

          <h1 className="text-[48px] font-medium leading-[1.05] tracking-[-0.04em] text-[#111111] md:text-[64px]">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>

          <p className="mt-6 max-w-[460px] text-[16px] leading-[1.55] text-[#666666]">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link href="/login">
              <Button size="lg" className="px-6">
                {t.common.startAgent}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="ghost">
                <PlayCircle className="h-4 w-4" />
                {t.common.viewDemo}
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-[12px] text-[#666666]">
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#666666]" />
              <span>{t.hero.bullet1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#666666]" />
              <span>{t.hero.bullet2}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#666666]" />
              <span>{t.hero.bullet3}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          <AgentPreview className="w-full max-w-[460px]" />
        </motion.div>
      </div>
    </section>
  );
}
