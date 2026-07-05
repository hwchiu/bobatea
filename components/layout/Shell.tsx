// components/layout/Shell.tsx
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main
          className="shell-main"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            background: "var(--bg-base)",
          }}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
