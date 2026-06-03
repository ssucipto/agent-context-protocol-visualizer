// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectConfig {
  name: string;
  source: 'local' | 'github';
  path?: string;
  repo?: string;
  branch?: string;
}

// ── Client-side helpers (no fs) ────────────────────────────────────────────

/**
 * Parse VISUALIZER_PROJECTS env-var-style string into ProjectConfig array.
 * Client-safe — does not access filesystem.
 */
export function parseEnvProjects(raw: string): ProjectConfig[] {
  return raw.split(',').map((entry, i) => {
    const [name, value] = entry.split(':');
    const isGitHub = value?.includes('/');
    return {
      name: name?.trim() || `project-${i + 1}`,
      source: isGitHub ? ('github' as const) : ('local' as const),
      path: !isGitHub ? value?.trim() : undefined,
      repo: isGitHub ? value?.trim() : undefined,
    };
  });
}
