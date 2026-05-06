import { createServerFn } from '@tanstack/react-start';
import { readFileSync } from 'node:fs';
import { parseProgressYaml } from '../../../src/lib/yaml-loader';

const DEFAULT_PATH = process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml';

/**
 * Server function that reads and parses progress.yaml from the filesystem.
 * Accepts an optional file path override via the `path` input field.
 */
export const fetchProgress = createServerFn({ method: 'GET' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) => {
    const filePath = data.path ?? DEFAULT_PATH;
    try {
      const raw = readFileSync(filePath, 'utf-8');
      return { data: parseProgressYaml(raw), error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { data: null, error: message };
    }
  });
