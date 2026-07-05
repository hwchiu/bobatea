# API Crawler Postman-Inspired Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/api-crawler` into a professional Postman-like IDE with Activity Bar, Collections Tree, tabbed Request Editor, Response Panel, and right-side Schema/DAG slide-in panels.

**Architecture:** New layout wraps all sub-components in `app/api-crawler/page.tsx`. Activity Bar (44px) + Collections Tree (240px) on the left; tabbed request editor + response panel in the main area; Right Icon Bar (44px) + optional slide-in panels on the right. A rich mock collections data file drives the tree and pre-fills request forms.

**Tech Stack:** Next.js 16 static export, React, TypeScript, Tailwind-free (inline styles + CSS variables), lucide-react icons.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/types.ts` | Modify | Add `CollectionNode` type |
| `data/mockCollections.ts` | Create | Tree mock data with full API requests + responses |
| `app/globals.css` | Modify | Professional dark palette, method badge classes |
| `components/api-crawler/EndpointBar.tsx` | Modify | Muted method colours, updated layout |
| `components/api-crawler/ActivityBar.tsx` | Create | 44px left icon strip |
| `components/api-crawler/CollectionsTree.tsx` | Create | 240px nested collections tree sidebar |
| `components/api-crawler/RequestBreadcrumb.tsx` | Create | Breadcrumb bar + editable request name + Save |
| `components/api-crawler/RequestTabs.tsx` | Create | Merged Params/Auth/Headers/Body tabbed editor |
| `components/api-crawler/ResponsePanel.tsx` | Create | Enhanced response viewer, Body/Headers/Preview sub-tabs |
| `components/api-crawler/RightIconBar.tsx` | Create | 44px right icon strip (Schema / DAG toggles) |
| `components/api-crawler/SchemaPanel.tsx` | Create | 300px right slide-in panel — Response Schema |
| `components/api-crawler/DagPanel.tsx` | Create | 300px right slide-in panel — DAG Configuration |
| `app/api-crawler/page.tsx` | Rewrite | New layout wiring all components |

Old components (`ParamsEditor`, `AuthEditor`, `ResponseViewer`, `SchemaEditor`, `DagConfigPanel`) are left in place as dead code — do not delete them, they are not imported in the new page.

---

## Task 1: Add CollectionNode Type

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add the type** at the end of `lib/types.ts`:

```typescript
// --- Collections Tree ---

export type CollectionNode =
  | { kind: "collection"; id: string; name: string; children: CollectionNode[] }
  | { kind: "folder";     id: string; name: string; children: CollectionNode[] }
  | { kind: "request";    id: string; name: string; method: HttpMethod; requestId: string };

export interface MockRequest {
  config: RequestConfig;
  mockResponse: ApiResponse;
  schema: SchemaField[];
  dagConfig: DagConfig;
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add lib/types.ts
git commit -m "feat: add CollectionNode and MockRequest types"
```

---

## Task 2: Create Mock Collections Data

**Files:**
- Create: `data/mockCollections.ts`

This file defines two collections with real-looking requests: **Financial Data API** and **Social Intelligence**. Each request leaf references a full `MockRequest` (config, mock response, schema, dag config). The `mockRequests` map is keyed by `requestId` and is what gets loaded into the editor when a user clicks a tree node.

- [ ] **Step 1: Create `data/mockCollections.ts`**

```typescript
// data/mockCollections.ts
import type { CollectionNode, MockRequest } from "@/lib/types";

// ─── Mock Request Registry ────────────────────────────────────────────────────

export const mockRequests: Record<string, MockRequest> = {
  "req-market-quote": {
    config: {
      id: "req-market-quote",
      name: "Get Stock Quote",
      method: "GET",
      url: "https://api.marketdata.app/v1/stocks/quotes/AAPL",
      queryParams: [
        { id: "p1", key: "exchange", value: "NASDAQ", enabled: true },
        { id: "p2", key: "52week", value: "true", enabled: true },
      ],
      pathParams: [],
      headers: [
        { id: "h1", key: "Accept", value: "application/json", enabled: true },
      ],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "api_key", apiKeyHeader: "Authorization", apiKeyValue: "Bearer <token>" },
    },
    mockResponse: {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json", "x-ratelimit-remaining": "98" },
      body: {
        s: "ok",
        symbol: ["AAPL"],
        ask: [189.45],
        bid: [189.42],
        mid: [189.435],
        last: [189.50],
        change: [1.23],
        changepct: [0.65],
        volume: [58420311],
        "52weekHigh": [199.62],
        "52weekLow": [164.08],
        updated: [1717872000],
      },
      durationMs: 187,
    },
    schema: [
      { id: "s1", name: "symbol",     path: "symbol[0]",    type: "string",  description: "Ticker symbol",        required: true  },
      { id: "s2", name: "last",       path: "last[0]",      type: "number",  description: "Last traded price",    required: true  },
      { id: "s3", name: "change",     path: "change[0]",    type: "number",  description: "Price change",         required: true  },
      { id: "s4", name: "changepct",  path: "changepct[0]", type: "number",  description: "% change",             required: true  },
      { id: "s5", name: "volume",     path: "volume[0]",    type: "number",  description: "Trade volume",         required: false },
    ],
    dagConfig: {
      crawlerName: "market_quote_aapl",
      schedule: "*/15 9-16 * * 1-5",
      outputFormat: "json",
      outputPath: "s3://tmic-data/market/quotes/",
      tags: ["market", "equity", "realtime"],
      retries: 3,
      timeoutSeconds: 30,
    },
  },

  "req-earnings": {
    config: {
      id: "req-earnings",
      name: "Earnings Report",
      method: "GET",
      url: "https://api.marketdata.app/v1/stocks/earnings/AVGO",
      queryParams: [
        { id: "p1", key: "period", value: "Q2", enabled: true },
        { id: "p2", key: "year",   value: "2025", enabled: true },
        { id: "p3", key: "date",   value: "2025-06-04", enabled: false },
      ],
      pathParams: [],
      headers: [
        { id: "h1", key: "Accept", value: "application/json", enabled: true },
      ],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "api_key", apiKeyHeader: "Authorization", apiKeyValue: "Bearer <token>" },
    },
    mockResponse: {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: {
        s: "ok",
        symbol: "AVGO",
        fiscalYear: 2025,
        fiscalQuarter: 2,
        reportDate: "2025-06-04",
        eps: { estimated: 1.35, actual: 1.41, surprise: 0.044 },
        revenue: { estimated: 14200000000, actual: 14920000000, surprisePct: 5.07 },
        guidance: { revenueNextQ: "15.1B–15.5B", epsNextQ: "1.45" },
      },
      durationMs: 243,
    },
    schema: [
      { id: "s1", name: "symbol",         path: "symbol",                   type: "string",  description: "Ticker",              required: true  },
      { id: "s2", name: "eps_actual",      path: "eps.actual",               type: "number",  description: "Actual EPS",          required: true  },
      { id: "s3", name: "eps_surprise",    path: "eps.surprise",             type: "number",  description: "EPS surprise %",      required: true  },
      { id: "s4", name: "revenue_actual",  path: "revenue.actual",           type: "number",  description: "Revenue USD",         required: true  },
      { id: "s5", name: "report_date",     path: "reportDate",               type: "string",  description: "Report date",         required: true  },
    ],
    dagConfig: {
      crawlerName: "earnings_avgo_q2_2025",
      schedule: "0 6 5 6 *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/earnings/avgo/",
      tags: ["earnings", "semiconductor", "avgo"],
      retries: 2,
      timeoutSeconds: 60,
    },
  },

  "req-create-alert": {
    config: {
      id: "req-create-alert",
      name: "Create Price Alert",
      method: "POST",
      url: "https://api.tmic-internal/v1/alerts",
      queryParams: [],
      pathParams: [],
      headers: [
        { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
        { id: "h2", key: "X-User-ID",    value: "usr_42",           enabled: true },
      ],
      bodyType: "json",
      bodyJson: JSON.stringify({ ticker: "AVGO", threshold: 200.0, direction: "above", notifyEmail: "analyst@tmic.io" }, null, 2),
      auth: { type: "bearer", bearerToken: "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoidG1pYyJ9.sig" },
    },
    mockResponse: {
      status: 201,
      statusText: "Created",
      headers: { "content-type": "application/json", "location": "/v1/alerts/alrt_991" },
      body: { id: "alrt_991", ticker: "AVGO", threshold: 200.0, direction: "above", status: "active", createdAt: "2025-06-12T10:00:00Z" },
      durationMs: 98,
    },
    schema: [
      { id: "s1", name: "id",         path: "id",         type: "string",  description: "Alert ID",      required: true },
      { id: "s2", name: "status",     path: "status",     type: "string",  description: "Alert status",  required: true },
      { id: "s3", name: "createdAt",  path: "createdAt",  type: "string",  description: "Created time",  required: true },
    ],
    dagConfig: {
      crawlerName: "alert_trigger_avgo",
      schedule: "*/5 * * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/alerts/",
      tags: ["alert", "monitoring"],
      retries: 1,
      timeoutSeconds: 15,
    },
  },

  "req-company-profile": {
    config: {
      id: "req-company-profile",
      name: "Company Profile",
      method: "GET",
      url: "https://api.tmic-internal/v1/company/profile",
      queryParams: [
        { id: "p1", key: "company", value: "Broadcom", enabled: true },
        { id: "p2", key: "include", value: "financials,executives", enabled: true },
      ],
      pathParams: [],
      headers: [
        { id: "h1", key: "Accept",    value: "application/json", enabled: true },
        { id: "h2", key: "X-API-Key", value: "tmic-key-xxx",     enabled: true },
      ],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "api_key", apiKeyHeader: "X-API-Key", apiKeyValue: "tmic-key-xxx" },
    },
    mockResponse: {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: {
        name: "Broadcom Inc.",
        ticker: "AVGO",
        exchange: "NASDAQ",
        sector: "Information Technology",
        industry: "Semiconductors",
        marketCapUSD: 847_000_000_000,
        employees: 20000,
        founded: 1991,
        ceo: "Hock Tan",
        description: "Broadcom Inc. designs, develops and supplies a broad range of semiconductor and infrastructure software solutions.",
        financials: { revenue2024: 51574000000, netIncome2024: 5895000000, peRatio: 31.4 },
      },
      durationMs: 312,
    },
    schema: [
      { id: "s1", name: "name",          path: "name",          type: "string",  description: "Company name",   required: true },
      { id: "s2", name: "ticker",        path: "ticker",        type: "string",  description: "Ticker symbol",  required: true },
      { id: "s3", name: "marketCapUSD",  path: "marketCapUSD",  type: "number",  description: "Market cap",     required: true },
      { id: "s4", name: "sector",        path: "sector",        type: "string",  description: "GICS sector",    required: false },
    ],
    dagConfig: {
      crawlerName: "company_profile_broadcom",
      schedule: "0 2 * * 1",
      outputFormat: "json",
      outputPath: "s3://tmic-data/company/profiles/",
      tags: ["company", "profile", "semiconductor"],
      retries: 2,
      timeoutSeconds: 90,
    },
  },

  "req-news": {
    config: {
      id: "req-news",
      name: "Latest News",
      method: "GET",
      url: "https://api.tmic-internal/v1/news/latest",
      queryParams: [
        { id: "p1", key: "company", value: "AVGO",  enabled: true },
        { id: "p2", key: "limit",   value: "5",     enabled: true },
        { id: "p3", key: "lang",    value: "en",    enabled: false },
      ],
      pathParams: [],
      headers: [
        { id: "h1", key: "X-API-Key", value: "tmic-key-xxx", enabled: true },
      ],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    mockResponse: {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: {
        total: 5,
        items: [
          { id: "n1", title: "Broadcom Reports Record Q2 Revenue of $14.9B", source: "Reuters", publishedAt: "2025-06-04T22:15:00Z", url: "https://reuters.com/..." },
          { id: "n2", title: "AVGO Stock Surges 12% After Strong Earnings Beat", source: "Bloomberg", publishedAt: "2025-06-05T09:00:00Z", url: "https://bloomberg.com/..." },
          { id: "n3", title: "Broadcom's AI Revenue Hits $3.1B, Tripling Year-Over-Year", source: "CNBC", publishedAt: "2025-06-05T11:30:00Z", url: "https://cnbc.com/..." },
          { id: "n4", title: "Broadcom Raises Full-Year Revenue Forecast to $66B", source: "WSJ", publishedAt: "2025-06-05T14:00:00Z", url: "https://wsj.com/..." },
          { id: "n5", title: "Analysts Raise AVGO Price Targets Post-Earnings", source: "MarketWatch", publishedAt: "2025-06-06T08:00:00Z", url: "https://marketwatch.com/..." },
        ],
      },
      durationMs: 156,
    },
    schema: [
      { id: "s1", name: "total",       path: "total",              type: "number",  description: "Total results",   required: true  },
      { id: "s2", name: "id",          path: "items[].id",         type: "string",  description: "News item ID",    required: true  },
      { id: "s3", name: "title",       path: "items[].title",      type: "string",  description: "Headline",        required: true  },
      { id: "s4", name: "source",      path: "items[].source",     type: "string",  description: "Publisher",       required: false },
      { id: "s5", name: "publishedAt", path: "items[].publishedAt",type: "string",  description: "Published time",  required: true  },
    ],
    dagConfig: {
      crawlerName: "news_avgo_latest",
      schedule: "0 */4 * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/news/avgo/",
      tags: ["news", "avgo", "media"],
      retries: 2,
      timeoutSeconds: 45,
    },
  },

  "req-ai-summarize": {
    config: {
      id: "req-ai-summarize",
      name: "AI Summarize",
      method: "POST",
      url: "https://api.tmic-internal/v1/ai/summarize",
      queryParams: [],
      pathParams: [],
      headers: [
        { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      ],
      bodyType: "json",
      bodyJson: JSON.stringify({
        source_url: "https://investors.broadcom.com/news-releases/news-release-details/broadcom-inc-reports-second-quarter-fiscal-year-2025",
        model: "gpt-4o",
        prompt: "Summarize the key financial highlights, guidance, and strategic commentary from this earnings press release in 3 bullet points.",
        max_tokens: 512,
      }, null, 2),
      auth: { type: "bearer", bearerToken: "sk-tmic-xxxxxxxxxxxxxxxx" },
    },
    mockResponse: {
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json", "x-tokens-used": "387" },
      body: {
        summary: "• Broadcom posted Q2 FY2025 revenue of $14.9B, up 24% YoY, driven by AI networking and VMware integration synergies.\n• EPS of $1.41 beat consensus by $0.06; AI-related revenue reached $3.1B (3× YoY growth) as hyperscaler XPU demand accelerates.\n• Management raised full-year revenue guidance to ~$66B and expects AI segment to exceed $15B in FY2025.",
        model: "gpt-4o",
        tokensUsed: 387,
        latencyMs: 1823,
      },
      durationMs: 1823,
    },
    schema: [
      { id: "s1", name: "summary",    path: "summary",    type: "string",  description: "AI generated summary", required: true  },
      { id: "s2", name: "model",      path: "model",      type: "string",  description: "Model used",           required: true  },
      { id: "s3", name: "tokensUsed", path: "tokensUsed", type: "number",  description: "Token consumption",    required: false },
    ],
    dagConfig: {
      crawlerName: "ai_summarize_earnings",
      schedule: "0 7 * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/ai/summaries/",
      tags: ["ai", "summarize", "earnings"],
      retries: 1,
      timeoutSeconds: 120,
    },
  },
};

// ─── Collection Tree ──────────────────────────────────────────────────────────

export const mockCollections: CollectionNode[] = [
  {
    kind: "collection",
    id: "col-financial",
    name: "Financial Data API",
    children: [
      {
        kind: "folder",
        id: "fld-market",
        name: "Market Data",
        children: [
          { kind: "request", id: "node-quote",    name: "Get Stock Quote",   method: "GET",  requestId: "req-market-quote" },
          { kind: "request", id: "node-earnings", name: "Earnings Report",   method: "GET",  requestId: "req-earnings"     },
        ],
      },
      {
        kind: "folder",
        id: "fld-alerts",
        name: "Alerts",
        children: [
          { kind: "request", id: "node-alert", name: "Create Price Alert", method: "POST", requestId: "req-create-alert" },
        ],
      },
    ],
  },
  {
    kind: "collection",
    id: "col-intelligence",
    name: "Social Intelligence",
    children: [
      {
        kind: "folder",
        id: "fld-company",
        name: "Company",
        children: [
          { kind: "request", id: "node-profile", name: "Company Profile", method: "GET",  requestId: "req-company-profile" },
          { kind: "request", id: "node-news",    name: "Latest News",     method: "GET",  requestId: "req-news"            },
        ],
      },
      {
        kind: "folder",
        id: "fld-ai",
        name: "AI Processing",
        children: [
          { kind: "request", id: "node-summarize", name: "AI Summarize", method: "POST", requestId: "req-ai-summarize" },
        ],
      },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add data/mockCollections.ts
git commit -m "feat: add rich mock collections data with financial/social API requests"
```

---

## Task 3: Update CSS Palette

**Files:**
- Modify: `app/globals.css`

The `:root` block needs new professional dark palette tokens. The existing variables `--success`, `--warning`, `--danger` are retained (used by ResponsePanel). Add method badge utility classes.

- [ ] **Step 1: Replace the `:root` CSS variable block** in `app/globals.css`

Find the existing `:root { ... }` block and replace ALL variables inside it with:

```css
:root {
  /* ── Professional Dark Palette ── */
  --bg-base:        #1a1a1a;
  --bg-surface:     #242424;
  --bg-elevated:    #2e2e2e;
  --bg-hover:       #333333;
  --border:         #383838;
  --text-primary:   #d4d4d4;
  --text-muted:     #737373;
  --text-dim:       #4a4a4a;
  --accent:         #5b85e8;
  --accent-hover:   #7aa0f0;
  --success:        #6bbd72;
  --warning:        #e5a050;
  --danger:         #e06060;
  /* Method colours */
  --method-get:     #6bbd72;
  --method-post:    #e5a050;
  --method-put:     #7b9ee8;
  --method-patch:   #b388e8;
  --method-delete:  #e06060;
}
```

- [ ] **Step 2: Add method badge utility classes** at the end of `app/globals.css` (before `html.light`):

```css
/* Method badges */
.method-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  letter-spacing: 0.04em;
}
.method-get    { color: var(--method-get);    background: rgba(107,189,114,0.12); }
.method-post   { color: var(--method-post);   background: rgba(229,160, 80,0.12); }
.method-put    { color: var(--method-put);    background: rgba(123,158,232,0.12); }
.method-patch  { color: var(--method-patch);  background: rgba(179,136,232,0.12); }
.method-delete { color: var(--method-delete); background: rgba(224, 96, 96,0.12); }
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/eggroll-check
git add app/globals.css
git commit -m "feat: update CSS to professional dark palette, add method badge classes"
```

---

## Task 4: Refactor EndpointBar

**Files:**
- Modify: `components/api-crawler/EndpointBar.tsx`

Replace vivid method colours with the muted palette variables. Update layout to `height: 48px` and use `--bg-surface` background.

- [ ] **Step 1: Replace the entire file content** with:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/EndpointBar.tsx
git commit -m "feat: refactor EndpointBar with professional muted method colours"
```

---

## Task 5: Create ActivityBar

**Files:**
- Create: `components/api-crawler/ActivityBar.tsx`

44px left strip with Collections, Environments (disabled), and History (disabled) icon buttons. Active section gets a left accent border. Clicking the currently-active section toggles (collapses) the tree.

- [ ] **Step 1: Create `components/api-crawler/ActivityBar.tsx`**

```typescript
// components/api-crawler/ActivityBar.tsx
"use client";

import { FolderOpen, Globe, Clock } from "lucide-react";

type Section = "collections" | "environments" | "history";

interface ActivityBarProps {
  activeSection: Section | null;
  onSectionToggle: (s: Section) => void;
}

const BUTTONS: { section: Section; Icon: React.FC<{ size: number }>; label: string; disabled?: boolean }[] = [
  { section: "collections",  Icon: FolderOpen, label: "Collections"  },
  { section: "environments", Icon: Globe,      label: "Environments", disabled: true },
  { section: "history",      Icon: Clock,      label: "History",      disabled: true },
];

export function ActivityBar({ activeSection, onSectionToggle }: ActivityBarProps) {
  return (
    <div style={{
      width: 44,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
    }}>
      {BUTTONS.map(({ section, Icon, label, disabled }) => {
        const isActive = activeSection === section;
        return (
          <button
            key={section}
            title={label}
            disabled={disabled}
            onClick={() => !disabled && onSectionToggle(section)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isActive ? "var(--bg-elevated)" : "transparent",
              border: "none",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              color: disabled ? "var(--text-dim)" : isActive ? "var(--accent)" : "var(--text-muted)",
              cursor: disabled ? "default" : "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/ActivityBar.tsx
git commit -m "feat: add ActivityBar component"
```

---

## Task 6: Create CollectionsTree

**Files:**
- Create: `components/api-crawler/CollectionsTree.tsx`

240px wide nested tree. Collections and folders can expand/collapse. Clicking a request node calls `onSelectRequest(requestId)`. Active request is highlighted. A `+` button in the header is mocked (shows tooltip).

- [ ] **Step 1: Create `components/api-crawler/CollectionsTree.tsx`**

```typescript
// components/api-crawler/CollectionsTree.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from "lucide-react";
import type { CollectionNode, HttpMethod } from "@/lib/types";
import { mockCollections } from "@/data/mockCollections";

interface CollectionsTreeProps {
  activeRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "var(--method-get)",
  POST:   "var(--method-post)",
  PUT:    "var(--method-put)",
  PATCH:  "var(--method-patch)",
  DELETE: "var(--method-delete)",
};

function TreeNode({
  node,
  depth,
  activeRequestId,
  onSelectRequest,
}: {
  node: CollectionNode;
  depth: number;
  activeRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const indent = depth * 12 + 10;

  if (node.kind === "request") {
    const isActive = activeRequestId === node.requestId;
    return (
      <button
        onClick={() => onSelectRequest(node.requestId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: `5px 8px 5px ${indent + 18}px`,
          background: isActive ? "var(--bg-elevated)" : "transparent",
          borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--text-primary)",
        }}
      >
        <span
          className={`method-badge method-${node.method.toLowerCase()}`}
          style={{ fontSize: 9, padding: "1px 4px" }}
        >
          {node.method}
        </span>
        <span style={{ fontSize: 12, color: isActive ? "var(--text-primary)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </span>
      </button>
    );
  }

  const isCollection = node.kind === "collection";
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: "100%",
          padding: `5px 8px 5px ${indent}px`,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: isCollection ? "var(--text-primary)" : "var(--text-muted)",
          fontWeight: isCollection ? 600 : 400,
          fontSize: 12,
        }}
      >
        {open
          ? <ChevronDown size={12} style={{ flexShrink: 0, color: "var(--text-dim)" }} />
          : <ChevronRight size={12} style={{ flexShrink: 0, color: "var(--text-dim)" }} />}
        {open
          ? <FolderOpen size={13} style={{ flexShrink: 0, color: isCollection ? "var(--accent)" : "var(--text-muted)" }} />
          : <Folder size={13} style={{ flexShrink: 0, color: isCollection ? "var(--accent)" : "var(--text-muted)" }} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
      </button>
      {open && node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeRequestId={activeRequestId}
          onSelectRequest={onSelectRequest}
        />
      ))}
    </div>
  );
}

export function CollectionsTree({ activeRequestId, onSelectRequest }: CollectionsTreeProps) {
  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Collections
        </span>
        <button
          title="New Collection (coming soon)"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 2, display: "flex", alignItems: "center" }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {mockCollections.map((col) => (
          <TreeNode
            key={col.id}
            node={col}
            depth={0}
            activeRequestId={activeRequestId}
            onSelectRequest={onSelectRequest}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/CollectionsTree.tsx
git commit -m "feat: add CollectionsTree component with expandable nested tree"
```

---

## Task 7: Create RequestBreadcrumb

**Files:**
- Create: `components/api-crawler/RequestBreadcrumb.tsx`

36px bar showing `Collection › Folder › RequestName`. Request name is click-to-edit. Save button on the right calls `onSave`.

- [ ] **Step 1: Create `components/api-crawler/RequestBreadcrumb.tsx`**

```typescript
// components/api-crawler/RequestBreadcrumb.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Save } from "lucide-react";

interface RequestBreadcrumbProps {
  collectionName: string;
  folderName: string;
  requestName: string;
  onRequestNameChange: (name: string) => void;
  onSave: () => void;
  saveMessage: string | null;
}

export function RequestBreadcrumb({
  collectionName,
  folderName,
  requestName,
  onRequestNameChange,
  onSave,
  saveMessage,
}: RequestBreadcrumbProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(requestName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(requestName); }, [requestName]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit() {
    const trimmed = draft.trim() || requestName;
    onRequestNameChange(trimmed);
    setEditing(false);
  }

  const sep = <span style={{ color: "var(--text-dim)", margin: "0 6px" }}>›</span>;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      height: 36,
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 12, overflow: "hidden" }}>
        <span style={{ color: "var(--text-muted)" }}>{collectionName}</span>
        {sep}
        <span style={{ color: "var(--text-muted)" }}>{folderName}</span>
        {sep}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--accent)",
              borderRadius: 3,
              color: "var(--text-primary)",
              padding: "1px 6px",
              fontSize: 12,
              outline: "none",
              minWidth: 100,
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            title="Click to rename"
            style={{ color: "var(--text-primary)", cursor: "text", borderBottom: "1px dashed var(--text-dim)" }}
          >
            {requestName}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {saveMessage && (
          <span style={{ fontSize: 11, color: "var(--success)" }}>{saveMessage}</span>
        )}
        <button
          onClick={onSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--text-muted)",
            padding: "3px 10px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <Save size={12} />
          Save
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/RequestBreadcrumb.tsx
git commit -m "feat: add RequestBreadcrumb component with inline rename and Save"
```

---

## Task 8: Create RequestTabs

**Files:**
- Create: `components/api-crawler/RequestTabs.tsx`

Four-tab component: **Params**, **Authorization**, **Headers**, **Body**. Params shows query params table. Authorization mirrors `AuthEditor`. Headers is a KV table. Body has a type selector (none/json/form) + textarea for JSON. Uses an internal `KVTable` sub-component.

- [ ] **Step 1: Create `components/api-crawler/RequestTabs.tsx`**

```typescript
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
                <input type="checkbox" checked={row.enabled} onChange={(e) => update(row.id, "enabled", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <input
                  value={row.key}
                  onChange={(e) => update(row.id, "key", e.target.value)}
                  placeholder="key"
                  style={{ width: "100%", background: "transparent", border: "1px solid transparent", borderRadius: 3, color: "var(--text-primary)", padding: "3px 6px", fontSize: 12, fontFamily: "monospace", outline: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
              </td>
              <td style={{ padding: "3px 8px" }}>
                <input
                  value={row.value}
                  onChange={(e) => update(row.id, "value", e.target.value)}
                  placeholder="value"
                  style={{ width: "100%", background: "transparent", border: "1px solid transparent", borderRadius: 3, color: "var(--text-primary)", padding: "3px 6px", fontSize: 12, fontFamily: "monospace", outline: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
                />
              </td>
              <td style={{ padding: "3px 4px", textAlign: "center" }}>
                <button onClick={() => remove(row.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 2, display: "flex", alignItems: "center" }}>
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

function inputStyle(): React.CSSProperties {
  return { width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-primary)", padding: "6px 10px", fontSize: 12, fontFamily: "monospace", outline: "none" };
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
        <select value={auth.type} onChange={(e) => set({ type: e.target.value as AuthType })} style={{ ...inputStyle(), fontFamily: "inherit" }}>
          {AUTH_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      {auth.type === "bearer" && (
        <Field label="Token">
          <input value={auth.bearerToken ?? ""} onChange={(e) => set({ bearerToken: e.target.value })} placeholder="eyJ…" style={inputStyle()} />
        </Field>
      )}
      {auth.type === "basic" && (
        <>
          <Field label="Username"><input value={auth.basicUsername ?? ""} onChange={(e) => set({ basicUsername: e.target.value })} style={inputStyle()} /></Field>
          <Field label="Password"><input type="password" value={auth.basicPassword ?? ""} onChange={(e) => set({ basicPassword: e.target.value })} style={inputStyle()} /></Field>
        </>
      )}
      {auth.type === "api_key" && (
        <>
          <Field label="Header Name"><input value={auth.apiKeyHeader ?? ""} onChange={(e) => set({ apiKeyHeader: e.target.value })} placeholder="X-API-Key" style={inputStyle()} /></Field>
          <Field label="Value"><input value={auth.apiKeyValue ?? ""} onChange={(e) => set({ apiKeyValue: e.target.value })} placeholder="your-api-key" style={inputStyle()} /></Field>
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
          placeholder='{\n  "key": "value"\n}'
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
    { id: "params",        label: "Params",        badge: paramsCount > 0 ? String(paramsCount) : undefined },
    { id: "authorization", label: "Authorization",  badge: request.auth.type !== "none" ? request.auth.type : undefined },
    { id: "headers",       label: "Headers",        badge: headersCount > 0 ? String(headersCount) : undefined },
    { id: "body",          label: "Body",           badge: hasBody ? request.bodyType : undefined },
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
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/RequestTabs.tsx
git commit -m "feat: add RequestTabs component (Params/Auth/Headers/Body)"
```

---

## Task 9: Create ResponsePanel

**Files:**
- Create: `components/api-crawler/ResponsePanel.tsx`

Replaces `ResponseViewer`. Status bar (colour-coded badge + time + size) + sub-tabs (Body / Headers / Preview). Body shows syntax-highlighted JSON using existing `.json-key`, `.json-str` CSS classes.

- [ ] **Step 1: Create `components/api-crawler/ResponsePanel.tsx`**

```typescript
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
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
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
        <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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
      {/* Status bar */}
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

        {/* Tab bar inside status strip */}
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
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/ResponsePanel.tsx
git commit -m "feat: add ResponsePanel with status bar and Body/Headers/Preview sub-tabs"
```

---

## Task 10: Create RightIconBar

**Files:**
- Create: `components/api-crawler/RightIconBar.tsx`

Mirror of ActivityBar on the right side. Two buttons: Schema and DAG. Active button gets right `2px` accent border (mirrored). Clicking an active button closes the panel.

- [ ] **Step 1: Create `components/api-crawler/RightIconBar.tsx`**

```typescript
// components/api-crawler/RightIconBar.tsx
"use client";

import { BarChart2, Settings2 } from "lucide-react";

type RightPanel = "schema" | "dag";

interface RightIconBarProps {
  activePanel: RightPanel | null;
  onPanelToggle: (p: RightPanel) => void;
}

const BUTTONS: { panel: RightPanel; Icon: React.FC<{ size: number }>; label: string }[] = [
  { panel: "schema", Icon: BarChart2, label: "Response Schema"   },
  { panel: "dag",    Icon: Settings2, label: "DAG Configuration" },
];

export function RightIconBar({ activePanel, onPanelToggle }: RightIconBarProps) {
  return (
    <div style={{
      width: 44,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border)",
    }}>
      {BUTTONS.map(({ panel, Icon, label }) => {
        const isActive = activePanel === panel;
        return (
          <button
            key={panel}
            title={label}
            onClick={() => onPanelToggle(panel)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isActive ? "var(--bg-elevated)" : "transparent",
              border: "none",
              borderRight: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/RightIconBar.tsx
git commit -m "feat: add RightIconBar component"
```

---

## Task 11: Create SchemaPanel

**Files:**
- Create: `components/api-crawler/SchemaPanel.tsx`

300px right slide-in panel. Header with "Response Schema" label + "Infer from Response" button. Table showing SchemaField records (name, path, type, required, description) with add/edit/delete. Passes full logic from old `SchemaEditor`.

- [ ] **Step 1: Create `components/api-crawler/SchemaPanel.tsx`**

```typescript
// components/api-crawler/SchemaPanel.tsx
"use client";

import { Wand2, Trash2, Plus } from "lucide-react";
import type { SchemaField, FieldType } from "@/lib/types";

const FIELD_TYPES: FieldType[] = ["string", "number", "boolean", "array", "object", "null"];

interface SchemaPanelProps {
  fields: SchemaField[];
  onFieldsChange: (f: SchemaField[]) => void;
  onInferFromResponse: () => void;
  hasResponse: boolean;
}

function cellInput(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 3,
    color: "var(--text-primary)",
    padding: "3px 5px",
    fontSize: 11,
    fontFamily: "monospace",
    width: "100%",
    outline: "none",
    ...extra,
  };
}

export function SchemaPanel({ fields, onFieldsChange, onInferFromResponse, hasResponse }: SchemaPanelProps) {
  const update = (id: string, field: keyof SchemaField, value: string | boolean) =>
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  const remove = (id: string) => onFieldsChange(fields.filter((f) => f.id !== id));
  const add = () => onFieldsChange([...fields, {
    id: crypto.randomUUID(), name: "", path: "", type: "string", description: "", required: false,
  }]);

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
          Schema
        </span>
        <button
          onClick={onInferFromResponse}
          disabled={!hasResponse}
          title="Infer schema from latest response"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "1px solid var(--border)", borderRadius: 4,
            color: hasResponse ? "var(--text-muted)" : "var(--text-dim)",
            padding: "2px 8px", fontSize: 11, cursor: hasResponse ? "pointer" : "not-allowed",
          }}
        >
          <Wand2 size={11} /> Infer
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {fields.length === 0 ? (
          <div style={{ padding: 16, color: "var(--text-dim)", fontSize: 12, textAlign: "center" }}>
            No schema fields.{"\n"}Click Infer or add manually.
          </div>
        ) : (
          fields.map((f) => (
            <div key={f.id} style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                <input value={f.name} onChange={(e) => update(f.id, "name", e.target.value)} placeholder="field_name" style={cellInput({ fontWeight: 600, flex: 1 })} />
                <select
                  value={f.type}
                  onChange={(e) => update(f.id, "type", e.target.value)}
                  style={{ ...cellInput(), width: 70, background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => remove(f.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 2, display: "flex" }}>
                  <Trash2 size={11} />
                </button>
              </div>
              <input value={f.path} onChange={(e) => update(f.id, "path", e.target.value)} placeholder="$.path.to.field" style={cellInput({ color: "var(--text-muted)", width: "100%" })} />
              <input value={f.description} onChange={(e) => update(f.id, "description", e.target.value)} placeholder="Description" style={cellInput({ color: "var(--text-muted)", width: "100%", marginTop: 2 })} />
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-dim)", marginTop: 2, cursor: "pointer" }}>
                <input type="checkbox" checked={f.required} onChange={(e) => update(f.id, "required", e.target.checked)} style={{ accentColor: "var(--accent)" }} />
                required
              </label>
            </div>
          ))
        )}
      </div>

      {/* Add row */}
      <button
        onClick={add}
        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", borderTop: "1px solid var(--border)", cursor: "pointer", color: "var(--text-muted)", padding: "6px 12px", fontSize: 12 }}
      >
        <Plus size={12} /> Add Field
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/SchemaPanel.tsx
git commit -m "feat: add SchemaPanel right slide-in component"
```

---

## Task 12: Create DagPanel

**Files:**
- Create: `components/api-crawler/DagPanel.tsx`

300px right slide-in panel. Header with "DAG Config" label + "Save Crawler" button. Input fields for all `DagConfig` properties. Logic ported from old `DagConfigPanel`.

- [ ] **Step 1: Create `components/api-crawler/DagPanel.tsx`**

```typescript
// components/api-crawler/DagPanel.tsx
"use client";

import { Save } from "lucide-react";
import type { DagConfig, OutputFormat } from "@/lib/types";

const OUTPUT_FORMATS: OutputFormat[] = ["json", "csv", "parquet"];

interface DagPanelProps {
  config: DagConfig;
  onChange: (c: DagConfig) => void;
  onSave: () => void;
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
      <label style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

export function DagPanel({ config, onChange, onSave }: DagPanelProps) {
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
            display: "flex", alignItems: "center", gap: 4,
            background: "var(--accent)", border: "none", borderRadius: 4,
            color: "#fff", padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
          }}
        >
          <Save size={11} /> Save
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
        <Field label="Crawler Name">
          <input value={config.crawlerName} onChange={(e) => set({ crawlerName: e.target.value })} placeholder="my_crawler" style={{ ...inputSx(), fontFamily: "monospace" }} />
        </Field>
        <Field label="Schedule (cron)">
          <input value={config.schedule} onChange={(e) => set({ schedule: e.target.value })} placeholder="0 6 * * *" style={{ ...inputSx(), fontFamily: "monospace" }} />
        </Field>
        <Field label="Output Format">
          <select value={config.outputFormat} onChange={(e) => set({ outputFormat: e.target.value as OutputFormat })} style={inputSx()}>
            {OUTPUT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Output Path">
          <input value={config.outputPath} onChange={(e) => set({ outputPath: e.target.value })} placeholder="s3://bucket/path/" style={{ ...inputSx(), fontFamily: "monospace" }} />
        </Field>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Field label="Retries">
              <input type="number" min={0} max={10} value={config.retries} onChange={(e) => set({ retries: Number(e.target.value) })} style={inputSx()} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Timeout (s)">
              <input type="number" min={5} value={config.timeoutSeconds} onChange={(e) => set({ timeoutSeconds: Number(e.target.value) })} style={inputSx()} />
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
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add components/api-crawler/DagPanel.tsx
git commit -m "feat: add DagPanel right slide-in component"
```

---

## Task 13: Rewrite Page Layout

**Files:**
- Modify: `app/api-crawler/page.tsx`

Full rewrite. Wires together all new components. State includes: `request`, `response`, `schema`, `dagConfig`, `activeSection` (ActivityBar), `activeRequestId`, `rightPanel`, `breadcrumb` info, `saveMsg`. Loading the `activeRequestId` populates the editor + schema + dagConfig from `mockRequests`. `handleSend` uses `executeRequest` but also pre-fills mock response if the URL is a `tmic-internal` URL.

- [ ] **Step 1: Replace the entire `app/api-crawler/page.tsx` file** with:

```typescript
// app/api-crawler/page.tsx
"use client";

import { useState, useCallback } from "react";
import type { RequestConfig, ApiResponse, SchemaField, DagConfig } from "@/lib/types";
import { ActivityBar } from "@/components/api-crawler/ActivityBar";
import { CollectionsTree } from "@/components/api-crawler/CollectionsTree";
import { RequestBreadcrumb } from "@/components/api-crawler/RequestBreadcrumb";
import { EndpointBar } from "@/components/api-crawler/EndpointBar";
import { RequestTabs } from "@/components/api-crawler/RequestTabs";
import { ResponsePanel } from "@/components/api-crawler/ResponsePanel";
import { RightIconBar } from "@/components/api-crawler/RightIconBar";
import { SchemaPanel } from "@/components/api-crawler/SchemaPanel";
import { DagPanel } from "@/components/api-crawler/DagPanel";
import { executeRequest } from "@/lib/apiClient";
import { inferSchema } from "@/lib/schemaInfer";
import { mockRequests } from "@/data/mockCollections";
import { mockCollections } from "@/data/mockCollections";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

type ActivitySection = "collections" | "environments" | "history";
type RightPanel = "schema" | "dag";

/** Walk the collections tree to find breadcrumb info for a requestId */
function findBreadcrumb(requestId: string): { collection: string; folder: string } {
  for (const col of mockCollections) {
    if (col.kind !== "collection") continue;
    for (const child of col.children) {
      if (child.kind === "folder") {
        for (const leaf of child.children) {
          if (leaf.kind === "request" && leaf.requestId === requestId) {
            return { collection: col.name, folder: child.name };
          }
        }
      }
    }
  }
  return { collection: "Collections", folder: "—" };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApiCrawlerPage() {
  const [request, setRequest] = useState<RequestConfig>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [dagConfig, setDagConfig] = useState<DagConfig>(DEFAULT_DAG);

  const [activeSection, setActiveSection] = useState<ActivitySection | null>("collections");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState({ collection: "tMIC", folder: "New" });
  const [rightPanel, setRightPanel] = useState<RightPanel | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Load a mock request into the editor
  const handleSelectRequest = useCallback((requestId: string) => {
    const mock = mockRequests[requestId];
    if (!mock) return;
    setRequest(mock.config);
    setSchema(mock.schema);
    setDagConfig(mock.dagConfig);
    setResponse(mock.mockResponse);
    setActiveRequestId(requestId);
    setBreadcrumb(findBreadcrumb(requestId));
  }, []);

  const setReq = (patch: Partial<RequestConfig>) => setRequest((r) => ({ ...r, ...patch }));

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      // Use mock response for internal/demo URLs
      if (activeRequestId && (request.url.includes("tmic-internal") || request.url.includes("marketdata.app"))) {
        const mock = mockRequests[activeRequestId];
        if (mock) {
          await new Promise((r) => setTimeout(r, mock.mockResponse.durationMs));
          setResponse(mock.mockResponse);
          return;
        }
      }
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

  function handleSave() {
    const name = dagConfig.crawlerName || request.name;
    setSaveMsg(`"${name}" saved!`);
    setTimeout(() => setSaveMsg(null), 2500);
  }

  function handleActivityToggle(section: ActivitySection) {
    setActiveSection((cur) => (cur === section ? null : section));
  }

  function handleRightPanelToggle(panel: RightPanel) {
    setRightPanel((cur) => (cur === panel ? null : panel));
  }

  const collectionsOpen = activeSection === "collections";

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>

      {/* ── Left: Activity Bar ── */}
      <ActivityBar activeSection={activeSection} onSectionToggle={handleActivityToggle} />

      {/* ── Left: Collections Tree (collapsible) ── */}
      {collectionsOpen && (
        <CollectionsTree
          activeRequestId={activeRequestId}
          onSelectRequest={handleSelectRequest}
        />
      )}

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <RequestBreadcrumb
          collectionName={breadcrumb.collection}
          folderName={breadcrumb.folder}
          requestName={request.name}
          onRequestNameChange={(name) => setReq({ name })}
          onSave={handleSave}
          saveMessage={saveMsg}
        />
        <EndpointBar
          method={request.method}
          url={request.url}
          loading={loading}
          onMethodChange={(m) => setReq({ method: m })}
          onUrlChange={(url) => setReq({ url })}
          onSend={handleSend}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: "0 0 220px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <RequestTabs request={request} onChange={setReq} />
          </div>
          <div style={{ flex: 1, display: "flex", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
            <ResponsePanel response={response} loading={loading} />
          </div>
        </div>
      </div>

      {/* ── Right: Slide-in Panels ── */}
      {rightPanel === "schema" && (
        <SchemaPanel
          fields={schema}
          onFieldsChange={setSchema}
          onInferFromResponse={handleInferSchema}
          hasResponse={!!response?.body}
        />
      )}
      {rightPanel === "dag" && (
        <DagPanel config={dagConfig} onChange={setDagConfig} onSave={handleSave} />
      )}

      {/* ── Right: Icon Bar ── */}
      <RightIconBar activePanel={rightPanel} onPanelToggle={handleRightPanelToggle} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/eggroll-check
git add app/api-crawler/page.tsx
git commit -m "feat: rewrite API Crawler page with Postman-inspired 4-panel layout"
```

---

## Task 14: Build, Deploy, and Create PR

**Files:** None (build and deployment)

- [ ] **Step 1: Run the build**

```bash
cd /tmp/eggroll-check
npm run build 2>&1
```

Expected: `✓ Compiled successfully` with no TypeScript errors. If TypeScript errors appear, fix them before proceeding.

- [ ] **Step 2: Copy output to deployment directory**

```bash
rm -rf /home/ubuntu/eggroll-out && cp -r /tmp/eggroll-check/out /home/ubuntu/eggroll-out
```

- [ ] **Step 3: Restart pm2 to serve updated files**

```bash
pm2 restart eggroll
sleep 2
pm2 list
```

Expected: pm2 process `eggroll` shows `online` status.

- [ ] **Step 4: Smoke test the deployment**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4174/api-crawler/
```

Expected: `200`

- [ ] **Step 5: Push branch and create PR**

```bash
cd /tmp/eggroll-check
git push origin fix/tmic-sidebar-routing-theme
gh pr create \
  --title "feat: API Crawler Postman-inspired redesign with Collections tree and right panels" \
  --body "## Summary
Redesigns the /api-crawler page into a professional Postman-like workspace.

### Changes
- **Layout**: Activity Bar (44px) + Collections Tree (240px) + Main Area + Right Icon Bar (44px) + optional 300px right panels
- **Mock data**: 2 collections (Financial Data API, Social Intelligence) with 6 realistic API requests including full params, responses, schemas, and DAG configs
- **New components**: ActivityBar, CollectionsTree, RequestBreadcrumb, RequestTabs, ResponsePanel, RightIconBar, SchemaPanel, DagPanel
- **Professional dark palette**: Neutral greys, single \`#5b85e8\` accent, muted method colours
- **RequestTabs**: Unified Params/Authorization/Headers/Body tabbed editor
- **ResponsePanel**: Status badge + timing + Body/Headers/Preview sub-tabs

### Demo
Visit https://hwchiu.com/eggroll/api-crawler/ after merge and deploy.

Closes #[issue-number-if-any]" \
  --base main
```

- [ ] **Step 6: Confirm PR URL is returned** by the gh command. Share it.
