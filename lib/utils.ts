import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string | undefined, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatMon(value: bigint | number | string, decimals = 4) {
  const n =
    typeof value === "bigint"
      ? Number(value) / 1e18
      : typeof value === "string"
      ? Number(value)
      : value;
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(decimals).replace(/\.?0+$/, "");
}

export function generateMockTxHash() {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * 16)];
  return s as `0x${string}`;
}

export function generateApiKey(prefix = "vsk_live") {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s}`;
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * Build a bytes32 task reference used as the on-chain `taskId`. Stable per
 * call (timestamp + random). Output is `0x` + 64 hex chars.
 *
 * Shared between the agent (`lib/agent/tools.ts`) and the mock workflow
 * (`hooks/useWorkflow.ts`) so both paths emit the same shape.
 */
export function buildTaskRef(providerId: string): string {
  const stamp = Date.now().toString(16);
  const rand = Math.random().toString(16).slice(2, 10);
  const raw = `${providerId}-${stamp}-${rand}`;
  let hex = "";
  for (let i = 0; i < raw.length; i++) {
    hex += raw.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return ("0x" + hex.padEnd(64, "0")).slice(0, 66);
}
