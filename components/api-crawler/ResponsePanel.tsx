// components/api-crawler/ResponsePanel.tsx
"use client";

import { useState } from "react";
import type { ApiResponse } from "@/lib/types";

function statusColor(status: number): string {
  if (status === 0) return "var(--danger)";
  if (status < 300) return "var(--success)";
  if (status < 400) return "var(--warning)";
  return "var(--danger)";
}

function formatSize(body: string): string {
  const bytes = new TextEncoder().encode(body).length;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="json-key">${match}</span>`;
          return `<span class="json-str">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
        if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
        return `<span class="json-num">${match}</span>`;
      }
    );
}

type RespTab = "body" | "headers" | "preview";

interface ResponsePanelProps {
  response: ApiResponse | null;
  loading: boolean;
}

export function ResponsePanel({ response, loading }: ResponsePanelProps) {
  const [tab, setTab] = useState<RespTab>("body");

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, gap: 8 }}>
        <span style={{
          display: "inline-block",
          width: 14,
          height: 14,
          border: "2px solid var(--accent)",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        Sending request…
      </div>
    );
  }

  if (!response) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13, flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 32, opacity: 0.3 }}>↵</span>
        Send a request to see the response here.
      </div>
    );
  }

  const bodyStr = response.body != null
    ? (typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2))
    : "";

  const headerEntries = Object.entries(response.headers ?? {});
  const sc = statusColor(response.status);

  const TABS: { id: RespTab; label: string }[] = [
    { id: "body",    label: "Body"    },
    { id: "headers", label: "Headers" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Status bar + tab bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 12px",
        height: 36,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}>
        <span style={{
          background: `${sc}22`,
          color: sc,
          borderRadius: 4,
          padding: "2px 8px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "monospace",
        }}>
          {response.status} {response.statusText}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{response.durationMs} ms</span>
        {bodyStr && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatSize(bodyStr)}</span>}

        <div style={{ marginLeft: "auto", display: "flex" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "0 12px",
                height: 36,
                background: "none",
                border: "none",
                borderBottom: tab === id ? "2px solid var(--accent)" : "2px solid transparent",
                color: tab === id ? "var(--accent)" : "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: tab === id ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "10px 14px" }}>
        {tab === "body" && (
          <pre
            style={{ margin: 0, fontSize: 12, fontFamily: "monospace", lineHeight: 1.6, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(bodyStr) }}
          />
        )}
        {tab === "headers" && (
          <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {headerEntries.map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "5px 10px", color: "var(--text-muted)", fontFamily: "monospace", whiteSpace: "nowrap" }}>{k}</td>
                  <td style={{ padding: "5px 10px", color: "var(--text-primary)", fontFamily: "monospace", wordBreak: "break-all" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "preview" && (
          <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
            {bodyStr}
          </pre>
        )}
      </div>
    </div>
  );
}
