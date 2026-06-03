# Milestone 31: npx acp-visualizer Package

**Goal**: Ship the visualizer as an npm package so users can run `npx acp-visualizer` without cloning the repo  
**Duration**: ~6 hours  
**Design**: [local.npm-package](../design/local.npm-package.md)

---

## Overview

Currently users must `git clone` and `npm install` to use the visualizer. This milestone packages it for npm with a CLI entry point. A single `npx acp-visualizer` command downloads, installs, and starts the dashboard. Auto-detects the nearest ACP project by walking up from the current directory.

---

## Deliverables

### 1. CLI Entry Point
- `bin/acp-visualizer.mjs` — starts the dev server
- Auto-detects `agent/progress.yaml` from CWD
- CLI flags: `--path`, `--repo`, `--port`, `--no-open`, `--version`, `--help`

### 2. npm Package Configuration
- `package.json`: `name`, `bin`, `files` updated for npm
- Package name: `acp-visualizer`
- Ships pre-built `dist/` in the package

### 3. Publish Workflow
- Build step: `npm run build` before publish
- Version bump: `npm version patch`
- Publish: `npm publish`

---

## Tasks

| Task | D-ID | Description | Est. |
|------|------|-------------|------|
| 170 | D1, D3 | Update package.json: name, bin, files for npm | 0.5h |
| 171 | D2 | Create bin/acp-visualizer.mjs CLI entry point | 1.5h |
| 172 | D4 | Auto-detect ACP project by walking up from CWD | 1h |
| 173 | D5 | CLI flags: --path, --repo, --port, --no-open, --version, --help | 1.5h |
| 174 | D6 | npm publish workflow (build + version + publish) | 1h |
| 175 | — | Test: npx install + run on clean machine | 0.5h |

## Success Criteria

- `npx acp-visualizer` starts the dashboard without cloning
- Auto-detects ACP project from CWD
- `npx acp-visualizer --path /other/project/agent/progress.yaml` works
- Published to npm under `acp-visualizer`
