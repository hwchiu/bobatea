// lib/companyIntelligenceTypes.ts
export interface ProviderIdentity {
  providerId: string;      // e.g. "bloomberg"
  providerLabel: string;   // e.g. "Bloomberg"
  primaryField: string;    // label of the key identifier field, e.g. "BBG ID (FIGI)"
  primaryValue: string;    // the identifier value, e.g. "BBG000B9XRY4"
  secondary?: { field: string; value: string }[]; // extra fields worth showing (ticker, GVKEY, ...)
  status: "active" | "inactive";
}

export interface CompanyProfile {
  fabCode: string;         // company master primary key, shared FK across providers
  name: string;
  shortName: string;
  country: string;
  region: string;
  status: "active" | "inactive";
  identities: ProviderIdentity[];
}

export interface CollectionEntry {
  id: string;              // `${fabCode}::${providerId}`
  fabCode: string;
  companyName: string;
  providerId: string;
  providerLabel: string;
  identifier: string;
  dataset: string;
  status: "ready" | "queued" | "running";
  addedAt: string; // ISO
}
