// Positive controls (safety round 5, A1): how many names the live model wrote still reach the screen.
// The names are frozen in test/safety/controls.json. This file never edits them; it reports the pass rate, per surface, on any page:
//   node test/safety/controls.js [page.html]
// Each name is placed, with an honest non-empty tag list, on a profile with no food rules (non-veg, no health condition, nothing left out),
// so only the name check can drop it. Codex's sprouted moong plate must pass; the rest is a figure for the owner, not a gate.
const fs = require('fs'), path = require('path');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const C = JSON.parse(fs.readFileSync(path.join(__dirname, 'controls.json'), 'utf8'));
const PT = (() => { try { return TAGS.indexOf('plain') >= 0 ? ['plain'] : []; } catch (e) { return []; } })();
const P = { goal: 'hold', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'm', age: 50, cm: 170, kg: 75, act: 'light', done: true };
const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
const plate = () => ({ title: 'Sprouted moong with jowar roti', subtitle: 'Sprouted moong, jowar roti, cucumber and tomato', cuisine: 'North Indian', prepMinutes: 20, for_you: '', why: [], taste: [], planned_around: [],
  items: [{ food: 'Sprouted moong', grams: 200, group: 'protein', contains: PT }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: PT }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 490, protein: 27, carbs: 60, fats: 14, fiber: 14, swaps: { protein: [], base: [] }, alchemy: {} });
const meals = (m) => { try { return plan('meals', { profile: P, ctx: { meal: 'lunch' } }).check({ status: 'ok', refer_reason: 'none', read: '', meals: [m] }); } catch (e) { return { meals: [] }; } };
const low = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const res = {};
const add = (k, ok, name) => { const r = res[k] = res[k] || { n: 0, pass: 0, fail: [] }; r.n++; if (ok) r.pass++; else r.fail.push(name); };
{ const r = meals(plate()); add('codex plate', (r.meals || []).length === 1, 'Sprouted moong with jowar roti'); }
for (const [k, list] of [['plate item', C.items], ['plate item (titles)', C.titles]]) for (const name of list) {
  const m = plate(); m.items[0] = { food: name, grams: 180, group: 'protein', contains: ['grain'] }; const r = meals(m);
  add(k, (r.meals || []).some(x => (x.items || []).some(i => low(i.food) === low(name))), name); }
for (const name of C.swaps) { const m = plate(); m.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: PT, ...z }, { food: name, grams: 180, contains: ['grain'], ...z }]; const r = meals(m);
  add('protein swap', (r.meals || []).some(x => ((x.swaps || {}).protein || []).some(i => low(i.food) === low(name))), name); }
for (const { dish, side } of C.menus) {
  const sideName = side.replace(/^\d+\s+/, '');
  const text = 'MAINS\n' + dish + ' 240\n' + (side ? sideName + ' 40\n' : '');
  const d = { as_written: dish, portion: 'about 350 g', kcal: 620, protein: 26, carbs: 70, fats: 24, fiber: 6, ask: '', grain_made_of: 'rice', grain_grams: 120, with: side, with_kcal: side ? 120 : 0, with_protein: side ? 3 : 0, with_carbs: side ? 22 : 0, with_fats: side ? 2 : 0, with_fiber: side ? 2 : 0, contains: ['grain'], with_contains: side ? ['grain'] : [], planned_around: [] };
  let r; try { r = plan('menu', { profile: P, ctx: { meal: 'lunch', text } }).check({ status: 'ok', refer_reason: 'none', place: '', dishes: [d], leave: [], tip: '' }); } catch (e) { r = { orders: [] }; }
  const o = (r.orders || [])[0];
  add('menu dish', !!o && low(o.name) === low(dish), dish);
  if (side) add('menu side', !!o && !!o['with'], dish + ' || ' + side); }
let tn = 0, tp = 0;
for (const [k, r] of Object.entries(res)) { tn += r.n; tp += r.pass; console.log(`${k.padEnd(22)} ${String(r.pass).padStart(4)} of ${String(r.n).padEnd(4)} (${Math.round(100 * r.pass / r.n)} %)${r.fail.length ? '   e.g. ' + r.fail.slice(0, 6).map(x => JSON.stringify(x)).join(', ') : ''}`); }
console.log(`all controls           ${tp} of ${tn} (${Math.round(100 * tp / tn)} %)`);
if (process.argv.includes('--list')) for (const [k, r] of Object.entries(res)) for (const f of r.fail) console.log('dropped\t' + k + '\t' + f);
if (res['codex plate'].pass !== 1) { console.log('FAIL the sprouted moong and jowar roti plate is dropped'); process.exit(1); }
