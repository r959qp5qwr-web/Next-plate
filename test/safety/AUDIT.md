VERDICT: FAIL
BUILD: 2248be0a797b369aeac983fce79f32b011ec919273d72bd20c9dcb1459350db5

Safety audit of a109dd1 (branch claude/nice-hawking-307ljy), 23 Nov 2026. This file replaces the audit of 3ee7b41 (FAIL: B1, B2, B3, M1, m1-m3, c1).
The scope is the whole tree (src/v5/core.js, src/v6/engine.js, src/v6/params.js, src/v6/app.js, src/v5/server.ts) against docs/SAFETY-INVARIANTS.md,
the two tiers, the owner's rows in handoff-next-plate.md and docs/ux/UX-CRITERIA.md D14, with the owner's four rulings of 23 Nov: "One ask only
(Recommended)", "Ends it (Recommended)", "Warn them (Recommended)" and "Counts as typed (Recommended)".
- How it was judged: I read app.js whole where round 8 touched it (the store merge, api(), the hold, the two boxes, the Plate and Rescue render, the
  sheets) and the engine's referral and medicine nets. `git diff 8bca167 a109dd1` shows no change to src/v5, src/v6/engine.js or src/v6/params.js.
  I did not take the builder's summary, counts or mutant list on trust.
- App paths were driven in Chromium (Playwright, headless, /usr/bin/google-chrome) on hosted/v6/index.min.html. /api was answered in my scratch folder
  by the page's own np-core `plan()` and `check()` on canned honest model replies (plates, Rescue, log and tune). Probes read the drawn page and every
  request sent. No screenshots were taken and no visual judgement is made.
- No file was changed but this one, and nothing was committed or pushed. The live model, the live site, Railway and env settings were not touched.
  test/ux/review.js was not run (its diff was read). No bypass setting was used. Nothing was written under eval/.
- BUILD is from `bash test/ux/manifest.sh`: 2248be0a...0db5 before the build, after the build, after every probe and mutant run, and after this file was
  written. It did not move.

## Commands and exit codes

- `npm run -s build`: exit 0. `git status --short` is empty after it; the fingerprint does not move.
- `npm run -s safety`: exit 0. It includes the new hold-browser.js (Chromium) on index.min.html. Figures from its own output:
  - recorded.js: 22,870 plate and profile checks, 15,433 shown; carve.js: 1,191,495 cells; inject.js: 162 leaves, 31,721 cells;
  - intake.js: 4,860 body cells; typed-meds.js: 4,658 held, 572 not held; phone-states.js: 15,522 requests, none refused;
  - check.js "Warn them": 3,447 cells, 279 referred only with the hold stored; hold-browser.js: 37 checks, 0 counter-examples; 35 Codex probes hold.
- `node test/safety/check.js`: exit 0. `node test/safety/check.js hosted/v6/index.min.html`: exit 0. Each prints 317 ok lines and "every safety invariant
  holds". Run on their own, with nothing else running.
- `npm run -s rules`: exit 0. `npm run -s words`: exit 0, also after this file was written.
- `node test/deploy/schemas-accepted.js`: exit 0. Meals 234, tune 1, log 1, Rescue 1 accepted; 0 not in the snapshot.
- The suites above first ran while my Chromium probes ran too. Every suite passed; check.js was run again alone (above).

## Summary

- One BLOCKER (B1, S1 and S7), no MAJOR, five MINOR, BACKLOG items, three owner questions and cosmetic items.
- B1 comes in with round 8's store merge. A My food sheet open in a second tab holds a tick the client made and can see. The merge drops it when the
  other tab saves the same answer. Kidney and pregnancy ticks are dropped this way and plates are drawn, and so is a Leave out choice.
- The last audit's items:
  - B1 is closed. On this page the audit24 frames show the referral above the hold card on Plate and Rescue, with the line to get help now on an urgent
    sign, and nothing is sent (p1.js: 4 of 4). The 156-cell grid (p4.js) reads the drawn page: 148 cells driven, 0 not referred. The 8 others are the
    same 8 the last audit could not drive (no log row on the "None of the plates" card for a "Yes" profile).
  - B2 is closed. p3.js route B, p3a.js and p3b.js: sending the kept chip name or example-ask words under the hold sends nothing and the hold
    stays. Mutants that set the mark on every send, on the dish box only, or that leave the mark set when the page writes the box, each fail typed-meds.js
    and hold-browser.js.
  - B3 is closed for the paths the last audit found. p6.js, p6b.js and p6c.js: tab B's tap no longer writes "No" or `leave: []` back; tab A then sends
    medicines "yes" with "at least 680 kcal", and `leave: ["dairy"]` with no paneer plate. A tab frozen over CDP (the state Chrome puts background tabs in)
    and a tab restored from the back/forward cache both receive the storage event and redraw (q2.js, q3.js). What is left is B1 below and MINOR m2 to
    m5.
  - M1 is closed. hold-browser.js drives the boxes and reads the drawn page. Twelve of my fourteen mutants fail it or typed-meds.js (list below).
  - m1 (a storage error on np6meds alone) is now a stated limit in S6. m2 is closed: a mutant that ends the hold on any sheet close fails typed-meds.js.
    m3 is closed: typed-meds.js, intake.js, phone-states.js and hold-browser.js are in the fingerprint.

## BLOCKER

### B1. S7 and S1: a tick made in My food in one tab is dropped when the other tab saves the same answer

S7: "A kidney condition or pregnancy/breastfeeding is referred, not planned. This holds whether it is ticked in set-up (alone or with other
conditions)". S1: "A food the client left out never shows". This is tier 1: app logic alone, no model reply.

Cause: My food changes `P` as the client taps; nothing is saved until Done. `storeSync()` ends with `MEM0=memNow()` (app.js:68), and it runs on every
storage event from the other tab (app.js:927). The client's unsaved tick therefore becomes this page's baseline. When the other tab later saves the same
answer, storeSync sees "changed there, not here" and takes the other tab's value into `P` (app.js:54-58). The open sheet is not redrawn
(`if(!UI.sheet)render()`), so the tick still shows. Done then saves the other tab's value.

Counter-example, executed (q8.js, q8b.js), two tabs of the page, diabetes with medicines "No":
1. Tab B: My food, tick "Kidney" (the sheet stays open; no Done).
2. Tab A: one Your day tap (any tap that saves).
3. Tab A: My food, tick "High BP", Done.
4. Tab B: the sheet still shows "Kidney" ticked. The client taps Done.
- Result: np6 says `conds: ["diabetes","bp"]`. Tab B draws a plate and no referral. Both tabs send /api/meals with health "diabetes", and tune requests
  follow. Reopened, My food in tab B shows Kidney unticked.
- The same with "Pregnant or breastfeeding" in step 1: the same result, a plate and no referral.
- The same with Leave out: B ticks "nuts", A saves, then A ticks "dairy" and Done, then B Done. np6 says `leave: ["dairy"]`, and both tabs plan with
  `leave: ["dairy"]`. B's sheet showed nuts ticked when the client tapped Done.

Two related shapes come from the same merge, with no tap between in tab A (q8.js, q5.js):
- B's own stale answer wins and A's is dropped. B ticks nuts, then A ticks dairy and Done, then B Done: np6 says `leave: ["nut"]`. Here B's sheet showed
  dairy unticked, so the client saved what they saw.
- A typed-medicine hold is stored, and the set-up has no condition. B ticks "High BP" (no Done). A answers diabetes with "Yes" through "Add it in My food"
  and Done: the hold ends and np6meds is removed. B taps Done. np6 says `conds: ["bp"]` with `meds: "yes"`, a set-up neither tab showed. The hold is
  gone, and the next plates go with medicines "no" and no usual size.

The precondition is the same as the last audit's B3: two tabs of the page open in one browser. It also needs My food open with a tick in one tab while
the other is used. Round 8 brings it in. Before round 8 tab B wrote its whole profile back, so B's kidney tick was kept and A's change was lost instead
(the last audit's B3).

The counter-reading: My food open in two tabs at once, with edits in both, is rare. Against it, for the first shape the screen shows the tick the
client made, and nothing says it was dropped. What flips it: if the owner rules that one open tab is assumed, this becomes a stated limit. S1, S6, S7 and
the handoff must then say so.

Smallest fix:
- In storeSync, keep MEM0's old value for each answer this page has changed and not yet saved, instead of `MEM0=memNow()`. Then an unsaved tick stays
  "changed here".
- Merge `leave` and `conds` item by item: an item added on either side stays, and an item removed on either side goes.
- Treat diabetes, its medicine answer and the hold as one answer.
- Or redraw an open My food sheet when a storage event changes an answer it shows.
- Add the four flows above to hold-browser.js, reading tab B's sheet before Done and the drawn plate after it.

## MINOR

### m1. "One ask only": the one-ask plate sends tune requests, and their "Try again" sends again, with medicines "no"

The owner's row (handoff line 143) says that after the one ask "everything else stays held (the next chip, example ask, Try again, Builder, auto-plan or
untyped send sends nothing)". S6 gives the same list.

Executed (q1.js), diabetes with medicines "No", the hold stored, the client types "something light with dal":
- One request goes to /api/meals, as the ruling says. The page then sends /api/tune for the plate on screen, with medicines "no" and no usual size.
- With three plates, "Next plate" twice sends two more tune requests.
- With the tune reply unreadable, the "Try again" under "One-tap changes and swaps didn't load" sends a tune request at each tap (3 taps, 3 requests).
- The ask's own Try again, New plates and Show my last plates send nothing, as ruled.

Why MINOR and not higher: api() holds plates and Rescue only (app.js:272-275), and S6 defines the hold over those two. The tune adds swaps and one-tap
changes to the one plate the owner already accepted without the floor ("costs one plate without the floor for that ask"). No new plate is planned. Owner
question O1 asks whether the swaps belong to that one answer.

Where: app.js:604 (`if(waitT)tune(curKey(),UI.sel)`), :617 (the tune Try again), api() :272.

The test: hold-browser.js:63 counts only `kind === 'meals'`, so the O2 cell cannot see a tune. Smallest fix: count every request after the one ask. Then
either hold /api/tune while the hold is stored (no swaps on the one-ask plate), or let S6, D14 and the handoff row say the one-ask plate's swaps are
fetched.

### m2. No test fails when the storage listener, or the store re-read in refresh(), is removed

Two of my fourteen mutants survive typed-meds.js, check.js and hold-browser.js (exit 0 each):
- B3L: the `storage` listener removed (app.js:927).
- B3R: `storeSync()` removed from `refresh()` (app.js:118).

On HEAD there is no counter-example. With two live tabs (q7.js), leaving out dairy in tab A puts away tab B's paneer plate at once, and a hold raised in A
shows B the hold card at once. On the B3L page the same steps leave tab B showing the paneer plate to a dairy-free client, and the earlier plate under
the stored hold, until B's next redraw. With the event swallowed on HEAD (q2.js), "I'll have this" on that stale plate logs the paneer plate.

The B3 cells test what is written after a tap in tab B, not what tab B shows. typed-meds.js runs its two pages "with no storage event". S6 and the
handoff list "a storage event from the other tab redraws at once" as part of the fix. That claim has no test. This follows the grading of surviving
mutants in the audit of 41e8ac0 (m1, m2): a coverage gap with no counter-example on the build.

Fix: one hold-browser cell with two live tabs that reads tab B's screen after a My food change and after a hold in tab A, with no tap in B.

### m3. "Remove my data", then a new set-up, while another tab is suspended: the removed food record is written back

`storeGone()` asks only whether np6 has no profile now (app.js:51).

Executed (q3.js), with the back/forward cache on (the page qualifies):
1. Tab B, with a logged meal from 20 Nov, goes to another address.
2. In tab A the client taps "Remove my data". Then a new profile is written to np6, as set-up writes one (the set-up steps were not driven).
3. Tab B comes back with Back (`pageshow` persisted). The storage event finds a profile, so B does not reload.
4. One Your day tap in B writes np6 with "OLD MEAL FROM BEFORE REMOVAL" in its events, beside the new vegan profile.

With the event swallowed instead (q2.js), the same happens. With the tab frozen over CDP, it did not. No S1-S12 rule reads it. The removal's own words are
"Remove your answers, your food record and today's plates from this phone". S6 and the handoff say that after a removal "the other writes nothing back
and reloads".

Smallest fix: write a store id at set-up and at removal. storeSync treats a changed id as "gone" and reloads.

### m4. A meal reopened in one tab is logged again by the other

Executed (q4.js):
1. Tab A logs lunch from the plate.
2. Tab A taps "Reopen lunch".
3. Tab B, opened before, makes one Your day tap.
4. np6 has the lunch event again. After a reload tab A shows "Lunch · from your plates", 330 kcal counted.

A replaced lunch ("I had something else") or "Skipped it" is not affected: the later event wins in the day's file (q4.js). S6 states this limit
("events are merged by addition"). D14 and the handoff row do not, and the owner has not ruled on it. No S1-S12 counter-example: the floor does not
read what was eaten.

Fix: carry removals in the merge (a removed-event list in np6, or compare against RAW0.ev for events this page removed).

### m5. A hold coming up in the same tab puts away a referral already drawn on the other view

medsHoldOn() empties `STORE.res`, `STORE.shown` and `UI.rres` (app.js:232), referrals included.

Executed (q6.js):
- Rescue "chest pain since lunch, dal rice" draws the urgent referral. Plate "I take insulin, what lunch?" raises the hold. Back on Rescue: the hold note
  alone, with no urgent line.
- Plate "feeling faint and sweaty, what lunch" draws the urgent referral. Rescue "dal chawal, I take metformin" raises the hold. Back on Plate: the hold
  card alone.
- Control (q6c.js): with a plain Rescue dish in place of the medicine one, the Plate referral stays.

The referral was drawn when it was answered, so S7 held at that moment. S6 states this limit for "the other" tab only.

Smallest fix: in medsHoldOn keep the `STORE.res` entries and `UI.rres` whose status is "refer". The render already draws them above the hold.

## BACKLOG (tier 2 or the list-gap class; none fails the audit)

- Medicine names the net does not read. Under a stored hold such a text is now the one ask (S6 states this). With a "No" set-up it is not held. Fresh
  batch (n2.js): 28 of 64 of my phrasings name nothing:
  - Brands: Dynaglipt, Zemiglo, Sitared, Trivolib, Glucored, Glyree, Ajaduo, Vildapride, Teniva, Dapanorm, Oxramet, Euglim, Tibrolin.
  - Generic and clinical: "mai roz subah ek goli leta hoon sugar ke liye", "I'm on oral hypoglycemics", "injectable for sugar", "pump and CGM", "diabetes ki
    dawaai", "sugar ki 1 goli", "DM medicines", "antidiabetic tablets", "hypoglycemic agents", "basal bolus", "bolus before lunch".
  - Devanagari (four also in the last audit's backlog): मधुमेह की गोली, डायबिटीज की गोली, शुगर का इंजेक्शन, शुगर की सुई.
  - Searched under eval/ (grep -ril): each brand above 0; dawaai 0; antidiabetic 0; hypoglycem 0; "DM med" 0; bolus 0; basal 0; injectable 0; CGM 0; सुई 0;
    इंजेक्शन 0; गोली 0; "ki 1 goli" 0; pump 14, all "pumpkin" or "pumping milk".
- Food with one tag left off, on a name the lists do not hold for that rule (food2.js; the same with a wrong "plain" tag): Gosht korma and Andey ka halwa
  shown to a dairy-free client; Badam halwa to a vegan and a dairy-free client; Mathri (in the wheat list, not in SALTY) to a high-BP client. The tag left
  off entirely: 0 of 441 shown. Honest tags: 0 barred shown. Searched under eval/: korma 0, mathri 0, halwa 7 distinct strings (sweets, and menus that are
  dormant).
- Referral and urgent phrasings (rails2.js): 30 of 31 fresh kidney and pregnancy phrasings refer on 4 profiles and 3 kinds. "feeding mother, 2 month baby"
  does not; postpartum is the owner's open question. The urgent net misses "sugar 60 hai" (no sugar figure is read, by design), "chest mein pressure hai"
  and "can't catch my breath". Searched under eval/: each 0.
- A model referral can be dropped. A Plate ask whose referral only the model catches (an unlisted spelling) is out. Meanwhile a dish naming a medicine
  raises the hold in the same tab. The late reply is then dropped by the guard at app.js:292, and the hold sends nothing for a re-ask. This needs a tier-2
  spelling. Not executed.
- Carried, re-run: Rescue "Ensure with milk" with a dairy tag is helped (S9 by design).

## Owner questions (named, not graded)

- O1. Are the swaps and one-tap changes of the one-ask plate part of that one answer (m1)? If yes, S6 and D14 should say tune requests are sent for it.
  If no, /api/tune should be held while the hold is stored.
- O2. "Skipped it" under the stored hold shows no low-sugar warning (q1.js: `#said` empty). The warning reads `onMeds()` (app.js:658), the set-up only. "Warn
  them" covers typed low-sugar signs, not a skipped meal. Should a client who typed that they take insulin get MEDSWARN on "Skipped it" while the hold is
  stored? (A clinician may want to say.)
- O3. With My food edited in two tabs (B1), which should stand? The tick the client can see, every tick from either tab until unticked, or the last
  Done?

## COSMETIC

- c1. handoff-next-plate.md line 222 says exit (b) "sits in one function, `medsExitB`". app.js has no such function; it is `medsOneAsk` (app.js:223).
- c2. S6 says `refresh()` re-reads the store "before any request is built". `logOther` (app.js:931) and `tune` (:309) build their bodies without
  refresh(). The storage listener covers it on HEAD (m2).
- c3. closeSheet() ends the hold on the close of any sheet (log, targets) when the set-up then says yes or not sure (app.js:924). S6 says "after Done". It
  is reachable only after another tab's My food change, which has already removed np6meds.
- c4. D14 and the handoff row do not carry S6's two-tab limits (a referral cleared in the other tab, a reopened meal written back; m4, m5).
- c5. src/v5/server.ts lines 14 and 20 still mention menu photos. Carried.
- The handoff row states that `npm run safety` now needs Chromium (hold-browser.js). The "Back to my plates" behaviour under the hold is stated there too.

## Probed

- The audit24 frames on this page:
  - p1.js: 4 typed texts plus a control.
  - p3.js: 2 routes. p3a.js and p3b.js.
  - p6.js: 6a, and 6b for medicines and dairy. p6b.js: 2. p6c.js.
  - p5.js: about 20 hold states (the reload, the meal tabs, 4 am, My food paths, five corrupted stored values, a throwing setItem).
  - p5b.js: five ends and a full storage failure. p5c.js.
  - p4.js: 156 cells, 148 driven, 0 not referred.
  - Note: p3.js route A taps the chips' caption, not a chip, so route A is not counted. p5.js's "Remove my data" line reads np6meds as still set. That is h.js re-seeding it after `sessionStorage.clear()`. p5c.js, q5.js and
    hold-browser.js read np6meds null after the removal.
- order2.js: 14,904 cells. The phone's own api(), medsOneAsk and medsReferProfile were run against plan(): 2 stored states x typed or not x 9 set-ups x 3
  bodies x 46 texts (my own: single low-sugar signs in Hindi and English, urgent, kidney, pregnancy, food, names, release shapes) x 3 kinds.
  - Rules checked: with no hold the referrals are equal; with the hold they are a superset with the urgent line kept; under the hold a request is sent
    only when typed, planned by the engine, naming no medicine and not referred; nothing the engine refers or holds is sent.
  - 0 counter-examples; 756 cells referred only with the hold; 156 one-ask sends.
  - One row (diabetes with an empty medicine answer) was taken out. profileOut() never sends that form: it sends "unsure".
- q1.js: the one ask and every request kind (2 runs: three plates, tune failing). Skipped it under the hold.
- q2.js: a missed storage event (frozen over CDP; swallowed), each with 4 flows (dairy, the hold, kidney then the log sheet, removal and a new set-up).
- q3.js: the back/forward cache, the same 4 flows.
- q4.js: the logged-meal merge (reopen, "I had something else", "Skipped it").
- q5.js: concurrent My food edits; five ends of the hold (Yes or Not sure by Done, Escape, a tap outside); "Remove my data".
- q6.js and q6c.js: the same-tab referral and its control. q7.js: live two tabs, on HEAD and on the B3L mutant.
- q8.js and q8b.js: My food open with an unsaved tick in tab B, against a change in tab A, with and without a save between (6 and 3 flows), to the drawn
  plate (B1).
- q9.js: (a) "Counts as typed": a kept example ask plus one key is sent once, with the hold stored. (b) A box value set with no input event sends nothing.
  (c) For the one ask with a Your day change during the wait, the reply is dropped and nothing is sent again. (d) "Back to my plates" on the one-ask
  plate leads to the hold card, and meal tabs send nothing. (e) A typed draft kept across a back/forward restore, edited by the client, is sent as the
  one ask. Each is as ruled.
- Engine, my own vocabulary:
  - n2.js: 64 medicine phrasings.
  - food2.js: 49 regional names x 9 profiles x 4 tag modes (441 cells each; 41 one-tag-off cells).
  - rails.js: 180 referral cells, the length cap, the grain, supplements. rails2.js: 372 referral cells and 40 urgent cells.
  - s6.js: 240 cells. Medicines yes and not sure, 2,600 kcal eaten, appetite 1/5/10, "very light dinner please, 200 kcal only", dinner at 12:30 am and
    9 pm. 0 plates under the usual size shown, and the prompt states it each time.
  - mono.js: 7,728 shape-drawn strings, 0 released now that d7702c4 held; 14,664 eval strings, 0.
- Mutants (src/v6/app.js and the unminified page, built in scratch), each run on typed-meds.js, check.js and hold-browser.js:
  - Failing at least one suite: B1P (no Plate referral above the hold), B1R (no Rescue referral), B2A (ask always typed), B2R (dish always typed),
    B2C (boxAsk leaves the mark set), B3S (storeSync does nothing), B3G (storeGone always false), O2N (the one ask ignores names), O2E (the one ask ends
    the hold), O2S (one-ask plates stored), W1 (no "Warn them" profile), E1 (any sheet close ends the hold).
  - Surviving all three: B3L and B3R (m2).
  - check.js alone fails only O2E and W1. hold-browser.js misses O2N and E1. typed-meds.js kills all twelve. I read each log's FAIL lines; each kill is
    the cell for what was changed. check.js passes O2N, so its "names no medicine" clause is not exercised by a named release shape there.
- Searches under eval/: listed with each BACKLOG item.

## Not inspected

- The live model and the live site. No live sample was taken, so the tier-2 items have no new live evidence either way.
- test/ux/review.js was not run (only its diff was read). No screen or visual state was judged.
- Firefox and Safari. The storage-event and back/forward-cache behaviour was observed in Chrome only.
- The Builder's share bounds (S14) and the S8 and S13 figure rules beyond the suites' own runs. The engine is unchanged since the last audit, which probed
  them.
- src/v5/app.js and the v5 page beyond the suites, which run on it.
