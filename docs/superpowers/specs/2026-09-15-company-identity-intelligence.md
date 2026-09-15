# Company Identity Intelligence — Design Spec

**Date:** 2026-09-15
**Feature:** New `/company-identity` tab in tMIC Workspace — TSMC supply-chain Company Identity Graph
**Status:** Implemented (not pushed to origin — see note at bottom)

---

## 1. Goal

Give the existing `CompanyMaster` / `ProviderRecord` data a graph-shaped, explainable
consumption layer, modeled after the open-source [Semantica](https://github.com/semantica-agi/semantica)
project's "Knowledge Explorer" workspace names: Knowledge Graph, Timeline, Decisions,
Registry, Entity Resolution, Ontology Hub, Lineage. MVP scope: ~100 companies in
TSMC's upstream/downstream semiconductor supply chain.

This is **not** an adoption of the Semantica Python package — it's our own
implementation of the same conceptual model (entity → evidence → provenance →
decision), built directly on the existing SQLAlchemy/FastAPI/Next.js stack.

## 2. Scope

- Extends `CompanyMaster` (59 existing seed companies) with 58 more, reaching 98 total
- New `SupplyChainEdge` table: one row per company's relationship to TSMC
  (category + edge_type + confidence + source), **and** doubles as the Timeline's
  event log via optional `valid_from`/`event_label` columns — no separate temporal
  table
- New `IdentityDecision` and `ResolutionCandidate` tables back the Decisions and
  Entity Resolution workspaces with real, mutable data (PATCH on resolution status
  actually persists)
- Ontology Hub is a static schema definition (node types / edge types / SHACL-style
  rules) — it's a schema, not instance data, so it doesn't need a DB table
- Registry has no dedicated backend model — it's the same `/companies` list as
  Knowledge Graph, rendered as a table instead of a graph (confirmed against the
  real Semantica repo: its Registry workspace isn't backed by a named module either)

## 3. Data Model

### New tables (`backend/app/database.py`)

| Table | Key columns |
|---|---|
| `supply_chain_edge` | `source_fab_code`, `target_fab_code`, `category`, `edge_type`, `confidence`, `source`, `valid_from`, `valid_until`, `event_label` |
| `identity_decision` | `id` (e.g. `RES-00182`), `category`, `scenario`, `reasoning`, `outcome`, `confidence`, `model` |
| `resolution_candidate` | `fab_code_a`, `fab_code_b`, `suggested_relation`, `note`, `evidence` (JSON list), `status` (`pending`/`confirmed`/`rejected`) |

Seed data lives in `backend/app/seed_supply_chain.py`, following the same
`load_xxx() -> list[dict]` interface as the existing `seed_companies.py`.

### API (`backend/app/routers/company_identity.py`, prefix `/api/company-identity`)

| Endpoint | Notes |
|---|---|
| `GET /companies` | Knowledge Graph + Registry |
| `GET /edges/timeline` | Only edges with `valid_from` set |
| `GET /decisions` | |
| `GET /resolution-queue` / `PATCH /resolution-queue/{id}` | confirm/reject actually persists |
| `GET /ontology` | static, no DB |
| `GET /lineage/{fab_code}` | combines `SupplyChainEdge.source` with any existing `ProviderRecord` rows |

### Frontend

- `app/company-identity/page.tsx` + `components/company-identity/*`
- Knowledge Graph uses the **existing** `@xyflow/react` dependency (already used by
  Prompt Chain Studio) with a computed radial-by-category layout — no force-directed
  physics library added. `ponytail:` ceiling noted in `GraphView.tsx`: this layout
  gets crowded well before ~300 nodes; a real force-directed layout would be the
  upgrade path past that.
- `lib/companyIdentityClient.ts` follows the existing dual-mode pattern
  (`studioClient.ts` / `backendFallback.ts`): falls back to
  `data/mockCompanyIdentity.ts` when no FastAPI backend is reachable, so the tab
  still works on the GitHub Pages static deployment. The fallback dataset is
  generated from the same Python seed source, not hand-transcribed, so the two
  can't drift apart silently.

## 4. Verification

- `backend/selfcheck.py` (extended, not a new test framework — matches existing
  repo convention): companies count, TSMC-is-hub, resolution PATCH persists,
  ontology rule count, timeline event count. Run with `python3 selfcheck.py`
  from `backend/`.
- `npx tsc --noEmit` — clean
- `npx eslint` on all new files — clean (caught and fixed one real
  `react-hooks/set-state-in-effect` issue in `DetailPanel.tsx`)
- `npm run build` — static export succeeds, `/company-identity` appears
  alongside the existing routes

## 5. Known gaps / next steps

- Not pushed to `origin` — this was built in a sandboxed environment with no
  GitHub write credentials. Review the `feature/company-identity-intelligence`
  branch and push manually.
- Entity Resolution / Decisions are seeded once and otherwise static except for
  the confirm/reject PATCH — there's no real NER/matching pipeline behind them
  yet. That's the next real engineering step if this MVP is approved to go
  further (see the earlier Python pipeline skeleton discussion for what that
  pipeline could look like).
- No auth on the new endpoints — matches the rest of the backend's current state
  (no auth anywhere yet), not a regression introduced by this feature.
