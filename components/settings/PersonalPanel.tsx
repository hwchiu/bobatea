// components/settings/PersonalPanel.tsx — 個人設定：Profile / Notifications
"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { personalApi, type PersonalData } from "@/lib/settingsClient";
import { useI18n } from "@/lib/i18n";

const PROFILE_FIELDS = ["display_name", "email", "role", "timezone"] as const;
const NOTIF_KEYS = ["job_failure", "job_success", "batch_upload_result",
                    "weekly_digest", "channel_email", "channel_slack"] as const;

export function PersonalPanel({ tab }: { tab: "profile" | "notifications" }) {
  const { t } = useI18n();
  const [data, setData] = useState<PersonalData | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    personalApi.get().then(setData).catch(e => setMsg({ text: String(e), ok: false }));
  }, []);

  const notify = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000); };

  if (!data) return msg ? <div className="pcs-issue error">{msg.text}</div> : null;

  const saveProfile = async () => {
    try { await personalApi.put({ profile: data.profile }); notify(t("st.saved")); }
    catch (e) { notify(String(e), false); }
  };

  const toggleNotif = async (key: string) => {
    const next = { ...data.notifications, [key]: !data.notifications[key] };
    setData({ ...data, notifications: next });
    try { await personalApi.put({ notifications: { [key]: next[key] } }); }
    catch (e) { notify(String(e), false); }
  };

  return (
    <div>
      <div className="st-toolbar">
        <h2 className="st-title" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          {tab === "profile" ? t("st.profile") : t("st.notifications")}
        </h2>
      </div>
      {msg && <div className={`pcs-issue ${msg.ok ? "" : "error"}`}>{msg.text}</div>}

      {tab === "profile" ? (
        <div className="st-card">
          {PROFILE_FIELDS.map(k => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div className="pcs-hint" style={{ marginBottom: 4 }}>{t(`st.${k}`) !== `st.${k}` ? t(`st.${k}`) : k}</div>
              <input value={data.profile[k] ?? ""}
                     onChange={e => setData({ ...data, profile: { ...data.profile, [k]: e.target.value } })}
                     style={{ width: "100%", height: 32, background: "var(--bg-elevated)",
                              border: "1px solid var(--border)", borderRadius: 6,
                              color: "var(--text-primary)", padding: "0 10px", fontSize: 13 }} />
            </div>
          ))}
          <button className="pcs-btn primary" onClick={saveProfile}><Save size={13} />{t("st.save")}</button>
        </div>
      ) : (
        <div className="st-card">
          {NOTIF_KEYS.map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                                  padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13 }}>{t(`st.notif_${k}`)}</span>
              <button aria-label={k} className={`st-switch ${data.notifications[k] ? "on" : ""}`}
                      onClick={() => toggleNotif(k)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
