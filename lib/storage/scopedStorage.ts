"use client";

import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Per-user localStorage namespacing.
 *
 * We never want one user's history / API keys / model keys to leak into
 * another user's session on the same browser. Instead of forking the store
 * per user we keep a single zustand store but rewrite its `name` whenever the
 * NextAuth session.user.id changes (see app/providers.tsx — the auth boundary
 * calls `setActiveUserId` + each store's `persist.rehydrate()` on change).
 *
 * Until a session id is known we use the "anon" bucket — that keeps the demo
 * flow working before any sign-in.
 */
let activeUserId = "anon";

const listeners = new Set<(uid: string) => void>();

export function setActiveUserId(uid: string | undefined | null) {
  const next = uid && uid.length > 0 ? uid : "anon";
  if (next === activeUserId) return;
  activeUserId = next;
  listeners.forEach((cb) => cb(activeUserId));
}

export function getActiveUserId() {
  return activeUserId;
}

export function onActiveUserChange(cb: (uid: string) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Build a zustand persist `name` scoped to the current user. */
export function scopedName(base: string) {
  return `${base}::${activeUserId}`;
}

/**
 * zustand `storage` option that reads / writes localStorage but never throws
 * during SSR (where window is undefined). We return JSONStorage so partialize
 * still works as expected.
 */
export const safeJsonStorage = createJSONStorage<unknown>(() => {
  if (typeof window === "undefined") {
    const memory: Record<string, string> = {};
    const stub: StateStorage = {
      getItem: (k) => memory[k] ?? null,
      setItem: (k, v) => {
        memory[k] = v;
      },
      removeItem: (k) => {
        delete memory[k];
      },
    };
    return stub;
  }
  return window.localStorage;
});
