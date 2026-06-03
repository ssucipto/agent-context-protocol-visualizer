import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectConfig {
  name: string;
  source: 'local' | 'github';
  path?: string;
  repo?: string;
  branch?: string;
}

interface ProjectsFile {
  projects: ProjectConfig[];
}

// ── Config Loading ─────────────────────────────────────────────────────────

/**
 * Load project configurations.
 *
 * Priority:
 *   1. .visualizer-projects.json (from visualizer root)
 *   2. VISUALIZER_PROJECTS env var (format: name1:path1,name2:repo2)
 *   3. Default single project from PROGRESS_YAML_PATH or PROGRESS_YAML_REPO
 */
export function loadProjectConfigs(): ProjectConfig[] {
  // 1. Try JSON file
  try {
    const raw = readFileSync(join(process.cwd(), '.visualizer-projects.json'), 'utf-8');
    const file: ProjectsFile = JSON.parse(raw);
    if (file.projects && file.projects.length > 0) {
      return file.projects;
    }
  } catch {
    // File doesn't exist or is malformed — continue to fallback
  }

  // 2. Try env var
  const envProjects = process.env['VISUALIZER_PROJECTS'];
  if (envProjects) {
    return envProjects.split(',').map((entry, i) => {
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

  // 3. Default single project
  const localPath = process.env['PROGRESS_YAML_PATH'];
  const remoteRepo = process.env['PROGRESS_YAML_REPO'];

  if (remoteRepo) {
    return [{
      name: remoteRepo.split('/').pop() || 'remote',
      source: 'github',
      repo: remoteRepo,
    }];
  }

  return [{
    name: 'local',
    source: 'local',
    path: localPath ?? 'agent/progress.yaml',
  }];
}

/**
 * Save project configs to .visualizer-projects.json.
 */
export function saveProjectConfigs(projects: ProjectConfig[]): void {
  const { writeFileSync } = require('node:fs');
  writeFileSync(
    join(process.cwd(), '.visualizer-projects.json'),
    JSON.stringify({ projects }, null, 2) + '\n',
    'utf-8',
  );
}
