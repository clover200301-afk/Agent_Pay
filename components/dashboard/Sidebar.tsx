"use client";

import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSession, signOut } from "next-auth/react";
import { Copy, LogOut, Plus, Wallet, History, User } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { useAppStore } from "@/stores/useAppStore";
import { formatAddress, formatMon } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Sidebar() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const { data: balance } = useBalance({
    address,
    query: { enabled: !!address },
  });
  const tasks = useAppStore((s) => s.tasks);
  const viewingTaskId = useAppStore((s) => s.viewingTaskId);
  const setViewingTaskId = useAppStore((s) => s.setViewingTaskId);
  const resetWorkflow = useAppStore((s) => s.resetWorkflow);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast.success(t.tx.addressCopied);
  };

  const newTask = () => {
    resetWorkflow();
    setCurrentPrompt("");
  };

  const openTask = (id: string) => {
    setViewingTaskId(id);
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return t.sidebar.timeJustNow;
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}${t.sidebar.timeMinutesAgo}`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}${t.sidebar.timeHoursAgo}`;
    return `${Math.floor(diff / 86_400_000)}${t.sidebar.timeDaysAgo}`;
  };

  return (
    <aside className="flex h-full flex-col border-r border-[#e5e5e5] bg-[#fafaf9]">
      <div className="flex h-14 items-center gap-2 px-5">
        <Link href="/">
          <Logo size={22} wordmarkClassName="text-[14px]" />
        </Link>
      </div>

      <Separator />

      <div className="px-3 pt-4">
        <Button
          onClick={newTask}
          variant="primary"
          className="w-full justify-start gap-2"
          size="md"
        >
          <Plus className="h-4 w-4" />
          {t.sidebar.newTask}
        </Button>
      </div>

      <div className="mt-6 flex-1 overflow-hidden px-2">
        <div className="mb-2 flex items-center gap-1.5 px-3 text-[11px] font-medium tracking-[0.16em] text-[#666666] uppercase">
          <History className="h-3 w-3" />
          {t.sidebar.history}
        </div>
        <div className="scrollbar-thin h-[calc(100%-28px)] overflow-y-auto pr-1">
          {tasks.length === 0 && (
            <div className="px-3 py-6 text-[12px] leading-[1.55] text-[#999999]">
              {t.sidebar.historyEmpty}
            </div>
          )}
          <AnimatePresence initial={false}>
            {tasks.map((tk) => {
              const active = tk.id === viewingTaskId;
              return (
                <motion.button
                  key={tk.id}
                  type="button"
                  onClick={() => openTask(tk.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "group mb-1 w-full cursor-pointer rounded-[10px] px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_18px_-12px_rgba(17,17,17,0.18)] ring-1 ring-[#111111]/10"
                      : "hover:bg-white"
                  )}
                >
                  <div className="line-clamp-1 text-[12.5px] leading-[1.4] tracking-tight">
                    {tk.prompt}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <TaskStatusDot status={tk.status} />
                    <span className="text-[10.5px] tracking-tight text-[#999999]">
                      {timeAgo(tk.createdAt)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <Separator />

      {session?.user && (
        <div className="px-4 pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-[#666666] uppercase">
            <User className="h-3 w-3" />
            {t.auth.signedInAs}
          </div>
          <div className="flex items-center gap-2 rounded-[12px] border border-[#e5e5e5] bg-white p-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[11px] font-medium text-white">
              {(session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-[12.5px] font-medium tracking-tight">
                {session.user.name ?? session.user.email}
              </div>
              <div className="line-clamp-1 text-[10.5px] tracking-tight text-[#999999]">
                {session.user.email}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title={t.auth.signOut}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-[#666666] uppercase">
          <Wallet className="h-3 w-3" />
          {t.sidebar.wallet}
        </div>
        {isConnected && address ? (
          <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="font-mono text-[12px] tracking-tight">
                  {formatAddress(address, 6)}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                    {t.common.monadTestnet}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={copy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => disconnect()}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between rounded-[8px] bg-[#fafaf9] px-2.5 py-2">
              <span className="text-[11px] text-[#666666]">{t.sidebar.balance}</span>
              <span className="tnum text-[13px] font-medium">
                {balance ? formatMon(balance.value) : "0"}{" "}
                <span className="text-[10px] text-[#666666]">MON</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-[12px] border border-dashed border-[#e5e5e5] bg-white p-3">
            <div className="text-[12px] leading-[1.5] text-[#666666]">{t.sidebar.walletPrompt}</div>
            <div className="mt-3">
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={openConnectModal}
                    disabled={!mounted}
                    className="w-full"
                  >
                    {t.common.connectWallet}
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TaskStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: "bg-[#111111] pulse-dot",
    awaiting_approval: "bg-[#f5a623] pulse-dot",
    paying: "bg-[#111111] pulse-dot",
    completed: "bg-[#0ea56b]",
    rejected: "bg-[#999999]",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${map[status] ?? "bg-[#999999]"}`} />;
}
