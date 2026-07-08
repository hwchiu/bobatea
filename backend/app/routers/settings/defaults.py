"""Settings — Company Config（Company Master + Data Providers）與 System Parameters。

設計原則：
1. Schema-driven：PROVIDER_SCHEMAS 定義各 data provider 需要維護的欄位，
   前端表格欄位、Excel 模板、上傳驗證全部由此驅動；新增 provider 僅需加一筆設定。
2. Company Master 為主檔：所有 provider mapping 的 fab_code 都必須先存在於主檔（FK 驗證）。
3. 儲存層走 SQLAlchemy（目前 SQLite，切 PostgreSQL / MariaDB 只需改 DATABASE_URL）。
"""

from typing import Any

# ── Schema 註冊表 ─────────────────────────────────────────────
# field: {key, label, required, type(text|number|select), options?, hint?}

DEFAULT_COMPANY_MASTER = {
    "id": "company_master",
    "label": "Company Master",
    "key_field": "fab_code",
    "fields": [
        {"key": "fab_code", "label": "Fab Code", "required": True, "type": "text",
         "hint": "公司主檔唯一代碼（primary key），所有 provider mapping 以此關聯"},
        {"key": "company_name", "label": "Company Name", "required": True, "type": "text"},
        {"key": "company_short_name", "label": "Short Name", "required": True, "type": "text"},
        {"key": "country", "label": "Country", "required": False, "type": "text"},
        {"key": "region", "label": "Region", "required": False, "type": "select",
         "options": ["APAC", "EMEA", "AMER"]},
        {"key": "status", "label": "Status", "required": False, "type": "select",
         "options": ["active", "inactive"], "default": "active"},
        {"key": "remark", "label": "Remark", "required": False, "type": "text"},
    ],
}

DEFAULT_PROVIDERS: dict[str, dict[str, Any]] = {
    "bloomberg": {
        "id": "bloomberg", "label": "Bloomberg",
        "fields": [
            {"key": "fab_code", "label": "Fab Code", "required": True, "type": "fk"},
            {"key": "bbg_id", "label": "BBG ID (FIGI)", "required": True, "type": "text",
             "hint": "Bloomberg Global Identifier，如 BBG000B9XRY4"},
            {"key": "ticker", "label": "Ticker", "required": True, "type": "text"},
            {"key": "exchange_code", "label": "Exchange Code", "required": False, "type": "text",
             "hint": "如 TT / US / JP"},
            {"key": "currency", "label": "Currency", "required": False, "type": "text"},
            {"key": "price_offset_days", "label": "Offset (days)", "required": False, "type": "number",
             "hint": "取價日偏移，處理時差 / 結算延遲"},
            {"key": "status", "label": "Status", "required": False, "type": "select",
             "options": ["active", "inactive"], "default": "active"},
        ],
    },
    "factset": {
        "id": "factset", "label": "FactSet",
        "fields": [
            {"key": "fab_code", "label": "Fab Code", "required": True, "type": "fk"},
            {"key": "factset_entity_id", "label": "FactSet ID", "required": True, "type": "text",
             "hint": "如 0FPWZZ-E"},
            {"key": "fsym_id", "label": "FSYM ID", "required": False, "type": "text",
             "hint": "FactSet permanent security identifier"},
            {"key": "ticker_region", "label": "Ticker-Region", "required": False, "type": "text",
             "hint": "如 2330-TW"},
            {"key": "status", "label": "Status", "required": False, "type": "select",
             "options": ["active", "inactive"], "default": "active"},
        ],
    },
    "contify": {
        "id": "contify", "label": "Contify",
        "fields": [
            {"key": "fab_code", "label": "Fab Code", "required": True, "type": "fk"},
            {"key": "company_name", "label": "Company Name", "required": True, "type": "text",
             "hint": "新聞追蹤顯示名稱，供關鍵字 / watchlist 建檔使用"},
            {"key": "contify_company_id", "label": "Contify Company ID", "required": True, "type": "text"},
            {"key": "watchlist_id", "label": "Watchlist ID", "required": False, "type": "text"},
            {"key": "topics", "label": "Topics", "required": False, "type": "text",
             "hint": "逗號分隔的追蹤主題，如 M&A,Capacity Expansion"},
            {"key": "status", "label": "Status", "required": False, "type": "select",
             "options": ["active", "inactive"], "default": "active"},
        ],
    },
    "snp": {
        "id": "snp", "label": "S&P",
        "fields": [
            {"key": "fab_code", "label": "Fab Code", "required": True, "type": "fk"},
            {"key": "spciq_id", "label": "S&P Capital IQ ID", "required": True, "type": "text",
             "hint": "如 IQ24937"},
            {"key": "gvkey", "label": "GVKEY", "required": False, "type": "text",
             "hint": "Compustat 公司永久代碼"},
            {"key": "snp_ticker", "label": "S&P Ticker", "required": False, "type": "text"},
            {"key": "status", "label": "Status", "required": False, "type": "select",
             "options": ["active", "inactive"], "default": "active"},
        ],
    },
    "dnb": {
        "id": "dnb", "label": "D&B",
        "fields": [
            {"key": "fab_code", "label": "Fab Code", "required": True, "type": "fk"},
            {"key": "duns_number", "label": "DUNS Number", "required": True, "type": "text",
             "hint": "9 碼 D-U-N-S 編號"},
            {"key": "global_ultimate_duns", "label": "Global Ultimate DUNS", "required": False, "type": "text",
             "hint": "全球最終母公司 DUNS"},
            {"key": "tradestyle_name", "label": "Tradestyle Name", "required": False, "type": "text"},
            {"key": "status", "label": "Status", "required": False, "type": "select",
             "options": ["active", "inactive"], "default": "active"},
        ],
    },
}

DEFAULT_SYSTEM_PARAMS = {
    "id": "system_params",
    "label": "System Parameter",
    "key_field": "param_key",
    "fields": [
        {"key": "param_key", "label": "Key", "required": True, "type": "text"},
        {"key": "param_value", "label": "Value", "required": True, "type": "text"},
        {"key": "category", "label": "Category", "required": False, "type": "select",
         "options": ["scheduler", "ai_kernel", "data_platform", "general"], "default": "general"},
        {"key": "value_type", "label": "Type", "required": False, "type": "select",
         "options": ["string", "number", "boolean", "json"], "default": "string"},
        {"key": "description", "label": "Description", "required": False, "type": "text"},
    ],
}
