"""Company Identity Intelligence — 種子資料。

延伸既有的 59 家 seed_companies（重複的公司直接沿用其 fab_code，不重複建立），
新增 TSMC 供應鏈中尚未涵蓋的公司,並建立 SupplyChainEdge 把整批公司跟 TSMC
串成一張圖。約 100 家公司 = 59 家既有 seed 中可歸類的 40 家 + 這裡新增的 58 家。

跟 seed_companies.py 保持同樣的介面慣例：load_xxx() 回傳 list[dict]，
未來要換成 DB-as-source 只需要改這幾個函式的內部實作。
"""

# ── 新增的 CompanyMaster 種子(既有 59 家沒有涵蓋到的供應鏈成員) ──
NEW_COMPANIES: list[dict] = [
    # 設備 Equipment
    {"fab_code": "ASMI", "company_name": "ASM International N.V.", "company_short_name": "ASM International", "country": "Netherlands", "region": "EMEA"},
    {"fab_code": "SCREEN", "company_name": "SCREEN Semiconductor Solutions Co.", "company_short_name": "SCREEN", "country": "Japan", "region": "APAC"},
    {"fab_code": "HITACHIHT", "company_name": "Hitachi High-Tech Corporation", "company_short_name": "Hitachi High-Tech", "country": "Japan", "region": "APAC"},
    {"fab_code": "NIKON", "company_name": "Nikon Corporation", "company_short_name": "Nikon", "country": "Japan", "region": "APAC"},
    {"fab_code": "CANON", "company_name": "Canon Inc.", "company_short_name": "Canon", "country": "Japan", "region": "APAC"},
    {"fab_code": "EBARA", "company_name": "Ebara Corporation", "company_short_name": "Ebara", "country": "Japan", "region": "APAC"},
    {"fab_code": "KOKUSAI", "company_name": "Kokusai Electric Corporation", "company_short_name": "Kokusai Electric", "country": "Japan", "region": "APAC"},
    {"fab_code": "UCTT", "company_name": "Ultra Clean Holdings Inc.", "company_short_name": "Ultra Clean", "country": "USA", "region": "AMER"},
    {"fab_code": "ONTO", "company_name": "Onto Innovation Inc.", "company_short_name": "Onto Innovation", "country": "USA", "region": "AMER"},
    {"fab_code": "BESI", "company_name": "BE Semiconductor Industries N.V.", "company_short_name": "Besi", "country": "Netherlands", "region": "EMEA"},
    {"fab_code": "BRKS", "company_name": "Brooks Automation Inc.", "company_short_name": "Brooks Automation", "country": "USA", "region": "AMER"},
    # 材料 Materials
    {"fab_code": "SHINETSU", "company_name": "Shin-Etsu Chemical Co.", "company_short_name": "Shin-Etsu", "country": "Japan", "region": "APAC"},
    {"fab_code": "ENTEGRIS", "company_name": "Entegris Inc.", "company_short_name": "Entegris", "country": "USA", "region": "AMER"},
    {"fab_code": "JSR", "company_name": "JSR Corporation", "company_short_name": "JSR", "country": "Japan", "region": "APAC"},
    {"fab_code": "EMDELEC", "company_name": "EMD Electronics (Merck KGaA)", "company_short_name": "EMD Electronics", "country": "Germany", "region": "EMEA"},
    {"fab_code": "AIRPROD", "company_name": "Air Products and Chemicals Inc.", "company_short_name": "Air Products", "country": "USA", "region": "AMER"},
    {"fab_code": "LINDE", "company_name": "Linde plc", "company_short_name": "Linde", "country": "Germany", "region": "EMEA"},
    {"fab_code": "SUMITOMOCHEM", "company_name": "Sumitomo Chemical Co.", "company_short_name": "Sumitomo Chemical", "country": "Japan", "region": "APAC"},
    {"fab_code": "RESONAC", "company_name": "Resonac Holdings Corporation", "company_short_name": "Resonac", "country": "Japan", "region": "APAC"},
    {"fab_code": "DUPONT", "company_name": "DuPont de Nemours Inc.", "company_short_name": "DuPont", "country": "USA", "region": "AMER"},
    {"fab_code": "MGC", "company_name": "Mitsubishi Gas Chemical Company", "company_short_name": "Mitsubishi Gas Chemical", "country": "Japan", "region": "APAC"},
    {"fab_code": "TOK", "company_name": "Tokyo Ohka Kogyo Co.", "company_short_name": "TOK", "country": "Japan", "region": "APAC"},
    {"fab_code": "FUJIFILMEM", "company_name": "Fujifilm Electronic Materials", "company_short_name": "Fujifilm EM", "country": "Japan", "region": "APAC"},
    {"fab_code": "KANTODENKA", "company_name": "Kanto Denka Kogyo Co.", "company_short_name": "Kanto Denka", "country": "Japan", "region": "APAC"},
    {"fab_code": "SOULBRAIN", "company_name": "Soulbrain Co.", "company_short_name": "Soulbrain", "country": "South Korea", "region": "APAC"},
    {"fab_code": "WONIKMAT", "company_name": "Wonik Materials Co.", "company_short_name": "Wonik Materials", "country": "South Korea", "region": "APAC"},
    {"fab_code": "SILTRONIC", "company_name": "Siltronic AG", "company_short_name": "Siltronic", "country": "Germany", "region": "EMEA"},
    {"fab_code": "AIRLIQUIDE", "company_name": "Air Liquide S.A.", "company_short_name": "Air Liquide", "country": "France", "region": "EMEA"},
    # EDA / IP
    {"fab_code": "SIEMENSEDA", "company_name": "Siemens EDA", "company_short_name": "Siemens EDA", "country": "Germany", "region": "EMEA"},
    {"fab_code": "IMGTEC", "company_name": "Imagination Technologies Ltd.", "company_short_name": "Imagination Tech", "country": "UK", "region": "EMEA"},
    {"fab_code": "RMBS", "company_name": "Rambus Inc.", "company_short_name": "Rambus", "country": "USA", "region": "AMER"},
    {"fab_code": "CEVA", "company_name": "CEVA Inc.", "company_short_name": "CEVA", "country": "USA", "region": "AMER"},
    # Fabless 客戶
    {"fab_code": "TSLA", "company_name": "Tesla Inc.", "company_short_name": "Tesla", "country": "USA", "region": "AMER"},
    {"fab_code": "HIMAX", "company_name": "Himax Technologies Inc.", "company_short_name": "Himax", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "XLNX", "company_name": "Xilinx (現為 AMD 事業群)", "company_short_name": "Xilinx", "country": "USA", "region": "AMER"},
    {"fab_code": "CRUS", "company_name": "Cirrus Logic Inc.", "company_short_name": "Cirrus Logic", "country": "USA", "region": "AMER"},
    {"fab_code": "QRVO", "company_name": "Qorvo Inc.", "company_short_name": "Qorvo", "country": "USA", "region": "AMER"},
    {"fab_code": "SWKS", "company_name": "Skyworks Solutions Inc.", "company_short_name": "Skyworks", "country": "USA", "region": "AMER"},
    # 封測 OSAT
    {"fab_code": "JCET", "company_name": "JCET Group Co.", "company_short_name": "JCET", "country": "China", "region": "APAC"},
    {"fab_code": "SPIL", "company_name": "Siliconware Precision Industries", "company_short_name": "SPIL", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "PWRTECH", "company_name": "Powertech Technology Inc.", "company_short_name": "Powertech", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "KYEC", "company_name": "King Yuan Electronics Co.", "company_short_name": "KYEC", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "CHIPBOND", "company_name": "Chipbond Technology Corporation", "company_short_name": "Chipbond", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "CHIPMOS", "company_name": "ChipMOS Technologies Inc.", "company_short_name": "ChipMOS", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "TFME", "company_name": "Tongfu Microelectronics Co.", "company_short_name": "Tongfu", "country": "China", "region": "APAC"},
    {"fab_code": "HANAMICRON", "company_name": "Hana Micron Inc.", "company_short_name": "Hana Micron", "country": "South Korea", "region": "APAC"},
    # 載板 / PCB
    {"fab_code": "UNIMICRON", "company_name": "Unimicron Technology Corp.", "company_short_name": "Unimicron", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "IBIDEN", "company_name": "Ibiden Co.", "company_short_name": "Ibiden", "country": "Japan", "region": "APAC"},
    {"fab_code": "KINSUS", "company_name": "Kinsus Interconnect Technology Corp.", "company_short_name": "Kinsus", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "NANYAPCB", "company_name": "Nan Ya PCB Corporation", "company_short_name": "Nan Ya PCB", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "SHINKO", "company_name": "Shinko Electric Industries Co.", "company_short_name": "Shinko", "country": "Japan", "region": "APAC"},
    {"fab_code": "ATS", "company_name": "AT&S Austria Technologie & Systemtechnik AG", "company_short_name": "AT&S", "country": "Austria", "region": "EMEA"},
    # 測試 / 封裝設備
    {"fab_code": "TER", "company_name": "Teradyne Inc.", "company_short_name": "Teradyne", "country": "USA", "region": "AMER"},
    {"fab_code": "CHROMAATE", "company_name": "Chroma ATE Inc.", "company_short_name": "Chroma ATE", "country": "Taiwan", "region": "APAC"},
    {"fab_code": "COHU", "company_name": "Cohu Inc.", "company_short_name": "Cohu", "country": "USA", "region": "AMER"},
    {"fab_code": "XCERRA", "company_name": "Xcerra Corporation (原 LTX-Credence)", "company_short_name": "Xcerra", "country": "USA", "region": "AMER"},
    {"fab_code": "FORMFACTOR", "company_name": "FormFactor Inc.", "company_short_name": "FormFactor", "country": "USA", "region": "AMER"},
    {"fab_code": "KULICKESOFFA", "company_name": "Kulicke & Soffa Industries Inc.", "company_short_name": "Kulicke & Soffa", "country": "Singapore", "region": "APAC"},
]

for _c in NEW_COMPANIES:
    _c.setdefault("status", "active")
    _c.setdefault("remark", "seed: TSMC supply-chain identity MVP")

# ── 既有 59 家 seed 中,可直接歸類進 TSMC 供應鏈圖的公司,及其類別 ──
# (fab_code, category, edge_type)
EXISTING_TO_CLASSIFY: list[tuple[str, str, str]] = [
    ("UMC", "foundry", "COMPETITOR_OF"),
    ("GF", "foundry", "COMPETITOR_OF"),
    ("SMIC", "foundry", "COMPETITOR_OF"),
    ("VIS", "foundry", "COMPETITOR_OF"),
    ("PSMC", "foundry", "COMPETITOR_OF"),
    ("TOWER", "foundry", "COMPETITOR_OF"),
    ("INTC", "foundry", "COMPETITOR_OF"),   # Intel Foundry 業務
    ("SEC", "foundry", "COMPETITOR_OF"),    # Samsung Foundry 業務
    ("ASML", "equipment", "SUPPLIES_TO"),
    ("AMAT", "equipment", "SUPPLIES_TO"),
    ("LRCX", "equipment", "SUPPLIES_TO"),
    ("KLAC", "equipment", "SUPPLIES_TO"),
    ("TEL", "equipment", "SUPPLIES_TO"),
    ("ADVANTEST", "test_assembly", "SUPPLIES_TO"),
    ("SUMCO", "materials", "SUPPLIES_TO"),
    ("GWC", "materials", "SUPPLIES_TO"),
    ("SNPS", "eda_ip", "IP_LICENSOR_OF"),
    ("CDNS", "eda_ip", "IP_LICENSOR_OF"),
    ("ARM", "eda_ip", "IP_LICENSOR_OF"),
    ("ASE", "osat", "PACKAGES_FOR"),
    ("AMKR", "osat", "PACKAGES_FOR"),
    ("NVDA", "fabless", "CUSTOMER_OF"),
    ("AMD", "fabless", "CUSTOMER_OF"),
    ("QCOM", "fabless", "CUSTOMER_OF"),
    ("AVGO", "fabless", "CUSTOMER_OF"),
    ("MTK", "fabless", "CUSTOMER_OF"),
    ("MRVL", "fabless", "CUSTOMER_OF"),
    ("NOVATEK", "fabless", "CUSTOMER_OF"),
    ("REALTEK", "fabless", "CUSTOMER_OF"),
    ("NXP", "fabless", "CUSTOMER_OF"),
    ("IFX", "fabless", "CUSTOMER_OF"),
    ("STM", "fabless", "CUSTOMER_OF"),
    ("RENESAS", "fabless", "CUSTOMER_OF"),
    ("ONSEMI", "fabless", "CUSTOMER_OF"),
    ("SONYSEMI", "fabless", "CUSTOMER_OF"),
    ("GOOGL", "fabless", "CUSTOMER_OF"),
    ("MSFT", "fabless", "CUSTOMER_OF"),
    ("AMZN", "fabless", "CUSTOMER_OF"),
    ("AAPL", "fabless", "CUSTOMER_OF"),
]

# 新增公司的 (fab_code, category, edge_type) —— 全部對 TSMC
NEW_CLASSIFY: list[tuple[str, str, str]] = [
    ("ASMI", "equipment", "SUPPLIES_TO"), ("SCREEN", "equipment", "SUPPLIES_TO"),
    ("HITACHIHT", "equipment", "SUPPLIES_TO"), ("NIKON", "equipment", "SUPPLIES_TO"),
    ("CANON", "equipment", "SUPPLIES_TO"), ("EBARA", "equipment", "SUPPLIES_TO"),
    ("KOKUSAI", "equipment", "SUPPLIES_TO"), ("UCTT", "equipment", "SUPPLIES_TO"),
    ("ONTO", "equipment", "SUPPLIES_TO"), ("BESI", "equipment", "SUPPLIES_TO"),
    ("BRKS", "equipment", "SUPPLIES_TO"),
    ("SHINETSU", "materials", "SUPPLIES_TO"), ("ENTEGRIS", "materials", "SUPPLIES_TO"),
    ("JSR", "materials", "SUPPLIES_TO"), ("EMDELEC", "materials", "SUPPLIES_TO"),
    ("AIRPROD", "materials", "SUPPLIES_TO"), ("LINDE", "materials", "SUPPLIES_TO"),
    ("SUMITOMOCHEM", "materials", "SUPPLIES_TO"), ("RESONAC", "materials", "SUPPLIES_TO"),
    ("DUPONT", "materials", "SUPPLIES_TO"), ("MGC", "materials", "SUPPLIES_TO"),
    ("TOK", "materials", "SUPPLIES_TO"), ("FUJIFILMEM", "materials", "SUPPLIES_TO"),
    ("KANTODENKA", "materials", "SUPPLIES_TO"), ("SOULBRAIN", "materials", "SUPPLIES_TO"),
    ("WONIKMAT", "materials", "SUPPLIES_TO"), ("SILTRONIC", "materials", "SUPPLIES_TO"),
    ("AIRLIQUIDE", "materials", "SUPPLIES_TO"),
    ("SIEMENSEDA", "eda_ip", "IP_LICENSOR_OF"), ("IMGTEC", "eda_ip", "IP_LICENSOR_OF"),
    ("RMBS", "eda_ip", "IP_LICENSOR_OF"), ("CEVA", "eda_ip", "IP_LICENSOR_OF"),
    ("TSLA", "fabless", "CUSTOMER_OF"), ("HIMAX", "fabless", "CUSTOMER_OF"),
    ("XLNX", "fabless", "CUSTOMER_OF"), ("CRUS", "fabless", "CUSTOMER_OF"),
    ("QRVO", "fabless", "CUSTOMER_OF"), ("SWKS", "fabless", "CUSTOMER_OF"),
    ("JCET", "osat", "PACKAGES_FOR"), ("SPIL", "osat", "PACKAGES_FOR"),
    ("PWRTECH", "osat", "PACKAGES_FOR"), ("KYEC", "osat", "PACKAGES_FOR"),
    ("CHIPBOND", "osat", "PACKAGES_FOR"), ("CHIPMOS", "osat", "PACKAGES_FOR"),
    ("TFME", "osat", "PACKAGES_FOR"), ("HANAMICRON", "osat", "PACKAGES_FOR"),
    ("UNIMICRON", "substrate", "SUPPLIES_TO"), ("IBIDEN", "substrate", "SUPPLIES_TO"),
    ("KINSUS", "substrate", "SUPPLIES_TO"), ("NANYAPCB", "substrate", "SUPPLIES_TO"),
    ("SHINKO", "substrate", "SUPPLIES_TO"), ("ATS", "substrate", "SUPPLIES_TO"),
    ("TER", "test_assembly", "SUPPLIES_TO"), ("CHROMAATE", "test_assembly", "SUPPLIES_TO"),
    ("COHU", "test_assembly", "SUPPLIES_TO"), ("XCERRA", "test_assembly", "SUPPLIES_TO"),
    ("FORMFACTOR", "test_assembly", "SUPPLIES_TO"), ("KULICKESOFFA", "test_assembly", "SUPPLIES_TO"),
]

_SOURCES = ["bloomberg", "factset", "dnb", "contify", "internal", "snp"]


def load_new_companies() -> list[dict]:
    return NEW_COMPANIES


def load_supply_chain_edges() -> list[dict]:
    """組出所有 SupplyChainEdge 種子列,confidence/source 為展示用合成值
    (公式跟先前 HTML 原型一致,方便對照),正式版由 Stage 1 Ingest 從
    Bloomberg/FactSet/D&B/Contify 實際計算。"""
    edges = []
    all_classified = EXISTING_TO_CLASSIFY + NEW_CLASSIFY
    for i, (fab_code, category, edge_type) in enumerate(all_classified):
        confidence = round(0.99 - ((len(fab_code) * 7 + i * 3) % 24) / 100, 2)
        edges.append({
            "source_fab_code": fab_code,
            "target_fab_code": "TSMC",
            "category": category,
            "edge_type": edge_type,
            "confidence": confidence,
            "source": _SOURCES[i % len(_SOURCES)],
        })

    # 五個真實發生過的公司身份事件 —— 同一張表,用 valid_from/event_label
    # 餵給 Timeline workspace(bi-temporal 概念,不用另開表)。
    edges += [
        {"source_fab_code": "SPIL", "target_fab_code": "ASE", "category": "identity_event",
         "edge_type": "SUBSIDIARY_OF", "confidence": 0.95, "source": "internal",
         "valid_from": "2018-04-30", "event_label": "矽品精密併入日月光投控集團"},
        {"source_fab_code": "KOKUSAI", "target_fab_code": "HITACHIHT", "category": "identity_event",
         "edge_type": "FORMERLY_SUBSIDIARY_OF", "confidence": 0.91, "source": "factset",
         "valid_from": "2018-01-01", "valid_until": "2023-10-01",
         "event_label": "Kokusai Electric 自日立高新分割獨立"},
        {"source_fab_code": "XLNX", "target_fab_code": "AMD", "category": "identity_event",
         "edge_type": "SUBSIDIARY_OF", "confidence": 0.98, "source": "bloomberg",
         "valid_from": "2022-02-14", "event_label": "AMD 完成收購 Xilinx"},
        {"source_fab_code": "RESONAC", "target_fab_code": "RESONAC", "category": "identity_event",
         "edge_type": "ALIAS_OF", "confidence": 0.99, "source": "contify",
         "valid_from": "2023-01-01", "event_label": "Showa Denko 更名為 Resonac"},
        {"source_fab_code": "ONSEMI", "target_fab_code": "ONSEMI", "category": "identity_event",
         "edge_type": "ALIAS_OF", "confidence": 0.99, "source": "contify",
         "valid_from": "2023-01-01", "event_label": "ON Semiconductor 更名為 onsemi"},
    ]
    return edges


def load_decisions() -> list[dict]:
    return [
        {"id": "RES-00182", "category": "alias_resolution",
         "scenario": '查詢字串 "Applied Materials, Inc." 之解析',
         "reasoning": "Name similarity 0.97、Domain match、既有 Company Master 別名紀錄三項證據一致",
         "outcome": "resolved_to_AMAT", "confidence": 0.97, "model": "tmic-ner-v3 / prompt v12"},
        {"id": "RES-00179", "category": "group_merge",
         "scenario": '"矽品" 與 "SPIL" 於日月光集團結構下的關係判定',
         "reasoning": "2018 年集團整併為公開事實,採 SUBSIDIARY_OF 而非 SAME_AS,保留原法人身份",
         "outcome": "建立 SPIL → ASE SUBSIDIARY_OF 邊", "confidence": 0.95, "model": "tmic-ner-v3 / prompt v12"},
        {"id": "RES-00171", "category": "rename_tracking",
         "scenario": '"ON Semiconductor" 於近期文件中的品牌指稱',
         "reasoning": "官方更名紀錄 + 官網 domain 未變,判定為同一法人之品牌更新",
         "outcome": "解析為 ONSEMI,保留舊名為 ALIAS_OF", "confidence": 0.99, "model": "tmic-ner-v3 / prompt v12"},
        {"id": "RES-00164", "category": "conflict_resolution",
         "scenario": '"Kokusai Electric" 母公司欄位多來源不一致',
         "reasoning": "Bloomberg 標示為獨立上市公司,部份內部舊資料仍標示為 Hitachi 子公司,採 most_recent 策略解決",
         "outcome": "採用獨立實體判定,舊關係標記為歷史關係", "confidence": 0.91, "model": "tmic-ner-v3 / prompt v11"},
        {"id": "RES-00158", "category": "acquisition_tracking",
         "scenario": '"Xilinx" 於 2022 年後文件中的識別',
         "reasoning": "公開收購案已完成,法人已併入 AMD,但產品線品牌持續使用 Xilinx",
         "outcome": "解析為 XLNX,新增 SUBSIDIARY_OF → AMD", "confidence": 0.98, "model": "tmic-ner-v3 / prompt v12"},
    ]


def load_resolution_candidates() -> list[dict]:
    return [
        {"fab_code_a": "SPIL", "fab_code_b": "ASE", "suggested_relation": "SUBSIDIARY_OF",
         "note": "2018 年集團整併,建議關係:SUBSIDIARY_OF(非 SAME_AS,兩者法人格仍各自存續)",
         "evidence": ["集團公告", "Bloomberg 股權結構", "D&B 母子公司紀錄"]},
        {"fab_code_a": "XLNX", "fab_code_b": "AMD", "suggested_relation": "SUBSIDIARY_OF",
         "note": "2022 年收購完成,建議關係:SUBSIDIARY_OF,品牌沿用 Xilinx",
         "evidence": ["公開收購文件", "FactSet 股權變更", "Domain 未變更"]},
        {"fab_code_a": "ONSEMI", "fab_code_b": "ONSEMI", "suggested_relation": "ALIAS_OF",
         "note": '品牌更名事件,建議關係:ALIAS_OF(舊名 "ON Semiconductor" 保留為歷史別名)',
         "evidence": ["官方更名公告", "官網 domain 一致", "Ticker 未變更"]},
        {"fab_code_a": "RESONAC", "fab_code_b": "RESONAC", "suggested_relation": "ALIAS_OF",
         "note": '品牌更名事件,建議關係:ALIAS_OF(舊名 "Showa Denko" 保留為歷史別名)',
         "evidence": ["官方更名公告", "Contify 新聞紀錄"]},
        {"fab_code_a": "KOKUSAI", "fab_code_b": "HITACHIHT", "suggested_relation": "FORMERLY_SUBSIDIARY_OF",
         "note": "歷史分割關係,建議關係:FORMERLY_SUBSIDIARY_OF(2018 年後已獨立)",
         "evidence": ["IPO 公開說明書", "股權結構歷史紀錄"]},
    ]
