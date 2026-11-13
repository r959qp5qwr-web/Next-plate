VERDICT: FAIL
BUILD: d19f8c191800364aba547a3a6aa6116e76a8be7b6fc2ada1ac5849bd3bb405b5

# Critic, round 9 (diff dbb35cf..f99e183; the three built pages; both films and their WhatsApp copies; every note; the gate)

I measured, rendered, probed and viewed everything below myself. The builder's notes and commit messages were claims to check, not evidence.

Every round 8 finding was fixed as described, and every measured check passes. The verdict is still FAIL, for three reasons:
- **With diabetes, the code can still let the grain leave the plate (owner rule 3).** It can happen three ways:
  - a menu order whose portion line says "no naan";
  - ordinary ways of naming grain-free dishes ("paneer biryani with cauliflower rice", "moong dal dosa", "lettuce wrap instead of roti");
  - a one-tap change that tells the person to skip or swap the grain. No check covers one-tap changes.
- **One field the model writes still skips the banned-word screen (owner rule 4).** This is the menu order's "with" line. Only the part before a comma or bracket is matched against the menu. Whatever the model adds after it is shown without a check.
- **When an ask fails while plates are on screen, the typed ask is lost (A13, B6).** The note says "Try again", but there is no Try again button.

## What I measured
- **Pages are current.** I rebuilt the three pages in a scratch copy of HEAD. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html are byte-identical to the committed files. The working tree is clean at f99e183.
- **Fingerprint.** It was d19f8c19... before I measured and is the same after. That matches the builder's figure.
- **Drill.** `npm run drill`: "every planted fault was caught".
- **Review.** `npm run review`: 9 runs x 44 states = 396 checks, 0 violations, 0 state errors, exit 0.
  - The served page (`--page hosted/v6/index.min.html`, output in my scratchpad r9/critic/review-min): 396 checks, 0 violations, 0 errors, exit 0.
  - 8 screenshots at 320 px are left over from older runs. I did not use them.
- **Exceptions.** test/ux/allow.json is `[]`.
- **Rules.** `npm run rules`: every check holds on all three pages.
  - The current check run against the page from dbb35cf fails 8, as the builder says.
- **Words.** `npm run words`: no hits outside the 37 exceptions (31 notes, 8 app files, 60 code files).
- **Films.** `npm run films`: all four pass.
  - 30 s: 1890 frames, -16.7 dB. Its WhatsApp copy: 947 frames, -16.7 dB.
  - 51 s: 3060 frames, -16.7 dB. Its WhatsApp copy: 1532 frames, -16.8 dB.
  - All start at 0.00 s, with no decode errors and no held picture.
  - The 51 s film's decoded sound, and its WhatsApp copy's, is bit-identical to dbb35cf's.
  - Compared with dbb35cf at 4 frames a second, the picture changes only between 9.25 s and 12.5 s, which is the menu scene.
- **My probes** (scratchpad r9/critic/):
  - probe/grain.js with probe/names.json, probe/menu.js, probe/onetap.js, probe/words.js and probe/side.js;
  - ui/ask.js, which serves the built page with the mock engine.

## Findings, most serious first

1. **The grain test still passes grain-free orders and plates (owner rule 3; A14; blocks).**
   - **The menu path is the clearest case (src/v6/engine.js:421).**
     - The order counts as keeping its grain when the dish name, the portion line or the side names a grain. A portion line that tells the person to skip the grain also counts.
     - My probe (probe/menu.js, diabetes, lunch, typed menu, no side): every one of these orders is offered:
       - "Paneer Tikka | 6 pieces, ≈ 220 g, no naan"
       - "Butter Chicken | 1 bowl, ≈ 250 g, skip the rice"
       - "Dal Tadka | 1 bowl, ≈ 300 g, without roti"
       - "Lettuce Wraps | 3 wraps, ≈ 220 g, in place of roti"
     - The menu prompt asks the model to name the grain "in with or in portion" (engine.js:348). So the portion line is where the model writes about the grain, including when it advises leaving the grain out for weight loss.
     - Menu dishes "Veg Biryani with Cauliflower Rice" and "Biryani - Cauliflower Rice" are also offered with no side. So is "Moong Dal Dosa".
   - **Plates and base swaps (src/v5/core.js:97, used at core.js:155 and 166).**
     - Splitting on "with", "and", commas and " - " fixed the names in the fixed list. The same split now treats the dish word before a stand-in as a grain of its own.
     - Each name below is accepted as the only grain on a diabetes dinner plate, and offered as a base swap (probe/grain.js on hosted/v6/index.min.html):
       - **A dish word before "with" or "made with":** Paneer biryani with cauliflower rice; Veg pulao with cauliflower rice; Pulao made with cauliflower rice; Khichdi with sabudana; Upma made with sabudana; Roti made with almond flour; Noodles made with konjac.
       - **A stand-in followed by a comma or dash:** Cauliflower rice, pulao style; Cauliflower rice - pulao; Sabudana, khichdi style.
       - **Riced or grated cauliflower:** Riced cauliflower pulao; Grated cauliflower pulao; Cauliflower (rice).
       - **Legume dishes named like a grain:** Moong dal dosa; Moong dal idli; Moong dal pasta; Moong dal noodles; Chickpea-based pasta; Lentil-based pasta; Pasta made from chickpeas; Soybean noodles; Green pea pasta.
       - **Vegetable noodles and rice not in the list:** Carrot noodles; Beetroot noodles; Mooli noodles; Turnip rice; Tofu noodles; Zucchini and carrot noodles. The same words in the other order, "Carrot and zucchini noodles", are dropped.
       - **Grain words in a negation:** Paneer tikka, no roti; Dal without rice; Palak paneer, skip the naan; Lettuce wrap instead of roti; Cauliflower pulao (no rice).
       - **Grain words that name a coating or an ingredient:** Rava-crusted paneer; Bread-crumbed paneer cutlet; Rice vinegar cucumber salad.
       - **Others:** Almond bread; Chia bread; Makhana khichdi.
   - **Judgement calls I do not count against the build:** Besan roti, Glass noodles, Gobi rice, Cauliflower fried rice and Vrat ki khichdi.
   - **No true grain was lost.** All 21 in the fixed list and the 86 true grains I tried still count, apart from five that GRAINW has never held: Thalipeeth, Puri, Bhatura, Idiyappam and Bisi bele bath. Those are dropped, which is the safe direction.
   - **Why it matters:** with diabetes the grain stays. These names and portion lines are the ordinary way a model writes a low-carb Indian meal or an order with less bread. Each round adds the names the Critic found, and the next way of writing the same dish gets through.
   - **Smallest correction:**
     - Take negation phrases out before the grain test (NEG already exists at core.js:85; add "instead of" and "in place of"). On the menu, count the grain only from the dish name or the side, not from the portion line.
     - When any part of a name holds a stand-in, do not count a dish word (pulao, biryani, khichdi, upma, poha, noodles, pasta, dosa, idli) in another part. Count only a grain itself with its amount, such as "2 roti" or "brown rice".
     - Add these stand-ins: riced, grated or shredded cauliflower or broccoli; "-based" and "made with" or "made from" before a stand-in; dal, besan or a legume before dosa, idli, roti, chilla, pasta or noodles; the missing vegetables, tofu and paneer before rice or noodles.
     - Put these names in the fixed lists in test/rules/check.js, and add menu cases with "no naan" in the portion line.
     - A sturdier route, for the owner to weigh: ask the model for the grain item as its own field (food and grams) and check that field against a list of grains, instead of reading it out of a dish name.

2. **A one-tap change can tell the person to take the grain off (owner rule 3; blocks; not covered by A14).**
   - **What the code checks:** with diabetes, only "Gentler on sugar" is screened, and only for "no, skip, remove, drop or without" followed by rice, roti, grain, millet or carb (core.js:173).
   - **My probe (probe/onetap.js, diabetes dinner, fixture plate with foxtail millet khichdi):** every one of these notes is offered:
     - Gentler on sugar: "Skip the khichdi tonight and double the palak."
     - Gentler on sugar: "Swap the millet khichdi for a bowl of cauliflower rice."
     - Gentler on sugar: "Replace the khichdi with lettuce cups and more paneer."
     - Gentler on sugar: "Have sauteed vegetables instead of the khichdi."
     - 10-minute version: "Pan-fry the paneer and skip the khichdi."
     - More protein: "Leave out the khichdi and add 50 g more paneer."
     - Easy on the gut: "Drop the khichdi and have a bowl of moong soup."
   - **The plate's numbers follow the note.** The note's carb change may be as low as -80 g, which takes the fixture's 44 g of carbs to 0 g on screen.
   - **The model does write such notes.** In eval/v6/results-live1.json, on a profile without diabetes, a "Gentler on sugar" note reads "Swap one phulka for an extra bowl of diced cucumber, carrot, and onion". On a diabetes plate with one phulka, the same note would remove the grain.
   - **Why it matters:** round 6 closed this path for base swaps. One-tap changes are the other tap that changes the plate, and the film's beat 5 shows one being tapped.
   - **Smallest correction:**
     - With diabetes, drop any one-tap note, of all four kinds, that removes or replaces a grain word. Use the full grain list (GRAINW), with negations and swap, replace, "instead of" and "in place of".
     - Keep the carb change from going below the plate's grain share.
     - Add the case to A14 and plant it in check.js.

3. **The menu order's "with" line is shown unscreened after the menu name (owner rule 4; A17; blocks).**
   - **What the code does:** the side text is checked only through sideName(), which keeps what comes before the first comma, bracket or semicolon (engine.js:309-310, used at 419). The whole string is shown.
   - **My probe (probe/side.js, the typed fixture menu):** each of these is shown as the order's "with" line:
     - "1 Tandoori Roti, a R-E-A-L treat"
     - "1 Tandoori Roti (S-M-A-R-T-L-Y charred)"
     - "2 Tandoori Roti; Q-U-I-E-T-L-Y filling"
     - "1 Tandoori Roti, C-U-R-A-T-E-D"
   - **The rules check cannot see this.** It leaves ".with" out of the word check as a whole (test/rules/check.js:123). This is the same blind spot ".place" had in round 8.
   - **Smallest correction:**
     - Use own(d["with"], 60, c.text) for typed menus, so a word stays only when the typed menu has it. Or screen the part of the side after the menu name with clean().
     - In check.js, plant a word after the side's menu name.

4. **A failed ask, with plates on screen, loses what the person typed and offers no Try again (A13; B6; blocks as a usability defect on a common path).**
   - **My probe (ui/ask.js, 360 px, plates on screen):** I typed "something light with paneer" and the meals call failed.
     - For busy, upstream_error, unparsed and network, the note reads, for example, "Next Plate is busy just now. Try again in a minute. Showing your last plates."
     - There is no Try again button, and the ask box is empty. Screenshot: ui/360-ask-busy.png.
   - **Cause:** the composer is rebuilt on every render (src/v6/app.js:323-327, 368). The note on the plates path has no button (app.js:350).
   - **Why it matters:** these readers type slowly, one-handed, and are told to try again with nothing to tap and nothing kept. A13 asks for Try again where it can help, and for the typed words to stay in their box.
   - **Smallest correction:**
     - Keep the asked text, and put it back in #askin after an error.
     - For codes where a retry can help, add a Try again button to that note that re-sends the same ask.
     - Add a review state, plate-ask-busy.

## Cosmetic (all listed; none blocks on its own)
- **Word forms the screen lets through.** clean() still passes these forms of the owner's words: P-E-R-S-O-N-A-L-I-S-A-T-I-O-N, C-U-R-A-T-I-O-N, C-U-R-A-T-I-N-G, T-A-I-L-O-R-made, T-A-I-L-O-R-I-N-G, T-R-A-N-S-F-O-R-M-A-T-I-O-N-A-L, game-C-H-A-N-G-I-N-G, S-M-A-R-T-N-E-S-S and J-O-U-R-N-E-Y-I-N-G. Matching the stems would close this.
- **own() keeps the model's own use of a typed word.** It keeps a banned word in the model's own phrasing whenever the person typed that word anywhere. Example: "A R-E-A-L treat: biryani" is kept for the typed "biryani, the R-E-A-L one".
- **The Rescue fallback name can be a whole sentence.** When the model's name is dropped, the person's whole typed sentence becomes the dish heading, cut at 80 characters. Example: "I'm at a wedding and there is mutton biryani, paneer tikka, naan and gulab…".
- **A word form in a research note.** docs/film/RESEARCH-ad-films.md:14 has T-R-A-N-S-F-O-R-M-A-T-I-O-N, describing other apps. The sweep matches base words only, so it does not see this.
- **Photo menus are not checked against anything.** Their dish names, sides and leave names are taken as copied from print, so a word printed on a menu stays. I accept this exception, since there is no typed menu to check against.
- **Leftover screenshots.** Eight files at 320 px are left over from older review runs.
- **D6 holds.** The 30 s film is unchanged since 1619367.
- **The film's menu order came from the older core.** It still passes the current core: Paneer Tikka with 1 Tandoori Roti, "Ask: No butter brushed on top, extra lemon wedges and onion rings", Fit 90 / 100, Gentle. It keeps a grain (the roti side) and carries no banned word. The live engine still runs baa5e08's core, as the builder says.

## Round 8 findings, judged on my own evidence
| Item | Status | Evidence |
|---|---|---|
| 1 Grain stand-ins | PARTLY RESOLVED | Every name in my round 7 and round 8 lists is now dropped, and the 41 stand-ins and 21 true grains in check.js hold. Ordinary rewordings, negations and the menu portion line still pass (finding 1). |
| 2 Four model fields skip the word screen | RESOLVED, with one new field | The place uses clean() (engine.js:426). The Rescue name and the log title and foods use own() with the typed text (core.js:192, engine.js:297, 299). The listed word forms are caught. The 8 new checks fail on dbb35cf and pass now. The menu "with" line is open (finding 3). |
| 3 Limit note said twice | RESOLVED | It now reads once: "That's today's limit for new plates. New plates open again at 5:30 am. Showing your last plates." (320-light/plate-ask-limit-1.png; ui/360-ask-limit_day.png). |
| bad_request line | RESOLVED | "Next Plate couldn't read that. Close it and open your link from WhatsApp again." It offers no Try again. |
| Unreadable menu speaks as "I" | RESOLVED | "Next Plate couldn't read that menu. Try a clearer photo, or type the dishes." (320-light/menu-unreadable-2.png). |
| Disabled one-tap changes give no reason | RESOLVED | "Not offered for this plate: More protein, 10-minute version, Easy on the gut." It sits under the buttons and is legible at 320, 360 dark, 390, 412 and 130 % (320-light/plate-leave-two-3.png). |
| Whole-file word exception | RESOLVED | Each of the 14 lines marked "// planted on purpose" in check.js plants a word into a model reply or a prompt check (lines 93-134). |
| Old film sources outside the sweep | RESOLVED | promo, promo2 and promo3 are swept. Their comments were reworded. The 37 exceptions are the rule itself, a quoted record of rejected narration (each under a "Record of a rejected" header or in the rejected film's own source), a web address, or a cited constant name. None hides a defect. |
| Portion line in the film's order card | RESOLVED | "6 pieces, ≈ 220 g" sits at the size of the side line, upright and in ink. In the WhatsApp copy at 11.8 s it is about as large as "with 1 Tandoori Roti". In the app it is .por at 18 px (320-light/rescue-menu-order-2.png). |

## Checked and holding
- **Safety referral.** Kidney condition and pregnancy are referred, never planned, on Plate, Builder and Rescue at 320, 360, 390 and 412, in light and dark and at 130 % text. The rules check confirms it in the core.
- **Owner rule 2.** After-meal rise is shown only as a band (Gentle, Moderate, Sharp). Grams and kcal throughout. No katori or phulka as units. No supplements.
- **Diff dbb35cf..f99e183.**
  - No safety line or label was removed, no focus handling changed, and no new fixed width breaks 320.
  - New CSS: .tnote spans the grid; .por is 18 px.
  - One engine behaviour changes on purpose: a Rescue reply whose name is dropped now shows the person's typed words, where before it showed "empty".
- **One look.** I viewed every state at 320 light, 360 dark, 390 light, 412 light and 360 light at 130 %, plus the changed states at full size.
  - A pixel comparison of light against dark, at 320, 360, 390 and 412, differs only in toasts, the caret and italic anti-aliasing. Dark mode keeps the paper, so 320 dark matches the 320 light screens I viewed.
  - Raw Linen holds across tabs and states. Error, limit and blocked states say what happened and what to do, apart from finding 4.
- **The 51 s film, checked at every beat.** I took 33 frames of the WhatsApp copy, from 1 s to 50.5 s.
  - The cards and screens follow docs/film/SCRIPT-features.md.
  - The end card reads NEXT PLATE, "Made for you." and "Reply "plate" for your link.".
  - The audio is unchanged from the approved mix.
- **The 30 s film.** I took 12 frames from its WhatsApp copy. It is unchanged since 1619367.
- **WhatsApp post.** docs/film/WHATSAPP-post.md is unchanged, has no banned word and invents no figure.
- **The builder's claims I could check hold:**
  - the fingerprint;
  - 8 failures on the old page;
  - 396 checks with 0 violations;
  - the films' frame counts and levels;
  - 37 word exceptions.

## Not inspected
- The owner's own phone, and whether clients understand the screens.
- Live Gemini text under the new code. There were no new live runs; I read the recorded replies in eval/.
- The sound by ear. No transcript was supplied this round.
- Railway variables and the public page. I did not confirm that the live engine was put back after the menu re-capture.
- The v5 screens. hosted/v5/index.min.html passes the rules check, but its screens are not in the review.
- Photo input for Rescue and the meal log. The app sends no photo there today.
