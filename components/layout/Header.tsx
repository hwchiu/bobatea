// components/layout/Header.tsx
interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <div
      style={{
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </h1>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}
