#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
node scripts/clear-ports.mjs "$@"
if [ "$#" -eq 0 ]; then
  if [ "${SEED_DEMO_DATA:-1}" = "1" ]; then
    node scripts/seed-workspace.mjs
  fi
  exec node hub/server.mjs
fi
exec node scripts/workspace.mjs "$@"
