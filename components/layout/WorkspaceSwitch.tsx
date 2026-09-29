// components/layout/WorkspaceSwitch.tsx — Workspace switch dropdown, placed left of the tMIC logo.
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { WORKSPACES, useActiveWorkspace, setStoredWorkspace, type WorkspaceId } from "@/lib/workspace";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bobatea";

function navigateTo(path: string): void {
  window.location.href = `${BASE}${path}/`;
}

export function WorkspaceSwitch() {
  const pathname = usePathname();
  const active = useActiveWorkspace(pathname);
  const [open, setOpen] = useState(false);
  const activeDef = WORKSPACES.find((w) => w.id === active) ?? WORKSPACES[0];

  const goTo = (id: WorkspaceId) => {
    if (id === active) { setOpen(false); return; }
    setStoredWorkspace(id);
    const target = WORKSPACES.find((w) => w.id === id)!;
    navigateTo(target.homePath);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        title="Switch workspace"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 9px",
          background: open ? "var(--bg-elevated)" : "transparent",
          border: "1px solid " + (open ? "var(--border)" : "transparent"),
          borderRadius: 6,
          cursor: "pointer",
          color: "var(--text-primary)",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <activeDef.icon size={14} style={{ color: "var(--accent)" }} />
        <span className="workspace-switch-label">{activeDef.label}</span>
        <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            minWidth: 260,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            zIndex: 200,
          }}
        >
          <div style={{
            padding: "8px 12px 6px",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            borderBottom: "1px solid var(--border)",
          }}>
            Workspace
          </div>
          {WORKSPACES.map((ws) => {
            const isActive = ws.id === active;
            return (
              <button
                key={ws.id}
                onClick={() => goTo(ws.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: isActive ? "rgba(91,133,232,0.1)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ws.icon size={16} style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{ws.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{ws.description}</div>
                </div>
                {isActive && <Check size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
