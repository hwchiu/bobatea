"""Company Identity Intelligence —— TSMC 供應鏈 Company Identity Graph API。

對應 7 個 workspace:
  /companies         -> Knowledge Graph, Registry
  /edges/timeline     -> Timeline
  /decisions         -> Decisions
  /resolution-queue  -> Entity Resolution
  /ontology          -> Ontology Hub
  /lineage/{fab_code}-> Lineage

Registry 沒有獨立資料模型(沿用 companies 的清單呈現),跟先前討論一致。
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import CompanyMaster, IdentityDecision, ProviderRecord, ResolutionCandidate, SupplyChainEdge, get_db
from ..seed_supply_chain import load_decisions, load_new_companies, load_resolution_candidates, load_supply_chain_edges

router = APIRouter()

CATEGORY_LABEL = {
    "hub": "台積電 (Hub)",
    "foundry": "晶圓代工同業",
    "equipment": "設備供應商",
    "materials": "材料 / 化學品供應商",
    "eda_ip": "EDA / IP 供應商",
    "fabless": "Fabless 客戶",
    "osat": "封測夥伴 (OSAT)",
    "substrate": "載板 / PCB 供應商",
    "test_assembly": "測試 / 封裝設備",
}

ONTOLOGY_NODE_TYPES = [
    {"key": "LEGAL_ENTITY", "def": "具獨立法律人格的公司實體"},
    {"key": "SUBSIDIARY", "def": "受母公司控制之子公司"},
    {"key": "SITE", "def": "特定生產基地 / 廠區"},
    {"key": "BRAND", "def": "品牌或產品線名稱,可能橫跨多個法人"},
    {"key": "GROUP", "def": "集團層級的控股結構聚合"},
]

ONTOLOGY_EDGE_TYPES = [
    {"rel": "SAME_AS", "def": "兩個識別實際指向同一法人"},
    {"rel": "ALIAS_OF", "def": "名稱層級的別名關係"},
    {"rel": "SUBSIDIARY_OF", "def": "子公司歸屬母公司"},
    {"rel": "SUPPLIES_TO", "def": "供應鏈上游供貨關係"},
    {"rel": "CUSTOMER_OF", "def": "下游客戶關係"},
    {"rel": "COMPETITOR_OF", "def": "同業競爭關係"},
    {"rel": "IP_LICENSOR_OF", "def": "IP / 授權關係"},
    {"rel": "PACKAGES_FOR", "def": "封裝測試服務關係"},
]

ONTOLOGY_RULES = [
    {"id": "RULE-01", "text": "一個 LEGAL_ENTITY 只能有一個生效中的 GROUP 父節點"},
    {"id": "RULE-02", "text": "ALIAS_OF 關係必須附帶 confidence 與 source,不可為空"},
    {"id": "RULE-03", "text": "SAME_AS 合併前,兩端衝突欄位須先經過 Conflict Detection"},
    {"id": "RULE-04", "text": "internal identifier 類欄位預設 disclosure_policy = restricted"},
    {"id": "RULE-05", "text": "COMPETITOR_OF 為對稱關係,新增時自動建立反向邊"},
]


def _ensure_seed(db: Session) -> None:
    """首次呼叫時把新公司 + edges + decisions + resolution queue 種進 DB。
    沿用其他 router 的 `_ensure_seed` 慣例(見 settings/core.py)。"""
    if db.query(SupplyChainEdge).count() > 0:
        return
    for c in load_new_companies():
        if not db.get(CompanyMaster, c["fab_code"]):
            db.add(CompanyMaster(**{k: v for k, v in c.items()}))
    db.flush()
    for e in load_supply_chain_edges():
        db.add(SupplyChainEdge(**e))
    for d in load_decisions():
        if not db.get(IdentityDecision, d["id"]):
            db.add(IdentityDecision(**d))
    for r in load_resolution_candidates():
        db.add(ResolutionCandidate(**r))
    db.commit()


@router.get("/companies")
def list_companies(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """回傳台積電 + 所有已分類供應鏈公司,附上類別/信心/來源(Knowledge Graph + Registry 共用)。"""
    _ensure_seed(db)
    edges = {e.source_fab_code: e for e in db.query(SupplyChainEdge).filter(SupplyChainEdge.category != "identity_event").all()}
    tsmc = db.get(CompanyMaster, "TSMC")
    out = []
    if tsmc:
        out.append({
            "fab_code": tsmc.fab_code, "name": tsmc.company_short_name or tsmc.company_name,
            "category": "hub", "category_label": CATEGORY_LABEL["hub"],
            "country": tsmc.country, "confidence": 1.0, "source": "internal", "edge_type": None,
        })
    for fab_code, edge in edges.items():
        company = db.get(CompanyMaster, fab_code)
        if not company:
            continue
        out.append({
            "fab_code": fab_code, "name": company.company_short_name or company.company_name,
            "category": edge.category, "category_label": CATEGORY_LABEL.get(edge.category, edge.category),
            "country": company.country, "confidence": edge.confidence, "source": edge.source,
            "edge_type": edge.edge_type,
        })
    return out


@router.get("/edges/timeline")
def list_timeline_events(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """對應 Timeline workspace —— 只回傳有 valid_from(即身份事件)的邊。"""
    _ensure_seed(db)
    rows = db.query(SupplyChainEdge).filter(SupplyChainEdge.valid_from.isnot(None)).order_by(SupplyChainEdge.valid_from).all()
    return [{
        "source_fab_code": r.source_fab_code, "target_fab_code": r.target_fab_code,
        "edge_type": r.edge_type, "valid_from": r.valid_from, "valid_until": r.valid_until,
        "label": r.event_label,
    } for r in rows]


@router.get("/decisions")
def list_decisions(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    _ensure_seed(db)
    rows = db.query(IdentityDecision).order_by(IdentityDecision.id.desc()).all()
    return [{
        "id": r.id, "category": r.category, "scenario": r.scenario, "reasoning": r.reasoning,
        "outcome": r.outcome, "confidence": r.confidence, "model": r.model,
    } for r in rows]


@router.get("/resolution-queue")
def list_resolution_queue(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    _ensure_seed(db)
    rows = db.query(ResolutionCandidate).order_by(ResolutionCandidate.id).all()
    return [{
        "id": r.id, "fab_code_a": r.fab_code_a, "fab_code_b": r.fab_code_b,
        "suggested_relation": r.suggested_relation, "note": r.note,
        "evidence": r.evidence, "status": r.status,
    } for r in rows]


@router.patch("/resolution-queue/{item_id}")
def update_resolution_status(item_id: int, body: dict[str, Any], db: Session = Depends(get_db)) -> dict[str, Any]:
    """Entity Resolution workspace 的「確認關係 / 忽略」按鈕打這支。"""
    status = body.get("status")
    if status not in ("confirmed", "rejected", "pending"):
        raise HTTPException(422, "status 必須為 confirmed / rejected / pending")
    row = db.get(ResolutionCandidate, item_id)
    if not row:
        raise HTTPException(404, "not found")
    row.status = status
    db.commit()
    return {"id": row.id, "status": row.status}


@router.get("/ontology")
def get_ontology() -> dict[str, Any]:
    return {"node_types": ONTOLOGY_NODE_TYPES, "edge_types": ONTOLOGY_EDGE_TYPES, "rules": ONTOLOGY_RULES}


@router.get("/lineage/{fab_code}")
def get_lineage(fab_code: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """組合 SupplyChainEdge(對 TSMC 的關係來源)+ ProviderRecord(既有的多來源
    attrs,如果治理團隊已經在 Settings/Admin 填過這家公司的 provider mapping)。"""
    _ensure_seed(db)
    company = db.get(CompanyMaster, fab_code)
    if not company:
        raise HTTPException(404, "company not found")
    edge = db.query(SupplyChainEdge).filter(
        SupplyChainEdge.source_fab_code == fab_code, SupplyChainEdge.category != "identity_event"
    ).first()
    provider_records = db.query(ProviderRecord).filter(ProviderRecord.fab_code == fab_code).all()
    return {
        "fab_code": fab_code,
        "name": company.company_short_name or company.company_name,
        "primary_source": edge.source if edge else None,
        "confidence": edge.confidence if edge else None,
        "category": edge.category if edge else None,
        "provider_records": [{"provider": p.provider, "attrs": p.attrs, "updated_at": p.updated_at.isoformat()} for p in provider_records],
        "updated_at": company.updated_at.isoformat() if company.updated_at else None,
    }
