#!/usr/bin/env bash
# Scaffold a task body from the task template.
#
# Teaching shape, not working infrastructure. Copies the template, fills the
# title from the first argument, and prints the result. It makes no network
# calls and never submits anything.

set -euo pipefail

TITLE="${1:-}"

if [[ -z "$TITLE" ]]; then
  echo "usage: new-ticket.sh <title>" >&2
  exit 1
fi

# A real implementation would read sub-skills/task-creation/templates/task.md,
# substitute the title, validate the fields, and print the filled body. Here
# we only demonstrate the shape.
echo "new-ticket: title = ${TITLE}"
echo "new-ticket: (fill templates/task.md fields, validate against the property glossary)"
