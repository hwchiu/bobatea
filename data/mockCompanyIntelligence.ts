// data/mockCompanyIntelligence.ts — offline fallback for the Company Intelligence workspace.
// Shape mirrors the real Settings schema (backend/app/routers/settings/defaults.py):
// one Company Master row per company, keyed by fab_code, joined against per-provider
// records (bloomberg / factset / contify / snp / dnb) on that same fab_code.
import type { Row } from "@/lib/settingsClient";

export const mockCompanyMaster: Row[] = [
  { fab_code: "TSMC", company_name: "Taiwan Semiconductor Manufacturing Co.", company_short_name: "TSMC", country: "Taiwan", region: "APAC", status: "active" },
  { fab_code: "ASML", company_name: "ASML Holding N.V.", company_short_name: "ASML", country: "Netherlands", region: "EMEA", status: "active" },
  { fab_code: "NVDA", company_name: "NVIDIA Corporation", company_short_name: "NVIDIA", country: "United States", region: "AMER", status: "active" },
  { fab_code: "AMAT", company_name: "Applied Materials, Inc.", company_short_name: "Applied Materials", country: "United States", region: "AMER", status: "active" },
  { fab_code: "SSNLE", company_name: "Samsung Electronics Co., Ltd.", company_short_name: "Samsung Electronics", country: "South Korea", region: "APAC", status: "active" },
  { fab_code: "HYNIX", company_name: "SK hynix Inc.", company_short_name: "SK hynix", country: "South Korea", region: "APAC", status: "active" },
];

export const mockProviderRecords: Record<string, Row[]> = {
  bloomberg: [
    { fab_code: "TSMC", bbg_id: "BBG000B1TP18", ticker: "2330", exchange_code: "TT", currency: "TWD", status: "active" },
    { fab_code: "ASML", bbg_id: "BBG000BPFHV6", ticker: "ASML", exchange_code: "NA", currency: "EUR", status: "active" },
    { fab_code: "NVDA", bbg_id: "BBG000BBJQV0", ticker: "NVDA", exchange_code: "US", currency: "USD", status: "active" },
    { fab_code: "AMAT", bbg_id: "BBG000BGN0N9", ticker: "AMAT", exchange_code: "US", currency: "USD", status: "active" },
    { fab_code: "SSNLE", bbg_id: "BBG000BJRPS5", ticker: "005930", exchange_code: "KS", currency: "KRW", status: "active" },
    { fab_code: "HYNIX", bbg_id: "BBG000BF46Y8", ticker: "000660", exchange_code: "KS", currency: "KRW", status: "active" },
  ],
  factset: [
    { fab_code: "TSMC", factset_entity_id: "05WCTS-E", fsym_id: "R98CV1-S", ticker_region: "2330-TW", status: "active" },
    { fab_code: "ASML", factset_entity_id: "000C3B-E", fsym_id: "PQMXC0-S", ticker_region: "ASML-NL", status: "active" },
    { fab_code: "NVDA", factset_entity_id: "05FS39-E", fsym_id: "JBFJ0R-S", ticker_region: "NVDA-US", status: "active" },
    { fab_code: "AMAT", factset_entity_id: "000BGN-E", fsym_id: "JR0GX8-S", ticker_region: "AMAT-US", status: "active" },
    { fab_code: "SSNLE", factset_entity_id: "05C882-E", fsym_id: "H4B5RG-S", ticker_region: "005930-KR", status: "active" },
    { fab_code: "HYNIX", factset_entity_id: "000QNQ-E", fsym_id: "Y6PLXV-S", ticker_region: "000660-KR", status: "active" },
  ],
  dnb: [
    { fab_code: "TSMC", duns_number: "652063688", global_ultimate_duns: "652063688", tradestyle_name: "TSMC", status: "active" },
    { fab_code: "ASML", duns_number: "400130124", global_ultimate_duns: "400130124", tradestyle_name: "ASML", status: "active" },
    { fab_code: "NVDA", duns_number: "148660972", global_ultimate_duns: "148660972", tradestyle_name: "NVIDIA", status: "active" },
    { fab_code: "AMAT", duns_number: "011760227", global_ultimate_duns: "011760227", tradestyle_name: "Applied Materials", status: "active" },
    { fab_code: "SSNLE", duns_number: "684144231", global_ultimate_duns: "684144231", tradestyle_name: "Samsung Electronics", status: "active" },
    { fab_code: "HYNIX", duns_number: "683929977", global_ultimate_duns: "683929977", tradestyle_name: "SK hynix", status: "active" },
  ],
  snp: [
    { fab_code: "TSMC", spciq_id: "IQ317450", gvkey: "111064", snp_ticker: "2330", status: "active" },
    { fab_code: "ASML", spciq_id: "IQ294805", gvkey: "108847", snp_ticker: "ASML", status: "active" },
    { fab_code: "NVDA", spciq_id: "IQ58497", gvkey: "117768", snp_ticker: "NVDA", status: "active" },
    { fab_code: "AMAT", spciq_id: "IQ287556", gvkey: "001766", snp_ticker: "AMAT", status: "active" },
    { fab_code: "SSNLE", spciq_id: "IQ307375", gvkey: "020840", snp_ticker: "005930", status: "active" },
    { fab_code: "HYNIX", spciq_id: "IQ667457", gvkey: "182122", snp_ticker: "000660", status: "active" },
  ],
  contify: [
    { fab_code: "TSMC", company_name: "TSMC", contify_company_id: "CFY-104822", watchlist_id: "WL-SEMI-01", topics: "Capacity Expansion,M&A", status: "active" },
    { fab_code: "ASML", company_name: "ASML", contify_company_id: "CFY-108831", watchlist_id: "WL-SEMI-01", topics: "Export Control,Lithography", status: "active" },
    { fab_code: "NVDA", company_name: "NVIDIA", contify_company_id: "CFY-110293", watchlist_id: "WL-SEMI-01", topics: "AI Chips,Product Launch", status: "active" },
    { fab_code: "AMAT", company_name: "Applied Materials", contify_company_id: "CFY-112004", watchlist_id: "WL-SEMI-01", topics: "Equipment,Guidance", status: "active" },
    { fab_code: "SSNLE", company_name: "Samsung Electronics", contify_company_id: "CFY-100112", watchlist_id: "WL-SEMI-01", topics: "Memory,Foundry", status: "active" },
    { fab_code: "HYNIX", company_name: "SK hynix", contify_company_id: "CFY-100788", watchlist_id: "WL-SEMI-01", topics: "Memory,HBM", status: "inactive" },
  ],
};
