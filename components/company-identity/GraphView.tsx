// components/company-identity/GraphView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CompanyNode } from "./CompanyNode";
import { CATEGORY_COLOR, type CompanyNode as CompanyNodeData, type SupplyChainCategory } from "@/lib/companyIdentityTypes";
import { companyIdentityApi } from "@/lib/companyIdentityClient";

const nodeTypes = { company: CompanyNode };

// ponytail: 用固定角度/半徑算出的放射狀佈局取代真正的力導向模擬 —— @xyflow/react
// 本身不含 force layout,拉一個新的 d3-force 依賴划不來(AGENTS.md「能不加就不加」)。
// 上限：類別內公司數一多會擠,目前 100 家規模看起來還可以,超過大概 300 家要換真的
// force-directed 佈局。
const CATEGORY_ORDER: SupplyChainCategory[] = [
  "foundry", "equipment", "materials", "eda_ip", "fabless", "osat", "substrate", "test_assembly",
];

function layout(companies: CompanyNodeData[]): { nodes: Node[]; edges: Edge[] } {
  const cx = 600, cy = 420;
  const hub = companies.find((c) => c.category === "hub");
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (hub) {
    nodes.push({ id: hub.fab_code, type: "company", position: { x: cx - 40, y: cy - 20 }, data: { company: hub } });
  }

  CATEGORY_ORDER.forEach((cat, catIndex) => {
    const members = companies.filter((c) => c.category === cat);
    const sectorCenter = catIndex * ((2 * Math.PI) / CATEGORY_ORDER.length) - Math.PI / 2;
    const sectorWidth = (2 * Math.PI) / CATEGORY_ORDER.length;
    const perRing = 6;
    members.forEach((company, i) => {
      const ring = Math.floor(i / perRing);
      const ringCount = Math.min(perRing, members.length - ring * perRing);
      const posInRing = i % perRing;
      const angleStep = sectorWidth / (ringCount + 1);
      const angle = sectorCenter - sectorWidth / 2 + angleStep * (posInRing + 1);
      const radius = 230 + ring * 130;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      nodes.push({ id: company.fab_code, type: "company", position: { x, y }, data: { company } });
      if (hub) {
        edges.push({
          id: `${company.fab_code}->tsmc`, source: company.fab_code, target: hub.fab_code,
          style: { stroke: CATEGORY_COLOR[cat], opacity: 0.45, strokeWidth: 1 },
        });
      }
    });
  });

  return { nodes, edges };
}

export default function GraphView({ onSelect }: { onSelect: (c: CompanyNodeData) => void }) {
  const [companies, setCompanies] = useState<CompanyNodeData[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => { companyIdentityApi.companies().then(setCompanies); }, []);

  const { nodes: allNodes, edges } = useMemo(() => layout(companies), [companies]);

  const nodes = useMemo(() => {
    if (!query.trim()) return allNodes;
    const q = query.trim().toLowerCase();
    return allNodes.map((n) => {
      const company = (n.data as { company: CompanyNodeData }).company;
      const match = company.name.toLowerCase().includes(q);
      return { ...n, style: { opacity: match ? 1 : 0.12 } };
    });
  }, [allNodes, query]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const company = (node.data as { company: CompanyNodeData }).company;
    onSelect(company);
  };

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    companies.forEach((c) => m.set(c.category, (m.get(c.category) ?? 0) + 1));
    return m;
  }, [companies]);

  return (
    <div className="ci-graph-wrap">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodeClick={onNodeClick} fitView proOptions={{ hideAttribution: true }} colorMode="dark"
        nodesDraggable nodesConnectable={false}
      >
        <Background color="var(--border)" gap={24} />
        <Controls />
      </ReactFlow>

      <div className="ci-graph-stats">
        <div>節點 <b>{companies.length}</b></div>
        <div>邊 <b>{Math.max(0, companies.length - 1)}</b></div>
        <div>中心 <b>TSMC</b></div>
      </div>

      <input
        value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋公司…"
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 5, width: 200,
          background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6,
          color: "var(--text-primary)", padding: "6px 10px", fontSize: 12, outline: "none",
        }}
      />

      <div className="ci-legend">
        {[{ key: "hub", label: "台積電 (Hub)" }, ...CATEGORY_ORDER.map((c) => ({ key: c, label: categoryLabel(c) }))].map(({ key, label }) => (
          <div key={key} className="row">
            <span className="sw" style={{ background: CATEGORY_COLOR[key as SupplyChainCategory] }} />
            {label} ({key === "hub" ? 1 : byCategory.get(key) ?? 0})
          </div>
        ))}
      </div>
    </div>
  );
}

function categoryLabel(cat: SupplyChainCategory): string {
  const labels: Record<SupplyChainCategory, string> = {
    hub: "台積電 (Hub)", foundry: "晶圓代工同業", equipment: "設備供應商",
    materials: "材料 / 化學品供應商", eda_ip: "EDA / IP 供應商", fabless: "Fabless 客戶",
    osat: "封測夥伴 (OSAT)", substrate: "載板 / PCB 供應商", test_assembly: "測試 / 封裝設備",
  };
  return labels[cat];
}
