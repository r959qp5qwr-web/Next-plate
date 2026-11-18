// Request intake parity (fix-r18; safety audit of 21a04a3, B1). The rule (docs/SAFETY-INVARIANTS.md, "The intake rule"):
//   "not given" (0, null, "", missing, as each field defines it) stays not given on both sides; a value the set-up can store reads
//   the same on the phone and in the engine; a value the set-up cannot store is refused (bad_request) and never clamped.
// B1: a client on insulin enters an age and leaves height and weight empty; the phone sends cm 0, kg 0; the engine read them as 120 cm and
// 30 kg (num() clamps before the "||0" can see the zero), told the model "female, 30 kg", built a day target nobody has, and stated a usual
// size (340 kcal for a woman's lunch) under the one S6 and the phone's own medsUsual give (480).
// This file runs the phone's own functions (taken from src/v6/app.js, run against np-core) and the engine's plan() on the same input.
// usage: node test/safety/intake.js [hosted/v6/index.html | hosted/v6/index.min.html | hosted/v5/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv[2] || path.join(ROOT, 'hosted/v6/index.html');
const page = fs.readFileSync(pageFile, 'utf8');
const core = page.split('<script id="np-core">')[1].split('</script>')[0];
const A = {}; vm.createContext(A); vm.runInContext(core, A);   // np-core as the server and the page run it
const appSrc = fs.readFileSync(process.env.NP_APP || path.join(ROOT, 'src/v6/app.js'), 'utf8');
const grab = (name) => { const i = appSrc.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = appSrc.indexOf('{', i); for (; j < appSrc.length; j++) { if (appSrc[j] === '{') d++; else if (appSrc[j] === '}') { d--; if (!d) break; } } return appSrc.slice(i, j + 1); };
const J = (x) => JSON.parse(JSON.stringify(x));
const safe = (f, d) => { try { return f(); } catch (e) { return d; } };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };

// ---------- the phone: its own functions, on a P like the set-up leaves ----------
const PHONE_FNS = ['has', 'profileOut', 'healthOf', 'bodyRead', 'setCond'];
const phoneSrc = PHONE_FNS.map(grab).filter(Boolean).join('\n');
const phoneFns = PHONE_FNS.filter(n => grab(n));
const mkPhone = (o) => {
  const P = Object.assign({ goal: 'hold', focus: 'none', meds: '', diet: 'veg', health: 'diabetes', conds: ['diabetes'], region: 'n', leave: [], sex: 'f', age: 0, cm: 0, kg: 0, act: 'low', done: true }, o);
  const make = vm.runInContext('(function(P){var CONDS=["kidney","preg","diabetes","bp"];' + phoneSrc + '\nreturn {' + phoneFns.map(n => n + ':' + n).join(',') + '};})', A);
  return { P, fn: make(P) };
};

// ---------- what the engine says ----------
const BASEC = { lite: true, dayNo: 322, meal: 'lunch', time: '1:10 pm', hour: null, mode: 'desk', mood: 'best', cuisine: 'home', prep: 'home', oil: 'min', appetite: 5, text: '' };
const personLine = (prompt) => (prompt.split('\n').find(l => /^- .*(years|kg|female|male|mostly|activity|exercise|training)/i.test(l)) || '');
const kcalAfter = (prompt, re) => { const m = re.exec(prompt); return m ? +m[1] : null; };
const stated = (prompt) => { const L = personLine(prompt), d = /Day target: about (\d+) kcal/.exec(prompt), t = /Target for this meal: (?:about|at least) (\d+) kcal/.exec(prompt);
  return { years: (/(\d+) years/.exec(L) || [])[1] || null, kg: (/(\d+) kg/.exec(L) || [])[1] || null, day: d ? +d[1] : null, target: t ? +t[1] : null,
    floor: kcalAfter(prompt, /every plate, with any swap or change, is at least (\d+) kcal/), line: L }; };
// a plate whose figures agree, at the kcal asked, tagged so only the energy can drop it
const plateAt = (kcal) => { const p = 24, f = 14, c = Math.max(1, Math.round((kcal - 4 * p - 9 * f) / 4)); return { title: 'Moong dal with jowar roti', subtitle: 'Moong dal, jowar roti and salad', cuisine: 'North Indian', prepMinutes: 20,
  items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: ['plain'] }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: Math.round(4 * p + 4 * c + 9 * f), protein: p, carbs: c, fats: f, fiber: 12, why: [], planned_around: [], taste: ['fresh'] }; };
const shown = (plan, kcal) => { const r = safe(() => plan.check({ status: 'ok', refer_reason: 'none', meals: [plateAt(kcal)] }), {}); return ((r.meals || []).length > 0); };

// ---------- B1: the reproduction ----------
// A woman on insulin, 45 years, height and weight left empty: the phone has no target and its usual size is the day split of the energy floor.
{ const { P, fn } = mkPhone({ meds: 'yes', sex: 'f', age: 45, cm: 0, kg: 0, act: 'low' });
  const prof = J(fn.profileOut());
  const body = J({ profile: prof, ctx: BASEC, file: { today: { kcal: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, meals: [], lastHoursAgo: null, lastKcal: 0 }, patterns: [], slotProtein: {}, days: 0, recent: [] } });
  const phoneUsual = A.medsUsual(fn.profileOut(), 'lunch'), plan = A.plan('meals', body), s = stated(plan.prompt || '');
  add('B1 phone: no height or weight gives the day split of the energy floor', phoneUsual === 480, 'the phone says ' + phoneUsual);
  add('B1 the prompt states no weight that was not given', s.kg === null, 'prompt: "' + s.line + '"');
  add('B1 the prompt states no day target when height and weight are not given', s.day === null, 'Day target: about ' + s.day + ' kcal');
  add('B1 the prompt states the phone\'s usual size as the minimum', s.floor === phoneUsual && s.target === phoneUsual, 'prompt floor ' + s.floor + ', target line ' + s.target + ', phone ' + phoneUsual);
  add('B1 a plate under the phone\'s usual size is dropped, one at it is shown', !shown(plan, phoneUsual - 20) && shown(plan, phoneUsual), 'plate at ' + (phoneUsual - 20) + ' shown: ' + shown(plan, phoneUsual - 20) + '; at ' + phoneUsual + ' shown: ' + shown(plan, phoneUsual));
  const rp = A.plan('rescue', J({ profile: prof, ctx: Object.assign({}, BASEC, { text: 'Veg thali' }), file: {} })), rs = stated(rp.prompt || '');
  add('B1 Rescue: the prompt states no weight that was not given', rs.kg === null, 'prompt: "' + rs.line + '"');
  const tp = A.plan('tune', J({ profile: prof, slot: 'lunch', meal: Object.assign(plateAt(phoneUsual + 20), { minutes: 20 }) })), ts = stated(tp.prompt || '');
  add('B1 tune: the prompt states no weight that was not given', ts.kg === null, 'prompt: "' + ts.line + '"');
  add('B1 tune: the usual size is the phone\'s', /under (\d+) kcal, the usual size/.exec(tp.prompt || '') && +/under (\d+) kcal, the usual size/.exec(tp.prompt || '')[1] === phoneUsual, 'prompt: ' + ((/no swap or change takes the plate under[^.]*/.exec(tp.prompt || '') || [''])[0]));
}

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       ... ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(fail ? `${fail} counter-example(s): request intake is not the same on the phone and in the engine (${pageFile})` : `request intake: the phone and the engine read every request the same (${pageFile})`);
process.exit(fail ? 1 : 0);
