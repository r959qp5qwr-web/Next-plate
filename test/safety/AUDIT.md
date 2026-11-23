VERDICT: FAIL
BUILD: c2379f962f11977354c39089b875ee45a99f1c75730e2c8c11d3ee4bdc966965

Safety audit of 3ee7b41 (branch claude/nice-hawking-307ljy), 23 Nov 2026. This file replaces the audit of 41e8ac0 (FAIL, B1). The scope is the whole
tree (src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) against docs/SAFETY-INVARIANTS.md, the two tiers, the
owner's rows in handoff-next-plate.md and docs/ux/UX-CRITERIA.md D14, with the owner's 23 Nov "Until updated (Recommended)" and "Hide all three
(Recommended)".
- How it was judged: I read every region changed since 41e8ac0 (`git diff 41e8ac0 3ee7b41 -- src/`: app.js and engine.js only), and the app.js code
  around the hold, the render of each tab, the sheet and the store. I did not take the builder's summary or counts on trust.
- App paths were driven in Chromium (Playwright, headless) on hosted/v6/index.min.html. /api was answered in my scratch folder by the page's own np-core
  `plan()` and `check()` on canned honest model replies. Probes read visible text and the requests sent. No screenshots were taken and no visual judgement
  is made.
- No file was changed but this one, and nothing was committed or pushed. The live model, the live site, Railway and env settings were not touched.
  test/ux/review.js was not run. No bypass setting was used.
- BUILD is from `bash test/ux/manifest.sh`. It read c2379f96...6966 five times, each with exit 0: before the build, after the build, after the main
  probes, after the first full write of this file, and after the last probe and the final write. It did not move.

## Commands and exit codes

- `bash test/ux/manifest.sh`: exit 0 five times, the same value each time.
- `npm run -s build`: exit 0. The three pages rebuild and the fingerprint does not move.
- `npm run -s safety`: exit 0. Figures from its own output:
  - recorded.js: 22,870 plate and profile checks, 15,433 shown;
  - carve.js: 1,191,495 cells;
  - inject.js: 162 leaves, 31,721 cells;
  - intake.js: 4,860 body cells;
  - typed-meds.js: 4,658 held, 572 not held;
  - phone-states.js: 15,522 requests, none refused;
  - 35 Codex probes hold.
- `node test/safety/check.js`: exit 0. `node test/safety/check.js hosted/v6/index.min.html`: exit 0. Each prints 314 ok lines and "every safety invariant
  holds".
- `npm run -s rules`: exit 0. `npm run -s words`: exit 0 (42 listed exceptions), and again after this file was written.
- `node test/deploy/schemas-accepted.js`: exit 0, PASS. The counts are meals 234 (the snapshot), tune 1, log 1 and Rescue 1, with 0 pending. Its own
  header says the enumeration is a sample and that server.ts is read by no check.

Every suite passes. The three BLOCKERs below are on this build all the same.

Summary:
- B1 of the last audit (a reload ends the hold) is closed. I executed reload, 4 am, a page open across 4 am, meal tabs, Builder, a goal-only change,
  unticking diabetes, Escape, the five corrupted stored values and every way out of My food, and none plans without the floor.
- New: 3 BLOCKER, 1 MAJOR (M1, tests that cannot fail for B1 and B2), 3 MINOR, BACKLOG, 2 owner questions and cosmetic items. The BLOCKERs:
  - B1 (S7) and B2 (S6) come in with round 7;
  - B3 (S1 and S6) is older code, present on 41e8ac0 too, and found now.
- The last audit's other items:
  - m1 is closed: mutant M5, no `save()` in `medsHoldOn`, rebuilt from this app.js, fails typed-meds.js (exit 1, 2 cells).
  - m2 is closed: mutant M6, no Rescue late-reply guard, fails typed-meds.js (exit 1, 1 cell).
  - c1 is closed: 0 of 7,728 strings are released now that d7702c4 held.
  - c2 is closed in part: S6 and D14 now state the hold's life. See c1 below for what they leave out.

## BLOCKER

### B1. S7: while the hold is stored, a typed referral is not shown, the urgent line included

S7: "Every surface shows the referral as a referral." This is tier 1: app logic alone, with a typed disclosure and no model reply.

Counter-example, executed (p1.js, p2.js, p4.js):
- Set-up: diabetes ticked, medicines "No", 47, 158 cm, 72 kg, at 1:10 pm.
- The client types "I take insulin, what lunch?". The hold card shows.
- Then the client types "my sugar is 50, feeling shaky" in the same box. That is a low-sugar sign in a client who has just said they take insulin.
- The phone answers it locally as an urgent referral (api() refers first, with no request). The screen still shows the hold card alone. Neither
  "If you feel unwell now, contact your doctor or emergency care." nor "Your coach and doctor should plan this with you." appears anywhere on the page.
  `#said` is empty and the ask box is cleared.
- The same happens on Rescue ("chest pain since lunch, dal rice", "Gurda fry") and on Plate ("I am pregnant, what lunch?").
- The grid in p4.js measures what is drawn, not what api() answers. It covers profiles x {no fact, stored fact} x {Plate, Rescue, log, Builder} x 4 typed
  texts (pregnancy, kidney, an urgent sign, gurda): 156 cells.
  - Not referred on screen: 24 cells, every Plate and Rescue cell with a stored fact for the three set-ups that do not satisfy `medsOnSetup` (diabetes
    with "No", no condition, BP).
  - Referred: every cell with no fact; every cell for diabetes with "Yes" (no hold); every kidney and pregnancy set-up (the blocked card comes first on
    Plate, Rescue and Builder); and the log sheet under the hold.
  - 8 cells could not be driven (no log row on the "None of the plates ..." card for a "Yes" profile) and are not counted.
- On the 41e8ac0 page the same steps show the referral and the urgent line (p1.js with PAGE set to that page). Round 7 brings this in: a new ask no longer
  clears the hold, and the render puts the hold card ahead of the reply.
- In api() the order holds: 3,510 cells (9 set-ups x 5 bodies x 13 texts x 3 kinds x {no fact, fact}) give 0 referral disagreements between api() and
  `plan()`. The screen loses it.

Where:
- src/v6/app.js:634 `if(medsHeld()&&!UI.busy){v.appendChild(medsCard(true));}` comes before the `r.status==="refer"` branch, which is never reached.
- src/v6/app.js:818 and :822 (`if(held&&!busy)v.appendChild(medsNote())`, `var r=held?null:UI.rres`): Rescue draws the note and drops the referral.

Smallest fix: draw a stored referral ahead of the hold. On Plate, test `r&&r.status==="refer"` (the reply for this meal) before the hold card. On Rescue,
draw `UI.rres` when its status is "refer" even when held, with the hold note under it. Add cells that read the drawn page, not `UI.rres`: an urgent sign,
pregnancy and kidney typed on Plate and Rescue under a stored hold show the referral and, for the urgent sign, the urgent line.

### B2. S6: exit (b) is reached with text the client did not type

S6 says exit (b) needs "text the client typed in the ask box or the dish box ... a chip, an example ask, Try again, the Builder and the page's own plans are
not typed". The owner's "Until updated" ends the hold when "the client types a new ask or dish". The box keeps the words of a failed example ask or
chip, and sending the box sets the typed flag. This is tier 1: app logic alone, or with an honest model reply.

Counter-example A, executed (p3b.js), with an honest model reply:
1. On Plate, the client taps the example ask "Only dal, rice and curd at home". The model's plate has no grain, the diabetes rule drops it, and the
   reply is "None of the plates made for you fit your food rules". The page puts the example's words in the ask box (`if(text)UI.askDraft=text`,
   app.js:246).
2. On Rescue, the client types "Rajma chawal, I take insulin". The stored hold comes up on every tab.
3. Back on Plate, the hold card shows and the ask box still holds "Only dal, rice and curd at home". The client taps send.
4. Result: the request goes with medicines "no" and no "at least ... kcal" line. The stored fact is removed, and a 330 kcal lunch plate is shown. The
   usual size with medicines "Yes" is 680 kcal for this body.
- The same route works offline: the example ask fails on the network, and its words stay in the box (p3.js, route B).

Counter-example B, executed (p3a.js):
1. On Rescue, the client taps the chip "Paneer butter masala with butter naan", and the reply cannot be read. The dish box keeps the chip's name
   (app.js:792 and :812).
2. On Plate, the client types "I take insulin, what lunch?".
3. On Rescue, the dish box under the hold note still holds the chip's name. The client taps send.
4. Result: the hold ends. The dish is shown with its moves, read with medicines "no". The Plate tab then plans by itself: medicines "no", no floor, and
   a 330 kcal plate.

The counter-reading: the client tapped send on words they could see in the box, so they asked again without the medicine name. Against it, the owner
hid the example asks and chips because only a typed ask counts ("Hide all three"), and these words are an example ask's and a chip's. What flips it: if
the owner rules that sending whatever is in the box counts as asking again, B2 becomes a record item, and S6 must say that a kept draft counts.

Where: src/v6/app.js:625 and :811 pass `typed=true` for whatever the box holds. The box is filled from `UI.askDraft` (:623) and `UI.rkeep` (:812), which
untyped requests set (:246, :247, :792, :793).

Smallest fix: mark the client's own keystrokes. Set a flag on the box's `input` event and clear it when the page fills the box. Pass typed only when the
flag is set. Or, when the hold comes up, clear an `askDraft` or `rkeep` that came from an untyped request. Add a cell that drives the box's submit with a
kept draft under a stored hold.

### B3. S1 and S6: a second open tab writes back the old answers over a My food change

The phone's store is one localStorage key (np6). Every `save()` writes the whole profile held in that page's memory, and nothing reads a change made in
another tab: there is no `storage` listener. This is tier 1: app logic alone.

Counter-example, executed (p6.js, p6b.js), with two tabs of the page in one browser:
1. Both tabs are open. The set-up says diabetes with medicines "No", and the fact is stored.
2. In tab A, the client taps "Add it in My food", chooses "Yes" and taps Done. The fact is removed and np6 says "yes".
3. In tab B, which was opened earlier, the client changes the Your day mood. Tab B's `save()` writes its profile back: np6 says medicines "no" again.
4. Tab A is reloaded, and the client taps "Plan my plates". The request goes with medicines "no" and no floor, and a 330 kcal plate is shown.
   - The client answered "Yes" a moment earlier, and the fact that would have held is gone.
- The same with a food left out. In tab A the client ticks "Leave out: dairy" and taps Done. One tap in tab B writes `leave: []` back. After a reload,
  tab A sends `leave: []`, and a paneer plate is shown.
- The My food line on tab A then reads "Vegetarian · North", so the client could see it if they looked. Nothing tells them.
- The same dairy flow on the 41e8ac0 page shows the paneer plate too (p6c.js with PAGE set to it). It is older code, not round 7.
- No earlier audit raised it: I searched all 18 versions of AUDIT.md in git history for "two tabs", "second tab", "another tab", "lost update", "storage
  event" and "overwrit", with no hit. No line in S6, D14 or the handoff speaks of two tabs.

The precondition is two tabs of the page open at once in one browser. On a phone, that happens when the WhatsApp link opens a second tab while an
earlier one is still open.

The counter-reading: a second tab is outside what the app sets out to handle. Against it, nothing on screen warns of it. The client's own answer is lost,
and the next plate breaks S1 or S6. What flips it: if the owner rules that one open tab is assumed, B3 becomes a known limit, and S1, S6 and the handoff
must state it.
- While tab B has drawn nothing since the hold came up in tab A, it still shows the earlier plate. Its first redraw shows the card (p6.js).

Where: src/v6/app.js:43-46 (`save()` writes `P` whole) and the load at :19-38, read once.

Smallest fix: before each `save()`, read np6 again and refuse to write over a profile or rules string newer than the one this page loaded. Simpler: add a
`storage` listener that reloads the page when np6 or np6meds changes in another tab. Add a two-page cell.

## MAJOR

### M1. Tests that cannot fail for B1 and B2

- typed-meds.js:363, "hold: an urgent sign typed under the hold is referred with the line to get help now, and the hold stays". The cell reads
  `UI.rres.status` and `UI.rres.urgent`, not the drawn page, so it passes on this build, where nothing is drawn. The phone-order cells (:265-277) and
  check.js read api()'s answer too.
- typed-meds.js:353-355, "hold: an ask or dish not typed by the client sends nothing". It calls `makePlates(t,false)` and `rescue(t,false)` directly, and
  never drives the box's submit with a kept draft, the one path where untyped text gets the flag.

Fix: drive the rendered Plate and Rescue (the page typed-meds.js already builds) and read what is drawn and what is sent.

## MINOR

- m1. A storage error on np6meds alone ends the hold on reload. In Chromium with `setItem` throwing for np6meds only (p5.js), the hold shows, and after a
  reload the page plans a 330 kcal plate with medicines "no" and no floor. The code comment at app.js:176 says "A storage error keeps the hold". That is
  so only for the page's life.
  - I found no route a client would meet. The quota is the only cause I know of, and the app's store is far under it.
  - With every storage call throwing, the page opens on set-up and sends nothing (p5b.js).
  - Fix: on a failed `setItem`, write the fact inside np6 as well, or plan nothing while the fact cannot be stored.
- m2. "hold: the hold ends in two places only" (typed-meds.js:395) counts `medsHoldOff()` calls. "Remove my data" removes np6meds itself
  (app.js:930), so the cell cannot see a third end. See owner question O1.
- m3. The fingerprint (test/ux/manifest.sh) lists check.js, recorded.js and the other safety files. It does not list test/safety/typed-meds.js,
  intake.js or phone-states.js, the files that test the hold and the body. A change to them leaves BUILD as it is.

## BACKLOG (tier 2 or the list-gap class; none fails the audit)

- Under a stored hold, a typed text that names no medicine the net reads ends the hold. Before round 7 such a text only failed to start one. Now it can
  end a hold that is already up, for a client who has already said they take insulin (n1.js: 38 of 82 of my phrasings would end it). S6, D14 and the
  handoff do not say so.
  - S6's known misses: "I inject before meals, lunch?", "Post lunch I inject".
  - Brands: Glyciphage, Zomelis, Oxra, Cetapin, Glimisave, Tenepride, Istavel, Glarituf, Wegovy, "Dapa 10".
  - Generic and clinical forms: "sugar ki 2 goli", "goli khata hoon sugar ki", "sugar control tablet daily", "sugar ke liye injection",
    "pet mein injection lagta hai", "I take my sugar shot", "doctor gave me a pen for sugar", "DM tabs bd", "OHA twice daily", "sulfonylurea daily",
    "GLP-1 weekly", "semaglutid weekly", "glimi 1mg".
  - Devanagari forms of the new Latin phrases: शुगर की सुई, शुगर का इंजेक्शन, डायबिटीज़ की गोली, मधुमेह की गोली.
  - With no name at all, a reply to the card: "yes it's mine, lunch please", "it is for me, not my mother. lunch?". These end the hold by the owner's
    own exit wording; see owner question O2.
  - Searched under eval/ (grep, counts of hits): wegovy 0, istavel 0, glyciphage 0, glarituf 0, "dapa" 0, OHA 0, "ke liye injection" 0, सुई 0,
    इंजेक्शन 0, गोली 0, "sugar shot" 0, "insulin pen" 0, "pen" 0, "i inject" 0, "glp-1" 0, zomelis 0, tenepride 0, glimisave 0, cetapin 0, oxra 0,
    "sulfonylurea" 105 (all in the meals prompt's own [steady_carbs] line, not typed text).
- The new names gain nothing on eval/: over 17,354 distinct strings (JSON values and lines of the other files), 0 are named now and were not on 41e8ac0,
  0 the other way, and 0 are held now and were not.
- Carried from the last audit, re-run (food.js, 432 cells), with every tag "plain":
  - "Gajar halwa" and "Mor kulambu" are shown to a vegan and a dairy-free client;
  - "Jalebi" is shown to a wheat-free client;
  - "Dal minus ghee" (an honest negation, S1's own reading) is shown to the same two.
  Same counts as before (7 barred cells shown, 298 allowed shown).
- Carried, re-run: Rescue "Ensure with milk" with a dairy tag is helped (S9 by design).

## Owner questions (named, not graded)

- O1. "Remove my data" removes the stored fact (app.js:930). After it, set-up starts again. With no condition ticked it asks no medicine question, and
  plates come with no floor (p5c.js: np6meds is gone and set-up shows). The owner's "Until updated" names two exits only, and S6 says "It ends only
  there". Keeping a health fact after the client asked to remove their data would go against the removal's own words. Which should hold? Either way, S6
  should name it.
- O2. A reply to the card that names no medicine, such as "yes it's mine, lunch please", ends the hold under exit (b) as written. The card asks the
  client to "Add it in My food". Is any text without a name meant to end it, or only one that reads as about someone else?

## COSMETIC

- c1. S6 says the hold "ends only there". It does not name "Remove my data" (O1), a missed name typed under the hold (backlog), or a storage error
  (m1). D14 and the handoff row say the same.
- c2. src/v5/server.ts lines 14 and 20 still mention menu photos, which are unreachable. Carried.

## Points examined on purpose

1. Paths while the fact is stored. All executed in Chromium unless marked "read".
   - Reload (p5.js): the card shows on Plate, Builder and Rescue. The meal figure, example asks, chips, "Plan my plates" and "Show my last plates" are
     hidden. Nothing is sent.
   - Three meal tabs: nothing sent. A page open across 4 am (the clock moved, then focus): nothing sent. A load after 4 am: the card, nothing sent.
   - My food, each time held and nothing sent:
     - goal only, then Done;
     - unticking diabetes, then Done;
     - ticking BP, then Escape;
     - diabetes again with "No", then Escape;
     - "No", then Done, then a reload.
   - My food "Yes" or "Not sure", by Done, Escape or a tap outside (p5b.js): the fact goes, and the plates request carries "at least 680 kcal", also after a
     reload. The canned 330 kcal plate is then dropped, as S6 requires.
   - Corrupted np6meds: "", "x", "null", '{"at":"bad"}' and "false" all hold, with nothing sent.
   - Every storage call throwing: the page opens on set-up and sends nothing. setItem throwing for np6meds only: m1.
   - Two tabs: B3.
   - Remove my data: O1.
   - Stored plates on load (p7.js): a saved plate, then the fact set and a reload. No plate shows and nothing is sent, and "Show my last plates" is
     hidden. Builder and Rescue show the card.
   - A late plates reply (p7.js): an ask held in flight, a hold raised on Rescue, then the reply released. The plate is not shown, before or after a
     reload.
   - Builder, Try again, chips and example asks (executed in p5.js and read): none sends or draws a plate while held. The kept-draft route is B2. A typed
     referral is B1.
2. Exit (b).
   - Untyped text reaches api() with the flag through a kept draft (B2).
   - A typed text with a name the net reads keeps the hold and sends nothing ("my mother takes insulin", "I don't take insulin"; the suite's 16 cells, and
     read in api()).
   - A medicine the net does not read ends it (backlog).
3. Earlier frames, re-run on this build:
   - audit22 and audit23 grids: 0 of 504 released, the 36 controls held;
   - the present-user grid: 0 of 40,281 released;
   - the monotone check against d7702c4: of 7,728 shape-drawn strings, 0 are released now that were held then (the line-break cases of the last c1 are
     gone), and 0 of the 14,664 eval/ strings.
   - The scripts read /workspace/Next-plate/hosted/v6/index.min.html. I checked their paths before running.
4. Referral order. In api() there are 0 referral disagreements over 3,510 cells, with and without a stored fact. On screen, a referral loses to the hold:
   B1.
5. S6, D14 and the handoff.
   - Stated: the lifetime ("Until updated"), the two exits, the hidden three, the brand gap and the known misses.
   - Not stated: c1, O1 and O2.
   - The over-holds list stands, and the stored fact adds a large over-hold of its own: every page-made plan stops until My food or a typed ask.
6. Standing rails (rails.js, re-run):
   - Kidney and pregnancy are referred when typed: 180 of 180 cells in the engine. On screen under a stored hold they are not: B1.
   - With diabetes the grain stays: a grainless plate is dropped at lunch with medicines "no" and "yes", and kept at the snack and for no condition.
   - No supplements: Protein powder shake, Horlicks, whey smoothie and Multivitamin are refused in Rescue.
   - Grams and kcal: the S8 scan passes (5,241 names). The hold card carries no figure and no katori.
   - No invented figure: params.js, core.js and server.ts are unchanged since 41e8ac0. The 680 kcal above is the engine's own `medsUsual`.
   - Length cap: 20,800 characters with "kidney" at the end refer in 1 ms. Without a referral word they are refused. 19,998 characters of "no insulin"
     hold in 3 ms.

## Probed

- Chromium flows:
  - p1 and p2: referral under the hold, 4 typed texts, plus a control and a run on the 41e8ac0 page;
  - p3, p3a, p3b: kept drafts, 3 routes;
  - p4: the drawn-referral grid, 156 cells;
  - p5, p5b, p5c: point 1 paths, 13 steps, 5 corrupted values, 5 ways out of My food (each with a reload), 2 storage-error cases, 1 data removal;
  - p6, p6b, p6c: two tabs, 4 flows, one of them on the 41e8ac0 page;
  - p7: stored plates on load, and a late reply.
- App mutants, run on typed-meds.js:
  - M5 and M6, rebuilt from this app.js: exit 1, killed;
  - M7, a partial B1 fix that draws a Rescue referral under the hold: exit 0. No cell objects to the fix.
- Engine and api():
  - the order grid: 3,510 cells;
  - typed medicine texts under a hold: 82;
  - new-name gains: 17,354 eval/ strings;
  - frames: 504 + 36;
  - present users: 40,281;
  - monotone: 7,728 + 14,664;
  - rails: 180 S7 cells, 6 grain, 6 Rescue, 3 length;
  - food rules: 432.
- eval/ searches: 22 patterns.

## Not inspected

- test/ux/review.js was not run (its hold states were read). No screenshot was taken, and no visual or wording judgement is made.
- The live model, Railway and the live site.
- params.js, core.js and server.ts were not re-read this round. They are unchanged since 41e8ac0, and the suites run them.
- The app.js regions far from the hold (about 261-579, the Builder shares and the drawing) were judged in earlier audits.
- The v5 screens beyond the suites run on them; the dormant menu code; src/v6/plate.js; the lexicon word by word; the brand spellings against their
  cited pages.
- Mutants were run on typed-meds.js only, not on check.js or phone-states.js.
