VERDICT: FAIL
BUILD: 9400dabe36b4b6d6ee664acd81cd5323a1165b3c65a502db0770007c648db571

# Critic round 30: the grain question on a menu order (owner decision of round 28), round 29 fixes

Reviewed: git diff 1bc90c9..e617345 (src/v5/core.js, src/v6/engine.js, src/v6/app.js, the three built pages, test/rules/check.js,
test/ux/review.js, docs/ux/UX-CRITERIA.md "Part A, changes after Critic round 29"). The owner decision stands; this round judges how it
is carried out.

## Measured (run by me on this build)
- npm run drill: every planted fault caught.
- npm run review: 9 runs, 50 states, 450 checks, no violations, no page errors.
- npm run rules: "every rule check holds" on all three pages (483 ok lines), round 29 block included.
- npm run words: no banned words outside the 42 listed exceptions (allow lists unchanged in this diff).
- npm run films: four films pass (-16.7/-16.8 dB, no freeze, no decode errors); films unchanged.
- The built pages carry the source changes (grainNone note, STOPG, the widened later-sentence list) in v6, v6 min and v5 min.
- My own browser probe (mock engine, 320 px, the review's diabetes profile; routed replies) and engine probes of grainAsk on the built
  page, on the round 29 build (git show 1bc90c9) and on the 115 dish/side pairs in the recorded live-engine menu replies
  (eval/v6/results-menu-*.json). Probe files: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r30/

## Findings, most serious first

1. MAJOR. Rescue > menu order > "No", then any later menu in the same page session (no review state; probe A2 and C3, 320 px light).
   What is wrong: UI.mno is never cleared (src/v6/app.js:462-470; set in grainNo, read by grainFilter on every fresh result at app.js:478;
   no reset on a new menu, a new place, a new meal or a new day; only a page reload clears it). Measured: after "No" to tandoori roti on
   the fixture menu, typing a different restaurant's menu ("DHABA / Sarson Saag / Dal Fry / Tandoori Roti 15 / Makki Roti 25", reply
   place "Punjabi dhaba") shows no order and no question, only "You said tandoori roti is not available. No order left on this menu has a
   grain you can get. ..." The person never said that about this place. When some orders remain, the ones with that grain vanish with no
   word. A "No" cannot be taken back (after No the only buttons are Read the menu, type the menu and the dish chips; probe C3), so one
   mis-tap on two equal, adjacent buttons, one-handed, closes that grain for every menu until reload. grainNone also names only the last
   grain said No to (UI.mno.slice(-1)), so a later menu needing an earlier grain is told about the wrong one.
   Why it matters: the app states something false about what the person said, removes the menu path at a new restaurant, and gives no
   way to correct an answer. A WhatsApp in-app tab often stays open from lunch to dinner.
   Criteria: B6 (error states true and say what to do next), B11 (the person can correct a choice), B7.
   Evidence: src/v6/app.js:462-470, 478, 507-511; scratchpad r30/A2.png; r30/probe.out (A2, C3).
   Smallest correction: keep the No answers with the menu they were given for (clear UI.mno and UI.myes when the menu text or photo,
   or the meal, changes); on the none-left note add a "Change answer" (or "Ask again") button that clears that No and brings the orders
   back; name the grain this menu needs.

2. MINOR. Engine grainAsk (src/v6/engine.js:398-403): the grain span picks up words that are not the grain, so the question reads as
   broken English, and answers kept by the whole name stop matching.
   Measured on the built page (round 29 build in brackets): "1 cup Red Rice" asks "Is cup red rice available now?" (was "rice");
   "1 cup Steamed Rice" -> "cup steamed rice"; "1 Tandoori Roti (Plain / Butter)" -> "tandoori roti plain butter"; "1 Roti (Plain)" ->
   "roti plain"; "2 Tawa Roti (Dry)" -> "tawa roti dry"; "2 Phulka (no ghee)" -> "phulka no ghee"; "2 roti without ghee" -> "roti without
   ghee"; "2 tandoori roti on the side" -> "tandoori roti on"; "2 roti instead of naan" -> "Are roti instead and naan available now?";
   "1 Tandoori Roti/Naan" -> "tandoori roti naan". The live engine copies menu names with brackets and prices into the side ("Idli (2 pcs)
   50", "1 Buttermilk 30" in the recorded replies), so bracketed names are likely. In the recorded pairs, "Steamed Fish in Ginger Sauce"
   with "1 Steamed Rice" asks "Is rice available now?" ("steamed" is dropped because it is in the dish name), while "Schezwan Chicken"
   with the same side asks "Is steamed rice available now?". Probe B1: "No" to rice moves to the next order and asks "Is steamed rice
   available now?", the same question again in other words; "rotis" and "roti" are also kept apart.
   Criteria: B7 (plain English), B11; A14.
   Smallest correction: add cup/cups/glass/bowl-size words and "on, only, without, no, instead, ask, for" to the stop list and stop the
   span at a bracket or slash; do not drop a word from the side because the dish name has it; match a No on the grain's last word
   plus its qualifier, so "rice" also covers "steamed rice" and "rotis" covers "roti".

3. MINOR. Rescue > menu order > two-grain question (probe D0/D1, 320 px).
   What is wrong: "Are steamed rice and roti available now?" has one No. A No when only the rice is missing drops every roti order too
   (Dal Tadka with 2 Roti disappears) and the note says "You said steamed rice and roti are not available", which the person did not say.
   Criteria: B7, B11, B6.
   Evidence: src/v6/app.js:468 (both parts pushed to UI.mno); r30/probe.out D1.
   Smallest correction: ask one grain at a time, or after No ask "Which one is missing?" with the two names as buttons.

4. MINOR. Review state menu-grain-again does not read the menu again.
   What is wrong: after a successful read UI.mtext is set to "" (app.js:478), so the state's tap on "or type the menu" shows an empty box,
   and its tap on #mgo is ignored (submit needs more than 2 characters, app.js:551). The screen it records is the No note again, not a
   fresh read; the round 29 MAJOR's regression is therefore not guarded by the review (my probe A2 shows a fresh read does filter).
   Criteria: A (every state reaches what it names); doctrine rule that rendered states, not claims, carry the proof.
   Evidence: test/ux/review.js:221-222; test/ux/out/screens/320-dark/menu-grain-again-1.png (empty box), -3.png.
   Smallest correction: fill #mtext with fx.typed before #mgo and wait for the /api/menu response; add a rules check on grainFilter.

5. MINOR. Rescue > menu order > No with none left, focus (probe A1, 320 px).
   What is wrong: focus moves to the text input #rin, which sits above the note. On a phone a focused text box raises the keyboard,
   which covers the note that explains why there is no order; without the keyboard only the first two lines of the note show at 320 px.
   Criteria: B6, WCAG 3.2.2 (no change of context on input; the keyboard is unasked for).
   Evidence: src/v6/app.js:470; scratchpad r30/A1.png.
   Smallest correction: focus the note (tabindex -1) and scroll it into view; the person taps the box when ready.

6. MINOR. Engine soldItems heading marks (src/v6/engine.js:465): explicit marks now read as selling.
   Measured at lunch, heading then "Tandoori Roti 30 / Jeera Rice 160": "TANDOOR OFF", "TANDOOR (off)" and "Tandoor - down" now sell both
   (they sold nothing on the round 29 build); "TANDOOR - No Tandoor Today" and "(no tandoor today)" sell on both builds. The owner decision
   keeps explicit heading marks as the first filter. The question still asks about a side grain, so this is not a breach. Also: "TANDOOR
   (closed Mondays)" closes the section on a Thursday (both builds).
   Criteria: A14.
   Smallest correction: "off" or "down" alone or at the end of a heading line closes it; "no <section word> today" closes it; a day word
   after "closed" closes only on that day.

7. MINOR (present before this diff, not raised earlier). With diabetes some grain sides ask nothing.
   Measured: grainAsk returns "" for the sides "1 Jeera Rice (Qtr)", "1 Brown Rice (Healthy)", "Roti x2", "1 Tandoori Roti Rs 30" and
   "1 small bowl rice (about 100 g cooked)" (isGrain(side) is false, so it falls back to the portion). The order card then has no
   question, against the owner decision.
   Criteria: owner decision of round 28; A14.
   Smallest correction: take the side when any of its words is a grain word, not only when isGrain(side) holds.

8. COSMETIC. One-tap later sentences (src/v5/core.js:319): the widened list holds a note when a later sentence has "back", "goes",
   "pot", "kitchen", "kids" or "family" for any reason ("Sit back and eat slowly."); safe side, fewer offers. The builder reports the same
   65 of 2,005 recorded live-engine notes held; I did not re-run the replay.

9. COSMETIC. "No order left on this menu has a grain you can get" is still app wording for these readers; "None of these orders works
   without tandoori roti" would read plainer.

10. COSMETIC (declared). The films predate the question and show the order card without it.

## What holds
- Round 29 items fixed: No with another order left shows it, writes "Next order: Schezwan Chicken with 1 Steamed Rice." to #said and
  focuses #order-grain-q (probe B1); none-left writes the note to #said; the toast is gone; Yes focuses "I'll order this"; "Change answer"
  (44 px link button) asks again and focuses the question (C1, C2); Yes and No are both outlined, equal weight; "Is bhature" now "Are".
- Look: the question block, the "available, you checked" line and "Change answer" are Raw Linen at 320, 360, 390 and 412, light and dark
  (paper kept) and at 130 % text; nothing crowded; the plate and its grams come before the question.
- Rules: no mg/dL, no katori or phulka as units, no supplements, no banned word in the new strings; kidney and pregnancy referral states
  unchanged in the review; the grain stays with diabetes.

## Not inspected
- The live engine: how often live sides carry brackets, cups or two grains; the full recorded replay (88 orders, 2,005 notes) was not
  re-run by me.
- A screen reader by ear and a phone keyboard on a device (focus and live region measured in the DOM only).
- The owner's own phone model; widths 375 and 430 (quick gate set run).
- Film frames and audio by ear (films unchanged; the film check was re-run).
