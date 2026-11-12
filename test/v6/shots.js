// Phone screenshots of v6 Phase 1 against a local server.  node test/v6/shots.js [scale] [base]
const { chromium } = require('playwright');
const DSF = Number(process.argv[2] || 2), BASE = process.argv[3] || 'http://localhost:3006/', OUT = 'screens/v6-phase1/';
const NOW = new Date('2026-11-12T20:40:00+05:30').getTime(), H = 36e5, D = 864e5;
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const week = []; for (let i = 1; i <= 6; i++) { week.push({ t: NOW - i * D - 12 * H, type: i % 2 ? 'skipped' : 'had', meal: 'breakfast', title: 'Vegetable poha', kcal: 300, protein: 8, carbs: 50, fats: 8, fiber: 4 });
  week.push({ t: NOW - i * D + (i < 5 ? 1.3 : -1) * H, type: 'had', meal: 'dinner', title: i < 4 ? 'Rajma chawal' : 'Dal, sabzi and phulka', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 }); }
const today = [{ t: NOW - 11.5 * H, type: 'skipped', meal: 'breakfast' }, { t: NOW - 6.5 * H, type: 'other', meal: 'lunch', title: 'Chole bhature', kcal: 820, protein: 22, carbs: 98, fats: 36, fiber: 14 }];
(async () => {
  const b = await chromium.launch(), errs = [];
  async function ctx(seed) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: DSF, timezoneId: 'Asia/Kolkata', locale: 'en-IN' });
    await c.clock.install({ time: new Date(NOW) }); 
    if (seed) await c.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np6', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(seed));
    const p = await c.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  }
  const settle = async (p, ms) => { await p.clock.runFor(ms || 1500); await p.waitForTimeout(250); };
  const shot = (p, n) => p.screenshot({ path: OUT + n + '.png' });
  const into = (p, sel, block) => p.evaluate(([s, bl]) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: bl || 'start' }); }, [sel, block]);
  // 1 first visit: goal + food
  let p = await ctx(null); await p.goto(BASE); await p.evaluate(() => document.fonts.ready); await settle(p, 500); await shot(p, '01-setup-goal');
  // 2 a day in progress: skipped breakfast, heavy lunch out of plan, late dinner pattern
  p = await ctx({ p: P, c: {}, ev: week.concat(today) }); await p.goto(BASE); await p.evaluate(() => document.fonts.ready); await settle(p, 300); await shot(p, '02-planning');
  await p.waitForSelector('#plate-card', { timeout: 60000 }); await settle(p, 1500); await shot(p, '03-today-directive');
  await into(p, '#plate-card'); await settle(p, 400); await shot(p, '04-plate');
  await into(p, '.hero h2', 'start'); await settle(p, 400); await shot(p, '05-planned-around');
  await into(p, '.card.why', 'center'); await settle(p, 400); await shot(p, '06-why-today');
  await p.click('#how'); await settle(p, 500); await shot(p, '07-how-numbers'); await p.click('#sheet-done'); await settle(p, 300);
  await p.click('#dial-appetite'); await settle(p, 400); await into(p, '.rail', 'start'); await settle(p, 200); await shot(p, '08-appetite-suggested'); await p.click('#dial-appetite'); await settle(p, 200);
  // 3 log something else for dinner
  await into(p, '.logrow', 'center'); await settle(p, 300); await p.click('#log-other'); await settle(p, 400); await p.fill('#login', '2 aloo paratha with curd'); await shot(p, '09-log-ask');
  await p.press('#login', 'Enter'); await p.waitForSelector('#log-ok', { timeout: 60000 }); await settle(p, 400); await shot(p, '10-log-estimate');
  await p.click('#log-ok'); await settle(p, 900); await shot(p, '11-day-updated');
  // 4 morning of a fresh day: plan breakfast, have it, lunch re-plans
  p = await ctx({ p: Object.assign({}, P, { health: 'none' }), c: {}, ev: week }); await p.goto(BASE); await p.evaluate(() => document.fonts.ready);
  await p.waitForSelector('#plate-card', { timeout: 60000 }); await settle(p, 800);
  await p.click('#meal-breakfast'); await p.waitForSelector('#plate-card', { timeout: 60000 }); await settle(p, 800); await into(p, '.acts', 'center'); await settle(p, 300); await shot(p, '12-actions');
  await p.click('#have'); await settle(p, 900); await shot(p, '13-logged');
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
