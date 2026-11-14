VERDICT: FAIL
BUILD: 92382be5bb75c7c720e4cb0d61f2f232b13be0eadadf39be9f26571111f0a8c7

Round 36. Scope: git diff 9998595..HEAD (HEAD 950bfa0, 55 commits, 43 files). The tree did not change during the round: HEAD and the
fingerprint were the same at the start and the end.

Measured by the Critic on this tree:
- Build: build6.js run in a scratch copy gives byte-identical hosted/v6/index.html, hosted/v6/index.min.html and hosted/v5/index.min.html.
- npm run rules: every rule check holds on all three pages. npm run words: no banned words (42 listed exceptions; both allow lists are
  unchanged in this diff, and test/ux/allow.json is still []). npm run films: 4 files ok, about -16.7 dB, no decode errors.
- npm run review (gate set): 9 runs, 130 states, 1170 checks, no violations, exit 0. npm run drill: every planted fault was caught.
- Probes of my own on the built np-core: Rescue moves with diabetes (29 titles, one at a time), the protein cap per meal, and combined
  conditions (kidney or pregnancy with BP or diabetes are referred; diabetes with BP gets both rules).
- Two Playwright probes of my own on hosted/v6/index.html with mocked replies (finding 1).

What holds: kidney and pregnancy are referred, alone or ticked with anything else (set-up note, Plate, Builder and Rescue cards, server
plan()). With diabetes the grain stays across plates, one-tap changes (the grain grams now follow the change), base swaps, the menu, and
Rescue moves: "skip", "leave out", "without", stand-ins and "only the vegetables" are dropped; half portions and grain swaps stay; the snack
is exempt as everywhere else. Grams and kcal only: katori, phulka and a vessel with no grams are dropped from Rescue portions and moves.
No supplements were found. Every owner decision of 14 Nov in the handoff table is in the code and on screen as recorded. Every BLOCKER and
MAJOR in B1-B6 and R2-B1..B8 has its fix in the code. I spot-checked 20 MINOR rows and all of them hold, except 076-3 (finding 2).

## Findings, most serious first

1. MAJOR (owner rule 3; B6 truthful). A menu or Rescue reply made for answers that changed during the wait is still shown. This is the
   same cause as R2-B1 011 (a BLOCKER), but the fix was applied to plates only.
   - Where: Rescue and the menu, any width. src/v6/app.js:112 drops a stale plate reply (askedFor). The callbacks for /api/rescue
     (app.js:560), /api/menu (app.js:572) and /api/log (app.js:770) have no such check. closeSheet (app.js:764) clears UI.rres and UI.mres
     when the sheet closes, which is before the reply arrives.
   - Evidence, probe 1 (menu): a person without diabetes types a menu. During the 4 s wait they open My food, tick Diabetes and tap Done.
     The request went out with health "none". The order card then shows "Paneer Tikka, 6 pieces ≈ 180 g" for breakfast, with no grain and
     no grain question. Screenshot: scratchpad race-menu.png.
   - Evidence, probe 2 (Rescue): the same steps on "Rajma chawal". The card then offers "Skip the rice, eat the rajma with salad" to a
     person who now has diabetes ticked. That is the exact move the R2-B6 081 BLOCKER removed.
   - Why it matters: a client who adds a condition or a food they leave out while the menu is being read gets an order or a move checked
     against their old answers. With diabetes that breaks rule 3. The trigger is narrow (an answer changed during a 20 to 60 s wait), but it
     is reachable.
   - Smallest correction: take the askedFor() snapshot in rescue(), readMenu() and logOther() as makePlates does. If it differs when the
     reply arrives, drop the reply and ask again, or show "Your answers changed. Read the menu again."
   - Add a review state for each, as plate-loading-changed does for plates.

2. MINOR (B: control state visible; a regression introduced by this diff). After a reload, the Builder shows the day-type preset as
   chosen while the share in use is another one.
   - Where: Builder, every width, after a reload with a share chosen.
   - Cause: R2-B5 076-3 now saves C.ratio and reads it back (app.js:26). UI.preset still starts at "mode" (app.js:44), and app.js:501 takes
     UI.ratio from C.ratio.
   - Evidence: test/ux/out/screens/320-light/builder-ratio-set-1..3.png. Steady sugar was chosen and the review reloads. The screen then
     shows "Desk day" filled, steppers at 35/45/10/10 (the Steady sugar share), "Your plates use this share", and the link "Go back to the
     usual plate (Desk day)". The share in use is not the one marked as chosen.
   - I reject the record note that "it was so before these changes". At 9998595, C.ratio was not saved, so after a reload the Desk day
     preset and its share agreed.
   - Why it matters: a client with diabetes who chose Steady sugar is shown that Desk day is in use.
   - Smallest correction: when UI.ratio is taken from C.ratio, set UI.preset to the preset whose shares equal it, or "" if none. Add that
     check to builder-ratio-set.

3. MINOR (operations; record). I confirm the record item about the rollback page. hosted/v5/index.min.html now carries the new core under
   the old v5 screens, and it breaks.
   - The v5 app starts with C.mode "focus" and cuisine "indian" (src/v5/app.js:21). Its Builder reads MODEPLATE[C.mode] and PRESETS.post
     (src/v5/app.js:467, 469), which no longer exist. So the day-type pill is empty, and the Builder fails on undefined.
   - hosted/v6/README.md:13 still gives "remove PAGE_PATH (back to the v5 screens)" as the first rollback. No file in the repo records the
     rollback by PAGE_REF=9998595 that the coordinator describes.
   - npm run rules passes on this page because it checks the core only.
   - Smallest correction: either stop build6 rewriting hosted/v5/index.min.html, or change the README rollback line to "PAGE_REF=9998595
     (or earlier) only". Also correct the build6.js comment, which says the v5 page "is what PAGE_REF serves".

4. COSMETIC (B: alignment). The skipped-meal mark sits on its own line under "Lunch" ("Lunch" with "×" below it), while "Breakfast ✓" is on
   one line. The tab is taller and its word sits off the line of its neighbours. 320-light, 360-light and 360-light-big
   plate-skipped-meds-1.png.

5. COSMETIC (B: alignment). With the tagline gone, the date line at 340 to 379 px holds the date alone, left-aligned, under a centred
   masthead (the issue number is hidden below 380 px). 360-light/plate-hero-1.png.

6. COSMETIC (B: plain words). The mood pill reads "No preference" with nothing saying what it is about; the question shows only when the
   panel is open. 320-light/plate-dial-cuisine-8.png.

7. COSMETIC (B: look). The sticky "My food" sheet header has a band that is a shade off the sheet behind it. 320-dark/sheet-my-food-2.png.

8. COSMETIC (record). The handoff decisions row says "Pregnant or nursing"; the app says "Pregnant or breastfeeding" (src/v5/core.js:7;
   FIXES B6 53). src/data.js:8 still has the old option list. It does not appear to be in the build path, but it is stale.

9. COSMETIC (record; films not in this diff). Both films still show what the owner has since dropped: the tagline "your daily plate,
   journalled", the asks "Heavy leg day" and "Trek tomorrow", and the old masthead. A frame contact sheet confirms it. The film re-make is
   already an open owner item.

10. COSMETIC (screen book, mock only). Some mocked text does not fit the person: "10-Min Miso Glazed Tofu & Buckwheat Soba" for a North
    Indian client on My home food, and a vegetarian's Rescue of mutton biryani. These are fixtures, not engine output, but the owner sees
    them in the book.

## Not inspected
- Live Gemini replies under the new prompts: My home food by region, Active day, Rescue portions in pieces or grams, and the side counts.
  Only recorded or mocked replies were seen.
- The owner's own phone and its system text size; WhatsApp's in-app browser and whether its storage is shared with Chrome. If it is not,
  "this phone remembers it" may not hold.
- TalkBack and VoiceOver reading of the tick-all tiles and the referral note; the real keypad on the height box.
- The 375, 393 and 430 px widths (the full set was not run); 412 px was measured but I did not view it.
- I viewed by eye the new and changed states at 320 light and dark, 360 light and 360 at 130 %. The rest I checked by the measured report
  only.
- The film audio by ear; the films are not in this diff.
- Behaviour at the real daily limit and midnight reset on the server (mocked codes only).
