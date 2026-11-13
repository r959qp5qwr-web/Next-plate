VERDICT: FAIL
BUILD: 110f2464e42b4c4ecd32abf8427227ead67d0e7726c9ec1f8b6b55976b993dff

# Critic round 23 (branch claude/nice-hawking-307ljy, HEAD 82ffc3e, diff read 61d0889..82ffc3e)

## What I measured on this state
- `npm run rules`: passes on all three pages (396 ok lines, "every rule check holds" three times; the round 22 block with 3,337 notes included).
- `npm run review`: passes. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error (one run, no retry needed).
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). test/ux/allow.json (still empty) and test/words/allow.json are not in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post in the diff.
- Rebuilt the three pages from HEAD (git archive, build6.js): byte-identical. No lookbehind in any page. Working tree clean. The page diff touches only the np-core engine (src/v5/core.js, src/v6/engine.js). The fingerprint above was taken after all measuring and matches the builder's.
- Recorded live replies (g13/live2.js): 408 of 495 meals and 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65 as the round 21 build. None of the recorded menus has a sold-out mark, so finding A's live frequency is not measured.

Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r23/ (m23.js, m23b.js, k23.js, k23k.js, *.out, sbs/). Columns: this build, then the round 21 fix build (scratchpad/old21.html). Profile with diabetes, dinner slot; menus on the nonveg profile at lunch.

## Round 22's findings, checked with my own probes
- g22: 360 of 1,296 offered, all with another eater (kids, husband, wife, guests, mother); every later-meal and later-time tail on the list is held. k22: 0 of 2,400 offered (round 21 build 379). m22: 0 of 14 non-selling offered, 0 of 9 selling refused. m22b: 1 of 8 asks kept ("then have it with dal"). n22: 0 of 41 and 0 of 30 wrong. The builder's numbers hold.
- Earlier probes read as on the round 21 build: p21 0 offered; g21 0 of 1,024; g21b 0 of 630; n21 2 of 35 refused (D7 names); m21 0 of 24 offered, 2 of 11 refused; p20 0/0; g20 0 of 2,916; k20 0 newly held; n20 0 wrong; m20 1 of 12 (the butter roti case, both builds).
- Round 22 A and B are fixed for the phrasings I named; a new regression came in with the menu change (A below), and the later-meal list leaves common words out (B below).

## Findings, most serious first

### A. MINOR, regression in this diff (owner rule 3; owner rule 5; A14). A grain line marked sold out now sells the grain on a typed or read menu.
- Surface: Rescue, Read the menu, the order list (engine-side, every width and scheme).
- Cause: src/v6/engine.js:425 (soldItems). The new statement `if(priced&&isGrain(head))list.push(head);` was put between the `else if(colon section)` branch and the `else if(anyPrice&&!priced)` branch. That ends the old if/else-if chain: (1) after the sold-out test empties the list, a priced line pushes the grain back ("Roti (sold out) 30"); (2) the unpriced-heading branch now hangs off the new `if` and runs after the sold-out and colon branches too, so an unpriced "Roti - sold out" followed by a priced line sets the section to roti and the next item becomes a roti ("Paneer 220" -> "paneer roti"). The round 22 rules block only tries unpriced sold-out lines followed by Kheer, which the sweets list throws out, so it cannot see this.
- Evidence: m23.js, 220 menus with a sold-out, finished, not-available, not-today, over or ask-the-waiter mark on a Roti, Rice, Naan or Paratha line: 170 offered on this build, 0 on the round 21 build. Examples: "Roti (sold out) 30", "Rice 30 (finished)", "Rice: sold out 30", "Roti (not today) 30", "Roti - sold out / Paneer 220", "Rice (finished) / Jeera 120", "Roti: not today / Tandoori 30". m23b.js, other wordings ("out of stock", "no stock", "NA", "not in stock", "not served today", "closed"): 60 of 72 offered, 55 of them refused on the round 21 build. Same counts on index.min.html.
- Why it matters: with diabetes the order is shown as "dal with 2 roti" when the menu says there is no roti; the person gets dal alone, the grain the plan counts is not on the plate, and the order names a dish the menu does not offer.
- Smallest correction: keep the chain whole, e.g. `if(soldOut)list=[]; else if(colon){...; if(priced&&isGrain(head))list.push(head);} else if(priced&&isGrain(head))list.push(head); else if(anyPrice&&!priced){...}`, and add to the rules block priced sold-out grain lines and unpriced sold-out lines followed by a plain priced item (Paneer 220, Tandoori 30, Jeera 120).
- Same cause, safe side: m23.js, 15 of 15 unpriced colon sections on a priced menu ("Rice: Jeera / Plain", "Roti: Tandoori / Butter" followed by a heading or a dish) are now refused (offered on the round 21 build). The fix above restores them.

### B. MINOR, round 22 A partly met (owner rule 3; A14). "Then eat/have it" with a later meal outside the fixed word list still reads as the grain kept.
- Cause: src/v5/core.js, the then-clause in removesGrain(): the meal and time list is a deny list over open words; "with <one or two words>" and "after <word>" are accepted for anything not on it.
- Evidence: k23.js, 192 of 192 offered on this build and the round 21 build: "Rice: save it, then have it with the afternoon meal.", "...with the noon meal.", "...eat it after midnight.", "...with your lunchbox.", "...with brekkie.", "...with afternoon chai.", "...with nashta.", "...with your dabba.", "...with sehri.", "...after class.", "...after college.", "...after tuition.", "...after duty." ("after gym", "after yoga", "with chai" are open to a same-meal reading; I do not count them.)
- Why it matters: as round 22 A; the note sends the grain to a later meal while the plate counts it.
- Smallest correction: turn the open list into a closed one: after "with" or "next to", accept only a food or companion the engine already knows (dal, sabzi, curd, raita, salad, paneer ... from its companion and food lists); after "after", only "the <food or course>"; hold everything else.

### C. Cosmetic, mostly on both builds. An amount, then the same grain removed under another name or number, reads as kept.
- k23.js, offered: "Have 2 rotis; skip the roti.", "Eat 2 rotis; drop the chapati.", "Keep 2 rotis; leave out the chapatis.", "Have 150 g rice; skip the chawal.", "Keep 150 g rice; no bhaat.", "Take 150 g rice; skip the rice and the roti.", "2 rotis: no roti.", "Roti 2 pieces: skip the phulka.", "Rice 150 g: no chawal."; "Rice, 150 g: no chawal." is newly offered (held on the round 21 build). keepsAmount() and sameGrain() compare literal words, so roti/rotis/phulka/chapati and rice/chawal/bhaat count as different grains. These notes contradict themselves and none appears in the recorded replies. Smallest correction: compare grainKey() of the words, and read a removal that names the kept grain plus another as a removal.

### D. Cosmetic, safe side or listed for completeness.
- D1 held, both builds: "Keep 2 rotis; skip the naan."; "Have 150 g rice, zero sugar in the curd."; "Eat 150 g rice; skip the fried papad; 0 g sugar." (the sweets rule reads "sugar"). k23k.js: 10 other keeps that remove another food stay on offer.
- D2 menus, both builds: "Roti - N/A" with a following item, and "Roti 30 - N/A", sell roti; m20's butter roti under "CHICKEN (BONELESS)"; m21's unpriced "Dal / Rajma / Rice / Roti" and "Dal fry, roti, rice, salad" refused (no Dal Tadka on them).
- D3 names: soya chaap roll and chilli paneer noodles refused (owner's D7 line).

### E. Screens. No screen code changed. Against the round 12 review set: 1,340 identical, 63 the state added in round 13, 38 differ; the 11 with large changes are toast and logged frames. I viewed 320-dark plate-skipped-meds-2 and 360-light-big toast-3 with difference images (scratchpad/r23/sbs/): only the toast's timing differs. Part B as judged in rounds 21 and 22 stands: Raw Linen paper in dark mode, grams and kcal, the medicines toast in plain words, nothing cramped at 320 px or at 130 % text.

## Not inspected
- The owner's own phone model; live Gemini text and live menu reads (no live engine call made; only recorded replies replayed, none with a sold-out mark).
- Films and the WhatsApp post by eye or ear this round (not in the diff; the films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the differing frames named above.
