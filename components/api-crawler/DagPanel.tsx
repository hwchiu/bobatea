// components/api-crawler/DagPanel.tsx
"use client";

import { Download, Save } from "lucide-react";
import type { DagConfig, OutputFormat } from "@/lib/types";

const OUTPUT_FORMATS: OutputFormat[] = ["json", "csv", "parquet"];

interface DagPanelProps {
  config: DagConfig;
  onChange: (c: DagConfig) => void;
  onSave: () => void;
  onDownload: () => void;
}

function inputSx(): React.CSSProperties {
  return {
    width: "100%",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "5px 8px",
    fontSize: 12,
    outline: "none",
    boxSizing: "border-box",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{
        display: "block",
        fontSize: 10,
        color: "var(--text-muted)",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function DagPanel({ config, onChange, onSave, onDownload }: DagPanelProps) {
  const set = (patch: Partial<DagConfig>) => onChange({ ...config, ...patch });

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
          DAG Config
        </span>
        <button
          onClick={onSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--accent)",
            border: "none",
            borderRadius: 4,
            color: "#fff",
            padding: "3px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Save size={11} /> Save
        </button>
        <button
          onClick={onDownload}
          title="Generate Airflow DAG and download the .py file"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--success)",
            border: "none",
            borderRadius: 4,
            color: "#fff",
            padding: "3px 10px",
            fontSize: 11,
            cursor: "pointer",
            fontWeight: 600,
            marginLeft: 6,
          }}
        >
          <Download size={11} /> DAG
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
        <Field label="Crawler Name">
          <input
            value={config.crawlerName}
            onChange={(e) => set({ crawlerName: e.target.value })}
            placeholder="my_crawler"
            style={{ ...inputSx(), fontFamily: "monospace" }}
          />
        </Field>
        <Field label="Schedule (cron)">
          <input
            value={config.schedule}
            onChange={(e) => set({ schedule: e.target.value })}
            placeholder="0 6 * * *"
            style={{ ...inputSx(), fontFamily: "monospace" }}
          />
        </Field>
        <Field label="Output Format">
          <select value={config.outputFormat} onChange={(e) => set({ outputFormat: e.target.value as OutputFormat })} style={inputSx()}>
            {OUTPUT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Output Path">
          <input
            value={config.outputPath}
            onChange={(e) => set({ outputPath: e.target.value })}
            placeholder="s3://bucket/path/"
            style={{ ...inputSx(), fontFamily: "monospace" }}
          />
        </Field>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Field label="Retries">
              <input
                type="number"
                min={0}
                max={10}
                value={config.retries}
                onChange={(e) => set({ retries: Number(e.target.value) })}
                style={inputSx()}
              />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Timeout (s)">
              <input
                type="number"
                min={5}
                value={config.timeoutSeconds}
                onChange={(e) => set({ timeoutSeconds: Number(e.target.value) })}
                style={inputSx()}
              />
            </Field>
          </div>
        </div>
        <Field label="Tags (comma separated)">
          <input
            value={config.tags.join(", ")}
            onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            placeholder="tag1, tag2"
            style={inputSx()}
          />
        </Field>
      </div>
    </div>
  );
}
