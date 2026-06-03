---
created: 2026-06-03
completed:
---

# Task 171: Create bin/acp-visualizer.mjs CLI Entry Point

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Design**: [local.npm-package](../../design/local.npm-package.md) (D2)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-170

---

## Objective

Create the CLI entry point that `npx acp-visualizer` invokes. Starts the Vite dev server with auto-detected project path and opens the browser.

---

## Steps

### 1. Create bin/acp-visualizer.mjs

```javascript
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const visualizerRoot = resolve(__dirname, '..');

// Auto-detect project path
function findProgressYaml(startDir) {
  let dir = resolve(startDir);
  while (dir !== '/') {
    const candidate = resolve(dir, 'agent/progress.yaml');
    if (existsSync(candidate)) return candidate;
    dir = resolve(dir, '..');
  }
  return null;
}

const args = process.argv.slice(2);
const progressPath = args.find(a => !a.startsWith('--')) || findProgressYaml(process.cwd());

if (!progressPath) {
  console.error('No ACP project found. Specify: npx acp-visualizer /path/to/agent/progress.yaml');
  process.exit(1);
}

const env = { ...process.env, PROGRESS_YAML_PATH: progressPath };

const child = spawn('npx', ['vite', 'dev', '--open'], {
  cwd: visualizerRoot,
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code || 0));
```

### 2. Make executable

```bash
chmod +x bin/acp-visualizer.mjs
```

---

## Verification

- [ ] `bin/acp-visualizer.mjs` created and executable
- [ ] `node bin/acp-visualizer.mjs` starts the dev server
- [ ] Auto-detects ACP project from CWD
- [ ] Environment variables passed to Vite process
