from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import UsageRecord, get_db

router = APIRouter()


@router.get("")
def usage_summary(db: Session = Depends(get_db)):
    rows = (db.query(UsageRecord.chain_id,
                     func.count(UsageRecord.id),
                     func.sum(UsageRecord.prompt_tokens),
                     func.sum(UsageRecord.completion_tokens),
                     func.sum(UsageRecord.cost_usd))
            .group_by(UsageRecord.chain_id).all())
    return [{"chain_id": r[0], "calls": r[1], "prompt_tokens": r[2] or 0,
             "completion_tokens": r[3] or 0, "cost_usd": round(r[4] or 0.0, 6)} for r in rows]


@router.get("/recent")
def recent(db: Session = Depends(get_db)):
    rows = db.query(UsageRecord).order_by(UsageRecord.called_at.desc()).limit(50).all()
    return [{"chain_id": r.chain_id, "stage_id": r.stage_id, "model": r.model,
             "prompt_tokens": r.prompt_tokens, "completion_tokens": r.completion_tokens,
             "cost_usd": r.cost_usd, "called_at": r.called_at.isoformat()} for r in rows]
