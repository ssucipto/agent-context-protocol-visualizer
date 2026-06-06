import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';

// NOTE: This file tests the path sanitization LOGIC, not the actual
// fetchProgress server function. TanStack Start server functions
// (createServerFn) require the SSR HTTP protocol and cannot be called
// directly in Vitest. The real sanitizePath() in progress.ts is internal
// (not exported). For full integration testing, use TanStack Start's
// e2e test utilities or test via HTTP.

/** Duplicate of progress.ts's sanitizePath logic for unit testing */

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

