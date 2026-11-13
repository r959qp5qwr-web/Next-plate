VERDICT: FAIL
BUILD: 2710dddad5a8e7a8342f432a35ea4aca2c7aeb248d1ee3b4b3d2756472a58575

# Critic round 24 (branch claude/nice-hawking-307ljy, HEAD 41cc681, diff read 9f8c84e..41cc681)

## What I measured on this state
- `npm run rules`: passes on all three pages (408 ok lines, "every rule check holds" three times; the round 23 block with 254 notes, 292 menus, 15 colon sections and 21 keeps included).
- `npm run review`: passes on the first run. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). test/ux/allow.json (still empty) and test/words/allow.json are not in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post in the diff.
- Rebuilt the three pages from HEAD (git archive, build6.js, in scratchpad/build24-*): byte-identical to the committed pages. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- Recorded live replies (g13/live2.js, this build against the round 22 fix build): 408 of 495 meals and 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65. No recorded note uses "then eat/have it" with the grain, and no recorded typed menu carries a sold-out mark, so neither finding below has a measured live frequency.

Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r24/ (m24.js, t24.js, k24.js, *.out, sbs/). Columns: this build, the round 22 fix build (scratchpad/old22.html), the round 21 fix build (scratchpad/old21.html). Profile with diabetes, dinner slot; menus on the nonveg profile at lunch.

## Round 23's findings, checked with my own probes
- A (sold-out grain line sold the grain): m23 0 of 220 offered (round 22 build 170); the 15 colon sections all offered again; m23b 0 of 72 offered. Fixed for the wordings I named.
- B (later meal outside the word list): k23 0 of 192 offered. Fixed for sentences where the later meal sits in the same comma-free clause; see finding A below for the rest.
- C (same grain removed under another name): fixed ("have 2 rotis; skip the phulka", "keep 150 g rice; no bhaat" held). The 10 k23 entries still offered remove a different grain than the one kept ("2 rotis: no rice at all", "Rice 150 g: skip the phulka"); I accept the builder's reading that these keep a grain.
- D1 unchanged and on the safe side ("Keep 2 rotis; skip the naan."; two "sugar" notes held by the sweets rule).
- Code read: the soldItems() chain is one if/else again; thenKeeps() replaces the deny-list lookahead; grainCanon() feeds sameGrain() and the keep-then-remove test. sameGrain() moved from "every" to "some": "rice 150 g; not rice and roti" now reads as a removal (held), on the safe side. No safety line, unit, label or screen code is touched.

## Findings, most serious first

### A. MINOR, round 23 B partly met (owner rule 3; A14). "Then eat/have it" reads only to the next comma, so a later meal after a comma still reads as the grain kept; a bare "after" or "before" is newly read as kept.
- Surface: Plate, the one-tap glucose change (engine-side, every width and scheme).
- Cause: src/v5/core.js:300, thenKeeps(): the clause is `([^.;,!?]*)`, so every word after the first comma, semicolon or full stop is not read; and "after"/"before" with nothing after it ends the loop with ok still true.
- Evidence: k24.js, 54 of 156 later-meal notes offered. On all three builds: "Rice: pack it, then eat it with the dal, later.", "Rice: save it, then have it hot, at night.", "Rice: set it aside, then eat it, tomorrow.", "Rice: pack it, then have it, with breakfast.", "Rice: save it, then eat it, after gym.", "Rice: pack it, then eat it; at lunch.", "Rice: save it, then eat it. Lunch tomorrow." Newly offered on this build (held on the round 22 build): "Rice: save it, then eat it after.", "Rice: pack it, then have it before." The same probe's forms without a comma ("with the next meal", "with dal for lunch", "with the kids at school", "as dinner", "first thing tomorrow") are all held.
- Why it matters: as round 22 A and round 23 B; the note sends the grain to a later meal while the plate, with diabetes, counts it at this one. "With the dal, later" is an ordinary way to write the sentence.
- Smallest correction: read the rest of the sentence, not the clause: after "then eat/have it", every word up to the next full stop (and across commas and semicolons) must pass the allow-list, and a following sentence that names a meal or time holds the note; "after"/"before" must be followed by a food word or the note is held. Add the comma forms and the bare "after." to the round 23 rules block.

### B. MINOR, remainder of round 23 A (owner rule 3; owner rule 5; A14). On a typed, priced menu, a grain line marked sold out in words outside the list, or after a comma or slash, still sells the grain.
- Surface: Rescue, Read the menu, typed menus only (porGrain() skips the check when the menu is a photo, src/v6/engine.js:398).
- Cause: src/v6/engine.js:411, SOLDOUT is a deny list tested on the text after the head; the head splits on a bracket, " - " or ":" only, so "Roti 30, sold out" splits the line into items instead.
- Evidence: m24.js, 66 of 96 offered. On this build and the round 22 build, refused on the round 21 build (the round 22 change "Roti (today) 25 sells roti" opened them): "Roti 30 - khatam", "Rice (khatam) 30", "Naan 30 (nahi hai)", "Roti 30 - none left", "- all gone", "- not there", "- not ready", "(dinner only)" at lunch, "(evening only)", "(after 7 pm)", "(sundays only)", "- no", "- nil", "- not making today", "(not now)", "(x)". On all three builds: "Roti, sold out", "Rice 30, sold out", "Naan / sold out", "Roti 30 / not available", "~~Roti~~ 30". Free-typed lines without a price ("roti khatam", "no roti today", "roti is over") are refused, as they should be (t24.js).
- Why it matters: as round 23 A; with diabetes the order shows "dal with 2 roti" when the person typed that roti is finished, in the word they would use ("khatam", "nahi hai"); the plan counts a grain that is not on the plate. The live engine reads the typed text first, which lowers but does not remove the risk; the guard exists because that read is not trusted.
- Smallest correction: turn the priced-line test into an allow-list, as round 23 B did for one-tap notes: on a priced line whose head is a grain, sell it only when every word after the head is a dish or grain word, a price word or a short known qualifier (today, fresh, tandoori, butter, plain, jeera, per piece, each ...); any other word sells nothing. Treat a comma or slash after a lone grain head the same way. Add the Hindi marks and the comma forms to the rules block.

### C. Cosmetic, safe side.
- C1 m24.js: words on the list used in another sense now refuse a sold grain: "Roti 30 (over 2 people)", "Rice 30 (serves over 2)", "Naan 30 (na)", "Roti 30 (fresh, not today's special)", "(closed at 11 pm? no)" (15 of 19 refused; offered on the round 22 build). The allow-list in B would read "over 2 people" as a qualifier if wanted.
- C2 A sold-out item inside a grain section ends the section: "ROTI / Tandoori 30 / Butter - sold out / Garlic 50" refuses "2 garlic roti"; "NAAN / Butter 40 / Cheese (finished) / Garlic 50" refuses "2 garlic naan" (cur set to "" at src/v6/engine.js:424). The round 22 build sold the sold-out butter roti, so this is the safer error.
- C3 "Rice: leave it, then reheat it and eat it with the dal." is held on all builds (the verb chain "reheat it and eat it" is not read).
- C4 A heading marked sold out does not cover items that name the grain under it ("ROTI (SOLD OUT)" then "Roti 30"), all builds.
- C5 Carried from round 23 D3: soya chaap roll and chilli paneer noodles refused (owner's D7 line).

### D. Screens. No screen code changed (rebuilt pages identical; the page diff is np-core only). Against the round 12 review set: 1,299 identical, 63 the state added in round 13, 79 differ. I viewed difference images for ten of the largest (412-light plate-leave-two-1, 390-light menu-unparsed-2, 360-light plate-loading-1, 390-light plate-ask-busy-3, 320-dark plate-no-body-4 and others; scratchpad/r24/sbs/): the differences are sub-pixel text rendering, a scrolled menu box and focus outline, nothing in layout, copy or colour. Part B as judged in rounds 21 to 23 stands: Raw Linen paper in light and dark, grams and kcal with the nutrient colours, the brand masthead, nothing cramped at 320 px or at 130 % text.

## Not inspected
- The owner's own phone model; live Gemini text and live menu reads (no live engine call made; only recorded replies replayed, none with "then eat it" for the grain or a sold-out mark).
- Films and the WhatsApp post by eye or ear this round (not in the diff; the films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the differing frames named above, by eye.
