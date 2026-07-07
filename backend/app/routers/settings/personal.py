"""Personal：profile / notifications 偏好設定。"""
import io
import json as jsonlib
from typing import Any

import yaml as yamllib
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ...database import CompanyMaster, ProviderRecord, ScopeDef, SystemParam, UserPref, get_db

router = APIRouter()


# ── Personal：profile / notifications ────────────────────────

DEFAULT_NOTIFICATIONS = {
    "job_failure": True, "job_success": False,
    "batch_upload_result": True, "weekly_digest": False,
    "channel_email": True, "channel_slack": False,
}


@router.get("/personal")
def get_personal(db: Session = Depends(get_db)):
    row = db.get(UserPref, "default")
    return {"profile": (row.profile if row else {}) or {},
            "notifications": {**DEFAULT_NOTIFICATIONS, **((row.notifications if row else {}) or {})}}


@router.put("/personal")
def put_personal(body: dict[str, Any], db: Session = Depends(get_db)):
    row = db.get(UserPref, "default")
    if not row:
        row = UserPref(user_id="default", profile={}, notifications={})
        db.add(row)
    if "profile" in body:
        row.profile = {**(row.profile or {}), **(body["profile"] or {})}
    if "notifications" in body:
        row.notifications = {**(row.notifications or {}), **(body["notifications"] or {})}
    db.commit()
    return get_personal(db)
