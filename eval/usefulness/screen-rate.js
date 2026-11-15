// Reason line, the other way (usefulness brief step 2): how many of the model's own "why this plate" sentences (for_you) on the clean corpus
// would pass a targeted screen for tier-1 harms, on profiles without diabetes or medicines. Measurement only; the build shows the engine line.
//   node eval/usefulness/screen-rate.js [build dir] [repo dir]
const fs = require('fs'), vm = require('vm'), path = require('path');
const [, , CAND = '.', REPO = '.'] = process.argv;
const page = fs.readFileSync(path.join(CAND, 'hosted/v6/index.min.html'), 'utf8'); const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const scen = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(REPO, 'eval/v6/scenarios.json'))).map(s => [s.id, s]));
const baseP = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const EATLESS = /\b(?:skip|skipping|cut|cutting|drop|dropping|avoid|avoiding|less|smaller|halve|half|without|no)\b[^.]{0,30}\b(?:rice|roti|rotis|grain|grains|chawal|phulka|carbs?|bread|meal|portion)\b/i;
const UNIT = /\b(?:katoris?|bowls?|cups?|glass(?:es)?|spoons?|tbsp|tsp|ladles?|fist|handful)\b/i;
let n = 0, pass = 0, med = 0; const why = {};
for (const f of ['results-live-r33.json', 'results-live-r37.json']) for (const x of JSON.parse(fs.readFileSync(path.join(REPO, 'eval/v6', f)))) {
  const s = scen[x.id]; if (!s || s.kind !== 'meals' || !x.reply || !x.reply.raw || x.got !== 'ok') continue;
  const p = a.readProfile(Object.assign({}, baseP, s.p)); if (!p) continue;
  for (const m of x.reply.raw.meals || []) { const t = String(m.for_you || ''); if (!t) continue;
    if (p.health === 'diabetes') { med++; continue; }   // medicines apply only with diabetes (readProfile defaults meds to "unsure")   // model sentences stay off for these profiles
    n++; const r = a.crosses(t, p) ? 'barred food' : a.supp(t) ? 'supplement' : UNIT.test(t) ? 'household unit' : EATLESS.test(t) ? 'drop the grain or eat less' : a.CLAIM.test(t) ? 'claim' : '';
    if (r) why[r] = (why[r] || 0) + 1; else pass++; } }
console.log(JSON.stringify({ modelSentences: n, passScreen: pass, rate: Math.round(100 * pass / Math.max(1, n)) + ' %', failed: why, offForDiabetesOrMedicines: med }));
