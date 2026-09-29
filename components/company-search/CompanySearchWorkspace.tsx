"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { companyIntelligenceApi, PROVIDERS } from "@/lib/companyIntelligenceClient";
import type { CompanyProfile } from "@/lib/companyIntelligenceTypes";
import { useI18n } from "@/lib/i18n";
import CompanyForm from "@/components/collection-config/CompanyForm";

export default function CompanySearchWorkspace() {
  const { lang } = useI18n();
  const en = lang === "en";
  const [provider, setProvider] = useState("bloomberg");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyProfile[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      companyIntelligenceApi.search(query, provider).then((found) => {
        if (!cancelled) { setResults(found); setLoading(false); }
      }).catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, provider]);

  const updateQuery = (value: string) => {
    setQuery(value);
    setResults([]);
    setError(false);
    setLoading(!!value.trim());
  };
  const updateProvider = (value: string) => {
    setProvider(value);
    setResults([]);
    setError(false);
    setLoading(!!query.trim());
  };

  return (
    <div className="cs-page">
      <div className="cs-hero">
        <h1>Company Intelligence</h1>
        <p>{en ? "Choose a provider, then search its company identifiers." : "先選擇資料來源，再搜尋該來源的公司識別碼。"}</p>
        <label className="cs-field-label" htmlFor="search-provider">{en ? "Data Provider" : "資料來源"}</label>
        <select className="cs-provider-select" id="search-provider" value={provider} onChange={(e) => updateProvider(e.target.value)}>
          {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <div className="cs-search-box">
          <Search size={18} />
          <input
            aria-label={en ? "Search company" : "搜尋公司"}
            placeholder={en ? "Company name, ticker, DUNS or provider ID…" : "公司名稱、Ticker、DUNS 或資料來源識別碼…"}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
          />
          {query && <button onClick={() => updateQuery("")} className="cs-close" aria-label={en ? "Clear search" : "清除搜尋"}><X size={16} /></button>}
        </div>
        <p className="cs-demo-note">{en ? "Demo fallback identifiers are illustrative, not verified provider records." : "備用示範識別碼僅供展示，並非已驗證的資料來源紀錄。"}</p>
      </div>

      {query.trim() && loading && <div className="cs-empty" role="status">{en ? "Searching…" : "搜尋中…"}</div>}
      {query.trim() && error && <div className="cs-empty" role="alert">{en ? "Search unavailable. Please try again." : "搜尋暫時無法使用，請稍後重試。"}</div>}
      {query.trim() && !loading && !error && !results.length &&
        <div className="cs-empty">{en ? "No company matched" : "查無公司"} &ldquo;{query}&rdquo;.</div>}

      <div className="cs-results">
        {results.map((profile) => (
          <div key={profile.fabCode} className="cs-card">
            <div className="cs-card-head">
              <div>
                <h3>{profile.name}</h3>
                <p className="cs-card-meta">{profile.country} · {profile.region} · {profile.fabCode}</p>
              </div>
              <button className="cs-configure-btn" onClick={() => setConfiguring(profile)}>{en ? "+ Add Company" : "+ 新增公司"}</button>
            </div>
            <div className="cs-identity-grid">
              {profile.identities.map((id) => (
                <div className="cs-identity-card" key={id.providerId}>
                  <div className="cs-identity-provider">{id.providerLabel} · {id.primaryField}</div>
                  <div className="cs-identity-value">{id.primaryValue}</div>
                  {id.secondary?.map((item) => <div className="cs-identity-status" key={item.field}>{item.field}: {item.value}</div>)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {configuring && <CompanyForm profile={configuring} providerId={provider} onClose={() => setConfiguring(null)} />}
    </div>
  );
}
