---
created: 2026-06-03
completed:
---

# Task 158: README — Sync Contract Documentation

**Milestone**: [M28 - ACP Enhanced Sync Contract](../milestones/milestone-28-acp-sync-contract.md)  
**Estimated Time**: 0.5 hours  
**Depends on**: task-154

---

## Objective

Document the sync contract between the visualizer and ACP Enhanced so developers know how to verify and maintain compatibility.

---

## Context

When ACP Enhanced releases a new version, the progress.yaml schema may change. Developers need to know: (1) how to check if the visualizer is still compatible, (2) what to update if it's not, (3) where the version pin lives.

---

## Steps

### 1. Add README Section

Add after the "Schema Compatibility" section from task-154:

```markdown
### Updating After ACP Enhanced Upgrade

After running `/acp-version-update` in your ACP Enhanced project:

1. **Run the sync test** to check compatibility:
   ```bash
   npm test -- src/lib/sync.test.ts
   ```

2. **If tests pass**: Your visualizer is compatible with the new ACP Enhanced version.
   Update the version pin:
   ```yaml
   # agent/core/identity.yml
   progress_yaml_target:
     version: X.Y.Z        # ← update this
     verified_date: YYYY-MM-DD  # ← update this
   ```

3. **If tests fail**: The ACP Enhanced schema has changed. Check the error output
   for specific field mismatches, then update:
   - `src/lib/types.ts` — add/rename fields
   - `src/lib/schemas.ts` — update Zod schemas
   - `src/lib/yaml-loader.ts` — update parsing logic if needed
   - `test/fixtures/acp-enhanced-progress.yaml` — refresh from latest ACP Enhanced

### Sync Contract Summary

| Visualizer Component | ACP Enhanced Dependency |
|---|---|
| `src/lib/types.ts` | progress.yaml field names and types |
| `src/lib/yaml-loader.ts` | progress.yaml structure (milestones, tasks, recent_work) |
| `test/fixtures/acp-enhanced-progress.yaml` | Real ACP Enhanced data for CI validation |
| `agent/core/identity.yml` → `progress_yaml_target` | Version pin |
```

---

## Verification

- [ ] README has "Updating After ACP Enhanced Upgrade" section
- [ ] Documents sync test, version pin update, and schema drift recovery
- [ ] Sync contract summary table is accurate
