VERDICT: FAIL
BUILD: 9b72103b0756ef8c4ceb955d52ac9220777ca5b4ce271358b6d43bebff75bc02

# Critic round 26 (branch claude/nice-hawking-307ljy, HEAD 9fadcd5, diff read ce1a9ec..9fadcd5)

## What I measured on this state
- `npm run rules`: passes on all three pages ("every rule check holds" three times, round 25 block included).
- `npm run review`: passes on the first run. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). test/ux/allow.json and test/words/allow.json are not in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post in the diff.
- Rebuilt the three pages from HEAD (git archive, build6.js, scratchpad/build26-*): byte-identical to the committed pages. Outside the np-core script the three pages are unchanged since ce1a9ec. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- My round 25 probes on this build (scratchpad/r26/new.html) against the round 24 fix build (old24.html): k25 0 of 308 later or ambiguous notes offered, 10 of 10 keeps on offer; m25 0 of 53 not-sold menus offered, 0 of 16 sold menus refused; m25b 2 of 36 wrong, both on the safe side ("Roti ₹30 each", "Roti x 2 = 60", refused on both builds).
- Earlier probes, this build against old24 (k24, m24, t24, k23, k23k, m23, m23b, m22, m22b, k22, n22, m21, m21b, n21, m20, m20b, k20, n20): identical output except m22b, where "Rice: pack it, then have it with dal." is now held (safe side, as the builder says).
- Recorded live replies (g13/live2.js): 408 of 495 meals and 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65 as on old24. No recorded typed menu carries a strike-through, a cross, a time on a heading or a Hindi closed word, and no recorded note names a later meal before "then", so neither finding below has a measured live frequency.
- New probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r26/ (m26.js, k26.js, k26b.js). Columns: this build, then old24. Menus on the nonveg profile at lunch; one-tap notes on the diabetes profile at dinner.

## Round 25's findings, checked with my own probes
- A (marks on non-grain headings, on items in grain sections, symbols): fixed for every wording I named (m25 0 of 53, m25b symbol cases refused). Not met for nearby ordinary forms; see finding A.
- B (record said a sold-out item kept the section): fixed in code; "ROTI / Butter - sold out / Garlic 50", "NAAN / Cheese (finished) / Garlic 50" and "RICE / Veg Pulao (sold out) / Jeera 120" now sell; part A round 24 item 3 is corrected.
- C1 (whole wheat, tandoor, no butter, V, Amul refused): fixed. C4 (freeze/pack then reheat): now held. C5 (" | sold out"): fixed. C3 (a sentence after the food): "This keeps the rise gentle." and "Enjoy." keep.
- Code read: soldItems() gains markOf (SOLDOUT words, cross symbols, "~~", TIMEMARK), TIMEN so a time is not a price, deadKind "*" and deadSet for marked headings, the QUALW check on items named through their section, and a look-ahead past marked lines; thenKeeps() reads the verb before "then", an anchor after it, and later sentences. No safety line, unit, label, banned word or screen code is touched.

## Findings, most serious first

### A. MINOR, remainder of round 25 A (owner rule 3; owner rule 5; A14). On a typed menu, a grain the menu marks as not available is still sold when the mark is a WhatsApp strike-through, a heavy cross, a time written as "7.30 pm", a range or 24-hour clock, "evenings only", or the Hindi "band".
- Surface: Rescue, Read the menu, typed menus only (porGrain() skips the check for a photo). Engine-side, every width and scheme.
- Evidence (m26.js; every case below offers "dal with 2 roti" or the named grain on this build and on old24; none newly opened):
  - WhatsApp strike-through (single tildes, which is how WhatsApp itself strikes text): "~Roti~ 30", "~Roti 30~", "Dal tadka, paneer, ~roti~", "Dal tadka / Paneer / ~Roti~", "NAAN / ~Garlic 60~", "~Jeera Rice 120~": 6 of 6 offered. markOf (src/v6/engine.js:420) tests only "~~".
  - Times the new TIME reading does not take: "TANDOOR (7.30 pm onwards)", "TANDOOR (after 7.30)", "TANDOOR 7-11 pm", "BREADS (7 to 11 pm)", "TANDOOR: 19:00 onwards", "Tandoor from 19:00", "TANDOOR (evenings only)", "TANDOOR (nights only)", "TANDOOR (evening)", "TANDOOR - DINNER", each over "Tandoori Roti 30": 10 of 10 offered. Cause: TIMEN (src/v6/engine.js:418) strips "11 pm" or "30 pm" but leaves "7-" or "7." so the heading counts as priced and the heading branch (`if(!priced&&anyPrice)`) never sets deadKind; "19:00" is neither a time nor a mark; TIMEMARK (line 413) has "evening only" but not "evenings only" or "nights only". The same marks on an item line ("Roti 30 (7.30 pm onwards)", "(19:00 onwards)", "(evenings only)") are refused by QUALW, so only headings are open.
  - Words: "Tandoor band hai" and "TANDOOR BAND" over "Tandoori Roti 30" (band is the ordinary Hindi word for closed); free-typed "Dal tadka, paneer, roti - no", "roti (no)", "roti not avail".
  - Symbols: "Roti 30 ✖" (U+2716), "Roti 30 ✖️", "Roti 30 ❎", "Roti 30 ✕", "Dal tadka ✔ / Paneer ✔ / Roti ✖", "Dal tadka 👍 / Paneer 👍 / Roti 👎", "Dal tadka yes / Paneer yes / Roti no": 7 of 8 offered ("Roti ✗" under ✓ items is newly refused).
- The record is also off on this point: part A "changes after Critic round 25" item 1 says "A time is not read as a price" and item 2 says an unpriced heading with a mark covers its grains; "TANDOOR (7.30 pm onwards)" and "TANDOOR 7-11 pm" are read as priced and cover nothing.
- Why it matters: as rounds 23 to 25. With diabetes the order shows "dal with 2 tandoori roti" at lunch from a menu that says the tandoor opens at 7.30 pm; the plan counts a grain the person cannot get, and the waiter's substitute is not the counted grain. These users are WhatsApp-first: a menu or list forwarded from WhatsApp carries ~struck~ items and ✖️ marks as ordinary text, and "7.30 pm" with a full stop is the usual way an Indian menu writes the time.
- Smallest correction: (1) treat a pair of single tildes around letters (/~[^~\s][^~]*~/, so "Rice ~150 g" stays a figure) as a strike-through; (2) strip every clock form before deciding a line is priced (\d{1,2}[.:]\d{2}, "7-11 pm", "7 to 11 pm", 24-hour "19:00") and read any of them, and "evenings/nights only", "evening", "dinner" on an unpriced heading, as a mark; (3) add "band" to the sold-out words when it follows a food or heading, "no" and "not avail" at the end of a free-typed item, and ✖ ✕ ❎ 👎 to the symbol class. As in round 25, one rule ("an unpriced heading with any word outside QUALW and the heading words covers its grains") would close the heading cases without another word list. Add these menus to the rules block.

### B. MINOR (owner rule 3; A14). A one-tap note that sends the grain to a later meal is offered as keeping it when the later meal is named before "then", or with "keep it for your tiffin / the next meal / the evening snack".
- Surface: Plate, one-tap change notes (glucose and the others) with diabetes; engine-side, every width and scheme.
- Evidence (k26.js, k26b.js; offered on this build, on old24 and on old23):
  - Opened by "then": "Rice: set it aside for tomorrow's lunch, then eat it with the dal.", "Rice: hold it for the morning, then eat it with the dal.", "Rice: save it for the next meal, then eat it with the dal." are offered, while the same notes without the "then" clause are held. thenKeeps() (src/v5/core.js:307) reads `before` for storing and removing verbs only, not for a meal or time, so the anchor "dal" after "then" makes it keep.
  - Never held, with or without "then": "Rice: keep it for your tiffin.", "Rice: keep it for the next meal.", "Rice: keep it for the evening snack.", "Rice: put it in a container.", "Rice: keep it in a box." and their ", then eat it with the dal" forms. The keep look-ahead in OBJV (src/v5/core.js:389) takes "for later / tomorrow / the kids / the family / in the fridge" only.
  - k26 totals: 21 of 54 later-meal notes offered; 6 of 6 same-meal waits ("set it aside for now", "till the end", "for the end of the meal", "on the side") stay on offer.
- Why it matters: with diabetes the grain stays (owner rule 3). These notes take the rice off tonight's plate while the plan still shows and counts it; a note that keeps rice "for your tiffin" is a likely live engine shape for a person who carries lunch. Round 24 A was the same class and was graded MINOR.
- Smallest correction: in thenKeeps, return false when `before` names a meal, a time or a store (the same list already used for `later`: breakfast, lunch, dinner, tomorrow, morning, evening, night, next, tiffin, dabba, snack, fridge, box, container); in OBJV, let "keep/hold/save it for (your|the) <that list>" and "keep/put it in a box/container/tiffin" count as removals. Add these notes to the round 25 block.

### C. Cosmetic, safe side (listed in full).
- C1 Still refused, all builds: "Roti ₹30 each", "Roti x 2 = 60", "(over 2 people)", "(serves over 2)", "(na)".
- C2 "Dal tadka, paneer, roti. Naan over" refuses the roti (both builds): the mark on naan carries to the roti.
- C3 A marked heading that is not a grain and is not all-caps ("Tandoor closed today") covers every grain until the next clean unpriced line; on a menu with no heading after it, a roti further down would be refused. Measured cases with a following heading ("TAWA ROTI", "BREADS", blank line then "Tawa") sell correctly.
- C4 "Rice: pack it, then have it with dal." is now held (was kept). Reading "pack" as a later meal is defensible; the record says so.
- C5 Carried from round 23 D3: soya chaap roll and chilli paneer noodles refused (owner's D7 line).

### D. Screens. No screen code changed (rebuilt pages identical; outside np-core the three pages are unchanged since ce1a9ec). I viewed 320-dark menu-nothing-fits-1 and 360-light-big plate-blocked-kidney-1: Raw Linen paper, EB Garamond, the brand masthead, the referral line for a kidney condition with "Change my answers", nothing cramped at 320 px, nothing clipped at 130 % text. Part B as judged in rounds 21 to 25 stands.

## Not inspected
- The owner's own phone model; live engine text and live menu reads (no live engine call made; recorded replies replayed, none with the forms in A or B).
- Films and the WhatsApp post by eye or ear this round (not in the diff; the films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the two viewed, by eye; the screen code is unchanged.
- The 4,032-name grid, the 4,897 combinatorial cases and the diabetes menu replay (g20, g21, g22 grids) were not re-run by me this round; the earlier probe set above was.
