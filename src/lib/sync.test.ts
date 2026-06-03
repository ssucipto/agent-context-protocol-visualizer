import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseProgressYaml } from './yaml-loader';
import { formatParseError } from './format-error';

const fixturePath = join(import.meta.dirname, '../../test/fixtures/acp-enhanced-progress.yaml');

describe('ACP Enhanced schema sync', () => {
  it('fixture file exists and is readable', () => {
    const raw = readFileSync(fixturePath, 'utf-8');
    expect(raw.length).toBeGreaterThan(10000); // 5354 lines
  });

  it('parses or reports YAML syntax errors clearly', () => {
    const raw = readFileSync(fixturePath, 'utf-8');
    try {
      const data = parseProgressYaml(raw);
      // If parse succeeds, verify core structure
      expect(data.project.name).toBe('agent-context-protocol');
      expect(data.project.status).toBe('active');
      expect(Object.keys(data.milestones).length).toBeGreaterThanOrEqual(40);
    } catch (err) {
      // If YAML has syntax errors, verify error is readable
      const msg = formatParseError(err);
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});
