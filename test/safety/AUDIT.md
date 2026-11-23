VERDICT: FAIL
BUILD: 8b9fafe47b981fd0f795b0c924a2dda5069743874df9c7f9ddc4a9607cc627ee

Safety audit of 41e8ac0 (branch claude/nice-hawking-307ljy), 23 Nov 2026. This file replaces the audit of d7702c4 (FAIL, B1). The scope is the whole
tree (src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) against docs/SAFETY-INVARIANTS.md S1-S15, the two tiers, and
the owner's rows in handoff-next-plate.md (rows 136-141) and docs/ux/UX-CRITERIA.md D12 and D14.
- Read this round: every region that changed since d7702c4. `git diff d7702c4 41e8ac0 -- src/` touches only app.js (166-178, 200-228, 453, 479, 615-636,
  702, 764-803, 852) and engine.js (832-931). I also read the medicine net, `plan()`, `norm`, server.ts and all of the hold code.
- Not re-read: params.js and core.js. The app.js regions that did not change were judged in earlier audits.
- Evidence for S1-S4, S8 and S10-S14: the suites, plus a food-rule probe of my own (432 cells, below). I did not take the builder's summary or counts on
trust: each claim below is something I ran, or is marked "read". No file was changed but this one, and nothing was committed or pushed. The live model,
the live site, Railway and env settings were not touched. test/ux/review.js was not run. BUILD is from `bash test/ux/manifest.sh`. It read 8b9fafe4...27ee
before the build (exit 0), after the build, after the suites and the first probes, after the first write of this file, and after the last probe and the
final write. `git status --short` showed only this file.

Two methods to disclose, so the coordinator can judge them:
- App paths were driven with a headless DOM probe: Playwright on hosted/v6/index.min.html (and index.html for one mutant), with /api answered in my
  scratch folder by the page's own np-core `plan()` and `check()` on canned model replies. There were no screenshots and no visual judgement. It
  reads whether a plate, card or dish is in the visible view and which requests were sent.
- App mutants ran with `NP_APP=<mutant copy in scratch>`. That points typed-meds.js and check.js at another app.js. It skips no check.

## Commands and exit codes

- `bash test/ux/manifest.sh`: exit 0 on the first reading, which was 8b9fafe47b981fd0f795b0c924a2dda5069743874df9c7f9ddc4a9607cc627ee. The other four
  readings printed the same value; I did not capture their exit codes.
- `npm run -s build`: exit 0. The three pages rebuild and the fingerprint does not move.
- `npm run -s safety`: exit 0. These figures are from the run's own output:
  - recorded.js: 22,870 plate and profile checks, 15,433 shown.
  - carve.js: 1,191,495 cells.
  - inject.js: 162 leaves, 31,721 cells.
  - intake.js: 4,860 body cells.
  - typed-meds.js: 4,629 held, 572 not held.
  - phone-states.js: 15,522 requests, none refused.
  - schema snapshot: meals 234/234 accepted; tune, log and Rescue 1/1/1.
  - 35 Codex probes hold.
- `node test/safety/check.js` (its default page) and `node test/safety/check.js hosted/v6/index.min.html`: exit 0 both, with 310 ok lines and "every safety
  invariant holds".
- `npm run -s rules`: exit 0. `npm run -s words`: exit 0 (42 listed exceptions), and again after this file was written.
- `node test/deploy/schemas-accepted.js`: exit 0, PASS. The counts are meals 234, tune 1, log 1 and Rescue 1, with 0 pending. The records are windows
  3b8585a-2026-11-22 and f8879d5-2026-11-18. Its own header says the enumeration is a sample and that server.ts is read by no check.

Summary of findings: the B1 net of the last audit is closed, and I found no release of a present user. There is 1 BLOCKER in the hold's lifetime on the
phone (B1). There are 0 MAJOR, 2 MINOR new, BACKLOG items, 1 owner question and cosmetic items. Nothing else I found fails. That rests on the reading and
the probes listed here, not on a full re-read of the unchanged code.

## BLOCKER

B1. S6 with the owner's 23 Nov "All tabs (Recommended)". A reload ends the typed-medicine hold with no act by the client, and the Plate tab then plans
and shows plates sized with no medicines floor. This is tier 1: app logic alone and a typed disclosure, with no model reply.

The rule. Handoff row 141 records the owner's "All tabs (Recommended)": "one typed-medicine hold covers Plate, Builder and Rescue, and no earlier plate or
Rescue dish, no moves and no "I had this" show anywhere until My food is updated, which clears the hold". D14 names the exits:
- updating My food;
- a new ask or dish without the medicine name, which runs the net again.

The second exit has the owner's own card line behind it ("If this is about someone else, ask again without the medicine name."). I accept it (point 2
below). No owner row and no line of S6, D14 or the handoff names a reload as an exit: I searched all three for "reload" and found nothing about the hold.
typed-meds.js has no reload cell.

Counter-example, executed in Chromium on hosted/v6/index.min.html (pw6.js):
- Set-up: diabetes ticked, medicines "No", age 47, 158 cm, 72 kg, female, at 1:10 pm on a lunch tab.
- Typed ask: "I take insulin, what lunch?". The hold card shows, with no plate.
- Reload the page, as reopening the WhatsApp link or a phone dropping a background tab does. Make no tap.
- The phone sends /api/meals with empty text and medicines "no". The prompt has no "at least ... kcal" line. A 330 kcal lunch plate with a grain is
  shown, with no hold card. With medicines "Yes" the usual size for this body is 680 kcal (`medsUsual`), so the plate is under half of it.
- The ask box is empty after the reload. The typed text is not kept, so nothing on screen says why the card went.
- The same happens with no condition ticked (pw.js S1, a 240 kcal plate) and after a hold raised from Rescue (S4).
- The Builder shows no hold card after the reload.
- The plates on screen come from my canned model reply, so the kcal shown is mine. The request itself carries no model, and that part decides the
  breach. Run through the engine alone (`plan('meals')`) for this profile after the reload, with empty text:
  - nothing eaten, appetite 5: "Target for this meal: about 680 kcal", which equals the usual size by chance;
  - nothing eaten, appetite 2: about 620 kcal;
  - a 700 kcal breakfast: about 550 kcal, with the hook "this meal is lighter than usual";
  - a 900 kcal breakfast and appetite 2: about 410 kcal, with the same hook.
  None of these prompts has the "at least ... kcal" line. An honest model that follows the prompt writes a lunch of about 410 kcal for a client who has
  just typed that they take insulin. The usual size with medicines "Yes" is 680 kcal. The "lighter" wording is what the medicines wording rule keeps
  from a client on medicines by set-up.

The cause, read:
- `medsHoldOn` (src/v6/app.js:173) sets `UI.mhold`, which `save()` (:46) does not store.
- It also saves `STORE.shown={}`.
- On load, `renderPlate` (:619-620) sees no shown plate for the meal and calls `makePlates("")` by itself.

The counter-reading, answered. S6 says the typed words "hold the request", and the request after a reload carries no typed words. That was the reading
of the last audit's owner question. The owner then chose "All tabs", which makes the hold last "until My food is updated".

A second route, which the word "updated" may cover (owner to say). The client taps "Add it in My food", changes only the goal and taps Done.
`closeSheet` (:852) clears the hold because some answer changed. The 330 kcal plate comes back with no floor (executed, pw6.js). D14 says "updating My
food clears it and the plates are made again at the safe size", and that is not so on this route.

What flips the verdict: if the owner accepts that a fresh load ends the hold, B1 becomes a record item (S6 and D14 must say so) and the verdict is PASS.
Nothing else on this build fails.

Smallest fix:
- Store the hold on the phone. Set it in `medsHoldOn`, clear it in `medsHoldOff`, and read it in `load()` into `UI.mhold`, so a reload shows the card and
  does not auto-plan. Keep it outside the day's store: `refresh()` and `load()` drop that store at 4 am, while the hold in memory today survives the day
  change. How long a stored hold lasts is the owner's to say.
- In `closeSheet`, clear the hold only when the medicine answer or the diabetes tick changed, or let the owner rule on the route.
- Add a typed-meds.js cell with the reload: the saved store holds the hold and no pre-hold plate, and the first render is the card.

## MAJOR

None.

## MINOR

- m1. Mutant M5 survives typed-meds.js, check.js and phone-states.js. M5 drops `save()` from `medsHoldOn`, so the hold empties the plates in memory but
  the saved store keeps them. In Chromium on index.html with M5, a reload after the hold shows the pre-hold plate straight from the store, with no
  request. On the build itself it does not happen: `medsHoldOn` saves, and the reload plans a new plate instead (B1). The "hide:" cells stub `save()`. No
  cell in typed-meds.js, check.js, phone-states.js or review.js (read, not run) reads the saved store after a hold. That is a coverage gap: the builder's
  claim that the hold removes the plates from the saved store has no test. Fix: in the hold cells, read what `save()` would write.
- m2. Mutant M6 survives the same three suites. M6 removes the late-reply guard in `rescue()` (app.js:768). A Rescue reply sent before a hold would be
  kept in `UI.rres`. It is not drawn while held (:803), but it would show once the hold clears through a new Plate ask. The plates guard (M2) fails
  typed-meds.js; the Rescue one has no cell. On the build the guard is present, so there is no counter-example. Fix: one cell like "a plates reply sent
  before a hold came up is not shown", for Rescue.

Mutants that do fail (killed): M1 (no store clear in the hold), M2 (no plates late-reply guard), M3 (no Builder card) and M4 (Rescue dish drawn under the
hold). Each fails typed-meds.js; check.js passes all six.

Carried (not re-run):
- The schema snapshot is a sample, and server.ts settings are read by no check.
- `portionLine` can show a weight for part of the dish.
- Two app mutants survived on cad3fb0.
- S10 is direction only.

## BACKLOG (tier 2 or the list-gap class; none fails the audit)

The typed-medicine names the net does not read. These are not releases by a shape: the name is missed, so no hold starts. S6 lists brand gaps and no-name
phrasings as known misses. Searched under eval/ with grep, giving the count of hits for each pattern: insolin 0, insulim 0, metformn 0, glyciphage 0,
zomelis 0, zolmelis 0, oxra 0, cetapin 0, glimisave 0, tenepride 0, injection 0, "inject" 11 (all scenario ids "inject-cal" and "inject-supp"), goliyan 0,
"medication for" 0, "meds for" 0, "sugar ka" 0, "sui lag" 0, Devanagari गोलि, डायबिटीज़, मधुमेह and इनसुलिन 0 each. Devanagari characters occur 4,800
times, all in old v5 records, with no typed text or ask field among them. The typed fields hold one medicine sentence, "Can I stop metformin if I eat
millets?" (held). Under "Fix found, then watch" each item below is found, so it should be fixed and then watched.

- Devanagari, against the Latin list:
  - not held: इनसुलिन, इन्सुलीन, इंसूलिन; शुगर की गोलियां and शुगर की गोलियाँ (the plural; the Latin "goliyan" is held); डायबिटीज़ की दवा (the
    usual spelling with the nukta; the listed form has none); मधुमेह की दवा (the Latin "madhumeh" is held); ग्लाइकोमेट; मेटफार्मिन; मेटफ़ॉर्मिन;
    ग्लाइक्लाजाइड (written without the nukta).
  - held: the 12 MEDDEVA entries, alone and in a sentence; "insulin लेता हूँ"; "main इंसुलिन leta hoon".
- Generic phrases from the last audit's backlog, still not held: "sugar ka injection leti hoon", "sugar ki injection lagti hai", "diabetes injection at
  night", "injection for sugar", "sugar ki sui lagti hai", "meds for sugar", "medication for diabetes", "sugar control tablet daily", "goli khata hoon sugar
  ki" and "Sugar ki 2 goli". S6 names only "Post lunch I inject" and "I inject before meals" as no-name misses. These generic phrases sit next to the
  listed "sugar ki goli" and "tablets for my sugar", and S6 does not name them.
- Misspellings not held: "insolin", "insulim", "metformn". Held: inslin, insuline, ensulin, insullin.
- Brand names not held, for the clinician's list review: Glyciphage, Zomelis, Oxra, Cetapin, Glimisave, Tenepride. I did not check their spelling against
  the cited sources. The engine list has "zolmelis" (engine.js:846), which a clinician should compare with the source spelling.
- Food names with a wrong "plain" tag that the lists do not know (tier 2), from my 432-cell probe:
  - "Gajar halwa" is shown to a vegan and a dairy-free client;
  - "Jalebi" is shown to a wheat-free client;
  - "Mor kulambu" (a spelling of the watched "Mor kuzhambu") is shown to a vegan and a dairy-free client.
  With an honest tag each is dropped. Searched under eval/:
  - "halwa" 21 and "jalebi" 19 hits, all in dormant menu text, menu "as_written" fields, a v5 food log, or one v5 plate with no tags (dropped);
  - "mor kuzh" 18 hits, as plate items tagged dairy, or untagged and dropped;
  - "mor kul" 0.
- Carried: Rescue "Ensure with milk" with a dairy tag is helped (S9 reads "Ensure" only as a whole name or before a drink word, by design; re-run here).
  Also carried, not re-run: the khakhra forms, "kaanp", "sugar 50 hai", salty regional names with a "plain" tag, Hindi counts, and the log's
  `"grams" in it`.

## Owner question (named, not graded)

- What the Plate tab still shows under the hold. It shows "Your day", with the meal's energy figure from a set-up with no medicine. On screen, for my
  default profile, it read "Lunch: about 680 kcal". Computed, not drawn, for a 55-year-old woman after a 900 kcal breakfast, the target is 290 kcal at
  lunch, against a usual size of 590 kcal if My food said insulin. The example asks include "A light dinner after a heavy lunch", which the medicines
  wording rule keeps from a client on medicines by set-up. The written rule reads the set-up, so this is not graded. Should the hold also hide the meal
  figure and that ask?

## COSMETIC

- c1. S6 says "Every shape releases only text the d7702c4 net also released: the change only moves text from not held to held". That is not so on my
  strings. Of 7,728 strings drawn from the shapes (my fillers, greetings, marks and spacing), 410 are released now and were held on d7702c4.
  - 400 have line breaks between the words. The phone's one-line inputs cannot send them.
  - 10 are one doubled negation on one line: "I don't take tablets for my sugar or tablets for my sugar please", with greeting and mark variants.
  All 410 are negations; none is a present user. Over the 14,664 distinct strings under eval/, 0 moved. Fix: reword the sentence ("on the strings listed")
  or fold line breaks as the old net did.
- c2. S6 and D14 say nothing about the hold's life across a reload (part of B1).
- c3. src/v5/server.ts lines 14 and 20 still mention menu photos, which are unreachable. Carried.

## Points examined on purpose

1. Can a shape, the greeting allowance or the closing marks release a present user? I found none.
   - The last audit's grid: 0 of 504 released, and the 36 controls are held.
   - My new grid: 97 present-user frames (doses, times, "no M today", "ran out of M", "I don't take M regularly", a second name, shares, "my M", the doctor
     "started" or "put me on", Hinglish), times 18 names (English, brand, stem, Devanagari, upper case), times 25 wrappers. The wrappers cover the
     greetings, "!!", "...", the ellipsis, NBSP, double spaces, ideographic space, zero-width space and joiner, emoji, typographic apostrophes, upper
     case, and line break, tab, U+2028, underscore, dot, hyphen or comma between words. Result: 0 of 40,281 cells (with a name the net reads) released.
   - Why it holds, read: a release needs the whole text to match an anchored shape. `norm` (core.js:204) removes only format characters and Latin
     combining marks, so no readable word can vanish before the match.
   - Look-alike letters: "іnsulin" with a Cyrillic "і" is still held through the "[nio]sulin" stem. A Cyrillic "о" in "metfоrmin" is missed. That is a
     tier-2 look-alike: a Node search finds 0 Cyrillic characters under eval/.
2. "Hide them" and "All tabs" on every path, executed in Chromium unless marked. The checks count only what is visible (pw6.js, pw7.js). Under a
   Rescue hold, Rescue shows the note and no dish, move or "I had this". Builder and Plate show the card alone, and the plate card on a hidden tab is not
   visible. Two builder choices were left to me to judge.
   - The builder's first choice: a new ask or dish without the name clears the hold. I accept it, because the owner's own "ask again without the medicine
     name" line needs it. What follows from it, executed: tapping an example ask under the hold plans plates; tapping a common dish on Rescue clears the
     Plate hold too, and the Plate tab then plans by itself.
   - The builder's second choice: the hold is not kept across a reload. This is B1.
   - Under the hold, no plate, dish, move, "I had this" or "Show my last plates" is drawn, on any tab.
   - A late plates reply is not shown (typed-meds.js). A late Rescue reply is guarded in the code but untested (m2).
   - A late tune reply writes only to a plate object the hold has already dropped (read).
   - A meal tab keeps the hold (executed), and so does a Your day choice (typed-meds.js).
   - A logged meal's card is hidden under the hold, and the log row stays (typed-meds.js and the executed page text).
   - The Rescue dish is never stored, so no Rescue dish is restored after a reload (read: `save()`).
   - The saved store loses the pre-hold plates (executed). No test holds that (m1).
   - Nothing made before the hold can be halved through a move or a one-tap change: no plate or dish is drawn while held, and after a reload the plates
     are new. The typed text is not in place after a reload, since the ask and Rescue drafts are not stored.
3. Referral order, phone and engine. I compared the app's own `api()` with `plan()` over 1,755 cells, with 0 disagreements:
   - 9 profiles: none, diabetes with no, yes or not sure, BP, kidney, pregnancy, kidney on medicines, pregnancy not sure;
   - 5 bodies, three of them partial;
   - 13 texts (urgent, kidney, gurda, pregnancy, insulin, both);
   - 3 kinds, with the log compared on the body the phone sends.
   On the holds, the phone answers meds_typed where the engine answers body_partial. Both hold, as S6 and the fix-r21 order line state.
4. S6's limits. It states the brand-list gap, "Post lunch I inject", "I inject before meals" and the open "I am diabetic" question, and all four are still
   missed (executed). It states the counts the run prints (4,629 and 572; c1 of the last audit is closed). It does not state the reload (B1). It does not
   name the generic "sugar ka injection" or "medication for diabetes" class (backlog). Its monotone sentence is too strong (c1).
5. The standing rails.
   - Kidney and pregnancy refer when typed: 15 of my phrasings (Hindi and English, with insulin, CKD with metformin) x 4 profiles (one a partial body)
     x 3 kinds, 180 of 180 referred. The ticked conditions refer first on the phone and in the engine (point 3).
   - With diabetes the grain stays: a grainless plate is dropped at lunch with medicines no and yes ("diabetes-grain"), and kept at the snack and for no
     condition. recorded.js keeps the grain on every recorded main-meal plate.
   - No supplements: Protein powder shake, Horlicks, whey smoothie and Multivitamin are refused in Rescue ("diet"). "Ensure with milk" with a dairy tag
     is helped (backlog, by design).
   - Grams and kcal: the S8 scan in recorded.js (5,241 names) passes. The hold card carries no figure and no katori.
   - No invented figure: params.js is unchanged since 826224d, and the hold card states no number. The 680 and 590 kcal figures above are the engine's
     own `medsUsual`.
   - The length cap: 20,800 characters with "kidney" at the end refer in 1 ms; without a referral word they are refused (bad_request); 19,998 characters
     of "no insulin" hold (meds_typed) in 2 ms.

## Probed

- The last audit's B1 grid: 504 cells and 36 controls.
- New present-user grid: 40,281 cells (97 frames x 18 names x 25 wrappers, those the net reads).
- Monotone check against d7702c4's np-core: 7,728 shape-drawn strings, plus the 14,664 distinct strings under eval/.
- Devanagari: the 12 MEDDEVA entries (alone, in a sentence, and through `norm`) and 27 phrasings. Detection gaps: 36 phrasings.
- Phone and engine order: 1,755 cells. S7: 180 cells. Length cap and timing: 3 runs. Grain: 6. Rescue supplements: 6. Directive figure: 6 computed cells.
- B1 engine-only prompts: 5 cells (breakfast 0 to 1,200 kcal, appetite 2 and 5).
- Food rules with every tag "plain": 48 regional names of my choosing (Bengali, Tamil, Kashmiri, Gujarati, Hindi; plurals, negations with "minus",
  "without" and "-free") x 9 profiles = 432 cells. Results:
  - 7 barred cells shown: the three tier-2 names above, plus "Dal minus ghee" for vegan and dairy-free, which is an honest negation and S1's own reading;
  - 298 allowed cells shown.
  - A first run used the leave-out key "nuts" by mistake. The engine's key is "nut", so that run had no nut rule; I corrected it and re-ran.
- Chromium DOM probe: 5 flows in pw.js, 2 pages in pw5.js, 1 flow with two routes in pw6.js and 1 visible-scoped flow in pw7.js.
- App mutants M1-M6: each against typed-meds.js and check.js (12 runs), with M5 and M6 also against phone-states.js (2 runs).
- eval/ searches: 26 patterns.

## Not inspected

- test/ux/review.js was not run (its hold states were read). No screenshot was taken, and no visual or wording judgement is made here.
- The live model, Railway and the live site. Whether the model's own "medicines" line in the meals prompt would help after a reload is not measured, and
  it would not be a deterministic check.
- The v5 screens beyond the suites run on them; the dormant menu code; src/v6/plate.js; the lexicon word by word.
- params.js and core.js were not re-read this round, and neither were the unchanged regions of app.js (about lines 261-579 and 856-920). They are covered
  by the suites and by earlier audits.
- The carried minors and backlog items marked "not re-run".
- The brand spellings against their cited pages.
