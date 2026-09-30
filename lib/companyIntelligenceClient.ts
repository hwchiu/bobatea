import { API_BASE } from "./apiClient";
import { isMissingBackendResponse, isUnavailableBackendError } from "./backendFallback";
import type { Row } from "./settingsClient";
import type { CompanyProfile, ProviderIdentity } from "./companyIntelligenceTypes";

export const PROVIDERS = [
  { id: "bloomberg", label: "Bloomberg", key: "bbg_id", field: "BBG ID (FIGI)", secondary: ["ticker"] },
  { id: "dnb", label: "D&B", key: "duns_number", field: "DUNS Number", secondary: [] },
  { id: "pitchbook", label: "PitchBook", key: "pitchbook_id", field: "PitchBook ID", secondary: [] },
  { id: "factset", label: "FactSet", key: "factset_entity_id", field: "FactSet ID", secondary: ["ticker_region"] },
  { id: "snp", label: "S&P", key: "spciq_id", field: "S&P Capital IQ ID", secondary: ["snp_ticker"] },
  { id: "contify", label: "Contify", key: "contify_company_id", field: "Contify Company ID", secondary: [] },
] as const;

type DemoCompany = Row & { providers: Record<string, Row> };
let demoCache: Promise<DemoCompany[]> | null = null;

async function demos(): Promise<DemoCompany[]> {
  if (!demoCache) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bobatea";
    demoCache = fetch(`${base}/company-directory.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Demo directory: ${res.status}`);
        return res.json() as Promise<{ companies: DemoCompany[] }>;
      })
      .then((data) => data.companies)
      .catch((error) => { demoCache = null; throw error; });
  }
  return demoCache;
}

async function rows(path: string): Promise<Row[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/settings${path}`, { signal: AbortSignal.timeout(5000) });
    if (isMissingBackendResponse(res) || res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  } catch (error) {
    if (isUnavailableBackendError(error) || (error instanceof Error && error.name === "TimeoutError")) return null;
    throw error;
  }
}

export const companyIntelligenceApi = {
  async search(query: string, providerId: string): Promise<CompanyProfile[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) throw new Error("Unknown data provider");

    // ponytail: only fetch the selected provider, not every provider on each search.
    const [master, mappings] = await Promise.all([
      rows("/company-master"),
      rows(`/providers/${provider.id}/records`),
    ]);
    const fallback = !master?.length || !mappings?.length;
    const sample = fallback ? await demos() : [];
    const companies = fallback ? sample : master!;
    const records: Row[] = fallback ? sample.map((c): Row => ({
      fab_code: c.fab_code, ...c.providers[provider.id],
    })).filter((r) => r[provider.key]) : mappings!;

    return companies.flatMap((company): CompanyProfile[] => {
      const fabCode = String(company.fab_code ?? "");
      const row = records.find((r) => String(r.fab_code) === fabCode);
      const value = row?.[provider.key];
      if (!value) return [];
      const identity: ProviderIdentity = {
        providerId: provider.id,
        providerLabel: provider.label,
        primaryField: provider.field,
        primaryValue: String(value),
        secondary: provider.secondary.filter((key) => row[key]).map((key) => ({ field: key, value: String(row[key]) })),
        status: row.status === "inactive" ? "inactive" : "active",
      };
      const matches = [
        company.company_name, company.company_short_name,
      ].some((v) => String(v ?? "").toLowerCase().includes(q));
      return matches ? [{
        fabCode, name: String(company.company_name ?? fabCode),
        shortName: String(company.company_short_name ?? fabCode),
        country: String(company.country ?? ""), region: String(company.region ?? ""),
        status: company.status === "inactive" ? "inactive" : "active",
        identities: [identity],
      }] : [];
    });
  },
};
