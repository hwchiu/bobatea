// components/company-identity/ResolutionQueueView.tsx
"use client";

import { useEffect, useState } from "react";
import type { ResolutionCandidate } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

export default function ResolutionQueueView({ nameFor }: { nameFor: (fabCode: string) => string }) {
  const [rows, setRows] = useState<ResolutionCandidate[]>([]);

  useEffect(() => { companyIdentityApi.resolutionQueue().then(setRows); }, []);

  const act = (id: number, status: ResolutionCandidate["status"]) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    companyIdentityApi.updateResolutionStatus(id, status).catch(() => {});
  };

  return (
    <div className="ci-pane">
      <h2>Entity resolution queue</h2>
      <p className="hint">系統偵測到的候選重複 / 別名 / 集團內關係,等待確認是否合併為同一 canonical 實體。以下取自供應鏈中真實發生過的公司整併與更名事件。</p>

      {rows.map((r) => (
        <div key={r.id} className="ci-res-row">
          <div className="ci-res-entity">{nameFor(r.fab_code_a)}<div className="meta">建議關係: {r.suggested_relation}</div></div>
          <div className="ci-res-tilde">≈</div>
          <div className="ci-res-entity">{nameFor(r.fab_code_b)}</div>
          <div className="ci-res-actions">
            {r.status === "pending" ? (
              <>
                <button className="pcs-btn primary" style={{ minWidth: 80, height: 26, fontSize: 11 }} onClick={() => act(r.id, "confirmed")}>確認關係</button>
                <button className="pcs-btn" style={{ minWidth: 80, height: 26, fontSize: 11 }} onClick={() => act(r.id, "rejected")}>忽略</button>
              </>
            ) : (
              <span className={`pcs-badge ${r.status === "confirmed" ? "published" : ""}`}>{r.status}</span>
            )}
          </div>
          <div className="ci-res-evidence">{r.evidence.map((e) => <span key={e} className="ci-chip">{e}</span>)}</div>
          <div className="ci-res-note">{r.note}</div>
        </div>
      ))}
    </div>
  );
}
