// components/company-identity/CompanyIdentityWorkspace.tsx
"use client";

import { useEffect, useState } from "react";
import GraphView from "./GraphView";
import TimelineView from "./TimelineView";
import DecisionsView from "./DecisionsView";
import RegistryView from "./RegistryView";
import ResolutionQueueView from "./ResolutionQueueView";
import OntologyView from "./OntologyView";
import LineageView from "./LineageView";
import DetailPanel from "./DetailPanel";
import type { CompanyNode } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

type Tab = "graph" | "timeline" | "decisions" | "registry" | "resolution" | "ontology" | "lineage";

const TABS: { key: Tab; label: string }[] = [
  { key: "graph", label: "Knowledge graph" },
  { key: "timeline", label: "Timeline" },
  { key: "decisions", label: "Decisions" },
  { key: "registry", label: "Registry" },
  { key: "resolution", label: "Entity resolution" },
  { key: "ontology", label: "Ontology hub" },
  { key: "lineage", label: "Lineage" },
];

export default function CompanyIdentityWorkspace() {
  const [tab, setTab] = useState<Tab>("graph");
  const [selected, setSelected] = useState<CompanyNode | null>(null);
  const [noteOpen, setNoteOpen] = useState(true);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    companyIdentityApi.companies().then((rows) => {
      setNameMap(Object.fromEntries(rows.map((r) => [r.fab_code, r.name])));
    });
  }, []);

  const nameFor = (fabCode: string) => nameMap[fabCode] ?? fabCode;

  return (
    <div className="ci-layout">
      {noteOpen && (
        <div className="ci-scope-note">
          <span className="dot" />
          此為 UI/UX 原型 —— 分類與地區為真實資訊,confidence/來源標記/決策紀錄為合成示意資料。
          <button onClick={() => setNoteOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>×</button>
        </div>
      )}

      <div className="ci-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className={`ci-body ${tab === "graph" ? "no-scroll" : ""}`}>
        {tab === "graph" && <GraphView onSelect={setSelected} />}
        {tab === "timeline" && <TimelineView />}
        {tab === "decisions" && <DecisionsView />}
        {tab === "registry" && <RegistryView onSelect={setSelected} />}
        {tab === "resolution" && <ResolutionQueueView nameFor={nameFor} />}
        {tab === "ontology" && <OntologyView />}
        {tab === "lineage" && <LineageView />}
      </div>

      <DetailPanel company={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
