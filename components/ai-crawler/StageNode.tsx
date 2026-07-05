// components/ai-crawler/StageNode.tsx
"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Stage } from "@/lib/chainTypes";

export function StageNode({ data, selected }: NodeProps) {
  const stage = (data as { stage: Stage }).stage;
  const summary =
    stage.type === "ai_call" ? (stage.prompt?.user || "").slice(0, 60) || "(no prompt yet)"
    : stage.type === "transform" ? `${stage.engine ?? "?"} · ${(stage.spec as { function?: string })?.function ?? ""}`
    : `→ ${stage.target?.table || "(no target)"}`;

  return (
    <div className={`pcs-node t-${stage.type} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="head">
        <span className="dot" />
        <span>{stage.id}</span>
        <span style={{ marginLeft: "auto", opacity: 0.55, fontSize: 9 }}>{stage.type}</span>
      </div>
      <div className="nbody">
        {summary}
        {stage.map_over && <div style={{ color: "var(--accent)" }}>⤨ fan-out ×N</div>}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
