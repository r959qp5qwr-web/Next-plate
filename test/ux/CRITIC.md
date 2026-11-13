VERDICT: FAIL
BUILD: f76b1f780d48409e61523b7ecfe7297b4032f8b95c961a1cb12d886865515368

# Critic round 25 (branch claude/nice-hawking-307ljy, HEAD f5bffb9, diff read 7af3e9a..f5bffb9)

## What I measured on this state
- `npm run rules`: passes on all three pages ("every rule check holds" three times, round 24 block included).
- `npm run review`: passes on the first run. 9 runs x 46 states = 414 checks, no violations, no unreached state, no page error.
- `npm run drill`: passes; every planted fault is caught.
- `npm run words`: passes (42 listed exceptions). test/ux/allow.json and test/words/allow.json are not in the diff.
- `npm run films`: passes on all four films (-16.7 to -16.8 dB, picture from 0 s, no decode errors, no 7 s freeze). No film or post in the diff.
- Rebuilt the three pages from HEAD (git archive, build6.js, scratchpad/build25-*): byte-identical to the committed pages. The page diff is np-core only. No lookbehind in any page. Working tree clean. The fingerprint above was taken after all measuring and matches the builder's.
- Recorded live replies (g13/live2.js, this build against the round 23 fix build): 408 of 495 meals and 225 of 313 base swaps count a grain; 65 of 2,005 one-tap notes held, the same 65. No recorded note uses "then eat/have it", and no recorded typed menu carries a sold-out mark, an emoji mark or a tandoor heading, so neither finding below has a measured live frequency.

Probes and outputs: /tmp/claude-0/-workspace/c6908978-4848-528a-96a3-1587c1886f9d/scratchpad/r25/ (k25.js, m25.js, m25b.js; new.html is this build). Columns: this build, the round 23 fix build (scratchpad/old23.html). Profile with diabetes, dinner slot for one-tap notes; menus on the nonveg profile at lunch.

## Round 24's findings, checked with my own probes
- A (then eat it read only to the comma): k24 0 of 156 offered, 11 of 11 keeps on offer. Fixed for the wordings I named. "Then reheat it and eat it with the dal" now keeps (round 24 C3 fixed).
- B (sold-out words outside the list on priced grain lines): m24 0 of 96 offered; t24 free-typed sold-out lines refused, controls offered. Fixed for the wordings I named, on lines whose own head is a grain (see A below for the forms it does not reach).
- Round 24 C4 (a sold-out grain heading does not cover its items): fixed for grain headings ("ROTI - SOLD OUT / Tandoori Roti 30", "Roti: khatam / Tandoori Roti 30", "ROTI (SOLD OUT) / Roti 30" refused).
- Round 24 C2 (a sold-out item ends a grain section): not fixed, although the record says it is (finding B below).
- Code read: thenKeeps() now reads one match to the end of the note; SOLDOUT gains "khatam", "nahi hai" and "over" not before a number; QUALW is the new allow-list for priced grain lines; deadKind carries a sold-out grain heading. No safety line, unit, label, banned word or screen code is touched.

## Findings, most serious first

### A. MINOR, remainder of round 24 B (owner rule 3; owner rule 5; A14). On a typed menu, a grain the menu marks as not available is still sold when the mark sits on a heading that is not a grain word, on an item in a grain section, or is a symbol.
- Surface: Rescue, Read the menu, typed menus only (porGrain() skips the check for a photo, src/v6/engine.js:398). Engine-side, every width and scheme.
- Cause: src/v6/engine.js:426, deadKind is set only when the sold-out heading is a section word or a grain (`MENUSEC.test(head)||isGrain(head)`), so "TANDOOR" never covers its breads, and a time limit on a heading is not read at all. src/v6/engine.js:440, the round 24 allow-list runs only when the line's own head is a grain (`isGrain(head)||MENUSEC.test(head)`), so "Jeera 120" under "RICE" is never checked. words() (src/v5/core.js:144) drops every symbol, so a cross mark is invisible to both tests.
- Evidence (m25.js, m25b.js; offered on this build and on the round 23 build, none newly opened):
  - Sold-out or time-limited headings: "TANDOOR - not available / Tandoori Roti 30 / Butter Naan 50", "TANDOOR (closed)", "FROM THE TANDOOR (not available)", "Tandoor closed today", "TANDOOR / (closed today)", "Tandoor items available after 7 pm", "BREADS (dinner only)", "BREADS - from 7 pm", "TANDOOR (after 7 pm)", each offering "dal with 2 tandoori roti" at lunch. In the first three the code already reads the sold-out words; only the heading word is not on its list.
  - Items in a grain section: "RICE / Jeera 120 - none left" and "RICE / Jeera 120 (dinner only)" offer "1 plate jeera rice"; "NAAN / ~~Garlic 60~~" offers "2 garlic naan". The same marks on "Jeera Rice 120 - none left" are refused.
  - Symbol marks: "Roti 30 ❌", "❌ Roti 30", "Roti ❌", "Roti 30 (❌)", "Roti 30 🚫", and the free-typed "Dal tadka ✅ / Paneer ✅ / Roti ❌" and "Dal tadka ✅, paneer ✅, roti ❌" all offer "dal with 2 roti".
  - Free-typed lines without a price, outside the word list: "Dal tadka, paneer, roti - nil", "~~roti~~", "roti (not now)", "Dal tadka, paneer. Roti not there", "roti - not ready".
- Why it matters: as rounds 23 and 24. With diabetes the order shows "dal with 2 tandoori roti" from a menu that says the tandoor is closed or opens at 7 pm; the plan counts a grain the person cannot get, and the waiter's substitute is not the counted grain. "Tandoor items after 7 pm" is a common notice on Indian menus, and a menu forwarded on WhatsApp with ✅ and ❌ is an ordinary thing for these users to paste.
- Smallest correction: one rule instead of more words. (1) A heading line with no price that carries a sold-out or time mark (SOLDOUT, or any word outside QUALW such as "after", "from", "pm", "dinner", "closed") covers every grain item under it until the next heading, whatever the heading word ("TANDOOR", "FROM THE TANDOOR", "BREADS"). (2) Run the QUALW allow-list on every priced line that sells a grain, including items named through the section ("Jeera 120" under RICE), and on free-typed list items. (3) Treat ❌, ✗, ✘, 🚫, ⛔ and "~~" anywhere on a line as sold out before words() strips them. Add these menus to the rules block.

### B. MINOR, evidence integrity (A14 and part A record). The record says a sold-out item inside a grain section no longer ends the section; the code still ends it, and the rules check passes for another reason.
- Surface: docs/ux/UX-CRITERIA.md "Part A, changes after Critic round 24" item 3; test/rules/check.js round 24 block (the SO cases).
- Cause: src/v6/engine.js:419, `if(anyPrice&&!priced)cur=""` runs on every unpriced line, including "Butter - sold out", before the sold-out branch; nothing restores cur.
- Evidence (m25.js "sold"): "ROTI / Butter - sold out / Garlic 50" refuses "2 garlic roti"; "NAAN / Cheese (finished) / Garlic 50" refuses "2 garlic naan"; "RICE / Veg Pulao (sold out) / Jeera 120" refuses "1 plate jeera rice". The builder's cases pass only because an item before the sold-out line ("Tandoori 30", "Butter 40", "Plain 100") already sells the grain, and "BREADS / ... / Tandoori Roti 30" names its grain itself. Removing that earlier item refuses the order on this build and on the round 23 build alike.
- Why it matters: for users this is the safe side (round 24 C2, cosmetic). For the gate it is not: part A records a measured behaviour that does not exist, and the check named for it would not notice it missing.
- Smallest correction: keep cur through an unpriced line that is a sold-out item under a grain heading (set cur only after the sold-out test), or strike item 3's second half from part A. Add the three cases above, without the earlier selling item, to the round 24 block.

### C. Cosmetic, safe side or ambiguous (listed in full).
- C1 New refusals of plain priced grain lines (offered on the round 23 build): "Tandoori Roti (Whole Wheat) 30", "Roti (whole wheat) 30", "Roti 30 (tandoor)", "Roti 30 (no butter)", "Roti 30 (V)", "Butter Naan 50 (Amul butter)". QUALW lacks whole, tandoor, no, v and brand names. A whole-wheat roti is the order a coach wants a person with diabetes to place, so this is worth fixing with A.
- C2 Still refused from round 24 C1: "(over 2 people)", "(serves over 2)", "(na)", "(fresh, not today's special)", "(closed at 11 pm? no)"; also "Roti ₹30 each", "Roti x 2 = 60" (all builds).
- C3 thenKeeps() now holds same-meal notes with any sentence after the food (offered on the round 23 build): "Rice: set it aside, then eat it with the dal. This keeps the rise gentle.", "...; it keeps the rise gentle.", "... Enjoy.", "... Chew well.", "Rice: keep it aside, then eat it after the dal and sabzi, slowly.". A note that explains its reason is a likely live engine shape; no recorded note has it yet. "Rice: set it aside. Then eat it with the dal." (capital Then after a full stop) and "... with the dal and curd (150 g)." are held on both builds.
- C4 thenKeeps() does not read the first verb: "Rice: freeze it / pack it / box it / wrap it / store it, then reheat it (with the dal)" keeps on both builds, and "Rice: freeze it, then reheat it and eat it." is newly kept. Read as preparing ahead this is right; "freeze" and "pack" lean to a later meal. Holding freeze, pack, box, wrap and parcel before "then" would settle it.
- C5 A menu typed with a literal "|" ("Roti 30 | sold out") splits the mark onto its own line and sells the roti (menuText uses " | " as the line break).
- C6 Carried from round 23 D3: soya chaap roll and chilli paneer noodles refused (owner's D7 line).

### D. Screens. No screen code changed (rebuilt pages identical; page diff is np-core only). Against the round 12 review set: 1,333 identical, 63 the state added in round 13, 45 differ, in loading, wait and toast frames and a few scrolled states. I viewed 320-light rescue-menu-order-1, 320-dark rescue-menu-order-2, 360-light-big plate-hero-1 and two of the largest differing frames (320-light rescue-result-1, 360-light plate-error-1; both render cleanly, and I did not trace what changed in them since round 12): Raw Linen paper, EB Garamond, clay buttons, grams and kcal, the plate and its grams first, nothing cramped at 320 px, nothing clipped at 130 % text. Part B as judged in rounds 21 to 24 stands.

## Not inspected
- The owner's own phone model; live engine text and live menu reads (no live engine call made; recorded replies replayed, none with "then eat it", a sold-out mark, an emoji mark or a tandoor heading).
- Films and the WhatsApp post by eye or ear this round (not in the diff; the films check passed).
- Server deployment of np-core (no deploy authorised or checked).
- Screens beyond the five viewed, by eye; the other 43 differing frames were counted, not viewed.
