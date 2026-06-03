import { createServerFn } from '@tanstack/react-start';

/**
 * Gracefully terminates the visualizer process.
 * Schedules exit after 100ms so the HTTP response can be sent first.
 */
export const shutdown = createServerFn({ method: 'POST' })
  .handler(async () => {
    setTimeout(() => {
      console.log('🛑 Server stopped via /api/shutdown');
      process.exit(0);
    }, 100);
    return { ok: true };
  });

/**
 * Returns runtime server info: port and data source.
 */
export const getServerInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const dataSource = process.env['PROGRESS_YAML_PATH'] || process.env['PROGRESS_YAML_REPO'] || 'unknown';
    const sourceType = process.env['PROGRESS_YAML_REPO'] ? 'github' : 'local';
    return {
      port: process.env['PORT'] || '3000',
      dataSource,
      sourceType: sourceType as 'local' | 'github',
    };
  });
