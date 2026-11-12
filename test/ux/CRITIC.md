VERDICT: FAIL
BUILD: 0a70ea48491b060690d78c8c836ca4399521287c8322d763365c146b92e340f3

# Critic, round 3 (app diff baa5e08..HEAD, both v6 pages, both films, the WhatsApp post, the gate)

I measured, rendered and viewed everything below myself. The builder's commit messages were not used as evidence.

## What I measured
- Pages are current. I rebuilt them in a scratch copy with the repo's esbuild 0.24.2. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html came out byte-identical to the committed files.
- `npm run drill`: "every planted fault was caught". Its 18 faults cover all 17 rules, and each is matched by its element's text (review.js:166-200).
- `npm run review` on hosted/v6/index.html: 9 runs x 26 states = 234 checks, no violations, no unreached states, no page errors, exit 0.
- I also ran the review on the served page (`--page hosted/v6/index.min.html`, written to the scratchpad): 234 checks, no violations, exit 0.
- test/ux/allow.json is `[]`. There are no exceptions to judge.
- Films: 30 s is 31.5 s and 51 s is 51.0 s, both 1080x1920. Mean level is -16.7 / -16.6 dB (the WhatsApp copies match). In the 51 s mix the voice sits 6-14 dB above the music for every second it speaks (least-squares split of mix.wav into vo/music/sfx). Chimes are present (sfx.wav peaks at -28 dB before mix gain).
- The word timings (film4/vo.js, film5/vo.js) match the approved scripts word for word, with no repeated words.

## Findings, most serious first

1. Owner rule 1 (adopted item "one colour per nutrient"). Rescue answer, every width and scheme.
   - What is wrong: the before/after bars colour by "went up" rather than by nutrient. Protein is drawn olive, while Carbs, Fats and Energy are drawn clay (the `warn` class, src/v6/app.js:526-528). Everywhere else clay means protein, ochre carbs and plum fats.
   - Why it matters: the colour key clients learn on the plate and in Builder is reversed on this one screen.
   - Evidence: test/ux/out/screens/320-light/rescue-result-3.png and 360-dark/rescue-result-2.png.
   - Note: this predates this round. It is still a breach of the adopted item, and the owner should rule on it.
   - Smallest correction: draw each "after" bar in its own nutrient colour, and mark a rise in words or with an arrow next to the value (for example "↑ 122 g").

2. Safety referral card. Plate, Builder and Rescue, every width (minor; round 2 C3 is NOT RESOLVED).
   - What is wrong: the new sentence pastes the option label in, which gives "You told Next Plate about pregnant or nursing." and "...about kidney condition." (src/v6/app.js:172).
   - Why it matters: the one screen a pregnant or nursing client gets reads as broken English. The heading also says "coach and doctor" while the body says only "your doctor".
   - Evidence: my own render at 320, built from the repo's pages and mock: scratchpad extra/320-preg-blocked.png.
   - Why the review missed it: the review has no pregnancy state.
   - Smallest correction: write a fixed sentence for each case: "You said you are pregnant or nursing." and "You said you have a kidney condition." Use the same "coach and doctor" in heading and body.

3. Plate legend uses nutrient names for food weights. Plate hero, every width; both films (minor, B7/B1).
   - What is wrong: under the plate it says "Protein 150 g · Greens 120 g · Carbs 200 g · Fats 30 g". These are the weights of paneer tikka, palak, khichdi and chutney. On the same card the tiles say "Protein 38 g · Carbs 44 g · Fats 23 g" (src/v6/plate.js:3 NUTNAME against app.js:265).
   - Why it matters: a diabetic client reads "Carbs 200 g" as 200 g of carbohydrate. The films repeat it: the 30 s film shows "Protein 250 g" at 13.5 s, then "Protein 24 g" at 18.5 s.
   - Evidence: 320-light/plate-hero-2.png and 390-light/plate-hero-1.png.
   - Smallest correction: label the legend by food, for example "Paneer 150 g · Vegetables 120 g · Grain 200 g · Chutney 30 g", or title it "By weight on the plate" and use food-group nouns ("Protein foods", "Grain", "Fats and seeds", as Builder already does).

4. WhatsApp post privacy line (minor, B12; asked for in scope).
   - What is wrong: docs/film/WHATSAPP-post.md:8 says "Your food log is kept on your phone, not in an account." It says nothing about Google Gemini.
   - What the app actually does: it sends the answers (including diabetes and medicine) and the last three days of meals to Google Gemini every time it plans a plate (src/v6/app.js:39, 49; engine.js:183). The app's own Your data section says so.
   - Why it matters: the post's only privacy statement leaves readers believing their food record never leaves the phone.
   - Smallest correction: add "To plan each plate, your answers and recent meals are sent to Google Gemini; no name is sent."

5. Your data and where-typed notes (minor, B12; round 2 F1 PARTLY RESOLVED).
   - Resolved part: the list of what is sent is now accurate. It covers answers, recent meals, typed text and menu photo, and matches profileOut/fileOut and the engine's three-day list.
   - Remaining problem 1: the trigger is understated. "When you ask for a plate, rescue a dish or read a menu" (app.js:589) leaves out two cases:
     - plates are planned on opening the app with no ask (the plate-loading state);
     - "I had something else" sends the answers and the typed meal (app.js:554).
   - Remaining problem 2: where the text is typed, only the Plate ask box (app.js:355) and the menu photo (app.js:494) say it goes to Google Gemini. The typed Rescue dish, the typed menu and the log sheet (app.js:574) do not.
   - Smallest correction:
     - Change the sentence to "Each time it plans a plate, counts a meal you typed, rescues a dish or reads a menu, Google Gemini receives...".
     - Add one fine line under the Rescue input and in the log sheet: "What you type goes to Google Gemini."

6. Rescue and menu errors (minor, B6).
   - What is wrong: a failed Rescue shows only "Couldn't reach Next Plate just now." It has no Try again button (the Plate error has one), and the dish the person typed is gone: the input is rebuilt empty, and renderRescue never restores UI.rtext.
   - Why it matters: at a restaurant on a weak signal the client must retype the dish with no hint of what to do.
   - Evidence: scratchpad extra/320-rescue-error.png (my render with /api/rescue failing).
   - Smallest correction: keep the typed text in #rin and add a "Try again" button that re-sends it.

7. Enforcement chain residue (minor; round 2 F5 mostly RESOLVED, details below).
   - a) The PASSED shortcut. ux-gate.sh:18 exits 0 whenever test/ux/PASSED holds the current fingerprint, without reading CRITIC.md. PASSED is gitignored, so one shell write passes the gate and leaves no trace in git. The "verdict history in git is the record" only holds if the cached path also checks CRITIC.md lines 1-2.
   - b) Files outside the fingerprint (test/ux/manifest.sh):
     - the WhatsApp copies and posters (demo/*-whatsapp.mp4, *-poster.png), which are the files actually forwarded;
     - hosted/v5/index.min.html, which build6.js rewrites with the new core on every build and which the server serves by default (src/v5/server.ts:24, PAGE_REF main);
     - the gate itself (.claude/settings.json, ux-gate.sh, manifest.sh).
   - Smallest correction: in the cached path, also grep CRITIC.md lines 1-2; add the files listed in b) to manifest.sh.

8. Review evidence gaps (minor, A11/B: process).
   - a) Screens stop at 6 scroll stops (review.js:234). At 320 the Plate page is about 10 screens long, so "Your day", the appetite dial, the ask prompts, the colophon and the fine print are never rendered for part B in any state. I rendered them myself (scratchpad extra/320-plate-full-6..10.png; they hold).
   - b) These app states have no review state:
     - pregnancy referral;
     - Rescue and Builder blocked;
     - Rescue error;
     - menu unreadable / no dish passed;
     - Rescue and menu waits;
     - Builder with no plate.

     Finding 2 slipped through for this reason.
   - c) The view-coverage loop in coverage() is an empty statement (review.js:158), so the tab list is hard-coded, not read from the code as A11 says.
   - Smallest correction: capture every stop; add states for b); make the loop build the tab list.

## Cosmetic (all listed; none blocks on its own)
- C2 not resolved, step 3 (src/v6/app.js:146, 158):
  - "Kept on this phone." appears twice in adjacent blocks;
  - "Four answers" is wrong: the step asks five (sex, age, height, weight, activity).
- C5 partly resolved:
  - "Next plate (1/2)" breaks "(1/2)" onto a second line at 320 (320-light/plate-hero-6.png);
  - "≈ 500" and "kcal" split across lines in the order tile at 320 and 360 (360-dark/rescue-menu-order-2.png);
  - "≈ 23 / g protein" splits in "Also on this menu".
- C8 partly resolved: "Mifflin-St Jeor formula", "BMI 25" and "sulfonylurea tablets" remain. The setup already uses the plain phrase "sugar tablets such as glimepiride or gliclazide"; use it in the skipped-meal note and toast (app.js:236, 301).
- Blocked card button "Change my food" opens the whole questionnaire; "Change my answers" matches what it does.
- 320×568 first view: the fixed masthead plus ask bar and tabs take about 46 % of the height. At 360-412 px the plate, its grams and the name are in the first view; at 320 the dish name and grams sit just below it. F2 is otherwise resolved.
- Setup step 2: Next is disabled until the medicine question is answered, with no line saying so.
- Film, 51 s, beat 3: the typed "2 aloo paratha with curd" (shot D1) is never seen. It sits under the beat card veil (12.4-14.6 s) and below the frame edge; the approved storyboard calls for it.
- Film, 51 s, beat 4: the phone shows "Spiced Soya Chunk Chaat" (shot K1, 18.1-21.4 s), then the plate that lifts out is "Tangy Kala Chana Chaat" (K2). These are two dishes for one ask.
- Film, 30 s, beat 2 (7.0-9.5 s): the lift-out starts mid-sentence ("need from the Mifflin-St Jeor formula...") and ends on a half-cut line.
- Both end cards: a clay scribble fragment and a dark sprig fragment show at the plate rim (30 s at 29.5 s; 51 s at 47 s).
- Music swells in the voice gaps reach -9.7 dB per second: 51 s at 17 s; 30 s at 17 s and 24 s. That is above the spoken level; ease the gap swells by 3-4 dB.
- Docs: UX-CRITERIA part A says 25 states; the review has 26.

## Round 2 findings, judged on my own evidence
| Finding | Status | Evidence |
|---|---|---|
| F1 Your data understated what goes to Gemini | PARTLY RESOLVED | What is sent is correct; when it is sent and the where-typed notes are not (finding 5). |
| F2 Plate not in first view | RESOLVED at 360/390/412 | At 320×568 the plate is first but its grams are just below the fold (cosmetic). |
| F3 Habit labels breaking mid-word at 130 % | RESOLVED | 360-light-big/builder-3.png, builder-4.png |
| F4 Drill | RESOLVED | All 17 rules are planted and each is matched by text. Coverage gaps remain (finding 8). |
| F5 Enforcement | MOSTLY RESOLVED | Hooks are armed and executable. The state fingerprint covers shell edits, films and the post. The min page is bound and rebuilt. The give-up notice is a systemMessage (display not live-validated). The verdict is at test/ux/CRITIC.md. Residue in finding 7. |
| C1 Rescue labels | RESOLVED | |
| C2 Step 3 repeated sentence | NOT RESOLVED | Cosmetic list. |
| C3 Kidney card wording | NOT RESOLVED | Finding 2. |
| C4 One primary in Rescue | RESOLVED | 320-light/rescue-menu-typed-1.png |
| C5 Wraps at 130 % | PARTLY RESOLVED | Cosmetic list. |
| C6 Curve axis gap | RESOLVED | |
| C7 Italic typed menu | RESOLVED | |
| C8 Jargon in targets notes | PARTLY RESOLVED | Cosmetic list. |
| C9 Stamp text | RESOLVED | "NEXT PLATE · MADE FOR YOU". |
| C10 Film beats 2, 4 and 3 | Beat 2 RESOLVED (clean Rescue screen, tap, photo, order); beat 4 ask box RESOLVED but dish continuity broken; beat 3 tiles RESOLVED but the typing is unseen | Cosmetic list. |
| C11 Audio dips | RESOLVED | The voice is even across beats; gap swells are cosmetic. |
| C12 BRIEF-v4 close line | RESOLVED | |

## Checked and holding
- Safety: kidney and pregnancy are referred on Plate, Builder and Rescue, and never sent to Gemini (core.js:296, engine.js:443).
- Diabetes keeps the grain: the note "the grain stays (diabetes)" is on the plate.
- The after-meal rise is shown only as Gentle, Moderate or Sharp, with "not a blood-sugar reading".
- Grams and kcal on plates. Restaurant orders show a count plus grams for the main dish; the side is a count only ("with 1 Tandoori Roti"), as the engine prompt asks (engine.js:347). This is an owner-level question, not a new defect.
- No supplements. No banned words in user-facing source or film text; the hits in engine.js are prompt text and the word filter itself.
- Brand line "Next Plate. Made for you." is spoken and shown in both films, and the stamp matches.
- Dark mode keeps the paper look at 320, 360 and 390.
- 130 % text holds at 360.

## Not inspected
- The owner's own phone and clients' real phones.
- Real Android font scaling, and Samsung Internet or Chrome "force dark". I simulated these with font x1.3 and colorScheme, and the page declares `only light`.
- Live Gemini output: every state used the mock, so dish names, the "Layout sample" lines and the menu answers are fixture text.
- Audio by ear (clipped syllables at cuts, pronunciation). WhatsApp's own re-compression of the forwarded copies.
- Whether the Stop hook's systemMessage reaches the owner (not live-validated).
- The live v5 page (hosted/v5/index.min.html), not rendered.
- Screen-reader behaviour beyond the measured accessible names.
- Widths 375/393/412/430, and 320 and 390 in dark mode, beyond the review's measurements. I viewed 320 light, 360 dark, 390 light and 360 light at 130 % as asked, plus my own extra renders at 320.
