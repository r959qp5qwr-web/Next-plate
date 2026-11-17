VERDICT: FAIL
BUILD: ff99eb165235ceeee9857cc621da2d135a41f7a7056864ef06dac09fdd60b465

Safety audit of 530a503 (branch claude/nice-hawking-307ljy), 17 Nov 2026, after fix-r10 (typographic apostrophes and dashes folded at
intake; the b4633dd gaps fixed) and fix-r11 (menu reading removed; photos refused on every kind). Whole tree, two tiers, judged against
docs/SAFETY-INVARIANTS.md and the owner's decisions recorded there (Two tiers; D1 Fix found, then watch; Watch list for count words;
Refer, as now; D3 Short keep-list; D4 Model is backup; 17 Nov Remove menu reading). The menu code is dormant: its reachability was
checked and nothing inside it was graded. The builder's summary and test counts were not taken on trust. The live model, the live site
and Railway were not called. No repository file was changed but this one.

Checks run on this tree. `npm run -s build`: the three pages it writes are byte-identical to the committed ones (the fingerprint did not
move). `npm run -s safety` (three pages and the 35 Codex probes; TRACKED, tier 2: Kori rotti, Payesh and Poondu rasam with a wrong tag,
and the carbohydrate floor): pass, exit 0. `npm run -s rules`: pass. `npm run -s words`: pass. `node eval/usefulness/bars.js`: every bar
meets (menu orders: no bar, by the owner's decision). `node eval/atrisk/replay.js .`: 204 live, 187 now; drops contents 10, diabetes-grain 3,
meds-low 16; 8 menu calls left out. `eval/usefulness/names-diff.js` and `grid.js` (referral, grain) were run from a scratch copy, because
they write into eval/usefulness, which the fingerprint covers: both grids match the committed files; names-diff run with OLDREF=40b84f0 is
identical to the committed file (0 changes); against its default, ba4d8dc, 24 names change, each a measure that opened a name now taken off. `test/ux/review.js` was not
run (screens are the UX Critic's scope, running at the same time). The fingerprint was ff99eb16...0b465 at the start and after all probing.

How findings were reached: "engine-run" = a model reply or typed text through `plan(kind)` and `.check()` in Node, on np-core taken
from hosted/v6/index.min.html, the code the server runs; "mutation" = one change in a scratch copy of the sources, rebuilt with the
repository's build, then `test/safety/check.js`, `codex.js` and `test/rules/check.js` run on the minified page.

1 BLOCKER, 1 MAJOR, 1 MINOR, 3 COSMETIC, a BACKLOG (watch list), and owner questions. The verdict does not rest on B1 alone: M1 is
a tier-1 MAJOR, and either one fails the audit.

## BLOCKER

**B1. S1 and S2 (tier 1: a tag left off a name the word lists know). The plant-milk rule reads "rice curd" as a plant curd, so "Brown
rice curd rice", a name the live model wrote, passes the word net for a client who leaves out dairy and for a vegan client.**
- Where: `PLANT` (src/v5/core.js:525) is `\b(coconut|almond|oat|soy|soya|rice|cashew|peanut)\s+(milk|curd|yogurt|yoghurt|cream|butter)\b`,
  and `crosses()` (core.js:534) turns each match into "<word> plant" before the word lists are read. "Brown rice curd rice" becomes
  "brown rice plant rice": "curd", a listed dairy word, is gone. The same holds for "Red rice curd rice", "Rice curd", "Rice curd and
  pickle", "Leftover rice curd mix" and "Rice yogurt bowl" (engine-run, each tagged ["grain"]). "Millet curd rice" and "Curd rice" are
  caught, as they should be.
- Live occurrence: "Brown rice curd rice" is a plate item and the declared grain in eval/atrisk/results-window-72758ac.json (case 48,
  egg-nonut-s-breakfast), tagged ["dairy","grain"]; "rice curd" occurs 6 times in eval/.
- What a client meets (engine-run on that recorded reply): the dairy tag taken off the item and the meal, and the model's title written
  as the engine itself titles that plate ("Sprouted moong usli with brown rice curd rice"): for a vegan client and for an egg-eater who
  leaves out dairy, the plate is shown, "Sprouted moong usli with brown rice curd rice", with the reason line "Your breakfast should carry
  about 450 kcal ... this plate gives about 438 kcal". With the recorded title ("Curd Rice with Tempered Sprouted Moong") the bare "curd"
  in the title drops it; nothing else does.
- Why tier 1: the Tiers section puts "a tag left off" in tier 1 and the word lists are the second net for it; "curd" is on the list,
  and the miss comes from the engine's own reading, not from an unknown word, odd characters, negation or sentence meaning. The live
  model does leave tags off listed words (eval/atrisk/results-window-72758ac.json: "Ghee on roti" tagged ["dairy"], no wheat; "Hard
  boiled egg thokku" tagged with no salty_side), and has offered a barred food to a profile that bars it (eval/atrisk/results-live-6febc1a.json,
  veg-nowheat-n: "Ghee on rotis", "Ghee for tadka and roti"). In 918 tagged live items of the window sample, none offered a barred food,
  so this needs three model slips together: the dish offered to a profile that bars it, the dairy tag off both the item and the meal,
  and a title with no bare "curd". The owner's tier rule grades the shape of the reply, and the second net is there for that case.
- The tests cannot see it: `forms()` in test/safety/check.js builds every S1 case as the word alone, a plural, "<word> curry", "Dal with
  <word>s and salad" and two negation forms; none puts a grain or plant word before the dairy word, and no case or control names "rice
  curd" or "curd rice" with a rice word in front. No test pins "rice curd" as a plant food, so the fix breaks no case.
- Smallest fix: let "rice" count as a plant word only before "milk", inside the group so `crosses()`'s "$1 plant" still has its word:
  `\b(coconut|almond|oat|soy|soya|cashew|peanut|rice(?=\s+milk))\s+(milk|curd|yogurt|yoghurt|cream|butter)\b`. Engine-run with this
  expression put in place of `PLANT` (not built): "Brown rice curd rice", "Rice curd" and "Rice yogurt bowl" are caught for a dairy-free
  client; "Rice milk porridge", "Coconut milk curry", "Oat milk porridge", "Soy curd rice" and "Almond butter toast" are not. Add "Brown rice curd rice", "Rice curd" and "Rice yogurt bowl" with a ["grain"]
  tag to the S1 (leave dairy) and S2 (vegan) cases, plus a form that puts a grain word in front of each dairy word.

## MAJOR

**M1. S8 (tier 1: engine logic on a name the live model wrote). A measure word that follows a count in digits stays in the shown name.
"2 piece pav lightly toasted with 1 teaspoon butter" shows "Pav lightly toasted with teaspoon butter"; "Paneer veg biryani cooked in
1 teaspoon oil" shows "Paneer veg biryani cooked in teaspoon oil".**
- Where: `DIGALL` (src/v5/core.js:616) takes off a digit count with the measure after it from `DIGMEAS` (core.js:615): pcs, pieces, nos,
  bowls, cups, glass, katoris, plates, tbsp, tsp, spoons, ladles, slices, sizes, g, gm, grams, ml, servings, portions. The word counts use
  `CNTMEAS` (core.js:578), which S8 names in full. Missing from the digit list: teaspoon(s), tablespoon(s), spoonful, scoop(s),
  handful(s), fistful, pinch, chammach, chamach, mutthi, muthi, karchhi, karchi, vati(s), kg, kilo, litre, liter, ltr, mug(s), tumbler(s),
  helping, bowlful, plateful, kap, gms. Engine-run, "Dal with 2 <word> ghee": each of these 36 forms but katoriyan and katora (dropped by
  the katori guard) shows "Dal with <word> ghee". The measure opening a name is handled (`MEASBARE`, "1 teaspoon ghee" shows "Ghee");
  inside a name it is not.
- Live occurrence: the two names above are recorded between eval/results-final.json and eval/results-g38paid.json (older records, items as
  strings); the current prompt asks for no counts, and a name in that shape is an honest reply.
- Every plate path shows it (engine-run): a plate item, the engine's title and subtitle, the reason line through the declared grain
  ("The grain stays: about 150 g of brown rice cooked with teaspoon ghee."), a protein swap ("Paneer bhurji with teaspoon ghee"), a
  base swap ("Bajra roti with chammach ghee") and a one-tap change's note ("Add 30 g roasted chana with handful peanuts."). S8: counts
  "and their measure words are taken off a model name, in digits or in words", and the Tiers section keeps digits tier 1.
- The test cannot see it: the S8 cases put digit counts first or alone ("1 teaspoon ghee", "Idli (2 pcs)"); no case has a digit count
  with a measure inside a name, and the test's own detector (`HINDIMEAS`, test/safety/check.js:347) finds teaspoon, tablespoon, handful,
  pinch, scoop and spoon only when they open a name.
- Smallest fix: build `DIGMEAS` from `CNTMEAS` (with "of" after it, as the word counts do), and add "Pav toasted with 1 teaspoon butter",
  "Dal with 1 chammach ghee" and "Poha with 2 tablespoons peanuts" to the S8 cases, with the detector reading these measure words
  anywhere in a name.

## MINOR

- m1. S10 residue, carried from the audit of b4633dd (m4), unchanged on this build (engine-run): with a grain named by a short form
  ("Rice" for the item "Jeera rice"), the plates check clears the grain to "" and 0 g; the tune call gets that plate, and a change with
  grain_grams_after 0 and deltaCarbs -30 is offered ("Add 80 g sauteed beans. About 120 kcal less, 2 g protein more.") with 200 g of
  jeera rice still listed. S10 as written holds (0 equals the reply's own grain grams). Fix, if wanted: with no declared grain, do not
  offer a change that lowers the carbohydrate; the margin is the owner's call.

## COSMETIC

- c1. Name stubs: "Khichdi with 1 tsp of ghee" shows "Khichdi with of ghee" and "Dal with 2 cups of rice" shows "Dal with of rice" (the
  digit takes its measure but leaves "of"; M1's fix closes these); from earlier audits, "Three to four idlis" shows "To idlis".
- c2. src/v5/server.ts's header still describes menu photos: `PHOTOS` "switches menu photos off (default on)" (line 14) and "Sent to
  Google: ... a menu photo when given" (line 20). The image branch in `handle()` is unreachable (every kind refuses a photo before it),
  but the comment no longer says what is sent.
- c3. This file replaces the audit of b4633dd.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a model tag left off on a name the lists do not know, or a spelling the code does not list. Searched: every string under eval/
(3,912 distinct model names from the JSON records, keys food, add_item, name, as_written and string items) against my own word lists
for each rule, and `grep -rIoiw` over eval/ for each word below.

Head of the list: names the live model wrote, tagged honestly where tags were recorded, that the word lists do not know:
- egg "Dim Kosha" (Bengali egg curry; 14 occurrences, item and titles, tagged ["egg", ...]); fish "Pan seared tilapia with turmeric and
  cumin" (4); dairy "Mor kuzhambu" (buttermilk curry; 18, tagged ["dairy"] where tagged), "Fresh homemade chena" (4; "chhena" is listed),
  "Low fat ricotta" (1). One line each in the word lists ("dim" only before kosha, dalna, curry or bhuna; "tilapia"; "mor" before
  kuzhambu or curry, "moru"; "chena"; "ricotta") would close them.

The rest, my own names with a "plain" tag under the profile that bars each (204 names, 63 shown; no live occurrence found for these):
- wheat "Sevaiyan", "Godhuma dosa", "Fada", "Atte ka halwa", "Rumali", "Shakarpara" ("Rotiyan" is held out by design); nuts
  "Verkadalai sundal", "Akrot", "Mungphali chaat", "Satay sauce", "Pesto" (in eval/ only in a menu line, "Penne in Pesto with Pine Nuts");
  meat and fish "Kodi kura", "Murgi jhol", "Tunday kebab", "Bheja fry", "Calamari", "Mathi curry"; Jain "Bateta nu shaak", "Bataka
  poha", "Lehsuni palak", "Vengaya sambar", "Poondu rasam", "Eerulli bajji", "Kand sabzi", "Ratalu puri" ("Lahsuni dal" held out by
  design); sweet "Rooh afza", "Shakarpara", "Payesh", "Pradhaman", "Gud", "Mishti", "Jam", "Aamras", "Panakam", "Banana shake", "Petha"
  ("Sharbat" held out by design); salty "Fryums", "Vadam", "Sandige", "Mor milagai", "Gathiya", "Fafda", "Uppinakai", "Kasundi",
  "Sukha bombil", "Salted peanuts"; dairy "Moru curry", "Mozzarella", "Perugu annam", "Neyyi choru", "Mattha".
- Spellings and phrasings S7 does not list, with no occurrence in eval/: "I'm 28 wks", "I am 28 wks", "bf'ing", "momtobe", "with child",
  "sugar bahut low hai", "dizzy after metformin" (metformin is not in the urgent context words); the look-alike "kıdney" (dotless i).
  Last audit's watch items stand ("AKI", "hamla", "ESRD", a bare "32 weeks", "k1dney").
- The negation reader, tier 2 by the Tiers section: Gujarati "no" is a possessive ("Dudhi no halwa" reads as "no halwa", so a diabetic
  client's word net misses the halwa when the sweet tag is left off). No Gujarati possessive with a barred word in eval/.

## Owner questions (named, not graded)

- From the brief: urgent-symptom scope ("my sugar is 55", "sugar 60 hai", "tightness in chest", "chest heavy", "palpitations",
  "numbness in arm", "slurred speech", "severe headache", "vomiting blood" go to the model); carbohydrate floors (the TRACKED medicines
  plate with 1 g of carbohydrate); potassium ("high potassium", "potassium restricted" go to the model); transplant ("transplant
  patient" goes to the model); postpartum ("I just had a baby", "just delivered", "delivered last month", "had a baby 2 weeks ago" go to
  the model); the grain floor's clinical source; S6's upper limit; the rise band's source.

## Last audit's findings, checked again on this build

| Last audit (b4633dd) | Result on 530a503 |
|---|---|
| B1 curly apostrophe missed S7 and urgent | Closed. `norm()` folds U+2018, U+2019, U+201B, U+02BC, U+02B9, U+0060, U+00B4, U+2032 and the dashes U+2010-2015, U+2212, U+FE58, U+FE63, U+FF0D before and after NFKC. Engine-run on meals, Rescue and log: "I’m 20 weeks", "I’m nursing", "I’m pg", "I can’t breathe", "can’t breathe properly", "mom‐to‐be", "c–section", "C‑section", "I`m 32 weeks", "I´m nursing", "I′m pg", "I＇m pregnant", "post–partum", "breast‐feeding" all refer, the urgent ones with the line to get help now; the controls "Kidney‐bean salad", "Kidney‑bean chaat", "tri–colour salad", "sugar‐free dessert" do not. Mutation (fold removed): caught by three S7 checks. |
| m1 final katori guard untested | Closed: mutation (guard removed) fails "S8 no count written as a word", 55 counter-examples. |
| m2 "Veg 65", m3 menu medicines floor | Dormant with the menu path (no live caller passes a price to `showName`; `menuMoves` is called only by `checkMenu`). Not graded. |
| m4 S10 residue | Unchanged; carried as m1. |
| Backlog head (wheat plurals, onion forms, sweet drinks, chikki, measures, pregancy, kednee, dialyses, morning sickness, chest pains) | Fixed and tested: each refers or is dropped (engine-run); mutations removing "morning sickness" and "chest pains" are caught. "Rotiyan", "Lahsuni dal" and "Sharbat" are held out by design. |
| c1 stubs | "To idlis" stays; new stubs in c1. |

## Probed

- Menu path (dormant): `KINDS` is ["meals","rescue","log","tune"]; `plan()` refuses "menu", "Menu", "MENU", " menu", "menu ", "meals/",
  "", "constructor", "__proto__" and "toString" for 6 bodies each (60 calls) with `{error}` and nothing else. The app posts to /api/meals,
  /api/tune, /api/rescue and /api/log only (src/v6/app.js 159, 177, 659, 742; the minified page holds no other /api/ path). The server
  routes `POST /api/<kind>` only when `KINDS` holds the kind and answers 404 otherwise (src/v5/server.ts). No live caller reaches
  `checkMenu`, `buildMenuPrompt`, `menuSchema`, `referDish`, `menuMoves` or `showName` with a price (grep of core.js, engine.js, app.js).
  Mutation (the `KINDS` guard removed): caught by safety and Codex.
- Photos: 11 photo forms (image as text, data URL, 0, [], {}; photo true, 1, "yes"; ctx.image; ctx.photo true and "1") on meals,
  rescue, log and tune: all refused with no prompt (44 calls); 5 non-photo forms (image "", null, false; photo false) build the prompt
  with `image:false`; typed pregnancy, urgent and gurda text with a photo still refers on all three typed paths; no prompt names a photo
  or picture. The server forwards only a non-empty `body.image`, which `plan()` has already refused. Mutation (the refusal removed):
  caught by safety, Codex and rules.
- S7, typed: 107 listed phrasings and typographic forms on meals, Rescue and log (321 routes; one miss, "kıdney", tier 2); 22 food
  controls, 0 referred; 113 phrasings of my own (kidney, pregnancy, breastfeeding, postpartum, urgent; English and Hinglish): 23 go to the model, all on the backlog or owner questions. Mutations: log refer_reason ignored, "morning sickness" and
  "chest pains" removed, fold removed: each caught.
- S1-S4, S9: 3,912 recorded model names against my own word lists for each rule (B1 and the backlog head); the 918 tagged items of the
  live window and 962 items of the 6febc1a sample checked against their own profiles (0 and 2 barred, the 2 untagged); 761 tagged
  recorded names for tags left off listed words (6 flagged: "Ghee on roti" without wheat and "Hard boiled egg thokku" without salty_side
  are honest slips, one is a menu line, three are millet or oat upma the wheat list reads as wheat; none was shown to a barring profile in
  the record); 204 regional names of my own with a "plain" tag (63 shown: B1, the backlog head and the backlog); 14 plant-milk forms (B1).
- S8: every recorded plate-path name (3,776 shown) scanned after cleaning for a number or measure word (88 hits: slices, pieces, "panch
  phoron", "green gram", and the two M1 names); 37 digit and word count forms; 36 measure words after a digit (M1); M1 carried through
  item, title, subtitle, reason line, protein swap, base swap and one-tap note.
- S5, S6, S13: 100 plates at the usual size minus 10 and 1, at it, and 5 and 40 over, on medicines yes and not sure, with and without
  body figures, male, with high BP and no dairy, at four meals (60 shown, none under; 180 swaps and changes, none under, none dropping
  the grain under half); the prompt floor on each; 60 Rescue dishes at 1.3, 1.8 and 2.5 times the usual size, every move kept at or above
  it, kept half the grain, figures within 15 %; 180 meal targets after 0, 1,500 and 3,200 kcal eaten at appetite 1, 5 and 10, none under
  the usual size. 0 failures. Mutation (the planDay medicines floor removed): caught.
- S9: 26 supplement names with a "plain" tag on a plate item, a protein swap, a one-tap change's add_item and Rescue: 10 offered on
  each plate path and 11 in Rescue ("Whey", "Protein bar", "Complan", "Electral", "Becosules", "Shelcal", "Zincovit", "Multivitamins",
  "Biotin", "Folic acid"; Rescue also "B-complex"); the other 16 ("Whey protein shake", "Horlicks", "Ensure shake", "Fish oil capsule",
  "Protinex", "Glucerna" and the rest) are dropped. These are last audit's supplement backlog, still open; none occurs as a food name in
  eval/ ("whey" occurs only in prompt text), so tier 2.
- S12: `dayOf` puts 23:59, 00:30 and 03:59 on the evening's day and 04:00 on the next; `buildFile` at 03:30 counts a dinner logged
  at 01:00 with the evening before (1,100 kcal), and at 04:05 starts an empty day.
- S10: last audit's short-form grain plate (m1).
- Mutations, 8 (scratch copy, the repository's build, deleted after): fold removed, photo refusal removed, `KINDS` guard removed, final
  katori guard removed, log refer_reason ignored, "morning sickness" removed, "chest pains" removed, planDay medicines floor removed.
  8 of 8 caught, each by its own failing line. No mutation was run on src/v6/app.js (its checks run in the review, not run here).
- Read: `plan`, `carriesPhoto`, `referTyped`, `REFERKIDW`, `REFEROTHER`, `URGENTTXT`, `urgentTyped`, `norm`, `foldPunct`, `readCtx`,
  `readProfile`, `readFile`, `buildFile`, `planDay`, `medsUsual`, `checkReply`, `checkReply6`, `checkMeal`, `pruneCombos`, `checkTune`,
  `checkLog`, `checkRescue`, `rescueMoves`, `pruneMoves`, `crosses`, `badWords`, `notFood`, `PLANT`, `NEG`, `barredTags`, `showName` and
  the count expressions; src/v5/server.ts; app.js `pruneKept`, `refresh`, `dayMoved`, `composedWhy`, `act`, `askedFor`, `makePlates`,
  `tune`, `viewOf`, `swapAt`, `clearSlot`, every `logEv` and `clearSlot` caller (each logging tap is wrapped in `act`), the Rescue and
  log sheets, the referral cards, the typed boxes (ask 240, Rescue 160, log 200 characters; the referral reads the whole text).

## Not inspected

- The live model, the Railway service and the server's security items.
- The screens: `test/ux/review.js` was not run (the UX Critic's scope). S10, S11, S12 and S14 rest on reading app.js and on `safety`;
  the review states they also rest on were not executed in this audit.
- The v5 screens; src/v6/plate.js; the Builder and set-up screens beyond the referral ticks; the grain identification code in core.js
  (lines 140-490) was probed through the checks only.
- No clinical figure is judged. src/v6/params.js was read against the handoff's targets row (handoff-next-plate.md, "Targets engine"):
  activity 1.3 / 1.4 / 1.55 / 1.725, deficits 300 and 500 kcal within 30 %, floors 1200 f / 1500 m, protein 1.0 / 1.2 / 1.4 g per kg with
  caps 1.6 and 1.5, fibre 15 (diabetes 20) g per 1000 kcal and the split 27 / 40 / 5 / 28 all agree. The meal floor (0.6) and catch-up
  (1.25) are marked in params.js as engine rules; the handoff gives no figure for them. S6 uses the split and the floors as S6 states.
- Last audit's full backlog (regional meat and fish with a "plain" tag, Hindi counts not yet found) was not rerun name by name; the
  supplement part was (S9 above), and the parts rerun here are listed under BACKLOG.
