// Request intake parity (fix-r18; safety audit of 21a04a3, B1). The rule (docs/SAFETY-INVARIANTS.md, "The intake rule"):
//   "not given" (0, null, "", missing, as each field defines it) stays not given on both sides; a value the set-up can store reads the
//   same on the phone and in the engine; a value the set-up cannot store is refused (bad_request) and never clamped.
// B1: a client on insulin enters an age and leaves height and weight empty; the phone sends cm 0, kg 0; the engine read them as 120 cm and
// 30 kg (num() clamps before the "||0" can see the zero), told the model "female, 30 kg", built a day target nobody has, and stated a usual
// size (340 kcal for a woman's lunch) under the one S6 and the phone's own medsUsual give (480).
// This file runs the phone's own functions (taken from src/v6/app.js and run against np-core) and the engine's plan() on the same input:
//   - the reproduction of B1 and of the hour (null read as midnight);
//   - the grid: every combination of age, height and weight given or not (and at their bounds), sex, activity, medicine answer and meal, with
//     the prompt's stated body and targets, the usual size, the medicines floor (a plate under it is dropped, one at it is shown, a one-tap
//     change under it is not offered), the Rescue and tune prompts; and, on a spread of goals, appetites, days eaten so far and clock hours,
//     the day target, the meal target and the hooks;
//   - the phone's input bounds against the engine's, for every text a person can type;
//   - a value the set-up cannot store is refused (and a typed urgent sign still refers first, S7); what the phone keeps from its store;
//   - m5: the last condition unticked is "None of these", and the request is read;
//   - the all-given and all-empty requests are byte-identical to 21a8bcc's (test/safety/intake-golden.json).
// usage: node test/safety/intake.js [hosted/v6/index.html | hosted/v6/index.min.html | hosted/v5/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
const WRITE_GOLDEN = process.argv.includes('--write-golden');
const page = fs.readFileSync(pageFile, 'utf8');
const core = page.split('<script id="np-core">')[1].split('</script>')[0];
const A = {}; vm.createContext(A); vm.runInContext(core, A);   // np-core as the server and the page run it
const appSrc = fs.readFileSync(process.env.NP_APP || path.join(ROOT, 'src/v6/app.js'), 'utf8');
const grab = (name) => { const i = appSrc.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = appSrc.indexOf('{', i); for (; j < appSrc.length; j++) { if (appSrc[j] === '{') d++; else if (appSrc[j] === '}') { d--; if (!d) break; } } return appSrc.slice(i, j + 1); };
const J = (x) => JSON.parse(JSON.stringify(x));
const safe = (f, d) => { try { return f(); } catch (e) { return d; } };
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };

const section = (name, f) => { try { f(); } catch (e) { add('section ran: ' + name, false, (e && e.message) || String(e)); } };
// ---------- the phone: its own functions, on a P like the set-up leaves ----------
const PHONE_FNS = ['has', 'healthOf', 'setCond', 'bodyRead', 'bodyStored', 'appKept', 'profileOut', 'fileOut', 'appetite', 'dayNo', 'clockText', 'ctxOut', 'composedWhy', 'bodyLive', 'bodyNeed', 'bodyHold'];
const missingFns = PHONE_FNS.filter(n => !grab(n));
add('the phone\'s intake functions are in src/v6/app.js', missingFns.length === 0, 'not found: ' + missingFns.join(', '));
const phoneSrc = PHONE_FNS.map(grab).filter(Boolean).join('\n');
const phoneFns = PHONE_FNS.filter(n => grab(n));
const makePhone = safe(() => vm.runInContext('(function(P,C,APP,FILE,now,hr,CLOCK){var CONDS=["kidney","preg","diabetes","bp"],UI={sheet:"",bodyOpened:false},opened=[];function openSheet(k,at){opened.push(at);}' + phoneSrc + '\nreturn {' + phoneFns.map(n => n + ':' + n).join(',') + ',opened:opened};})', A), null);
const P0 = { goal: 'hold', focus: 'none', meds: '', diet: 'veg', health: 'diabetes', conds: ['diabetes'], region: 'n', leave: [], sex: 'f', age: 0, cm: 0, kg: 0, act: 'low', done: true };
const NOW = (h) => new Date(2026, 10, 18, Math.floor(h), Math.round((h % 1) * 60), 0);
const EMPTY_FILE = () => ({ today: { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: [], lastHoursAgo: null, lastKcal: 0 }, patterns: [], slotProtein: {}, days: 0, recent: [] });
// the phone as it stands in a state: P (the set-up), the meal on screen, the hand-set appetite, the log, and the clock
function phoneState(o) {
  const P = Object.assign({}, P0, { conds: P0.conds.slice(), leave: [] }, o.P || {}), now = NOW(o.clock == null ? 13 : o.clock), hr = now.getHours() + now.getMinutes() / 60;
  const CLOCK = hr < 4 ? 'dinner' : hr < 11 ? 'breakfast' : hr < 15.5 ? 'lunch' : hr < 18.5 ? 'snack' : 'dinner';
  const C = { meal: o.meal || 'lunch', mode: 'desk', mood: 'best', cuisine: 'home', prep: 'home', oil: 'min', ratio: null }, APP = o.appetite != null ? { [C.meal]: o.appetite } : {};
  const EV = (o.events || []).map(e => ({ t: now.getTime() - e.hoursAgo * 36e5, type: e.type || 'had', meal: e.meal, title: e.title || 'Dal and roti', kcal: e.kcal, protein: e.protein != null ? e.protein : Math.round(e.kcal / 25), carbs: Math.round(e.kcal / 8), fats: Math.round(e.kcal / 30), fiber: 6 }));
  const FILE = A.buildFile(EV, now.getTime());
  return { P, C, now, hr, CLOCK, FILE, fn: makePhone(P, C, APP, FILE, now, hr, CLOCK) };
}
// a body figure typed the way the person types it (nothing typed is not given)
const setBody = (fn, P, k, v) => { P[k] = v ? fn.bodyRead(k, String(v)).v : fn.bodyRead(k, '').v; };
// the request the phone sends for the plates, through JSON as the wire does
const mealsBody = (S) => J({ profile: S.fn.profileOut(), ctx: S.fn.ctxOut(''), file: S.fn.fileOut() });

// ---------- what the engine says ----------
const personLine = (prompt) => (prompt.split('\n').find(l => /^- .*(years|kg|female|male|mostly|activity|exercise|training)/i.test(l)) || '');
const stated = (prompt) => { const L = personLine(prompt), m = (re) => { const x = re.exec(prompt); return x ? +x[1] : null; };
  return { years: (/(\d+) years/.exec(L) || [])[1] || null, kg: (/(\d+) kg/.exec(L) || [])[1] || null, line: L, day: m(/Day target: about (\d+) kcal/), target: m(/Target for this meal: (?:about|at least) (\d+) kcal/),
    floor: m(/every plate, with any swap or change, is at least (\d+) kcal/), tuneFloor: m(/no swap or change takes the plate under (\d+) kcal/), rescueFloor: m(/a dish with its side is at least (\d+) kcal/) }; };
// a Rescue dish whose figures agree, at the energy asked; the moves the engine offers for it
const dishAt = (kcal) => ({ name: 'Veg thali', portion: '1 plate, about 350 g', kcal, protein: 24, carbs: Math.round((kcal - 96 - 180) / 4), fats: 20, fiber: 6, warning: '', breakdown: '', contains: ['grain'] });
const rescueMovesFor = (profile, slot, kcal) => { const pl = safe(() => A.plan('rescue', J({ profile, ctx: { meal: slot, time: '1:10 pm', text: 'Veg thali' }, file: {} })), null); if (!pl || !pl.check) return null;
  const d = dishAt(kcal), r = safe(() => pl.check({ status: 'ok', refer_reason: 'none', dish: d }), {}); return r.status === 'ok' ? { dish: r.dish, hacks: r.hacks || [] } : null; };
const hookIds = (prompt) => [...(prompt || '').matchAll(/^- \[([a-z_0-9]+)\] /gm)].map(m => m[1]).filter(x => x !== 'plain_day');
// a plate whose figures add up to the energy asked (so only the energy can drop it)
const plateAt = (kcal) => { const p = Math.min(16, Math.floor(kcal / 20)); let f = Math.min(4, Math.floor(kcal / 60)); while ((kcal - 4 * p - 9 * f) % 4 !== 0) f++;
  const c = (kcal - 4 * p - 9 * f) / 4; return { title: 'Moong dal with jowar roti', subtitle: 'Moong dal, jowar roti and salad', cuisine: 'North Indian', prepMinutes: 20,
    items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: ['plain'] }],
    grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal, protein: p, carbs: c, fats: f, fiber: Math.min(12, c), why: [], planned_around: [], taste: ['fresh'] }; };
const shownPlate = (plan, kcal) => { const r = safe(() => plan.check({ status: 'ok', refer_reason: 'none', meals: [plateAt(kcal)] }), {}); return ((r.meals || [])[0]) || null; };
// a one-tap change of the figures asked, on a plate that is shown; offered or not
const change = (dk) => ({ titleSuffix: '+ a change', note: 'A change.', minutes: 20, grain_grams_after: 90, contains: ['plain'], deltaKcal: dk, deltaProtein: 0, deltaCarbs: Math.round(dk / 4), deltaFats: 0, deltaFiber: 0 });
const offered = (profile, slot, plate, dk) => { const tb = J({ profile, slot, meal: Object.assign({}, plate, { minutes: 20 }) }), pl = safe(() => A.plan('tune', tb), null);
  if (!pl || !pl.check) return null; const r = safe(() => pl.check({ swaps: { protein: [], base: [] }, alchemy: { gut: change(dk) } }), {}); return !!(r.alchemy && r.alchemy.gut); };

// ---------- the all-given and all-empty requests: the hashes of 21a8bcc's prompt, schema and check answer ----------
function goldenCells(OLDKG) {
  const cells = {};
  const kinds = [['meals', 'breakfast'], ['meals', 'lunch'], ['meals', 'snack'], ['meals', 'dinner'], ['rescue', 'lunch'], ['log', 'lunch'], ['tune', 'lunch']];
  for (const [pname, pf] of [['all given', { age: 45, cm: 160, kg: 70, sex: 'f', act: 'low' }], ['all given, a man', { age: 61, cm: 172, kg: 81, sex: 'm', act: 'mod' }], ['none given', { age: 0, cm: 0, kg: 0, sex: '', act: '' }]]) for (const hp of [['none', { health: 'none', meds: 'no' }], ['diabetes, insulin', { health: 'diabetes', meds: 'yes' }], ['diabetes, no medicine', { health: 'diabetes', meds: 'no' }], ['blood pressure', { health: 'bp', meds: 'no' }]]) for (const [kind, meal] of kinds) for (const goal of ['lose', 'hold']) {
    const prof = Object.assign({ goal, focus: 'none', diet: 'veg', region: 'n', leave: [] }, pf, hp[1]);
    const ctx = { lite: true, dayNo: 322, meal, time: '1:10 pm', hour: meal === 'dinner' ? 20.4 : 13.2, mode: 'desk', mood: 'best', cuisine: 'home', prep: 'home', oil: 'min', appetite: 5, text: kind === 'rescue' || kind === 'log' ? 'Veg thali' : '' };
    const file = { today: { kcal: 600, protein: 22, carbs: 80, fats: 20, fiber: 9, meals: [{ meal: meal === 'breakfast' ? 'dinner' : 'breakfast', kind: 'had', title: 'Poha', kcal: 600, protein: 22 }], lastHoursAgo: 4, lastKcal: 600 }, patterns: [], slotProtein: {}, days: 0, recent: ['Poha'] };
    const body = { profile: prof, ctx, file, slot: meal, meal: Object.assign(plateAt(720), { minutes: 20 }) }, pl = safe(() => A.plan(kind, J(body)), { error: 'threw' });
    const chk = pl.check ? safe(() => JSON.stringify(pl.check(kind === 'meals' ? { status: 'ok', refer_reason: 'none', meals: [plateAt(560), plateAt(720), plateAt(900)] } : kind === 'tune' ? { swaps: { protein: [], base: [] }, alchemy: { gut: change(-70) } } : kind === 'log' ? { status: 'ok', refer_reason: 'none', title: 'Veg thali', kcal: 600, protein: 20, carbs: 80, fats: 20, fiber: 6, items: [{ food: 'Veg thali', grams: 400 }] } : { status: 'ok', refer_reason: 'none', dish: { name: 'Veg thali', portion: '1 plate, about 350 g', kcal: 620, protein: 24, carbs: 80, fats: 22, fiber: 6, warning: '', breakdown: '', contains: ['grain'] } })), 'threw') : '';
    cells[`${pname}|${hp[0]}|${kind}|${meal}|${goal}`] = pl.prompt ? [sha(OLDKG && pname === 'none given' ? pl.prompt.replace(', 30 kg', '') : pl.prompt), sha(JSON.stringify(pl.schema)), sha(chk || '')].join(' ') : 'error ' + pl.error; }
  return cells; }
const GOLD = path.join(__dirname, 'intake-golden.json');
if (WRITE_GOLDEN) { const cells = goldenCells(true); fs.writeFileSync(GOLD, JSON.stringify({ about: 'sha256 prefixes of the prompt, the schema and the check\'s answer to a fixed reply, for requests with every body figure given and with none, from the page at 21a8bcc (before fix-r18). test/safety/intake.js compares the page under test to these; a difference is a change to what the model is told or asked for.', source: 'hosted/v6/index.html at 21a8bcc5302f', cells }, null, 1) + '\n'); console.log(`wrote ${Object.keys(cells).length} cells to ${GOLD}`); process.exit(0); }

// ---------- B1: the reproduction (a woman on insulin, 45 years) ----------
// With the age alone (height and weight left empty) the engine used to state 30 kg, a day target of 860 and a usual size of 340 against the phone's 480. Since fix-r20
// (owner, 22 Nov: "Ask for the missing figure") that request is never sent and the engine refuses it (body_partial); the same client with all three empty is planned,
// at the usual sizes, and the cells below hold what B1 was about for that request.
section('B1 reproduction', () => { const S0 = phoneState({ P: { meds: 'yes', sex: 'f', age: 45, cm: 0, kg: 0, act: 'low' }, meal: 'lunch' }), b0 = mealsBody(S0), nd = S0.fn.bodyNeed();
  add('B1 the phone asks for the missing figures in one line and does not send', !!nd && nd.line === 'Add your height and weight too, or leave all three empty.' && nd.at === 'body-cm', JSON.stringify(nd));
  for (const kind of ['meals', 'rescue', 'log', 'tune']) { const pl = safe(() => A.plan(kind, J(Object.assign({}, b0, { ctx: Object.assign({}, b0.ctx, { text: 'Veg thali' }), slot: 'lunch', meal: Object.assign(plateAt(700), { minutes: 20 }) }))), { error: 'threw' });
    add('B1 the engine refuses an age with no height or weight, on every kind, with its own code', pl.error === 'body_partial' && Object.keys(pl).length === 1, `${kind}: ${JSON.stringify(pl).slice(0, 80)}`); }
  const S = phoneState({ P: { meds: 'yes', sex: 'f', age: 0, cm: 0, kg: 0, act: 'low' }, meal: 'lunch' }), body = mealsBody(S);
  const phoneUsual = A.medsUsual(S.fn.profileOut(), 'lunch'), plan = A.plan('meals', body), s = stated(plan.prompt || '');
  add('B1 phone: no height or weight gives the day split of the energy floor', phoneUsual === 480, 'the phone says ' + phoneUsual);
  add('B1 all three empty: the prompt states no weight that was not given', s.kg === null && s.years === null, 'prompt: "' + s.line + '"');
  add('B1 all three empty: the prompt states no day target', s.day === null, 'Day target: about ' + s.day + ' kcal');
  add('B1 all three empty: the prompt states the phone\'s usual size as the minimum', s.floor === phoneUsual && s.target === null, 'prompt floor ' + s.floor + ', target line ' + s.target + ', phone ' + phoneUsual);
  add('B1 all three empty: a plate under the phone\'s usual size is dropped, one at it is shown', !shownPlate(plan, phoneUsual - 10) && !!shownPlate(plan, phoneUsual), 'at ' + (phoneUsual - 10) + ' shown: ' + !!shownPlate(plan, phoneUsual - 10) + '; at ' + phoneUsual + ' shown: ' + !!shownPlate(plan, phoneUsual));
  add('B1 all three empty: a plate at 340 kcal (the figure the old engine stated) is not shown', !shownPlate(plan, 340), 'a 340 kcal plate is shown');
  const rp = A.plan('rescue', J({ profile: body.profile, ctx: Object.assign({}, body.ctx, { text: 'Veg thali' }), file: body.file })), rs = stated(rp.prompt || '');
  add('B1 all three empty: Rescue states no weight; no move takes the dish under the phone\'s usual size', rs.kg === null && (rescueMovesFor(body.profile, 'lunch', 700) || { hacks: [] }).hacks.every(h => (h.deltaKcal || 0) >= 0 || 700 + h.deltaKcal >= phoneUsual), 'prompt: "' + rs.line + '"');
  const tp = A.plan('tune', J({ profile: body.profile, slot: 'lunch', meal: Object.assign(plateAt(phoneUsual + 20), { minutes: 20 }) })), ts = stated(tp.prompt || '');
  add('B1 all three empty: tune states no weight and the usual size the phone\'s', ts.kg === null && ts.tuneFloor === phoneUsual, 'prompt: "' + ts.line + '", floor ' + ts.tuneFloor);
});

// ---------- the audit's 48 cells ----------
// Age 0 or 45, height 0 or 160, weight 0 or 70, woman or man, breakfast, lunch and dinner, on insulin: the lowest plate the engine shows (scanned in
// steps of 10 kcal) against the phone's usual size (medsUsual on the raw profile). With all three figures or none they agreed on 21a04a3; of the 36
// partial cells 16 differed (10 with the engine lower).
section('audit cells', () => { let partial = 0, differ = 0, whole = 0, wholeDiffer = 0;
  for (const age of [0, 45]) for (const cm of [0, 160]) for (const kg of [0, 70]) for (const sex of ['f', 'm']) for (const meal of ['breakfast', 'lunch', 'dinner']) {
    const S = phoneState({ P: { meds: 'yes', sex, act: 'low' }, meal }); setBody(S.fn, S.P, 'age', age); setBody(S.fn, S.P, 'cm', cm); setBody(S.fn, S.P, 'kg', kg);
    const body = mealsBody(S), U = A.medsUsual(S.fn.profileOut(), meal), plan = A.plan('meals', body), n3 = (age > 0) + (cm > 0) + (kg > 0), part = n3 > 0 && n3 < 3;
    if (part) { partial++; const nd = S.fn.bodyNeed(), refused = plan.error === 'body_partial' && Object.keys(plan).length === 1;
      if (!refused || !nd) differ++;
      add('audit: a partial body entry is refused by the engine and asked for by the phone, in every cell', refused && !!nd && /^Add your .+ too, or leave all three empty\.$/.test(nd.line), `age ${age || '-'} cm ${cm || '-'} kg ${kg || '-'} ${sex} ${meal}: engine ${JSON.stringify(plan).slice(0, 40)}, phone ${nd && nd.line}`); continue; }
    let low = null; for (let k = 40; k <= 1600 && low === null; k += 10) if (shownPlate(plan, k)) low = k;
    whole++; if (low !== U) wholeDiffer++;
    add('audit: with all three figures or none the lowest plate the engine shows is the phone\'s usual size', low === U, `age ${age || '-'} cm ${cm || '-'} kg ${kg || '-'} ${sex} ${meal}: engine ${low}, phone ${U}`); }
  console.log(`audit cells: ${partial} partial cells (${differ} not refused and asked for), ${whole} cells with all three figures or none (${wholeDiffer} where the lowest shown plate differs from the phone's usual size)`); });

// ---------- the hour: null is not given, 0 is midnight ----------
// The page sends hour:null on every tab that is not the meal of the clock; +null is 0, which the engine read as midnight, so a dinner planned
// at lunch time carried the "late dinner" hook the phone's own hooks do not have.
section('hour', () => { const S = phoneState({ P: { meds: 'yes', sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }, meal: 'dinner', clock: 13 }), body = mealsBody(S), prof = body.profile, file = body.file;
  const ask = (hour) => { const c = Object.assign({}, body.ctx); if (hour === undefined) delete c.hour; else c.hour = hour; return A.plan('meals', J({ profile: prof, ctx: c, file })); };
  const phoneHooks = (hour) => A.hooksFor(A.readProfile(prof), A.readFile(file), { meal: 'dinner', hour, mode: 'desk' }, null).map(h => h.id).filter(x => x !== 'plain_day');
  add('hour: the page sends null for a dinner planned at lunch time', body.ctx.hour === null, JSON.stringify(body.ctx.hour));
  for (const h of [null, undefined, '']) { const pl = ask(h);
    add('hour: null, "" or missing is not given: no late hook at dinner', !!pl.prompt && !hookIds(pl.prompt).includes('late_now') && JSON.stringify(hookIds(pl.prompt)) === JSON.stringify(phoneHooks(null)), `hour ${JSON.stringify(h)}: ${hookIds(pl && pl.prompt)} against ${phoneHooks(null)}`); }
  for (const h of [0, 0.5, 3.9, 21, 23.99]) { const pl = ask(h);
    add('hour: a given hour at dinner (midnight included) reads as the phone reads it', !!pl.prompt && JSON.stringify(hookIds(pl.prompt)) === JSON.stringify(phoneHooks(h)), `hour ${h}: ${hookIds(pl && pl.prompt)} against ${phoneHooks(h)}`); }
  add('hour: midnight is a given hour (late dinner)', hookIds(ask(0).prompt).includes('late_now'), 'hour 0 gave no late hook');
  for (const h of [24, -1, 25.5, 'x', true, [], {}]) { const pl = safe(() => ask(h), { error: 'threw' });
    add('hour: a value the page cannot send is refused, never moved', pl.error === 'bad_request' && Object.keys(pl).length === 1, `hour ${JSON.stringify(h)}: ${JSON.stringify(pl).slice(0, 100)}`); }
});

// ---------- the grid ----------
// Body figures at not given, at the lowest and at a usual value (and the highest where a bound is the point); the figure is typed as the person types it.
const BF = { age: [0, 18, 45], cm: [0, 120, 160], kg: [0, 30, 70] }, SEX = ['f', 'm', ''], ACT = ['low', 'mod', ''], MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
// medicine answers: insulin or tablets (yes), not sure, the question never answered (diabetes ticked from My food), no, and no diabetes
const MEDS = [['yes', { health: 'diabetes', conds: ['diabetes'], meds: 'yes' }], ['unsure', { health: 'diabetes', conds: ['diabetes'], meds: 'unsure' }], ['unanswered', { health: 'diabetes', conds: ['diabetes'], meds: '' }],
  ['no', { health: 'diabetes', conds: ['diabetes'], meds: 'no' }], ['no diabetes', { health: 'none', conds: [], meds: '' }]];
let cellsA = 0, cellsB = 0, cellsPartial = 0, probes = 0, changes = 0;
const medsCells = [];
for (const age of BF.age) for (const cm of BF.cm) for (const kg of BF.kg) for (const sex of SEX) for (const act of ACT) for (const meal of MEALS) for (const [mname, mp] of MEDS) {
  const S = phoneState({ P: Object.assign({ sex, act }, mp), meal }); setBody(S.fn, S.P, 'age', age); setBody(S.fn, S.P, 'cm', cm); setBody(S.fn, S.P, 'kg', kg);
  const label = `age ${age || '-'} cm ${cm || '-'} kg ${kg || '-'} ${sex || 'sex?'} ${act || 'act?'} ${meal} meds ${mname}`;
  add('grid: the phone keeps the figures typed and no others (a figure not typed is 0)', S.P.age === age && S.P.cm === cm && S.P.kg === kg, `${label}: ${S.P.age}/${S.P.cm}/${S.P.kg}`);
  const body = mealsBody(S), prof = S.fn.profileOut(), U = A.medsUsual(prof, meal), eU = A.medsUsual(A.readProfile(body.profile), meal), n3 = (age > 0) + (cm > 0) + (kg > 0);
  if (n3 > 0 && n3 < 3) {   // a partial body entry: the engine refuses it, and the phone says which figure is missing, cannot finish the step and sends nothing (plates, Rescue, tune) or sends the log without the figures
    cellsA++; cellsPartial++; const nd = S.fn.bodyNeed(), miss = [!age && 'age', !cm && 'height', !kg && 'weight'].filter(Boolean), want = 'Add your ' + (miss.length > 1 ? miss.join(' and ') : miss[0]) + ' too, or leave all three empty.';
    const pl = A.plan('meals', body), held = S.fn.bodyHold('/api/meals', J(body)), lb = J(body), logHeld = S.fn.bodyHold('/api/log', lb), asked = S.fn.opened.length;
    const bad = []; if (pl.error !== 'body_partial' || Object.keys(pl).length !== 1) bad.push('engine ' + JSON.stringify(pl).slice(0, 40)); if (!nd || nd.line !== want) bad.push('phone line "' + (nd && nd.line) + '"'); if (held !== true) bad.push('the phone would send plates');
    if (logHeld !== false || lb.profile.age !== 0 || lb.profile.cm !== 0 || lb.profile.kg !== 0) bad.push('the log goes with a body figure or is held'); if (A.plan('log', J({ profile: lb.profile, ctx: { meal, text: '2 roti and dal' } })).error) bad.push('the log without the figures is refused');
    if (!nd || (nd.at !== (!age ? 'body-age' : !cm ? 'body-cm' : 'body-kg'))) bad.push('opens at ' + (nd && nd.at)); if (asked > 1) bad.push('opened the step ' + asked + ' times');
    add('grid: a partial body entry is refused by the engine (body_partial) and asked for by the phone: it names the missing figure, holds plates, Rescue and tune, and sends the log without the three', bad.length === 0, `${label}: ${bad.join('; ')}`); continue; }
  const PL = A.planDay(prof, S.FILE, meal, S.fn.appetite()), plan = A.plan('meals', body), s = stated(plan.prompt || '');
  cellsA++;
  const diffs = [];
  if (U !== eU) diffs.push(`usual size: phone ${U}, engine ${eU}`);
  if ((s.years || null) !== (age ? String(age) : null)) diffs.push(`prompt states ${s.years} years, given ${age}`);
  if ((s.kg || null) !== (kg ? String(kg) : null)) diffs.push(`prompt states ${s.kg} kg, given ${kg}`);
  if (s.day !== (PL ? PL.day.kcal : null)) diffs.push(`day target: phone ${PL ? PL.day.kcal : 'none'}, prompt ${s.day}`);
  if (s.target !== (PL ? (U ? Math.max(PL.target.kcal, U) : PL.target.kcal) : null)) diffs.push(`meal target: phone ${PL ? PL.target.kcal : 'none'} (usual ${U}), prompt ${s.target}`);
  if (s.floor !== (U || null)) diffs.push(`medicines floor: phone ${U || 'none'}, prompt ${s.floor}`);
  add('grid: engine target, usual size and medicines floor equal the phone\'s; the prompt states no body figure that was not given', diffs.length === 0, `${label}: ${diffs.join('; ')}`);
  if (U) medsCells.push({ S, body, prof, U, meal, label });
}
// Rescue and tune on the medicines cells: the same usual size, no body figure that was not given; plates and one-tap changes at the usual size
for (const c of medsCells) {
  const { S, body, prof, U, meal, label } = c, plan = A.plan('meals', body);
  const rp = A.plan('rescue', J({ profile: prof, ctx: Object.assign({}, body.ctx, { text: 'Veg thali' }), file: body.file })), rs = stated(rp.prompt || '');
  add('grid: Rescue states no body figure that was not given', (rs.kg || null) === (prof.kg ? String(prof.kg) : null), `${label}: rescue prompt states ${rs.kg} kg, given ${prof.kg}`);
  for (const d of [U + 60, U + 150, U + 250, 900]) { const rm = rescueMovesFor(prof, meal, d); if (!rm || meal === 'snack') continue;
    add('grid: no Rescue move takes the dish under the phone\'s usual size', rm.hacks.every(h => (h.deltaKcal || 0) >= 0 || d + h.deltaKcal >= U), `${label}: dish ${d}, usual ${U}, moves ${rm.hacks.map(h => (h.deltaKcal || 0)).join(',')}`); }
  if (meal === 'snack') continue;   // a snack plate at the day split of 10 percent is too small to carry a plate with its own macros; the floor line is checked above
  const under = shownPlate(plan, Math.max(40, U - 10)), at = shownPlate(plan, U); probes++;
  add('grid: a plate under the phone\'s usual size is dropped, one at it is shown', !under && !!at, `${label}: usual ${U}; ${U - 10} kcal shown ${!!under}, ${U} kcal shown ${!!at}`);
  if (at) { changes++;
    const dk = -Math.min(72, Math.max(8, 4 * Math.floor((2 * at.carbs - 4) / 4))), lower = offered(prof, meal, at, dk), phoneRefuses = /usual size/.test(S.fn.composedWhy({ kcal: U + dk, protein: at.protein, carbs: at.carbs + dk / 4, fats: at.fats, fiber: at.fiber }, at, { meal })), same = offered(prof, meal, at, 0);
    // the phone refuses the change that takes the plate under the usual size, and the engine does not offer it; a change that keeps the size is offered
    if (process.env.DBG && !phoneRefuses && lower === false) console.log('DBG', label, S.fn.composedWhy({ kcal: U - 70, protein: at.protein, carbs: at.carbs - 18, fats: at.fats, fiber: at.fiber }, at, { meal }), JSON.stringify(at).slice(0,200));
    add('grid: a one-tap change under the usual size is not offered (the phone refuses it on tap)', lower === false && phoneRefuses, `${label}: engine offers ${lower}, phone refuses ${phoneRefuses}`);
    add('grid: a one-tap change that keeps the usual size is offered', same === true, `${label}: engine offers ${same}`);
    const tp = A.plan('tune', J({ profile: prof, slot: meal, meal: Object.assign({}, at, { minutes: 20 }) })), ts = stated(tp.prompt || '');
    add('grid: tune states the phone\'s usual size and no body figure that was not given', ts.tuneFloor === U && (ts.kg || null) === (prof.kg ? String(prof.kg) : null), `${label}: tune floor ${ts.tuneFloor} against ${U}, kg ${ts.kg}`); }
}
// goals, appetites, the day so far and the clock, on the body figures given or not (a fixed usual body for the figures that are given)
const EATEN = [['nothing logged', []], ['900 kcal 3 hours ago', [{ meal: 'breakfast', kcal: 900, hoursAgo: 3 }]], ['2,600 kcal 7 hours ago', [{ meal: 'breakfast', kcal: 2600, hoursAgo: 7 }]]];
for (const age of [0, 45]) for (const cm of [0, 160]) for (const kg of [0, 70]) for (const [mname, mp] of MEDS) for (const meal of MEALS) for (const goal of ['lose', 'hold', 'build']) for (const ap of [1, 5, 10]) for (const [ename, events0] of EATEN) for (const clock of [13, 21.7]) {
  if ((age > 0) + (cm > 0) + (kg > 0) === 1 || (age > 0) + (cm > 0) + (kg > 0) === 2) continue;   // a partial body entry is refused and asked for (above)
  const events = events0.map(e => Object.assign({}, e, { meal: meal === 'breakfast' ? 'dinner' : e.meal })), S = phoneState({ P: Object.assign({ sex: 'f', act: 'low', goal }, mp), meal, appetite: ap, events, clock });
  setBody(S.fn, S.P, 'age', age); setBody(S.fn, S.P, 'cm', cm); setBody(S.fn, S.P, 'kg', kg);
  const body = mealsBody(S), prof = S.fn.profileOut(), U = A.medsUsual(prof, meal), PL = A.planDay(prof, S.FILE, meal, S.fn.appetite()), plan = A.plan('meals', body), s = stated(plan.prompt || '');
  const phoneHooks = A.hooksFor(prof, S.FILE, { meal, hour: meal === S.CLOCK ? S.hr : null, mode: 'desk' }, PL).map(h => h.id).filter(x => x !== 'plain_day'), diffs = [];
  if (s.day !== (PL ? PL.day.kcal : null)) diffs.push(`day target: phone ${PL ? PL.day.kcal : 'none'}, prompt ${s.day}`);
  if (s.target !== (PL ? (U ? Math.max(PL.target.kcal, U) : PL.target.kcal) : null)) diffs.push(`meal target: phone ${PL ? PL.target.kcal : 'none'} (usual ${U}), prompt ${s.target}`);
  if (s.floor !== (U || null)) diffs.push(`medicines floor: phone ${U || 'none'}, prompt ${s.floor}`);
  if (JSON.stringify(hookIds(plan.prompt)) !== JSON.stringify(phoneHooks)) diffs.push(`hooks: phone ${phoneHooks}, prompt ${hookIds(plan.prompt)}`);
  cellsB++; add('grid: day target, meal target, medicines floor and hooks equal the phone\'s across goals, appetite, the day so far and the clock', diffs.length === 0, `age ${age} cm ${cm} kg ${kg} meds ${mname} ${meal} ${goal} appetite ${ap} ${ename} clock ${clock}: ${diffs.join('; ')}`);
}
console.log(`intake grid: ${cellsA} body cells (${cellsPartial} with a partial body entry, refused and asked for; the rest read the same), ${medsCells.length} on medicines (${probes} plate pairs, ${changes} one-tap pairs), ${cellsB} cells across goals, appetite, the day so far and the clock`);

// ---------- the phone's input bounds against the engine's ----------
// Every text a person can type into age, height and weight: what the phone keeps is what the engine reads, and what the phone cannot keep is not given.
section('bounds', () => { const TEXT = ['', ' ', '0', '-1', '-0', '5', '17', '18', '19', '45', '95', '96', '99', '100', '119', '120', '121', '160', '215', '216', '300', '29', '30', '31', '70', '200', '201', '45.4', '45.6', '17.5', '5.4', '5.11', '5.12', '6', '7.5', '48', '62', '63.5', '84', '85', '1e1', '4e1', 'abc', '12abc', 'Infinity', '9999999999', '0x20'];
  const fn = phoneState({}).fn;
  for (const k of ['age', 'cm', 'kg']) for (const t of TEXT) { const r = fn.bodyRead(k, t), P = Object.assign({}, P0, { sex: 'f', act: 'low', [k]: r.v }), prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }; prof[k] = P[k];
    const eng = A.readProfile(J(prof)), refused = A.profileRefused(J(prof));
    add('bounds: what the phone keeps from a typed text is what the engine reads, and is never refused', eng[k] === r.v && !refused && Number.isInteger(r.v) && (r.v === 0 || (r.v >= A.BODYB[k][0] && r.v <= A.BODYB[k][1])), `${k} "${t}": phone keeps ${r.v}, engine reads ${eng[k]}, refused ${refused}`); }
  // the engine's bound for each figure is the set-up's, and nothing outside is read: every whole number from -5 to 300 as the page could hold it
  for (const k of ['age', 'cm', 'kg']) for (let v = -5; v <= 300; v++) { const prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }; prof[k] = v;
    const inB = v >= A.BODYB[k][0] && v <= A.BODYB[k][1], pl = A.plan('meals', J({ profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5 }, file: {} }));
    const phoneKeeps = fn.bodyRead(k, String(v)).v === v;
    add('bounds: a whole number the set-up can store is read as sent; one it cannot is refused', v === 0 ? (pl.error === 'body_partial' && A.readProfile(J(prof))[k] === 0) : inB ? (pl.prompt && A.readProfile(J(prof))[k] === v) : (pl.error === 'bad_request' && Object.keys(pl).length === 1), `${k} ${v}: ${JSON.stringify(pl).slice(0, 80)}`);
    add('bounds: the phone\'s set-up keeps a number when, and only when, the engine reads it', v === 0 || phoneKeeps === inB, `${k} ${v}: the phone keeps ${phoneKeeps}, the engine bound ${A.BODYB[k]}`); }
  // not given, in every spelling the wire can carry
  // (all three at once: one or two not given is a partial body entry, refused with its own code)
  for (const v of [0, null, '', undefined, -0]) { const prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: v, cm: v, kg: v, act: 'low' }; if (v === undefined) { delete prof.age; delete prof.cm; delete prof.kg; }
    const eng = A.readProfile(J(prof)), pl = A.plan('meals', J({ profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5 }, file: {} }));
    add('bounds: 0, null, "" and missing are all "not given", stay 0 and are not refused (all three)', eng.age === 0 && eng.cm === 0 && eng.kg === 0 && !!pl.prompt, `${JSON.stringify(v)}: reads ${eng.age}/${eng.cm}/${eng.kg}, ${JSON.stringify(pl).slice(0, 60)}`); }
  for (const k of ['age', 'cm', 'kg']) for (const v of [0, null, '', undefined]) { const prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }; if (v === undefined) delete prof[k]; else prof[k] = v;
    const pl = A.plan('meals', J({ profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5 }, file: {} }));
    add('bounds: one figure not given (0, null, "" or missing) with the other two given is a partial body entry: refused as body_partial', pl.error === 'body_partial' && Object.keys(pl).length === 1, `${k} ${JSON.stringify(v)}: ${JSON.stringify(pl).slice(0, 70)}`); }
  // a value no phone sends: refused, never moved into the bounds
  for (const k of ['age', 'cm', 'kg']) for (const v of [true, false, [], {}, 'abc', '45.5', 45.5, NaN, Infinity, -Infinity, 1e9, [45], { v: 45 }]) { const prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }; prof[k] = v;
    const pl = safe(() => A.plan('meals', { profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5 }, file: {} }), { error: 'threw' });
    add('bounds: a value the set-up cannot store is refused, never moved', pl.error === 'bad_request' && Object.keys(pl).length === 1, `${k} ${String(v)}: ${JSON.stringify(pl).slice(0, 80)}`); }
  // every kind refuses it (meals, rescue, log, tune), and none builds a prompt from a moved figure
  for (const kind of ['meals', 'rescue', 'log', 'tune']) for (const [k, v] of [['age', 17], ['age', 96], ['cm', 119], ['cm', 216], ['kg', 29], ['kg', 201]]) { const prof = { goal: 'hold', focus: 'none', meds: 'yes', diet: 'veg', health: 'diabetes', bp: false, region: 'n', leave: [], sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }; prof[k] = v;
    const body = { profile: prof, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5, text: 'Veg thali' }, file: {}, slot: 'lunch', meal: Object.assign(plateAt(700), { minutes: 20 }) };
    const pl = safe(() => A.plan(kind, J(body)), { error: 'threw' });
    add('bounds: every kind refuses a body figure the set-up cannot store', pl.error === 'bad_request' && Object.keys(pl).length === 1, `${kind} ${k} ${v}: ${JSON.stringify(pl).slice(0, 80)}`); }
  // S7 first for a partial body entry: kidney, pregnancy and typed urgent or pregnancy text are referred, on every kind, before the partial body is read
  for (const [what, prof, text] of [['kidney', { health: 'kidney' }, ''], ['pregnancy', { health: 'preg' }, ''], ['typed urgent sign', {}, 'chest pain after lunch'], ['typed pregnancy', {}, 'I am pregnant']]) for (const kind of ['meals', 'rescue', 'log', 'tune']) for (const body3 of [{ age: 45, cm: 0, kg: 0 }, { age: 0, cm: 160, kg: 70 }, { age: 45, cm: 160, kg: 0 }]) {
    const b = { profile: Object.assign({ goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'none', bp: false, region: 'n', leave: [], sex: 'f', act: 'low' }, body3, prof), ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5, text: kind === 'rescue' && !text ? 'Veg thali' : text }, file: {}, slot: 'lunch', meal: Object.assign(plateAt(700), { minutes: 20 }) };
    if (kind === 'log' && !text) b.ctx.text = 'dal and roti'; if (kind === 'tune' && text) delete b.ctx.text;
    const pl = safe(() => A.plan(kind, J(b)), { error: 'threw' }), ownText = kind === 'tune' && text;   // tune carries no typed text: only the kidney and pregnancy answers refer
    if (ownText) continue;
    add('S7 first: a referral still refers when the body entry is partial (body_partial comes after the referrals)', !!(pl.reply && pl.reply.status === 'refer' && !pl.prompt), `${kind}, ${what}, ${JSON.stringify(body3)}: ${JSON.stringify(pl).slice(0, 100)}`); }
  // S7 first: an unstorable figure with a kidney condition, pregnancy or a typed urgent sign still refers (as the photo rule does)
  for (const [what, prof, text] of [['kidney', { health: 'kidney' }, ''], ['pregnancy', { health: 'preg' }, ''], ['typed urgent sign', {}, 'chest pain after lunch'], ['typed pregnancy', {}, 'I am pregnant']]) for (const kind of ['meals', 'rescue', 'log']) {
    const body = { profile: Object.assign({ goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'none', bp: false, region: 'n', leave: [], sex: 'f', age: 12, cm: 160, kg: 70, act: 'low' }, prof), ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5, text }, file: {} };
    if (kind !== 'meals' && !text) body.ctx.text = 'Veg thali';
    const pl = safe(() => A.plan(kind, J(body)), { error: 'threw' });
    add('S7 first: a referral still refers when a body figure is one the set-up cannot store', !!(pl.reply && pl.reply.status === 'refer' && !pl.prompt), `${kind}, ${what}: ${JSON.stringify(pl).slice(0, 100)}`); }
});

// ---------- the other fields the phone sends: appetite, the day number, the food file ----------
section('other fields', () => { const S = phoneState({ P: { meds: 'yes', sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }, meal: 'lunch' }), body = mealsBody(S), ask = (mut) => { const b = J(body); mut(b); return safe(() => A.plan('meals', b), { error: 'threw' }); };
  const refused = (pl) => pl.error === 'bad_request' && Object.keys(pl).length === 1;
  // appetite: null and missing are not given (5); 0, 11, a fraction and a word are not on the slider
  const apOf = (v) => { const pl = ask(b => { if (v === undefined) delete b.ctx.appetite; else b.ctx.appetite = v; }); return pl.prompt ? +(/- Appetite: (\d+) of 10/.exec(pl.prompt) || [])[1] : pl.error; };
  for (const v of [null, undefined, '']) add('appetite: null, "" or missing is not given and reads as 5 (the phone\'s default), not 1', apOf(v) === 5, `appetite ${JSON.stringify(v)}: ${apOf(v)}`);
  for (let v = 1; v <= 10; v++) add('appetite: 1 to 10 is read as sent', apOf(v) === v, `appetite ${v}: ${apOf(v)}`);
  for (const v of [0, -1, 11, 5.5, 'x', true, []]) add('appetite: a value the slider cannot hold is refused, never moved', apOf(v) === 'bad_request', `appetite ${JSON.stringify(v)}: ${apOf(v)}`);
  // the day number: null and missing are not given (no rotation anchor); 1 to 366 as sent; 0 and 367 refused
  const anchor = (v) => { const pl = ask(b => { b.ctx.lite = false; if (v === undefined) delete b.ctx.dayNo; else b.ctx.dayNo = v; }); return pl.prompt ? /Plate 1 is built on/.test(pl.prompt) : pl.error; };
  for (const v of [null, undefined, '']) add('dayNo: null, "" or missing is not given (no rotation anchor), not day 1', anchor(v) === false, `dayNo ${JSON.stringify(v)}: ${anchor(v)}`);
  for (const v of [1, 100, 366]) add('dayNo: 1 to 366 is read as sent', anchor(v) === true, `dayNo ${v}: ${anchor(v)}`);
  for (const v of [0, -1, 367, 1.5, 'x', true]) add('dayNo: a day the page cannot send is refused', anchor(v) === 'bad_request', `dayNo ${JSON.stringify(v)}: ${anchor(v)}`);
  // the food file: a figure the phone can hold is read as sent; one past what it can hold, a list longer than it makes, or a word for a figure is refused, never cut
  const fileOK = (mut) => { const pl = ask(b => mut(b.file)); return !!pl.prompt; }, fileBad = (mut) => refused(ask(b => mut(b.file)));
  add('file: nothing logged is read', fileOK(f => { }), 'an empty file'); add('file: a missing file is read as nothing logged', !!safe(() => A.plan('meals', (() => { const b = J(body); delete b.file; return b; })()), {}).prompt, 'no file');
  for (const [k, hi] of [['kcal', 25200], ['protein', 1840], ['carbs', 2960], ['fats', 1680], ['fiber', 640]]) { add('file: a day total up to what four logged meals can hold is read', fileOK(f => { f.today[k] = hi; }), `${k} ${hi}`); add('file: a day total past it is refused, never cut', fileBad(f => { f.today[k] = hi + 1; }) && fileBad(f => { f.today[k] = -1; }) && fileBad(f => { f.today[k] = 'x'; }), `${k} ${hi + 1}`); }
  add('file: a logged meal up to 6,300 kcal and 460 g protein (the most 6febc1a could write) is read; past it is refused', fileOK(f => { f.today.meals = [{ meal: 'breakfast', kind: 'had', title: 'x', kcal: 6300, protein: 460 }]; }) && fileOK(f => { f.today.meals = [{ meal: 'breakfast', kind: 'other', title: 'x', kcal: 5000, protein: 300 }]; }) && fileBad(f => { f.today.meals = [{ meal: 'breakfast', kind: 'had', title: 'x', kcal: 6301, protein: 0 }]; }) && fileBad(f => { f.today.meals = [{ meal: 'breakfast', kind: 'had', title: 'x', kcal: 0, protein: 461 }]; }), 'meal figures');
  add('file: more than four logged meals, 16 patterns, 10 recent foods are refused, never cut', fileBad(f => { f.today.meals = [1, 2, 3, 4, 5].map(() => ({ meal: 'lunch', kind: 'had', title: 'x', kcal: 100, protein: 5 })); }) && fileBad(f => { f.patterns = Array.from({ length: 17 }, () => ({ id: 'late_dinner', n: 3, of: 5 })); }) && fileBad(f => { f.recent = Array.from({ length: 11 }, () => 'Dal'); }), 'list lengths');
  add('file: 16 patterns (the most the phone makes is 13) and 10 recent foods are read', fileOK(f => { f.patterns = Array.from({ length: 16 }, () => ({ id: 'late_dinner', n: 3, of: 5 })); f.recent = Array.from({ length: 10 }, () => 'Dal'); }), 'list lengths');
  add('file: hours since the last meal: null is not given, 0 to 48 is read as sent, anything else is refused', fileOK(f => { f.today.lastHoursAgo = null; }) && fileOK(f => { f.today.lastHoursAgo = 0; }) && fileOK(f => { f.today.lastHoursAgo = 7.4; }) && fileOK(f => { f.today.lastHoursAgo = 48; }) && fileBad(f => { f.today.lastHoursAgo = 49; }) && fileBad(f => { f.today.lastHoursAgo = -1; }) && fileBad(f => { f.today.lastHoursAgo = 'x'; }), 'lastHoursAgo');
  add('file: an average protein per slot up to 460 g is read as sent (the old bounds of 200 and 300 moved it); a missing or null one is not given', (() => { const g = (v) => { const pl = ask(b => { b.file.slotProtein = { lunch: v, dinner: 40 }; b.file.days = 6; }); return pl.prompt ? (/about (\d+) g\)/.exec(pl.prompt) || [])[1] || 'ok' : pl.error; }; return g(250) !== 'bad_request' && g(460) !== 'bad_request' && g(461) === 'bad_request' && g(-1) === 'bad_request' && g(null) !== 'bad_request'; })(), 'slotProtein');
  // the title of a logged meal travels cut at 70, which the engine reads (the phone cuts it before it sends)
  const long = 'Dal tadka with jeera rice, cucumber raita, papad and a side of mixed vegetable sabzi cooked with onions';
  const S2 = phoneState({ P: { meds: 'yes', sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }, meal: 'dinner', events: [{ meal: 'lunch', kcal: 600, hoursAgo: 3, title: long }] }), b2 = mealsBody(S2);
  add('file: a title the phone sends is at most 70 characters, the engine\'s own cut', b2.file.today.meals.every(m => m.title.length <= 70) && b2.file.today.meals[0].title === long.slice(0, 70) && A.readFile(b2.file).today.meals[0].title === b2.file.today.meals[0].title, JSON.stringify(b2.file.today.meals.map(m => m.title.length)));
  // what the phone keeps from its store
  const f2 = makePhone ? phoneState({}).fn : null;
  if (f2) { add('store: a stored body figure the set-up cannot hold reads as not given', [[17, 0], [18, 18], [95, 95], [96, 0], [0, 0], [null, 0], ['45', 45], [45.4, 45], ['x', 0], [-3, 0]].every(([v, w]) => f2.bodyStored(v, 'age') === w) && f2.bodyStored(119, 'cm') === 0 && f2.bodyStored(120, 'cm') === 120 && f2.bodyStored(216, 'cm') === 0 && f2.bodyStored(29, 'kg') === 0 && f2.bodyStored(200, 'kg') === 200 && f2.bodyStored(201, 'kg') === 0, 'bodyStored');
    const kept = f2.appKept({ breakfast: 3, lunch: 0, snack: 11, dinner: 10, brunch: 5, x: null, y: 'a' });
    add('store: a stored appetite is kept only when the slider can hold it, for a meal the page has', JSON.stringify(kept) === JSON.stringify({ breakfast: 3, dinner: 10 }) && JSON.stringify(f2.appKept(null)) === '{}' && JSON.stringify(f2.appKept('x')) === '{}', JSON.stringify(kept)); }
});

// ---------- m5: the last condition unticked ----------
// Unticking the last condition in My food left health unset, and every request then answered bad_request until "None of these" was tapped.
section('m5', () => { const run = (steps, start) => { const S = phoneState({ P: Object.assign({ sex: 'f', age: 45, cm: 160, kg: 70, act: 'low' }, start || { health: null, conds: [], meds: '' }) }); steps.forEach(v => S.fn.setCond(v)); return S; };
  const SEQ = [[['diabetes', 'diabetes'], 'diabetes ticked then unticked'], [['bp', 'bp'], 'blood pressure ticked then unticked'], [['diabetes', 'bp', 'diabetes', 'bp'], 'both ticked, both unticked'], [['diabetes', 'none'], 'diabetes then None'], [['none', 'diabetes', 'diabetes'], 'None, diabetes, unticked']];
  for (const [steps, name] of SEQ) { const S = run(steps), body = mealsBody(S), pl = A.plan('meals', body);
    add('m5: with no condition ticked the health answer is "none" and the request is read', S.P.health === 'none' && S.P.conds.length === 0 && !!pl.prompt && body.profile.health === 'none', `${name}: health ${JSON.stringify(S.P.health)}, plan ${JSON.stringify(pl).slice(0, 60)}`);
    add('m5: with no condition ticked the medicine answer is cleared', S.P.meds === '' && body.profile.meds === 'no', `${name}: meds ${JSON.stringify(S.P.meds)}, sent ${body.profile.meds}`);
    for (const kind of ['rescue', 'log']) { const r = A.plan(kind, J({ profile: body.profile, ctx: Object.assign({}, body.ctx, { text: 'Veg thali' }), file: body.file })); add('m5: Rescue and log are read too', !!r.prompt, `${name} ${kind}: ${JSON.stringify(r).slice(0, 60)}`); } }
  // the rest of the ranking is as it was: a kidney condition or pregnancy first, then diabetes, then blood pressure
  const S = run(['bp', 'diabetes', 'kidney']); add('m5: the ticked conditions still rank (kidney first), and unticking down to one keeps that one', S.P.health === 'kidney' && (S.fn.setCond('kidney'), S.fn.setCond('diabetes'), S.P.health === 'bp'), 'ranking');
  add('m5 control: the server still refuses a request with no health answer (it does not default it)', A.plan('meals', J(Object.assign(mealsBody(run(['diabetes'])), {}))).prompt !== undefined && (() => { const b = mealsBody(run(['diabetes'])); b.profile.health = null; return A.plan('meals', J(b)).error === 'bad_request'; })(), 'a null health');
});

// ---------- the all-given and all-empty requests are the same as on 21a8bcc ----------
section('golden', () => { const g = JSON.parse(fs.readFileSync(GOLD, 'utf8')).cells, cells = goldenCells();
  add('golden: the golden file holds the cells', Object.keys(g).length === Object.keys(cells).length && Object.keys(g).length >= 150, `${Object.keys(g).length} cells in the file, ${Object.keys(cells).length} built`);
  for (const k of Object.keys(cells)) add('golden: a request with every body figure given, or none, gives the prompt, schema and check answer 21a8bcc gave', g[k] === cells[k], `${k}: ${cells[k]} (21a8bcc: ${g[k]})`); });

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       ... ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(fail ? `${fail} counter-example(s): request intake is not the same on the phone and in the engine (${pageFile})` : `request intake: the phone and the engine read every request the same (${pageFile})`);
process.exit(fail ? 1 : 0);
