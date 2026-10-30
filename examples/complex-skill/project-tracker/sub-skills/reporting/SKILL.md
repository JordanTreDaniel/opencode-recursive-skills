---
name: project-tracker-reporting
description: Roll up project activity into a weekly summary report. Use when the user wants a report, a summary, or a rollup of task status. Runs stored queries; does not create tasks or schedule meetings.
---

# Reporting

Roll up task activity into a summary. Shares nothing with task creation or
scheduling — it runs read-only queries and formats the results.

## Steps

1. Source the shared token: `bash scripts/shared-auth.sh`.
2. Run the stored query: `queries/weekly-rollup.md`.
3. Interpret counts using `reference/metric-definitions.md`.
4. Render the summary with `templates/exec-summary.md`; keep it read-only.

## Gotchas

- Reporting is read-only — never mutate tracker state from here.
- Metric names must match the definitions file exactly.
- Paginate past 100 results (see `reference/api-limits.md`).
