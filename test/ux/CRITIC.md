VERDICT: FAIL
BUILD: 64067c3f47dc4e1bd84ecd63b14fe2b2210fba48b2076bb87f9950fcc436059b

# Critic round 12 (branch claude/nice-hawking-307ljy, HEAD ace25c9, diff read 6b4fb5a..HEAD)

## What I measured on this state
- `npm run drill` passes: every planted fault is caught.
- `npm run review` passes: 9 runs x 45 states = 405 checks, 0 violations.
- The same review on hosted/v6/index.min.html, written to my scratchpad, also gives 405 checks and 0 violations.
- `npm run rules` passes on all three pages and prints "335 names that are not a grain, 328 true grains".
- `npm run words` passes (42 exceptions; neither allow file changed this round).
- `npm run films` passes on all four films: -16.7 to -16.8 dB, picture from 0 s, no decode errors.
- I rebuilt the three pages into my scratchpad from the sources. They are byte-identical to the committed pages.
- The fingerprint above was taken after measuring and matches the builder's.

## The builder's claims, checked
- The rule check fails the round 10 build (6b4fb5a) on 5 checks, round 9 (fa94727) on 7 and round 8 (f99e183) on 12. This holds.
- On my round 11 names: 0 of 115 grain-free names count as a grain, and 135 of 136 true grains count ("Ghee roast" alone is refused). This holds.
- All 27 of my round 11 one-tap removals are now held back, and all 20 of my round 11 menu removals are refused. This holds.
- The ask box keeps its words after "Nothing that came back fit your food rules" (src/v6/app.js:82). I read this in the code; no review state renders it.
- own() keeps a typed word only beside the same neighbour. My probes behave as described.
- The films are byte-identical to f99e183 (git hashes).

The checks pass, but the owner's rule 3 still does not hold. The test now handles shapes (wrap, toast, flatbread and the rest), but the same gap remains on the grain-dish words. This round's new menu words let in another set of grain-free names. On the menu, a portion that names only the non-grain part of a dish still passes when it uses no word of absence. The removal reader now refuses ordinary grain-keeping orders, two of them from recorded live replies.

Probe scripts and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r12/critic/probe/. lib.js loads np-core from the built page. The probes are fp12.js with fp12-names.txt, onetap12.js, menu12.js, live2.js, livemenu.js, replay.js and misc.js; each writes a *.out file.

## Findings, most serious first

### 1. FAIL (owner rule 3; A14). With diabetes, the grain test still counts grain-free stand-ins as grains: 75 of 92 new names, 24 of them let in by this round's changes.
- Surface: every diabetes plate (src/v5/core.js:277), every base swap (core.js:288) and every menu order (src/v6/engine.js:421). These checks run on the server, so the effect is the same at every width and scheme.
- What is wrong:
  - `known()` (core.js:141-148) applies the material test (MAT_RX, core.js:140) only to shapes (SHAPE_RX, core.js:137). Every other grain word passes beside any COMPT word unless STANDF lists that exact pair. These are roti, chapati, paratha, rice, biryani, pulao, khichdi, risotto, upma, idli, dosa, pasta and noodles.
  - COMPT (core.js:103-108) still holds stand-in bases: cauliflower, broccoli, cabbage, zucchini, coconut, flax, flaxseed, besan, gram, flour and chickpea. This round adds peanut, nuts, mushroom(s), omelette, milk, gluten and free for menu names. MAT_RX has no peanut, nut(s), mushroom, cheese, egg or omelette.
  - The made-from pattern (core.js:127) lists non-grain materials, so any material it does not list passes.
  - "Gluten-free" now counts with no grain named. Round 11 asked for it only before a named grain.
- Evidence, from the built page (probe/fp12.out, fp12-cmp.out). Each name below counts as a grain. A veg diabetes plate whose only base it is gets accepted, and it is offered as a base swap:
  - Let in by this round (the round 10 build refused them):
    - Peanut flour: Peanut flour roti, Peanut flour chapati, Peanut flour paratha, Peanut flour bread, Peanut flour pizza, Roti made from peanut flour, Bread made from peanut flour.
    - Nuts: Nuts porridge, Mixed nuts porridge, Peanut porridge.
    - Mushrooms: Rice made from mushrooms, Noodles made from mushrooms.
    - Cheese crust pizza. Chicken crust pizza and Egg crust pizza also count as grains; a veg plate drops them for its diet rule.
  - Counted under both builds:
    - Legume and nut flours: Gram flour noodles, Gram flour pasta, Noodles made from gram flour, Coconut flour noodles, Coconut flour pasta, Flaxseed pasta, Flaxseed noodles.
    - Cauliflower risotto, Broccoli risotto, Burger bowl, Pizza bowl, Thin cheese wrap.
  - Names that can be read either way, which D7 says are read the safe way: Cauliflower biryani, Cauliflower khichdi, Cauliflower pulao, Broccoli khichdi, Zucchini rice, Sweet potato rice, Cheese gnocchi, Besan upma, Moong dal upma.
  - From this round's gluten change: Gluten-free pasta, Gluten-free bread, Gluten-free pizza, Gluten-free noodles.
  - A grain named as left out in words NEGPOST does not list: "Paneer tikka, naan not served" and "Dal makhani, naan not part of the meal".
- The rule check's fixed lists hold none of these names (grep of test/rules/check.js).
- No recorded live reply in eval/ uses these names. The prompt asks for a grain with diabetes, so this test is the backstop. As in round 11, A14 names "any dish built on" a stand-in.
- Why it matters: a client with diabetes can be shown a peanut-flour roti, a nut porridge or gram-flour noodles as the plate where "the grain stays", or be offered one as a swap. Each round, words added to read menus have let in another set of stand-ins.
- Smallest correction. Make the material test hold for every grain word, so the list stops growing:
  1. A "<word> flour/atta/meal" or "made from/with/of <word>" counts as a grain only when the word is a grain (GMAT_RX). Any other word marks a stand-in. The made-from list becomes a list of grains only.
  2. Use the same material test as for shapes on every grain-dish word. A vegetable, legume, nut, seed, cheese or egg word in the same part, with no grain named, counts only when the pair is on a short fixed list of known grain dishes, for example:
     - gobi, aloo, methi, palak, mooli, paneer and egg paratha;
     - paneer, egg and cheese roti (D7); methi and lauki thepla;
     - veg, matar and mushroom pulao; gobi rice and mushroom rice (D7); tomato, lemon, coconut and carrot rice;
     - onion uttapam; masala dosa.
  3. For shapes:
     - add peanut, nut(s), mushroom(s), cheese, egg, omelette and chicken to MAT_RX, and make gnocchi strict;
     - "bowl" after burger, pizza, sandwich or wrap marks a stand-in;
     - "gluten-free" counts only before a named grain.
  4. A grain word followed by "not" in the same part is left out.
  5. Add every name above to STANDINS in test/rules/check.js.

### 2. FAIL (owner rule 3; A14). Menu orders that leave the grain out stay on offer, and the menu has no carb backstop.
- Surface: Rescue, Read the menu, the order card (src/v6/engine.js:421), at every width and scheme.
- What is wrong:
  - `removesGrain()` (core.js:174-213) holds an order back only on a listed restriction or absence word.
  - A portion that names only the non-grain part of a dish with its grain in the name passes when it uses none of those words (rajma from Rajma Chawal, chole from Chole Bhature, bhaji from Pav Bhaji).
  - Absence written any other way passes too.
- Evidence (probe/menu12.out): veg profile with diabetes, lunch, every dish on the typed menu. 19 of 28 orders that leave the grain out are offered, among them:
  - Rajma Chawal: portion "The rajma portion, about 250 g"; portion "Rajma part, about 250 g".
  - Chole Bhature: portion "1 bowl chole, about 250 g"; ask "Ask them to serve the bhature to someone else".
  - Pav Bhaji: portion "Bhaji, about 250 g", ask "Ask for cucumber slices to scoop with".
  - Veg Biryani: portion "The vegetables from the biryani, about 150 g".
  - Veg Thali (2 roti, rice, dal, sabzi): portion "Dal, sabzi and salad, about 350 g"; ask "Ask them to keep the rice and rotis in the kitchen".
  - Masala Dosa: portion "The filling and sambar, about 250 g".
  - Idli Sambar: portion "1 bowl sambar with vegetables, about 300 g".
  - Dal Tadka with 1 Tandoori Roti: asks "Let the roti go; have the dal with salad", "The roti can wait; start with the dal and salad" and "Ask them to pack the roti to go".
  - Paneer Tikka with 1 Tandoori Roti: asks "Give the roti to someone at the table" and "Ask them to skip carbs and add a salad".
- One-tap (probe/onetap12.out): 10 of 39 removals stay on offer when the model gives the carb change as -10 g on the fixture plate. Examples:
  - "Let the khichdi go tonight", "Put the khichdi back in the pot", "Keep the khichdi for breakfast".
  - "The khichdi can wait", "the khichdi is for another day", "Use cucumber ribbons where the khichdi was".
  - "skip carbs tonight", "none at all tonight".
  - The half-carb backstop catches these only when the model's own carb figure is honest.
- Why it matters: the order card is what the client acts on at the table. "Rajma part" or "1 bowl chole" with diabetes takes the grain off the plate, and nothing after this check stops it.
- Smallest correction:
  - Check the menu the other way round. When the grain is in the dish name, a portion that names a food must name the grain too; a portion that names no food ("1 plate", "1 thali") is the whole dish. An ask that names the grain counts only in a keep form: a grain on the other side of instead of, over or for.
  - The step that fails closed for both menu orders and one-tap changes: ask the model for the grain item and its grams in each order and change. Check that field with isGrain and a floor in grams, and drop the order or change when the field is missing.

### 3. MAJOR (A14 true-grain side; B6). Grain-keeping orders and one-tap notes are now refused, among them two recorded live menu orders and four recorded live notes.
- Recorded live menu replies:
  - "Masala Dosa | 1 dosa with potato filling, about 240 g | Cook with light oil, serve extra sambar" (eval/v6/results-menu-live-look.json:345) is refused. The tiffin profile has diabetes. The restriction "(potato|aloo|masala|bhaji) filling" (core.js:190) fires on any mention of the filling. Replayed through this build, that recorded reply loses its Masala Dosa order.
  - "Veg Thali (2 roti, rice, dal, sabzi, curd, papad, pickle) | 1 thali platter, about 550 g | Please leave out the papad and pickle completely" is refused. This round made "thali" a grain word (core.js:100), so the word "out" in "leave out the papad" now counts as absence (core.js:211). The round 10 build kept it. Replaying the 9 recorded canteen replies with diabetes, the Veg Thali drops out of 2.
- My keep set (probe/menu12.out): 16 of 42 orders that keep their grain are refused under the grain rule. Among them:
  - Grain for grain: "Ask for tandoori roti instead of naan", "Choose tandoori roti over naan", "Order tandoori roti rather than butter naan".
  - Removing something that is not the grain: "Ask them to leave the butter off the roti", "Ask them to take the butter off the roti", "Request the roti without butter", "Ask for the sweet to be left out" (thali).
  - Amounts of the grain: "Two rotis are enough", "Have 2 rotis only", "1 bowl dal with 1 roti only", "2 idli only, with extra sambar".
  - "1 masala dosa with its aloo filling and sambar".
- Recorded live one-tap notes newly held (probe/live2.out). None of them removes a grain:
  - "Replace one-third of the rice with roasted okra": the part-of-the-grain rule reads "a third", not "one-third".
  - "Use pre-cooked millet grain ... instead of rolling a roti": one grain for another.
  - "Request the phulkas pre-cut into strips": "request" holds the note on its own.
  - "Select the quick-box format where curry is packed directly over rice": "select ... over" is read as a choice against rice.
  - These account for the builder's rise from 33 to 35 held notes.
- On the recorded menu replies as a whole the cost is small: no recorded menu ends empty, and diabetes drops fall from 17 to 12 against round 10 (probe/replay-diab.out). The cost lands on the most ordinary orders: a masala dosa, a thali, and a roti in place of a naan.
- The recorded cafe reply's Paneer Tikka Wrap is refused again under the strict "wrap" rule, though its own ask says "Use whole wheat wrap if available". This follows D7 and round 11; I list it as a cost, not a defect.
- Why it matters: at a tiffin centre or canteen, the dish a client with diabetes is most likely to order is dropped. So is the textbook ask for a roti in place of a naan.
- Smallest correction:
  - "with (its) potato/aloo filling" is the whole dish.
  - "<amount> <grain> only" and "<amount> <grain> is/are enough" are amounts of the grain.
  - instead of, over or rather than with a grain on both sides keeps the grain, whatever verb comes before (ask for, order, choose, select, request).
  - off, out, aside, away and request count only when what they apply to is a grain.
  - "thali" is a grain in a dish name, but not a grain word in a portion or ask.
  - "one-third" and "one quarter" of the grain are part of it.
  - Add the two recorded orders and four recorded notes to the rule check's keep lists.

No cosmetic findings this round beyond the costs listed above.

## What holds (checked, not taken on the builder's word)
- The measured gates listed at the top, on all built pages. The fingerprint matches.
- Kidney condition and pregnancy are still referred; the rule check covers this and the diff does not touch it. No unit, supplement or rise-band change is in the diff.
- I read the screens as contact sheets of every segment of all 45 states, for 320 light, 320 dark, 360 dark, 360 light, 360 light at 130 %, 390 light, 390 dark, 412 light and 412 dark, plus two 320 light screens at full size (menu order, nothing fits).
  - The B and C groups (asks, limits, sheets, Builder, Rescue, menu) are byte-identical between light and dark at 320, 360, 390 and 412. Of the single screens, 186 of 187 at 320 are identical; the few that differ are loading and waiting frames caught at another moment. The paper look holds in dark mode.
  - Nothing runs off the edge at 320 px or at 130 %, and the plate and its grams lead.
  - Errors offer Try again where trying again can help. The limit lines name the time. The Raw Linen look is the same across tabs.
  - The only UI code change this round is the ask box value after "nothing fit", and the screens match round 11.
- Films: the four files are byte-identical to f99e183.
  - I sampled the 51 s WhatsApp cut at 13 points (every beat and the end card) and the 30 s WhatsApp cut at 9 points. Cards and screens are legible at phone size.
  - The end cards read "NEXT PLATE / Made for you." and "Reply "plate" for your link."
  - The 51 s film's menu order (Paneer Tikka with 1 Tandoori Roti, ask "No butter brushed on top, extra lemon wedges and onion rings") is still offered by this build, and its one-tap note is kept.
  - volumedetect mean: -16.8 dB (51 s WhatsApp) and -16.7 dB (30 s WhatsApp).
- Words: in my own sweep of the lines added 6b4fb5a..HEAD, the only hits are in the built pages. They are CSS motion properties, the banned-word list itself and the prompt's own list. All are covered by the word check's rules and exceptions.

## Not inspected
- The owner's own phone and his clients' phones; how clients understand the screens.
- Live Gemini output under this build. No live run was made. Whether the model writes any of the names or sentences in findings 1 to 3 is measured only against the recorded replies in eval/.
- The audio by ear. Voice, music and chimes are taken from round 10's listening record and the loudness figures.
- Every screenshot at full resolution: I read contact sheets at 0.3 scale and two screens at full size.
- The WhatsApp post copy was not re-read; the manifest shows it unchanged.
- The new ask-box behaviour after "nothing fit" on screen: no review state renders it, so I read only the code.
