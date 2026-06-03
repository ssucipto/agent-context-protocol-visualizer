import { createServerFn } from '@tanstack/react-start';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ProjectConfig } from '../../../src/lib/projects';

interface ProjectsFile {
  projects: ProjectConfig[];
}

/**
 * Load project configurations from .visualizer-projects.json or env vars.
 */
export const loadProjectConfigs = createServerFn({ method: 'GET' })
  .handler(async () => {
    // 1. Try JSON file
    const filePath = join(process.cwd(), '.visualizer-projects.json');
    if (existsSync(filePath)) {
      try {
        const raw = readFileSync(filePath, 'utf-8');
        const file: ProjectsFile = JSON.parse(raw);
        if (file.projects && file.projects.length > 0) {
          return { projects: file.projects };
        }
      } catch { /* malformed JSON — fall through */ }
    }

    // 2. Try env var
    const envProjects = process.env['VISUALIZER_PROJECTS'];
    if (envProjects) {
      const projects = envProjects.split(',').map((entry, i) => {
        const [name, value] = entry.split(':');
        const isGitHub = value?.includes('/');
        return {
          name: name?.trim() || `project-${i + 1}`,
          source: isGitHub ? ('github' as const) : ('local' as const),
          path: !isGitHub ? value?.trim() : undefined,
          repo: isGitHub ? value?.trim() : undefined,
        };
      });
      return { projects };
    }

    // 3. Default single project
    const localPath = process.env['PROGRESS_YAML_PATH'];
    const remoteRepo = process.env['PROGRESS_YAML_REPO'];

    if (remoteRepo) {
      return {
        projects: [{
          name: remoteRepo.split('/').pop() || 'remote',
          source: 'github' as const,
          repo: remoteRepo,
        }],
      };
    }

    return {
      projects: [{
        name: 'local',
        source: 'local' as const,
        path: localPath ?? 'agent/progress.yaml',
      }],
    };
  });

/**
 * Save project configs to .visualizer-projects.json.
 */
export const saveProjectConfigs = createServerFn({ method: 'POST' })
  .inputValidator((input: { projects: ProjectConfig[] }) => input)
  .handler(async ({ data }) => {
    writeFileSync(
      join(process.cwd(), '.visualizer-projects.json'),
      JSON.stringify({ projects: data.projects }, null, 2) + '\n',
      'utf-8',
    );
    return { ok: true };
  });
