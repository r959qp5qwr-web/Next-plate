// Phone screenshots of "Read the menu" (docs/FEATURE-menu.md) on the Rescue tab, against a local server and the mock engine.
//   bun test/v5/mock-gemini.ts                                                                    (mock Gemini on 8787; DELAY=1500 keeps the wait card on screen)
//   GEMINI_BASE_URL=http://localhost:8787 GEMINI_API_KEY=mock PAGE_FILE=hosted/v6/index.min.html PORT=3006 bun src/v5/server.ts
//   node test/v6/shots-menu.js [scale] [base]
// The menu and the reply are the fixture in test/v6/fixture-menu.js: layout samples, not AI output.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const fx = require('./fixture-menu.js');
const DSF = Number(process.argv[2] || 2), BASE = process.argv[3] || 'http://localhost:3006/', OUT = path.join(__dirname, '..', '..', 'screens', 'v6-menu') + path.sep;
const NOW = new Date('2026-11-12T20:40:00+05:30').getTime(), H = 36e5, D = 864e5;
const P = { goal: 'hold', focus: 'iron', diet: 'veg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 62, act: 'light', done: true };
const week = []; for (let i = 1; i <= 6; i++) { week.push({ t: NOW - i * D - 12 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha', kcal: 300, protein: 8, carbs: 50, fats: 8, fiber: 4 });
  week.push({ t: NOW - i * D + (i < 5 ? 1.3 : -1) * H, type: 'had', meal: 'dinner', title: i < 4 ? 'Rajma chawal' : 'Dal, sabzi and phulka', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 }); }
const today = [{ t: NOW - 11.5 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha with peanuts', kcal: 350, protein: 9, carbs: 52, fats: 11, fiber: 5 },
  { t: NOW - 6.5 * H, type: 'other', meal: 'lunch', title: 'Curd rice with beans poriyal', kcal: 560, protein: 18, carbs: 86, fats: 15, fiber: 8 }];
// a day where nothing on a restaurant menu can fit: a heavy lunch out leaves a small dinner
const P2 = Object.assign({}, P, { goal: 'lose', kg: 72, act: 'low' });
const today2 = [{ t: NOW - 11.5 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha', kcal: 300, protein: 8, carbs: 50, fats: 8, fiber: 4 },
  { t: NOW - 6.5 * H, type: 'rescued', meal: 'lunch', title: 'Chole bhature', kcal: 820, protein: 22, carbs: 98, fats: 36, fiber: 14 }];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), errs = [], notes = [];
  async function ctx(seed) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DSF, timezoneId: 'Asia/Kolkata', locale: 'en-IN' });
    await c.clock.install({ time: new Date(NOW) });
    await c.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np6', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(seed));
    const p = await c.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  }
  const settle = async (p, ms) => { await p.clock.runFor(ms || 1500); await p.waitForTimeout(250); };
  const shot = (p, n) => p.screenshot({ path: OUT + n + '.png' });
  const into = (p, sel, block) => p.evaluate(([s, bl]) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: bl || 'start' }); }, [sel, block]);
  // nothing may run wider than the phone, and no text line may be cut off inside the Rescue tab
  const fits = async (p, where) => { const bad = await p.evaluate(() => { const out = [], v = document.getElementById('v-rescue');
    if (document.getElementById('scroll').scrollWidth > document.getElementById('scroll').clientWidth) out.push('the page scrolls sideways');
    v.querySelectorAll('h2,h3,p,b,small,span,button,li,textarea,input').forEach(e => { if (e.closest('.sits') || e.closest('svg')) return; const r = e.getBoundingClientRect(); if (r.width && (r.right > 390.5 || r.left < -0.5)) out.push((e.id || e.className || e.tagName) + ' runs off the screen'); });
    return out; }); if (bad.length) notes.push(where + ': ' + bad.join('; ')); };
  const open = async seed => { const p = await ctx(seed); await p.goto(BASE); await p.evaluate(() => document.fonts.ready); await p.waitForSelector('#plate-card', { timeout: 60000 }); await settle(p, 800); await p.click('#tab-rescue'); await settle(p, 500); return p; };

  // 1 dinner at a restaurant, before ordering: the entry, the typed menu, the wait, the order
  let p = await open({ p: P, c: {}, ev: week.concat(today) });
  await fits(p, '01'); await shot(p, '01-entry');
  await p.click('#mtype'); await settle(p, 300); await p.fill('#mtext', fx.typed); await p.evaluate(() => { document.getElementById('mtext').scrollTop = 0; }); await settle(p, 200); await fits(p, '02'); await shot(p, '02-typed-menu');
  await p.click('#mgo'); await settle(p, 150); await fits(p, '03'); await shot(p, '03-reading');
  await p.waitForSelector('#order-card', { timeout: 60000 }); await settle(p, 600); await into(p, '.entries'); await settle(p, 200); await fits(p, '04'); await shot(p, '04-result');
  const first = await p.textContent('#order-card .dish');
  await into(p, '.alts', 'center'); await settle(p, 200); await p.click('#order-alt-1'); await settle(p, 700); await into(p, '#order-card'); await settle(p, 300); await fits(p, '05'); await shot(p, '05-alternate-chosen');
  const second = await p.textContent('#order-card .dish'); if (first === second) notes.push('05: choosing an alternate did not change the top order');
  await into(p, '#order-leave', 'center'); await settle(p, 300); await fits(p, '06'); await shot(p, '06-leave-and-tip');
  await into(p, '#order-card'); await settle(p, 200); await p.click('#order-go'); await settle(p, 900); await shot(p, '07-ordered');
  const ev = await p.evaluate(() => window.__np6.ev().filter(e => e.type === 'ordered').map(e => [e.meal, e.title, e.kcal, e.protein]));
  console.log('ordered event:', JSON.stringify(ev), '| day so far:', JSON.stringify(await p.evaluate(() => { const t = window.__np6.file().today; return [t.kcal, t.protein]; })));
  if (ev.length !== 1 || ev[0][0] !== 'dinner') notes.push('07: expected one ordered event for dinner');

  // 2 a day where nothing fits: the closest order, said plainly, with two moves
  p = await open({ p: P2, c: {}, ev: week.concat(today2) });
  await p.click('#mtype'); await settle(p, 300); await p.fill('#mtext', fx.typed); await p.click('#mgo');
  await p.waitForSelector('#order-card', { timeout: 60000 }); await settle(p, 600); await into(p, '.note'); await settle(p, 200); await fits(p, '08'); await shot(p, '08-nothing-fits');
  await p.click('#order-move-0'); await settle(p, 500); await into(p, '#order-card'); await settle(p, 200); await fits(p, '09'); await shot(p, '09-nothing-fits-move-on');

  // 3 a photo nobody could read (the mock treats a tiny image as unreadable), then a readable one
  p = await open({ p: P, c: {}, ev: week.concat(today) });
  await p.setInputFiles('#mfile', { name: 'blur.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') });
  await p.waitForSelector('.note', { timeout: 60000 }); await settle(p, 400); await fits(p, '10'); await shot(p, '10-unreadable');
  const photo = await (await b.newContext({ viewport: { width: 700, height: 1100 } })).newPage();
  await photo.setContent('<body style="margin:0;padding:40px;font:28px/44px Georgia,serif;background:#f4efe4;color:#222;white-space:pre-line">' + fx.typed + '</body>');
  await p.setInputFiles('#mfile', { name: 'menu.png', mimeType: 'image/png', buffer: await photo.screenshot() });
  await p.waitForSelector('#order-card', { timeout: 60000 }); await settle(p, 400);
  console.log('photo path: order card shown, top order', JSON.stringify(await p.textContent('#order-card .dish')));

  console.log('layout notes:', notes.length ? notes : 'none'); console.log('errors:', errs.length ? errs : 'none'); await b.close();
  if (notes.length || errs.length) process.exit(1);
})();
