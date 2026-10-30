---
name: project-tracker-task-creation
description: Create a task in the tracker from a template. Use when the user wants to add a new task, file a request, or open an item. Handles field mapping and validation against the property glossary.
---

# Task creation

Create a single tracker task from a template. This sub-skill owns its own
template and example; nothing here is shared with scheduling or reporting.

## Steps

1. Source the shared token: `bash scripts/shared-auth.sh`.
2. Pick the base template: `templates/task.md` (or `templates/label.md` for
   tracking-only items).
3. Fill the fields, validating `status` against the property glossary and
   tags against `reference/priority-rubric.md`.
4. Submit one create request (see `reference/api-limits.md` for the batch cap).

## Gotchas

- `status` must be one of the closed set; reject anything else.
- Do not send `created_at` — the server sets it.
- One task per request unless the user explicitly asks for a batch.
- Check for duplicates first — see `examples/duplicate-check.md`; surface a
  near-match instead of creating a second task.
