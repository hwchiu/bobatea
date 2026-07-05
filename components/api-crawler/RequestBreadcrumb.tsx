// components/api-crawler/RequestBreadcrumb.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Save } from "lucide-react";

interface RequestBreadcrumbProps {
  collectionName: string;
  folderName: string;
  requestName: string;
  onRequestNameChange: (name: string) => void;
  onSave: () => void;
  saveMessage: string | null;
}

export function RequestBreadcrumb({
  collectionName,
  folderName,
  requestName,
  onRequestNameChange,
  onSave,
  saveMessage,
}: RequestBreadcrumbProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(requestName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(requestName); }, [requestName]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit() {
    const trimmed = draft.trim() || requestName;
    onRequestNameChange(trimmed);
    setEditing(false);
  }

  const sep = <span style={{ color: "var(--text-dim)", margin: "0 6px" }}>›</span>;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      height: 36,
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 12, overflow: "hidden" }}>
        <span style={{ color: "var(--text-muted)" }}>{collectionName}</span>
        {sep}
        <span style={{ color: "var(--text-muted)" }}>{folderName}</span>
        {sep}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--accent)",
              borderRadius: 3,
              color: "var(--text-primary)",
              padding: "1px 6px",
              fontSize: 12,
              outline: "none",
              minWidth: 100,
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            title="Click to rename"
            style={{
              color: "var(--text-primary)",
              cursor: "text",
              borderBottom: "1px dashed var(--text-dim)",
            }}
          >
            {requestName}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {saveMessage && (
          <span style={{ fontSize: 11, color: "var(--success)" }}>{saveMessage}</span>
        )}
        <button
          onClick={onSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--text-muted)",
            padding: "3px 10px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <Save size={12} />
          Save
        </button>
      </div>
    </div>
  );
}
