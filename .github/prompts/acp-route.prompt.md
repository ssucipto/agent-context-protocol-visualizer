---
mode: agent
description: Classify and route a task to the cheapest appropriate executor
---

Given the task description: ${input}

1. Read `agent/routing/taxonomy.yml` and `agent/routing/rules.md`
2. Match to the closest task_type
3. If uncertain, read `agent/routing/rules.md` ambiguity resolution section
4. Get next task ID from the highest existing ID in `agent/routing/tasks/`
5. Create `agent/routing/tasks/task-[ID].md` with complete YAML frontmatter
6. Append a pending row to `agent/routing/ledger.md`
7. Output: "Task [ID] created | executor: [X] | est. [N] tokens | [file path]"
