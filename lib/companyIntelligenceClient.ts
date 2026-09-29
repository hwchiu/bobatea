// lib/companyIntelligenceClient.ts — Company Intelligence API client
// Dual-mode like companyIdentityClient.ts: hits the live Settings API (Company Master +
// per-provider records) when a backend is reachable, and falls back to the offline mock
// dataset on GitHub Pages (static, no backend). Both sides share the exact same shape,
// so switching workspaces never changes what data a company's provider identities resolve to.
import { API_BASE } from "./apiClient";
import { isMissingBackendResponse, isUnavailableBackendError } from "./backendFallback";
import type { Row } from "./settingsClient";
import type { CompanyProfile, ProviderIdentity } from "./companyIntelligenceTypes";
import { mockCompanyMaster, mockProviderRecords } from "@/data/mockCompanyIntelligence";

// ponytail: primary/secondary identifier fields per provider are fixed by the backend
// schema (backend/app/routers/settings/defaults.py) — hardcoding them here avoids pulling
// in the full generic FieldDef schema just to know which field is "the" identifier.
const PROVIDER_META: {
  id: string; label: string; primaryKey: string; primaryLabel: string;
  secondaryKeys: { key: string; label: string }[];
}[] = [
  { id: "bloomberg", label: "Bloomberg", primaryKey: "bbg_id", primaryLabel: "BBG ID (FIGI)",
    secondaryKeys: [{ key: "ticker", label: "Ticker" }, { key: "exchange_code", label: "Exchange" }] },
  { id: "factset", label: "FactSet", primaryKey: "factset_entity_id", primaryLabel: "FactSet ID",
    secondaryKeys: [{ key: "ticker_region", label: "Ticker-Region" }] },
  { id: "dnb", label: "D&B", primaryKey: "duns_number", primaryLabel: "DUNS Number",
    secondaryKeys: [{ key: "global_ultimate_duns", label: "Global Ultimate DUNS" }] },
  { id: "snp", label: "S&P", primaryKey: "spciq_id", primaryLabel: "S&P Capital IQ ID",
    secondaryKeys: [{ key: "snp_ticker", label: "Ticker" }, { key: "gvkey", label: "GVKEY" }] },
  { id: "contify", label: "Contify", primaryKey: "contify_company_id", primaryLabel: "Contify Company ID",
    secondaryKeys: [{ key: "topics", label: "Topics" }] },
];

async function fetchJson<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}/api/settings${path}`, { headers: { "Content-Type": "application/json" } });
    if (isMissingBackendResponse(res)) return fallback();
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  } catch (error) {
    if (isUnavailableBackendError(error)) return fallback();
    throw error;
  }
}

let cache: Promise<CompanyProfile[]> | null = null;

async function loadProfiles(): Promise<CompanyProfile[]> {
  const companies = await fetchJson<Row[]>("/company-master", () => mockCompanyMaster);
  const providerRows = await Promise.all(
    PROVIDER_META.map((p) => fetchJson<Row[]>(`/providers/${p.id}/records`, () => mockProviderRecords[p.id] ?? [])),
  );

  return companies.map((c): CompanyProfile => {
    const fabCode = String(c.fab_code ?? "");
    const identities: ProviderIdentity[] = [];

    PROVIDER_META.forEach((meta, i) => {
      const row = providerRows[i].find((r) => String(r.fab_code) === fabCode);
      const primaryValue = row?.[meta.primaryKey];
      if (!row || !primaryValue) return;
      identities.push({
        providerId: meta.id,
        providerLabel: meta.label,
        primaryField: meta.primaryLabel,
        primaryValue: String(primaryValue),
        secondary: meta.secondaryKeys
          .filter((s) => row[s.key])
          .map((s) => ({ field: s.label, value: String(row[s.key]) })),
        status: row.status === "inactive" ? "inactive" : "active",
      });
    });

    return {
      fabCode,
      name: String(c.company_name ?? fabCode),
      shortName: String(c.company_short_name ?? c.company_name ?? fabCode),
      country: String(c.country ?? ""),
      region: String(c.region ?? ""),
      status: c.status === "inactive" ? "inactive" : "active",
      identities,
    };
  });
}

export const companyIntelligenceApi = {
  profiles(): Promise<CompanyProfile[]> {
    if (!cache) cache = loadProfiles().catch((error) => { cache = null; throw error; });
    return cache;
  },

  async search(query: string): Promise<CompanyProfile[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const profiles = await companyIntelligenceApi.profiles();
    return profiles.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.fabCode.toLowerCase().includes(q) ||
      p.identities.some((id) =>
        id.primaryValue.toLowerCase().includes(q) ||
        (id.secondary ?? []).some((s) => s.value.toLowerCase().includes(q)),
      ),
    );
  },
};
