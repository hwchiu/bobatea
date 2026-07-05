"""Transform 引擎（規格書 §3.3.2）— 僅白名單內建函式，不執行任意程式碼。"""
import difflib
import json
from typing import Any

from jinja2 import Environment

_jinja = Environment()


def render_template(text: str, context: dict[str, Any]) -> str:
    return _jinja.from_string(text).render(**context)


# ── builtin.* 白名單函式庫 ─────────────────────────────

def dedup_by_similarity(input: list[dict], key_field: str = "title",
                        threshold: float = 0.85, min_summary_length: int = 0,
                        **_: Any) -> dict:
    kept: list[dict] = []
    for item in input or []:
        if min_summary_length and len(str(item.get("summary", ""))) < min_summary_length:
            continue
        key = str(item.get(key_field, ""))
        if any(difflib.SequenceMatcher(None, key, str(k.get(key_field, ""))).ratio() >= threshold
               for k in kept):
            continue
        kept.append(item)
    return {"articles": kept, "removed": len(input or []) - len(kept)}


def filter_by_field(input: list[dict], field: str, equals: Any = None,
                    min_value: float | None = None, **_: Any) -> dict:
    out = []
    for item in input or []:
        v = item.get(field)
        if equals is not None and v != equals:
            continue
        if min_value is not None and (not isinstance(v, (int, float)) or v < min_value):
            continue
        out.append(item)
    return {"items": out}


def merge_arrays(inputs: list[list], **_: Any) -> dict:
    merged: list = []
    for arr in inputs or []:
        merged.extend(arr or [])
    return {"items": merged}


def top_n(input: list[dict], field: str, n: int = 5, descending: bool = True, **_: Any) -> dict:
    items = sorted(input or [], key=lambda x: x.get(field, 0), reverse=descending)
    return {"items": items[:n]}


BUILTINS = {
    "builtin.dedup_by_similarity": dedup_by_similarity,
    "builtin.filter_by_field": filter_by_field,
    "builtin.merge_arrays": merge_arrays,
    "builtin.top_n": top_n,
}


def run_transform(engine: str, spec: dict[str, Any], context: dict[str, Any]) -> Any:
    """執行 transform stage。context = {"stages": {...}, "params": {...}}"""
    if engine == "jinja":
        return render_template(spec.get("template", ""), context)

    if engine == "jsonpath":
        # 輕量 dotted-path 取值：a.b[0].c
        expr = render_template(spec.get("path", ""), context)
        return _dotted_get(context, expr)

    if engine == "python":
        fn_name = spec.get("function", "")
        fn = BUILTINS.get(fn_name)
        if not fn:
            raise ValueError(f"未知的內建函式: {fn_name}（白名單: {sorted(BUILTINS)}）")
        args = {}
        for k, v in (spec.get("args") or {}).items():
            if isinstance(v, str) and "{{" in v:
                rendered = render_template(v, context)
                try:
                    args[k] = json.loads(rendered)
                except json.JSONDecodeError:
                    try:
                        args[k] = json.loads(rendered.replace("'", '"'))
                    except json.JSONDecodeError:
                        args[k] = rendered
            else:
                args[k] = v
        return fn(**args)

    raise ValueError(f"未知的 transform engine: {engine}")


def _dotted_get(obj: Any, path: str) -> Any:
    cur = obj
    for part in path.replace("]", "").replace("[", ".").split("."):
        if not part:
            continue
        if isinstance(cur, list):
            cur = cur[int(part)]
        elif isinstance(cur, dict):
            cur = cur.get(part)
        else:
            return None
    return cur
