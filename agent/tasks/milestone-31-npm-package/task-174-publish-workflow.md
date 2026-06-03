---
created: 2026-06-03
completed:
---

# Task 174: npm Publish Workflow

**Milestone**: [M31 - npx Package](../../milestones/milestone-31-npm-package.md)  
**Design**: [local.npm-package](../../design/local.npm-package.md) (D6)  
**Estimated Time**: 1 hour  
**Depends on**: task-170, task-171

---

## Objective

Create a publish workflow: build → version bump → publish. Add a `prepublishOnly` script for safety.

---

## Steps

### 1. Add publish scripts

In `package.json`:
```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm test",
    "publish:patch": "npm version patch && npm publish",
    "publish:minor": "npm version minor && npm publish"
  }
}
```

### 2. Verify prepublishOnly

`prepublishOnly` runs before `npm publish` — ensures build is fresh and tests pass.

### 3. Publish

```bash
npm run publish:patch
```

### 4. Tag pre-releases

```bash
npm version prerelease --preid beta
npm publish --tag next
```

---

## Verification

- [ ] `prepublishOnly` runs build + test before publish
- [ ] `npm publish --dry-run` shows correct files
- [ ] Package name `acp-visualizer` available on npm
