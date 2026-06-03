# Milestone 26: Schema Hardening

**Goal**: Fix type gaps, add runtime validation, and make the visualizer correctly parse real ACP Enhanced progress.yaml files  
**Duration**: ~4.5 hours  

---

## Overview

The visualizer's TypeScript types have drifted from the real ACP Enhanced progress.yaml schema. This milestone fixes three bugs (missing `active` status, missing `current_blockers`, missing badge/filter support) and adds Zod runtime validation to replace unsafe `as` type assertions. After this milestone, the visualizer will correctly parse ACP Enhanced's own 5333-line progress.yaml without errors.

---

## Deliverables

### 1. Type Fixes
- `ProjectMetadata.status` accepts `'active'` (not just `in_progress | completed | not_started`)
- `ProgressData` gains `current_blockers: string[]`
- `StatusBadge` renders `active` with emerald color
- `FilterBar` includes `active` in filter options

### 2. Runtime Validation
- Zod schemas for `ProgressData`, `ProjectMetadata`, `Milestone`, `Task`, `WorkEntry`
- `yaml-loader.ts` uses `z.parse()` instead of `as` type assertions
- Structured error messages from `ZodError` surfaced in UI

### 3. Live Data
- `agent/progress.yaml` regenerated with M25 task history (tasks 137-143), recent_work, notes
- Project status set to `active`

---

## Tasks

| Task | Description | Est. |
|------|-------------|------|
| 144 | Add `active` status + `current_blockers` to types, StatusBadge, and FilterBar | 1h |
| 145 | Add Zod schemas for all types, replace `as` assertions | 2h |
| 146 | Structured Zod error reporting in UI | 1h |
| 147 | Regenerate progress.yaml with M25 history | 0.5h |

## Success Criteria

- Visualizer parses ACP Enhanced's real `agent/progress.yaml` (5333 lines, 45 milestones) without errors
- `status: active` renders with correct emerald badge
- Malformed YAML produces a clear error message, not a crash
- FilterBar shows `Active` as a filter option
