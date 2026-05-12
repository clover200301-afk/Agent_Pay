import type { ModelProviderId } from "@/stores/useModelKeysStore";

/**
 * 「基础对话与推理模型」—— 用户必须至少配置一个才能使用 dashboard。
 * 区别于 lib/providers/catalog.ts：那里是 BYOK 服务市场（image API、翻译 API
 * 等可被 agent 购买的下游服务），这里是 agent 自身用来推理的基础大模型。
 */

export type ModelAuthStyle = "bearer" | "header" | "query";

export interface BaseModelMeta {
  id: ModelProviderId;
  /** 字典 key 前缀，name 与 tagline 走 i18n */
  i18nKey: ModelProviderId;
  initial: string;
  /** 默认模型推荐 */
  defaultModel: string;
  /** 全部可选模型（仅展示用） */
  models: string[];
  docsUrl: string;
  keyUrl: string;
  placeholder: string;
  authStyle: ModelAuthStyle;
}

export const BASE_MODELS: BaseModelMeta[] = [
  {
    id: "openai",
    i18nKey: "openai",
    initial: "O",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "o1-mini"],
    docsUrl: "https://platform.openai.com/docs",
    keyUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
    authStyle: "bearer",
  },
  {
    id: "anthropic",
    i18nKey: "anthropic",
    initial: "A",
    defaultModel: "claude-haiku-4-5",
    models: ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
    docsUrl: "https://docs.anthropic.com",
    keyUrl: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
    authStyle: "header",
  },
  {
    id: "google",
    i18nKey: "google",
    initial: "G",
    defaultModel: "gemini-2.0-flash",
    models: ["gemini-2.0-flash", "gemini-2.0-pro"],
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    keyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIza...",
    authStyle: "header",
  },
  {
    id: "doubao",
    i18nKey: "doubao",
    initial: "D",
    defaultModel: "doubao-pro-32k",
    models: ["doubao-pro-32k", "doubao-pro-128k", "doubao-lite-32k"],
    docsUrl: "https://www.volcengine.com/docs/82379",
    keyUrl: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
    placeholder: "...",
    authStyle: "bearer",
  },
  {
    id: "qwen",
    i18nKey: "qwen",
    initial: "Q",
    defaultModel: "qwen-plus",
    models: ["qwen-max", "qwen-plus", "qwen-turbo"],
    docsUrl: "https://help.aliyun.com/zh/dashscope/",
    keyUrl: "https://bailian.console.aliyun.com/?apiKey=1",
    placeholder: "sk-...",
    authStyle: "bearer",
  },
  {
    id: "deepseek",
    i18nKey: "deepseek",
    initial: "S",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
    docsUrl: "https://api-docs.deepseek.com",
    keyUrl: "https://platform.deepseek.com/api_keys",
    placeholder: "sk-...",
    authStyle: "bearer",
  },
];

export function getBaseModel(id: string) {
  return BASE_MODELS.find((m) => m.id === id);
}
