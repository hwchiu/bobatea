"""Admin：scope / 欄位定義 / 後端連結管理。"""
import io
import json as jsonlib
from typing import Any

import yaml as yamllib
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ...database import CompanyMaster, ProviderRecord, ScopeDef, SystemParam, UserPref, get_db

from .core import _ensure_seed, _row_to_schema

router = APIRouter()


@router.get("/admin/scopes")
def admin_list_scopes(db: Session = Depends(get_db)):
    _ensure_seed(db)
    return [_row_to_schema(r) for r in db.query(ScopeDef).order_by(ScopeDef.group, ScopeDef.scope_id).all()]


@router.put("/admin/scopes/{scope_id}")
def admin_upsert_scope(scope_id: str, body: dict[str, Any], db: Session = Depends(get_db)):
    """新增或調整 scope：label、fields（欄位定義）、backend（rdb / file:json|yaml）。"""
    _ensure_seed(db)
    if not scope_id.replace("_", "").isalnum():
        raise HTTPException(422, "scope_id 僅允許英數與底線")
    fields = body.get("fields")
    if fields is not None:
        errs = _validate_fields_def(fields)
        if errs:
            raise HTTPException(422, errs)
    backend = body.get("backend")
    if backend is not None:
        if backend.get("type") not in ("rdb", "file"):
            raise HTTPException(422, "backend.type 必須為 rdb 或 file")
        if backend.get("type") == "file" and backend.get("format") not in ("json", "yaml"):
            raise HTTPException(422, "backend.format 必須為 json 或 yaml")

    row = db.get(ScopeDef, scope_id)
    if not row:
        row = ScopeDef(scope_id=scope_id, group=body.get("group", "company_config"),
                       key_field=body.get("key_field", "fab_code"), builtin=0,
                       fields=[], backend={"type": "rdb"})
        db.add(row)
    if row.builtin and body.get("group") and body["group"] != row.group:
        raise HTTPException(409, "內建 scope 不可變更 group")
    for k in ("label", "fields", "backend"):
        if body.get(k) is not None:
            setattr(row, k, body[k])
    if not row.builtin and body.get("key_field"):
        row.key_field = body["key_field"]
    db.commit()
    return _row_to_schema(row)


@router.delete("/admin/scopes/{scope_id}")
def admin_delete_scope(scope_id: str, db: Session = Depends(get_db)):
    row = db.get(ScopeDef, scope_id)
    if not row:
        raise HTTPException(404, "not found")
    if row.builtin:
        raise HTTPException(409, "內建 scope 不可刪除（可調整欄位或後端連結）")
    n = db.query(ProviderRecord).filter(ProviderRecord.provider == scope_id).count()
    if n:
        raise HTTPException(409, f"scope 內尚有 {n} 筆資料，請先清空")
    db.delete(row)
    db.commit()
    return {"deleted": scope_id}


def _validate_fields_def(fields: list) -> list[str]:
    errs: list[str] = []
    if not isinstance(fields, list) or not fields:
        return ["fields 必須為非空陣列"]
    seen: set[str] = set()
    for i, f in enumerate(fields):
        key = (f or {}).get("key", "")
        if not key or not str(key).replace("_", "").isalnum():
            errs.append(f"fields[{i}].key 無效")
        if key in seen:
            errs.append(f"fields[{i}].key 重複: {key}")
        seen.add(key)
        if (f or {}).get("type") not in ("text", "number", "select", "fk"):
            errs.append(f"fields[{i}].type 必須為 text/number/select/fk")
        if f.get("type") == "select" and not f.get("options"):
            errs.append(f"fields[{i}] select 型別需提供 options")
    return errs


