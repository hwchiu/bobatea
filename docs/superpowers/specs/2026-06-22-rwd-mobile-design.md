# RWD Mobile Support — Design Spec

**Date:** 2026-06-22  
**Project:** hwchiu/eggroll (tMIC Workspace, basePath `/eggroll`)  
**Status:** Approved

---

## Problem

The eggroll site is fully desktop-only. On mobile screens (≤768px):
- The 200px fixed sidebar takes ~30% of viewport width, leaving almost no usable space
- The TopBar does not wrap; icons overflow
- No touch-friendly navigation exists
- Language switching (zh-TW / en) is wired to localStorage but not propagated to page content

---

## Goals

1. Sidebar hidden on mobile; replaced by a bottom tab bar
2. TopBar shrinks gracefully on mobile; only `zh-TW` and `en` languages
3. Language selection actually updates UI text throughout the app (currently stored but unused)
4. No new npm dependencies (ponytail: stdlib + CSS)

---

## Breakpoint

Single breakpoint: **768px** (mobile ≤ 768px, desktop > 768px).

---

## Architecture

### 1. `BottomNav` component (new)
**File:** `components/layout/BottomNav.tsx`

- Fixed to bottom of viewport (`position: fixed; bottom: 0`)
- 3 tabs: API Crawler (`Code2`), My Jobs (`Briefcase`), Settings (`Settings`)
- Active state mirrors `Sidebar` logic (pathname match)
- Height: 56px; safe-area padding for iOS notch via `env(safe-area-inset-bottom)`
- CSS class `bottom-nav` — hidden on desktop via `@media (min-width: 769px) { display: none }`

### 2. `Shell.tsx` changes
- Sidebar: add `className="sidebar"` — hidden on mobile via CSS
- Add `<BottomNav />` below the main content area
- Add `padding-bottom: 56px` to `<main>` on mobile so content isn't covered by bottom nav

### 3. `Sidebar.tsx` changes
- Add `className="sidebar"` to `<aside>`
- No logic change; CSS handles visibility

### 4. `TopBar.tsx` changes
- Remove `{ code: "ja", label: "日本語" }` from `LANGUAGES` array — only `en` and `zh-TW`
- Add `flex-wrap: wrap` and reduce font sizes on mobile via CSS class `topbar`
- Language state: expose via `localStorage` key `tmic-lang` (already done); for now, other pages read it on mount. Full context propagation is a separate phase.

### 5. `globals.css` additions
Append at end of file:

```css
/* ===== RWD MOBILE (≤768px) ===== */

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar { display: none !important; }
  .bottom-nav { display: flex !important; }
  main { padding-bottom: 56px; }
  .topbar { flex-wrap: wrap; gap: 6px; }
  .topbar-user { display: none; }   /* hide name/role text, keep avatar */
}

/* Hide bottom nav on desktop */
.bottom-nav { display: none; }
```

---

## Language Switching

- **Scope of this task:** Remove Japanese, keep `en` + `zh-TW`. Ensure TopBar renders current language correctly. Other page content language propagation is out of scope (separate task).
- `localStorage.setItem("tmic-lang", code)` already persists the selection — pages that read it on mount will pick it up.

---

## Files Changed

| File | Change |
|------|--------|
| `components/layout/BottomNav.tsx` | New — bottom tab navigation |
| `components/layout/Shell.tsx` | Add `<BottomNav>`, `className` on sidebar wrapper |
| `components/layout/Sidebar.tsx` | Add `className="sidebar"` |
| `components/layout/TopBar.tsx` | Remove Japanese; add `className="topbar"` / `"topbar-user"` |
| `app/globals.css` | Append mobile media queries |

---

## Out of Scope

- Full i18n content translation (all page text) — separate task
- Tablet-specific breakpoint (768–1024px) — desktop layout is fine there
- Offline/PWA support

---

## Verification

- Desktop (>768px): sidebar visible, bottom nav hidden, all pages work
- Mobile (≤768px): sidebar hidden, bottom nav visible and navigates correctly, TopBar doesn't overflow
- Language: only `en` and `zh-TW` appear in dropdown
