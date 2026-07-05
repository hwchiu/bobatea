// components/ai-crawler/DryRunPanel.tsx
"use client";

import { useState } from "react"
import { studio } from "@/lib/studioClient"
import type { ChainSpec, Stage } from "@/lib/chainTypes"

export default function DryRunPanel({ chain, stage }: { chain: ChainSpec; stage: Stage | null }) {
  const [mockText, setMockText] = useState('{}')
  const [result, setResult] = useState<string>('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!stage) return
    let mock: Record<string, unknown> = {}
    try { mock = JSON.parse(mockText || '{}') } catch { setResult('mock input 不是合法 JSON'); return }
    setBusy(true)
    try {
      const r = await studio.dryRunStage(stage, chain.defaults, mock, chain.params, chain.chain_id)
      setResult(JSON.stringify(r, null, 2))
    } catch (e) {
      setResult(String(e))
    } finally { setBusy(false) }
  }

  if (!stage) return <p className="pcs-hint">在畫布上選取一個 stage 後即可單獨試跑。</p>

  return (
    <div>
      <h4>Dry-Run · <code>{stage.id}</code></h4>
      <p className="pcs-hint">
        未設定 PERPLEXITY_API_KEY 時，ai_call 回傳依 output_schema 生成的 mock 結果；
        transform 為真實邏輯執行；sink 僅預覽將寫入的內容，不落地。
      </p>
      <label>Mock 上游輸出（JSON：{'{ "<stage_id>": <output> }'}）</label>
      <textarea className="mono" rows={7} value={mockText} onChange={e => setMockText(e.target.value)}
        placeholder={'{\n  "search_news": { "articles": [ { "title": "TSMC A16 進度" } ] }\n}'} />
      <div className="pcs-actions">
        <button className="pcs-btn primary" onClick={run} disabled={busy}>{busy ? '執行中…' : '執行 Dry-Run'}</button>
      </div>
      {result && <><hr className="pcs-divider" /><pre className="pcs-pre">{result}</pre></>}
    </div>
  )
}
