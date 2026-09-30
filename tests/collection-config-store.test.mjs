// Checks that one company+provider can hold several data categories, which is what the
// Company Search coverage badge ("已蒐集 2 / 3") counts.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = path.join(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "lib/collectionConfigStore.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function store() {
  const data = new Map();
  globalThis.window = { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };
  globalThis.Event = class {};
  globalThis.localStorage = {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  };
  const exports = {};
  new Function("exports", "require", compiled)(exports, (id) => {
    if (id === "react") return { useSyncExternalStore: () => [] };
    throw new Error(`unexpected import ${id}`);
  });
  return exports.collectionConfigStore;
}

test("entries are keyed by company, provider and category", () => {
  const configStore = store();
  const base = { fabCode: "FAB-1", companyName: "Acme", providerId: "dnb", providerLabel: "D&B", identifier: "652063688" };
  configStore.add({ ...base, dataset: "Company Profile" });
  configStore.add({ ...base, dataset: "Company Filings" });
  configStore.add({ ...base, dataset: "Company Filings" });

  const datasets = JSON.parse(localStorage.getItem("tmic-collection-config")).map((e) => e.dataset);
  assert.deepEqual(datasets, ["Company Profile", "Company Filings"]);
});
