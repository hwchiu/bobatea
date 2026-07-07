// lib/settingsClient.ts — Settings（Company Config / System Parameters）API client
import { API_BASE } from "./apiClient";

export interface FieldDef {
  key: string; label: string; required?: boolean;
  type: "text" | "number" | "select" | "fk";
  options?: string[]; hint?: string; default?: string;
}
export interface ScopeSchema { id: string; label: string; key_field?: string; fields: FieldDef[] }
export interface SettingsSchema {
  company_master: ScopeSchema;
  providers: Record<string, ScopeSchema>;
  system_params: ScopeSchema;
}
export type Row = Record<string, string | number | null | undefined>;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/settings${path}`, {
    headers: init?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try { const j = await res.json(); msg = Array.isArray(j.detail) ? j.detail.join("; ") : (j.detail ?? msg); }
    catch { /* keep status */ }
    throw new Error(msg);
  }
  return res.json();
}

export const settingsApi = {
  schema: () => req<SettingsSchema>("/schema"),

  list: (scope: string) =>
    scope === "company_master" ? req<Row[]>("/company-master")
    : scope === "system_params" ? req<Row[]>("/system-params")
    : req<Row[]>(`/providers/${scope}/records`),

  upsert: (scope: string, key: string, row: Row) =>
    scope === "company_master" ? req(`/company-master/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify(row) })
    : scope === "system_params" ? req(`/system-params/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify(row) })
    : req(`/providers/${scope}/records/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify(row) }),

  remove: (scope: string, key: string) =>
    scope === "company_master" ? req(`/company-master/${encodeURIComponent(key)}`, { method: "DELETE" })
    : scope === "system_params" ? req(`/system-params/${encodeURIComponent(key)}`, { method: "DELETE" })
    : req(`/providers/${scope}/records/${encodeURIComponent(key)}`, { method: "DELETE" }),

  templateUrl: (scope: string) => `${API_BASE}/api/settings/${scope}/template`,

  upload: (scope: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return req<{ status: string; message?: string; upserted?: number;
                 report: { row: number; key?: string; errors: string[] }[] }>(
      `/${scope}/upload`, { method: "POST", body: fd });
  },
};
