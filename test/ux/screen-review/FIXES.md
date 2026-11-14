# Screen review fixes (B1 to B6)

One row per finding in test/ux/screen-review/B1.md to B6.md (183 findings on 55 screens). Commits on branch claude/nice-hawking-307ljy:
bbe6c52 and 392dfe1 (blockers, majors and owner decisions, before this pass), cd75c34 (set-up and Plate), 6a0d9aa (sheets, errors, Builder,
Rescue, menu), and the commit that adds this file (wait wording). A guard is a review state or check in test/ux/review.js, or a rule in
test/rules/check.js; each guard added in this pass was run against the page built before its fix (hosted/v6/index.html at 392dfe1) and failed there.

Outcomes, all severities: FIXED 157, FIXED in part 3, DECIDED 13 (were NEEDS-OWNER), NOT-A-DEFECT 7, MOCK-ONLY 3.
MINOR and COSMETIC only: FIXED 143, FIXED in part 3, DECIDED 13, NOT-A-DEFECT 7, MOCK-ONLY 3.
3 fixed rows also carried an owner question for the part that is a product choice; those are DECIDED too.
Owner decisions, 14 Nov (option survey), on every NEEDS-OWNER row: commits 70080d1, 88265e4, ebcb75c, 388013c, be6bc7b, c697d3b, 7d4c209,
f5f0d78, b46de32, 5278f9b, 3ba356d, 14ce1ce. Each guard listed with them was run against the page built just before its change and failed there.

Also done in this pass: plate-moved-on (Plan my plates now comes into view after a change) and menu-closest (a move on the closest order brings
the note and the changed card into view) are fixed in the app; screen book entries 48 and 50 (and 49 and 23) are renamed in test/ux/atlas/names.js.

| Batch | Screen | Severity | Finding | Outcome | Guard |
|---|---|---|---|---|---|
| B1 | 01 setup-1-goal-food | MINOR | Next disabled with no reason | FIXED cd75c34: "Choose a goal, what you eat and your home food to go on." names what is missing | setup-1-goal-food |
| B1 | 01 setup-1-goal-food | MINOR | Home food comes set to North | FIXED cd75c34: no region until the person chooses; Next needs it | setup-1-goal-food |
| B1 | 01 setup-1-goal-food | MINOR | "Kept on this phone" leaves out what goes to Gemini | FIXED cd75c34: intro says the answers, never the name, go to Google Gemini; the body step no longer says "Kept on this phone" |  |
| B1 | 01 setup-1-goal-food | MINOR | Disclaimer and Gemini line in grey italic 15 px | FIXED cd75c34: the footnote on set-up and Plate and the set-up intro are upright, 16 px, ink2 |  |
| B1 | 01 setup-1-goal-food | COSMETIC | Leave-out pills do not say several can be chosen | FIXED cd75c34: "Leave out completely (choose any)" |  |
| B1 | 01 setup-1-goal-food | COSMETIC | Goal tiles have icons, diet tiles do not | DECIDED (owner, 14 Nov, option survey): keep as is, icons on goal tiles only. No change | |
| B1 | 01-08 every screen | COSMETIC | Masthead tagline "your daily plate, journalled" | DECIDED (owner, 14 Nov, option survey): drop the tagline. Done c697d3b: build6.js leaves it out of the v6 page | plate-hero, setup-1-goal-food |
| B1 | 02 setup-from-link | COSMETIC | Nothing confirms the coach's link was kept | FIXED cd75c34: "Your coach's link is saved on this phone." on step 1 | setup-from-link |
| B1 | 03 setup-2-health | BLOCKER | Health was one choice, so a referral could be skipped | FIXED bbe6c52 (owner decision: tick all that apply) | setup-2-two-conditions, plate-two-conditions-referred |
| B1 | 03 setup-2-health | MINOR | Kidney or pregnancy still asks the body step, then shows no plate | FIXED cd75c34: the referral line shows on step 2 and the button reads Done | setup-2-referred |
| B1 | 03 setup-2-health | MINOR | "Minding any nutrient?" and "Calcium and D" | FIXED cd75c34: "Want more of a nutrient?", "Calcium and vitamin D"; the Plate pill reads "More of"; the plan tag reads "more iron" |  |
| B1 | 03 setup-2-health | MINOR | Health condition goes to Gemini without a word where it is chosen | FIXED cd75c34 with 01-3 (the set-up intro states it before the health step) |  |
| B1 | 03 setup-2-health | COSMETIC | "No, neither" wraps in its pill | FIXED cd75c34: "No" |  |
| B1 | 04 setup-3-body | MAJOR | Height only in cm, wrong values wiped silently | FIXED bbe6c52 | setup-3-feet |
| B1 | 04 setup-3-body | MINOR | Nothing says the step can be skipped | FIXED cd75c34: "You can leave them empty; then plates have no calorie or protein target." |  |
| B1 | 04 setup-3-body | MINOR | Boxes do not look like boxes; unit lost once typed | FIXED cd75c34: 1 px ink border; labels "Age (years)", "Height (cm)", "Weight (kg)"; height hint "cm or ft" |  |
| B1 | 04 setup-3-body | MINOR | "Activity" sits 10 px under the boxes | FIXED cd75c34: spaced as its own question (22 px) |  |
| B1 | 05 plate-loading | MINOR | Asks look live while busy, taps dropped | FIXED cd75c34: prompts and send are off with "Wait for this plate first." | plate-loading-asks |
| B1 | 05 plate-loading | MINOR | No sign of how long the wait is | FIXED cd75c34, wording in the final commit: "It can take a minute or so." under every wait line (the request may run up to 95 s, so no shorter figure is promised) |  |
| B1 | 05-08 | MINOR | Example asks do not fit these clients | DECIDED (owner, 14 Nov, option survey): "Only dal, rice and curd at home", "A light dinner after a heavy lunch", "Guests at home tonight", "Tired, something quick"; gym, trek and restaurant asks dropped; the diet filter still applies. Done be6bc7b | plate-hero, plate-leave-two |
| B1 | 05-08 | MINOR | Today line splits figures from units at 130 % | FIXED cd75c34: no-break spaces in directive() (engine) |  |
| B1 | 05 plate-loading | COSMETIC | Rim words run together at 130 % | NOT-A-DEFECT: ornament under owner decision D5; the meal tabs above say the same at full size |  |
| B1 | 05-08 | COSMETIC | "planned around:" in lower case | FIXED cd75c34: "Planned around:" |  |
| B1 | 05 plate-loading | COSMETIC | "Lunch carries about 480 kcal" | FIXED cd75c34: "Lunch: about 480 kcal and 31 g protein" |  |
| B1 | 06 plate-hero | MAJOR | One-tap changes styled as main buttons, on by colour only | FIXED bbe6c52 |  |
| B1 | 06 plate-hero | MINOR | Two sets of grams in the same colours | FIXED 6a0d9aa: the tiles are headed "Nutrients in this plate" |  |
| B1 | 06 plate-hero | MINOR | "Fit 90 / 100" and "Rise" unexplained | FIXED cd75c34 for Rise: the tile reads "Sugar rise". DECIDED for Fit (owner, 14 Nov, option survey): "Close to your target: 90 / 100" on the plate, the menu orders, the other orders and Rescue. Done 388013c | plate-hero, rescue-menu-order, rescue-result |
| B1 | 06 plate-hero | MINOR | "Try it" reads like "try eating it" | FIXED cd75c34: "Change the mix" |  |
| B1 | 05-08 | MINOR | Day tiles and setting pills hidden off the right edge | FIXED cd75c34: pills wrap, tiles sit three across | plate-dial-open |
| B1 | 05-08, B4 29 | MINOR | Fixed header, ask bar and tabs take about 35-40 % of the screen | DECIDED (owner, 14 Nov, option survey): the date line and the food line scroll away; NEXT PLATE, the meal tabs and the ask bar stay; same look. Done 7d4c209 | plate-hero |
| B1 | 05-08 | MINOR | Nothing says the food line opens My food | FIXED cd75c34: "My food: Vegetarian · North" |  |
| B1 | 06 plate-hero | COSMETIC | Sixth dot cut off under the dish title | FIXED cd75c34: 60 px, five whole dots |  |
| B1 | 06 plate-hero | COSMETIC | "+" before a pair that means "later" | FIXED cd75c34: a pair that names a time (later, after, hour) gets a clock mark |  |
| B1 | 06 plate-hero | COSMETIC | Wrapped one-tap label drifts from its icon | FIXED cd75c34: labels start beside the icon |  |
| B1 | 07 plate-old-saved | MINOR | A kept plate is replaced with no word | FIXED cd75c34: "Plates were updated after an app change, so this plate is new." on the meals concerned | plate-old-saved |
| B1 | 08 plate-leave-two | MAJOR | "Nutty" on a no-nuts plate | FIXED bbe6c52 |  |
| B1 | 08 plate-leave-two | MINOR | Dead one-tap buttons stay on screen | FIXED cd75c34: only offered changes show; the rest are named in one line | plate-tune-failed |
| B1 | 08 plate-leave-two | COSMETIC | "10-minute" breaks at its hyphen | FIXED cd75c34: each name in the line stays whole |  |
| B1 | 08 plate-leave-two | COSMETIC | Chips mix food rules and plate facts at 130 % | NOT-A-DEFECT: each chip keeps its own mark (tick for a food rule, target for Fit, clock for time); forcing two rows would cost a row on every phone at normal text |  |
| B2 | 09 plate-no-body | BLOCKER | Low-sugar warning missing without body data | FIXED bbe6c52 | plate-skipped-meds-no-body |
| B2 | 09 plate-no-body | MINOR | Only sign the plate is not sized is at frame 5 | FIXED cd75c34: a note above the plate, "These portions are not yet sized for you.", with a link | plate-no-body |
| B2 | 09 plate-no-body | MINOR | "Add them now" opens My food at the top | FIXED cd75c34: My food opens at the first missing answer, focused | plate-no-body-add |
| B2 | 09 plate-no-body | MINOR | Note asks only for height and weight | FIXED cd75c34: names what is missing (age, height, weight, sex, activity) | plate-no-body |
| B2 | 09 plate-no-body | MINOR | Suggested asks do not fit these clients | DECIDED (as B1 05-08, example asks). Done be6bc7b | plate-hero, plate-leave-two |
| B2 | 10 plate-dial-open | MINOR | Tapped pill scrolls away; panel has no name | FIXED cd75c34: pills wrap; "How hungry are you for lunch?" | plate-dial-open |
| B2 | 10 plate-dial-open | MINOR | Moving the slider changes nothing | FIXED cd75c34: a change re-plans like every other choice, and Plan my plates comes into view | plate-appetite-moved |
| B2 | 10 plate-dial-open | MINOR | Slider top line squeezed at 130 % | FIXED cd75c34: the value on its own line, the two ends under the slider |  |
| B2 | 11 plate-swap-open | MINOR | Current option does not match the plate | FIXED cd75c34: option 0 shows the plate's own item, "(on your plate)" | plate-swap-open |
| B2 | 11 plate-swap-open | MINOR | Base swaps show no change | FIXED cd75c34: the biggest change in words (carbs, then fibre, then kcal) |  |
| B2 | 11 plate-swap-open | MINOR | "Base" is a cook's word | FIXED cd75c34: "Grains and starch", as in the legend |  |
| B2 | 11 plate-swap-open | MINOR | Two-line options cramped at 130 % | FIXED cd75c34: more padding and line height, left-aligned |  |
| B2 | 11 plate-swap-open | COSMETIC | "(-4 g" breaks from "protein)" | FIXED cd75c34: "(4 g less protein)" with a no-break space |  |
| B2 | 11 plate-swap-open | COSMETIC | "× Done" reads as cancel | FIXED cd75c34: tick and "Done" |  |
| B2 | 12 plate-one-tap-on | BLOCKER | Serving list keeps the old grain grams | FIXED bbe6c52 | plate-one-tap-on |
| B2 | 12 plate-one-tap-on | MINOR | On state by colour only; no undo hint | FIXED bbe6c52 (tick) and cd75c34 ("Tap a change again to undo it.") |  |
| B2 | 12 plate-one-tap-on | COSMETIC | Wrapped labels away from icons | FIXED cd75c34 (as B1 06-10) |  |
| B2 | 13 plate-logged | MINOR | "Change" does not say it reopens the meal | FIXED cd75c34: "Reopen lunch" |  |
| B2 | 13 plate-logged | MINOR | "Plan snack" leads to a 40 kcal target | DECIDED (owner, 14 Nov, option survey): under 120 kcal left for the snack, the card offers the next main meal still open ("Plan dinner") with "Little is left for a snack today." Done f5f0d78 | plate-logged |
| B2 | 13 plate-logged | MINOR | Today line splits figures at 130 % | FIXED cd75c34 (as B1 05-4) |  |
| B2 | 13 plate-logged | COSMETIC | Gap between dish and figures | FIXED cd75c34: no margin under the dish name |  |
| B2 | 14 toast | MINOR | Toast covers and blocks the next actions | FIXED cd75c34: taps pass through it |  |
| B2 | 14 toast | COSMETIC | Bold italic toast text | FIXED cd75c34: upright |  |
| B2 | 14 toast | COSMETIC | "The rest of the day follows it" | FIXED cd75c34: "Your next meals adjust to it." |  |
| B2 | 15 plate-skipped-meds | BLOCKER | Warning missing without body data | FIXED bbe6c52 (as 09-1) | plate-skipped-meds-no-body |
| B2 | 15 plate-skipped-meds | MAJOR | Warning looks like fine print | FIXED bbe6c52 |  |
| B2 | 15 plate-skipped-meds | MINOR | Warning toast too short | FIXED bbe6c52: the card leads with the warning; no duplicate toast; a warning toast lasts 7 s |  |
| B2 | 15 plate-skipped-meds | MINOR | Warning gives no step for now | DECIDED (owner, 14 Nov, option survey): the warning adds "If you feel shaky, sweaty or dizzy, have something sweet now, such as a glass of juice or 3 teaspoons of sugar in water, and call your doctor." on the card and in the spoken line. Done 70080d1 | plate-skipped-meds |
| B2 | 15 plate-skipped-meds | COSMETIC | "Lunch –" tab and "skipped" twice | FIXED cd75c34: the tab is spoken "Lunch, skipped"; the caption no longer repeats "skipped" |  |
| B2 | 16 plate-asked | MINOR | Logged card never appears for an asked plate | FIXED cd75c34 | plate-asked-logged |
| B2 | 16 plate-asked | MINOR | Cannot show whether the answer honours the ask | MOCK-ONLY: the stand-in answer is fixed |  |
| B2 | 16 plate-asked | COSMETIC | Plate starts at the fold at 320 px | NOT-A-DEFECT: the reviewer judged it acceptable; the answer leads |  |
| B3 | 17 sheet-my-food | BLOCKER | Closing without Done keeps old plates | FIXED bbe6c52 | sheet-food-closed-by-band |
| B3 | 17 sheet-my-food | MAJOR | Done throws away plates with no change | FIXED bbe6c52 | sheet-food-done-no-change |
| B3 | 17 sheet-my-food | MINOR | Done out of reach on a long sheet | FIXED 6a0d9aa: the sheet header stays at the top |  |
| B3 | 17 sheet-my-food | MINOR | Height and weight lose units; feet cleared silently | FIXED cd75c34 (units in labels) and bbe6c52 (feet read, a line says what to type) |  |
| B3 | 17 sheet-my-food | MINOR | "Calcium and D" | FIXED cd75c34 |  |
| B3 | 17 sheet-my-food | MINOR | Data paragraph is one 50-word sentence | FIXED 6a0d9aa: two short sentences |  |
| B3 | 17 sheet-my-food | COSMETIC | Sheet title lighter than its questions | FIXED 6a0d9aa: weight 600 |  |
| B3 | 17 sheet-my-food | COSMETIC | "Activity" caption crowded | FIXED cd75c34 |  |
| B3 | 17 sheet-my-food | COSMETIC | Sheet edge crosses the line behind it | NOT-A-DEFECT: a sheet lies over the dimmed page by design |  |
| B3 | 18 sheet-data-confirm | MAJOR | Question leaves out the coach's link | FIXED bbe6c52: the code is kept and the question says so |  |
| B3 | 18 sheet-data-confirm | MINOR | No word after removal | FIXED cd75c34: "Your data was removed from this phone." on set-up | setup-after-remove |
| B3 | 18 sheet-data-confirm | COSMETIC | Pink box outside the palette | NOT-A-DEFECT: the reviewer accepts it for a destructive action |  |
| B3 | 19 sheet-how-numbers | MINOR | "Your coach can change them" is untrue | FIXED 6a0d9aa: "If one looks wrong for you, ask your coach." | sheet-how-numbers |
| B3 | 19 sheet-how-numbers | MINOR | No headline figure | FIXED 6a0d9aa: "Your day: about 1200 kcal, 75 g protein and 25 g fibre." | sheet-how-numbers |
| B3 | 19 sheet-how-numbers | MINOR | Formula names and jargon lead | FIXED 6a0d9aa: plain reason first, sources in brackets; "To stay at your weight" for maintenance |  |
| B3 | 19 sheet-how-numbers | COSMETIC | Green ticks read as "passed" | FIXED 6a0d9aa: plain bullets |  |
| B3 | 19 sheet-how-numbers | COSMETIC | Title leaves "out" alone | FIXED 6a0d9aa: balanced title |  |
| B3 | 19 sheet-how-numbers | COSMETIC | "realistic" | FIXED 6a0d9aa: "within reach" |  |
| B3 | 20 sheet-log-ask | MINOR | One-line box hides the start of the meal | FIXED 6a0d9aa: a two-line box; Enter still counts it |  |
| B3 | 20 sheet-log-ask | MINOR | Send arrow has no word | FIXED 6a0d9aa: a "Count it" button |  |
| B3 | 20 sheet-log-ask | COSMETIC | Typed text italic like the hint | FIXED 6a0d9aa: upright |  |
| B3 | 20 sheet-log-ask | COSMETIC | Frames 1 and 2 identical | NOT-A-DEFECT: the sheet does not scroll |  |
| B3 | 21 sheet-log-estimate | MINOR | Totals are the smallest text | FIXED 6a0d9aa: kcal as a figure on its own line |  |
| B3 | 21 sheet-log-estimate | MINOR | "Not quite" does not say what it does | FIXED 6a0d9aa: "Change it" |  |
| B3 | 22 sheet-log-busy | MINOR | Focus goes to the box and raises the keyboard; not announced | FIXED 6a0d9aa: the note has focus and is spoken | sheet-log-busy |
| B3 | 22 sheet-log-busy | COSMETIC | "Try again in a minute" beside a ready Try again | FIXED cd75c34 ("Wait a minute, then tap Try again.") and 6a0d9aa (Try again is the one main button) |  |
| B3 | 23 sheet-log-error | MINOR | Same focus problem | FIXED 6a0d9aa (as 22-1) | sheet-log-busy |
| B3 | 23 sheet-log-error | COSMETIC | State named "could not reach" shows another error | FIXED 6a0d9aa: screen book name "no answer came"; the no-signal wording has its own state, sheet-log-offline |  |
| B3 | 24 plate-error | MINOR | Try again is not the main button | FIXED cd75c34 |  |
| B3 | 24 plate-error | MINOR | "How these numbers are worked out" does not look tappable | FIXED cd75c34: underlined |  |
| B3 | 24 plate-error | COSMETIC | "Try again." above a Try again button | FIXED cd75c34: messages end at the cause where a button follows |  |
| B3 | 24 plate-error | COSMETIC | "made today" stamp under an error | NOT-A-DEFECT: brand mark under D5 |  |
| B3 | 25 plate-limit | MINOR | Asks stay live at the limit | FIXED cd75c34: prompts give way to "New asks open again at 5:30 am."; send is off; typed words stay | plate-ask-limit |
| B3 | 25 plate-limit | MINOR | No next step with no plates | FIXED cd75c34: "Your day, below, still shows what this meal should hold." |  |
| B3 | 25 plate-limit | COSMETIC | "today's limit" does not say why | FIXED cd75c34: "You have used today's new plates. They open again at 5:30 am." | plate-limit |
| B3 | 26 plate-ask-busy | MINOR | Note does not name the failed ask | FIXED cd75c34: "Your ask “…” didn't go through." | plate-ask-busy |
| B3 | 26 plate-ask-busy | COSMETIC | "your last plates" | FIXED cd75c34: "the plates from before" | plate-ask-empty |
| B3 | 27 plate-ask-limit | MINOR | Typed ask beside a live send | FIXED cd75c34 (as 25-1) | plate-ask-limit |
| B3 | 27 plate-ask-limit | MINOR | Note does not name the ask | FIXED cd75c34 (as 26-1) |  |
| B3 | 28 plate-no-code | MINOR | Lock met only after set-up | DECIDED (owner, 14 Nov, option survey): a phone with no code (no ?k=, none kept) sees the coach's-link message before set-up, on the plate's no-code card; a phone that opened the link once is unaffected. Done b46de32; every other review state is seeded with a code | setup-no-code, setup-from-link |
| B3 | 28 plate-no-code | MINOR | Prompts, composer, Builder and Rescue stay live and fail | FIXED in part cd75c34: on Plate the prompts give way to one line and send is off; Builder and Rescue still say the same message on use (part of the 28-1 question) |  |
| B4 | 29 builder | MINOR | Screen does not say what it is for; "Slow carbs" | FIXED 6a0d9aa: "Choose how much of the plate each part takes. Then plan your meal with it."; "Grains (roti, rice, millet)" |  |
| B4 | 29 builder | MINOR | Plan button below the fold | DECIDED (owner, 14 Nov, option survey): once a share is changed, the button holds above the tab bar; otherwise it stays in the page; nothing is under it at the end of the page at 320 px or 130 % text. Done 5278f9b | builder, builder-adjusted |
| B4 | 29 builder | MINOR | Curve legend unclear | FIXED 6a0d9aa: "this plate" alone with no habit ticked; "with the habits you ticked" and "if you eat carbs first and sit after" when one is |  |
| B4 | 29 builder | MINOR | Fixed masthead takes 27 % | DECIDED (as B1 05-08, fixed header). Done 7d4c209: the date line and the food line scroll away in the Builder too | plate-hero |
| B4 | 29 builder | COSMETIC | Habit tiles uneven | FIXED in part 6a0d9aa: lines start at the top of each tile; the third tile alone in its row stays (two columns at 360 px) |  |
| B4 | 29 builder | COSMETIC | Ring centre fills the hole at 130 % | FIXED 6a0d9aa: figure 26 px |  |
| B4 | 30 builder-adjusted | MAJOR | Curve caption claims it follows the shares | FIXED 392dfe1 |  |
| B4 | 30 builder-adjusted | MINOR | Nothing says the change is not used yet | FIXED 6a0d9aa: "Changed. Tap “Plan lunch with this plate” to use it." | builder-adjusted |
| B4 | 32 rescue-entry | MINOR | The explanation comes last, small and faint | FIXED 6a0d9aa: one line under the title at body size; the bottom paragraph is gone | rescue-entry |
| B4 | 32 rescue-entry | MINOR | Dish chips unlabelled; pressed state unstyled | FIXED 6a0d9aa: "Or tap a common dish"; pressed chip in ink | rescue-entry |
| B4 | 32 rescue-entry | COSMETIC | Mixed alignment | FIXED 6a0d9aa: all left-aligned |  |
| B4 | 32 rescue-entry | COSMETIC | Tab underline cuts "Rescue" at 130 % | FIXED 6a0d9aa: mark moved to 2 px from the bottom |  |
| B4 | 32 rescue-entry | COSMETIC | "Eating out anyway" may read as a scolding | DECIDED (owner, 14 Nov, option survey): "Eating out". Done 3ba356d | rescue-entry |
| B4 | 33 rescue-wait | MINOR | Controls live during the wait, taps dropped | FIXED 6a0d9aa: camera, send and chips are off during a wait | rescue-wait |
| B4 | 33 rescue-wait | MINOR | "Taking apart", no time | FIXED 6a0d9aa: "Working out masala dosa with chutney" and the wait time line |  |
| B4 | 33 rescue-wait | COSMETIC | Dots wrap onto their own line | FIXED 6a0d9aa: the dots stay with the last word |  |
| B4 | 33 rescue-wait | COSMETIC | Two different Rescue wait cards | FIXED 6a0d9aa: both use the plate wait card |  |
| B4 | 34 rescue-result | MAJOR | "Moves that make it fit" over a pre-ticked move that makes it worse | FIXED bbe6c52 (owner decision: moves start off) and 6a0d9aa ("Moves you can make") | rescue-result |
| B4 | 34 rescue-result | MINOR | Bars have no legend; Fit unexplained | FIXED 6a0d9aa: "As served, then with the moves you tick". Fit wording DECIDED (as B1 06-3): "Close to your target". Done 388013c | rescue-result |
| B4 | 34 rescue-result | MINOR | A portion move dropped for naming the typed dish | FIXED 6a0d9aa: a portion move keeps the words the person typed (core checkRescue) | rule check "Rescue: a portion move that names the typed dish stays" |
| B4 | 34 rescue-result | MINOR | Review state shows text no client sees | MOCK-ONLY: fixture dish and breakdown |  |
| B4 | 34 rescue-result | MINOR | Energy row breaks, arrow hanging, at 130 % | FIXED 6a0d9aa: the arrow stays with the new figure |  |
| B4 | 35 rescue-busy | MINOR | "Try again in a minute" vs a ready button | FIXED cd75c34: "Wait a minute, then tap Try again." |  |
| B4 | 35 rescue-busy | COSMETIC | Bottom paragraph repeats under errors | FIXED 392dfe1 and 6a0d9aa (paragraph removed) |  |
| B4 | 36 rescue-limit | MAJOR | No next step at the table | FIXED 392dfe1 (next step) and 6a0d9aa (entry tools after the note, off during waits) |  |
| B4 | 36 rescue-limit | MINOR | "Today's limit" assumes the client knows | FIXED cd75c34: "You have used today's requests for Next Plate. They open again at 5:30 am." |  |
| B4 | 37 rescue-error | COSMETIC | "Try again" twice | FIXED cd75c34 |  |
| B4 | 37 rescue-error | COSMETIC | Bottom paragraph repeats | FIXED 392dfe1 and 6a0d9aa |  |
| B5 | 38 rescue-menu-typed | MINOR | Main action below the fold at 320 px | FIXED in part 6a0d9aa and the final commit: the box starts at 110 px on short screens and the guide line under the title hides once the box is open; with a long pasted menu the box grows to half the screen, so at 320 x 568 the button still needs one scroll |  |
| B5 | 38 rescue-menu-typed | MINOR | Guide promises "the reason" | FIXED 6a0d9aa: the guide line is rewritten and moved under the title |  |
| B5 | 38 rescue-menu-typed | COSMETIC | Three Gemini notices and a repeated guide | FIXED 6a0d9aa and the final commit: the photo note and the guide line hide while the box is open; the bottom guide paragraph is gone |  |
| B5 | 38 rescue-menu-typed | COSMETIC | "or type the menu" not underlined, same label when open | FIXED 6a0d9aa: underlined; "Hide the typed menu" when open |  |
| B5 | 38 rescue-menu-typed | COSMETIC | Box opens scrolled to the end; line cut at 130 % | FIXED 6a0d9aa: the box grows with its text up to half the screen |  |
| B5 | 39 menu-wait | MINOR | Controls live but do nothing during the read | FIXED 392dfe1 (camera not primary) and 6a0d9aa (camera, send, chips off) | menu-wait |
| B5 | 39 menu-wait | MINOR | No time; typed menu vanishes | FIXED 6a0d9aa: time line and "Your menu stays here if it doesn't work." |  |
| B5 | 39 menu-wait | COSMETIC | Dots wrap at 320 px | FIXED 6a0d9aa |  |
| B5 | 40 rescue-menu-order | MINOR | The answer does not lead | FIXED 392dfe1 |  |
| B5 | 40 rescue-menu-order | MINOR | With diabetes the sweet is dropped from Leave for another day | FIXED 6a0d9aa (engine) | rule check "menu: with diabetes the sweet stays in Leave for another day" |
| B5 | 40 rescue-menu-order | MINOR | Grain side shows a count only | FIXED bbe6c52 (owner decision: count and grams) | rule check "menu: a grain side shows its count and its grams" |
| B5 | 40 rescue-menu-order | COSMETIC | "heavy for a dinner" on lunch; "2 Tandoori Roti" | MOCK-ONLY: test/v6/fixture-menu.js text |  |
| B5 | 40 rescue-menu-order | COSMETIC | "Ask:" looks like a link; builder fine print | FIXED 6a0d9aa: "Ask the waiter:" upright in ink; "Next Plate checks the dishes against your food rules and ranks them." |  |
| B5 | 41 menu-nothing-fits | MINOR | "passed the checks" | FIXED 392dfe1 |  |
| B5 | 41 menu-nothing-fits | MINOR | Note in the wrong place; guide repeats | FIXED 392dfe1 (note first) and 6a0d9aa (guide gone) |  |
| B5 | 41 menu-nothing-fits | COSMETIC | Menu box has no border; half line cut | FIXED 6a0d9aa: ink border; box grows with its text |  |
| B5 | 41 menu-nothing-fits | COSMETIC | Error note on the same paper as a tip | DECIDED (owner, 14 Nov, option survey): a thin clay rule on the left of every error note (class err: plate, ask, log, Rescue, menu); tips and info notes unchanged; contrast stays AA. Done 14ce1ce | plate-error, plate-ask-busy, sheet-log-busy, rescue-error, menu-error, menu-nothing-fits |
| B5 | 42 menu-unreadable | MINOR | Note names two steps with no control | FIXED 6a0d9aa: "Take another photo" and "Type the menu" in the note | menu-unreadable |
| B5 | 42 menu-unreadable | COSMETIC | "type the dishes" vs "type the menu" | FIXED 6a0d9aa |  |
| B5 | 43 menu-unparsed | MINOR | "came back cut off" | FIXED 392dfe1 | menu-unparsed |
| B5 | 43 menu-unparsed | MINOR | Two buttons resend; the weaker is the one named | FIXED 6a0d9aa: Try again is primary, "Read this menu" outlined while it shows | menu-unparsed |
| B5 | 43 menu-unparsed | COSMETIC | "Try again." before a Try again button | FIXED cd75c34 |  |
| B5 | 44 menu-error | MINOR | Two buttons resend | FIXED 6a0d9aa (as 43-2) |  |
| B5 | 44 menu-error | MINOR | Error not announced | FIXED 6a0d9aa: menu, Rescue, plate and log errors are written to the live region |  |
| B6 | 45 menu-grain-yes | MINOR | Two filled primaries | FIXED 392dfe1 |  |
| B6 | 45 menu-grain-yes | MINOR | Grain shown as a count only | FIXED bbe6c52 (owner decision) |  |
| B6 | 45 menu-grain-yes | MINOR | "available, you checked" in the faintest style | FIXED 6a0d9aa: upright, 16.5 px, ink |  |
| B6 | 45 menu-grain-yes | COSMETIC | "Change answer" not underlined, 4 px off | FIXED 6a0d9aa |  |
| B6 | 46 menu-grain-no | MINOR | "every order on this menu needs it" is untrue | FIXED 6a0d9aa: "every order Next Plate picked from this menu needs it". A server fallback to the next-ranked orders is a feature, not done | menu-grain-no |
| B6 | 46 menu-grain-no | MINOR | Next step out of view; intro and primary invite the same read | FIXED 392dfe1 (intro hidden, not primary) and 6a0d9aa ("Name the dish" button in the note) | menu-grain-no |
| B6 | 47 menu-grain-next | COSMETIC | "grain" is the app's word | FIXED 6a0d9aa: names the grain asked about ("Your plan keeps tandoori roti with this meal.") |  |
| B6 | 48 menu-grain-again | MINOR | Screen book name and route wrong | FIXED 6a0d9aa: "the same menu read again after No" |  |
| B6 | 48 menu-grain-again | COSMETIC | Nothing says the No is carried over | FIXED 6a0d9aa: "(your earlier answer)" | menu-grain-again |
| B6 | 49 menu-grain-undo | COSMETIC | Screen book route describes the screen before | FIXED 6a0d9aa |  |
| B6 | 49 menu-grain-undo | COSMETIC | "now?" alone on a line | FIXED 6a0d9aa: balanced question |  |
| B6 | 50 menu-grain-other | MINOR | Screen book name and route wrong | FIXED 6a0d9aa: "a different menu after a No" |  |
| B6 | 51 menu-grain-two | MINOR | After Yes to rice nothing records it | FIXED 6a0d9aa: "Steamed rice: available, you checked." above the second question | menu-grain-two |
| B6 | 51 menu-grain-two | MINOR | Yes then No drops the order and the note forgets the Yes | FIXED 6a0d9aa: the note names the Yes. DECIDED (owner, 14 Nov, option survey): the order is still set aside and the next one offered; the trace line says why ("Dal Tadka needs roti too, so it is set aside."). Done ebcb75c | menu-grain-yes-then-no, menu-grain-yes-then-no-next |
| B6 | 52 plate-blocked-kidney | MINOR | "This one is…" heading | FIXED cd75c34: "Plan your meals with your coach and doctor" | plate-blocked-kidney |
| B6 | 52 plate-blocked-kidney | MINOR | No next step for a person with the condition | DECIDED (owner, 14 Nov, option survey): keep the referral card as it is; no added line. Nothing to restore. Guard added 88265e4 | plate-blocked-kidney |
| B6 | 52 plate-blocked-kidney | MINOR | Change my answers opens My food at the top | FIXED cd75c34: opens at the health question, the ticked answer focused | plate-blocked-change |
| B6 | 53 plate-blocked-preg | COSMETIC | "nursing" | FIXED cd75c34: "breastfeeding" in set-up and the card |  |
| B6 | 54 builder-blocked | COSMETIC | "Build the plate" over a referral | FIXED 6a0d9aa: no title when referred | builder-blocked |
