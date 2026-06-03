# Audit Report: M26-M28 Plan — Final Gap Check (Local Tool Focus)

**Audit**: #3  
**Date**: 2026-06-03  
**Subject**: Pre-implementation audit of revised M26-M28 — remaining bugs, gaps, and inconsistencies for a local-only visualization tool  

## Summary

The revised M26-M28 plan is solid. However, this audit surfaces **3 bugs** in the current codebase that the plan doesn't address, **2 gaps** in the plan, and **1 inconsistency**. One bug is critical: the visualizer cannot parse ACP Enhanced's real progress.yaml today because `status: active` is not a valid ProjectMetadata status.

## Key Findings

| # | Finding | Severity | In Plan? |
|---|---------|----------|----------|
| B1 | **`ProjectMetadata.status` rejects `'active'`**: ACP Enhanced uses `status: active`, but visualizer types only allow `'in_progress' \| 'completed' \| 'not_started'`. Parsing the real ACP Enhanced progress.yaml would produce a TypeScript type error | 🔴 Critical | ❌ Not in plan |
| B2 | **`StatusBadge` has no color for `'active'`**: Even if B1 is fixed, the badge component's `COLORS` map has no `active` key. Would fall back to gray `not_started` style | 🟡 Medium | ❌ Not in plan |
| B3 | **`FilterBar` has no `'active'` option**: Users can't filter milestones/projects by `active` status | 🟡 Medium | ❌ Not in plan |
| G1 | **No `package.json` `bin` or `files` entry**: For a local tool distributed via npm, there's no `bin` script for `npx acp-visualizer` and no `files` whitelist. This blocks the P2 roadmap item | 🟡 Medium | ❌ Not in plan |
| G2 | **No `.npmignore` or `files` field**: `npm pack` would include `agent/`, `test/`, `node_modules/` — bloating the package. A local tool distributed via npm needs this | 🟢 Low | ❌ Not in plan |
| I1 | **`current_milestone` value inconsistency**: Visualizer's own progress.yaml uses `M25-complete` (non-standard), while ACP Enhanced uses `M45` (standard milestone ID). The visualizer doesn't validate this field | 🟢 Low | ❌ Not in plan |

## Bug Deep-Dives

### B1 — Critical: `status: active` rejected by types

**Source**: ACP Enhanced `agent/progress.yaml` line 7:
```yaml
project:
  status: active
```

**Visualizer type** (`src/lib/types.ts:12`):
```typescript
status: 'in_progress' | 'completed' | 'not_started';
```

**Impact**: Running the visualizer pointed at ACP Enhanced's real progress.yaml would crash on type mismatch when Zod validation is added (T2). Currently, with `as` assertions, it silently coerces — but that's undefined behavior.

**Fix**: Change to `status: 'active' | 'in_progress' | 'completed' | 'not_started'`.

### B2 — StatusBadge missing `active` color

`src/components/StatusBadge.tsx:1-3`:
```typescript
const COLORS: Record<string, string> = {
  completed:   'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  not_started: 'bg-gray-100 text-gray-600',
};
```

No `active` entry. Would render as gray (fallback to `not_started`), which is misleading.

**Fix**: Add `active: 'bg-emerald-100 text-emerald-800'`.

### B3 — FilterBar missing `active` option

`src/components/FilterBar.tsx:4`:
```typescript
export type StatusFilter = 'all' | 'in_progress' | 'completed' | 'not_started';
```

No `active` in the filter options.

**Fix**: Add `'active'` to `StatusFilter` union and `OPTIONS` array.

## Revised M26 Plan (with B1-B3)

| # | Task | Est. | Change |
|---|------|------|--------|
| T1 | Add `current_blockers` to ProgressData + **fix `status` to include `'active'`** + add `active` to StatusBadge + FilterBar | 1h | **Expanded** — B1+B2+B3 folded in |
| T2 | Add Zod schemas for all types | 2h | Unchanged |
| T3 | Structured error reporting | 1h | Unchanged |
| T4 | Regenerate progress.yaml with M25 history + use `status: active` | 0.5h | Unchanged |

## Revised M27 Plan (with G1-G2)

| # | Task | Est. | Change |
|---|------|------|--------|
| T5 | GitHub Actions CI | 1.5h | Unchanged |
| T6 | Pre-commit hook | 0.5h | Unchanged |
| T7 | Hook tests | 1.5h | Unchanged |
| T8 | Component tests | 2h | Unchanged |
| T9 | Integration test | 0.5h | Unchanged |
| **T10** | **Add `files` field to `package.json` + `.npmignore`** for clean npm packaging | 0.5h | **New** — G1+G2 |

## M28 — No Changes

The sync contract plan is solid. No new gaps found.

## Final Plan Summary

| Milestone | Tasks | Est. | Priority |
|-----------|-------|------|----------|
| M26 — Schema Hardening | 4 (T1 expanded) | ~4.5h | 🔴 High |
| M27 — CI & Quality | 6 (+T10) | ~6.5h | 🟡 Medium |
| M28 — ACP Sync | 5 | ~3h | 🔴 High |
| **Total** | **15** | **~14h** | |

## Verdict

**READY** — with B1-B3 folded into M26 T1 and G1-G2 added as M27 T10. The critical bug (B1) means the visualizer literally cannot parse ACP Enhanced's own progress.yaml today. This must be fixed before anything else. The plan now covers it.
