// lib/companyIdentityTypes.ts
export type SupplyChainCategory =
  | "hub" | "foundry" | "equipment" | "materials" | "eda_ip"
  | "fabless" | "osat" | "substrate" | "test_assembly";

export interface CompanyNode {
  fab_code: string;
  name: string;
  category: SupplyChainCategory;
  category_label: string;
  country: string;
  confidence: number;
  source: string;
  edge_type: string | null;
}

export interface TimelineEvent {
  source_fab_code: string;
  target_fab_code: string;
  edge_type: string;
  valid_from: string;
  valid_until: string | null;
  label: string;
}

export interface IdentityDecision {
  id: string;
  category: string;
  scenario: string;
  reasoning: string;
  outcome: string;
  confidence: number;
  model: string;
}

export interface ResolutionCandidate {
  id: number;
  fab_code_a: string;
  fab_code_b: string;
  suggested_relation: string;
  note: string;
  evidence: string[];
  status: "pending" | "confirmed" | "rejected";
}

export interface OntologyNodeType {
  key: string;
  def: string;
}
export interface OntologyEdgeType {
  rel: string;
  def: string;
}
export interface OntologyRule {
  id: string;
  text: string;
}
export interface Ontology {
  node_types: OntologyNodeType[];
  edge_types: OntologyEdgeType[];
  rules: OntologyRule[];
}

export interface ProviderRecordEntry {
  provider: string;
  attrs: Record<string, unknown>;
  updated_at: string;
}

export interface LineageInfo {
  fab_code: string;
  name: string;
  primary_source: string | null;
  confidence: number | null;
  category: string | null;
  provider_records: ProviderRecordEntry[];
  updated_at: string | null;
}

export const CATEGORY_COLOR: Record<SupplyChainCategory, string> = {
  hub: "#5b85e8",
  foundry: "#e06060",
  equipment: "#e5a050",
  materials: "#6bbd72",
  eda_ip: "#b388e8",
  fabless: "#5bc8be",
  osat: "#7b9ee8",
  substrate: "#6da79a",
  test_assembly: "#a08b76",
};
