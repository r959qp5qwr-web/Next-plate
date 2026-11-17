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
// fix-r12: every script on the page and every source file, and every regular expression np-core builds at load (a look-behind spelled
// across a string join would not show in the text)
{ const LB = /\(\?<[!=]/, scripts = [...page.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  add('no look-behind anywhere on the page (older phone browsers reject it)', scripts.length >= 2 && !scripts.some(x => LB.test(x)), 'a script on the page holds (?<! or (?<=');
  const srcs = ['src/v5/core.js', 'src/v5/app.js', 'src/v6/params.js', 'src/v6/engine.js', 'src/v6/plate.js', 'src/v6/app.js'].filter(f => fs.existsSync(path.join(__dirname, '../..', f)));
  for (const f of srcs) add('no look-behind in the sources', !LB.test(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8')), f + ' holds (?<! or (?<=');
  const built = Object.getOwnPropertyNames(globalThis).filter(k => { try { return globalThis[k] instanceof RegExp; } catch (e) { return false; } });
  add('no look-behind in a regular expression np-core builds', built.length > 50 && !built.some(k => LB.test(globalThis[k].source)), `${built.length} expressions read: ` + built.filter(k => LB.test(globalThis[k].source)).join(', ')); }
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
// ---------- the lexicon floor covers the engine's lists (fix-r13; safety audit of 9dd1b13, m1 and m2) ----------
// The word-level tests read the lexicon's "known" lists, not the engine's: a word the engine lists and the lexicon lacks could be taken out
// of the engine and no test would see it ("honey" or "sugar" out of SWEETS, "glassfuls?" out of MEASW passed every check). So every word of
// every barred list, and every form each MEASW entry reads, is in the lexicon (singular or plural), or is held out below with its reason.
// A new engine word fails here until the lexicon holds it; taking a lexicon word out of the engine fails the forms test above (lists) and
// recorded.js's "the measure list holds the lexicon's measure words" (MEASW).
{ const sing = w => w.replace(/ies$/, 'y').replace(/(ch|sh|x|ss)es$/, '$1').replace(/oes$/, 'o').replace(/([^s])s$/, '$1');
  const lexOf = (...ks) => { const o = new Set(); for (const k of ks) for (const w of [].concat(L[k] || [], AR[k] || [])) { o.add(w.toLowerCase()); o.add(sing(w.toLowerCase())); } return o; };
  const HELDOUT = { measure: { no: 'the negation word (S1); a measure only after a digit, which the detector reads on its own' } };
  const LISTS = [['meat', () => MEATW.concat(FISHW), 'meat'], ['egg', () => EGGW, 'egg'], ['dairy', () => DAIRYW, 'dairy'], ['onion_garlic', () => ONIONW, 'jain'], ['root_veg', () => ROOTW, 'jain'],
    ['wheat', () => LEAVEW.wheat, 'wheat'], ['nuts', () => LEAVEW.nut, 'nut'], ['soya', () => LEAVEW.soya, 'soya'], ['sweet', () => SWEETS, 'sweet'], ['salty_side', () => SALTY, 'salty'], ['supplement', () => SUPPW, 'supplement']];
  for (const [tag, get, k] of LISTS) { const lex = lexOf(k), list = safe(get, []);
    add('m1 the lexicon floor holds every word of the engine\'s barred lists', list.length > 0, `${tag}: the engine has no list`);
    for (const w of list) add('m1 the lexicon floor holds every word of the engine\'s barred lists', lex.has(w) || lex.has(sing(w)) || !!(HELDOUT[tag] || {})[w], `${tag}: "${w}" is in the engine's list but not in lexicon.json known.${k} (add it, or hold it out here with a reason)`); }
  // MEASW entries are expressions: each optional letter or group is read both ways; a stem with "\w*" is read as the stem
  const expand = f => { f = f.replace(/\\w\*$/, ''); const m = /\(\?:([^()]*)\)\?|([a-z])\?/.exec(f); if (!m) return [f];
    const head = f.slice(0, m.index), tail = f.slice(m.index + m[0].length), opt = m[1] !== undefined ? m[1] : m[2]; return [...expand(head + tail), ...expand(head + opt + tail)]; };
  const floor = new Set((L.measure || []).map(w => w.toLowerCase())), mw = safe(() => MEASW, []);
  add('m2 the lexicon floor holds every form of the engine\'s measure list (MEASW)', Array.isArray(mw) && mw.length > 30, 'np-core has no MEASW');
  for (const f of mw) for (const w of expand(f)) add('m2 the lexicon floor holds every form of the engine\'s measure list (MEASW)', floor.has(w) || !!HELDOUT.measure[w], `MEASW "${f}" reads "${w}", which is not in lexicon.json known.measure`); }
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
const rescueOut = (o, typed, dish, hacks) => safe(() => plan('rescue', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: typed } }).check({ status: 'ok', refer_reason: 'none', dish: Object.assign({ name: typed, portion: '1 plate, about 350 g', kcal: 620, protein: 24, carbs: 80, fats: 22, fiber: 6, warning: '', breakdown: '', contains: ['grain'] }, dish || {}), hacks: hacks }), { status: 'error' });
const rescueShown = (r) => r && r.status === 'ok' ? [r.dish.name, r.dish.portion, r.dish.warning, r.dish.breakdown].concat((r.hacks || []).map(h => h.title)).join(' | ') : '';
const WALK = { title: 'A 15-minute walk after the meal', kind: 'move', contains: [], ...z };
const tuneOut = (o, slot, alch, swaps) => { const m = platePlain(); const p = Object.assign({}, BASE, o);
  const pl = plan('tune', { profile: p, slot, meal: Object.assign({}, m, { minutes: 20 }) }); return pl.check ? pl.check({ swaps: swaps || { protein: [], base: [] }, alchemy: alch }) : { alchemy: {} }; };
const NOTE = (note, tags, after) => ({ titleSuffix: '+ a change', note, minutes: 20, grain_grams_after: after == null ? 90 : after, contains: tags, deltaKcal: 60, deltaProtein: 8, deltaCarbs: 2, deltaFats: 3, deltaFiber: 0 });
const contentsReason = r => /^contents/.test(Object.keys(r || {}).join(' ')) || /"contents/.test(JSON.stringify(r || {}));

// ---------- S1-S2: plant milks, creams, curds and nut butters (safety audit of 530a503, B1) ----------
// Every plant word the old rule knew before every dairy word it knew, in nine frames, tags stripped (the word net alone decides). Shown
// only where this test's own list names the product, and never where the rice ends another dish ("Brown rice milk rice", "Jeera rice
// milk") or a nut butter is a butter masala ("Almond butter masala"). The products, named one by one: a plant word before a dairy word is
// not one ("Rice curd", "Peanut curd", "Cashew butter").
{ const PLANTOK = ['coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk', 'rice milk', 'cashew milk', 'coconut cream', 'cashew cream', 'peanut butter', 'almond butter',
    'soy curd', 'soya curd', 'coconut yogurt', 'coconut yoghurt', 'soy yogurt', 'soya yogurt'];
  const LEFT = ['coconut', 'almond', 'oat', 'soy', 'soya', 'rice', 'cashew', 'peanut'], RIGHT = ['milk', 'curd', 'yogurt', 'yoghurt', 'cream', 'butter'];
  const FRAMES = ['X Y', 'X Y rice', 'X Y masala', 'brown X Y rice', 'X Y with roti', 'X Y curry', 'dal X Y', 'jeera X Y', 'fried X Y'], TAIL = /^(?:brown|dal|jeera|fried) /;
  const NUTS = ['almond', 'cashew', 'peanut'], SOYW = ['soy', 'soya'];
  let shownV = 0;
  for (const f of FRAMES) for (const x of LEFT) for (const y of RIGHT) { const name = cap(f.replace('X', x).replace('Y', y)), prod = PLANTOK.includes(x + ' ' + y);
    // a plant cream or nut butter before a dish word reads as dairy (coordinator's default, fix-r12): "Cashew cream masala", "Peanut butter curry";
    // fail closed (fix-r13): a word before the product that is not in its set ("dal", "jeera", "fried", "brown") keeps the dairy word, for
    // every product, as "rice" ending a rice dish did before; test/safety/carve.js reads every neighbour
    const plantOK = prod && !TAIL.test(f) && !(/^(?:cream|butter)$/.test(y) && /^X Y (?:rice|masala|curry)$/.test(f));
    for (const [o, want] of [[{ diet: 'vegan' }, plantOK], [{ leave: ['dairy'] }, plantOK], [{ leave: ['nut'] }, !NUTS.includes(x)], [{ leave: ['soya'] }, !SOYW.includes(x)]]) {
      const r = plateOffered(o, withItem(name, ['plain'], ['plain'])); if (o.diet === 'vegan' && r.ok) shownV++;
      add('S1-S2 plant products: named one by one (grid, tags stripped)', r.ok === want, `${JSON.stringify(o)}: "${name}" was ${r.ok ? 'shown' : 'dropped'} (${r.why || ''}), expected ${want ? 'shown' : 'dropped'}`); } }
  add('S1-S2 plant products: the grid shows the named products (control)', shownV >= 70, `only ${shownV} plant-product cells shown to a vegan client`);
  // the audit's names, and the products that still pass
  for (const [name, o, want] of [['Brown rice curd rice', { diet: 'vegan' }, false], ['Brown rice curd rice', { leave: ['dairy'] }, false], ['Red rice curd rice', { diet: 'vegan' }, false], ['Rice curd', { leave: ['dairy'] }, false],
    ['Rice curd and pickle', { diet: 'vegan' }, false], ['Leftover rice curd mix', { leave: ['dairy'] }, false], ['Rice yogurt bowl', { diet: 'vegan' }, false], ['Curd rice', { diet: 'vegan' }, false], ['Peanut curd rice', { diet: 'vegan' }, false],
    ['Cashew butter masala', { diet: 'vegan' }, false], ['Cashew butter masala', { leave: ['dairy'] }, false], ['Almond butter masala', { diet: 'vegan' }, false],
    ['Cashew cream masala', { diet: 'vegan' }, false], ['Coconut cream masala', { leave: ['dairy'] }, false], ['Peanut butter curry', { diet: 'vegan' }, false], ['Almond butter rice', { diet: 'vegan' }, false],
    ['Cashew cream gravy', { diet: 'vegan' }, false], ['Coconut cream korma', { diet: 'vegan' }, false], ['Cashew cream makhani', { leave: ['dairy'] }, false], ['Coconut cream curry', { diet: 'vegan' }, false],
    ['Coconut milk korma', { diet: 'vegan' }, true], ['Coconut milk rice', { diet: 'vegan' }, true], ['Coconut cream', { diet: 'vegan' }, true],
    ['Coconut milk curry', { diet: 'vegan' }, true], ['Rice milk porridge', { diet: 'vegan' }, true], ['Oats in rice milk', { diet: 'vegan' }, true], ['Oat milk porridge', { diet: 'vegan' }, true], ['Soy curd rice', { diet: 'vegan' }, true],
    ['Almond butter toast', { diet: 'vegan' }, true], ['Peanut butter toast', { diet: 'vegan' }, true], ['Thin coconut milk', { leave: ['dairy'] }, true],
    ['Almond milk', { leave: ['nut'] }, false], ['Soy milk', { leave: ['soya'] }, false], ['Peanut butter toast', { leave: ['nut'] }, false]]) {
    const r = plateOffered(o, withItem(name, ['plain'], ['plain']));
    add('S1-S2 plant products: the audit\'s names (tags stripped)', r.ok === want, `${JSON.stringify(o)}: "${name}" was ${r.ok ? 'shown' : 'dropped'}, expected ${want ? 'shown' : 'dropped'}`); }
  // a name is read apart from the next: a rice milk after another item is still a product
  { const m = platePlain(); m.items[2] = { food: 'Rice milk', grams: 100, group: 'other', contains: ['plain'] }; add('S1-S2 names are read apart', plateOffered({ diet: 'vegan' }, m).ok, 'vegan: "Jowar roti" then "Rice milk" was read as "roti rice milk"'); } }

// ---------- every other carve-out read before the word lists (fix-r12; fail closed since fix-r13) ----------
// The hand-picked frames of fix-r12 (rice and millet flatbreads, noodles and bread, plant keema, butter beans, sol kadhi, rice cakes, sugar
// snap, lemon or amla juice, negation, -free) are replaced by test/safety/carve.js, which generates its cells from the lexicon's lists and
// the recorded names (safety audit of 9dd1b13, B1: the frames missed a fruit before lemon or lime juice). Each exemption takes its listed
// word off only when the word next to it is in its own allowed set; the TRACKED cells of fix-r12 ("Coconut rice cakes", "Orange and lemon
// juice", "Carrot and amla juice") are now dropped and asserted there.
{   // the referral exclusions: a kidney or pregnancy word beside the bean, corn or colour word still refers; the food text alone does not
  const refersT = (t) => { const pl = plan('meals', { profile: BASE, ctx: { meal: 'lunch', text: t } }); return !!(pl.reply && pl.reply.status === 'refer'); };
  for (const [t, want] of [['kidney beans curry', false], ['Kidney bean salad for lunch', false], ['weak kidney beans ok?', true], ['kidney, beans ok for dinner?', true], ['kidney beans for my kidney', true],
    ['I have kidney stones, kidney beans ok', true], ['kidney beans with CKD', true], ['baby corn manchurian', false], ['delivered a baby corn soup', false], ['delivered a baby, corn soup ok?', true],
    ['delivered my baby last week, baby corn ok?', true], ['tri-colour salad', false], ['third tri, colour salad?', true], ['third trimester tri-colour salad', true],
    // "prego" is the sauce only beside a sauce or pasta word (fix-r12): a pasta word elsewhere in the text does not cancel the referral
    ['prego here, white sauce pasta ok?', true], ['I am prego, can I have pasta tonight', true], ["I'm prego and craving noodles", true], ['prego, pizza tonight?', true], ['I am prego. Prego sauce pasta ok?', true],
    ['Pasta with Prego sauce', false], ['Prego pasta with salad', false], ['Prego sauce pasta', false], ['prego pasta sauce for dinner', false], ['Prego traditional sauce with penne', false]])
    add('S7 exclusions read only their own food (frame grid)', refersT(t) === want, `"${t}" ${want ? 'went to the model' : 'was referred'}`); }

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
      const rc = rescueOut(o, 'Veg thali', { name: 'Veg thali' }, [{ title: 'Add 100 g ' + name + ' first', kind: 'sequence', contains: [tag], deltaKcal: 120, deltaProtein: 6, deltaCarbs: 6, deltaFats: 6, deltaFiber: 1 }, WALK]);
      add('D1 held-out, Rescue move', !(rc.hacks || []).some(h => h.title.includes(name)), `${JSON.stringify(o)}: Rescue move adding "${name}" (${tag}) was offered`);
      const rd = rescueOut(o, 'Thali', { name: 'Thali with ' + name, contains: ['grain', tag] }, [WALK]);
      add('D1 held-out, Rescue dish', !rescueShown(rd).toLowerCase().includes(name.toLowerCase()), `${JSON.stringify(o)}: Rescue showed the model's dish "Thali with ${name}" (${tag}), not typed: ${rescueShown(rd)}`);
    } } }
// honest tags on a harmless name are dropped too: the tag, not the name, is what counts
for (const [tag, bars] of Object.entries(BARS)) for (const o of bars) {
  add('D1 tags on a harmless name', !plateOffered(o, withItem('Green bowl', [tag])).ok, `${JSON.stringify(o)}: "Green bowl" tagged ${tag} was offered`); }
// an unknown tag, or no list at all, fails closed; a plain dish with an empty list is believed
add('D1 fail closed', !plateOffered({ diet: 'veg' }, withItem('Paneer bhurji', ['vegetarian'])).ok, 'an unknown tag was accepted');
add('D1 plain food kept', plateOffered({ diet: 'jain', leave: ['dairy', 'nut', 'wheat', 'soya'], health: 'diabetes', bp: true }, withItem('Sprouted moong with cucumber', ['plain'])).ok, 'plain sprouted moong with cucumber, declared plain, was dropped');
// held-out names that must not be hidden: honest tags with nothing the profile bars
const NH = { meat: { diet: 'veg' }, dairy: { leave: ['dairy'] }, wheat: { leave: ['wheat'] }, soya: { leave: ['soya'] }, onion_garlic: { diet: 'jain' }, root_veg: { diet: 'jain' }, salty_side: { health: 'bp' }, sweet: { health: 'diabetes' }, nuts: { leave: ['nut'] } };
const NHTAGS = { 'Sol kadhi with coconut milk': ['onion_garlic'], 'Coconut milk curry': ['onion_garlic'], 'Peanut chutney': ['nuts'], 'Coconut chutney': [], 'Hing tadka dal': [], 'Lauki sabzi': [], 'Cucumber raita': ['dairy'], 'Sprouts salad': [], 'Roasted chana': [], 'Sugar snap peas': [], 'Soya keema': ['soya', 'onion_garlic'], 'Mushroom keema': ['onion_garlic'], 'Kathal keema': ['onion_garlic'], 'Jackfruit biryani': ['grain', 'onion_garlic'], 'Veg seekh kebab': ['onion_garlic'], 'Rice noodles': ['grain'],
  'Kuttu puri': ['grain'], 'Singhara puri': [], 'Jowar bread': ['grain'], 'Ragi dosa': ['grain'], 'Bajra roti': ['grain'], 'Makki di roti': ['grain'], 'Puffed rice cakes': ['grain'], 'Sweet corn soup': ['grain'], 'Rajma curry': ['onion_garlic'], 'Chana masala': ['onion_garlic'] };
for (const [tag, names] of Object.entries(HO.notHidden)) for (const name of names) { const o = NH[tag]; const tags = NHTAGS[name] || [];
  // round 5: a dish with none of the tags declares "plain" (an empty list is dropped, the literal rule)
  const r = plateOffered(o, withItem(name, tags.length ? tags : ['plain']));
  add('D1 no false hit (held-out)', r.ok, `${JSON.stringify(o)}: "${name}" was hidden (${r.why})`); }

// ---------- the script rule: text the checks cannot read is not shown ----------
for (const [tag, names] of Object.entries(HO.script)) for (const name of names) { const o = BARS[tag][0];
  add('D1 script', !plateOffered(o, withItem(name, [tag], [])).ok && !plateOffered({}, withItem(name, [], [])).ok, `"${name}" was shown as a plate item`); }

// ---------- no held-out name is in the engine ----------
{ const src = (fs.readFileSync(path.join(__dirname, '../../src/v5/core.js'), 'utf8') + fs.readFileSync(path.join(__dirname, '../../src/v6/engine.js'), 'utf8')).toLowerCase();
  for (const [k, v] of Object.entries(HO)) { if (k === 'notHidden') continue; const list = Array.isArray(v) ? v : [].concat(...Object.values(v));
    for (const n of list) { const l = n.toLowerCase(); add('held-out names stay out of the engine', !new RegExp('(?<![a-z\\u0900-\\u0bff])' + l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z\\u0900-\\u0bff])').test(src), `"${n}" (${k}) appears in src/v5/core.js or src/v6/engine.js`); } } }

// ---------- S1-S4 on whole replies through plan(kind).check(), the word net alone (tags that leave the food out) ----------
const plateWith = (food, madeOf) => { const m = J(fx.meals.meals[0]); m.title = 'Dal with ' + food; m.items[1] = { food: cap(food), grams: 80, group: 'carbs', contains: ['grain'] }; m.grain = { food: cap(food), made_of: madeOf, grams: 80 }; return m; };
for (const t of L.wheat) { const c = checkMeal(plateWith(plural(t), 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, `wheat left out, plate "Dal with ${plural(t)}" was offered`); }
{ const c = checkMeal(plateWith('soft flatbread', 'whole wheat'), prof({ leave: ['wheat'] })); add('S1 plate', !c.meal, 'wheat left out, "soft flatbread" made of whole wheat was offered'); }
for (const t of L.meat) { const m = J(fx.meals.meals[0]); m.items[0] = { food: cap(plural(t)) + ' tikka', grams: 150, group: 'protein', contains: [] }; const c = checkMeal(m, prof({ diet: 'veg' })); add('S2 plate', !c.meal, `vegetarian, plate with "${m.items[0].food}" was offered`); }
// each shown field on its own: a plate's for_you, pairing tip and read line (fields are blanked, the plate stays)
{ const pl = plan('meals', { profile: Object.assign({}, BASE, { leave: ['dairy'] }), ctx: { meal: 'lunch' } });
  const m = platePlain(); m.for_you = 'A light plate with ghee on the roti.'; m.why = [{ pair: 'Jowar roti + paneer', effect: 'The paneer adds protein to the meal.' }]; m.cuisine = 'Ghee-rich Punjabi';
  const r = pl.check({ status: 'ok', refer_reason: 'none', read: 'A dairy day: paneer and ghee help.', meals: [m] }), x = (r.meals || [])[0] || {};
  // usefulness brief: the "why" line is back, written by the engine; the model's for_you, pairing tip, read and cuisine never show
  add('S1 shown fields', !!x.title && !/ghee|paneer/i.test(x.forYou || '') && !crosses(x.forYou || '', prof({ leave: ['dairy'] })) && !(x.why || []).length && !r.read && !x.cuisine, `dairy left out: for_you "${x.forYou}", why ${JSON.stringify(x.why)}, read "${r.read}", cuisine "${x.cuisine}"`); }
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
  // (fix-r15, the figure rule) 700 kcal with 160 g carbs leaves fats under 0: a figure out of range is not helped, where it was read as 0 g
  if (fats < 0) { add('S5 rescue engine moves', r.status !== 'ok', `diabetes ${kcal} kcal ${carbs} g carbs: a dish with ${fats} g fats was helped`); continue; }
  add('S5 rescue engine moves', r.status === 'ok' && (r.hacks || []).every(h => h.kind !== 'portion' || -h.deltaCarbs <= carbs * 0.5) && (r.hacks || []).every(h => !/rice|roti|bread or rice/.test(h.title) || /last/.test(h.title)), `diabetes ${kcal} kcal ${carbs} g carbs: ${JSON.stringify((r.hacks || []).map(h => h.title + ' ' + h.deltaCarbs))}`); }
{ const r = rescueOut({ health: 'diabetes' }, 'Rajma chawal', { name: 'Rajma chawal', kcal: 1400, carbs: 100, protein: 24, fats: 101 }, []);
  add('S5 rescue no false hit', (r.hacks || []).some(h => h.kind === 'portion'), `diabetes: a 1400 kcal order got no portion move (${JSON.stringify(r.hacks)})`); }

// ---------- S6: on insulin or sugar tablets (or not sure) ----------
for (const meds of ['yes', 'unsure']) { const p = readProfile(Object.assign({}, BASE, { diet: 'veg', health: 'diabetes', meds }));
  for (const meal of ['breakfast', 'lunch', 'dinner']) for (const k of [0, 300, 600, 900, 1100, 1500]) for (let ap = 1; ap <= 10; ap++) {
    const before = meal === 'breakfast' ? [] : [{ meal: 'breakfast', kind: 'had', kcal: k, protein: 20 }];
    const pl = planDay(p, { today: { meals: before, fiber: 0, kcal: k } }, meal, ap);
    add('S6 target', pl.target.kcal >= pl.usual.kcal, `${meds}, ${meal}, ${k} kcal eaten before, appetite ${ap}: target ${pl.target.kcal} under usual ${pl.usual.kcal}`); } }
{ // D2: a plate, a swap or a change under the meal's usual size is dropped, with and without body figures
  for (const body of [{}, { cm: 0, kg: 0, age: 0 }]) for (const meds of ['yes', 'unsure']) {
    const o = Object.assign({ health: 'diabetes', meds }, body), small = platePlain(); ['kcal', 'protein', 'carbs', 'fats', 'fiber'].forEach(k => small[k] = Math.round(small[k] * 0.5)); small.items.forEach(i => i.grams = Math.round(i.grams * 0.5)); small.grain.grams = 45;
    add('S6 plate', !plateOffered(o, small).ok, `${JSON.stringify(o)}: a 250 kcal lunch plate was offered`);
    const t = tuneOut(o, 'lunch', { glucose: Object.assign(NOTE('Halve the dal and add 100 g cucumber.', ['grain']), { deltaKcal: -200, deltaProtein: -10, deltaCarbs: -10, deltaFats: -8 }) });
    add('S6 one-tap change', !Object.keys(t.alchemy || {}).length, `${JSON.stringify(o)}: a change taking the lunch plate 200 kcal lower was offered`);
    // at-risk sample: on medicines the prompt states the floor as a minimum, never as a centre to land within 10 percent of (plates)
    for (const kind of ['meals']) { const pr = plan(kind, { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', text: undefined } }).prompt || '', u = medsUsual(readProfile(Object.assign({}, BASE, o)), 'lunch');
      const m = /at least (\d+) kcal(?:, never below| \(never below)/.exec(pr);   // the target line, or with no body figures the medicines line
      add('S6 prompt states the floor as a minimum', !!m && +m[1] >= u && !/Target for this meal: about/.test(pr) && !/within 10 percent of the kcal target/.test(pr), `${JSON.stringify(o)} ${kind}: ${(/- Target for this meal:[^\n]*/.exec(pr) || ['no target line'])[0]}`); }
    add('S6 prompt', /usual size of this meal/.test(plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch' } }).prompt || ''), `${JSON.stringify(o)}: the plates prompt does not state the usual size`); }
  add('S6 no false hit', plateOffered({ health: 'diabetes', meds: 'no' }, platePlain()).ok, 'not on medicine: a 500 kcal lunch plate was dropped'); }

// ---------- safety audit of b4633dd, backlog head ("Fix found, then watch", owner, 16 Nov, D1): the names it found pass with a "plain" tag,
// so the word lists must hold them, as a plate item, under the profile that bars each ----------
const FOUND = [
  ...['Parathe', 'Paranthe', 'Rotiyaan', 'Chapatiyan', 'Puriyan', 'Samose', 'Theple', 'Rotiyon', 'Puriyon', 'Bati', 'Dal bati', 'Luchchis', 'Aloo parathe', 'Dal bati churma'].map(n => [n, { leave: ['wheat'] }]),
  ...['Bhindi Do Pyaza', 'Paneer do pyaza', 'Lasooni palak', 'Lasooni dal tadka', 'Piyaji'].map(n => [n, { diet: 'jain' }]),
  ...['Sweet lassi', 'Mango lassi', 'Mango shake'].map(n => [n, { health: 'diabetes' }]), ...['Chikki', 'Kadalai mittai'].map(n => [n, { leave: ['nut'] }])];
for (const [n, o] of FOUND) {
  add('Found gaps (safety audit of b4633dd): a plate item with a "plain" tag', !plateOffered(o, withItem(n, ['plain'])).ok, `${JSON.stringify(o)}: plate item "${n}" tagged plain was offered`);
  add('Found gaps (safety audit of b4633dd): offered to a client the rule does not bar (control)', plateOffered({}, withItem(n, ['plain'])).ok, `plate item "${n}" tagged plain was dropped with no rule`); }

// ---------- safety audit of 9dd1b13, the found words ("Fix found, then watch", D1; fix-r13): each fixed and tested, with a control ----------
{ const F13 = [
    ...['Dim Sheddo with rice', 'Dim Sheddho', 'Dim Shorshe', 'Dim poshto', 'Dim Dalna with roti'].map(n => [n, { diet: 'veg' }]),
    ...['Paneer Tikka Wrap', 'Soya Bhurji Wrap', 'Egg Bhurji Wrap with Mint Dahi', 'Veg wraps', 'Lettuce wrap'].map(n => [n, { leave: ['wheat'] }]),
    ...['Milkshake', 'Banana milkshake', 'Strawberry milkshake', 'Banana shake', 'Date shake', 'Mango smoothie', 'Thandai', 'Rose milk', 'Badam milk', 'Sweet pongal', 'Shakkarpara', 'Puran poli'].map(n => [n, { health: 'diabetes' }])];
  for (const [n, o] of F13) {
    add('Found words (safety audit of 9dd1b13): a plate item with a "plain" tag is dropped', !plateOffered(o, withItem(n, ['plain'])).ok, `${JSON.stringify(o)}: plate item "${n}" tagged plain was offered`);
    add('Found words (safety audit of 9dd1b13): offered to a client the rule does not bar (control)', plateOffered({}, withItem(n, ['plain'])).ok, `plate item "${n}" tagged plain was dropped with no rule`); }
  // "dim" alone, "dim sum" and "dimly" are not egg; "shake" alone is the verb of the recorded notes ("Shake sattu in cool water")
  for (const [t, o] of [['Veg dim sum', { diet: 'veg' }], ['Dim light dinner', { diet: 'veg' }], ['A dimly lit cafe thali', { diet: 'veg' }], ['Dim', { diet: 'veg' }], ['Shake sattu in cool water', { health: 'diabetes' }]])
    add('Found words (safety audit of 9dd1b13): no false hit', !crosses(t, prof(o)), `${JSON.stringify(o)}: "${t}" was ruled out`);
  // S9: the supplements shown with a "plain" tag; brand names that are English words count only as a whole name or before a drink word
  for (const n of ['Multivitamins', 'Complan', 'Whey', 'Whey shake', 'Protein bar', 'Electral', 'ORS', 'Becosules', 'Shelcal', 'Zincovit', 'Biotin', 'Folic acid', 'Pediasure', 'Boost drink', 'Boost', 'Ensure', 'Ensure milk', 'Soy protein isolate', 'Tang'])
    add('Found words (safety audit of 9dd1b13): a supplement with a "plain" tag is dropped (S9)', !plateOffered({}, withItem(n, ['plain'])).ok, `plate item "${n}" tagged plain was offered`);
  // the same names as a swap and as the item a one-tap change adds, tags "plain" (the item is read apart from the change's own words)
  for (const n of ['Ensure', 'Boost', 'Tang', 'Complan', 'Multivitamins', 'Protein bar', 'Whey']) {
    const t = tuneOut({}, 'lunch', { protein: Object.assign(NOTE('A drink with the meal.', ['plain']), { add_item: n, add_grams: 200 }) }, { protein: [{ food: n, grams: 150, contains: ['plain'], ...z }], base: [] });
    add('Found words (safety audit of 9dd1b13): a supplement is not offered as a swap or a one-tap add (S9)', !Object.keys(t.alchemy || {}).length && !((t.swaps || {}).protein || []).length, `tune offered "${n}": ${JSON.stringify(Object.keys(t.alchemy || {}))} ${JSON.stringify(((t.swaps || {}).protein || []).map(x => x.food))}`); }
  { const t = tuneOut({}, 'lunch', { protein: Object.assign(NOTE('A side to boost the protein.', ['plain']), { add_item: 'Boiled chana', add_grams: 80 }) });
    add('Found words (safety audit of 9dd1b13): a one-tap add whose note says "boost" is offered (control)', Object.keys(t.alchemy || {}).length === 1, 'the change "Add boiled chana" with the note "A side to boost the protein." was dropped'); }
  for (const t of ['Ensure thorough boiling of chickpeas.', 'Add 70 grams of fresh paneer to boost the protein.', 'Acidity enhances the tang of the chutney.', 'Sattu shake'])
    add('Found words (safety audit of 9dd1b13): no false hit (S9)', !supp(t), `"${t}" was read as a supplement`);
  // S8: measures that open a name, and the stubs
  for (const [n, want] of [['Bowlful dal', 'Dal'], ['Serving dal', 'Dal'], ['Karchi dal', 'Dal'], ['Plateful rice', 'Rice'], ['Glassful buttermilk', 'Buttermilk'], ['Cupful milk', 'Milk'], ['Scoop dal', 'Dal'], ['Portion rice', 'Rice'],
    ['Pcs paneer', 'Paneer'], ['Pieces chicken', 'Chicken'], ['Ladle sambar', 'Sambar'], ['Mutthi chana', 'Chana'], ['Kilo chicken', 'Chicken'], ['Litre buttermilk', 'Buttermilk'], ['Ml milk', 'Milk'],
    ['Half dozen almonds', 'Almonds'], ['Chammach bhar ghee', 'Ghee'], ['Katori bhar dal', 'Dal'], ['2 chammach bhar ghee', 'Ghee'],
    ['Portion control salad', 'Portion control salad'], ['Muthiya', 'Muthiya'], ['Vati dal khaman', 'Vati dal khaman'], ['Cup cake', 'Cup cake'], ['Glass noodles', 'Glass noodles']])
    add('Found words (safety audit of 9dd1b13): a measure that opens a name, and the stubs (S8)', safe(() => showName(n), '') === want, `"${n}" shows "${safe(() => showName(n), '')}", expected "${want}"`);
  // S7: the urgent phrasings, typed in each box, with and without medicines ticked; a medicine's name alone is not urgent
  const urgentOn = (kind, t, meds) => { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { health: 'diabetes', meds: meds ? 'yes' : 'no' }), ctx: { meal: 'lunch', text: t } }), {}); return !!(pl.reply && pl.reply.status === 'refer' && pl.reply.urgent); };
  for (const t of ['chest is paining', 'my chest is paining since morning', 'sine me dard ho raha hai', 'feeling shaky and sweaty', 'shaky and sweaty', 'dizzy and confused', 'left arm pain', 'pain in my left arm', 'gasping for breath'])
    for (const kind of ['meals', 'rescue', 'log']) for (const meds of [false, true]) add('Found words (safety audit of 9dd1b13): urgent phrasings are referred with the line to get help now (S7)', urgentOn(kind, t, meds), `${kind}, medicines ${meds ? 'yes' : 'no'}: "${t}" went to the model`);
  for (const t of ['glimepiride', 'metformin with dinner?', 'gliclazide 80', 'sweaty after the gym, light dinner', 'a shaky table at the dhaba'])
    add('Found words (safety audit of 9dd1b13): no false hit (S7)', !urgentOn('meals', t, false), `"${t}" was read as urgent`);
  // ---------- found items of the safety audit of 7eaadcf (backlog; D1 "Fix found, then watch"; fix-r14) ----------
  // S7: the 14 urgent phrasings it found, in each box, with and without medicines ticked; food text that shares a word stays unreferred
  for (const t of L.urgentFound14 || []) for (const kind of ['meals', 'rescue', 'log']) for (const meds of [false, true])
    add('Found words (safety audit of 7eaadcf): urgent phrasings are referred with the line to get help now (S7)', urgentOn(kind, t, meds), `${kind}, medicines ${meds ? 'yes' : 'no'}: "${t}" went to the model`);
  add('Found words (safety audit of 7eaadcf): the lexicon holds the 14 urgent phrasings', (L.urgentFound14 || []).length === 14, `${(L.urgentFound14 || []).length} listed`);
  for (const t of L.notUrgentFound14 || []) add('Found words (safety audit of 7eaadcf): no false hit (S7)', !urgentOn('meals', t, false), `"${t}" was read as urgent`);
  // S8: a size word before a measure that opens a name goes with it, generated from the engine's size and opening-measure lists
  for (const [n, want] of [['Full plate rice', 'Rice'], ['Full plate biryani', 'Biryani'], ['Full bowl dal', 'Dal'], ['Full glass buttermilk', 'Buttermilk'], ['Heaped spoon ghee', 'Ghee'], ['Level tsp ghee', 'Ghee'],
    ['Full fat curd', 'Full fat curd'], ['Full cream milk', 'Full cream milk'], ['Big bowl salad', 'Salad']])
    add('Found words (safety audit of 7eaadcf): a size before a measure that opens a name (S8)', safe(() => showName(n), '') === want, `"${n}" shows "${safe(() => showName(n), '')}", expected "${want}"`);
  { const sizes = MEASSIZE.replace(/^\(\?:|\)$/g, '').split('|'), meas = MEASOPEN.map(w => w.replace(/\(\?:[^)]*\)\?|\\w\*|\?/g, '').replace(/c\?/g, 'c').replace(/h\?/g, 'h'));
    for (const z of sizes) for (const m of meas) { const n = cap(z + ' ' + m + ' dal'), s = safe(() => showName(n), '');
      add('Found words (safety audit of 7eaadcf): every size before every opening measure goes (S8, generated)', s === 'Dal', `"${n}" shows "${s}"`); } }
  // S1, S2: every wheat and egg form of the S8 piece list (CNTPIECE) is in the food lists, so the two lists hold together. Each form is
  // classed here; a form the engine adds that is not classed fails, so a new piece word is read for its food first.
  { const expand = (src) => { const out = []; const alts = (s) => { const a = [], b = ''; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === '|' && !d) { a.push(cur); cur = ''; } else cur += ch; } a.push(cur); return a; };
      const forms = (s) => { if (!s) return ['']; const g = /^\(\?:([^()]*)\)(\?)?/.exec(s); if (g) { const rest = forms(s.slice(g[0].length)), opts = alts(g[1]).concat(g[2] ? [''] : []); return opts.flatMap(o => rest.map(r => o + r)); }
        const c = s.charAt(0), opt = s.charAt(1) === '?', rest = forms(s.slice(opt ? 2 : 1)); return (opt ? [c, ''] : [c]).flatMap(x => rest.map(r => x + r)); };
      for (const alt of alts(src.replace(/^\(\?:/, '').replace(/\)$/, ''))) out.push(...forms(alt)); return [...new Set(out)]; };
    const WHEAT = /^(?:rotis?|rotiya|rotiyaan|chapatiya|chapatiyan|chapatiyaan|puriya|puriyan|puriyaan|rotlis?|phulkas?|phulke|fulkas?|chapatis?|chapathis?|chapattis?|parathas?|paranthas?|puris?|pooris?|naans?|kulchas?|bhaturas?|theplas?|pavs?|buns?|breads?|toasts?|biscuits?|samosas?|kachoris?|momos?|parottas?|porottas?|khakhras?|parathe|parathon|paranthe|samose|samoson|bhature|bhaturon|kulche|kulchon|kachoriyan|kachoriyaan|kachoriyon|golgappe|golgappas?|luchis?|luchchis?|littis?|baatis?|batis?|theple|rotiyon|puriyon|chapatiyon|rotliyan|rotliyaan)$/;
    const EGG = /^(?:eggs?|yolks?|anda|ande|anday|andey|andon)$/;
    // not wheat or egg by default, each with its reason: rice, pulse, millet, sweet and fruit pieces; rotla, rotle and bhakri are millet
    // flatbreads (bajra, jowar) the grain list reads; "rotti" names rice rotis in the south ("Kori rotti" is tracked); "whites" alone is no food word
    const OTHER = /^(?:rotlas?|rotle|bhakris?|bhakriyan|bhakriyaan|rottis?|idlis?|idlies|idliyan|idliyaan|idliyon|dosas?|dose|doson|uttapams?|appams?|vadas?|wadas?|vade|wade|vadon|pakoras?|pakode|pakore|pakodon|pakodis?|pakodiyan|pakodiyaan|pakodiyon|cutlets?|kebabs?|tikkis?|tikkiyan|tikkiyaan|chillas?|cheelas?|chille|cheele|ladoos?|laddoos?|laddus?|dhoklas?|dhokle|idiyappams?|pathiris?|puttus?|kozhukattais?|modaks?|thalipeeths?|apples?|bananas?|oranges?|whites?)$/;
    const HELD = new Set(HO.wheat.concat(HO.egg).map(x => x.toLowerCase()));   // a held-out name stays out of the engine, so its form is not required
    const forms = expand(CNTPIECE); const wf = prof({ leave: ['wheat'] }), vg = prof({ diet: 'veg' });
    add('Found words (safety audit of 7eaadcf): the piece list was read', forms.length > 150, `${forms.length} forms`);
    for (const f of forms) { if (HELD.has(f)) continue;
      const cls = WHEAT.test(f) ? 'wheat' : EGG.test(f) ? 'egg' : OTHER.test(f) ? 'other' : null;
      add('Found words (safety audit of 7eaadcf): every form of the S8 piece list is classed as wheat, egg or other', !!cls, `"${f}" is in CNTPIECE and in no class of this test`);
      if (cls === 'wheat') add('Found words (safety audit of 7eaadcf): every wheat form of the piece list is in the wheat list (S1)', crosses(cap(f), wf), `"${f}" was not read as wheat`);
      if (cls === 'egg') add('Found words (safety audit of 7eaadcf): every egg form of the piece list is in the egg list (S2)', crosses(cap(f), vg), `"${f}" was not read as egg`); }
    for (const [n, o] of [['Andey ki bhurji', { diet: 'veg' }], ['Do andey', { diet: 'veg' }], ['Wholewheat bhakri', { leave: ['wheat'] }], ['Spelt flatbread', { leave: ['wheat'] }], ['Durum pasta', { leave: ['wheat'] }],
      ['Multigrain bhakri', { leave: ['wheat'] }], ['Wholemeal toast', { leave: ['wheat'] }], ['Kachoriyan', { leave: ['wheat'] }], ['Golgappe', { leave: ['wheat'] }], ['Two yolks', { diet: 'veg' }]])
      add('Found words (safety audit of 7eaadcf): the audit\'s names are read (S1, S2)', crosses(n, prof(o)), `${JSON.stringify(o)}: "${n}" was not read`); } }

// ---------- S13: the engine's own drop of a plate or dish whose figures disagree (safety audit of 7eaadcf, m4; fix-r14) ----------
// The tests ran combinations on plates whose base agrees, so the drop could go with no test failing. A plate at 900 kcal with macros worth
// about 500 is dropped by the engine itself, on the plate path, the tune path's kept plate and Rescue; one that agrees is offered.
{ const bad = () => Object.assign(platePlain(), { kcal: 900, protein: 22, carbs: 70, fats: 14 }), good = () => platePlain();
  const P = prof({}); add('S13 the engine drops a plate whose figures disagree', JSON.stringify(checkMeal(bad(), P)) === '{"drop":"energy"}', JSON.stringify(checkMeal(bad(), P)).slice(0, 120));
  add('S13 control: a plate whose figures agree is offered', !!checkMeal(good(), P).meal, JSON.stringify(checkMeal(good(), P)).slice(0, 120));
  const pl = plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }); add('S13 the plate path drops it', (pl.check(mealsReply(bad())).meals || []).length === 0 && (pl.check(mealsReply(good())).meals || []).length === 1, 'the disagreeing plate was offered, or the control was not');
  const shown = (pl.check(mealsReply(good())).meals || [])[0], kept = Object.assign(J(shown), { kcal: 900 });
  add('S13 the tune path refuses a kept plate whose figures disagree', !!plan('tune', { profile: BASE, slot: 'lunch', meal: shown }).check && !!plan('tune', { profile: BASE, slot: 'lunch', meal: kept }).error, 'the tune path took a kept plate at 900 kcal with macros worth about 500');
  const rp = plan('rescue', { profile: BASE, ctx: { meal: 'dinner', text: 'Veg thali' } }), dish = (k) => ({ status: 'ok', refer_reason: 'none', dish: { name: 'Veg thali', portion: 'about 450 g', kcal: k, protein: 20, carbs: 80, fats: 20, fiber: 8, contains: ['grain'] } });
  add('S13 Rescue drops a dish whose figures disagree', rp.check(dish(1100)).status !== 'ok' && rp.check(dish(580)).status === 'ok', 'Rescue helped a dish at 1100 kcal with macros worth about 580, or refused the control'); }

// ---------- the caps on their own (fix-r14; drop over the cap): honest elements, nothing barred, so only the cap can drop them ----------
{ const P = prof({}), pl = plan('meals', { profile: BASE, ctx: { meal: 'lunch' } });
  const withItems = (n) => { const m = platePlain(); while (m.items.length < n) m.items.push({ food: 'Cucumber slices', grams: 20, group: 'greens', contains: ['plain'] }); return m; };
  add('S10 cap: a plate with eight honest items is dropped, never cut to seven', !checkMeal(withItems(8), P).meal && (pl.check(mealsReply(withItems(8))).meals || []).length === 0, 'an eight-item plate was offered');
  add('S10 cap control: a plate with seven items is offered', !!checkMeal(withItems(7), P).meal, 'a seven-item plate was dropped');
  const lp = plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal and roti' } }), logR = (n) => ({ status: 'ok', refer_reason: 'none', items: Array.from({ length: n }, () => ({ food: 'dal', grams: 50, group: 'protein' })), kcal: 400, protein: 20, carbs: 50, fats: 12, fiber: 8 });
  add('log cap: nine items drop the reply, eight are read', lp.check(logR(9)).status !== 'ok' && lp.check(logR(8)).status === 'ok', 'a log reply with nine items was read, or one with eight was not');
  const many = (n) => Object.assign(platePlain(), { swaps: { protein: Array.from({ length: n }, (_, i) => ({ food: i ? 'Moong dal' : 'Sprouted moong', grams: 200, contains: ['plain'], deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 })), base: [] } });
  add('swap cap: four in a list drop the list, three are offered', checkMeal(many(4), P).meal.swaps.protein.length === 0 && checkMeal(many(3), P).meal.swaps.protein.length === 3, 'a list of four swaps was cut, or three were not offered');
  const tw = (a) => (pl.check(mealsReply(Object.assign(platePlain(), { taste: a }))).meals || [{}])[0].taste;
  add('taste cap: four taste words give none, three are shown', JSON.stringify(tw(['tangy', 'smoky', 'spicy', 'mild'])) === '[]' && tw(['tangy', 'smoky', 'spicy']).length === 3, 'four taste words were cut to three, or three were not shown');
  const r5 = (n) => ({ status: 'ok', refer_reason: 'none', meals: Array.from({ length: n }, () => platePlain()) });
  add('plates cap: a reply with five plates is not read, four are', (pl.check(r5(5)).meals || []).length === 0 && (pl.check(r5(4)).meals || []).length === 4, 'a reply with five plates was read');
  // the shape guards of the plate check, each on its own (found by the mutation run, fix-r14)
  add('a plate whose subtitle is not readable text is dropped (raw-field rule)', !checkMeal(Object.assign(platePlain(), { subtitle: '\u0926\u0942\u0927 \u0914\u0930 \u0930\u094B\u091F\u0940' }), P).meal && !checkMeal(Object.assign(platePlain(), { subtitle: 42 }), P).meal, 'a Devanagari or number subtitle was not dropped');
  add('a plate whose title, grain name or made_of is not text, or is over its cap, is dropped', ['title', 'grainFood', 'grainMade'].every(k => { const m = platePlain(); if (k === 'title') m.title = 7; else if (k === 'grainFood') m.grain.food = 'Jowar roti'.padEnd(201, 'x'); else m.grain.made_of = 'jowar'.padEnd(41, 'x'); return !checkMeal(m, P).meal; }), 'one was offered');
  add('a plate with one item is dropped (the shape rule)', !checkMeal(Object.assign(platePlain(), { items: [platePlain().items[0]] }), P).meal, 'a one-item plate was offered');
  add('a plate with a figure missing is dropped, fibre too (S13 reads kcal and macros; fibre has its own guard)', ['kcal', 'protein', 'carbs', 'fats', 'fiber'].every(k => { const m = platePlain(); delete m[k]; return checkMeal(m, P).drop === 'numbers'; }), 'a plate with a missing figure was offered, or dropped for another reason than "numbers"');
  const ch = (al) => (checkMeal(Object.assign(platePlain(), { alchemy: al }), P).meal || { alchemy: { x: 1 } }).alchemy;
  const add1 = (o) => ({ protein: Object.assign({ add_item: 'Roasted chana', add_grams: 40, minutes: 20, grain_grams_after: 90, contains: ['plain'], deltaKcal: 150, deltaProtein: 8, deltaCarbs: 20, deltaFats: 4, deltaFiber: 3 }, o) });
  add('a one-tap change: control, a food with its grams is offered', !!ch(add1({})).protein, 'the control change was dropped');
  add('a one-tap change whose food cannot be shown (over 40 letters, or not a name) is not offered', !ch(add1({ add_item: 'Roasted chana with a little chaat masala and lime' })).protein && !ch(add1({ add_item: '!!!' })).protein, 'the change was offered without its food');
  add('a one-tap change whose food has no grams is not offered', !ch(add1({ add_grams: undefined })).protein && !ch(add1({ add_grams: 'some' })).protein, 'the change was offered with no grams for its food');
  add('a one-tap change that is not an object is skipped, with no error', safe(() => Object.keys(ch({ protein: null, glucose: 'x', express: 7 })).length, -1) === 0, 'it threw or was offered');
  { const D = prof({ health: 'diabetes' }), m = Object.assign(platePlain(), { items: [{ food: 'Steamed rice', grams: 60, group: 'carbs', contains: ['grain'] }].concat(platePlain().items) }), c = checkMeal(m, D);
    add('S5 the declared grain is the item it names, not the first grain on the plate', !!c.meal && c.meal.grain.food === 'Jowar roti' && c.meal.grain.grams === 90, JSON.stringify(c.meal ? c.meal.grain : c)); }
  for (const kind of ['meals', 'rescue', 'log']) { const k = plan(kind, { profile: BASE, ctx: { meal: 'lunch', text: 'dal and roti' } });
    add('a reply that is not an object gives an error, with no throw', [null, 'ok', 7].every(r => { const o = safe(() => k.check(r), { threw: 1 }); return !o.threw && o.status === 'error'; }), kind); }
  add('taste notes: a health word on the closed list ("light") is not shown, and a word is shown once', JSON.stringify(tw(['light', 'tangy', 'smoky'])) === '["tangy","smoky"]' && JSON.stringify(tw(['tangy', 'tangy', 'smoky'])) === '["tangy","smoky"]', JSON.stringify(tw(['light', 'tangy', 'smoky'])) + ' ' + JSON.stringify(tw(['tangy', 'tangy', 'smoky'])));
  { const hp = plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }), ids = Object.keys(hp.check(mealsReply(platePlain())).hooks || {}), id = ids[0];
    const got = id ? (hp.check(mealsReply(Object.assign(platePlain(), { planned_around: [id, id] }))).meals || [{}])[0].planned : null;
    add('a hook cited twice is named once', !id || JSON.stringify(got) === JSON.stringify([id]), JSON.stringify(got)); }
  for (const kind of ['meals', 'rescue', 'log']) { const k = plan(kind, { profile: BASE, ctx: { meal: 'lunch', text: 'dal and roti' } });
    const body = kind === 'meals' ? mealsReply(platePlain()) : kind === 'rescue' ? { dish: { name: 'Dal', portion: 'about 300 g', kcal: 350, protein: 18, carbs: 45, fats: 10, fiber: 8, contains: ['plain'] } } : { items: [{ food: 'dal', grams: 200, group: 'protein' }], kcal: 350, protein: 18, carbs: 45, fats: 10, fiber: 8 };
    add('a reply with status "refer" is a referral whatever refer_reason says (S7)', k.check(Object.assign({}, body, { status: 'refer', refer_reason: 'none' })).status === 'refer', kind); }
  { const lg = plan('log', { profile: BASE, ctx: { meal: 'lunch', text: '2 roti and dal' } }), lr = (o, it) => Object.assign({ status: 'ok', refer_reason: 'none', items: it || [{ food: 'dal', grams: 200, group: 'protein' }], kcal: 350, protein: 18, carbs: 45, fats: 10, fiber: 8 }, o);
    add('log: a reply with a figure missing is not read, fibre too', ['kcal', 'protein', 'carbs', 'fats', 'fiber'].every(f => lg.check(lr({ [f]: undefined })).status !== 'ok') && lg.check(lr({})).status === 'ok', 'a log reply with a missing figure was read');
    const items = lg.check(lr({}, [{ food: 'dal', group: 'protein' }, { food: '2 roti', grams: 140, group: 'carbs' }, { food: 'roti', grams: 140, group: 'carbs' }])).items || [];
    add('log: an item with no grams, or not in the name shape, is not listed', JSON.stringify(items.map(i => i.food)) === '["roti"]', JSON.stringify(items));
    for (const kind of ['meals', 'rescue', 'log', 'tune']) add('a request with no profile, no context or (log) no text is refused, with no error', [{}, { profile: BASE }, kind === 'log' ? { profile: BASE, ctx: { meal: 'lunch' } } : null].filter(Boolean).every(b => { const o = safe(() => plan(kind, b), { threw: 1 }); return !o.threw && o.error; }), kind); }
  { const rp = plan('rescue', { profile: BASE, ctx: { meal: 'dinner', text: 'Veg thali' } }), d = (o) => ({ status: 'ok', refer_reason: 'none', dish: Object.assign({ name: 'Veg thali', portion: 'about 450 g', kcal: 580, protein: 20, carbs: 80, fats: 20, fiber: 8, contains: ['grain'] }, o) });
    add('Rescue: a dish with a figure missing is not helped, fibre too', ['kcal', 'protein', 'carbs', 'fats', 'fiber'].every(f => rp.check(d({ [f]: undefined })).status !== 'ok') && rp.check(d({})).status === 'ok', 'a dish with a missing figure was helped, or the control was not'); }
  // the caps the second mutation set found unread (fix-r14): five hooks cited, a long log item, the grain found by its shown name
  { const HB = Object.assign({}, BASE, { focus: 'protein', health: 'diabetes', meds: 'yes' }), hf = { today: { meals: [{ meal: 'breakfast', kind: 'skipped' }], kcal: 0 } };
    const hp = plan('meals', { profile: HB, ctx: { meal: 'dinner', appetite: 2, hour: 22 }, file: hf }), ids = Object.keys(hp.check({ status: 'ok', refer_reason: 'none', meals: [] }).hooks || {});
    const big = Object.assign(platePlain(), { kcal: 900, protein: 40, carbs: 130, fats: 24 }), cite = (n) => ((hp.check(mealsReply(Object.assign(J(big), { planned_around: ids.slice(0, n) }))).meals || [{}])[0] || {}).planned;
    add('hooks cap: five cited hooks name none, four are named', ids.length >= 5 && JSON.stringify(cite(5)) === '[]' && (cite(4) || []).length === 4, `${ids.length} hooks offered: ${JSON.stringify(cite(5))} ${JSON.stringify(cite(4))}`); }
  { const long = 'masala dal with tadka and jeera rice and cucumber salad and roti', lg2 = plan('log', { profile: BASE, ctx: { meal: 'lunch', text: long + ' and ' + long } });
    const lr2 = (f) => ({ status: 'ok', refer_reason: 'none', items: [{ food: f, grams: 300, group: 'other' }, { food: 'roti', grams: 60, group: 'carbs' }], kcal: 700, protein: 25, carbs: 100, fats: 22, fiber: 10 });
    add('log item cap: an item name over 60 letters is not listed, even in the client\'s words', long.length > 60 && JSON.stringify((lg2.check(lr2(long)).items || []).map(i => i.food)) === '["roti"]', JSON.stringify(lg2.check(lr2(long)).items)); }
  { const D = prof({ health: 'diabetes' }), m = Object.assign(platePlain(), { items: [platePlain().items[0], { food: 'Jowar roti (2 pieces)', grams: 90, group: 'carbs', contains: ['grain'] }, platePlain().items[2]] }), c = checkMeal(m, D);
    add('S5 the declared grain is found by its shown name ("Jowar roti" for "Jowar roti (2 pieces)")', !!c.meal && c.meal.grain.food === 'Jowar roti', JSON.stringify(c)); }
  add('a plate that is not an object is dropped, with no error', safe(() => (pl.check({ status: 'ok', refer_reason: 'none', meals: [null, 'Dal', 7, platePlain()] }).meals || []).length, -1) === 1 && safe(() => (pl.check({ status: 'ok', refer_reason: 'none', meals: [[], platePlain()] }).meals || []).length, -1) === 1, 'a null, text, number or list plate threw or was offered'); }

// ---------- S7: referral ----------
const refers = (kind, t) => { const pl = plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }); return !!(pl && pl.reply && pl.reply.status === 'refer'); };
for (const kind of ['meals', 'rescue', 'log']) {
  for (const t of L.referText) add('S7 typed', refers(kind, t), `${kind}: "${t}" went to the model`);
  for (const t of HO.referText) add('S7 typed (held-out)', refers(kind, t), `${kind}: "${t}" went to the model`);
  for (const t of L.notReferText.concat([fxm.typed])) add('S7 no false hit', !refers(kind, t), `${kind}: "${t.slice(0, 40)}" was referred`);
  // the referral window's 29 phrasings refer, and food text that shares a word with them does not (owner, 16 Nov, D4; eval/referral/WINDOW.md)
  for (const t of L.referWindow) add('S7 typed (referral window, D4)', refers(kind, t), `${kind}: "${t}" went to the model`);
  // the same phrasings in their nearest spellings: each extension of the window's patterns has its own case (D4)
  for (const t of L.referWindowFamily) add('S7 typed (referral window spelling family, D4)', refers(kind, t), `${kind}: "${t}" went to the model`);
  for (const t of L.notReferWindow) add('S7 no false hit (referral window controls, D4)', !refers(kind, t), `${kind}: "${t}" was referred`);
  // spellings the safety audit of b4633dd found ("pregancy", "kednee", "dialyses", "morning sickness"; owner, 16 Nov, D1), and their food-text controls
  for (const t of L.referFound || []) add('S7 typed (found by the safety audit of b4633dd)', refers(kind, t) && refers(kind, t.split('').join('\u200B')), `${kind}: "${t}" went to the model`);
  for (const t of L.notReferFound || []) add('S7 no false hit (controls for the found spellings)', !refers(kind, t), `${kind}: "${t}" was referred`);
  // the spellings the safety audit of 530a503 found (backlog; owner, 16 Nov, D1 "Fix found, then watch"), and their food-text controls
  for (const t of L.referFound12 || []) add('S7 typed (found by the safety audit of 530a503)', refers(kind, t) && refers(kind, t.split('').join('\u200B')), `${kind}: "${t}" went to the model`);
  for (const t of L.notReferFound12 || []) add('S7 no false hit (controls for the 530a503 spellings)', !refers(kind, t), `${kind}: "${t}" was referred`);
  for (const t of L.urgentFound12 || []) { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }), {});
    add('B1 urgent text (found by the safety audit of 530a503): referred with the line to get help now', !!(pl.reply && pl.reply.status === 'refer' && pl.reply.urgent === URGENTLINE && !pl.prompt), `${kind}: "${t}" ${pl.reply ? JSON.stringify(pl.reply).slice(0, 80) : 'went to the model'}`); }
  for (const t of L.urgentFound || []) { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }), {});
    add('B1 urgent text (found by the safety audit of b4633dd): referred with the line to get help now', !!(pl.reply && pl.reply.status === 'refer' && pl.reply.urgent === URGENTLINE && !pl.prompt), `${kind}: "${t}" ${pl.reply ? JSON.stringify(pl.reply).slice(0, 80) : 'went to the model'}`); } }
// the model's refer_reason: any value but "none" is a referral, on every reply that answers typed text; a missing one fails closed
{ const P0 = Object.assign({}, BASE, { diet: 'veg' });
  const replies = { meals: (rr) => Object.assign(mealsReply(platePlain()), rr), rescue: (rr) => Object.assign(J(fx.rescue), rr, { dish: Object.assign({}, fx.rescue.dish, { name: 'Veg thali', contains: ['grain'] }) }), log: (rr) => Object.assign(J(fx.log), rr) };
  for (const kind of Object.keys(replies)) { const pl = plan(kind, { profile: P0, ctx: { meal: 'lunch', text: 'Veg thali' } });
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
{ const lg = safe(() => plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal rice' } }).check(Object.assign(J(fx.log), { assumed: 'A bowl of dal and 2 katori rice.' })), {});
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
for (const t of (L.supplement || []).concat(L.addedFromReports.supplement, ['Protinex shake', 'Ensure plus', 'iron pills', 'a vitamin C tablet', 'Horlicks', 'spirulina'])) {
  add('S9 word net (lying tag)', !plateOffered({}, withItem(cap(t), ['dairy'])).ok, `"${t}" tagged dairy (no supplement tag) was offered`);
  const r = rescueOut({}, 'Dal rice', { name: 'Dal rice' }, [{ title: 'Have ' + t + ' after the meal', kind: 'sequence', contains: ['dairy'], deltaKcal: 60, deltaProtein: 8, deltaCarbs: 6, deltaFats: 1, deltaFiber: 0 }, WALK]);
  add('S9 Rescue (word net)', !(r.hacks || []).some(h => h.title.includes(t)), `Rescue move with "${t}" was offered`); }
for (const t of ['The lemon brings vitamin C for the iron.', 'Flaxseeds bring omega 3 fats.', 'So the starch drops.']) add('S9 no false hit', !supp(t), `"${t}" was read as a supplement`);

const WALKNAMES = [];   // a few held-out names from every tag, and the auditor's own
for (const [tag, names] of Object.entries(HO)) if (BARS[tag]) names.filter((n, i) => i < 4 || /^(Mahi tikka|Mor|Nei|Piyaz chutney|Bheja|Raan|Baida roti|Misri|Cheeni|Meetha pulao|Complan|Threptin|Gongura pachadi)$/.test(n)).forEach(n => WALKNAMES.push([tag, n]));
// ---------- safety round 5: a planted token in every string field of every reply schema (walked from the schema, so a new field is covered) ----------
// A nonsense token, ZQXJ-shaped so no list can know it, is planted in each string field in turn. It may come back only where a name or the
// client's own text belongs: a plate item, a swap or a one-tap item. Everywhere else it must not appear.
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
const WALKS = [
  ['meals', (o) => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false } }), () => ({ status: 'ok', refer_reason: 'none', meals: [baseMeal()] }), (r) => (r.meals || []).length > 0],
  ['ask', (o) => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false, text: 'Something light' } }), () => ({ status: 'ok', refer_reason: 'none', meals: [baseMeal()] }), (r) => (r.meals || []).length > 0],
  ['tune', (o) => plan('tune', { profile: Object.assign({}, BASE, o), slot: 'lunch', meal: Object.assign(baseMeal(), { minutes: 20 }) }), () => { const m = baseMeal(); return { swaps: m.swaps, alchemy: m.alchemy }; }, (r) => r.status === 'ok' && Object.keys(r.alchemy || {}).length > 0],
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
    add('round 5 handler wrapper', /^act\(/.test(h), `a ${m[1]} handler that writes the log or composes is not wrapped in act(): ${h.slice(0, 120)}`);
    // the two "I'll have this" buttons log a composed plate or dish: their act() guard runs the composed state's own check first, plateWhy for
    // a plate and rescueWhy for a Rescue dish (safety audit of 7eaadcf, m1: either could go with no test failing; fix-r14)
    if (/^act\(/.test(h) && /logEv\("(?:had|rescued)"/.test(body)) { const g = argAt(h, 4).trim(), want = /logEv\("had"/.test(body) ? 'plateWhy(' : 'rescueWhy(';
      add('the log-time guard of each "I\'ll have this" runs the composed check (S5, S6, S13)', g !== 'null' && g.includes(want), `a handler that logs ${/logEv\("had"/.test(body) ? 'a plate' : 'a Rescue dish'} is guarded by ${g.slice(0, 80)}, not ${want}`); } }
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
  'Sweet Lassi Half Litre', 'Chicken Biryani Ek Kilo', 'Mutton Biryani (Half Kg)', 'Glass buttermilk', 'Bowl dal', 'Hundred grams paneer',
  // safety audit of b4633dd, m1 (mutation D19): a katori with no number, an "of" or an opening place, which only the final katori guard holds
  'Dal katori', 'Rice with katori dal', 'Dal served in katori', 'Curd katoriyan', 'Steel katori dal',
  // safety audit of b4633dd, backlog head: measures in forms the lists lacked
  'Ek katora dal', 'Do katore dal', 'Katora dal', 'Chammach ghee', 'Tsp ghee', 'Spoon ghee', 'Teaspoon ghee', 'Fistful of chana', 'Pinch salt', 'Pinch of salt',
  // safety audit of 530a503, M1 and c1: a digit count before a measure inside a name, an "of" after it, ranges, a measure at the end
  'Pav toasted with 1 teaspoon butter', '2 piece pav lightly toasted with 1 teaspoon butter', 'Paneer veg biryani cooked in 1 teaspoon oil', 'Dal with 1 chammach ghee', 'Poha with 2 tablespoons peanuts',
  'Khichdi with 1 tsp of ghee', 'Dal with 2 cups of rice', '2 to 3 idlis', '2-3 idlis', '2 or 3 idlis', 'Three to four idlis', 'Rice with three to four idlis', 'Ghee 1 teaspoon', 'Peanuts 1 handful', 'Paneer portion',
  'Bajra roti with 2 muthi peanuts', 'Dal with 1 small ladle ghee', 'Upma with 2 heaped tbsp of peanuts'];
// The test's own detector, beside COUNTWORDS (safety audit of ba4d8dc, M1: COUNTWORDS knew only the engine's own nouns, so it could not fail on a
// word the engine does not list). Any Hindi number word before any word is a count, but for the honest names listed here; a Hindi measure
// word or katori in any form, a weight word, or a measure word that opens a name is a household unit. Its lists are this test's, not the engine's.
const HINDICOUNT = /\b(?:ek|do|teen|char|chaar|panch|paanch|chhe|saat|aath|nau|das|dus|gyarah|barah|aadha|adha|dedh|dhai)[\s-]+(?!(?:pyaza|phoron|siu|ka|ki|ke)\b)[a-z]+/i;
// the household measures come from the one measure list the engine builds every count rule from (MEASW), with the lexicon's floor, read
// by the detector shared with test/safety/recorded.js (fix-r12; safety audit of 530a503, M1: this detector had a list of its own, which
// read teaspoon, handful or pinch only when they opened a name)
const S8BAD = require('./measure.js')(typeof MEASW === 'undefined' ? null : MEASW, L.measure);
// (digits are COUNTW's and the plate checks' own; here the engine's own figures, grams, kcal and minutes, are read past)
const HINDIMEAS = { test: (x) => !!S8BAD(String(x).replace(/\b\d+(?:\.\d+)?[\s\u00A0]*(?:g|kcal|minutes?)\b/g, ' ').replace(/\d/g, ' ')) };
const countShown = (x) => COUNTWORDS.test(x) || HINDICOUNT.test(x) || HINDIMEAS.test(x);
// every measure word of the lexicon's floor after a digit, inside a name, at its end, before "of" and in a range (safety audit of 530a503,
// M1: 36 of these showed their measure word); the shown name must hold no count, no measure and no stub (test/safety/measure.js)
for (const w of L.measure) for (const f of [`Dal with 2 ${w} ghee`, `Pav toasted with 1 ${w} butter`, `Ghee 1 ${w}`, `Rice with 2 ${w} of dal`, `Poha with 2 to 3 ${w} peanuts`]) {
  const shown = safe(() => showName(f), ''); add('S8 a digit count takes its measure from the one list', !S8BAD(shown), `"${f}" showed "${shown}" (${S8BAD(shown)})`); }
for (const [kind, mk, base] of WALKS) { if (kind === 'log') continue; const pl0 = mk({}); if (!pl0.check) continue;
  for (const pth of strPaths(pl0.schema).filter(x => NAMEF.test(x) && !/\.with$/.test(x))) for (const v of COUNTEDW) {
    const r = base(); setAt(r, pth, v); const pl = mk({ diet: 'nonveg' }, v.replace(/\s*\(.*\)/, '')); const out = safe(() => pl.check(r), {});
    const bad = allStr(out).filter(countShown);
    add('S8 no count written as a word in a shown name', !bad.length, `${kind}: "${v}" in ${pth} showed ${JSON.stringify(bad.slice(0, 2))}`); } }
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
  // safety audit of b4633dd, backlog head: katora, chammach, tsp, spoon, fistful and pinch go, the food stays
  ['Ek katora dal', 'Dal'], ['Do katore dal', 'Dal'], ['Katora dal', 'Dal'], ['Chammach ghee', 'Ghee'], ['Tsp ghee', 'Ghee'], ['Spoon ghee', 'Ghee'], ['Teaspoon ghee', 'Ghee'], ['Fistful of chana', 'Chana'], ['Pinch salt', 'Salt'], ['Pinch of salt', 'Salt'], ['1 fistful roasted chana', 'Roasted chana'], ['1 teaspoon ghee', 'Ghee'],
  // safety audit of ba4d8dc, c2: no stub is left by a count word ("Or rotis", "Minute poha" before)
  ['Two or three rotis', 'Rotis'], ['Ten-minute poha', 'Ten-minute poha'], ['Two-minute noodles', 'Two-minute noodles'], ['Seven Up', 'Seven Up'], ['Combo for Two', 'Combo'], ['Spinach folded in', 'Spinach folded in'],
  // safety audit of 530a503, M1 and c1: the count and its measure go, with the "of" after it, and the food stays; "muthia" is a dish
  ['2 piece pav lightly toasted with 1 teaspoon butter', 'Pav lightly toasted with butter'], ['Paneer veg biryani cooked in 1 teaspoon oil', 'Paneer veg biryani cooked in oil'], ['Khichdi with 1 tsp of ghee', 'Khichdi with ghee'],
  ['Dal with 2 cups of rice', 'Dal with rice'], ['Three to four idlis', 'Idlis'], ['2 to 3 idlis', 'Idlis'], ['2-3 idlis', 'Idlis'], ['Rice with three to four idlis', 'Rice with idlis'], ['Paneer portion', 'Paneer'],
  ['Steamed methi muthiya', 'Steamed methi muthiya'], ['Gram flour chilla', 'Gram flour chilla'], ['Cucumber slices', 'Cucumber slices'], ['Kala chana chaat bowl', 'Kala chana chaat bowl'],
  ['1 full fat curd', 'Full fat curd'], ['2 full cream milk', 'Full cream milk'], ['1 heaped tbsp ghee', 'Ghee'], ['Vati dal khaman', 'Vati dal khaman'], ['Dal vati', 'Dal vati'], ['Portion control salad', 'Portion control salad'],
  ['Coffee mug', 'Coffee mug'], ['Salt pinch', 'Salt'], ['Ghee teaspoon', 'Ghee'],
  ['Mug cake', 'Mug cake'], ['Glass noodles', 'Glass noodles'], ['Moong (green gram)', 'Moong (green gram)'], ['Dal bati churma', 'Dal bati churma'], ['Litti chokha', 'Litti chokha'], ['Kadhi pakode', 'Kadhi pakode'], ['Teen dal tadka', 'Teen dal tadka']]) {
  const m = platePlain(); m.items[2] = { food: raw, grams: 100, group: 'greens', contains: ['plain'] }; const r = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(m)), {});
  const it = (((r.meals || [])[0] || {}).items || []).map(i => i.food);
  add('S8 names are cleaned, not dropped', it.includes(shown), `"${raw}" showed ${JSON.stringify(it)}, not "${shown}"`); }
{ // a plate name shows no number at all (the prompt asks for none)
  const pr = safe(() => plan('meals', { profile: BASE, ctx: { meal: 'lunch' } }).check(mealsReply(withItem('Chicken 65', ['meat']))), {});
  add('S8 plate names show no number', !allStr(pr.meals || []).some(x => /\d/.test(x) && /chicken/i.test(x)), 'a plate item showed a number: ' + JSON.stringify(allStr(pr.meals || []).filter(x => /chicken/i.test(x)))); }
// every check still reads the raw name, brackets included: the canteen thali with papad and pickle is dropped for high blood pressure
for (const o of [{ health: 'bp' }, { health: 'diabetes', bp: true }]) {
  add('S3 brackets are read', !plateOffered(o, withItem('Veg thali (dal, sabzi, papad, pickle)', ['grain'])).ok, `${JSON.stringify(o)}: plate "Veg thali (dal, sabzi, papad, pickle)" was offered`); }
// singular forms of listed plurals (final audit): a wrong "plain" tag on a singular name is still caught by the word net
for (const [name, o] of [['Veg hakka noodle', { leave: ['wheat'] }], ['Banana chip', { health: 'bp' }], ['Potato wafer', { health: 'bp' }], ['Masala chip', { health: 'diabetes', bp: true }]])
  add('S1-S3 singular forms are read', !plateOffered(o, withItem(name, PT.length ? PT : ['grain'])).ok, `${JSON.stringify(o)}: "${name}" tagged plain was offered`);
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
// ---------- the figure rule (fix-r15; safety audit of c666d34, B1 and m5): a model figure is read as written, or its element is dropped ----------
// B1: on insulin or sugar tablets a swap's or a change's kcal delta past -400 was cut to -400 before the S6 line read it, so a plate under the
// usual size by the model's own figures was offered, and shown 40 to 50 kcal above what the model wrote. A plate 430 kcal over the usual
// size, figures that agree: a base swap of -440 kcal and a one-tap change of -450 kcal are not offered (on the plate path and the tune path);
// a swap of -390 and a change of -380 that keep the plate at the usual size are offered, each with the figure the model wrote.
{ const b1Plate = (K) => { const carbs = Math.round((K - 4 * 40 - 9 * 30) / 4);
    return { title: 'Moong dal with brown rice', prepMinutes: 25, contains: ['grain'], kcal: K, protein: 40, carbs, fats: 30, fiber: 14, grain: { food: 'Brown rice', made_of: 'brown rice', grams: 350 },
      items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: PT }, { food: 'Brown rice', grams: 350, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: PT }],
      swaps: { protein: [], base: [{ food: 'Brown rice', grams: 350, made_of: 'brown rice', contains: ['grain'], ...z }] }, alchemy: {}, planned_around: [], taste: [] }; };
  const ch = (dk, dp, dc, df) => ({ add_item: '', add_grams: 0, minutes: 20, grain_grams_after: 350, contains: PT, deltaKcal: dk, deltaProtein: dp, deltaCarbs: dc, deltaFats: df, deltaFiber: 0 });
  const both = (o, m) => { const pl = plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false } }), a = safe(() => pl.check(mealsReply(J(m))).meals[0], null);
    const kept = safe(() => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch', lite: false } }).check(mealsReply(Object.assign(J(m), { swaps: { protein: [], base: [] }, alchemy: {} }))).meals[0], null);
    const tp = kept && plan('tune', { profile: Object.assign({}, BASE, o), slot: 'lunch', meal: kept }), t = safe(() => tp.check({ swaps: m.swaps, alchemy: m.alchemy }), null);
    return [['plate path', a], ['tune path', t && t.status === 'ok' ? t : null]]; };
  for (const o of [{ health: 'diabetes', meds: 'yes' }, { health: 'diabetes', meds: 'unsure' }]) { const u = medsUsual(prof(o), 'lunch'), m = b1Plate(u + 430);
    m.swaps.base.push({ food: 'Bajra roti', grams: 80, made_of: 'bajra', contains: ['grain'], deltaKcal: -440, deltaProtein: -4, deltaCarbs: -80, deltaFats: -12, deltaFiber: 0 },
      { food: 'Jowar roti', grams: 90, made_of: 'jowar', contains: ['grain'], deltaKcal: -390, deltaProtein: -4, deltaCarbs: -70, deltaFats: -10, deltaFiber: 0 });
    m.alchemy = { gut: ch(-450, -10, -35, -30), express: ch(-380, -5, -50, -18) };
    for (const [where, c] of both(o, m)) {
      add('figure rule B1: a swap or change past -400 kcal is not offered on medicines', !!c && !c.swaps.base.some(s => s.food === 'Bajra roti') && !c.alchemy.gut, `${JSON.stringify(o)} ${where}, usual ${u}, plate ${u + 430}: ${c ? JSON.stringify([c.swaps.base.map(s => [s.food, s.deltaKcal]), Object.keys(c.alchemy).map(k => [k, c.alchemy[k].deltaKcal])]) : 'plate not offered'}`);
      add('figure rule B1: a swap and a change that keep the usual size are offered with the figure written (control)', !!c && c.swaps.base.some(s => s.food === 'Jowar roti' && s.deltaKcal === -390) && !!c.alchemy.express && c.alchemy.express.deltaKcal === -380, `${JSON.stringify(o)} ${where}: ${c ? JSON.stringify([c.swaps.base.map(s => [s.food, s.deltaKcal]), Object.keys(c.alchemy)]) : 'plate not offered'}`); } }
  // the same cut on the half-the-carbs rule (S5 as the app holds it): diabetes, lunch, a swap of -100 g carbs is not offered; -60 g is, as written
  { const o = { health: 'diabetes', meds: 'no' }, m = b1Plate(1100);
    m.swaps.base.push({ food: 'Bajra roti', grams: 80, made_of: 'bajra', contains: ['grain'], deltaKcal: -400, deltaProtein: -4, deltaCarbs: -100, deltaFats: 2, deltaFiber: 0 },
      { food: 'Jowar roti', grams: 90, made_of: 'jowar', contains: ['grain'], deltaKcal: -260, deltaProtein: -4, deltaCarbs: -60, deltaFats: 0, deltaFiber: 0 });
    for (const [where, c] of both(o, m)) add('figure rule B1: a carbs delta past its range is not offered, one inside it is, as written (S5)', !!c && !c.swaps.base.some(s => s.food === 'Bajra roti') && c.swaps.base.some(s => s.food === 'Jowar roti' && s.deltaCarbs === -60), `diabetes ${where}: ${c ? JSON.stringify(c.swaps.base.map(s => [s.food, s.deltaCarbs])) : 'plate not offered'}`); }
  // m5: an item's grams 0, null, "", -5, 1.5, "200" or a word drop the plate (they showed "1 g"); add_grams 0, null, "", -5 with a named food
  // drop the change (it showed "Add 1 g ..."); a protein delta of -22 drops the change (it showed -10); controls as written
  for (const g of [0, null, '', -5, 1.5, '200', 'x', 801]) { const m = platePlain(); m.items[2].grams = g; add('figure rule m5: an item weight that is not a weight drops the plate', !plateOffered({}, m).ok, `grams ${JSON.stringify(g)}: the plate was offered`); }
  { const m = platePlain(); m.items[2].grams = 1; add('figure rule m5: a 1 g item is offered as written (control)', plateOffered({}, m).ok, 'a 1 g item dropped the plate'); }
  for (const g of [0, null, '', -5, 501, 'x']) { const t = tuneOut({}, 'lunch', { protein: Object.assign(NOTE('', PT, 90), { add_item: 'Paneer cubes', add_grams: g }) });
    add('figure rule m5: an added food with no weight drops the change', !(t.alchemy || {}).protein, `add_grams ${JSON.stringify(g)}: ${JSON.stringify((t.alchemy || {}).protein && t.alchemy.protein.note)}`); }
  { const t = tuneOut({}, 'lunch', { protein: Object.assign(NOTE('', PT, 90), { add_item: 'Paneer cubes', add_grams: 60 }) }); add('figure rule m5: an added food with its weight is offered as written (control)', !!(t.alchemy || {}).protein && t.alchemy.protein.itemGrams === 60 && /Add 60\s+g paneer cubes/.test(t.alchemy.protein.note), JSON.stringify(t.alchemy)); }
  { const t = tuneOut({}, 'lunch', { gut: Object.assign(NOTE('', PT, 90), { deltaKcal: -100, deltaProtein: -22, deltaCarbs: 4, deltaFats: -3 }) }), t2 = tuneOut({}, 'lunch', { gut: Object.assign(NOTE('', PT, 90), { deltaKcal: -60, deltaProtein: -9, deltaCarbs: -4, deltaFats: -1 }) });
    add('figure rule m5: a change protein delta past -10 is not offered; one inside is, as written', !(t.alchemy || {}).gut && !!(t2.alchemy || {}).gut && t2.alchemy.gut.deltaProtein === -9, JSON.stringify([t.alchemy, t2.alchemy])); }
  // the log took a kcal more than a fifth off its macros and put its own figure in place; now that reply is not read (0 of 30 recorded)
  { const lg = plan('log', { profile: BASE, ctx: { meal: 'lunch', text: 'dal and rice' } }), r = (k) => lg.check({ status: 'ok', refer_reason: 'none', items: [{ food: 'dal', grams: 200, group: 'protein' }], kcal: k, protein: 18, carbs: 60, fats: 10, fiber: 6 });
    add('figure rule: the log shows the kcal written, or does not read the reply', r(900).status !== 'ok' && r(400).status === 'ok' && r(400).kcal === 400, JSON.stringify([r(900).status, r(900).kcal, r(400).kcal])); } }
add('Rescue: a supplement is not helped (S9)', rescueOut({},'Protein shake with whey protein', { name: 'Whey protein shake', contains: ['supplement'] }, []).status !== 'ok', 'a typed supplement was helped');

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
    // the kept-plate rule at load and render (fix-r14, found by the mutation run): pruneKept takes off every kept plate whose base fails its
    // own check (baseWhy: figures agree, S5, S6), and the whole reply when none is left; a stored entry that is not a reply is left alone
    { const ctx = { STORE: { res: { a: { rules: 'R', meal: 'lunch', meals: [{ items: [1], ok: 1 }, { items: [1] }, null, { ok: 1 }] }, b: { rules: 'R', meal: 'lunch', meals: [{ items: [1] }] },
        c: { rules: 'R', meal: 'lunch', meals: [{ items: [1], ok: 1 }] }, d: null, e: { rules: 'R', meal: 'lunch' }, f: { rules: 'R', meal: 'lunch', meals: [] } }, shown: { lunch: 'b' } },
      rules: () => 'R', baseWhy: (m) => m.ok ? '' : 'refused', UI: { sel: 2, alc: {}, swp: 0, swb: 0 } };
      const ok = run(['pruneKept'], ctx, '(pruneKept(), true)');
      add('kept plates: pruneKept takes off each plate whose base fails its check, and the reply when none is left', ok === true && ctx.STORE.res.a && ctx.STORE.res.a.meals.length === 1 && !ctx.STORE.res.b && ctx.STORE.shown.lunch === null
        && ctx.STORE.res.c.meals.length === 1 && 'd' in ctx.STORE.res && ctx.STORE.res.e && ctx.STORE.res.f, ok === null ? 'pruneKept not found or threw' : JSON.stringify(ctx.STORE));
      const ctx2 = { STORE: { res: { c: { rules: 'R', meal: 'lunch', meals: [{ items: [1], ok: 1 }] } }, shown: {} }, rules: () => 'R', baseWhy: () => '', UI: { sel: 1 } };
      add('kept plates: nothing taken off leaves the selection as it is', run(['pruneKept'], ctx2, '(pruneKept(), true)') === true && ctx2.UI.sel === 1, JSON.stringify(ctx2.UI)); }
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
    // m3, A11: a tab open past 4 am drops yesterday's Rescue and log answers
    { const UI = { rres: { status: 'ok' }, rmoves: { 0: true }, rtext: 'x', lres: { status: 'ok' }, ltext: 'x', lerr: 'x' };
      const ctx = { now: null, hr: 0, CLOCK: '', DAY: 'yesterday', dayOf: () => 'today', clockMeal: () => 'breakfast', C: { meal: 'dinner' }, STORE: {}, APP: {}, UI, FILE: null, buildFile: () => ({}), EV: [], PL: null, planDay: () => ({}), profileOut: () => ({}), appetite: () => 5, pruneKept: () => {}, HOOKS: null, hooksFor: () => ({}) };
      const f = run(['refresh'], ctx, 'refresh'); if (f) safe(() => f(), null);
      add('m3 app S12: a new day drops yesterday\'s Rescue and log answers', !!f && UI.rres === null && UI.lres === null && UI.rtext === '' && UI.ltext === '', f ? JSON.stringify(UI) : 'refresh not found'); }
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
    // ---------- fix-r15: three findings that need no model slip (safety audit of c666d34, m1, m4, m8), and the insulin-profile default ----------
    // m8: an unanswered medicine question (diabetes ticked from My food, which does not ask it) is read as "not sure" everywhere, as the engine
    // reads it: the skipped-meal warning and the snack rule (onMeds) and what is sent (profileOut)
    { const at = (o) => run(['has', 'onMeds', 'profileOut'], { P: appP(o) }, '{ on: onMeds(), sent: profileOut().meds }');
      const cases = [[{ conds: ['diabetes'], health: 'diabetes', meds: '' }, true, 'unsure'], [{ conds: ['diabetes'], health: 'diabetes', meds: 'unsure' }, true, 'unsure'], [{ conds: ['diabetes'], health: 'diabetes', meds: 'yes' }, true, 'yes'],
        [{ conds: ['diabetes'], health: 'diabetes', meds: 'no' }, false, 'no'], [{ conds: ['bp'], health: 'bp', meds: '' }, false, 'no'], [{ conds: [], health: 'none', meds: '' }, false, 'no']];
      for (const [o, on, sent] of cases) { const r = at(o); add('m8 app: an unanswered medicine question is read as "not sure" everywhere', !!r && r.on === on && r.sent === sent, `${JSON.stringify(o)}: ${JSON.stringify(r)}`); } }
    // m4: the phone runs the nets plan() runs, before anything is sent. api() is taken from app.js with a fetch that counts: typed referral,
    // pregnancy, kidney and urgent text, and one low-sugar sign on an insulin profile, are answered on the phone with no request, as plan()
    // answers them; food text is sent
    { let fetched = 0; const mk = () => run(['api'], { KEYCODE: 'K', window: {}, fetch: () => { fetched++; return new Promise(() => {}); }, setTimeout: () => 0, clearTimeout: () => {}, typedReferral: typeof typedReferral === 'function' ? typedReferral : undefined, JSON }, 'api');
      const f = mk(), ins = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, plain = Object.assign({}, ins, { health: 'none', meds: 'no' });
      const phone = (t, prof) => { let got = null; const n0 = fetched; if (f) f('/api/meals', { profile: prof, ctx: { text: t } }, (s, j) => { got = [s, j]; }); return { sent: fetched > n0, got }; };
      const want = [['chest pain since morning, what can I eat', plain, true], ['I am pregnant, what can I order', plain, false], ['kidney problem, had dal and rice', plain, false], ['feeling shaky, what should I eat', ins, true], ['sugar low, what now', plain, true]];
      for (const [t, prof, urgent] of want) { const r = phone(t, prof);
        add('m4 app S7: typed referral text is answered on the phone, with no request', !!f && !r.sent && !!r.got && r.got[0] === 200 && r.got[1].status === 'refer' && r.got[1].read === SAFETY && (urgent ? r.got[1].urgent === URGENTLINE : !r.got[1].urgent), `"${t}": ${JSON.stringify(r)}`); }
      for (const [t, prof] of [['Masala dosa with chutney', plain], ['feeling shaky, what should I eat', plain], ['feeling shaky, what should I eat', Object.assign({}, ins, { meds: 'no' })], ['Something light with paneer', ins]]) { const r = phone(t, prof);
        add('m4 app S7: food text is sent (control)', !!f && r.sent && !r.got, `"${t}" (${prof.health}, meds ${prof.meds}): ${JSON.stringify(r)}`); }
      // the phone and the server give one answer: every typed string of the S7 lists, on the three typed kinds, for a profile without and with
      // insulin (the phone's typedReferral against plan()'s reply)
      const S7T = [].concat(L.referText, HO.referText, L.notReferText, L.referWindow, L.referWindowFamily, L.notReferWindow, L.referFound || [], L.notReferFound || [], L.referFound12 || [], L.notReferFound12 || [], L.urgentFound || [], L.urgentFound12 || [], L.urgentFound14 || [], L.notUrgentFound14 || [], L.referPunct || [], L.urgentPunct || [], L.notReferPunct || [], L.urgentMedsProfile15 || [], L.notUrgentMedsProfile15 || []);
      let pairs = 0; for (const prof of [plain, ins]) for (const t of S7T) { const ph = typeof typedReferral === 'function' ? typedReferral(t, prof) : undefined;
        for (const kind of ['meals', 'rescue', 'log']) { const pl = safe(() => plan(kind, { profile: prof, ctx: { meal: 'lunch', text: t } }), {}), sv = pl.reply || null; pairs++;
          add('m4 S7: the phone and the server give one answer to typed text', ph !== undefined && JSON.stringify(ph) === JSON.stringify(sv) && (!!sv || !!pl.prompt), `${kind} (${prof.health}, meds ${prof.meds}) "${t}": phone ${JSON.stringify(ph)}, server ${JSON.stringify(sv)}`); } }
      console.log(`m4 phone and server: ${S7T.length} typed strings, ${pairs} kind and profile pairs`); }
    // S7, the insulin-profile default (coordinator, fix-r15; the owner or a clinician may change it; not clinically reviewed): diabetes with
    // insulin or sugar tablets, or not sure, and one low-sugar sign typed, is referred with the line to get help now on every typed kind; the
    // same text with no medicine, or with no diabetes, is not (a single sign needs the medicine named or a second sign there)
    for (const kind of ['meals', 'rescue', 'log']) { const at = (o, t) => safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }, o), ctx: { meal: 'lunch', text: t } }), {});
      for (const t of L.urgentMedsProfile15 || []) { for (const meds of ['yes', 'unsure']) { const r = at({ health: 'diabetes', meds }, t);
          add('S7 insulin profile: one low-sugar sign is referred with the line to get help now', !!(r.reply && r.reply.status === 'refer' && r.reply.urgent === URGENTLINE && !r.prompt), `${kind}, meds ${meds}: "${t}" ${r.reply ? JSON.stringify(r.reply) : 'went to the model'}`); }
        if (!/^(?:hypo|sugar low)$/.test(t)) for (const o of [{ health: 'diabetes', meds: 'no' }, { health: 'none' }, { health: 'bp' }]) add('S7 insulin profile: the same sign with no medicine goes to the model (control)', !!at(o, t).prompt, `${kind} ${JSON.stringify(o)}: "${t}" was referred`); }
      for (const t of L.notUrgentMedsProfile15 || []) add('S7 insulin profile: food text is not referred (control)', !!at({ health: 'diabetes', meds: 'yes' }, t).prompt, `${kind}: "${t}" was referred`); }
    // m1, as a class: with diabetes (the reason-line rule, hookSaid) and on insulin or sugar tablets (the medicines floor), no sentence the
    // engine or the app writes advises eating less, lighter or skipping. Generated over profiles x every half hour x meal states x the four
    // meals: Today's directive (done and not), the reason line with every hook of the moment cited, the "Planned around" tags, the day's notes,
    // one-tap change notes and Rescue moves (a figure statement, "About 60 kcal less" or "Eat about half", is allowed only where the plate stays
    // at the usual size, checked on the figures), and every string in app.js and the app's own options, each allowed one named with its reason.
    { const ADV = /\b(?:light|lighter|lightly|less|skip\w*|smaller|cut\s+(?:down|back)|eat\s+(?:about\s+)?(?:half|two\s+thirds|three\s+quarters)|keep\s+it\s+light)\b/i;
      const NOTEOK = [[/^Lunch is the largest meal and dinner a lighter one\b/, 'the day\'s split: the usual sizes, which the medicines floor holds'], [/^Keep meals regular\. Skipping a meal on insulin/, 'a warning against skipping'],
        [/eating less can drop blood sugar too far/, 'a warning against eating less'], [/500 kcal less for obesity/, 'the source of a deficit, allowed only with no medicine (no deficit on medicines)', 'nofloor']];
      const PROFS = [['diabetes, insulin yes', { health: 'diabetes', meds: 'yes' }], ['diabetes, not sure', { health: 'diabetes', meds: 'unsure' }], ['diabetes, no medicine', { health: 'diabetes', meds: 'no' }],
        ['diabetes and high BP, insulin yes, building strength', { health: 'diabetes', meds: 'yes', bp: true, goal: 'build' }], ['diabetes, not sure, no body figures', { health: 'diabetes', meds: 'unsure', cm: 0, kg: 0, age: 0 }]];
      const T0 = { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: [] }, ml = (meal, kind, kcal) => ({ meal, kind, title: kind === 'skipped' ? '' : 'Dal and rice', kcal: kind === 'skipped' ? 0 : kcal, protein: 20 });
      const STATES = [['nothing logged', { today: T0, patterns: [] }], ['a heavy day so far', { today: Object.assign({}, T0, { kcal: 2000, protein: 50, meals: [ml('breakfast', 'had', 900), ml('lunch', 'had', 1100)] }), patterns: [] }],
        ['lunch skipped', { today: Object.assign({}, T0, { meals: [ml('lunch', 'skipped')] }), patterns: [] }], ['ate out', { today: Object.assign({}, T0, { kcal: 1200, protein: 30, meals: [ml('lunch', 'rescued', 1200)] }), patterns: [] }],
        ['a long gap', { today: Object.assign({}, T0, { kcal: 350, protein: 10, lastHoursAgo: 8, lastKcal: 350, meals: [ml('breakfast', 'had', 350)] }), patterns: [] }],
        ['late dinners, a skipped meal and a repeated food this week', { today: T0, patterns: [{ id: 'late_dinner', n: 5, of: 6 }, { id: 'skips_meal', meal: 'breakfast', n: 4, of: 7 }, { id: 'skips_meal', meal: 'dinner', n: 4, of: 7 }, { id: 'repeat', slot: 'm', food: 'dal', n: 6 }, { id: 'repeat', slot: 'b', food: 'poha', n: 6 }] }]];
      let cells = 0, FLOOR = false; const hit = (t) => { t = String(t || ''); const x = t.replace(/\b\d+\u00A0?\s*kcal\s+less\b/g, ''); return ADV.test(x) && !NOTEOK.some(([r, , only]) => r.test(t) && !(only === 'nofloor' && FLOOR)); };
      for (const [pn, o] of PROFS) { const p = readProfile(Object.assign({}, BASE, o)), floor = p.meds === 'yes' || p.meds === 'unsure'; FLOOR = floor;
        for (const [sn, fileIn] of STATES) { const file = readFile(fileIn);
          for (const meal of SLOTS) { const pl = planDay(p, file, meal, 5), hp = { health: p.health, medsUsual: medsUsual(p, meal) };
            for (let h = 0; h < 24; h += 0.5) { const hooks = hooksFor(p, file, { meal, hour: h, mode: 'desk' }, pl); cells++;
              const lines = [['the directive', directive(p, pl, hooks, meal, false)], ['the directive (day done)', directive(p, pl, hooks, meal, true)],
                ['the reason line', reasonLine({ kcal: pl ? pl.target.kcal : 600, protein: pl ? pl.target.protein : 20, grain: { food: 'Jowar roti', grams: 80 } }, hooks, pl, hp, meal)]].concat(hooks.filter(x => hookSaid(x.id, hp)).map(x => ['a "Planned around" tag', x.tag]));
              for (const [where, t] of lines) if (hit(t)) add('m1 as a class: no engine sentence advises eating less, lighter or skipping, with diabetes or on medicines', false, `${pn}, ${sn}, ${meal} at ${h}: ${where}: "${t}"`); } } }
        const dt = dayTargets6(p); for (const [lab0, t] of dt ? dt.notes : []) add('m1 as a class: the day\'s notes', !hit(lab0) && !hit(t), `${pn}: "${lab0} ${t}"`);
        if (floor) { // one-tap change notes and Rescue moves on medicines: the figure statements keep the usual size
          const u = medsUsual(p, 'lunch');
          if (u) { const m = platePlain(), pk = u + 100; Object.assign(m, { kcal: pk, protein: Math.round(pk * 0.2 / 4), carbs: Math.round(pk * 0.5 / 4), fats: Math.round(pk * 0.3 / 9) }); m.items.forEach(i => { i.grams = Math.round(i.grams * pk / 500); }); m.grain.grams = m.items[1].grams;
            const kept = safe(() => plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch' } }).check(mealsReply(m)).meals[0], null), tp = kept && plan('tune', { profile: Object.assign({}, BASE, o), slot: 'lunch', meal: kept });
            const ch = (dk, dp, dc, df, after) => ({ add_item: '', add_grams: 0, minutes: 15, grain_grams_after: after, contains: PT, deltaKcal: dk, deltaProtein: dp, deltaCarbs: dc, deltaFats: df, deltaFiber: 0 });
            const t = safe(() => tp.check({ swaps: { protein: [], base: [] }, alchemy: { glucose: ch(-60, 0, -10, -2, kept.grain.grams), gut: ch(-150, -5, -20, -6, kept.grain.grams), express: ch(-20, 0, -4, -0, kept.grain.grams) } }), {});
            for (const [k, x] of Object.entries(t.alchemy || {})) add('m1 as a class: a change note on medicines keeps the usual size', !hit(x.note) && kept.kcal + x.deltaKcal >= u, `${pn}: "${x.note}" on a ${kept.kcal} kcal plate, usual ${u}`);
            add('m1 as a class: a change notes were read on medicines (non-vacuous)', Object.keys(t.alchemy || {}).length >= 1, `${pn}: ${JSON.stringify(t)}`);
            for (const f of [1.2, 2, 3]) { const k = Math.round(u * f / 10) * 10, d = { name: 'Veg thali', kcal: k, protein: Math.round(k * 0.15 / 4), carbs: Math.round(k * 0.55 / 4), fats: Math.round(k * 0.30 / 9), fiber: 8, contains: ['grain'] }, r = rescueOut(o, 'Veg thali', d, []);
              for (const mv of r.hacks || []) add('m1 as a class: a Rescue move on medicines keeps the usual size', mv.kind === 'portion' ? d.kcal + mv.deltaKcal >= u : !hit(mv.title), `${pn}: "${mv.title}" on a ${k} kcal dish, usual ${u}`); } } } }
      // controls: the directive's late line is still said with no condition, so the scan is not reading empty lines
      { const p = readProfile(Object.assign({}, BASE, { health: 'none' })), file = readFile({ today: T0, patterns: [] }), pl = planDay(p, file, 'dinner', 5);
        add('m1 as a class: with no condition the late line is still said (control)', /keep it light/.test(directive(p, pl, hooksFor(p, file, { meal: 'dinner', hour: 22.5, mode: 'desk' }, pl), 'dinner', false)), 'the late line was not said with no condition'); }
      // every string in app.js, and the app's own options and example asks: an advice word is allowed only in the strings named here, each with
      // its reason; the example ask "A light dinner after a heavy lunch" is not offered on medicines (and still is with no medicine)
      const APPOK = { 'skipped': 'an event kind, not shown', 'skipx': 'a class name', 'log-skip': 'an element id', 'Skipped it': 'the button that records a skipped meal; it advises nothing', 'Skipped ': 'the logged card\'s title, "Skipped lunch": a record',
        ', skipped': 'the meal tab\'s label for a skipped meal: a record', 'less': 'a figure statement on a swap ("(8 g less carbs)"); the swap keeps the usual size on medicines (S6, the engine)', 'Less ': 'the Builder stepper\'s label ("Less grains"): a share of the plate, not its size',
        'less oil': 'the cooking choice the client makes', 'These can cause low sugar when you eat less, so the plates stay steadier for you.': 'a warning against eating less on medicines',
        [typeof MEDSWARN === 'string' ? MEDSWARN : '_']: 'the low-sugar warning after a skipped meal' };
      const appSrc2 = fs.readFileSync(process.env.NP_APP || path.join(__dirname, '../../src/v6/app.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''), lits = [...new Set(appSrc2.match(/"(?:[^"\\\n]|\\.)*"/g) || [])].map(x => JSON.parse(x));
      const medsW = (/var MEDSWARN="((?:[^"\\]|\\.)*)"/.exec(appSrc2) || [])[1]; if (medsW) APPOK[JSON.parse('"' + medsW + '"')] = 'the low-sugar warning after a skipped meal: a warning against skipping';
      for (const t of lits) if (ADV.test(t)) add('m1 as a class: every app string with an advice word is named with its reason', t in APPOK, `src/v6/app.js: "${t.slice(0, 90)}"`);
      const OPTOK = { 'Light': 'the mood the client chooses for the plate\'s style; every plate on medicines is still at least the usual size (S6)', 'Light activity': 'the client\'s activity level, not advice', 'Less oil': 'the cooking choice the client makes' };
      for (const k of Object.keys(OPT)) for (const [, lab0] of OPT[k]) if (ADV.test(lab0)) add('m1 as a class: every option label with an advice word is named with its reason', lab0 in OPTOK, `OPT.${k}: "${lab0}"`);
      const askOn = (o) => (typeof APPASKS !== 'undefined' ? APPASKS : []).filter(e => safe(() => appAskOK(e, readProfile(Object.assign({}, BASE, o))), true)).map(e => e[0]);
      for (const meds of ['yes', 'unsure']) add('m1 as a class: no example ask for a lighter meal on medicines', !askOn({ health: 'diabetes', meds }).some(t => ADV.test(t)), `meds ${meds}: ${JSON.stringify(askOn({ health: 'diabetes', meds }))}`);
      add('m1 as a class: the four example asks with no medicine (control; the review state pins them)', askOn({ health: 'diabetes', meds: 'no' }).length === 4, JSON.stringify(askOn({ health: 'diabetes', meds: 'no' })));
      // on medicines the snack is never passed over: nextOffer from app.js with little room left
      const no = (meds) => run(['has', 'onMeds', 'slotOf', 'nextOpen', 'nextOffer'], { P: appP({ conds: ['diabetes'], health: 'diabetes', meds }), C: { meal: 'lunch' }, SLOTS, PL: {}, FILE: { today: { meals: [{ meal: 'breakfast', kind: 'had' }, { meal: 'lunch', kind: 'had' }] } }, snackRoom: () => 40 }, 'nextOffer()');
      add('m1 as a class: on medicines the snack is never passed over', JSON.stringify(no('yes')) === '{"meal":"snack","low":false}' && JSON.stringify(no('')) === '{"meal":"snack","low":false}' && JSON.stringify(no('no')) === '{"meal":"dinner","low":true}', JSON.stringify([no('yes'), no(''), no('no')]));
      console.log(`m1 as a class: ${cells} profile, state, meal and hour cells, ${lits.length} app strings`); }
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
  // safety audits of b4633dd m4 and 530a503 m1: with no declared grain, a change that says no grain is left (grain grams after 0) while a
  // grain item stays listed is not offered, on the plate or in a tune; with no grain item on the plate, the same change stays (control), and
  // so does a change that gives no grain grams (the recorded one-tap changes the bars count)
  for (const [items, grain, want] of [[[['Rajma', 150, 'protein'], ['Jeera rice', 200, 'carbs'], ['Cucumber salad', 120, 'greens']], { food: 'Rice', made_of: 'rice', grams: 200 }, false],
      [[['Rajma', 150, 'protein'], ['Jeera rice', 200, 'carbs'], ['Cucumber salad', 120, 'greens']], { food: '', made_of: '', grams: 0 }, false],
      [[['Moong dal', 200, 'protein'], ['Jowar roti', 90, 'carbs'], ['Cucumber salad', 100, 'greens']], { food: 'Roti', made_of: 'jowar', grams: 90 }, false],
      [[['Paneer bhurji', 150, 'protein'], ['Sauteed greens', 150, 'greens']], { food: '', made_of: '', grams: 0 }, true]]) {
    const o = { diet: 'veg', goal: 'hold' };
    const AL = { glucose: { titleSuffix: '+ beans', note: 'x', add_item: 'Sauteed beans', add_grams: 80, minutes: 20, grain_grams_after: 0, contains: PT, deltaKcal: -120, deltaProtein: 2, deltaCarbs: -30, deltaFats: 0, deltaFiber: 2 },
      protein: { titleSuffix: '+ chana', note: 'x', add_item: 'Roasted chana', add_grams: 30, minutes: 20, contains: PT, deltaKcal: -60, deltaProtein: 4, deltaCarbs: -20, deltaFats: 2, deltaFiber: 2 } };
    const raw = { title: 'x', prepMinutes: 25, items: items.map(([food, grams, group]) => ({ food, grams, group, contains: /rice|roti/i.test(food) ? ['grain'] : PT })), grain, contains: ['grain'],
      kcal: 560, protein: 22, carbs: 80, fats: 16, fiber: 10, why: [], swaps: { protein: [], base: [] }, alchemy: AL, planned_around: [], for_you: '', taste: [] };
    const st = `items ${items.map(i => '"' + i[0] + '"').join(', ')}, grain declared "${grain.food}"`, sh = shownPlate(o, 'lunch', raw); if (!sh) { add('S10 no declared grain, grain grams after 0: the plate is shown (control)', false, st); continue; }
    const t = tuned(o, 'lunch', Object.assign(J(sh), { alchemy: undefined }), { protein: [], base: [] }, AL);
    for (const [pth, al] of [['plate', sh.alchemy || {}], ['tune', (t && t.alchemy) || {}]]) {
      add('S10 no declared grain: no change takes the grain to 0 g while a grain item stays listed', !!al.glucose === want, `${st} (${pth}): "no grain left" change ${al.glucose ? 'offered: ' + al.glucose.note : 'not offered'}, expected ${want ? 'offered' : 'not offered'}`);
      add('S10 no declared grain: a change with no grain grams stays (control)', !!al.protein, `${st} (${pth}): offered ${Object.keys(al).join(', ')}`); } }
  console.log(`S10 grain-protein plate: ${states} app tap states checked; part-name plates: ${partN} grain swap taps; no declared grain: ${ngN} tap states`); }

// ---------- B1 (Codex re-audit): urgent symptoms are referred before the model on every kind that carries text, with the line to get help now ----------
// A first net, not a complete list: the phrasings below are the re-audit's and their variants, so they are regression cases, not held out.
{ const URG = ['I took insulin and feel shaky', 'my sugar dropped to 50 and I feel dizzy', 'my sugar is very low and I am sweating', 'chest pain after lunch', 'feeling faint and confused',
    'sugar kam ho gaya, chakkar aa rahe hain', 'seene me dard hai', 'saans phool rahi hai', 'cant breathe properly', 'passed out after lunch', 'hypo after my tablets', 'feeling shakey after insulin', 'no chest pain today'];
  const BENIGN = ['sugar-free dessert', 'low sugar biscuits', 'I want low sugar chai', 'I am confused what to eat', 'dizzy from the heat, something cold', 'Something light with paneer', 'I am sweating, it is hot'];
  for (const kind of ['meals', 'rescue', 'log']) {
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
for (const t of L.referWindow) add('B6 intake keeps S7 (referral window, D4)', refers('meals', t) && refers('meals', t.split('').join('​')), `"${t}" with zero-width spaces went to the model`);
// safety audit of b4633dd, B1: a phone keyboard types a curly apostrophe (U+2019) and text pasted from a chat or a notes app carries typographic
// dashes. Every S7 and urgent phrasing whose pattern spells an apostrophe or a hyphen refers on the four typed paths in each of these forms,
// the urgent ones with the line to get help now; the food-text controls whose exclusion spells a hyphen stay unreferred in each form. The
// forms are this test's own list, kept apart from the engine's fold.
const APOS = ['‘', '’', '‛', 'ʼ', 'ʹ', '`', '´', '′', '＇'];
const DASH = ['‐', '‑', '‒', '–', '—', '―', '−', '﹘', '﹣', '－'];
const SPACES = [' ', ' ', ' ', ' ', ' ', ' ', '　'];
const typo = (t) => { const v = []; if (t.includes("'")) for (const a of APOS) v.push(t.split("'").join(a)); if (t.includes('-')) for (const d of DASH) v.push(t.split('-').join(d));
  if (t.includes("'") && t.includes('-')) v.push(t.split("'").join('’').split('-').join('‐')); return v; };
const typoWrap = (t) => { const b = t.split("'").join('’').split('-').join('‑'); return SPACES.map(s => b.split(' ').join(s)).concat([b.split('').join('​'), ' ' + b + '⁠']); };
const typoRoute = (kind, t) => { const pl = safe(() => plan(kind, { profile: Object.assign({}, BASE, { diet: 'veg' }), ctx: { meal: 'lunch', text: t } }), {}); return pl && pl.reply && pl.reply.status === 'refer' ? (pl.reply.urgent === URGENTLINE ? 'U' : 'R') : 'M'; };
const cpOf = (t) => [...t].filter(c => c.charCodeAt(0) > 126 || c === '\u0060').map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).filter((c, i, a) => a.indexOf(c) === i).join(' ');
for (const kind of ['meals', 'rescue', 'log']) {
  for (const t of L.referPunct || []) for (const v of typo(t).concat(typoWrap(t))) add('S7 typed, typographic apostrophes, dashes and spaces (safety audit of b4633dd, B1)', typoRoute(kind, v) !== 'M', `${kind}: "${t}" with ${cpOf(v)} went to the model`);
  for (const t of L.urgentPunct || []) for (const v of typo(t).concat(typoWrap(t))) add('B1 urgent text, typographic apostrophes (safety audit of b4633dd, B1): referred with the line to get help now', typoRoute(kind, v) === 'U', `${kind}: "${t}" with ${cpOf(v)} gave ${typoRoute(kind, v)}`);
  for (const t of L.notReferPunct || []) for (const v of typo(t)) add('S7 no false hit, typographic apostrophes and dashes (safety audit of b4633dd, B1)', typoRoute(kind, v) === 'M', `${kind}: "${t}" with ${cpOf(v)} was referred`); }
// the ASCII forms themselves: the cases above are only worth something if the straight forms refer, and the controls do not
for (const t of (L.referPunct || []).concat(L.urgentPunct || [])) add('S7 typed, typographic cases (ASCII form)', ['meals', 'rescue', 'log'].every(k => typoRoute(k, t) !== 'M'), `"${t}" went to the model`);
for (const t of L.notReferPunct || []) add('S7 no false hit, typographic cases (ASCII form)', ['meals', 'rescue', 'log'].every(k => typoRoute(k, t) === 'M'), `"${t}" was referred`);

// ---------- B4, round 5: the literal empty-list rule. An empty or missing list drops any name, plain or not; "plain" is how a plain food declares ----------
for (const n of ['Dal tadka', 'Sabudana', 'Sabudana khichdi', 'Rajma', 'Sprouted moong', 'Cucumber', 'Banana split', 'Lemon squash', 'Orange squash', 'Coconut slice', 'Baked beans'])
  for (const o of [{ diet: 'vegan' }, { diet: 'jain' }, { leave: ['nut'] }, { health: 'diabetes' }, {}]) add('B4 literal empty rule', !plateOffered(o, withItem(n, [])).ok, `${JSON.stringify(o)}: "${n}" with [] was offered`);
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

// m4: on medicines a tune names its meal
add('m4 tune slot on medicines', !!safe(() => plan('tune', { profile: Object.assign({}, BASE, { health: 'diabetes', meds: 'yes' }), meal: Object.assign(baseMeal(), { minutes: 20 }) }).error, false), 'a tune with no meal on medicines was planned');

// ---------- menu reading removed (owner, 17 Nov, option survey, "Remove menu reading (Recommended)") ----------
// "Take "Read the menu" and "type the menu" off Rescue and refuse menu requests in the engine. Rescue keeps "Name the dish". The menu
// code stays dormant in the repository." This replaces every check that ran through plan('menu') (the menu path is unreachable): the
// engine refuses the kind before it reads anything, whatever the body carries, and the page offers no menu entry.
{ const MB = [['a typed menu', { profile: BASE, ctx: { meal: 'lunch', text: fxm.typed } }], ['a photo', { profile: BASE, ctx: { meal: 'lunch', text: '' }, image: 'AAAA' }],
    ['a typed menu and a photo', { profile: Object.assign({}, BASE, { diet: 'nonveg' }), ctx: { meal: 'dinner', text: 'MAINS\nGurda Fry 240\nDal Fry 200' }, image: 'AAAA' }],
    ['a kidney profile', { profile: Object.assign({}, BASE, { health: 'kidney', conds: ['kidney'] }), ctx: { meal: 'lunch', text: 'Dal Fry 200' } }],
    ['a pregnancy profile', { profile: Object.assign({}, BASE, { health: 'preg', conds: ['preg'] }), ctx: { meal: 'lunch', text: '' }, image: 'AAAA' }],
    ['urgent text', { profile: BASE, ctx: { meal: 'lunch', text: 'chest pain after lunch' } }], ['kidney text', { profile: BASE, ctx: { meal: 'lunch', text: 'I have a kidney problem' } }],
    ['medicines', { profile: Object.assign({}, BASE, { health: 'diabetes', meds: 'yes' }), ctx: { meal: 'lunch', text: 'MAINS\nDal Fry 200' }, file: {} }],
    ['an empty body', {}], ['no body', undefined]];
  for (const [what, body] of MB) { const pl = safe(() => plan('menu', body), 'threw');
    add('menu refused (owner, 17 Nov): plan("menu") is an error and builds no prompt, reply or check', !!pl && typeof pl === 'object' && pl.error === 'bad_request' && Object.keys(pl).length === 1, `${what}: ${JSON.stringify(pl)}`); }
  add('menu refused (owner, 17 Nov): "menu" is not a kind the server posts to', typeof KINDS !== 'undefined' && Array.isArray(KINDS) && !KINDS.includes('menu') && ['meals', 'rescue', 'log', 'tune'].every(k => KINDS.includes(k)), typeof KINDS === 'undefined' ? 'no KINDS' : JSON.stringify(KINDS));
  // the live kinds still answer (control): the guard refuses only what is not listed
  add('menu refused (owner, 17 Nov): the live kinds still build their prompt (control)', ['meals', 'rescue', 'log'].every(k => !!safe(() => plan(k, { profile: BASE, ctx: { meal: 'lunch', text: 'Veg thali' } }).prompt, '')), 'a live kind built no prompt');
  // no markup or app string outside np-core offers a menu entry: the words, the photo note and the entry's element ids (matched as ids)
  const appPart = page.slice(0, page.indexOf(open)) + page.slice(page.indexOf('</script>', a));
  const ENTRY = [['"Read the menu"', /read the menu/i], ['"type the menu"', /type the menu/i], ['"menu photo"', /menu photo/i], ['"photo of the menu"', /photo of the menu/i], ['/api/menu', /\/api\/menu/],
    ['an entry id (mcam, mfile, mtype, mtext, mgo)', /["'#](?:mcam|mfile|mtype|mtext|mgo)["'\s,)\]]/]];
  // the v5 screens (not a release target) keep their own Rescue camera, labelled "Photo of the menu"; its photo now gets an error (no kind
  // takes a photo, tested below), so that one pattern is not run there; every other pattern runs on all three pages
  const V5 = /hosted\/v5/.test(process.argv[2] || ''); if (V5) console.log('menu entry scan, v5 screens: "photo of the menu" not run (the v5 Rescue camera is still drawn; the engine refuses its photo; not a release target)');
  for (const [what, rx] of ENTRY.filter(([w]) => !(V5 && w === '"photo of the menu"'))) { const m = rx.exec(appPart); add('menu refused (owner, 17 Nov): the page offers no menu entry', !m, m ? `${what} found: ${JSON.stringify(appPart.slice(Math.max(0, m.index - 40), m.index + 40))}` : ''); } }

// ---------- no photo on any kind (owner, 17 Nov: "Just a picture scan, should not become the source of so much hassle for the app.") ----------
// A request that carries an image, or says it does, is refused before any prompt is built, on every kind. Typed referral text still refers
// first (S7). Text alone still builds its prompt, with no photo wording and no image allowed (control).
{ const BP = Object.assign({}, BASE, { diet: 'veg' });
  const PHOTO = [['an image', (b) => Object.assign(b, { image: 'AAAA' })], ['an image and ctx.photo', (b) => Object.assign(b, { image: '/9j/4AAQSkZJRg==', ctx: Object.assign({}, b.ctx, { photo: true }) })],
    ['ctx.photo alone', (b) => Object.assign(b, { ctx: Object.assign({}, b.ctx, { photo: true }) })], ['an image in ctx', (b) => Object.assign(b, { ctx: Object.assign({}, b.ctx, { image: 'AAAA' }) })]];
  const BODY = { rescue: () => ({ profile: BP, ctx: { meal: 'lunch', text: 'Veg thali' } }), log: () => ({ profile: BP, ctx: { meal: 'lunch', text: '2 rotis and dal' } }),
    rescueEmpty: () => ({ profile: BP, ctx: { meal: 'lunch', text: '' } }), meals: () => ({ profile: BP, ctx: { meal: 'lunch' } }), tune: () => ({ profile: BP, slot: 'lunch', meal: Object.assign(baseMeal(), { minutes: 20 }) }) };
  for (const kind of ['rescue', 'log', 'meals', 'tune']) for (const [what, put] of PHOTO) { const pl = safe(() => plan(kind, put(BODY[kind]())), 'threw');
    add('photo refused (owner, 17 Nov): a request with a photo is an error and builds no prompt, on every kind', !!pl && typeof pl === 'object' && pl.error === 'bad_request' && Object.keys(pl).length === 1, `${kind}, ${what}: ${JSON.stringify(pl).slice(0, 120)}`); }
  for (const kind of ['rescue', 'log']) { const pl = safe(() => plan(kind, Object.assign(BODY.rescueEmpty(), { image: 'AAAA' })), 'threw');
    add('photo refused (owner, 17 Nov): a photo with no text is an error', !!pl && pl.error === 'bad_request' && Object.keys(pl).length === 1, `${kind}: ${JSON.stringify(pl).slice(0, 120)}`); }
  // typed referral text still refers with a photo attached (S7 before the photo rule)
  for (const kind of ['rescue', 'log']) for (const t of ['chest pain after lunch', 'I am pregnant', 'I have a kidney problem']) { const pl = safe(() => plan(kind, { profile: BP, ctx: { meal: 'lunch', text: t }, image: 'AAAA' }), {});
    add('photo refused (owner, 17 Nov): typed referral text still refers when a photo is attached (S7)', !!(pl.reply && pl.reply.status === 'refer' && !pl.prompt), `${kind}, "${t}": ${JSON.stringify(pl).slice(0, 120)}`); }
  // control: text alone builds the prompt, takes no image and mentions no photo
  for (const kind of ['rescue', 'log']) { const pl = safe(() => plan(kind, BODY[kind]()), {});
    add('photo refused (owner, 17 Nov): text alone still builds its prompt, with no photo (control)', typeof pl.prompt === 'string' && pl.prompt.length > 200 && typeof pl.check === 'function' && pl.image === false && !/photo/i.test(pl.prompt), `${kind}: ${pl.error || ('image ' + pl.image + ', photo in prompt ' + /photo/i.test(pl.prompt || ''))}`); } }

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       … ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(`held-out names: ${heldN} (${heldByWords} of them also caught by the word lists alone)`);
console.log('S5 one-tap, rule 3: test/rules/check.js. S10, S11, S12: review states in test/ux/review.js.');
console.log(fail ? `${fail} counter-example(s): the invariants do not hold` : 'every safety invariant holds');
process.exit(fail ? 1 : 0);
