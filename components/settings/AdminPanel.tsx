// components/settings/AdminPanel.tsx — 管理者：類別（scope）、欄位定義、後端連結設定
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { adminApi, type FieldDef, type ScopeBackend, type ScopeSchema } from "@/lib/settingsClient";
import { useI18n } from "@/lib/i18n";

const FIELD_TYPES = ["text", "number", "select", "fk"] as const;

export function AdminPanel() {
  const { t } = useI18n();
  const [scopes, setScopes] = useState<ScopeSchema[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [work, setWork] = useState<ScopeSchema | null>(null); // 編輯中副本
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [newId, setNewId] = useState("");

  const load = useCallback(() => {
    adminApi.scopes().then(s => {
      setScopes(s);
      if (sel) setWork(structuredClone(s.find(x => x.id === sel) ?? null));
    }).catch(e => setMsg({ text: String(e), ok: false }));
  }, [sel]);
  useEffect(() => { load(); }, [load]);

  const notify = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3500); };

  const select = (id: string) => {
    setSel(id);
    setWork(structuredClone(scopes.find(x => x.id === id) ?? null));
  };

  const save = async () => {
    if (!work || !sel) return;
    try {
      await adminApi.upsertScope(sel, { label: work.label, fields: work.fields, backend: work.backend });
      notify(t("st.saved")); load();
    } catch (e) { notify(String(e), false); }
  };

  const createScope = async () => {
    const id = newId.trim();
    if (!/^[a-z0-9_]+$/.test(id)) { notify("scope_id: a-z0-9_", false); return; }
    try {
      await adminApi.upsertScope(id, {
        label: id, group: "company_config",
        fields: [{ key: "fab_code", label: "Fab Code", type: "fk", required: true }],
        backend: { type: "rdb" },
      });
      setNewId(""); setSel(id); load(); notify(`${t("st.new_scope")}: ${id}`);
    } catch (e) { notify(String(e), false); }
  };

  const removeScope = async (id: string) => {
    if (!confirm(`${t("st.delete")} scope ${id}?`)) return;
    try { await adminApi.deleteScope(id); if (sel === id) { setSel(null); setWork(null); } load(); }
    catch (e) { notify(String(e), false); }
  };

  const setField = (i: number, patch: Partial<FieldDef>) => {
    if (!work) return;
    const fields = work.fields.map((f, k) => k === i ? { ...f, ...patch } : f);
    setWork({ ...work, fields });
  };

  const backend: ScopeBackend = work?.backend ?? { type: "rdb" };

  return (
    <div>
      <div className="st-toolbar">
        <h2 className="st-title" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{t("st.schema_manager")}</h2>
        <span style={{ flex: 1 }} />
        <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="new_scope_id"
               style={{ height: 32, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        borderRadius: 6, color: "var(--text-primary)", padding: "0 10px", fontSize: 12.5 }} />
        <button className="pcs-btn primary" onClick={createScope}><Plus size={13} />{t("st.new_scope")}</button>
      </div>

      {msg && <div className={`pcs-issue ${msg.ok ? "" : "error"}`}>{msg.text}</div>}

      {/* Scope 清單 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {scopes.map(s => (
          <button key={s.id} className="pcs-btn" onClick={() => select(s.id)}
                  style={sel === s.id ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}>
            {s.label || s.id}
            {s.builtin ? <span className="pcs-hint" style={{ marginLeft: 4 }}>({t("st.builtin")})</span> : null}
          </button>
        ))}
      </div>

      {work && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* 基本 + 後端連結 */}
          <div className="st-card" style={{ maxWidth: "none" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <div className="pcs-hint">Label</div>
                <input value={work.label} onChange={e => setWork({ ...work, label: e.target.value })}
                       style={{ height: 32, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                borderRadius: 6, color: "var(--text-primary)", padding: "0 10px" }} />
              </div>
              <div>
                <div className="pcs-hint">{t("st.backend_link")}</div>
                <select value={backend.type}
                        onChange={e => setWork({ ...work, backend: e.target.value === "rdb"
                          ? { type: "rdb" } : { type: "file", format: "json", path: `exports/${work.id}.json` } })}
                        style={{ height: 32, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                 borderRadius: 6, color: "var(--text-primary)", padding: "0 10px" }}>
                  <option value="rdb">{t("st.backend_rdb")}</option>
                  <option value="file">{t("st.backend_file")}</option>
                </select>
              </div>
              {backend.type === "file" && (
                <>
                  <div>
                    <div className="pcs-hint">Format</div>
                    <select value={backend.format ?? "json"}
                            onChange={e => setWork({ ...work, backend: { ...backend, format: e.target.value as "json" | "yaml" } })}
                            style={{ height: 32, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                     borderRadius: 6, color: "var(--text-primary)", padding: "0 10px" }}>
                      <option value="json">json</option>
                      <option value="yaml">yaml</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div className="pcs-hint">Path</div>
                    <input value={backend.path ?? ""} placeholder="exports/scope.yaml"
                           onChange={e => setWork({ ...work, backend: { ...backend, path: e.target.value } })}
                           style={{ height: 32, width: "100%", background: "var(--bg-elevated)",
                                    border: "1px solid var(--border)", borderRadius: 6,
                                    color: "var(--text-primary)", padding: "0 10px" }} />
                  </div>
                </>
              )}
              <span style={{ flex: 1 }} />
              <button className="pcs-btn primary" onClick={save}><Save size={13} />{t("st.save")}</button>
              {!work.builtin && (
                <button className="pcs-btn danger" onClick={() => removeScope(work.id)}>
                  <Trash2 size={13} />{t("st.delete")}
                </button>
              )}
            </div>
          </div>

          {/* 欄位定義表 */}
          <div className="st-tablewrap">
            <table className="st-table">
              <thead>
                <tr style={{ background: "var(--bg-surface)" }}>
                  {["key", "label", "type", t("st.required"), "options", "hint", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "9px 12px", fontWeight: 600,
                                         borderBottom: "1px solid var(--border)",
                                         color: "var(--text-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {work.fields.map((f, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "6px 8px" }}>
                      <input value={f.key} onChange={e => setField(i, { key: e.target.value })}
                             disabled={f.key === (work.key_field ?? "fab_code")}
                             style={cell} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <input value={f.label} onChange={e => setField(i, { label: e.target.value })} style={cell} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <select value={f.type} onChange={e => setField(i, { type: e.target.value as FieldDef["type"] })} style={cell}>
                        {FIELD_TYPES.map(x => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "center" }}>
                      <input type="checkbox" checked={!!f.required}
                             onChange={e => setField(i, { required: e.target.checked })} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <input value={(f.options ?? []).join(",")} placeholder="a,b,c"
                             onChange={e => setField(i, { options: e.target.value ? e.target.value.split(",").map(s => s.trim()) : undefined })}
                             style={cell} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <input value={f.hint ?? ""} onChange={e => setField(i, { hint: e.target.value })} style={cell} />
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {f.key !== (work.key_field ?? "fab_code") && (
                        <button className="pcs-btn danger icon-only"
                                onClick={() => setWork({ ...work, fields: work.fields.filter((_, k) => k !== i) })}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <button className="pcs-btn"
                    onClick={() => setWork({ ...work, fields: [...work.fields, { key: "", label: "", type: "text" }] })}>
              <Plus size={13} />{t("st.fields")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const cell: React.CSSProperties = {
  width: "100%", minWidth: 80, background: "var(--bg-elevated)", color: "var(--text-primary)",
  border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", fontSize: 12.5,
};
