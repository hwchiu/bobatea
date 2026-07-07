// app/settings/page.tsx — Settings：Company Config（主檔 + data providers）與 System Parameters
// Schema-driven：欄位由後端 /api/settings/schema 提供，表格 / 表單 / Excel 模板共用同一份定義。
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Building2, Database, Download, Plus, RefreshCw, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { settingsApi, type FieldDef, type Row, type ScopeSchema, type SettingsSchema } from "@/lib/settingsClient";

type UploadReport = { status: string; message?: string; upserted?: number;
                      report: { row: number; key?: string; errors: string[] }[] };

export default function SettingsPage() {
  const [schema, setSchema] = useState<SettingsSchema | null>(null);
  const [scope, setScope] = useState<string>("company_master");
  const [err, setErr] = useState("");

  useEffect(() => {
    settingsApi.schema().then(setSchema).catch(e => setErr(String(e)));
  }, []);

  const scopeSchema: ScopeSchema | null = useMemo(() => {
    if (!schema) return null;
    if (scope === "company_master") return schema.company_master;
    if (scope === "system_params") return schema.system_params;
    return schema.providers[scope] ?? null;
  }, [schema, scope]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="Settings" />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* ── Submenu tree ── */}
        <nav style={{ width: 220, borderRight: "1px solid var(--border)", padding: "14px 10px",
                      background: "var(--bg-surface)", overflowY: "auto", flexShrink: 0 }}>
          <TreeGroup icon={<Building2 size={13} />} label="Company Config">
            <TreeItem id="company_master" label="Company Master" active={scope} onSelect={setScope} badge="主檔" />
            {schema && Object.values(schema.providers).map(p => (
              <TreeItem key={p.id} id={p.id} label={p.label} active={scope} onSelect={setScope}
                        icon={<Database size={12} />} indent />
            ))}
          </TreeGroup>
          <TreeGroup icon={<SlidersHorizontal size={13} />} label="System Parameter">
            <TreeItem id="system_params" label="Parameters" active={scope} onSelect={setScope} />
          </TreeGroup>
        </nav>

        {/* ── 內容區 ── */}
        <main style={{ flex: 1, overflow: "auto", padding: 18 }}>
          {err && <div className="pcs-issue error">{err}</div>}
          {scopeSchema && <ScopeEditor key={scope} scope={scope} schema={scopeSchema}
                                       isProvider={!!schema?.providers[scope]} />}
        </main>
      </div>
    </div>
  );
}

// ── Submenu 元件 ─────────────────────────────────────────────

function TreeGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
                    fontSize: 11, letterSpacing: .4, textTransform: "uppercase",
                    color: "var(--text-muted)" }}>
        {icon}{label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TreeItem({ id, label, active, onSelect, badge, icon, indent }: {
  id: string; label: string; active: string; onSelect: (id: string) => void;
  badge?: string; icon?: React.ReactNode; indent?: boolean;
}) {
  const isActive = active === id;
  return (
    <button onClick={() => onSelect(id)}
      style={{
        display: "flex", alignItems: "center", gap: 7, width: "100%",
        padding: "7px 10px", paddingLeft: indent ? 26 : 10, marginBottom: 2,
        background: isActive ? "var(--bg-hover)" : "transparent",
        border: "none", borderRadius: 6, cursor: "pointer",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 13, textAlign: "left", fontWeight: isActive ? 600 : 400,
      }}>
      {icon}{label}
      {badge && <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 7px",
                               border: "1px solid var(--border)", borderRadius: 999,
                               color: "var(--text-muted)" }}>{badge}</span>}
    </button>
  );
}

// ── Schema-driven 編輯器（online edit + Excel batch upload）──

function ScopeEditor({ scope, schema, isProvider }: { scope: string; schema: ScopeSchema; isProvider: boolean }) {
  const keyField = schema.key_field ?? "fab_code";
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Row | null>(null);       // 新增列
  const [editKey, setEditKey] = useState<string | null>(null); // 編輯中列的 key
  const [editRow, setEditRow] = useState<Row>({});
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [uploadReport, setUploadReport] = useState<UploadReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    settingsApi.list(scope).then(setRows).catch(e => setMsg({ text: String(e), ok: false }));
  }, [scope]);
  useEffect(() => { load(); }, [load]);

  const notify = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const save = async (row: Row, isNew: boolean) => {
    const key = String(row[keyField] ?? "").trim();
    if (!key) { notify(`${keyField} 為必填`, false); return; }
    try {
      await settingsApi.upsert(scope, key, row);
      notify(isNew ? `已新增 ${key}` : `已更新 ${key}`);
      setDraft(null); setEditKey(null); load();
    } catch (e) { notify(String(e), false); }
  };

  const remove = async (key: string) => {
    if (!confirm(`確定刪除 ${key}？`)) return;
    try { await settingsApi.remove(scope, key); notify(`已刪除 ${key}`); load(); }
    catch (e) { notify(String(e), false); }
  };

  const onUpload = async (f: File) => {
    setUploadReport(null);
    try {
      const r = await settingsApi.upload(scope, f);
      setUploadReport(r);
      if (r.status === "ok") { notify(`批次上傳成功，共 ${r.upserted} 筆`); load(); }
      else notify(r.message ?? "上傳被拒絕", false);
    } catch (e) { notify(String(e), false); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const emptyDraft = (): Row => Object.fromEntries(
    schema.fields.map(f => [f.key, f.default ?? ""]));

  return (
    <div>
      {/* 工具列 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{schema.label}</h2>
        {isProvider && <span className="pcs-hint">fab_code 需先存在於 Company Master</span>}
        <span style={{ flex: 1 }} />
        <button className="pcs-btn" onClick={load}><RefreshCw size={13} /> 重新整理</button>
        <a className="pcs-btn" href={settingsApi.templateUrl(scope)} style={{ textDecoration: "none",
             display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Download size={13} /> Excel 模板
        </a>
        <button className="pcs-btn" onClick={() => fileRef.current?.click()}>
          <Upload size={13} /> 批次上傳
        </button>
        <input ref={fileRef} type="file" accept=".xlsx" hidden
               onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <button className="pcs-btn primary" onClick={() => { setDraft(emptyDraft()); setEditKey(null); }}>
          <Plus size={13} /> 新增
        </button>
      </div>

      {msg && <div className={`pcs-issue ${msg.ok ? "" : "error"}`}>{msg.text}</div>}

      {/* 上傳驗證報告 */}
      {uploadReport && uploadReport.status !== "ok" && (
        <div style={{ marginBottom: 12 }}>
          {uploadReport.report.filter(r => r.errors.length).map(r => (
            <div key={r.row} className="pcs-issue error">
              第 {r.row} 列{r.key ? `（${r.key}）` : ""}：{r.errors.join("；")}
            </div>
          ))}
        </div>
      )}

      {/* 表格 */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--bg-surface)" }}>
              {schema.fields.map(f => (
                <th key={f.key} title={f.hint}
                    style={{ textAlign: "left", padding: "9px 12px", fontWeight: 600,
                             borderBottom: "1px solid var(--border)", whiteSpace: "nowrap",
                             color: "var(--text-secondary)" }}>
                  {f.label}{f.required && <span style={{ color: "var(--danger)" }}> *</span>}
                </th>
              ))}
              <th style={{ width: 110, borderBottom: "1px solid var(--border)" }} />
            </tr>
          </thead>
          <tbody>
            {draft && (
              <EditableRow fields={schema.fields} row={draft} keyField={keyField} isNew
                onChange={setDraft} onSave={() => save(draft, true)} onCancel={() => setDraft(null)} />
            )}
            {rows.map(r => {
              const key = String(r[keyField]);
              return editKey === key ? (
                <EditableRow key={key} fields={schema.fields} row={editRow} keyField={keyField}
                  onChange={setEditRow} onSave={() => save(editRow, false)} onCancel={() => setEditKey(null)} />
              ) : (
                <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                  {schema.fields.map(f => (
                    <td key={f.key} style={{ padding: "8px 12px", color: "var(--text-primary)",
                                             fontFamily: f.key === keyField ? "var(--font-mono, monospace)" : undefined }}>
                      {String(r[f.key] ?? "")}
                    </td>
                  ))}
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    <button className="pcs-btn" style={{ marginRight: 6 }}
                            onClick={() => { setEditKey(key); setEditRow({ ...r }); setDraft(null); }}>編輯</button>
                    <button className="pcs-btn danger" onClick={() => remove(key)}><Trash2 size={12} /></button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && !draft && (
              <tr><td colSpan={schema.fields.length + 1}
                      style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
                尚無資料 — 點「新增」線上編輯，或下載 Excel 模板後批次上傳
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableRow({ fields, row, keyField, isNew, onChange, onSave, onCancel }: {
  fields: FieldDef[]; row: Row; keyField: string; isNew?: boolean;
  onChange: (r: Row) => void; onSave: () => void; onCancel: () => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", minWidth: 90, background: "var(--bg-elevated)", color: "var(--text-primary)",
    border: "1px solid var(--accent)", borderRadius: 5, padding: "5px 8px", fontSize: 12.5,
  };
  return (
    <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-hover)" }}>
      {fields.map(f => (
        <td key={f.key} style={{ padding: "6px 8px" }}>
          {f.type === "select" ? (
            <select style={inputStyle} value={String(row[f.key] ?? "")}
                    onChange={e => onChange({ ...row, [f.key]: e.target.value })}>
              <option value="" />
              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input style={inputStyle} value={String(row[f.key] ?? "")}
                   placeholder={f.hint} title={f.hint}
                   disabled={f.key === keyField && !isNew}
                   onChange={e => onChange({ ...row, [f.key]: e.target.value })} />
          )}
        </td>
      ))}
      <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
        <button className="pcs-btn primary" style={{ marginRight: 6 }} onClick={onSave}>儲存</button>
        <button className="pcs-btn" onClick={onCancel}>取消</button>
      </td>
    </tr>
  );
}
