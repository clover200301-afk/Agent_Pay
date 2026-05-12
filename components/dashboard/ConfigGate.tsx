"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Wallet,
  KeyRound,
  Coins,
  Link2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";
import { useModelKeysStore } from "@/stores/useModelKeysStore";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  USDC_DECIMALS,
  USDC_TO_MON_BASE_SCALE,
  getAgentPayAddress,
  getUsdcAddress,
} from "@/lib/contract";
import { monadTestnet } from "@/lib/chain";

const MIN_USDC_FOR_DEMO = parseUnits("3.8", USDC_DECIMALS); // cheapest shortlist provider
const MIN_MON_FOR_GAS = parseUnits("0.001", 18); // always need a bit for gas
// Enough MON to pay 3.8 USDC at the demo rate (1 USDC = 0.01 MON) plus gas.
const MIN_MON_FOR_FALLBACK_PAYMENT =
  MIN_USDC_FOR_DEMO * USDC_TO_MON_BASE_SCALE + MIN_MON_FOR_GAS;
const MONAD_CHAIN_ID = monadTestnet.id;

/**
 * Returns true when the active user has at least one base-model API key
 * configured. Lives alongside SetupChecklist so callers can subscribe to the
 * boolean (e.g. ChatInput disables itself when false).
 */
export function useHasAnyModelKey(): boolean {
  return useModelKeysStore((s) =>
    Object.values(s.keys).some((v) => !!v && v.length > 0)
  );
}

interface CheckItem {
  id: string;
  Icon: typeof KeyRound;
  label: string;
  ok: boolean;
  hint: string;
}

/**
 * Top-of-workspace setup checklist. Shows 5 readiness checks for the demo:
 *   1. LLM model key configured
 *   2. Wallet connected
 *   3. Wallet on Monad Testnet
 *   4. Wallet holds enough USDC + MON
 *   5. AgentPay contract deployed (env address set)
 *
 * Hidden when all checks pass. Each unchecked item exposes a 1-click action
 * to fix it (open settings, connect wallet, switch chain, open faucet, …).
 */
export function ConfigGate() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const hasModelKey = useHasAnyModelKey();
  const [expanded, setExpanded] = useState(true);

  const onCorrectChain = isConnected && chainId === MONAD_CHAIN_ID;

  const usdcAddress = getUsdcAddress();
  const { data: monBal } = useBalance({
    address,
    chainId: MONAD_CHAIN_ID,
    query: { enabled: onCorrectChain },
  });
  const { data: usdcBal } = useBalance({
    address,
    token: usdcAddress,
    chainId: MONAD_CHAIN_ID,
    query: { enabled: onCorrectChain },
  });

  const hasUsdc = !!usdcBal && usdcBal.value >= MIN_USDC_FOR_DEMO;
  const hasMonForGas = !!monBal && monBal.value >= MIN_MON_FOR_GAS;
  const hasMonForFallback =
    !!monBal && monBal.value >= MIN_MON_FOR_FALLBACK_PAYMENT;
  // Funded when either:
  //   - USDC ≥ 3.8 AND a bit of MON for gas (USDC path), or
  //   - MON ≥ 3.8 USDC * exchange + gas (native MON fallback path)
  const balanceOk =
    onCorrectChain &&
    ((hasUsdc && hasMonForGas) || hasMonForFallback);
  const balanceUsingMon = !hasUsdc && hasMonForFallback;

  const agentPayAddr = getAgentPayAddress();
  const contractDeployed = !!agentPayAddr;

  const items: CheckItem[] = [
    {
      id: "llm",
      Icon: KeyRound,
      label: t.setup.llmLabel,
      ok: hasModelKey,
      hint: hasModelKey ? t.setup.llmDone : t.setup.llmTodo,
    },
    {
      id: "wallet",
      Icon: Wallet,
      label: t.setup.walletLabel,
      ok: isConnected,
      hint: isConnected ? t.setup.walletDone : t.setup.walletTodo,
    },
    {
      id: "chain",
      Icon: Link2,
      label: t.setup.chainLabel,
      ok: onCorrectChain,
      hint: onCorrectChain ? t.setup.chainDone : t.setup.chainTodo,
    },
    {
      id: "balance",
      Icon: Coins,
      label: t.setup.balanceLabel,
      ok: balanceOk,
      hint: balanceOk
        ? balanceUsingMon
          ? t.setup.balanceDoneMon
          : t.setup.balanceDone
        : !onCorrectChain
        ? t.setup.balancePendingChain
        : !hasMonForGas
        ? t.setup.balanceNoMon
        : t.setup.balanceNoFunds,
    },
    {
      id: "contract",
      Icon: Zap,
      label: t.setup.contractLabel,
      ok: contractDeployed,
      hint: contractDeployed ? t.setup.contractDone : t.setup.contractTodo,
    },
  ];

  const passed = items.filter((i) => i.ok).length;
  if (passed === items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-8 mt-5 rounded-[14px] border border-[#f5a623]/40 bg-[#fff8eb]"
    >
      {/* Compact header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5a623] text-white">
          <AlertCircle className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#8a5a00]">
            {t.setup.eyebrow}
          </div>
          <div className="mt-0.5 text-[13.5px] font-medium tracking-tight text-[#111111]">
            {t.setup.title.replace("{n}", String(passed)).replace("{total}", String(items.length))}
          </div>
        </div>
        <ProgressRing value={passed} total={items.length} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 border-t border-[#f5a623]/20 px-4 py-3">
              {items.map((item) => (
                <ChecklistRow key={item.id} item={item}>
                  <ItemAction
                    id={item.id}
                    ok={item.ok}
                    onCorrectChain={onCorrectChain}
                    switching={switching}
                    switchToMonad={() =>
                      switchChain({ chainId: MONAD_CHAIN_ID })
                    }
                    agentPayAddr={agentPayAddr}
                  />
                </ChecklistRow>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChecklistRow({
  item,
  children,
}: {
  item: CheckItem;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          item.ok
            ? "bg-[#0ea56b] text-white"
            : "border border-[#f5a623]/50 bg-white text-[#8a5a00]",
        )}
      >
        {item.ok ? (
          <Check className="h-3 w-3" strokeWidth={3} />
        ) : (
          <item.Icon className="h-3 w-3" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-[12.5px] font-medium tracking-tight text-[#111111]">
          {item.label}
        </div>
        <div className="text-[11.5px] leading-tight text-[#666666]">
          {item.hint}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ItemAction({
  id,
  ok,
  onCorrectChain,
  switching,
  switchToMonad,
  agentPayAddr,
}: {
  id: string;
  ok: boolean;
  onCorrectChain: boolean;
  switching: boolean;
  switchToMonad: () => void;
  agentPayAddr?: `0x${string}`;
}) {
  const t = useT();
  if (ok) return null;

  if (id === "llm") {
    return (
      <Link
        href="/dashboard/settings"
        className="rounded-full border border-[#111111] bg-[#111111] px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-white hover:opacity-90"
      >
        <span className="flex items-center gap-1">
          {t.setup.actionConfigure}
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    );
  }
  if (id === "wallet") {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            type="button"
            onClick={openConnectModal}
            className="rounded-full border border-[#111111] bg-[#111111] px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-white hover:opacity-90"
          >
            <span className="flex items-center gap-1">
              {t.setup.actionConnect}
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        )}
      </ConnectButton.Custom>
    );
  }
  if (id === "chain") {
    return (
      <button
        type="button"
        onClick={switchToMonad}
        disabled={switching}
        className="rounded-full border border-[#111111] bg-[#111111] px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-white hover:opacity-90 disabled:opacity-50"
      >
        <span className="flex items-center gap-1">
          {switching ? t.setup.actionSwitching : t.setup.actionSwitch}
          <ArrowRight className="h-3 w-3" />
        </span>
      </button>
    );
  }
  if (id === "balance") {
    if (!onCorrectChain) return null;
    return (
      <a
        href="https://faucet.monad.xyz"
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[11.5px] font-medium tracking-tight text-[#111111] hover:border-[#111111]"
      >
        <span className="flex items-center gap-1">
          {t.setup.actionFaucet}
          <ArrowRight className="h-3 w-3" />
        </span>
      </a>
    );
  }
  if (id === "contract") {
    if (agentPayAddr) return null;
    return (
      <span className="text-[11px] tracking-tight text-[#666666]">
        {t.setup.contractHintAdmin}
      </span>
    );
  }
  return null;
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : value / total;
  const r = 10;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke="#f5a623"
          strokeOpacity="0.2"
          strokeWidth="2.5"
        />
        <circle
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke="#f5a623"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 14 14)"
        />
      </svg>
      <span className="tnum text-[12px] font-medium tracking-tight text-[#8a5a00]">
        {value}/{total}
      </span>
    </div>
  );
}
