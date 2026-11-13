VERDICT: FAIL
BUILD: 637e0179748c4a7106f1189ce15625426f633694c854a4173d13201346d45184

# Critic round 15 (branch claude/nice-hawking-307ljy, HEAD c6ab687, diff read 542ff62..c6ab687)

## What I measured on this state
- `npm run drill`: passes. Every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations. No state was unreachable and no page error was reported.
- `npm run rules`: passes on all three pages.
- `npm run words`: passes with 42 exceptions. Neither allow file changed (git diff is empty for test/words/ and test/ux/allow.json).
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- I rebuilt the three pages from the sources in my scratchpad. They are byte-identical to the committed pages. The working tree is clean.
- The fingerprint above was taken after all measuring. It matches the builder's.

## Round 14's five findings, checked with my own probes
- Finding 1 (rava, semolina or oats on vegetables): fixed for every form I listed. 0 of 50 names count, and all 20 end-to-end plates are dropped. Part of the class is still open: finding 1 below.
- Finding 2 ("<x> ka atta"): fixed. 0 of 18 count. A further 31 forms I tried are refused except three odd ones (finding 5).
- Finding 3 ("<grain>, not tonight"): fixed. 0 of 20 removals are offered at 200 g declared, and 0 of 16 keeps are held. "Not at all", "no way", "never" and "no more" after a comma are held now too.
- Finding 4 (rice bowls refused): fixed. All seven bowls are offered.
- Finding 5 (portion grain matched by one word): fixed for Rice Kheer, Rice Papad and Bread Pakora. A narrow gap is left (finding 6).
- My round 14 costs are gone:
  - "Thin atta roti" and the other adjective forms count again.
  - The milk porridges and "Paneer quinoa" count again.
  - "gehun ka atta" and the other declared forms are accepted.
  - The three menu keeps are offered, and 0 of 16 one-tap keeps are held.
  - The besan mixes stay refused, as my round 13 correction 2 asked.
- My round 13 and round 12 probes, re-run unchanged:
  - fp13: 0 of 49 names count.
  - menu13: 0 of 20 removals offered.
  - onetap13: 0 of 11 keeps held.
  - tg13: 6 of 37 refused, as before.
  - menu12: 0 of 28 removals offered; 2 of 43 keeps refused.
  - onetap12: 0 of 39 removals offered; 0 of 34 keeps held.
  - Round 12 names: 0 of 92 count; 135 of 136 true grains kept.
- Recorded live replies, this build against round 12 (fd0e299) and against round 14 (1861346): nothing moves.
  - 408 of 495 meals hold a grain; 225 of 313 base swaps count.
  - 65 of 2,005 one-tap notes are held.
  - Menus with diabetes: 87 orders, none empty, 9 dropped.

The five findings are fixed for the forms I named. But the coating class is still open for rice flour and atta (finding 1), and this diff opens new paths:
- in the word reader (findings 2 and 4);
- in the portion reader (finding 3);
- in the atta reader (finding 5).

Probe scripts and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r15/
- names.js, names2.js, e2e.js, onetap.js, menu.js and porgrain.js, each with its .out file.
- Each run compares three pages: this build, the round 14 build (old-1861346.html) and the round 12 build (r14/old-fd0e299.html).

## Findings, most serious first

### 1. FAIL (owner rule 3; A14 "a grain named as a coating does not count"). Fish, prawns, chicken, brinjal, potato and mushrooms fried in rice flour, rice rava, wheat flour or atta count as the grain of a diabetes plate. So do rava-fried vegetables named with a word outside the material list.
- This is not a regression: the round 12 and round 14 builds count these too. My round 14 list named rava, sooji, semolina and oats only, so this part was missed.
- Surface: every diabetes plate and every base swap (src/v5/core.js:191-205 known(), core.js:330 declaredGrain). This is server-side, so it is the same at every width and scheme.
- What is wrong:
  - The coating test (core.js:197-198) looks only at grain words that are pure grains (PUREG). "rice" is not in PUREG.
  - The list of grain words leaves out wheat, atta and maida (core.js:195), so "Atta fried fish" reaches the line `w.some(wheat|atta|maize)&&w.length>1` and counts.
  - The material test knows MAT_RX and COATW only. vegetables, veg, corn, capsicum, tomato, onion, kofta and vada are companion words (COMPT), so "Rava fried vegetables" passes as a grain dish.
  - The declared field cannot catch this, because the coating really is rice flour or atta.
- Evidence (r15/e2e.out, r15/names.out, r15/names2.out). With the honest material declared, these plates are accepted with diabetes:
  - Rice flour fried fish (as "rice flour" and as "rice"), Rice rava fried fish, Rice flour tawa fish
  - Atta fried fish, Wheat flour fried fish, Wheat fried fish, Atta tawa fish
  - Rice flour fried brinjal, Rice rava fried brinjal, Rice flour fried potato, Rice flour fried mushrooms, Atta fried brinjal, Wheat fried brinjal, Atta fried potato, Atta fried mushrooms. Each of these is also offered as a base swap.
  - Rava fried vegetables, Rava fried mixed vegetables, Rava fried veg, Sooji fried veg, Rava fried corn, Rava fried sweet corn, Rava fried capsicum, Rava fried tomato, Rava fried onion, Rava fried kofta, Rava fried vada (plate and swap).
  - By name, these also count: Crispy rice flour fish, Rice flour fried prawns, Rice flour fried chicken, Fish fry with rice flour, Tawa fish with rice flour.
- Why it matters:
  - Fish fried in a rice-flour coating is as everyday on the Konkan, Mangalore and Kerala coast as rava fry.
  - A client with diabetes can be shown a plate where "the grain stays" when the only grain on it is a dusting of flour on the fish.
  - The base swap can put that coating in place of the rice.
  - This is the same coating class as rounds 13 and 14.
- Smallest correction:
  - In known(), apply the coating test to every grain material named as a flour or rava: "rice flour", "rice rava", "wheat flour", atta, maida, cornflour. Also apply it to rice when "flour" or "rava" follows it.
  - For this test, count vegetables, veg, corn, capsicum, tomato, onion, kofta and vada as materials.
  - Read "with <grain> flour" as a coating, not a grain side.
  - Add these names to STANDINS in test/rules/check.js.

### 2. MINOR, regression in this diff (owner rule 3; A14; this weakens the word reader that backs up the declared figures). "Your plate", "your portion", "have one" and "have half" let a grain given to the family or the table through. So does "a rest/break for a few days".
- Surface:
  - Plate, one-tap changes (the note);
  - Rescue, Read the menu, the order card (the ask).
- What is wrong:
  - OWNPART (core.js:238) is tested against the whole text. It matches any "your plate/portion/share/serving", "you have/eat one" or "have one/half", whether or not that own portion holds any grain. When it matches, the family, table, share and "later" removals at core.js:308 and core.js:312 are switched off.
  - The new exception for "a rest/break" (core.js:308) treats "for 2 days", "for a few days" and "for three meals" as cooking time.
- Evidence (r15/onetap.out, r15/menu.out). Worst-case declaration: 200 g left on one-tap; wheat and 80 g on the menu. With an honest 0 g, all of these are held.
  - One-tap, offered now and held by the round 14 build:
    - "Rice for the family; your plate is dal and salad."
    - "Keep the rice for the kids; your plate: paneer and palak."
    - "The khichdi is for the family tonight; your portion is the dal and salad."
    - "Rotis for the table; your share is the sabzi."
    - "Have one bowl of dal; the rice is for the family."
    - "Have half the paneer first; rice for the kids."
    - "Rice to share at the table; you have one bowl of dal."
    - "Serve the khichdi to the family; your plate is paneer and palak."
    - "Rice for the others at the table; your serving is dal and salad."
    - "Give the rice a rest for a few days; more dal." The same holds for "a break for 2 days", "a rest for three meals" and "a break for a few meals".
  - "Pack the rice for tomorrow; your plate is dal and salad." was held by both the round 12 and the round 14 builds, and is offered now.
  - Menu, offered now and refused by the round 14 build:
    - "The roti is for the table; have one bowl of dal and the salad"
    - "The biryani is for the family; your portion is the raita and salad"
    - "Rice for the kids; you have one bowl of dal"
    - "Pav for the family; your plate is the bhaji"
    - "Bhature to share at the table; have one bowl of chole"
  - None of these forms is among the 1,091 recorded live notes or the 163 recorded live asks.
- Why it matters:
  - "Make the rice for the family; your plate is dal and salad" is a natural way to tell a client with diabetes, who cooks for a family, to leave the rice out.
  - When the model also fills in the grain figure, the word reader is the only check left.
- Smallest correction:
  - Let the own portion cancel a share only when it names a grain or grams of one: "you keep 150 g", "your 150 g portion", "have one roti".
  - Treat "a rest/break for ..." as cooking only when minutes follow.
  - Add the forms above to the rule check.

### 3. MINOR, regression in this diff (owner rule 3; the round 12 rule that a portion naming a food must also name the grain). A portion that names only the curry after its first comma is read as the whole dish.
- Surface: Rescue, Read the menu, with diabetes (src/v6/engine.js:388 partOnly).
- What is wrong: partOnly now reads only `p.split(/,|;/)[0]`. The change was meant for "1 plate, extra onions on the side". But it also drops every food named after the first comma.
- Evidence (r15/menu.out). Each is offered now and was refused by both the round 12 and the round 14 builds:
  - Rajma Chawal | Half plate, rajma and salad, about 250 g
  - Rajma Chawal | 1 plate, mostly rajma, about 300 g
  - Pav Bhaji | 1 plate, the bhaji and onions, about 250 g
  - Dal Chawal | 1 bowl, the dal part, about 250 g
  - The recorded live portions are all "<amount>, about <weight>", so this form is not in them.
- Why it matters: the order card would show a curry-only order as the whole rice or bread dish to a client with diabetes.
- Smallest correction: drop only the comma parts that are additions or weights ("extra ...", "... on the side", "about N g"), and read the rest as before.

### 4. MINOR, regression in this diff (A14 true-grain side; B6). The new "goes", "can go" and "is out" removals hold ordinary keeps. They hold eating-order notes ("rice last") and smaller grain portions, which are the two ordinary ways to soften the rise.
- Surface:
  - Plate, one-tap changes;
  - Rescue, Read the menu, the ask (core.js:309).
- What is wrong:
  - `goes` counts as a removal unless well, with, into, in, on, best or great follows.
  - `can/could go` counts unless with, into, in, on or well follows.
  - `is out` counts unless "of" follows.
  - Last, after, at the end, down, back, to, from, cold and thinner all fall through to "removal".
- Evidence (r15/onetap.out, r15/menu.out).
  - 12 of 20 keeps are held now. All were offered by the round 12 and round 14 builds:
    - "Salad first, dal next, rice goes last."
    - "Eat the salad first; the rice goes last."
    - "The rice can go down to 150 g; add more dal."
    - "Rice goes back to 150 g; extra dal on the side."
    - "Rice goes from 200 g to 150 g; more dal."
    - "Once the rice is out, squeeze lemon over it."
    - "Cook the rice in the morning; rice that goes cold and is reheated gives a gentler rise."
    - "The roti can go thinner; 2 rotis of 40 g."
    - and four more.
  - On the menu, the order is now refused for "Eat the salad first; the roti goes last" and "Rice can go down to half a bowl; more salad".
  - None of these forms is among the recorded live notes or asks.
- Why it matters:
  - "Vegetables first, grain last" and "a smaller grain portion" are the advice a Gentle-rise change most often gives.
  - Holding them takes away the one-tap change, and refusing the ask drops the order at the counter.
- Smallest correction: count "goes" and "can go" only when nothing follows them, or when a place away from the person follows ("goes back in the pot", "can go to the family"). Count "is out" only when nothing follows it.

### 5. MINOR, low likelihood, regression in this diff (owner rule 3; A14). attaNorm judges only the one word before "atta", and it reads back across commas.
- Surface: diabetes plates and base swaps (core.js:140 attaNorm).
- Evidence (r15/names.out, r15/e2e.out). Each of these is refused by the round 14 build, and is now accepted as plate and swap with "atta" declared:
  - "Soya chunks atta roti": "chunks" is not a material, so "atta" stays wheat.
  - "Gram flour atta roti": "flour" is not a material.
  - "Besan, atta-free roti": the reader crosses the comma, so "atta-free" becomes "flour-free" and the stand-in mark is lost.
- Smallest correction:
  - Stop the walk-back at punctuation.
  - Skip "flour" and "chunks" as filler, so the material before them is judged.

### 6. MINOR, narrow (owner rule 3; what is left of round 14 finding 5). A grain that the menu names only in brackets, after a dash, or in a slash list under another dish still counts as sold.
- Surface: Read the menu, typed menus (engine.js:316 menuItems, engine.js:392 porGrain).
- Evidence (r15/porgrain.out). All three builds count the grain:
  - "Dal Tadka | 1 bowl dal with 1 bowl steamed rice" is offered on a menu whose only rice is "Kheer (Rice)", "Phirni (rice)" or "Papad - Rice".
  - "Palak Paneer | 1 bowl with 2 slices bread" is offered on a menu with "Pakode: Aloo / Paneer / Bread".
- Smallest correction: a grain word split off by a bracket, dash, colon or slash belongs to the dish before it. Count a grain as sold only when it ends a menu line's own name.

### Costs, listed, not counted as findings (the safe direction; none appears in the recorded live replies)
- Portion grain, now refused where the menu does sell it (offered by the round 14 build), because the last word of the item is not the grain:
  - "Steamed Rice Half 70 Full 120", "Rice Plain", "Roti Tandoori", "Roti Basket (4)", "Rice Bowl";
  - free-typed menus such as "... jeera rice and tandoori roti" or "... roti and rice".
  - The kulcha/kulche spelling is not matched in either build.
- Names now refused by the coating test:
  - "Banana oats", "Carrot oats", "Palak oats chilla", "Carrot sooji cheela";
  - the oats or sooji mixes with besan or moong. Refusing those mixes is consistent with round 13 correction 2.
  - "Chia overnight oats", "Almond overnight oats" and "Apple oats porridge" are refused in all three builds.
- Refused since round 13 and still refused: Palak, Methi, Aloo, Carrot and Paneer "atta" parathas, rotis and puris; "Grilled chicken, thin atta roti"; "Palak paneer, homemade atta roti".
- Old gaps, offered in all three builds:
  - "Rice, not for me; extra dal."
  - "Rice? Leave it; extra dal."
  - "Rice, cut it out; extra dal."

### Cosmetic (code only, not shown to the person)
- COATG lists maida, but maida is filtered out of the grain words before the test, so that entry never applies (core.js:194-197).
- ATTAMAT holds a placeholder word, "kuttu_never" (core.js:139).

### Residual risk, for the live check after "Deploy." (not counted as a finding)
- Photo menus have no typed text, so neither the side nor the portion grain can be checked against what the place sells.
- When the declared figures are wrong, the word reader is the only check left. Findings 2 and 4 are the places where it changed in this diff.

## What holds (checked, not taken on the builder's word)
- All the measured gates above. The fingerprint matches the builder's.
- The diff touches only:
  - src/v5/core.js and src/v6/engine.js;
  - the criteria note and the rule check;
  - the built pages.
- What the diff leaves alone:
  - No screen code, CSS, film or post changed.
  - No safety line is removed. Kidney condition and pregnancy are still referred; I viewed builder-blocked at 360 px at 130 %.
  - No unit, supplement or rise-band change.
  - No banned word in the added lines.
- Screens: I pixel-compared every screen of my own review run with the round 12 review.
  - 1,324 of 1,441 are identical.
  - 63 are the plate-old-saved state, added in round 13.
  - 54 differ. I viewed 4 of these side by side with a difference image: plate-leave-two at 320 light, builder-blocked at 360 at 130 %, plate-skipped-meds at 360 at 130 % and plate-logged at 320 dark. I made images for rescue-entry at 360 dark and plate-limit at 412 light but did not view them.
  - In the 4 I viewed, each difference is text anti-aliasing or a toast caught or missed. Going by name, 34 of the other 50 are wait, loading or toast frames (rescue-wait 10, menu-wait 9, plate-loading 8, toast 7); I did not view the rest.
  - I also viewed rescue-menu-order at 320 dark and plate-hero at 360 at 130 % in full.
  - So the earlier visual judgement carries over: nothing runs off at 320 px or at 130 %, the plate and its grams lead, the paper look holds in dark mode, and the Raw Linen look is the same across tabs.

## Not inspected
- The owner's own phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields. No live run was made, so I have not measured how often Gemini:
  - names a rice-flour or atta coating as the grain;
  - writes a grain "for the family" beside "your plate";
  - puts the food after the first comma of a portion;
  - says the grain "goes last".
- The v5 screens served by default (hosted/v5/index.min.html) were not rendered. Only their core was checked: it is built from the same sources, and the rule check passes on it.
- The audio by ear. The films are unchanged; I took loudness from this round's check and voice, music and chimes from round 10's listening record.
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution: I relied on pixel identity with round 12 and viewed the frames listed above.
