// Stand-in for Google's API on localhost: returns the fixture in Gemini's response shape, after a short delay.
const fx = require("./fixture.js");
let calls = 0;
Bun.serve({ port: 8787, async fetch(req) {
  const b: any = await req.json(); const text = b.contents[0].parts[0].text; calls++;
  const which = /THE DISH/.test(text) ? fx.rescue : fx.meals;
  if (!b.generationConfig?.responseSchema || b.generationConfig.responseMimeType !== "application/json") return new Response("no schema", { status: 400 });
  await Bun.write(`/tmp/claude-0/last-prompt-${/THE DISH/.test(text) ? "rescue" : "meals"}.txt`, text);
  await new Promise(r => setTimeout(r, Number(Bun.env.DELAY || 1200)));
  return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(which) }] }, finishReason: "STOP" }], usageMetadata: { calls } });
} });
console.log("mock gemini on 8787");
