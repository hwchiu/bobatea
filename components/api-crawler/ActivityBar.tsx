// components/api-crawler/ActivityBar.tsx
"use client";

import { FolderOpen, Globe, Clock } from "lucide-react";

type Section = "collections" | "environments" | "history";

interface ActivityBarProps {
  activeSection: Section | null;
  onSectionToggle: (s: Section) => void;
}

const BUTTONS: { section: Section; Icon: React.FC<{ size: number }>; label: string; disabled?: boolean }[] = [
  { section: "collections",  Icon: FolderOpen, label: "Collections"  },
  { section: "environments", Icon: Globe,      label: "Environments", disabled: true },
  { section: "history",      Icon: Clock,      label: "History",      disabled: true },
];

export function ActivityBar({ activeSection, onSectionToggle }: ActivityBarProps) {
  return (
    <div className="activity-bar" style={{
      width: 44,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
    }}>
      {BUTTONS.map(({ section, Icon, label, disabled }) => {
        const isActive = activeSection === section;
        return (
          <button
            key={section}
            title={label}
            disabled={disabled}
            onClick={() => !disabled && onSectionToggle(section)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isActive ? "var(--bg-elevated)" : "transparent",
              border: "none",
              borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              color: disabled ? "var(--text-dim)" : isActive ? "var(--accent)" : "var(--text-muted)",
              cursor: disabled ? "default" : "pointer",
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
