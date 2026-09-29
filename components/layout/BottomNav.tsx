// components/layout/BottomNav.tsx
"use client";

import { usePathname } from "next/navigation";
import { useActiveWorkspace, getWorkspace } from "@/lib/workspace";

const BASE = "/bobatea";

export function BottomNav() {
  const pathname = usePathname();
  const workspace = getWorkspace(useActiveWorkspace(pathname));
  const NAV_ITEMS = workspace.navCompact;

  return (
    <nav
      className="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 200,
      }}
    >
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = pathname.startsWith(path);
        return (
          <a
            key={path}
            href={`${BASE}${path}/`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px",
              color: active ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none",
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              minWidth: 60,
            }}
          >
            <Icon size={20} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
