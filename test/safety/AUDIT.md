VERDICT: FAIL
BUILD: f74dfb4386f8da5ac40d626aaeebba0e44b26dfb25131a7e9b66cffeb26754c0

Safety audit of c666d34 (branch claude/nice-hawking-307ljy), 17 Nov 2026, after fix-r14 (every check reads the whole raw model field;
over a cap drops; Rescue refuses the supplement tag and reads the typed text and the dish name apart; plates over seven items drop;
test/safety/inject.js). Whole tree, two tiers, judged against docs/SAFETY-INVARIANTS.md and the owner's decisions recorded there (Two
tiers; D1 "Fix found, then watch"; count words in unknown languages watched; "Refer, as now"; D3; D4 "Model is backup"; 17 Nov "Remove
menu reading"). The menu code is dormant: its reachability was checked and nothing inside it was graded. The builder's summary, counts
and mutation numbers were not taken on trust. The live model, the live site and Railway were not called. No repository file was
changed but this one.

Checks run on this tree. `npm run -s build`: the three pages rebuild and the fingerprint does not move. `npm run -s safety` (check.js,
recorded.js, carve.js and inject.js on the three pages, then codex.js): pass, exit 0 (recorded.js 22,870 plate and profile checks, 15,433
plates shown; carve.js 1,175,316 cells; inject.js 162 leaves, 11 profiles, 15,122 cells; 35 Codex probes). `npm run -s rules`: pass.
`npm run -s words`: pass. `node eval/usefulness/bars.js`: four bars meet (plates 67 of 75; 2 requests with no plate, both
sulfonylurea meds-low; reason line 67 of 67; swaps and one-tap 259). `node eval/atrisk/replay.js .`: 204 live, 187 now (contents 10,
diabetes-grain 3, meds-low 16; 8 menu calls left out), as on 7eaadcf. From scratch copies with OLDREF=7eaadcf (read-only `git show`):
names-diff 0 of 3,627 plate-path names and 34 Rescue cases change; grain grid 0 of 236; referral grid 0 of 1,187. test/ux/review.js was
not run (the UX Critic's scope); review states were read where a mutant needed them. The fingerprint was f74dfb43...26754c0 at the
start, after the build and after all probing.

How findings were reached: "engine-run" = a model-shaped reply or typed text through `plan(kind)` and its `.check()` in Node, on np-core
taken from hosted/v6/index.min.html, the code the server runs; app functions were taken from src/v6/app.js and run in Node the way
check.js does. "Mutation" = one text change in np-core (or in app.js and the page's app script), on a scratch copy of the built page,
then check.js, inject.js, recorded.js, codex.js and rules (engine) or check.js, codex.js and rules (app). "Recorded" = the JSON files
under eval/ (55 files), walked as objects, or grep with word boundaries on quoted strings, as each finding says.

1 BLOCKER, 0 MAJOR, 9 MINOR, 2 COSMETIC, a BACKLOG, owner questions.

The verdict rests on these readings (each is the owner's to change):
- B1 is tier 1 by the letter of the tiers: an honest reply, not built to break a filter, and the breach is the engine's own clamp. It
  needs figures beyond any recorded one (below). Read as tier 2, it goes to the backlog, and the verdict is PASS if the m6 reading
  below also stands.
- m6's rules-stamp item is graded MINOR as a test with too narrow a case (the stamp tests fail when the comparison goes, not when the
  stamp loses a rule), as the last audit graded its M1 note; read as "a test for a tier-1 property that cannot fail", it is MAJOR.
- m1 (Today's directive) is graded against the wording rule of the SAFETY-INVARIANTS table, not S6; read under S6 it is a BLOCKER.
- m2 (grain grams against a change's figures) is graded as the model's own figures applied as given (as b4633dd m4 and 530a503 m1),
  not as the engine losing the tie between consistent fields (ba4d8dc M2, MAJOR); read the second way it is MAJOR.
- The insulin profile with one typed low-sugar sign is an owner question (urgent-symptom scope), not a finding; if S7's "low-sugar
  signs with insulin" includes the profile, it is a tier-1 S7 counter-example.

## BLOCKER

**B1. S6 (tier 1 by the letter; no recorded occurrence of the figures). On insulin or sugar tablets, a swap or one-tap change that takes
the plate under the usual size by the model's own figures is offered, because the engine cuts its kcal delta to -400 before the S6 check
reads it; the screen and the log then show 40 to 50 kcal the model did not write.**
- Where: `swapList` and the one-tap block in `checkMeal`, src/v5/core.js:923 and 937 (`delta(s.deltaKcal,-400,400)`,
  `delta(a.deltaKcal,-400,400)`; `delta` at core.js:858 clamps). The S6 checks (core.js:924 `n.kcal+s.deltaKcal<low`, core.js:941) and the
  app's `composedWhy` (app.js:82) read the clamped figure. deltaCarbs is clamped too (swap -80, change -80 to +40).
- Engine-run through `plan('tune').check()` and the app's `viewOf` and `plateWhy`, with replies whose figures agree and in which only
  the kcal delta is past its cut: insulin "yes", lunch, usual size 680 kcal.
  - Base swap: plate of 1,100 kcal (200 g moong dal, 350 g brown rice, 100 g salad; 40 g protein, 168 g carbs, 30 g fats); swap "Bajra
    roti" 80 g, made of bajra, -440 kcal, -4 g protein, -80 g carbs, -12 g fats. Offered as -400; tapped, the app shows and would log 700
    kcal (200 g moong dal, 80 g bajra roti, 100 g salad) and refuses nothing. By the model's figures the plate is 660 kcal, under 680.
  - One-tap change: plate of 1,110 kcal (paneer tikka, 300 g brown rice, salad; 40 g protein, 160 g carbs, 35 g fats); "easier to
    digest", adding nothing, -450 kcal, -10 g protein, -35 g carbs, -30 g fats. Offered as -400; the app accepts it at 710 kcal against
    the model's 660.
  - Control: the same replies on a scratch np-core with the two kcal cuts widened: the engine's own S6 lines (core.js:924, 941) drop both.
    The breach is the cut.
- The same cause on S5 as the app implements it, for any client with diabetes, no medicines needed: the swap's carbs delta is cut to
  -80 (core.js:923). Diabetes, lunch, the plate above, swap -400 kcal and -100 g carbs: shown at 88 g carbs, over the app's half line of
  84 (app.js:81), and accepted; with the cut widened it shows 68 g and the app refuses it ("With diabetes the grain stays, at least half
  of it"). The grain item itself stays (80 g bajra roti). Recorded swap carbs deltas run -36 to +32 g.
- Why tier 1: the reply is honest in shape (consistent figures, a grain swap the prompt asks for) and not built to break a filter; the
  breach is the engine's cut, the shape the fix-r14 raw-field rule was written against ("never cut to fit"), applied there to text and
  not to figures. The last engine-logic findings with no recorded occurrence (ba4d8dc M2, 7eaadcf M2) were read as tier 1 the same way.
- How often: it needs a medicines plate at least 400 kcal over its usual size (the prompt asks for "up to 10 percent above") and a swap
  or change of more than 400 kcal. Recorded: 1,197 swaps run -120 to +130 kcal, 847 one-tap changes -130 to +210, 1,326 plates 75 to 815
  kcal (distinct objects in the JSON under eval/). The largest recorded delta is about a third of the cut.
- The tests cannot see it: no check writes a delta past its cut on a medicines plate; inject.js writes no figure leaf ("figure: a
  number, bounded by the engine").
- Smallest fix: take a swap's or change's figures as given or drop it, as the log does (`given`, src/v6/engine.js:336): a delta outside
  its range drops that swap or change. Test: on a medicines plate at usual + 430, a base swap and a one-tap change of -440 and -450 kcal
  are not offered; for diabetes at lunch, a swap of -100 g carbs that takes the plate under half its carbs is not offered; controls:
  -390 kcal and -60 g carbs offered when the plate stays above the usual size and half its carbs.

## MINOR

- m1. Today's directive tells a client with diabetes or on medicines "it's late, so keep it light" (tier 1, engine logic alone; not in
  a recorded reply, as it is engine-written). `directive` (src/v6/engine.js:146-159) picks its tail from the day's hooks by its own
  order (line 155: late_now first, then lighter_now, late_dinner) and does not use `hookSaid` (engine.js:292), the rule the reason line
  and "Planned around" share ("with diabetes or medicines a "lighter", "skip", "late" or "less" hook is not said", SAFETY-INVARIANTS
  table, final audit c1). Engine-run: insulin "yes" and "not sure", and diabetes with no medicine, dinner planned at 22:30: "Dinner:
  about 600 kcal and 28 g protein; it's late, so keep it light." The directive card is drawn on the Plate tab (app.js:330-338) for any
  dinner planned from 21:30 to 4 am. Graded MINOR, not under S6: the figure in the same sentence is the usual size or more (planDay
  holds the floor, engine.js:78), every plate under it is dropped, and S6's text is about the prompt and the sizes; the wording rule the
  table states is broken on a third surface the table does not list. No test reads the directive on a diabetes or medicines profile.
  Smallest fix: in `directive`, skip a hook `hookSaid(id,p)` refuses (p carries health and medsUsual, as in the app's `hookProf`); test:
  late dinner, insulin yes and diabetes alone, no "light" or "lighter" in the directive; control with no condition keeps it.

- m2. A one-tap change's grain grams are not tied to its figures (S10, tier 1 in shape: model figures that disagree with each other;
  seen in a recorded live reply). The engine writes "<grain> goes to N g" or "<grain> is left out" from `grain_grams_after`
  (src/v5/core.js:954) and the app sets the grain item to N grams or takes it off the plate (app.js:198), while the plate's figures move
  only by the change's own deltas; nothing checks that the carbs move the same way as the grain. Recorded: "Gujarati Toor Dal with Bajra
  Rotla", express change "(one pot dal khichdi)" (eval/v5/results-live-r37.json): Bajra rotla 80 g to 120 g with deltaCarbs -2 and
  deltaKcal -15, so the plate on screen holds 40 g more grain and fewer calories. That record lacks contains on its changes and is
  dropped on this build; engine-run with honest tags added (as inject.js's base plate does), the change is offered: "Bajra rotla goes
  to 120 g. Ready in about 10 minutes. About 15 kcal less." Engine-run: a protein change
  adding 50 g paneer with grain_grams_after 0 and deltas +140 kcal, +2 g carbs is offered ("Jowar roti is left out"); the app shows dal
  and salad only, at 760 kcal and 97 g carbs. Graded as the S10 residue of b4633dd (m4) and 530a503 (m1), both MINOR: the
  engine applies the reply's own grain grams and its own deltas as given, and the two disagree; ba4d8dc M2 (MAJOR) was the engine
  losing the tie between consistent fields, which is not this. Unlike that residue, a sign check can tell this one. Recorded: of 64 changes that move a declared grain, 63
  lower it and all 63 lower carbs; 1 raises it, and that one lowers carbs. Smallest fix: offer a change that lowers the declared grain's
  grams only with deltaCarbs below 0, and one that raises them only with deltaCarbs above 0, as the no-grain case already ties a
  change to the listed grain (core.js:949-953); costs 0 of the 63 and drops the 1.

- m3. The Rescue portion line reads only the first grams figure (tier 1; seen in recorded replies). `checkRescue`, src/v5/core.js:1023,
  takes the first "<number> g". Recorded: "1 bowl curry (300g) with 2 naans (180g)" and "1 bowl curry (300 g) with 2 naans (180 g)" (2 of
  27 distinct recorded Rescue portions) show "about 300 g" for a 480 g order. Engine-run: "1,200 g" shows "about 200 g"; "250-300 g"
  shows "about 300 g". S8 holds (grams); the figure is wrong. Smallest fix: no portion line when the text holds more than one weight or a
  digit group ("1,200"), as the raw-field rule drops what it cannot read whole.

- m4. A typed referral is not shown when the request fails (S7, tier 1, app logic; no counter-example to S7 as written). The app never
  calls `referTyped` (0 calls in src/v6/app.js); referral is the server's (`plan`, engine.js:792). Offline, on a timeout, or with a
  refused code (src/v5/server.ts:87 answers 401 before `plan`), typed "I am pregnant" or "chest pain" on the Plate ask shows "Your ask
  ... didn't go through. Couldn't reach Next Plate just now. Check your signal. Showing the plates from before." (app.js:167-168, 531),
  and on Rescue and the log the same error with Try again. Nothing is planned from the text, and the kept plates were made before it,
  as after a referral ("Back to my plates", app.js:529); the review states plate-ask-offline, rescue-offline and sheet-log-offline
  approve the offline wording with food text only. The server refers before it counts a limit (server.ts:88-90), but once the phone holds a lock
  only the ask box is read-only; Rescue and the log take typing with send off, so that path is not reached from a locked phone. Graded MINOR because no plan answers the disclosure; the urgent line is the one the client misses most.
  Smallest fix: run `referTyped` and `urgentTyped` on the phone before sending (np-core is on the page) and show the referral card at
  once; test: the three boxes, offline, with kidney, pregnancy and urgent text.

- m5. Other figures are clamped too, so a figure the model did not write can be shown (tier 1 in shape; mostly not recorded). `num`
  (src/v5/core.js:857) clamps a number and reads null, "" and a negative number as the bottom of the range, while a missing key or a
  word ("x") is NaN and drops. Engine-run: an item's grams 0, null, "" or -5 show "1 g" (core.js:895), so the plate's "no grams" drop
  (core.js:899) fires only for a missing key or a word; add_grams 0, null, "" or -5 with a named add_item give "Add 1 g paneer cubes"
  (core.js:938); a one-tap protein delta under -10 g shows as -10 (core.js:937). Recorded: 0 of 5,757 plate items with grams 0 or
  missing; 0 recorded replies carry add_item (the v6 tune fields have no live sample); 2 recorded one-tap changes (v5 shape, dropped now
  for missing contains) have deltaProtein -22 and -23, which this engine would show as -10. Smallest fix: B1's fix for every figure.
- m6. App guards with no test in `npm run safety` (no counter-example; mutation, scratch copy):
  - the S6 plate flag in `composedWhy` (app.js:82, `o.plate`): taking it out passes check.js, codex.js and rules. It refuses a kept base
    plate under the usual size; within one build the usual size moves only with answers that are in the rules stamp, so it is reached
    only by a plate kept from an earlier build the same day (a PARAM change). check.js "m1 app S6" tests a composed plate under its base.
  - the rules stamp's contents: `rules()` (app.js:734) with the leave-outs, the conditions or the body figures taken out passes check.js
    (789-794), codex.js, rules, and would pass the review state plate-rules-reload (review.js:216), as both compare against a
    hand-written stamp of another shape. Today's `rules()` holds all of them. A test that builds the stamp before and after one tick
    each (dairy, a condition, weight) would hold it. MINOR, not MAJOR: the tests do fail when the comparison is taken out (final audit
    m4), so this is a test with too narrow a case, as the last audit's M1 note graded the Rescue supplement test.
  - `profileOut` reading high BP from the ticks (app.js:57, `bp:has("bp")`): reading it from `P.health` only passes check.js, codex.js and
    rules; for diabetes with high BP that would drop S3 on every request. No review state ticks both. A test like check.js "S7 app
    ranking" (line 425) for the bp flag would hold it.
  - the wait guards of `makePlates` and `logOther` (app.js:163, 745): not caught by the safety suite; held by the review states
    plate-loading-changed and sheet-log-day-changed (read, not run: each fails when only one request is made).
  - `blocked()` (app.js:54) off: not caught here; the server still refers a ticked kidney condition or pregnancy, and the review states
    plate-blocked-kidney and plate-two-conditions-referred read the blocked card.
  - the default for an unanswered medicine question (`P.meds||"unsure"`, app.js:57): reading it as "no" passes check.js, codex.js and
    rules, and would take the S6 floor off in the state m8 describes.
  - the one-tap tap check (app.js:447) and the render-time clears (app.js:536, 696): each alone passes the suite; the state they refuse
    is still refused by the other and by the log-time check, so no refused state is shown or logged (the refusal note is lost).

- m7. A wheat spelling or wheat dish the engine's own grain-dish list knows is not in the wheat list (S1, the shape of the last audit's
  backlog head; tier 2 by D1, as no recorded reply leaves the wheat tag off one). `GRAINT` (src/v5/core.js:142) holds chappathi,
  chapathy, ruti, parotha, bhatoora, kochuri, "chow mein", sandwich, roll, frankie, dabeli, thukpa, khubz, kuboos, penne, macaroni,
  orzo, ravioli, lasagne, gnocchi, sub, pancake, cracker and flatbread; the wheat list (core.js:97-106) does not. Engine-run, wheat left
  out, tag "plain", plate item: 24 of 27 are shown ("Chappathi", "Ruti", "Parotha", "Bhatoora", "Kochuri", "Veg chow mein", "Veg
  sandwich", "Kathi roll", "Macaroni" and the rest). Recorded: "Veg Spring Rolls", "Egg Mayo Sandwich", "Grilled Veg Sandwich", "Penne in
  Pesto with Pine Nuts" and two cakes are recorded menu dish names, each tagged wheat by the model; no plate-path name. Graded MINOR, not
  for the 24 names (they are tier 2, BACKLOG head) but for the missing check: fix-r14 holds the S8 piece list and the food lists together
  by a check, and the grain-dish list has no such check. Smallest fix: list the wheat forms of GRAINT in the wheat list (or name each
  held out with its reason), and add the same check for GRAINT.

- m8. An unanswered medicine question is read two ways in the app (tier 1, app logic; S6-adjacent; no counter-example to S6 itself).
  Run in Node from app.js: conds ["diabetes"], meds "": `onMeds()` (app.js:48) gives false, `profileOut().meds` (app.js:57) gives
  "unsure". Reached from My food: ticking Diabetes after set-up, or unticking and ticking it again (app.js:272 clears the answer), leaves
  the question unanswered, as Done does not ask for it (app.js:785; set-up does, app.js:310). The S6 floor holds (the server and
  `composedWhy` read "unsure"), but the skipped-meal low-sugar warning (app.js:399, 485) and the rule that keeps the snack after a skipped
  meal (app.js:225) are off. Smallest fix: `onMeds()` as `has("diabetes")&&P.meds!=="no"`, with a check beside "S7 app ranking".

- m9. The subtitle is read whole with no cap (the coordinator's judgement call). Engine-run: a 60,000-character subtitle takes about 1.4 s
  per plate, 200,000 about 16 s (the negation reading grows with the length). The meals schema has no subtitle field and the reply is
  bounded by 16,384 output tokens, so about 60,000 characters at most. No safety effect; the check is slower on a runaway reply.

## COSMETIC

- c1. The watch list in docs/SAFETY-INVARIANTS.md ("Watch list after the safety audit of 7eaadcf") does not carry the last audit's 179
  unlisted names offered with a "plain" tag (Macaroni, Muffin, Nutella, Mozzarella, Shami kebab, Aachar, Nimbu pani and the rest); they
  are not in the engine and not on the record. The "Where every shown string comes from" table has no row for Today's directive (m1).
- c2. This file replaces the audit of 7eaadcf. Deploy notes, not findings: src/v5/server.ts's header still mentions menu photos
  (`PHOTOS`, "a menu photo when given"), unreachable as every kind refuses a photo first; `maxItems` in the schemas is configured and not
  validated against the live model.

## BACKLOG (tier 2, the watch list; none fails the audit)

Each needs a tag left off or a wrong tag on a name the lists do not know, a spelling or phrasing the code does not list, or a reading of
meaning, with no recorded occurrence of the slip. Searched: quoted strings in the JSON under eval/, grep with word boundaries, for each
word or phrase below; counts are given where there is any.
- Head of the list: the 24 GRAINT wheat names in m7 ("Chappathi", "Ruti", "Parotha", "Bhatoora", "Kochuri", "Veg chow mein",
  "Veg sandwich", "Kathi roll", "Macaroni" and the rest), shown to a wheat-free client with a "plain" tag; every recorded one is tagged wheat.
- S1: "Maida-free cake" is shown to a wheat-free client (the "-free" reading before "cake" takes "maida" off, but a maida-free cake is
  usually atta); "Toasties" (a plural `foodRx` does not form) and "Nutty granola" ("nutty" and "granola" unlisted). 0 recorded
  ("maida-free", "atta-free", "toasties", "granola": 0; "nutty": only in notes).
- S9 on Rescue with a wrong but non-empty tag: typed "Threptin", "Prohance", "Supradyn", "Neurobion", "Revital", "Limcee",
  "Chyawanprash", "Fast and Up", "Ensure Diabetes Care", each tagged dairy, are helped; tagged "supplement" each is refused. 0 recorded.
- S7: "eating for two now" goes to the model (a new pregnancy phrasing, D4). 0 recorded.
- S8: a Hindi number before a food outside the piece list keeps its count ("Saat badam", "Aath kaju", "Nau kishmish", "Das badam",
  "Gyarah badam"); unlisted forms "Pao kilo paneer" (the detector flags "kilo"), "Sawa roti", "Doh roti", "Dona of chaat". 0 recorded
  (Hindi numbers before badam, kaju, kishmish, almonds, dates, kilo: 0).

## Owner questions (named, not graded)

- Urgent-symptom scope: a client whose profile says insulin or sugar tablets (or "not sure") who types one
  low-sugar sign is not referred: "I feel shaky", "feeling dizzy, what to eat", "sweating a lot right now", "I'm very shaky", "feeling
  giddy", "chakkar aa raha hai", "pasina aa raha hai", "I feel weak and shaky", "my hands are trembling", "feeling confused", "blurred
  vision" all go to the model (11 of 11), as `urgentTyped` (engine.js:780) needs the medicine word in the text. The app's own medicines
  warning (app.js:50) names shaky, sweaty and dizzy as the signs to act on. If S7's "low-sugar signs with insulin, tablets or sugar"
  includes the profile, this is a tier-1 S7 counter-example; a fix would read the profile's own answer in `plan` (diabetes with meds
  "yes" or "unsure"; `p.medsUsual` is not yet set where the text is read, engine.js:792 against 801). 0 recorded. Also engine-run: a
  model referral with refer_reason "other_urgent" ("sugar 52 after insulin", which the net does not read) gives the referral line with
  no line to get help now on meals, Rescue and log.
- From the brief: "Lime juice" and "Fresh lime juice" as a drink for a diabetic client; carbohydrate floors; potassium; transplant;
  postpartum; the grain floor's source; S6's upper limit; the rise band's source.
- The judgement calls of fix-r14, measured: the three silent leaves hold "nothing shown" (engine-run: a scoop of whey in the Rescue
  portion text is not read and not shown; "Paneer biryani with raita" as the model's dish name for typed "Veg biryani" shows "Veg
  biryani" to a dairy-free client; "whey protein shake" in a log item is shown only because the client typed it). The tune path not
  reading the kept plate's engine-written title and subtitle loses no check (the items are read apart; nothing shown comes from those
  two fields). Kuttu and rajgira count as a diabetic's grain (pseudo-grains; the last audit found rajgira offered).

## Last audit's findings, checked again on this build

| Last audit (7eaadcf) | Result on c666d34 |
|---|---|
| B1 swap made_of blanked | Closed. Engine-run: the last audit's base swaps (Thalipeeth, Bhakri, Muthia, Methi muthia with wheat, maida or soy beside a pulse flour) are dropped for wheat-free, soya-free (where soy is named) and Jain wheat-free clients, 12 of 12, each with a control "Ragi roti" swap offered and the tune check ok. Mutations: made_of out of the swap reading caught by inject.js (104); out of the plate reading caught by check.js and inject.js (275). |
| M1 Rescue supplements | Closed for the honest tag and the brand names: typed "Ensure", "Boost", "Tang", "Boost shake" with any dish name, and 9 names tagged "supplement", are refused. Unlisted names with a dairy tag are BACKLOG. Mutations: the tag check out caught by inject.js; the two texts joined caught by inject.js. |
| M2 eighth item | Closed: an eight-item plate is dropped (shape). Mutation caught by check.js. |
| m1 log-time guards | Closed: mutation of each "I'll have this" guard to `act(null, ...)` (plate and Rescue) is caught by check.js ("the log-time guard of each ... runs the composed check"). |
| m3 made_of cap and clean | Closed: made_of is read raw to 40 characters and over 40 drops; mutation of the cap caught by check.js and inject.js. |
| m4 S13 drop | Closed: a plate at 900 kcal with macros worth 540 is dropped (energy). |
| c1 "Egg whites of eggs" | Open (engine-run: "Egg whites of 3 eggs" shows "Egg whites of eggs"; watched). |

## Probed

- Menu path (dormant): `KINDS` is ["meals","rescue","log","tune"] on all three pages; `plan()` gives `{error}` and nothing else for 22
  kinds ("menu", "Menu", "MENU", " menu", "menu ", "menus", "menu/", "", null, undefined, 0, ["menu"], {}, "constructor", "__proto__",
  "toString", "hasOwnProperty", "valueOf", "meals ", "Meals", "rescue" with a line break, "log;") by 6 bodies (typed menu, photo, kidney
  profile, pregnancy text, empty, none) on each page: 396 calls. Photos: meals, rescue, log and tune, each with `image`, `photo`,
  `ctx.image`, `ctx.photo`: 16 refused on each page; on tune again with a shown plate, so the photo is the cause: 4 refused, the control
  builds its prompt. The v6 pages outside np-core offer no menu entry; the v5 page draws its camera
  labelled "Photo of the menu" (documented, not a release target). server.ts routes POST /api/<kind> only for `KINDS`.
- S1-S4, tags left off: 265 names of my own (hyphen and compound forms, plurals, Hindi and English mixes, regional dairy, wheat, nut,
  soya, meat, fish, egg, Jain, salty and sweet names, exemption neighbours) by the profiles that bar each (482 name and profile pairs), as
  plate item, swap and one-tap add: 1,446 runs, 9 shown from 3 names (BACKLOG). 27 GRAINT wheat names (m7). Every recorded plate item, swap and change
  delta measured against the clamps (m5).
- S5: 46 declared grains for a diabetic lunch (stand-ins, pulse and nut flours, keto and grain-free rotis, tubers dropped; millets,
  brown and red rice, idli, dosa, adai, oats, quinoa, rava idli kept).
- S6: the clamp at its bound (B1): a base swap of -440 and -450 kcal on lunch, dinner and breakfast plates 420 to 430 kcal over the usual
  size, a protein swap and a one-tap change of -450 (the first runs were refused by the app only because the test plate's fats went
  negative; with figures that agree, the one-tap change is accepted at 710 kcal, B1), and the widened-cut control.
- S6: a medicines profile (goal lose, 90 kg) at dinner with 0 to 9,000 kcal eaten, appetite 1 and 10, at 00:30, 02:00, 03:59, 20:00 and
  23:54, a late-dinner pattern and an eaten-out lunch: every prompt states "at least" 540 kcal or more; a 530 kcal plate is dropped
  (meds-low), a 580 kcal plate shown. A base swap and a one-tap change each 100 kcal down, each offered alone above 540, refused
  together by the app's `plateWhy` (490 kcal). Rescue portion moves never under the usual size (check.js and mutation).
- S7: 96 refer phrasings of my own (35 kidney, 37 pregnancy and breastfeeding, 24 urgent; Hinglish and misspellings) on meals, Rescue
  and log: 95 refer on each ("eating for two now" goes to the model). 19 food controls: 3 refer, each the conservative side ("rajma means
  kidney beans right", "pregnant pause", "chicken kidney fry"). 11 single low-sugar signs for an insulin profile (owner questions).
- S8: 98 count and measure forms through `showName`, each read again by test/safety/measure.js: 1 flagged ("Pao kilo paneer"), and the
  Hindi counts before non-piece foods (BACKLOG).
- S9: 13 supplement names typed on Rescue with 4 name and tag pairs (52 runs); the three silent leaves (owner questions).
- S10: an eight-item plate (dropped) and its control, a seven-item plate (shown, 7 items); the grain-change figures (m2); swap and change states through the app's `viewOf`.
- S12: `dayOf` at 23:59, 00:00, 03:59:59, 04:00, 02:00 on New Year's Day, 23:30 on New Year's Eve, 04:00 on New Year's Day and 01:00 on 1
  March, in UTC and Asia/Kolkata; `buildFile` at 03:30 counts a dinner logged at 01:00, at 04:05 starts an empty day.
- Rescue portion text: every recorded Rescue portion (27 distinct) and 4 shapes of my own (m3).
- Mutations, 44 (22 engine, 22 app), each on a scratch page:
  - engine (check.js, inject.js, recorded.js, codex.js, rules), 21 caught: items over 7 (check.js); plates over 4 (check.js); swaps over
    3 (check.js); the Rescue supplement tag (inject.js); the Rescue texts joined (inject.js); the plate grain made_of cap (check.js,
    inject.js); the one-tap name shape (check.js, inject.js); log items over 8 (check.js, inject.js); plate made_of not read (check.js,
    inject.js); swap made_of not read (inject.js); the Rescue portion floor on medicines (check.js); the tune slot on medicines
    (check.js); text in another script read (check.js, inject.js); "not sure" read as no medicine (check.js); the meal floor on
    medicines in planDay (check.js, codex.js); typed text not folded before the referral (check.js); the photo flag (check.js); the log's
    refer_reason (check.js); the diabetic base swap's grain rule (rules); the 30 g grain floor (recorded.js, rules); the Rescue dish name
    over its cap or not text (inject.js). Not caught, equivalent: `hookSaid` without its medicines clause, as `medsUsual` is 0 unless the
    client has diabetes, so the diabetes clause covers it.
  - app (check.js with NP_APP, codex.js, rules), 10 caught: S5 grainGone; pruneKept's base check; the tune and Rescue wait guards; act()'s
    day check; the day change dropping Rescue and log answers; the conditions' order; "Planned around" through hooksSaid; the two
    log-time guards of "I'll have this" (each check.js). Not caught, 12: the S6 plate flag; rules() without leave-outs, conditions or
    body figures; bp from health; the plates and log wait guards; blocked(); the medicine default; the one-tap tap check; the two render
    clears, and the medicine default (m6; the plates and log wait guards are held by review states).
- Read: core.js lines 1-140 and 500-1160 (word lists, `crosses`, the neighbour sets, `plantOut`, `milletOut`, `notFood`, `supp`,
  `barredTags`, `contentsBad`, `showName` and the count rules, `modelText`, `checkMeal`, `pruneCombos`, `checkReply`, `checkRescue`, the
  prompts and schemas, `readProfile`, `readCtx`), engine.js in full but the dormant menu block, params.js, app.js in full, server.ts in
  full, inject.js in full, check.js's app sections, and the review states named above.
- Figures: src/v6/params.js against handoff-next-plate.md ("Targets engine"), as the last audit: activity 1.3 / 1.4 / 1.55 / 1.725,
  deficits 300 and 500 within 30 %, floors 1200 f / 1500 m, protein 1.0 / 1.2 / 1.4 g per kg with caps 1.6 and 1.5, fibre 15 (diabetes
  20) per 1000 kcal, split 27 / 40 / 5 / 28; on medicines no deficit. No clinical figure is judged.

## Not inspected

- The live model, the Railway service and the server's security items.
- The screens: test/ux/review.js was not run; app states were run as functions in Node, not in a browser.
- The recorded swaps and changes were not replayed through the app's composed check on a medicines profile (only the cases above).
- core.js lines 140-500 (the grain identification) beyond the 46 grain probes, the recorded S5 replay and the checks.
- The v5 screens; src/v6/plate.js; the Builder beyond check.js's B2 states; carve.js's grid was run, not re-derived.
