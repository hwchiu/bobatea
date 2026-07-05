// lib/studioClient.ts — 統一 FastAPI 後端 client（connector registry / DAG / dry-run）
import { API_BASE } from "./apiClient";
import type { ChainSpec, Stage, ValidationIssue } from "./chainTypes";
import type { DagConfig, RequestConfig, SchemaField } from "./types";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

/** 觸發瀏覽器下載後端回傳的檔案（Content-Disposition attachment） */
async function download(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  const disposition = res.headers.get("content-disposition") ?? "";
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? "airflow_dag.py";
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ApiCrawlerSpec {
  type: "api_crawler";
  request: RequestConfig;
  fields: SchemaField[];
  dagConfig: DagConfig;
}

export const studio = {
  // ── connector registry ──
  listConnectors: (type?: string) =>
    req<{ connector_id: string; connector_type: string; description: string; status: string; updated_at: string; spec: Record<string, unknown> }[]>(
      `/api/connectors${type ? `?connector_type=${type}` : ""}`),
  getConnector: (id: string) => req<{ spec: ChainSpec; status: string }>(`/api/connectors/${id}`),
  deleteConnector: (id: string) => req(`/api/connectors/${id}`, { method: "DELETE" }),

  // ── prompt_chain ──
  saveChain: (spec: ChainSpec) =>
    req(`/api/connectors/prompt-chain/${spec.chain_id}`, { method: "PUT", body: JSON.stringify(spec) }),
  validateChain: (spec: ChainSpec) =>
    req<{ valid: boolean; issues: ValidationIssue[] }>(`/api/connectors/prompt-chain/${spec.chain_id}/validate`, { method: "POST", body: JSON.stringify(spec) }),
  publishChain: (spec: ChainSpec) =>
    req(`/api/connectors/prompt-chain/${spec.chain_id}/publish`, { method: "POST", body: JSON.stringify(spec) }),
  chainDag: (spec: ChainSpec) =>
    req<{ filename: string; dag_code: string }>("/api/dag/prompt-chain", { method: "POST", body: JSON.stringify(spec) }),
  downloadChainDag: (spec: ChainSpec) => download("/api/dag/prompt-chain/download", spec),
  dryRunStage: (stage: Stage, defaults: ChainSpec["defaults"], mockInputs: Record<string, unknown>, params: Record<string, unknown>, chainId: string) =>
    req<Record<string, unknown>>("/api/dryrun/stage", {
      method: "POST",
      body: JSON.stringify({ stage, defaults, mock_inputs: mockInputs, params, chain_id: chainId }),
    }),

  // ── api_crawler ──
  saveApiCrawler: (id: string, spec: ApiCrawlerSpec) =>
    req(`/api/connectors/api-crawler/${id}`, { method: "PUT", body: JSON.stringify(spec) }),
  apiCrawlerDag: (spec: ApiCrawlerSpec) =>
    req<{ filename: string; dag_code: string }>("/api/dag/api-crawler", { method: "POST", body: JSON.stringify(spec) }),
  downloadApiCrawlerDag: (spec: ApiCrawlerSpec) => download("/api/dag/api-crawler/download", spec),
};
