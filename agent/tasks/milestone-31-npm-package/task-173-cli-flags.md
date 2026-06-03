---
created: 2026-06-03
completed:
---

# Task 173: CLI Flags

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Design**: [local.npm-package](../../design/local.npm-package.md) (D5)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-171

---

## Objective

Parse CLI flags: `--path`, `--repo`, `--port`, `--no-open`, `--version`, `--help`.

---

## Steps

### 1. Parse flags

```javascript
const flags = {
  path: null, repo: null, port: null, noOpen: false, version: false, help: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--path': flags.path = args[++i]; break;
    case '--repo': flags.repo = args[++i]; break;
    case '--port': flags.port = args[++i]; break;
    case '--no-open': flags.noOpen = true; break;
    case '--version': flags.version = true; break;
    case '--help': flags.help = true; break;
  }
}
```

### 2. Handle --version and --help

```javascript
if (flags.version) {
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
  console.log(`acp-visualizer v${pkg.version}`);
  process.exit(0);
}

if (flags.help) {
  console.log(`Usage: npx acp-visualizer [options] [path]

Options:
  --path <file>     Local progress.yaml path
  --repo <owner/repo>  GitHub repo (requires M29)
  --port <N>        Port number (default: auto-detect)
  --no-open         Don't open browser
  --version         Show version
  --help            Show this help`);
  process.exit(0);
}
```

### 3. Pass port to Vite

```javascript
const viteArgs = ['vite', 'dev'];
if (flags.port) viteArgs.push('--port', flags.port);
if (!flags.noOpen) viteArgs.push('--open');
```

---

## Verification

- [ ] `--version` prints version from package.json
- [ ] `--help` prints usage
- [ ] `--path /custom/path.yaml` overrides auto-detect
- [ ] `--port 4000` starts on port 4000
- [ ] `--no-open` starts server without opening browser
