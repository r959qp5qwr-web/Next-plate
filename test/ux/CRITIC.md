VERDICT: FAIL
BUILD: a750748186ecccf2015650b22c76d3c91790a24d9945c8deaaec2b5bc0cdc4e4

# Critic round 13 (branch claude/nice-hawking-307ljy, HEAD fd0e299, diff read 9743365..fd0e299)

## What I measured on this state
- `npm run drill` passes: every planted fault is caught.
- `npm run review` passes: 9 runs x 46 states = 414 checks, 0 violations.
- `npm run rules` passes on all three pages ("427 names that are not a grain, 338 true grains").
- `npm run words` passes (42 exceptions). Neither allow file changed this round (git diff is empty for test/words/ and test/ux/allow.json).
- `npm run films` passes on all four films: -16.7 to -16.8 dB, picture from 0 s, no decode errors. The films are unchanged since round 12.
- `node eval/v6/menu-checks.js` and `node eval/v6/look-checks.js` pass.
- I rebuilt the three pages into my scratchpad from the sources. They are byte-identical to the committed pages.
- The fingerprint above was taken after measuring. It matches the builder's.

## The builder's claims, checked
- My round 12 names: 0 of 92 count as a grain. Round 11 names: 0 of 115. True grains: 135 of 136 kept ("Ghee roast" is the one refused, as before). Holds.
- Menu, worst-case declaration (wheat, 80 g): 0 of 28 removals offered; 41 of 43 keeps offered (the wrap, D7, and the kathi roll, dropped by the diet rule). One-tap: 0 of 39 removals offered, 0 of 34 keeps held. Holds.
- Recorded live replies: I compared every recorded food (1,298) and base swap (326) between this build and round 12's build (ace25c9). Not one is read differently. One-tap notes held: 65 of 2,005 (71 before). Holds.
- Recorded menus replayed with diabetes: 164 distinct orders, 9 dropped for the grain rule. Each is an order with no grain dish (Paneer Tikka with salad, Hara Bhara Kabab, Mixed Veg) or the paneer tikka wrap. Only three orders changed against round 12, all to offered: the two recorded Veg Thali orders and the Masala Dosa. Holds.
- plate-old-saved: I ran this state against round 12's page. It fails at all 9 runs ("a plate saved before the grain field is still shown") and its tune request gets a 400. This build passes it. Its 63 screens are pixel-identical to plate-hero. Holds.
- The declared fields fail closed when Gemini leaves them empty, gives a missing item or under 30 g, or names a non-grain material in plain English ("besan", "gram flour", "cauliflower", "almond atta"). Holds. Findings 1 and 4 are about the word list behind that test.

Round 12's three findings are fixed for every case I listed. The ordinary orders from round 12 finding 3 are offered again. But the owner's rule 3 still has a hole that both the name test and the new declared-field test fall through: the word "atta". This round also added a new path on the menu where an order can claim a grain the restaurant does not sell.

Probe scripts and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r13/probe/. lib.js loads np-core from a built page. The scripts are fp13.js (names in fp13-names.txt), cmp.js, e2e.js, mat.js, menu13.js, onetap13.js, porgrain.js, protswap.js, groups.js, replay13.js, replaycmp.js, livefoods.js and tg13.js. Each writes a *.out file or prints to the terminal.

## Findings, most serious first

### 1. FAIL (owner rule 3; A14). With diabetes, pulse-flour dishes named with "atta" count as the grain in both the name test and the declared-field test. So do grain-coated fish and paneer.
- Surface: every diabetes plate (src/v5/core.js:369), every base swap (core.js:380), every menu order (src/v6/engine.js:434). These run on the server, so the effect is the same at every width and scheme.
- What is wrong. In Indian English "atta" means flour of any kind: besan is "chana atta", and kuttu and singhara flour are sold as "atta". The code treats "atta" as a grain in every test:
  - known() returns true as soon as a pure-grain word appears (core.js:190), before the material test. PUREG (core.js:152) includes atta.
  - A name of two or more words whose only grain word is "atta" counts (core.js:189). "Besan atta chilla" counts this way.
  - GMATW_RX includes atta. So "<pulse> atta" skips the "<x> flour" stand-in test (standIn, core.js:140), and "made from besan atta" reads as a grain material (madeOf, core.js:138).
  - isGrainMaterial (core.js:298-299) accepts any string with one grain word, so long as every other word is on its list. That list includes moong, urad, chana, besan, dal and gram. So "besan atta", "chana atta", "moong atta", "urad atta" and "chana dal atta" all pass as true grains.
- Evidence (probe/e2e.out, built page). Diabetes plates where this item is the only grain, declared with the material in its own words:
  - Accepted as plates and offered as base swaps, 8 of 8:
    - Besan atta chilla ("besan atta")
    - Moong atta chilla ("moong atta")
    - Roti made from chana atta ("chana atta")
    - Chana atta thepla ("chana atta")
    - Chana atta bhakri ("chana atta")
    - Urad atta roti ("urad atta")
    - Chana dal atta roti ("chana dal atta")
    - Roti made from besan atta ("besan atta")
  - The same items declared as "besan" or "gram flour" are dropped. So the result depends on which word for the flour the model uses.
- By name alone (probe/fp13.out), 24 of 26 "atta" forms of a pulse, nut or fruit flour count as a grain. Among them:
  - Peanut atta roti, Peanut atta paratha, Urad atta roti, Rajma atta roti, Kathal atta roti;
  - Roti made from almond atta, Bread made from almond atta, Pizza made from almond atta;
  - Chapati made from peanut atta, Roti made with coconut atta, Paratha made from soya atta, Roti made from moong atta.
  - Only "Chana atta roti" and "Soya atta roti" are refused, because STANDF lists those exact pairs.
- A grain used as a coating, which A14 says does not count ("rava-crusted"):
  - These count as grains: Rava fish, Rava fried fish, Rava fried prawns, Rava tawa fish, Semolina fried fish, Rava fried paneer.
  - A non-veg diabetes plate whose grain is "Rava fried fish" with "rava" declared is accepted. "Rava fried paneer" is accepted on a veg plate and offered as a swap.
  - The rule check already lists "Rava fish fry" as a stand-in (test/rules/check.js:70). Only the word "fry" stops it.
- Also counted: Kathal rice and Kathal roti. Green jackfruit rice and flour are sold in India as diabetes swaps for rice and atta.
- Round 12's build also counted every one of these names (probe/fp13-cmp.out), so this is not a regression. The class is the one round 12 finding 1 named: a dish built on a stand-in. The new declared field was meant to close it, but "atta" opens both locks at once. The rule check holds none of these names except the two exact pairs above.
- Why it matters: besan and chana-atta rotis and chillas are the most common grain swap Indian clients with diabetes are advised to make. A plate built on one can be shown as the plate where "the grain stays", or offered as a base swap, with nothing in the code to stop it.
- Smallest correction:
  1. Treat "atta" as a word for flour, not as a grain. "<x> atta" counts only when x is a grain, as "<x> flour" already does (FLOUR_RX, madeOf). "Atta" with no qualifier, or after whole wheat, multigrain, chakki or a grain, stays a grain. Take atta out of PUREG and out of the core.js:189 path when a non-grain qualifier comes before it.
  2. In isGrainMaterial, a pulse, nut or seed word directly before atta or flour makes the material not a grain. "Rice and urad dal" stays a grain; "urad atta" does not.
  3. A pure-grain word beside a fish, meat, prawn, paneer or egg word, with no grain-dish word in the name, is a coating ("rava fried fish"), not a grain.
  4. Add these names to STANDINS in test/rules/check.js, and add the declared materials "besan atta", "chana atta", "moong atta" and "urad atta" to the declared-field checks.

### 2. MINOR (owner rule 3; A14; regression in this diff). On the menu, a grain written into the portion counts even when the place does not sell it.
- Surface: Rescue, Read the menu, the order card (src/v6/engine.js:386 porGrain, :434), at every width and scheme.
- What is wrong: porGrain() counts a grain added in the portion text ("1 bowl dal with 1 roti"). A grain named in "with" is checked against the typed menu ("side-off-menu", engine.js:432). The portion's grain is not.
- Evidence (probe/porgrain.js). The typed menu has no bread or rice at all (Paneer Tikka, Dal Tadka, Palak Paneer, Chicken Tikka, Green Salad, Cucumber Raita). With diabetes and a declared grain, these are offered:
  - "Dal Tadka | 1 bowl dal with 1 roti"
  - "Paneer Tikka | 6 pieces with 2 rotis"
  - "Palak Paneer | 1 bowl with steamed rice"
  - "Chicken Tikka | 6 pieces with 1 naan"
  - Round 12's build refused all four.
  - No recorded live order relies on this path (probe/replaycmp.js).
- Why it matters: the prompt tells the model that "every order keeps one measured grain". On a menu with no grain, writing one into the portion is the easiest way for the model to comply. The client then holds an order card for food the place cannot serve. They eat the dal without the grain, and its figures count a roti never eaten.
- Smallest correction: count porGrain only when the grain it names is on the typed menu (the same sideOnMenu test as for "with"). For a photo menu, ask the model to put the grain in "with".

### 3. MINOR (owner rule 3; pre-existing, not in this diff). A protein swap can replace the grain item.
- Surface: Plate, Swap sheet (src/v6/app.js:104 swapIn; core.js:380 checks only base swaps).
- What is wrong: swapIn replaces the first item of the "protein" group. With diabetes, protein swaps are not checked for the grain. When the declared grain item is grouped as protein, a protein swap takes it off the plate.
- Evidence:
  - probe/protswap.js: a diabetes plate whose grain is "Yellow moong dal and brown rice khichdi" [protein] keeps "Paneer bhurji" and "Tofu tikka" as protein swaps.
  - probe/groups.out: in the recorded live replies, 4 of 391 grain plates group the grain item as protein, all of them khichdi. The one with recorded protein swaps offered only dal variants "in khichdi", so no recorded reply shows the grain removed.
- Why it matters: one tap shows a client with diabetes a plate with no grain. The declared field now makes this cheap to stop.
- Smallest correction: with diabetes, drop a protein swap that is not itself a grain when the item it would replace is the declared grain. Or make swapIn skip the declared grain item.

### 4. MINOR (A14 true-grain side; B6). The declared-material list refuses common names for true grains, so with diabetes those plates, swaps and orders are dropped.
- Surface: plates, base swaps and menu orders with diabetes (isGrainMaterial, core.js:296-299).
- Evidence (probe/mat.out). These true-grain materials are refused, 15 of 76:
  - "cracked wheat" (dalia) and "beaten rice" (poha), both everyday Indian English;
  - "samai", "varagu", "kambu" and "thinai", which the name test accepts in PUREG (core.js:152) but GRAINMAT omits;
  - "idli rice", "rice, urad dal and fenugreek", "whole wheat bread", "whole wheat pasta", "wheat noodles", "rice noodles", "sourdough wheat", "wheat (roti)", "rice (dosa batter)".
- No live run has used the new fields yet, so how often Gemini writes these is not measured. The failure is closed, not open: the cost is fewer plates or none for a client with diabetes.
- Smallest correction: build GRAINMAT from the same list as PUREG plus the rice words. Add cracked and beaten. Allow a trailing shape or dish word (bread, pasta, noodles, roti, dosa, batter) after a grain word.

### Costs, listed, not counted as findings (the safe direction, not seen in recorded replies)
- Grain-keeping wordings refused under the worst-case declaration (probe/menu13.out, onetap13.out):
  - Menu, 8 of 21 keeps: the passive forms "Ask for the butter to be kept off the pav", "the ghee to be left off the roti", "the oil to be kept out of the rice", "the butter to be taken off the roti" and "the ghee to be kept out of the biryani"; and grain for grain: "Tandoori roti, not butter naan", "Tandoori roti; no naan", "Ask for phulka, not paratha".
  - One-tap, 5 of 11 keeps: "Have millet khichdi, not white rice", "Set the khichdi aside to rest while the paneer cooks", and three like them.
  - None of these forms is among the 157 distinct recorded live asks.
- Ordinary grain dishes that round 12's build counted and this build refuses (probe/tg13.out): Carrot upma, Green peas upma, Sprouts sandwich, Cheese garlic bread, Mushroom paratha, Potato rice, Palak idli. Egg bread, Cheese bread and Paneer rice are refused too, as D7 now records. None of the 1,298 recorded live foods changed.

### Residual risk, for the live check in handoff step 3 (not counted as a finding)
- When Gemini fills the fields badly in the other direction, the word reader is the only check left. That means a one-tap note that takes the grain off while grain_grams_after says 200 g are left, or an order that leaves the grain out while it declares wheat.
- With the dishonest figure, these get through: 15 of my 18 new one-tap removals ("Don't bother with the khichdi tonight", "Cancel the khichdi; add a big salad", "Khichdi out, extra paneer in") and 15 of my 20 new menu removals ("The stuffing, about 200 g" for a Masala Dosa, "The curries" for a thali, "Roti for the table to share", "Cancel the roti and add a salad").
- With an honest grain-left figure of 0 g, all 18 one-tap removals are held.
- The live runs after "Deploy." should count how often the declared figures disagree with the words.

## What holds (checked, not taken on the builder's word)
- The measured gates listed at the top, on the built pages. The fingerprint matches.
- Kidney condition and pregnancy are still referred; the diff does not touch them, and the rule check and menu checks cover them. No unit, supplement or rise-band change is in the diff. My sweep of the added lines finds none of the banned words.
- Screens. I pixel-compared every screen of this review with my round 12 review of the same app:
  - 1,346 of 1,441 are identical.
  - 32 differ only in wait and loading frames, or in when a toast was caught. I viewed 8 of these side by side with round 12's.
  - 63 are the new plate-old-saved state, identical to plate-hero. I viewed it at 320 light, 320 dark, 360 light at 130 % and 390 dark.
  - So round 12's visual judgement carries over: nothing runs off the edge at 320 px or at 130 %, the plate and its grams lead, dark mode keeps the paper look, and the Raw Linen look is the same across tabs.
- The only screen-side code change is the drop of plates saved before the grain field (src/v6/app.js:26-27) and the grain sent with tune (app.js:95). A saved plate that is dropped is planned again on opening, with no message, which is the right outcome for this audience.

## Not inspected
- The owner's own phone and his clients' phones; how clients understand the screens.
- Live Gemini output with the new fields. No live run was made, so how often Gemini leaves the fields empty, uses the words in findings 1 and 4, or disagrees with its own words is not measured.
- The v5 screens that the server serves by default (hosted/v5/index.min.html) were not rendered. Only their core was checked, by the rule check.
- The audio by ear. Voice, music and chimes are taken from round 10's listening record and this round's loudness figures; the films are unchanged.
- The WhatsApp post copy was not re-read; the manifest and git show it unchanged.
- Every screenshot at full resolution: I relied on pixel identity with round 12 and viewed the changed and new frames.
