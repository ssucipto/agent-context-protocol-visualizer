// ── Types ──────────────────────────────────────────────────────────────────

export interface DataSourceConfig {
  type: 'local' | 'github';
  /** Filesystem path (local mode) */
  path?: string;
  /** GitHub owner/repo (remote mode) */
  repo?: string;
  /** Branch or tag (default: main) */
  ref?: string;
  /** File path within repo (default: agent/progress.yaml) */
  filePath?: string;
  /** Env var name for a per-repo PAT (e.g. GITHUB_TOKEN_SSUCIPTO) */
  tokenEnv?: string;
}

export interface TokenMap {
  [owner: string]: string;
}

// ── Config Parsing ─────────────────────────────────────────────────────────

const REPO_REGEX = /^([\w.-]+)\/([\w.-]+)(?::([\w./-]+))?(?::([\w./-]+))?$/;

/**
 * Parse PROGRESS_YAML_REPO env var.
 *
 * Formats:
 *   owner/repo
 *   owner/repo:branch
 *   owner/repo:branch:path/to/file.yaml
 */
function parseRepoString(raw: string): { repo: string; ref: string; filePath: string } {
  const match = raw.match(REPO_REGEX);
  if (!match) {
    throw new Error(`Invalid PROGRESS_YAML_REPO format: "${raw}". Expected owner/repo[:ref[:path]]`);
  }
  const [, owner, name, refOrPath, maybePath] = match;
  const repo = `${owner}/${name}`;

  // owner/repo:branch:path  →  ref=branch, filePath=path
  if (maybePath !== undefined) {
    return { repo, ref: refOrPath!, filePath: maybePath };
  }

  // owner/repo:something — could be a branch or a full path
  if (refOrPath !== undefined) {
    // If it contains a '/', treat as a file path with default ref
    if (refOrPath.includes('/')) {
      return { repo, ref: 'main', filePath: refOrPath };
    }
    // Otherwise treat as branch with default file path
    return { repo, ref: refOrPath, filePath: 'agent/progress.yaml' };
  }

  // owner/repo only
  return { repo, ref: 'main', filePath: 'agent/progress.yaml' };
}

// ── Token Loading ──────────────────────────────────────────────────────────

/**
 * Load .github-tokens.json from the project root.
 * Client-safe: returns empty map. Server-side token resolution
 * happens via server functions (github-fetch.ts, remote-watch.ts)
 * which have access to the filesystem.
 */
export function loadTokenMap(): TokenMap {
  return {};
}

/**
 * Resolve a token for a GitHub repo owner.
 * Priority: 1) tokenEnv env var  2) .github-tokens.json owner mapping  3) GITHUB_TOKEN fallback
 */
export function resolveToken(owner: string, tokenEnv?: string, tokenMapOverride?: TokenMap): string | null {
  // 1) Per-repo token via explicit env var name
  if (tokenEnv && process.env[tokenEnv]) {
    return process.env[tokenEnv]!;
  }

  // 2) .github-tokens.json owner → token mapping (or server override)
  const tokenMap = tokenMapOverride ?? loadTokenMap();
  if (tokenMap[owner]) {
    return tokenMap[owner];
  }

  // 3) Global GITHUB_TOKEN fallback
  if (process.env['GITHUB_TOKEN']) {
    return process.env['GITHUB_TOKEN']!;
  }

  return null;
}

// ── Config Resolution ──────────────────────────────────────────────────────

/**
 * Build DataSourceConfig from environment variables.
 *
 * Local:   PROGRESS_YAML_PATH=../other-project/agent/progress.yaml
 * Remote:  PROGRESS_YAML_REPO=ssucipto/acp-enhanced:main
 *
 * Remote takes precedence if both are set.
 */
export function resolveDataSourceConfig(): DataSourceConfig {
  const repoRaw = process.env['PROGRESS_YAML_REPO'];

  if (repoRaw) {
    const { repo, ref, filePath } = parseRepoString(repoRaw);
    const owner = repo.split('/')[0];
    const tokenEnv = process.env['PROGRESS_YAML_TOKEN_ENV'] ?? undefined;

    // Only set tokenEnv if token would actually resolve
    const hasToken = tokenEnv
      ? !!process.env[tokenEnv]
      : !!(loadTokenMap()[owner] || process.env['GITHUB_TOKEN']);

    return {
      type: 'github',
      repo,
      ref,
      filePath,
      tokenEnv: hasToken ? tokenEnv : undefined,
    };
  }

  // Local fallback
  return {
    type: 'local',
    path: process.env['PROGRESS_YAML_PATH'] ?? 'agent/progress.yaml',
  };
}
