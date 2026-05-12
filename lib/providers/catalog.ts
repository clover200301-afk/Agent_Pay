import type { Provider } from "@/types/provider";

/**
 * Real provider catalog —— Bring Your Own Key (BYOK) 模式。
 *
 * AgentPay 不持有任何上游 API key；用户在 Settings → Providers 里粘贴自己的
 * key，存到 localStorage。工作流跑完后，把这把 key 直接颁发到 API list。
 *
 * 字段说明：
 *   - id           内部 stable identifier (kebab-case)
 *   - name         产品名
 *   - region       us / cn / eu —— 用于在 UI 上分组与图标颜色
 *   - tagline      一句话定位（i18n key 不变，taglineKey 走字典翻译）
 *   - baseUrl      上游官方 API 入口（用户 BYOK 后直接打这个 URL）
 *   - docsUrl      开发者文档
 *   - keyUrl       申请 key 的页面
 *   - models       建议默认模型清单
 *   - priceUsdc    Demo 用的 "购买 30 天访问权" 标价（与真实 token 计费无关）
 *   - uptime/rating 展示用的口碑数字
 *   - authStyle    用户配置 key 时的鉴权方式提示
 */

export type Region = "us" | "cn" | "eu";
export type AuthStyle = "bearer" | "header" | "query";

export interface ProviderCatalogEntry extends Provider {
  region: Region;
  baseUrl: string;
  docsUrl: string;
  keyUrl: string;
  models: string[];
  authStyle: AuthStyle;
  /** lucide-react icon 名称的替代 —— 我们这里直接放首字母占位，组件可换 SVG */
  initial: string;
  taglineKey:
    | "openai"
    | "anthropic"
    | "deepseek"
    | "qwen"
    | "minimax"
    | "glm"
    | "deepl"
    | "moonshot"
    | "replicate";
}

export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    id: "openai",
    name: "OpenAI",
    region: "us",
    initial: "O",
    tagline: "GPT-4o · GPT-4o-mini · o1",
    taglineKey: "openai",
    priceUsdc: 4.0,
    uptime: 99.95,
    rating: 4.9,
    badge: "Most popular",
    baseUrl: "https://api.openai.com/v1",
    docsUrl: "https://platform.openai.com/docs",
    keyUrl: "https://platform.openai.com/api-keys",
    models: ["gpt-4o", "gpt-4o-mini", "o1-mini"],
    authStyle: "bearer",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    region: "us",
    initial: "A",
    tagline: "Claude Opus 4.7 · Sonnet 4.6 · Haiku 4.5",
    taglineKey: "anthropic",
    priceUsdc: 4.5,
    uptime: 99.98,
    rating: 4.9,
    baseUrl: "https://api.anthropic.com/v1",
    docsUrl: "https://docs.anthropic.com",
    keyUrl: "https://console.anthropic.com/settings/keys",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
    authStyle: "header",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    region: "cn",
    initial: "D",
    tagline: "DeepSeek-V3 · DeepSeek-R1",
    taglineKey: "deepseek",
    priceUsdc: 2.4,
    uptime: 99.9,
    rating: 4.8,
    badge: "Best value",
    baseUrl: "https://api.deepseek.com/v1",
    docsUrl: "https://api-docs.deepseek.com",
    keyUrl: "https://platform.deepseek.com/api_keys",
    models: ["deepseek-chat", "deepseek-reasoner"],
    authStyle: "bearer",
  },
  {
    id: "qwen",
    name: "Qwen",
    region: "cn",
    initial: "Q",
    tagline: "Qwen3-Max · Qwen3-Coder",
    taglineKey: "qwen",
    priceUsdc: 2.8,
    uptime: 99.92,
    rating: 4.7,
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    docsUrl: "https://help.aliyun.com/zh/dashscope/",
    keyUrl: "https://bailian.console.aliyun.com/?apiKey=1",
    models: ["qwen-max", "qwen-plus", "qwen-coder-plus"],
    authStyle: "bearer",
  },
  {
    id: "minimax",
    name: "MiniMax",
    region: "cn",
    initial: "M",
    tagline: "abab7-chat · MiniMax-M1",
    taglineKey: "minimax",
    priceUsdc: 3.2,
    uptime: 99.85,
    rating: 4.6,
    baseUrl: "https://api.minimax.chat/v1",
    docsUrl: "https://platform.minimaxi.com/document/",
    keyUrl: "https://platform.minimaxi.com/user-center/basic-information/interface-key",
    models: ["abab7-chat", "MiniMax-M1"],
    authStyle: "bearer",
  },
  {
    id: "glm",
    name: "Zhipu GLM",
    region: "cn",
    initial: "G",
    tagline: "GLM-4.6 · GLM-4-Air",
    taglineKey: "glm",
    priceUsdc: 2.6,
    uptime: 99.9,
    rating: 4.7,
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    docsUrl: "https://bigmodel.cn/dev/welcome",
    keyUrl: "https://bigmodel.cn/usercenter/apikeys",
    models: ["glm-4.6", "glm-4-air"],
    authStyle: "bearer",
  },
  {
    id: "moonshot",
    name: "Moonshot Kimi",
    region: "cn",
    initial: "K",
    tagline: "Kimi K2 · 128K-context",
    taglineKey: "moonshot",
    priceUsdc: 3.0,
    uptime: 99.88,
    rating: 4.7,
    baseUrl: "https://api.moonshot.cn/v1",
    docsUrl: "https://platform.moonshot.cn/docs",
    keyUrl: "https://platform.moonshot.cn/console/api-keys",
    models: ["kimi-k2-0905", "moonshot-v1-128k"],
    authStyle: "bearer",
  },
  {
    id: "deepl",
    name: "DeepL",
    region: "eu",
    initial: "L",
    tagline: "Translation API · 31 languages",
    taglineKey: "deepl",
    priceUsdc: 3.6,
    uptime: 99.99,
    rating: 4.9,
    baseUrl: "https://api.deepl.com/v2",
    docsUrl: "https://developers.deepl.com",
    keyUrl: "https://www.deepl.com/account/summary",
    models: ["translate-v2"],
    authStyle: "header",
  },
  {
    id: "replicate",
    name: "Replicate",
    region: "us",
    initial: "R",
    tagline: "Flux · SDXL · open-source models",
    taglineKey: "replicate",
    priceUsdc: 3.8,
    uptime: 99.85,
    rating: 4.7,
    baseUrl: "https://api.replicate.com/v1",
    docsUrl: "https://replicate.com/docs",
    keyUrl: "https://replicate.com/account/api-tokens",
    models: ["flux-1.1-pro", "stability-ai/sdxl"],
    authStyle: "bearer",
  },
];

/** 提示文案：用户填 key 时的输入框 placeholder。 */
export const KEY_PLACEHOLDERS: Record<string, string> = {
  openai: "sk-...",
  anthropic: "sk-ant-...",
  deepseek: "sk-...",
  qwen: "sk-...",
  minimax: "eyJhbGc...",
  glm: "...",
  moonshot: "sk-...",
  deepl: "abcd1234-...-:fx",
  replicate: "r8_...",
};

export function getProvider(id: string) {
  return PROVIDER_CATALOG.find((p) => p.id === id);
}

/** 用于 dashboard 的 "agent 推荐" 视觉：根据 prompt 关键词挑 3 家，最便宜在前。 */
export function pickShortlist(prompt: string): ProviderCatalogEntry[] {
  const lower = prompt.toLowerCase();
  let candidates = PROVIDER_CATALOG;

  if (/image|图像|图片|画|sd|stable diffusion|flux/.test(lower)) {
    candidates = PROVIDER_CATALOG.filter((p) =>
      ["replicate", "openai"].includes(p.id)
    );
  } else if (/translat|翻译|deepl/.test(lower)) {
    candidates = PROVIDER_CATALOG.filter((p) =>
      ["deepl", "openai", "deepseek"].includes(p.id)
    );
  } else if (/cn|中文|中国|chinese|cheap|便宜/.test(lower)) {
    candidates = PROVIDER_CATALOG.filter((p) => p.region === "cn");
  }

  const sorted = [...candidates].sort((a, b) => a.priceUsdc - b.priceUsdc);
  const top = sorted.slice(0, 3);
  return top.length >= 3 ? top : PROVIDER_CATALOG.slice(0, 3);
}

export function pickCheapestFrom(list: ProviderCatalogEntry[]) {
  return list.reduce((a, b) => (a.priceUsdc <= b.priceUsdc ? a : b));
}
