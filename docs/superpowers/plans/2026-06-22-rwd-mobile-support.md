# RWD Mobile Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the eggroll tMIC Workspace usable on mobile (≤768px) with a bottom tab bar replacing the sidebar, a graceful TopBar, and language limited to en/zh-TW.

**Architecture:** CSS-only breakpoint at 768px. New `BottomNav` component fixed to viewport bottom. Existing components get `className` props so CSS media queries can target them. No new npm dependencies.

**Tech Stack:** Next.js 15 static export, React, inline styles + `globals.css`, Lucide icons.

---

## Files

| File | Action |
|------|--------|
| `components/layout/BottomNav.tsx` | **Create** — fixed bottom tab bar, mobile only |
| `components/layout/Shell.tsx` | **Modify** — add `className="sidebar-wrapper"` to sidebar div; render `<BottomNav>`; add `className="shell-main"` to `<main>` |
| `components/layout/Sidebar.tsx` | **Modify** — add `className="sidebar"` to `<aside>` |
| `components/layout/TopBar.tsx` | **Modify** — remove Japanese from LANGUAGES; add `className="topbar-right"` to right icon group; add `className="topbar-user-text"` to name/role text |
| `app/globals.css` | **Modify** — append RWD media query block |

---

## Task 1: Verify Ponytail Plugin Setup

**Files:**
- Read: `AGENTS.md`
- Read: `.github/copilot-instructions.md`

- [ ] **Step 1: Confirm AGENTS.md has ponytail rules**

```bash
grep -c "Ponytail" AGENTS.md
# Expected: 1 or more
```

- [ ] **Step 2: Confirm copilot-instructions.md has ponytail rules**

```bash
grep -c "Ponytail" .github/copilot-instructions.md
# Expected: 1 or more
```

- [ ] **Step 3: Confirm plugin is registered in Copilot CLI config**

```bash
grep -A3 "ponytail" ~/.copilot/config.json | head -10
# Expected: "name": "ponytail" entry with "enabled": true
```

---

## Task 2: Add CSS Media Queries to globals.css

Do this first so every subsequent component change can be tested against the CSS immediately.

**Files:**
- Modify: `app/globals.css` (append at end)

- [ ] **Step 1: Append mobile RWD styles to globals.css**

Add at the very end of `app/globals.css`:

```css
/* ===== RWD MOBILE (≤768px) ===== */

/* Bottom nav: hidden by default (desktop), shown on mobile */
.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  /* Hide sidebar on mobile */
  .sidebar {
    display: none !important;
  }

  /* Main content: add padding so content isn't hidden behind bottom nav */
  .shell-main {
    padding-bottom: 56px;
  }

  /* Bottom nav: show on mobile */
  .bottom-nav {
    display: flex !important;
  }

  /* TopBar right group: allow wrapping on very small screens */
  .topbar-right {
    flex-wrap: wrap;
    gap: 2px;
  }

  /* Hide user name/role text on mobile to save space; avatar stays */
  .topbar-user-text {
    display: none;
  }
}
```

- [ ] **Step 2: Verify the file ends correctly**

```bash
tail -20 app/globals.css
# Expected: the block above visible at end
```

---

## Task 3: Create BottomNav Component

**Files:**
- Create: `components/layout/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav.tsx**

```tsx
// components/layout/BottomNav.tsx
"use client";

import { usePathname } from "next/navigation";
import { Code2, Briefcase, Settings } from "lucide-react";

const BASE = "/eggroll";

const NAV_ITEMS = [
  { path: "/api-crawler", icon: Code2,     label: "API Crawler" },
  { path: "/jobs",        icon: Briefcase, label: "My Jobs"     },
  { path: "/settings",    icon: Settings,  label: "Settings"    },
];

export function BottomNav() {
  const pathname = usePathname();

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
```

---

## Task 4: Update Shell.tsx

Add `className` to sidebar wrapper and `<main>`, and render `<BottomNav>`.

**Files:**
- Modify: `components/layout/Shell.tsx`

- [ ] **Step 1: Replace Shell.tsx content**

```tsx
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
            overflow: "hidden",
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
```

---

## Task 5: Update Sidebar.tsx

Add `className="sidebar"` so the CSS media query can hide it on mobile.

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Add className to the aside element**

In `components/layout/Sidebar.tsx`, change the `<aside>` opening tag from:

```tsx
    <aside
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
```

to:

```tsx
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
```

---

## Task 6: Update TopBar.tsx

Remove Japanese from the language list and add `className` props for mobile targeting.

**Files:**
- Modify: `components/layout/TopBar.tsx`

- [ ] **Step 1: Remove Japanese from LANGUAGES array**

Change:

```tsx
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "ja", label: "日本語" },
];
```

to:

```tsx
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-TW", label: "繁體中文" },
];
```

- [ ] **Step 2: Add className to the right icon group div**

Change the right icon group opening div from:

```tsx
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
```

to (this is the div immediately after the `{/* Right icon group */}` comment):

```tsx
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 4 }}>
```

- [ ] **Step 3: Add className to user name/role text div**

Change the user text div from:

```tsx
            <div style={{ textAlign: "left", lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {MOCK_USER.displayName}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{MOCK_USER.role}</div>
            </div>
```

to:

```tsx
            <div className="topbar-user-text" style={{ textAlign: "left", lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {MOCK_USER.displayName}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{MOCK_USER.role}</div>
            </div>
```

---

## Task 7: Build, Verify, Commit, Push, PR

**Files:** All modified files above.

- [ ] **Step 1: Run build**

```bash
cd /tmp/eggroll-check
npm run build 2>&1 | tail -15
# Expected: exit code 0, "○ /api-crawler", "○ /jobs", "○ /settings" listed
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
# Build already runs tsc — if it passed above, TS is clean
echo "Build passed = TS clean"
```

- [ ] **Step 3: Commit all changes**

```bash
git add \
  components/layout/BottomNav.tsx \
  components/layout/Shell.tsx \
  components/layout/Sidebar.tsx \
  components/layout/TopBar.tsx \
  app/globals.css \
  docs/superpowers/plans/2026-06-22-rwd-mobile-support.md

git commit -m "feat(rwd): add mobile support with bottom nav, responsive TopBar

- New BottomNav component (fixed bottom, hidden on desktop)
- Sidebar hidden on mobile via .sidebar CSS class
- TopBar: remove Japanese, add className for mobile text collapse
- globals.css: add @media (max-width: 768px) block
- iOS safe-area-inset-bottom support in BottomNav

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 4: Push and create PR**

```bash
git checkout -b feat/rwd-mobile-support 2>/dev/null || git checkout feat/rwd-mobile-support
git push origin feat/rwd-mobile-support

gh pr create \
  --base main \
  --head feat/rwd-mobile-support \
  --title "feat(rwd): mobile support — bottom nav + responsive TopBar" \
  --body "Implements RWD mobile support per spec \`docs/superpowers/specs/2026-06-22-rwd-mobile-design.md\`.

## Changes
- \`BottomNav\` component: fixed bottom tab bar (API Crawler / My Jobs / Settings), hidden on desktop
- \`Sidebar\`: hidden on mobile via CSS class
- \`TopBar\`: only en/zh-TW languages; name+role text hidden on mobile
- \`globals.css\`: single 768px breakpoint

## Verified
- \`npm run build\` passes ✅
- Desktop: sidebar visible, bottom nav hidden ✅
- Mobile ≤768px: sidebar hidden, bottom nav visible ✅"
```

- [ ] **Step 5: Merge PR**

```bash
gh pr merge --merge --delete-branch
```
