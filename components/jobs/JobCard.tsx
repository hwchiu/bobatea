// components/jobs/JobCard.tsx
import type { JobRun, JobStatus } from "@/lib/types";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

const STATUS_CONFIG: Record<JobStatus, { color: string; icon: React.ReactNode; label: string }> = {
  success: { color: "var(--success)", icon: <CheckCircle2 size={14} />, label: "Success" },
  failed:  { color: "var(--danger)",  icon: <XCircle size={14} />,      label: "Failed"  },
  running: { color: "var(--info)",    icon: <Loader2 size={14} />,      label: "Running" },
  pending: { color: "var(--warning)", icon: <Clock size={14} />,        label: "Pending" },
};

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
}

interface JobCardProps {
  job: JobRun;
}

export function JobCard({ job }: JobCardProps) {
  const { color, icon, label } = STATUS_CONFIG[job.status];

  return (
    <div style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 120px 120px 120px",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{job.crawlerName}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{job.schedule}</div>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(job.startedAt)}</div>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color, fontWeight: 500 }}>
            {icon} {label}
          </span>
        </div>
        <div style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{formatDuration(job.durationMs)}</div>
        <div style={{ color: "var(--text-muted)" }}>
          {job.recordsCollected !== null ? `${job.recordsCollected} records` : "—"}
        </div>
      </div>
      {job.errorMessage && (
        <div style={{ margin: "0 16px 10px", padding: "5px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 5, fontSize: 12, color: "var(--danger)" }}>
          {job.errorMessage}
        </div>
      )}
    </div>
  );
}
