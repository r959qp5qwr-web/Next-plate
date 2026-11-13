VERDICT: FAIL
BUILD: 35c7de84d33e3a3baa86c34873340764a00cb57c765ce22a5c9d26d0a25780f9

# Critic round 20 (branch claude/nice-hawking-307ljy, HEAD d3695c2, diff read c19a24c..d3695c2)

## What I measured on this state
- `npm run rules`: passes on all three pages (342 ok lines, 114 per page; 833 names that are not a grain, 612 true grains; the round 19 block and combos.js included).
- `npm run review`: passes. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions; neither allow file is in the diff).
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post is in the diff.
- I rebuilt the three pages from the committed sources (git archive of HEAD, build6.js): byte-identical. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- Recorded live replies (my g13 replay scripts): 408 of 495 meals, 225 of 313 base swaps, 65 of 2,005 one-tap notes held, the same 65 as the round 19 build. Menus with diabetes: 88 orders (round 19 build 87), 6 dropped (was 9); the only differences are in menu-cafe-egg-no-nuts, where Paneer Tikka Wrap (a grain) is now offered. Nothing adds a non-grain.

Columns in my outputs: this build, then the build judged in round 19 (scratchpad/r19/new.html). Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r20/ (p20.js, g20.js, g20b.js, k20.js, n20.js, n20b.js, m20.js, m20b.js). Every finding below reproduces in hosted/v6/index.min.html and hosted/v5/index.min.html.

## Round 19's findings, checked with my own probes
- My round 19 probes on this build: 0 removals offered in every group (onetap, onetap2, onetap3), 0 of 22 keeps held; 0 of 9 coatings and 0 of 13 stand-ins count; 39 of 39 side-word grain dishes count; 6 of 6 selling headings offered, 0 of 5 non-selling headings offered, 0 of 9 menu removals offered; the 4,032-name grid counts 3,843 and loses none the round 19 build counted. The builder's numbers hold.
- A (figure for another food, particle and later paths): fixed for the listed forms. In a 2,916-note grid (g20.js) 488 removals that the round 19 build offered are now held.
- B (figure after the food, "you have N g dal", "then eat N g dal", "0 g"): fixed for those forms. "Then eat it" with a later time not right after it is not fixed (finding C).
- C (side word before the grain): fixed; manchurian, tikka/kebab rolls and wraps, meals count. Shawarma and seekh wraps do not (finding D).
- D (murmura crust): fixed for murmura. Kurmura and mamra are not grain words at all (finding E).
- E (gaps): manchurian rice, tikka rolls, puffed rice chaat with peanuts, poha cutlet now count; "eat the rest" now keeps, but far too widely (finding A below; my round 19 wording asked for it without a limit, the intent was the rest of a grain share).
- E3 (lachha under INDIAN BREADS): fixed.
- D7 entries for Roti (lauki), Pasta (broccoli), crispy noodle chicken salad: recorded in docs/ux/UX-CRITERIA.md part D; safe side. Accepted.

## Findings, most serious first

### A. MINOR, regression in this diff (owner rule 3; A14). "Eat the rest" after a grain removal now reads as the grain kept, on every removal path, in one-tap notes and in menu asks.
- Surface: Plate, one-tap changes with diabetes, and Rescue, Read the menu asks; server-side in all pages, so every width and scheme.
- Cause: src/v5/core.js keepsAmount(), new last clause `/\b(?:eat|have|keep)\s+the\s+rest\b(?!\s+of\s+(?:the\s+)?(?:dal|sabzi|salad|paneer|curry|vegetables|raita|curd))/` returns true for any note holding "eat/have/keep the rest", whatever was removed before it. Only eight foods are excluded after "of".
- Evidence (200 g of grain declared, should be held):
  - p20.js: 7 of 10 offered here, 0 of 10 by the round 19 build: "Rice: skip it; eat the rest.", "Rice: skip it; eat the rest of the meal.", "Leave out the rice; have the rest of the chole.", "Rice: skip it; eat the rest of the rajma.", "Leave out the roti; eat the rest of the thali.", "Rice: skip it; eat the rest of the palak paneer.", "Leave out the rice; eat the rest of the kadhi."
  - g20.js grid (4 grains x 9 removal wordings x 3 joins x 12 "rest" tails): 992 removals newly offered, every tail 84 of 84 (or 68 of 84), including "keep the rest", "eat the rest slowly", "have the rest with curd", "eat the rest of the sambar".
  - m20b.js, menu with diabetes, Dal Tadka with 1 Steamed Rice (rice counted, 120 g): asks "Rice: skip it; eat the rest.", "Leave out the rice; have the rest of the rajma.", "Rice: skip it; eat the rest of the thali." are shown to the person here; the round 19 build refuses the order.
- Why it matters: the person with diabetes is told to skip the grain while the plate or order counts it, so the plate shown has no grain. "Eat the rest" is a natural closing phrase for the model after any removal. No recorded live reply holds it yet (eval/ searched), so the frequency is not measured.
- Smallest correction: count "eat/have/keep the rest" as a keep only when the note keeps a share of the grain first ("leave 50 g for the family; eat the rest", "send half the rice back; eat the rest"), i.e. when partOf() or a grain share is named before it and no removal of the grain is; otherwise ignore the phrase. Add the twelve tails above, with the nine removal wordings, to combos.js.

### B. MINOR, regression in this diff (owner rule 3 menu side; A14). New paratha kinds under BREADS run into the next section when its heading has punctuation.
- Cause: src/v6/engine.js soldItems(): the BREADS section ends only at a heading matching `/^[a-z ]+$/`; "MAINS (VEG)", "MAIN COURSE - VEG", "CHICKEN (BONELESS)" do not end it, and the new map turns "Aloo", "Paneer", "Gobi" into parathas.
- Evidence (m20.js): menu "BREADS / Tandoori Roti 30 / MAINS (VEG) / Aloo 180 / Dal Tadka 240": an order with "2 aloo paratha" is offered here, refused by the round 19 build; same with "MAIN COURSE - VEG / Paneer 220" and a paneer paratha. "CHICKEN (BONELESS) / Butter 320" sells a butter roti in both builds.
- Why it matters: the order names a grain the menu does not sell, with figures for it; the person asks for a dish that is not there. Single-word mains are uncommon, so the reach is small.
- Smallest correction: end a grain section at any unpriced line whose letters, with punctuation removed, are not a grain (the same test as the line you already use for the next heading), not only at all-letter lines.

### C. MINOR, not fixed from round 19 finding B (owner rule 3; A14). "Then eat it" with a later time that is not the next word is still read as the grain kept.
- Evidence (p20.js, 200 g declared, offered in both builds, 7 of 7): "Rice: leave it, then have it at lunch tomorrow.", "Rice: skip it, then eat it next day.", "Rice: save it, then have it in the morning.", "Roti: leave it, then have it the next day.", "Rice: hold it, then serve it to the kids.", "Rice: leave it tonight, then eat it at breakfast." UX-CRITERIA round 19 item 1 says "Then eat it keeps only without tomorrow or later"; the code checks only the word right after "it". Menu asks: "Rice: leave it, then have it at lunch tomorrow." is shown with the order (m20b.js).
- Smallest correction: refuse the keep when tomorrow, later, next day, morning, breakfast, lunch or another person ("to the kids") appears anywhere in the same clause after "then <verb> it".

### D. MINOR, claim 2 not met for shawarma and seekh wraps (owner rule 3 true-grain side; A14). "Chicken shawarma wrap", "Paneer shawarma wrap", "Chicken seekh wrap" are refused, while "Chicken shawarma roll", "Chicken kebab wrap" and bare "Shawarma wrap" count (n20b.js). With diabetes the plate and the menu order "Chicken Shawarma Wrap" are refused (end to end check in r20). "Kadai paneer rice" and "Kadai chicken roti" (side word first) are refused in both builds. Cause: shawarma and seekh are in the roll/wrap test but not in SIDEW in known(), so "chicken" is checked as the wrap's material. Smallest correction: add shawarma and seekh to SIDEW; read a side word before the food ("kadai paneer") as the side dish too.

### E. MINOR, claim 3 not met for kurmura and mamra. They are not grain words (not in GRAINT), so "Kurmura with peanuts", "Kurmura chaat", "Mamra chivda", "Mamra with peanuts" never count (n20.js); with diabetes a plate with "Kurmura chaat" made_of rice is refused. "Jhal muri" is refused in both builds. Safe side, but the doc says they count. Smallest correction: add kurmura, mamra (and jhal muri's "muri" pairing) to GRAINT and to the puffed-rice crust list, or correct the doc.

### F. MINOR, left: a figure for another food still kept on two narrow paths (owner rule 3; A14). 200 g declared, offered in both builds: "Leave out the rice and have the lobia, 200 g." (any food word not in PARTFOOD_W, MAT_RX or COATW before a bare figure in the same comma clause as the grain; 48 grid notes), "Rice? Cut it out and raise the chana to 150 g." (4 grid notes). "Skip every bit of the rice; more dal." is also offered. Smallest correction: in keepsAmount, a bare figure after any word that is not the grain, it/them or a portion word does not keep the grain.

### Cosmetic (safe side or implausible names)
- G1. "0 g" anywhere now reads as a removal: "Rice: 150 g with 0 g ghee." and "Rice 150 g; dal with 0 g oil." are held (offered by round 19 build); 84 keeps in k20.js. Tie "0 g" to the grain as the other figures are.
- G2. "Rice: leave some for the kids; your 150 g stays." is now held (offered by round 19 build); "your N g stays" keeps only after a "rest of the rice" share (k20.js, 28 notes).
- G3. "Salad meals" and "Chicken salad meals" now count as a grain ("meals" added to the grain words, "salad" a companion). Unlikely names.
- G4. Unpriced grain headings followed by a heading outside the fixed list still sell their grain: "ROTI / SWEETS & DESSERTS", "ROTI / ICE CREAM", "ROTI / SWEET DISH", "ROTIS / MOCKTAILS", "RICE / SOUPS & SALADS" (both builds; m20.js).
- G5. Screens: against the round 12 review, 1,335 identical, 63 the state added in round 13, 43 differ; 13 by more than 2,000 strongly changed pixels. I viewed 360-dark plate-skipped-meds-1 and 360-light-big plate-logged-1 side by side with a difference image: the only change is the toast caught in one frame and not the other. No screen code changed in this diff.

## What holds (checked, not taken on the builder's word)
- All measured gates; rebuild byte-identical; fingerprint matches.
- The diff touches only src/v5/core.js, src/v6/engine.js, test/rules/check.js, docs/ux/UX-CRITERIA.md and the three built pages. No screen code, CSS, film, post or allow file changed. No removed line touches kidney, pregnancy, referral, supplements, units or the rise bands. The new words (meals, korma, kebab, chaat, cutlet, shawarma ...) are reader word lists, not shown text.
- No new over-count among stand-ins and coatings: 0 of 22 stand-in wraps and rices with tikka, kebab, shawarma or manchurian count; 0 of 21 of my crust names count except "Crispy murmura chicken tikka" and "Crispy murmura fish tikki", which counted in the round 19 build and are now refused.

## Not inspected
- The owner's phone and his clients' phones; how clients read the screens.
- Live engine output with the declared fields; no live call was made. I have not measured how often Gemini closes a grain removal with "eat the rest" or writes single-word mains under a punctuated heading.
- The v5 screens served by default were not rendered; only their core was probed, and A to F reproduce in it.
- Audio by ear (films unchanged; loudness from this round's check).
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution; I relied on pixel comparison with round 12 and viewed the two frames listed.
