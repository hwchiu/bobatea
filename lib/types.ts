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
  description?: string;
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
  path: string;
  type: FieldType;
  description: string;
  required: boolean;
}

export type OutputFormat = "json" | "csv" | "parquet";

export interface DagConfig {
  crawlerName: string;
  schedule: string;
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
