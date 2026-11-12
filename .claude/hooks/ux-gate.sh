#!/usr/bin/env bash
# Stop gate: if screen code changed (see ux-mark.sh), the work is not done until
#   1. the page is rebuilt from source,
#   2. the surface review (test/ux/review.js --quick) finds no violations, and
#   3. the ux-critic agent has written VERDICT: PASS for this exact build (test/ux/out/CRITIC.md, line 2 = BUILD: <sha256 of hosted/v6/index.html>).
# Exit 2 blocks the stop and shows the reason to Claude. After 3 blocked attempts in a row it lets the stop through with a BLOCKED notice,
# so a gate that cannot be satisfied is reported to the owner instead of looping. A hook proves only that these steps ran (Builders Doctrine).
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; M="$ROOT/.claude/.ux-dirty"; N="$ROOT/.claude/.ux-gate-tries"
[ -f "$M" ] || exit 0
cd "$ROOT" || exit 0
tries=$(cat "$N" 2>/dev/null || echo 0); tries=$((tries+1)); echo $tries > "$N"
block() { if [ "$tries" -ge 3 ]; then echo "UX GATE BLOCKED after $tries attempts: $1. Tell the owner this is unresolved; do not call the work done." >&2; rm -f "$N"; exit 0; fi; echo "UX GATE: $1" >&2; exit 2; }
node build6.js >/dev/null 2>&1 || block "the page does not build (node build6.js)"
node test/ux/review.js --quick --page hosted/v6/index.html --out test/ux/out >/dev/null 2>&1; rc=$?
[ $rc -eq 2 ] && block "the surface review could not run (needs bun and playwright)"
[ $rc -ne 0 ] && block "surface review found violations; read test/ux/out/report.md, fix them, and stop again. $(sed -n '5,8p' test/ux/out/report.md | tr '\n' ' ')"
sha=$(sha256sum hosted/v6/index.html | cut -c1-64)
[ -f test/ux/out/CRITIC.md ] || block "no Critic verdict. Run the ux-critic agent on this build; it writes test/ux/out/CRITIC.md"
head -1 test/ux/out/CRITIC.md | grep -q '^VERDICT: PASS' || block "the Critic did not pass this work; fix its findings (test/ux/out/CRITIC.md) and ask it again"
sed -n 2p test/ux/out/CRITIC.md | grep -q "BUILD: $sha" || block "the Critic's PASS is for a different build; the page changed after it. Ask the Critic again"
rm -f "$M" "$N"; echo "UX gate: review clean and Critic PASS for build ${sha:0:12}." ; exit 0
