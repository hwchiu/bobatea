// components/api-crawler/SchemaPanel.tsx
"use client";

import { Wand2, Trash2, Plus } from "lucide-react";
import type { SchemaField, FieldType } from "@/lib/types";

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "array", "object", "null"];

interface SchemaPanelProps {
  fields: SchemaField[];
  onFieldsChange: (f: SchemaField[]) => void;
  onInferFromResponse: () => void;
  hasResponse: boolean;
}

function cellInput(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 3,
    color: "var(--text-primary)",
    padding: "3px 5px",
    fontSize: 11,
    fontFamily: "monospace",
    width: "100%",
    outline: "none",
    ...extra,
  };
}

export function SchemaPanel({ fields, onFieldsChange, onInferFromResponse, hasResponse }: SchemaPanelProps) {
  const update = (id: string, field: keyof SchemaField, value: string | boolean) =>
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  const remove = (id: string) => onFieldsChange(fields.filter((f) => f.id !== id));
  const add = () => onFieldsChange([...fields, {
    id: crypto.randomUUID(), name: "", path: "", type: "string", description: "", required: false,
  }]);

  return (
    <div style={{
      width: 300,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        height: 36,
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Schema
        </span>
        <button
          onClick={onInferFromResponse}
          disabled={!hasResponse}
          title="Infer schema from latest response"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: hasResponse ? "var(--text-muted)" : "var(--text-dim)",
            padding: "2px 8px",
            fontSize: 11,
            cursor: hasResponse ? "pointer" : "not-allowed",
          }}
        >
          <Wand2 size={11} /> Infer
        </button>
      </div>

      {/* Field list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {fields.length === 0 ? (
          <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 12, textAlign: "center" }}>
            No schema fields.{"\n"}Click Infer or add manually.
          </div>
        ) : (
          fields.map((f) => (
            <div key={f.id} style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                <input
                  value={f.name}
                  onChange={(e) => update(f.id, "name", e.target.value)}
                  placeholder="field_name"
                  style={cellInput({ fontWeight: 600, flex: 1 })}
                />
                <select
                  value={f.type}
                  onChange={(e) => update(f.id, "type", e.target.value)}
                  style={{ ...cellInput(), width: 70, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => remove(f.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 2, display: "flex" }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
              <input
                value={f.path}
                onChange={(e) => update(f.id, "path", e.target.value)}
                placeholder="$.path.to.field"
                style={cellInput({ color: "var(--text-muted)", width: "100%" })}
              />
              <input
                value={f.description}
                onChange={(e) => update(f.id, "description", e.target.value)}
                placeholder="Description"
                style={cellInput({ color: "var(--text-muted)", width: "100%", marginTop: 2 })}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-dim)", marginTop: 2, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => update(f.id, "required", e.target.checked)}
                  style={{ accentColor: "var(--accent)" }}
                />
                required
              </label>
            </div>
          ))
        )}
      </div>

      {/* Add row */}
      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "none",
          border: "none",
          borderTop: "1px solid var(--border)",
          cursor: "pointer",
          color: "var(--text-muted)",
          padding: "6px 12px",
          fontSize: 12,
        }}
      >
        <Plus size={12} /> Add Field
      </button>
    </div>
  );
}
