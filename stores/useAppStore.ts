"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Provider } from "@/types/provider";
import type { Task } from "@/types/task";
import type { WorkflowState } from "@/types/workflow";
import {
  safeJsonStorage,
  scopedName,
} from "@/lib/storage/scopedStorage";

export const APP_STORE_BASE = "agentpay-store";

/**
 * Payment intent produced by the agent (via the `proposePayment` tool).
 * Drives the PaymentPanel —— recipient / amount / on-chain task ref.
 */
export interface PaymentIntent {
  providerId: string;
  providerName: string;
  amountUsdc: number;
  recipient: string;
  reason: string;
  /** bytes32 hex used as the on-chain taskId argument. */
  taskRef: string;
}

interface AppState {
  hydrated: boolean;
  setHydrated: () => void;

  // workflow
  workflowState: WorkflowState;
  activeStepIndex: number;
  selectedProviderId?: string;
  currentPrompt: string;
  currentTaskId?: string;
  setWorkflowState: (s: WorkflowState) => void;
  setActiveStepIndex: (i: number) => void;
  setSelectedProvider: (id: string) => void;
  setCurrentPrompt: (p: string) => void;
  setCurrentTaskId: (id?: string) => void;

  // payment intent (set by /api/agent's proposePayment tool result)
  paymentIntent?: PaymentIntent;
  setPaymentIntent: (i?: PaymentIntent) => void;

  // tx (two-step USDC: approve hash + pay hash)
  approveTxHash?: string;
  txHash?: string;
  apiKey?: string;
  setApproveTxHash: (h?: string) => void;
  setTxHash: (h?: string) => void;
  setApiKey: (k?: string) => void;

  // tasks
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;

  // history review
  viewingTaskId?: string;
  setViewingTaskId: (id?: string) => void;

  resetWorkflow: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      workflowState: "idle",
      activeStepIndex: -1,
      selectedProviderId: undefined,
      currentPrompt: "",
      currentTaskId: undefined,
      setWorkflowState: (s) => set({ workflowState: s }),
      setActiveStepIndex: (i) => set({ activeStepIndex: i }),
      setSelectedProvider: (id) => set({ selectedProviderId: id }),
      setCurrentPrompt: (p) => set({ currentPrompt: p }),
      setCurrentTaskId: (id) => set({ currentTaskId: id }),

      paymentIntent: undefined,
      setPaymentIntent: (i) => set({ paymentIntent: i }),

      approveTxHash: undefined,
      txHash: undefined,
      apiKey: undefined,
      setApproveTxHash: (h) => set({ approveTxHash: h }),
      setTxHash: (h) => set({ txHash: h }),
      setApiKey: (k) => set({ apiKey: k }),

      tasks: [],
      addTask: (t) => set((st) => ({ tasks: [t, ...st.tasks].slice(0, 20) })),
      updateTask: (id, patch) =>
        set((st) => ({
          tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      viewingTaskId: undefined,
      setViewingTaskId: (id) => set({ viewingTaskId: id }),

      resetWorkflow: () =>
        set({
          workflowState: "idle",
          activeStepIndex: -1,
          selectedProviderId: undefined,
          currentPrompt: "",
          currentTaskId: undefined,
          paymentIntent: undefined,
          approveTxHash: undefined,
          txHash: undefined,
          apiKey: undefined,
          viewingTaskId: undefined,
        }),
    }),
    {
      name: scopedName(APP_STORE_BASE),
      storage: safeJsonStorage as never,
      partialize: (s) => ({ tasks: s.tasks }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export function getSelectedProvider(
  providers: Provider[],
  id: string | undefined
) {
  return providers.find((p) => p.id === id);
}
