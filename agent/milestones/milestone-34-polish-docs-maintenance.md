---
created: 2026-06-03
completed:
---

# Milestone 34: Polish, Docs Viewer & Maintenance

**Priority**: 1  
**Status**: planned  
**Estimated Weeks**: 2  
**Design**: [local.m34-polish-and-docs](../design/local.m34-polish-and-docs.md)  

---

## Objective

Polish the visualizer for real-world daily use. Add a built-in markdown viewer for project documents (PRDs, reports, wiki, README), fix the port display bug, add a maintenance page for server management, overhaul the packages page with NPM + ACP tabs, add ACP Enhanced route cost reports, and align the installation procedure with ACP Enhanced conventions.

---

## Tasks

### T1: Fix Port Display Bug (0.5h)
**Priority**: P0 (bug)  

The `ServerInfoDisplay` always shows `:3000` regardless of actual port. Fix by reading `window.location.port` on the client side instead of `process.env.PORT` on the server.

- Use `window.location.port` in `ServerInfoDisplay`
- Keep `getServerInfo` for data source info only

### T2: Markdown Document Viewer (3h)
**Priority**: P1  

Add a new route `/docs` that renders any markdown file from the project. Supports:
- `agent/reports/` — audit reports, bug reports
- `agent/wiki/` — architecture, domain, integrations
- `agent/design/` — design documents
- `README.md` — project README
- `agent/artifacts/` — research, glossary, reference
- `agent/specs/` — specification documents
- `agent/clarifications/` — clarification documents

Features:
- Server function to read and serve markdown content (glob + read)
- Client-side markdown rendering with `marked` + `highlight.js`
- File browser sidebar showing available documents grouped by directory
- Code syntax highlighting (YAML, TS, JSON, bash, markdown)
- Table of contents auto-generated from headings
- Pagination for files > 500 lines (virtual scroll or page chunks)
- Back-to-top button for long documents

### T3: Packages Page Overhaul — NPM + ACP Tabs (1.5h)
**Priority**: P2  

Redesign `/packages` with two tabs:

**Tab 1: NPM Dependencies** — reads `package.json`:
- Production dependencies (table: name, version, latest)
- Dev dependencies (table: name, version, latest)
- ⚠️ Audit warnings: deprecated packages, security vulnerabilities
- Total counts and summary stats
- `npm audit` integration (server function)

**Tab 2: ACP Framework** — reads `agent/manifest.yaml`:
- Installed ACP packages with versions and dates
- Empty state: "No ACP packages installed. This project may not use ACP Enhanced."

### T4: Maintenance / Server Manager Page (2h)
**Priority**: P1  

New route `/maintenance`:
- Scan ports 3000-3020 for running Vite/Node processes
- Display: port, PID, process name, uptime (if available)
- Shutdown button per instance (POST to that instance's `/api/shutdown`)
- Port conflict detection with visual indicators
- System info: Node.js version, OS, memory usage
- Cross-platform: `lsof` on macOS/Linux, `netstat` fallback on Windows

### T5: Installation Alignment with ACP Enhanced (1h)
**Priority**: P2  

- Support `~/.acp/visualizer/` as default install path
- Add install script: `scripts/install.sh`
- `npm link` for global `acp-visualizer` command
- Update README with install instructions

### T6: Sidebar — Add "Tools" Section (0.5h)
**Priority**: P2  

Create new sidebar section "🛠 Tools" with:
- 📄 Docs (markdown viewer → `/docs`)
- 🔧 Maintenance (server manager → `/maintenance`)
- 📊 Route Costs (ACP Enhanced → `/route-costs`)

Place between "Project Intelligence" and "Management" sections.

### T7: ACP Enhanced Route Cost Reports (1.5h)
**Priority**: P2  

New route `/route-costs` that reads ACP Enhanced's routing data:
- Parse `agent/routing/ledger.md` — per-route cost ledger
- Parse `agent/routing/taxonomy.yml` — executor taxonomy
- Display: route ID, task, executor, cost, timestamp
- Summary: total costs by executor, by milestone, over time
- Empty state: "No route cost data found. This project may not use ACP Enhanced routing."
- Group by: executor, milestone, or date

---

## Verification

- [ ] Port display shows actual running port from `window.location.port`
- [ ] `/docs` renders markdown with syntax highlighting
- [ ] `/docs` file browser shows available documents grouped by directory
- [ ] `/packages` has NPM tab (with audit warnings) and ACP tab
- [ ] `/maintenance` shows running server instances with shutdown
- [ ] `/route-costs` shows ACP Enhanced routing ledger data
- [ ] Install procedure documented and tested
- [ ] Sidebar has "Tools" section with Docs, Maintenance, Route Costs
- [ ] All existing tests still pass (43/43)
