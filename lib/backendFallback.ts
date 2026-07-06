import type { ChainSpec, Stage, ValidationIssue } from "./chainTypes";
import type { ApiCrawlerSpec, ApiResponse, RequestConfig } from "./types";

const LS_CONNECTORS = "bobatea-offline-connectors";
const STAGE_REF = /\{\{\s*stages\.([a-zA-Z0-9_]+)\./g;

type OfflineConnector = {
  connector_id: string;
  connector_type: "prompt_chain" | "api_crawler";
  description: string;
  status: string;
  updated_at: string;
  spec: ChainSpec | ApiCrawlerSpec;
};

function loadConnectors(): OfflineConnector[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_CONNECTORS) ?? "[]") as OfflineConnector[];
  } catch {
    return [];
  }
}

function saveConnectors(rows: OfflineConnector[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_CONNECTORS, JSON.stringify(rows));
}

function upsertConnector(row: OfflineConnector): void {
  const rows = loadConnectors();
  const next = rows.filter(
    (item) =>
      !(item.connector_type === row.connector_type && item.connector_id === row.connector_id),
  );
  next.unshift(row);
  saveConnectors(next);
}

function getConnectorRow(id: string): OfflineConnector | undefined {
  return loadConnectors().find((row) => row.connector_id === id);
}

function requireConnector(id: string): OfflineConnector {
  const row = getConnectorRow(id);
  if (!row) throw new Error(`404: connector ${id} not found`);
  return row;
}

function stamp<T extends ChainSpec | ApiCrawlerSpec>(
  connector_type: "prompt_chain" | "api_crawler",
  connector_id: string,
  spec: T,
  status: string,
): OfflineConnector {
  return {
    connector_id,
    connector_type,
    description:
      "description" in spec && typeof spec.description === "string" ? spec.description : "",
    status,
    updated_at: new Date().toISOString(),
    spec,
  };
}

function failure(message: string): never {
  throw new Error(`422: ${message}`);
}

function ancestorsOf(spec: ChainSpec): Record<string, Set<string>> {
  const parents = new Map(spec.stages.map((stage) => [stage.id, new Set(stage.depends_on)]));
  const result: Record<string, Set<string>> = {};

  function collect(id: string, seen: Set<string>): Set<string> {
    if (result[id]) return result[id];
    const acc = new Set<string>();
    for (const parent of parents.get(id) ?? []) {
      if (seen.has(parent)) continue;
      acc.add(parent);
      for (const ancestor of collect(parent, new Set([...seen, id]))) acc.add(ancestor);
    }
    result[id] = acc;
    return acc;
  }

  for (const id of parents.keys()) collect(id, new Set());
  return result;
}

export function validateChainFallback(spec: ChainSpec): {
  valid: boolean;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const ids = spec.stages.map((stage) => stage.id);
  const idSet = new Set(ids);

  if (ids.length !== idSet.size) {
    issues.push({ level: "error", message: "stage id 重複" });
  }

  const graph = new Map<string, string[]>();
  for (const stage of spec.stages) {
    for (const dep of stage.depends_on) {
      if (!idSet.has(dep)) {
        issues.push({
          level: "error",
          stage_id: stage.id,
          message: `depends_on 引用不存在的 stage: ${dep}`,
        });
      }
      graph.set(dep, [...(graph.get(dep) ?? []), stage.id]);
    }
  }

  const state = new Map<string, 0 | 1 | 2>();
  function hasCycle(id: string): boolean {
    state.set(id, 1);
    for (const next of graph.get(id) ?? []) {
      if (state.get(next) === 1) return true;
      if ((state.get(next) ?? 0) === 0 && hasCycle(next)) return true;
    }
    state.set(id, 2);
    return false;
  }

  if (ids.some((id) => (state.get(id) ?? 0) === 0 && hasCycle(id))) {
    issues.push({ level: "error", message: "stage 依賴存在環路" });
  }

  const ancestors = ancestorsOf(spec);
  for (const stage of spec.stages) {
    const texts = [
      stage.prompt?.user ?? "",
      stage.prompt?.system ?? "",
      stage.payload ?? "",
      stage.map_over ?? "",
      stage.spec ? JSON.stringify(stage.spec) : "",
    ];

    for (const text of texts) {
      for (const match of text.matchAll(STAGE_REF)) {
        const ref = match[1];
        if (!ancestors[stage.id]?.has(ref)) {
          issues.push({
            level: "error",
            stage_id: stage.id,
            message: `引用了非上游 stage 的輸出: stages.${ref}`,
          });
        }
      }
    }

    if (stage.type === "ai_call" && !stage.prompt) {
      issues.push({ level: "error", stage_id: stage.id, message: "ai_call 缺少 prompt" });
    }
    if (stage.type === "ai_call" && !stage.output_schema) {
      issues.push({
        level: "warning",
        stage_id: stage.id,
        message: "建議定義 output_schema 以啟用 structured output 驗證",
      });
    }
    if (stage.type === "transform" && (!stage.engine || !stage.spec)) {
      issues.push({
        level: "error",
        stage_id: stage.id,
        message: "transform 缺少 engine 或 spec",
      });
    }
    if (stage.type === "sink" && !stage.target) {
      issues.push({ level: "error", stage_id: stage.id, message: "sink 缺少 target" });
    }
  }

  if (spec.stages.length === 0) {
    issues.push({ level: "error", message: "chain 至少需要一個 stage" });
  }

  return { valid: !issues.some((issue) => issue.level === "error"), issues };
}

function getPathValue(input: unknown, path: string): unknown {
  let current = input;
  for (const piece of path.replace(/\[(\d+)\]/g, ".$1").split(".")) {
    if (!piece) continue;
    if (Array.isArray(current)) {
      current = current[Number(piece)];
      continue;
    }
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[piece];
      continue;
    }
    return undefined;
  }
  return current;
}

function renderTemplate(input: string, context: Record<string, unknown>): string {
  return input.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, expr: string) => {
    const value = getPathValue(context, expr.trim());
    if (value == null) return "";
    return typeof value === "string" ? value : JSON.stringify(value);
  });
}

function mockFromSchema(schema: Record<string, unknown> | undefined): unknown {
  if (!schema) {
    return {
      message:
        "Backend unavailable on the static deployment. This response was simulated in the browser.",
    };
  }

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case "object":
      return Object.fromEntries(
        Object.entries((schema.properties as Record<string, Record<string, unknown>>) ?? {}).map(
          ([key, value]) => [key, mockFromSchema(value)],
        ),
      );
    case "array":
      return [mockFromSchema((schema.items as Record<string, unknown>) ?? { type: "string" })];
    case "number":
      return 0.9;
    case "integer":
      return 1;
    case "boolean":
      return true;
    default:
      return "mock_value";
  }
}

function pythonLiteral(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None");
}

function downloadText(filename: string, content: string, mediaType = "text/plain;charset=utf-8"): void {
  if (typeof document === "undefined") {
    throw new Error("offline download is only available in the browser");
  }
  const blob = new Blob([content], { type: mediaType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function generateDagStub(kind: "prompt_chain" | "api_crawler", filename: string, spec: unknown): string {
  return [
    '"""Generated by the bobatea browser fallback."""',
    "# ponytail: GitHub Pages serves only the static UI here, so this is a minimal offline DAG stub; deploy FastAPI and set NEXT_PUBLIC_API_BASE to restore server-side generation.",
    "",
    `SPEC = ${pythonLiteral(spec)}`,
    "",
    "def main() -> None:",
    `    print("offline fallback generated ${filename}")`,
    "",
    'if __name__ == "__main__":',
    "    main()",
    "",
    `# kind: ${kind}`,
  ].join("\n");
}

export function isMissingBackendResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return response.status === 404 && contentType.includes("text/html");
}

export function isUnavailableBackendError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Failed to fetch|Load failed|NetworkError|fetch/i.test(error.message);
}

export function simulateProxyResponse(
  config: RequestConfig,
  resolvedUrl: string,
  headers: Record<string, string>,
  requestBody: string | undefined,
  durationMs: number,
): ApiResponse {
  let parsedBody: unknown = requestBody ?? null;
  if (config.bodyType === "json" && requestBody) {
    try {
      parsedBody = JSON.parse(requestBody);
    } catch {
      parsedBody = requestBody;
    }
  }

  const body = resolvedUrl.includes("news")
    ? {
        mock: true,
        message:
          "FastAPI is not deployed on this static site, so bobatea simulated the proxy response in the browser.",
        request: {
          name: config.name,
          method: config.method,
          url: resolvedUrl,
          headers,
          body: parsedBody,
        },
        data: {
          articles: [
            {
              title: "TSMC accelerates advanced packaging capacity",
              summary: "Offline demo item generated by the browser fallback.",
              score: 0.91,
              source: "mock-news-wire",
            },
          ],
        },
      }
    : {
        mock: true,
        message:
          "FastAPI is not deployed on this static site, so bobatea simulated the proxy response in the browser.",
        request: {
          name: config.name,
          method: config.method,
          url: resolvedUrl,
          headers,
          body: parsedBody,
        },
        data: {
          items: [
            {
              id: "mock-1",
              status: "ok",
              fetched_at: new Date().toISOString(),
            },
          ],
        },
      };

  return {
    status: 200,
    statusText: "Simulated Response",
    headers: {
      "content-type": "application/json",
      "x-bobatea-simulated": "true",
    },
    body,
    durationMs,
  };
}

export const studioFallback = {
  listConnectors(type?: string) {
    return loadConnectors()
      .filter((row) => !type || row.connector_type === type)
      .map(({ connector_id, connector_type, description, status, updated_at, spec }) => ({
        connector_id,
        connector_type,
        description,
        status,
        updated_at,
        spec,
      }));
  },

  getConnector(id: string) {
    const row = requireConnector(id);
    return { spec: row.spec as ChainSpec, status: row.status };
  },

  deleteConnector(id: string) {
    saveConnectors(loadConnectors().filter((row) => row.connector_id !== id));
    return { ok: true };
  },

  saveChain(spec: ChainSpec) {
    upsertConnector(stamp("prompt_chain", spec.chain_id, spec, "draft"));
    return { ok: true };
  },

  validateChain(spec: ChainSpec) {
    return validateChainFallback(spec);
  },

  publishChain(spec: ChainSpec) {
    upsertConnector(stamp("prompt_chain", spec.chain_id, spec, "published"));
    return { ok: true };
  },

  chainDag(spec: ChainSpec) {
    const result = validateChainFallback(spec);
    if (!result.valid) {
      failure(result.issues.map((issue) => issue.message).join("; "));
    }
    const filename = `prompt_chain__${spec.chain_id}.py`;
    return {
      filename,
      dag_code: generateDagStub("prompt_chain", filename, spec),
    };
  },

  downloadChainDag(spec: ChainSpec) {
    const { filename, dag_code } = this.chainDag(spec);
    downloadText(filename, dag_code, "text/x-python;charset=utf-8");
  },

  dryRunStage(
    stage: Stage,
    _defaults: ChainSpec["defaults"],
    mockInputs: Record<string, unknown>,
    params: Record<string, unknown>,
    chainId: string,
  ) {
    const context = {
      stages: Object.fromEntries(
        Object.entries(mockInputs).map(([key, value]) => [key, { output: value }]),
      ),
      params,
      item: mockInputs.__item__,
    };

    if (stage.type === "transform") {
      return {
        stage_id: stage.id,
        type: "transform",
        mock: true,
        output: {
          chain_id: chainId,
          engine: stage.engine ?? "jsonpath",
          spec: stage.spec ?? {},
          context,
          note: "Offline fallback returns a transform preview instead of executing the FastAPI runtime.",
        },
      };
    }

    if (stage.type === "sink") {
      return {
        stage_id: stage.id,
        type: "sink",
        mock: true,
        output: {
          would_write: renderTemplate(stage.payload ?? "", context),
          target: stage.target ?? null,
        },
      };
    }

    if (!stage.prompt) failure("ai_call 缺少 prompt");

    return {
      stage_id: stage.id,
      type: "ai_call",
      rendered_prompt: renderTemplate(stage.prompt.user, context),
      output: mockFromSchema(stage.output_schema),
      citations: ["https://example.com/mock-source"],
      usage: { prompt_tokens: 120, completion_tokens: 80 },
      cost_usd: 0,
      mock: true,
    };
  },

  saveApiCrawler(id: string, spec: ApiCrawlerSpec) {
    upsertConnector(stamp("api_crawler", id, spec, "draft"));
    return { ok: true };
  },

  apiCrawlerDag(spec: ApiCrawlerSpec) {
    if (spec.fields.length === 0) {
      failure("尚未定義 schema 欄位 — 請先在 Schema 面板偵測並確認欄位");
    }
    if (!spec.request.url) {
      failure("request URL 為空");
    }
    const filename = `api_crawler__${spec.dagConfig.crawlerName}.py`;
    return {
      filename,
      dag_code: generateDagStub("api_crawler", filename, spec),
    };
  },

  downloadApiCrawlerDag(spec: ApiCrawlerSpec) {
    const { filename, dag_code } = this.apiCrawlerDag(spec);
    downloadText(filename, dag_code, "text/x-python;charset=utf-8");
  },
};
