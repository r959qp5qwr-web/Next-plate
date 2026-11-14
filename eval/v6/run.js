// v6 engine check: does Gemini plan around the person's day, and only cite reasons it was given?
//   node eval/v6/run.js <base-url> <code> [label]     (results in eval/v6/results-<label>.json)
const fs = require('fs'), path = require('path');
const [,, BASE, CODE = '', LABEL = 'run'] = process.argv;
const sc = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios.json'), 'utf8')).filter(c => !process.env.ONLY || process.env.ONLY.split(',').includes(c.id));
const baseP = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const baseC = { lite: true, meal: 'lunch', time: '1:10 pm', mode: 'desk', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5 };
(async () => {
  const out = [];
  for (const s of sc) {
    const p = Object.assign({}, baseP, s.p), c = Object.assign({}, baseC, s.c), t0 = Date.now();
    let status = 0, j = {};
    try { const r = await fetch(BASE + '/api/' + s.kind, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: CODE, profile: p, ctx: c, file: s.file || {} }) }); status = r.status; j = await r.json(); }
    catch (e) { j = { code: 'fetch ' + e }; }
    const ms = Date.now() - t0, got = status === 200 ? j.status : 'http-' + status + ':' + (j.code || ''), issues = [];
    if (s.kind === 'meals' && got === 'ok') {
      const offered = Object.keys(j.hooks || {}), tgt = /Target for this meal: about (\d+) kcal and at least (\d+) g protein/.exec(j.prompt || '');
      (s.want || []).forEach(id => { if (!offered.includes(id)) issues.push('hook not offered: ' + id); else if (!j.meals.some(m => (m.planned || []).includes(id))) issues.push('hook offered but never cited: ' + id); });
      j.meals.forEach(m => { if (!(m.planned || []).length && offered.length) issues.push('no planned_around: ' + m.title); if (!m.forYou) issues.push('no for_you: ' + m.title);
        (m.planned || []).forEach(id => { if (!offered.includes(id)) issues.push('cited a hook that was not offered: ' + id); }); });
      const first = j.meals[0];
      if (tgt && first) { const tk = +tgt[1], tp = +tgt[2];
        if (Math.abs(first.kcal - tk) / tk > 0.25) issues.push(`first plate ${first.kcal} kcal vs target ${tk}`);
        if (s.proteinAtLeast && first.protein < tp - 3) issues.push(`first plate ${first.protein} g protein vs target ${tp}`);
        if (s.kcalAtMost && first.kcal > tk * 1.15) issues.push(`first plate ${first.kcal} kcal above a lighter target ${tk}`); }
      if (s.avoid) j.meals.forEach(m => { if (new RegExp('\\b' + s.avoid + '\\b', 'i').test(m.title + ' ' + m.items.map(i => i.food).join(' '))) issues.push('repeats ' + s.avoid + ': ' + m.title); });
      if (j.meals.length < 2) issues.push('meals ' + j.meals.length + '/3');   // one plate removed by a safety check is the checks doing their job; fewer than two is a failure
      if (p.health === 'diabetes' && c.meal !== 'snack') j.meals.forEach(m => { if (!m.items.some(i => /roti|phulka|rice|millet|jowar|bajra|ragi|dalia|oats|poha|upma|idli|dosa|khichdi|paratha|bread|toast|quinoa|chapati|thepla|pulao/i.test(i.food))) issues.push('diabetes plate without a grain: ' + m.title); });
    }
    if (s.kind === 'meals' && got === 'ok' && s.tune && j.meals[0]) {     // the follow-up call: swaps and one-tap changes for the plate on screen
      const m = j.meals[0], t1 = Date.now();
      let tj = {}; try { const r = await fetch(BASE + '/api/tune', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: CODE, profile: p, slot: c.meal, meal: { title: m.title, subtitle: m.subtitle, cuisine: m.cuisine, prepMinutes: m.minutes, minutes: m.minutes, items: m.items, grain: m.grain, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fats: m.fats, fiber: m.fiber, why: [] } }) }); tj = await r.json(); } catch (e) { tj = { code: String(e) }; }
      j.tune = tj; j.tuneMs = Date.now() - t1;
      if (tj.status !== 'ok') issues.push('tune failed: ' + (tj.status || tj.code));
      else { if (Object.keys(tj.alchemy).length < 4) issues.push('one-tap changes ' + Object.keys(tj.alchemy).length + '/4'); if (tj.swaps.protein.length < 2) issues.push('protein swaps ' + tj.swaps.protein.length); }
    }
    if (s.kind === 'log' && got === 'ok' && s.kcalRange && (j.kcal < s.kcalRange[0] || j.kcal > s.kcalRange[1])) issues.push(`log estimate ${j.kcal} kcal outside the plausible range ${s.kcalRange.join(' to ')}`);
    const expect = s.expect || 'ok', ok = got === expect && !issues.length;
    out.push({ id: s.id, expect, got, ok, ms, issues, dropped: j.dropped || {}, reply: j });
    const brief = s.kind === 'meals' && got === 'ok' ? j.meals.map(m => `${m.title} [${m.kcal} kcal, ${m.protein} g] {${(m.planned || []).join(',')}}`).join(' / ') : s.kind === 'log' && got === 'ok' ? `${j.title}: ${j.kcal} kcal, ${j.protein} g protein` : '';
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${s.id.padEnd(28)} got=${got} ${ms}ms${j.tuneMs ? ' +tune ' + j.tuneMs + 'ms' : ''} ${issues.join(' | ')}\n       ${brief}`);
    await new Promise(r => setTimeout(r, Number(process.env.GAP || 500)));
  }
  fs.writeFileSync(path.join(__dirname, `results-${LABEL}.json`), JSON.stringify(out, null, 1));
  const n = out.length, pass = out.filter(x => x.ok).length;
  console.log(`\n${pass}/${n} passed; median ${out.map(x => x.ms).sort((a, b) => a - b)[n >> 1]} ms`);
})();
