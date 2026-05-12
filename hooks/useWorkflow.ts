"use client";

import { useCallback, useRef } from "react";
import { useAppStore, type PaymentIntent } from "@/stores/useAppStore";
import { WORKFLOW_STEPS } from "@/lib/mock/workflow";
import {
  pickShortlist,
  pickCheapestFrom,
} from "@/lib/providers/catalog";
import { sleep, buildTaskRef } from "@/lib/utils";
import { getMerchantAddress } from "@/lib/contract";

export function useWorkflow() {
  const cancelRef = useRef(false);
  const {
    setWorkflowState,
    setActiveStepIndex,
    setSelectedProvider,
    setCurrentPrompt,
    setCurrentTaskId,
    setPaymentIntent,
    resetWorkflow,
    addTask,
    updateTask,
  } = useAppStore();

  const start = useCallback(
    async (prompt: string) => {
      cancelRef.current = false;
      setCurrentPrompt(prompt);
      setWorkflowState("running");
      setActiveStepIndex(-1);

      const task = {
        id: `task_${Date.now()}`,
        prompt,
        status: "running" as const,
        createdAt: Date.now(),
      };
      addTask(task);
      setCurrentTaskId(task.id);

      for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
        if (cancelRef.current) return;
        setActiveStepIndex(i);
        const step = WORKFLOW_STEPS[i];

        // when entering "selecting", lock in the cheapest provider and persist it on the task
        if (step.id === "selecting") {
          const chosen = pickCheapestFrom(pickShortlist(prompt));
          setSelectedProvider(chosen.id);
          updateTask(task.id, { selectedProvider: chosen });

          // Build the payment intent so the Approve button has all the data it needs
          const intent: PaymentIntent = {
            providerId: chosen.id,
            providerName: chosen.name,
            amountUsdc: chosen.priceUsdc,
            recipient: getMerchantAddress(),
            reason: `Purchase ${chosen.name} — ${chosen.tagline}`,
            taskRef: buildTaskRef(chosen.id),
          };
          setPaymentIntent(intent);
        }

        if (step.id === "awaiting_approval") {
          setWorkflowState("awaiting_approval");
          updateTask(task.id, { status: "awaiting_approval" });
          return;
        }
        await sleep(step.duration);
      }
    },
    [
      addTask,
      setActiveStepIndex,
      setCurrentPrompt,
      setCurrentTaskId,
      setSelectedProvider,
      setPaymentIntent,
      setWorkflowState,
      updateTask,
    ]
  );

  const cancel = useCallback(() => {
    cancelRef.current = true;
    resetWorkflow();
  }, [resetWorkflow]);

  return { start, cancel };
}
