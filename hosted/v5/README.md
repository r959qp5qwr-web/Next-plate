# Next Plate v5, hosted (AI-first)

Spec: `docs/SPEC-v5.md`. Foundation: `docs/foundation/` (the owner's two Gemini files).

`server.ts` is the whole server: one file for a Railway Function (Bun). It serves the page and answers
`/api/meals` and `/api/rescue` through Google Gemini, with a JSON response schema. Every reply is checked by the
same core the page runs (`np-core`): diet and leave-outs, no supplements, diabetes grain, high-BP salt, no
invented percentages or blood-sugar numbers, kcal against macros. Kidney condition and pregnancy never reach the model.

## Build
`ESBUILD=<path to node_modules/esbuild> node build5.js` writes `hosted/v5/index.html`, `index.min.html` and `server.ts`
from `src/v5/` (core.js, app.js, markup.html, extra.css) plus the v4 Raw Linen stylesheet and icons.

## Deploy (only on the owner's word "Deploy.")
1. Push. Note the commit.
2. Railway, service next-plate: replace the function source with `hosted/v5/server.ts`; set `PAGE_REF` to the commit.
3. Variables carry over: `GEMINI_API_KEY`, `ACCESS_CODE`, `DAILY_ASKS`, `ASKS_PER_PHONE`, `MODEL`, `FALLBACK_MODEL`. New, optional: `PHOTOS=off`.
4. Check: `GET /health`, then `node eval/v5/run.js https://<app> <access-code> live`.
Rollback: function source `hosted/v4/server.remote.ts`, `PAGE_REF=fcf7ee10234ca50e395117184ff5648297e98a22`.

## Local check without Google
`bun test/v5/mock-gemini.ts` (returns a labelled layout sample from the Gemini file), then
`PAGE_FILE=hosted/v5/index.html GEMINI_BASE_URL=http://127.0.0.1:8787 GEMINI_API_KEY=local PORT=3005 bun hosted/v5/server.ts`,
then `node test/v5/shots.js` for phone screenshots in `screens/ai-v5/`.

## Calls per phone
Each new set of 3 plates, each ask and each rescue is one Gemini call. Opening a meal slot the first time in a day plans it
automatically; after that, plates are kept on the phone for the day. Changing a choice offers "Plan my plates" instead of calling at once.
