#!/usr/bin/env bash
# Checks what a deployed Next Plate serves against the repository (Codex re-audit B4). Reads only; changes nothing.
#   test/deploy/verify-live.sh <base url> [PAGE_REF] [PAGE_PATH]
# PAGE_REF defaults to the commit /health reports; PAGE_PATH to hosted/v6/index.min.html (the server's default).
# Exit 0 when / is byte for byte the page at PAGE_REF:PAGE_PATH, 1 when it differs, 2 when a step fails.
set -euo pipefail
BASE="${1:?usage: verify-live.sh <base url> [PAGE_REF] [PAGE_PATH]}"; BASE="${BASE%/}"
HEALTH="$(curl -fsS --max-time 20 "$BASE/health")" || { echo "could not read $BASE/health"; exit 2; }
echo "health: $HEALTH"
REF="${2:-$(printf '%s' "$HEALTH" | sed -n 's/.*"page":"\([^"]*\)".*/\1/p')}"
PAGEP="${3:-hosted/v6/index.min.html}"
[ -n "$REF" ] && [ "$REF" != "file" ] || { echo "no PAGE_REF given and /health does not name one ($REF)"; exit 2; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
curl -fsS --max-time 30 "$BASE/" -o "$TMP/live.html" || { echo "could not read $BASE/"; exit 2; }
git show "$REF:$PAGEP" > "$TMP/repo.html" 2>/dev/null || { echo "git show $REF:$PAGEP failed (fetch that commit first)"; exit 2; }
L="$(sha256sum "$TMP/live.html" | cut -d' ' -f1)"; R="$(sha256sum "$TMP/repo.html" | cut -d' ' -f1)"
echo "live  $L  $(wc -c < "$TMP/live.html") bytes"
echo "repo  $R  $(wc -c < "$TMP/repo.html") bytes  ($REF:$PAGEP)"
if [ "$L" = "$R" ]; then echo "same page"; exit 0; else echo "DIFFERENT page"; exit 1; fi
