import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createPublicClient,
  decodeEventLog,
  http,
  isAddressEqual,
  parseUnits,
  type Hex,
  type Log,
} from "viem";
import { monadTestnet } from "@/lib/chain";
import {
  AGENTPAY_ABI,
  USDC_DECIMALS,
  USDC_TO_MON_BASE_SCALE,
  ZERO_ADDRESS,
  getAgentPayAddress,
  getUsdcAddress,
} from "@/lib/contract";
import { findAgentProvider } from "@/lib/agent/providers";
import { generateApiKey } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

const Body = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  paymentIntent: z.object({
    providerId: z.string().min(1).max(64),
    providerName: z.string().min(1).max(128),
    amountUsdc: z.number().positive().finite(),
    recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    reason: z.string().optional(),
    taskRef: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  }),
  paymentMode: z.enum(["usdc", "mon"]).optional().default("usdc"),
});

const client = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

// Module-level idempotency: same taskRef returns the same key for the lifetime
// of this server process. Demo-grade — restart wipes the map.
const issued = new Map<string, string>();

function fail(code: string, status = 422) {
  return NextResponse.json({ ok: false, error: code }, { status });
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return fail("bad_request", 400);
  }

  const { txHash, paymentIntent, paymentMode } = body;

  // Idempotency short-circuit.
  const cached = issued.get(paymentIntent.taskRef);
  if (cached) {
    return NextResponse.json({
      ok: true,
      apiKey: cached,
      txHash,
      providerId: paymentIntent.providerId,
      providerName: paymentIntent.providerName,
      mintedAt: Date.now(),
      cached: true,
    });
  }

  const agentPay = getAgentPayAddress();
  if (!agentPay) return fail("contract_unconfigured", 503);

  // Recipient whitelist: intent.recipient must match the catalog entry's
  // payout address, otherwise a user could forge an intent paying themselves.
  const provider = findAgentProvider(paymentIntent.providerId);
  if (!provider) return fail("unknown_provider");
  if (!isAddressEqual(provider.recipientAddress as Hex, paymentIntent.recipient as Hex)) {
    return fail("recipient_mismatch");
  }

  // waitForTransactionReceipt (not get-) so newly mined tx are picked up even
  // if this serverless instance hit a slightly-behind RPC node.
  let receipt;
  try {
    receipt = await client.waitForTransactionReceipt({
      hash: txHash as Hex,
      timeout: 10_000,
      pollingInterval: 500,
    });
  } catch {
    return fail("receipt_not_found");
  }

  if (receipt.status !== "success") return fail("tx_reverted");

  // Decide expected token + amount from the paymentMode declared by the client.
  // The server independently re-derives expected values from the intent, so a
  // forged `paymentMode` alone can't unlock a key — the on-chain event has to
  // match.
  const isUsdc = paymentMode === "usdc";
  const expectedToken = isUsdc ? getUsdcAddress() : ZERO_ADDRESS;
  const usdcBase = parseUnits(paymentIntent.amountUsdc.toString(), USDC_DECIMALS);
  const expectedAmount = isUsdc ? usdcBase : usdcBase * USDC_TO_MON_BASE_SCALE;

  let matched = false;
  for (const log of receipt.logs as Log[]) {
    if (!isAddressEqual(log.address, agentPay)) continue;
    try {
      const ev = decodeEventLog({
        abi: AGENTPAY_ABI,
        data: log.data,
        topics: log.topics,
        eventName: "PaymentCompleted",
        strict: true,
      });
      const args = ev.args as unknown as {
        payer: Hex;
        receiver: Hex;
        token: Hex;
        amount: bigint;
        taskId: Hex;
      };
      if (
        isAddressEqual(args.token, expectedToken) &&
        isAddressEqual(args.receiver, paymentIntent.recipient as Hex) &&
        args.taskId.toLowerCase() === paymentIntent.taskRef.toLowerCase() &&
        args.amount === expectedAmount
      ) {
        if (matched) return fail("duplicate_event");
        matched = true;
      }
    } catch {
      // Not a PaymentCompleted log (e.g. USDC Transfer/Approval). Skip.
    }
  }

  if (!matched) return fail("event_mismatch");

  const apiKey = generateApiKey(`vsk_${paymentIntent.providerId}`);
  issued.set(paymentIntent.taskRef, apiKey);

  return NextResponse.json({
    ok: true,
    apiKey,
    txHash,
    providerId: paymentIntent.providerId,
    providerName: paymentIntent.providerName,
    paymentMode,
    mintedAt: Date.now(),
  });
}
