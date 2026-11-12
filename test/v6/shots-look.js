// Phone screens of the plate look (portion ring, nutrient colours, stoneware plate, Pair it, taste notes).  node test/v6/shots-look.js <base-url> <out-dir> [scale]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:3006/', OUT = (process.argv[3] || 'screens/v6-look') + '/', DSF = Number(process.argv[4] || 2);
const NOW = new Date('2026-11-12T13:10:00+05:30').getTime(), H = 36e5, D = 864e5;
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const ev = [{ t: NOW - 4.5 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha', kcal: 300, protein: 8, carbs: 50, fats: 8, fiber: 4 }];
for (let i = 1; i <= 5; i++) ev.push({ t: NOW - i * D + 7 * H, type: 'had', meal: 'dinner', title: 'Dal, sabzi and phulka', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 });
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), errs = [];
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DSF, timezoneId: 'Asia/Kolkata', locale: 'en-IN' });
  await c.clock.install({ time: new Date(NOW) });
  await c.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np6', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify({ p: P, c: {}, ev }));
  const p = await c.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const settle = async ms => { await p.clock.runFor(ms || 1500); await p.waitForTimeout(250); };
  const into = (sel, bl) => p.evaluate(([s, b2]) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: b2 || 'start' }); }, [sel, bl]);
  const shot = n => p.screenshot({ path: OUT + n + '.png' });
  await p.goto(BASE); await p.evaluate(() => document.fonts.ready);
  await p.waitForSelector('#plate-card', { timeout: 60000 }); await settle(1500);
  await p.waitForSelector('#alc-protein:not([disabled])', { timeout: 60000 }); await settle(600);
  await into('.tiles', 'center'); await settle(300); await shot('1-today-colours');
  await into('#plate-card'); await settle(400); await shot('2-plate');
  await into('.hero-main h2', 'start'); await settle(300); await shot('3-title-cards');
  await into('.serve', 'start'); await settle(300); await shot('4-serve-pairs');
  await into('.card.why', 'start'); await settle(300); await shot('5-why-alts');
  await p.click('#alt-1'); await settle(1200); await into('#plate-card'); await settle(300); await shot('6-second-plate');
  await p.click('#tab-build'); await settle(800); await shot('7-builder');
  console.log(OUT, 'errors:', errs.length ? errs : 'none'); await b.close();
})();
