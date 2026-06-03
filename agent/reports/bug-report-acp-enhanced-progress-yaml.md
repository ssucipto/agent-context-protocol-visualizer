# ACP Enhanced progress.yaml — Bug Report

**From**: ACP Progress Visualizer testing  
**Date**: 2026-06-03  
**Repo**: `ssucipto/acp-enhanced` (mainline)  
**File**: `agent/progress.yaml` (~5354 lines)  

---

## Summary

During integration testing of the ACP Progress Visualizer against ACP Enhanced's own `agent/progress.yaml`, several YAML issues were discovered that prevent standard YAML parsers from loading the file. These were fixed locally and the visualizer was hardened to tolerate similar issues. Recommended fixes for the upstream repo are listed below.

---

## Bugs Found

### Bug 1 — Stray `completed:` line at M5 (Line 148)

**Severity**: 🔴 Critical (prevents YAML parsing)

**Location**: Line 147-148 (original)

```yaml
    tasks_completed: 7
  completed: 2026-05-11    # ← 2-space indent, should be 4-space or removed
    tasks_total: 7
```

**Root cause**: A second `completed:` field with wrong indentation (2 spaces instead of 4) was inserted between `tasks_completed` and `tasks_total`. This is a duplicate of the correct `completed: 2026-02-22` at line 145.

**Fix**: Remove line 147 (`completed: 2026-05-11`).

---

### Bug 2 — Progress summary block inside `tasks:` section (Lines 2824-2861)

**Severity**: 🔴 Critical (19 duplicate mapping keys)

**Location**: Lines 2824-2861

```yaml
tasks:
  M1: [...]           # ← real task list
  M2: [...]           # ← real task list
  ...
  documentation:      # ← stray block inside tasks
    design_documents: 11
    ...
  progress:            # ← stray block inside tasks
    M1: 100           # ← duplicate of M1 task list above
    M2: 100           # ← duplicate of M2 task list above
    ...
    M26: 0
```

**Root cause**: A `documentation:` summary block and `progress:` percentage block were inadvertently placed inside the `tasks:` section as children. The `M1: 100` through `M26: 0` entries conflict with the real `M1: [...]` task arrays.

**Fix**: Remove lines 2824-2861 (the entire `documentation:` + `progress:` sub-block). These are computed/auto-generated values that belong elsewhere.

---

### Bug 3 — Duplicate `actual_hours` and `completed_date` in task entries

**Severity**: 🟡 Medium (9 occurrences)

**Location**: Multiple task entries after line 2980

```yaml
    - id: task-145
      actual_hours: 1.0          # ← real value
      file: agent/tasks/...
      estimated_hours: 2-3
      actual_hours: null          # ← duplicate null stub
      completed_date: null        # ← duplicate null stub
```

**Root cause**: Task entries have both a real `actual_hours` value and a null `actual_hours` stub, plus duplicate `completed_date`. Appears to be a template artifact where the null fields weren't removed when real values were filled in.

**Fix**: Remove the null duplicate entries. Keep the first (real) value.

---

### Bug 4 — Unquoted colons in `notes:` values (Lines 3000, 3046, 3080)

**Severity**: 🟡 Medium (3 occurrences)

```yaml
    notes: Update template to use YAML completed: field; deprecate markdown Status field.
    #                                    ^^^^^^^^^^
    #                       js-yaml interprets "completed: " as a new mapping key
```

**Root cause**: `notes:` values containing `word: ` patterns (like `completed: field`, `id:`, `precedes:`, `depends_on:`) are misinterpreted by strict YAML parsers as new mapping keys. Standard YAML requires quoting values that contain `: ` followed by a space.

**Fix**: Quote the values (`notes: "..."`) or use YAML literal block scalars (`notes: |`).

---

## What the Visualizer Fixed (No Action Needed)

These are not bugs in `progress.yaml` — they are legitimate YAML that js-yaml handles differently:

| Pattern | Example | js-yaml behavior | Visualizer fix |
|---------|---------|-----------------|----------------|
| Bare dates | `started: 2026-02-16` | Parsed as `Date` object | Zod `z.preprocess` Date→string |
| Bare numbers | `estimated_weeks: 1` | Parsed as `number` | Zod `z.preprocess` number→string |
| Object items | `items: [{"✅ text": [...]}]` | Valid YAML, not strings | Zod `z.preprocess` object→key |

These are YAML spec compliant — js-yaml's type auto-detection is the issue. The visualizer now handles all three gracefully.

---

## Recommended Actions

1. **Apply Bug 1 fix**: Remove stray `completed: 2026-05-11` at M5
2. **Apply Bug 2 fix**: Remove the `documentation:` + `progress:` block from inside `tasks:` (move to a top-level key if the data is needed)
3. **Apply Bug 3 fix**: Remove duplicate null `actual_hours`/`completed_date` fields from task entries
4. **Apply Bug 4 fix**: Quote `notes:` values containing `: ` patterns, or convert to literal block scalars
5. **Consider**: Add a YAML validation step to CI (e.g., `python -c "import yaml; yaml.safe_load(open('agent/progress.yaml'))"`) to catch regressions
