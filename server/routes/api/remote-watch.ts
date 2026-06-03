import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';
import { resolveToken, type TokenMap } from '../../../src/lib/config';

// ── Server-side token loading ──────────────────────────────────────────────

let _tokenMap: TokenMap | null = null;
function loadServerTokenMap(): TokenMap {
  if (_tokenMap) return _tokenMap;
  const p = process.cwd() + '/.github-tokens.json';
  if (existsSync(p)) { try { _tokenMap = JSON.parse(readFileSync(p, 'utf-8')); return _tokenMap!; } catch {} }
  _tokenMap = {};
  return _tokenMap;
}

// Shared ETag cache (same as github-fetch.ts — import or share)
const etagCache = new Map<string, string>();

/**
 * Server function for remote HEAD check.
 * Uses If-None-Match / ETag to detect changes without consuming rate limit.
 * Returns 304-safe token: null if unchanged, mtime-like timestamp if changed.
 */
export const fetchRemoteWatch = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: {
      repo: string;
      ref?: string;
      filePath?: string;
      tokenEnv?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { repo, ref = 'main', filePath = 'agent/progress.yaml', tokenEnv } = data;
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${filePath}`;

    const owner = repo.split('/')[0];
    const token = resolveToken(owner, tokenEnv, loadServerTokenMap());

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const etag = etagCache.get(repo);
    if (etag) {
      headers['If-None-Match'] = etag;
    }

    try {
      // HEAD request — no body, just headers
      const res = await fetch(url, { method: 'HEAD', headers });

      if (res.status === 304) {
        // Unchanged — return the cached token
        return { mtime: null, unchanged: true, error: null };
      }

      if (!res.ok) {
        return {
          mtime: null,
          unchanged: false,
          error: `GitHub error ${res.status}: ${res.statusText}`,
        };
      }

      // Cache new ETag
      const newEtag = res.headers.get('ETag');
      if (newEtag) {
        etagCache.set(repo, newEtag);
      }

      // Return a pseudo-mtime from Last-Modified or current time
      const lastModified = res.headers.get('Last-Modified');
      const mtime = lastModified
        ? new Date(lastModified).getTime()
        : Date.now();

      return { mtime, unchanged: false, error: null };
    } catch {
      return {
        mtime: null,
        unchanged: false,
        error: 'Cannot reach GitHub. Check your internet connection.',
      };
    }
  });
