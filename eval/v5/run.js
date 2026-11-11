// v5 quality check: sends each scenario to a running server, re-checks every reply with the page's own core,
// and saves replies for review.   node eval/v5/run.js <base-url> [access-code] [label]
const fs = require('fs'), path = require('path');
const [,, BASE, CODE = '', LABEL = 'run'] = process.argv;
const core = {}; new Function('out', fs.readFileSync(path.join(__dirname, '../../src/v5/core.js'), 'utf8') + '\nObject.assign(out,{crosses,supp,CLAIM,SAFETY});')(core);
const sc = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios.json'), 'utf8')).filter(c => !process.env.ONLY || process.env.ONLY.split(',').includes(c.id));
const baseP = { diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const baseC = { meal: 'lunch', time: '1:10 pm', mode: 'focus', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5, had: [] };
(async () => {
  const out = [];
  for (const s of sc) {
    const p = Object.assign({}, baseP, s.p), c = Object.assign({}, baseC, s.c), t0 = Date.now();
    let status = 0, j = {};
    try { const r = await fetch(BASE + '/api/' + s.kind, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: CODE, profile: p, ctx: c }) }); status = r.status; j = await r.json(); }
    catch (e) { j = { code: 'fetch ' + e }; }
    const ms = Date.now() - t0, got = status === 200 ? j.status : 'http-' + status + ':' + (j.code || '');
    const issues = [];
    const texts = s.kind === 'meals' ? (j.meals || []).flatMap(m => [m.title, m.subtitle, ...m.items.map(i => i.food), ...m.why.map(w => w.pair + ' ' + w.effect), ...Object.values(m.alchemy).map(a => a.suffix + ' ' + a.note)])
      : j.dish ? [j.dish.name && s.c.text ? '' : j.dish.name, j.dish.warning, j.dish.breakdown, ...(j.hacks || []).map(h => h.title)] : [];
    texts.forEach(t => { if (t && core.crosses(t, p)) issues.push('crosses: ' + t); if (t && core.supp(t)) issues.push('supplement: ' + t); if (t && core.CLAIM.test(t)) issues.push('claim: ' + t); if (/!/.test(t || '')) issues.push('exclamation: ' + t); });
    (j.meals || []).forEach(m => { const e = 4 * m.protein + 4 * m.carbs + 9 * m.fats; if (Math.abs(e - m.kcal) / m.kcal > .15) issues.push('energy: ' + m.title);
      if (p.health === 'diabetes' && !m.items.some(i => i.group === 'carbs')) issues.push('diabetes grain missing: ' + m.title);
      if (Object.keys(m.alchemy).length < 4) issues.push('alchemy ' + Object.keys(m.alchemy).length + '/4: ' + m.title); });
    if (s.kind === 'meals' && j.status === 'ok' && (j.meals || []).length < 3) issues.push('meals ' + (j.meals || []).length + '/3');
    const ok = (s.expect === 'ok' ? got === 'ok' : s.expect === 'refer' ? got === 'refer' : s.expect === 'ok-or-refer' ? ['ok', 'refer'].includes(got) : ['refer', 'empty'].includes(got)) && !issues.filter(x => !/^alchemy|^meals/.test(x)).length;
    out.push({ id: s.id, expect: s.expect, got, ok, ms, dropped: j.dropped || {}, issues, reply: j });
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${s.id.padEnd(26)} got=${got} ${ms}ms dropped=${JSON.stringify(j.dropped || {})} ${issues.join(' | ')}`);
    await new Promise(r => setTimeout(r, Number(process.env.GAP || 1500)));
  }
  fs.writeFileSync(path.join(__dirname, `results-${LABEL}.json`), JSON.stringify(out, null, 1));
  const n = out.length, pass = out.filter(x => x.ok).length;
  console.log(`\n${pass}/${n} passed; median ${out.map(x => x.ms).sort((a, b) => a - b)[n >> 1]} ms`);
})();
