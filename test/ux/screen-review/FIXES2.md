# Second screen review fixes (R2-B1 to R2-B8)

One row per finding in test/ux/screen-review/R2-B1.md to R2-B8.md (build 9274da67, 122 screens). A finding the reviewers counted once
and referred to on other screens has one row; where they listed it again under another screen, that row says "as" the first.
Branch claude/nice-hawking-307ljy. Commits: 031e712, 24281f8, c76f6eb, cc61fea (blockers), 04ad652, b7327cf, 858a147, 8a33ea7,
f727b42 (majors), 20d7606 (minors and cosmetics). A guard is a review state or check in test/ux/review.js or a rule in
test/rules/check.js. Each guard added in this pass was run with --page against the page built before its fix (hosted/v6/index.html at
a289486) and failed there; plate-day-done is a regression guard for the full day and passes on both.

Outcomes (164 rows): FIXED 158, NEEDS-OWNER 3, FIXED in part 1, MOCK-ONLY 1, NOT-A-DEFECT 1
By severity: MINOR 84, COSMETIC 71, MAJOR 6, BLOCKER 3

## Owner questions (NEEDS-OWNER)
1. 068 plate-not-set-up: what should the card ask the client to do? Recommendation: "Meal planning isn't switched on for this link. Send
   your coach a WhatsApp message to say so." ("yet" is already dropped.)
2. 002 setup-no-code: add a line under the no-code card? Recommendation: "Lost it? Ask your coach to send it again." (with the brand line).
3. 029 day types: "Strength day", "Trek day" and "Wind-down" fit these clients poorly. Recommendation: "Active day: a long walk or
   housework", "Desk day", "Rest day". (The trek hook already drops the salt words with high BP.)
4. 030 cuisines: "High-protein express" is not a cuisine and "Indian regional" names no region. Recommendation: "Indian home food" and
   "Mediterranean", with protein left to the mood pill.
5. 083 rescue-limit: a step for this meal without a new figure. Recommendation: "For this meal, choose a dish with dal, paneer or
   vegetables and one roti or a small rice, or message your coach."

| Batch | Screen | Severity | Finding | Outcome | Commit | Guard |
|---|---|---|---|---|---|---|
| B1 | 001 setup-1-goal-food | COSMETIC | Reason Next is off is 15 px grey italic | FIXED: all small print (.fine) is upright 16 px ink2, as the set-up and Plate disclaimers | 20d7606 |  |
| B1 | 002 setup-no-code | COSMETIC | No-code card has no next step for a lost link and no brand line | NEEDS-OWNER: the wording is the owner's (14 Nov). Question: add a line under the card? Recommendation: "Lost it? Ask your coach to send it again." |  |  |
| B1 | 004 setup-2-health | MINOR | Tick-all tiles look like one-choice tiles | FIXED: tick-all-that-apply tiles carry a box, ticked when on (set-up and My food) | 20d7606 | setup-2-health (screens) |
| B1 | 004 setup-2-health | COSMETIC | "Nothing to flag" | FIXED: "None of these" | 20d7606 |  |
| B1 | 004 setup-2-health | COSMETIC | "B12" alone | FIXED: "Vitamin B12" | 20d7606 |  |
| B1 | 007 setup-2-two-conditions | MINOR | Medicine and nutrient questions still asked once a referral applies | FIXED: with a kidney condition or pregnancy ticked the step asks nothing more and shows the referral directly under the tiles | 20d7606 | setup-2-two-conditions |
| B1 | 007 setup-2-two-conditions | COSMETIC | Referral line is a plain paragraph | FIXED: a note with the shield icon | 20d7606 | setup-2-two-conditions |
| B1 | 008 setup-2-referred | MINOR | Screen book shows the Plate card, not step 2; route says "nursing" | FIXED: setup-2-referred ends before Done; the new state setup-2-referred-done carries the Done check; route says breastfeeding | 20d7606 | setup-2-referred, setup-2-referred-done |
| B1 | 009 setup-3-feet | COSMETIC | "5 ft 4 in" breaks at 320 px and 130 % | FIXED: no-break spaces in the feet and inches line | 20d7606 | setup-3-feet |
| B1 | 011 plate-loading | BLOCKER | A My food or setting change during the first wait is dropped; the old plate shows under the new rule | FIXED: a reply made for changed answers or settings is dropped and the plates are asked for again | c76f6eb | plate-loading-changed |
| B1 | 011 plate-loading | COSMETIC | Wait dots wrap alone at 130 % | FIXED: the old dots animation on the line itself is off (it set content and drew stray dots); the dots stay with the last word | 20d7606 | plate-loading (screens) |
| B1 | 012 plate-hero | MINOR | "Next plate (1/2)" reads as half a plate | FIXED: "Next plate (1 of 2)" | 20d7606 |  |
| B1 | 013 plate-old-saved | COSMETIC | "this plate is new" note stays all session | FIXED: shown for the plates made again only; it goes once the plate changes | 20d7606 | plate-old-saved |
| B1 | 015 plate-no-body | COSMETIC | Same request twice with two link labels | FIXED: the Your day tip drops its link when the note above the plate has one | 20d7606 |  |
| B1 | 016 plate-dial-open | MINOR | Panel opens far below its pill | FIXED: every setting panel opens right under its own pill, with its question as heading and group name | 20d7606 | plate-dial-* (screens) |
| B1 | 016 plate-dial-open | COSMETIC | "5 h since you last ate" | FIXED: "5 hours since you last ate" (and the hook tag) | 20d7606 |  |
| B2 | 017 plate-swap-open | MINOR | Shadow smudges the one-tap labels (017, 018, 022, 025, 026) | FIXED once at the source: text-shadow off on .tbtn | 20d7606 |  |
| B2 | 017 plate-swap-open | COSMETIC | "(on your plate)" breaks | FIXED: no-break spaces | 20d7606 | plate-swap-open |
| B2 | 018 plate-one-tap-on | MINOR | A one-tap note adds a food the serving list does not show with grams | FIXED in part: the one-tap prompt asks that an added food is named with its grams; the rendered note is fixture text | 20d7606 | rules: tune prompt |
| B2 | 018 plate-one-tap-on | COSMETIC | "millet" twice in the suffix | MOCK-ONLY: model text from the fixture |  |  |
| B2 | 018 plate-one-tap-on | MINOR | Smudged one-tap labels | FIXED (as 017-1) | 20d7606 |  |
| B2 | 020 toast | COSMETIC | Toast lies over the buttons at 320 px and 130 % for 2.8 s | NOT-A-DEFECT: taps pass through (FIXES B2 14); the buttons show in full after 2.8 s; moving the toast would cover the logged card instead |  |  |
| B2 | 021 plate-skipped-meds | BLOCKER | "Little is left for a snack" and Plan dinner after a skipped meal on medicines | FIXED: the line follows the day's kcal left less the open main meals; never after a skipped meal on medicines (Plan snack stays) | 24281f8 | plate-skipped-meds, plate-logged-room |
| B2 | 021 plate-skipped-meds | COSMETIC | Skipped tab drawn as "Lunch –" | FIXED: the x mark of Skipped it | 20d7606 |  |
| B2 | 022 plate-asked | MINOR | "Back to my plates" does not look tappable | FIXED once at the source: every text link without an icon is underlined | 20d7606 |  |
| B2 | 022 plate-asked | MINOR | Smudged one-tap labels | FIXED (as 017-1) | 20d7606 |  |
| B2 | 023 plate-tune-wait | COSMETIC | "getting them ready" gives no sense of time | FIXED: "One-tap changes and swaps: ready in a few seconds" | 20d7606 |  |
| B2 | 023 plate-tune-wait | COSMETIC | Swap link absent with no word | FIXED: the same caption names the swaps | 20d7606 |  |
| B2 | 024 plate-tune-failed | MINOR | A failed request reads "No one-tap changes for this plate" | FIXED: "One-tap changes and swaps didn't load." with Try again; the old line stays for a reply that offers none | 20d7606 | plate-tune-failed (screens) |
| B2 | 025 plate-swapped | MAJOR | After a swap the title, tastes and pairing still describe the old dish; the log names it | FIXED: the swap is named in the title suffix and the logged title; taste words after a protein swap and pair lines naming the food swapped off are hidden | 8a33ea7 | plate-swapped, plate-swapped-logged |
| B2 | 025 plate-swapped | MINOR | Smudged one-tap labels | FIXED (as 017-1) | 20d7606 |  |
| B2 | 026 plate-bp | MINOR | Salt instruction only below the decision | FIXED: "Cook with no added salt; skip pickle and papad." under What to serve | 20d7606 |  |
| B2 | 026 plate-bp | MINOR | Smudged one-tap labels | FIXED (as 017-1) | 20d7606 |  |
| B2 | 026 plate-bp | note | Planned around and Sugar rise are the diabetes fixture | MOCK-ONLY |  |  |
| B2 | 027 plate-dial-goal | MINOR | Panels open far from their pill, with no title or group name (027, 029-032) | FIXED once: panel under its pill, question as heading and aria-label | 20d7606 | plate-dial-goal |
| B2 | 027 plate-dial-goal | COSMETIC | Nothing says the goal changes the whole day | FIXED: "Changes your targets for the whole day." | 20d7606 |  |
| B2 | 028 plate-goal-toast | MINOR | "Your day has moved on" after a goal change | FIXED: "Your choices changed. Plan plates for them?" after a setting; the old line stays for the clock | 20d7606 | plate-goal-toast, plate-moved-on |
| B2 | 028 plate-goal-toast | MINOR | Toast covers Plan my plates at 320 px | FIXED: the goal toast is gone; the panel and the card say what changed | 20d7606 |  |
| B2 | 028 plate-goal-toast | COSMETIC | "Hold steady." reads as a command | FIXED: the toast is gone (above) | 20d7606 |  |
| B2 | 029 plate-dial-mode | MINOR | Day types fit these clients poorly; trek and BP salt hooks can clash | FIXED for the salt: the trek hook drops "salt" with high BP. NEEDS-OWNER for the day types (see questions) | 20d7606 |  |
| B2 | 029-032 plate-dial-* | MINOR | Panel placement, no title (029-1, 030-3, 031-1, 032-3) | FIXED (as 027-1) | 20d7606 |  |
| B2 | 030 plate-dial-cuisine | MINOR | "Mediterranean" runs past its pill | FIXED: the cuisine panel uses wrapping pills | 20d7606 | plate-dial-cuisine |
| B2 | 030 plate-dial-cuisine | MINOR | "High-protein express" is not a cuisine; "Indian regional" vague | NEEDS-OWNER (see questions) |  |  |
| B2 | 031 plate-dial-mood | COSMETIC | "Quick 15-min" splits at 320 px | FIXED: "Quick, 15 min" with a no-break space | 20d7606 |  |
| B2 | 031 plate-dial-mood | COSMETIC | "Best fit" unclear | FIXED: "No preference" | 20d7606 |  |
| B2 | 032 plate-dial-cook | MINOR | Two choices in one grid; Ordering out does not lead on | FIXED: "Cook or order" and "Oil" headings; Ordering out closes the panel and brings Plan my plates into view | 20d7606 | plate-dial-cook |
| B2 | 032 plate-dial-cook | COSMETIC | "less oil" on the pill, "Minimal oil" on the tiles | FIXED: "Less oil", "Usual oil" everywhere | 20d7606 |  |
| B3 | 033 plate-dial-focus | MINOR | Nutrient panel has no question and does not say it changes My food | FIXED: "Which nutrient do you want more of?" with "This changes My food too." | 20d7606 | plate-dial-focus |
| B3 | 034 plate-moved-on | MINOR | "Your day has moved on" after the person's own change | FIXED: "Your choices changed. Plan plates for them?" | 20d7606 | plate-moved-on |
| B3 | 034 plate-moved-on | COSMETIC | Heading breaks with half the card empty | FIXED: balanced heading (text-wrap) | 20d7606 |  |
| B3 | 035 plate-appetite-moved | MINOR | Same heading after the slider moved | FIXED: "You changed your appetite. Plan plates for about N kcal?" | 20d7606 | plate-appetite-moved |
| B3 | 035 plate-appetite-moved | COSMETIC | Same heading break | FIXED (as 034) | 20d7606 |  |
| B3 | 036 plate-reopened | COSMETIC | Route says "tap Change" | FIXED in names.js | 20d7606 |  |
| B3 | 037 plate-last-meal | MAJOR | Dinner logged early closes the day with lunch open | FIXED: nextOpen() falls back to the first earlier main meal; the day closes only when all four are logged or skipped | cc61fea | plate-last-meal, plate-day-done |
| B3 | 037 plate-last-meal | COSMETIC | Route "Dinner, I had this" | FIXED in names.js (name and route) | cc61fea |  |
| B3 | 038 plate-skipped-meds-no-body | MINOR | "The rest of the day adjusts" with no targets | FIXED: "Add your age, height and weight so the rest of the day can adjust." | 20d7606 |  |
| B3 | 039 plate-loading-asks | COSMETIC | Dots drop alone at 130 % | FIXED (as 011-2) | 20d7606 |  |
| B3 | 040 plate-ask-wait | MINOR | The wait does not say what was asked | FIXED: "Planning plates for “...”" | 20d7606 |  |
| B3 | 040 plate-ask-wait | COSMETIC | A dot alone on a second line | FIXED (as 011-2) | 20d7606 |  |
| B3 | 041 plate-asked-logged | MINOR | "Plan dinner" wraps inside its pill (041, 043, 044, 045) | FIXED once: the labels stay on one line and the row wraps | 20d7606 |  |
| B3 | 043 plate-log-counted | MINOR | Catch-up protein beyond what the meal's energy can carry | FIXED: a meal's protein stays within 35 % of its energy (new parameter mealProteinEnergyMax, src/v6/params.js) | 20d7606 |  |
| B3 | 043 plate-log-counted | MINOR | Button wrap | FIXED (as 041-1) | 20d7606 |  |
| B3 | 043 plate-log-counted | COSMETIC | Four toast wordings | FIXED: "Counted for <meal>. Your next meals adjust to it." everywhere | 858a147, 8a33ea7 |  |
| B3 | 044 plate-rescued | MINOR | Day over target, not said | FIXED: the Today line says "That is about N kcal over today's N kcal." | 20d7606 |  |
| B3 | 044 plate-rescued | MINOR | Button wrap | FIXED (as 041-1) | 20d7606 |  |
| B3 | 045 plate-ordered | MINOR | ", ≈ 40 g" reads as the meal's weight | FIXED: the logged title puts the grams in brackets after the grain | 20d7606 |  |
| B3 | 045 plate-ordered | MINOR | Button wrap | FIXED (as 041-1) | 20d7606 |  |
| B3 | 045 plate-ordered | COSMETIC | Two ≈ on one line | FIXED: one ≈ | 20d7606 |  |
| B3 | 046 sheet-my-food | MINOR | Health tiles show no tick | FIXED (as 004-1) | 20d7606 |  |
| B3 | 046 sheet-my-food | COSMETIC | Sheet title lighter than its questions | FIXED: 24 px, bold | 20d7606 |  |
| B3 | 048 sheet-how-numbers | COSMETIC | Closing note italic grey | FIXED (as 001-1) | 20d7606 |  |
| B3 | 048 sheet-how-numbers | COSMETIC | Route says "Tap How on the plate" | FIXED in names.js | 20d7606 |  |
| B4 | 049 sheet-log-ask | MINOR | Gemini line on the log sheets 15 px grey italic | FIXED (as 001-1) | 20d7606 |  |
| B4 | 053 sheet-food-closed-by-band | MINOR | Any My food change throws away every plate | FIXED: plates go only when diet, leave-outs, health or medicines change; other answers keep them for Show my last plates (keys carry the answers, so they are not reused) | 20d7606 | sheet-food-closed-by-band, sheet-food-done-no-change |
| B4 | 053 sheet-food-closed-by-band | COSMETIC | Review closes with Escape, the book says tap above | FIXED: the state taps the band above the sheet | 20d7606 | sheet-food-closed-by-band |
| B4 | 055 sheet-log-wait | MINOR | No time line | FIXED: "It can take a minute or so." | 20d7606 |  |
| B4 | 055 sheet-log-wait | MINOR | Close during the wait loses the answer | FIXED: opened again for the same meal, the words, the wait and an estimate not yet counted stay | 858a147 | sheet-log-limit |
| B4 | 055 sheet-log-wait | COSMETIC | Dots can wrap; line not built with waitLine() | FIXED: waitLine() | 20d7606 |  |
| B4 | 056 sheet-log-not-meal | COSMETIC | "Say it the way you'd tell a friend" twice | FIXED: the note gives the example only | 20d7606 |  |
| B4 | 057 sheet-log-limit | MINOR | Count it live at the limit; words lost on reopen | FIXED: Count it off and outlined; the words stay | 858a147 | sheet-log-limit |
| B4 | 059 plate-error | MINOR | No step when Try again keeps failing | FIXED: "Your day, below, still shows what this meal should hold." on every error card with no plate | f727b42 |  |
| B4 | 060 plate-limit | MINOR | Locked ask box still invites typing | FIXED: read-only box with "Asks open at 5:30 am" / "Asks are off for now", words kept | f727b42 |  |
| B4 | 063 plate-no-code | MINOR | Kept, refused code told to open the link once | FIXED: "This link's code was not accepted. Ask your coach to send the link again." | f727b42 | plate-no-code |
| B4 | 063 plate-no-code | COSMETIC | Route no longer reaches the screen | FIXED in names.js | f727b42 |  |
| B4 | 064 plate-empty | MINOR | "change a choice above" points the wrong way | FIXED: "below" | 20d7606 |  |
| B4 | 064 plate-empty | COSMETIC | "Nothing that came back" | FIXED: "None of the plates made for you fit your food rules (what you eat and leave out)." | 20d7606 |  |
| B5 | 065 plate-error-last | MINOR | "Show my last plates" does not look tappable | FIXED (as 022-1) | 20d7606 |  |
| B5 | 065 plate-error-last | COSMETIC | Card does not say the earlier plates are kept | FIXED: "Your plates from before are kept." | 20d7606 | plate-error-last |
| B5 | 067 plate-limit-phone | MINOR | "on this phone" for a per-address limit | FIXED: "Today's limit of new plates on this network is reached." | f727b42 | plate-limit-phone |
| B5 | 068 plate-not-set-up | MAJOR | No next step on "isn't switched on yet" | NEEDS-OWNER for the step (see questions); "yet" dropped now | f727b42 | plate-not-set-up |
| B5 | 068 plate-not-set-up | MINOR | Asks stay live | FIXED: not_set_up locks the asks with "Asks open once your coach switches meal planning on." | 858a147 | plate-not-set-up |
| B5 | 069 plate-ask-empty | MINOR | "above" and "didn't go through" contradict | FIXED: "Nothing for “...” fit your food rules. Change a choice under Your day, or tap Try again." | 20d7606 |  |
| B5 | 069 plate-ask-empty | COSMETIC | "Try again" in the text and the button | FIXED with the line above | 20d7606 |  |
| B5 | 071 plate-ask-no-code | MINOR | Kept, refused code | FIXED (as 063-1) | f727b42 | plate-ask-no-code |
| B5 | 072 plate-refer | MINOR | "This one" points to nothing | FIXED: the card quotes the ask; SAFETY reads "Your coach and doctor should plan this with you." | 20d7606 | plate-refer |
| B5 | 073 builder | MINOR | "Post-training" | FIXED: "More protein" | 20d7606 |  |
| B5 | 073 builder | MINOR | "a model of direction" | FIXED: "It shows only which way your sugar may go, not a blood-sugar reading." | 20d7606 |  |
| B5 | 073 builder | COSMETIC | "it." alone at 130 % | FIXED: text-wrap on the line | 20d7606 |  |
| B5 | 074 builder-adjusted | MINOR | First tap moves the steppers 108 px | FIXED: the Changed line sits under the steppers | 20d7606 | builder-adjusted |
| B5 | 074 builder-adjusted | COSMETIC | Held button over the last stepper while scrolling | FIXED: the card reserves the button's height while it is held | 20d7606 |  |
| B5 | 076 builder-ratio-set | MINOR | "plates by mode" | FIXED: "Go back to the usual plate (Desk day)", underlined | 20d7606 | builder-ratio-set |
| B5 | 076 builder-ratio-set | MINOR | Preset stays selected after going back | FIXED: the preset returns to the day type | 20d7606 |  |
| B5 | 076 builder-ratio-set | MINOR | Chosen share lost on reload | FIXED: the share is saved and read back | 20d7606 | builder-ratio-set |
| B5 | 076 builder-ratio-set | COSMETIC | Nothing says the plates follow the share | FIXED: "Your plates use this share. Change it, or go back to the usual plate." | 20d7606 |  |
| B5 | 078 builder-no-body | MINOR | "by plate" and no way to a target | FIXED: empty ring centre and "Add your age, height and weight" | 20d7606 | builder-no-body |
| B5 | 079 rescue-entry | MINOR | Common dishes run off the right edge | FIXED once: the dish chips wrap (also R2-B7 097-3, R2-B8 113-4) | 20d7606 |  |
| B5 | 079 rescue-entry | COSMETIC | "what you can do about it" | FIXED: "to see how to fit it in" | 20d7606 |  |
| B5 | 080 rescue-wait | MINOR | "or type the menu" looks live while off | FIXED: a disabled text link is dimmed | 858a147 |  |
| B5 | 080 rescue-wait | COSMETIC | Dots twice | FIXED (as 011-2) | 20d7606 |  |
| B6 | 081 rescue-result | BLOCKER | With diabetes a move that drops the grain is shown | FIXED: checkRescue drops it, the prompt asks for none | 031e712 | rules: Rescue diabetes moves |
| B6 | 081 rescue-result | MAJOR | Portion and moves not in grams; katori passes | FIXED: prompt asks for pieces or grams; katori, phulka and a vessel without grams are not shown | 04ad652 | rules: Rescue units |
| B6 | 081 rescue-result | MINOR | Never says whether the dish fits the day | FIXED: "About 1120 kcal. About 850 kcal are left for today." at body size | 20d7606 |  |
| B6 | 081 rescue-result | COSMETIC | Radio-like markers; "-310 kcal" | FIXED: rounded box markers; "310 kcal less" | 20d7606 |  |
| B6 | 081 rescue-result | COSMETIC | "Another menu or dish" spacing | FIXED: tighter under the heading | 20d7606 |  |
| B6 | 082 rescue-busy | COSMETIC | Two filled controls | FIXED: the send arrow is outlined while a note offers Try again | 20d7606 |  |
| B6 | 082 rescue-busy | COSMETIC | Typed dish italic like the hint | FIXED: upright | 20d7606 |  |
| B6 | 083 rescue-limit | MAJOR | Entry tools live at the limit | FIXED: camera, type link, send and chips off; the note keeps the step (a meal step without a figure is an owner question) | 858a147 | rescue-limit |
| B6 | 084 rescue-error | COSMETIC | Named "could not reach" | FIXED in names.js (Rescue and menu) | 20d7606 |  |
| B6 | 085 rescue-empty | MINOR | Mixed causes, no Try again | FIXED: "Next Plate couldn't work out that dish. Try again, or name it another way..." with Try again | 20d7606 | rescue-empty |
| B6 | 085 rescue-empty | COSMETIC | Route does not lead here | FIXED in names.js | 20d7606 |  |
| B6 | 086 rescue-offline | MINOR | Time-out reported as no signal | FIXED: its own code, "Next Plate took too long to answer. Try again." | 20d7606 |  |
| B6 | 087 rescue-no-code | MINOR | Kept, refused code; tools live | FIXED (as 063-1 and 083) | 858a147, f727b42 | rescue-no-code |
| B6 | 088 rescue-refer | MINOR | "This one" points to nothing; non-food referred | FIXED: the card quotes the dish; the prompt sends non-food to "no dish" | 20d7606 | rescue-refer, rules: Rescue prompt |
| B6 | 089 rescue-menu-typed | MINOR | "Read this menu" needs a scroll | FIXED: the box is capped at a third of the screen | 20d7606 |  |
| B6 | 089 rescue-menu-typed | COSMETIC | Box opens scrolled to its end | FIXED: it opens, and returns on blur and paste, at the top | 20d7606 |  |
| B6 | 090 menu-wait | MINOR | Type link looks live; dish box takes typing | FIXED: dimmed link; read-only box during a wait | 858a147, 20d7606 |  |
| B6 | 090 menu-wait | COSMETIC | Lone dot after "lunch" | FIXED (as 011-2) | 20d7606 |  |
| B6 | 090 menu-wait | COSMETIC | "Your menu stays here" with no menu on screen | FIXED: "If this doesn't work, your typed menu comes back." | 20d7606 |  |
| B6 | 091 rescue-menu-order | COSMETIC | Hidden-dishes sentence lost in fine print | FIXED: its own line, upright, ink | 20d7606 |  |
| B6 | 091 rescue-menu-order | COSMETIC | Lines start with a separator at 320 px | FIXED: separators join the item before; figures and the score stay whole | 20d7606 |  |
| B6 | 092 menu-nothing-fits | MINOR | Read this menu stays primary; Name the dish far away | FIXED: Read this menu outlined; Name the dish and Photograph another page in the note | 20d7606 |  |
| B6 | 093 menu-unreadable | COSMETIC | Note buttons repeated by the entry tools | FIXED: the camera button and type link are not repeated under such a note | 20d7606 |  |
| B7 | 097 menu-other-order | MINOR | Footnote 15 px grey italic | FIXED (as 001-1) | 20d7606 |  |
| B7 | 097 menu-other-order | MINOR | "Rise" on the order card | FIXED: "Sugar rise" (also Rescue's summary line) | b7327cf, 20d7606 |  |
| B7 | 097 menu-other-order | MINOR | First chip wider than the screen at 130 % | FIXED (as 079-1) | 20d7606 |  |
| B7 | 097 menu-other-order | COSMETIC | Separator dots break badly at 320 px | FIXED (as 091-2), Planned around too | 20d7606 |  |
| B7 | 097 menu-other-order | COSMETIC | "Another menu or dish" spacing | FIXED (as 081-5) | 20d7606 |  |
| B7 | 098 menu-closest | MAJOR | Half-portion figures shown as the full order; logged as such | FIXED: as-served figure above each new one; "(eating half)" after the portion and in the logged title | b7327cf | menu-closest, menu-closest-ordered |
| B7 | 098 menu-closest | COSMETIC | "over what this lunch should carry" | FIXED: "more than this lunch should have" | b7327cf |  |
| B7 | 099 menu-photo-order | MINOR | Reason for the grain question 15 px grey italic | FIXED (as 001-1) | 20d7606 |  |
| B7 | 100 menu-photo-error | COSMETIC | Does not say the photo is kept | FIXED: "Next Plate couldn't read your menu just now. Your photo is kept." | 20d7606 |  |
| B7 | 101 menu-photos-off | MINOR | Camera button stays live | FIXED: not shown while photos are off; the photo line goes too | 20d7606 |  |
| B7 | 101 menu-photos-off | MINOR | "Photos are switched off. Type it instead." | FIXED: "Next Plate can't read photos at the moment. Type the menu instead." | 20d7606 |  |
| B7 | 101 menu-photos-off | COSMETIC | Duplicate type control | FIXED (as 093-1) | 20d7606 |  |
| B7 | 102 menu-bad-image | MINOR | "Try a smaller one" | FIXED: "That file couldn't be read as a photo. Take a new photo of the menu, or type it." | 20d7606 |  |
| B7 | 104 menu-limit | MINOR | Read this menu primary and tools live at the limit | FIXED (as 083) | 858a147 | menu-limit, menu-no-code |
| B7 | 104 menu-limit | COSMETIC | "still stand" | FIXED: "are still there" | 858a147 |  |
| B7 | 107 menu-refer | MINOR | "This one is..." | FIXED: SAFETY reads "Your coach and doctor should plan this with you." | 20d7606 |  |
| B7 | 109 menu-grain-no | COSMETIC | The person's own No carries the error rule | FIXED: no clay rule on that note | 20d7606 |  |
| B7 | 110 menu-grain-next | MINOR | Next question below the fold after No | FIXED: the page scrolls so the question's buttons show, keeping the trace line | 20d7606 | menu-grain-next |
| B7 | 110 menu-grain-next | COSMETIC | Inline link stretches the line | FIXED: the link sits on its own line | 20d7606 |  |
| B7 | 110 menu-grain-next | note | Mocked side without grams | FIXED in the screen book: mocked orders written as the engine returns them | 20d7606 |  |
| B7 | 111 menu-grain-again | COSMETIC | "(your earlier answer)" mid-sentence | FIXED: "Earlier you said ..." | 20d7606 | menu-grain-again |
| B8 | 113 menu-grain-other | MINOR | "Rise" | FIXED (as 097-2) | b7327cf |  |
| B8 | 113 menu-grain-other | MINOR | Footnote 15 px grey italic | FIXED (as 001-1) | 20d7606 |  |
| B8 | 113 menu-grain-other | COSMETIC | Separators at 320 px and 130 % | FIXED (as 091-2) | 20d7606 |  |
| B8 | 113 menu-grain-other | COSMETIC | Chip cut at 130 % | FIXED (as 079-1) | 20d7606 |  |
| B8 | 114 menu-grain-two | MINOR | Screen book shows grain sides without grams | FIXED: mocks for 110 and 114-116 carry the engine's count and grams | 20d7606 |  |
| B8 | 114 menu-grain-two | COSMETIC | No Change answer while the second grain is asked | FIXED | 20d7606 |  |
| B8 | 115 menu-grain-yes-then-no | MINOR | Told to ask which rice after confirming rice | FIXED: "You said steamed rice is available: name your dish with it instead." | 20d7606 | menu-grain-yes-then-no |
| B8 | 115 menu-grain-yes-then-no | COSMETIC | 27-word sentence | FIXED: short sentences | 20d7606 |  |
| B8 | 116 menu-grain-yes-then-no-next | MINOR | Two "Change answer" links | FIXED: "Change roti answer", "Change steamed rice answer" | 20d7606 |  |
| B8 | 116 menu-grain-yes-then-no-next | COSMETIC | Trace line spacing | FIXED (as 110-2) | 20d7606 |  |
| B8 | 120 rescue-blocked | MINOR | Title pushes the button under the tab bar | FIXED: no title when referred, as Builder | 20d7606 |  |
| B8 | 122 plate-blocked-change | MINOR | Question hidden under the sticky header | FIXED: scroll margin for the sticky header | 20d7606 | plate-blocked-change |
| B8 | 122 plate-blocked-change | COSMETIC | Book starts at the top of the sheet | FIXED: a sheet opened at one question is captured from where it lands | 20d7606 |  |
