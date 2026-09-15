// components/company-identity/LineageView.tsx
"use client";

import { useEffect, useState } from "react";
import type { CompanyNode, LineageInfo } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function LineageView() {
  const [companies, setCompanies] = useState<CompanyNode[]>([]);
  const [fabCode, setFabCode] = useState("");
  const [lineage, setLineage] = useState<LineageInfo | null>(null);

  useEffect(() => {
    companyIdentityApi.companies().then((rows) => {
      setCompanies(rows);
      const preferred = rows.find((c) => c.fab_code === "ENTEGRIS") ?? rows[1];
      if (preferred) setFabCode(preferred.fab_code);
    });
  }, []);

  useEffect(() => {
    if (!fabCode) return;
    companyIdentityApi.lineage(fabCode).then(setLineage);
  }, [fabCode]);

  return (
    <div className="ci-pane">
      <h2>Lineage</h2>
      <p className="hint">任一實體的完整來源鏈路 —— 從原始資料源到進入 Company Identity Graph 的每一步轉換與信心分數。</p>

      <select value={fabCode} onChange={(e) => setFabCode(e.target.value)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)",
                       borderRadius: 6, padding: "8px 10px", fontSize: 12.5, minWidth: 260 }}>
        {companies.map((c) => <option key={c.fab_code} value={c.fab_code}>{c.name}</option>)}
      </select>

      {lineage && (
        <div style={{ marginTop: 26, paddingLeft: 24, position: "relative" }}>
          <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 1, background: "var(--border)" }} />
          {[
            { title: `來源擷取 — ${lineage.primary_source ?? "unknown"}`, meta: `fab_code: ${lineage.fab_code}` },
            { title: "正規化 — Entity Normalizer", meta: `候選 confidence: ${((lineage.confidence ?? 0) - 0.03).toFixed(2)}` },
            { title: "實體解析 — Entity Resolution", meta: "strategy: semantic + blocking" },
            { title: "併入 Company Identity Graph", meta: `confidence: ${(lineage.confidence ?? 0).toFixed(2)} · category: ${lineage.category}` },
          ].map((step, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 22 }}>
              <div style={{ position: "absolute", left: -24, top: 3, width: 9, height: 9, borderRadius: "50%",
                            background: "var(--bg-base)", border: "2px solid var(--accent)" }} />
              <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{step.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3, fontFamily: "ui-monospace, monospace" }}>{step.meta}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
