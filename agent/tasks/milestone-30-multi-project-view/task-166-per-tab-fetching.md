---
created: 2026-06-03
completed: 2026-06-03
---

# Task 166: Per-Tab Data Fetching via Shared PollManager

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D3)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-164, task-165, M29 task-162 (PollManager)

---

## Objective

Each tab renders independently with its own data, but uses the shared PollManager (from M29 task-162) for coordinated polling. This avoids N independent polling loops and stays within GitHub rate limits.

---

## Steps

### 1. Use shared PollManager

```tsx
function ProjectTab({ config }: { config: ProjectConfig }) {
  const { data, error, loading } = useProgressData(config, pollManager);
  // pollManager handles coordinated polling for all tabs
}
```

### 2. PollManager coordinates all sources

A single poll loop checks all sources at their respective intervals (2s local, 10s remote). When data changes, the relevant tab re-renders. When a tab is removed, its source is unregistered from the PollManager.

### 3. Keep tabs mounted

Use CSS `display: none` instead of unmounting. Polling continues for all registered sources regardless of which tab is active.

---

## Verification

- [ ] Shared PollManager coordinates all tab polling (not independent loops)
- [ ] Switching tabs doesn't lose data or reset state
- [ ] Removing a tab unregisters its source from PollManager
- [ ] Local and GitHub sources both work per-tab
