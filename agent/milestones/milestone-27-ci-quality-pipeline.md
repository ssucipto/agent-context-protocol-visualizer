# Milestone 27: CI & Quality Pipeline

**Goal**: Add automated testing, linting, build verification, and clean npm packaging for a local-first development tool  
**Duration**: ~6.5 hours  

---

## Overview

As a local dev tool distributed via git and npm, the visualizer needs a CI pipeline that validates every push. This milestone adds GitHub Actions for lint+test+build, pre-commit hooks for local quality, Vitest tests for hooks and components, and npm packaging configuration. No cloud deployment — this is a local tool.

---

## Deliverables

### 1. CI Pipeline
- GitHub Actions workflow: lint (`tsc --noEmit`) + test (`vitest run`) + build (`vite build`) on push and PR
- Pre-commit hook via lint-staged for TypeScript checking

### 2. Test Coverage
- Unit tests for `useProgressData` hook (mock server functions, verify polling logic)
- Unit tests for `MilestoneTable` sorting, `FilterBar` filtering, `SearchBar` fuse.js results
- Integration test: real YAML → parse → render components

### 3. npm Packaging
- `package.json` `files` field for clean `npm pack`
- `.npmignore` to exclude `agent/`, `test/`, dev-only files

---

## Tasks

| Task | Description | Est. |
|------|-------------|------|
| 148 | GitHub Actions CI workflow (lint + test + build) | 1.5h |
| 149 | Pre-commit hook with lint-staged + tsc check | 0.5h |
| 150 | Vitest tests for useProgressData hook | 1.5h |
| 151 | Vitest tests for MilestoneTable, FilterBar, SearchBar | 2h |
| 152 | Integration test: full YAML → parse → render pipeline | 0.5h |
| 153 | Add `files` field to package.json + .npmignore | 0.5h |

## Success Criteria

- `git push` triggers CI that runs lint, test, and build
- All tests pass (target: 15+ assertions)
- `npm pack` produces a clean tarball without agent/, test/, or node_modules/
- Pre-commit hook blocks commits with TypeScript errors
