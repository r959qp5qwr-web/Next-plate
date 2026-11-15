# Usefulness and safety: assessment and brief (15 Nov)

The owner's question: are repeated audits making Next Plate reject so much that it stops helping? The purpose stays: "Given how I eat and what I've already eaten today, help me choose my next meal."

## 1. Evidence

### Builds compared

| Build | Commit | What it is |
|---|---|---|
| Live | 6febc1a | Served at www.nextplate.in, byte for byte. |
| Audited candidate | 06d880f | Audited by Codex and by both of our own audits. |
| Paused round 5 | fa486dd | Branch head. Work in progress; the safety suite fails on it. **Not a candidate.** |

### Current evidence: measured on 15 Nov

**Method**
- Raw live model replies recorded in `eval/v6` were replayed through each build's own checks.
- Scripts and outputs are in `eval/usefulness/`.
- **Clean corpus:** `results-live-r33` and `r37`, recorded on the live build's prompt. That is 25 meal requests and 75 plates.
- **Harness check:** on the live build the replay gives the same plate count as was shown (35 of 35, 39 of 39).
- **Tags:** those replies predate tagging, so tags were supplied from the engine's own word lists plus a fixed grain list. This stands in for an honest model.

| Build | Plates shown | Requests with no plate | Requests with one plate | "Why this plate" line | Pairing tip |
|---|---|---|---|---|---|
| 6febc1a (live) | 74 of 75 | 0 of 25 | 0 | 74 of 75 | 59 of 59 |
| 06d880f (audited) | 14 of 75 | 13 of 25 | 10 | 0 of 75 | 0 of 59 |
| fa486dd (paused) | 44 of 75 | 4 of 25 | 7 | 0 (removed) | 0 (removed) |

**What drives the loss on 06d880f:** 58 of 61 drops are `contents-empty`. A food with nothing to declare is dropped unless every word of its name is on the plain list.
- "Mustard oil", "Cucumber and tomato salad", "Cooked yellow moong dal", "Mint coriander chutney" and "Kala chana curry" all go.
- The closed sentence check removes every model sentence.

**What drives the loss on fa486dd:** 27 of 31 drops are the name-shape rule: brackets, commas or digits in a name.

**Wider corpus** (all recordings, 106 requests, older prompts included), on 06d880f:
- swaps survive 24 of 171;
- one-tap changes survive 0 of 120.
- On the live build: 153 of 171 and 106 of 120.

**Menu** (14 recorded menus):
- live 38 orders;
- 06d880f 35;
- fa486dd 34, with one diabetic South Indian menu left empty.
- Menus are not where the loss is.

**Model failures in recorded ordinary use**
- **Caught:** on a BP client's canteen menu the model offered a "Veg Thali (… papad, pickle)". The live word lists caught it, twice, and it was not shown.
- **Shown:** the live build shows "Chicken Curry Thali (2 roti, rice, chicken curry, salad)". That is a household count with no grams, which breaks S8.
- **Plate items:** of 1,446 recorded items, the engine's own lists flag one against its scenario. It is a false alarm ("Lemon juice and spices" read as sweet). This count is scored by the same lists that miss "Kori", "Payesh" and "Poondu", so it does not show the model is safe on unlisted names.

### Historical findings (earlier builds, recorded in `docs/review/`)
- 367 live replies (332 reply-and-rule pairs) offered none of the barred words searched for.
- Every BLOCKER in four safety audit rounds and the Codex re-audit came from scripted replies, or from app logic. App-logic examples:
  - kept plates surviving a diet change;
  - Builder shares going negative;
  - figures not checked after changes.
- The app-logic findings need no model fault and are reachable in ordinary use.

### Untested assumptions
- **At-risk profiles:** how often the model mis-tags or offers barred food for Jain, vegan, left-out-food or regional clients. The recorded meal scenarios are vegetarian, egg or non-vegetarian north Indian only.
- **The candidate's own prompt:** how the live model behaves under it. Tags and the vocabulary are untested live.
- **Familiarity and coach time:** no coach has rated plates, and no time saved has been measured.
- **Urgent symptom wording and the medicines boundary:** these have no clinical review.

## 2. Two tiers

**Tier 1: essential promises.** These block release. Each is held by a deterministic check that keys on structure, not on vocabulary.
- **Diet and left-out foods (S1–S4, S9):** declared tags checked against the client's rules; a missing or barred tag drops the item; the word lists are the second net.
- **Grain and medicines floor (S5, S6):** the grain stays, and a client on medicines keeps the usual meal size. Both are checked on the final combined state at render, on every tap, and before logging.
- **Referral (S7):** kidney and pregnancy, ticked or typed. Plus a first net for urgent symptoms before the model, on every text path.
- **Figures agree:** the shown kcal agrees with its macros within the existing 15 %, after every swap, change and Rescue move.
- **Units:** grams and kcal. No household count shows in a name or portion (the live "2 roti" case).
- **App logic:**
  - kept plates are dropped when the rules change;
  - day change;
  - stale replies;
  - Builder shares stay in bounds and reach the engine unchanged.

**Tier 2: refinements.** These go to a backlog. Each is monitored by sampling and blocks release only if it turns up in ordinary-use samples, or is a trivially reachable app-logic path.
- Spaced or look-alike letters in model sentences.
- Negation parsing in typed text.
- Unlisted regional names carrying a wrong but non-empty tag. This one gets promoted to tier 1 if the at-risk live sample shows mis-tagging.
- Sentence meaning, such as "Skip the rice tonight". Measure how often it occurs. A targeted screen for tier-1 harms (grain removal or eating less for diabetes or medicines, supplements, units, barred foods) is acceptable; a closed allowlist is not.
- Edge spellings of supplements or units.

## 3. Brief for Claude: bounded evaluation, then the smallest changes

**1. Bars first.** The owner picks the numbers by option survey before any change. Proposed defaults:

| Bar | Proposed default |
|---|---|
| Plates | Two or more plates on at least 90 % of plate requests; no plate on at most 5 %. |
| Reason | A reason line on at least 90 % of plates. It may be written by the engine from the hooks the plate was planned around. It shows the day was read. |
| Changes | One-tap changes or swaps on at least 80 % of plates. |
| Menu | Two or more orders on at least 85 % of menus. |
| Safety | No tier-1 promise broken on screen in the labelled samples. Every drop labelled "model failure" or "filter loss". |

**2. Fixed corpus**
- (a) **Recorded replies,** offline:
  - the existing clean corpus;
  - plus the recorded menus;
  - plus Codex's and both audits' counter-examples as negative cases;
  - plus the 573 frozen controls, run on profiles that have rules, not on an empty profile.
- (b) **A fresh sample of the live engine** for at-risk profiles:
  - Jain, vegan, dairy-free, wheat-free, nut-free, South/East/West regional, BP, diabetes with and without medicines;
  - about 12 profiles × 3 meals × 2 runs, plus 8 menus: about 80 calls;
  - uses the temporary EVAL_CODE procedure (two restarts of a few seconds each);
  - raw replies saved and hand-labelled.
- (c) **The candidate under its own prompt,** in a non-production run. This needs the owner's go.

**3. Attribution.** Each drop and each shown violation gets one label:
- model failure caught;
- model failure shown;
- filter loss (honest food removed);
- app-logic fault.

Filter losses are fixed in the filter. Model failures are weighed by their frequency in (b) and (c).

**4. Smallest changes, as a hypothesis to test against the bars, not a fixed plan.** Start from 06d880f, not from round 5.
- Believe an honest empty or "plain" declaration on a name no word list flags.
- Replace the closed sentence allowlist with a targeted screen for tier-1 harms. Or write the reason line in the engine from hooks; choose by measured rates.
- Keep from round 5 only the structural parts:
  - the kept-plate rule stamp;
  - one wrapper for logging taps;
  - fixed placeholders;
  - no household counts in names.
- Add Codex's structural fixes:
  - figures agree on the combined state;
  - the urgent-symptom first net;
  - Builder bounds;
  - honest medicines wording.
- Choose the implementation. Rerun (a) after each change and report the table above.

**5. Stopping point.** The cycle ends when all four hold:
- the bars are met on (a) and (b), and on (c) if it is run;
- no tier-1 promise is broken in the labelled samples;
- every tier-1 property has a test that fails on a regression;
- one final audit, scoped to tier 1 with a fixed budget, finds no tier-1 counter-example. Its tier-2 findings go to the backlog with a frequency note.

There is no further audit round for tier-2 findings. Then ask the owner for "Deploy.". After that, a weekly sample of 20 live replies with the coach's labels replaces audit rounds.

**6. Narrower supported scope**, if the bars cannot be met:
- home plates and menus first;
- Rescue moves written by the engine;
- menu photos off.
- For clients on insulin or sugar tablets, the owner and a clinician decide: plates kept at the usual size plus a doctor line, or a referral.

## 4. Judgment

**Measured mechanism, not opinion:** the audited candidate 06d880f is excessively restrictive.
- Against honest-proxy replies it would show no plate for about half of plate requests.
- It shows no "why this plate" line and no one-tap change.

Most of that loss comes from two vocabulary checks (the empty-list rule and the closed sentence check), added in answer to scripted attacks whose frequency in ordinary use is unmeasured.

**The paused round 5 recovers plates but removes every explanation.**

**Dependability is improving where checks key on structure:**
- declared tags;
- the medicines floor;
- the grain;
- referral;
- figures agreeing;
- app logic.

**The live build is useful and has a few genuine gaps:**
- household counts in names;
- urgent text routed to the model;
- figures not checked after changes.

**Evidence is still insufficient** on the at-risk profiles, which is where Codex's examples sit.

**Next:**
- the owner sets the bars;
- run the at-risk live sample;
- then make the smallest changes in section 3 and stop when the bars and tier 1 hold.
