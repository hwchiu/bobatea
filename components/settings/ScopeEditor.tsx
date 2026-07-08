// components/settings/ScopeEditor.tsx — schema-driven 資料維護（online edit + Excel + export）
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileJson, FileText, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { settingsApi, exportUrl, type FieldDef, type Row, type ScopeSchema } from "@/lib/settingsClient";
import { useI18n } from "@/lib/i18n";

type UploadReport = { status: string; message?: string; upserted?: number;
                      report: { row: number; key?: string; errors: string[] }[] };

export function ScopeEditor({ scope, schema, isProvider }: {
  scope: string; schema: ScopeSchema; isProvider: boolean;
}) {
  const { t } = useI18n();
  const keyField = schema.key_field ?? "fab_code";
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState<Row | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
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
    if (!key) { notify(`${keyField} ${t("st.required")}`, false); return; }
    try {
      await settingsApi.upsert(scope, key, row);
      notify(`${t("st.saved")}: ${key}`);
      setDraft(null); setEditKey(null); load();
    } catch (e) { notify(String(e), false); }
  };

  const remove = async (key: string) => {
    if (!confirm(`${t("st.delete")} ${key}?`)) return;
    try { await settingsApi.remove(scope, key); notify(`${t("st.delete")}: ${key}`); load(); }
    catch (e) { notify(String(e), false); }
  };

  const onUpload = async (f: File) => {
    setUploadReport(null);
    try {
      const r = await settingsApi.upload(scope, f);
      setUploadReport(r);
      if (r.status === "ok") { notify(`${t("st.batch_upload")} OK: ${r.upserted}`); load(); }
      else notify(r.message ?? "rejected", false);
    } catch (e) { notify(String(e), false); }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div className="st-toolbar">
        <h2 className="st-title" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{schema.label}</h2>
        {isProvider && <span className="pcs-hint">{t("st.fk_hint")}</span>}
        <span style={{ flex: 1 }} />
        <button className="pcs-btn" onClick={load}><RefreshCw size={13} />{t("st.refresh")}</button>
        <a className="pcs-btn" href={settingsApi.templateUrl(scope)} style={{ textDecoration: "none" }}>
          <Download size={13} />{t("st.excel_template")}
        </a>
        <button className="pcs-btn" onClick={() => fileRef.current?.click()}>
          <Upload size={13} />{t("st.batch_upload")}
        </button>
        <a className="pcs-btn" href={exportUrl(scope, "json")} style={{ textDecoration: "none" }}>
          <FileJson size={13} />{t("st.export_json")}
        </a>
        <a className="pcs-btn" href={exportUrl(scope, "yaml")} style={{ textDecoration: "none" }}>
          <FileText size={13} />{t("st.export_yaml")}
        </a>
        <input ref={fileRef} type="file" accept=".xlsx" hidden
               onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        <button className="pcs-btn primary" onClick={() => { setDraft(emptyDraft(schema.fields)); setEditKey(null); }}>
          <Plus size={13} />{t("st.add")}
        </button>
      </div>

      {msg && <div className={`pcs-issue ${msg.ok ? "" : "error"}`}>{msg.text}</div>}

      {uploadReport && uploadReport.status !== "ok" && (
        <div style={{ marginBottom: 12 }}>
          {uploadReport.report.filter(r => r.errors.length).map(r => (
            <div key={r.row} className="pcs-issue error">
              Row {r.row}{r.key ? ` (${r.key})` : ""}: {r.errors.join("; ")}
            </div>
          ))}
        </div>
      )}

      <div className="st-tablewrap">
        <table className="st-table">
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
              <th style={{ width: 120, borderBottom: "1px solid var(--border)" }} />
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
                    <td key={f.key} style={{ padding: "8px 12px",
                          fontFamily: f.key === keyField ? "var(--font-mono, monospace)" : undefined }}>
                      {String(r[f.key] ?? "")}
                    </td>
                  ))}
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    <button className="pcs-btn" style={{ minWidth: 0, marginRight: 6 }}
                            onClick={() => { setEditKey(key); setEditRow({ ...r }); setDraft(null); }}>
                      {t("st.edit")}
                    </button>
                    <button className="pcs-btn danger icon-only" onClick={() => remove(key)}><Trash2 size={12} /></button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && !draft && (
              <tr><td colSpan={schema.fields.length + 1}
                      style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
                {t("st.empty_hint")}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function emptyDraft(fields: FieldDef[]): Row {
  return Object.fromEntries(fields.map(f => [f.key, f.default ?? ""]));
}

export function EditableRow({ fields, row, keyField, isNew, onChange, onSave, onCancel }: {
  fields: FieldDef[]; row: Row; keyField: string; isNew?: boolean;
  onChange: (r: Row) => void; onSave: () => void; onCancel: () => void;
}) {
  const { t } = useI18n();
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
        <button className="pcs-btn primary" style={{ minWidth: 0, marginRight: 6 }} onClick={onSave}>{t("st.save")}</button>
        <button className="pcs-btn" style={{ minWidth: 0 }} onClick={onCancel}>{t("st.cancel")}</button>
      </td>
    </tr>
  );
}
