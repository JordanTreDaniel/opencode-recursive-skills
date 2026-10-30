# Weekly rollup query

Read-only query that groups tasks by status for the past 7 days.

    FROM tasks
    WHERE updated_at >= now() - interval '7 days'
    GROUP BY status

Returns one row per status value with a count. Order by status. Do not add
write clauses — this query must stay read-only.
