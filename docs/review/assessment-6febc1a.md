# Assessment of the live build 6febc1a (15 Nov), on Gemini's rubric

Each row is tagged by evidence:
- **reproduced**: a probe run on the built engine;
- **read**: read in source;
- **not checked**.

The probes ran on `hosted/v6/index.min.html`, whose bytes match www.nextplate.in. The probe scripts were session-only and are not in the repo.

| Criterion | Max | Gemini (revised) | Codex | Mine | Evidence |
|---|---|---|---|---|---|
| Diabetes-medication safeguards | 15 | 8 | 8 | 6 | See below. |
| Food exclusions and cultural rules | 20 | 8 | 8 | 7 | See below. |
| Clinical referrals and scope | 15 | 7 | 7 | 8 | See below. |
| Visual and editorial contract | 10 | 8.5 | 8 | 8 | See below. |
| Energy, protein, fibre and sodium | 15 | 13 | 12 | 11 | See below. |
| Context, state and output validation | 15 | 10.5 | 11 | 10 | See below. |
| Privacy, access and deployment | 10 | 6 | 6 | 5.5 | See below. |
| **Total** | 100 | 61 | 60 | **55.5** | |

**Diabetes-medication safeguards (6 of 15)**
- Reproduced: for a client on insulin or sugar tablets, the day holds its energy, but the home lunch target falls:
  - from 680 kcal to 600 kcal after a 600 kcal breakfast;
  - to 410 kcal after an 1100 kcal breakfast;
  - to 360 kcal at appetite 1.
- Read: this happens on every such day, without any slip from Gemini.
- Read: the app's own note to these clients says "Plates hold steady with an even amount of grain at each meal" (params.js:66). Nothing in `planDay` enforces that.
- Read: the "lighter now" hook then tells the model this meal is lighter than usual.
- Read: the menu path drops an order under the usual size (engine.js:564), so the two paths disagree.
- Held: the grain stays on every path. The Critic tested 29 Rescue moves. The skipped-meal warning shows.

**Food exclusions and cultural rules (7 of 20)**
- Reproduced: 18 of 19 plural and regional names pass the filter: phulkas, rotis, thepla, kulcha, puri, bhatura, kaju, badam, thayir, taak, bombil, chingri, ilish, kanda, batata, pickles, papads, and "no oil and ghee".
- Reproduced: a whole plate "Dal with Phulkas", with its grain made of whole wheat, passes for a wheat-free person. The check ignores `made_of`.
- Reproduced: the previous live build, 9998595, has the same holes.
- Reproduced: in 367 recorded live replies, I checked 332 reply-and-rule pairs against each scenario's full profile. None offered any of the words I searched for. The only matches were negated mentions such as "free of pickles". So far the model follows the prompt.
- The new region pill asks for the South, West and East dishes whose names the lists miss.

**Clinical referrals and scope (8 of 15)**
- Reproduced: a kidney or pregnancy tick refers before the model, alone or with diabetes.
- Reproduced: typed text such as "I am pregnant" or "I took insulin and feel shaky" goes to the model. The prompt carries the referral rules.
- On 15 Nov, live, the model referred "I get chest pain after eating" and "Can I stop metformin if I eat millets?" (one run each). No pregnancy disclosure was tested.
- Read: a referral reply on the log sheet shows as "That didn't read as a meal".
- There is no deterministic text screen.

**Visual and editorial contract (8 of 10)**
- Two one-by-one reviews of 133 screens, a Critic PASS and the gate.
- Open: the date line is still left-aligned at 360 px.
- Reproduced: `own()` empties a logged item whose brand name is one of the owner's banned words.
- Read: hosted/v6/README.md "What is live right now" still says the v5 screens.

**Energy, protein, fibre and sodium (11 of 15)**
- Read: the parameters are documented with sources: BMI-based 300/500 kcal deficits, 1200/1500 kcal floors and a 35 % protein cap.
- Reproduced: the plural sodium words pass.
- Read: grain grams are cooked weight.
- Not checked: the accuracy of the model's nutrient estimates.

**Context, state and output validation (10 of 15)**
- Reproduced by guard states: a reply made for changed answers is asked for again, on plates, menu and Rescue.
- Read: a base swap plus the sugar one-tap change subtracts grain energy from the swapped grain, and its grams do not change.
- Read: DAY and CLOCK are set once at load, so a tab open past midnight keeps the old day for clearing a meal and for the meal slot.

**Privacy, access and deployment (5.5 of 10)**
- Read: data stays on the phone. Remove keeps only the coach's code.
- Read: there is one shared access code, and limits are kept in memory.
- Read: the server trusts the first X-Forwarded-For address. Not checked: whether Railway's edge lets a client set it.
- Read: the Dockerfile copies hosted/v4/server.ts.

## On Gemini's review
- **Retracted by Gemini:** the 19-rule text screen, and the first version's figures for the deficit, floor, model and temperature.
- **Still standing, and not supported:**
  - The proposed meal-level floors (45 g carbohydrate, 0.8 × usual carbohydrate) have no source in the repo. They are the owner's or a clinician's call, not ours to invent.
  - Gemini credits katori, roti and piece as accepted measures. The owner's rule is grams and kcal.
- **Plausible but unverified:** the header-spoofing risk.
- **Correct:** the README claim.

## Why the earlier checks missed this
37 Critic rounds, two screen-by-screen reviews and the rule suite tested only words already in the lists. None of them tested:
- plural or regional names;
- `made_of`;
- the per-meal target for a client on medicines.

The deploy report on 15 Nov gave no warning on any of these.
