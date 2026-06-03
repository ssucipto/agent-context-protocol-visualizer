---
mode: agent
description: Bootstrap domain knowledge from codebase — run ONCE on new project
---

Bootstrap ACP domain knowledge from this codebase:

1. Scan the project source files to understand the structure
2. Extract and write to `agent/wiki/domain.yml`:
   - entities: core domain objects (data models, types, interfaces)
   - operations: major functions/endpoints grouped by category
   - modules: main packages or modules in the project
3. Identify any external service dependencies (APIs, databases, cloud services)
4. Write placeholders to `agent/wiki/integrations.md` for each external dependency:
   - service name and type
   - environment variable names used (values redacted)
   - any config file references found
5. Fill in `agent/core/identity.yml` stack fields based on actual tech stack found
6. Confirm: "[ACP] Domain extraction complete | [N] entities | [N] modules | [N] external services"
