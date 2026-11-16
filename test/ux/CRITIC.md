VERDICT: FAIL
BUILD: 2909c1abe5cbeefcbad8c97e81640bf5e9f3b34b29b16258b13add318a69ad9c

Critic round 39.
- Tree: branch claude/nice-hawking-307ljy at eddb00b. Fixes judged: 6b5e18d..eddb00b. Verdict is on the whole app against live 6febc1a.
- During the round the safety auditor committed 425f898. It changes only test/safety/AUDIT.md, which the fingerprint leaves out.
  I did not read AUDIT.md.
- The fingerprint was 2909c1ab...ad9c at the start, midway, and after all measuring and probing. It is unchanged.

Why FAIL:
- One MAJOR finding (1): the after-meal rise band "Moderate" is cut to "Modera" on the plate card at 320 px, and runs past its cell at 360 px.
  It is carried over from live, not new, but it is on the main screen for the narrowest phones this audience holds.
- Four MINOR findings (2-5).
- Every measured check passed, apart from the words check, which failed only on my own round 38 file (see Measured).

## Measured (run by me on this tree)
- npm run review: exit 0. 9 runs, 166 states, 1,494 checks, no violations (report 2026-11-16T08:15Z). It ran in the background,
  in one go, with no stop. test/ux/out/report.md names no unreached state and no page error.
- npm run drill: exit 0, "every planted fault was caught" (a separate run from the drill line inside the review).
- npm run rules: exit 0 on all three built pages, "every rule check holds".
- npm run films: exit 0. All four films have picture from 0 s, no decode errors and no 7 s freeze, at -16.7 to -16.8 dB.
  No film or post changed in this diff.
- npm run words: before I wrote this file it failed with 3 hits, all in my own round 38 CRITIC.md (lines 57, 62, 110). None were in the
  build, its notes or AUDIT.md. After I wrote this file it passes: exit 0, no banned words outside the listed exceptions.
- test/ux/allow.json: empty ([]). test/words/allow.json: unchanged since 6febc1a.
- Probes (scratchpad, read and measure only):
  - name and menu probes through showName, checkMeal, checkMenu and noFitLine, run on hosted/v6/index.html, index.min.html and
    hosted/v5/index.min.html. All three give the same results.
  - a browser probe (r39/probe.js) on index.min.html and on the live page from 6febc1a. It measures the band cell and the Builder note.

## Round 38 findings, checked
- MAJOR 1 (counts as words): fixed for every form I raised.
  - "Two phulka", "Teen phulka", "Do roti", "Do aloo paratha", "Half plate biryani", "One katori dal", "Two rotis with dal",
    "Buttermilk one glass", "A couple of rotis", "Ek plate poha" all lose the count.
  - "Three bean salad", "Five spice tofu", "Paneer do pyaza", "Panch phoron dal", "Egg half fry", "One-pot khichdi" keep their names.
  - Other forms remain (finding 4).
- MINOR 2 (menu names lose their numbers): partly fixed. It still happens on common typed menus (finding 3).
- MINOR 3 (condition on "Also on this menu", and the tick): fixed.
  - Each conditional row ends "· Only if they can make it this way."
  - On a conditional order the "Jain" chip has no tick.
  - The rows were seen at 320, 360, 390 and 412, light and dark, and at 360 px with 130 % text. The unticked chip was seen at 320
    light and dark and at 412 light. One cosmetic remains (finding 6).
- MINOR 4 (get-help line order and weight): fixed on all four surfaces.
  - On the plate ask, Rescue and the menu it is the heading, with the referral under it.
  - In the log it is the bold first line of a referral note, not an error note.
  - Where I saw it:
    - plate ask: 320, 360, 390 and 412 dark, 320 and 390 light, and 130 %;
    - Rescue: 320 light, and 360, 390 and 412 dark;
    - menu: 320 and 412 light, and 360, 390 and 412 dark;
    - log: 320 light and dark, 412 light, and 130 %.
- Cosmetic 5 (nothing-fits line): fixed. The state shows the engine's own line. One wording cosmetic remains (finding 7).
- Cosmetic 6: fixed. plate-rules-reload says "Your answers changed since this plate was made, so this plate is new."
  plate-old-saved keeps the app-change wording. Plates from the live build carry no stamp, so ship day shows the app-change note.
- Cosmetic 7: fixed. The subtitle reads "Miso glazed tofu, buckwheat soba, bok choy and edamame".
- Cosmetic 8: fixed. The reason line says protein once.
- Cosmetic 9 (Builder bound): the toast is gone, but the new note has defects (finding 5).
- Cosmetic 11: fixed. On the log referral "Count it" is not the main button, and "It is counted, not judged" is not shown.
  A side effect is finding 8.
- Cosmetic 12 (medicines note): the new wording is "the calories shown add up with the protein, carbs and fats". That is plain.
  I read it in params.js; no review state shows it.
- Not fixed on purpose. I judged each screen without the examples:
  - "Grains" in the Builder is clear on its own.
  - "Ask which grain they have, then name your dish with it." (menu-grain-no) follows "You said tandoori roti is not available".
    In that context it reads clearly.
  - The placeholders "the dish, as on the menu" and "What you ate, and how much" say what to type.
  - The BP cook line without "pickle and papad": the BP note on the plate still names them.
  - None of these leaves a screen unclear. Photo menus showing "Chicken" for "Chicken 65" is an accepted cost.

## Findings, most serious first

1. MAJOR: the after-meal rise band "Moderate" is cut off on the plate card.
   - Surface: Plate, "Nutrients in this plate", the Sugar rise cell, on any plate whose band is Moderate.
   - Evidence: 320-light/plate-random-combos-2.png and 320-dark/plate-random-combos-2.png show "Modera".
     360-light/plate-random-combos-2.png and 360-dark/plate-random-combos-2.png show the final "e" cut at the ticket edge.
   - Measured (r39/probe.js, plate of 700 kcal and 84 g carbs, diabetes profile):
     - 320 px: the word runs from x 215 to 302 in a cell from 207 to 287, so 15 px past the cell. The .v box is scrollWidth 86 in
       clientWidth 62. On screen it is cut at about the cell's right edge. I did not identify the clipping element: .hero, the plate
       card, #scroll and #app have overflow hidden, no clip-path or contain, and the page styles have no mask.
     - 360 px: 86 in 75, the word ending 1 px past the cell.
     - 390, 412 and 360 at 130 %: it fits.
     - Live 6febc1a measures the same, so this is carried over. The cell's styles have not changed since live
       (legible.css:44, 50, 142-144, 197: nowrap with a 22 px band face in a three-column grid).
   - Why it matters:
     - The band is the one sugar signal the owner allows (rule 2: Gentle, Moderate, Sharp), and it matters most to clients with diabetes.
     - "Modera" is not a word. Older iPhones (320) and small Androids (360) are this audience's phones.
     - "Gentle" fits (seen). "Sharp" is shorter; I did not see it in this cell.
   - Criteria: A2, B3, owner rule 2 (the band must be readable to be a band).
   - Smallest correction: let the band value wrap or shrink inside its cell, for example .read4 .v.band-m{white-space:normal} or a
     smaller clamp. Or use the two-column grid that the container query already gives at 14.9em, at 320 and 360 too.
     Then add a review state with a Moderate plate at 320 that fails on this build.

2. MINOR: the measured clip check (A2) does not see finding 1, and passes it.
   - What is wrong: review.js:719-724 skips a box whose children are blocks ("a box of boxes"). It checks only a texty element's own
     overflow when that is hidden.
     - Here .v is a flex row whose only child (span.mono) is blocked, so .v is skipped.
     - The span is as wide as its text, so it does not overflow its own box.
     - The overflow-hidden ancestors (.hero and up) have no text of their own.
   - Result: 1,494 checks and "No violations" while a band word is cut at 320 light and dark.
     plate-random-combos-2 is in the gate set, so the state was reached and screened.
   - Why it matters: the gate claims A2 coverage for this class of defect, and the drill's planted "run-on figure" does not
     use this nesting.
   - Criteria: A2, A12.
   - Smallest correction:
     - For every text node, compare its rendered rect with its own cell's box and with every ancestor that clips or masks.
     - Plant a nested flex figure in the drill.

3. MINOR (round 38, finding 2, partly fixed): numbered dish names still lose their number on common typed menus. That breaks the owner's
   fixed decision that "Chicken 65" and "Gobi 65" stay.
   - What is wrong: menuPrice (src/v5/core.js:589-594) decides whether the menu is priced by counting lines that end in a digit, then keeps
     "Chicken 65" only if a digit follows it in the typed text.
   - Measured through checkMenu on index.min.html (r39menu.js; typed menus, as_written "Chicken 65" and "Gobi 65"):
     - "Chicken 65 240 / Gobi 65 180 / ...": kept.
     - "Chicken 65 - Rs 240 / ..." and "Chicken 65 Rs. 240 / ...": "Chicken", "Gobi".
     - an unpriced list "Chicken 65 / Gobi 65 / Dal Tadka / Tandoori Roti": "Chicken", "Gobi". Half the lines end in "65", so the menu
       is taken as priced.
     - "Chicken 65 (Half) 180 (Full) 320": "Chicken".
     - Kept: "₹ 240", "- 240", ": 240", "240/-", "240 rs" and tab-separated.
   - Why it matters:
     - The client reads the order to the waiter, and "Chicken" is not on that menu.
     - "Rs" prices and unpriced lists typed off a board are ordinary in India.
     - The owner accepted the loss only for photo menus.
   - Criteria: owner decision (16 Nov, "Remove counts, keep names"), A17, B7.
   - Smallest correction:
     - In menuPrice, treat "Rs", "Rs." and "INR" before a number as a price mark, as ₹ already is.
     - Call a menu priced only by lines whose last number is not the dish's own: a line priced has two numbers, or one after a price mark.
     - Keep the name when the typed line is the name alone.
     - Add rules cases for these four formats.

4. MINOR (round 38, finding 1, residue): some household counts and measures still reach a plate name, beside its grams.
   - Measured through checkMeal (r39b.js, index.min.html):
     - Hindi six to ten are kept: "Chhe roti", "Saat idli", "Aath puri", "Das idli". CNTQTY in core.js:574 stops at paanch.
     - Hindi plurals are kept: "Do rotiyan", "Teen rotiya". CNTPIECE (core.js:564) has no rotiyan, rotiya or chapatiyan.
     - A measure with no number is kept: "Glass of buttermilk", "Bowl of dal", "Cup of curd", "Plate of poha", "Handful of almonds".
       The title becomes "Charred paneer tikka with glass of buttermilk".
     - Menu path: "Plate of 3 idli" is kept with its digit, because MENUCOUNT (core.js:585) removes a digit count only at the start or after
       with, and, plus or a comma.
     - "Couple rotis" and "Triple egg omelette" are kept. Both are rarer.
   - Not seen in the 3,452 recorded model names (eval/usefulness/names-diff.txt; I grepped eval/ for these forms and found none).
     That is why this is MINOR, not MAJOR. The prompt (nameText, core.js:656) forbids digits but not count words or measure words.
   - Why it matters: "120 g Glass of buttermilk" and "Saat idli" count in household units (owner rule 2; S8 says no household count
     shows in a name).
   - Criteria: owner rule 2, S8, B7.
   - Smallest correction:
     - Add chhe, saat, aath, nau and das to CNTQTY, and rotiyan, rotiya and chapatiyan to CNTPIECE.
     - Take a leading measure phrase off a name, as the katori rule does ("bowl of", "glass of", "cup of", "plate of", "handful of").
     - In MENUCOUNT, also remove a digit after "of".
     - Add one line to nameText: "no counts or measures in words".
     - Add rules cases.

5. MINOR: the Builder's bound note says something untrue, is out of sight at 320 px, and stays after it stops applying.
   - Surface: Builder after a refused step (builder-saved-out-of-bounds), at every width.
   - The copy: "Fats and seeds can't go higher: each part of the plate stays between 5 % and 40 %."
     - Only fats has 5-40. Protein, vegetables and grains go to 70 (RATIOB, core.js:44).
     - A client then sees grains at 50 % and the note contradicts the screen.
     - The note also writes "40 %" with a space, while the steppers write "37%".
   - Out of view at 320 (r39/probe.js, plus button centred as a thumb would leave it):
     - The note sits at y 488-599 in a 568 px viewport.
     - It is under the sticky "Plan lunch with this plate" button (y 443-491), so noteVisible is false.
     - A tap on + changes nothing that can be seen. At 360 it is visible (y 571-657 of 740).
     - The review only asserts that the note is below the row (review.js:286-288), not that it can be seen.
     - Screens: 320-light/builder-saved-out-of-bounds-2.png (steppers, no note) and -3.png (the note, after scrolling).
   - Stale (probe, at 320 and 360): after tapping "Balanced" (shares 35/35/20/10) and after "Plan lunch with this plate" and coming back to
     Builder, the note still says fats can't go higher. UI.rbound is cleared only by a successful step (app.js:572-574).
   - Why it matters: on the client's own phone width the refusal is invisible, then wrong.
   - Criteria: B5, B6, B7.
   - Smallest correction:
     - Name the part's own bounds: "Fats and seeds stay between 5% and 40% of the plate."
     - Clear UI.rbound on a preset, on clear-ratio and on make-ratio.
     - Show the note where the tapped row is: under the stepper card, or as a status line under the steppers inside the card, above the
       sticky button.
     - Assert in the review that it is inside the viewport and not under the sticky button.

6. COSMETIC: on an "Also on this menu" row, "Only if they can make it this way." has nothing for "this way" to point to.
   - The request ("Make it Jain style, with no onion, garlic or root vegetables") is only on the selected order's card.
   - Evidence: 320-light/rescue-menu-request-2.png and -3.png; 390-light/rescue-menu-request-2.png.
   - Criteria: B7.
   - Correction: use the request's short form on rows, for example "Only if made Jain style".

7. COSMETIC: the nothing-fits list now has a comma inside an item.
   - For a Jain client with BP who leaves out dairy, nuts, wheat and soya it reads "... dairy, nuts, wheat, soya or pickle, papad".
   - "Pickle, papad" looks like two items, after the "or".
   - Measured with noFitLine (r39b.js). The Vegetarian state reads well: "(no meat, fish, egg or sweets)".
   - Correction: "pickle and papad" (and "onion and garlic") inside an item.

8. COSMETIC: on the log referral the line "What you type goes to Google Gemini." is removed, but the box and "Count it" stay live.
   - Evidence: sheet-log-urgent-2.png and sheet-log-referred-1.png at 320 light.
   - The line was on screen before the first send, and the referral itself is decided before the model. Edited words sent from here go to
     Gemini with no line saying so.
   - Criteria: B12.
   - Correction: keep that one sentence under the referral note, or disable "Count it" until the words change.

9. COSMETIC: Rescue's common-dish chips carry counts.
   - The chips: "Paneer butter masala with 2 butter naan" and "Pahadi mutton rara with 2 butter rotis" (src/v5/app.js:506,
     engine.js:673).
   - Evidence: 320-light/menu-photo-error-2.png; 412-light/menu-urgent-1.png.
   - The dish then shows as typed. It is the client's own words once tapped, but the app wrote them.
   - Carried over from live.
   - Criteria: S8 (in spirit), B7.
   - Correction: drop the "2".

10. COSMETIC (review fidelity): the menu mocks show portions the engine cannot produce.
    - MENUCLOSE and the menu-grain-* replies (review.js:81, 341, 358, 527, 536) use portion "1 bowl, ≈ 300 g".
    - checkMenu writes the portion from grams only ("≈ 300 g").
    - So menu-closest, menu-grain-two and others show "1 bowl" on screen, a household unit no client sees. Screens judged for rule 2 should
      be the engine's output.
    - Correction: make the mocks "≈ 300 g" (or route them through engineCheck, as menu-nothing-fits now does).

## Code read
- In full:
  - the diffs of src/v5/core.js, src/v6/engine.js, src/v6/app.js and src/v6/params.js;
  - test/ux/review.js. No assertion was loosened. The bound check now asserts position, not visibility. New states were added.
  - test/rules/check.js. One check inverted, by design: without diabetes the protein swap on the grain item is no longer offered (M1).
  - test/ux/atlas/names.js, docs/SAFETY-INVARIANTS.md, eval/usefulness/names-diff.js and its output.
- Not read: test/safety/check.js and lexicon.json beyond the stat (the auditor's scope); AUDIT.md.
- Behaviour changes I noted, for the auditor rather than a UX finding:
  - any typed "kidney" other than kidney beans or a kidney dish now refers (S7);
  - the protein swap on the grain item is gone for every client.
- No removed safety line, no unit change, no banned word, no lost label or focus.
- The new referral heading reuses the h2 style, and the log referral note uses the plain note style, not the error one.

## Owner rules, read explicitly
- Look: Raw Linen holds in every state I opened, light and dark. Dark keeps the paper. The new notes and headings use existing styles.
- Units:
  - Grams and kcal throughout.
  - The rise is a band, but it is cut at 320 (finding 1).
  - The residual name forms are in finding 4.
  - The side count with grams is the owner's decision (14 Nov).
- Supplements: none seen.
- Safety (rule 3):
  - Kidney and pregnancy refer on every surface I opened (setup-2-referred, plate-blocked-kidney, sheet-log-referred).
  - The urgent line now leads.
  - With diabetes the grain stays ("The grain stays: about 100 g of jowar roti").
- Words: no banned word in the build. The brand line ("Next Plate. Made for you.") is unchanged on the stamp.
- Missing figures stay empty (Builder with no target).

## Not inspected
- Screens opened:
  - 320 light: every priority state, every state listed as not inspected last round, and plate-swap-declared-grain.
  - 320 dark: plate-ask-urgent, sheet-log-urgent, rescue-menu-request, plate-rules-reload, the Builder bound and random-combos.
  - 360 light: the Builder bound, the request rows and random-combos.
  - 360, 390 and 412 dark: the request rows, plate-ask-urgent, rescue-urgent, menu-urgent and random-combos.
  - 390 light: the urgent, request, random-combos, Builder and nothing-fits states.
  - 412 light: log-urgent, request, rules-reload, grain-protein-change and menu-urgent.
  - 360 at 130 %: urgent, log-urgent, request, Builder and nothing-fits.
- Not opened: every slice of every state at every width; the other states in the dark runs at 360, 390 and 412; sheet-log-urgent
  in dark above 320; menu-after-midnight, sheet-log-day-changed, plate-tune-stale and plate-plan-next-fresh.
- The element that clips the band word (finding 1).
- The medicines note on screen. No review state opens it; I read the string.
- The grainMiss refusal ("This change works on the planned grain, so it does not go with a grain swap."). No review state shows it.
- test/safety and npm run safety (the auditor's), and AUDIT.md.
- Live Gemini replies: how often count words, measures, numbered dishes, Rs-priced or unpriced typed menus, and conditional requests
  come up.
- The owner's own phone model, Android font rendering, system font scaling beyond 130 %, and dark mode on a device.
- The films by ear (unchanged; measured check only).
- Whether clients understand "Only if they can make it this way." and "Ask which grain they have".
