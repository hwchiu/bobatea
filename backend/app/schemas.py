"""統一 Connector DSL — api_crawler 與 prompt_chain 兩種 connector type。"""
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, field_validator

from .routers.proxy import RequestConfig

# ── Prompt Chain（AI Crawler，沿用原 DSL）──────────────────


class RetryPolicy(BaseModel):
    max_attempts: int = 3
    backoff: Literal["exponential", "fixed"] = "exponential"
    retry_on: list[str] = ["rate_limit", "timeout", "http_5xx"]


class PromptSpec(BaseModel):
    system: Optional[str] = None
    user: str


class ModelConfig(BaseModel):
    provider: str = "perplexity"
    model: str = "sonar-pro"
    temperature: float = 0.2
    max_tokens: int = 4000
    search_options: dict[str, Any] = Field(default_factory=dict)


class SinkTarget(BaseModel):
    kind: Literal["warehouse", "lake", "webhook"] = "warehouse"
    connection: str = ""
    table: str = ""
    mode: Literal["append", "overwrite"] = "append"


class Stage(BaseModel):
    id: str
    type: Literal["ai_call", "transform", "sink"]
    depends_on: list[str] = Field(default_factory=list)
    prompt: Optional[PromptSpec] = None
    output_schema: Optional[dict[str, Any]] = None
    model_override: Optional[dict[str, Any]] = None
    map_over: Optional[str] = None
    max_parallel: int = 5
    on_schema_violation: Literal["retry_with_repair", "fail", "skip"] = "retry_with_repair"
    engine: Optional[Literal["jsonpath", "jinja", "python"]] = None
    spec: Optional[dict[str, Any]] = None
    target: Optional[SinkTarget] = None
    payload: Optional[str] = None
    ui: Optional[dict[str, float]] = None

    @field_validator("id")
    @classmethod
    def id_slug(cls, v: str) -> str:
        if not v.replace("_", "").isalnum():
            raise ValueError("stage id 僅允許英數與底線")
        return v


class Schedule(BaseModel):
    cron: str = "0 6 * * *"
    timezone: str = "Asia/Taipei"
    catchup: bool = False


class Governance(BaseModel):
    cost_budget_usd_per_run: float = 2.0
    pii_detection: bool = True
    citation_capture: bool = True


class ChainSpec(BaseModel):
    type: Literal["prompt_chain"] = "prompt_chain"
    chain_id: str
    version: str = "0.1"
    owner: str = ""
    description: str = ""
    schedule: Schedule = Field(default_factory=Schedule)
    defaults: ModelConfig = Field(default_factory=ModelConfig)
    params: dict[str, Any] = Field(default_factory=dict)
    stages: list[Stage] = Field(default_factory=list)
    governance: Governance = Field(default_factory=Governance)


# ── API Crawler（對齊 bobatea lib/types.ts）────────────────


class SchemaField(BaseModel):
    id: str = ""
    name: str
    path: str
    type: Literal["string", "number", "boolean", "array", "object", "null"] = "string"
    description: str = ""
    required: bool = False


class DagConfig(BaseModel):
    crawlerName: str
    schedule: str = "0 6 * * *"
    outputFormat: Literal["json", "csv", "parquet"] = "json"
    outputPath: str = "s3://tmic-data/"
    tags: list[str] = Field(default_factory=list)
    retries: int = 2
    timeoutSeconds: int = 120

    @field_validator("crawlerName")
    @classmethod
    def name_slug(cls, v: str) -> str:
        cleaned = v.strip().lower().replace("-", "_").replace(" ", "_")
        if not cleaned or not cleaned.replace("_", "").isalnum():
            raise ValueError("crawlerName 需為英數與底線")
        return cleaned


class ApiCrawlerSpec(BaseModel):
    type: Literal["api_crawler"] = "api_crawler"
    request: RequestConfig
    fields: list[SchemaField] = Field(default_factory=list)  # schema 是 Pydantic 保留字
    dagConfig: DagConfig


# ── Dry-run / 驗證 共用 ────────────────────────────────────


class DryRunStageRequest(BaseModel):
    stage: Stage
    defaults: ModelConfig = Field(default_factory=ModelConfig)
    mock_inputs: dict[str, Any] = Field(default_factory=dict)
    params: dict[str, Any] = Field(default_factory=dict)
    chain_id: str = "dryrun"


class ValidationIssue(BaseModel):
    level: Literal["error", "warning"]
    stage_id: Optional[str] = None
    message: str


class ValidationResult(BaseModel):
    valid: bool
    issues: list[ValidationIssue] = Field(default_factory=list)
