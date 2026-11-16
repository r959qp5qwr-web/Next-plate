VERDICT: FAIL
BUILD: ded556a7753f8c19c1137a03715f88c33c755b1c87c53b69050732501a11b0ae

Critic round 40.
- Tree: branch claude/nice-hawking-307ljy at ba4d8dc. Fixes judged: eddb00b..ba4d8dc, read in full (src, review.js, docs; the safety
  checks skimmed, as the auditor's scope). Verdict is on the whole app against live 6febc1a.
- During the round two commits landed that the fingerprint leaves out: ed057f0 (my provisional CRITIC.md, committed by someone else) and
  e0e7457 (test/safety/AUDIT.md). I did not read AUDIT.md.
- The fingerprint was ded556a7...b0ae at the start, midway and after all measuring. The per-file hash list taken at the start matches
  the one taken at the end. It is unchanged.

Why FAIL:
- Three MINOR findings: a regression against eddb00b that shows a menu price inside the dish name (1; live shows prices in names too),
  the Builder's refusal note still out of sight at 320 px for most rows (2, the rest of round 39, finding 5), and Hindi plural and
  measure counts still kept in names (3, the rest of round 39, finding 4).
- Round 39's MAJOR (the band word "Moderate" cut at 320 px) is fixed: measured and seen at every width from 320 to 440 px and at 130 % text.
- Every measured check passes.

## Measured (run by me on this tree)
- Review (node test/ux/review.js --quick --pool 6, the npm run review command with my own --out under the scratchpad, so as not to clash
  with the auditor): exit 0. 9 runs, 169 states, 1,521 checks, no violations (report 2026-11-16T12:58Z). It ran in the background, in one
  go, 39 minutes. The report names no unreached state and no page error. The drill inside it caught every planted fault.
- Extra run on the page clients load (--page hosted/v6/index.min.html, full-set widths 320, 375, 393 and 430, light and dark, plus 360 at
  130 %), on the ten changed states: 90 checks, no violations, no unreached state, no page error.
- npm run drill: exit 0, "every planted fault was caught". The new planted fault (a band word nested in a flex row in a grid cell under a
  clipping box) is among them.
- npm run rules: exit 0 on all three built pages.
- npm run words: exit 0 before and after I wrote this file.
- npm run films: exit 0. All four films have picture from 0 s, no decode errors, no 7 s freeze, -16.7 to -16.8 dB. No film or post
  changed in this diff.
- test/ux/allow.json is empty ([]). test/words/allow.json is unchanged since 6febc1a.
- Probes (scratchpad, read and measure only, deleted after):
  - names.js, names2.js, price.js, price2.js: showName with and without a typed menu, on hosted/v6/index.html, index.min.html and
    hosted/v5/index.min.html (same output on all three), and on the eddb00b page for comparison
    (the live 6febc1a page has no showName; menus there were compared end to end, below).
  - replay.js: the 124 distinct recorded menu names in eval/ (as_written, with their scenario's typed menu) through eddb00b and this tree:
    no name changes.
  - e2e.js and gurda.js: plan('menu').check end to end on index.min.html, eddb00b and live 6febc1a.
  - names3.js: more Hindi count, plural and measure forms, and gurda spellings, on index.min.html.
  - sweep.js (browser, index.min.html): the band word "Moderate" on the plate card, the order card (with "≈ 1150 kcal") and the Builder
    curve card, at 320, 340, 360, 375, 384, 390, 393, 396, 400, 404, 408, 412, 420, 430 and 440 px, at 100 % and 130 % text. It fits
    everywhere; the tightest margins are 3 px (plate card, 320 px at 130 %) and 5 px ("kcal" on the order card at 420 px).
  - builder.js (browser, index.min.html): where the Builder's refusal note lands for each row, with the row at different heights.

## Round 39 findings, checked
- MAJOR 1 ("Moderate" cut at 320 px): fixed. Below 20.2 em the plate figures take two columns. Seen whole: Moderate at 320, 360 and 390
  light, 360 dark, 412 light and 360 at 130 %; Sharp at 320 dark and 360 at 130 %; Gentle at 320 light. Every band state passed the
  review's band assertion at every run, and the sweep above measured Moderate at 15 widths. The plate and its
  grams still lead the first view at 320 (320-light/plate-band-moderate-1.png).
- MINOR 2 (clip check): fixed. review.js now measures each text against every clipping ancestor and its grid cell; the drill plants the
  round 39 nesting and catches it. It also found the four-digit "kcal" cut at 390 px, fixed in 9f60512 (390-light/menu-planned-diabetes-1.png).
- MINOR 3 ("Chicken 65" on typed menus): fixed for every shape I raised (Rs, Rs., INR, the rupee sign, dash, colon, @, /-, Half and Full
  prices, dotted leaders, tabs, an unpriced list, the whole line copied as the name). Three narrow shapes remain (finding 4), and the fix
  brought a regression (finding 1).
- MINOR 4 (counts and measures in names): fixed for the forms I raised; other forms remain (finding 3). "Chhe roti", "Saat idli", "Aath puri", "Das idli" lose the count; "Do rotiyan" shows
  "Rotiyan"; "Glass of buttermilk", "Bowl of dal", "Plate of poha", "Handful of almonds", "Plate of 3 idli" lose the measure; "Cup cake",
  "Buddha bowl", "Paneer do pyaza" and "Das ka dal" keep their names. "Couple rotis" and "Triple egg omelette" are unchanged (rare). The new
  numbers-above-twelve rule leaves one stub (finding 5).
- MINOR 5 (Builder note): copy and staleness fixed; visibility at 320 px only partly (finding 2).
- Cosmetic 6: fixed. Rows read "· Only if they make it Jain style." (seen whole at 320 and 360 light and 360 at 130 %; the review asserts
  the wording on every run).
- Cosmetic 7: fixed. "(no meat, fish, egg, onion and garlic, root vegetables, dairy, wheat, soya or pickle and papad)".
- Cosmetic 8: fixed. The log referral keeps "What you type goes to Google Gemini." under the note (320 light and dark, 360 dark).
- Cosmetic 9: fixed. The chip reads "Paneer butter masala with butter naan" (320 light, 360 dark); the mutton chip, hidden for the
  vegetarian seed, was read in src/v5/app.js:506 and engine.js:674.
- Cosmetic 10: fixed for portions (grams only, and a coverage guard fails on a household portion in a mock). The same class remains for
  the place line (finding 6).

## Findings, most serious first

1. MINOR (regression against eddb00b for the heading shapes): on a typed menu where every priced line has the same price and a heading
   has no price, the price shows as part of the dish name. Live 6febc1a shows the price in all of these (it cleans no menu names).
   - Surface: Rescue, Read the menu (typed), the order card, "Also on this menu" and "Leave for another day". Every width and scheme.
   - Measured end to end through plan('menu').check on index.min.html (r40/probe/e2e.js and price2.js), the dish copied with its price,
     as the model does in the recorded replies (135 of 531 recorded as_written names carry a digit, e.g. "Plain Dosa 70", "Upma 60"):
     - "THALI / Veg Thali 120 / Paneer Thali 120": orders "Veg Thali 120", "Paneer Thali 120". eddb00b: "Veg Thali", "Paneer Thali".
     - "LUNCH / Veg Thali 120": "Veg Thali 120" (eddb00b "Veg Thali").
     - "JUICES / Orange 60 / Mosambi 60 / Pineapple 60": "Mosambi 60"; "MEALS / Veg Meals 80 / Curd Rice 80 / Sambar Rice 80": "Curd Rice 80";
       "Today's special / Rajma Chawal 90 / Kadhi Chawal 90": "Rajma Chawal 90". eddb00b drops the price in each.
     - Without the heading ("Idli 40 / Vada 40 / Dosa 40") the price goes, as 5801f1a intended.
     - Carried over from eddb00b, not new: one item with a description line ("Veg Thali 120 / Served with 2 roti, rice, dal, sabzi")
       shows "Veg Thali 120" on both builds.
   - Cause: menuPrice (src/v5/core.js:603-616) calls a menu priced when it has a price mark, or when half its lines end in a number and
     either every line does or the numbers differ. A heading or description line counts as a line, so a one-price menu with a heading is
     read as unpriced, and the name keeps its trailing number as if it were "Chicken 65". 5801f1a fixed the list without a heading only.
   - Why it matters: the client reads the order to the waiter; "Veg Thali 120" sits beside "≈ 300 g" and "≈ 600 kcal", and a number
     with no unit on a card of grams and kcal can be taken for one of them. One-price boards (thali, meals, juices, a canteen's special)
     with a heading are ordinary in India. The recorded menus all have varied prices, so the replay does not show it.
   - Criteria: owner decision (16 Nov, "Remove counts, keep names": a price is not part of the name), S8 (no digit in a name unless it is
     part of the name), B7, A17.
   - Smallest correction: when deciding "every line ends in a number", leave out lines that hold no digit and read as a heading (all
     capitals, or ending in a colon) or as a description (starting with "served", "with", "includes"); keep the unpriced dish list
     ("Chicken 65 / Gobi 65 / Dal Tadka") as now. Add rules cases: heading + one item, heading + uniform prices, description line +
     one price, each with the whole line copied as the name.

2. MINOR (round 39, finding 5, partly fixed): at 320 px the Builder's refusal note is still out of sight for most rows at a thumb's height.
   - What is fixed: the note names the tapped part's own bounds ("Fats and seeds can't go higher: this part stays between 5% and 40% of the
     plate."; "Grains ... 5% and 70%"), writes "40%" as the steppers do, and clears on a preset, on planning and on "Go back to the usual
     plate" (review assertions for the first two; src/v6/app.js:586, 610 and 613 read for all three). It now sits inside the stepper card.
   - What is left: the note sits under the last row (Fats and seeds), not under the row tapped, and the page does not scroll to it.
     Measured at 320 x 568 on index.min.html (r40/probe/builder.js; visible share of the note above the sticky "Plan lunch with this plate"
     button, which starts at y 443), tapping until refused with the tapped row at a given height:
     - Fats +: row centred 100 %; row at 60 % of the height 58 %; at 70 % 6 %.
     - Grains +: 100 / 54 / 2 / 0 % for the row at 30 / 50 / 60 / 70 %. Grains -: 54 % with the row centred.
     - Vegetables and greens +/-: 0 % with the row centred. Protein +/-: 0 % with the row centred, 46 % at 30 %.
     - At 360 x 740: protein + centred 18 %, greens + centred 69 %, fats 100 % up to 60 %, grains 100 % at 50 % and 74 % at 60 %.
     - The review's own screen 320-light/builder-saved-out-of-bounds-2.png (the natural stop with all four rows on screen) shows the note's
       first line under the button. The review asserts visibility only for the fats row centred (review.js:300-310).
   - Why it matters: on the narrowest phones, a tap that changes nothing says why only when the client happens to hold the row high on the
     screen; the reason is under the button otherwise. Fats + and Grains - (refused on the second tap from the seeded plate) are the likely refusals.
   - Criteria: B5 (state of a control visible), B6, A3 (what a tap produces comes into view).
   - Smallest correction: after a refused step, bring the note into view above the sticky button (scrollIntoView with block "nearest" and a
     scroll-margin-bottom the button's height), or show it directly under the tapped row; assert it for every row at 320 with the row at
     60 % of the height.

3. MINOR (round 39, finding 4, residue; same class and same weight as round 39 rated it): some Hindi plurals and measures without "of"
   still reach a plate name beside its grams (showName, names3.js, index.min.html):
   - "Do parathe" stays "Do parathe"; "Do anday" stays "Do anday" (CNTPIECE has parathas and ande, not parathe or anday).
   - "Glass buttermilk" and "Bowl dal" keep the measure (MEASOF needs "of").
   - Gone as they should: "Ek glass chaas", "Do katori dal", "Do glass lassi", "Ek plate idli", "Two bowls dal", and the counts in "Teen
     rotiyaan", "Chaar chapatiyan", "Paanch puriyan" (the plural stays as the name, which is fine).
   - Not seen in the recorded model names; the prompt now asks for no counts or measures in words. That keeps it MINOR, not MAJOR.
   - Why it matters: "Do parathe" beside "160 g" counts in household units (owner rule 2, S8).
   - Criteria: owner rule 2, S8, B7. Correction: add parathe, parathon, anday and the common -e and -on plurals to CNTPIECE; take a leading
     bare measure word off a name ("Glass buttermilk", "Bowl dal") as MEASOF does with "of"; add rules cases.

4. COSMETIC (round 39, finding 3, residue): "65" is still lost on three narrow typed shapes (showName with the typed menu, r40/probe/names2.js):
   - a menu whose every line is a dish ending in the same number ("Chicken 65 / Gobi 65"): "Chicken", "Gobi". 5801f1a names this cost.
   - unpriced "65" lines on an otherwise priced menu ("Chicken 65 / Gobi 65 / Dal Tadka 160 / Roti 30"): "Chicken", "Gobi".
   - a one-line typed menu "Chicken 65": "Chicken".
   - Every shape round 39 raised now keeps the name: "- Rs 240", "Rs. 240", "INR 240", "₹240", "240/-", "@ 240", ": Rs 240", "(Half) 180
     (Full) 320", dotted leaders, tabs, an unpriced list with other dishes, and the whole line copied as the name.
   - Criteria: owner decision (16 Nov), B7. Correction: none needed beyond finding 1's rules cases; list these as known costs.

5. COSMETIC: the new numbers-above-twelve rule leaves a stub when a gram word follows: "Hundred grams paneer" shows "Grams paneer"
   (CNTBIG, src/v5/core.js:579; "grams" and "g" are not in CNTMEAS). Not in the recorded names. Correction: add g, gm, gram, grams to the measure
   words the word counts take with them.

6. COSMETIC (review fidelity, same class as round 39, finding 10): the scripted menu replies carry place: 'North Indian restaurant'
   (review.js:81 and four more), so menu-closest, menu-planned-diabetes and others show "Read as: North Indian restaurant." (for example
   360-dark/menu-planned-diabetes-2.png). The engine sets place to "" (engine.js:657) and clients never see that line. Correction: place ''
   in the mocks, and add place to the coverage() guard that now checks portions.

7. COSMETIC (presentation of the owner's 16 Nov decision; owner question): a typed menu that lists a kidney or gurda dish ("Gurda Fry",
   "Mutton Kidney Masala") refers the whole menu with the generic card "Your coach and doctor should plan this with you." (menu-refer, 320
   light). The plate ask and Rescue cards quote what was typed; the menu card quotes nothing, so a client with no kidney condition at a
   Mughlai or dhaba menu is not told why the menu was not read or what to do next (B6). The owner kept the referral card's words on 14 Nov,
   so the wording is his call. One option: under the card, "This menu names a kidney dish." No change to the referral itself.

## For the owner: costs of the 16 Nov name rule that the accepted list does not name (not findings)
- Applied by position, the rule also turns "3 in 1 Dosa" into "In Dosa", "5 Star Thali" into "Star Thali" and "7 Up" into "Up"
  (showName with a typed menu, names.js). "In Dosa" and "Up" are not names a waiter knows. They are the same kind of cost as "Chicken 65
  Dosa"; whether to accept them is the owner's call.
- On photo menus a name ending in a number still loses it ("Paneer 65", "Chicken 555"), as accepted in round 39.
- "Tandoori Roti 2" keeps its "2": the open owner question stands.

## For the auditor and the owner (safety scope; not rated here)
- A typed menu that lists "Gurda Fry" refers (typed "Butter Chicken 380 / Gurda Fry 300": status refer). A photo of the same menu, with the
  model's refer_reason "none", offers "Gurda Fry" and "Mutton Kidney Masala" as orders to a non-veg client (plan('menu') with an image,
  r40/probe/gurda.js). The owner's rule speaks of typed words, so this may be intended; the two paths now disagree on screen.
- Typed "gurday", "gurdae", "goorda fry" and "gurdha" do not refer (referTyped, names3.js); gurda, gurde, gurdey, gurdo and gurdon do.
  The owner's 16 Nov decision covers gurda "in every form". The auditor's commit e0e7457 names a gurday finding; I leave the rating to it.

## Code read
- In full: the diffs of src/v5/core.js, src/v5/app.js, src/v6/app.js, src/v6/engine.js, src/v6/legible.css, test/ux/review.js,
  docs/SAFETY-INVARIANTS.md and handoff-next-plate.md. Skimmed: test/safety/check.js and lexicon.json (the auditor's scope).
- No assertion in review.js was loosened. The fats-bound assertion now checks the new wording and visibility with the row centred; new
  states plate-band-* and the log-referral Gemini line were added.
- No removed safety line, no unit change, no banned word, no lost label or focus. The refusal note keeps role="status" and the #said line.
- Behaviour changes I noted, for the auditor rather than as UX findings: the typed kidney and gurda forms I probed refer, a menu dish
  included (the owner's 16 Nov decision), with the spelling gaps listed above; the grain item is matched by its whole name (S10).

## Owner rules, read explicitly
- Look: Raw Linen holds in every state I opened, light and dark; dark keeps the paper. The new note and row texts use existing styles.
- Units: grams and kcal throughout; the rise is a band, now whole at every width. Finding 1 puts a price in a name; finding 5 a stub word.
- Supplements: none seen.
- Safety (rule 3): kidney and pregnancy refer on every surface I opened (plate-blocked-kidney, sheet-log-referred, menu-refer); the urgent
  line leads (plate-ask-urgent, rescue-urgent, menu-urgent, sheet-log-urgent); with diabetes the grain stays ("With diabetes the grain
  stays on the plate" note, jowar roti on the band plates).
- Words: none in the build. Brand line unchanged.
- Missing figures stay empty (Builder without a target).

## Not inspected
- Screens opened:
  - 320 light: the band states, plate-hero, the Builder bound (1-3), rescue-menu-request (1-3), menu-nothing-fits (1-2), sheet-log-referred,
    sheet-log-urgent (1-2), menu-photo-error-2, menu-urgent, plate-ask-urgent, rescue-urgent, plate-blocked-kidney, menu-refer (1-2),
    menu-planned-diabetes-2, and menu-after-midnight-1, sheet-log-day-changed (1-2), plate-tune-stale (1, 3), plate-plan-next-fresh-1.
  - 320 light also: plate-band-gentle-2. 360 at 130 % also: plate-band-sharp-2.
  - 320 dark: plate-band-sharp-2, the Builder bound 1, rescue-menu-request-2, sheet-log-referred-1.
  - 360 light: plate-band-moderate-2, the Builder bound 2, rescue-menu-request-2. 360 dark: plate-band-moderate-2, the Builder bound 2,
    sheet-log-urgent-1, menu-planned-diabetes-2, rescue-entry-2.
  - 390 light: plate-band-moderate-2, menu-planned-diabetes-1, rescue-menu-request-1, menu-nothing-fits-1, the Builder bound 2.
    390 dark: plate-hero-1, the Builder bound 1. 412 light: plate-band-moderate-2.
  - 360 at 130 %: plate-band-moderate (2-3), rescue-menu-request-3, the Builder bound 2.
- Not opened: every slice of every state at every width; most states in the 390, 412 dark and 412 light runs; the extra index.min.html run's
  screens (measured only).
- The menu-refer state is scripted (status refer); I did not render a typed "Gurda Fry" menu in a browser, only through the engine.
- test/safety and npm run safety (the auditor's), and AUDIT.md.
- Live Gemini replies: how often the model copies a price into a name on a one-price menu with a heading, and how often count words,
  numbered dishes and kidney dishes come up.
- The owner's own phone model, Android font rendering, system font scaling above 130 %, dark mode on a device.
- The films by ear (unchanged; measured check only).
- Whether clients understand "Only if they make it Jain style." and the Builder's refusal note.
