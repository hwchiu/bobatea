# tMIC Workspace Phase 1 — Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the eggroll card-game frontend with a Low-Code API Crawler Designer (Postman-like UI) — Phase 1 is frontend-only with mock data, no real backend.

**Architecture:** Next.js 16 App Router static export (`output: "export"`, `basePath: "/eggroll"`). All pages are client components under `app/`. Mock data lives in `data/`. Shared types in `lib/types.ts`. No API routes (static export doesn't support them) — "Try It Out" uses direct browser `fetch`.

**Tech Stack:** Next.js 16.2.3, React 19, TypeScript, Tailwind CSS v4, lucide-react

---

## File Map

### Files to DELETE (existing card-game/dashboard content)
- `app/page.tsx` — replace entirely
- `app/globals.css` — replace CSS variables
- `components/` — delete entire directory (AIBreakdown, ContributionGraph, LiveTicker, etc.)
- `data/cards.ts`, `data/monitoring.ts` — delete
- Any other existing component files

### Files to CREATE

**Core layout:**
- `components/layout/Shell.tsx` — root wrapper: sidebar + main content area
- `components/layout/Sidebar.tsx` — left nav: logo, nav items (API Crawler, Jobs, Settings)
- `components/layout/Header.tsx` — top bar: page title + action buttons

**API Crawler page — Postman-like designer:**
- `app/api-crawler/page.tsx` — main page, composes all subcomponents
- `components/api-crawler/EndpointBar.tsx` — HTTP method dropdown + URL input + Send button
- `components/api-crawler/ParamsEditor.tsx` — tabbed editor: Query / Path / Headers / Body (JSON textarea)
- `components/api-crawler/AuthEditor.tsx` — auth type selector (None / Bearer / Basic / API Key) + fields
- `components/api-crawler/ResponseViewer.tsx` — status badge, headers preview, JSON pretty-print with syntax color
- `components/api-crawler/SchemaEditor.tsx` — editable schema table (field name, type, path) inferred from response
- `components/api-crawler/DagConfigPanel.tsx` — schedule, output format, tags; Save As Crawler button

**Jobs page:**
- `app/jobs/page.tsx` — jobs list page
- `components/jobs/JobList.tsx` — list + filter controls
- `components/jobs/JobCard.tsx` — single job row: name, schedule, last run status, duration

**Data + utilities:**
- `lib/types.ts` — all shared TypeScript types
- `lib/apiClient.ts` — `executeRequest(config)` → `Promise<ApiResponse>` (wraps fetch)
- `lib/schemaInfer.ts` — `inferSchema(json)` → `SchemaField[]`
- `data/mockCrawlers.ts` — 3 mock saved crawlers
- `data/mockJobs.ts` — 5 mock job runs

**Modified files:**
- `app/layout.tsx` — update title/metadata, add `<Shell>` wrapper
- `app/globals.css` — replace with tMIC color palette (keep Tailwind v4 `@import "tailwindcss"`)
- `app/page.tsx` — redirect to `/eggroll/api-crawler`

---

## Task 1: Cleanup + Types + Mock Data

**Files:**
- Delete: `data/cards.ts`, `data/monitoring.ts`
- Create: `lib/types.ts`
- Create: `data/mockCrawlers.ts`
- Create: `data/mockJobs.ts`

- [ ] **Step 1.1: Delete old data files**

```bash
cd /path/to/eggroll   # local clone of hwchiu/eggroll
git rm -r components/ data/ 2>/dev/null || rm -rf components/ data/
mkdir -p lib data components/layout components/api-crawler components/jobs
```

- [ ] **Step 1.2: Create `lib/types.ts`**

```typescript
// lib/types.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export type AuthType = "none" | "bearer" | "basic" | "api_key";

export interface AuthConfig {
  type: AuthType;
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
}

export type BodyType = "none" | "json" | "form";

export interface RequestConfig {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  pathParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  bodyJson: string;
  auth: AuthConfig;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  durationMs: number;
  error?: string;
}

export type FieldType = "string" | "number" | "boolean" | "array" | "object" | "null";

export interface SchemaField {
  id: string;
  name: string;
  path: string;        // dot-notation e.g. "data.items[].price"
  type: FieldType;
  description: string;
  required: boolean;
}

export type OutputFormat = "json" | "csv" | "parquet";

export interface DagConfig {
  crawlerName: string;
  schedule: string;         // cron expression
  outputFormat: OutputFormat;
  outputPath: string;
  tags: string[];
  retries: number;
  timeoutSeconds: number;
}

export interface SavedCrawler {
  id: string;
  name: string;
  request: RequestConfig;
  schema: SchemaField[];
  dagConfig: DagConfig;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "success" | "failed" | "running" | "pending";

export interface JobRun {
  id: string;
  crawlerId: string;
  crawlerName: string;
  status: JobStatus;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  recordsCollected: number | null;
  errorMessage: string | null;
  schedule: string;
}
```

- [ ] **Step 1.3: Create `data/mockCrawlers.ts`**

```typescript
// data/mockCrawlers.ts
import type { SavedCrawler } from "@/lib/types";

export const mockCrawlers: SavedCrawler[] = [
  {
    id: "crawler-001",
    name: "GitHub Trending Repos",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-10T08:30:00Z",
    request: {
      id: "req-001",
      name: "GitHub Trending Repos",
      method: "GET",
      url: "https://api.github.com/search/repositories",
      queryParams: [
        { id: "q1", key: "q", value: "language:typescript", enabled: true },
        { id: "q2", key: "sort", value: "stars", enabled: true },
        { id: "q3", key: "order", value: "desc", enabled: true },
        { id: "q4", key: "per_page", value: "30", enabled: true },
      ],
      pathParams: [],
      headers: [
        { id: "h1", key: "Accept", value: "application/vnd.github.v3+json", enabled: true },
      ],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    schema: [
      { id: "s1", name: "repo_id", path: "items[].id", type: "number", description: "GitHub repo ID", required: true },
      { id: "s2", name: "full_name", path: "items[].full_name", type: "string", description: "owner/repo", required: true },
      { id: "s3", name: "stars", path: "items[].stargazers_count", type: "number", description: "Star count", required: true },
      { id: "s4", name: "language", path: "items[].language", type: "string", description: "Primary language", required: false },
    ],
    dagConfig: {
      crawlerName: "github_trending_repos",
      schedule: "0 6 * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/github/trending/",
      tags: ["github", "trending"],
      retries: 2,
      timeoutSeconds: 120,
    },
  },
  {
    id: "crawler-002",
    name: "Exchange Rate USD/TWD",
    createdAt: "2026-05-20T14:00:00Z",
    updatedAt: "2026-06-09T12:00:00Z",
    request: {
      id: "req-002",
      name: "Exchange Rate USD/TWD",
      method: "GET",
      url: "https://api.exchangerate-api.com/v4/latest/USD",
      queryParams: [],
      pathParams: [],
      headers: [],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    schema: [
      { id: "s1", name: "base", path: "base", type: "string", description: "Base currency", required: true },
      { id: "s2", name: "twd_rate", path: "rates.TWD", type: "number", description: "TWD exchange rate", required: true },
      { id: "s3", name: "date", path: "date", type: "string", description: "Rate date", required: true },
    ],
    dagConfig: {
      crawlerName: "exchange_rate_usd_twd",
      schedule: "0 * * * *",
      outputFormat: "csv",
      outputPath: "s3://tmic-data/finance/exchange/",
      tags: ["finance", "exchange"],
      retries: 3,
      timeoutSeconds: 30,
    },
  },
  {
    id: "crawler-003",
    name: "HackerNews Top Stories",
    createdAt: "2026-06-05T09:00:00Z",
    updatedAt: "2026-06-11T07:15:00Z",
    request: {
      id: "req-003",
      name: "HackerNews Top Stories",
      method: "GET",
      url: "https://hacker-news.firebaseio.com/v0/topstories.json",
      queryParams: [],
      pathParams: [],
      headers: [],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    schema: [
      { id: "s1", name: "story_id", path: "[]", type: "number", description: "Story ID", required: true },
    ],
    dagConfig: {
      crawlerName: "hackernews_top_stories",
      schedule: "*/30 * * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/news/hackernews/",
      tags: ["news", "tech"],
      retries: 1,
      timeoutSeconds: 60,
    },
  },
];
```

- [ ] **Step 1.4: Create `data/mockJobs.ts`**

```typescript
// data/mockJobs.ts
import type { JobRun } from "@/lib/types";

export const mockJobs: JobRun[] = [
  {
    id: "job-001",
    crawlerId: "crawler-001",
    crawlerName: "GitHub Trending Repos",
    status: "success",
    startedAt: "2026-06-12T06:00:05Z",
    finishedAt: "2026-06-12T06:00:23Z",
    durationMs: 18200,
    recordsCollected: 30,
    errorMessage: null,
    schedule: "0 6 * * *",
  },
  {
    id: "job-002",
    crawlerId: "crawler-002",
    crawlerName: "Exchange Rate USD/TWD",
    status: "success",
    startedAt: "2026-06-12T08:00:01Z",
    finishedAt: "2026-06-12T08:00:04Z",
    durationMs: 3100,
    recordsCollected: 1,
    errorMessage: null,
    schedule: "0 * * * *",
  },
  {
    id: "job-003",
    crawlerId: "crawler-001",
    crawlerName: "GitHub Trending Repos",
    status: "failed",
    startedAt: "2026-06-11T06:00:05Z",
    finishedAt: "2026-06-11T06:00:35Z",
    durationMs: 30000,
    recordsCollected: null,
    errorMessage: "Timeout: API did not respond within 30s",
    schedule: "0 6 * * *",
  },
  {
    id: "job-004",
    crawlerId: "crawler-003",
    crawlerName: "HackerNews Top Stories",
    status: "running",
    startedAt: "2026-06-12T08:30:00Z",
    finishedAt: null,
    durationMs: null,
    recordsCollected: null,
    errorMessage: null,
    schedule: "*/30 * * * *",
  },
  {
    id: "job-005",
    crawlerId: "crawler-002",
    crawlerName: "Exchange Rate USD/TWD",
    status: "pending",
    startedAt: "2026-06-12T09:00:00Z",
    finishedAt: null,
    durationMs: null,
    recordsCollected: null,
    errorMessage: null,
    schedule: "0 * * * *",
  },
];
```

- [ ] **Step 1.5: Commit**

```bash
git add lib/ data/
git commit -m "feat(tmic): add types, mock crawlers, mock jobs"
```

---

## Task 2: CSS Theme + Layout Shell

**Files:**
- Modify: `app/globals.css`
- Create: `components/layout/Shell.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 2.1: Update `app/globals.css`**

Replace entire file contents:

```css
@import "tailwindcss";

:root {
  --bg-base:      #0f1117;
  --bg-surface:   #1a1d27;
  --bg-elevated:  #22253a;
  --border:       #2e3348;
  --text-primary: #e2e8f0;
  --text-muted:   #8892a4;
  --accent:       #6366f1;     /* indigo-500 */
  --accent-hover: #818cf8;     /* indigo-400 */
  --success:      #22c55e;
  --warning:      #f59e0b;
  --danger:       #ef4444;
  --info:         #3b82f6;
}

* { box-sizing: border-box; }

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  margin: 0;
  height: 100vh;
  overflow: hidden;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* JSON syntax highlight */
.json-key   { color: #93c5fd; }
.json-str   { color: #86efac; }
.json-num   { color: #fcd34d; }
.json-bool  { color: #f9a8d4; }
.json-null  { color: #94a3b8; }
```

- [ ] **Step 2.2: Create `components/layout/Sidebar.tsx`**

```tsx
// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Briefcase, Settings, Layers } from "lucide-react";

const NAV_ITEMS = [
  { href: "/eggroll/api-crawler", icon: Code2,     label: "API Crawler"  },
  { href: "/eggroll/jobs",        icon: Briefcase,  label: "My Jobs"      },
  { href: "/eggroll/settings",    icon: Settings,   label: "Settings"     },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Layers size={22} color="var(--accent)" />
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
          tMIC Workspace
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                color: active ? "var(--accent-hover)" : "var(--text-muted)",
                background: active ? "var(--bg-elevated)" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Phase 1 — MVP</span>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2.3: Create `components/layout/Header.tsx`**

```tsx
// components/layout/Header.tsx
interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <div
      style={{
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </h1>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2.4: Create `components/layout/Shell.tsx`**

```tsx
// components/layout/Shell.tsx
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "var(--bg-base)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2.5: Update `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "tMIC Workspace",
  description: "Low-Code API & AI Crawler Designer for marketing intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
```

- [ ] **Step 2.6: Update `app/page.tsx`** (redirect to api-crawler)

```tsx
// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/eggroll/api-crawler");
}
```

- [ ] **Step 2.7: Commit**

```bash
git add app/ components/layout/
git commit -m "feat(tmic): add layout shell, sidebar, header, CSS theme"
```

---

## Task 3: API Crawler — Endpoint Bar + Params Editor

**Files:**
- Create: `components/api-crawler/EndpointBar.tsx`
- Create: `components/api-crawler/ParamsEditor.tsx`

These are pure UI components — they receive state and callbacks as props (no internal state).

- [ ] **Step 3.1: Create `components/api-crawler/EndpointBar.tsx`**

```tsx
// components/api-crawler/EndpointBar.tsx
"use client";

import type { HttpMethod } from "@/lib/types";
import { Send } from "lucide-react";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "#22c55e",
  POST:   "#f59e0b",
  PUT:    "#3b82f6",
  PATCH:  "#a855f7",
  DELETE: "#ef4444",
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
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      {/* Method dropdown */}
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: METHOD_COLORS[method],
          fontWeight: 700,
          fontSize: 13,
          padding: "0 10px",
          cursor: "pointer",
          minWidth: 90,
        }}
      >
        {METHODS.map((m) => (
          <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
            {m}
          </option>
        ))}
      </select>

      {/* URL input */}
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="https://api.example.com/endpoint"
        style={{
          flex: 1,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: "var(--text-primary)",
          fontSize: 13,
          padding: "0 12px",
          fontFamily: "monospace",
          outline: "none",
        }}
      />

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={loading || !url.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 18px",
          background: loading ? "var(--border)" : "var(--accent)",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          cursor: loading || !url.trim() ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        <Send size={14} />
        {loading ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3.2: Create `components/api-crawler/ParamsEditor.tsx`**

```tsx
// components/api-crawler/ParamsEditor.tsx
"use client";

import { useState } from "react";
import type { KeyValuePair, BodyType } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

type Tab = "query" | "path" | "headers" | "body";

interface ParamsEditorProps {
  queryParams: KeyValuePair[];
  pathParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  bodyJson: string;
  onQueryParamsChange: (p: KeyValuePair[]) => void;
  onPathParamsChange: (p: KeyValuePair[]) => void;
  onHeadersChange: (h: KeyValuePair[]) => void;
  onBodyTypeChange: (t: BodyType) => void;
  onBodyJsonChange: (s: string) => void;
}

function newRow(): KeyValuePair {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

function KVTable({
  rows,
  onChange,
}: {
  rows: KeyValuePair[];
  onChange: (r: KeyValuePair[]) => void;
}) {
  const update = (id: string, field: keyof KeyValuePair, value: string | boolean) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, newRow()]);

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ width: 28, padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}></th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}>Key</th>
            <th style={{ padding: "4px 8px", color: "var(--text-muted)", textAlign: "left" }}>Value</th>
            <th style={{ width: 28 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={{ padding: "3px 8px" }}>
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
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-primary)",
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
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
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    color: "var(--text-primary)",
                    padding: "4px 8px",
                    fontSize: 12,
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <button
                  onClick={() => remove(row.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2 }}
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={add}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginTop: 8,
          padding: "5px 12px",
          background: "none",
          border: "1px dashed var(--border)",
          borderRadius: 5,
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        <Plus size={13} /> Add Row
      </button>
    </div>
  );
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "query", label: "Query Params" },
  { id: "path",  label: "Path Params"  },
  { id: "headers", label: "Headers"   },
  { id: "body",  label: "Body"         },
];

export function ParamsEditor(props: ParamsEditorProps) {
  const [tab, setTab] = useState<Tab>("query");
  const {
    queryParams, pathParams, headers, bodyType, bodyJson,
    onQueryParamsChange, onPathParamsChange, onHeadersChange,
    onBodyTypeChange, onBodyJsonChange,
  } = props;

  return (
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 12 }}>
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "9px 16px",
              background: "none",
              border: "none",
              borderBottom: tab === id ? "2px solid var(--accent)" : "2px solid transparent",
              color: tab === id ? "var(--accent-hover)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === id ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "12px 16px", flex: 1, overflow: "auto" }}>
        {tab === "query"   && <KVTable rows={queryParams}  onChange={onQueryParamsChange} />}
        {tab === "path"    && <KVTable rows={pathParams}   onChange={onPathParamsChange} />}
        {tab === "headers" && <KVTable rows={headers}      onChange={onHeadersChange} />}
        {tab === "body" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["none", "json", "form"] as BodyType[]).map((t) => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, cursor: "pointer", color: "var(--text-muted)" }}>
                  <input
                    type="radio"
                    name="bodyType"
                    value={t}
                    checked={bodyType === t}
                    onChange={() => onBodyTypeChange(t)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  {t.toUpperCase()}
                </label>
              ))}
            </div>
            {bodyType === "json" && (
              <textarea
                value={bodyJson}
                onChange={(e) => onBodyJsonChange(e.target.value)}
                placeholder='{"key": "value"}'
                rows={8}
                style={{
                  width: "100%",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  padding: "10px 12px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            )}
            {bodyType === "form" && (
              <KVTable
                rows={queryParams}
                onChange={onQueryParamsChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3.3: Commit**

```bash
git add components/api-crawler/EndpointBar.tsx components/api-crawler/ParamsEditor.tsx
git commit -m "feat(tmic): add EndpointBar and ParamsEditor components"
```

---

## Task 4: API Crawler — Auth Editor

**Files:**
- Create: `components/api-crawler/AuthEditor.tsx`

- [ ] **Step 4.1: Create `components/api-crawler/AuthEditor.tsx`**

```tsx
// components/api-crawler/AuthEditor.tsx
"use client";

import type { AuthConfig, AuthType } from "@/lib/types";

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (a: AuthConfig) => void;
}

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none",    label: "No Auth"   },
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
```

- [ ] **Step 4.2: Commit**

```bash
git add components/api-crawler/AuthEditor.tsx
git commit -m "feat(tmic): add AuthEditor component"
```

---

## Task 5: API Execution + Response Viewer

**Files:**
- Create: `lib/apiClient.ts`
- Create: `components/api-crawler/ResponseViewer.tsx`

- [ ] **Step 5.1: Create `lib/apiClient.ts`**

```typescript
// lib/apiClient.ts
import type { RequestConfig, ApiResponse, HttpMethod } from "./types";

function buildHeaders(config: RequestConfig): Record<string, string> {
  const h: Record<string, string> = {};

  // Custom headers from table
  for (const row of config.headers) {
    if (row.enabled && row.key) h[row.key] = row.value;
  }

  // Auth headers
  if (config.auth.type === "bearer" && config.auth.bearerToken) {
    h["Authorization"] = `Bearer ${config.auth.bearerToken}`;
  } else if (config.auth.type === "basic" && config.auth.basicUsername) {
    const creds = btoa(`${config.auth.basicUsername}:${config.auth.basicPassword ?? ""}`);
    h["Authorization"] = `Basic ${creds}`;
  } else if (config.auth.type === "api_key" && config.auth.apiKeyValue) {
    const headerName = config.auth.apiKeyHeader ?? "X-API-Key";
    h[headerName] = config.auth.apiKeyValue;
  }

  // Body content-type
  if (config.bodyType === "json") {
    h["Content-Type"] = "application/json";
  } else if (config.bodyType === "form") {
    h["Content-Type"] = "application/x-www-form-urlencoded";
  }

  return h;
}

function buildUrl(config: RequestConfig): string {
  let url = config.url;

  // Replace path params {:param} → value
  for (const row of config.pathParams) {
    if (row.enabled && row.key) {
      url = url.replace(`{${row.key}}`, encodeURIComponent(row.value));
      url = url.replace(`:${row.key}`, encodeURIComponent(row.value));
    }
  }

  // Append query params
  const enabledQuery = config.queryParams.filter((p) => p.enabled && p.key);
  if (enabledQuery.length > 0) {
    const qs = enabledQuery
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
    url += (url.includes("?") ? "&" : "?") + qs;
  }

  return url;
}

function buildBody(config: RequestConfig): string | undefined {
  if (config.bodyType === "json") return config.bodyJson || undefined;
  if (config.bodyType === "form") {
    const rows = config.queryParams.filter((p) => p.enabled && p.key);
    return rows.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
  }
  return undefined;
}

export async function executeRequest(config: RequestConfig): Promise<ApiResponse> {
  const url = buildUrl(config);
  const headers = buildHeaders(config);
  const body = buildBody(config);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: config.method as HttpMethod,
      headers,
      body,
    });

    const durationMs = Date.now() - start;
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => { resHeaders[key] = val; });

    let resBody: unknown;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      resBody = await res.json();
    } else {
      resBody = await res.text();
    }

    return {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body: resBody,
      durationMs,
    };
  } catch (err: unknown) {
    return {
      status: 0,
      statusText: "Network Error",
      headers: {},
      body: null,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [ ] **Step 5.2: Create `components/api-crawler/ResponseViewer.tsx`**

```tsx
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
      {/* Status bar */}
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

        {/* Tabs */}
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

      {/* Content */}
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
```

- [ ] **Step 5.3: Commit**

```bash
git add lib/apiClient.ts components/api-crawler/ResponseViewer.tsx
git commit -m "feat(tmic): add apiClient and ResponseViewer"
```

---

## Task 6: Schema Editor

**Files:**
- Create: `lib/schemaInfer.ts`
- Create: `components/api-crawler/SchemaEditor.tsx`

- [ ] **Step 6.1: Create `lib/schemaInfer.ts`**

```typescript
// lib/schemaInfer.ts
import type { SchemaField, FieldType } from "./types";

function getType(val: unknown): FieldType {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val as FieldType;
}

function flattenObject(obj: unknown, prefix: string, out: SchemaField[]): void {
  if (obj === null || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      flattenObject(obj[0], prefix + "[]", out);
    } else {
      out.push({
        id: crypto.randomUUID(),
        name: prefix.replace(/.*\./, "").replace("[]", ""),
        path: prefix,
        type: "array",
        description: "",
        required: false,
      });
    }
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const type = getType(value);

    if (type === "object" || type === "array") {
      flattenObject(value, path, out);
    } else {
      out.push({
        id: crypto.randomUUID(),
        name: key,
        path,
        type,
        description: "",
        required: false,
      });
    }
  }
}

export function inferSchema(data: unknown): SchemaField[] {
  const fields: SchemaField[] = [];
  flattenObject(data, "", fields);
  // Deduplicate by path
  const seen = new Set<string>();
  return fields.filter((f) => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}
```

- [ ] **Step 6.2: Create `components/api-crawler/SchemaEditor.tsx`**

```tsx
// components/api-crawler/SchemaEditor.tsx
"use client";

import type { SchemaField, FieldType } from "@/lib/types";
import { Trash2, Wand2 } from "lucide-react";

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "array", "object", "null"];

interface SchemaEditorProps {
  fields: SchemaField[];
  onFieldsChange: (f: SchemaField[]) => void;
  onInferFromResponse: () => void;
  hasResponse: boolean;
}

function cellInput(style?: React.CSSProperties): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "4px 6px",
    fontSize: 12,
    fontFamily: "monospace",
    width: "100%",
    outline: "none",
    ...style,
  };
}

export function SchemaEditor({ fields, onFieldsChange, onInferFromResponse, hasResponse }: SchemaEditorProps) {
  const update = (id: string, field: keyof SchemaField, value: string | boolean) =>
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  const remove = (id: string) => onFieldsChange(fields.filter((f) => f.id !== id));

  return (
    <div style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Response Schema</span>
        <button
          onClick={onInferFromResponse}
          disabled={!hasResponse}
          title={hasResponse ? "Auto-detect fields from response" : "Send a request first"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            background: hasResponse ? "var(--accent)" : "var(--border)",
            border: "none",
            borderRadius: 5,
            color: hasResponse ? "#fff" : "var(--text-muted)",
            cursor: hasResponse ? "pointer" : "not-allowed",
            fontSize: 12,
          }}
        >
          <Wand2 size={13} /> Infer from Response
        </button>
      </div>

      {fields.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
          No schema defined. Send a request and click "Infer from Response".
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Field Name", "Path", "Type", "Description", "Required", ""].map((h) => (
                <th key={h} style={{ padding: "5px 8px", color: "var(--text-muted)", textAlign: "left", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.name} onChange={(e) => update(f.id, "name", e.target.value)} style={cellInput()} />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.path} onChange={(e) => update(f.id, "path", e.target.value)} style={cellInput({ color: "#93c5fd" })} />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <select
                    value={f.type}
                    onChange={(e) => update(f.id, "type", e.target.value)}
                    style={{ ...cellInput({ fontFamily: "inherit" }), border: "1px solid var(--border)" }}
                  >
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <input value={f.description} onChange={(e) => update(f.id, "description", e.target.value)} placeholder="Description..." style={cellInput()} />
                </td>
                <td style={{ padding: "3px 4px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => update(f.id, "required", e.target.checked)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                </td>
                <td style={{ padding: "3px 4px" }}>
                  <button onClick={() => remove(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 6.3: Commit**

```bash
git add lib/schemaInfer.ts components/api-crawler/SchemaEditor.tsx
git commit -m "feat(tmic): add schemaInfer utility and SchemaEditor"
```

---

## Task 7: DAG Config Panel

**Files:**
- Create: `components/api-crawler/DagConfigPanel.tsx`

- [ ] **Step 7.1: Create `components/api-crawler/DagConfigPanel.tsx`**

```tsx
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
          Examples: <code>0 6 * * *</code> (daily 6am) · <code>*/30 * * * *</code> (every 30m)
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
          <Field label="Timeout (seconds)">
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
```

- [ ] **Step 7.2: Commit**

```bash
git add components/api-crawler/DagConfigPanel.tsx
git commit -m "feat(tmic): add DagConfigPanel"
```

---

## Task 8: API Crawler Page — Compose All Components

**Files:**
- Create: `app/api-crawler/page.tsx`

This is the main page that owns all state and composes EndpointBar, ParamsEditor, AuthEditor, ResponseViewer, SchemaEditor, DagConfigPanel.

Layout: top half = EndpointBar + left pane (ParamsEditor + Auth) + right pane (Response). Bottom half = Schema + DAG config.

- [ ] **Step 8.1: Create `app/api-crawler/page.tsx`**

```tsx
// app/api-crawler/page.tsx
"use client";

import { useState } from "react";
import type { RequestConfig, ApiResponse, SchemaField, DagConfig } from "@/lib/types";
import { EndpointBar } from "@/components/api-crawler/EndpointBar";
import { ParamsEditor } from "@/components/api-crawler/ParamsEditor";
import { AuthEditor } from "@/components/api-crawler/AuthEditor";
import { ResponseViewer } from "@/components/api-crawler/ResponseViewer";
import { SchemaEditor } from "@/components/api-crawler/SchemaEditor";
import { DagConfigPanel } from "@/components/api-crawler/DagConfigPanel";
import { Header } from "@/components/layout/Header";
import { executeRequest } from "@/lib/apiClient";
import { inferSchema } from "@/lib/schemaInfer";

const DEFAULT_REQUEST: RequestConfig = {
  id: "new",
  name: "Untitled Request",
  method: "GET",
  url: "",
  queryParams: [],
  pathParams: [],
  headers: [],
  bodyType: "none",
  bodyJson: "",
  auth: { type: "none" },
};

const DEFAULT_DAG: DagConfig = {
  crawlerName: "",
  schedule: "0 6 * * *",
  outputFormat: "json",
  outputPath: "s3://tmic-data/",
  tags: [],
  retries: 2,
  timeoutSeconds: 120,
};

type LeftTab = "params" | "auth";

export default function ApiCrawlerPage() {
  const [request, setRequest] = useState<RequestConfig>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [dagConfig, setDagConfig] = useState<DagConfig>(DEFAULT_DAG);
  const [leftTab, setLeftTab] = useState<LeftTab>("params");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const setReq = (patch: Partial<RequestConfig>) => setRequest((r) => ({ ...r, ...patch }));

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await executeRequest(request);
      setResponse(res);
    } finally {
      setLoading(false);
    }
  }

  function handleInferSchema() {
    if (!response?.body) return;
    setSchema(inferSchema(response.body));
  }

  function handleSaveCrawler() {
    setSaveMsg(`Crawler "${dagConfig.crawlerName || request.name}" saved! (mock)`);
    setTimeout(() => setSaveMsg(null), 3000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="API Crawler Designer" />

      {/* Endpoint bar */}
      <EndpointBar
        method={request.method}
        url={request.url}
        loading={loading}
        onMethodChange={(m) => setReq({ method: m })}
        onUrlChange={(url) => setReq({ url })}
        onSend={handleSend}
      />

      {saveMsg && (
        <div style={{ background: "var(--success)", color: "#000", padding: "6px 16px", fontSize: 13, fontWeight: 600 }}>
          ✓ {saveMsg}
        </div>
      )}

      {/* Main split: left params/auth + right response */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        {/* Left pane */}
        <div style={{ width: "50%", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Left tab toggle */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 8 }}>
            {(["params", "auth"] as LeftTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                style={{
                  padding: "9px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: leftTab === t ? "2px solid var(--accent)" : "2px solid transparent",
                  color: leftTab === t ? "var(--accent-hover)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: leftTab === t ? 600 : 400,
                }}
              >
                {t === "params" ? "Params" : "Auth"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {leftTab === "params" ? (
              <ParamsEditor
                queryParams={request.queryParams}
                pathParams={request.pathParams}
                headers={request.headers}
                bodyType={request.bodyType}
                bodyJson={request.bodyJson}
                onQueryParamsChange={(p) => setReq({ queryParams: p })}
                onPathParamsChange={(p) => setReq({ pathParams: p })}
                onHeadersChange={(h) => setReq({ headers: h })}
                onBodyTypeChange={(t) => setReq({ bodyType: t })}
                onBodyJsonChange={(s) => setReq({ bodyJson: s })}
              />
            ) : (
              <AuthEditor auth={request.auth} onChange={(a) => setReq({ auth: a })} />
            )}
          </div>
        </div>

        {/* Right pane — Response */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>

      {/* Bottom split: schema + dag config */}
      <div style={{ height: 280, display: "flex", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ flex: 1, borderRight: "1px solid var(--border)", overflow: "auto" }}>
          <SchemaEditor
            fields={schema}
            onFieldsChange={setSchema}
            onInferFromResponse={handleInferSchema}
            hasResponse={!!response?.body}
          />
        </div>
        <div style={{ width: 380, overflow: "auto" }}>
          <DagConfigPanel config={dagConfig} onChange={setDagConfig} onSave={handleSaveCrawler} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add app/api-crawler/
git commit -m "feat(tmic): compose API Crawler Designer page"
```

---

## Task 9: Jobs Page

**Files:**
- Create: `components/jobs/JobCard.tsx`
- Create: `components/jobs/JobList.tsx`
- Create: `app/jobs/page.tsx`
- Create: `app/settings/page.tsx` (placeholder)

- [ ] **Step 9.1: Create `components/jobs/JobCard.tsx`**

```tsx
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr 120px 120px 120px",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
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
      {job.errorMessage && (
        <div style={{ gridColumn: "1 / -1", marginTop: 4, padding: "5px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 5, fontSize: 12, color: "var(--danger)" }}>
          {job.errorMessage}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9.2: Create `components/jobs/JobList.tsx`**

```tsx
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
      {/* Filters */}
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

      {/* Column headers */}
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

      {/* Jobs */}
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
```

- [ ] **Step 9.3: Create `app/jobs/page.tsx`**

```tsx
// app/jobs/page.tsx
import { Header } from "@/components/layout/Header";
import { JobList } from "@/components/jobs/JobList";
import { mockJobs } from "@/data/mockJobs";

export default function JobsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Header title="My Jobs" />
      <JobList jobs={mockJobs} />
    </div>
  );
}
```

- [ ] **Step 9.4: Create `app/settings/page.tsx`**

```tsx
// app/settings/page.tsx
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="Settings" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Settings — coming in Phase 2
      </div>
    </div>
  );
}
```

- [ ] **Step 9.5: Commit**

```bash
git add components/jobs/ app/jobs/ app/settings/
git commit -m "feat(tmic): add Jobs page and Settings placeholder"
```

---

## Task 10: Build + Deploy

**Files:**
- Create: `/etc/nginx/sites-available/hwchiu.com` (nginx config)
- Server commands only (no repo files)

- [ ] **Step 10.1: Install dependencies and verify build locally**

```bash
cd /path/to/eggroll-local-clone
npm install
npm run build
# Expected: creates out/ directory with static files
# Expected output ends with: "Export successful. Pages: ..."
# If build fails, read the error — common issues:
#   - "use client" missing on components using hooks → add "use client"
#   - Import path wrong → check @/ alias resolves via tsconfig paths
```

- [ ] **Step 10.2: Clone and build on the server**

```bash
# On the server (ubuntu@hwchiu.com)
cd /home/ubuntu
git clone https://github.com/hwchiu/eggroll.git eggroll-app
cd eggroll-app
npm install
npm run build
# out/ directory is now ready
```

- [ ] **Step 10.3: Start serve process with pm2**

```bash
cd /home/ubuntu/eggroll-app
pm2 start "npx serve -s out -p 4174" --name eggroll
pm2 save
# Verify: curl http://localhost:4174/eggroll/
# Expected: HTML response with "tMIC Workspace"
```

- [ ] **Step 10.4: Add nginx config for hwchiu.com /eggroll path**

The server uses the default nginx catch-all (server_name `_`). Edit `/etc/nginx/sites-available/default` to add the `/eggroll/` location block **inside the existing default server block**:

```nginx
location /eggroll/ {
    proxy_pass http://localhost:4174/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

```bash
sudo nginx -t          # verify config
sudo nginx -s reload   # apply changes
```

- [ ] **Step 10.5: Smoke test**

```bash
curl -s -o /dev/null -w "%{http_code}" http://hwchiu.com/eggroll/
# Expected: 200
curl -s http://hwchiu.com/eggroll/ | grep -c "tMIC"
# Expected: 1 or more
```

- [ ] **Step 10.6: Create final commit + push**

```bash
cd /path/to/eggroll-local-clone
git add docs/
git commit -m "docs: add Phase 1 implementation plan"
git push origin main
```

---

## Self-Review Checklist

### Spec Coverage

| Spec requirement | Covered by |
|---|---|
| Postman-like endpoint + method selector | Task 3 EndpointBar |
| Query / Path / Headers / Body params | Task 3 ParamsEditor |
| Auth configuration (Bearer, Basic, API Key) | Task 4 AuthEditor |
| Execute API call from browser | Task 5 apiClient |
| Response viewer with syntax highlight | Task 5 ResponseViewer |
| Schema infer from response | Task 6 schemaInfer + SchemaEditor |
| Schema field editor (name, type, path, required) | Task 6 SchemaEditor |
| DAG config (schedule, output format, tags) | Task 7 DagConfigPanel |
| Save Crawler button (mock) | Task 7 DagConfigPanel + Task 8 page |
| My Jobs list with status + filter | Task 9 |
| Left nav sidebar | Task 2 Sidebar |
| Deploy to hwchiu.com/eggroll | Task 10 |

### Placeholder Scan
- No "TBD", "TODO", or "implement later" present in code steps
- All code blocks are complete

### Type Consistency
- `RequestConfig`, `ApiResponse`, `SchemaField`, `DagConfig`, `JobRun` all defined in Task 1 `lib/types.ts` and consistently referenced in all subsequent tasks
- `executeRequest(config: RequestConfig): Promise<ApiResponse>` defined in Task 5, called in Task 8
- `inferSchema(data: unknown): SchemaField[]` defined in Task 6, called in Task 8
- `SchemaEditor.onInferFromResponse` callback matches Task 8 `handleInferSchema`
