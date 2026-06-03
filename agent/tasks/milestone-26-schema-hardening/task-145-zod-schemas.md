---
created: 2026-06-03
completed:
---

# Task 145: Add Zod Schemas for All Types

**Milestone**: [M26 - Schema Hardening](../milestones/milestone-26-schema-hardening.md)  
**Estimated Time**: 2 hours  
**Depends on**: task-144

---

## Objective

Replace unsafe `as` type assertions in `yaml-loader.ts` with Zod runtime validation. Add Zod schemas for `ProgressData`, `ProjectMetadata`, `Milestone`, `Task`, and `WorkEntry`.

---

## Context

Currently `yaml-loader.ts` uses `as Record<string, unknown>` and `as` casts throughout. Malformed YAML produces cryptic runtime errors. Zod schemas provide:
- Runtime type checking with clear error messages
- Automatic TypeScript type inference (`z.infer<>`)
- Safe parsing of optional/nullable fields

---

## Steps

### 1. Install Zod

```bash
npm install zod
```

### 2. Create Zod Schemas

Create `src/lib/schemas.ts` with Zod schemas matching all types in `types.ts`:
- `projectMetadataSchema` — name, version, started, status (with `active`), current_milestone, description
- `milestoneSchema` — all Milestone fields, with `notes` defaulting to `''`
- `taskSchema` — all Task fields, nullable `started`/`actual_hours`/`completed_date`
- `workEntrySchema` — date, description, items array
- `progressDataSchema` — project, milestones (record), tasks (record of arrays), recent_work, next_steps, notes, current_blockers

### 3. Update yaml-loader.ts

Replace:
```typescript
const doc = yaml.load(raw) as Record<string, unknown>;
// ... manual parsing with as casts ...
```

With:
```typescript
import { progressDataSchema } from './schemas';
const raw = yaml.load(rawYaml);
const doc = progressDataSchema.parse(raw);
```

Keep the milestone ID injection and task milestoneId injection — these are normalization steps, not validation.

### 4. Run Existing Tests

```bash
npm test
```

Update `yaml-loader.test.ts` to work with Zod — `parseProgressYaml` now throws `ZodError` on invalid input instead of returning a partially-typed object.

---

## Verification

- [ ] `zod` installed as a dependency
- [ ] `src/lib/schemas.ts` created with all 5 schemas
- [ ] `yaml-loader.ts` uses `progressDataSchema.parse()` instead of `as` assertions
- [ ] Existing tests pass (updated for Zod error handling)
- [ ] Malformed YAML throws `ZodError` with clear path and message
