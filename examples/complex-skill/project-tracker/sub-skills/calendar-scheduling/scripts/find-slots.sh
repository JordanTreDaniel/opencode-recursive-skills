#!/usr/bin/env bash
# Find overlapping free slots across two availability lists.
#
# Teaching shape, not working infrastructure. Reads two plain-text lists of
# busy windows (one per line, "START END"), inverts them against a work day,
# and prints windows free in both. No network, no real calendars.

set -euo pipefail

WORK_START="${WORK_START:-09:00}"
WORK_END="${WORK_END:-17:00}"
DURATION_MIN="${DURATION_MIN:-30}"

usage() {
  echo "usage: find-slots.sh <busy-a.txt> <busy-b.txt>" >&2
  exit 1
}

[[ $# -eq 2 ]] || usage

# Placeholder logic: a real implementation would parse the busy windows and
# compute the complement of their union inside the work day. Here we only
# demonstrate the shape — read two files, emit candidate slots.
echo "find-slots: work day ${WORK_START}-${WORK_END}, duration ${DURATION_MIN}m"
echo "find-slots: busy A = $1, busy B = $2"
echo "find-slots: (compute complement of union, then intersect) -> top slots"
