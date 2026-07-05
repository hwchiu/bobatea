// components/ai-crawler/StagePanel.tsx
"use client";

import type { Stage } from "@/lib/chainTypes"

interface Props {
  stage: Stage
  allIds: string[]
  upstreamIds: string[]
  onChange: (s: Stage) => void
  onDelete: () => void
}

function tryParse(text: string): Record<string, unknown> | undefined {
  try { return JSON.parse(text) } catch { return undefined }
}

export default function StagePanel({ stage, allIds, upstreamIds, onChange, onDelete }: Props) {
  const set = (patch: Partial<Stage>) => onChange({ ...stage, ...patch })

  return (
    <div>
      <h4 style={{ fontFamily: 'var(--mono)' }}>{stage.id}</h4>
      <p className="pcs-hint">可引用上游輸出：{upstreamIds.length
        ? upstreamIds.map(i => <code key={i} style={{ marginRight: 6 }}>{'{{ stages.' + i + '.output }}'}</code>)
        : '（無上游，為起始 stage）'}</p>

      <label>Stage 類型</label>
      <select value={stage.type} onChange={e => set({ type: e.target.value as Stage['type'] })}>
        <option value="ai_call">ai_call — 呼叫 AI Kernel（Perplexity）</option>
        <option value="transform">transform — 邏輯處理（無 LLM）</option>
        <option value="sink">sink — 落地至資料平台</option>
      </select>

      <label>依賴（depends_on）</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {allIds.filter(i => i !== stage.id).map(i => (
          <button key={i}
            className={stage.depends_on.includes(i) ? "pcs-btn primary" : "pcs-btn"}
            onClick={() => set({
              depends_on: stage.depends_on.includes(i)
                ? stage.depends_on.filter(d => d !== i)
                : [...stage.depends_on, i],
            })}>{i}</button>
        ))}
        {allIds.length <= 1 && <span className="pcs-hint">（尚無其他 stage）</span>}
      </div>

      {stage.type === 'ai_call' && (
        <>
          <label>System prompt（選填）</label>
          <textarea className="mono" rows={3} value={stage.prompt?.system ?? ''}
            onChange={e => set({ prompt: { user: stage.prompt?.user ?? '', system: e.target.value } })} />
          <label>User prompt（支援 Jinja：{'{{ stages.<id>.output.<path> }}'}）</label>
          <textarea className="mono" rows={6} value={stage.prompt?.user ?? ''}
            onChange={e => set({ prompt: { ...stage.prompt, user: e.target.value } })} />
          <label>Output Schema（JSON Schema，啟用 structured output）</label>
          <textarea className="mono" rows={6}
            defaultValue={stage.output_schema ? JSON.stringify(stage.output_schema, null, 2) : ''}
            onBlur={e => set({ output_schema: e.target.value.trim() ? tryParse(e.target.value) : undefined })} />
          <div className="pcs-row2">
            <div>
              <label>map_over（fan-out，選填）</label>
              <input className="mono" value={stage.map_over ?? ''} placeholder="{{ stages.x.output.items }}"
                onChange={e => set({ map_over: e.target.value || undefined })} />
            </div>
            <div>
              <label>schema 違規行為</label>
              <select value={stage.on_schema_violation ?? 'retry_with_repair'}
                onChange={e => set({ on_schema_violation: e.target.value as Stage['on_schema_violation'] })}>
                <option value="retry_with_repair">retry_with_repair</option>
                <option value="fail">fail</option>
                <option value="skip">skip</option>
              </select>
            </div>
          </div>
          <label>Model override（JSON，選填；如 {'{"model":"sonar","search_options":{"search_recency_filter":"day"}}'}）</label>
          <textarea className="mono" rows={2}
            defaultValue={stage.model_override ? JSON.stringify(stage.model_override) : ''}
            onBlur={e => set({ model_override: e.target.value.trim() ? tryParse(e.target.value) : undefined })} />
        </>
      )}

      {stage.type === 'transform' && (
        <>
          <label>Engine</label>
          <select value={stage.engine ?? 'python'} onChange={e => set({ engine: e.target.value as Stage['engine'] })}>
            <option value="python">python — 白名單內建函式庫</option>
            <option value="jsonpath">jsonpath — 路徑取值</option>
            <option value="jinja">jinja — 模板渲染</option>
          </select>
          <label>Spec（JSON）</label>
          <textarea className="mono" rows={8}
            defaultValue={stage.spec ? JSON.stringify(stage.spec, null, 2) : ''}
            placeholder={'{\n  "function": "builtin.dedup_by_similarity",\n  "args": {\n    "input": "{{ stages.search_news.output.articles | tojson }}",\n    "key_field": "title"\n  }\n}'}
            onBlur={e => set({ spec: e.target.value.trim() ? tryParse(e.target.value) : undefined })} />
          <p className="pcs-hint">內建函式：builtin.dedup_by_similarity / filter_by_field / merge_arrays / top_n</p>
        </>
      )}

      {stage.type === 'sink' && (
        <>
          <div className="pcs-row2">
            <div>
              <label>目標類型</label>
              <select value={stage.target?.kind ?? 'warehouse'}
                onChange={e => set({ target: { kind: e.target.value, connection: stage.target?.connection ?? '', table: stage.target?.table ?? '', mode: stage.target?.mode ?? 'append' } })}>
                <option value="warehouse">warehouse</option>
                <option value="lake">lake</option>
                <option value="webhook">webhook</option>
              </select>
            </div>
            <div>
              <label>寫入模式</label>
              <select value={stage.target?.mode ?? 'append'}
                onChange={e => set({ target: { ...(stage.target ?? { kind: 'warehouse', connection: '', table: '' }), mode: e.target.value } as Stage['target'] })}>
                <option value="append">append</option>
                <option value="overwrite">overwrite</option>
              </select>
            </div>
          </div>
          <div className="pcs-row2">
            <div>
              <label>Connection</label>
              <input className="mono" value={stage.target?.connection ?? ''}
                onChange={e => set({ target: { ...(stage.target ?? { kind: 'warehouse', table: '', mode: 'append' }), connection: e.target.value } as Stage['target'] })} />
            </div>
            <div>
              <label>Table / Path</label>
              <input className="mono" value={stage.target?.table ?? ''}
                onChange={e => set({ target: { ...(stage.target ?? { kind: 'warehouse', connection: '', mode: 'append' }), table: e.target.value } as Stage['target'] })} />
            </div>
          </div>
          <label>Payload（Jinja）</label>
          <input className="mono" value={stage.payload ?? ''} placeholder="{{ stages.generate_insight.output.insights | tojson }}"
            onChange={e => set({ payload: e.target.value })} />
        </>
      )}

      <div className="pcs-actions">
        <button className="pcs-btn danger" onClick={onDelete}>刪除 stage</button>
      </div>
    </div>
  )
}
