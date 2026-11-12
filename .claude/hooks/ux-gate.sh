#!/usr/bin/env bash
# Stop gate for Next Plate. Work that changes what a client sees or hears is not finished until, for its exact state:
#   1. both pages are rebuilt from source (hosted/v6/index.html and the served index.min.html),
#   2. the safety rules hold on every page (test/rules/check.js), no banned word sits outside its listed exceptions (test/words/check.js),
#      and every film has its picture and sound (test/films/check.sh),
#   3. the surface review (test/ux/review.js --quick, drill first) finds nothing, and
#   4. the ux-critic agent has written VERDICT: PASS for that state's fingerprint (test/ux/manifest.sh) in test/ux/CRITIC.md.
# The state is fingerprinted, not the edit, so changes made through the shell, films and the post are covered too.
# Exit 2 blocks the stop and tells Claude why. After 3 blocks on the same state it lets the stop through with a message to the owner,
# so an unsatisfiable gate is reported instead of looping. A hook proves only that these steps ran (Builders Doctrine BD-94);
# it cannot prove who wrote CRITIC.md: the verdict history in git is the record.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT" || exit 0
N="$ROOT/.claude/.ux-gate-tries"
[ -f node_modules/esbuild/package.json ] || npm install --silent --no-audit --no-fund >/dev/null 2>&1
block() { M="$1"; why="$2"; prev=$(cat "$N" 2>/dev/null); cnt=1; [ "${prev%% *}" = "$M" ] && cnt=$(( ${prev##* } + 1 )); echo "$M $cnt" > "$N"
  if [ "$cnt" -ge 3 ]; then rm -f "$N"; printf '{"systemMessage":"UX gate: NOT RESOLVED after %s attempts on this build: %s. The work must not be presented as finished."}\n' "$cnt" "$(echo "$why" | tr '"\n' "' ")"; exit 0; fi
  echo "UX GATE: $why" >&2; exit 2; }
ESBUILD=./node_modules/esbuild node build6.js >/dev/null 2>&1 || block "unbuilt" "the pages do not build (npm run build)"
M=$(test/ux/manifest.sh)
critic_ok() { head -1 test/ux/CRITIC.md 2>/dev/null | grep -q "^VERDICT: PASS" && sed -n 2p test/ux/CRITIC.md | grep -q "BUILD: $M"; }
# PASSED only spares a second review run; the Critic's PASS for this fingerprint is checked every time
grep -qx "$M" test/ux/PASSED 2>/dev/null && critic_ok && { rm -f "$N"; exit 0; }
for pg in hosted/v6/index.html hosted/v6/index.min.html hosted/v5/index.min.html; do
  node test/rules/check.js "$pg" >/dev/null 2>&1 || block "$M" "a safety rule does not hold on $pg (node test/rules/check.js $pg)"; done
node test/words/check.js >/dev/null 2>&1 || block "$M" "a banned word outside the listed exceptions (node test/words/check.js)"
test/films/check.sh >/dev/null 2>&1 || block "$M" "a film has no picture, a frozen picture, decode errors or chimes-only sound (test/films/check.sh)"
node test/ux/review.js --quick --pool 6 --out test/ux/out >/dev/null 2>&1; rc=$?
[ $rc -eq 2 ] && block "$M" "the surface review could not run or its drill failed (UNVERIFIED); see test/ux/out"
[ $rc -ne 0 ] && block "$M" "the surface review found violations; read test/ux/out/report.md, fix them, stop again. $(sed -n '5p' test/ux/out/report.md)"
[ -f test/ux/CRITIC.md ] || block "$M" "no Critic verdict for this state. Run the ux-critic agent; it writes test/ux/CRITIC.md"
head -1 test/ux/CRITIC.md | grep -q '^VERDICT: PASS' || block "$M" "the Critic's verdict is not PASS; fix its findings (test/ux/CRITIC.md) and ask it again"
sed -n 2p test/ux/CRITIC.md | grep -q "BUILD: $M" || block "$M" "the Critic's verdict is for a different state (fingerprint $M expected); ask the Critic again"
echo "$M" > test/ux/PASSED; rm -f "$N"; exit 0
