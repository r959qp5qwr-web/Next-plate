# Next Plate v5: spec (AI-first rebuild)

**Status:** draft for owner review, 2026-11-11. Nothing gets built until the owner says "Build". Nothing gets deployed until the owner says "Deploy."
**Source of truth:** the two Gemini files the owner provided:
- **[P]** `NutriPulse AI - Pocket Dietitian` (1,273 lines)
- **[S]** `NutriPulse AI: The Summit Edition` (1,995 lines)

Line numbers below refer to those files. This spec replaces handoff sections 1, 6 and 9 wherever they disagree.

**What the Gemini files are, read in full:** working mock-ups. Their meals are hard-coded ([P] 57–240, [S] 128–315), and their "AI" replies are canned text returned on a timer ([P] 388–427, [S] handleCustomPromptSubmit). So they define the **features, screens and data shape**. v5 makes all of that real: **Gemini generates every meal, in exactly the shape the mock-ups use.**

---

## 1. Owner decisions (fixed)

| # | Decision | Source |
|---|---|---|
| D1 | AI-first. The AI generates every meal. No hand-written meal catalogue. | owner, 2026-11-11 |
| D2 | No supplements anywhere: no stack, no doses, no powders (whey, psyllium, collagen, magnesium) | owner, 2026-11-11 |
| D3 | Portions in **grams** (liquids in ml), energy in **kcal**. No katori or phulka measures. | owner, 2026-11-11 |
| D4 | Asking is not a separate tab. You type into the main screen, and the answer is a meal. | owner, 2026-11-11 |
| D5 | The "coach's food rules" framing is removed. The meals come from the AI and the client's inputs. | owner, 2026-11-11 |
| D6 | Kept from v4: Raw Linen design, Railway function, paid Gemini (gemini-3.8-flash, fallback 3.6-flash), access code, daily caps | handoff §6 |
| D6a | **The look is ours, not Gemini's.** The Gemini files supply function only: features, screens, data shape. Do not copy their colours, emerald/stone palette, Tailwind cards, icons, badges or layout. Every screen is drawn in Raw Linen as confirmed at commit 03f819c ("raw linen taken all the way"): stone paper #F2ECE1, sumi-ink EB Garamond, Caveat script, terracotta, pressed olive. | owner, 2026-11-11 |
| D7 | Safety rails kept: kidney condition and pregnancy get a referral line and no model call; with diabetes the grain stays; diet and leave-outs are absolute | handoff §4.7 |

## 2. Architecture

```
Phone page (Raw Linen, static, loaded from GitHub at PAGE_REF)
   │  POST /api/meals | /api/rescue    (validated fields only, never a prompt)
   ▼
Railway function (Bun)  ── builds the prompt itself
   │  Gemini generateContent, JSON response schema
   ▼
Validator: schema → diet/allergen filter → no-supplement filter → health-flag filter → number sanity
   ▼
Page renders the meal cards. Every tap on alchemy, swaps, the plate builder or rescue hacks is computed
on the phone from the returned deltas (instant, no extra call), as in [S] 657–702.
```

- **One call returns 3 meals** for the current meal slot, each carrying its 4 alchemy variants and its swaps. "Next" ([P] 361, [S] Next Prescription) rotates through them without a new call.
- **Cache:** generated meals are saved on the phone per day and per slot. Reopening the app costs no call.
- **Gemini down or over the cap:** show the last cached meals with the line "Couldn't reach Next Plate just now. Showing your last plates." Never fall back to a hand-written list.

## 3. Domain model

**Profile** (asked once, at first open)
- diet (veg / egg / non-veg / Jain / vegan), leave-outs (dairy, nuts, wheat, soya), health flag (none / diabetes / high BP / kidney / pregnant or nursing), home region
- age, sex, height cm, weight kg, activity level. *(Not in Gemini, which used fixed athlete targets ([S] 50–122, [P] 37–41). Without these, grams and kcal mean nothing for a sedentary 50-year-old.)*

**Day targets** (computed, shown on screen)
- kcal = Mifflin-St Jeor BMR × activity factor
- protein g = weight kg × `PROTEIN_G_PER_KG`. Default 0.83 (ICMR-NIN 2020 adult RDA), changeable by the owner.
- per meal: breakfast 25 % · lunch 35 % · snack 10 % · dinner 30 %. *(Placeholder split; the owner can change it.)*

**Mode** (the one-tap state, from [S] 50–122)
- Strength day · Trek / endurance day · Desk / focus day · Light / wind-down. Each sets the default plate ratio ([S] `defaultPortions`) and steers the AI.
- Dropped: the HRV, glycogen and hydration readouts ([S] header). They are made-up numbers, and no wearable feeds them.

**Meal-time inputs**
- meal slot (from the clock) · appetite 1–10 ([S] hunger slider; meal target × (0.85 + 0.03 × appetite), [S] formula) · mood: Best fit / Quick 15-min / High protein / Comforting / Light ([P] 43–49) · cuisine: Indian regional / Mediterranean / High-protein express ([P] 51–55) · cooking at home / ordering out ([P] 300) · oil minimal / standard ([P] 301)

**Meal** (what Gemini returns; mirrors [S] 128–315 + [P] 57–240)
```
title, subtitle, cuisine, prepMinutes
items: [{food, grams}]                         ← D3
kcal, protein, carbs, fats, fiber              ← grams; estimates
glycemic: "Low" | "Medium" | "High"
why: [{pair, effect}]  (2 items)               ← [S] synergies / [P] insight
swaps: {protein: [{food, deltaProtein, deltaKcal}] ×3, base: [{food, deltaFiber}] ×2–3}   ← [P] 72–83
alchemy: {protein, glucose, express, gut}: {label, titleSuffix, deltaKcal, deltaProtein,
          deltaCarbs, deltaFats, deltaFiber, deltaRise, note}                              ← [S] 144–190
```
- **Fit** (replaces Gemini's "98 % match"): computed on the phone from kcal and protein against the meal target. It is never generated.

**Rescue dish** (from [S] 320–533): name, portion, kcal and macros, glycemic band, `warning`, `breakdown`, hacks ×3–4, each with deltas.

**Log entry:** the meal and its final numbers after the taps. Feeds the day totals against target.

## 4. Screens (mobile, three tabs; [S] mobile nav minus Supplements)

### 4.1 Plate (home)
1. Header strip: today's protein, kcal and plates against target.
2. One row of pills, each opening its choices in place (the confirmed v4 pattern, which keeps the plate above the fold): mode, appetite, cuisine, mood, cooking and oil ([S] header; [P] 618–660).
3. **Meal card:** title + alchemy suffixes, subtitle, prep time, kcal, plate emblem; macro strip (protein, fibre, carbs, fats, glycemic band); item list in grams ([S] hero card).
4. **1-tap alchemy:** +Protein · Gentler on sugar · 10-min version · Easy on the gut. Toggles stack, and their notes are listed ([S] alchemy bar).
5. **Customize drawer:** home / ordering out, protein swap, base swap, oil level ([P] customize drawer).
6. "Why this plate": the two synergy lines ([S] synergies).
7. Actions: Next plate · Customize · Try on the plate (opens the Twin) · Log meal.
8. **Ask bar, on this screen:** a text box, plus chips taken from [S] 576–620 and [P] 242–270: craving chaat at 6 pm · heavy leg day, high-protein dinner · trek-day trail food · what to order at this restaurant (the supplement chip is removed). The answer replaces the meal cards with AI meals for that situation. Medical or off-topic questions get the referral line.

### 4.2 Plate builder (Twin) ([P] builder + [S] Capability 02)
- Ring plate with four sections (protein, greens, carbs, fats); ±5 % each, rebalancing to 100 % ([S] `adjustQuadrant`).
- Presets: the mode default · Balanced · Post-training · Steady sugar ([P] 464–469).
- Live grams and kcal for the plate at today's meal target.
- After-meal curve with toggles: veg first · 15-min walk · lemon or vinegar starter ([S] `twinTelemetry`). **See Q1.**
- "Make meals with this ratio" sends the ratio to the AI ([P] "Generate Meals Matching This Ratio").

### 4.3 Rescue ([S] Capability 03, [P] Scan Menu)
- Dish chips (biryani, mutton rara, peri-peri chicken, dessert, from [S]), free text ("butter chicken and 2 naan"), or a photo of the menu.
- Shows the dish as served (kcal, macros, glycemic band, a one-line warning) and 3–4 hacks as toggles. Totals update live, with a before/after fit.
- Hacks are food, order, sequence or walk only. No psyllium or any other powder (D2).

**Removed from v4:** the Ask tab (D4), Rhythm (water and walks, not in Gemini), the Lab name (it is now the Twin), the hand-written catalogue `src/data.js` (D1), and all katori/phulka wording (D3).

## 5. What Gemini must and must not do (prompt + validator)
- Diet and leave-outs are absolute. The validator drops any item that breaks them.
- No supplements, powders, tablets or doses (D2). The validator drops them.
- Diabetes: the grain stays, paired with protein and fibre; no sweets or juice on a plate. High BP: no pickle, papad or added salt.
- Kidney or pregnancy: no call; referral line only (D7).
- Numbers are estimates and are labelled as estimates on screen. kcal must match 4·protein + 4·carbs + 9·fats within 15 %, or the meal is dropped. *(Built at 15 % rather than 10 %: fibre and rounding alone move a correct meal by 5 to 8 %.)*
- **Plain language. No invented precision.** Not "+2000 % curcumin uptake", not "−42 % spike", no mTOR or leucine. The mechanism stays; the made-up percentages go.
- No diagnosis, no treatment claims, no promised weight loss.

## 6. Build order (each step shown rendered on a phone before the next)
1. Server: Meal and Rescue schemas, prompt, validator. Rewrite the 26-scenario check (`eval/`) for the new schema and run it.
2. Plate screen with alchemy, swaps, Ask bar and log.
3. Plate builder (Twin).
4. Rescue, including the menu photo.
5. Full phone walkthrough, eval run, owner review. Deploy only on "Deploy."

## 7. Owner answers
- **Q1 (decided 2026-11-11: band):** the after-meal curve shows Gentle / Moderate / Sharp, never mg/dL. Gemini's mg/dL numbers come from made-up coefficients.
- **Q2 (decided 2026-11-11: yes):** both Gemini files live in `docs/foundation/` (Pocket Dietitian = [P], Summit Edition = [S]).
