---
created: 2026-06-03
completed:
---

# Task 155: Copy ACP Enhanced Progress YAML as Test Fixture

**Milestone**: [M28 - ACP Enhanced Sync Contract](../milestones/milestone-28-acp-sync-contract.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Copy the real ACP Enhanced progress.yaml (5333 lines, 45 milestones, 200+ tasks) into the visualizer's test fixtures for schema validation.

---

## Context

The visualizer must correctly parse real ACP Enhanced data. By copying the actual progress.yaml as a test fixture, we can verify this on every CI run. The fixture is read-only — never modified.

---

## Steps

### 1. Copy Fixture

```bash
cp ../acp-enhanced/agent/progress.yaml test/fixtures/acp-enhanced-progress.yaml
```

### 2. Verify Size

```bash
wc -l test/fixtures/acp-enhanced-progress.yaml
# Should be ~5333 lines
```

### 3. Quick Parse Check

```bash
node -e "
const { parseProgressYaml } = require('./src/lib/yaml-loader');
const { readFileSync } = require('fs');
const raw = readFileSync('test/fixtures/acp-enhanced-progress.yaml', 'utf-8');
const data = parseProgressYaml(raw);
console.log('Project:', data.project.name, data.project.version);
console.log('Milestones:', Object.keys(data.milestones).length);
console.log('Status:', data.project.status);
"
```

---

## Verification

- [ ] `test/fixtures/acp-enhanced-progress.yaml` exists
- [ ] File is ~5333 lines
- [ ] Quick parse check outputs project name, version, and milestone count
- [ ] `.gitignore` includes the fixture? (No — it should be committed for CI)
