# At-risk live sample: labels and reading (15 Nov)

Source: `results-live-6febc1a.json`, the live engine (6febc1a, old prompt with no food tags).
- 80 calls: 78 answered, 1 "unreadable" (wheat-free client, pizza menu), 1 empty after the live filter.
- 247 plates and menu orders, 962 food names.
- Every name was labelled by hand against its profile before filter results were read.

## Labels (model behaviour, before any filter)
**`barred`: 0.**
- No plate or order named a food the client's rules bar.
- Covers Jain, vegan, dairy-, wheat-, nut- and soya-free, BP and diabetes, in North, South, East and West Indian food.

**`unsure`: 4 names.**
- Dairy-free, often made with curd: "Methi thepla", "Steamed methi muthia".
- Jain, often made with carrot: "Cabbage sambharo", "Jain cabbage sambharo".

**Menus:** the model added a preparation request every time a dish needs one:
- for Jain: "Make Jain style … no onion or garlic", "strictly Jain without onion, garlic or ginger";
- for vegan: "oil instead of ghee", "skip any ghee".

**Household counts:** menu items copied from the menu ("Idli (2 pcs)", "+ 1 Tandoori Roti"). The current build shows no count without grams.

**Model message:** for a wheat-free client facing a pizza menu, the model answered "unreadable" where nothing fits. That is a wrong message, not a food breach.

## Reading under the decision rule
- **Wrong tags on unlisted names stay tier 2.** With 0 `barred` in 247, the per-plate rate is bounded near 3 in 247 (about 1 in 82), across all profile groups together. Six calls per profile bound little for any one profile. The weekly sample watches it.
- **Not tested here:** whether the model tags foods correctly under the new prompt. That is the sample window the owner approved (option 2).

## Filter losses found (honest answers removed)

| Build | Profile | What was lost |
|---|---|---|
| Live 6febc1a | Jain | 2 of 4 Jain-requested menu dishes; the request text names "ginger" and "root vegetable" |
| Live 6febc1a | Jain with diabetes | The whole canteen answer |
| Live 6febc1a | Vegan | 2 South Indian dishes ("skip any ghee") |
| New build (4622220) | Diabetes with medicines | 16 of 17 plates. The prompt target equals the floor (e.g. "about 700 kcal, within 10 percent"; floor 700), so the model's normal scatter lands below it. The model's plates were 454–494 and 645–686 kcal against targets 470/490 and 700. |

**Cautious drops** that are acceptable: "Ghee on rotis" beside a jowar or bajra plate for a wheat-free client. Plain "roti" usually means wheat.

## Replay (`node eval/atrisk/replay.js <build>`)
The new build shows 204 of the 221 items live showed. Of the 17 lost:
- 16 are the medicines target above;
- 1 is the Jain-with-diabetes plate.

No profile group is empty except the medicines one.
