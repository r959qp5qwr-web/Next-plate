// Rule checks on the built page's np-core (the same code the server runs).
// node test/rules/check.js [page]  -> exit 0 when every rule holds, 1 otherwise.
// Rule 3: with diabetes the grain stays on the plate, including after any swap the app offers; a grain-free stand-in is not a grain.
// Rule 4: the owner's banned words never reach the person in text the model writes. Kidney condition and pregnancy are referred.
const fs = require('fs');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const fx = require('../v5/fixture.js'), fxm = require('../v6/fixture-menu.js');
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
let bad = 0;
function ok(cond, what) { console.log((cond ? 'ok   ' : 'FAIL ') + what); if (!cond) bad++; }
const meal = fx.meals.meals[0];
for (const slot of ['lunch', 'dinner', 'breakfast']) {
  const p = readProfile(Object.assign({}, P)); p.slot = slot;
  const c = checkMeal(JSON.parse(JSON.stringify(meal)), p);
  ok(!!c.meal, `diabetes ${slot}: the fixture plate passes the check`);
  const base = c.meal ? c.meal.swaps.base.map(s => s.food) : [];
  ok(base.length > 0 && base.every(f => GRAINW.test(f)), `diabetes ${slot}: every base swap is a grain (${base.join(' | ')})`);
  ok(!base.some(f => /cauliflower/i.test(f)), `diabetes ${slot}: the cauliflower mash swap is not offered`);
}
{ // the tune path (swaps asked for after the plate) goes through the same check
  const pl = plan('tune', { profile: Object.assign({}, P), slot: 'dinner', meal: Object.assign({}, meal, { minutes: meal.prepMinutes }) });
  ok(!!pl.check, 'tune: plan accepted');
  const r = pl.check ? pl.check({ swaps: meal.swaps, alchemy: {} }) : null;
  const base = r && r.swaps ? r.swaps.base.map(s => s.food) : [];
  ok(base.length > 0 && base.every(f => GRAINW.test(f)), `tune, diabetes dinner: every base swap is a grain (${base.join(' | ')})`);
}
{ // without diabetes the swap stays on offer
  const p = readProfile(Object.assign({}, P, { health: 'none' })); p.slot = 'dinner';
  const c = checkMeal(JSON.parse(JSON.stringify(meal)), p);
  ok(c.meal && c.meal.swaps.base.some(s => /cauliflower/i.test(s.food)), 'no diabetes: the cauliflower mash swap stays on offer');
}
{ // a plate with no grain is dropped with diabetes
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const c = checkMeal(JSON.parse(JSON.stringify(fx.meals.meals[1])), p);
  ok(c.drop === 'diabetes-grain', 'diabetes dinner: a plate with no grain is dropped');
}
{ // kidney and pregnancy never reach the model
  for (const h of ['kidney', 'preg']) {
    const r = plan('meals', { profile: Object.assign({}, P, { health: h }), ctx: { meal: 'dinner' } });
    ok(r.reply && r.reply.status === 'refer', `${h}: referred, not planned`);
  }
}

// ---- Rule 3, the grain test itself. The oracle is this fixed list, not the page's own word list (Critic round 7).
const STANDINS = ['Cauliflower rice', 'Cauli rice', 'Broccoli rice', 'Zucchini noodles', 'Courgette noodles', 'Shirataki noodles', 'Konjac rice', 'Konjac noodles',
  'Konjac fried rice', 'Kelp noodles', 'Palmini pasta', 'Cabbage noodles', 'Cauliflower roti', 'Almond flour roti', 'Coconut flour bread', 'Coconut flour paratha',
  'Keto bread', 'Keto roti', 'Low-carb roti', 'Grain-free bread', 'Cloud bread', '‘Cauliflower rice’ with jeera'];
const GRAINS = ['Jowar roti', 'Bajra roti', 'Ragi dosa', 'Hand-pounded brown basmati', 'Foxtail millet khichdi', 'Whole wheat roti', 'Lemon rice', 'Coconut rice',
  'Broccoli fried rice', 'Gobi paratha', 'Cauliflower paratha', 'Methi thepla', 'Vegetable hakka noodles', 'Multigrain bread', 'Oats chilla with 1 phulka', 'Vegetable upma'];
{
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const swapOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], { food: f, grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }];
    const c = checkMeal(m, p); return !!(c.meal && c.meal.swaps.base.some(s => s.food === f)); };
  const plateOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { food: f }) : i);
    m.title = 'Paneer tikka plate'; m.subtitle = 'With palak'; return checkMeal(m, p); };
  const offered = STANDINS.filter(swapOf), passed = STANDINS.filter(f => plateOf(f).meal);
  ok(!offered.length, 'diabetes: no grain-free stand-in is offered as a base swap' + (offered.length ? ' (offered: ' + offered.join(', ') + ')' : ''));
  ok(!passed.length, 'diabetes: a plate whose only base is a grain-free stand-in is dropped' + (passed.length ? ' (passed: ' + passed.join(', ') + ')' : ''));
  const lost = GRAINS.filter(f => !swapOf(f));
  ok(!lost.length, 'diabetes: every true grain stays on offer as a base swap' + (lost.length ? ' (dropped: ' + lost.join(', ') + ')' : ''));
}

// ---- Rule 4, the owner's banned words, in every field the model writes for the person to read (Critic round 7).
const WORDS = ['real', 'quiet', 'quietly', 'simply', 'seamlessly', 'effortlessly', 'exactly', 'just works', 'journey', 'unlock', 'empower', 'smart', 'magic',
  'game-changer', 'revolutionary', 'transform', 'curated', 'tailored', 'personalised', 'holistic', 'wellness journey'];
const WRX = new RegExp('(^|[^a-z])(' + WORDS.map(w => w.replace(/[-\s]/g, '[\\s-]')).join('|') + ')(?![a-z])', 'i');
function texts(o, keep, path, out) { out = out || []; path = path || '';
  if (typeof o === 'string') { if (!keep.some(k => path.endsWith(k))) out.push([path, o]); }
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) texts(o[k], keep, path + '.' + k, out);
  return out; }
function clear(label, out, keep) { const hits = texts(out, keep || []).filter(([, t]) => WRX.test(t));
  ok(!hits.length, label + (hits.length ? ' (shown: ' + hits.map(([k, t]) => k + '="' + t + '"').join('; ') + ')' : '')); }
{ // plates: read, for_you, title, subtitle, items, why, taste, swaps, one-tap changes
  const m = JSON.parse(JSON.stringify(meal));
  Object.assign(m, { title: 'Quiet comfort khichdi plate', subtitle: 'A smart, tailored dinner', for_you: 'This satisfies real hunger without extra grain.', taste: ['smoky', 'real', 'fresh'] });
  m.why[1] = { pair: 'Lemon + palak', effect: 'Simply helps the iron, quietly.' };
  m.swaps.protein[2] = { food: 'Magic paneer bhurji', grams: 150, deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
  m.alchemy.gut.note = 'A holistic, gentle version for a quiet stomach.';
  const clean2 = JSON.parse(JSON.stringify(meal)); clean2.alchemy.express.note = 'Air-fried paneer, transformed in ten minutes.';
  const pl = plan('meals', { profile: Object.assign({}, P), ctx: { meal: 'dinner' } });
  ok(!!pl.check, 'meals: plan accepted');
  const out = pl.check({ status: 'ok', read: 'A quiet, real evening: dinner carries the protein.', meals: [m, clean2, fx.meals.meals[2]] });
  clear('plates: no banned word in any shown field', out);
  ok(out.meals.length >= 2, 'plates: the plates themselves still come through (' + out.meals.length + ')');
  const t = plan('tune', { profile: Object.assign({}, P), slot: 'dinner', meal: Object.assign({}, meal, { minutes: meal.prepMinutes }) });
  clear('swaps and one-tap changes after the plate: no banned word', t.check({ swaps: m.swaps, alchemy: Object.assign({}, m.alchemy, { express: clean2.alchemy.express }) }));
}
{ // Rescue: the dish name is the person's own; warning, breakdown and moves are the model's voice
  const r = JSON.parse(JSON.stringify(fx.rescue)); r.dish.warning = 'A real heavy plate'; r.dish.breakdown = 'Polished rice, quietly heavy.'; r.hacks[0].title = 'Simply eat the raita first';
  const pl = plan('rescue', { profile: Object.assign({}, P), ctx: { meal: 'dinner', text: 'mutton biryani' } });
  clear('Rescue: no banned word in the model\'s own fields', pl.check(r), ['.dish.name']);
}
{ // the menu: names copied from the menu keep their words; the model's portion, ask, tip and leave reasons do not carry banned words
  const r = JSON.parse(JSON.stringify(fxm.reply)); r.dishes[0].ask = 'Ask for a quiet hand with the butter'; r.dishes[2].portion = '1 bowl, exactly 300 g';
  r.tip = 'Simply start with the salad.'; r.leave[0].why = 'A real heavy gravy for a dinner.';
  const pl = plan('menu', { profile: Object.assign({}, P, { health: 'none' }), ctx: { meal: 'dinner', text: fxm.typed } });
  const out = pl.check(r);
  clear('menu: no banned word in the model\'s own fields', out, ['.name', '.with', '.place']);
}
{ // the meal log: what the person ate keeps their words; the model's assumption line does not carry banned words
  const r = JSON.parse(JSON.stringify(fx.log)); r.assumed = 'Assumed a real, standard home portion.';
  const pl = plan('log', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: '2 aloo paratha with curd' } });
  clear('log: no banned word in the assumption line', pl.check(r), ['.title', '.food']);
}
{ // every prompt carries the word rule
  const ks = [['meals', { ctx: { meal: 'dinner' } }], ['rescue', { ctx: { meal: 'dinner', text: 'dosa' } }], ['menu', { ctx: { meal: 'dinner', text: fxm.typed } }],
    ['log', { ctx: { meal: 'lunch', text: 'dosa' } }], ['tune', { slot: 'dinner', meal: Object.assign({}, meal, { minutes: 18 }) }]];
  for (const [k, b] of ks) { const pl = plan(k, Object.assign({ profile: Object.assign({}, P) }, b));
    ok(pl.prompt && /Never use any of these words: real, quiet/.test(pl.prompt), k + ': the prompt asks for none of the banned words'); }
}
console.log(bad ? `${bad} rule check(s) failed` : 'every rule check holds');
process.exit(bad ? 1 : 0);
