import { createServerFn } from '@tanstack/react-start';
import { statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const DEFAULT_PATH = process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml';

/** Derive project root for path traversal guard. Respects PROGRESS_YAML_PATH. */
function getProjectRoot(): string {
  const yamlPath = process.env['PROGRESS_YAML_PATH'];
  if (yamlPath) return dirname(dirname(yamlPath));
  return process.cwd();
}

function sanitizePath(input: string): string {
  const resolved = resolve(input);
  if (!resolved.startsWith(resolve(getProjectRoot()))) {
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
