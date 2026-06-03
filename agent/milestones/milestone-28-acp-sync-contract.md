# Milestone 28: ACP Enhanced Sync Contract

**Goal**: Establish a documented, tested, and verifiable sync contract between the visualizer and ACP Enhanced's progress.yaml schema  
**Duration**: ~3 hours  

---

## Overview

The visualizer depends on ACP Enhanced's progress.yaml schema. When ACP Enhanced evolves (new fields, renamed keys, new status values), the visualizer must stay compatible. This milestone documents the contract, creates a test fixture from the real ACP Enhanced progress.yaml, adds an automated sync test, and documents local usage workflows.

---

## Deliverables

### 1. Schema Version Pin
- `agent/core/identity.yml` documents which ACP Enhanced version's schema the visualizer targets
- README explains the sync contract and how to verify after ACP Enhanced updates

### 2. Test Fixture & Sync Test
- `test/fixtures/acp-enhanced-progress.yaml` — copy of ACP Enhanced's real progress.yaml
- Vitest test that validates the visualizer parses this fixture without errors

### 3. Documentation
- README: local usage model — `PROGRESS_YAML_PATH` env var, symlink workflow
- README: sync contract — what the visualizer expects, version pinning

---

## Tasks

| Task | Description | Est. |
|------|-------------|------|
| 154 | Document schema version pin in identity.yml + README | 0.5h |
| 155 | Copy ACP Enhanced progress.yaml as test fixture | 0.5h |
| 156 | Schema sync test: parse real ACP Enhanced 5333-line progress.yaml | 1h |
| 157 | README: local usage documentation (PROGRESS_YAML_PATH, symlinks) | 0.5h |
| 158 | README: sync contract documentation (version pinning, verification) | 0.5h |

## Success Criteria

- `identity.yml` specifies `progress_yaml_target: acp-enhanced v6.8.2`
- `npm test` includes a sync test that parses the real ACP Enhanced fixture
- README has clear instructions for pointing the visualizer at any local ACP project
- Developer can verify sync after `/acp-version-update` by running the sync test
