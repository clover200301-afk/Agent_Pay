import { PROVIDER_CATALOG, type ProviderCatalogEntry } from "@/lib/providers/catalog";

/**
 * Agent-facing view of the provider catalog.
 *
 * The UI catalog (`lib/providers/catalog.ts`) drives Settings + Provider cards.
 * The Agent needs two extra things on top of that:
 *   - a coarse `category` so an LLM can filter by user intent
 *     (e.g. "find the cheapest image API")
 *   - a `recipientAddress` so that USDC transferFrom has somewhere to go
 *
 * Recipient is shared across all providers in the demo —— a single merchant
 * wallet the team controls on Monad Testnet (configured via env). In a real
 * marketplace each provider would have its own payout address.
 */

export type ProviderCategory =
  | "chat"
  | "image"
  | "translation"
  | "code"
  | "multimodal";

export interface AgentProvider {
  id: string;
  name: string;
  region: "us" | "cn" | "eu";
  category: ProviderCategory;
  /** Per "30-day access pack" price quoted in USDC (6 decimals on chain). */
  priceUsdc: number;
  models: string[];
  tagline: string;
  uptime: number;
  rating: number;
  /** Monad Testnet address that receives the USDC payment. */
  recipientAddress: string;
}

function inferCategory(entry: ProviderCatalogEntry): ProviderCategory {
  if (entry.id === "replicate") return "image";
  if (entry.id === "deepl") return "translation";
  if (entry.id === "qwen" && entry.models.some((m) => m.includes("coder"))) {
    return "code";
  }
  if (entry.id === "openai" || entry.id === "anthropic") return "multimodal";
  return "chat";
}

/**
 * Demo recipient wallet. In production this would be per-provider; for the
 * hackathon every USDC payment lands in the same Monad Testnet wallet the
 * team controls, so receipts are easy to verify in monadexplorer.
 */
const DEMO_RECIPIENT_FALLBACK = "0x000000000000000000000000000000000000dEaD";

function getRecipient(): string {
  const fromEnv = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;
  if (fromEnv && /^0x[a-fA-F0-9]{40}$/.test(fromEnv)) return fromEnv;
  return DEMO_RECIPIENT_FALLBACK;
}

export const AGENT_PROVIDERS: AgentProvider[] = PROVIDER_CATALOG.map((entry) => ({
  id: entry.id,
  name: entry.name,
  region: entry.region,
  category: inferCategory(entry),
  priceUsdc: entry.priceUsdc,
  models: entry.models,
  tagline: entry.tagline,
  uptime: entry.uptime,
  rating: entry.rating,
  recipientAddress: getRecipient(),
}));

export function findAgentProvider(id: string): AgentProvider | undefined {
  return AGENT_PROVIDERS.find((p) => p.id === id);
}

export function filterProviders(opts: {
  category?: ProviderCategory;
  maxBudgetUsdc?: number;
}): AgentProvider[] {
  return AGENT_PROVIDERS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.maxBudgetUsdc !== undefined && p.priceUsdc > opts.maxBudgetUsdc) {
      return false;
    }
    return true;
  });
}
