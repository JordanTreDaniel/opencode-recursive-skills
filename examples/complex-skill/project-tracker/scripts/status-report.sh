#!/usr/bin/env bash
# Print a one-line status digest for a set of task files.
#
# Teaching shape, not working infrastructure. Counts `status:` lines matching
# each closed-set value in plain-text files passed as arguments. No network,
# no real tracker.

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "usage: status-report.sh <task-file.md> [more files...]" >&2
  exit 1
fi

# Placeholder logic: a real implementation would parse each file and tally
# statuses against the closed set (todo, in_progress, blocked, done). Here we
# only demonstrate the shape.
for file in "$@"; do
  todo=$(grep -c '^status: todo$' "$file" || true)
  blocked=$(grep -c '^status: blocked$' "$file" || true)
  done_n=$(grep -c '^status: done$' "$file" || true)
  echo "status-report: ${file}: todo=${todo} blocked=${blocked} done=${done_n}"
done
