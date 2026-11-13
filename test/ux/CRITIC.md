VERDICT: FAIL
BUILD: 73ea90c30fb5315f5be20a2a85380656f2a36aed204273d90cd97d424e368bea

# Critic round 11 (branch claude/nice-hawking-307ljy, HEAD 6b4fb5a, diff read fa94727..HEAD)

Measured by me on this state: `npm run drill` passes (every planted fault caught). `npm run review` passes: 9 runs x 45 states = 405 checks, 0 violations. The same review on hosted/v6/index.min.html, written to my scratchpad, also gives 405 checks and 0 violations. `npm run rules` passes on all three pages and prints "220 names that are not a grain, 216 true grains". `npm run words` passes (42 exceptions). `npm run films` passes on all four films. The fingerprint above was taken after measuring and matches the builder's. I re-checked two of the builder's claims and both hold: the rule check fails the round 9 build (fa94727) on 7 checks and the round 8 build (f99e183) on 12.

The checks pass, but the owner's rule 3 does not hold. This round rebuilt the grain test to "fail closed", and it now counts far more grain-free stand-ins as grains than the round 9 test did. The removal reader misses plain removals that the live model writes in its own style. On a diabetes menu, it now refuses ordinary South Indian grain dishes.

Probe scripts and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r11/critic/probe/ (lib.js loads np-core from the built page; fp.js, onetap.js, menu.js, live.js, cmp.js; outputs *.out).

## Findings, most serious first

### 1. FAIL (owner rule 3; A14). With diabetes, the grain test counts grain-free stand-ins as grains. This round lets in 73 names that the round 9 build refused.
- Surface: every diabetes plate (src/v5/core.js:243), every base swap (core.js:254) and every menu order (src/v6/engine.js:421). These are server-side checks, so the effect is the same at every width and scheme.
- What is wrong: `known()` (core.js:133) accepts a name when every word is in GRAINT or COMPT. This round added grain shapes to GRAINT (core.js:100): wrap, roll, bun, toast, flatbread, crackers, tortilla, gnocchi, lasagne, porridge, pizza, sandwich, uttapam. COMPT (core.js:103) holds the stand-in bases themselves: cauliflower, gobi, zucchini, broccoli, cabbage, sweet, potato, chickpea, besan, gram, flour, moong, chilla, flax, flaxseed, coconut, soya, tofu, paneer, cheese, beans, peas, plus black, green, yellow, whole and split. Any stand-in base next to a grain shape therefore passes, unless STANDF (core.js:115) happens to list that pairing, and most pairings are not listed. So the test still depends on a list of known stand-ins (the method round 10 set out to replace), and that list does not cover the new shapes.
- Evidence, from the built page (fp.out, fp-cmp.out). 99 of my 115 grain-free or grain-left-out names count as a grain; the round 9 build counted 34. Each name below counts as a grain, and a plate whose only base it is gets accepted, and it is offered as a diabetes base swap:
  - Cauliflower and other vegetable shapes: Cauliflower gnocchi, Cauliflower flatbread, Cauliflower buns, Cauliflower crackers, Zucchini lasagne, Sweet potato toast.
  - Chickpea and gram flour: Chickpea flour tortilla, Chickpea bread, Chickpea flatbread, Chickpea pizza, Chickpea roti, Gram flour tortilla.
  - Besan and moong: Besan crackers, Besan flatbread, Besan chapati, Moong dal chilla wrap, Besan chilla roll, Moong dal uttapam.
  - Flax and coconut: Flax crackers, Flaxseed porridge, Coconut flour tortilla, Coconut flour wrap, Coconut flour flatbread.
  - Made from a vegetable or legume: Rice made from cabbage, Noodles made from radish, Pasta made from black beans, Pasta made from green peas.
  - A grain named as left out: "Dal, rice not included" and "Dal tadka, roti not needed". NEGPRE (core.js:113) removes "not included" but marks nothing as lost, so the rice that is named as left out still counts.
- The rule check misses all of this because its fixed list of 220 non-grains pairs no stand-in with any of the shapes added this round (grep of test/rules/check.js).
- Recorded live replies: none of these names appear in eval/. The prompt asks for a grain with diabetes, so live replies have not yet produced one. A14 still names "any dish built on" a stand-in, and the owner's rule does not wait for a live case.
- Why it matters: a client with diabetes can be shown a chickpea or coconut flour tortilla, cauliflower gnocchi or zucchini lasagne as "the grain stays" plate or swap. That is the plate the owner's rule forbids.
- Smallest correction: a grain shape (roti, bread, wrap, roll, bun, toast, flatbread, crackers, tortilla, pizza, pasta, noodles, gnocchi, lasagne, porridge, dosa, idli, uttapam and the rest) next to a non-grain base word should count only when the name also names a grain (rice, wheat, atta, jowar, bajra, ragi, millet, oats, rava, maida and so on), or when it is on a short fixed list of wheat-dough dishes with a filling (aloo, gobi, paneer, methi, mooli paratha; paneer and egg roti per D7; masala dosa). Read "not included", "not needed" and "optional" as a grain left out. Add every name above to the fixed non-grain list.

### 2. FAIL (owner rule 3; A14). One-tap changes and menu portions or asks that take the grain off in plain words stay on offer.
- What is wrong: `removesGrain()` (core.js:159) reads only the first one to three words after a removal word. `objectAfter()` (core.js:157) stops at "the" and at "to", so in "do not eat the rice" the object it reads is "eat". "Hold" is treated like "keep" (core.js:172), so "hold the roti" is not read as a removal, although NEGPRE treats "hold" as a removal in the same file. "Just", "alone", "leave off", "hold off", "no need", "not needed", "zero", "give it a miss" and "take it off" are not read at all.
- Evidence, menu (menu.out). 19 of 20 diabetes orders that leave the grain out are offered. Examples:
  - Butter Chicken, with 1 Tandoori Roti, ask "Ask them to hold the roti".
  - Butter Chicken, with 1 Butter Naan, ask "Ask them not to bring the naan".
  - Butter Chicken, with 1 Butter Naan, asks "Do not eat the naan; have the salad" and "Avoid eating the naan".
  - Chicken Biryani, portion "Eat just the chicken pieces, about 150 g".
  - Rajma Chawal, portion "Just the rajma, about 250 g".
  - Rajma Chawal, portion "Rajma alone, about 250 g".
  - Chole Bhature, portion "The chole, about 250 g; leave off the bhature".
  - Veg Thali, ask "Ask them to hold the rice and the rotis".
  - Paneer Tikka, with 1 Tandoori Roti, ask "Give the roti a miss".
- The live model writes its menu asks in this form: 7 recorded live asks begin "Please do not ..." (for example "Please do not serve papad and pickle", "Please do not brush extra butter on top"). With the same wording, "Please do not serve the roti" and "Please do not serve the rice" are offered with diabetes, while "Please do not add rice" is caught. The menu has no carb backstop, so nothing else stops these orders.
- Evidence, one-tap (onetap.out). 25 of 27 removals stay on offer when the model gives the carb change as 20 g or less on the 44 g fixture plate. Examples: "Do not eat the khichdi tonight", "Don't have the khichdi", "Avoid eating the khichdi", "Hold the khichdi", "Leave off the khichdi", "No need for the khichdi", "Have just the paneer and palak". The half-carb backstop catches them only when the model's own carb figure is honest (-25 g or more). No recorded live one-tap note uses these phrasings yet.
- Why it matters: the order card and the one-tap button are what the client acts on. "Ask them to hold the roti" on a diabetes order takes the grain off the plate, against the owner's rule.
- Smallest correction:
  - After not, don't, avoid, skip or try not to, pass over a verb (eat, have, serve, bring, order, take, add) and read the object after it.
  - Read "hold" as a removal unless it is followed by warm or aside.
  - Add just, alone, leave off, hold off, no need for, not needed, zero, give ... a miss, and take or keep ... off.
  - Add these sentences to the fixed one-tap and menu lists in test/rules/check.js, both ways.

### 3. MAJOR (A14 true-grain side; B6). Ordinary grain dishes are now refused with diabetes, and a South Indian menu ends at "No dish on that menu passed the checks for you."
- What is wrong: under fail-closed, any unknown word makes the name "not a grain", and the word lists were built from mostly North Indian and cafe replies. In addition, CONDI (core.js:111) strips "<grain> masala" and "<grain> with chutney", so "Poori masala" and "Idli with chutney" lose their grain. "-free" marks a stand-in, so "Gluten-free jowar roti", "Gluten-free oats" and "Brown rice (gluten free)" are not counted. STANDF now reads "Mushroom fried rice" and "Mushroom rice" as stand-ins.
- Evidence:
  - A typed tiffin menu (Idli (2 pcs), Mini Idli, Idli Vada, Set Dosa, Mysore Masala Dosa, Ghee Roast Dosa, Paper Dosa, Ven Pongal, Poori Masala, Chapathi Kurma, Curd Rice), with diabetes, veg, lunch. The model's picks were Mysore Masala Dosa, Set Dosa, Ven Pongal, Mini Idli, Idli Vada, Poori Masala and Chapathi Kurma. The round 9 build offered 3 orders; this build offers none (status "empty").
  - Recorded live menus: "Idli (2 pcs)" (live typed menu, with Buttermilk) is newly dropped because "pcs" is unknown. "Avocado Toast", "Peanut Butter Banana Toast" and "Cheesy Garlic Bread" are also newly dropped. Overall 9 of 45 grain-word lines are refused, against 8 under round 9. Some round 9 misses are fixed (Paneer Tikka Wrap, Farmhouse Pizza).
  - From fd-names.txt, refused now and accepted by round 9:
    - Dosa and idli: Mysore masala dosa, Set dosa, Paper dosa, Ghee roast dosa, Mini idli, Idli vada.
    - Other South Indian: Ven pongal, Poori masala, Semiya upma.
    - Biryani and rice: Mushroom biryani, Kolkata biryani, Malabar biryani, Ponni rice, Seeraga samba rice.
    - Snacks and breads: Vada pav, Misal pav, Bread omelette, Pudina paratha, Mix veg paratha, Makki di roti.
    - Pasta, noodles and others: White sauce pasta, Red sauce pasta, Chilli garlic noodles, Overnight oats, Oats cooked in milk.
  - Still refused, as under round 9: Malabar parotta, Porotta, Chappathi, Uttappam, Biriani, Veg chowmein, Veg momos.
  - On the 477 recorded live meals the change is small and mostly good: true grains now counted (bulgur, sourdough, suji, pita). Two plates with only a flour dusting are now refused, as the builder says. One live base swap, "Jowar roti alongside dal mash", is newly refused.
- Why it matters: clients are mostly Indian and many have diabetes. At an ordinary tiffin centre the menu feature now tells them nothing on the menu passed, when dosa, idli and pongal in a measured portion keep the grain the owner's rule requires.
- Smallest correction:
  - Add the words menus use: mysore, set, paper, roast, benne, mini, button, thatte, vada, pcs, pc, ven, khara, semiya, kurma, malabar, ceylon, chilli, pudina, pyaz, mix, di, da, white, red and pink sauce, overnight, milk, peanut, avocado, ponni, samba, browntop.
  - Add the spellings porotta, chappathi, uttappam, biriani, khichuri, chowmein and momos.
  - Do not strip "<grain> masala" or "<grain> with chutney" when nothing else is left.
  - Let "gluten-free" stand before a known grain.
  - Take mushroom out of the stand-in rice pattern.
  - Add a South Indian, a Kerala and a Bengali menu to the true-grain fixed list and measure them.

### 4. MINOR (A13). After an ask that returns nothing that fits, the ask box is empty.
- src/v6/app.js:328 clears UI.askDraft on submit. app.js:82 (status "empty", "Nothing that came back fit your food rules. Try again, or change a choice above.") does not put the words back. Only the error codes path does (app.js:83). "Try again" still re-sends the old ask through UI.lastAsk, but the box the person typed in is blank.
- With finding 3, this state becomes more likely for clients with diabetes.
- Correction: `if(text)UI.askDraft=text;` in the empty branch too.

### 5. COSMETIC. own() drops "a, the, one, ..." from the typed text before it compares neighbours.
- So a name can keep a banned word next to a word the person typed only across a dropped word. Typed "a <word> one, biryani" keeps a model name "A <word> biryani".
- The person typed both words, so the shown name uses their words, but not in their order. core.js own(). My other own() probes behave as claimed: the model's own use of a word goes, and the person's own phrase stays.

## What holds (checked, not taken on the builder's word)
- Measured gates as listed at the top, on both built pages. Fingerprint matches.
- The ask draft is kept in the busy and daily-limit states. Rendered: plate-ask-busy and plate-ask-limit at 320 light and 320 dark show "Something light with paneer" in the box.
- The side line keeps its menu name before a dash. The rule check shows it.
- BANFORMS covers realness and smarts. In my sweep of the lines added fa94727..HEAD, the only hits are the rule lists themselves, and both are listed in test/words/allow.json.
- Screens: I read the contact sheets for
  - 320 light: plate loading, hero, dial; asks, limits, two left out, toast.
  - 360 dark: Builder, Rescue, menu.
  - 360 light at 130 %: setup and Plate; Builder, Rescue, menu.
  - 320 dark: asks, limits, toast, sheets.
  - 412 light: Builder, Rescue, menu.
  - 390 light: asks, limits, two left out, toast, sheets.
  The paper look holds in dark mode. Nothing runs off the edge at 320 or at 130 %. Plate and grams lead. Errors offer Try again where it can help. Raw Linen is consistent across tabs. No change from round 10 apart from the ask box keeping its words.
- Films: the four files are byte-identical to f99e183 (git log, sha256). I sampled the 51 s WhatsApp cut at 14 points (every beat and the end card) and the 30 s WhatsApp cut at 8 points. Cards and screens are legible at phone size. The end cards read "NEXT PLATE / Made for you." and "Reply "plate" for your link." Narration in docs/film/SCRIPT-features.md matches the beats, with no banned words. The ask shown is a snack plate, and its one-tap change adds sprouted green gram and cucumber. volumedetect mean is -16.8 dB (51 s WhatsApp) and -16.7 dB (30 s WhatsApp); film check: all four near -16.7 dB. The film's menu order (Paneer Tikka with 1 Tandoori Roti) is still offered by this build.

## Not inspected
- The owner's own phone and his clients' phones. Comprehension by clients.
- Live Gemini output under this build. No live run was made, so whether the model writes any of the names or sentences in findings 1 to 3 is not measured beyond the recorded replies in eval/.
- The audio by ear: voice, music and chimes are taken from round 10's listening record and the loudness figures, not re-heard.
- The full-resolution 2x screenshots of every segment. I read contact sheets at 0.3 to 0.42 scale.
- I did not open the 390 light setup/Plate or Builder/Rescue/menu sheets, or any 390 dark sheet. The 320 light setup, swap, one-tap, logged, blocked, sheet, Builder and Rescue groups, 360 dark setup/Plate and asks/sheets, 360 light 130 % asks/sheets, 320 dark setup/Plate and Rescue/menu, and 412 light setup/Plate and asks/sheets were built but not opened. Of the 412 px screens I opened only light, and only Builder, Rescue and menu. The review measured all of them (0 violations), and the only UI code change this round is the ask box value.
- The WhatsApp post copy was not re-read this round. It is unchanged since round 10 by the manifest.
