"use client";

import { Suspense, useEffect, useState } from "react";
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
  const [tab, setTab] = useState<"profile" | "notifications">("profile");

  useEffect(() => {
    setTab(params.get("tab") === "notifications" ? "notifications" : "profile");
  }, [params]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title={t("st.personal")} />
      <div style={{ padding: 20 }}>
        <PersonalPanel tab={tab} />
      </div>
    </div>
  );
}
