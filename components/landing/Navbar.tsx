"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { useT } from "@/lib/i18n/context";

export function Navbar() {
  const router = useRouter();
  const t = useT();
  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e5e5]/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-8 px-6">
        <Link href="/">
          <Logo size={24} />
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="#how" className="text-[13px] text-[#666666] transition-colors hover:text-[#111111]">
            {t.nav.howItWorks}
          </Link>
          <Link href="#monad" className="text-[13px] text-[#666666] transition-colors hover:text-[#111111]">
            {t.nav.whyMonad}
          </Link>
          <Link href="#demo" className="text-[13px] text-[#666666] transition-colors hover:text-[#111111]">
            {t.nav.demo}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <div className="hidden md:block">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={connected ? openAccountModal : openConnectModal}
                  >
                    {connected ? account.displayName : t.common.connectWallet}
                  </Button>
                );
              }}
            </ConnectButton.Custom>
          </div>
          <Button size="sm" onClick={() => router.push("/login")}>
            {t.common.launchApp}
          </Button>
        </div>
      </div>
    </header>
  );
}
