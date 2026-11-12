# Next Plate v6, hosted (context engine, Phase 1)

Architecture: `docs/ARCHITECTURE-v6.md`. Parameters and their sources: `docs/RESEARCH-parameters.md`, `src/v6/params.js`.

## What is live right now
The Railway function (source: `hosted/v5/server.ts`) serves **the v5 screens with the v6 engine underneath**
(`hosted/v5/index.min.html` at `PAGE_REF`). The engine is shared code (`np-core`), so it was checked against real Gemini
without changing what a client sees. The v6 screens are built (`hosted/v6/index.min.html`) and wait for the owner's "Deploy."

## To put the v6 screens live (only on the owner's word "Deploy.")
1. Railway, service next-plate, Variables: set `PAGE_PATH=hosted/v6/index.min.html` and `PAGE_REF=<commit>`. No code change.
2. Check `GET /health`, then `node eval/v6/run.js https://<app> <code> live`.
Rollback: remove `PAGE_PATH` (back to the v5 screens), or set `PAGE_REF` to an earlier commit.

## Build
`ESBUILD=<path to node_modules/esbuild> node build5.js && ESBUILD=... node build6.js`
build6 writes `hosted/v6/index.html`, `hosted/v6/index.min.html`, and refreshes `hosted/v5/index.min.html` with the newest core.

## Calls and speed (measured on gemini-3.8-flash, THINKING=low, 2026-11-12)
| Call | What | Typical time | Counts as |
|---|---|---|---|
| `/api/meals` with `ctx.lite` | 3 plates planned around the day | 10 to 16 s | 1 ask |
| `/api/tune` | swaps and one-tap changes for the plate on screen (background) | 7 to 10 s | 0.25 |
| `/api/log` | "I had something else": typed meal to estimate | 3 to 7 s | 0.25 |
| `/api/rescue` | a dish as served, plus moves | 4 to 8 s | 1 ask |
`/api/meals` without `lite` (the v5 screens) returns everything in one reply and takes about 27 s.

## Checks
- `eval/v5/run.js`: 26 scenarios on the v5 path (diet, leave-outs, diabetes, BP, referrals, rescue).
- `eval/v6/run.js`: 18 context scenarios (hooks offered and cited, targets met, variety, diabetes grain and medicine, logging).
- `test/v6/shots.js`: phone screenshots; with `LIVE=<url> CODE=<code>` every call goes to the live engine, so the screens show real output.
- `EVAL_CODE` (Railway variable) lets the checks run without touching client limits. Set it for a run, clear it after.
