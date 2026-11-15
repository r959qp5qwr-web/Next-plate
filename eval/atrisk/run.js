// At-risk sample: raw live replies for profiles the earlier eval never covered (usefulness brief, 15 Nov).
//   NP_KEY=<evaluation code> node eval/atrisk/run.js <base-url> <label> [repeats]
// The code is read from the environment and never written out. Results: eval/atrisk/results-<label>.json
const fs = require('fs'), path = require('path');
const [,, BASE, LABEL = 'run', REP = '2'] = process.argv, KEY = process.env.NP_KEY || '';
const baseP = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const baseC = { lite: true, meal: 'lunch', time: '1:10 pm', mode: 'desk', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5 };
const menuC = { lite: true, meal: 'dinner', time: '8:30 pm', mode: 'desk', appetite: 5 };
const read = f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
const jobs = [];
for (let r = 0; r < Number(REP); r++) read('scenarios.json').forEach(s => jobs.push({ s, r, c: baseC }));
read('scenarios-menu.json').forEach(s => jobs.push({ s, r: 0, c: menuC }));
(async () => {
  const out = [];
  for (const { s, r, c: c0 } of jobs) {
    const p = Object.assign({}, baseP, s.p), c = Object.assign({}, c0, s.c), t0 = Date.now();
    let status = 0, j = {};
    try { const res = await fetch(BASE + '/api/' + s.kind, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: KEY, profile: p, ctx: c, file: s.file || {} }) }); status = res.status; j = await res.json(); }
    catch (e) { j = { code: 'fetch ' + e }; }
    const got = status === 200 ? j.status : 'http-' + status + ':' + (j.code || '');
    out.push({ id: s.id, run: r, kind: s.kind, profile: p, ctx: c, got, ms: Date.now() - t0, reply: j });
    const shown = s.kind === 'menu' ? (j.orders || []).map(o => o.name) : (j.meals || []).map(m => m.title);
    console.log(`${got.padEnd(8)} ${s.id.padEnd(46)} r${r} ${shown.join(' / ')}`);
    await new Promise(z => setTimeout(z, Number(process.env.GAP || 400)));
  }
  fs.writeFileSync(path.join(__dirname, `results-${LABEL}.json`), JSON.stringify(out, null, 1));
  console.log(`\n${out.length} calls, ${out.filter(x => x.got === 'ok').length} ok`);
})();
