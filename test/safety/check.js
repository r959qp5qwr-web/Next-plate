// Safety invariants (docs/SAFETY-INVARIANTS.md) on the built page's np-core, the code the server runs.
// Cases come from test/safety/lexicon.json, kept apart from the engine's own lists. Never weaken a case to pass: fix the engine.
// usage: node test/safety/check.js [hosted/v6/index.html]
const fs = require('fs'), path = require('path');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8'));
const fx = require('../v5/fixture.js');
const BASE = { goal: 'lose', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const prof = (o, slot) => { const p = readProfile(Object.assign({}, BASE, o)); p.slot = slot || 'lunch'; return p; };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = s => /[^aeiou]y$/.test(s) ? s.slice(0, -1) + 'ies' : /(s|sh|ch|x)$/.test(s) ? s + 'es' : s + 's';
const forms = t => [t, cap(t), plural(t), '2 ' + plural(t), cap(t) + ' curry', 'Dal with ' + plural(t) + ' and salad', 'Cooked with no oil and ' + t, 'Served with ' + t + ', no salt'];

// S1-S4: word level, every category with the profile that rules it out
const RULES = [['S1', 'wheat', { leave: ['wheat'] }], ['S1', 'nut', { leave: ['nut'] }], ['S1', 'dairy', { leave: ['dairy'] }], ['S1', 'soya', { leave: ['soya'] }],
  ['S2', 'meat', { diet: 'veg' }], ['S2', 'meat', { diet: 'jain' }], ['S2', 'meat', { diet: 'egg' }], ['S2', 'egg', { diet: 'veg' }], ['S2', 'egg', { diet: 'vegan' }], ['S2', 'jain', { diet: 'jain' }], ['S2', 'dairy', { diet: 'vegan' }],
  ['S3', 'salty', { health: 'bp' }], ['S4', 'sweet', { health: 'diabetes' }]];
for (const [id, cat, o] of RULES) for (const t of L[cat]) for (const f of forms(t)) add(id, crosses(f, prof(o)), `${JSON.stringify(o)}: "${f}"`);
// none of these may be ruled out by the rule next to them (a false hit hides good food)
for (const [cat, o] of [['notWheat', { leave: ['wheat'] }], ['notNut', { leave: ['nut'] }], ['notMeat', { diet: 'veg' }], ['notEgg', { diet: 'veg' }]])
  for (const t of L[cat]) add('S1-S2 no false hit', !crosses(t, prof(o)), `${JSON.stringify(o)}: "${t}" was ruled out`);

// S1-S2 on whole plates: the item, the plate's grain and what it is made of, and a swap's made_of
const plateWith = (food, madeOf) => { const m = JSON.parse(JSON.stringify(fx.meals.meals[0])); m.title = 'Dal with ' + food; m.items[1] = { food: cap(food), grams: 80, group: 'carbs' }; m.grain = { food: cap(food), made_of: madeOf, grams: 80 }; return m; };
for (const t of L.wheat) { const c = checkMeal(plateWith(plural(t), 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, `wheat left out, plate "Dal with ${plural(t)}" was offered`); }
{ const c = checkMeal(plateWith('soft flatbread', 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, 'wheat left out, "soft flatbread" made of whole wheat was offered'); }
{ const m = JSON.parse(JSON.stringify(fx.meals.meals[0])); m.swaps = { protein: [], base: [{ food: 'Soft flatbread', made_of: 'whole wheat', grams: 60, deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 }] };
  const c = checkMeal(m, prof({ leave: ['wheat'] })); add('S1 swap', !c.meal || !c.meal.swaps.base.some(s => /flatbread/i.test(s.food)), 'wheat left out, a base swap made of whole wheat was offered'); }
for (const t of L.meat) { const m = JSON.parse(JSON.stringify(fx.meals.meals[0])); m.items[0] = { food: cap(plural(t)) + ' tikka', grams: 150, group: 'protein' }; const c = checkMeal(m, prof({ diet: 'veg' })); add('S2 plate', !c.meal, `vegetarian, plate with "${m.items[0].food}" was offered`); }

// S1 on menu orders: the order, its side, what its grain is made of
const menuOrder = (name, side, madeOf, o) => { const pl = plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'MAINS\n' + name + ' 240\n' } });
  const d = { as_written: name, portion: '1 plate, about 350 g', kcal: 520, protein: 22, carbs: 60, fats: 18, fiber: 6, ask: '', grain_made_of: madeOf, grain_grams: 80, with: side, with_kcal: side ? 120 : 0, with_protein: side ? 3 : 0, with_carbs: side ? 22 : 0, with_fats: side ? 2 : 0, with_fiber: side ? 2 : 0 };
  return ((pl.check({ status: 'ok', place: 'Restaurant', dishes: [d], leave: [], tip: '' }).orders) || []).length > 0; };
for (const t of ['kulcha', 'thepla', 'puri', 'bhatura', 'phulka']) { add('S1 menu', !menuOrder('Chole', '2 ' + plural(t), 'wheat', { leave: ['wheat'] }), `wheat left out, "Chole with 2 ${plural(t)}" was offered`); }
add('S1 menu', !menuOrder('Chole with soft bread', '', 'wheat', { leave: ['wheat'] }), 'wheat left out, an order whose grain is made of wheat was offered');

// S1 on Rescue moves
for (const t of ['ghee', 'malai', 'thayir', 'makhan']) { const pl = plan('rescue', { profile: Object.assign({}, BASE, { leave: ['dairy'] }), ctx: { meal: 'lunch', text: 'Dal khichdi' } });
  const r = pl.check({ status: 'ok', dish: { name: 'Dal khichdi', portion: '1 plate, about 300 g', kcal: 420, protein: 14, carbs: 60, fats: 12, fiber: 6 }, hacks: [{ title: 'Add a spoon of ' + t + ' on top', kind: 'add', deltaKcal: 60, deltaProtein: 0, deltaCarbs: 0, deltaFats: 6, deltaFiber: 0 }, { title: 'Eat a bowl of salad first, about 100 g', kind: 'sequence', deltaKcal: 20, deltaProtein: 1, deltaCarbs: 4, deltaFats: 0, deltaFiber: 2 }] });
  add('S1 rescue', !(r.hacks || []).some(h => new RegExp(t, 'i').test(h.title)), `dairy left out, Rescue move "Add a spoon of ${t}" was offered`); }

// S6: on insulin or sugar tablets, a home meal never falls below its usual size
{ const p = readProfile(Object.assign({}, BASE, { diet: 'veg', health: 'diabetes', meds: 'yes' }));
  for (const meal of ['breakfast', 'lunch', 'dinner']) for (const k of [0, 300, 600, 900, 1100, 1500]) for (let ap = 1; ap <= 10; ap++) {
    const before = meal === 'breakfast' ? [] : [{ meal: 'breakfast', kind: 'had', kcal: k, protein: 20 }];
    const pl = planDay(p, { today: { meals: before, fiber: 0, kcal: k } }, meal, ap);
    add('S6', pl.target.kcal >= pl.usual.kcal, `${meal}, ${k} kcal eaten before, appetite ${ap}: target ${pl.target.kcal} under usual ${pl.usual.kcal}`); } }

// S7: typed disclosures are referred on every free-text path; ordinary text is not
for (const kind of ['meals', 'menu', 'rescue', 'log']) {
  for (const t of L.referText) { const pl = plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } });
    add('S7', !!(pl && pl.reply && pl.reply.status === 'refer'), `${kind}: "${t}" went to the model`); }
  for (const t of L.notReferText) { const pl = plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } });
    add('S7 no false hit', !(pl && pl.reply && pl.reply.status === 'refer'), `${kind}: "${t}" was referred`); } }
for (const conds of [['kidney'], ['preg'], ['diabetes', 'kidney'], ['diabetes', 'preg'], ['bp', 'kidney']]) {
  const h = conds.includes('kidney') ? 'kidney' : 'preg'; const pl = plan('meals', { profile: Object.assign({}, BASE, { health: h, conds }), ctx: { meal: 'lunch' } });
  add('S7', !!(pl && pl.reply && pl.reply.status === 'refer'), `ticked ${conds.join(' + ')} was planned`); }

// report
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       … ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log('S5, S8, S9: test/rules/check.js. S10, S11, S12: review states in test/ux/review.js.');
console.log(fail ? `${fail} counter-example(s): the invariants do not hold` : 'every safety invariant holds');
process.exit(fail ? 1 : 0);
