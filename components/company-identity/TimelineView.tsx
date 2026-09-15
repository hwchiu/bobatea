// components/company-identity/TimelineView.tsx
"use client";

import { useEffect, useState } from "react";
import type { TimelineEvent } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function TimelineView() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => { companyIdentityApi.timeline().then(setEvents); }, []);

  const years = events.map((e) => new Date(e.valid_from).getFullYear());
  const minY = years.length ? Math.min(...years) - 1 : 2017;
  const maxY = years.length ? Math.max(...years) + 1 : 2024;
  const span = maxY - minY || 1;

  return (
    <div className="ci-pane">
      <h2>Temporal identity events</h2>
      <p className="hint">供應鏈實體隨時間發生的身份變化(合併、更名、分拆),對應 Semantica 的 bi-temporal 概念 —— 記錄「事實何時成立」而非只有「現在的狀態」。</p>

      <div className="ci-tl-wrap">
        <div className="ci-tl-track">
          <div className="ci-tl-line" />
          {events.map((e, i) => {
            const year = new Date(e.valid_from).getFullYear();
            const pct = ((year - minY) / span) * 100;
            return (
              <div key={`${e.source_fab_code}-${e.valid_from}`} className={`ci-tl-event ${i % 2 === 0 ? "above" : "below"}`} style={{ left: `${pct}%` }}>
                <div className="dot" />
                <div className="label"><span className="year">{year}</span>{e.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
