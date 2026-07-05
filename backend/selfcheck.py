"""Smallest runnable check（依 AGENTS.md 慣例）— python3 selfcheck.py"""
import sys
sys.path.insert(0, ".")
from app.services.api_runtime import extract_rows
from app.services.validator import validate_chain
from app.schemas import ChainSpec

# 1) schema 抽取：陣列 + 純量混合
body = {"data": {"total": 2, "items": [{"id": "A", "v": 1}, {"id": "B", "v": 2}]}}
fields = [{"name": "id", "path": "data.items[].id"}, {"name": "total", "path": "data.total"}]
rows = extract_rows(body, fields)
assert rows == [{"id": "A", "total": 2}, {"id": "B", "total": 2}], rows

# 2) chain 驗證：環路必須被抓到
bad = ChainSpec(chain_id="x", stages=[
    {"id": "a", "type": "ai_call", "depends_on": ["b"], "prompt": {"user": "x"}},
    {"id": "b", "type": "ai_call", "depends_on": ["a"], "prompt": {"user": "y"}}])
assert not validate_chain(bad).valid

print("selfcheck OK")
