// components/layout/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import { useActiveWorkspace, getWorkspace } from "@/lib/workspace";

const BASE = "/bobatea";

export function Sidebar() {
  const pathname = usePathname(); // returns path WITHOUT basePath, e.g. "/api-crawler"
  const workspace = getWorkspace(useActiveWorkspace(pathname));

  return (
    <aside
      className="sidebar"
      style={{
        width: 200,
        minWidth: 200,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {workspace.nav.map(({ path, icon: Icon, label }) => {
          const active = pathname.startsWith(path);
          // Use plain <a> with absolute path to avoid Next.js basePath double-prepend
          return (
            <a
              key={path}
              href={`${BASE}${path}/`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "rgba(91,133,232,0.12)" : "transparent",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
