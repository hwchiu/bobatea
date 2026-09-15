// data/mockCompanyIdentity.ts
// 離線 fallback 用的資料集 —— 內容與 backend/app/seed_supply_chain.py 同源產生，
// 確保有無 FastAPI 後端(GitHub Pages 純前端 vs 完整伺服器部署)看到的是同一份資料。
import type {
  CompanyNode, TimelineEvent, IdentityDecision, ResolutionCandidate, Ontology,
} from "@/lib/companyIdentityTypes";

export const mockCompanies: CompanyNode[] = [
  {
    "fab_code": "TSMC",
    "name": "TSMC",
    "category": "hub",
    "category_label": "台積電 (Hub)",
    "country": "Taiwan",
    "confidence": 1.0,
    "source": "internal",
    "edge_type": null
  },
  {
    "fab_code": "UMC",
    "name": "UMC",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "Taiwan",
    "confidence": 0.78,
    "source": "bloomberg",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "GF",
    "name": "GlobalFoundries",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "USA",
    "confidence": 0.82,
    "source": "factset",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "SMIC",
    "name": "SMIC",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "China",
    "confidence": 0.89,
    "source": "dnb",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "VIS",
    "name": "VIS",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "Taiwan",
    "confidence": 0.93,
    "source": "contify",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "PSMC",
    "name": "PSMC",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "Taiwan",
    "confidence": 0.83,
    "source": "internal",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "TOWER",
    "name": "Tower",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "Israel",
    "confidence": 0.97,
    "source": "snp",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "INTC",
    "name": "Intel",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "USA",
    "confidence": 0.77,
    "source": "bloomberg",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "SEC",
    "name": "Samsung",
    "category": "foundry",
    "category_label": "晶圓代工同業",
    "country": "South Korea",
    "confidence": 0.81,
    "source": "factset",
    "edge_type": "COMPETITOR_OF"
  },
  {
    "fab_code": "ASML",
    "name": "ASML",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Netherlands",
    "confidence": 0.95,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "AMAT",
    "name": "AMAT",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.92,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "LRCX",
    "name": "Lam",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.89,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "KLAC",
    "name": "KLA",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.86,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "TEL",
    "name": "TEL",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.9,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "ADVANTEST",
    "name": "Advantest",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "Japan",
    "confidence": 0.93,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SUMCO",
    "name": "SUMCO",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.94,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "GWC",
    "name": "GlobalWafers",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Taiwan",
    "confidence": 0.81,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SNPS",
    "name": "Synopsys",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "USA",
    "confidence": 0.95,
    "source": "internal",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "CDNS",
    "name": "Cadence",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "USA",
    "confidence": 0.92,
    "source": "snp",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "ARM",
    "name": "Arm",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "UK",
    "confidence": 0.96,
    "source": "bloomberg",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "ASE",
    "name": "ASE",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.93,
    "source": "factset",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "AMKR",
    "name": "Amkor",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "USA",
    "confidence": 0.83,
    "source": "dnb",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "NVDA",
    "name": "NVIDIA",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.8,
    "source": "contify",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "AMD",
    "name": "AMD",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.84,
    "source": "internal",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "QCOM",
    "name": "Qualcomm",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.98,
    "source": "snp",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "AVGO",
    "name": "Broadcom",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.95,
    "source": "bloomberg",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "MTK",
    "name": "MediaTek",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Taiwan",
    "confidence": 0.99,
    "source": "factset",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "MRVL",
    "name": "Marvell",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.89,
    "source": "dnb",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "NOVATEK",
    "name": "Novatek",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Taiwan",
    "confidence": 0.89,
    "source": "contify",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "REALTEK",
    "name": "Realtek",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Taiwan",
    "confidence": 0.86,
    "source": "internal",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "NXP",
    "name": "NXP",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Netherlands",
    "confidence": 0.87,
    "source": "snp",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "IFX",
    "name": "Infineon",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Germany",
    "confidence": 0.84,
    "source": "bloomberg",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "STM",
    "name": "STMicro",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Switzerland",
    "confidence": 0.81,
    "source": "factset",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "RENESAS",
    "name": "Renesas",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Japan",
    "confidence": 0.98,
    "source": "dnb",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "ONSEMI",
    "name": "onsemi",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.78,
    "source": "contify",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "SONYSEMI",
    "name": "Sony Semi",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Japan",
    "confidence": 0.85,
    "source": "internal",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "GOOGL",
    "name": "Google",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.79,
    "source": "snp",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "MSFT",
    "name": "Microsoft",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.83,
    "source": "bloomberg",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "AMZN",
    "name": "Amazon",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.8,
    "source": "factset",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "AAPL",
    "name": "Apple",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.77,
    "source": "dnb",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "ASMI",
    "name": "ASM International",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Netherlands",
    "confidence": 0.98,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SCREEN",
    "name": "SCREEN",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.81,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "HITACHIHT",
    "name": "Hitachi High-Tech",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.81,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "NIKON",
    "name": "Nikon",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.82,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "CANON",
    "name": "Canon",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.79,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "EBARA",
    "name": "Ebara",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.76,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "KOKUSAI",
    "name": "Kokusai Electric",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Japan",
    "confidence": 0.83,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "UCTT",
    "name": "Ultra Clean",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.77,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "ONTO",
    "name": "Onto Innovation",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.98,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "BESI",
    "name": "Besi",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "Netherlands",
    "confidence": 0.95,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "BRKS",
    "name": "Brooks Automation",
    "category": "equipment",
    "category_label": "設備供應商",
    "country": "USA",
    "confidence": 0.92,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SHINETSU",
    "name": "Shin-Etsu",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.85,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "ENTEGRIS",
    "name": "Entegris",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "USA",
    "confidence": 0.82,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "JSR",
    "name": "JSR",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.9,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "EMDELEC",
    "name": "EMD Electronics",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Germany",
    "confidence": 0.83,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "AIRPROD",
    "name": "Air Products",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "USA",
    "confidence": 0.8,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "LINDE",
    "name": "Linde",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Germany",
    "confidence": 0.91,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SUMITOMOCHEM",
    "name": "Sumitomo Chemical",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.87,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "RESONAC",
    "name": "Resonac",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.95,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "DUPONT",
    "name": "DuPont",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "USA",
    "confidence": 0.99,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "MGC",
    "name": "Mitsubishi Gas Chemical",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.93,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "TOK",
    "name": "TOK",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.9,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "FUJIFILMEM",
    "name": "Fujifilm EM",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.86,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "KANTODENKA",
    "name": "Kanto Denka",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Japan",
    "confidence": 0.83,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SOULBRAIN",
    "name": "Soulbrain",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "South Korea",
    "confidence": 0.87,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "WONIKMAT",
    "name": "Wonik Materials",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "South Korea",
    "confidence": 0.91,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SILTRONIC",
    "name": "Siltronic",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "Germany",
    "confidence": 0.81,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "AIRLIQUIDE",
    "name": "Air Liquide",
    "category": "materials",
    "category_label": "材料 / 化學品供應商",
    "country": "France",
    "confidence": 0.95,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SIEMENSEDA",
    "name": "Siemens EDA",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "Germany",
    "confidence": 0.92,
    "source": "factset",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "IMGTEC",
    "name": "Imagination Tech",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "UK",
    "confidence": 0.93,
    "source": "dnb",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "RMBS",
    "name": "Rambus",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "USA",
    "confidence": 0.8,
    "source": "contify",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "CEVA",
    "name": "CEVA",
    "category": "eda_ip",
    "category_label": "EDA / IP 供應商",
    "country": "USA",
    "confidence": 0.77,
    "source": "internal",
    "edge_type": "IP_LICENSOR_OF"
  },
  {
    "fab_code": "TSLA",
    "name": "Tesla",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.98,
    "source": "snp",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "HIMAX",
    "name": "Himax",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "Taiwan",
    "confidence": 0.88,
    "source": "bloomberg",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "XLNX",
    "name": "Xilinx",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.92,
    "source": "factset",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "CRUS",
    "name": "Cirrus Logic",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.89,
    "source": "dnb",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "QRVO",
    "name": "Qorvo",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.86,
    "source": "contify",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "SWKS",
    "name": "Skyworks",
    "category": "fabless",
    "category_label": "Fabless 客戶",
    "country": "USA",
    "confidence": 0.83,
    "source": "internal",
    "edge_type": "CUSTOMER_OF"
  },
  {
    "fab_code": "JCET",
    "name": "JCET",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "China",
    "confidence": 0.8,
    "source": "snp",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "SPIL",
    "name": "SPIL",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.77,
    "source": "bloomberg",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "PWRTECH",
    "name": "Powertech",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.77,
    "source": "factset",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "KYEC",
    "name": "KYEC",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.95,
    "source": "dnb",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "CHIPBOND",
    "name": "Chipbond",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.88,
    "source": "contify",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "CHIPMOS",
    "name": "ChipMOS",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "Taiwan",
    "confidence": 0.92,
    "source": "internal",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "TFME",
    "name": "Tongfu",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "China",
    "confidence": 0.86,
    "source": "snp",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "HANAMICRON",
    "name": "Hana Micron",
    "category": "osat",
    "category_label": "封測夥伴 (OSAT)",
    "country": "South Korea",
    "confidence": 0.89,
    "source": "bloomberg",
    "edge_type": "PACKAGES_FOR"
  },
  {
    "fab_code": "UNIMICRON",
    "name": "Unimicron",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Taiwan",
    "confidence": 0.93,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "IBIDEN",
    "name": "Ibiden",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Japan",
    "confidence": 0.87,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "KINSUS",
    "name": "Kinsus",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Taiwan",
    "confidence": 0.84,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "NANYAPCB",
    "name": "Nan Ya PCB",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Taiwan",
    "confidence": 0.91,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "SHINKO",
    "name": "Shinko",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Japan",
    "confidence": 0.78,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "ATS",
    "name": "AT&S",
    "category": "substrate",
    "category_label": "載板 / PCB 供應商",
    "country": "Austria",
    "confidence": 0.96,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "TER",
    "name": "Teradyne",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "USA",
    "confidence": 0.93,
    "source": "factset",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "CHROMAATE",
    "name": "Chroma ATE",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "Taiwan",
    "confidence": 0.96,
    "source": "dnb",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "COHU",
    "name": "Cohu",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "USA",
    "confidence": 0.8,
    "source": "contify",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "XCERRA",
    "name": "Xcerra",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "USA",
    "confidence": 0.87,
    "source": "internal",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "FORMFACTOR",
    "name": "FormFactor",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "USA",
    "confidence": 0.8,
    "source": "snp",
    "edge_type": "SUPPLIES_TO"
  },
  {
    "fab_code": "KULICKESOFFA",
    "name": "Kulicke & Soffa",
    "category": "test_assembly",
    "category_label": "測試 / 封裝設備",
    "country": "Singapore",
    "confidence": 0.87,
    "source": "bloomberg",
    "edge_type": "SUPPLIES_TO"
  }
] as CompanyNode[];

export const mockTimeline: TimelineEvent[] = [
  {
    "source_fab_code": "KOKUSAI",
    "target_fab_code": "HITACHIHT",
    "edge_type": "FORMERLY_SUBSIDIARY_OF",
    "valid_from": "2018-01-01",
    "valid_until": "2023-10-01",
    "label": "Kokusai Electric 自日立高新分割獨立"
  },
  {
    "source_fab_code": "SPIL",
    "target_fab_code": "ASE",
    "edge_type": "SUBSIDIARY_OF",
    "valid_from": "2018-04-30",
    "valid_until": null,
    "label": "矽品精密併入日月光投控集團"
  },
  {
    "source_fab_code": "XLNX",
    "target_fab_code": "AMD",
    "edge_type": "SUBSIDIARY_OF",
    "valid_from": "2022-02-14",
    "valid_until": null,
    "label": "AMD 完成收購 Xilinx"
  },
  {
    "source_fab_code": "RESONAC",
    "target_fab_code": "RESONAC",
    "edge_type": "ALIAS_OF",
    "valid_from": "2023-01-01",
    "valid_until": null,
    "label": "Showa Denko 更名為 Resonac"
  },
  {
    "source_fab_code": "ONSEMI",
    "target_fab_code": "ONSEMI",
    "edge_type": "ALIAS_OF",
    "valid_from": "2023-01-01",
    "valid_until": null,
    "label": "ON Semiconductor 更名為 onsemi"
  }
] as TimelineEvent[];

export const mockDecisions: IdentityDecision[] = [
  {
    "id": "RES-00182",
    "category": "alias_resolution",
    "scenario": "查詢字串 \"Applied Materials, Inc.\" 之解析",
    "reasoning": "Name similarity 0.97、Domain match、既有 Company Master 別名紀錄三項證據一致",
    "outcome": "resolved_to_AMAT",
    "confidence": 0.97,
    "model": "tmic-ner-v3 / prompt v12"
  },
  {
    "id": "RES-00179",
    "category": "group_merge",
    "scenario": "\"矽品\" 與 \"SPIL\" 於日月光集團結構下的關係判定",
    "reasoning": "2018 年集團整併為公開事實,採 SUBSIDIARY_OF 而非 SAME_AS,保留原法人身份",
    "outcome": "建立 SPIL → ASE SUBSIDIARY_OF 邊",
    "confidence": 0.95,
    "model": "tmic-ner-v3 / prompt v12"
  },
  {
    "id": "RES-00171",
    "category": "rename_tracking",
    "scenario": "\"ON Semiconductor\" 於近期文件中的品牌指稱",
    "reasoning": "官方更名紀錄 + 官網 domain 未變,判定為同一法人之品牌更新",
    "outcome": "解析為 ONSEMI,保留舊名為 ALIAS_OF",
    "confidence": 0.99,
    "model": "tmic-ner-v3 / prompt v12"
  },
  {
    "id": "RES-00164",
    "category": "conflict_resolution",
    "scenario": "\"Kokusai Electric\" 母公司欄位多來源不一致",
    "reasoning": "Bloomberg 標示為獨立上市公司,部份內部舊資料仍標示為 Hitachi 子公司,採 most_recent 策略解決",
    "outcome": "採用獨立實體判定,舊關係標記為歷史關係",
    "confidence": 0.91,
    "model": "tmic-ner-v3 / prompt v11"
  },
  {
    "id": "RES-00158",
    "category": "acquisition_tracking",
    "scenario": "\"Xilinx\" 於 2022 年後文件中的識別",
    "reasoning": "公開收購案已完成,法人已併入 AMD,但產品線品牌持續使用 Xilinx",
    "outcome": "解析為 XLNX,新增 SUBSIDIARY_OF → AMD",
    "confidence": 0.98,
    "model": "tmic-ner-v3 / prompt v12"
  }
] as IdentityDecision[];

export const mockResolutionQueue: ResolutionCandidate[] = [
  {
    "id": 1,
    "fab_code_a": "SPIL",
    "fab_code_b": "ASE",
    "suggested_relation": "SUBSIDIARY_OF",
    "note": "2018 年集團整併,建議關係:SUBSIDIARY_OF(非 SAME_AS,兩者法人格仍各自存續)",
    "evidence": [
      "集團公告",
      "Bloomberg 股權結構",
      "D&B 母子公司紀錄"
    ],
    "status": "pending"
  },
  {
    "id": 2,
    "fab_code_a": "XLNX",
    "fab_code_b": "AMD",
    "suggested_relation": "SUBSIDIARY_OF",
    "note": "2022 年收購完成,建議關係:SUBSIDIARY_OF,品牌沿用 Xilinx",
    "evidence": [
      "公開收購文件",
      "FactSet 股權變更",
      "Domain 未變更"
    ],
    "status": "pending"
  },
  {
    "id": 3,
    "fab_code_a": "ONSEMI",
    "fab_code_b": "ONSEMI",
    "suggested_relation": "ALIAS_OF",
    "note": "品牌更名事件,建議關係:ALIAS_OF(舊名 \"ON Semiconductor\" 保留為歷史別名)",
    "evidence": [
      "官方更名公告",
      "官網 domain 一致",
      "Ticker 未變更"
    ],
    "status": "pending"
  },
  {
    "id": 4,
    "fab_code_a": "RESONAC",
    "fab_code_b": "RESONAC",
    "suggested_relation": "ALIAS_OF",
    "note": "品牌更名事件,建議關係:ALIAS_OF(舊名 \"Showa Denko\" 保留為歷史別名)",
    "evidence": [
      "官方更名公告",
      "Contify 新聞紀錄"
    ],
    "status": "pending"
  },
  {
    "id": 5,
    "fab_code_a": "KOKUSAI",
    "fab_code_b": "HITACHIHT",
    "suggested_relation": "FORMERLY_SUBSIDIARY_OF",
    "note": "歷史分割關係,建議關係:FORMERLY_SUBSIDIARY_OF(2018 年後已獨立)",
    "evidence": [
      "IPO 公開說明書",
      "股權結構歷史紀錄"
    ],
    "status": "pending"
  }
] as ResolutionCandidate[];

export const mockOntology: Ontology = {
  "node_types": [
    {
      "key": "LEGAL_ENTITY",
      "def": "具獨立法律人格的公司實體"
    },
    {
      "key": "SUBSIDIARY",
      "def": "受母公司控制之子公司"
    },
    {
      "key": "SITE",
      "def": "特定生產基地 / 廠區"
    },
    {
      "key": "BRAND",
      "def": "品牌或產品線名稱,可能橫跨多個法人"
    },
    {
      "key": "GROUP",
      "def": "集團層級的控股結構聚合"
    }
  ],
  "edge_types": [
    {
      "rel": "SAME_AS",
      "def": "兩個識別實際指向同一法人"
    },
    {
      "rel": "ALIAS_OF",
      "def": "名稱層級的別名關係"
    },
    {
      "rel": "SUBSIDIARY_OF",
      "def": "子公司歸屬母公司"
    },
    {
      "rel": "SUPPLIES_TO",
      "def": "供應鏈上游供貨關係"
    },
    {
      "rel": "CUSTOMER_OF",
      "def": "下游客戶關係"
    },
    {
      "rel": "COMPETITOR_OF",
      "def": "同業競爭關係"
    },
    {
      "rel": "IP_LICENSOR_OF",
      "def": "IP / 授權關係"
    },
    {
      "rel": "PACKAGES_FOR",
      "def": "封裝測試服務關係"
    }
  ],
  "rules": [
    {
      "id": "RULE-01",
      "text": "一個 LEGAL_ENTITY 只能有一個生效中的 GROUP 父節點"
    },
    {
      "id": "RULE-02",
      "text": "ALIAS_OF 關係必須附帶 confidence 與 source,不可為空"
    },
    {
      "id": "RULE-03",
      "text": "SAME_AS 合併前,兩端衝突欄位須先經過 Conflict Detection"
    },
    {
      "id": "RULE-04",
      "text": "internal identifier 類欄位預設 disclosure_policy = restricted"
    },
    {
      "id": "RULE-05",
      "text": "COMPETITOR_OF 為對稱關係,新增時自動建立反向邊"
    }
  ]
};
