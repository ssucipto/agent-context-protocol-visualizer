---
created: 2026-06-03
completed:
---

# Task 153: npm Packaging — files Field + .npmignore

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Configure clean npm packaging so `npm pack` produces a minimal tarball without dev artifacts.

---

## Context

As a local tool that could be distributed via `npx acp-visualizer` (P2 roadmap), the package should be clean. Without configuration, `npm pack` would include `agent/`, `test/`, and unnecessary files.

---

## Steps

### 1. Add `files` Field

Add to `package.json`:
```json
"files": [
  "dist/",
  "server/",
  "src/",
  "public/",
  "package.json",
  "README.md",
  "vite.config.ts",
  "tsconfig.json"
]
```

### 2. Create .npmignore

Create `.npmignore`:
```
agent/
test/
.github/
.opencode/
scripts/
*.log
node_modules/
```

### 3. Verify

```bash
npm pack --dry-run
```

Should show only production files, no `agent/`, `test/`, or `node_modules/`.

---

## Verification

- [ ] `package.json` has `files` field
- [ ] `.npmignore` excludes agent/, test/, .github/, .opencode/
- [ ] `npm pack --dry-run` shows clean output
- [ ] Tarball size is reasonable (< 500KB)
