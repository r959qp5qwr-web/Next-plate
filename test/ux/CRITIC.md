VERDICT: FAIL
BUILD: c78bc7dc8ec4c86ccb97459d23e737321bb3c316b876b908a8235da5cbd6e621

# Critic, round 6 (app diff baa5e08..HEAD, both v6 pages, both films, the WhatsApp post, every tracked note, the gate)

I measured, rendered, probed and viewed everything below myself. Where the builder made a claim, I checked the claim and did not take the commit message as evidence.

The verdict is FAIL for four reasons:
- The re-rendered 51 s film has no picture for its first 48.85 s.
- With diabetes, a one-tap base swap can take the grain off the plate (owner rule 3). This has been in the code since v5, and I missed it in rounds 1 to 5.
- The handoff note still uses two banned words in its own sentences (owner rule 4).
- This round's retry change dropped Try again, and for the dish the typed text too, after two kinds of upstream error.

## What I measured
- **Pages are current.** I rebuilt them in a scratch copy with the repo's esbuild 0.24.2. hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html came out byte-identical to the committed files. The working tree is clean.
- **Drill.** `npm run drill`: "every planted fault was caught".
- **Review.** `npm run review`: 9 runs x 37 states = 333 checks, exit 0.
  - report.json: 333 entries, 0 violations, 0 state errors, all 37 states in all 9 runs.
  - My run rewrote every screen (file times 16:33:01 to 16:39:03).
  - I also reviewed the served page (`--page hosted/v6/index.min.html`, output in my scratchpad): 333 checks, no violations, exit 0.
- **Exceptions.** test/ux/allow.json is `[]`, so there are none to judge.
- **Engine.** engine.js, core.js and server.ts are unchanged since baa5e08.
- **Films.**
  - 30 s film: byte-identical to commit 1619367. 31.5 s, 1890 frames from 0.0 s, 1080x1920 at 60 fps. Mean level -16.7 dB; WhatsApp copy -16.7 dB.
  - 51 s film: broken (finding 1). Its audio is fine: mean -16.7 dB, and -16.8 dB on the WhatsApp copy.
- **My probes** (scripts in my scratchpad, r6/probe/).
  - errors.js serves the built page and fails each API with the server's own codes.
  - swap.js taps a base swap with the diabetes profile.

## Findings, most serious first

1. **The 51 s features film has no picture until 48.85 s (major; blocks sending).**
   - **Files:** demo/next-plate-features-51s.mp4 and demo/next-plate-features-51s-whatsapp.mp4, from commit 10076d3.
   - **What ffprobe shows:**
     - The video stream holds 129 frames (129 packets), starting at 48.85 s and lasting 2.15 s.
     - The audio runs the full 51.0 s. The file shrank from 26.0 MB to 2.3 MB.
     - The film committed in a79f84a had 3060 frames from 0.0 s.
   - **The WhatsApp copy** is the end card ("NEXT PLATE / Made for you.") frozen from 0 s to 50.5 s, at 88 kb/s. I took frames at 1, 5, 10, 20, 30, 40, 48 and 50.5 s.
   - **The render itself is corrupt.** demo/reel/out/film5/video_9x16.mp4 (16:30:18) declares 129 frames, and decoding it logs 14,933 lines of NAL-unit errors. The mix was built on a broken render.
   - **Why it matters:** forwarded on WhatsApp, the film shows none of its six beats (heavy lunch, menu, had something else, craving, one-tap, Builder). The voice describes screens nobody can see. The commit says "re-rendered", and the film README's only check is volumedetect, which this file passes.
   - **Criteria:** films check (critic definition, step 4); B6.
   - **Smallest correction:**
     - Render the video again (render.mjs --film film5 --format 9x16 --video-only).
     - Before mixing, confirm with ffprobe -count_frames that the video starts at 0.0 s and has 3060 frames, and that decoding with ffmpeg -v error logs nothing.
     - Mix, make the WhatsApp copy, and check a frame at every beat.
     - Add the frame-count and start-time check to demo/reel/film5/README.md next to the volumedetect line.

2. **With diabetes, a base swap takes the grain off the plate (owner rule 3; automatic FAIL).**
   - **Where:** the seeded profile has diabetes, and "What to serve" > "Swap" offers "Cauliflower and green pea mash" under Base. This shows on plate-swap-open at 320 light, 360 dark, 390 light and 360 light at 130 %.
   - **My probe (swap.js):** after tapping it, the list reads "150 g Paneer tikka, charred / 200 g Cauliflower and green pea mash SWAPPED / 120 g Sauteed palak with garlic / 30 g Walnut-mint chutney".
     - No grain is left on the plate.
     - The note below still says "With diabetes the grain stays on the plate".
     - The title still names the millet khichdi.
     - Screenshot: r6/probe/360-diabetes-base-swap.png.
   - **Code:**
     - src/v5/core.js:134 swapList drops only diet clashes and supplements.
     - The base-swap line of the prompt (src/v6/engine.js:220, src/v5/core.js:221) asks for "2 or 3 options for the carbohydrate base" with no grain rule for diabetes, so a live reply such as cauliflower rice passes too.
     - The plate check (core.js:127) and the menu check (engine.js:420) both hold the grain. The swap path does not.
   - **Not introduced this round:** this has been in the code since the v5 rebuild (81f42db; the fixture has the same swap). It is also in the live v5 screens, which use the same core and show base swaps. I missed it in rounds 1 to 5.
   - **Why it matters:** the rule exists for clients on diabetes medicine. A tap the app offers removes the grain, and the screen says the opposite.
   - **Smallest correction:**
     - In swapList, when the profile has diabetes and the slot is not a snack, keep only base options whose food passes GRAINW.
     - Add "with diabetes every base option is a whole grain or millet, with its grams" to the base-swap prompt line.
     - Add a check with this fixture case.
     - The live page changes only on the owner's "Deploy.".

3. **Banned words in the handoff note's own sentences (owner rule 4; automatic FAIL).**
   - **The words:** handoff-next-plate.md uses R-E-A-L at lines 3, 18, 48, 125, 126 (twice), 152 and 162, and E-X-A-C-T-L-Y at lines 11 and 13.
     - Line 3 uses "...-engine check", the same phrase I flagged in the film script in round 5.
     - These are the note's own sentences: not the rule, not a quoted record, not a web address.
   - **When:** the note was written at 06:41 (f08e7e4), after the owner extended the ban to every note at 05:46 (0b50fe3). I missed it in round 5.
   - **The builder's claim does not hold.** The claim was that only rule definitions, quoted rejected narration and one web address remain.
   - **Smallest correction:**
     - Replace "R-E-A-L engine" with "live engine", as already done in the script.
     - Change "8 R-E-A-L-menu scenarios" to "8 printed-menu scenarios".
     - Change "Use the values in section 8 E-X-A-C-T-L-Y" to "Use the values in section 8 as written".
     - Change line 13 to: Start every reply with "Yes Boss!".
     - Leave lines 50, 74, 77 and 108 as they are (see the next list).
   - **The other notes, all checked.** I swept all 31 tracked notes (git ls-files '*.md' '*.txt'), case-insensitive, including word variants. Apart from the handoff lines above, every hit is a reasonable exception:
     - **Rule definitions:** .claude/agents/ux-critic.md:25-26, .claude/skills/promo-film/SKILL.md:26, handoff:50. The list has to name the words.
     - **Rejected narration quoted word for word, under a header saying so:** demo/reel/promo/docs/script-v2.md:27, demo/reel/promo/docs/shotlist.md:18-19, demo/reel/promo2/docs/script.md:10. The handoff's correction log (74, 77) and rejected list (108) quote the rejected words. Rewording them would falsify what the owner rejected.
     - **A web address:** docs/film/RESEARCH-ad-films.md:27.
     - **Words that are not on the list:**
       - "exact" (handoff 98, 116, 175; docs/ux sources).
       - "simple", "simplicity", "simplify", "simplistic" (research notes on named sources).
       - R-E-A-L-L-Y and R-E-A-L-I-T-Y (BRIEF.md, ARCHITECTURE-v6.md).
       - P-E-R-S-O-N-A-L-I-Z-E (the owner's own quoted words, handoff 51 and 75).
       - T-R-A-N-S-F-O-R-M-A-T-I-O-N (RESEARCH-ad-films.md:14, naming the category convention to avoid).
       - S-E-A-M-L-E-S-S (promo3 treatment:23, the photographic term for a paper backdrop, in a rejected treatment). It sits close to a banned word, so "a paper backdrop" would be safer (cosmetic).
     - **Commit history:** the subjects of 13dc515 and 8f29728, written after the ban, contain "R-E-A-L-engine". That is pushed history. I do not recommend rewriting it; keep the words out of future messages.

4. **Try again dropped for two upstream errors; for the dish the typed text is also lost (minor; a regression in this round).**
   - **The cause:** RETRY (src/v6/app.js:56) allows only no code, "network", "upstream_error" and "timeout". The server never sends "timeout".
   - **Two upstream codes fall outside it:**
     - "busy": Gemini still at 429 after the server's own retry and fallback (src/v5/server.ts:75).
     - "unparsed": a reply cut off or malformed (server.ts:79).
   - **What the probe showed for "busy" and "unparsed":**
     - Dish (app.js:429, 501): "Couldn't reach Next Plate just now. Check your signal and try again." with no Try again, and the box is emptied (the typed dish is gone).
     - Menu photo (app.js:440): no Try again, so the photo has to be picked again.
     - Log sheet: no Try again; the text stays in the box.
     - Plate: still offers Try again.
     - With "upstream_error", the same words come with Try again and the dish stays in the box.
   - **Why it matters:** the same sentence gives a different next step depending on a code the person never sees, and a client on a small phone has to retype the dish one-handed. Before this round all of these offered Try again. The commit's stated aim, "Try again only for connection or upstream errors", is not met for these two codes. The review cannot see this, because its error states use only "upstream_error".
   - **Criteria:** B6, B5 (one look and behaviour for one action), B9.
   - **Evidence:** r6/probe/360-dish-busy.png against 360-dish-upstream_error.png; 360-menu-typed-unparsed.png.
   - **Smallest correction:**
     - Turn RETRY round: offer Try again unless the code is limit_day, limit_ip, bad_key, not_set_up, photos_off, bad_image or bad_request.
     - Keep the typed dish in its box whatever the code, so keeping the text is separate from offering a retry.
     - Optional: a plain line for "busy", such as "Next Plate is busy just now. Try again in a minute.", in place of "Check your signal".

## Cosmetic (all listed; none blocks on its own)
- **The Plate error offers Try again where it cannot help.**
  - For the daily limit and the bad-link message, Plate shows Try again (app.js:333). A tap returns the same message.
  - Evidence: r6/probe/320-plate-limit_day.png.
  - Fix: use the same retry rule as Rescue and the log sheet.
- **Some figures still break from their units.** These units are separate elements, so the new no-break spaces do not reach them.
  - At 320: "≈ 500" / "kcal" in the order tile (320-light/rescue-menu-order-2.png, app.js:461).
  - At 130 % text:
    - "560" / "kcal" in the plate's Energy tile (360-light-big/plate-hero-3.png).
    - "↑1185" / "kcal" and "12" / "/ 100" in the Rescue answer (360-light-big/rescue-result-2.png, app.js:532 and 536).
    - "≈ 500" / "kcal" in the order tile (360-light-big/rescue-menu-order-2.png).
  - Fix: white-space: nowrap on the figure-and-unit group of .v and .val, and a no-break space before "/ 100".
- **Wraps at 130 % text.** "Next plate" / "(1/2)", "I had something" / "else" and "Skipped" / "it" wrap, with the icon left beside the second line (360-light-big/plate-hero-5.png).
- **First view at 320x568.** The plate leads, but its grams and the dish name sit below the fold (320-light/plate-hero-1.png). This is unchanged; at 360 and 390 all three are in the first view.
- **30 s film music swells, unchanged.** The voice gaps at 17 s and 24 s measure -11.4 and -11.7 dB. The spoken seconds around them measure -12.9 to -18.0 dB.
- **"S-E-A-M-L-E-S-S" in the rejected promo3 treatment (line 23).** See finding 3.

## Round 5 findings, judged on my own evidence
| Item | Status | Evidence |
|---|---|---|
| 1 Banned word in docs/film/SCRIPT-features.md:35 | RESOLVED | The line now reads "live-engine check heavy-lunch-lighter-dinner" (a79f84a). |
| Same rule: RESEARCH-ad-films.md:5, film5/README.md:5, reel/README.md:11 | RESOLVED | "plainly", "measured pauses", "Captures of the v6 Phase 1 screens". |
| Same rule: the handoff note | NOT RESOLVED | I missed it in round 5; now finding 3. |
| 51 s film shows the old wait-card wording | NOT RESOLVED | The capture is updated: rects.json M2-reading reads "planned around: gentle weight loss · minding iron · protein ...". The film now shows no app at all (finding 1). |
| Try again offered where retrying cannot help | RESOLVED for Read the menu, the dish and the log sheet; NOT RESOLVED on Plate (cosmetic list) | My probe: limit_day and photos_off give no Try again on menu, dish or log. The change went too far for busy and unparsed (finding 4). |
| Try again buttons look different | RESOLVED | The Plate error is now the outlined button with the refresh mark, the same as dish, menu and log (plate-error-1 at all four looks). |
| Figures break from their units | PARTLY RESOLVED | Now held: "10 min" in Also for lunch (320-light/plate-hero-7.png) and "≈ 23 g protein" in Also on this menu (320-light/rescue-menu-order-3.png). Tiles and compare rows still break (cosmetic list). |
| Wraps at 130 % text | NOT RESOLVED | 360-light-big/plate-hero-5.png |
| First view at 320x568 | NOT RESOLVED (unchanged) | 320-light/plate-hero-1.png |
| 30 s film music swells | NOT RESOLVED (film unchanged) | -11.4 / -11.7 dB |

## Checked and holding
- **Safety referral.** Kidney and pregnancy are referred on Plate, Builder and Rescue, with "Change my answers" (plate-blocked-kidney, plate-blocked-preg, builder-blocked and rescue-blocked at all four looks). The referral and medicine lines in params.js are kept, reworded for plain English.
- **Diabetes grain.** It holds on the plates themselves and on menu orders; the swap path breaks it (finding 2).
- **After-meal rise.** Shown only as Gentle, Moderate or Sharp, with "The curve is a model of direction, not a blood-sugar reading."
- **Units and supplements.** Grams and kcal throughout; no katori or phulka as units; no supplements.
- **Banned words outside notes.** None in any user-facing app string, in either film's text, or in the WhatsApp post. The engine hits are Gemini prompt text and the taste-word filter.
- **Brand line.** "Next Plate. Made for you." is in the 30 s film, and in the 51 s film's end card and voice. The stamp reads "NEXT PLATE · MADE FOR YOU".
- **One look.** The Raw Linen paper look holds at 320 light, 360 dark, 390 light and 360 light at 130 %, across Plate, Builder, Rescue, the sheets and every error and blocked state.
- **Dark mode.** The paper palette is kept in dark mode.
- **Contrast and targets.** As measured: 0 violations.
- **WhatsApp post.** Unchanged since f09a308 and accurate. It names Google Gemini, the answers and recent meals, and "no name is sent".
  - It does not carry the brand line itself. The owner chose this wording (10d59b2), and the film it travels with closes on the line, so I do not count it as a finding.
- **The gate.** settings.json, ux-gate.sh, ux-mark.sh, manifest.sh and ux-critic.md are unchanged since round 3.
  - The fingerprint covers both films, so finding 1 is bound to it.
  - Nothing automated checks a film's picture; that is why the correction for finding 1 adds the frame check.
  - This verdict is FAIL, so the gate will block. I did not run ux-gate.sh, and there is no test/ux/PASSED.

## Not inspected
- The owner's own phone and clients' phones.
- Android font scaling and Samsung/Chrome "force dark" on devices. I simulated these with fonts x1.3 and colorScheme.
- Live Gemini output: every state used the mock or my own routed responses. Whether live Gemini returns non-grain base swaps for diabetes, and how often "busy" or "unparsed" occur, I could not see.
- Audio by ear: clipped syllables, pronunciation, and how the swells feel. No transcript was supplied.
- The 51 s film's intended frames: they do not exist in the delivered files.
- WhatsApp's re-compression of the forwarded copies.
- Whether the Stop hook's systemMessage reaches the owner.
- The live v5 screens, which I did not render. The rebuilt v5 page is byte-identical to the committed one, and finding 2 applies to it through the shared core.
- Screen-reader behaviour beyond the measured accessible names.
- Widths 375, 393 and 430; 320 and 390 in dark mode; and 412. These have the review's measurements only (0 violations). I viewed all 37 states at 320 light, 360 dark, 390 light and 360 light at 130 %, plus my probe renders.
