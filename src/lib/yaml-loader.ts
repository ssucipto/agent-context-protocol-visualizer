import yaml from 'js-yaml';
import type { ProgressData, Milestone, Task } from './types';
import { progressDataSchema } from './schemas';

/**
 * Recursively convert any Date objects to ISO date strings.
 * js-yaml parses bare dates (2026-06-03) as Date objects;
 * this ensures they never reach React components.
 */
function sanitizeDates(obj: unknown): unknown {
  if (obj instanceof Date) return obj.toISOString().split('T')[0];
  if (Array.isArray(obj)) return obj.map(sanitizeDates);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeDates(val);
    }
    return result;
  }
  return obj;
}

export function parseProgressYaml(raw: string): ProgressData {
  // json:true allows duplicate keys (last value wins)
  const rawDoc = yaml.load(raw, { json: true });

  // Sanitize all Date objects BEFORE Zod validation
  const cleanDoc = sanitizeDates(rawDoc);

  // Zod validates the cleaned structure
  const doc = progressDataSchema.parse(cleanDoc);

  // Normalise milestones: inject 'id' from the YAML key
  const milestones: Record<string, Milestone> = {};
  for (const [id, data] of Object.entries(doc.milestones)) {
    milestones[id] = { ...data, id } as Milestone;
  }

  // Normalise tasks: inject 'milestoneId' from the YAML key
  const tasks: Record<string, Task[]> = {};
  for (const [milestoneId, taskList] of Object.entries(doc.tasks)) {
    tasks[milestoneId] = (taskList ?? []).map((t) => ({
      ...t,
      milestoneId,
    })) as Task[];
  }

  return {
    project: doc.project,
    milestones,
    tasks,
    recent_work: doc.recent_work,
    next_steps: doc.next_steps,
    notes: doc.notes,
    current_blockers: doc.current_blockers,
  };
}
