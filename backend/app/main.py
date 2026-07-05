"""bobatea unified backend — FastAPI.

取代原 Java Spring Boot proxy，並收納 AI Crawler（Prompt Chain）與
API Crawler 的 Connector Registry / DAG 生成 / Dry-Run / 用量記帳。
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import connectors, dag, dryrun, proxy, usage

app = FastAPI(title="bobatea API (tMIC Workspace)", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 部署時建議收斂為前端網域
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    _seed_examples()


def _seed_examples() -> None:
    """首次啟動（registry 為空）時載入 examples/ 內的示範 chain，方便 demo 與驗收。"""
    import json
    from pathlib import Path
    from .database import Connector, SessionLocal

    db = SessionLocal()
    try:
        if db.query(Connector).count() > 0:
            return
        examples_dir = Path(__file__).resolve().parent.parent.parent / "examples"
        for f in sorted(examples_dir.glob("*.json")):
            try:
                spec = json.loads(f.read_text(encoding="utf-8"))
                db.add(Connector(connector_id=spec["chain_id"], connector_type="prompt_chain", version=spec.get("version", "0.1"),
                             owner=spec.get("owner", ""), description=spec.get("description", ""),
                             spec=spec, status="draft"))
            except Exception:
                continue
        db.commit()
    finally:
        db.close()


# /api/bobatea/proxy 與原 Java 端點路徑相容，前端無痛切換
app.include_router(proxy.router, prefix="/api/bobatea", tags=["proxy"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(dag.router, prefix="/api/dag", tags=["dag"])
app.include_router(dryrun.router, prefix="/api/dryrun", tags=["dryrun"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "bobatea-unified-backend"}
