---
created: 2026-06-03
completed:
---

# Task 146: Structured Zod Error Reporting in UI

**Milestone**: [M26 - Schema Hardening](../milestones/milestone-26-schema-hardening.md)  
**Estimated Time**: 1 hour  
**Depends on**: task-145

---

## Objective

When Zod validation fails, show a human-readable error in the UI instead of a raw `ZodError` dump. Surface which field failed and why.

---

## Context

Currently, parse errors in `fetchProgress` show raw error messages. With Zod, errors contain structured data (`ZodError.issues[]`) with paths, codes, and messages. The UI should present these clearly so users can fix their progress.yaml.

---

## Steps

### 1. Add Error Formatting Utility

Create `src/lib/format-error.ts`:
```typescript
import { ZodError } from 'zod';

export function formatParseError(err: unknown): string {
  if (err instanceof ZodError) {
    return err.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
  }
  return err instanceof Error ? err.message : 'Unknown error';
}
```

### 2. Update Server Function

In `server/routes/api/progress.ts`, use `formatParseError` in the catch block.

### 3. Update UI Error Display

In components that show errors (index route, milestones route, search route), render the formatted error with `whitespace-pre-wrap` for readability.

### 4. Test

Create a malformed progress.yaml fixture and verify the UI shows:
```
  • project.status: Invalid enum value. Expected 'active' | 'in_progress' | 'completed' | 'not_started', received 'broken'
  • milestones.M25.progress: Expected number, received string
```

---

## Verification

- [ ] `src/lib/format-error.ts` created with `formatParseError()`
- [ ] Server function uses formatted errors
- [ ] UI renders multi-line error messages with `whitespace-pre-wrap`
- [ ] Error messages reference field paths (e.g., `project.status`)
