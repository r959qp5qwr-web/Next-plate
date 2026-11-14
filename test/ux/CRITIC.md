VERDICT: FAIL
BUILD: f8addc45f45fba729e322a570c9c88e02601ecaa1ebe87ae1e395e789617ab6a

Round 35. Scope asked: git diff 9998595..HEAD, focus aceb504 (fingerprint 0b4f9482...). The fingerprint above is the
working tree when I finished measuring (HEAD e592fb1). The two are not the same, and that is the reason for this FAIL.

Findings, most serious first

1. BLOCKER (process; gate integrity). The tree changed while I was reviewing it. I cannot pass the current state.
   What happened: at the start, HEAD was aceb504 and the manifest was 0b4f9482... (I checked this at about 02:20 UTC, after my
   gate-set review). While my full-set review ran, five commits landed on top of aceb504, plus uncommitted edits at various points:
   14483c1 (02:20), caab525 (02:30), bbe6c52 (02:37), 392dfe1, e592fb1. They touch 20 files (+1644 / -102), including
   src/v5/core.js (the shared core: BP rule now `p.bp`, a new grainAfter field on one-tap changes, readProfile), src/v6/engine.js
   (taste-word filter by left-out foods, menu side line now carries "≈ N g", BP hook), src/v6/app.js (93 lines changed),
   src/v6/legible.css, test/rules/check.js (a rule oracle loosened and a new one added), test/ux/review.js (+76 lines),
   docs/ux/UX-CRITERIA.md, and all three built pages (hosted/v6/index.html, index.min.html, hosted/v5/index.min.html).
   None of this was in the round 35 brief and I did not review it. Some of it is engine and safety-adjacent behaviour (the BP
   salt rule, the grain grams after a one-tap change, a changed rule-check oracle), which by the Critic's brief needs its own review.
   Why it matters: the gate binds a PASS to the exact fingerprint. A PASS on the present fingerprint would certify engine, rule-check
   and screen changes nobody independent has looked at. A PASS on 0b4f9482... would refer to a state that no longer exists in the tree.
   Evidence: `git log --oneline aceb504..HEAD` (5 commits); file times hosted/v6/index.html 02:39:35, src/v6/engine.js 02:37:10,
   test/ux/review.js 02:40:46 (taken while my runs were in progress); `ps` at 02:39 showed a second review.js run
   (`--only setup-2-two-conditions,...,rescue-result,...`) running alongside mine.
   Smallest correction: stop changing the tree, then ask for a new Critic round with the scope `git diff 9998595..HEAD` (or
   aceb504..HEAD), naming the screen-review fixes and owner decisions, and let the Critic measure a state that is still.

2. MAJOR (measured; most likely a side effect of 1, but not clean). My full-set review on the live tree
   (node test/ux/review.js --pool 6, 15 runs, 55 states, 825 checks) ended with 1 violation: feedback-hidden, rescue-result @375 dark
   ("the Rescue wait line or answer is not in view after the tap"). That run overlapped the edits and a second review process.
   Rerunning rescue-result on the live tree at 02:38 and 02:40 gave 15 of 15 "state could not be reached" (waitForSelector 20 s
   timeout) twice, then a clean run; the page was rebuilt at 02:39:35 in between. On a clean aceb504 snapshot (see below),
   rescue-result passed 15 of 15 twice. So I attribute it to load and the moving tree, not to aceb504, but the full-set run on the
   tree as it now stands has not been done clean by me.
   Evidence: scratchpad full/report.md, rr1/report.md, rr2/report.md, arr1, arr2 (paths below).
   Smallest correction: part of the next round; no code change asked.

What holds: the round 34 finding is resolved in aceb504 (measured on a snapshot, not on the builder's word)
- Code: src/v6/app.js:31 (at aceb504) calls save() right after KEYCODE is taken from ?k= and the address bar is cleared. load() has
  already run, and P, C, EV, STORE, DAY, APP and KEYCODE are all defined above it, so save() writes what was stored plus the code;
  P.done stays as loaded (false on a first visit), so set-up still shows. A returning client who opens a new link keeps their profile
  and gets the new code. The built pages carry the same call (index.html line 2724; index.min.html `...history.replaceState(...),he()`).
  One clarification of the builder's summary: set-up answers are still saved only at the end of set-up (app.js:181). A reload during
  set-up keeps the code, not the answers already tapped. The message promises only the code, so it is now true; the answers are not
  a finding.
- review.js state setup-from-link: opens /?k=LINKCODE1 with empty storage, checks np6.k and an empty location.search, reloads, and
  checks again; it throws on failure.
- Mutation, my own: I copied aceb504's hosted/v6/index.html with only `save();` removed from that line and ran setup-from-link on
  the full set. Result: 15 of 15 runs failed with "the code from the link is not kept on the phone before set-up ends ({"q":""})". On
  the actual page: 15 of 15 clean. On hosted/v6/index.min.html (the live page): setup-from-link and plate-no-code are clean on 15 of 15
  runs (30 checks).
- Measured on aceb504 (before the tree moved, or on the git-archive snapshot of aceb504):
  npm run rules: every rule check holds, on all three built pages (exit 0).
  npm run words: no banned words outside the 42 listed exceptions (exit 0); test/words/allow.json and test/ux/allow.json ([])
  were not touched by 9998595..aceb504.
  npm run films: 4 films ok, -16.7 / -16.8 dB, no decode errors, no freeze (exit 0). Films are not in the diff.
  npm run review (gate set, live tree at 0b4f9482...): 9 runs, 55 states, 495 checks, no violations (exit 0); drill: every
  planted fault caught.
  npm run drill on the aceb504 snapshot: every planted fault was caught (exit 0).
- Rendered: setup-from-link frames 1 and 2 at 320, 360, 390 and 412 px, light and dark, and 360 at 130 % text are byte-identical to
  setup-1-goal-food. Opening from the link looks the same as normal set-up; no code shows on screen. Read at 320 light, 360 dark and
  360 at 130 % text: Raw Linen paper, EB Garamond, three-step bar, no clipping. plate-no-code at 320 dark is unchanged from round 34.
- docs/ux/UX-CRITERIA.md: the round 34 note matches what the code does; "their own phone" is fixed; the v5 record item is there.
  No banned word in it.
- Carried cosmetic items from round 34 (still open on aceb504): the craving cards and the craving field stay active under the
  no-code message; next question under the tab bar at 320 after No; 'or' grains in the answer line; a left-out grain still asked;
  a 'no roti' description line; the v5 rollback page keeps the old no-code wording.

If the tree had stayed at aceb504, I would have had no findings above cosmetic for this round.

Not inspected:
- Everything after aceb504: commits 14483c1, caab525, bbe6c52, 392dfe1, e592fb1 (core, engine, app, CSS, rules check, review
  states, built pages, UX-CRITERIA and decision records). No code, screen or measured review of them by me.
- A full-set review that is clean on the current tree (my one full run overlapped the edits).
- The setup-from-link fix on a physical phone: Android dropping a background tab, WhatsApp's in-app browser, private or incognito mode
  where storage fails (save() then fails silently, as before), storage cleared by the phone.
- The owner's own phone model; live Gemini replies (the review uses the mock engine); the films by ear.
- Paths: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/full/report.md,
  .../scratchpad/rr1/report.md, .../scratchpad/rr2/report.md, .../scratchpad/a1, a2, a3 (fixed, min and mutant runs on aceb504),
  .../scratchpad/arr1, arr2 (rescue-result on aceb504), .../scratchpad/mut/nosave-aceb.html (the mutant page),
  .../scratchpad/aceb (git archive of aceb504).
