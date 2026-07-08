"""Company Master 初始資料 — 世界 59 大半導體 / AI 相關公司。

目前以 code base 靜態清單作為 init 來源（首次啟動且 company_master 為空時載入）；
未來切換為 DB 作為資料來源時，僅需將 load_seed_companies() 改為查詢外部資料表，
呼叫端（main.py 的 startup seed）介面不變。

涵蓋：晶圓代工、IDM、Fabless、記憶體、設備、材料、EDA/IP、封測、AI 晶片/雲端。
"""

SEED_COMPANIES: list[dict] = [
    # ── 晶圓代工 Foundry ──
    {"fab_code": "TSMC",  "company_name": "Taiwan Semiconductor Manufacturing Co.", "company_short_name": "TSMC", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "UMC",   "company_name": "United Microelectronics Corp.", "company_short_name": "UMC", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "GF",    "company_name": "GlobalFoundries Inc.", "company_short_name": "GlobalFoundries", "country": "USA", "region": "AMER"},
    {"fab_code": "SMIC",  "company_name": "Semiconductor Manufacturing International Corp.", "company_short_name": "SMIC", "country": "China", "region": "APAC"},
    {"fab_code": "VIS",   "company_name": "Vanguard International Semiconductor", "company_short_name": "VIS", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "PSMC",  "company_name": "Powerchip Semiconductor Manufacturing Corp.", "company_short_name": "PSMC", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "HHGRACE", "company_name": "Hua Hong Semiconductor", "company_short_name": "Hua Hong", "country": "China", "region": "APAC"},
    {"fab_code": "TOWER", "company_name": "Tower Semiconductor", "company_short_name": "Tower", "country": "Israel", "region": "EMEA"},
    {"fab_code": "RAPIDUS", "company_name": "Rapidus Corporation", "company_short_name": "Rapidus", "country": "Japan", "region": "APAC"},
    # ── IDM ──
    {"fab_code": "INTC",  "company_name": "Intel Corporation", "company_short_name": "Intel", "country": "USA", "region": "AMER"},
    {"fab_code": "SEC",   "company_name": "Samsung Electronics Co.", "company_short_name": "Samsung", "country": "South Korea", "region": "APAC"},
    {"fab_code": "TI",    "company_name": "Texas Instruments Inc.", "company_short_name": "TI", "country": "USA", "region": "AMER"},
    {"fab_code": "ADI",   "company_name": "Analog Devices Inc.", "company_short_name": "ADI", "country": "USA", "region": "AMER"},
    {"fab_code": "NXP",   "company_name": "NXP Semiconductors", "company_short_name": "NXP", "country": "Netherlands", "region": "EMEA"},
    {"fab_code": "IFX",   "company_name": "Infineon Technologies AG", "company_short_name": "Infineon", "country": "Germany", "region": "EMEA"},
    {"fab_code": "STM",   "company_name": "STMicroelectronics", "company_short_name": "STMicro", "country": "Switzerland", "region": "EMEA"},
    {"fab_code": "RENESAS", "company_name": "Renesas Electronics Corp.", "company_short_name": "Renesas", "country": "Japan", "region": "APAC"},
    {"fab_code": "MCHP",  "company_name": "Microchip Technology Inc.", "company_short_name": "Microchip", "country": "USA", "region": "AMER"},
    {"fab_code": "ONSEMI", "company_name": "onsemi (ON Semiconductor)", "company_short_name": "onsemi", "country": "USA", "region": "AMER"},
    {"fab_code": "SONYSEMI", "company_name": "Sony Semiconductor Solutions", "company_short_name": "Sony Semi", "country": "Japan", "region": "APAC"},
    # ── 記憶體 Memory ──
    {"fab_code": "MU",    "company_name": "Micron Technology Inc.", "company_short_name": "Micron", "country": "USA", "region": "AMER"},
    {"fab_code": "HYNIX", "company_name": "SK hynix Inc.", "company_short_name": "SK hynix", "country": "South Korea", "region": "APAC"},
    {"fab_code": "KIOXIA", "company_name": "Kioxia Holdings Corp.", "company_short_name": "Kioxia", "country": "Japan", "region": "APAC"},
    {"fab_code": "WDC",   "company_name": "Western Digital Corp.", "company_short_name": "WD", "country": "USA", "region": "AMER"},
    {"fab_code": "NANYA", "company_name": "Nanya Technology Corp.", "company_short_name": "Nanya", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "WINBOND", "company_name": "Winbond Electronics Corp.", "company_short_name": "Winbond", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "MXIC",  "company_name": "Macronix International Co.", "company_short_name": "Macronix", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "YMTC",  "company_name": "Yangtze Memory Technologies Co.", "company_short_name": "YMTC", "country": "China", "region": "APAC"},
    {"fab_code": "CXMT",  "company_name": "ChangXin Memory Technologies", "company_short_name": "CXMT", "country": "China", "region": "APAC"},
    # ── Fabless ──
    {"fab_code": "NVDA",  "company_name": "NVIDIA Corporation", "company_short_name": "NVIDIA", "country": "USA", "region": "AMER"},
    {"fab_code": "AMD",   "company_name": "Advanced Micro Devices Inc.", "company_short_name": "AMD", "country": "USA", "region": "AMER"},
    {"fab_code": "QCOM",  "company_name": "Qualcomm Inc.", "company_short_name": "Qualcomm", "country": "USA", "region": "AMER"},
    {"fab_code": "AVGO",  "company_name": "Broadcom Inc.", "company_short_name": "Broadcom", "country": "USA", "region": "AMER"},
    {"fab_code": "MTK",   "company_name": "MediaTek Inc.", "company_short_name": "MediaTek", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "MRVL",  "company_name": "Marvell Technology Inc.", "company_short_name": "Marvell", "country": "USA", "region": "AMER"},
    {"fab_code": "NOVATEK", "company_name": "Novatek Microelectronics Corp.", "company_short_name": "Novatek", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "REALTEK", "company_name": "Realtek Semiconductor Corp.", "company_short_name": "Realtek", "country": "Taiwan", "region": "APAC"},
    # ── 設備 Equipment ──
    {"fab_code": "ASML",  "company_name": "ASML Holding N.V.", "company_short_name": "ASML", "country": "Netherlands", "region": "EMEA"},
    {"fab_code": "AMAT",  "company_name": "Applied Materials Inc.", "company_short_name": "AMAT", "country": "USA", "region": "AMER"},
    {"fab_code": "LRCX",  "company_name": "Lam Research Corp.", "company_short_name": "Lam", "country": "USA", "region": "AMER"},
    {"fab_code": "KLAC",  "company_name": "KLA Corporation", "company_short_name": "KLA", "country": "USA", "region": "AMER"},
    {"fab_code": "TEL",   "company_name": "Tokyo Electron Ltd.", "company_short_name": "TEL", "country": "Japan", "region": "APAC"},
    {"fab_code": "ADVANTEST", "company_name": "Advantest Corp.", "company_short_name": "Advantest", "country": "Japan", "region": "APAC"},
    # ── 材料 Materials ──
    {"fab_code": "SUMCO", "company_name": "SUMCO Corporation", "company_short_name": "SUMCO", "country": "Japan", "region": "APAC"},
    {"fab_code": "GWC",   "company_name": "GlobalWafers Co.", "company_short_name": "GlobalWafers", "country": "Taiwan", "region": "APAC"},
    # ── EDA / IP ──
    {"fab_code": "SNPS",  "company_name": "Synopsys Inc.", "company_short_name": "Synopsys", "country": "USA", "region": "AMER"},
    {"fab_code": "CDNS",  "company_name": "Cadence Design Systems Inc.", "company_short_name": "Cadence", "country": "USA", "region": "AMER"},
    {"fab_code": "ARM",   "company_name": "Arm Holdings plc", "company_short_name": "Arm", "country": "UK", "region": "EMEA"},
    # ── 封測 OSAT ──
    {"fab_code": "ASE",   "company_name": "ASE Technology Holding Co.", "company_short_name": "ASE", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "AMKR",  "company_name": "Amkor Technology Inc.", "company_short_name": "Amkor", "country": "USA", "region": "AMER"},
    # ── AI 晶片 / 雲端 AI ──
    {"fab_code": "GOOGL", "company_name": "Alphabet Inc. (Google / TPU)", "company_short_name": "Google", "country": "USA", "region": "AMER"},
    {"fab_code": "MSFT",  "company_name": "Microsoft Corp. (Azure AI / Maia)", "company_short_name": "Microsoft", "country": "USA", "region": "AMER"},
    {"fab_code": "AMZN",  "company_name": "Amazon.com Inc. (AWS / Trainium)", "company_short_name": "Amazon", "country": "USA", "region": "AMER"},
    {"fab_code": "AAPL",  "company_name": "Apple Inc. (Apple Silicon)", "company_short_name": "Apple", "country": "USA", "region": "AMER"},
    {"fab_code": "META",  "company_name": "Meta Platforms Inc. (MTIA)", "company_short_name": "Meta", "country": "USA", "region": "AMER"},
    {"fab_code": "OPENAI", "company_name": "OpenAI", "company_short_name": "OpenAI", "country": "USA", "region": "AMER"},
    {"fab_code": "ANTH",  "company_name": "Anthropic PBC", "company_short_name": "Anthropic", "country": "USA", "region": "AMER"},
    {"fab_code": "CEREBRAS", "company_name": "Cerebras Systems Inc.", "company_short_name": "Cerebras", "country": "USA", "region": "AMER"},
    {"fab_code": "GROQ",  "company_name": "Groq Inc.", "company_short_name": "Groq", "country": "USA", "region": "AMER"},
]

for _c in SEED_COMPANIES:
    _c.setdefault("status", "active")
    _c.setdefault("remark", "seed: top semiconductor / AI companies")


def load_seed_companies() -> list[dict]:
    """目前回傳 code base 靜態清單；未來改為 DB 查詢時僅需改此函式。"""
    return SEED_COMPANIES
