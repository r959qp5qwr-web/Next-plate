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
// no regular expression in np-core looks behind: Safari before 16.4 (iOS 15 phones) rejects (?<! and (?<=, and the whole script would not run
const LOOKBEHIND = /\(\?<[!=]/.test(page.slice(a, page.indexOf('</script>', a)));
// helpers an older page lacks, so its guards report FAIL instead of throwing
for (const [k, v] of [['norm', s => String(s == null ? '' : s)], ['PROSEW', /^$/], ['TAGTEXT', ''], ['containsText', () => ''], ['MEATW', []], ['FISHW', []], ['ONIONW', []], ['ROOTW', []]]) if (typeof globalThis[k] === 'undefined') { try { (0, eval)('var ' + k); } catch (e) {} globalThis[k] = v; }
const LX = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8')), L = LX.known, HO = LX.heldout;
const fx = require('../v5/fixture.js'), fxm = require('../v6/fixture-menu.js');
const BASE = { goal: 'lose', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const prof = (o, slot) => { const p = readProfile(Object.assign({}, BASE, o)); p.slot = slot || 'lunch'; return p; };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
add('np-core has no look-behind (older phone browsers reject it)', !LOOKBEHIND, 'np-core holds (?<! or (?<=');
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
const rescueShown = (r) => r && r.status === 'ok' ? [r.dish.name, r.dish.portion, r.dish.warning, r.dish.breakdown].concat((r.hacks || []).map(h => h.title)).join(' | ') : '';
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
      add('D1 held-out, Rescue dish', !rescueShown(rd).toLowerCase().includes(name.toLowerCase()), `${JSON.stringify(o)}: Rescue showed the model's dish "Thali with ${name}" (${tag}), not typed: ${rescueShown(rd)}`);
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
  // usefulness brief: the "why" line is back, written by the engine; the model's for_you, pairing tip, read and cuisine never show
  add('S1 shown fields', !!x.title && !/ghee|paneer/i.test(x.forYou || '') && !crosses(x.forYou || '', prof({ leave: ['dairy'] })) && !(x.why || []).length && !r.read && !x.cuisine, `dairy left out: for_you "${x.forYou}", why ${JSON.stringify(x.why)}, read "${r.read}", cuisine "${x.cuisine}"`); }
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
  add('S2 rescue dish', !/chicken/i.test(rescueShown(r)), 'vegetarian: the model\'s Rescue dish "Veg biryani with chicken 65" (not typed) was shown: ' + rescueShown(r));
  const r2 = rescueOut({ leave: ['dairy'] }, 'Veg biryani', { name: 'Veg biryani', warning: 'Heavy on ghee', breakdown: 'Rice cooked in ghee with paneer.', contains: ['grain'] }, [WALK]);
  add('S1 rescue warning and breakdown', r2.status === 'ok' && !r2.dish.warning && !r2.dish.breakdown, 'dairy left out: the Rescue warning or breakdown naming ghee or paneer was shown');
  // round 5: a typed dish the profile rules out is refused with the diet message, not helped (no affirmed() excuse)
  const r3 = rescueOut({ diet: 'veg' }, 'Mutton biryani', { name: 'Mutton biryani', contains: ['grain', 'meat'] }, [WALK]);
  // usefulness brief: a dish the client typed is theirs and is helped as typed, whatever their rules bar; the moves are the engine's and name no food
  add('S2 rescue: a typed dish is the client\'s own', r3.status === 'ok' && r3.dish.name === 'Mutton biryani' && (r3.hacks || []).every(h => !crosses(h.title, prof({ diet: 'veg' }))), `vegetarian: the dish they typed ("Mutton biryani") was not helped as typed (${r3.status}, ${rescueShown(r3)})`);
  const r4 = rescueOut({ diet: 'veg' }, 'Mutton biryani', { name: 'Mutton biryani', contains: ['grain'] }, [WALK]);
  add('S2 rescue: a typed dish is the client\'s own', r4.status === 'ok' && r4.dish.name === 'Mutton biryani', 'vegetarian: "Mutton biryani" typed, tagged only grain, was not helped as typed'); }

// ---------- S5: with diabetes the grain stays on Rescue moves ----------
for (const title of ['Give the rice to your family and eat the rajma', 'Let the kids have the chawal', 'Have salad in the naan\'s spot', 'Wrap the chicken in lettuce', 'Stop after the rajma and salad']) {
  const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', carbs: 100 }, [{ title, kind: 'portion', contains: ['grain'], deltaKcal: -200, deltaProtein: -2, deltaCarbs: title.startsWith('Stop') ? -55 : -40, deltaFats: -2, deltaFiber: -1 }, WALK]);
  add('S5 rescue', !(r.hacks || []).some(h => h.title === title), `diabetes: Rescue move "${title}" was offered`); }
// round 5: the moves are engine-written from the figures. With diabetes a portion move never takes carbs below half (S5 on structure),
// and a large order still gets a portion move (no false hit)
for (const kcal of [700, 900, 1200, 1600]) for (const carbs of [60, 100, 160]) { const fats = Math.round((kcal - 4 * 24 - 4 * carbs) / 9);   // figures that agree (A2)
  const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', kcal, carbs, protein: 24, fats }, []);
  add('S5 rescue engine moves', r.status === 'ok' && (r.hacks || []).every(h => h.kind !== 'portion' || -h.deltaCarbs <= carbs * 0.5) && (r.hacks || []).every(h => !/rice|roti|bread or rice/.test(h.title) || /last/.test(h.title)), `diabetes ${kcal} kcal ${carbs} g carbs: ${JSON.stringify((r.hacks || []).map(h => h.title + ' ' + h.deltaCarbs))}`); }
{ const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', kcal: 1400, carbs: 100, protein: 24, fats: 101 }, []);
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
    // at-risk sample: on medicines the prompt states the floor as a minimum, never as a centre to land within 10 percent of (plates and menu)
    for (const kind of ['meals', 'menu']) { const pr = plan(kind, { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: kind === 'menu' ? 'MAINS\nDal Fry 200' : undefined } }).prompt || '', u = medsUsual(readProfile(Object.assign({}, BASE, o)), 'lunch');
      const m = /at least (\d+) kcal(?:, never below| \(never below)/.exec(pr);   // the target line, or with no body figures the medicines line
      add('S6 prompt states the floor as a minimum', !!m && +m[1] >= u && !/Target for this meal: about/.test(pr) && !/within 10 percent of the kcal target/.test(pr), `${JSON.stringify(o)} ${kind}: ${(/- Target for this meal:[^\n]*/.exec(pr) || ['no target line'])[0]}`); }
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
// a kidney or gurda dish on a PHOTO menu refers the client, as the typed menu does, whatever refer_reason the model gives (owner, 16 Nov:
// "Any typed kidney word (except kidney beans/rajma) refers the client to coach or doctor, even when it is a dish on a menu"; Critic round
// 40, for the auditor). On a dish, a side and a leave entry. Kidney beans, rajma and a gurdwara's langar are not referred (control).
{ const photo = (dishes, leave) => { const pl = plan('menu', { profile: Object.assign({}, BASE, { diet: 'nonveg' }), ctx: { meal: 'lunch', text: '' }, image: 'AAAA' });
    return safe(() => pl.check({ status: 'ok', refer_reason: 'none', dishes: dishes.map(([n, t, w]) => ({ as_written: n, portion: 'about 300 g', kcal: 560, protein: 26, carbs: 50, fats: 28, fiber: 6, grain_made_of: '', grain_grams: 0, with: w || '', with_kcal: w ? 120 : 0, with_protein: w ? 3 : 0, with_carbs: w ? 22 : 0, with_fats: w ? 2 : 0, with_fiber: w ? 1 : 0, request: 'none', contains: t, contains_listed: t, with_contains: w ? ['wheat', 'grain'] : ['plain'], planned_around: [] })),
      leave: (leave || []).map(n => ({ as_written: n, reason: 'rich', contains: ['meat'] })) }), {}); };
  const BC = ['Butter Chicken', ['meat', 'dairy']];
  for (const [what, dishes, leave] of [['dish "Gurda Fry"', [BC, ['Gurda Fry', ['meat']]]], ['dish "Mutton Kidney Masala"', [BC, ['Mutton Kidney Masala', ['meat']]]], ['dish "Kapoora Gurday"', [BC, ['Kapoora Gurday', ['meat']]]],
      ['side "2 Gurda Fry"', [['Butter Chicken', ['meat', 'dairy'], '2 Gurda Fry']]], ['leave entry "Gurda Fry"', [BC], ['Gurda Fry']]]) {
    const r = photo(dishes, leave); add('S7 photo menu: a kidney or gurda dish refers', r.status === 'refer' && r.read === SAFETY && !(r.orders || []).length, `photo menu with ${what}: status ${r.status}, orders ${JSON.stringify((r.orders || []).map(o => o.name))}`); }
  for (const n of ['Rajma Masala', 'Kidney Bean Curry', 'Red Kidney Beans Salad']) { const r = photo([BC, [n, ['plain']]]);
    add('S7 photo menu: kidney beans and rajma are not referred (control)', r.status === 'ok' && (r.orders || []).length === 2, `photo menu with "${n}": ${r.status} ${JSON.stringify(r.dropped)}`); } }
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
const COUNTED = ['Chicken Curry Thali (2 roti, rice, chicken curry, salad)', 'Dal with 2 phulkas', 'Paneer tikka 2 pcs', 'Rajma chawal, 1 bowl', '1 katori moong dal', 'Idli (3 nos)', 'Idli (2 pcs)', 'Egg curry (2 eggs)'];
for (const [kind, mk, base] of WALKS) { if (kind === 'log') continue; const pl0 = mk({}); if (!pl0.check) continue;
  for (const pth of strPaths(pl0.schema).filter(x => NAMEF.test(x) && !/\.with$/.test(x))) for (const v of COUNTED) {
    const r = base(); setAt(r, pth, v); const pl = mk({ diet: 'nonveg' }, v.replace(/\s*\(.*\)/, '')); const out = safe(() => pl.check(r), {});
    const bad = allStr(out).filter(x => COUNTW.test(x));
    add('S8 no household count in a shown name', !bad.length, `${kind}: "${v}" in ${pth} showed ${JSON.stringify(bad.slice(0, 2))}`); } }
// counts written as words (final audit M2). The words and the nouns after them are this test's own, kept apart from the engine's lists:
// count nouns the engine does not list ("kozhukattais", "pathiris") must go too, so a rule that knows only listed piece words cannot pass.
const COUNTWORDS = /\b(?:glass|bowl|cup|plate|handful|katori|tumbler|mug)s?\s+of\b|\b(?:chhe|saat|aath|nau|das)\s+(?:[a-z]+\s+)?(?:rotis?|idlis?|puris?|dosas?|eggs?|parathas?|phulkas?|chapatis?)\b|\b(?:do|teen|char)\s+(?:rotiy|chapatiy|puriy)\w*|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|hundred|dozen|couple\s+of|pair\s+of)\b|\b(?:half|single|quarter|double|ek|do|teen|char|aadha)\s+(?:(?!with\b|and\b)[a-z]+\s+)?(?:samosas?|plates?|bowls?|cups?|glass(?:es)?|katoris?|pieces?|slices?|servings?|portions?|spoons?|ladles?|rotis?|phulkas?|chapatis?|idlis?|dosas?|eggs?|parathas?|puris?|naans?)\b/i;
const COUNTEDW = ['South Indian egg podimas with two whole eggs', 'Egg bhurji made with three whole eggs and onions', 'Two phulkas', 'One bowl dal', 'Half plate rice', 'Two Tandoori Roti', 'Moong dal with two phulkas',
  'Three kozhukattais', 'Four pathiris with stew', 'Buttermilk one glass', 'Single phulka', 'Pair of idlis', 'A couple of chapatis', 'Half a dozen momos', 'Quarter plate biryani', 'Ek katori dal', 'Do roti with sabzi',
  'Rajma chawal, half plate', 'Eleven pani puri', 'Seven-cup burfi',
  // Critic round 38, finding 1: a count word before a food or measure word, Hindi included
  'Two phulka', 'Teen phulka', 'Do roti', 'Two rotis with dal', 'Half plate biryani', 'Do aloo paratha', 'Char samosa', 'Aadha plate chawal', 'Charred paneer tikka with two phulka',
  // a count before a singular noun no list holds (the advisor's probes, 16 Nov)
  'Curd with one banana', 'One apple', 'Two parotta', 'Three idiyappam', 'Four dhokla', 'Two akki rotti', 'One small bowl curd', 'Six pesarattu',
  // a count or a portion in a short bracket, and numbers above twelve (safety audit M2)
  'Dal (one bowl)', 'Rice (half plate)', 'Egg curry (two eggs)', 'Idli (three pieces)', 'Phulka (two nos)', 'Boiled eggs (two whole)', 'Moong chilla (two)', 'Kozhukattai (four)', 'Fifteen almonds', 'Twenty peanuts', 'Twenty five almonds', 'Thirteen pathiris',
  // Critic round 39, finding 4: Hindi six to ten, Hindi plurals, and a measure with no number
  'Chhe roti', 'Saat idli', 'Aath puri', 'Das idli', 'Do rotiyan', 'Teen rotiya', 'Glass of buttermilk', 'Bowl of dal', 'Cup of curd', 'Plate of poha', 'Handful of almonds', 'A bowl of dal', 'Curd rice with a glass of buttermilk',
  // safety audit of ba4d8dc, M1, and Critic round 40, findings 3 and 5: Hindi plurals, piece words, measures and number spellings the engine
  // did not list, the joining word "ki", a lone Hindi number in a bracket, katori in its plurals, weights in words, a measure with no number
  'Do parathe', 'Teen parathe', 'Do samose', 'Do pakode', 'Do bhature', 'Chole with do bhature', 'Do kulche', 'Do vade', 'Teen dose', 'Do idliyan', 'Do kachoriyan', 'Teen pakodi', 'Paanch golgappe', 'Do anday',
  'Do luchi', 'Char luchis', 'Teen litti', 'Do bati', 'Do baati', 'Ek chammach ghee', 'Do chammach ghee', 'Ek mutthi chana', 'Do karchhi dal', 'Ek vati varan', 'Ek kap chai', 'Do makki ki roti', 'Do bajre ki roti',
  'Dus roti', 'Gyarah idli', 'Barah puri', 'Idli (Do)', 'Katoriyan dal', 'Do katoriyan dal', 'Dal (do katoriyan)', 'Katoree dal', 'One kg biryani', 'Chicken Biryani Half Kg', 'Hyderabadi Biryani Quarter Kg',
  'Sweet Lassi Half Litre', 'Chicken Biryani Ek Kilo', 'Mutton Biryani (Half Kg)', 'Glass buttermilk', 'Bowl dal', 'Hundred grams paneer'];
// The test's own detector, beside COUNTWORDS (safety audit of ba4d8dc, M1: COUNTWORDS knew only the engine's own nouns, so it could not fail on a
// word the engine does not list). Any Hindi number word before any word is a count, but for the honest names listed here; a Hindi measure
// word or katori in any form, a weight word, or a measure word that opens a name is a household unit. Its lists are this test's, not the engine's.
const HINDICOUNT = /\b(?:ek|do|teen|char|chaar|panch|paanch|chhe|saat|aath|nau|das|dus|gyarah|barah|aadha|adha|dedh|dhai)[\s-]+(?!(?:pyaza|phoron|siu|ka|ki|ke)\b)[a-z]+/i;
const HINDIMEAS = /\b(?:katori\w*|katoree\w*|chammach\w*|chamach\w*|mutthi\w*|karchhi\w*|vati|kg|kgs|kilo|kilos|litre|liter|ltr|grams?)\b|^(?:glass|bowl|katori|plate|tumbler|cup|mug|handful)s?\s+(?!(?:cakes?|noodles)\b)[a-z]/i;
const countShown = (x) => COUNTWORDS.test(x) || HINDICOUNT.test(x) || HINDIMEAS.test(x);
for (const [kind, mk, base] of WALKS) { if (kind === 'log') continue; const pl0 = mk({}); if (!pl0.check) continue;
  for (const pth of strPaths(pl0.schema).filter(x => NAMEF.test(x) && !/\.with$/.test(x))) for (const v of COUNTEDW) {
    const r = base(); setAt(r, pth, v); const pl = mk({ diet: 'nonveg' }, v.replace(/\s*\(.*\)/, '')); const out = safe(() => pl.check(r), {});
    const bad = allStr(out).filter(countShown);
    add('S8 no count written as a word in a shown name', !bad.length, `${kind}: "${v}" in ${pth} showed ${JSON.stringify(bad.slice(0, 2))}`); } }
// the menu side: a word count is never shown either (a side must be "<digits> <name>", or it is taken off the order)
for (const v of ['Two Tandoori Roti', 'One plate jeera rice', 'Half plate rice']) { const mo = menuOffered({}, 'Dal Fry', ['plain'], v, ['grain', 'wheat']);
  add('S8 no count written as a word in a menu side', (mo.orders || []).every(o => !COUNTWORDS.test(o.with || '')), `menu side "${v}" showed ${JSON.stringify((mo.orders || []).map(o => o.with))}`); }
// the declared grain is shown too (reason line, change note): a count in it goes, on a diabetic plate whose grain is counted in words
for (const [gname, gshown] of [['Two jowar rotis', 'Jowar rotis'], ['Jowar roti (two pieces)', 'Jowar roti']]) { const m = platePlain(); m.items[1] = { food: gname, grams: 90, group: 'carbs', contains: ['grain'] }; m.grain = { food: gname, made_of: 'jowar', grams: 90 };
  m.alchemy = { glucose: { titleSuffix: '+ salad', note: 'More salad.', add_item: 'Cucumber salad', add_grams: 80, minutes: 20, grain_grams_after: 60, contains: ['plain'], deltaKcal: -40, deltaProtein: 0, deltaCarbs: -10, deltaFats: 0, deltaFiber: 2 } };
  const r = safe(() => plan('meals', { profile: Object.assign({}, BASE, { health: 'diabetes', meds: 'no', diet: 'veg' }), ctx: { meal: 'lunch', lite: false } }).check(mealsReply(m)), {}), c = (r.meals || [])[0];
  add('S8 a counted grain is shown cleaned, not dropped', !!c && c.grain.food === gshown, `the plate with "${gname}" as its grain: ${c ? JSON.stringify(c.grain) : 'dropped'}`);
  add('S8 no count written as a word in the grain, reason line or change note', !!c && !allStr(c).some(x => COUNTWORDS.test(x)), `shown: ${JSON.stringify(allStr(c || {}).filter(x => COUNTWORDS.test(x)))}`); }
// cleaned, not dropped: an honest name with brackets, a comma tail or a count is offered, shown without them
for (const [raw, shown] of [['Whole wheat phulka (2 rotis)', 'Whole wheat phulka'], ['Flattened rice, softened', 'Flattened rice'], ['Steamed rice 150 g', 'Steamed rice'], ['Cucumber, tomato and onion salad', 'Cucumber, tomato and onion salad'],
  // word counts go and the food stays (final audit M2); honest names with a number-like word keep it: a dish, a spice mix, a cooking style
  ['South Indian egg podimas with two whole eggs', 'South Indian egg podimas with whole eggs'], ['Two phulkas', 'Phulkas'], ['One bowl dal', 'Dal'], ['Half plate rice', 'Rice'], ['Three kozhukattais', 'Kozhukattais'],
  ['Paneer do pyaza', 'Paneer do pyaza'], ['Panch phoron dal', 'Panch phoron dal'], ['Paneer tikka', 'Paneer tikka'], ['Egg half fry', 'Egg half fry'], ['Double ka meetha', 'Double ka meetha'], ['Teen dal tadka', 'Teen dal tadka'],
  ['Navratan korma', 'Navratan korma'], ['Half boiled egg', 'Half boiled egg'], ['Single origin coffee', 'Single origin coffee'],
  // the coordinator's controls (16 Nov): dish names with number-like words stay as written
  ['Steamed tender green beans', 'Steamed tender green beans'], ['Skinless chicken tenders', 'Skinless chicken tenders'], ['Tender soya chunks curry', 'Tender soya chunks curry'], ['Lone pepper chicken', 'Lone pepper chicken'],
  ['Two parotta', 'Parotta'], ['Four dhokla', 'Dhokla'], ['Curd with one banana', 'Curd with banana'], ['Two akki rotti', 'Akki rotti'], ['Four cheese pizza', 'Four cheese pizza'],
  ['Half-fry egg', 'Half-fry egg'], ['Three bean salad', 'Three bean salad'], ['Five spice tofu', 'Five spice tofu'], ['Panchmel dal', 'Panchmel dal'], ['Do pyaza', 'Do pyaza'], ['Panch phoron', 'Panch phoron'], ['One-pot khichdi', 'One-pot khichdi'],
  // Critic round 38: what follows the number word decides. A count before a food or measure word goes; a dish name stays
  ['Two phulka', 'Phulka'], ['Teen phulka', 'Phulka'], ['Do roti', 'Roti'], ['Do aloo paratha', 'Aloo paratha'], ['Half plate biryani', 'Biryani'],
  ['Paneer do pyaza with roti', 'Paneer do pyaza with roti'], ['Char siu tofu', 'Char siu tofu'], ['Teen phoron sabzi', 'Teen phoron sabzi'],
  // safety audit M2: a bracket with a count or a portion comes off, a bracket that says what the food is stays; numbers above twelve
  ['Dal (one bowl)', 'Dal'], ['Rice (half plate)', 'Rice'], ['Egg curry (two eggs)', 'Egg curry'], ['Idli (three pieces)', 'Idli'], ['Moong chilla (two)', 'Moong chilla'], ['Idli (2 pcs)', 'Idli'], ['Rajma (one katori)', 'Rajma'],
  ['Fried rice (veg)', 'Fried rice (veg)'], ['Whole wheat phulka (no ghee)', 'Whole wheat phulka (no ghee)'], ['Biryani (egg)', 'Biryani (egg)'], ['Fifteen almonds', 'Almonds'], ['Twenty five almonds', 'Almonds'], ['Chicken sixty five', 'Chicken sixty five'], ['Thousand island salad', 'Thousand island salad'], ['Sixteen bean soup', 'Sixteen bean soup'],
  // Critic round 39, finding 4: the count or measure goes, the food stays; a dish named with a measure word keeps its name
  ['Saat idli', 'Idli'], ['Do rotiyan', 'Rotiyan'], ['Glass of buttermilk', 'Buttermilk'], ['A bowl of dal', 'Dal'], ['Cup cake', 'Cup cake'], ['Buddha bowl', 'Buddha bowl'], ['Poke bowl', 'Poke bowl'], ['Das ka dosa', 'Das ka dosa'],
  // safety audit of ba4d8dc, M1; Critic round 40, findings 3 and 5: the count or measure goes, the food stays; honest names keep their words
  ['Do parathe', 'Parathe'], ['Do makki ki roti', 'Makki ki roti'], ['Teen litti', 'Litti'], ['Ek chammach ghee', 'Ghee'], ['Glass buttermilk', 'Buttermilk'], ['Bowl dal', 'Dal'], ['Hundred grams paneer', 'Paneer'], ['Idli (Do)', 'Idli'],
  ['Chicken Biryani Half Kg', 'Chicken Biryani'], ['Mutton Biryani (Half Kg)', 'Mutton Biryani'], ['Katoriyan dal', 'Dal'],
  // safety audit of ba4d8dc, c2: no stub is left by a count word ("Or rotis", "Minute poha" before)
  ['Two or three rotis', 'Rotis'], ['Ten-minute poha', 'Ten-minute poha'], ['Two-minute noodles', 'Two-minute noodles'], ['Seven Up', 'Seven Up'], ['Combo for Two', 'Combo'], ['Spinach folded in', 'Spinach folded in'],
  ['Mug cake', 'Mug cake'], ['Glass noodles', 'Glass noodles'], ['Moong (green gram)', 'Moong (green gram)'], ['Dal bati churma', 'Dal bati churma'], ['Litti chokha', 'Litti chokha'], ['Kadhi pakode', 'Kadhi pakode'], ['Teen dal tadka', 'Teen dal tadka']]) {
  const m = platePlain(); m.items[2] = { food: raw, grams: 100, group: 'greens', contains: ['plain'] }; const r = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(m)), {});
  const it = (((r.meals || [])[0] || {}).items || []).map(i => i.food);
  add('S8 names are cleaned, not dropped', it.includes(shown), `"${raw}" showed ${JSON.stringify(it)}, not "${shown}"`); }
{ const mo = menuOffered({}, 'Two Tandoori Roti', ['wheat', 'grain']);
  add('S8 names are cleaned, not dropped', (mo.orders || []).some(o => o.name === 'Tandoori Roti'), `menu dish "Two Tandoori Roti" showed ${JSON.stringify((mo.orders || []).map(o => o.name))} (${JSON.stringify(mo.dropped)})`); }
// Critic round 38, finding 2: on a menu a number that is part of the dish's name stays (the client reads it to the waiter); a count or a price goes.
// The owner's rule (16 Nov, option survey: "Remove counts, keep names (Recommended)"): a number goes only when a count, measure or food word
// follows it. "Two Tandoori Roti" shows "Tandoori Roti"; "Chicken 65" and "Gobi 65" stay as printed; "7 Cup Barfi" loses "7 Cup" (the accepted cost).
// the owner's keep-list (16 Nov, option survey: "Short keep-list (Recommended)"), the test's own copy: a number shown in a menu name sits inside one
const KEPTNUM = /\b(?:chicken|gobi|gobhi|paneer|mushroom|fish|prawns?|mutton|baby\s+corn)\s+65\b|\b7[\s-]*up\b/gi;
{ const menuName = (o, typed, dishes, leave) => safe(() => plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: typed } }).check({ status: 'ok', refer_reason: 'none',
    dishes: dishes.map(([n, t]) => ({ as_written: n, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, request: 'none', contains: t, contains_listed: t, with_contains: ['plain'], planned_around: [] })),
    leave: (leave || []).map(([n, t]) => ({ as_written: n, reason: 'fried', contains: t })) }), {});
  const NV = { diet: 'nonveg' }, typed = 'STARTERS\nChicken 65 240\nGobi 65 180\nChicken 65 Biryani 320\n7 Cup Barfi 90\nDal Makhani 280\nPaneer Tikka - 6 pcs 260\nTwo Tandoori Roti 60\n';
  for (const [aw, tags, want, why] of [['Chicken 65', ['meat'], 'Chicken 65', 'part of the name'], ['Gobi 65', ['onion_garlic'], 'Gobi 65', 'part of the name'], ['Chicken 65 Biryani', ['meat', 'grain'], 'Chicken 65 Biryani', 'a keep-list name number stays wherever it stands (owner, 16 Nov, "Short keep-list (Recommended)"; this expectation changed back from "Chicken Biryani", the rule by position)'],
      ['Chicken 65 240', ['meat'], 'Chicken 65', 'the price after a name number'], ['7 Cup Barfi', ['sweet', 'dairy'], 'Barfi', 'a number before a measure word: "7 Cup" goes, the accepted cost (owner, 16 Nov)'], ['Dal Makhani 280', ['dairy'], 'Dal Makhani', 'a price'],
      ['Paneer Tikka 6 pcs', ['dairy'], 'Paneer Tikka', 'a count'], ['Two Tandoori Roti', ['wheat', 'grain'], 'Tandoori Roti', 'a count in words']]) {
    const r = menuName(NV, typed, [[aw, tags]]);
    add('S8 menu names: a number in the name stays, a count or price goes', (r.orders || []).length === 1 && r.orders[0].name === want, `"${aw}" (${why}) showed ${JSON.stringify((r.orders || []).map(o => o.name))}, not "${want}" (${JSON.stringify(r.dropped)})`); }
  const r = menuName(NV, typed, [['Gobi 65', ['onion_garlic']]], [['Chicken 65', ['meat']]]);
  add('S8 menu names: a number in the name stays in a leave entry', (r.leave || []).some(l => l.name === 'Chicken 65'), `leave: ${JSON.stringify(r.leave)}`);
  // a typed menu with no prices: a number at the end is the name's; with no typed menu (a photo), a short number stays and a price goes
  const r4 = menuName(NV, 'Chicken 65\nGobi 65\nDal Fry', [['Chicken 65', ['meat']]]);
  add('S8 menu names: no prices on the menu, the number stays', (r4.orders || []).some(o => o.name === 'Chicken 65'), JSON.stringify(r4.orders || r4.dropped));
  // with no typed menu (a photo) a lone number at the end cannot be told from a price and goes; after another number it is the price
  add('S8 menu names, photo: a price goes, a name number before it stays', showName('Plain Dosa 70', { price: 1 }) === 'Plain Dosa' && showName('Dal Makhani 280', { price: 1 }) === 'Dal Makhani' && showName('Chicken 65 240', { price: 1 }) === 'Chicken 65', JSON.stringify([showName('Plain Dosa 70', { price: 1 }), showName('Dal Makhani 280', { price: 1 }), showName('Chicken 65 240', { price: 1 })]));
  // a plate name still shows no number at all (the prompt asks for none)
  const pr = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(withItem('Chicken 65', ['meat']))), {});
  add('S8 plate names show no number', !allStr(pr.meals || []).some(x => /\d/.test(x) && /chicken/i.test(x)), 'a plate item showed a number: ' + JSON.stringify(allStr(pr.meals || []).filter(x => /chicken/i.test(x))));
  // safety audit M1: the owner's rule applied by position, with no list of foods. On a typed menu, as an order and as a leave entry, a
  // number with a word after it never shows; only a number at the end of the name may stay. Nouns no list holds ("Blorp", "Fizzle",
  // "Kothu", "Salna") must behave like the rest, so a rule that knows only listed words cannot pass.
  const M1 = [['Egg Curry 2 Eggs', 'Egg Curry Eggs'], ['Egg Bhurji 3 Eggs', 'Egg Bhurji Eggs'], ['Omelette 3 Egg', 'Omelette Egg'], ['Veg Thali 3 Roti Dal Rice', 'Veg Thali Roti Dal Rice'],
    ['Mini Meals 4 Roti Rice Dal', 'Mini Meals Roti Rice Dal'], ['North Indian Thali - 4 Roti, Dal, Rice', 'North Indian Thali Roti'], ['2 Idli 1 Vada', 'Idli Vada'], ['Idli 2 Vada 1 Combo', 'Idli Vada Combo'],
    ['Breakfast Combo Idli 2 Vada 1 Coffee', 'Breakfast Combo Idli Vada Coffee'], ['Poori Sagu 3 Poori', 'Poori Sagu'], ['Chole Bhature 2 Bhature', 'Chole Bhature'], ['Paneer Butter Masala with 2 Butter Naan', 'Paneer Butter Masala with Butter Naan'], ['Mutton Biryani 1 Kg', 'Mutton Biryani'], ['Buttermilk 1 Ltr', 'Buttermilk'],
    ['Biryani 1 Handi', 'Biryani'], ['Veg Thali 2 Person', 'Veg Thali'], ['Family Pack Biryani 4 Persons', 'Family Pack Biryani'], ['2 Chole Bhature', 'Chole Bhature'], ['Appam 2 Stew', 'Appam Stew'],
    ['Parotta 2 Salna', 'Parotta Salna'], ['Kothu 3 Blorp Fizzle', 'Kothu Blorp Fizzle'], ['Blorp 3 Fizzle', 'Blorp Fizzle'],
    // the owner's short keep-list (16 Nov): these expectations changed from "Chicken Dosa", "Gobi Kebab", "Tandoori Roti 2" and "Boiled Eggs 2"
    ['Chicken 65 Dosa', 'Chicken 65 Dosa'], ['Gobi 65 Kebab', 'Gobi 65 Kebab'],
    // the owner's own examples, a price after a name number, and numbers at the end of a name, which stay by position (the owner may be asked)
    ['Two Tandoori Roti', 'Tandoori Roti'], ['7 Cup Barfi', 'Barfi'], ['Chicken 65', 'Chicken 65'], ['Gobi 65', 'Gobi 65'], ['Tandoori Roti 2', 'Tandoori Roti'], ['Boiled Eggs 2', 'Boiled Eggs'], ['7 Up', '7 Up']];
  const typedM1 = M1.map(([n], i) => n + ' ' + (120 + 10 * i)).join('\n') + '\nChicken 65 Biryani 320\nDal Fry 200\n';
  for (const [aw, want] of M1) { const r = menuName(NV, typedM1, [[aw, ['plain']]]), r2 = menuName(NV, typedM1, [['Dal Fry', ['plain']]], [[aw, ['plain']]]), o = (r.orders || [])[0], l = (r2.leave || [])[0];
    add('S8 menu names: the owner\'s rule by position (order)', !!o && o.name === want, `"${aw}" showed ${JSON.stringify((r.orders || []).map(x => x.name))}, not "${want}" (${JSON.stringify(r.dropped)})`);
    add('S8 menu names: the owner\'s rule by position (leave entry)', !!l && l.name === want, `"${aw}" as a leave entry showed ${JSON.stringify(r2.leave)}, not "${want}"`);
    for (const x of [o && o.name, l && l.name].filter(Boolean)) add('S8 menu names: every number shown is a keep-list name number', !/\d/.test(x.replace(KEPTNUM, '')), `"${aw}" showed "${x}"`); }
  // Critic round 39, finding 3: a name number stays on the menu shapes typed in India: "Rs", "Rs." and "INR" prices, Half and Full prices,
  // the rupee sign, a dash, a tab, and an unpriced list; a price still goes ("Tea 15" on a priced menu shows "Tea")
  for (const [k, t] of [['Rs', 'Chicken 65 - Rs 240\nGobi 65 - Rs 180\nDal Tadka - Rs 200'], ['Rs.', 'Chicken 65 Rs. 240\nGobi 65 Rs. 180\nDal Tadka Rs. 200'], ['INR', 'Chicken 65 INR 240\nGobi 65 INR 180\nDal Tadka INR 200'],
      ['Half and Full', 'Chicken 65 (Half) 180 (Full) 320\nGobi 65 (Half) 120 (Full) 220\nDal Tadka 200'], ['unpriced', 'Chicken 65\nGobi 65\nDal Tadka\nTandoori Roti'], ['unpriced, three lines', 'Chicken 65\nGobi 65\nDal Tadka'],
      ['rupee sign', 'Chicken 65 \u20B9 240\nGobi 65 \u20B9180\nDal Tadka \u20B9 200'], ['dash', 'Chicken 65 - 240\nGobi 65 - 180\nDal Tadka - 200'], ['tab', 'Chicken 65\t240\nGobi 65\t180\nDal Tadka\t200']])
    for (const aw of ['Chicken 65', 'Gobi 65', t.split('\n')[0]]) { const r = menuName(NV, t, [[aw, ['plain']]]), want = aw === t.split('\n')[0] ? 'Chicken 65' : aw;   // as_written may copy the whole line, price and all
      add('S8 menu names: a name number stays on every typed menu shape', (r.orders || []).some(o => o.name === want), `${k} menu: "${aw}" showed ${JSON.stringify((r.orders || []).map(o => o.name))} (${JSON.stringify(r.dropped)})`); }
  for (const [t, aw, want] of [['Tea 15\nCoffee 20\nSamosa 15', 'Tea 15', 'Tea'], ['Dal Makhani 280\nPaneer Tikka 260', 'Dal Makhani 280', 'Dal Makhani'], ['Plate of 3 idli 40\nCup of tea 20', 'Plate of 3 idli', 'Idli'], ['Idli 40\nVada 40\nDosa 40', 'Idli 40', 'Idli'], ['Masala Dosa 90', 'Masala Dosa 90', 'Masala Dosa']]) { const r = menuName(NV, t, [[aw, ['plain']]]);
    add('S8 menu names: a price or a count still goes', (r.orders || []).some(o => o.name === want), `"${aw}" showed ${JSON.stringify((r.orders || []).map(o => o.name))}, not "${want}"`); }
  // a name that is only a number never shows (MENUSHAPE; safety audit m5, mutation N7)
  for (const aw of ['65', '2 3']) { const r = menuName(NV, aw + ' 180\nDal Fry 200\n', [[aw, ['plain']]]);
    add('S8 menu names: a name that is only a number is not shown', !(r.orders || []).length && showName(aw, { price: 1 }) === '' && showName(aw + ' 180', { price: aw + ' 180' }) === '', `"${aw}": ${JSON.stringify(r.orders || [])} / "${showName(aw, { price: 1 })}"`); }
  // the owner's short keep-list (16 Nov): "Keep a number only if it is a known name number ("65", "7 Up", and the few others in recorded menus);
  // remove every other number. A miss costs a dish its number, never shows a price." Typed (as orders, sides and leave entries, the dish copied
  // with its price, as the model does) and as a photo. Critic round 40, finding 1: a heading or a description line, with one price for every
  // dish; finding 4: "65" lines on an unpriced or part-priced menu, and a one-line menu. A price of 65 is never kept ("Sweet Lassi 65").
  const D3 = [['THALI\nVeg Thali 120\nPaneer Thali 120', 'Veg Thali 120', 'Veg Thali'], ['LUNCH\nVeg Thali 120', 'Veg Thali 120', 'Veg Thali'], ['JUICES\nOrange 60\nMosambi 60\nPineapple 60', 'Mosambi 60', 'Mosambi'],
    ['MEALS:\nVeg Meals 80\nCurd Rice 80\nSambar Rice 80', 'Curd Rice 80', 'Curd Rice'], ["Today's special\nRajma Chawal 90\nKadhi Chawal 90", 'Rajma Chawal 90', 'Rajma Chawal'],
    ['Veg Thali 120\nServed with 2 roti, rice, dal, sabzi', 'Veg Thali 120', 'Veg Thali'], ['Chicken 65\nGobi 65', 'Gobi 65', 'Gobi 65'], ['Chicken 65\nGobi 65\nDal Tadka 160\nRoti 30', 'Chicken 65', 'Chicken 65'],
    ['Chicken 65', 'Chicken 65', 'Chicken 65'], ['Tandoori Roti 2\nDal Fry 200', 'Tandoori Roti 2', 'Tandoori Roti'], ['DRINKS\n7 Up 40\nTea 15', '7 Up 40', '7 Up'],
    ['DRINKS\nSweet Lassi 65\nTea 65', 'Sweet Lassi 65', 'Sweet Lassi'], ['MAINS\nMix Veg 65\nBoiled Egg 65', 'Mix Veg 65', 'Mix Veg'], ['MAINS\nMix Veg 65\nBoiled Egg 65', 'Boiled Egg 65', 'Boiled Egg'],
    ['STARTERS\nChicken 555 260\nPaneer 65 220', 'Chicken 555 260', 'Chicken'], ['STARTERS\nChicken 555 260\nPaneer 65 220', 'Paneer 65 220', 'Paneer 65'], ['TIFFIN\n3 in 1 Dosa 90\n5 Star Thali 250', '5 Star Thali 250', 'Star Thali']];
  for (const [typed, aw, want] of D3) { const r = menuName(NV, typed, [[aw, ['plain']]]), r2 = menuName(NV, typed + '\nDal Fry 200', [['Dal Fry', ['plain']]], [[aw, ['plain']]]);
    const r3 = safe(() => plan('menu', { profile: Object.assign({}, BASE, NV), ctx: { meal: 'lunch', text: '' }, image: 'AAAA' }).check({ status: 'ok', refer_reason: 'none', dishes: [{ as_written: aw, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, request: 'none', contains: ['plain'], contains_listed: ['plain'], with_contains: ['plain'], planned_around: [] }], leave: [] }), {});
    const got = [(r.orders || [])[0], (r2.leave || [])[0], (r3.orders || [])[0]].map(x => x ? x.name : '(none)');
    add('S8 menu names: the short keep-list (orders, leave entries, photo)', got.every(x => x === want), `menu ${JSON.stringify(typed)}: "${aw}" showed ${JSON.stringify(got)}, not "${want}"`); }
  // every number shown in a menu name, side or leave entry is inside a keep-list name, whatever the shape
  for (const [typed, aw] of D3) for (const side of ['2 Tandoori Roti 30', '1 Plain Rice 120']) { const pl = plan('menu', { profile: Object.assign({}, BASE, NV), ctx: { meal: 'lunch', text: typed + '\nTandoori Roti 30\nPlain Rice 120' } });
    const r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', dishes: [{ as_written: aw, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: side, with_kcal: 120, with_protein: 3, with_carbs: 22, with_fats: 2, with_fiber: 1, request: 'none', contains: ['plain'], contains_listed: ['plain'], with_contains: ['grain', 'wheat'], planned_around: [] }], leave: [{ as_written: aw, reason: 'rich', contains: ['plain'] }] }), {});
    for (const x of (r.orders || []).map(o => o.name).concat((r.orders || []).map(o => (o.with || '').replace(/^\d+\s+/, '').replace(/,.*$/, '')), (r.leave || []).map(l => l.name)))
      add('S8 menu names: every number shown is a keep-list name number', !/\d/.test(x.replace(KEPTNUM, '')), `menu ${JSON.stringify(typed)} with "${aw}" showed "${x}"`); } }
// every check still reads the raw name, brackets included: the canteen thali with papad and pickle is dropped for high blood pressure
for (const o of [{ health: 'bp' }, { health: 'diabetes', bp: true }]) {
  add('S3 brackets are read', !plateOffered(o, withItem('Veg thali (dal, sabzi, papad, pickle)', ['grain'])).ok, `${JSON.stringify(o)}: plate "Veg thali (dal, sabzi, papad, pickle)" was offered`);
  add('S3 brackets are read', !(menuOffered(o, 'Veg Thali (dal, sabzi, papad, pickle)', ['grain']).orders || []).length, `${JSON.stringify(o)}: menu "Veg Thali (dal, sabzi, papad, pickle)" was offered`); }
// singular forms of listed plurals (final audit): a wrong "plain" tag on a singular name is still caught by the word net
for (const [name, o] of [['Veg hakka noodle', { leave: ['wheat'] }], ['Banana chip', { health: 'bp' }], ['Potato wafer', { health: 'bp' }], ['Masala chip', { health: 'diabetes', bp: true }]])
  add('S1-S3 singular forms are read', !plateOffered(o, withItem(name, PT.length ? PT : ['grain'])).ok && !(menuOffered(o, name, PT.length ? PT : ['grain']).orders || []).length, `${JSON.stringify(o)}: "${name}" tagged plain was offered`);
add('S1 no false hit: rice noodle', plateOffered({ leave: ['wheat'] }, withItem('Rice noodle stir fry', ['grain'])).ok, 'wheat-free: "Rice noodle stir fry" was dropped');
add('S2 brackets are read', !plateOffered({ diet: 'veg' }, withItem('Veg thali (with chicken curry)', ['grain'])).ok, 'vegetarian: "Veg thali (with chicken curry)" was offered');
add('S9 brackets are read', !plateOffered({}, withItem('Oats porridge (with protein powder)', ['grain'])).ok, '"Oats porridge (with protein powder)" was offered');

// ---------- the reason line (usefulness brief): engine-written, true to the figures, and on diabetes or medicines never "lighter", "less" or "skip" ----------
{ const HK = [['lighter_now', 'lighter after earlier meals'], ['skipped_breakfast', 'skipped breakfast'], ['repeat_rajma', 'less rajma this week'], ['late_now', 'a late dinner'], ['late_dinner', 'dinners run late'],
    ['easy_lunch', 'an easy lunch'], ['goal_lose', 'gentle weight loss'], ['protein_gap', 'protein to catch up'], ['ate_out', 'after eating out'], ['diabetes_grain', 'the grain stays (diabetes)']].map(([id, tag]) => ({ id, tag }));
  const has = typeof reasonLine === 'function';
  add('reason line exists', has, 'no engine-written reason line on this page');
  for (const o of [{ health: 'diabetes', meds: 'no' }, { health: 'diabetes', meds: 'yes' }, { health: 'diabetes', meds: 'unsure' }]) { const pp = prof(o); pp.medsUsual = medsUsual(pp, 'lunch');
    const pl = planDay(pp, readFile({}), 'lunch', 5); const m = Object.assign({}, platePlain(), { grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 } });
    for (let k = 1; k <= HK.length; k++) { const line = has ? reasonLine(m, HK.slice(0, k), pl, pp, 'lunch') : '';
      add('reason line: no lighter, less or skip on diabetes or medicines', !/\b(?:lighter|light|less|lower|smaller|skip\w*|cut|reduce\w*|drop)\b/i.test(line), `${JSON.stringify(o)}: "${line}"`);
      add('reason line: true to the figures', !has || line.includes(m.kcal + ' kcal') && line.includes('90 g'), `${JSON.stringify(o)}: "${line}" does not carry the plate's figures or its grain`); } }
  // c1 (final audit): the app's "Planned around" lines use the engine's hookSaid, the rule the reason line uses; with diabetes or on medicines
  // no "lighter", "skip", "late" or "less" hook is said, and the others are
  const hs = typeof hookSaid === 'function', appSrc = fs.readFileSync(process.env.NP_APP || path.join(__dirname, '../../src/v6/app.js'), 'utf8');
  add('c1 one rule for the reason line and Planned around', hs && (appSrc.match(/Planned around: /g) || []).length === (appSrc.match(/=hooksSaid\(|=noHooks\?\[\]:hooksSaid\(/g) || []).length, hs ? 'a "Planned around" line in app.js does not go through hooksSaid' : 'no hookSaid on this page');
  for (const o of [{ health: 'diabetes', meds: 'no' }, { health: 'diabetes', meds: 'yes' }, { health: 'none' }]) { const pp = prof(o); pp.medsUsual = medsUsual(pp, 'lunch'); const pl = planDay(pp, readFile({}), 'lunch', 5);
    for (const h of HK) { if (/^(diabetes_grain|steady_carbs)$/.test(h.id)) continue; const said = hs && hookSaid(h.id, pp), line1 = reasonLine(platePlain(), [h], pl, pp, 'lunch'), inLine = line1.includes(h.tag) || h.id === 'protein_gap' && line1.includes('catch up on protein');
      add('c1 Planned around says what the reason line says', hs && said === inLine && (o.health === 'none' || !said || !/lighter|skip|late|less/.test(h.tag)), `${JSON.stringify(o)} ${h.id}: hookSaid ${said}, in the reason line ${inLine}`); } }
  // Critic round 38, finding 7: the subtitle joins its items with one "and" ("..., buckwheat soba, bok choy and edamame")
  { const sub = safe(() => engineSub([{ food: 'Miso glazed tofu' }, { food: 'Buckwheat soba' }, { food: 'Bok choy and edamame' }]), '');
    add('subtitle: no "and ... and"', sub === 'Miso glazed tofu, buckwheat soba, bok choy and edamame' && engineSub([{ food: 'Dal' }, { food: 'Rice' }, { food: 'Salad' }]) === 'Dal, rice and salad', sub); }
  // Critic round 38, finding 8: protein to catch up is said once, as a hook or as the sentence, never both
  for (const prot of [5, 60]) { const pp = prof({}), pl = planDay(pp, readFile({}), 'lunch', 5), line = reasonLine(Object.assign(platePlain(), { protein: prot }), HK.filter(h => h.id === 'protein_gap' || h.id === 'goal_lose'), pl, pp, 'lunch');
    add('reason line: catching up on protein is said once', (line.match(/catch up/g) || []).length === 1, `protein ${prot} g: "${line}"`); }
  // on a whole reply: every shown plate has a line, and it is the engine's, never the model's for_you
  const r = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(Object.assign(platePlain(), { for_you: 'Zqxjvoq says eat less rice.' }))), {});
  add('reason line on every shown plate', (r.meals || []).length > 0 && (r.meals || []).every(x => x.forYou && !/zqxjvoq|less rice/i.test(x.forYou)), `reason lines: ${JSON.stringify((r.meals || []).map(x => x.forYou))}`); }

// ---------- Rescue, the client's own dish (usefulness brief step 3): shown as typed; every move keeps S5 and S6 ----------
for (const [o, typed, d] of [[{ diet: 'veg' }, 'Chicken biryani', { kcal: 900, protein: 35, carbs: 110, fats: 34, fiber: 5, contains: ['grain', 'meat'] }],
  [{ health: 'diabetes', meds: 'no' }, 'Gulab jamun', { kcal: 600, protein: 8, carbs: 90, fats: 24, fiber: 1, contains: ['sweet', 'dairy'] }],
  [{ health: 'diabetes', meds: 'yes', cm: 0, kg: 0, age: 0 }, 'Gulab jamun', { kcal: 600, protein: 8, carbs: 90, fats: 24, fiber: 1, contains: ['sweet', 'dairy'] }],
  [{ health: 'diabetes', meds: 'unsure' }, 'Masala dosa with chutney', { kcal: 1200, protein: 25, carbs: 160, fats: 50, fiber: 8, contains: ['grain', 'root_veg'] }]]) {
  const r = rescueOut(o, typed, Object.assign({ name: typed }, d), []), pp = prof(o), u = medsUsual(pp, 'lunch');
  add('Rescue: the typed dish is helped as typed', r.status === 'ok' && r.dish.name === typed, `${JSON.stringify(o)}: "${typed}" was ${r.status} (${r.reason || ''})`);
  for (const h of r.hacks || []) {
    add('Rescue moves keep the grain (S5)', !(h.kind === 'portion' && o.health === 'diabetes') || d.carbs + (h.deltaCarbs || 0) >= d.carbs * 0.5, `${JSON.stringify(o)} "${typed}": "${h.title}" takes carbs to ${d.carbs + (h.deltaCarbs || 0)} of ${d.carbs}`);
    add('Rescue moves keep the usual size (S6)', !u || h.kind !== 'portion' || d.kcal + (h.deltaKcal || 0) >= u, `${JSON.stringify(o)} "${typed}": "${h.title}" takes the meal to ${d.kcal + (h.deltaKcal || 0)} kcal, under the usual ${u}`);
    add('Rescue moves name no barred food', !crosses(h.title, pp), `${JSON.stringify(o)} "${typed}": "${h.title}"`); } }
// S6 in the engine itself, not only at the app's tap (final audit m1: removing either floor passed every Node check). On insulin or sugar
// tablets: a Rescue portion move that would fit the target best but go under the usual size is not offered, and a swap that takes the
// plate under the usual size is not offered; controls show the same shapes offered when they stay at or above it.
for (const o of [{ health: 'diabetes', meds: 'yes', goal: 'lose' }, { health: 'diabetes', meds: 'unsure', goal: 'hold' }]) { const pp = prof(o), u = medsUsual(pp, 'lunch');
  // a dish a little under twice the usual size: "Eat about half" lands just under it, and is the move nearest the target
  const k = Math.round(u * 1.9 / 10) * 10, d = { name: 'Veg thali', kcal: k, protein: Math.round(k * 0.15 / 4), carbs: Math.round(k * 0.55 / 4), fats: Math.round(k * 0.30 / 9), fiber: 8, contains: ['grain'] };
  const r = rescueOut(o, 'Veg thali', d, []);
  add('S6 engine: no Rescue portion move under the usual size', r.status === 'ok' && (r.hacks || []).every(h => h.kind !== 'portion' || d.kcal + h.deltaKcal >= u), `${JSON.stringify(o)} usual ${u}: dish ${k} kcal, moves ${JSON.stringify((r.hacks || []).map(h => [h.title, h.deltaKcal]))}`);
  const r2 = rescueOut(o, 'Veg thali', Object.assign({}, d, { kcal: k * 2, protein: d.protein * 2, carbs: d.carbs * 2, fats: d.fats * 2 }), []);
  add('S6 engine: a portion move at or above the usual size is offered (control)', (r2.hacks || []).some(h => h.kind === 'portion'), `${JSON.stringify(o)}: dish ${k * 2} kcal, moves ${JSON.stringify((r2.hacks || []).map(h => h.title))}`);
  // a plate 30 kcal over the usual size: a swap of -100 kcal takes it under and is not offered; a swap of -20 kcal is
  const m = platePlain(), pk = u + 30; Object.assign(m, { kcal: pk, protein: Math.round(pk * 0.2 / 4), carbs: Math.round(pk * 0.5 / 4), fats: Math.round(pk * 0.3 / 9) }); m.items.forEach(i => { i.grams = Math.round(i.grams * pk / 500); });
  m.grain.grams = m.items[1].grams;
  m.swaps = { protein: [{ food: 'Sprouted moong', grams: m.items[0].grams, contains: PT, ...z }, { food: 'Steamed moong', grams: 150, contains: PT, ...z, deltaKcal: -100, deltaProtein: -5, deltaCarbs: -10, deltaFats: -4 }, { food: 'Boiled chickpeas', grams: 150, contains: PT, ...z, deltaKcal: -20, deltaProtein: -1, deltaCarbs: -2, deltaFats: -1 }], base: [] };
  const pr = safe(() => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false } }).check(mealsReply(J(m))), {}), c = (pr.meals || [])[0];
  add('S6 engine: no swap under the usual size', !!c && !c.swaps.protein.some(s => s.food === 'Steamed moong'), `${JSON.stringify(o)} usual ${u}: plate ${pk} kcal, swaps ${c ? JSON.stringify(c.swaps.protein.map(s => [s.food, s.deltaKcal])) : 'plate dropped ' + JSON.stringify(pr.dropped)}`);
  add('S6 engine: a swap that stays at the usual size is offered (control)', !!c && c.swaps.protein.some(s => s.food === 'Boiled chickpeas'), `${JSON.stringify(o)}: ${c ? JSON.stringify(c.swaps.protein.map(s => s.food)) : 'plate dropped ' + JSON.stringify(pr.dropped)}`); }
add('Rescue: a supplement is not helped (S9)', rescueOut({}, 'Protein shake with whey protein', { name: 'Whey protein shake', contains: ['supplement'] }, []).status !== 'ok', 'a typed supplement was helped');

// ---------- A2 (Codex re-audit C): figures agree within 15 % on the plate as planned and on every combination of swaps and one-tap changes ----------
{ const retag = (x) => JSON.parse(JSON.stringify(x), (k, v) => Array.isArray(v) && v.length === 1 && v[0] === 'plain' ? PT : v);   // an older page has no "plain" tag
  const agree = (n) => Math.abs(4 * n.protein + 4 * n.carbs + 9 * n.fats - n.kcal) <= Math.max(0.15 * n.kcal, 25);   // the engine's one rule: 15 %, or 25 kcal for small figures
  const combos = (m) => { const P = m.swaps.protein.length ? m.swaps.protein : [null], B = m.swaps.base.length ? m.swaps.base : [null], K = Object.keys(m.alchemy || {}), out = [];
    for (let i = 0; i < P.length; i++) for (let j = 0; j < B.length; j++) for (let mask = 0; mask < (1 << K.length); mask++) { let n = { kcal: m.kcal, protein: m.protein, carbs: m.carbs, fats: m.fats };
      const ds = []; if (i > 0) ds.push(P[i]); if (j > 0) ds.push(B[j]); K.forEach((k, b) => { if (mask & (1 << b)) ds.push(m.alchemy[k]); });
      ds.forEach(d => { n = { kcal: n.kcal + d.deltaKcal, protein: n.protein + d.deltaProtein, carbs: n.carbs + d.deltaCarbs, fats: n.fats + d.deltaFats }; }); out.push(n); }
    return out; };
  // Codex: a 490 kcal base (474 by its macros) with a +120 kcal swap and two +65 kcal changes, all with zero macro deltas
  const m1 = platePlain(); Object.assign(m1, { kcal: 490, protein: 27, carbs: 60, fats: 14 });
  m1.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: ['plain'], ...z }, { food: 'Steamed moong', grams: 200, contains: ['plain'], ...z, deltaKcal: 120 }];
  for (const k of ['protein', 'gut']) m1.alchemy[k] = { titleSuffix: 'More vegetables', note: 'Add 50 g cucumber.', add_item: 'Cucumber', add_grams: 50, contains: ['plain'], grain_grams_after: 90, minutes: 20, ...z, deltaKcal: 65 };
  const r1 = safe(() => plan('meals', { profile: Object.assign({}, BASE, { diet: 'veg', goal: 'hold' }), ctx: { meal: 'lunch' } }).check(mealsReply(retag(m1))), {}), c1 = (r1.meals || [])[0];
  add('A2 every combination agrees (Codex 740 / 474)', !!c1 && combos(c1).every(agree), c1 ? 'a combination disagrees: ' + JSON.stringify(combos(c1).filter(n => !agree(n))) : 'the honest base plate was dropped');
  // Codex: on medicines, a 1000 kcal plate with a 0 kcal swap of -40 g P, -50 g C, -40 g F (280 kcal by its macros)
  const m2 = platePlain(); Object.assign(m2, { kcal: 1000, protein: 60, carbs: 100, fats: 40 }); m2.items.forEach(i => i.grams *= 2); m2.items[1].grams = 120; m2.grain.grams = 120;
  m2.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: ['plain'], ...z }, { food: 'Steamed moong', grams: 200, contains: ['plain'], ...z, deltaProtein: -40, deltaCarbs: -50, deltaFats: -40 }];
  const r2 = safe(() => plan('meals', { profile: Object.assign({}, BASE, { diet: 'veg', health: 'diabetes', meds: 'yes', goal: 'lose' }), ctx: { meal: 'lunch' } }).check(mealsReply(retag(m2))), {}), c2 = (r2.meals || [])[0];
  add('A2 every combination agrees (Codex 1000 / 280, medicines)', !!c2 && combos(c2).every(agree), c2 ? 'a combination disagrees: ' + JSON.stringify(combos(c2).filter(n => !agree(n))) : 'the honest base plate was dropped');
  // Codex: a Rescue dish of 1000 kcal with 10 g P, 10 g C and 0 g F (80 kcal by its macros)
  const r3 = rescueOut({}, 'Rice', { name: 'Rice', kcal: 1000, protein: 10, carbs: 10, fats: 0, fiber: 1, contains: ['grain'] }, [WALK]);
  add('A2 Rescue dish figures agree (Codex 1000 / 80)', r3.status !== 'ok', 'a Rescue dish of 1000 kcal with 80 kcal of macros was accepted');
  for (const o of [{}, { health: 'diabetes', meds: 'yes' }]) { const r = rescueOut(o, 'Veg thali', {}, []); if (r.status !== 'ok') continue; const K = r.hacks || [];
    for (let mask = 1; mask < (1 << K.length); mask++) { let n = Object.assign({}, r.dish); K.forEach((h, b) => { if (mask & (1 << b)) n = { kcal: n.kcal + h.deltaKcal, protein: n.protein + h.deltaProtein, carbs: n.carbs + h.deltaCarbs, fats: n.fats + h.deltaFats }; });
      add('A2 Rescue dish with every set of moves agrees', agree(n), `${JSON.stringify(o)}: ${JSON.stringify(n)}`); } }
  // every menu order the engine returns agrees as shown (with its side, no moves ticked), so the app's check never refuses an order it was offered
  for (const [kc, pr, cb, ft, sk, sp, sc, sf] of [[600, 20, 70, 32, 40, 1, 4, 3], [520, 24, 64, 18, 160, 4, 30, 3], [620, 26, 70, 24, 120, 3, 22, 2], [300, 10, 40, 14, 60, 2, 10, 1]]) {
    const mo = menuOffered({}, 'Dal Fry', ['grain'], '1 Tandoori Roti', ['grain'], { kcal: kc, protein: pr, carbs: cb, fats: ft, with_kcal: sk, with_protein: sp, with_carbs: sc, with_fats: sf });
    for (const o of mo.orders || []) add('A2 every menu order agrees as shown', agree(o.n), `${JSON.stringify(o.n)}`); }
  // positive control: an honest swap and change whose deltas match their macros stay on offer
  const m4 = platePlain(); m4.swaps.protein = [{ food: 'Sprouted moong', grams: 200, contains: ['plain'], ...z }, { food: 'Boiled chickpeas', grams: 180, contains: ['plain'], ...z, deltaKcal: 60, deltaProtein: 3, deltaCarbs: 9, deltaFats: 1 }];
  m4.alchemy.protein = { titleSuffix: '+ more moong', note: 'Add 50 g sprouted moong.', add_item: 'Sprouted moong', add_grams: 50, minutes: 20, grain_grams_after: 90, contains: ['plain'], deltaKcal: 50, deltaProtein: 6, deltaCarbs: 6, deltaFats: 0, deltaFiber: 2 };
  const r4 = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(retag(m4))), {}), c4 = (r4.meals || [])[0] || { swaps: { protein: [] }, alchemy: {} };
  add('A2 honest swaps and changes stay on offer', c4.swaps.protein.some(s => s.food === 'Boiled chickpeas') && !!c4.alchemy.protein, `offered: ${JSON.stringify(c4.swaps.protein.map(s => s.food))}, changes ${JSON.stringify(Object.keys(c4.alchemy))}`); }

// ---------- S10 (final audit M1): when the declared grain item is also the first protein item, a protein swap never lands on it ----------
// The plate: moong dal khichdi is the declared grain and the main protein. On the 6b5e18d build a protein swap and a grain swap both
// replaced that one item, so the figures carried both while the plate showed one. The engine now drops such protein swaps for every
// profile; the app refuses them too on a plate kept from an older build, and a grain change counts only while the planned grain is on the plate.
{ const KH = () => ({ title: 'Moong dal khichdi with cucumber', prepMinutes: 25,
    items: [{ food: 'Moong dal khichdi', grams: 300, group: 'protein', contains: ['grain'] }, { food: 'Cucumber salad', grams: 120, group: 'greens', contains: PT }, { food: 'Tomato slices', grams: 60, group: 'greens', contains: PT }],
    grain: { food: 'Moong dal khichdi', made_of: 'rice and moong dal', grams: 300 }, contains: ['grain'], kcal: 480, protein: 18, carbs: 78, fats: 10, fiber: 9, planned_around: [], taste: [] });
  const SW = () => ({ protein: [{ food: 'Moong dal khichdi', grams: 300, contains: ['grain'], ...z }, { food: 'Sprouted moong chilla', grams: 150, contains: PT, deltaKcal: -40, deltaProtein: 6, deltaCarbs: -30, deltaFats: 9, deltaFiber: -4 }],
    base: [{ food: 'Moong dal khichdi', grams: 300, made_of: 'rice and moong dal', contains: ['grain'], ...z }, { food: 'Bajra khichdi', grams: 300, made_of: 'bajra and moong dal', contains: ['grain'], deltaKcal: 20, deltaProtein: 2, deltaCarbs: 2, deltaFats: 1, deltaFiber: 4 }] });
  const GL = { glucose: { titleSuffix: '+ sauteed beans', note: 'Add beans, less khichdi.', add_item: 'Sauteed beans', add_grams: 80, minutes: 25, grain_grams_after: 200, contains: PT, deltaKcal: -60, deltaProtein: 0, deltaCarbs: -22, deltaFats: 2, deltaFiber: 3 } };
  const PROFS = [[{ diet: 'veg', goal: 'hold' }, 'lunch'], [{ diet: 'nonveg', goal: 'hold' }, 'dinner'], [{ diet: 'veg', goal: 'hold' }, 'snack'], [{ diet: 'veg', goal: 'hold', health: 'bp' }, 'lunch'],
    [{ diet: 'veg', goal: 'hold', health: 'diabetes', meds: 'no' }, 'lunch'], [{ diet: 'veg', goal: 'hold', health: 'diabetes', meds: 'no' }, 'snack']];
  const shownPlate = (o, slot, m) => (safe(() => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: slot } }).check(mealsReply(m)), {}).meals || [])[0];
  const tuned = (o, slot, m, swaps, alch) => safe(() => plan('tune', { profile: Object.assign({}, BASE, o), slot, meal: Object.assign({}, m, { minutes: 25 }) }).check({ swaps, alchemy: alch || {} }), {});
  for (const [o, slot] of PROFS) { const m = shownPlate(o, slot, KH());
    add('S10 grain-protein plate: the honest plate is shown (control)', !!m, `${JSON.stringify(o)} ${slot}: the khichdi plate was not shown`); if (!m) continue;
    const t = tuned(o, slot, m, SW());
    add('S10 no protein swap on the declared grain item, any profile', t.status === 'ok' && !(t.swaps.protein || []).some(s => s.food === 'Sprouted moong chilla'), `${JSON.stringify(o)} ${slot}: protein swaps offered ${JSON.stringify((t.swaps || {}).protein)}`);
    add('S10 the grain swap is still offered (control)', t.status === 'ok' && (t.swaps.base || []).some(s => s.food === 'Bajra khichdi'), `${JSON.stringify(o)} ${slot}: grain swaps ${JSON.stringify((t.swaps || {}).base)}`);
    // control: on a plate whose first protein item is not the grain, the same protein swap stays on offer
    const pm = shownPlate(o, slot, Object.assign(platePlain(), { swaps: undefined })), pt = pm && tuned(o, slot, pm, { protein: [{ food: 'Sprouted moong', grams: 200, contains: PT, ...z }, { food: 'Sprouted moong chilla', grams: 150, contains: PT, deltaKcal: -40, deltaProtein: 6, deltaCarbs: -30, deltaFats: 9, deltaFiber: -4 }], base: [] });
    add('S10 a protein swap on a plain plate stays on offer (control)', !!pt && pt.status === 'ok' && pt.swaps.protein.some(s => s.food === 'Sprouted moong chilla'), `${JSON.stringify(o)} ${slot}: ${JSON.stringify(pt && pt.swaps)}`); }
  // the app (src/v6/app.js, or NP_APP): every tap state on this plate, with the colliding swaps handed to it as a kept plate from an older build
  const app = fs.readFileSync(process.env.NP_APP || path.join(__dirname, '../../src/v6/app.js'), 'utf8');
  const grab = (name) => { const i = app.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = app.indexOf('{', i); for (; j < app.length; j++) { if (app[j] === '{') d++; else if (app[j] === '}') { d--; if (!d) break; } } return app.slice(i, j + 1); };
  const src = ['has', 'profileOut', 'viewOf', 'swapAt', 'composedWhy', 'plateWhy'].map(grab);
  const A = safe(() => new Function('P', 'C', 'UI', src.join('\n') + '\nreturn {viewOf, plateWhy};'), null);
  add('S10 app functions found', !!A && src.every(Boolean), 'viewOf, swapAt, composedWhy or plateWhy was not found in app.js');
  const sum = (b, ds) => { const n = { kcal: b.kcal, protein: b.protein, carbs: b.carbs, fats: b.fats }; ds.forEach(d => { n.kcal += d.deltaKcal; n.protein += d.deltaProtein; n.carbs += d.deltaCarbs; n.fats += d.deltaFats; }); return n; };
  let states = 0;
  if (A) for (const [o, slot] of PROFS.filter(x => x[1] !== 'snack')) { const m0 = shownPlate(o, slot, KH()); if (!m0) continue;
    const al = tuned(o, slot, m0, { protein: [], base: [] }, GL).alchemy || {};
    add('S10 the grain change is offered (control)', !!al.glucose, `${JSON.stringify(o)}: no grain change offered`);
    const m = Object.assign(J(m0), { swaps: SW(), alchemy: al, planned: [] });   // the colliding swaps, as an older build kept them
    const P = Object.assign({ conds: o.health && o.health !== 'none' ? [o.health] : [], leave: [], region: 'n', focus: 'none', sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, BASE, o), C = { meal: slot };
    const keys = Object.keys(al);
    for (let swp = 0; swp < 2; swp++) for (let swb = 0; swb < 2; swb++) for (let mask = 0; mask < (1 << keys.length); mask++) {
      const UI = { swp, swb, alc: {} }; keys.forEach((k, b) => { if (mask & (1 << b)) UI.alc[k] = true; });
      const f = A(P, C, UI), why = safe(() => f.plateWhy(m), 'threw'); if (why) continue;   // a state the app refuses is neither shown nor logged
      states++; const v = f.viewOf(m), st = `${JSON.stringify(o)} swp ${swp} swb ${swb} ${keys.filter(k => UI.alc[k]).join('+') || 'no change'}`;
      const onPlate = (food) => v.items.some(i => i.food === food);
      // every swap counted in the figures is on the plate, and no item is replaced twice
      add('S10 every swap in the figures is on the plate', v.swapped.every(x => onPlate(x.to)) && new Set(v.swapped.map(x => x.from)).size === v.swapped.length, `${st}: swapped ${JSON.stringify(v.swapped)}, plate ${v.items.map(i => i.food).join(', ')}`);
      // the figures shown (and logged, the same v.n) are the base plate plus what is on it, and nothing else
      const ds = []; if (swp) { const s = m.swaps.protein[swp]; if (onPlate(s.food)) ds.push(s); } if (swb) { const s = m.swaps.base[swb]; if (onPlate(s.food)) ds.push(s); } keys.forEach(k => { if (UI.alc[k]) ds.push(m.alchemy[k]); });
      const want = sum(m, ds);
      add('S10 the figures are the plate on screen', ['kcal', 'protein', 'carbs', 'fats'].every(k => Math.max(0, Math.round(want[k])) === v.n[k]), `${st}: shown ${JSON.stringify(v.n)}, the plate on screen is ${JSON.stringify(want)} (${v.items.map(i => i.grams + ' g ' + i.food).join(', ')})`);
      // a change note names the grain only while it is on the plate, at the grams it says
      if (keys.some(k => UI.alc[k] && m.alchemy[k].grainAfter != null)) add('S10 a grain change note is read', v.notes.some(x => / goes to \d+[\s\u00A0]g/.test(x)), `${st}: notes ${JSON.stringify(v.notes)}`);
      for (const note of v.notes) for (const g of note.matchAll(/([A-Z][A-Za-z ]+?) goes to (\d+)[\s\u00A0]g/g))
        add('S10 a change note names only what is on the plate', v.items.some(i => i.food === g[1] && i.grams === +g[2]), `${st}: the note "${note}" names ${g[1]}, plate ${v.items.map(i => i.grams + ' g ' + i.food).join(', ')}`);
      // the title names only what is on the plate
      for (const x of (v.suffix || '').replace(/^with /, '').split(', ').filter(x => / in place of /.test(x))) add('S10 the title names only what is on the plate', v.items.some(i => i.food.toLowerCase() === x.split(' in place of ')[0]), `${st}: title "${v.title}"`); } }
  add('S10 app states checked', states >= 8, `only ${states} app states were checked`);
  // the kept-plate rule stamp, in the app itself (final audit m4: ignoring it in pruneKept passed every Node check): a kept plate made under
  // other rules is dropped while the app is open, and one made under these rules is kept
  { const pk = safe(() => new Function('P', 'STORE', 'UI', 'baseWhy', [grab('rules'), grab('pruneKept')].join('\n') + '\nreturn {pruneKept, rules};'), null);
    if (pk) { const P1 = { diet: 'veg', leave: [], conds: [], meds: 'no', age: 47, cm: 158, kg: 72, sex: 'f', act: 'low' }, ST = { res: {}, shown: {} }, U = {}, f = pk(P1, ST, U, () => '');
      const plate = { items: [{ food: 'Dal', grams: 200 }], kcal: 400 }; ST.res.old = { meal: 'lunch', rules: '["veg",["dairy"],[],"no",47,158,72,"f","low"]', meals: [plate] }; ST.res.now = { meal: 'lunch', rules: f.rules(), meals: [plate] }; ST.shown.lunch = 'old';
      f.pruneKept();
      add('S10 kept plates: one stamped with other rules is dropped while the app is open', !ST.res.old && !!ST.res.now && !ST.shown.lunch, JSON.stringify({ keys: Object.keys(ST.res), shown: ST.shown })); }
    else add('S10 kept plates: one stamped with other rules is dropped while the app is open', false, 'pruneKept or rules not found in app.js'); }
  // My food closed after a food rule changed empties the kept plates at once (final audit m4: removing this passed every check, the review
  // included, because pruneKept drops them on the next render; this keeps both nets)
  { const cs = safe(() => new Function('ctx', 'with (ctx) { ' + grab('closeSheet') + '\n return closeSheet; }'), null);
    if (cs) { const ctx = { UI: { sheet: 'food' }, ANS0: 'before', SAFE0: 'old rules', STORE: { res: { k: { meals: [] } }, shown: { lunch: 'k' } }, SHEETFROM: null, $: () => ({ hidden: false }), behind: () => {},
        answers: () => 'after', rules: () => 'new rules', save: () => {}, render: () => {} };
      safe(() => cs(ctx)(), null);
      add('S10 kept plates: closing My food after a rule change empties them at once', Object.keys(ctx.STORE.res).length === 0, JSON.stringify(ctx.STORE)); }
    else add('S10 kept plates: closing My food after a rule change empties them at once', false, 'closeSheet not found in app.js'); }
  // app logic that rested on the review states alone (safety audit m1, m3, m4): each function is taken from app.js and run in Node with
  // stand-ins for the page around it. A missing function is a FAIL, not a skip.
  { const run = (names, ctx, ret) => { const code = names.map(grab); if (code.some(c => !c)) return null; return safe(() => new Function('ctx', 'with (ctx) { ' + code.join('\n') + '\n return ' + ret + '; }')(ctx), null); };
    const appP = (o) => Object.assign({ conds: [], leave: [], region: 'n', focus: 'none', sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, BASE, o);
    // m1: composedWhy keeps S5 (the grain stays with diabetes) and S6 (on medicines, the usual size) on every composed state
    { const mk = (P) => run(['has', 'profileOut', 'composedWhy'], { P, C: { meal: 'lunch' }, figsAgree, medsUsual }, '{composedWhy, u: medsUsual(profileOut(), "lunch")}');
      const fig = (p, c, f) => ({ protein: p, carbs: c, fats: f, kcal: 4 * p + 4 * c + 9 * f }), base = fig(25, 80, 20);
      const d = mk(appP({ conds: ['diabetes'], health: 'diabetes', meds: 'no' })), dm = mk(appP({ conds: ['diabetes'], health: 'diabetes', meds: 'yes' }));
      add('m1 app S5: composedWhy refuses a grain cut below half, and a grain swapped off', !!d && !!d.composedWhy(fig(25, 30, 20), base, { meal: 'lunch' }) && !!d.composedWhy(base, base, { meal: 'lunch', grainGone: true }) && !d.composedWhy(base, base, { meal: 'lunch' }), d ? 'not refused' : 'composedWhy not found');
      const big = fig(30, 110, 25), small = fig(14, 60, 8);
      add('m1 app S6: composedWhy refuses a plate under the usual size on medicines', !!dm && dm.u > small.kcal && dm.u <= big.kcal && !!dm.composedWhy(small, big, { meal: 'lunch', plate: true }) && !dm.composedWhy(big, big, { meal: 'lunch', plate: true }), dm ? `usual ${dm.u}: ${JSON.stringify([dm.composedWhy(small, big, { meal: 'lunch', plate: true }), dm.composedWhy(big, big, { meal: 'lunch', plate: true })])}` : 'composedWhy not found'); }
    // m3, A5 and A9: a tap after the day changed redraws for the new day, and a tap whose composed result fails is refused, not run
    { let redrawn = 0; const ctx = { DAY: 'yesterday', dayOf: () => 'today', refresh: () => { redrawn++; ctx.DAY = 'today'; }, render: () => {}, $: () => ({}) }; const f = run(['dayMoved'], ctx, 'dayMoved');
      add('m3 app S12: dayMoved sees a new day and redraws', !!f && f() === true && redrawn === 1 && f() === false, f ? `redrawn ${redrawn}` : 'dayMoved not found');
      let ran = 0, refused = ''; const c2 = { dayMoved: () => false, refuse: (w) => { refused = w; }, render: () => {} }; const a = run(['act'], c2, 'act');
      if (a) { a(() => 'not offered', () => { ran++; })(); a(() => '', () => { ran += 10; })(); }
      add('m3 app: act() refuses a tap whose check fails, and runs one that passes', !!a && ran === 10 && refused === 'not offered', a ? `ran ${ran}, refused "${refused}"` : 'act not found');
      let ranAfter = 0; const c3 = { dayMoved: () => true, refuse: () => {}, render: () => {} }; const a3 = run(['act'], c3, 'act'); if (a3) a3(() => '', () => { ranAfter++; })();
      add('m3 app S12: act() does not run a tap made after the day changed', !!a3 && ranAfter === 0, a3 ? `ran ${ranAfter}` : 'act not found'); }
    // m3, A11: a tab open past 4 am drops yesterday's Rescue, menu and log answers
    { const UI = { rres: { status: 'ok' }, rmoves: { 0: true }, rtext: 'x', mres: { orders: [] }, lres: { status: 'ok' }, ltext: 'x', lerr: 'x' };
      const ctx = { now: null, hr: 0, CLOCK: '', DAY: 'yesterday', dayOf: () => 'today', clockMeal: () => 'breakfast', C: { meal: 'dinner' }, STORE: {}, APP: {}, UI, FILE: null, buildFile: () => ({}), EV: [], PL: null, planDay: () => ({}), profileOut: () => ({}), appetite: () => 5, pruneKept: () => {}, HOOKS: null, hooksFor: () => ({}) };
      const f = run(['refresh'], ctx, 'refresh'); if (f) safe(() => f(), null);
      add('m3 app S12: a new day drops yesterday\'s Rescue, menu and log answers', !!f && UI.rres === null && UI.mres === null && UI.lres === null && UI.rtext === '' && UI.ltext === '', f ? JSON.stringify(UI) : 'refresh not found'); }
    // m3, A7 and A10: a Rescue or tune reply made for answers that changed during the wait is not shown
    { let sig = 'a', cb = null; const UI = { rres: null }; const ctx = { UI, C: { meal: 'lunch' }, profileOut: () => ({}), clockText: () => '', appetite: () => 5, fileOut: () => ({}), askedFor: () => sig, api: (u, b, f) => { cb = f; }, render: () => {}, revealOut: () => {}, setTimeout: () => {}, blocked: () => true, $: () => ({}), errText: () => '', RETRY: () => false, lockOn: () => {} };
      const f = run(['rescue'], ctx, 'rescue'); if (f) { f('Veg thali'); sig = 'b'; if (cb) cb(200, { status: 'ok', dish: {}, hacks: [] }); }
      add('m3 app S11: a stale Rescue reply is not shown', !!f && !!cb && UI.rres === null, f ? JSON.stringify(UI.rres) : 'rescue not found');
      let tsig = 'a', tcb = null; const m = { title: 't', items: [] }; const c2 = { STORE: { res: { k: { meal: 'lunch', meals: [m] } } }, TUNING: {}, ansSig: () => tsig, DAY: 'today', dayOf: () => 'today', api: (u, b, fn) => { tcb = fn; }, profileOut: () => ({}), UI: { view: 'other' }, render: () => {}, save: () => {}, curKey: () => 'k' };
      const t = run(['tune'], c2, 'tune'); if (t) { t('k', 0); tsig = 'b'; if (tcb) tcb(200, { status: 'ok', swaps: { protein: [{ food: 'x' }], base: [] }, alchemy: {} }); }
      add('m3 app S11: a stale tune reply is not shown', !!t && !!tcb && !m.swaps && !m.tuned, t ? JSON.stringify(m) : 'tune not found'); }
    // m4, N12: the log referral starts with the line to get help now on an urgent symptom; N16: so does the referral heading
    { let cb = null; const UI = { sheet: 'log' }; const ctx = { UI, C: { meal: 'lunch' }, renderSheet: () => {}, profileOut: () => ({}), clockText: () => '', askedFor: () => 's', api: (u, b, f) => { cb = f; }, blocked: () => false, $: () => ({}), URGENTLINE, SAFETY, RETRY: () => false, errText: () => '', lockOn: () => {} };
      const f = run(['logOther'], ctx, 'logOther'); if (f) { f('chest pain after lunch'); if (cb) cb(200, { status: 'refer', urgent: true }); }
      add('m4 app S7: the log referral starts with the line to get help now', !!f && typeof UI.lerr === 'string' && UI.lerr.indexOf(URGENTLINE) === 0 && UI.lerr.indexOf(SAFETY) > 0, f ? JSON.stringify(UI.lerr) : 'logOther not found');
      const kids = []; const ctx2 = { el: (tag, cls, text) => ({ tag, cls, text }), URGENTLINE, SAFETY }; const rh = run(['referHead'], ctx2, 'referHead'); if (rh) rh({ appendChild: (x) => kids.push(x) }, { urgent: true, read: SAFETY });
      add('m4 app S7: on an urgent symptom the referral heading is the line to get help now', !!rh && kids.length === 2 && kids[0].tag === 'h2' && kids[0].text === URGENTLINE && kids[1].text === SAFETY, rh ? JSON.stringify(kids) : 'referHead not found'); }
    // m4, N13: the app's "Planned around" lines leave out, with diabetes or medicines, the hooks the reason line leaves out
    { const f = run(['has', 'profileOut', 'hookProf', 'hooksSaid'], { P: appP({ conds: ['diabetes'], health: 'diabetes', meds: 'no' }), medsUsual, hookSaid: typeof hookSaid === 'function' ? hookSaid : undefined }, 'hooksSaid');
      const out = f ? f(['lighter_now', 'late_now', 'protein_low'], 'lunch', { lighter_now: 'A lighter lunch', late_now: 'Late', protein_low: 'Protein' }) : null;
      add('m4 app: with diabetes the "Planned around" lines leave out lighter and late', !!out && out.length === 1 && out[0] === 'Protein', JSON.stringify(out)); }
    // m4, N10 and N11: a conditional menu order carries no tick on its rules chips, and its row under "Also on this menu" carries the condition.
    // orderView is run on a stand-in page: every name the page does not give is a no-op, so only the drawn tree is read.
    { const mkEl = (tag, cls, text) => ({ tag, className: cls || '', textContent: text == null ? '' : String(text), kids: [], style: {}, appendChild(x) { this.kids.push(x); return x; }, setAttribute() {}, addEventListener() {}, focus() {} });
      const own = { el: mkEl, ic: (n) => mkEl('svg', 'ic-' + n), btn: (c, t) => mkEl('button', c, t), add: (p, ...k) => { k.forEach(c => c && p.appendChild(c)); return p; }, document: { createTextNode: (t) => mkEl('#text', '', t), querySelector: () => null },
        P: { diet: 'jain', leave: ['dairy'], conds: [] }, UI: { msel: 0, mmoves: {}, mno: [], myes: {} }, C: { meal: 'lunch' }, MENUK: ['kcal', 'protein', 'carbs', 'fats', 'fiber'], lab: (k, v) => String(v), mealName: () => 'Lunch',
        hooksSaid: () => [], grainParts: () => [], fitOf: () => 80, riseOf: () => ({ band: 'Gentle' }), bandCls: () => '', referHead: () => {}, act: () => () => {}, composedWhy: () => '', scaleN: (a) => a, setPressed: () => {} };
      const sb = new Proxy(own, { has: (t, k) => k !== Symbol.unscopables, get: (t, k) => k in t ? t[k] : k in globalThis ? globalThis[k] : () => {} });
      const code = grab('orderView'), ov = code ? safe(() => new Function('sb', 'with (sb) { ' + code + '\n return orderView; }')(sb), null) : null;
      const n = { kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6 }, cond = 'Only if they can make it this way.';
      const ord = (name, askIf) => ({ name, n, fit: 80, rise: 'Gentle', ask: askIf ? 'Make it Jain style.' : '', askIf: askIf ? cond : '', portion: '≈ 300 g', planned: [] });
      const v = mkEl('div'); if (ov) safe(() => ov(v, { status: 'ok', meal: 'lunch', orders: [ord('Veg pulao', true), ord('Dal fry', true)], moves: [], leave: [], dropped: {}, hooks: {} }), null);
      const all = []; const walk = (x) => { all.push(x); (x.kids || []).forEach(walk); }; walk(v);
      const chips = all.filter(x => /\bhchip\b/.test(x.className) && x.kids.some(k => /ic-check/.test(k.className)));
      add('m4 app: a conditional menu order has no tick on its rules chips', !!ov && all.some(x => x.textContent === 'Veg pulao') && chips.length === 0, ov ? `${chips.length} ticked chips` : 'orderView not found or threw');
      const alt = all.filter(x => x.tag === 'small' && /≈/.test(x.textContent));
      add('m4 app: a conditional order\'s row under "Also on this menu" carries the condition', !!ov && alt.length === 1 && alt[0].textContent.indexOf(cond) >= 0, JSON.stringify(alt.map(x => x.textContent)));
      // control: an order that fits as served keeps its ticks
      const v2 = mkEl('div'); if (ov) safe(() => ov(v2, { status: 'ok', meal: 'lunch', orders: [ord('Veg pulao', false)], moves: [], leave: [], dropped: {}, hooks: {} }), null);
      const all2 = []; const walk2 = (x) => { all2.push(x); (x.kids || []).forEach(walk2); }; walk2(v2);
      add('m4 app: an order that fits as served keeps its ticks (control)', all2.filter(x => /\bhchip\b/.test(x.className) && x.kids.some(k => /ic-check/.test(k.className))).length === 2, 'no ticked chips drawn'); }
  }
  // S10 as a property (coordinator, 16 Nov): over every plate recorded under eval/, with a protein swap, a grain swap and a grain change put
  // on each, and with its own recorded swaps and changes, every tap state the app accepts has no two slots on one item, and the figures
  // shown (which "I'll have this" logs) are the base plate plus what is on it.
  { const evalDir = path.join(__dirname, '../../eval'), plates = [];
    const take = (o) => { if (Array.isArray(o)) o.forEach(take); else if (o && typeof o === 'object') { if (Array.isArray(o.items) && o.items.length >= 2 && o.items.every(i => i && typeof i.food === 'string' && i.group) && typeof o.kcal === 'number') plates.push(o); else Object.values(o).forEach(take); }
      else if (typeof o === 'string' && /^\s*\{/.test(o) && o.length < 200000) { try { take(JSON.parse(o)); } catch (e) {} } };
    const jsons = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? jsons(path.join(d, e.name)) : /\.json$/.test(e.name) ? [path.join(d, e.name)] : []);
    if (fs.existsSync(evalDir)) for (const f of jsons(evalDir).sort()) { try { take(JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) {} }
    const seen = new Set(); let shownN = 0, statesN = 0, collide = 0; const NV = Object.assign({}, BASE, { diet: 'nonveg', goal: 'hold' });
    const P0 = Object.assign({ conds: [], leave: [], region: 'n', focus: 'none', sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, NV), C0 = { meal: 'lunch' };
    for (const raw of plates) { const key = JSON.stringify([raw.items.map(i => i.food), raw.kcal]); if (seen.has(key)) continue; seen.add(key);
      const r0 = J(raw); r0.items.forEach(i => { if (!Array.isArray(i.contains) || !i.contains.length) i.contains = PT.length ? PT : ['grain']; }); if (!Array.isArray(r0.contains)) r0.contains = PT;
      const sh = shownPlate(NV, 'lunch', Object.assign({}, r0, { swaps: undefined, alchemy: undefined })); if (!sh) continue; shownN++;
      const fp = sh.items.find(i => i.group === 'protein'), gr = sh.grain && sh.grain.food;
      const put = { protein: fp ? [{ food: fp.food, grams: fp.grams, contains: PT, ...z }, { food: 'Sprouted moong chilla', grams: 150, contains: PT, deltaKcal: -30, deltaProtein: 4, deltaCarbs: -10, deltaFats: 0, deltaFiber: -1 }] : [],
        base: gr ? [{ food: gr, grams: sh.grain.grams, made_of: sh.grain.made_of, contains: ['grain'], ...z }, { food: 'Bajra roti', grams: 80, made_of: 'bajra', contains: ['grain'], deltaKcal: 20, deltaProtein: 1, deltaCarbs: 4, deltaFats: 0, deltaFiber: 2 }] : [] };
      const alch = gr ? { glucose: { titleSuffix: '+ salad', note: 'More salad.', add_item: 'Cucumber salad', add_grams: 80, minutes: 20, grain_grams_after: Math.max(30, Math.round(sh.grain.grams * 0.7)), contains: PT, deltaKcal: -20, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 } } : {};
      const variants = [tuned(NV, 'lunch', sh, put, alch)]; if (raw.swaps || raw.alchemy) variants.push(tuned(NV, 'lunch', sh, raw.swaps || { protein: [], base: [] }, raw.alchemy || {}));
      for (const t of variants) { if (!t || t.status !== 'ok') continue; const m = Object.assign(J(sh), { swaps: t.swaps, alchemy: t.alchemy, planned: [] }), keys = Object.keys(m.alchemy || {});
        for (let swp = 0; swp < Math.max(1, m.swaps.protein.length); swp++) for (let swb = 0; swb < Math.max(1, m.swaps.base.length); swb++) for (let mask = 0; mask < (1 << keys.length); mask++) {
          const UI = { swp, swb, alc: {} }; keys.forEach((k, b) => { if (mask & (1 << b)) UI.alc[k] = true; });
          const f = A(P0, C0, UI); if (safe(() => f.plateWhy(m), 'threw')) continue; statesN++; const v = f.viewOf(m), onPlate = (food) => v.items.some(i => i.food === food), st = `"${sh.title}" swp ${swp} swb ${swb} ${keys.filter(k => UI.alc[k]).join('+')}`;
          const ok1 = v.swapped.every(x => onPlate(x.to)) && new Set(v.swapped.map(x => x.from)).size === v.swapped.length;
          if (!ok1) collide++;
          add('S10 recorded plates: no two slots on one item', ok1, `${st}: swapped ${JSON.stringify(v.swapped)}, plate ${v.items.map(i => i.food).join(', ')}`);
          const ds = []; if (swp) { const s = m.swaps.protein[swp]; if (onPlate(s.food)) ds.push(s); } if (swb) { const s = m.swaps.base[swb]; if (onPlate(s.food)) ds.push(s); } keys.forEach(k => { if (UI.alc[k]) ds.push(m.alchemy[k]); });
          const want = sum(m, ds);
          add('S10 recorded plates: shown figures are the plate on screen', ['kcal', 'protein', 'carbs', 'fats'].every(k => Math.max(0, Math.round(want[k])) === v.n[k]), `${st}: shown ${JSON.stringify(v.n)}, recomputed ${JSON.stringify(want)}`); } } }
    add('S10 recorded plates read', shownN >= 300 && statesN >= 1000, `only ${shownN} recorded plates shown, ${statesN} states`);
    console.log(`S10 recorded plates: ${plates.length} recorded, ${seen.size} distinct, ${shownN} shown and tuned, ${statesN} tap states checked`);
    // what "I'll have this" logs is the plate on screen: the handler logs the title and figures of the same viewOf the card was drawn from
    add('S10 the meal logged is the plate shown', /function heroCard\(m,v,r\)\{[\s\S]*?var n=v\.n[\s\S]*?logEv\("had",\{title:v\.title,kcal:n\.kcal,protein:n\.protein,carbs:n\.carbs,fats:n\.fats,fiber:n\.fiber/.test(app), 'the "had" handler does not log the shown title and figures'); }
  // plates where one item's name is a part of another's (safety audit M3): "Sambar" and "Sambar rice", "Dal" and "Dal khichdi". The grain
  // swap takes the place of the declared grain item (or, with none declared, the first carbohydrate item), never of the item whose name is
  // a part of it, and that item stays on the plate at its grams. With the grain declared by its whole name, the swap is offered and lands
  // on it (control). Without diabetes and with it.
  let partN = 0;
  if (A) for (const [first, fg, grainItem, mo] of [['Sambar', 'protein', 'Sambar rice', 'rice'], ['Dal', 'protein', 'Dal khichdi', 'rice and moong dal'], ['Curd', 'other', 'Curd rice', 'rice'], ['Methi', 'greens', 'Methi thepla', 'wheat']])
    for (const declared of [grainItem, grainItem.split(' ').slice(1).join(' ')]) for (const o of [{ diet: 'veg', goal: 'hold' }, { diet: 'veg', goal: 'hold', health: 'diabetes', meds: 'no' }]) {
      const dairy = /curd/i.test(grainItem) ? ['dairy'] : [], wheat = /thepla/i.test(grainItem) ? ['wheat'] : [];
      const raw = { title: 'x', prepMinutes: 25, items: [{ food: first, grams: 150, group: fg, contains: dairy.length ? dairy : PT }, { food: grainItem, grams: 250, group: 'carbs', contains: ['grain'].concat(dairy, wheat) }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: PT }],
        grain: { food: declared, made_of: mo, grams: 250 }, contains: ['grain'], kcal: 600, protein: 22, carbs: 90, fats: 16, fiber: 10, why: [], swaps: { protein: [], base: [] }, alchemy: {}, planned_around: [], for_you: '', taste: [] };
      const sh = shownPlate(o, 'lunch', raw), st = `${JSON.stringify(o)} items "${first}", "${grainItem}", grain declared "${declared}"`;
      if (declared === grainItem && !o.health) add('S10 part-name plates: the grain declared by its whole name is shown (control)', !!sh && sh.grain.food === grainItem, `${st}: ${sh ? 'grain ' + JSON.stringify(sh.grain) : 'not shown'}`);
      if (!sh) continue;
      add('S10 part-name plates: the declared grain is never the item whose name is a part of it', sh.grain.food !== first, `${st}: the engine declared "${sh.grain.food}"`);
      const t = tuned(o, 'lunch', sh, { protein: [], base: [{ food: grainItem, grams: 250, made_of: mo, contains: ['grain'], ...z }, { food: 'Bajra khichdi', grams: 250, made_of: 'bajra and moong dal', contains: ['grain'], deltaKcal: 20, deltaProtein: 2, deltaCarbs: -4, deltaFats: 2, deltaFiber: 4 }] });
      if (!t || t.status !== 'ok') continue;
      const m = Object.assign(J(sh), { swaps: t.swaps, alchemy: t.alchemy || {}, planned: [] });
      if (declared === grainItem && !o.health) add('S10 part-name plates: the grain swap is offered (control)', m.swaps.base.some(s => s.food === 'Bajra khichdi'), `${st}: base swaps ${JSON.stringify(m.swaps.base)}`);
      if (!m.swaps.base.some(s => s.food === 'Bajra khichdi')) continue;
      const P = Object.assign({ conds: o.health ? [o.health] : [], leave: [], region: 'n', focus: 'none', sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, BASE, o);
      const f = A(P, { meal: 'lunch' }, { swp: 0, swb: m.swaps.base.findIndex(s => s.food === 'Bajra khichdi'), alc: {} });
      if (safe(() => f.plateWhy(m), 'threw')) continue; partN++;
      const v = f.viewOf(m), want = sh.grain.food || grainItem;
      add('S10 part-name plates: the grain swap takes the place of the grain item', v.swapped.length === 1 && v.swapped[0].from === want && v.items.some(i => i.food === first && i.grams === 150) && !v.items.some(i => i.food === grainItem),
        `${st}: swapped ${JSON.stringify(v.swapped)}, plate ${v.items.map(i => i.grams + ' g ' + i.food).join(', ')}, title "${v.title}"`); }
  add('S10 part-name plates: grain swap taps checked', partN >= 8, `only ${partN} grain swap taps on part-name plates were checked`);
  // plates with no declared grain (safety audit of ba4d8dc, M2): the grain named by a short form of its item ("Rice" for "Jeera rice",
  // "Roti" for "Jowar roti"), or none at all. Nothing ties a change's grain grams to an item, so no change that changes the grain is offered,
  // on the plate and in a tune; a change that leaves the grain alone stays (control); and over every tap state the app accepts, the figures
  // shown (which "I'll have this" logs) are the base plate plus what is on it, and no note names a grain going up, down or off.
  let ngN = 0;
  if (A) for (const [items, grain] of [[[['Rajma', 150, 'protein'], ['Jeera rice', 200, 'carbs'], ['Cucumber salad', 120, 'greens']], { food: 'Rice', made_of: 'rice', grams: 200 }],
      [[['Rajma', 150, 'protein'], ['Jeera rice', 200, 'carbs'], ['Cucumber salad', 120, 'greens']], { food: '', made_of: '', grams: 0 }],
      [[['Moong dal', 200, 'protein'], ['Jowar roti', 90, 'carbs'], ['Cucumber salad', 100, 'greens']], { food: 'Roti', made_of: 'jowar', grams: 90 }],
      [[['Paneer bhurji', 150, 'protein'], ['Sauteed greens', 150, 'greens']], { food: '', made_of: '', grams: 0 }]])
    for (const o of [{ diet: 'veg', goal: 'hold' }, { diet: 'veg', goal: 'hold', health: 'bp' }]) {
      const gg = grain.grams, ch = (after, d, item) => Object.assign({ titleSuffix: '+ ' + item.toLowerCase(), note: 'x', add_item: item, add_grams: 80, minutes: 20, contains: PT, deltaFiber: 2 }, after === undefined ? {} : { grain_grams_after: after }, d);
      const AL = { glucose: ch(gg ? Math.round(gg * 0.75) : 150, { deltaKcal: -120, deltaProtein: 2, deltaCarbs: -30, deltaFats: 0 }, 'Sauteed beans'),   // shrinks the grain
        express: ch(gg ? gg + 50 : 100, { deltaKcal: 80, deltaProtein: 0, deltaCarbs: 20, deltaFats: 0 }, 'Cucumber raita'),                                // grows it
        protein: ch(undefined, { deltaKcal: 110, deltaProtein: 6, deltaCarbs: 15, deltaFats: 2 }, 'Roasted chana'),                                        // no grain grams: leaves it alone
        gut: ch(gg, { deltaKcal: 40, deltaProtein: 2, deltaCarbs: 6, deltaFats: 1 }, 'Steamed carrots') };                                                 // the same grain grams (or 0 with none)
      const raw = { title: 'x', prepMinutes: 25, items: items.map(([food, grams, group]) => ({ food, grams, group, contains: /rice|roti/i.test(food) ? ['grain'] : PT })), grain, contains: ['grain'],
        kcal: 560, protein: 22, carbs: 80, fats: 16, fiber: 10, why: [], swaps: { protein: [], base: [] }, alchemy: AL, planned_around: [], for_you: '', taste: [] };
      const st = `${JSON.stringify(o)} items ${items.map(i => '"' + i[0] + '"').join(', ')}, grain declared "${grain.food}"`;
      const sh = shownPlate(o, 'lunch', raw); add('S10 no declared grain: the plate is shown with no grain (control)', !!sh && sh.grain.food === '', `${st}: ${sh ? 'grain ' + JSON.stringify(sh.grain) : 'not shown'}`); if (!sh) continue;
      const t = tuned(o, 'lunch', Object.assign(J(sh), { alchemy: undefined }), { protein: [], base: [] }, AL);
      for (const [path, al] of [['plate', sh.alchemy || {}], ['tune', (t && t.alchemy) || {}]]) {
        add('S10 no declared grain: no change that changes the grain is offered', !al.glucose && !al.express, `${st} (${path}): offered ${Object.keys(al).join(', ')}: ${JSON.stringify(Object.keys(al).map(k => al[k].note))}`);
        add('S10 no declared grain: a change that leaves the grain alone stays (control)', !!al.protein, `${st} (${path}): offered ${Object.keys(al).join(', ')}`); }
      const m = Object.assign(J(sh), { planned: [] }), keys = Object.keys(m.alchemy || {});
      const P = Object.assign({ conds: o.health ? [o.health] : [], leave: [], region: 'n', focus: 'none', sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, BASE, o);
      for (let mask = 0; mask < (1 << keys.length); mask++) { const UI = { swp: 0, swb: 0, alc: {} }; keys.forEach((k, b) => { if (mask & (1 << b)) UI.alc[k] = true; });
        const f = A(P, { meal: 'lunch' }, UI); if (safe(() => f.plateWhy(m), 'threw')) continue; ngN++;
        const v = f.viewOf(m), want = sum(m, keys.filter(k => UI.alc[k]).map(k => m.alchemy[k])), s2 = `${st} ${keys.filter(k => UI.alc[k]).join('+') || 'no change'}`;
        add('S10 no declared grain: shown, logged and recomputed figures agree', ['kcal', 'protein', 'carbs', 'fats'].every(k => Math.max(0, Math.round(want[k])) === v.n[k]), `${s2}: shown ${JSON.stringify(v.n)}, recomputed ${JSON.stringify(want)}`);
        add('S10 no declared grain: no note names a grain change', !v.notes.some(x => / goes to \d+[\s ]g| is left out/.test(x)) && v.items.every(i => items.some(([f0, g0]) => f0 === i.food && g0 === i.grams) || !items.some(([f0]) => f0 === i.food)), `${s2}: notes ${JSON.stringify(v.notes)}, plate ${v.items.map(i => i.grams + ' g ' + i.food).join(', ')}`); } }
  add('S10 no declared grain: tap states checked', ngN >= 16, `only ${ngN} tap states on plates with no declared grain were checked`);
  console.log(`S10 grain-protein plate: ${states} app tap states checked; part-name plates: ${partN} grain swap taps; no declared grain: ${ngN} tap states`); }

// ---------- B1 (Codex re-audit): urgent symptoms are referred before the model on every kind that carries text, with the line to get help now ----------
// A first net, not a complete list: the phrasings below are the re-audit's and their variants, so they are regression cases, not held out.
{ const URG = ['I took insulin and feel shaky', 'my sugar dropped to 50 and I feel dizzy', 'my sugar is very low and I am sweating', 'chest pain after lunch', 'feeling faint and confused',
    'sugar kam ho gaya, chakkar aa rahe hain', 'seene me dard hai', 'saans phool rahi hai', 'cant breathe properly', 'passed out after lunch', 'hypo after my tablets', 'feeling shakey after insulin', 'no chest pain today'];
  const BENIGN = ['sugar-free dessert', 'low sugar biscuits', 'I want low sugar chai', 'I am confused what to eat', 'dizzy from the heat, something cold', 'Something light with paneer', 'I am sweating, it is hot'];
  for (const kind of ['meals', 'menu', 'rescue', 'log']) {
    for (const t of URG) { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }), {});
      add('B1 urgent text is referred before the model', !!(pl.reply && pl.reply.status === 'refer' && pl.reply.read === SAFETY && pl.reply.urgent && !pl.prompt), `${kind}: "${t}" ${pl.reply ? JSON.stringify(pl.reply).slice(0, 80) : 'went to the model'}`); }
    for (const t of BENIGN) { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }), {});
      add('B1 benign text is not referred', !(pl.reply && pl.reply.status === 'refer'), `${kind}: "${t}" was referred`); } }
  // a wrong "none" from the model cannot undo it: the model is never asked
  const pl = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch', text: 'chest pain after lunch' } }), {});
  add('B1 a wrong refer_reason cannot undo it', !pl.check, 'the plates plan for "chest pain after lunch" can still take a model reply'); }

// ---------- B2 (Codex re-audit): Builder shares stay in bounds, sum to 100, and reach the engine unchanged, from every preset ----------
{ const app = fs.readFileSync(process.env.NP_APP || path.join(__dirname, '../../src/v6/app.js'), 'utf8'), at = app.indexOf('function rebalance(');   // NP_APP: another checkout's app.js
  let fnSrc = '', d = 0; for (let i = app.indexOf('{', at); i < app.length; i++) { if (app[i] === '{') d++; else if (app[i] === '}') { d--; if (!d) { fnSrc = app.slice(at, i + 1); break; } } }
  const rebal = safe(() => (0, eval)('(' + fnSrc.replace(/^function rebalance/, 'function') + ')'), null);
  const K = ['protein', 'greens', 'carbs', 'fats'], starts = safe(() => Object.values(MODEPLATE).concat(Object.values(PRESETS)), []);
  let states = 0, bad = [];
  const accepted = (q) => { const c = safe(() => readCtx({ meal: 'lunch', ratio: q }, 'meals'), null); return !!(c && c.ratio && K.every(k => c.ratio[k] === q[k])); };
  if (rebal) for (const st of starts) { const seen = new Set(), queue = [st];
    while (queue.length && states < 400000) { const q = queue.pop(), key = K.map(k => q[k]).join(','); if (seen.has(key)) continue; seen.add(key); states++;
      const sum = K.reduce((a, k) => a + q[k], 0);
      if (sum !== 100 || K.some(k => !(q[k] >= 5)) || !accepted(q)) { if (bad.length < 5) bad.push(key); continue; }
      for (const k of K) for (const dd of [5, -5]) { const n = safe(() => rebal(q, k, dd), null); if (n) queue.push(n); } } }
  add('B2 every reachable Builder state is in bounds and accepted unchanged', !!rebal && states > 0 && !bad.length, rebal ? `${bad.length} bad of ${states} states, e.g. ${bad.join(' | ')}` : 'rebalance not found in app.js');
  console.log(`B2: ${states} Builder states reached from ${starts.length} presets`); }

// ---------- B3 (Codex re-audit): the note to clients on medicines promises only what the code enforces ----------
{ const p = readProfile(Object.assign({}, BASE, { health: 'diabetes', meds: 'yes', goal: 'lose', kg: 80 }));
  const txt = JSON.stringify(safe(() => dayTargets6(p).notes, []));
  add('B3 the medicines note is in plain words (Critic round 38, finding 12)', !/checked to agree/.test(txt) && /add up with the protein, carbs and fats/.test(txt), 'the note says: ' + txt.slice(0, 400));
  add('B3 the medicines note promises what is enforced', /usual size/.test(txt) && /doctor sets how much carbohydrate/.test(txt) && !/even amount|same amount|consistent carb|steady carb/i.test(txt), 'the note says: ' + txt.slice(0, 400)); }

// ---------- at-risk sample, fix 2: a preparation request on a menu order is a closed kind; the line is the engine's; the tags as served decide ----------
{ const menuReq = (o, name, listed, served, request, extra) => { const pl = plan('menu', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: 'MAINS\n' + name + ' 240\n' } });
    const d = Object.assign({ as_written: name, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0,
      request, contains_listed: listed, contains: served, with_contains: ['plain'], planned_around: [] }, extra || {});
    return safe(() => pl.check({ status: 'ok', refer_reason: 'none', dishes: [d], leave: [] }), { orders: [] }); };
  const REQLINES = safe(() => Object.values(REQTEXT), []);
  const r1 = menuReq({ diet: 'jain' }, 'Kadai Paneer', ['dairy', 'onion_garlic'], ['dairy'], 'jain');
  add('request: Jain style makes an honest dish fit, with the engine\'s line', (r1.orders || []).length === 1 && r1.orders[0].ask === safe(() => REQTEXT.jain, '?'), `Jain: Kadai Paneer with a Jain request: ${JSON.stringify(r1.orders || r1.dropped)}`);
  // owner, 16 Nov: an order that fits only because of its request is marked conditional; a request that takes out nothing barred is not
  add('request: conditional when the request takes out a barred tag', (r1.orders || [])[0] && r1.orders[0].askIf === safe(() => REQIF, '?'), `Jain Kadai Paneer: ${JSON.stringify((r1.orders || [])[0] || {}).slice(0, 200)}`);
  const r5 = menuReq({ health: 'bp' }, 'Dal Fry', ['plain'], ['plain'], 'less_salt'), r6 = menuReq({ diet: 'veg' }, 'Kadai Paneer', ['dairy', 'onion_garlic'], ['dairy'], 'jain');
  add('request: no condition line when nothing barred is taken out', (r5.orders || []).length === 1 && r5.orders[0].ask === safe(() => REQTEXT.less_salt, '?') && !r5.orders[0].askIf && (r6.orders || []).length === 1 && !r6.orders[0].askIf,
    `less_salt: ${JSON.stringify((r5.orders || [])[0] || r5.dropped)}; jain for a vegetarian: ${JSON.stringify((r6.orders || [])[0] || r6.dropped)}`);
  add('request: no request, tags as served break the rule', !(menuReq({ diet: 'jain' }, 'Kadai Paneer', ['dairy', 'onion_garlic'], ['dairy', 'onion_garlic'], 'none').orders || []).length, 'Jain: Kadai Paneer served with onion was offered');
  for (const [o, name, listed, served, req] of [[{ diet: 'veg' }, 'Chicken Tikka', ['meat'], ['plain'], 'jain'], [{ diet: 'veg' }, 'Egg Curry', ['egg', 'onion_garlic'], ['plain'], 'no_egg'], [{ diet: 'veg' }, 'Fish Curry', ['fish'], ['plain'], 'no_dairy_fat'],
      [{ diet: 'vegan' }, 'Paneer Butter Masala', ['dairy', 'onion_garlic'], ['onion_garlic'], 'no_dairy_fat'], [{ diet: 'jain' }, 'Dal Fry', ['onion_garlic', 'wheat'], ['plain'], 'jain'], [{ leave: ['wheat'] }, 'Veg Pulao', ['grain', 'wheat'], ['grain'], 'jain'], [{ diet: 'jain' }, 'Dal Fry', undefined, ['plain'], 'jain']])
    add('request: never takes out meat, fish, egg or anything it cannot', !(menuReq(o, name, listed, served, req).orders || []).length, `${JSON.stringify(o)}: "${name}" listed ${JSON.stringify(listed)}, served ${JSON.stringify(served)} with ${req} was offered`);
  // final audit M3: the cases above name the food in plain words, so the word net drops them whatever the request may take out. These use
  // held-out names (no word list holds them), list only the barred tag, and serve it as gone: only the request table can drop them.
  // Every request kind is tried on every tag it must never take out, for the client whose rules bar that tag.
  { const HELD = { meat: ['Laal maas', 'Kori gassi', 'Rogan josh'], fish: ['Bangude masala', 'Pabda jhaal', 'Rui kalia'], egg: ['Dim bhuna', 'Nargisi kofta', 'Baida roti'], salty_side: ['Gongura pachadi', 'Khakra', 'Vadam'] };
    const BAR = { meat: [{ diet: 'veg' }, { diet: 'egg' }, { diet: 'jain' }, { diet: 'vegan' }], fish: [{ diet: 'veg' }, { diet: 'egg' }], egg: [{ diet: 'veg' }, { diet: 'jain' }, { diet: 'vegan' }], salty_side: [{ health: 'bp' }] };   // not diabetes with BP: a dish with no grain is dropped by rule 3 there, so the case could not fail
    const EATS = { meat: { diet: 'nonveg' }, fish: { diet: 'nonveg' }, egg: { diet: 'nonveg' }, salty_side: {} };
    let tried = 0;
    for (const [tag, names] of Object.entries(HELD)) for (const name of names) {
      // control: the same dish, honestly tagged, for a client who eats it, is offered, so a drop below is the request table's
      const c = menuReq(EATS[tag], name, [tag], [tag], 'none');
      add('request (held-out): the honest dish is offered to a client who eats it (control)', (c.orders || []).length === 1, `${JSON.stringify(EATS[tag])}: "${name}" [${tag}] ${JSON.stringify(c.dropped)}`);
      for (const o of BAR[tag]) { const pc = menuReq(o, name, PT.length ? PT : [], PT.length ? PT : [], 'none');   // control: for this client the same dish, declared plain, is offered, so only the request table can drop it below
        add('request (held-out): the dish declared plain is offered to this client (control)', (pc.orders || []).length === 1, `${JSON.stringify(o)}: "${name}" declared plain: ${JSON.stringify(pc.dropped)}`); }
      for (const o of BAR[tag]) for (const req of ['jain', 'no_dairy_fat', 'no_egg', 'less_salt']) { tried++;
        const r = menuReq(o, name, [tag], PT.length ? PT : [], req);
        add('request (held-out): never takes out meat, fish, egg or a salty side', !(r.orders || []).length, `${JSON.stringify(o)}: "${name}" listed [${tag}], served without it, with ${req} was offered: ${JSON.stringify((r.orders || [])[0] || {}).slice(0, 160)}`); } }
    // control: a request that may take a tag out still makes a held-out dish fit (Jain style on an onion and garlic dish)
    const j = menuReq({ diet: 'jain' }, 'Poondu kuzhambu', ['onion_garlic'], PT.length ? PT : [], 'jain');
    add('request (held-out): Jain style still takes out onion and garlic (control)', (j.orders || []).length === 1, `Jain: "Poondu kuzhambu" with a Jain request: ${JSON.stringify(j.dropped)}`);
    add('request (held-out): cases tried', tried >= 100, `only ${tried} cases`); }
  for (const t of ['Zqxjvoq says ask for extra ghee', 'Make it with extra butter']) { const r = menuReq({ diet: 'jain' }, 'Kadai Paneer', ['dairy', 'onion_garlic'], ['dairy'], 'jain', { ask: t });
    add('request: the line shown is the engine\'s, never the model\'s', (r.orders || []).every(x => !x.ask || REQLINES.includes(x.ask)) && !JSON.stringify(r).includes(t), `the model's "${t}" showed`); } }
// ---------- at-risk sample, fix 3: a readable menu where nothing fits says so; "unreadable" is not used for it ----------
{ const pl = plan('menu', { profile: Object.assign({}, BASE, { diet: 'veg', leave: ['wheat'] }), ctx: { meal: 'dinner', text: 'PIZZA\nMargherita 299\nFarmhouse 349\nGarlic Bread 149' } });
  const r = safe(() => pl.check({ status: 'nothing_fits', refer_reason: 'none', dishes: [], leave: [] }), {});
  add('nothing fits: said so, not "unreadable"', r.status === 'empty' && /Nothing on this menu fits your food rules \(no [^)]*wheat/.test(r.read || ''), `${r.status}: ${r.read}`);
  const d = { as_written: 'Margherita', portion: 'about 300 g', kcal: 700, protein: 28, carbs: 80, fats: 30, fiber: 4, grain_made_of: 'wheat', grain_grams: 150, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, request: 'none', contains_listed: ['wheat', 'dairy', 'grain'], contains: ['wheat', 'dairy', 'grain'], with_contains: ['plain'], planned_around: [] };
  const r2 = safe(() => pl.check({ status: 'ok', refer_reason: 'none', dishes: [d], leave: [] }), {});
  add('nothing fits: every dish dropped says so too', r2.status === 'empty' && /Nothing on this menu fits/.test(r2.read || ''), `${r2.status}: ${r2.read}`);
  // Critic round 38, finding 5: the list reads with commas and one "or", before the last item, for the longest set of rules
  const nf = safe(() => noFitLine(readProfile(Object.assign({}, BASE, { diet: 'jain', health: 'diabetes', bp: true, leave: ['dairy'] }))), '');
  add('nothing fits: no comma inside an item (Critic round 39, finding 7)', /\(no [^)]+\)/.test(nf) && !/\bor\b[^)]*,/.test(nf.match(/\(no [^)]+\)/)[0]) && /pickle and papad/.test(nf), nf);
  add('nothing fits: one "or" in the list', /\(no [^)]+\)/.test(nf) && (nf.match(/\(no [^)]+\)/)[0].match(/\bor\b/g) || []).length === 1, nf);
  add('nothing fits: the prompt offers the state', /nothing_fits/.test(pl.prompt || '') && JSON.stringify(pl.schema || {}).includes('nothing_fits'), 'the menu prompt or schema has no nothing_fits'); }

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
{ const T = { 'Only dal, rice and curd at home': ['dairy'], 'Andhra mutton biryani': ['meat', 'dairy', 'onion_garlic'], 'Pahadi mutton rara with butter rotis': ['meat', 'dairy', 'wheat', 'onion_garlic'], 'Peri-peri half chicken with spicy rice': ['meat', 'onion_garlic'],
    'Paneer butter masala with butter naan': ['dairy', 'wheat', 'onion_garlic'], 'Chole bhature': ['wheat', 'onion_garlic'], 'Veg biryani with raita': ['dairy', 'onion_garlic'], 'Masala dosa with chutney': ['root_veg', 'onion_garlic'], 'A slice of tiramisu after dinner': ['dairy', 'egg', 'wheat', 'sweet'] };
  const PROFS = []; for (const diet of ['veg', 'egg', 'nonveg', 'jain', 'vegan']) for (const leave of [[], ['dairy'], ['nut'], ['wheat'], ['soya']]) for (const h of [{ health: 'none' }, { health: 'diabetes' }, { health: 'bp' }]) PROFS.push(Object.assign({ diet, leave }, h));
  const all = (typeof APPDISHES !== 'undefined' ? APPDISHES.concat(APPASKS) : []);
  add('B5 app food is tagged', all.length === 12, 'the app’s dishes and asks are not in np-core with their tags');
  // the app's own dishes carry no household count (S8; Critic round 39, finding 9: "with 2 butter naan")
  add('S8 app dishes carry no count', all.length > 0 && all.every(e => !/\d/.test(e[0]) && !COUNTWORDS.test(e[0])), JSON.stringify(all.map(e => e[0]).filter(t => /\d/.test(t) || COUNTWORDS.test(t))));
  add('S8 the prompt asks for no counts or measures in words', typeof nameText === 'function' && /no counts or measures in words/.test(nameText()), 'nameText() does not ask for it');
  for (const o of PROFS) { const p = prof(o), bar = barredTags(p); for (const e of all) if (safe(() => appFoodOK(e, p), true)) add('B5 app food against every profile', !(T[e[0]] || []).some(t => bar.includes(t)), `${JSON.stringify(o)}: "${e[0]}" is shown`); } }

// ---------- B1: only what the client named, per tag ----------
{ const cases = [[{ diet: 'veg' }, 'Veg biryani, no egg', 'Egg biryani', ['grain', 'egg']], [{ diet: 'veg' }, 'Paneer tikka, not chicken', 'Chicken tikka', ['meat']], [{ leave: ['dairy'] }, 'Thali, no paneer', 'Paneer thali', ['grain', 'dairy']],
    [{ diet: 'jain' }, 'Thali, no onion no garlic', 'Lahsuni dal thali', ['grain', 'onion_garlic']], [{ diet: 'jain' }, 'Jain pav bhaji, no potato', 'Pav bhaji with lahsuni chutney', ['onion_garlic', 'wheat']], [{ diet: 'egg' }, 'Egg curry, no chicken', 'Egg curry with bangude', ['egg', 'fish']],
    [{ diet: 'veg' }, 'Mutton biryani', 'Mutton and prawn biryani', ['meat', 'fish', 'grain']], [{ diet: 'jain' }, 'Onion uttapam', 'Onion and potato uttapam', ['grain', 'onion_garlic', 'root_veg']]];
  const NEGW = ['no', 'not', 'without', 'skip the', 'no extra'], FOOD = [['egg', 'egg', { diet: 'veg' }], ['chicken', 'meat', { diet: 'veg' }], ['fish', 'fish', { diet: 'egg' }], ['paneer', 'dairy', { diet: 'vegan' }], ['onion', 'onion_garlic', { diet: 'jain' }], ['garlic', 'onion_garlic', { diet: 'jain' }], ['potato', 'root_veg', { diet: 'jain' }], ['peanuts', 'nuts', { leave: ['nut'] }]];
  for (const neg of NEGW) for (const [f, tag, o] of FOOD) cases.push([o, 'Veg thali, ' + neg + ' ' + f, cap(f) + ' thali', ['grain', tag]]);
  for (const [o, typed, dish, tags] of cases) { const r = rescueOut(o, typed, { name: dish, contains: tags }, [WALK]);
    // usefulness brief: the dish shows as typed and the model's name for it never shows; no typed word excuses anything the engine writes
    add('B1 typed excuse', r.status === 'ok' && r.dish.name.toLowerCase() === typed.toLowerCase() && !rescueShown(r).toLowerCase().includes(dish.toLowerCase()) && (r.hacks || []).every(h => !crosses(h.title, prof(o))), `${JSON.stringify(o)}: typed "${typed}", model dish "${dish}" ${JSON.stringify(tags)}: ${r.status} ${rescueShown(r)}`); }
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
