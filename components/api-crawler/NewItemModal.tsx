// components/api-crawler/NewItemModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Check } from "lucide-react";
import type { CollectionNode } from "@/lib/types";

interface NewItemModalProps {
  collections: CollectionNode[];
  onClose: () => void;
  addCollection: (name: string) => string;
  addFolder: (collectionId: string, name: string) => string;
  onCreate: (parentId: string, requestName: string, description: string) => void;
}

type SelectionState =
  | { kind: "none" }
  | { kind: "collection"; id: string; name: string }
  | { kind: "folder"; id: string; name: string };

export function NewItemModal({
  collections,
  onClose,
  addCollection,
  addFolder,
  onCreate,
}: NewItemModalProps) {
  const [selected, setSelected] = useState<SelectionState>({ kind: "none" });
  const [requestName, setRequestName] = useState("New Request");
  const [description, setDescription] = useState("");

  // Inline creation state
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionInput, setNewCollectionInput] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState("");

  const newCollectionRef = useRef<HTMLInputElement>(null);
  const newFolderRef = useRef<HTMLInputElement>(null);
  const requestNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => requestNameRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    if (showNewCollection) setTimeout(() => newCollectionRef.current?.focus(), 40);
  }, [showNewCollection]);

  useEffect(() => {
    if (showNewFolder) setTimeout(() => newFolderRef.current?.focus(), 40);
  }, [showNewFolder]);

  // Confirm creating a new collection → auto-select it
  function confirmNewCollection() {
    const name = newCollectionInput.trim();
    if (!name) return;
    const id = addCollection(name);
    setSelected({ kind: "collection", id, name });
    setShowNewCollection(false);
    setNewCollectionInput("");
    setShowNewFolder(false);
  }

  // Confirm creating a new folder inside selected collection → auto-select it
  function confirmNewFolder() {
    if (selected.kind !== "collection") return;
    const name = newFolderInput.trim();
    if (!name) return;
    const id = addFolder(selected.id, name);
    setSelected({ kind: "folder", id, name });
    setShowNewFolder(false);
    setNewFolderInput("");
  }

  const targetId =
    selected.kind === "collection" ? selected.id :
    selected.kind === "folder"     ? selected.id :
    null;

  const canCreate = targetId !== null && requestName.trim().length > 0;

  function handleCreate() {
    if (!canCreate) return;
    onCreate(targetId!, requestName.trim(), description.trim());
    onClose();
  }

  // Location label shown in breadcrumb
  const locationLabel =
    selected.kind === "collection" ? `📁 ${selected.name}` :
    selected.kind === "folder"     ? `📁 ${selected.name}` :
    "—  Select a location";

  return (
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            New Request
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>

          {/* Location tree */}
          <div>
            <label style={labelStyle}>
              Save to location
              {selected.kind !== "none" && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--accent)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  {locationLabel}
                </span>
              )}
            </label>
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg-surface)",
              maxHeight: 220,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Existing collections */}
              {collections
                .filter((n) => n.kind === "collection")
                .map((col) => (
                  <CollectionRow
                    key={col.id}
                    node={col}
                    selected={selected}
                    onSelectCollection={(id, name) => {
                      setSelected({ kind: "collection", id, name });
                      setShowNewFolder(false);
                      setNewFolderInput("");
                    }}
                    onSelectFolder={(id, name) => setSelected({ kind: "folder", id, name })}
                    showNewFolder={showNewFolder && selected.kind === "collection" && selected.id === col.id}
                    newFolderInput={newFolderInput}
                    onNewFolderInputChange={setNewFolderInput}
                    newFolderRef={newFolderRef}
                    onConfirmNewFolder={confirmNewFolder}
                    onCancelNewFolder={() => { setShowNewFolder(false); setNewFolderInput(""); }}
                    onRequestNewFolder={() => { setShowNewFolder(true); setNewFolderInput(""); }}
                  />
                ))}

              {/* Empty state */}
              {collections.filter((n) => n.kind === "collection").length === 0 && !showNewCollection && (
                <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                  No collections yet — create one below.
                </div>
              )}

              {/* Inline create collection */}
              {showNewCollection ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderTop: collections.length > 0 ? "1px solid var(--border)" : "none" }}>
                  <Plus size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <input
                    ref={newCollectionRef}
                    value={newCollectionInput}
                    onChange={(e) => setNewCollectionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmNewCollection();
                      if (e.key === "Escape") { setShowNewCollection(false); setNewCollectionInput(""); }
                    }}
                    placeholder="Collection name…"
                    style={inlineInputStyle}
                  />
                  <button onClick={confirmNewCollection} disabled={!newCollectionInput.trim()} style={inlineConfirmBtn(!!newCollectionInput.trim())}>
                    <Check size={12} />
                  </button>
                  <button onClick={() => { setShowNewCollection(false); setNewCollectionInput(""); }} style={inlineCancelBtn}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowNewCollection(true); setSelected({ kind: "none" }); setShowNewFolder(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    background: "transparent",
                    border: "none",
                    borderTop: collections.filter(n => n.kind === "collection").length > 0 ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                    color: "var(--accent)",
                    fontSize: 12,
                    fontWeight: 500,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <Plus size={12} />
                  Create Collection
                </button>
              )}
            </div>
          </div>

          {/* Request name */}
          <div>
            <label style={labelStyle}>
              Request Name <span style={{ color: "#e06060" }}>*</span>
            </label>
            <input
              ref={requestNameRef}
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="e.g. Get Stock Quote"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Description <span style={{ color: "var(--text-dim)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</span>
              </label>
              <span style={{ fontSize: 11, color: description.length > 230 ? "#e5a050" : "var(--text-dim)" }}>
                {description.length}/256
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 256))}
              placeholder="What does this request do?"
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 60,
                maxHeight: 120,
                fontFamily: "inherit",
                lineHeight: 1.5,
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
          flexShrink: 0,
        }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleCreate} disabled={!canCreate} style={createBtnStyle(canCreate)}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Collection row with inline folder creation ───────────────────────────────

function CollectionRow({
  node,
  selected,
  onSelectCollection,
  onSelectFolder,
  showNewFolder,
  newFolderInput,
  onNewFolderInputChange,
  newFolderRef,
  onConfirmNewFolder,
  onCancelNewFolder,
  onRequestNewFolder,
}: {
  node: CollectionNode;
  selected: SelectionState;
  onSelectCollection: (id: string, name: string) => void;
  onSelectFolder: (id: string, name: string) => void;
  showNewFolder: boolean;
  newFolderInput: string;
  onNewFolderInputChange: (v: string) => void;
  newFolderRef: React.RefObject<HTMLInputElement | null>;
  onConfirmNewFolder: () => void;
  onCancelNewFolder: () => void;
  onRequestNewFolder: () => void;
}) {
  if (node.kind !== "collection") return null;
  const isSelected = selected.kind === "collection" && selected.id === node.id;
  const [open, setOpen] = useState(isSelected);
  const folders = node.children.filter((c) => c.kind === "folder");

  // Auto-expand when selected
  useEffect(() => { if (isSelected) setOpen(true); }, [isSelected]);

  return (
    <div>
      {/* Collection row */}
      <button
        onClick={() => {
          onSelectCollection(node.id, node.name);
          setOpen(true);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "7px 10px",
          background: isSelected ? "rgba(91,133,232,0.12)" : "transparent",
          border: "none",
          cursor: "pointer",
          color: isSelected ? "var(--accent)" : "var(--text-primary)",
          fontSize: 12,
          fontWeight: isSelected ? 600 : 500,
          textAlign: "left",
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-dim)", display: "flex", flexShrink: 0 }}
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {open
          ? <FolderOpen size={13} style={{ flexShrink: 0, color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />
          : <Folder size={13} style={{ flexShrink: 0, color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
        {isSelected && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent)", flexShrink: 0 }}>selected</span>
        )}
      </button>

      {/* Folders inside collection */}
      {open && (
        <div>
          {folders.map((f) => (
            <FolderRow
              key={f.id}
              node={f}
              selected={selected}
              onSelect={onSelectFolder}
            />
          ))}

          {/* Inline create folder */}
          {showNewFolder ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 32px" }}>
              <Plus size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <input
                ref={newFolderRef}
                value={newFolderInput}
                onChange={(e) => onNewFolderInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConfirmNewFolder();
                  if (e.key === "Escape") onCancelNewFolder();
                }}
                placeholder="Folder name…"
                style={inlineInputStyle}
              />
              <button onClick={onConfirmNewFolder} disabled={!newFolderInput.trim()} style={inlineConfirmBtn(!!newFolderInput.trim())}>
                <Check size={11} />
              </button>
              <button onClick={onCancelNewFolder} style={inlineCancelBtn}>
                <X size={11} />
              </button>
            </div>
          ) : isSelected && (
            <button
              onClick={onRequestNewFolder}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px 5px 32px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 11,
                width: "100%",
                textAlign: "left",
              }}
            >
              <Plus size={11} />
              Create Folder
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FolderRow({
  node,
  selected,
  onSelect,
  depth = 1,
}: {
  node: CollectionNode;
  selected: SelectionState;
  onSelect: (id: string, name: string) => void;
  depth?: number;
}) {
  if (node.kind === "request") return null;
  const isSelected = selected.kind === "folder" && selected.id === node.id;
  const subFolders = node.children.filter((c) => c.kind === "folder");
  const [open, setOpen] = useState(false);
  const indent = depth * 18 + 10;

  return (
    <div>
      <button
        onClick={() => onSelect(node.id, node.name)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: `6px 10px 6px ${indent}px`,
          background: isSelected ? "rgba(91,133,232,0.12)" : "transparent",
          border: "none",
          cursor: "pointer",
          color: isSelected ? "var(--accent)" : "var(--text-muted)",
          fontSize: 12,
          textAlign: "left",
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--text-dim)", display: "flex", flexShrink: 0 }}
        >
          {subFolders.length > 0
            ? (open ? <ChevronDown size={11} /> : <ChevronRight size={11} />)
            : <span style={{ display: "inline-block", width: 11 }} />}
        </button>
        <Folder size={12} style={{ flexShrink: 0, color: isSelected ? "var(--accent)" : "var(--text-muted)" }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
        {isSelected && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent)", flexShrink: 0 }}>selected</span>
        )}
      </button>
      {open && subFolders.map((sub) => (
        <FolderRow key={sub.id} node={sub} selected={selected} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  background: "var(--bg-base)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const inlineInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "3px 7px",
  background: "var(--bg-base)",
  border: "1px solid var(--accent)",
  borderRadius: 4,
  color: "var(--text-primary)",
  fontSize: 12,
  outline: "none",
  minWidth: 0,
};

const inlineConfirmBtn = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--accent)" : "var(--bg-surface)",
  border: "none",
  borderRadius: 4,
  padding: "3px 5px",
  cursor: active ? "pointer" : "not-allowed",
  color: active ? "#fff" : "var(--text-dim)",
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
});

const inlineCancelBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  padding: "3px 4px",
  flexShrink: 0,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "7px 16px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-muted)",
  fontSize: 13,
  cursor: "pointer",
};

const createBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  background: active ? "var(--accent)" : "var(--bg-surface)",
  border: "none",
  borderRadius: 6,
  color: active ? "#fff" : "var(--text-dim)",
  fontSize: 13,
  fontWeight: 600,
  cursor: active ? "pointer" : "not-allowed",
  transition: "background 0.15s",
});
