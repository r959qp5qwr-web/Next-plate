// Stand-in for Google's API on localhost: returns the fixture in Gemini's response shape, after a short delay.
const fx = require("./fixture.js"), fxMenu = require("../v6/fixture-menu.js");
let calls = 0;
const KEEP = new Set(["made_of", "grain_made_of"]), NAMEK = new Set(["food", "add_item", "as_written"]), ENUMK = new Set(["status", "refer_reason", "group", "kind", "reason"]);
function plant(v: any, sch: any, key: string): any {
  if (Array.isArray(v)) return v.map(x => plant(x, sch && sch.items, key));
  if (v && typeof v === "object") { const o: any = {}; for (const k of Object.keys(v)) o[k] = plant(v[k], sch && sch.properties && sch.properties[k], k); return o; }
  if (typeof v !== "string" || (sch && sch.enum) || ENUMK.has(key) || key === "contains" || key === "with_contains" || key === "planned_around" || KEEP.has(key)) return v;
  if (NAMEK.has(key)) return "Qvxname";
  if (key === "with") return v ? "1 Qvxname" : v;
  return "Zqxjvoq ZQXJ7 plant " + key;
}
Bun.serve({ port: Number(Bun.env.MOCK_PORT || 8787), async fetch(req) {
  const b: any = await req.json(); const text = b.contents[0].parts[0].text; calls++;
  let which = /THE DISH/.test(text) ? fx.rescue : /WHAT THEY ATE/.test(text) ? fx.log : /THE PLATE:/.test(text) ? { swaps: fx.meals.meals[0].swaps, alchemy: fx.meals.meals[0].alchemy } : fx.meals;
  const isMenu = /^THE MENU$/m.test(text);
  if (isMenu) {                                                                                                     // v6 "Read the menu": the fixture, citing hooks the prompt offered; a small image stands in for a photo nobody could read
    const ids = [...text.matchAll(/^- \[([a-z0-9_]+)\]/gm)].map(m => m[1]), img = b.contents[0].parts[1]?.inline_data?.data;
    which = typeof img === "string" && img.length < 12000 ? { status: "unreadable", refer_reason: "none", place: "", dishes: [], leave: [], tip: "" }
      : { ...fxMenu.reply, dishes: fxMenu.reply.dishes.map((d: any, i: number) => ({ ...d, planned_around: ids.slice(i % Math.max(1, ids.length - 1), (i % Math.max(1, ids.length - 1)) + 2) })) };
    // a Jain client: each dish is asked for Jain style, with its tags as listed (onion and garlic in) and as served (taken out)
    if (/Diet is absolute: Jain/.test(text) && which.dishes) which = { ...which, dishes: which.dishes.map((d: any) => ({ ...d, request: "jain", contains_listed: [...new Set([...(d.contains || []), "onion_garlic"])], contains: (d.contains || []).filter((t: string) => t !== "onion_garlic" && t !== "root_veg").concat((d.contains || []).every((t: string) => t === "onion_garlic" || t === "root_veg") ? ["plain"] : []) })) };
  }
  if (which === fx.meals) {
    const lite = !b.generationConfig.responseSchema.properties.meals.items.properties.alchemy;                      // v6: cite only hooks the prompt offered
    const ids = [...text.matchAll(/^- \[([a-z0-9_]+)\]/gm)].map(m => m[1]);
    // on insulin or sugar tablets the prompt names the meal's usual size; the stand-in serves each plate at least that big, scaled as a whole (D2)
    const usual = Number((/is at least (\d+) kcal \(never below/.exec(text) || [])[1] || 0);
    const big = (m: any) => { const f = usual && m.kcal < usual * 1.05 ? usual * 1.05 / m.kcal : 1; if (f === 1) return m; const r = (x: number) => Math.round(x * f);
      return { ...m, kcal: r(m.kcal), protein: r(m.protein), carbs: r(m.carbs), fats: r(m.fats), fiber: r(m.fiber), items: m.items.map((it: any) => ({ ...it, grams: r(it.grams) })), grain: m.grain && { ...m.grain, grams: r(m.grain.grams) } }; };
    which = { ...which, meals: which.meals.map((m: any, i: number) => ({ ...big(m), ...(lite ? { swaps: undefined, alchemy: undefined } : {}), planned_around: ids.slice(i, i + 3), for_you: "Layout sample: this line will say why the plate suits you today." })) };
  }
  // safety round 5, planted token: when the typed text carries "zqxplant" (or the plate under a one-tap carries the planted name), every free
  // string the model returns is replaced. Name fields get the name Qvxname; every other string gets a sentence with the token Zqxjvoq, which
  // must never reach the screen or the logged record. made_of and grain_made_of are kept so the plate can pass and the screen has something
  // to show (np-core walks those fields one by one in test/safety/check.js).
  if (/zqxplant|Qvxname/.test(text)) which = plant(which, b.generationConfig?.responseSchema, "");
  if (!b.generationConfig?.responseSchema || b.generationConfig.responseMimeType !== "application/json") return new Response("no schema", { status: 400 });
  if (Bun.env.SAVE_PROMPTS) await Bun.write(`/tmp/last-prompt-${isMenu ? "menu" : /THE DISH/.test(text) ? "rescue" : "meals"}.txt`, text);
  await new Promise(r => setTimeout(r, Number(Bun.env.DELAY || 1200)));
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(which) }] }, finishReason: "STOP" }], usageMetadata: { calls } });
} });
console.log("mock gemini on 8787");
