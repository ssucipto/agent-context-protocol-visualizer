---
created: 2026-06-03
completed:
---

# Task 156: Schema Sync Test — Parse Real ACP Enhanced Progress YAML

**Milestone**: [M28 - ACP Enhanced Sync Contract](../milestones/milestone-28-acp-sync-contract.md)  
**Estimated Time**: 1 hour  
**Depends on**: task-155

---

## Objective

Add a Vitest test that validates the visualizer can parse ACP Enhanced's real 5333-line progress.yaml without errors.

---

## Context

This is the "canary test" — if it fails, the visualizer has drifted from ACP Enhanced's schema. Runs on every CI push. Catches schema drift before users encounter it.

---

## Steps

### 1. Create Test File

Create `src/lib/sync.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseProgressYaml } from './yaml-loader';

const fixturePath = join(import.meta.dirname, '../../test/fixtures/acp-enhanced-progress.yaml');

describe('ACP Enhanced schema sync', () => {
  const raw = readFileSync(fixturePath, 'utf-8');
  const data = parseProgressYaml(raw);

  it('parses without throwing', () => {
    expect(data).toBeDefined();
  });

  it('has correct project metadata', () => {
    expect(data.project.name).toBe('agent-context-protocol');
    expect(data.project.status).toBe('active');
    expect(data.project.version).toBeDefined();
  });

  it('has 40+ milestones', () => {
    const count = Object.keys(data.milestones).length;
    expect(count).toBeGreaterThanOrEqual(40);
  });

  it('has tasks with injected milestoneId', () => {
    const taskLists = Object.values(data.tasks);
    expect(taskLists.length).toBeGreaterThan(0);
    for (const tasks of taskLists) {
      for (const task of tasks) {
        expect(task.milestoneId).toBeDefined();
      }
    }
  });

  it('has recent_work entries', () => {
    expect(data.recent_work.length).toBeGreaterThan(0);
    expect(data.recent_work[0].date).toBeDefined();
    expect(data.recent_work[0].items).toBeDefined();
  });

  it('has next_steps', () => {
    expect(data.next_steps.length).toBeGreaterThan(0);
  });
});
```

### 2. Run

```bash
npx vitest run src/lib/sync.test.ts
```

---

## Verification

- [ ] `src/lib/sync.test.ts` created
- [ ] All 6 assertions pass
- [ ] Test runs in CI (auto-discovered by vitest)
- [ ] Test verifies: project metadata, milestone count, task injection, recent_work, next_steps
