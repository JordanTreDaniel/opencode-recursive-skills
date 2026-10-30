---
name: project-tracker
description: Manage a generic work-tracking system — create tasks, schedule across calendars, and roll up reports. Use when the user asks to add a task, find a meeting slot, or summarize project activity. Routes to the correct sub-skill.
---

# project-tracker

A single entry point over a work-tracking system with three **unrelated**
capabilities. Each capability lives in its own sub-skill because the steps,
templates, and reference material share nothing with the others.

## What this skill does

Pick the sub-skill that matches the task at hand. Do not read the others —
they will only waste context.

| If the user wants to… | Load sub-skill |
| --- | --- |
| add / create a task | `sub-skills/task-creation/` |
| find a time to meet / schedule | `sub-skills/calendar-scheduling/` |
| summarize / report / roll up activity | `sub-skills/reporting/` |

## Layout

- `reference/` — shared reference material (API limits, field mapping, property glossary).
- `scripts/` — shared scripts: `shared-auth.sh` loads a session token before
  any API call, `new-ticket.sh` scaffolds a task body, `status-report.sh`
  prints a status digest.
- `sub-skills/` — one directory per independent capability.

Each sub-skill has its own `SKILL.md` plus its own templates, scripts, or
queries. Start there; the root `SKILL.md` should stay small.
