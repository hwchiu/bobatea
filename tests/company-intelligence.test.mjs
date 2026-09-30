import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = path.join(import.meta.dirname, "..");
const directory = JSON.parse(fs.readFileSync(path.join(root, "public/company-directory.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "lib/companyIntelligenceClient.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function client(fetch) {
  const exports = {};
  const dependencies = {
    "./apiClient": { API_BASE: "https://example.invalid" },
    "./backendFallback": {
      isMissingBackendResponse: (res) => res.status === 404,
      isUnavailableBackendError: (error) => error instanceof TypeError,
    },
  };
  new Function("require", "exports", "fetch", "AbortSignal", compiled)(
    (name) => dependencies[name], exports, fetch, AbortSignal,
  );
  return exports.companyIntelligenceApi;
}

test("unavailable backend returns multiple provider-mapped name results, but not ID matches", async () => {
  const api = client(async (url) => {
    if (url.endsWith("/company-directory.json")) return { ok: true, json: async () => directory };
    throw new TypeError("Failed to fetch");
  });
  for (const provider of ["bloomberg", "dnb", "pitchbook", "factset", "snp", "contify"]) {
    const matches = await api.search("a", provider);
    assert(matches.some((company) => company.shortName === "Apple"));
    assert(matches.some((company) => company.shortName === "AMD"));
    assert(matches.every((company) => company.identities[0].providerId === provider));
  }
  assert.equal((await api.search("  apple  ", "bloomberg"))[0].name, "Apple Inc.");
  assert.equal((await api.search("amd", "bloomberg"))[0].shortName, "AMD");
  assert.deepEqual(await api.search("DEMO-BBG-AAPL", "bloomberg"), []);
});

test("live mappings filter by name or short name and keep one card per matched company", async () => {
  const master = [
    { fab_code: "ONE", company_name: "Acme One", company_short_name: "A1" },
    { fab_code: "TWO", company_name: "Acme Two", company_short_name: "A2" },
  ];
  const mappings = [
    { fab_code: "ONE", bbg_id: "BBG1" },
    { fab_code: "TWO", bbg_id: "BBG2" },
  ];
  const api = client(async (url) => ({
    ok: true, json: async () => url.endsWith("/company-master") ? master : mappings,
  }));
  assert.deepEqual((await api.search("acme", "bloomberg")).map((c) => c.fabCode), ["ONE", "TWO"]);
  assert.deepEqual((await api.search("a2", "bloomberg")).map((c) => c.fabCode), ["TWO"]);
  assert.deepEqual(await api.search("BBG1", "bloomberg"), []);
});
