VERDICT: FAIL
BUILD: 4906250fb1c5e1c1bd477b841581bdcb75dd6b7d7bdd23e31fbb1f0111701487

Safety audit of the whole engine and app logic against docs/SAFETY-INVARIANTS.md, on hosted/v6/index.min.html's np-core (the same core as hosted/v5/index.min.html, which the server loads by default). The fingerprint was taken before and after all probing and did not change.

Gate checks as found: npm run -s build ok; npm run -s safety ok on all three pages (0 counter-examples); npm run -s rules ok; npm run -s words ok. These pass, and the counter-examples below are all ones they do not include.

## Findings, most serious first

### BLOCKER 1. S1: foods the client left out still show
- Counter-examples (each was offered as a plate title, a plate item, a protein swap and a one-tap note; the dairy and wheat ones also as a menu order):
  - Dairy left out: Dal makhani, Desi ghi, Chhach, Panir tikka, Chenna poda, Mor kuzhambu, Moru curry, Kadi pakora, Mozzarella toast, Milkshake, Rasgulla, Sandesh, Kalakand, Peda, Gulab jamun, Phirni, Rabdi.
  - Wheat left out: Chole bhature, Bhatoora, Phulke, Kulche, Chapatti, Aloo parantha, Daliya, Sevaiyan, Godhumai dosa, Bati, Kesari bath, Sheer khurma, Momos, Veg chowmein, Maggi, Thukpa, Dabeli, Pizza, Burger, Veg sandwich, Kathi roll, Croissant.
  - Nuts left out: Moongfali chutney, Singdana chutney, Cashewnut curry, Kajoo, Badaam milk, Chikki, Verkadalai sundal.
  - Soya left out: Soya chaap, Chaap tikka, Bean curd, Soymilk.
- Menu path: with wheat left out, "Chole Bhature" with grain_made_of "refined flour" is offered (with "maida" it is dropped). "Dal Fry" with the side "2 Phulke" is offered.
- Where: src/v5/core.js:81 (DAIRYW), :83-85 (LEAVEW), and src/v5/core.js:499-501 (foodRx and crosses).
- Cause 1: the names are not in the lists.
- Cause 2: a listed stem with a suffix does not match. "makhani" does not match makhan, "cashewnut" does not match cashew, "pickled" does not match pickle, and "karimeen" does not match meen.
- Cause 3: Hindi plurals in -e ("phulke", "kulche", "bhature") are not read as plurals.
- Smallest fix: add the names to the lexicon first (the doc's rule), then to the lists, and add -e plurals and the stems above to foodRx. With wheat left out, also rule out any grain_made_of or made_of that names a flour with no non-wheat grain in it ("refined flour", "flour").

### BLOCKER 2. S2: diet is not absolute for regional names
- Counter-examples, offered on every plate path; Machli Fry and Rogan Josh also as menu orders:
  - Vegetarian, meat and fish: Machli fry, Amritsari macchi, Jhinga masala, Kolambi fry, Chemmeen curry, Karimeen pollichathu, Ayala fry, Mathi curry, Paplet fry, Bhetki paturi, Kosha mangsho, Laal maas, Kodi kura, Haleem, Rogan josh, Galouti kebab, Shami kebab, Vindaloo, Sorpotel, Eral thokku, Royyala vepudu, Nandu masala.
  - Vegetarian, egg: Mutta curry, Motte palya, Guddu pulusu, Dimer dalna, Omlet, Anday.
  - Jain: Alu posto, Alur dom, Shalgam sabzi, Turnip curry, Chukandar raita, Colocasia fry, Kamal kakdi, Lotus stem, Tapioca, Kappa curry, Vengayam, Ulli theeyal, Poondu kuzhambu, Inji curry, Lasan chutney, Scallions, Mullangi sambar, Urulai roast. "Alu Posto" is also offered as a menu order.
  - Vegan: Dal makhani, Chhach, Desi ghi, Mor kuzhambu, Milkshake.
- Where: src/v5/core.js:79 (NONVEG), :80 (EGGW), :82 (JAINW).
- Smallest fix: as BLOCKER 1. JAINW also needs turnip, shalgam, chukandar, colocasia, taro, arbi's regional names, lotus stem, tapioca, cassava and the regional words for onion, garlic, ginger and potato.

### BLOCKER 3. S3: salty sides with high BP
- Counter-examples (plates, and "1 Pappad" as a menu side; "Some avakaya on the side" as a menu ask): Pickled onions, Avakaya, Mango oorugai, Lime thokku, Pappadam, Pappad, Happala, Vadam, Khichiya, Chivda, Sev, Bombay mix, Mixture, Wafers, Kurkure.
- Where: src/v5/core.js:87 (SALTY), and the suffix gap in :499.
- Smallest fix: add the names, and "pickled".

### BLOCKER 4. S4: sweets offered as food with diabetes
- Counter-examples (plates, and "Rice and Rasagola" as a menu order): Burfi, Ladu, Halva, Kulfi, Falooda, Rabdi, Ras malai, Rasagola, Roshogolla, Jilebi, Imarti, Mysore pak, Soan papdi, Petha, Ghevar, Balushahi, Puran poli, Sakkarai pongal, Mango lassi, Gulabjamun, Phirni, Pedha, Mishti doi, Custard, Pudding, Brownie.
- Where: src/v5/core.js:86 (SWEETS).
- Smallest fix: add the names.

### BLOCKER 5. S7: typed disclosures go to the model
- Not referred on all four free-text paths (ask, menu, Rescue, log):
  - "I am breast feeding" (with a space) and "I breastfeed my baby".
  - "lactation diet", "im pregnent", "I am pragnant", "I am in my second trimester" and "I am expecting, 6 months".
  - "I am on haemodialysis" and "hemodialysis twice a week": \bdialysis does not match inside the longer word.
  - "I am a kidney patient", "my kidneys are weak", "low kidney function", "diabetic nephropathy" and "nephrotic syndrome".
  - "eGFR is 40", "renal patient", "gurde ki bimari hai", "kidney ki problem hai" and "one kidney removed".
- 92 of 108 path checks were not referred. Ticked conditions held in all 60 combinations I tried.
- The model may still refer some of these, but the menu and Rescue prompts do not ask it to refer pregnancy or a kidney condition.
- Where: src/v6/engine.js:589 (REFERTXT).
- Smallest fix:
  - Widen the pattern to breast[\s-]*feed\w*, lactat\w*, the common misspellings of pregnant, trimester, expecting, (?:haemo|hemo)?dialysis, kidney patient, weak or failing kidneys, kidney function, nephro\w*, egfr and gurd[ae].
  - Add each phrase above to lexicon.json referText first.
  - Ask the owner or a clinician to confirm the list.

### BLOCKER 6. S5: Rescue moves that take the grain off with diabetes
- Diabetes, typed "Rajma chawal", dinner. Each move below was kept as a Rescue move (kind portion, carbs -55 of 100):
  - "Give the rice to your family and eat the rajma"
  - "Let the kids have the chawal"
  - "Stop after the rajma and salad"
  - "Rajma and salad tonight"
- One-tap notes behave the same way. With grain_grams_after 40, the note "Eat the dal with a spoon, roti for tomorrow." is kept, and the grams still show 40 g of roti.
- Where: src/v5/core.js:599 (dropsGrain in checkRescue), and removesGrain.
- Smallest fix: drop a Rescue move with diabetes when its deltaCarbs takes away more than half the dish's carbs. That is the test keepsGrain already applies to one-tap changes (src/v5/core.js:484).

### BLOCKER 7. S1/S2: a Rescue move can add a left-out food the person typed
- Dairy left out, typed "Rajma chawal with curd". The move "Add an extra 100 g of curd" with kind "portion" is shown.
- Portion moves have the person's own words removed before the check, so an added food the person named passes. The precondition is that the model labels an added food as a portion move.
- Where: src/v5/core.js:607 (ownWordsOut for kind portion).
- Smallest fix: do not remove the person's words when the move title adds food (add, extra, more, another, second) or its deltaKcal is above 0.

### MAJOR 1. S9: supplements pass, and S9 has no test
- Not caught by supp(), so they pass checkMeal, one-tap notes and Rescue moves: spirulina, Protinex, Ensure, Horlicks, Bournvita, ashwagandha, cod liver oil, biotin, vitamin D drops, iron pills, a vitamin C pill, a sachet of ORS, Glucon-D, triphala, giloy, shilajit, "a scoop of plant protein", Metamucil.
- No file under test/ checks supplements. test/safety/check.js:66 says S9 is covered by test/rules/check.js, but that file has no supplement case.
- Where: src/v5/core.js:89 (SUPPW).
- Smallest fix: add the names, plus pill, pills, drops, sachet and "vitamin <letter>". Then add an S9 block to test/safety/check.js drawn from a list kept apart from SUPPW.

### MAJOR 2. S10: the plate on screen does not match its grams and figures (src/v6/app.js:141-143, viewOf)
- (a) A base swap replaces the first item of group "carbs", not the declared grain. Plate: sweet potato chaat (carbs), bajra roti (the grain), dal. Tapping "Jowar roti" gives "with jowar roti in place of sweet potato chaat", and the bajra roti stays. S10 says a grain change applies only to the grain.
- (b) A base swap on a plate whose grain item is not group "carbs" (for example "Bajra khichdi", group "other") changes the figures (560 to 520 kcal) while the items and title stay the same. apply() runs before the item is found.
- (c) Two one-tap changes that both change the grain can be on together. Nothing turns one off when the other is ticked (src/v6/app.js:380). The grams show only the first change (bajra roti 45 g), while the figures add both (carbs 84 to 37, under half of the plate's carbs).
- Smallest fix: swap the item that matches m.grain.food, and apply the deltas only when an item was replaced. Make one-tap changes that carry grainAfter exclusive of each other, as they already are of a grain swap.

### MAJOR 3. S8: a menu portion with no grams
- With no profile limits, a menu order shows the portion "1 bowl", and "2 phulkas and 1 bowl dal", with no grams.
- Where: src/v6/engine.js:560. It clears only katori and kcal words. Rescue uses houseUnit() (src/v5/core.js:597).
- The rules check tests Rescue only.
- Smallest fix: use houseUnit() on the menu portion, and add the case to test/rules/check.js.

### MAJOR 4. S12: Rescue, menu and log answers survive midnight (from reading the code; not run in a browser)
- refresh() (src/v6/app.js:60) resets STORE, APP and the plate taps at the day change, but not UI.rres, UI.mres, UI.lres, UI.rmoves or UI.mmoves.
- A menu read at 23:30 for dinner is still shown after midnight with yesterday's target and fit. "I'll order this" then logs it into today's dinner.
- askedFor() (src/v6/app.js:107) has no day in it. A plate reply in flight across midnight, arriving after a render, is stored as today's dinner plates.
- The midnight review state covers the plate card only.
- Smallest fix: clear those fields in the day-change branch of refresh(), and add DAY to askedFor().

### MAJOR 5. The S1-S4 word tests cannot find a new name
- All 188 lexicon words sit verbatim in the engine's lists. They were copied in the same commit that made the lexicon (91d12b8), so the S1-S4 word checks can fail only if a word is later removed.
- On that lexicon the engine has 0 misses. On my own 538 word checks it missed about 250. The rule "add to the lexicon first, then the engine" keeps the two in step by design, so a pass says nothing about names outside them.
- Where: test/safety/check.js:16-23, test/safety/lexicon.json.
- Smallest fix: keep a second list the builder does not read, held by the owner or a coach. Run it in the safety check, and report its misses without copying them into the engine automatically.

### MINOR 1. S6: plates and one-tap changes under the usual size on medicine are not dropped
- The S6 target held in all 6,912 of my combinations of goal, medicine answer, BP, age, BMI, earlier meals, skipped meals and appetite.
- Still, with diabetes and insulin or tablets, a 260 kcal lunch plate (usual size 660 kcal) is offered, and its one-tap change takes it lower. The menu path drops such an order (src/v6/engine.js:565); the plate path does not (checkReply6).
- S6 as written names the target, so this is a gap, not a counter-example. The owner decides whether S6 also covers the plate shown.

### MINOR 2. S11: the tune reply has no changed-answers guard
- src/v6/app.js:128. No counter-example was found: a change to the food rules clears STORE.res, so the reply lands on a plate no longer shown.
- The log sheet has a guard (src/v6/app.js:777) but no review state.

### MINOR 3. Fields shown without the food check
- Rescue breakdown and warning (src/v5/core.js:609) and the plate's cuisine line are not passed through crosses().
- I did not confirm where each is shown, so no counter-example is claimed.

## Probed
Scratch scripts are in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/audit/, run on the built np-core. The two minified pages carry the same core.
- 538 word checks with my own vocabulary across 9 food categories and the profiles that rule each out (veg, Jain, egg, vegan, the four leave-outs, BP, diabetes, diabetes with BP).
- 588 whole-plate checks: title, item, protein swap and one-tap note; 576 offered a food that should not show.
- 13 menu orders (dish, side, ask, grain_made_of, portion) and 6 Rescue sets of moves.
- 108 typed-disclosure checks over 4 paths, and 60 ticked-condition combinations over 5 kinds.
- 30 supplement names, sorted into supplements and foods; the foods (chia seeds, sattu, whey, amla or flaxseed powder, protein bar) are not counted as findings.
- 3 plate-view cases for S10, run through the app's own viewOf.
- 6,912 S6 day plans, 6 S6 prompt targets and 1 plate on medicine.
- 25 Rescue moves and 8 one-tap notes for S5.
- 15 negation cases: "no oil and ghee" and similar all hold.
- 188 lexicon words checked against the engine lists.
- Read: src/v5/core.js (lists, checks, prompts, plan), src/v6/engine.js (all), src/v6/params.js, the src/v6/app.js parts that show, combine and log (state, requests, viewOf, toggles, logging, day change, referral display), src/v5/server.ts, test/safety/check.js, and the S5, S8 and S9 parts of test/rules/check.js and test/ux/review.js.

## Not inspected
- test/ux/review.js was not run: no browser review states were played, so S10-S12 on screen rest on code reading and the viewOf probe.
- src/v5/app.js, the v5 screens the server serves by default (PAGE_PATH hosted/v5/index.min.html), was not read for S10-S12.
- No live Gemini call. No menu or Rescue photo. The eval/ recorded replies were not replayed.
- The figures in src/v6/params.js were not checked line by line against handoff-next-plate.md. No finding above rests on a clinical figure.
- The grain test machinery (isGrain, removesGrain, soldItems) was probed only through the S5 cases above, not read in full.
- Server limits and the access code.
- The unminified hosted/v6/index.html core was not probed separately; the safety check passes on it.
