---
created: 2026-06-03
completed:
---

# Task 152: Integration Test — Full YAML → Parse → Render Pipeline

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 0.5 hours  
**Depends on**: task-145, task-150, task-151

---

## Objective

Add an integration test that validates the full pipeline: real progress.yaml → parse → typed data → render components.

---

## Context

Unit tests cover individual pieces. This integration test verifies they work together. Uses the sample progress.yaml fixture and verifies that parsing + rendering produces expected output.

---

## Steps

### 1. Create Test File

Create `src/lib/integration.test.tsx`.

### 2. Test Flow

```typescript
import { parseProgressYaml } from './yaml-loader';
import { readFileSync } from 'node:fs';

const raw = readFileSync('test/fixtures/sample-progress.yaml', 'utf-8');
const data = parseProgressYaml(raw);

// Verify parsing
expect(data.project.status).toBe('in_progress');
expect(Object.keys(data.milestones)).toHaveLength(2);
expect(data.milestones['M25'].name).toBe('ACP Progress Visualizer (P0 MVP)');

// Verify task injection
expect(data.tasks['M25']).toBeDefined();
expect(data.tasks['M25'][0].milestoneId).toBe('M25');
```

### 3. Run

```bash
npx vitest run src/lib/integration.test.tsx
```

---

## Verification

- [ ] `src/lib/integration.test.tsx` created
- [ ] Parses sample fixture without errors
- [ ] Verifies milestone count, names, and task injection
- [ ] Test passes in CI
