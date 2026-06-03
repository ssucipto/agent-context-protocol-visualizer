---
created: 2026-06-03
completed:
---

# Task 148: GitHub Actions CI Workflow

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 1.5 hours  

---

## Objective

Add a GitHub Actions workflow that runs lint, test, and build on every push and pull request.

---

## Context

As a local dev tool distributed via git, CI ensures every commit is validated. The workflow should run `tsc --noEmit` (type check), `vitest run` (tests), and `vite build` (production build) in sequence.

---

## Steps

### 1. Create Workflow File

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx vitest run
      - run: npm run build
```

### 2. Verify Locally

```bash
npx tsc --noEmit
npx vitest run
npm run build
```

All three must pass before committing the workflow.

### 3. Push and Verify

Push to GitHub and confirm the action runs in the Actions tab.

---

## Verification

- [ ] `.github/workflows/ci.yml` created
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes
- [ ] `npm run build` succeeds
- [ ] CI runs on push to GitHub
