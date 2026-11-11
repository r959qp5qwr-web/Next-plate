# active-memory handoff: Next Plate

**Handoff #1** · 2026-11-11 · Lineage: #1 (2026-11-11): built, redesigned (Raw Linen), deployed on Railway, Gemini quality-checked 26/26, made a 66 s narrated demo video; custom domain nextplate.in pending

## 0. Instructions for Claude (read first)

You are continuing work from a previous chat. That chat is gone; this file is the complete context and the source of truth.

1. Read this whole file before replying.
2. Follow sections 3 (Style), 4 (Hard rules) and 5 (Corrections) in every reply, for the rest of this chat. They override your defaults.
3. Use the values in section 8 exactly. Never round, re-estimate, or "correct" them.
4. Do not suggest anything listed in section 7 (Changed / rejected) again unless the user brings it up.
5. Code word: Start every reply with exactly "Yes Boss!"
6. Your first reply: at most 5 lines covering the goal, the current state, and the next step (section 11). Mention any files from section 13 that were not attached. Ask the questions in section 12 if there are any. End with "Ready to continue with <next step>?" Then wait for the user's go.

## 1. Mission
- **Goal:** Next Plate, a pocket-dietitian web app for the user's wellness coaching clients: it gives the next plate for each meal in household measures, built on the coach's food rules.
- **Done looks like:** live on the user's own domain nextplate.in, design the user approves, safe answers, coach-reviewed meals.
- **Context:** clients are middle-aged, mostly Indian, WhatsApp-first; measures like phulka, katori, bowl.

## 2. About the user (as relevant to this work)
- Systems-minded wellness entrepreneur / coach (training, treks, nutrition, behaviour design).
- Uses ChatGPT for sense-making, Claude for building, another tool for research.
- Has: Railway account (trial), Gemini API key on a paid billing account, ElevenLabs (own cloned voice "Mine"), GoDaddy (bought nextplate.in), GitHub user r959qp5qwr-web.
- Cannot take a paid Railway plan right now.

## 3. Style & communication
- **Language:** English.
- **Tone:** grounded, calm, precise, direct, low-hype. No motivational fluff, no generic coach voice.
- **Reply length:** short; results first; no bloated explanations.
- **Formatting:** plain Markdown, bullets/tables; no emojis needed.
- **Working style:** builder mode; act when enough is known; give one recommendation, not a survey; ask only when it changes design, safety or implementation; turn needed decisions into a one-word reply with a recommendation.
- **Avoid:** fluff, hype, stereotypical "Indian food app" or "medical app" looks, reopening settled decisions, parking work as "later".

## 4. Hard rules (word for word)
1. "Resolve, don't park. Before saying anything is blocked, held, deferred, "later", "separate change" or not possible, try every way round it" — report each as "Was going to be blocked by X. Workaround: Y. Status: done / running / needs your one word."
2. "Never bypass safety, review gates, licences, consent or my hard rules."
3. "use a safe default (leave a figure empty, never invent one)" — never invent figures.
4. Deploy only on the user's word ("Deploy.").
5. Do not push to the builders-doctrine repository.
6. Never put secrets (API key, access code) in outputs, files or the public repo.
7. Safety rails stay: kidney condition and pregnancy are blocked from the model (referral line); with diabetes the grain stays as written.

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

## 6. Decisions
| Decision | Why |
|---|---|
| Design = Kinfolk "Raw Linen", taken "all the way" | user's reference image + "go all the way" |
| Host = Railway Function (Bun) that loads the page from the public GitHub repo at a pinned commit | free route; paid plan refused |
| Repo r959qp5qwr-web/Next-plate is public | needed for the free deploy route |
| Model = Gemini paid tier, gemini-3.8-flash, fallback gemini-3.6-flash | paid tier: prompts not used for training; quality check 26/26 |
| Demo narration in the user's ElevenLabs voice "Mine" | user's request |

## 7. Changed / rejected
- Free Gemini tier → paid billing account (quality and privacy concern)
- ❌ v3, v4 teal, recolours, looks A–D, Mixtape, Daylight, kitchen thali (user rejected each)
- ❌ Railway repo-connect / Dockerfile deploy (needs paid plan; Dockerfile still in repo, unused)
- ❌ Pasting the 218 KB page into the function (too risky)

## 8. Data & facts (exact)
| Item | Value |
|---|---|
| Live URL | https://next-plate-production.up.railway.app/ |
| Railway project | next-plate, id f006648a-5f51-4156-ba71-2898963cecc0 |
| Railway service | next-plate, id 6825884e-02d9-4692-92ac-c098715f4af7 |
| Railway environment | production, id 1e784c4d-0792-4bfc-a766-a474371b519b |
| Railway variable PAGE_REF | fcf7ee10234ca50e395117184ff5648297e98a22 |
| Page served from | raw.githubusercontent.com/r959qp5qwr-web/Next-plate/${PAGE_REF}/hosted/v4/index.min.html |
| Other Railway variables | GEMINI_API_KEY [secret removed: re-enter it], ACCESS_CODE [secret removed: re-enter it], DAILY_ASKS default 150, ASKS_PER_PHONE default 15, MODEL, FALLBACK_MODEL, THINKING |
| Railway trial | about 7 days left, $3.95 credit (as of 2026-11-11) |
| Gemini check | 26 scenarios, 26/26 on gemini-3.8-flash (eval/) |
| Domain | nextplate.in, bought at GoDaddy |
| ElevenLabs voice | "Mine", voice_id 0NUZIfNR5WwWr9ePwAqg (cloned, en-indian male); flow 8WL3JPOpLblC4pHDKbT2 |
| Demo video | demo/next-plate-demo.mp4, 66 s, 1080×1920, H.264/AAC, loudness −16 LUFS, 10.6 MB |
| Palette | stone paper #F2ECE1, sumi-ink serif (EB Garamond), Caveat script, terracotta, pressed olive |

Demo narration lines (in order): 1 "Meet Next Plate. Your pocket dietitian, built on your coach's food rules." · 2 "Two questions, once. What you eat, and anything on the health side. Then it remembers you." · 3 "Every meal, your next plate is ready. Real Indian food, in measures you know: phulka, katori, bowl. The plate itself is the dial, from breakfast to dinner." · 4 "Want more protein? Gentler on sugar? One tap, and the plate changes." · 5 "The Lab shows what a plate does after you eat it, and how sabzi first, or a ten-minute walk, softens the rise." · 6 "Eating out anyway? Rescue gives you the two or three moves that make biryani fit your day." · 7 "Rhythm holds your whole day together: protein, water, and your walks." · 8 "And when life doesn't fit a list, just ask. Every answer stays inside your food rules." · 9 "Next Plate. Your next plate, decided. Ask your coach for your link."

## 9. People, terms & names
- **People:** the user = coach and owner; "the coach" = whoever reviews meals and wording (the user).
- **Terms:** Today, Lab, Rescue, Rhythm, Ask = the five tabs; "Rise" = after-meal curve band (Gentle / Moderate / Sharp), a model of direction, not a blood-sugar reading; "tune" = one-tap protein / gentler buttons.
- **Names in use:** repo r959qp5qwr-web/Next-plate (main branch); build `node build4.js` from src/v4/parts/*.js + src/v4/shell.html + src/data.js + src/prompt.js; outputs next-plate-v4.html, hosted/v4/index.html, hosted/v4/server.ts; deployed code hosted/v4/server.remote.ts; served page hosted/v4/index.min.html (minified with csso + esbuild).

## 10. Work state
| Item | Status | Version / location | Notes |
|---|---|---|---|
| App (Raw Linen design) | live | commit fcf7ee1 page; repo main | coach review of meals, wording and nutrition numbers still open |
| Railway server | live | hosted/v4/server.remote.ts | redeploy a new design: push, set PAGE_REF to new commit |
| Gemini quality check | done | eval/run.js, eval/results-*.json | 26/26 |
| Demo video | final | demo/next-plate-demo.mp4 (commit 58ea2be) | sent to user |
| nextplate.in | not started | — | Claude's attempt to add it in Railway was refused by the permission check (DNS/domain changes); user does it in the dashboard |
| Claude artifact preview | live | https://claude.ai/artifact/VLKQnyBmRsbmhvMUpBXeok | older preview copy |

## 11. Next steps
1. **Next action:** connect nextplate.in. User, in Railway: project next-plate → service next-plate → Settings → Networking → Custom Domain → add `nextplate.in` (and `www.nextplate.in`). Railway shows DNS records (CNAME/ALIAS + TXT verification). User adds them in GoDaddy → My Products → nextplate.in → DNS. Claude then checks status (domain-status) and the HTTPS page.
2. Decide the daily ask cap (see section 12).
3. Coach review of meals, wording and nutrition numbers.
4. Before the Railway trial ends: decide hosting beyond the trial.

## 12. Open questions ⚠️
- DAILY_ASKS: keep default 150, or cap at 60? (recommended earlier: 60)
- GoDaddy apex domain: GoDaddy cannot CNAME the bare nextplate.in; options: use www.nextplate.in as main + GoDaddy forwarding from the apex, or move DNS to Cloudflare (free) for CNAME flattening. Recommendation: www + forwarding.
- Hosting after the Railway trial (about 7 days from 2026-11-11): not decided.

## 13. Re-attach checklist
- Nothing to attach. Everything is in github.com/r959qp5qwr-web/Next-plate (public).

---
<sub>Audit: 13/13 sections · 7 rules · 7 corrections · 30 data points · secrets removed: yes · generated by active-memory</sub>
