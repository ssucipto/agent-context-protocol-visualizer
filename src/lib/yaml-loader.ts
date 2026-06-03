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

/**
 * Map unknown status values to known ACP statuses.
 * Different ACP projects use different status vocabularies.
 */
const STATUS_MAP: Record<string, string> = {
  blocked: 'blocked',
  superseded: 'completed',
  draft: 'not_started',
  todo: 'not_started',
  done: 'completed',
  'in-progress': 'in_progress',
  active: 'active',
};

function normalizeStatus(s: unknown): string {
  const raw = typeof s === 'string' ? s.toLowerCase() : String(s ?? 'not_started');
  // Map known ACP variants; standard statuses pass through, unknowns fail Zod
  return STATUS_MAP[raw] ?? raw;
}

/**
 * Normalize raw YAML data before Zod validation.
 *
 * Handles ACP Enhanced format variants across different projects:
 * - milestones as array → record (keyed by id)
 * - task status values outside our enum → mapped to known values
 * - recent_work with summary instead of description
 * - null file fields → stripped
 */
function normalizeYaml(doc: Record<string, unknown>): Record<string, unknown> {
  // 1. milestones: array → record
  if (Array.isArray(doc.milestones)) {
    const milestones: Record<string, unknown> = {};
    for (const m of doc.milestones as Array<Record<string, unknown>>) {
      const key = (m.id ?? m.name ?? `unknown-${Object.keys(milestones).length}`) as string;
      milestones[key] = { ...m, id: key };
    }
    doc = { ...doc, milestones };
  }

  // 2. Normalize task status values
  if (doc.tasks && typeof doc.tasks === 'object') {
    const tasks: Record<string, unknown> = {};
    for (const [mid, taskList] of Object.entries(doc.tasks as Record<string, unknown>)) {
      tasks[mid] = (taskList as Array<Record<string, unknown>> ?? []).map((t) => ({
        ...t,
        status: normalizeStatus(t.status),
        // Strip null file fields — Zod expects string | undefined, not null
        ...(t.file === null ? { file: undefined } : {}),
      }));
    }
    doc = { ...doc, tasks };
  }

  // 3. Normalize recent_work: summary → description, items fallback
  if (Array.isArray(doc.recent_work)) {
    doc = {
      ...doc,
      recent_work: (doc.recent_work as Array<Record<string, unknown>>).map((rw) => ({
        date: rw.date ?? '',
        description: rw.description ?? rw.summary ?? '',
        items: rw.items ?? [],
      })),
    };
  }

  // 4. Normalize milestone status values
  if (doc.milestones && typeof doc.milestones === 'object') {
    const milestones: Record<string, unknown> = {};
    for (const [mid, m] of Object.entries(doc.milestones as Record<string, unknown>)) {
      const ms = m as Record<string, unknown>;
      milestones[mid] = {
        ...ms,
        status: normalizeStatus(ms.status),
        // Strip null file fields — Zod expects string | undefined, not null
        ...(ms.file === null ? { file: undefined } : {}),
      };
    }
    doc = { ...doc, milestones };
  }

  return doc;
}

export function parseProgressYaml(raw: string): ProgressData {
  // json:true allows duplicate keys (last value wins)
  const rawDoc = yaml.load(raw, { json: true });

  // Sanitize all Date objects BEFORE Zod validation
  const cleanDoc = sanitizeDates(rawDoc) as Record<string, unknown>;

  // Normalize format variants (array milestones, alt statuses, summary vs description)
  const normalized = normalizeYaml(cleanDoc);

  // Zod validates the cleaned structure
  const doc = progressDataSchema.parse(normalized);

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
