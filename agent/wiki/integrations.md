# Service Integrations — XML-tagged sections, load one section at a time

<filesystem>
  type: Local filesystem (Node.js fs)
  reads: agent/progress.yaml (configurable via PROGRESS_YAML_PATH env var)
  polling: mtime check every 2s via fs.statSync
</filesystem>

<external_apis>
  # No external APIs — this is a read-only dashboard that consumes local YAML files
  # Future: GitHub API for remote progress.yaml reading (P1 roadmap)
</external_apis>

<deployment>
  platform: Vercel (serverless + static)
  runtime: Node.js (for TanStack Start server functions)
  env_vars:
    - PROGRESS_YAML_PATH: Path to the progress.yaml file (defaults to agent/progress.yaml)
</deployment>
