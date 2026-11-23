// Nothing the phone holds or sends is refused (fix-r19). The intake rule (docs/SAFETY-INVARIANTS.md) turned clamps into bad_request. A request the phone
// can build from a state it can really be in must never be refused, or that client is locked out (m5's failure mode, every request answers "Next Plate couldn't
// read that"). This test builds the request the way the phone does, with the phone's own functions from src/v6/app.js run against np-core (profileOut, fileOut,
// ctxOut, appetite, buildFile and the page's own load of its store), and asks plan() for meals, tune, Rescue and the log:
//   - long, heavy logging: ten days, four meals a day, the largest meal the log or a Rescue dish can hold (and every move on it), many distinct titles of every
//     length, several events for one slot, every other event type, habits that make the most patterns the phone can make (the search is in this file);
//   - the store as the live page (6febc1a) leaves it: the profile and events in the shape that page writes, a body figure at the set-up's old bounds (age 16 and
//     17 too), an odd or missing one, a profile with fields left out, the older np5 store, an appetite left by an older build;
//   - every clock time (every quarter hour) and every meal tab.
// A request that answers bad_request, or any error, fails. A kidney or pregnancy referral is an answer, not a refusal.
// usage: node test/safety/phone-states.js [hosted/v6/index.html | hosted/v6/index.min.html | hosted/v5/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
const page = fs.readFileSync(pageFile, 'utf8'), A = {}; vm.createContext(A); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], A);
const appSrc = fs.readFileSync(process.env.NP_APP || path.join(ROOT, 'src/v6/app.js'), 'utf8');
const grab = (name) => { const i = appSrc.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = appSrc.indexOf('{', i); for (; j < appSrc.length; j++) { if (appSrc[j] === '{') d++; else if (appSrc[j] === '}') { d--; if (!d) break; } } return appSrc.slice(i, j + 1); };
const B = require(path.join(ROOT, 'eval/v6/bodies.js')), J = (x) => JSON.parse(JSON.stringify(x)), safe = (f, d) => { try { return f(); } catch (e) { return d; } };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };

// ---------- the phone, with its own load ----------
const FNS = ['has', 'healthOf', 'bodyStored', 'appKept', 'profileOut', 'fileOut', 'appetite', 'dayNo', 'clockText', 'ctxOut', 'rules', 'bodyLive', 'bodyNeed', 'bodyHold', 'api', 'medsFact', 'medsSetupOK', 'medsHeld', 'medsHoldOn', 'medsHoldOff'];
const missing = FNS.filter(n => !grab(n)); add('the phone\'s functions are in src/v6/app.js', missing.length === 0, 'not found: ' + missing.join(', '));
const P0 = (/^var P=\{[^\n]*\};$/m.exec(appSrc) || [''])[0], li = appSrc.indexOf('(function load(){try{'), le = appSrc.indexOf('})();', li) + 5, LOAD = li < 0 ? '' : appSrc.slice(li, le);
add('the phone\'s load is in src/v6/app.js', !!P0 && !!LOAD, 'P or load not found');
// one phone: its store text, the time, the meal tab; returns what the page holds after its own load and the functions that build a request
const makePhone = safe(() => vm.runInContext('(function(store,now,hr,CLOCK,meal){var DAY=dayOf(now.getTime()),CONDS=["kidney","preg","diabetes","bp"],localStorage={getItem:function(k){return store[k]==null?null:store[k];}};' + P0 +
  'var C={meal:meal,mode:"desk",mood:"best",cuisine:"home",prep:"home",oil:"min",ratio:null},APP={},EV=[],STORE={day:DAY,res:{},shown:{}},KEYCODE="",REMADE={},REMADEWHY={},FILE=null,UI={sheet:"",bodyOpened:false},opened=[],sent=[],window={},setTimeout=function(){return 0;},clearTimeout=function(){},fetch=function(path,o){sent.push({path:path,body:JSON.parse(o.body)});return {then:function(){return {then:function(){}};}};};function openSheet(k,at){opened.push(at);}function save(){}' + (/^var MEDSKEY=[^\n]*;$/m.exec(appSrc) || [''])[0] + FNS.map(grab).join('\n') + '\n' + LOAD +
  '\nFILE=buildFile(EV,now.getTime());return {P:P,C:C,EV:EV,APP:APP,fn:{profileOut:profileOut,fileOut:fileOut,ctxOut:ctxOut,appetite:appetite,api:api,bodyNeed:bodyNeed},opened:opened,sent:sent,file:function(){return FILE;}};})', A), null);
const clockOf = (h) => { const d = new Date(2026, 10, 18, Math.floor(h), Math.round((h % 1) * 60), 0); return [d, d.getHours() + d.getMinutes() / 60]; };
const CLOCKMEAL = (hr) => hr < 4 ? 'dinner' : hr < 11 ? 'breakfast' : hr < 15.5 ? 'lunch' : hr < 18.5 ? 'snack' : 'dinner';
const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
const plateAt = (kcal) => { const p = 16, f = 8, c = Math.round((kcal - 4 * p - 9 * f) / 4); return { title: 'Moong dal with jowar roti', subtitle: 'Moong dal, jowar roti and salad', cuisine: 'North Indian', prepMinutes: 20, minutes: 20,
  items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: ['plain'] }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 4 * p + 4 * c + 9 * f, protein: p, carbs: c, fats: f, fiber: 8, why: [], planned_around: [], taste: ['fresh'] }; };

// the requests the phone makes from a state: plates (with the day's file), Rescue (with the file), the log (no file), the swaps and changes for a plate
let requests = 0, notDone = 0;
function askAll(label, store, hours, tabs, expect) {
  for (const h of hours) { const [now, hr] = clockOf(h); for (const meal of tabs) {
    const ph = safe(() => makePhone(store, now, hr, CLOCKMEAL(hr), meal), null); if (!ph) { add('the phone loads this state', false, label + ': load threw'); continue; }
    if (!ph.P.done) { notDone++; continue; }   // the set-up is not finished on this phone: it asks for nothing (P.done needs a diet, a health answer, a goal and a region)
    const body = J({ profile: ph.fn.profileOut(), ctx: ph.fn.ctxOut(''), file: ph.fn.fileOut() }), resc = J({ profile: body.profile, ctx: { meal, time: ph.fn.ctxOut('').time, text: 'Veg thali', photo: false, appetite: ph.fn.appetite() }, file: body.file });
    const logb = J({ profile: body.profile, ctx: { meal, time: ph.fn.ctxOut('').time, text: '2 roti and dal', photo: false } }), sp = safe(() => { const pm = A.plan('meals', body); if (!pm || !pm.check) return null; for (const k of [760, 900, 1200, 520]) { const r = pm.check({ status: 'ok', refer_reason: 'none', meals: [plateAt(k)] }); if ((r.meals || []).length) return r.meals[0]; } return null; }, null);
    const tune = sp ? J(B.tuneBody(body.profile, meal, sp)) : null;   // the plate the phone holds is one the engine served; a profile that is referred, or whose rules show no plate, has none to tune
    // every request goes through the phone's own api(): what it sends (its fetch is a stub that keeps the body) is what plan() is asked about
    const nd = ph.fn.bodyNeed(), PATH = { meals: '/api/meals', rescue: '/api/rescue', log: '/api/log', tune: '/api/tune' };
    for (const [kind, b] of [['meals', body], ['rescue', resc], ['log', logb], ['tune', tune]]) { if (!b) continue; requests++;
      const n0 = ph.sent.length; let code = null, ans = null; safe(() => ph.fn.api(PATH[kind], J(b), (st, j) => { code = (j && j.code) || st; ans = [st, j]; }), null);
      // a kidney or pregnancy set-up is referred on the phone with no request, with the reply plan() gives (fix-r21 round 6, audit m1): an answer, not a refusal
      const rp = safe(() => A.readProfile(b.profile), null);
      if (rp && (rp.health === 'kidney' || rp.health === 'preg')) { const pl = safe(() => A.plan(kind, J(b)), {}); add('a kidney or pregnancy set-up is referred on the phone with no request, as plan() refers it', ph.sent.length === n0 && !!ans && ans[0] === 200 && JSON.stringify(ans[1]) === JSON.stringify(pl.reply), `${label}, ${kind}, ${meal} tab at ${h}: sent ${ph.sent.length - n0}, phone ${JSON.stringify(ans)}, engine ${JSON.stringify(pl).slice(0, 90)}`); continue; }
      const went = ph.sent.length > n0, sentBody = went ? ph.sent[ph.sent.length - 1].body : null;
      if (went) { const pl = safe(() => A.plan(kind, J(Object.assign({}, sentBody, { key: undefined }))), { error: 'threw' }), pr = sentBody.profile || {}, n3 = (pr.age > 0) + (pr.cm > 0) + (pr.kg > 0);
        const refused = !!pl.error && !pl.reply; add('a request the phone sends is not refused by the engine', !refused, `${label}, ${kind}, ${meal} tab at ${h}: ${JSON.stringify(pl).slice(0, 90)} (profile ${JSON.stringify(pr).slice(0, 120)})`);
        add('no request with a partial body entry leaves the phone', n3 === 0 || n3 === 3, `${label}, ${kind}, ${meal} tab at ${h}: sent age ${pr.age} cm ${pr.cm} kg ${pr.kg}`);
        add('a phone that holds a partial body sends only the log, and without the three figures', !nd || (kind === 'log' && n3 === 0), `${label}, ${kind}: sent with a partial body held`); }
      else add('the phone holds a request only when it holds a partial body, and then it asks (the body step opens, once)', !!nd && kind !== 'log' && code === 'body_partial' && ph.opened.length <= 1, `${label}, ${kind}, ${meal} tab at ${h}: not sent (${code}) with ${nd ? 'a partial body' : 'a whole one'}`); }
    expect && expect(ph, body, meal, h); } }
}

// ---------- a seeded generator ----------
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, pick = (l) => l[Math.floor(rnd() * l.length)], int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const NOW0 = clockOf(21.5)[0].getTime(), DAYMS = 864e5;
const TITLES = ['Dal and roti', 'Rajma chawal', 'Paneer bhurji with jowar roti and cucumber salad', 'Idli sambar', 'Poha', 'Egg bhurji', 'Chole with rice', 'Upma', 'Curd rice', 'Chicken curry with roti', 'Dosa', 'Sandwich', 'Khichdi', 'Soup', 'Salad bowl', 'Fish curry and rice'];
const longTitle = (n) => { let t = pick(TITLES) + ' with '; while (t.length < n) t += pick(TITLES).toLowerCase() + ' and '; return t.slice(0, n); };
// an event as the phone writes it (src/v6/app.js logEv): the type, the time, the meal and the fields of that type
function ev(type, t, meal, o) { return Object.assign({ t, type, meal }, o || {}); }
const heavy = { kcal: 4000, protein: 300, carbs: 500, fats: 300, fiber: 80 };
// the most a Rescue dish can log: the largest dish and every move that adds to it
const maxRescue = (() => { const prof = { goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 40, cm: 160, kg: 60, act: 'low' }, pl = A.plan('rescue', { profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', text: 'Veg thali' }, file: {} });
  const r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', dish: { name: 'Veg thali', portion: '1 plate, about 350 g', kcal: 4000, protein: 100, carbs: 500, fats: 130, fiber: 40, warning: '', breakdown: '', contains: ['grain'] } }), {}), a = { kcal: 4000, protein: 100, carbs: 500, fats: 130, fiber: 40 };
  for (const h of r.hacks || []) { for (const k of ['kcal', 'protein', 'carbs', 'fats', 'fiber']) a[k] += Math.max(0, h['delta' + k[0].toUpperCase() + k.slice(1)] || 0); } return { a, moves: (r.hacks || []).length }; })();
const heavyDays = (nDays, perDay) => { const e = []; for (let d = nDays; d >= 0; d--) for (let k = 0; k < perDay; k++) { const meal = MEALS[k % 4], t = NOW0 - d * DAYMS + (8 + k * 3.5) * 36e5 - 21.5 * 36e5 + (d === 0 ? 0 : 0);
  const type = pick(['had', 'other', 'rescued', 'ordered', 'had']), big = rnd() < 0.5 ? heavy : { kcal: int(300, 900), protein: int(10, 40), carbs: int(30, 120), fats: int(5, 40), fiber: int(2, 20) };
  e.push(ev(type, t, meal, Object.assign({ title: longTitle(int(10, 200)) }, big, type === 'rescued' ? maxRescue.a : {}, type === 'other' ? { text: 'x'.repeat(200) } : {}, type === 'had' ? { planned: ['plain_day', 'steady_carbs'] } : {})));
  if (rnd() < 0.3) e.push(ev('shown', t - 1000, meal, { titles: Array.from({ length: 3 }, () => longTitle(70)) })); if (rnd() < 0.3) e.push(ev('asked', t - 2000, meal, { text: 'x'.repeat(120) }));
  if (rnd() < 0.2) e.push(ev(pick(['water', 'walk', 'weight', 'tuned', 'swapped', 'next', 'chosen']), t + 1000, meal, { title: longTitle(60), k: 'protein', from: 'a', to: 'b' })); } return e; };
const PROFILE_OK = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'yes', region: 'n', leave: ['dairy', 'nut', 'wheat', 'soya'], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const storeOf = (p, extra) => ({ np6: JSON.stringify(Object.assign({ p, c: { mode: 'desk', mood: 'best', cuisine: 'home', prep: 'home', oil: 'min', ratio: null }, ev: [], app: { day: 20261118, v: {} }, store: { day: 0, res: {}, shown: {} }, k: 'CODE' }, extra || {})) });

// ---------- the most patterns the phone can make ----------
// buildFile derives patterns from the last seven days before today: a late dinner on three, a meal skipped on three, a main food repeated three times in a slot
// group (breakfast, snack, and lunch with dinner together). A seeded search over the days finds the most it can make; the engine reads that many (and the
// test below fails if the engine's bound for the list is lower)
let bestPat = 0, bestEv = null;
for (let n = 0; n < 4000; n++) { const e = [], W = ['rajma', 'paneer', 'dal', 'egg', 'poha', 'idli', 'dosa', 'upma', 'chole', 'oats', 'khichdi', 'soup'], pw = Array.from({ length: 4 }, () => pick(W)), pb = pick(W), ps = pick(W), skipP = rnd() * 0.5, lateP = rnd();
  for (let d = 1; d <= 7; d++) for (const [k, meal] of MEALS.entries()) { const t = NOW0 - d * DAYMS + ([8.5, 13.25, 16.75, 22.5][k] - 21.5) * 36e5;
    if (rnd() < skipP) { e.push(ev('skipped', t, meal, {})); continue; }
    const title = meal === 'breakfast' ? (rnd() < 0.55 ? pb : pick(W)) : meal === 'snack' ? (rnd() < 0.55 ? ps : pick(W)) : pick(pw); const late = meal === 'dinner' && rnd() < lateP;
    e.push(ev('had', late ? NOW0 - d * DAYMS + 1.2 * 36e5 : t, meal, { title: title + ' bowl', kcal: 400, protein: 15, carbs: 50, fats: 12, fiber: 5 })); }
  const f = A.buildFile(e, NOW0); if (f.patterns.length > bestPat) { bestPat = f.patterns.length; bestEv = e; } }
const patternMax = bestPat; console.log(`most patterns the phone's own buildFile made in the search: ${patternMax} (the engine reads up to ${A.FILEB ? A.FILEB.patterns : '?'})`);
add('the search found a day log with at least 8 patterns (the old bound of the engine)', patternMax >= 8, 'only ' + patternMax);
add('the engine reads at least as many patterns as the phone makes', !!A.FILEB && A.FILEB.patterns >= patternMax, 'engine ' + (A.FILEB && A.FILEB.patterns) + ' against ' + patternMax);

// ---------- 1. long, heavy logging ----------
const HOURS = Array.from({ length: 96 }, (_, i) => i / 4), FEW = [0, 3.75, 4, 8.5, 11, 13.25, 15.5, 16.75, 18.5, 20.25, 22.75, 23.75];
const maxLog = Object.assign({}, heavy);
for (const [name, evs] of [['the most patterns', bestEv], ['ten heavy days, four meals', heavyDays(10, 4)], ['ten heavy days, eight events a day', heavyDays(10, 8)], ['one big day (every slot the largest meal)', heavyDays(0, 4)],
  ['three hundred events', heavyDays(40, 8).slice(-300)], ['the largest meal four times in one day, and the most a Rescue dish can log', ['breakfast', 'lunch', 'snack', 'dinner'].map((m, i) => ev(i % 2 ? 'rescued' : 'other', NOW0 - 3e6 * (4 - i), m, Object.assign({ title: longTitle(200) }, i % 2 ? maxRescue.a : maxLog)))]]) {
  const st = storeOf(PROFILE_OK, { ev: evs });
  askAll('heavy: ' + name, st, name === 'the most patterns' ? HOURS : FEW, MEALS);
  // and the same for a client with no body figures, with no condition, and with a pregnant/kidney profile (referred, not refused)
  for (const o of [{ age: 0, cm: 0, kg: 0, health: 'none', meds: '' }, { health: 'bp', meds: '' }, { health: 'kidney', meds: '' }]) askAll('heavy: ' + name + ' ' + JSON.stringify(o), storeOf(Object.assign({}, PROFILE_OK, o), { ev: evs }), [13.25, 21.5], MEALS); }
add('the largest Rescue dish with every move is a figure the phone can log (at least 4,000 kcal)', maxRescue.a.kcal >= 4000 && maxRescue.moves > 0, JSON.stringify(maxRescue));

// ---------- 1b. the most 6febc1a could write into a logged meal (fix-r21; safety audit of 7935ec0, m2) ----------
// Built from that page's own writers, not from this build's range: its log kept kcal 1-5000, protein 0-300, carbs 0-600, fats 0-300, fiber 0-100 and put the macro sum
// (4p + 4c + 9f, up to 6,300 kcal) in place of a kcal more than a fifth off it; a Rescue dish (kcal 40-4000, protein 0-300, carbs 0-500, fats 0-300, fiber 0-80) with the four
// moves its model could write (each up to +300 kcal, +40 protein, +60 carbs, +30 fats, +20 fiber) is 5,200 kcal, 460 g protein, 740 g carbs, 420 g fats and 160 g fiber; a composed
// plate (2,500 kcal and 250 g protein after its swaps and changes: +400 kcal, +40 protein, +80 carbs, +40 fats, +20 fiber, then +400, +40, +40, +30, +20) is 3,300 kcal.
const W6 = { log: { kcal: 6300, protein: 300, carbs: 600, fats: 300, fiber: 100 }, log5000: { kcal: 5000, protein: 200, carbs: 400, fats: 100, fiber: 40 }, rescue: { kcal: 5200, protein: 460, carbs: 740, fats: 420, fiber: 160 }, plate: { kcal: 3300, protein: 330, carbs: 520, fats: 270, fiber: 120 } };
{ const at = (k) => NOW0 + (-13.5 + k * 3) * 36e5, mealsOf = (o) => MEALS.map((m, k) => ev(o[k % o.length][0], at(k), m, Object.assign({ title: longTitle(80) }, W6[o[k % o.length][1]])));
  for (const [name, evs] of [['four meals logged at 6,300 kcal', mealsOf([['other', 'log']])], ['a 5,000 kcal log', [ev('other', at(0), 'breakfast', Object.assign({ title: 'Thali' }, W6.log5000))]], ['a 6,300 kcal log', [ev('other', at(0), 'breakfast', Object.assign({ title: 'Thali' }, W6.log))]],
    ['a Rescue dish with four moves', mealsOf([['rescued', 'rescue']])], ['a composed plate at 3,300 kcal', mealsOf([['had', 'plate']])], ['the largest meal of each writer in one day', mealsOf([['other', 'log'], ['rescued', 'rescue'], ['had', 'plate'], ['other', 'log']])]])
    askAll('6febc1a writers: ' + name, storeOf(PROFILE_OK, { ev: evs }), [21.75, 22.75, 23.75], MEALS);
  add('the 6febc1a writers\' largest day is a figure the phone can hold (the sum of four meals)', MEALS.length * W6.log.kcal === 25200 && MEALS.length * W6.rescue.protein === 1840 && MEALS.length * W6.rescue.carbs === 2960 && MEALS.length * W6.rescue.fats === 1680 && MEALS.length * W6.rescue.fiber === 640, 'the table of ranges in src/v6/engine.js FILEB'); }

// ---------- 2. the store as 6febc1a leaves it ----------
// its bounds for the three body figures were 16-95, 120-215 and 30-200, and its load kept any figure above 0; the profile fields are the set-up's own
const ages = [16, 17, 18, 40, 95, 0, 15, 96, 120, -1, 45.5, '45', 'x', null], cms = [0, 119, 120, 158, 215, 216, 1000, 4.5, '158', null], kgs = [0, 29, 30, 72, 200, 201, 5000, 65.5, '70', null];
const states = [];
for (const age of ages) states.push(['age ' + JSON.stringify(age), Object.assign({}, PROFILE_OK, { age })]);
for (const cm of cms) states.push(['cm ' + JSON.stringify(cm), Object.assign({}, PROFILE_OK, { cm })]);
for (const kg of kgs) states.push(['kg ' + JSON.stringify(kg), Object.assign({}, PROFILE_OK, { kg })]);
for (let i = 0; i < 60; i++) states.push(['random ' + i, Object.assign({}, PROFILE_OK, { age: pick(ages), cm: pick(cms), kg: pick(kgs), sex: pick(['f', 'm', '', 'x']), act: pick(['low', 'light', 'mod', 'high', '', 'x']), meds: pick(['yes', 'no', 'unsure', '', 'x']),
  health: pick(['none', 'diabetes', 'bp', 'kidney', 'preg', '', null, 'x']), diet: pick(['veg', 'egg', 'nonveg', 'jain', 'vegan']), goal: pick(['lose', 'hold', 'build', null, 'x']), focus: pick(['none', 'iron', 'b12', 'cal', 'pro', 'fib', 'x']), region: pick(['n', 's', 'w', 'e']), leave: pick([[], ['dairy'], ['dairy', 'dairy', 'nut', 'wheat', 'soya', 'x'], 'x', null]) })]);
for (const f of ['age', 'cm', 'kg', 'sex', 'act', 'meds', 'goal', 'focus', 'leave', 'conds', 'done']) { const p = Object.assign({}, PROFILE_OK); delete p[f]; states.push(['field left out: ' + f, p]); }
states.push(['an empty profile', {}], ['a profile that is not an object', null]);
// a body stored with one or two figures (the 6febc1a page and the fix-r18 page could store one; an age of 16 or 17 reads as not given, so it can leave the other two alone)
for (const [a, c, k] of [[45, 0, 0], [0, 158, 0], [0, 0, 72], [45, 158, 0], [45, 0, 72], [0, 158, 72], [17, 158, 72], [16, 0, 72], [17, 0, 0], [16, 158, 0]]) states.push([`a partial body stored: age ${a} cm ${c} kg ${k}`, Object.assign({}, PROFILE_OK, { age: a, cm: c, kg: k })]);
let loaded = 0;
for (const [label, p] of states) { const evs = heavyDays(8, 4).slice(0, 80);
  askAll('6febc1a store, ' + label, storeOf(p, { ev: evs }), FEW.filter((_, i) => i % 3 === 0).concat([13.25, 21.5]), MEALS, () => { loaded++; }); }
// the older np5 store (the first app's record: no events, the plates kept) and a store with no events at all, a store with an appetite left by an older build
for (const [label, st] of [['np5', { np5: JSON.stringify({ p: PROFILE_OK, c: { mode: 'desk' }, log: [], store: {}, k: 'C' }) }], ['no store', {}], ['np6 with only a code', { np6: JSON.stringify({ k: 'C' }) }], ['np6 that is not json', { np6: '{' }],
  ['appetite 0 and 11 and a word', storeOf(PROFILE_OK, { ev: [], app: { day: 20261118, v: { lunch: 0, dinner: 11, snack: 'x', breakfast: 5.5 } } })], ['events with no figures', storeOf(PROFILE_OK, { ev: [ev('had', NOW0 - 36e5, 'breakfast', {}), ev('skipped', NOW0 - 2 * 36e5, 'lunch', {}), ev('rescued', NOW0 - 3 * 36e5, 'snack', { title: null }), ev('other', NOW0 - 4 * 36e5, 'dinner', { kcal: null, protein: null })] })]])
  askAll('6febc1a store, ' + label, st, FEW, MEALS);
add('the stored states loaded and answered', loaded > 1000 && requests > 5000, `${loaded} loaded, ${requests} requests`);

// ---------- 3. every clock time and every meal tab, for ordinary phones ----------
for (const o of [{}, { health: 'diabetes', meds: 'yes', age: 0, cm: 0, kg: 0 }, { health: 'none', meds: '', sex: 'm', age: 18, cm: 120, kg: 30 }, { health: 'diabetes', meds: 'unsure', age: 95, cm: 215, kg: 200, act: 'high' }])
  askAll('clock, ' + JSON.stringify(o), storeOf(Object.assign({}, PROFILE_OK, o), { ev: heavyDays(3, 4).slice(0, 12) }), HOURS, MEALS);
add('enough requests were built', requests > 12000, `${requests} requests`);
console.log(`phone states: ${notDone} phone states with the set-up not finished ask for nothing; ${requests} requests built by the phone's own functions (${states.length} stored profiles, the heavy logs, 96 clock times, 4 meal tabs); none refused`);

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       ... ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(fail ? `${fail} counter-example(s): a state the phone can hold is refused (${pageFile})` : `phone states: no request the phone builds is refused (${pageFile})`);
process.exit(fail ? 1 : 0);
