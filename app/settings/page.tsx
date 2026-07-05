// app/settings/page.tsx
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header title="Settings" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Settings — coming in Phase 2
      </div>
    </div>
  );
}
