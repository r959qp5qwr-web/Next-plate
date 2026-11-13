VERDICT: FAIL
BUILD: c4bf9d700d526cbaab5b91a17daf6ffbf3a2c71812a6b19124189f36fd5d7228

# Critic, round 8 (diff 5826d07..dbb35cf; the three built pages; both films and their WhatsApp copies; every note; the gate)

I measured, rendered, probed and viewed everything below myself. The builder's notes and commit messages were claims to check, not evidence.

Most of round 7 is fixed. The chips wrap again, the prompts no longer use the banned words, most model text is screened, and the limit lines say when plates come back. The verdict is still FAIL, for two reasons:
- **The diabetes grain check still passes grain-free dishes (owner rule 3).**
  - A stand-in name followed by a dish word gets through: "cauliflower rice pulao" or "cauliflower rice biryani" counts as a grain.
  - Two names from my round 7 list still pass: lauki noodles and cauliflower upma.
  - Indian fasting dishes made without grain also pass, for example sabudana khichdi.
- **Four fields the model writes still skip the banned-word screen (owner rule 4).**
  - The menu's "Read as:" line is the model's own description of the place, and it is shown unscreened.
  - The Rescue dish name and the meal log's title and foods are also written by the model. Nothing checks that they use only the person's words.

## What I measured
- **Pages are current.** I rebuilt the three pages in a scratch copy. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html are byte-identical to the committed files. The working tree is clean at dbb35cf.
- **Fingerprint.** It was c4bf9d70... before I measured and is the same after.
- **Drill.** `npm run drill`: "every planted fault was caught".
- **Review.** `npm run review`: 9 runs x 43 states = 387 checks, exit 0.
  - report.json: 0 violations, 0 state errors, 43 states in each of the 9 runs.
  - The served page (`--page hosted/v6/index.min.html`, output in my scratchpad r8/critic/review-min): 387 checks, 0 violations, 0 errors, exit 0.
  - 16 files at 320 px are left over from older runs (for example plate-hero-10.png). I did not use them.
- **Exceptions.** test/ux/allow.json is `[]`.
- **Rules.** `npm run rules`: every check holds on all three pages. The same check on the page from 5826d07 fails 12, which matches the builder's account.
- **Words.** `npm run words`: no hits outside the 22 exceptions (31 notes, 8 app files, 45 code files).
- **Films.** `npm run films`: all four pass.
  - 30 s: 1890 frames, -16.7 dB. Its WhatsApp copy: 947 frames, -16.7 dB.
  - 51 s: 3060 frames, -16.7 dB. Its WhatsApp copy: 1532 frames, -16.8 dB.
  - All start at 0.00 s, with no decode errors and no held picture.
  - The 51 s film's decoded sound, and its WhatsApp copy's, is bit-identical to 5826d07's.
  - The picture differs from the old cut only between 10.25 s and 12.5 s (compared at 4 frames a second), which is the re-captured menu scene.
- **My probes** (scratchpad r8/critic/):
  - grain.js, words.js, limit/limit.js and chips/chips.js.
  - My round 7 r7/probe/grain.js, run again on the new page.

## Findings, most serious first

1. **The diabetes grain check passes grain-free dishes (owner rule 3; A14; round 7 finding 2 still partly open; blocks).**
   - **What the code does:** isGrain (src/v5/core.js:95) deletes the stand-in phrase (STANDIN, core.js:94), then tests what is left against GRAINW. When a dish word follows the stand-in, that word is left behind, and GRAINW counts it as a grain.
   - **Where it is used:** on plates (core.js:141), on base swaps (core.js:152) and on menu orders (src/v6/engine.js:421).
   - **My probe (r8/critic/grain.js on hosted/v6/index.min.html, diabetes, dinner).** Each name below is offered as a base swap, and is also accepted as the only grain on a plate:
     - A listed stand-in followed by a dish word: Cauliflower rice pulao, Cauliflower rice biryani, Cauliflower rice khichdi, Cauliflower rice upma and Broccoli rice pulao.
       - On the menu path, a typed menu line "Cauliflower Rice Biryani" with no side is offered as the order.
     - Names from my round 7 finding that still pass: Lauki noodles and Cauliflower upma (r7/probe/grain.js, run again). Neither is in the fixed list in test/rules/check.js.
     - Names of the same kind that the list misses: Zero-carb noodles, Miracle noodles (a konjac brand), Hearts of palm pasta (the plain name for palmini), Chickpea pasta, Red lentil pasta and Oopsie bread.
     - Fasting dishes made with no grain: Sabudana khichdi, Sabudana upma, Sago khichdi, Singhare ki roti and Water chestnut flour roti.
       - These matter most for this audience: a client with diabetes may ask for a vrat (fasting) dinner.
     - Judgement calls I do not count against the build: Besan roti, Glass noodles, Gobi rice and Cauliflower fried rice.
   - **Why it matters:** with diabetes the grain stays. A low-carb Indian dinner from the model is likely to be named "cauliflower rice pulao" or "cauliflower rice biryani". The check would pass that plate as keeping its grain.
   - **Smallest correction:**
     - When STANDIN matches, treat the item as not a grain, rather than testing what is left.
     - Add these stand-ins:
       - lauki, bottle gourd and doodhi (also before upma and poha);
       - zero-carb and miracle;
       - hearts of palm;
       - chickpea, lentil and bean pasta or noodles;
       - sabudana, sago and tapioca;
       - singhara, singhare and water chestnut;
       - flax.
     - Put every name above, and the names from my round 7 list, in the fixed STANDINS list in test/rules/check.js.

2. **Four fields the model writes still skip the banned-word screen (owner rule 4; A17; blocks).**
   - **The place on the menu card.**
     - The code: engine.js:426 uses `quoted(r.place,40)`.
     - The menu prompt asks the model for "the kind of place this menu looks like". That is the model's own description, not a name copied from the menu. Recorded live values include "Modern cafe", "Pizzeria" and "office canteen".
     - It is shown as "Read as: <place>." (src/v6/app.js:493; 320-light/rescue-menu-order-5.png reads "Read as: North Indian restaurant.").
     - My probe (r8/critic/words.js) planted three places, and each one reached the page: "S-M-A-R-T casual North Indian restaurant", "A R-E-A-L Punjabi dhaba" and "C-U-R-A-T-E-D tasting-menu cafe".
     - The rules check leaves ".place" out on purpose (test/rules/check.js:100), so it cannot see this. That exception hides the defect.
   - **The Rescue dish name, and the meal log's title and item foods.**
     - The code: core.js:181 and 187, and engine.js:297 and 299, all use quoted().
     - The comments say these are the person's own words, but the model writes them. The prompt asks for "dish: name" and for "title (the meal in at most 7 words)", and nothing checks the result against what was typed.
     - My probe, Rescue: the person typed "mutton biryani"; the model's name "A R-E-A-L Hyderabadi mutton biryani" is shown.
     - My probe, log: the person typed "2 aloo paratha with curd"; the title "A Q-U-I-E-T, simple home lunch" and the item "S-M-A-R-T paratha" are shown.
   - **The menu names are the right exception.** The prompt asks for as_written, "with" and leave names copied letter for letter, and typed menus are checked with onMenu (engine.js:412). A photo menu has no such check, but there the model is copying printed text.
   - **The word forms are only partly covered.**
     - clean() lets through U-N-L-O-C-K-E-D, E-M-P-O-W-E-R-E-D, M-A-G-I-C-A-L-L-Y, S-M-A-R-T-L-Y, Q-U-I-E-T-E-R and the noun form of T-R-A-N-S-F-O-R-M.
     - It catches the forms ending -S, -ING and -ED that the builder listed.
   - **Not seen live:** none of the 63 recorded live place values and no recorded name or title carries a banned word. The path is still open, and the rule allows no exceptions.
   - **Smallest correction:**
     - Use `out.place=clean(r.place,40)`.
     - For the Rescue name and the log title and foods, keep a banned word only when the same word is in what the person typed (c.text). Otherwise use clean().
     - Plant a word in place, in the Rescue name and in the log title, using words the person did not type, and drop ".place" from the exemptions in check.js.
     - Optionally, match the stems for those six words.

3. **The limit note repeats itself on Plate when plates are showing (minor; B7; new this round).**
   - **What the person sees:** with plates on screen, an ask that hits the daily limit shows "That's today's limit for new plates. New plates open again at 5:30 am. Your last plates are still here. Showing your last plates." (r8/critic/limit/360-ask-limit.png).
   - **Cause:** app.js:64 adds "Your last plates are still here.", and app.js:349 then appends " Showing your last plates.".
   - **Smallest correction:** keep one of the two sentences.

## Cosmetic (all listed; none blocks on its own)
- **The bad-request line.** It reads "Next Plate couldn't read that. Reload the page, then try again." In WhatsApp's in-app browser, reload sits in a menu. "Open Next Plate again from your coach's link" fits these readers better. Correctly, it offers no Try again (probe limit.js).
- **The unreadable-menu line speaks as "I"** ("I could not read that menu", app.js:449). Every other error speaks as Next Plate.
- **Disabled one-tap buttons give no visible reason.** On the plate with two foods left out, three of the four one-tap buttons are disabled. The reason is only in a title tooltip (app.js:282), which phones do not show (320-light/plate-leave-two-3.png).
- **A whole-file word exception.** test/words/allow.json excepts test/rules/check.js as a whole file. Today every hit in it is a planted string or the list itself (lines 66-111, checked). A later comment there would pass unseen; excepting by line would be tighter.
- **Old film sources outside the sweep.** The rejected films (demo/reel/promo, promo2 and promo3: film.js, lib/motion.js, vo.js and audio/place.py) still carry the words, in comments and in rejected narration. They are not shipped and not part of the current films.
- **The 51 s film, menu beat: the portion line is the smallest on the card.** "6 pieces, ≈ 220 g" is the "how much to have" that the voice names. In the WhatsApp copy it is about 9 px tall on a 360 px wide phone, at 11.8 s.
- **The film's menu order came from the older core.** The live engine ran baa5e08's core, as the builder says. The order shown passes the current core's checks too: Paneer Tikka with 1 Tandoori Roti, the Ask line and Fit 90 / 100. It has no banned word and keeps a grain (the roti).
- **D6 holds.** The 30 s film is unchanged since 1619367, so its music swells are approved work.

## Round 7 findings, judged on my own evidence
| Item | Status | Evidence |
|---|---|---|
| 1 Banned words in model text | MOSTLY RESOLVED | The 12 new checks pass, and fail on 5826d07. Every prompt (meals, tune, Rescue, menu, log) carries the list and no longer uses the words. Four fields remain (finding 2). |
| 2 Grain-free stand-ins | PARTLY RESOLVED | All 22 names in the fixed list are dropped. Of the names in my round 7 list, the earlier ones (Cauliflower rice, Zucchini, Shirataki, Konjac, Cauliflower roti, Almond flour roti, Keto bread, Broccoli rice, Cabbage noodles) are dropped. Lauki noodles and Cauliflower upma still pass. See finding 1. |
| 3 Chips cut off on short screens | RESOLVED | chips.js, 320x568, dairy and nuts left out: the chips run from x=45 to 275 on the first row and 83 to 237 on the second, inside a card from 32 to 288. At 360x592 they also stay inside. Page width equals the viewport. plate-leave-two wraps cleanly at 320, 360 dark, 390, 412 and at 130 %. |
| 4 Limit and bad-request lines | RESOLVED, with finding 3 | Plate: "That's today's limit for new plates. New plates open again at 5:30 am." (320-light/plate-limit-1.png). Rescue: "That's today's limit for Next Plate. It opens again at 5:30 am." On a New York clock it reads "7 pm". Both match the server's UTC-date reset (src/v5/server.ts:54). bad_request has its own line and no Try again. |
| Selected-tab bar | RESOLVED | The bar sits under the label at 320x568 on every tab. |
| Loading card at 320x568 | RESOLVED | The plate is centred and the wait line is in view (320-light/plate-loading-1.png). |
| "Remove my data" | RESOLVED | Both buttons stay whole on one row at 320, 360, 390 and at 130 % (sheet-data-confirm-1.png). |
| D5 stamp | RESOLVED | The stamp is aria-hidden (src/v5/app.js:172), and the record now says it is a brand mark. |
| Words in code comments | RESOLVED for the swept scope | Old film sources are listed under Cosmetic. |
| Handoff "Live now" row | NOT VERIFIED | I did not read Railway or the public page. |
| "fit 80" in lower case | RESOLVED | It now reads "Fit 80 / 100" (320-light/rescue-menu-order-3.png). |

## Checked and holding
- **Safety referral.** Kidney condition and pregnancy are referred, never planned, on Plate, Builder and Rescue at 320, 360, 390 and 412, in light and dark and at 130 % text. The rules check confirms it in the core.
- **Owner rule 2.** After-meal rise is shown only as a band (Gentle, Moderate, Sharp). Grams and kcal throughout. No katori or phulka as units. No supplements.
- **Diff 5826d07..dbb35cf.**
  - No safety line or label was removed, no focus handling changed, and no new fixed width breaks 320.
  - Engine changes: the word screen with quoted(), isGrain, prompt wording, and a one-tap change now needs both its suffix and its note.
  - App changes: the limit lines, the bad-request line and the "Fit" label.
  - CSS changes: the short-screen block now applies only once a plate has arrived, the chips wrap, the tab height is restored, and the confirm buttons stay whole.
- **One look.** I viewed every state at 320 light, 360 dark, 390 light, 412 light and 360 light at 130 %. Raw Linen holds throughout.
  - A pixel comparison of light against dark, at 320, 360, 390 and 412, differs only in toasts, the caret and animation. Dark mode keeps the paper.
  - Contrast and touch targets: 0 violations, as measured.
- **Word exceptions.** All 22 are the rule itself, a quoted record, a web address or the cited constant name. The whole-file entry is listed under Cosmetic.
- **The 51 s film, checked at every beat.** I took 35 frames across the cut, plus the changed range at 4 frames a second, from both the master and the WhatsApp copy.
  - The cards and screens follow docs/film/SCRIPT-features.md.
  - The date reads "Thu, 12 Nov" both before and inside the re-captured scene.
  - The end card shows NEXT PLATE, "Made for you." and "Reply 'plate' for your link."
- **The 30 s film.** I took 12 frames from its WhatsApp copy, at every beat. It is unchanged since 1619367.
- **The builder's claims I could check hold:**
  - the fingerprint;
  - 12 failures on the old page;
  - 387 checks with 0 violations;
  - films at 3060 frames and -16.7 dB.

## Not inspected
- The owner's own phone, and whether clients understand the screens.
- Live Gemini text under the new prompts. There were no new live runs; I read the recorded replies in eval/.
- The sound by ear. No transcript was supplied this round.
- Railway variables and the public page, so I cannot confirm the handoff's "Live now" row.
- The v5 screens. hosted/v5/index.min.html passes the rules check, but its screens are not in the review.
- Photo input for Rescue and the meal log. The app sends no photo there today.
