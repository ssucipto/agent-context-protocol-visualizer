import { createServerFn } from '@tanstack/react-start';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { parseProgressYaml } from '../../../src/lib/yaml-loader';
import { formatParseError } from '../../../src/lib/format-error';

const DEFAULT_PATH = process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml';

/** Derive project root for path traversal guard. Respects PROGRESS_YAML_PATH. */
function getProjectRoot(): string {
  const yamlPath = process.env['PROGRESS_YAML_PATH'];
  if (yamlPath) return dirname(dirname(yamlPath));
  return process.cwd();
}

function sanitizePath(input: string): string {
  const resolved = resolve(input);
  // Prevent traversal outside project root (which may differ from CWD)
  if (!resolved.startsWith(resolve(getProjectRoot()))) {
    throw new Error(`Access denied: path outside project root`);
  }
  return resolved;
}

export const fetchProgress = createServerFn({ method: 'GET' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) => {
    const rawPath = data.path ?? DEFAULT_PATH;
    try {
      const filePath = sanitizePath(rawPath);
      const raw = readFileSync(filePath, 'utf-8');
      return { data: parseProgressYaml(raw), error: null };
    } catch (err: unknown) {
      const message = formatParseError(err);
      return { data: null, error: message };
    }
  });
