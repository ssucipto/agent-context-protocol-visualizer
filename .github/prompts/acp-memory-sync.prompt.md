---
mode: agent
description: Monthly memory compaction — run first Friday of each month
---

Perform ACP monthly memory sync:

1. Read `agent/memory/sessions.md`
2. Find all weekly summary entries older than 4 weeks
3. Compress them into a monthly summary block:
   - month, features_shipped, architectural_changes (ADR IDs), recurring_issues,
     net_new_patterns count
4. Read `agent/memory/patterns.md`
5. Flag entries older than 60 days as stale (add `stale: true` flag)
6. Read `agent/wiki/architecture.md` — check last_verified date
7. If last_verified > 30 days ago → output: "⚠ architecture.md needs verification"
8. Output: "[ACP] Memory sync complete | sessions.md: [N] entries | [N] stale patterns flagged"
