// lib/i18n.tsx — 輕量 i18n：zh-TW / en 雙語，segmented 切換（非下拉選單）
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "zh-TW" | "en";

const DICT: Record<string, { "zh-TW": string; en: string }> = {
  // Nav
  "nav.api_crawler": { "zh-TW": "API Crawler", en: "API Crawler" },
  "nav.ai_crawler": { "zh-TW": "AI Crawler", en: "AI Crawler" },
  "nav.jobs": { "zh-TW": "我的任務", en: "My Jobs" },
  "nav.settings": { "zh-TW": "設定", en: "Settings" },
  // Settings groups
  "st.company_config": { "zh-TW": "公司資料設定", en: "Company Config" },
  "st.system_parameter": { "zh-TW": "系統參數", en: "System Parameter" },
  "st.admin": { "zh-TW": "管理者", en: "Admin" },
  "st.personal": { "zh-TW": "個人", en: "Personal" },
  "st.master_badge": { "zh-TW": "主檔", en: "master" },
  "st.parameters": { "zh-TW": "參數", en: "Parameters" },
  "st.schema_manager": { "zh-TW": "類別與欄位管理", en: "Schema Manager" },
  "st.profile": { "zh-TW": "個人資料", en: "Profile" },
  "st.notifications": { "zh-TW": "通知", en: "Notifications" },
  // Toolbar / table
  "st.refresh": { "zh-TW": "重新整理", en: "Refresh" },
  "st.excel_template": { "zh-TW": "Excel 模板", en: "Excel Template" },
  "st.batch_upload": { "zh-TW": "批次上傳", en: "Batch Upload" },
  "st.add": { "zh-TW": "新增", en: "Add" },
  "st.edit": { "zh-TW": "編輯", en: "Edit" },
  "st.save": { "zh-TW": "儲存", en: "Save" },
  "st.cancel": { "zh-TW": "取消", en: "Cancel" },
  "st.delete": { "zh-TW": "刪除", en: "Delete" },
  "st.export_json": { "zh-TW": "匯出 JSON", en: "Export JSON" },
  "st.export_yaml": { "zh-TW": "匯出 YAML", en: "Export YAML" },
  "st.empty_hint": {
    "zh-TW": "尚無資料 — 點「新增」線上編輯，或下載 Excel 模板後批次上傳",
    en: "No data yet — click Add to edit inline, or download the Excel template for batch upload",
  },
  "st.fk_hint": { "zh-TW": "fab_code 需先存在於 Company Master", en: "fab_code must exist in Company Master first" },
  // Admin
  "st.scope_list": { "zh-TW": "資料類別（scope）", en: "Scopes" },
  "st.fields": { "zh-TW": "欄位定義", en: "Field Definitions" },
  "st.backend_link": { "zh-TW": "後端連結", en: "Backend Link" },
  "st.backend_rdb": { "zh-TW": "RDB Table（CRUD）", en: "RDB Table (CRUD)" },
  "st.backend_file": { "zh-TW": "檔案輸出", en: "File output" },
  "st.new_scope": { "zh-TW": "新增類別", en: "New Scope" },
  "st.builtin": { "zh-TW": "內建", en: "built-in" },
  "st.required": { "zh-TW": "必填", en: "required" },
  // Personal
  "st.display_name": { "zh-TW": "顯示名稱", en: "Display Name" },
  "st.email": { "zh-TW": "Email", en: "Email" },
  "st.role": { "zh-TW": "角色", en: "Role" },
  "st.timezone": { "zh-TW": "時區", en: "Timezone" },
  "st.notif_job_failure": { "zh-TW": "Job 失敗通知", en: "Job failure alerts" },
  "st.notif_job_success": { "zh-TW": "Job 成功通知", en: "Job success alerts" },
  "st.notif_batch_upload_result": { "zh-TW": "批次上傳結果", en: "Batch upload results" },
  "st.notif_weekly_digest": { "zh-TW": "每週摘要", en: "Weekly digest" },
  "st.notif_channel_email": { "zh-TW": "Email 頻道", en: "Email channel" },
  "st.notif_channel_slack": { "zh-TW": "Slack 頻道", en: "Slack channel" },
  "st.saved": { "zh-TW": "已儲存", en: "Saved" },
};

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }
const Ctx = createContext<I18nCtx>({ lang: "zh-TW", setLang: () => {}, t: k => k });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh-TW");
  useEffect(() => {
    const stored = localStorage.getItem("tmic-lang");
    if (stored === "en" || stored === "zh-TW") setLangState(stored);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("tmic-lang", l);
  }, []);
  const t = useCallback((key: string) => DICT[key]?.[lang] ?? key, [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** 中/英 segmented 切換（非下拉選單） */
export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label="language">
      <button className={lang === "zh-TW" ? "active" : ""} onClick={() => setLang("zh-TW")}>中</button>
      <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}
