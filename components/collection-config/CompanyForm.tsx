"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PROVIDERS } from "@/lib/companyIntelligenceClient";
import type { CompanyProfile } from "@/lib/companyIntelligenceTypes";
import { collectionConfigStore } from "@/lib/collectionConfigStore";

const CATEGORIES = ["Company Profile", "Company Filings", "News & Signals"];

export default function CompanyForm({ profile, providerId, onClose }: {
  profile?: CompanyProfile; providerId?: string; onClose: () => void;
}) {
  const { lang } = useI18n();
  const en = lang === "en";
  const [provider, setProvider] = useState(providerId ?? profile?.identities[0]?.providerId ?? "bloomberg");
  const [name, setName] = useState(profile?.name ?? "");
  const [identifier, setIdentifier] = useState(profile?.identities.find((i) => i.providerId === provider)?.primaryValue ?? "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [extra, setExtra] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const selected = PROVIDERS.find((p) => p.id === provider)!;

  const changeProvider = (next: string) => {
    setProvider(next);
    setIdentifier(profile?.identities.find((i) => i.providerId === next)?.primaryValue ?? "");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    let parameters: Record<string, string> = {};
    try {
      if (extra.trim()) {
        const value: unknown = JSON.parse(extra);
        if (!value || Array.isArray(value) || typeof value !== "object" ||
            Object.values(value).some((v) => typeof v !== "string")) throw new Error();
        parameters = value as Record<string, string>;
      }
    } catch {
      setError(en ? "Enter a JSON object with string values." : "請輸入值為文字的 JSON 物件。");
      return;
    }
    const id = identifier.trim();
    const companyName = name.trim();
    if (!id || !companyName) return;
    collectionConfigStore.add({
      fabCode: profile?.fabCode ?? `manual:${provider}:${id}`,
      companyName, providerId: provider, providerLabel: selected.label,
      identifier: id, dataset: category, parameters,
    });
    setSubmitted(true);
  };

  return (
    <div className="cs-overlay" onClick={onClose}>
      <div className="cs-drawer" role="dialog" aria-modal="true" aria-label={en ? "Add Company" : "新增公司"} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{en ? "Add Company" : "新增公司"}</h2>
          <button type="button" className="cs-close" onClick={onClose} aria-label={en ? "Close" : "關閉"}><X size={18} /></button>
        </div>
        {submitted ? (
          <div role="status" className="cc-confirm">
            <h3>{en ? "Company added" : "公司已新增"}</h3>
            <p>{en ? "Data collection takes approximately 15 minutes after it is started. Select the company and run collection from Collection Config." : "啟動資料蒐集後，完成約需 15 分鐘。請在 Collection Config 選取公司並執行蒐集。"}</p>
            <button className="cs-configure-btn" onClick={onClose}>{en ? "Done" : "完成"}</button>
          </div>
        ) : (
          <form className="cc-company-form" onSubmit={submit}>
            <p>{en ? "Enter provider details. Fields marked * are required." : "請填寫資料來源資訊；* 為必填欄位。"}</p>
            <label htmlFor="company-provider">{en ? "Data Provider *" : "資料來源 *"}</label>
            <select id="company-provider" value={provider} onChange={(e) => changeProvider(e.target.value)}>
              {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <label htmlFor="company-category">{en ? "Data Category *" : "資料類別 *"}</label>
            <select id="company-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c, i) => <option key={c} value={c}>{en ? c : ["公司概況", "公司公告", "新聞與動態"][i]}</option>)}
            </select>
            <label htmlFor="company-id">{en ? `Company ID (${selected.field}) *` : `公司識別碼 (${selected.field}) *`}</label>
            <input id="company-id" required maxLength={128} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={selected.field} />
            <label htmlFor="company-name">{en ? "Company Name *" : "公司名稱 *"}</label>
            <input id="company-name" required maxLength={256} value={name} onChange={(e) => setName(e.target.value)} placeholder={en ? "Enter company name" : "輸入公司名稱"} />
            <label htmlFor="company-extra">{en ? "Other Parameters (optional JSON)" : "其他參數（選填 JSON）"}</label>
            <textarea id="company-extra" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder='{"region":"APAC"}' rows={3} aria-describedby="company-extra-hint" />
            <small id="company-extra-hint">{en ? "Use a JSON object with text values." : "請使用值為文字的 JSON 物件。"}</small>
            {error && <p role="alert" className="cc-error">{error}</p>}
            <div className="cs-drawer-actions">
              <button type="button" className="cc-secondary-btn" onClick={onClose}>{en ? "Cancel" : "取消"}</button>
              <button type="submit" className="cs-configure-btn">{en ? "Add to Collection" : "新增至蒐集清單"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
