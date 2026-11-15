# Safety invariants

These are the owner's rules written as properties a test can check. Each holds on every path a client can reach:
- plates (meals, ask, tune: swaps and one-tap changes);
- menu orders;
- Rescue (dish and moves);
- "I had something else" (log), for S7 and S8 only. The log is what the client says they ate, their own record and not an offer, so it is not filtered by the food rules (S1-S5, S9). The text shown back (the assumption line) still follows S8.

`test/safety/check.js` tests them on the built engine (np-core). Its cases come from `test/safety/lexicon.json`, which is kept apart from the engine's own word lists. The tests must never be generated from the lists they test. The lexicon has two parts: "known" names may be copied into the engine's word lists; "heldout" names never are, and the test asserts none appears in `src/v5/core.js` or `src/v6/engine.js`.

How S1-S4 and S9 are held (owner, 15 Nov, option survey: "Declared contents (Recommended)"):
- The model tags every dish, plate item, swap, one-tap change, menu order and side, "leave for another day" entry, Rescue dish and Rescue move from a fixed list: meat, fish, egg, dairy, wheat, nuts, soya, onion_garlic, root_veg, sweet, salty_side, grain, supplement. Code drops anything whose tags break the client's rules. A missing list or an unknown tag is dropped. An empty list is believed only when every word of the name is a plain vegetable, pulse, fruit, seed or cooking word (the builder's reading of "fail closed"; `PLAINEMPTY` switches to the literal rule).
- The word lists are the second net. Both checks must pass. Held-out names are caught by the tags; the word lists are not grown to catch them.
- A Rescue dish is the one the client typed: a kind of food their own words name is theirs (the word lists decide what they named). A move that adds food is checked in full.
- Text in a script the checks cannot read (any letter outside Latin) is not shown in any model-written field. A menu in another script ends with "Next Plate can read menus in English letters for now. Type the dishes in English letters."
- Text the engine writes itself follows the food rules too (menu moves, hook tags).

The v5 screens (`hosted/v5/index.min.html`) carry the same core but are not a release target: S10-S12 are tested on the v6 screens only.

| ID | Invariant | Source |
|---|---|---|
| S1 | A food the client left out (dairy, nuts, wheat, soya) never shows, in any form: singular, plural, regional name, inside a dish name, in what a grain is made of, in a swap, a one-tap note, a menu order, its side or ask, or a Rescue move. A mention only counts as left out when it is negated alone ("no ghee"). "no oil and ghee" still shows ghee. | owner: food rules are absolute |
| S2 | Diet is absolute. A vegetarian, Jain or vegan client never sees meat, fish or seafood, in any form or regional name. Vegetarian, Jain and vegan clients never see egg. Jain clients never see onion, garlic, potato or other root vegetables. Vegan clients never see dairy. | owner: diet |
| S3 | With high BP, pickle, papad, namkeen and similar salty sides never show (plurals and regional names included). | owner decision, BP |
| S4 | With diabetes, a sweet is never offered as food (it may be named under "leave for another day"). | owner: diabetes |
| S5 | With diabetes, at breakfast, lunch and dinner, the grain stays on every path. | owner rule 3 |
| S6 | On insulin or sugar tablets (or not sure), a home meal's energy target never falls below that meal's usual size, whatever was eaten earlier and whatever the appetite. A plate, swap, one-tap change or menu order under that size is not offered (owner, 15 Nov, option survey: "Drop plates under usual (Recommended)"). With no height or weight, "usual" is the day split of the energy floor. | owner decision, 15 Nov |
| S7 | A kidney condition or pregnancy/breastfeeding is referred, not planned. This holds whether it is ticked in set-up (alone or with other conditions) or typed in any free-text box (ask, Rescue, menu, log). Every surface shows the referral as a referral. Every reply to typed text carries refer_reason (none, pregnancy, kidney, other_urgent); any value but none, or none given, is a referral. | owner rule 3; typed text extends it to what the client writes (15 Nov) |
| S8 | Units are grams and kcal. No katori, fulka or bowl without grams is shown as a portion. | owner rule |
| S9 | No supplements are suggested. | owner rule |
| S10 | The plate on screen is the plate that is logged. Its title, grams and figures agree after any combination of swaps and one-tap changes. A grain change applies only to the grain on the plate. | truth in figures |
| S11 | A reply made for answers or settings that changed during the wait is never shown. | Critic round 36 |
| S12 | The day follows the phone's clock, and the day starts at 4 am: a meal logged between midnight and 4 am counts toward the evening before. A tab left open past 4 am starts a new day: meals, clearing, the current meal slot, and the Rescue, menu and log answers. A tap made after the day changed redraws for the new day before it logs anything. | review, 15 Nov; correctness review, 15 Nov |

When a test finds a counter-example, the fix goes in the engine. The test is never weakened. A new food name found anywhere (review, live reply, coach) is added to the lexicon first, then the engine.
