VERDICT: FAIL
BUILD: 6981b908f29fe570f96c084ae2be2859d4181f918cbac8f4734d2969e3117530

# Critic round 19 (branch claude/nice-hawking-307ljy, HEAD 90472cf, diff read d2e9942..90472cf)

## What I measured on this state
- `npm run drill`: passes; every planted fault is caught.
- `npm run review`: passes. 9 runs x 46 states = 414 checks, 0 violations, 0 errors, no unreached state.
- `npm run rules`: passes on all three pages (324 ok lines; 833 names that are not a grain, 612 true grains). The build judged in round 18 (0a11be5) fails 8 checks, as the builder says.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors). No film or post file is in the diff.
- `npm run words`: run after this file was written (the round 18 file held one banned word; this one holds none). Neither allow file is in the diff.
- I rebuilt the three pages from the committed sources in my scratchpad: byte-identical. No lookbehind in any page. The working tree is clean.
- The fingerprint above was taken after all measuring and matches the builder's.

Columns in the probe outputs: this build, the build judged in round 18 (0a11be5), the build judged in round 17 (394f6a6). Probes and outputs are in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r19/ (onetap.js, onetap2.js, onetap3.js, names.js, grid.js, e2e.js, menu.js, each with output where saved; p18-*.out are my round 18 probes on this build). Every finding below also reproduces in hosted/v6/index.min.html and hosted/v5/index.min.html.

## Round 18's findings, checked with my own probes
- My round 18 probes on this build (p18-*.out): 0 of 37 removals offered, 0 of 15 keeps held; 0 of 17 coatings and 0 of 15 stand-ins count; 6 of 6 filling portions, 8 of 8 heading orders and the "you keep half" ask are offered; 0 of 6 removal asks offered.
- Finding 1 (gram figure for another food; "then eat"): fixed for the forms I listed ("have 100 g extra paneer"). Not fixed for the figure written after the food, for "you have N g <food>", or for "then eat N g <food>" / "then have it tomorrow"; and the fix widened the gap to two more paths (findings A and B below).
- Finding 2 (with the potato filling): fixed.
- Finding 3 (non-grain crusts): fixed for cornflakes, poha, vermicelli, sevai, semiya, muesli, granola. Murmura, which my correction named, still counts (finding D).
- Finding 4 (stand-ins after the dish): fixed; side effect in finding C and cosmetic E1.
- Finding 5 (ROTI heading): fixed; ROTI, ROTIS, NAAN, PARATHA, KULCHA name their items; BREADS reads roti kinds and leaves Garlic unknown.
- Finding 6 (you keep half): fixed.
- Finding 7: fixed for every listed form (leave it with the kids / on the side, fridge overnight, cut/leave/drop N g, tossed in quinoa).
- Finding 8: fixed (tuvar/mix dal atta; vegetables fried in rice counts again).
- Recorded live replies against the round 12 build: nothing moves. 408 of 495 meals, 225 of 313 base swaps, 65 of 2,005 notes held (the same notes); menus with diabetes: 87 orders, none empty, 9 dropped, the same.

## Findings, most serious first

### A. MINOR, regression in this diff (owner rule 3; A14). A removal note whose gram figure follows another food is now offered on two more paths.
- Surface: Plate, one-tap changes, with diabetes; server-side in all pages, so every width and scheme.
- Cause: src/v5/core.js. The particle path (the "off/out/aside/away" rule, `if(hasGrainWord(obj)&&!partOf(...)&&!keepsAmount(t))`) and the kept-for-later path now test keepsAmount(t) where the 0a11be5 build tested OWNPART. keepsAmount counts any "N g" whose next content word is nothing, "and" or "then" as the grain kept, so "dal 200 g", "paneer (100 g)" and "raise the dal to 200 g" read as rice kept.
- Evidence (r19/onetap3.js, 200 g declared): 10 notes are offered here and held by both older builds, among them:
  - "Leave out the rice and raise the dal to 200 g."
  - "Keep the rotis aside; increase paneer to 110 g."
  - "Take the rice off the plate; add paneer (100 g)."
  - "Keep the rice off the plate; dal 200 g."
  - "Pack the rice for tomorrow; dal 200 g."
  - "Rice for the kids; increase dal to 200 g."
  - "The roti goes to the kids; sabzi up to 200 g."
- Why it matters: the recorded Gemini notes use this form ("Increase low-fat paneer to 110 g.", "Increase hung curd to 120 g." in eval results). When the model pairs it with a grain removal and declares the grain kept, this reader is the only check left.
- Smallest correction: count "N g" as the grain only when the figure is tied to the grain in its clause: a grain word right after it ("150 g of rice"), a grain word before it with no other food between ("rice 150 g", "rice (150 g)"), or a bare "N g." in a clause whose only food word is the grain. A figure after "to/up to" belongs to the food before it.

### B. MINOR, left from the round 18 diff (finding 1 not fully fixed; owner rule 3; A14).
- Evidence (r19/onetap.out, 200 g declared; all offered here and by 0a11be5, held by 394f6a6):
  - figure after the food on the colon and goes paths: "Rice: skip it; add paneer (100 g) and salad.", "Rice? Cut it out; more dal (150 g).", "Rice: skip it; increase paneer to 110 g.", "Biryani is off tonight; raita 150 g." (7 of 10 in that group);
  - "you have/get/eat N g <food>": 6 of 6, e.g. "Rice: skip it tonight; you have 150 g dal instead." OWNPART still holds `you (keep|have|eat|get|take) N g` with no grain check;
  - "then eat N g <food>": 4 of 4, e.g. "Rice: leave it tonight, then eat 150 g dal." The new then-rule accepts any "\d+ g";
  - "then have it tomorrow": "Rice: skip it tonight, then have it tomorrow.", "Roti: leave it, then eat them for breakfast.", "Rice? Leave it tonight, then reheat it tomorrow.";
  - "Rice: drop it; 0 g of rice tonight." (a zero figure reads as rice kept).
- Smallest correction: the rule in A for every path; in OWNPART require a grain word or no food word after "you have N g"; in the then-rule require the grain or "N g" with no other food after it, and not keep when a later time (tomorrow, for breakfast/lunch) follows; treat "0 g" as gone.

### C. MINOR, reopened by this diff (owner rule 3 true-grain side; A14; B6). A grain dish named "<food> <side word> <grain>" is refused again.
- Cause: core.js known(): a side word (masala, tikka, curry ...) is now ignored when a grain word follows it, so the food before it is checked as the dish material ("paneer" with rice). This follows my own round 18 wording, which was too broad; the intent was stand-in materials only.
- Evidence:
  - r19/grid.js: of 4,032 names "<food> <side> <grain>", 1,728 count here, 2,456 in 0a11be5, 1,344 in 394f6a6; 728 counted by 0a11be5 are refused here.
  - Names: "Mushroom masala dosa", "Paneer tikka rice", "Chicken curry roti", "Fish curry roti" (r19/names.out).
  - End to end with diabetes (r19/e2e.js, r19/menu.js): "Mushroom Masala Dosa" made_of rice, "Paneer Tikka Rice" made_of rice and "Chicken Curry Roti" made_of wheat are refused as orders and as plates here; 0a11be5 accepts them.
- Why it matters: mushroom masala dosa is a common tiffin order; dropping it removes a fitting grain choice with diabetes.
- Smallest correction: apply "a grain follows the side word" only when the material is a stand-in (the STB list: cauliflower, broccoli, zucchini ...). Add "Mushroom masala dosa", "Paneer tikka rice", "Chicken curry roti" to the true grains and the "<food> <side> <grain>" grid to combos.js.

### D. MINOR, left from round 18 finding 3 (owner rule 3; A14). "Crispy murmura prawns" still counts as a grain dish, and with made_of rice the plate passes (r19/e2e.js); 394f6a6 refused it. Murmura is missing from the new crust list in known(). The name is rare. Smallest correction: add murmura (and bread crumb) to that list and to combos.js.

### E. MINOR, not new: gaps present in all three builds that I had not listed.
- True grains refused, so with diabetes the plate or order is dropped (r19/names.out, e2e.js): "Gobi manchurian fried rice", "Chicken manchurian fried rice", "Veg manchurian noodles", "Chilli paneer noodles", "Paneer tikka roll", "Chicken tikka roll", "Chicken kebab roll", "Chicken kebab wrap", "Paneer tikka wrap", "Fish curry meals", "Kadhi pakoda chawal", "Puffed rice chaat with peanuts", "Crunchy poha chivda with peanuts", "Crispy poha cutlet". Manchurian fried rice and tikka rolls are everyday orders.
- A keep held: "Rice: leave 50 g for the family; eat the rest."
- Removals offered: "Rice: skip the whole portion; extra dal.", "Rice 0 g; double the dal."
- Smallest correction: manchurian, chilli, meals and pakoda as known companions; roll/wrap after tikka or kebab as a grain wrap; "eat the rest" as a keep; "whole portion" and "0 g" as removals.

### Cosmetic
- E1. "Pasta (broccoli)" and "Roti (lauki)" are now refused (they count in 0a11be5): the stand-in fix, which I asked for, cannot tell pasta with broccoli from broccoli pasta. Safe side; record it as a D-entry or keep lauki, mooli, beetroot, pumpkin and cabbage out of STB when the dish is a roti or paratha.
- E2. "Crispy noodle chicken salad" is refused now; ambiguous, safe side.
- E3. Under INDIAN BREADS, "Lachha 50" reads as a lachha roti, so an order "2 lachha paratha" is refused (all three builds).
- E4. Screens: compared with the round 12 review, 1,340 identical, 63 the plate-old-saved state added in round 13, 38 differ; 10 by more than 2,000 strongly changed pixels (plate-logged-2, plate-skipped-meds-2, toast-3). I viewed 360-light toast-3 and 320-dark plate-logged-2 with a difference image: the only change is the "Saved for lunch" toast caught in one frame and not the other. No screen code changed in this diff.

## What holds (checked, not taken on the builder's word)
- All measured gates above; rebuild byte-identical; fingerprint matches.
- The diff touches only src/v5/core.js, src/v6/engine.js, test/rules/check.js, test/rules/combos.js, docs/ux/UX-CRITERIA.md and the three built pages. No screen code, CSS, film, post or allow file changed. No removed line touches kidney, pregnancy, referral, supplements, units or the rise bands. "katori" sits only in a word list of portion words the reader ignores, as before.
- Menu asks with a gram figure are still dropped by the engine, so A and B do not reach Rescue asks (r19/menu.out: 0 of 9 removal asks offered).

## Not inspected
- The owner's phone and his clients' phones; how clients read the screens.
- Live Gemini output with the declared fields; no live run was made. I have not measured how often Gemini writes a grain removal next to "increase <food> to N g" or "<food> (N g)", or names "Mushroom masala dosa" or "Gobi manchurian fried rice".
- The v5 screens served by default were not rendered; only their core was probed, and A to D reproduce in it.
- Audio by ear (films unchanged; loudness from this round's check, voice, music and chimes from round 10's listening record).
- The WhatsApp post copy was not re-read; it is not in the diff.
- Every screenshot at full resolution; I relied on pixel comparison with round 12 and viewed the two frames listed.
