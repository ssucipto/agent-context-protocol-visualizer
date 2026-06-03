---
created: 2026-06-03
completed:
---

# Task 151: Vitest Tests for MilestoneTable, FilterBar, SearchBar

**Milestone**: [M27 - CI & Quality Pipeline](../milestones/milestone-27-ci-quality-pipeline.md)  
**Estimated Time**: 2 hours  

---

## Objective

Add unit tests for the three core UI components: MilestoneTable (sorting), FilterBar (filter selection), and SearchBar (fuse.js integration).

---

## Context

These components are pure presentational — they receive props and render UI. Tests should verify:
- MilestoneTable: renders columns, sorts on header click, displays progress bars
- FilterBar: renders all filter options, calls onChange on click, highlights active filter
- SearchBar: calls fuse.js search, renders result count, handles empty/loading states

---

## Steps

### 1. Create Test Files

- `src/components/MilestoneTable.test.tsx`
- `src/components/FilterBar.test.tsx`
- `src/components/SearchBar.test.tsx`

### 2. MilestoneTable Tests

- Renders all columns (ID, Name, Status, Progress, Tasks, Priority)
- Clicking a column header toggles sort direction
- ProgressBar renders with correct width percentage
- StatusBadge renders correct color per status
- Empty state: renders nothing when no milestones

### 3. FilterBar Tests

- Renders All, In Progress, Completed, Not Started, Active buttons
- Clicking a button calls onChange with correct value
- Active filter is highlighted (blue background)
- Default filter is 'all'

### 4. SearchBar Tests

- Placeholder text is visible
- Typing triggers fuse.js search via callback
- Empty query shows "Type at least 2 characters" message
- Results display correct count

### 5. Run Tests

```bash
npx vitest run src/components/
```

---

## Verification

- [ ] 3 test files created
- [ ] MilestoneTable: 5 test cases pass
- [ ] FilterBar: 4 test cases pass
- [ ] SearchBar: 4 test cases pass
- [ ] All tests use `@testing-library/react` for rendering and interaction
