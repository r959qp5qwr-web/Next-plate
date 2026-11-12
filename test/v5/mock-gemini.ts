// Stand-in for Google's API on localhost: returns the fixture in Gemini's response shape, after a short delay.
const fx = require("./fixture.js");
let calls = 0;
Bun.serve({ port: 8787, async fetch(req) {
  const b: any = await req.json(); const text = b.contents[0].parts[0].text; calls++;
  let which = /THE DISH/.test(text) ? fx.rescue : /WHAT THEY ATE/.test(text) ? fx.log : /THE PLATE:/.test(text) ? { swaps: fx.meals.meals[0].swaps, alchemy: fx.meals.meals[0].alchemy } : fx.meals;
  if (which === fx.meals) {
    const lite = !b.generationConfig.responseSchema.properties.meals.items.properties.alchemy;                      // v6: cite only hooks the prompt offered
    const ids = [...text.matchAll(/^- \[([a-z0-9_]+)\]/gm)].map(m => m[1]);
    which = { ...which, meals: which.meals.map((m: any, i: number) => ({ ...m, ...(lite ? { swaps: undefined, alchemy: undefined } : {}), planned_around: ids.slice(i, i + 3), for_you: "Layout sample: this line will say why the plate suits you today." })) };
  }
  if (!b.generationConfig?.responseSchema || b.generationConfig.responseMimeType !== "application/json") return new Response("no schema", { status: 400 });
  await Bun.write(`/tmp/claude-0/last-prompt-${/THE DISH/.test(text) ? "rescue" : "meals"}.txt`, text);
  await new Promise(r => setTimeout(r, Number(Bun.env.DELAY || 1200)));
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(which) }] }, finishReason: "STOP" }], usageMetadata: { calls } });
} });
console.log("mock gemini on 8787");
