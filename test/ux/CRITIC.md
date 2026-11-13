VERDICT: FAIL
BUILD: 7ee8d60ec2e9ae6ac208d88c9dd4b473a81c52fc75c13e1f6526ee7d24b13b12

# Critic round 14 (branch claude/nice-hawking-307ljy, HEAD 1861346, diff read e73e070..1861346)

## What I measured on this state
- `npm run drill`: passes. Every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations.
- `npm run rules`: passes on all three pages ("478 names that are not a grain, 354 true grains"). Against the round 12 build (fd0e299) the same check fails 12 checks.
- `npm run words`: passes (42 exceptions). Neither allow file changed (git diff is empty for test/words/ and test/ux/allow.json).
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- `node eval/v6/menu-checks.js` and `node eval/v6/look-checks.js`: pass.
- I rebuilt the three pages from the sources in my scratchpad. They are byte-identical to the committed pages. The working tree is clean.
- The fingerprint above was taken after all measuring. It matches the builder's.

## Round 13's four findings, checked
I re-ran my round 13 probes unchanged against hosted/v6/index.html. The builder's figures hold:
- Finding 1 ("<x> atta", grain coatings on fish and paneer): fixed for the forms I listed.
  - By name: 0 of 49 count.
  - End to end: 0 of 16 plates accepted or offered.
  - Declared materials: 1 of 62 non-grains accepted (rajgira, which D7 counts). 1 of 76 true grains refused ("wheat and chickpea flour", which my own correction 2 refuses).
  - Two parts of the same class remain open: findings 1 and 2 below.
- Finding 2 (portion grain not on the menu): fixed. All 4 orders are refused on a menu with no grain. A narrow gap is left: finding 5.
- Finding 3 (protein swap over the grain item): fixed. With diabetes no protein swap is offered when the first protein item is the declared grain. Without diabetes the swap stays. The v5 and v6 apps both swap through the same core.
- Finding 4 (declared list too narrow): fixed for every word I listed (cracked wheat, beaten rice, samai, varagu, kambu, thinai, idli rice, whole wheat bread and the rest).
- My round 12 probes, re-run with my own scripts:
  - menu: 0 of 28 removals offered; 41 of 43 keeps offered.
  - one-tap: 0 of 39 removals offered; 0 of 34 keeps held.
  - names: 0 of 92 (round 12 list) and 0 of 115 (round 11 list) count; 135 of 136 true grains kept.
- Recorded live replies against the round 12 build: nothing moves.
  - 408 of 495 meals hold a grain; 225 of 313 base swaps count; 0 of 1,298 foods change.
  - 65 of 2,005 one-tap notes are held.
  - Menus with diabetes: 164 distinct orders, 9 dropped, none changed.

Round 13's costs are gone: the passive forms, "tandoori roti, not butter naan", "set the khichdi aside to rest", carrot upma and the rest. But this diff opens two new paths on the safety side (findings 1 and 3) and refuses some ordinary orders (finding 4).

Probe scripts and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r14/
- Scripts: names.js, e2e.js, onetap.js, menu.js, porgrain.js, mat14.js, plus copies of my round 12 scripts.
- Each run writes a *.out file. Most take the new page and old-fd0e299.html (the round 12 build) as arguments.
- Screen comparison: cmpshots.out, with side-by-side images in sbs/.

## Findings, most serious first

### 1. FAIL (owner rule 3; A14 "a grain named as a coating ('rava-crusted') does not count"). Rava-, semolina- or oats-fried vegetables count as the grain of a diabetes plate, with an honest declaration. Four of them are newly opened by this diff.
- Surface: every diabetes plate (src/v5/core.js:387 declaredGrain) and every base swap (core.js:398). This is server-side, so it is the same at every width and scheme.
- What is wrong:
  - In known(), the coating test (core.js:194) fires only beside COATW (core.js:186): fish, meat, paneer, egg, tofu, tikki, cutlet, kebab, pakora or fry.
  - Beside a vegetable, the next line (core.js:195) returns true as soon as a pure grain word (rava, sooji, semolina, oats) appears. This happens before the material test.
  - The declared field cannot catch this, because the coating really is rava. isGrainMaterial("rava") is true, and declaredGrain counts the item's grams (120 g), not the grams of the coating.
  - This diff added brinjal, baingan, pumpkin and beetroot to the companion words (core.js:103) so that "Brinjal rice" and "Pumpkin paratha" count. The side effect is that "Rava fried brinjal" now counts too.
- Evidence (r14/names.out, r14/e2e.out, r14/e2e-r12.out):
  - By name, 45 of 50 rava, semolina or oats coatings count. Among them: Rava fried brinjal, Rava fried baingan, Rava brinjal, Rava tawa brinjal, Suji fried brinjal, Rava fried pumpkin, Rava fried beetroot, Rava fried potato, Rava fried gobi, Rava fried mushrooms, Semolina fried potato, Rava fried soya chunks, Rava fried raw banana, Oats omelette.
  - The first 7 of these were refused by the round 12 build.
  - End to end, on a diabetes plate where this item is the only grain, declared honestly as "rava" or "semolina", the plate is accepted and offered as a base swap for: Rava fried brinjal (as rava and as semolina), Rava fried potato, Rava fried mushrooms, Rava fried gobi, Rava fried pumpkin, Rava fried beetroot, Semolina fried potato and Rava fried soya chunks.
  - Brinjal, pumpkin and beetroot are new against round 12.
  - The rule check lists rava fish and paneer, and none of these names.
- Why it matters: rava fry of brinjal, raw banana or potato is an everyday Konkani and South Indian side. A client with diabetes can be shown a plate where "the grain stays" when the only grain on it is a thin coating on a vegetable. The base swap can also put that coating in place of the rice. This is the coating class from round 13. The fix covered the protein words I named and not the vegetables.
- Smallest correction:
  - In known(), treat these as a coating: a name whose only grain words are pure grain words, with no grain dish named, holding "fried", "fry", "tawa", "crusted" or "coated", or any vegetable, legume or protein material word (MAT_RX plus brinjal, baingan, pumpkin and beetroot).
  - Keep "oats chilla" and similar batter dishes counting by listing them.
  - Add the names above to STANDINS in test/rules/check.js.

### 2. FAIL-class, lower likelihood (owner rule 3; A14; the unfinished part of round 13 correction 1). A pulse or nut flour named "<x> ka atta" counts as a grain by name. With "atta" or "wheat" declared, the plate is accepted.
- Surface: diabetes plates, base swaps and menu orders (core.js:138-139).
- What is wrong: ATTAOK lists ki, ka and ke. So in "chana ka atta" the word before "atta" is "ka", and attaNorm leaves it as "atta", which is a pure grain. "Chane ka atta" is the everyday Hindi name for besan.
- Evidence (r14/names.out, r14/e2e.out). All 18 of 18 forms I tried count. Among them:
  - Chana ka atta roti, Moong ka atta chilla, Besan ka atta chilla, Peanut ka atta roti;
  - Soya ka atta roti, Urad ka atta roti, Coconut ka atta roti, Kathal ka atta roti;
  - Chana ka atta thepla, Chana ka atta bhakri, Chana ke atta ki roti.
  - With the honest material "chana ka atta" the plate is dropped.
  - With made_of "atta" or "wheat", these plates are accepted and offered as base swaps: Chana ka atta roti, Moong ka atta chilla, Besan ka atta chilla, Peanut ka atta roti and Chana ka atta thepla.
  - Round 12's build counted them too. This is not a regression; it is the gap the round 13 fix left.
- Why it matters: round 13's point was that "atta" means any flour. So "atta" is a likely word for a model to write as the material of a chana-flour roti. Then both locks open together. The dish name in this Hindi word order is less likely in Gemini's English replies than "besan roti", so the likelihood is lower than in finding 1.
- Smallest correction:
  - In attaNorm, when the word before "atta" is ka, ki or ke, judge the word before that one.
  - Add the names to STANDINS, and "Gehun/Bajre/Makki ka atta roti" to GRAINS.

### 3. MINOR (owner rule 3; A14; regression in this diff, in the word reader that backs up the declared figures). "<grain>, not tonight" and "<grain>, no thanks" are read as one grain chosen over another, so removals get through.
- Surface:
  - Rescue, Read the menu, the order card (the ask);
  - Plate, one-tap changes (the note).
- What is wrong: the new contrast rule (core.js:274) skips any "no", "not", "never" or "without" that follows a comma or semicolon after a grain word. It does not check that the words after the negation name another grain.
- Evidence (r14/menu.out, r14/onetap.out). Worst-case declaration (wheat, 80 g on the menu; 200 g left on one-tap):
  - On the menu, these are offered now and were refused by round 12's build:
    - "Roti, not tonight; extra salad" (with 1 Tandoori Roti)
    - "Roti, no thanks; ask for extra salad"
    - "The rice, not today; double salad" (with 1 Steamed Rice)
    - "Have the dal and salad, roti, not tonight"
    - "Rajma Chawal | 1 plate | Rice, not tonight; extra rajma"
  - On one-tap, these are offered now and were held by round 12's build:
    - "Khichdi, not tonight; double the palak and paneer."
    - "Rice, no thanks; extra salad instead."
    - "The rice, not today; extra dal."
    - "Have the paneer and palak, rice, not tonight."
  - With an honest 0 g left, all of these are held.
  - None of these forms is among the 157 recorded live asks.
- Why it matters: when the model tells a client with diabetes to leave the rice off but still fills in the grain figure, the word reader is the only check left. This diff weakens that check for a short, natural way of saying it.
- Smallest correction: skip the negation only when the words it applies to name a grain ("tandoori roti, not butter naan", "brown rice, not white"). Add the nine forms above to the rule check.

### 4. MINOR (A14 true-grain side; B6; regression in this diff). With diabetes, ordinary rice-bowl orders are refused.
- Surface: Rescue, Read the menu, with diabetes (src/v6/engine.js:384-386 partOnly, core.js:194 COATW).
- What is wrong:
  - The new bowl rule reads "1 bowl" of any dish named with a curry word and a bread or rice word as the curry alone. That rule was meant for "Chole Bhature | 1 bowl".
  - The coating rule also refuses grain bowls named with a protein.
- Evidence (r14/menu.out). Each was offered by round 12's build and is refused now ("diabetes-grain"):
  - Rajma Chawal | 1 bowl, about 350 g
  - Rajma Chawal Bowl | 1 bowl, about 400 g
  - Chole Rice Bowl | 1 bowl
  - Dal Chawal | 1 bowl
  - Kadhi Chawal | 1 bowl
  - Chicken Curry Rice Bowl | 1 bowl
  - Quinoa Chicken Bowl | 1 bowl
  - No recorded live order changed.
- Why it matters: rice bowls are a standard order at Indian quick-service places. A client with diabetes standing at the counter gets nothing, or a worse order, for the dish the rule exists to keep.
- Smallest correction:
  - Limit the bowl rule to bread pairs (bhature, kulche, pav, puri, baati) and leave rice dishes out.
  - Never apply it when the dish name itself says "bowl".
  - Let a pure grain beside a protein count when the name is a bowl or holds "with".

### 5. MINOR (owner rule 3; narrow gap left by round 13 finding 2). A grain written into the portion counts when the menu sells that word only inside another dish.
- Surface: Read the menu, typed menus (engine.js:393 porGrain, engine.js:312 sideOnMenu).
- What is wrong: porGrain tests each single grain word against the menu text. "rice" is found in "Rice Kheer" or "Rice Papad", and "bread" in "Bread Pakora". The side test checks the whole side name instead.
- Evidence (r14/porgrain.out):
  - On a menu with no rice except Rice Kheer, "Dal Tadka | 1 bowl dal with 1 bowl steamed rice" is offered with diabetes.
  - On a menu with Rice Papad and Bread Pakora, "Palak Paneer | 1 bowl with 2 slices bread" is offered.
- Smallest correction: test the grain phrase in the portion ("steamed rice", "2 slices bread") with sideOnMenu, as "with" is tested. Or require a menu line that is a grain on its own.

### Costs, listed, not counted as findings (the safe direction; none appears in the recorded live replies)
- Name test, true grains now refused that round 12 counted (r14/names.out):
  - Thin atta roti, 2 small atta rotis, Soft atta phulka, Homemade atta roti, Tawa atta roti, Mixed atta roti, Fresh atta chapati, Hot atta phulkas, Roti (atta), Phulka (atta). ATTAOK lacks the everyday adjectives.
  - Dalia, oats, ragi and rolled oats "milk porridge", refused by the new "milk" condiment word.
  - Paneer quinoa.
  - Multi-grain atta roti and Sharbati atta roti stay refused, as in round 12.
- Declared material, refused (r14/mat14.out):
  - New in this diff: "wheat and besan", "atta and besan", "besan and atta", "atta with besan" and "sooji and besan" (the material of missi roti, which D7 counts), and "mixed atta".
  - Refused in both builds: "gehun ka atta", "makki ka atta", "bajre ka atta", "multi-grain atta", "sharbati atta", "stone-ground atta", "fresh atta".
- Menu keeps now refused:
  - "Veg Biryani | Half plate | Order one biryani to share with a friend"
  - "Paneer Tikka with 2 Tandoori Roti | Order 2 roti for the table and have one"
  - "Pav Bhaji | 1 plate, extra onions on the side"
- One-tap keeps now held, 7 of 16 tried (r14/onetap.out):
  - "Give the khichdi a rest for 5 minutes so it thickens"
  - "Let the rice have a rest for 5 minutes before you serve 150 g"
  - "Take a break between spoons of rice"
  - "Rice for the family; you keep 150 g with extra dal"
  - "Rice out of the cooker after two whistles, then add lemon"
  - "Hot rice out of the pot, cooled for 10 minutes"
  - "Share the meal: the same rice for the family, your 150 g portion"

### Residual risk, for the live check after "Deploy." (not counted as a finding)
- Photo menus have no typed text, so neither the side nor the portion grain can be checked against what the place sells. The prompt (engine.js:350) asks for a grain "from this menu". The live run should count how often a photo-menu order names a grain the photo does not show.
- Round 13's residual risk stands: when the declared figures are wrong, the word reader is the only check left (finding 3 is one place where it got weaker).

## What holds (checked, not taken on the builder's word)
- All the measured gates listed at the top, on the built pages. The fingerprint matches.
- The diff touches only src/v5/core.js, src/v6/engine.js, the criteria note, the rule check and the built pages:
  - No screen code, CSS, film or post changed.
  - No safety line is removed. Kidney condition and pregnancy are still referred.
  - No unit, supplement or rise-band change.
  - No banned word in the added lines.
- Screens. I pixel-compared every screen of my own review run with the round 12 review:
  - 1,315 of 1,441 are identical.
  - 63 are the plate-old-saved state, identical to plate-hero. I viewed it at 320 dark.
  - 63 differ. I viewed 10 of these side by side, with a difference image: plate-hero 390 light, skipped-meds 390 light, logged 320 dark, rescue-entry 360 at 130 %, and others. Each difference is text anti-aliasing, a toast caught or missed, or a wait or loading frame.
  - So round 12's visual judgement carries over: nothing runs off at 320 px or at 130 %, the plate and its grams lead, the paper look holds in dark mode, and the Raw Linen look is the same across tabs.

## Not inspected
- The owner's own phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields. No live run was made, so I have not measured how often Gemini:
  - names a vegetable rava fry or a "ka atta" flour as the grain;
  - writes "<grain>, not tonight";
  - orders rice bowls at a counter;
  - fills the fields against its own words.
- The v5 screens served by default (hosted/v5/index.min.html) were not rendered. Only their core was checked, by the rule check and my end-to-end probe (same results as v6).
- The audio by ear. The films are unchanged; I took loudness from this round's check and voice, music and chimes from round 10's listening record.
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution: I relied on pixel identity with round 12 and viewed the changed and new frames listed above.
