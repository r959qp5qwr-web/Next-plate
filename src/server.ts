/* Next Plate: hosted server. One file for Railway Functions (Bun).
   Serves the page and answers /api/ask through Google's Gemini API. The key stays here, never in the page.
   Environment:
     GEMINI_API_KEY   your key from aistudio.google.com, on a project with billing (paid tier: prompts not used to train)
     ACCESS_CODE      optional; when set, asking needs a link ending ?k=<code>
     DAILY_ASKS       default 150 - asks across all clients per day
     ASKS_PER_PHONE   default 15  - asks per client connection per day
     MODEL            default gemini-3.8-flash
     FALLBACK_MODEL   default gemini-3.6-flash, tried once when the first model is overloaded
     THINKING         optional: minimal, low, medium or high. Left out, Google's default applies
   Counters live in memory, so a restart or redeploy resets them. If Google is busy even after the retry,
   asking says so and the coach's list keeps working.
   Sent to Google: the meal, goal, hunger, situation, nutrient focus, diet, region, leave-outs, the typed
   words, the names of plates already picked today, and diabetes or high BP if set. Never sent: kidney or pregnancy (those get the referral line), photos, any name. */
const PAGE: string = String.raw`/*PAGE*/`;
/* The catalogue, option lists, fixed wording and prompt builder live once, in the page's np-core script. Run it here too. */
declare const OPT: any, SAFETY: string, buildPrompt: (st: any) => string;
{ const open = '<script id="np-core">', a = PAGE.indexOf(open) + open.length; (0, eval)(PAGE.slice(a, PAGE.indexOf("</script>", a))); }

const env = (k: string, d: string) => (Bun.env[k] ?? "").trim() || d;
const FREE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const MODEL = FREE_MODELS.includes(env("MODEL", "")) ? env("MODEL", "") : "gemini-3.8-flash";
const FALLBACK = FREE_MODELS.includes(env("FALLBACK_MODEL", "")) ? env("FALLBACK_MODEL", "") : "gemini-3.6-flash";
const THINK = ["minimal", "low", "medium", "high"].includes(env("THINKING", "")) ? env("THINKING", "") : "";
const DAILY = Number(env("DAILY_ASKS", "150"));
const PER_PHONE = Number(env("ASKS_PER_PHONE", "15"));
const CODE = env("ACCESS_CODE", "");
const KEY = env("GEMINI_API_KEY", "");
const BASE = env("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com");

const ledger = { day: "", asks: 0, byIp: new Map<string, number>() };
function roll() {
  const d = new Date().toISOString().slice(0, 10);
  if (ledger.day !== d) { ledger.day = d; ledger.asks = 0; ledger.byIp.clear(); }
}

/* ---------- validation: only known choices and short plain text get through ---------- */
const MEALS = ["breakfast", "lunch", "snack", "dinner"];
const okOpt = (k: string, v: unknown) => typeof v === "string" && OPT[k].some((o: string[]) => o[0] === v);
const plain = (v: unknown, max: number) => typeof v === "string" ? v.replace(/[\r\n"\\]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
const list = (v: unknown, n: number, max: number) => Array.isArray(v) ? v.slice(0, n).map(x => plain(x, max)).filter(Boolean) : [];
function readState(s: any) {
  if (!s || typeof s !== "object") return null;
  if (!MEALS.includes(s.meal)) return null;
  for (const k of ["sit", "hunger", "goal", "low", "diet", "region", "health"]) if (!okOpt(k, s[k])) return null;
  const leave = Array.isArray(s.leave) ? s.leave.filter((x: unknown) => okOpt("leave", x)).slice(0, 4) : [];
  const time = /^\d{1,2}:\d{2} (am|pm)$/.test(s.time) ? s.time : "unknown";
  const text = plain(s.text, 240);
  if (!text) return null;
  return { meal: s.meal, time, sit: s.sit, hunger: s.hunger, goal: s.goal, low: s.low, diet: s.diet, region: s.region, health: s.health,
    leave, text, photo: false, had: list(s.had, 4, 80), shown: list(s.shown, 3, 80), prev: list(s.prev, 3, 80) };
}

const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const line = (o: object) => JSON.stringify(o) + "\n";
const textHeaders = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" };

async function ask(req: Request, ip: string) {
  let body: any;
  try { body = await req.json(); } catch { return json(400, { code: "bad_request" }); }
  if (CODE && body?.key !== CODE) return json(401, { code: "bad_key" });
  if (!KEY) return json(503, { code: "not_set_up" });
  if (body?.image) return json(400, { code: "image_rejected" });          // photos are switched off for now
  const st: any = readState(body?.state);
  if (!st) return json(400, { code: "bad_request" });
  const enc = new TextEncoder();

  /* kidney condition and pregnancy never reach the model */
  if (st.health === "kidney" || st.health === "preg")
    return new Response(line({ t: "refer", text: SAFETY }), { headers: textHeaders });
  // Paid tier: Google does not use prompts to improve its products, so diabetes and high BP are sent (the model needs them)

  roll();
  if (ledger.asks >= DAILY) return json(429, { code: "limit_day" });
  const mine = ledger.byIp.get(ip) ?? 0;
  if (mine >= PER_PHONE) return json(429, { code: "limit_ip" });
  ledger.asks++; ledger.byIp.set(ip, mine + 1);

  const payload = {
    contents: [{ role: "user", parts: [{ text: buildPrompt(st) }] }],
    generationConfig: { maxOutputTokens: 8192, ...(THINK ? { thinkingConfig: { thinkingLevel: THINK } } : {}) },
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90_000);
  req.signal.addEventListener("abort", () => ctrl.abort());

  let up!: Response;
  try {
    /* Google sometimes answers 503 (overloaded) or 429 (busy). Try the chosen model, then once more on the fallback. */
    for (const m of MODEL === FALLBACK ? [MODEL, MODEL] : [MODEL, FALLBACK]) {
      up = await fetch(`${BASE}/v1beta/models/${m}:streamGenerateContent?alt=sse`, {
        method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(payload), signal: ctrl.signal });
      if (up.status !== 503 && up.status !== 429) break;
      console.error("gemini busy:", up.status, m); await up.text().catch(() => "");
      await new Promise(r => setTimeout(r, 1200));
    }
  } catch (e) {
    clearTimeout(timer);
    if (!req.signal.aborted) console.error("gemini fetch failed:", String(e));
    return json(502, { code: "upstream_error" });
  }
  if (!up.ok || !up.body) {
    clearTimeout(timer);
    console.error("gemini error:", up.status, (await up.text().catch(() => "")).slice(0, 400));
    return json(up.status === 429 ? 429 : 502, { code: up.status === 429 ? "rate_limited" : "upstream_error" });
  }

  return new Response(new ReadableStream({
    async start(ctl) {
      const dec = new TextDecoder();
      let buf = "", wrote = false, stop = "", blocked = "", usage: any = null;
      const feed = (ln: string) => {
        if (!ln.startsWith("data:")) return;
        let j: any; try { j = JSON.parse(ln.slice(5).trim()); } catch { return; }
        const c = j?.candidates?.[0];
        for (const p of c?.content?.parts ?? []) if (typeof p?.text === "string" && !p.thought) { ctl.enqueue(enc.encode(p.text)); wrote = true; }
        if (c?.finishReason) stop = c.finishReason;
        if (j?.promptFeedback?.blockReason) blocked = j.promptFeedback.blockReason;
        if (j?.usageMetadata) usage = j.usageMetadata;
      };
      try {
        const rd = up.body!.getReader();
        for (;;) {
          const { done, value } = await rd.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf("\n")) >= 0) { feed(buf.slice(0, i).replace(/\r$/, "")); buf = buf.slice(i + 1); }
        }
        feed(buf.replace(/\r$/, ""));
        if (blocked || (!wrote && stop && stop !== "STOP" && stop !== "MAX_TOKENS")) ctl.enqueue(enc.encode("\n" + line({ t: "_err", code: "refused" })));
        else if (!wrote) ctl.enqueue(enc.encode("\n" + line({ t: "_err", code: "upstream_error" })));
        console.log(JSON.stringify({ at: new Date().toISOString(), model: MODEL, in: usage?.promptTokenCount, out: usage?.candidatesTokenCount, thought: usage?.thoughtsTokenCount, stop, today: ledger.asks }));
      } catch (e) {
        if (!req.signal.aborted) {
          console.error("gemini stream failed:", String(e));
          try { ctl.enqueue(enc.encode((wrote ? "\n" : "") + line({ t: "_err", code: "upstream_error" }))); } catch {}
        }
      }
      clearTimeout(timer);
      try { ctl.close(); } catch {}
    },
  }), { headers: textHeaders });
}

const SECURITY = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-frame-options": "DENY" };
Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  idleTimeout: 120,                                        // an answer can take a while; keep the stream open
  maxRequestBodySize: 64 * 1024,
  async fetch(req, server) {
    const url = new URL(req.url);
    // first x-forwarded-for hop: a client can fake it to dodge the per-phone limit, but DAILY_ASKS still caps the total
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || server.requestIP(req)?.address || "?";
    if (url.pathname === "/" && req.method === "GET")
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache", ...SECURITY } });
    if (url.pathname === "/api/ask" && req.method === "POST") return ask(req, ip);
    if (url.pathname === "/health") { roll(); return json(200, { ok: true, key: !!KEY, code: !!CODE, model: MODEL, thinking: THINK || "default", today: ledger.asks }); }
    return new Response("Not found", { status: 404 });
  },
});
console.log("Next Plate listening");
