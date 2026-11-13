VERDICT: FAIL
BUILD: d21bfb423128eb12f7c4472a2da9f8b2a3823e842f5affbf6d9ea2d65c264352

# Critic round 17 (branch claude/nice-hawking-307ljy, HEAD 394f6a6, diff read e79efd9..394f6a6)

## What I measured on this state
- `npm run drill`: passes. Every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations. No state was unreachable and no page error was reported.
- `npm run rules`: passes on all three pages ("740 names that are not a grain, 512 true grains").
- `npm run words`: passes with 42 exceptions. Neither allow file is in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- I rebuilt the three pages from the sources in my scratchpad. They are byte-identical to the committed pages, and none has a lookbehind. The working tree is clean.
- The fingerprint above was taken after all measuring. It matches the builder's.

## Round 16's five findings, checked with my own probes
I re-ran my round 16 probes (r16/) on this build. The builder's counts reproduce:
- names: 0 of 40 and 0 of 19 count. 4 of 63 true grains are refused, the four D7 reads, which I accept.
- e2e: 0 of 23 accepted.
- one-tap: 0 of 22 removals offered; 0 of 26 keeps held.
- menu: 0 of 6 removals offered; 0 of 16 keeps refused.
- porgrain: 0 of 14 not-sold menus offered; 0 of 17 selling menus refused.

So every form I listed in round 16 is fixed. The costs I listed are also fixed: headings, colons, dashes, brackets, "(with Jeera Rice)", unpriced one-item lines, Phulka/Chapati/Chawal and "Low-oil atta paratha".

My older probes give the same verdicts as in round 16 (round 15 names, one-tap, menu, porgrain, e2e; round 14 names, one-tap, menu, e2e; round 13 fp13, tg13, menu13, onetap13, e2e; round 12 fp12 0 of 92, onetap12 0 of 39 and 0 of 34, menu12 0 of 28 and 2 of 43).

Recorded live replies, compared with the round 12 and round 16 builds: nothing moves.
- 408 of 495 meals, 225 of 313 base swaps and 175 of 1,298 foods count.
- 65 of 2,005 one-tap notes are held.
- Menus with diabetes: 87 orders, none empty, 9 dropped.

But the fixes open neighbouring paths on both sides. The cause is the same each time: the round 16 block in test/rules/check.js holds only my literal round 16 lists, so it passes while the forms next to them move. My round 17 probes and outputs are in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r17p/: names.js, onetap.js, menu.js and e2e.js, each with its .out file, and dalatta.out. Each probe compares this build, the round 16 build (r17/old-fb89b5b.html) and the round 12 build.

## Findings, most serious first

### 1. MINOR, regression in this diff (owner rule 3; A14; the word reader that backs up the declared grain figure). Notes and asks that take the grain off are offered again: 22 one-tap notes and 7 menu asks that the round 16 build held.
- Surface:
  - Plate, one-tap changes (the note);
  - Rescue, Read the menu, the order card (the ask).
- It is server-side and in all three pages, so it is the same at every width and scheme.
- Three causes (src/v5/core.js):
  - (a) Line 306. "<grain>[,;:?] leave/cut/save/hold/take it" now counts only before a short list of words: nothing, out, off, aside, away, alone, tonight, today, or "for tomorrow/later/the family". Every other extent or time falls through. 12 notes are offered, all held by the round 16 build:
    - "Rice: leave it for now; double dal."
    - "Rice? Leave it this time; double dal."
    - "Rice, cut it this time; double dal."
    - "Rice, leave it completely; double dal."
    - "Rice: cut it entirely; more dal."
    - "Rice: cut it altogether; more dal."
    - "Rice: leave it untouched; double dal."
    - "Rice, leave it in the pot; double dal."
    - "Rice? Leave it on the stove; double dal."
    - "Rice: leave it this evening; double dal."
    - "Roti: save it until breakfast; extra sabzi."
    - "Roti: save it for your husband; extra sabzi."
  - (b) OWNPART (core.js:252). The new form `(have|eat|keep|take) (one|half|N) ... and` reads "eat one and a half bowls of dal" as the person's own portion of the grain. That turns off the "for tomorrow / for the kids / later" removal reads. 8 notes are offered, all held by the round 16 build, and 3 of them also by the round 12 build. Among them:
    - "Keep the rice for tomorrow; eat one and a half bowls of dal."
    - "Pack the rice for tomorrow lunch; have one and a half bowls of dal."
    - "Rice for the kids; have one and a half bowls of dal."
    - "Send the rice to the family; you have half a bowl more dal."
  - (c) Line 325. The new continuation list dropped "of the menu/order/plate". These are offered again:
    - "Rice is out of the plate; double dal."
    - "Biryani is out of the order; raita and salad."
- Menu asks: 7 of 8 are offered, refused by the round 16 build, at wheat and 80 g declared:
  - "Rice: leave it for now; more salad"
  - "Roti? Leave it this time; more salad"
  - "Rice, cut it completely; double salad"
  - "Biryani is out of the order; raita and salad"
  - "The rice is out of the plate; rajma and salad"
  - "Pack the rice for tomorrow; have one and a half bowls of dal"
  - "Roti for the table; eat 2 and some salad"
- Evidence: r17p/onetap.out (groups takeit, goes, ownpart) and r17p/menu.out. All of these are offered at 200 g left declared on one-tap; with an honest 0 g, all are held. I reproduced "leave it for now" and "one and a half" in hosted/v6/index.min.html and hosted/v5/index.min.html.
- None of these forms is in the 1,091 distinct recorded notes or the 157 recorded asks (0 hits for "leave it", "and a half", "is out").
- Why it matters: when the model writes a removal and also declares the grain as kept, this word reader is the only check left. "Rice: leave it for now" is a plain way to write it.
- Smallest correction:
  - (a) After "<grain>: leave/cut/save/hold/take it", list the keeps instead of the removals, because the keep list is short and closed: after, last, for last, for the end, with, slowly, in half, into, in a cloth, to cool or so it cools, overnight in the fridge, for N minutes, an amount. Everything else is a removal.
  - (b) In OWNPART, do not accept "and a half". Accept "have one (grain) and" only when "give", "send", "leave", "the rest" or "the other" follows. Accept "you have half" only before the grain or at the end of the clause.
  - (c) Put "of the (meal|plate|order|menu)" back after out/off.

### 2. MINOR, regression in this diff, the one most likely to appear in live use (owner rule 3 true-grain side; A14 "a grain dish named outright counts"). A grain dish named first and then a food, with a frying word in the name, now reads as a coating. "Fried Rice (Veg)", "Schezwan Fried Rice (Chicken)", "Tawa Pulao (Veg)", "Tawa Paratha (Aloo)" and "Crispy Dosa (Paneer)" stop counting.
- Surface:
  - Rescue, Read the menu, with diabetes: the order is dropped as "diabetes-grain" (engine.js:474);
  - every diabetes plate and base swap.
- What is wrong: rule A in known() (core.js:208) fires on any food word after the last grain word when a frying word stands anywhere. In "Fried Rice (Veg)" the brackets become spaces, so the frying word is the dish's own name ("fried rice", "tawa pulao", "crispy dosa") and the food word after it is the variant.
- Evidence:
  - r17p/names.out: 23 names are refused that both the round 16 and round 12 builds counted. Among them: Fried Rice (Veg/Egg/Chicken), Fried Rice - Veg, Fried Rice Chicken, Fried rice chilli paneer, Fried Rice Chilli Chicken Combo, Schezwan Fried Rice (Veg), Egg Fried Rice (Chicken), Fried Noodles (Veg), Tawa Pulao (Veg), Tawa Pulao Paneer, Tawa Paratha (Aloo), Tawa Paratha - Paneer, Tawa Roti Paneer Bhurji, Crispy Dosa (Paneer).
  - r17p/e2e.out: 8 of 8 are refused as a diabetes plate, and the vegetarian ones as a base swap. Both older builds accepted all 8.
  - r17p/menu.out: "Fried Rice (Veg)", "Schezwan Fried Rice (Chicken)" and "Tawa Pulao (Veg)", each with "1 plate, about 350 g" and on the typed menu, are refused. Both older builds offered them.
  - Recorded live menus wrote "Chicken Fried Rice" and "Egg Fried Rice", which still count. The bracket and dash forms are common on Indo-Chinese and dhaba menus, and as_written copies the menu.
- Why it matters: a client with diabetes at a Chinese counter loses the fried-rice order. The grain stays only if the code can see it.
- Smallest correction:
  - In rule A, do not count a frying word that stands directly before a grain dish word (fried rice, fried noodles, tawa pulao, tawa paratha, tawa roti, crispy dosa); that is the dish's name.
  - Keep counting a frying word before a pure grain or a flour ("crispy rava fish", "crispy rice flour fish").
  - Add the 23 names to GRAINS. "Crispy rice fish" and "Crispy rice coated prawns" sit in STANDINS and may need a D7 decision.

### 3. MINOR, regression in this diff (A14 true-grain side; B6). The widened "goes / can go / is off" holds keeps: 19 one-tap keeps and 3 menu asks that the round 16 build offered. They include the reduction notes that are the most common Gentle-rise change.
- Surface: one-tap changes and menu asks (core.js:324-326).
- What is wrong: REMCONT accepts "for the ...", "now", "to the table/family/kids" and "back in the pot" without looking at what comes before the grain or at an amount kept elsewhere in the note. There is no OWNPART guard on this rule, and "can go for" is Indian English for "choose".
- Evidence (r17p/onetap.out, at 150 g declared; all offered by the round 16 build):
  - Choice idiom (8):
    - "You can go for the brown rice, 150 g."
    - "You should go for the millet roti; it rises more gently."
    - "Jowar roti can go for dinner, 2 of them."
    - "Rice can go for the end of the meal, after the salad."
  - Reductions (9):
    - "Half the rice goes back in the pot; 150 g is plenty."
    - "The rest of the rice goes to the family; you keep 150 g."
    - "The extra roti goes to the kids; you have one."
    - "One roti goes back in the box; eat the other with dal."
    - "Rice goes to the table in a bowl; take 150 g."
  - Cooled rice (2):
    - "The rice goes to the fridge for an hour, then reheat 150 g."
    - "Leftover rice goes to the fridge overnight; reheat 150 g."
  - Menu asks refused (r17p/menu.out):
    - "You can go for the jeera rice, half portion"
    - "The rest of the biryani goes to the table; you keep one small bowl"
    - "One roti goes back; eat the other with the dal"
  - Still held from the round 15 fix (both builds): "Rice: leave it aside to cool, then eat 150 g" and "Rice, leave it aside for an hour so it cools; 150 g". My own round 16 correction listed "aside" as a removal word, so part of this follows my advice; "to cool" should win.
  - None of these forms is in the recorded notes (0 hits for "goes", "can go", "go for").
- Why it matters: holding a reduction or a cooled-rice change takes away the one change that softens the rise while keeping the grain.
- Smallest correction:
  - It is not a removal when the grain carries a part or amount word before it in the clause (half, rest of, extra, second, one, most, some, part of), or when the note keeps an amount (OWNPART or "N g").
  - "go for" followed by "the", a grain or an amount is the choice idiom.
  - "to/in the fridge" with cool, reheat, "for an hour" or "overnight" is a keep.
  - "now" and "for the end/second half" are eating order.

### 4. MINOR, regression in this diff, narrow (owner rule 3; the declared material, which is the first check, not the backup). A pulse-flour roti declared as "mixed dal atta" passes as the grain of a diabetes plate.
- What is wrong: "dal" left ATTAPULSE (core.js:138), so "mixed dal atta" and "multi dal atta" now read as wheat atta in both the name and the declared material (isGrainMaterial).
- Evidence (r17p/dalatta.out):
  - "Mixed dal atta roti" with made_of "mixed dal atta" is accepted as plate and swap; the round 16 build refused it.
  - "Multi dal atta roti" with "multi dal atta" is accepted only by this build.
  - "Dal atta paratha" with "dal atta" is accepted; the round 16 build refused it, the round 12 build accepted it.
  - Names alone: Tuvar dal atta roti, Mixed dal atta roti, Multi dal atta roti and Dal-atta roti count.
  - Nothing in the recorded replies names a dal atta.
- In round 16 I said "Dal atta roti" could be read either way, and the builder chose wheat. That choice is fair for "dal atta roti", where dal can be the curry. It is not fair when "mixed", "multi" or a pulse name comes before "dal".
- Smallest correction:
  - Read "<x> dal atta" as dal flour when x is a pulse name, mixed, mix or multi; add tuvar and arhar to ATTAPULSE.
  - Do the same in isGrainMaterial, so "mixed dal atta" is not a grain material.

### 5. MINOR, regression in this diff, low likelihood (owner rule 3). A portion that names only the filling is now offered.
- Surface: Rescue, Read the menu, with diabetes.
- What is wrong: the potato-filling read now applies only to the first comma part (core.js:276). partOnly (engine.js:388) treats any later part that ends in "filling" or "stuffing" as a description.
- Evidence (r17p/menu.out). Each of these is offered, and both older builds refused all three:
  - "Masala Dosa | 1 piece, eat the potato filling, about 150 g"
  - "Masala Dosa | 1 piece, the potato filling, about 150 g"
  - "Aloo Paratha | 2 pieces, the aloo stuffing, about 150 g"
  - My round 16 correction asked for "aloo stuffing" as a description, and that part is right: "1 piece, crisp, with potato filling" is now offered.
  - None of the 63 recorded portions has these forms.
- Smallest correction: read "the/eat the/only the <x> filling|stuffing" in any part as what is eaten; keep the bare "potato filling", "with potato filling" and "aloo stuffing" as the dish.

### 6. MINOR, not in this diff (owner rule 3; A14). Removal forms that every build offers. I found them this round; they are not regressions.
- Evidence (r17p/onetap.out, groups goes and amount; offered by all three builds at 200 g declared):
  - "Rice is out of the meal tonight; double dal."
  - "Rice is out of this meal; double dal."
  - "Rice is off till tomorrow; double dal."
  - "Rice is off until the weekend; double dal."
  - "The rice goes in the fridge; double dal."
  - "The rice goes into the tiffin; double dal."
  - "Rice goes to your husband; double dal."
  - "The rotis go into the box; extra sabzi."
  - "Rice goes back unserved; double dal."
  - "Rice is out for 2 days; double dal."
  - "The rice goes off; double dal."
  - Amount forms:
    - "Rice: drop the 150 g and double the dal."
    - "Rice, not even 50 g tonight; double dal."
    - "Rice? Skip all 150 g; more dal."
    - "Rice: none of the 150 g tonight; double dal."
    - "Rice: skip the 200 g; more dal."
    - "Rice, no 150 g serving tonight; double dal."
- Smallest correction:
  - Add "out of (this|the) meal/plate/order", "till/until", "in/into the fridge/tiffin/box" and "to <a person>" to the removal continuations, inside the guards of finding 3.
  - An absence word that governs the amount directly ("drop the 150 g", "skip all 150 g", "not even 50 g", "none of the 150 g") is a removal. Only an amount that is kept ("more than", "up to", "to 150 g", "150 g only") is a keep.

### 7. COSMETIC, narrow (owner rule 3; the menu reader). Two new ways a typed menu sells a grain it does not sell. Both are offered by this build only (r17p/menu.out):
- "Palak Paneer | 1 bowl with 2 slices bread": "Garlic 50" under a BREADS heading is read as "garlic bread".
- "Dal Tadka | 1 bowl dal with 1 bowl steamed rice": "Kheer (with rice) 90" under DESSERT sells rice. The "(with ...)" bracket is added after the NOTSOLD test reads only the bracket's items.
- Smallest correction: let a "(with ...)" bracket sell nothing when its dish is on NOTSOLD. Add a grain section's name only to items that are not grains on their own and that sit on lines without another heading shape ("MAINS & CURRIES" should end a section).

### Process note, not counted as a finding
For four rounds each fix has cleared my literal lists and moved the forms beside them, in both directions. Before the next hand-over, the builder should generate the probe sets rather than copy mine. That means grain x separator x verb x continuation for the word reader, and dish x frying word x bracket or dash variant for names. The builder should run them against the previous build and review every verdict that changes, not only the listed ones.

## What holds (checked, not taken on the builder's word)
- All the measured gates above. The rebuild is byte-identical, and the fingerprint matches the builder's.
- The diff touches only:
  - src/v5/core.js and src/v6/engine.js;
  - test/rules/check.js and docs/ux/UX-CRITERIA.md;
  - the three built pages.
- What the diff leaves alone:
  - No screen code, CSS, film, post or allow file changed.
  - No removed line touches kidney, pregnancy, referral, units, supplements or the rise bands.
  - No banned word is in the added lines.
- Screens: I pixel-compared all 1,441 screens of this review with the round 12 review.
  - 1,278 are identical.
  - 63 are the plate-old-saved state, added in round 13.
  - 100 differ.
  - I viewed four side by side with a difference image:
    - plate-hero-1 and plate-hero-3 at 360 light;
    - menu-error-1 at 320 light;
    - plate-swap-open-2 at 390 dark.
    In all four, the only difference is glyph anti-aliasing: same plate, grams, labels and layout.
  - 86 of the 100 have under 2,000 strongly changed pixels, which fits the same anti-aliasing. The 14 larger ones are toast, plate-logged and plate-skipped-meds frames. I viewed plate-skipped-meds-1 at 360 at 130 %: the round 12 frame caught the medicines toast and this one did not.
  - The earlier visual judgement therefore carries over. Nothing runs off at 320 px or at 130 %, the plate and its grams lead, the paper look holds in the dark scheme, and the Raw Linen look is the same across tabs.

## Not inspected
- The owner's own phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields; no live run was made. I have not measured how often Gemini:
  - writes "Fried Rice (Veg)" as as_written;
  - writes "Rice: leave it for now", "one and a half bowls of dal", "can go for the" or "half the rice goes back";
  - proposes a mixed dal atta roti.
- The v5 screens served by default were not rendered. Only their core was checked: it rebuilds byte-identical, and findings 1, 2 and 3 reproduce in it.
- The audio by ear. The films are unchanged; loudness is from this round's check, and voice, music and chimes are from round 10's listening record.
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution. I relied on pixel comparison with round 12 and viewed the frames listed above.
- My r14 porgrain probe stops on the same menu in this build and in round 16 (a probe defect). Its first 12 verdicts match round 16.
