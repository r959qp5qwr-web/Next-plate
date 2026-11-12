# active-memory handoff: Next Plate

**Handoff #2** · 2026-11-12 · Lineage: #1 (2026-11-11): built, redesigned (Raw Linen), deployed on Railway, Gemini quality-checked 26/26, made a 66 s narrated demo video; custom domain nextplate.in pending; #2 (2026-11-12): owner rejected that app as not built on his Gemini files; rebuilt AI-first (v5), reframed as a context engine (v6 architecture approved, Phase 1 built, engine deployed under the v5 screens), researched personal targets, made an 80 s promo film; owner then asked for a menu reader ("what should I order?") and said the film's narration sounds too much like an AI

## 0. Instructions for Claude (read first)

You are continuing work from a previous chat. That chat is gone; this file is the complete context and the source of truth.

1. Read this whole file before replying.
2. Follow sections 3 (Style), 4 (Hard rules) and 5 (Corrections) in every reply, for the rest of this chat. They override your defaults.
3. Use the values in section 8 exactly. Never round, re-estimate, or "correct" them.
4. Do not suggest anything listed in section 7 (Changed / rejected) again unless the user brings it up.
5. Code word: Start every reply with exactly "Yes Boss!"
6. Your first reply: at most 5 lines covering the goal, the current state, and the next step (section 11). Mention any files from section 13 that were not attached. Ask the questions in section 12 if there are any. End with "Ready to continue with <next step>?" Then wait for the user's go.

## 1. Mission
- **Goal:** Next Plate is a **context engine** for one person's eating: it builds that person's diet context (what they ate, their patterns, their targets) and uses AI to serve their nutrition goals at every meal. A dietitian in the pocket. The owner's words: "It's almost as if we are building a context engine, that identifies or build the diet related context of a person, uses AI to serve his diet/nutrition wellness goals." Foundation: the owner's two Gemini files in `docs/foundation/` (NutriPulse Pocket Dietitian = [P], Summit Edition = [S]), with real imagination on top. The owner wants "the highest grade product", not a skeleton.
- **Done looks like:** live on the owner's domain nextplate.in; behaviour and design the owner approves; safe answers; checked on the real engine.
- **Why it matters / context:** for the owner's coaching clients: sedentary, pain-prone, middle-aged, mostly Indian, small homes, WhatsApp-first.

## 2. About the user (as relevant to this work)
- Systems-minded wellness entrepreneur and coach (training, treks, nutrition, behaviour design). Thinks in architectures, ladders, gates, loops. Wants work in layers: architecture, then domain model, then workflows, then templates. Prefers containers over tips: a mechanism with trigger, process, artefact, outcome.
- Uses ChatGPT for sense-making, Claude for building, another tool for research.
- Has: Railway account (trial), Gemini API key on a paid billing account (it lives only in Railway), ElevenLabs (own cloned voice "Mine"), GoDaddy (bought nextplate.in), GitHub user r959qp5qwr-web.
- Cannot take a paid Railway plan right now.
- Has been let down several times in this project by thin, subtracted work, and says so bluntly. Works asynchronously (gives a go, comes back later).

## 3. Style & communication
- **Language:** English.
- **Tone:** grounded, calm, precise, direct, low-hype. No motivational fluff, no generic coach voice. Own mistakes plainly, without grovelling.
- **Reply length:** short; results first; no bloated explanations.
- **Formatting:** plain Markdown, bullets and tables; no emojis.
- **Working style:** builder mode; act when enough is known; give one recommendation, not a survey; ask only when it changes design, safety or implementation; turn a needed decision into a one-word reply with a recommendation; once chosen, a decision is fixed.
- **Avoid:** fluff, hype, stereotypical "Indian food app" or "medical app" looks, reopening settled decisions, parking work as "later", slogans and three-beat taglines in anything written for the owner's voice.

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
10. "Don't copy geminis look. The most recent confirmed look is our look" (the look is Raw Linen).
11. The user declined the secure form for the Gemini key: do not ask for the key again, and never read Railway variable values. Real-engine checks use a temporary `EVAL_CODE` Railway variable that Claude generates, uses, then sets back to empty (each change restarts the live app for a few seconds; say so when it is done).
12. Develop and push only on branch `claude/nice-hawking-307ljy` of `r959qp5qwr-web/Next-plate`; no pull request unless asked.

## 5. Corrections log
| # | Claude did | The user wanted |
|---|---|---|
| 1 | v3 / v4 teal designs, recolours, looks A–D | "No all horrible. I think the direction is wrong. Reimagine" |
| 2 | "Mixtape" (Guardians-of-the-Galaxy-inspired) look | "No. lol. Horrible. I take it back." |
| 3 | "Daylight" look | "No. It looks like a medical app... please atleast do something of your own." |
| 4 | Kitchen thali design, mid-build | "No." ×3, "Stop." — stop and get a reference instead of guessing |
| 5 | Raw Linen first pass (too restrained) | "I want you to over do a bit. Go all the way. Be inspired." |
| 6 | Proposed a deploy route needing a paid plan | "Your other way asks for paid plan immediately. I can't do it." → free route |
| 7 | Demo recording came out at a quarter of the frame (blank phone) | Caught by Claude before delivery; re-recorded sharp via screencast |
| 8 | Built the first app on "the coach's food rules", phulka/katori measures and a separate Ask tab | "This was an AI-enabled dietitian app... The thing that I gave you from Gemini, that was supposed to become the foundation... did you completely ignore that?" → rebuild AI-first on the two Gemini files |
| 9 | Asked whether supplements were in or out | "I didn't talk about supplements. We are not doing supplements." |
| 10 | Household measures | "grams and calories, not katori and fulka" |
| 11 | Drifted toward the Gemini files' look while rebuilding | "Don't copy geminis look. The most recent confirmed look is our look" |
| 12 | v5: copied the Gemini plan as a thin skeleton and deleted good parts of the old app | "you keep distilling out the lowest grade product for me... I need the highest grade product"; "There were good things in the old app that you have deleted"; "You have hardly used any useful creative imagination" → the context engine (v6) |
| 13 | Mapped the owner's [P] "Scan Menu: what should I order?" to a photo button on Rescue, which softens one already-chosen dish and never chooses | "there should be a feature where the app can look at a menu and recommend dishes based on what suits the person for that meal. So a live recommendation. You didn't think of that." → `docs/FEATURE-menu.md` |
| 14 | Promo narration in slogans and stamped sentences ("No guesswork. No guilt. Just your next plate, decided.") | "the video language sounds too much like an AI" → conversational rewrite, `demo/reel/promo/docs/script-v2.md` |
| 15 | Rescue showed two conflicting moves switched on (820 → 190 kcal, fats 0) | Caught by Claude; fixed: one move on by default, moves must combine, totals floored at 40 % of the dish (commit 5f1d63f) |

**The pattern behind 8, 12 and 13:** a feature from the owner's source was reduced or dropped without saying so. Before building anything, trace every feature to `docs/foundation/` and the old app, list every departure, and never subtract without saying what it becomes.

## 6. Decisions
| Decision | Why |
|---|---|
| Rebuild AI-first: Gemini generates every meal | owner: "yes" (2026-11-11) |
| No supplements anywhere | owner |
| Grams and kcal only | owner |
| Look = Raw Linen (the v4 stylesheet and icons), never Gemini's look | owner |
| After-meal curve is a band (Gentle / Moderate / Sharp), never mg/dL | owner: "Band" |
| The two Gemini files live in the repo (`docs/foundation/`) | owner: "yes" |
| Product = context engine; architecture `docs/ARCHITECTURE-v6.md` | owner: "Approve." |
| Food file is stored on the phone first (Supabase later) | owner: "Storage on phone." |
| Phase 1 built; the v6 engine deployed under the v5 screens | owner: "Build phase 1 now.yes. Deploy." (2026-11-12) |
| Promo film in the owner's voice that says how the app is useful, not a feature tour | owner: "don't show me that app does this. Tell me how it's useful." |
| Menu reader ("what should I order?") comes before the Phase 1 screens go live or the film is shared | owner (2026-11-12) |
| Host = Railway Function (Bun) that loads the page from the public repo at a pinned commit | free route; paid plan refused |
| Model = Gemini paid tier, gemini-3.8-flash, fallback gemini-3.6-flash, THINKING=low | quality checks; speed |

Claude's working defaults, **not yet confirmed by the owner**: the five target choices in `docs/RESEARCH-parameters.md` (1200 kcal floor for women, obesity line 27.5 vs 25, activity factor 1.3 for sitting, protein counted on the weight at BMI 25, assumed bedtime 11:30 pm); the wording of narration v2.

## 7. Changed / rejected
- First app ("coach's food rules", household measures, tabs Today / Lab / Rescue / Rhythm / Ask) → v5/v6, AI-first on the Gemini files (owner rejected the first app's premise)
- v5 thin skeleton → v6 context engine (owner: lowest grade)
- "[P] Scan Menu → Rescue photo" → its own feature, Read the menu (`docs/FEATURE-menu.md`)
- Promo narration v1 → v2, conversational (v1 film stays in the repo until v2 is cut)
- `demo/next-plate-demo.mp4` (66 s, old app, old narration) → superseded by the promo film
- Live page `hosted/v4/index.min.html` at PAGE_REF fcf7ee10234ca50e395117184ff5648297e98a22 → `hosted/v5/index.min.html` at the PAGE_REF in section 8
- Free Gemini tier → paid billing account
- ❌ supplements; ❌ katori / phulka as units; ❌ Gemini's look; ❌ blood-sugar numbers (mg/dL); ❌ asking for the Gemini key
- ❌ v3, v4 teal, recolours, looks A–D, Mixtape, Daylight, kitchen thali
- ❌ Railway repo-connect / Dockerfile deploy (needs paid plan); ❌ pasting the page into the function

## 8. Data & facts (exact)
| Item | Value |
|---|---|
| Repo / branch | r959qp5qwr-web/Next-plate (public), branch `claude/nice-hawking-307ljy` |
| Live URL | https://next-plate-production.up.railway.app/ |
| Railway project / service / environment | f006648a-5f51-4156-ba71-2898963cecc0 / 6825884e-02d9-4692-92ac-c098715f4af7 / 1e784c4d-0792-4bfc-a766-a474371b519b (production) |
| Live now | v5 screens with the v6 engine underneath: function source `hosted/v5/server.ts`, `PAGE_REF=5f1d63fb9df7e9f4f44a51df34aa2cfcf1e171b0`, page `hosted/v5/index.min.html` |
| Railway variables | GEMINI_API_KEY [secret removed: re-enter it], ACCESS_CODE [secret removed: re-enter it], DAILY_ASKS (default 150), ASKS_PER_PHONE (default 15), MODEL, FALLBACK_MODEL, THINKING=low, PHOTOS, EVAL_CODE (empty), PAGE_REF, PAGE_PATH (default hosted/v5/index.min.html), PAGE_FILE |
| To put the v6 screens live | set `PAGE_PATH=hosted/v6/index.min.html` and `PAGE_REF=<commit>` (`hosted/v6/README.md`) |
| Engine checks on real Gemini | v5 path 26/26 (`eval/v5/results-live-final.json`); v6 engine 18/18 (`eval/v6/results-live4.json`). Both were run before commit 5f1d63f (rescue fix); the fix was used live for screen captures with no errors but the full suites were not re-run |
| Speed (real engine) | plates 10–16 s (3 plates, lite), swaps and one-tap changes 7–10 s more, typed meal 3–7 s, rescue 4–8 s |
| Targets engine (`src/v6/params.js`) | Mifflin-St Jeor × 1.3 / 1.4 / 1.55 / 1.725; deficit 300 kcal (BMI 23–27.4) or 500 kcal (BMI ≥ 27.5), at most 30 %, floor 1200 f / 1500 m; no deficit if BMI < 23, age ≥ 65, or diabetes on insulin / sulfonylurea (yes or unsure); protein 1.0 g/kg, 1.0–1.2 from 65, 1.2 losing, 1.4 building, cap 1.6 (1.5 diabetes), at most 30 % of energy, counted on the weight at BMI 25 above BMI 25; fibre 15 g / 1000 kcal (diabetes 20 / 1000, 25–40 g); energy split 27 / 40 / 5 / 28; protein split 31 / 32 / 6 / 31; late dinner = within 2 h of an assumed 11:30 pm bedtime |
| Screenshot fixture | woman, 47, 158 cm, 72 kg, mostly sitting, vegetarian, North, diabetes (no insulin / sulfonylurea), goal lose, focus iron; clock 2026-11-12 20:40 IST |
| Palette (Raw Linen) | paper #F2ECE1, surface #FAF6EE, ink #1D1A16, ink2 #4B443B, ink3 #857967, line #DCD1BF, clay #B0613D, olive #6B7A3A, kraft #DCC8A6; EB Garamond + Caveat |
| ElevenLabs | voice "Mine", voice_id 0NUZIfNR5WwWr9ePwAqg, model eleven_v4; flow iiv9IgmzlhmmE8DhfuH4; "chole bhature" is voiced from the spelling "chho-lay bha-too-ray" |
| Promo film v1 | `demo/next-plate-promo.mp4`: 80 s, 1080×1920, 60 fps, 33.5 MB, −14.1 LUFS; `demo/next-plate-promo-whatsapp.mp4`: 720×1280, 30 fps, 7.7 MB; 90 bpm, 120 beats |
| Narration v2 draft | `demo/next-plate-narration-v2-draft.mp3`: 76 s, one continuous take, audio only |
| Railway trial | ends about 2026-11-18 |
| Domain | nextplate.in, bought at GoDaddy, not connected |
| Build | `ESBUILD=<folder of an installed esbuild module> node src/v5/build5.js && ESBUILD=<same> node src/v6/build6.js` (install esbuild in a scratch folder first; it is not in the repo) |

Narration v1 (in the film now), in order: 1 "Three times a day, the same question. What should I eat now?" · 2 "A diet chart answers it once. Then your day happens. Breakfast gets skipped. Lunch is at a wedding. Dinner is at ten." · 3 "Next Plate answers it fresh, every meal. It is a dietitian in your pocket that knows how your day is actually going." · 4 "So you don't have to decide. You get one clear plate. Real food, in real amounts, and the reason it is right for you today." · 5 "Ate something else? Just tell it. It doesn't scold you. It counts the meal, and quietly adjusts the rest of your day." · 6 "Eating out anyway? It shows you the two or three moves that make even chole bhature fit." · 7 "It remembers your week, so dinner isn't rajma again." · 8 "Your numbers are not copied from a chart. They are worked out from your age, your body and your goal. And it shows you how." · 9 "And it is careful. With diabetes, the grain stays on your plate. If something needs your doctor, it says so, and steps back." · 10 "No guesswork. No guilt. Just your next plate, decided." · 11 "Next Plate. Message me for your link."

Narration v2 (rewritten, voiced as a draft, not yet approved or cut): 1 "You already know what healthy food looks like. Where most people get stuck is at two in the afternoon, hungry, trying to decide what to eat right now." · 2 "A diet chart doesn't help much there. It doesn't know you skipped breakfast, or that lunch was at a wedding, or that dinner is going to be at ten." · 3 "So I built Next Plate. Before a meal you open it, and it tells you what to eat, based on how your day has actually gone." · 4 "You get one plate. Normal home food, quantities in grams, and a line on why it picked that for you today." · 5 "If you ended up eating something else, just type what you had. Nobody scolds you. It counts it and adjusts the rest of your day." · 6 "At a restaurant, take a photo of the menu and it tells you what to order. And if the chole bhature has already arrived, it shows you how to make that work too." · 7 "It remembers your week, so if you've had rajma three nights in a row, tonight will be something else." · 8 "Your numbers come from your own age, height, weight and goal, and you can see exactly how they were worked out." · 9 "It also knows where to stop. With diabetes, it keeps the grain on your plate and measures it. And if something needs your doctor, it says so and suggests nothing." · 10 "That's all it is, really. One less thing to think about, three times a day." · 11 "If you'd like to try it, message me and I'll send you your link."

## 9. People, terms & names
- **People:** the user = coach and owner. No one else is involved.
- **Terms:** context engine = event log → food file → day plan → context brief with hooks → Gemini → safety checks → screens. "Code counts, Gemini cooks" = arithmetic, targets, ranking and safety are code; food knowledge comes from Gemini under a strict schema. Food file = what the app knows about the person (events, patterns, targets), kept on the phone under storage key `np6`. Day line = the kraft note at the top ("Today. About 1200 kcal..."). Hooks / "planned around" = reasons computed by code and shown as tags under a plate. Rise = after-meal band. Fit = score out of 100 against the meal's target. [P], [S] = the two Gemini files. Lite / tune = the two-step loading (plates first, swaps and one-tap changes second).
- **Names in use:** tabs Plate, Builder, Rescue. Engine kinds `meals`, `rescue`, `log`, `tune` (and `menu`, see section 10). Files: `src/v5/core.js`, `src/v5/server.ts`, `src/v5/app.js`, `src/v6/params.js`, `src/v6/engine.js`, `src/v6/app.js`, `src/v6/extra.css`, `src/v5/build5.js`, `src/v6/build6.js`, `hosted/v5/`, `hosted/v6/`, `eval/v5/`, `eval/v6/`, `test/v5/`, `test/v6/`, `screens/v6-phase1/`. Film: `demo/reel/` (`promo/film.js`, `promo/audio/place.py`, `capture.js`).

## 10. Work state
| Item | Status | Version / location | Notes |
|---|---|---|---|
| Architecture (context engine) | approved | `docs/ARCHITECTURE-v6.md` | build phases 1–6 in its section 14 |
| Engine v6 (targets, food file, day plan, hooks, plates, tune, log, rescue) | live under the v5 screens | `src/v6/`, PAGE_REF in section 8 | 18/18 on the real engine before the rescue fix |
| Phase 1 screens (day line, planned-around tags, goal, focus, had / something else / skipped, typed meal, "How these numbers are worked out") | built, not live | `hosted/v6/index.min.html`; screens in `screens/v6-phase1/` | waits for "Deploy." |
| Targets research | done | `docs/RESEARCH-parameters.md`, `src/v6/params.js` | five owner choices open |
| Read the menu ("what should I order?") | built and mock-checked; not live; not checked on the real engine | design `docs/FEATURE-menu.md`; kind `menu` in `src/v6/engine.js`; screen on the Rescue tab in `src/v6/app.js`; mock screens `screens/v6-menu/` | 19 code checks pass (`node eval/v6/menu-checks.js`); 10 mock screens (`test/v6/shots-menu.js`, fixture `test/v6/fixture-menu.js`). Built by a helper agent that was cut off by the weekly usage limit (resets 2026-11-15 10:00 UTC) before it reported. Claude ran the checks and looked at the screens but has **not** read the whole diff line by line. The 8 real-menu scenarios and their runner are written (`eval/v6/scenarios-menu.json`, `node eval/v6/run-menu.js <base-url> <code> [label]`) but have never been run on the real engine. Not done: a re-run of the older screens (`test/v6/shots.js`) to confirm nothing else moved; the real-engine check |
| Promo film v1 | delivered; owner: narration sounds like an AI | `demo/next-plate-promo.mp4`, source `demo/reel/` | to be re-cut with narration v2 and a menu-reader scene |
| Narration v2 | written and voiced as one draft take; not approved | `demo/reel/promo/docs/script-v2.md`, `demo/next-plate-narration-v2-draft.mp3` | owner edits or approves the words; then voice line by line and re-time the film (`demo/reel/README.md`) |
| Phases 2–6 | not started | architecture section 14 | 2 learned likes and portions, family pot, photo logging; 3 rhythm strip, voice, WhatsApp; 4 week review, My food file, weight-trend correction; 5 calendar (treks, fasts); 6 Supabase and coach view |
| nextplate.in | not started | — | owner adds the domain in Railway (Settings → Networking → Custom Domain) and the DNS records in GoDaddy; Claude then checks status |

## 11. Next steps
1. **Next action:** finish the menu reader's proof. Read its diff (the commit titled "Read the menu") line by line against `docs/FEATURE-menu.md`; read `eval/v6/scenarios-menu.json` and `eval/v6/run-menu.js` (8 menus: North Indian, South Indian tiffin, Indo-Chinese, pizza, cafe, wedding buffet card, canteen board, a blurred photo); re-run `node eval/v6/menu-checks.js`, `node test/v6/shots-menu.js` and the older screens; show the owner `screens/v6-menu/`; then ask for "Deploy."
2. On the owner's "Deploy.": set `PAGE_REF` to the latest commit and `PAGE_PATH=hosted/v6/index.min.html`; check the live page; run the real-engine checks with a temporary `EVAL_CODE` (v5 26, v6 18, and the menu scenarios); fix what fails; clear `EVAL_CODE`.
3. Re-cut the film: owner approves or edits narration v2; voice it line by line; capture real menu-reader screens with `demo/reel/capture.js`; add the menu scene; re-time `film.js` to the new words; render; send both sizes.
4. Owner's five target choices (`docs/RESEARCH-parameters.md`).
5. Phase 2 of the architecture.
6. Connect nextplate.in; decide hosting before the Railway trial ends (about 2026-11-18).

## 12. Open questions ⚠️
- "Deploy."? It puts the Phase 1 screens and the menu reader live, and allows the real-engine menu check. Recommendation: yes, once the menu reader's screens look right to the owner.
- Narration v2: approve as written, or edit? (The draft audio is in `demo/next-plate-narration-v2-draft.mp3`.)
- The five target choices: keep the working defaults? Recommendation: yes.
- DAILY_ASKS: keep 150 or cap at 60? Recommendation: 60.
- GoDaddy apex: www.nextplate.in with forwarding from the bare domain, or move DNS to Cloudflare? Recommendation: www + forwarding.
- Hosting after the Railway trial: not decided.

## 13. Re-attach checklist
- Nothing to attach. Everything is in github.com/r959qp5qwr-web/Next-plate (public), branch `claude/nice-hawking-307ljy`.
- The new session needs the Next-plate repository, and the Railway and ElevenLabs connectors, to deploy and to voice.

---
<sub>Audit: 13/13 sections · 12 rules · 15 corrections · 46 data points · secrets removed: yes · generated by active-memory</sub>
