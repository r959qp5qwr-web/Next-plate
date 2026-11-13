// Features film captures (docs/film/SCRIPT-features.md): new scenes only; the heavy-lunch day and 'had something else' come from capture.js.
// Film captures of the v6 Phase 1 screens, at 3x for close-ups, with the on-screen position of every named element.
//   LIVE=<engine url> CODE=<eval code> node demo/reel/capture.js [base]
// The page is served locally (hosted/v6); every /api call goes to the live engine, so the screens show the engine's own output.
// Writes demo/reel/promo/assets/shots/*.png and demo/reel/promo/assets/rects.json (CSS px, 390 x 844 viewport).
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:3006/', OUT = 'demo/reel/film5/assets/shots/', DSF = 3;
const LIVE = process.env.LIVE || '', CODE = process.env.CODE || '';
const at = (hm) => new Date('2026-11-12T' + hm + ':00+05:30').getTime(), NOW = at('20:40'), H = 36e5, D = 864e5;
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const week = []; for (let i = 1; i <= 6; i++) { week.push({ t: NOW - i * D - 12 * H, type: i % 2 ? 'skipped' : 'had', meal: 'breakfast', title: 'Vegetable poha', kcal: 300, protein: 8, carbs: 50, fats: 8, fiber: 4 });
  week.push({ t: NOW - i * D + (i < 5 ? 1.3 : -1) * H, type: 'had', meal: 'dinner', title: i < 4 ? 'Rajma chawal' : 'Vegetable pulao and raita', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 }); }
const today = [{ t: NOW - 11.5 * H, type: 'skipped', meal: 'breakfast' }, { t: NOW - 6.5 * H, type: 'other', meal: 'lunch', title: 'Chole bhature', kcal: 820, protein: 22, carbs: 98, fats: 36, fiber: 14 }];
// text the film underlines or circles: located on the page, so the marks sit on the words as shown
const PHRASES = ['So far [^.]*\\.', '[A-Z][a-z]+ carries [^.]*\\.', 'That is every meal for today\\.', 'How these numbers are worked out', 'less rajma this week', 'dinners run late', 'planned around:[^\\n]*', 'the grain stays on the plate',
  "Your doctor.s advice comes first", 'age, sex, height, weight', 'your weight trend has the last word', 'counted on \\d+ kg', 'Never under \\d+ kcal a day', 'for your coach\\s+and doctor to plan with you', 'Nothing here is suggested\\s+for now',
  'Counted[^.]*\\.', 'The rest of the day follows it\\.', 'Moves that make it fit', 'Fit \\d+ . \\d+ ?/ ?100', 'lighter after earlier meals', 'to catch up on protein', '\\(an estimate\\)', 'Eating out anyway', 'Chole Bhature'];
(async () => {
  const b = await chromium.launch(), errs = [], rects = process.env.ONLY && fs.existsSync('demo/reel/film5/assets/rects.json') ? JSON.parse(fs.readFileSync('demo/reel/film5/assets/rects.json', 'utf8')) : {};
  async function ctx(seed) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DSF, timezoneId: 'Asia/Kolkata', locale: 'en-IN' });
    await c.clock.install({ time: new Date(ctx.T || NOW) });
    if (LIVE) await c.route('**/api/**', async route => { const rq = route.request(), body = JSON.parse(rq.postData() || '{}'); body.key = CODE;
      try { const r = await fetch(LIVE + new URL(rq.url()).pathname, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json(); delete j.raw; delete j.prompt; delete j.ms;
        await route.fulfill({ status: r.status, contentType: 'application/json', body: JSON.stringify(j) }); } catch (e) { await route.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"upstream_error"}' }); } });
    if (seed) await c.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np6', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(seed));
    const p = await c.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  }
  const settle = async (p, ms) => { await p.clock.runFor(ms || 1500); await p.waitForTimeout(250); };
  const shot = async (p, n) => {
    await p.screenshot({ path: OUT + n + '.png' });
    rects[n] = await p.evaluate(() => { const out = []; document.querySelectorAll('body *').forEach(e => {
      const cls = typeof e.className === 'string' ? e.className : ''; if (!e.id && !cls && !/^(H1|H2|H3|LI|P|B|STRONG|EM|S)$/.test(e.tagName)) return;
      const r = e.getBoundingClientRect(); if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return;
      out.push([e.tagName.toLowerCase(), e.id || '', cls, Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10, (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)]); });
      return out; });
    rects[n + ':phr'] = await p.evaluate((pats) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), nodes = []; let full = '';
      while (w.nextNode()) { const nd = w.currentNode, pe = nd.parentElement; if (!pe) continue; const r = pe.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue; nodes.push([nd, full.length]); full += nd.nodeValue; }
      const loc = (pos) => { for (let i = nodes.length - 1; i >= 0; i--) if (nodes[i][1] <= pos) return [nodes[i][0], pos - nodes[i][1]]; }, out = {};
      for (const src of pats) { const re = new RegExp(src, 'g'); let m; const all = [];
        while ((m = re.exec(full))) { if (!m[0].length) break; const A = loc(m.index), B = loc(m.index + m[0].length - 1), rg = document.createRange(); rg.setStart(A[0], A[1]); rg.setEnd(B[0], B[1] + 1);
          const rs = [...rg.getClientRects()].filter(r => r.width > 2 && r.bottom > 0 && r.top < innerHeight).map(r => [r.left, r.top, r.width, r.height].map(v => Math.round(v * 10) / 10)); if (rs.length) all.push(rs); }
        if (all.length) out[src] = all; }
      return out; }, PHRASES);
  };
  const into = (p, sel, block) => p.evaluate(([s, bl]) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: bl || 'start' }); }, [sel, block]);

  const fresh = async (hm, seed) => { const pp = await ctxAt(hm, seed); await pp.goto(BASE); await pp.evaluate(() => document.fonts.ready); await pp.waitForSelector('#plate-card', { timeout: 90000 }); await settle(pp, 1200); return pp; };
  async function ctxAt(hm, seed) { const save = ctx.T; ctx.T = at(hm); const pp = await ctx(seed); ctx.T = save; return pp; }
  const ON = (k) => !process.env.ONLY || process.env.ONLY.split(',').includes(k);
  const bf = { t: at('08:30'), type: 'had', meal: 'breakfast', title: 'Vegetable poha with peanuts', kcal: 350, protein: 9, carbs: 52, fats: 11, fiber: 5 };
  let p;
  // M  lunch out: Read the menu from a photo of a printed menu
  if (ON('M')) {
    p = await fresh('13:15', { p: P, c: {}, ev: week.concat([bf]) });
    await p.click('#tab-rescue'); await settle(p, 500); await shot(p, 'M1-rescue-entry');
    await p.setInputFiles('#mfile', 'demo/reel/film5/assets/menu-photo.jpg'); await settle(p, 300); await shot(p, 'M2-reading');
    await p.waitForSelector('#order-card', { timeout: 90000 }); await settle(p, 800); await into(p, '#order-card'); await settle(p, 300); await shot(p, 'M3-order');
    await into(p, '#order-card', 'center'); await settle(p, 300); await shot(p, 'M4-order-centre');
  }
  // K  a craving at six: ask for chaat; then one tap makes it gentler on sugar
  if (ON('K')) {
    const lunch = { t: at('13:20'), type: 'had', meal: 'lunch', title: 'Dal, sabzi, 2 roti and salad', kcal: 520, protein: 20, carbs: 70, fats: 14, fiber: 12 };
    p = await fresh('18:00', { p: P, c: {}, ev: week.concat([bf, lunch]) });
    await into(p, '.prompts', 'center'); await settle(p, 300); await p.fill('#askin', 'Craving chaat'); await settle(p, 200); await shot(p, 'K1-ask');   // the ask prompts in view, not an earlier plate
    await p.press('#askin', 'Enter'); await settle(p, 300);
    await p.waitForSelector('#plate-card', { timeout: 90000 }); await p.waitForFunction(() => !document.querySelector('.plate.wait'), null, { timeout: 90000 }); await settle(p, 1500);
    await into(p, '#plate-card'); await settle(p, 400); await shot(p, 'K2-plate');
    await p.evaluate(() => { const st = document.createElement('style'); st.id = 'clean-plate'; st.textContent = '.scribble,.hero-sprig,.band{visibility:hidden!important}'; document.head.appendChild(st); }); await settle(p, 200); await shot(p, 'K2-plate-clean'); await p.evaluate(() => document.getElementById('clean-plate').remove()); await settle(p, 200);
    await into(p, '.serve', 'start'); await settle(p, 400); await shot(p, 'K3-serve');
    await p.waitForSelector('#alc-glucose:not([disabled])', { timeout: 90000 }); await settle(p, 600);
    await into(p, '.tune', 'center'); await settle(p, 300); await shot(p, 'K4-taps');
    await p.click('#alc-glucose'); await settle(p, 900); await shot(p, 'K5-gentler');
    await into(p, '.hero h2', 'start'); await settle(p, 300); await shot(p, 'K6-gentler-title');
  }
  // V  Builder: more vegetables, and the after-meal curve
  if (ON('V')) {
    p = await fresh('20:30', { p: P, c: {}, ev: week.concat([bf]) });
    await p.click('#tab-build'); await settle(p, 700); await shot(p, 'V1-builder');
    await p.click('#st-greens-p'); await settle(p, 500); await p.click('#st-greens-p'); await settle(p, 900); await shot(p, 'V2-more-veg');
    await into(p, '.inst', 'center'); await settle(p, 1200); await shot(p, 'V3-curve');
  }
  // T  the day done: every meal ticked
  if (ON('T')) {
    const lunch = { t: at('13:20'), type: 'rescued', meal: 'lunch', title: 'Dal tadka with 2 tandoori roti', kcal: 520, protein: 20, carbs: 70, fats: 14, fiber: 12 },
      snack = { t: at('18:05'), type: 'had', meal: 'snack', title: 'Sprouts chaat', kcal: 180, protein: 9, carbs: 24, fats: 4, fiber: 6 };
    p = await fresh('20:40', { p: P, c: {}, ev: week.concat([bf, lunch, snack]) });
    await p.waitForSelector('#have', { timeout: 90000 }); await settle(p, 600); await p.click('#have'); await settle(p, 1200); await p.evaluate(() => { document.getElementById('scroll').scrollTop = 0; }); await settle(p, 300); await shot(p, 'T1-day-done');
  }
  fs.mkdirSync('demo/reel/film5/assets', { recursive: true }); fs.writeFileSync('demo/reel/film5/assets/rects.json', JSON.stringify(rects));
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
