---
created: 2026-06-03
completed:
---

# Task 172: Auto-Detect ACP Project from CWD

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Design**: [local.npm-package](../../design/local.npm-package.md) (D4)  
**Estimated Time**: 1 hour  
**Depends on**: task-171

---

## Objective

Implement directory-walking logic to find `agent/progress.yaml` starting from the current working directory and walking up to the filesystem root.

---

## Steps

### 1. Implement findProgressYaml

Already included in task-171's CLI entry point. Extract and test independently:

```javascript
function findProgressYaml(startDir) {
  let dir = resolve(startDir);
  const root = dir.includes(':\\') ? dir.split(':\\')[0] + ':\\' : '/';
  while (dir !== root) {
    const candidate = resolve(dir, 'agent/progress.yaml');
    if (existsSync(candidate)) {
      try { statSync(candidate); return candidate; } catch { /* continue */ }
    }
    dir = resolve(dir, '..');
  }
  return null;
}
```

### 2. Add tests

Test walking from nested directories:
- `./agent/progress.yaml` exists → found at CWD
- `../agent/progress.yaml` exists → found one level up
- No progress.yaml anywhere → returns null

---

## Verification

- [ ] `findProgressYaml('.')` finds `agent/progress.yaml` in visualizer root
- [ ] Walking from a subdirectory finds parent's progress.yaml
- [ ] Returns null when no progress.yaml exists in hierarchy
- [ ] Windows path handling (drive root detection)
