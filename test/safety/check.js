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
// helpers an older page lacks, so its guards report FAIL instead of throwing
for (const [k, v] of [['norm', s => String(s == null ? '' : s)], ['PROSEW', /^$/], ['TAGTEXT', ''], ['containsText', () => ''], ['MEATW', []], ['FISHW', []], ['ONIONW', []], ['ROOTW', []]]) if (typeof globalThis[k] === 'undefined') { try { (0, eval)('var ' + k); } catch (e) {} globalThis[k] = v; }
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
const platePlain = () => ({ title: 'Sprouted moong with jowar roti', subtitle: 'Sprouted moong, jowar roti, cucumber and tomato', cuisine: 'North Indian', prepMinutes: 20,
  items: [{ food: 'Sprouted moong', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: ['plain'] }],
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
      add('D1 held-out, plate item reason', r.ok || /contents|shape/.test(r.why), `${JSON.stringify(o)}: "${name}" was dropped, but not by the declared contents or the name shape (${r.why})`);
      add('D1 held-out, lying-empty tags', !plateOffered(o, withItem(name, [], [])).ok, `${JSON.stringify(o)}: "${name}" with an empty tag list was offered (fail closed)`);
      add('D1 held-out, no tags', !plateOffered(o, withItem(name, undefined, undefined)).ok, `${JSON.stringify(o)}: "${name}" with no tag list was offered`);
      const t = tuneOut(o, 'lunch', { protein: NOTE('Add 80 g ' + name + ' on the side.', [tag]) }, { protein: [{ food: name, grams: 150, contains: [tag], ...z }], base: [] });
      add('D1 held-out, one-tap and swap', !Object.keys(t.alchemy || {}).length && !((t.swaps || {}).protein || []).length, `${JSON.stringify(o)}: tune offered "${name}" (${tag})`);
      const mo = menuOffered(o, cap(name), [tag]);
      add('D1 held-out, menu order', !(mo.orders || []).length && (contentsReason(mo.dropped) || /shape/.test(JSON.stringify(mo.dropped || {}))), `${JSON.stringify(o)}: menu order "${name}" (${tag}) was offered or not dropped by its contents (${JSON.stringify(mo.dropped)})`);
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
add('D1 plain food kept', plateOffered({ diet: 'jain', leave: ['dairy', 'nut', 'wheat', 'soya'], health: 'diabetes', bp: true }, withItem('Sprouted moong with cucumber', ['plain'])).ok, 'plain sprouted moong with cucumber, declared plain, was dropped');
// held-out names that must not be hidden: honest tags with nothing the profile bars
const NH = { meat: { diet: 'veg' }, dairy: { leave: ['dairy'] }, wheat: { leave: ['wheat'] }, soya: { leave: ['soya'] }, onion_garlic: { diet: 'jain' }, root_veg: { diet: 'jain' }, salty_side: { health: 'bp' }, sweet: { health: 'diabetes' }, nuts: { leave: ['nut'] } };
const NHTAGS = { 'Sol kadhi with coconut milk': ['onion_garlic'], 'Coconut milk curry': ['onion_garlic'], 'Peanut chutney': ['nuts'], 'Coconut chutney': [], 'Hing tadka dal': [], 'Lauki sabzi': [], 'Cucumber raita': ['dairy'], 'Sprouts salad': [], 'Roasted chana': [], 'Sugar snap peas': [], 'Soya keema': ['soya', 'onion_garlic'], 'Mushroom keema': ['onion_garlic'], 'Kathal keema': ['onion_garlic'], 'Jackfruit biryani': ['grain', 'onion_garlic'], 'Veg seekh kebab': ['onion_garlic'], 'Rice noodles': ['grain'],
  'Kuttu puri': ['grain'], 'Singhara puri': [], 'Jowar bread': ['grain'], 'Ragi dosa': ['grain'], 'Bajra roti': ['grain'], 'Makki di roti': ['grain'], 'Idli rice cakes': ['grain'], 'Sweet corn soup': ['grain'], 'Rajma curry': ['onion_garlic'], 'Chana masala': ['onion_garlic'] };
for (const [tag, names] of Object.entries(HO.notHidden)) for (const name of names) { const o = NH[tag]; const tags = NHTAGS[name] || [];
  // round 5: a dish with none of the tags declares "plain" (an empty list is dropped, the literal rule)
  const r = plateOffered(o, withItem(name, tags.length ? tags : ['plain']));
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
  // round 5: ask is never shown and the tip is one fixed engine line; the model's words in either field never reach the reply
  const txt = JSON.stringify(r).toLowerCase();
  add('S1-S4 menu field alone', !txt.includes(val.toLowerCase()) && !(r.orders || []).some(x => x.ask) && (!r.tip || !crosses(r.tip, prof(o))), `${JSON.stringify(o)}: menu ${field} "${val}" was shown`); }
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
  // round 5: a typed dish the profile rules out is refused with the diet message, not helped (no affirmed() excuse)
  const r3 = rescueOut({ diet: 'veg' }, 'Mutton biryani', { name: 'Mutton biryani', contains: ['grain', 'meat'] }, [WALK]);
  add('S2 rescue: a typed barred dish is refused', r3.status !== 'ok' && r3.reason === 'diet', `vegetarian: the dish they typed ("Mutton biryani") was helped (${r3.status}, ${r3.reason})`);
  const r4 = rescueOut({ diet: 'veg' }, 'Mutton biryani', { name: 'Mutton biryani', contains: ['grain'] }, [WALK]);
  add('S2 rescue: a typed barred dish is refused', r4.status !== 'ok', 'vegetarian: "Mutton biryani" typed, tagged only grain, was helped'); }

// ---------- S5: with diabetes the grain stays on Rescue moves ----------
for (const title of ['Give the rice to your family and eat the rajma', 'Let the kids have the chawal', 'Have salad in the naan\'s spot', 'Wrap the chicken in lettuce', 'Stop after the rajma and salad']) {
  const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', carbs: 100 }, [{ title, kind: 'portion', contains: ['grain'], deltaKcal: -200, deltaProtein: -2, deltaCarbs: title.startsWith('Stop') ? -55 : -40, deltaFats: -2, deltaFiber: -1 }, WALK]);
  add('S5 rescue', !(r.hacks || []).some(h => h.title === title), `diabetes: Rescue move "${title}" was offered`); }
// round 5: the moves are engine-written from the figures. With diabetes a portion move never takes carbs below half (S5 on structure),
// and a large order still gets a portion move (no false hit)
for (const kcal of [700, 900, 1200, 1600]) for (const carbs of [60, 100, 160]) { const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', kcal, carbs }, []);
  add('S5 rescue engine moves', r.status === 'ok' && (r.hacks || []).every(h => h.kind !== 'portion' || -h.deltaCarbs <= carbs * 0.5) && (r.hacks || []).every(h => !/rice|roti|bread or rice/.test(h.title) || /last/.test(h.title)), `diabetes ${kcal} kcal ${carbs} g carbs: ${JSON.stringify((r.hacks || []).map(h => h.title + ' ' + h.deltaCarbs))}`); }
{ const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', kcal: 1400, carbs: 100 }, []);
  add('S5 rescue no false hit', (r.hacks || []).some(h => h.kind === 'portion'), `diabetes: a 1400 kcal order got no portion move (${JSON.stringify(r.hacks)})`); }

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
  else if (/hosted\/v5/.test(process.argv[2] || '')) console.log('S7 app ranking: not run on the v5 screens (not a release target; the v5 app has no tick-all ranking)');
  else add('S7 app ranking', false, 'healthOf was not found in the page'); }

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

const WALKNAMES = [];   // a few held-out names from every tag, and the auditor's own
for (const [tag, names] of Object.entries(HO)) if (BARS[tag]) names.filter((n, i) => i < 4 || /^(Mahi tikka|Mor|Nei|Piyaz chutney|Bheja|Raan|Baida roti|Misri|Cheeni|Meetha pulao|Complan|Threptin|Gongura pachadi)$/.test(n)).forEach(n => WALKNAMES.push([tag, n]));
// ---------- safety round 5: a planted token in every string field of every reply schema (walked from the schema, so a new field is covered) ----------
// A nonsense token, ZQXJ-shaped so no list can know it, is planted in each string field in turn. It may come back only where a name or the
// client's own text belongs: a plate item, a swap, a one-tap item, a menu dish, side or leave entry. Everywhere else it must not appear.
const strPaths = (sch, pre) => { const out = []; if (!sch) return out;
  if (sch.type === 'OBJECT') for (const [k, v] of Object.entries(sch.properties || {})) out.push(...strPaths(v, (pre ? pre + '.' : '') + k));
  else if (sch.type === 'ARRAY') out.push(...strPaths(sch.items, pre + '.0'));
  else if (sch.type === 'STRING' && !sch.enum) out.push(pre);
  return out; };
const setAt = (o, path, v) => { const ks = path.split('.'); let x = o; ks.slice(0, -1).forEach((k, i) => { if (x[k] == null) x[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; x = x[k]; }); x[ks[ks.length - 1]] = v; };
const allStr = (o, acc = []) => { if (typeof o === 'string') acc.push(o); else if (o && typeof o === 'object') Object.values(o).forEach(v => allStr(v, acc)); return acc; };
const shown = (out, name) => { const rx = new RegExp('(^|[^a-z])' + norm(name).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z])'); return allStr(out).some(s => rx.test(norm(s).toLowerCase())); };
const NAMEF = /(^|\.)(items\.0\.food|swaps\.(protein|base)\.0\.food|alchemy\.[a-z]+\.add_item|dishes\.0\.as_written|dishes\.0\.with|leave\.0\.as_written)$/;
const PT = safe(() => TAGS.indexOf('plain') >= 0, false) ? ['plain'] : [];   // an older page has no "plain" tag (it believed an empty list)
// the base replies also carry the older fields, so they pass on an older page and the walk plants in its sentence fields too
const OLDM = { subtitle: 'Sprouted moong, jowar roti, cucumber and tomato', cuisine: 'North Indian', for_you: 'A light lunch.', why: [{ pair: 'Moong and roti', effect: 'Protein and grain together.' }] };
const baseMeal = () => ({ title: 'Sprouted moong with jowar roti', prepMinutes: 20, ...OLDM,
  items: [{ food: 'Sprouted moong', grams: 200, group: 'protein', contains: PT }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: PT }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 500, protein: 22, carbs: 70, fats: 14, fiber: 14, taste: ['tangy', 'fresh'], planned_around: [],
  swaps: { protein: [{ food: 'Sprouted moong', grams: 200, contains: PT, ...z }, { food: 'Boiled chickpeas', grams: 180, contains: PT, ...z }], base: [{ food: 'Jowar roti', made_of: 'jowar', grams: 90, contains: ['grain'], ...z }, { food: 'Bajra roti', made_of: 'bajra', grams: 90, contains: ['grain'], ...z }] },
  alchemy: { protein: { titleSuffix: '+ more moong', note: 'Add 50 g sprouted moong.', add_item: 'Sprouted moong', add_grams: 50, minutes: 20, grain_grams_after: 90, contains: PT, deltaKcal: 40, deltaProtein: 6, deltaCarbs: 4, deltaFats: 0, deltaFiber: 2 } } });
const MENUBASE = () => ({ status: 'ok', refer_reason: 'none', place: 'Restaurant', tip: 'Eat slowly.', dishes: [{ as_written: 'Plain Moong', ask: 'Ask for less oil', portion: 'about 300 g', kcal: 520, protein: 24, carbs: 64, fats: 18, fiber: 8, grain_made_of: 'jowar', grain_grams: 60, with: '2 Jowar Roti', with_kcal: 160, with_protein: 4, with_carbs: 30, with_fats: 3, with_fiber: 4, contains: PT, with_contains: ['grain'], planned_around: [] }],
  leave: [{ as_written: 'Plain Moong', reason: 'rich', contains: PT }] });
const WALKS = [
  ['meals', (o) => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false } }), () => ({ status: 'ok', refer_reason: 'none', meals: [baseMeal()] }), (r) => (r.meals || []).length > 0],
  ['ask', (o) => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false, text: 'Something light' } }), () => ({ status: 'ok', refer_reason: 'none', meals: [baseMeal()] }), (r) => (r.meals || []).length > 0],
  ['tune', (o) => plan('tune', { profile: Object.assign({}, BASE, o), slot: 'lunch', meal: Object.assign(baseMeal(), { minutes: 20 }) }), () => { const m = baseMeal(); return { swaps: m.swaps, alchemy: m.alchemy }; }, (r) => r.status === 'ok' && Object.keys(r.alchemy || {}).length > 0],
  ['menu', (o, name) => plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'MAINS\nPlain Moong 240\n' + (name ? name + ' 200\n' : '') + 'SIDES\nJowar Roti 30\n' } }), MENUBASE, (r) => (r.orders || []).length > 0],
  ['rescue', (o) => plan('rescue', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'Veg thali' } }),
    () => ({ status: 'ok', refer_reason: 'none', dish: { name: 'Veg thali', portion: 'about 400 g', kcal: 700, protein: 22, carbs: 100, fats: 22, fiber: 10, warning: '', breakdown: 'Rice, dal and sabzi.', contains: ['grain'] }, hacks: [{ title: 'A 15-minute walk after the meal', kind: 'move', contains: [], ...z }] }), (r) => r.status === 'ok'],
  ['log', (o) => plan('log', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'Sprouted moong and jowar roti' } }),
    () => ({ status: 'ok', refer_reason: 'none', title: 'Moong and roti', assumed: 'A home portion.', items: [{ food: 'Sprouted moong', grams: 200, group: 'protein' }, { food: 'Jowar roti', grams: 90, group: 'carbs' }], kcal: 500, protein: 22, carbs: 70, fats: 14, fiber: 14 }), (r) => r.status === 'ok' && r.items.length === 2],
];
let walked = 0;
const TOKEN = 'Zqxjvoq';
for (const [kind, mk, base, okBase] of WALKS) {
  const pl0 = mk({}); add('round 5 walk: base replies pass', !!pl0.check && okBase(pl0.check(base())), `${kind}: the base reply did not pass`);
  for (const path of strPaths(pl0.schema)) { walked++;
    // the token, letters only so the name shape passes: in a name field it may show (as that name); anywhere else it must not
    for (const v of [TOKEN, 'Add ' + TOKEN.toLowerCase() + ' today', 'ZQXJ7 ' + TOKEN]) { const r = base(); setAt(r, path, v); const out = safe(() => mk({}).check(r), {});
      const ok = NAMEF.test(path) && /^[A-Za-z]{2,}(?:[ -][A-Za-z]{2,})*$/.test(v) ? true : !shown(out, TOKEN);   // a name field may show a name-shaped value as that name; nothing else may show
      add('round 5 walk: model text shows only as a name', ok, `${kind}: "${v}" placed in ${path} was shown`); }
    // held-out names in prose fields never show; in name fields with their honest tag they are dropped
    for (const [tag, name] of WALKNAMES) { const o = BARS[tag][0]; const pl = mk(o, name); if (!pl.check) continue; const r = base();
      if (NAMEF.test(path)) { if (/^leave\.0\.as_written$/.test(path) && tag === 'sweet') continue; setAt(r, path, path.endsWith('with') ? '1 ' + name : name); const ks = path.split('.'); const holder = ks.slice(0, -1).reduce((x, k) => x[k], r); const key = /with$/.test(path) ? 'with_contains' : 'contains'; holder[key] = [tag]; }
      else setAt(r, path, 'Add a side of ' + name + ' today');
      const out = safe(() => pl.check(r), {});
      add('round 5 walk: no held-out name in any field', kind === 'log' || !shown(out, name), `${kind} ${JSON.stringify(o)}: "${name}" (${tag}) placed in ${path} was shown`); }
    // S8 and S9 words never come back from a sentence field
    for (const u of ['2 katori cucumber', 'a fist of rice', 'two tablespoons of rice', 'take your b12 drops', 'take a vitamin daily']) { if (NAMEF.test(path)) continue;
      const r = base(); setAt(r, path, u); const out = safe(() => mk({}).check(r), {}); add('round 5 walk: no unit or supplement sentence in any field', !allStr(out).some(s => s.toLowerCase().includes(u)), `${kind}: "${u}" placed in ${path} was shown`); }
    // random code points and look-alike letters in a name field: what is shown is ASCII-shaped, or nothing
    if (NAMEF.test(path)) { let seed = 7 + walked; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      for (let k = 0; k < 40; k++) { const cp = [0x0261, 0x0131, 0x1D04, 0x0251, 0xE0020, 0xFFFA, 0x1D173, 0x200B, 0x0301, 0xFF43, 0x0430, 0x03BF][k % 12], at = 1 + Math.floor(rnd() * 5), wrd = 'Chicken tikka';
        const r = base(); setAt(r, path, wrd.slice(0, at) + String.fromCodePoint(cp) + wrd.slice(at)); const out = safe(() => mk({}).check(r), {});
        add('round 5 walk: a name with other code points is ASCII-shaped or dropped', allStr(out).every(s => /^[\x20-\x7E ≈]*$/.test(s) || /^[ऀ-ൿ\s]*$/.test(s) === false && !/tikka/i.test(s)), `${kind}: ${path} with U+${cp.toString(16)} showed ${JSON.stringify(allStr(out).filter(s => /tikka/i.test(s)))}`); } } } }
console.log(`round 5 schema walk: ${walked} string fields`);
// ---------- round 5: every handler that writes the log or shows a composed state goes through act() (dayMoved, then the composed check) ----------
// A handler is the second argument of addEventListener; a named handler is looked up by its definition.
{ // read from src/v6/app.js (the minified page renames act); with an older page as the argument, its own script is read instead
  const app = process.argv[2] && !/hosted\//.test(process.argv[2]) ? [...page.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x => x[1]).filter(x => /addEventListener\(/.test(x)).join('\n') : fs.readFileSync(path.join(__dirname, '../../src/v6/app.js'), 'utf8');
  const argAt = (src, i) => { let d = 0, q = '', j = i; for (; j < src.length; j++) { const c = src[j];
      if (q) { if (c === '\\') { j++; continue; } if (c === q) q = ''; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j + 2) + 1; continue; }
      if (c === '(' || c === '{' || c === '[') d++; else if (c === ')' || c === '}' || c === ']') { if (d === 0) break; d--; } else if (c === ',' && d === 0) break; }
    return src.slice(i, j); };
  const WRITES = /logEv\(|clearSlot\(|UI\.alc\[|UI\.mmoves\[|UI\.rmoves\[|UI\[x\[2\]\]=|EV\.push\(|EV=/;
  let n = 0, wrapped = 0;
  for (const m of app.matchAll(/addEventListener\("([a-z]+)",/g)) { let h = argAt(app, m.index + m[0].length).trim(); let body = h;
    if (/^[A-Za-z_$][\w$]*$/.test(h)) { const d = new RegExp('function ' + h + '\\(').exec(app); if (d) { const o = app.indexOf('{', d.index); body = app.slice(o, o + 1) + argAt(app, o + 1) + '}'; } }
    if (!WRITES.test(body)) continue; n++; if (/^act\(/.test(h)) wrapped++;
    add('round 5 handler wrapper', /^act\(/.test(h), `a ${m[1]} handler that writes the log or composes is not wrapped in act(): ${h.slice(0, 120)}`); }
  add('round 5 handler wrapper found handlers', n >= 10, `only ${n} handlers that write the log or compose were found; the guard is not reading the page`);
  console.log(`round 5 handlers that write the log or compose: ${n}, wrapped in act(): ${wrapped}`); }

// ---------- S8 in names (usefulness brief): a name is cleaned, not dropped for its shape; a household count never shows in it ----------
// (The engine-written side, "<count> <name>" with a grain side's grams, is the owner's form for a side (14 Nov) and is not a model name.)
const COUNTW = /\b\d+\s*(?:x\s*)?(?:rotis?|phulkas?|chapatis?|katoris?|bowls?|cups?|glass(?:es)?|pcs|pieces?|slices?|spoons?|tbsp|tsp|ladles?|idlis?|dosas?|puris?|parathas?|nos)\b|\bkatoris?\b/i;
const COUNTED = ['Chicken Curry Thali (2 roti, rice, chicken curry, salad)', 'Dal with 2 phulkas', 'Paneer tikka 2 pcs', 'Rajma chawal, 1 bowl', '1 katori moong dal', 'Idli (3 nos)'];
for (const [kind, mk, base] of WALKS) { if (kind === 'log') continue; const pl0 = mk({}); if (!pl0.check) continue;
  for (const pth of strPaths(pl0.schema).filter(x => NAMEF.test(x) && !/\.with$/.test(x))) for (const v of COUNTED) {
    const r = base(); setAt(r, pth, v); const pl = mk({ diet: 'nonveg' }, v.replace(/\s*\(.*\)/, '')); const out = safe(() => pl.check(r), {});
    const bad = allStr(out).filter(x => COUNTW.test(x));
    add('S8 no household count in a shown name', !bad.length, `${kind}: "${v}" in ${pth} showed ${JSON.stringify(bad.slice(0, 2))}`); } }
// cleaned, not dropped: an honest name with brackets, a comma tail or a count is offered, shown without them
for (const [raw, shown] of [['Whole wheat phulka (2 rotis)', 'Whole wheat phulka'], ['Flattened rice, softened', 'Flattened rice'], ['Steamed rice 150 g', 'Steamed rice'], ['Cucumber, tomato and onion salad', 'Cucumber, tomato and onion salad']]) {
  const m = platePlain(); m.items[2] = { food: raw, grams: 100, group: 'greens', contains: ['plain'] }; const r = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(m)), {});
  const it = (((r.meals || [])[0] || {}).items || []).map(i => i.food);
  add('S8 names are cleaned, not dropped', it.includes(shown), `"${raw}" showed ${JSON.stringify(it)}, not "${shown}"`); }
// every check still reads the raw name, brackets included: the canteen thali with papad and pickle is dropped for high blood pressure
for (const o of [{ health: 'bp' }, { health: 'diabetes', bp: true }]) {
  add('S3 brackets are read', !plateOffered(o, withItem('Veg thali (dal, sabzi, papad, pickle)', ['grain'])).ok, `${JSON.stringify(o)}: plate "Veg thali (dal, sabzi, papad, pickle)" was offered`);
  add('S3 brackets are read', !(menuOffered(o, 'Veg Thali (dal, sabzi, papad, pickle)', ['grain']).orders || []).length, `${JSON.stringify(o)}: menu "Veg Thali (dal, sabzi, papad, pickle)" was offered`); }
add('S2 brackets are read', !plateOffered({ diet: 'veg' }, withItem('Veg thali (with chicken curry)', ['grain'])).ok, 'vegetarian: "Veg thali (with chicken curry)" was offered');
add('S9 brackets are read', !plateOffered({}, withItem('Oats porridge (with protein powder)', ['grain'])).ok, '"Oats porridge (with protein powder)" was offered');

// a referral always shows the fixed line
for (const t of ['Ask your doctor before you eat chicken soup or 1 katori of curd.', 'Have some gulab jamun now and call your doctor.', 'Speak to your doctor; meanwhile a glass of Complan helps.']) {
  const r = safe(() => plan('meals', { profile: Object.assign({}, BASE, { diet: 'veg', health: 'diabetes' }), ctx: { meal: 'lunch', text: 'x' } }).check({ status: 'refer', refer_reason: 'none', refer: t, meals: [] }), {});
  add('S7 referral text is the fixed line', r.status === 'refer' && r.read === SAFETY, `plate referral showed "${r.read}"`); }

// ---------- B6: text intake. Every listed word and every held-out name, with each trick character at each position, is still caught ----------
const TRICKS = ['​', '­', '‍', '‌', '⁠', '﻿', '́'];
const fullWidth = s => s.replace(/[A-Za-z]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0xFEE0));
const tricked = w => { const out = [fullWidth(w)]; for (const t of TRICKS) for (let i = 1; i < w.length; i++) out.push(w.slice(0, i) + t + w.slice(i)); return out; };
const LISTED = [['wheat', { leave: ['wheat'] }], ['nut', { leave: ['nut'] }], ['dairy', { leave: ['dairy'] }], ['soya', { leave: ['soya'] }], ['meat', { diet: 'veg' }], ['egg', { diet: 'veg' }], ['jain', { diet: 'jain' }], ['salty', { health: 'bp' }], ['sweet', { health: 'diabetes' }]];
for (const [cat, o] of LISTED) for (const w of L[cat].concat(AR[cat] || [])) for (const x of tricked(w)) add('B6 trick characters (word net)', crosses(quoted(x, 80), prof(o)), `${JSON.stringify(o)}: "${JSON.stringify(x)}" passed the word net`);
for (const [tag, name] of WALKNAMES) for (const x of tricked(name).filter((_, i) => i % 3 === 0)) {
  const o = BARS[tag][0]; add('B6 trick characters (held-out, tags)', !plateOffered(o, withItem(x, [tag])).ok, `${JSON.stringify(o)}: "${JSON.stringify(x)}" was offered`);
  const m = platePlain(); m.for_you = 'Add a side of ' + x + ' today'; const pl = plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch' } }); const r = safe(() => pl.check(mealsReply(m)), {});
  add('B6 trick characters (held-out, prose)', !shown(r, name), `${JSON.stringify(o)}: for_you with "${JSON.stringify(x)}" was shown`); }
// typed referrals keep working after intake normalisation (Devanagari and Tamil marks are kept)
for (const t of HO.referText.concat(L.referText)) add('B6 intake keeps S7', refers('meals', t) && refers('meals', t.split('').join('​')), `"${t}" with zero-width spaces went to the model`);

// ---------- B4, round 5: the literal empty-list rule. An empty or missing list drops any name, plain or not; "plain" is how a plain food declares ----------
for (const n of ['Dal tadka', 'Sabudana', 'Sabudana khichdi', 'Rajma', 'Sprouted moong', 'Cucumber', 'Banana split', 'Lemon squash', 'Orange squash', 'Coconut slice', 'Baked beans'])
  for (const o of [{ diet: 'vegan' }, { diet: 'jain' }, { leave: ['nut'] }, { health: 'diabetes' }, {}]) add('B4 literal empty rule', !plateOffered(o, withItem(n, [])).ok && !(menuOffered(o, n, []).orders || []).length, `${JSON.stringify(o)}: "${n}" with [] was offered`);
add('B4 plain tag', plateOffered({ diet: 'jain', leave: ['dairy', 'nut', 'wheat', 'soya'], health: 'diabetes', bp: true }, withItem('Sprouted moong with cucumber', ['plain'])).ok, 'plain sprouted moong declared "plain" was dropped');
add('B4 plain tag in the schema', !!safe(() => JSON.stringify(plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).schema).includes('"plain"'), false), 'the schema does not offer the "plain" tag');

// ---------- B5: food the app writes, every entry against every profile (tags here are written apart from the engine's) ----------
{ const T = { 'Only dal, rice and curd at home': ['dairy'], 'Andhra mutton biryani': ['meat', 'dairy', 'onion_garlic'], 'Pahadi mutton rara with 2 butter rotis': ['meat', 'dairy', 'wheat', 'onion_garlic'], 'Peri-peri half chicken with spicy rice': ['meat', 'onion_garlic'],
    'Paneer butter masala with 2 butter naan': ['dairy', 'wheat', 'onion_garlic'], 'Chole bhature': ['wheat', 'onion_garlic'], 'Veg biryani with raita': ['dairy', 'onion_garlic'], 'Masala dosa with chutney': ['root_veg', 'onion_garlic'], 'A slice of tiramisu after dinner': ['dairy', 'egg', 'wheat', 'sweet'] };
  const PROFS = []; for (const diet of ['veg', 'egg', 'nonveg', 'jain', 'vegan']) for (const leave of [[], ['dairy'], ['nut'], ['wheat'], ['soya']]) for (const h of [{ health: 'none' }, { health: 'diabetes' }, { health: 'bp' }]) PROFS.push(Object.assign({ diet, leave }, h));
  const all = (typeof APPDISHES !== 'undefined' ? APPDISHES.concat(APPASKS) : []);
  add('B5 app food is tagged', all.length === 12, 'the app’s dishes and asks are not in np-core with their tags');
  for (const o of PROFS) { const p = prof(o), bar = barredTags(p); for (const e of all) if (safe(() => appFoodOK(e, p), true)) add('B5 app food against every profile', !(T[e[0]] || []).some(t => bar.includes(t)), `${JSON.stringify(o)}: "${e[0]}" is shown`); } }

// ---------- B1: only what the client named, per tag ----------
{ const cases = [[{ diet: 'veg' }, 'Veg biryani, no egg', 'Egg biryani', ['grain', 'egg']], [{ diet: 'veg' }, 'Paneer tikka, not chicken', 'Chicken tikka', ['meat']], [{ leave: ['dairy'] }, 'Thali, no paneer', 'Paneer thali', ['grain', 'dairy']],
    [{ diet: 'jain' }, 'Thali, no onion no garlic', 'Lahsuni dal thali', ['grain', 'onion_garlic']], [{ diet: 'jain' }, 'Jain pav bhaji, no potato', 'Pav bhaji with lahsuni chutney', ['onion_garlic', 'wheat']], [{ diet: 'egg' }, 'Egg curry, no chicken', 'Egg curry with bangude', ['egg', 'fish']],
    [{ diet: 'veg' }, 'Mutton biryani', 'Mutton and prawn biryani', ['meat', 'fish', 'grain']], [{ diet: 'jain' }, 'Onion uttapam', 'Onion and potato uttapam', ['grain', 'onion_garlic', 'root_veg']]];
  const NEGW = ['no', 'not', 'without', 'skip the', 'no extra'], FOOD = [['egg', 'egg', { diet: 'veg' }], ['chicken', 'meat', { diet: 'veg' }], ['fish', 'fish', { diet: 'egg' }], ['paneer', 'dairy', { diet: 'vegan' }], ['onion', 'onion_garlic', { diet: 'jain' }], ['garlic', 'onion_garlic', { diet: 'jain' }], ['potato', 'root_veg', { diet: 'jain' }], ['peanuts', 'nuts', { leave: ['nut'] }]];
  for (const neg of NEGW) for (const [f, tag, o] of FOOD) cases.push([o, 'Veg thali, ' + neg + ' ' + f, cap(f) + ' thali', ['grain', tag]]);
  for (const [o, typed, dish, tags] of cases) { const r = rescueOut(o, typed, { name: dish, contains: tags }, [WALK]);
    add('B1 typed excuse', r.status !== 'ok', `${JSON.stringify(o)}: typed "${typed}", dish "${dish}" ${JSON.stringify(tags)} was shown`); }
  const r = rescueOut({ diet: 'veg' }, 'Veg thali, no chicken', { name: 'Veg thali', warning: 'Chicken pieces are fried', breakdown: 'The chicken gravy carries most of the fat' }, [WALK]);
  add('B1 typed excuse', r.status === 'ok' && !/chicken/i.test(r.dish.warning + r.dish.breakdown), 'a negated word excused the warning or breakdown');
  const r2 = rescueOut({ diet: 'veg' }, 'Veg fried rice, no egg', { name: 'Veg fried rice' }, [{ title: 'Eat half the egg fried rice', kind: 'portion', contains: ['egg', 'grain'], deltaKcal: -200, deltaProtein: -4, deltaCarbs: -30, deltaFats: -6, deltaFiber: 0 }, WALK]);
  add('B1 typed excuse', !(r2.hacks || []).some(h => /egg/i.test(h.title)), 'a negated egg excused a portion move'); }

// ---------- M3: the day starts at 4 am on local calendar fields, daylight saving included ----------
{ const cp = require('child_process'), core = path.resolve(process.argv[2] || 'hosted/v6/index.html');
  const prog = `const fs=require('fs');const page=fs.readFileSync(${JSON.stringify(core)},'utf8');const o='<script id="np-core">',a=page.indexOf(o)+o.length;(0,eval)(page.slice(a,page.indexOf('</script>',a)));
    const T=JSON.parse(process.argv[1]);console.log(JSON.stringify(T.map(([y,mo,d,h,mi])=>dayOf(new Date(y,mo-1,d,h,mi).getTime()))));`;
  const run = (tz, times) => safe(() => JSON.parse(cp.execFileSync(process.execPath, ['-e', prog, JSON.stringify(times)], { env: Object.assign({}, process.env, { TZ: tz }) }).toString()), []);
  const ny = [[2026, 11, 1, 3, 30], [2026, 11, 1, 4, 30], [2026, 11, 1, 1, 30], [2027, 3, 14, 3, 30], [2027, 3, 14, 4, 30], [2027, 3, 14, 5, 0]], nyWant = [20261031, 20261101, 20261031, 20270313, 20270314, 20270314];
  const r1 = run('America/New_York', ny); ny.forEach((t, i) => add('M3 day start, daylight saving', r1[i] === nyWant[i], `New York ${t.join('-')}: day ${r1[i]}, want ${nyWant[i]}`));
  const ik = [[2026, 11, 12, 23, 59], [2026, 11, 13, 0, 30], [2026, 11, 13, 3, 59], [2026, 11, 13, 4, 0]], ikWant = [20261112, 20261112, 20261112, 20261113];
  const r2 = run('Asia/Kolkata', ik); ik.forEach((t, i) => add('M3 day start, Kolkata', r2[i] === ikWant[i], `Kolkata ${t.join('-')}: day ${r2[i]}, want ${ikWant[i]}`)); }

// ---------- m5: a menu partly in another script gets the note ----------
{ const pl = plan('menu', { profile: BASE, ctx: { meal: 'lunch', text: 'MAINS\nPlain Moong 240\nपनीर टिक्का 300\n' } });
  const r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', place: '', tip: '', leave: [], dishes: [Object.assign({}, WALKS[3][2]().dishes[0], { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, grain_made_of: '', grain_grams: 0 }), Object.assign({}, WALKS[3][2]().dishes[0], { as_written: 'पनीर टिक्का' })] }), {});
  add('m5 partly another script', (r.orders || []).length > 0 && /English letters/.test(r.scriptNote || ''), `status ${r.status}, note "${r.scriptNote}"`); }
// m4: on medicines a tune names its meal
add('m4 tune slot on medicines', !!safe(() => plan('tune', { profile: Object.assign({}, BASE, { health: 'diabetes', meds: 'yes' }), meal: Object.assign(baseMeal(), { minutes: 20 }) }).error, false), 'a tune with no meal on medicines was planned');

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       … ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(`held-out names: ${heldN} (${heldByWords} of them also caught by the word lists alone)`);
console.log('S5 one-tap and menu, rule 3: test/rules/check.js. S10, S11, S12: review states in test/ux/review.js.');
console.log(fail ? `${fail} counter-example(s): the invariants do not hold` : 'every safety invariant holds');
process.exit(fail ? 1 : 0);
