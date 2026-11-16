VERDICT: FAIL
BUILD: 88d93f0f1ca6770ad235fbd21ad06772232a05fa02ca2b89b2d04c610ff03781

Final safety audit of 6b5e18d (branch claude/nice-hawking-307ljy), 16 Nov 2026. Scope: tier 1 on the whole tree, about 2 hours of probing
(docs/review/usefulness-brief.md, section 3.5). Judged on the np-core script inside `hosted/v6/index.min.html` and on `src/v6/app.js`.
The builder's summary and test counts were not used. The live model was not called.

Checks run. The build was run in a scratch copy of the build inputs (running it in the frozen tree was refused by the session's permission
check). The three pages it writes are byte-identical to the committed ones. `npm run -s safety` (with the 41 Codex probes), `rules` and
`words`: all pass. The fingerprint was 88d93f0f...3781 at the start and is the same after all probing.

How each finding was reached: "engine-run" = a model reply through `plan(kind).check()` in Node on np-core from the built page;
"app-run" = the app's own `viewOf`, `swapAt`, `composedWhy` and `plateWhy`, taken from `src/v6/app.js` and run in Node on the engine's
output; "mutation" = one line changed in a scratch copy, rebuilt, and `safety`, the Codex probes and `rules` run again; "read" = code
reading only. Nothing was driven in a browser (see Not inspected).

0 BLOCKER, 3 MAJOR, 4 MINOR, 2 COSMETIC, 6 BACKLOG.

## MAJOR

**M1. S10 (tier 1, app logic): when the plate's declared grain item is also its first protein item, a protein swap and a grain swap
both replace that one item, and the plate logged is not the plate shown (app-run on engine output, 2 cases).**
`swapAt()` (src/v6/app.js:197) gives the same index for "protein" (the first protein item) and "base" (the declared grain item) when
they are the same item. `swapIn()` (app.js:187) then applies both swaps' figures to it, and the second replaces the first on the
plate. The engine blocks the protein swap on the grain item only with diabetes (src/v5/core.js:674); the one-tap handler
(app.js:429) undoes only a grain swap, not a protein swap.
- Vegetarian, no diabetes, lunch. Plate: Moong dal khichdi 300 g (group protein, declared grain, made of "rice and moong dal"),
  cucumber salad, roasted papad; 480 kcal, 18 g protein, 78 g carbs, 10 g fats. Tune: protein swap "Paneer bhurji" (-40 kcal, +6 g
  protein, -30 g carbs, +9 g fats), grain swap "Bajra khichdi" (+20 kcal, +2 g, +2 g, +1 g). Both accepted by the engine.
- Tap the paneer swap, then the bajra swap. Shown: 300 g Bajra khichdi, 120 g cucumber salad, 10 g roasted papad, title "...,
  with paneer bhurji in place of moong dal khichdi, bajra khichdi in place of paneer bhurji", 460 kcal, 26 g protein, 50 g carbs,
  20 g fats. That plate is 500 kcal, 20 g protein, 80 g carbs, 11 g fats. `plateWhy` passes it, so "I'll have this" logs it.
- Protein swap plus a grain-changing one-tap change: the note says "Moong dal khichdi goes to 200 g" though the khichdi is off the
  plate, and the figures carry the grain cut.
- How often: the grain item is the first protein item on 4 of 816 recorded plates (Mixed dal adai, Soya chunks and vegetable pulao,
  Toor dal and brown rice khichdi, Moong dal khichuri). No tune reply for such a plate was recorded.
- Smallest fix: in `checkMeal` drop protein swaps when the first protein item is the declared grain item, for every profile (the
  diabetes rule at core.js:674 without its diabetes condition). Add this plate to a review state.

**M2. S8 (tier 1: seen in recorded live replies): a count written as a word stays in a shown model name (engine-run).**
`showName()` (src/v5/core.js:555) takes off counts written in digits only.
- The recorded live plate "South Indian egg podimas with two whole eggs" (eval/atrisk/results-live-6febc1a.json,
  egg-nonut-s-breakfast), replayed on this build with honest tags, is offered. The count shows as the item name, in the title
  and in the subtitle. "Egg bhurji made with three whole eggs and onions" is in eval/v6/results-live4.json and
  eval/v5/results-live-look.json.
- As plate items (engine-run): "Two phulkas", "One bowl dal" and "Half plate rice" are offered as written, and the first and
  third are in the engine's title ("Moong dal with two phulkas"). Through `showName` alone, "Two jowar rotis", "Buttermilk one
  glass", "Single phulka" and "Pair of idlis" are also kept.
- The S8 test cannot see this: `COUNTW` in test/safety/check.js:322 needs a digit.
- How often: 2 of 6,210 names in eval/v6, eval/atrisk and eval/results-*.json, both under earlier prompts (a third copy is in
  eval/v5/results-live-look.json); none in the 72758ac window. Owner rule 9 in handoff-next-plate.md: "grams and calories, not
  katori and fulka".
- Smallest fix: in `showName` take off number words (one to twelve, half, single, double, a couple of, a pair of, a dozen) with the
  measure or piece word after them, as is done for digits. Add word counts to the S8 test.

**M3. S2 (test that cannot fail): the check that a menu request never takes out meat, fish or egg passes whatever the request may
remove (mutation).**
- Mutation: `REQREMOVE` (src/v6/engine.js:594) lets jain and no_dairy_fat take out meat, fish and egg, no_egg take out egg, meat
  and fish, and less_salt take out salty_side. `safety`, the Codex probes and `rules` all still pass.
- The cases at test/safety/check.js:451-453 name the food in plain words ("Chicken Tikka", "Egg Curry", "Fish Curry"), so the
  word net drops them first. Some also list a tag the request cannot remove.
- The seven cases there: "Chicken Tikka" [meat] with jain, "Egg Curry" [egg, onion_garlic] with no_egg, "Fish Curry" [fish] with
  no_dairy_fat, "Paneer Butter Masala" for a vegan, and two "Dal Fry" cases and a "Veg Pulao" case that do not touch meat, fish or egg.
- With the mutation built and every check still passing, a vegetarian is offered "Mughlai Paratha" [egg] with no_egg, "Laal Maas"
  [meat] with jain and "Bangude Masala" [fish] with no_dairy_fat, each with "Only if they can make it this way.". A high BP client
  is offered "Veg Thali" [salty_side] with less_salt. On this build all four are dropped (engine-run), so the behaviour is right
  today and only the test is weak.
- Smallest fix: draw these cases from names no word list holds (the lexicon's held-out names), with only the barred tag listed and
  that tag gone as served. Add a less_salt case that lists salty_side.

## MINOR

- m1. Engine-level S6 checks that no Node check covers (mutation):
  - Removing the swap floor (core.js:668, `!(low&&n.kcal+s.deltaKcal<low)`) or the Rescue portion floor (engine.js:573,
    `if(u&&sc.kcal<u)return`) passes `safety`, the Codex probes and `rules`.
  - So does removing the S5 or S6 clause in the app's `composedWhy` (app.js:79-83).
  - The app holds both floors at each tap and before logging, and the review states `plate-random-combos-*` and
    `rescue-two-moves-grain` exercise that. I could not run them (see Not inspected), so I cannot say those states fail on a
    regression.
- m2. The urgent line on the Rescue, menu and log referral cards is drawn by the app (app.js:675 orderView, :797 renderRescue0,
  :848 logOther). Only the
  plate ask has a review state for it (test/ux/review.js:375). Removing the line from the menu card passes every Node check
  (mutation). The engine's output for all four kinds is tested.
- m3. S7, typed disclosures the code net sends on to the model: "I just had a baby", "I delivered last month", "my potassium is high"
  and "low salt for kidney" (4 of 40 of my phrasings). The model must then set refer_reason, which fails closed if it is missing.
  Whether a recent birth with no word of breastfeeding is referred is a scope question for the owner.
- m4. Tier-1 app states I could check only by reading or by mutation: the kept-plate rule stamp, the day change, and stale Rescue,
  menu, log and tune replies. Each has a review state (`plate-rules-reload`, `plate-overnight-*`, `rescue-health-changed`,
  `menu-health-changed`, `sheet-log-day-changed`, `plate-tune-stale`). Mutating the code behind each one passes every Node check,
  so these properties rest on review.js alone.

## Owner or clinician decisions (named here, not graded)

- **Urgent symptoms scope.** 11 of my 25 urgent phrasings get no "get help now" line. They still go to the model, which can refer.
  - Readings: "my sugar is 55", "sugar 60 hai", "blood sugar 400", "sugar very high, 380". A sugar figure is excluded on purpose, and
    only a clinician can give one.
  - Signs: "chest is tight", "heart racing and sweating", "numbness in left arm", "severe headache and vomiting", "ghabrahat ho rahi
    hai", "blurred vision and shaky".
  - "I feel very weak and shaky", from a client whose own answers say insulin. The net looks for the medicine only in the typed
    words, not in the client's answers (engine.js:697).
  - A model referral with refer_reason "other_urgent" shows the referral line but not the get-help line (engine.js:706 adds it for
    the code net only).
  - Two changes need no figure: add the line for "other_urgent", and read the medicines answer as context.
- **Carbohydrate for clients on insulin or tablets.** `test/safety/codex.js` prints "a medicines plate with 1 g of carbohydrate: ok"
  as TRACKED. The plate passes S6 on energy. Any carbohydrate floor needs a figure from the owner or a clinician.

## COSMETIC

- c1. The plate's and the order card's "Planned around" chips (app.js heroCard, orderView) show every cited hook tag. That includes
  "lighter after earlier meals", "skipped breakfast", "less rajma this week" and "a late dinner" for a client with diabetes, which
  the engine's reason line leaves out (engine.js:289). The figures and the grain are still checked; this is a wording mismatch.
- c2. This file replaces the audit of 06d880f.

## BACKLOG (tier 2; does not fail the audit)

Searched: every `reply.raw` (and older `reply` bodies) in eval/v6/results-*.json, eval/atrisk/results-*.json and eval/results-*.json,
6,771 model names (food, as_written, with, add_item, name, title, subtitle), plus the 80 at-risk window replies and the 26 window
scenarios and menus replayed on this build. On replay, 254 plates and 40 menu orders are shown, and my own word list found no barred
food, no digit count, no figure disagreement, no plate without its grain with diabetes and no plate under the usual size on
medicines.

1. Word-list gaps: about 100 of my 377 regional and English food words are not in the engine's lists. Each needs the model to send a
   wrong but non-empty tag. Examples:
   - meat: liver, poultry, meatball, quail, rabbit, venison, seekh, shami, rogan, vindaloo, kori;
   - fish: tilapia, basa, rui, mathi, ayala, bangude, vanjaram, pabda, eral, karuvadu, shutki;
   - dairy: chenna, khova, mozzarella, cheddar, moru, neyyi, srikhand, rosogolla;
   - wheat: sandwich, frankie;
   - nuts: charoli, chilgoza, macadamia;
   - onion and garlic: vengayam, poondu, vellulli, chives;
   - root vegetables: arvi, ratalu;
   - sweet: gud, cheeni, shakkar, bellam;
   - salty sides: loncha, uppinakayi, happala.

   Seen in recorded replies: chenna 3 (vegetarian scenarios), sandwich 12 (menus, no wheat-free profile), rui 4 (non-vegetarian,
   tagged fish in the window), tilapia 2 (non-vegetarian), seekh 1 ("Veg Seekh Kabab"). None was mis-tagged in the tagged window.
2. A singular form of a listed word: "noodles" is listed, "noodle" is not. "Veg hakka noodle" tagged [plain] is offered to a
   wheat-free client (engine-run). "chip" and "wafer" are the same case for salty sides. No singular "noodle" is in the recorded
   replies. S1 names singular forms, so the owner may move this to tier 1. It is the cheapest gap to close: add "noodle".
3. A hyphen inside a word: "Chi-cken tikka" tagged [plain] is shown to a vegetarian (engine-run). The name shape allows a hyphen
   between letters. Not in the recorded replies. Nine other trick spellings in names (look-alike Latin and Cyrillic letters,
   invisible and tag characters, a no-break space, full-width letters, spaced letters) are all dropped, as is a plain control.
4. A count written as a word in a menu dish copied from the menu ("Two Tandoori Roti") is shown. Not in the recorded menus.
5. no_dairy_fat on a dish whose dairy is cream or curd in the gravy (a korma) rests on the model's tags as served. The window had one
   no_dairy_fat order (Pongal, ghee only).
6. Unknown regional names with a wrong but non-empty tag (Kori rotti, Payesh, Poondu rasam), TRACKED in test/safety/codex.js: unchanged.

## Probed

- Recorded live replies replayed on this build: 80 at-risk window calls (72 plate calls, 8 menus), and 25 of the 26 scenarios and
  menus from the 72758ac window (the log and Rescue replies were run but not scanned). 254 plates and 40 orders were shown and
  scanned with my own vocabulary for food, units, figures, S5 and S6. Counter-examples: 0. M2 comes from the older 6febc1a sample.
- Tag shapes: missing, empty, a string, an unknown tag, null, upper case, and plain with dairy. Each shape was tried on plate items,
  the plate tag list, swaps, one-tap changes, menu dishes, sides and leave entries, for a vegan client: 49 cases, 0 shown. Control
  with honest tags: 7 of 7 shown.
- Word net, with my own 377 words in 5 forms each (1,885 forms) under the profile that bars them: the gaps are listed in BACKLOG 1.
  The singular forms of every listed plural: 3 gaps (BACKLOG 2).
- Names: 10 trick spellings and 1 control on a plate item (1 shown, BACKLOG 3), 2 list gaps on a plate item, 23 count and unit
  names through `showName`, 3 of them as plate items, and 10 menu sides and 5 menu dishes with units.
- S5: 25 doubtful grain names on a diabetic plate. 4 were kept, all true grains (kuttu puri, puffed rice chivda, ragi malt, and brown
  rice with a bracket that is not shown).
- S6 grid: medicines yes or not sure, 3 goals, 2 sexes, with and without body figures, 4 meals, 4 appetite levels, 5 amounts eaten
  earlier, with breakfast had or skipped. That is 3,840 requests; I checked the prompt's floor and that a plate 10 kcal under the usual
  size is dropped and one 10 kcal over is kept: 0 failures.
- S7: 40 typed disclosures (5 sent to the model, one of them PCOD, which is not a referral) and 25 urgent phrasings on the menu path
  (11 without the get-help line).
- S10: 2 app-run combinations (M1). Menu requests: 2 held-out dishes. Menu sides: 10.
- Mutations: 33 in the engine and 14 in the app, 47 in all.
  - Engine survivors (7): no_egg taking out egg, and the requests taking out meat, fish, egg and salty sides (M3); the swap and Rescue
    portion floors (m1); and 3 that change nothing a client sees (the Rescue half-carbs check, which a scale of 0.5 or more never
    trips; the Rescue move pruning, since scaled moves keep the dish's figures in step; and the `ratioOK` bounds, which `rebalance`
    already keeps).
  - App survivors: 10 of 14. Only the act() wrapper, the menu move wrapper and the Builder bounds are caught; the composed-figures
    check is caught by the Codex probes. The rest are left to review.js (m4).

## Not inspected

- test/ux/review.js was read, not run: it needs playwright, which is not installed here. S10 to S12 on screen, the kept-plate stamp,
  the urgent line on screen and the medicines combinations on screen are judged by reading and by Node runs of the app's own
  functions, not in a browser.
- The live model, the Railway service and the server security items (brute force, XFF, CSP). `server.ts` was read: it returns only
  the checked output, except with EVAL_CODE.
- Photos (menu, Rescue, log): only the engine path with an image flag was read.
- `plate-random-combos` (on medicines, no body figures) still cannot go under the usual size: the lowest plate it can log is about
  540 kcal against a usual 480 (by reading its fixture). S6 stays live in `plate-random-combos-3` (usual 680) and in the Rescue half,
  as the last audit found.
- The grain parser (core.js 195-475) beyond the 25 samples. The day boundary beyond reading `dayOf`, `refresh` and `dayMoved` (the
  last audit scanned 10 time zones over two years). The v5 screens.
