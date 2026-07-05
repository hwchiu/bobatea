"""Chain DSL 驗證（規格書 §3.1 / §4.1）：拓撲、環路、變數引用。"""
import re
from collections import defaultdict

from ..schemas import ChainSpec, ValidationIssue, ValidationResult

STAGE_REF = re.compile(r"\{\{\s*stages\.([a-zA-Z0-9_]+)\.")


def validate_chain(spec: ChainSpec) -> ValidationResult:
    issues: list[ValidationIssue] = []
    ids = [s.id for s in spec.stages]
    id_set = set(ids)

    if len(ids) != len(id_set):
        issues.append(ValidationIssue(level="error", message="stage id 重複"))

    # depends_on 引用存在性 + 環路檢查（DFS）
    graph: dict[str, list[str]] = defaultdict(list)
    for s in spec.stages:
        for dep in s.depends_on:
            if dep not in id_set:
                issues.append(ValidationIssue(
                    level="error", stage_id=s.id,
                    message=f"depends_on 引用不存在的 stage: {dep}"))
            graph[dep].append(s.id)

    state: dict[str, int] = {}  # 0=unvisited 1=in-stack 2=done

    def has_cycle(node: str) -> bool:
        state[node] = 1
        for nxt in graph.get(node, []):
            if state.get(nxt, 0) == 1:
                return True
            if state.get(nxt, 0) == 0 and has_cycle(nxt):
                return True
        state[node] = 2
        return False

    if any(state.get(i, 0) == 0 and has_cycle(i) for i in ids):
        issues.append(ValidationIssue(level="error", message="stage 依賴存在環路"))

    # 變數引用檢查：prompt / payload / map_over 中引用的 stage 必須是（遞移）上游
    ancestors = _ancestors(spec)
    for s in spec.stages:
        texts: list[str] = []
        if s.prompt:
            texts += [s.prompt.user, s.prompt.system or ""]
        if s.payload:
            texts.append(s.payload)
        if s.map_over:
            texts.append(s.map_over)
        if s.spec:
            texts.append(str(s.spec))
        for text in texts:
            for ref in STAGE_REF.findall(text):
                if ref not in ancestors.get(s.id, set()):
                    issues.append(ValidationIssue(
                        level="error", stage_id=s.id,
                        message=f"引用了非上游 stage 的輸出: stages.{ref}"))

    # 型別必要欄位
    for s in spec.stages:
        if s.type == "ai_call" and not s.prompt:
            issues.append(ValidationIssue(level="error", stage_id=s.id, message="ai_call 缺少 prompt"))
        if s.type == "ai_call" and not s.output_schema:
            issues.append(ValidationIssue(level="warning", stage_id=s.id,
                                          message="建議定義 output_schema 以啟用 structured output 驗證"))
        if s.type == "transform" and (not s.engine or not s.spec):
            issues.append(ValidationIssue(level="error", stage_id=s.id, message="transform 缺少 engine 或 spec"))
        if s.type == "sink" and not s.target:
            issues.append(ValidationIssue(level="error", stage_id=s.id, message="sink 缺少 target"))

    if not spec.stages:
        issues.append(ValidationIssue(level="error", message="chain 至少需要一個 stage"))

    return ValidationResult(valid=not any(i.level == "error" for i in issues), issues=issues)


def _ancestors(spec: ChainSpec) -> dict[str, set[str]]:
    parents = {s.id: set(s.depends_on) for s in spec.stages}
    result: dict[str, set[str]] = {}

    def collect(sid: str, seen: set[str]) -> set[str]:
        if sid in result:
            return result[sid]
        acc: set[str] = set()
        for p in parents.get(sid, set()):
            if p in seen:
                continue  # 環路交由環路檢查回報
            acc.add(p)
            acc |= collect(p, seen | {sid})
        result[sid] = acc
        return acc

    for sid in parents:
        collect(sid, set())
    return result
