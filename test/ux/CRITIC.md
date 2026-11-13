VERDICT: FAIL
BUILD: 8fe44964f39b0d4cb013bf597cc418de92e108980c0e33608622103b8fcd047f

# Critic round 21 (branch claude/nice-hawking-307ljy, HEAD 619b1e7, diff read 2c7c884..619b1e7)

## What I measured on this state
- `npm run rules`: passes on all three pages (360 ok lines; 833 names that are not a grain, 612 true grains; the new round 20 block included).
- `npm run review`: passes. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions; neither allow file is in the diff; test/ux/allow.json is still empty).
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post is in the diff.
- I rebuilt the three pages from the committed sources (git archive of HEAD, build6.js): byte-identical. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- The page diff touches only the np-core engine (core.js, engine.js); no markup, style or copy changed.
- Recorded live replies (g13/live2.js): 408 of 495 meals, 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65 as the round 20 build. None of the 1,091 distinct recorded notes uses the phrasings in findings A to C below, so their live frequency is not measured.

Columns in my outputs: this build, then the build judged in round 20 (scratchpad/old19.html). Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r21/ (p21.js, g21.js, g21b.js, n21.js, m21.js, m21b.js, one.js). The engine is shared by hosted/v6/index.min.html and hosted/v5/index.min.html.

## Round 20's findings, checked with my own probes
- My round 20 probes on this build: p20 0 of 38 removals offered, 0 of 12 keeps held; g20 grid 0 of 2,916 offered (round 20 build 1,384); k20 loses only the 4 self-contradicting "give the rest of the brown rice to the family; eat the rest" notes; n20 and n20b 0 refused of 44 grains; m20 1 of 12 non-selling menus offered (the butter roti case the builder names), 0 of 7 selling refused; m20b 0 asks kept. The builder's numbers hold.
- A ("eat the rest" after a removal): fixed for the forms listed. The "share" test is not tied to the grain (finding A).
- B (section end at punctuated headings): fixed. Unpriced grain headings followed by a title-case heading still sell (finding E, as round 20's G4).
- C ("then eat it" later): fixed for a closed word list; other times and other eaters are still read as kept (finding B).
- D (shawarma, seekh, kadai): fixed for those names; "Tandoori chicken roll", "Chilli chicken wrap" are refused (finding F, safe side).
- E (kurmura, mamra, jhal muri): fixed.
- F (figure after another food; "every bit"): fixed for the listed forms; the "share" condition lets other foods' shares through (finding A); "each and every bit of the rice" is still a keep (finding C).
- G1 fixed ("Rice: 150 g with 0 g butter" now offered). G2 fixed, but it opened finding A's regression part. G3 fixed ("salad meals" no longer counts). G4 see finding E.

## Findings, most serious first

### A. MINOR, partly a regression in this diff (owner rule 3; A14). A "share" of another food lets a grain removal read as the grain kept.
- Surface: Plate, one-tap changes with diabetes; engine-side, so every width and scheme.
- Cause: src/v5/core.js. keepsAmount() drops "you have 150 g" / "your portion is 200 g" only when `SHARE_RX` does not match anywhere in the note, and SHARE_RX matches any "extra", "some", "other", "second", "rest", "share", "for the family" - of any food. restKept() accepts "pack/leave/give ... N g" and "some/half ... for/to" before "eat the rest" with no check that the share is of the grain. The new NOTOF lets "your 150 g stays" through.
- Evidence (200 g of grain declared, should be held):
  - p21.js: 12 of 12 offered, e.g. "Rice: skip it; extra dal; you have 150 g.", "Rice: skip it and have extra paneer; your share is 150 g.", "Rice: skip it; some salad first; you have 200 g."; 9 of 14 "share then rest", e.g. "Rice: skip it; pack 100 g dal; eat the rest.", "Rice: skip it; leave 50 g of dal for later; eat the rest."
  - g21.js grid (4 grains x 8 removal wordings x 2 joins x 16 tails = 1,024): 584 offered. Every particle form ("Rice: skip it", "Leave out the rice", "The rice goes back in the pot", "Keep the rice off the plate") is affected; "Skip the rice ..." is held.
  - Regression: g21b.js, 90 removals held by the round 20 build are offered now, e.g. "Leave out the rice; dal for the family; your 150 g stays.", "Keep the rice off the plate; some dal for the kids; your 200 g stays.", "The rice goes back in the pot; share the paneer with the family; your 150 g stays."
  - Menu asks with these phrasings are dropped (m21b.js, 3 of 3), so this is the one-tap path only.
- Why it matters: with diabetes the person is told to skip the grain while the plate still counts 200 g of it.
- Smallest correction: count a share, a "your N g" or "eat the rest" as a keep only when the share names the grain (grain word, or it/them after a grain-led clause) and no removal verb has been applied to the grain earlier in the note. In SHARE_RX and restKept, require the grain word (or it/them) right after the share word, the way partOf() already does.

### B. MINOR, claim C partly met (owner rule 3; A14). "Then eat/serve it" with a time or eater outside the fixed list is still read as kept.
- Cause: the then-clause test in removesGrain() lists tomorrow, later, next, morning, another, breakfast, lunch, dinner, home, kids, children, family, husband, wife, guests, others.
- Evidence (p21.js, 200 g declared, offered on both builds, 16 of 16): "Rice: hold it, then serve it to my mother.", "... to my son.", "... to my father.", "... to the maid.", "... to the guest." (singular), "Rice: leave it, then have it as a snack.", "Rice: keep it aside, then have it for tiffin.", "Rice: leave it, then eat it on Sunday.", "Rice: save it, then eat it the day after." Menu asks: "Rice: hold it, then serve it to my mother." and "Rice: pack it, then have it for tiffin." are shown with the order (m21b.js).
- Same class (sendForms): "Rice: refrigerate it.", "Rice: give it away.", "Rice: wrap it up for later." offered; the ask "Rice: give it away." is shown on a menu order.
- Smallest correction: invert the test. "Then eat/have it" keeps only when its clause ends right after "it/them" or continues with a same-meal word (with dal, after the salad, last, slowly, warm); any "to <someone>", "for <occasion>", "on/at <time>", "as a snack" reads as away. Add refrigerate and give away to the particle verbs.

### C. MINOR, claim F partly met. "Skip each and every bit of the rice." and "Not one bit of the rice." are offered (both builds; also as menu asks, m21b.js). The new normalisation covers "every bit of" and "each bit of" only. Smallest correction: normalise "(each and )?every (single|last)? (bit|grain|piece) of" and "not (one|a) bit of" to "all of" / "no".

### D. Keeps held on the safe side (cosmetic, new in this diff from the then-clause list): "Rice: hold it, then have it with the family.", "Rice: hold it, then eat it with the kids.", "Rice: leave it, then have it next to the dal.", "Rice: leave it, then have it at home with dal." are held (offered by the round 20 build). "Rice 150 g, 0 g sugar in the curd." is held on both builds.

### E. Cosmetic, as round 20's G4 (menus). An unpriced grain heading followed by a title-case heading outside the fixed list still sells its grain: "Roti / Hot Beverages", "Roti / Cold Drinks", "Roti / Indian Desserts", "Roti / Veg Starters", "Rice / Raita", "Rice / Tea and Coffee"; "NAAN / SWEETS" sells naan because NAAN is not a section heading while ROTI is; "Roti - / DESSERTS" and "Roti / Naan / DESSERTS" too (m21.js, 14 of 24, all on both builds). The menu does name the grain, so the person is unlikely to find it missing; listed for completeness. Smallest correction: treat an unpriced bare grain line in a priced menu as selling nothing when the next line is unpriced and not itself a grain.

### F. Cosmetic, safe side (names refused). "Tandoori chicken roll", "Butter chicken roll", "Chilli paneer roll", "Chilli chicken wrap", "Tandoori paneer wrap", "Soya chaap roll", "Chilli paneer noodles", "Andhra meals", "Muri mixture", "Shawarma plate with khubz" are refused on both builds (n21.js), while "Kadai paneer wrap" and "Chilli chicken noodles" count. "Salad thali" counts on both builds (not a new change; a salad thali has no grain). 0 of 78 other non-grain names count, including every stand-in base with kadai, butter, chilli or tandoori before it.

### G. Screens. Against the round 12 review: 1,340 identical, 63 the state added in round 13, 38 differ; the 11 with large changes are toast and logged frames. I viewed 360-light plate-skipped-meds-1 and 320-dark plate-skipped-meds-2 with difference images: only the toast's timing differs. Contact sheets of 320-light and 360-light at 130 % text (plate, dial, Builder, Rescue, kidney and pregnancy referrals, menu error and unreadable) read as in round 20: Raw Linen, grams and kcal, Gentle band, no crowding at 320 px. No screen code changed.

## Not inspected
- The owner's own phone model and live Gemini text variety (only recorded replies replayed; no live engine call made).
- Films and the WhatsApp post by eye or ear this round (not in the diff; films check passed).
- Server deployment of np-core (no deploy authorised or checked).
