VERDICT: FAIL
BUILD: 7ca8e91e43305547ae049b9334d85c6ad7e8f03b404791a0844376dbdec64ded

Safety audit of 9dd1b13 (branch claude/nice-hawking-307ljy), 17 Nov 2026, after fix-r12 (recorded-reply checks, plant products named one by
one, the carve-out grid, one measure list, the S7 spellings of the audit of 530a503). Whole tree, two tiers, judged against
docs/SAFETY-INVARIANTS.md and the owner's decisions recorded there (Two tiers; D1 Fix found, then watch; Watch list for count words; Refer,
as now; D3; D4 Model is backup; 17 Nov Remove menu reading). The menu code is dormant: its reachability was checked and nothing inside it
was graded. The builder's summary and counts were not taken on trust. The live model, the live site and Railway were not called. No
repository file was changed but this one.

Checks run on this tree. `npm run -s build`: the three pages are byte-identical to the committed ones. `npm run -s safety` (three pages,
recorded.js on three pages, 35 Codex probes): pass, exit 0; it prints the TRACKED carve-out cells "Coconut rice cakes", "Orange and lemon
juice" and "Carrot and amla juice" as shown. `npm run -s rules`: pass. `npm run -s words`: pass. `node eval/usefulness/bars.js`: four
bars meet (plates 67 of 75; 2 requests with no plate; reason line 67 of 67; swaps and one-tap 259). `node eval/atrisk/replay.js .`: 204
live, 187 now (contents 10, diabetes-grain 3, meds-low 16; 8 menu calls left out), as on 530a503. From a scratch copy (they write into
eval/usefulness), with read-only `git show` on the repository: names-diff against 1c58b89 has 4 changes and its file is identical to the
committed one (against its default, ba4d8dc, 28); the referral grid (1,187 cells) and the grain grid (236 cells) have 0 changes against
1c58b89 and are identical to the committed files. `test/ux/review.js` was not run (the UX Critic's scope). The fingerprint was
7ca8e91e...ec64ded at the start, after the build and after all probing.

How findings were reached: "engine-run" = a model-shaped reply or typed text through `plan(kind)` and `.check()` in Node on np-core taken
from hosted/v6/index.min.html, the code the server runs; "mutation" = one change in a scratch copy of the sources, rebuilt with
build6.js, then test/safety/check.js, test/safety/recorded.js (min page) and test/safety/codex.js.

1 BLOCKER (two carve-outs of one shape), 0 MAJOR, 3 MINOR, 3 COSMETIC, a BACKLOG, owner questions.

## BLOCKER

**B1. S4 (tier 1: a tag left off a name whose listed word the engine itself erases). The lemon and lime juice carve-out takes the listed
sweet word "juice" off after any word but "sweet", so a fruit juice named with lemon, lime, nimbu or amla passes the word net for a
diabetic client: "Watermelon lime juice", "Pineapple lemon juice", "Mint lime juice", "Ginger lemon juice". The rice cake carve-out has the same
shape ("Mango rice cakes").**
- Where: `crosses()`, src/v5/core.js:565: `.replace(/(\b[a-z]+\s+)?\b(lemon|lime|nimbu|amla)\s+juice\b/g, ...)` returns the text without
  "juice" unless the word before is "sweet". "juice" is the first entry of `SWEETS` (core.js:99), and the diabetes prompt itself says
  "No sweets, juice, sugar, honey or jaggery" (core.js, `rulesText`).
- Engine-run, diabetes, tags ["plain"] (the sweet tag left off): shown as a plate item, as a protein swap and as a one-tap change's added
  item ("Add 200 g mint lime juice. About 60 kcal more."), at lunch and at snack; through `plan('tune')` for a vegan, diabetic, high-BP client
  who leaves out nuts and soya, the swap "Pineapple lemon juice" and the change "Watermelon lime juice" both come back offered.
  "Pineapple juice", "Orange juice", "Mosambi juice" and "Sweet lime juice" are dropped, as they should be.
- Why tier 1: none of the five tier-2 shapes. The word is on the list; the miss comes from the engine's own reading, as in the last
  audit's B1 ("Brown rice curd rice" losing "curd"). D1 covers an unlisted spelling, plural or word; "juice" is listed. No owner decision
  on these cells was found (searched handoff-next-plate.md and docs/SAFETY-INVARIANTS.md for "juice" and "carve"); the watch label on
  "Orange and lemon juice" and "Carrot and amla juice" is the coordinator's, and those two share a shape with a recorded dressing
  ("grated carrots and lemon juice"). The frame found here does not.
- Live occurrence: none. Searched all 6,418 distinct model names under eval/ (keys food, name, add_item, as_written, title, subtitle,
  string items): no juice drink is recorded at all; the words that come before lemon, lime, nimbu or amla juice are only the start of the
  name (18), "with" (18), "fresh" (10), "and" (6), "teaspoon" (3), "tablespoon" (1) and "tangy" (1). No food word comes before it in any
  recorded name. It needs two model slips together: a juice offered against the prompt's own rule, and the sweet tag left off. That is the
  case the second net is there for, and the last audit graded the same shape as a BLOCKER.
- The tests cannot see it: the juice frames in the carve-out grid (test/safety/check.js:119) are "X Y", "fresh X Y", "salad with X Y",
  "cucumber and X Y" and "sweet X Y". The other carve-out grids put a word that ends another dish before the carve-out ("dal X Y", "jeera
  X Y"). The juice grid does not. The lexicon's sweet lists (known.sweet, addedFromReports.sweet) do not hold "juice", so recorded.js's
  replay cannot flag a juice either.
- The same shape in the rice cake carve-out (`notFood`, core.js:563): "rice cake(s)" becomes "rice rounds", so the listed sweet word
  "cake" goes, unless "sweet" or "sweetened" comes before. Engine-run, diabetes, tags ["plain"]: "Mango rice cakes", "Banana rice cake",
  "Date rice cakes" and "Caramel rice cakes" are shown ("Rice cake dessert" is dropped by "dessert"). Recorded: one name holds a rice cake,
  with "steamed" before it. The grid's rice cake frames are "X Y", "idli X Y", "steamed X Y", "brown X Y", "sweet X Y" and "jaggery X Y";
  none puts a fruit before it. "Coconut rice cakes" stays the coordinator's watched cell.
- Smallest fix: take "juice" off only when nothing, a joining word (`PLANTJOIN`) or "fresh" or "tangy" comes before (and the measure words
  the old records carry). Engine-run with that rule in place of the current one (not built): 0 of the 6,418 recorded names change their
  reading for a diabetic client; the four names above are dropped; "Lemon juice", "Fresh lime juice", "Cucumber with lemon juice" and
  "Amla juice" stay shown. Add a juice frame with a food word before ("watermelon X Y", "mint X Y", "ginger X Y", "pineapple X Y"),
  expected dropped, and put "juice" in the lexicon's sweet list. For rice cakes the same: read "rice rounds" only when nothing, a joining
  word, or "idli", "steamed", "brown" or "puffed" comes before, with fruit frames in the grid, expected dropped for a diabetic client.

## MAJOR

None found.

## MINOR

- m1. S4's word-level test reads 34 sweet words (lexicon known.sweet and addedFromReports.sweet); "sugar", "honey", "juice", "syrup" and
  "dessert" are not among them. Mutation: "honey" taken out of `SWEETS`, and separately "sugar": check.js, recorded.js and codex.js all
  pass. ("juice", "jaggery" plus "gur", and "cake" plus "chocolate" taken out are caught, only through the carve-out grid.) No counter-
  example on this build ("Honey lemon water", "Fresh lime juice with sugar" are dropped, engine-run). Fix: add the engine's other sweet
  words to the lexicon's sweet list, so the forms test and the recorded replay read them.
- m2. S8: for a measure word outside the lexicon's floor (`known.measure`), the detector in test/safety/measure.js reads the engine's own
  `MEASW`, so it cannot see that word dropped. Mutation: `glassfuls?` taken out of `MEASW`: every check passes, and on that build "2
  glassfuls buttermilk" shows "Glassfuls buttermilk" with the detector reading nothing. Of 38 forms of `MEASW`'s words tried against the
  floor, 30 are not in it: bowlfuls, cupful, cupfuls, kaps, glassful, glassfuls, platefuls, tbsps, tsps, tablespoonful, tablespoonfuls,
  teaspoonful, teaspoonfuls, ladleful, ladlefuls, mugful, mugfuls, tumblerful, tumblerfuls, pinches, chammachs, chammuch, kgs, kilograms,
  litres, liters, ltrs, fistfuls, helpings, spoonfuls. ("teaspoons?" taken out is caught by four checks and the recorded scan.) Fix: put
  every form of `MEASW` in the floor.
- Why m1 and m2 are MINOR and not "a test that cannot fail" (MAJOR): each test does fail on the words it holds (the mutations of
  "teaspoons?", "juice", "jaggery", "cake" are caught), and on this build no counter-example was found for the words it lacks. They are
  gaps in what the tests read. A later round that finds one of these words shown with its count or tag left off would have no test that
  could have caught it.
- m3. The gate: test/ux/manifest.sh hashes test/safety/check.js and lexicon.json, but not test/safety/recorded.js, measure.js, codex.js,
  controls.js, controls.json or audit-names.json, nor the eval/ JSON records recorded.js replays. A change to any of them would leave the
  fingerprint, and a verdict bound to it, unchanged. Fix: list them in manifest.sh.

## COSMETIC

- c1. Stubs and leftovers in shown names (engine-run): "Half dozen almonds" shows "Half almonds"; "Chammach bhar ghee" "Bhar ghee"; "Egg
  whites of 3 eggs" "Egg whites of eggs". None recorded.
- c2. S13's wording and the code differ: the invariant says the kcal shown is within 15 % of 4 x protein + 4 x carbs + 9 x fats;
  `figsAgree` (core.js:784) measures the gap against the kcal shown. Engine-run: a plate whose kcal is 1.17 times the macro sum is shown,
  one at 0.86 times is dropped (the band is 13 % below to about 17.6 % above the sum). Which reading is meant is a record item for the
  owner; no clinical figure is judged here.
- c3. This file replaces the audit of 530a503. Deploy note, not a finding: src/v5/server.ts's header still describes menu photos
  (`PHOTOS`, "a menu photo when given"); its image branch is unreachable, as every kind refuses a photo first.

## The eight form words in the S8 detector

The design choice (bowl, plate, cup, slice, piece, glass, mug, gram flagged only where they measure: before "of", opening the name, after
a joining word, an article or a size) is sound. Every recorded name that ends in one of them after a food word is a dish or its form
("Rice Plate", "khichdi bowl", "Rajma and Phulka Plate", "chaat bowl"; 14 found in eval/), and the item's grams are shown beside it. The
engine takes the same words off where they measure ("Bowl dal", "Small bowl curd", "Bowl of dal" show "Dal"). The one reading to watch is a
drink before glass, cup or mug ("Buttermilk glass", "Chai cup" are shown as written); none is recorded.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a model tag left off, or a wrong tag, on a name the word lists do not know, or a spelling the code does not list, with no
recorded occurrence of the slip. Searched: the 6,418 recorded names against word lists of my own for each rule (5,825 checks), and grep
over eval/ for each word below.
- Head of the list, recorded names the lists do not know (each tagged honestly where tags were recorded): egg "Dim Sheddo", "Dim Sheddho",
  "Dim Shorshe", "Dim poshto egg curry" (tagged ["egg","onion_garlic"]), "Dim Dalna" beside the watched "Dim Kosha"; wheat "wrap" in
  recorded titles ("Paneer Tikka Wrap", "Egg Bhurji Wrap with Mint Dahi", "Egg and Sprouted Moong Salad Wrap", "Soya Bhurji Wrap"). D1:
  found, so to be fixed and tested; tier 2 until a wrong tag is seen.
- Sweet and dairy names with a "plain" tag, diabetes: "Banana milkshake", "Milkshake", "Strawberry milkshake", "Banana shake", "Date
  shake", "Mango smoothie", "Thandai", "Rose milk", "Badam milk", "Sweet pongal", "Gud wali roti", "Shakkarpara", "Puran poli", "Dates and
  nuts" (milkshake is a listed dairy word but not a listed sweet). None recorded.
- Other names of my own with a "plain" tag under the profile that bars each (180 tried, 24 shown, the juices in B1 among them): vegan
  "Pongal with ney", "Moru kachiyathu", "Sambharam", "Mattha", "Doodhi halwa"; wheat "Godhi huggi", "Multigrain bajra roti"; nuts
  "Nilakadalai sundal", "Kadalai chutney" (kadalai is also chickpea); high BP "Namak para", "Khakhra", "Vadagam", "Uppu kandam", "Gundruk".
- The millet bread carve-out: "Ragi bread", "Millet bread", "Jowar toast", "Ragi noodles", "Millet pasta" read as wheat-free; shop-bought
  versions often hold wheat flour. None recorded. A question for the owner, as the carve-out is a design decision (15 Nov).
- S8 measures that open a name: "Bowlful dal", "Plateful rice", "Glassful buttermilk", "Cupful milk", "Scoop dal", "Serving dal",
  "Portion rice", "Pcs paneer", "Pieces chicken", "Ladle sambar", "Karchi dal", "Mutthi chana", "Kilo chicken", "Litre buttermilk", "Ml
  milk" are shown as written: these words are in `MEASW` but not in `MEASOPEN`. The detector flags each. None recorded (recorded.js's
  scan passes, and grep found none). "Chamcha ghee", "Thoda ghee", "Dollop of curd", "Teaspoonful ghee" use words the lists do not hold.
- S9, last two audits' supplement list, still open: shown as a plate item with a "plain" tag: "Whey", "Whey shake", "Protein bar",
  "Complan", "Electral", "ORS", "Becosules", "Shelcal", "Zincovit", "Multivitamins" (the plural; "multivitamin" is listed), "Biotin",
  "Folic acid", "Pediasure", "Boost drink", "Ensure", "Ensure milk", "Soy protein isolate", "Tang", "Sattu shake" (22 of 38 tried);
  Rescue helps a typed "Ensure" and "Complan". None occurs as a food name in eval/.
- S7 spellings and phrasings that go to the model: "sine me dard", "chest is paining", "left arm pain", "gasping", "feeling shaky and
  sweaty" (also with medicines ticked: the urgent net reads the typed text, not the profile), "confused after glimepiride", "shaky after
  gliclazide", "confused after metformin", "dizzy and confused", "chakkar aa rahe hain". None recorded. Last audit's watch items stand.
- Negation and meaning (tier 2 by the Tiers section): "Bread and butter beans" reads "butter beans" as the bean for a vegan client;
  "Dudhi no halwa" (Gujarati "no") stays from the last audit.

## Owner questions (named, not graded)

- Lemon and lime juice as a drink: the carve-out grid asserts "Lime juice" and "Fresh lime juice" shown to a diabetic client with tags
  stripped, as the dressing use is recorded (10 "Fresh lemon juice"); a fresh lime juice ordered as a drink is often sweetened.
- From the brief: urgent-symptom scope (above, and "my sugar is 40", "sugar 50", "glucose 55" go to the model); carbohydrate floors;
  potassium; transplant; postpartum ("I delivered last week" goes to the model); the grain floor's source; S6's upper limit; the rise band's
  source; the millet bread reading above.

## Last audit's findings, checked again on this build

| Last audit (530a503) | Result on 9dd1b13 |
|---|---|
| B1 "rice curd" read as a plant curd | Closed. `PLANTW` names the products; "Brown rice curd rice", "Rice curd", "Rice yogurt bowl", "Cashew butter masala" are dropped for vegan and no-dairy clients, "Coconut milk curry", "Soy curd rice", "Oats in rice milk" shown (engine-run, and the committed grid). Mutation (the old wide rule put back in front): caught by check.js (598 and 18 counter-examples) and recorded.js (4). |
| M1 digit measures inside names | Closed. "Dal with 1 teaspoon ghee" shows "Dal with ghee", "Poha with 2 tablespoons peanuts" "Poha with peanuts"; names-diff shows the two recorded names cleaned. Mutation ("teaspoons?" out of MEASW): caught. Partly blind for words outside the lexicon floor (m2). |
| m1 short grain name, change to 0 g | Closed narrowly as recorded in S10. Mutation (the new line removed): caught (4 counter-examples). The broader rule stays the coordinator's recorded decision, not graded again. |
| c1 stubs | "Khichdi with of ghee", "Dal with of rice" and "To idlis" closed; new small stubs in c1. |
| Backlog head (Dim Kosha, Tilapia, Mor kuzhambu, chena, Ricotta) | Held out by design and watched; more Dim names found (BACKLOG). |
| S7 spellings ("28 wks along", "bf'ing", "momtobe", "sugar bahut low hai", "kıdney") | Each refers on meals, Rescue and log. Mutations: the dotless-i fold removed (6 counter-examples) and the apostrophe form of "bf'ing" removed (3): both caught. |

## Probed

- Menu path (dormant): `KINDS` is ["meals","rescue","log","tune"]; `plan()` gives `{error}` and nothing else for 18 kinds ("menu", "Menu",
  "MENU", " menu", "menu ", "menus", "meals/", "", "constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", null, undefined, 0,
  ["menu"], {}) by 6 bodies (a typed menu, a menu text field, a kidney profile, typed pregnancy, empty, null): 108 calls. The minified page
  posts only to /api/log, /api/meals, /api/rescue and /api/tune; src/v5/server.ts routes POST /api/<kind> only when `KINDS` holds the kind
  and answers 404 otherwise; the only caller of `menuMoves` is inside `checkMenu`, which has no caller.
- Last audit's stubs, engine-run: "Khichdi with 1 tsp of ghee" shows "Khichdi with ghee", "Dal with 2 cups of rice" "Dal with rice",
  "Three to four idlis" "Idlis".
- S1-S4, tags stripped: 180 names of my own (regional dairy, wheat, nut, soya, meat, fish, egg, Jain, sweet and salty names, plant and
  millet frames, negations) under the profile that bars each: 24 shown (B1 and BACKLOG). Juice: 11 names ("Pineapple juice", "Orange juice", "Mosambi juice", "Sweet lime juice" dropped), item, swap and one-tap add, at
  lunch and snack, and through tune for a combined profile (B1). 6,418 recorded names against my own lists (5,825 checks): no recorded name
  with a listed word the engine misses, beyond the watched and held-out names; new unlisted names in BACKLOG.
- S6, the plate check: on medicines (usual lunch 680 kcal), a plate at 670 kcal is dropped ("meds-low"), at 680 and 720 shown; a
  protein swap and a one-tap change that each take a 720 kcal plate to 640 are not offered; the meals prompt states "at least 680 kcal,
  never below, and up to 10 percent above". Rescue at 1.3, 1.8 and 2.5 times the usual size: the portion move, when offered, leaves 820
  and 850 kcal and keeps more than half the carbohydrate.
- S5: a diabetic lunch plate with no grain, with a grain "made of" besan, and with a 20 g grain item: each dropped ("diabetes-grain"),
  each shown at snack (the control); a base swap to "Cauliflower rice", a one-tap change to 30 g of a 90 g grain and a change whose note
  says "skip the roti": none offered.
- S13: plates at 0.84, 0.86, 0.87, 1.15, 1.17, 1.18 and 1.2 times the macro sum (c3).
- S5, S6 targets: 576 `planDay` cases (medicines yes, not sure and no; four bodies including none; four meals; 0, 1,500, 3,500 and 6,000 kcal
  eaten; appetite 1, 3, 10): no target under the usual size; the prompt was checked for "at least" in each case and for the figure at lunch (above). The app's `composedWhy`
  checks S5 and S6 on the composed state; read, not executed.
- S7, the five spellings fix-r12 added ("I'm 28 wks", "28 wks along", "bf'ing", "momtobe", "sugar bahut low hai") and the dotless
  "kıdney": each refers on meals, Rescue and log. Kidney and pregnancy profiles refer on meals, Rescue, log and tune.
- S7: 99 refer phrasings of my own (English, Hinglish, misspellings) times meals, Rescue and log: 95 refer; 26 food controls: one false
  hit ("renal is my surname", the conservative side). 35 urgent phrasings: misses in BACKLOG. Model replies with refer_reason missing,
  "", "None", null, "none " (with a space), pregnancy, kidney and other_urgent on meals, Rescue and log (24 replies): each is a referral.
  Ticked conditions: the app derives health with kidney and pregnancy first (`CONDS`), and `plan()` refers both before any prompt.
- S8: 134 count and measure forms through `showName` (digits, ranges, fractions, x-counts, English and Hindi numbers, brackets, sizes);
  46 opening and ending measure forms with the detector run on each (BACKLOG, c1).
- S9: 38 supplement names on a plate with a "plain" tag (22 shown, BACKLOG); 6 typed Rescue supplements (4 not helped, 2 helped).
- S10: the m1 line by mutation. S12: `dayOf` puts 23:59, 00:00, 00:30 and 03:59:59 on the evening's day and 04:00 on the next; `buildFile`
  at 03:30 counts a dinner logged at 01:00 (1,100 kcal) and at 04:05 starts an empty day.
- Rice cakes: 8 names, and the words before "rice cake(s)" in the 6,418 recorded names (B1).
- Mutations, 13 (scratch copy, rebuilt, removed at the end): juice "sweet" guard removed (caught); dotless-i fold removed (caught); "bf'ing"
  apostrophe removed (caught); `riceTail` removed from the millet flatbread rule (caught, 70); old wide PLANT put back (caught); the m1 line
  removed (caught); `glassfuls?` out of MEASW (not caught, m2); `teaspoons?` out of MEASW (caught); "juice" out of SWEETS (caught by the
  grid); "honey" out (not caught, m1); "sugar" out (not caught, m1); "jaggery" and "gur" out (caught by the grid); "cake" and "chocolate"
  out (caught by the grid).
- Read: `plan` (v6), `carriesPhoto`, `referTyped`, `REFERKIDW`, `REFEROTHER`, `URGENTTXT`, `urgentTyped`, `medsUsual`, `norm`, `readProfile`,
  `crosses`, `badWords`, `PLANTW`, `plantOut`, `riceTail`, `milletOut`, `notFood`, `NEG`, `checkReply`, `checkReply6`, `checkMeal`,
  `checkTune`, `checkLog`, `checkRescue`, `rescueMoves`, `pruneMoves`, `planDay`, `buildFile`, `dayOf`, `showName` and the count expressions
  (`MEASW`, `MEASOPEN`, `MEASEND`, `DIGALL`, `CNTWORD`, `CNTQTY`); test/safety/measure.js; the carve-out grid in check.js; src/v5/server.ts;
  app.js `composedWhy`, `act`, `refresh`, `dayMoved`, `pruneKept`, `makePlates`, `tune`, `askedFor`, `ansSig`, the profile load and `CONDS`.
- Figures: src/v6/params.js against handoff-next-plate.md ("Targets engine"): activity 1.3 / 1.4 / 1.55 / 1.725, deficits 300 and 500
  within 30 %, floors 1200 f / 1500 m, protein 1.0 / 1.2 / 1.4 g per kg with caps 1.6 and 1.5, fibre 15 (diabetes 20) per 1000 kcal and the
  split 27 / 40 / 5 / 28 agree. The meal floor 0.6 and catch-up 1.25 are marked engine rules; the handoff gives no figure. The v5
  `dayTargets`, `ACTF` and `SPLIT` are used only by the v5 `plan`, which the v6 `plan` replaces. No clinical figure is judged.

## Not inspected

- The live model, the Railway service and the server's security items.
- The screens: test/ux/review.js was not run (the UX Critic's scope). S10, S11, S12 and S14 rest on reading app.js and on `safety`; no
  mutation was run on src/v6/app.js.
- The v5 screens; src/v6/plate.js; the Builder beyond the safety check's 320,640 states; the grain identification code in core.js
  (lines 140-500) beyond the checks.
