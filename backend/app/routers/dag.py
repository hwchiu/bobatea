"""DAG 生成 — prompt_chain 與 api_crawler 統一於此，並提供檔案下載。"""
from pathlib import Path

import yaml
from fastapi import APIRouter, HTTPException, Response
from jinja2 import Environment, FileSystemLoader

from ..schemas import ApiCrawlerSpec, ChainSpec
from ..services.validator import validate_chain

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)), keep_trailing_newline=True)

router = APIRouter()


def _download(filename: str, code: str) -> Response:
    return Response(
        content=code,
        media_type="text/x-python",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── prompt_chain ──────────────────────────────────────────

def generate_chain_dag(spec: ChainSpec) -> str:
    tpl = _env.get_template("prompt_chain_dag.py.j2")
    chain_yaml = yaml.safe_dump(spec.model_dump(exclude_none=True),
                                allow_unicode=True, sort_keys=False)
    return tpl.render(chain=spec.model_dump(exclude_none=True), chain_yaml=chain_yaml)


@router.post("/prompt-chain")
def prompt_chain_dag(spec: ChainSpec):
    result = validate_chain(spec)
    if not result.valid:
        raise HTTPException(422, detail=[i.model_dump() for i in result.issues])
    return {"filename": f"prompt_chain__{spec.chain_id}.py",
            "dag_code": generate_chain_dag(spec)}


@router.post("/prompt-chain/download")
def prompt_chain_download(spec: ChainSpec):
    result = validate_chain(spec)
    if not result.valid:
        raise HTTPException(422, detail=[i.model_dump() for i in result.issues])
    return _download(f"prompt_chain__{spec.chain_id}.py", generate_chain_dag(spec))


# ── api_crawler ───────────────────────────────────────────

def generate_api_crawler_dag(spec: ApiCrawlerSpec) -> str:
    if not spec.fields:
        raise HTTPException(422, "尚未定義 schema 欄位 — 請先在 Schema 面板偵測並確認欄位")
    if not spec.request.url:
        raise HTTPException(422, "request URL 為空")
    spec_yaml = yaml.safe_dump(
        {"request": spec.request.model_dump(),
         "fields": [f.model_dump() for f in spec.fields]},
        allow_unicode=True, sort_keys=False)
    tpl = _env.get_template("api_crawler_dag.py.j2")
    return tpl.render(dag=spec.dagConfig.model_dump(), spec_yaml=spec_yaml)


@router.post("/api-crawler")
def api_crawler_dag(spec: ApiCrawlerSpec):
    return {"filename": f"api_crawler__{spec.dagConfig.crawlerName}.py",
            "dag_code": generate_api_crawler_dag(spec)}


@router.post("/api-crawler/download")
def api_crawler_download(spec: ApiCrawlerSpec):
    return _download(f"api_crawler__{spec.dagConfig.crawlerName}.py",
                     generate_api_crawler_dag(spec))
