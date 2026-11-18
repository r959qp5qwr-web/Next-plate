VERDICT: PASS
BUILD: 98ae28418025419214b46e93f6a1d2b313e4db50431e2fa94d0895b628c99c88

Safety audit of cad3fb0 (branch claude/nice-hawking-307ljy), 18 Nov 2026, after fix-r15 and fix-r16. Whole tree (src/v5/core.js,
src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) and the three safety suites, judged against
docs/SAFETY-INVARIANTS.md and the owner's decisions in its Tiers section, as written (two tiers; D1 "Fix found, then watch"; count words in
unknown languages watched; "Refer, as now"; D3; D4 "Model is backup"; 17 Nov menu reading removed and photos refused; 17 Nov "Block" leaves
the grading unchanged). The builder's summary, counts and mutation numbers were not taken on trust. The live model, the live site and
Railway were not called. test/ux/review.js was not run (its states were read where a finding needed them). No file was changed but this
one. The fingerprint was 98ae2841...c99c88 at the start, after the build and the safety run, and at the end.

Checks run on this tree. `npm run -s build`: the three pages rebuild and the fingerprint does not move. `npm run -s safety`: pass, exit 0
(check.js on the three pages, with 5,760 medicines-wording cells and 905 app strings; recorded.js 22,870 plate and profile checks, 15,433
plates shown; carve.js 1,190,139 cells; inject.js 162 leaves, 11 profiles, 31,567 cells; 35 Codex probes). `npm run -s rules`: pass.
`npm run -s words`: pass. `node eval/usefulness/bars.js`: four bars meet (plates 67 of 75; 2 requests with no plate, both sulfonylurea
meds-low; reason line 67 of 67; swaps and one-tap 259, 100 % of the live ones). `node eval/atrisk/replay.js .`: 204 live, 187 now (contents
10, diabetes-grain 3, meds-low 16; 8 menu calls left out), as on c666d34. From a scratch clone with OLDREF=c666d34: names-diff 0 of 3,627
plate-path names change and 2 Rescue cases change (the weight line of "Paneer butter masala with 2 butter naan", "300 g" to none: the old
m3's fix); grain grid 0 of 236; referral grid 0 of 1,187.

Were any tier-1 tests weakened? `git diff c666d34 cad3fb0` on test/safety and test/rules: check.js has 0 lines deleted and 223 added;
inject.js replaced its one loose figure rule ("a number, bounded by the engine") with per-value cells (stronger); recorded.js 11 added;
test/rules/check.js is unchanged; lexicon.json gained 54 lines (wheat words) and moved one comma; test/ux/review.js lost one comment
line, with the fix-r16 change. No assertion was removed or relaxed.

How findings were reached. "Engine-run" = a model-shaped reply or typed text through `plan(kind)` and its `.check()` in Node, on np-core
taken from hosted/v6/index.min.html, the code the server runs. App functions were taken from src/v6/app.js by name and run in Node, as
check.js does. "Mutation" = one text change in np-core (on hosted/v6/index.html) or in app.js, on a scratch copy, then check.js, inject.js,
recorded.js, codex.js and rules (engine) or check.js, codex.js and rules (app), stopping at the first suite that fails. "Recorded" = the
55 JSON files under eval/, walked as objects. Each finding below says its tier, whether a recorded reply shows it, and whether the
engine or app writes it alone or a model slip is needed.

0 BLOCKER, 0 MAJOR, 5 MINOR, 2 COSMETIC, a BACKLOG, 1 owner decision listed, owner questions, watch and deploy notes.

The verdict rests on these readings (each is the owner's to change):
- m2, first bullet: the app's call of `directive` with the client's profile has no test. This is a coverage gap with no counter-example
  (the rubric's MINOR): the engine-side scan can fail (the `hookSaid` mutant is caught) and the app's call is correct today. No review
  state renders Today's directive for an insulin profile at a late hour (read, not run). Read as "a test for a tier-1 property that
  cannot fail", it is MAJOR and the verdict is FAIL. Weaker supporting leg: the wording rule is not in the Tiers list.
- m1 (the Rescue weight line) is MINOR: S8 holds (grams), no S-rule says the weight describes the whole dish, and the last audit graded the
  first form of it MINOR. Read as a tier-1 figures-agree breach, it is MAJOR.
- m3 (a grain change with its carbs unchanged) conforms to S10 as written ("direction only, no tolerance figure"); it is MINOR as a
  design residue. Read as an S10 breach (a note "goes to 400 g" beside figures that did not move), it is MAJOR.
- The names in the BACKLOG are tier 2 by the Tiers section ("a wrong but non-empty tag on a name the lists do not know"). A tag left
  off is an empty list and is dropped on a plate item, a swap and a one-tap change (engine-run); on a Rescue dish the tag is not required
  (S15) and the word net alone reads the dish. "Chenna" has a live occurrence as a plate item name; see the BACKLOG.

## BLOCKER

None. The last audit's B1 (a swap or one-tap delta cut to -400 before the S6 check) is closed: see "Last audit's findings, checked again".

## MAJOR

None.

## MINOR

- m1. The Rescue weight line can show a weight that covers only part of the dish. Tier 1 in shape. Seen in recorded replies: 7 of the 27
  distinct recorded Rescue dish portion strings. Written by the engine's reading of an honest reply, no slip needed. Not an S1-S15 breach
  (S8 holds). `portionLine`, src/v5/core.js:1066, shows the one weight in the string unless it finds a second weight, a digit group, a
  range, a count before the weight ("2 x 150 g") or "each", "per", "apiece" or "a piece" after it. It does not look for a count or a second
  food that has no weight. The 7 recorded strings still show the curry's weight for an order that includes naans: "350g curry and 2 butter
  naan", "350g curry with two butter naans", "300g curry and 2 butter naan", "300g curry with 2 butter naans", "2 butter naan and 350 g
  curry", "2 butter naan and ≈ 350 g curry", "350g paneer gravy with two standard butter naans" (each shows "≈ 350 g" or "≈ 300 g"; the dish
  figures count the naans). Engine-run, shapes not in the recorded set: "60 g x 2", "60 g × 3", "150g x2", "60 g/piece", "3 rotis of 40 g",
  "two 150 g pieces" and "3 pieces, 40 g" show one piece's weight. The weight has no range: "5000 g", "99999 g", "1200g" and "7 g" are
  shown for a 500 kcal dish (the figure rule gives every other figure a range; the portion has none). Smallest fix: no weight line when the
  string holds any other number or number word beside the one weight (a count of pieces, "and 2 ..."), and none outside the 1 to 1,500 g the
  log already uses for an item. Tests to add beside the m3 cases of check.js: the 7 recorded strings, the after-count shapes above, "5000 g".
- m2. Two app mutants survive every safety check, rules and Codex probe. A coverage gap, no counter-example found; tier not applicable;
  not a recorded shape; app wiring, no model slip.
  - a_directive_profile: src/v6/app.js:346 `directive(profileOut(),pl,hk,meal,done)` changed to `directive({},pl,hk,meal,done)` passes
    check.js, codex.js and rules. The engine-side scan (check.js, 5,760 cells) calls `directive` with the right profile itself, so it does
    not see the app's argument. With `{}` the hook rule `hookSaid` has no condition to read and Today's directive says "it's late, so keep
    it light" to a medicines client after 21:30 again (engine-run: 26 of 96 quarter hours at dinner on the not-sure profile say it with
    `{}`, 0 with the profile). Review states (read, not run): none renders the directive for an insulin profile at a late hour (the only
    states that read `#directive` are 'plate-last-meal' and 'plate-day-done', at the current hour on the default profile). Smallest fix: a
    check that runs the app's Today card for an insulin profile at 22:30 and reads the directive, or a static guard on the call as for
    `act()`.
  - a_room120: `room>=120` to `room>=60` in `nextOffer` (src/v6/app.js:236) passes. The "My rule" test uses 40 kcal of room. The review
    states for the snack rule (test/ux/review.js:244-263: little left, medicines with and without a skipped meal, room left) were read, not
    run, and I did not check whether one sits between 60 and 120 kcal. This is the owner's rule (D10); the gap is that the 120 line is
    not tested at 119, 120 or 121 in the safety suite. Fix: cells at 119 and 120.
- m3. A one-tap change that moves the declared grain with its carbs unchanged is offered. S10, tier 1 in shape. No recorded occurrence: of
  432 distinct changes with grain_grams_after, 64 move the plate grain, and none has a carbs delta of 0. Written by the engine from the
  model's own figures, which disagree with each other (a model slip is needed, in an honest shape). Residue of the last audit's m2, which
  fix-r15 closed by direction only, as S10 now says. Engine-run: "Brown rice" 350 g, a change to 400 g with deltaCarbs 0 and deltaKcal -50
  is offered as "Brown rice goes to 400 g. About 50 kcal less." The test 'm2 ... by direction only' lists "grain up, carbs unchanged" as a
  control that must be offered. Smallest fix: a strict direction (src/v5/core.js:988 `after>dg.grams?x.deltaCarbs<=0:x.deltaCarbs>=0`);
  cost 0 of 64 recorded. It would also drop an honest change that rounds its carbs to 0 for a very small grain move, so the owner may
  prefer to keep the rule as it is.
- m4. A request with long typed text holds the server for seconds. Availability, not an S-rule. Pre-existing (the net read the raw text
  before). Written by the engine alone, no model involved, not in a recorded reply. `plan()` runs the referral nets on the whole raw text
  before `readCtx` cuts it to 240 characters (src/v6/engine.js:818). The kidney-bean and prego exemptions walk the neighbours of every match
  with `nbFits` (src/v5/core.js:578, called from engine.js:762 and :767), and the cost grows with the square of the count: doubling the text
  to 340 KB took 48 s. Engine-run: 170 KB of "red kidney beans " takes 12 s; 120 KB of "prego pasta " takes 4 s; plain food text of 1 MB
  takes under 100 ms. The app's boxes stop at 240, 160 and 200 characters, so only a hand-made request reaches it; the server has no body
  limit of its own (Bun's default) and an open server (no ACCESS_CODE) answers it. Smallest fix: answer `bad_request` for typed text over
  2,000 characters before the nets run.
- m5. In My food, unticking the last condition leaves the profile with no health value, and every request then answers `bad_request`. App
  logic, pre-existing, fails closed, no safety effect; no invariant covers it; not in a recorded reply; app-written, no model involved.
  src/v6/app.js:282 sets `P.health=healthOf(P.conds)` and `healthOf` returns null for no conditions (app.js:13, run in Node);
  `profileOut()` sends `health:null` (app.js:59) and `plan()` answers `bad_request` (engine-run for null, undefined and ""). The phone
  shows "Next Plate couldn't read that. Close it and open your link from WhatsApp again." with no retry (ERRS and NORETRY, app.js:125 and
  :131) until the client taps "None"; after a reload the set-up asks again (app.js:24 needs a health value). Reached by reading the
  handler and running `healthOf`, not by a tap on a phone. Smallest fix: `P.health=healthOf(P.conds)||"none"`.

## COSMETIC

- c1. The medicines prompt still carries hooks that ask for less. Written by the engine; no slip; not a recorded shape of the screen (the
  prompt is not shown). For a client on insulin at 22:30 the prompt holds both "[late_now] ... Keep it light and easy to digest, with a
  smaller grain portion" and "[goal_lose] ... lose weight gently" beside "every plate ... is at least 480 kcal (never below ...)"
  (engine-run). Nothing is shown from them and S6 holds (a plate under the usual size is dropped), but the model gets two instructions
  that disagree. Fix: leave `late_now`, `late_dinner` and `lighter_now` out of the prompt when `p.medsUsual` is set, as `hookSaid` leaves
  them out of the screen.
- c2. This file replaces the audit of c666d34.

## Owner decision, listed and not graded

- fix-r16, "My rule" (owner, 17-18 Nov; UX-CRITERIA D10): under 120 kcal left for the snack the card offers the next main meal ("Plan
  dinner", "Little is left for a snack today."), for a client on medicines too, unless that client skipped a meal today, when the snack
  stays offered (the low-sugar safeguard). Checked as built: `nextOffer` (src/v6/app.js:234-238) reads `onMeds()` (an unanswered question
  counts as "not sure") and a "skipped" entry of the day's meals; check.js "My rule" holds both sides, and mutants that remove the
  exception, widen it to every medicines client or to every client are caught. The 120 line itself is m2's second bullet.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a wrong but non-empty tag on a name the lists do not know, a phrasing the code does not list, a reading of meaning, or a reply
shape the schema forbids. Searched: every string under eval/ (55 JSON files), as a whole word in plate-path names (`food`, `add_item`,
`name`, item strings) and in typed texts.
- The log reads `"grams" in it` on each item and throws on an item that is not an object. Tier 2 (a reply shape the schema forbids). No
  recorded occurrence: all 30 recorded log replies hold object items. Engine; a regression from fix-r15 that fails closed. src/v6/engine.js:353
  and :361: for `items: ["roti","dal"]` or `[5]` the check throws "Cannot use 'in' operator" (the old test `it&&it.grams!=null` returned a
  reply). The server has no guard around `pl.check(r.data)` (src/v5/server.ts:112), so the request answers 500 and the phone shows its
  error. Nothing is shown or logged. Found by a fuzz of 12,000 mutated replies through meals, tune, Rescue and log (48,000 checks, 3
  profiles); these are the only throws. Fix: `it&&typeof it==="object"&&"grams" in it` in both places, and a try/catch around the check in
  the server that answers `{status:"error"}`. How a model would have to answer: items as a list of strings.
- S1-S4, names of my own shown with a "plain" tag. 509 names by their profile, 858 runs (8 profiles, plate item), 160 shown; read by hand,
  about 120 are foods the profile bars, the rest were my list errors (a ragi roti for a wheat-free client). The genuine ones: dairy-free:
  Chenna curry, Quark, Burrata salad, Perugu annam, Khir, Alfredo, Cheddar omelette, Gouda sandwich, Pizza, Thandai, Sheer khurma,
  Mozzarella, Mattha; wheat-free: Dumplings, Gujiya, Tabbouleh, Godhi dosa, Cornflakes with barley; nut-free: Macadamia, Nutella,
  Marzipan, Praline, Satay sauce, Verkadalai and Nilakadalai (peanut), Charoli, Trail mix, Dry fruit laddu; soya-free: Textured vegetable
  protein, TVP, Bhatmas, Bhatt ki dal, Natto, Teriyaki, Hoisin, Shoyu, Tamari; vegan: Aatu kari, Nandu, Eral (Tamil meat, crab, prawn),
  Gelatin dessert, Caesar dressing, Worcestershire, Belacan, Bone broth, Yakhni, Casein; Jain: Bateta nu shaak, Piyaz, Vengayam, Ullipaya,
  Poondu, Velluli, Zimikand, Gajjar, Muli, Chives, Pav bhaji, Vada pav, Pani puri; high BP: Aachar, Appala, Lonche, Urugai, Oorukai,
  Ganthia, Salted peanuts, Salted butter, Dried fish, Karuvadu, Sukha bombil, Sutki, Fryums, Vadam, Sandige, Happala, Kasundi, Idli podi,
  Gunpowder, Mor milagai, Sambar podi, Tomato ketchup; diabetes: Cookie, Muffin, Cupcake, Donut, Eclair, Candy, Toffee, Marshmallow,
  Cheesecake, Pepsi, Fanta, Frooti, Maaza, Rooh Afza, Sherbet, Aam panna, Nimbu pani, Jaljeera, Sweet curd, Sakkarai pongal, Pongal sweet,
  Seviyan, Aamras, Mango pulp, Motichoor, Pitha, Bobbatlu, Holige, Ariselu, Poornam, Adhirasam, Unniyappam, Date paste, Agave, Jam toast,
  Energy drink, Soda. On the swap and the one-tap add: 90 runs, 10 shown (Chenna curry, Mozzarella sticks, Cheddar cubes, Verkadalai
  sundal, Sweet curd, each on the swap and the add). How a model would have to answer: the dish named in one of these words with "plain"
  or another wrong tag. Recorded: "chenna" is a live plate item name ("Fresh chenna", "Fresh homemade chenna", "Fresh cow milk chenna",
  "Low-fat fresh chenna paneer": 6 distinct names in 5 records, none with a contains list, older shapes), so it is the first to add to
  the dairy list; "pizza" is recorded 8 times, "alfredo" once ("pasta alfredo"). Every other word above: 0 recorded plate-path names. Names
  the lexicon holds out on purpose or tracks already (Mor kuzhambu, Ricotta, Dim kosha, Payesh, Sharbat) are not counted as new.
- S7, new phrasings (D4: tier 2, model is backup). 157 phrasings of my own on meals, Rescue and log: 109 refer on all three kinds. Not
  referred, pregnancy: "EDD 12 March", "newly delivered", "just delivered", "I had a baby last month", "baby coming in 2 months", "8th
  month", "9 months gone", "delivery in a week", "labour pains", "labor started", "navmas", "saatva mahina", "prenatal vitamins"; kidney:
  "vrikka", "mootrapindam", "potassium restricted diet", "PD patient". Postpartum is an open owner question. Food controls that refer
  (the conservative side): "pregnant pause", "faint praise", "chicken kidney", "mutton kidney fry", "pasta without prego".
- S8, counts. Listed numbers pass; unlisted ones keep their count: "Pandrah roti" (15), "Bees chawal" (20), "Sawa roti", "Paun roti",
  "Pona roti", and the south and east words already on the watch list ("Moonu dosa", "Rendu dosa", "Onnu idli", "Naalu idli", "Anju appam",
  "Irandu idli", "Moondru dosai", "Naangu idli", "Pathu vada", "Dui roti", "Tin ruti", "Duto ruti", "Ondu bowl rice", "Oru plate meals").
  100 forms tried; every digit, bracket and English or listed Hindi count was taken off. 0 recorded.
- S1 negation: 46 negation names tried (dairy, wheat, nut, vegan): most fail closed or show the negated word alone, as designed; "Tadka with
  no butter or ghee" and "Veg pulao made without any dairy" are shown (a negation reading, tier 2).
- Urgent signs beyond the net, for the owner's scope question (not graded): "unconscious", "seizure", "stroke symptoms", "slurred
  speech", "vomiting blood", "overdose", "took too much insulin", "sugar 45" (no figure is used by design), "I am shaking", "vision going
  dark", "anaphylaxis", "throat swelling", "wheezing badly", "difficulty in breathing" all go to the model.

## Owner questions (named, not graded)

- Urgent-symptom scope: the insulin-profile default (one low-sugar sign typed by a client on insulin, tablets or not sure is referred with
  the line to get help now; the coordinator's default, not clinically reviewed). Checked as built: the phone and the server give one answer
  (360 comparisons, 0 differ), "hypo" and "sugar low" refer for everyone, a medicine's name alone does not. The BACKLOG list above shows
  what the net does not read.
- "Lime juice" and "Fresh lime juice" as a drink for a diabetic client; carbohydrate floors; potassium; transplant; postpartum; the
  grain floor's source; S6's upper limit; the rise band's source; whether wheat-free means gluten-free (rye, barley, malt: "Cornflakes with
  barley" is shown to a wheat-free client with a plain tag).
- Observation for the S6 owner question: over the 10,800 medicines cells the lowest usual size the prompt stated was 60 kcal (a snack for a
  small body or none given).

## Watch notes and deploy notes (not findings)

- A phone that already holds a lock (the daily limit or a refused code) sends nothing and reads nothing typed, so a referral typed there is
  not shown (not fixed; src/v6/app.js `rescue`, `logOther`, `askBlock`).
- A plate kept on a phone from an earlier build, the same day, keeps that build's clamped swap and change figures; the rules stamp holds
  rules, not the build. The day ends it (STORE resets at 4 am). Worth knowing on the day of the deploy.
- src/v5/server.ts header still mentions menu photos (`PHOTOS`); unreachable, as every kind refuses a photo before a prompt is built.
  `maxItems` in the schemas is configured and not validated against the live model. `null` for `prepMinutes`, `minutes` or
  `grain_grams_after` now drops the element (a figure the model writes is read as written): if the live model sends null for an unused
  field, plates or changes would drop; the recorded replies hold none (the bars do not move).

## Last audit's findings, checked again on this build

| Last audit (c666d34) | Result on cad3fb0 |
|---|---|
| B1 (S6): delta cut to -400 before the S6 check | Closed. Engine-run, insulin "yes", usual 680, plate at 1,110: a base swap with -399 or -400 is offered, -401, -440, -450, -500, 1e9, "-400" (a string) and null are not; a one-tap change of -300 with consistent macros is offered, -301 is not, because it takes the plate under 680. Mutations: swap and change kcal and carbs deltas back to a cut (4), plate kcal, item grams, swap grams, Rescue kcal back to `num` (4): all 8 caught (check.js or inject.js). |
| m1 Today's directive said "keep it light" | Closed in the engine: 27,648 directives (6 profiles x 6 day states x 4 meals x 96 quarter hours x 2) read with a wider word list than the suite's: diabetes and medicines profiles say none of light, lighter, late, skip, less, smaller, easy; the no-condition profile still does. The app's call is m2. Mutation of `hookSaid` out of `directive` caught. |
| m2 grain grams against carbs | Closed for the recorded case and the opposite directions; residue m3 above. |
| m3 Rescue weight read the first figure | Closed for two weights, digit groups, ranges, "2 x", "each", "per"; residue m1 above. |
| m4 offline typed referral | Closed. `api()` runs `typedReferral` before sending (src/v6/app.js:155); the callback is called at once and each caller that sends typed text (makePlates, rescue, logOther) sets nothing after the call; tune carries no text. 8 profiles x 15 texts x 3 kinds, phone against server: 0 differ; the same string 6 times in a row gives the same answer (no `g` flag state). Mutations: the call out, the profile left out: caught. |
| m5 other figures clamped | Closed. 27 plate and figure cases written by hand (subtitle 1,000 and 1,001; title 70 and 71; kcal as a string, 2,501; item grams 0, null, "100", 801, -5; prepMinutes 181, null, "20"; grain grams null and 1,501; 7 and 8 items): each as designed. |
| m6 12 app mutants survived | Closed: of the 31 app mutants run, 29 are caught, including the old survivors (S6 plate flag, rules stamp without leave-outs, conditions or body figures, bp from health, both wait guards, `blocked()`, the medicine default, both render clears, the one-tap and swap tap checks). 2 survive (m2). |
| m7 24 wheat dishes missing from the wheat list | Closed: 29 names (the old audit's and the forms beside them) are all dropped for a wheat-free client; mutations taking "roll" or "chappathi" out of the wheat list are caught. |
| m8 unanswered medicine question | Closed: `onMeds()` is `has("diabetes")&&P.meds!=="no"` (src/v6/app.js:48); mutation to the old form caught. |
| m9 subtitle cap | Closed: 1,000 shown, 1,001 dropped, a barred word at character 995 caught; mutation caught. |
| Last audit's owner question (insulin profile) | Built as the coordinator's default; see Owner questions. |

## Probed

- Menu path (dormant): `KINDS` is ["meals","rescue","log","tune"]; `plan()` gives `{error}` and nothing else for 23 kinds ("menu", "Menu",
  "MENU", " menu", "menu ", "menus", "menu/", "", null, undefined, 0, ["menu"], {}, "constructor", "__proto__", "toString",
  "hasOwnProperty", "valueOf", "meals ", "Meals", a line break, a zero-width space, a Cyrillic "e") by 7 bodies: 161 calls, 0 reach a prompt
  or a reply. Photos: meals, rescue, log and tune with 15 shapes (`image`, `photo`, `ctx.image`, `ctx.photo`, "yes", [], {}, 0,
  1, `photos`, `images`, `file.photo`, `camera`, `ctx.img`, `mime`): the first nine are refused on all four kinds; the other six keys
  build a text prompt with `image` false on meals, rescue and log (tune answers `bad_request` for these bodies, which carry no plate), and
  the server reads only `body.image`, which `plan()` has refused first. The page outside np-core offers no menu entry (check.js).
- S6: base swaps (10 deltas) and one-tap changes (11 shapes plus 4 consistent kcal deltas) on a medicines plate at the usual size plus 300
  or 430; a medicines profile over goals lose, hold and build, 5 body figures including none, 4 meals, 4 amounts eaten (0 to 9,000 kcal),
  3 appetites and 5 hours (00:30, 03:54, 04:00, 12:00, 23:54), meds "yes", "not sure" and unanswered: 10,800 cells, every prompt states
  the usual size as the floor and a plate 10 kcal under it is dropped; 0 problems.
- S5: 87 declared grains (millets, rices, idli, dosa, adai, rotis, pulse and nut flours, stand-ins, tubers) for a diabetic lunch, dinner
  and breakfast: stand-ins and pulse dishes drop; refined wheat and corn products stay as grains (the grain floor's source is an owner
  question).
- S1-S4: 858 plate runs (509 names) and 90 swap and add runs of my own names (BACKLOG); 46 negation names; the 4 example asks against 7
  profiles (the example ask "A light dinner after a heavy lunch" is off for insulin, not sure and unanswered, on for no medicine). Tag
  left off: a plate item with contains [], missing, null, a string or an unknown tag, and a plate with contains [] or missing, are dropped;
  a swap or a one-tap change with contains [] or missing is dropped; a Rescue dish with contains [] or missing is helped (S15).
- S7: 157 refer phrasings on three kinds and 35 food controls on meals; phone against server 360 comparisons; the 424 typed strings I could
  extract from the recorded replies read with a medicines profile: 0 more referrals than with none (recorded.js reads 14,209).
- S8: 100 count and measure forms through `showName` (BACKLOG). The swap index 0 is never applied by the app (`swapIn` skips it) and is
  labelled by the item on the plate, so a first swap that is not the original (9 of 788 recorded first entries carry deltas, all v5 shapes)
  changes nothing.
- Figures: 27 plate figure cases, 17 log cases (kcal 20 % rule, items 0, null, missing, 1,501, 9 items), 51 hand-made Rescue weight strings
  and the 27 distinct recorded Rescue portions (m1), a fuzz of 12,000 mutated replies run through meals, tune, Rescue and log, 48,000
  checks.
- Mutations, 68, each on a scratch page: 37 engine (33 caught) and 31 app (29 caught); the suite that caught each first: check.js 53,
  inject.js 8, codex.js 1, rules 0 (rules never caught one the others missed). The 6 survivors: 4 are equivalent (the plate-range test on
  a single swap and on a single change, because `pruneCombos` tests every swap and change alone and combined and the app never applies
  swap index 0; the kept plate's minutes default, because `checkTune` sets them next; the log item clamp, because the refusal above it
  already rejects any weight `given` rejects), 2 are m2.
- Read in full or in the parts named (long lines were cut at 300 to 900 characters by the viewer, so the longest lines were not read to the
  end): the diff c666d34..cad3fb0 for src/v5/core.js, src/v6/engine.js and src/v6/app.js; src/v5/core.js 96-330 (word lists, grain test);
  src/v6/engine.js 96-160 (hooks, directive), 286-305 (hookSaid, reasonLine), 332-360 (kept plate, tune, log), 594-602 (Rescue moves),
  760-836 (urgent nets, `typedReferral`, `medsUsual`, `plan`); src/v6/app.js 150-220 (`api`, `makePlates`, tune, `viewOf`, `swapAt`),
  452-489 (swap and one-tap handlers), 655-700 and 736-760 (Rescue, log), and every click handler by grep; src/v5/server.ts 40-131;
  src/v6/params.js in full; test/safety/check.js 183-200, 718-760, 846-875 and 945-1075 and the sections each mutant named;
  test/safety/inject.js 1-60.
- Figures: src/v6/params.js against handoff-next-plate.md ("Targets engine"): activity 1.3 / 1.4 / 1.55 / 1.725, deficits 300 and 500
  within 30 %, floors 1200 f / 1500 m, protein 1.0 / 1.2 / 1.4 g per kg with caps 1.6 and 1.5 for diabetes, fibre 15 (diabetes 20) per
  1000 kcal, split 27 / 40 / 5 / 28; on insulin or sugar tablets no deficit (the plates hold the weight). They agree; no diff since
  c666d34. No clinical figure is judged.

## Not inspected

- The live model, the Railway service and the server's security items (no access code is checked here beyond the order in server.ts).
- The screens: test/ux/review.js was not run; app states were run as functions in Node, not in a browser. A swap or change tapped on a
  phone, the sync callback of `api()` on a page in a browser, and the focus and scroll behaviour were read, not run.
- S11, S12 and S14 were not re-probed this round (no diff to their code; held by check.js, which passes and whose mutants in this area
  were caught).
- src/v5/core.js 1-96 and 330-855 beyond what the checks and probes exercise (the negation and count code), and 1070-1204 beyond the diff;
  src/v6/engine.js 1-96, 160-286 and 360-760 (menu code, dormant); src/v6/app.js 1-150, 220-450, 490-650 and 770-816 beyond the diff and
  the handlers; the v5 screens' own markup; src/v6/plate.js; the Builder beyond check.js's S14 states; carve.js's grid was run, not
  re-derived.
- The lexicon's own entries were not re-read word by word; the lexicon floor check and the held-out guard were run.
