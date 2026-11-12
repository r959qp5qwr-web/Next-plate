// "Read the menu" engine check (docs/FEATURE-menu.md, section 6): eight menus across vegetarian, diabetes, non-veg and leave-out profiles.
//   node eval/v6/run-menu.js <base-url> <code> [label]     (results in eval/v6/results-menu-<label>.json)
// Against the live engine this needs EVAL_CODE and the owner's "Deploy." first. Against the local mock (test/v5/mock-gemini.ts) it only
// proves the runner: the mock answers every menu with the same North Indian fixture, so the other typed menus come back "empty".
const fs = require('fs'), path = require('path');
const [,, BASE, CODE = '', LABEL = 'run'] = process.argv;
const sc = JSON.parse(fs.readFileSync(path.join(__dirname, 'scenarios-menu.json'), 'utf8')).filter(c => !process.env.ONLY || process.env.ONLY.split(',').includes(c.id));
const baseP = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const baseC = { meal: 'dinner', time: '8:30 pm', mode: 'focus', appetite: 5 };
const words = t => ' ' + String(t || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
const GRAIN = /roti|phulka|rice|millet|jowar|bajra|ragi|dalia|oats|poha|upma|idli|dosa|uttapam|khichdi|paratha|bread|toast|quinoa|chapati|thepla|pulao|biryani|naan|kulcha|noodles|pasta|pongal|pav/i;
(async () => {
  const out = [];
  for (const s of sc) {
    const p = Object.assign({}, baseP, s.p), c = Object.assign({}, baseC, s.c), t0 = Date.now(), body = { key: CODE, profile: p, ctx: c, file: s.file || {} };
    if (s.image) body.image = fs.readFileSync(path.join(__dirname, s.image)).toString('base64');
    let status = 0, j = {};
    try { const r = await fetch(BASE + '/api/menu', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); status = r.status; j = await r.json(); }
    catch (e) { j = { code: 'fetch ' + e }; }
    const ms = Date.now() - t0, got = status === 200 ? j.status : 'http-' + status + ':' + (j.code || ''), expect = s.expect || 'ok', issues = [];
    if (got === 'ok') {
      const orders = j.orders || [], menu = words(c.text), offered = Object.keys(j.hooks || {}), shown = JSON.stringify([orders.map(o => [o.name, o.portion, o.ask, o.with]), j.tip, j.place]);   // the leave list names dishes to skip, so a barred dish there is correct, not offered
      const floor = /must not come in under about (\d+) kcal/.exec(j.prompt || '');
      if (!orders.length || orders.length > 3) issues.push('orders ' + orders.length);
      if (orders.length < 2 && !j.note) issues.push('only one order on a menu that fits');   // dishes removed by a check are the checks doing their job; a single survivor is not a choice
      orders.forEach((o, i) => {
        if (c.text && !menu.includes(words(o.name))) issues.push('not on the menu: ' + o.name);
        ['kcal', 'protein', 'carbs', 'fats', 'fiber'].forEach(k => { if (!Number.isFinite(o.n && o.n[k])) issues.push('no ' + k + ': ' + o.name); });
        if (i && o.fit != null && orders[i - 1].fit < o.fit) issues.push('not ranked by fit: ' + o.name);
        if (p.health === 'diabetes' && c.meal !== 'snack' && !GRAIN.test(o.name + ' ' + o.portion + ' ' + o.with)) issues.push('diabetes order without a grain: ' + o.name);
        if (floor && o.n.kcal < +floor[1]) issues.push(`on diabetes medicine, ${o.name} is ${o.n.kcal} kcal, under the usual ${floor[1]}`);
        (o.planned || []).forEach(id => { if (!offered.includes(id)) issues.push('cited a hook that was not offered: ' + id); });
        if (!(o.planned || []).length && offered.length) issues.push('no planned_around: ' + o.name);
      });
      (j.leave || []).forEach(l => { if (c.text && !menu.includes(words(l.name))) issues.push('leave is not on the menu: ' + l.name); });
      if ((j.leave || []).length > 3) issues.push('leave ' + j.leave.length);
      if (!j.tip) issues.push('no eating-order tip');
      if (s.never && new RegExp('\\b(' + s.never + ')', 'i').test(shown)) issues.push('shows a word this person must not be offered: ' + new RegExp('\\b(' + s.never + ')', 'i').exec(shown)[1]);
      if (j.note && !(j.moves || []).length) issues.push('nothing fits, but no moves');
    }
    const ok = got === expect && !issues.length;
    out.push({ id: s.id, expect, got, ok, ms, issues, dropped: j.dropped || {}, reply: j });
    const brief = got === 'ok' ? (j.note ? '[nothing fits] ' : '') + j.orders.map(o => `${o.name}${o.with ? ' + ' + o.with : ''} [≈ ${o.n.kcal} kcal, ≈ ${o.n.protein} g, fit ${o.fit}, ${o.rise}]`).join(' / ') + ' | leave: ' + (j.leave || []).map(l => l.name).join(', ') + ' | dropped ' + JSON.stringify(j.dropped || {}) : '';
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${s.id.padEnd(34)} got=${got} ${ms}ms ${issues.join(' | ')}\n       ${brief}`);
    await new Promise(r => setTimeout(r, Number(process.env.GAP || 500)));
  }
  fs.writeFileSync(path.join(__dirname, `results-menu-${LABEL}.json`), JSON.stringify(out, null, 1));
  const n = out.length, pass = out.filter(x => x.ok).length;
  console.log(`\n${pass}/${n} passed; median ${out.map(x => x.ms).sort((a, b) => a - b)[n >> 1]} ms`);
})();
