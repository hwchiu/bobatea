// lib/studioClient.ts — 統一 FastAPI 後端 client（connector registry / DAG / dry-run）
import { API_BASE } from "./apiClient";
import type { ChainSpec, Stage, ValidationIssue } from "./chainTypes";
import type { ApiCrawlerSpec } from "./types";
import {
  isMissingBackendResponse,
  isUnavailableBackendError,
  studioFallback,
} from "./backendFallback";

async function req<T>(
  path: string,
  init: RequestInit | undefined,
  fallback?: () => T | Promise<T>,
): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (fallback && isMissingBackendResponse(res)) return fallback();
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  } catch (error) {
    if (fallback && isUnavailableBackendError(error)) return fallback();
    throw error;
  }
}

/** 觸發瀏覽器下載後端回傳的檔案（Content-Disposition attachment） */
async function download(
  path: string,
  body: unknown,
  fallback?: () => void | Promise<void>,
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (fallback && isMissingBackendResponse(res)) return fallback();
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
  } catch (error) {
    if (fallback && isUnavailableBackendError(error)) return fallback();
    throw error;
  }
}

export const studio = {
  // ── connector registry ──
  listConnectors: (type?: string) =>
    req<{ connector_id: string; connector_type: string; description: string; status: string; updated_at: string; spec: unknown }[]>(
      `/api/connectors${type ? `?connector_type=${type}` : ""}`,
      undefined,
      () => studioFallback.listConnectors(type)),
  getConnector: (id: string) => req<{ spec: ChainSpec; status: string }>(`/api/connectors/${id}`, undefined, () => studioFallback.getConnector(id)),
  deleteConnector: (id: string) => req(`/api/connectors/${id}`, { method: "DELETE" }, () => studioFallback.deleteConnector(id)),

  // ── prompt_chain ──
  saveChain: (spec: ChainSpec) =>
    req(`/api/connectors/prompt-chain/${spec.chain_id}`, { method: "PUT", body: JSON.stringify(spec) }, () => studioFallback.saveChain(spec)),
  validateChain: (spec: ChainSpec) =>
    req<{ valid: boolean; issues: ValidationIssue[] }>(
      `/api/connectors/prompt-chain/${spec.chain_id}/validate`,
      { method: "POST", body: JSON.stringify(spec) },
      () => studioFallback.validateChain(spec),
    ),
  publishChain: (spec: ChainSpec) =>
    req(`/api/connectors/prompt-chain/${spec.chain_id}/publish`, { method: "POST", body: JSON.stringify(spec) }, () => studioFallback.publishChain(spec)),
  chainDag: (spec: ChainSpec) =>
    req<{ filename: string; dag_code: string }>(
      "/api/dag/prompt-chain",
      { method: "POST", body: JSON.stringify(spec) },
      () => studioFallback.chainDag(spec),
    ),
  downloadChainDag: (spec: ChainSpec) =>
    download("/api/dag/prompt-chain/download", spec, () => studioFallback.downloadChainDag(spec)),
  dryRunStage: (stage: Stage, defaults: ChainSpec["defaults"], mockInputs: Record<string, unknown>, params: Record<string, unknown>, chainId: string) =>
    req<Record<string, unknown>>("/api/dryrun/stage", {
      method: "POST",
      body: JSON.stringify({ stage, defaults, mock_inputs: mockInputs, params, chain_id: chainId }),
    }, () => studioFallback.dryRunStage(stage, defaults, mockInputs, params, chainId)),

  // ── api_crawler ──
  saveApiCrawler: (id: string, spec: ApiCrawlerSpec) =>
    req(`/api/connectors/api-crawler/${id}`, { method: "PUT", body: JSON.stringify(spec) }, () => studioFallback.saveApiCrawler(id, spec)),
  apiCrawlerDag: (spec: ApiCrawlerSpec) =>
    req<{ filename: string; dag_code: string }>(
      "/api/dag/api-crawler",
      { method: "POST", body: JSON.stringify(spec) },
      () => studioFallback.apiCrawlerDag(spec),
    ),
  downloadApiCrawlerDag: (spec: ApiCrawlerSpec) =>
    download("/api/dag/api-crawler/download", spec, () => studioFallback.downloadApiCrawlerDag(spec)),
};
