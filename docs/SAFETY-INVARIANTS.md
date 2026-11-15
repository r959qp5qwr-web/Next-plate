# Safety invariants

These are the owner's rules written as properties a test can check. Each holds on every path a client can reach:
- plates (meals, ask, tune: swaps and one-tap changes);
- menu orders;
- Rescue (dish and moves);
- "I had something else" (log).

`test/safety/check.js` tests them on the built engine (np-core). Its cases come from `test/safety/lexicon.json`, which is kept apart from the engine's own word lists. The tests must never be generated from the lists they test.

| ID | Invariant | Source |
|---|---|---|
| S1 | A food the client left out (dairy, nuts, wheat, soya) never shows, in any form: singular, plural, regional name, inside a dish name, in what a grain is made of, in a swap, a one-tap note, a menu order, its side or ask, or a Rescue move. A mention only counts as left out when it is negated alone ("no ghee"). "no oil and ghee" still shows ghee. | owner: food rules are absolute |
| S2 | Diet is absolute. A vegetarian, Jain or vegan client never sees meat, fish or seafood, in any form or regional name. Vegetarian, Jain and vegan clients never see egg. Jain clients never see onion, garlic, potato or other root vegetables. Vegan clients never see dairy. | owner: diet |
| S3 | With high BP, pickle, papad, namkeen and similar salty sides never show (plurals and regional names included). | owner decision, BP |
| S4 | With diabetes, a sweet is never offered as food (it may be named under "leave for another day"). | owner: diabetes |
| S5 | With diabetes, at breakfast, lunch and dinner, the grain stays on every path. | owner rule 3 |
| S6 | On insulin or sugar tablets (or not sure), a home meal's energy target never falls below that meal's usual size, whatever was eaten earlier and whatever the appetite. The menu path already holds this. | owner decision, 15 Nov |
| S7 | A kidney condition or pregnancy/breastfeeding is referred, not planned. This holds whether it is ticked in set-up (alone or with other conditions) or typed in any free-text box (ask, Rescue, menu, log). Every surface shows the referral as a referral. | owner rule 3; typed text extends it to what the client writes (15 Nov) |
| S8 | Units are grams and kcal. No katori, fulka or bowl without grams is shown as a portion. | owner rule |
| S9 | No supplements are suggested. | owner rule |
| S10 | The plate on screen is the plate that is logged. Its title, grams and figures agree after any combination of swaps and one-tap changes. A grain change applies only to the grain on the plate. | truth in figures |
| S11 | A reply made for answers or settings that changed during the wait is never shown. | Critic round 36 |
| S12 | The day follows the phone's date. A tab left open past midnight starts a new day: meals, clearing and the current meal slot. | review, 15 Nov |

When a test finds a counter-example, the fix goes in the engine. The test is never weakened. A new food name found anywhere (review, live reply, coach) is added to the lexicon first, then the engine.
