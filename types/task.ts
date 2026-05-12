import type { Provider } from "./provider";

export type TaskStatus =
  | "running"
  | "awaiting_approval"
  | "paying"
  | "completed"
  | "rejected";

export interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  selectedProvider?: Provider;
  txHash?: string;
  apiKey?: string;
}
