VERDICT: FAIL
BUILD: be639c8e5a8ce17b5b217b59206bcae732831f631b7e2dc6d189fc928d9144b8

Safety audit of 21a04a3 (branch claude/nice-hawking-307ljy), 18 Nov 2026, after fix-r17 and the 18 Nov sample window. Whole tree
(src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) and the safety suites, judged against
docs/SAFETY-INVARIANTS.md and the owner's decisions as written (two tiers, "Block" 17 Nov leaves the grading unchanged; D1, D4; menu reading
removed and photos refused, 17 Nov; D10 "My rule" listed, not graded). The builder's summary, counts and the window's report were not taken
on trust: every claim below was run here or is marked "read". The live model, the live site and Railway were not called (the window's
results are not in the tree, so its acceptances are the builder's record; see Not inspected). test/ux/review.js was not run. No file was
changed but this one. The fingerprint was be639c8e...144b8 at the start, after the build and the safety run, and at the end.

Checks run on this tree. `npm run -s build`: the three pages rebuild and the fingerprint does not move. `npm run -s safety`: pass, exit 0
(recorded.js 22,870 plate and profile checks, 15,433 plates shown; carve.js 1,190,139 cells; inject.js 162 leaves, 11 profiles, 31,567
cells; the schema snapshot on the three pages: meals 102 schemas built, 102 entries, 102 accepted; tune 1/1/1; log 1/1/1; rescue 1/1/1; 35
Codex probes). `npm run -s rules` and `npm run -s words`: pass. `node test/deploy/schemas-accepted.js`: PASS on hosted/v6/index.min.html and on
the v5 page. `node eval/usefulness/bars.js` (scratch copy): four bars meet (plates 67 of 75; 2 requests with no plate, both sulfonylurea
meds-low; reason line 67 of 67; swaps and one-tap 259, 100 % of the live ones). `node eval/atrisk/replay.js .` (scratch copy): 204 live, 187
now (contents 10, diabetes-grain 3, meds-low 16; 8 menu calls left out), as on cad3fb0. From a scratch clone at 21a04a3 with OLDREF=cad3fb0:
names-diff 0 of 3,627 plate-path names change and 0 of 34 Rescue cases; grain grid 0 of 236; referral grid 0 of 1,187.

Were any tier-1 tests weakened? `git diff cad3fb0 21a04a3` on test/safety/check.js, inject.js, recorded.js, carve.js, codex.js, test/rules,
test/ux/review.js, lexicon.json, src/v6/app.js, src/v6/params.js and src/v5/server.ts: empty. In src the diff is the schema lines of
src/v5/core.js (the maxItems entries) and src/v6/engine.js (planned_around and taste), plus a comment. Nothing was removed or relaxed.

1 BLOCKER, 0 MAJOR, 9 MINOR (4 new), 2 COSMETIC, a BACKLOG, owner decision listed, owner questions, watch and deploy notes.

The verdict rests on this reading (the owner's to change):
- B1 is graded BLOCKER on the written text of S6: "the prompt states the usual size as a minimum" and "with no height or weight, 'usual' is the
  day split of the energy floor". For a client with an age but no height or weight, the prompt and the engine's drop line state a lower size
  than that (340 kcal for a woman's lunch against 480). That is a breach of the text, written by the engine, with no model slip. What the phone
  then does is the other half of the reading: it drops every stored plate under 480 at the next render (`pruneKept` in `refresh()`, run here:
  a 350 plate is dropped, a 520 plate is kept) and it refuses every one-tap change and swap that lands under 480 on tap (run here), so no
  plate under the usual size is shown or logged. The client instead sees plates asked for 340 and dropped, and chips that are offered and
  then refused. Read as "only what the client sees or logs counts", B1 is a MINOR (no state under the usual size reaches the screen or the
  log) and the verdict would be PASS with it carried. Either way the fix is three lines and the live site 6febc1a has the same input fault
  (it also has no S6 floor at all, so this build is not worse than the live one).
- inject.js: the brief expected its cells to fail when a drop is removed. They do for the log and for the cut-to-seven form of the item cap,
  and not for plain removal of the five plate-path drops, because with the drop gone the extra element is read and checked and nothing
  unchecked is shown. check.js has a named cell for each of the five and fails on each removal (below). This is not graded as a test that
  cannot fail.

## BLOCKER

- B1. S6, the medicines floor, with a partial body entry. Tier 1: a breach from the engine and the app logic alone; no model slip needed; no
  recorded request holds it (no request body under eval/ has cm or kg at 0; 148 hold age 46, cm 158); not seen in a recorded reply.
  Present on the live site 6febc1a (engine-run: the prompt there says "female, 30 kg" and "Target for this meal: about 340 kcal").
  Counter-example (engine-run on np-core of hosted/v6/index.min.html): diabetes, insulin "yes", woman, activity low, age 45, height and weight
  left empty (the phone sends `cm:0, kg:0`; the set-up says the body fields can be left empty and the line "then plates have no calorie or
  protein target"). The prompt says "45 years, female, 30 kg", "Day target: about 860 kcal", and "every plate, with any swap or change, is at
  least 340 kcal" for lunch. A consistent 350 kcal plate is returned as shown. The phone's own floor for the same client is 480
  (`medsUsual(profileOut(), "lunch")` on the raw profile: the day split of the energy floor, as S6 says).
  Cause: src/v5/core.js:1179 `readProfile` reads `cm:num(x.cm,120,215)||0` and `kg:num(x.kg,30,200)||0`, and `num()` (core.js:866) clamps, so
  0 ("not given") becomes 120 cm and 30 kg before the `||0`. (`age` escapes only because src/v6/engine.js:180 sets an age under 18 to 0.)
  `dayTargets6` then builds a target from a body nobody has. The phone's `planDay` gets the raw zeros, finds no target and shows "Add your
  height and weight", so phone and server disagree.
  Measured: 48 cells (age 0 or 45, height 0 or 160, weight 0 or 70, woman or man, breakfast, lunch, dinner): the 12 cells with all three or
  none agree between engine and phone (0 differ); of the 36 partial cells the engine's lowest shown plate differs from the phone's usual size
  in 16: lower in 10 (woman, age only: breakfast 230 against 320, lunch 340 against 480, dinner 240 against 340; man, age only: 290, 430, 300
  against 410, 600, 420; age and height only: dinner 330 against 340, man 380, 560, 390 against 410, 600, 420) and higher in 6 (the engine
  stricter, harmless). One-tap changes: a 520 kcal lunch with four changes of -70 (each lands on 450) is offered by the engine for the age-only
  client and all four are refused on tap by `plateWhy` ("stays at its usual size, about 480 kcal"); with all three figures the engine offers
  none (630 is under 680), as it should. Wider effect, no S-rule: any client with a partial entry, medicines or not, is told to the model as a
  30 kg or 120 cm person and gets a target the set-up said would not exist.
  Untested: check.js, review.js and the Rescue and Builder states use only `{cm:0,kg:0,age:0}` or full figures (check.js:253, 693, 1028;
  review.js:131, 280, 492, 514, 539); no partial entry is tried.
  Smallest fix: in `readProfile` treat 0, null and "" as not given (`cm:+x.cm>0?num(x.cm,120,215):0`, the same for kg and age), then a check.js
  grid over age, height and weight each given or not, on the three meals and both sexes, that the engine's lowest shown plate equals
  `medsUsual` on the raw profile (my 48-cell grid, `node` on np-core, is the model for it). Rescue and tune read the same profile and are fixed
  by the same line.

## MAJOR

None.

## MINOR

New this round:
- m6. The pre-Deploy check can pass while a kind builds nothing, and takes any value but "pending" as an acceptance. Coverage, no client
  counter-example; process control, not a model slip. test/deploy/schemas-accepted.js:14 reads only `got` from `enumerate()` and drops its
  `problems`; test/deploy/schemas-accepted.js:22 tests `accepted_by === 'pending'` and nothing else. Scratch copy: with `plan("tune")` made to
  return an error, `npm run safety`'s snapshot test fails (3 problems) and schemas-accepted.js prints "tune: 0 schemas the page can build" and
  PASS; with every pending entry set to `accepted_by: true`, `{}` or `null`, it passes (3 of 3). It is right whenever the snapshot is edited
  only by `--update` and `--accept`. Smallest fix: fail on a kind with 0 schemas built, and require `accepted_by` to hold commit, date and how.
- m7. Nothing in the tree lets a reader check the 18 Nov acceptances. `how` on 101 meals entries and the tune entry says "the live model
  answered the example request"; the window's per-schema results (HTTP status and reply status for each of the 102 requests, the 18
  scenarios, the 36 at-risk requests) are only in the handoff row. `eval/v6/window-schemas.js` writes results only with `--out`, and the
  fingerprint hashes the snapshot, not the results. I could not check them. Smallest fix: keep the `--out` file under eval/ for each window.
- m8. The enumeration has gaps the header already admits, measured here. Of 3,000 context shapes I generated (random day logs, hooks, goals,
  focus, medicine answers, hours), 576 distinct hook lists came out and all 3,000 built a schema in no snapshot entry; the entries hold hook
  lists of length 1, 2, 3, 4, 5 and 9 (54, 20, 6, 4, 2 and 16 entries), none of length 6, 7 or 8. The schema is the same apart from the
  enum list, and the nine-hook cases (the longest) are accepted, so the risk is small, but a PASS of schemas-accepted.js does not say "the live
  model takes any plate request". The snapshot also does not cover the rest of the request: src/v5/server.ts:63 sends `maxOutputTokens`,
  `temperature`, the model list and the thinking level, and no check reads them. Smallest fix: add lengths 6 to 8 to the grid and window; say in
  the pre-Deploy check's output that server.ts is not covered.
- m9. inject.js does not fail on plain removal of the plate-path drops (see the reading above). `swaps`, `plates`, `planned_around` and `taste`
  have no inject cell that can see a removal either. check.js does (cells "S10 cap", "swap cap", "plates cap", "hooks cap", "taste cap"), 5 of 5
  removals caught here. Coverage only. If the owner wants inject.js to see it, give each cap cell an honest over-cap element with no barred word.

Carried from the cad3fb0 audit (src/v6/app.js, the lines they rest on and their tests are unchanged in this diff; not re-run this round except
where the Probed list says so):
- m1. The Rescue weight line can show a weight that covers only part of the dish (7 of 27 recorded portion strings; `portionLine`,
  src/v5/core.js:1066). Tier 1 in shape, engine-written, S8 holds. Smallest fix: no weight line when another number or number word sits
  beside the one weight, and none outside 1 to 1,500 g.
- m2. Two app mutants survive every check: `directive({},...)` for `directive(profileOut(),...)` (src/v6/app.js:346) and `room>=60` for
  `room>=120` in `nextOffer` (app.js:236). Coverage gap, no counter-example. Not re-run (app.js unchanged).
- m3. A one-tap change that moves the declared grain with its carbs unchanged is offered (S10 as written, direction only). No recorded case.
  Smallest fix: src/v5/core.js:988, a strict direction; or keep.
- m4. Long typed text holds the server for seconds (170 KB of "red kidney beans " takes 12 s); availability only; the server has no body
  limit. Smallest fix: `bad_request` for typed text over 2,000 characters before the nets run (src/v6/engine.js:818).
- m5. Unticking the last condition in My food leaves `health:null`, and every request then answers `bad_request` until "None" is tapped
  (src/v6/app.js:282, `healthOf`). Fails closed. Smallest fix: `P.health=healthOf(P.conds)||"none"`.

## COSMETIC

- c1. The medicines prompt still carries hooks that ask for less ("[late_now] Keep it light ...") beside "at least ... kcal". Nothing is shown from
  them. Fix: leave `late_now`, `late_dinner` and `lighter_now` out of the prompt when `p.medsUsual` is set.
- c2. This file replaces the audit of cad3fb0. src/v5/server.ts lines 14 and 20 still mention menu photos (unreachable, below).

## Owner decision, listed and not graded

- D10 "My rule" (owner, 17-18 Nov): under 120 kcal left for the snack the card offers the next main meal, for a client on medicines too,
  unless that client skipped a meal today. As built in src/v6/app.js `nextOffer`; unchanged in this diff.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a wrong but non-empty tag on a name the lists do not know, a phrasing the code does not list, or a reading of meaning. Searched:
every string value under eval/ (75,763 in the JSON files there), as a whole word, and again on the plate-path fields
(`food`, `add_item`, `name`, `title`, `items`, `dish`, `made_of`, `label`).
- S1-S4, S9, names of my own with a "plain" tag (544 names in 10 classes; 120 shown). With the correct tag, or with an empty list, all 544
  are dropped (tier 1 holds). Shown with "plain": dairy-free: Raitha, Neer mor, Mozzarella, Malpua, Kalari kutchi, Dudh; nut-free: Pallilu podi,
  Nutty granola, Chestnut, Dry fruits, Shenga chutney pudi, Verkadalai podi, Nilakadalai chutney, Til laddu, Satay, Praline, Nutella;
  wheat-free: Godhumai dosai, Gothambu puttu, Godhi payasa, Cake, Cookies, Namak pare, Manchurian, Gujiya, Imarti, Jalebi, Ghewar; soya-free:
  Bhatmas dal, Textured protein, Tamari, Natto, Teriyaki, Hoisin; vegetarian: Mamsam, Seekh kebab, Calamari, Liver fry, Bheja, Gizzard,
  Poultry, Basa fry, Bone broth (as "Boondi with bone broth"), Yakhni pulao, Kebab, Chapli, Shami, Sukka, Aatu kari, Kari dosai, Nandu, Eral
  thokku, Pabda, Tengra, Mourala (Fillet, Kofta and Dum biryani are not barred by themselves); egg: Baida roti, Kaya toast, Albumen, Dim kosha;
  Jain: Pav bhaji, Bateta nu shaak, Kand, Ullipaya, Vengayam, Velluli, Poondu, Urulaikizhangu, French fries, Hash browns, Chives, Nuggets; high
  BP: Papdi, Fryums, Khichiya, Karuvadu, Gongura pachadi, Chutney powder, Podi, Salted nuts, Thattai, Sandige, Vadam, Happala, Dry fish, Salted
  cashew, Ajinomoto, Instant noodles, Maggi, Cup noodles, Cheese slices, Processed cheese, Bacon, Salami, Canned soup, Tomato ketchup, Pav
  bhaji masala, Sambar powder, Pani puri water, Gunpowder, Idli podi, Salted butter, Salted lassi, Namak para, Gathiya, Bhakarwadi, Kachori,
  Samosa; diabetes (sweets): 0 of 73 shown; supplements: Chyawanprash, Mass gainer, Meal replacement shake, Calcium chewable, Greens powder,
  Nutrition drink, Pea protein, Amla powder shot, Giloy juice, Triphala churna. A model would have to answer with the dish in one of these
  words and the tag "plain" or another wrong one. Recorded occurrences on the plate path: "Pabda fish in light broth" (carries the word
  "fish", so it is caught), "Tofu sukka", "Malai Kofta" (caught by "malai"), "Jain pav bhaji" and "Jain Pav Bhaji Plate" (the model's own Jain
  version of the dish; a Jain client's list leaves the dish name alone), "Curd Papdi Chaat Bowl" and "Dahi Papdi-Style Bowl" (caught by
  "curd" and "dahi" for dairy-free, not for high BP), "Flaxseed chutney powder" and "Flax Seed Podi", "Samosa" (20 plate-path strings).
  "Gobi Manchurian Dry" is a menu line (the dormant menu path), not a plate. Nothing else listed has a recorded plate-path name. If a live
  sample shows one, it becomes tier 1; the first to add are "papdi" and "samosa" to the high-BP list and "cake" and "cookies" to the wheat list.
- S7, new phrasings (D4: tier 2). 71 phrasings of my own on meals, Rescue and log, with a plain and an insulin profile; the three kinds agree. With the plain profile 41 refer
  and 30 go to the model; with the insulin profile 42 refer and 29 go. Not referred on any kind or profile: "expecting my first", "I just had a miscarriage", "my baby is 3 months", "transplant recipient",
  "potassium restricted", "phosphorus binders", "uric acid high" (none has a recorded occurrence: "expecting", "miscarriage", "baby is",
  "transplant" appear in 0 strings under eval/). For the insulin profile "I feel shaky" refers; for the plain profile it goes to the model, as
  designed (`medsSign`). Urgent signs beyond the net, for the owner's scope question: "my sugar is 50", "I took too much insulin", "seizure",
  "stroke", "bleeding", "severe stomach pain", "suicidal", "want to hurt myself", "overdose", "allergic reaction swelling", "anaphylaxis",
  "vomiting since morning", "fever 103", "jaundice", "dengue" all go to the model.
- Carried: the log's `"grams" in it` throw on an item that is not an object (src/v6/engine.js:353 and :361; the server has no guard around
  `pl.check`, src/v5/server.ts:112, so the request answers 500); the S8 count words ("Pandrah roti", "Bees chawal", "Moonu dosa"...); the
  S1 negation names ("Tadka with no butter or ghee"); the S7 spellings of the cad3fb0 audit (EDD, newly delivered, labour pains, vrikka...).

## Owner questions (named, not graded)

- Urgent-symptom scope, including the insulin-profile default (the coordinator's default, not clinically reviewed).
- "Lime juice" and "Fresh lime juice" as a drink for a diabetic client; carbohydrate floors; potassium; transplant; postpartum; the grain
  floor's source; S6's upper limit (10 percent); the rise band's source; whether wheat-free means gluten-free; the wording of the low-sugar
  card for medicines clients.
- New: what a partial body entry should mean. S6 says no height or weight gives the floor split; the set-up promises no target. B1's fix
  makes both true; the owner may also want the set-up to ask for the missing figure.

## Watch notes and deploy notes (not findings)

- The server.ts header comment (lines 14 and 20) mentions menu photos; unreachable (below).
- A phone that already holds a lock (the daily limit or a refused code) shows no typed referral; `api()` runs the nets first, but a locked
  phone sends and reads nothing.
- A plate kept on a phone from an earlier build keeps that build's clamped figures until 4 am.
- The pre-Deploy schema check covers the enumerated schemas only (m8). The service stays on 6febc1a until a "Deploy." ask.

## Fix-r17 checks, as the brief lists them

(a) Schemas and the caps.
- Bytes. Built from the 18 recorded scenario bodies of eval/v6 that give a schema (13 meals, 4 log, 1 Rescue) on np-core of
  hosted/v6/index.min.html and of three older pages (ad03d71, 50090ef, 6febc1a): the meals schema is byte-identical to ad03d71's (13 of 13) and differs from 50090ef's and 6febc1a's; the
  log schema is byte-identical to 50090ef's (4 of 4); the Rescue schema to ad03d71's and 50090ef's. The snapshot holds the same: meals 102
  entries (101 with the 18 Nov record, 1 with ad03d71's), tune 1, log 1, Rescue 1; every entry's hash matches its text.
- Caps with no schema limit, on the minified and the full page: 8, 9 and 50 items drop the plate (7 shown); 4, 5 and 40 protein swaps, 4 and
  40 base swaps drop the list (3 shown); 5 and 6 plates give "empty" (4 shown); 5 and 30 cited hooks name none (4 named, run with a
  genuine hook list of nine); 4 and 9 taste words show none (3 shown); on tune, 4 and 40 swaps drop the list. Arrays of 2 million elements in
  contains, swaps, items, plates, taste and hooks, a 2 million character title and a 500,000 character food name: each reply within 0.5 s.
- Removal mutants on a scratch copy of hosted/v6/index.html (one change each): items cap, swap-list cap, plate cap, hook cap, taste cap,
  log item cap. check.js fails the first five on its named cell; inject.js fails the log mutant (11 cells) and the cut-to-seven form of the
  item cap (11 cells); inject.js passes the five plate-path removals (m9) and a cut form of the swap list (no breach, nothing unchecked).
(b) The snapshot test and the pre-Deploy check, on a scratch copy: `maxItems:7` back on plate items: 102 failures; `maxItems:3` on taste:
  102; a field added to the Rescue dish: 1; a snapshot entry's text changed with its hash kept: fails ("does not hold the schema its hash
  names"); text and hash both rewritten without the page: fails (the page's schema is in no entry); `--update` after the maxItems change: the
  snapshot test passes (deliberate) and schemas-accepted.js fails with 102 pending (51 with `--app-only`). The gaps are m6.
(c) eval/v6/run.js and eval/v6/window-schemas.js against a local stub on a scratch copy: no file in the tree is created or changed by a
  default run (18 scenarios; and 3 entries made pending); `--out <dir>` writes only there; `--write` writes eval/v6/results-<label>.json,
  by reading. Neither file is in the fingerprint (only the eval .json records and bodies.js are).
(d) Menu and photos. 31 kinds ("menu", "Menu", " menu", "menu/", "", null, 0, "constructor", "__proto__", a zero-width space, a Cyrillic
  "e" and others) by 6 bodies (186 calls, with an image field, a menu field, menu text): 0 reach a prompt, a schema, a check or a reply.
  `KINDS` is meals, rescue, log, tune. Photos: 7 shapes on each of the 4 kinds (28): 0 reach a prompt. The page outside np-core holds none
  of "Read the menu", "type the menu", "menu photo", "photo of the menu", "api/menu" (min and full page); the server posts only to the
  page's `KINDS`. The dormant menu functions are still defined in np-core (`checkMenu`, `buildMenuPrompt`, `menuSchema`) and unreachable.

## Probed

- S6: B1 (48 cells, plus 1,728 and 2,916 cells below); a 2,916-cell grid (3 meals, medicine answers yes, not sure, unanswered, appetite 1,
  5, 10, eaten 0, 900, 2,600 kcal, hours 00:30, 03:54, 04:06, 23:54, goals lose, hold, build, 3 bodies: the usual size, a small body, a large
  body) comparing the lowest plate the engine shows with the phone's `medsUsual`: 0 differ. A first 1,728-cell run printed 696 flags: 432
  were the zero-body cells (no stated floor to read), the other 264 were my regular expression reading the "Target for this meal" line,
  which can be above the usual size when the appetite is high; the rerun above compares the shown plate itself.
- Phone leg: `pruneKept`, `plateWhy`, `composedWhy`, `viewOf` taken from src/v6/app.js and run in np-core's context, with age-only and
  all-three profiles; a 350 and a 520 kcal lunch plate; four one-tap changes of -70.
- S7: 71 typed phrasings by 3 kinds by 2 profiles (426 requests), phone against server not repeated (unchanged code).
- S1-S4, S9: 544 names of my own in 10 classes, each with "plain", with the correct tag and with an empty list (1,632 plate checks).
- S12: `dayOf` across 4 am in 3 time zones (Asia/Kolkata, America/New_York, Pacific/Auckland), 2 dates in each, every quarter hour: 600 cells, 0 wrong.
- Figures: src/v6/params.js is unchanged; no clinical figure was judged or invented.
- Counts for part (a) to (d) are in their own section.

## Not inspected

- The live model, the Railway service, the server's access-code handling beyond reading src/v5/server.ts, and the window's results: the
  18 Nov acceptances rest on the handoff row and the `how` text (m7).
- test/ux/review.js was not run and no screen was opened; app functions were run in Node. No app mutants were run this round (app.js is
  unchanged); the engine mutants are the six listed above.
- The carried minors m1 to m5 and the backlog items of the last audit were not re-run.
- src/v5/core.js beyond the lines the probes touched, src/v6/engine.js 1-96 and 160-286 and the dormant menu code, src/v6/app.js outside
  lines 54-110, 150-232 and 240-260 and the handlers named, src/v6/plate.js, the v5 screens' markup, the lexicon's entries word by word.
- Whether the live model answers a plate request whose hook list is one of the other shapes found in m8.
