// components/company-identity/RegistryView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_COLOR, type CompanyNode } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function RegistryView({ onSelect }: { onSelect: (c: CompanyNode) => void }) {
  const [companies, setCompanies] = useState<CompanyNode[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { companyIdentityApi.companies().then(setCompanies); }, []);

  const categories = useMemo(() => Array.from(new Set(companies.map((c) => c.category))), [companies]);

  const filtered = companies.filter((c) =>
    (!query || c.name.toLowerCase().includes(query.toLowerCase())) && (!category || c.category === category),
  );

  return (
    <div className="ci-pane">
      <h2>Company registry</h2>
      <p className="hint">目前納管的 {companies.length} 家 TSMC 供應鏈相關實體,依類別、地區、解析信心與主要來源檢視。</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input className="adm-search" style={{ width: 220, marginBottom: 0 }} placeholder="搜尋名稱…"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)",
                         borderRadius: 6, padding: "7px 10px", fontSize: 12.5 }}>
          <option value="">所有類別</option>
          {categories.map((c) => <option key={c} value={c}>{companies.find((x) => x.category === c)?.category_label}</option>)}
        </select>
      </div>

      <div className="st-tablewrap">
        <table className="st-table">
          <thead><tr><th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>公司</th>
            <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>類別</th>
            <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>地區</th>
            <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>信心</th>
            <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>主要來源</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.fab_code} onClick={() => onSelect(c)} style={{ cursor: "pointer", borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px" }}>{c.name}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLOR[c.category] }} />
                    {c.category_label}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{c.country}</td>
                <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace" }}>{c.confidence.toFixed(2)}</td>
                <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
