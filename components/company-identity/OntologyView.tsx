// components/company-identity/OntologyView.tsx
"use client";

import { useEffect, useState } from "react";
import type { Ontology } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function OntologyView() {
  const [ontology, setOntology] = useState<Ontology | null>(null);

  useEffect(() => { companyIdentityApi.ontology().then(setOntology); }, []);

  if (!ontology) return <div className="ci-pane" />;

  return (
    <div className="ci-pane">
      <h2>Ontology hub</h2>
      <p className="hint">定義「什麼算同一家公司」「哪些關係型態合法」的 schema,讓 Company Identity Graph 有機器可驗證的規則,而不只是開發者共識。</p>

      <div className="ci-ont-grid">
        <div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10 }}>Node types</div>
          {ontology.node_types.map((n) => (
            <div key={n.key} className="ci-ont-item">
              <span className="sw" />
              <div><div className="name">{n.key}</div><div className="def">{n.def}</div></div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10 }}>Relationship types</div>
          {ontology.edge_types.map((e) => (
            <div key={e.rel} className="ci-ont-edge">
              <span>Company</span><span className="rel">{e.rel}</span><span>Company</span> — {e.def}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>Validation rules (SHACL-inspired)</div>
        {ontology.rules.map((r) => (
          <div key={r.id} className="ci-rule"><span className="id">{r.id}</span>{r.text}</div>
        ))}
      </div>
    </div>
  );
}
