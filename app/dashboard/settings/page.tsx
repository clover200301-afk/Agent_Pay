"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ModelKeyCard } from "@/components/settings/ModelKeyCard";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { BASE_MODELS } from "@/lib/models/baseModels";
import { useT } from "@/lib/i18n/context";

export default function SettingsPage() {
  const t = useT();

  return (
    <main className="grid h-screen w-full grid-cols-[260px_minmax(0,1fr)] bg-white">
      <Sidebar />

      <section className="scrollbar-thin flex h-screen flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e5e5e5]/70 bg-white/80 px-8 backdrop-blur-md">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t.settings.backToDashboard}
            </Button>
          </Link>
          <div className="ml-auto">
            <LanguageToggle size={32} />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[860px] px-8 py-10">
          <div className="text-[12px] font-medium tracking-[0.18em] uppercase text-[#666666]">
            {t.settings.title}
          </div>
          <h1 className="mt-1 text-[28px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.settings.title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-[13px] text-[#666666]">
            {t.settings.subtitle}
          </p>

          {/* Section: base models */}
          <section className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[16px] font-medium tracking-tight">
                {t.settings.sectionModels}
              </h2>
            </div>
            <p className="mt-1 max-w-[68ch] text-[12.5px] leading-[1.55] text-[#666666]">
              {t.settings.sectionModelsHint}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3">
              {BASE_MODELS.map((model) => (
                <ModelKeyCard key={model.id} model={model} />
              ))}
            </div>
          </section>

          {/* Coming-soon sections */}
          <SoonSection title={t.settings.sectionAccount} soon={t.settings.comingSoon} />
          <SoonSection title={t.settings.sectionNotifications} soon={t.settings.comingSoon} />
          <SoonSection title={t.settings.sectionExport} soon={t.settings.comingSoon} />

          <div className="h-20" />
        </div>
      </section>
    </main>
  );
}

function SoonSection({ title, soon }: { title: string; soon: string }) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-medium tracking-tight">{title}</h2>
        <span className="rounded-full bg-[#fafaf9] px-2.5 py-0.5 text-[10.5px] tracking-tight text-[#999999]">
          {soon}
        </span>
      </div>
      <div className="mt-3 rounded-[14px] border border-dashed border-[#e5e5e5] bg-white p-6 text-[12.5px] text-[#999999]">
        {soon}
      </div>
    </section>
  );
}
