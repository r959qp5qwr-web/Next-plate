# SOURCE: Builders' Doctrine — UX/UI criteria, gates, evidence and hook wiring

Extracted 2026-11-12, read-only, from `/workspace/builders-doctrine` at commit
`6dc016c485ec1ddf31163534d84e02e0f74772f0` (`VERSION.json`: version `1.1.0`, status `ACTIVE_PENDING_REPIN`).
Nothing in that repository was modified. All paths below are relative to that root.

## 0. Notation

**Authority tier** (tag at the start of each source reference):

| Tag | File(s) | Standing |
|---|---|---|
| [C] | `THE-BUILDERS-CANON-v1.0.md` | Preserved baseline authority (root `CLAUDE.md`) |
| [P] | `THE-BUILDERS-PLAYBOOK-v1.0.md` | Preserved baseline authority |
| [A] | `THE-AUDIT-PROTOCOL-v1.0.md` | Preserved baseline authority |
| [M] | `modules/ux-design-assurance/v1.1/` (written `M/` below) | Supporting machinery. `modules/README.md`: "Nothing in this directory may be cited as a law." Binding only through Canon › Design & UX, Playbook §5A, Audit §11 and a product's own `DOCTRINE_BINDING.json` |
| [G] | `builder/design/frontend-design.md` | Design guidance. `.claude/skills/builder-work/SKILL.md`: "It is guidance, not proof." `builder/INTEGRATIONS.md`: "an on-demand reference, not a second automatically loaded design skill" |
| [W] | `builder/`, `tests/`, `operating/`, `.claude/`, `.github/` | Workbench kit and synthetic fixture; precedent, not law |

**Check type:** AUTO = deterministic, can be ARMED; VISUAL = MANUAL/EXPERT judgment on rendered pixels; USER = observed target-user behaviour; DOC = an artifact must exist and declare the value.

**Word substitutions (by request).** "J" stands for the doctrine's term for a bounded end-to-end user route
(`M/01_UX_SYSTEM_CORE.md` §3 defines it as "A bounded end-to-end route from a legitimate starting condition to a
stable terminal condition"). "J Contract" is its per-route contract template. File names that contain a banned word
are written as globs that each resolve to one file: `M/templates/J*_CONTRACT.md`, `builder/J*.md`,
`builder/REFERENCE_J*.json`, `operating/verify_j*.py`. Headings that contain a banned word are cited by their number or ID.

**Quotes.** Text in quotation marks is verbatim; where the source is a bullet list, its items are joined with "; "; "…" marks an elision; markdown emphasis is dropped.

**Thresholds.** Numbers are quoted from the source. Where the source gives no number the entry says "no threshold in source".
Viewport sizes 390×844 and 1280×900 appear only in the workbench's synthetic fixture (`builder/INTERFACE.md`,
`tests/reference/browser.mjs`); the doctrine itself says "phone width" / "phone-sized".

---

## 1. Checkable criteria

### A. Typography and legibility

1. **BD-01** Body copy defaults around 16 CSS px.
   Check: AUTO — computed `font-size` of every body-role text node per surface and state; flag below 16 CSS px for review. Source wording is a default ("defaults around"), preceded by "Unless product/platform evidence requires different values".
   Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 — Interface foundation › Baseline product policies.

2. **BD-02** Supporting metadata not below 14 CSS px unless nonessential.
   Check: AUTO — computed size on metadata roles (macro sub-labels, units, timestamps, captions, order-card details); flag below 14 CSS px. VISUAL — decide "genuinely nonessential". Quote: "supporting metadata should generally not fall below 14 CSS px unless genuinely nonessential".
   Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Baseline product policies.

3. **BD-03** Functional type is never shrunk to make content fit.
   Check: AUTO — per text role, compare computed size across surfaces (Plate tab vs sheets vs Rescue order card); flag a role that renders smaller on a denser surface. VISUAL — confirm the order of resort was used instead: "remove → defer → group → summarize → reveal progressively → move deeper". Playbook: "Shrinking functional type to make everything fit is the defect, not the fix." No threshold in source.
   Source: [P] §5A (Stage 2A) › Density rule; [M] `M/01_UX_SYSTEM_CORE.md` › 13. Anti-newspaper principle; [M] `M/07_REFERENCE_COMPENDIUM.md` › 10 › P1 — Never buy density with illegibility; [M] `M/04_VERIFY_MODE.md` › V3 › Density; [M] `M/02_DESIGN_MODE.md` › D5 — Low-fidelity wireframe › Wireframe rules.

4. **BD-04** Handwritten/expressive type stays off functional text.
   Check: AUTO — computed `font-family` on buttons, links, tab/nav labels, form labels, inputs and placeholders, `role=status`/`role=alert` (toasts, errors), metadata, list rows and instructions; flag Caveat. VISUAL — remaining Caveat uses are limited to "wordmarks; campaign/display moments; short non-functional headings when legibility remains strong". Not by default for "body copy; navigation labels; buttons; form labels; metadata; error/status text; dense listings; instructions; accessibility-critical functional text". No threshold in source.
   Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Expressive typography rule. Example only (not universal law): [M] `M/07_REFERENCE_COMPENDIUM.md` › 12. My Neighborhood brand translation example.

5. **BD-05** The functional vs display typeface boundary is declared, and expressive type is not used in dense functional UI without evidence.
   Check: DOC — Interface Foundation §3 names functional UI typeface, expressive/display typeface, semantic roles table (Role | Size/token | Weight | Line height | Use), scaling rules, forbidden/limited expressive use. For Next Plate the declaration must state whether EB Garamond is the functional face or a display face; the source has no serif-specific rule. VISUAL — V3 brand restraint: "expressive typography is not used in dense functional UI without evidence".
   Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Typography; [M] `M/templates/INTERFACE_FOUNDATION.md` › 3. Typography; [M] `M/04_VERIFY_MODE.md` › V3 › Brand restraint.

6. **BD-06** Line height is declared per role and is comfortable for the face in use.
   Check: AUTO (report only) — computed line-height ÷ font-size per role. VISUAL — read. [G] says "give serif body text slightly more line-height than a sans-serif". No threshold in source.
   Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Typography ("line-height behavior"); [M] `M/04_VERIFY_MODE.md` › V3 › Legibility; [G] `builder/design/frontend-design.md` › Design principles.

7. **BD-07** Line length below 80 characters.
   Check: AUTO — characters per rendered line in paragraphs (measure line boxes via `Range.getClientRects()`); flag 80 or more. Quote: "Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths". Guidance tier.
   Source: [G] `builder/design/frontend-design.md` › Design principles.

8. **BD-08** No truncation, overflow, unintended wrap or hidden label.
   Check: AUTO — flag elements with `scrollWidth > clientWidth`, ellipsis that hides decision-critical text, and any document-level horizontal overflow at the phone viewport. VISUAL — read every screenshot for the Canon's named classes: "comment rendered as text, phantom chevrons, overflows, three-line wraps, the hidden label". No threshold in source.
   Source: [M] `M/04_VERIFY_MODE.md` › V3 › Legibility ("truncation"); [C] 2 · The laws › Design & UX ("No surface ships without its rendered screenshot being read.").

9. **BD-09** Text resizes to 200% without loss of content or function.
   Check: AUTO — render each surface and state with text at 200% (root font-size or zoom); assert no clipped text, no unreachable control, capture screenshot. VISUAL — "does information remain understandable at larger text?" Quote: "text resizing to 200% without loss of content/functionality". Reflow is listed (V6 "text resize/reflow") with no separate threshold in source.
   Source: [M] `M/07_REFERENCE_COMPENDIUM.md` › 4. WCAG 2.2 › Baseline; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I6 › Manual; [M] `M/04_VERIFY_MODE.md` › V6 › Web; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6 › Web baseline.

10. **BD-10** One or two type families; if two, clearly distinct.
    Check: AUTO — set of computed font families across all surfaces; flag more than two. Quote: "use one family or two, and if two, make them clearly distinct."
    Source: [G] `builder/design/frontend-design.md` › Design principles.

11. **BD-11** A visual direction ruled for one medium is re-questioned on phones.
    Check: VISUAL — review the journal look at phone size as its own ruling. Canon scar: "desktop type carried to phones read “like a diary.”" No threshold in source.
    Source: [C] 2 · The laws › Design & UX.

### B. Touch targets and precision

12. **BD-12** Stand-alone web touch controls about 44×44 CSS px (product target, not WCAG).
    Check: AUTO — bounding box of every interactive element (one-tap buttons, swap and Pair it controls, stepper +/−, tabs, chips, sheet close/handle, toast actions, ask-box send); flag below 44×44 CSS px. Quote: "stand-alone web touch controls should target approximately 44×44 CSS px as a product design target". "Product may adopt stronger 44×44 CSS px touch target policy; do not mislabel it as the WCAG AA minimum."
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Baseline product policies; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6 › Web baseline.

13. **BD-13** WCAG 2.2 AA target-size floor.
    Check: AUTO — flag targets below 24×24 CSS px as conformance failures, applying WCAG's exceptions. Quote: "formal target-size criterion 24×24 CSS px with defined exceptions".
    Source: [M] `M/07_REFERENCE_COMPENDIUM.md` › 4. WCAG 2.2 › Baseline, › Important distinction.

14. **BD-14** Native platform targets: iOS 44×44 pt, Android 48×48 dp.
    Check: DOC — the source lists these for iOS and Android targets ("iOS touch targets generally target 44×44 pt"; "Android touch targets generally target 48×48 dp"; Android "around 48×48 dp unless documented exception"). It does not say whether they bind a mobile web app; record the decision in Interface Foundation §11.
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Baseline product policies; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6 › Android / Material, › Apple; [M] `M/07_REFERENCE_COMPENDIUM.md` › 2 › Product policy, › 3 › Operational use.

15. **BD-15** Tap targets are not crowded.
    Check: AUTO (report only) — gaps between adjacent targets (stepper pairs, macro chips, one-tap row). VISUAL — "are tap targets crowded?" V6 lists "target size/spacing". No spacing threshold in source.
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I6 › Manual; [M] `M/04_VERIFY_MODE.md` › V6 › Web.

16. **BD-16** No precision-only interaction and no visual inference required.
    Check: VISUAL/AUTO — any drag-only control (Builder curve, sliders) has a tap or keyboard alternative. Quotes: UX must not structurally require "precision-only interaction"; "does the screen require precision or visual inference?"
    Source: [M] `M/02_DESIGN_MODE.md` › D6 — UX preflight challenge › Accessibility preflight; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I6 › Manual.

### C. Contrast and colour

17. **BD-17** Normal text contrast at least 4.5:1.
    Check: AUTO — axe `color-contrast` plus computed ratio of each text node against sampled screenshot pixels behind it (needed for textured linen backgrounds). Quote: "4.5:1 normal-text contrast".
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I3 › Baseline product policies; [M] `M/07_REFERENCE_COMPENDIUM.md` › 4 › Baseline.

18. **BD-18** Large qualifying text at least 3:1.
    Check: AUTO as BD-17. Quote: "large qualifying text 3:1".
    Source: [M] `M/07_REFERENCE_COMPENDIUM.md` › 4 › Baseline.

19. **BD-19** Non-text contrast where applicable.
    Check: AUTO (report) — control boundaries, icons, stepper glyphs, focus rings against background. No threshold in source.
    Source: [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6 › Web baseline.

20. **BD-20** No meaning by colour alone; category colours never replace labels or state.
    Check: AUTO — grayscale screenshot per surface and state for review; assert every colour-coded element (macro cards, curve series, selected chip, status) also carries text or icon. VISUAL — "does hierarchy survive color removal?" Quotes: "Do not encode meaning by color alone."; "category colors do not replace labels/state semantics."
    Source: [M] `M/templates/INTERFACE_FOUNDATION.md` › 5. Color roles; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I6; [M] `M/04_VERIFY_MODE.md` › V3 › Brand restraint; [M] `M/02_DESIGN_MODE.md` › D6 › Accessibility preflight.

21. **BD-21** The alarm colour is spent on the irreversible act.
    Check: AUTO — list elements using the alarm/destructive token; VISUAL — each is an irreversible act.
    Source: [C] 2 · The laws › Design & UX.

22. **BD-22** Tokens only, including inside primitives.
    Check: AUTO — static scan for raw colour, spacing, radius and font literals outside the token source; flag. "A design system with zero imports is decoration. Split tokens into a small direction layer and a semantic layer applications may touch." V3: "token reuse".
    Source: [C] 2 · The laws › Design & UX; [M] `M/04_VERIFY_MODE.md` › V3 › Components.

### D. Accessibility (web)

23. **BD-23** WCAG 2.2 Level AA is the web floor; results reported by evidence class.
    Check: AUTO — axe-core per surface and per state (fixture precedent: tags `wcag2a`, `wcag2aa`); record MACHINE-PASS only for machine items. V6 requires status to distinguish `MACHINE-PASS`, `MANUAL-PASS` and `UNKNOWN`.
    Source: [M] `M/04_VERIFY_MODE.md` › V6 — Accessibility verification › Web; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6; [W] `tests/reference/browser.mjs`.

24. **BD-24** Every control has an accessible name and role, including icon-only controls.
    Check: AUTO — axe plus role queries; list icon-only buttons (sheet close, steppers, send) and confirm each has a visible label or text alternative. Quote: "ambiguous icons receive visible labels or text alternatives".
    Source: [M] `M/04_VERIFY_MODE.md` › V6 › Web; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I2 › Rules, › I6.

25. **BD-25** Focus is visible on every interactive primitive and follows a logical order.
    Check: AUTO — tab through each surface and open sheet; assert a computed focus indicator change on each focusable and an order matching visual order. Canon scar: "inline styles on primitives shipped a product with zero focus states; fix the class in the container, not the instance."
    Source: [M] `M/04_VERIFY_MODE.md` › V6 › Web; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6; [C] 2 · The laws › Design & UX; [G] Restraint and self-critique ("visible keyboard focus").

26. **BD-26** Keyboard operable.
    Check: AUTO — complete each surface's primary act by keyboard only.
    Source: [M] `M/04_VERIFY_MODE.md` › V6 › Web; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX6.

27. **BD-27** Reduced motion respected.
    Check: AUTO — emulate `prefers-reduced-motion: reduce`; assert non-essential animations stop (`document.getAnimations()`). Fixture precedent uses `reducedMotion:'reduce'`.
    Source: [G] `builder/design/frontend-design.md` › Restraint and self-critique; [W] `tests/reference/browser.mjs`.

28. **BD-28** Structural accessibility preflight passes.
    Check: DOC/VISUAL — the design does not structurally require "color-only meaning; precision-only interaction; memory of hidden instructions; inaccessible order; impossible scaling/reflow; unlabeled novel controls."
    Source: [M] `M/02_DESIGN_MODE.md` › D6 › Accessibility preflight.

### E. Hierarchy, density and content

29. **BD-29** FIRST / SECOND / THIRD attention is declared per critical surface and visible in pixels.
    Check: DOC — J Contract §14 table (Surface/state | First | Second | Third/deferred). VISUAL — screenshot matches the declaration.
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I1 — Visual priority and content compression; [M] `M/templates/J*_CONTRACT.md` › 14. Visual hierarchy; [M] `M/04_VERIFY_MODE.md` › V3 › Hierarchy.

30. **BD-30** One principal user question per surface; the screen leads with the object.
    Check: VISUAL. Quotes: "one principal user question per surface"; "Screens lead with the object; the core question comes first".
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I1 › Rules; [C] 2 · The laws › Design & UX; [P] §10 Stage 7 › Interaction grammar.

31. **BD-31** One dominant primary action where the state has one; binary consequential choices may be equally explicit.
    Check: AUTO — count elements carrying the primary-action token per surface and state; flag more than one unless it is a declared binary choice. VISUAL — "Primary action is perceptually obvious" (MANUAL obligation).
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I1 › Rules; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2. MANUAL interface obligations.

32. **BD-32** The same primary act is not drawn twice on one screen.
    Check: AUTO — duplicate accessible names or handlers among prominent controls per surface.
    Source: [C] 2 · The laws › Design & UX ("turns an accent into chrome — the action lives where the act belongs").

33. **BD-33** Previews show decision-critical information, not every field.
    Check: VISUAL — plate card, swap rows, order card. Quotes: "do not render every available product field"; "previews expose decision-critical information, not full descriptions".
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I1 › Rules.

34. **BD-34** No newspaper/noticeboard collapse.
    Check: VISUAL — the defect exists when "unrelated jobs compete on one surface; full details are shown where previews would support the decision; hierarchy collapses; functional type is shrunk to accommodate breadth; every module becomes an equally weighted tile/card; the screen behaves like a document when the user is trying to act." "Do not diagnose “too much text” merely by word count." Text-heavy treatment "is legitimate only when reading itself is the job."
    Source: [M] `M/03_DIAGNOSE_MODE.md` › X3 — Interface design diagnosis › Newspaper/noticeboard defect; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I1 › Rules; [M] `M/07_REFERENCE_COMPENDIUM.md` › 10 › P3.

35. **BD-35** A sentence earns its place only if the act fails without it.
    Check: VISUAL — copy pass per surface. Quote: "An app is functionality, not a marketing board — bare essential."
    Source: [C] 2 · The laws › Copy.

36. **BD-36** Cards are not the default container; equivalent objects share anatomy.
    Check: AUTO — compare DOM structure and computed box styles of equivalent items (macro cards, swap rows, menu items); flag divergent anatomy. VISUAL — card vs list fit ("Card vs list choice is appropriate" is MANUAL). Quotes: "cards are not the default container for every block"; "lists are preferred for repeated comparison when card grouping adds no meaning"; "all equivalent objects use equivalent anatomy."
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I2 › Rules; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2.

### F. Components, platform grammar, icons, brand

37. **BD-37** Familiar acts use platform-familiar controls; incumbent grammar is copied by default.
    Check: VISUAL — side-by-side render with the named incumbent for each common act (ratio steppers = quantity; ask box = search-like input; sheets; tabs). Quotes: "do not create a bespoke control when a mature platform pattern already communicates the act"; "Copy the incumbents' interaction grammar by default for every common act (date, time, quantity, search). Deviation needs a reason the governor ruled on."
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I2 › Rules; [C] 2 · The laws › Design & UX; [P] §4 Stage 1 › Incumbent teardown; [P] §10 › Interaction grammar.

38. **BD-38** For a WhatsApp-competing product, the informal channel's lower friction is studied before structure is added.
    Check: DOC/VISUAL — teardown record exists and the setup and logging acts are compared with it. Quote: "For products competing with an informal system such as WhatsApp, study why the informal system has lower friction before adding structure."
    Source: [P] §4 Stage 1 › Incumbent teardown.

39. **BD-39** A person fluent in the platform/incumbent grammar understands the screen without a private interface language.
    Check: VISUAL across "navigation; search; action placement; selection; filters; sheets/dialogs/menus; confirmation; symbols; state feedback; lists/cards." "The target is familiar grammar, not visual imitation."
    Source: [M] `M/04_VERIFY_MODE.md` › V5 — Platform / incumbent comparison.

40. **BD-40** Standard controls are recognizable without training.
    Check: VISUAL/USER — "Back, close, search, filter, selected, disabled, destructive, form input, sheet/dialog, and tab/navigation patterns should generally be recognizable without training."
    Source: [M] `M/07_REFERENCE_COMPENDIUM.md` › 10 › P4 — Standard controls are inherited vocabulary.

41. **BD-41** One coherent icon family; ambiguous icons labelled; comprehension evidenced.
    Check: AUTO — list icon-only controls lacking visible text; compare stroke/fill grammar. VISUAL — family coherence. USER — "unfamiliar icon comprehension" may need user proof.
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I2 › Rules, › I3 › Iconography; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 3. USER evidence obligations.

42. **BD-42** Consistent component anatomy across surfaces; no page-by-page design language.
    Check: AUTO — computed radius, padding, font and height per component type (buttons, cards, fields, sheets, toasts) across tabs; flag variance from tokens. VISUAL — "Product feels like one coherent app" (MANUAL).
    Source: [M] `M/04_VERIFY_MODE.md` › V3 › Components; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2.

43. **BD-43** Brand does not compromise functional legibility or make controls unfamiliar.
    Check: VISUAL — "brand does not compromise functional legibility"; brand "must not make ordinary controls unfamiliar or functional text illegible."
    Source: [M] `M/04_VERIFY_MODE.md` › V3 › Brand restraint; [M] `M/07_REFERENCE_COMPENDIUM.md` › 10 › P5 — Brand must not replace interface grammar.

44. **BD-44** Back / Close / Dismiss / Cancel semantics are declared and preserved.
    Check: DOC — `UX_FOUNDATION.md` declares them. AUTO — with each bottom sheet open, trigger browser/history back and the close control; compare result with the declaration.
    Source: [M] `M/02_DESIGN_MODE.md` › D4 — UX Foundation check; [M] `M/04_VERIFY_MODE.md` › V2 — Intended UX vs actual; [M] `M/templates/UX_FOUNDATION.md` › 1.

### G. States

45. **BD-45** Every applicable state has a rendered surface.
    Check: AUTO — drive each surface into each declared state (network stub, offline emulation, empty storage, denied, disabled) and screenshot; fail when a declared state has no capture. Playbook list: "loading; waiting; empty; error; denied; unavailable; cancelled; completed; resumed; stale or incompatible state where relevant." Module list: "loading; skeleton/progress; empty; populated; error; denied; offline; disabled; success; selected; destructive confirmation; waiting/pending." "Do not create states that product logic cannot actually support."
    Source: [P] §10 Stage 7 › Every state gets a surface; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I5 — State and responsive completion; [M] `M/02_DESIGN_MODE.md` › D3 — Flow and state architecture.

46. **BD-46** Empty, waiting and error states carry copy, and distinct causes look distinct.
    Check: AUTO — each such state contains visible text; the rendered text of "unconfigured, no data, network failure" differs. Quotes: "a blank region is inexpressible"; "Three absences that render identically ... are one bug; name each."; "Different causes that matter to the user must not collapse into an indistinguishable blank region."
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Every state gets a surface.

47. **BD-47** An empty screen offers the next act.
    Check: AUTO — empty state contains an action control; VISUAL. Quote: "An empty screen is an invitation to act."
    Source: [G] `builder/design/frontend-design.md` › More on writing in design.

48. **BD-48** Async external dependencies have a deadline and a failure value; no blank or spinner when unconfigured.
    Check: AUTO — stub Read the menu and the ask box to hang, fail and run without a key; assert a named honest state appears. Deadline value: no threshold in source. Quote: "until a key is configured the dependent surface renders a named honest state, never a blank or a spinner."
    Source: [C] 2 · The laws › Search & external services; [P] §12 Stage 9 › External services.

49. **BD-49** Visual treatment and recovery action are specified for each state.
    Check: DOC — Interface Foundation §9 table rows Loading, Empty, Error, Disabled, Selected, Success, Waiting with "Visual treatment" and "Recovery/action".
    Source: [M] `M/templates/INTERFACE_FOUNDATION.md` › 9. State grammar; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I5.

50. **BD-50** Tappable looks tappable; selected, disabled and destructive states are clear.
    Check: AUTO — disabled controls carry `disabled`/`aria-disabled` and a distinct computed style; selected items expose `aria-selected`/`aria-pressed` or equivalent. VISUAL — affordance read.
    Source: [M] `M/03_DIAGNOSE_MODE.md` › X3 › Affordance; [M] `M/04_VERIFY_MODE.md` › V3 › Affordance.

51. **BD-51** An error state does not show contradictory status copy beside it.
    Check: AUTO — in each error state, assert no success status text is still displayed (workbench precedent check "error state hides success status"). Workbench finding, not a doctrine law.
    Source: [W] `builder/evidence/live/ACTIVATION_REPORT_2026-10-25.md` › Step results (step 4 visual inspection); [W] `tests/reference/browser.mjs`.

### H. Interaction and flow

52. **BD-52** Routine acts finish in one to three taps.
    Check: AUTO — scripted tap count from Plate tab entry to the logged card for each one-tap button, a swap and Pair it; fail above three. Quote: "routine acts finish in one to three taps or the flow is defective."
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Interaction grammar ("prefer one-to-three-tap routine acts").

53. **BD-53** Forms grow one question at a time; known facts are prefilled, never hidden.
    Check: AUTO — inputs per setup step; VISUAL. Quotes: "the form grows one question at a time"; "Prefill, never hide — hiding prefilled facts reduces truth, not work." No count threshold in source.
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Interaction grammar.

54. **BD-54** Destructive actions are never one tap; the confirmation names the consequence; the opposite act is hardened too.
    Check: AUTO — for each destructive control (remove a logged item, reset setup, clear plate), the first tap opens a confirmation whose text names the consequence; the inverse act is guarded where the same risk exists.
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Destructive actions.

55. **BD-55** URLs stay the truth under sheets and overlays.
    Check: AUTO — with a sheet open, read the URL; load it in a fresh context; the same underlying screen and state appear. Quote: "Gestures propose, confirmations dispose; URLs stay the truth under sheets and overlays so deep links and push actions compose."
    Source: [C] 2 · The laws › Design & UX.

56. **BD-56** Every route is total; every typed error code maps to a sentence and a destination.
    Check: AUTO — unknown hash/path lands home; static check that the error-code map is exhaustive ("an error without copy fails the typecheck").
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Routes and values.

57. **BD-57** Every declared state/routing value has a writer, a handler and a destination.
    Check: AUTO — static scan of unions/enums against handlers. Quote: "A declared union value with no handler is a dead affordance waiting to go live".
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Routes and values.

58. **BD-58** A filter names what it does; an empty filtered result names the filter and offers creation.
    Check: AUTO/VISUAL — applies to any filtered list (swaps, Rescue options) if present.
    Source: [C] 2 · The laws › Design & UX.

59. **BD-59** AI output passes a human confirm and never judges a person.
    Check: AUTO — values produced by Read the menu or the ask box cannot reach the log without a user confirm step. Quotes: "AI fills, explains, summarises; it never judges a person, never feeds a rating, never acts alone. Every AI value passes a human confirm."; "require human confirmation for consequential AI-produced values".
    Source: [C] 2 · The laws › AI in the product; [P] §12 Stage 9 › AI.

60. **BD-60** Result quality is read, not result presence.
    Check: AUTO — replay a committed fixture set against the deployed product: "short inputs; local place/product/service names; founder examples; inputs that previously surprised the system" (Audit L-A5 adds one letter and two letters). VISUAL — read outputs. Quotes: "presence of results is not quality of results"; "Absent beats wrong."
    Source: [C] 2 · The laws › Search & external services; [P] §12 › Search, › External services; [A] 3 · The laws › L-A5.

61. **BD-61** Foundation acts are accounted for.
    Check: DOC/AUTO — "sign-in; sign-out; recovery; profile edit; account closure / deletion; suspension; reinstatement; resume after absence; interrupted-flow recovery." "If any do not apply, record why." AUTO example: reload mid-setup and after absence; assert safe resumption.
    Source: [P] §6 (Stage 3), foundation subsection; [C] 1 · Day Zero, item 7.

62. **BD-62** The first-run door is walked on the deployed product on a phone-sized screen.
    Check: AUTO + VISUAL — fresh profile, deployed URL, from an unauthenticated/fresh state "to the first legitimate destination"; "Preserve intended destination and safe partial state across required authentication bounces." "Do not believe a green test suite that enters through a door the public product does not have."
    Source: [P] §7 Stage 4 — Prove the door › Required proof, › Intermediate states; [A] 3 · The laws › L-A3.

63. **BD-63** An install prompt appears after first value, once.
    Check: AUTO — if a PWA install prompt exists, it is not shown before the first logged plate and is shown at most once.
    Source: [C] 2 · The laws › Growth.

64. **BD-64** The incumbent channel is used, not fought.
    Check: VISUAL/DOC — where sharing exists: "share cards that travel into it, deep links that travel back, paste-to-parse doors."
    Source: [C] 2 · The laws › Growth.

### I. Copy

65. **BD-65** Banned-claim words are a build-failing sweep.
    Check: AUTO — regex over all user-facing strings: "verified", "vetted", "safe", "certified", "guaranteed", and "no rating or score on a person"; per-audience sets; also "Ban the vocabulary of any risk the product refused".
    Source: [C] 2 · The laws › Copy.

66. **BD-66** Copy, and position, never claim a mechanism the product lacks.
    Check: DOC/VISUAL — promise table: every button, copy line and claim with its mechanism and rung. "A nav item, status, route, badge, or button can imply a capability even if no sentence states it."
    Source: [C] 2 · The laws › Copy; [P] §11 Stage 8 › Copy is an interface to mechanisms; [A] 3 · The laws › L-A2.

67. **BD-67** Before and after of an action are two strings.
    Check: AUTO — capture control and status text before and after each act (log, swap, Pair it, order); assert they differ. Scar: one string rendered "You withdrew this" above the un-clicked button.
    Source: [C] 2 · The laws › Copy.

68. **BD-68** Error copy distinguishes operationally different causes.
    Check: AUTO — stub "not signed in", "not permitted", "network dead" (as applicable); assert distinct messages and recovery paths.
    Source: [C] 2 · The laws › Copy; [P] §11 › Error copy.

69. **BD-69** Name the thing, never indict the person.
    Check: VISUAL copy pass. Quote: "The lift never came," not "Driver did not come."
    Source: [C] 2 · The laws › Copy.

70. **BD-70** All user-facing strings live in one governed home; tests query by role or test-id.
    Check: AUTO — static scan for string literals in components outside the copy module; flag tests that select by literal copy.
    Source: [C] 2 · The laws › Copy; [P] §11 › Governed strings.

71. **BD-71** A CTA says what happens; an action keeps one name through the flow.
    Check: AUTO — map each toast to its triggering control and compare verb stems; flag generic labels such as "Submit". Quotes: "Save changes," not "Submit."; "the button that says “Publish” produces a toast that says “Published.”"
    Source: [G] `builder/design/frontend-design.md` › More on writing in design.

72. **BD-72** Errors explain what went wrong and how to fix it; no apology, never vague.
    Check: AUTO — flag apology tokens and messages lacking a next step; VISUAL. Quote: "Errors don't apologize, and they are never vague about what happened."
    Source: [G] More on writing in design.

73. **BD-73** Sentence case, plain verbs, no filler, user vocabulary over system vocabulary.
    Check: AUTO — case check on labels and buttons; VISUAL for vocabulary.
    Source: [G] More on writing in design.

### J. Viewport, responsive, deployment

74. **BD-74** Each surface is rendered at phone width and the screenshot is read.
    Check: AUTO capture + VISUAL read. "No meaningful surface is considered inspected merely because tests pass. Render it at phone width and read the screenshot." No width number in the doctrine; the fixture used "Small viewport: 390 by 844. Large viewport: 1280 by 900." Target form factors must be declared (Interface Foundation §2 and §10).
    Source: [P] §10 › Screenshots; [A] 3 · The laws › L-A6; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I5; [W] `builder/INTERFACE.md` › Reference interface.

75. **BD-75** No stretched compact layout on larger windows where structure should change.
    Check: AUTO capture at each declared larger form factor; VISUAL. Quote: "Do not merely stretch a compact mobile surface across larger widths." Breakpoints: no threshold in source ("compact; medium; expanded" named only).
    Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I5 › Responsive rule; [M] `M/04_VERIFY_MODE.md` › V3 › Responsive behavior; [P] §5A › Stage 2A-ii.

76. **BD-76** Safe areas and viewport constraints are respected.
    Check: AUTO — device emulation with safe-area insets; fixed-bottom elements (tab bar, sheets, toasts, ask box) are not occluded; viewport meta present. No threshold in source.
    Source: [M] `M/04_VERIFY_MODE.md` › V3 › Responsive behavior.

77. **BD-77** The screenshot is of the build being judged: prove the served bundle.
    Check: AUTO — before capture, verify the served artifact contains the build under review. "Deployed is not working. Prove the bundle (grep the served artifact for the change), never the build's exit code". Day Zero: "the live URL gates every later" on-device test.
    Source: [C] 2 · The laws › Deploy & caching; [C] 1 · Day Zero, item 6.

### K. Generated-look tells (guidance tier; legitimate when the brief pins them)

78. **BD-78** Default look #1: warm cream background "near #F4F1EA" with a high-contrast serif display and a terracotta/clay accent "often near #D97757".
    Check: AUTO — compare background and accent tokens with those hexes. VISUAL/DOC — the Raw Linen + EB Garamond direction likely sits in this family (inference); record that the brief pins it, since "the brief's own words always win, including when it asks for one of these looks."
    Source: [G] `builder/design/frontend-design.md` › Process: plan, review against the brief, build, critique.

79. **BD-79** Template chrome tells.
    Check: AUTO — flag "a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text."
    Source: [G] Process: plan, review against the brief, build, critique.

80. **BD-80** Card-kit tells.
    Check: AUTO — flag "content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration". Also the broadsheet tell: "hairline rules, zero border-radius, and dense newspaper-like columns".
    Source: [G] Process: plan, review against the brief, build, critique.

81. **BD-81** Typographic tells; numbered markers only for a sequence.
    Check: AUTO — flag a single accented word in a headline, all-caps labels, unnecessary labels above content; numbered markers allowed only where content is a sequence (the 3-step setup qualifies).
    Source: [G] Design principles.

82. **BD-82** Motion: one orchestrated moment; motion answering an act shows what changed.
    Check: AUTO — count non-user-triggered entrance animations per surface; flag "fade-and-slide-up entrances on each section and hover transitions on every card". No duration threshold in source.
    Source: [G] Design principles.

83. **BD-83** Restraint: boldness spent in one place; a compact palette plan.
    Check: VISUAL — "Spend your boldness in one place." DOC/AUTO — base palette described "as 4–6 named hex values".
    Source: [G] Restraint and self-critique; [G] Process: plan, review against the brief, build, critique.

### L. Per-surface verdict rules

84. **BD-84** Ten-dimension matrix per surface, one verdict each, no average.
    Check: VISUAL — hierarchy; legibility; density; affordance; component consistency; platform grammar; iconography; state clarity; responsive behavior; visual craft/coherence. Verdicts "PASS / MINOR / MAJOR / UNKNOWN". "No fake average score." (I7 names the ninth dimension "responsive intent"; V7 names it "responsive behavior".)
    Source: [M] `M/04_VERIFY_MODE.md` › V7 — Interface review matrix; [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I7 — Fresh-eye interface review; [A] 11 › L-A24.

85. **BD-85** Nielsen's ten heuristics at interaction level; record only material failures.
    Check: VISUAL — each failure with "evidence; consequence; severity; class." Uses listed: system status, everyday language, control/escape, standards, error prevention/recovery, recognition over recall, efficiency; interface: hierarchy, visual competition, grouping, relevance/minimalism.
    Source: [M] `M/04_VERIFY_MODE.md` › V4 — Heuristic review; [M] `M/02_DESIGN_MODE.md` › D6 › Nielsen pass; [M] `M/07_REFERENCE_COMPENDIUM.md` › 1.

86. **BD-86** Every finding names its causal layer, severity and route.
    Check: AUTO (shape only) — each finding row has one primary class from `UX_ARCHITECTURE`, `INTERFACE_DESIGN`, `IMPLEMENTATION`, `ACCESSIBILITY`, `CONTENT`, `UNKNOWN`, optional contributing classes, evidence, consequence, severity `BLOCKER`/`MAJOR`/`MINOR`, route. "A finding with no class is not routable and is therefore not yet a finding." "An interface-only defect does not reopen sound UX architecture."
    Source: [A] 11 › L-A23; [M] `M/03_DIAGNOSE_MODE.md` › X5 — Defect classification; [P] §20 › The human surface of an existing product.

87. **BD-87** USER evidence where comprehension is uncertain or the audience differs.
    Check: USER — triggers: "comprehension remains uncertain; users previously failed the same class; target users have materially different digital fluency/accessibility needs; novel interaction departs from familiar grammar; Governor requests it; release risk justifies it." "A compact task test is sufficient when the question is narrow." Next Plate's stated audience (middle-aged, some with poor eyesight) matches the fluency/accessibility trigger (inference).
    Source: [M] `M/04_VERIFY_MODE.md` › V8 — User proof where required; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 3. USER evidence obligations.

88. **BD-88** Aesthetic forks are settled with rendered options on identical data.
    Check: VISUAL — "lettered side-by-side candidates on identical data — never by interpreting adjectives"; "Record the verbatim reaction"; at most three materially distinct directions; no further branching once one is accepted.
    Source: [C] 2 · The laws › Design & UX; [P] §10 › Aesthetic decisions; [P] §5A › Stop rules.

89. **BD-89** The human review is scripted and benchmarked.
    Check: VISUAL — "the governor's ten minutes are spent by script": numbered, "tap-by-tap", ending with "what annoyed you?"; each surface names its incumbent and is rendered beside it: "would a person who uses the incumbent daily call this better?" Both are ADVISORY in the Audit Protocol.
    Source: [A] 3 · The laws › L-A7, › L-A4.

### M. Rules for the automated review itself

90. **BD-90** Each check fails when its subject disappears.
    Check: AUTO — each per-surface check asserts it found its subject (surface, element, state) before asserting a property; "subject disappears → fail rather than vacuous pass."
    Source: [M] `M/06_ENFORCEMENT_AND_GATES.md` › 8. Gate drills; [P] §5 Stage 2 › Gate design rules; [C] 2 · The laws › Audit & verification.

91. **BD-91** Each check is drilled with a planted violation.
    Check: AUTO — precedent in the fixture: a planted heading colour change must differ from the retained reference, and a removed label `id` must produce an axe `label` violation.
    Source: [C] 2 · The laws › Audit & verification ("Drill every gate", "Every clever gate carries an anti-vacuous case"); [P] §5 › Gate design rules; [W] `tests/reference/browser.mjs`.

92. **BD-92** Green traces to process exit status; a check that cannot run reports UNVERIFIED; failing runs are preserved.
    Check: AUTO — "a check that cannot honestly run reports UNVERIFIED, never passed"; capture failing output "into stamped artifacts no later run overwrites".
    Source: [C] 2 · The laws › Audit & verification.

93. **BD-93** Surface, state and control sets are derived from code, never hand-listed.
    Check: AUTO — enumerate routes, sheets, toasts and states from source. Quote: "Derive every guarded set from the code; never hand-list it".
    Source: [C] 2 · The laws › Audit & verification; [P] §5 › Gate design rules.

94. **BD-94** Evidence kind matches the claim; machines never claim judgment.
    Check: report rule — "a domain test is not a UI proof"; "Do not infer visual quality from CSS/source code."; "Never report MANUAL or USER judgment as machine proof."; "The machine may require the review artifact. It may not claim the judgment itself." Root `CLAUDE.md`: "code tests alone do not approve UI."
    Source: [C] 2 · The laws › Audit & verification; [M] `M/04_VERIFY_MODE.md` › V3; [M] `M/01_UX_SYSTEM_CORE.md` › 9. Evidence classes; [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2; [A] 11 › L-A24.

### Surface applicability (inferred from the Next Plate surface list, not from the doctrine)

| Surface | Criteria beyond the every-surface set |
|---|---|
| Every surface and state | BD-01–BD-36, BD-41–BD-47, BD-50, BD-65–BD-76, BD-84–BD-86 |
| 3-step setup | BD-53, BD-61, BD-62, BD-81 (sequence markers legitimate) |
| Plate tab (plate card, macro cards, one-tap buttons, swaps, Pair it, logged card) | BD-20, BD-31, BD-32, BD-33, BD-52, BD-54, BD-67 |
| Ask box | BD-24, BD-48, BD-59, BD-60 |
| Builder tab (ratio steppers, curve) | BD-15, BD-16, BD-20, BD-37 (quantity grammar) |
| Rescue tab (eating-out, Read the menu, order card) | BD-33, BD-48, BD-58, BD-59, BD-60 |
| Bottom sheets | BD-25, BD-44, BD-55, BD-76 |
| Toasts | BD-04, BD-67, BD-71, BD-76 |
| Brand look (Raw Linen, EB Garamond, Caveat) | BD-04, BD-05, BD-10, BD-11, BD-17, BD-43, BD-78–BD-83 |

---

## 2. Gates, verification modes and required evidence

### 2.1 Status chain and gates

- Legal statuses (13): `IDENTIFIED`, `UX_DESIGNING`, `UX_READY`, `INTERFACE_DESIGNING`, `INTERFACE_READY`, `IMPLEMENTING`, `VERIFY_REQUIRED`, `VERIFYING`, `VERIFIED`, `DEFECT`, `UNKNOWN`, `DEFERRED`, `SUPERSEDED`. `PREBUILD_READY` is superseded and must never be bulk-promoted to `INTERFACE_READY`. Source: [M] `M/01_UX_SYSTEM_CORE.md` › 11. Status model; `M/templates/UX_MANIFEST.yaml`; [P] §20 › Migrating a product that used `ux-design-assurance` v1.0.
- Criticality (any one): directly delivers core value; first-run/sign-in/onboarding/admission/recovery door; consequential commitment; crosses roles; safety/privacy/trust/sensitive/destructive/irreversible; operator support of a user promise; "High-frequency routine act central to normal use"; Governor designation. "Classify by consequence, not screen count." Source: [M] `M/01_UX_SYSTEM_CORE.md` §5; [P] §5A, applicability subsection. Inference for Next Plate: setup is a first-run door; Plate logging is core value and a high-frequency routine act.
- Inheritance: a minor surface may inherit if its job fits an existing pattern, uses existing component grammar, adds no major state, no top-level navigation, no novel destructive/trust/safety interaction, no new density or responsive pattern; "Inheritance is recorded, not assumed." Source: [M] `M/01_UX_SYSTEM_CORE.md` › 8. Interface inheritance; [P] §5A.
- **Gate A `UX_READY`** — actor/job; entry/success; flow; major states; navigation and Back/Close/Cancel semantics; benchmark/platform decision; low-fidelity wireframe evidence; UX preflight PASS; zero BLOCKING UX unknowns. Source: [M] `M/02_DESIGN_MODE.md` › D7; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX2; [P] §5A › Stage 2A-i.
- **Gate B `INTERFACE_READY`** — `UX_READY`; Interface Foundation exists or is deliberately inherited; component mapping (platform-familiar over bespoke); for a new product or product-wide redesign, "1–3 accepted representative high-fidelity reference surfaces"; visual treatment for "loading, empty, error, denied, disabled, success, selected, destructive-confirmation and waiting states"; responsive intent; interface accessibility preflight; fresh-eye review with no MAJOR and no material UNKNOWN; zero BLOCKING interface unknowns. "Fail closed: `UX_READY` alone is not implementation permission". Source: [M] `M/02A_INTERFACE_DESIGN_MODE.md` › I8; [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-IF1; [M] `M/01_UX_SYSTEM_CORE.md` › 6; [P] §5A › Stage 2A-ii, › Consequence gate.
- **G-UX3 artifact integrity** (CI/commit/milestone): manifest parses; legal statuses; paths resolve; `UX_READY` has wireframes; `INTERFACE_READY` has Interface Foundation and reference evidence; `VERIFIED` has current verification reference; `DEFERRED` has reopen condition; `SUPERSEDED` has replacement/provenance.
- **G-UX4 verification-required** (milestone/release/completion claim): materially changed critical routes are `VERIFIED` or carry an accepted exception; fails on `VERIFY_REQUIRED`, `VERIFYING`, `DEFECT`, material `UNKNOWN`, "stale build evidence". Release pseudocode requires `last_verified_build == current_build`.
- **G-UX5 screenshot/build identity** and **G-UX6 accessibility adapter**: see 2.3 and BD-12–BD-28.
- Gate drills to run where armed: missing J Contract, missing wireframe, `UX_READY` without Interface Foundation, missing reference surface, missing interface preflight, stale verification build, subject disappears — each must fail.
  Source for the last four bullets: [M] `M/06_ENFORCEMENT_AND_GATES.md` › 1. Gate set, › 6. Reference release pseudocode, › 8. Gate drills.

### 2.2 VERIFY mode (what must exist before "VERIFIED")

Source: [M] `M/04_VERIFY_MODE.md`; [A] 11 › L-A24; [M] `M/08_DOCTRINE_INTEGRATION_PATCH.md` › Patch D.

- **Independence:** at milestone/release boundaries, run from a fresh context. The verifier receives product purpose, the runnable/deployed product, the scoped J Contract, wireframes, UX Foundation, Interface Foundation, reference set, current build identifier, incumbent references and the Audit Protocol; it "does not inherit builder rationale as proof." Also [P] §16 › Fresh eyes; [A] L-A7.
- **V0:** record build/version/commit; device/form factor/viewport; J IDs; actor; artifacts consulted; what cannot be exercised; end with `SEEN` / `NOT SEEN`.
- **V1** (walk): legitimate starting condition; ordinary entry path; primary task; at least one material alternate/failure/recovery state; downstream consequence where applicable; reach success, safe cancellation or a legitimate terminal state. A page rendering is not proof of the walk.
- **V2:** compare with J Contract and wireframes (job, primary question, primary action, sequence, navigation/back/close, major states, no policy-changing shortcut, no new prerequisite or dead end). "Deviation must be intentional and recorded, evidence-supported, or a finding."
- **V3:** "Capture rendered evidence at target form factors" and compare with Interface Foundation and reference set (hierarchy, legibility, density, affordance, components, brand restraint, responsive behaviour).
- **V4** heuristics; **V5** platform/incumbent; **V6** accessibility (MACHINE-PASS / MANUAL-PASS / UNKNOWN); **V7** ten-dimension matrix: "cannot be `VERIFIED` with a MAJOR interface defect or material UNKNOWN in a required dimension"; **V8** USER evidence where triggered.
- **V9 verdicts:** `VERIFIED` — "Required evidence exists; no open BLOCKER/MAJOR defect in UX, Interface, Implementation, or Accessibility." `DEFECT` — route only the affected class. `UNKNOWN` — "Material evidence could not be obtained. UNKNOWN is not PASS." "MINOR findings may be carried as explicit debt if release policy permits."
- **After a fix:** re-verify only the affected route plus the dependent chain plausibly altered; do not rerun the full product after every minor fix.

### 2.3 Rendered evidence requirements

- **Identity fields:** J; build/commit; viewport/device; state; date. "Existence/freshness can be ARMED. Pixel judgment remains MANUAL." Source: [M] `M/06_ENFORCEMENT_AND_GATES.md` › G-UX5; [A] 11 › L-A25 ("An unidentified screenshot proves a surface existed somewhere, once, which is not a claim any audit can use"). Inconsistency in source: L-A25 lists five items while its mechanism clause says "require the four fields"; Patch D3 lists four (no date).
- **Where and how:** phone width ([P] §10 › Screenshots; [A] L-A6); deployed product, fresh profile, phone-sized screen for first-runs ([A] L-A3; [P] §7); synthetic data only for committed/publication evidence ([P] §10; [A] L-A25; [C] Audit & verification; [C] 1 · Day Zero item 8).
- **Invalidation:** material changes to "typography tokens; navigation chrome; shared components; interface foundation; state visuals; responsive primitives" may invalidate several routes; derive the affected set or record a bounded manual scope. Source: [M] `M/06_ENFORCEMENT_AND_GATES.md` › 7. Evidence freshness; [A] L-A25; [M] `M/05_UX_ARTIFACT_CONTRACTS.md` › 9 ("A material change invalidates affected evidence.").
- **Retention:** "No permanent screenshot archive unrelated to a current reference/verification artifact." Source: [M] `M/05_UX_ARTIFACT_CONTRACTS.md` › 11. Anti-bloat rules. In an adopted app, `builder/evidence/.gitignore` keeps only `*.json` and `*.log`; images stay local unless deliberately committed with the route's docs. Source: [W] `operating/prepare_new_app.py` (`EVIDENCE_GITIGNORE`).
- **Fixture precedent** [W] `tests/reference/browser.mjs`: Chromium at 390×844 with `reducedMotion:'reduce'`; pixel-equality against a retained reference render; planted colour defect must be detected; axe run with `wcag2a`/`wcag2aa` and zero violations; planted unlabeled control must be detected; role denial in UI and API; save survives reload; network error keeps data and hides success status; 1280×900 error capture; zero page errors. Outputs `mobile.png`, `reference.png`, `desktop-error.png`, `accessibility.json`, `browser.json`. Activation finding: identical app and reference HTML means "mobile matches reference" proves non-regression only, not design quality, and the declared `loading` state was not exercised.

### 2.4 Reporting vocabulary

- Evidence classes: MACHINE, EXPERT/MANUAL, USER ([M] `M/01_UX_SYSTEM_CORE.md` › 9); review model adds UNKNOWN ([M] `M/07_REFERENCE_COMPENDIUM.md` › 13).
- Mechanism grammar: ARMED / MANUAL / UNARMED; "A gate description is not a gate." ([A] §9; [M] `M/09_CLAUDE_ASSIMILATION_PROMPT.md` › 7. Enforcement honesty).
- Completion language: VERIFIED; MANUAL evidence observed; UNVERIFIED; UNKNOWN; UNARMED; DEFERRED with reopen condition. Milestone closure requires "affected surfaces were rendered and inspected". Do not convert "file exists", "build passed", "merged", or "deployed" into "working". Source: [P] §15 Stage 12 › Before closure, › Completion language.
- Root `CLAUDE.md`: "Report configured, executed, live-validated and blocked states separately." "A blocked turn may end with an explicit blocker and next action; this does not authorize a VERIFIED claim."
- Audit reports: SEEN with an artifact per item and a non-empty NOT SEEN; "A report whose NOT-SEEN list is empty is rejected as dishonest by construction." A listed blind spot may not become a premise. Source: [A] 3 · The laws › L-A1.

### 2.5 MANUAL by design (never machine-proved)

Primary action obviousness; hierarchy coherence; density fit; icon meaning; card vs list choice; brand restraint; "Product feels like one coherent app"; reference-surface maturity; expressive typography effect on legibility; larger-viewport composition. Also elegance, visual maturity, "looks like an app", correct incumbent choice, cognitive burden. "These are mandatory evidence-bearing reviews, not fake deterministic gates." Source: [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2. MANUAL interface obligations, › 9; [P] §5A › Enforcement state; [P] §22 What not to do.

Armable sub-parts named by the doctrine: "contrast ratios, target sizes, accessible names, text-resize behaviour, token conformance, and the existence and currency of the artifacts being compared against" ([A] 11 › L-A24); "manifest parsing, status legality, artifact existence, contrast and target-size scanning, screenshot freshness" ([P] §5A › Enforcement state).

Central enforcement state: every UX/interface gate is MANUAL or UNARMED centrally; `G-UX1`–`G-UX6` are descriptions, not gates; the one ARMED mechanism (`operating/doctrine_bootstrap.py` fingerprints) "proves the module is untampered and proves nothing about any" route's status. Source: [A] 11 › Enforcement honesty; [C] Design & UX mechanism clause; `UX_DA_V1_1_ASSIMILATION_REPORT_2026-08-16.md` › 8. Enforcement status.

### 2.6 Workbench proof runner

`operating/verify_j*.py` with `operating/builder_common.py` (`validate_contract`, `validate_proof`):
- Contract must carry `id`, `actor`, `job`, `entry`, `success`, `states`, `acceptance`, `checks`; `ux_status` must equal `INTERFACE_READY`; the J Contract, `interface_foundation`, `wireframe` and `review_record` files must exist, be non-empty and be source-tracked.
- `review_record` must have `decision == "ACCEPTED"`, a `reviewer` and a `basis` (the workbench copy is `PENDING`: "Requires actual rendered reference inspection. Do not infer acceptance from file presence."). Source: [W] `builder/REFERENCE_REVIEW.json`.
- Each check: `argv` list (no shell string), `required: true`, unique `id`, timeout capped at 300 s. Output must be under `builder/evidence/`. Per-check `.log` captured and hashed; declared artifacts hashed and refused if Git-ignored; source digest must be unchanged by the checks.
- Proof status: `BLOCKED` → `CHECKS_PASS_REVIEW_PENDING` (all checks passed, review not accepted) → `PASS`. Exit 2 on any block. A proof is stale when the source digest or any evidence hash changes.
- `operating/check_handoff.py`: `VERIFIED` requires no blockers, no unresolved decision citations, a valid proof and `live_claude == "PASS"`.

---

## 3. Hook and reviewer wiring

### 3.1 Configured hooks

| Event | Matcher | Command | Timeout | onFailure |
|---|---|---|---|---|
| SessionStart | (none) | `python3 "${CLAUDE_PROJECT_DIR}/operating/builder_hook.py"` | 30 | — |
| PreToolUse | `Write\|Edit\|NotebookEdit\|Bash\|mcp__.*` | same | 30 | `continue` |
| Stop | (none) | same | 30 | — |

Source: [W] `.claude/settings.json`. New-app template `templates/new-app/.claude/settings.json` is identical except the script path `${CLAUDE_PROJECT_DIR}/.builder/builder_hook.py`. `onFailure: continue` implements Governor decision GOV-2026-10-25-D1 "A: fail open and record" ([W] `reviews/GOVERNOR_DECISIONS_2026-10-25.md`); a test asserts the value ([W] `tests/test_builder.py`, `test_actual_configuration_has_writer_routes_and_restricted_reviewer`). Discrepancy: `Claude_Setup_Playbook.md` › Responsibilities still describes "PreToolUse onFailure:block".

### 3.2 Script behaviour and exit codes — `operating/builder_hook.py`

- **SessionStart:** runs `doctor(orient=True, kit=True)`; always exit 0; JSON report injected as `hookSpecificOutput.additionalContext` (BLOCKED reasons included as text). Informational, never a gate (`test_startup_failure_is_information_not_gate`).
- **PreToolUse:** two exact single-line Bash commands pass without checks: `python3 <tools>/builder_doctor.py --orient --session-id <this session>` and `git checkout -- .doctrine/source`. Otherwise `doctor()` (core integrity, and in product mode a valid orientation receipt; kit not checked so kit repair stays possible): exit 0, or exit 2 with stderr `BUILDER INPUTS BLOCKED: …`.
- **Stop:** `doctor(kit=True)`; if `builder/ACTIVE_WORK.json` exists its status must be `ACTIVE`, `BLOCKED` or `CLOSED`; `ACTIVE`/`CLOSED` need a valid PASS proof whose contract matches; `BLOCKED` needs `reason` and `next_action`; `CLOSED` also runs the handoff check. Failure: exit 2 `BUILDER PROOF BLOCKED: …`. If `stop_hook_active` is set: write `.doctrine/runtime/STOP_BLOCKED.json`, exit 0 with systemMessage "Loop relief is not validation. Report blocker."
- **Malformed event JSON:** exit 2. **Uncaught exception:** writes `.doctrine/runtime/GUARD_FAILURE.json`; PreToolUse exit 0 with "Builder guard failed open … Recorded; this is not a passing check."; Stop (not in loop relief) exit 2; other events exit 0.
- `builder_doctor.py` hard-codes `claude_loaded_skills`, `mcp_auth`, `model_and_effort`, `live_hook_loading` as `LIVE_CHECK_PENDING` and `browser` as `EXECUTION_PROBE_REQUIRED`: the hook never measures them.

### 3.3 What checks UI today (none of it is a hook)

- **Browser fixture:** `tests/reference/browser.mjs` via `npm run test:browser` (Playwright 1.64.1, axe-core 4.14.0, pngjs 7.0.0). Run by the CI job `browser` and as a contract check through `operating/verify_j*.py` (`builder/REFERENCE_J*.json`).
- **CI:** `.github/workflows/builder-checks.yml`, on `pull_request` and push to `main`: job `deterministic` (`python3 operating/builder_doctor.py --kit`; `python3 -m unittest discover -s tests -v`); job `browser` (`npm ci --ignore-scripts --no-audit --no-fund`; `npx --no-install playwright install --with-deps chromium`; `npm run test:browser`; upload `builder/evidence/reference/` always).
- **Impeccable 4.7.0 (optional CLI):** `npx --no-install impeccable detect --json tests/reference/app.html`; documented contract exit 0 (no primary findings), 1 (scan failure), 2 (primary findings); observed exit 2 (an Arial finding) and exit 1 (missing path); advertised 62-rule catalog not confirmed. "No hook installation or product-token change is authorized by a detector result. Stylistic preferences never override approved design." Source: [W] `builder/INTEGRATIONS.md` › Design; `builder/LOCAL_EXECUTION.md`.
- **builder-reviewer subagent:** `.claude/agents/builder-reviewer.md` (identical in `templates/new-app/`), `tools: Read, Grep, Glob`. Instructions: report findings with file locations, consequence, evidence and smallest correction; name what was not inspected; "Distinguish machine proof, manual judgment and live checks"; do not accept the author's summary; no edits, shell, promotion or owner decisions; ask for raw logs; "no automatic second review round." Not attached to any hook event; invoked by the `builder-work` skill and `START_HERE.md` step 6.
- **Path-scoped rule:** `.claude/rules/builder-ux.md`, `paths` `**/*.tsx`, `**/*.jsx`, `**/*.html`, `**/*.css`, `ux/**`: "Review rendered mobile/desktop states and keyboard/accessible names as applicable." It asks for build/source, J, viewport and state to be recorded with visual evidence, and states: "An evidence validator cannot decide elegance or user comprehension." It also says UX_READY precedes INTERFACE_READY and that role/state/product logic stays separate from interface choices.
- **Distribution:** `operating/prepare_new_app.py` copies into a new app the hook tools (into `.builder/`), `CLAUDE.md`, `START_HERE.md`, `.claude/settings.json`, the reviewer agent, the three skills (with `operating/` rewritten to `.builder/`), the UX rule, `builder/INTEGRATIONS.md`, `builder/HANDOFF.example.json`, `builder/design/frontend-design.md` and its `LICENSE.txt`, plus the pinned Doctrine copy, binding, state and config.

### 3.4 What the doctrine says hooks can and cannot prove

- "hooks bind only the harness's own sessions and only the acts they match"; "the downstream gate remains". A pre-act guard "FAILS OPEN and asks about the ACT, never about itself"; a fail-closed check must hold its wiring. Fail-open is the default; fail-closed derogation is a Governor decision. Source: [C] 2 · The laws › The hook surface — enforcing before the act.
- "Runtime hook-liveness is unprovable from inside a repository: hook-based enforcement is ARMED-as-configured at most", and unmatched routes are "declared UNARMED at the hook layer rather than assumed covered." "a session-scoped scheduler dies with the session and never counts as ARMED." Source: same; [A] 10 › L-A21 (portable mechanism: a fail-closed wiring gate that parses the hook configuration and asserts registration, guard existence, full matcher coverage and that no hook command discards its output; a guard drill run from a directory that is not the guard's home; a schedule clause citing a server-side schedule).
- Root `CLAUDE.md`: "SessionStart is informational. Writer hooks cover named routes, not every possible external mutation. CI configuration is not proof a CI run passed." Repository hooks may not run in Project threads or multi-repo cloud sessions; use one single-repository session. Same in `builder/INTEGRATIONS.md` and `START_HERE.md` › Recovery and limits ("Stop loop relief records BLOCKED and is not a passing verification.").
- `Claude_Setup_Playbook.md`: "a configured file is not proof of liveness." `.claude/rules/builder-ux.md`: an evidence validator "cannot decide elegance or user comprehension." [M] `M/06_ENFORCEMENT_AND_GATES.md` › 2: the machine "may require the review artifact. It may not claim the judgment itself."
- The hooks check source integrity, orientation receipt and proof presence/freshness. No hook in the repository inspects pixels, contrast, targets or copy.

### 3.5 Recorded status (configured / executed / live-validated / blocked)

| Item | State recorded in the repository |
|---|---|
| Hooks configured | Yes (3.1) |
| SessionStart fired | Live-validated in a fresh single-repo session, exit 0 with injected report ([W] `builder/evidence/live/step7_9_fresh_session_report.md`) |
| PreToolUse | Live: allow path only (Bash, MCP). Deny path and `onFailure` behaviour not exercised live |
| Stop drill | Live-validated: exit 2 on ACTIVE work with missing proof, exit 0 after an honest BLOCKED record. Loop relief not exercised live |
| builder-reviewer | Live-invoked once (`step6_builder_reviewer_report.md`) |
| Browser fixture | Executed PASS in the activation session (`step4_browser.txt`; later run adds "error state hides success status") |
| CI | Configured; never ran: "No CI ran: GitHub Actions minutes are unpaid" (GOV-2026-10-25-MG) |
| Reference design review | PENDING (`builder/REFERENCE_REVIEW.json`) |

---

## 4. Report templates — required sections

All under `M/templates/`; product-local placement `ux/` per [M] `M/05_UX_ARTIFACT_CONTRACTS.md` › 1 (`UX_MANIFEST.yaml`, `UX_FOUNDATION.md`, `INTERFACE_FOUNDATION.md`, `reference/interface/`, per-route contract folder, `wireframes/`, `diagnosis/UX_DIAGNOSIS_<date>.md`, `verification/UX_VERIFICATION_<milestone>.md`). "Do not mass-create empty artifacts."

- **`UX_VERIFICATION_REPORT.md`** — header: Product, Build/commit, Date, Verifier, Module. Sections: 1 Scope; 2 SEEN; 3 NOT SEEN; 4 verdict per J (J | Verdict | Evidence); 5 Intended UX vs actual; 6 Intended Interface vs actual; 7 Rendered evidence (J | Surface/state | Viewport/device | Artifact); 8 Interface review matrix (ten dimensions, Verdict, Evidence); 9 Heuristics; 10 Accessibility split MACHINE / MANUAL / UNKNOWN; 11 Incumbent/platform comparison; 12 User evidence, if run; 13 Findings (ID | Class | Severity | Evidence | Consequence | Route); 14 Final verdict `VERIFIED / DEFECT / UNKNOWN`. `M/04_VERIFY_MODE.md` › Report artifact lists the same contents.
- **`UX_DIAGNOSIS_REPORT.md`** — header: Product, Build, Date, Scope, Module. 1 SEEN; 2 NOT SEEN; 3 reconstruction of the actual route; 4 Material findings (ID | Primary class | Contributing class | Severity | Evidence | Consequence | Route); 5 Interface review (Hierarchy, Legibility, Density, Affordance, Components/icons, State clarity, Responsive behavior); 6 Routing summary; 7 Diagnostic exit. "Do not redesign in this report."
- **`INTERFACE_REFERENCE_SET.md`** — Product, Version, Status `DRAFT / ACCEPTED / SUPERSEDED`, Interface Foundation link; reference surfaces (ID | Surface/state | Viewport | Why selected | Artifact), default maximum 1–3; grammar demonstrated (typography, spacing, navigation, buttons/controls, list/card anatomy, iconography, color, state treatment, responsive intent, brand expression); ten-dimension review matrix; Acceptance (direction, Governor/authority, date); stop rule.
- **`INTERFACE_FOUNDATION.md`** — 1 Interface proposition; 2 Target platforms/form factors; 3 Typography (functional face, expressive face, roles table, scaling, forbidden/limited expressive use); 4 Spacing/layout rhythm (base unit, rhythm, compact side padding, section separation, max content width); 5 Color roles (Role | Token | Purpose | Contrast requirement); 6 Iconography; 7 Component grammar (navigation, buttons, lists, cards, fields, chips/filters, sheets/dialogs/menus, search, status/banners, media); 8 Density rules; 9 State grammar table; 10 Responsive (compact, medium, expanded); 11 Accessibility baseline (contrast, target size, text scaling, focus, semantics, non-color status); 12 Token/implementation source; 13 Accepted reference surfaces; 14 UNKNOWN/deferred.
- **`J*_CONTRACT.md`** — header: J ID, Name, Criticality, Status. Part A (UX, frozen at `UX_READY`): 1 Actor/situation/job; 2 Legitimate entry; 3 Terminal success/cancellation; 4 Consequence chain; 5 Benchmark decision table; 6 Primary flow; 7 Major states/recovery; 8 Navigation semantics; 9 Screen responsibilities; 10 Wireframe evidence; 11 UX preflight (Nielsen, platform, accessibility structure, density, blocking unknowns); 12 UX verdict. Part B (Interface; may not silently edit A): 13 Handoff lock; 14 Visual hierarchy table; 15 Component mapping table; 16 Foundation inheritance/deviations; 17 Critical visual states; 18 Responsive notes; 19 Reference evidence; 20 Interface accessibility preflight; 21 Fresh-eye review matrix; 22 Interface verdict.
- **`UX_FOUNDATION.md`** — interaction architecture only (navigation, persistent context, search/discovery, create model, Back/Close/Dismiss/Cancel, role switching, deep links, structural responsive IA); inherited platform grammar table; constraints; UNKNOWN; superseded. Visual rules belong in Interface Foundation.
- **`WIREFRAME_SET.md`** — surfaces table (Surface ID | Job | State | Entry | Primary action | Artifact); rules (low fidelity, representative labels/data, visible navigation, major states, no decorative polish, do not shrink text to fit); what it proves / does not prove; superseded.
- **`UX_MANIFEST.yaml`** — module id/version; product id, name, target platforms; foundation paths; interface reference set path/status; the active-J key; J registry entries (id, name, criticality, status, contract, wireframes, interface_references, last_verified_build, verification_report, deferred_reason, reopen_condition, superseded_by); legal statuses.
- **Audit report** (one committed file per audit): scope; exhibits consulted; promise table (promise, mechanism, rung, walked-by-resident, walked-by-founder); benchmark pairs; fixture replay results; screenshots; findings with severities; SEEN / NOT SEEN; ledger rows added. "A finding closes only by artifact, never by assertion." Source: [A] 4 · The report template.
