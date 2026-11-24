// Two tabs of the page on one store (fix-r21 round 9; safety audit of a109dd1, B1, m2-m5; owner, 24 Nov: "Done saves that screen (Recommended)", "Hide them
// (Recommended)"). The whole built page runs twice on one localStorage (test/safety/minidom.js: the page's own scripts, nothing replaced), and every cell reads what
// each tab draws and what it sends. /api is answered by the page's own np-core plan() and check() on canned honest replies.
//   The enumerator: every sequence of up to four actions over the two tabs (a My food tick, Done, closing the sheet, a Your day tap, a typed insulin ask,
//   "Remove my data", a reload, a back/forward restore), once with the storage event delivered to the other tab and once with it withheld. After each step:
//     (a) the stored My food is what the sheet showed when Done (or a close after a change) was tapped, and no other write loses another tab's change;
//     (b) each tab's next request and drawn plate agree with the store (with the event withheld, after one redraw-only tap);
//     (c) the hold ends only at its two ends (a My food save whose saved set-up says insulin, sugar tablets or not sure, and "Remove my data");
//     (d) a stored kidney condition or pregnancy is referred on both tabs.
//   The auditor's flows as cells: q8/q8b (a tick in an open sheet against a change in the other tab: Kidney, pregnancy, Leave out nuts, the set-up under the hold),
//   q7 (a live second tab redraws with no tap in it), q2 (the event withheld: the next redraw and request read the store), q3 (a removal and a new set-up while a tab
//   is away), q4 (a reopened meal is not logged again), q6 (a hold in the same tab keeps a referral already drawn), the tune under the hold and "Skipped it" under the hold.
// usage: node test/safety/two-tabs.js [hosted/v6/index.html]   (exit 1 on any counter-example; TT_DEPTH=n to change the depth, TT_QUICK=1 for depth 3)
const fs = require('fs'), vm = require('vm'), path = require('path');
const M = require('./minidom.js');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
const HTML = fs.readFileSync(pageFile, 'utf8'), SCRIPTS = M.compile(HTML);
const A = {}; vm.createContext(A); vm.runInContext(HTML.split('<script id="np-core">')[1].split('</script>')[0], A);
const J = (x) => JSON.parse(JSON.stringify(x));
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok && r.bad.length < 400) r.bad.push(ex); else if (!ok) r.bad.push(''); };
const immediate = () => new Promise(r => setImmediate(r));

const DAL = { title: 'Moong dal and bajra rotla', prepMinutes: 20, items: [{ food: 'Moong dal', grams: 150, group: 'protein', contains: ['plain'] }, { food: 'Bajra rotla', grams: 60, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: ['plain'] }], contains: ['grain'], grain: { food: 'Bajra rotla', made_of: 'bajra', grams: 60 }, kcal: 330, protein: 16, carbs: 45, fats: 9, fiber: 8, swaps: { protein: [], base: [] }, alchemy: {} };
const PANEER = Object.assign(J(DAL), { title: 'Paneer bhurji and bajra rotla', contains: ['grain', 'dairy'] }); PANEER.items[0] = { food: 'Paneer bhurji', grams: 150, group: 'protein', contains: ['dairy'] };
const RESC = { status: 'ok', refer_reason: 'none', dish: { name: 'Chole bhature', kcal: 650, protein: 18, carbs: 80, fats: 28, fiber: 9, contains: ['wheat'] }, hacks: [{ kind: 'portion', text: 'Have one bhatura, not two', deltaKcal: -250, deltaProtein: -4, deltaCarbs: -30, deltaFats: -12, deltaFiber: -1 }] };
const PROFILE = { goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'diabetes', conds: ['diabetes'], region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const T0 = new Date('2026-11-23T13:10:00').getTime();
const REF = 'Your coach and doctor should plan this with you.', BLOCK = 'Plan your meals with your coach and doctor', URG = A.URGENTLINE;
const MEDSWARN = /a skipped meal can drop your sugar/;

// one store and its tabs. o: { deliver, profile, meds, ev, mode }
function world(o) {
  o = o || {}; const W = { mode: Object.assign({}, o.mode || {}), deliver: o.deliver !== false, clock: { t: T0 }, log: [] };
  const answer = (rec) => { const pl = A.plan(rec.kind, J(rec.body)); W.log.push({ tab: rec.tab, kind: rec.kind, profile: rec.body.profile });
    if (pl.error) return { status: 400, body: { code: pl.error } }; if (pl.reply) return { status: 200, body: pl.reply };
    if (W.mode[rec.kind] === 'fail') return { status: 200, body: { status: 'fail' } };
    if (rec.kind === 'meals') return { status: 200, body: pl.check({ status: 'ok', refer_reason: 'none', meals: [J(W.mode.meals === 'paneer' ? PANEER : DAL)] }) };
    if (rec.kind === 'rescue') return { status: 200, body: pl.check(J(RESC)) };
    if (rec.kind === 'tune') return { status: 200, body: pl.check({ swaps: { protein: [], base: [] }, alchemy: {} }) };
    if (rec.kind === 'log') return { status: 200, body: pl.check({ status: 'ok', refer_reason: 'none', items: [{ food: 'Dal', grams: 150 }], kcal: 300, protein: 12, carbs: 40, fats: 10, fiber: 5, assumed: '' }) };
    return { status: 200, body: { status: 'fail' } }; };
  const seed = { np6: JSON.stringify({ p: Object.assign({}, PROFILE, o.profile || {}), c: {}, ev: o.ev || [], k: 'x' }) }; if (o.meds) seed.np6meds = o.meds;
  W.shared = { ls: seed, pending: [], emit(from, key, oldValue, newValue) { if (W.deliver) W.shared.pending.push({ from, key, oldValue, newValue }); } };
  W.open = (name, session) => { const T = M.openTab({ html: HTML, scripts: SCRIPTS, shared: W.shared, clock: W.clock, name, session: session || {}, answer: (rec) => { rec.tab = name; return answer(rec); } });
    // a fixed random source, so a sequence replays to the same state
    let sd = 7 + name.charCodeAt(0); T.run('(function(){var r=' + sd + ';Math.random=function(){r=(r*16807)%2147483647;return r/2147483647;};})()'); return T; };
  W.tabs = {}; W.reloads = { A: 0, B: 0 };
  W.reloadTab = (n) => { const old = W.tabs[n]; W.tabs[n] = W.open(n, old ? old.session : {}); W.reloads[n]++; };
  W.settle = async () => { for (let i = 0; i < 60; i++) { let busy = false; await immediate();
      for (const n of Object.keys(W.tabs)) { const T = W.tabs[n]; if (T.TQ.some(x => x.ms < 5000)) { busy = true; T.flush(1); } }
      await immediate();
      if (W.shared.pending.length) { busy = true; const evs = W.shared.pending.splice(0); for (const e of evs) for (const n of Object.keys(W.tabs)) { const T = W.tabs[n]; if (T !== e.from && !T.reload) T.storage({ key: e.key, oldValue: e.oldValue, newValue: e.newValue, storageArea: null }); } }
      for (const n of Object.keys(W.tabs)) if (W.tabs[n].reload) { busy = true; W.reloadTab(n); }
      if (!busy) break; } };
  W.start = async (names) => { for (const n of names || ['A', 'B']) { W.tabs[n] = W.open(n); await W.settle(); } return W; };
  W.np6 = () => { try { return JSON.parse(W.shared.ls.np6 || 'null'); } catch (e) { return null; } };
  W.held = () => W.shared.ls.np6meds != null;
  return W;
}
// what a sheet shows: every ticked control and every body figure in it
const sheetShown = (T) => { const sh = T.$('sheet'); if (!sh || sh.hidden) return null; const out = [];
  const f = (n) => { if (n.nodeType !== 1) return; if (n.id && (n.getAttribute('aria-checked') === 'true' || n.getAttribute('aria-pressed') === 'true')) out.push(n.id); if (n.id && /^body-(age|cm|kg)$/.test(n.id)) out.push(n.id + '=' + n.value); n.childNodes.forEach(f); };
  f(sh); return out.sort().join(','); };
const sheetOpen = (T) => { const sh = T.$('sheet'); return !!sh && !sh.hidden && !!T.$('sheet-done') && T.text('sheet-title') === 'My food'; };
const isDone = (T) => { try { return T.run('!!P.done'); } catch (e) { return false; } };
const checked = (T, id) => { const n = T.$(id); return !!n && (n.getAttribute('aria-checked') === 'true' || n.getAttribute('aria-pressed') === 'true'); };
// a fresh page on a copy of the store: what the store says, as the page reads it
const REFS = new Map();
async function refOf(W) { const key = JSON.stringify(W.shared.ls); if (REFS.has(key)) return REFS.get(key);
  const R = world({ deliver: false }); R.shared.ls = JSON.parse(key); await R.start(['R']); const T = R.tabs.R;
  const r = { done: isDone(T) }; if (r.done) { r.held = T.run('medsHeld()'); r.ok = T.run('medsSetupOK()'); r.prof = T.run('JSON.stringify(profileOut())'); r.blocked = T.run('blocked()'); T.click('myfood'); await R.settle(); r.shown = sheetShown(T); }
  REFS.set(key, r); return r; }
const sameProf = (a, b) => { const k = ['goal', 'focus', 'meds', 'diet', 'health', 'bp', 'region', 'sex', 'age', 'cm', 'kg', 'act']; const pa = typeof a === 'string' ? JSON.parse(a) : a, pb = typeof b === 'string' ? JSON.parse(b) : b;
  return !!pa && !!pb && k.every(x => JSON.stringify(pa[x]) === JSON.stringify(pb[x])) && JSON.stringify((pa.leave || []).slice().sort()) === JSON.stringify((pb.leave || []).slice().sort()); };

// ---------- the actions ----------
const TICK = { A: (T) => checked(T, 'meds-yes') ? 'meds-no' : 'meds-yes', B: () => 'health-kidney' };
const ACTS = {
  async tick(W, n) { const T = W.tabs[n]; if (!isDone(T)) return false; if (!sheetOpen(T)) { if (!T.shown('myfood') || !T.click('myfood')) return false; await W.settle(); }
    const id = TICK[n](T); if (!T.$(id)) return false; T.click(id); await W.settle(); return {}; },
  async done(W, n) { const T = W.tabs[n]; if (!sheetOpen(T)) return false; const shown = sheetShown(T); T.click('sheet-done'); await W.settle(); return { shown, save: true }; },
  async close(W, n) { const T = W.tabs[n]; if (!sheetOpen(T)) return false; const shown = sheetShown(T); T.key('Escape'); await W.settle(); return { shown, save: 'if-changed' }; },
  async day(W, n) { const T = W.tabs[n]; if (!isDone(T) || T.shown('sheet') || !T.$('dial-mood')) return false; T.click('dial-mood'); await W.settle();
    const opts = T.$('v-plate').querySelectorAll('[role="radio"]').filter(x => /^mood-/.test(x.id) && x.getAttribute('aria-checked') !== 'true'); if (!opts.length) return false;
    const v = opts[0].id.slice(5); opts[0].click(); await W.settle(); return { mood: v }; },
  async ask(W, n) { const T = W.tabs[n]; if (!isDone(T) || T.shown('sheet') || !T.$('askin')) return false; T.type('askin', 'I take insulin, what lunch?'); T.submit('askin'); await W.settle(); return { ask: true }; },
  async remove(W, n) { const T = W.tabs[n]; if (!isDone(T)) return false; if (!sheetOpen(T)) { if (!T.click('myfood')) return false; await W.settle(); }
    if (!T.click('wipe')) return false; await W.settle(); if (!W.tabs[n].click('wipe-yes')) return false; await W.settle(); return { remove: true }; },
  async reload(W, n) { W.reloadTab(n); await W.settle(); return {}; },
  async back(W, n) { W.tabs[n].back(); await W.settle(); return {}; } };
const NAMES = Object.keys(ACTS), ALL = [].concat(...['A', 'B'].map(n => NAMES.map(a => [a, n])));

const tabSig = (T) => { try { return T.run('JSON.stringify([P,C,EV,STORE,APP,UI.sheet,UI.open,UI.err,typeof STAMP!=="undefined"?STAMP:0,typeof RAW0!=="undefined"?RAW0:0,typeof MEM0!=="undefined"?MEM0:0,typeof MEDSFACT!=="undefined"?MEDSFACT:0])') + sheetShown(T); } catch (e) { return 'x'; } };

// the checks after one step
async function check(W, step, out, before, M, seq) {
  const s = W.np6() || {}, label = seq.map(x => x[1] + ':' + x[0]).join(' > ') + (W.deliver ? ' (event delivered)' : ' (event withheld)');
  const ref = await refOf(W);
  // (a) Done saves that screen
  if (out.shown != null && ref.done) { const lost = W.reloads[step[1]] > before.reloads[step[1]];
    const wrote = JSON.stringify(s.p) !== JSON.stringify(before.p);
    if (!lost && (out.save === true || wrote)) add('(a) the stored My food is what the sheet showed when it was saved', ref.shown === out.shown, `${label}: the sheet showed [${out.shown}], the store holds [${ref.shown}]`); }
  // (a) no write loses another tab's change: the Your day choice is the last one tapped; no logged event goes, but by a removal
  const mood = (s.c && s.c.mood) || 'best'; add('(a) a write keeps the other tab\'s Your day choice', mood === M.mood, `${label}: stored mood ${mood}, last tapped ${M.mood}`);
  if (!out.remove) { const now = new Set((s.ev || []).map(e => JSON.stringify(e))), gone = (before.ev || []).filter(e => !now.has(JSON.stringify(e)));
    add('(a) a write keeps the other tab\'s logged events', gone.length === 0, `${label}: lost ${JSON.stringify(gone).slice(0, 160)}`); }
  // (c) the hold ends only at its two ends, and comes up only from a typed ask
  const heldNow = W.held();
  if (before.held && !heldNow) add('(c) the hold ends only by a My food save that says insulin, sugar tablets or not sure, or by "Remove my data"', !!out.remove || (out.shown != null && ref.done && ref.ok === true), `${label}: the hold went; saved set-up OK ${ref.ok}`);
  if (!before.held && heldNow) add('(c) the hold comes up only from a typed medicine', !!out.ask, `${label}`);
  // (b) and (d): each tab draws and sends what the store says
  if (!ref.done) return;
  for (const n of Object.keys(W.tabs)) { let T = W.tabs[n]; if (!isDone(T) || T.shown('sheet')) continue;
    if (!W.deliver) { T.click('tab-plate'); await W.settle(); T = W.tabs[n]; if (!isDone(T) || T.shown('sheet')) continue; }   // one redraw-only tap
    const t = T.text('v-plate'), card = T.has('v-plate', 'plate-card'), hold = T.has('v-plate', 'meds-hold'), blk = t.indexOf(BLOCK) >= 0;
    if (ref.blocked) add('(d) a stored kidney condition or pregnancy is referred on both tabs', blk && !card, `${label}: tab ${n} draws ${t.slice(0, 120)}`);
    else if (ref.held) add('(b) under the stored hold each tab draws the hold card and no plate', hold && !card, `${label}: tab ${n}: hold ${hold}, plate ${card}: ${t.slice(0, 100)}`);
    else add('(b) each tab draws what the store says (no hold card, no referral, when the store has neither)', !hold && !blk, `${label}: tab ${n}: hold ${hold}, referral ${blk}: ${t.slice(0, 100)}`);
    const n0 = T.sent.length; try { T.run('UI.busy="";makePlates("")'); } catch (e) {} await W.settle(); T = W.tabs[n];
    const sent = T.sent.slice(n0), meals = sent.filter(x => x.kind === 'meals');
    if (ref.blocked || ref.held) add('(b) under a referral or the stored hold the next request sends nothing (every endpoint)', sent.length === 0, `${label}: tab ${n} sent ${sent.map(x => x.kind)}`);
    else add('(b) each tab\'s next request carries the stored answers', meals.length === 1 && sameProf(meals[0].body.profile, ref.prof), `${label}: tab ${n} sent ${meals.length} plate requests, ${meals[0] ? JSON.stringify(meals[0].body.profile).slice(0, 140) : ''} against ${String(ref.prof).slice(0, 140)}`); }
}

async function enumerate(deliver, depth) {
  const seen = new Set(); let frontier = [[]], nodes = 0;
  for (let d = 1; d <= depth; d++) { const next = [];
    for (const seq of frontier) for (const a of ALL) { const sq = seq.concat([a]);
      const W = world({ deliver }); await W.start(); const M = { mood: 'best' }; let ok = true, before = null, out = null;
      for (let i = 0; i < sq.length; i++) { const s0 = W.np6() || {}; before = { p: s0.p, ev: s0.ev, held: W.held(), reloads: Object.assign({}, W.reloads) };
        out = await ACTS[sq[i][0]](W, sq[i][1]); if (!out) { ok = false; break; } if (out.mood && W.reloads[sq[i][1]] === before.reloads[sq[i][1]]) M.mood = out.mood; if (out.remove) M.mood = 'best'; }   // a tap in a tab that reloads (another tab removed the data) writes nothing
      if (!ok) continue;
      const sig = JSON.stringify([W.shared.ls, tabSig(W.tabs.A), tabSig(W.tabs.B), M]); if (seen.has(sig)) continue; seen.add(sig); nodes++;
      await check(W, sq[sq.length - 1], out, before, M, sq); next.push(sq); }
    frontier = next; }
  return nodes; }

(async () => {
  const t0 = Date.now(), depth = +process.env.TT_DEPTH || (process.env.TT_QUICK ? 3 : 4);
  // ---------- the auditor's flows (q8, q8b): a tick left in an open My food sheet in tab B, a change in tab A, then Done in B ----------
  for (const deliver of [true, false]) for (const [what, bTick, aTick, between, prof, meds] of [
    ['Kidney', 'health-kidney', 'health-bp', true], ['Pregnant or breastfeeding', 'health-preg', 'health-bp', true], ['Leave out nuts', 'leave-nut', 'leave-dairy', true],
    ['Kidney, no tap between', 'health-kidney', 'health-bp', false], ['Leave out nuts, no tap between', 'leave-nut', 'leave-dairy', false],
    ['Leave out nuts in B against the medicine answer Yes in A (two different answers)', 'leave-nut', 'meds-yes', false],
    ['the set-up under the hold (no condition; A answers diabetes and Yes)', 'health-bp', null, false, { health: 'none', conds: [], meds: '' }, '{"at":1}']]) {
    const W = await world({ deliver, profile: prof, meds }).start(), Aa = () => W.tabs.A, Bb = () => W.tabs.B;
    Bb().click('myfood'); await W.settle(); Bb().click(bTick); await W.settle();
    if (between) await ACTS.day(W, 'A');
    if (aTick) { Aa().click('myfood'); await W.settle(); Aa().click(aTick); await W.settle(); Aa().click('sheet-done'); await W.settle(); }
    else { Aa().click('add-meds'); await W.settle(); if (!Aa().$('meds-yes')) { Aa().click('health-diabetes'); await W.settle(); } Aa().click('meds-yes'); await W.settle(); Aa().click('sheet-done'); await W.settle(); }
    const shownB = sheetShown(Bb()), tickShows = checked(Bb(), bTick); W.log.length = 0; Bb().click('sheet-done'); await W.settle(); const ref = await refOf(W);
    const lbl = `${what}${deliver ? '' : ', event withheld'}`;
    add('q8: the tick tab B shows when Done is tapped is the tick saved ("Done saves that screen")', tickShows && ref.shown === shownB, `${lbl}: B showed its tick ${tickShows}, [${shownB}]; stored [${ref.shown}]`);
    for (const n of ['A', 'B']) { let T = W.tabs[n]; T.click('tab-plate'); await W.settle(); T = W.tabs[n]; const t = T.text('v-plate');
      if (ref.blocked) add('q8: a kidney condition or pregnancy saved in tab B is referred on both tabs, and nothing is planned', t.indexOf(BLOCK) >= 0 && !T.has('v-plate', 'plate-card') && W.log.filter(x => x.tab === n && x.kind !== 'log').length === 0, `${lbl}: tab ${n}: ${t.slice(0, 120)}; sent ${JSON.stringify(W.log.filter(x => x.tab === n).map(x => x.kind))}`);
      else { const n0 = T.sent.length; T.run('UI.busy="";makePlates("")'); await W.settle(); const m = W.tabs[n].sent.slice(n0).filter(x => x.kind === 'meals');
        add('q8: both tabs then plan with the answers tab B saved', m.length === 1 && sameProf(m[0].body.profile, ref.prof) && !W.tabs[n].has('v-plate', 'meds-hold') === !ref.held, `${lbl}: tab ${n}: ${m.length} requests ${m[0] ? JSON.stringify(m[0].body.profile).slice(0, 160) : ''}; stored ${ref.prof}`); } }
    if (meds) add('q8, under the hold: A\'s Done (diabetes and Yes) ends the hold; B\'s Done then saves what B showed, and neither tab holds a set-up it did not show', !W.held() && ref.shown === shownB, `${lbl}: hold stored ${W.held()}, stored [${ref.shown}], B showed [${shownB}]`); }
  // ---------- q7 (audit m2): a live second tab redraws with no tap in it ----------
  { const W = await world({ deliver: true, mode: { meals: 'paneer' } }).start(); const before = /Paneer/.test(W.tabs.B.text('v-plate'));
    W.tabs.A.click('myfood'); await W.settle(); W.tabs.A.click('leave-dairy'); await W.settle(); W.tabs.A.click('sheet-done'); await W.settle();
    add('q7 (listener): with no tap in tab B, a dairy left out in tab A takes the paneer plate off tab B at once', before && !/Paneer/.test(W.tabs.B.text('v-plate')), `before ${before}; B now: ${W.tabs.B.text('v-plate').slice(0, 160)}`);
    W.tabs.A.type('askin', 'I take insulin, what lunch?'); W.tabs.A.submit('askin'); await W.settle();
    add('q7 (listener): with no tap in tab B, a hold raised in tab A shows tab B the hold card and no plate at once', W.tabs.B.has('v-plate', 'meds-hold') && !W.tabs.B.has('v-plate', 'plate-card'), W.tabs.B.text('v-plate').slice(0, 160)); }
  // ---------- q2 (audit m2): the event withheld: the next redraw and the next request read the store ----------
  { const W = await world({ deliver: false, mode: { meals: 'paneer' } }).start();
    W.tabs.A.click('myfood'); await W.settle(); W.tabs.A.click('leave-dairy'); await W.settle(); W.tabs.A.click('sheet-done'); await W.settle();
    W.tabs.B.click('tab-plate'); await W.settle();
    add('q2 (refresh): with the event withheld, tab B\'s next redraw reads the store: no paneer plate for a dairy-free client', !/Paneer/.test(W.tabs.B.text('v-plate')), W.tabs.B.text('v-plate').slice(0, 160));
    const n0 = W.tabs.B.sent.length; W.tabs.B.run('UI.busy="";makePlates("")'); await W.settle(); const m = W.tabs.B.sent.slice(n0).filter(x => x.kind === 'meals');
    add('q2 (revision): with the event withheld, tab B\'s next plate request leaves out dairy', m.length === 1 && JSON.stringify(m[0].body.profile.leave) === '["dairy"]', JSON.stringify(m.map(x => x.body.profile.leave)));
    W.tabs.A.type('askin', 'I take insulin, what lunch?'); W.tabs.A.submit('askin'); await W.settle(); W.tabs.B.click('tab-plate'); await W.settle();
    add('q2: with the event withheld, a hold raised in tab A is drawn by tab B at its next redraw', W.tabs.B.has('v-plate', 'meds-hold') && !W.tabs.B.has('v-plate', 'plate-card'), W.tabs.B.text('v-plate').slice(0, 160)); }
  // ---------- q3 (audit m3): "Remove my data", then a new set-up, while tab B is away; B comes back with Back ----------
  for (const [deliver, sheet] of [[false, false], [true, false], [false, true]]) { const OLD = { t: T0 - 3 * 864e5, type: 'had', meal: 'lunch', title: 'OLD MEAL FROM BEFORE REMOVAL', kcal: 330, protein: 16, carbs: 45, fats: 9, fiber: 8 };
    const W = await world({ deliver: false, ev: [OLD] }).start(); W.deliver = deliver;
    if (sheet) { W.tabs.B.click('myfood'); await W.settle(); W.tabs.B.click('leave-nut'); await W.settle(); }   // B left My food open, with a tick, before going away
    await ACTS.remove(W, 'A');
    // a new set-up in tab A, written as set-up's last step writes it
    W.tabs.A.run('Object.assign(P,{goal:"hold",focus:"none",meds:"",diet:"vegan",health:"bp",conds:["bp"],region:"n",leave:[],sex:"m",age:50,cm:170,kg:80,act:"low",done:true});typeof commit==="function"?commit(null,{whole:true}):save();'); await W.settle();
    W.deliver = true; if (sheet) { W.tabs.B.click('sheet-done'); await W.settle(); } else { W.tabs.B.back(); await W.settle(); await ACTS.day(W, 'B'); } const s = W.np6() || {};
    add('q3 (epoch): after "Remove my data" and a new set-up, a tab coming back writes nothing of the removed data back', !(s.ev || []).some(e => e.title === OLD.title) && s.p && s.p.diet === 'vegan' && JSON.stringify(s.p.leave) === '[]', `${sheet ? 'B taps Done in the My food sheet it left open' : deliver ? 'event delivered during the removal' : 'event withheld'}: ${JSON.stringify(s).slice(0, 220)}`); }
  // ---------- q4 (audit m4): a meal reopened in tab A is not logged again by tab B ----------
  { const W = await world({ deliver: false }).start(); W.tabs.A.click('have'); await W.settle(); const had = (W.np6().ev || []).filter(e => e.type === 'had').length;
    W.tabs.A.click('slot-change'); await W.settle(); await ACTS.day(W, 'B'); const s = W.np6();
    add('q4: a meal reopened in one tab is not logged again by the other tab\'s next write', had === 1 && !(s.ev || []).some(e => e.type === 'had' && e.meal === 'lunch'), `had ${had}; events now ${JSON.stringify((s.ev || []).map(e => e.type + ':' + e.meal))}`); }
  // ---------- q6 (audit m5): a hold coming up in the same tab keeps a referral already drawn ----------
  { const W = await world({}).start(['A']), T = () => W.tabs.A;
    T().click('tab-rescue'); await W.settle(); T().type('rin', 'chest pain since lunch, dal rice'); T().submit('rin'); await W.settle();
    T().click('tab-plate'); await W.settle(); T().type('askin', 'I take insulin, what lunch?'); T().submit('askin'); await W.settle(); T().click('tab-rescue'); await W.settle();
    const r = T().text('v-rescue'); add('q6: a Rescue referral drawn before a hold raised on Plate is still drawn on Rescue, the line to get help now first, ahead of the hold note', r.indexOf(URG) >= 0 && r.indexOf(REF) > r.indexOf(URG) && T().has('v-rescue', 'meds-hold-note') && r.indexOf(URG) < r.indexOf('You mentioned insulin'), r.slice(0, 220)); }
  { const W = await world({}).start(['A']), T = () => W.tabs.A;
    T().type('askin', 'feeling faint and sweaty, what lunch'); T().submit('askin'); await W.settle();
    T().click('tab-rescue'); await W.settle(); T().type('rin', 'dal chawal, I take metformin'); T().submit('rin'); await W.settle(); T().click('tab-plate'); await W.settle();
    const p = T().text('v-plate'); add('q6: a Plate referral drawn before a hold raised on Rescue is still drawn on Plate, ahead of the hold card', p.indexOf(URG) >= 0 && T().has('v-plate', 'meds-hold') && p.indexOf(URG) < p.indexOf('You mentioned insulin'), p.slice(0, 220)); }
  // ---------- "Hide them (Recommended)" (owner, 24 Nov): under the hold the one-ask plate has no one-tap changes or swaps and nothing is sent for them ----------
  for (const tuneMode of [null, 'fail']) { const W = await world({ meds: '{"at":1}', mode: tuneMode ? { tune: tuneMode } : {} }).start(['A']), T = () => W.tabs.A;
    const n0 = T().sent.length; T().type('askin', 'something light with dal'); T().submit('askin'); await W.settle();
    const sent = T().sent.slice(n0).map(x => x.kind), v = T().$('v-plate'), ids = v ? v.querySelectorAll('button').map(b => b.id) : [];
    const tuneUI = ids.filter(x => /^alc-|^tune-retry$|^adjust$|^sw-/.test(x)).concat(T().has('v-plate', 'alc-off') ? ['alc-off'] : []);
    add('Hide them: the one ask under the hold sends one plate request and nothing else (every endpoint counted), and draws no one-tap change, swap or Try again', sent.length === 1 && sent[0] === 'meals' && T().has('v-plate', 'plate-card') && T().has('v-plate', 'meds-hold') && tuneUI.length === 0 && !/One-tap changes/.test(T().text('v-plate')),
      `tune ${tuneMode || 'ok'}: sent ${JSON.stringify(sent)}, drawn ${JSON.stringify(tuneUI)}, plate ${T().has('v-plate', 'plate-card')}`);
    const n1 = T().sent.length; T().run('typeof tune==="function"&&tune(curKey(),0)'); await W.settle();
    add('Hide them: under the hold a tune asked for directly sends nothing', T().sent.length === n1, JSON.stringify(T().sent.slice(n1).map(x => x.kind))); }
  // ---------- "Skipped it" under the hold (safety audit of a109dd1, O2, under "Warn them"): the low-sugar warning shows ----------
  for (const [what, meds, want] of [['the hold stored, set-up medicines No', '{"at":1}', true], ['control: no hold, set-up medicines No', null, false]]) {
    const W = await world({ meds }).start(['A']), T = () => W.tabs.A; T().click('log-skip'); await W.settle();
    const said = T().text('said'), card = T().text('v-plate');
    add('Skipped it: the low-sugar warning shows in the spoken line and on the card while the hold is stored, and not without it', MEDSWARN.test(said) === want && MEDSWARN.test(card) === want, `${what}: said "${said.slice(0, 80)}", card ${MEDSWARN.test(card)}`);
    const off = T().run('JSON.stringify((function(){var r=snackRoom;snackRoom=function(){return 40;};C.meal="lunch";refresh();var o=nextOffer();snackRoom=r;return o;})())');
    add('the snack safeguard: a client who skipped a meal keeps the snack offered while the hold is stored, and not without it', off === (want ? '{"meal":"snack","low":false}' : '{"meal":"dinner","low":true}'), `${what}: ${off}`); }
  // ---------- the enumerator ----------
  const counts = {}; for (const deliver of [true, false]) counts[deliver ? 'delivered' : 'withheld'] = await enumerate(deliver, depth);
  let bad = 0; for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.filter(Boolean).slice(0, 4).forEach(x => console.log('       ' + x)); bad += r.bad.length; }
  console.log(`two tabs on one store: ${counts.delivered} states with the event delivered, ${counts.withheld} withheld, depth ${depth}, ${Math.round((Date.now() - t0) / 1000)} s (${path.relative(ROOT, pageFile)})`);
  if (bad) { console.log(`${bad} counter-example(s)`); process.exit(1); }
})().catch(e => { console.log('two-tabs: ' + e.stack); process.exit(1); });
