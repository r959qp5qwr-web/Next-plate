VERDICT: FAIL
BUILD: 53ea70d491a690fdb5dc98f5081760cfcbaaae355dcb52def0d9f069a84001fd

# Critic, round 4 (app diff baa5e08..HEAD, both v6 pages, both films, the WhatsApp post, the gate)

I measured, rendered and viewed everything below myself. I did not use the builder's commit messages as evidence. Where a commit message makes a claim, I checked it against the screens.

## What I measured
- **Pages are current.** I rebuilt them in a fresh scratch copy with the repo's esbuild 0.24.2. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html came out byte-identical to the committed files. The working tree is clean.
- **Drill.** `npm run drill`: "every planted fault was caught" (17 rules, 18 planted faults).
- **Review.** `npm run review`: 9 runs x 34 states = 306 checks.
  - No violations, no unreached states, no page errors, no coverage gaps; exit 0.
  - Every screenshot was rewritten by my run; the oldest file in each folder is newer than my start.
  - I also ran the review on the served page (`--page hosted/v6/index.min.html`, output in the scratchpad): 306 checks, no violations, exit 0.
- **Exceptions.** test/ux/allow.json is `[]`, so there are none to judge.
- **Films.** I extracted frames at every beat to /tmp/np-frames-r4.
  - 30 s film: 31.5 s, 1080x1920, 60 fps. 51 s film: 51.0 s, same format. WhatsApp copies: 720x1280.
  - Mean level is -16.7 dB on both films; the copies are -16.7 and -16.8 dB.
  - The 51 s soundtrack matches demo/reel/film5/audio/mix.wav (difference -44.6 dB).
- **Voice timings.** demo/reel/film4/vo.js and film5/vo.js are unchanged since round 3. They match the approved scripts word for word, with no repeated words.
- **Gap levels, 51 s film.** The gap at 17 s is now -13.7 dB, level with the spoken seconds (-13.4 to -14.8 dB). In round 3 it was -9.7 dB.
- **Gap levels, 30 s film.** The gaps at 17 s and 24 s are -11.4 and -11.7 dB. The loudest spoken second is -14.9 dB.

## Findings, most serious first

1. **Read the menu and the log sheet: a failed request gives no next step (minor, B6).** This is the menu half of round 3 finding 6, which was titled "Rescue and menu errors".
   - **Where:** Rescue, menu read (photo or typed), and the "I had something else" log sheet; seen at 320 light.
   - **What is wrong:** when the server cannot be reached, the screen says only "Couldn't reach Next Plate just now." There is no Try again and no instruction.
     - Typed Rescue dish: now has Try again and keeps the dish (app.js:515). Resolved.
     - Menu path: the error is set at app.js:439 and has no retry. A menu photo is lost. At 320 the "Read the menu" button is scrolled off above the note.
     - Log sheet: uses the same bare message (app.js:559).
   - **Why it matters:** these readers order at a restaurant, often on a weak signal, after the effort of photographing the menu. "Read the menu" is the feature the 51 s film's beat 2 promises. The screen does not tell them what to do, and the Plate and dish errors both offer Try again, so this tab is inconsistent.
   - **Evidence:**
     - My renders with /api/menu failing: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/extra/320-menu-photo-neterror.png and 320-menu-typed-neterror.png.
     - The note's text, read from the page: "Couldn't reach Next Plate just now."
     - The review has no state for a menu or log failure.
   - **Smallest correction:**
     - Make the fallback in errText (app.js:56) read "Couldn't reach Next Plate just now. Check your signal and try again." This fixes every caller.
     - For the menu, keep the last photo or text (as UI.rlast does for the dish) and add the same Try again button to the menu note.
     - Add review states menu-error and log-error.

## Cosmetic (all listed; none blocks on its own)
- **"Next plate (1/2)" still breaks at 320.** The NBSP keeps "Next plate" together, but "(1/2)" drops to a second line, and the builder's commit says it is now on one line. Evidence: 320-light/plate-hero-5.png and 360-light-big/plate-hero-5.png (app.js:296, legible.css:186). At 360 and 390 it is on one line.
- **Figures break from their units.**
  - "≈ 500" / "kcal" in the order tile at 320, 360 and 130 % (320-light/rescue-menu-order-2.png, 360-dark/rescue-menu-order-2.png).
  - "≈ 23" / "g protein" in "Also on this menu" at 320 (320-light/rescue-menu-order-3.png).
  - "10" / "min" in "Also for lunch" at 320 and 130 % (320-light/plate-asked-7.png, 360-light-big/plate-hero-6.png).
  - Fix: a no-break space between each figure and its unit.
- **Link buttons break at 130 % text.** "I had something / else" and "Skipped / it" wrap, with the icon left beside the second line (360-light-big/plate-hero-5.png).
- **First view at 320x568.** The plate leads, but its grams and the dish name sit just below the fold (320-light/plate-hero-1.png). The date row now gives way below 340 px. At 360 and 390, the plate, its grams and the name are all in the first view.
- **Wait-card fragment.** The wait card's second line starts with a lowercase fragment, "around: gentle weight loss · ..." (app.js:231; 320-light/menu-wait-2.png, plate-loading-1.png). "Planned around: ..." reads whole.
- **Rescue arrows and screen readers.** The arrow's spoken text is an aria-label on a plain span (app.js:530), which screen readers may ignore. The struck "before" value is not voiced as "was". I did not check this with a screen reader.
- **30 s film music swells.** The swells in the voice gaps (17 s, 24 s) still sit 3-5 dB above the spoken level. The 51 s film is fixed.
- **Review coverage.** The review has no state for "no dish on that menu passed". I rendered it myself (scratchpad extra/320-menu-none-passed.png), and it reads well: it says what to do.

## Round 3 findings, judged on my own evidence
| Finding | Status | Evidence |
|---|---|---|
| 1 One colour per nutrient in Rescue | RESOLVED | Energy bar ink, protein clay, carbs ochre, fats plum; the change is an arrow beside the figure. 320-light/rescue-result-2.png, 360-dark/rescue-result-2.png |
| 2 Safety card wording | RESOLVED | "You said you are pregnant or nursing." / "You said you have a kidney condition."; coach and doctor in heading and body; "Change my answers". 320-light/plate-blocked-preg-1.png, rescue-blocked-1.png, builder-blocked-1.png |
| 3 Legend by nutrient name | RESOLVED | "Protein foods 150 g · Vegetables 120 g · Grains and starch 200 g · Fats and seeds 30 g" (320-light/plate-hero-2.png). Films: 30 s at 11.2 s and 51 s at 22.6 s show the food-group legend |
| 4 WhatsApp privacy line | RESOLVED | docs/film/WHATSAPP-post.md:8 names Google Gemini, the answers and recent meals, and "no name is sent" |
| 5 Your data trigger and where-typed notes | RESOLVED | The sentence covers opening, typed meals, Rescue and menus (app.js:592). "What you type goes to Google Gemini." appears under the Rescue box, the typed menu and the log sheet. Checked against the code: only menu reads send a photo; the log sends no food file |
| 6 Rescue and menu errors | PARTLY RESOLVED | Dish path resolved: the dish is kept, Try again is there (320-light/rescue-error-2.png). Menu and log paths are not resolved (finding 1) |
| 7 Gate residue | RESOLVED | ux-gate.sh:18-20: the PASSED shortcut also needs a Critic PASS for the fingerprint. manifest.sh covers the WhatsApp copies, posters, the v5 page, settings.json, both hooks, the agent definition, manifest.sh and package.json |
| 8a Screens stop at 6 | RESOLVED | Up to 14 stops; at 320 the Plate page is captured down to the fine print (320-light/plate-hero-10.png) |
| 8b Missing states | MOSTLY RESOLVED | Pregnancy, Builder/Rescue blocked, Builder with no plate, Rescue wait/error, menu wait/unreadable all added. Menu error, "none passed" and log error are still missing |
| 8c View loop | RESOLVED | Views are read from src/v5/markup.html (v-setup, v-plate, v-build, v-rescue) |

| Round 3 cosmetic | Status |
|---|---|
| Step 3 repeated "Kept on this phone", "Four answers" | RESOLVED ("Your body / The last step.") |
| C5 wraps at 320 / 130 % | NOT RESOLVED (cosmetic list) |
| C8 jargon | RESOLVED: plain words first, the formula name in brackets, "sugar tablets such as glimepiride or gliclazide" in the note, toast and targets |
| "Change my food" | RESOLVED |
| 320 first view | PARTLY RESOLVED (date row hidden; grams still just below the fold) |
| Step 2 Next disabled with no line | RESOLVED ("Answer the medicine question to go on.") |
| 51 s beat 3 typing unseen | RESOLVED (the typed "2 aloo paratha with curd" lifts out, 14.3-15.0 s, frame t14.75) |
| 51 s beat 4 two dishes | RESOLVED (K1 shows the ask box "Craving chaat" with prompts, no dish; K2 and the end card are the same Tangy Tofu Chaat) |
| 30 s beat 2 lift cut mid-sentence | RESOLVED (whole Maintenance and Weight loss items, 5.9-10.2 s) |
| End-card fragments | RESOLVED (clean-plate captures; the one leaf left is the plate's own garnish inside the well, as in the app) |
| Music swells | 51 s RESOLVED; 30 s NOT RESOLVED (cosmetic list) |
| Criteria doc said 25 states | RESOLVED (34) |

## Checked and holding
- **Safety.** Kidney and pregnancy are referred on Plate, Builder and Rescue. engine.js, core.js and server.ts are unchanged since baa5e08.
- **Diabetes keeps the grain.** "the grain stays (diabetes)" appears on plates, and the diabetes note is shown. A snack without grain is within the engine rule, which covers breakfast, lunch and dinner (core.js:180).
- **After-meal rise.** Shown only as Gentle, Moderate or Sharp, with "not a blood-sugar reading".
- **Units and supplements.** Grams and kcal throughout. "Phulka" is a food name, never a unit. No supplements.
- **Banned words.** None in user-facing text changed this round, nor in the post or the film text. The hits are CSS `transform`, code comments, and the engine's prompt and word filter.
- **Brand line.** "Next Plate. Made for you." is spoken and shown in both films and on both posters. The stamp reads "NEXT PLATE · MADE FOR YOU".
- **Dark mode.** The paper look holds at 320, 360 and 390.
- **Large text.** 130 % text holds at 360; the only issues are the wraps in the cosmetic list.
- **Served v5 page.** The rebuilt v5 page differs from the last version only in the targets-note text from params.js.
- **Gate verdict.** The gate will block on this verdict: line 1 is not PASS, so critic_ok fails, the review runs, and then the gate blocks with "the Critic's verdict is not PASS".
  - I did not run ux-gate.sh. A run would add a block for this fingerprint to .claude/.ux-gate-tries, which counts toward the builder's three-block release.

## Not inspected
- The owner's own phone and clients' real phones.
- Real Android font scaling and Samsung/Chrome "force dark". I simulated these with fonts x1.3 and colorScheme; the page declares `only light`.
- Live Gemini output: every state used the mock, so the "Layout sample" lines, dish names and menu answers are fixture text.
- Audio by ear: clipped syllables, pronunciation, and how the swells feel.
  - mix.wav is not a plain sum of the vo, music and sfx stems (residual -12 dB, so they were processed before mixing). That makes per-word voice-over-music margins taken from the stems unreliable, so I judged levels from the film's own soundtrack.
- WhatsApp's re-compression of the forwarded copies.
- Whether the Stop hook's systemMessage reaches the owner.
- The live v5 screens, which I did not render.
- Screen-reader behaviour beyond the measured accessible names.
- Widths 375/393/430, and 320 and 390 in dark mode, beyond the review's measurements. I viewed 320 light, 360 dark, 390 light and 360 light at 130 % for all 34 states, plus my own renders of the menu errors and "none passed" at 320.
