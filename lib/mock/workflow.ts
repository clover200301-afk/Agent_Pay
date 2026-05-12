import type { WorkflowStep } from "@/types/workflow";

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "understanding",
    title: "Understanding request",
    detail: "Parsing intent and constraints",
    duration: 700,
  },
  {
    id: "searching",
    title: "Searching providers",
    detail: "Querying agent marketplace",
    duration: 900,
  },
  {
    id: "comparing",
    title: "Comparing pricing",
    detail: "Ranking by USDC unit cost",
    duration: 900,
  },
  {
    id: "evaluating",
    title: "Evaluating reliability",
    detail: "Cross-checking uptime & ratings",
    duration: 800,
  },
  {
    id: "selecting",
    title: "Selecting provider",
    detail: "Choosing optimal candidate",
    duration: 700,
  },
  {
    id: "preparing",
    title: "Preparing transaction",
    detail: "Building Monad calldata",
    duration: 800,
  },
  {
    id: "awaiting_approval",
    title: "Awaiting approval",
    detail: "Requires human signature",
    duration: 0,
  },
];

export const EXAMPLE_PROMPTS = [
  "Buy the cheapest image generation API under 5 USDC",
  "Purchase GPT API credits for the next 30 days",
  "Find a translation API with sub-200ms latency",
  "Renew my AI tool subscription if price < 12 USDC",
];
