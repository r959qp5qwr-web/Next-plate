# Next Plate, hosted

`server.min.ts` (or the formatted `server.ts`) is the whole app: the page, the prompt, and the call to Google's Gemini API. It runs as a Railway Function (Bun). The key stays on the server and is never sent to the page.

Rebuild from `src/` with `node build.js`, then `node minify.js` for the compact file.

## What a client gets

A link like `https://<your-app>.up.railway.app/?k=<code>`. The first visit asks what they eat and whether they have a health flag; after that it opens straight to three plates. The code is saved on their phone after the first open.

## Settings (Railway: service, then Variables)

| Variable | What it does | Default |
|---|---|---|
| `GEMINI_API_KEY` | Key from aistudio.google.com on a project with billing (paid tier). On Railway it is a reference to the variable named `Gemini`. | none, so asking is off |
| `ACCESS_CODE` | Asking needs `?k=<code>` in the link. Change it to cut off old links. | none |
| `DAILY_ASKS` | Asks across all clients per day. | 150 in code |
| `ASKS_PER_PHONE` | Asks per client connection per day. | 15 in code |
| `MODEL` | `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite` or `gemini-3.1-flash-lite`. | `gemini-3.8-flash` (in use) |
| `FALLBACK_MODEL` | Tried once when the first model answers 503 or 429. | `gemini-3.6-flash` |
| `THINKING` | `minimal`, `low`, `medium` or `high`. Untested; leave unset. | Google's default |

The coach's list of plates always works, even when asking is off, busy or out of quota.

## Quality check (`eval/`)

`node eval/run.js <url> <access-code> <label>` sends 26 fixed scenarios to the live server, runs the page's own rules on each reply and saves `eval/results-<label>.json`. Run it after any prompt or model change.

Results on 11 Nov:

| Run | Matched | Plates the rules had to remove | Notes |
|---|---|---|---|
| Free `gemini-3.6-flash` | 13/26 | 1 | 10 Google 503 "high demand", 4 quota 429; then 12/13 refused for quota |
| Free `gemini-3.5-flash-lite` | 18/26 | 6 | eggs offered to a vegetarian, raita to no-dairy, cut-off replies |
| Paid `gemini-3.8-flash`, before fixes | 25/26 | 2 | diabetic sweet craving |
| Paid `gemini-3.8-flash`, final | 26/26 | 0 | median 13 s; two asks took about 50 to 60 s |

## Privacy (paid tier)

On the paid tier Google does not use prompts or answers to improve its products. Sent: meal, goal, hunger, situation, nutrient focus, diet, region, leave-outs, the words typed, plates picked today, and diabetes or high BP if set. Never sent: kidney or pregnancy (fixed referral line, no call), photos (switched off), names.

## Checks the server makes

- Only known choices and 240 characters of text go in. The server builds the prompt itself, so the link is not a general chatbot.
- Photos are rejected.
- The page re-checks every plate: diet, leave-outs, diabetes and high BP lines, no grams or calories.

`GET /health` shows whether the key and code are set, the model, and today's ask count.
