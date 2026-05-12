import { z } from "zod";
import {
  AGENT_PROVIDERS,
  filterProviders,
  findAgentProvider,
  type AgentProvider,
} from "@/lib/agent/providers";
import { buildTaskRef } from "@/lib/utils";
import type { PaymentIntent } from "@/stores/useAppStore";

/**
 * Tool implementations for the agent. Each tool corresponds to one step in
 * the WorkflowTimeline UI; when the LLM calls the tool, the client maps it
 * to a step transition.
 *
 * All three tools are pure functions over the static AGENT_PROVIDERS catalog
 * —— there's no live network call. The "intelligence" is the LLM choosing
 * which tool to call, with what args, and what to do with the result.
 */

export const searchProvidersSchema = z.object({
  category: z
    .enum(["chat", "image", "translation", "code", "multimodal"])
    .describe("Coarse capability category inferred from the user's request."),
  maxBudgetUsdc: z
    .number()
    .positive()
    .optional()
    .describe("Upper bound on the per-pack price in USDC, if the user stated one."),
});

export function searchProviders(
  args: z.infer<typeof searchProvidersSchema>,
): { matches: AgentProvider[]; total: number } {
  const matches = filterProviders(args);
  return { matches, total: matches.length };
}

export const compareProvidersSchema = z.object({
  providerIds: z.array(z.string()).min(2).describe("Two or more provider ids to compare."),
  criterion: z
    .enum(["price", "uptime", "rating"])
    .describe("Primary attribute to rank by."),
});

export function compareProviders(
  args: z.infer<typeof compareProvidersSchema>,
): { ranked: AgentProvider[]; criterion: string } {
  const resolved = args.providerIds
    .map((id) => findAgentProvider(id))
    .filter((p): p is AgentProvider => p !== undefined);

  const ranked = [...resolved].sort((a, b) => {
    switch (args.criterion) {
      case "price":
        return a.priceUsdc - b.priceUsdc;
      case "uptime":
        return b.uptime - a.uptime;
      case "rating":
        return b.rating - a.rating;
    }
  });

  return { ranked, criterion: args.criterion };
}

export const proposePaymentSchema = z.object({
  providerId: z.string().describe("The chosen provider's id."),
  amountUsdc: z
    .number()
    .positive()
    .describe("Final amount in USDC (must match the provider's listed price unless the user explicitly negotiated)."),
  reason: z
    .string()
    .describe("One-sentence rationale shown to the user above the payment panel."),
});

export function proposePayment(
  args: z.infer<typeof proposePaymentSchema>,
): { ok: true; intent: PaymentIntent } | { ok: false; error: string } {
  const provider = findAgentProvider(args.providerId);
  if (!provider) {
    return { ok: false, error: `Unknown provider id: ${args.providerId}` };
  }

  const intent: PaymentIntent = {
    providerId: provider.id,
    providerName: provider.name,
    amountUsdc: args.amountUsdc,
    recipient: provider.recipientAddress,
    reason: args.reason,
    taskRef: buildTaskRef(provider.id),
  };

  return { ok: true, intent };
}

/** Names exported so server + client agree on the tool identifiers. */
export const TOOL_NAMES = {
  search: "searchProviders",
  compare: "compareProviders",
  propose: "proposePayment",
} as const;

export type AgentToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];
