VERDICT: FAIL
BUILD: e7bbd6b49a6ac635196449797b67865c78760bf8254a6f272fda2ec40a8a735b

# Critic, round 5 (app diff baa5e08..HEAD, both v6 pages, both films, the WhatsApp post, the gate)

I measured, rendered and viewed everything below myself. I did not take the builder's commit message as evidence; where it makes a claim, I checked the claim.

The app's round 4 finding is resolved, and nothing a client sees blocks this round. The FAIL comes from an owner-rule breach in a note in the owner-approved film script (finding 1). Rule 4 covers notes, and a breach is an automatic FAIL.

## What I measured
- **Pages are current.** I rebuilt them in a fresh scratch copy with the repo's esbuild 0.24.2. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html came out byte-identical to the committed files. The working tree is clean.
- **Drill.** `npm run drill`: "every planted fault was caught".
- **Review.** `npm run review`: 9 runs x 37 states = 333 checks, exit 0.
  - report.json: 0 violations, 0 state errors, 37 states, all 9 runs.
  - Every screen in test/ux/out/screens was rewritten by my run (oldest file 15:35:14; my run started 15:35).
  - I also ran the review on the served page (`--page hosted/v6/index.min.html`, output in the scratchpad): 333 checks, no violations, exit 0.
- **Exceptions.** test/ux/allow.json is `[]`, so there are none to judge.
- **Films.** The films and their copies have not changed since commit 1619367 (git diff is empty for demo/ and docs/film/).
  - 30 s film: 31.5 s. 51 s film: 51.0 s. Both 1080x1920 at 60 fps.
  - Mean level is -16.7 dB on both films; the WhatsApp copies are -16.7 and -16.8 dB.
- **Menu photo retry, my own probe.** I served the built page and failed /api/menu (scratchpad r5/probe/photo-retry.js).
  - After a photo read fails, Try again sends the same photo again: both requests carry the same 151,748-character image.
  - No page errors.

## Findings, most serious first

1. **A banned word in a note in the owner-approved film script (owner rule 4; automatic FAIL).**
   - **Where:** docs/film/SCRIPT-features.md:35, in "Checks against the brief".
   - **What is wrong:** the phrase "...-engine check heavy-lunch-lighter-dinner" begins with the banned word R-E-A-L. (I spell it out so this verdict does not use it.) The same bullet then says "No banned words."
   - **The rule:** the owner extended the ban to "the script AND every note, brief or reply to the owner" in commit 0b50fe3, at 05:46. This line was written later, in 746040d at 09:35. Commit 0c1baf8 removed the same word from another note in this same file.
   - **Why it matters:** the owner holds every note to the ban, and this note tells him the script was checked for banned words when it was not.
   - **Missed before:** I missed this in rounds 1 to 4. My round 3 and round 4 verdicts also used banned words (R-E-A-L and the CSS property name T-R-A-N-S-F-O-R-M); this verdict does not.
   - **Not affected:** no client-facing text. The app, both films' on-screen and spoken text, and the WhatsApp post are all free of banned words. The engine hits are Gemini prompt text and the word filter itself.
   - **Same rule, in notes outside this round's named scope:**
     - docs/film/RESEARCH-ad-films.md:5, "State the product's essence S-I-M-P-L-Y". This is a paraphrase, not a direct quote.
     - demo/reel/film5/README.md:5, "cuts at measured Q-U-I-E-T points".
     - demo/reel/README.md:11, "R-E-A-L captures of the v6 Phase 1 screens".
     - RESEARCH-ad-films.md:27 has the word only inside a source web address, which cannot be changed. It can stay.
   - **Smallest correction:**
     - Change the script note to "engine check heavy-lunch-lighter-dinner".
     - Change the paraphrase to "plainly", the film5 README to "measured pauses", and the reel README to "Captures of the v6 Phase 1 screens".
     - No voice line or approved script line changes. Tell the owner in one line that only the note changed.

## Cosmetic (all listed; none blocks on its own)
- **The 51 s film shows the old wait-card wording.**
  - What the film shows: the menu wait card's line "around: gentle weight loss · minding iron · protein to catch up", at about 9.6-10.4 s, dimmed behind the menu photo.
  - What the app now shows: "planned around: ..." (app.js:231).
  - Evidence: demo/reel/film5/assets/rects.json, shot M2-reading, element p.planned. My frames at 9.6, 9.9 and 10.2 s.
  - So the claim that this round's src changes appear in no film screen is not accurate for this one line. The other changes are not in the films:
    - The fallback error text, the menu and log Try again buttons, and the retry button heights show only in error states.
    - The Rescue arrow's added words are visually hidden, and neither film shows the Rescue compare bars.
    - The Next plate icon is hidden only below 360 px, and the films were captured at 390 px.
  - Fix: recapture M2 at the next re-render. A re-render for this alone is the owner's call.
- **Try again is offered where retrying cannot help.**
  - Read the menu, the dish and the log sheet show Try again for the daily limit, "Photos are switched off. Type it instead.", and the bad-link and bad-photo messages (app.js:515, 516, 578). A tap returns the same message.
  - Evidence: scratchpad r5/probe/320-menu-photo-limit.png and 320-menu-photo-photosoff.png.
  - Fix: offer Try again only for upstream or connection errors.
- **The Try again buttons look different for the same action.**
  - On the Plate error it is a filled clay button with the sparkle icon (app.js:332).
  - On the dish, menu and log errors it is an outlined button with the refresh icon.
  - Evidence: 320-light/plate-error-1.png against 320-light/menu-error-1.png.
- **Figures still break from their units.**
  - At 320:
    - "≈ 500" / "kcal" in the order tile (320-light/rescue-menu-order-2.png).
    - "≈ 23" / "g protein" in "Also on this menu" (rescue-menu-order-3.png).
    - "10" / "min" in "Also for lunch" (plate-hero-7.png).
  - At 130 % text:
    - "560" / "kcal" in the plate's Energy tile (360-light-big/plate-hero-3.png).
    - "1185" / "kcal" and "12" / "/ 100" in the Rescue answer (360-light-big/rescue-result-2.png).
    - "≈ 500" / "kcal" in the order tile (rescue-menu-order-2.png).
  - Fix: a no-break space between each figure and its unit.
- **Wraps at 130 % text.** "Next plate" / "(1/2)", "I had something" / "else" and "Skipped" / "it" wrap, with the icon left beside the second line (360-light-big/plate-hero-5.png).
- **First view at 320x568.** The plate leads, but its grams and the dish name sit just below the fold (320-light/plate-hero-1.png). This is unchanged; at 360 and 390 all three are in the first view.
- **30 s film music swells.** The voice gaps at 17 s and 24 s measure -11.4 and -11.7 dB. The spoken seconds around them measure -13.7 to -18.6 dB.

## Round 4 findings, judged on my own evidence
| Item | Status | Evidence |
|---|---|---|
| 1 Read the menu and log sheet errors give no next step | RESOLVED | See the evidence list under this table. |
| "Next plate (1/2)" breaks at 320 | RESOLVED at 320; NOT RESOLVED at 130 % | One line at 320 with the icon hidden below 360 px (legible.css:189; 320-light/plate-hero-5.png). Still two lines at 130 %. |
| Figures break from their units | NOT RESOLVED | Cosmetic list. |
| Link buttons wrap at 130 % | NOT RESOLVED | 360-light-big/plate-hero-5.png |
| First view at 320x568 | NOT RESOLVED (unchanged) | 320-light/plate-hero-1.png |
| Wait-card fragment | RESOLVED in the app | "planned around: ..." on 320-light/menu-wait-1.png and plate-loading-1.png, 390-light/menu-wait-2.png. The 51 s film still shows the old line (cosmetic list). |
| Rescue arrows and screen readers | RESOLVED | The arrow is aria-hidden; the words " up to " / " down to " are text in the visually hidden .said class (app.js:531). Not tried with a screen reader. |
| 30 s film music swells | NOT RESOLVED | -11.4 / -11.7 dB at 17 s and 24 s |
| No review state for "none passed" | RESOLVED | menu-nothing-fits is reached in all 9 runs. It says what to do and has no Try again, which is correct. |

Evidence for item 1 (menu and log errors):
- The fallback now reads "Couldn't reach Next Plate just now. Check your signal and try again." (app.js:56).
- Menu error: the typed menu stays in its box and a Try again sits in the note (app.js:516). See 320-light, 360-dark, 390-light and 360-light-big menu-error-1 and -2.
- A failed photo read sends the same photo again (my probe).
- Log sheet: the typed meal stays in the box and Try again is there (app.js:578). See sheet-log-error at all four looks.
- The new review states menu-error, menu-nothing-fits and sheet-log-error are reached in all 9 runs.

## Checked and holding
- **Safety.** Kidney and pregnancy are referred on Plate, Builder and Rescue, with "Change my answers" (plate-blocked-kidney, plate-blocked-preg, builder-blocked, rescue-blocked at all four looks).
  - engine.js, core.js and server.ts are unchanged since baa5e08.
- **Diabetes keeps the grain.** "With diabetes the grain stays on the plate, next to protein and vegetables. Your doctor's advice comes first." is on every plate state.
- **After-meal rise.** Shown only as Gentle, Moderate or Sharp, with "The curve is a model of direction, not a blood-sugar reading."
- **Units and supplements.** Grams and kcal throughout; no katori or phulka as units; no supplements.
- **Banned words.** None in any user-facing app string, in the film text, or in the WhatsApp post. Finding 1 is in notes.
- **Brand line.** "Next Plate. Made for you." is spoken and shown in both films. The stamp reads "NEXT PLATE · MADE FOR YOU".
- **One look.** The Raw Linen paper look holds in dark mode at 360 and across Plate, Builder, Rescue, the sheets and every error and blocked state.
- **WhatsApp post.** Unchanged and accurate. It names Google Gemini, the answers and recent meals, and "no name is sent".
- **The gate.** ux-gate.sh, ux-mark.sh, settings.json and manifest.sh are unchanged since round 4. The PASSED shortcut still needs a Critic PASS for the fingerprint.
  - This verdict is FAIL, so the gate will block. I did not run ux-gate.sh.
  - The fingerprint does not cover docs/film/SCRIPT-features.md or the READMEs. Fixing finding 1 leaves BUILD unchanged; the next verdict can bind the same fingerprint.

## Not inspected
- The owner's own phone and clients' phones.
- Android font scaling and Samsung/Chrome "force dark" on devices. I simulated these with fonts x1.3 and colorScheme; the page declares `only light`.
- Live Gemini output: every state used the mock or my own routed responses, so dish names, "Layout sample" lines and menu answers are fixture text.
- Audio by ear: clipped syllables, pronunciation, and how the swells feel.
- WhatsApp's re-compression of the forwarded copies.
- Whether the Stop hook's systemMessage reaches the owner.
- The live v5 screens, which I did not render. The rebuilt v5 page is byte-identical to the committed one.
- Screen-reader behaviour beyond the measured accessible names.
- Widths 375, 393 and 430; 320 and 390 in dark mode; and 412. These have the review's measurements only (0 violations). I viewed all 37 states at 320 light, 360 dark, 390 light and 360 light at 130 %, plus my own menu-photo error renders at 320.
