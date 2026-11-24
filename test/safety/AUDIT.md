VERDICT: PASS
BUILD: 8d266cbd8cae6744a728efe776351eba15eeab15d48db0e48bdd9a7919b59c94

Safety audit of f6a1c0c (branch claude/nice-hawking-307ljy), 24 Nov 2026. This file replaces the audit of a109dd1 (FAIL: B1, m1-m5, O1-O3, c1-c5).
The scope is the whole tree (src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) against docs/SAFETY-INVARIANTS.md,
the two tiers, docs/ux/UX-CRITERIA.md D14 and the owner's rows in handoff-next-plate.md, with the owner's rulings of 24 Nov: "Done saves that screen
(Recommended)", "Hide them (Recommended)", "Approve (Recommended)" and "Hold returns (Recommended)", and the earlier rulings still standing.
- How it was judged: `git diff 8d49c70 f6a1c0c` changes no file under src/v5, src/v6/engine.js or src/v6/params.js; src/v6/app.js changes (the store, the
  stamp, commit() and adopt(), the hold's life, tune under the hold, lowGuard). I read app.js whole and the engine's referral, medicine and Rescue move code.
  I did not take the builder's summary, counts or mutant list on trust.
- App paths were driven two ways: in Chromium (Playwright, headless, /usr/bin/google-chrome) on hosted/v6/index.min.html, with /api answered in my scratch
  folder by the page's own np-core `plan()` and `check()` on canned honest replies, and in my own two-tab world built on test/safety/minidom.js (the page's
  own scripts, unchanged) on hosted/v6/index.html, where I read the raw np6 JSON myself rather than a page reading it. No screenshots were taken and no
  visual judgement is made.
- No file was changed but this one, and nothing was committed or pushed. The live model, the live site, Railway and env settings were not touched.
  test/ux/review.js was not run. Nothing was written under eval/.

## Commands and exit codes

- `npm run -s build`: exit 0. `git status --short` is empty after it.
- `npm run -s safety`: exit 0. From its own output: recorded.js 22,870 plate and profile checks, 15,433 shown; typed-meds.js 4,658 held, 572 not held;
  check.js "Warn them" 3,447 cells; two-tabs.js 256 states with the event delivered and 960 withheld at depth 4, every cell 0 counter-examples.
- `node test/safety/check.js` on hosted/v6/index.html: exit 0. On hosted/v6/index.min.html: exit 0.
- `npm run -s rules`: exit 0. `npm run -s words`: exit 0 (run again after this file was written: see the end).
- `node test/deploy/schemas-accepted.js`: exit 0 (meals 234, tune 1, log 1, Rescue 1 accepted; 0 not in the snapshot).
- The suites first ran while some of my probes ran too. Every suite passed.

## Summary

- No BLOCKER and no MAJOR. Four MINOR items, BACKLOG items, three owner questions and cosmetic items.
- Docs: S7's row carries no two-tab sentence, although a stale sheet's Done in another tab can undo a ticked kidney condition or pregnancy (ruled,
  limit 1 in S6; c1, O2).
- The last audit's items:
  - B1 is closed as ruled. My own re-runs of q8 and q8b in Chromium and their port in two-tabs.js agree: the tick tab B shows at Done is the tick
    saved (Kidney, pregnancy, Leave out nuts), kidney and pregnancy are then referred on both tabs and nothing is planned, and both tabs plan with what B
    saved. The set-up under the hold: B's Done saves "bp" alone, np6meds stays, and both tabs draw the hold card ("Hold returns").
  - m1 is closed ("Hide them"): q1 on this page sends one plate request for the one ask and nothing else (no tune, no tune Try again; 3 plates, Next
    plate x3, a failing tune).
  - m2 is closed for the listener and the refresh() read (q7, q2 cells exist and kill the listener and refresh mutants N18, N17). What is left of the
    "event missed" class is MINOR m1 below.
  - m3 (epoch), m4 (reopened meal) and m5 (a referral kept when a hold comes up) are closed: q3 (back/forward cache, 4 flows), q4 (3 flows), q6 and q6c
    on this page behave as ruled.
  - O1 and O2 are answered by the owner (24 Nov) and built: under the hold the one-tap row, swaps and their Try again are hidden and /api/tune sends
    nothing; "Skipped it" shows MEDSWARN on the card and in #said under the hold, and the snack stays offered after a skipped meal (q1, two-tabs.js).
  - O3 is answered ("Done saves that screen"). c1-c4 are fixed; c5 is carried.

## MINOR

### m1. With the storage event missed, opening and closing a sheet, or a tune reply, takes the store in with no redraw, and the refused tap is bypassed

S6 says: "A tap that logs or changes what a drawn plate or dish shows (act()) is not made when another tab wrote since the screen was drawn ... so a plate
the other tab's change put away cannot be logged", and "a storage event from the other tab runs the same check sooner, and nothing depends on it".

act() refuses only when its own storeCheck() returns "moved". Two readers take the store in and move STAMP without drawing the screen again:
- openSheet() (app.js:941) runs storeCheck() and then sets `UI.sheetR` to the new revision; closeSheet() (app.js:954) draws again only when
  `STAMP.r !== UI.sheetR`. So My food closed with nothing changed, "How these numbers are worked out" and the log sheet each leave the old screen behind
  them with STAMP up to date.
- The tune reply (api() callback app.js:302, then app.js:333-336) takes the store in and returns without a render when the plate is gone from the
  store (the other tab's hold emptied it).

Executed, my minidom world, storage event withheld (s1.js, s2.js):
1. Tab A: My food, Leave out dairy, Done. Tab B still draws its paneer plate (no redraw yet, as with the event missed).
2. Tab B: open and close My food with nothing changed (also: "How these numbers are worked out", or the log sheet).
3. Tab B: "I'll have this". np6 gets `had: Paneer bhurji with bajra rotla`; #said says "Counted for lunch." The store says `leave: ["dairy"]`.
- Tune variant: tab B's tune request is out; tab A raises the hold (typed "I take insulin"); B's tune reply lands. B keeps drawing the plate made without
  the floor, with no hold card; "I'll have this" logs it.
- With the event delivered, every flow redraws (the paneer plate goes; the hold card shows) and nothing is logged.
- Chromium on the served page (c1.js): with the storage event stopped in tab B by a capturing listener, steps 1-3 log the paneer plate. With the event
  delivered it did not happen: in one instrumented run (c1b.js) Chrome delivered the storage event before the page could read A's new value, so the
  tap did not land between them. c1.js has no plain control (its third variant ran as a second race); the delivered case is the minidom one above.

Why MINOR: it needs the event to be missed, and no focus, pageshow or visibilitychange that draws the screen again before the tap (onReturn does;
whether returning to a tab on a phone fires them first was not observed: headless pages never hide). This is the grading of the last audit's m2. But the two S6 sentences above are not true in that state, and no test can see it:
two-tabs.js taps a redraw before its (b) checks when the event is withheld, and its q2 log-tap cell has no sheet between the write and the tap.

Smallest fix: record the revision the screen was drawn at (set in render()) and have act() refuse when STAMP.r differs from it; or have openSheet()
take UI.sheetR before its storeCheck(), and the tune callback render when its plate is gone. Then add a withheld cell with a sheet opened and closed
(and one with a tune reply) between the other tab's write and "I'll have this".

### m2. Under the stored hold, the one ask's answer reads the set-up's medicine answer in two places that lowGuard() does not cover

S6 (round 9, under "Warn them") says: "Every low-sugar safeguard that reads the set-up's medicine answer also applies while the hold is stored ... Each
reader can only add a warning or keep food offered; the other readers of the medicine answer (the request's profile, the medicine question in My food and
set-up, and the answers and rules signatures) guard no warning." Two readers are missing from that list, and both guard something:
- The Rescue move floor. The engine's rescueMoves (engine.js:611-616) keeps a portion move above `p.medsUsual`, and the app's composedWhy (app.js:143)
  reads `medsUsual(profileOut())`. Under the hold the profile says no medicines, so neither floors.
- The medicines wording rule. hookProf (app.js:147) reads `has("diabetes")` and `medsUsual(profileOut())` for hookSaid.

Executed (s4c.js, s3.js), the hold stored, the one ask typed (no medicine name), as "One ask only" allows:
- Rescue, set-up none (and set-up diabetes with medicines "No"), 1,400 kcal eaten at breakfast, "chole bhature, full plate": the move "Eat about three
  quarters and leave the rest" (162 kcal less) is drawn, ticks, and "I had this" logs 488 kcal. The usual size on medicines for this lunch is 680 kcal.
  Control, diabetes with medicines "Yes": no portion move is offered.
- Plate, set-up none, 9:45 pm: "Planned around: a late dinner" and "Planned around a late dinner." on the one-ask plate. Set-up high BP after a
  1,500 kcal breakfast: "Planned around lighter after earlier meals." The client typed that they take insulin.

Why MINOR: the owner ruled that the one ask's answer is drawn without the floor ("One ask only"), and "Hide them" names the one-tap changes and swaps of
the one-ask plate, not Rescue moves or hook wording. This is the same class as the last audit's m1, an owner question (O1) and a docs item. If the owner
reads "every low-sugar safeguard" to include the move floor and the wording rule, it becomes a tier-1 S6 item.

Smallest fix, if the owner wants them: under the hold, hide the Rescue moves of the one-ask dish (as "Hide them" does for the plate) and pass
`medsReferProfile()` to hookProf; or list both readers in S6's sentence as not covered.

### m3. The two-tab tests cannot see a close with nothing changed, a write while My food is open, or the served page

S1 and S7 in two tabs (round 9): no test fails when the second tab stops taking the store in after My food is closed with nothing changed.

Mutants of app.js (35, list under Probed) that change a two-tab path and survive every suite I ran:
- N27: closeSheet() no longer takes the store in when nothing changed (app.js:953). Survives two-tabs.js at depth 4, typed-meds.js, check.js
  and hold-browser.js. On that mutant (s7.js), with the event delivered: tab B opens My food and changes nothing; tab A leaves out dairy (or ticks Kidney) and taps
  Done; B closes with Escape or a tap outside. B then plans with `leave: []` and draws the paneer plate, or plans and draws a plate for a client whose
  store says kidney. On HEAD the same 12 cells take the store in (dairy left out; kidney referred, nothing sent).
- N29: closeSheet() no longer draws again when another tab wrote while the sheet was open. Survives two-tabs.js at depth 4 and hold-browser.js. It leaves the old
  screen with STAMP current (the m1 path, with the event delivered).
- N2: a single tap writes this page's P instead of the stored answers. Survives two-tabs.js at depths 3 and 4, hold-browser.js, typed-meds.js and
  check.js. It differs from HEAD only for a write made while My food is open with an unsaved change (a reply landing then), which no cell has.
- N12 (pageshow, focus and visibilitychange do nothing; two-tabs.js at depth 3 and hold-browser.js), N4 (the "store lost its answers" check; two-tabs.js at depth 4 and hold-browser.js), N26 (a goal or focus tap from Your day
  is not written, not a safety rule; two-tabs.js at depth 4).
- Equivalent or near-equivalent, not counted as gaps: N7 and N22 (a store check before sending that api() or the caller repeats), N8, N10 (a Rescue
  reply under the other tab's hold, which the render hides anyway), N13.

The cause is the enumerator's actions: My food opens only by ticking, so "open, change nothing, close" needs depth 5, and the log and targets sheets are
not actions. Its (a) check reads the store through a fresh page (the page reading itself). It ticks only the medicine answer and Kidney.

The served page: package.json runs two-tabs.js on hosted/v6/index.html only. On hosted/v6/index.min.html it stops at once ("ReferenceError: UI is not
defined": it reads app names the minifier renames), so hold-browser.js is the only two-tab test of the page the server sends. hold-browser.js passes
N1 (commit() without the stamp check), N2, N3 (the epoch check off), N4, N6 (act() never refuses), N7, N8, N9 (a plates reply under the other
tab's hold drawn), N10, N12, N27 and N29. The minified page is built from the same source,
so this is coverage, not a counter-example.

Why MINOR: no counter-example on HEAD. N27 shows what a regression there would cost (S1, S7) with nothing failing.

Smallest fix: add "open My food" (no tick), "open and close the log sheet" and "open and close How these numbers" as enumerator actions; a cell for open,
nothing changed, the other tab saves, close; a cell with a reply landing while My food has an unsaved change; read the raw np6 for (a); and a two-tab
cell in hold-browser.js for the refused tap and the epoch.

### m4. A tab with My food open sends and stores requests for answers the store no longer has, and a write that fails is reported as saved

S7 and S1 as stated in S6's two-tab paragraph and in the api() comment; no client-visible counter-example.


- My food open in tab B (opened before tab A's change, nothing changed in B). Tab A ticks Kidney (or leaves out dairy) and taps Done. B's plates reply,
  sent before, lands: it is drawn behind B's sheet, stored in np6 (made under B's rules) and a tune request goes out for it with no kidney (c3.js, Chromium;
  "meals out in B, A kidney, My food open in B"). The same with Rescue (the dish is drawn behind the sheet). This follows "the answers it shows are left as
  they are"; nothing reaches the screen unless B's sheet is then saved (limit 1, ruled), and a close with nothing changed takes the store in and drops
  them (tested above). But the comment in api() (app.js:272-273: "nothing is sent with the old answers") and S6's "The stamp is checked before every
  request is built and sent" read as if no request leaves with answers the store no longer has. src/v5/server.ts:21 says kidney and pregnancy get "no call".
- commit() catches a failing setItem and returns true (app.js:69-76). With np6 writes failing (s5.js), a Kidney tick and Done refer for the page's life;
  after a reload the tick is gone and a plate is drawn, with no line on screen. S6 states this limit for np6meds only. I found no way the app's own data
  fills the store (the log is cut at 3,000 events and plates at 12), so no client path.

Smallest fix: S6 and the api() comment say requests made while My food is open carry the sheet's answers; and either a line when a My food save cannot
be written, or the limit stated for np6 beside the np6meds one.

## BACKLOG (tier 2 or the list-gap class; none fails the audit)

- Plate names with a wrong "plain" tag, on names the lists do not know (e1.js; 75 names x 10 profiles, 750 cells, 10 shown that a rule bars):
  Mattha (dairy) to vegan and dairy-free; Aate ka halwa and "Aata halwa" (atta spellings; "Atta halwa" is caught) and Jalebis to wheat-free; Gajar ka
  halwa, Gud wali chai and Mango shake to vegan and dairy-free; also Masala chai to dairy-free. Honest tags drop all of them. Searched under eval/
  (grep -ril): mattha 0, "aate " 0, "mango shake" 0, milkshake 0, "gud wali" 0, "gajar ka halwa" 0; jalebi 13 files, all menu text (dormant); halwa 16
  (sweets and menus); aata 5, all the verb ("urine mein protien aata hai"), so "aata" as a wheat word would need its neighbours; "masala chai" in log
  text and a Rescue dish only.
- Counts written in Hindi words that the name rule keeps (e1.js): "Paav bhar paneer", "Dhai sau gram dahi", "Ek kadhai paneer", "Paanch badam" show
  as written. Searched: "paav bhar", "pav bhar", "dhai sau", "ek kadhai", paanch: 0 each.
- Referral and urgent phrasings (e2.js; 25 fresh phrasings x 4 profiles x 3 kinds, 300 cells): "pre-eclampsia, what dinner", "uremia", "9 mahine ho
  gaye" and "I am carrying, 5 months" are not referred; the urgent net does not read "sugar 50 aa gayi" (no sugar figure is read, by design; also
  "sugar 60 hai" last audit). Searched: eclampsia, uremia, uraemia, "mahine ho", carrying, "sugar 50": 0 each. Carried: "feeding mother, 2 month
  baby" (postpartum, the owner's open question), "chest mein pressure hai", "can't catch my breath" (rails2.js, re-run: same).
- Rescue supplements with a non-supplement tag and a plain model name: "Glucon-D" and "chyawanprash with milk" are helped; the ten others (Protinex,
  Horlicks, Bournvita, B12 tablet, fish oil capsule, protein powder, multivitamin, Ensure, whey, Complan) are not. Searched: glucon 0, chyawan 0.
- Medicine names the net does not read (n2.js re-run): 28 of 64, as listed in the last audit; under a stored hold each is the one ask.
- Carried, re-run (food2.js): Gosht korma, Andey ka halwa and Badam halwa with one tag left off; Mathri for high BP.

## Owner questions (named, not graded)

- O1. Under the stored hold, should the one ask's Rescue dish show its moves (a portion move under the usual size is offered, m2), and should the
  one-ask plate say "lighter" or "late" hooks? "Hide them" covered the one-tap changes and swaps of the plate only.
- O2. A stale sheet's Done that changed nothing still writes the whole screen (s7.js, "B Done": a Kidney tick or a dairy Leave out made in the other
  tab is undone, and plates follow). This is ruled ("Done saves that screen") and stated as limit (1) in S6. Should a Done in a sheet where nothing was
  changed write nothing, as a close with nothing changed does; or should a kidney or pregnancy tick made in either tab stand until unticked?
- O3. Requests made while My food is open use the sheet's answers (m4). Should a tab with My food open send nothing until the sheet is closed?

## COSMETIC

- c1. S7's row has no two-tab sentence: a ticked kidney condition or pregnancy can be undone by a stale sheet's Done in another tab (limit 1 is in S6
  only). S1's row has its two-tab sentence.
- c2. D14 still says "updating My food clears it and the plates are made again at the safe size" and "until My food is updated, which clears the hold"
  (UX-CRITERIA.md:715 and :718); "Hold returns" replaced that, and the same entry says so further down.
- c3. S6's list "refresh(), tune(), logOther() and api() itself" for the check before a request is built: rescue() builds its body before api()'s check.
  api() catches it (the reply path asks again), so this is wording.
- c4. Carried: src/v5/server.ts lines 14 and 20 still mention menu photos.

## Probed

- Chromium, served page (hosted/v6/index.min.html):
  - c1.js: the m1 flow with the storage event stopped in tab B, the same with a same-task race, and a control; c1b.js: the same race instrumented
    (storage, focus, pageshow, visibilitychange and redraw times).
  - c3.js: replies in flight in tab B (plates, Rescue, log, tune) across tab A's Leave out save, Kidney tick, hold raise, hold return (unticking
    diabetes) and "Remove my data", each with My food closed and open in B: 36 cells driven (log under the hold return and the removal not driven: no log
    row on that card). Raw np6 read each time. Every reply that lands after a hold, a referral or a removal is dropped, asked again or answered by a reload
    when B's sheet is closed; with B's sheet open, see m4.
  - c5.js: a tap outside My food after Yes saves (meds yes, "at least 680 kcal"); q5's own "outside" coordinate lands on the card.
  - c7.js, the served page: (1) My food open in B with nothing changed, A leaves out dairy or ticks Kidney and taps Done, B closes with Escape or a tap
    outside (4 cells): B plans with leave ["dairy"], or draws the referral and sends nothing. (2) B's plates reply lands behind its open sheet after
    A's dairy or Kidney save (2 flows): np6 holds B's paneer plate, A draws no paneer (or the referral), A's next request leaves out dairy (or nothing
    is sent), also after a reload. (3) The returned hold, driven from a floor plate on screen with its one-tap row ("at least 680 kcal", 2 one-tap
    buttons, 3 example asks, the directive and the meal figure), two ways (unticking diabetes in the same tab; a stale sheet's Done in the other tab):
    the hold card comes back with no plate, one-tap button, example ask, directive or meal figure and nothing sent; the one ask then sends one plate
    request (medicines no, no floor) drawn under the hold card with no one-tap row; Yes again plans with "at least 680 kcal" and sends tune.
  - c8.js, the served page: m2's Rescue cell (the portion move under the hold, logged at 488 kcal; none for the control with medicines Yes).
  - The audit25 frames re-run: q1, q2 (frozen and swallowed, 4 flows each), q3 (back/forward cache, 4 flows), q4 (3), q5, q6, q6c, q7, q8 (6 flows),
    q8b (3), q9 (a-e). Each is as ruled on this page; q2's swallowed flows show the old screen until a redraw (the m1 class) and the refused tap holds.
  - The audit24 frames re-run: p1 (4 typed texts under the hold and a control: the referral above the hold card, the urgent line on the two urgent texts, nothing sent), p3 (2 routes), p3a, p3b (kept chip and example-ask words send nothing under the hold), p4 (156 cells, 148 driven, 0 not referred; the 8 others are the same 8 the last two audits could not drive: no log row on a "Yes" profile's card),
    p5 (about 20 hold states: reload, meal tabs, 4 am, My food paths, five odd stored values, a throwing setItem; each as ruled, the throwing setItem
    being S6's stated limit), p5b (five ends: Yes or Not sure by Done, Escape or a tap outside switch the hold off with "at least 680 kcal"; No keeps
    it), p5c ("Remove my data" deletes np6meds and writes a new epoch), p6, p6b, p6c (a second tab's tap keeps the first tab's Yes and dairy), p7
    (stored plates under the fact; a late plates reply after a hold). p5's and p5b's "after Remove my data" lines read np6meds as set: that is h.js
    seeding it again after sessionStorage.clear(); p5c reads it null. p5's own "tap outside" lands on the sheet card (c5.js shows a tap outside saves).
- My minidom two-tab world (hosted/v6/index.html; raw np6 read directly):
  - s1.js (4 sheets x 2 event modes), s2.js (tune reply across a hold or a Leave out save, 2 event modes): m1.
  - deep.js: random flows of up to six actions over two tabs (Leave out dairy and nuts, Kidney, pregnancy, diabetes, Yes, No, Done, Escape, a Your day
    tap, a typed insulin ask, the one ask, "I'll have this", the targets sheet, "Remove my data", reload, back/forward): 800 sequences, 4,768 steps, event
    delivered and withheld (with one redraw tap), 0 counter-examples. Two earlier runs (600 sequences) found only my checker's error (the medicine
    question is not shown beside a referral) and, with the event withheld and no redraw tap, the old screen (the m1 class).
  - s3.js, s4.js, s4b.js, s4c.js: the one ask under the hold (m2), 13 profiles.
  - s5.js (np6 writes failing), s6.js (8 corrupted np6 stamps and stores: missing, null, a number epoch, a string revision, a lower revision, the same
    revision with other answers, invalid JSON, answers not an object; each is read again or reset, no crash, nothing old written back), s7.js (12 cells
    on HEAD and on N27).
- The phone against the engine: order3.js (audit25's order2 with stubs for storeCheck and commit): 14,904 cells, 0 counter-examples; 756 referred only
  with the hold; 156 one-ask sends.
- The engine, my own vocabulary: e1.js (750 plain-word cells, 12 negations, 18 counts and measures, the grain at four meals: 0 plates without a grain at
  breakfast, lunch or dinner with diabetes); e2.js (300 referral cells, 40 urgent cells, 12 supplements x 2); re-run of food2.js (441 cells x 4 tag modes),
  rails2.js (372 + 40), s6.js (240 cells: 0 plates under the usual size shown), n2.js (64), mono.js (7,728 shape-drawn strings and 14,664 eval strings,
  0 released now that d7702c4 held).
- Mutants: 35 in scratch (app.js and the unminified page with one change each), run on two-tabs.js (depth 3), typed-meds.js and check.js; survivors at
  depth 4 and on hold-browser.js. 
  - Killed by at least one suite (24): B1P, B1R, B2A, B2C, B2R, O2N, O2E, O2S, W1, E1 (the last audit's, re-made on this code); N1 commit() without the stamp check; N3 the epoch check off; N5 an open sheet's answers not kept; N6 act() never refuses; N9 a plates reply under the other tab's hold drawn; N11 the tune reply's answers check off; N14 lowGuard() reads the set-up only; N15 tune sent under the hold; N16 the one-tap row drawn under the hold; N17 refresh() without the store check; N18 the storage listener off; N19 a yes or not-sure save deletes np6meds; N25 storeCheck() never takes the store in; N30 api() no longer refers a kidney or pregnancy set-up first.
  - Surviving: N2, N4, N12, N26, N27, N29 (m3), and N7, N8, N10, N13, N22 (equivalent or near-equivalent, m3). N22 was run at depth 3 only.
  - hold-browser.js was run on 13 of them (N1 to N10, N12, N27, N29); it fails only N5 (its q8 cells). The last audit's B3S, B3L, B3R and B3G cannot be
    re-made (storeSync, storeGone and the merge are gone); N25, N18, N17, N3 and N4 stand in for them. O2E now deletes np6meds at the one ask (the old one
    called medsHoldOff, which no longer deletes). audit24's app mutants (appM5 to appM7) were not re-run.
  - I read the FAIL lines of every killing log (two-tabs, typed-meds, check.js and hold-browser.js): each kill is a behavioural cell for what was changed
    (N11's is check.js "m3 app S11: a stale tune reply is not shown").
- Searches under eval/: listed with each BACKLOG item.

## Not inspected

- The live model and the live site. No live sample was taken, so the tier-2 items have no new live evidence either way.
- test/ux/review.js was not run. No screen or visual state was judged.
- Firefox and Safari. Whether they deliver the storage event to a background tab, and in what order against a read, was not observed (m1).
- Whether returning to a tab on a phone fires visibilitychange or focus before the first tap lands (m1): headless Chromium pages never hide.
- Two browser processes writing in the same instant (S6 limit 3).
- The Builder's share bounds (S14) and the S8 and S13 figure rules beyond the suites' own runs: the engine is unchanged since the last audit.
- src/v5/app.js and the v5 page beyond the suites, which run on it.
