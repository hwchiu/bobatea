"""AI Kernel Adapter — Perplexity（規格書 §4.3）。

未設定 PERPLEXITY_API_KEY 時回傳 mock 結果，讓 UI Dry-Run 可離線開發。
"""
import json
import os
from typing import Any

import httpx

PPLX_URL = "https://api.perplexity.ai/chat/completions"

# 粗略計價表（USD / 1M tokens），部署時依實際方案調整
PRICE = {"sonar": (1.0, 1.0), "sonar-pro": (3.0, 15.0)}


class AIKernelResult(dict):
    """{"output": dict|str, "citations": [...], "usage": {...}, "cost_usd": float, "mock": bool}"""


async def call_perplexity(
    model: str,
    system: str | None,
    user: str,
    temperature: float,
    max_tokens: int,
    output_schema: dict[str, Any] | None,
    search_options: dict[str, Any] | None = None,
) -> AIKernelResult:
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        return _mock_result(output_schema)

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    if output_schema:
        user += "\n\n請僅回傳符合以下 JSON Schema 的 JSON，勿加任何說明或 Markdown 標記：\n" + json.dumps(
            output_schema, ensure_ascii=False)
    messages.append({"role": "user", "content": user})

    body: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if search_options:
        body.update(search_options)

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            PPLX_URL, json=body,
            headers={"Authorization": f"Bearer {api_key}"})
        resp.raise_for_status()
        data = resp.json()

    text = data["choices"][0]["message"]["content"]
    output: Any = text
    if output_schema:
        output = _parse_json_lenient(text)

    usage = data.get("usage", {})
    pin, pout = PRICE.get(model, (1.0, 1.0))
    cost = (usage.get("prompt_tokens", 0) * pin + usage.get("completion_tokens", 0) * pout) / 1e6

    return AIKernelResult(
        output=output,
        citations=data.get("citations", []),
        usage=usage,
        cost_usd=round(cost, 6),
        mock=False,
    )


def _parse_json_lenient(text: str) -> Any:
    """去除可能的 ```json fence 後解析；失敗回傳原文字串（由呼叫端依 on_schema_violation 處理）。"""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return text


def _mock_result(output_schema: dict[str, Any] | None) -> AIKernelResult:
    mock: Any = "（mock 回應：設定 PERPLEXITY_API_KEY 後將呼叫真實 API）"
    if output_schema:
        mock = _mock_from_schema(output_schema)
    return AIKernelResult(output=mock, citations=["https://example.com/mock-source"],
                          usage={"prompt_tokens": 120, "completion_tokens": 80},
                          cost_usd=0.0, mock=True)


def _mock_from_schema(schema: dict[str, Any]) -> Any:
    t = schema.get("type")
    if t == "object":
        return {k: _mock_from_schema(v) for k, v in schema.get("properties", {}).items()}
    if t == "array":
        return [_mock_from_schema(schema.get("items", {"type": "string"}))]
    if t == "number":
        return 0.9
    if t == "integer":
        return 1
    if "enum" in schema:
        return schema["enum"][0]
    return "mock_value"
