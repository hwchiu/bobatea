// components/api-crawler/EndpointBar.tsx
"use client";

import type { HttpMethod } from "@/lib/types";
import { Send, Loader2 } from "lucide-react";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "var(--method-get)",
  POST:   "var(--method-post)",
  PUT:    "var(--method-put)",
  PATCH:  "var(--method-patch)",
  DELETE: "var(--method-delete)",
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface EndpointBarProps {
  method: HttpMethod;
  url: string;
  loading: boolean;
  onMethodChange: (m: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function EndpointBar({ method, url, loading, onMethodChange, onUrlChange, onSend }: EndpointBarProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 12px",
      height: 48,
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-surface)",
      flexShrink: 0,
    }}>
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 5,
          color: METHOD_COLORS[method],
          fontWeight: 700,
          fontSize: 12,
          fontFamily: "monospace",
          padding: "0 8px",
          height: 30,
          cursor: "pointer",
          minWidth: 86,
          outline: "none",
        }}
      >
        {METHODS.map((m) => (
          <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
            {m}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="https://api.example.com/v1/endpoint"
        style={{
          flex: 1,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 5,
          color: "var(--text-primary)",
          padding: "0 12px",
          height: 30,
          fontSize: 13,
          fontFamily: "monospace",
          outline: "none",
        }}
      />

      <button
        onClick={onSend}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: loading ? "var(--bg-elevated)" : "var(--accent)",
          color: loading ? "var(--text-muted)" : "#fff",
          border: "none",
          borderRadius: 5,
          padding: "0 16px",
          height: 30,
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        {loading
          ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          : <Send size={14} />}
        {loading ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
