# System Architecture
# Update monthly or when service boundaries change
# last_verified: 2026-06-03

## System Map

```
Browser (React SPA)
  │
  ├─ TanStack Start Server Functions (Node.js)
  │   ├─ fetchProgress()   — reads agent/progress.yaml, returns parsed JSON
  │   └─ fetchWatchToken() — stats the file mtime for polling
  │
  └─ Client Components
      ├─ useProgressData()  — hook: fetch + 2s poll loop
      ├─ fuse.js index      — fuzzy search across milestones + tasks
      └─ TanStack Table     — sortable milestone grid
```

## Service Boundaries

| Layer | Responsibility |
| --- | --- |
| `server/routes/api/` | Server functions: read YAML from disk, return typed JSON |
| `src/lib/yaml-loader.ts` | Parse progress.yaml → typed `ProgressData` |
| `src/lib/data-source.ts` | React hook: fetch + poll mtime → auto-refresh |
| `src/lib/search.ts` | fuse.js index builder for client-side fuzzy search |
| `src/components/` | Presentational components: table, tree, badges, filters |

## Key Data Flows

1. **Page load** → `useProgressData()` calls `fetchProgress()` server function → reads YAML → returns typed `ProgressData` → renders components
2. **Polling** → every 2s, calls `fetchWatchToken()` → returns file mtime → if changed, re-fetches data
3. **Search** → user types → `SearchBar` calls fuse.js on indexed milestones+tasks → filters results
4. **Filtering** → user selects status → `FilterBar` filters milestones by status

## External Dependencies

- **ACP Enhanced's progress.yaml** — the data source this dashboard reads (no network calls)
- **TanStack Start** — SSR framework providing server functions + file-based routing
- **fuse.js** — client-side fuzzy search library
- **js-yaml** — YAML parser (used server-side)
- **@tanstack/react-table** — headless table with sorting
| git commit touching >5 files | Treat as phase boundary → write sessions.md |

**Corollary**: `/acp-commit` is NOT an end-of-session-only command. It runs at every phase boundary.
The session-end `/acp-commit` finalises a session that already has most entries written.

## Dispatch Script Flow (Persona B/C)

```
npx ts-node scripts/acp-dispatch.ts agent/routing/tasks/task-NNN.md
     ↓
  Read task frontmatter (gray-matter)
  Look up executor in taxonomy.yml
  Assemble system prompt (Layer 1 + skill) — STATIC for caching
  Assemble user message (sessions + lessons + task) — dynamic
  Enforce 6,500 token budget
  Update agent/core/routing.yml with executor
  Call OpenRouter API (streaming)
  Append row to agent/routing/ledger.md
```
