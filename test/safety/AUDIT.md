VERDICT: FAIL
BUILD: e20b990933802e9703bddd24ee8e6b5906e11afa36d9f260d38a20d7a0390e1b

Safety audit of 7eaadcf (branch claude/nice-hawking-307ljy), 17 Nov 2026, after fix-r13 (every exemption fails closed, the generated
exemption grid, the lexicon floor over every engine list, the gate hashing the safety inputs, the found words). Whole tree, two tiers, judged
against docs/SAFETY-INVARIANTS.md and the owner's decisions recorded there (Two tiers; D1 Fix found, then watch; Watch list for count words;
Refer, as now; D3; D4 Model is backup; 17 Nov Remove menu reading). The menu code is dormant: its reachability was checked and nothing inside
it was graded. The builder's summary and counts were not taken on trust. The live model, the live site and Railway were not called. No
repository file was changed but this one.

Checks run on this tree. `npm run -s build`: the three pages rebuild byte-identical (the fingerprint did not move). `npm run -s safety`
(three pages; recorded.js on three pages, 22,870 plate and profile checks, 15,436 plates shown; carve.js 707,243 cells on three pages; 35
Codex probes): pass, exit 0. `npm run -s rules`: pass. `npm run -s words`: pass. `node eval/usefulness/bars.js`: four bars meet (plates 67
of 75; 2 requests with no plate; reason line 67 of 67; swaps and one-tap 259). `node eval/atrisk/replay.js .`: 204 live, 187 now (contents
10, diabetes-grain 3, meds-low 16; 8 menu calls left out), as on 9dd1b13. From a scratch copy, with read-only `git show` on the repository
and OLDREF=ca94d43: names-diff 0 changes; grain grid 0 of 236 changed; referral grid 68 of 1,187 changed, every one to a referral
("Mutton kidney beans fry" and the like, the conservative side); all three files identical to the committed ones. `test/ux/review.js` was
not run (the UX Critic's scope). The fingerprint was e20b9909...0390e1b at the start, after the build and after all probing.

How findings were reached: "engine-run" = a model-shaped reply or typed text through `plan(kind)` and its `.check()`, or through
`checkMeal`/`checkTune`/`checkRescue`, in Node on np-core taken from hosted/v6/index.min.html, the code the server runs; "mutation" = one
change in a scratch copy of the sources, rebuilt with build6.js, then test/safety/check.js, recorded.js, carve.js, codex.js and
test/rules/check.js on the rebuilt page. "Recorded" counts are distinct quoted strings in the JSON files under eval/ (14,464), matched
with word boundaries, unless a finding says otherwise.

1 BLOCKER, 2 MAJOR, 4 MINOR, 2 COSMETIC, a BACKLOG, owner questions.

## BLOCKER

**B1. S1 (tier 1: a tag left off, with the model's own made_of field naming wheat or soya in plain words). On a base swap, the engine blanks
made_of before the word net reads it whenever made_of is not pure grain material, so "wheat", "maida", "atta" or "soy" in it is never read.
A swap whose name the wheat list does not hold is then offered to a client who leaves that food out.**
- Where: `swapList` in `checkMeal`, src/v5/core.js:895-896. `made_of:isGrainMaterial(mo)?mo:""` runs first; the word check then reads
  `crosses(s.rawFood+" ; "+clean(s.made_of,40),p)`, the blanked field. `isGrainMaterial` is false for any made_of with a word outside its
  grain lists, such as a pulse flour (`PULSEFLOUR`, core.js:515), "besan" or a vegetable, so "wheat and besan" becomes "". The plate's own
  grain is read raw (core.js:883: `clean(m.grain&&m.grain.made_of,40)`), so only the swap path skips it. S1: "Swaps and one-tap changes read
  their name and what it is made of apart", and S1 names "what a grain is made of" and "a swap" among the places a left-out food never shows.
- Engine-run, through `plan('tune', ...).check()`, the server's path: base swap `{food:"Thalipeeth", made_of:"wheat, soy and chana flour",
  contains:["grain"]}` is offered to a client who leaves out wheat, one who leaves out soya, one who leaves out wheat and soya with high BP,
  and a Jain client who leaves out wheat (4 of 4). Through `checkTune` for a wheat-free client, each offered: "Thalipeeth" made of "wheat and
  besan", "wheat and chana flour", "wheat flour and spinach" and "maida and besan flour"; "Bhakri" made of "wheat flour with soy flour"; "Multigrain bhakri" made of
  "atta, jowar and chickpea flour"; "Muthia" made of "wheat flour and besan flour"; "Methi muthia" made of "wheat and besan flour" (8 of 8).
  "Bhakri" made of "whole wheat" and "Handvo" made of "rice, wheat and dal" (pure grain material) are dropped, as they should be. A wheat-free
  diabetic client: dropped at lunch (a base swap must be grain material at a main meal), offered at snack.
- Why tier 1: none of the five tier-2 shapes. The words are on the list and the reply names them in plain words in the field S1 says is read;
  the miss is the engine's own reading, which throws the field away before the second net, as in the last two audits' B1. The other reading
  is "a wrong tag on a name the lists do not know" (tier 2), since Thalipeeth, bhakri and muthia are in the engine's grain-dish list (`GRAINT`)
  and not in the wheat list; it does not hold here, as the reply itself names wheat and the engine discards that.
- Live occurrence: the blanking path is reached by recorded replies: base swaps "Besan roti" made of "chickpea" and "Cooked sweet potato
  cubes" made of "sweet potato" (eval/v5/results-live-r37.json); a recorded item name shows the model writing a wheat and pulse mix:
  "Multigrain roti made with wheat and chana flour". No recorded swap puts wheat with a non-grain word in made_of under a name outside the
  wheat list (36 distinct made_of values under eval/, the longest 20 characters). It needs two slips together, the wheat tag left off and a
  name the list does not hold: the case the second net is for.
- The tests cannot see it: the suite passes with the defect in place. The base swaps read in check.js, carve.js and test/rules/check.js
  carry grain material ("jowar", "bajra", "wheat", "rice and moong dal", "bajra and moong dal") and none is for a wheat-free or soya-free
  client with a name outside the wheat list.
- Smallest fix: read the raw field. In `swapList`, check `crosses(s.rawFood+" ; "+quoted(s&&s.made_of,200),p)` (the whole field, not 40
  characters and not through `clean`, which blanks a field holding one of the owner's banned words); keep the filtered value for what travels
  with the swap. Do the same for the plate grain in `all`. Test: base swaps with made_of "wheat and besan", "maida and besan flour", "soy and
  rice flour", names from `GRAINT` outside the wheat list, tags ["grain"], wheat-free and soya-free, expected not offered; control "Jowar
  bhakri" made of "jowar" offered.

## MAJOR

**M1. S9 (tier 1: an honest reply). Rescue helps a typed supplement.**
- (a) Carries the grade. The brand names "Ensure", "Boost" and "Tang" count only as a whole name (`SUPPNAME`, core.js:119), but
  `checkRescue` reads the typed text and the model's dish name joined by a space: `supp(typed+" "+clean(d.name,80))` (core.js:988). Typed
  "Ensure" with any non-empty name ("Ensure", or "Nutrition drink") reads as "ensure ensure", not a whole name. Engine-run,
  `plan('rescue').check()`: typed "Ensure", "Boost", "Tang" and "Boost shake" are each helped (the dish shown, 3 moves) when the reply names
  the dish, and refused only when the name is empty. An honest reply names the dish; the Rescue schema makes `dish.name` required (core.js:1086).
- (b) `checkRescue` never reads the declared `supplement` tag. Engine-run, reply tagged `["supplement"]`: typed "Threptin", "Prohance",
  "Supradyn", "Neurobion", "Revital", "Limcee", "Chyawanprash", "Fast and Up" and "Ensure Diabetes Care" are each helped (9 of 9).
  `checkRescue`'s own comment says the dish is shown "whatever their rules bar or the model's tags say": that covers the food rules (S15),
  and the same comment, S15 and the table under "Where every shown string comes from" keep one exception, "a supplement is not helped (S9)".
  The engine calls the declared tag S9's main check (core.js:111-112); on Rescue only the word net is left, and these names are not in it
  (tier 2 by name alone; the tag is what an honest reply sends).
- "Complan", "Horlicks", "Protinex", "Glucerna", "Pediasure", "Ensure milk" and "Ensure shake" are refused by the word net.
- Live occurrence: none. No recorded typed text or reply under eval/ holds a supplement brand (searched ensure, boost, tang, complan,
  horlicks, bournvita, protinex, whey, threptin, pediasure, glucerna, chyawanprash, supradyn, revital, neurobion, multivitamin: only verbs
  in notes, "boost protein", "ensure you stay full").
- The tests cannot see it: the one Rescue supplement test (check.js:595) types "Protein shake with whey protein", a phrase `SUPPW` lists;
  the brand-name and tag cases (check.js:269-274, 346-348) run on the plate, swap and one-tap paths only. Mutation: that test does fail when
  the Rescue check is taken out, so it is a test with too narrow a case, not one that cannot fail.
- Smallest fix: in `checkRescue`, refuse when `tagList(d.contains)` holds "supplement", and read the two texts apart:
  `supp(typed)||supp(clean(d.name,80))`. Test: the brand names typed with a named reply, and the held-out supplements with an honest tag,
  on Rescue, expected `reason:"diet"`.

**M2. S10 (tier 1 in shape; no recorded occurrence). A plate with more than seven items is offered with seven, while the figures still
count the items left off.**
- Where: `checkMeal`, core.js:869, `m.items.slice(0,7)`; the meals schema sets no item limit. The plate's kcal, protein, carbs and fats come
  from the reply as a whole. The comment two lines below (core.js:872-873) states the aim this misses: every item has the name shape, grams
  and its own tags, "so the figures always match the items shown".
- Engine-run: an eight-item plate (dal, jowar bhakri, cucumber salad, lauki sabzi, mint chutney, roasted papad, curd, and an eighth item) at
  900 kcal is offered with the first seven and 900 kcal; "I'll have this" logs 900 kcal for the seven on screen. The S6 floor (`meds-low`)
  reads the same figures, so on medicines the energy of an item that is not shown counts toward the usual size. A further case needs a second
  slip and shows nothing barred: with the plate's own contains left without "sweet", an eighth "Gulab jamun" tagged dairy and sweet is read by
  neither net for a diabetic client and is counted when the plate is logged.
- Why tier 1: an eight-part thali (dal, sabzi, roti, rice, salad, raita, papad, pickle) is an honest shape, and a reply over the prompt's
  "3 to 6 items" is not built to break a filter. It is a gap in the engine's logic, not in a word list, so D1 does not apply (unlike "Full
  plate rice" below, a phrase the measure list does not hold). Recorded: 2,346 plates under eval/ hold 2 to 6 items, none more. Of the
  three findings this is the least likely to be met.
- Smallest fix: drop the plate when `m.items.length>7` (`{drop:"shape"}`), and set `maxItems` in the schema. Test: an eight-item plate is
  not offered.

## MINOR

- m1. The log-time checks on the two "I'll have this" buttons can go with no test failing: the plate's (`act(function(){return
  plateWhy(m);}, ...)`, app.js:480) and Rescue's (`act(function(){var w=rescueWhy(r,UI.rmoves);...}`, app.js:722); mutation to
  `act(null, ...)` for each: check.js, recorded.js, carve.js, codex.js and rules all pass. MINOR and not "a test that cannot fail": the
  property S13, S5 and S6 state for logging holds through the tap guards, which are tested (`composedWhy` with S5 or S6 off fails check.js):
  every swap, change and move tap runs `plateWhy` or `rescueWhy` on the composed state first, render clears Rescue ticks that no longer hold
  (app.js:696), and the inputs do not change in between. No counter-example; a second guard with no test of its own.
- m2. What the exemption grid proves: test/safety/exempt.js holds its own copy of each allowed set, written out the same as core.js, so the
  grid proves the engine applies its sets as written and fails when the two drift (mutations below: "and" in `JUICEPRE`, "rice" in
  `NEGNBPRE`, a hyphen read as a stop: each caught). A set too wide in both would pass. I judged each set word by hand (juice, rice cake,
  plant products, flatbreads, noodles, bread, keema, sol kadhi, butter beans, sugar snap, negation, "-free") and ran the frames above: on the
  word net, I found none that lets a barred food through that is not already an open owner question (lime juice as a drink; the millet bread reading,
  which also covers "Rice paratha", "Chawal ka paratha", "Bajra paratha", "Ragi paratha", "Makki paratha" and "Rice puri", each offered to a
  wheat-free client as the exemption intends).
- m3. made_of is read only to its first 40 characters, and through `clean`, which returns "" when the field holds one of the owner's banned
  words; then nothing in it is read. No recorded made_of is longer than 20 characters or holds a banned word. Folded into B1's fix.
- m4. The engine's own S13 drop of a plate whose figures disagree (`if(!figsAgree(n))return {drop:"energy"}`, core.js:892) can go with no
  test failing (mutation: check.js, recorded.js, carve.js, codex.js and rules all pass). The tests run combinations on plates whose base
  agrees (check.js:605-615, codex.js:51-62), and `pruneCombos` stops on the base combination without dropping anything. No counter-example
  on the v6 screens: at render `pruneKept` runs `baseWhy`, whose `composedWhy` refuses figures that disagree (tested by codex.js), so the
  plate is taken off the card (the `composedWhy` refusal is run by codex.js; `pruneKept` calling it at render was read, not run). The
  engine's drop is the only check for any other caller of the reply. The other reading: the Tiers section gives each tier-1 rule "a test
  that fails on a regression", and this regression fails none, which would make it MAJOR; I grade it MINOR because the property the client
  sees keeps a failing test. Fix: one case, a plate at 900 kcal with macros worth 500 (engine-run on this build: `{drop:"energy"}`).

## COSMETIC

- c1. "Egg whites of 3 eggs" still shows "Egg whites of eggs" (watched since the last audit); "Half dozen almonds" and "Chammach bhar ghee"
  now show "Almonds" and "Ghee".
- c2. This file replaces the audit of 9dd1b13. Deploy note, not a finding: src/v5/server.ts's header still describes menu photos
  (`PHOTOS`, "a menu photo when given"); its image branch is unreachable, as every kind refuses a photo first.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a model tag left off, or a wrong tag, on a name the word lists do not know, or a spelling or phrasing the code does not list,
with no recorded occurrence of the slip. Searched: the 14,464 distinct strings in the JSON files under eval/, by grep with word boundaries
for every word and phrasing below; the counts are given where there is any.
- Head of the list, words the engine's own lists hold for another rule but the food lists lack (D1: found, so to be fixed and tested):
  - Hindi plurals in the S8 piece list (`CNTPIECE`, core.js:683) and not in the wheat or egg lists: rotiyan, rotiya, chapatiya,
    chapatiyaan, chapatiyon, puriya, puriyaan, parathon, samoson, bhaturon, kulchon, kachoriyan, kachoriyon, golgappe, golgappa; egg andey
    and andon. Engine-run: "Do andey" shows "Andey" and "Andey ki bhurji" is offered to a vegetarian with a "plain" tag; the wheat forms are
    offered to a wheat-free client. Recorded: 0. A check that every wheat and egg form in `CNTPIECE` is in the food lists would hold them
    together.
  - Wheat words in `GRAINMATW` and `GRAINT` and not in the wheat list: wholewheat, wholemeal, durum, spelt, multigrain. "Wholewheat bhakri"
    made of "wholewheat" and "Spelt flatbread" are offered to a wheat-free client with a "grain" tag. Recorded: 7 strings spell "Wholewheat"
    as one word ("Wholewheat phulka", "Wholewheat bread"), each with another listed wheat word; made_of is recorded only as "whole wheat"
    (674), which is caught. Also unlisted, 0 recorded: emmer, einkorn, kamut, khapli (alone).
- Unlisted names offered with a "plain" tag under the profile that bars each (641 tried as plate item, swap and one-tap add; 179 shown, none
  holding a listed word whole). None of these words is recorded as a plate item, swap or one-tap name with a tag that leaves its food out.
  Recorded elsewhere: "Cold Coffee" (3) and "Cappuccino" (2) in menu records; chai (14) in typed texts; "Sandwich" (20: Rescue portion texts
  such as "1 sandwich, about 220 g", which the engine does not show, menu lines and notes); "Roll" (25: plate titles such as "Egg Bhurji
  Roll", which the engine replaces, title suffixes and menu lines); "Flatbread" (106: 102 in sentences, and "Bajra roti (pearl millet
  flatbread)", "Jowar roti (sorghum flatbread)", "Cooked pearl millet flatbread", "Bed of mixed salad greens without flatbread");
  "Croissant" (4) and "Penne" (3) in menu records; "Crackers" (3: "Bajra roti cracker", "Jowar roti cracker", a note); "Cheesy" (3,
  "Cheesy Garlic Bread", menu); "Creamy" (16: Rescue move texts, notes, and one taste word, which `LEFTTASTE` drops for a client who leaves
  out dairy); "Parmesan" (4: "Parmesan cheese", a note, a subtitle); "Masala dosa" (3); "Boondi" (6: "Boondi raita" and menu lines);
  "Crisps" (2: "Roti crisps", a note); kebab (4) only as vegetarian dishes ("Hara Bhara Kabab", "Veg Seekh Kabab"). With 0 recorded: wheat Frankie, Kathi roll, Sub, Dabeli,
  Bhakarwadi, Churma, Kuboos, Khubz, Macaroni, Fusilli, Lasagne, Ravioli, Gnocchi, Muffin, Cookies, Bagel, Cornflakes, Muesli, Granola;
  sweet Jam, Jelly, Marmalade, Nutella, Toffee, Candy, Caramel, Cupcake, Doughnut, Gulkand, Murabba, Petha, Lemonade, Shikanji, Nimbu
  pani, Aamras, Aam panna, Rooh afza, Iced tea, Sheer khurma, Chakkara pongal, Paayasam, Ada pradhaman, Unniyappam; dairy
  Mozzarella, Cheddar, Gouda, Paal, Pal, Ksheer, Moru, Neer mor, Sambharam, Nei pongal, Neyyappam, Malaai kofta, Dahiwala aloo, Rasogolla,
  Hot chocolate; egg Baida roti, Dim er jhol; meat Shami kebab, Tangdi kabab; fish Karuvadu; Jain Chives (named in `TAGTEXT` under
  onion_garlic, not in `ONIONW`), Turmeric root, Kachi haldi, Vengayam, Ullipaya, Eerulli, Peyaj, Piyaz, Vellulli, Belluli, Rasun,
  Urulaikizhangu; nuts Macadamia, Praline, Marzipan, Chilgoza, Trail mix, Dry fruits, Sing dana, Verkadalai, Nilakadalai, Kappalandi; soya
  Yuba, Natto, Shoyu, Tamari; high BP Aachar, Avakai, Salted peanuts, Khara boondi, Vadam, Fryums, Bombay mix.
- S8, a size word before a measure that opens a name: "Full plate rice", "Full plate biryani", "Full bowl dal", "Full glass buttermilk",
  "Heaped spoon ghee", "Level tsp ghee" are shown as written. `MEASBARE` (core.js:725) reads only small, medium, large and big before the
  measure, while `MEASSIZE` (core.js:682) also holds full, heaped and level. The S8 detector (test/safety/measure.js) flags each; no test
  generates them. Recorded: none in a name (the size-and-measure forms recorded are "small bowl rice" in typed log text, the client's own
  words, and "a small bowl of" in one-tap notes, which are not shown). Also "Ghee spoon" (spoon kept at the end by design; the detector flags
  it) and "Roti do", "Anda do" (a Hindi number after the food; in Hindi word order "do" there reads as "give", sentence meaning). 0 recorded.
- S7, urgent phrasings that go to the model (the urgent net is a first net, and its scope an open owner question): "my sugar's low", "My
  sugar's dropping", "sugar levels are low", "Blood sugar levels dropped", "sugar is going down", "sugar has gone down", "sugar seems low",
  "sugar became low", "shugar low", "suger low", "tightness in my chest", "heavy chest", "my chest feels heavy", "trembling after taking
  gliclazide" (a medicine name with a sign, watched since the last audit). 0 recorded. Of 139 refer phrasings of my own, 123 refer on meals,
  Rescue and log; the 16 misses are these, "sugar lo" and "delivered last week" (postpartum, an open question; the referral grid holds
  "delivered last month" as a cell that goes to the model). 20 food controls: no false hit.
- A bracket reads as nothing next to an exemption: "Watermelon (lime juice)" is offered to a diabetic client, shown with its bracket (a
  dressing or a drink; sentence meaning). Recorded names carry short brackets often ("Chole (chickpea curry)", "Boiled Egg (2)"); none puts an
  exemption phrase in one (28 recorded strings open a bracket with "no" or "without": "(no tempering)", "(no ginger, ...)"; 0 hold a juice,
  rice cake or plant milk in a bracket).

## Owner questions (named, not graded)

- Lemon and lime juice as a drink for a diabetic client ("Lime juice", "Fresh lime juice", "Amla juice", and "One lime juice", whose count
  goes; default kept).
- From the brief: urgent-symptom scope (above); carbohydrate floors; potassium; transplant; postpartum ("delivered last week" goes to the
  model); the grain floor's source; S6's upper limit; the rise band's source; the millet bread reading (shop "Ragi bread" or "Millet pasta"
  often holds wheat flour; the millet and rice parathas in m2).
- Coordinator judgement calls, measured: the dish words in the negation set before the negating word ("Phulka without ghee") let nothing
  through, as a barred dish word is still read itself ("Kheer without sugar" for a diabetic and "Paneer curry no ghee" for a vegan are
  dropped). "and" left out of the flatbread and plant sets costs plates only: current recorded.js on the 9dd1b13 page (from `git show`) and
  on this one: wheat left out 1,313 to 1,293, dairy left out 840 to 838, every other profile unchanged; the bars unchanged.

## Last audit's findings, checked again on this build

| Last audit (9dd1b13) | Result on 7eaadcf |
|---|---|
| B1 juice and rice cake carve-outs | Closed. Engine-run, diabetic, tag "plain", plate item, swap and one-tap add: "Watermelon lime juice", "Pineapple lemon juice", "Mint lime juice", "Ginger lemon juice", "Mango rice cakes", "Banana rice cake", "Date rice cakes", "Caramel rice cakes", "Coconut rice cakes", "Orange and lemon juice" are dropped; "Lemon juice", "Fresh lime juice", "Cucumber with lemon juice", "Amla juice", "Brown rice cakes" are offered. |
| m1 sweet words outside the lexicon | Closed. Mutations: "honey" out of `SWEETS` and "sugar" out are each caught by check.js S4 (8 counter-examples each). |
| m2 S8 detector reading the engine's list | Closed. Mutation: "glassfuls?" out of `MEASW` is caught by recorded.js ("the measure list holds the lexicon's measure words"). |
| m3 gate not hashing safety inputs | Closed. test/ux/manifest.sh lists every file under test/safety (AUDIT.md left out) and every .json under eval/. |
| c1 stubs | "Half dozen almonds" and "Chammach bhar ghee" closed; "Egg whites of eggs" open (c1 above). |
| Backlog supplements | Closed on the plate path (19 names: plate item, swap and one-tap add, tag "plain", each dropped); open on Rescue (M1). |
| Backlog Bengali egg dishes, wrap | Closed (listed). New egg and wheat plurals in BACKLOG. |

## Probed

- Menu path (dormant): `KINDS` is ["meals","rescue","log","tune"]; `plan()` gives `{error}` and nothing else for 16 kinds ("menu", "Menu",
  "MENU", " menu", "menus", "menu/", "", "constructor", "__proto__", "toString", "hasOwnProperty", null, undefined, 0, ["menu"], {}) by 6
  bodies: 96 calls. Photos: meals, rescue, log and tune, each with `image`, `photo`, `ctx.image`, `ctx.photo`: 16 refused. The minified page
  posts only to /api/log, /api/meals, /api/rescue and /api/tune; src/v5/server.ts routes POST /api/<kind> only when `KINDS` holds the kind,
  returns only `pl.check(r.data)` (or the referral reply), and loads the same built page.
- S1-S4, tags left off: 641 names of my own (regional and Hinglish dairy, egg, meat, fish, Jain, wheat, nut, soya, salty and sweet names,
  plurals, hyphen and compound forms, negations) as a plate item, a swap and a one-tap add (1,923 runs): 179 shown, none holding a listed
  word whole (BACKLOG). Wheat words 29; Hindi plurals 41; millet and rice flatbreads 10; last audit's names 17; brackets and commas next to an
  exemption 4; negations 3.
- S1 made_of: 11 base swaps by `checkTune`, 4 profiles by `plan('tune').check()` and 2 diabetic slots (B1); 7 plate grains with wholewheat,
  wholemeal, spelt, durum, multigrain (BACKLOG); every recorded made_of value (36 distinct).
- S5: 46 grain stand-ins and true grains as the declared grain of a diabetic lunch (cauliflower, konjac, shirataki, zucchini, lauki,
  paneer, soya, sabudana, keto and grain-free rotis dropped; poha, oats, quinoa, amaranth, puffed rice, rajgira roti offered).
- S6: 1,920 `plan('meals')` cases (medicines yes and not sure; five bodies including none; four meals; 0 to 9,000 kcal eaten; appetite 1,
  2, 5, 10; a skipped breakfast or not): every prompt states "at least" the usual size or more. Rescue moves read (`rescueMoves`): a portion
  move is never under the usual size on medicines and keeps half the carbohydrate with diabetes.
- S7: 139 refer phrasings of my own times meals, Rescue and log (123 refer on each; misses in BACKLOG); 20 food controls, no false hit. Read:
  `plan` reads only `ctx.text` for referral; the other client strings that reach a prompt (`file.today.meals[].title`, `file.recent`) come
  from shown plates and from logs and Rescue texts already read by `referTyped`; a referred log or Rescue writes no event (app.js
  `logOther`, `rescue`).
- S8: 188 count and measure forms through `showName` (digits, ranges, fractions, x-counts, English and Hindi numbers before and after,
  brackets, sizes, Hindi measures); 14 size-and-measure forms with the detector run on each (BACKLOG).
- S9: 17 typed Rescue supplements by 3 dish names (51 runs) and 9 with an honest tag (M1); 19 supplement names on the plate path.
- S10: an eight-item plate (M2). S12: `dayOf` puts 23:59, 00:00, 03:59:59 and 02:00 on New Year's Day on the evening's day and 04:00 on the
  next; `buildFile` at 03:30 counts a dinner logged at 01:00 and at 04:05 starts an empty day.
- S11: read `makePlates`, `tune`, `rescue` and `logOther`: each compares what the request was made for (answers, settings, day, meals
  logged) before showing a reply, and asks again or drops it.
- Mutations, 24 (scratch copy, rebuilt, removed at the end):
  - word net: "and" in `JUICEPRE` (caught by carve.js, 440 counter-examples); "rice" in `NEGNBPRE` (caught by carve.js); `nbWalk` true on an
    unknown word (caught by check.js and carve.js); the edge branch dropped (not caught; it can only make the reading stricter, so no
    counter-example can follow); hyphen and slash read as stops (caught by carve.js, 848); "honey" out of `SWEETS` (caught); "sugar" out
    (caught); "glassfuls?" out of `MEASW` (caught by recorded.js);
  - plate and tune: one-tap S6 off (caught, check.js "S6 one-tap change"); swap S6 off (caught, "S6 engine: no swap under the usual size");
    the engine's S5 drop at a main meal off (check.js passes; caught by recorded.js "S5 replay", 1,088, and three rules checks); the
    plate's S6 drop off (caught, check.js "S6 plate"); the plate's own figures check off (not caught, m4);
  - referral and requests: urgent net out of `referTyped` (caught by check.js, carve.js and codex.js); photo refusal off (caught by check.js,
    codex.js, rules); "menu" put back in `KINDS` (caught by check.js, codex.js, rules); Rescue supplement check off (caught by check.js
    "Rescue: a supplement is not helped", the one case); ticked kidney and pregnancy referral off (caught, check.js "S7 ticked" and rules);
    the day starting at midnight (caught, check.js "M3 day start");
  - app: "I'll have this" without `plateWhy` (not caught, m1); Rescue's "I'll have this" without `rescueWhy` (not caught, m1);
    `composedWhy` S6 off (caught, check.js "m1 app S6"); `composedWhy` S5 off (caught, check.js "m1 app S5"); the wait guard in
    `makePlates` off (not caught by these five checks; its test is the review state "plate-loading-changed" in test/ux/review.js, read and
    not run here: it holds the first /api/meals reply, ticks "Nuts" during the wait, and fails unless a second request carries the new
    answers and the card shows "No nuts"; it was not run against the mutated build).
- Read: `crosses`, `nbTok`, `nbWalk`, `nbFits`, every allowed set, `plantOut`, `milletOut`, `notFood`, `NEG`, `badWords`, `foodRx`,
  `barredTags`, `contentsBad`, `checkMeal` (items, swaps, one-tap changes, `pruneCombos`), `declaredGrain`, `isGrainMaterial`, `checkReply`,
  `checkReply6`, `reasonLine`, `hookSaid`, `tasteWords`, `checkTune`, `checkRescue`, `checkLog`, `rescueMoves`, `pruneMoves`, `planDay`,
  `buildFile`, `readFile`, `readProfile`, `readCtx`, `hooksFor`, `briefText`, the three prompts, `plan` (v6), `carriesPhoto`, `referTyped`,
  `kidneyBeans`, `pregoOut`, `urgentTyped`, `medsUsual`, `showName` and the count expressions, `supp`, `SUPPNAME`; test/safety/exempt.js,
  measure.js and the supplement, S9 and S10 parts of check.js; src/v5/server.ts in full; app.js `load`, `profileOut`, `pruneKept`, `refresh`,
  `dayMoved`, `composedWhy`, `plateWhy`, `act`, `askedFor`, `makePlates`, `tune`, `viewOf`, `swapAt`, the swap, change, log and Rescue
  handlers, `rescue`, `logOther`, `rules`, `CONDS`; src/v6/params.js.
- Figures: src/v6/params.js against handoff-next-plate.md ("Targets engine"): activity 1.3 / 1.4 / 1.55 / 1.725, deficits 300 and 500
  within 30 %, floors 1200 f / 1500 m, protein 1.0 / 1.2 / 1.4 g per kg with caps 1.6 and 1.5, fibre 15 (diabetes 20) per 1000 kcal and the
  split 27 / 40 / 5 / 28 agree, as on the last audit. On medicines the goal does not lower the usual size (no deficit); `pruneKept` checks
  kept plates again at render. No clinical figure is judged.

## Not inspected

- The live model, the Railway service and the server's security items.
- The screens: test/ux/review.js was not run (the UX Critic's scope). The app's composed states (`viewOf`, `plateWhy`, `composedWhy` on a
  tapped plate) were read and tested by mutation, not run in a browser or in Node; S11, S12 and S14 rest on reading app.js, on `safety` and
  on the app mutations above. The wait guard in `makePlates` and the on-screen S10-S12 states are tested by review states in
  test/ux/review.js ("plate-loading-changed", "plate-tune-stale", "rescue-health-changed" and the rest), which were not run here.
- The v5 screens; src/v6/plate.js; the Builder beyond the safety check's states; the grain identification code in core.js (lines 140-500)
  beyond the 46 grain probes and the checks.
