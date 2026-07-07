"""共用 helpers：scope 載入 / seed / 驗證 / 序列化。"""
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ...database import CompanyMaster, ProviderRecord, ScopeDef, SystemParam, UserPref, get_db

from .defaults import DEFAULT_COMPANY_MASTER, DEFAULT_PROVIDERS, DEFAULT_SYSTEM_PARAMS


# ── Scope 動態載入 / seed ─────────────────────────────────────

def _row_to_schema(r: ScopeDef) -> dict:
    return {"id": r.scope_id, "label": r.label, "group": r.group,
            "key_field": r.key_field, "fields": r.fields or [],
            "backend": r.backend or {"type": "rdb"}, "builtin": bool(r.builtin)}


def _scope(scope_id: str, db: Session) -> dict:
    _ensure_seed(db)
    row = db.get(ScopeDef, scope_id)
    if not row:
        raise HTTPException(404, f"scope {scope_id} 不存在")
    return _row_to_schema(row)


def _ensure_seed(db: Session) -> None:
    """首次啟動：預設 schema 寫入 scope_def；之後以 DB 為準（Admin 可調整）。"""
    if db.query(ScopeDef).count() > 0:
        return
    def add(d: dict, group: str, key_field: str):
        db.add(ScopeDef(scope_id=d["id"], group=group, label=d["label"],
                        key_field=key_field, fields=d["fields"],
                        backend={"type": "rdb"}, builtin=1))
    add(DEFAULT_COMPANY_MASTER, "company_config", "fab_code")
    for p in DEFAULT_PROVIDERS.values():
        add(p, "company_config", "fab_code")
    add(DEFAULT_SYSTEM_PARAMS, "system", "param_key")
    db.commit()



def _provider_or_404(provider: str, db: Session) -> dict:
    row = db.get(ScopeDef, provider)
    if not row or row.group != "company_config" or provider == "company_master":
        raise HTTPException(404, f"未知的 provider: {provider}")
    return _row_to_schema(row)



def _scope_schema(scope: str, db: Session) -> dict:
    if scope in ("company_master", "system_params"):
        return _scope(scope, db)
    return _provider_or_404(scope, db)



def _scope_rows(scope: str, db: Session) -> list[dict]:
    if scope == "company_master":
        return [_master_out(r) for r in db.query(CompanyMaster).order_by(CompanyMaster.fab_code).all()]
    if scope == "system_params":
        return [{"param_key": r.param_key, "param_value": r.param_value, "category": r.category,
                 "value_type": r.value_type, "description": r.description}
                for r in db.query(SystemParam).order_by(SystemParam.param_key).all()]
    return [_record_out(r) for r in db.query(ProviderRecord)
            .filter(ProviderRecord.provider == scope).order_by(ProviderRecord.fab_code).all()]



# ── 共用驗證 / 序列化 ────────────────────────────────────────

def _validate_row(data: dict, fields: list[dict], db: Session, check_fk: bool) -> list[str]:
    errs: list[str] = []
    for f in fields:
        v = data.get(f["key"])
        empty = v is None or str(v).strip() == ""
        if f.get("required") and empty:
            errs.append(f"{f['key']} 為必填")
            continue
        if empty:
            continue
        if f["type"] == "number":
            try:
                float(v)
            except (TypeError, ValueError):
                errs.append(f"{f['key']} 必須為數字")
        if f["type"] == "select" and f.get("options") and str(v) not in f["options"]:
            errs.append(f"{f['key']} 必須為 {f['options']} 之一")
        if f["type"] == "fk" and check_fk:
            if not db.get(CompanyMaster, str(v)):
                errs.append(f"fab_code {v} 不存在於 Company Master，請先維護主檔")
    return errs


def _master_out(r: CompanyMaster) -> dict:
    return {"fab_code": r.fab_code, "company_name": r.company_name,
            "company_short_name": r.company_short_name, "country": r.country,
            "region": r.region, "status": r.status, "remark": r.remark,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None}


def _record_out(r: ProviderRecord) -> dict:
    return {"fab_code": r.fab_code, **(r.attrs or {}),
            "updated_at": r.updated_at.isoformat() if r.updated_at else None}


