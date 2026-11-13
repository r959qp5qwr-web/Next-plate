VERDICT: FAIL
BUILD: 11fa37797919f452887784f0edc139e83ffccd8df020e07e03065c19d1216b5d

# Critic round 29: the grain question on a menu order (owner decision "Ask with one tap")

Reviewed: git diff ea07cdc..3008050 (src/v5/core.js, src/v6/engine.js, src/v6/app.js, src/v6/legible.css, the three built pages,
test/rules/check.js, test/ux/review.js, eval/v6/menu-checks.js, docs/ux/UX-CRITERIA.md, handoff-next-plate.md). The owner decision is
taken as fixed; what follows judges how it is carried out.

## Measured (run by me on this build)
- npm run drill: every planted fault caught.
- npm run review: 9 runs, 48 states, 432 checks, no violations, no unreachable state, no page error.
- npm run rules: "every rule check holds" on hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html (471 ok lines).
- npm run words: no banned words outside the 42 listed exceptions (allow lists not changed in this diff).
- npm run films: all four films pass (-16.7/-16.8 dB, no freeze, no decode errors). Films not changed in this diff.
- My own browser probe (mock engine, 320 px, the review's diabetes profile and typed menu) of the Yes path, both No paths and a re-read
  after No; engine probes of grainAsk, soldItems headings and one-tap notes on the built page and on the round 28 build.

## Findings, most serious first

1. MAJOR. Rescue > menu order > "No" when no order is left (state menu-grain-no), all widths, both schemes.
   What is wrong: the next step the screen gives cannot work, and following it brings back the same question. The note says "None of these
   orders keeps a grain you can get here. Ask which roti or rice they have today, add it to the menu above and read it again." The review's
   own typed menu already lists "Jeera Rice 160" and "Butter Naan 60"; the person's "No" is not carried into the next read (the request
   body has no trace of it, the kept text still says "Tandoori Roti 30", and side grains are only checked for presence on the menu,
   sideOnMenu, engine.js:312). Measured: after No, tapping "Read this menu for lunch" again returns Paneer Tikka with
   "Is tandoori roti available now?" (probe step A2). A person with diabetes at the table, one-handed, is sent round a loop with no order;
   the one way out that works ("Already chosen? Name the dish", just below) is not mentioned. "keeps a grain you can get" is also app
   wording, not plain English for these readers. The photo variant ("..., then type the menu with it.") asks a phone user mid-meal to
   type a whole menu.
   Why it matters: this is half of the owner's chosen flow; it is the screen a person sees when the restaurant has run out, and it must
   lead to an order or a clear choice.
   Criteria: B6 (error states say what to do next), A13 (the next step fits the error), B7 (plain words).
   Evidence: src/v6/app.js:492-494 (No handler, message at 493); test/ux/out/screens/320-light/menu-grain-no-2.png and -3.png;
   test/v6/fixture-menu.js:5-10 (Jeera Rice and Butter Naan on the menu); probe output A1/A2.
   Smallest correction: keep the grains the person said No to for this menu (for example UI.mno) and drop orders with those grains on any
   re-read of the same menu (send them with the request so the engine can also tell the model); name the grain and point to the box that
   works, for example "No tandoori roti today. Ask which roti or rice they have, then name your dish below, for example dal tadka with
   jeera rice." Add a review state that re-reads after No.

2. MINOR. Rescue > menu order > "No" when another order is left (no review state; rendered by me at 320 px).
   What is wrong: the toast "Showing the next order with a grain you can get." states something the app does not know. The next card then
   asks "Is steamed rice available now?" (the grain is not yet checked), and after a No to rice the next card is Veg Biryani, a rice dish,
   under the same toast.
   Why it matters: the owner's rule forbids invented claims; the line contradicts the question shown under it.
   Criteria: B7, owner rule 4 (no invented insights).
   Evidence: src/v6/app.js:494; probe B1 and B2 (screens in the scratchpad, see below).
   Smallest correction: "Here is the next order." or "Next order, without tandoori roti."

3. MINOR. Rescue > menu order > after "No", both outcomes; screen readers and keyboard.
   What is wrong: the No button is removed by render() and focus falls to the page body (measured document.activeElement = BODY in A1 and
   B1). In the none-left outcome the note is not written to the live region (#said), so nothing is announced. Yes moves focus to
   "I'll order this" correctly (C1).
   Criteria: B5, WCAG 2.4.3 Focus order and 4.1.3 Status messages.
   Evidence: src/v6/app.js:492-495; src/v5/app.js:222 (toast writes #said; the merr note does not).
   Smallest correction: after No, focus the new card's question or heading (or the note, tabindex -1) and write the none-left message to #said.

4. MINOR. Engine grainAsk (src/v6/engine.js:398): the question names a different grain from the order.
   Measured: side "1 cup Red Rice" asks "Is rice available now?"; "1 cup Matta Rice" asks "rice"; "2 Makki di Roti" asks "roti";
   "2 Multigrain Rotis" asks "rotis"; "2 Neer Dosa" asks "dosa"; "1 plate Steamed Rice and 1 Roti" asks only about roti. A Yes to "rice"
   does not confirm the red rice the figures and Rise band are for. The No handler (app.js:492) matches on the last word only, so a No to
   "tandoori roti" also removes orders with plain roti; tandoor not lit at lunch while the tawa roti is there is the common case the
   earlier rounds were about.
   Criteria: B7, B11 (the person can correct what the model chose), owner rule 5 (figures belong to what is named).
   Smallest correction: ask with the side as written, without its count ("Is red rice available now?"), name both grains when the side has
   two, and match No on the whole grain name.

5. MINOR. Rescue > menu order > after "Yes".
   What is wrong: a Yes cannot be taken back (the waiter says the tandoor is off after the person tapped Yes); and the answer is stored by
   order position (UI.mok[UI.msel]), so choosing "Dal Tadka" under "Also on this menu", with the same tandoori roti, asks the same
   question again.
   Criteria: B5 (state visible and changeable), B11.
   Evidence: src/v6/app.js:487, 491; test/ux/out/screens/320-light/menu-grain-yes-3.png.
   Smallest correction: key the answer by grain name and add a "Change" text button beside "Tandoori roti: available, you checked."

6. MINOR. Engine soldItems heading marks (src/v6/engine.js:458): the explicit-mark word list still refuses ordinary headings.
   Measured on the built page, lunch and dinner, heading then "Tandoori Roti 30 / Jeera Rice 160": "BREADS (Mon to Sun)",
   "BREADS (Sat-Sun also)", "BREADS (none with maida)", "BREADS (not available for parcel)" sell no grain; "RICE (served over dal)",
   "RICE (Down South style)", "RICE (Sunday special pulao below)" sell no rice. Impact is limited to portion grains (porGrain,
   engine.js:405), since side grains are only checked for presence, so a side order is still offered; it is the round 28 failure in
   a narrower form, and against the decision that the person, not the menu text, settles availability.
   Criteria: A14 (the grain rule without refusing ordinary menus), B6.
   Smallest correction: day words only with "only", "closed" or "off" and a day that is today; "over", "down", "none" only alone or next
   to a grain; "not available" not when followed by "for parcel / takeaway / delivery".

7. MINOR. One-tap notes (src/v5/core.js:444): `if(!thenKeeps(t))` skips every send-away clause in the note once any then-clause keeps.
   Measured at dinner: "Rice last. Leave it to cool, then eat it; the rice goes back into the pot." is now offered (held on the round 28
   build). Present on both builds: "Rice last. Leave the rice to cool, then eat it. The rice goes in the fridge." is offered. The declared
   grain_grams_after (at least half) still stands behind the wording check, so this is not a breach today, but the wording check is
   the documented second line for rule 3.
   Criteria: A14, owner rule 3.
   Smallest correction: run the send-away loop on every clause except the one thenKeeps read; add "goes in/into the fridge" to the
   send-away wordings.

8. COSMETIC. Safe-side holds that contradict the documented rule (UX-CRITERIA "Part A, changes after Critic round 28", item 4), all held
   on this build: "Rice: let it cool for 10 minutes, then have it." and "Rice: keep it 30 minutes, then eat it." (dinner);
   "Rice: keep it till you finish the salad, then eat it at dinner." (dinner); "Poha: keep it warm, then eat it at breakfast." (breakfast).
   Fewer one-tap changes offered, never a breach.

9. COSMETIC. The question block styles Yes as the filled primary and No as outline, which leans the person toward Yes on a check the owner
   added for safety; equal weight would ask more fairly. Plural wording "Is bhature available now?". At 320 px the question and its buttons
   sit about one and a half screens below the card top (as "I'll order this" did before), so the first read of the card is the dish and
   its grams, as B1 asks.

10. COSMETIC (declared by the builder). The films predate the question and show the menu order card without it; handoff step 4
    re-captures them.

## What holds
- Look: the question block is Raw Linen (paper surface, line border, EB Garamond 19/25 semibold question, italic fine line), the same in
  dark mode (paper kept) and at 130 % text; nothing crowded at 320 px; Yes/No 44 px or more; the review measured no contrast, size,
  overlap or clipping fault.
- Order and names: role="group" labelled by the question; reading order question, reason, Yes, No; Yes moves focus to "I'll order this".
- Rules: grain field empty without diabetes and at snack; a dish that is itself the grain asks nothing; no mg/dL, no katori or phulka as
  a unit, no supplement, no banned word in the new strings; kidney and pregnancy referral states unchanged in the review.

## Not inspected
- The live engine: whether a re-read after No returns different orders there (the mock returns the same), and how often live replies
  carry two grains in a side.
- A screen reader by ear (only roles, names, focus and the live region were measured in the DOM).
- The owner's own phone model; widths 375, 393 and 430 (the quick gate set was run).
- Film frames and audio by ear (films unchanged in this diff; the film check was re-run).
- Probe screens of the "No, next order" path: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r29/B1.png and B2.png
  (scratch only; not part of the review set).
