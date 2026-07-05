// components/api-crawler/RequestTabs.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { KeyValuePair, AuthConfig, AuthType, BodyType, RequestConfig } from "@/lib/types";

// ─── KV Table ────────────────────────────────────────────────────────────────

function newRow(): KeyValuePair {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

function KVTable({ rows, onChange }: { rows: KeyValuePair[]; onChange: (r: KeyValuePair[]) => void }) {
  const update = (id: string, field: keyof KeyValuePair, value: string | boolean) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, newRow()]);

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ width: 24, padding: "4px 8px", color: "var(--text-dim)", fontWeight: 400 }}></th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", fontWeight: 500, textAlign: "left" }}>Key</th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", fontWeight: 500, textAlign: "left" }}>Value</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "3px 8px", textAlign: "center" }}>
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
                    border: "1px solid transparent",
                    borderRadius: 3,
                    color: "var(--text-primary)",
                    padding: "3px 6px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
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
                    border: "1px solid transparent",
                    borderRadius: 3,
                    color: "var(--text-primary)",
                    padding: "3px 6px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
              </td>
              <td style={{ padding: "3px 4px", textAlign: "center" }}>
                <button
                  onClick={() => remove(row.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 2, display: "flex", alignItems: "center" }}
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={add}
        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "6px 12px", fontSize: 12 }}
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

// ─── Auth Panel ───────────────────────────────────────────────────────────────

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none",    label: "No Auth"      },
  { value: "bearer",  label: "Bearer Token" },
  { value: "basic",   label: "Basic Auth"   },
  { value: "api_key", label: "API Key"      },
];

function inputSx(): React.CSSProperties {
  return {
    width: "100%",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "6px 10px",
    fontSize: 12,
    fontFamily: "monospace",
    outline: "none",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 3 }}>{label}</label>
      {children}
    </div>
  );
}

function AuthPanel({ auth, onChange }: { auth: AuthConfig; onChange: (a: AuthConfig) => void }) {
  const set = (patch: Partial<AuthConfig>) => onChange({ ...auth, ...patch });
  return (
    <div style={{ padding: "14px 16px" }}>
      <Field label="Auth Type">
        <select
          value={auth.type}
          onChange={(e) => set({ type: e.target.value as AuthType })}
          style={{ ...inputSx(), fontFamily: "inherit" }}
        >
          {AUTH_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      {auth.type === "bearer" && (
        <Field label="Token">
          <input value={auth.bearerToken ?? ""} onChange={(e) => set({ bearerToken: e.target.value })} placeholder="eyJ…" style={inputSx()} />
        </Field>
      )}
      {auth.type === "basic" && (
        <>
          <Field label="Username">
            <input value={auth.basicUsername ?? ""} onChange={(e) => set({ basicUsername: e.target.value })} style={inputSx()} />
          </Field>
          <Field label="Password">
            <input type="password" value={auth.basicPassword ?? ""} onChange={(e) => set({ basicPassword: e.target.value })} style={inputSx()} />
          </Field>
        </>
      )}
      {auth.type === "api_key" && (
        <>
          <Field label="Header Name">
            <input value={auth.apiKeyHeader ?? ""} onChange={(e) => set({ apiKeyHeader: e.target.value })} placeholder="X-API-Key" style={inputSx()} />
          </Field>
          <Field label="Value">
            <input value={auth.apiKeyValue ?? ""} onChange={(e) => set({ apiKeyValue: e.target.value })} placeholder="your-api-key" style={inputSx()} />
          </Field>
        </>
      )}
    </div>
  );
}

// ─── Body Panel ───────────────────────────────────────────────────────────────

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON" },
  { value: "form", label: "Form Data" },
];

function BodyPanel({ bodyType, bodyJson, onBodyTypeChange, onBodyJsonChange }: {
  bodyType: BodyType;
  bodyJson: string;
  onBodyTypeChange: (t: BodyType) => void;
  onBodyJsonChange: (s: string) => void;
}) {
  return (
    <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 10, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {BODY_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onBodyTypeChange(value)}
            style={{
              padding: "3px 10px",
              borderRadius: 4,
              border: `1px solid ${bodyType === value ? "var(--accent)" : "var(--border)"}`,
              background: bodyType === value ? "rgba(91,133,232,0.15)" : "transparent",
              color: bodyType === value ? "var(--accent)" : "var(--text-muted)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {bodyType === "json" && (
        <textarea
          value={bodyJson}
          onChange={(e) => onBodyJsonChange(e.target.value)}
          placeholder={'{\n  "key": "value"\n}'}
          spellCheck={false}
          style={{
            flex: 1,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--text-primary)",
            padding: "8px 10px",
            fontSize: 12,
            fontFamily: "monospace",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            minHeight: 100,
          }}
        />
      )}
      {bodyType === "form" && (
        <div style={{ color: "var(--text-muted)", fontSize: 12, paddingTop: 4 }}>Form data editor coming soon.</div>
      )}
      {bodyType === "none" && (
        <div style={{ color: "var(--text-dim)", fontSize: 12, paddingTop: 4 }}>No body for this request.</div>
      )}
    </div>
  );
}

// ─── RequestTabs ─────────────────────────────────────────────────────────────

type TabId = "params" | "authorization" | "headers" | "body";

interface RequestTabsProps {
  request: RequestConfig;
  onChange: (patch: Partial<RequestConfig>) => void;
}

export function RequestTabs({ request, onChange }: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("params");

  const paramsCount = request.queryParams.filter((p) => p.enabled && p.key).length;
  const headersCount = request.headers.filter((h) => h.enabled && h.key).length;
  const hasBody = request.bodyType !== "none";

  const TABS: { id: TabId; label: string; badge?: string }[] = [
    { id: "params",        label: "Params",       badge: paramsCount > 0 ? String(paramsCount) : undefined },
    { id: "authorization", label: "Authorization", badge: request.auth.type !== "none" ? request.auth.type : undefined },
    { id: "headers",       label: "Headers",       badge: headersCount > 0 ? String(headersCount) : undefined },
    { id: "body",          label: "Body",          badge: hasBody ? request.bodyType : undefined },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 8, background: "var(--bg-surface)", flexShrink: 0 }}>
        {TABS.map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 14px",
              background: "none",
              border: "none",
              borderBottom: activeTab === id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === id ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: activeTab === id ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {label}
            {badge && (
              <span style={{
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                borderRadius: 10,
                padding: "0 5px",
                fontSize: 10,
                fontWeight: 600,
              }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "params" && (
          <div>
            <div style={{ padding: "6px 8px 2px", fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Query Parameters</div>
            <KVTable rows={request.queryParams} onChange={(p) => onChange({ queryParams: p })} />
          </div>
        )}
        {activeTab === "authorization" && (
          <AuthPanel auth={request.auth} onChange={(a) => onChange({ auth: a })} />
        )}
        {activeTab === "headers" && (
          <KVTable rows={request.headers} onChange={(h) => onChange({ headers: h })} />
        )}
        {activeTab === "body" && (
          <BodyPanel
            bodyType={request.bodyType}
            bodyJson={request.bodyJson}
            onBodyTypeChange={(t) => onChange({ bodyType: t })}
            onBodyJsonChange={(s) => onChange({ bodyJson: s })}
          />
        )}
      </div>
    </div>
  );
}
