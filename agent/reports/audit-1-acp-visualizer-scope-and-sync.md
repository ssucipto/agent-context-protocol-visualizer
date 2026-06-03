# Audit Report: ACP Visualizer — Implementation Scope, ACP Enhanced Relationship & Sync Strategy

**Audit**: #1  
**Date**: 2026-06-03  
**Subject**: The ACP Progress Visualizer — what it does, how it relates to ACP Enhanced, how to keep them in sync, and what's next  

## Summary

The **ACP Progress Visualizer** is a TanStack Start (React SSR) web dashboard that consumes ACP Enhanced's `agent/progress.yaml` and renders it as an interactive UI. It is itself an ACP Enhanced project — it has the full `agent/` directory structure, 63 commands, routing, and memory. The relationship is **consumer-producer**: ACP Enhanced projects produce `progress.yaml`; the visualizer reads and displays it. The two must stay schema-aligned. This audit identifies the current state, gaps, and a sync strategy.

## Files Analyzed

| File | Type | Relevance |
|------|------|-----------|
| `src/lib/types.ts` | source | TypeScript schema — the contract for progress.yaml consumption |
| `src/lib/yaml-loader.ts` | source | Parses progress.yaml → typed ProgressData via js-yaml |
| `src/lib/yaml-loader.test.ts` | test | Unit tests for YAML parsing with fixture data |
| `src/lib/data-source.ts` | source | React hook: fetch + 2s mtime polling → auto-refresh |
| `src/lib/search.ts` | source | fuse.js index builder for client-side fuzzy search |
| `server/routes/api/progress.ts` | source | Server function: reads progress.yaml from disk |
| `server/routes/api/watch.ts` | source | Server function: stats file mtime for poll-based refresh |
| `src/routes/index.tsx` | source | Home page — ProjectHeader, OverallProgress, NextSteps |
| `src/routes/milestones.tsx` | source | Milestones page — table/tree toggle, status filtering |
| `src/routes/search.tsx` | source | Search page — fuse.js query with URL search params |
| `src/components/MilestoneTable.tsx` | source | Sortable milestone table (TanStack Table) |
| `agent/progress.yaml` | data | The data source — currently minimal/outdated |
| `test/fixtures/sample-progress.yaml` | test | Richer fixture with multiple milestones and tasks |
| `agent/core/identity.yml` | config | Project identity (visualizer) |
| `AGENTS.md` | config | Context loading protocol + Who You Are |
| `agent/memory/decisions.md` | memory | ADRs: TanStack Start, YAML format, polling strategy |
| `agent/wiki/architecture.md` | wiki | Visualizer architecture: server fns → hook → components |

## Key Findings

| # | Finding | Location | Severity |
|---|---------|----------|----------|
| F1 | **Schema gap**: `progress.yaml` has `current_blockers: []` but TypeScript types (`ProgressData`) do not define `current_blockers` | `agent/progress.yaml:18` vs `src/lib/types.ts` | Medium |
| F2 | **Live data is stale**: The local `agent/progress.yaml` is a bootstrap stub — M25 shows completed but has no tasks, no recent_work, no notes. Doesn't represent actual development history | `agent/progress.yaml` | High |
| F3 | **No deployment**: The visualizer runs locally (`npm run dev`) but has no production deployment. README mentions Vercel but no deploy config exists | `vite.config.ts`, `README.md` | Medium |
| F4 | **ACP Enhanced schema drift risk**: If ACP Enhanced adds/renames fields in `progress.yaml` (e.g., v6.8.2 added `context_modes`), the visualizer's TypeScript types may silently ignore them or break | `src/lib/types.ts` | High |
| F5 | **No schema validation**: `yaml-loader.ts` uses `as` type assertions without runtime validation (no Zod/schema check). Malformed YAML produces runtime errors, not clear parse failures | `src/lib/yaml-loader.ts:15-27` | Medium |
| F6 | **Single-project view**: The visualizer reads one `progress.yaml` at a time. It cannot view multiple ACP projects simultaneously (listed as P1 in next_steps) | `server/routes/api/progress.ts:5` | Low (P1 feature) |
| F7 | **No deploy/CI pipeline**: No GitHub Actions, no Vercel config, no build verification in CI. Push-to-deploy is not set up | `.github/` (only copilot-instructions.md) | Medium |
| F8 | **Test coverage thin**: Only `yaml-loader.test.ts` has tests. Components, hooks, and server functions have no tests | `src/lib/yaml-loader.test.ts` | Medium |

## Key Decisions

- **ADR-001**: TanStack Start chosen for SSR + server functions — enables reading YAML from disk without a separate API server
- **ADR-002**: YAML as the native data format — no JSON transformation; reads ACP Enhanced's progress.yaml directly
- **ADR-003**: Polling-based auto-refresh (mtime every 2s) over WebSocket — simpler, works on Vercel serverless

## Code Pointers

| Location | Description |
|----------|-------------|
| `src/lib/types.ts:1-25` | ProgressData, Milestone, Task, WorkEntry, ProjectMetadata interfaces |
| `src/lib/yaml-loader.ts:4-32` | parseProgressYaml — YAML → typed objects with ID injection |
| `src/lib/data-source.ts:12-60` | useProgressData hook — fetch + 2s polling loop |
| `server/routes/api/progress.ts:1-25` | fetchProgress server function — readFileSync + parse |
| `server/routes/api/watch.ts:1-27` | fetchWatchToken — statSync for mtime polling |
| `src/routes/milestones.tsx:1-40` | Table|Tree tabs + StatusFilter integration |
| `src/routes/search.tsx:1-35` | fuse.js search with URL query param |
| `agent/progress.yaml:1-18` | Current (stale) progress data |

## Git History

| Date | Commit | Summary |
|------|--------|---------|
| 2026-06-03 | `936ba37` | Dashboard shell + sidebar layout (latest) |
| 2026-06-03 | `e913c3d` | Search + status filter |
| 2026-06-03 | `e86406d` | Milestone tree view with expand/collapse + Table\|Tree tabs |
| 2026-06-03 | `9c49ba6` | Milestone table view with sort + status/progress components |
| 2026-06-03 | `c762eec` | Server functions + data-source hook + live index route |
| 2026-06-03 | `c0ac3bc` | YAML parser + TypeScript data model |
| 2026-06-03 | `155cef2` | Bootstrap TanStack Start + Tailwind (M25 task-137) |
| 2026-06-03 | `7fec16e` | Initial commit |

All commits are from a single day — the MVP was built in a focused sprint.

## ACP Enhanced Relationship & Sync Strategy

### Relationship Model

```
ACP Enhanced (ssucipto/acp-enhanced)
  │
  ├─ Defines progress.yaml schema
  ├─ Produces progress.yaml for ACP-managed projects
  │
  └─── ACP Progress Visualizer (this repo)
        ├─ Consumes progress.yaml
        ├─ Is itself an ACP Enhanced project (has agent/)
        └─ Renders: table, tree, search, filter
```

### Sync Contract

The visualizer depends on ACP Enhanced at exactly one touchpoint: the **progress.yaml schema**. These fields are the contract:

| progress.yaml field | Visualizer type | Critical? |
|---|---|---|
| `project.name`, `.version`, `.status`, `.current_milestone` | `ProjectMetadata` | Yes |
| `milestones.<id>.name`, `.status`, `.progress`, `.tasks_*` | `Milestone` | Yes |
| `tasks.<milestoneId>[]` | `Task[]` | Yes |
| `recent_work` | `WorkEntry[]` | No (optional, defaults to `[]`) |
| `next_steps` | `string[]` | No |
| `current_blockers` | **NOT IN TYPES** | Schema gap (F1) |

### Sync Recommendations

1. **Schema version pin**: Add a `progress_yaml_schema_version` field to `agent/core/identity.yml` that tracks which ACP Enhanced version's schema the visualizer was last verified against
2. **Schema test**: Add a test that validates the visualizer's TypeScript types against a known-good ACP Enhanced progress.yaml fixture from the latest ACP Enhanced release
3. **Periodic re-verification**: After every `/acp-version-update`, re-run schema tests to catch drift
4. **Upstream awareness**: Watch ACP Enhanced's CHANGELOG for `progress.yaml` schema changes

## Recommendations

1. **Fix schema gap (F1)**: Add `current_blockers: string[]` to `ProgressData` type and update `yaml-loader.ts` to parse it from the YAML document root
2. **Add Zod validation (F5)**: Replace `as` type assertions in `yaml-loader.ts` with Zod schemas. This gives clear parse errors and guards against upstream schema changes
3. **Regenerate progress.yaml (F2)**: Run `/acp-update` or manually populate `agent/progress.yaml` with the actual M25 task list (tasks 137-143) and mark them completed. This makes the dashboard show real data
4. **Set up deployment (F3, F7)**: Add Vercel config (`vercel.json`), set `PROGRESS_YAML_PATH` env var, and create a GitHub Action for CI (lint + test + build)
5. **Schema sync test**: Create `test/fixtures/acp-enhanced-progress.yaml` from the latest ACP Enhanced release and add a test that validates the visualizer parses it correctly
6. **Add component tests (F8)**: Write Vitest tests for MilestoneTable, FilterBar, SearchBar, and the useProgressData hook
7. **Multi-project support (F6)**: This is a P1 feature — design a `PROGRESS_YAML_PATHS` env var that accepts a glob or comma-separated list to render multiple projects in tabs
