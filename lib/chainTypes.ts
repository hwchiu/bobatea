// lib/chainTypes.ts — Prompt Chain DSL 型別（對齊 backend/app/schemas.py）
export type StageType = "ai_call" | "transform" | "sink";

export interface Stage {
  id: string;
  type: StageType;
  depends_on: string[];
  prompt?: { system?: string; user: string };
  output_schema?: Record<string, unknown>;
  model_override?: Record<string, unknown>;
  map_over?: string;
  max_parallel?: number;
  on_schema_violation?: "retry_with_repair" | "fail" | "skip";
  engine?: "jsonpath" | "jinja" | "python";
  spec?: Record<string, unknown>;
  target?: { kind: string; connection: string; table: string; mode: string };
  payload?: string;
  ui?: { x: number; y: number };
}

export interface ChainSpec {
  type: "prompt_chain";
  chain_id: string;
  version: string;
  owner: string;
  description: string;
  schedule: { cron: string; timezone: string; catchup: boolean };
  defaults: {
    provider: string; model: string; temperature: number; max_tokens: number;
    search_options: Record<string, unknown>;
  };
  params: Record<string, unknown>;
  stages: Stage[];
  governance: { cost_budget_usd_per_run: number; pii_detection: boolean; citation_capture: boolean };
}

export interface ValidationIssue { level: "error" | "warning"; stage_id?: string; message: string }

export const emptyChain = (id: string): ChainSpec => ({
  type: "prompt_chain", chain_id: id, version: "0.1", owner: "", description: "",
  schedule: { cron: "0 6 * * *", timezone: "Asia/Taipei", catchup: false },
  defaults: { provider: "perplexity", model: "sonar-pro", temperature: 0.2, max_tokens: 4000, search_options: {} },
  params: {}, stages: [],
  governance: { cost_budget_usd_per_run: 2.0, pii_detection: true, citation_capture: true },
});
