# New Collection Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "New Collection/Folder" popup to the API Crawler that lets users create containers in the Collections tree, auto-creates a blank named Request inside, opens it in the editor, and persists everything to localStorage.

**Architecture:** A `useCollections` hook manages merged static+user collection state with localStorage persistence. A `NewItemModal` component handles the single-screen creation form. `CollectionsTree` and `page.tsx` are updated to consume the hook and wire the modal.

**Tech Stack:** Next.js 16 (static export), React, TypeScript, lucide-react, localStorage

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `hooks/useCollections.ts` | **Create** | State management, localStorage sync, CRUD operations |
| `components/api-crawler/NewItemModal.tsx` | **Create** | Modal UI for creating Collections/Folders with initial request |
| `components/api-crawler/CollectionsTree.tsx` | **Modify** | Accept `collections`/`onAdd` props instead of hardcoded data |
| `app/api-crawler/page.tsx` | **Modify** | Use hook, render modal, wire Save to `saveRequest` |

---

## Task 1: Create `useCollections` hook

**Files:**
- Create: `hooks/useCollections.ts`

- [ ] **Step 1: Create the hooks directory and file**

```bash
mkdir -p /tmp/eggroll-check/hooks
```

- [ ] **Step 2: Write `hooks/useCollections.ts`**

```ts
// hooks/useCollections.ts
"use client";

import { useState, useCallback } from "react";
import type { CollectionNode, MockRequest, RequestConfig, DagConfig } from "@/lib/types";
import { mockCollections, mockRequests } from "@/data/mockCollections";

const LS_COLLECTIONS = "tmic-collections";
const LS_REQUESTS    = "tmic-requests";

function loadUserCollections(): CollectionNode[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_COLLECTIONS) ?? "[]"); }
  catch { return []; }
}

function loadUserRequests(): Record<string, MockRequest> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_REQUESTS) ?? "{}"); }
  catch { return {}; }
}

function saveUserCollections(nodes: CollectionNode[]) {
  localStorage.setItem(LS_COLLECTIONS, JSON.stringify(nodes));
}

function saveUserRequests(reqs: Record<string, MockRequest>) {
  localStorage.setItem(LS_REQUESTS, JSON.stringify(reqs));
}

function makeBlankRequest(id: string, name: string): MockRequest {
  return {
    config: {
      id,
      name,
      method: "GET",
      url: "",
      queryParams: [],
      pathParams: [],
      headers: [],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    mockResponse: { status: 0, statusText: "", headers: {}, body: null, durationMs: 0 },
    schema: [],
    dagConfig: {
      crawlerName: "",
      schedule: "0 6 * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/",
      tags: [],
      retries: 3,
      timeoutSeconds: 60,
    },
  };
}

export function useCollections() {
  const [userCollections, setUserCollections] = useState<CollectionNode[]>(loadUserCollections);
  const [userRequests, setUserRequests] = useState<Record<string, MockRequest>>(loadUserRequests);

  const collections: CollectionNode[] = [...mockCollections, ...userCollections];
  const requests: Record<string, MockRequest> = { ...mockRequests, ...userRequests };

  const addCollection = useCallback((name: string): string => {
    const id = `col-${Date.now()}`;
    const node: CollectionNode = { kind: "collection", id, name, children: [] };
    setUserCollections((prev) => {
      const next = [...prev, node];
      saveUserCollections(next);
      return next;
    });
    return id;
  }, []);

  const addFolder = useCallback((collectionId: string, name: string): string => {
    const id = `folder-${Date.now()}`;
    const folderNode: CollectionNode = { kind: "folder", id, name, children: [] };
    setUserCollections((prev) => {
      const next = prev.map((col) => {
        if (col.kind !== "collection" || col.id !== collectionId) return col;
        return { ...col, children: [...col.children, folderNode] };
      });
      saveUserCollections(next);
      return next;
    });
    return id;
  }, []);

  const addRequest = useCallback((parentId: string, requestName: string): string => {
    const requestId = `req-${Date.now()}`;
    const treeNode: CollectionNode = {
      kind: "request",
      id: `node-${Date.now()}`,
      name: requestName,
      method: "GET",
      requestId,
    };
    const blank = makeBlankRequest(requestId, requestName);

    // Add request node to the correct parent (collection or folder) in userCollections
    setUserCollections((prev) => {
      function insertInto(nodes: CollectionNode[]): CollectionNode[] {
        return nodes.map((n) => {
          if (n.id === parentId && (n.kind === "collection" || n.kind === "folder")) {
            return { ...n, children: [...n.children, treeNode] };
          }
          if (n.kind === "collection" || n.kind === "folder") {
            return { ...n, children: insertInto(n.children) };
          }
          return n;
        });
      }
      const next = insertInto(prev);
      saveUserCollections(next);
      return next;
    });

    setUserRequests((prev) => {
      const next = { ...prev, [requestId]: blank };
      saveUserRequests(next);
      return next;
    });

    return requestId;
  }, []);

  const saveRequest = useCallback((requestId: string, data: Partial<MockRequest>) => {
    setUserRequests((prev) => {
      const existing = prev[requestId] ?? requests[requestId];
      if (!existing) return prev;
      const next = { ...prev, [requestId]: { ...existing, ...data } };
      saveUserRequests(next);
      return next;
    });
  }, [requests]);

  return { collections, requests, addCollection, addFolder, addRequest, saveRequest };
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /tmp/eggroll-check && npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
cd /tmp/eggroll-check && git add hooks/useCollections.ts && git commit -m "feat: add useCollections hook with localStorage persistence"
```

---

## Task 2: Create `NewItemModal` component

**Files:**
- Create: `components/api-crawler/NewItemModal.tsx`

- [ ] **Step 1: Write `components/api-crawler/NewItemModal.tsx`**

```tsx
// components/api-crawler/NewItemModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Folder, ChevronRight, ChevronDown } from "lucide-react";
import type { CollectionNode } from "@/lib/types";

interface NewItemModalProps {
  collections: CollectionNode[];
  onClose: () => void;
  onCreate: (
    type: "collection" | "folder",
    parentId: string | null,
    containerName: string,
    requestName: string
  ) => void;
}

export function NewItemModal({ collections, onClose, onCreate }: NewItemModalProps) {
  const [type, setType] = useState<"collection" | "folder">("collection");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [containerName, setContainerName] = useState("");
  const [requestName, setRequestName] = useState("New Request");
  const containerInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Auto-focus container name input when modal opens
  useEffect(() => {
    setTimeout(() => containerInputRef.current?.focus(), 50);
  }, []);

  const topLevelCollections = collections.filter((n) => n.kind === "collection");

  const canCreate =
    containerName.trim().length > 0 &&
    (type === "collection" || selectedParentId !== null);

  function handleCreate() {
    if (!canCreate) return;
    onCreate(type, selectedParentId, containerName.trim(), requestName.trim() || "New Request");
    onClose();
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {type === "collection" ? "New Collection" : "New Folder"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Type selector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Type
            </label>
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {(["collection", "folder"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setSelectedParentId(null); }}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    background: type === t ? "var(--accent)" : "transparent",
                    border: "none",
                    color: type === t ? "#fff" : "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: type === t ? 600 : 400,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "background 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Parent picker (folders only) */}
          {type === "folder" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
                Parent Collection <span style={{ color: "#e06060" }}>*</span>
              </label>
              <div style={{
                border: "1px solid var(--border)",
                borderRadius: 6,
                maxHeight: 160,
                overflowY: "auto",
                background: "var(--bg-surface)",
              }}>
                {topLevelCollections.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)" }}>
                    No collections yet. Create a Collection first.
                  </div>
                ) : topLevelCollections.map((col) => (
                  <ParentPickerRow
                    key={col.id}
                    node={col}
                    selectedId={selectedParentId}
                    onSelect={setSelectedParentId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Container name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              {type === "collection" ? "Collection Name" : "Folder Name"} <span style={{ color: "#e06060" }}>*</span>
            </label>
            <input
              ref={containerInputRef}
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder={type === "collection" ? "e.g. Financial Data API" : "e.g. Equity Endpoints"}
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Request name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              Initial Request Name
            </label>
            <input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="New Request"
              style={{
                width: "100%",
                padding: "7px 10px",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            style={{
              padding: "7px 16px",
              background: canCreate ? "var(--accent)" : "var(--bg-surface)",
              border: "none",
              borderRadius: 6,
              color: canCreate ? "#fff" : "var(--text-dim)",
              fontSize: 13,
              fontWeight: 600,
              cursor: canCreate ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Parent Picker Row ────────────────────────────────────────────────────────

function ParentPickerRow({
  node,
  selectedId,
  onSelect,
  depth = 0,
}: {
  node: CollectionNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(true);
  if (node.kind === "request") return null;

  const isSelected = selectedId === node.id;
  const indent = depth * 14 + 10;

  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: `6px 10px 6px ${indent}px`,
          background: isSelected ? "rgba(91,133,232,0.15)" : "transparent",
          border: isSelected ? "1px solid var(--accent)" : "1px solid transparent",
          cursor: "pointer",
          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 12,
          textAlign: "left",
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-dim)", display: "flex" }}
        >
          {node.children.filter(c => c.kind !== "request").length > 0
            ? (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />)
            : <span style={{ width: 11 }} />}
        </button>
        <Folder size={12} color={isSelected ? "var(--accent)" : "var(--text-muted)"} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </span>
      </button>
      {open && node.children.map((child) => (
        child.kind !== "request" && (
          <ParentPickerRow
            key={child.id}
            node={child}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        )
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /tmp/eggroll-check && npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
cd /tmp/eggroll-check && git add components/api-crawler/NewItemModal.tsx && git commit -m "feat: add NewItemModal component for creating Collections and Folders"
```

---

## Task 3: Update `CollectionsTree` to accept props

**Files:**
- Modify: `components/api-crawler/CollectionsTree.tsx`

- [ ] **Step 1: Replace the file content**

Replace the entire `CollectionsTree.tsx` with:

```tsx
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
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Collections
        </span>
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

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {collections.map((col) => (
          <TreeNode
            key={col.id}
            node={col}
            depth={0}
            activeRequestId={activeRequestId}
            onSelectRequest={onSelectRequest}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /tmp/eggroll-check && npm run build 2>&1 | tail -20
```
Expected: `✓ Compiled successfully` (may warn that `page.tsx` still passes old props — that's fixed in Task 4)

- [ ] **Step 3: Commit**

```bash
cd /tmp/eggroll-check && git add components/api-crawler/CollectionsTree.tsx && git commit -m "feat: CollectionsTree accepts collections prop and onAdd callback"
```

---

## Task 4: Update `page.tsx` to wire everything together

**Files:**
- Modify: `app/api-crawler/page.tsx`

- [ ] **Step 1: Replace the full file content**

```tsx
// app/api-crawler/page.tsx
"use client";

import { useState, useCallback } from "react";
import type { RequestConfig, ApiResponse, SchemaField, DagConfig, CollectionNode } from "@/lib/types";
import { ActivityBar } from "@/components/api-crawler/ActivityBar";
import { CollectionsTree } from "@/components/api-crawler/CollectionsTree";
import { RequestBreadcrumb } from "@/components/api-crawler/RequestBreadcrumb";
import { EndpointBar } from "@/components/api-crawler/EndpointBar";
import { RequestTabs } from "@/components/api-crawler/RequestTabs";
import { ResponsePanel } from "@/components/api-crawler/ResponsePanel";
import { RightIconBar } from "@/components/api-crawler/RightIconBar";
import { SchemaPanel } from "@/components/api-crawler/SchemaPanel";
import { DagPanel } from "@/components/api-crawler/DagPanel";
import { NewItemModal } from "@/components/api-crawler/NewItemModal";
import { executeRequest } from "@/lib/apiClient";
import { inferSchema } from "@/lib/schemaInfer";
import { useCollections } from "@/hooks/useCollections";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_REQUEST: RequestConfig = {
  id: "new",
  name: "Untitled Request",
  method: "GET",
  url: "",
  queryParams: [],
  pathParams: [],
  headers: [],
  bodyType: "none",
  bodyJson: "",
  auth: { type: "none" },
};

const DEFAULT_DAG: DagConfig = {
  crawlerName: "",
  schedule: "0 6 * * *",
  outputFormat: "json",
  outputPath: "s3://tmic-data/",
  tags: [],
  retries: 2,
  timeoutSeconds: 120,
};

type ActivitySection = "collections" | "environments" | "history";
type RightPanel = "schema" | "dag";

/** Walk a collections tree to find breadcrumb info for a requestId */
function findBreadcrumb(
  nodes: CollectionNode[],
  requestId: string
): { collection: string; folder: string } {
  for (const col of nodes) {
    if (col.kind !== "collection") continue;
    for (const child of col.children) {
      if (child.kind === "folder") {
        for (const leaf of child.children) {
          if (leaf.kind === "request" && leaf.requestId === requestId) {
            return { collection: col.name, folder: child.name };
          }
        }
      }
      // Request directly inside collection (no folder)
      if (child.kind === "request" && child.requestId === requestId) {
        return { collection: col.name, folder: "—" };
      }
    }
  }
  return { collection: "Collections", folder: "—" };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApiCrawlerPage() {
  const { collections, requests, addCollection, addFolder, addRequest, saveRequest } = useCollections();

  const [request, setRequest] = useState<RequestConfig>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [dagConfig, setDagConfig] = useState<DagConfig>(DEFAULT_DAG);

  const [activeSection, setActiveSection] = useState<ActivitySection | null>("collections");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState({ collection: "tMIC", folder: "New" });
  const [rightPanel, setRightPanel] = useState<RightPanel | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  const handleSelectRequest = useCallback((requestId: string) => {
    const mock = requests[requestId];
    if (!mock) return;
    setRequest(mock.config);
    setSchema(mock.schema);
    setDagConfig(mock.dagConfig);
    setResponse(mock.mockResponse.status !== 0 ? mock.mockResponse : null);
    setActiveRequestId(requestId);
    setBreadcrumb(findBreadcrumb(collections, requestId));
  }, [requests, collections]);

  const setReq = (patch: Partial<RequestConfig>) => setRequest((r) => ({ ...r, ...patch }));

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      if (activeRequestId) {
        const mock = requests[activeRequestId];
        if (mock && mock.mockResponse.status !== 0 &&
            (request.url.includes("tmic-internal") || request.url.includes("marketdata.app"))) {
          await new Promise((r) => setTimeout(r, mock.mockResponse.durationMs));
          setResponse(mock.mockResponse);
          return;
        }
      }
      const res = await executeRequest(request);
      setResponse(res);
    } finally {
      setLoading(false);
    }
  }

  function handleInferSchema() {
    if (!response?.body) return;
    setSchema(inferSchema(response.body));
  }

  function handleSave() {
    if (activeRequestId) {
      saveRequest(activeRequestId, {
        config: request,
        schema,
        dagConfig,
      });
    }
    const name = dagConfig.crawlerName || request.name;
    setSaveMsg(`"${name}" saved!`);
    setTimeout(() => setSaveMsg(null), 2500);
  }

  function handleActivityToggle(section: ActivitySection) {
    setActiveSection((cur) => (cur === section ? null : section));
  }

  function handleRightPanelToggle(panel: RightPanel) {
    setRightPanel((cur) => (cur === panel ? null : panel));
  }

  function handleModalCreate(
    type: "collection" | "folder",
    parentId: string | null,
    containerName: string,
    requestName: string
  ) {
    let targetId: string;
    if (type === "collection") {
      targetId = addCollection(containerName);
    } else {
      targetId = addFolder(parentId!, containerName);
    }
    const newRequestId = addRequest(targetId, requestName);
    // Open the blank request in the editor
    setTimeout(() => handleSelectRequest(newRequestId), 50);
  }

  const collectionsOpen = activeSection === "collections";

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>

      {/* Activity Bar */}
      <ActivityBar activeSection={activeSection} onSectionToggle={handleActivityToggle} />

      {/* Collections Tree (collapsible) */}
      {collectionsOpen && (
        <CollectionsTree
          collections={collections}
          activeRequestId={activeRequestId}
          onSelectRequest={handleSelectRequest}
          onAdd={() => setShowNewItemModal(true)}
        />
      )}

      {/* Main Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <RequestBreadcrumb
          collectionName={breadcrumb.collection}
          folderName={breadcrumb.folder}
          requestName={request.name}
          onRequestNameChange={(name) => setReq({ name })}
          onSave={handleSave}
          saveMessage={saveMsg}
        />
        <EndpointBar
          method={request.method}
          url={request.url}
          loading={loading}
          onMethodChange={(m) => setReq({ method: m })}
          onUrlChange={(url) => setReq({ url })}
          onSend={handleSend}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: "0 0 220px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <RequestTabs request={request} onChange={setReq} />
          </div>
          <div style={{ flex: 1, display: "flex", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
            <ResponsePanel response={response} loading={loading} />
          </div>
        </div>
      </div>

      {/* Right Slide-in Panels */}
      {rightPanel === "schema" && (
        <SchemaPanel
          fields={schema}
          onFieldsChange={setSchema}
          onInferFromResponse={handleInferSchema}
          hasResponse={!!response?.body}
        />
      )}
      {rightPanel === "dag" && (
        <DagPanel config={dagConfig} onChange={setDagConfig} onSave={handleSave} />
      )}

      {/* Right Icon Bar */}
      <RightIconBar activePanel={rightPanel} onPanelToggle={handleRightPanelToggle} />

      {/* New Item Modal */}
      {showNewItemModal && (
        <NewItemModal
          collections={collections}
          onClose={() => setShowNewItemModal(false)}
          onCreate={handleModalCreate}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

```bash
cd /tmp/eggroll-check && npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd /tmp/eggroll-check && git add app/api-crawler/page.tsx && git commit -m "feat: wire useCollections hook, NewItemModal, and functional Save button into page"
```

---

## Task 5: Deploy and create PR

**Files:** N/A (deployment only)

- [ ] **Step 1: Deploy to live server**

```bash
rm -rf /home/ubuntu/eggroll-out && cp -r /tmp/eggroll-check/out /home/ubuntu/eggroll-out && pm2 restart eggroll && sleep 2
```

- [ ] **Step 2: Smoke test**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4174/api-crawler/
```
Expected: `200`

- [ ] **Step 3: Push branch**

```bash
cd /tmp/eggroll-check && git push origin fix/tmic-sidebar-routing-theme
```

- [ ] **Step 4: Create PR**

```bash
gh pr create \
  --title "feat: New Collection/Folder creation with localStorage persistence" \
  --body "## Summary
Adds the ability to create new Collections and Folders in the API Crawler Collections tree.

### Features
- **\`+\` button** in Collections panel header opens a creation modal
- **Single-step modal** with type selector (Collection / Folder), parent picker (for Folders), container name input, and initial request name input
- **Auto-creates** a blank API Request inside the new container and opens it in the editor immediately
- **\`useCollections\` hook** manages merged static mock + user-created state with localStorage persistence
  - \`tmic-collections\` key stores user-created tree nodes
  - \`tmic-requests\` key stores full request configs
- **Save button** in RequestBreadcrumb is now functional — persists request config + schema + DAG to localStorage
- User-created collections survive page refresh

### Files changed
- \`hooks/useCollections.ts\` (new)
- \`components/api-crawler/NewItemModal.tsx\` (new)
- \`components/api-crawler/CollectionsTree.tsx\` (accept props)
- \`app/api-crawler/page.tsx\` (wire hook + modal + Save)" \
  --base main 2>&1
```

Expected: PR URL printed, e.g. `https://github.com/hwchiu/eggroll/pull/24`

- [ ] **Step 5: Confirm PR created successfully and record URL**
