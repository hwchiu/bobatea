# New Collection Feature — Design Spec

**Date:** 2026-06-13  
**Feature:** New Collection / Folder creation popup in tMIC Workspace `/api-crawler`  
**Status:** Approved

---

## 1. Goal

Allow users to create new Collections and Folders in the API Crawler's Collections tree without touching code. A blank API Request is automatically created inside the new container and opened for editing. Users then configure the request in the editor and save it via the existing Save button.

---

## 2. Scope

- `+` button in the CollectionsTree header opens a modal
- Modal creates a **Collection** (top-level) or **Folder** (nested inside an existing Collection)
- A named blank Request is auto-created inside the new container and opened in the editor
- Request details are **not** set in the popup — they are configured in the editor and saved via the Save button in `RequestBreadcrumb`
- All user-created data is persisted to **localStorage** (`tmic-collections` key for tree; `tmic-requests` key for request configs)
- Static `mockCollections` remain read-only and are merged with user-created nodes at runtime

---

## 3. Data Model

### localStorage keys

| Key | Contents |
|---|---|
| `tmic-collections` | `CollectionNode[]` — user-created collections/folders/requests (tree nodes only, no config) |
| `tmic-requests` | `Record<string, MockRequest>` — full request configs for user-created requests |

### Blank Request skeleton

When `addRequest` is called, the hook creates a `MockRequest` with:

```ts
{
  config: {
    id: `req-${Date.now()}`,
    name: <user-supplied name>,
    method: "GET",
    url: "",
    queryParams: [], pathParams: [], headers: [],
    bodyType: "none", bodyJson: "",
    auth: { type: "none" },
  },
  mockResponse: { status: 0, statusText: "", headers: {}, body: null, durationMs: 0 },
  schema: [],
  dagConfig: {
    crawlerName: "", schedule: "0 * * * *", outputFormat: "json",
    outputPath: "", tags: [], retries: 3, timeoutSeconds: 60,
  },
}
```

---

## 4. `useCollections` Hook

**File:** `hooks/useCollections.ts`

```ts
interface UseCollectionsReturn {
  collections: CollectionNode[]                                       // merged static + user
  requests: Record<string, MockRequest>                               // merged static + user
  addCollection(name: string): string                                 // returns collectionId
  addFolder(collectionId: string, name: string): string               // returns folderId
  addRequest(parentId: string, requestName: string): string           // returns requestId
  saveRequest(requestId: string, data: Partial<MockRequest>): void    // persists full config
}
```

**Init logic:**
1. Load `tmic-collections` from localStorage → parse as `CollectionNode[]`, default `[]`
2. Load `tmic-requests` from localStorage → parse as `Record<string, MockRequest>`, default `{}`
3. Merge: `[...mockCollections, ...userCollections]` and `{ ...mockRequests, ...userRequests }`

**Persistence:** every mutating method updates state and writes the full user-created portion back to localStorage.

---

## 5. `NewItemModal` Component

**File:** `components/api-crawler/NewItemModal.tsx`

### Props
```ts
interface NewItemModalProps {
  collections: CollectionNode[]     // for parent picker
  onClose: () => void
  onCreate: (type: "collection" | "folder", parentId: string | null, containerName: string, requestName: string) => void
}
```

### Layout (single screen, 420px wide modal)

1. **Header** — `"New Collection"` or `"New Folder"` title (updates with type selection)
2. **Type segmented control** — `Collection` | `Folder`
3. **Parent picker** *(Folder only)* — scrollable mini-tree (max-height 160px) listing existing Collections. Click to select (accent highlight). Required for Folder creation.
4. **Container name input** — labelled `"Collection name"` / `"Folder name"`, required, autofocused
5. **Request name input** — labelled `"Initial request name"`, default value `"New Request"`
6. **Footer** — `Cancel` (ghost button) + `Create` (accent button, disabled when container name empty or Folder with no parent selected)

### Behaviour
- Backdrop click or `Escape` key → `onClose()`
- Create click → calls `onCreate(...)` → `onClose()`

---

## 6. `CollectionsTree` Changes

- Remove hardcoded `mockCollections` import
- Add props: `collections: CollectionNode[]`, `onAdd: () => void`
- `+` button calls `onAdd()`
- Tree renders from `collections` prop

---

## 7. `page.tsx` Integration

- Replace `mockCollections` / `mockRequests` with `useCollections()` hook
- Add `showNewItemModal: boolean` state
- Pass `collections` and `requests` from hook to child components
- `RequestBreadcrumb` Save button calls `saveRequest(activeRequestId, currentEditorState)` — making Save functional for user-created requests
- On modal `onCreate`:
  1. Call `addCollection(name)` or `addFolder(collectionId, name)` → get `parentId`
  2. Call `addRequest(parentId, requestName)` → get `requestId`
  3. Call `onSelectRequest(requestId)` to open blank editor
  4. Close modal

---

## 8. User Flow

```
User clicks "+" in Collections panel header
  → NewItemModal opens
  → User selects type (Collection or Folder)
  → If Folder: user picks parent collection from mini-tree
  → User types container name + optionally renames initial request
  → Clicks "Create"
  → New container appears in tree (expanded)
  → Blank request opens in editor (URL empty, GET, all fields blank)
  → User configures URL / params / headers / body / schema / DAG
  → Clicks "Save" in RequestBreadcrumb
  → Request config persisted to localStorage
```

---

## 9. Files Changed / Created

| File | Action |
|---|---|
| `hooks/useCollections.ts` | Create |
| `components/api-crawler/NewItemModal.tsx` | Create |
| `components/api-crawler/CollectionsTree.tsx` | Modify (accept props, wire `onAdd`) |
| `app/api-crawler/page.tsx` | Modify (use hook, render modal, wire Save) |
| `lib/types.ts` | No change needed |
| `data/mockCollections.ts` | No change needed |
