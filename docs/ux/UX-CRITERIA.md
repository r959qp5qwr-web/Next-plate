# Next Plate UX/UI criteria

What every surface of Next Plate is held to before it reaches a client. Built from three studies of the sources in this environment:
- `SOURCE-builders-doctrine.md`: Builders Doctrine, module ux-design-assurance v1.1, Canon, Playbook, Audit Protocol (IDs BD-xx).
- `SOURCE-visual-and-audit-skills.md`: visual-taste, interaction and audit skills (VectorLab), ux-audit / usability-audit / audit-cuj, launchworthy (VT, IX, AU).
- `SOURCE-consistency-and-a11y-skills.md`: ui-consistency, design-skills (accessibility-audit, design-critique, interaction-design, ux-writing), Anthropic design (accessibility-review, ux-copy), design-review, frontend-design (A11Y, UC, DC, INT, UXW).

The users: middle-aged clients, many on 320-412 px phones, often in dark mode, some with enlarged system text and weaker near vision, opening
the app from WhatsApp. Where a source offers a range, the stricter end is used for them.

## Part A. Measured on every surface and state (test/ux/review.js; thresholds in test/ux/criteria.js)
Viewports: 320×568, 360×740, 390×844, 412×915 in the gate set; 375×667, 393×851 and 430×932 added in the full set. Light and dark scheme.
360 px with text at 130 % (Android text scaling). 37 states: setup steps 1-3; plate loading, ready, dial open, swap open, one-tap on, logged,
skipped (on tablets), error, blocked (kidney), no body data; sheets: my food, how the numbers work, log a meal (ask and estimate);
plate asked; toast; Builder, Builder adjusted, Builder with no plate, Builder blocked; Rescue entry, wait, result, error, blocked; menu typed, wait, unreadable, error, nothing fits, order; log error; pregnancy referral; removal confirmation.

| ID | Criterion | Threshold | Sources |
|---|---|---|---|
| A1 | Nothing scrolls sideways; no element beyond the phone edge unless inside one horizontal scroller | page scrollWidth ≤ clientWidth at every width | BD-08, BD-76, VT-29, VT-32, AU-32, WCAG 1.4.10 Reflow (320 px) |
| A2 | No text cut off by its box or running past it (where a neighbour paints over it); input hints fit their box | scrollWidth/scrollHeight within the box when overflow is hidden; placeholder width ≤ input room | BD-03, BD-08, VT-12 |
| A3 | Text and controls never overlap; the last content scrolls clear of the fixed ask bar and tabs; what a tap produces comes into view | overlap ≤ 2 px | BD-08, BD-15, BD-76, IX-58 |
| A4 | Type: no text under 14 px, chart text included; body about 16 px or more; inputs 16 px or more (iOS zooms on focus below 16 px); the handwriting face only for short annotations at 22 px and up, never for buttons, labels, status or figures | 14 px floor; 16 px inputs; 22 px handwriting | BD-01, BD-02, BD-03, BD-04, BD-05, VT-02, VT-03, VT-04, A11Y (text size rows), DC-08 note on serif for low vision |
| A5 | Text contrast | 4.5:1 normal; 3:1 at 24 px or 18.66 px bold; placeholders included | BD-17, BD-18, VT-28, A11Y (WCAG 1.4.3), IX-44 |
| A6 | Touch targets | 44 × 44 CSS px for every stand-alone control; inline text links exempt | BD-12, BD-13, BD-14, VT-30, IX-15, WCAG 2.5.5/2.5.8 |
| A7 | Every control and image has a name; pinch zoom never blocked | accessible name present; no `user-scalable=no` / `maximum-scale=1` | BD-24, BD-09, AU-33, A11Y (4.1.2, 1.1.1, 1.4.4) |
| A8 | One palette: the Raw Linen paper holds when the phone is in dark mode | body background = #F2ECE1 in both schemes; `color-scheme: only light` | BD-42, BD-43, UC (one look across states); owner decision D2 |
| A9 | At 130 % text the layout still holds | A1-A3 at 360 px with fonts × 1.3 | BD-09, A11Y (1.4.4, 1.4.12) |
| A10 | Every state renders; no page errors | each state reached; console clean | BD-45, BD-90, BD-92, AU-34 |
| A11 | Coverage comes from the code | every tab, sheet and view in src/v6/app.js has at least one state in the review | BD-93 |
| A12 | Each check catches a planted fault | `node test/ux/review.js --drill` plants one fault per rule and expects each to be caught | BD-91 |

## Part A, changes after Critic round 1
The Critic found what the first version of the review could not see: a figure running into the next tile, a Rescue answer landing
below the fold, chart labels at 10 px, and a 130 % simulation that compounded on nested text. The review now checks each of these
(rules text-overflow, feedback-hidden, chart text in text-too-small). After round 2 the drill plants every rule, 18 faults,
and matches each to its element by text, so a rule that stops working is caught even when another rule of the same name fires.

## Part B. Judged on the rendered screens (visual review, then the Critic)
| ID | Criterion | Sources |
|---|---|---|
| B1 | One first read per surface: on Plate, the plate and its grams lead; decoration follows | BD-29, BD-30, DC (hierarchy), AU-18 |
| B2 | Alignment: shared left edges and baselines; spacing in steps (4/8 px grid inside groups, 16-24 px between) | VT-13, VT-14, VT-16, UC (spacing values) |
| B3 | Legible at arm's length for 45+ readers: captions, numbers and hints readable without zoom; figures in the text face | BD-01, BD-02, BD-04, VT-04 |
| B4 | Few sizes per screen (4-5), two faces at most, one UI face | VT-06, VT-07, BD-10 |
| B5 | Controls look tappable; selected, disabled and pressed states visible; one primary action per state | BD-31, BD-32, BD-50, IX-16 |
| B6 | Loading, empty, error and blocked states say what is happening and what to do next, in plain words | BD-46, BD-47, BD-48, BD-56, BD-72, IX-36, IX-40, IX-41, AU-11, AU-19 |
| B7 | Plain English for these readers: sentence case, verbs first, no jargon, the owner's banned words absent | BD-65, BD-71, BD-73, IX-46, IX-48, UXW rows |
| B8 | Meaning never by colour alone: each nutrient colour sits next to its name | BD-20, A11Y (1.4.1) |
| B9 | One look across tabs, sheets and states (Raw Linen, revised plate) | BD-42, UC (finding-patterns, conventions) |
| B10 | Dark mode shows the same paper look | A8, BD-43 |
| B11 | AI output is marked and explained; the person can change or reject it | BD-59, AU-24 to AU-26 |
| B12 | Health data stays on the phone; what is sent to Google Gemini is stated where it is typed | AU-38, IX-31 |

## Part C. How the criteria are enforced
1. `test/ux/review.js` measures Part A on every state (exit 0 clean, 1 violations, 2 could not run = UNVERIFIED, BD-92).
2. Hook (`.claude/settings.json`): finishing work runs `ux-gate.sh`. It rebuilds both pages, fingerprints the state (`test/ux/manifest.sh`:
   pages, sources, the review itself, both films, the WhatsApp post), re-runs the review to zero, and requires a Critic PASS for that
   fingerprint in `test/ux/CRITIC.md`. Edits made any way (editor, shell, films) change the fingerprint. After three blocks on one state
   it lets the stop through with a message to the owner that the work is not resolved. A hook proves only that the steps ran (BD-94);
   who wrote CRITIC.md is shown by git history, not by the hook.
3. The Critic (`.claude/agents/ux-critic.md`) is independent of the builder: it re-runs the review, reads the screens for Part B and the
   diff for regressions, and writes VERDICT and BUILD (the fingerprint) to `test/ux/CRITIC.md`. Nothing reaches the owner without its PASS.
4. Still outside what code and the Critic can prove (BD-87, BD-94): the owner's own phone, and clients' comprehension. These stay listed
   as "Not inspected" in each verdict.

## Part D. Owner decisions where sources disagree
- D1 Look: the Raw Linen journal (cream paper, serif, clay) is the owner's chosen look (rule 10). BD-78 lists cream + serif + terracotta as a
  common default look of generated pages; the owner's decision stands, and B9 holds the look to consistency instead.
- D2 Dark mode: the app keeps its paper palette in dark mode (no second palette). Sources accept either one designed dark palette or a
  declared single scheme (VT-25, UC); a half-applied dark palette is what broke screens on phones in dark mode.
- D3 Serif for low vision (DC-08 advises sans): EB Garamond stays for the look, with larger sizes (body 17 px, floor 14 px, figures 22 px+) and
  darker ink to compensate; the handwriting face leaves all functional text (BD-04).
- D4 Targets 44 px (AA product target) rather than 48 px (AAA / Android native): 44 px with spacing is the doctrine's product target (BD-12).
