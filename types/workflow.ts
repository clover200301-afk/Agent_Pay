export type WorkflowStepId =
  | "understanding"
  | "searching"
  | "comparing"
  | "evaluating"
  | "selecting"
  | "preparing"
  | "awaiting_approval";

export type WorkflowStepStatus = "pending" | "processing" | "success";

export interface WorkflowStep {
  id: WorkflowStepId;
  title: string;
  detail?: string;
  duration: number;
}

export type WorkflowState =
  | "idle"
  | "running"
  | "awaiting_approval"
  | "paying"
  | "success"
  | "issue_failed"
  | "rejected";
