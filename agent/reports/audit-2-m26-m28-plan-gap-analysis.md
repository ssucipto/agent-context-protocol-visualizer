# Audit Report: M26-M28 Plan — Gaps, Inconsistencies & Deployment Strategy

**Audit**: #2  
**Date**: 2026-06-03  
**Subject**: Pre-implementation audit of the proposed M26-M28 remediation plan — gap analysis, deployment feasibility, and requirements  

## Summary

The M26-M28 plan correctly addresses all 8 audit-1 findings. However, this audit surfaces **2 critical gaps** in the deployment strategy, **1 plan inconsistency** (a non-issue already handled in code), and **1 scope omission**. The deployment model needs rethinking: Vercel is viable only as a demo/status page, not as the primary delivery mechanism. The primary usage model should be local (`npm run dev` / future `npx acp-visualizer`).

## Key Findings

| # | Finding | Severity | Affects |
|---|---------|----------|---------|
| P1 | **Deployment model mismatch**: M27 T5 plans Vercel deployment, but server functions use `readFileSync` against LOCAL filesystem. On Vercel serverless, only bundled files are readable — not arbitrary ACP projects' progress.yaml. Vercel would only display this repo's OWN progress.yaml | 🔴 Critical | M27 T5 |
| P2 | **No primary usage model documented**: The plan doesn't distinguish between "local dev usage" (primary — view any ACP project on your machine) vs "Vercel demo" (secondary — view this repo's own progress). The README's "Quick Start" only shows `npm run dev` — that's already the correct model, but M27 doesn't reinforce it | 🟡 High | M27, README |
| P3 | **G3 (setInterval leak) is a false positive**: The `useEffect` in `data-source.ts:56` already has `return () => clearInterval(intervalId)` cleanup. No fix needed. The plan should drop this item | 🟢 Info | Plan G3 |
| P4 | **Missing `started` and `description` fields**: The test fixture (`sample-progress.yaml`) has `started` and `description` on ProjectMetadata, but the TypeScript types don't define them. T1 only mentions `current_blockers` — should also add these two fields for fixture parity | 🟡 Medium | M26 T1 |
| P5 | **M28 T10 (schema version pin) has no enforcement mechanism**: Adding `progress_yaml_schema_version` to identity.yml is documentation-only. There's no automated check that fails CI if the actual ACP Enhanced version drifts. T12 (sync test) partially addresses this but only validates parse-ability, not semantic drift | 🟡 Medium | M28 T10 |
| P6 | **No error boundary / degraded UX**: When `fetchProgress` fails (missing file, bad YAML), the UI shows `Error: {message}` as raw text. No retry button, no fallback state, no "point me to a different file" UX. This matters more in production than in local dev | 🟢 Low | Components |

## Deployment Deep Dive

### How the visualizer reads data

```
Browser ──RPC──> TanStack Start Server Function
                      │
                      ├─ fetchProgress()  ──> readFileSync(path) ──> parse YAML
                      └─ fetchWatchToken() ──> statSync(path)     ──> return mtime
```

Both server functions use Node.js `fs` module against a path from `PROGRESS_YAML_PATH` env var (default: `agent/progress.yaml`).

### Deployment models — feasibility matrix

| Model | How data gets there | `readFileSync` works? | Useful for? |
|-------|--------------------|-----------------------|-------------|
| **Local dev** (`npm run dev`) | File is on your machine | ✅ Yes | Primary usage — view your own ACP projects |
| **npx package** (P2) | File is on user's machine | ✅ Yes | Distribution to other developers |
| **Vercel (bundled file)** | `agent/progress.yaml` committed to THIS repo | ✅ Yes (bundled) | Demo page showing THIS project's status |
| **Vercel (remote file)** | Would need GitHub API to fetch from other repos | ❌ No (no `fs` access) | Multi-project view (needs GitHub API — P1) |
| **Vercel (user upload)** | User drags/drops progress.yaml in browser | ❌ N/A (client-side parse) | Alternative UX |

### Recommendation: Two-tier deployment strategy

| Tier | What | Where | Data source |
|------|------|-------|-------------|
| **Primary** | Local dev / npx | User's machine | Local `agent/progress.yaml` (any ACP project) |
| **Demo** | Vercel static site | `acp-visualizer.vercel.app` | This repo's committed `agent/progress.yaml` |

**M27 should be restructured:**

- **T5a**: Create `vercel.json` for demo deployment — serves this repo's own progress.yaml as a live status page
- **T5b**: Document local usage as primary model in README — `npm run dev` with `PROGRESS_YAML_PATH=../my-acp-project/agent/progress.yaml`
- **T6**: GitHub Action CI (unchanged — good for any deployment model)
- **T7-T9**: Tests (unchanged)

### What Vercel CAN do today (without remote read)

If you commit `agent/progress.yaml` to this repo and deploy to Vercel, the demo page at `https://acp-visualizer.vercel.app` would show:
- The visualizer's own milestone progress (M25 completed, M26-M28 planned)
- A live status dashboard for THIS project
- This is actually useful! It's a self-hosting demo

## Plan Inconsistency Report

| Plan Item | Status | Detail |
|-----------|--------|--------|
| G3 (setInterval leak) | ❌ **False positive** | `data-source.ts:56` already has `clearInterval(intervalId)` cleanup in useEffect return. Drop from plan |
| G1 (missing fields) | ⚠️ **Scope too narrow** | T1 should add `started`, `description` to ProjectMetadata, not just `current_blockers` |
| G4 (progress.yaml tracking) | ✅ **Addressed** | T4 regenerates progress.yaml with task history |
| T5 (Vercel config) | ⚠️ **Needs refinement** | See P1 — Vercel is demo-only, not primary deployment |

## Revised M26-M28 Plan

### M26 — Schema & Data Quality (~6h)

| Task | Changes from original |
|------|----------------------|
| T1: Add missing fields to types | **Expanded**: add `current_blockers`, `started`, `description` to ProjectMetadata + parse in yaml-loader |
| T2: Add Zod schemas | Unchanged |
| T3: Zod error reporting | Unchanged |
| T4: Regenerate progress.yaml | Unchanged |

### M27 — CI/CD, Tests & Deployment (~10h)

| Task | Changes from original |
|------|----------------------|
| T5a: Vercel demo deploy | **Refined**: Deploy as self-hosting demo showing THIS project's progress. Add `vercel.json`. Document as demo, not primary usage |
| T5b: Document local usage | **New**: README section on local dev as primary model — `PROGRESS_YAML_PATH` usage, `npm run dev` instructions |
| T6: GitHub Actions CI | Unchanged — lint + test + build |
| T7: Hook tests | Unchanged |
| T8: Component tests | Unchanged |
| T9: Integration test | Unchanged |

**Dropped**: G3 (setInterval leak) — already handled in code

### M28 — ACP Enhanced Sync (~3.5h)

| Task | Changes from original |
|------|----------------------|
| T10: Schema version pin | **Enhanced**: Add CI check that compares pinned version against actual ACP Enhanced version in manifest.yaml |
| T11: ACP Enhanced fixture | Unchanged |
| T12: Schema sync test | Unchanged |
| T13: README sync docs | Unchanged |

## Deployment Requirements (Summary)

| Requirement | How |
|---|---|
| **Primary: Local dev** | `npm run dev` — reads any local `agent/progress.yaml` via `PROGRESS_YAML_PATH` env var |
| **Demo: Vercel** | Commit this repo's `agent/progress.yaml`, deploy via `vercel.json`. Shows visualizer's own status |
| **Future: npx package** | P2 — `npx acp-visualizer` starts local server, auto-opens browser |
| **Future: Multi-project** | P1 — GitHub API integration to fetch progress.yaml from remote repos |
| **CI: GitHub Actions** | Lint + test + build on every push. Block merge on failure |

## Recommendations

1. **Restructure M27 T5** into T5a (Vercel demo) + T5b (local usage docs). Position Vercel as a demo, not the primary deployment
2. **Drop G3** from the plan — the cleanup is already there
3. **Expand M26 T1** to include `started` and `description` fields on ProjectMetadata
4. **Enhance M28 T10** with a CI check that validates the pinned schema version against actual installed ACP Enhanced version
5. **Add T14** (optional, low priority): Error boundary component with retry UX for production
