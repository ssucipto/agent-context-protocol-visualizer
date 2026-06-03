# Audit Carryovers
# Populated by /acp-audit — findings that require follow-up in future sessions

carryovers:
  - finding_id: audit-1-F1
    finding: "Schema gap: progress.yaml has current_blockers but TypeScript types (ProgressData) do not define it"
    severity: medium
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-1-F2
    finding: "Live progress.yaml is a bootstrap stub — M25 shows completed but has no tasks, recent_work, or notes. Does not reflect actual development history"
    severity: high
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-1-F4
    finding: "ACP Enhanced schema drift risk — if ACP Enhanced adds/renames fields in progress.yaml, visualizer types may silently ignore or break"
    severity: high
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-1-F5
    finding: "No schema validation — yaml-loader.ts uses 'as' type assertions without Zod/schema runtime validation"
    severity: medium
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-1-F7
    finding: "No deploy/CI pipeline — no GitHub Actions, no Vercel config, no build verification"
    severity: medium
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-1-F8
    finding: "Test coverage thin — only yaml-loader.test.ts has tests; components, hooks, server functions untested"
    severity: medium
    status: pending
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-2-P1
    finding: "Deployment model mismatch: Vercel can only serve bundled progress.yaml, not arbitrary ACP projects. Primary usage should be local dev; Vercel is demo-only"
    severity: critical
    status: pending
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-2-P4
    finding: "Missing started and description fields on ProjectMetadata type — test fixture has them but types don't"
    severity: medium
    status: pending
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-2-P5
    finding: "Schema version pin (M28 T10) is documentation-only with no CI enforcement"
    severity: medium
    status: pending
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: null
    verified_in_audit: null
