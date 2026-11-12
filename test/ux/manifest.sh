#!/usr/bin/env bash
# The fingerprint a Critic verdict is bound to: both built pages, the sources they come from, the review that measures them,
# both films and the WhatsApp post. Any change to any of these needs a new review and a new Critic PASS.
cd "$(dirname "$0")/../.." || exit 2
{ ls hosted/v6/index.html hosted/v6/index.min.html build6.js; find src -type f; ls test/ux/review.js test/ux/criteria.js test/ux/allow.json test/v5/mock-gemini.ts test/v6/fixture-menu.js test/v5/fixture.js;
  ls demo/next-plate-film-30s.mp4 demo/next-plate-features-51s.mp4 docs/film/WHATSAPP-post.md 2>/dev/null; } | LC_ALL=C sort | xargs sha256sum | sha256sum | cut -c1-64
