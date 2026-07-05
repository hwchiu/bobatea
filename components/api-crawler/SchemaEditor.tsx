// components/api-crawler/SchemaEditor.tsx
"use client";

import type { SchemaField, FieldType } from "@/lib/types";
import { Trash2, Wand2 } from "lucide-react";

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "array", "object", "null"];

interface SchemaEditorProps {
  fields: SchemaField[];
  onFieldsChange: (f: SchemaField[]) => void;
  onInferFromResponse: () => void;
  hasResponse: boolean;
}

function cellInput(style?: React.CSSProperties): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "4px 6px",
    fontSize: 12,
    fontFamily: "monospace",
    width: "100%",
    outline: "none",
    ...style,
  };
}

export function SchemaEditor({ fields, onFieldsChange, onInferFromResponse, hasResponse }: SchemaEditorProps) {
  const update = (id: string, field: keyof SchemaField, value: string | boolean) =>
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  const remove = (id: string) => onFieldsChange(fields.filter((f) => f.id !== id));

  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Response Schema</span>
        <button
          onClick={onInferFromResponse}
          disabled={!hasResponse}
          title={hasResponse ? "Auto-detect fields from response" : "Send a request first"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            background: hasResponse ? "var(--accent)" : "var(--border)",
            border: "none",
            borderRadius: 5,
            color: hasResponse ? "#fff" : "var(--text-muted)",
            cursor: hasResponse ? "pointer" : "not-allowed",
            fontSize: 12,
          }}
        >
          <Wand2 size={13} /> Infer from Response
        </button>
      </div>

      {fields.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          No schema defined. Send a request and click &quot;Infer from Response&quot;.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Field Name", "Path", "Type", "Description", "Required", ""].map((h) => (
                <th key={h} style={{ padding: "5px 8px", color: "var(--text-muted)", textAlign: "left", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.name} onChange={(e) => update(f.id, "name", e.target.value)} style={cellInput()} />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.path} onChange={(e) => update(f.id, "path", e.target.value)} style={cellInput({ color: "#93c5fd" })} />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <select
                    value={f.type}
                    onChange={(e) => update(f.id, "type", e.target.value)}
                    style={{ ...cellInput({ fontFamily: "inherit" }), border: "1px solid var(--border)" }}
                  >
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.description} onChange={(e) => update(f.id, "description", e.target.value)} placeholder="Description..." style={cellInput()} />
                </td>
                <td style={{ padding: "3px 4px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => update(f.id, "required", e.target.checked)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <button onClick={() => remove(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
