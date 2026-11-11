// Phone screenshots of v5 against the local server + mock Gemini.  node test/v5/shots.js [scale]
const { chromium } = require('playwright');
const BASE = 'http://localhost:3005/', OUT = 'screens/ai-v5/', DSF = Number(process.argv[2] || 2);
const veg = { p: { diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'm', age: 48, cm: 170, kg: 78, act: 'low', done: true }, c: { mode: 'focus', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5 } };
const nonveg = JSON.parse(JSON.stringify(veg)); nonveg.p.diet = 'nonveg';
(async () => {
  const b = await chromium.launch();
  const errs = [];
  async function ctx(seed, h) {
    const c = await b.newContext({ viewport: { width: 390, height: h || 844 }, deviceScaleFactor: DSF, timezoneId: 'Asia/Kolkata' });
    if (seed) await c.addInitScript(s => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np5', s); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(seed));
    const p = await c.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  }
  const fonts = p => p.evaluate(() => document.fonts.ready);
  // 1 first visit
  let p = await ctx(null); await p.goto(BASE); await fonts(p); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '01-setup.png' });
  // 2 plate: waiting, then loaded
  p = await ctx(veg); await p.goto(BASE); await fonts(p); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '02-planning.png' });
  await p.waitForSelector('#plate-card', { timeout: 15000 }); await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + '03-plate-top.png' });
  await p.evaluate(() => document.getElementById('plate-card').scrollIntoView()); await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '04-plate-card.png' });
  await p.click('#alc-protein'); await p.click('#alc-glucose'); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('.read4').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '05-one-tap.png' });
  await p.click('#adjust'); await p.waitForTimeout(200); await p.click('#swp-1'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.serve').scrollIntoView({ block: 'start' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '06-serve-swap.png' });
  await p.evaluate(() => document.querySelector('.card.why').scrollIntoView({ block: 'start' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '07-why-ask.png' });
  // 3 builder
  await p.click('#tab-build'); await p.waitForTimeout(700); await p.screenshot({ path: OUT + '08-builder.png' });
  await p.click('#hab-veg'); await p.click('#hab-walk'); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('.inst').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '09-curve.png' });
  // 4 rescue (non-veg profile)
  p = await ctx(nonveg); await p.goto(BASE); await fonts(p); await p.waitForSelector('#plate-card', { timeout: 15000 });
  await p.click('#tab-rescue'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '10-rescue-empty.png' });
  await p.click('#dish-0'); await p.waitForSelector('.cmp', { timeout: 15000 }); await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '11-rescue.png' });
  await p.evaluate(() => document.querySelector('.moves').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '12-rescue-moves.png' });
  // 5 ask
  p = await ctx(veg); await p.goto(BASE); await fonts(p); await p.waitForSelector('#plate-card', { timeout: 15000 });
  await p.fill('#askin', 'craving chaat at 6 pm'); await p.press('#askin', 'Enter'); await p.waitForTimeout(250);
  await p.screenshot({ path: OUT + '13-asking.png' });
  await p.waitForSelector('.readline .asked', { timeout: 15000 }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.readline').scrollIntoView({ block: 'start' })); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '14-answer.png' });
  // 6 kidney flag
  const kid = JSON.parse(JSON.stringify(veg)); kid.p.health = 'kidney';
  p = await ctx(kid); await p.goto(BASE); await fonts(p); await p.waitForTimeout(500); await p.screenshot({ path: OUT + '15-safety.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
