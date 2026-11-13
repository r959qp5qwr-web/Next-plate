VERDICT: PASS
BUILD: 029eb007f32b98655838d78da68676011e91a723e10004e27b56ce3e9619113a

Critic round 33. Branch claude/nice-hawking-307ljy, HEAD 388b14e, diff reviewed: 2a6a93d..388b14e (src/v6/engine.js, src/v6/app.js,
hosted/v6/index.html, hosted/v6/index.min.html, hosted/v5/index.min.html, test/rules/check.js, test/ux/review.js, docs/ux/UX-CRITERIA.md).
The owner decision of round 28 is not reopened; its implementation is judged.

Measured by the Critic on this build:
- npm run rules: every rule check holds on hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html (each exit 0, no FAIL line).
- npm run review (gate set): 9 runs, 53 states, 477 checks, no violations, no page errors, nothing unreached. Drill (A12): every planted fault caught.
- npm run drill: every planted fault caught.
- npm run words: no banned words outside the 42 listed exceptions. test/words/allow.json and test/ux/allow.json are not changed by this diff;
  test/ux/allow.json is [].
- npm run films: 4 films ok, -16.7 / -16.8 dB, no decode errors, no freeze. Films unchanged and predate the grain question (declared).
- No lookbehind regex in any of the three built pages.
- Fingerprint taken after measuring; it matches the builder's.

My own probes:
- grainAsk on 48 portion and side shapes, round 31 page (9706c2b) against this page, and the round 30 page (aaff8f0) for the negation cases.
- grainAsk on every dish in the recorded live engine replies under eval/ (183 distinct name, portion and side rows): 0 differ from the round 31 page.
- plan('menu').check on the six round 32 probes with a typed menu that sells the grain: Dal Makhani "1 bowl, about 250 g, with 2 tandoori roti"
  asks "tandoori roti"; Dal Tadka "1 bowl dal, 2 tandoori roti" asks "tandoori roti"; Paneer Tikka with side "Cucumber Raita, 2 Tandoori Roti"
  asks "tandoori roti"; Rajma asks "rice"; Chole asks "bhature"; Stew "1 bowl, with rice or appam" asks "rice or appam".
- soldItems and the menu check on 35 typed menus with "no <grain>" headings and description lines, old against new.
- A browser run (Chromium, the review's own mock engine and server) of No, a second No, "Change answers" and No to every order, at 320x568 light
  and dark, 360x740 light and dark, 390x844 light, measuring positions, focus and the live region, with viewport screenshots.

## Round 32 findings, as found on this build
1. MAJOR (grain after a comma gets no question): closed. Every probe from round 32 now names its grain; the alternatives read as one question
   ("Is rice or appam available now?", "tandoori roti or naan"); "Jowar or Bajra Roti" now reads "jowar or bajra roti"; the rules carry the
   seven cases.
2. MINOR (trace line off screen after No): closed. After No the "You said ..." line sits at the top under the masthead at every width I ran
   (320: 94-160 px; 360: 127-171; 390: 130-174), the next dish name is in view below it, and focus is on the question (#order-grain-q);
   menu-grain-next asserts the line is on screen.
3. MINOR ("no roti today, only naan" sold roti): closed. "BREADS (no roti today, only naan)" sells butter naan, not tandoori or missi roti;
   "RICE (no rice today; only biryani)" sells veg biryani, not steamed rice; "BREADS - no naan, only roti" sells roti and not naan. A later clean
   BREADS heading starts afresh (a roti order is offered again).
4. COSMETIC items 4 to 6 of round 32: closed ("Change answers" when more than one No is undone; the live region says "The order asks about the
   grain again." after the undo; "Naan or Roti" and "Rice or Roti" ask about both).

## Findings, most serious first (all cosmetic)
1. COSMETIC. Menu order after No, 320x568 light and dark, and 360x740: the next question and its Yes / No are below the bottom bar.
   What: with the trace line scrolled to the top, at 320 #order-grain-q is at 539-589 px with the tab bar starting at 503 px (after a second No
   573-598, below the 568 px screen), and Yes / No at 647-695; focus sits on the hidden question. At 360 the question is in view but Yes / No
   (635-683, 691-739 after a second No) are under the bar at 667. At 390 all of it is in view.
   Why it is cosmetic: the result of the tap (what was answered, Change answer, the new dish) is in view, and the person scrolls down the card to
   the question as on the first order; the question is a paragraph, not a control, and the next Tab goes to Yes. The trace line, card and
   question do not fit together in the 409 px between masthead and bar at 320.
   Criterion: A3, B6. Evidence: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/ui-320-light-no1.png,
   ui-360-light-no2.png in the same folder.
   Smallest correction (optional): a one-line "Next: is <grain> available? (below)" hint, or the trace line placed inside the card above the
   question.
2. COSMETIC. Copy with "or" grains in the trace line and the last-No note reads muddled.
   What: after No to "tandoori roti" and to "rice or appam": "You said tandoori roti and rice or appam are not available." After a third No the
   note reads "You said tandoori roti and rice or appam and steamed rice are not available, and every order on this menu needs one of them."
   "rice or appam is not available" also reads as if one of the two might be (src/v6/app.js grainNone and orderView join UI.mno with " and ").
   Why it matters a little: these readers read English but stumble on stacked "and ... or ... and"; the instruction that follows stays clear.
   Criterion: B7 (plain English). Evidence: ui-320-light-allno.png, ui-320-dark-no2.png in the scratch folder above.
   Smallest correction: list the answers with commas and say alternatives as "no rice or appam", for example "You said there is no tandoori
   roti, no rice or appam, and no steamed rice."
3. COSMETIC. A grain the portion leaves out is still asked about.
   What: "1 bowl with 2 roti, no rice" (also "skip the rice", "without rice", "not rice", "rice optional") asks "Is roti available now?" and then
   "Is rice available now?"; a No to rice drops a roti order. The round 31 page asked only about roti (the comma cut hid it); the round 30 page
   asked both, so this is the round 30 reading back. "; no naan" asked both on round 31 as well.
   Why cosmetic: none of the 183 recorded live engine dishes writes a negation in the portion or side, the portion prompt asks for at most ten
   words in the "1 bowl, about 300 g" shape, and the side is a menu item name; the error direction is an extra question, not a missing one.
   Criterion: A14. Evidence: grainAsk("Dal Tadka", "1 bowl with 2 roti, no rice", "") = "roti and rice" (src/v6/engine.js:398-411).
   Smallest correction: drop a segment whose grain span follows "no", "without", "skip", "not" or "leave", and add these to the rules.
4. COSMETIC. An unpriced description line naming "no roti" now leaves roti out for the rest of its section.
   What: the new line at src/v6/engine.js:484 reads any unpriced line on a priced menu. "MAINS / Dal Tadka 240 / Palak Paneer 300 / Diet Thali 260 /
   Dal, sabzi, salad, no roti / Tandoori Roti 30 / Roti 25" refused a roti order on this page and offered it on round 31.
   Why cosmetic: it errs toward refusing (no wrong order offered), needs a description line typed before the grain items in the same section with
   no grain heading between, and the same class already refused on round 31 ("RICE / (no rice refills)", "No roti without curry", "Keto Bowl
   (no rice, cauliflower base)"). "No roti refills after 10 pm" and "Unlimited roti, no rice refills" after the items still sell.
   Criterion: A14. Smallest correction: take "no <grain>" as a section mark only on a heading line (MENUSEC or caps) or a line that is only that
   note, not on a line under a priced dish.
5. COSMETIC (carried, declared). The films predate the grain question.

Seen and holding: the trace line is EB Garamond fine italic and legible at 320; "Change answer" / "Change answers" are underlined in clay and
look tappable; the last-No note takes focus and is in view at every width; the question card, Yes / No pills and the order card keep the Raw
Linen paper in the dark scheme; units are grams and kcal; rise is a band; no safety line, refer path or engine target is touched by this diff;
the new copy carries no banned word.

## Not inspected
- The owner's own phone and the clients' phones (TalkBack or VoiceOver on a device); focus with preventScroll was checked in Chromium only.
- Positions after No at 130 % text: the review applies its text scaling after the state is reached, and my own run scaled before the tap, but the
  re-rendered card came back at 100 %, so neither measures the after-No layout at 130 %. The 360-light-big screens were viewed for the states.
- Variety in live engine menu replies beyond the 183 recorded dishes; the builder's live replays (65 of 2,005 held, 88 menu orders) were not
  re-run by me, and no live engine call was made.
- Photo menus with the live engine.
- Films and audio by ear; film frames were not re-sampled (films unchanged, the film check passes).
- The full (non-quick) review widths 375, 393 and 430.
