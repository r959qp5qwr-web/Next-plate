VERDICT: PASS
BUILD: ff99eb165235ceeee9857cc621da2d135a41f7a7056864ef06dac09fdd60b465

Critic round 42.
- Tree: branch claude/nice-hawking-307ljy at 530a503 (fix-r10 and fix-r11 merged). Diff judged: b4633dd..530a503 (src/v6/app.js,
  engine.js, extra.css, legible.css, the changed lines of src/v5/core.js, test/ux/review.js, docs/film, docs/FEATURE-menu.md,
  hosted/v6/README.md, docs/ux/UX-CRITERIA.md D8 and D9).
- Fingerprint ff99eb16...b465 at the start and after all measuring and writing. During the round two commits landed: 1c58b89
  (test/safety/AUDIT.md, the safety audit of 530a503) and 160ae2f (my in-progress CRITIC.md committed as WIP by someone else). Neither file
  is in the fingerprint; at the end git status shows only test/ux/CRITIC.md modified.
- This PASS is the UX verdict only. The safety audit of the same fingerprint reads FAIL (B1: "rice curd" read as a plant curd, so a
  dairy word drops off a model-written name; M1: a digit count before a measure word inside a name leaves the measure word, "Dal with
  teaspoon ghee"). I read those two sections. Both sit in shared-core code this diff did not change (PLANT and DIGMEAS in src/v5/core.js),
  and neither shows a household measure in place of grams (grams and kcal stay on every figure; katori is guarded), so I do not count them
  as an owner rule 2 breach here. They stay blocking in the safety gate, which is the auditor's, not this file's.
- Round 41's findings are closed: finding 1 (a stepper moving under a held thumb) is fixed and measured at every width (below); finding 2
  (one page error) did not recur in any of my seven parts.

## Measured (run by me on this tree)
- Screen review, one width per part, each with its own --out in my scratchpad (node test/ux/review.js --widths <w> --out <path>), on the
  review's default page hosted/v6/index.html; NP_STILL_LOG=1 from 360 on (a log switch, not a bypass). Every part: 3 runs (light, dark,
  360 px at 130 %), 134 states, 402 checks, "No violations.", exit 0. report.json in every part: 402 entries, none with err (every state
  reached), none with viol. No page error in any part, so no part needed a re-run. Parts: 320, 360, 375, 390, 393, 412, 430 (2,814 checks;
  the 360 px 130 % run repeats in each part). EB Garamond rendered in every screen I opened.
- builder-still (the test for round 41 finding 1: tap every stepper to its bound, then three taps at one point on every other button):
  at 360, 375, 390, 393, 412, 430 light and dark and 360 px at 130 %: 348 taps and 56 three-tap runs each, 0 moved, 0 off, 0 unseen,
  0 slot changes. At 320 the state passed in the part run without the log.
- Drill: node test/ux/review.js --drill --out <scratchpad>: exit 0, "every planted fault was caught" (it plants the new menu-entry rule).
- npm run rules: exit 0 on all three built pages (index.html, index.min.html, v5), "every rule check holds", including "menu: refused
  before anything is read" and "photo: rescue and log with a photo are refused before any prompt".
- npm run words: exit 0, "no banned words outside the 42 listed exceptions". Re-run after this file was written: the first re-run failed
  on one banned word I had written in this file, which I replaced; the re-runs after the final write exit 0.
- npm run films: exit 0. Four films, picture from 0 s, no decode errors, no 7 s freeze, -16.7 to -16.8 dB. No file under demo/ and not
  docs/film/WHATSAPP-post.md changed since b4633dd.
- test/ux/allow.json is []. test/words/allow.json unchanged since c909a03.
- Probes (my scratchpad, read only, on hosted/v6/index.min.html, the served page, with the mock engine started as review.js starts it):
  - probe/shots.js: the refused note for the top row (Protein +) and the bottom row (Fats and seeds -) at 320, 360, 390 light and dark and
    360 px at 130 %; Rescue with an 85-character dish typed and focused. No page errors, no sideways scroll, input 17 px (22.1 at 130 %).
  - probe/chips.js: every common-dish chip for a vegetarian and a non-vegetarian profile at 320 and 360, at 100 % and 130 %: lines per
    chip and the pill's geometry. No page errors.

## Rendered (opened by me)
- Rescue, every state in the brief: idle (entry 1-2), typing (probe), waiting, answered (result 1-4), error, urgent, refer; also limit,
  no code, offline, plate-ordered. Widths: 320 light and dark, 360 dark and 130 %, 375 light, 390 light and dark, 393 dark, 412 light.
  One entry: the lede ("850 kcal and 66 g protein are left today. Name the dish you will have for lunch to see how to fit it in."), the box
  "Name the dish you chose", "What you type goes to Google Gemini.", the common dishes. No menu or photo wording on any screen. The answer
  leads, then "Another dish" and the entry tools. Errors say what happened and keep the typed dish; Try again only where it helps; the
  limit and the refused code say what to do and turn the send controls off. Urgent shows the get-help line first. Dark mode keeps the
  paper. The order logged before the removal shows "Lunch · ordered from the menu" as D9 says.
- Your data in My food (320 light, 360 at 130 %): "Google Gemini plans for you. It gets your answers, your meals from the last few days and
  what you type." and "... counts a meal you typed or rescues a dish." This matches what the page now sends (no image; ctx.photo false).
- Builder held strip, opened: review screens 320 light (builder 2, adjusted 2, still 1, 2, 3, 5), 375 dark (still 2), 390 light (still 1,
  with a seam crop), 412 light (still 2), 430 dark (still 1), 360 at 130 % (the review's refused shot); probe screens 320 light top,
  320 dark bottom, 360 dark top, 360 at 130 % top, 390 light bottom, 390 dark top. Not opened: the other probe images (320 dark top,
  320 light bottom, 360 light, 360 dark bottom, 360 at 130 % bottom, 390 light top, 390 dark bottom) and every Builder screen at 393. In
  each one opened, the refused note or the "Changed." slip sits whole in the held strip on the button, on the page's paper in both schemes,
  the tapped row in view. The strip covers the lower rows until scrolled, which D8 accepts. At the end of the page the strip sits in its
  own place and every row is clear of it (390 light bottom).
- Code read: the photo refusal comes after the profile and typed referrals in plan() (S7 holds); "menu" is refused first; the client sends
  no image on any path; no safety line was removed from app.js; units stay grams and kcal; no new hard-coded width.
- Each part's screen folder was viewed, then deleted.

## Findings, most serious first (none blocking)
1. COSMETIC, watch item (not a regression; .sit CSS unchanged since b4633dd). Rescue, common dishes, at 130 % text only: a chip that wraps
   to two lines keeps the full pill radius (999 px, so 31 px on a 62 px chip) with 11 px left padding and no top or bottom padding, so the
   first letter of each line sits on the pill's curve. Seen on "Paneer butter masala with butter naan" (360 and 320 at 130 %) and, for a
   non-vegetarian, also "Pahadi mutton rara with butter rotis" and "Peri-peri half chicken with spicy rice" (320 at 130 %). From the
   letter boxes, my estimate is within about 1 px of the inner curve ("P" about 0.8 px inside it, the "n" serif about 0.3 px past it),
   under A3's 2 px, and every word stays readable. No chip wraps at 100 % text at 320 or 360 for either profile.
   Evidence: 360-light-big rescue-entry-2 and rescue-error-1 from the 360 part (viewed, deleted after);
   /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/chips-out/chips-nonveg-320-130.png.
   Smallest correction: a radius of about 22 px on #app .sits .sit, or 4 px top and bottom padding with 16 px at the sides.
2. COSMETIC, watch item. Builder held strip, finish only: the strip keeps the height of the longest note, so a one-line note leaves a band
   of empty paper above the button (430 dark, 320 and 360 light); at 412 px the "Changed." slip leaves "it." alone on its line; at 390 px
   the gap between the slip and the button shows a 2-3 px sliver of the row behind (390 light seam crop: a swatch edge; 390 dark probe: a
   fragment of "10%"). D8 accepts the strip. Correction if wanted: text-wrap:pretty on the slip; the slot's paper filled down to the
   button's top edge.
3. COSMETIC, watch item. Rescue typing (probe, 320 and 360 at 130 %): a long dish name scrolls inside the one-line box, so the start of
   what was typed is out of sight. Unchanged since b4633dd. Correction if wanted: a two-line box.
4. WATCH ITEM, records. docs/ux/UX-CRITERIA.md Part A still lists the menu states (line 15) and A13 still names "photos off" and "a photo
   that did not come through"; app.js:127 keeps photos_off and bad_image in NORETRY. D9 supersedes them and nothing a user sees is
   affected. Correction: mark them "removed 17 Nov (D9)" when the file is next edited.
5. WATCH ITEM. The v5 page (hosted/v5/index.min.html, rollback only) still has a photo input; the engine now refuses any photo with
   bad_request, so on a rollback that button would answer "Next Plate couldn't read that. Close it and open your link from WhatsApp
   again." The handoff states v5 is not a release target. Correction before any rollback: take the v5 photo input off.
6. OWNER QUESTION (not a finding, per the brief). Both films show menu reading (30 s film 23-28 s; 51 s film 6.0-12.4 s). The hold is
   recorded at the top of docs/film/BRIEF.md and docs/film/SCRIPT-features.md ("Status: held (17 Nov) ... Not to be shared until it is
   re-cut around "Name the dish""), and in the handoff (row "30 s film | approved, held (17 Nov)" and the owner question on a re-cut). Not
   marked: docs/film/WHATSAPP-post.md (its "30-second film below" goes with the held film) and docs/film/BRIEF-features.md (Read the menu
   as the film's lead feature). One "held (17 Nov)" line at the top of each would keep the post from being sent alone.
- Open owner questions carried as the brief says, not judged here: size words with no number; Hindi counts before nuts and fruit;
  postpartum phrasing.

Not inspected:
- The owner's own phone and clients' phones (Android text scaling on a device, iOS Safari, a keyboard over the Rescue box); the review
  and my probes simulate 130 % text in Chromium.
- Every one of the 134 states at every width one by one: I opened the changed surfaces (Rescue, Your data, Builder) at the widths listed
  above and relied on the measured checks for the other states and widths; Builder at 393 and the probe images listed above as not opened.
- The seven review parts ran on hosted/v6/index.html; only my probes and the rule check ran on the served index.min.html.
- Live Gemini text on Rescue (the review and my probes use the mock engine); the live site and Railway (not called).
- The films by ear and frame by frame (no film changed; the film check passed); the safety audit's findings beyond B1 and M1.
