# API Crawler Page — Postman-Inspired Redesign Spec
**Date:** 2026-06-12  
**Status:** Draft — awaiting user approval

---

## 1. Goal

Redesign the `/api-crawler` page into a professional, Postman-like data workspace. Replace the current ad-hoc layout with a structured multi-panel IDE-style interface. The aesthetic should be subdued and professional — no bright colours; think VSCode / Linear / Postman dark.

---

## 2. Layout Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Global Sidebar (220px, existing)                                           │
│  tMIC Workspace nav                                                        │
├──────────────────────────────────────────────────────────────────────────-─┤
│ [Activity Bar 44px] │ [Collections Tree 240px] │ [Main Area] │ [RBar 44px]│
│                     │                          │             │            │
│  📁 Collections     │  ▸ tMIC Crawlers         │  breadcrumb │  Schema    │
│  🌍 Environments    │    ▾ Market Data          │  URL bar    │  DAG       │
│  🕐 History         │      GET repos            │  tabs       │            │
│                     │      POST search          │  content    │            │
│                     │    ▾ Social               │  ─────────  │            │
│                     │      GET tweets           │  Response   │            │
└─────────────────────┴──────────────────────────┴─────────────┴────────────┘
```

If a right panel is toggled open, it slides in from the right at 300px width, shrinking the main area.

---

## 3. Colour Palette (Professional Dark)

Replace all current variables with a single-accent neutral palette:

| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#1a1a1a` | App canvas |
| `--bg-surface` | `#242424` | Panels, sidebar |
| `--bg-elevated` | `#2e2e2e` | Cards, inputs |
| `--bg-hover` | `#333333` | Row hover |
| `--border` | `#383838` | All borders |
| `--text-primary` | `#d4d4d4` | Body text |
| `--text-muted` | `#737373` | Labels, placeholders |
| `--text-dim` | `#4a4a4a` | Disabled |
| `--accent` | `#5b85e8` | Active tabs, highlights |
| `--accent-hover` | `#7aa0f0` | Hover on accent |

Method badge colours (muted, not neon):

| Method | Colour |
|---|---|
| GET | `#6bbd72` |
| POST | `#e5a050` |
| PUT | `#7b9ee8` |
| PATCH | `#b388e8` |
| DELETE | `#e06060` |

Status badge: 2xx → `#6bbd72`, 3xx → `#e5a050`, 4xx/5xx → `#e06060`.

---

## 4. Components

### 4.1 Activity Bar (`components/api-crawler/ActivityBar.tsx`)
- **Width**: 44px, full height, `--bg-surface` bg, right border
- **Buttons**: Square icon buttons (44×44px), tooltip on hover
  - 📁 Collections (default active)
  - 🌍 Environments (icon only, disabled state, future)
  - 🕐 History (icon only, disabled state, future)
- Active button: `--bg-elevated` bg + left `2px` accent border
- Clicking active section button collapses the Collections Tree (toggle)

### 4.2 Collections Tree (`components/api-crawler/CollectionsTree.tsx`)
- **Width**: 240px, resizable later; fixed for now
- **Header**: "Collections" label + `+` icon (adds collection, mock)
- **Tree nodes**:
  - **Collection** (folder icon, bold): expand/collapse with `▸`/`▾`
  - **Folder** (folder icon, normal): nested inside collection
  - **Request** (method badge + name): leaf node, click to load into editor
- **Active request**: highlighted row (`--bg-elevated`, left accent bar)
- **Mock data** (`data/mockCollections.ts`): 2 collections, 3–4 folders, 6–8 requests drawing from existing `mockCrawlers`

### 4.3 Request Breadcrumb (`components/api-crawler/RequestBreadcrumb.tsx`)
- Single bar at top of main area (height 36px, `--bg-surface`)
- Format: `Collection › Folder › Request Name`
- Request name is editable: click → inline `<input>` (updates request state)
- Save button (💾 icon + "Save" text) on the right

### 4.4 URL / Endpoint Bar (refactor `EndpointBar.tsx`)
- Method dropdown: colour-coded pill (`GET`, `POST`, etc.)
- URL input: monospace font, full width, `--bg-elevated` bg
- **Send** button: primary blue, right side
- Height: 48px, `--bg-surface`, bottom border

### 4.5 Request Tabs (`components/api-crawler/RequestTabs.tsx`)
Replaces separate `ParamsEditor` + `AuthEditor`. One component with tabs:

| Tab | Badge | Content |
|---|---|---|
| **Params** | count of enabled params | Query params table + Path params table |
| **Authorization** | type name | Auth type selector + fields |
| **Headers** | count of enabled headers | Headers KV table |
| **Body** | body type | none / JSON / form-data selector + editor |

- Tab bar style: horizontal, underline active tab (`--accent`)
- KV tables: checkbox (enabled) + key + value + delete icon per row; `+ Add` row at bottom

### 4.6 Response Panel (`components/api-crawler/ResponsePanel.tsx`)
- **Empty state**: grey centered text "Send a request to see the response"
- **Status bar**: `200 OK` badge (colour-coded) + `142 ms` + `4.2 KB`
- **Sub-tabs**: Body | Headers | Preview
  - Body: syntax-highlighted JSON (existing colour classes `.json-key` etc.)
  - Headers: key/value table
  - Preview: raw text fallback

### 4.7 Right Icon Bar (`components/api-crawler/RightIconBar.tsx`)
- **Width**: 44px, full height, `--bg-surface`, left border
- **Buttons**: 44×44px square icon buttons
  - 📊 Response Schema
  - ⚙️ DAG Configuration
- Clicking active button toggles its panel (close if already open)
- Active icon: `--bg-elevated` bg + right `2px` accent border (mirrored from left ActivityBar)

### 4.8 Schema Panel (`components/api-crawler/SchemaPanel.tsx`)
- Width 300px, right slide-in panel, `--bg-surface`, left border
- Header: "Response Schema" + "Infer from Response" button
- Table: name / path / type / required / description
- Sourced from current `SchemaEditor` logic

### 4.9 DAG Configuration Panel (`components/api-crawler/DagPanel.tsx`)
- Width 300px, right slide-in panel, `--bg-surface`, left border  
- Header: "DAG Configuration" + "Save Crawler" button
- Fields: Crawler Name, Schedule (cron), Output Format, Output Path, Retries, Timeout, Tags
- Sourced from current `DagConfigPanel` logic

---

## 5. Page Layout (`app/api-crawler/page.tsx`)

```
<div flex-row h-full>
  <ActivityBar />                          // 44px
  {collectionsOpen && <CollectionsTree />} // 240px
  <div flex-col flex-1>
    <RequestBreadcrumb />                  // 36px
    <EndpointBar />                        // 48px
    <div flex-col flex-1 overflow-hidden>
      <RequestTabs />                      // ~200px min
      <ResponsePanel />                    // flex-1
    </div>
  </div>
  {rightPanel && <SchemaPanel|DagPanel />} // 300px
  <RightIconBar />                         // 44px
</div>
```

The page is self-contained (no `<Header>` imported from layout — header is replaced by the breadcrumb bar).

---

## 6. Mock Data (`data/mockCollections.ts`)

```ts
type CollectionNode =
  | { kind: "collection"; id: string; name: string; children: CollectionNode[] }
  | { kind: "folder";     id: string; name: string; children: CollectionNode[] }
  | { kind: "request";    id: string; name: string; method: HttpMethod; requestId: string }
```

Two top-level collections (e.g. "tMIC Market Data" and "Social Intelligence"), each with 2 folders and 3–4 request leaves referencing existing `mockCrawlers` requests by `requestId`.

---

## 7. CSS Changes (`app/globals.css`)

- Replace full colour palette with professional dark values (section 3)
- Remove bright/vivid colour references  
- Keep existing animation classes (`fade-in`, `count-animation`, etc.)
- Add `.method-get`, `.method-post`, etc. utility classes for method badges

---

## 8. Files Changed

| File | Action |
|---|---|
| `app/api-crawler/page.tsx` | Full rewrite |
| `app/globals.css` | Palette swap + method badge classes |
| `components/api-crawler/ActivityBar.tsx` | New |
| `components/api-crawler/CollectionsTree.tsx` | New |
| `components/api-crawler/RequestBreadcrumb.tsx` | New |
| `components/api-crawler/RequestTabs.tsx` | New (merges ParamsEditor + AuthEditor) |
| `components/api-crawler/ResponsePanel.tsx` | New (replaces ResponseViewer) |
| `components/api-crawler/RightIconBar.tsx` | New |
| `components/api-crawler/SchemaPanel.tsx` | New (wraps SchemaEditor) |
| `components/api-crawler/DagPanel.tsx` | New (wraps DagConfigPanel) |
| `components/api-crawler/EndpointBar.tsx` | Refactor (style update) |
| `data/mockCollections.ts` | New |
| `lib/types.ts` | Add `CollectionNode` type |

Old files (`ParamsEditor.tsx`, `AuthEditor.tsx`, `ResponseViewer.tsx`, `DagConfigPanel.tsx`, `SchemaEditor.tsx`) are kept in place but no longer imported from the page — they become dead code to be cleaned up later.

---

## 9. Out of Scope (Phase 1)

- Environments panel (icon present but disabled)
- History panel (icon present but disabled)  
- Real persistence (save is mock)
- Drag-and-drop reordering in Collections tree
- Right-click context menus
- Tabs for multiple open requests (like Postman tabs bar)
