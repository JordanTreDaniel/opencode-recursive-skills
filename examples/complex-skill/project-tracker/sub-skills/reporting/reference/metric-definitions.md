# Metric definitions

Names used in reporting output. Match these exactly; do not invent synonyms.

- `open_count` — tasks with status `todo` or `in_progress`.
- `blocked_count` — tasks with status `blocked`.
- `done_count` — tasks with status `done`.
- `throughput` — tasks moved to `done` within the window.

Each metric maps to exactly one row from the rollup query.
