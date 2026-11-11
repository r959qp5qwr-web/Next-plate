# Next Plate v6: the context engine

**Status:** architecture and data plan for owner review, 2026-11-12. Nothing is built from this until the owner says "Build".
**Supersedes:** the product framing in `SPEC-v5.md`. v5's working parts (Gemini meal schema, safety checks, Builder, Rescue, Raw Linen look) carry over as components.
**Sources:** the owner's Gemini files `docs/foundation/` ([P] Pocket Dietitian, [S] Summit Edition), v4 (`src/v4/`), the owner's corrections.

---

## 1. Thesis

Next Plate is a **context engine for one person's eating**. It builds up an understanding of the person (body, goal, kitchen, habits, calendar, what they actually eat) and uses AI to turn that understanding into the next right plate, the day's plan and the week's one change.

**The test of intelligence:** every suggestion can say *why it is for this person, today*, in their own terms, and that reason is traceable to something the app actually knows.

> "You're 25 g short on protein today and you usually skip breakfast on workdays, so this lunch carries it.
> Rajma was dinner twice this week, so the legume today is chana."

v5 could not say this; it knew a profile and six toggles. That gap is the whole job of v6.

## 2. Design principles

1. **Context over toggles.** The app sets the choices from what it knows (mode, appetite, what's left today), and the person corrects them. This is Gemini's "zero-input brain" ([S] §1), done with real signals instead of invented HRV.
2. **Observe before asking.** Learn from what the person picks, swaps, skips and logs. Ask one question at a time, only when the answer would change a plate.
3. **Code counts, AI cooks.** Arithmetic, targets, patterns and safety are deterministic code. Food knowledge, menus, estimates from free text or photos, and plain-language explanation come from Gemini.
4. **Every number is honest.** It is either an estimate labelled as one, a band from a stated model, or not shown. Nothing is invented (§9).
5. **Reasons are verifiable.** Gemini may only cite context the engine handed it (§5.3, "hooks"). A reason it cannot point to is dropped.
6. **The person owns the file.** Everything the app has learned is visible, editable and deletable in one place (§10, *My food file*).
7. **Safety gates sit outside the model**, both before and after every call and over time (§8). With kidney disease or pregnancy, nothing goes to the model.
8. **The coach stays in the loop where clients already are:** WhatsApp.

## 3. Architecture

```
 SIGNALS                         EVENT LOG                 CONTEXT BUILDER (code)            FOOD FILE
 asked: goal, diet, health,  ─┐  append-only, dated,   ─►  reducers, recomputed on      ─►  stable · preferences ·
   body, kitchen, calendar    │  90 days on the phone      every new event                  patterns · today · trend ·
 observed: shown, chosen,     ├─►                                                           flags
   swapped, skipped, had,     │                                                                 │
   had-other, asked, rescued  │                                                                 ▼
 check-ins: weight, energy,   │                                                    CONTEXT BRIEF (code)
   sleep, bloating, water,    │                                                    per call, ~300 words + hook ids
   walk                      ─┘                                                                 │
                                                                                                ▼
 SURFACES  ◄──  SAFETY GATE (out)  ◄──  REASONERS  ◄──  SAFETY GATE (in)  ◄────────────────────────┘
 Today · Builder · Rescue ·         day planner (code) · plate engine (AI) · adjuster (code) ·
 Week · My food file                logger (AI) · rescue (AI) · ask (AI) · weekly review (code+AI) ·
     │                              question picker (code)
     └── every tap and log is a new SIGNAL ───────────────────────────────────────────────► (loop)
```

| Component | Kind | Takes | Gives |
|---|---|---|---|
| Event log | storage | every signal, with time and meal slot | the history everything else is derived from |
| Context builder | code | event log | the food file (§4) |
| Day planner | code | food file, calendar, clock | today's targets by meal, what's left, the day directive |
| Context brief | code | food file plus the current request | the text Gemini reasons from, plus allowed hook ids |
| Plate engine | Gemini | brief | 3 plates (v5 schema, plus `planned_around` hooks) |
| Adjuster | code | plate, swaps, one-tap deltas | the plate after taps (v5) |
| Logger | Gemini | "had something else": text or photo | items, grams and estimates, confirmed by the person |
| Rescue | Gemini | brief plus a dish, text or menu photo | the dish as served, plus moves (v5) |
| Ask | Gemini | brief plus a question | plates, an advice card, or a referral |
| Weekly review | code + Gemini | 7 days of the file | 3 observations, 1 change, a coach message |
| Question picker | code | gaps in the file | at most one context question a day |
| Safety gates | code | inputs, outputs, trends | block, filter, refer, flag to the coach |

## 4. The food file (domain model)

### 4.1 Stable: asked once, editable
| Field | Values | Why it matters |
|---|---|---|
| goal | lose · hold steady · build strength (restored from v4; [P] GOALS) | sets targets and plate balance |
| diet, leave-outs | veg · egg · non-veg · Jain · vegan; dairy, nuts, wheat, soya | absolute filters |
| health flag | none · diabetes · high BP · kidney · pregnant or nursing | gates and rules |
| body | sex, birth year, height, weight (weekly) | targets |
| activity baseline | sitting · light · moderate · hard | targets |
| home food | North · South · West · East; languages of dish names | default cuisine and names |
| nutrient focus | iron · B12 · calcium and D · protein · fibre (restored from v4 "Running low on") | plate emphasis; tea-timing note for iron |

### 4.2 Kitchen: the Indian reality, learned through one-a-day questions
| Field | Values | Effect |
|---|---|---|
| who cooks, per meal | self · family · cook · canteen or mess · order | **family cooks** means plates are built *from the family pot*: portions, add-ons, what to take first, not separate recipes |
| tonight's pot | free text ("rajma chawal, bhindi") | the strongest single input for a family-cooked meal |
| staples at home | list, learned from fridge photos and "had" logs | plates use what is there |
| tiffin days | weekdays | packable, travels well, eats cold |
| equipment | pressure cooker, air fryer, microwave | express versions that are real |

### 4.3 Calendar
| Event | Effect on plans |
|---|---|
| trek (date, days, altitude band) | lead-up days: steadier carbohydrate, salt and water emphasis; trail-food packing list ([S] triage "trail"); v4 safety line: *"Turn back if you feel unwell; no plate fixes altitude."* |
| fast: Navratri, Ekadashi, Ramzan, custom | vrat-compatible foods; with diabetes, protein-led vrat plates and a caution; Ramzan shifts slots to sehri and iftar |
| travel, wedding or function | rescue-first day; lighter meals around it |
| workout or sport | mode becomes strength or active automatically ([S] modes, now inferred) |

### 4.4 Events (the log)
`shown · chosen · swapped(protein/base) · tuned(one-tap) · next(rejected) · had · had_other(text/photo → items) · skipped · asked · rescued · water · walk · workout · checkin(weight | energy | sleep | hunger | bloating) · answered(question id)`
Each event carries: time, meal slot, plate id or items, kcal/protein/carbs/fats/fibre estimates where relevant, and the source (tap, AI estimate, or person-confirmed).

### 4.5 Learned: derived by code, shown in *My food file*, every item deletable
| Pattern | Rule (thresholds are owner parameters, §13) | Used for |
|---|---|---|
| liked / disliked foods | score per food word: had +3, chosen +2, swapped away −2, next-skipped −1, "never" −∞ | plates lean to likes and avoid dislikes |
| usual portions | median of confirmed logs ("2 phulkas", "1 katori rice") | realistic grams; the logger's defaults |
| meal timing | median logged time per slot, last 14 days | windows, "next meal in 2 h", late-dinner logic |
| skipped meals | skips per slot, weekday vs weekend | redistribute targets; one gentle nudge a week, never nagging |
| late dinner | dinners after the owner's cut-off | lighter, earlier-leaning dinner plates |
| eating out | rescue and had-other-out events by weekday | rescue offered first on those days |
| protein shortfall slot | the slot furthest under its protein aim over 7 days | that slot leads with protein |
| repeats | the same dish 3 or more times in 7 days | variety in the next plates |
| adherence | days with protein ≥ the aim's share and kcal within the target band | weekly review, coach summary |
| weight trend | 4-week moving slope of weekly weights | pace check; the safety flag if too fast |
| how they feel | energy, sleep, bloating check-ins, alongside foods | observations only, never diagnosis |

### 4.6 Today (recomputed after every event)
Targets for the day and per slot; eaten so far; **what's left** (kcal, protein, fibre); hours since the last meal; mode (inferred, overridable); appetite (suggested from the hours since and size of the last meal, overridable); water and walks; next meal window.

### 4.7 Flags (safety, §8)
Referral states, pace warnings, low-intake streaks, words in an ask that need a human. Each flag has a reason, a date, and whether the coach was told.

## 5. The context brief: how Gemini gets the person

### 5.1 Structure (≈300 words, assembled by code each call)
1. **Person:** age band, sex, goal, diet and leave-outs, health flag, home food.
2. **Today:** meal and clock; targets; eaten so far; what's left; hours since the last meal; mode and why.
3. **Patterns relevant to this slot:** at most 4, each with a hook id.
4. **Likes, dislikes, usual portions:** the top 5 each.
5. **Kitchen now:** who cooks this meal; tonight's pot or staples; tiffin or not.
6. **Calendar:** any event within 3 days.
7. **The request:** a new plate, an ask, a rescue or a log, plus the person's words.
8. **Hard rules:** the v5 rules block (diet, no supplements, no invented claims, honest estimates).

### 5.2 Example (illustrative only, not data)
```
PERSON  F, 45-49, goal: lose (gently). Vegetarian, no nuts. Diabetes. North Indian home food.
TODAY   Thu dinner, 8:40 pm. Day target 1,550 kcal, 62 g protein. Eaten 1,020 kcal, 34 g protein.
        Left: ~530 kcal, 28 g protein. 6 h since lunch. Mode: desk day (no workout logged).
PATTERNS [late_dinner] dinner after 9:30 pm on 4 of the last 7 days.
         [protein_gap_dinner] dinner is her lowest-protein meal this week.
         [repeat_rajma] rajma was dinner on Mon and Tue.
LIKES   paneer, moong, bhindi, curd · DISLIKES karela · USUAL 2 phulkas, 1 katori dal
KITCHEN family cooks dinner. Tonight's pot: "aloo gobhi, dal, phulka".
CALENDAR trek on Sunday (3 days).
REQUEST next dinner plate. Hooks you may cite: late_dinner, protein_gap_dinner, repeat_rajma, likes_paneer,
        family_pot, trek_sunday, diabetes_grain.
```

### 5.3 Hooks make the reasons verifiable
Gemini returns `planned_around: [hook ids]` with each plate. The validator drops any hook that was not offered. The screen shows them as small handwritten tags under the plate: *planned around: protein gap at dinner · family pot · trek Sunday*. The intelligence becomes visible, and it cannot be made up.

## 6. Reasoners

| Reasoner | What it does | Kept from |
|---|---|---|
| **Day planner** (code) | Targets from goal and body (Mifflin-St Jeor × activity, minus the goal adjustment, never below the floor); split across slots by learned timing; what's left after logs; calendar adjustments; writes the **day directive** in one sentence: *"Today: ~1,550 kcal, 62 g protein. 28 g to go. Light, early-leaning dinner; trek Sunday."* | [S] "Live Dietitian Directive" |
| **Plate engine** (Gemini) | 3 plates from the brief: items in grams, kcal and macros, swaps, 4 one-tap changes, why-pairs, `planned_around`. For a family-cooked meal: "from the pot" plates (portion, add-on, order). | v5, [S] CURATED_MEALS, [P] MEALS_DB |
| **Adjuster** (code) | Swaps and one-tap deltas, Fit, Rise band, **Fullness band** (short / medium / long, from protein, fibre and kcal density; the honest form of [S] `satietyHours`) | v5, [S] |
| **Logger** (Gemini) | "Had something else": typed words or a plate photo become items, grams and estimates, shown back for one-tap confirmation; confirmed portions feed *usual portions*. | v4 served-plate photo idea, new |
| **Rescue** (Gemini) | v5 Rescue, now with the brief (what's left today, goal), so the moves fit the day. | [S] DELIVERY_DISHES, v5 |
| **Ask** (Gemini) | Answers as plates, or as an advice card: *headline · what to do · why for you · planned around*. The opening line shows it knows the day. | [S] triage, [P] chat opening line |
| **Weekly review** (code + Gemini) | Code computes adherence, protein by slot, weight trend, patterns found. Gemini writes 3 observations and **one change for the week**, plus a WhatsApp message for the coach. | new |
| **Question picker** (code) | At most one question a day, chosen by how much the answer would change plates: who cooks dinner, tiffin days, staples, equipment, upcoming events. | new |

## 7. Loops (trigger · process · artefact · outcome)

| Loop | Trigger | Process | Artefact | Outcome |
|---|---|---|---|---|
| **Start** (≈90 s) | first open | goal, diet and leave-outs, health, body; everything else learned later | food file v1 | first plate within two minutes |
| **Meal** | the app opens near a meal window, or a meal is tapped | day planner → brief → 3 plates → tune → **had it / had something else / skipped** | plate event | what's left updates; the next plate rebalances |
| **Family pot** | who cooks = family, at that meal | "What's cooking tonight?" (one line, voice or text) → plates from the pot | pot event | realistic plates the person can actually eat |
| **Log other** | "had something else" | text or photo → logger → confirm | had_other event | today stays true; portions learned |
| **Day close** | after dinner, or the first open next morning | one tap each: energy, hunger, bloating; walk done; water | check-in events | patterns; next day's plan |
| **Week** | Sunday evening | weekly review → 3 observations, 1 change → send to coach | review card plus WhatsApp text | one habit to work on, coach informed |
| **Calendar** | event within 3 days | planner shifts targets and plates; trek: packing list and safety line | directive note | prepared, not surprised |
| **Rescue** | eating out, or a dish named | brief → dish → moves | rescue event | it fits the day |
| **Ask** | typed or spoken on Today | brief → plates, card or referral | ask event | an answer grounded in the person's day |
| **Ask once** | a gap in the file, at most once a day | question picker → a card on Today | answer event | the file improves without a long form |

## 8. Safety architecture

| Gate | Where | Rules |
|---|---|---|
| **Before the model** | server | kidney or pregnancy: referral, no call (v5). Ask text naming symptoms, medicines, lab reports, a child's diet, or eating-disorder words: referral, no call. |
| **After the model** | server and page | v5 checks: diet and leave-outs, no supplements, diabetes grain stays, high BP no salty extras, no invented claims, kcal vs macros, hooks must be ones offered. |
| **Over time** (new) | context builder | low-intake streak, too-fast loss, skipping every meal for days, or the same worrying words in asks: suggestions pause, a calm referral line shows, the coach is flagged in the weekly message. Thresholds are owner parameters. |
| **Trek** | day planner | food and water guidance only; the turn-back line is always shown on trek days; no altitude medicine. |

## 9. Honest-numbers policy

| Shown as an estimate (labelled) | Shown as a band (stated model) | Never shown |
|---|---|---|
| kcal, protein, carbs, fats, fibre; item grams; dish totals in Rescue; day totals; targets | Rise (Gentle / Moderate / Sharp); Fullness (short / medium / long); Fit (0 to 100, computed against target) | blood-sugar numbers, mg/dL, HRV, glycogen, leucine, "−42 % spike", supplement doses |

## 10. Surfaces (information architecture; the look stays Raw Linen)

| Surface | What it holds |
|---|---|
| **Today** | Masthead · **day directive** · what's left (protein, kcal, fibre) · meal slots with "next meal in 2 h" (v4) · the plate: thali, grams, ticket stubs (protein, carbs, fats, energy, fibre, rise, fullness), one-tap changes, swaps, *planned around* tags, why · **had it / had something else / skipped** · alternatives · ask bar with voice (v4) · rhythm strip: water, walks, next window (v4 Rhythm, folded in) · one question a day · Send to coach on WhatsApp (v4) |
| **Builder** | plate ratio, presets, after-meal curve with habits (v5), "plan with this plate" |
| **Rescue** | dish, text, menu photo; moves; fits the day (v5 plus the brief) |
| **Week** | adherence, protein by slot (v4 bars), weight trend, patterns found, **one change**, send to coach |
| **My food file** (from the masthead) | everything learned, in plain lines, each with *edit* or *forget*; export; delete all |

Tabs: Today · Builder · Rescue · Week. On a wide screen, the v4 studio layout shows Today, Builder and Rescue side by side.

## 11. Storage, privacy, sync

| Phase | Where the file lives | Coach | Notes |
|---|---|---|---|
| **A** (recommended start) | on the phone: event log plus derived file, export and delete built in | WhatsApp messages from the person | nothing leaves the phone except the brief sent to Gemini (no name, no phone number) |
| **B** | Supabase, one row-protected record per client (already connected to this session) | coach view of flags, weekly reviews, adherence | the log is designed to sync from day one, so B is a move, not a rewrite |

## 12. Traceability

### 12.1 From the Gemini files
| Gemini | In v6 |
|---|---|
| [S] zero-input bio-state | **inferred** mode and appetite from real signals, overridable |
| [S] HRV, glycogen, hydration readouts | dropped: no sensor; replaced by real check-ins |
| [S] Live Dietitian Directive | day directive (§6) |
| [S] curated meals and one-tap changes | plate engine and adjuster |
| [S] synergies | why-pairs, plus *planned around* |
| [S] satietyHours | Fullness band |
| [S] CGM twin and habit toggles | Builder curve, a band |
| [S] delivery deconstructor | Rescue, now fitted to the day |
| [S] circadian timeline | **timing kept** (meal windows, early dinner, walks); supplements dropped (owner decision) |
| [S] triage chips and structured answer | Ask: plates or advice card |
| [S] commit and log to timeline | event log, Week |
| [P] goals | goal restored |
| [P] mood, cuisine, cook or order, oil | inputs, now pre-set from context |
| [P] protein and base swaps | kept |
| [P] plate builder and presets | Builder |
| [P] chat opening that knows your day | Ask opening line from the brief |
| [P] Scan Menu | Rescue photo |
| [S] Command Studio / Pocket view | the v4 studio layout for wide screens (the coach's laptop), the phone layout for clients |
| [P] match score, [P] glycemic load | Fit (computed), Rise band |

### 12.2 Restored from v4
Goal · nutrient focus · rhythm (water, walks, windows, mode tips, trek turn-back line) · voice (speak and listen) · WhatsApp *Send to coach* · plate photo for logging · "you had X at lunch, so…" reasoning (now general, via hooks) · late-dinner logic · protein-by-meal bars · tiffin and in-a-rush situations · studio layout for wide screens.

### 12.3 New in v6
Event log and food file · context brief with verifiable hooks · family pot · logger · learned likes, portions and patterns · calendar (treks, fasts, functions) · question picker · weekly review with one change · over-time safety gate · Fullness band · *My food file*.

## 13. Owner parameters (the owner sets them; the proposals are marked, not facts)
| Parameter | Proposal | Status |
|---|---|---|
| protein per kg | 0.83 g (ICMR-NIN 2020 adult RDA) | in v5; owner may raise for "build strength" |
| goal adjustment, lose | proposal: 15 % below maintenance, never below BMR | **needs your number** |
| goal adjustment, build | proposal: maintenance, protein raised | **needs your number** |
| meal split | 25 / 35 / 10 / 30 % (v5 placeholder) | needs your confirmation |
| late-dinner cut-off | proposal: 9:30 pm | needs your confirmation |
| pace flag (loss per week) | leave empty until you set it | **needs your number** |
| low-intake flag | leave empty until you set it | **needs your number** |

## 14. Build phases (each shown rendered on a phone and checked against real Gemini before the next)
| Phase | Delivers | Done when |
|---|---|---|
| 1 | event log, food file, day planner, directive, context brief with hooks, goal and nutrient focus restored, had / other / skipped | a plate shows *planned around* tags that match the day; what's left updates after logging |
| 2 | logger (text and photo), learned likes, portions and patterns, family pot | after a week of test events, plates visibly change with likes and patterns |
| 3 | rhythm strip, voice, WhatsApp, one question a day | one-hand use from WhatsApp, voice in and out |
| 4 | Week review, *My food file* | one change a week; every learned item editable |
| 5 | calendar: treks, fasts, functions | Navratri and trek scenarios pass the quality check |
| 6 | Supabase sync and coach view (on your word) | the coach sees flags and weekly reviews |

The quality check grows with each phase: v5's 26 scenarios, plus context scenarios (late dinner, protein gap, family pot, repeats, fast with diabetes, trek lead-up, low-intake flag).

## 15. Decisions needed (one word each)
1. **Thesis and architecture:** approve as the product. *Recommend: approve.*
2. **Storage:** phone first (A), or Supabase from day one (B)? *Recommend: A.*
3. **Phase 1 start:** build Phase 1 now? *Recommend: yes.*
4. **v5 on Railway** to test the Gemini plate engine with real output while Phase 1 is built: "Deploy."? *Recommend: yes; v6 reuses that engine.*
5. **Owner numbers** in §13: send them when ready; until then the flagged fields stay empty and those flags stay off.
