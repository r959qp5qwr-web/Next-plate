VERDICT: FAIL
BUILD: d5037b16ba0f457f737949a45a692fdea3263c56d92bacdcea486bab990be12c

# Critic round 28 (branch claude/nice-hawking-307ljy, HEAD 372895a, diff read 6182157..372895a)

## What I measured on this state
- `npm run rules`: passes on all three pages ("every rule check holds", exit 0; round 27 block included).
- `npm run review`: passes on the first run. 9 runs, 46 states, 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze).
- test/ux/allow.json and test/words/allow.json are not in the diff. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- My round 27 probes on this build (scratchpad/r28/new.html) against the round 26 fix build (old26.html): m27 0 wrongly offered, 2 wrongly refused ("DINNER MENU / Roti 30" and "Dinner / Dal Tadka 240 / Roti 30" at lunch); dec all offered but "Roti 15 to 20"; din r at lunch, O at dinner on every line; bf all offered; later and later2 0 offered of 120; k27 0 of 39 offered, 0 of 16 held. Round 26 probes (m26, k26): unchanged, 0 wrong. The builder's figures hold for the probes I wrote.
- New probes, all in /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r28/ (a.js 110 menus, h.js 91 headings, full.js, t.js, n.js, k.js 29 one-tap notes). Columns: this build, then old26. Menus on the nonveg profile with diabetes; the served page hosted/v6/index.min.html reads the same (h.js and full.js re-run on it).

## Round 27's findings, checked
- A (paise and ranges read as times; meal headings ignore the meal asked): fixed for every wording I named. The new fail-closed heading reading and the whole-menu sold-out reading open a broader regression (finding A below).
- B (a later sentence saying the grain is over): fixed for every wording I named (later2 0 of 120). Near forms remain (finding C).
- C (closed-tandoor wordings, tildes): fixed for every wording I named (m27 0 of 58 offered). Hour forms without am/pm regress and near forms remain (finding B).
- D (later-meal one-tap wordings): fixed for every wording I named (k27 0 of 39). Near forms remain (finding D).

## Findings, most serious first

### A. MAJOR, regression (A14 menu side; part B empty states). Ordinary typed menus with common section names sell no grain again; with diabetes the person gets "No dish on that menu passed the checks for you".
- Surface: Rescue, Read the menu, typed or pasted menus (porGrain() is skipped for a photo), with diabetes. Engine-side, every width and scheme. Screen the person lands on: test/ux/out/screens/360-dark/menu-nothing-fits-2.png ("No dish on that menu passed the checks for you. Try another page of the menu, or name the dish you want." Another page reads the same way).
- Evidence, full menu (full.js): "MAIN COURSE / Dal Tadka 240 / Palak Paneer 300 / Chicken Curry 320 / ASSORTED BREADS / Tawa Roti 20 / Butter Naan 50 / RICE VARIETIES / Jeera Rice 140 / Steamed Rice 110" at lunch, three dishes with roti, naan and jeera rice: this build status "empty", dropped {"diabetes-grain":3}; the round 26 build offers all 3. Same on index.min.html.
- Fail-closed headings (h.js): 39 of 91 ordinary bread and rice section names are now refused, all 39 offered by old26: ASSORTED BREADS, Assorted Indian Breads, BREAD BASKET, Tandoori Rotiyan, ROTIYAN, Rotiyaan, Desi Rotiyan, ROTI KI TOKRI, ROTI SECTION, ROTI CORNER, Chapati Corner, FLAT BREADS, Freshly baked breads, BREAD SELECTION, Tandoori Khazana, Breads (assorted), BREADS (choose any), Naan Varieties, Paratha Varieties, Kulcha Corner, THE BREAD BAR, Breads of India, Roti Ghar, Bread Box, RICE VARIETIES, RICE PREPARATIONS, Rice Dishes, Rice Corner, Rice Section, From the Handi, Handi & Rice, Steamed & Flavoured Rice, Flavoured Rice, Choice of Rice, Rice (assorted). Cause: HEADMARK's last line (src/v6/engine.js, soldItems, `return words(lx...).some(...)`) marks a heading for any word outside HEADW, HOURW, QUALW and the food lists, and the heading's own name ("assorted", "basket", "varieties", "rotiyan", "corner") is read like a note on it.
- Headings that name this meal and another (t.js), refused on this build, offered on old26: "LUNCH & DINNER MENU", "BREADS (lunch & dinner)", "BREADS (lunch and dinner)", "BREADS (lunch / dinner)" at lunch; "BREADS (lunch & dinner)" and "Lunch & Dinner / Dal Tadka 240 / Roti 30" at dinner; "BREADS (breakfast & lunch)" at lunch. Cause: MEALW marks on any other meal word even when this meal is named too.
- Whole-menu marks by grain, not by item (a.js, n.js; refused on this build, offered on old26): "Jeera Rice 140 - sold out" removes "Steamed Rice 110"; "Missi Roti 40 - finished" removes "Roti 30"; "* Tandoor items after 7 pm" at lunch removes "Tawa Roti 20"; "Dal tadka, jeera rice, rice kheer. Rice kheer is over." and "Jeera Rice 140 / Rice Kheer - finished" and "Rice kheer over" remove the jeera rice (the builder's note says NOTSOLD dishes do not mark their grain; the sentence path in soldItems has no NOTSOLD test); "Bread Pakora - over" removes "Roti 30"; "Rice over, roti available" removes the roti; "We make every roti over a hot tawa" removes the roti.
- Why it matters: this is the round 27 MAJOR in another form. The person with diabetes, mid-meal, pastes an ordinary menu that plainly sells roti and rice and is told nothing fits; the second suggestion (another page) repeats it. One sold-out variety ("Jeera Rice - sold out", "Missi Roti - finished") takes every rice or roti off a menu that still sells plain rice and plain roti.
- Smallest correction: (1) read fail-closed only the note on a heading (the part in brackets, after " - " or after ":"), not the heading's name; the name before it stays a section name ("ASSORTED BREADS", "RICE VARIETIES", "Roti Ki Tokri"), while "TANDOOR (under repair)", "(kal se)", "(Sat & Sun)" stay marked; an unbracketed heading keeps the round 26 word list ("band", "closed", "not", "only", ...). (2) A meal word marks only when the line names no word for this meal ("LUNCH & DINNER" sells at either). (3) A marked item takes off that item ("jeera rice", "missi roti", "tandoori" breads), not every item with the same grain key; a bare grain ("Roti finished", "Rice over") takes off the grain; apply NOTSOLD and the "over a / over the" reading on the sentence path too. Add the 39 headings, the meal pairs and the item marks to the rules block in the sold direction.

### B. MINOR, partly a regression on the unsafe side (owner rule 3; A14). Tandoor hours written without am/pm, or in Hindi forms, sell the tandoor breads at lunch.
- Evidence (a.js; offered on this build): regressions, refused on old26: "TANDOOR (7-11)", "TANDOOR (7 to 11)", "TANDOOR 7-11", "TANDOOR (ready in 7 hrs)" over "Tandoori Roti 30". Offered on both builds: "TANDOOR (7 baje se)", "TANDOOR (7 baje)", "TANDOOR (7 se 11)", "TANDOOR (1900-2300 hrs)", "TANDOOR (ready at 7)", and "TANDOOR / Tandoori Roti 30 / (after 7 pm)" (the time on a line of its own under the item). Cause: the new TIMEN needs am/pm/hrs on a range, so "7-11" on a heading becomes a price, the heading is a priced line and is not read as a heading; window_() has no "N baje", "N se M" or four-digit range forms.
- Why it matters: with diabetes the order shows "dal with 2 tandoori roti" at lunch from a menu whose tandoor opens at 7; the plan counts a grain the person cannot get.
- Smallest correction: on a line with no other number, read "a-b" or "a to b" with both at most 12 as hours, not a price (a price range sits after an item name); add "N baje", "N baje se", "N se M", "HHMM-HHMM hrs" and "ready at N" to window_(); read a bracketed time line under an item as that item's mark.

### C. MINOR, remainder of round 27 B (owner rule 3; A14). Other plain wordings that the grain is over still sell it.
- Evidence (a.js; offered on this build and on old26): "Dal tadka, paneer, roti. Out of roti.", "Dal tadka, paneer, roti. We ran out of roti.", "Dal tadka, paneer, roti. Kitchen has run out of rotis", and a later note "Tandoor not working today" under "Tandoori Roti 30". (The heading form "TANDOOR (not working)" is refused.)
- Smallest correction: add "out of <grain>", "ran out", "run out", "not working" to SOLDOUT and to the words-before-grain test in the free-list filter.

### D. MINOR, remainder of round 27 D (owner rule 3; A14). One-tap notes that move the rice out of this meal in other words are offered.
- Evidence (k.js, profile with diabetes at dinner; offered on this build and on old26): "Rice: keep it for the second meal, then eat it with the dal.", "Rice: keep it on the side for your son, then ...", "Rice: let it rest overnight, then ...", "Rice: keep it 4 hours, then ...", "Rice: keep it in the kadai for 6 hours, then ...", "Rice: keep it on the counter till 7, then ...", "Rice: keep it in the cooker, then eat the sabzi.": 7 of 19 offered. Cause: these notes do not reach thenKeeps() because the removal reading (OBJV) treats "keep it on the side / in the kadai / till", "let it rest" as an in-meal wait whatever follows.
- Smallest correction: in OBJV, an in-meal wait holds only when nothing follows it but the in-meal words thenKeeps() already allows; "N hours", "overnight", "for your <person>", "second meal", "till <clock>" make it a removal.

### E. MINOR, safe side, not a regression (A14). Dinner hours that run past midnight refuse the breads at dinner.
- Evidence (a.js, t.js; refused on both builds at dinner): "TANDOOR (6 pm - 12 am)", "TANDOOR (7 pm - 1 am)", "TANDOOR (7 pm to midnight)", "DINNER (7:30 pm - 12:30 am)" over a roti. Cause: window_() reads "12 am" as 12 and "1 am" as 1, so the window ends before it starts. Eating out is mostly dinner, the meal the round 27 change set out to read.
- Smallest correction: when the end hour is before the start hour, add 24 to the end; read "midnight" as 24 and "noon" as 12.

### F. Cosmetic, safe side (listed in full).
- F1 Lunch hours without am/pm: "TANDOOR (11:30 - 3:30)" and "BREADS (served till 3)" refused at lunch (both builds).
- F2 "Rice: leave it in the pot while you eat the salad, then eat it with the dal." held (both builds); "Rice: hold it till the salad is done, then ..." newly held.
- F3 The three cases the builder left out: "DINNER MENU / Roti 30" and "Dinner / Dal Tadka 240 / Roti 30" at lunch (arguable at lunch), "Roti 15 to 20" (both builds).
- F4 "Jeera Rice 140 - cooked over slow fire" refused (both builds; "over" read as sold out).
- F5 Carried from round 27 E4: "Roti ₹30 each", "Roti x 2 = 60", "(over 2 people)", "(serves over 2)", "(na)"; soya chaap roll and chilli paneer noodles refused.
- F6 The record: UX-CRITERIA part A "changes after Critic round 27" is accurate for the probes it names; the builder's note that NOTSOLD dishes do not mark their grain does not hold on the sentence path (finding A).

### G. Screens. No screen code changed in this diff (only the np-core script, the rules check and the criteria doc). I viewed test/ux/out/screens/320-dark/menu-nothing-fits-1.png, 360-light-big/menu-nothing-fits-1.png and 360-dark/menu-nothing-fits-2.png from this run: Raw Linen paper, EB Garamond, brand masthead, the empty-state note says what to do next, nothing clipped at 130 % text. Part B as judged in rounds 21 to 27 stands.

## Not inspected
- The owner's own phone model; live engine text and live menu reads (no live engine call made; recorded replies were not replayed by me this round, so no wording in A to E has a measured live frequency).
- Earlier probe sets r25 and older on this build (I re-ran r27 and r26 only; the builder reports them unchanged).
- Audio by ear; the films and post are not in the diff.
- Every screen of every state at every width (three viewed this round; the screens did not change).
