"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PersonalPanel } from "@/components/settings/PersonalPanel";
import { useI18n } from "@/lib/i18n";

export default function PersonalPage() {
  return (
    <Suspense>
      <PersonalInner />
    </Suspense>
  );
}

function PersonalInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const tab = params.get("tab") === "notifications" ? "notifications" : "profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title={t("st.personal")} />
      <div style={{ padding: 20 }}>
        <PersonalPanel tab={tab} />
      </div>
    </div>
  );
}
