VERDICT: FAIL
BUILD: 8d266cbd8cae6744a728efe776351eba15eeab15d48db0e48bdd9a7919b59c94

Critic round 44 on f6a1c0c (HEAD f029c85, branch claude/nice-hawking-307ljy). UX verdict only. The safety audit of the same fingerprint
(test/safety/AUDIT.md, PASS) is the auditor's; I did not re-judge safety logic. I judged what a client sees.
- Fingerprint 8d266cbd...9c94 before measuring, after all measuring, and after writing this file (manifest.sh does not read CRITIC.md).
  git status at the end: only test/ux/CRITIC.md modified. Nothing committed.
- Diff judged: 50090ef (round 43 PASS, on cad3fb0)..f6a1c0c for src/v6/app.js, src/v6/legible.css, docs/ux/UX-CRITERIA.md (D11 to D14,
  "Keep log"), package.json and test/ux/manifest.sh. test/ux/allow.json, test/words/allow.json and test/ux/criteria.js are unchanged.
- Everything measured is clean. The verdict is FAIL on one MINOR finding (F1): under the stored medicine hold, "Back to my plates" is drawn on
  the one-ask plate and on the referral card, and a tap on it shows no plates. Six cosmetic findings and two owner questions follow.

## Measured (run by me on this tree)
- Screen review, one width per run, each with its own --out in my scratchpad, page hosted/v6/index.html:
  `node test/ux/review.js --widths <w> --pool 6 --out <scratch>/w<w>`. Exits: 320 exit 0; 390 exit 0; 360 exit 0; 375 exit 0; 393 exit 0;
  412 exit 0; 430 exit 0. Every run: 3 runs (light, dark, 360 px at 130 %), 166 states, 498 checks, "No violations." report.json of every run:
  498 entries, 0 with err (every state reached, no page error), 0 with violations. Each --out folder deleted after reading, by its literal path.
- The served page: hosted/v6/index.min.html, 320, --only the nine hold states (plate-meds-hold, rescue-meds-hold, plate-hold-then-rescue,
  rescue-hold-then-plate, meds-hold-referral, meds-hold-one-ask, meds-hold-skipped, meds-hold-reload, meds-hold-hidden): exit 0, 9 states,
  27 checks, no violations. The hold strings, "Your answers changed in another tab. Try again." and the np6meds key are present in the min page.
- The hold states again at 390 (--only the eight hold states, index.html), to open them in light and dark: exit 0, no violations; folder deleted.
- Drill: `node test/ux/review.js --drill`: exit 0, "every planted fault was caught".
- npm run rules: exit 0, "every rule check holds" (all three built pages). npm run words: exit 0, "no banned words outside the 42 listed
  exceptions" (re-run after this file was written: same). npm run films: exit 0; four films, picture from 0 s, no decode errors, no 7 s
  freeze, -16.7 / -16.7 / -16.7 / -16.8 dB. `git diff --name-only 50090ef..f6a1c0c` lists no path under demo/, docs/film/ or .claude/, so no
  film, poster, WhatsApp post or gate file changed. New note docs/DIRECTION-shared-kitchen.md (48 lines) is covered by the word check; not
  judged further (not client-facing).
- My own probes (scratch scripts, Playwright on the page served locally, /api answered from test/v5/fixture.js, no source touched):
  (a) Builder under a stored hold at 320 and 390, light and dark (no review state ends on the Builder): the hold card, the owner's two lines and
  "Add it in My food" under the "Build the plate" heading; no page error. (b) The one ask under the hold, then "Back to my plates", at 320 and
  390: before the tap, plate card and hold card both present; after it, plate card gone, hold card alone, no "Show my last plates".
  (b2) The referral under the hold ("chest pain since lunch, dal rice" typed under a stored hold), then the referral card's "Back to my plates",
  at 320 and 390: before, referral card with the urgent line and hold card; after, referral card gone, hold card alone, no plate; nothing sent.
  (d) The toast for a tap on a screen another tab changed (store revision raised from the same window, then "I'll have this"), 320 light and
  390 dark: "Not changed. Your answers changed in another tab. Try again." in the usual toast, two lines at 320, legible; the plate stays.
  (c) One typed
  dish with no medicine name on Rescue under the hold: the dish, its bars and "Moves you can make" drawn under the hold note; layout holds at 320.

## Findings, most serious first

F1 MINOR. Plate, stored medicine hold: the one-ask plate (meds-hold-one-ask) and the referral drawn above the hold card (meds-hold-referral);
every width, both schemes, 130 % text.
- What is wrong: "Back to my plates" is drawn in both places. Under the hold there are no plates to go back to: medsHoldOn (src/v6/app.js:245-247)
  removed every earlier plate, and "Show my last plates" is hidden under the hold (D14). The tap (app.js:733 for the one-ask link, app.js:165
  for the referral button) sets the meal's shown plate to none, and renderPlate (app.js:708-710) then draws the hold card alone. On the one-ask
  plate the tap throws away the one plate the hold let through, with no way back except typing a new ask. On the referral card it takes the
  "If you feel unwell now, contact your doctor or emergency care." card off the screen and shows the hold card. Probe (b): before
  {plate: true, hold: true}, after {plate: false, hold: true, last plates: false} at 320 and at 390. Probe (b2): before {refer: true,
  urgent: true, hold: true}, after {refer: false, hold: true, plate: false} at 320 and at 390.
- Why it matters here: a middle-aged client, one-handed, reads "my plates" as a promise. They get the medicine card again and lose the plate
  they were given. At 390 the link sits right under "Add it in My food" (one-ask screen 1), so the screen offers two opposite next steps.
- Criteria: B6 (the next step says what it does, in plain words), B7, B5 (the control's effect must match its label); D14 ("no earlier plates ...
  anywhere"; a button that promises them contradicts that).
- Evidence: meds-hold-one-ask-2.png (320 light: the quote "something light with dal", then "Back to my plates" above the plate card);
  meds-hold-one-ask-1.png (390 light: the link directly under the hold card's button); meds-hold-referral-1.png (320 light and 390 dark: the
  urgent card's "Back to my plates" button above the hold card). The safety audit did not raise this (AUDIT.md m1-m4, O1-O3, c1-c4 read).
- Smallest correction: while medsHeld() is true, do not draw the "Back to my plates" link on the one-ask plate (app.js:733) or the button on
  the referral card (app.js:165); the hold card already carries the next step. Any new wording in its place needs the owner.

c1 COSMETIC. One-ask plate under the hold, "Change the mix" (app.js:668) opens the Builder, which shows the hold card (owner's "All tabs").
Nothing is lost (back on Plate the plate is still shown), but the button leads to a card that cannot change the mix. B5. Evidence:
meds-hold-one-ask-5.png at 320; probe (a). Correction: hide it while medsHeld(), as the one-tap changes are.

c2 COSMETIC. Plate after "Skipped it" under the hold (meds-hold-skipped, 320 light, 390 dark): two filled primary buttons on one screen,
"Add it in My food" on the hold card and "Plan snack" on the skipped card; "Plan snack" leads to the Snack tab's hold card. The owner ruled that
the snack stays offered after a skipped meal ("Warn them"), so the button is right; its weight is the point. B5 (one primary action per state).
Evidence: meds-hold-skipped-3.png (320). Correction: draw "Plan snack" as a plain button while the hold is up.

c3 COSMETIC. The log row inside the hold card ("I had something else", "Skipped it") starts 16 px to the right of the card's own text and
button, wraps onto two lines at 320 and leaves about 50 px of empty card under "Skipped it". Cause: .logrow keeps padding 2px 16px 12px
(src/v6/extra.css:6) inside the already padded empty card; the body card uses the same row, so it is likely the same there (inferred from the
CSS, not seen). B2. Evidence: plate-meds-hold-2.png, rescue-hold-then-plate-2
(320 dark), meds-hold-referral-2.png (360 at 130 %), plate-meds-hold-1.png at 390 (one line, still indented). Correction: #app .empty-card .logrow{padding-left:0;padding-right:0}.

c4 COSMETIC. The hold card heading is set short of the card's measure at 320 ("You mentioned insulin / or sugar tablets. Add / it in My food so
your / plates keep the safe size."), leaving about a quarter of each line empty, while the line under it uses the full width. B2. Evidence:
plate-meds-hold-1.png, Builder probe at 320. Correction: let the empty-card h2 use the full width at narrow screens.

c5 COSMETIC (docs; the auditor's c2). docs/ux/UX-CRITERIA.md:715 says "updating My food clears it and the plates are made again at the safe
size" and :718 says "until My food is updated, which clears the hold". What the screen does: a My food save with insulin, sugar tablets or not
sure switches the hold card off and the plates are made again (plate-ask-meds-typed-close-1.png, 320: a plate, no hold card); the stored fact
stays and the card comes back on a later save without that answer (medsFact and medsHeld, app.js:229-231; medsHoldOff, app.js:250). The same D14 entry says
so further down ("Until updated", "Hold returns (Recommended)", :721), so D14 contradicts itself; the switch-off on screen matches the later paragraph.
handoff-next-plate.md:141 carries the same clause in a dated 23 Nov row (a record of that day's decision, so it may stay). The "comes back"
half I judged from code and the S6/D14 text only; no review state renders it. Correction: in :715 and :718 write "a My food save with
insulin, sugar tablets or not sure switches it off; a later save without that answer brings it back ("Hold returns (Recommended)")".

c6 COSMETIC. Builder under the hold keeps the "Build the plate" heading above the hold card (blocked removes it). It reads as a heading with
nothing to build. Probe (a), 320 light and 390 dark. Optional: remove it as the blocked state does.

## Owner questions (not graded)
- Q1. The one-ask plate's "Why this plate, today" line states the meal figure ("Your lunch should carry about 480 kcal and 31 g protein",
  meds-hold-one-ask-6.png, 320). "Hide all three (Recommended)" names the Your day note and the appetite slider only, so this is outside the
  ruling's letter; it is the same kind of figure, on the one plate made without the medicine floor. Hide it there too, or keep it?
- Q2. On Rescue, the one typed dish under the hold shows its moves (probe (c)); the auditor's O1 asks the same. No UX defect in the layout.

## What holds (judged on the screens)
- Owner's wording word for word on Plate, Builder and Rescue: "You mentioned insulin or sugar tablets. Add it in My food so your plates keep
  the safe size.", "If this is about someone else, ask again without the medicine name.", "Add it in My food"; on Plate "You can still log this
  meal." with "I had something else" and "Skipped it" when the meal is not logged. The referral (with the urgent line first) is drawn above the
  hold card. The one-ask plate has no "One-tap changes" row, no "Not offered" line and no Try again. The skipped card under the hold carries the
  low-sugar warning. Under the hold on the screens: no example asks, no Rescue dish chips, no Your day meal note; the day tiles stay. No kcal
  on the appetite slider is asserted by the meds-hold-hidden review state (it passed at every width); I did not see that screen. Grams and kcal only; Sugar rise as a band (Gentle); no banned word on any hold screen; no supplement.
- Raw Linen holds in dark mode on every hold screen I opened (the paper look, the clay rule on the hold card; A8 measured clean in every run).
  Nothing crowded at 320; text at 130 % holds (360-light-big hold screens).
- D11 screens opened at 320 (setup-3-body-partial, plate-body-stored-partial on Rescue): the missing-figure line and "Add my age" read plainly.

## Not inspected
- The toast "Not changed. Your answers changed in another tab. Try again." with a second tab: seen only through probe (d), one window with
  the store revision raised by hand (refuse(), app.js:160; act(), app.js:171; ERRS.moved, app.js:193); no review state renders it.
- The hold coming back on a second tab after a stale My food save ("Hold returns"): code and the S6/D14 text only.
- The one-ask Rescue dish with a checked model reply: rendered only with the raw layout fixture.
- The owner's own phone model, Android system font scaling on a device (130 % is simulated), live Gemini text variety, audio and films by ear
  or eye (only the automated film check ran; no film changed).
- What I opened: at 320 light screens of every hold state (plate-meds-hold, meds-hold-referral, meds-hold-one-ask, meds-hold-skipped,
  rescue-meds-hold, plate-hold-then-rescue, rescue-hold-then-plate, meds-hold-reload, meds-hold-hidden), at 320 dark two (meds-hold-referral,
  rescue-hold-then-plate), at 390 light and dark eight screens, one each of eight hold states, at 360 dark one (meds-hold-one-ask), at 360 with 130 % text
  two (meds-hold-referral, meds-hold-skipped), plus my probe shots. Screens at 375, 393, 412 and 430 were measured, not opened. The review
  folders were deleted as instructed; any cited screen comes back with `node test/ux/review.js --widths <w> --only <state> --out <dir>`.
