---
created: 2026-06-03
completed:
---

# Task 154: Document Schema Version Pin

**Milestone**: [M28 - ACP Enhanced Sync Contract](../milestones/milestone-28-acp-sync-contract.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Document which ACP Enhanced version's progress.yaml schema the visualizer targets, in both `identity.yml` and README.

---

## Context

When ACP Enhanced updates its progress.yaml schema (new fields, renamed keys), the visualizer needs a documented reference point. This task adds a `progress_yaml_target` field to identity.yml and a "Schema Compatibility" section to README.

---

## Steps

### 1. Update identity.yml

Add to `agent/core/identity.yml`:
```yaml
progress_yaml_target:
  source: ssucipto/acp-enhanced
  version: 6.8.2
  verified_date: 2026-06-03
  notes: "Schema verified against real ACP Enhanced progress.yaml (5333 lines, 45 milestones)"
```

### 2. Add README Section

Add to README:
```markdown
## Schema Compatibility

This visualizer targets ACP Enhanced v6.8.2's `progress.yaml` schema.
To verify compatibility after an ACP Enhanced update:

```bash
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run dev
npm test -- src/lib/sync.test.ts
```

If ACP Enhanced adds new fields, update `src/lib/types.ts` and `src/lib/schemas.ts`,
then bump `progress_yaml_target.version` in `agent/core/identity.yml`.
```

---

## Verification

- [ ] `identity.yml` has `progress_yaml_target` block
- [ ] README has "Schema Compatibility" section
- [ ] Version matches currently installed ACP Enhanced (v6.8.2)
