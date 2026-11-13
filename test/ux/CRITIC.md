VERDICT: FAIL
BUILD: 9ec72a373317b260cf65f2986b5d601511ee995e7d141494fecaaf29b970d981

# Critic round 22 (branch claude/nice-hawking-307ljy, HEAD 608cee8, diff read 3a104c4..608cee8)

## What I measured on this state
- `npm run rules`: passes on all three pages (378 ok lines, the new round 21 block included, 1,366 notes).
- `npm run review`: passes. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). Neither test/words/allow.json nor test/ux/allow.json is in the diff; test/ux/allow.json is still empty.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post is in the diff.
- Rebuilt the three pages from the committed sources (git archive of HEAD, build6.js): byte-identical. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- The page diff touches only the np-core engine (src/v5/core.js, src/v6/engine.js); no markup, style or copy changed.
- Recorded live replies (g13/live2.js): 408 of 495 meals and 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65 as the round 20 build. None of the 1,091 distinct recorded notes uses the phrasings in findings A and B, so their live frequency is not measured.

Columns in my outputs: this build, then the round 20 fix build (scratchpad/old20.html). Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r22/ (g22.js, k22.js, k22s.js, m22.js, m22b.js, n22.js and *.out). 200 g of grain declared after the change for removals, 150 g for keeps; profile with diabetes, dinner slot.

## Round 21's findings, checked with my own probes
- p21: 0 of 86 removals offered (round 20 build 47), 0 of 16 keeps held; "Rice 150 g, 0 g sugar in the curd." still held (safe side).
- g21: 0 of 1,024 offered (round 20 build 584). g21b: 0 of 630 offered, none newly offered.
- n21: 0 of 80 non-grain names count; 2 of 35 grain names refused (soya chaap roll, chilli paneer noodles; accepted by the owner's D7 line as read the safe way).
- m21: 0 of 24 non-selling menus offered; 2 of 11 selling menus refused (no Dal Tadka on them, as the builder says). m21b: 0 of 9 asks kept.
- Round 20 probes: p20 0 offered / 0 held; g20 0 of 2,916; k20 0 of 1,512 newly held; n20, n20b 0 wrong; m20 1 of 12 (the same butter roti case as on the round 20 build); m20b 0 kept.
- Round 21 A (share of another food after a removal): fixed. C (each and every bit, not one bit): fixed. E (title-case headings, NAAN/PARATHAS/KULCHAS): fixed for every case I tried (m22.js 13 of 14 non-selling refused; the one left is finding D3). F (tandoori, butter, chilli rolls, khubz, Andhra meals, muri mixture, salad thali): fixed.
- Round 21 B (then eat it later or by someone else): fixed for the listed tails, but the new allow-list opened a regression (finding A).

## Findings, most serious first

### A. MINOR, regression in this diff (owner rule 3; A14). "Then eat/have/serve it with <a later meal>" now reads as the grain kept in this meal.
- Surface: Plate one-tap changes with diabetes, and Rescue menu orders whose ask carries the note; engine-side, so every width and scheme.
- Cause: src/v5/core.js, the then-clause test inside removesGrain() (the `then\s+(?:eat|have|reheat|serve)` lookahead added at the `if(hasGrainWord(before)&&...` branch). "with <one or two words>" and "after <word>" are accepted as same-meal phrases whatever the words are, so a meal name or a time after "with" or "after" passes. The round 20 build held these through its word list (breakfast, lunch, dinner, tomorrow, kids, husband ...), which the inversion removed.
- Evidence:
  - one.js, offered now, held on the round 20 build: "Rice: save it, then have it with breakfast.", "Rice: save it, then have it with lunch tomorrow.", "Rice: save it, then have it with tomorrows lunch.", "Rice: save it, then serve it with dinner.", "Rice: save it, then eat it after lunch.", "Rice: pack it, then eat it with the kids.", "Rice: save it, then eat it with your husband.", "Rice: pack it, then have it next to the stove."
  - g22.js grid (3 grains x 6 save/hold/leave/pack/keep-aside forms x 4 verbs x 18 tails = 1,296): 1,236 offered, round 20 build 720; 528 newly offered, 48 for each of "with breakfast", "with lunch", "with dinner", "with lunch tomorrow", "with tomorrows lunch", "after lunch", "after dinner", "with the kids", "with my husband", "with your wife", "with the guests". The plainly later-meal ones (breakfast, lunch tomorrow, tomorrows lunch, after dinner on a dinner plate) are 192 of them; the eater ones are open to a same-meal reading and I do not count them against the build.
  - m22b.js, menu asks shown with the order now, dropped on the round 20 build: "Rice: pack it, then have it with breakfast.", "Rice: pack it, then have it with lunch tomorrow.", "Rice: pack it, then eat it after dinner."
- Why it matters: with diabetes the plate is told to keep its grain; these notes send the grain to a later meal while the plate and the menu order still count it, so the person eats a plate with no grain that the numbers say has one.
- Smallest correction: keep the allow-list, and reject it when the words after "with", "after" or "next to" are a meal, a time or a day (breakfast, lunch, dinner, supper, tiffin, snack, tea, tomorrow, tomorrows, later, evening, morning, night, work, school, office, sunset, Sunday ...), i.e. run the round 20 word list as a second test on the then-clause.

### B. MINOR, mostly earlier but kept on purpose by change 1 (owner rule 3; A14). An amount stated before a removal of the whole grain keeps it.
- Cause: src/v5/core.js keepsAmount(): `if(keepsAmount0(s.slice(0,pr.index)))return true;` ("a keep stated before the removal still counts"). Any amount of the grain before the removal counts as a keep, even when the removal is of that same amount ("it", "the rice"). Because AMTGONE/ZERO_G are now tested only on the prefix, a "not even 50 g" after the removal no longer cancels it.
- Evidence (k22.js: 10 amount openers x 8 removals x 10 tails x 3 joins = 2,400 notes): 379 offered, round 20 build 489; 21 newly offered, all "...; not even 50 g", e.g. "Rice 150 g; skip it; not even 50 g.", "You planned 150 g of rice; drop it; not even 50 g.", "150 g of rice is too much; cut it out; not even 50 g." Offered on both builds: "Rice was 150 g; skip it.", "150 g of rice is too much; no rice.", "Rice 150 g? Skip it.", "Usually 150 g rice; skip it.", "Rice, 150 g, but keep the rice off the plate."
- Why it matters: as A; the note tells the person the grain is gone while the plate counts it.
- Smallest correction: test AMTGONE and ZERO_G on the whole note before the prefix keep; and let a prefix amount count only when it is phrased as a keep ("keep 150 g", "150 g for you", "your 150 g") and the removal's object is not it/them/the same grain, so "Rice was 150 g; skip it" and "150 g of rice is too much; skip it" read as removals.

### C. Cosmetic, new in this diff, safe side (names refused). The "<food> only" rule in isGrain() takes the last word before "only": "Rice with dal only", "Phulka with sabzi only", "Idli with sambar only", "Chapati with curd only", "Tandoori roti, butter only" no longer count (n22.js; all counted on the round 20 build). "Egg roll", "Gujarati thali", "Rajasthani thali" are refused on both builds. 0 of 41 stand-in names count (lettuce, collard, nori, keto, cauliflower-crust wraps, rolls and pizzas after tandoori, butter, chilli; protein, diet, fruit, sprouts and soup thalis).

### D. Cosmetic, safe side or listed for completeness.
- D1 new holds from the added verbs: "Rice: give it a stir with the dal.", "Rice: give it 5 minutes.", "Rice: keep it aside for the dal to cool." (offered on the round 20 build).
- D2 still held: "Rice 150 g, 0 g sugar in the curd."; "then have it at home with dal".
- D3 menus, both builds: "Roti" then "Paneer Tikka 220" sells a roti (the menu does name roti); priced lines "Roti (ask for butter) 30", "Roti (today) 25", "Rice - available in half 60" are refused; the round 20 butter roti case under "CHICKEN (BONELESS)" still offered.
- D4 "Rice: skip it. Then eat it." is offered on both builds (the note contradicts itself).

### E. Screens. Against the round 12 review set: 1,346 identical, 63 the state added in round 13, 32 differ; the 11 with large changes are toast and logged frames. I viewed 320-light plate-skipped-meds-2 side by side: only the toast's timing differs (the medicines toast caught mid-show). No screen code changed; part B as judged in round 21 stands (Raw Linen, grams and kcal, Gentle band, nothing cramped at 320 px).

## Not inspected
- The owner's own phone model and live Gemini text variety (only recorded replies replayed; no live engine call made).
- Films and the WhatsApp post by eye or ear this round (not in the diff; films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the differing frames and the one side-by-side named above.
