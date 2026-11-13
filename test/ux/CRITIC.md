VERDICT: FAIL
BUILD: 9378aec46d662357d42a74e7bbb23098409e2f4c3171bac034475519929dd30b

# Critic round 18 (branch claude/nice-hawking-307ljy, HEAD 0a11be5, diff read a9fa237..0a11be5)

## What I measured on this state
- `npm run drill`: passes. Every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations. No state was unreachable and no page error was reported.
- `npm run rules`: passes on all three pages.
- `npm run words`: passes with 42 exceptions. Neither allow file is in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- I rebuilt the three pages from the sources in my scratchpad. They are byte-identical to the committed pages. None of them has a lookbehind. The working tree is clean.
- I took the fingerprint above after all measuring. It matches the builder's.

## Round 17's seven findings, checked with my own probes
I re-ran my round 17 probes (r17p/) on this build. The columns are: this build, the round 17 build (394f6a6) and the round 16 build (fb89b5b).
- one-tap: 0 of 47 removals offered and 0 of 39 keeps held. Findings 1, 3 and 6 are fixed for every form I listed.
- menu:
  - 0 of 8 removal asks offered; 6 of 6 keep asks offered;
  - 5 of 5 keeping portions offered; 0 of 5 leaving portions refused wrongly;
  - 0 of 12 not-sold menus offered.
  Findings 1, 3, 5 and 7 are fixed as listed.
- names: 62 of 63 dish-first names count. Curd rice fried chillies is read the safe way and recorded as D7 in UX-CRITERIA.md, which I accept. 0 of 59 coatings count, and 0 of 20 rava/oats dishes are refused. End to end, 0 of 8 fried-rice/tawa plates are refused. Finding 2 is fixed.
- dal atta: "mixed/multi/five dal atta" is dal flour in names and in the declared material, and "dal atta" as a material is no longer a grain. Finding 4 is fixed in the declared material, which is the first check. Two name forms remain (finding 8).

Recorded live replies against the round 12 build: nothing moves.
- 408 of 495 meals and 225 of 313 base swaps count.
- 175 of 1,297 foods count; the same against the round 17 build.
- 65 of 2,005 one-tap notes are held, the same notes.
- Menus with diabetes: 87 orders, none empty, 9 dropped.

The builder's combinatorial set (test/rules/combos.js) is a real improvement. But its vocabulary is narrow, and the new rules are broad.
- The set never puts a gram figure for another food, "then eat", or "with the" next to a removal or a filling.
- Its coating grains are only pure grains and flours.
- It never puts a stand-in material after a grain dish.
- It never tests a ROTI heading.

Probing just past those edges, I found six new regressions. My probes and outputs are in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r18/: onetap.js, names.js and menu.js, each with its .out file, plus p17-*.out (round 17 probes on this build), live2.out, replay.out and cmpshots.out. Each probe compares this build, the round 17 build and the round 16 build. Every finding below also reproduces in hosted/v6/index.min.html and hosted/v5/index.min.html.

## Findings, most serious first

### 1. MINOR, regression in this diff (owner rule 3; A14; the word reader that backs up the declared grain figure). A one-tap note that takes the grain off is offered again when it names a gram figure for another food, or says "then eat/have".
- Surface: Plate, one-tap changes (the note). This is server-side and in all three pages, so it is the same at every width and scheme.
- Causes (src/v5/core.js):
  - (a) keepsAmount() (line 259) treats any "N g" in the note as a grain amount kept. It is used in the "<grain>: leave/skip it" path (line 304) and the goes/is-off path (line 340).
  - (b) OWNPART (line 257) now accepts "(keep|have|eat|take|reheat|serve) N g" with no grain after it, so "have 100 g paneer" counts as the person's own grain portion.
  - (c) Line 304 also keeps any note that contains "then (eat|have|reheat|serve)" anywhere.
- Evidence (r18/onetap.out, 200 g left declared):
  - 12 of 12 "amount elsewhere" removals are offered; the round 17 build held 7 and the round 16 build held 9. Among them:
    - "Rice: skip it tonight; have 100 g extra paneer."
    - "Rice: drop it; have 150 g dal instead."
    - "Roti: skip it; add 50 g paneer to the sabzi."
    - "Rice? Cut it out; add 100 g sprouts."
    - "The rice goes to the kids; eat 100 g more paneer."
    - "Biryani is off for tonight; 150 g raita and salad."
  - 5 of 6 "for the family/tomorrow" removals with a gram figure are offered, 4 of them only by this build:
    - "Pack the rice for tomorrow; have 100 g paneer."
    - "Rice for the kids; have 150 g of dal."
    - "Send the rice to the family; serve 200 g dal."
  - 4 of 4 "then eat" removals are offered, all held by both older builds:
    - "Rice: leave it tonight, then eat more dal."
    - "Roti: skip it, then have the sabzi with curd."
  - Menu asks (r18/menu.out): "Rice: leave it tonight, then have double salad" and "Rice: cut it out, then eat the paneer with salad" are offered; both older builds refused them. An ask with a gram figure is dropped by the engine, so that half does not reach the menu.
  - With an honest 0 g declared, all of these are held.
- Recorded notes: 35 of 1,090 distinct notes carry a gram figure, for example "Mix 100 g steamed beans into the plate and drop one phulka". None of them pairs one with a whole-grain removal yet.
- Why it matters: the model writes figures into notes ("add 50 g paneer"). When it also removes the grain but declares it kept, this reader is the only check left.
- Smallest correction:
  - An amount keeps the grain only when it is tied to the grain: "N g of <grain>", "<grain> ... N g" in the same clause, "keep/reheat/serve N g" with no other food word after the figure, or "N g is plenty/enough".
  - In OWNPART, require that no food word follows "have/eat/serve N g".
  - Drop the global "then eat/have" keep. Keep only "to cool/rest ..., then eat".

### 2. MINOR, regression in this diff (owner rule 3 true-grain side; A14; B6). A dosa or paratha portion written "with the potato filling" or "with the paneer stuffing" is refused, so the order is dropped with diabetes.
- Surface: Rescue, Read the menu, the order card with diabetes.
- Cause: the new filling read in removesGrain (src/v5/core.js:283) matches "(the|eat|just|only) (the)? <x> filling/stuffing" anywhere. The "the" in "with the potato filling" fires it.
- Evidence (r18/menu.out). All of these are refused here and offered by the round 17 build:
  - "Masala Dosa | 1 piece, with the potato filling, about 250 g"
  - "Aloo Paratha | 2 pieces, with the aloo stuffing, about 300 g"
  - "Paneer Paratha | 2 pieces with the paneer stuffing, about 300 g" (the round 16 build also offered this one)
  - "Aloo Paratha | 2 pieces, stuffed with the aloo filling, about 300 g"
  - For the cause: removesGrain("1 piece, with the potato filling, about 250 g") is true here and false in the round 17 build.
  - "1 piece, crisp, with potato filling" (no "the"), the builder's case, is still offered.
- Why it matters: masala dosa and stuffed paratha are among the most common orders. "With the potato filling" is plain English, and losing the order removes a fitting grain choice.
- Smallest correction: do not read the filling as what is eaten when "with" or "stuffed with" comes before it. Read it so only after "eat", "just", "only", or at the start of a part ("the potato filling", "eat the potato filling").

### 3. MINOR, regression in this diff (owner rule 3; A14 "a coating is not the grain"). A frying word before a coating made of a grain that is not a pure grain (cornflakes, poha, vermicelli, sevai) now counts as a grain dish.
- Cause: in known() (core.js:208), when the last grain word is not pure (pureLast is false), only "<dish> fried/crusted/coated <food>" is a coating. So in "Crispy cornflakes chicken" the food after cornflakes reads as its filling (line 215).
- Evidence (r18/names.out). Each of these counts here; both older builds refused it:
  - Crispy cornflakes chicken
  - Crunchy cornflakes prawns
  - Crispy poha fish
  - Crispy vermicelli prawns
  - Crispy sevai prawns
  - "Crispy noodle prawns" counts here and in the round 16 build.
  - End to end: "Crispy cornflakes chicken" with made_of "corn" is accepted as a diabetes plate here only.
- Why it matters: the plate shows a coating as its grain, while the grain the person needs is missing.
- Smallest correction:
  - Treat cornflakes, poha, vermicelli, sevai, semiya, bread crumbs and murmura as coating grains in pureLast.
  - Add the five names to STANDINS and these grains to the coatings in combos.js.

### 4. MINOR, regression in this diff (owner rule 3; A14 stand-ins). A stand-in named grain-first with its vegetable after it counts as the grain.
- Cause: line 215 drops every material that comes after the last grain dish ("hakka noodles paneer"). It also drops any material followed by masala, tikka, curry or a similar word. That empties the stand-in pair check.
- Evidence (r18/names.out, r18/menu.out). 10 of 10 count here; both older builds refused all of them:
  - "Noodles (Zucchini)", "Pasta (zucchini)", "Spaghetti (zucchini)", "Noodles - zucchini"
  - "Rice (Cauliflower)", "Rice - cauliflower", "Fried Rice (Cauliflower)"
  - "Cauliflower masala rice", "Zucchini masala noodles", "Broccoli tikka rice"
  - On a typed menu, "Rice (Cauliflower)" with made_of "rice" and "Noodles (Zucchini)" with made_of "wheat" are offered here only. With an honest material ("cauliflower"), the order is refused.
  - "Cauliflower rice" and "Zucchini noodles" are still refused.
- Why it matters: low-carb menus write stand-ins this way. If the declared material is wrong, the name is the only check left.
- Smallest correction:
  - Keep the "material after the dish" exception only for foods that cannot stand in for the grain (paneer, egg, chicken, fish, meat, dal, fry).
  - Never apply it to cauliflower, broccoli, zucchini, cabbage, konjac, lettuce or the other STAND materials.
  - Apply the "followed by masala/tikka" exception only to side words that follow the grain word, not to words before it.

### 5. MINOR, regression in this diff (owner rule 3 true-grain side; B6). A ROTI or ROTIS heading no longer names the items under it.
- Cause: engine.js:422 now names items only under a RICE heading.
- Evidence (r18/menu.out): "Dal Tadka | 1 bowl dal with 2 tandoori roti" is refused here and offered by the round 17 build, on these menus:
  - "ROTI\nTandoori 30\nButter 40\nMissi 45"
  - "ROTIS\nTandoori 30\nButter 40"
  - Also refused, as in all three builds: the same order under "BREADS\nTandoori 30\nButter 40". That fits the round 17 garlic-bread correction.
- Why it matters: with diabetes, a dhaba order with rotis is dropped.
- Smallest correction: let a ROTI/ROTIS/NAAN/PARATHA heading name its items, as RICE does. Leave the generic BREADS heading as it is now.

### 6. MINOR, regression in this diff, narrow (A14; B6). "You keep half" no longer reads as the person's own portion.
- Evidence (r18/onetap.out, 150 g declared): "Send half the rice to the family; you keep half." is held here; the round 17 build offered it.
- My round 17 correction asked to keep "you have/keep half" at the end of a clause; the change dropped it altogether.
- Smallest correction: accept "you (keep|have|eat) half" before "[.;,!]" or the end of the note.

### 7. MINOR, not new in this diff (owner rule 3; A14). I missed these in round 17; this diff keeps or widens them.
- "<grain>: leave it with <a person>" and "leave it on the side" are offered at 200 g declared, as in the round 17 build. The round 16 build held them.
  - "Roti: leave it with the kids; extra sabzi."
  - "Rice: leave it with your husband; double dal."
  - "Rice: leave it on the side; double dal."
  - The menu asks "Roti: leave it with the kids" and "Rice: leave it on the side" are also offered.
  - Cause: "with" and "on the side" are in the keep list at core.js:304.
- "The rice goes into the fridge overnight; double dal." and "Put the rice in the fridge overnight; double the dal tonight." are offered by all three builds. "Overnight" with no reheat is read as cooling.
- Keeps held by all three builds:
  - "Cut 50 g rice; add more dal."
  - "Leave 50 g rice for the family; eat 150 g."
  - "Drop the rice by 50 g; more dal."
- True grains refused by all three builds: "Vegetables tossed in quinoa", "Chickpeas tossed in quinoa", "Paneer tossed in millet", "Veggies tossed in brown rice".
- Smallest correction:
  - "with" keeps only before a food or dish ("with the dal"), not a person.
  - "Overnight" keeps only with reheat, cool or eat.
  - "cut/leave/drop N g <grain>" with a kept amount elsewhere is a reduction.
  - "tossed in <grain>" is the dish. Only fried, crusted, coated, dusted or crumbed in a grain is a coating.

### 8. COSMETIC. Remaining dal atta name forms and one changed coating read.
- "Tuvar dal atta roti" and "Mix dal atta roti" still count as grain names, because tuvar and mix are not in the attaNorm list. As declared materials, "tuvar dal atta" and "mix dal atta" are refused, so a plate passes only when the model declares wheat.
- "Vegetables fried in rice" is now refused; the round 17 build counted it. The name is rare.

## What holds (checked, not taken on the builder's word)
- All the measured gates above. The rebuild is byte-identical, and the fingerprint matches the builder's.
- The diff touches only:
  - src/v5/core.js and src/v6/engine.js;
  - test/rules/check.js, test/rules/combos.js and docs/ux/UX-CRITERIA.md;
  - the three built pages.
- What the diff leaves alone:
  - No screen code, CSS, film, post or allow file changed.
  - The removed lines that mention katori sit in rewritten word lists, and katori is back in the new lines.
  - No removed line touches kidney, pregnancy, referral, supplements or the rise bands.
  - No banned word is in the added lines.
- Screens: I pixel-compared all 1,441 screens of this review with the round 12 review.
  - 1,320 are identical.
  - 63 are the plate-old-saved state, added in round 13.
  - 58 differ, and only 8 by more than 2,000 strongly changed pixels: plate-logged-2 and plate-skipped-meds-2 frames.
  - I viewed two side by side with a difference image: 360-light plate-skipped-meds-2 and 320-light plate-logged-2. The only difference is that a toast was caught in one frame and not the other. The plate, grains, labels and layout are the same.
  - I also viewed 320-dark plate-hero-2. The paper look holds, the plate and its grams lead, and nothing runs off.
  - The earlier visual judgement therefore carries over.

## Not inspected
- The owner's own phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields; no live run was made. I have not measured how often Gemini:
  - pairs a grain removal with a gram figure for another food or with "then eat";
  - writes "with the potato filling" in a portion;
  - names "Crispy cornflakes chicken" or "Rice (Cauliflower)";
  - types a ROTI heading over bare items.
- The v5 screens served by default were not rendered. Only their core was checked: it rebuilds byte-identical, and findings 1 to 4 reproduce in it.
- The audio by ear. The films are unchanged; loudness is from this round's check, and voice, music and chimes are from round 10's listening record.
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution. I relied on pixel comparison with round 12 and viewed the frames listed above.
- I did not run the builder's claim that the round 17 build fails 6 rule checks.
