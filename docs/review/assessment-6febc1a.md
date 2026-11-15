# Assessment of the live build 6febc1a (15 Nov), on Gemini's rubric

Each row is tagged by evidence: **reproduced** (probe run on the built engine), **read** (read in source), **not checked**.
Probes: `scratchpad/probe.js`, `probe2.js` and `scan.js` in the session scratchpad, run on `hosted/v6/index.min.html`. Its bytes are identical to www.nextplate.in.

| Criterion | Max | Gemini | Codex | Mine | Evidence |
|---|---|---|---|---|---|
| Food exclusions and cultural rules | 20 | 9 | 8 | 7 | Reproduced. 18 of 19 plural and regional names pass the filter: phulkas, rotis, thepla, kulcha, puri, bhatura, kaju, badam, thayir, taak, bombil, chingri, ilish, kanda, batata, pickles, papads, and "no oil and ghee". A whole plate "Dal with Phulkas" with grain made_of whole wheat passes for a wheat-free person; the check ignores `made_of`. The previous live build 9998595 has the same holes. Across 367 recorded live replies, no such word was offered against a scenario's own rules, so Gemini follows the prompt so far. The new region pill asks for the very South, West and East dishes whose names the lists miss. |
| Clinical referrals and scope | 15 | 12 | 7 | 8 | Reproduced: a kidney or pregnancy tick refers before the model, alone or with diabetes. Reproduced: typed text such as "I am pregnant" or "I took insulin and feel shaky" goes to the model; the prompt carries referral rules. The live v5 set's symptom and medicine asks passed 26/26 on 15 Nov, so the model did refer those. Read: a referral reply on the log sheet shows as "That didn't read as a meal". No deterministic text screen exists. |
| Visual and editorial contract | 10 | 9.5 | 8 | 8 | Two one-by-one reviews of 133 screens, Critic PASS and the gate. Open: the date line is still left-aligned at 360 px. Reproduced: `own()` empties a logged item whose brand name is one of the owner's banned words. Read: hosted/v6/README.md "What is live right now" still says the v5 screens. |
| Energy, protein, fibre and sodium | 15 | 13.5 | 12 | 11 | Read: parameters are documented with sources (BMI-based 300/500 kcal deficits, 1200/1500 floors, 35 % protein cap). Reproduced: the plural sodium words pass. Read: grain grams are cooked weight. Not checked: the accuracy of the model's nutrient estimates. |
| Diabetes-medication safeguards | 15 | 8.5 | 8 | 7 | Reproduced: on insulin or tablets, the day holds energy, but a home lunch target falls from 680 to 600 kcal after a 600 kcal breakfast, and to 410 after 1100 kcal. At appetite 1 it falls to 360. The menu path holds the usual size, so the two paths disagree. The grain stays everywhere; the Critic tested 29 Rescue moves. The skipped-meal warning shows. |
| Context, state and output validation | 15 | 9.5 | 11 | 10 | Reproduced by guard states: replies made for changed answers are asked for again, on plates, menu and Rescue. Read: a base swap plus the sugar one-tap change subtracts grain energy from the swapped grain, and the grams do not change. Read: DAY and CLOCK are set once at load, so a tab left open past midnight keeps the old day for clearing and the meal slot. |
| Privacy, access and deployment | 10 | 6 | 6 | 5.5 | Read: data stays on the phone; Remove keeps only the coach's code. One shared access code for all clients; limits are in memory. The server trusts the first X-Forwarded-For address; whether Railway's edge lets a client set it is not checked. Read: the Dockerfile copies hosted/v4/server.ts; the README live section is out of date. |
| **Total** | 100 | 68.5 | 60 | **56.5** | |

## Corrections to Gemini's review
- The 19-rule text screen (`screenText`, `referRule`) does not exist. Gemini has since retracted it.
- Gemini credits katori, roti and piece as accepted household measures. The owner's rule is grams and kcal. The app drops katori and phulka units in Rescue.
- The deficit, floor, tolerance, model and temperature figures in its first version are wrong. Codex's corrections hold: BMI-based deficits, 1200/1500 kcal floors, 15 % tolerance, gemini-3.8-flash at 0.7.
- The header-spoofing risk is plausible from the code but unverified.
- The README claim is correct.

## Why the earlier checks missed this
37 Critic rounds, two screen-by-screen reviews and the rule suite tested the words already in the lists. They never tested plural or regional names, `made_of`, or the per-meal target for a client on medicines. The deploy report on 15 Nov gave no warning on any of these.
