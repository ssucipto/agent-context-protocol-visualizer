# M34: Polish, Docs Viewer & Maintenance

**Concept**: Final polish pass — turn the visualizer from a feature-complete tool into a polished daily driver with document browsing, server management, and enhanced package visibility.  
**Created**: 2026-06-03  
**Status**: draft  

## Key Decisions

### D1: Markdown rendering — marked + highlight.js
Use `marked` for parsing (lightweight, no JSX dependency) and `highlight.js` for syntax highlighting. Both are pure JS — no React-specific markdown libs needed. Server function returns raw markdown; client renders.

### D2: Packages page — tabbed design
NPM deps and ACP frameworks are separate concerns. Two tabs prevent information overload. NPM tab includes `npm audit` warnings for security visibility.

### D3: Maintenance page — lsof + netstat fallback
macOS/Linux use `lsof -ti :PORT`. Windows falls back to `netstat -ano | findstr :PORT`. Server function handles platform detection.

### D4: Port display fix — client-side only
`window.location.port` is always accurate. No server function needed. Simplest possible fix.

### D5: Route costs — read-only from ACP Enhanced
Parse `agent/routing/ledger.md` and `agent/routing/taxonomy.yml`. If files don't exist, show empty state. No write operations — this is a visualization, not a router.

### D6: Sidebar structure — add "Tools" section
New section between Intelligence and Management. Three links: Docs, Maintenance, Route Costs.
