// The schema injection test (fix-r14; safety audit of 7eaadcf, B1, M1, M2 and m3). The audit's three findings had one cause: the engine cut,
// blanked or joined a model field before the check read it, and no test wrote into that field. Here the test is generated from the schema
// the model answers in: for each live kind (meals, tune, rescue, log) it walks the kind's own schema (the one plan() hands the server), and
// for every leaf the model may write it starts from a recorded passing reply and writes into that leaf, for eleven profiles:
//   - a text leaf: each barred word of the profile (test/safety/lexicon.json, the test's own words) alone, after a filler word, after a
//     non-grain word ("Besan and wheat"), past the leaf's cap, and beside one of the owner's banned words (read from the engine's own list at
//     run time, so this file holds none of them);
//   - a tag leaf: each tag the profile bars, "supplement" included;
//   - an array: one element over its cap, carrying energy and a barred word.
//   - a figure leaf (fix-r15; safety audit of c666d34, B1 and m5): a value past each end of the leaf's range, zero, null, "", a negative
//     number, a word, a number written as a string, a fraction, a huge number and true, each end of the range itself, and the base's own
//     value as the control.
// A cell passes when the element it wrote into is dropped, or when the injected content is in nothing shown, counted or logged, as the
// leaf's rule below says (docs/SAFETY-INVARIANTS.md). A figure cell passes when a figure that is not an integer inside the leaf's range
// drops its element, and when every figure the element is offered with is the figure written (shown or checked value === written value;
// fix-r14's rule, "a number, bounded by the engine", accepted a figure cut to fit). The test fails when a schema leaf has no rule (completeness), when a rule names no
// leaf, when the base reply does not offer the element a leaf belongs to (so no drop is vacuous), or when a control is not offered.
// usage: node test/safety/inject.js [hosted/v6/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const page = fs.readFileSync(process.argv[2] || path.join(ROOT, 'hosted/v6/index.min.html'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const K = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8')).known;
const J = x => JSON.parse(JSON.stringify(x)), cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
const rec = (f, id) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')).find(r => r.id === id);

// ---------- the profiles and their barred words and tags ----------
const BASE = { goal: 'hold', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 45, cm: 152, kg: 48, act: 'low', done: true };
const pick = (c, extra) => [...new Set([K[c][0], K[c][1]].concat(extra || []))];
const SUPP = pick('supplement', [K.supplement.find(x => /powder/.test(x))]);
const BRAND = ['Ensure', 'Boost', 'Tang'];   // count only as a whole name (S9 in the invariants), so they are written alone
const PROFILES = [
  ['vegan', { diet: 'vegan' }, pick('meat').concat(pick('egg'), pick('dairy')), ['meat', 'fish', 'egg', 'dairy']],
  ['no-dairy', { leave: ['dairy'] }, pick('dairy'), ['dairy']],
  ['Jain', { diet: 'jain' }, pick('meat').concat(pick('jain')), ['meat', 'fish', 'egg', 'onion_garlic', 'root_veg']],
  ['wheat-free', { leave: ['wheat'] }, pick('wheat', ['wheat', 'maida']), ['wheat']],
  ['nut-free', { leave: ['nut'] }, pick('nut'), ['nuts']],
  ['soya-free', { leave: ['soya'] }, pick('soya'), ['soya']],
  ['egg-free (vegetarian)', { diet: 'veg' }, pick('egg'), ['egg']],
  ['high BP', { health: 'bp' }, pick('salty'), ['salty_side']],
  ['diabetes', { health: 'diabetes' }, pick('sweet'), ['sweet']],
  ['diabetes on medicines', { health: 'diabetes', meds: 'yes' }, pick('sweet'), ['sweet']],
  ['veg (meat and fish barred)', { diet: 'veg' }, pick('meat'), ['meat', 'fish']]];
const BANW = a.BANW.filter(w => !/\s/.test(w));   // the owner's banned words, from the engine at run time
if (!BANW.length || SUPP.length < 2) { console.log('FAIL the word lists could not be read'); process.exit(1); }

// ---------- the leaves of a schema ----------
// a path: segments, "[]" for an array element. Leaf kinds: text, enum, figure, tags (an array of the tag enum), array (any other array).
function leaves(s, p, out) { out = out || [];
  if (s.type === 'OBJECT') { for (const k of Object.keys(s.properties)) leaves(s.properties[k], p.concat(k), out); return out; }
  if (s.type === 'ARRAY') { const it = s.items || {};
    if (it.type === 'STRING' && Array.isArray(it.enum) && it.enum.includes('supplement')) { out.push({ path: p, kind: 'tags', s }); return out; }
    out.push({ path: p, kind: 'array', s }); leaves(it, p.concat('[]'), out); return out; }
  if (s.type === 'STRING') { out.push({ path: p, kind: Array.isArray(s.enum) ? 'enum' : 'text', s }); return out; }
  out.push({ path: p, kind: 'figure', s }); return out; }
const key = p => p.join('.').replace(/\.\[\]/g, '[]');

// ---------- the rules: every leaf the model may write, by kind (docs/SAFETY-INVARIANTS.md) ----------
// el: the element a leaf belongs to. drop: a barred word or tag there drops it (S1-S4, S9 on plates, swaps and one-tap changes: "read for
// the food rules"). hidden: the injected content shows nowhere, but the element may stay (S15: the Rescue dish is the client's own; the log
// is the client's own record, not filtered by the food rules; an enum). suppDrop: only a supplement drops it (S15's one exception, S9).
// cap: the engine's cap on that field (a cell writes past it). figure (fix-r15): an integer from lo to hi, taken as written or its element
// dropped; show reads the figure back from the checked output, so a cell can tell a figure cut to fit from one taken as written (no show:
// the figure is read but not passed on, and only the drop is tested). The ranges are the engine's documented ones (docs/SAFETY-INVARIANTS.md,
// the figure rule), written out here apart from the engine.
const F = (el, lo, hi, show, item) => ({ k: 'figure', el, lo, hi, show, item });
const plateOut = (out) => (out.meals || [])[0];
const pf = (f) => (kind, out) => { const m = plateOut(out); return m ? m[f] : undefined; };
const plateRules = (pre, el) => {
  const r = {};
  r[pre + 'title'] = { k: 'drop', el: 'plate', cap: 70 }; r[pre + 'prepMinutes'] = F('plate', 0, 180, pf('minutes'));
  r[pre + 'items'] = { k: 'array', el: 'plate', cap: 7, over: 'item' };
  r[pre + 'items[].food'] = { k: 'drop', el: 'plate', cap: 200 }; r[pre + 'items[].grams'] = F('plate', 1, 800, (kind, out) => { const m = plateOut(out); return m ? m.items[0].grams : undefined; });
  r[pre + 'items[].group'] = { k: 'hidden', el: 'plate' };
  r[pre + 'items[].contains'] = { k: 'tags', el: 'plate' }; r[pre + 'contains'] = { k: 'tags', el: 'plate' };
  r[pre + 'grain.food'] = { k: 'drop', el: 'plate', cap: 200 }; r[pre + 'grain.made_of'] = { k: 'drop', el: 'plate', cap: 40 }; r[pre + 'grain.grams'] = F('plate', 0, 1500);
  for (const [f, lo, hi] of [['kcal', 40, 2500], ['protein', 0, 250], ['carbs', 0, 400], ['fats', 0, 200], ['fiber', 0, 80]]) r[pre + f] = F('plate', lo, hi, pf(f));
  return r; };
// the target swap is found by its name here (a figure cell may write its grams); a change by its kind
const swapShow = (k, f) => (kind, out) => { const pm = plateOf(kind, out), s = pm && (pm.swaps[k] || []).find(x => x.food === TNAME[k]); return s ? s[f] : undefined; };
const chShow = (c, f) => (kind, out) => { const pm = plateOf(kind, out), x = pm && (pm.alchemy || {})[c]; return x ? x[f] : undefined; };
const SWR = { grams: [1, 800], deltaKcal: [-400, 400], deltaProtein: [-40, 40], deltaCarbs: [-80, 80], deltaFats: [-40, 40], deltaFiber: [-20, 20] };
const CHR = { minutes: [0, 180], grain_grams_after: [0, 800], deltaKcal: [-400, 400], deltaProtein: [-10, 40], deltaCarbs: [-80, 40], deltaFats: [-30, 30], deltaFiber: [-10, 20] };
const tuneRules = (pre) => { const r = {};
  for (const k of ['protein', 'base']) { const p = pre + 'swaps.' + k; r[p] = { k: 'array', el: 'list:' + k, cap: 3, over: 'swap' };
    r[p + '[].food'] = { k: 'drop', el: 'swap:' + k, cap: 200 }; r[p + '[].contains'] = { k: 'tags', el: 'swap:' + k };
    for (const d of Object.keys(SWR)) r[p + '[].' + d] = F('swap:' + k, SWR[d][0], SWR[d][1], swapShow(k, d)); }
  r[pre + 'swaps.base[].made_of'] = { k: 'drop', el: 'swap:base', cap: 40 };
  for (const c of ['protein', 'glucose', 'express', 'gut']) { const p = pre + 'alchemy.' + c;
    r[p + '.add_item'] = { k: 'drop', el: 'change:' + c, cap: 200 }; r[p + '.contains'] = { k: 'tags', el: 'change:' + c };
    for (const d of Object.keys(CHR)) r[p + '.' + d] = F('change:' + c, CHR[d][0], CHR[d][1], chShow(c, d === 'grain_grams_after' ? 'grainAfter' : d));
    // add_grams: 0 to 500 with no food added (nothing shown); with a food added, 1 to 500, shown as the food's grams
    r[p + '.add_grams'] = F('change:' + c, 0, 500, null, { lo: 1, hi: 500, show: chShow(c, 'itemGrams') }); }
  return r; };
const dishShow = (f) => (kind, out) => out.status === 'ok' && out.dish ? out.dish[f] : undefined, logShow = (f) => (kind, out) => out.status === 'ok' ? out[f] : undefined;
const RULES = {
  meals: Object.assign({ status: { k: 'hidden', el: 'reply' }, refer_reason: { k: 'hidden', el: 'reply' }, meals: { k: 'array', el: 'reply', cap: 4, over: 'plate' },
    'meals[].planned_around': { k: 'array', el: 'plate', cap: 4, over: 'string' }, 'meals[].planned_around[]': { k: 'hidden', el: 'plate' },
    'meals[].taste': { k: 'array', el: 'plate', cap: 3, over: 'string' }, 'meals[].taste[]': { k: 'hidden', el: 'plate', cap: 20 } }, plateRules('meals[].'), tuneRules('meals[].')),
  tune: tuneRules(''),
  rescue: { status: { k: 'hidden', el: 'dish' }, refer_reason: { k: 'hidden', el: 'dish' }, 'dish.name': { k: 'suppDrop', el: 'dish', cap: 80 }, 'dish.portion': { k: 'hidden', el: 'dish' },
    'dish.contains': { k: 'suppTags', el: 'dish' }, 'dish.kcal': F('dish', 40, 4000, dishShow('kcal')), 'dish.protein': F('dish', 0, 300, dishShow('protein')), 'dish.carbs': F('dish', 0, 500, dishShow('carbs')),
    'dish.fats': F('dish', 0, 300, dishShow('fats')), 'dish.fiber': F('dish', 0, 80, dishShow('fiber')) },
  log: { status: { k: 'hidden', el: 'log' }, refer_reason: { k: 'hidden', el: 'log' }, items: { k: 'array', el: 'log', cap: 8, over: 'logitem' }, 'items[].food': { k: 'hidden', el: 'log', cap: 60 },
    'items[].grams': F('log', 1, 1500, (kind, out) => { const it = (out.items || []).find(i => i.food === LOGITEM0); return it ? it.grams : undefined; }), 'items[].group': { k: 'hidden', el: 'log' },
    kcal: F('log', 40, 4000, logShow('kcal')), protein: F('log', 0, 300, logShow('protein')), carbs: F('log', 0, 500, logShow('carbs')), fats: F('log', 0, 300, logShow('fats')), fiber: F('log', 0, 80, logShow('fiber')) } };
// Owner questions: paths where docs/SAFETY-INVARIANTS.md is silent, held to the weaker rule ("hidden") and listed in the report
const OWNERQ = { 'rescue:dish.portion': 'a supplement named only in the Rescue portion text: the text is never shown; is the dish refused?',
  'rescue:dish.name': 'a barred food in the model\'s Rescue dish name: S15 shows the typed dish whatever the rules bar; only a supplement refuses',
  'log:items[].food': 'a supplement or barred food in a log item: the log is the client\'s record (not filtered by S1-S5, S9); shown only if typed' };

// ---------- the recorded passing replies ----------
// meals and tune: "Gujarati Toor Dal with Bajra Rotla" (eval/v5/results-live-r37.json, jain-lunch), the one recorded plate whose plate,
// swaps and one-tap changes pass for all eleven profiles; it is projected onto the v6 schema (fields the schema has not are left out) and
// given honest tags. Rescue: the recorded v6 reply to "Paneer butter masala with 2 butter naan" (eval/v6/results-window-72758ac.json), with
// its own tags. The log: the recorded v6 reply to "dal, 2 roti, bhindi sabzi, small bowl rice, salad" (the same file).
const project = (v, s) => { if (v == null || !s) return v;
  if (s.type === 'OBJECT' && v && typeof v === 'object') { const o = {}; for (const k of Object.keys(s.properties)) if (k in v) o[k] = project(v[k], s.properties[k]); return o; }
  if (s.type === 'ARRAY' && Array.isArray(v)) return v.map(x => project(x, s.items)); return v; };
const srcPlate = rec('eval/v5/results-live-r37.json', 'jain-lunch').reply.raw.meals.find(m => /Bajra Rotla/.test(m.title));
const MARK = { protein: 137, base: 139 }, TARGET = { protein: 1, base: 2 };   // the swap each cell writes into, found again by its grams
const basePlate = (schema) => { const m = project(J(srcPlate), schema); m.contains = ['grain'];
  m.items.forEach(i => { i.contains = i.food === m.grain.food || /rice/i.test(i.food) ? ['grain'] : ['plain']; });
  m.swaps.protein.forEach(s => { s.contains = ['plain']; }); m.swaps.base.forEach(s => { s.contains = ['grain']; });
  for (const k of ['protein', 'base']) m.swaps[k][TARGET[k]].grams = MARK[k];
  for (const c of Object.keys(m.alchemy)) Object.assign(m.alchemy[c], { contains: ['plain'], add_item: '', add_grams: 0 });
  // the recorded express change raises the grain (80 g to 120 g) while its carbs fall 2 g: m2 of the safety audit of c666d34, now not offered
  // (fix-r15). The base keeps it at the grain's own grams, so every change is offered and no drop below is vacuous
  if (m.alchemy.express) m.alchemy.express.grain_grams_after = m.grain.grams;
  m.taste = ['tangy', 'smoky', 'spicy']; m.planned_around = ['plain_day']; return m; };
const RESC = rec('eval/v6/results-window-72758ac.json', 'rescue-with-day'), RESCTEXT = 'Paneer butter masala with 2 butter naan';
const LOG = rec('eval/v6/results-window-72758ac.json', 'log-thali'), LOGTEXT = 'dal, 2 roti, bhindi sabzi, small bowl rice, salad';
const TYPEDW = { log: new Set(LOGTEXT.toLowerCase().match(/[a-z]+/g)) }, LOGITEM0 = LOG.reply.raw.items[0].food;
const TNAME = {};   // the target swap's name in the base output, per kind and profile (set below)

// ---------- the paths a reply takes, per kind and profile ----------
const prof = o => Object.assign({}, BASE, o);
const KIND = {
  meals: o => { const pl = a.plan('meals', { profile: prof(o), ctx: { meal: 'lunch' } }); const sch = pl.schema;
    return { schema: sch, base: () => ({ status: 'ok', refer_reason: 'none', meals: [basePlate(sch.properties.meals.items)] }), run: r => pl.check(r) }; },
  tune: o => { const mp = a.plan('meals', { profile: prof(o), ctx: { meal: 'lunch' } }), ms = mp.schema.properties.meals.items, bp = basePlate(ms);
    const shown = (mp.check({ status: 'ok', refer_reason: 'none', meals: [J(bp)] }).meals || [])[0];
    const pl = shown && a.plan('tune', { profile: prof(o), slot: 'lunch', meal: shown });
    if (!pl || !pl.check) return null;
    return { schema: pl.schema, base: () => project({ swaps: J(bp.swaps), alchemy: J(bp.alchemy) }, pl.schema), run: r => pl.check(r) }; },
  rescue: o => { const pl = a.plan('rescue', { profile: prof(o), ctx: { meal: 'dinner', text: RESCTEXT } }); if (!pl.check) return null;
    return { schema: pl.schema, base: () => project(J(RESC.reply.raw), pl.schema), run: r => pl.check(r) }; },
  log: o => { const pl = a.plan('log', { profile: prof(o), ctx: { meal: 'lunch', text: LOGTEXT } }); if (!pl.check) return null;
    return { schema: pl.schema, base: () => project(J(LOG.reply.raw), pl.schema), run: r => pl.check(r) }; } };

// is the element offered in a checked output?
const plateOf = (kind, out) => kind === 'meals' ? (out.meals || [])[0] : kind === 'tune' && out.status === 'ok' ? out : null;
function offered(kind, el, out) {
  if (el === 'reply') return kind === 'meals' ? (out.meals || []).length > 0 : out.status === 'ok';
  if (el === 'plate') return (out.meals || []).length > 0;
  if (el === 'dish' || el === 'log') return out.status === 'ok';
  const pm = plateOf(kind, out); if (!pm) return false;
  const [t, k] = el.split(':');
  if (t === 'swap') return (pm.swaps[k] || []).some(s => s.grams === MARK[k]);
  if (t === 'list') return (pm.swaps[k] || []).length > 0;
  if (t === 'change') return !!(pm.alchemy || {})[k];
  throw new Error('unknown element ' + el); }
// the text a client can see or a log keeps: every string in the checked output but the tag lists
const texts = (o, acc) => { acc = acc || []; if (typeof o === 'string') acc.push(o); else if (Array.isArray(o)) o.forEach(x => texts(x, acc)); else if (o && typeof o === 'object') for (const k of Object.keys(o)) if (k !== 'contains') texts(o[k], acc); return acc; };
const count = (out, w) => { const rx = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'); return texts(out).reduce((n, s) => n + (s.match(rx) || []).length, 0); };
// the energy an output counts: the plate or the log, and every swap and change it offers
const energy = (out) => JSON.stringify([(out.meals || []).map(m => [m.kcal, m.swaps, m.alchemy]), out.kcal, out.swaps, out.alchemy, out.dish && out.dish.kcal]);

// ---------- writing into a leaf ----------
// the index each "[]" takes: the first plate, the first item, the target swap, the first word of a list
const idxFor = (segs, i) => segs[i - 1] === 'protein' ? TARGET.protein : segs[i - 1] === 'base' ? TARGET.base : 0;
function setAt(r, p, v) { let o = r; for (let i = 0; i < p.length - 1; i++) { const s = p[i]; if (s === '[]') { o = o[idxFor(p, i)]; } else { if (o[s] == null) o[s] = p[i + 1] === '[]' ? [] : {}; o = o[s]; } if (o == null) return false; }
  const last = p[p.length - 1]; if (last === '[]') { if (!Array.isArray(o)) return false; o[idxFor(p, p.length - 1)] = v; } else o[last] = v; return true; }
function getAt(r, p) { let o = r; for (let i = 0; i < p.length; i++) { const s = p[i]; o = s === '[]' ? (o || [])[idxFor(p, i)] : (o || {})[s]; } return o; }
const PAD = 'Steamed cucumber ';
const past = (capN, w) => { let s = ''; while (s.length <= (capN || 240)) s += PAD; return s + w; };
const variants = (w, capN, brand) => brand ? [['alone', cap1(w)]] : [['alone', cap1(w)], ['after a filler word', 'Steamed ' + w], ['after a non-grain word', 'Besan and ' + w],
  ['past the cap', past(capN, w)], ['beside a banned word', cap1(BANW[w.length % BANW.length]) + ' ' + w]];

// ---------- the run ----------
const res = {}; let cellsN = 0;
const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
const leafSeen = {}, ruleUsed = {};
for (const kind of Object.keys(KIND)) for (const [pname, po, words, tags] of PROFILES) {
  const K0 = KIND[kind](po); const tag = `${kind}, ${pname}`;
  add('the base reply is accepted for every kind and profile', !!K0, `${tag}: plan() gave no check`); if (!K0) continue;
  const L = leaves(K0.schema, []), R = RULES[kind];
  // completeness: every leaf has a rule, every rule a leaf
  for (const l of L) { const kk = key(l.path); leafSeen[kind + ':' + kk] = 1; ruleUsed[kind + ':' + kk] = 1;
    add('completeness: every schema leaf the model may write has a rule', !!R[kk], `${kind}: the leaf "${kk}" (${l.kind}) has no rule`); }
  for (const kk of Object.keys(R)) add('completeness: every rule names a schema leaf', L.some(l => key(l.path) === kk), `${kind}: the rule "${kk}" names no leaf of the schema`);
  const base = K0.base(), bout = K0.run(J(base));
  // non-vacuous: the base offers every element a leaf belongs to
  const els = [...new Set(L.map(l => (R[key(l.path)] || {}).el).filter(Boolean))];
  for (const el of els) add('the base offers every element a leaf belongs to (no drop is vacuous)', offered(kind, el, bout), `${tag}: the base reply does not offer ${el}: ${JSON.stringify(bout).slice(0, 300)}`);
  const bEnergy = energy(bout);
  { const pm = plateOf(kind, bout); for (const k of ['protein', 'base']) { const t = pm && (pm.swaps[k] || []).find(x => x.grams === MARK[k]); TNAME[k] = t ? t.food : null; } }
  // the figure leaves (fix-r15): each injected value; an integer inside the range may stay (as written), anything else drops its element
  const FIGV = (lo, hi, b) => [['one under the range', lo - 1], ['one over the range', hi + 1], ['zero', 0], ['null', null], ['an empty string', ''], ['a negative number', -5],
    ['a word', 'x'], ['the base figure as a string', String(b)], ['a huge number', 1e9], ['a fraction', 1.5], ['true', true],
    ['the bottom of the range', lo], ['the top of the range', hi]];   // inside the range: offered as written, or dropped by another rule
  const offeredF = (el, out) => el.startsWith('swap:') ? (() => { const pm = plateOf(kind, out); return !!pm && (pm.swaps[el.split(':')[1]] || []).some(x => x.food === TNAME[el.split(':')[1]]); })() : offered(kind, el, out);
  for (const l of L) { const kk = key(l.path), rule = R[kk]; if (!rule || rule.k !== 'figure') continue;
    const id = `${kind} ${kk} (figure)`;
    for (const mode of rule.item ? ['', 'item'] : ['']) {
      const lo = mode ? rule.item.lo : rule.lo, hi = mode ? rule.item.hi : rule.hi, show = mode ? rule.item.show : rule.show;
      const prep = (r) => { if (mode) setAt(r, l.path.slice(0, -1).concat('add_item'), 'Cucumber'); };
      const b0 = J(base); prep(b0); const bv = mode ? 60 : getAt(b0, l.path); if (mode) setAt(b0, l.path, bv);
      // control: the base's own figure is offered, and shown as written
      { const out = K0.run(J(b0)), sv = show ? show(kind, out) : undefined;
        add(`${id}: the base figure is offered as written (control)`, offeredF(rule.el, out) && (sv === undefined || sv === bv), `${tag}${mode ? ' (a food added)' : ''}: ${kk} = ${JSON.stringify(bv)}: ${offeredF(rule.el, out) ? 'shown as ' + JSON.stringify(sv) : 'the ' + rule.el + ' was not offered'}`); }
      for (const [vn, v] of FIGV(lo, hi, bv)) { const r = J(b0); if (setAt(r, l.path, v) === false) { add(id, false, `${tag}: could not write ${vn}`); continue; } cellsN++;
        let out; try { out = K0.run(r); } catch (e) { add(id, false, `${tag}: ${vn} threw ${e}`); continue; }
        const ok = Number.isInteger(v) && v >= lo && v <= hi, on = offeredF(rule.el, out), sv = on && show ? show(kind, out) : undefined;
        add(id, ok ? (!on || sv === undefined || sv === v) : !on, `${tag}${mode ? ' (a food added)' : ''}: ${vn} (${JSON.stringify(v)}): ${on ? 'the ' + rule.el + ' is offered' + (show ? ', its figure shown as ' + JSON.stringify(sv) : '') : 'dropped'}`); } } }
  for (const l of L) { const kk = key(l.path), rule = R[kk]; if (!rule || rule.k === 'figure') continue;
    const id = `${kind} ${kk} (${rule.k})`;
    const cell = (what, mutate, want) => { const r = J(base); if (mutate(r) === false) { add(id, false, `${tag}: could not write ${what}`); return; } cellsN++;
      let out; try { out = K0.run(r); } catch (e) { add(id, false, `${tag}: ${what} threw ${e}`); return; }
      const v = want(out); add(id, v === true, `${tag}: ${what}: ${v}`); };
    const dropped = (out) => offered(kind, rule.el, out) ? `the ${rule.el} is offered` : true;
    // hidden: the element is dropped (a referral too), or the word shows no more often than in the base and no figure moved; on the log, a
    // word the client typed may show (their own words)
    const hidden = (w) => (out) => !offered(kind, rule.el, out) || (kind === 'log' && TYPEDW[kind].has(w.toLowerCase())) || (count(out, w) <= count(bout, w) && energy(out) === bEnergy) ? true
      : `"${w}" is shown (${count(out, w)} against ${count(bout, w)} in the base) or the figures moved`;
    if (rule.k === 'tags' || rule.k === 'suppTags') {
      for (const t of tags.concat('supplement')) cell(`tag "${t}" added`, r => { const v = getAt(r, l.path); return setAt(r, l.path, (Array.isArray(v) ? v : []).concat(t)); },
        out => rule.k === 'tags' || t === 'supplement' ? dropped(out)
          : offered(kind, rule.el, out) ? true : 'the dish was refused, though S15 helps a typed dish whatever the tags say (only a supplement is refused)');
      continue; }
    if (rule.k === 'array') {
      // the array filled to its cap with copies of its first element (offered, so the drop is for the element over it), then one more
      const capN = rule.cap, w = words[0];
      const pad = r => { const arr = getAt(r, l.path); if (!Array.isArray(arr) || !arr.length) return null; const x = J(arr[0]); while (arr.length < capN) arr.push(J(x)); return { arr, x }; };
      const rp = J(base), pp = pad(rp), pout = pp && K0.run(rp);
      add('an array filled to its cap is offered (the drop is for the element over it)', !!pp && offered(kind, rule.el, pout), `${tag}: ${kk} filled to ${capN} was not offered`);
      if (!pp) continue;
      cell(`one element over the cap of ${capN}, carrying energy and "${w}"`, r => { const q = pad(r); if (!q) return false; const { arr, x } = q;
        if (rule.over === 'string') arr.push(cap1(w));
        else if (rule.over === 'item') { arr.push({ food: cap1(w), grams: 120, group: 'protein', contains: ['plain'] }); const p = getAt(r, l.path.slice(0, -1)); p.kcal += 200; p.protein += 20; p.carbs += 20; p.fats += 4; }
        else if (rule.over === 'swap') arr.push(Object.assign(x, { food: cap1(w), grams: 141, deltaKcal: 90, deltaProtein: 10, deltaCarbs: 10, deltaFats: 2 }));
        else if (rule.over === 'plate') { const y = J(x); y.items[0].food = cap1(w); y.kcal += 200; y.protein += 20; y.carbs += 20; y.fats += 4; arr.push(y); }
        else if (rule.over === 'logitem') { arr.push({ food: w, grams: 120, group: 'protein' }); r.kcal += 200; r.protein += 20; r.carbs += 20; r.fats += 4; }
        return true; },
        out => !offered(kind, rule.el, out) || (count(out, w) <= count(pout, w) && !JSON.stringify(out).includes('"grams":141') && energy(out) === energy(pout))
          ? true : `the element over the cap is shown, or its energy is counted (${energy(out).slice(0, 80)} against ${energy(pout).slice(0, 80)})`);
      continue; }
    // a text leaf
    const isWord = rule.k === 'drop' || rule.k === 'suppDrop';
    for (const [cls, list] of [['food', words], ['supplement', SUPP], ['brand', BRAND]]) for (const w of list) for (const [vn, v] of variants(w, rule.cap, cls === 'brand')) {
      const want = rule.k === 'drop' || (rule.k === 'suppDrop' && cls !== 'food') ? dropped : rule.k === 'enum' ? hidden(w) : hidden(w);
      cell(`${cls} "${w}" ${vn}`, r => setAt(r, l.path, v), (out) => { const d = want(out); if (d !== true) return d;
        // the drop is the word check's, not the shape's: a plate dropped for a plain word reports diet or supplement
        if (isWord && kind === 'meals' && rule.el === 'plate' && vn !== 'past the cap' && vn !== 'beside a banned word') { const why = Object.keys(out.dropped || {});
          if (!why.some(k => /^(diet|supplement)$/.test(k))) return `dropped, but for ${why.join(',')} (not the word check)`; }
        return true; }); }
    // the cap on its own: honest content with no barred word past the leaf's cap (and past a name's display cap), text in a script the
    // checks cannot read, and a field that is not text. The element drops (a word leaf), or the content is shown nowhere (a hidden leaf);
    // nothing is cut to fit (fix-r14: the cells above carry a barred word, which the raw read catches by itself)
    { const MK = 'Marker', fill = (n) => { let x = MK; while (x.length <= n) x += ' ' + MK.toLowerCase(); return x; };
      const DISP = /^(?:meals\[\]\.)?(?:items\[\]\.food|swaps\.(?:protein|base)\[\]\.food)$/.test(kk) ? 60 : /add_item$/.test(kk) ? 40 : 0;
      const plainWant = (out) => isWord ? dropped(out) : (!offered(kind, rule.el, out) || count(out, MK) === 0 ? true : `"${MK}" is shown`);
      const odd = [['text in a script the checks cannot read', '\u0926\u093E\u0932 \u091A\u093E\u0935\u0932'], ['a field that is not text', 42]];
      if (rule.cap) odd.unshift(['honest text past the cap of ' + rule.cap, fill(rule.cap)]);
      if (DISP) odd.unshift(['honest text past the display cap of ' + DISP, fill(DISP)]);
      for (const [vn, v] of odd) cell(vn, r => { if (/add_item$/.test(kk)) setAt(r, l.path.slice(0, -1).concat('add_grams'), 60); return setAt(r, l.path, v); },
        out => { if (typeof v !== 'string') return isWord ? dropped(out) : true;
          if (/[^\x00-\x7f]/.test(v)) return isWord ? dropped(out) : !texts(out).some(t => t.includes(v.slice(0, 3))) ? true : 'the text is shown'; return plainWant(out); }); }
    // control: a plain food in the same leaf keeps the element (so the cells above test the word, not the leaf)
    if (isWord) { const ctl = /made_of/.test(kk) ? 'jowar' : /grain\.food$/.test(kk) ? null : /swaps\.base/.test(kk) ? 'Ragi roti' : 'Cucumber';
      if (ctl) { const r = J(base); setAt(r, l.path, ctl); if (/add_item$/.test(kk)) setAt(r, l.path.slice(0, -1).concat('add_grams'), 60);
        add(`control: a plain food in ${kind} ${kk} keeps the ${rule.el}`, offered(kind, rule.el, K0.run(r)), `${tag}: "${ctl}" in ${kk} was dropped`); } }
  }
  // a written add_item needs its grams; the cells above write it with the base's 0 grams, so write it again with grams (the change is offered
  // only with them)
  for (const c of ['protein', 'glucose', 'express', 'gut']) { const kk = (kind === 'meals' ? 'meals[].' : '') + 'alchemy.' + c + '.add_item'; if (!R[kk] || kind === 'rescue' || kind === 'log') continue;
    const p = kk.replace(/\[\]/g, '.[]').split('.'); for (const w of words.concat(SUPP)) for (const [vn, v] of variants(w, 200)) { const r = J(base); setAt(r, p, v); setAt(r, p.slice(0, -1).concat('add_grams'), 60); cellsN++;
      add(`${kind} ${kk} with its grams (drop)`, !offered(kind, 'change:' + c, K0.run(r)), `${tag}: "${v.slice(-40)}" (${vn}) added by the ${c} change was offered`); } }
}
// Rescue: the typed text and the dish name are read apart (safety audit of 7eaadcf, M1 a): a brand typed with an honest dish name is refused
for (const [pname, po] of PROFILES) for (const b of BRAND.concat(SUPP.map(cap1))) for (const nm of [b, 'Nutrition drink', 'Vanilla shake']) {
  const pl = a.plan('rescue', { profile: prof(po), ctx: { meal: 'dinner', text: b } }); const r = J(RESC.reply.raw); r.dish.name = nm; r.dish.contains = ['dairy']; cellsN++;
  add('rescue: a typed supplement with a named dish is refused (S9)', pl.check && pl.check(r).status !== 'ok', `${pname}: typed "${b}", dish "${nm}" was helped`); }

let fail = 0; const byLeaf = {};
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} cells, ${r.bad.length} counter-examples`);
  r.bad.slice(0, +(process.env.SHOWN || 3)).forEach(b => console.log('       ' + b)); if (r.bad.length > +(process.env.SHOWN || 3)) console.log(`       ... ${r.bad.length - +(process.env.SHOWN || 3)} more`); fail += r.bad.length; }
console.log(`schema injection: ${Object.keys(leafSeen).length} leaves over ${Object.keys(KIND).length} kinds, ${PROFILES.length} profiles, ${cellsN} cells`);
console.log('owner questions (the invariants are silent; held to "nothing shown"): ' + Object.entries(OWNERQ).map(([k, v]) => k + ': ' + v).join('; '));
if (cellsN < 5000) { console.log('FAIL the grid wrote too few cells'); fail++; }
console.log(fail ? `schema injection: ${fail} counter-examples` : 'schema injection: every leaf holds');
process.exit(fail ? 1 : 0);
