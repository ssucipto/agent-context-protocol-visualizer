---
created: 2026-06-03
completed:
---

# Task 175: End-to-End Test — npx Install + Run

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Estimated Time**: 0.5 hours  
**Depends on**: task-174

---

## Objective

Verify the full `npx acp-visualizer` flow works end-to-end.

---

## Steps

### 1. Test locally

```bash
# From visualizer root
node bin/acp-visualizer.mjs --no-open
# Should start dev server and print port

node bin/acp-visualizer.mjs --version
# Should print acp-visualizer v1.0.0

node bin/acp-visualizer.mjs --help
# Should print usage
```

### 2. Test auto-detect

```bash
# From a subdirectory
cd src/components
node ../../bin/acp-visualizer.mjs --no-open
# Should find agent/progress.yaml in project root
```

### 3. Test with explicit path

```bash
node bin/acp-visualizer.mjs --path ../acp-enhanced/agent/progress.yaml --no-open
```

---

## Verification

- [ ] `--version` and `--help` work correctly
- [ ] Auto-detect finds progress.yaml from subdirectories
- [ ] `--path` override works
- [ ] `--no-open` starts server without browser
- [ ] Dev server starts and serves the dashboard
