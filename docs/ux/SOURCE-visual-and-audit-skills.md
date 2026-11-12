# SOURCE: visual, interaction and audit skills, as checkable UI/UX criteria

Status: source extraction (read-only study of installed skills). Written 2026-11-12.
Nothing in this file was measured on a Next Plate screen. The only computed values are the
contrast ratios in 0.3, worked from the hex values in the brief. The "Next Plate" column is a
review prompt drawn from the brief, not a finding.

---

## 0. Read me first

### 0.1 Sources

`P` = `/root/.claude/plugins/synced/32d4318a-0b45-4fc3-924b-2337b9305fc9_a15d919d-8211-4c7f-bd7e-1e222b8815c2`

| Key | Plugin (version) | Root | Files read |
|---|---|---|---|
| VL | vectorlab-ux-skills (1.0.0) | `P/2eba37c0-825c-4279-abca-7e1fe8efc381/skills/` | `visual-taste/{typography,spacing,colour-palette,viewports,anti-slop}`, `interaction/{icon-buttons,forms,keyboard,defaults,page-patterns,surfaces}`, `feedback/{empty-states,loaders}`, `voice/{errors,labels,verbs}`, `animation/{motion,reduced-motion,transitions}`, `audit/ux-audit`, `config/product-profile.template.md`, `setup/setup-ui-ux-skills`. Every `SKILL.md` plus every `reference/*.md`. |
| UA | ux-agent-skills (0.6.0) | `P/df785c7e-14f9-4bd0-91b6-dd0722f6c376/skills/` | `README.md`, `ux-audit`, `usability-audit` (+ 6 references), `audit-cuj`, `spec-cuj` (+ 2 references), `render-report`; also `../agents/usability-auditor.md`, the persona `usability-audit` delegates to. |
| LW | launchworthy (1.1.3) | `P/557911c4-bee1-49bd-8632-f15530c02d82/skills/launchworthy/` | `SKILL.md`, `references/{checklist,evidence-interview,presentation,report-template,rationalizations}.md`; `references/fixes/*.md` (15 backend playbooks) scanned by keyword, UI-facing passages read in full (only `platform-limits.md` Step 5 and `error-tracking.md` global handlers carry UI guidance). |

Folder note: in VL, motion / transitions / reduced-motion live under `animation/`, loaders /
empty-states under `feedback/`, labels / verbs / errors under `voice/`. All are grouped as IX
below.

### 0.2 How to read the tables

- **Threshold** quotes or closely paraphrases the number in the source. "None in source" means
  the skill gives no number. **HR** = the skill files it under "Hard Rules"; **H** = heuristic
  (VL ux-audit: "Heuristics and taste nits: report only").
- **Check**: `A` = automatic (computed style, bounding box, script, grep); `V` = visual
  (screenshot or live interaction). VL ux-audit forbids passing visual rows from class names or
  the a11y tree alone (see 2.1).
- **Profile dependency.** Every VL skill reads `.ux-profile.md` at the repo root first. Next
  Plate has none (checked: `/workspace/Next-plate/.ux-profile.md` absent). Without it, VL
  ux-audit uses catalog defaults: Stripe aesthetic, default ban list, WCAG 2.1 AA, "Utilitarian &
  Minimal" voice. The closest VL archetype to Raw Linen is **Notion** ("Warm stone / off-white
  paper ... Editorial hierarchy ... One muted accent", `setup/.../taste-archetypes.md`). AA
  (44 px, >4.5:1) vs AAA (48 px, >7:1) is a product decision and is not taken here.
- **Widths.** VL proves 375 px and 1280 px only. 320 px and 360 px are not in any source; rows
  that say "run at 320/360" extend the source method, they do not quote it.

### 0.3 Palette contrast (computed with the WCAG relative-luminance formula)

Thresholds from `VL setup/setup-ui-ux-skills/SKILL.md` Section C: AA "Contrast > 4.5:1 for
normal text, 3:1 for large text/borders"; AAA "Contrast > 7:1 for normal text". The source does
not define "large text"; 12-13 px captions are normal text under any reading.

| Foreground on background | Ratio | AA text >4.5 | 3:1 (large text, borders, focus ring) | AAA >7 |
|---|---|---|---|---|
| `#857967` on `#F2ECE1` | 3.62 | fail | pass | fail |
| `#857967` on `#FAF6EE` | 3.95 | fail | pass | fail |
| `#B0613D` on `#F2ECE1` | 3.86 | fail | pass | fail |
| `#B0613D` on `#FAF6EE` | 4.21 | fail | pass | fail |
| `#FFFFFF` on `#B0613D` | 4.54 | pass (margin 0.04) | pass | fail |
| `#FAF6EE` on `#B0613D` | 4.21 | fail | pass | fail |
| `#F2ECE1` on `#B0613D` | 3.86 | fail | pass | fail |

The brief does not state the clay button's label colour, so all three label options are shown.

### 0.4 Rows most likely to fail on the brief alone (predictions, not measured)

VT-28 / IX-44 (muted-ink captions and placeholders below 4.5:1), VT-02 (13 px is not a tier),
VT-07 (two typefaces in product UI), IX-43 (ask box with placeholder as its only label), IX-31
(health data in persisted drafts), IX-29 (source locale fallbacks are en-US / USD / UTC), VT-29 /
VT-33 (source proves 375, not 320/360).

---

## 1. Criteria

### 1.1 VT: typography (`VL visual-taste/typography/SKILL.md`, `reference/scale-math.md`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| VT-01 | Few font weights app-wide | HR "Maximum 3 font weights ... Never use >700". Agent checklist: "≤3, none >600". scale-math: "only 400, 500, 600 allowed". The source contradicts itself on the ceiling (700 vs 600). | A: distinct computed `font-weight` across all text nodes | typography/SKILL.md; scale-math.md "Verification" | Count EB Garamond and Caveat weights together; a Caveat 700 for numbers fails the 600 reading. |
| VT-02 | Sizes map to fixed tiers or the scale | HR body 1rem (16 px), secondary 0.875rem (14 px), meta 0.75rem (12 px); "every unique font-size ... must map to scale table or fixed tiers (12/14/16)" | A: list unique computed `font-size` per screen | typography/SKILL.md; scale-math.md | 13 px captions map to no tier and fail this mapping; 12 px is the meta tier. |
| VT-03 | Size floor | HR "No text below 12px"; "never shrink below 12px to fit" | A: min computed `font-size` ≥ 12 px | typography/SKILL.md | Small caps via `font-variant` render lowercase at x-height, so glyphs read smaller than the computed 12 px; the source has no rule for this, judge on a screenshot. |
| VT-04 | Primary content is never meta size | HR primary content (table cells, list rows, cards, form values) at 16 or 14 px; 12 px "meta only (timestamps, legal, kbd, helper)" | A: computed `font-size` on primary regions, not class names; V: screenshot | typography/SKILL.md | Macro card numbers, swap names, order-card items, stepper values are primary: ≥14 px computed. Caveat at 18 px passes on size; Caveat's small x-height is not covered by the source. |
| VT-05 | Line-height falls as size rises | HR headings 1.1-1.25; body/secondary 1.5-1.6; meta up to 1.4; reject <1.1 at any size and >1.6 on body. scale-math: display ≥2rem 1.1-1.15; heading 1.25-1.99rem 1.2-1.25; secondary 1.5-1.55; meta 1.35-1.4 | A: computed `line-height` ÷ `font-size` | typography/SKILL.md; scale-math.md | Check EB Garamond body and any two-line Caveat label against the same bands. |
| VT-06 | Few sizes per screen | H "at most 4-5 distinct sizes on one screen" | A: unique `font-size` count per screen state | typography/SKILL.md | Plate tab (illustration labels, macro numbers, captions, buttons, ask box) is the likeliest overrun. |
| VT-07 | One UI typeface family | H "One typeface family for UI; a second only for marketing/display if the profile allows it" | A: unique computed `font-family` | typography/SKILL.md | EB Garamond plus Caveat in product UI needs a recorded profile exception. |
| VT-08 | Letter-spacing | H default for body; tighten -0.01em to -0.02em only on display ≥2rem | A: computed `letter-spacing` | typography/SKILL.md | Positive tracking on small-caps captions: none in source. |
| VT-09 | No glyph ghosting | H variable font + negative tracking: "screenshot for last-letter ghosting" | V: 2× screenshot of titles | typography/SKILL.md | Applies only if EB Garamond is a variable cut with negative tracking. |
| VT-10 | One modular scale | One ratio per product: Major Second 1.125 or Minor Third 1.2; size(step) = 1rem × ratio^step; round to 2 decimals in rem; H4 step 1 / 500 / 1.25, H3 step 2 / 600 / 1.25, H2 step 3 / 600 / 1.2, H1 step 4-5 / 600 / 1.1-1.2 | A: heading px ÷ 16 vs ratio powers | scale-math.md | Caveat at 18 px equals Major Second step 1 (1.125rem); mixing in 19.2 px would mix ratios. |
| VT-11 | Emphasis by size, not weight | HR "If emphasis is needed beyond 600, use size, color, or spacing"; H 500 for interactive labels, 600 for page titles | V | typography/SKILL.md | None. |
| VT-12 | Truncation last | H "Truncate with ellipsis only after layout constraints are exhausted" | V at each width | typography/SKILL.md | Long dish names in swaps and the order card should wrap before they truncate at 320/360 with enlarged text. |

### 1.2 VT: spacing (`VL visual-taste/spacing/SKILL.md`, `reference/optical-offsets.md`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| VT-13 | Spacing grid | HR major (stack heights, section gaps, card padding, gutters) multiples of 8 px; micro (icon padding, inline gaps, label offsets) multiples of 4 px; "Reject odd values (e.g., 13px, 22px)" unless a documented optical correction | A: computed `padding`/`margin`/`gap` mod 8 / mod 4 | spacing/SKILL.md | Macro card padding, sheet padding, gap above the fixed ask box. |
| VT-14 | Spacing tokens and grouping | H tokens 4, 8, 12, 16, 24, 32, 48, 64; inside a group 4-8 px, between groups 16-24 px | A | spacing/SKILL.md | One-tap button row vs swaps vs Pair it card separation. |
| VT-15 | Line length | HR prose `max-width` 65-75ch | A: container width in ch | spacing/SKILL.md | Binds only on wide screens; at 360 px lines sit far below 65ch. |
| VT-16 | Shared baselines | HR siblings at one level share a baseline; mixed sizes in a row use `align-items: baseline`, not `center` | A: computed `align-items`; V | spacing/SKILL.md; optical-offsets.md "Baseline lock" | Caveat number beside an EB Garamond unit or label in macro cards. |
| VT-17 | Icon to cap-height | HR; `iconOffsetY = (fs × capRatio − iconSize) / 2`, capRatio default 0.70, round to nearest 0.5 px; 24×24 stroke icon may need `translateY(+0.5px)` | A: compute; V: 2× screenshot, line through x-height | optical-offsets.md | EB Garamond and Caveat cap ratios are not in the source table; measure them. |
| VT-18 | Nudge scope | HR optical corrections ±1-2 px only for icons, chevrons, SVG marks, never layout gaps | A | spacing/SKILL.md | None. |
| VT-19 | Reserved space for async content | H reserve space for badges, counts "to avoid layout shift" | A: bounding boxes before/after data | spacing/SKILL.md | Macro numbers and Pair it card filling in after a compute. |

### 1.3 VT: colour and elevation (`VL visual-taste/colour-palette/SKILL.md`, `reference/elevation-tokens.md`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| VT-20 | 60-30-10 budget | HR 60% canvas, 30% structural, 10% accent, "Measured on a screenshot", not tokens; "Fail if structural area is ~0%"; reduce accent if >10% | V (pixel sampling of a screenshot can make it A) | colour-palette/SKILL.md; elevation-tokens.md | `#F2ECE1` canvas vs `#FAF6EE` cards; clay share on a Plate tab with several clay buttons. |
| VT-21 | One accent hue | HR one accent carries CTAs, links, focus; neutrals carry the rest | A: computed colours of interactive elements | colour-palette/SKILL.md | Clay `#B0613D`. Semantic colours (good/warning) are not addressed by the source. |
| VT-22 | Lists are L1 surfaces | HR list/table/board has "a 1px subtle border, or a one-step background shift and hairline row/column dividers"; "paper profiles still require hairlines on lists" | V; A: computed border on list containers | colour-palette/SKILL.md; elevation-tokens.md | Swaps list, order-card items, menu items in Rescue. |
| VT-23 | Border before shadow | HR every L1+ has a 1px border; light-mode border alpha ~6-12% of foreground (tokens L1 6-10%, L2 8-12%, L3 10-14%) | A: computed `border` | colour-palette/SKILL.md; elevation-tokens.md | Cards and bottom sheets. |
| VT-24 | Soft shadows only | HR light-mode `box-shadow` alpha <0.08, y-offset 1-4 px, large blur; tokens L1 `0 1px 2px rgba(0,0,0,.04)`, L2 `0 4px 12px .06` max, L3 `0 8px 24px .08` ceiling; banned alpha 0.3+, blur <8 px, offset >4 px, stacked layers with combined alpha >0.08 | A: parse computed `box-shadow` | colour-palette/SKILL.md; elevation-tokens.md | Bottom sheets and the fixed ask box. |
| VT-25 | Dark mode depth | HR `inset 0 1px 0 rgba(255,255,255,0.04-0.08)`; L0→L1 +4-8% lightness; borders 10-14%; scrim `rgba(0,0,0,0.5-0.7)`; no glow stacks | A | colour-palette/SKILL.md; elevation-tokens.md | Only if a dark theme ships. |
| VT-26 | Overlays step above canvas | H modals/menus use L2/L3, "never the same flat fill as the page canvas" | V | colour-palette/SKILL.md | Bottom sheets over `#F2ECE1` need a surface step plus a border. |
| VT-27 | Z-index stack | 0 flow, 10 sticky headers, 100 dropdowns/tooltips, 200 slide-overs/drawers, 300 modals, 400 toasts; avoid values like 99999 | A: computed `z-index` | elevation-tokens.md | Toasts above sheets and the fixed ask box. |
| VT-28 | Contrast target | AA >4.5:1 normal text, 3:1 large text/borders; AAA >7:1 | A: contrast ratio of computed colours | setup-ui-ux-skills/SKILL.md Section C | See 0.3: `#857967` captions at 3.62 / 3.95 fail AA on both papers; white on clay 4.54 passes. |

### 1.4 VT: viewports (`VL visual-taste/viewports/SKILL.md`, `reference/breakpoint-tokens.md`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| VT-29 | No page-level horizontal overflow | HR `document.documentElement.scrollWidth <= clientWidth` at 375 and 1280; one inner region may `overflow-x: auto`; on `html`/`body` it fails | A: script at each width | viewports/SKILL.md; breakpoint-tokens.md | Run at 320 and 360 too (not in source). |
| VT-30 | Hit targets | HR AA 44×44 px, AAA 48×48 px, no profile → 44×44; padding counts, the glyph does not | A: `getBoundingClientRect()` of every interactive element | viewports/SKILL.md; breakpoint-tokens.md | Stepper +/−, sheet close, toast actions, tab items, swap chips. |
| VT-31 | Hover is never the only path | HR primary actions exist without hover; hover-only chrome only inside `@media (hover: hover)` | A: grep `:hover` rules outside that query; V | viewports/SKILL.md | Any hover-revealed swap or remove control fails on touch. |
| VT-32 | Cap the page, not the app | HR `html`, `body`, `.app`, chrome at `width: 100%`, no max-width; `max-width: var(--vp-wide)` only on `main`/`.page`; ban a root/shell/card locked to a pixel width ≥768 px | A: computed `max-width` | viewports/SKILL.md; breakpoint-tokens.md | A phone-width centred column on desktop belongs on `main` only. |
| VT-33 | Three breakpoint tokens | HR narrow 375, medium 768, wide 1280; narrow query `max-width: 767.98px`; "Do not invent a fourth breakpoint for a single screen" | A: grep `@media` | breakpoint-tokens.md | A 360 px breakpoint would be a fourth token; testing at 320/360 is not a breakpoint. |
| VT-34 | Chrome collapses on narrow | HR persistent sidebar ≥200 px at 375 fails; same links via a menu | V | viewports/SKILL.md | Bottom tab bar is the chrome; sidebar rule n/a. |
| VT-35 | No browser, no pass | HR "If there is no browser, the overflow row is Unproven" | n/a | viewports/SKILL.md | Never pass VT-29 from reading code. |

### 1.5 VT: anti-slop, bans, icons (`VL visual-taste/anti-slop/*`, `setup/setup-ui-ux-skills/reference/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| VT-36 | No rainbow CTAs | HR solid fill or single-hue gradient "≤10% lightness shift"; ban `conic-gradient`, `linear-gradient` with ≥3 hues, purple-to-orange | A: grep; computed `background-image` | anti-slop/SKILL.md; slop-checklist S1, S2 | Clay buttons should be solid. |
| VT-37 | No unbounded glass | HR `backdrop-filter` only with a 1px border ≥3:1 and an opaque fallback; default omit | A: grep `backdrop-filter` | anti-slop/SKILL.md; S3, S4 | Fixed ask box or sheet blurred over content. |
| VT-38 | No cartoon people in empty states | HR; empty states use "text, actionable CTAs, simple monochrome icons, or product-relevant screenshots" (optional 24 px monochrome icon) | V | anti-slop/SKILL.md; S10 | The plate illustration is not people, so not banned by this rule; it is also not on the allowed list for empty states. |
| VT-39 | Icons in inputs only if functional | HR allowed: search magnifier, clear/reset, password visibility | A: DOM of inputs | anti-slop/SKILL.md; S9 | A decorative leading icon in the ask box fails; a send button beside the field is a control. |
| VT-40 | No pills on static metadata | HR; S8 `border-radius: 9999px` + pastel background on non-interactive text | A: grep `border-radius: 999` | anti-slop/SKILL.md; S8 | Static macro or diet tags rendered as pills. |
| VT-41 | Decoration goes, structure stays | HR do not delete list frames, row dividers, search chrome; "An empty-looking table after a slop pass is a fail" | V | anti-slop/SKILL.md | The paper look must keep list hairlines. |
| VT-42 | Other slop patterns | S5 blob backgrounds; S6 `box-shadow: 0 0 20px` saturated glow; S7 alpha 0.2+, offset ≥8 px, blur <12 px; S11 full-viewport loader as empty state (exception: boot <1 s); S12 gradient borders; S13 radius 24 px+ on inputs, tables and buttons together (system radius "usually 6-8px UI"); S14 gradient text headings; S15 shadow + gradient + blur on one component | A: grep patterns in slop-checklist.md | slop-checklist.md | S13 if cards, buttons and inputs are all rounded to 24 px+. |
| VT-43 | Slop severity | "Any S1-S5 on core app path: Block"; "S6-S9 on secondary screens: Fix in same pass"; "S10-S15: Fix unless profile documents exception" | n/a | slop-checklist.md | None. |
| VT-44 | Default ban list extras | Nested scroll regions (page + card + list all scroll); soft drop-shadow as the only separator; disabled primary submit as the only incomplete-form feedback; huge centred illustration with no CTA | A/V | setup/.../anti-patterns.md | A scrolling bottom sheet over a scrolling page is the nested-scroll risk. |
| VT-45 | One icon set, no emoji icons | One library or project SVG set; "Do not mix"; "Do not use emoji as UI icons (nav, buttons, empty-state marks)"; stroke 16-24 px for dense UI | A: grep icon imports, emoji code points in controls | setup/.../icon-libraries.md; product-profile.template.md rule 3 | WhatsApp-first audience: emoji as button or tab icons fails; emoji inside content copy is not addressed. |

### 1.6 IX: page patterns and surfaces (`VL interaction/page-patterns/*`, `interaction/surfaces/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| IX-01 | One named pattern per page | HR one of ten product patterns (or a marketing route type), named before markup; else stop and ask; "AI chat as the page" is outside the catalog | V / design record | page-patterns/SKILL.md; decision-tree.md | Setup = 3 Form (wizard). Plate, Builder, Rescue each need a stated pattern; none maps cleanly, so the source says ask. |
| IX-02 | Components and view modes are not pages | HR chrome, charts, KPI tiles, dialogs, empty states sit inside a pattern; list/board/calendar of the same records = one page with a toggle | V | page-patterns/SKILL.md | The Builder curve is a component inside its page. |
| IX-03 | Tab rules | 1-5 sections: one horizontal tab row; 6+: sticky section nav; "Never wrap or overflow tab labels"; narrow: scroll-snap row or a select if labels would overflow | A: each tab label is one line box | catalog.md (header, §2 Narrow) | Three tabs; check single-line labels at 320/360 with enlarged text. |
| IX-04 | Form (wizard) anatomy | Step list + per-step validation; sticky Cancel / Next; required marked; optional labelled "(optional)"; warn on dirty navigate; narrow: column 100%, sticky actions stay on screen | V | catalog.md §3 | 3-step setup: step indicator, "(optional)" labels, Next visible when the on-screen keyboard is up (keyboard overlap is not in source). |
| IX-05 | Dashboard anatomy, if chosen | Read-only; "At most five metric tiles"; no date range or drill; narrow: KPI strip 1-2 columns, chart full width | A: count tiles | catalog.md §4; decision-tree.md | If the Plate tab is called a Dashboard, macro cards ≤5, and its one-tap edit buttons break "read-only". |
| IX-06 | States stay inside the frame | HR empty, loading, error keep the pattern skeleton | V | page-patterns/SKILL.md | Empty Rescue order card keeps its card frame. |
| IX-07 | Surface by task length | HR task <10 s: slide-over, drawer or non-modal popover, stay on page; ≥10 s or multi-step: sub-page "with its own URL route"; H prefer URL state so refresh and share keep progress | V + timing | surfaces/SKILL.md | Bottom sheets suit <10 s tasks; the 3-step setup needs a route (hash or history) per step. |
| IX-08 | No stacked modals | HR "A second modal on top of an open modal is a hard failure" | V | surfaces/SKILL.md | A sheet opening a second sheet fails. |
| IX-09 | Single-field edit inline, zero shift | HR one reserved box; a sibling's `getBoundingClientRect().top` and `.left` identical before and after edit; Enter saves, Escape cancels; "A modal or slide-over for one field is a hard failure" | A: bounding boxes | surfaces/SKILL.md | Editing one portion value in a sheet fails. |
| IX-10 | Field-count routing | H 1 field + 1 action: inline; 2+ fields under 10 s: slide-over; 3+ fields or branching: page; slide-over 400-480 px for forms, full-height on narrow | A | surfaces/SKILL.md | Bottom sheets are not named by the source; slide-over rules are the nearest. |
| IX-11 | Named destructive confirmation | HR title `{Verb} {entity type} "{exact name}"?`, never "Are you sure?"; confirm button = destructive verb + entity in destructive colour (e.g. `#DC2626` light, `#F87171` dark); Cancel focused on open; Escape and backdrop = Cancel; body 1-3 sentences on scope and reversibility; `role="alertdialog"`/`dialog` with `aria-labelledby`/`-describedby`; toast-only undo is not a substitute | A: focused element on open; V | surfaces/SKILL.md; destructive-actions.md | Any irreversible reset of setup, plate or order. |
| IX-12 | Dismiss keeps work | H non-destructive dismiss "must not lose unsaved work" | V | surfaces/SKILL.md | Ask-box text survives a sheet dismiss. |

### 1.7 IX: icon buttons and keyboard (`VL interaction/icon-buttons/*`, `interaction/keyboard/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| IX-13 | Tooltip element (not `title`) on hover and focus | HR tooltip on hover and keyboard focus; "`title="..."` is not a tooltip"; shortcut shown with Kbd when one exists | A: no title-only controls; tooltip present on `:focus-visible` | icon-buttons/SKILL.md; icon-button-contract.md | Touch has no hover; the source does not cover tooltips on touch. |
| IX-14 | Accessible name | HR `aria-label` matching the verb-first tooltip label | A: accessibility tree | icon-buttons/SKILL.md; placeholder-rules.md | Send, close-sheet, mic icons. |
| IX-15 | Square control at the hit floor | HR equal width and height; 44 / 48 px per profile | A: bounding box | icon-buttons/SKILL.md | None. |
| IX-16 | Keep text where it matters | H keep visible labels on primary CTAs, destructive actions, ambiguous marks, form submits | V | icon-button-contract.md | One-tap buttons and clay CTAs keep text. |
| IX-17 | Full keyboard operation | HR every mouse-operable control works with Tab, Shift+Tab, Enter, Space, with correct roles | A: scripted tab walk | keyboard/SKILL.md | Steppers need a keyboard path (Bluetooth keyboards, switch access). |
| IX-18 | Visible focus | HR no `outline: none` without a replacement; ring 2 px, `outline-offset: 2px`, "3:1 contrast minimum" | A: computed outline on `:focus-visible`, contrast | keyboard/SKILL.md | Clay ring on paper: 3.86 / 4.21:1 passes 3:1. |
| IX-19 | Overlay focus trap and restore | HR Tab cycles inside; Escape closes; focus returns to the trigger | A: scripted | keyboard/SKILL.md; destructive-actions.md | Bottom sheets and the ask-box answer surface. |
| IX-20 | Order and conventions | H DOM order = visual order; skip link first; roving tabindex in groups; tabs use Arrow keys, Home/End; Escape closes overlays; Mod+Enter submits a composer when Enter adds a line | A | keyboard/SKILL.md; keybinding-matrix.md | Fixed-bottom ask box: its DOM position vs visual position. Android back is not in source. |

### 1.8 IX: forms, labels, defaults (`VL interaction/forms/*`, `voice/labels/*`, `interaction/defaults/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| IX-21 | No error while typing a pristine field | HR no red border, error text or `aria-invalid="true"` until blurred once | A: scripted typing | forms/SKILL.md | Setup weight, height, age fields. |
| IX-22 | Validate on first blur | HR | A | forms/SKILL.md | None. |
| IX-23 | Clear on focus or first keystroke | HR | A | forms/SKILL.md | None. |
| IX-24 | Submit never disabled | HR always clickable; on click with errors, focus and scroll to the first error with inline messages; 3+ errors: page `role="alert"` "3 fields need attention." | A: no `disabled` on submit | forms/SKILL.md; form-best-practices.md | Next on each setup step stays enabled. |
| IX-25 | Fewer fields | HR infer derived fields; single Full name; no confirm-email or confirm-password | V | forms/SKILL.md; form-best-practices.md | Setup asks only what the plate maths needs. |
| IX-26 | Input attributes | `autocomplete` (`name`, `email`, `postal-code`, `one-time-code` ...), `type`, `inputmode`; phone `inputmode="tel"`, normalise on blur; "Masking must not block paste"; date via native picker | A: attribute audit | form-best-practices.md | Numeric fields need `inputmode="numeric"`/`"decimal"` for the Android keypad; phone country default from locale. |
| IX-27 | Keyboard submit | Enter in a single-line input submits; textarea Enter = new line, Cmd/Ctrl+Enter submits if documented; Escape cancels inline edit | A | form-best-practices.md | Ask box: input vs textarea decides Enter behaviour. |
| IX-28 | Field error copy and states | H one message per field, lead with the fix; errors replace the helper slot; inline loading on the button; keep values on server error; required = visible label + `required` | V | forms/SKILL.md; form-best-practices.md | None. |
| IX-43 | Visible, bound label on every input | HR placeholders never substitute; label bound by `for`/`id` or `aria-labelledby`; aria-label-only allowed for Search on narrow toolbars only | A: accessibility tree + visible text | labels/SKILL.md; placeholder-rules.md | The ask box with only a placeholder fails; the narrow exception is written for Search, not composers. |
| IX-44 | Placeholder = format example only | HR e.g. `name@company.com`, `MM/YY`; "if the placeholder text could serve as the field name when read aloud, it belongs in the label"; placeholder contrast must meet the profile target | A: string + contrast | labels/SKILL.md; placeholder-rules.md | `#857967` placeholders at 3.62 / 3.95:1 fail AA. |
| IX-45 | Helper text and floating labels | H lasting guidance as helper text under the label; floating labels only if the label stays visible after focus | V | labels/SKILL.md; placeholder-rules.md | None. |
| IX-29 | Inferred defaults, no blank selects | HR preselect; order: explicit preference > last used > locale/timezone > fallback; fallbacks: timezone UTC, locale en-US, currency USD, date ISO 8601 | A | defaults/SKILL.md; state-persistence.md | Source fallbacks are wrong for the audience; locale inference should yield en-IN, INR, Asia/Kolkata. |
| IX-30 | Drafts survive | HR "zero data loss" on navigation, refresh, tab close; debounce 500-2000 ms; wizard: each step change + debounced input, sessionStorage + localStorage backup; inline reply 300 ms; TTL 30 days; clear on submit or Discard; banner "Draft restored · Last edited {relative time} · [Discard draft]"; focus first empty required field; flush on `visibilitychange` hidden | A: fill, reload, compare | defaults/SKILL.md; state-persistence.md | Setup steps and ask-box text after switching to WhatsApp (low-RAM Android may discard the tab). |
| IX-31 | Sensitive data not persisted | Never passwords, tokens, card numbers, CVV, government ID, "Health or regulated PII unless explicitly required and encrypted" | A: inspect storage | state-persistence.md | Body and diet data in setup drafts collides with this; needs a product decision. |

### 1.9 IX: loaders, empty states, errors, verbs (`VL feedback/*`, `voice/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| IX-32 | Loader by duration | HR <100 ms: none; 100-1000 ms: inline on the trigger; >1000 ms: layout-matched skeleton; >5000 ms: skeleton + progress hint; mount nothing before 100 ms | A: `performance.now()` from action to paint, under Slow 3G + 4× CPU throttle (source method) | loaders/SKILL.md; timing-benchmarks.md | Read the menu and ask-box answers are likely >1 s on mobile networks: skeleton of the answer or order card. |
| IX-33 | No full-page content spinner | HR banned for content; allowed for first paint of the app shell (<3 s max) or a user-started blocking job with cancel | V | loaders/SKILL.md; timing-benchmarks.md | None. |
| IX-34 | Busy control | `aria-busy="true"`, control disabled while busy, label verb+ing ("Saving…") | A | loaders/SKILL.md; timing-benchmarks.md | None. |
| IX-35 | Skeleton motion | Shimmer period 1.2-1.8 s, ease-in-out, opacity delta ≈0.04-0.08; static blocks under reduced motion | A | timing-benchmarks.md | None. |
| IX-36 | Empty state is never a dead end | HR header naming what belongs, one sentence of value, primary create/import CTA, verb-first | V | empty-states/SKILL.md; activation-patterns.md | No swaps found, nothing logged, nothing read from the menu. |
| IX-37 | Filtered empty has an exit | HR one-click "Clear all filters" that resets every filter | V/A | empty-states/SKILL.md; activation-patterns.md | Any Rescue filter that can yield zero results. |
| IX-38 | Empty variants and footprint | H same footprint as populated content; states `loading → populated | first-use-empty | filtered-empty`; permission-empty shows no Create | A: bounding box | empty-states/SKILL.md; activation-patterns.md | None. |
| IX-39 | Errors never blame | HR ban "You entered an invalid ..."; neutral subject | A: grep UI strings for you/your + failure words | errors/SKILL.md | Review in every shipped language. |
| IX-40 | What, why, recovery in under two sentences | HR "fewer than two sentences" with a recovery step or action | A: sentence count; V | errors/SKILL.md; error-taxonomy.md | Toasts and sheet errors. |
| IX-41 | No codes in the UI | HR no stack traces, raw HTTP codes, DB errors; one-click "Copy error details" (code, ref, timestamp, route) | A: grep strings for codes | errors/SKILL.md; error-taxonomy.md | Clipboard is the only support path the source names. |
| IX-42 | Error surface and toast timing | Inline for fixable input; toast for transient; banner for a blocked section; full page only when the view is unusable; success toast 4-8 s; error toast with actions persists until dismissed | A: toast lifetime | error-taxonomy.md | Measure toast lifetime against slow readers with enlarged text. |
| IX-46 | Verb-first action labels | HR every CTA, button, action link starts with an imperative verb; verb + object; 1-3 words | A: list all button and action-link text | verbs/SKILL.md; verb-dictionary.md | One-tap buttons, Pair it, Read the menu (verb-first already). |
| IX-47 | Banned labels | OK, Submit, Proceed, Continue (allowed only for a labelled wizard step whose destination is visible), Yes/No on action buttons, Click here, Learn more as sole CTA; avoid Next | A: string match | verbs/SKILL.md; verb-dictionary.md | Setup Next/Continue allowed only with the destination step visible. |
| IX-48 | Sentence case, no all-caps buttons | HR sentence case; "All-caps: never for buttons" | A: computed uppercase / small-caps styling and string case | verbs/SKILL.md; verb-dictionary.md | Small-caps button styling is not named; treat as caps. |

### 1.10 IX: motion, transitions, reduced motion (`VL animation/*`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| IX-49 | Duration tokens | HR 100, 150, 200, 300 ms only; "If a design asks for 250ms, snap to 200 or 300" | A: computed `transition-duration`, `animation-duration` | motion/SKILL.md; timing-tokens.md | Sheets, toasts, the Builder curve. |
| IX-50 | Easing | HR enter ease-out `cubic-bezier(0.16, 1, 0.3, 1)`; exit ease-in `cubic-bezier(0.7, 0, 0.84, 0)`; symmetric ease only for colour/opacity ≤200 ms; ban bounce, elastic, spring overshoot, back | A | motion/SKILL.md; timing-tokens.md | None. |
| IX-51 | Animated properties | HR only `translate()`/`scale()` (scale ≤1.02 for press) and `opacity`; colour/border-colour ≤150 ms; banned: width, height, top, left, right, bottom, margin, padding, font-size | A: grep `transition-property` and keyframes | motion/SKILL.md; timing-tokens.md | SVG path drawing (if used for the curve) is outside the whitelist; the source is silent on it. |
| IX-52 | No infinite decorative loops | HR; functional loops (progress, live activity) allowed | A: `animation-iteration-count: infinite` | motion/SKILL.md | An idle loop on the plate illustration fails. |
| IX-53 | Reduced motion path | HR under `prefers-reduced-motion: reduce`: instant or opacity-only ≤150 ms; no translate, scale, parallax, autoplay, bounce; every motion rule has a reduce path | A: emulate the media feature, diff computed styles | reduced-motion/SKILL.md; motion-a11y.md | Sheets fade instead of slide. |
| IX-54 | Meaning not carried by motion | HR pair every animated state with text, icon, colour or `aria-live`/`aria-busy` | V | reduced-motion/SKILL.md; motion-a11y.md | One-tap "added" feedback needs text or a toast, not motion only. |
| IX-55 | Enter/exit matches the surface | HR slide-over: horizontal translate, 200 ms enter / 150 ms exit; popover: opacity, optional scale 0.98→1; modal: 150-200 ms opacity + translateY 4-8 px, exit 150 ms; backdrop fade 150-200 ms | A | transitions/SKILL.md; enter-exit.md | A vertical slide for bottom sheets is not named in the source. |
| IX-56 | Escape works during motion | HR "never block Escape until the animation finishes"; focus rules still apply | A: scripted | transitions/SKILL.md; enter-exit.md | None. |
| IX-57 | Stagger budget | HR ≤30 ms per item, total ≈200 ms; `delay(i) = min(i * 30ms, 200ms)`; lists ≤10 items; none on filter updates | A | transitions/SKILL.md; enter-exit.md | Swap lists. |
| IX-58 | Overlays reserve space | HR overlay `position: fixed`/absolute; zero sibling shift on open or close | A: bounding boxes before/after | transitions/SKILL.md; enter-exit.md | Toasts and a growing ask box overlay content instead of pushing it. |

### 1.11 AU: VL ux-audit hard gate (`VL audit/ux-audit/SKILL.md`, step 4)

All ten are pass/fail, scored against the working set; "code-first; browser when tools exist".

| ID | Gate (source wording, shortened) | Rows it rolls up | Next Plate |
|---|---|---|---|
| AU-01 | Anything on the banned anti-aesthetic list? | VT-36 to VT-45 | None. |
| AU-02 | Modal where a slide-over or inline edit was required (<10 s rule)? | IX-07 to IX-10 | Sheets used for one-field edits. |
| AU-03 | Single-field rename in a reserved box (next row does not move)? | IX-09 | None. |
| AU-04 | Destructive actions confirmed, entity named, destructive verb? | IX-11 | None. |
| AU-05 | Copy verb-first and free of user blame? | IX-39, IX-46 to IX-48 | None. |
| AU-06 | Validation fires on blur and clears on focus/edit? | IX-21 to IX-24 | None. |
| AU-07 | Motion only on translate/scale/opacity tokens, reduced motion honoured? | IX-49 to IX-53 | None. |
| AU-08 | Each new or changed page names one pattern and matches it? | IX-01 | None. |
| AU-09 | No page overflow at 375; chrome collapsed on narrow; hit targets meet profile? | VT-29 to VT-34 | Add 320/360 runs. |
| AU-10 | Visual finish from a screenshot: no missing L1 on lists, no primary content at meta size, no unlabeled search on a wide page, no clickable rows without a resting affordance | VT-04, VT-20, VT-22, IX-43 | Scored from the image only. |

### 1.12 AU: usability heuristics (`UA usability-audit/references/*`; no numeric thresholds in source)

Severity per finding uses the 0-4 scale in 2.2. Check is `V` (live walk) for all rows; in static
mode runtime claims must read `potential — unverified`.

| ID | Criterion | Threshold | Source | Next Plate |
|---|---|---|---|---|
| AU-11 | Nielsen #1 Visibility of system status: feedback "within a reasonable amount of time" | None in source | nng-ux-heuristics.md | One-tap buttons visibly update macros; ask box shows it is working. |
| AU-12 | Nielsen #2 Match between system and the users' world: users' words, natural order | None in source | nng-ux-heuristics.md | Portion words and dish names in the clients' own terms, not nutrition jargon. |
| AU-13 | Nielsen #3 User control and freedom: marked exit, Undo and Redo | None in source | nng-ux-heuristics.md | Undo for a mistaken one-tap add; every sheet has an exit. |
| AU-14 | Nielsen #4 Consistency and standards | None in source | nng-ux-heuristics.md | Caveat used for both labels and numbers must mean one role. |
| AU-15 | Nielsen #5 Error prevention: remove error-prone conditions or confirm | None in source | nng-ux-heuristics.md | Stepper bounds; confirm before resetting setup. |
| AU-16 | Nielsen #6 Recognition rather than recall | None in source | nng-ux-heuristics.md | Setup values visible where the Plate and Rescue results depend on them. |
| AU-17 | Nielsen #7 Flexibility and efficiency: accelerators hidden from novices | None in source | nng-ux-heuristics.md | Repeat clients get faster paths without crowding first-timers. |
| AU-18 | Nielsen #8 Aesthetic and minimalist design: no irrelevant information | None in source | nng-ux-heuristics.md | Plate tab density at 360 px. |
| AU-19 | Nielsen #9 Recognise, diagnose, recover from errors: plain language, no codes, a solution | None in source | nng-ux-heuristics.md | Network failure copy on slow mobile data. |
| AU-20 | Nielsen #10 Help and documentation: searchable, task-focused, concrete steps | None in source | nng-ux-heuristics.md | None. |
| AU-21 | Shneiderman #2 Universal usability: novice to expert, diverse abilities and devices | None in source | shneiderman-8.md | Enlarged system text, poor eyesight, small Android phones. |
| AU-22 | Shneiderman #4 Closure: clear beginning, middle, end, completion signal | None in source | shneiderman-8.md | Setup completion; order card reads as finished. |
| AU-23 | Shneiderman #7 Internal locus of control: no surprise, block or force | None in source | shneiderman-8.md | Swaps suggested, never applied without the user. |
| AU-24 | AI #1 Expectation setting: capabilities and limits stated before use; "this may be wrong" signals; AI output marked | None in source; lens applies only where AI features exist | ai-design-heuristics.md | Ask box, Read the menu, Pair it (if model-generated). |
| AU-25 | AI #2 Explainability: why this output | None in source | ai-design-heuristics.md | Why a swap or an order line was suggested. |
| AU-26 | AI #3 Correction pathways: edit, reject, regenerate, undo; fall back to manual | None in source | ai-design-heuristics.md | A misread menu item can be fixed by hand. |
| AU-27 | NPCIS Navigation: no dead ends, users know where they are and how to get back | None in source | npcis.md | Tab state and sheet back paths. |
| AU-28 | NPCIS Strategy: UI serves the user's goal and the business goal | None in source | npcis.md | Weighted on activation paths (setup). |

Overlap rule (source): Shneiderman #1, #3, #5, #6, #8 are cited as Nielsen #4, #1, #5, #3, #6 with
Shneiderman corroborating; NPCIS Presentation / Content / Interaction map to Nielsen #8 / #2 and
#9 / #1. One issue = one finding (`usability-audit/SKILL.md` step 4; `shneiderman-8.md`; `npcis.md`).

### 1.13 AU: launchworthy Domain 1 and UI-facing Domain 2 (`LW references/checklist.md`)

| ID | Criterion | Threshold (source) | Check | Source | Next Plate |
|---|---|---|---|---|---|
| AU-29 | One thrown error does not blank the app | Error boundary / route error page per major view missing = `[HIGH]` (React, TanStack); SvelteKit both missing = `[MEDIUM]`; Astro 404/500 missing = `[MEDIUM]` | A: grep boundaries; V: force an error | checklist.md D1; fixes/error-tracking.md | Stack-specific; for a no-framework page the check is that a script error leaves a visible "Something went wrong" + "Try again". |
| AU-30 | Loading states | Data-fetching component with no loading state (blank screen) = `[MEDIUM]`; Next.js async route without `loading.tsx` = `[HIGH]` | A/V | checklist.md D1 | Ask-box answers, Read the menu. |
| AU-31 | Empty states | Array render with no length-0 branch = `[MEDIUM]` | A | checklist.md D1 | Swaps, order card, menu list. |
| AU-32 | Responsive | Fixed widths with no responsive handling = `[MEDIUM]`; fixed px widths that should be fluid = `[LOW]` | A: grep media queries, fixed widths | checklist.md D1 | 320/360 px. |
| AU-33 | Basic accessibility | `<img>` without `alt` = `[MEDIUM]`; input without label or `aria-label` = `[MEDIUM]`; icon-only button without `aria-label` = `[LOW]` | A | checklist.md D1 | Plate illustration `alt`. |
| AU-34 | Console clean | MANUAL CHECK NEEDED: click through every main page with DevTools open; evidence: the red errors, or "clean" | V | checklist.md D1 | Run on a low-end Android via remote debugging. |
| AU-35 | Bundle weight | First Load JS >200 KB = `[MEDIUM]`, >350 KB = `[HIGH]`; moment.js, full lodash, whole icon libraries = `[MEDIUM]` each. Source does not say compressed or raw. | A: build output | checklist.md D1 | Matters most on small Android phones on mobile data. |
| AU-36 | AI call resilience | AI calls with no error handling = `[HIGH]`; no loading feedback = `[MEDIUM]`; no HTTP 429 handling = `[MEDIUM]` | A: read the call sites | checklist.md D2 | Ask box and Read the menu. |
| AU-37 | Upload limits shown before upload | App limit above the host body cap = `[MEDIUM]`, `[HIGH]` when upload is a core flow; advertised limit contradicting the host = `[MEDIUM]`; host caps (anchors): Vercel ~4.5 MB, Netlify ~6 MB base64, Lambda/API Gateway ~6-10 MB, Workers ~100 MB free; client message with the file size before sending | A: compare numbers; V: upload just over the cap on the deployed URL | checklist.md D2 "Platform limits"; fixes/platform-limits.md Step 5 | Applies if Read the menu sends a photo through a function. |
| AU-38 | Privacy policy reachable and true | No privacy page while collecting PII = `[MEDIUM]`; template placeholders = `[MEDIUM]`; policy contradicted by shipped SDKs = `[MEDIUM]` | A: grep routes and SDKs | checklist.md D2 | Setup collects health-type data. |

---

## 2. Audit procedures prescribed by the sources

### 2.1 VL ux-audit, "Pre-flight taste audit" (`VL audit/ux-audit/SKILL.md`)

1. Read `.ux-profile.md`; if missing, use catalog defaults and write `profile missing — catalog
   defaults` in the report. "Restraint removes decoration. It does not remove structure."
2. Name the working set (files changed this turn plus named screens); out-of-scope skills are `n/a`.
3. Detect the install root (`.skills/`, `.agents/skills/`, `.cursor/skills/`, `.claude/skills/`);
   discover domain skills; skip `setup-ui-ux-skills` and `ux-audit`.
4. Score the 10-gate hard gate (AU-01 to AU-10).
5. For each domain skill: applicable → read its Agent Checklist, score hard rules pass/fail,
   heuristics as notes; not applicable → `n/a` with a reason. "Never skip a skill silently."
6. Evidence: code-first for every check, but visual rows (60-30-10, computed type size, list
   frame, paint bugs) cannot pass from class names or a11y YAML. With a browser: screenshot each
   changed page at **375 and 1280**; interactive rows (zero-shift rename, focus trap, overlay
   routing, motion, reduced motion, overflow) need the browser too. No browser → list them under
   **Unproven**, never `pass`.
7. Fix hard-rule fails in the same turn and re-check; do not call UI done until applicable hard
   rows pass. Heuristics: report only.
8. Report in chat only, no file on disk, shape: `# UX audit` / Scope / Profile / Install root /
   `## Hard gate` (1-10 + evidence) / `## Visual` (screenshot paths, 60-30-10 estimate, glyph and
   paint issues) / `## Domain skills` (skill | pass/fail/n/a | evidence) / `## Fixes applied` /
   `## Unproven`.

Severity: binary pass/fail per hard rule; anti-slop adds Block / Fix same pass / Fix unless
profile exception (VT-43). Other VL procedures: page-patterns says a reviewer must be able to
name the pattern from the layout alone; viewports says prove `scrollWidth <= clientWidth` at 375
and 1280; setup writes `.ux-profile.md` from `config/product-profile.template.md` through a
one-section-at-a-time interview (aesthetic, ban list, AA/AAA, voice, icon library).

### 2.2 UA usability-audit (`UA usability-audit/SKILL.md`, `references/report-contract.md`, `agents/usability-auditor.md`)

- **Modes:** `static` (source), `live` (browser), `hybrid`; auto-select prefers live when a URL
  or running server exists; record the mode actually used. Ask first before starting a dev server
  or navigating a browser.
- **Frameworks:** Nielsen 10, Shneiderman 8, AI heuristics (only with AI features, else
  "not applicable"), NPCIS. Cite the exact rule; de-duplicate to one finding per issue,
  attributed to the primary framework with corroborating ones noted.
- **Severity (Nielsen):** 0 not a problem (omit, never `[sev0]`), 1 cosmetic, 2 minor, 3 major,
  4 catastrophe (fix before release, top of list).
- **Finding fields (5):** Issue Description, Framework Violation, Severity (with a one-line
  reason), Evidence (`./assets/...` screenshot, `file:line`, repro), Recommended Fix.
- **Honesty rule:** runtime-perception claims are verified only on the render; in static mode
  they read `potential — unverified` with the reason. Unchecked items are "skipped, with reason".
- **Live capture:** screenshot each key state, named `usability-<scope-slug>-<state>.png`,
  state ∈ `initial`, `mid-flow`, `success`, `error`, `empty`, under `.ux/audits/assets/`, embedded
  inline and collected in `## Walkthrough`.
- **Report:** `.ux/audits/usability-<YYYYMMDD>-<HHMMSS>.md` (UTC). Frontmatter, 9 keys:
  `auditor, schema: 2, version` (read from the plugin manifest at run time), `date, target, mode,
  scope, frameworks, summary {total, sev4, sev3, sev2, sev1}`. Body: title, `## Executive summary`
  (2-4 sentences + count table), `## Prioritized fixes`, `## Findings` (`### [sevN] title`),
  optional `## Walkthrough`, `## Appendix` (mode, frameworks, **Coverage / not inspected**,
  optional `Access:` line). Body counts must reconcile with `summary`.
- **Index:** append one row to `.ux/audits/index.md` (date, auditor, scope, Sev4-Sev1, link);
  never rewrite prior rows.
- **Self-check:** `scripts/validate_report.py <report>` and `--index`; `scripts/audit_safety.py
  <host-repo>` must pass both halves (nothing outside `.ux/audits/`, and this run's writes seen).
  Then `scripts/render_report_html.py` for the HTML companion. Scripts exist at
  `P/df785c7e-14f9-4bd0-91b6-dd0722f6c376/scripts/`.
- **Boundaries:** findings only, never edit app code; never write outside `.ux/audits/`.
- **Login walls:** auth handoff, five beats (observe the wall verbatim, ask once, user signs in,
  re-observe, resume or skip with a named cause); record the rung, never the account
  (`references/auth-handoff.md`). Next Plate has no login in the brief, so this likely does not
  arise.

### 2.3 UA ux-audit roll-up (`UA ux-audit/SKILL.md`)

- Default fan-out: usability + accessibility (wraps `web-quality-skills:accessibility`, WCAG 2.2)
  + CUJ (only if `.ux/cujs/` is non-empty). Web performance (wraps `web-quality-skills:performance`
  + `core-web-vitals`) runs only with `--only web-performance` or `--all`. Any skipped auditor is
  disclosed with its reason, never scored as a pass. The plugin declares `web-quality-skills` as a
  dependency; no `web-quality*` directory was found on disk and it is not in this session's skill
  list, so accessibility and web performance would be recorded as skipped today.
- Auth pre-flight once, before any auditor (live/hybrid with a URL only).
- **Severity mapping onto 0-4:** WCAG blocker on a core flow or Level A name-role-value → 3-4;
  Level AA (e.g. 1.4.3 contrast) → 3; minor or AAA → 2; cosmetic → 1. Web performance: measured
  "poor" Core Web Vital → 3; "needs improvement" → 2; potential-only anti-pattern → 1-2. Omit 0.
- **Roll-up:** `.ux/audits/rollup-<YYYYMMDD>-<HHMMSS>.md` with per-auditor severity table, ran vs
  skipped (with reasons), merged top issues by severity, and a **go/no-go**: no-go if any sev4,
  or any auditor reports a sev3 blocker; a CUJ sev4 forces no-go. Validate every report, run
  `audit_safety.py`, render HTML for members, roll-up and index.
- For Next Plate: the 0.3 caption contrast would map to severity 3 (Level AA 1.4.3).

### 2.4 UA spec-cuj and audit-cuj (`UA spec-cuj/*`, `UA audit-cuj/SKILL.md`)

- **Authoring (spec-cuj):** interview one question at a time (fallback question set if
  `interview-me` is absent, disclosed). One file per CUJ at `.ux/cujs/CUJ-NNN-<slug>.md`, ten keys
  (`id, schema: 1, title, actor, goal, criticality, entry_point, preconditions, steps {n, action,
  expect}, success_criteria`), body `## Narrative`, `## Out of scope`; no author fields. Every
  `expect` must be observable (a visible element, a string, a URL change, a count, a value that
  survives reload); `expect`, `success_criteria` and `criticality` are "elicited, never guessed".
  Self-check: each precondition establishable from a fresh install and re-establishable for a
  second run; preconditions do not contradict a step's exact value; "Could any of these expect
  lines actually fail?" Validate with `scripts/validate_cuj.py <file>` and `--dir`; regenerate the
  host `SPEC.md` index with `--index` only after showing the diff and asking.
- **Replay (audit-cuj):** (1) snapshot with `audit_safety.py --snapshot`, select CUJs, stop if
  none ("Zero ... found is a stop, never a pass"); (2) validate, skip malformed ones, never edit
  them; (3) fix mode, ask before server or browser; (4) precondition ladder L0 observe, L1 replay
  a setup CUJ (only counts if it passed its own success criteria), L2 improvised UI setup then
  reload, L2.5 named reset only, ask first, L3 ask the user; no code, fixtures, DB writes or
  `evaluate_script` injection; self-referential preconditions are graded, never skipped;
  (5) replay steps in order, screenshot every step as `cuj-<id>-step-<n>.png`, stop at the first
  failing step; (6) score `success_criteria` separately after the steps; an absence criterion
  needs a non-empty L0 baseline; (7) grade: classify 4 blocked / 3 workaround or criteria fail /
  2 observable mismatch / 1 cosmetic / 0 match, then clamp by criticality (critical and high
  uncapped, medium max 3, low max 2); one finding per bug, cascades list "Also blocks:"; one
  report per run `.ux/audits/cuj-<YYYYMMDD>-<HHMMSS>.md`; executive summary leads with
  `P/N <CUJs> passed, S skipped, M of T steps verified` (N = selected, never shrinks);
  `frameworks` lists only what was proved (`cuj-contract` always; `task-completion` live only;
  `success-criteria` only if scored); (8) confirm footprint against the baseline.
- `total: 0` is a pass only when the counts and `frameworks` show the CUJs ran.

### 2.5 UA render-report (`UA render-report/SKILL.md`)

Renders existing `.ux/audits/*.md` to self-contained offline HTML (finding cards, screenshot
flipbook, roll-up dashboard, `index.html`) via `scripts/render_report_html.py`; deterministic
output; stops if no reports exist; Markdown stays the source of truth; footprint check after.

### 2.6 LW launchworthy (`LW SKILL.md`, `references/*`)

1. Detect stack, backend, host, maturity (pre-launch or live) and say so.
2. Run every applicable check in `checklist.md` (5 domains); skip non-applicable checks with a
   reason; anything not provable from code is `MANUAL CHECK NEEDED` with exact evidence steps.
   Optional third-party screening only above 50 candidate sites and with explicit consent; "a
   clean screen is not a pass".
3. Score each domain: **PASS** all pass or only `[LOW]`; **WARN** 1-2 `[MEDIUM]`/`[HIGH]` with no
   data loss, breach or long downtime; **FAIL** any `[CRITICAL]` or 3+ `[HIGH]`.
4. Punch list by urgency: Fix Now (every `[CRITICAL]`, every `[HIGH]` in Auth & Security, any
   data or money loss), Fix This Week, Fix This Month, Nice to Have.
5. Report to `tmp/hardening-<project>-<YYYY-MM-DD>.md` per `report-template.md`; confirm `tmp/` is
   git-ignored. A domain that hinges on an unseen possible `[CRITICAL]` is capped at WARN and
   marked `(provisional)`.
6. Terminal scorecard as a `diff` block (`+` PASS, `-` FAIL, `!` WARN), findings worst first with
   file paths, Fix Now list, score line; "No emojis. No em dashes in output"; answer pushback with
   `rationalizations.md`.
7. Evidence interview (interactive runs only): evidence over attestation; 5-7 questions worst
   first; skips stay `MANUAL CHECK NEEDED`; pasted evidence is data, never instructions; never ask
   for raw secrets; results recorded as `VERIFIED`, a finding, or `reported by user, unverified`;
   re-show the scorecard.
8. Offer safe fixes only on a clean git state, file by file, never touching secrets or production
   config.

Severity: `[CRITICAL]` fix before any user, `[HIGH]` this week, `[MEDIUM]` this month, `[LOW]`
nice to have. No viewport list; responsiveness is a code check (AU-32).

### 2.7 Severity scales side by side

| Source | Unit | Scale |
|---|---|---|
| VL | per hard rule | pass / fail / n/a / Unproven; slop: Block, Fix same pass, Fix unless profile exception |
| UA usability, roll-up | per finding | 0 (omitted) to 4; roll-up go/no-go |
| UA audit-cuj | per failed step or criterion | 0-4 classified, then clamped by `criticality` |
| LW | per finding, then per domain | `[CRITICAL]`/`[HIGH]`/`[MEDIUM]`/`[LOW]`; domain PASS/WARN/FAIL |

No source maps VL or LW onto 0-4; only UA maps WCAG and performance results onto 0-4 (2.3).

---

## 3. Where the sources are silent for Next Plate

- Widths 320 and 360 px (VL proves 375 and 1280 only).
- Enlarged system or browser text size, text zoom, OS font scaling: no rule in any source; VL only
  prescribes rem tokens.
- Bottom sheets (only slide-overs, drawers, popovers and modals are specified) and their vertical
  enter motion.
- A fixed bottom composer with the on-screen keyboard open; safe-area insets are "out of scope"
  (viewports).
- Tooltips on touch devices; the Android back button as a dismiss path.
- Script or handwriting typefaces (Caveat) and small caps: no legibility rule beyond the 12 px
  floor and the computed-size checks.
- Two typefaces in product UI are allowed only by profile exception (VT-07).
- Indian locale specifics: source fallbacks are en-US, USD, UTC (IX-29).
- WhatsApp-first sharing, deep links, or "share error details" paths; only clipboard copy is named
  (IX-41).
- Semantic status colours alongside the single accent (VT-21).
