VERDICT: PASS
BUILD: 9cdc7da72c9431e5687306d1dc35e06124b6a7737a28828632e1b06dceb818ab

Safety audit of 7935ec0 (branch claude/nice-hawking-307ljy), 22 Nov 2026, after fix-r18, fix-r19, fix-r20 and the 22 Nov sample window. This file
replaces the audit of 21a04a3 (FAIL, B1). Whole tree (src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) and
the safety suites, judged against docs/SAFETY-INVARIANTS.md (S1-S15, the two tiers, the intake and schema rules), the handoff decision rows and
docs/ux/UX-CRITERIA.md D1-D11. The builder's summary and counts were not taken on trust: every claim below was run here or is marked "read".
The live model, the live site and Railway were not called. test/ux/review.js was not run. No file was changed but this one; my probes and
mutants live in my scratch space. The fingerprint was 9cdc7da7...b8ab at the start, after `npm run -s build`, after `npm run -s safety`, after
all probing and after this file was written (test/ux/manifest.sh leaves this file out).

Checks run on this tree:
- `npm run -s build`: the three pages rebuild; the fingerprint does not move.
- `npm run -s safety`: pass, exit 0 (7 min 25 s). recorded.js 22,870 plate and profile checks, 15,433 plates shown; carve.js 1,190,139 cells;
  inject.js 162 leaves, 11 profiles, 31,721 cells; intake.js 4,860 body cells (3,240 partial, refused and asked for), 36 partial audit cells
  (0 not refused), 12 all-or-none cells (0 differ from the phone); phone-states.js 14,850 requests, none refused; the schema snapshot on the
  three pages: meals 234 built, 234 entries, 234 accepted; tune, log and Rescue 1/1/1 each; 35 Codex probes hold.
- `npm run -s rules`: every rule check holds. `npm run -s words`: no banned words outside the 42 listed exceptions.
- `node eval/usefulness/bars.js`: four bars meet (plates 67 of 75; 2 requests with no plate, both sulfonylurea meds-low; reason line 67 of 67;
  swaps and one-tap 259, 100 % of live). `node eval/atrisk/replay.js .`: 204 live, 187 now (contents 10, diabetes-grain 3, meds-low 16; 8 menu
  calls left out), the same as on 21a04a3.
- `node test/deploy/schemas-accepted.js`: PASS (meals 234, tune 1, log 1, Rescue 1, 0 pending; records window-3b8585a-2026-11-22 with 135
  answered lines and window-f8879d5-2026-11-18 with 102).

Were tier-1 tests weakened? `git diff 21a04a3 HEAD` on test/safety/check.js, inject.js, recorded.js, carve.js, codex.js, schemas.js,
lexicon.json, test/rules and test/ux/review.js: the only removed lines are one wording change in schemas.js (the hint now names `--add`) and
check.js:996, where the m4 phone test now stubs `bodyHold: () => false` (see m3 below). Nothing else was removed or relaxed.

0 BLOCKER, 0 MAJOR, 4 MINOR new (m1-m4), 4 MINOR carried, 3 COSMETIC, a BACKLOG, owner questions and watch notes.

## The verdict rests on this reading (the owner's to change)

A client whose set-up says no condition and no medicine, and who types a diabetes or medicine disclosure in the ask box, gets no S5 grain rule
and no S6 floor. Engine-run on np-core of hosted/v6/index.min.html, profile health "none", meds "no", dinner, three phrasings of my own: "I take
insulin and glimepiride, a light dinner please", "main diabetic hoon, insulin leti hoon, halka khana", "sugar ki dawai leti hoon, kam khana
hai". Each builds a prompt with no "at least ... kcal" line and no grain line, and a 240 kcal plate of clear soup and sauteed paneer with no
grain is shown. None of the three holds an urgent sign, so the urgent net is silent, as designed.
- Read as written, this is not a counter-example. S5 and S6 define the client by the set-up's answers ("on insulin or sugar tablets (or not
  sure)", "an unanswered medicine question ... is read as not sure"); the only invariant that extends to typed text is S7 ("ticked in set-up
  ... or typed in any free-text box"), and the tier-1 list ties "typed" to the S7 referral. I searched handoff-next-plate.md,
  docs/SAFETY-INVARIANTS.md, docs/ux/UX-CRITERIA.md and every earlier version of this file for a ruling on typed diabetes or medicine
  disclosures: every "typed disclosure" ruling on record is an S7 one. On this reading the verdict is PASS.
- If the owner reads "with diabetes" and "on insulin or sugar tablets" as covering what the client types, this is a tier-1 S5 and S6 breach
  from the engine alone (BLOCKER) and the verdict is FAIL. No rule is proposed here; the owner decides what a typed disclosure should do.
- A second, narrower reading: plain khakhra is read as a wheat food, not one of S3's "similar salty sides", because the record classes it
  so (see the owner questions). Two recorded live plate names hold it; if the owner counts it as a salty side, that is an S3 BLOCKER too.

## BLOCKER

None.

## MAJOR

None.

## MINOR

New this round:
- m1. The owner's decision "Keep log (Recommended)" (22 Nov, handoff-next-plate.md:138: "A phone that saved one or two of age, height and
  weight before the fix-r20 rule still logs a meal ... Already built that way in fix-r20") is not met on the v6 screens. No S rule is broken
  (it fails closed); graded MINOR, listed first because the record says it is built. Read, not rendered: on a phone that holds a partial
  body, `renderPlate` returns the body card (src/v6/app.js:565) before it builds the plate card, and the only "I had something else" and
  "Skipped it" entries are inside that card (src/v6/app.js:537-540); Builder and Rescue return the same card (app.js:653, 735), and the body
  card holds only "Add them now" (app.js:373). The review state plate-body-stored-partial asserts there is no plate card
  (test/ux/review.js:312-314). So the log path that `bodyHold` keeps open (app.js:165, figures sent as 0) has no screen that reaches it, and a
  client on medicines with a stored partial body cannot mark a meal skipped. test/safety/phone-states.js:54 asserts the decision by calling
  `api()` directly, a path no screen offers. Smallest fix: keep the log row (and "Skipped it") on the body card, or show the logged-meal and
  log row above it; and a review state that opens the log sheet from a stored partial body and counts a meal.
- m2. A meal of more than 4,000 kcal logged on the live page (6febc1a) earlier the same day makes every plate and Rescue request answer
  bad_request after the update, until 4 am or until the client reopens that slot (the "Reopen" button on the logged-meal card, app.js:457;
  the screen says only that the request could not be read). Tier 1 in shape (engine and app logic alone, from a store the phone holds), no S
  rule; fails closed. 6febc1a's log took `num(r.kcal,1,5000)` and put the macro sum in place of a kcal more than a fifth off it, up to 6,300
  (`git show 6febc1a:src/v6/engine.js`, lines 301 and 303); this build's food file refuses a meal over 4,000 kcal (src/v6/engine.js:168,
  `FILEB.mealKcal`, read at :178 through `g()` at :172). Engine-run with the phone's own `buildFile` and fileOut's shape: a breakfast logged at
  3,990 and 4,000 kcal plans; at 4,010, 5,000 and 6,300 kcal meals and Rescue both answer bad_request. The intake rule's own words are "a
  request is never refused for an old store". test/safety/phone-states.js:66 draws its largest meal from this build's range (4,000 kcal), so
  the "6febc1a store" section cannot see it. The recorded log replies run to 1,084 kcal at most (60 found under eval/), so it is rare.
  Smallest fix: the phone's load reads a stored meal figure the log cannot hold now as the highest it can (or leaves that event's figures
  out of fileOut), the same way `bodyStored` reads an old body figure; and a phone-states cell with a 6febc1a log of 5,000 kcal.
- m3. The phone's order "typed referral first, then the partial-body hold" (src/v6/app.js:173-175) has no check that can fail. My mutant that
  moves `bodyHold` above `typedReferral` in `api()` passes intake.js, phone-states.js and check.js; check.js:996 stubs `bodyHold: () => false`,
  so its S7 phone cells never meet a hold. No counter-example today: with a stored partial body the ask box, Rescue and the log entry are
  not on screen (m1), so no typed text reaches `api()` with a partial body. It becomes one if m1 is fixed by showing Rescue or the ask.
  Smallest fix: run the check.js m4 phone cells again with the app's own `bodyHold` and a partial-body profile (pregnancy, kidney and urgent text
  must answer as a referral with no request).
- m4. The schema snapshot is still a sample, measured again (carried from m8, partly fixed). Lengths 6, 7 and 8 are now in the grid (20 entries
  each) and accepted. From 3,000 plate contexts I generated (random day logs, hooks, goals, focus, medicine answers, hours, the app's "lite"
  flag), 2,987 build a schema in no snapshot entry, at every hook-list length from 1 to 9 (my hashing reproduces all 234 entries from their
  own example bodies, so the count stands). The schema differs only in the hook enum, and every length is now accepted live at least once,
  so the risk is small; src/v5/server.ts:63 (maxOutputTokens, temperature, the models, the thinking level) is read by no check, as
  schemas-accepted.js now says in its output. Smallest fix: none needed for this verdict; if the owner wants more, a window that sends a
  fresh random sample each time.

Carried (the lines they rest on are unchanged since 21a04a3 unless said):
- Rescue weight line can show a weight for part of the dish (`portionLine`, src/v5/core.js). Not re-run.
- Two app mutants survived every check on cad3fb0: `directive({},...)` for `directive(profileOut(),...)` (now src/v6/app.js:390) and
  `room>=60` for `room>=120` in `nextOffer` (app.js:256). Not re-run.
- A one-tap change that moves the declared grain with its carbs unchanged is offered (S10 as written, direction only). Not re-run.
- Long typed text holds the server: re-run, 170 KB of "red kidney beans " takes 12.3 s in plan() (availability only; the server has no body
  limit). Smallest fix: bad_request for typed text over 2,000 characters before the nets run.

Closed since 21a04a3, checked here: B1 (the partial body; the engine refuses it as body_partial after the referrals, and my S6 grids below
find no plate, swap, change or Rescue move under the usual size); m5 (read: unticking the last condition is "None", `setCond`, app.js; the review state sheet-health-untick-last was not run); m6
(schemas-accepted.js fails on a kind with no schema and on an acceptance with no commit, date, how and answered line); m7 (the window logs
are committed: each of the 237 accepted entries has its own "ok" line in the window its commit and date name, 1 to 1, no 12-character
collision, no unused line, and every entry's text hashes to its sha256). Not re-run, carried as they were: the last audit's m9 (inject.js passes on plain removal of the five plate-path drops; check.js has a named cell for each) and its c1 (the medicines prompt still carries hooks that ask for less, nothing shown from them).

## COSMETIC

- c1. "My food cannot be finished with a partial body" (handoff row 137, D11) holds for its Done button only: Escape (app.js:796) and a tap
  outside the sheet (app.js:858) close it and `closeSheet` (app.js:795) saves the partial body. Harmless: the body card then holds plates,
  Builder and Rescue, and opens the step once; the review state plate-body-stored-partial itself closes the step with Escape. Fix: say so in
  D11, or keep the sheet open on Escape while the line shows.
- c2. The window log ends with a line naming the scratch folder where the full per-request results were written; those results (the reply
  bodies) are not in the tree, so an "ok" line is the builder's record of a status, not a reply a reader can open.
- c3. src/v5/server.ts lines 14 and 20 still mention menu photos (unreachable).

## Watch notes (not findings)

- A profile with a kidney condition or a pregnancy plus a typed urgent sign gets the plain referral without "If you feel unwell now, contact
  your doctor or emergency care." (src/v6/engine.js:830 returns before :831). Engine-run on all four kinds. No screen reaches it: such a phone
  shows the blocked card on Plate, Builder and Rescue, and the log entry is inside the plate card. Only a request made outside the app meets it.
- Partial-body refusal order, engine-run: 4 health answers x 13 bodies x 6 texts x 4 kinds (1,248 calls). Kidney and pregnancy profiles refer
  on every body; typed pregnancy, kidney and urgent text refer before body_partial and before the bad_request for an age of 17 or 200; food
  text with a partial body is body_partial; all three or none plan.

## BACKLOG (tier 2, the watch list; none fails the audit)

Searched for each: every string value in the 55 JSON files under eval/ (75,763 strings), as a whole word, and again on the plate-path fields
(food, add_item, name, title, items, dish, made_of, label, as_written, with, subtitle).
- S1-S4, S9, names of my own with a wrong "plain" tag. 7,020 plate checks: each name as an item, a protein swap and a one-tap added food, for
  the profiles that bar it, with "plain", with its honest tag, with an empty list and with no list. Honest tag, empty and missing: 0 shown of
  5,265 (tier 1 holds). With "plain": 205 of 1,755 shown, 39 names: dairy-free Mattha, Mor kulambu, Burfi, Moru, Tairu anna, Dhai vada;
  nut-free Kadalai chutney, Verkadalai sundal; vegetarian Kori gassi, Mamsam kura, Laal maas, Seekh kebab, Tangdi kebab, Liver, Mathi; egg
  Dim er dalna, Frittata, Quiche; Jain Vengaya sambar, Kizhangu, Senai roast, Aaloo; high BP Khakhra, Ooragai, Kachri, Mathri, Salted peanuts,
  Fryums; diabetes Cookies, Biscuits, Cold drink, Sharbat, Rooh afza, Mishti, Sondesh, Gajak, Rewri, Dates, Khajur. Wheat, soya and supplement
  names: 0 shown. Recorded plate-path occurrences: "Konda kadalai sundal" (2; chickpeas, not a nut), "Veg Seekh Kabab" (1, a menu line, dormant),
  "Cold Drink" and "Cold Drink 60" (2, the "leave for another day" entries of the 72758ac menu window, dormant), "Tea and 2 biscuits" (a client's log title quoted in a prompt, not offered), Khakhra (4, see the owner
  questions). A model would have to name the dish in one of these words and tag it "plain". First to add if a live sample shows one:
  "liver", "seekh", "biscuits", "cookies", "aaloo", "mathri".
- S8, Hindi and regional counts before a food that is not a piece word. On the plate path `showName` keeps "Paanch almonds", "Chhe badam",
  "Saat khajur", "Aath kaju", "Nau kishmish", "Das badam", "Bees kishmish", "Paune roti" (from "Paune do roti"), "Pachas gram paneer", "Sau
  gram dal", and the spellings "Doh roti", "Tin roti", "Rendu dosai", "Moonu idli", "Ondu rotti" (79 forms tried; the rest clean). Graded
  tier 2 on the "List gaps" decision (docs/SAFETY-INVARIANTS.md:33: a gap with no live occurrence is watched, Hindi gaps found are fixed) and on
  the search: Hindi and regional number words on the plate path occur only in "Panch phoron" (16) and "Do pyaza" (3). Note the tension: S8's
  engine rule counts a Hindi number only before a measure or piece word (CNTHINDI, src/v5/core.js:730; CNTPIECE, :704), while S8 says its own
  detector flags any Hindi number before any word; the piece list lacks almonds, badam, kaju, khajur and kishmish, and the number list lacks
  bees, pachas and sau. To fix when it is next touched, as the list-gap decision asks for gaps found.
- S7, new phrasings of my own: 63 on meals, Rescue and the log, with a plain and an insulin profile, and the phone's `typedReferral` (504
  readings; phone, server and kinds agree on every one). Going to the model: "sar ghoom raha hai", "haath kaanp rahe hain", "heart is
  racing", "palpitations", "glimepiride liya aur kaanp raha hoon" (insulin profile too: "kaanp" is not in the sign list), "sugar 55 hai" (no
  figure is read, by design), "just delivered" (postpartum, an open owner question). Searched: kaanp, ghoom, palpitation, racing and "sugar"
  before a number: 0 strings; "delivered": 7, the referral window's listed phrasing.
- Carried: the log's `"grams" in it` throws on an item that is not an object (re-run: TypeError; src/v6/engine.js checkLog; the server has no
  guard around `pl.check`, src/v5/server.ts:112, so it answers 500); the schema says items are objects.

## Owner questions (named, not graded)

- Typed disclosures and S5/S6 (the reading above).
- Khakhra with high BP: is it one of the "similar salty sides" of S3? Recorded on the plate path in two v5 replies ("Whole wheat khakhra
  pieces", "Crushed roasted whole wheat khakhra"); the word net shows Masala khakhra, Methi khakhra, Fafda, Gathiya, Mathri, Khari biscuit,
  Cheese slice and Salted butter to a BP client. Not graded because the record classes it as a wheat food: test/safety/lexicon.json lists
  "khakhra" under known.wheat (src/v5/core.js:97 the same), the second audit's names (test/safety/audit-names.json) put "Khakhra" in the
  wheat set and only "Khakhra with pickle" in the salty set, and the audit of ca94d43 carried a "plain" Khakhra for high BP as backlog. If the
  owner counts plain khakhra as a salty side, the two recorded names make it a tier-1 S3 counter-example (BLOCKER) and this verdict would be FAIL.
- The usual size with all three body figures can sit under the all-empty floor split: a woman of 70, 150 cm, 45 kg, low activity, on
  insulin, has a lunch usual size of 460 kcal, and of 80, 145 cm, 40 kg, 390 kcal, where leaving the three figures empty gives 480. As S6
  is written this is right (the usual size comes from the day target); whether the energy floor should also bound the usual size is a
  figure for the owner or a clinician. No figure is proposed here.
- Carried: the urgent-symptom scope and the insulin-profile default (not clinically reviewed); "Lime juice" as a drink with diabetes;
  potassium; transplant; postpartum; S6's 10 percent upper limit.

## Owner decision, listed and not graded

- D10 "My rule" (snack under 120 kcal offers the next main meal, for a medicines client too unless a meal was skipped): app.js:256, unchanged.
- D11 and "Keep 18 (Recommended)": the age bound 18-95 is held by `BODYB` in np-core and read by the phone (`bodyRead`, `bodyStored`).

## Probed

- Partial body and S7 order: 1,248 plan() calls (above).
- S6 with all three figures empty, on insulin and not sure: 648 cells (sex f, m and not given; activity low, high and not given; four meals;
  appetite 1, 5, 10; 0, 1,500 and 3,800 kcal eaten earlier). The prompt's "at least" figure equals `medsUsual` and the lowest plate shown is
  the usual size. The 108 snack cells my plate builder could not make (negative carbs at 60 kcal) are my artefact. My first one-tap change
  shape in this grid and the next was dropped for its shape (no `add_item`), so those change cells are not counted; see the change grid below.
- S6 with full bodies: 576 cells (bodies 18/120/30, 45/158/65, 95/215/200, 70/150/45; goals lose and hold; three meals; appetite 1 and 10;
  0, 2,500 and 3,900 kcal eaten earlier; dinner at 23:54). Stated floor at or above usual in all; a plate 12 kcal under usual dropped; a
  protein swap landing under usual not offered on the plate path (control: the same swap at usual+200 is offered, and on the tune path);
  Rescue: 1,656 dishes read (72 over 4,000 kcal dropped, as they should be), no move under usual; a separate run of 35 dishes produced 26
  portion moves, none under usual.
- S6 one-tap changes, with a valid shape: 90 cells (three meals; a body given, two all-empty bodies, a small older body, a large one;
  appetite 1; plates 10 to 200 kcal over usual with a change of -50 kcal), plate path and tune path: 0 offered under usual, 114 offered at or
  above it (the control).
- S5: a diabetic lunch with base swaps to cauliflower rice, to lettuce cups tagged grain and to zucchini noodles "made of" millet: all
  dropped (control: a swap to jowar roti is kept). One-tap changes with a valid shape: grain grams after 0, after 20, a note that swaps the
  roti for salad, and -60 g carbs with no grain grams given: none offered (controls: less oil with the grain kept, and added sprouts, both
  offered).
- S1-S4, S9: 7,020 plate checks (above). S8: 79 count and measure forms. S7: 63 phrasings, 504 readings. Typed disclosures: 3.
- Intake: a large meal logged on 6febc1a, 5 sizes x 2 kinds; the phone's hour (max 23.98) and day number (1 to 366) against the engine's bounds.
- Schemas: 237 entries against 237 answered lines; 234 example bodies rebuilt and hashed; 3,000 generated contexts; the 3b8585a to 7935ec0
  diff (only acceptance records and the handoff; no source change; the snapshot diff is 135 "pending" to {commit, date, how} and nothing else).
- Mutants on scratch copies (each run against intake.js, phone-states.js and check.js, 27 runs): engine, profilePartial moved above the typed
  referral (intake fails), profilePartial removed (intake fails), the all-empty floor set to 0 (intake and check fail), the food-file bound
  made a clamp (intake fails); app, bodyHold removed (phone-states fails), the log's zeroing removed (intake and phone-states fail), bodyHold
  above the typed referral (all pass: m3), the old store load (phone-states fails), the set-up body gate removed (all three pass; it is a
  rendered rule, held by the review state setup-3-body-partial, which I did not run, and the engine and `bodyHold` still hold the request).
- src/v6/params.js: read; unchanged since 21a04a3; no clinical figure was judged or invented.

## Not inspected

- test/ux/review.js was not run and no screen was opened: every screen claim above (m1, c1, the set-up gate) is read from src/v6/app.js and
  the review states, not rendered.
- The live model, Railway and the live site: the window's "ok" lines are the builder's record of each answer.
- The v5 screens (hosted/v5/index.min.html) beyond the three suites run on them: not a release target, and whether they send a partial body
  was not checked.
- The carried minors not marked re-run, the dormant menu code, src/v6/plate.js, the lexicon word by word, and src/v5/core.js and
  src/v6/engine.js beyond the functions named.
