VERDICT: PASS
BUILD: 1e48b105645f3e8a0700e7a44eac5cf269accba3ac1c72a76947fdf137f14e05

Round 37. Scope: git diff 950bfa0..HEAD (HEAD a06f68c) for the changes; the whole of 9998595..HEAD for the verdict. The tree did not change: HEAD and the
fingerprint were the same at the start and the end of the round (manifest.sh run after all measuring).

Measured by the Critic on this tree:
- npm run review (gate set): 9 runs, 133 states, 1197 checks, no violations, exit 0. The "plate-refer ERR_SOCKET_NOT_CONNECTED" page error
  the builder saw did not appear in my run. test/ux/allow.json is still [].
- npm run drill: every planted fault was caught. npm run rules: every rule check holds on all three pages. npm run words: no banned words
  (42 listed exceptions, unchanged). npm run films: 4 files ok, about -16.7 dB, no decode errors.
- Source: src/v6/app.js diff read in full; the same guards are in hosted/v6/index.html and in hosted/v6/index.min.html (rescue callback checked in
  the minified page: Re()!==i, then re-ask or render only). The CSS lines are in both pages.

Confirmed fixes:
1. Round 36 MAJOR (stale menu, Rescue and log replies): fixed. rescue(), readMenu() and logOther() take askedFor() when sending and, if it differs
   on arrival, do not show the reply; they ask again, or only re-render when the person is now referred (app.js:562-564, 576-578, 776-778).
   Rendered: 360-light/menu-health-changed-3.png shows the order list after Diabetes was ticked in the wait, with "2 dishes on this menu did not
   pass your food rules, so they are not shown" (the re-asked, diabetes-checked reply). The two review states require a second request carrying
   diabetes; both pass. The log path has no state (My food cannot be opened over the log sheet); the code check is there. I accept that.
2. Round 36 MINOR (Builder preset after reload): fixed. 320-light/builder-ratio-reload-1.png marks "Steady sugar", the share in use, and no longer
   "Desk day" (app.js:501-503, matches the saved share against mode, balanced, steady, else none).
3. Round 36 MINOR (rollback): fixed in the record. hosted/v6/README.md and the handoff Rollback row say to set PAGE_REF back to 9998595 and keep
   PAGE_PATH, and not to remove PAGE_PATH at a newer ref. The handoff "Live now" row says PAGE_REF 9998595 and that nothing after it is live.
4. Skipped-meal mark: fixed. "Lunch ×" is on one line in 320-light and 360-light-big plate-skipped-meds-1.png, in line with "Breakfast ✓".
5. Mood pill: fixed. 320-light/plate-dial-cuisine-8.png reads "Mood  No preference".
6. Sticky My food header: fixed. 320-dark/sheet-my-food-2.png: the header band is the sheet's own paper; the health tiles read "None of these" and
   "Pregnant or breastfeeding".
7. Handoff label "Pregnant or breastfeeding, None of these": fixed.

What holds from round 36 (unchanged in 950bfa0..HEAD apart from the items above): kidney and pregnancy referred, with diabetes the grain stays,
grams and kcal only, no supplements, banned words, brand line in the app, Raw Linen look and dark mode. No safety line was removed in this diff.

## Findings, most serious first

1. COSMETIC (B: alignment; the builder's fix does not work). The date line at 340 to 379 px is still left-aligned under the centred name.
   - Where: 360-light/plate-hero-1.png and 360-light-big/plate-skipped-meds-1.png: "THU, 12 NOV" sits at the left edge, the masthead and the
     "My food" line are centred. At 390 px (issue number shown) it is fine.
   - Cause: `#app .dateline>*{text-align:center}` (legible.css:340) sets text-align on .mast, but .mast is `display:flex;justify-content:space-between`
     (index.html:575) and holds only the date span once #issue is hidden (index.html:900), so space-between puts it at the start. text-align does
     not move a flex item.
   - Smallest correction: `@media (max-width:379.98px){#app .mast{justify-content:center}}`.
2. COSMETIC (record). build6.js:44 still says the v5 page "is what PAGE_REF serves until the owner says Deploy"; that is not true after the
   rollback note (the v5 page is not a safe rollback). I did not find a change to it in this diff. Reword or delete the comment.
3. COSMETIC (record; films not in this diff). Both films still show the old tagline and the old asks ("Heavy leg day", "Trek tomorrow"). Already an
   open owner item; the film re-make is not part of this build.
4. COSMETIC (screen book, mock only). Some mocked text does not fit the person (a miso tofu soba for a North Indian vegetarian, mutton biryani in
   a vegetarian's Rescue). Fixtures, not engine output; unchanged.
5. COSMETIC (code hygiene). logOther()'s stale-reply branch calls renderSheet() even if the sheet is closed. Not reachable today (My food cannot be
   opened over the log sheet). Guard it with `if(UI.sheet==="log")` if that ever changes.

## Not inspected
- Live Gemini replies under the current prompts; only recorded or mocked replies were seen. The health-changed states use a slowed local
  server, not Gemini.
- The owner's own phone and its system text size; WhatsApp's in-app browser and whether its storage is shared with Chrome.
- TalkBack and VoiceOver; the phone keypad on the height box.
- 375, 393 and 430 px were not run; 412 px was measured but not viewed.
- I viewed by eye: plate-skipped-meds (320 light, 360 130 %), plate-hero (360 and 390 light), the mood pill (320 light), sheet-my-food (320 dark),
  builder-ratio-reload (320 light), menu-health-changed and rescue-health-changed (360 light). Everything else, including dark and 130 % for those
  states, is by the measured report only.
- The film audio by ear; the films are not in this diff.
- Behaviour at the server daily limit and the midnight reset on the server (mocked codes only).
