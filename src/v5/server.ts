/* Next Plate v5: hosted server. One file for Railway Functions (Bun).
   Serves the page and answers /api/meals and /api/rescue through Google's Gemini API. The key stays here, never in the page.
   Every meal comes from Gemini (spec D1), in grams and kcal (D3), checked by the same core the page runs (np-core).
   Environment:
     GEMINI_API_KEY   key on a project with billing (paid tier: prompts not used to train)
     ACCESS_CODE      optional; when set, AI calls need a link ending ?k=<code>
     DAILY_ASKS       default 150 - AI calls across all clients per day
     ASKS_PER_PHONE   default 15  - AI calls per client connection per day
     MODEL            default gemini-3.8-flash; FALLBACK_MODEL default gemini-3.6-flash (tried once on 503/429)
     THINKING         optional: minimal, low, medium or high
     PHOTOS           "off" switches menu photos off (default on)
     EVAL_CODE        optional second code for the quality check (eval/): skips the per-phone and daily counters and returns the raw reply
     PAGE_REF         git commit the page is loaded from (GitHub raw); PAGE_FILE loads a local file instead (testing)
   Counters live in memory, so a restart resets them.
   Sent to Google: meal, time, mode, mood, cuisine, appetite, cooking/ordering, oil, plate ratio, meals eaten today, typed words,
   a menu photo when given, diet, region, leave-outs, age, sex, weight, activity, diabetes or high BP if set.
   Never sent: kidney or pregnancy (fixed referral line, no call), names, phone numbers. */
const env = (k: string, d: string) => (Bun.env[k] ?? "").trim() || d;
const PAGE_REF = env("PAGE_REF", "main");
const PAGE_FILE = env("PAGE_FILE", "");
const PAGE_URL = `https://raw.githubusercontent.com/r959qp5qwr-web/Next-plate/${PAGE_REF}/hosted/v5/index.min.html`;
async function loadPage(): Promise<string> {
  if (PAGE_FILE) return await Bun.file(PAGE_FILE).text();
  for (let i = 0; i < 5; i++) {
    try { const r = await fetch(PAGE_URL); if (r.ok) { const t = await r.text(); if (t.includes('<script id="np-core">')) return t; } console.error("page fetch", r.status); }
    catch (e) { console.error("page fetch failed:", String(e)); }
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error("could not load the page from " + PAGE_URL);
}
const PAGE: string = await loadPage();
console.log("page loaded", PAGE_FILE || PAGE_REF, PAGE.length, "bytes");
/* The option lists, schemas, prompts and checks live once, in the page's np-core script. Run it here too. */
declare const SAFETY: string, SCH: any, readProfile: any, readCtx: any, dayTargets: any, mealTargets: any,
  buildMealPrompt: any, buildRescuePrompt: any, checkReply: any, checkRescue: any;
{ const open = '<script id="np-core">', a = PAGE.indexOf(open) + open.length; (0, eval)(PAGE.slice(a, PAGE.indexOf("</script>", a))); }

const MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const MODEL = MODELS.includes(env("MODEL", "")) ? env("MODEL", "") : "gemini-3.8-flash";
const FALLBACK = MODELS.includes(env("FALLBACK_MODEL", "")) ? env("FALLBACK_MODEL", "") : "gemini-3.6-flash";
const THINK = ["minimal", "low", "medium", "high"].includes(env("THINKING", "")) ? env("THINKING", "") : "";
const DAILY = Number(env("DAILY_ASKS", "150"));
const PER_PHONE = Number(env("ASKS_PER_PHONE", "15"));
const CODE = env("ACCESS_CODE", "");
const KEY = env("GEMINI_API_KEY", "");
const PHOTOS = env("PHOTOS", "on") !== "off";
const EVAL = env("EVAL_CODE", "");
const BASE = env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com");

const ledger = { day: "", asks: 0, byIp: new Map<string, number>() };
function roll() { const d = new Date().toISOString().slice(0, 10); if (ledger.day !== d) { ledger.day = d; ledger.asks = 0; ledger.byIp.clear(); } }
const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function gemini(prompt: string, schema: any, image: string | null, signal: AbortSignal): Promise<{ ok: true; data: any } | { ok: false; code: string; status: number }> {
  const parts: any[] = [{ text: prompt }];
  if (image) parts.push({ inline_data: { mime_type: "image/jpeg", data: image } });
  const payload = {
    contents: [{ role: "user", parts }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, maxOutputTokens: 16384, temperature: 0.7, ...(THINK ? { thinkingConfig: { thinkingLevel: THINK } } : {}) },
  };
  let up!: Response;
  try {
    for (const m of MODEL === FALLBACK ? [MODEL, MODEL] : [MODEL, FALLBACK]) {
      up = await fetch(`${BASE}/v1beta/models/${m}:generateContent`, {
        method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(payload), signal });
      if (up.status !== 503 && up.status !== 429) break;
      console.error("gemini busy:", up.status, m); await up.text().catch(() => "");
      await new Promise(r => setTimeout(r, 1200));
    }
  } catch (e) { console.error("gemini fetch failed:", String(e)); return { ok: false, code: "upstream_error", status: 502 }; }
  const body = await up.text().catch(() => "");
  if (!up.ok) { console.error("gemini error:", up.status, body.slice(0, 400)); return { ok: false, code: up.status === 429 ? "busy" : "upstream_error", status: up.status === 429 ? 429 : 502 }; }
  let j: any; try { j = JSON.parse(body); } catch { return { ok: false, code: "upstream_error", status: 502 }; }
  const c = j?.candidates?.[0], text = (c?.content?.parts ?? []).filter((p: any) => typeof p?.text === "string" && !p.thought).map((p: any) => p.text).join("");
  if (j?.usageMetadata) console.log("usage", JSON.stringify(j.usageMetadata), c?.finishReason);
  try { return { ok: true, data: JSON.parse(text) }; } catch { console.error("unparsed reply", c?.finishReason, text.slice(0, 200)); return { ok: false, code: "unparsed", status: 502 }; }
}

async function handle(kind: "meals" | "rescue", req: Request, ip: string) {
  let body: any;
  try { body = await req.json(); } catch { return json(400, { code: "bad_request" }); }
  const isEval = !!EVAL && body?.key === EVAL;
  if (CODE && body?.key !== CODE && !isEval) return json(401, { code: "bad_key" });
  const p = readProfile(body?.profile), c = readCtx(body?.ctx, kind);
  if (!p || !c) return json(400, { code: "bad_request" });
  /* kidney condition and pregnancy never reach the model (D7) */
  if (p.health === "kidney" || p.health === "preg") return json(200, { status: "refer", read: SAFETY, meals: [] });
  if (!KEY) return json(503, { code: "not_set_up" });
  let image: string | null = null;
  if (kind === "rescue" && typeof body?.image === "string") {
    if (!PHOTOS) return json(400, { code: "photos_off" });
    if (body.image.length > 1_600_000 || !/^[A-Za-z0-9+/=]+$/.test(body.image)) return json(400, { code: "bad_image" });
    image = body.image; c.photo = true;
  }
  if (!isEval) {
    roll();
    if (ledger.asks >= DAILY) return json(429, { code: "limit_day" });
    const mine = ledger.byIp.get(ip) ?? 0;
    if (mine >= PER_PHONE) return json(429, { code: "limit_ip" });
    ledger.asks++; ledger.byIp.set(ip, mine + 1);
  }
  c.target = mealTargets(dayTargets(p), c.meal, c.appetite || 5);
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 90_000);
  req.signal.addEventListener("abort", () => ctrl.abort());
  const t0 = Date.now();
  const r = kind === "meals" ? await gemini(buildMealPrompt(p, c), SCH.meals, null, ctrl.signal) : await gemini(buildRescuePrompt(p, c), SCH.rescue, image, ctrl.signal);
  clearTimeout(timer);
  if (!r.ok) return json(r.status, { code: r.code });
  const out = kind === "meals" ? checkReply(r.data, p) : checkRescue(r.data, p);
  console.log(kind, out.status, out.meals ? out.meals.length : "", JSON.stringify(out.dropped || {}), Date.now() - t0, "ms");
  return json(200, isEval ? { ...out, raw: r.data, ms: Date.now() - t0 } : out);
}

Bun.serve({
  port: Number(env("PORT", "3000")),
  idleTimeout: 120,
  async fetch(req, srv) {
    const url = new URL(req.url);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || srv.requestIP(req)?.address || "?";
    if (req.method === "POST" && url.pathname === "/api/meals") return handle("meals", req, ip);
    if (req.method === "POST" && url.pathname === "/api/rescue") return handle("rescue", req, ip);
    if (req.method === "GET" && url.pathname === "/health") return json(200, { ok: true, model: MODEL, ai: !!KEY, page: PAGE_FILE ? "file" : PAGE_REF });
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html"))
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" } });
    return new Response("Not found", { status: 404 });
  },
});
console.log("Next Plate v5 on", env("PORT", "3000"), "model", MODEL, "ai", !!KEY);
