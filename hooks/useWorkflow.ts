"use client";

import { useCallback, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { WORKFLOW_STEPS } from "@/lib/mock/workflow";
import { MOCK_PROVIDERS, pickCheapest } from "@/lib/mock/providers";
import { sleep } from "@/lib/utils";

export function useWorkflow() {
  const cancelRef = useRef(false);
  const {
    setWorkflowState,
    setActiveStepIndex,
    setSelectedProvider,
    setCurrentPrompt,
    setCurrentTaskId,
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
          const chosen = pickCheapest(MOCK_PROVIDERS);
          setSelectedProvider(chosen.id);
          updateTask(task.id, { selectedProvider: chosen });
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
