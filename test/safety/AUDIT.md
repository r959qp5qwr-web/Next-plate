VERDICT: FAIL
BUILD: 61247f911870ecd782b2b15694df3dd2efd168cc6a5271e7e2cdb9be0ddd2317

Safety audit of the current tree, 15 Nov 2026. Judged from scratch on the np-core script inside `hosted/v6/index.min.html` and on the
v6 screens. The previous AUDIT.md was not used. Model replies were crafted by hand; the live model was not called.

Checks run: `npm run -s build` in a scratch copy of the build inputs gives pages byte-identical to the three committed pages, so the
committed `hosted/v6/index.min.html` is the build of the current sources. `npm run -s safety`, `rules` and `words`: all pass. The
fingerprint was 61247f91...2317 at the start and is the same after all probing.

How each finding was reached: "engine-run" = crafted reply through `plan(kind).check()` in Node on np-core; "driven" = the v6 screen in
headless Chrome (network blocked), on a scratch copy of the unminified `hosted/v6/index.html` with the app scope exposed and replies
injected; "read" = code reading only.

9 BLOCKER, 5 MAJOR, 8 MINOR, 2 COSMETIC.

## BLOCKER

**B1. S1, S2: a food the client said no to is excused on Rescue because they typed its name (engine-run).** `typedTags()` (src/v5/core.js:545)
gives the client every tag whose word list matches anywhere in what they typed, negations included. `checkRescue` then excuses those tags on
the dish (core.js:682) and on portion moves (core.js:689), and `ownWordsOut()` (core.js:659) strips the typed words before the word net
looks at the dish name, warning and breakdown (core.js:693). One JAINW word excuses both onion_garlic and root_veg; one NONVEG word excuses
both meat and fish.
- Vegetarian types "Veg biryani, no egg"; reply dish "Egg biryani", contains [grain, egg]: shown.
- Vegetarian types "Paneer tikka, not chicken"; dish "Chicken tikka" [meat]: shown.
- Dairy left out, types "Thali, no paneer"; dish "Paneer thali" [grain, dairy]: shown.
- Jain types "Thali, no onion no garlic"; dish "Lahsuni dal thali" [grain, onion_garlic]: shown.
- Jain types "Jain pav bhaji, no potato"; dish "Pav bhaji with lahsuni chutney" [onion_garlic, wheat]: shown.
- Egg diet types "Egg curry, no chicken"; dish "Egg curry with bangude" [egg, fish]: shown.
- Vegetarian types "Veg fried rice, no egg"; portion move "Eat half the egg fried rice" [egg, grain]: shown.
- Vegetarian types "Veg thali, no chicken"; breakdown "The chicken gravy carries most of the fat", warning "Chicken pieces are fried": shown.
- Smallest fix: run `typedTags` and `ownWordsOut` on the typed text after `NEG`/`NEGPRE` removal, so a negated word grants nothing; map
  each tag to its own words (split JAINW into onion/garlic and roots, NONVEG into meat and fish).

**B2. S1-S4: model-written text that carries no tags is guarded only by the word lists, so a name outside the lists is shown (engine-run;
the fields named are drawn at the app.js lines given).** The owner's design catches held-out names by their tags. These fields have no tag
list, so a held-out name passes even when every tag the model sends is honest.
- Rescue move of kind "move": `noFood:true` accepts an empty list (core.js:689). Vegetarian: "Order a side of baida roti instead of naan"
  (egg) shown. Diabetes: "Finish with a spoon of misri", "Have a small sweet after the meal" shown (S4).
- Menu ask (engine.js:577, drawn app.js:651), tip (engine.js:593, drawn app.js:696) and portion (drawn app.js:649): vegetarian ask "Ask
  for a side of mahi tikka", tip "Ask them to cook it in raan stock"; dairy left out, tip "Ask for a glass of mor with it", portion
  "1 plate topped with nei, about 300 g": all shown. S1 names the ask.
- Plate pairing tip (engine.js:289, drawn app.js:424): vegetarian "Have a side of mahi tikka for protein", "The baida roti adds protein".
- for_you (engine.js:287, drawn app.js:497): dairy left out "A glass of mor after the meal"; diabetes "Finish with a little misri and
  saunf", "End with a small sweet after the meal". No SWEETS entry matches "sweet", "sweets", "meetha", "misri", "shakkar" or "cheeni".
- Plate subtitle (drawn app.js:384): Jain "a spoon of piyaz chutney"; BP "a spoon of gongura pachadi". Reply read line (drawn app.js:487):
  vegetarian "raan". Rescue warning and breakdown (drawn app.js:759, 761): vegetarian "Most fat is in the bheja fry side".
- Smallest fix: drop any free-text field that names a food not on the plate, order or dish (or ask for tags on it and check them), and give
  a Rescue "move" the same `plainFood` test as any other empty list.

**B3. S2, S4 (with S8, S9): the model's referral text on a plate reply is shown after only the claim, supplement and banned-word checks
(engine-run).** `checkReply` (core.js:649) shows `r.refer` when `status:"refer"` and `refer_reason:"none"`; the referral card draws it
(app.js:481). Rescue, menu and log show `SAFETY` in the same case.
- Vegetarian ask: "Ask your doctor before you eat chicken soup or 1 katori of curd." shown.
- Diabetes: "Have some gulab jamun now and call your doctor." shown.
- "Speak to your doctor; meanwhile a glass of Complan helps." shown (S9).
- Smallest fix: always show `SAFETY` on a referral.

**B4. S1, S2: an empty tag list is believed on dishes the engine's own text says carry a barred food (PLAINEMPTY, core.js:533-542;
engine-run).** This is the builder's reading awaiting the owner. It lets forbidden food through, on the engine's own definitions:
- `containsText()` (core.js:586) tells the model "dal tadka cooked in ghee with garlic is dairy and onion_garlic". "dal" and "tadka" are
  both in `PLAINW`, so "Dal tadka" with [] is offered to a vegan, a dairy-free and a Jain client: as a plate item, a protein swap, a one-tap
  note ("Add 100 g dal tadka on the side"), a menu order, a Rescue sequence move and a "leave for another day" entry. (The menu side probe
  was inconclusive: its figures were 0, so it may have been dropped for that.)
- `TAGTEXT` (core.js:519) and `JAINW` (core.js:82) put tapioca under root vegetables. "sabudana" is in `PLAINW`, and `plainFood()` rewrites
  "sabudana khichdi" to "sabudana fasting", so "Sabudana" and "Sabudana khichdi" with [] are offered to a Jain client as a plate item, a
  menu order and a Rescue sequence move, and "Sabudana khichdi" to a nut-free client as a plate item and a menu order.
- Also offered with [] as plate items: rajma, chole, sambar, mixed vegetable curry, gravy, chana chaat, sarson saag, tomato soup, shorba.
- Smallest fix: `PLAINEMPTY=false` (the literal rule), or take the dish-type and tempering words out of `PLAINW` (tadka, tarka, curry,
  gravy, chaat, soup, shorba, stew, chutney, sambar, rasam, chole, rajma, saag, sabudana) so only named vegetables, pulses and fruit pass.

**B5. S1, S2: an engine-written dish tap breaks the food rules (engine-run in Node on the list and filter; not driven).** The Rescue screen's
"Or tap a common dish" list (`DISHES`, app.js:571, drawn app.js:733) is filtered by the word lists only. A vegan and a dairy-free client
see "A slice of tiramisu after dinner": tiramisu is made with mascarpone and cream, and "tiramisu" is in SWEETS only. By the usual recipe
the same line also carries egg (shown to vegetarian and Jain clients) and wheat sponge fingers (shown to a wheat-free client), and a Jain
client sees "Masala dosa with chutney" (a potato filling). Smallest fix: give each built-in dish its declared contents in code and filter
by `barredTags()`.

**B6. S1, S2: an invisible or full-width character inside a listed word hides it from the word net (engine-run).** `crosses()` (core.js:507)
and `quoted()` (core.js:571) read the raw string; `NONLATIN` lets format characters and full-width Latin through. "Chic​ken tikka"
(zero-width space), soft hyphen, zero-width joiner, word joiner, a combining accent, "Chíckén" and full-width "Ｃｈｉｃｋｅｎ" all pass the
word net. As a plate item with a wrong tag list ([grain]) they are offered to a vegetarian. This needs a wrong tag, but the project's own
"word net (lying tag)" tests require a listed word to be caught when the tag is wrong; here a listed word is not. In a pairing tip they
pass with no tag at all (the B2 path). Smallest fix: NFKC-normalise, strip Cf and Mn characters, then check; or drop any model field that
contains them.

**B7. S5: with diabetes, unticking a Rescue move takes more than half the grain (driven).** The combined check at app.js:776-777 runs only when a
move is ticked on. Dish "Veg biryani", 100 g carbs; moves "Add a bowl of 150 g dal on the side" (+30), "Eat about two thirds of the
biryani" (-40), "Eat about three quarters of the biryani" (-25), all passed by the engine. Tick all three (65 g), untick the first: 35 g of
100 g. "I had this" logged carbs 40 (the 40 % floor). Ticking the two reducing moves alone is refused with "Not ticked: ..." (driven), so
the untick is the way round it. The one-tap handler (app.js:398-400) has the same on-only check (read; no counter-example built, and the
grain item keeps its grams there). Smallest fix: run the same sum on every tap, untick included, and refuse an untick that breaks it.

**B8. S6: on medicines, a swap and two one-tap changes together take the plate under the usual size (driven).** Diabetes, meds "yes", no body
figures: lunch usual 480 kcal (1200 x 0.40). Plate 500 kcal; a protein swap (-15) and two changes (-15 each) are each offered (each
leaves 485). Together the screen shows 455 kcal and "I'll have this" logs 455. `viewOf` (app.js:150-162) and the tap handlers hold no
floor. With body figures and with meds "unsure" the same code runs (read, not driven). Smallest fix: in `viewOf` or the tap handlers,
refuse a combination under `medsUsual`, as the carbs rule is refused.

**B9. S6: "Show my last plates" shows plates checked against an older usual size (driven, through the sheet's own inputs).** Diabetes, meds
"yes": a 500 kcal lunch plate made with no body figures (floor 480). The client opens My food, types age 47, height 158, weight 72, taps
Female and Mostly sitting, taps Done (usual now 680). The new plate request fails; "Show my last plates" (app.js:478, `lastForMeal`
app.js:79) shows the 500 kcal plate and "I'll have this" logs it. `rules()` (app.js:793) leaves the body figures out, so `closeSheet`
(app.js:796) keeps the plates. Smallest fix: drop kept plates under the current `medsUsual`, or add the body figures to `rules()`.

## MAJOR

**M1. S9: held-out supplements pass on the B2 paths (engine-run).** for_you "Take a spoon of Complan after the meal", Rescue move (kind move,
[]) "Have Threptin after the meal", menu tip "Have Revital with it": shown. Same for Becosules, Shelcal, Pediasure, Chyawanprash and
Liv 52. Fix with B2.

**M2. S8: household units are shown on paths `houseUnit()` does not read (engine-run).** One-tap change "Add 1 katori of curd." offered
(core.js:634 runs no unit check); menu ask "Ask for 2 phulkas instead of naan" and tip "Eat one katori of dal first." shown; plate subtitle
"2 phulkas and a katori of curd", for_you "A bowl of dal and 2 phulkas" and pairing tip "a katori of salad" shown; referral text "1 katori
of curd" (B3). Smallest fix: apply `houseUnit()` to every shown model field and clear the field.

**M3. S12: on a daylight-saving phone the day does not start at 4 am on the change days (engine-run).** `dayOf` (src/v6/engine.js:15)
subtracts four hours of milliseconds. TZ=America/New_York: 03:30 on 1 Nov 2026 counts as 1 Nov (that day starts at 03:00); 04:30 on
14 Mar 2027 counts as 13 Mar (that day starts at 05:00). Asia/Kolkata has no daylight saving and probes clean (23:59, 00:30 and 03:59
belong to the evening before; 04:00 starts the new day). Smallest fix: take the local date and step back one calendar day when the local
hour is under 4.

**M4. S12: four taps log before the new day is drawn (read, not driven).** "tuned" (app.js:401), "swapped" (app.js:417), "chosen" on the plate
list (app.js:501) and on the menu list (app.js:692) call `logEv` with no `dayMoved()` check, so a tap on yesterday's screen after 4 am logs
before the redraw. `buildFile` does not read these events, so no meal or figure changes; it breaks the letter of S12 ("before it logs
anything"). Smallest fix: `if(dayMoved())return;` first in each handler.

**M5. A test that cannot fail (read).** In `test/safety/check.js`, "S7 app ranking" on `hosted/v5/index.min.html` adds
`/hosted\/v5/.test(process.argv[2])` as its result when `healthOf` is not found, so on that page it passes without checking anything. The
v5 screens are not a release target, which limits the reach.

## MINOR

- m1. S7: `REFERTXT`/`REFERNL` (engine.js:611-613) miss "pergnant", "preganant", "5 months along", "having a baby in march", "I nurse my
  3 month old", "post natal", "just gave birth", "bachcha hone wala hai", "stanpan karati hoon", "kidney mein problem hai", "protein in my
  urine", "high creatnine" and Bengali script (the only other script run). `refer_reason` is still required on every reply to typed text
  (40 probes below hold), so a referral holds unless the model also misses.
- m2. S5 Rescue wording: "Eat the toppings, leave the base", "Have the dal like a soup", "Eat the gravy with a spoon" and "Make it a protein
  plate" pass `dropsGrain` when the model's deltaCarbs is small. 31 other grain-removing phrasings of mine were dropped.
- m3. S6 gap: Rescue moves hold no floor on medicines ("Eat about half the thali", 600 to 300 kcal, lunch usual 480), while menu moves do
  (engine.js:536). S6 does not name Rescue.
- m4. S6 gap: a tune request with no or an unknown slot gets `medsUsual` 0 (engine.js:623). The app always sends the slot.
- m5. A menu with one Latin dish and one Devanagari dish drops the Devanagari one without the "English letters" note.
- m6. Prompt text names barred foods: the B12 focus reads "dairy, egg, fish or meat" and the calcium focus "curd, milk, paneer"
  (engine.js:92) for vegan and dairy-free clients. Not shown; the output checks still apply.
- m7. The wheat word list (core.js:84) lacks "gehun", "gehu" and "gehoon", which the engine's own GRAINT and GRAINMATW read as wheat.
  Wheat left out: a base swap "Jowar bhakri" made of "jowar and gehun", and a grain made of "jowar with gehun", tagged [grain] only (a
  wrong tag), are offered. The app draws no `made_of`, so only the swap name shows.
- m8. Coverage: no case in `test/safety/check.js` negates a typed word on Rescue (B1), puts a held-out name in a field with no tags (B2, M1),
  sends [] on a name made only of `PLAINW` words (B4; "D1 fail closed" sends no list, never []), or hides a listed word with an invisible
  character (B6). "S1 shown fields" and "S1-S4 menu field alone" use listed words only. No state in `test/ux/review.js` unticks a Rescue
  move (B7), combines changes on medicines (B8), shows kept plates after the body figures change (B9) or runs in a daylight-saving zone (M3).

## COSMETIC

- c1. `docs/SAFETY-INVARIANTS.md` lists the Rescue move among tagged items, but `noFood` exempts kind "move" from the empty-list rule.
- c2. The previous `test/safety/AUDIT.md` is replaced by this one.

## Probed

All engine probes on np-core from `hosted/v6/index.min.html`, through `plan(kind).check()`, with my own vocabulary (regional names, Hindi
and English mixes, negations, invisible and full-width characters). About 530 engine probes and 5 driven screen runs:
- Rescue typed-word negation: 13 (10 counter-examples).
- Empty tag lists: 35 plate items (29 offered; B4 names the ones that should not be); 8 on menu order, side, swap, one-tap, Rescue sequence
  move and leave (7 offered, the side inconclusive).
- Fields with no tags, held-out names: 19 (17 shown); supplements on three such fields: 30 (27 shown).
- Sweet words with diabetes: 15 (none caught by the word net); referral text: 4 (4 shown).
- refer_reason on meals, Rescue, log and menu: 10 values each (missing, null, "", "None", "NONE", " none", pregnancy, kidney, other_urgent,
  none): 40, all hold; status "refer" with "none" on Rescue, log and menu: 3, all show `SAFETY`.
- Character tricks: 9 forms x 2 fields (14 passed); menu script: 2.
- Typed referral: 19 phrasings plus Bengali (14 of 20 sent to the model).
- Day boundary: 7 Asia/Kolkata times, 1 file build, 5 New York daylight-saving times.
- S5 Rescue wording: 35 phrasings x 4 kinds, plus the same 35 as kind move.
- S8 units: 6 fields. S6: tune slot and Rescue on medicines.
- Engine-written text: 8 dish taps, 4 prompts and the menu move line, for 10 profiles.
- Driven: Rescue untick with diabetes (B7) and the refusal of the two reducing moves; swap plus two changes on medicines without body
  figures (B8); kept plates after adding body figures, once with the profile set directly and once through the sheet's inputs (B9).

## Not inspected

- The live model and the Railway service (not available; not touched). Photos (menu, Rescue, log): no image path was probed.
- `test/rules/check.js` was run (it passes) but not read, so whether each of its cases can fail was not judged.
- core.js 195-475 (the grain test) beyond the calls made by my probes; S5 on plates, swaps, one-tap changes and menu orders was not probed
  (the rules check covers it).
- The prompt builders and the menu helpers (`grainAsk`, `soldItems`, `onlyInBarred`, `porGrain`).
- B8 with body figures and with meds "unsure" (read only); v5 screens beyond the shared core (not a release target).
- S10 beyond reading `viewOf` and `swapAt` against the review states; S11 beyond reading `askedFor`, `ansSig` and the tune check.
- M9 and M10 were taken from the existing tests and code reading only.
