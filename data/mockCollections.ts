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
      { id: "s1", name: "symbol",    path: "symbol[0]",    type: "string",  description: "Ticker symbol",     required: true  },
      { id: "s2", name: "last",      path: "last[0]",      type: "number",  description: "Last traded price", required: true  },
      { id: "s3", name: "change",    path: "change[0]",    type: "number",  description: "Price change",      required: true  },
      { id: "s4", name: "changepct", path: "changepct[0]", type: "number",  description: "% change",          required: true  },
      { id: "s5", name: "volume",    path: "volume[0]",    type: "number",  description: "Trade volume",      required: false },
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
        { id: "p1", key: "period", value: "Q2",         enabled: true  },
        { id: "p2", key: "year",   value: "2025",       enabled: true  },
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
      { id: "s1", name: "symbol",        path: "symbol",         type: "string",  description: "Ticker",         required: true  },
      { id: "s2", name: "eps_actual",    path: "eps.actual",     type: "number",  description: "Actual EPS",     required: true  },
      { id: "s3", name: "eps_surprise",  path: "eps.surprise",   type: "number",  description: "EPS surprise %", required: true  },
      { id: "s4", name: "revenue_actual",path: "revenue.actual", type: "number",  description: "Revenue USD",    required: true  },
      { id: "s5", name: "report_date",   path: "reportDate",     type: "string",  description: "Report date",    required: true  },
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
      { id: "s1", name: "id",        path: "id",        type: "string",  description: "Alert ID",     required: true },
      { id: "s2", name: "status",    path: "status",    type: "string",  description: "Alert status", required: true },
      { id: "s3", name: "createdAt", path: "createdAt", type: "string",  description: "Created time", required: true },
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
        { id: "p1", key: "company", value: "Broadcom",              enabled: true },
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
        marketCapUSD: 847000000000,
        employees: 20000,
        founded: 1991,
        ceo: "Hock Tan",
        description: "Broadcom Inc. designs, develops and supplies a broad range of semiconductor and infrastructure software solutions.",
        financials: { revenue2024: 51574000000, netIncome2024: 5895000000, peRatio: 31.4 },
      },
      durationMs: 312,
    },
    schema: [
      { id: "s1", name: "name",         path: "name",         type: "string",  description: "Company name",  required: true  },
      { id: "s2", name: "ticker",       path: "ticker",       type: "string",  description: "Ticker symbol", required: true  },
      { id: "s3", name: "marketCapUSD", path: "marketCapUSD", type: "number",  description: "Market cap",    required: true  },
      { id: "s4", name: "sector",       path: "sector",       type: "string",  description: "GICS sector",   required: false },
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
        { id: "p1", key: "company", value: "AVGO", enabled: true  },
        { id: "p2", key: "limit",   value: "5",    enabled: true  },
        { id: "p3", key: "lang",    value: "en",   enabled: false },
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
          { id: "n1", title: "Broadcom Reports Record Q2 Revenue of $14.9B", source: "Reuters",     publishedAt: "2025-06-04T22:15:00Z" },
          { id: "n2", title: "AVGO Stock Surges 12% After Strong Earnings Beat", source: "Bloomberg", publishedAt: "2025-06-05T09:00:00Z" },
          { id: "n3", title: "Broadcom's AI Revenue Hits $3.1B, Tripling Year-Over-Year", source: "CNBC", publishedAt: "2025-06-05T11:30:00Z" },
          { id: "n4", title: "Broadcom Raises Full-Year Revenue Forecast to $66B", source: "WSJ",       publishedAt: "2025-06-05T14:00:00Z" },
          { id: "n5", title: "Analysts Raise AVGO Price Targets Post-Earnings", source: "MarketWatch", publishedAt: "2025-06-06T08:00:00Z" },
        ],
      },
      durationMs: 156,
    },
    schema: [
      { id: "s1", name: "total",       path: "total",               type: "number",  description: "Total results",  required: true  },
      { id: "s2", name: "id",          path: "items[].id",          type: "string",  description: "News item ID",   required: true  },
      { id: "s3", name: "title",       path: "items[].title",       type: "string",  description: "Headline",       required: true  },
      { id: "s4", name: "source",      path: "items[].source",      type: "string",  description: "Publisher",      required: false },
      { id: "s5", name: "publishedAt", path: "items[].publishedAt", type: "string",  description: "Published time", required: true  },
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
          { kind: "request", id: "node-quote",    name: "Get Stock Quote", method: "GET",  requestId: "req-market-quote" },
          { kind: "request", id: "node-earnings", name: "Earnings Report", method: "GET",  requestId: "req-earnings"     },
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
