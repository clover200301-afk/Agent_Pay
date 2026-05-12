import type { Address } from "viem";

/**
 * AgentPay smart contract ABI.
 *
 * Mirrors `contracts/src/AgentPay.sol`:
 *   - pay(receiver, taskId) payable          —— native MON path
 *   - payWithUSDC(receiver, amount, taskId)  —— ERC20 USDC path
 *   - usdc() view                            —— configured USDC token
 *   - event PaymentCompleted(payer, receiver, token, amount, taskId)
 *
 * The on-chain `taskId` is a bytes32; we use it as a stable reference to
 * the agent task that triggered the payment.
 */
export const AGENTPAY_ABI = [
  {
    type: "function",
    name: "pay",
    stateMutability: "payable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "taskId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "payWithUSDC",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "taskId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "usdc",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "event",
    name: "PaymentCompleted",
    inputs: [
      { indexed: true, name: "payer", type: "address" },
      { indexed: true, name: "receiver", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "taskId", type: "bytes32" },
    ],
    anonymous: false,
  },
] as const;

/** Minimal ERC20 ABI (approve + balanceOf + allowance). Used for USDC. */
export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

/** Monad Testnet USDC. Fixed by Monad Foundation. */
export const USDC_ADDRESS_FALLBACK: Address =
  "0x534b2f3A21130d7a60830c2Df862319e593943A3";

export const USDC_DECIMALS = 6;

/**
 * Fallback exchange rate when the wallet has no test USDC: pay in native MON
 * instead of USDC. 1 USDC base unit (6 decimals) maps to 1e10 wei of MON
 * (18 decimals) — i.e. 1 USDC = 0.01 MON. Demo-only mock pricing.
 */
export const USDC_TO_MON_BASE_SCALE = 10_000_000_000n;
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export type PaymentMode = "usdc" | "mon";

export function getAgentPayAddress(): Address | undefined {
  const a = process.env.NEXT_PUBLIC_AGENTPAY_ADDRESS;
  if (!a || !/^0x[a-fA-F0-9]{40}$/.test(a)) return undefined;
  return a as Address;
}

export function getMerchantAddress(): Address {
  const a = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;
  if (a && /^0x[a-fA-F0-9]{40}$/.test(a)) return a as Address;
  return "0x000000000000000000000000000000000000dEaD" as Address;
}

export function getUsdcAddress(): Address {
  const a = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  if (a && /^0x[a-fA-F0-9]{40}$/.test(a)) return a as Address;
  return USDC_ADDRESS_FALLBACK;
}
