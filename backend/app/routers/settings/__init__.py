"""Settings router package — API 路徑與拆分前完全一致（/api/settings/*）。

模組切分：
  defaults.py  預設 schema（seed 來源）
  core.py      共用 helpers（scope 載入 / seed / 驗證 / 序列化）
  records.py   schema + company master / provider / system params CRUD
  excel.py     Excel 模板下載與批次上傳
  admin.py     scope / 欄位 / 後端連結管理
  export.py    json / yaml 資料輸出
  personal.py  profile / notifications
"""
from fastapi import APIRouter

from . import admin, excel, export, personal, records

router = APIRouter()
# 先掛 admin / personal（固定路徑），再掛含 /{scope}/ 萬用段的 routers
router.include_router(admin.router)
router.include_router(personal.router)
router.include_router(records.router)
router.include_router(excel.router)
router.include_router(export.router)
