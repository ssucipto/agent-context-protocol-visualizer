---
mode: agent
description: Create a new Architecture Decision Record
---

Create a new ADR for the decision: ${input}

1. Get next ADR ID from `agent/memory/decisions.md`
2. Prompt for (or infer from context):
   - Why this decision was needed
   - What options were considered
   - What was decided
   - What the consequences are
   - What would trigger re-opening this decision
3. Append to `agent/memory/decisions.md`:
   ## ADR-[ID] | [date] | [title]
   **Status:** Accepted
   **Context:** ...
   **Options considered:** ...
   **Decision:** ...
   **Consequences:** ...
   **DO NOT re-open** unless [trigger].
4. Confirm: "ADR-[ID] created: [title]"
