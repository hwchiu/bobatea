"""API Crawler runtime 參考實作 — 部署至 Airflow workers 時封裝為 tmic_runtime.api_connector。

執行流程：HTTP fetch → 依 SchemaField.path 抽取欄位 → 輸出 json/csv/parquet。
本模組也直接供後端 dry-run 使用，確保「UI 測試」與「排程執行」邏輯同源。
"""
import csv
import io
import json
from typing import Any

import httpx
import yaml

from ..routers.proxy import RequestConfig, build_body, build_headers, build_url


def extract_rows(body: Any, fields: list[dict]) -> list[dict]:
    """依 SchemaField.path（如 data.items[].name）抽取為表格列。

    規則：以第一個含 `[]` 的共同前綴決定列來源；無 `[]` 則整包視為單列。
    """
    array_paths = {f["path"].split("[]")[0] for f in fields if "[]" in f["path"]}
    if not array_paths:
        return [{f["name"]: _get(body, f["path"]) for f in fields}]

    base = sorted(array_paths, key=len)[0].rstrip(".")
    items = _get(body, base) if base else body
    if not isinstance(items, list):
        items = [items] if items is not None else []

    rows = []
    for item in items:
        row = {}
        for f in fields:
            path = f["path"]
            if "[]" in path:
                sub = path.split("[]", 1)[1].lstrip(".")
                row[f["name"]] = _get(item, sub) if sub else item
            else:
                row[f["name"]] = _get(body, path)
        rows.append(row)
    return rows


def _get(obj: Any, path: str) -> Any:
    cur = obj
    for part in path.replace("]", "").replace("[", ".").split("."):
        if not part:
            continue
        if isinstance(cur, list):
            try:
                cur = cur[int(part)]
            except (ValueError, IndexError):
                return None
        elif isinstance(cur, dict):
            cur = cur.get(part)
        else:
            return None
    return cur


def serialize(rows: list[dict], fmt: str) -> bytes:
    if fmt == "json":
        return json.dumps(rows, ensure_ascii=False, indent=2, default=str).encode()
    if fmt == "csv":
        buf = io.StringIO()
        if rows:
            w = csv.DictWriter(buf, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
        return buf.getvalue().encode()
    if fmt == "parquet":
        try:
            import pandas as pd  # 平台 runtime 需具備 pandas + pyarrow
        except ImportError as e:
            raise RuntimeError("parquet 輸出需要 pandas + pyarrow") from e
        buf2 = io.BytesIO()
        pd.DataFrame(rows).to_parquet(buf2, index=False)
        return buf2.getvalue()
    raise ValueError(f"未知輸出格式: {fmt}")


def run_api_connector(connector_spec: str, output_format: str, output_path: str) -> dict:
    """Airflow task 進入點（同步版，PythonOperator 直接呼叫）。"""
    spec = yaml.safe_load(connector_spec)
    cfg = RequestConfig(**spec["request"])
    url = build_url(cfg)

    resp = httpx.request(cfg.method, url, headers=build_headers(cfg),
                         content=build_body(cfg), timeout=60, follow_redirects=True)
    resp.raise_for_status()
    body = resp.json() if "json" in resp.headers.get("content-type", "") else resp.text

    rows = extract_rows(body, spec.get("fields", []))
    payload = serialize(rows, output_format)

    # ponytail: 落地僅示範本地/掛載路徑寫入；S3 寫入由平台 runtime 以 fsspec/boto3 擴充
    if output_path.startswith("s3://"):
        raise RuntimeError("S3 寫入需在 tmic_runtime 部署版中以 fsspec 提供（本參考實作僅支援本地路徑）")
    out = f"{output_path.rstrip('/')}/api_crawler_output.{output_format}"
    with open(out, "wb") as fh:
        fh.write(payload)
    return {"rows": len(rows), "output": out}
