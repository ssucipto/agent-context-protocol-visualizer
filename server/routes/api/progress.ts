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
  // Resolve relative paths against the project root (from PROGRESS_YAML_PATH),
  // not CWD. This handles the case where the client sends a relative path
  // like 'agent/progress.yaml' but the server was started with a different
  // project via --path /some/other/project.
  const base = resolve(getProjectRoot());
  const resolved = resolve(input.startsWith('/') ? input : resolve(base, input));
  if (!resolved.startsWith(base)) {
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
