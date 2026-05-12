"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeJsonStorage, scopedName } from "@/lib/storage/scopedStorage";

export const API_KEYS_STORE_BASE = "agentpay-api-keys";

export interface IssuedApiKey {
  id: string;
  providerId: string;
  providerName: string;
  priceUsdc: number;
  apiKey: string;
  txHash?: string;
  taskId?: string;
  createdAt: number;
}

interface ApiKeysState {
  keys: IssuedApiKey[];
  addKey: (k: IssuedApiKey) => void;
  removeKey: (id: string) => void;
  clear: () => void;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      keys: [],
      addKey: (k) =>
        set((st) => ({ keys: [k, ...st.keys].slice(0, 50) })),
      removeKey: (id) =>
        set((st) => ({ keys: st.keys.filter((k) => k.id !== id) })),
      clear: () => set({ keys: [] }),
    }),
    {
      name: scopedName(API_KEYS_STORE_BASE),
      storage: safeJsonStorage() as never,
      partialize: (s) => ({ keys: s.keys }),
    }
  )
);
