VERDICT: FAIL
BUILD: ded556a7753f8c19c1137a03715f88c33c755b1c87c53b69050732501a11b0ae

Critic round 40 (provisional: written while the gate review runs; the final version replaces this).
- Tree: branch claude/nice-hawking-307ljy at ba4d8dc. Fixes judged: eddb00b..HEAD.

## Findings, most serious first

1. MINOR (regression in this diff): on a typed menu where every priced line has the same price and one line has no price (a heading, a
   description), the price shows as part of the dish name.
   - Surface: Rescue, Read the menu (typed), the order card, "Also on this menu" and "Leave for another day". Every width and scheme.
   - Measured end to end through plan('menu').check on index.min.html (r40/probe/e2e.js and price2.js), the dish copied with its price,
     as the model does in the recorded replies (135 of 531 recorded as_written names carry a digit, e.g. "Plain Dosa 70", "Upma 60"):
     - "THALI / Veg Thali 120 / Paneer Thali 120": orders "Veg Thali 120", "Paneer Thali 120". eddb00b: "Veg Thali", "Paneer Thali".
     - "LUNCH / Veg Thali 120": "Veg Thali 120" (eddb00b "Veg Thali").
     - "JUICES / Orange 60 / Mosambi 60 / Pineapple 60": "Mosambi 60"; "MEALS / Veg Meals 80 / Curd Rice 80 / Sambar Rice 80": "Curd Rice 80";
       "Today's special / Rajma Chawal 90 / Kadhi Chawal 90": "Rajma Chawal 90". eddb00b drops the price in each.
     - Without the heading ("Idli 40 / Vada 40 / Dosa 40") the price goes, as 5801f1a intended.
   - Cause: menuPrice (src/v5/core.js:610-613) calls a menu priced when it has a price mark, or when half its lines end in a number and
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
     plate" (review assertions for the first two; app.js:264, 286, 290 read for all three). It now sits inside the stepper card.
   - What is left: the note sits under the last row (Fats and seeds), not under the row tapped, and the page does not scroll to it.
     Measured at 320 x 568 on index.min.html (r40/probe/builder.js; visible share of the note above the sticky "Plan lunch with this plate"
     button, which starts at y 443), tapping until refused with the tapped row at a given height:
     - Fats +: row centred 100 %; row at 60 % of the height 58 %; at 70 % 6 %.
     - Grains +: 100 / 54 / 2 / 0 % for the row at 30 / 50 / 60 / 70 %. Grains -: 54 % with the row centred.
     - Vegetables and greens +/-: 0 % with the row centred. Protein +/-: 0 % with the row centred, 46 % at 30 %.
     - At 360 x 740: protein + centred 18 %, greens + centred 69 %, fats and grains 100 % up to 60 %.
     - The review's own screen 320-light/builder-saved-out-of-bounds-2.png (the natural stop with all four rows on screen) shows the note's
       first line under the button. The review asserts visibility only for the fats row centred (review.js:300-310).
   - Why it matters: on the narrowest phones, a tap that changes nothing says why only when the client happens to hold the row high on the
     screen; the reason is under the button otherwise. Fats + and Grains - (refused on the second tap from the seeded plate) are the likely refusals.
   - Criteria: B5 (state of a control visible), B6, A3 (what a tap produces comes into view).
   - Smallest correction: after a refused step, bring the note into view above the sticky button (scrollIntoView with block "nearest" and a
     scroll-margin-bottom the button's height), or show it directly under the tapped row; assert it for every row at 320 with the row at
     60 % of the height.

3. COSMETIC (round 39, finding 3, residue): "65" is still lost on three narrow typed shapes (showName with the typed menu, r40/probe/names2.js):
   - a menu whose every line is a dish ending in the same number ("Chicken 65 / Gobi 65"): "Chicken", "Gobi". 5801f1a names this cost.
   - unpriced "65" lines on an otherwise priced menu ("Chicken 65 / Gobi 65 / Dal Tadka 160 / Roti 30"): "Chicken", "Gobi".
   - a one-line typed menu "Chicken 65": "Chicken".
   - Every shape round 39 raised now keeps the name: "- Rs 240", "Rs. 240", "INR 240", "₹240", "240/-", "@ 240", ": Rs 240", "(Half) 180
     (Full) 320", dotted leaders, tabs, an unpriced list with other dishes, and the whole line copied as the name.
   - Criteria: owner decision (16 Nov), B7. Correction: none needed beyond finding 1's rules cases; list these as known costs.

4. COSMETIC: the new numbers-above-twelve rule leaves a stub when a gram word follows: "Hundred grams paneer" shows "Grams paneer"
   (CNTBIG, core.js:134; "grams" and "g" are not in CNTMEAS). Not in the recorded names. Correction: add g, gm, gram, grams to the measure
   words the word counts take with them.

5. COSMETIC (review fidelity, same class as round 39, finding 10): the scripted menu replies carry place: 'North Indian restaurant'
   (review.js:81 and four more), so menu-closest, menu-planned-diabetes and others show "Read as: North Indian restaurant." (for example
   360-dark/menu-planned-diabetes-2.png). The engine sets place to "" (engine.js:657) and clients never see that line. Correction: place ''
   in the mocks, and add place to the coverage() guard that now checks portions.

6. COSMETIC (presentation of the owner's 16 Nov decision; owner question): a typed menu that lists a kidney or gurda dish ("Gurda Fry",
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
