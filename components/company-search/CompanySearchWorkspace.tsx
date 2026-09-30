"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { companyIntelligenceApi, PROVIDERS } from "@/lib/companyIntelligenceClient";
import type { CompanyProfile } from "@/lib/companyIntelligenceTypes";
import { useI18n } from "@/lib/i18n";
import CompanyForm, { CATEGORIES } from "@/components/collection-config/CompanyForm";
import { useCollectionConfig } from "@/lib/collectionConfigStore";

export default function CompanySearchWorkspace() {
  const { lang } = useI18n();
  const en = lang === "en";
  const [provider, setProvider] = useState("bloomberg");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyProfile[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState<CompanyProfile | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const entries = useCollectionConfig();

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
        <p>{en ? "Choose a provider, then search by company name or short name." : "先選擇資料來源，再以公司名稱或簡稱搜尋。"}</p>
        <label className="cs-field-label" htmlFor="search-provider">{en ? "Data Provider" : "資料來源"}</label>
        <select className="cs-provider-select" id="search-provider" value={provider} onChange={(e) => updateProvider(e.target.value)}>
          {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <div className="cs-search-box">
          <Search size={18} />
          <input
            aria-label={en ? "Search company" : "搜尋公司"}
            placeholder={en ? "Company name or short name…" : "公司名稱或簡稱…"}
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
        {results.map((profile) => {
          const collected = new Set(
            entries.filter((e) => e.fabCode === profile.fabCode && e.providerId === provider).map((e) => e.dataset),
          );
          const ratio = collected.size / CATEGORIES.length;
          const open = expanded === profile.fabCode;
          return (
          <div key={profile.fabCode} className={`cs-card${collected.size ? " collected" : ""}`}>
            <div className="cs-card-head">
              <div>
                <h3>{profile.name}</h3>
                <p className="cs-card-meta">{profile.country} · {profile.region} · {profile.fabCode}</p>
              </div>
              <button className={`cs-configure-btn${collected.size ? " add-more" : ""}`} onClick={() => setConfiguring(profile)}>
                {collected.size ? (en ? "+ Add more" : "+ 補收類別") : (en ? "+ Add Company" : "+ 新增公司")}
              </button>
            </div>
            <div className="cs-identity-grid">
              {profile.identities.map((id) => (
                <div className="cs-identity-card" key={id.providerId}>
                  <span className="cs-identity-provider">{id.providerLabel} · {id.primaryField}</span>
                  <span className="cs-identity-value">{id.primaryValue}</span>
                  {id.secondary?.map((item) => <span className="cs-identity-status" key={item.field}>{item.field}: {item.value}</span>)}
                </div>
              ))}
            </div>
            <div className="cs-coverage">
              <button
                type="button"
                className="cs-cov-badge"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : profile.fabCode)}
              >
                <span className="cs-ring" style={{ "--cs-ring-turn": ratio } as CSSProperties} aria-hidden />
                {en ? "Collected" : "已蒐集"}
                <span className="cs-cov-count">{collected.size} / {CATEGORIES.length}</span>
                <ChevronDown size={14} className={open ? "cs-chev open" : "cs-chev"} aria-hidden />
              </button>
              {open && (
                <div className="cs-cov-detail">
                  {CATEGORIES.map((category) => (
                    <span key={category} className={collected.has(category) ? "cs-pill on" : "cs-pill off"}>
                      {collected.has(category) && <Check size={12} aria-hidden />}
                      {category}{collected.has(category) ? "" : en ? " · not collected" : " · 尚未蒐集"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
      {configuring && <CompanyForm profile={configuring} providerId={provider} onClose={() => setConfiguring(null)} />}
    </div>
  );
}
