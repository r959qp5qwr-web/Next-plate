// The schema snapshot (fix-r17). Gates read the page; none of them can see whether the live model accepts a response schema. On 18 Nov the
// model answered every meals request with 400 "constraint that has too many states for serving" after fix-r14's item limits on two
// schemas went live in 50090ef; the gates had passed and four reports had said "maxItems configured, not live-validated". This test makes that blind spot a
// failing check: the schema the model is asked to answer in is part of what the build is judged on, and a change to it needs a deliberate
// step and a live acceptance on record.
//
// What it does. For each kind the page asks the model about (meals, tune, log, rescue) it builds plan(kind, body) over every request shape:
//   - every recorded scenario (eval/v6/scenarios.json, eval/atrisk/scenarios.json), as eval/v6/bodies.js builds the body the app sends;
//     for a scenario with "tune", the follow-up the app sends for the first plate served (the same builder the sample-window runner uses);
//   - the body of the referral sample window of 17 Nov (eval/referral/run.js), the request that got four plates back from the live model;
//   - a grid of the variants the meals schema depends on (the schema's planned_around list is the day's hooks, in order: goal, focus, health
//     and medicine, meal, mode, and the day so far), each with the app's "lite" flag and, as a separate class, without it;
// takes the canonical schema (JSON.stringify as built, which is what the server sends) and its sha256, and looks it up in the kind's snapshot
// under test/safety/schemas/. The test FAILS when a schema the page builds is in no snapshot entry. A schema change therefore needs
//   node test/safety/schemas.js --update         (rewrite the snapshots from the page; a new schema is "pending", a known one keeps its record)
// and then, only after a live sample window has shown the model answering in it,
//   node test/safety/schemas.js --accept <kind> <sha256 prefix | all> --commit <sha> --date <yyyy-mm-dd> --how "<what was run>"
// test/deploy/schemas-accepted.js is the separate check, run before every "Deploy." ask: it FAILS while any entry the served page can
// produce is still "pending". It is not part of npm run safety.
//
// The record "accepted_by" is a fact about a schema's bytes ({commit, date, how}), never a promise about a request shape. An entry is
// "pending" until the model has answered in that schema, byte for byte. Entries the page no longer builds are kept when accepted (the live model
// took those bytes once; the history stays) and dropped when pending.
// usage: node test/safety/schemas.js [page]        (page: hosted/v6/index.html, hosted/v6/index.min.html or hosted/v5/index.min.html)
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '../..'), DIR = path.join(__dirname, 'schemas');
const B = require(path.join(ROOT, 'eval/v6/bodies.js'));
const KINDS = ['meals', 'tune', 'log', 'rescue'];
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const J = x => JSON.parse(JSON.stringify(x));
const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

function loadPage(file) {
  const page = fs.readFileSync(file, 'utf8'), a = {}; vm.createContext(a);
  vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a); return a;
}

// ---------- a plate as the app holds it after the server served it (the base of the tune follow-up) ----------
// The recorded plate "Gujarati Toor Dal with Bajra Rotla" (the one test/safety/inject.js uses), projected onto the schema's plate and
// given honest tags, then read by the page's own check, so the plate the follow-up carries is a served one.
const project = (v, s) => { if (v == null || !s) return v;
  if (s.type === 'OBJECT' && v && typeof v === 'object') { const o = {}; for (const k of Object.keys(s.properties)) if (k in v) o[k] = project(v[k], s.properties[k]); return o; }
  if (s.type === 'ARRAY' && Array.isArray(v)) return v.map(x => project(x, s.items)); return v; };
function servedPlate(a, rq) {
  const pl = a.plan('meals', rq); if (!pl || !pl.schema) return null;
  const src = readJson('eval/v5/results-live-r37.json').find(r => r.id === 'jain-lunch').reply.raw.meals.find(m => /Bajra Rotla/.test(m.title));
  const it = pl.schema.properties.meals.items, m = project(J(src), it); m.contains = ['grain'];
  m.items.forEach(i => { i.contains = i.food === m.grain.food || /rice/i.test(i.food) ? ['grain'] : ['plain']; });
  m.taste = ['tangy', 'smoky', 'spicy']; m.planned_around = [it.properties.planned_around.items.enum[0]];
  const out = pl.check({ status: 'ok', refer_reason: 'none', meals: [m] });
  return (out.meals || [])[0] || null;
}

// ---------- the request shapes ----------
function grid(a) {
  const out = [], P = B.baseP, C = B.baseC, meals = a.OPT.meal.map(x => x[0]);
  const add = (label, p, c, file, partial) => out.push({ label: 'grid: ' + label, kind: 'meals', partial: !!partial, body: { profile: Object.assign({}, P, p), ctx: Object.assign({}, C, c), file: file || {} } });
  const other = m => meals.filter(x => x !== m);
  const days = (m) => { const o = other(m), f = [];
    f.push(['nothing logged', {}]);
    f.push(['heavy day so far', { today: { kcal: 1250, protein: 40, lastHoursAgo: 6, lastKcal: 600, meals: [{ meal: o[0], kind: 'had', title: 'Dal and roti', kcal: 1250, protein: 40 }] } }]);
    f.push(['light day so far (protein gap)', { today: { kcal: 400, protein: 8, lastHoursAgo: 3, lastKcal: 400, meals: [{ meal: o[0], kind: 'had', title: 'Poha', kcal: 400, protein: 8 }] } }]);
    for (const k of ['skipped', 'rescued', 'ordered', 'had']) f.push(['another meal ' + k, { today: { kcal: 300, protein: 12, lastHoursAgo: 2, meals: [{ meal: o[1], kind: k, title: 'Idli sambar', kcal: 300, protein: 12 }] } }]);
    f.push(['long gap', { today: { kcal: 300, protein: 12, lastHoursAgo: 9, lastKcal: 300, meals: [] } }]);
    f.push(['late dinners', { patterns: [{ id: 'late_dinner', n: 4, of: 6 }], days: 6 }]);
    f.push(['skips this meal', { patterns: [{ id: 'skips_meal', meal: m, n: 4, of: 6 }], days: 6 }]);
    for (const food of ['rajma', 'paneer']) f.push(['repeat ' + food, { patterns: [{ id: 'repeat', slot: m === 'breakfast' ? 'b' : m === 'snack' ? 's' : 'm', food, n: 4 }], days: 6 }]);
    f.push(['lowest-protein meal', { slotProtein: { [m]: 5, [o[0]]: 30, [o[1]]: 25, [o[2]]: 28 }, days: 6 }]);
    return f; };
  const profiles = [['hold', {}], ['lose', { goal: 'lose' }], ['build', { goal: 'build' }]]
    .concat(Object.keys(a.FOCUSRULE).map(k => ['focus ' + k, { focus: k }]))
    .concat([['diabetes, medicine yes', { health: 'diabetes', meds: 'yes' }], ['diabetes, medicine no', { health: 'diabetes', meds: 'no' }], ['blood pressure', { health: 'bp' }],
             ['vegan', { diet: 'vegan' }], ['egg', { diet: 'egg' }], ['non-veg', { diet: 'nonveg' }], ['Jain', { diet: 'jain' }]]);
  for (const m of meals) {
    for (const [pl, p] of profiles) add(m + ', ' + pl, p, { meal: m });
    for (const mode of ['active', 'rest']) add(m + ', mode ' + mode, {}, { meal: m, mode });
    for (const [dl, f] of days(m)) add(m + ', ' + dl, {}, { meal: m }, f);
    add(m + ', late hour', {}, { meal: m, hour: 22.4, time: '10:24 pm' });
    // the app sends hour:null on every tab that is not the meal of the clock (fix-r18: the engine read it as midnight)
    add(m + ', hour not given', {}, { meal: m, hour: null });
    // partial body entries (fix-r18; safety audit of 21a04a3, B1): the phone sends 0 for a figure the client left empty. With no target (height or
    // weight missing) the hooks that read the day's plan (protein to catch up, lighter after earlier meals) are not offered
    for (const [bl, bp] of [['age only', { age: 46, cm: 0, kg: 0 }], ['age and height', { age: 46, cm: 158, kg: 0 }], ['height and weight, no age', { age: 0, cm: 158, kg: 68 }], ['no body figures', { age: 0, cm: 0, kg: 0 }]])
      for (const [pl, p] of [['hold', {}], ['lose', { goal: 'lose' }], ['diabetes, medicine yes', { health: 'diabetes', meds: 'yes' }]])
        for (const [dl, f] of days(m)) add(m + ', body ' + bl + ', ' + pl + ', ' + dl, Object.assign({}, bp, p), { meal: m }, f, true);
    // every hook at once (the longest list the page can send: nine), with and without the diabetes medicine hooks
    const o = other(m), all = { today: { kcal: 1250, protein: 10, lastHoursAgo: 9, lastKcal: 800, meals: [{ meal: o[0], kind: 'skipped' }, { meal: o[1], kind: 'rescued', title: 'Thali' }, { meal: o[2], kind: 'had', title: 'Upma' }] },
      patterns: [{ id: 'late_dinner', n: 4, of: 6 }, { id: 'skips_meal', meal: m, n: 4, of: 6 }, { id: 'repeat', slot: m === 'breakfast' ? 'b' : m === 'snack' ? 's' : 'm', food: 'rajma', n: 4 }], slotProtein: { [m]: 5, [o[0]]: 30, [o[1]]: 25 }, days: 6 };
    add(m + ', every hook', { goal: 'lose', focus: 'iron', health: 'bp' }, { meal: m, mode: 'active', hour: 22.4 }, all);
    add(m + ', every hook, diabetes medicine', { goal: 'build', focus: 'pro', health: 'diabetes', meds: 'yes', bp: true }, { meal: m, mode: 'active', hour: 22.4 }, all);
  }
  return out;
}
function recorded() {
  const out = [];
  for (const s of readJson('eval/v6/scenarios.json')) out.push({ label: 'eval/v6 ' + s.id, kind: s.kind, body: B.body(s), tune: !!s.tune });
  for (const s of readJson('eval/atrisk/scenarios.json')) out.push({ label: 'eval/atrisk ' + s.id, kind: s.kind, body: B.body(s) });
  // the referral sample window of 17 Nov (eval/referral/run.js): one plain profile, lunch, the plate path. Its request text varied (the held-out referral phrasings, which the page now refers before the model); the schema does not depend on the text, so a neutral text stands for them
  out.push({ label: 'eval/referral window of 17 Nov', kind: 'meals', window: true,
    body: { profile: { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 34, cm: 158, kg: 64, act: 'low' },
      ctx: { lite: true, meal: 'lunch', time: '1:10 pm', hour: 13.2, dayNo: 320, mode: 'desk', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5, text: 'something light for lunch' }, file: {} } });
  return out;
}

// builds every shape; returns {kind: Map(sha -> entry)} and the problems found while building
function enumerate(a) {
  const got = {}, problems = []; KINDS.forEach(k => { got[k] = new Map(); });
  const put = (kind, schema, body, label, app, win, partial) => {
    const text = JSON.stringify(schema), h = sha(text);
    let e = got[kind].get(h);
    if (!e) { e = { sha256: h, bytes: text.length, schema: text, app_sends: app, hooks: kind === 'meals' ? schema.properties.meals.items.properties.planned_around.items.enum : undefined,
      lite: kind === 'meals' ? !schema.properties.meals.items.properties.swaps : undefined, example_body: body, shapes: 0, labels: [], window: false, partialOnly: !!partial }; got[kind].set(h, e); }
    if (!partial) e.partialOnly = false;
    e.shapes++; if (e.labels.length < 3) e.labels.push(label); if (app) e.app_sends = true; if (win) e.window = true; };
  const shapes = recorded().concat(grid(a));
  for (const s of shapes) {
    const rqs = [s]; if (s.kind === 'meals') { const nl = J(s.body); delete nl.ctx.lite; rqs.push({ label: s.label + ' (without lite)', kind: 'meals', body: nl, nolite: true }); }
    for (const r of rqs) {
      const pl = a.plan(r.kind, r.body);
      if (!pl || !pl.schema) { if (!pl || pl.error) problems.push(`${r.label}: plan(${r.kind}) gave ${pl && pl.error ? pl.error : 'no schema'}`); continue; }   // a reply without the model (a referral) has no schema
      put(r.kind, pl.schema, r.body, r.label, !r.nolite, !!s.window && !r.nolite, !!s.partial);
    }
    if (s.tune) {   // the follow-up the app sends for a plate it was served
      const sp = servedPlate(a, s.body), tb = sp && B.tuneBody(s.body.profile, s.body.ctx.meal, sp), pl = tb && a.plan('tune', tb);
      if (!pl || pl.error || !pl.schema || !pl.prompt) problems.push(`${s.label}: the tune body the runner builds gives ${pl && pl.error ? pl.error : 'no schema and prompt'}`);
      else put('tune', pl.schema, tb, s.label + ' tune', true, false);
    }
  }
  return { got, problems };
}

// ---------- the snapshots ----------
const snapFile = k => path.join(DIR, k + '.json');
const readSnap = k => fs.existsSync(snapFile(k)) ? JSON.parse(fs.readFileSync(snapFile(k), 'utf8')) : { kind: k, entries: [] };
function check(a) {
  const { got, problems } = enumerate(a), rows = [], bad = [], partial = [];
  for (const k of KINDS) {
    const snap = readSnap(k), known = new Map(snap.entries.map(e => [e.sha256, e]));
    snap.entries.forEach(e => { if (sha(e.schema) !== e.sha256) bad.push(`${k}: the snapshot entry ${e.sha256.slice(0, 12)} does not hold the schema its hash names`); });
    let miss = 0; for (const [h, e] of got[k]) if (!known.has(h) && e.partialOnly) { partial.push({ kind: k, sha: h, bytes: e.bytes, hooks: e.hooks, label: e.labels[0], app: e.app_sends }); }
      else if (!known.has(h)) { miss++; bad.push(`${k}: a schema the page builds (${h.slice(0, 12)}, ${e.bytes} bytes${e.hooks ? ', hooks ' + JSON.stringify(e.hooks) : ''}; ${e.labels[0]}) is in no snapshot entry. If the change is deliberate: node test/safety/schemas.js --update, then record a live acceptance`); }
    rows.push({ kind: k, built: got[k].size, entries: snap.entries.length, miss, partialN: partial.filter(x => x.kind === k).length, accepted: [...got[k].keys()].filter(h => known.get(h) && known.get(h).accepted_by !== 'pending').length });
  }
  return { rows, bad: problems.concat(bad), got, partial };
}
function update(a, args) {
  const { got, problems } = enumerate(a); if (problems.length) { problems.forEach(p => console.log('PROBLEM ' + p)); process.exit(1); }
  fs.mkdirSync(DIR, { recursive: true });
  for (const k of KINDS) {
    const old = readSnap(k), prev = new Map(old.entries.map(e => [e.sha256, e])), entries = [];
    for (const [h, e] of got[k]) { const p = prev.get(h); entries.push(Object.assign({}, e, { accepted_by: p ? p.accepted_by : 'pending', window: e.window || (p && p.window) || false, app_sends: e.app_sends || (p && p.app_sends) || false })); }
    for (const [h, p] of prev) if (!got[k].has(h) && p.accepted_by !== 'pending') entries.push(Object.assign({}, p, { current: false }));   // kept: the live model took these bytes once
    entries.sort((x, y) => (y.current === false) - (x.current === false) || (x.accepted_by === 'pending') - (y.accepted_by === 'pending') || x.sha256.localeCompare(y.sha256));
    entries.forEach(e => { if (e.current !== false) delete e.current; });
    fs.writeFileSync(snapFile(k), JSON.stringify({ kind: k, about: 'Canonical schemas (JSON.stringify as built; sha256 of that text) the page can send for this kind, and whether the live model has answered in them. See test/safety/schemas.js and docs/SAFETY-INVARIANTS.md (intake).', entries }, null, 1) + '\n');
    console.log(`${k}: ${entries.length} entries (${entries.filter(e => e.accepted_by !== 'pending').length} accepted, ${entries.filter(e => e.accepted_by === 'pending').length} pending, ${entries.filter(e => e.current === false).length} kept but no longer built)`);
  }
}
function accept(args) {
  const opt = n => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  const [kind, which] = [args[1], args[2]], rec = { commit: opt('--commit'), date: opt('--date'), how: opt('--how') };
  if (!KINDS.includes(kind) || !which || !rec.commit || !rec.date || !rec.how) { console.log('usage: --accept <kind> <sha256 prefix | all> --commit <sha> --date <yyyy-mm-dd> --how "<what was run>"'); process.exit(2); }
  const snap = readSnap(kind); let n = 0;
  snap.entries.forEach(e => { if (e.accepted_by === 'pending' && (which === 'all' || e.sha256.startsWith(which))) { e.accepted_by = rec; n++; } });
  fs.writeFileSync(snapFile(kind), JSON.stringify(snap, null, 1) + '\n'); console.log(`${kind}: ${n} entries recorded as accepted by ${rec.commit} (${rec.date})`);
}

module.exports = { KINDS, loadPage, enumerate, readSnap, sha, check };
if (require.main === module) {
  const args = process.argv.slice(2), page = args.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
  if (args[0] === '--accept') accept(args);
  else if (args[0] === '--update') update(loadPage(page), args);
  else {
    const { rows, bad, partial } = check(loadPage(page));
    for (const r of rows) console.log(`schema snapshot ${r.kind}: ${r.built} schemas built, ${r.entries} entries, ${r.accepted} of those accepted live, ${r.miss} not in the snapshot${r.partialN ? `, ${r.partialN} more only a partial body entry builds (below)` : ''}`);
    // fix-r18: formats only a partial body entry builds (the phone sends 0 for a figure the client left empty) are enumerated and reported; they are in no
    // snapshot entry yet and are not recorded here (no --update). They do not fail this test, which is about a schema changing under a build; the pre-Deploy
    // check (test/deploy/schemas-accepted.js) counts them and fails until a live window has answered them and they are recorded
    if (partial.length) console.log(`schema snapshot: ${partial.length} formats built only by a partial body entry are in no snapshot entry (${partial.filter(x => x.app).length} the app sends, with its lite flag); reported, not recorded. test/deploy/schemas-accepted.js fails on them until a live window has answered them`);
    bad.slice(0, 8).forEach(b => console.log('FAIL ' + b)); if (bad.length > 8) console.log(`FAIL ... and ${bad.length - 8} more`);
    console.log(bad.length ? `schema snapshot: ${bad.length} failures (${page})` : partial.length ? `schema snapshot: no schema changed under the build; ${partial.length} partial-body formats await a live window (${page})` : `schema snapshot: every enumerated schema the page builds is in the snapshot (${page})`);
    process.exit(bad.length ? 1 : 0);
  }
}
