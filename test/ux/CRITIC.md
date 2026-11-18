VERDICT: PASS
BUILD: 98ae28418025419214b46e93f6a1d2b313e4db50431e2fa94d0895b628c99c88

Critic round 43 on cad3fb0 (branch claude/nice-hawking-307ljy). UX verdict only. The safety audit of the same fingerprint (test/safety/AUDIT.md,
PASS) is the auditor's; I did not re-judge it.
- Fingerprint 98ae2841...9c88 at the start and again after all measuring and after writing this file (manifest.sh does not read CRITIC.md).
  git status at the end: only test/ux/CRITIC.md modified. Diff judged: 530a503..cad3fb0.
- Findings: none blocking, no owner-rule breach found. Five watch items (cosmetic), two owner questions (below).

## Measured (run by me on this tree)
- Screen review, one width per part, each as its own background command with its own --out in my scratchpad (node test/ux/review.js
  --widths <w> --out <path>), default page hosted/v6/index.html. Parts and exits: 320 exit 0; 360 exit 0; 375 exit 0; 390 exit 0; 393 exit 0;
  412 exit 0; 430 exit 0. Every part: 3 runs (light, dark, 360 px at 130 %), 138 states, 414 checks, "No violations." report.json in every part:
  414 entries, none with err (every state reached), none with viol. No page error, so no part needed a re-run. (The state count rose from 134 to
  138 with the new offline and refused-code states and plate-logged-meds.) For 320 I read report.json before deleting its folder: the same counts.
- The served page: the review's default page is index.html, so I also ran the changed states on hosted/v6/index.min.html (--page, --only
  plate-ask-offline-urgent, rescue-offline-pregnancy, sheet-log-refused-kidney, plate-logged, plate-logged-meds, plate-skipped-meds,
  rescue-entry, rescue-result, builder-still, plate-hero; 320): 10 states, 30 checks, no violations. I grepped index.min.html for the changes
  (onMeds reading "not sure", typedReferral in api(), "Little is left", the 22 px chip radius): all present. My probes below also serve the
  min page.
- Builder again, because the full parts' screens were not enough for the strip: review.js --only builder,builder-adjusted,builder-still at 412
  and at 360 (own --out): both "No violations", 3 states, 9 checks.
- Drill: node test/ux/review.js --drill --out <scratchpad>: exit 0, "every planted fault was caught".
- npm run rules: exit 0 on all three built pages, "every rule check holds". npm run words: exit 0, "no banned words outside the 42 listed
  exceptions" (re-run after this file was written). npm run films: four films, picture from 0 s, no decode errors, no 7 s freeze, -16.7 to
  -16.8 dB; exit 0.
- test/ux/allow.json is []. test/words/allow.json is not in the diff; the entries I read are the rule itself, quoted records or web addresses.
- Probes (my scratchpad, read only; index.min.html served with the mock engine as review.js starts it), because the review's scroll frames skip
  the lower part of some cards:
  - logged card for a normal client and a medicines client, skipped-meal card for a medicines client, the typed chest-pain ask and the typed
    "feeling shaky" ask for a medicines client with the network cut, "feeling shaky" for a non-medicines client (goes to the model, the engine's
    rule), at 320 light, 320 dark and 360 at 130 %;
  - the same skipped-meal, logged and shaky cases with the medicines answer left unanswered (diabetes, no meds field), 320 light: the warning
    shows after a skipped meal, "Little is left for a snack today." and "Plan dinner" after lunch, and the shaky ask gets the get-help card;
  - the Builder refused note for the top row (Protein +) and the bottom row (Fats and seeds -) at 320, 360, 390 light and dark and 360 at 130 %
    (notes at 17 px, 22.1 px at 130 %; note and slot above the button, rows clear), and the Rescue box with a long dish typed (no sideways scroll);
  - the Builder card height before and after one step at 320, 360, 375 and 390 (433 to 485 px; see watch item 1).
  No page errors in any probe.

## Rendered (opened by me)
Opened at 320 light and dark, 360 light and 130 %, 375 light and dark, 390 light and dark, 393 light and dark, 412 light, 430 light and dark.
The review writes about 480 images per width; I opened the changed states at every width and sampled the rest.
- Offline typed chest pain on the Plate ask (plate-ask-offline-urgent; 320 light, 375 dark, 412 light, 360 at 130 %, probe 320 light and dark): the
  card quotes the ask, then the get-help line "If you feel unwell now, contact your doctor or emergency care." at heading weight, then "Your coach
  and doctor should plan this with you.", then "Back to my plates" (full-width outlined button). No Try again, no error note. Plain words; it fits
  at 320 and at 130 %; dark keeps the paper.
- Offline typed pregnancy on Rescue (rescue-offline-pregnancy; 320 light, 360 at 130 %, 390 dark, 430 dark): the same card shape, "Your coach and
  doctor should plan this with you." as its heading (no get-help line, right for pregnancy), the dish box and common dishes below, still usable.
- Code refused, typed kidney text in the log sheet (sheet-log-refused-kidney; 320 light, 360 at 130 %, 375 dark): the slip reads "Your coach and
  doctor should plan this with you. Next Plate does not count meals for this." with the shield mark, not "code was not accepted". The box, the
  words and "Count it" (an outline button, as round 39 decided) stay.
- Typed low-sugar sign on a medicines client (probe): the same card with the get-help line first.
- Snack passed over (plate-logged, plate-logged-meds; 320 light and dark, 360 at 130 %, 390 dark, 430 light): the dish, "≈ 560 kcal · 38 g protein",
  "Little is left for a snack today." in italic, "Reopen lunch" and "Plan dinner" (primary). Identical for the normal client and the medicines client
  with no skipped meal, as D10 says. Medicines client who skipped lunch (plate-skipped-meds; 360 light, probe 320): the warning slip, "The rest of
  the day adjusts. No meal is asked to make up for it in one sitting.", then "Reopen lunch" and "Plan snack" (the review's text check; the
  button itself I read from the probe's card text, the image cuts it at the ask bar). The medicines client's Plate shows three example asks, not
  "A light dinner after a heavy lunch".
- Rescue (320 light and dark, 360 at 130 %, 390 dark, 412 light, 430 light and dark): entry (lede with kcal and protein left, "Name the dish you
  chose", "What you type goes to Google Gemini.", four common dishes), wait, answered (dish, "≈ 650 g", kcal left, four nutrient bars with their
  names and colours, "Sugar rise: Sharp", moves with tick boxes, "I had this, for lunch"), busy and error (Try again, typed dish kept), limit
  (names 5:30 am, no Try again, send dimmed), no code (send and chips dimmed), blocked, refer, urgent, offline, empty ("couldn't work out that
  dish", Try again), had-its-meal (the logged card), health-changed, two-moves-grain (the refusal toast "With diabetes the grain stays, at least
  half of it."), after-midnight. A portion line with no whole weight was not seen on any screen (every Rescue sample dish shows "≈ N g"). The
  chips with the 22 px radius: at 130 % "Paneer butter masala with butter naan" wraps to two lines at 360 and "naan" sits clear of the curve; at
  100 % every chip is a one-line pill at 320, 360, 390, 412 and 430 (I did not open a 130 % chip at 320). No menu or photo wording on any
  screen. Dark mode keeps the paper in all of them.
- Builder held strip (320 light and dark, 360 dark and at 130 %, 375 light, 390 light, 393 light and dark, 412 light, 430 dark, plus the probe's
  refused-note images at 320 dark, 360 at 130 %, 390 light): the slip, or the refused note "Protein can't go higher: this part stays between 5% and
  70% of the plate.", sits in the strip directly above "Plan lunch with this plate" on the page's paper in both schemes; the strip covers the lower
  rows until scrolled (D8 accepts it); at the end of the page it sits in its own place. The review's builder-still state passed at every width.
- Your data in My food (360 at 130 %): "Google Gemini plans for you. It gets your answers, your meals from the last few days and what you type." and
  the remove-my-data control and its confirmation read plainly and fit. Not opened at 320.
- Code read: src/v6/app.js diff in full; src/v6/engine.js diff in full (the directive no longer says "light" or "late" to medicines clients through
  hookSaid; appAskOK drops asks for lighter, smaller or skipped meals for medicines clients; typedReferral shared by the phone and the server;
  the referral nets widened, none narrowed; the log reads figures as written); src/v5/core.js diff scanned: the removed lines are refactors of
  the checks (the supplement list, katori and measure guards, grain checks are replaced by stricter forms, not dropped), and the added lines hold
  no user-facing text. No safety line was removed, units stay grams and kcal, no banned word added (the word check agrees), no new hard-coded
  width. NORETRY dropped bad_image with its reason given. UX-CRITERIA.md D8 to D10 and the watch list read; lines 484 to 571 (rounds 28 to 32, menu
  grain questions, now dormant under D9) skimmed. The film hold lines are on docs/film/WHATSAPP-post.md and BRIEF-features.md; the films are
  unchanged and still pass the film gate.

## Findings
No blocking findings.

Watch items (cosmetic, each listed):
1. Builder, any width, light and dark: once a share is changed or refused, the white plate card grows about 52 px of empty paper under the last
   stepper row (card 433 to 485 px at 320 to 390 by probe; the card's bottom padding goes from 12 to 64 px, src/v6/legible.css:324, "the held button
   never sits on the last stepper row", R2-B5 074-2). The note now sits in the held strip, so the room is not needed for it, and the card looks
   unfinished (390 light builder-adjusted, 375 light builder-still, probe build-bottom-390-light). B2. Smallest correction: reduce the padding to
   what the strip needs, or keep it as the owner's 14 Nov held-button decision. Not a tap or legibility problem.
2. Builder held strip, finish (carried from round 42): the strip keeps the height of the longest note, so a one-line note leaves empty paper under
   the slip (430 dark); "it." or "use it." stands alone on a line at 320 to 412. D8 accepts the strip.
3. "Your data" in My food, src/v6/app.js (third paragraph): "... counts a meal you typed or rescues a dish." "Rescues" is the tab's internal
   name; its heading reads "Eating out". B7. Smallest correction: "or works out a dish you are eating out".
4. Review tooling, not the app: some review frames do not overlap (plate-ask-offline-urgent and plate-skipped-meds frame 1 and frame 2 skip the
   bottom of the card and its button). I saw those parts by probe. The checks read the DOM, so A13 and B6 are not weakened, but a reader of the
   screens alone does not see the button. Smallest correction: overlap the scroll frames by one ask-bar height.
5. Rescue typing at 130 % with a long dish name scrolls inside the one-line box (carried from round 42; the owner's open watch item).

Owner questions (not findings):
- A. A client on medicines who types a low-sugar sign now gets the get-help line and the referral card. The skipped-meal card tells the same client
  to "have something sweet now, such as a glass of juice or 3 teaspoons of sugar in water". The typed-sign card does not say that. This is a
  clinical wording decision for the owner and the safety audit, not a UX defect.
- B. The two films still show the menu scan and carry hold lines (re-cut open). Size words with no number; Hindi counts before nuts and fruit;
  postpartum phrasing; the Builder strip finish; Rescue long-text scroll: as listed in the brief.

Not inspected: the owner's own phone; Android text scaling on a handset beyond the 130 % simulation; live Gemini text variety; clients'
comprehension of the referral and get-help wording; every image of every state at every width (I opened the changed states at each width and
sampled the rest, so "Your data" at 320, a 130 % chip at 320, and a Rescue portion with no weight were not seen); dark mode on a phone's own
dark setting beyond the browser's colour-scheme; audio by ear (measured with the film gate only); the live site (not called).
