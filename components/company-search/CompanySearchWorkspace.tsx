// components/company-search/CompanySearchWorkspace.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, X } from "lucide-react";
import { companyIntelligenceApi } from "@/lib/companyIntelligenceClient";
import { collectionConfigStore } from "@/lib/collectionConfigStore";
import type { CompanyProfile, ProviderIdentity } from "@/lib/companyIntelligenceTypes";

const DATASETS = ["Company Profile", "Company Filings", "News & Signals"];
const EXAMPLES = ["Apple", "AAPL", "DUNS", "2330"];

export default function CompanySearchWorkspace() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyProfile[]>([]);
  const [configuring, setConfiguring] = useState<CompanyProfile | null>(null);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      companyIntelligenceApi.search(q).then((r) => {
        if (!cancelled) setResults(r);
      });
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  return (
    <div className="cs-page">
      <div className="cs-hero">
        <h1>Company Intelligence</h1>
        <p>Search once. Resolve every provider identity.</p>
        <div className="cs-search-box">
          <Search size={18} />
          <input
            autoFocus
            placeholder="Search company name, ticker, DUNS or provider ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              title="Clear"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="cs-examples">
          Examples:{" "}
          {EXAMPLES.map((ex, i) => (
            <span key={ex}>
              <button onClick={() => setQuery(ex)}>{ex}</button>
              {i < EXAMPLES.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      </div>

      {hasQuery && results.length === 0 && (
        <div className="cs-empty">No company matched &ldquo;{query}&rdquo;. Try a name, ticker, or provider ID.</div>
      )}

      <div className="cs-results">
        {hasQuery && results.map((profile) => (
          <CompanyCard key={profile.fabCode} profile={profile} onConfigure={() => setConfiguring(profile)} />
        ))}
      </div>

      {configuring && (
        <ConfigureDrawer profile={configuring} onClose={() => setConfiguring(null)} />
      )}
    </div>
  );
}

function CompanyCard({ profile, onConfigure }: { profile: CompanyProfile; onConfigure: () => void }) {
  return (
    <div className="cs-card">
      <div className="cs-card-head">
        <div>
          <div className="cs-card-title">
            <h3>{profile.name}</h3>
            <span className="cs-matched"><CheckCircle2 size={13} /> Matched</span>
          </div>
          <p className="cs-card-meta">
            {profile.country} · {profile.region} · Fab Code: {profile.fabCode}
          </p>
        </div>
        <button className="cs-configure-btn" onClick={onConfigure}>+ Configure Collection</button>
      </div>

      <div className="cs-identity-grid">
        {profile.identities.map((id) => (
          <div key={id.providerId} className="cs-identity-card">
            <div className="cs-identity-provider">{id.providerLabel}</div>
            <div className="cs-identity-value">{id.primaryValue}</div>
            <div className={`cs-identity-status${id.status === "inactive" ? " inactive" : ""}`}>
              <span className="dot" /> {id.status === "inactive" ? "Inactive" : "Verified"}
            </div>
          </div>
        ))}
        {profile.identities.length === 0 && (
          <div className="cs-identity-card">
            <div className="cs-identity-provider">No providers</div>
            <div className="cs-identity-value" style={{ color: "var(--text-muted)", fontFamily: "inherit", fontSize: 12 }}>
              Not yet mapped to any data provider
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigureDrawer({ profile, onClose }: { profile: CompanyProfile; onClose: () => void }) {
  const [providerId, setProviderId] = useState(profile.identities[0]?.providerId ?? "");
  const [dataset, setDataset] = useState(DATASETS[0]);
  const [added, setAdded] = useState(false);

  const identity: ProviderIdentity | undefined = useMemo(
    () => profile.identities.find((i) => i.providerId === providerId),
    [profile, providerId],
  );

  const add = () => {
    if (!identity) return;
    collectionConfigStore.add({
      fabCode: profile.fabCode,
      companyName: profile.name,
      providerId: identity.providerId,
      providerLabel: identity.providerLabel,
      identifier: identity.primaryValue,
      dataset,
    });
    setAdded(true);
  };

  return (
    <div className="cs-overlay" onClick={onClose}>
      <div className="cs-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2>Configure Data Collection</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label>Company</label>
          <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 600 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{profile.fabCode} · {profile.country}</div>
        </div>

        <div>
          <label>Data Provider</label>
          {profile.identities.map((id) => (
            <div
              key={id.providerId}
              className={`cs-provider-option${providerId === id.providerId ? " active" : ""}`}
              onClick={() => setProviderId(id.providerId)}
            >
              <input type="radio" readOnly checked={providerId === id.providerId} />
              {id.providerLabel}
            </div>
          ))}
        </div>

        {identity && (
          <div>
            <label>{identity.primaryField}</label>
            <div className="cs-resolved-box">
              <span>{identity.primaryValue}</span>
              <CheckCircle2 size={15} style={{ color: "var(--success)" }} />
            </div>
            <div className="cs-resolved-hint">Automatically resolved</div>
          </div>
        )}

        <div>
          <label>Collection Profile</label>
          <select
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            style={{
              width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
              color: "var(--text-primary)", borderRadius: 6, padding: "8px 10px", fontSize: 13,
            }}
          >
            {DATASETS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="cs-drawer-actions">
          {added ? (
            <>
              <span style={{ fontSize: 12.5, color: "var(--success)", marginRight: "auto" }}>✓ Added to Collection Config</span>
              <button className="cs-configure-btn" onClick={onClose}>Done</button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)",
                         borderRadius: 7, padding: "8px 14px", fontSize: 12.5, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button className="cs-configure-btn" onClick={add} disabled={!identity}>Add to Collection</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
