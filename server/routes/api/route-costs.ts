import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export interface RouteCostEntry {
  routeId: string;
  task: string;
  executor: string;
  cost: string;
  timestamp: string;
}

/** Derive project root from PROGRESS_YAML_PATH (set by CLI), fall back to CWD. */
function getProjectRoot(): string {
  const yamlPath = process.env['PROGRESS_YAML_PATH'];
  if (yamlPath) return dirname(dirname(yamlPath));
  return process.cwd();
}

/**
 * Parse ACP Enhanced's routing ledger for cost data.
 */
export const fetchRouteCosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const ledgerPath = getProjectRoot() + '/agent/routing/ledger.md';
    if (!existsSync(ledgerPath)) return { entries: [] as RouteCostEntry[], error: null };

    try {
      const raw = readFileSync(ledgerPath, 'utf-8');
      const entries: RouteCostEntry[] = [];
      const lines = raw.split('\n');

      for (const line of lines) {
        const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
        if (cols.length >= 5 && cols[0]?.startsWith('route-')) {
          entries.push({
            routeId: cols[0],
            task: cols[1] || '',
            executor: cols[2] || '',
            cost: cols[3] || '',
            timestamp: cols[4] || '',
          });
        }
      }
      return { entries, error: null };
    } catch {
      return { entries: [], error: null };
    }
  });
