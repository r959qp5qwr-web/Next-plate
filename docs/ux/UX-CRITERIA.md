# Next Plate UX/UI criteria

What every surface of Next Plate is held to before it reaches a client. Built from three studies of the sources in this environment:
- `SOURCE-builders-doctrine.md`: Builders Doctrine, module ux-design-assurance v1.1, Canon, Playbook, Audit Protocol (IDs BD-xx).
- `SOURCE-visual-and-audit-skills.md`: visual-taste, interaction and audit skills (VectorLab), ux-audit / usability-audit / audit-cuj, launchworthy (VT, IX, AU).
- `SOURCE-consistency-and-a11y-skills.md`: ui-consistency, design-skills (accessibility-audit, design-critique, interaction-design, ux-writing), Anthropic design (accessibility-review, ux-copy), design-review, frontend-design (A11Y, UC, DC, INT, UXW).

The users: middle-aged clients, many on 320-412 px phones, often in dark mode, some with enlarged system text and weaker near vision, opening
the app from WhatsApp. Where a source offers a range, the stricter end is used for them.

## Part A. Measured on every surface and state (test/ux/review.js; thresholds in test/ux/criteria.js)
Viewports: 320×568, 360×740, 390×844, 412×915 in the gate set; 375×667, 393×851 and 430×932 added in the full set. Light and dark scheme.
360 px with text at 130 % (Android text scaling). 45 states: setup steps 1-3; plate loading, ready, dial open, swap open, one-tap on, logged,
skipped (on tablets), error, blocked (kidney), no body data; sheets: my food, how the numbers work, log a meal (ask and estimate);
plate asked; toast; Builder, Builder adjusted, Builder with no plate, Builder blocked; Rescue entry, wait, result, error, blocked; menu typed, wait, unreadable, error, nothing fits, order; log error; pregnancy referral; removal confirmation;
errors by kind (after Critic round 6): Rescue busy, Rescue at the daily limit, menu reply broken, log busy, plate at the daily limit;
a plate with two foods left out (after Critic round 7: longer chips); an ask at the daily limit and an ask that fails while plates are on screen (round 8, 9).

| ID | Criterion | Threshold | Sources |
|---|---|---|---|
| A1 | Nothing scrolls sideways; no element beyond the phone edge unless inside one horizontal scroller | page scrollWidth ≤ clientWidth at every width | BD-08, BD-76, VT-29, VT-32, AU-32, WCAG 1.4.10 Reflow (320 px) |
| A2 | No text cut off by its box or running past it (where a neighbour paints over it); input hints fit their box | scrollWidth/scrollHeight within the box when overflow is hidden; placeholder width ≤ input room | BD-03, BD-08, VT-12 |
| A3 | Text and controls never overlap; the last content scrolls clear of the fixed ask bar and tabs; what a tap produces comes into view | overlap ≤ 2 px | BD-08, BD-15, BD-76, IX-58 |
| A4 | Type: no text under 14 px, chart text included; body about 16 px or more; inputs 16 px or more (iOS zooms on focus below 16 px); the handwriting face only for short annotations at 22 px and up, never for buttons, labels, status or figures | 14 px floor; 16 px inputs; 22 px handwriting | BD-01, BD-02, BD-03, BD-04, BD-05, VT-02, VT-03, VT-04, A11Y (text size rows), DC-08 note on serif for low vision |
| A5 | Text contrast | 4.5:1 normal; 3:1 at 24 px or 18.66 px bold; placeholders included | BD-17, BD-18, VT-28, A11Y (WCAG 1.4.3), IX-44 |
| A6 | Touch targets | 44 × 44 CSS px for every stand-alone control; inline text links exempt | BD-12, BD-13, BD-14, VT-30, IX-15, WCAG 2.5.5/2.5.8 |
| A7 | Every control and image has a name; pinch zoom never blocked | accessible name present; no `user-scalable=no` / `maximum-scale=1` | BD-24, BD-09, AU-33, A11Y (4.1.2, 1.1.1, 1.4.4) |
| A8 | One palette: the Raw Linen paper holds when the phone is in dark mode | body background = #F2ECE1 in both schemes; `color-scheme: only light` | BD-42, BD-43, UC (one look across states); owner decision D2 |
| A9 | At 130 % text the layout still holds | A1-A3 at 360 px with fonts × 1.3 | BD-09, A11Y (1.4.4, 1.4.12) |
| A10 | Every state renders; no page errors | each state reached; console clean | BD-45, BD-90, BD-92, AU-34 |
| A11 | Coverage comes from the code | every tab, sheet and view in src/v6/app.js has at least one state in the review | BD-93 |
| A12 | Each check catches a planted fault | `node test/ux/review.js --drill` plants one fault per rule and expects each to be caught | BD-91 |
| A13 | After an error the next step fits the error: Try again where trying again can help (connection, busy, a broken reply), none where it cannot (a daily limit, the link, set-up, photos off, a photo that did not come through); what the person typed stays in its box | rule next-step on the five error-by-kind states and the upstream-error states | BD-46, BD-48, IX-36, IX-40, AU-19 |
| A14 | The safety rules hold in the code every page and the server run: with diabetes every plate, every base swap and every menu order keeps a whole grain or millet, and a grain-free stand-in named like a grain does not count, nor any dish built on one (cauliflower rice pulao, sabudana khichdi, konjac noodles, chickpea pasta, almond-flour roti, keto bread): a grain named as left out ("no naan", "instead of rice") or as a coating ("rava-crusted") does not count; where a stand-in or a left-out grain is named, only a plain grain standing as its own part counts ("quinoa and cauliflower rice", "tapioca with rice"); on a menu the grain is in the dish or its side, and neither the portion nor the ask leaves it out; no one-tap change removes the grain, names a stand-in or takes more than half the carbs; kidney condition and pregnancy are referred, never planned | `node test/rules/check.js <page>` on all three built pages, judged against a fixed list of stand-ins and of true grains (not the page's own word list) | owner rule 3, BD-56 |
| A15 | The owner's banned words appear in no note, no app text and no code comment of the current app, checks, gate and films, except the listed exceptions, each with its reason | `node test/words/check.js` (exceptions in test/words/allow.json) | owner rule 4 |
| A17 | Text the model writes in its own voice (read lines, why this plate, pairing reasons, one-tap notes, swaps, Rescue warnings and moves, menu portions, asks, tips and reasons to leave a dish, the log's assumption line) never shows a banned word: such a field is dropped, the safe default; every prompt asks for none. Dish names copied letter for letter from a menu keep their words (checked against the typed menu); a name the model writes for what the person typed (the Rescue dish, the log's title and foods) keeps a word only when the person typed it; the place a menu is read as is the model's own words and is screened | `node test/rules/check.js` plants the words in every field of plates, swaps, Rescue, menu and log replies | owner rule 4, BD-59 |
| A16 | Every delivered film and its WhatsApp copy has its picture from 0 s, a frame for every 1/fps, no decode errors, no picture held 7 s or more, and its sound near the 30 s film's level | `test/films/check.sh` | owner's film gates; BD-90 |

## Part A, changes after Critic round 1
The Critic found what the first version of the review could not see: a figure running into the next tile, a Rescue answer landing
below the fold, chart labels at 10 px, and a 130 % simulation that compounded on nested text. The review now checks each of these
(rules text-overflow, feedback-hidden, chart text in text-too-small). After round 2 the drill plants every rule, 18 faults,
and matches each to its element by text, so a rule that stops working is caught even when another rule of the same name fires.

## Part A, changes after Critic round 6
Round 6 found three things no check could see: a film that passed its sound check with no picture, a base swap that took the grain off a
diabetes plate, and Try again missing after two kinds of server error. Each now has a check (A13 to A16), each check was shown to catch a
planted fault, and all four run in the Stop gate before the review. Notes joined the fingerprint, so editing a note needs a new review too.
A figure now stays on one line with its unit: where tiles are too narrow, the row drops to two columns (switch points measured, in em, so
enlarged text moves them too). On screens 600 px tall or less the plate sits beside its grams, so plate, grams and dish name share the first view.

## Part A, changes after Critic round 7
Round 7 found that the model's own sentences could carry the banned words to the screen, that the grain test counted grain-free stand-ins
named like a grain, and that the chips could be cut off on short screens when foods are left out. Model text is now screened at the one point
every model string passes (A17), the grain test takes stand-ins out first (A14), both judged against fixed lists, and the chips wrap again
(state plate-leave-two). The word sweep now reads code comments too. The daily-limit line names the time new plates open (the server resets at
midnight UTC, shown in the phone's clock), and says the last plates are still there only on Plate and only when there are some.

## Part A, changes after Critic round 8
Round 8 found dishes built on a stand-in passing the grain test, and four model fields that skipped the word screen. The grain test now
judges each part of a dish name, so a stand-in followed by a dish word is not a grain, and the fixed list grew to the names the Critic found.
The place, the Rescue dish name and the log's title and foods are screened; a word stays in a name only when the person typed it. The word
screen catches the words' other forms (comparatives, adverbs, past tenses, nouns). The sweep reads the rejected promo films' sources too; their quoted
narration stays as the record. One-tap changes that are off say why on screen. The limit note says once that the last plates are shown.

## Part A, changes after Critic round 9
Round 9 showed that a list of stand-in names cannot keep up with the ways a grain-free plate is written. The grain test now reads a name the
safe way: once a stand-in or a left-out grain is named, a dish word no longer counts, only a plain grain on its own (A14); it is judged against
the Critic's 196 probe names and the builder's own, with no mismatch outside four names read the safe way (cauliflower and broccoli fried rice
as stand-ins; gobi rice and the fasting grains kuttu, rajgira and samak as grains). One-tap changes and menu orders are held to the same rule.
The menu side line is screened after its menu name. A failed ask keeps its words in the box and offers Try again where it can help (A13).

## Part A, changes after Critic round 10
Rounds 6 to 10 each found a new way to write a grain-free plate past a list of the ways seen so far. From round 10 the grain test fails
closed: a name counts as a grain only when every word in it is a known grain or grain-dish word, an amount, a way of cooking or a known
companion of a grain dish, and it names no stand-in; an unknown word means "not shown to be a grain". The word lists were built from the
recorded live replies in eval/ (477 meals, 655 base swaps, 986 one-tap notes) and the Critic's probes, and are judged against them: 391 of
the 477 live meals hold a grain (383 under the round 9 test, which missed bulgur, sourdough and suji); the two live plates no longer counted
had only a dusting of flour. One-tap changes and menu portions are read for what a "skip", "avoid", "not", "instead of", "set aside",
"save for later" or "only" applies to; 33 of the 986 live one-tap notes are held back with diabetes, nearly all of them dropping or
swapping a roti or the rice. The rule check holds 220 names that are not a grain and 216 true grains; the round 9 build fails 7 of its
checks and the round 8 build 12.

## Part A, changes after Critic round 11
Round 11 found that the round 10 lists had made shapes into grains (wrap, toast, flatbread, gnocchi, lasagne) while the companion list held
the stand-in bases, so a cauliflower toast or a chickpea flour tortilla counted. A shape is now a grain only with a grain named or with
fillings alone, and a vegetable, legume, nut or seed before a roti, chapati, bhakri or uttapam is what it is made of. With diabetes, a
one-tap note or menu portion that names the grain together with any word of absence (a miss, off the plate, to tomorrow, not tonight,
hold, alone, just the) is held back, unless the absence word applies to something that is not a grain ("without ghee", "skip the butter on
the roti") or takes part of the grain only ("drop half a phulka"). Measured: all 115 of the Critic's grain-free names are refused and 135
of its 136 true grains kept ("ghee roast" is also a chicken curry, so it is read the safe way); the 477 live meals keep 391 with a grain;
35 of 986 live one-tap notes are held back. The rule check now holds 335 names that are not a grain and 328 true grains; the round 10
build fails 5 of its checks.

## Part A, changes after Critic round 12
Round 12 found the material test held only for shapes: a vegetable, legume, nut, cheese or egg beside rice, roti, risotto, khichdi or porridge
still counted (peanut flour roti, nuts porridge, cauliflower risotto), and menu portions that name only the non-grain part (rajma part,
1 bowl chole) passed. It also found ordinary orders refused (a masala dosa with its potato filling, a thali with the papad left out, tandoori
roti instead of naan, two rotis only). Three changes:
1. The model now declares the grain. Each plate gives its grain item, what it is made of and its grams; each base swap what it is made of;
   each one-tap change the grams of grain left after it; each menu order what its grain is made of and its grams. With diabetes the plate,
   swap, change or order is dropped when the field is missing, the material is not on a fixed list of true grains (wheat, rice, millets,
   oats ...), the item is not on the plate or is under 30 g, or a change leaves under half the grain. The name and wording tests below still
   apply on top, so a stand-in declared as rice is still dropped by its name.
2. The material test holds for every grain word. A grain named outright (millet, oats, wheat, rava ...) makes a name a grain. Otherwise a
   vegetable, legume, nut, seed, cheese, egg or meat word beside a grain word counts only when the pair is a known grain dish (stuffed
   parathas, flavoured rice, biryanis and pulaos with their usual additions, egg or chicken fried rice). "Made from <x>" and "<x> flour" count
   only when <x> is a grain; "gluten-free" only with a grain named; "burger bowl" and "naan not served" are not grains.
3. The removal reader judges what each word applies to: off, out, aside, away and back count only when their object is a grain ("leave the
   butter off the roti" keeps it); "2 rotis only" and "two rotis are enough" are amounts of the grain; "instead of", "over" and "rather than"
   with a grain on the chosen side keep it; "thali" is not a grain word in a portion or ask; a grain kept for later, sent elsewhere or left
   to wait is a removal ("pack the roti for tomorrow", "the roti can wait"). On the menu, when the grain is in the dish name, a portion that
   names a food must name the grain too ("the vegetables from the biryani" does not).
Measured: all 92 of the Critic's round 12 names and all 115 of its round 11 names are refused, and 135 of its 136 true grains kept. With a
worst-case declaration (every order declares wheat, every change 200 g left), 0 of its 28 menu removals and 0 of its 39 one-tap removals are
offered; 41 of its 43 menu keeps are offered (the paneer tikka wrap, D7, and a kathi roll the diet rule drops for mayonnaise on a veg
profile) and none of its 34 one-tap keeps is held. On recorded live replies: 408 of 495 distinct meals hold a grain, as under the round 11
build; 65 of 2005 one-tap notes are held (71 before); replayed with diabetes, the recorded menus give 87 orders, none empty, and 9 dropped for
the grain rule (12 before), each an order with no grain dish or the paneer tikka wrap. The rule check holds 427 names that are not a grain
and 338 true grains, plus the declared-field cases; the round 11 build fails 22 of its checks.
Plates saved on a phone before this change carry no declared grain and were checked under the old rules, so the app drops them when it
opens and makes today's plates again (review state plate-old-saved; the round 11 build fails it: the old plate stays and its swaps fail).

## Part A, changes after Critic round 13
Round 13 found that "atta" was read as wheat wherever it stood, so besan atta, chana atta or peanut atta passed both the name test and the
declared material; that rava- or semolina-coated fish and paneer counted as grains; that a grain written into a menu portion counted even
where the place does not sell it; that a protein swap could take the place of a grain item grouped as protein; and that the declared list
refused everyday words for true grains (cracked wheat, beaten rice, samai, whole wheat bread). Changes:
1. "<x> atta" is read as "<x> flour", a grain only when <x> is a grain (whole wheat, bajra, chakki ...); a declared material with a pulse,
   nut or seed flour in it is not a grain, and neither is a milk or bran.
2. A pure grain word beside fish, meat, prawns, paneer, egg, tikki or cutlet, with no grain dish named, is a coating. A porridge counts
   only with its grain named. Fruit and jackfruit words join the materials (banana bread counts, banana porridge and kathal roti do not).
3. The declared material uses the same grain words as the name test, plus everyday forms (cracked, beaten, chakki, idli rice, whole wheat bread).
4. A grain in the menu portion counts only when the typed menu sells it. With diabetes, a protein swap that would take the place of the grain
   item is not offered.
5. The removal reader reads passives ("the butter to be kept off the pav" keeps the grain), contrasts ("tandoori roti, not butter naan"),
   time-outs ("set the khichdi aside to rest") and more removals ("bin", "cancel", "a separate box", "off the menu", "khichdi out", "in the
   khichdi's place"); a bowl of a curry-and-bread dish ("Chole Bhature | 1 bowl") is the curry.
Measured: 0 of the Critic's 49 round 13 names count; its round 12 (92) and round 11 (115) names stay refused and 135 of its 136 true grains
are kept. Its 16 end-to-end plates are dropped. Of its declared materials, all 61 non-grains are refused and all 75 true grains accepted
(rajgira counts, D7; "wheat and chickpea flour" is refused under correction 1). Its round 13 probes with a worst-case declaration: 0 of 20
menu removals and 0 of 18 one-tap removals offered, 0 of 21 menu keeps and 0 of 11 one-tap keeps refused; all 18 removals are held with an
honest 0 g. Its 37 true-grain names: 31 count; cucumber sandwich, coconut roti and urad dal dosa are read the safe way (D7), and egg bread,
cheese bread and paneer rice stay refused (round 12). On recorded live replies nothing moves against the round 12 build: 408 of 495 meals
with a grain, 225 of 313 base swaps, 65 of 2005 one-tap notes held, and with diabetes 87 menu orders, none empty, 9 dropped. The rule check
holds 478 names that are not a grain and 354 true grains, plus the round 13 cases; the round 12 build fails 12 of its checks.

## Part A, changes after Critic round 14
Round 14 found that vegetables, legumes, cheese or egg fried or coated in rava, sooji, semolina or oats still counted as the grain; that
"chana ka atta" still read as wheat; that the round 13 contrast rule let "roti, not tonight" through; that the bowl rule refused ordinary rice
bowls (Rajma Chawal, Dal Chawal, a quinoa chicken bowl); and that a portion's grain was matched to the menu by a single word ("rice" in Rice
Kheer). Changes:
1. A coating: a name whose only grain words are pure grains, with no grain dish, a vegetable, legume, cheese, egg or meat word, and either a
   coating grain (rava, sooji, semolina, oats, maida) or a frying word (fried, fry, tawa, crusted, coated) is not a grain. A grain bowl and
   oats chilla still count.
2. "atta" is judged by the first word before it after ka, ki, ke and adjectives: a vegetable, legume, nut, seed or fruit makes it that flour;
   anything else ("thin atta roti", "gehun ka atta", "sharbati atta") is wheat. The declared material accepts the same everyday forms.
3. "<grain>, not/no/never/none/skip" followed by nothing or a time or politeness word removes the grain ("khichdi, not tonight", "rice, no
   thanks"); followed by a grain it is a contrast that keeps one ("brown rice, not white rice"); followed by anything else it keeps the
   grain ("rice, no ghee on top"). "Can go", "goes" and "is off" with a grain are removals; "out of the cooker" and "fresh out of the tandoor"
   are cooking; sharing counts as a removal only when the person keeps no portion of their own; "a rest for 5 minutes" is cooking.
4. The bowl rule covers only a curry with its bread (chole bhature, pav bhaji), never a dish named as a bowl or a rice pair; a portion is read
   by its first part, so "1 plate, extra onions on the side" is the whole dish; a portion's grain counts only when a menu item ends with it.
Measured: the Critic's round 14 probes give 0 of 18 "ka atta" names and 0 of 50 coated names counted, 0 of 43 true grains refused, 0 of 20
one-tap removals offered at 200 g declared and 0 of 16 keeps held, 0 of 8 menu removals offered and 0 of 17 keeps refused, and none of its
portion-grain orders offered on the kheer and papad menus. Its round 13 and round 12 probes hold as before. On recorded live replies nothing
moves against the round 12 build. The rule check holds 544 names that are not a grain and 393 true grains; the round 13 build fails 8 of
its checks.

## Part A, changes after Critic round 15
Round 15 found that coatings of rice flour, rice rava, wheat flour or atta, and rava-fried vegetables outside the material list, still counted
as the grain; that the own-portion test read "your plate is dal and salad" as keeping the grain; that a menu portion was read by its first part
only; that "goes", "can go" and "is out" held ordinary keeps; that "atta" was read across commas and by one word; and that a grain in a
bracket, after a dash or in a slash list on a typed menu counted as sold. Changes:
1. With no grain dish named, a frying or crusting word, or rava, sooji, semolina or maida, beside a food word is a coating, whatever the
   grain; "rice flour" and "rice rava" are materials, not rice; a grain flour named in its own part counts as a serving unless the name also
   has a frying word and a food. "Fried rice", "egg fried quinoa", grain bowls and chillas stay grains.
2. "atta" becomes the flour of a pulse, nut, seed, fruit or low-carb word in the same phrase (back to a comma, four words): "soya chunks atta",
   "gram flour atta", "chana ka bhuna atta"; a vegetable mixed into the dough keeps it wheat ("palak atta roti").
3. The own portion counts only as an amount of the grain ("your 150 g", "you keep 150 g", "have one"); "a rest" or "a break" is cooking
   only for minutes; "share ... at the table" is a removal; "<grain>, not for me", "<grain>? leave it" and "<grain>, cut it out" are removals.
4. "Goes", "can go" and "is out" remove only when they stand alone or with a time word, and not after "once" or "when".
5. Every comma part of a menu portion is read, except additions and notes (extra, on the side, toppings, about ...).
6. The items a typed menu sells are read by line (kept as " | "); a line's head before a bracket, dash or colon is the dish unless it is a
   section ("Breads: Roti / Naan"); a free-typed list splits on commas and "and"; an item sells a grain only when it is a grain dish and not a
   snack or sweet (pakora, kheer, papad).
Measured: the Critic's round 15 probes give 0 of 120 coated or pulse-atta names counted and 0 of 27 more coatings; 1 of 85 true grains
refused (sattu atta roti, read the safe way, D7); 0 of 30 one-tap removals offered at 200 g declared and 0 of 20 keeps held; 0 of 17 menu
removals offered and 0 of 9 keeps refused; no grain counted as sold on its five menus that sell none, and every grain counted on its seven that
do. Its round 14, 13 and 12 probes hold. On recorded live replies nothing moves against the round 12 build. The rule check holds 677 names
that are not a grain and 463 true grains; the round 14 build fails 9 of its checks.

## Part A, changes after Critic round 16
Round 16 found that the round 15 rule reading a pure grain after a frying word as the dish ("egg fried quinoa") let coatings with the frying
word first count ("crispy rava fish", "tawa rava brinjal"); that "goes", "can go" and "is off/out" had become too narrow to catch "rice is off
for this meal" or "the rice goes back in the pot"; that "<grain>: take it/save it" and the own-portion test held eating-order notes ("rice:
take it after the salad", "have one roti and give the rest to the family"); that ", with raita" was read as the part eaten; and that rice
cakes, sweet rice and pani puri counted as sold. Changes:
1. Coatings are judged by what follows the last grain word: a food after it, with a frying word anywhere, is a coating ("crispy rava fish",
   "noodle fried prawns"); with rava, sooji, semolina or maida, a vegetable, legume, cheese, egg or meat after it is a coating ("rava
   brinjal", "rava fish cakes"); a grain named last is the dish ("fried paneer quinoa", "tomato rava", "egg oats"). Corn alone is the
   vegetable.
2. "atta" reads its phrase back to "and", "with" or a comma; "dal ka atta" is dal flour; "dal atta roti" and "low-oil atta paratha" are wheat.
3. "Goes", "go", "can go" and "is off/out" remove when nothing follows or what follows sends the grain away (completely, for this meal, this
   time, tonight, back in the pot, to the fridge, off the plate); they keep it before last, after, down, to 150 g, cold or with.
4. "<grain>: take/save/leave it" removes only with nothing, out, off, aside or a later time after it; an amount ("more than 150 g") keeps;
   the own portion includes "have one roti", "eat one roti", "you take one small bowl" (not "one bowl of dal").
5. A portion part starting with "with", or naming a filling or stuffing, describes the dish; the potato filling counts as what is eaten
   only in the portion's first part.
6. The sold-items reader names items under a grain heading ("Rice" then "Jeera / Plain"), reads sections with a dash, colon or bracket, a
   "(with Jeera Rice)" bracket and unpriced section words that are items, treats phulka, chapati and roti (and chawal and rice) as one, and
   leaves out cakes, sweets, chaat and drinks.
Measured: the Critic's round 16 probes give 0 of 40 and 0 of 19 names counted, 59 of 63 true grains (the four others are read the safe way,
D7), 0 of 22 one-tap removals offered and 0 of 26 keeps held, 0 of 6 menu removals offered and 0 of 16 keeps refused, 0 of 14 not-sold menus
counted, 0 of 17 selling menus refused, 0 of 23 end-to-end plates accepted. Its round 15 to 12 probes hold. On recorded live replies nothing
moves. The rule check holds 740 names that are not a grain and 512 true grains; the round 15 build fails 9 of its checks.

## Part B. Judged on the rendered screens (visual review, then the Critic)
| ID | Criterion | Sources |
|---|---|---|
| B1 | One first read per surface: on Plate, the plate and its grams lead; decoration follows | BD-29, BD-30, DC (hierarchy), AU-18 |
| B2 | Alignment: shared left edges and baselines; spacing in steps (4/8 px grid inside groups, 16-24 px between) | VT-13, VT-14, VT-16, UC (spacing values) |
| B3 | Legible at arm's length for 45+ readers: captions, numbers and hints readable without zoom; figures in the text face | BD-01, BD-02, BD-04, VT-04 |
| B4 | Few sizes per screen (4-5), two faces at most, one UI face | VT-06, VT-07, BD-10 |
| B5 | Controls look tappable; selected, disabled and pressed states visible; one primary action per state | BD-31, BD-32, BD-50, IX-16 |
| B6 | Loading, empty, error and blocked states say what is happening and what to do next, in plain words | BD-46, BD-47, BD-48, BD-56, BD-72, IX-36, IX-40, IX-41, AU-11, AU-19 |
| B7 | Plain English for these readers: sentence case, verbs first, no jargon, the owner's banned words absent | BD-65, BD-71, BD-73, IX-46, IX-48, UXW rows |
| B8 | Meaning never by colour alone: each nutrient colour sits next to its name | BD-20, A11Y (1.4.1) |
| B9 | One look across tabs, sheets and states (Raw Linen, revised plate) | BD-42, UC (finding-patterns, conventions) |
| B10 | Dark mode shows the same paper look | A8, BD-43 |
| B11 | AI output is marked and explained; the person can change or reject it | BD-59, AU-24 to AU-26 |
| B12 | Health data stays on the phone; what is sent to Google Gemini is stated where it is typed | AU-38, IX-31 |

## Part C. How the criteria are enforced
1. `test/ux/review.js` measures Part A on every state (exit 0 clean, 1 violations, 2 could not run = UNVERIFIED, BD-92).
2. Hook (`.claude/settings.json`): finishing work runs `ux-gate.sh`. It rebuilds both pages, fingerprints the state (`test/ux/manifest.sh`:
   pages, sources, the review and its checks, both films, the WhatsApp post, every note), runs the rule, word and film checks (A14 to A16), re-runs the review to zero, and requires a Critic PASS for that
   fingerprint in `test/ux/CRITIC.md`. Edits made any way (editor, shell, films) change the fingerprint. After three blocks on one state
   it lets the stop through with a message to the owner that the work is not resolved. A hook proves only that the steps ran (BD-94);
   who wrote CRITIC.md is shown by git history, not by the hook.
3. The Critic (`.claude/agents/ux-critic.md`) is independent of the builder: it re-runs the review, reads the screens for Part B and the
   diff for regressions, and writes VERDICT and BUILD (the fingerprint) to `test/ux/CRITIC.md`. Nothing reaches the owner without its PASS.
4. Still outside what code and the Critic can prove (BD-87, BD-94): the owner's own phone, and clients' comprehension. These stay listed
   as "Not inspected" in each verdict.

## Part D. Owner decisions where sources disagree
- D1 Look: the Raw Linen journal (cream paper, serif, clay) is the owner's chosen look (rule 10). BD-78 lists cream + serif + terracotta as a
  common default look of generated pages; the owner's decision stands, and B9 holds the look to consistency instead.
- D2 Dark mode: the app keeps its paper palette in dark mode (no second palette). Sources accept either one designed dark palette or a
  declared single scheme (VT-25, UC); a half-applied dark palette is what broke screens on phones in dark mode.
- D3 Serif for low vision (DC-08 advises sans): EB Garamond stays for the look, with larger sizes (body 17 px, floor 14 px, figures 22 px+) and
  darker ink to compensate; the handwriting face leaves all functional text (BD-04).
- D4 Targets 44 px (AA product target) rather than 48 px (AAA / Android native): 44 px with spacing is the doctrine's product target (BD-12).
- D5 Ornament text: the meal words drawn on the plate's rim, the circular stamp and the vine and sprig drawings are ornament from the owner's
  confirmed look, not text to read. The rim words repeat the meal tabs shown at full size just above the plate, and the plate drawing is one
  image with one spoken name. The stamp at the foot of Plate is a brand mark: its words (NEXT PLATE, MADE FOR YOU, made today) carry nothing the
  person needs to read or act on, and it is hidden from screen readers. The review leaves these out of A4 (test/ux/review.js, svg text inside
  .thali, .stamp, .vine, .sprig); the Critic checks that none of them carries information the person needs. If one ever does, it must meet A4.
- D6 The 30 s film keeps the owner-approved soundtrack, taken unchanged from the approved cut (git b890035). Its music rises in two voice
  gaps (17 s, 24 s): that is the ducking letting go between lines, part of the mix the owner approved. Re-mixing would change approved work;
  the 51 s film, mixed here, sets the music beat by beat instead.
- D7 Where the Critic's rounds disagreed, the later round stands: round 9 listed paneer, egg and cheese roti as stand-ins, round 10 as wheat
  rotis with a filling; they count as grains. Names that can be read either way are read the safe way, as not a grain (cauliflower and broccoli
  fried rice, flaxseed roti, cauliflower upma, besan roti); gobi rice, kuttu, rajgira and samak count as grains. Round 11 read a paneer
  wrap and a moong dal roti as not grains (round 10 had them as grains), and mushroom rice as a grain (round 10 had it as a stand-in);
  round 11 stands. "Ghee roast" alone is also a chicken curry, so it is read the safe way, as not a grain.
  Round 12 reads cauliflower biryani, paneer rice, cheese bread and egg bread the safe way, as not grains (round 10 had cauliflower biryani
  as a grain); round 12 stands. A paneer burger, a bread omelette and a gobi pulao count; a paneer bun burger and a pizza omelette do not.
  Round 13 reads cucumber sandwich, coconut roti and urad dal dosa the safe way, as not grains: each has a common grain-free version.
  Rajgira (amaranth) still counts as a grain, as kuttu and samak do, in both the name test and the declared material.
  Round 15 listed sattu atta roti as a true grain, round 13 as a stand-in; sattu is mostly roasted gram, so it is read the safe way.
  Round 16 listed coconut atta dosa, sesame atta roti, seeds atta roti and "atta" alone as true grains; coconut, sesame and seed flours have
  grain-free versions and "atta" alone is not a serving, so they are read the safe way.
