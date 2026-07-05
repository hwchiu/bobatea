// components/api-crawler/DagConfigPanel.tsx
"use client";

import type { DagConfig, OutputFormat } from "@/lib/types";
import { Save } from "lucide-react";

interface DagConfigPanelProps {
  config: DagConfig;
  onChange: (c: DagConfig) => void;
  onSave: () => void;
}

const OUTPUT_FORMATS: OutputFormat[] = ["json", "csv", "parquet"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        color: "var(--text-primary)",
        padding: "6px 10px",
        fontSize: 13,
        fontFamily: mono ? "monospace" : "inherit",
        outline: "none",
      }}
    />
  );
}

export function DagConfigPanel({ config, onChange, onSave }: DagConfigPanelProps) {
  const set = (patch: Partial<DagConfig>) => onChange({ ...config, ...patch });

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>DAG Configuration</span>
        <button
          onClick={onSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 14px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 5,
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Save size={13} /> Save Crawler
        </button>
      </div>

      <Field label="Crawler Name">
        <Input value={config.crawlerName} onChange={(v) => set({ crawlerName: v })} placeholder="my_crawler_name" mono />
      </Field>

      <Field label="Schedule (Cron)">
        <Input value={config.schedule} onChange={(v) => set({ schedule: v })} placeholder="0 6 * * *" mono />
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, display: "block" }}>
          e.g. <code>0 6 * * *</code> (daily 6am) · <code>*/30 * * * *</code> (every 30m)
        </span>
      </Field>

      <Field label="Output Format">
        <div style={{ display: "flex", gap: 10 }}>
          {OUTPUT_FORMATS.map((f) => (
            <label key={f} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer", color: "var(--text-muted)" }}>
              <input
                type="radio"
                name="outputFormat"
                value={f}
                checked={config.outputFormat === f}
                onChange={() => set({ outputFormat: f })}
                style={{ accentColor: "var(--accent)" }}
              />
              {f.toUpperCase()}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Output Path">
        <Input value={config.outputPath} onChange={(v) => set({ outputPath: v })} placeholder="s3://bucket/path/" mono />
      </Field>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Retries">
            <input
              type="number"
              min={0}
              max={10}
              value={config.retries}
              onChange={(e) => set({ retries: Number(e.target.value) })}
              style={{
                width: "100%",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                color: "var(--text-primary)",
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Timeout (sec)">
            <input
              type="number"
              min={1}
              value={config.timeoutSeconds}
              onChange={(e) => set({ timeoutSeconds: Number(e.target.value) })}
              style={{
                width: "100%",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                color: "var(--text-primary)",
                padding: "6px 10px",
                fontSize: 13,
                outline: "none",
              }}
            />
          </Field>
        </div>
      </div>

      <Field label="Tags (comma-separated)">
        <Input
          value={config.tags.join(", ")}
          onChange={(v) => set({ tags: v.split(",").map((t) => t.trim()).filter(Boolean) })}
          placeholder="tag1, tag2"
        />
      </Field>
    </div>
  );
}
