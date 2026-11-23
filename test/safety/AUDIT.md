VERDICT: FAIL
BUILD: 4a25ec554462762abf7c09273b7a4c0b2ec2638a653725bab4390df788693c5e

Safety audit of d7702c4 (branch claude/nice-hawking-307ljy), 23 Nov 2026. This file replaces the audit of 7935ec0 (PASS). Whole tree (src/v5/core.js,
src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) judged against docs/SAFETY-INVARIANTS.md S1-S15, the two tiers and the owner's decision
rows in handoff-next-plate.md (rows 136-140) and docs/ux/UX-CRITERIA.md D11-D13. I did not take the builder's summary or counts on trust: each claim
below is something I ran, or is marked "read". The live model, the live site and Railway were not called. test/ux/review.js was not run. No file was
changed but this one; my probes and mutants are in my scratch folder. check.js prints no fingerprint, so BUILD is from `bash test/ux/manifest.sh`
(it leaves this file out). It was 4a25ec55...3c5e before the build, after the build, after `npm run -s safety`, after all probing and after this
file was written.

Commands and exit codes:
- `npm run -s build`: exit 0; the three pages rebuild; the fingerprint does not move.
- `npm run -s safety`: exit 0 (6 min 48 s). recorded.js 22,870 plate and profile checks, 15,433 plates shown; carve.js 1,191,495 cells; inject.js every
  leaf holds; intake.js 4,860 body cells (3,240 partial, refused and asked for); typed-meds.js 2,909 held and 1,731 not held phrasings; phone-states.js
  15,522 requests, none refused; schema snapshot meals 234/234 accepted, tune, log and Rescue 1/1/1; 35 Codex probes hold.
- `node test/safety/check.js hosted/v6/index.min.html`: exit 0 (310 ok lines; m4 S7 2,148 pairs; the new iff cell 1,432 checks).
- `npm run -s rules`: exit 0. `npm run -s words`: exit 0 (42 listed exceptions).
- `node test/deploy/schemas-accepted.js`: exit 0, PASS (meals 234, tune 1, log 1, Rescue 1, 0 pending; windows 3b8585a-2026-11-22 and f8879d5-2026-11-18).

0 BLOCKER from the engine's food rules, the grain, the referrals or the figures; 1 BLOCKER in the new typed-medicine net (B1); 0 MAJOR; 2 MINOR new,
carried minors, a BACKLOG and cosmetic items.

## BLOCKER

B1. S6, the typed-medicine hold. Exclusions (a) and (c), and one qualifier in (b), release a client who says plainly, in their own typed words, that
they are on a diabetes medicine. Tier 1: an honest typed disclosure, read by the engine and the phone alone, with no model reply needed. S6 says each
exclusion is "unable to release a present user", and the owner's rule is "Typed insulin or sugar-tablet words hold the plate". No owner row accepts
these releases. handoff rows 139 and 214 and D12 name only "I don't take insulin" and "my mother takes insulin" as not held.

Why this is tier 1 and not tier 2. Tier 2 names "negation parsing" and "the meaning of an otherwise allowed sentence". It defines both as a model
reply built to break a filter. B1 needs no model reply: the client types the words, and the engine and the phone release them before any model is
called. Line 41 of SAFETY-INVARIANTS.md files typed "expecting my second" under sentence meaning, but that rests on the 16 Nov referral decisions
("Measure, then decide", "Model is backup"), which are about S7 spellings with the model as the second net. No decision extends them to S6. Handoff
row 214 records that the owner reversed the last audit's two lenient readings, typed disclosures among them.

The verdict rests on this reading. If the owner files exclusion releases in the client's own words as tier 2, B1 becomes BACKLOG and the verdict is
PASS. Nothing else on this build fails.

Sorted mechanically. Every release below has a name that MEDRX matches (`MEDRX.test(t)` true, `typedMeds(t)` false), so an exclusion released a
known name. None of them is a gap in the name list. The double-negation group and the meal-scoped group carry the BLOCKER on their own. The other
three groups are listed so the owner can rule on them too. I generated them as my own frames times 12 names (insulin, Lantus, Humalog, metformin, Glycomet, glimepiride,
Amaryl, gliclazide, sugar tablets, Januvia, Jardiance, Ozempic): 503 of 504 cells released. Control: "I take M", "I'm on M", "M before dinner", 36 of
36 held. The owner can rule on each group separately:
- The negation is itself negated: 156 of 156 (13 frames). Examples: "I can't live without insulin", "I don't go anywhere without insulin", "Without
  insulin my sugar goes 400", "not off insulin", "never been off insulin since 2015", "I haven't stopped insulin", "never quit metformin". Cause:
  `medsNeg` (src/v6/engine.js:873) takes the last negation word ("without", "off", "stopped", "quit") as governing the name, and never reads the
  negation before it. "haven't" and "hasn't" are not in MEDNEGW (:863), and the replace at :890 catches only "never/don't ... stop", not "quit",
  "off" or "without".
- A negation that covers one meal or time: 96 of 96 (8 frames). Examples: "I don't take insulin at lunch, only at night", "No insulin at lunch,
  only at night", "I do not take glimepiride before breakfast, only dinner", "no insulin for breakfast". (b) keeps the hold when a dose word
  appears anywhere in the text (:893). (d) keeps it when a dose or time word follows the name (MEDCUE at :871, used at :896). (a) at :895 has
  neither. The test literal "I don't take my insulin at night" is held only because of
  "my". The same sentence without "my" is released.
- A missed or late dose: 108 of 108 (9 frames). Examples: "I didn't take insulin today, what lunch", "not taken insulin yet", "No insulin this
  morning", "aaj insulin nahi liya", "abhi tak Glycomet nahi liya". These go through (a) at :895, and through `medsNegAfter` (:881) for Hinglish.
- A share cue that (c) does not read: 119 of 120 (10 frames). Examples: "mother on insulin, same as me", "my mother takes insulin, me as
  well", "my father is on insulin. Even I am", "mom on insulin. mine too", "dad takes insulin, including me", "mom takes insulin, same with me",
  "papa insulin lete hain, mera bhi / mere ko bhi / humko bhi". MEDSHAREUSE (:902) and MEDSHARE (:901) have "same here", "too", "also" and "bhi"
  with I, me, main or mujhe. They do not have "as well", "same as", "same with", "even I", "mine", "including me", "mera", "mere ko" or "humko".
- Qualifier (b): "free of charge" is read as "insulin free". 24 of 24 (2 frames). Example: "I get insulin free of charge". MEDPOSTX (:864) lets
  through only "free of cost", "free from", "free at", "free by" and "free supply".

Effect, engine-run on np-core of hosted/v6/index.min.html. Two profiles: no condition with medicines "no"; and diabetes with medicines "no". Seven
of the phrasings above, from all five groups, at lunch ("I can't live without insulin", "I don't take insulin at lunch, only at night", "didn't
take insulin today", "aaj insulin nahi liya", "never been off insulin since 2015", "mother on insulin, same as me", "I get insulin free of
charge"). Every meals and Rescue request builds a prompt with no "at least ... kcal" line. With the
no-condition profile, a 240 kcal plate of clear soup and sauteed paneer with no grain is shown. With the diabetes profile, the same plate is
dropped at lunch for its grain ("diabetes-grain"), and shown at the snack, where S5 does not apply. The phone's own `api()`
(src/v6/app.js:182-190) sends every one of them. A client on insulin whose set-up says no medicine gets plates under their usual size. The S6 hold
was built to stop that.

Why the tests miss it: typed-meds.js builds its "not held" set from the design's own shapes ("I don't take M", "my mother takes M"). Its held set
has no double negation, no negation scoped to a meal or time, no missed dose, and none of the share forms above. Searched the recorded strings under
eval/ (75,763 strings; 1,057 typed text, ask or as_written fields, 426 distinct): the only typed text with a medicine name is "Can I stop metformin
if I eat millets?" (held); "without" appears 21 times in typed fields, always about food ("without onion, garlic or ginger"). The tiers file the
model's replies by recorded occurrence. These are the client's own words, and the tier-1 list names a typed disclosure, so the lack of a recorded
occurrence does not move them to tier 2.

Smallest fix (src/v6/engine.js, medsClause and helpers):
1. In `medsNeg`, a negation word preceded by another negation word in the same span ("can't ... without", "not off", "never been off", "haven't
   stopped") does not govern. Add "haven't", "hasn't" and "hadn't" to that reading.
2. In (a) at :895 and in `medsNegAfter`, keep the hold when a time, meal or dose cue follows the name, as (d) does. That means MEDCUE plus "at
   lunch", "in the morning", "for breakfast", "only", "yet", "this morning", "aaj" and "abhi tak".
3. Add the share forms above to MEDSHARE and MEDSHAREUSE.
4. Add "of charge" to the `free(?!...)` list in MEDPOSTX.
5. Add these frames times names to typed-meds.js as held cases, drawn from outside the engine's own word lists.

Whether a missed dose ("didn't take insulin today") counts as present use is for the owner. The recommended default is to hold, by the net's own
"hold by default" rule. The S6 sentence "each unable to release a present user" should stay only once it is true.

## MAJOR

None.

## MINOR

New:
- m1. The phone's `api()` does not refer a kidney or pregnancy profile ahead of its two holds, but `plan()` does. Run with the app's own `api()`: a
  kidney or pregnancy profile with "I take insulin" on meals or Rescue gets `meds_typed` on the phone, and the engine refers. The same profile with
  a partial body and food text gets `body_partial`, and the engine refers. 36 cells (2 profiles, 2 bodies, 3 texts, 3 kinds). Urgent text refers on
  both sides. No counter-example on screen, from reading the code (not rendered): `blocked()` (src/v6/app.js:74) puts up the blocked card on Plate
  (:592), Builder (:682) and Rescue (:764), each before the body card, and a phone whose set-up is not finished shows only the set-up. So no
  kidney or pregnancy profile reaches the ask box or the Rescue input. The order cells in typed-meds.js use only profiles with no kidney condition
  and no pregnancy (OPEN, :141), so a screen that later reaches `api()` with such a profile would not be caught. Smallest fix: in `api()`, answer
  `{status:"refer"}` first for a kidney or pregnancy profile (keeping the urgent line), as `plan()` does at engine.js:921. Add the two profiles to the
  order cells.
- m2. The typed-medicine net takes cubic time on long text. Availability only, no S rule. `plan('meals')` on "no insulin " repeated: 1,000
  characters 62 ms, 2,000 293 ms, 4,000 1,975 ms, 8,000 16,142 ms. It rises about 8 times for each doubling, and `typedMeds` reads up to 20,000
  characters (engine.js:904). The cause is that `medsNeg` (:873) loops over every negation word before each match and runs MEDRX over the rest
  each time. The phone caps typed text at 240 characters (ask), 160 (Rescue) and 200 (log) (app.js:583, :769, :856), so only a request made outside
  the app reaches this. src/v5/server.ts has no body or text limit. The last audit measured 170 KB at 12.3 s (not re-run here); now 8 KB takes 16 s. Smallest fix: refuse
  typed text over 2,000 characters as bad_request before the nets run (after the referrals), or cap `typedMeds` at the phone's 240.

Carried (not re-run unless said):
- The schema snapshot is still a sample; server.ts generation settings are read by no check (schemas-accepted.js says so in its output).
- The Rescue weight line can show a weight for part of the dish (`portionLine`, src/v5/core.js).
- Two app mutants survived on cad3fb0: `directive({},...)` and `room>=60` in `nextOffer`.
- A one-tap change that moves the declared grain with its carbs unchanged is offered (S10 as written, direction only).

Closed since 7935ec0, checked here:
- m1: the body card carries the log row on the Plate tab (read: app.js:397, `bodyCard(true)` at :593 after `choices` and `loggedCard`).
- m2: the food-file bounds are now 6,300 kcal and 460 g protein a meal, and four meals a day. Engine-run: 25,200 and 6,300 are read; 25,201, 6,301,
  1e9, -1, NaN, Infinity and "2.5e4" are refused; "25200" and 25,200.4 are read as they were. No new path for unparsed input. With 25,200 kcal eaten
  the prompt still states a meal target from the day's figures, and on medicines the floor holds (my grid below).
- m3: `bodyHold` moved above `typedReferral` in `api()` now fails typed-meds.js (my mutant B).

## BACKLOG (tier 2 or the list-gap class; none fails the audit)

- Typed medicine phrasings with no name MEDRX knows (`MEDRX.test` false): "sugar ka injection leti hoon", "sugar ki injection lagti hai", "sugar
  injection daily", "diabetes injection at night", "injection for sugar", "sugar ki sui lagti hai", "meds for sugar", "medication for diabetes",
  "sugar control tablet daily", "sugar ki daily goli", "goli khata hoon sugar ki", "metformn". S6 lists the no-name class ("Post lunch I inject")
  and brand gaps as known misses. The generic phrases ("sugar ka injection", "medication for diabetes") sit next to the listed "sugar ki goli" and
  "tablets for my sugar", and S6 does not name them. Under "Fix found, then watch" they are found, so fix them. Searched under eval/: "injection" 0,
  "meds for" 0, "medication for" 0, " sui " 0.
- S3 khakhra forms not on the list, shown to a high BP client and to a wheat-free client when the tag is "plain": "Khakhre" (the ordinary Hindi
  plural), "Methi khakhre", "Khakhro", "Jeera khakhro", "Khakre", "Khakhri", "Khakara", "Kakhra", "Kakra", "Khaakhra", "Khakhraa". "Khakhras",
  "Khakhra chips" and "Mini khakhra bites" are dropped. With an honest tag (salty_side, wheat) every one is dropped. To show, a model must write the
  form and tag it "plain". Searched under eval/: only "Khakhra" and "khakhra" (8 strings). First to add: "khakhre".
- Rescue "Ensure with milk" with a dairy tag is helped (S9). "Ensure" is read only as a whole name or before a drink word, by design. An honest
  model tags it "supplement" and it is dropped. Protein powder, whey, Horlicks, Bournvita and Protinex are not helped.
- Generic names the list and stems do not match: gliquidone, glisoxepide (the stem ends only in ride, zide, mide or zid), saroglitazar (sold in
  India), imeglimin, efpeglenatide, bromocriptine, colesevelam. All are in the class for the clinician's list review, not a stem bug.
- Carried: "kaanp" with an insulin profile ("haath pair kaanp rahe hain, insulin leti hoon" now gets meds_typed with no medicine set-up, and goes to
  the model when the set-up says insulin); "sugar 50 hai" (no figure is read); salty and regional names with a "plain" tag (Fafda, Gathiya,
  Bhakarwadi, Mathiya and the last audit's list); Hindi counts before a non-piece word; the log's `"grams" in it` on a non-object item (500 from
  server.ts).

## COSMETIC

- c1. SAFETY-INVARIANTS.md line 65 says 1,183 held and 1,138 not held, and typed-meds.js:137 keeps the same figures as HELD_BEFORE and NOT_BEFORE.
  The run prints 2,909 and 1,731.
- c2. S6's sentence that each exclusion is "unable to release a present user" is not true on this build (B1).
- c3. src/v5/server.ts lines 14 and 20 still mention menu photos (unreachable). Carried.

## Points examined on purpose

1. The order on a partial body with typed insulin.
   - Engine: kidney or pregnancy (urgent first), then the typed referral, photo, bad_request, body_partial, meds_typed. Phone: typed referral,
     meds_typed, body hold.
   - Engine-run: a partial body with "I take insulin" gets body_partial in the engine and meds_typed on the phone. Both hold, nothing is planned, and
     no plate or Rescue gets through on either side.
   - Typed pregnancy, kidney and urgent text refer first on both sides, whole body or partial.
   - A screen cannot reach it: a partial-body phone shows the meal chips, the logged card and the body card with the log row, with no ask box and no
     Rescue input (app.js:593, :765).
   - The one place a referral does not win is m1, which only `api()` alone reaches.
2. FILEB: no oversized or unparsed path (closed m2 above).
3. The typed-medicine net: see B1 for the exclusion bugs and the BACKLOG for list gaps.
   - The recorded limits that are stated hold as stated: the over-holds (past use, a bare name, "starting insulin next week", "Can I stop metformin",
     "Is Januvia safe? asking for my mother", aunt, mausi, chacha) are held, and the known misses are missed.
   - The limits that are not stated are the B1 groups and the generic no-name phrases.
   - The stems. MEDRX over the 2,391 distinct strings in test/safety/audit-names.json, controls.json and lexicon.json finds 2, both true medicine
     strings ("gliclazide 80", "trembling after taking gliclazide"). On 44 food and English words of my own that share letters (Methi thepla,
     Insulated tiffin, Glutinous rice, Peninsula, Consultation, Goli soda, Glazed, Pioneer, Galvanised and others) there are 0 false holds. No
     stem bug found. The generics it misses are in the BACKLOG.
4. The m4 loosening in check.js. Over the 358 S7 strings, 2 profiles and meals and Rescue (1,432 cells), the only string that answers meds_typed is
   "gliclazide 80", which has a name. The loosening hides no missing answer for a string without a medicine name. The new iff cell can fail: my
   mutants A (meds hold above the referral) and C (meds hold removed on the phone) fail check.js.
5. The log from a partial body: built through the phone's own `bodyHold` for three partial bodies, with and without medicines. The body goes as 0, 0,
   0, and `plan('log')` builds a prompt with no age, height, weight, target or usual figure. Read: `loggedCard` shows only the model's checked kcal and
   protein, and with no targets it says "Add your age, height and weight so the rest of the day can adjust."; `bodyCard` shows no figure;
   `dayTargets6` (params.js:57) returns null unless all three figures are given; `medsUsual` then uses the floor split. No clinical figure is
   invented. params.js is unchanged since 738244e.

## Owner question (named, not graded)

- What stays on screen after a medicine hold (read, not rendered). On the Plate tab, a `meds_typed` answer to an ask leaves the earlier plates
  under the note, which says "Showing the plates from before." (app.js:616-619). Those plates were made for a set-up with no medicine, and they stay
  tappable and loggable. On Rescue, `rescue()` does not clear `UI.rres`, so an earlier dish and its moves are still drawn under the note
  (app.js:745, :778-783). S6 and D12 put the hold on the request ("plates and Rescue are not planned"), so this is not graded. Should a medicine
  hold also put away plates and a Rescue answer made before it?

Standing rails, rechecked:
- Kidney and pregnancy are referred, typed too: 15 phrasings of my own (Hindi and English, "garbhvati hoon", "doodh pilati hoon bacche ko",
  "mujhe dialysis hota hai", "creatinine is 3.2", "I take insulin and I am pregnant") refer on meals, Rescue and the log, and with an insulin profile.
- With diabetes the grain stays: my grainless plate is dropped at lunch for diabetes with medicines "no" (reason "diabetes-grain"), and the
  96-cell medicines grid keeps the grain plate as the control. recorded.js keeps the grain on every recorded main-meal plate for the diabetes profile.
- No supplements: as in the BACKLOG.
- Grams and kcal: the S8 scan in recorded.js (5,241 names) and my log prompt read.
- No invented figure: point 5.

## Probed

- Typed-medicine net:
  - About 190 phrasings of my own, one by one: English, Hinglish, verbless, double negation, timing, missed doses, shares, qualifiers, future onset,
    relatives, brands and misspellings.
  - The frames-times-names grid: 504 cells and 36 controls.
  - plan() and the phone's `api()` on 8 phrasings x 2 profiles x 2 kinds, with a small plate through the check.
- Kidney and pregnancy profiles on the phone's `api()`: 36 cells. The S7 strings through meals and Rescue for the m4 question: 1,432 cells.
- Mutants on scratch copies, each against typed-meds.js and check.js, plus phone-states.js for the app mutants and intake.js for the engine ones (21
  runs):
  - app A, meds hold above the typed referral: typed-meds and check fail.
  - app B, body hold above the typed referral: typed-meds fails.
  - app C, meds hold removed: typed-meds and check fail.
  - app D, body hold above the meds hold: typed-meds fails.
  - engine E, meds line removed from plan(): typed-meds and check fail.
  - In check.js, A, C and E each fail the new cell "m4 S7: the phone holds a typed medicine name if and only if the server answers meds_typed"
    (2 counter-examples each), so that cell can fail.
  - engine F, meds line moved above the referrals: typed-meds and check fail.
  - engine G, exclusion (a) removed: typed-meds fails.
  - phone-states.js and intake.js pass on every mutant. They do not test this net.
- S6 on a medicines day: 96 cells (insulin and not sure; a body of 70 years, 150 cm and 45 kg, and an empty body; four meals; appetite 1 and 10; hour
  0, 23.98 and not given; 25,200 kcal eaten with two 6,300 kcal meals). The stated floor is never under `medsUsual`, a plate 10 kcal under the usual
  size is dropped, and the control at +20 is shown.
- Food file bounds: 10 values at and past the limits. Long text timing: 12 runs.
- S7: 25 phrasings x 4 readings. S9 in Rescue: 8 dishes. S3: 26 khakhra and salty-snack names x 2 profiles.
- Recorded-string searches under eval/: 14 patterns over 75,763 strings (listed in the findings).

## Not inspected

- test/ux/review.js was not run and no screen was opened. Every screen claim (m1, point 1, point 5) comes from reading src/v6/app.js.
- The live model, Railway and the live site. Whether the model's own "medicines, refer" line in the meals prompt (engine.js:240) catches the B1
  phrasings is not measured, and it would not be a deterministic check anyway.
- The v5 screens beyond the suites run on them. The dormant menu code. src/v6/plate.js. The lexicon word by word. The carried minors not marked
  as re-run.
