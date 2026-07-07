"""資料維護 CRUD：schema / company master / provider records / system params。"""
import io
import json as jsonlib
from typing import Any

import yaml as yamllib
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ...database import CompanyMaster, ProviderRecord, ScopeDef, SystemParam, UserPref, get_db

from .core import (_ensure_seed, _master_out, _provider_or_404, _record_out,
                   _row_to_schema, _scope, _validate_row)

router = APIRouter()


@router.get("/schema")
def get_schema(db: Session = Depends(get_db)):
    """前端動態渲染表格 / 表單 / Excel 欄位的單一來源（DB-backed，Admin 可調整）。"""
    _ensure_seed(db)
    providers = {r.scope_id: _row_to_schema(r) for r in
                 db.query(ScopeDef).filter(ScopeDef.group == "company_config",
                                           ScopeDef.scope_id != "company_master")
                   .order_by(ScopeDef.scope_id).all()}
    return {
        "company_master": _scope("company_master", db),
        "providers": providers,
        "system_params": _scope("system_params", db),
    }



@router.get("/company-master")
def list_master(db: Session = Depends(get_db)):
    rows = db.query(CompanyMaster).order_by(CompanyMaster.fab_code).all()
    return [_master_out(r) for r in rows]


@router.put("/company-master/{fab_code}")
def upsert_master(fab_code: str, body: dict[str, Any], db: Session = Depends(get_db)):
    errs = _validate_row(body | {"fab_code": fab_code}, _scope("company_master", db)["fields"], db, check_fk=False)
    if errs:
        raise HTTPException(422, errs)
    row = db.get(CompanyMaster, fab_code)
    if not row:
        row = CompanyMaster(fab_code=fab_code)
        db.add(row)
    for f in _scope("company_master", db)["fields"]:
        if f["key"] != "fab_code" and f["key"] in body:
            setattr(row, f["key"], body[f["key"]])
    db.commit()
    return _master_out(row)


@router.delete("/company-master/{fab_code}")
def delete_master(fab_code: str, db: Session = Depends(get_db)):
    used = db.query(ProviderRecord).filter(ProviderRecord.fab_code == fab_code).count()
    if used:
        raise HTTPException(409, f"fab_code {fab_code} 仍被 {used} 筆 provider mapping 引用，請先刪除相關 mapping")
    row = db.get(CompanyMaster, fab_code)
    if not row:
        raise HTTPException(404, "not found")
    db.delete(row)
    db.commit()
    return {"deleted": fab_code}



@router.get("/providers/{provider}/records")
def list_provider(provider: str, db: Session = Depends(get_db)):
    _provider_or_404(provider, db)
    rows = (db.query(ProviderRecord).filter(ProviderRecord.provider == provider)
            .order_by(ProviderRecord.fab_code).all())
    return [_record_out(r) for r in rows]


@router.put("/providers/{provider}/records/{fab_code}")
def upsert_provider(provider: str, fab_code: str, body: dict[str, Any], db: Session = Depends(get_db)):
    schema = _provider_or_404(provider, db)
    data = body | {"fab_code": fab_code}
    errs = _validate_row(data, schema["fields"], db, check_fk=True)
    if errs:
        raise HTTPException(422, errs)
    row = (db.query(ProviderRecord)
           .filter(ProviderRecord.provider == provider, ProviderRecord.fab_code == fab_code).first())
    if not row:
        row = ProviderRecord(provider=provider, fab_code=fab_code, attrs={})
        db.add(row)
    attrs = dict(row.attrs or {})
    for f in schema["fields"]:
        if f["key"] != "fab_code" and f["key"] in data:
            attrs[f["key"]] = data[f["key"]]
    row.attrs = attrs
    db.commit()
    return _record_out(row)


@router.delete("/providers/{provider}/records/{fab_code}")
def delete_provider(provider: str, fab_code: str, db: Session = Depends(get_db)):
    _provider_or_404(provider, db)
    row = (db.query(ProviderRecord)
           .filter(ProviderRecord.provider == provider, ProviderRecord.fab_code == fab_code).first())
    if not row:
        raise HTTPException(404, "not found")
    db.delete(row)
    db.commit()
    return {"deleted": fab_code}



@router.get("/system-params")
def list_params(db: Session = Depends(get_db)):
    return [{"param_key": r.param_key, "param_value": r.param_value, "category": r.category,
             "value_type": r.value_type, "description": r.description} for r in
            db.query(SystemParam).order_by(SystemParam.category, SystemParam.param_key).all()]


@router.put("/system-params/{param_key}")
def upsert_param(param_key: str, body: dict[str, Any], db: Session = Depends(get_db)):
    row = db.get(SystemParam, param_key)
    if not row:
        row = SystemParam(param_key=param_key)
        db.add(row)
    for k in ("param_value", "category", "value_type", "description"):
        if k in body:
            setattr(row, k, body[k])
    db.commit()
    return {"param_key": param_key}


@router.delete("/system-params/{param_key}")
def delete_param(param_key: str, db: Session = Depends(get_db)):
    row = db.get(SystemParam, param_key)
    if not row:
        raise HTTPException(404, "not found")
    db.delete(row)
    db.commit()
    return {"deleted": param_key}


