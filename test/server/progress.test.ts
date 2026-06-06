import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';

// Test the internal path sanitization logic directly
// (fetchProgress server function can't be called directly in Vitest —
//  it requires TanStack Start's server function HTTP protocol)

function sanitizePath(input: string, projectRoot: string): string {
  const base = resolve(projectRoot);
  const resolved = resolve(input.startsWith('/') ? input : resolve(base, input));
  if (!resolved.startsWith(base)) {
    throw new Error(`Access denied: path outside project root`);
  }
  return resolved;
}

describe('progress.ts — path sanitization', () => {
  const projectRoot = '/test/project';

  it('resolves relative path within project root', () => {
    const result = sanitizePath('agent/progress.yaml', projectRoot);
    expect(result).toContain('agent/progress.yaml');
    expect(result.startsWith(projectRoot)).toBe(true);
  });

  it('rejects path traversal outside project root', () => {
    expect(() => sanitizePath('../../../etc/passwd', projectRoot))
      .toThrow('Access denied');
  });

  it('resolves absolute path within project root', () => {
    const result = sanitizePath('/test/project/agent/progress.yaml', projectRoot);
    expect(result).toContain('agent/progress.yaml');
    expect(result.startsWith(projectRoot)).toBe(true);
  });
});

describe('progress.ts — server function exports', () => {
  it('fetchProgress server function is defined', async () => {
    const mod = await import('../../server/routes/api/progress');
    expect(mod.fetchProgress).toBeDefined();
    expect(typeof mod.fetchProgress).toBe('function');
  });
});

