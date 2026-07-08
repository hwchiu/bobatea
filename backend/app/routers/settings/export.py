"""資料輸出：json / yaml（後端連結 type=file 的格式，也可隨選下載）。"""
import io
import json as jsonlib
from typing import Any

import yaml as yamllib
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ...database import CompanyMaster, ProviderRecord, ScopeDef, SystemParam, UserPref, get_db

from .core import _scope_rows, _scope_schema

router = APIRouter()


@router.get("/{scope}/export")
def export_scope(scope: str, format: str = "json", db: Session = Depends(get_db)):
    """scope 資料輸出 json / yaml（後端連結 type=file 的落地格式，也可隨選下載）。"""
    _scope_schema(scope, db)
    rows = _scope_rows(scope, db)
    if format == "yaml":
        content = yamllib.safe_dump({scope: rows}, allow_unicode=True, sort_keys=False)
        media, ext = "application/x-yaml", "yaml"
    else:
        content = jsonlib.dumps({scope: rows}, ensure_ascii=False, indent=2)
        media, ext = "application/json", "json"
    return StreamingResponse(io.BytesIO(content.encode("utf-8")), media_type=media,
                             headers={"Content-Disposition": f'attachment; filename="{scope}.{ext}"'})


