"""統一 Connector Registry — prompt_chain 與 api_crawler 共用。"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import Connector, get_db
from ..schemas import ApiCrawlerSpec, ChainSpec, ValidationResult
from ..services.validator import validate_chain

router = APIRouter()


class ConnectorOut(BaseModel):
    connector_id: str
    connector_type: str
    version: str
    owner: str
    description: str
    status: str
    spec: dict[str, Any]
    updated_at: str | None = None


def _out(c: Connector) -> ConnectorOut:
    return ConnectorOut(connector_id=c.connector_id, connector_type=c.connector_type,
                        version=c.version, owner=c.owner, description=c.description,
                        status=c.status, spec=c.spec,
                        updated_at=c.updated_at.isoformat() if c.updated_at else None)


@router.get("", response_model=list[ConnectorOut])
def list_connectors(connector_type: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Connector)
    if connector_type:
        q = q.filter(Connector.connector_type == connector_type)
    return [_out(c) for c in q.order_by(Connector.updated_at.desc()).all()]


@router.get("/{connector_id}", response_model=ConnectorOut)
def get_connector(connector_id: str, db: Session = Depends(get_db)):
    c = db.get(Connector, connector_id)
    if not c:
        raise HTTPException(404, "connector 不存在")
    return _out(c)


@router.delete("/{connector_id}")
def delete_connector(connector_id: str, db: Session = Depends(get_db)):
    c = db.get(Connector, connector_id)
    if not c:
        raise HTTPException(404, "connector 不存在")
    db.delete(c)
    db.commit()
    return {"deleted": connector_id}


# ── prompt_chain ──────────────────────────────────────────

@router.put("/prompt-chain/{connector_id}", response_model=ConnectorOut)
def upsert_chain(connector_id: str, spec: ChainSpec, db: Session = Depends(get_db)):
    if spec.chain_id != connector_id:
        raise HTTPException(400, "URL 與 spec 的 chain_id 不一致")
    c = db.get(Connector, connector_id) or Connector(connector_id=connector_id)
    c.connector_type = "prompt_chain"
    c.version, c.owner, c.description = spec.version, spec.owner, spec.description
    c.spec = spec.model_dump(exclude_none=True)
    db.add(c)
    db.commit()
    db.refresh(c)
    return _out(c)


@router.post("/prompt-chain/{connector_id}/validate", response_model=ValidationResult)
def validate(connector_id: str, spec: ChainSpec):
    return validate_chain(spec)


@router.post("/prompt-chain/{connector_id}/publish", response_model=ConnectorOut)
def publish_chain(connector_id: str, spec: ChainSpec, db: Session = Depends(get_db)):
    result = validate_chain(spec)
    if not result.valid:
        raise HTTPException(422, detail=[i.model_dump() for i in result.issues])
    out = upsert_chain(connector_id, spec, db)
    c = db.get(Connector, connector_id)
    c.status = "published"
    db.commit()
    out.status = "published"
    return out


# ── api_crawler ───────────────────────────────────────────

@router.put("/api-crawler/{connector_id}", response_model=ConnectorOut)
def upsert_api_crawler(connector_id: str, spec: ApiCrawlerSpec, db: Session = Depends(get_db)):
    c = db.get(Connector, connector_id) or Connector(connector_id=connector_id)
    c.connector_type = "api_crawler"
    c.description = spec.request.description or spec.request.name
    c.spec = spec.model_dump()
    db.add(c)
    db.commit()
    db.refresh(c)
    return _out(c)


class LocalStorageImport(BaseModel):
    """bobatea 舊版 localStorage 匯出格式：{ "<requestId>": SavedCrawler }"""
    crawlers: dict[str, dict[str, Any]]


@router.post("/api-crawler/import-localstorage")
def import_localstorage(payload: LocalStorageImport, db: Session = Depends(get_db)):
    imported, skipped = [], []
    for rid, saved in payload.crawlers.items():
        try:
            spec = ApiCrawlerSpec(
                request=saved.get("config") or saved.get("request"),
                fields=saved.get("schema", []),
                dagConfig=saved.get("dagConfig"),
            )
        except Exception as e:  # noqa: BLE001 — 匯入需逐筆容錯
            skipped.append({"id": rid, "reason": str(e)})
            continue
        cid = spec.dagConfig.crawlerName or rid
        upsert_api_crawler(cid, spec, db)
        imported.append(cid)
    return {"imported": imported, "skipped": skipped}
