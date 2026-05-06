import { createServerFn } from '@tanstack/react-start';
import { statSync } from 'node:fs';

const DEFAULT_PATH = process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml';

/**
 * Server function that returns the mtime of progress.yaml.
 * The client polls this periodically; when mtime changes, data is re-fetched.
 * This is the polling-based equivalent of an SSE file watcher.
 */
export const fetchWatchToken = createServerFn({ method: 'GET' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) => {
    const filePath = data.path ?? DEFAULT_PATH;
    try {
      const stat = statSync(filePath);
      return { mtime: stat.mtimeMs, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { mtime: null, error: message };
    }
  });
