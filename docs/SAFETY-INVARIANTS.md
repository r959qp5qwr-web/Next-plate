# Safety invariants

These are the owner's rules written as properties a test can check. Each holds on every path a client can reach:
- plates (meals, ask, tune: swaps and one-tap changes);
- menu orders;
- Rescue (dish and moves);
- "I had something else" (log), for S7 and S8 only. The log is what the client says they ate, their own record and not an offer, so it is not filtered by the food rules (S1-S5, S9). What it shows back is in the client's own words.

`test/safety/check.js` tests them on the built engine (np-core); `test/safety/codex.js` holds the Codex re-audit's probes with their assertions inverted (a defect fails); `test/rules/check.js` and the review states in `test/ux/review.js` hold the rest. Cases come from `test/safety/lexicon.json`, kept apart from the engine's own word lists: "known" names may be copied into the word lists, "heldout" names never are (the test asserts none appears in `src/v5/core.js` or `src/v6/engine.js`). `test/safety/audit-names.json` (the second audit's 380 names) and `test/safety/controls.json` (573 names the live model wrote) are kept as test data.

## Tiers (owner, 16 Nov, option survey: "Two tiers (Recommended)")

**Tier 1 blocks release.** Each has a deterministic check and a test that fails on a regression:
- food rules held by declared tags and the word lists (S1-S4, S9);
- the grain stays (S5);
- the medicines floor (S6);
- referral, ticked or typed, plus the urgent-symptom first net (S7);
- figures agree (S13);
- grams and kcal only (S8);
- app logic: S10-S12, the kept-plate rule stamp, Builder bounds (S14).

**Tier 2 is a watched backlog**, with a frequency note and the weekly live sample. It blocks only if seen in ordinary use. It covers counter-examples that need a scripted model reply built to break a filter, with no live occurrence:
- odd or look-alike characters;
- negation parsing;
- sentence meaning;
- a wrong but non-empty tag on a name the lists do not know (tracked: 175 of the second audit's 380 names pass with a wrong tag; `test/safety/codex.js` prints Kori rotti, Payesh and Poondu rasam as TRACKED).

How S1-S4 and S9 are held (owner, 15 Nov, option survey: "Declared contents (Recommended)"):
- The model tags every plate item, swap, one-tap change, menu order and side, "leave for another day" entry and Rescue dish from a fixed list: meat, fish, egg, dairy, wheat, nuts, soya, onion_garlic, root_veg, sweet, salty_side, grain, supplement, plain. A food with none of the others declares "plain". Code drops anything whose tags break the client's rules. A missing list, an empty list (the owner's literal rule) or an unknown tag is dropped.
- The word lists are the second net, read on the raw name (brackets and comma tails included: "Veg thali (papad, pickle)" is dropped for high BP). Both checks must pass.
- Text is normalised once at intake (NFKC; format characters and combining marks on Latin letters removed). Text in a script the checks cannot read is not shown; a menu in another script ends with "Next Plate can read menus in English letters for now. Type the dishes in English letters."
- The app's example asks and Rescue dish taps carry hand-written tags (`APPASKS`, `APPDISHES` in np-core) and are filtered by tags and word lists.

**Where every shown string comes from.** No model-written sentence is shown (safety round 5); the reason line is the engine's (usefulness brief). Four origins:
1. Engine-written from checked structured fields (names, grams, kcal, enums).
2. A model name: checked by tags and word lists on the raw name, then shown cleaned (bracket groups, a comma tail, counts (in digits or words) with their measure word and a menu price taken off; it must then be ASCII letters, spaces and hyphens, with no katori). A name that cannot be cleaned to that shape is dropped.
3. The client's own typed words, shown as typed.
4. App-static text, food-neutral except hand-tagged, profile-filtered lists.

| Field | Origin | Check | When it fails, the screen shows |
|---|---|---|---|
| Plate title, subtitle | 1 (from the item names) | items checked first | the plate is not offered |
| Plate items, swaps | 2 | tags, word lists (raw), name shape after cleaning | the plate or swap is not offered |
| Why this plate, today | 1 (cited hooks, figures against the meal's target, the grain kept with diabetes, protein caught up only when the figures show it; never lighter, less or skip with diabetes or medicines) | written from checked fields | always shown |
| Planned around | 1 (hook tags the plate cited, from the offered list) | an uncited or unknown hook is dropped | nothing |
| Taste notes | single words from a closed list (`TASTEW`) | closed list | no taste notes |
| Cuisine, pairing tip, model for_you, reply read line | not shown | — | — |
| One-tap change label and note | 1 (the food it adds is origin 2) | tags, word lists, grain kept, usual size, figures agree | the change is not offered |
| Referral | 4: the fixed `SAFETY` line; with an urgent symptom also "If you feel unwell now, contact your doctor or emergency care." | referral before the model | — |
| Menu dish, side, leave entry | 2 (matched to a menu line, raw or cleaned) | tags, word lists (raw), shape | the order, side or entry is dropped |
| Menu portion | 1 (grams from the reply) | grams only | no portion line |
| Menu preparation request ("Ask the waiter: ...") | 1 (a fixed line per kind from a closed list: none, jain, no_dairy_fat, no_egg, less_salt) | the order's tags as served decide; a kind may take out only the tags it can (jain: onion_garlic, root_veg; no_dairy_fat: dairy, with the word net still dropping paneer, curd or cream); nothing takes out meat, fish or egg | the order is dropped |
| Menu condition line | 1 ("Only if they can make it this way.", owner, 16 Nov, option survey: "Show, marked conditional (Recommended)") | shown only when the request takes out a tag the client's rules bar; not for less_salt or a request that takes out nothing barred | — |
| Menu when nothing fits | 1 ("Nothing on this menu fits your food rules (no ...). Ask what they can make for you, or name the dish you want.") | a readable menu with no fitting dish is never called unreadable | — |
| Menu place | not shown | — | — |
| Menu tip | 4 (one fixed line) | — | — |
| Leave "why" | 1 (a fixed line per reason) | reason enum | the entry is not shown |
| Rescue dish label | 3 (as typed; "Your dish" for a long text) | a supplement is not helped | "couldn't work out that dish" |
| Rescue portion | 1 (grams from the reply) | figures agree | no portion line |
| Rescue moves | 1 (engine-written from the figures; no food named) | S5, S6, figures agree on every set of moves | the move is not offered |
| Log title, items | 3 (an item only in words the client typed) | S7, S8 | "Your meal"; the item is left out |
| Placeholders, labels | 4 | food-neutral | — |

Every tap that logs or shows a composed state goes through one wrapper (`act()` in the app): the day is checked first (S12), then the composed result (`composedWhy`: figures agree, S5, S6). A static guard in `test/safety/check.js` reads `src/v6/app.js` and fails if a click handler that logs, clears or composes is not wrapped. Kept plates carry the rules they were made under and are dropped at load and render on a mismatch (review state `plate-rules-reload`).

The v5 screens (`hosted/v5/index.min.html`) carry the same core but are not a release target: S10-S12 are tested on the v6 screens only.

| ID | Invariant | Source |
|---|---|---|
| S1 | A food the client left out (dairy, nuts, wheat, soya) never shows, in any form: singular, plural, regional name, inside a dish name, in what a grain is made of, in a swap, a one-tap note, a menu order, its side or ask, or a Rescue move. A mention only counts as left out when it is negated alone ("no ghee"). "no oil and ghee" still shows ghee. | owner: food rules are absolute |
| S2 | Diet is absolute. A vegetarian, Jain or vegan client never sees meat, fish or seafood, in any form or regional name. Vegetarian, Jain and vegan clients never see egg. Jain clients never see onion, garlic, potato or other root vegetables. Vegan clients never see dairy. | owner: diet |
| S3 | With high BP, pickle, papad, namkeen and similar salty sides never show (plurals and regional names included). | owner decision, BP |
| S4 | With diabetes, a sweet is never offered as food (it may be named under "leave for another day"). | owner: diabetes |
| S5 | With diabetes, at breakfast, lunch and dinner, the grain stays on every path. | owner rule 3 |
| S6 | On insulin or sugar tablets (or not sure), the prompt states the usual size as a minimum (at least that, never below, up to 10 percent above), and a home meal's energy target never falls below that meal's usual size, whatever was eaten earlier and whatever the appetite. A plate, swap, one-tap change or menu order under that size is not offered (owner, 15 Nov, option survey: "Drop plates under usual (Recommended)"). With no height or weight, "usual" is the day split of the energy floor. | owner decision, 15 Nov |
| S7 | A kidney condition or pregnancy/breastfeeding is referred, not planned. This holds whether it is ticked in set-up (alone or with other conditions) or typed in any free-text box (ask, Rescue, menu, log); typed, any kidney word but "kidney bean(s)" is referred, wherever it stands ("low salt for kidney"; final audit, 16 Nov). Every surface shows the referral as a referral. Every reply to typed text carries refer_reason (none, pregnancy, kidney, other_urgent); any value but none, or none given, is a referral.  Urgent symptoms typed in any box (low-sugar signs with insulin, tablets or sugar; sugar low or dropping; chest pain; fainting; breathlessness; confusion with medicines) are referred before the model, with the line to get help now: a first net, not complete and not clinically reviewed. | owner rule 3; Codex re-audit B1; typed text extends it to what the client writes (15 Nov) |
| S8 | Units are grams and kcal. No katori, fulka or bowl without grams is shown as a portion, and no household count shows in a name (counts and their measure words are taken off a model name, in digits or in words; "Chicken Curry Thali (2 roti, ...)" shows "Chicken Curry Thali", "Egg podimas with two whole eggs" shows "Egg podimas with whole eggs", "Half plate rice" shows "Rice"; "half", "single", "quarter" and Hindi numbers count only before a measure or piece word, so "Paneer do pyaza" and "Panch phoron dal" keep their names (final audit M2)). The engine-written side keeps its count with a grain side's grams (owner, 14 Nov). | owner rule; usefulness brief |
| S9 | No supplements are suggested. | owner rule |
| S10 | The plate on screen is the plate that is logged. Its title, grams and figures agree after any combination of swaps and one-tap changes. A grain change applies only to the grain on the plate, and only while it is on the plate as planned. A protein swap never takes the place of the declared grain item (final audit M1). | truth in figures |
| S11 | A reply made for answers or settings that changed during the wait is never shown. | Critic round 36 |
| S12 | The day follows the phone's clock, and the day starts at 4 am: a meal logged between midnight and 4 am counts toward the evening before. A tab left open past 4 am starts a new day: meals, clearing, the current meal slot, and the Rescue, menu and log answers. A tap made after the day changed redraws for the new day before it logs anything. | review, 15 Nov; correctness review, 15 Nov |
| S13 | Figures agree: the kcal shown is within 15 % of 4 x protein + 4 x carbs + 9 x fats for a plate, a menu order (its own existing 20 % check) and a Rescue dish, and for every combination of swaps, one-tap changes and moves a client can make, at render, on every tap and before logging. | Codex re-audit A2 |
| S14 | Builder shares stay within the bounds the engine accepts (protein, vegetables, grains 5-70 %, fats 5-40 %), sum to 100, and reach the engine unchanged; a tap that cannot is refused with a note. | Codex re-audit B2 |
| S15 | A Rescue dish the client typed is theirs: it is shown as typed, whatever their rules bar; nothing the model writes about it is shown, and every move is the engine's, names no food and keeps S5 and S6. A supplement is not helped (S9). | usefulness brief, 15 Nov |

When a test finds a counter-example, the fix goes in the engine. A tier-1 test is never weakened; a test the design legitimately changed is listed in the commit that changes it. A new food name found anywhere (review, live reply, coach) is added to the lexicon first, then the engine.
