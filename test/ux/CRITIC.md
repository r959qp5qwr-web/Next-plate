VERDICT: FAIL
BUILD: 265620b312d09b3d50d0ea1c23a1c6e246feabe72d9ffefdf2c866524e592d5e

Critic round 32. Branch claude/nice-hawking-307ljy, HEAD 9706c2b, diff reviewed: aaff8f0..9706c2b.

Measured by the Critic on this build:
- npm run rules: holds on hosted/v6/index.html, hosted/v6/index.min.html, hosted/v5/index.min.html (exit 0).
- npm run review (quick gate set): 9 runs, 53 states, 477 checks, no violations, no page errors, nothing unreached. Drill (A12): every planted fault caught.
- npm run drill: every planted fault caught.
- npm run words: no banned words outside the 42 listed exceptions. test/words/allow.json and test/ux/allow.json are not changed by this diff; test/ux/allow.json is [].
- npm run films: 4 films ok, -16.7 / -16.8 dB, no decode errors, no freeze. Films predate the grain question (declared; unchanged).
- My own probes: grainAsk and checkMenu on the round 31 page (aaff8f0) against this page; soldItems headings old against new; a browser probe of the No / Change answer flow at 320x568 and 360x740.

The round 31 findings: the trace line and "Change answer" after a No exist and work (Change answer restores the full list, the question comes back and takes focus); the people words in the one-tap guard hold the six round 31 notes; the new review states menu-grain-other and menu-grain-two pass with their text and focus checks. But the cosmetic change to grainAsk brings back a missing grain question, which is MAJOR.

## Findings, most serious first

1. MAJOR. Menu order, diabetes, all widths and schemes: an order whose grain comes after a comma in the portion or the side now gets no grain question.
   What: src/v6/engine.js:401 now cuts the portion and the side at the first "/", "," or "or" before looking for the grain. When the grain is not in that
   first part, grainAsk returns "", the order still passes the grain check (porGrain and isGrain(side) read the whole text) and it is offered with no
   "Is <grain> available now?" question.
   Evidence (checkMenu on this page against aaff8f0, diabetes profile, typed menu that sells the grain):
   - "Dal Makhani", portion "1 bowl, about 250 g, with 2 tandoori roti": offered; grain "tandoori roti" before, "" now.
   - "Dal Tadka", portion "1 bowl dal, 2 tandoori roti": offered; grain "tandoori roti" before, "" now.
   - "Paneer Tikka", side "Cucumber Raita, 2 Tandoori Roti": offered with that side; grain "tandoori roti" before, "" now.
   - grainAsk alone: "1 bowl rajma, 1 plate rice", "1 bowl chole, 2 bhature", "1 bowl sambar, 1 cup rice", "1 bowl, with rice or appam",
     "1 bowl, roti instead of naan", side "Salad / Roti": each named a grain before and names none now.
   The menu prompt's own portion example is "1 bowl, about 300 g" (src/v6/engine.js:359), so a live engine portion such as "1 bowl, about 300 g,
   with 2 roti" is the expected shape, not an edge case.
   Why it matters: the owner decision of round 28 is that with diabetes a menu order whose grain is a side or part of the portion asks whether the
   grain is available. For these orders the person in the restaurant is told nothing and may order a dish whose roti or rice is not there, which is
   the case the question exists for. None of the rules or review states cover a grain after a comma, so the gate did not see it.
   Criterion: A14 (diabetes menu order and its grain), owner decision round 28; rule 3.
   Smallest correction: apply the "/", "," and "or" cut only to the stretch that holds the first grain word (find the first part that names a grain,
   then cut there), and leave "instead of ..." removal as it is. Add rules cases for each probe above (portion after a comma, side after a comma,
   "with rice or appam").

2. MINOR. Menu order after a No with orders left, 320 light/dark and 360 light: the new trace line and the dish name are out of view after the tap.
   What: grainNo scrolls the next question to the top (src/v6/app.js, grainNo, q.scrollIntoView block "start"), and the trace line sits above the
   card. Measured in the browser after No: at 320x568 #order-grain-said is at -385..-319 px, the dish name at -221..-188, the question at 94..119;
   at 360x740 the trace line is at -221..-177. Screenshot: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/after-no-320.png
   shows only "Is steamed rice available now?" and "Also on this menu".
   Why it matters: this is the round 31 finding only half closed. A sighted reader who tapped No sees a new question with no line saying what was
   answered and no "Change answer" in view, and does not see that the dish changed. The screen reader user is told (live region "Next order: ...").
   The review's inView check passes because a part of #order-card is in view.
   Criterion: A3 (what a tap produces comes into view), B6.
   Smallest correction: scroll #order-grain-said to the top and focus the question with preventScroll. At 320 the distance from the trace line's
   top to the question's bottom is 504 px, inside the 568 px viewport. Make menu-grain-next assert that #order-grain-said is in view.

3. MINOR. Typed menu headings: "no <grain> ..., only ..." no longer marks the grain as unavailable.
   What: the new HEADMARK step (src/v6/engine.js:460) deletes "no naan|roti|rice|maida|butter" whenever "only" follows inside the heading, so the
   heading stops closing the section and nothing takes its place. soldItems probe, old against new:
   - "BREADS (no roti today, only naan)": old sold nothing from the section; now "tandoori roti" is sold.
   - "RICE (no rice today; only biryani)": old left "steamed rice" out; now "steamed rice" is sold.
   - "BREADS - no naan, only roti" and "TANDOOR (kebabs to start off)": now sell, as intended.
   Why it matters: by the owner decision the menu text is the first filter. A menu that says there is no roti today now offers a roti order. The
   question is the second filter, and finding 1 shows it can be missing.
   Criterion: A14, owner decision round 28.
   Smallest correction: for "no X ..., only Y", keep the section open but leave out the items that name X, rather than keeping X. Add the two
   probes above to the rules.

4. COSMETIC. Grain named from "or" and "/" sides: "Jowar or Bajra Roti" asks "Is jowar available now?" (the cut comes before the grain noun).
   "Naan or roti" and "Rice or Roti" ask only about the first grain, so a No drops an order the second grain would serve (src/v6/engine.js:401).
5. COSMETIC. After two Nos, "Change answer" undoes both ("You said tandoori roti and steamed rice are not available. Change answer"), while the
   label reads as one answer (src/v6/app.js grainUndo clears UI.mno).
6. COSMETIC. After "Change answer" the live region keeps the old text ("Next order: Dal Tadka with 1 Steamed Rice."). Focus goes to the question,
   so it is read, but nothing says the full list is back.
7. COSMETIC (carried, declared). The films predate the grain question.

Seen and holding: the trace line is EB Garamond fine italic, legible at 320; both "Change answer" links are underlined and in the clay/ink colours;
the last-No note takes focus (menu-grain-no asserts it); menu-grain-other shows the question and no old answer; menu-grain-two asks
"Is steamed rice available now?" then "Is roti available now?"; Raw Linen paper holds in the dark scheme; units are grams and kcal; rise is a band.
The one-tap later-sentence words hold all eight RM notes and keep the four KP notes; they only hold more notes, which is the safe direction.
The photo key (length plus a sampled hash of the image data) reads about 1,000 characters per photo.

## Not inspected
- The owner's own phone and the clients' phones (TalkBack or VoiceOver on a device); focus behaviour was checked in Chromium only.
- Variety in live engine menu replies: how often the live engine writes the grain after a comma in the portion or side (the prompt example
  suggests often); the builder's recorded replays (65 of 2,005 held, 88 menu orders) were not re-run by me.
- Photo menus with the live engine; collisions of the photo key.
- Films and audio by ear; film frames were not re-sampled (films unchanged, the film check passes).
- The 412 px screens and the full (non-quick) review widths beyond spot checks.
