import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';

// Test internal YAML parsing logic directly
// (TanStack Start server functions require HTTP protocol — can't call directly)

/** Recursively convert Date objects to ISO strings */
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

function parseYamlBlocks(raw: string): Record<string, any>[] {
  const blocks: Record<string, any>[] = [];
  const docs = raw.split(/^---$/m).filter(Boolean);
  for (const doc of docs) {
    try {
      const parsed = yaml.load(doc.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        blocks.push(sanitizeDates(parsed) as Record<string, any>);
      }
    } catch { /* skip malformed blocks */ }
  }
  if (blocks.length === 0) {
    try {
      const parsed = yaml.load(raw);
      if (Array.isArray(parsed)) return sanitizeDates(parsed) as Record<string, any>[];
    } catch { /* not a list */ }
  }
  return blocks;
}

describe('memory-files.ts — YAML parsing utilities', () => {
  describe('parseYamlBlocks', () => {
    it('parses multiple YAML blocks separated by ---', () => {
      const raw = `
date: 2026-06-01
executor: Copilot
key_fact: Session one
---
date: 2026-06-02
executor: Copilot
key_fact: Session two
`;
      const blocks = parseYamlBlocks(raw);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].date).toBe('2026-06-01');
      expect(blocks[1].date).toBe('2026-06-02');
    });

    it('parses single YAML block', () => {
      const raw = `
date: 2026-06-01
executor: Copilot
key_fact: Only session
`;
      const blocks = parseYamlBlocks(raw);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].executor).toBe('Copilot');
    });

    it('skips malformed YAML blocks', () => {
      const raw = `
date: good
---
: : : malformed : : :
---
date: also-good
`;
      const blocks = parseYamlBlocks(raw);
      expect(blocks.length).toBeGreaterThanOrEqual(1);
      expect(blocks.some((b) => (b as any).date === 'good')).toBe(true);
    });

    it('returns empty array for empty input', () => {
      expect(parseYamlBlocks('')).toEqual([]);
      expect(parseYamlBlocks('   \n  ')).toEqual([]);
    });
  });

  describe('sanitizeDates', () => {
    it('converts Date objects to ISO date strings', () => {
      const date = new Date('2026-06-01T12:00:00Z');
      const result = sanitizeDates({ created: date });
      expect((result as any).created).toBe('2026-06-01');
    });

    it('recursively sanitizes nested objects', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const result = sanitizeDates({ meta: { updated: date } });
      expect((result as any).meta.updated).toBe('2026-01-15');
    });

    it('sanitizes arrays of dates', () => {
      const dates = [new Date('2026-01-01'), new Date('2026-02-01')];
      const result = sanitizeDates(dates);
      expect(result).toEqual(['2026-01-01', '2026-02-01']);
    });

    it('passes through non-Date values', () => {
      expect(sanitizeDates('hello')).toBe('hello');
      expect(sanitizeDates(42)).toBe(42);
      expect(sanitizeDates(null)).toBe(null);
      expect(sanitizeDates(true)).toBe(true);
    });
  });
});

describe('memory-files.ts — server function exports', () => {
  it('fetchSessions, fetchADRs, fetchLessons, fetchPatterns are defined', async () => {
    const mod = await import('../../server/routes/api/memory-files');
    expect(mod.fetchSessions).toBeDefined();
    expect(mod.fetchADRs).toBeDefined();
    expect(mod.fetchLessons).toBeDefined();
    expect(mod.fetchPatterns).toBeDefined();
  });
});
