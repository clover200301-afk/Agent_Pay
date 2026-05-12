import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  searchProviders,
  searchProvidersSchema,
  compareProviders,
  compareProvidersSchema,
  proposePayment,
  proposePaymentSchema,
} from "@/lib/agent/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

type SupportedProvider = "openai" | "anthropic" | "deepseek" | "google" | "doubao" | "qwen";

interface AgentContextPayload {
  issuedKeys?: Array<{ providerName: string; priceUsdc: number; createdAt: number }>;
  recentTasks?: Array<{ providerName: string; priceUsdc: number; completedAt: number }>;
  walletBalance?: { usdc?: string; mon?: string };
  catalog?: Array<{ id: string; name: string; category: string; priceUsdc: number }>;
}

interface AgentRequestBody {
  messages: UIMessage[];
  provider: SupportedProvider;
  apiKey: string;
  locale?: "en" | "zh";
  context?: AgentContextPayload;
}

/** OpenAI-compatible providers with custom base URLs. */
const OPENAI_COMPAT: Record<string, { baseURL: string; model: string }> = {
  doubao: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    model: "doubao-pro-32k",
  },
  qwen: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
};

const BASE_SYSTEM_EN = `You are AgentPay's in-workspace assistant. You help the user discover, compare, and (when they ask) purchase AI API access using USDC on Monad Testnet.

Conversation modes — pick exactly one per user turn:

A. CHAT MODE (default). When the user is greeting, asking a question, exploring options, checking their account, or anything else short of an explicit "buy / purchase / renew / pay" instruction:
   - Reply in plain natural language.
   - DO NOT call any tool. Quote prices and provider names from the catalog/account context below if helpful.
   - It is OK to recommend a provider in prose — that is not the same as starting a purchase.

B. PURCHASE MODE. Trigger ONLY when the user clearly wants to buy / pay / renew / settle right now. Phrases like "buy the cheapest X", "renew my Y", "pay for Z", "let's purchase…", or an unambiguous confirmation of an earlier suggestion ("ok do it", "yes go ahead").
   When triggered, run all three tools in this exact order:
     1. searchProviders(category, maxBudgetUsdc?) — infer category (chat / image / translation / code / multimodal) and budget from the user's message.
     2. compareProviders(providerIds, criterion="price") on the shortlist.
     3. proposePayment(providerId, amountUsdc, reason) — amountUsdc must equal the chosen provider's exact priceUsdc; reason is one sentence naming the provider and price.
   After proposePayment returns, write one short sentence summarising the choice and stop. Do not call any further tools.

Hard rules:
- Never invent providers, prices, or API key values.
- Never call a purchase tool when the user is only asking / chatting.
- If the user's intent is ambiguous, ask one short clarifying question in CHAT MODE — do not call tools.`;

const BASE_SYSTEM_ZH = `你是 AgentPay 工作台里的助手，帮用户在 Monad 测试网上用 USDC 发现、比较，以及（当用户明确提出时）购买 AI API 访问权。

两种对话模式，每轮只能选一种：

A. 对话模式（默认）。当用户在打招呼、问问题、探索选项、查看账户，或任何尚未明确说"买 / 购买 / 续订 / 付款"的情况：
   - 用自然中文直接回答。
   - 不要调用任何工具。可以引用下方的目录/账户上下文报出价格和服务商名字。
   - 在回答中推荐某个 Provider 是允许的——那不等于启动购买。

B. 采购模式。只有当用户明确表达"现在就要买 / 付 / 续费 / 结算"的意图时才触发。典型措辞：「买最便宜的 X」「续订我的 Y」「帮我付 Z」「就买它」「好，开始吧」（对前文建议的明确确认）。
   触发后，按以下顺序调用全部三个工具：
     1. searchProviders(category, maxBudgetUsdc?) —— 从用户消息推断类目（chat / image / translation / code / multimodal）和预算。
     2. compareProviders(providerIds, criterion="price") 对候选 Provider 比较。
     3. proposePayment(providerId, amountUsdc, reason) —— amountUsdc 必须等于所选 Provider 的精确 priceUsdc；reason 为一句中文，点名 Provider 和价格。
   proposePayment 返回后，用一句中文总结所选方案，然后停止。不要再调用任何工具。

硬性规则：
- 不要编造 Provider、价格或 API key。
- 用户只是聊天/询问时，绝对不要调用采购工具。
- 用户意图不明确时，用对话模式问一句简短的澄清问题，不要直接调工具。`;

function formatTimestamp(ts: number, locale: "en" | "zh"): string {
  const d = new Date(ts);
  if (locale === "zh") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return d.toISOString().slice(0, 10);
}

function renderContext(
  ctx: AgentContextPayload | undefined,
  locale: "en" | "zh",
): string {
  if (!ctx) return "";

  const isZh = locale === "zh";
  const lines: string[] = [];

  // Wallet balance
  if (ctx.walletBalance && (ctx.walletBalance.usdc || ctx.walletBalance.mon)) {
    const usdc = ctx.walletBalance.usdc ?? "0";
    const mon = ctx.walletBalance.mon ?? "0";
    lines.push(
      isZh
        ? `钱包余额：${usdc} USDC，${mon} MON。`
        : `Wallet balance: ${usdc} USDC, ${mon} MON.`,
    );
  }

  // Issued API keys
  if (ctx.issuedKeys && ctx.issuedKeys.length > 0) {
    const header = isZh ? "用户已购买的 API Key（不要再推荐重复购买，除非用户明确要求）：" : "API keys the user already owns (do not push duplicate purchases unless asked):";
    lines.push(header);
    for (const k of ctx.issuedKeys.slice(0, 10)) {
      lines.push(
        isZh
          ? `- ${k.providerName}，单价 ${k.priceUsdc} USDC，购于 ${formatTimestamp(k.createdAt, locale)}`
          : `- ${k.providerName} (paid ${k.priceUsdc} USDC, issued ${formatTimestamp(k.createdAt, locale)})`,
      );
    }
  } else {
    lines.push(
      isZh
        ? "用户当前账户里还没有任何 API Key。"
        : "The user does not own any API key yet.",
    );
  }

  // Recent completed tasks
  if (ctx.recentTasks && ctx.recentTasks.length > 0) {
    lines.push(
      isZh
        ? "最近完成的采购任务："
        : "Recent completed purchases:",
    );
    for (const t of ctx.recentTasks.slice(0, 5)) {
      lines.push(
        isZh
          ? `- ${t.providerName}（${t.priceUsdc} USDC，完成于 ${formatTimestamp(t.completedAt, locale)}）`
          : `- ${t.providerName} (${t.priceUsdc} USDC, ${formatTimestamp(t.completedAt, locale)})`,
      );
    }
  }

  // Available catalog
  if (ctx.catalog && ctx.catalog.length > 0) {
    lines.push(
      isZh
        ? "可购买的 Provider 目录（id · 名称 · 类目 · 30 天价 USDC）："
        : "Purchasable provider catalog (id · name · category · 30-day price USDC):",
    );
    for (const p of ctx.catalog) {
      lines.push(`- ${p.id} · ${p.name} · ${p.category} · ${p.priceUsdc}`);
    }
  }

  if (lines.length === 0) return "";
  const heading = isZh ? "## 当前账户上下文" : "## Account context";
  return `\n\n${heading}\n${lines.join("\n")}`;
}

function buildModel(provider: SupportedProvider, apiKey: string) {
  switch (provider) {
    case "openai": {
      const client = createOpenAI({ apiKey });
      return client("gpt-4o-mini");
    }
    case "anthropic": {
      const client = createAnthropic({ apiKey });
      return client("claude-haiku-4-5");
    }
    case "deepseek": {
      const client = createDeepSeek({ apiKey });
      return client("deepseek-chat");
    }
    case "google": {
      const client = createGoogleGenerativeAI({ apiKey });
      return client("gemini-2.0-flash");
    }
    case "doubao":
    case "qwen": {
      const compat = OPENAI_COMPAT[provider];
      const client = createOpenAI({ apiKey, baseURL: compat.baseURL });
      return client(compat.model);
    }
  }
}

export async function POST(req: Request) {
  let body: AgentRequestBody;
  try {
    body = (await req.json()) as AgentRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.apiKey || body.apiKey.length < 8) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid API key" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  if (!body.provider || !["openai", "anthropic", "deepseek", "google", "doubao", "qwen"].includes(body.provider)) {
    return new Response(
      JSON.stringify({ error: "Unsupported provider" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const locale: "en" | "zh" = body.locale === "zh" ? "zh" : "en";
  const model = buildModel(body.provider, body.apiKey);
  const base = locale === "zh" ? BASE_SYSTEM_ZH : BASE_SYSTEM_EN;
  const system = base + renderContext(body.context, locale);

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(body.messages),
    tools: {
      searchProviders: {
        description:
          "Search the AI provider catalog by capability category and optional max USDC budget. Only call when the user has explicitly asked to BUY / PAY / RENEW.",
        inputSchema: searchProvidersSchema,
        execute: async (args) => searchProviders(args),
      },
      compareProviders: {
        description:
          "Rank a shortlist of providers by price / uptime / rating. Returns them sorted best-first. Only call as step 2 of a purchase flow.",
        inputSchema: compareProvidersSchema,
        execute: async (args) => compareProviders(args),
      },
      proposePayment: {
        description:
          "Propose a final USDC payment for the chosen provider. The client will surface this as a payment panel for the user to approve. Only call as step 3 of a purchase flow.",
        inputSchema: proposePaymentSchema,
        execute: async (args) => proposePayment(args),
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
