VERDICT: FAIL
BUILD: 48aa44f2674f5cc619580340fab334d65c9d39abdd3f2686d161ff05aa1290e5

Critic round 41.
- Tree: branch claude/nice-hawking-307ljy at b4633dd (fix-r8 and fix-r9 merged). Diff judged: ba4d8dc..b4633dd. During the round the
  auditor's commit bcfe5cb landed; git show --stat lists only test/safety/AUDIT.md (outside the fingerprint). I did not read AUDIT.md.
- Fingerprint 48aa44f2...0e5 at the start and after all measuring and writing. At the end git status shows only test/ux/CRITIC.md modified.

Why FAIL:
- One MINOR regression in the Builder (finding 1, blocking): the refusal note now sits between the rows, so a later tap on a lower row makes
  the rows below jump by the note's height and the next tap at the same spot changes a different part of the plate.
- My full review run exited 1 on one page error (finding 2, blocking for this run). It did not come back in three isolated re-runs.
- Round 40's findings 1-6 are fixed (details below). Finding 7 stays an owner question.

## Measured (run by me on this tree)
- Full review, node test/ux/review.js --out test/ux/out (all 7 widths, light and dark, plus 360 px at 130 %): 15 runs, 169 states, 2,535
  checks, no violations; report.json has 2,535 entries, none with an error or a violation, so every state was reached (report
  2026-11-16T18:34Z). Exit 1, for one page error (finding 2).
- Drill: node test/ux/review.js --drill, out to my scratchpad (the full run does not drill): exit 0, "every planted fault was caught".
- npm run rules: exit 0 on all three built pages ("every rule check holds").
- npm run words: exit 0 before I wrote this file and after ("no banned words outside the 42 listed exceptions").
- npm run films: exit 0. Four films, picture from 0 s, no decode errors, no 7 s freeze, -16.7 to -16.8 dB. No film or post changed.
- test/ux/allow.json is []; test/words/allow.json and docs/film are unchanged since ba4d8dc.
- Probes (scratchpad, read and measure only, all deleted after):
  - names.js: showName on hosted/v6/index.min.html, plate names and menu names with and without a typed menu.
  - e2e.js: plan('menu').check on index.min.html for heading menus, one-price menus, "65" menus, "7 Up", counts, a typed kidney menu and
    photo replies with a kidney dish.
  - replay.js: the 3,458 recorded model names under eval/ (3,224 plate path, 234 menu path, 104 with their typed menu) through ba4d8dc and
    this build, each with its typed menu: 0 change.
  - refer.js: referTyped and referDish on ordinary asks and dish names.
  - builder.js and shot.js (Chromium, index.min.html served read-only from localhost, API answered 503): repeated taps at one screen point
    in the Builder at 320x568, 360x740, 390x844 and 360x740 at 130 % text, on this build and on ba4d8dc's page.

## Findings, most serious first

1. MINOR, blocking (regression against ba4d8dc): after a refused step, the next tap on a lower row moves every row under the note, so a
   thumb held still changes a different part of the plate.
   - Surface: Builder, the four steppers. Measured at 320, 360 and 390 px and at 360 px with 130 % text.
   - What happens: a refused step now puts the note directly under the row tapped (src/v6/app.js:610, stp.appendChild(boundNote())); a
     successful step on any row clears it (stepRatio, src/v6/app.js:576, UI.rbound=""). When the note sat above the row being tapped, the
     rows below it move up by the note's height (three lines at 320 px, about 105 px read from my probe's screenshot, not measured in code),
     and another stepper lands under the thumb. ba4d8dc kept the note under the last row, so its coming and going moved nothing above it.
   - My part: round 40's finding 2 offered "show it directly under the tapped row" as one of two corrections. The builder took it; I did
     not foresee the rows below it.
   - Measured, thumb held still, three taps at the point where the first tap landed (builder.js):
     - 320 px: Protein + until refused, then Vegetables and greens -: tap 1 lowers greens (10 to 5 %); taps 2 and 3 land on Fats and seeds -
       (fats 12 to 7 %, then refused with the fats note). The same probe on ba4d8dc's page keeps all three taps on greens -.
     - 360 px and 390 px, the same start: taps 2 and 3 land on Grains - (grains 13 to 8 %).
     - 360 px and 390 px: Protein refused, then Grains -: taps 2 and 3 land on Fats -. 390 px: Greens refused, then Grains +: taps 2 and 3
       raise Fats (30 to 40 %). 360 px at 130 %: Protein refused, then Greens -: taps 2 and 3 land on Fats -.
     - Other cases land on no control (the card body or the "Changed." note), a dead tap: Protein refused, then Fats +, at every width.
     - Seen (shot.js, 320 light; images deleted after): before the tap, the note under Protein and the thumb on greens -; after one tap,
       the note gone and the thumb on Fats and seeds -. The review's slices end with the note under the fats row, so none of its screens
       show this.
   - Why it matters: these readers tap a stepper several times to move a share (the review itself taps eight times), with weak near vision
     and one hand. A part they did not touch changes, inside the bounds, with nothing to say so, and they may plan the meal with it.
   - Criteria: B5 (control state), A3 (overlap and what a tap produces). The standing rule from the second screen review, written in the
     code (src/v6/app.js:614) and asserted in review.js:329 as R2-B5 074-1: "the first tap does not move the steppers from under the thumb".
     I did not find the owner's own wording of it in docs/ux/UX-CRITERIA.md. The new assertion (review.js:310-327) checks only that the note
     is seen, and resets with a preset before each row, so it misses this.
   - Smallest correction (untested; the builder should measure it): no tap may move another stepper under the point just tapped. One way:
     when a step succeeds on another row, keep the note where it is (or keep its space), and clear it only on a preset, on planning, on
     "Go back to the usual plate", or when a step on the same row succeeds. Add the assertion: after a refusal on each row, three taps at one
     point on every other row's - and + land on the same button or on no control.

2. Measured, blocking for this run: the full review logged one page error and exited 1.
   - "plate-appetite-moved: Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED" (test/ux/out/report.md, "page errors"); the report does
     not say which of the 15 runs.
   - Re-run three times on its own (--only plate-appetite-moved, 15 runs each, out to my scratchpad): no page error, exit 0 each time.
     The auditor's review and my Builder probe ran at the same time as the full run. Cause not established; not reproduced in 45 isolated
     runs.
   - Criteria: A10 (console clean). Correction: the next round needs a full run that exits 0; if the error comes back, trace the request.

3. Watch items (tier 2 under the owner's "Fix found, then watch"; no recorded occurrence, not blocking):
   - New name forms from the bare-measure rule (MEASBARE, src/v5/core.js:597): "Cup corn" shows "Corn", "Plate lunch" "Lunch", "Glass noodle
     salad" "Noodle salad", "Cup noodle" "Noodle"; "Kg rice" and "Gm dal" keep the bare unit word. None is in the 3,458 recorded names.
   - Referral words from the owner's listed phrasings that also catch food talk: "Toast a bun in the oven", "My junior arriving for lunch" and
     "Bacche ko feed karna hai aur khud bhi khana" refer. Ordinary asks I tried do not ("Expecting guests tonight", "Baby corn delivered",
     "Tri colour pulao", "Prego pasta sauce", "Breakfast BF poha", "Gurdwara langar dal", "Kidney bean salad").
   - Not new: "Char grilled chicken kebab" shows "Grilled chicken kebab" (Hindi "char" read as a count).

## Owner questions (not findings)
- Round 40, finding 7: a menu that lists a kidney or gurda dish refers the whole menu with the generic card "Your coach and doctor should
  plan this with you." and says nothing about why (menu-refer, 320 light, slices 1-2). This now covers photo menus too: a photo reply with
  "Gurda Fry" among the dishes, or "Mutton Kidney Masala" only under leave, refers with refer_reason "none" (engine.js:621, e2e.js).
  "Rajma Masala (Kidney Beans)" is offered.
- "65" scope: on a priced menu "Veg 65 180", "Egg 65" and "Andhra Chicken 65" are offered as "Veg", "Egg" and "Andhra Chicken" (e2e.js,
  names.js). An order named "Veg" tells the waiter little; it is the cost the owner accepted.
- Size words with no number stay: "Full plate thali", "Biryani Half Full". Hindi counts before nuts and fruit stay: "Char badam shake".
- Postpartum phrasing beyond the listed ones ("I just had a baby").

## Round 40 findings, checked
- 1 (price in a name under a heading): fixed. "THALI / Veg Thali 120 / Chicken Thali 120" offers "Veg Thali", "Chicken Thali"; "JUICES /
  Orange 60 / Mosambi 60 / Pineapple 60" offers "Mosambi" (e2e.js, nothing dropped). "Tandoori Roti 2" shows "Tandoori Roti"; marked prices
  go ("- Rs 240", "Dal Tadka ₹200", "Thali 120/-").
- 2 (Builder note out of sight at 320 px): the review now asserts, for all eight buttons with the row at 60 % of the height, that the note
  names that row and is seen whole, and it passed at every width. My probe found the note under the thumb after each of the four held
  buttons at 70 %. The placement brought finding 1.
- 3 (Hindi plurals and bare measures): fixed. "Do parathe" "Parathe", "Do anday" "Anday", "Glass buttermilk" "Buttermilk", "Bowl dal" "Dal",
  "Do makki ki roti" "Makki ki roti"; "Cup cake", "Mug cake", "Glass noodles", "Buddha bowl", "Paneer do pyaza", "Das ka dal" keep their names.
- 4 ("65" on narrow shapes): fixed. "Chicken 65 / Gobi 65", "Chicken 65 / Gobi 65 / Dal Tadka 160 / Roti 30" and a one-line "Chicken 65" keep
  "Chicken 65" and "Gobi 65"; a photo keeps "Chicken 65" and "Paneer 65" (Gobi 65 not tried on a photo); "Chicken 65 Biryani",
  "Mushroom 65", "Baby Corn 65" and "7 Up" keep their numbers on a typed menu.
- 5 ("Hundred grams paneer"): fixed, shows "Paneer"; "(gram flour)" and "Bengal gram salad" keep "gram".
- 6 (mocks' place): fixed. Every scripted place is '' and coverage() fails on any other; menu-closest (320 light) and
  menu-planned-diabetes (360 dark) show no "Read as" line.

## Code read
- In full: the diffs of src/v5/core.js, src/v6/app.js, src/v6/engine.js and test/ux/review.js; docs/ux/UX-CRITERIA.md parts B, C and D
  (part A by its table and IDs); the Tiers section of docs/SAFETY-INVARIANTS.md; the handoff diff. Skimmed: test/safety/check.js,
  lexicon.json and the eval/ grids (the auditor's scope).
- review.js: no assertion loosened; it adds the eight-button note assertion and the place guard.
- No removed safety line, no unit change, no banned word in app text. The note keeps role="status" and the #said line; the steppers keep
  their labels ("Less protein", "More protein").
- Behaviour changes for the auditor, not rated here: a kidney or gurda dish on a photo menu refers; the 29 window phrasings and the new
  kidney spellings refer on the typed paths; a plate change that alters grain grams with no declared grain item is not offered (S10).

## Owner rules, read explicitly
- Look: Raw Linen in every state I opened, light and dark; dark keeps the paper (320 dark Builder bound and plate-hero, 360 dark menu, 390
  dark menu-closest). The note uses the existing torn-paper style.
- Units: grams and kcal; the rise is a band (Gentle, Moderate, Sharp), whole at 320 and at 130 %. Menu names lose counts and prices.
- Supplements: none seen. Safety (rule 3): menu-refer refers; with diabetes the grain stays (rules check). Words: none in the build.
  Brand line unchanged. Missing figures stay empty.

## Not inspected
- Screens opened: 320 light (builder-saved-out-of-bounds 2-3, builder-adjusted-2, builder-no-plate-1, menu-refer 1-2, menu-closest 1-2,
  rescue-menu-order 2-3, plate-hero 1-3); 320 dark (builder-saved-out-of-bounds-2, plate-hero-1, menu-nothing-fits-1); 360 light
  (builder-saved-out-of-bounds-2, plate-band-moderate-2); 360 dark (menu-planned-diabetes 1-2); 390 light (builder-saved-out-of-bounds-2);
  390 dark (menu-closest-1); 360 at 130 % (builder-saved-out-of-bounds-2, menu-closest-2, plate-hero-1). Not opened: every other slice and
  state, including the urgent and kidney states this round, and the 375, 393, 412 and 430 runs (measured only).
- I did not run a separate --page hosted/v6/index.min.html review; my Builder and engine probes used index.min.html.
- test/safety, npm run safety and AUDIT.md (the auditor's).
- Live Gemini replies: how often bare measures, "65" dishes, kidney dishes and the listed referral phrasings come up in ordinary use.
- The owner's own phone model, Android font rendering and scroll anchoring on a device, system text above 130 %, dark mode on a device.
- The films by ear (unchanged; measured check only). Whether clients read the Builder's refusal note.
