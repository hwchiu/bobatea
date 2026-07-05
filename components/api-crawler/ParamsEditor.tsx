// components/api-crawler/ParamsEditor.tsx
"use client";

import { useState } from "react";
import type { KeyValuePair, BodyType } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

type Tab = "query" | "path" | "headers" | "body";

interface ParamsEditorProps {
  queryParams: KeyValuePair[];
  pathParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  bodyJson: string;
  onQueryParamsChange: (p: KeyValuePair[]) => void;
  onPathParamsChange: (p: KeyValuePair[]) => void;
  onHeadersChange: (h: KeyValuePair[]) => void;
  onBodyTypeChange: (t: BodyType) => void;
  onBodyJsonChange: (s: string) => void;
}

function newRow(): KeyValuePair {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

function KVTable({
  rows,
  onChange,
}: {
  rows: KeyValuePair[];
  onChange: (r: KeyValuePair[]) => void;
}) {
  const update = (id: string, field: keyof KeyValuePair, value: string | boolean) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, newRow()]);

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ width: 28, padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}></th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}>Key</th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}>Value</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: "3px 8px" }}>
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) => update(row.id, "enabled", e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <input
                  value={row.key}
                  onChange={(e) => update(row.id, "key", e.target.value)}
                  placeholder="key"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-primary)",
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <input
                  value={row.value}
                  onChange={(e) => update(row.id, "value", e.target.value)}
                  placeholder="value"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-primary)",
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <button
                  onClick={() => remove(row.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 8,
          padding: "5px 12px",
          background: "none",
          border: "1px dashed var(--border)",
          borderRadius: 5,
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        <Plus size={13} /> Add Row
      </button>
    </div>
  );
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "query",   label: "Query Params" },
  { id: "path",    label: "Path Params"  },
  { id: "headers", label: "Headers"      },
  { id: "body",    label: "Body"         },
];

export function ParamsEditor(props: ParamsEditorProps) {
  const [tab, setTab] = useState<Tab>("query");
  const {
    queryParams, pathParams, headers, bodyType, bodyJson,
    onQueryParamsChange, onPathParamsChange, onHeadersChange,
    onBodyTypeChange, onBodyJsonChange,
  } = props;

  return (
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 12 }}>
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "9px 16px",
              background: "none",
              border: "none",
              borderBottom: tab === id ? "2px solid var(--accent)" : "2px solid transparent",
              color: tab === id ? "var(--accent-hover)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === id ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px", flex: 1, overflow: "auto" }}>
        {tab === "query"   && <KVTable rows={queryParams}  onChange={onQueryParamsChange} />}
        {tab === "path"    && <KVTable rows={pathParams}   onChange={onPathParamsChange} />}
        {tab === "headers" && <KVTable rows={headers}      onChange={onHeadersChange} />}
        {tab === "body" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["none", "json", "form"] as BodyType[]).map((t) => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer", color: "var(--text-muted)" }}>
                  <input
                    type="radio"
                    name="bodyType"
                    value={t}
                    checked={bodyType === t}
                    onChange={() => onBodyTypeChange(t)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  {t.toUpperCase()}
                </label>
              ))}
            </div>
            {bodyType === "json" && (
              <textarea
                value={bodyJson}
                onChange={(e) => onBodyJsonChange(e.target.value)}
                placeholder='{"key": "value"}'
                rows={8}
                style={{
                  width: "100%",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  padding: "10px 12px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            )}
            {bodyType === "form" && (
              <KVTable rows={queryParams} onChange={onQueryParamsChange} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
