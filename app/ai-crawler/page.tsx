// app/ai-crawler/page.tsx — Prompt Chain Studio
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow, Background, Controls,
  type Node, type Edge, type Connection, type NodeChange, applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { StageNode } from "@/components/ai-crawler/StageNode";
import StagePanel from "@/components/ai-crawler/StagePanel";
import DryRunPanel from "@/components/ai-crawler/DryRunPanel";
import { studio } from "@/lib/studioClient";
import type { ChainSpec, Stage, ValidationIssue } from "@/lib/chainTypes";
import { emptyChain } from "@/lib/chainTypes";

const nodeTypes = { stage: StageNode };
type Tab = "stage" | "chain" | "dag" | "dryrun";

let counter = 1;

export default function AiCrawlerPage() {
  const [editing, setEditing] = useState<string | null>(null);
  return editing
    ? <ChainEditor chainId={editing} key={editing} onBack={() => setEditing(null)} />
    : <ChainListView onOpen={setEditing} />;
}

// ── 列表 ─────────────────────────────────────────────────

function ChainListView({ onOpen }: { onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<{ connector_id: string; description: string; status: string }[]>([]);
  const [newId, setNewId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    studio.listConnectors("prompt_chain").then(setRows).catch(e => setErr(String(e)));
  }, []);

  const create = async () => {
    const id = newId.trim();
    if (!/^[a-z0-9_]+$/.test(id)) { setErr("chain_id 僅允許小寫英數與底線"); return; }
    try { await studio.saveChain(emptyChain(id)); onOpen(id); }
    catch (e) { setErr(String(e)); }
  };

  return (
    <div className="pcs-list">
      <h1 style={{ fontSize: 18, margin: "0 0 4px", color: "var(--text-primary)" }}>Prompt Chains</h1>
      <p className="pcs-hint" style={{ marginBottom: 18 }}>
        多階段 AI 情報鏈：編排 stage 依賴，生成 Airflow DAG 排程執行
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input className="mono" style={{ maxWidth: 300, background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 5, padding: "6px 9px", fontSize: 12.5 }}
          placeholder="new_chain_id" value={newId}
          onChange={e => setNewId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && create()} />
        <button className="pcs-btn primary" onClick={create}>Create chain</button>
      </div>
      {err && <div className="pcs-issue error">{err}</div>}
      <div className="pcs-grid">
        {rows.map(r => (
          <div key={r.connector_id} className="pcs-card" onClick={() => onOpen(r.connector_id)}>
            <h3>{r.connector_id}</h3>
            <p>{r.description || "(no description)"}</p>
            <span className={`pcs-badge ${r.status}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 編輯器 ───────────────────────────────────────────────

function ChainEditor({ chainId, onBack }: { chainId: string; onBack: () => void }) {
  const [chain, setChain] = useState<ChainSpec>(emptyChain(chainId));
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("chain");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [dagText, setDagText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    studio.getConnector(chainId).then(r => setChain(r.spec)).catch(() => {});
  }, [chainId]);

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  // React Flow v12 節點必須以受控 state 保存（含 measured dimensions），
  // 否則 dimensions change 被丟棄 → 節點永遠 visibility:hidden。
  const [nodes, setNodes] = useState<Node[]>([]);

  // stages 結構變動時同步 nodes：保留既有節點物件（含量測資訊），只增刪與更新 data
  useEffect(() => {
    setNodes(prev => chain.stages.map((s, i) => {
      const existing = prev.find(n => n.id === s.id);
      const position = existing?.position ?? { x: s.ui?.x ?? 60 + i * 230, y: s.ui?.y ?? 110 };
      return existing
        ? { ...existing, position, data: { stage: s } }
        : { id: s.id, type: "stage", position, data: { stage: s } };
    }));
  }, [chain.stages]);

  const edges: Edge[] = useMemo(() => chain.stages.flatMap(s =>
    s.depends_on.map(d => ({ id: `${d}->${s.id}`, source: d, target: s.id, animated: true }))), [chain.stages]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // 完整套用所有 change（包含 dimensions / select / position），節點才會完成量測並顯示
    setNodes(nds => {
      const next = applyNodeChanges(changes, nds);
      if (changes.some(ch => ch.type === "position" && !ch.dragging)) {
        setChain(c => ({
          ...c,
          stages: c.stages.map(s => {
            const n = next.find(m => m.id === s.id);
            return n ? { ...s, ui: { x: n.position.x, y: n.position.y } } : s;
          }),
        }));
      }
      return next;
    });
    const sel = changes.find(ch => ch.type === "select" && ch.selected);
    if (sel && "id" in sel) { setSelected(sel.id as string); setTab("stage"); }
  }, []);

  const onConnect = useCallback((conn: Connection) => {
    setChain(c => ({
      ...c,
      stages: c.stages.map(s => s.id === conn.target && !s.depends_on.includes(conn.source!)
        ? { ...s, depends_on: [...s.depends_on, conn.source!] } : s),
    }));
  }, []);

  const onEdgesDelete = useCallback((deleted: Edge[]) => {
    setChain(c => ({
      ...c,
      stages: c.stages.map(s => {
        const rm = deleted.filter(e => e.target === s.id).map(e => e.source);
        return rm.length ? { ...s, depends_on: s.depends_on.filter(d => !rm.includes(d)) } : s;
      }),
    }));
  }, []);

  const addStage = (type: Stage["type"]) => {
    const id = `${type}_${counter++}`;
    const base: Stage = { id, type, depends_on: [], ui: { x: 80 + chain.stages.length * 50, y: 90 + chain.stages.length * 55 } };
    if (type === "ai_call") base.prompt = { user: "" };
    if (type === "transform") { base.engine = "python"; base.spec = {}; }
    if (type === "sink") base.target = { kind: "warehouse", connection: "", table: "", mode: "append" };
    setChain(c => ({ ...c, stages: [...c.stages, base] }));
    setSelected(id); setTab("stage");
  };

  const updateStage = (updated: Stage) => {
    setChain(c => ({ ...c, stages: c.stages.map(s => (s.id === (selected ?? "") ? updated : s)) }));
    if (updated.id !== selected) setSelected(updated.id);
  };

  const deleteStage = () => {
    setChain(c => ({
      ...c,
      stages: c.stages.filter(s => s.id !== selected)
        .map(s => ({ ...s, depends_on: s.depends_on.filter(d => d !== selected) })),
    }));
    setSelected(null); setTab("chain");
  };

  const save = () => studio.saveChain(chain).then(() => notify("Saved")).catch(e => notify(String(e)));
  const validate = () => studio.validateChain(chain).then(r => {
    setIssues(r.issues); setTab("chain");
    notify(r.valid ? "Valid ✓" : `${r.issues.filter(i => i.level === "error").length} error(s)`);
  }).catch(e => notify(String(e)));
  const showDag = () => {
    setTab("dag");
    studio.chainDag(chain).then(r => setDagText(`# ${r.filename}\n${r.dag_code}`)).catch(e => setDagText(String(e)));
  };
  const downloadDag = () => studio.downloadChainDag(chain)
    .then(() => notify(`DAG downloaded: prompt_chain__${chain.chain_id}.py`))
    .catch(e => notify(String(e)));
  const publish = () => studio.publishChain(chain).then(() => notify("Published")).catch(e => notify(String(e)));

  const selectedStage = chain.stages.find(s => s.id === selected) ?? null;
  const upstreamIds = selectedStage ? ancestorsOf(chain, selectedStage.id) : [];

  return (
    <div className="pcs-editor">
      <div className="pcs-canvas">
        <div className="pcs-toolbar">
          <button className="pcs-btn" onClick={onBack}>←</button>
          <button className="pcs-btn" onClick={() => addStage("ai_call")}>＋ ai_call</button>
          <button className="pcs-btn" onClick={() => addStage("transform")}>＋ transform</button>
          <button className="pcs-btn" onClick={() => addStage("sink")}>＋ sink</button>
        </div>
        <ReactFlow
          nodes={nodes} edges={edges} nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} onConnect={onConnect} onEdgesDelete={onEdgesDelete}
          fitView proOptions={{ hideAttribution: true }} colorMode="dark">
          <Background color="var(--border)" gap={22} />
          <Controls />
        </ReactFlow>
      </div>

      <aside className="pcs-side">
        <div className="pcs-tabs">
          <button className={tab === "stage" ? "active" : ""} onClick={() => setTab("stage")}>Stage</button>
          <button className={tab === "chain" ? "active" : ""} onClick={() => setTab("chain")}>Chain</button>
          <button className={tab === "dag" ? "active" : ""} onClick={showDag}>DAG</button>
          <button className={tab === "dryrun" ? "active" : ""} onClick={() => setTab("dryrun")}>Dry-Run</button>
        </div>

        <div className="pcs-body">
          {tab === "stage" && (selectedStage
            ? <StagePanel stage={selectedStage} allIds={chain.stages.map(s => s.id)}
                upstreamIds={upstreamIds} onChange={updateStage} onDelete={deleteStage} />
            : <p className="pcs-hint">Select a stage on the canvas, or add one from the toolbar. Drag a node&apos;s right handle to another node&apos;s left handle to create a dependency.</p>)}

          {tab === "chain" && (
            <div>
              <label>Description</label>
              <input value={chain.description} onChange={e => setChain({ ...chain, description: e.target.value })} />
              <div className="pcs-row2">
                <div>
                  <label>Schedule (cron)</label>
                  <input className="mono" value={chain.schedule.cron}
                    onChange={e => setChain({ ...chain, schedule: { ...chain.schedule, cron: e.target.value } })} />
                </div>
                <div>
                  <label>Owner</label>
                  <input value={chain.owner} onChange={e => setChain({ ...chain, owner: e.target.value })} />
                </div>
              </div>
              <div className="pcs-row2">
                <div>
                  <label>Default model</label>
                  <select value={chain.defaults.model}
                    onChange={e => setChain({ ...chain, defaults: { ...chain.defaults, model: e.target.value } })}>
                    <option value="sonar-pro">sonar-pro (web search)</option>
                    <option value="sonar">sonar</option>
                  </select>
                </div>
                <div>
                  <label>Cost budget / run (USD)</label>
                  <input type="number" step="0.1" value={chain.governance.cost_budget_usd_per_run}
                    onChange={e => setChain({ ...chain, governance: { ...chain.governance, cost_budget_usd_per_run: Number(e.target.value) } })} />
                </div>
              </div>
              <label>Params (JSON — use {"{{ params.<key> }}"} in prompts)</label>
              <textarea className="mono" rows={3}
                defaultValue={JSON.stringify(chain.params)}
                onBlur={e => { try { setChain({ ...chain, params: JSON.parse(e.target.value || "{}") }); } catch { notify("params is not valid JSON"); } }} />
              {issues.length > 0 && <div style={{ marginTop: 12 }}>
                {issues.map((i, k) => (
                  <div key={k} className={`pcs-issue ${i.level}`}>
                    {i.stage_id && <span className="mono" style={{ color: "var(--text-muted)" }}>[{i.stage_id}]</span>}
                    <span>{i.message}</span>
                  </div>))}
              </div>}
            </div>
          )}

          {tab === "dag" && <pre className="pcs-pre">{dagText || "Generating…"}</pre>}
          {tab === "dryrun" && <DryRunPanel chain={chain} stage={selectedStage} />}
        </div>

        <div className="pcs-footer">
          <button className="pcs-btn" onClick={save}>Save</button>
          <button className="pcs-btn" onClick={validate}>Validate</button>
          <button className="pcs-btn" onClick={downloadDag}>↓ DAG</button>
          <button className="pcs-btn primary" onClick={publish} style={{ marginLeft: "auto" }}>Publish</button>
        </div>
      </aside>

      {toast && <div className="pcs-toast">{toast}</div>}
    </div>
  );
}

function ancestorsOf(chain: ChainSpec, id: string): string[] {
  const parents = new Map(chain.stages.map(s => [s.id, s.depends_on]));
  const acc = new Set<string>();
  const walk = (sid: string) => {
    for (const p of parents.get(sid) ?? []) {
      if (!acc.has(p)) { acc.add(p); walk(p); }
    }
  };
  walk(id);
  return [...acc];
}
