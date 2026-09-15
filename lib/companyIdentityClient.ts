// lib/companyIdentityClient.ts — Company Identity Intelligence API client
// 跟 studioClient.ts 同樣的雙模式：有 FastAPI 後端就打 API，
// 部署在 GitHub Pages（純靜態,無後端）時自動退回 data/mockCompanyIdentity.ts。
import { API_BASE } from "./apiClient";
import { isMissingBackendResponse, isUnavailableBackendError } from "./backendFallback";
import type {
  CompanyNode, TimelineEvent, IdentityDecision, ResolutionCandidate, Ontology, LineageInfo,
} from "./companyIdentityTypes";
import {
  mockCompanies, mockTimeline, mockDecisions, mockResolutionQueue, mockOntology,
} from "@/data/mockCompanyIdentity";

const LS_RESOLUTION_STATUS = "bobatea-offline-resolution-status";

async function req<T>(path: string, init: RequestInit | undefined, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}/api/company-identity${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (isMissingBackendResponse(res)) return fallback();
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  } catch (error) {
    if (isUnavailableBackendError(error)) return fallback();
    throw error;
  }
}

function loadOfflineStatus(): Record<number, ResolutionCandidate["status"]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_RESOLUTION_STATUS) ?? "{}");
  } catch {
    return {};
  }
}

function saveOfflineStatus(id: number, status: ResolutionCandidate["status"]): void {
  if (typeof window === "undefined") return;
  const current = loadOfflineStatus();
  current[id] = status;
  localStorage.setItem(LS_RESOLUTION_STATUS, JSON.stringify(current));
}

export const companyIdentityApi = {
  companies: () => req<CompanyNode[]>("/companies", undefined, () => mockCompanies),

  timeline: () => req<TimelineEvent[]>("/edges/timeline", undefined, () => mockTimeline),

  decisions: () => req<IdentityDecision[]>("/decisions", undefined, () => mockDecisions),

  resolutionQueue: () =>
    req<ResolutionCandidate[]>("/resolution-queue", undefined, () => {
      const offlineStatus = loadOfflineStatus();
      return mockResolutionQueue.map((r) => ({ ...r, status: offlineStatus[r.id] ?? r.status }));
    }),

  updateResolutionStatus: (id: number, status: ResolutionCandidate["status"]) =>
    req<{ id: number; status: string }>(
      `/resolution-queue/${id}`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      () => {
        saveOfflineStatus(id, status);
        return { id, status };
      },
    ),

  ontology: () => req<Ontology>("/ontology", undefined, () => mockOntology),

  lineage: (fabCode: string) =>
    req<LineageInfo>(`/lineage/${encodeURIComponent(fabCode)}`, undefined, () => {
      const company = mockCompanies.find((c) => c.fab_code === fabCode);
      return {
        fab_code: fabCode,
        name: company?.name ?? fabCode,
        primary_source: company?.source ?? null,
        confidence: company?.confidence ?? null,
        category: company?.category ?? null,
        provider_records: [],
        updated_at: null,
      };
    }),
};
