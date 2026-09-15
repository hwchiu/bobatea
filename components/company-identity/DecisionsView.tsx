// components/company-identity/DecisionsView.tsx
"use client";

import { useEffect, useState } from "react";
import type { IdentityDecision } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function DecisionsView() {
  const [rows, setRows] = useState<IdentityDecision[]>([]);

  useEffect(() => { companyIdentityApi.decisions().then(setRows); }, []);

  return (
    <div className="ci-pane">
      <h2>Resolution decisions</h2>
      <p className="hint">每一次身份解析都是可追溯的 graph node,而非一次性的推論結果 —— 可查詢先例、追溯因果鏈、匯出稽核紀錄。</p>

      {rows.map((d) => (
        <div key={d.id} className="ci-dec">
          <div className="gauge"><div style={{ height: `${d.confidence * 100}%` }} /></div>
          <div>
            <div className="ci-dec-top"><span>{d.category}</span><span style={{ color: "var(--accent)", fontFamily: "ui-monospace, monospace" }}>{d.id}</span></div>
            <div className="ci-dec-scenario">{d.scenario}</div>
            <div className="ci-dec-reason">{d.reasoning}</div>
            <div className="ci-dec-foot">
              <div>結果 <b>{d.outcome}</b></div>
              <div>信心 <b>{d.confidence.toFixed(2)}</b></div>
              <div>模型 <b>{d.model}</b></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
