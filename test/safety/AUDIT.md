VERDICT: FAIL
BUILD: 48aa44f2674f5cc619580340fab334d65c9d39abdd3f2686d161ff05aa1290e5

Safety audit of b4633dd (branch claude/nice-hawking-307ljy), 16 Nov 2026, after fix-r8 (B1, m1, M1, M2, c1-c3, D3 keep-list) and
fix-r9 (owner decision D4). Whole tree, two tiers, judged against docs/SAFETY-INVARIANTS.md and the owner's 16 Nov decisions (Two tiers;
D1 Fix found, then watch; Watch list for count words; Refer, as now; D3 Short keep-list; D4 Model is backup). The builder's summary and test
counts were not taken on trust. The live model and the live service were not called.

Checks run on this tree. `npm run -s build`: the three pages it writes are byte-identical to the committed ones (the fingerprint did not
move). `npm run -s safety` (the three pages and the 41 Codex probes; 4 TRACKED lines: Kori rotti, Payesh and Poondu rasam with a wrong tag, and the carbohydrate floor): pass. `npm run -s rules`:
pass. `npm run -s words`: pass. `node eval/usefulness/bars.js`: every bar meets. `node eval/atrisk/replay.js .`: 221 live, 204 now, the
drops are meds-low, contents and diet as recorded. `node test/ux/review.js --quick --page hosted/v6/index.min.html`, output in scratch: 169 states, 9 runs
(4 widths, light and dark, and 130 % text at 360), 1,521 checks, no violations, exit 0, the drill's planted faults all caught. The fingerprint was 48aa44f2674f5cc619580340fab334d65c9d39abdd3f2686d161ff05aa1290e5 at the start and after all probing.

How findings were reached: "engine-run" = a model reply or a typed text through `plan(kind)` and `.check()` in Node on np-core taken from
hosted/v6/index.min.html, the code the server runs; "mutation" = one change in a scratch copy, rebuilt, then `safety`, the Codex probes
and `rules` run. A test gap found by a mutant with no counter-example on this build is graded MINOR, as last audit's table graded
its survivors.

1 BLOCKER, 0 MAJOR, 4 MINOR, 3 COSMETIC, a BACKLOG (watch list), and owner questions.

## BLOCKER

**B1. S7 (tier 1: a typed disclosure, and the urgent first net is tier 1 by the Tiers section): typed text that carries the curly
apostrophe (U+2019) misses every S7 pattern that spells an apostrophe. "I can’t breathe" is not referred before the model and loses the
line to get help now (engine-run, on ask, Rescue, menu and log).**
- Where: `URGENTTXT` (src/v6/engine.js:728-734) reads `can'?t`; `REFEROTHER` (src/v6/engine.js:712) reads `(?:i\s*(?:am|'m)|im)` and
  `(?:i\s*(?:am|'m)|still)\s+nursing`. `norm()` (src/v5/core.js:164) applies NFKC and strips format characters and combining marks;
  NFKC does not fold U+2019 to U+0027. The grain code already strips curly quotes (core.js:251, 389); the referral code does not.
- Run on all four paths: "I can’t breathe", "can’t breathe properly", "can’t breath after walking" (urgent) and "I’m 20 weeks", "I’m 32
  weeks", "I’m pg", "I’m nursing" (pregnancy) go to the model on meals, menu, Rescue and log; the same words with a straight apostrophe
  refer on all four. 203 phrasings were run both ways (the lexicon's referText, held-out referText, referWindow and its family, and 18 of
  my own); these 7 change, no other.
- What the client meets, carried through the check (a diabetic on insulin, dinner, "I can’t breathe, what should I eat for dinner?"):
  the text is in the prompt; a reply with refer_reason "other_urgent" gives status "refer" with the fixed line and no `urgent`, so the card
  shows "Your coach and doctor should plan this with you." without "If you feel unwell now, contact your doctor or emergency care."; a
  reply with refer_reason "none" and an honest plate shows the plate ("Moong dal with jowar roti"). S7: urgent signs typed in any box are
  "referred before the model, with the line to get help now".
- The premise, not tested on a device: the iPhone keyboard types U+2019 for an apostrophe by default, and the app's text boxes (app.js
  801, 894 and the ask bar) set nothing that changes that; text pasted from a chat or a notes app is a second route. Chromium cannot show
  the keyboard, so this rests on the stated behaviour of that keyboard.
- Why tier 1, and the two readings I reject: (1) D1's "new unlisted spelling, plural or word with no live occurrence" is tier 2. That
  covers words the lists do not hold ("chest pains", a plural the urgent net never listed, is tier 2 below for that reason). Here the
  phrase is the code's own listed pattern and the test's own case ("cant breathe properly", check.js:830), typed with its apostrophe; the
  gap is in how the code reads text, not in a list. (2) "Urgent scope is an open owner question": that question is which symptoms belong
  in the net ("my sugar is 55", "chest heavy"); breathlessness is in it already (S7 names it). D4 covers kidney and pregnancy spellings
  only, so the verdict rests on the urgent half. The pregnancy half ("I’m 20 weeks") the owner may read under D4 as a new spelling.
- The tests cannot see it: the urgent cases (check.js:829-830) write "cant breathe properly" with no apostrophe, and no S7 case carries a
  curly apostrophe.
- Smallest fix: in `norm()`, map U+2018, U+2019, U+02BC, U+0060 and U+00B4 to "'" (one replace), so every check reads the straight form;
  add "I can’t breathe", "I’m 20 weeks" and "I’m nursing" with U+2019 to the urgent and S7 cases on all four paths.

## MAJOR

None.

## MINOR

- m1. A test gap (mutation D19): removing the final katori guard in `showName` (`KATORI.test(h)`, src/v5/core.js:639) passes `safety`,
  the Codex probes and `rules`. Today the guard holds: "Dal katori", "Rice with katori dal", "Dal served in katori", "Curd katoriyan" and
  "Steel katori dal" are not shown (engine-run); without the guard they would be. The S8 test's katori names all carry a number, an "of" or
  an opening katori, which the count rules take off first. Fix: add two of these names to the S8 cases.
- m2. A test gap (mutation D10): adding "veg" and "egg" to `MENUKEEP` (src/v5/core.js:615) passes every check. S8 names "Veg 65" and "Egg
  65" as losing their number; the tests pin "Mix Veg 65" and "Boiled Egg 65" (check.js:485), where the anchor already drops it. Fix: add
  a typed menu line "Veg 65 120" and "Egg 65 90" to the keep-list cases.
- m3. A test gap (mutation D26): removing the medicines floor in `menuMoves` (src/v6/engine.js:561) passes every check. The app's
  `composedWhy` (src/v6/app.js:82) still refuses the tap and the order, so nothing under the usual size is logged, but the move would be
  offered. Fix: one S6 case with a large order on medicines, asserting no portion move under the usual size.
- m4. S10 residue of last audit's M2 (engine-run). With a grain named by a short form ("Rice" for "Jeera rice") the plates check clears
  the grain to "" and 0 g, the tune call is sent that plate, and a change with grain_grams_after 0 and deltaCarbs -30 is offered: "Add 80 g
  sauteed beans. About 120 kcal less, 2 g protein more.", with 200 g of jeera rice still listed. S10 as written holds (0 equals the
  reply's own grain grams), and the change cannot be told from one that cuts oil; it needs a grain name not copied letter for letter (0 of
  1,170 recorded). The reported case (150 g after) is closed. Fix, if wanted: with no declared grain, do not offer a change that
  lowers the carbohydrate; the size of the margin is the owner's call.

## COSMETIC

- c1. Name stubs with no count or price shown: "Three to four idlis" shows "To idlis"; "Rs 120 Masala Dosa" shows "Rs Masala Dosa";
  "Thali No 1 150" shows "Thali No"; "Egg Curry 2 Eggs 140" shows "Egg Curry Eggs"; "Katori chaat" shows "Chaat"; from last
  audit's c2, "Chicken Biryani Half 160 Full 280" still shows "Chicken Biryani Half Full" (the other eight now read cleanly).
- c2. The brief for this audit gives the review command as `--out=<path>`; `test/ux/review.js` reads only
  `--out <path>` (a space), so the `=` form writes to test/ux/out. This audit used the space form.
- c3. This file replaces the audit of ba4d8dc.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs either a model tag left off on a name the lists do not know, or a spelling the code does not list, with no occurrence in the
recorded data. Searched: every string under eval/ (7,842 distinct names, titles, portions and notes from 55 files, scenarios excluded) with
grep and with my own word lists; and a replay of the 80 recorded replies that carry tags (1,612 shown strings): 0 barred foods shown.

Head of the list, because the engine already knows the word elsewhere or S8 names its form:
- Wheat plurals the S8 count list knows (`CNTPIECE`, core.js:568) but the wheat list does not: "Parathe", "Paranthe", "Rotiyan",
  "Rotiyaan", "Chapatiyan", "Puriyan", "Samose", "Theple", "Rotiyon", "Puriyon", "Bati", "Dal bati", "Luchchis" pass for a client who leaves
  out wheat when the wheat tag is left off. One line: feed these forms to `LEAVEW.wheat`.
- Onion forms of listed words: "Bhindi Do Pyaza" (pyaza from "pyaz"; in two recorded replies, tagged onion_garlic both times),
  "Lasooni palak" and "Lahsuni dal" (from "lasun"; in one recorded reply, before tags), "Piyaji".
- S8 measures in forms the lists lack: "Ek katora dal", "Do katore dal" (S8 says katori in every form), "Chammach ghee", "Tsp ghee",
  "Spoon ghee", "Teaspoon ghee" (a measure that opens a name), "Fistful of chana", "Pinch salt".
- "Sweet lassi", "Mango lassi", "Mango shake", "Sharbat" with diabetes; "Chikki" and "Kadalai mittai" for a client who leaves out nuts.
- Referral spellings not listed (D4): "pregancy", "kednee", "dialyses", "ESRD", "AKI", "hamla", "haamla", "morning sickness", "32 weeks",
  "k1dney"; and the plural "chest pains" (the urgent net reads "chest pain").

The rest, found with a "plain" tag on a plate item (447 forms of my own, 65 shown):
- meat "Murgi jhol", "Murghi curry", "Chickn curry", "Rogan josh", "Koli saaru", "Tangdi kabab", "Shami kabab", "Bheja fry", "Yakhni
  pulao"; fish "Maacher kalia", "Machhi curry", "Machi fry", "Paplet fry", "Ayala curry", "Mathi fry", "Kanava roast", "Bangude
  pulimunchi"; egg "Masala omlette";
- dairy "Perugu annam", "Neyyi choru", "Moru curry"; wheat "Godhi", "Holige", "Obbattu", "Chakuli";
- onion "Vengaya sambar", "Poondu kuzhambu", "Ullipaya pulusu", "Eerulli"; root "Seppankizhangu", "Nadru yakhni", "Senai roast",
  "Chamadumpa", "Kand";
- sweet "Payesh", "Pradhaman", "Gud", "Rooh afza", "Mishti", "Jam", "Shakkarpara"; salty "Fryums", "Vadam", "Sandige", "Mor milagai";
- supplements (the "supplement" tag is the main net): "Whey", "Protein bar", "Ensure", "Pediasure", "Complan", "Glucon-D", "Electral",
  "B-complex", "Becosules", "Revital", "Shelcal", "Zincovit", "Neurobion", "Evion", "Biotin", "Folic acid", "Multivitamins" (plural);
- Hindi counts not yet found: "Teen dosai", "Do pesarattu", "Do adai", "Do bhakhri", "Char seekh kabab", "Char khandvi", "Do khakhre",
  "Do mathri", "Ek tukda paneer", "Do leg piece", "Ek muthi chana", "Ek gilaas lassi", "Ek dabba dahi", "Ek packet maggi", "Do pyali
  chai", "Ek thali" (0 Hindi number phrases in the recorded data but "panch phoron" and "Do Pyaza").
- Last audit's 17 backlog words still pass with a "plain" tag (17 of 17). 11 of them are held-out names in test/safety/lexicon.json, kept out
  of the lists by design and tested with honest tags; "bati", "khari", "chukka", "erachi", "kalamari" and "multivitamins" are not in the
  lexicon.

## Owner questions (named, not graded)

- Kept from the brief: the menu referral card's reason line; "65" scope ("Veg 65", "Egg 65" lose it); a kidney dish in a Rescue or log
  photo; size words with no number ("Half chicken", "Quarter chicken", "Full chicken", "Tandoori Chicken Full", "Double egg omelette");
  Hindi counts before nuts and fruit ("Char badam", "Paanch badam", "Do kele"); urgent scope ("my sugar is 55", "sugar 60 hai", "chest
  heavy", "tightness in chest", "heart pain", "palpitations", "numbness", "slurred speech", "on glimepiride and sweating"); carbohydrate
  floors; potassium; transplant ("transplant patient"); postpartum ("I just had a baby", "delivered last month", "just delivered",
  "normal delivery 2 weeks back").

## Last audit's findings, checked again on this build

| Last audit | Result on b4633dd |
|---|---|
| B1 gurday not referred | Closed: "Gurday kharab hain", "mere gurday weak hain", "Gurday ki bimari hai" and "Mere gurday kharab hain, dinner mein kya khaun?" refer on all four paths. |
| M1 Hindi and measure counts | Closed: the 36 names of M1 run on plate item, protein swap, grain swap, the food a change adds, menu order, side and leave entry: no count or measure shown; the 5 "Half Kg", "Ek Kilo" and "Half Litre" menu lines and "Katoriyan Dal" show the dish only. The S8 test now has its own Hindi detector (check.js:375). |
| M2 grain change with no declared grain | Closed for the case reported (a 150 g change is not offered); residue in m4. |
| m1 S7 spellings | Closed: the 21 phrasings refer on all four paths. |
| c1-c3 | c1 closed (names-diff baseline ba4d8dc). c2: 8 of 9 names rerun read cleanly; one left (c1 above). c3 closed (the log row). |

## Probed

- S7, typed: the 64 phrasings S7 lists, on 4 paths (256) and inside 10 wrappers (capitals, punctuation, brackets, a sentence, a line of a
  typed menu: 2,560 routes), 0 missed; 17 food controls S7 names, 0 referred; the 29 window phrasings from eval/referral/held-out.json,
  0 missed; 107 phrasings of my own (kidney, pregnancy, breastfeeding, postpartum, Hindi, Marathi, Urdu, Malayalam), 23 go to the model
  (watch list and owner questions); 203 phrasings with the iPhone apostrophe (B1); 40 urgent phrasings.
- S7, photo menu: 18 kidney, gurda and bean dish names as dish, side and leave entry under status ok, nothing_fits and unreadable (162
  cells): every kidney and gurda dish refers, "Kydney beans curry", "Rajma (kidney beans)", "Kidney bean salad" and "Kapoora" do not.
  Grid evidence: eval/usefulness/grid-referral.txt, 155 cells changed, all from model to referral; names-diff.txt, 0 of 3,452 names change.
- S1-S4, S9: 447 regional forms of my own with a "plain" tag on a plate item under the profile that bars each (65 shown, backlog); 828
  tagged recorded names against my own lists (22 under-tagged by the model, 0 shown); 7,842 recorded strings; replay of 80 recorded
  tagged replies; 51 supplement names; 30 wheat plurals; last audit's 17 backlog words.
- S8: 81 English, digit and bracket names and 89 Hindi names on plate and menu; 27 typed menu lines plus last audit's 7; the 36 M1 names
  on 7 paths; 10 katori names with and without the final guard; a scan of every recorded name after cleaning for a measure or number word
  (136 hits, all honest: "Cucumber slices", "Paneer portion", "Panch phoron").
- S5, S6, S13: 360 cases of the meal target and the prompt floor (medicines yes, not sure and no; with and without body figures; male;
  70 years; build goal; 4 meals; appetite 1, 5 and 10; a day with 3,200 kcal eaten), 0 failures; 96 boundary cases 10 kcal under and 20
  kcal over the usual size on plate, menu order, menu move, protein swap, one-tap change and Rescue move, 0 failures.
- S5: a diabetic plate at breakfast, lunch and dinner, medicines no, yes and not sure: 12 base swaps (9 stand-ins, 3 grains): only the
  3 grains offered; a change leaving 50 of 120 g, one leaving none, and "skip the roti" are not offered; menu orders with no grain dropped.
- S10: last audit's M2 plate, 6 tap shapes (m4).
- Mutations, 26 (scratch copies built without esbuild, run on the unminified page; deleted after): 23 caught by `safety`, each with its own failing line; 3 survive (D10, D19, D26: m2, m1,
  m3). Caught: each D4 alternation tried (junior, bun in the oven, kydney, mutrapind and vrukka, creatinin, lactacting, pet mein baccha), the
  tri-colour, kd, prego and baby-corn controls, CKD3, the photo-menu side and leave checks, the no-declared-grain rule, the unanchored
  keep-list, parathe, the bare measure, dus/gyarah/barah, chammach, the log's urgent line and refer_reason, the menu medicines floor.
- App logic in the browser: the review run above (169 states, among them the referral, urgent, midnight, stale-reply, kept-plate and
  composed-state states S10, S11, S12 and S14 rest on), no violations.
- Read: `plan`, `referTyped`, `referDish`, `REFERKIDW`, `REFEROTHER`, `URGENTTXT`, `checkMenu`, `menuMoves`, `rescueMoves`, `pruneMoves`,
  `checkLog`, `checkTune`, `checkReply6`, `planDay`, `medsUsual`, `readCtx`, `readProfile`, `norm`, `showName` and the count expressions,
  `MENUKEEP`, `menuCount`, `checkMeal` (swaps, changes, the no-grain rule), `declaredGrain`, `contentsBad`, `barredTags`, `checkRescue`;
  src/v6/params.js (`dayTargets6`); src/v5/server.ts; app.js load, `pruneKept`, `refresh`, `composedWhy`, `act`, `makePlates`, `tune`,
  the menu grain questions and order card, the referral cards and the log sheet's referral line.

## Not inspected

- The live model, the Railway service and the server's security items; photos as images (photo paths were run with a stand-in image).
- The v5 screens; src/v6/plate.js; app.js `viewOf`, `swapAt`, the plate and Rescue render, the log handlers, and the Builder and set-up
  screens beyond the S7 ranking (S10, S11, S12 and S14 rest on `safety` and the review states; the 320,640 Builder states were not
  re-derived).
- The grain identification code in core.js (lines 140-490) was not read; S5 was probed through the checks only.
- No clinical figure is judged; params.js figures were read against the handoff only for S6.
