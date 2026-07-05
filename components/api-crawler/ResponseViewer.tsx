// components/api-crawler/ResponseViewer.tsx
"use client";

import { useState } from "react";
import type { ApiResponse } from "@/lib/types";

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

function statusColor(status: number): string {
  if (status === 0) return "var(--danger)";
  if (status < 300) return "var(--success)";
  if (status < 400) return "var(--warning)";
  return "var(--danger)";
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

type RespTab = "body" | "headers";

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  const [tab, setTab] = useState<RespTab>("body");

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Sending request…
      </div>
    );
  }

  if (!response) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Hit <strong style={{ color: "var(--accent)", margin: "0 4px" }}>Send</strong> to see the response here.
      </div>
    );
  }

  const bodyStr = response.body != null
    ? (typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2))
    : "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: statusColor(response.status) }}>
          {response.status === 0 ? "Error" : response.status} {response.statusText}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {response.durationMs}ms
        </span>
        {response.error && (
          <span style={{ fontSize: 12, color: "var(--danger)" }}>{response.error}</span>
        )}

        <div style={{ marginLeft: "auto", display: "flex" }}>
          {(["body", "headers"] as RespTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "4px 12px",
                background: "none",
                border: "none",
                borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
                color: tab === t ? "var(--accent-hover)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {tab === "body" && (
          <pre
            style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(bodyStr) }}
          />
        )}
        {tab === "headers" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {Object.entries(response.headers).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ padding: "4px 8px", color: "#93c5fd", fontFamily: "monospace", verticalAlign: "top", whiteSpace: "nowrap" }}>{key}</td>
                  <td style={{ padding: "4px 8px", color: "var(--text-primary)", fontFamily: "monospace", wordBreak: "break-all" }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
