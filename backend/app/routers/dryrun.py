import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import UsageRecord, get_db
from ..schemas import DryRunStageRequest
from ..services.perplexity_adapter import call_perplexity
from ..services.transforms import render_template, run_transform

router = APIRouter()


@router.post("/stage")
async def dryrun_stage(req: DryRunStageRequest, db: Session = Depends(get_db)):
    """單一 stage 試跑（規格書 §5.2）。上游輸出以 mock_inputs 提供。"""
    stage = req.stage
    context = {"stages": {k: {"output": v} for k, v in req.mock_inputs.items()},
               "params": req.params, "item": req.mock_inputs.get("__item__")}

    if stage.type == "transform":
        try:
            output = run_transform(stage.engine or "jsonpath", stage.spec or {}, context)
        except Exception as e:  # noqa: BLE001 — dry-run 需回傳錯誤細節
            raise HTTPException(422, f"transform 執行失敗: {e}")
        return {"stage_id": stage.id, "type": "transform", "output": output, "mock": False}

    if stage.type == "sink":
        payload = render_template(stage.payload or "", context)
        return {"stage_id": stage.id, "type": "sink",
                "output": {"would_write": payload, "target": stage.target.model_dump() if stage.target else None},
                "mock": True}

    # ai_call
    if not stage.prompt:
        raise HTTPException(422, "ai_call 缺少 prompt")
    cfg = req.defaults.model_dump()
    cfg.update(stage.model_override or {})
    try:
        user_prompt = render_template(stage.prompt.user, context)
        system_prompt = render_template(stage.prompt.system, context) if stage.prompt.system else None
    except Exception as e:  # noqa: BLE001
        raise HTTPException(422, f"prompt 模板渲染失敗: {e}")

    result = await call_perplexity(
        model=cfg.get("model", "sonar-pro"),
        system=system_prompt,
        user=user_prompt,
        temperature=cfg.get("temperature", 0.2),
        max_tokens=cfg.get("max_tokens", 4000),
        output_schema=stage.output_schema,
        search_options=cfg.get("search_options") or None,
    )

    db.add(UsageRecord(chain_id=req.chain_id, run_id=f"dryrun-{uuid.uuid4().hex[:8]}",
                       stage_id=stage.id, provider=cfg.get("provider", "perplexity"),
                       model=cfg.get("model", ""),
                       prompt_tokens=result["usage"].get("prompt_tokens", 0),
                       completion_tokens=result["usage"].get("completion_tokens", 0),
                       cost_usd=result["cost_usd"]))
    db.commit()

    return {"stage_id": stage.id, "type": "ai_call",
            "rendered_prompt": user_prompt, **result}
