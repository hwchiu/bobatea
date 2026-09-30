"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PROVIDERS } from "@/lib/companyIntelligenceClient";
import type { CollectionEntry, CompanyProfile } from "@/lib/companyIntelligenceTypes";
import { collectionConfigStore } from "@/lib/collectionConfigStore";

const CATEGORIES = ["Company Profile", "Company Filings", "News & Signals"];

export default function CompanyForm({ profile, providerId, entry, onClose }: {
  profile?: CompanyProfile; providerId?: string; entry?: CollectionEntry; onClose: () => void;
}) {
  const { lang } = useI18n();
  const en = lang === "en";
  const [provider, setProvider] = useState(entry?.providerId ?? providerId ?? profile?.identities[0]?.providerId ?? "bloomberg");
  const [name, setName] = useState(entry?.companyName ?? profile?.name ?? "");
  const [identifier, setIdentifier] = useState(entry?.identifier ?? profile?.identities.find((i) => i.providerId === provider)?.primaryValue ?? "");
  const [category, setCategory] = useState(entry?.dataset ?? CATEGORIES[0]);
  const [extra, setExtra] = useState(entry?.parameters && Object.keys(entry.parameters).length ? JSON.stringify(entry.parameters, null, 2) : "");
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
    const data = {
      fabCode: entry?.fabCode ?? profile?.fabCode ?? `manual:${provider}:${id}`,
      companyName, providerId: provider, providerLabel: selected.label,
      identifier: id, dataset: category, parameters,
    };
    if (entry) {
      if (!collectionConfigStore.update(entry.id, data)) {
        setError(en ? "This company and provider are already configured." : "此公司與資料來源已設定。");
        return;
      }
      onClose();
    } else {
      collectionConfigStore.add(data);
      setSubmitted(true);
    }
  };

  return (
    <div className={`cs-overlay${submitted ? " cc-success-overlay" : ""}`} onClick={onClose}>
      <div className={submitted ? "cc-success-modal" : "cs-drawer"} role="dialog" aria-modal="true" aria-label={en ? (submitted ? "Company added" : entry ? "Edit Company" : "Add Company") : (submitted ? "公司已新增" : entry ? "編輯公司" : "新增公司")} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
        {submitted ? (
          <div role="status" className="cc-confirm">
            <h3>{en ? "Company added" : "公司已新增"}</h3>
            <p>{en ? `${name.trim()} was added. Run collection from its row in Collection Config; collection takes approximately 15 minutes after starting.` : `${name.trim()} 已新增。請在 Collection Config 該公司列執行蒐集；啟動後完成約需 15 分鐘。`}</p>
            <button autoFocus className="cs-configure-btn" onClick={onClose}>{en ? "OK" : "確定"}</button>
          </div>
        ) : (
          <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>{en ? (entry ? "Edit Company" : "Add Company") : (entry ? "編輯公司" : "新增公司")}</h2>
            <button type="button" className="cs-close" onClick={onClose} aria-label={en ? "Close" : "關閉"}><X size={18} /></button>
          </div>
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
              <button type="submit" className="cs-configure-btn">{en ? (entry ? "Save Changes" : "Add to Collection") : (entry ? "儲存修改" : "新增至蒐集清單")}</button>
            </div>
          </form>
          </>
        )}
      </div>
    </div>
  );
}
