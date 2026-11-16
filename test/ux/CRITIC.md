VERDICT: FAIL
BUILD: 88d93f0f1ca6770ad235fbd21ad06772232a05fa02ca2b89b2d04c610ff03781

Critic round 38.
- Tree: branch claude/nice-hawking-307ljy at 6b5e18d. Diff judged: 6febc1a..6b5e18d (6febc1a is the live build).
- During the round the safety auditor committed 0e423e8. It changes only test/safety/AUDIT.md, which the fingerprint leaves out.
- The fingerprint was 88d93f0f...3781 at the start, halfway through, and after all measuring and probing.
- I did not read AUDIT.md. Its commit subject mentions "word counts in names"; I checked that issue myself (finding 1).

Why FAIL:
- One MAJOR finding (1): owner rule 2, which is an automatic FAIL on its own.
- Three MINOR findings (2-4).
- Every measured check passed.

## Measured (run by me on this tree)
- npm run review: exit 0. 9 runs, 159 states, 1,431 checks, no violations (report 2026-11-16T04:31Z).
  - My first run was stopped at about 30 minutes by my own tool's background time limit, not by a check; the browser closed under it.
  - The second run, with a longer limit, passed first time. In that one complete run I saw no network flake and no menu-photo-error
    wait failure. One run cannot show whether a flake recurs.
- npm run drill: exit 0, "every planted fault was caught". This is a separate run, not the drill line printed inside the review log.
- npm run rules: exit 0 on hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html.
  621 ok lines, no FAIL; 833 names that are not a grain and 612 true grains.
- npm run words: exit 0. No banned words outside the 42 listed exceptions.
- npm run films: exit 0. All four films have picture from 0 s, no decode errors and no 7 s freeze, at -16.7 to -16.8 dB.
  No film or post changed in this diff.
- test/ux/allow.json: empty ([]).
- test/words/allow.json: unchanged since 6febc1a.
  - Every entry is the rule itself, a quoted record, a web address, or a constant name in the owner's own file.
  - Every reason holds up.

## Findings, most serious first

1. MAJOR (owner rule 2): household counts written as words reach the plate and the menu card.
   - What is wrong:
     - showName (src/v5/core.js:561) removes only counts written in digits.
     - The prompt now forbids digits in names (nameText, core.js:611: "plain letters, spaces and hyphens only: no digits"), which steers
       the model toward words.
   - Measured on the built np-core, through checkMeal (the fixture plate with its grain item renamed):
     - "Two phulka" is kept. The item shows "Two phulka" beside its grams, and the title is "Charred paneer tikka with two phulka".
     - "Teen phulka", "Do roti" and "Two rotis with dal" are kept the same way.
     - "Half plate biryani" is kept, with "plate" as the measure.
   - Through checkMenu: the orders "Two phulka" and "Half plate biryani" are offered.
   - The katori forms ("One katori dal", "A bowl of rajma") are dropped as "shape".
   - Probe script: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/words.js.
   - Why it matters:
     - The owner's rule is grams and kcal only, never phulka as a unit. "80 g Two phulka" counts in phulkas.
     - It contradicts the claim that no household counts such as "2 roti" show.
   - Criteria: owner rule 2, A17 (B7).
   - Smallest correction:
     - In showName, treat number words as counts, as digits are: one to ten, half, a, ek, do, teen, char, aadha, and the like.
     - Remove a measure word that follows them: plate, bowl, katori, piece.
     - Add rules cases that fail on this build.

2. MINOR (regression from live): menu names that contain a number lose it.
   - What is wrong: showName drops every digit run, not only counts. checkMenu (src/v6/engine.js:625) uses it for orders and for
     "Leave for another day" (engine.js:659).
   - Measured with a typed menu "Chicken 65 240 / Gobi 65 180" and as_written copied exactly:
     - the orders come out "Chicken" and "Gobi", with dropped = {};
     - a leave entry "Chicken 65" shows as "Chicken. Deep-fried, so heavy for this meal.";
     - probe scripts: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/menu65.js and words.js.
   - "7 Cup Barfi" becomes "Barfi".
   - Live (6febc1a engine.js:552) showed as_written exactly as written.
   - Why it matters: the client reads the order to the waiter. "Chicken" is not on that menu, and the figures are for the fried Chicken 65.
   - Criteria: A17 (menu names keep their words), B7.
   - Smallest correction:
     - On menu names, remove a number only when it opens the name or a measure or piece word follows it.
     - Keep "Chicken 65" and "7 Cup Barfi".

3. MINOR: an order that fits only if the kitchen agrees is not marked as such in "Also on this menu", and its "Jain" tick reads as unconditional.
   - Surface: rescue-menu-request at 320, 360 and 390, light and dark, and at 360 px with 130 % text.
   - Evidence: 320-light/rescue-menu-request-1.png, -2.png, -3.png; 360-dark/rescue-menu-request-2.png.
   - The order card itself is right: "Ask the waiter: Make it Jain style ..." is followed by "Only if they can make it this way." in the
     same style.
   - Problem 1, the chip: the card's first line is a green tick chip "Jain", with no condition.
   - Problem 2, the alternatives:
     - The Dal Tadka and Palak Paneer rows show only the side, kcal, protein and score.
     - checkMenu on the review fixture with the Jain plan marks all three orders on screen (Paneer Tikka, Dal Tadka, Palak Paneer)
       askIf = "Only if they can make it this way." (words.js).
   - Why it matters: a Jain client who scans the list, or trusts the tick, takes Dal Tadka as fitting their rules. It fits only if the
     kitchen leaves out onion and garlic.
   - The owner decided requests are shown and marked conditional. This finding asks only that the mark appear wherever the order appears.
   - Criteria: B6, B11.
   - Smallest correction:
     - Add "· only if made Jain style" (or the request's short form) to a conditional alternative's small line.
     - On a conditional order, show the diet chip without the tick.

4. MINOR: on an urgent symptom, the line telling the client to get help now is the lighter second line.
   - Surface: plate-ask-urgent ("chest pain after lunch") at every width and scheme.
   - Evidence: 320-light/plate-ask-urgent-1.png, 390-light/plate-ask-urgent-1.png, 360-light-big/plate-ask-urgent-1.png.
   - What the card shows:
     - The large dark heading is "Your coach and doctor should plan this with you." For chest pain this reads as a planning matter.
     - Under it, in muted body text: "If you feel unwell now, contact your doctor or emergency care."
   - Code: the line is a plain <p class="urgent"> (app.js renderPlate, orderView, renderRescue0). The built page has no .urgent style.
   - The wording is fixed and pending a clinician's review; the order and weight are presentation.
   - Why it matters: this is the one card where acting now matters, for readers with weaker near vision who read the heading first.
   - Criteria: B1, B6.
   - Smallest correction: when urgent is set, show URGENTLINE as the heading (or above it, in ink at heading weight) and the SAFETY line
     under it. Do the same on Rescue, the menu and the log.

5. COSMETIC: the engine's "nothing fits" line for menus is never shown on screen in the review.
   - The state menu-nothing-fits mocks {"status":"ok","orders":[]}, so it shows the old fallback line.
   - Measured for a Jain client with diabetes, no dairy and high BP: "Nothing on this menu fits your food rules (no meat, fish, egg, onion or
     garlic, root vegetables, dairy, pickle or papad or sweets). Ask what they can make for you, or name the dish you want."
     - It is long and stacks three "or"s.
     - I have not seen it rendered.
   - Correction: add a state that returns the engine's empty reply, and join the list with commas, "or" only before the last item.

6. COSMETIC: "Plates were updated after an app change, so this plate is new." shows in plate-rules-reload (320-light/plate-rules-reload-1.png),
   where the visible cause is the client's own "No dairy".
   - In real use the note comes from the load-time drop (r.rules!==rules()).
   - The day this build ships, every kept plate lacks a rules stamp, so there the wording is true.
   - When the client changes My food, closeSheet empties the store and no note shows.

7. COSMETIC: engineSub (core.js:701) joins item names that already contain "and".
   - Example: "Miso glazed tofu, buckwheat soba and bok choy and edamame" (320-light/plate-rules-reload-2.png).

8. COSMETIC: the reason line says "protein to catch up" and then "It helps you catch up on protein today".
   - It is a 9-line italic block at 320 px (320-light/plate-hero-5.png, 360-light-big/plate-hero-5.png).
   - Correction: drop the second sentence when protein_gap is already named among the hooks.

9. COSMETIC: in the Builder, "Fats and seeds can't go higher." shows at 37 %, with no reason given (the bound is 40 %, the step 5).
   - The toast covers the row just tapped, or the "Changed." note at 130 % text.
   - Evidence: 320-light and 360-dark builder-saved-out-of-bounds-1.png, 360-light-big/-2.png.
   - Grains at 12 % with diabetes is inside RATIOB (5-70).

10. COSMETIC: plain examples were removed.
    - Builder: "Grains (roti, rice, millet)" became "Grains".
    - Menu: "Ask which roti or rice they have" became "Ask which grain they have".
    - Dish placeholder: "for example, chole bhature" became "the dish, as on the menu". It also shows at a function.
    - Log placeholder: "2 aloo paratha with curd" became "What you ate, and how much".
    - Correction: filter the examples by the client's rules (as APPASKS does) rather than removing them.

11. COSMETIC: the log referral (sheet-log-referred-1.png) has three small problems.
    - It shows as an error note.
    - "Count it" stays the primary button.
    - The hint under it, "It is counted, not judged...", sits beside "Next Plate does not count meals for this."

12. COSMETIC: the reworded medicines note (params.js) is not plain enough for these readers.
    - It says "... and the figures are checked to agree."
    - I did not open a screen showing it.

13. COSMETIC (removed line, no defect found): the high-BP cook's line went from "Cook with no added salt; skip pickle and papad." to "Cook with
    no added salt."
    - The BP note under the card still says "With high BP these plates leave out pickle, papad and added salt."
    - The engine bars salty sides with BP (barredTags), so the information is still on screen.

## Diff read
- In full:
  - src/v6/app.js;
  - src/v6/legible.css, src/v6/params.js, src/v5/server.ts, build6.js;
  - test/v6/fixture-menu.js and test/v5/mock-gemini.ts;
  - the removed lines of test/ux/review.js. No assertion was loosened: "in place of" now also accepts "charred", because the fixture item
    is "Charred paneer tikka".
- In part:
  - src/v6/engine.js: reasonLine, the menu request and nothing-fits code, the app examples, the urgent net.
  - src/v5/core.js: showName, checkRescue, the new prompt strings.
  - test/rules/check.js: the head only. It shims contentsBad and referred for cases that declare none; the reason given, that
    test/safety/check.js covers those, holds.
- Not read: the rest of the core.js and engine.js diffs, the page styles beyond searching for .urgent, the eval/ and test/safety/ files.

## Owner rules, read explicitly
- Look: Raw Linen is held in every state I opened, and dark mode keeps the paper. The new lines use the existing styles.
- Units: broken by finding 1.
  - Elsewhere, grams and kcal, and the rise is a band.
  - The Rescue title is the client's own typed words (core.js:744). "2 katori dal" typed there is quoted back, not used by the app as a
    unit; the weight is engine-written in grams. Not a breach.
- Supplements: "Rescue helps with a meal, not a supplement or a powder." refuses one and recommends none. Not a breach.
- Safety (rule 3): the kidney and pregnancy referral is unchanged. The log referral shows the fixed line. With diabetes the grain stays,
  and the refusal toast "Not changed. With diabetes the grain stays, at least half of it." reads clearly at 320 px.
- Words: the check passes, and the new strings contain no banned word. The brand line was not changed.
- Missing figures: they stay empty.

## Not inspected
- Screens I opened:
  - 320 light and dark: the new and changed states listed above.
  - 360 light and dark: the request card and the Builder.
  - 390 light and dark: the urgent card and plate-hero.
  - 360 px with 130 % text: the request, urgent, Builder and why-line states.
  - plus rescue-two-moves-grain and plate-two-grain-changes at 320 light.
- Not every slice of every state, and nothing at 412.
- New states I did not open at any width:
  - plate-swap-then-change, plate-change-then-swap, plate-swap-change-logged, plate-swap-declared-grain, plate-tune-stale,
    plate-plan-next-fresh;
  - plate-after-midnight, plate-overnight-first-tap, plate-overnight-first-change, plate-dinner-after-midnight, rescue-after-midnight,
    menu-after-midnight, sheet-log-day-changed;
  - rescue-had-its-meal, plate-rescued, menu-photo-error;
  - plate-random-combos 1 to 3.
- The urgent line on Rescue, the menu and the log: no review state shows it.
- The engine's nothing-fits line and the medicines note on screen.
- test/safety (the auditor's scope; I did not run npm run safety); AUDIT.md.
- Live Gemini replies, and how often word counts, numbered menu names, conditional requests and urgent wordings come up.
- The owner's own phone model, Android font rendering, and text scaling beyond 130 %.
- The films by ear (unchanged in this diff; measured check only).
- Whether clients understand "Only if they can make it this way." and the reason line.
