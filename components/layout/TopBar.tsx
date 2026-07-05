"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Globe, BookOpen, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
];

// Mock user — replace with real auth context in a later phase
const MOCK_USER = {
  name: "hwchiu",
  displayName: "Hung-Wei Chiu",
  role: "Data Engineer",
  avatarInitials: "HC",
  avatarColor: "#5b85e8",
};

export function TopBar() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("zh-TW");
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tmic-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);

    const storedLang = localStorage.getItem("tmic-lang");
    if (storedLang) setLang(storedLang);

    // Close dropdowns on outside click
    const close = () => {
      setLangOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("tmic-theme", next ? "dark" : "light");
  };

  const selectLang = (code: string) => {
    setLang(code);
    localStorage.setItem("tmic-lang", code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
        gap: 8,
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.9" />
          <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5" />
          <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.5" />
          <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--accent)" opacity="0.25" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
          tMIC Workspace
        </span>
        <span
          style={{
            fontSize: 10,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            padding: "1px 6px",
            borderRadius: 4,
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          PHASE 1
        </span>
      </div>

      {/* Right icon group */}
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 4 }}>

        {/* User Manual */}
        <TopBarButton
          title="User Manual"
          onClick={() => window.open("https://github.com/hwchiu/bobatea/wiki", "_blank")}
        >
          <BookOpen size={15} />
        </TopBarButton>

        {/* Language switcher */}
        <div style={{ position: "relative" }}>
          <TopBarButton
            title="Language"
            onClick={(e) => { e.stopPropagation(); setLangOpen((o) => !o); setProfileOpen(false); }}
            active={langOpen}
          >
            <Globe size={15} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1 }}>
              {currentLang.code.toUpperCase().slice(0, 2)}
            </span>
            <ChevronDown size={11} style={{ color: "var(--text-muted)", opacity: 0.6 }} />
          </TopBarButton>

          {langOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                minWidth: 140,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                overflow: "hidden",
                zIndex: 200,
              }}
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => selectLang(l.code)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: l.code === lang ? "rgba(91,133,232,0.15)" : "transparent",
                    border: "none",
                    color: l.code === lang ? "var(--accent)" : "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light toggle */}
        <TopBarButton
          title={dark ? "Switch to Light mode" : "Switch to Dark mode"}
          onClick={toggleTheme}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </TopBarButton>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 6px" }} />

        {/* User profile */}
        <div style={{ position: "relative" }}>
          <button
            title={MOCK_USER.displayName}
            onClick={(e) => { e.stopPropagation(); setProfileOpen((o) => !o); setLangOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 8px 4px 4px",
              background: profileOpen ? "var(--bg-elevated)" : "transparent",
              border: "1px solid " + (profileOpen ? "var(--border)" : "transparent"),
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: MOCK_USER.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
                letterSpacing: "0.02em",
              }}
            >
              {MOCK_USER.avatarInitials}
            </div>
            <div className="topbar-user-text" style={{ textAlign: "left", lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {MOCK_USER.displayName}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{MOCK_USER.role}</div>
            </div>
            <ChevronDown size={13} style={{ color: "var(--text-muted)", marginLeft: 2 }} />
          </button>

          {profileOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                minWidth: 200,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                overflow: "hidden",
                zIndex: 200,
              }}
            >
              {/* Profile header */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: MOCK_USER.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {MOCK_USER.avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {MOCK_USER.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>@{MOCK_USER.name}</div>
                  </div>
                </div>
              </div>
              {/* Menu items */}
              {[
                { label: "Profile Settings", action: () => {} },
                { label: "Workspace Preferences", action: () => {} },
                { label: "Sign Out", action: () => {}, danger: true },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: "transparent",
                    border: "none",
                    color: item.danger ? "#e06060" : "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Reusable icon button
function TopBarButton({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 8px",
        background: active ? "var(--bg-elevated)" : "transparent",
        border: "1px solid " + (active ? "var(--border)" : "transparent"),
        borderRadius: 6,
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}
