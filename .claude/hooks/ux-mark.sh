#!/usr/bin/env bash
# PostToolUse reminder only. The Stop gate (ux-gate.sh) does not depend on it: it fingerprints the state itself.
f=$(python3 -c 'import json,sys; d=json.load(sys.stdin); t=d.get("tool_input",{}); print(t.get("file_path") or t.get("notebook_path") or "")' 2>/dev/null)
case "$f" in */src/*|*/build6.js|*/hosted/v6/*|*/test/ux/*|*/demo/*.mp4|*/docs/film/WHATSAPP-post.md)
  echo "UX: $f changes what clients see or hear. Before finishing: npm run build, npm run review to zero, and a ux-critic PASS for the new state (test/ux/manifest.sh)." ;; esac
exit 0
