VERDICT: FAIL
BUILD: 5b1d8e6bfdeaa497168f669921468c9602e973fca482d8d5ca85d241065dda81

# Critic, round 10 (diff f99e183..fa94727; the three built pages; both films and their WhatsApp copies; every note; the gate)

I measured, rendered, probed and viewed everything below myself. The builder's list was a set of claims to check, not evidence.

Much of round 9 is fixed and every measured check passes:
- a failed ask keeps its words and offers Try again in every error code where it can help;
- the menu side line is screened;
- all 196 of my round 9 probe names are read the safe way.

The verdict is still FAIL. With diabetes, the code still lets the grain leave the plate (owner rule 3) in three places:
- **Plates and base swaps.** A grain that is named as left out still counts as the grain when one word stands in front of it ("no butter naan", "without the rice", "instead of steamed rice", "in place of 2 phulkas"), or when other words say it is left out ("avoid rice", "rather than rice", "rice skipped"). Six kinds of grain-free name that round 9's code dropped now pass.
- **One-tap changes.** A change that takes the grain off in other words is offered. Examples: "Avoid the khichdi", "rather than the khichdi", "leave the khichdi out", "Skip the appam".
- **Menu orders.** 14 of the 15 orders I wrote whose portion or ask leaves the grain out in other words are offered. Examples: "Rajma only", "Eat only the chicken pieces", "minus the rice", "without the bhature".

The approach changed this round, but the result is the same as in rounds 6 to 9: the test reads safety out of free text against word lists, and ordinary rewordings get past the lists.

## What I measured
- **Pages are current.** I rebuilt the three pages in a scratch copy of HEAD (scratchpad r10/critic/build). hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html are byte-identical to the committed files. The working tree is clean at fa94727.
- **Fingerprint.** It was 5b1d8e6b... before I measured and is the same after. That matches the builder's figure.
- **Drill.** npm run drill: "every planted fault was caught".
- **Review.** npm run review: 9 runs x 45 states = 405 checks, 0 violations, exit 0.
  - On the served page (hosted/v6/index.min.html, output in scratchpad r10/critic/review-min): 405 checks, 0 violations, exit 0.
  - All 1378 screenshots come from this run; the full run now clears old screens (review.js:232).
- **Exceptions.** test/ux/allow.json is [].
- **Rules.** npm run rules: every check holds on all three pages.
  - The current check.js run against f99e183's page fails 11. Claim 7 holds.
- **Words.** npm run words: no hits outside the 42 exceptions (31 notes, 8 app files, 60 code files).
  - I read all 42. Each is one of these: the rule itself; a quoted record (rejected narration under a record header or in the rejected film's own source, or the owner's own quoted words in the handoff); a web address; a cited constant name. None hides a defect.
  - My own sweep of the tracked files and of the built page found no banned word in user-facing text. The only hits are the rule lists, the CSS property for rotation and scale, and "simplest" in old pages, which is not a banned form.
- **Films.** npm run films: all four pass.
  - 30 s: 1890 frames, -16.7 dB. Its WhatsApp copy: 947 frames, -16.7 dB.
  - 51 s: 3060 frames, -16.7 dB. Its WhatsApp copy: 1532 frames, -16.8 dB.
  - All start at 0.00 s, with no decode errors and no held picture.
  - demo/, the WhatsApp post and the script are unchanged since f99e183 (git diff is empty).
- **My probes** are in scratchpad r10/critic/:
  - probe/grain.js with pass.json and drop.json, run on the new page and on f99e183's page;
  - probe/onetap.js, probe/menu.js, probe/own.js;
  - probe/live.js and live2.js, run over every recorded live reply in eval/v5 and eval/v6;
  - ui/ask.js, which serves the built page with the mock engine and fails the meals call in each of 10 error codes.

## Findings, most serious first

### 1. Plates and base swaps: grain-free names still count as the grain (owner rule 3; A14; blocks)
**What happens.** Each name below is accepted as the only grain on a diabetes dinner plate, and is offered as a base swap (probe/pass.out, on hosted/v6/index.min.html).

- **A word between the left-out word and the grain.** NEGG (core.js:100) allows only "any", "a" or "an" between them, and only the words in GW.
  - Paneer tikka, no butter naan
  - Dal tadka without the rice
  - Palak paneer, no tandoori roti
  - Salad instead of steamed rice
  - Lettuce cups instead of jowar roti
  - Extra dal in place of 2 phulkas
  - Grilled paneer minus the naan
  - Dal, no white rice
  - Paneer tikka, no-naan
- **A second grain after "or" or "and".** The left-out word covers only the first grain, so the second counts as its own part.
  - Dal makhani, no rice or roti
  - Dal makhani, without roti and rice
- **Other ways of leaving the grain out.**
  - Sambar, avoid rice
  - Rajma, rice skipped
  - Dal makhani sans rice
  - Paneer curry with salad rather than rice
  - Rice-less biryani
  - Grainless upma
  - Atta-free roti
- **Grain words this round added to GRAINW but not to GW.** A grain named as left out still counts when its word is missing from GW.
  - Chole, no bhature
  - Vegetable kurma, no idiyappam
  - Sambar without idiyappam
  - Kadhi, no thalipeeth
  - Chole without kulcha
  - Stew, skip the appam
  - Dal, no millet
  - Dal, no bajra
- **"Made with" a grain that the name says is not used.** MADEG (core.js:123) is applied before the safe reading.
  - Roti made with almond flour instead of wheat
  - Pasta made from chickpeas, not wheat
  - Roti made with coconut flour, no atta
  - Pizza made with cauliflower crust, no maida
  - Bread made without wheat
- **Stand-ins outside STAND.**
  - Cauliflower couscous, Broccoli couscous, Cabbage couscous
  - Pumpkin noodles, Kaddu noodles, Ridge gourd noodles, Raw papaya noodles, Kohlrabi noodles
  - Spiralised vegetable noodles, Seaweed noodles, Glucomannan noodles
  - Gram flour roti, Chana atta roti, Besan ki roti, Soy atta roti
- **A grain word used as a flavour.** Biryani-spiced cauliflower; Pulao-style cauliflower; Poha-style cauliflower; Upma-style vegetables.
- **A grain word inside a condiment's name.**
  - Idli podi; Pasta sauce; Biryani masala; Rice papad.
  - A whole diabetes breakfast is accepted because of "Idli podi": pesarattu (whole moong crepes), idli podi, coconut chutney and cucumber.

**Regressions.** I ran the same probe on f99e183's page (probe/pass-old.out). These names were dropped there and are accepted now:
- Cauliflower, Broccoli and Cabbage couscous. The old stand-in list had couscous after a vegetable; STAND (core.js:105-108) left it out.
- Chole, no bhature; Vegetable kurma, no idiyappam; Sambar without idiyappam; Kadhi, no thalipeeth.
- Pizza made with cauliflower crust, no maida.

**Why it matters.** With diabetes the grain stays. These are ordinary ways of writing a grain-free Indian plate. None of them is in check.js's fixed lists, so A14 passes while the rule does not hold.

**Smallest correction.**
- **Read left-out grains the safe way.**
  - Let any words stand between the left-out word and the grain, within the same part of the name.
  - Add avoid, sans, rather than, not, -less, skipped, not included and optional.
  - Carry the left-out word across "or" and "and".
  - Use the full grain list (GRAINW) for left-out grains, not GW.
- **Apply MADEG only when the name has no left-out word.**
- **Widen STAND.**
  - Put couscous back after a vegetable.
  - Add the vegetables, legume flours and spiralised forms above.
  - A grain word followed by -style, -spiced, masala, podi, sauce or papad does not count.
- **Put every name above in the fixed lists.**
- **The route that ends this cycle** (round 9's suggestion, still open): ask the model for the grain item as its own field (food and grams) on plates, base swaps, one-tap changes and menu orders, check that field against a positive list of grains and millets, and keep the name test as a second screen.

### 2. One-tap changes can still take the grain off (owner rule 3; A14; blocks)
**What happens.** I ran probe/onetap.out on the fixture diabetes dinner plate, with each note's carb change set to -12 g of the plate's 44 g. Every note below is offered.

- **Gentler on sugar.**
  - "Avoid the khichdi tonight and have extra palak with the paneer."
  - "Have the paneer and palak with salad, not the khichdi."
  - "Pair the paneer with a big salad rather than the khichdi."
  - "Eat the paneer and palak on their own; save the khichdi for lunch tomorrow."
  - "Leave the khichdi aside and add a bowl of moong sprouts."
  - "Cut the khichdi and double the sauteed palak."
  - "Pass on the khichdi and have more paneer tikka."
  - "Ditch the khichdi; fill up on palak and paneer."
  - "Keep it to paneer and palak only."
  - "Have a large salad and the paneer, and leave the khichdi out."
- **Grains missing from REMOVEG's list** (core.js:140 uses GW):
  - "Skip the appam ..."
  - "Leave out the kulcha ..."
  - "Skip the idiyappam ..."
  - "Skip the thalipeeth ..."
  - "Drop the bhatura ..."
  - "Skip the sevai ..."
- **Swaps to stand-ins outside STAND:**
  - "Swap the khichdi for pumpkin noodles."
  - "Swap the khichdi for cauliflower couscous."
  - "Swap the khichdi for a gram flour roti."
  - "Swap the khichdi for a besan ki roti."
- **Other kinds:**
  - More protein: "Add 50 g more paneer and avoid the khichdi."
  - Easy on the gut: "Have moong soup with the paneer rather than khichdi."
  - 10-minute version: "Pan-fry the paneer and serve it with palak only."
- **The title and the note are joined with only a space** (core.js:223), so the swap reading runs on into the note.
  - Title "+ Swap Khichdi for Greens" with the note "Double the palak and keep the millet for tomorrow." is offered: the millet in the note is read as what replaces the khichdi.

**The half-carb backstop does not catch removals on the model's own figures.** These recorded live notes (eval/v5/results-live-final.json, profiles without diabetes) remove the whole grain with a small carb change:
- "Drop the brown rice entirely and double the sauteed zucchini portion": -15 g of 55 g.
- "Drop the millet portion ...": -16 g of 87 g.
- "... omit the millet ...": -20 g of 87 g.

Only the wording check stops these, and it stops them only because they say drop or omit.

**Why it matters.** The one-tap row is the second tap that changes the plate (film beat 5), and the note says what to do.

**Smallest correction.**
- Apply finding 1's left-out reading to the note, with the wider verbs: avoid, rather than, not the, leave, aside, pass on, save for, cut, ditch, only, on their own, and "instead" without "of".
- Use GRAINW in REMOVEG.
- Join the title and the note with ". ".
- Sturdier: take the grain grams after the change as a field, and drop any change that leaves less than half.

### 3. Menu orders whose portion or ask leaves the grain out in other words (owner rule 3; A14; blocks)
**What happens.** I ran probe/menu.out with diabetes, lunch and a typed menu. These orders are offered, with the portion and ask shown as they would appear on the order card:
- Butter Chicken with 1 Tandoori Roti. Ask: "Ask for extra salad, not the roti".
- Butter Chicken with 1 Tandoori Roti. Ask: "Have the salad rather than the roti".
- Butter Chicken with 1 Butter Naan. Ask: "Avoid the naan if you can".
- Dal Tadka with 1 Tandoori Roti: "1 bowl, ≈ 300 g; leave the roti".
- Chicken Biryani: "Eat only the chicken pieces, ≈ 150 g".
- Chicken Biryani: "Pick out the chicken and leave the rice, ≈ 150 g".
- Veg Biryani: "1 plate, ≈ 300 g, minus the rice".
- Chole Bhature: "1 plate, ≈ 300 g, without the bhature".
- Chole Bhature: "The chole only, ≈ 250 g".
- Rajma Chawal: "1 bowl rajma, ≈ 250 g, rice not included".
- Rajma Chawal: "Rajma only, ≈ 250 g".
- Veg Thali (2 roti, rice, dal, sabzi): "Dal, sabzi and salad, ≈ 400 g; set the roti and rice…".
- Masala Dosa: "The potato filling with sambar, ≈ 250 g, not the dosa".
- Paneer Tikka with 1 Tandoori Roti. Ask: "Ask them to pack the roti for later".
- Two stand-ins on their own: "Cauliflower Couscous Bowl" and "Pumpkin Noodles".

Of the 15 orders that leave the grain out, only "6 pieces, about 220 g, no tandoori roti" was dropped.

**Why it matters.**
- The menu prompt asks the model to name the grain in "with" or "portion" (engine.js:348).
- Recorded live asks already talk about the grain, for example "Please give more rajma and less rice" (eval/v6/results-menu-*.json).
- The order card is what the person reads at the counter.

**Smallest correction.**
- Apply the wider left-out reading to the portion and the ask.
- Treat "X only", "only the X" and "on its own", where X is not a grain, as leaving the grain out.
- Sturdier: take the order's grain and its grams as fields.

### 4. Ordinary grain dishes and harmless one-tap changes are dropped (rule 3 is not broken; minor, above cosmetic)
**What happens.**
- **Common menu spellings are not counted as grain.** This was there before this round, because GRAINW is a list. With diabetes, these typed menu dishes are dropped (probe/menu.out):
  - Idly (2 nos), Veg Biriyani, Aloo Parantha, Chole Kulche, Veg Pulav, Cheese Toast, Spaghetti Aglio Olio, Veg Sandwich;
  - Dal Tadka with "2 Chapathi".
- **More names not counted as grain** (probe/drop.out): Dosai, Onion uthappam, Dal bhat, Thayir sadam, Bisibelebath, Vangi bath, Khichri, Kanda pohe, Kerala parotta, Dosas, Naans, Theplas, Kulchas, Appams, Adai, Pathiri, Luchi, Dal baati, Litti chokha, Khakhra, Pizza.
- **New this round:** Cheese toast, Paneer toast and Tofu fried rice are read as stand-ins (core.js:106, 111).
- **One-tap changes.** With diabetes, the new rule withholds 80 of the 1019 distinct recorded live one-tap notes.
  - About a third of those only add vegetables. Examples:
    - "Add sharp grated white radish for crunch ..."
    - "Pair with cool crunchy cucumber ribbons ..."
    - "Add crunchy raw cabbage and lemon ..."
  - These are caught by the grated or shredded vegetable pattern and the cucumber ribbons pattern (core.js:104, 106), which match salads.
  - The notes "Skip the ghee on the khichdi" and "No butter on the roti" are dropped (probe/onetap.out).
  - The menu ask "Ask them to skip the butter on the roti" drops its order.

**Why it matters.**
- Gentler on sugar is the change people with diabetes need most. When it is dropped, the one-tap row says "Not offered for this plate".
- A person with diabetes who types a South Indian or Punjabi menu loses most of its grain dishes.
- Rule 3 is not broken, but this is a functional defect for these users, so I rate it above cosmetic.

**Smallest correction.**
- Add the spellings and dishes above to GRAINW, and to CORE where they need it.
- Take cheese, paneer and egg before "toast" out of STAND.
- Limit the grated or shredded pattern to a vegetable named as rice or a base.
- Limit "ribbons" to pasta words.
- Let a change that removes only butter, ghee or oil from a grain stand.

## Cosmetic (all listed; none blocks on its own)
- **The ask box can bring back an older ask.** After a failed ask, the box keeps that ask even after the error note has gone, and puts it back over newer typing.
  - I typed "dal and two roti" after a busy error, then tapped I'll have this. The box went back to "Something light with paneer" (ui/360-ask-edit-then-tap.png; app.js:327).
  - Clear the kept ask when the person types or the view moves on.
- **own() treats a function word as a matching neighbour.**
  - "A R-E-A-L treat: biryani" is kept for the typed "biryani at a R-E-A-L wedding".
  - "The R-E-A-L biryani" is kept for "what is the R-E-A-L calorie count of biryani" (probe/own.js).
  - The person did type the word, so A17 holds.
- **Word forms clean() still lets through:** R-E-A-L-N-E-S-S, R-E-A-L-S, S-M-A-R-T-S, M-A-G-I-C-I-A-N-S, Q-U-I-E-T-U-D-E, E-X-A-C-T-N-E-S-S.
- **A dash after the side's menu name drops the whole side.** For "1 Tandoori Roti - a R-E-A-L treat", the menu name is not kept, because the split covers only comma, bracket and semicolon. This is the safe direction.
- **The builder's list counts are wrong.**
  - check.js holds 138 stand-ins (137 distinct) and 111 true grains (109 distinct), not 97 and 95.
  - "Sabudana khichdi", "Gobi paratha" and "Rajma chawal" are listed twice.
- **Photo menus are not checked against anything.** I accept this as before.
- **D6 holds.** The 30 s film is unchanged.

## The builder's claims, judged on my own evidence
| Claim | Status | Evidence |
|---|---|---|
| 1 Grain test reads names the safe way | PARTLY | All 196 round 9 names hold, apart from the 7 judgement calls (gobi rice; kuttu, rajgira and samak as grains), which I accept. Old and new answers are the same on every recorded live plate and base swap (probe/live.js: 0 differ). Finding 1 shows rewordings and six regressions. |
| 2 One-tap changes keep the grain | PARTLY | The 8 round 9 notes, the live phulka note and the half-carb case are dropped, and the grain-to-grain swap stays. Finding 2 shows other wordings. |
| 3 Menu: grain in dish or side; portion and ask may not leave it out | PARTLY | "no naan", "skip the rice", "without roti", "in place of roti" and "Skip the roti and have more salad" are dropped. Finding 3 shows other wordings. |
| 4 Side line screened | HOLDS | Comma, bracket and semicolon tails go and the menu name stays. Planted in check.js; ".with" is no longer exempt. |
| 5 Failed ask keeps its words; Try again re-sends | HOLDS | ui/ask.out: busy, upstream_error, unparsed, network and empty keep the box, show #ask-retry, and re-send the same ask. limit_day, limit_ip, bad_key, not_set_up and bad_request keep the box with no Try again. When the first plan fails, the empty card's Try again re-sends the ask. |
| 6 Word forms, own(), Rescue heading, screens cleared, docs | HOLDS | Leftovers are under Cosmetic. A long typed sentence gives "Your dish". |
| 7 Previous build fails 11 | HOLDS | 11 rule checks fail on f99e183's page. |
| 8 Films unchanged | HOLDS | demo/ git diff is empty; the film check passes. |

## Checked and holding
- **Safety referral.** Kidney condition and pregnancy are referred, never planned, on Plate, Builder and Rescue at every width, in dark mode and at 130 % text.
- **Owner rule 2.** After-meal rise is shown only as a band. Grams and kcal throughout; no katori or phulka as units; no supplements.
- **Diff f99e183..fa94727.**
  - No safety line, label or focus handling was removed, and no CSS changed.
  - The new #ask-retry button has its name and passes the 44 px target check.
  - Engine changes are the grain test, the one-tap screen, the menu rule, the side screen and the Rescue heading fallback, as described.
- **Screens.**
  - I viewed every segment of all 45 states at 320 light, 360 dark, 390 light and 360 light at 130 %, the Plate and menu-order states at 412 light, and plate-ask-busy at full size at 320 and at 130 %.
  - Dark mode matches light pixel for pixel at 320, 360, 390 and 412, apart from toast timing, so 320 dark is what I viewed at 320 light.
  - Against round 9's screens, only plate-ask-limit (the box keeps the ask) and the new plate-ask-busy changed, apart from animation timing.
- **Part B.**
  - The new Try again sits inside the note, on the text's left edge, in the same outline style as the other Try again buttons.
  - The kept ask is legible.
  - Raw Linen holds across tabs and states.
  - Hierarchy is unchanged, and nothing is cramped at 320 or at 130 %.
- **The 51 s film, at every beat.** I took 30 frames of the WhatsApp copy, from 1 s to 50.5 s.
  - They follow docs/film/SCRIPT-features.md.
  - The end card reads NEXT PLATE, "Made for you." and "Reply "plate" for your link.".
  - The film's menu order still passes the current core with diabetes: Paneer Tikka, 6 pieces, ≈ 220 g, with 1 Tandoori Roti, "No butter brushed on top, extra lemon wedges and onion rings", Gentle.
- **The 30 s film.** I took 13 frames of the WhatsApp copy. Its beats and end card are as approved.
- **WhatsApp post.** Unchanged.

## Not inspected
- The owner's own phone and browser. I used Chromium emulation only, not iOS Safari or Android WebView.
- Live Gemini variety. I used the recorded live replies in eval/ and the mock engine, and made no new live calls.
- Audio by ear. No transcript was supplied. I relied on the film check's levels and on the files being unchanged.
- Screen-reader output.
- Clients' comprehension.
- The deployed server. Its core was checked only through the built hosted/v5/index.min.html.
