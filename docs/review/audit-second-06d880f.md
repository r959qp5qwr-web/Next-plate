VERDICT: FAIL
BUILD: 27f30373dd9bb12a4c688e3fe1383743c88863d4c1c425af727da8e12eb910d7

Second, independent safety audit of Next Plate at commit 06d880f. The fingerprint was taken before and after probing and did not change. Nothing in the repo was written.

Checks as found: `npm run -s safety`, `rules` and `words` all pass. `npm run -s build` was not run in the repo, because it writes into the frozen tree. A copy of the tree was built in scratch space instead: its `hosted/v6/index.min.html` and `hosted/v6/index.html` are byte-for-byte the committed ones, so the page probed is the page the sources build.

Every counter-example below was produced on np-core from `hosted/v6/index.min.html` (`plan(kind, body)`, then `check(reply)`), or on the page itself in headless Chromium with the model's reply scripted. Scripts are in the same folder as this file (`p2.js` to `p14.js`, `b1.js` to `b6.js`).

How likely each one is, is stated with it. Three kinds:
- **plain**: an ordinary sentence a model could write with correct tags and figures;
- **uneven**: a reply whose words and figures disagree;
- **hostile**: look-alike letters, spaced letters, or an empty tag list on a food that needs tags.

## Findings

### BLOCKER 1. S5: a sentence that tells a client with diabetes to leave the grain is shown in eleven fields that have no grain check (plain)

- Profile: diabetes (with or without medicines), lunch or dinner.
- Reply: a correct plate (dal, 150 g rice, cabbage, rice declared as the grain) with `for_you: "Skip the rice tonight"`.
- Shown on the page under "Why this plate, today": "Skip the rice tonight" (`b2.js`, screenshot `A-foryou.png`).
- The same sentence is shown as: plate title, subtitle, cuisine line, pairing tip (pair and effect), read line, menu tip, "leave for another day" reason, and the Rescue dish's portion, warning and breakdown. On Rescue the client reads "Chicken biryani. Skip the rice tonight" (`B-rescue.png`).
- Also shown: "Leave out the rice", "Have this without the rice", "No rice with this meal", "Swap the rice for more cabbage", "Eat the dal and cabbage, skip the rice".
- Why: `closedText` (`src/v5/core.js:575`) checks which foods a sentence names, not what it tells the client to do with the grain. `removesGrain` runs only on one-tap changes, Rescue move titles and the menu portion and ask.
- Lines: `src/v5/core.js:653` (title, subtitle), `:664` (pairing tip), `:687` (cuisine), `:702` (read), `:749-750` (Rescue warning, breakdown, portion); `src/v6/engine.js:293` (for_you), `:609` (menu tip), `:610` (leave reason).
- Smallest fix: with diabetes, outside the snack, run the same grain test (`removesGrain`, `STAND`, `SPOTW`, `SOUPW`) on every model sentence inside `closedText`, and blank the field when it fails.

### BLOCKER 2. S5: the grain wording test itself lets common phrasings through, on the fields that do have it (uneven)

- Rescue, diabetes, typed "chicken biryani", dish carbs 90 g. Move `{title: "Eat all but the rice", deltaCarbs: -30}` is offered. On the page it was ticked and "I had this" logged the dish at 60 g carbs with no refusal (`b6.js`).
- 57 of 159 of my Rescue move titles were offered (`p4.js`). Among them: "Eat around the rice", "Rice for later", "Share all the rice", "Let the rice be", "The rice can sit this one out", "Eat the chicken and leave what is under it", "Keep 5 g of rice", "Eat 10 g of the rice", "Eat the dal first, stop there".
- One-tap change with `grain_grams_after: 150` and note "Eat all but the rice": offered, and shown on the plate card of a client on medicines (`b1.js`). 12 of 66 notes passed (`p3.js`).
- Menu portion and ask: "Eat all but the rice", "Rice for later", "Eat around the rice", "Leave most of the rice" are shown (`p5.js`).
- The carbs figure is the other guard, and it holds only when the model's figure matches its words. A move that says "all but the rice" with 30 g fewer carbs passes.
- Lines: `src/v5/core.js:374` (`removesGrain`), `:726-727` (`dropsGrain`), `:683` (one-tap).
- Smallest fix: stop listing ways to say it. With diabetes, a model sentence that names the grain (or says "stop there", "only", "all but") is shown only when it matches a short list of allowed forms ("keep the rice", "eat the rice last", "half the rice" with grams). Anything else is blanked.

### BLOCKER 3. S6: a sentence that tells a client on insulin or sugar tablets to eat half, or to skip a meal, is shown (plain)

- Profile: diabetes, medicines "yes".
- Shown in for_you, read line, pairing tip, menu portion, ask and tip, Rescue portion, warning, breakdown, and as a Rescue move with zero deltas: "Skip dinner tonight", "Eat half of this plate", "Have only half", "Leave half on the plate", "Skip breakfast tomorrow", "Wait until tomorrow to eat", "Take a walk in place of this meal" (11 of 12 tried, `p8.js`).
- On the page the Rescue card showed "Eat half and keep the rest for tomorrow" to this client (`b2.js`).
- The figures are guarded well (see Probed: 552 plate cases and 384 day plans, none under the usual size). The words are not: every word in these sentences is on `PROSEW`.
- Lines: `src/v5/core.js:554-563` (`PROSEW` holds skip, leave, half, only, stop, wait), `:575`; `:741` (a Rescue move is tested on its figure only).
- Reading note: S6 is written about the target and about what is offered. Counting a sentence that tells the client to eat half as an offer under the usual size is my reading. If the owner reads S6 as figures only, this is a MINOR.
- Smallest fix: when `p.medsUsual` is set, `closedText` blanks a sentence that has skip, leave, half, only, stop, wait, less or "in place of" beside a meal or plate word.

### BLOCKER 4. S1 to S4: after the client changes diet in My food, a plate kept under the old diet can be shown (app logic, no model fault needed)

- Steps, run in Chromium (`b4.js`, screenshot `B4-dinner.png`):
  1. Non-veg client at 1 pm. Lunch plates load. Tap Dinner: a chicken plate loads. Tap Lunch.
  2. Tap "New plates". While it waits, open My food and tap Vegetarian. Do not tap Done.
  3. The stale reply is thrown away and plates are asked for again with the new diet (S11 holds). That second reply is saved, and the save writes the new diet to the phone with the old plates still in the store.
  4. The page reloads, or the phone closes the tab, before Done.
  5. Tap Dinner. The header reads "My food: Vegetarian" and the card shows "Chicken curry with rice".
- The same steps with "Dairy" ticked under leave-outs in step 2 end with "Paneer with rice" on the dinner card under a "No dairy" chip (`b6.js`). By reading, a change to high BP or diabetes goes the same way for salty sides and sweets: `pruneKept` tests kept plates for S5 and S6 only.
- Lines: `src/v6/app.js:818` (the only place kept plates are cleared on a rule change is `closeSheet`), `:146` (`save()` while the sheet is open), `:29` (kept plates loaded with no check of the rules they were made for), `:61` (`pruneKept`).
- Smallest fix: store the `rules()` string with the kept plates. On load, and in `pruneKept`, drop every kept plate when it differs from the current `rules()`.

### BLOCKER 5. S1, S2, S3: letters set apart, and Latin look-alike letters, pass the closed check (hostile)

- Profile: vegetarian, dairy and wheat left out, high BP.
- Shown in read line, for_you, pairing tip, Rescue portion, warning, breakdown and moves (`p8.js`, 14 of 24):
  - "Add c-h-i-c-k-e-n pieces", "Add c h i c k e n", "Add p.a.n.e.e.r", "Add g-h-e-e on top", "Add e g g", "Add b-u-t-t-e-r", "Add r-o-t-i", "Add p a p a d";
  - "Add meɑt", "Add hɑm", "Add pɑpɑd on the side", "Add nɑan", "Add pɑneer cubes" (ɑ is U+0251, a Latin letter, so the script test passes it);
  - "Add eɡg" (ɡ is U+0261).
- Why: `words()` splits on anything outside a-z, and `PROSEW` accepts any single letter (`[a-z]`). "meɑt" becomes "me" and "t"; "c-h-i-c-k-e-n" becomes seven single letters. NFKC does not fold U+0251 or U+0261.
- Full-width letters, zero-width spaces and accents are handled: "ｐａｎｅｅｒ", "pa​neer", "panéer" were not shown.
- Lines: `src/v5/core.js:554` (`[a-z]`), `:160` (`words`), `:594` (`NONLATIN` allows all of Latin).
- Smallest fix: in `closedText`, fail a sentence that has any letter outside a-z after `norm`, and accept a single letter only for "a" and "I", "g" after a digit, and "s" or "t" after an apostrophe.

### BLOCKER 6. S4, S1, S2: an empty tag list is believed for names that are not plain (hostile: needs an empty list from the model)

- "Banana split" with `contains: []` is offered as a plate item to a client with diabetes, to a vegan client and to a client who left out dairy. So are "Lemon squash" and "Orange squash" (a sweet cordial) for diabetes (`p12.js`).
- Why: "split", "squash" and "slice" are on `PLAINW` as cooking and vegetable words, and the plain test reads word by word.
- Lines: `src/v5/core.js:545-551`.
- Smallest fix: take "split" and "squash" off `PLAINW` (keep "gourd" and "pumpkin"), or believe an empty list only for a name of one food word plus sizing words.

### MAJOR 1. S9: a supplement is suggested in words that name only the nutrient (plain)

- Any profile. Shown in read line, for_you, pairing tip, one-tap note, menu ask and tip, Rescue warning, breakdown and moves (12 of 12, `p2.js`):
  "Take calcium and vitamin D daily with this meal.", "Add calcium drops after lunch.", "Take iron with lemon water after the meal.", "B12 drops help here.", "Take your vitamin D in the morning.", "Take a daily vitamin", "Take iron and calcium daily", "Add vitamin C drops to water", "Take b12 daily", "Add protein to your water".
- On the page, under "Pair it": "Take calcium and vitamin D daily" (`b1.js`).
- The set-up asks "Want more of a nutrient?" (iron, B12, calcium and vitamin D), which makes such a sentence more likely for those clients.
- Why: iron, calcium, vitamin, b12, protein, drops, take, daily are all on `PROSEW`; `SUPPW` has "vitamin d3", "iron drops" and "vitamin drops" but not these forms.
- Lines: `src/v5/core.js:557` (nutrient words), `:562` (drops), `:94` (`SUPPW`), `:516`.
- Smallest fix: a sentence that has a nutrient word passes only when it also names a checked food from the same plate, order or dish, and has none of take, daily, drops, dose.
- Tests: `test/safety/check.js:217-226` tests S9 with supplement names and the tag only. No case sends a nutrient-only sentence.

### MAJOR 2. S8: household measures other than katori, fulka and bowl are shown as portions

- Any profile. Shown as a menu portion, a Rescue portion and a Rescue move (15 of 29, `p8.js`): "A fist of rice", "One handful of rice", "Two tablespoons of rice", "1 serving spoon of rice", "A palm of rice", "1 small pot", "1 tiffin", "1 plate", "Half a plate", "2 pieces", "2 slices". Also "1 bowl dal and 100 g rice" (the grams belong to the rice, the bowl has none).
- The log sheet (`p12.js`): the assumption line shows "2 fulke and a katora of dal", "2 rotis and one vati of dal", "A fist of rice and a ladleful of dal", "One plate of rice". The title shows "Dal 1 bowl with 2 fulka" and "2 katora dal". Only the spelling "katori" is caught.
- Lines: `src/v5/core.js:554-562` (fist, palm, handful, spoon, tablespoon, pot, tiffin on `PROSEW`), `:715-716` (`houseUnit`); `src/v6/engine.js:324-325` (log assumption and title).
- Reading note: S8 names katori, fulka and bowl. If the owner means only those three words, this drops to MINOR except for "fulke", "katora" and the bowl with another food's grams. The first line of S8 says units are grams and kcal.
- Smallest fix: take the hand and spoon measures off `PROSEW`, or require a gram figure in the same sentence part. Send the log assumption through `houseUnit` with katora, vati, fulke, rotis and ladleful added.

### MINOR

1. **S7, first net.** 36 of my 68 typed disclosures are not referred by code and reach the model (`p9.js`). Among them: "expecting our first baby in May", "expecting my second child", "carrying twins", "baby due in March", "feeding my baby, need more milk", "new mom, c-section last month", "maa banne wali hoon", "dudh pilati hu", "kidney kharab hai", "ek hi kidney hai", "kidny problem", "stage 3 kidney", "doctor said protect my kidneys", "low potassium diet"; and every disclosure in Telugu, Kannada, Malayalam, Gujarati, Gurmukhi and Urdu letters, plus Marathi "गरोदर" and "मूत्रपिंड". For these the referral rests on the model's refer_reason alone. A missing or misspelt refer_reason is a referral on all four kinds (44 cases, all held). `src/v6/engine.js:630-632`.
2. **S7, log sheet.** With refer_reason "none", the assumption line showed "You may be pregnant, so ask your doctor before papaya" and "With a kidney condition keep protein low". The line is not a referral card. `src/v6/engine.js:324`.
3. **S1 to S4 and S9, second net.** With the right tag, 0 of my 380 names were offered. With a wrong tag ("grain" only), 176 of 380 passed the word lists, for example "Rogan josh", "Meen moilee", "French toast", "Mor kuzhambu", "Pesto pasta", "Fryums", "Sweet lassi", "Chyawanprash". This is the design the owner chose. It means the names on screen are as safe as the model's tags, and no check in the repo measures how often the tags are right.
4. **S10.** After a swap the plate's subtitle still reads "Moong dal, rice" while the list and the title name masoor dal and jowar roti (`b5.js`). `src/v6/app.js:403`. The logged title and figures agreed in all three tap orders.
5. **Tests.** No case in `test/safety/check.js` puts a grain-removal, eat-half or nutrient-only sentence into for_you, read, pairing tip, title, menu tip or the Rescue dish fields. S5 is tested on Rescue moves only (`:151-156`), with the rest in `test/rules/check.js` on one-tap changes and menu orders.
6. **S12, wording.** Between midnight and 4 am the header shows the calendar date ("Tue, 17 Nov") while meals count toward Monday. The counting is right.

## Probed

On np-core (`hosted/v6/index.min.html`), my own vocabulary:
- S9 in sentences: 12 sentences in 9 fields. All 12 shown.
- S5 one-tap notes and suffixes: 66 phrasings, 2 fields. 12 phrasings shown.
- S5 Rescue moves: 159 titles over 3 dishes. 57 shown.
- S5 other fields: 25 phrasings in 7 fields, then 8 plain sentences in 12 fields. 7 of the 8 plain sentences shown in 9 or more fields.
- S6 sentences: 12 in 10 fields. 11 shown.
- S6 figures: 576 profile, meal, appetite and earlier-meal cases for plates, swaps and one-tap changes. 24 of them (snack, usual size 40 kcal) could not be tested, because no plate can be that small. In the other 552 the plate at the usual size was offered, the plate 10 kcal under it was not, and a swap or change taking it 30 kcal lower was not, while the same swap and change at zero were. 384 day plans: 0 targets under the usual size. 1 menu with moves on medicines: held.
- S8: 29 portions in 10 fields (15 shown); 17 log cases (3 of 4 titles and 9 of 10 assumption lines shown with a household measure, condition talk or advice).
- Unicode and spelling in sentences: 24 (14 shown).
- S4 in sentences: 11 (none shown apart from "End with fruit").
- S1 to S4, S9 names: 380 names in 10 groups, each with the right tag, no list, an empty list and a wrong tag (1,520 checks). Right tag: 0 offered. No list: 0. Empty list: 2. Wrong tag: 176. (The Jain group was run again on a plate with no onion or garlic, `p13.js`.)
- Empty list on plain-looking names: 15 (all 15 offered; "Baked beans" and "Coconut slice" are arguable, the three named above are not).
- S7: 75 typed strings on 4 kinds (300 calls); 44 refer_reason values; 10 ticked-condition calls (all referred, tune included).

On the page in headless Chromium, clock fixed, Asia/Kolkata:
- S6 and S5 taps: one-tap changes and swaps on a medicines plate, 5 taps. The two swaps that took the plate under 640 kcal were refused, and the logged figures matched the screen.
- Rescue ticks: 2 moves ticked on medicines; 1 move ticked and logged with diabetes.
- S10: 3 tap orders, 13 taps, title and logged figures agree.
- S12: `dayOf` at 6 times; plate tap, Rescue "I had this", log "Yes, count it" and "Skipped it" made at 04:05 on a screen drawn at 03:50 or 03:55 (none logged, all redrew); a plate logged at 01:30 counted toward the day before. All held.
- S11: one stale plates reply after a diet change was not shown and was asked for again.
- Kept plates across a rule change: 2 runs (diet, leave-outs), both counter-examples (BLOCKER 4).

## Not inspected

- Negations ("no ghee", "without", "minus", "-free") as their own probe set. `NEG` and `affirmed` were read, not fuzzed.
- Referral-style model text in the closed-check fields. It was run on the log sheet only.
- `test/safety/check.js` was searched, not read line by line, so whether each test can fail was not judged invariant by invariant.
- Replies in flight across 4 am. The day is part of `askedFor()` by reading; no run was made.

- The live model. Every reply was scripted, so how often Gemini writes these sentences or mis-tags a dish is not measured.
- `src/v5/server.ts` beyond reading `handle()`: limits, key check and photo size were not probed.
- Photo paths (menu photo, meal photo): no image was sent.
- `hosted/v5/index.min.html` and the unminified `hosted/v6/index.html`.
- The menu screen in the browser (grain question, order moves, "leave for another day"); menu checks were made on np-core only.
- `removesGrain` and `grainAsk` line by line; they were probed from outside.
- `test/rules/check.js` and `test/ux/review.js` were not read in full.
- `test/safety/AUDIT.md` and the first auditor's folders, as instructed.
- Clinical figures in `src/v6/params.js` against their sources. None was changed or invented here.
- Daylight-saving days and time zones other than Asia/Kolkata.
