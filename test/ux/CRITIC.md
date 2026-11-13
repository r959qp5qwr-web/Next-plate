VERDICT: FAIL
BUILD: ad732c9c05575cf234a173163a9c12437f9680e5a4113d88e57f797fd7e90603

# Critic round 31: the grain question on a menu order (owner decision of round 28), round 30 fixes

Reviewed: git diff e1e7a39..117c980 (src/v5/core.js, src/v6/engine.js, src/v6/app.js, src/v6/legible.css, the three built pages,
test/rules/check.js, test/ux/review.js, docs/ux/UX-CRITERIA.md "Part A, changes after Critic round 30"). The owner decision stands; this
round judges how it is carried out. No MAJOR is left: the round 30 MAJOR is fixed. Three MINOR findings remain, so the verdict is FAIL.

## Measured (run by me on this build)
- npm run drill: every planted fault caught.
- npm run review: 9 runs, 51 states, 459 checks, no violations, no page errors.
- npm run rules: "every rule check holds" on all three pages (round 30 grain-name and heading cases included).
- npm run words: no banned words outside the 42 listed exceptions; test/words/allow.json and test/ux/allow.json unchanged in this diff.
- npm run films: four films pass (-16.7/-16.8 dB, no freeze, no decode errors); films unchanged.
- The built pages carry the source (grainKey, menu-grain-undo, GMOD list in v6, v6 min and v5 min; thenKeeps probe gives the same
  results on all three).
- My own probes: grainAsk and soldItems on the built page against the round 30 build (git show e617345); thenKeeps and removesGrain
  on both builds; a browser probe (mock engine, 320 px, diabetes profile, routed menu replies). Files:
  /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r31/ (probe.js, probe.out, ga4.js, si2.js, rg2.js,
  rg2-old.txt, rg2-new.txt, A1.png, B5.png).
- Link colour on the note: #55301A on the note paper (216,196,162) measures 6.76:1. "Change answer" is 95 x 45 px.

## Findings, most serious first

1. MINOR. Rescue > menu order > "No" when other orders are left (probe D1/D2, 320 px light; review state menu-grain-next).
   What is wrong: the order disappears and the next order is shown with no visible line saying what the person answered and no
   "Change answer". Only the screen-reader region gets "Next order: Dal Tadka with 2 Roti." Reading the same menu again keeps the
   answer (grainKey keeps it for the same text and meal), so the dropped order does not come back; only a different menu text, a
   reload, or saying No to every remaining order (which reaches the note with "Change answer") restores it.
   Why it matters: Yes and No are equal, adjacent buttons used one-handed; a mis-tap loses the best order (in the probe, Rajma, fit 88)
   with no trace and no way back that a person would find. The round 30 correction asked that a No can be taken back; that now holds
   only when no order is left.
   Criteria: B11 (the person can change it), B6.
   Evidence: src/v6/app.js grainNo (keep.length branch: render and #said only); probe.out D1 "buttons mcam,mtype,...,order-grain-yes,
   order-grain-no", D2 same result after reading the same menu; test/ux/out/screens/320-light/menu-grain-next-2.png to -4.png.
   Smallest correction: when a No leaves orders, show one line above the next order card, "You said <grain> is not available."
   with the same "Change answer" (grainUndo), and keep it until the next answer or menu.

2. MINOR. One-tap notes, thenKeeps later sentences (src/v5/core.js:322): narrowed past its own stated intent, on the safety side
   of owner rule 3 (with diabetes the grain stays).
   Measured with removesGrain on the built page (round 30 build in brackets; true = the note is held):
   "Rice: set it aside, then eat it last. Your kids can share it." false (true); "... The family can have it." false (true);
   "... The kids can finish it." false (true); "... Share it with the family." false (true); same with "Roti, keep it aside, then eat
   it after the dal." and "Rice: leave it, then eat it last." These send the grain to someone else and are now offered as one-tap
   changes. "Give it to your son" and "Your husband can have it" are offered on both builds (an older gap). "Return it to the pot" and
   "It goes back to the kitchen" still hold. The builder reports the recorded live-engine replay unchanged (65 of 2,005 held); I did
   not re-run it, and none of my cases comes from live text, so this is a gap in the guard, not a seen breach.
   Why it matters: the guard exists so that a note that takes the grain off the plate is never one tap away. The round 30 note asked
   only that "Sit back and eat slowly" stop holding; the people words (kids, family) were not the cause of that, and dropping them
   opened the gap.
   Criteria: owner rule 3 (guard), A14.
   Evidence: scratchpad r31/rg2.js, rg2-old.txt, rg2-new.txt.
   Smallest correction: in a later sentence, hold on any people word (kids, children, family, husband, wife, son, daughter, guests,
   others, maid, someone) and on share/give/hand/return/pass + it/them; keep "back" and "goes" needing a place after them (this keeps
   "Sit back and eat slowly" offered). Add these cases to test/rules/check.js.

3. MINOR. No regression guard for the round 30 MAJOR or for the per-grain answers.
   What is wrong: the review states cover No, Yes, the next order, the same menu read again and "Change answer". Nothing reads a
   different menu (or meal) after a No and checks that the question is asked again; nothing checks that a two-grain order asks each
   grain in turn, that a No to one grain keeps orders that need only the other, or that focus goes to the note. My probe shows all of
   these work on this build (A4, A5, B0 to B6, A1), but a later change could undo them with every check still green.
   Criteria: Doctrine (learning kept with regression protection; rendered states carry the proof), A.
   Evidence: test/ux/review.js:87-101; test/rules/check.js has no grainKey/grainFilter case; scratchpad r31/probe.out.
   Smallest correction: a review state menu-grain-other (No, then type a different menu, wait for #order-grain-q) and a two-grain state
   (fixture reply with "1 plate Steamed Rice and 1 Roti": No to rice leaves the roti order with "Is roti available now?"); assert the
   active element after the last No is the note.

4. COSMETIC. Grain names from sides with a slash, comma or "or" (engine grainAsk): "1 Tandoori Roti/Naan" asks "Is tandoori roti naan
   available now?" (unchanged from round 30); "Garlic Naan / Butter Naan" -> "garlic naan butter naan"; "Rice, Roti" -> "rice roti";
   "Rice or Roti" asks about both and a No to either drops the order; "2 Roti (instead of Naan)" asks about naan. The recorded live
   sides hold none of these (the engine asks for one side as written, and a side not on the menu is cut at the bracket), so the cost
   is a clumsy question, on the safe side. Correction: end a span at "/", "," and "or"; treat "or" as one question ("Is rice or roti
   available now?"); drop the part after "instead of".

5. COSMETIC. "You said tandoori rotis are not available, and every order on this menu needs it." (probe C1): "it" after a plural
   grain; use "them" when grainPlural holds.

6. COSMETIC. Heading marks close a little more than they say (all on the safe side, fewer offers): "Breads (no naan, only roti)" closes
   roti too; "RICE (no rice on Tuesdays)" and "TANDOOR (closed Mondays)" close on every day; "TANDOOR (Kebabs to start off)" closes.
   The round 30 cases (TANDOOR OFF, (off), - down, No Tandoor Today) now close as asked; "(20% off)", "(Rs 10 off)" still sell.

7. COSMETIC. "Change answer" on the note is italic brown text with no underline or icon; it is 45 px tall and 6.76:1, and matches the
   other link buttons, but on the tan note it reads more as a caption than a control for these readers.

8. COSMETIC. grainKey keys a photo by the length of its data; two different photos of the same length would share answers (unlikely);
   a new photo of the same page asks again (safe side).

9. COSMETIC (declared). The films predate the question and show the order card without it.

## What holds
- Round 30 MAJOR fixed: answers are kept for one menu text and meal; after a No to tandoori roti, a different restaurant's menu asks
  "Is tandoori roti available now?" again (A4), and going back to the first menu asks again (A5). The same menu read again keeps the
  note (review state menu-grain-again now types and reads the menu; screens 320/360/390, light and dark, 130 % text checked).
- The none-left note names every grain said No to ("You said steamed rice and roti are not available, and every order on this menu
  needs one of them."), carries "Change answer", which brings back the full order list with the question and focuses it (A2, B6);
  after the last No focus is on the note (tabindex -1), the keyboard does not open, and the note text goes to #said.
- Two-grain orders ask one grain at a time: Yes to steamed rice moves focus to "Is roti available now?"; a No to steamed rice keeps the
  roti order (B4); "Change answer" after Yes clears both parts (B3).
- Grain names: "cup red rice", "tandoori roti plain butter", "phulka no ghee", "roti without ghee", "tawa roti dry", "Jeera Rice (Qtr)",
  "Roti x2", "Rs 30", "Steamed Fish ... 1 Steamed Rice" now read as the grain; the 28 recorded live pairs all read cleanly.
- Look: the note and the question are Raw Linen at 320, 360, 390, light and dark (paper kept) and at 130 % text; nothing crowded;
  the plate and its grams come before the question; 44 px controls.
- Rules: no mg/dL, no katori or phulka as units, no supplements, no banned word in the new strings; kidney and pregnancy referral
  states unchanged in the review; the grain stays with diabetes on every order shown.

## Not inspected
- The live engine: how often live sides carry slashes or "or", and live one-tap notes with people words; the recorded replay (88
  orders, 2,005 notes) was not re-run by me.
- A screen reader by ear and a phone keyboard on a device (focus and the live region measured in the DOM only).
- The owner's own phone model; widths 375 and 430 (quick gate set run).
- Film frames and audio by ear (films unchanged; the film check was re-run).
- Changing the meal between two reads in the browser (read from the code: the meal is part of the key).
