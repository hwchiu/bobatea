// components/company-identity/CompanyNode.tsx
"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATEGORY_COLOR, type CompanyNode as CompanyNodeData } from "@/lib/companyIdentityTypes";

export function CompanyNode({ data, selected }: NodeProps) {
  const company = (data as { company: CompanyNodeData }).company;
  const isHub = company.category === "hub";

  return (
    <div className={`ci-node ${isHub ? "hub" : ""} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div className="head">
        {!isHub && <span className="dot" style={{ background: CATEGORY_COLOR[company.category] }} />}
        <span className="name">{company.name}</span>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}
