#!/usr/bin/env bash
# Load a session token for tracker API calls.
#
# This is a teaching shape, not working infrastructure. It reads a token from
# the environment, exports it under the expected name, and confirms. It makes
# no network calls and touches no real credentials.

set -euo pipefail

# The token is expected to already be present in the environment under a
# neutral name. We only rename it; we never fetch, print, or persist it.
if [[ -z "${TRACKER_SESSION_TOKEN:-}" ]]; then
  echo "shared-auth: TRACKER_SESSION_TOKEN not set" >&2
  exit 1
fi

export TRACKER_AUTH_HEADER="Authorization: Bearer ${TRACKER_SESSION_TOKEN}"

# Never echo the token. Print only a masked fingerprint so callers can confirm.
fingerprint="${TRACKER_SESSION_TOKEN:0:4}…(masked)"
echo "shared-auth: session loaded (token ${fingerprint})"
