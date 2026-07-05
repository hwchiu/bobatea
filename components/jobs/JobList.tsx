// components/jobs/JobList.tsx
"use client";

import { useState } from "react";
import type { JobRun, JobStatus } from "@/lib/types";
import { JobCard } from "./JobCard";
import { Search } from "lucide-react";

interface JobListProps {
  jobs: JobRun[];
}

const STATUS_FILTERS: { value: JobStatus | "all"; label: string }[] = [
  { value: "all",     label: "All"     },
  { value: "success", label: "Success" },
  { value: "failed",  label: "Failed"  },
  { value: "running", label: "Running" },
  { value: "pending", label: "Pending" },
];

export function JobList({ jobs }: JobListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  const filtered = jobs.filter((j) => {
    const matchSearch = j.crawlerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crawlers…"
            style={{
              width: "100%",
              padding: "6px 10px 6px 30px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              style={{
                padding: "5px 12px",
                background: statusFilter === value ? "var(--accent)" : "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                color: statusFilter === value ? "#fff" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: statusFilter === value ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr 120px 120px 120px",
        gap: 12,
        padding: "8px 16px",
        borderBottom: "1px solid var(--border)",
        fontSize: 11,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}>
        <span>Crawler</span>
        <span>Started (UTC+8)</span>
        <span>Status</span>
        <span>Duration</span>
        <span>Records</span>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
            No jobs match your filters.
          </div>
        ) : (
          filtered.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
