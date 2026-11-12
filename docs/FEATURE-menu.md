# Read the menu: what should I order?

Status: design fixed 2026-11-12 (owner's request). Build order: before the v6 Phase 1 screens go live.

## 1. Where this comes from, and what went wrong

- The owner's foundation file has it: `docs/foundation/NutriPulse-Pocket-Dietitian.jsx`, the **Scan Menu** button and the chip
  "Scanning a restaurant menu: what should I order?". Its answer has four parts: how to read this menu, what to order
  (a main with its side), swaps (leave this, pick that, with numbers), and one tip on the order of eating.
- `docs/SPEC-v5.md` 4.3 and `docs/ARCHITECTURE-v6.md` mapped it to "Rescue photo". That shrank it: Rescue takes **one dish**
  the person already chose and softens it. It never looks at a menu and never chooses. The feature below restores the original:
  the app chooses **from the menu in front of the person, for this person, for this meal**.
- Rescue stays as it is. The two are different moments: *before ordering* (Read the menu) and *after the dish is chosen* (Rescue).

## 2. The mechanism

| | |
|---|---|
| **Trigger** | The person is about to order: restaurant, delivery app, wedding buffet card, office canteen board. On the Rescue tab ("Eating out anyway") the first choice is **Read the menu**: a photo, or the menu typed or pasted. |
| **Process** | 1. Code builds the same brief the plates use: what this meal should carry today (`planDay`), goal, focus, food pattern, leave-outs, health, what was eaten today, the week's patterns, the hooks. 2. Gemini reads the menu and returns up to 8 dishes **that are on it**, each as that kind of place usually serves it (portion, kcal, protein, carbs, fats, fibre), with one way to order it better and the side from the same menu that completes it. It also names up to 3 dishes to leave today, each with a short reason, and one tip on the order of eating. 3. Code checks every dish (food pattern, leave-outs, no supplements, no health claims, sane numbers), scores each order against this meal's target (`fitOf`) and its after-meal band (`riseOf`), ranks them, and keeps the best three. Gemini does not rank; code does. |
| **Artefact** | **Your order**: one order to place (dish, its side, how to ask for it), with ≈ kcal and protein, fit out of 100, the after-meal band, and "planned around" tags. Two alternates below it. Then **Leave for another day** (the dishes to skip, with the reason) and the one eating-order tip. |
| **Outcome** | In the time it takes to open a menu, the person has one order and the reason. "I'll order this" counts it as this meal, so the day line and the next meal follow it, just as a rescued or typed meal does. |

## 3. Rules the code enforces (not the model)

1. **Only dishes from the menu.** For a typed menu, a dish whose name does not appear in the text is dropped. For a photo the model must copy the name as written (`as_written`); a reply with no readable dishes returns "I could not read that menu" and asks for a clearer photo or the text.
2. **Food pattern and leave-outs** as for plates (`crosses`): a vegetarian never sees a chicken dish, even as a "leave".
3. **Safety rails unchanged.** Kidney condition and pregnancy are stopped before the model (the same step-back card). With diabetes the order keeps a grain (a roti, rice, or the dish's own grain), measured, and the prompt says so; an order with no grain is dropped for a person with diabetes (the same check the plates use, `GRAINW`). On insulin or sulfonylurea (meds yes or unsure) the order must not fall under the meal's usual energy.
4. **No supplements, no health claims** (`supp`, `CLAIM`) in any text shown.
5. **Honest numbers.** Restaurant numbers are rougher than home numbers. Every figure carries ≈, and the screen says "Estimates for how this kind of place usually serves it. Kitchens vary." No figure is invented by code; a dish with a missing or out-of-range number is dropped.
6. **Code ranks.** Order score = fit to this meal's energy and protein target, then gentler after-meal band, then fewer changes needed. Ties keep the menu's order.
7. If nothing on the menu fits (best fit under 40), say so plainly and show the least-bad order with the two moves that help most. Never pretend a bad menu is a good one.

## 4. Engine contract

- New kind `menu` in `KINDS`; `plan("menu", body)` returns `{prompt, schema, image:true, weight:1, check}`.
- Request: `{profile, ctx:{meal, appetite, hour, dayNo, text?}, file, image?}`. `ctx.text` is the typed or pasted menu (up to 2,000 characters; raise the limit in `readCtx` for this kind only). A photo or text is required.
- Model reply (schema-enforced): `{status:"ok"|"refer"|"unreadable", place:STRING (what kind of place this looks like, at most 40 chars), dishes:[{as_written, portion, kcal, protein, carbs, fats, fiber, ask (how to order it better, at most 80 chars, may be empty), with (a side from this menu, at most 60 chars, may be empty), with_kcal, with_protein, with_carbs, with_fats, with_fiber, planned_around:[hook ids offered by code]}], leave:[{as_written, why}], tip:STRING}`.
- Checked reply to the page: `{status, place, orders:[{name, portion, ask, with, n:{kcal,protein,carbs,fats,fiber}, fit, rise, planned:[ids]}] (best first, at most 3), leave:[{name, why}] (at most 3), tip, dropped:{...}, note?}`. `n` is the dish plus its side.
- Hooks: reuse `hooksFor`; offer the same ids; unknown ids are dropped (as `checkReply6` does).

## 5. Screen (Raw Linen, no new colours or fonts)

Rescue tab, top to bottom:
1. Heading as today ("03 · Rescue", "Eating out anyway").
2. Two entries side by side: **Read the menu** (camera icon; opens photo, with "or type it" under it that opens a text box) and the existing **Name the dish** field. The existing chips stay under the dish field.
3. While reading: the wait card, text "Reading the menu for your dinner".
4. Result: a card "Your order · dinner" with the top order (name in display type, `with` line, `ask` line in the handwriting face, ≈ kcal and protein, fit, band, planned-around tags), button **I'll order this**; two alternates as compact rows (tap to make one the top order); **Leave for another day** list; the tip; the fine print from rule 5.
5. "I'll order this" logs the event (type `ordered`, counted like `rescued`), returns to the Plate tab, toast "Counted for dinner. The rest of the day follows it."

## 6. Proof before it is called done

- Unit checks for `checkMenu`: off-menu dish dropped (typed menu), non-veg dropped for a vegetarian, diabetes order without grain dropped, numbers out of range dropped, ranking by fit, "nothing fits" path, unreadable path, kidney and pregnancy stopped before the model.
- Mock-engine screenshots of the Rescue tab: entry, reading, result, alternates, leave list, after "I'll order this".
- Live-engine check (needs the owner's "Deploy." because the live engine reads its code from the pinned commit): at least 8 menus (North Indian, South Indian tiffin, Indo-Chinese, pizza, cafe, wedding buffet card, canteen board, a blurred photo) across vegetarian, diabetes, non-veg and leave-out profiles. Recorded in `eval/v6/`.

## 7. Later, not now

Several menu pages in one go; delivery-app links; a table of two or more people sharing; remembering what the person ordered at this place last time.
