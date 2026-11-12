VERDICT: FAIL
BUILD: 753555b5752faf632b0aca7befaa34c21cb4466a328cc21179238ced68ab75d1

# Critic, round 7 (diff d8f62ae..5826d07; both v6 pages and the v5 page; both films and their WhatsApp copies; every note; the gate)

I measured, rendered, probed and viewed everything below myself. I checked each builder claim against the source, the screens and my own probes; the commit messages are not evidence.

The round 6 fixes mostly hold: the 51 s film has its picture, the cauliflower mash swap is gone, the handoff note is clean, and Try again now follows the error. The verdict is still FAIL, for three reasons:
- The model's own sentences, shown to clients, carry the owner's banned words in about one live reply in four (owner rule 4). This is old; I missed it in rounds 1 to 6.
- The diabetes grain guard counts "cauliflower rice", "zucchini noodles" and similar grain-free dishes as grains (owner rule 3). This round's swap fix rests on that word list, and round 6 named cauliflower rice as the case to stop.
- This round's short-screen layout cuts the plate's chips off at both card edges on a 320 px phone for anyone who leaves out a food (A2).

## What I measured
- **Pages are current.** I rebuilt all three pages in a scratch copy with the repo's esbuild 0.24.2. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html came out byte-identical to the committed files. The working tree is clean.
- **Drill.** `npm run drill`: "every planted fault was caught".
- **Review.** `npm run review`: 9 runs x 42 states = 378 checks, exit 0.
  - report.json: 378 entries, 0 violations, 0 state errors, 42 states in each of the 9 runs.
  - My run rewrote the screens (17:32 to 17:39). A few files at 320 px are left over from older runs with more pages (for example plate-hero-10.png); I did not use them.
  - The served page (`--page hosted/v6/index.min.html`, output in my scratchpad): 378 checks, 0 violations, exit 0.
- **Exceptions.** test/ux/allow.json is `[]`.
- **Rules.** `npm run rules`: 15 checks hold on each of the three pages. The same check on the page from d8f62ae fails 7, so it catches the round 6 fault.
- **Words.** `npm run words`: no hits outside the 13 exceptions (31 notes, 5 app files). I judged each exception (see "Checked and holding").
- **Films.** `npm run films`: all four pass.
  - 30 s: 1890 frames from 0.00 s at 60 fps, -16.7 dB. Its WhatsApp copy: 947 frames at 30 fps, -16.7 dB.
  - 51 s: 3060 frames from 0.00 s at 60 fps, -16.7 dB. Its WhatsApp copy: 1532 frames at 30 fps, -16.8 dB.
  - None has decode errors or a held picture.
  - I ran the same check on the two broken round 5 files from 10076d3. It fails both: "video starts at 48.85 s; 129 frames" and "picture frozen for 48.9 s".
- **Fingerprint.** It was 753555b5... before I measured and is the same after.
- **My probes** (scripts in my scratchpad, r7/probe/):
  - grain.js runs the built page's core on grain-free base swaps and plates.
  - chips.js renders the plate with food rules on short screens.
  - errors.js fails every API with each server code on every surface.
  - livewords.js, livecount.js and livefields.js read the recorded live Gemini replies in eval/.

## Findings, most serious first

1. **The owner's banned words reach clients through the model's sentences (owner rule 4; automatic FAIL).**
   - **Where:**
     - "Why this plate, today" on every plate (src/v6/app.js:349-350, m.forYou).
     - The read line on an asked plate (app.js:344).
     - The pairing reasons and the one-tap notes.
     - The live v5 screens show the read line, "for you" text and the one-tap notes from the same core.
   - **Evidence, from the recorded live Gemini runs in the repo (eval/v6/results-live*.json, 7 files, 88 plate replies, 263 meals):** 24 replies carry a banned word in a field the app shows.
     - By field: 10 read lines, 13 "for you" lines, 3 pairing reasons and 1 one-tap note.
     - By word: Q-U-I-E-T 22 times; S-I-M-P-L-Y 2; Q-U-I-E-T-L-Y 1; R-E-A-L 1; T-A-I-L-O-R-E-D 1.
     - Examples:
       - results-live-final.json reply 8, read: "For a Q-U-I-E-T desk day dinner, ...".
       - results-live2.json: "... to settle your evening Q-U-I-E-T-L-Y."
       - results-live3.json, a pairing reason: "... to satisfy R-E-A-L hunger ...". This echoes the prompt's own line at src/v6/engine.js:104, "Expect R-E-A-L hunger".
     - The v5 runs (eval/v5) show the same pattern: 15 "for you" lines, 7 read lines and 5 one-tap notes.
   - **Code:**
     - Only taste notes are screened for the owner's words (engine.js:279, NOTTASTE).
     - for_you (engine.js:272) and the read, pairing, one-tap, Rescue and menu text are screened for claims, supplements and diet only.
     - The prompts themselves use R-E-A-L (engine.js:104, 191, 222; core.js:225), which invites the model to say it back.
   - **Why it matters:** the owner banned these words in anything a client reads. They read as machine-written, and here they come from the app itself.
   - **Not new:** every round from 1 to 6 listed live Gemini text as "not inspected", but these recorded replies were in the repo. I missed them.
   - **Criteria:** owner rule 4; B7; A15. The word check covers notes and five app files, not model output.
   - **Smallest correction:**
     - Apply one test with the owner's list, as for taste notes, to every model string the app shows: read, for_you, why, one-tap suffix and note, Rescue breakdown, warning and moves, the menu's portion, "with", "ask" and "why", and the log title and "assumed". On a hit, drop that field or item.
     - Take R-E-A-L out of the prompt lines, and add one prompt line that lists the words not to use.
     - Add a case to test/rules/check.js: a reply whose for_you says "a Q-U-I-E-T desk afternoon" must show no "for you" line.
     - Clients see the fix only after the owner's "Deploy.".

2. **The diabetes grain guard counts grain-free dishes named after a grain (owner rule 3; round 6 finding 2 only partly resolved; major).**
   - **What the code does:** the new swap filter (src/v5/core.js:137-138) and the plate check (core.js:127) both trust GRAINW, a list of words. Any food with "rice", "noodles", "roti", "bread" or "upma" in its name passes.
   - **My probe (r7/probe/grain.js on hosted/v6/index.min.html, diabetes, dinner):**
     - Base swaps offered: Cauliflower rice, Zucchini noodles, Shirataki noodles, Konjac rice, Cauliflower roti, Almond flour roti, Keto bread, Broccoli rice, Cabbage noodles, Cauliflower upma and Lauki noodles.
     - A plate whose only base is "Cauliflower rice", "Zucchini noodles" or "Almond flour roti" passes the grain check as having a grain.
     - The menu check (engine.js:420) uses the same list.
   - **The new check cannot see this.** test/rules/check.js:339 judges the swaps with the page's own GRAINW.
   - **Round 6 named this case.** Its finding 2 said "a live reply such as cauliflower rice passes too". My suggested correction (filter by GRAINW) would not have stopped it either; that was my error.
   - **Not seen live:** the 247 recorded live meals with base swaps contain none of these names, and the new prompt line asks for a grain or millet. The code guard behind the rule still does not hold for the commonest grain-free substitutes.
   - **Smallest correction:**
     - Write one isGrain(food): GRAINW, and not a grain-free stand-in. For example, exclude /\b(cauliflower|broccoli|zucchini|courgette|cabbage|lauki|bottle gourd|konjac|shirataki|keto|almond flour|coconut flour)\b/i.
     - Use it at core.js:127, core.js:138 and engine.js:420.
     - Give test/rules/check.js a fixed list of these names as its oracle, not the page's own list.

3. **On short screens the plate's chips are cut off when a food is left out (a regression this round; A2; blocks).**
   - **Cause:** src/v6/legible.css:266, `#app .hero-top{gap:2px;flex-wrap:nowrap}`, inside `@media (max-height:600px)`. The chips are centred on one row that does not wrap, and the card clips them.
   - **What my probe showed (r7/probe/chips.js, served page):**
     - 320x568, leaving out dairy: the chips run from x=1 to 319 on a card from 16 to 304.
     - 320x568, leaving out dairy and nuts: "Vegetarian" starts at x=-33 and "10 min" ends at 353. On screen this reads "...tarian" at the left and a clock with no time at the right.
     - 360x592 (a 360 px Android phone in Chrome with its bars, also under 600 px): "Vegetarian" is cut to "egetarian" and the time to "10".
     - Screenshots: r7/probe/chips-crops.png, chips-320x568-veg-2leave.png and chips-360x592-veg-2leave.png.
   - **The review cannot see it.** It seeds one profile with `leave: []`.
   - **Why it matters:** on the smallest phones, every client who leaves out a food loses the diet check mark and the prep time from their plate.
   - **Smallest correction:** drop `flex-wrap:nowrap` from the short-screen block (wrap with a 2 px row gap), and add a review state whose profile leaves out two foods.

4. **The daily-limit and bad-request lines do not fit where they appear (minor; B6, B7).**
   - **The limit line, "That's today's limit for new plates. Your plates so far stay here.", appears in three places where it does not fit:**
     - In Rescue, after a dish check (360-dark/rescue-limit-1.png).
     - In the meal-log sheet (r7/probe/360-log-limit_day.png).
     - On Plate when this meal has no plate yet (320-light/plate-limit-1.png, r7/probe/320-plate-limit_ip.png). Here no plates are in view and the card offers no next step.
   - **Bad request:** it gets the fallback "Couldn't reach Next Plate just now. Check your signal and try again." with no Try again (r7/probe/360-dish-bad_request.png). It blames the signal, and says try again without offering it.
   - **Smallest correction:**
     - One limit line that names when things open again, for example "That's today's limit. Next Plate opens again for you tomorrow."
     - On Plate, point to Builder when there is no last plate.
     - Give bad_request its own line, for example "That didn't go through. Open Next Plate again from your coach's link."

## Cosmetic (all listed; none blocks on its own)
- **The selected-tab bar crosses its label on short screens (a regression this round).**
  - The short-screen block sets the tab to 46 px (legible.css:278), and the v4 bar sits 6 px from the bottom. It now runs through the foot of "Plate", "Builder" or "Rescue".
  - This shows on every screen at 320x568 (zoom: r7/tab320z.png) and at 360x592.
  - Fix: move the bar to bottom:2px in that block.
- **The loading card at 320x568 is unbalanced.** The small plate sits alone at the top left with an empty column beside it, and the wait line sits below (320-light/plate-loading-1.png).
- **"Remove my data" breaks inside its button at 320** (320-light/sheet-data-confirm-1.png).
- **D5 holds for the rim words, the vine and the sprig.** The meal tabs repeat the rim words at full size.
  - The stamp's ring reads "NEXT PLATE · MADE FOR YOU" with "made today" inside. "Made for you" and "made today" appear nowhere else in the app.
  - The stamp is aria-hidden brand ornament, so it carries no information. The record should say that, not that the stamp repeats the masthead.
- **D6 holds.** The 30 s film's decoded audio matches the owner-approved cut (b890035) byte for byte, so the swells are approved work. Listed so the owner knows they remain.
- **The word check's reach.** Strings clients see in src/v6/engine.js and src/v5/core.js are outside its five files: the "planned around" labels and the referral line. None carries a banned word today (my sweep). Model output is outside every check (finding 1).
- **Banned words in code comments.** These are not notes, so the rule as written does not reach them: demo/reel/film5/audio/place.py:4, demo/reel/film5/lib/motion.js:216 and 225, and the src/v6/engine.js:438 comment. Rewording them is optional.
- **The handoff note's "Live now" row may be out of date.** handoff-next-plate.md:122 gives PAGE_REF 5f1d63f; the builder reports baa5e08. I did not read Railway, so I cannot say which is right.
- **"fit 80" is lower case in Also on this menu**, where every other place writes "Fit".

## Round 6 findings, judged on my own evidence
| Item | Status | Evidence |
|---|---|---|
| 1 The 51 s film had no picture | RESOLVED | 3060 frames from 0.00 s; no decode errors; no held picture. 19 frames from the WhatsApp copy, taken at every beat, each show the right card and screen: heavy lunch with the Today note; the menu photo and order card; the log estimate and day tiles; the craving plate in grams; the one-taps with Gentler on sugar pressed; the Builder ring and the curve on Gentle; the ticked meal tabs; the end card "NEXT PLATE / Made for you. / Reply 'plate' for your link." The order of beats matches docs/film/SCRIPT-features.md. The film check is in the gate and catches the old broken files. |
| 2 Diabetes base swap removed the grain | PARTLY RESOLVED | The cauliflower mash swap is gone: the swap lists in plate-swap-open at 320 light, 360 dark and 360 at 130 % show only Foxtail millet khichdi and Hand-pounded brown basmati, and the rules check holds on all three pages. Grain-named stand-ins still pass (finding 2). |
| 3 Banned words in the handoff note | RESOLVED | My sweep of all 31 notes finds only the 13 listed exceptions. |
| 4 Try again by error kind; typed dish kept | RESOLVED | errors.js tried 8 codes on menu, dish, log and Plate. busy, unparsed and upstream_error offer Try again. limit_day, limit_ip, bad_request, bad_key and not_set_up do not. The typed dish, the typed menu and the log text stay in their boxes for every code. The new review states pass next-step. |
| Plate offered Try again at the limit | RESOLVED | No Try again on plate-limit. Its wording is finding 4. |
| Figures breaking from their units | RESOLVED | The plate tiles drop to two columns at 130 % (360-light-big/plate-hero-3.png). The order card shows Energy and Protein over a full-width Rise at 320 and at 130 % (rescue-menu-order-2). Compare rows keep "1185 kcal" together. "Fit 92 / 100" holds. |
| Wraps at 130 % text | RESOLVED | "Next plate (1/2)" and "Try it" stay whole on one row; "I had something else" stays on one line (360-light-big/plate-hero-5.png). |
| First view at 320x568 | RESOLVED, with a regression | The plate sits beside its grams, with the dish name in view (320-light/plate-hero-1.png). The same block causes finding 3 and the tab-bar cosmetic. |
| Ornament text exemption | HOLDS (D5) | See the cosmetic note on the stamp. |
| 30 s film music swells | ACCEPTED (D6) | The audio is identical to the approved cut. |
| S-E-A-M-L-E-S-S in the promo3 treatment | RESOLVED | It now reads "a Raw Linen paper backdrop". |

## Checked and holding
- **Safety referral.** Kidney condition and pregnancy are referred, never planned, on Plate, Builder and Rescue, with "Change my answers". This shows at 320 light, 360 dark, 390 light and 360 at 130 %. The rules check confirms it in the core.
- **Grain on planned plates.** With diabetes, a plate without a grain word is dropped. The note "With diabetes the grain stays on the plate" is shown. Builder can lower carbs to 5 %, but plates planned from it still pass the grain check.
- **After-meal rise.** Shown only as Gentle, Moderate or Sharp, with "The curve is a model of direction, not a blood-sugar reading." Grams and kcal throughout. No katori or phulka as units. No supplements.
- **App text written by the builder.** No banned word in any app string, in either film's on-screen or spoken text, in the film captures, or in the WhatsApp post (unchanged).
- **Word exceptions (test/words/allow.json), each checked in place:**
  - Rule definitions: ux-critic.md lines 25 and 26, promo-film SKILL.md line 26, and handoff rule 13.
  - Rejected narration, quoted under headers that say so: script-v2.md, shotlist.md and promo2 script.md.
  - The handoff correction log rows 18 and 21, and its rejected list.
  - One web address.
  - The constant C-U-R-A-T-E-D_MEALS, quoted from the owner's own file docs/foundation/NutriPulse-Summit-Edition.jsx:128.
  - Each is the rule itself, a quoted record or an address. None hides a defect.
- **Brand line.** "Next Plate. Made for you." closes both films and is on the stamp.
- **One look.** The Raw Linen paper look holds across every state at 320, 360, 390 and 412, in light and dark. A pixel comparison of 320 light against 320 dark differs only in the blinking caret and the animation. Contrast and targets: 0 violations as measured.
- **Diff d8f62ae..HEAD.**
  - No safety line or label was removed and no focus handling changed.
  - The engine changes are the swap filter, "basmati" added to the grain list, and one prompt line in both cores.
  - The builder also edited the Critic definition (step 1 now lists the rules, words and films checks). That adds checks and weakens nothing.
- **The gate.**
  - ux-gate.sh runs the rules, words and films checks before the review.
  - manifest.sh covers every note except this file.
  - This verdict is FAIL, so I did not run the gate, and there is no test/ux/PASSED.

## Not inspected
- The owner's own phone and clients' phones.
- Android font scaling and "force dark" on devices. I simulated them with fonts x1.3 and colorScheme.
- Live Gemini output beyond the replies recorded in eval/. I made no live calls.
  - How often a grain-free stand-in comes back for a diabetes base: none in 247 recorded meals.
  - Whether the reply text is the same today.
- Audio by ear: clipped syllables, pronunciation, how the swells feel. No transcript was supplied.
- WhatsApp's re-compression of the forwarded copies.
- WhatsApp's in-app browser. If it shrinks the page height when the keyboard opens, the short-screen layout may switch on while typing. I could not test that.
- Whether the Stop hook's message reaches the owner.
- The live v5 screens: I did not render them. Finding 1 reaches them through the shared core.
- Screen-reader behaviour beyond the measured names.
- Widths 375, 393 and 430: these have the review's measurements only. I viewed every state's first screen at 320 light, 360 dark, 390 light and 360 at 130 %; all pages of the changed states (plate tiles, swap lists, compare rows, order card, error states); samples at 320 dark and 412 light and dark; and my probe renders.
