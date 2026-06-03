import { z } from 'zod';

// js-yaml auto-parses bare dates (2026-02-16) as Date objects
// and bare numbers (1) as number. Preprocess to string before validation.
const toDateString = (v: unknown) => {
  if (v instanceof Date) return v.toISOString().split('T')[0];
  if (typeof v === 'string') return v;
  return v;
};
const toNumberString = (v: unknown) => {
  if (typeof v === 'number') return String(v);
  return v;
};

const dateString = z.preprocess(toDateString, z.string());
const nullableDateString = z.preprocess(
  (v) => (v === null || v === undefined ? null : toDateString(v)),
  z.string().nullable(),
);
const numberString = z.preprocess(toNumberString, z.string());
const nullableNumber = z.preprocess((v) => v, z.number().nullable());

export const projectMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  started: dateString,
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  current_milestone: z.string(),
  description: z.string(),
});

export const milestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  priority: z.number(),
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  progress: z.number().min(0).max(100),
  started: nullableDateString.optional(),
  completed: nullableDateString.optional(),
  estimated_weeks: numberString.optional(),
  tasks_completed: z.number().optional(),
  tasks_total: z.number().optional(),
  file: z.string().optional(),
  notes: z.string().default(''),
});

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  started: nullableDateString.optional(),
  file: z.string().optional(),
  estimated_hours: numberString.optional(),
  actual_hours: nullableNumber.optional(),
  completed_date: nullableDateString.optional(),
  notes: z.string().default(''),
  milestoneId: z.string().optional(),
});

// Some recent_work items are objects like {"✅ Description": ["sub-item"]}
// Preprocess them to strings for display
const itemToString = (v: unknown) => {
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null) {
    const key = Object.keys(v as Record<string, unknown>)[0];
    return key || JSON.stringify(v);
  }
  return String(v);
};

export const workEntrySchema = z.object({
  date: dateString,
  description: z.string(),
  items: z.preprocess(
    (v) => Array.isArray(v) ? v.map(itemToString) : [],
    z.array(z.string()),
  ).default([]),
});

export const progressDataSchema = z.object({
  project: projectMetadataSchema,
  milestones: z.record(z.string(), milestoneSchema),
  tasks: z.record(z.string(), z.array(taskSchema)),
  recent_work: z.array(workEntrySchema).default([]),
  next_steps: z.preprocess(
    (v) => Array.isArray(v) ? v.map(itemToString) : [],
    z.array(z.string()),
  ).default([]),
  notes: z.preprocess(
    (v) => Array.isArray(v) ? v.map(itemToString) : [],
    z.array(z.string()),
  ).default([]),
  current_blockers: z.preprocess(
    (v) => Array.isArray(v) ? v.map(itemToString) : [],
    z.array(z.string()),
  ).default([]),
});
