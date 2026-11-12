#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit|NotebookEdit): when a file that shapes what the user sees changes, mark the build as unreviewed.
# The Stop gate (ux-gate.sh) then rebuilds, runs the surface review and requires the Critic's PASS for that exact build.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
f=$(python3 -c 'import json,sys; d=json.load(sys.stdin); t=d.get("tool_input",{}); print(t.get("file_path") or t.get("notebook_path") or "")' 2>/dev/null)
case "$f" in
  */src/v4/*|*/src/v5/*|*/src/v6/*|*/build6.js|*/hosted/v6/*|*/test/ux/criteria.js|*/test/ux/allow.json)
    echo "$(date -u +%FT%TZ) $f" >> "$ROOT/.claude/.ux-dirty"
    echo "UX: $f changed what users see. Before finishing: rebuild, run node test/ux/review.js --quick to zero, and get the ux-critic agent's PASS for the new build." ;;
esac
exit 0
