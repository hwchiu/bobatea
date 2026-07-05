// components/api-crawler/CollectionsTree.tsx
"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from "lucide-react";
import type { CollectionNode, HttpMethod } from "@/lib/types";

interface CollectionsTreeProps {
  collections: CollectionNode[];
  activeRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
  onAdd: () => void;
}

function TreeNode({
  node,
  depth,
  activeRequestId,
  onSelectRequest,
}: {
  node: CollectionNode;
  depth: number;
  activeRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const indent = depth * 12 + 10;

  if (node.kind === "request") {
    const isActive = activeRequestId === node.requestId;
    return (
      <button
        onClick={() => onSelectRequest(node.requestId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: `5px 8px 5px ${indent + 18}px`,
          background: isActive ? "var(--bg-elevated)" : "transparent",
          borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--text-primary)",
        }}
      >
        <span
          className={`method-badge method-${node.method.toLowerCase()}`}
          style={{ fontSize: 9, padding: "1px 4px" }}
        >
          {node.method}
        </span>
        <span style={{
          fontSize: 12,
          color: isActive ? "var(--text-primary)" : "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {node.name}
        </span>
      </button>
    );
  }

  const isCollection = node.kind === "collection";
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: "100%",
          padding: `5px 8px 5px ${indent}px`,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: isCollection ? "var(--text-primary)" : "var(--text-muted)",
          fontWeight: isCollection ? 600 : 400,
          fontSize: 12,
        }}
      >
        {open
          ? <ChevronDown size={12} style={{ flexShrink: 0, color: "var(--text-dim)" }} />
          : <ChevronRight size={12} style={{ flexShrink: 0, color: "var(--text-dim)" }} />}
        {open
          ? <FolderOpen size={13} style={{ flexShrink: 0, color: isCollection ? "var(--accent)" : "var(--text-muted)" }} />
          : <Folder size={13} style={{ flexShrink: 0, color: isCollection ? "var(--accent)" : "var(--text-muted)" }} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
      </button>
      {open && node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          activeRequestId={activeRequestId}
          onSelectRequest={onSelectRequest}
        />
      ))}
    </div>
  );
}

export function CollectionsTree({ collections, activeRequestId, onSelectRequest, onAdd }: CollectionsTreeProps) {
  const [treeOpen, setTreeOpen] = useState(true);

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      {/* Header — click to collapse/expand tree */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setTreeOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "var(--text-muted)",
          }}
          title={treeOpen ? "Collapse" : "Expand"}
        >
          {treeOpen
            ? <ChevronDown size={12} style={{ flexShrink: 0 }} />
            : <ChevronRight size={12} style={{ flexShrink: 0 }} />}
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            Collections
          </span>
        </button>
        <button
          title="New Collection or Folder"
          onClick={onAdd}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tree — hidden when collapsed */}
      {treeOpen && <div style={{ flex: 1, overflowY: "auto" }}>
        {collections.map((col) => (
          <TreeNode
            key={col.id}
            node={col}
            depth={0}
            activeRequestId={activeRequestId}
            onSelectRequest={onSelectRequest}
          />
        ))}
      </div>}
    </div>
  );
}
