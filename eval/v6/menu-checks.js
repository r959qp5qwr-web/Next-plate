// Unit checks for "Read the menu" (docs/FEATURE-menu.md, section 6). No Gemini, no network, no dependencies.
//   node eval/v6/menu-checks.js [built page ...]     default: hosted/v5/index.min.html and hosted/v6/index.min.html
// Each page's np-core script is run the way the server runs it, then plan("menu", ...) and its check are fed hand-made replies.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const pages = process.argv.length > 2 ? process.argv.slice(2) : ['hosted/v5/index.min.html', 'hosted/v6/index.min.html'];

const MENU = ['Paneer Tikka 320', 'Chicken Tikka 360', 'Dal Tadka 240', 'Palak Paneer 300', 'Butter Chicken 380', 'Veg Biryani 280', 'Tandoori Roti 30', 'Butter Naan 60', 'Cucumber Raita 90', 'Green Salad 80'].join('\n');
const BASE = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 62, act: 'light' };
const CTX = { meal: 'dinner', time: '8:30 pm', hour: 20.5, dayNo: 316, mode: 'focus', appetite: 5, text: MENU };
const NOSIDE = { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 };
const ROTI2 = { with: '2 Tandoori Roti', with_kcal: 240, with_protein: 8, with_carbs: 44, with_fats: 4, with_fiber: 6 };
// a dish in the reply shape; kcal is close to 4 x protein + 4 x carbs + 9 x fats unless a check wants otherwise
const dish = (name, kcal, protein, carbs, fats, fiber, more) => Object.assign({ as_written: name, portion: '1 bowl, about 300 g', kcal, protein, carbs, fats, fiber, ask: '', planned_around: [] }, NOSIDE, more);
const DAL = () => dish('Dal Tadka', 280, 15, 34, 9, 9, ROTI2);                     // with its rotis: 520 kcal, 23 g protein
const PALAK = () => dish('Palak Paneer', 340, 17, 12, 25, 5, ROTI2);               // 580 kcal, 25 g
const TIKKA = () => dish('Paneer Tikka', 380, 24, 10, 27, 2);                      // no side, no grain
const BIRYANI = () => dish('Veg Biryani', 520, 12, 78, 18, 6);                     // its own grain
const reply = (dishes, more) => Object.assign({ status: 'ok', place: 'North Indian restaurant', dishes, leave: [], tip: 'Start with the salad and keep the roti for last.' }, more);

let failed = 0;
for (const page of pages) {
  const html = fs.readFileSync(path.isAbsolute(page) ? page : path.join(ROOT, page), 'utf8');
  const open = '<script id="np-core">', at = html.indexOf(open);
  if (at < 0) { console.log(`FAIL ${page}: no np-core script`); failed++; continue; }
  const E = vm.createContext({});
  vm.runInContext(html.slice(at + open.length, html.indexOf('</script>', at)), E);
  console.log(`\n${page}`);
  const check = (name, fn) => { let why = ''; try { why = fn() || ''; } catch (e) { why = 'threw: ' + (e && e.message); } if (why) failed++; console.log(`${why ? 'FAIL' : 'ok  '} ${name}${why ? '  -> ' + why : ''}`); };
  const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
  const yes = (cond, what) => { if (!cond) throw new Error(what); };
  const body = (p, c, file, image) => { const b = { profile: Object.assign({}, BASE, p), ctx: Object.assign({}, CTX, c), file: file || {} }; if (image) b.image = image; return b; };
  const ask = (rep, p, c, file, image) => { const pl = E.plan('menu', body(p, c, file, image)); yes(typeof pl.check === 'function', 'plan gave no check: ' + JSON.stringify(pl).slice(0, 120)); return pl.check(rep); };
  const names = out => out.orders.map(o => o.name);
  const target = (p, file) => E.planDay(E.readProfile(Object.assign({}, BASE, p)), E.readFile(file || {}), 'dinner', 5);

  check('engine contract: kind "menu" is routed; plan gives prompt, schema, image:true, weight:1, check', () => {
    yes(E.KINDS.indexOf('menu') >= 0, 'menu is not in KINDS');
    const pl = E.plan('menu', body());
    yes(typeof pl.prompt === 'string' && pl.prompt.indexOf('THE MENU') > 0 && pl.prompt.indexOf('Paneer Tikka 320 | Chicken Tikka 360') > 0, 'prompt does not carry the typed menu');
    eq([pl.image, pl.weight, typeof pl.check], [true, 1, 'function'], 'plan fields');
    eq(pl.schema.properties.status.enum, ['ok', 'refer', 'unreadable'], 'status enum');
    eq(Object.keys(pl.schema.properties.dishes.items.properties), ['as_written', 'portion', 'kcal', 'protein', 'carbs', 'fats', 'fiber', 'ask', 'with', 'with_kcal', 'with_protein', 'with_carbs', 'with_fats', 'with_fiber', 'planned_around'], 'dish fields');
    eq(Object.keys(pl.schema.properties.leave.items.properties), ['as_written', 'why'], 'leave fields');
  });
  check('request: a photo or text is required; the typed menu keeps 2,000 characters for this kind only', () => {
    eq(E.plan('menu', body({}, { text: '' })).error, 'bad_request', 'no text and no photo');
    yes(typeof E.plan('menu', body({}, { text: '' }, {}, 'AAAA')).prompt === 'string', 'a photo alone should be accepted');
    const long = Array.from({ length: 400 }, (_, i) => 'Dish number ' + i).join('\n'), kept = E.readCtx({ meal: 'dinner', text: long }, 'menu').text;
    eq(kept, long.slice(0, 2000).split('\n').join(' | '), 'the first 2,000 typed characters, one line per dish');
    eq(E.readCtx({ meal: 'dinner', text: '\n Dal Tadka 240 \r\n\r\n Tandoori Roti 30\n' }, 'menu').text, 'Dal Tadka 240 | Tandoori Roti 30', 'line breaks become separators');
    eq(E.readCtx({ meal: 'dinner', text: long }, 'rescue').text.length, 240, 'rescue text length');
    eq(E.readCtx({ meal: 'dinner', text: long }, 'meals').text.length, 240, 'meals text length');
    yes(!/["\\\n]/.test(E.readCtx({ meal: 'dinner', text: 'Dal "Tadka"\\\nRoti' }, 'menu').text), 'quotes, backslashes and line breaks must not reach the prompt');
  });
  check('checked reply has the contract shape: orders (name, portion, ask, with, n, fit, rise, planned), leave, tip, dropped', () => {
    const out = ask(reply([DAL()], { leave: [{ as_written: 'Butter Naan', why: 'Refined flour and butter.' }] }));
    eq(out.status, 'ok', 'status');
    eq(Object.keys(out.orders[0]), ['name', 'portion', 'ask', 'with', 'n', 'fit', 'rise', 'planned'], 'order fields');
    eq(out.orders[0].n, { kcal: 520, protein: 23, carbs: 78, fats: 13, fiber: 15 }, 'n is the dish plus its side');
    eq(out.orders[0].portion, '1 bowl, ≈ 300 g', 'a weight in the portion carries the sign');
    eq(ask(reply([Object.assign(DAL(), { portion: '1 katori' }), Object.assign(PALAK(), { portion: '1 bowl, 340 kcal' })])).orders.map(o => o.portion), ['', ''], 'no katori as a unit, no unchecked figure in the portion line');
    eq(out.leave, [{ name: 'Butter Naan', why: 'Refined flour and butter.' }], 'leave');
    yes(out.tip && out.place === 'North Indian restaurant' && out.dropped && !out.note && !out.moves, 'tip, place, dropped; no note on a menu that fits');
  });
  check('off-menu dish is dropped (typed menu); an off-menu "leave" too; a side that is not on the menu is taken off', () => {
    const out = ask(reply([DAL(), dish('Tawa Sabzi', 220, 6, 20, 13, 7, ROTI2), dish('Palak Paneer', 340, 17, 12, 25, 5, Object.assign({}, ROTI2, { with: '1 Lachha Paratha' }))],
      { leave: [{ as_written: 'Shahi Tukda', why: 'Fried bread in syrup.' }, { as_written: 'Butter Naan', why: 'Refined flour and butter.' }] }));
    eq(names(out).sort(), ['Dal Tadka', 'Palak Paneer'], 'orders');
    eq(out.dropped['off-menu'], 1, 'dropped off-menu');
    eq(out.leave.map(l => l.name), ['Butter Naan'], 'leave');
    const palak = out.orders.filter(o => o.name === 'Palak Paneer')[0];
    eq([palak.with, palak.n.kcal, out.dropped['side-off-menu']], ['', 340, 1], 'the off-menu side and its figures are not counted');
  });
  check('a menu photo (no typed text): names cannot be compared, so readable dishes are kept', () => {
    const out = ask(reply([dish('Tawa Sabzi', 220, 6, 20, 13, 7, ROTI2)]), {}, { text: '' }, {}, 'AAAA');
    eq(names(out), ['Tawa Sabzi'], 'orders');
  });
  check('non-veg is dropped for a vegetarian, also as a "leave"; kept for a non-vegetarian', () => {
    const rep = () => reply([dish('Chicken Tikka', 320, 42, 6, 14, 1, ROTI2), DAL(), dish('Butter Chicken', 520, 32, 14, 38, 2)], { leave: [{ as_written: 'Butter Chicken', why: 'Heavy on cream and butter.' }, { as_written: 'Butter Naan', why: 'Refined flour and butter.' }] });
    const veg = ask(rep());
    eq(names(veg), ['Dal Tadka'], 'vegetarian orders');
    eq(veg.dropped.diet, 2, 'dropped for diet');
    yes(!/chicken/i.test(JSON.stringify([veg.orders, veg.leave, veg.tip, veg.place])), 'a chicken dish is still shown somewhere');
    yes(names(ask(rep(), { diet: 'nonveg' })).indexOf('Chicken Tikka') >= 0, 'a non-vegetarian should keep Chicken Tikka');
  });
  check('a shortened name that exists on this menu only as a dish the person does not eat is dropped too', () => {
    const menu = 'Chicken Fried Rice 240\nEgg Fried Rice 210\nChicken Biryani 320\nVeg Biryani 280\nDal Tadka 240\nGarlic Naan 70\nTandoori Roti 30', rice = () => dish('Fried Rice', 520, 12, 78, 18, 3), biryani = () => dish('Biryani', 520, 12, 78, 18, 6);
    const veg = ask(reply([rice(), biryani(), dish('Dal Tadka', 280, 15, 34, 9, 9, { with: '1 Naan', with_kcal: 260, with_protein: 7, with_carbs: 40, with_fats: 8, with_fiber: 2 })], { leave: [{ as_written: 'Fried Rice', why: 'Oily and mostly refined rice.' }] }), {}, { text: menu });
    eq(names(veg).sort(), ['Biryani', 'Dal Tadka'], 'vegetarian orders (a veg biryani is on the menu, a veg fried rice is not)');
    eq([veg.dropped.diet, veg.leave.length], [1, 0], 'dropped for diet, also as a leave');
    eq(names(ask(reply([rice()]), { diet: 'egg' }, { text: menu })), ['Fried Rice'], 'with eggs in the diet, Egg Fried Rice makes it orderable');
    const jain = ask(reply([dish('Dal Tadka', 280, 15, 34, 9, 9, { with: '1 Naan', with_kcal: 260, with_protein: 7, with_carbs: 40, with_fats: 8, with_fiber: 2 })]), { diet: 'jain' }, { text: menu });
    eq([jain.orders[0].with, jain.dropped['side-diet']], ['', 1], 'a Jain is not sent to the garlic naan as "Naan"');
    eq(names(ask(reply([rice()]), {}, { text: 'paneer tikka chicken fried rice dal tadka veg pulao butter naan jeera rice green salad' })), ['Fried Rice'], 'a menu typed as one run of words cannot be judged this way, so the name stands');
  });
  check('leave-outs are enforced by code: no paneer or raita for a person who leaves out dairy', () => {
    const out = ask(reply([PALAK(), DAL(), dish('Veg Biryani', 520, 12, 78, 18, 6, { with: '1 Cucumber Raita', with_kcal: 90, with_protein: 4, with_carbs: 7, with_fats: 5, with_fiber: 1 })]), { leave: ['dairy'] });
    eq(names(out), ['Dal Tadka'], 'orders');
    eq(out.dropped.diet, 2, 'dropped for diet');
  });
  check('diabetes: an order without a grain is dropped; a roti side or the dish\'s own grain keeps it', () => {
    const out = ask(reply([TIKKA(), DAL(), BIRYANI()]), { health: 'diabetes', meds: 'no' });
    eq(names(out).sort(), ['Dal Tadka', 'Veg Biryani'], 'orders');
    eq(out.dropped['diabetes-grain'], 1, 'dropped diabetes-grain');
    yes(names(ask(reply([TIKKA(), DAL()]))).indexOf('Paneer Tikka') >= 0, 'without diabetes the same dish stays');
    yes(/Diabetes, when ordering out: every order keeps one measured grain/.test(E.plan('menu', body({ health: 'diabetes', meds: 'no' })).prompt), 'the prompt does not say the grain stays');
  });
  check('diabetes on insulin or sulfonylurea (yes or unsure): an order under the meal\'s usual energy is dropped', () => {
    const usual = target({ health: 'diabetes', meds: 'yes' }).usual.kcal, small = dish('Dal Tadka', 180, 10, 22, 6, 6, { with: '1 Tandoori Roti', with_kcal: 120, with_protein: 4, with_carbs: 22, with_fats: 2, with_fiber: 3 });
    yes(usual > 300 && usual <= 520, 'test set-up: usual dinner energy is ' + usual);
    for (const meds of ['yes', 'unsure']) {
      const out = ask(reply([small, dish('Veg Biryani', 520, 12, 78, 18, 6)]), { health: 'diabetes', meds });
      eq(names(out), ['Veg Biryani'], 'orders, meds ' + meds);
      eq(out.dropped['meds-low'], 1, 'dropped meds-low, meds ' + meds);
      yes(out.orders.every(o => o.n.kcal >= usual), 'an order is under the usual energy');
    }
    yes(names(ask(reply([small, BIRYANI()]), { health: 'diabetes', meds: 'no' })).indexOf('Dal Tadka') >= 0, 'without those medicines the small order stays');
  });
  check('numbers: a missing or out-of-range figure drops the dish; nothing is clamped or filled in', () => {
    const noProtein = dish('Palak Paneer', 340, 17, 12, 25, 5); delete noProtein.protein;
    const out = ask(reply([dish('Veg Biryani', 9000, 12, 78, 18, 6), noProtein, dish('Paneer Tikka', 380, '24', 10, 27, 2), dish('Butter Naan', 300, 40, 90, 30, 2), dish('Green Salad', 12, 1, 2, 0, 1), DAL()]));
    eq(names(out), ['Dal Tadka'], 'orders');
    eq([out.dropped.numbers, out.dropped.energy], [4, 1], 'dropped numbers (out of range, missing, not a number, too small) and energy (kcal against the macros)');
    eq(out.orders[0].n, { kcal: 520, protein: 23, carbs: 78, fats: 13, fiber: 15 }, 'figures are the model\'s own, summed');
    const noSideFibre = DAL(); delete noSideFibre.with_fiber;
    const side = ask(reply([noSideFibre]));
    eq([side.orders[0].with, side.orders[0].n.kcal, side.dropped['side-numbers']], ['', 280, 1], 'a side with a missing figure is taken off, not guessed');
  });
  check('no supplements and no health claims in any text shown', () => {
    const out = ask(reply([dish('Dal Tadka', 280, 15, 34, 9, 9, Object.assign({}, ROTI2, { ask: 'Add a scoop of whey protein' })), dish('Palak Paneer', 340, 17, 12, 25, 5, Object.assign({}, ROTI2, { ask: 'Less oil, it cures bloating' })), dish('Veg Biryani', 520, 12, 78, 18, 6, { ask: 'Smaller plate, saves 200 kcal' })],
      { tip: 'Eat the salad first, it detoxes the liver.', leave: [{ as_written: 'Butter Naan', why: 'Raises inflammation.' }, { as_written: 'Green Salad', why: 'Only 40 kcal, not a meal.' }] }));
    eq(names(out).sort(), ['Palak Paneer', 'Veg Biryani'], 'orders');
    eq(out.dropped.supplement, 1, 'dropped supplement');
    eq([out.orders.map(o => o.ask).join(''), out.tip, out.leave.length], ['', '', 0], 'claims and unchecked figures are not shown');
  });
  check('hooks: only ids that code offered survive, as on the plates', () => {
    const file = { today: { kcal: 820, protein: 22, carbs: 98, fats: 36, fiber: 14, lastHoursAgo: 6, lastKcal: 820, meals: [{ meal: 'lunch', kind: 'ordered', title: 'Chole Bhature', kcal: 820, protein: 22 }] } };
    const offered = E.hooksFor(E.readProfile(Object.assign({}, BASE, { goal: 'lose', kg: 72 })), E.readFile(file), E.readCtx(CTX, 'menu'), target({ goal: 'lose', kg: 72 }, file)).map(h => h.id);
    yes(offered.indexOf('goal_lose') >= 0 && offered.indexOf('ate_out') >= 0, 'test set-up: offered ' + offered);
    const out = ask(reply([dish('Dal Tadka', 280, 15, 34, 9, 9, Object.assign({}, ROTI2, { planned_around: ['goal_lose', 'made_up_reason', 'ate_out', 'goal_lose'] }))]), { goal: 'lose', kg: 72 }, {}, file);
    eq(out.orders[0].planned, ['goal_lose', 'ate_out'], 'planned');
    eq(Object.keys(out.hooks).sort(), offered.slice().sort(), 'the tags sent to the page are the offered hooks');
  });
  check('ranking is by code: best fit first, at most 3; ties go to the gentler band, then fewer changes, then the menu\'s order', () => {
    const t = target().target;
    eq(t, { kcal: 480, protein: 19 }, 'test set-up: dinner target');
    const out = ask(reply([BIRYANI(), DAL(), PALAK(), TIKKA()]));                                  // fits 73, 95, 88, 88 for the target above
    eq(names(out), ['Dal Tadka', 'Paneer Tikka', 'Palak Paneer'], 'orders');
    eq(out.orders.map(o => o.fit), [95, 88, 88], 'fits');
    out.orders.forEach(o => { eq(o.fit, E.fitOf(o.n, t), 'fit of ' + o.name + ' is fitOf'); eq(o.rise, E.riseOf(o.n, null).band, 'band of ' + o.name + ' is riseOf'); });
    const sharp = dish('Veg Biryani', 480, 20, 70, 13, 2), gentle = dish('Paneer Tikka', 480, 20, 20, 35, 6);   // same fit, different band
    const byBand = ask(reply([sharp, gentle]));
    eq([names(byBand), byBand.orders.map(o => o.rise)], [['Paneer Tikka', 'Veg Biryani'], ['Gentle', 'Sharp']], 'the gentler band wins a tie on fit');
    eq(names(ask(reply([dish('Palak Paneer', 480, 20, 20, 35, 6), dish('Paneer Tikka', 480, 20, 20, 35, 6)]))), ['Palak Paneer', 'Paneer Tikka'], 'a full tie keeps the menu\'s order');
  });
  check('nothing fits (best fit under 40): says so, shows only the least-bad order, with two moves', () => {
    const t = target().target, heavy = dish('Veg Biryani', 1388, 30, 200, 52, 9), lessHeavy = dish('Palak Paneer', 1094, 40, 40, 86, 8);
    const out = ask(reply([heavy, lessHeavy]));
    eq([out.status, names(out)], ['ok', ['Palak Paneer']], 'the least-bad order alone');
    yes(out.orders[0].fit < 40, 'fit ' + out.orders[0].fit);
    yes(/^Nothing on this menu fits your dinner well\. This is the closest\./.test(out.note || ''), 'note: ' + out.note);
    yes(/≈ 610 kcal over/.test(out.note), 'the note gives the gap with the sign: ' + out.note);
    eq(out.moves.length, 2, 'two moves');
    eq([out.moves[0].kind, out.moves[0].scale, out.moves[1].kind], ['portion', 0.5, 'move'], 'eat part of it, then a walk');
    eq(out.moves[0].fit, E.fitOf(E.scaleN(out.orders[0].n, 0.5), t), 'the move\'s fit is computed, not written');
    yes(out.moves[0].fit > out.orders[0].fit, 'the portion move must bring it closer');
    const zero = ask(reply([dish('Palak Paneer', 1996, 60, 40, 180, 8), dish('Veg Biryani', 1300, 30, 220, 33, 6)]));       // both score 0; the first is gentler but much further off
    eq([names(zero), zero.orders[0].fit, zero.orders[0].rise], [['Veg Biryani'], 0, 'Sharp'], 'among orders that all score 0, the nearest to the target');
    const big = () => reply([dish('Veg Biryani', 940, 10, 150, 33, 6)]), usual = target({ health: 'diabetes', meds: 'yes' }).usual.kcal;   // half of it would be 470 kcal
    yes(usual > 470 && usual <= 630, 'test set-up: usual dinner energy is ' + usual);
    eq(ask(big(), { health: 'diabetes', meds: 'no' }).moves[0].scale, 0.5, 'without diabetes medicine, half is the closest portion');
    eq(ask(big(), { health: 'diabetes', meds: 'yes' }).moves[0].scale, 0.67, 'on diabetes medicine a portion move does not go under the meal\'s usual energy');
  });
  check('unreadable: status "unreadable", or no readable dishes, gives "unreadable"; nothing is shown', () => {
    for (const rep of [{ status: 'unreadable', place: '', dishes: [], leave: [], tip: '' }, reply([]), { status: 'ok' }]) {
      const out = ask(rep, {}, { text: '' }, {}, 'AAAA');
      eq([out.status, out.orders.length, out.leave.length], ['unreadable', 0, 0], 'reply ' + JSON.stringify(rep).slice(0, 40));
    }
    eq(ask(null).status, 'error', 'no reply at all');
    eq(ask(reply([dish('Chicken Tikka', 320, 42, 6, 14, 1)])).status, 'empty', 'dishes read, none passed the checks');
    eq(ask({ status: 'refer' }).status, 'refer', 'the model may step back');
  });
  check('kidney condition and pregnancy are stopped before the model: no prompt is built', () => {
    for (const health of ['kidney', 'preg']) {
      const pl = E.plan('menu', body({ health }));
      eq([pl.reply && pl.reply.status, pl.reply && pl.reply.read, 'prompt' in pl, 'check' in pl], ['refer', E.SAFETY, false, false], health);
    }
  });
  check('an "ordered" meal is counted like a rescued one: day totals, the food file sent to the server, the eating-out hook', () => {
    yes(E.EVTYPES.indexOf('ordered') >= 0 && E.isMealEv({ type: 'ordered' }), 'ordered is not an eating event');
    const now = new Date(2026, 10, 12, 20, 30).getTime(), ev = kind => [{ t: now - 7 * 36e5, type: kind, meal: 'lunch', title: 'Dal Tadka with 2 Tandoori Roti', kcal: 520, protein: 23, carbs: 78, fats: 13, fiber: 15 }];
    const a = E.buildFile(ev('ordered'), now), b = E.buildFile(ev('rescued'), now);
    eq([a.today.kcal, a.today.protein, a.today.fiber, a.today.lastHoursAgo], [b.today.kcal, b.today.protein, b.today.fiber, b.today.lastHoursAgo], 'day totals');
    eq(a.today.meals[0].kind, 'ordered', 'kind in the file');
    eq(E.readFile(a).today.meals.length, 1, 'the server keeps an ordered meal');
    const p = E.readProfile(BASE), planA = E.planDay(p, E.readFile(a), 'dinner', 5), planB = E.planDay(p, E.readFile(b), 'dinner', 5);
    eq(planA.target, planB.target, 'the next meal\'s target');
    yes(E.hooksFor(p, E.readFile(a), E.readCtx(CTX, 'meals'), planA).some(h => h.id === 'ate_out'), 'no eating-out hook after an ordered meal');
    yes(/Lunch: Dal Tadka with 2 Tandoori Roti \(eaten out\)/.test(E.plan('meals', body({}, { text: '' }, a)).prompt), 'the plates brief does not say it was eaten out');
  });
}
console.log(failed ? `\n${failed} check(s) FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
