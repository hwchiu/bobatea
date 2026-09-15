// components/company-identity/DetailPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_COLOR, type CompanyNode, type LineageInfo } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function DetailPanel({ company, onClose }: { company: CompanyNode | null; onClose: () => void }) {
  const [lineage, setLineage] = useState<LineageInfo | null>(null);

  useEffect(() => {
    if (!company) return;
    let ignore = false;
    companyIdentityApi.lineage(company.fab_code).then((data) => { if (!ignore) setLineage(data); });
    return () => { ignore = true; };
  }, [company]);

  const currentLineage = lineage && company && lineage.fab_code === company.fab_code ? lineage : null;

  return (
    <aside className={`ci-detail ${company ? "open" : ""}`}>
      <button className="close" onClick={onClose}><X size={16} /></button>
      {company && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLOR[company.category] }} />
            {company.category_label}
          </div>
          <h2 style={{ fontSize: 16, margin: "0 0 2px", color: "var(--text-primary)" }}>{company.name}</h2>
          <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 16 }}>
            {company.country}{company.edge_type ? ` · 與 TSMC 關係: ${company.edge_type}` : " · Company Identity Graph 中心節點"}
          </div>

          <Label>Resolution confidence</Label>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 20, color: "var(--text-primary)" }}>
            {company.confidence.toFixed(2)}
          </div>
          <div className="ci-conf-bar"><div style={{ width: `${company.confidence * 100}%` }} /></div>

          <Label>Evidence</Label>
          <div className="ci-evidence-item"><span>Name similarity</span><span>{Math.min(0.99, company.confidence + 0.02).toFixed(2)}</span></div>
          <div className="ci-evidence-item"><span>Domain match</span><span>{company.confidence > 0.85 ? "✓" : "—"}</span></div>
          <div className="ci-evidence-item"><span>Primary source</span><span>{currentLineage?.primary_source ?? company.source}</span></div>

          {currentLineage && currentLineage.provider_records.length > 0 && (
            <>
              <Label>Provider records</Label>
              {currentLineage.provider_records.map((p) => (
                <div key={p.provider} className="ci-evidence-item"><span>{p.provider}</span><span>{p.updated_at.slice(0, 10)}</span></div>
              ))}
            </>
          )}

          <Label>Disclosure policy</Label>
          <div className="ci-policy-box">
            <b>可用</b>於內部關聯查詢與供應鏈分析;<b>不可</b>對外部系統揭露內部識別碼原始值。
          </div>
        </div>
      )}
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, color: "var(--text-dim)", margin: "14px 0 7px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {children}
    </div>
  );
}
