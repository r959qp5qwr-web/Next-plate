VERDICT: FAIL
BUILD: 9967f973953c07d12776b1136885c5e3824407449f4be49693506383a6998747

# Critic round 16 (branch claude/nice-hawking-307ljy, HEAD fb89b5b, diff read 3f5e47c..fb89b5b)

## What I measured on this state
- `npm run drill`: passes. Every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations. No state was unreachable and no page error was reported.
- `npm run rules`: passes on all three pages ("677 names that are not a grain, 463 true grains"). The c6ab687 build fails 9 of its checks, as the builder says.
- `npm run words`: passes with 42 exceptions. Neither allow file changed (git diff is empty for test/words/ and test/ux/allow.json).
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- I rebuilt the three pages from the sources in my scratchpad. They are byte-identical to the committed pages. No lookbehind is in any of them. The working tree is clean.
- The fingerprint above was taken after all measuring. It matches the builder's.

## Round 15's six findings, checked with my own probes
My round 15 probes (r15/), re-run on this build:
- names.js: 0 of 36, 20, 16, 17 and 31 count. 1 of 85 true grains is refused (Sattu atta roti; round 13 named it a stand-in, D7 now says so).
- e2e.js: every plate and swap is dropped.
- onetap.js: 0 of 30 removals offered; 0 of 20 keeps held.
- menu.js: 0 of 17 removals offered; 0 of 9 keeps refused.
- porgrain.js: no grain sold on the five menus that sell none; every grain sold on the seven that do.

So findings 1 to 6 are fixed for every form I listed. The old gaps ("Rice, not for me", "Rice? Leave it", "Rice, cut it out") are held. Both cosmetic notes are fixed:
- maida now counts as a coating grain;
- the ATTAMAT placeholder is gone.

My older probes hold:
- Round 14: names 0 of 18 and 0 of 50; 0 of 43 true grains refused; one-tap 0 of 20 and 0 of 16; menu 0 of 8 and 0 of 17.
- Round 13: fp13 0 of 49; menu13 0 of 20; onetap13 0 of 18 and 0 of 11; tg13 6 of 37 refused, as before; e2e 0 of 16.
- Round 12: fp12 0 of 92; menu12 0 of 28 removals offered and 2 of 43 keeps refused, as before; onetap12 0 of 39 and 0 of 34.

Recorded live replies, compared with the round 12 build: nothing moves.
- 408 of 495 meals and 225 of 313 base swaps count.
- 65 of 2,005 one-tap notes are held.
- Menus with diabetes: 87 orders, none empty, 9 dropped.

But the fix opens new paths. One is in the coating class itself, the subject of rounds 13 to 15. My round 16 probes and outputs are in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r16/:
- names.js, e2e.js, onetap.js, menu.js, porgrain.js and mat.js, each with its .out file;
- the r15-*, r14-*, r13-* and g13-* outputs are the older probes re-run.
- Each run compares this build, the round 15 build (old-c6ab687.html) and the round 12 build.

## Findings, most serious first

### 1. FAIL, regression in this diff (owner rule 3; A14 "a grain named as a coating does not count"). A coating named with the frying word first counts as the grain of a diabetes plate: "Crispy rava fish", "Tawa rava fish", "Fried rava prawns", "Crispy oats tikki".
- Surface: every diabetes plate and every base swap. This is server-side (src/v5/server.ts runs the page's np-core), so it is the same at every width and scheme.
- What is wrong: the new `friedG` (src/v5/core.js:200) reads a pure grain right after a frying word as a dish, to keep "egg fried quinoa". When it is set, the whole coating test is skipped (core.js:201-205). Then the line `w.some(PUREG...)` returns true. "Crispy", "crisp", "tawa", "fried" and "batter" are all frying words (COATV), and rava, sooji, semolina, oats, millet, ragi, jowar and quinoa are all pure grains.
- Evidence (r16/e2e.out, r16/names.out). With the honest material declared, 23 of 23 are accepted as a diabetes plate, and the vegetarian ones also as a base swap. The round 15 build refused all 23. The round 12 build accepted most of them, so this reopens the round 12-era hole.
  - Plate: Crispy rava fish, Crispy rava fried fish, Crispy rava prawns, Fried rava fish, Tawa rava fish, Tawa rava prawns, Crispy semolina fried fish, Crispy sooji prawns, Crispy oats chicken, Crispy oats fish, Crispy millet fish, Crispy ragi chicken.
  - Plate and swap: Crispy rava paneer, Crispy semolina paneer, Crispy rava potato, Crispy rava brinjal, Tawa rava brinjal, Tawa rava mushrooms, Crispy oats tikki, Fried oats tikki, Crispy oats paneer, Crispy quinoa paneer, Crispy jowar paneer.
  - By name, 26 of 40 such forms count (r16/names.out). The same holds in hosted/v6/index.min.html and hosted/v5/index.min.html.
- Why it matters:
  - "Crispy rava fish" and "tawa rava fish" are the usual menu and home names for the Goan and Konkan rava fry.
  - "Crispy oats tikki" is a common "healthy" snack name.
  - A client with diabetes can be shown a plate where "the grain stays" when the only grain on it is a crust on the fish or the tikki, and the base swap can put that crust in place of the rice.
  - The rule check does not catch this, because its round 15 block holds only my round 15 word orders ("Rava fried fish", not "Crispy rava fish").
- Smallest correction:
  - Count a frying word followed by a pure grain as a dish only when the grain is the head of the name: nothing but grain or dish words after it ("egg fried quinoa", "veg fried millet", "fried rice").
  - When a food word (COATW, MAT_RX, VEGW) comes after the grain ("crispy rava fish", "tawa rava brinjal"), it stays a coating.
  - Add the 23 names above to STANDINS in test/rules/check.js.

### 2. MINOR, regression in this diff (owner rule 3; A14; this weakens the word reader that backs up the declared figures). The narrowed "goes", "can go" and "is/are off|out" let through removals that the round 15 build held.
- Surface:
  - Plate, one-tap changes (the note);
  - Rescue, Read the menu, the order card (the ask).
  - Code: core.js:318.
- What is wrong:
  - These words now count only when nothing follows them, or tonight, today, now, away, back (for "can go"), "for now/tonight/today" or "of the menu/order/plate".
  - Every other time, extent or place falls through: for this meal, for dinner, for the week, this time, this evening, entirely, completely, altogether, off the plate, off the table, back in the pot, back to the kitchen.
  - My round 15 correction asked to count "is out" only when nothing follows it, so part of this follows my own advice. It was too narrow.
- Evidence (r16/onetap.out, r16/menu.out). Worst-case declaration: 200 g left on one-tap; wheat and 80 g on the menu. With an honest 0 g, all are held.
  - One-tap: 20 of 22 are offered, and 19 of them were held by the round 15 build. Among them:
    - "Rice is off for this meal; double dal."
    - "The roti is out for dinner; extra sabzi."
    - "Rice is out entirely; extra dal."
    - "Rice is off the plate tonight; double dal."
    - "The rice goes back in the pot; double dal."
    - "The roti goes for tonight; extra sabzi."
    - "Rotis are out for the week; double sabzi."
    - "Rice is off completely; double dal."
  - Menu asks: 5 of 6 are offered, and all 5 were refused by the round 15 build:
    - "The roti is off for this meal; more salad"
    - "The rice goes back to the kitchen; more salad"
    - "Biryani is off the plate today; raita and salad"
    - "Rice is out entirely; double salad"
    - "The pav goes back; bhaji with salad"
  - None of these forms is among the recorded live notes or asks.
- Why it matters: when the model also fills in the grain figure, the word reader is the only check left. "The rice is off for this meal" is a plain way to write the removal.
- Smallest correction:
  - Also count a time or extent after these words: for this/the meal, for dinner/lunch, for the week, this time, this evening, entirely, completely, altogether.
  - Also count "off the plate/table" and a place away: back in or to the pot, box or kitchen; "goes back" alone.
  - Keep the eating-order and amount forms as keeps: goes last/after/at the end, goes back to 150 g, can go down to or to an amount, goes cold, goes from ... to.

### 3. MINOR, regression in this diff (A14 true-grain side; B6). Two new readings hold ordinary keeps, including eating-order notes ("rice last"), the advice a Gentle-rise change most often gives.
- First reading: `<grain>[,;:?]` followed by take, save, hold, cut or leave plus it/them is now a removal (core.js:289).
- Second reading: the narrowed OWNPART (core.js:246) no longer counts "have one/half <grain> and ..." or "you take 150 g".
- Evidence (r16/onetap.out, r16/menu.out). 12 one-tap keeps are held at 150 g declared, all offered by the round 15 and round 12 builds:
  - "Rice: take it after the salad."
  - "Roti? Take it last, after the sabzi."
  - "Roti, save it for last; start with the dal."
  - "Rice? Save it for the end of the meal, 150 g."
  - "Rice, take it with the dal, 150 g."
  - "Rice; leave it to cool, then reheat 150 g."
  - "Cook the rice in the morning; leave it to cool before lunch, 150 g."
  - "Rotis: hold them in a cloth so they stay soft."
  - "Rotis, cut them into quarters and eat with dal."
  - "Have one roti and give the rest to the family."
  - "Have half the rice and leave the rest for the family."
  - "Share the rice at the table; you take 150 g."
  - On the menu, three orders are refused that the round 15 build offered:
    - "Roti: take it after the dal and salad"
    - "Rice? Take it last, after the salad"
    - "Share the biryani at the table; you take one small bowl"
  - None of these forms is among the recorded live notes or asks.
- Why it matters:
  - "Grain last" and "cooled, reheated rice" are the changes that soften the rise without removing the grain.
  - Holding them takes away the one-tap change, and refusing the ask drops the order at the counter.
- Smallest correction:
  - Count take, save, hold, cut or leave + it/them after a grain only when nothing, out, off, away, aside, home, back or a later word follows.
  - Do not count them when after, last, for last, for the end, with, to cool, in a cloth or into follows.
  - In OWNPART, accept "have one/half (the) <grain>" followed by "and", and "you take <amount>".

### 4. MINOR, regression in this diff, low likelihood (owner rule 3 true-grain side; the round 12 rule that a portion naming a food must also name the grain). A portion with a ", with <side>" part is now read as the curry alone.
- Surface: Rescue, Read the menu, with diabetes (src/v6/engine.js:389-391 partOnly).
- What is wrong: every comma part is read. A part that begins with "with" is not on the list of additions (only "served with" is), so "with raita" reads as "the raita part".
- Evidence (r16/menu.out). Each of these is refused now and was offered by both the round 15 and the round 12 builds:
  - Veg Biryani | 1 plate, with raita, about 400 g
  - Chicken Biryani | 1 plate, with raita and salan, about 450 g
  - Rajma Chawal | 1 plate, with salad, about 400 g
  - Masala Dosa | 1 piece, with sambar and chutney, about 300 g
  - Idli Sambar | 3 pieces, with sambar, about 300 g
  - Aloo Paratha | 2 pieces, with curd, about 300 g
  - Dal Khichdi | 1 bowl, with kadhi, about 350 g
  - Also "Aloo Paratha | 2 pieces, aloo stuffing" (the round 12 build refused it too).
  - The prompt asks for "1 bowl, about 300 g" in at most 10 words (engine.js:359), and none of the 63 recorded live portions has a ", with" part, so this is unlikely.
- Smallest correction:
  - Treat a comma part that begins with "with", "and", "comes with" or "includes" as an addition, as the first part already does.
  - Do not read a filling or stuffing named in the dish ("aloo stuffing" in Aloo Paratha) as the part without the grain.

### 5. MINOR, narrow, mostly not in this diff (owner rule 3; what is left of round 15 finding 6). A grain named on the menu only in a sweet or chaat that is not on the exclusion list still counts as sold.
- Surface: Read the menu, typed menus (engine.js:406-411 soldItems).
- Evidence (r16/porgrain.out). "Dal Tadka | 1 bowl dal with 1 bowl steamed rice" is offered on a menu whose only rice is "Rice cake" (new; the round 15 build refused it) or "Sweet rice" (all three builds). "Chole | 1 bowl with 2 puri" is offered where the only puri is "Pani Puri", "Sev Puri" or "Bhel Puri" (all three builds).
- Smallest correction: add cake, sweet and the chaat puris (pani, sev, bhel, dahi, golgappa) to the snack-and-sweet list.

### Costs, listed, not counted as findings (the safe direction; none appears in the recorded live replies)
- Portion grain now refused where the typed menu does sell it (the round 15 build offered each):
  - a section heading with a dash or bracket: "Breads - Roti / Naan / Kulcha 30", "Breads (Roti, Naan) 30";
  - a heading whose items do not repeat the grain: "RICE / Jeera / Plain 100", "Rice: Jeera / Plain / Veg Pulao";
  - the grain in the dish's own bracket: "Dal Tadka (with Jeera Rice) 240";
  - a menu typed one item per line with no prices ("Dal / Palak paneer / Rice / Roti"): the "Rice" and "Roti" lines are read as section headings, so they sell nothing.
  - Phulka, Chapati and Chawal are not matched to roti or rice in either build.
- Names now refused, counted by the round 15 build:
  - "Low-oil atta paratha" and "Low oil atta roti": "low" is in ATTAPULSE (core.js:138), so "atta" becomes "flour", and "oil flour" then reads as a stand-in. Matching "low carb" as a pair would fix it.
  - Also refused: "Dal atta roti", "Banana and atta pancake", "Vegetable rava", "Veg sooji", "Tomato rava", "Fried paneer quinoa" and "Tawa paneer jowar". Each of these can be read either way.
- Declared materials: nothing moves against the round 15 build (r16/mat.out). The mixes "besan and wheat atta" and "low-gluten wheat atta" stay refused, as in round 15.

### Residual risk, for the live check after "Deploy." (not counted as a finding)
- Photo menus have no typed text, so neither the side nor the portion grain can be checked against what the place sells.
- When the declared figures are wrong, the word reader is the only check left. Findings 2 and 3 are the places where it changed in this diff.

## What holds (checked, not taken on the builder's word)
- All the measured gates above. The fingerprint matches the builder's.
- The diff touches only:
  - src/v5/core.js and src/v6/engine.js;
  - the criteria note and the rule check;
  - the built pages.
- What the diff leaves alone:
  - No screen code, CSS, film or post changed.
  - No safety line is removed. Kidney condition and pregnancy are still referred; I viewed builder-blocked at 360 px at 130 % and rescue-blocked at 320 light.
  - No unit, supplement or rise-band change. No banned word is in the added lines.
- Screens: I pixel-compared every screen of this review with the round 12 review.
  - 1,333 of 1,441 are identical.
  - 63 are the plate-old-saved state, added in round 13.
  - 45 differ:
    - 31 are wait, loading or toast frames: menu-wait 11, plate-loading 10, rescue-wait 6, toast 4.
    - The rest are plate-skipped-meds 6, plate-logged 4, rescue-busy 2 and rescue-blocked 2.
  - I viewed two side by side with a difference image:
    - rescue-blocked-1 at 320 light: text anti-aliasing only;
    - plate-skipped-meds-2 at 412 dark: the toast is caught in one frame and not the other.
  - I made rescue-busy-1 at 320 light but did not view it.
  - I viewed rescue-menu-order-2 at 320 dark and builder-blocked-1 at 360 at 130 % in full.
  - So the earlier visual judgement carries over: nothing runs off at 320 px or at 130 %, the plate and its grams lead, the paper look holds in dark mode, and the Raw Linen look is the same across tabs.

## Not inspected
- The owner's own phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields. No live run was made, so I have not measured how often Gemini:
  - writes a coating with the frying word first ("Crispy rava fish");
  - writes "is off for this meal" or "goes back in the pot";
  - writes "<grain>: take it after ...";
  - writes a ", with <side>" portion.
- The v5 screens served by default (hosted/v5/index.min.html) were not rendered. Only their core was checked: it rebuilds from the same sources, and finding 1 reproduces in it.
- The audio by ear. The films are unchanged; I took loudness from this round's check and voice, music and chimes from round 10's listening record.
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution: I relied on pixel identity with round 12 and viewed the frames listed above.
