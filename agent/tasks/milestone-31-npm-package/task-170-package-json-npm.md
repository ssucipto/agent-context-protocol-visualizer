---
created: 2026-06-03
completed:
---

# Task 170: Update package.json for npm

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Design**: [local.npm-package](../../design/local.npm-package.md) (D1, D3)  
**Estimated Time**: 0.5 hours  

---

## Objective

Update `package.json` for npm publishing: set name to `acp-visualizer`, add `bin` field, update `files` to include `bin/` and `dist/`.

---

## Steps

### 1. Update package.json

```json
{
  "name": "acp-visualizer",
  "version": "1.0.0",
  "private": false,
  "bin": {
    "acp-visualizer": "bin/acp-visualizer.mjs"
  },
  "files": [
    "dist/", "server/", "src/", "public/", "bin/",
    "package.json", "README.md", "vite.config.ts", "tsconfig.json"
  ]
}
```

### 2. Verify

```bash
npm pack --dry-run
```

---

## Verification

- [ ] `name` changed to `acp-visualizer`
- [ ] `private` set to `false`
- [ ] `bin` field points to `bin/acp-visualizer.mjs`
- [ ] `files` includes `bin/` and `dist/`
- [ ] `npm pack --dry-run` shows expected files
