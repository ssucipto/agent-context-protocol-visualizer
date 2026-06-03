---
created: 2026-06-03
completed:
---

# Task 150: Vitest Tests for useProgressData Hook

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-145 (Zod schemas must be stable)

---

## Objective

Add unit tests for the `useProgressData` hook covering initial load, polling, mtime change detection, and error handling.

---

## Context

`useProgressData` is the core data-fetching hook. It calls `fetchProgress` on mount, then polls `fetchWatchToken` every 2 seconds to detect file changes. Tests should mock the server functions and verify:
- Initial data load
- Polling on interval
- Re-fetch when mtime changes
- Error state handling
- Cleanup on unmount

---

## Steps

### 1. Create Test File

Create `src/lib/data-source.test.tsx`.

### 2. Mock Server Functions

Mock `fetchProgress` and `fetchWatchToken` from their server modules using `vi.mock()`.

### 3. Test Cases

- **Initial load**: renders with loading, then data appears
- **Polling**: mtime unchanged → no re-fetch; mtime changed → re-fetch
- **Error state**: server function rejects → error message displayed
- **Cleanup**: unmount stops polling (no more calls after unmount)
- **Custom path**: passes path prop to server functions

### 4. Run Tests

```bash
npx vitest run src/lib/data-source.test.tsx
```

---

## Verification

- [ ] `src/lib/data-source.test.tsx` created
- [ ] 5 test cases pass
- [ ] Uses `@testing-library/react` for hook testing
- [ ] Mocks server functions correctly
- [ ] Tests cleanup (no polling after unmount)
