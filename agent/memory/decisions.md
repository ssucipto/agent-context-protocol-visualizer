# Architecture Decision Records (ADR Log)
# Loaded by section (ADR ID) only — never fully loaded
# Add entries via /acp-decide command

## ADR-001: TanStack Start for SSR + Server Functions

**Status:** Accepted  
**Date:** 2026-06-03

**Context:** We need a web framework for the progress dashboard. The dashboard must
read `agent/progress.yaml` from the local filesystem (a Node.js operation) and
render it as an interactive React UI.

**Options considered:**

| Option | Pros | Cons |
|---|---|---|
| Plain Vite React | Simple, fast dev | Can't read filesystem from browser; needs a separate API server |
| Next.js | Mature, full-featured | Heavy; App Router complexity; overkill for a single-page dashboard |
| **TanStack Start** | Server functions for filesystem access; file-based routing; lightweight; same React ecosystem | Newer framework, smaller community |

**Decision:** TanStack Start. Its `createServerFn` abstraction lets us read YAML
files server-side and return typed data to React components without a separate API
server. File-based routing keeps the project structure simple (index, milestones,
search routes).

**Consequences:**
- Server functions (`fetchProgress`, `fetchWatchToken`) handle all filesystem I/O
- No separate backend service needed — everything runs in one Vite/TanStack process
- Must follow TanStack Start's server/client boundary conventions strictly

---

## ADR-002: YAML as the Data Interchange Format

**Status:** Accepted  
**Date:** 2026-06-03

**Context:** The progress data originates from ACP Enhanced's `agent/progress.yaml`.
We need to decide whether to read it as-is or transform it into another format.

**Options considered:**

| Option | Pros | Cons |
|---|---|---|
| Convert to JSON at build time | Faster parse, smaller payload | Extra build step; stale data; loses the "live" feel |
| Use a database (SQLite, etc.) | Queryable, indexed | Adds infrastructure; data already structured in YAML |
| **Read YAML directly** | No transformation; always live; human-editable source of truth | Slower parse (mitigated by js-yaml + server-side only) |

**Decision:** Read YAML directly via `js-yaml` on the server side. The raw data stays
in its native ACP Enhanced format. Parsing happens once per request (or on file change),
never on the client.

**Consequences:**
- `agent/progress.yaml` remains the single source of truth
- Server function `parseProgressYaml()` handles parsing + Zod validation
- Adding new YAML fields requires updating types in `src/lib/types.ts`
- Users can edit `progress.yaml` directly and see changes on next poll cycle

---

## ADR-003: Polling-Based Auto-Refresh (Not WebSocket)

**Status:** Accepted  
**Date:** 2026-06-03

**Context:** The dashboard needs to show real-time updates when `progress.yaml`
changes. We need a mechanism to detect file changes and refresh the UI.

**Options considered:**

| Option | Pros | Cons |
|---|---|---|
| WebSocket / SSE | Push-based, instant | Requires persistent connection; more infrastructure; file changes aren't push events |
| `fs.watch` / chokidar | OS-level file events | Platform-specific quirks; doesn't work in serverless (Vercel) |
| **Poll mtime every 2s** | Simple; works everywhere; lightweight | Up to 2s delay; wasted polls when file hasn't changed |

**Decision:** Poll the file's `mtime` every 2 seconds via a lightweight server
function (`fetchWatchToken`). Only re-fetch the full YAML when mtime changes.
This is the simplest approach that works across all deployment targets (local dev,
Vercel serverless).

**Consequences:**
- `useProgressData()` hook runs a `setInterval` at 2s polling the mtime endpoint
- `fetchWatchToken` uses `fs.statSync` — a single stat call, not a full YAML parse
- Full data re-fetch only triggers when mtime differs from last known value
- Acceptable ~2s latency for a dashboard display; could be tuned via `POLL_INTERVAL_MS`

