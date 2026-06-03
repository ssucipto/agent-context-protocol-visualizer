---
created: 2026-06-03
completed:
---

# Task 149: Pre-Commit Hook with lint-staged

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Add a pre-commit hook that runs TypeScript type checking on staged files before every commit.

---

## Context

Pre-commit hooks catch type errors before they reach CI, saving time and CI minutes. We use `lint-staged` with `simple-git-hooks` (zero-config, no Python/node-gyp dependency).

---

## Steps

### 1. Install Dependencies

```bash
npm install -D lint-staged simple-git-hooks
```

### 2. Configure lint-staged

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["tsc --noEmit --pretty"]
  },
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged"
  }
}
```

### 3. Install Hook

```bash
npx simple-git-hooks
```

### 4. Test

Stage a file with a deliberate type error and attempt to commit — it should be blocked.

---

## Verification

- [ ] `lint-staged` and `simple-git-hooks` installed
- [ ] `package.json` configured with `lint-staged` and `simple-git-hooks` entries
- [ ] `.git/hooks/pre-commit` exists and runs lint-staged
- [ ] Commit with TypeScript errors is blocked
