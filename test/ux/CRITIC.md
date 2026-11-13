VERDICT: FAIL
BUILD: 371b09905f7ba2d67711e7a92f6128826325659a3fb76cc9a0043414384d0a9a

# Critic round 27 (branch claude/nice-hawking-307ljy, HEAD 38a3cd3, diff read e1f7b10..38a3cd3)

## What I measured on this state
- `npm run rules`: passes on all three pages ("every rule check holds" three times; 444 ok lines; round 26 block included).
- `npm run review`: passes on the first run. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). test/ux/allow.json and test/words/allow.json are not in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post in the diff.
- Rebuilt the three pages from HEAD (git archive, build6.js, scratchpad/build27-*): byte-identical to the committed pages. Outside the np-core script the pages are unchanged since e1f7b10. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- My round 26 probes on this build (scratchpad/r27/new.html) against the round 25 fix build (old25.html): m26 0 of 45 not-sold offered, 0 of 22 sold refused; k26 0 of 54 later-meal notes offered, 0 of 6 waits held. The builder's figures hold.
- Earlier probes, this build against old25 (k25, m25, m25b, k24, m24, t24, k23, k23k, m23, m23b): no line differs. Recorded live replies (g13/live2.js): 65 of 2,005 one-tap notes held, the same 65.
- New probes: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r27/ (m27.js, dec.js, din.js, bf.js, later.js, later2.js, k27.js). Columns: this build, then old25. Menus on the nonveg profile with diabetes (the lib profile); one-tap notes on the diabetes profile at dinner.

## Round 26's findings, checked
- A (single tildes, clock forms, "evenings only", "band", symbols, free-typed endings): fixed for every wording I named (m26 0 of 45). But the new time and heading reading opens two regressions (findings A and B below) and leaves near forms open (finding C).
- B (later meal before "then"; "keep it for your tiffin / the next meal", "put it in a container"): fixed for every wording I named (k26 0 of 54). Near forms remain (finding D).

## Findings, most serious first

### A. MAJOR, regression (A14 menu side; part B empty states). Ordinary typed menus that sell the grain are now refused, and with diabetes the person gets "No dish on that menu passed the checks for you".
- Surface: Rescue, Read the menu, typed menus (porGrain() skips the check for a photo). Engine-side, every width and scheme. Screen the person lands on: test/ux/out/screens/360-dark/menu-nothing-fits-2.png. Measured result for the first menu below: status "empty", dropped {"diabetes-grain":1}.
- Evidence (dec.js, m27.js, din.js, bf.js; every case is "r" on this build and "O" on old25 unless marked):
  - Prices with paise: "MAIN COURSE / Dal Tadka ₹240.00 / Palak Paneer ₹300.00 / BREADS / Tandoori Roti ₹30.00 / Butter Naan ₹55.00", "Dal Tadka Rs. 240.00 / ... / Tandoori Roti Rs. 30.00", "Dal Tadka 240.00 / Roti 25.00", "Jeera Rice 99.00", "Butter Naan 45.50": all refused. Cause: TIMEN (src/v6/engine.js:418) now reads any `\d{1,2}[.:]\d{2}` as a clock time, so a two-digit price with paise is a time, the item line has no price, and HEADMARK (line 424) then reads it as a heading with a clock time that closes the section. Every roti, naan and kulcha is priced under ₹100. ("240.00" and "140.00" are untouched.)
  - Price ranges: "Roti 20-25", "Roti 20 - 25", "Roti 25-30" refused (the range rule in TIMEN).
  - The meal the person asked for is ignored: at breakfast, "BREAKFAST (7-11 am) / Chole 120 / Poori 40" and "BREAKFAST / Chole 120 / Poori 40" refuse the poori; at dinner, "DINNER (7-11 pm) / Dal Tadka 240 / Roti 30", "DINNER / Dal Tadka 240 / Roti 30" and "BREADS (dinner) / Roti 30" refuse the roti. At dinner, "TANDOOR 7-11 pm", "TANDOOR (evenings only)", "TANDOOR (nights only)", "TANDOOR (7.30 pm onwards)" and "TANDOOR - DINNER" over "Tandoori Roti 30" are refused (new); "TANDOOR (after 7 pm)" and "BREADS (dinner only)" were already refused at dinner on old25, which I missed in round 26. Eating out is mostly dinner, which is when these headings are true.
  - Headings that describe the food: "NO ONION NO GARLIC", "JAIN (no onion no garlic) / Jain Dal 220 / Roti 30", "BREADS (only wheat)", "Breads - no maida", "OFF THE TAWA", "BREADS (hot off the tawa)", "BREADS (fresh, 5 min)", "Not spicy" over "Roti 30": refused. A Jain section is an ordinary heading on an Indian menu.
- The record is off: part A "changes after Critic round 26" item 1 says every clock form is read as a time "not a price", but prices are now read as times; item 2 lists dinner, evening, night and clock times as closing marks with no word on the meal being asked for.
- Why it matters: the person is at the table, mid-meal, with diabetes; the menu plainly sells roti, and the app tells them nothing fits and to try another page. It fails the one job of Read the menu for an ordinary menu format, and it pushes the person to guess a dish without the grain count.
- Smallest correction: (1) read `\d{1,2}[.:]\d{2}` as a time only with a colon, or with am/pm/hrs/onwards after it, or a time word (after, from, till, until, before, at, opens, starts) before it; read "a-b" as a range of hours only with am/pm/hrs or a time word; never read a number after ₹, Rs or a currency sign as a time. (2) Read a meal or time mark against ctx.meal: dinner, evening(s), night(s) and pm times from about 6 pm are open at dinner; breakfast, morning and am times are open at breakfast; a heading that names the meal being asked for is a section, not a mark. (3) In HEADMARK take out the item-line phrases already stripped elsewhere ("no onion/garlic/maida/oil", "only <food>", "off the tawa/tandoor") before looking for "no", "only", "off". Add these menus to the rules block, sold direction, and run the menu block at lunch and at dinner.

### B. MINOR, regression on the unsafe side (owner rule 3; A14). A free-typed list followed by a sentence that says the grain is over now sells the grain.
- Evidence (later2.js; 120 cases): "Dal tadka, paneer, roti. Roti finished.", "They have dal tadka, paneer and roti. Roti is over.", "... roti. Roti sold out.", "... roti. Roti nahi hai.", "... roti. Roti khatam.", "... roti. Roti not available.", "... roti. But roti is over." are offered on this build and refused on old25: 21 newly offered. The same text with a line break instead of ". " is offered on both builds (20 more), as are a priced menu with "Roti 30" and a later line "Roti finished", and "Note: roti not available today" under a priced menu (later.js).
- Cause: the round 26 per-item reading (src/v6/engine.js:438, the `\.\s` split, and the `soldOut` exception at line 440) drops the marked item "roti finished" but keeps the earlier plain "roti" in the same list; nothing carries a sold-out item to the other mentions of that grain.
- Why it matters: with diabetes the order shows "dal with 2 roti" from a menu that says the roti is over; the plan counts a grain the person cannot get (as rounds 23 to 26).
- Smallest correction: when any item, sentence or line names a grain with a sold-out mark, add that grain to deadSet for the whole menu (before and after), as is already done for marked headings. Add these lists to the rules block.

### C. MINOR, remainder of round 26 A (owner rule 3; A14). Headings that close the tandoor for now in other words still sell its breads at lunch.
- Evidence (m27.js; offered on this build and on old25): "TANDOOR - tomorrow", "TANDOOR (kal se)", "(shaam ko)", "(raat ko)", "(7 baje ke baad)", "(starts at 7)", "(after 1930 hrs)", "(under repair)", "(weekends)", "(Sat & Sun)", "(down today)", "(stopped)", "(7 o'clock onwards)" over "Tandoori Roti 30": 13 of 18 offered. Strike-through with spaces "~ Roti ~ 30" and "Roti 30 ~" offered. Priced item lines with the same marks are all refused (0 of 10), symbols 0 of 10 apart from the tilde forms.
- The record claims an unpriced heading that names "a later time" covers its grains; "tomorrow", "kal", "shaam", "raat" and "baje" are later times in the words these clients type.
- Smallest correction: as round 26 said, one rule ends the word lists: on a priced menu, an unpriced heading over grains whose words are not all heading, food, QUALW or hours words marks the section; with A(3) and A(2) above it stays clear of Jain and meal headings. Failing that, add tomorrow, kal, shaam, raat, baje, starts, repair, down, stopped, weekends, day names, o'clock and four-digit "hrs".

### D. MINOR, remainder of round 26 B (owner rule 3; A14). One-tap notes that send the grain to a later time, another eater or a store in other words are offered as keeping it.
- Evidence (k27.js; offered on this build and on old25): "Rice: keep it overnight, then eat it with the dal.", "keep it for the afternoon", "save it for your son", "keep it for your mother", "keep it for office", "save it for school", "keep it for the party", "keep it for Sunday", "save it for teatime", "keep it for afterwards", "keep it in a steel dabba", "keep it in the refrigerator", "put it in a tupperware", "chill it", "keep it for kal", "kal ke liye rakh do", "keep it for 2nd meal" (each with ", then eat it with the dal."), and without "then": "Rice: keep it overnight.", "Rice: keep it for the afternoon.", "Rice: keep it in the refrigerator.", "Rice: put it in a tupperware.", "Rice: keep it in a steel dabba.": 22 of 39 offered. 16 of 16 same-meal waits stay on offer.
- Why it matters: with diabetes the grain stays; these notes take the rice off this plate while the plan still counts it.
- Smallest correction: invert thenKeeps() (src/v5/core.js:300): keep only when `before` holds nothing but the known in-meal waits (aside, warm, covered, for now, for N min, a bit, till/until the end or you finish, while you eat, on the side, to cool); hold everything else. Give the OBJV keep/put look-ahead (line 393) an optional adjective before the store word and add refrigerator, tupperware, overnight.

### E. Cosmetic, safe side (listed in full).
- E1 Free-typed "roti hai", "roti bhi", "roti available", "roti please", "roti too", "roti etc" after "Dal tadka, paneer," refuse the roti (both builds).
- E2 "Roti 15 to 20" and "BREADS (10 am - 11 pm)" refused (both builds).
- E3 "Dinner / Dal Tadka 240 / Roti 30" at lunch is refused while "DINNER MENU" sells; arguable either way at lunch, wrong at dinner (A).
- E4 Carried: "Roti ₹30 each", "Roti x 2 = 60", "(over 2 people)", "(serves over 2)", "(na)"; soya chaap roll and chilli paneer noodles refused (round 23 D3).
- E5 Fixed this round and noted: "Dal tadka, paneer, roti. Naan over" now sells the roti (was C2).

### F. Screens. No screen code changed (rebuilt pages identical; outside np-core the pages are unchanged since e1f7b10). I viewed 320-dark menu-nothing-fits-1, 360-dark menu-nothing-fits-2 and 360-light-big rescue-menu-order-1: Raw Linen paper, EB Garamond, brand masthead, the empty-state note says what to do next, nothing clipped at 130 % text. Part B as judged in rounds 21 to 26 stands.

## Not inspected
- The owner's own phone model; live engine text and live menu reads (no live engine call made; recorded replies replayed, none with the forms in A to D, so none has a measured live frequency).
- Films and the WhatsApp post by eye or ear (not in the diff; the films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the three viewed, by eye; the screen code is unchanged.
- The 4,032-name grid, the 4,897 combinatorial cases and the g20, g21, g22 grids and the diabetes menu replay were not re-run by me this round; the probe set above was.
