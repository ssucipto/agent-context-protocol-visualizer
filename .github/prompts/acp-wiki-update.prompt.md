---
mode: agent
description: Update a wiki file section after architectural changes
---

Update wiki for: ${input}

1. Determine which wiki file is affected:
   - Domain entity/operation changes → `agent/wiki/domain.yml`
   - External service/integration changes → `agent/wiki/integrations.md`
   - Service boundary/architecture changes → `agent/wiki/architecture.md`
2. Read the current content of the relevant section
3. Update ONLY the affected section — do not rewrite other sections
4. Update `last_verified` date in the file header
5. Confirm: "[ACP] Wiki updated: [file] | section: [section] | [date]"
