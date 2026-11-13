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
| Repo / branch | r959qp5qwr-web/Next-plate (public), branch `claude/nice-hawking-307ljy` (latest pushed commit b890035) |
| Live URL | https://next-plate-production.up.railway.app/ |
| Railway project / service / environment | f006648a-5f51-4156-ba71-2898963cecc0 / 6825884e-02d9-4692-92ac-c098715f4af7 / 1e784c4d-0792-4bfc-a766-a474371b519b (production) |
| Live now | v6 screens + v6 engine: function `hosted/v5/server.ts`, `PAGE_REF=baa5e08173889891a630dd9c9c0fbc0e361cb982`, page `hosted/v6/index.min.html` (deployed on the owner's "Deploy." during handoff #3; checked 2026-11-12 from the public page: www.nextplate.in is byte-identical to `git show baa5e08:hosted/v6/index.min.html`). The legibility build on this branch is not live yet. |
| Railway variables | GEMINI_API_KEY [secret removed: re-enter it], ACCESS_CODE [secret removed: re-enter it], DAILY_ASKS (default 150), ASKS_PER_PHONE (default 15), MODEL, FALLBACK_MODEL, THINKING=low, PHOTOS, EVAL_CODE (empty), PAGE_REF, PAGE_PATH, PAGE_FILE |
| To put the v6 screens live | `PAGE_PATH=hosted/v6/index.min.html` and `PAGE_REF=<commit>` |
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
| Engine v6 | live under v5 screens | `src/v6/` | 18/18 before rescue fix |
| Phase 1 screens + menu reader | built, not live | `hosted/v6/index.min.html` | wait for "Deploy." |
| Menu reader proof | done except live engine | see section 8 | 8 scenarios after deploy |
| 30 s film | approved | `demo/next-plate-film-30s.mp4` | re-make with the revised look once it is built |
| WhatsApp post | written, not yet reviewed by owner | `docs/film/WHATSAPP-post.md` | headline "Next Plate. Made for you." |
| Gemini look items 1–5 | approved to adopt; not started | — | mock-up screens first, owner reviews, then build into `src/v6/` |
| Phases 2–6 | not started | `docs/ARCHITECTURE-v6.md` §14 | |
| nextplate.in | not started | — | owner adds the domain in Railway and DNS in GoDaddy |

## 11. Next steps
1. **Next action:** make mock-up screens of the five adopted items (portion ring, nutrient colours, stoneware plate, pairing tips, taste notes) on the Plate screen using the Phase 1 page and the mock engine, and show them to the owner before changing the app.
2. On approval, build them into `src/v6/` (taste notes and pairing tips need new schema fields from Gemini, food only; check them in code like the other text: no supplements, no claims).
3. Ask for "Deploy."; then set `PAGE_REF` and `PAGE_PATH=hosted/v6/index.min.html`, run live-engine checks with a temporary `EVAL_CODE` (v5 26, v6 18, menu 8), fix failures, clear `EVAL_CODE`. These runs are also the first live check of the declared grain fields (Critic round 12: grain on each plate, made_of on each base swap, grain_grams_after on each one-tap change, grain_made_of and grain_grams on each menu order); with diabetes, a reply that leaves them empty is dropped, so the diabetes scenarios must still come back with plates and orders.
4. Re-capture the film's screens from the revised app and re-render the same 30 s film (same script, voice, music, timing).
5. Owner's five target choices; DAILY_ASKS (recommend 60); domain (recommend www + forwarding); hosting after the trial.

## 12. Open questions ⚠️
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
