"use client";

import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useT } from "@/lib/i18n/context";

export default function MessagesPage() {
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

        <div className="mx-auto w-full max-w-[900px] px-8 py-10">
          <div className="text-[12px] font-medium tracking-[0.18em] uppercase text-[#666666]">
            {t.messages.title}
          </div>
          <h1 className="mt-1 text-[28px] font-medium leading-[1.1] tracking-[-0.03em]">
            {t.messages.title}
          </h1>
          <p className="mt-2 max-w-[60ch] text-[13px] text-[#666666]">
            {t.messages.subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center rounded-[18px] border border-dashed border-[#e5e5e5] bg-white px-8 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fafaf9]">
              <Bell className="h-5 w-5 text-[#666666]" />
            </div>
            <div className="mt-3 text-[15px] font-medium tracking-tight">
              {t.messages.emptyTitle}
            </div>
            <p className="mt-1.5 max-w-[48ch] text-[12.5px] leading-[1.55] text-[#666666]">
              {t.messages.emptyBody}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
