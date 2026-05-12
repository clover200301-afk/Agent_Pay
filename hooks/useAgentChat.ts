"use client";

import { DefaultChatTransport } from "ai";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAppStore, type PaymentIntent } from "@/stores/useAppStore";
import {
  useModelKeysStore,
  type ModelProviderId,
} from "@/stores/useModelKeysStore";
import { useApiKeysStore } from "@/stores/useApiKeysStore";
import { useLocale } from "@/lib/i18n/context";
import { findAgentProvider, AGENT_PROVIDERS } from "@/lib/agent/providers";
import { getUsdcAddress } from "@/lib/contract";
import { monadTestnet } from "@/lib/chain";

/**
 * Provider ids that /api/agent accepts (must match route.ts).
 * Order = priority when user has multiple keys configured.
 */
const AGENT_PROVIDERS_PRIORITY: ModelProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "qwen",
  "doubao",
];

function pickCreds(keys: Partial<Record<ModelProviderId, string>>) {
  for (const id of AGENT_PROVIDERS_PRIORITY) {
    const k = keys[id];
    if (k && k.length > 0) return { provider: id, apiKey: k };
  }
  return null;
}

/** Static catalog summary — same across all requests; computed once. */
const CATALOG_SUMMARY = AGENT_PROVIDERS.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  priceUsdc: p.priceUsdc,
}));

/**
 * Hook that wires the real AI agent API into the workspace.
 *
 * Two-layer flow:
 *  - Chat layer: every sendMessage exchanges UIMessages with /api/agent.
 *    workflowState stays "idle" so no purchase UI appears.
 *  - Purchase layer: only when the agent calls `searchProviders` for the
 *    first time in this chat session do we create a task record, flip
 *    workflowState to "running", and let the timeline + payment panel
 *    take over. proposePayment ends the flow with awaiting_approval.
 *
 * If no model key is configured, `isAvailable` is false and callers
 * should disable the chat input.
 */
export function useAgentChat() {
  const { locale } = useLocale();
  const modelKeys = useModelKeysStore((s) => s.keys);
  const creds = pickCreds(modelKeys);

  // Account context inputs (read-only — pushed as request body)
  const issuedKeys = useApiKeysStore((s) => s.keys);
  const tasks = useAppStore((s) => s.tasks);

  // Wallet balances (Monad testnet). All optional — if wallet not connected,
  // useBalance returns undefined and we omit the field.
  const { address } = useAccount();
  const { data: monBal } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });
  const { data: usdcBal } = useBalance({
    address,
    token: getUsdcAddress(),
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });

  // Store actions
  const setWorkflowState = useAppStore((s) => s.setWorkflowState);
  const setActiveStepIndex = useAppStore((s) => s.setActiveStepIndex);
  const setSelectedProvider = useAppStore((s) => s.setSelectedProvider);
  const setCurrentPrompt = useAppStore((s) => s.setCurrentPrompt);
  const setCurrentTaskId = useAppStore((s) => s.setCurrentTaskId);
  const setPaymentIntent = useAppStore((s) => s.setPaymentIntent);
  const resetWorkflow = useAppStore((s) => s.resetWorkflow);
  const addTask = useAppStore((s) => s.addTask);
  const updateTask = useAppStore((s) => s.updateTask);

  const seenIds = useRef<Set<string>>(new Set());
  const taskIdRef = useRef<string | undefined>(undefined);
  /** Set when sendMessage has been called at least once this session. */
  const startedRef = useRef<boolean>(false);
  /** Set when the agent's first tool call has flipped us into purchase mode. */
  const purchaseStartedRef = useRef<boolean>(false);
  /** Last user prompt — used as the task prompt when purchase mode flips on. */
  const lastPromptRef = useRef<string>("");

  // Build a transport scoped to creds + locale. The per-request context
  // (issued keys / recent tasks / balance) is attached via sendMessage's
  // options.body so updates don't recreate the transport mid-stream.
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/agent",
        body: creds
          ? { provider: creds.provider, apiKey: creds.apiKey, locale }
          : undefined,
      }),
    [creds, locale],
  );

  const chat = useChat({
    transport,
    onError: (err) => {
      console.error("[useAgentChat] stream error:", err);
      // Only revert workflow if a purchase had actually started.
      if (purchaseStartedRef.current) {
        setWorkflowState("idle");
        purchaseStartedRef.current = false;
      }
    },
  });

  // React to tool invocations as messages stream in. Only the FIRST
  // searchProviders triggers the workflow UI; subsequent tool events
  // advance the step index.
  useEffect(() => {
    if (!startedRef.current) return;

    for (const msg of chat.messages) {
      if (msg.role !== "assistant") continue;
      const parts = msg.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (typeof part.type !== "string" || !part.type.startsWith("tool-")) continue;

        const toolName = part.type.slice(5);
        const toolCallId = String((part as Record<string, unknown>).toolCallId ?? "");
        const partState = String((part as Record<string, unknown>).state ?? "");
        const dedupKey = `${toolCallId}:${partState}`;
        if (seenIds.current.has(dedupKey)) continue;
        seenIds.current.add(dedupKey);

        // ── Tool input available (agent called the tool) ──
        if (partState === "input-available") {
          if (toolName === "searchProviders" && !purchaseStartedRef.current) {
            // First purchase tool call this session → spin up workflow + task.
            purchaseStartedRef.current = true;
            const taskPrompt = lastPromptRef.current || "";
            const task = {
              id: `task_${Date.now()}`,
              prompt: taskPrompt,
              status: "running" as const,
              createdAt: Date.now(),
            };
            addTask(task);
            setCurrentTaskId(task.id);
            taskIdRef.current = task.id;
            setWorkflowState("running");
            // Brief "understanding" beat for visual continuity, then jump
            // to "searching" since the search tool is already running.
            setActiveStepIndex(0);
            setTimeout(() => setActiveStepIndex(1), 450);
            continue;
          }

          switch (toolName) {
            case "searchProviders":
              setActiveStepIndex(1); // searching
              break;
            case "compareProviders":
              setActiveStepIndex(2); // comparing
              break;
            case "proposePayment":
              setActiveStepIndex(4); // selecting
              break;
          }
        }

        // ── Tool output available (tool returned data) ──
        if (partState === "output-available") {
          const output = (part as Record<string, unknown>).output as Record<string, unknown> | undefined;

          switch (toolName) {
            case "searchProviders":
              setActiveStepIndex(2); // comparing
              break;
            case "compareProviders":
              setActiveStepIndex(3); // evaluating
              break;
            case "proposePayment": {
              setActiveStepIndex(5); // preparing

              if (output && output.ok && output.intent) {
                const intent = output.intent as PaymentIntent;
                setPaymentIntent(intent);
                setSelectedProvider(intent.providerId);

                const provider = findAgentProvider(intent.providerId);
                if (taskIdRef.current) {
                  updateTask(taskIdRef.current, {
                    status: "awaiting_approval",
                    selectedProvider: provider,
                  });
                }

                setTimeout(() => {
                  setActiveStepIndex(6); // awaiting_approval
                  setWorkflowState("awaiting_approval");
                }, 700);
              }
              break;
            }
          }
        }
      }
    }
  }, [
    chat.messages,
    addTask,
    setActiveStepIndex,
    setCurrentTaskId,
    setPaymentIntent,
    setSelectedProvider,
    setWorkflowState,
    updateTask,
  ]);

  const start = useCallback(
    async (prompt: string) => {
      if (!creds) return false;

      // First send of the session → reset dedup. Re-sends in the same
      // session keep the seenIds map (so prior tool parts aren't replayed).
      if (!startedRef.current) seenIds.current.clear();
      startedRef.current = true;

      // Snapshot context for THIS message — current balances, account keys,
      // and recent tasks. Sent as sendMessage body so transport stays stable.
      const context = {
        issuedKeys: issuedKeys.slice(0, 10).map((k) => ({
          providerName: k.providerName,
          priceUsdc: k.priceUsdc,
          createdAt: k.createdAt,
        })),
        recentTasks: tasks
          .filter((t) => t.status === "success" && t.completedAt)
          .slice(0, 5)
          .map((t) => ({
            providerName: t.selectedProvider?.name ?? "Unknown",
            priceUsdc: t.selectedProvider?.priceUsdc ?? 0,
            completedAt: t.completedAt ?? t.createdAt,
          })),
        walletBalance: address
          ? {
              usdc: usdcBal?.formatted,
              mon: monBal?.formatted,
            }
          : undefined,
        catalog: CATALOG_SUMMARY,
      };

      setCurrentPrompt(prompt);
      lastPromptRef.current = prompt;

      await chat.sendMessage({ text: prompt }, { body: { context } });
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      creds,
      chat.sendMessage,
      issuedKeys,
      tasks,
      address,
      usdcBal?.formatted,
      monBal?.formatted,
      setCurrentPrompt,
    ],
  );

  const cancel = useCallback(() => {
    chat.stop();
    startedRef.current = false;
    purchaseStartedRef.current = false;
    resetWorkflow();
  }, [chat.stop, resetWorkflow]);

  /** Reset chat history (e.g. when user clicks "New task"). */
  const clear = useCallback(() => {
    chat.setMessages([]);
    startedRef.current = false;
    purchaseStartedRef.current = false;
    seenIds.current.clear();
    taskIdRef.current = undefined;
    lastPromptRef.current = "";
  }, [chat.setMessages]);

  return {
    start,
    cancel,
    clear,
    messages: chat.messages,
    /** True when at least one supported model key is configured. */
    isAvailable: !!creds,
    isStreaming: chat.status === "streaming" || chat.status === "submitted",
  };
}
