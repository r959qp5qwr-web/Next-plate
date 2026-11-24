// The typed-medicine hold in Chromium (fix-r21 round 8; safety audit of 3ee7b41, B1, B2, B3): the auditor's flows (audit24 p1/p4, p3a, p3b, p6b, p6c) as cells that
// read what the page draws and what it sends. The page is served at http://np.test/ and /api is answered by the page's own np-core plan() and check() on canned
// honest model replies (no live model). Every cell drives the page as a client does: typing into the ask box or the dish box, tapping, a second tab.
//   B1 (S7): a referral typed under the stored hold is drawn ahead of the hold card on Plate and Rescue, with the line to get help now on an urgent sign; the hold stays.
//   B2 (S6): words the page put in a box (a failed example ask, a failed chip) are not typed: sending the box under the hold sends nothing and the hold stays.
//   B3 (S1, S6): a second tab opened earlier does not write its old answers over a My food change made in the first; the next plan reads the change.
//   O2 (owner, 23 Nov, "One ask only (Recommended)"): a typed ask with no medicine name is answered once and the hold stays stored.
//   "Warn them (Recommended)" (owner, 23 Nov): under the stored hold a low-sugar sign is referred with the line to get help now.
// usage: node test/safety/hold-browser.js [hosted/v6/index.min.html]   (exit 1 on any counter-example)
const { chromium } = require('playwright');
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.min.html');
const HTML = fs.readFileSync(pageFile, 'utf8'), A = {}; vm.createContext(A); vm.runInContext(HTML.split('<script id="np-core">')[1].split('</script>')[0], A);
const J = (x) => JSON.parse(JSON.stringify(x));
const MEALS = { status: 'ok', refer_reason: 'none', meals: [{ title: 'Moong dal and bajra rotla', prepMinutes: 20, items: [{ food: 'Moong dal', grams: 150, group: 'protein', contains: ['plain'] }, { food: 'Bajra rotla', grams: 60, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: ['plain'] }], contains: ['grain'], grain: { food: 'Bajra rotla', made_of: 'bajra', grams: 60 }, kcal: 330, protein: 16, carbs: 45, fats: 9, fiber: 8, swaps: { protein: [], base: [] }, alchemy: {} }] };
const RESC = { status: 'ok', refer_reason: 'none', dish: { name: 'Chole bhature', kcal: 650, protein: 18, carbs: 80, fats: 28, fiber: 9, contains: ['wheat'] }, hacks: [{ kind: 'portion', text: 'Have one bhatura, not two', deltaKcal: -250, deltaProtein: -4, deltaCarbs: -30, deltaFats: -12, deltaFiber: -1 }] };
const PROFILE = { goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'diabetes', conds: ['diabetes'], region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const REF = 'Your coach and doctor should plan this with you.', URG = A.URGENTLINE, HOLD = 'You mentioned insulin or sugar tablets. Add it in My food so your plates keep the safe size.';
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
const w = (ms) => new Promise(r => setTimeout(r, ms));

async function open(b, o) { o = o || {}; const ctx = await b.newContext(); const H = { ctx, LOG: [], mode: {} };
  const seed = JSON.stringify({ p: Object.assign({}, PROFILE, o.profile || {}), c: {}, ev: [], k: 'x' });
  // the store is seeded once, after the first load, and never again (a removal must stay removed)
  await ctx.route('http://np.test/**', async r => { const u = new URL(r.request().url()); if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html', body: HTML });
    const kind = u.pathname.slice(5), body = JSON.parse(r.request().postData() || '{}'), pl = A.plan(kind, body);
    let out = pl.error ? { code: pl.error } : pl.reply ? pl.reply : kind === 'meals' ? pl.check(J(MEALS)) : kind === 'rescue' ? pl.check(J(RESC)) : { status: 'fail' };
    if (H.mode[kind] === 'fail') out = { status: 'fail' };
    if (H.mode[kind] === 'nograin' && kind === 'meals') { const m = J(MEALS); m.meals[0].items = m.meals[0].items.filter(i => i.group !== 'carbs'); m.meals[0].grain = null; m.meals[0].contains = ['plain']; out = pl.check(m); }
    if (H.mode[kind] === 'paneer' && kind === 'meals') { const m = J(MEALS); m.meals[0].title = 'Paneer bhurji and bajra rotla'; m.meals[0].items[0] = { food: 'Paneer bhurji', grams: 150, group: 'protein', contains: ['dairy'] }; m.meals[0].contains = ['grain', 'dairy']; out = pl.check(m); }
    H.LOG.push({ kind, text: body.ctx && body.ctx.text, meds: body.profile && body.profile.meds, leave: body.profile && body.profile.leave, floor: pl.prompt ? /at least \d+ kcal, never below/.test(pl.prompt) : null });
    return r.fulfill({ status: pl.error ? 400 : 200, contentType: 'application/json', body: JSON.stringify(out) }); });
  H.p = await ctx.newPage(); await H.p.clock.install({ time: new Date('2026-11-23T13:10:00') }); await H.p.goto('http://np.test/');
  await H.p.evaluate(([s, m]) => { localStorage.setItem('np6', s); if (m != null) localStorage.setItem('np6meds', m); }, [seed, o.meds == null ? null : o.meds]); await H.p.reload(); await w(900); H.LOG = []; return H; }
const view = async (p, sel) => (await p.locator(sel).innerText().catch(() => '')).replace(/\s+/g, ' ');
const stored = async (p) => p.evaluate(() => { try { return localStorage.getItem('np6meds') !== null; } catch (e) { return null; } });
const vis = async (p, sel) => { const l = p.locator(sel); let n = 0; for (let i = 0; i < await l.count(); i++) if (await l.nth(i).isVisible()) n++; return n; };

(async () => {
  const b = await chromium.launch();
  try {
    // B1: the auditor's 24 cells (three set-ups that do not say insulin x Plate and Rescue x four typed texts), with the hold stored
    for (const [pn, pp] of [['diabetes, medicines No', {}], ['no condition', { health: 'none', conds: [], meds: '' }], ['high BP', { health: 'bp', conds: ['bp'], meds: '' }]])
      for (const surf of ['Plate', 'Rescue']) for (const text of ['my sugar is 50, feeling shaky', 'chest pain since lunch, dal rice', 'Gurda fry', 'I am pregnant']) {
        const H = await open(b, { profile: pp, meds: '{"at":1}' }), p = H.p, tr = A.typedReferral(text, Object.assign({}, PROFILE, pp));
        if (surf === 'Rescue') { await p.click('#tab-rescue'); await w(300); await p.fill('#rin', text); await p.press('#rin', 'Enter'); } else { await p.fill('#askin', text); await p.press('#askin', 'Enter'); }
        await w(600); const t = await view(p, surf === 'Plate' ? '#v-plate' : '#v-rescue'), iR = t.indexOf(REF), iU = t.indexOf(URG), iH = t.indexOf(HOLD), st = await stored(p);
        add('B1: a referral typed under the stored hold is drawn ahead of the hold card, with the line to get help now on an urgent sign, and the hold stays', !!tr && iR >= 0 && iH > iR && (!tr.urgent || (iU >= 0 && iU < iH)) && st === true && H.LOG.length === 0,
          `${pn}, ${surf}, "${text}": referral at ${iR}, urgent at ${iU} (want ${!!(tr && tr.urgent)}), hold at ${iH}, stored ${st}, requests ${H.LOG.length}: ${t.slice(0, 160)}`);
        await H.ctx.close(); }
    // "Warn them" (owner, 23 Nov): under the stored hold a low-sugar sign is referred with the line to get help now, above the hold card; nothing is sent; the hold stays
    for (const [pn, pp] of [['diabetes, medicines No', {}], ['no condition', { health: 'none', conds: [], meds: '' }], ['high BP', { health: 'bp', conds: ['bp'], meds: '' }]])
      for (const surf of ['Plate', 'Rescue']) { const text = 'feeling shaky, what should I eat';
        const H = await open(b, { profile: pp, meds: '{"at":1}' }), p = H.p;
        if (surf === 'Rescue') { await p.click('#tab-rescue'); await w(300); await p.fill('#rin', text); await p.press('#rin', 'Enter'); } else { await p.fill('#askin', text); await p.press('#askin', 'Enter'); }
        await w(600); const t = await view(p, surf === 'Plate' ? '#v-plate' : '#v-rescue'), iR = t.indexOf(REF), iU = t.indexOf(URG), iH = t.indexOf(HOLD), st = await stored(p);
        add('Warn them: a low-sugar sign typed under the stored hold is referred with the line to get help now, above the hold card; nothing is sent and the hold stays', iU >= 0 && iR > iU && iH > iR && st === true && H.LOG.length === 0,
          `${pn}, ${surf}: urgent at ${iU}, referral at ${iR}, hold at ${iH}, stored ${st}, requests ${JSON.stringify(H.LOG)}`); await H.ctx.close(); }
    // O2 (owner, 23 Nov, "One ask only (Recommended)"): under the stored hold a typed ask with no medicine name is sent once and its plate is drawn under the hold card; the
    // hold stays stored; after a reload the card shows alone and nothing is sent
    { const H = await open(b, { meds: '{"at":1}' }), p = H.p; await p.fill('#askin', 'something light with dal'); await p.press('#askin', 'Enter'); await w(900);
      const kinds = H.LOG.map(x => x.kind), sent = kinds.length, plate = await vis(p, '#plate-card'), card = await vis(p, '#meds-hold'), st = await stored(p);   // every endpoint counted (meals, rescue, tune, log): the one ask sends its plate request and nothing else ("Hide them", owner 24 Nov)
      H.LOG = []; await p.reload(); await w(1500); const plate2 = await vis(p, '#plate-card'), card2 = await vis(p, '#meds-hold'), st2 = await stored(p), sent2 = H.LOG.length;
      add('O2 ("One ask only"): a typed ask with no medicine name is answered once under the hold card and the hold stays stored; after a reload the card shows alone and nothing is sent', sent === 1 && kinds[0] === 'meals' && plate === 1 && card === 1 && st === true && plate2 === 0 && card2 === 1 && st2 === true && sent2 === 0,
        `sent ${JSON.stringify(kinds)}, plate ${plate}, card ${card}, stored ${st}; after reload: plate ${plate2}, card ${card2}, stored ${st2}, sent ${sent2}`); await H.ctx.close(); }
    // B2, p3b: an example ask whose plates are all dropped keeps its words in the ask box; the hold comes up from Rescue; send the ask box
    { const H = await open(b), p = H.p; H.mode.meals = 'nograin'; const pr = p.locator('[id^="prompt-"]').first(); const words = (await pr.innerText()).replace(/[“”]/g, '').trim(); await pr.click(); await w(700); H.mode.meals = null;
      await p.click('#tab-rescue'); await w(300); await p.fill('#rin', 'Rajma chawal, I take insulin'); await p.press('#rin', 'Enter'); await w(500); await p.click('#tab-plate'); await w(500);
      const kept = await p.locator('#askin').inputValue(); H.LOG = []; await p.click('#askgo'); await w(900); const st = await stored(p), plates = await vis(p, '#plate-card'), card = await vis(p, '#meds-hold');
      add('B2 (p3b): an example ask\'s words kept in the ask box are not typed: sending the box under the hold sends nothing, no plate is drawn and the hold stays', kept === words && H.LOG.length === 0 && st === true && plates === 0 && card === 1,
        `box "${kept}" (example "${words}"), requests ${JSON.stringify(H.LOG)}, stored ${st}, plates ${plates}, card ${card}`); await H.ctx.close(); }
    // B2, p3a: a chip whose reply could not be read keeps its name in the dish box; the hold comes up from Plate; send the dish box
    { const H = await open(b), p = H.p; await p.click('#tab-rescue'); await w(400); H.mode.rescue = 'fail'; const chip = p.locator('button[id^="dish-"]').first(); const name = (await chip.innerText()).trim(); await chip.click(); await w(600); H.mode.rescue = null;
      await p.click('#tab-plate'); await w(300); await p.fill('#askin', 'I take insulin, what lunch?'); await p.press('#askin', 'Enter'); await w(500); await p.click('#tab-rescue'); await w(500);
      const kept = await p.locator('#rin').inputValue(); H.LOG = []; await p.click('#v-rescue button.send'); await w(900); const st = await stored(p), dish = await vis(p, '#rescue-had'); await p.click('#tab-plate'); await w(1200);
      const plates = await vis(p, '#plate-card');
      add('B2 (p3a): a chip\'s name kept in the dish box is not typed: sending the box under the hold sends nothing, no dish or plate is drawn and the hold stays', kept === name && H.LOG.length === 0 && st === true && dish === 0 && plates === 0,
        `box "${kept}" (chip "${name}"), requests ${JSON.stringify(H.LOG)}, stored ${st}, dish ${dish}, plates ${plates}`); await H.ctx.close(); }
    // B2: a chip's kept name, edited by one key and then put back by a redraw (Plate and back), is not typed
    { const H = await open(b), p = H.p; await p.click('#tab-rescue'); await w(400); H.mode.rescue = 'fail'; const chip = p.locator('button[id^="dish-"]').first(); const name = (await chip.innerText()).trim(); await chip.click(); await w(600); H.mode.rescue = null;
      await p.click('#tab-plate'); await w(300); await p.fill('#askin', 'I take insulin, what lunch?'); await p.press('#askin', 'Enter'); await w(500); await p.click('#tab-rescue'); await w(400);
      await p.locator('#rin').press('End'); await p.keyboard.type('x'); await p.click('#tab-plate'); await w(300); await p.click('#tab-rescue'); await w(400);
      const kept = await p.locator('#rin').inputValue(); H.LOG = []; await p.click('#v-rescue button.send'); await w(900); const st = await stored(p);
      add('B2: a kept chip name edited by one key, then put back by a redraw, is not typed: sending it under the hold sends nothing and the hold stays', kept === name && H.LOG.length === 0 && st === true, `box "${kept}" (chip "${name}"), requests ${JSON.stringify(H.LOG)}, stored ${st}`); await H.ctx.close(); }
    // B3: "Remove my data" in tab A; tab B, opened before, makes one Your day choice; no answer and no hold is written back, and tab A opens on set-up
    { const H = await open(b, { meds: '{"at":1}' }), A1 = H.p; const B1 = await H.ctx.newPage(); await B1.clock.install({ time: new Date('2026-11-23T13:10:00') }); await B1.goto('http://np.test/'); await w(1200);
      await A1.click('#myfood'); await w(300); await A1.click('#wipe'); await w(200); await A1.click('#wipe-yes'); await w(1500);
      await B1.evaluate(() => { const x = [...document.querySelectorAll('#v-plate button')].find(e => /Mood/.test(e.textContent)); if (x) x.click(); }).catch(() => {}); await w(300);
      await B1.evaluate(() => { const x = [...document.querySelectorAll('[id^="mood-"]')].find(e => e.getAttribute('aria-checked') !== 'true'); if (x) x.click(); }).catch(() => {}); await w(800);
      const st = await A1.evaluate(() => ({ np6: localStorage.getItem('np6'), meds: localStorage.getItem('np6meds') })); await A1.reload(); await w(1200); const setup = await vis(A1, '#v-setup');
      const p6 = JSON.parse(st.np6 || '{}');
      add('B3: after "Remove my data" in one tab, a tab opened before writes no answers and no hold back; the first tab opens on set-up', !p6.p && st.meds === null && setup === 1, `np6 ${String(st.np6).slice(0, 80)}, np6meds ${st.meds}, set-up shown ${setup}`); await H.ctx.close(); }
    // B3, p6b and p6c: tab A changes My food (medicines Yes; leave out dairy); tab B, opened before, makes one Your day choice; tab A reloads and plans
    for (const kind of ['meds', 'dairy']) {
      const H = await open(b, kind === 'meds' ? { meds: '{"at":1}' } : {}), A1 = H.p; if (kind === 'dairy') H.mode.meals = 'paneer'; const B1 = await H.ctx.newPage(); await B1.clock.install({ time: new Date('2026-11-23T13:10:00') }); await B1.goto('http://np.test/'); await w(1200);
      if (kind === 'meds') { await A1.click('#add-meds'); await w(300); await A1.click('#meds-yes'); await A1.click('#sheet-done'); } else { await A1.click('#myfood'); await w(300); await A1.click('#leave-dairy'); await A1.click('#sheet-done'); }
      await w(1200); H.LOG = [];
      await B1.evaluate(() => { const x = [...document.querySelectorAll('#v-plate button')].find(e => /Mood/.test(e.textContent)); if (x) x.click(); }); await w(300);
      await B1.evaluate(() => { const x = [...document.querySelectorAll('[id^="mood-"]')].find(e => e.getAttribute('aria-checked') !== 'true'); if (x) x.click(); }); await w(800);
      const np6 = await A1.evaluate(() => JSON.parse(localStorage.getItem('np6')).p);
      await A1.reload(); await w(1500); if (await A1.locator('#remake').count()) await A1.click('#remake'); await w(1500);
      const t = await view(A1, '#v-plate'), m = H.LOG.filter(x => x.kind === 'meals');
      const ok = kind === 'meds' ? np6.meds === 'yes' && m.length > 0 && m.every(x => x.meds === 'yes' && x.floor === true) : (np6.leave || []).indexOf('dairy') >= 0 && m.length > 0 && m.every(x => (x.leave || []).indexOf('dairy') >= 0) && !/Paneer/.test(t);
      add('B3 (p6b, p6c): a tab opened earlier does not write its old answers over a My food change made in another tab; the next plan reads the change', ok,
        `${kind}: stored ${JSON.stringify({ meds: np6.meds, leave: np6.leave })}, tab A requests ${JSON.stringify(m)}, paneer shown ${/Paneer/.test(t)}`); await H.ctx.close(); }
    // round 9 (safety audit of a109dd1, B1; ports of q8 and q8b; owner, 24 Nov, "Done saves that screen (Recommended)"): tab B ticks in an open My food sheet; tab A makes
    // one Your day tap, then a My food change and Done; tab B taps Done. What tab B showed is saved, and both tabs draw and send it
    const tab = async (H) => { const B1 = await H.ctx.newPage(); await B1.clock.install({ time: new Date('2026-11-23T13:10:00') }); await B1.goto('http://np.test/'); await w(1200); return B1; };
    const moodTap = async (X) => { await X.evaluate(() => { const x = [...document.querySelectorAll('#v-plate button')].find(e => /Mood/.test(e.textContent)); if (x) x.click(); }); await w(300);
      await X.evaluate(() => { const x = [...document.querySelectorAll('[id^="mood-"]')].find(e => e.getAttribute('aria-checked') !== 'true'); if (x) x.click(); }); await w(900); };
    const pressed = async (X, id) => X.evaluate((i) => { const x = document.getElementById(i); return !!x && (x.getAttribute('aria-checked') === 'true' || x.getAttribute('aria-pressed') === 'true'); }, id);
    for (const [what, bt, at] of [['Kidney', 'health-kidney', 'health-bp'], ['Pregnant or breastfeeding', 'health-preg', 'health-bp'], ['Leave out nuts', 'leave-nut', 'leave-dairy']]) {
      const H = await open(b), A1 = H.p, B1 = await tab(H);
      await B1.click('#myfood'); await w(300); await B1.click('#' + bt); await w(300);
      await moodTap(A1); await A1.click('#myfood'); await w(300); await A1.click('#' + at); await A1.click('#sheet-done'); await w(1200);
      const shows = await pressed(B1, bt); H.LOG = []; await B1.click('#sheet-done'); await w(1800);
      const s = await A1.evaluate(() => JSON.parse(localStorage.getItem('np6')).p); await A1.click('#tab-plate'); await w(900);
      const tA = await view(A1, '#v-plate'), tB = await view(B1, '#v-plate'), cards = (await vis(A1, '#plate-card')) + (await vis(B1, '#plate-card'));
      const kept = bt === 'leave-nut' ? JSON.stringify(s.leave) === '["nut"]' : s.conds.indexOf(bt.slice(7)) >= 0 && s.conds.indexOf('bp') < 0;
      const drawn = bt === 'leave-nut' ? H.LOG.filter(x => x.kind === 'meals').length > 0 && H.LOG.filter(x => x.kind === 'meals').every(x => JSON.stringify(x.leave) === '["nut"]') : tA.indexOf('coach and doctor') >= 0 && tB.indexOf('coach and doctor') >= 0 && cards === 0 && H.LOG.filter(x => x.kind !== 'log').length === 0;
      add('B1 (q8, q8b): the tick tab B shows when Done is tapped is the tick saved, and both tabs draw and send it ("Done saves that screen")', shows && kept && drawn,
        `${what}: B showed its tick ${shows}; stored ${JSON.stringify({ conds: s.conds, leave: s.leave })}; requests after B's Done ${JSON.stringify(H.LOG.map(x => x.kind + ':' + JSON.stringify(x.leave)))}; A ${tA.slice(0, 80)}; B ${tB.slice(0, 80)}`); await H.ctx.close(); }
    // the set-up under the hold (q8): no condition, the hold stored; B ticks High BP; A answers diabetes and Yes through "Add it in My food" and Done (the hold ends); B taps Done.
    // B's Done saves what B showed (High BP, no diabetes). Neither tab holds a set-up it did not show, and no hold is left that no tab shows (a stated limit: S6, D14)
    { const H = await open(b, { profile: { health: 'none', conds: [], meds: '' }, meds: '{"at":1}' }), A1 = H.p, B1 = await tab(H);
      await B1.click('#myfood'); await w(300); await B1.click('#health-bp'); await w(300);
      await A1.click('#add-meds'); await w(400); if (await A1.locator('#meds-yes').count() === 0) { await A1.click('#health-diabetes'); await w(200); } await A1.click('#meds-yes'); await A1.click('#sheet-done'); await w(1200);
      H.LOG = []; await B1.click('#sheet-done'); await w(1800); const s = await A1.evaluate(() => ({ p: JSON.parse(localStorage.getItem('np6')).p, meds: localStorage.getItem('np6meds') })); await A1.click('#tab-plate'); await w(900);
      const holds = (await vis(A1, '#meds-hold')) + (await vis(B1, '#meds-hold')), m = H.LOG.filter(x => x.kind === 'meals');
      add('B1 (q8, under the hold): B\'s Done saves what B showed; the hold A ended stays ended and both tabs plan with the saved set-up', JSON.stringify(s.p.conds) === '["bp"]' && s.meds === null && holds === 0 && m.length > 0 && m.every(x => x.meds === 'no'),
        `stored ${JSON.stringify({ conds: s.p.conds, meds: s.p.meds })}, np6meds ${s.meds}, hold cards ${holds}, requests ${JSON.stringify(m.map(x => x.meds))}`); await H.ctx.close(); }
    // q7 (audit m2): two live tabs, no tap in tab B: a dairy left out in A takes B's paneer plate away at once; a hold raised in A shows B the hold card at once
    { const H = await open(b), A1 = H.p; H.mode.meals = 'paneer'; await A1.evaluate(() => { const s = JSON.parse(localStorage.getItem('np6')); delete s.store; localStorage.setItem('np6', JSON.stringify(s)); }); await A1.reload(); await w(1500); const B1 = await tab(H); const before = /Paneer/.test(await view(B1, '#v-plate'));
      await A1.click('#myfood'); await w(300); await A1.click('#leave-dairy'); await A1.click('#sheet-done'); await w(1500); const after = /Paneer/.test(await view(B1, '#v-plate'));
      await A1.fill('#askin', 'I take insulin, what lunch?'); await A1.press('#askin', 'Enter'); await w(1200); const plate = await vis(B1, '#plate-card'), card = await vis(B1, '#meds-hold');
      add('q7: with no tap in tab B, a dairy left out and a hold raised in tab A are drawn in tab B at once', before && !after && plate === 0 && card === 1, `paneer before ${before}, after ${after}; B after the hold: plate ${plate}, card ${card}`); await H.ctx.close(); }
  } finally { await b.close(); }
  let fail = 0;
  for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, 8).forEach(x => console.log('       ' + x)); fail += r.bad.length; }
  console.log(fail ? `${fail} counter-example(s): the hold in the browser does not hold (${pageFile})` : `the hold in the browser: referrals drawn, kept drafts not typed, a second tab writes no old answers (${pageFile})`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
