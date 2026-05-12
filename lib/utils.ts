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
