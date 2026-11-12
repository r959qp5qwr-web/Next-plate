// Rule checks on the built page's np-core (the same code the server runs).
// node test/rules/check.js [page]  -> exit 0 when every rule holds, 1 otherwise.
// Rule 3: with diabetes the grain stays on the plate, including after any swap the app offers.
const fs = require('fs');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const fx = require('../v5/fixture.js');
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
console.log(bad ? `${bad} rule check(s) failed` : 'every rule check holds');
process.exit(bad ? 1 : 0);
