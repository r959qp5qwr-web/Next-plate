// Codex's re-audit probes (scratchpad codex-reaudit/probes.cjs, on 06d880f), ported with the assertions inverted: a defect fails here.
//   node test/safety/codex.js [page.html] [app.js]
// Its app.js functions are found by name and brace matching, not by the order of functions in the file (a crash here is a failure, not a pass).
// Adapted to the current design, each said where it is:
//   - the positive plate declares "plain" on its plain items: an empty list drops (the owner's literal rule);
//   - the brand log keeps the client's typed words as the title; an item is listed only in words they typed;
//   - tier 2 by the usefulness brief, printed as TRACKED and not failing: a regional name with a wrong but non-empty tag (Kori rotti, Payesh,
//     Poondu rasam), and a medicines plate with very little carbohydrate (carbohydrate amounts are an owner and clinician decision).
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const page = fs.readFileSync(process.argv[2] || path.join(ROOT, 'hosted/v6/index.min.html'), 'utf8');
const src = fs.readFileSync(process.argv[3] || path.join(ROOT, 'src/v6/app.js'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const clone = x => JSON.parse(JSON.stringify(x));
const PT = (() => { try { return a.TAGS.indexOf('plain') >= 0 ? ['plain'] : []; } catch (e) { return []; } })();
const base = { diet: 'veg', health: 'none', region: 'n', goal: 'hold', leave: [], sex: 'm', age: 50, cm: 170, kg: 75, act: 'light', meds: 'no' };
const med = { ...base, health: 'diabetes', meds: 'yes', goal: 'lose' };
const plate = () => ({ title: 'Sprouted moong with jowar roti', subtitle: 'Sprouted moong, jowar roti, cucumber and tomato', contains: ['grain'],
  items: [{ food: 'Sprouted moong', grams: 200, group: 'protein', contains: PT }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber and tomato', grams: 100, group: 'greens', contains: PT }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, kcal: 490, protein: 27, carbs: 60, fats: 14, fiber: 14, why: [], swaps: { protein: [], base: [] }, alchemy: {}, planned_around: [], taste: [] });
const reply = m => ({ status: 'ok', refer_reason: 'none', meals: [m] });
const route = (p, text = '', kind = 'meals', more = {}) => a.plan(kind, { profile: p, ctx: { meal: 'lunch', text }, ...more });
let n = 0, bad = 0;
const test = (name, fn) => { n++; let ok = false, why = ''; try { ok = fn(); } catch (e) { why = String(e).slice(0, 160); } if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (why ? ' (' + why + ')' : '')); };
const track = (name, fn) => { let v; try { v = fn(); } catch (e) { v = 'error ' + String(e).slice(0, 80); } console.log('TRACKED (tier 2) ' + name + ': ' + v); };
function fnSrc(name) { const at = src.indexOf('function ' + name + '('); if (at < 0) throw new Error('no function ' + name + ' in app.js'); let d = 0;
  for (let i = src.indexOf('{', at); i < src.length; i++) { if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (!d) return src.slice(at, i + 1); } } throw new Error('unbalanced ' + name); }
const load = (...names) => names.forEach(x => vm.runInContext(fnSrc(x), a));

test('positive plate is retained', () => route(base).check(reply(plate())).meals.length === 1);
for (const [name, diet] of [['Kori rotti', 'veg'], ['Payesh', 'vegan'], ['Poondu rasam', 'jain']]) {
  const m = plate(); m.items[0] = { food: name, grams: 180, group: 'protein', contains: ['grain'] }; m.title = name + ' with jowar roti'; const p = { ...base, diet };
  track(name + ' with a wrong but non-empty tag, on a plate', () => route(p).check(reply(m)).meals.length ? 'offered' : 'dropped');
  for (const tags of [undefined, [], [diet === 'veg' ? 'meat' : diet === 'vegan' ? 'dairy' : 'onion_garlic']]) { const c = clone(m); c.items[0].contains = tags;
    test(name + ' with ' + JSON.stringify(tags) + ' tags is dropped', () => route(p).check(reply(c)).status === 'empty'); } }
for (const kind of ['meals', 'menu', 'rescue', 'log']) {
  for (const text of ['I am pregnant', 'I have kidney disease']) test(kind + ' refers "' + text + '"', () => { const r = route(base, text, kind); return !!r.reply && r.reply.status === 'refer'; });
  for (const text of ['I took insulin and feel shaky', 'my sugar dropped to 50 and I feel dizzy', 'chest pain after lunch'])
    test(kind + ' refers urgent "' + text + '" before the model', () => { const r = route(base, text, kind); return !!r.reply && r.reply.status === 'refer' && !r.check; }); }
test('medication target stays usual (880 of 2190)', () => { const p = a.planDay(a.readProfile(med), a.readFile({ today: { kcal: 2000, protein: 50, meals: [{ meal: 'breakfast', kind: 'had', kcal: 2000, protein: 50 }] } }), 'lunch', 1); return p.target.kcal === 880 && p.usual.kcal === 880 && p.day.kcal === 2190; });
test('missing-body lunch floor is 480 / 600', () => a.medsUsual(a.readProfile({ diet: 'veg', health: 'diabetes', region: 'n', meds: 'yes', sex: 'f' }), 'lunch') === 480 && a.medsUsual(a.readProfile({ diet: 'veg', health: 'diabetes', region: 'n', meds: 'yes', sex: 'm' }), 'lunch') === 600);
track('a medicines plate with 1 g of carbohydrate', () => { const m = plate(); m.kcal = 1000; m.protein = 60; m.carbs = 1; m.fats = Math.round((1000 - 240 - 4) / 9); m.items[1].grams = 30; m.grain.grams = 30; return route(med).check(reply(m)).status; });
// Builder: the steppers from the default never go out of bounds, and the ratio reaches the engine unchanged
test('Builder stays in bounds and the ratio is accepted unchanged', () => { load('rebalance'); let ratio = { protein: 25, greens: 35, carbs: 25, fats: 15 };
  for (const key of [...Array(8).fill('carbs'), ...Array(8).fill('fats')]) { const nx = a.rebalance(ratio, key, 5); if (nx) ratio = nx; }
  const c = a.readCtx({ meal: 'lunch', ratio }, 'meals'); return Object.values(ratio).every(v => v >= 5) && Object.values(ratio).reduce((x, y) => x + y, 0) === 100 && !!c.ratio && ['protein', 'greens', 'carbs', 'fats'].every(k => c.ratio[k] === ratio[k]); });
// figures agree: the 740 / 474 and 1000 / 280 compositions, through the app's own viewOf and composedWhy
load('viewOf', 'swapAt', 'composedWhy', 'plateWhy');
const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
a.C = { meal: 'lunch' }; a.has = c => false; a.profileOut = () => base; a.UI = { swp: 0, swb: 0, alc: {} };
test('740 / 474: no combination a client can tap disagrees, and composedWhy refuses the inconsistent figures', () => {
  const m = plate(); m.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: PT, ...z }, { food: 'Steamed moong', grams: 200, contains: PT, ...z, deltaKcal: 120 }];
  for (const k of ['protein', 'gut']) m.alchemy[k] = { titleSuffix: 'More vegetables', note: 'Add 50 g cucumber.', add_item: 'Cucumber', add_grams: 50, contains: PT, grain_grams_after: 90, minutes: 20, ...z, deltaKcal: 65 };
  const checked = route(base).check(reply(m)).meals[0]; a.UI = { swp: 1, swb: 0, alc: { protein: true, gut: true } };
  const v = a.viewOf(checked), at = 4 * v.n.protein + 4 * v.n.carbs + 9 * v.n.fats;
  return Math.abs(v.n.kcal - at) / v.n.kcal <= 0.15 && a.composedWhy({ kcal: 740, protein: 27, carbs: 60, fats: 14, fiber: 14 }, checked, { plate: true }) !== ''; });
test('1000 / 280 on medicines: no combination disagrees, and composedWhy refuses it', () => {
  const m = plate(); m.kcal = 1000; m.protein = 60; m.carbs = 100; m.fats = 40; m.items.forEach(i => i.grams *= 2); m.items[1].grams = 120; m.grain.grams = 120;
  m.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: PT, ...z }, { food: 'Steamed moong', grams: 200, contains: PT, ...z, deltaProtein: -40, deltaCarbs: -50, deltaFats: -40 }];
  const mo = route(med).check(reply(m)).meals[0]; a.has = c => c === 'diabetes'; a.profileOut = () => med; a.UI = { swp: 1, swb: 0, alc: {} };
  const v = a.viewOf(mo), at = 4 * v.n.protein + 4 * v.n.carbs + 9 * v.n.fats;
  return Math.abs(v.n.kcal - at) / v.n.kcal <= 0.15 && a.composedWhy({ kcal: 1000, protein: 20, carbs: 50, fats: 0, fiber: 10 }, mo, { plate: true }) !== ''; });
test('Rescue dish with inconsistent energy (1000 / 80) is not accepted', () => route(base, 'Rice', 'rescue').check({ status: 'ok', refer_reason: 'none', dish: { name: 'Rice', contains: ['grain'], portion: '200 g', kcal: 1000, protein: 10, carbs: 10, fats: 0, fiber: 1 }, hacks: [{ title: 'A 15-minute walk after the meal', kind: 'move', contains: [], ...z }] }).status !== 'ok');
test('a brand food is logged, in the client\'s own words', () => { const r = route(base, '1 glass Real juice', 'log').check({ status: 'ok', refer_reason: 'none', title: 'Real mixed fruit juice', items: [{ food: 'Real mixed fruit juice', grams: 200, group: 'other' }], kcal: 100, protein: 0, carbs: 25, fats: 0, fiber: 0 });
  return r.status === 'ok' && /real juice/i.test(r.title); });
for (const sex of ['f', 'm', '']) test('no portion move without body figures (' + (sex || 'unset') + ')', () => { const p = { diet: 'veg', health: 'diabetes', meds: 'yes', region: 'n', sex };
  const dish = { as_written: 'Rice', portion: '600 g', contains: ['grain'], with_contains: [], with: '', kcal: 1800, protein: 60, carbs: 300, fats: 40, fiber: 10, grain_made_of: 'rice', grain_grams: 600 };
  return !(route(p, 'MAINS\nRice 200', 'menu').check({ status: 'ok', refer_reason: 'none', dishes: [dish], leave: [] }).moves || []).length; });
test('the nut key is "nut", not "nuts"', () => a.readProfile({ ...base, leave: ['nuts'] }).leave.length === 0 && a.readProfile({ ...base, leave: ['nut'] }).leave[0] === 'nut');
console.log(bad ? `${bad} of ${n} Codex probe(s) fail: a defect is back` : `all ${n} Codex probes hold`);
process.exit(bad ? 1 : 0);
