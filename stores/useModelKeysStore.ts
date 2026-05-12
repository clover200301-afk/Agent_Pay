"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonStorage, scopedName } from "@/lib/storage/scopedStorage";

export const MODEL_KEYS_STORE_BASE = "agentpay-model-keys";

export type ModelProviderId =
  | "openai"
  | "google"
  | "anthropic"
  | "doubao"
  | "qwen"
  | "deepseek";

interface ModelKeysState {
  keys: Partial<Record<ModelProviderId, string>>;
  setKey: (id: ModelProviderId, key: string) => void;
  removeKey: (id: ModelProviderId) => void;
  hasAny: () => boolean;
}

export const useModelKeysStore = create<ModelKeysState>()(
  persist(
    (set, get) => ({
      keys: {},
      setKey: (id, key) =>
        set((st) => ({ keys: { ...st.keys, [id]: key.trim() } })),
      removeKey: (id) =>
        set((st) => {
          const next = { ...st.keys };
          delete next[id];
          return { keys: next };
        }),
      hasAny: () => Object.values(get().keys).some((v) => !!v && v.length > 0),
    }),
    {
      name: scopedName(MODEL_KEYS_STORE_BASE),
      storage: safeJsonStorage() as never,
      partialize: (s) => ({ keys: s.keys }),
    }
  )
);
