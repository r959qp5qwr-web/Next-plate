VERDICT: FAIL
BUILD: 2909c1abe5cbeefcbad8c97e81640bf5e9f3b34b29b16258b13add318a69ad9c

Safety audit of eddb00b (branch claude/nice-hawking-307ljy), 16 Nov 2026, after the fix round 11ff288..fccd687. Whole tree, two tiers
(.claude/agents/safety-auditor.md), about 2 hours of probing. Judged on the np-core script inside `hosted/v6/index.min.html` and on
`src/v6/app.js`. The builder's summary, test counts and mutation table were not taken on trust. The live model was not called.

Checks run. The build was run in a scratch copy of HEAD (`git archive`); the three pages it writes are byte-identical to the committed
ones. `npm run -s safety` (with the 41 Codex probes) and `rules`: pass. `npm run -s words`: FAIL at HEAD, 3 hits, all in the committed
`test/ux/CRITIC.md` (c1). The fingerprint was 2909c1abe5cbeefcbad8c97e81640bf5e9f3b34b29b16258b13add318a69ad9c at the start and is the same after all probing.

How each finding was reached: "engine-run" = a model reply through `plan(kind).check()` in Node on np-core from the built page;
"app-run" = the app's own `viewOf`, `swapAt` and `plateWhy`, taken from `src/v6/app.js` and run in Node on the engine's output;
"mutation" = one line changed in a scratch copy, rebuilt, and `safety`, the Codex probes and `rules` run again; "read" = code reading.
Each counter-example was also run on 6b5e18d (the page and app.js of that commit) to say whether it is new.

1 BLOCKER, 3 MAJOR, 5 MINOR, 4 COSMETIC, 3 BACKLOG, and owner questions.

## BLOCKER

**B1. S7 (tier 1: a typed disclosure): a kidney disclosure is read as a dish when a meat word comes just before "kidney" or a dish
word just after it, so it goes to the model and a plate can be shown (engine-run). 7 of my phrasings that 6b5e18d referred are not
referred on this build, and 10 more with the word "kidney" are not referred on either build.**
- `KIDNEYDISH` (src/v6/engine.js:690) turns "<mutton|goat|lamb|chicken|bakra|beef|pork|meat> kidney" and "kidney <fry|fried|masala|
  curry|roast|gravy|...>" into "meat" anywhere in the typed text, before `REFERTXT` is read (`referTyped`, engine.js:691). When that is
  the only kidney word in the text, the disclosure is lost.
- Referred on 6b5e18d, not referred now, on all four text paths (ask, Rescue, menu, log):
  "Chicken kidney ke liye theek hai?", "mutton kidney ke liye bura hai kya", "no meat kidney patient", "I avoid red meat kidney stones",
  "chicken kidney stone patient hu", "pork kidney problem", "lamb kidney issue".
- Not referred on either build, though S7 now says any kidney word but "kidney bean(s)" is referred, "wherever it stands":
  - a meat word before: "Is chicken kidney friendly?", "is chicken kidney-friendly", "beef kidney safe for me?", "Is goat meat kidney
    friendly";
  - a dish word after: "low salt for kidney curry" (S7's own example with one word added), "for my kidney fried food ok?", "kidney fried
    food mana hai", "kidney masala kam rakho", "kidney roast is bad for me", "my kidney gravy diet".
- The chain to a shown plate: `plan('meals', {ctx: {text: 'Is chicken kidney friendly?'}})` builds a prompt that says "Answer that with
  the meals" (engine.js:216); a reply with refer_reason "none" and an honest plate is shown ("Moong dal with jowar roti"). Only the
  model's own refer_reason stands between the disclosure and a plate. The live model was not called, and no recorded reply holds a typed
  kidney mention (searched all 73 typed `text` fields under eval/: none).
- The dish exception is not an owner decision. The handoff records "A kidney condition or pregnancy typed in any box is referred like a
  tick (S7)" (handoff-next-plate.md:101); docs/SAFETY-INVARIANTS.md S7 names only "kidney bean(s)". The commit fccd687 says "Every
  referred phrasing still refers"; the 7 above do not.
- The tests cannot see it: `notReferText` in test/safety/lexicon.json requires "had mutton kidney for lunch" not to be referred, and no
  referral case has a meat word before "kidney".
- Any reading of "kidney" as a dish in free text can swallow a disclosure, whichever words it keys on. Smallest safe fix: take
  `KIDNEYDISH` out of `referTyped`, so every typed kidney word but "kidney bean(s)" refers again, as S7 and the handoff say (a typed menu
  that lists "Kidney fry" is then referred, a safe over-referral, as on 0c50e80). Whether a kidney dish may be read as food, and where
  (a whole menu line only, or nowhere), is the owner's decision. Add the 17 phrasings above to the held-out referral list.

## MAJOR

**M1. S8 (tier 1: an honest copy of a printed menu): on a menu a digit count inside a dish name now shows. 6b5e18d took every
digit off.**
- `MENUCOUNT` (src/v5/core.js:585) takes a number off only before a measure word it lists, or at the start or after "with", "and" or a
  comma before a piece word, and `MENUSHAPE` (core.js:609) now lets digits stay. A count after another word stays.
- With the typed menu, as_written copied from it, tags honest (engine-run; order and "leave" entry alike):
  - before a piece word the engine itself lists (`CNTPIECE`, core.js:564): "Egg Curry 2 Eggs", "Egg Bhurji 3 Eggs", "Omelette 3 Egg",
    "Veg Thali 3 Roti Dal Rice", "Mini Meals 4 Roti Rice Dal", "North Indian Thali - 4 Roti, Dal, Rice" (shows "North Indian Thali 4
    Roti"), "2 Idli 1 Vada" (shows "Idli 1 Vada"), "Idli 2 Vada 1 Combo", "Breakfast Combo Idli 2 Vada 1 Coffee", "Poori Sagu 3 Poori";
  - before a measure word it does not list: "Mutton Biryani 1 Kg", "Buttermilk 1 Ltr", "Biryani 1 Handi", "Veg Thali 2 Person",
    "Family Pack Biryani 4 Persons".
  - On 6b5e18d each of these showed with no digit.
- Judged against the owner's decision in the brief (16 Nov, "Remove counts, keep names": a number comes out when a count, measure or food
  word follows it) and S8's "no household count shows in a name". S8 also records a narrower sentence, the builder's wording: on a menu a
  number goes only before a measure word, or at the start or after "with", "and" or a comma before a piece word. The build follows that
  sentence; the two disagree on every case above, and the owner's sentence is the one this audit applies.
- How often: no recorded typed menu under eval/ has a number inside a line (searched every multi-line `text`), so no recorded reply shows
  it. A South Indian tiffin card ("Idli 2 Vada 1", "Parotta 2 Salna") prints this shape often.
- The S8 menu test (test/safety/check.js:377) has no count inside a name, so it cannot fail on this.
- Fix, direction only: a count inside a menu name must go, and kg, ltr, litre, handi and person(s) count as measure words. A rule
  keyed on the piece word alone would also take the number off honest names this build keeps ("Chicken 65 Dosa", "Gobi 65 Kebab",
  "Chicken 65 Momos", "Chicken 65 Pav" all show with 65 today, and dosa, kebab, momo and pav are piece words), so how to tell a count from
  a name number is for the builder to propose and the owner to settle. Until then, dropping a menu name that holds a digit before a piece
  or measure word fails closed. Add these lines to the S8 menu test.

**M2. S8 (tier 1): a count written as a word inside a short bracket is kept and shown, on every name path (engine-run). The same on
6b5e18d (missed by the last audit).**
- `showName` keeps a bracket of one to three words as a label (core.js:597, `kb`) and cleans counts only outside it.
- Shown as written, item, title and subtitle: "Dal (one bowl)", "Rice (half plate)", "Egg curry (two eggs)", "Idli (three pieces)",
  "Phulka (two nos)", "Boiled eggs (two whole)", "Moong chilla (two)". Only "katori" in a bracket is caught ("Rajma (one katori)" shows
  "Rajma").
- The same bracket is shown on a menu dish and a "leave" entry, on the declared grain and in the reason line ("The grain stays: about 90 g
  of jowar roti (two pieces)."), on a protein and a grain swap, and as the food a one-tap change adds, with its note.
- Also kept, outside a bracket: number words above twelve ("Fifteen almonds", "Twenty peanuts"), and number words of other Indian
  languages written in English letters ("Rendu idli", "Moonu dosa", "Don chapati", "Be rotli", "Duto ruti", "Dui ta luchi"). None of
  these is in the recorded names; none needs a reply built to break a filter, so they are tier 1 here.
- How often: one recorded name has a number word in a bracket, "Whole eggs (one whisked, one boiled)"; its comma means the bracket is
  taken off, so it shows "Whole eggs".
- The S8 word-count test (check.js:331-343) has no bracket case and no number above twelve. Letting a bracket hold "katori" (mutation
  N17) also passes every Node check.
- Smallest fix: do not keep a bracket that holds a number word or a measure or piece word (or clean the bracket with the same count
  rules); add thirteen to twenty to `CNTWORD`. Add bracket cases to `COUNTEDW`.

**M3. S10 (tier 1 by the letter, see the note): a grain swap can replace the wrong item, and the plate logged is then not the plate
the figures describe (app-run on engine output). The same on 6b5e18d.**
- `swapAt(m, "base")` (src/v6/app.js:205) takes the first item whose name contains, or is contained in, the declared grain's name
  (`sameFood`, core.js:492, a substring test). An earlier item whose name is a part of the grain item's name is taken first.
- Vegetarian, no diabetes, lunch. Items "Sambar" (protein, 150 g), "Sambar rice" (carbs, 250 g), "Cucumber salad"; grain food "Rice",
  made of rice. The engine declares "Sambar rice" as the grain. Tune adds a grain swap "Bajra khichdi" (+20 kcal).
- Tap the grain swap. Shown and logged: 250 g Bajra khichdi, 250 g Sambar rice, 100 g Cucumber salad, title "Sambar with sambar rice,
  with bajra khichdi in place of sambar". The figures are the plate with the rice swapped, not the sambar. `plateWhy` passes. The swap
  drawer lists the choice under "Grains and starch" as "Sambar (on your plate)".
- Same with "Dal" and "Dal khichdi" (grain "Khichdi"), "Curd" and "Curd rice", "Methi" and "Methi thepla".
- With diabetes the tune request for such a plate is refused (the re-check finds no grain), so no swap is offered: the case is for clients
  without diabetes.
- Tier note for the owner: it needs two things no recorded reply has. The prompt asks for grain.food "copied letter for letter from
  items" (engine.js:227), and all 1,170 recorded grain names are copied that way; and no recorded plate (0 of 452 shown) has an earlier
  item whose name is a part of the grain item's name. It is not a reply built to break a filter, so by the letter of the tiers it is tier 1.
- The S10 property test (check.js:566-595) cannot see it: it checks that the swapped-in food is on the plate and that the figures match
  the app's own view, not that the grain swap replaced the grain item.
- Smallest fix: in `swapAt` match the grain item by its exact name first (the engine sets `grain.food` to that item's own name), and in
  `declaredGrain` prefer an exact name match before a partial one.

## MINOR

- m1. S5 and S6 in the app (carried from the last audit's m1, part closed). Removing the S5 or the S6 clause of `composedWhy`
  (app.js:81-82, mutations A2 and A3) still passes `safety`, the Codex probes and `rules`. The engine's floors on swaps and Rescue moves
  are now caught (M9, M10 fail `safety`), and my own 64 S6 cases hold. The app clauses rest on the review states
  `plate-random-combos-*` and `rescue-two-moves-grain`, which I could not run.
- m2. S7 typed disclosures with no "kidney" word that the code net sends to the model, the same on both builds: "gurdon ki bimari",
  "gurdon mein pathri" (the plural form of gurda), "mere gurde theek nahi", "kidni problem", "kindey problem", "kidneyy pain", "kidnies
  weak". The model must set refer_reason; one missing fails closed.
- m3. App states that still rest on review.js alone (mutations that pass every Node check): the day change at a tap (A5), a stale
  Rescue reply (A7), `act()` skipping its check (A9), a stale tune reply (A10), and yesterday's answers kept past 4 am (A11). Each has a
  review state (`plate-overnight-*`, `rescue-health-changed`, `plate-tune-stale`). The kept-plate stamp (A6) and the store emptied on a
  rule change (A12) are now caught by `safety`, as the builder reported.
- m4. App text from this fix round rests on review.js alone (mutations that pass every Node check): a conditional order with the tick
  back (N10), the condition taken off the "Also on this menu" rows (N11), the log referral without the line to get help now (N12), the
  get-help line moved under the referral (N16), and the app's "Planned around" lines unfiltered (N13, last audit's c1). Each has a review
  state (`rescue-menu-*` with `order-cond`, `sheet-log-urgent`, `plate-ask-urgent`, `rescue-urgent`, `menu-urgent`), read, not run. The
  engine's own `hookSaid` rule (N14) is caught.
- m5. The menu name shape is a backstop no check exercises: letting a menu name open with a number (N7, `MENUSHAPE` at core.js:609)
  passes every Node check. With it, "2 Chole Bhature" would show (the count rule does not take that "2" off, as "bhature" is not a listed
  piece word); today the shape drops the name. No counter-example on this build.

## Owner questions (named here, not graded)

- **Menu numbers the owner's sentence does not settle.** A digit before a dish word that is not a piece word ("Appam 2 Stew", "Parotta 2
  Salna", "Chapathi 2 Kurma", "Aloo Paratha 2 Curd", "Roti 2 Sabzi 1"): the rule cannot tell these from "Chicken 65 Biryani". A digit
  at the end with nothing after it ("Tandoori Roti 2", "Boiled Eggs 2", "Rasgulla 2", "Dal Rice Roti 3", "Chicken Leg Piece 1"). Each
  shows as printed on this build; on 6b5e18d the digit went.
- **"Double egg omelette"** shows as written on a plate and a menu, while "Single egg omelette" shows "Egg omelette". On a menu it is the
  dish's name; on a plate it is a count of eggs.
- **Still open from the last audit, owner or clinician; results on this build only:**
  - Urgent symptom scope: "my sugar is 55", "sugar 60 hai", "blood sugar 400", "chest is tight", "numbness in left arm", "ghabrahat ho
    rahi hai" and "I feel very weak and shaky" (from a client whose answers say insulin) go to the model. A model referral with
    refer_reason "other_urgent" still shows no line to get help now.
  - Carbohydrate floors: the Codex probe still prints "a medicines plate with 1 g of carbohydrate: ok" as TRACKED.
  - Postpartum scope: "I just had a baby" and "I delivered last month" go to the model.
  - Potassium: "high potassium", "potassium high hai" and "my potassium is high" go to the model.

## COSMETIC

- c1. `npm run -s words` fails at HEAD: the committed test/ux/CRITIC.md has three hits of two banned words (lines 57, 62 and 110).
  The screen reviewer is writing that file during this audit, so its next version may clear this.
- c2. Honest names the count rule changes (no safety effect; the name shown is shorter or odd): "Chicken sixty five" shows "Chicken
  sixty", "Two minute noodles" shows "Minute noodles", "Half moon dosa" shows "Moon dosa", "Do pyaza paratha" shows "Pyaza paratha", "Ek
  tara dosa" shows "Tara dosa", "Two-tone dosa" shows "Tone dosa", "Mixed dal with two kinds of rice" shows "Mixed dal with kinds of
  rice". Some names are dropped instead of cleaned, which drops the plate: "3-4 rotis", "Teen-chaar roti", "2-egg omelette", "A bowl of
  dal", "A glass of buttermilk", "One-and-a-half roti".
- c3. The kidney rule now refers a typed menu that lists "Steak and kidney pie", "Kidney and liver fry" or "Kidney pudding" (a safe
  over-referral).
- c4. This file replaces the audit of 6b5e18d.

## BACKLOG (tier 2; does not fail the audit)

Searched: every name field (food, as_written, with, add_item, name) and every typed `text` in the JSON files under eval/ (3,218 plate
names and 187 menu names, distinct), and the 185 recorded replies replayed below.

1. Word-list gaps (each needs the model to send a wrong but non-empty tag): 94 of my 389 words have a form that passes with the tag
   "plain" (95 on 6b5e18d; "noodle" is closed). Unchanged otherwise: liver, seekh, rogan, vindaloo, quail, basa, tilapia, rui, bangude,
   chenna, khova, mozzarella, sandwich, frankie, charoli, macadamia, chikki, poondu, vengayam, chives, arvi, gud, cheeni, bellam,
   happala, loncha, and the others listed last time. New this round: "multivitamins" (the plural) passes where "multivitamin" is caught.
   Seen in recorded replies: as listed last time (chenna 3, sandwich 12, rui 4, tilapia 2, seekh 1), none mis-tagged.
2. Offal dishes reach the model. A typed menu with "Kidney Fry" went to the model on 6b5e18d too; 0c50e80 referred it, and fccd687
   sends it to the model again. "Kidney Fry", "Kidney Masala", "Gurda Fry" and "Bheja Fry" tagged "plain" are shown to a
   vegetarian ("Gurda Kaleji" and "Kaleji Masala" are caught by "kaleji"). No recorded menu lists kidney, gurda or bheja. Smallest fix:
   add kidney, gurda and bheja to the meat words, as `KIDNEYDISH` already reads them as meat.
3. Carried over, unchanged on this build: a hyphen inside a word ("Chi-cken tikka" tagged plain); a count in a menu side copied as words
   ("Two Tandoori Roti" as the side is not shown on this build: a side must be "<digits> <name>"); no_dairy_fat on a korma; Kori rotti,
   Payesh and Poondu rasam (TRACKED in test/safety/codex.js).

## Regression: my earlier probes, rerun

The scripts from the last audit (scratchpad audit4/) were copied to audit5/probes/ with one change: the page and app.js paths can be set,
so each runs on the 6b5e18d page and app.js (from `git archive 6b5e18d`) and on this build in the same way.

| Probe | 6b5e18d | eddb00b |
|---|---|---|
| h.js (loads np-core from the built page) | loads | loads |
| tags.js: 7 tag shapes (missing, empty, string, unknown, null, upper case, plain with dairy) on 7 surfaces for a vegan | 49 cases, 0 shown; controls 7 of 7 shown | 49 cases, 0 shown; controls 7 of 7 shown |
| replay.js: 185 recorded replies (80 at-risk window calls, the 6febc1a at-risk sample, the 26 window scenarios and menus) | 254 plates and 40 orders shown; 0 counter-examples (the hits are "jowar roti" read as wheat by my own list, "slices" read as a unit, a request line naming the ghee it takes out, and the nothing-fits line) | the same counts and the same hits |
| lex.js, through a new wrapper (lexsweep.js): my 389 words in 5 forms each, 1,945 plate items tagged "plain", under the profile that bars each | 434 shown, 95 words with a gap | 430 shown, 94 words with a gap ("noodle" closed) |
| s10.js: the moong dal khichdi plate (grain item = first protein item), protein swap and grain swap | both swaps offered; both taps land on the khichdi; shown 460 kcal, 26 g protein, 50 g carbs, 20 g fats for a plate of 500 / 20 / 80 / 11 (last audit's M1) | the protein swap is not offered (engine); grain swap alone shows 500 / 20 / 80 / 11, the plate on screen; a protein-swap tap state changes nothing |
| mutate.js with muts1.js (30 engine mutations) | 6 survive: M6, M9, M10, M18, M20, M21 | 3 survive: M18, M20, M21 (nothing a client sees, as last time). M6, M9, M10 now fail `safety`. M13, M14 and M16 no longer apply (the code changed); stand-ins N1, N3 and N6 below |
| mutate.js with muts2.js (14 app mutations) | 10 survive (A1, A8, A13 caught; A4 by the Codex probes) | 7 of 13 survive: A2, A3, A5, A7, A9, A10, A11. A6 and A12 now fail `safety`. A14 no longer applies (the card is drawn by `referHead`); stand-in N16 |
| mutate.js with muts3.js (3) | M31 survives (last audit's M3) | M31, M32 and M33 all fail `safety` |

The 6b5e18d mutation column is the last audit's record; the first 28 of those mutations (M1 to M28) were run again on 6b5e18d this round and gave
the same results, then the run was stopped to save time.

New mutations this round (muts4.js, 17), on this build:
- Caught by `safety` (and `rules` where named): N1 the engine lets a protein swap land on the grain item (also `rules`); N2 the app's
  `swapAt` guard off; N3 word counts kept; N4 every typed "kidney" read as a dish (also the Codex probes); N5 the dish reading off; N6 a
  bare "kidney" not referred; N8 menu prices kept; N9 the menu piece-count rule off; N14 the engine's `hookSaid` always true; N15
  `plateWhy` ignoring a grain change with a grain swap. The builder's table (M9, M10, A6, A12 now fail) holds.
- Pass every Node check (rest on review.js or on nothing): N7 a menu name may open with a number (m5); N10 a conditional order keeps the
  tick, N11 the condition off the "Also on this menu" rows, N12 the log referral without the get-help line, N13 the app's "Planned
  around" unfiltered, N16 the get-help line under the referral (m4); N17 a bracket may hold "katori" (M2).

## Probed

- Kidney referral (S7): 55 phrasings that must refer and 27 kidney foods and dishes that must not, each on both builds (kid.js), and 10
  more with a dish word after "kidney"; 8 phrasings routed through all four text paths (32 routes); one carried to a shown plate. Result: B1; m2; c3.
- Name cleaning (S8): 63 honest names with number-like words and 85 counted names through `showName`, plate and menu forms (296 calls);
  53 typed-menu lines as an order and as a "leave" entry, and 18 more with units, each on both builds; 13 bracket and large-number
  names on a plate, and the bracket on 5 more paths, on both builds; 5 names with a number in the name before a piece word.
  Result: M1, M2, two owner questions, c2.
- The recorded names diff, derived again from eval/ on both pages: 3,218 plate names and 187 menu names (distinct, with their typed menu
  where one was recorded); 21 change, the same 21 as eval/usefulness/names-diff.txt.
- S10: the protein swap on a plate whose grain item is its first protein item, for 9 profiles (diets, diabetes with and without
  medicines, BP, a food left out), 4 meals and 5 plate shapes: 0 offered on a declared grain item (174 cases; 22 offers on "Mixed dal
  adai", which the engine does not take as a grain, so nothing else can land on it). Grain swap index on 4 plates with a part-name item
  (M3), on both builds. All recorded plates re-checked for the M3 shape: 0 of 452; recorded grain names copied from the items: 1,170 of
  1,170.
- S6: a plate at the usual size, a swap and a one-tap change 20 kcal under and over it, and a Rescue dish just under twice the usual
  size, for medicines yes and not sure, 4 meals, 2 sexes, with and without body figures: 64 cases, 0 failures.
- Recorded replies replayed (185), tag shapes (49 and 7 controls), word lists (1,945 forms): see the regression table.
- Offal names with a wrong tag (7), regional number words (6), the open urgent and postpartum phrasings (10) and a model
  "other_urgent" reply.
- Mutations on this build: 30 + 14 + 3 from last time (4 no longer apply: M13, M14, M16, A14) and 17 new, 60 run in all.
- Read: the whole of `viewOf`, `swapAt`, `plateWhy`, `composedWhy`, `heroCard`, `orderView`, `renderSheet` (log), `logOther`,
  `referHead`, `rescue`, `readMenu`, `pruneKept`, `refresh`, `closeSheet`; `checkMeal`, `declaredGrain`, `showName`, `menuPrice`, the
  count expressions, `referTyped`, `urgentTyped`, `checkMenu` names, and the review states for the new app text (order-cond, the four
  urgent cards, sheet-log-referred).

## Not inspected

- test/ux/review.js was read, not run: playwright is not installed here. The app text changes (the get-help line first, the log
  referral buttons, the condition on "Also on this menu" rows, no tick on a conditional order) are judged by reading the code and their
  review states, and by mutation against the Node checks.
- The live model, the Railway service and the server security items. `src/v5/server.ts` was not read again this round; it is unchanged
  since 6b5e18d.
- Photos (menu, Rescue, log), the grain parser beyond the paths above, the day boundary beyond reading `refresh` and `dayMoved`, and the
  v5 screens.
- The S6 grid, the urgent phrasing sweep and the typed-disclosure sweep from last round were not rerun in full; their code is unchanged
  except the kidney rule.
