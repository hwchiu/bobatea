// app/settings/page.tsx — Settings：Company Config / System Parameter / Admin / Personal
// Schema-driven + RWD + i18n（中/英切換）。?scope= 支援 TopBar personal 選單深連結。
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Database, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { settingsApi, type ScopeSchema, type SettingsSchema } from "@/lib/settingsClient";
import { useI18n } from "@/lib/i18n";
import { ScopeEditor } from "@/components/settings/ScopeEditor";
import { AdminPanel } from "@/components/settings/AdminPanel";
import { PersonalPanel } from "@/components/settings/PersonalPanel";

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [schema, setSchema] = useState<SettingsSchema | null>(null);
  const [scope, setScope] = useState<string>("company_master");
  const [err, setErr] = useState("");

  useEffect(() => {
    settingsApi.schema().then(setSchema).catch(e => setErr(String(e)));
  }, []);

  // TopBar personal 選單深連結：?scope=personal_profile / personal_notifications / admin_scopes
  useEffect(() => {
    const q = params.get("scope");
    if (q) setScope(q);
  }, [params]);

  const scopeSchema: ScopeSchema | null = useMemo(() => {
    if (!schema) return null;
    if (scope === "company_master") return schema.company_master;
    if (scope === "system_params") return schema.system_params;
    return schema.providers[scope] ?? null;
  }, [schema, scope]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title={t("nav.settings")} />
      <div className="st-layout">
        <nav className="st-submenu">
          <TreeGroup icon={<Building2 size={13} />} label={t("st.company_config")}>
            <TreeItem id="company_master" label="Company Master" active={scope} onSelect={setScope}
                      badge={t("st.master_badge")} />
            {schema && Object.values(schema.providers).map(p => (
              <TreeItem key={p.id} id={p.id} label={p.label || p.id} active={scope} onSelect={setScope}
                        icon={<Database size={12} />} indent />
            ))}
          </TreeGroup>
          <TreeGroup icon={<SlidersHorizontal size={13} />} label={t("st.system_parameter")}>
            <TreeItem id="system_params" label={t("st.parameters")} active={scope} onSelect={setScope} />
          </TreeGroup>
          <TreeGroup icon={<ShieldCheck size={13} />} label={t("st.admin")}>
            <TreeItem id="admin_scopes" label={t("st.schema_manager")} active={scope} onSelect={setScope} />
          </TreeGroup>
          <TreeGroup icon={<UserRound size={13} />} label={t("st.personal")}>
            <TreeItem id="personal_profile" label={t("st.profile")} active={scope} onSelect={setScope} />
            <TreeItem id="personal_notifications" label={t("st.notifications")} active={scope} onSelect={setScope} />
          </TreeGroup>
        </nav>

        <main className="st-main">
          {err && <div className="pcs-issue error">{err}</div>}
          {scope === "admin_scopes" ? <AdminPanel />
            : scope === "personal_profile" ? <PersonalPanel tab="profile" />
            : scope === "personal_notifications" ? <PersonalPanel tab="notifications" />
            : scopeSchema ? <ScopeEditor key={scope} scope={scope} schema={scopeSchema}
                                         isProvider={!!schema?.providers[scope]} />
            : null}
        </main>
      </div>
    </div>
  );
}

function TreeGroup({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px",
                    fontSize: 11, letterSpacing: .4, textTransform: "uppercase",
                    color: "var(--text-muted)", whiteSpace: "nowrap" }}>
        {icon}{label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TreeItem({ id, label, active, onSelect, badge, icon, indent }: {
  id: string; label: string; active: string; onSelect: (id: string) => void;
  badge?: string; icon?: React.ReactNode; indent?: boolean;
}) {
  const isActive = active === id;
  return (
    <button onClick={() => onSelect(id)}
      style={{
        display: "flex", alignItems: "center", gap: 7, width: "100%",
        padding: "7px 10px", paddingLeft: indent ? 26 : 10, marginBottom: 2,
        background: isActive ? "var(--bg-hover)" : "transparent",
        border: "none", borderRadius: 6, cursor: "pointer",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 13, textAlign: "left", fontWeight: isActive ? 600 : 400,
        whiteSpace: "nowrap",
      }}>
      {icon}{label}
      {badge && <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 7px",
                               border: "1px solid var(--border)", borderRadius: 999,
                               color: "var(--text-muted)" }}>{badge}</span>}
    </button>
  );
}
