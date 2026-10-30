# Field mapping

Where each tracker field comes from when building a request body.

- `title` — from the user's ask, condensed to one line.
- `status` — always starts at `todo`; only the task-creation flow advances it later.
- `assignee` — the named owner; leave empty rather than guessing.
- `due_date` — ISO date or empty; never an approximate phrase like "next week".
- `tags` — lowercase strings; reuse existing tags before inventing new ones.

Unknown fields are rejected, not passed through. If a requested field is not
in this list or in the property glossary, ask instead of forwarding it.
