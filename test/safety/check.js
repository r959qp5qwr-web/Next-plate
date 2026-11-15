// Safety invariants (docs/SAFETY-INVARIANTS.md) on the built page's np-core, the code the server runs.
// Cases come from test/safety/lexicon.json, kept apart from the engine's own lists. Never weaken a case to pass: fix the engine.
//   "known"   names that may be copied into the engine's word lists: the word-level checks use them.
//   "heldout" names that are never copied into the engine: model-shaped replies carry them with honest declared contents (D1), and the
//             declared-contents check must drop them. A lying-empty tag list on them must be dropped too (fail closed).
// usage: node test/safety/check.js [hosted/v6/index.html]
const fs = require('fs'), path = require('path');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const LX = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8')), L = LX.known, HO = LX.heldout;
const fx = require('../v5/fixture.js'), fxm = require('../v6/fixture-menu.js');
const BASE = { goal: 'lose', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const prof = (o, slot) => { const p = readProfile(Object.assign({}, BASE, o)); p.slot = slot || 'lunch'; return p; };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const plural = s => /[^aeiou]y$/.test(s) ? s.slice(0, -1) + 'ies' : /(s|sh|ch|x)$/.test(s) ? s + 's' : s + 's';
const forms = t => [t, cap(t), plural(t), '2 ' + plural(t), cap(t) + ' curry', 'Dal with ' + plural(t) + ' and salad', 'Cooked with no oil and ' + t, 'Served with ' + t + ', no salt'];
const J = x => JSON.parse(JSON.stringify(x));
const safe = (f, d) => { try { return f(); } catch (e) { return d; } };   // a guard reports FAIL on an older page instead of throwing

// ---------- S1-S4: word level (the second net), known names with the profile that rules each out ----------
const RULES = [['S1', 'wheat', { leave: ['wheat'] }], ['S1', 'nut', { leave: ['nut'] }], ['S1', 'dairy', { leave: ['dairy'] }], ['S1', 'soya', { leave: ['soya'] }],
  ['S2', 'meat', { diet: 'veg' }], ['S2', 'meat', { diet: 'jain' }], ['S2', 'meat', { diet: 'egg' }], ['S2', 'meat', { diet: 'vegan' }], ['S2', 'egg', { diet: 'veg' }], ['S2', 'egg', { diet: 'vegan' }], ['S2', 'egg', { diet: 'jain' }],
  ['S2', 'jain', { diet: 'jain' }], ['S2', 'dairy', { diet: 'vegan' }],
  ['S3', 'salty', { health: 'bp' }], ['S3', 'salty', { health: 'diabetes', bp: true }], ['S4', 'sweet', { health: 'diabetes' }]];
const AR = L.addedFromReports;
for (const [id, cat, o] of RULES) for (const t of L[cat].concat(AR[cat] || [])) for (const f of forms(t)) add(id, crosses(f, prof(o)), `${JSON.stringify(o)}: "${f}"`);
// none of these may be ruled out by the rule next to them (a false hit hides good food)
for (const [cat, o] of [['notWheat', { leave: ['wheat'] }], ['notNut', { leave: ['nut'] }], ['notMeat', { diet: 'veg' }], ['notEgg', { diet: 'veg' }]])
  for (const t of L[cat]) add('S1-S2 no false hit', !crosses(t, prof(o)), `${JSON.stringify(o)}: "${t}" was ruled out`);
// "no extra ghee", "no added sugar", "less ghee" mean some is there
for (const [t, o] of [['Dal tadka, no extra ghee', { leave: ['dairy'] }], ['Kheer with no added sugar', { health: 'diabetes' }], ['Dal with less ghee', { leave: ['dairy'] }]])
  add('S1-S4 negation', crosses(t, prof(o)), `${JSON.stringify(o)}: "${t}" read as left out`);

// ---------- D1: declared contents. Which profile bars each tag ----------
const BARS = { meat: [{ diet: 'veg' }, { diet: 'vegan' }, { diet: 'jain' }, { diet: 'egg' }], fish: [{ diet: 'veg' }, { diet: 'egg' }], egg: [{ diet: 'veg' }, { diet: 'jain' }, { diet: 'vegan' }],
  dairy: [{ leave: ['dairy'] }, { diet: 'vegan' }], wheat: [{ leave: ['wheat'] }], nuts: [{ leave: ['nut'] }], soya: [{ leave: ['soya'] }], onion_garlic: [{ diet: 'jain' }], root_veg: [{ diet: 'jain' }],
  sweet: [{ health: 'diabetes' }], salty_side: [{ health: 'bp' }, { health: 'diabetes', bp: true }], supplement: [{}] };
const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
// a plate the model could send: the fixture's third plate (soya and wheat), retagged so only the item under test can break a rule
const platePlain = () => ({ title: 'Moong dal with jowar roti', subtitle: 'Moong dal, jowar roti and a cucumber salad', cuisine: 'North Indian', prepMinutes: 20,
  items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: [] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: [] }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 500, protein: 22, carbs: 70, fats: 14, fiber: 14, why: [], swaps: { protein: [], base: [] }, alchemy: {}, planned_around: [], for_you: '', taste: [] });
const mealsReply = (m) => ({ status: 'ok', refer_reason: 'none', read: '', meals: [m] });
const plateOffered = (o, m, slot) => { const pl = plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: slot || 'lunch' } }); const r = pl.check ? pl.check(mealsReply(m)) : { meals: [] }; return { ok: (r.meals || []).length > 0, why: JSON.stringify(r.dropped || {}) }; };
const withItem = (name, tags, itemTags) => { const m = platePlain(); m.items[0] = { food: name, grams: 150, group: 'protein', contains: itemTags === undefined ? tags : itemTags }; m.title = name + ' with jowar roti'; m.contains = ['grain'].concat(tags || []); return m; };
const menuOffered = (o, name, tags, side, sideTags, extra) => { const pl = plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'MAINS\n' + name + ' 240\n' + (side ? side.replace(/^\d+\s+/, '') + ' 40\n' : '') } });
  const d = Object.assign({ as_written: name, portion: '1 plate, about 350 g', kcal: 620, protein: 26, carbs: 70, fats: 24, fiber: 6, ask: '', grain_made_of: 'rice', grain_grams: 120, with: side || '', with_kcal: side ? 120 : 0, with_protein: side ? 3 : 0, with_carbs: side ? 22 : 0, with_fats: side ? 2 : 0, with_fiber: side ? 2 : 0, contains: tags, with_contains: sideTags || [], planned_around: [] }, extra || {});
  return safe(() => pl.check({ status: 'ok', refer_reason: 'none', place: 'Restaurant', dishes: [d], leave: [], tip: '' }), { orders: [] }); };
const rescueOut = (o, typed, dish, hacks) => safe(() => plan('rescue', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: typed } }).check({ status: 'ok', refer_reason: 'none', dish: Object.assign({ name: typed, portion: '1 plate, about 350 g', kcal: 620, protein: 24, carbs: 80, fats: 22, fiber: 6, warning: '', breakdown: '', contains: ['grain'] }, dish || {}), hacks: hacks }), { status: 'error' });
const WALK = { title: 'A 15-minute walk after the meal', kind: 'move', contains: [], ...z };
const tuneOut = (o, slot, alch, swaps) => { const m = platePlain(); const p = Object.assign({}, BASE, o);
  const pl = plan('tune', { profile: p, slot, meal: Object.assign({}, m, { minutes: 20 }) }); return pl.check ? pl.check({ swaps: swaps || { protein: [], base: [] }, alchemy: alch }) : { alchemy: {} }; };
const NOTE = (note, tags, after) => ({ titleSuffix: '+ a change', note, minutes: 20, grain_grams_after: after == null ? 90 : after, contains: tags, deltaKcal: 60, deltaProtein: 8, deltaCarbs: 2, deltaFats: 3, deltaFiber: 0 });
const contentsReason = r => /^contents/.test(Object.keys(r || {}).join(' ')) || /"contents/.test(JSON.stringify(r || {}));

// ---------- held-out names, honest tags: the declared-contents check drops them, on every path ----------
let heldN = 0, heldByWords = 0;
const allWords = [].concat(NONVEG, EGGW, DAIRYW, JAINW, LEAVEW.nut, LEAVEW.wheat, LEAVEW.soya, SWEETS, SALTY);
for (const [tag, names] of Object.entries(HO)) {
  if (!BARS[tag]) continue;
  for (const name of names) { heldN++; if (foodRx(allWords).test(name.toLowerCase()) || supp(name)) heldByWords++;
    for (const o of BARS[tag]) {
      const r = plateOffered(o, withItem(name, [tag]));
      add('D1 held-out, plate item', !r.ok, `${JSON.stringify(o)}: plate item "${name}" tagged ${tag} was offered`);
      add('D1 held-out, plate item reason', r.ok || /contents/.test(r.why), `${JSON.stringify(o)}: "${name}" was dropped, but not by the declared contents (${r.why})`);
      add('D1 held-out, lying-empty tags', !plateOffered(o, withItem(name, [], [])).ok, `${JSON.stringify(o)}: "${name}" with an empty tag list was offered (fail closed)`);
      add('D1 held-out, no tags', !plateOffered(o, withItem(name, undefined, undefined)).ok, `${JSON.stringify(o)}: "${name}" with no tag list was offered`);
      const t = tuneOut(o, 'lunch', { protein: NOTE('Add 80 g ' + name + ' on the side.', [tag]) }, { protein: [{ food: name, grams: 150, contains: [tag], ...z }], base: [] });
      add('D1 held-out, one-tap and swap', !Object.keys(t.alchemy || {}).length && !((t.swaps || {}).protein || []).length, `${JSON.stringify(o)}: tune offered "${name}" (${tag})`);
      const mo = menuOffered(o, cap(name), [tag]);
      add('D1 held-out, menu order', !(mo.orders || []).length && contentsReason(mo.dropped), `${JSON.stringify(o)}: menu order "${name}" (${tag}) was offered or not dropped by its contents (${JSON.stringify(mo.dropped)})`);
      const ms = menuOffered(o, 'Plain Dal', ['grain'], '1 ' + cap(name), [tag]);
      add('D1 held-out, menu side', (ms.orders || []).every(x => !x.with), `${JSON.stringify(o)}: menu side "${name}" (${tag}) was offered`);
      const rc = rescueOut(o, 'Veg thali', { name: 'Veg thali' }, [{ title: 'Add 100 g ' + name + ' first', kind: 'sequence', contains: [tag], deltaKcal: 120, deltaProtein: 6, deltaCarbs: 6, deltaFats: 6, deltaFiber: 1 }, WALK]);
      add('D1 held-out, Rescue move', !(rc.hacks || []).some(h => h.title.includes(name)), `${JSON.stringify(o)}: Rescue move adding "${name}" (${tag}) was offered`);
      const rd = rescueOut(o, 'Thali', { name: 'Thali with ' + name, contains: ['grain', tag] }, [WALK]);
      add('D1 held-out, Rescue dish', rd.status !== 'ok', `${JSON.stringify(o)}: Rescue dish "Thali with ${name}" (${tag}), not typed, was shown`);
    } } }
// honest tags on a harmless name are dropped too: the tag, not the name, is what counts
for (const [tag, bars] of Object.entries(BARS)) for (const o of bars) {
  add('D1 tags on a harmless name', !plateOffered(o, withItem('Green bowl', [tag])).ok, `${JSON.stringify(o)}: "Green bowl" tagged ${tag} was offered`);
  add('D1 tags on a harmless name', !(menuOffered(o, 'Green Bowl', [tag]).orders || []).length, `${JSON.stringify(o)}: menu "Green Bowl" tagged ${tag} was offered`); }
// an unknown tag, or no list at all, fails closed; a plain dish with an empty list is believed
add('D1 fail closed', !plateOffered({ diet: 'veg' }, withItem('Paneer bhurji', ['vegetarian'])).ok, 'an unknown tag was accepted');
add('D1 fail closed', !(menuOffered({}, 'Dal Tadka', undefined).orders || []).length, 'a menu order with no tag list was offered');
add('D1 plain food kept', plateOffered({ diet: 'jain', leave: ['dairy', 'nut', 'wheat', 'soya'], health: 'diabetes', bp: true }, withItem('Sprouted moong salad', [])).ok, 'a plain sprouted moong salad with an empty list was dropped');
// held-out names that must not be hidden: honest tags with nothing the profile bars
const NH = { meat: { diet: 'veg' }, dairy: { leave: ['dairy'] }, wheat: { leave: ['wheat'] }, soya: { leave: ['soya'] }, onion_garlic: { diet: 'jain' }, root_veg: { diet: 'jain' }, salty_side: { health: 'bp' }, sweet: { health: 'diabetes' }, nuts: { leave: ['nut'] } };
const NHTAGS = { 'Sol kadhi with coconut milk': ['onion_garlic'], 'Coconut milk curry': ['onion_garlic'], 'Peanut chutney': ['nuts'], 'Coconut chutney': [], 'Hing tadka dal': [], 'Lauki sabzi': [], 'Cucumber raita': ['dairy'], 'Sprouts salad': [], 'Roasted chana': [], 'Sugar snap peas': [], 'Soya keema': ['soya', 'onion_garlic'], 'Mushroom keema': ['onion_garlic'], 'Kathal keema': ['onion_garlic'], 'Jackfruit biryani': ['grain', 'onion_garlic'], 'Veg seekh kebab': ['onion_garlic'], 'Rice noodles': ['grain'],
  'Kuttu puri': ['grain'], 'Singhara puri': [], 'Jowar bread': ['grain'], 'Ragi dosa': ['grain'], 'Bajra roti': ['grain'], 'Makki di roti': ['grain'], 'Idli rice cakes': ['grain'], 'Sweet corn soup': ['grain'], 'Rajma curry': ['onion_garlic'], 'Chana masala': ['onion_garlic'] };
for (const [tag, names] of Object.entries(HO.notHidden)) for (const name of names) { const o = NH[tag]; const tags = NHTAGS[name] || [];
  const r = plateOffered(o, withItem(name, tags));
  add('D1 no false hit (held-out)', r.ok, `${JSON.stringify(o)}: "${name}" was hidden (${r.why})`); }

// ---------- the script rule: text the checks cannot read is not shown; a menu in another script gets the note ----------
for (const [tag, names] of Object.entries(HO.script)) for (const name of names) { const o = BARS[tag][0];
  add('D1 script', !plateOffered(o, withItem(name, [tag], [])).ok && !plateOffered({}, withItem(name, [], [])).ok, `"${name}" was shown as a plate item`);
  const pl = plan('menu', { profile: Object.assign({}, BASE), ctx: { meal: 'lunch', text: name + ' 240' } });
  const r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', place: 'x', dishes: [{ as_written: name, portion: '1 plate, about 300 g', kcal: 500, protein: 20, carbs: 60, fats: 20, fiber: 5, ask: '', with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, grain_made_of: '', grain_grams: 0, contains: [], with_contains: [], planned_around: [] }], leave: [], tip: '' }), {});
  add('D1 script, menu note', !(r.orders || []).length && r.status === 'script' && /English letters/.test(r.read || ''), `menu "${name}": ${r.status} ${r.read || ''}`); }

// ---------- no held-out name is in the engine ----------
{ const src = (fs.readFileSync(path.join(__dirname, '../../src/v5/core.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '../../src/v6/engine.js'), 'utf8')).toLowerCase();
  for (const [k, v] of Object.entries(HO)) { if (k === 'notHidden') continue; const list = Array.isArray(v) ? v : [].concat(...Object.values(v));
    for (const n of list) { const l = n.toLowerCase(); add('held-out names stay out of the engine', !new RegExp('(?<![a-z\\u0900-\\u0bff])' + l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z\\u0900-\\u0bff])').test(src), `"${n}" (${k}) appears in src/v5/core.js or src/v6/engine.js`); } } }

// ---------- S1-S4 on whole replies through plan(kind).check(), the word net alone (tags that leave the food out) ----------
const plateWith = (food, madeOf) => { const m = J(fx.meals.meals[0]); m.title = 'Dal with ' + food; m.items[1] = { food: cap(food), grams: 80, group: 'carbs', contains: ['grain'] }; m.grain = { food: cap(food), made_of: madeOf, grams: 80 }; return m; };
for (const t of L.wheat) { const c = checkMeal(plateWith(plural(t), 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, `wheat left out, plate "Dal with ${plural(t)}" was offered`); }
{ const c = checkMeal(plateWith('soft flatbread', 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, 'wheat left out, "soft flatbread" made of whole wheat was offered'); }
for (const t of L.meat) { const m = J(fx.meals.meals[0]); m.items[0] = { food: cap(plural(t)) + ' tikka', grams: 150, group: 'protein', contains: [] }; const c = checkMeal(m, prof({ diet: 'veg' })); add('S2 plate', !c.meal, `vegetarian, plate with "${m.items[0].food}" was offered`); }
// each shown field on its own: a plate's for_you, pairing tip and read line; a menu's ask, side, grain_made_of and tip (fields are blanked, the plate stays)
{ const pl = plan('meals', { profile: Object.assign({}, BASE, { leave: ['dairy'] }), ctx: { meal: 'lunch' } });
  const m = platePlain(); m.for_you = 'A light plate with ghee on the roti.'; m.why = [{ pair: 'Jowar roti + paneer', effect: 'The paneer adds protein to the meal.' }]; m.cuisine = 'Ghee-rich Punjabi';
  const r = pl.check({ status: 'ok', refer_reason: 'none', read: 'A dairy day: paneer and ghee help.', meals: [m] }), x = (r.meals || [])[0] || {};
  add('S1 shown fields', !!x.title && !x.forYou && !(x.why || []).length && !r.read && !x.cuisine, `dairy left out: for_you "${x.forYou}", why ${JSON.stringify(x.why)}, read "${r.read}", cuisine "${x.cuisine}"`); }
for (const [field, val, o] of [['ask', 'Ask for extra ghee on top', { leave: ['dairy'] }], ['ask', 'Ask for a sweet lassi with it', { health: 'diabetes' }], ['tip', 'Start with the chhach, then the dal.', { leave: ['dairy'] }]]) {
  const pl = plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'MAINS\nDal Fry 200\n' } });
  const d = { as_written: 'Dal Fry', portion: '1 plate, about 350 g', kcal: 520, protein: 22, carbs: 60, fats: 18, fiber: 6, ask: field === 'ask' ? val : '', grain_made_of: 'rice', grain_grams: 100, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, contains: ['grain', 'onion_garlic'], with_contains: [], planned_around: [] };
  const r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', place: 'x', dishes: [d], leave: [], tip: field === 'tip' ? val : '' }), {});
  add('S1-S4 menu field alone', field === 'tip' ? !r.tip : !(r.orders || []).length, `${JSON.stringify(o)}: menu ${field} "${val}" was shown`); }
for (const t of ['kulcha', 'thepla', 'puri', 'bhatura', 'phulka']) add('S1 menu side', (menuOffered({ leave: ['wheat'] }, 'Chole', ['onion_garlic'], '2 ' + cap(plural(t)), ['grain']).orders || []).every(x => !x.with), `wheat left out, the side "2 ${plural(t)}" was offered`);
add('S1 menu grain_made_of', !(menuOffered({ leave: ['wheat'] }, 'Chole With Soft Bread', ['onion_garlic', 'grain'], '', [], { grain_made_of: 'wheat' }).orders || []).length, 'wheat left out, an order whose grain is made of wheat was offered');
for (const [o, name, tags] of [[{ health: 'diabetes' }, 'Rice And Rasagola', ['grain']], [{ health: 'diabetes' }, 'Kulfi Falooda', ['dairy']], [{ diet: 'vegan' }, 'Mutton Pulao', ['grain']], [{ diet: 'jain' }, 'Egg Curry Rice', ['grain']]])
  add('S2-S4 menu order (word net)', !(menuOffered(o, name, tags, '', [], { grain_made_of: 'rice' }).orders || []).length, `${JSON.stringify(o)}: menu order "${name}" was offered`);
for (const [o, name] of [[{ health: 'diabetes' }, 'Gulab jamun'], [{ diet: 'vegan' }, 'Mutton curry'], [{ diet: 'jain' }, 'Egg bhurji'], [{ health: 'diabetes', bp: true }, 'Papad']])
  add('S2-S4 plate (word net)', !plateOffered(o, withItem(name, [])).ok && !plateOffered(o, withItem(name, ['grain'])).ok, `${JSON.stringify(o)}: plate item "${name}" was offered`);
// the tune path: one-tap notes
for (const [o, note] of [[{ leave: ['dairy'] }, 'Top with 10 g ghi.'], [{ diet: 'veg' }, 'Add 80 g jhinga on the side.'], [{ leave: ['dairy'] }, 'Add 50 g paneer on top.']])
  add('S1-S2 one-tap note', !Object.keys(tuneOut(o, 'lunch', { protein: NOTE(note, []) }).alchemy || {}).length && !Object.keys(tuneOut(o, 'lunch', { protein: NOTE(note, ['grain']) }).alchemy || {}).length, `${JSON.stringify(o)}: one-tap note "${note}" was offered`);
// Rescue moves (BLOCKER 7): a portion move that adds a food the person typed is checked on its full title
for (const t of ['ghee', 'malai', 'thayir', 'makhan']) { const r = rescueOut({ leave: ['dairy'] }, 'Dal khichdi', { name: 'Dal khichdi' }, [{ title: 'Add a spoon of ' + t + ' on top', kind: 'add', contains: [], deltaKcal: 60, deltaProtein: 0, deltaCarbs: 0, deltaFats: 6, deltaFiber: 0 }, WALK]);
  add('S1 rescue', !(r.hacks || []).some(h => new RegExp(t, 'i').test(h.title)), `dairy left out, Rescue move "Add a spoon of ${t}" was offered`); }
{ const r = rescueOut({ leave: ['dairy'] }, 'Rajma chawal with curd', { name: 'Rajma chawal with curd', contains: ['grain', 'dairy'] }, [{ title: 'Add an extra 100 g of curd', kind: 'portion', contains: ['dairy'], deltaKcal: 60, deltaProtein: 4, deltaCarbs: 4, deltaFats: 3, deltaFiber: 0 }, WALK]);
  add('S1 rescue (typed food added)', !(r.hacks || []).some(h => /curd/.test(h.title)), 'dairy left out: "Add an extra 100 g of curd" (a portion move) was offered'); }
// M2: the Rescue dish name, warning and breakdown are food-checked; the person's own words stay theirs
{ const r = rescueOut({ diet: 'veg' }, 'Veg biryani', { name: 'Veg biryani with chicken 65', contains: ['grain'] }, [WALK]);
  add('S2 rescue dish', r.status !== 'ok', 'vegetarian: the Rescue dish "Veg biryani with chicken 65" (not typed) was shown');
  const r2 = rescueOut({ leave: ['dairy'] }, 'Veg biryani', { name: 'Veg biryani', warning: 'Heavy on ghee', breakdown: 'Rice cooked in ghee with paneer.', contains: ['grain'] }, [WALK]);
  add('S1 rescue warning and breakdown', r2.status === 'ok' && !r2.dish.warning && !r2.dish.breakdown, 'dairy left out: the Rescue warning or breakdown naming ghee or paneer was shown');
  const r3 = rescueOut({ diet: 'veg' }, 'Mutton biryani', { name: 'Mutton biryani', contains: ['grain', 'meat'] }, [WALK]);
  add('S2 rescue: the person\'s own dish', r3.status === 'ok', 'vegetarian: the dish they typed ("Mutton biryani") was not helped'); }

// ---------- S5: with diabetes the grain stays on Rescue moves ----------
for (const title of ['Give the rice to your family and eat the rajma', 'Let the kids have the chawal', 'Have salad in the naan\'s spot', 'Wrap the chicken in lettuce', 'Stop after the rajma and salad']) {
  const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', carbs: 100 }, [{ title, kind: 'portion', contains: ['grain'], deltaKcal: -200, deltaProtein: -2, deltaCarbs: title.startsWith('Stop') ? -55 : -40, deltaFats: -2, deltaFiber: -1 }, WALK]);
  add('S5 rescue', !(r.hacks || []).some(h => h.title === title), `diabetes: Rescue move "${title}" was offered`); }
{ const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', carbs: 100 }, [{ title: 'Set aside a third of the rice', kind: 'portion', contains: ['grain'], deltaKcal: -120, deltaProtein: 0, deltaCarbs: -30, deltaFats: 0, deltaFiber: 0 }, WALK]);
  add('S5 rescue no false hit', (r.hacks || []).some(h => /third/.test(h.title)), 'diabetes: setting aside a third of the rice was dropped'); }

// ---------- S6: on insulin or sugar tablets (or not sure) ----------
for (const meds of ['yes', 'unsure']) { const p = readProfile(Object.assign({}, BASE, { diet: 'veg', health: 'diabetes', meds }));
  for (const meal of ['breakfast', 'lunch', 'dinner']) for (const k of [0, 300, 600, 900, 1100, 1500]) for (let ap = 1; ap <= 10; ap++) {
    const before = meal === 'breakfast' ? [] : [{ meal: 'breakfast', kind: 'had', kcal: k, protein: 20 }];
    const pl = planDay(p, { today: { meals: before, fiber: 0, kcal: k } }, meal, ap);
    add('S6 target', pl.target.kcal >= pl.usual.kcal, `${meds}, ${meal}, ${k} kcal eaten before, appetite ${ap}: target ${pl.target.kcal} under usual ${pl.usual.kcal}`); } }
{ // D2: a plate, a swap or a change under the meal's usual size is dropped, with and without body figures; the menu too
  for (const body of [{}, { cm: 0, kg: 0, age: 0 }]) for (const meds of ['yes', 'unsure']) {
    const o = Object.assign({ health: 'diabetes', meds }, body), small = platePlain(); ['kcal', 'protein', 'carbs', 'fats', 'fiber'].forEach(k => small[k] = Math.round(small[k] * 0.5)); small.items.forEach(i => i.grams = Math.round(i.grams * 0.5)); small.grain.grams = 45;
    add('S6 plate', !plateOffered(o, small).ok, `${JSON.stringify(o)}: a 250 kcal lunch plate was offered`);
    const t = tuneOut(o, 'lunch', { glucose: Object.assign(NOTE('Halve the dal and add 100 g cucumber.', ['grain']), { deltaKcal: -200, deltaProtein: -10, deltaCarbs: -10, deltaFats: -8 }) });
    add('S6 one-tap change', !Object.keys(t.alchemy || {}).length, `${JSON.stringify(o)}: a change taking the lunch plate 200 kcal lower was offered`);
    const mo = menuOffered(o, 'Idli Sambar', ['grain'], '', [], { kcal: 220, protein: 8, carbs: 40, fats: 3, fiber: 4, grain_made_of: 'rice', grain_grams: 80 });
    add('S6 menu', !(mo.orders || []).length && /meds-low/.test(JSON.stringify(mo.dropped)), `${JSON.stringify(o)}: a 220 kcal lunch order was offered (${JSON.stringify(mo.dropped)})`);
    add('S6 prompt', /usual size of this meal/.test(plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch' } }).prompt || ''), `${JSON.stringify(o)}: the plates prompt does not state the usual size`); }
  add('S6 no false hit', plateOffered({ health: 'diabetes', meds: 'no' }, platePlain()).ok, 'not on medicine: a 500 kcal lunch plate was dropped'); }

// ---------- S7: referral ----------
const refers = (kind, t) => { const pl = plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }); return !!(pl && pl.reply && pl.reply.status === 'refer'); };
for (const kind of ['meals', 'menu', 'rescue', 'log']) {
  for (const t of L.referText) add('S7 typed', refers(kind, t), `${kind}: "${t}" went to the model`);
  for (const t of HO.referText) add('S7 typed (held-out)', refers(kind, t), `${kind}: "${t}" went to the model`);
  for (const t of L.notReferText.concat([fxm.typed])) add('S7 no false hit', !refers(kind, t), `${kind}: "${t.slice(0, 40)}" was referred`); }
// the model's refer_reason: any value but "none" is a referral, on every reply that answers typed text; a missing one fails closed
{ const P0 = Object.assign({}, BASE, { diet: 'veg' });
  const replies = { meals: (rr) => Object.assign(mealsReply(platePlain()), rr), menu: (rr) => Object.assign(J(fxm.reply), rr), rescue: (rr) => Object.assign(J(fx.rescue), rr, { dish: Object.assign({}, fx.rescue.dish, { name: 'Veg thali', contains: ['grain'] }) }), log: (rr) => Object.assign(J(fx.log), rr) };
  for (const kind of Object.keys(replies)) { const pl = plan(kind, { profile: P0, ctx: { meal: 'lunch', text: kind === 'menu' ? fxm.typed : 'Veg thali' } });
    for (const why of ['pregnancy', 'kidney', 'other_urgent', undefined]) { const r = safe(() => pl.check(replies[kind](why ? { refer_reason: why } : { refer_reason: undefined })), {});
      add('S7 refer_reason', r.status === 'refer', `${kind}: refer_reason ${why} gave status ${r.status}`); }
    const r = safe(() => pl.check(replies[kind]({ refer_reason: 'none' })), {}); add('S7 refer_reason none', r.status !== 'refer', `${kind}: refer_reason none was referred`);
    add('S7 schema', !!safe(() => JSON.stringify(pl.schema).includes('refer_reason') && (pl.schema.required || []).includes('refer_reason'), false), `${kind}: the schema does not require refer_reason`); } }
for (const conds of [['kidney'], ['preg'], ['diabetes', 'kidney'], ['diabetes', 'preg'], ['bp', 'kidney']]) {
  const h = conds.includes('kidney') ? 'kidney' : 'preg'; const pl = plan('meals', { profile: Object.assign({}, BASE, { health: h, conds }), ctx: { meal: 'lunch' } });
  add('S7 ticked', !!(pl && pl.reply && pl.reply.status === 'refer'), `ticked ${conds.join(' + ')} was planned`); }
{ // the app ranks ticked conditions: a kidney condition or pregnancy comes first (src/v6/app.js healthOf), end to end through the engine
  const m = page.match(/([\w$]+)=(\[(?:"(?:kidney|preg|diabetes|bp)",?){4}\]);\s*function ([\w$]+)\(([\w$]+)\)\{[^}]*\}/);   // the minified page renames them
  if (m) { (0, eval)('var CONDS_T=' + m[2] + ';' + m[0].slice(m[0].indexOf('function')).replace(new RegExp('\\b' + m[1].replace('$', '\\$') + '\\b', 'g'), 'CONDS_T').replace('function ' + m[3], 'function healthOf_T'));
    for (const conds of [['diabetes', 'kidney'], ['kidney', 'diabetes'], ['bp', 'preg'], ['diabetes', 'bp', 'kidney'], ['preg', 'diabetes']]) {
      const pl = plan('meals', { profile: Object.assign({}, BASE, { health: healthOf_T(conds), bp: conds.includes('bp') }), ctx: { meal: 'lunch' } });
      add('S7 app ranking', !!(pl && pl.reply && pl.reply.status === 'refer'), `ticked ${conds.join(' + ')}: health "${healthOf_T(conds)}" was planned`); } }
  else add('S7 app ranking', /hosted\/v5/.test(process.argv[2] || ''), 'healthOf was not found in the page'); }

// ---------- S8: grams and kcal ----------
{ const mo = menuOffered({}, 'Dal Tadka', ['dairy', 'onion_garlic'], '', [], { portion: '2 phulkas and 1 bowl dal' });
  add('S8 menu portion', (mo.orders || []).length > 0 && mo.orders.every(o => !/bowl|phulka/i.test(o.portion)), 'menu: the portion "2 phulkas and 1 bowl dal" was shown');
  const m2 = menuOffered({}, 'Dal Tadka', ['dairy', 'onion_garlic'], '', [], { portion: '1 bowl' }); add('S8 menu portion', (m2.orders || []).every(o => o.portion === ''), 'menu: the portion "1 bowl" was shown');
  const m3 = menuOffered({}, 'Dal Tadka', ['dairy', 'onion_garlic'], '1 Bowl Raita', ['dairy']); add('S8 menu side', (m3.orders || []).every(o => !/bowl/i.test(o.with)), 'menu: the side "1 Bowl Raita" was shown');
  const m4 = menuOffered({}, 'Dal Tadka', ['dairy', 'onion_garlic'], '1 Katori Raita', ['dairy']); add('S8 menu side', (m4.orders || []).every(o => !/katori/i.test(o.with)), 'menu: the side "1 Katori Raita" was shown');
  const lg = safe(() => plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal rice' } }).check(Object.assign(J(fx.log), { assumed: 'A bowl of dal and 2 katori rice.' })), {});
  for (const [k, v] of [['kcal', 9999], ['kcal', -50], ['protein', -5], ['carbs', 900], ['fats', 'lots']]) { const lr = safe(() => plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal rice' } }).check(Object.assign(J(fx.log), { [k]: v })), {});
    add('log figures taken as given', lr.status === 'empty', `log: ${k} ${v} gave status ${lr.status} (${lr.kcal} kcal)`); }
  { const lr = safe(() => plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal rice' } }).check(Object.assign(J(fx.log), { items: [{ food: 'Dal', grams: 99999, group: 'protein' }, { food: 'Rice', grams: 150, group: 'carbs' }] })), {});
    add('log figures taken as given', lr.status === 'empty', `log: an item of 99999 g gave status ${lr.status}`); }
  add('log figures taken as given', safe(() => plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'aloo paratha' } }).check(J(fx.log)).status, '') === 'ok', 'log: the fixture meal was refused');
  add('S8 log assumption', lg.status === 'ok' && !lg.assumed, `log: the assumption "${lg.assumed}" was shown`);
  const r = rescueOut({}, 'Dal rice', { name: 'Dal rice', warning: 'Two katori of rice', breakdown: 'A full bowl of rice and a katori of dal.' }, [WALK]);
  add('S8 Rescue warning and breakdown', r.status === 'ok' && !r.dish.warning && !r.dish.breakdown, 'Rescue: a warning or breakdown in katori or a bowl without grams was shown'); }

// ---------- S9: no supplements, by the tag and by the word net ----------
const SUPP = L.addedFromReports.supplement.concat(HO.supplement);
for (const t of SUPP) {
  add('S9 plate (tag)', !plateOffered({}, withItem(cap(t), ['supplement'])).ok, `"${t}" tagged supplement was offered`);
  add('S9 one-tap (tag)', !Object.keys(tuneOut({}, 'lunch', { protein: NOTE('Add ' + t + ' after the meal.', ['supplement']) }).alchemy || {}).length, `one-tap "${t}" was offered`); }
for (const t of L.addedFromReports.supplement.concat(['Protinex shake', 'Ensure plus', 'iron pills', 'a vitamin C tablet', 'Horlicks', 'spirulina'])) {
  add('S9 word net (lying tag)', !plateOffered({}, withItem(cap(t), ['dairy'])).ok, `"${t}" tagged dairy (no supplement tag) was offered`);
  const r = rescueOut({}, 'Dal rice', { name: 'Dal rice' }, [{ title: 'Have ' + t + ' after the meal', kind: 'sequence', contains: ['dairy'], deltaKcal: 60, deltaProtein: 8, deltaCarbs: 6, deltaFats: 1, deltaFiber: 0 }, WALK]);
  add('S9 Rescue (word net)', !(r.hacks || []).some(h => h.title.includes(t)), `Rescue move with "${t}" was offered`); }
for (const t of ['The lemon brings vitamin C for the iron.', 'Flaxseeds bring omega 3 fats.', 'So the starch drops.']) add('S9 no false hit', !supp(t), `"${t}" was read as a supplement`);

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       … ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(`held-out names: ${heldN} (${heldByWords} of them also caught by the word lists alone)`);
console.log('S5 one-tap and menu, rule 3: test/rules/check.js. S10, S11, S12: review states in test/ux/review.js.');
console.log(fail ? `${fail} counter-example(s): the invariants do not hold` : 'every safety invariant holds');
process.exit(fail ? 1 : 0);
