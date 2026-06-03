---
created: 2026-06-03
completed:
---

# Task 144: Add `active` Status + `current_blockers` to Types, Badge & Filter

**Milestone**: [M26 - Schema Hardening](../milestones/milestone-26-schema-hardening.md)  
**Estimated Time**: 1 hour  

---

## Objective

Fix three bugs discovered in audit-3: (1) TypeScript types reject `status: active` used by real ACP Enhanced progress.yaml, (2) StatusBadge has no color for `active`, (3) FilterBar has no `active` option. Also add `current_blockers` to ProgressData.

---

## Context

ACP Enhanced's real progress.yaml uses `status: active` for projects. The visualizer's `ProjectMetadata.status` only allows `'in_progress' | 'completed' | 'not_started'`. This causes a type error when parsing real ACP Enhanced data. Additionally, `current_blockers` exists in the YAML but not in the TypeScript types.

---

## Steps

### 1. Update TypeScript Types

In `src/lib/types.ts`:
- Change `ProjectMetadata.status` to `'active' | 'in_progress' | 'completed' | 'not_started'`
- Add `current_blockers: string[]` to `ProgressData`

### 2. Update YAML Loader

In `src/lib/yaml-loader.ts`:
- Add `current_blockers: (doc['current_blockers'] as string[]) ?? []` to the return object

### 3. Update StatusBadge

In `src/components/StatusBadge.tsx`:
- Add `active: 'bg-emerald-100 text-emerald-800'` to COLORS map

### 4. Update FilterBar

In `src/components/FilterBar.tsx`:
- Add `'active'` to `StatusFilter` type union
- Add `{ label: 'Active', value: 'active' }` to OPTIONS array

### 5. Verify

```bash
npm run dev
# Point at ACP Enhanced progress.yaml:
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run dev
```

---

## Verification

- [ ] `ProjectMetadata.status` accepts `'active'`
- [ ] `ProgressData` has `current_blockers: string[]`
- [ ] StatusBadge renders `active` with emerald color
- [ ] FilterBar shows `Active` option
- [ ] Visualizer parses ACP Enhanced's real progress.yaml without type errors
