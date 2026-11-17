#!/usr/bin/env bash
# The fingerprint a Critic verdict is bound to: the built pages (v6 and the v5 page the server serves by default), the sources,
# the review and the rule, word and film checks that measure them, the safety checks with every file they read (the recorded replies under
# eval/, the lexicon, the audit names and controls; safety audit of 9dd1b13, m3), both films with their WhatsApp copies and posters, the WhatsApp post, every note (the banned words apply to notes too; the Critic's own verdict file is left out), and the gate itself. Any change to any of these needs a new review and a new Critic PASS.
cd "$(dirname "$0")/../.." || exit 2
{ ls hosted/v6/index.html hosted/v6/index.min.html build6.js; find src -type f; ls test/ux/review.js test/ux/criteria.js test/ux/allow.json test/v5/mock-gemini.ts test/v6/fixture-menu.js test/v5/fixture.js test/rules/check.js test/films/check.sh test/words/check.js test/words/allow.json;
  ls demo/next-plate-film-30s*.mp4 demo/next-plate-film-30s-poster.png demo/next-plate-features-51s*.mp4 demo/next-plate-features-51s-poster.png docs/film/WHATSAPP-post.md hosted/v5/index.min.html 2>/dev/null;
  git ls-files -co --exclude-standard '*.md' '*.txt' | grep -v -x -e 'test/ux/CRITIC.md' -e 'test/safety/AUDIT.md';
  ls test/safety/check.js test/safety/lexicon.json test/safety/recorded.js test/safety/measure.js test/safety/codex.js test/safety/controls.js test/safety/controls.json test/safety/audit-names.json test/safety/carve.js test/safety/exempt.js test/safety/inject.js;
  find eval -type f -name '*.json';
  ls .claude/settings.json .claude/hooks/ux-gate.sh .claude/hooks/ux-mark.sh .claude/agents/ux-critic.md test/ux/manifest.sh package.json; } | LC_ALL=C sort | xargs sha256sum | sha256sum | cut -c1-64
