"use client";

import { http } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./chain";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "agentpay-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "AgentPay",
  projectId,
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.monad.xyz"
    ),
  },
  ssr: true,
});
