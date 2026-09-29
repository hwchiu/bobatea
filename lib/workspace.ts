// lib/workspace.ts — tMIC Workspace switch: "Platform Operations" (DevOps) ↔ "Company Intelligence" (BIZ)
"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  Code2, Sparkles, Building2, Briefcase, Settings,
  Search, ClipboardList, type LucideIcon,
} from "lucide-react";

export type WorkspaceId = "platform-ops" | "company-intel";

const STORAGE_KEY = "tmic-workspace";
const CHANGE_EVENT = "tmic-workspace-change";

export interface NavItem { path: string; icon: LucideIcon; label: string }

export interface WorkspaceDef {
  id: WorkspaceId;
  label: string;
  description: string;
  icon: LucideIcon;
  homePath: string;      // landing page when switching into this workspace
  ownPaths: string[];    // paths that uniquely belong to this workspace (used for auto-detect)
  nav: NavItem[];
  navCompact: NavItem[]; // curated subset for the mobile bottom nav (limited width)
}

export const WORKSPACES: WorkspaceDef[] = [
  {
    id: "platform-ops",
    label: "Platform Operations",
    description: "System & provider settings",
    icon: Settings,
    homePath: "/api-crawler",
    ownPaths: ["/api-crawler", "/ai-crawler", "/company-identity", "/settings"],
    nav: [
      { path: "/api-crawler", icon: Code2, label: "API Crawler" },
      { path: "/ai-crawler", icon: Sparkles, label: "AI Crawler" },
      { path: "/company-identity", icon: Building2, label: "Company Identity" },
      { path: "/jobs", icon: Briefcase, label: "My Jobs" },
      { path: "/settings", icon: Settings, label: "Settings" },
    ],
    navCompact: [
      { path: "/api-crawler", icon: Code2, label: "API Crawler" },
      { path: "/company-identity", icon: Building2, label: "Company Identity" },
      { path: "/jobs", icon: Briefcase, label: "My Jobs" },
      { path: "/settings", icon: Settings, label: "Settings" },
    ],
  },
  {
    id: "company-intel",
    label: "Company Intelligence",
    description: "Search, configure & collect",
    icon: Search,
    homePath: "/company-search",
    ownPaths: ["/company-search", "/collection-config"],
    nav: [
      { path: "/company-search", icon: Search, label: "Company Search" },
      { path: "/collection-config", icon: ClipboardList, label: "Collection Config" },
      { path: "/jobs", icon: Briefcase, label: "Job Center" },
    ],
    navCompact: [
      { path: "/company-search", icon: Search, label: "Company Search" },
      { path: "/collection-config", icon: ClipboardList, label: "Collection Config" },
      { path: "/jobs", icon: Briefcase, label: "Job Center" },
    ],
  },
];

export function getWorkspace(id: WorkspaceId): WorkspaceDef {
  return WORKSPACES.find((w) => w.id === id) ?? WORKSPACES[0];
}

/** Paths that unambiguously belong to exactly one workspace (excludes shared routes like /jobs). */
function detectWorkspaceFromPath(pathname: string): WorkspaceId | null {
  for (const ws of WORKSPACES) {
    if (ws.ownPaths.some((p) => pathname.startsWith(p))) return ws.id;
  }
  return null;
}

function getStoredWorkspace(): WorkspaceId {
  if (typeof window === "undefined") return "platform-ops";
  return localStorage.getItem(STORAGE_KEY) === "company-intel" ? "company-intel" : "platform-ops";
}

function getServerWorkspace(): WorkspaceId {
  return "platform-ops";
}

export function setStoredWorkspace(id: WorkspaceId): void {
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Active workspace for the current page — auto-syncs storage on hard navigation to a uniquely-owned route. */
export function useActiveWorkspace(pathname: string): WorkspaceId {
  const stored = useSyncExternalStore(subscribe, getStoredWorkspace, getServerWorkspace);
  const detected = detectWorkspaceFromPath(pathname);

  useEffect(() => {
    if (detected && detected !== stored) setStoredWorkspace(detected);
  }, [detected, stored]);

  return detected ?? stored;
}
