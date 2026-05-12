import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
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

type SupportedProvider = "openai" | "anthropic" | "deepseek";

interface AgentRequestBody {
  messages: UIMessage[];
  provider: SupportedProvider;
  apiKey: string;
  locale?: "en" | "zh";
}

const SYSTEM_PROMPT_EN = `You are AgentPay's procurement agent. Your job is to help the user buy AI API access using USDC on Monad Testnet.

Follow this workflow strictly:
1. Call searchProviders with the right category (chat/image/translation/code/multimodal) inferred from the user's request, and maxBudgetUsdc if the user named a budget.
2. Call compareProviders on the top candidates by "price" to find the cheapest viable option.
3. Call proposePayment with the chosen provider's id, its exact priceUsdc as amountUsdc, and a one-sentence reason that names the provider and the price.

Rules:
- Always call all three tools in order. Never skip a step.
- Do not invent providers or prices —— only use what searchProviders returned.
- After proposePayment returns, write a short final message in English summarising the choice. Do not call any further tools.`;

const SYSTEM_PROMPT_ZH = `你是 AgentPay 的采购 Agent，帮用户用 Monad 测试网上的 USDC 购买 AI API 访问权。

请严格按以下流程执行：
1. 根据用户需求推断类目（chat/image/translation/code/multimodal），调用 searchProviders；如果用户给了预算，传入 maxBudgetUsdc。
2. 对候选 provider 按 "price" 调用 compareProviders，找出最便宜且满足需求的选项。
3. 调用 proposePayment，传入所选 provider 的 id、其精确 priceUsdc 作为 amountUsdc、以及一句中文理由（点名 provider 和价格）。

规则：
- 必须按顺序调用三个工具，不可跳步。
- 不要编造 provider 或价格 —— 只能用 searchProviders 返回的数据。
- proposePayment 返回后，用一句中文做最终总结。不要再调用任何工具。`;

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
  if (!body.provider || !["openai", "anthropic", "deepseek"].includes(body.provider)) {
    return new Response(
      JSON.stringify({ error: "Unsupported provider" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  const model = buildModel(body.provider, body.apiKey);
  const system = body.locale === "zh" ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

  const result = streamText({
    model,
    system,
    messages: await convertToModelMessages(body.messages),
    tools: {
      searchProviders: {
        description:
          "Search the AI provider catalog by capability category and optional max USDC budget.",
        inputSchema: searchProvidersSchema,
        execute: async (args) => searchProviders(args),
      },
      compareProviders: {
        description:
          "Rank a shortlist of providers by price / uptime / rating. Returns them sorted best-first.",
        inputSchema: compareProvidersSchema,
        execute: async (args) => compareProviders(args),
      },
      proposePayment: {
        description:
          "Propose a final USDC payment for the chosen provider. The client will surface this as a payment panel for the user to approve.",
        inputSchema: proposePaymentSchema,
        execute: async (args) => proposePayment(args),
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
