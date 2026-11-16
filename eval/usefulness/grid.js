// Generated grids: the OLD build (ba4d8dc, or OLDREF) against this one, on inputs made by a grid rather than recorded names. Each line is one
// cell: what the old build showed -> what this build shows, marked "changed" or "same". Every changed line is read by hand before a merge.
//   node eval/usefulness/grid.js menus|grain|referral     (writes eval/usefulness/grid-<name>.txt)
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), OLDREF = process.env.OLDREF || 'ba4d8dc', KIND = process.argv[2];
const core = (page) => { const o = '<script id="np-core">', a = page.indexOf(o) + o.length, ctx = vm.createContext({ console }); vm.runInContext(page.slice(a, page.indexOf('</script>', a)), ctx); return ctx; };
const OLD = core(execSync(`git show ${OLDREF}:hosted/v6/index.html`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString()), NEW = core(fs.readFileSync(path.join(ROOT, 'hosted/v6/index.html'), 'utf8'));
const OLDAPP = execSync(`git show ${OLDREF}:src/v6/app.js`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString(), NEWAPP = fs.readFileSync(path.join(ROOT, 'src/v6/app.js'), 'utf8');
const BASE = { goal: 'hold', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const J = (x) => JSON.stringify(x), out = [];
let changed = 0; const cell = (key, a, b) => { const c = a !== b; if (c) changed++; out.push(`${c ? 'changed' : 'same   '} | ${key} | ${a}${c ? ' -> ' + b : ''}`); };

if (KIND === 'menus') {
  // heading x price format x same or varied prices x a number in the name; each dish copied whole, price and all, as the model does.
  // "same" prices are all 65, so a price that equals a name number is in every same-price menu.
  const HEAD = [['none', ''], ['CAPS', 'STARTERS'], ['colon', 'Starters:']];
  const PRICE = [['plain', (p) => ' ' + p], ['Rs', (p) => ' Rs ' + p], ['rupee', (p) => ' ₹' + p], ['/-', (p) => ' ' + p + '/-'], ['Half/Full', (p) => ' Half ' + p + ' Full ' + (p + 100)], ['none', () => '']];
  const NAMES = [['none', 'Paneer Tikka'], ['65', 'Chicken 65'], ['7 Up', '7 Up'], ['count + piece', 'Paneer Tikka 6 Pcs'], ['measure', 'Chicken Biryani 1 Kg'],
    ['a keep word after another word', 'Aloo Gobi'], ['a keep word after another word', 'Butter Chicken'],
    // typographic punctuation in a name (safety audit of b4633dd, B1: the intake folds it to the ASCII form)
    ['an en dash', 'Chicken 65 \u2013 Dry'], ['a curly apostrophe', 'Chef\u2019s Special Thali'], ['a non-breaking hyphen', 'One\u2011pot Khichdi']];   // priced 65 in every priced menu: "Aloo Gobi 65" is a price, not a keep-list name
  for (const [hk, h] of HEAD) for (const [pk, pf] of PRICE) for (const same of [true, false]) for (const [nk, nm] of NAMES) {
    const prices = same ? [65, 65, 65] : [65, 120, 240], lines = [nm + pf(prices[0]), 'Veg Thali' + pf(prices[1]), 'Sweet Lassi' + pf(prices[2])].map(l => l.trim()), typed = (h ? h + '\n' : '') + lines.join('\n');
    // one cell per menu: the three dishes on the typed menu, then the first dish read from a photo of it
    const run = (E, line, photo) => { const pl = E.plan('menu', { profile: BASE, ctx: { meal: 'lunch', text: photo ? '' : typed }, image: photo ? 'AAAA' : undefined });
      const r = pl.check({ status: 'ok', refer_reason: 'none', dishes: [{ as_written: line, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, request: 'none', contains: ['plain'], contains_listed: ['plain'], with_contains: ['plain'], planned_around: [] }], leave: [] });
      return (r.orders || []).length ? J(r.orders[0].name) : '(not shown: ' + J(r.dropped || r.status) + ')'; };
    const all = (E) => lines.map(l => run(E, l, false)).join(', ') + ' / photo ' + run(E, lines[0], true);
    cell(`heading ${hk}, price ${pk}, ${same ? 'same' : 'varied'} prices, name ${nk} | ${J(typed)}`, all(OLD), all(NEW)); } }

if (KIND === 'grain') {
  // a plate whose grain item is "Jeera rice", with the grain declared equal to the item, inside it ("Rice"), or different ("Jowar roti", not on
  // the plate) x diabetes or not x medicines or not x every protein swap, grain swap and one-tap combination the app accepts
  const grab = (app, name) => { const i = app.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = app.indexOf('{', i); for (; j < app.length; j++) { if (app[j] === '{') d++; else if (app[j] === '}') { d--; if (!d) break; } } return app.slice(i, j + 1); };
  const appOf = (E, app) => { const src = ['has', 'profileOut', 'viewOf', 'swapAt', 'composedWhy', 'plateWhy'].map(n => grab(app, n)).join('\n');
    return (P, C, UI) => { E.P = P; E.C = C; E.UI = UI; return vm.runInContext('(function(){' + src + '\nreturn {viewOf: viewOf, plateWhy: plateWhy};})()', E); }; };
  const A = { old: appOf(OLD, OLDAPP), new: appOf(NEW, NEWAPP) };
  const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
  const ch = (item, after, d) => Object.assign({ titleSuffix: '+ ' + item.toLowerCase(), note: 'x', add_item: item, add_grams: 80, minutes: 20, contains: ['plain'], deltaFiber: 2 }, after === undefined ? {} : { grain_grams_after: after }, d);
  const AL = { glucose: ch('Sauteed beans', 150, { deltaKcal: -120, deltaProtein: 2, deltaCarbs: -30, deltaFats: 0 }), express: ch('Cucumber raita', 250, { deltaKcal: 80, deltaProtein: 0, deltaCarbs: 20, deltaFats: 0 }),
    protein: ch('Roasted chana', undefined, { deltaKcal: 110, deltaProtein: 6, deltaCarbs: 15, deltaFats: 2 }), gut: ch('Steamed carrots', 200, { deltaKcal: 40, deltaProtein: 2, deltaCarbs: 6, deltaFats: 1 }) };
  const SW = { protein: [{ food: 'Rajma', grams: 150, contains: ['plain'], ...z }, { food: 'Chole', grams: 150, contains: ['plain'], deltaKcal: 20, deltaProtein: 1, deltaCarbs: 4, deltaFats: 0, deltaFiber: 1 }],
    base: [{ food: 'Jeera rice', grams: 200, made_of: 'rice', contains: ['grain'], ...z }, { food: 'Bajra khichdi', grams: 200, made_of: 'bajra and moong dal', contains: ['grain'], deltaKcal: 20, deltaProtein: 2, deltaCarbs: -4, deltaFats: 2, deltaFiber: 4 }] };
  for (const [gk, gfood, gmade] of [['equal', 'Jeera rice', 'rice'], ['inside', 'Rice', 'rice'], ['different', 'Jowar roti', 'jowar']]) for (const dia of [false, true]) for (const meds of [false, true]) {
    const o = Object.assign({}, BASE, { diet: 'veg', health: dia ? 'diabetes' : 'none', meds: meds ? 'yes' : 'no' });
    const raw = { title: 'x', prepMinutes: 25, items: [{ food: 'Rajma', grams: 150, group: 'protein', contains: ['plain'] }, { food: 'Jeera rice', grams: 200, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 120, group: 'greens', contains: ['plain'] }],
      grain: { food: gfood, made_of: gmade, grams: 200 }, contains: ['grain'], kcal: 780, protein: 30, carbs: 105, fats: 24, fiber: 12, why: [], swaps: SW, alchemy: AL, planned_around: [], for_you: '', taste: [] };
    const key = `grain ${gk} ("${gfood}"), ${dia ? 'diabetes' : 'no diabetes'}, ${meds ? 'medicines' : 'no medicines'}`;
    const states = (E, which) => { const r = E.plan('meals', { profile: o, ctx: { meal: 'lunch' } }).check({ status: 'ok', refer_reason: 'none', meals: [JSON.parse(J(raw))] }), m = (r.meals || [])[0], res = {};
      if (!m) return { '': 'plate not shown: ' + J(r.dropped) };
      const keys = Object.keys(m.alchemy || {}), P = Object.assign({ conds: dia ? ['diabetes'] : [], leave: [], region: 'n', focus: 'none' }, o), mm = Object.assign(JSON.parse(J(m)), { planned: [] });
      res['offered'] = `grain "${m.grain.food}"; protein swaps ${J(m.swaps.protein.map(s => s.food))}; grain swaps ${J(m.swaps.base.map(s => s.food))}; changes ${J(keys)}`;
      for (let swp = 0; swp < 2; swp++) for (let swb = 0; swb < 2; swb++) for (const k of ['', 'glucose', 'express', 'protein', 'gut', 'glucose+protein', 'express+gut']) {
        const UI = { swp, swb, alc: {} }; k.split('+').filter(Boolean).forEach(x => { UI.alc[x] = true; }); if (k && k.split('+').some(x => keys.indexOf(x) < 0)) { res[`swp ${swp} swb ${swb} ${k || 'none'}`] = 'not offered'; continue; }
        if ((swp && !mm.swaps.protein[swp]) || (swb && !mm.swaps.base[swb])) { res[`swp ${swp} swb ${swb} ${k || 'none'}`] = 'not offered'; continue; }
        const f = A[which](P, { meal: 'lunch' }, UI); let why = ''; try { why = f.plateWhy(mm); } catch (e) { why = 'threw'; }
        if (why) { res[`swp ${swp} swb ${swb} ${k || 'none'}`] = 'refused: ' + why; continue; }
        const v = f.viewOf(mm); res[`swp ${swp} swb ${swb} ${k || 'none'}`] = `${v.items.map(i => i.grams + ' g ' + i.food).join(', ')}; ${v.n.kcal} kcal ${v.n.protein}/${v.n.carbs}/${v.n.fats}; notes ${J(v.notes)}`; }
      return res; };
    const a = states(OLD, 'old'), b = states(NEW, 'new');
    for (const k of [...new Set(Object.keys(a).concat(Object.keys(b)))]) cell(`${key} | ${k || 'plate'}`, a[k] || '(none)', b[k] || '(none)'); } }

if (KIND === 'referral') {
  // meat word x kidney or gurda spelling x dish word, kidney or gurda spelling x condition word, and pregnancy spellings x food contexts:
  // where each typed text goes on the four text paths (R = referred before the model, U = urgent, M = sent to the model), and, for the
  // dish names, a photo menu that lists the dish (refer, or the dish offered)
  const route = (E, t) => ['meals', 'rescue', 'menu', 'log'].map(k => { const pl = E.plan(k, { profile: BASE, ctx: { meal: 'lunch', text: t } }); return pl.reply ? (pl.reply.urgent ? 'U' : 'R') : 'M'; }).join('');
  const photo = (E, n) => { const r = E.plan('menu', { profile: BASE, ctx: { meal: 'lunch', text: '' }, image: 'AAAA' }).check({ status: 'ok', refer_reason: 'none', leave: [],
    dishes: [{ as_written: n, portion: 'about 300 g', kcal: 520, protein: 24, carbs: 40, fats: 30, fiber: 6, grain_made_of: '', grain_grams: 0, with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0, request: 'none', contains: ['meat'], contains_listed: ['meat'], with_contains: ['plain'], planned_around: [] }] });
    return r.status === 'refer' ? 'photo menu refers' : (r.orders || []).length ? 'photo menu offers ' + J(r.orders[0].name) : 'photo menu: ' + r.status + ' ' + J(r.dropped); };
  const KID = ['kidney', 'kidneys', 'kidni', 'kindey', 'kedney', 'kidaney', 'kiney', 'kdney', 'gurda', 'gurde', 'gurdey', 'gurdo', 'gurdon', 'gurday', 'gurdae', 'gurdai', 'goorda', 'guurda', 'gurdha', 'gurdein', 'gurdy',
    'kidney beans', 'kidney bean', 'rajma', 'Gurdwara', 'Gurudwara', 'Gurdeep', 'kidnap',
    'kydney', 'kideney', 'gurrda', 'gurrde', 'mutrapind', 'vrukka', 'kydney beans', 'kideney beans', 'Gurrdwara'];   // the referral window's kidney words (D4), with their neighbours
  for (const meat of ['Mutton', 'Chicken', 'Goat', '']) for (const k of KID) for (const dish of ['fry', 'masala', 'curry', '']) {
    const t = [meat, k, dish].filter(Boolean).join(' '); if (!t.trim()) continue; const n = t.charAt(0).toUpperCase() + t.slice(1);
    cell(`dish | ${J(n)}`, route(OLD, n) + ' / ' + photo(OLD, n), route(NEW, n) + ' / ' + photo(NEW, n)); }
  for (const k of KID) for (const cond of ['problem', 'kharab hai', 'stone', 'weak hain', 'ki bimari']) { const t = 'Mere ' + k + ' ' + cond; cell(`condition | ${J(t)}`, route(OLD, t), route(NEW, t)); }
  for (const t of ['CKD3', 'ckd-3', 'stage 3 CKD', 'creat 2.1', 'creatinine 2.1', 'creative salad', 'transplant patient']) cell(`condition | ${J(t)}`, route(OLD, t), route(NEW, t));
  const PREG = ['pregnant', 'pregnent', 'prego', 'preggy', 'preggo', 'TTC', 'BF mom', 'BF-ing', 'EBF', 'BF', 'mommy to be', 'mom-to-be', 'jachcha', 'jaccha', 'baby bump', 'due in March', 'due next month', '7th month chal raha hai',
    'baccha hone wala hai', 'bachcha hone wala hai', 'delivery due next month', 'delivery due in 20 minutes', 'I just had a baby', 'delivered last month'];
  for (const p of PREG) for (const ctx of ['%', 'I am %, lunch ideas', 'poha for %', 'pasta with % sauce', '% and tea', 'had % at 9']) { const t = ctx.replace('%', p); cell(`pregnancy | ${J(t)}`, route(OLD, t), route(NEW, t)); }
  // the referral window's 29 phrasings (eval/referral/held-out.json) and the food-text controls that share a word with them (owner, 16 Nov, D4)
  for (const [g, t] of JSON.parse(fs.readFileSync(path.join(ROOT, 'eval/referral/held-out.json'), 'utf8'))) cell(`window ${g === 'k' ? 'kidney' : 'pregnancy'} | ${J(t)}`, route(OLD, t), route(NEW, t));
  for (const t of JSON.parse(fs.readFileSync(path.join(ROOT, 'test/safety/lexicon.json'), 'utf8')).known.notReferWindow) cell(`window control | ${J(t)}`, route(OLD, t), route(NEW, t));
  // typographic apostrophes and dashes (safety audit of b4633dd, B1): the lexicon's phrasings whose pattern spells one, and the controls
  // whose exclusion spells one, in the ASCII form and in a few typographic forms
  const LXK = JSON.parse(fs.readFileSync(path.join(ROOT, 'test/safety/lexicon.json'), 'utf8')).known;
  const FORMS = [["'", '\u2019'], ["'", '\u00B4'], ["'", '\u02BC'], ['-', '\u2010'], ['-', '\u2011'], ['-', '\u2013'], ['-', '\u2014'], ['-', '\u2212']];
  for (const [g, list] of [['typographic refer', LXK.referPunct || []], ['typographic urgent', LXK.urgentPunct || []], ['typographic control', LXK.notReferPunct || []]])
    for (const t0 of list) for (const t of [t0].concat(FORMS.filter(([a]) => t0.includes(a)).map(([a, b]) => t0.split(a).join(b))))
      cell(`${g} | ${J(t)}`, route(OLD, t), route(NEW, t)); }

if (!out.length) { console.error('usage: node eval/usefulness/grid.js menus|grain|referral'); process.exit(2); }
const head = `# grid-${KIND}: ${out.length} cells, ${changed} changed between ${OLDREF} and this build (generated by eval/usefulness/grid.js ${KIND}).\n# changed | cell | old shown -> new shown\n`;
fs.writeFileSync(path.join(__dirname, `grid-${KIND}.txt`), head + out.join('\n') + '\n');
console.log(head.trim());
