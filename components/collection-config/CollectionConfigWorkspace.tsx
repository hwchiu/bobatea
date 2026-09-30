// components/collection-config/CollectionConfigWorkspace.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCollectionConfig, collectionConfigStore } from "@/lib/collectionConfigStore";
import type { CollectionEntry } from "@/lib/companyIntelligenceTypes";
import { useI18n } from "@/lib/i18n";
import CompanyForm from "./CompanyForm";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bobatea";

export default function CollectionConfigWorkspace() {
  const { lang } = useI18n();
  const en = lang === "en";
  const entries = useCollectionConfig();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CollectionEntry | null>(null);
  const [run, setRun] = useState<{ ids: string[]; runId: string } | null>(null);

  const startRun = (id: string) => {
    const runId = `COL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000 + 1000)}`;
    collectionConfigStore.setStatus([id], "running");
    setRun({ ids: [id], runId });
  };

  return (
    <div className="cc-page">
      <div className="cc-toolbar">
        <div>
          <h2>Collection Config</h2>
          <p>{en ? "Manage companies included in data collection." : "管理資料蒐集清單中的公司。"}</p>
        </div>
        <button className="cc-add-btn" onClick={() => setAdding(true)}><Plus size={14} /> {en ? "Add Company" : "新增公司"}</button>
      </div>

      {entries.length === 0 ? (
        <div className="cc-empty">
          {en ? "No companies configured yet. Use Company Search or Add Company to add one here." : "尚無公司。可從 Company Search 搜尋，或在此點選「新增公司」填寫資料。"}
        </div>
      ) : (
        <div className="st-tablewrap">
          <table className="st-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>{en ? "Company" : "公司"}</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>{en ? "Provider" : "資料來源"}</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>{en ? "Identity" : "識別碼"}</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>{en ? "Category" : "資料類別"}</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "var(--text-muted)", fontSize: 11 }}>{en ? "Status" : "狀態"}</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>{en ? "Action" : "操作"}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 10px" }}>{e.companyName}</td>
                  <td style={{ padding: "8px 10px" }}>{e.providerLabel}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace" }}>{e.identifier}</td>
                  <td style={{ padding: "8px 10px", color: "var(--text-muted)" }} title={e.parameters ? JSON.stringify(e.parameters) : ""}>{e.dataset}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span className={`cc-status ${e.status}`}>
                      <span className="dot" /> {en ? (e.status === "ready" ? "Ready" : e.status === "queued" ? "Queued" : "Running") : (e.status === "ready" ? "就緒" : e.status === "queued" ? "排程中" : "執行中")}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div className="cc-actions">
                    <button className="cc-run-btn" onClick={() => startRun(e.id)}>
                      {en ? "Run Collection" : "執行蒐集"}
                    </button>
                    <button className="cc-icon-btn" title={en ? "Edit" : "編輯"} aria-label={en ? `Edit ${e.companyName}` : `編輯 ${e.companyName}`} onClick={() => setEditing(e)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      title={en ? "Remove" : "移除"}
                      aria-label={en ? `Remove ${e.companyName}` : `移除 ${e.companyName}`}
                      onClick={() => collectionConfigStore.remove(e.id)}
                      className="cc-icon-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && <CompanyForm onClose={() => setAdding(false)} />}
      {editing && <CompanyForm key={editing.id} entry={editing} onClose={() => setEditing(null)} />}
      {run && <RunResultModal ids={run.ids} runId={run.runId} entries={entries} onClose={() => setRun(null)} />}
    </div>
  );
}

function RunResultModal({ ids, runId, entries, onClose }: {
  ids: string[]; runId: string; entries: ReturnType<typeof useCollectionConfig>; onClose: () => void;
}) {
  const { lang } = useI18n();
  const en = lang === "en";
  const running = entries.filter((e) => ids.includes(e.id));
  return (
    <div className="cs-overlay" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={en ? "Collection started" : "蒐集已啟動"}
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: "auto", width: 420, maxWidth: "90vw", background: "var(--bg-surface)",
          border: "1px solid var(--border)", borderRadius: 12, padding: 22,
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: 16, color: "var(--success)" }}>✓ {en ? "Collection started" : "蒐集已啟動"}</h2>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--text-muted)", fontFamily: "ui-monospace, monospace" }}>
          Run ID: {runId}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {running.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>{e.companyName} / {e.providerLabel}</span>
              <span className="cc-status running"><span className="dot" /> {en ? "Running" : "執行中"}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="cc-secondary-btn" onClick={onClose}>{en ? "Close" : "關閉"}</button>
          <button className="cs-configure-btn" onClick={() => { window.location.href = `${BASE}/jobs/`; }}>{en ? "View Job Center" : "查看工作中心"}</button>
        </div>
      </div>
    </div>
  );
}
