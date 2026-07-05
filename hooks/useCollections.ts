// hooks/useCollections.ts
"use client";

import { useState, useCallback } from "react";
import type { CollectionNode, MockRequest } from "@/lib/types";
import { mockCollections, mockRequests } from "@/data/mockCollections";

const LS_COLLECTIONS = "tmic-collections";
const LS_REQUESTS    = "tmic-requests";

function loadUserCollections(): CollectionNode[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_COLLECTIONS) ?? "[]"); }
  catch { return []; }
}

function loadUserRequests(): Record<string, MockRequest> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_REQUESTS) ?? "{}"); }
  catch { return {}; }
}

function saveUserCollections(nodes: CollectionNode[]) {
  localStorage.setItem(LS_COLLECTIONS, JSON.stringify(nodes));
}

function saveUserRequests(reqs: Record<string, MockRequest>) {
  localStorage.setItem(LS_REQUESTS, JSON.stringify(reqs));
}

function makeBlankRequest(id: string, name: string, description?: string): MockRequest {
  return {
    config: {
      id,
      name,
      description: description ?? "",
      method: "GET",
      url: "",
      queryParams: [],
      pathParams: [],
      headers: [],
      bodyType: "none",
      bodyJson: "",
      auth: { type: "none" },
    },
    mockResponse: { status: 0, statusText: "", headers: {}, body: null, durationMs: 0 },
    schema: [],
    dagConfig: {
      crawlerName: "",
      schedule: "0 6 * * *",
      outputFormat: "json",
      outputPath: "s3://tmic-data/",
      tags: [],
      retries: 3,
      timeoutSeconds: 60,
    },
  };
}

export function useCollections() {
  const [userCollections, setUserCollections] = useState<CollectionNode[]>(loadUserCollections);
  const [userRequests, setUserRequests] = useState<Record<string, MockRequest>>(loadUserRequests);

  const collections: CollectionNode[] = [...mockCollections, ...userCollections];
  const requests: Record<string, MockRequest> = { ...mockRequests, ...userRequests };

  const addCollection = useCallback((name: string): string => {
    const id = `col-${Date.now()}`;
    const node: CollectionNode = { kind: "collection", id, name, children: [] };
    setUserCollections((prev) => {
      const next = [...prev, node];
      saveUserCollections(next);
      return next;
    });
    return id;
  }, []);

  const addFolder = useCallback((collectionId: string, name: string): string => {
    const id = `folder-${Date.now()}`;
    const folderNode: CollectionNode = { kind: "folder", id, name, children: [] };
    setUserCollections((prev) => {
      const next = prev.map((col) => {
        if (col.kind !== "collection" || col.id !== collectionId) return col;
        return { ...col, children: [...col.children, folderNode] };
      });
      saveUserCollections(next);
      return next;
    });
    return id;
  }, []);

  const addRequest = useCallback((parentId: string, requestName: string, description?: string): string => {
    const requestId = `req-${Date.now()}`;
    const treeNode: CollectionNode = {
      kind: "request",
      id: `node-${Date.now()}`,
      name: requestName,
      method: "GET",
      requestId,
    };
    const blank = makeBlankRequest(requestId, requestName, description);

    setUserCollections((prev) => {
      function insertInto(nodes: CollectionNode[]): CollectionNode[] {
        return nodes.map((n) => {
          if (n.id === parentId && (n.kind === "collection" || n.kind === "folder")) {
            return { ...n, children: [...n.children, treeNode] };
          }
          if (n.kind === "collection" || n.kind === "folder") {
            return { ...n, children: insertInto(n.children) };
          }
          return n;
        });
      }
      const next = insertInto(prev);
      saveUserCollections(next);
      return next;
    });

    setUserRequests((prev) => {
      const next = { ...prev, [requestId]: blank };
      saveUserRequests(next);
      return next;
    });

    return requestId;
  }, []);

  const saveRequest = useCallback((requestId: string, data: Partial<MockRequest>) => {
    setUserRequests((prev) => {
      const existing = prev[requestId] ?? requests[requestId];
      if (!existing) return prev;
      const next = { ...prev, [requestId]: { ...existing, ...data } };
      saveUserRequests(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { collections, requests, addCollection, addFolder, addRequest, saveRequest };
}
