// components/api-crawler/AuthEditor.tsx
"use client";

import type { AuthConfig, AuthType } from "@/lib/types";

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (a: AuthConfig) => void;
}

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none",    label: "No Auth"      },
  { value: "bearer",  label: "Bearer Token" },
  { value: "basic",   label: "Basic Auth"   },
  { value: "api_key", label: "API Key"      },
];

function inputStyle(): React.CSSProperties {
  return {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 5,
    color: "var(--text-primary)",
    padding: "6px 10px",
    fontSize: 13,
    fontFamily: "monospace",
    outline: "none",
    width: "100%",
    marginTop: 4,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const set = (patch: Partial<AuthConfig>) => onChange({ ...auth, ...patch });

  return (
    <div style={{ padding: "14px 16px" }}>
      <Field label="Auth Type">
        <select
          value={auth.type}
          onChange={(e) => set({ type: e.target.value as AuthType })}
          style={{ ...inputStyle(), fontFamily: "inherit" }}
        >
          {AUTH_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      {auth.type === "bearer" && (
        <Field label="Bearer Token">
          <input
            type="text"
            value={auth.bearerToken ?? ""}
            onChange={(e) => set({ bearerToken: e.target.value })}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            style={inputStyle()}
          />
        </Field>
      )}

      {auth.type === "basic" && (
        <>
          <Field label="Username">
            <input
              type="text"
              value={auth.basicUsername ?? ""}
              onChange={(e) => set({ basicUsername: e.target.value })}
              placeholder="username"
              style={inputStyle()}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={auth.basicPassword ?? ""}
              onChange={(e) => set({ basicPassword: e.target.value })}
              placeholder="••••••••"
              style={inputStyle()}
            />
          </Field>
        </>
      )}

      {auth.type === "api_key" && (
        <>
          <Field label="Header Name">
            <input
              type="text"
              value={auth.apiKeyHeader ?? "X-API-Key"}
              onChange={(e) => set({ apiKeyHeader: e.target.value })}
              placeholder="X-API-Key"
              style={inputStyle()}
            />
          </Field>
          <Field label="API Key Value">
            <input
              type="text"
              value={auth.apiKeyValue ?? ""}
              onChange={(e) => set({ apiKeyValue: e.target.value })}
              placeholder="your-api-key"
              style={inputStyle()}
            />
          </Field>
        </>
      )}
    </div>
  );
}
