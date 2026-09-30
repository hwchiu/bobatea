// lib/collectionConfigStore.ts — client-only persistence for the BIZ Collection Config list.
// ponytail: there is no backend "collection config" API yet, so entries + run status live in
// localStorage only (single browser, no cross-device sync). Upgrade path: once a
// `/api/collection-config` + job-trigger endpoint exists, swap `read`/`write` for real requests
// and keep the same CollectionEntry shape / store surface so CollectionConfigWorkspace is unchanged.
"use client";

import { useSyncExternalStore } from "react";
import type { CollectionEntry } from "./companyIntelligenceTypes";

const STORAGE_KEY = "tmic-collection-config";
const CHANGE_EVENT = "tmic-collection-config-change";

let cachedEntries: CollectionEntry[] | null = null;

function readFromStorage(): CollectionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// getSnapshot must return a referentially-stable value when nothing changed, otherwise
// useSyncExternalStore re-renders forever — cache the parsed array and only re-parse when
// `write()` (this tab) or a "storage" event (another tab) actually changes it.
function read(): CollectionEntry[] {
  if (cachedEntries === null) cachedEntries = readFromStorage();
  return cachedEntries;
}

function write(entries: CollectionEntry[]): void {
  cachedEntries = entries;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = () => { cachedEntries = null; onChange(); };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Live-updating list of configured collection entries. */
export function useCollectionConfig(): CollectionEntry[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

export const collectionConfigStore = {
  add(entry: Omit<CollectionEntry, "id" | "status" | "addedAt">): CollectionEntry {
    const id = `${entry.fabCode}::${entry.providerId}::${entry.dataset}`;
    const existing = read();
    const already = existing.find((e) => e.id === id);
    if (already) return already;
    const full: CollectionEntry = { ...entry, id, status: "ready", addedAt: new Date().toISOString() };
    write([...existing, full]);
    return full;
  },

  update(id: string, entry: Omit<CollectionEntry, "id" | "status" | "addedAt">): boolean {
    const existing = read();
    const fabCode = entry.fabCode.startsWith("manual:") ? `manual:${entry.providerId}:${entry.identifier}` : entry.fabCode;
    const nextId = `${fabCode}::${entry.providerId}::${entry.dataset}`;
    if (existing.some((e) => e.id === nextId && e.id !== id)) return false;
    write(existing.map((e) => e.id === id ? { ...e, ...entry, fabCode, id: nextId } : e));
    return true;
  },

  remove(id: string): void {
    write(read().filter((e) => e.id !== id));
  },

  setStatus(ids: string[], status: CollectionEntry["status"]): void {
    write(read().map((e) => (ids.includes(e.id) ? { ...e, status } : e)));
  },
};
