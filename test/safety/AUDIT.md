VERDICT: FAIL
BUILD: 27f30373dd9bb12a4c688e3fe1383743c88863d4c1c425af727da8e12eb910d7

Safety audit of commit 06d880f, 15 Nov 2026. Judged on the np-core script inside `hosted/v6/index.min.html` and on the v6 screens. The
builder's summary and test counts were not used. Model replies were written by hand; the live model was not called.

Checks run: `npm run -s build` in a scratch copy of the build inputs gives pages byte-identical to the three committed pages, so the
committed pages are the build of the current sources. `npm run -s safety`, `rules` and `words`: all pass. The fingerprint was 27f30373...0d7
at the start and is the same after all probing.

How each finding was reached: "engine-run" = a hand-written reply through `plan(kind).check()` in Node on np-core; "driven" = the v6 screen
in headless Chrome (network blocked), on a scratch copy of `hosted/v6/index.html` with the app scope exposed; "read" = code reading only.

5 BLOCKER, 2 MAJOR, 5 MINOR, 2 COSMETIC. Every counter-example in the previous audit is now caught on this build (see Probed); the findings
below are new instances and new classes at the new chokepoints (`norm()`, `closedText`, `affirmed()`).

## BLOCKER

**1. S1-S4: characters that `norm()` leaves in place hide any listed food from the closed check and the word net, in every prose field.
No wrong tag is needed (engine-run, 69 cases, 53 shown; driven, with screenshots).**
`norm()` (src/v5/core.js:158) removes a fixed list of format characters. It leaves the tag characters (U+E0001, U+E0020 to U+E007F), the
interlinear annotation marks (U+FFF9 to U+FFFB), the musical, shorthand and hieroglyph format controls (U+1D173 to U+1D17A, U+1BCA0 to
U+1BCA3, U+13430 to U+1343F) and Arabic number signs (U+0600 to U+0605). These are invisible or blank on screen. It also leaves Latin
letters that NFKC does not fold, such as script g (U+0261), dotless i (U+0131) and small capital c (U+1D04); `NONLATIN` (core.js:594)
passes them because they are Latin script. `words()` (core.js:160) then drops every character outside a-z and 0-9, and `PROSEW`
(core.js:554) accepts any single letter.
- Vegetarian plate, for_you "Have a little chicken on the side today" with U+E0020 between the letters of "chicken": shown. The driven
  screen shows "Why this plate, today / Have a little chicken on the side today". Rendered in Chrome: U+E0020, U+FFFA and U+1D173 are
  invisible, and the line reads "chicken"; U+1BCA1 and U+0601 show as marks between the letters; U+E0001 and U+13430 passed the engine and
  were not rendered.
- Vegetarian plate, pairing tip "Add a boiled egg" with both g's as U+0261: shown. The driven screen shows "Add a boiled egg".
- The same U+0261 egg is shown as a Rescue move ("Add a boiled egg on the side"), a menu tip and a one-tap change (suffix and note).
- With U+E0020, U+E0001, U+1D173, U+1BCA1, U+FFFA or U+13430 between letters, these were shown in for_you: chicken and mutton to a
  vegetarian, ghee to a vegan, garlic to a Jain client, paneer with dairy left out, cashew with nuts left out, jalebi with diabetes, papad
  with high BP (48 of 48).
- Dairy left out: pairing tip "Add some p(U+0251)neer" is shown ("p" is a single letter, "neer" is read as a grain word).
- The previous B6 class is open again for these characters: plate item "Chic(U+E0020)ken tikka", "Ch(U+0131)cken tikka" and
  "E(U+0261)(U+0261) bhurji" tagged [grain] are offered to a vegetarian.
- Smallest fix: after `norm()`, refuse any model field that holds a character outside an allowlist (ASCII letters, digits, spaces, plain
  punctuation, and the few marks the screens use such as the approximate sign), rather than removing a list of known tricks; take the
  single letters other than "a" and "i" out of `PROSEW`.

**2. S1-S4: on Rescue, a food the client said no to is still excused when the negation is not one the engine lists, and food the engine
itself reads as not that food excuses the tag (engine-run, 45 cases, 31 counter-examples).**
`affirmed()` (core.js:570) removes only `NEGPRE` and `NEG` spans. `NEGPOST` (core.js:126) is defined but not applied, and Hindi and short
forms are not listed. `typedTags()` (core.js:571) does not apply `notFood()` or `PLANT`, so "almond milk", "soya keema", "peanut butter",
"sol kadhi", "coconut milk" and "rice noodles" excuse dairy, meat or wheat. The dish name below is made only of the client's typed words,
so the closed check passes it.
- Vegetarian types "Veg fried rice w/o egg", "Veg fried rice, egg nahi", "Veg fried rice bina egg ke", "Veg fried rice, egg mat dalna",
  "Egg free fried rice", "Fried rice, egg not added", "Fried rice (egg removed)" or "Fried rice, egg skipped": dish "Egg fried rice"
  [egg, grain] is shown.
- Jain types "Dal fry bina pyaz lahsun ke": "Dal fry with lahsun" [onion_garlic] shown. "Pav bhaji, onion garlic not added", "Pav bhaji
  onion-less", "Pav bhaji w/o onion", "Jain pav bhaji (onion, garlic not used)": "Pav bhaji with onion" or "with garlic" shown.
- Vegetarian types "Paneer tikka, chicken nahi", "..., chicken nai" or "..., never chicken": "Chicken tikka" [meat] shown.
- Dairy left out, "Chicken curry, butter nahi": "Chicken curry with butter" shown. Vegan, "Veg biryani, raita nahi chahiye": "Veg biryani
  with raita" [dairy] shown. Diabetes, "Thali, mithai nahi": "Thali with mithai" [sweet] shown (S4). High BP, "Thali, papad nahi" and
  "Thali, achar mat do": "Thali with papad", "Thali with achar" shown (S3).
- Vegan types "Oats with almond milk": dish "Oats with milk" [grain, dairy], warning "The milk adds most of the fat", breakdown "Most of the
  fat is in the milk" and move "Have half the milk" are all shown. The honest name "Oats with almond milk" [grain, nuts] is dropped instead.
- Dairy left out, "Toast with peanut butter": "Toast with butter" [dairy] shown. Vegetarian, "Soya keema pav": "Keema pav" [meat],
  breakdown "The keema carries most of the fat" and "Eat half the keema" shown.
- Smallest fix: in `affirmed()` apply `NEGPOST` and add the forms nahi, nai, na, bina ... ke, baghair, mat, never, w/o, "X free" and
  "X-less"; run `notFood()` and the `PLANT` rewrite on the typed text before `typedTags()`.

**3. S1, S2, S4 (and S9): the menu side carries free model text that skips the closed check (engine-run, 8 cases, 5 shown).**
`sideOnMenu()` (src/v6/engine.js:336, called at engine.js:587) checks only the part of "with" before the first comma, bracket or semicolon
(`sideName`). The whole string is shown on the order card and in "Also on this menu", and logged in the title. Its tags
(`with_contains`) are the honest tags of the menu item the head names (the roti); they leave out the food in the tail, and nothing reads
the tail as prose.
- Typed menu "Dal fry 180 | Tandoori roti 30". Dairy left out: with "2 Tandoori roti, and a glass of mor" (mor is buttermilk) is shown.
  Vegetarian: "2 Tandoori roti (with mahi tikka)" shown. Diabetes: "2 Tandoori roti, then a little misri" shown. Any profile:
  "2 Tandoori roti, and Complan after" shown. Vegetarian: "2 Tandoori roti; add a boiled egg" (U+0261 g's) shown.
- Smallest fix: show and log only the side head that matched the menu, with its count and grams, or pass the tail through `closedText`.
- Note, not counted here: on a photo menu (no typed text, engine.js:578 has nothing to check against) a dish name such as "Dal fry with a
  side of mahi tikka" tagged [onion_garlic] is offered to a vegetarian. That is a held-out name with a tag list that leaves the food out,
  which the design accepts; it shows that on photos the name fields are model text.

**4. S1, S2: the closed check reads every grain word as plain grain, but the grain list holds whole dishes that carry ghee, nuts, dairy or
onion by their usual recipe (engine-run, 13 grain-word cases, 10 shown; 6 prose-word cases, 2 shown). This is the previous B4 class at the new chokepoint.**
In `closedText` (core.js:581) any word matching `GRAIN_RX` (`GRAINT`, core.js:112) passes once the plate declares grain (and wheat, unless
the word is in `NOTWHEAT`, core.js:565). `GRAINT` holds pongal, puliyogare, bisibelebath, handvo, biryani, kozhukattai, pizza and granola.
The engine's own text says to tag by what a dish is cooked with ("dal tadka cooked in ghee with garlic is dairy and onion_garlic",
`containsText`); these words skip that.
- Vegan: for_you "Have some pongal on the side, 100 g" (ven pongal is cooked in ghee, with cashews), "Have a little bisibelebath on the
  side", "Have a small handvo on the side" (a curd batter), "Have a slice of pizza on the side" (cheese): shown.
- Nuts left out: "Have some puliyogare on the side, 100 g" (peanuts in the tempering), "Have a spoon of granola on top": shown.
- Jain: "Have a small biryani on the side" (fried onion): shown.
- `PROSEW` also holds "rendered" and "fat": a vegetarian sees "Cook the greens in a spoon of rendered fat" (rendered fat is meat fat;
  `TAGTEXT` puts meat fat under meat).
- These rest on each dish's usual recipe, which a cook can change; the rule's own reading of "fail closed" (B4, PLAINW) is to drop them.
- Smallest fix: in `closedText` accept a grain word only when it names a plain grain (rice, roti, the millets, oats and the like) or is a word
  of a name already checked on the plate; take "rendered" out of `PROSEW`.

**5. S1, S2: food the app writes as an example is shown to clients it breaks (driven, 4 profiles; read).** These are example and hint texts,
not offers, but S2 says a Jain client never sees potato, and the design says food the app writes follows the food rules too.
- The log sheet's placeholder "2 aloo paratha with curd" (src/v6/app.js:843) and its error line "For example: 2 aloo paratha with curd"
  (app.js:828): aloo for a Jain client, curd for vegan and dairy-free clients, paratha with wheat left out. Seen on the driven screen.
- The Rescue box placeholder "for example, chole bhature" (app.js:744): bhature with wheat left out; `APPDISHES` itself tags chole bhature
  onion_garlic, root_veg and dairy, so a Jain or vegan client should not see it either. Seen on the driven screen.
- The Builder label "Grains (roti, rice, millet)" (app.js:558) with wheat left out. Seen on the driven screen.
- The Rescue error "for example masala dosa, 1 plate" (app.js:610): `APPDISHES` tags masala dosa root_veg and onion_garlic (Jain).
- The menu grain step "Ask which roti or rice they have" (app.js:639) for a diabetic client with wheat left out (read; the engine's own move
  line switches to "the grain" in the same case).
- Smallest fix: use example text with no food in it, or pick each example from a tagged list filtered by `appFoodOK`.

## MAJOR

**M1. S9: nutrient words in `PROSEW` let a supplement through every prose field (engine-run, 20 cases, 14 shown).** `PROSEW`
(core.js:554) holds vitamin, b12, iron, calcium and drops; `supp()` (core.js:516) matches phrases such as "vitamin b12" and "iron drops"
only. Shown: for_you "Take your b12 drops after lunch", "Take a vitamin after the meal", "Take vitamin d with this lunch", "Take iron and
calcium after the meal", "Take calcium at night"; Rescue move "Take your b12 drops after the meal"; menu tip "Take a vitamin after the
meal."; menu ask "Ask for water to take your iron with"; read line "Take your iron after lunch today."; pairing tip "Take a vitamin";
one-tap changes "+ b12" with note "Take your b12 with this meal." and "+ calcium" with note "Take calcium after this meal.", offered as
taps. Smallest fix: take vitamin, b12, iron, calcium and drops out of `PROSEW`, or fail any prose with "take" next to a nutrient word.

**M2. S8: a bread count with no grams passes when the bread is not called a phulka (engine-run).** `HOUSEU` (core.js:715) holds katori,
phulka and fulka only. With wheat on the plate, for_you "Eat 2 chapatis and stop there" is shown. The owner's rule 9 in
`handoff-next-plate.md` (line 46) reads "grams and calories, not katori and fulka (amounts are grams and kcal; never household units)". Smallest fix: add the counted bread words (roti, chapati and their plurals) to `HOUSEU` when no grams follow.

## MINOR

- m1. S7: typed text the engine does not catch goes to the model, which must then set refer_reason: "I have gestational diabetes", "GDM",
  "I am nursing", "I am preg", "im pg", "umeed se hoon", "main maa banne wali hoon", "feeding my 2 month old", "I am 20 weeks", "baby due in
  march", "I conceived last month", "my obgyn said...", "I have polycystic kidneys", "kidney cyst", "albumin in my urine", "proteinuria",
  "microalbuminuria", "my KFT is high" (19 of 29). Gestational diabetes matters most in a diabetes app. refer_reason is still required on
  every reply to typed text and fails closed.
- m2. The menu move tap (app.js:709) runs neither `composedWhy` nor `dayMoved`. No counter-example: the engine offers at most one portion
  move, held to the usual size on medicines (engine.js:542), "I'll order this" runs `composedWhy`, and `render()` clears yesterday's menu.
  The invariants page says every tap on a menu order is checked; this one is not.
- m3. Coverage. The "B6 trick characters" test uses the same characters `norm()` removes, and the "B1 typed excuse" test uses the same
  negation words `NEGPRE` lists, so both draw their cases from the list they test. No case puts text after the side head or on a photo
  menu, puts a `GRAIN_RX` dish word in prose, or puts a nutrient word in prose ("B2 PROSEW: no listed food is prose" leaves out `SUPPW`).
  In test/ux/review.js `plate-random-combos` (on medicines, no body figures) the plate's lowest combination is 640 kcal against a usual 480,
  so its S6 plate clause cannot fail. S6 stays live in `plate-random-combos-3` (the seed profile is female, 47, 158 cm, 72 kg, mostly
  sitting, so the usual lunch is 680 kcal and the lowest combination is 640) and in the Rescue half.
- m4. S3 by S1's mention rule: the app's own line for high BP, "Cook with no added salt; skip pickle and papad." (app.js:444), counts as
  showing papad ("skip" negates "pickle" alone), and `crosses()` flags it. It is advice to avoid both. Fix: "No pickle, no papad."
- m5. `test/rules/check.js` replaces `closedText` with a looser check for its own suite (the comment says why). The rule checks therefore
  do not exercise the closed check; only test/safety/check.js does.

## COSMETIC

- c1. `docs/SAFETY-INVARIANTS.md` says `PROSEW` "holds no food". It holds oil, water, lemon, lime, masala, greens, salad, vegetables,
  beans, lentils, legumes, pulses and fruit, and the words in M1.
- c2. The previous `test/safety/AUDIT.md` (4f6d0e5) is replaced by this one.

## Probed

All engine probes on np-core from `hosted/v6/index.min.html`, through `plan(kind).check()`, with vocabulary I chose (regional names, Hindi
and English mixes, negations, Unicode format and letter tricks). 324 engine probes, 30 word-net runs on app strings, a day-boundary scan, and
12 driven runs.

Recheck of the previous audit (4f6d0e5), 111 engine probes and 5 driven runs, every case written in it:
- B1 (typed "no egg", "not chicken", "no paneer", "no onion no garlic", "no chicken"; the portion move, warning and breakdown): held.
- B2 and M1 (held-out names and supplements in untagged fields, 18 cases; 9 more supplement brands on for_you, Rescue move and menu tip):
  held. B3 (the three referral texts): the fixed SAFETY line each time.
- B4 (dish names with an empty list): held on plate items (11 names, vegan), and on swaps, one-tap changes, menu orders, Rescue sequence
  moves and leave entries for "Dal tadka" (vegan, Jain, dairy-free), "Sabudana khichdi" (Jain, nuts left out) and "Sabudana" (Jain): 30.
- B5: the dish taps carry tags and are filtered (a Jain client sees none of the eight; a vegan client sees only "Masala dosa with chutney").
- B6 with the old characters (zero-width space, soft hyphen, accents, full-width letters): held. Other characters pass (BLOCKER 1).
- B7 (driven): the untick that left 35 g of 100 g is refused; 65 g logged. The two reducing moves alone are refused.
- B8 (driven): on medicines with no body figures, the swap and two changes are refused at the second tap; 485 kcal logged, usual 480.
- B9 (driven, set directly and through the sheet's own inputs): the kept plates are gone after the body figures are typed.
- M2 (katori and phulka in a one-tap note, menu ask and tip, subtitle, for_you, pairing tip): held. M3: see the day scan below.
- M4: driven for the one-tap change after a faked 04:05 (the tap redraws for the new day and logs nothing); the swap, plate-list and menu-list
  handlers were read and each starts with `dayMoved()`. M5: the v5 skip prints a line and no longer counts as a passed check.
- m1 (19 phrasings and Bengali): all referred by code now. m2 (4 S5 wordings as Rescue moves with diabetes): dropped. m3 ("Eat about half
  the thali" on medicines): dropped. m5 (mixed-script menu): the note shows. m7 (gehun in a swap and in what the grain is made of): dropped.

New probes on this build:
- Rescue typed excuses: 29 typed phrasings (26 shown; 24 count, since "egg optional" is not a refusal and "Butter chicken (no butter, no
  cream)" names the dish), 8 engine-exempted pairs (7 shown), 8 swap moves that bring in a new food (0 shown).
- Intake: 15 characters in 2 prose fields, 48 invisible-separator cases, 6 other fields: 69 (53 shown); 5 plate items with a wrong tag
  (5 offered).
- Prose vocabulary: 13 supplement sentences (7 shown), 13 grain dish words (10 shown), 6 food-meaning prose words (2 shown); supplements on
  7 more fields (7 shown).
- Menu side tail: 8 (5 shown). Photo menu names: 4 (2 offered; see the note under BLOCKER 3). Units: 11 (1 counter-example). Typed
  referral: 29 new phrasings (19 sent to the model).
- Day: `dayOf` every 10 minutes through 2026 and 2027 (104,976 samples per zone), against local dates read with `Intl.DateTimeFormat`
  (independent of the engine's own rule), in Asia/Kolkata, America/New_York, Europe/London, America/Santiago, America/Havana, Asia/Beirut,
  Australia/Lord_Howe, Europe/Kyiv, Pacific/Chatham and America/Asuncion: 0 mismatches. The six New York times of the old M3, against
  hand-written days: all right. `daysBack` has no gaps.
- App-written strings: 6 strings x 5 profiles through `crosses()`.
- Driven, medicines combinations: "not sure" with body figures (usual 680; a 700 kcal plate, swap then two changes: refused at the first
  change, 685 logged); two reducing Rescue moves each fine alone on medicines (900 kcal dish, -200 and -100, usual 680: the second refused,
  700 logged); a kept 460 kcal plate after the medicines answer goes from no to yes in the sheet (usual 480: no "Show my last plates", nothing
  logged).
- Driven, other: the example texts under Jain, vegan, wheat-free and dairy-free profiles; the for_you and pairing-tip renders with
  screenshots for five separator characters and script g (BLOCKER 1).

## Not inspected

- The live model and the Railway service (not called, not touched). Menu, Rescue and log photos: only the engine path with an image flag
  was probed, never image content.
- `test/ux/review.js` was read but not run (it writes into the repo). `test/rules/check.js` was run and its diff read, not read in full.
- core.js 195-475 (the grain test) beyond what the probes called; S5 on plates, swaps and menu orders beyond the driven runs.
- S10 and S11 beyond reading `viewOf`, `askedFor`, `ansSig` and the tune check. The v5 screens (not a release target).
- `server.ts` was read: it returns only the checked output, except with `EVAL_CODE`, which also returns the raw reply.
