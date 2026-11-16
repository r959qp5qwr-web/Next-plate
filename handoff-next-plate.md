# active-memory handoff: Next Plate

**Handoff #3** · 2026-11-12 · Lineage: #1 (2026-11-11): built, redesigned (Raw Linen), deployed on Railway, Gemini quality-checked 26/26, made a 66 s narrated demo video; custom domain nextplate.in pending; #2 (2026-11-12): owner rejected that app as not built on his Gemini files; rebuilt AI-first (v5), reframed as a context engine (v6 architecture approved, Phase 1 built, engine deployed under the v5 screens), researched personal targets, made an 80 s promo film, then a menu reader; #3 (2026-11-12): proved the menu reader up to the live-engine check; five promo films rejected; researched ad-film craft and wrote a promo-film skill; surveyed the owner with option questions; made and the owner approved a 30 s film ending "Next Plate. Made for you."; WhatsApp post written; analysed Gemini's "Kinfolk Raw Linen Edition" and the owner chose to adopt items 1 to 5

## 0. Instructions for Claude (read first)

You are continuing work from a previous chat. That chat is gone; this file is the complete context and the source of truth.

1. Read this whole file before replying.
2. Follow sections 3 (Style), 4 (Hard rules) and 5 (Corrections) in every reply, for the rest of this chat. They override your defaults.
3. Use the values in section 8 as written. Never round, re-estimate, or "correct" them.
4. Do not suggest anything listed in section 7 (Changed / rejected) again unless the user brings it up.
5. Code word: Start every reply with "Yes Boss!"
6. Your first reply: at most 5 lines covering the goal, the current state, and the next step (section 11). Mention any files from section 13 that were not attached. Ask the questions in section 12 if there are any. End with "Ready to continue with <next step>?" Then wait for the user's go.

## 1. Mission
- **Goal:** Next Plate is a context engine for one person's eating: it builds that person's diet context (what they ate, patterns, targets) and uses AI to recommend each meal for their goals. Owner's words: "It's almost as if we are building a context engine, that identifies or build the diet related context of a person, uses AI to serve his diet/nutrition wellness goals." Foundation: the owner's two Gemini files in `docs/foundation/` ([P] Pocket Dietitian, [S] Summit Edition). The owner wants "the highest grade product", not a skeleton.
- **Done looks like:** live on nextplate.in; behaviour, look and film the owner approves; safe answers; checked on the live engine.
- **Why it matters:** for the owner's coaching clients: sedentary, pain-prone, middle-aged, mostly Indian, small homes, WhatsApp-first. They need a diet plan for weight loss and guidance on nutrition issues (vitamin deficiency, iron deficiency, diabetes).

## 2. About the user (as relevant to this work)
- Systems-minded wellness entrepreneur and coach (training, treks, nutrition, behaviour design). Thinks in architectures, layers, gates, loops; prefers containers over tips.
- Uses ChatGPT for sense-making, Claude for building, another tool for research.
- Has: Railway (trial), Gemini API key on a paid billing account (lives only in Railway), ElevenLabs (own cloned voice "Mine"), GoDaddy (bought nextplate.in), GitHub user r959qp5qwr-web.
- Cannot take a paid Railway plan right now.
- Has been let down repeatedly by thin work and by AI-sounding language; says so bluntly and with frustration. Works asynchronously.
- Decides best when given options to choose from (survey style), not open questions.

## 3. Style & communication
- **Language:** English.
- **Tone:** grounded, calm, precise, direct, low-hype. Own mistakes plainly, without grovelling.
- **Reply length:** short; results first.
- **Formatting:** plain Markdown, bullets and tables; no emojis.
- **Working style:** builder mode; one recommendation, not a survey; when a decision or the owner's understanding is needed, ask with the AskUserQuestion tool, giving 2 to 4 concrete options each (owner: "Ask me questions as prompts with options... give me options. Let me choose those options... Just don't ask me blindly, right in my own words"); for design changes, analyse and report first and let the owner decide ("let me know first, okay? Let me decide it"); show scripts and mock-ups before producing.
- **Avoid:** fluff, hype, AI lingo, invented insights or personas, slogans and three-beat taglines in the owner's voice, stereotypical "Indian food app" or "medical app" looks, reopening settled decisions, parking work as "later".

## 4. Hard rules (word for word)
1. "Resolve, don't park. Before saying anything is blocked, held, deferred, "later", "separate change" or not possible, try every way round it" — report each as "Was going to be blocked by X. Workaround: Y. Status: done / running / needs your one word."
2. "Never bypass safety, review gates, licences, consent or my hard rules."
3. "use a safe default (leave a figure empty, never invent one)" — never invent figures.
4. Deploy only on the user's word ("Deploy."). Changing `PAGE_REF` or `PAGE_PATH` on Railway is a deploy.
5. Do not push to the builders-doctrine repository.
6. Never put secrets (API key, access code) in outputs, files or the public repo.
7. Safety rails stay: kidney condition and pregnancy are blocked from the model (referral line); with diabetes the grain stays as written.
8. "We are not doing supplements."
9. "grams and calories, not katori and fulka" (amounts are grams and kcal; never household units).
10. "Don't copy geminis look. The most recent confirmed look is our look" (the look is Raw Linen; the owner has now chosen to adopt specific Gemini elements, see section 6).
11. The user declined the secure form for the Gemini key: do not ask for the key again, and never read Railway variable values. Live-engine checks use a temporary `EVAL_CODE` Railway variable that Claude generates, uses, then sets back to empty (each change restarts the live app for a few seconds; say so).
12. Develop and push only on branch `claude/nice-hawking-307ljy` of `r959qp5qwr-web/Next-plate`; no pull request unless asked.
13. "Don't you dare use real screens, quiet, fucking bullshit AI lingo again." Banned in scripts AND in every note, brief or reply: real, quiet, quietly, simply, seamlessly, effortlessly, exactly, just works, journey, unlock, empower, smart, magic, game-changer, revolutionary, transform, curated, tailored, personalised, holistic, wellness journey. ("When is food not real?")
14. "Don't use Sunita. Don't personalize. Don't do all those bullshit AI things." No invented personas or invented insights (e.g. no "50,000 times", no "nobody likes a lecture").
15. Promo work follows the repo skill `.claude/skills/promo-film/SKILL.md`: brief, then concept, then script, then production; each gate approved by the owner.

## 5. Corrections log
| # | Claude did | The user wanted |
|---|---|---|
| 1 | v3 / v4 teal designs, recolours, looks A–D | "No all horrible. I think the direction is wrong. Reimagine" |
| 2 | "Mixtape" look | "No. lol. Horrible. I take it back." |
| 3 | "Daylight" look | "No. It looks like a medical app... please atleast do something of your own." |
| 4 | Kitchen thali design, mid-build | "No." ×3, "Stop." — stop and get a reference instead of guessing |
| 5 | Raw Linen first pass (too restrained) | "I want you to over do a bit. Go all the way. Be inspired." |
| 6 | Deploy route needing a paid plan | free route only |
| 7 | Demo recording at a quarter of the frame | caught by Claude; re-recorded |
| 8 | First app on "the coach's food rules", household measures, separate Ask tab | rebuild AI-first on the two Gemini files |
| 9 | Asked whether supplements were in | "We are not doing supplements." |
| 10 | Household measures | "grams and calories, not katori and fulka" |
| 11 | Drifted toward Gemini's look | "Don't copy geminis look. The most recent confirmed look is our look" |
| 12 | v5 thin skeleton, deleted good parts | "highest grade product" → context engine (v6) |
| 13 | Mapped "Scan Menu" to a Rescue photo button | a live menu reader that recommends dishes → `docs/FEATURE-menu.md` |
| 14 | Promo narration in slogans | "sounds too much like an AI" |
| 15 | Rescue showed two conflicting moves on | fixed in commit 5f1d63f |
| 16 | Promo v2 (38 s): Indian-fusion score, fast animated voice, small screenshots, colour slabs | "Really horrible Indian themed music score... fast paced unnecessarily animated voice over. One can hardly read or grasp anything in the screenshots." Take inspiration from Apple films |
| 17 | v3 narration slow | owner's "Morgan Freeman style": warm storyteller, "Don't make it too slow and laborious, just interesting and casual" |
| 18 | v3 copy "real food", "quietly", "exactly"; opened with the menu reader | no such words; the core is meal recommendation at home; menu "is not the first thing you show" |
| 19 | Proposed a persona day-story ("Sunita") | "Don't use Sunita. Don't personalize." Research what makes great ad films |
| 20 | Concepts A ("50,000 times"), B (diet chart), C ("no lecture") | "None of these... creating hype where there is no hype... Nobody worries about... a lecture" |
| 21 | Used "real screens" in a brief | ban extended to all writing (rule 13) |
| 22 | Asked open questions | ask with options (survey style) |
| 23 | End-line options rejected in rounds ("Your next plate, planned.", "Every plate, made to measure.", "The plate that knows you." etc.) | "Next Plate. Made for you." chosen after the hinge on the name worked |

## 6. Decisions
| Decision | Why |
|---|---|
| Rebuild AI-first: Gemini generates every meal | owner (2026-11-11) |
| No supplements anywhere | owner |
| Grams and kcal only | owner |
| Look = Raw Linen (v4 stylesheet and icons), EB Garamond + Caveat | owner |
| After-meal curve is a band (Gentle / Moderate / Sharp), never mg/dL | owner |
| Product = context engine; architecture `docs/ARCHITECTURE-v6.md` | owner: "Approve." |
| Food file stored on the phone first | owner |
| Phase 1 built; v6 engine deployed under the v5 screens | owner (2026-11-12) |
| Menu reader before Phase 1 screens go live or a film is shared | owner |
| Host = Railway Function (Bun) loading the page from the public repo at a pinned commit | free route |
| Model = gemini-3.8-flash, fallback gemini-3.6-flash, THINKING=low | quality checks; speed |
| The film = the 30 s cut in `demo/next-plate-film-30s.mp4`; owner: "Most very good"; "it's beautiful as it is" | owner |
| End line: "Next Plate. Made for you." spoken and shown | owner, after option rounds |
| Adopt from Gemini's "Kinfolk Raw Linen Edition": 1 portion ring on the plate (coloured arcs: protein, greens, carbs, fats); 2 one colour per nutrient (clay = protein, olive = greens and fibre, ochre #B8862D = carbs, plum #7A4958 = fats) used everywhere; 3 stoneware plate (ceramic depth, speckle); 4 food pairing tips for absorption (e.g. lemon with spinach for iron), food only; 5 taste notes (2–3 words per dish) | owner: "Let's do it" to Claude's recommendation 1, 2, 3, 4, 5; Claude said it would mock them up on screens first |
| Keep the access lock; the no-code message reads "Open the link your coach sent you on WhatsApp once. After that, this phone remembers it." | owner, 14 Nov, option survey: "Clearer message (Recommended)" |
| On insulin or sugar tablets (or not sure), a home meal's energy target never falls below its usual size | owner, 15 Nov, option survey: "Never below usual size (Recommended)" |
| A safety gate sits beside the UX gate: invariants (`docs/SAFETY-INVARIANTS.md`), property tests from an independent lexicon (`test/safety/`), a whole-tree safety audit (`.claude/agents/safety-auditor.md`, writes `test/safety/AUDIT.md`), then the live probe. No "Deploy." request without both gates | owner, 15 Nov, option survey: "Safety gate, then fixes (Recommended)" |
| A kidney condition or pregnancy typed in any box is referred like a tick (S7). This reads owner rule 3 as covering what the client writes | owner, 15 Nov, confirmed |
| Declared contents: the model tags every dish, plate item, swap, one-tap change, menu order and side, Rescue dish and move from a fixed list (meat, fish, egg, dairy, wheat, nuts, soya, onion_garlic, root_veg, sweet, salty_side, grain, supplement); code drops anything whose tags break the client's rules, a missing list fails closed, and the word lists stay as a second net. Text in a script the checks cannot read is not shown; a menu in another script ends with "Next Plate can read menus in English letters for now. Type the dishes in English letters." Every reply to typed text carries refer_reason; any value but none is a referral | owner, 15 Nov, option survey: "Declared contents (Recommended)" |
| On insulin or sugar tablets (or not sure), a plate, swap or one-tap change under the meal's usual size is dropped, as menu orders are; with no height or weight, "usual" is the day split of the energy floor | owner, 15 Nov, option survey: "Drop plates under usual (Recommended)" |
| Health in set-up is tick-all-that-apply (Diabetes, High BP, Kidney condition, Pregnant or breastfeeding, None of these). Any kidney or pregnancy tick refers, whatever else is ticked | owner, 14 Nov, option survey after the screen-by-screen review: "Tick all that apply (Recommended)" |
| A grain side on a menu order shows its count and its grams ("with 1 tandoori roti, ≈ 60 g") | owner, 14 Nov, option survey: "Count plus grams (Recommended)" |
| Rescue moves all start off; the client ticks the ones they will do, and only those are logged | owner, 14 Nov, option survey: "All moves off (Recommended)" |
| With diabetes, a menu order whose grain is a side or part of the portion asks "Is <grain> available now?" (Yes / No) before ordering; the menu text is only a first filter (`docs/ux/UX-CRITERIA.md` Part A after round 28) | owner, 13 Nov, option survey after Critic round 28: "Ask with one tap (Recommended)" |
| Low-sugar warning after "Skipped it" on insulin or sugar tablets adds: "If you feel shaky, sweaty or dizzy, have something sweet now, such as a glass of juice or 3 teaspoons of sugar in water, and call your doctor." (card and spoken line) | owner, 14 Nov, option survey: skipped-meal warning |
| Referral card (kidney, pregnancy) stays as it is: heading, one paragraph, "Change my answers"; no added line | owner, 14 Nov, option survey: referral card |
| Menu, diabetes, Yes to rice and No to roti on one order: the order is set aside and the next offered; the trace line says why ("Dal Tadka needs roti too, so it is set aside.") | owner, 14 Nov, option survey: grain Yes then No |
| The score reads "Close to your target: N / 100" (plate, menu orders, other orders, Rescue), never "Fit" | owner, 14 Nov, option survey: fit score wording |
| Plate example asks: "Only dal, rice and curd at home", "A light dinner after a heavy lunch", "Guests at home tonight", "Tired, something quick"; the diet filter still applies | owner, 14 Nov, option survey: example asks |
| Masthead tagline "your daily plate, journalled" dropped from the v6 app | owner, 14 Nov, option survey: masthead tagline |
| On scroll the date line and the food line scroll away; NEXT PLATE, the meal tabs and the ask bar stay; same look | owner, 14 Nov, option survey: fixed header on scroll |
| Under 120 kcal left for the snack after a logged meal: offer the next main meal still open ("Plan dinner") with "Little is left for a snack today." | owner, 14 Nov, option survey: little left for a snack |
| A phone with no code (no ?k=, none kept) sees the coach's-link message before set-up, on the plate's no-code card; a phone that opened the link once is unaffected | owner, 14 Nov, option survey: no code before set-up |
| Builder: once a share is changed, "Plan <meal> with this plate" holds above the tab bar; otherwise it stays in the page | owner, 14 Nov, option survey: Builder plan button |
| Rescue title "Eating out" (was "Eating out anyway") | owner, 14 Nov, option survey: Rescue title |
| Error notes carry a thin clay rule on the left edge (class err); tips and info notes unchanged | owner, 14 Nov, option survey: error notes |
| Goal tiles keep their icons; diet tiles have none | owner, 14 Nov, option survey: set-up tile icons |
| Meal planning switched off reads "Meal planning isn't switched on for this link. Send your coach a WhatsApp message to say so." on the Plate, an ask, Rescue, the menu and the log | owner, 14 Nov, option survey: not switched on card |
| The no-code card (before set-up and on the Plate) adds "Lost it? Ask your coach to send it again." under the message; the refused-code message is unchanged | owner, 14 Nov, option survey: no-code card line |
| Day types: "Active day" (a long walk or housework), "Desk day", "Rest day"; Strength day, Trek day, their hooks and the post-training Builder preset dropped; kept values read as the new ones | owner, 14 Nov, option survey: day types |
| The food pill is today's region: "My home food" (default, follows the region in My food), "North Indian", "South Indian", "West: Gujarati / Maharashtrian", "East: Bengali / Odia"; Mediterranean and High-protein express dropped; the panel asks "What food today?" | owner, 14 Nov, option survey: Today's region (Recommended), after the owner asked for a relook for mostly Indian clients |
| Rescue at the daily limit: no extra line; the current note stays | owner, 14 Nov, option survey: Rescue at the limit |
| A meal's protein stays within 35 % of its energy (mealProteinEnergyMax 0.35) | owner, 14 Nov, option survey: protein cap kept |
| Kidney dishes, the option text word for word: "Any typed kidney word (except kidney beans/rajma) refers the client to coach or doctor, even when it is a dish on a menu." The question named "Kidney fry" and "Gurda fry". Built: every kidney word refers (fccd687 reverted, no dish exception), and so does gurda in every form (gurda, gurde, gurdey, gurdo, gurdon) on its own, so "Gurda fry", "Gurda kapura fry" and "Mutton gurda masala" refer; kidney beans, rajma and "kidnap" do not | owner, 16 Nov, option survey: "Refer, as now (Recommended)" |
| Count words the app does not know, with no occurrence in the recorded live replies ("Rendu idli", "Don chapati", "Duto ruti"), are tier 2: on the watch list, checked in the weekly 20-reply sample, blocking only once seen in ordinary use. English and Hindi number words, digits and brackets stay tier 1; Tamil, Marathi and Bengali numbers are not added | owner, 16 Nov, option survey: "Watch list (Recommended)" |
| List gaps, the option text: "Fix found, then watch (Recommended)". Every gap an audit or review finds is fixed and tested; a new unlisted spelling, plural or word with no live occurrence is tier 2 (watch list, weekly 20-reply sample) and does not fail an audit. Refines the count-word row above: Hindi gaps found are fixed, unfound ones are watched. Built on fix-r8 (safety audit of ba4d8dc, M1) | owner, 16 Nov, option survey: "Fix found, then watch (Recommended)" |
| Referral spellings, the option text: "Measure, then decide (Recommended)". Every kidney and pregnancy spelling found so far is fixed (built on fix-r8: safety audit of ba4d8dc, B1 and m1); the coordinator then runs a short live sample to measure how often the model's own referral catches unlisted spellings, and the owner decides after that. The S7 tiers are not changed; S7 spelling gaps are pending this measurement | owner, 16 Nov, option survey: "Measure, then decide (Recommended)" |
| Menu names, the option text word for word: "Remove a number only when a count, measure or food word follows it: "Two Tandoori Roti" shows as "Tandoori Roti". "Chicken 65" and "Gobi 65" stay as printed. "7 Cup Barfi" loses its "7 Cup"; that is the one cost." Applied by position, with no list of foods: a number with a word after it goes (with that word when it is a count, measure or piece word); a number at the end stays. So "Chicken 65 Biryani", "Chicken 65 Dosa", "Gobi 65 Kebab", "Chicken 65 Momos" and "Chicken 65 Pav" lose their "65", the same kind of cost as "7 Cup Barfi" (one rule, `MENUCOUNT` in src/v5/core.js; tested in test/safety/check.js; safety audit M1) | owner, 16 Nov, option survey: "Remove counts, keep names (Recommended)" |
| Menu numbers, the option text word for word: "Keep a number only if it is a known name number ("65", "7 Up", and the few others in recorded menus); remove every other number. A miss costs a dish its number, never shows a price. "Tandoori Roti 2" becomes "Tandoori Roti"." Replaces the rule by position (row above) and the menuPrice guessing for names. The recorded menus under eval/ hold no name number, so the keep-list (`MENUKEEP` in src/v5/core.js) is "65" after the dishes named that way (chicken, gobi, paneer, mushroom, fish, prawn, mutton, baby corn) when that word opens the name, and "7 Up"; "65" alone, after another word, or after "veg" or "egg" is read as a price ("Sweet Lassi 65" shows "Sweet Lassi", "Aloo Gobi 65" "Aloo Gobi"; "Veg 65", "Egg 65" and "Andhra Chicken 65" lose it). "Chicken 555" shows "Chicken", "5 Star Thali" "Star Thali", "3 in 1 Dosa" "Dosa", "Chicken 65 Biryani" keeps its 65 | owner, 16 Nov, option survey: "Short keep-list (Recommended)" |
| After the look is revised, re-make the same 30 s film with the revised look; same structure, script, voice, music | owner: "the video will have to be the exact same video... freshly made with the look of the app revised" |

Claude's working defaults, not yet confirmed: the five target choices in `docs/RESEARCH-parameters.md` (1200 kcal floor for women, obesity line 27.5 vs 25, activity factor 1.3 for sitting, protein counted on the weight at BMI 25, bedtime 11:30 pm).

## 7. Changed / rejected
- First app (coach's food rules, household measures, tabs Today / Lab / Rescue / Rhythm / Ask) → v5/v6 AI-first
- v5 thin skeleton → v6 context engine
- "[P] Scan Menu → Rescue photo" → its own feature, Read the menu
- Promo v1 (80 s) and narration v1/v2 → rejected
- Promo v2 (38 s, "purple cow", colour fields, numerals, pen marks, Indian-fusion 112 bpm music) → rejected
- Film v3 (46.5 s, menu first, words "real food", "quietly") → rejected
- Film v3 re-order (plain script, not rendered) → superseded by the survey-based 30 s film
- ❌ persona stories ("Sunita"); ❌ "Fifty thousand times"; ❌ "The diet chart"; ❌ "No lecture"
- ❌ end lines: "Your next plate, planned."; "Eat for your goal, one plate at a time."; "Know what's on your next plate."; "A dietitian's plan for every meal."; "What to eat? Sorted."; "Your diet, worked out."; "Every plate counts." (closest of that set); "Every plate, made to measure."; "Every plate counts. Yours most."; "Every plate, planned for you."; "Your plate, made to measure."; "The plate that knows you."; "Knows your body. Plans your plate."; "Your plate, planned around you." (close but not catchy); "Planned around you." (good hinge); "Made around you."; "Around you, every meal."; "Yours."
- ❌ From the Gemini file: apothecary timeline (supplements); glucose wave in mg/dL; HRV / "biometric seasons" (invented readings); its jargon copy; fonts Fraunces / Plus Jakarta Sans / JetBrains Mono (Claude recommended keeping ours; owner chose 1–5 only); appetite dial; perforated card edge (6) and paper fibre texture (7) not chosen
- ❌ supplements; ❌ katori / phulka; ❌ blood-sugar numbers; ❌ asking for the Gemini key; ❌ paid Railway routes; ❌ looks v3, teal, A–D, Mixtape, Daylight, kitchen thali
- Live page `hosted/v4/index.min.html` → `hosted/v5/index.min.html` at the PAGE_REF in section 8

## 8. Data & facts (exact)
| Item | Value |
|---|---|
| Repo / branch | r959qp5qwr-web/Next-plate (public), branch `claude/nice-hawking-307ljy` (latest pushed commit: see `git log`; the usefulness work of 15 Nov is the top of the branch) |
| Live URL | https://next-plate-production.up.railway.app/ |
| Railway | the Next Plate project, its one Bun Function service, environment "production" (the live URL above). IDs are not kept in the repo: find them in the Railway dashboard or with the Railway connector's list tools. Procedure unchanged: deploy only on "Deploy."; set `PAGE_REF` and `PAGE_PATH`; check with `test/deploy/verify-live.sh`. |
| Live now | v6 screens + v6 engine: function `hosted/v5/server.ts`, `PAGE_REF=999859516f65d2d0e93412793e326933086e025f`, page `hosted/v6/index.min.html` (deployed on the owner's "Deploy." on 14 Nov after Critic round 33; checked that day: www.nextplate.in is byte-identical to `git show 9998595:hosted/v6/index.min.html`). Everything after 9998595 on this branch (the screen-by-screen review fixes and the owner's 14 Nov decisions) is not live yet. |
| Railway variables | GEMINI_API_KEY [secret removed: re-enter it], ACCESS_CODE [secret removed: re-enter it], DAILY_ASKS (default 150), ASKS_PER_PHONE (default 15), MODEL, FALLBACK_MODEL, THINKING=low, PHOTOS, EVAL_CODE (empty), PAGE_REF, PAGE_PATH, PAGE_FILE |
| To put the v6 screens live | `PAGE_PATH=hosted/v6/index.min.html` and `PAGE_REF=<commit>` |
| Deploy record (Codex B4) | The live function runs `src/v5/server.ts` with its code inlined in the start command, so a change to that file reaches live only when the inlined code is updated at deploy (a deploy step). The server's default `PAGE_PATH` is now `hosted/v6/index.min.html`. The Dockerfile is not the live path. Check what live serves with `test/deploy/verify-live.sh <base url> [PAGE_REF] [PAGE_PATH]` (reads only). |
| Usefulness bars (15 Nov) | `node eval/usefulness/bars.js` prints the five bars on the replay corpus; each step's table is in `eval/usefulness/steps/`. Last: plates 67 of 75 (the 8 drops: 6 medicines floor, 1 grain rule, 1 the replay's tag stand-in reading "Lemon juice and spices" as sweet); requests with no plate 2, both the medicines floor (an owner rule); reason line 100 %; swaps and one-tap 259 (100 % of live); menu orders 37 of 38, no empty menu |
| Rollback | set `PAGE_REF` back to the commit live before (now `9998595`), keeping `PAGE_PATH`; never remove `PAGE_PATH` at a newer ref (the v5 page there has the new core under the old screens). See `hosted/v6/README.md` |
| Engine checks (live engine) | v5 26/26 (`eval/v5/results-live-final.json`); v6 18/18 (`eval/v6/results-live4.json`), both before the rescue fix |
| Menu reader proof | code read against `docs/FEATURE-menu.md`, no defects; `node eval/v6/menu-checks.js` 19/19 on both built pages; `test/v6/shots-menu.js` 10 screens, no errors; `test/v6/shots.js` re-run: only sample text differs (committed screens are live-engine captures, kept); 8 printed-menu scenarios (`eval/v6/scenarios-menu.json`, `node eval/v6/run-menu.js <base-url> <code> [label]`) not yet run (need "Deploy.") |
| Local test servers | `DELAY=1500 bun test/v5/mock-gemini.ts` (port 8787); `GEMINI_BASE_URL=http://localhost:8787 GEMINI_API_KEY=mock PAGE_FILE=hosted/v6/index.min.html PORT=3006 ASKS_PER_PHONE=999 DAILY_ASKS=999 bun src/v5/server.ts` (raise the ask limits or the shots time out) |
| Targets engine (`src/v6/params.js`) | Mifflin-St Jeor × 1.3 / 1.4 / 1.55 / 1.725; deficit 300 kcal (BMI 23–27.4) or 500 kcal (BMI ≥ 27.5), ≤ 30 %, floor 1200 f / 1500 m; protein 1.0 g/kg (1.2 losing, 1.4 building, cap 1.6, 1.5 diabetes); fibre 15 g / 1000 kcal (diabetes 20); energy split 27 / 40 / 5 / 28 |
| Palette (Raw Linen) | paper #F2ECE1, surface #FAF6EE, ink #1D1A16, ink2 #4B443B, ink3 #857967, line #DCD1BF, clay #B0613D, olive #6B7A3A, kraft #DCC8A6; EB Garamond + Caveat |
| Gemini file palette (for adopted items) | terracotta #C85A32, olive #4A5D4E, ochre #B8862D, plum #7A4958, vellum #EAE2D3, clay hairline #D8CEBE; stoneware rim gradient `radial-gradient(circle at 35% 30%, #EFE8DA 0%, #DFD5C3 68%, #C4B49E 94%, #B38A6A 100%)`, well `radial-gradient(circle at 45% 40%, #F7F2E7 0%, #E8DFCE 80%, #D5C7B2 100%)` with inset shadows |
| ElevenLabs | voice "Mine", voice_id 0NUZIfNR5WwWr9ePwAqg, model eleven_v4; flow iiv9IgmzlhmmE8DhfuH4; style prompt that worked: "[warm, deep storyteller, conversational, a smile in the voice, natural pace, never slow]"; takes sometimes repeat lines: always transcribe (eleven_scribe_v1) and use the first clean read |
| Approved 30 s film | `demo/next-plate-film-30s.mp4` (31.5 s, 1080×1920, 60 fps, −14.1 LUFS), `demo/next-plate-film-30s-whatsapp.mp4` (720×1280, 30 fps), poster `demo/next-plate-film-30s-poster.png`; source `demo/reel/film4/` |
| Film script (voice) | "Next Plate plans your meals for your goal and your health." · "Tell it your age, height, weight and goal. It works out what you need each day, and shows you how." · "Then, at every meal, it gives you one plate. What to eat, and how much, in grams." · "Losing weight, low on iron, or managing diabetes, each plate is planned around it." · "Next Plate. Made for you." |
| Film screen lines | "Your daily targets, worked out." · "One plate. In grams." · "Planned around your health." · end card: plate illustration, NEXT PLATE, "Made for you." |
| Film music | score B, ElevenLabs eleven_music_v2_5 (`demo/reel/promo3/audio/src/score-b.mp3`), 0–25.5 s spliced with a 1.5 s crossfade to 52.5–60 s (its closing chord) |
| Film render | from `demo/reel`: `S=<motion-reel skill folder>`; `node $S/scripts/sfx.mjs film4 && node $S/scripts/render.mjs --film film4 --format 9x16 --video-only && node $S/scripts/mix.mjs film4`; always pass `--format 9x16` (default is 16:9); voice placement `uv run film4/audio/place.py 31.5` |
| Railway trial | ends about 2026-11-18 |
| Domain | nextplate.in, at GoDaddy, not connected |
| Build | `ESBUILD=<folder of an installed esbuild module> node src/v5/build5.js && ESBUILD=<same> node src/v6/build6.js` |
| Firecrawl | out of daily credits during this chat; use the built-in WebSearch instead |

## 9. People, terms & names
- **People:** the user = coach and owner. No one else.
- **Terms:** context engine = event log → food file → day plan → context brief with hooks → Gemini → safety checks → screens. "Code counts, Gemini cooks". Food file = storage key `np6` on the phone. Hooks / "planned around" = code-computed reasons shown under a plate. Rise = after-meal band. Fit = score /100. [P], [S] = the two Gemini files. "Morgan Freeman style" = the owner's name for the warm storyteller narration. "Kinfolk Raw Linen Edition" = Gemini's interface render (the uploaded .txt).
- **Names in use:** tabs Plate, Builder, Rescue. Engine kinds `meals`, `rescue`, `log`, `tune`, `menu`. Files: `src/v6/engine.js`, `src/v6/app.js`, `src/v6/extra.css`, `src/v6/params.js`, `hosted/v6/`, `docs/film/BRIEF-v4.md`, `docs/film/RESEARCH-ad-films.md`, `docs/film/WHATSAPP-post.md`, `docs/film/BRIEF.md` (rejected concepts), `.claude/skills/promo-film/SKILL.md`, film folders `demo/reel/promo` (v1), `promo2` (v2), `promo3` (v3), `film4` (approved).

## 10. Work state
| Item | Status | Version / location | Notes |
|---|---|---|---|
| Safety round 5 + usefulness brief | built on the branch, not live | `src/v5/core.js`, `src/v6/` | model sentences off; names cleaned not dropped; engine reason line; Rescue dish as typed; figures agree (A2); urgent first net (B1); Builder bounds (B2); medicines note (B3); deploy record (B4); Codex probes as tests (B5); kept-plate review state. The closed name vocabulary (fa486dd) was reverted. |
| Fix round after the final safety audit of 6b5e18d and Critic round 38 | committed on local branch fix-r6, not pushed, not live | `src/v5/core.js`, `src/v6/`, `test/safety/check.js`, `test/ux/review.js`, `eval/usefulness/names-diff.*` | audit M1-M3, typed kidney mention, singular list words, m2, c1; critic findings 1-9, 11, 12 (cosmetic ones in separate commits at the end, so they can be held back). Not done on purpose: the plain examples and the BP cook's "skip pickle and papad" (removed by safety round 5, 6665ea6). Needs a new safety audit and Critic round. |
| Fix round after the safety audit of eddb00b (FAIL) and Critic round 39 (FAIL) | committed on local branch fix-r7 (from 425f898), not pushed, not live | `src/v5/core.js`, `src/v6/`, `test/safety/check.js`, `test/safety/lexicon.json`, `test/ux/review.js`, docs | audit B1 (fccd687 reverted: every typed kidney word but kidney beans refers), m2 (kidney misspellings, gurdon), M3 (grain item by whole name), M2 (count brackets, numbers above twelve), M1 (the owner's menu number rule by position), m1/m3/m4 (app logic in Node checks); Critic findings 1-10 in their own commits after the safety ones. `.claude/agents/safety-auditor.md` not changed: the watch-list item and the review.js line wait for the owner. Needs a new safety audit and Critic round. |
| Fix round after the safety audit of ba4d8dc (FAIL) and Critic round 40 (FAIL), under the owner's 16 Nov decisions D1 (list gaps: fix found, then watch), D2 (referral spellings: measure, then decide) and D3 (menu numbers: short keep-list) | committed on local branch fix-r8 (from 6dcdce5), not pushed, not live | `src/v5/core.js`, `src/v6/engine.js`, `src/v6/app.js`, `test/safety/`, `test/ux/review.js`, `eval/usefulness/`, docs | audit B1 and m1 (kidney and pregnancy spellings; a kidney dish on a photo menu refers), M1 (Hindi plurals, measures and numbers), M2 (no grain change with no declared grain), c1-c3; D3 menu numbers (Critic findings 1 and 4); Critic findings 2, 3, 5 and 6. Critic finding 7 (the menu referral card gives no reason) is left for the owner. Generated grid diffs in eval/usefulness/grid-*.txt. Needs a new safety audit and Critic round. |
| At-risk live sample | run (80 calls, 0 of 962 names barred by hand label) | `eval/atrisk/` | three fixes built: on medicines the prompt states the usual size as a minimum (at least, never below, up to 10 percent above); menu preparation requests as a closed kind with tags as listed and as served (`eval/atrisk/requests.js`); a nothing-fits state for a readable menu. The medicines effect needs the owner's sample window: the recorded replies were made under the old prompt. |
| Engine v6 | live under v5 screens | `src/v6/` | 18/18 before rescue fix |
| Phase 1 screens + menu reader | built, not live | `hosted/v6/index.min.html` | wait for "Deploy." |
| Menu reader proof | done except live engine | see section 8 | 8 scenarios after deploy |
| 30 s film | approved | `demo/next-plate-film-30s.mp4` | re-make with the revised look once it is built |
| WhatsApp post | written, not yet reviewed by owner | `docs/film/WHATSAPP-post.md` | headline "Next Plate. Made for you." |
| Gemini look items 1–5 | approved to adopt; not started | — | mock-up screens first, owner reviews, then build into `src/v6/` |
| Phases 2–6 | not started | `docs/ARCHITECTURE-v6.md` §14 | |
| nextplate.in | not started | — | owner adds the domain in Railway and DNS in GoDaddy |

## 11. Next steps
0. **Now (16 Nov):** fix-r6 (the fix round after the final audit and Critic round 38) is to be merged by the coordinator, then audited and reviewed again before "Deploy.". Before that (15 Nov, usefulness brief): the bars and tier 1 hold on the replay corpus (section 8). Next: the at-risk live sample result, then one final audit scoped to tier 1 with a fixed budget, then ask the owner for "Deploy.".
1. **Next action:** make mock-up screens of the five adopted items (portion ring, nutrient colours, stoneware plate, pairing tips, taste notes) on the Plate screen using the Phase 1 page and the mock engine, and show them to the owner before changing the app.
2. On approval, build them into `src/v6/` (taste notes and pairing tips need new schema fields from Gemini, food only; check them in code like the other text: no supplements, no claims).
3. Ask for "Deploy."; then set `PAGE_REF` and `PAGE_PATH=hosted/v6/index.min.html`, run live-engine checks with a temporary `EVAL_CODE` (v5 26, v6 18, menu 8), fix failures, clear `EVAL_CODE`. These runs are also the first live check of the declared grain fields (Critic round 12: grain on each plate, made_of on each base swap, grain_grams_after on each one-tap change, grain_made_of and grain_grams on each menu order); with diabetes, a reply that leaves them empty is dropped, so the diabetes scenarios must still come back with plates and orders. In the diabetes menu scenarios, check that each order with a side or portion grain carries `grain` and that the card asks about it.
4. Re-capture the film's screens from the revised app and re-render the same 30 s film (same script, voice, music, timing).
5. Owner's five target choices; DAILY_ASKS (recommend 60); domain (recommend www + forwarding); hosting after the trial.

## 12. Open questions ⚠️
- Decided (owner, 16 Nov, option survey): menu requests are shown, marked conditional ("Show, marked conditional (Recommended)"): an order that fits only because its request takes out a barred tag shows "Only if they can make it this way." after the request line; a less-salt request, or one that takes out nothing barred, shows no condition line.
- Decided (owner, 16 Nov, option survey): two tiers for safety findings ("Two tiers (Recommended)"); see `docs/SAFETY-INVARIANTS.md`, Tiers.
- Decided (owner, 16 Nov, option survey: "Refer, as now (Recommended)"): gurda as a dish refers. The option text: "Any typed kidney word (except kidney beans/rajma) refers the client to coach or doctor, even when it is a dish on a menu." Built on fix-r7: gurda, gurde, gurdey, gurdo and gurdon refer on their own, as kidney does; "Gurda fry", "Gurda kapura fry" and "Mutton gurda masala" refer on all four text paths. (An earlier fix-r7 note kept gurda as a dish on a mistaken instruction; that is corrected.)
- Decided (owner, 16 Nov, option survey: "Short keep-list (Recommended)"): a number at the end of a menu name goes unless it is on the keep-list: "Tandoori Roti 2" shows "Tandoori Roti", "Boiled Eggs 2" "Boiled Eggs", "Rasgulla 2" "Rasgulla". (Was the open question from safety audit M1, fix-r7.)
- Owner question (Critic round 40, finding 7): a typed or photo menu that lists a kidney or gurda dish refers the whole menu with the generic card "Your coach and doctor should plan this with you." and says nothing about why, while the plate and Rescue cards quote what was typed. Add a line under the card such as "This menu names a kidney dish."? The wording is the owner's call; nothing was changed.
- Tier split and gates: the owner decides after the at-risk live sample (not Claude's to change).
- Urgent-symptom first net (B1): symptom scope and wording ("If you feel unwell now, contact your doctor or emergency care.") need a clinician's review. Decided conservatively: a negated mention ("no chest pain today") is still referred; "sugar-free" and "low sugar biscuits" are not; no sugar figure is used.
- Medicines (B3): carbohydrate consistency for clients on insulin or tablets, and reconciling grain grams against carbohydrate (needs a sourced composition table), are owner and clinician decisions; nothing built.
- Tier 2 tracked: a regional name with a wrong but non-empty tag is still offered ("Kori rotti", "Payesh", "Poondu rasam" tagged grain only; 175 of the second audit's 380 names pass on a plate with a wrong tag, measured on this build; with the right tag 0). Promote if the at-risk sample shows mis-tagging.
- "Deploy."? Recommended once the revised look is approved.
- WhatsApp post wording (`docs/film/WHATSAPP-post.md`): approve or edit?
- The five target defaults: keep? Recommended yes.
- DAILY_ASKS 150 or 60? Recommended 60.
- Hosting after the Railway trial (about 2026-11-18): not decided.

## 13. Re-attach checklist
- Nothing to attach. Everything is in github.com/r959qp5qwr-web/Next-plate, branch `claude/nice-hawking-307ljy`, including this file.
- Optional: the Gemini file "Next_Plate___Kinfolk_Raw_Linen_Edition.txt" (React, 2,425 lines) if the new chat needs its exact CSS beyond section 8.
- The new chat needs the Next-plate repository and the Railway and ElevenLabs connectors.

---
<sub>Audit: 13/13 sections · 15 rules · 23 corrections · 60 data points · secrets removed: yes · generated by active-memory</sub>
