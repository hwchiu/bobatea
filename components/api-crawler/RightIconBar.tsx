// components/api-crawler/RightIconBar.tsx
"use client";

import { BarChart2, Settings2 } from "lucide-react";

type RightPanel = "schema" | "dag";

interface RightIconBarProps {
  activePanel: RightPanel | null;
  onPanelToggle: (p: RightPanel) => void;
}

const BUTTONS: { panel: RightPanel; Icon: React.FC<{ size: number }>; label: string }[] = [
  { panel: "schema", Icon: BarChart2, label: "Response Schema"   },
  { panel: "dag",    Icon: Settings2, label: "DAG Configuration" },
];

export function RightIconBar({ activePanel, onPanelToggle }: RightIconBarProps) {
  return (
    <div style={{
      width: 44,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderLeft: "1px solid var(--border)",
    }}>
      {BUTTONS.map(({ panel, Icon, label }) => {
        const isActive = activePanel === panel;
        return (
          <button
            key={panel}
            title={label}
            onClick={() => onPanelToggle(panel)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isActive ? "var(--bg-elevated)" : "transparent",
              border: "none",
              borderRight: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "color 0.15s, background 0.15s",
            }}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
