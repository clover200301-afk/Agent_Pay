"use client";

import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { WagmiProvider, useDisconnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { LocaleProvider } from "@/lib/i18n/context";
import { setActiveUserId } from "@/lib/storage/scopedStorage";
import { useAppStore, APP_STORE_BASE } from "@/stores/useAppStore";
import { useModelKeysStore, MODEL_KEYS_STORE_BASE } from "@/stores/useModelKeysStore";
import { useApiKeysStore, API_KEYS_STORE_BASE } from "@/stores/useApiKeysStore";

const SCOPED_STORES: Array<{
  store: { persist: { setOptions: (o: { name: string }) => void; rehydrate: () => void | Promise<void> } };
  base: string;
}> = [
  { store: useAppStore as never, base: APP_STORE_BASE },
  { store: useModelKeysStore as never, base: MODEL_KEYS_STORE_BASE },
  { store: useApiKeysStore as never, base: API_KEYS_STORE_BASE },
];

/**
 * Sync the active user id with NextAuth's session and force each persisted
 * store to re-hydrate from the new namespace. Also disconnect the wallet on
 * sign-in / sign-out boundaries — wallets are deliberately not portable
 * between user accounts.
 */
function AccountScope({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { disconnect } = useDisconnect();
  const [lastUid, setLastUid] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;
    const uid = session?.user?.id ?? null;
    if (uid === lastUid) return;

    setActiveUserId(uid ?? undefined);

    for (const { store, base } of SCOPED_STORES) {
      store.persist.setOptions({ name: `${base}::${uid ?? "anon"}` });
      void store.persist.rehydrate();
    }

    // On a real account change (not the initial mount), drop wallet binding.
    if (lastUid !== undefined) disconnect();
    setLastUid(uid);
  }, [session?.user?.id, status, lastUid, disconnect]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <LocaleProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={lightTheme({
                accentColor: "#111111",
                accentColorForeground: "#ffffff",
                borderRadius: "medium",
                fontStack: "system",
              })}
              modalSize="compact"
            >
              <AccountScope>
                {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
              </AccountScope>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
