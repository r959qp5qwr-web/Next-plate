// Typed medicine words (fix-r21; owner, 22 Nov, option survey "Ask to update (Recommended)"): "Typed insulin or sugar-tablet words hold the plate. One line asks the client to add it
// in My food, and a tap opens that step." S5 and S6 read the set-up's answers, so a client whose set-up says no medicine who types that they take insulin got plates with no grain
// rule and no usual size. The net (typedMeds, medsTypedHold, medsTypedBody in src/v6/engine.js; api() in src/v6/app.js) is tested both ways here:
//   - a generated phrasing set: first-person present use, English and Hinglish, with food words around, is held; a negation, another person, "stopped", "insulin resistance" and a
//     bare "I am diabetic" are not;
//   - the engine's plan() on every kind (meals and Rescue answer meds_typed; the log, which counts what was eaten and which S6 does not read, and tune are not held), for a profile
//     that does not say insulin or sugar tablets and for one that does (no hold: the usual size already applies);
//   - the order: a typed referral (urgent, kidney, pregnancy) comes first, then this hold, then the body hold; in the engine and on the phone with the app's own api(), with the
//     live bodyHold (a partial body) and the live medicine hold;
//   - the phone and the engine agree on every phrasing.
// usage: node test/safety/typed-meds.js [hosted/v6/index.html | hosted/v6/index.min.html | hosted/v5/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
const page = fs.readFileSync(pageFile, 'utf8'), A = {}; vm.createContext(A); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], A);
const appSrc = fs.readFileSync(process.env.NP_APP || path.join(ROOT, 'src/v6/app.js'), 'utf8');
const grab = (name) => { const i = appSrc.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = appSrc.indexOf('{', i); for (; j < appSrc.length; j++) { if (appSrc[j] === '{') d++; else if (appSrc[j] === '}') { d--; if (!d) break; } } return appSrc.slice(i, j + 1); };
const J = (x) => JSON.parse(JSON.stringify(x)), safe = (f, d) => { try { return f(); } catch (e) { return d; } };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };

// ---------- the phrasing set ----------
const MEDS = ['insulin', 'glimepiride', 'gliclazide', 'glibenclamide', 'glipizide', 'sugar tablets', 'sugar pills', 'diabetes tablets', 'Lantus', 'Amaryl', 'Humulin'];
const HI = ['insulin', 'glimepiride', 'gliclazide', 'sugar ki goli', 'sugar ki dawai', 'diabetes ki dawai', 'sugar ki goliyan'];
const WRAP = [x => x, x => x + ', a light dinner please', x => 'Hi, ' + x + '. Something with paneer and a roti', x => x.toUpperCase(), x => x + ' - what should I eat after', x => 'dinner tonight? ' + x];
const HELD = [], NOT = [];
for (const m of MEDS) for (const f of ['I take M', 'I\'m on M', 'I am on M', 'I use M every day', 'after my M', 'I took my M this morning', 'I forgot my M', 'I have to take M', 'I take M twice a day', 'we both take M', 'I inject M at night', 'I’m on M', 'I also take M', 'Im on M'])
  for (const w of WRAP) HELD.push([w(f.replace('M', m)), 'en first person: ' + f]);
HELD.push(['tablets for my sugar', 'en'], ['I take insulin and glimepiride', 'en'], ['I take metformin and insulin', 'en, two medicines'], ['my mother takes insulin and I take glimepiride', 'en, two people'], ['I take sugar tablets, my father takes insulin', 'en, two people'],
  ['My insulin is at 8 pm, what dinner', 'en'], ['I forgot to take my insulin, what now for lunch', 'en']);
for (const m of HI) for (const f of ['main M leta hoon', 'main M leti hoon', 'M leta hoon', 'M leti hoon', 'M lagata hoon', 'M lagati hoon', 'mujhe M lena padta hai', 'meri M ke baad kya khaun', 'main M le raha hoon', 'main M le rahi hoon', 'mai M leti hu', 'main diabetic hoon, M leti hoon'])
  for (const w of WRAP.slice(0, 3)) HELD.push([w(f.replace('M', m)), 'hi first person: ' + f]);
const NEG = ['I don\'t take M', 'I do not take M', 'I dont take M', 'no M, just dal rice', 'not on M', 'I stopped M last year', 'I never take M', 'I\'m off M', 'without M', 'I no longer take M', 'I used to take M', 'avoid M? what dinner', 'I’m not on M', 'I do not use M'];
const THIRD = ['my mother takes M', 'my father is on M', 'my husband takes M', 'my wife uses M', 'my friend takes M and wants dinner ideas', 'he takes M', 'she is on M', 'for my grandmother who takes M', 'a person on M, what dinner', 'my son takes M', 'my mother-in-law is on M', 'my brother has to take M'];
for (const m of MEDS) { for (const f of NEG.concat(THIRD)) for (const w of WRAP.slice(0, 3)) NOT.push([w(f.replace('M', m)), f]); }
for (const m of HI) for (const f of ['M nahi leta hoon', 'M nahi leti hoon', 'main M nahi leta', 'M nahin leti hoon', 'papa M leta hai', 'mummy M leti hain', 'mera bhai M leta hai', 'uski M band ho gayi', 'maine M chhod di', 'mere pati M lete hain', 'M leta hai', 'M leti hai']) for (const w of WRAP.slice(0, 3)) NOT.push([w(f.replace('M', m)), f]);
for (const t of ['insulin resistance diet', 'I have insulin resistance, a low gi dinner', 'low insulin index foods', 'insulin sensitivity foods', 'foods that spike insulin', 'insulin spikes after rice', 'what raises insulin levels', 'PCOS and insulin resistance, dinner',
  'diabetic dinner', 'I am diabetic, light dinner', 'main diabetic hoon, halka khana', 'sugar free dessert', 'Veg thali', 'something sweet', 'glucose tablets for lows', 'I take metformin', 'I take vitamin tablets', 'I take tablets for BP', 'sugar ki chai', 'sugar nahi chahiye',
  'tablet', 'insulin', 'glimepiride', 'sugar tablets', 'diabetes medicine', 'the insulin diet', 'low sugar dinner', 'no sugar tablets please']) NOT.push([t, 'unrelated, bare or neutral']);
// profiles: a set-up that does not say insulin or sugar tablets (held) and one that does (no hold)
const PROF = (o) => Object.assign({ goal: 'hold', focus: 'none', diet: 'veg', health: 'none', meds: 'no', bp: false, region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, o);
const OPEN = [['no condition', PROF({})], ['diabetes, no medicine', PROF({ health: 'diabetes', meds: 'no' })], ['high BP', PROF({ health: 'bp' })], ['diabetes with BP, no medicine', PROF({ health: 'diabetes', meds: 'no', bp: true })], ['no body figures', PROF({ age: 0, cm: 0, kg: 0 })]];
const ON = [['diabetes, insulin', PROF({ health: 'diabetes', meds: 'yes' })], ['diabetes, not sure', PROF({ health: 'diabetes', meds: 'unsure' })]];

// ---------- the engine: the net itself ----------
for (const [t, why] of HELD) add('held: first-person insulin or sugar-tablet use (English, Hinglish, with food words around)', A.typedMeds(t) === true, `"${t}" (${why})`);
for (const [t, why] of NOT) add('not held: a negation, another person, "stopped", "insulin resistance", a bare or neutral word', A.typedMeds(t) === false, `"${t}" (${why})`);
add('the phrasing set is large enough', HELD.length > 600 && NOT.length > 900, `${HELD.length} held, ${NOT.length} not held`);

// ---------- the engine: plan() on every kind ----------
const ask = (kind, p, text) => { const b = { profile: p, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5, text }, file: {}, slot: 'lunch' };
  if (kind === 'tune') { b.meal = { title: 'Moong dal with jowar roti', subtitle: 'x', cuisine: 'x', prepMinutes: 20, minutes: 20, items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber', grams: 100, group: 'greens', contains: ['plain'] }], grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 448, protein: 16, carbs: 78, fats: 8, fiber: 12, why: [] }; delete b.ctx.text; }
  return safe(() => A.plan(kind, J(b)), { error: 'threw' }); };
const SAMPLE = HELD.filter((_, i) => i % 9 === 0), SAMPN = NOT.filter((_, i) => i % 11 === 0);
for (const [t] of SAMPLE) for (const [pn, p] of OPEN) { for (const kind of ['meals', 'rescue']) { const pl = ask(kind, p, t); add('engine: meals and Rescue answer meds_typed to typed insulin or sugar tablets when the set-up does not say so', pl.error === 'meds_typed' && Object.keys(pl).length === 1, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
  const lg = ask('log', p, t); add('engine: the log is not held (it counts what was eaten; S6 does not read it)', !lg.error && !!lg.prompt, `${pn}: "${t}": ${JSON.stringify(lg).slice(0, 70)}`); }
for (const [t] of SAMPLE) for (const [pn, p] of ON) for (const kind of ['meals', 'rescue']) { const pl = ask(kind, p, t); add('engine: no hold when the set-up already says insulin, sugar tablets or not sure', !pl.error && !!pl.prompt, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
for (const [t] of SAMPN) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('engine: a phrasing that is not held is planned', !pl.error && !!pl.prompt, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
add('engine: tune has no typed text and is not held', !ask('tune', OPEN[0][1], '').error, JSON.stringify(ask('tune', OPEN[0][1], '')).slice(0, 80));
add('engine: no text and a plain profile is planned (control)', !!ask('meals', OPEN[0][1], '').prompt && !!ask('rescue', OPEN[0][1], 'Veg thali').prompt, 'control');

// ---------- the order, in the engine ----------
const URG = ['chest pain, I take insulin', 'I take insulin and I feel shaky and sweaty', 'I am on glimepiride, trembling after lunch', 'I take insulin, my sugar is low', 'main insulin leti hoon, chakkar aa raha hai and pasina'], PREG = ['I am pregnant and I take insulin', 'I take insulin, kidney problem'];
for (const t of URG) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('order, engine: an urgent sign typed with insulin is referred, with the line to get help now, before the medicine hold', !!(pl.reply && pl.reply.status === 'refer' && pl.reply.urgent), `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 90)}`); }
for (const t of PREG) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('order, engine: typed pregnancy or a kidney condition with insulin is referred before the medicine hold', !!(pl.reply && pl.reply.status === 'refer'), `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 90)}`); }
for (const h of ['kidney', 'preg']) for (const kind of ['meals', 'rescue', 'log']) { const plain = ask(kind, PROF({ health: h }), 'I take insulin'), urg = ask(kind, PROF({ health: h }), 'I take insulin and I have chest pain');
  add('order, engine: a kidney or pregnancy profile with insulin typed is referred (no medicine hold)', !!(plain.reply && plain.reply.status === 'refer' && !plain.reply.urgent), `${kind}, ${h}: ${JSON.stringify(plain).slice(0, 80)}`);
  add('order, engine: a kidney or pregnancy profile with an urgent sign typed gets the line to get help now first (audit watch note)', !!(urg.reply && urg.reply.status === 'refer' && urg.reply.urgent === A.URGENTLINE), `${kind}, ${h}: ${JSON.stringify(urg).slice(0, 100)}`); }
{ const partial = PROF({ age: 45, cm: 0, kg: 0 });   // a partial body with a typed medicine: the refusals that were there first answer first (body_partial), as the audit's order says
  for (const kind of ['meals', 'rescue']) add('order, engine: the existing refusals come before this hold (a partial body is body_partial)', ask(kind, partial, 'I take insulin').error === 'body_partial', `${kind}: ${JSON.stringify(ask(kind, partial, 'I take insulin'))}`);
  for (const t of URG) for (const kind of ['meals', 'rescue', 'log']) add('order, engine: an urgent sign typed from a partial body is referred, not refused', !!(ask(kind, partial, t).reply || {}).urgent, `${kind}: "${t}"`); }

// ---------- the phone: the app's own api() with the live bodyHold and the live medicine hold ----------
const FNS = ['has', 'bodyLive', 'bodyNeed', 'bodyHold', 'api'];
const missing = FNS.filter(n => !grab(n)); add('the phone\'s api, bodyHold and bodyNeed are in src/v6/app.js', missing.length === 0, 'not found: ' + missing.join(', '));
const P0 = (/^var P=\{[^\n]*\};$/m.exec(appSrc) || [''])[0];
const mk = (pv) => { const make = safe(() => vm.runInContext('(function(PV){' + P0 + 'var UI={sheet:"",bodyOpened:false},opened=[],sent=[],window={},KEYCODE="",setTimeout=function(){return 0;},clearTimeout=function(){},fetch=function(path,o){sent.push({path:path,body:JSON.parse(o.body)});return {then:function(){return {then:function(){}};}};};function openSheet(k,at){opened.push(at);}\n' +
  'for(var k in PV)P[k]=PV[k];' + FNS.map(grab).join('\n') + '\nreturn {api:api,sent:sent,opened:opened};})', A), null); return make && make(pv); };
const call = (pv, p, path, text) => { const ph = mk(pv); let got = null; ph.api(path, J({ profile: p, ctx: { meal: 'lunch', time: '1:10 pm', text, photo: false, appetite: 5 }, file: {} }), (s, j) => { got = [s, j]; }); return { sent: ph.sent.length, got, opened: ph.opened.length, ph }; };
const WHOLE = { age: 47, cm: 158, kg: 72, conds: [], health: 'none', meds: 'no', done: true }, PART = { age: 45, cm: 0, kg: 0, conds: [], health: 'none', meds: 'no', done: true };
const PARTP = PROF({ age: 45, cm: 0, kg: 0 });
const PATHS = { meals: '/api/meals', rescue: '/api/rescue', log: '/api/log' };
for (const [t] of HELD.filter((_, i) => i % 6 === 0)) for (const [pn, p] of OPEN.slice(0, 4)) for (const kind of ['meals', 'rescue']) { const r = call(WHOLE, p, PATHS[kind], t);
  add('phone: api() holds plates and Rescue on typed insulin or sugar tablets: nothing is sent, the answer is meds_typed', r.sent === 0 && r.got && r.got[1].code === 'meds_typed', `${kind}, ${pn}: "${t}": sent ${r.sent}, ${JSON.stringify(r.got)}`);
  add('phone and engine agree: the phone holds if and only if the engine answers meds_typed', (r.got && r.got[1].code === 'meds_typed') === (ask(kind, p, t).error === 'meds_typed'), `${kind}, ${pn}: "${t}"`); }
for (const [t] of HELD.filter((_, i) => i % 9 === 0)) { const r = call(WHOLE, OPEN[0][1], PATHS.log, t); add('phone: the log with typed insulin is sent (not held)', r.sent === 1 && r.got === null, `"${t}": sent ${r.sent}`); }
for (const [t] of NOT.filter((_, i) => i % 7 === 0)) for (const kind of ['meals', 'rescue', 'log']) { const r = call(WHOLE, OPEN[0][1], PATHS[kind], t); add('phone: a phrasing that is not held is sent', r.sent === 1, `${kind}: "${t}": ${JSON.stringify(r.got)}`);
  add('phone and engine agree: not held by either', ask(kind, OPEN[0][1], t).error !== 'meds_typed', `${kind}: "${t}"`); }
for (const [t] of HELD.filter((_, i) => i % 13 === 0)) for (const [pn, p] of ON) { const r = call(WHOLE, p, PATHS.meals, t); add('phone: no hold when the set-up already says insulin, sugar tablets or not sure', r.sent === 1, `${pn}: "${t}"`); }
// the order on the phone: a typed referral first, then the medicine hold, then the body hold
for (const t of URG) for (const kind of ['meals', 'rescue', 'log']) for (const [label, pv, pp] of [['a whole body', WHOLE, OPEN[0][1]], ['a partial body held by bodyHold', PART, PARTP]]) { const r = call(pv, pp, PATHS[kind], t);
  add('order, phone: an urgent sign typed with insulin (or from a partial body) is answered as a referral with no request, ahead of both holds', r.sent === 0 && r.got && r.got[0] === 200 && r.got[1].status === 'refer' && !!r.got[1].urgent, `${kind}, ${label}: "${t}": sent ${r.sent}, ${JSON.stringify(r.got).slice(0, 90)}`); }
for (const t of PREG) for (const kind of ['meals', 'rescue', 'log']) { const r = call(PART, PARTP, PATHS[kind], t); add('order, phone: typed pregnancy or kidney text with a partial body is answered as a referral with no request', r.sent === 0 && r.got && r.got[1].status === 'refer', `${kind}: "${t}": ${JSON.stringify(r.got).slice(0, 80)}`); }
for (const kind of ['meals', 'rescue']) { const r = call(PART, PARTP, PATHS[kind], 'I take insulin'); add('order, phone: typed insulin from a partial body: the medicine hold answers first, nothing is sent, the step does not open', r.sent === 0 && r.got && r.got[1].code === 'meds_typed' && r.opened === 0, `${kind}: ${JSON.stringify(r.got)}, opened ${r.opened}`);
  const f = call(PART, PARTP, PATHS[kind], 'something light'); add('order, phone: food text from a partial body: the body hold answers, nothing is sent', f.sent === 0 && f.got && f.got[1].code === 'body_partial', `${kind}: ${JSON.stringify(f.got)}`); }
{ const r = call(PART, PARTP, PATHS.log, 'dal and roti'); add('order, phone: the log from a partial body goes without the three figures', r.sent === 1 && r.ph.sent[0].body.profile.age === 0 && r.ph.sent[0].body.profile.cm === 0 && r.ph.sent[0].body.profile.kg === 0, JSON.stringify(r.ph.sent[0] && r.ph.sent[0].body.profile)); }

{ const r = call(PART, PARTP, PATHS.log, 'I take insulin and had dal and roti for lunch'); add('order, phone: a partial body with typed insulin in the log: the log still goes, without the three figures, and the engine reads it', r.sent === 1 && r.ph.sent[0].body.profile.age === 0 && !A.plan('log', J(r.ph.sent[0].body)).error, JSON.stringify(r.got)); }

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 6).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       ... ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(`typed medicine words: ${HELD.length} held phrasings, ${NOT.length} not held`);
console.log(fail ? `${fail} counter-example(s): the typed medicine net does not hold (${pageFile})` : `typed medicine words: the net holds, in the engine and on the phone, in the right order (${pageFile})`);
process.exit(fail ? 1 : 0);
