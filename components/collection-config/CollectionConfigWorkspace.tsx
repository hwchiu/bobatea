// components/collection-config/CollectionConfigWorkspace.tsx
"use client";

import { useState } from "react";
import { Plus, X, Rocket, Trash2 } from "lucide-react";
import { useCollectionConfig, collectionConfigStore } from "@/lib/collectionConfigStore";
import { companyIntelligenceApi } from "@/lib/companyIntelligenceClient";
import type { CompanyProfile } from "@/lib/companyIntelligenceTypes";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bobatea";

export default function CollectionConfigWorkspace() {
  const entries = useCollectionConfig();
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [run, setRun] = useState<{ ids: string[]; runId: string } | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const startRun = () => {
    if (selected.length === 0) return;
    const runId = `COL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;
    collectionConfigStore.setStatus(selected, "running");
    setRun({ ids: selected, runId });
    setSelected([]);
  };

  return (
    <div className="cc-page">
      <div className="cc-toolbar">
        <div>
          <h2>Collection Config</h2>
          <p>Manage companies included in data collection.</p>
        </div>
        <button className="cc-add-btn" onClick={() => setAdding(true)}><Plus size={14} /> Add Company</button>
      </div>

      {entries.length === 0 ? (
        <div className="cc-empty">
          No companies configured yet. Use <strong>Company Search</strong> or &ldquo;Add Company&rdquo; to resolve a provider identity and add it here.
        </div>
      ) : (
        <div className="st-tablewrap">
          <table className="st-table">
            <thead>
              <tr>
                <th style={{ padding: "8px 10px" }}></th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>Company</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>Provider</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>Identity</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>Dataset</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>Status</th>
                <th style={{ padding: "8px 10px" }}></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 10px" }}>
                    <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} />
                  </td>
                  <td style={{ padding: "8px 10px" }}>{e.companyName}</td>
                  <td style={{ padding: "8px 10px" }}>{e.providerLabel}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace" }}>{e.identifier}</td>
                  <td style={{ padding: "8px 10px", color: "var(--text-muted)" }}>{e.dataset}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className={`cc-status ${e.status}`}>
                      <span className="dot" /> {e.status === "ready" ? "Ready" : e.status === "queued" ? "Queued" : "Running"}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <button
                      title="Remove"
                      onClick={() => { collectionConfigStore.remove(e.id); setSelected((s) => s.filter((x) => x !== e.id)); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
        <div className="cc-run-bar">
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            {selected.length} of {entries.length} selected
          </span>
          <button className="cc-run-btn" disabled={selected.length === 0} onClick={startRun}>
            <Rocket size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Run Collection
          </button>
        </div>
      )}

      {adding && <AddCompanyDrawer onClose={() => setAdding(false)} />}
      {run && <RunResultModal ids={run.ids} runId={run.runId} entries={entries} onClose={() => setRun(null)} />}
    </div>
  );
}

function AddCompanyDrawer({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyProfile[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [providerId, setProviderId] = useState("");

  const search = (q: string) => {
    setQuery(q);
    setProfile(null);
    if (!q.trim()) { setResults([]); return; }
    companyIntelligenceApi.search(q).then(setResults);
  };

  const identity = profile?.identities.find((i) => i.providerId === providerId);

  const add = () => {
    if (!profile || !identity) return;
    collectionConfigStore.add({
      fabCode: profile.fabCode,
      companyName: profile.name,
      providerId: identity.providerId,
      providerLabel: identity.providerLabel,
      identifier: identity.primaryValue,
      dataset: "Company Profile",
    });
    onClose();
  };

  return (
    <div className="cs-overlay" onClick={onClose}>
      <div className="cs-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2>Add Company</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {!profile && (
          <div>
            <label>Find company</label>
            <input
              autoFocus
              className="adm-search"
              placeholder="Search company name, ticker, DUNS…"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {results.map((r) => (
                <button
                  key={r.fabCode}
                  onClick={() => { setProfile(r); setProviderId(r.identities[0]?.providerId ?? ""); }}
                  style={{
                    textAlign: "left", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "9px 11px", cursor: "pointer", color: "var(--text-primary)", fontSize: 13,
                  }}
                >
                  {r.name} <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>· {r.fabCode}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {profile && (
          <>
            <div>
              <label>Company</label>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{profile.name}</div>
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
                <div className="cs-resolved-box"><span>{identity.primaryValue}</span></div>
                <div className="cs-resolved-hint">Automatically resolved</div>
              </div>
            )}
            <div className="cs-drawer-actions">
              <button
                onClick={() => setProfile(null)}
                style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)",
                         borderRadius: 7, padding: "8px 14px", fontSize: 12.5, cursor: "pointer" }}
              >
                Back
              </button>
              <button className="cs-configure-btn" onClick={add} disabled={!identity}>Add to Collection</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RunResultModal({ ids, runId, entries, onClose }: {
  ids: string[]; runId: string; entries: ReturnType<typeof useCollectionConfig>; onClose: () => void;
}) {
  const running = entries.filter((e) => ids.includes(e.id));
  return (
    <div className="cs-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: "auto", width: 420, maxWidth: "90vw", background: "var(--bg-surface)",
          border: "1px solid var(--border)", borderRadius: 12, padding: 22,
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: 16, color: "var(--success)" }}>✓ Collection started</h2>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--text-muted)", fontFamily: "ui-monospace, monospace" }}>
          Run ID: {runId}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {running.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>{e.companyName} / {e.providerLabel}</span>
              <span className="cc-status running"><span className="dot" /> Running</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="cs-configure-btn" onClick={() => { window.location.href = `${BASE}/jobs/`; }}>View Job Center</button>
        </div>
      </div>
    </div>
  );
}
