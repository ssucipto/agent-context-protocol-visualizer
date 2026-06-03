import { createServerFn } from '@tanstack/react-start';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_PATH = process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml';

function sanitizePath(input: string): string {
  const resolved = resolve(input);
  if (!resolved.startsWith(resolve(process.cwd()))) {
    throw new Error(`Access denied: path outside project root`);
  }
  return resolved;
}

export const fetchWatchToken = createServerFn({ method: 'GET' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) => {
    const rawPath = data.path ?? DEFAULT_PATH;
    try {
      const filePath = sanitizePath(rawPath);
      const stat = statSync(filePath);
      return { mtime: stat.mtimeMs, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { mtime: null, error: message };
    }
  });
