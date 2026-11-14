// Next Plate surface review: drives every surface and state of the built page on phone viewports, in light and dark mode and with
// enlarged text, measures each against the UX/UI criteria in docs/ux/UX-CRITERIA.md, and writes a report and screens for the visual review.
//
//   node test/ux/review.js [--quick] [--page hosted/v6/index.html] [--only plate-hero,builder] [--out test/ux/out]
//
// It starts its own mock engine (test/v5/mock-gemini.ts) and server (src/v5/server.ts) on free ports, so it needs bun and playwright.
// Exit code 0 = no violations; 1 = violations (listed in <out>/report.md); 2 = the review itself could not run.
// --quick runs the gate set used by the hook (4 widths, light and dark, large text at 360); the full run adds 375, 430 and 393 widths.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), net = require('net');
const ROOT = path.join(__dirname, '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const QUICK = process.argv.includes('--quick'), PAGE = arg('page', 'hosted/v6/index.html'), OUT = path.resolve(ROOT, arg('out', 'test/ux/out')), ONLY = (arg('only', '') || '').split(',').filter(Boolean);
const C = require('./criteria.js');                                                     // thresholds, each with its source (docs/ux/UX-CRITERIA.md)
const fx = require('../v6/fixture-menu.js');

// ---------- viewports: the phones Next Plate's clients hold ----------
const VIEWPORTS = QUICK
  ? [[320, 568, 'small iPhone (SE 1st gen)'], [360, 740, 'common Android'], [390, 844, 'iPhone 12-15'], [412, 915, 'large Android']]
  : [[320, 568, 'small iPhone (SE 1st gen)'], [360, 740, 'common Android'], [375, 667, 'iPhone 8 / SE 2-3'], [390, 844, 'iPhone 12-15'], [393, 851, 'Pixel'], [412, 915, 'large Android'], [430, 932, 'iPhone Pro Max']];
const WIDTHS = (arg('widths', '') || '').split(',').filter(Boolean).map(Number);
if (WIDTHS.length) VIEWPORTS.splice(0, VIEWPORTS.length, ...VIEWPORTS.filter(v => WIDTHS.includes(v[0])));
const SCHEMES = ['light', 'dark'];
const BIGTEXT = [[360, 740]];                                                                // Android text scaling, simulated at 130 %

// ---------- the day the states are seeded with ----------
const NOW = new Date('2026-11-12T13:10:00+05:30').getTime(), H = 36e5, D = 864e5;
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const week = []; for (let i = 1; i <= 5; i++) week.push({ t: NOW - i * D + 7 * H, type: 'had', meal: 'dinner', title: 'Dal, sabzi and phulka', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 });
const bf = { t: NOW - 4.5 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha with peanuts and curd', kcal: 350, protein: 9, carbs: 52, fats: 11, fiber: 5 };
const J = (s, b) => r => r.fulfill({ status: s, contentType: 'application/json', body: typeof b === 'string' ? b : JSON.stringify(b) });
const SLOW = async r => { await new Promise(x => setTimeout(x, 60000)); try { await r.continue(); } catch (e) {} };
const OFF = r => r.abort('internetdisconnected');
const seed = (o) => Object.assign({ p: P, c: {}, ev: week.concat([bf]) }, o || {});

const NOGRAIN = seed({ p: Object.assign({}, P, { health: 'none' }) });
// ---------- the surfaces and states ----------
// each: [name, seed, async (page, h) => bring the page to the state]; h has helpers
const STATES = [
  ['setup-1-goal-food', { p: {} }, async (p) => { const r = await p.evaluate(() => ({ n: document.querySelector('#region-n').getAttribute('aria-checked'), t: document.querySelector('#v-setup').innerText }));
    if (r.n !== 'false') throw new Error('a home food is chosen for the person before they answer'); if (!/Choose a goal, what you eat and your home food to go on/.test(r.t)) throw new Error('Next is off with no reason given'); }],
  ['setup-from-link', { p: {} }, async (p, h) => { const u = new URL(p.url()); u.search = '?k=LINKCODE1'; await p.goto(u.href, { waitUntil: 'domcontentloaded' }); await h.settle(400);
    const read = () => p.evaluate(() => ({ k: (JSON.parse(localStorage.getItem('np6') || 'null') || {}).k, q: location.search }));
    let r = await read(); if (r.k !== 'LINKCODE1' || r.q) throw new Error('the code from the link is not kept on the phone before set-up ends (' + JSON.stringify(r) + ')');
    await p.reload({ waitUntil: 'domcontentloaded' }); await h.settle(400); r = await read(); if (r.k !== 'LINKCODE1') throw new Error('the code from the link is lost after a reload during set-up');
    await p.goto(u.href, { waitUntil: 'domcontentloaded' }); await h.settle(400); if (!/link is saved on this phone/.test(await p.textContent('#v-setup'))) throw new Error('nothing says the coach\'s link was saved'); }],
  ['setup-2-health', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-diabetes'); await h.settle(); }],
  ['setup-3-body', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-none'); await p.click('#setup-next'); await h.settle(); }],
  ['plate-loading', seed(), async (p, h) => { await p.waitForSelector('.plate.wait', { timeout: 20000 }); await h.settle(300); }, (p, h) => h.slowApi(p, 60000)],
  ['plate-hero', seed(), async (p, h) => { await h.plate(p); }],
  // round 12: a plate saved on the phone before the declared grain field is not shown again; today's plate is made under the new rules
  ['plate-old-saved', seed({ store: { day: 20261112, shown: { breakfast: 'old', lunch: 'old', dinner: 'old', snack: 'old' }, res: { old: { meal: 'lunch', status: 'ok', read: '', hooks: {}, ask: '', at: NOW - H,
    meals: [{ title: 'Plate saved before the update', subtitle: '', items: [{ food: 'Paneer tikka', grams: 120, group: 'protein' }, { food: 'Palak', grams: 150, group: 'veg' }], kcal: 330, protein: 22, carbs: 10, fats: 22, fiber: 5, why: [], swaps: { protein: [], base: [] }, alchemy: {} }] } } } }),
    async (p, h) => { await h.plate(p); if (await p.evaluate(() => document.body.innerText.includes('Plate saved before the update'))) throw new Error('a plate saved before the grain field is still shown'); await h.next(p, { has: ['#remade'] }, 'A kept plate made again after an app change'); }],
  ['plate-leave-two', seed({ p: Object.assign({}, P, { leave: ['dairy', 'nut'] }) }), async (p, h) => { await h.plate(p); }],
  ['plate-dial-open', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-appetite'); await h.settle(); if (await p.$eval('#dial-appetite', b => b.getBoundingClientRect().right > innerWidth)) throw new Error('the appetite pill that closes the panel is off the screen'); }],
  ['plate-swap-open', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#adjust', { timeout: 20000 }); await p.click('#adjust'); await h.settle(); await h.next(p, { text: '(on your plate)' }, 'Swap: the option on the plate'); }],
  ['plate-one-tap-on', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#alc-glucose:not([disabled])', { timeout: 20000 }); await p.click('#alc-glucose'); await h.settle();
    const li = await p.evaluate(() => [...document.querySelectorAll('.measures li')].map(l => l.textContent).join(' | ')); if (!/160\s*g.*changed/i.test(li)) throw new Error('the serving list does not show the grain grams after the sugar change (' + li + ')'); }],
  ['plate-logged', seed(), async (p, h) => { await h.plate(p); await p.click('#have'); await h.settle(900); }],
  ['plate-skipped-meds', seed({ p: Object.assign({}, P, { meds: 'yes' }) }), async (p, h) => { await h.plate(p); await p.click('#log-skip'); await h.settle(900);
    // owner, 14 Nov: the warning ends with what to do now, on the card and in the spoken line
    const r = await p.evaluate(() => ({ card: (document.querySelector('#v-plate .logged .note') || {}).textContent || '', said: document.getElementById('said').textContent }));
    const now = /If you feel shaky, sweaty or dizzy, have something sweet now, such as a glass of juice or 3 teaspoons of sugar in water, and call your doctor\./;
    if (!now.test(r.card) || !now.test(r.said)) throw new Error('the low-sugar warning does not say what to do now (card: ' + now.test(r.card) + ', spoken: ' + now.test(r.said) + ')'); }],
  ['plate-error', seed(), async (p, h) => { await p.waitForSelector('#remake', { timeout: 20000 }); await h.settle(); }, (p, h) => h.failApi(p)],
  // the page opened without the code from the coach's link (owner, 14 Nov: clearer message)
  ['plate-no-code', seed(), async (p, h) => { await p.waitForSelector('text=this phone remembers it', { timeout: 20000 }); await h.settle(); }, (p) => p.route('**/api/meals', r => r.fulfill({ status: 401, contentType: 'application/json', body: '{"code":"bad_key"}' }))],
  ['plate-blocked-kidney', seed({ p: Object.assign({}, P, { health: 'kidney' }) }), async (p, h) => { await h.settle(800); await h.next(p, { text: 'Plan your meals with your coach and doctor' }, 'Referred');
    // owner, 14 Nov: the referral card stays as it is, a heading, one paragraph and "Change my answers", with no added line
    const k = await p.evaluate(() => [...document.querySelector('#v-plate .empty-card').children].map(e => e.tagName + (e.tagName === 'BUTTON' ? ':' + e.textContent.trim() : '')).join(','));
    if (k !== 'SPAN,H2,P,BUTTON:Change my answers') throw new Error('the referral card changed (' + k + ')'); }],
  ['plate-blocked-preg', seed({ p: Object.assign({}, P, { health: 'preg' }) }), async (p, h) => { await h.settle(800); }],
  ['builder-blocked', seed({ p: Object.assign({}, P, { health: 'kidney' }) }), async (p, h) => { await h.settle(600); await p.click('#tab-build'); await h.settle(); if (/Build the plate/.test(await p.textContent('#v-build'))) throw new Error('a referred Builder still invites building a plate'); }],
  ['rescue-blocked', seed({ p: Object.assign({}, P, { health: 'preg' }) }), async (p, h) => { await h.settle(600); await p.click('#tab-rescue'); await h.settle(); }],
  ['builder-no-plate', seed(), async (p, h) => { await p.waitForSelector('#remake', { timeout: 20000 }); await p.click('#tab-build'); await h.settle(); }, (p, h) => h.failApi(p)],
  ['plate-no-body', seed({ p: Object.assign({}, P, { kg: 0, cm: 0, age: 0 }) }), async (p, h) => { await h.plate(p); await h.inView(p, '#not-sized', 'the line that the portions are not sized'); await h.next(p, { text: 'Add your age, height and weight' }, 'Plate without body details'); }],
  ['sheet-my-food', seed(), async (p, h) => { await h.plate(p); await p.click('#myfood'); await h.settle(); }],
  ['sheet-data-confirm', seed(), async (p, h) => { await h.plate(p); await p.click('#myfood'); await h.settle(); await p.click('#wipe'); await h.settle(); await h.inView(p, '#wipe-q', 'the remove-data question'); }],
  ['sheet-how-numbers', seed(), async (p, h) => { await h.plate(p); await p.click('#how'); await h.settle(); await h.next(p, { has: ['#day-head'], text: 'ask your coach' }, 'How the numbers are worked out'); }],
  ['sheet-log-ask', seed(), async (p, h) => { await h.plate(p); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd and pickle'); await h.settle(200); }],
  ['sheet-log-estimate', seed(), async (p, h) => { await h.plate(p); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await p.waitForSelector('#log-ok', { timeout: 20000 }); await h.settle(); }],
  ['plate-ask-limit', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', r => r.fulfill({ status: 429, contentType: 'application/json', body: '{"code":"limit_day"}' })); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(900); await h.next(p, { hasNot: ['#remake', '#ask-retry'], value: [['#askin', 'Something light with paneer']], text: 'They open again at' }, 'Ask at the daily limit with plates on screen'); await h.next(p, { has: ['#ask-lock'], hasNot: ['#prompt-0'] }, 'Asks at the daily limit'); }, () => {}],
  ['plate-ask-busy', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"code":"busy"}' })); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(900); await h.next(p, { has: ['#ask-retry'], value: [['#askin', 'Something light with paneer']], text: 'busy just now' }, 'Ask that failed with plates on screen'); await h.next(p, { text: 'Your ask \u201CSomething light with paneer\u201D didn\'t go through' }, 'Ask that failed names the ask'); await h.inView(p, '#ask-retry', 'Try again after a failed ask'); }, () => {}],
  ['plate-asked', seed(), async (p, h) => { await h.plate(p); await p.fill('#askin', 'Only eggs, spinach and bread at home'); await p.press('#askin', 'Enter'); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await h.settle(900); }],
  ['toast', seed(), async (p, h) => { await h.plate(p); await p.click('#have'); await h.settle(250); }],
  ['builder', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); }],
  ['builder-adjusted', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); await p.click('#st-greens-p'); await p.click('#st-greens-p'); await h.settle(); await h.next(p, { has: ['#ratio-changed'] }, 'Builder after a change not yet used'); }],
  ['rescue-entry', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await h.inView(p, '#rescue-lede', 'what Rescue gives'); await h.next(p, { has: ['#dish-cap'] }, 'Rescue start'); }],
  ['rescue-result', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Mutton biryani, full handi'); await p.press('#rin', 'Enter'); await h.settle(300); await h.inView(p, '#v-rescue .wait, #v-rescue .ans-read, #v-rescue .cmp', 'the Rescue wait line or answer'); await p.waitForSelector('.cmp', { timeout: 20000 }); await h.settle(900); await h.inView(p, '.cmp', 'the Rescue answer'); await h.next(p, { text: 'Moves you can make' }, 'Rescue answer'); }],
  ['rescue-wait', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', async r => { await new Promise(x => setTimeout(x, 60000)); try { await r.continue(); } catch (e) {} }); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(600); await h.inView(p, '#v-rescue .ans-read', 'the Rescue wait line'); if (!(await p.$eval('#mcam', b => b.disabled))) throw new Error('Read the menu looks ready during a wait'); }],
  ['rescue-error', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', r => r.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"upstream_error"}' })); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.inView(p, '#rescue-retry', 'Try again after a failed Rescue'); await h.next(p, { has: ['#rescue-retry'], value: [['#rin', 'Masala dosa with chutney']] }, 'Rescue after an upstream error'); }, () => {}],
  ['menu-wait', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', async r => { await new Promise(x => setTimeout(x, 60000)); try { await r.continue(); } catch (e) {} }); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(700); await h.inView(p, '#v-rescue .plate.wait', 'the menu wait card'); if (!(await p.$eval('#mcam', b => b.disabled))) throw new Error('Read the menu looks ready while the menu is read'); }],
  ['menu-error', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', r => r.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"upstream_error"}' })); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.inView(p, '#menu-retry', 'Try again after a failed menu read'); }, () => {}],
  ['rescue-busy', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"code":"busy"}' })); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.next(p, { has: ['#rescue-retry'], value: [['#rin', 'Masala dosa with chutney']], text: 'busy just now' }, 'Rescue when the engine is busy'); }, () => {}],
  ['rescue-limit', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', r => r.fulfill({ status: 429, contentType: 'application/json', body: '{"code":"limit_day"}' })); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.next(p, { hasNot: ['#rescue-retry'], value: [['#rin', 'Masala dosa with chutney']] }, 'Rescue at the daily limit'); }, () => {}],
  ['menu-unparsed', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', r => r.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"unparsed"}' })); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.next(p, { has: ['#menu-retry'], value: [['#mtext', fx.typed]], text: 'came back incomplete' }, 'Menu read when the reply came back broken'); await h.next(p, { has: ['#menu-retry.primary'], hasNot: ['#mgo.primary'] }, 'Menu: one main button'); }, () => {}],
  ['sheet-log-busy', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"code":"busy"}' })); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(800); await h.next(p, { has: ['#log-retry'], value: [['#login', '2 aloo paratha with curd']] }, 'Log when the engine is busy'); const fa = await p.evaluate(() => document.activeElement && document.activeElement.id); if (fa !== 'log-note') throw new Error('after an error the box, not the note, has focus (' + fa + ')'); }, () => {}],
  ['plate-limit', seed(), async (p, h) => { await p.waitForSelector('.empty-card h2', { timeout: 20000 }); await h.settle(); await h.next(p, { hasNot: ['#remake'], text: "today's new plates" }, 'Plate at the daily limit'); }, (p, h) => p.route('**/api/meals', r => r.fulfill({ status: 429, contentType: 'application/json', body: '{"code":"limit_day"}' }))],
  ['menu-nothing-fits', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok","orders":[]}' })); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.inView(p, '#v-rescue .note', 'the nothing-fits note'); }],
  ['sheet-log-error', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', r => r.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"upstream_error"}' })); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(800); await h.inView(p, '#log-retry', 'Try again after a failed log'); }, () => {}],
  ['menu-unreadable', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.setInputFiles('#mfile', path.join(ROOT, 'eval/v6/menu-blurred.jpg')); await p.waitForSelector('#v-rescue .note', { timeout: 20000 }); await h.settle(600); await h.inView(p, '#v-rescue .note', 'the unreadable-menu note'); await h.next(p, { has: ['#menu-photo-again', '#menu-type-instead'] }, 'Menu photo not read'); }],
  ['rescue-menu-typed', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await h.settle(300); await p.fill('#mtext', fx.typed); await h.settle(200); }],
  ['rescue-menu-order', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-card', { timeout: 20000 }); await h.settle(900); await h.inView(p, '#order-card', 'the menu order'); }],
  // round 28 (owner decision): the grain question on a menu order with diabetes, after "Yes" and after "No"
  ['menu-grain-yes', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-yes', { timeout: 20000 }); await p.click('#order-grain-yes'); await p.waitForSelector('#order-go'); await h.settle(600); await h.inView(p, '#order-card', 'the confirmed order'); }],
  ['menu-grain-no', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-no', { timeout: 20000 }); await p.click('#order-grain-no'); await h.settle(900);
    const f = await p.evaluate(() => { const a = document.activeElement; return !!a && !!a.closest && !!a.closest('#v-rescue .note'); }); if (!f) throw new Error('after the last No, focus is not on the note'); await h.next(p, { has: ['#menu-name-dish'], text: 'every order Next Plate picked from this menu' }, 'No grain left'); }],
  // round 29: "No" moves to an order with another grain; reading the menu again after "No" does not bring the same grain back
  ['menu-grain-next', seed(), async (p, h) => { await h.plate(p); const N = (k, pr) => ({ kcal: k, protein: pr, carbs: 40, fats: 16, fiber: 6 });
    await p.route('**/api/menu', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', place: 'North Indian restaurant', orders: [
      { name: 'Paneer Tikka', portion: '6 pieces, \u2248 180 g', ask: '', with: '1 Tandoori Roti', n: N(500, 28), fit: 92, rise: 'Gentle', grain: 'tandoori roti', planned: [] },
      { name: 'Dal Tadka', portion: '1 bowl, \u2248 300 g', ask: '', with: '1 Steamed Rice', n: N(520, 23), fit: 80, rise: 'Gentle', grain: 'steamed rice', planned: [] }], leave: [], tip: '', dropped: {}, hooks: {} }) }));
    await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-no', { timeout: 20000 });
    await p.click('#order-grain-no'); await p.waitForSelector('#order-grain-q'); await p.waitForSelector('#order-grain-said'); await h.settle(900); await h.inView(p, '#order-card', 'the next order');
    const top = await p.evaluate(() => { const r = document.getElementById('order-grain-said').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }); if (!top) throw new Error('after No, the "You said" line is not on screen');
    const f = await p.evaluate(() => document.activeElement && document.activeElement.id); if (f !== 'order-grain-q') throw new Error('after No, focus is on ' + f + ', not the next question'); }],
  ['menu-grain-again', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-no', { timeout: 20000 });
    await p.click('#order-grain-no'); await h.settle(400); if (!(await p.$('#mtext'))) await p.click('#mtype'); await h.settle(200); await p.fill('#mtext', fx.typed);
    await p.click('#mgo'); await p.waitForSelector('#menu-grain-undo', { timeout: 20000 }); await h.settle(900); await h.next(p, { text: '(your earlier answer)' }, 'Same menu after a No'); }],
  // round 30: "Change answer" after a No brings the orders back with the question
  ['menu-grain-undo', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-no', { timeout: 20000 });
    await p.click('#order-grain-no'); await p.waitForSelector('#menu-grain-undo'); await p.click('#menu-grain-undo'); await p.waitForSelector('#order-grain-q'); await h.settle(900); await h.inView(p, '#order-card', 'the order after Change answer'); }],
  // round 31: after a No, another menu asks again; a two-grain order asks one grain at a time
  ['menu-grain-other', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-no', { timeout: 20000 });
    await p.click('#order-grain-no'); await p.waitForSelector('#menu-grain-undo'); if (!(await p.$('#mtext'))) await p.click('#mtype'); await h.settle(200); await p.fill('#mtext', fx.typed + '\nLassi 80');
    await p.click('#mgo'); await p.waitForSelector('#order-grain-q', { timeout: 20000 }); if (await p.$('#order-grain-said')) throw new Error('a No from another menu is still shown'); await h.settle(900); await h.inView(p, '#order-card', 'the order on the other menu'); }],
  ['menu-grain-two', seed(), async (p, h) => { await h.plate(p); const N = (k, pr) => ({ kcal: k, protein: pr, carbs: 40, fats: 16, fiber: 6 });
    await p.route('**/api/menu', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', place: 'North Indian restaurant', orders: [
      { name: 'Dal Tadka', portion: '1 bowl, \u2248 300 g', ask: '', with: 'Steamed Rice and 1 Roti', n: N(560, 24), fit: 84, rise: 'Gentle', grain: 'steamed rice and roti', planned: [] },
      { name: 'Paneer Tikka', portion: '6 pieces, \u2248 180 g', ask: '', with: '1 Roti', n: N(500, 28), fit: 80, rise: 'Gentle', grain: 'roti', planned: [] }], leave: [], tip: '', dropped: {}, hooks: {} }) }));
    await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-q', { timeout: 20000 });
    const q1 = await p.textContent('#order-grain-q'); if (!/^Is steamed rice available now\?$/.test(q1)) throw new Error('first question: ' + q1);
    await p.click('#order-grain-yes'); await h.settle(300); const q2 = await p.textContent('#order-grain-q'); if (!/^Is roti available now\?$/.test(q2)) throw new Error('second question: ' + q2);
    await h.settle(600); await h.inView(p, '#order-card', 'the second grain question'); await h.next(p, { has: ['#order-grain-ok'] }, 'Second grain question'); }],
  // ---- every other screen a client can reach (screen inventory, 14 Nov) ----
  ['setup-2-none', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-none'); await h.settle(); }],
  ['plate-dial-goal', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-goal'); await h.settle(); }],
  ['plate-dial-mode', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-mode'); await h.settle(); }],
  ['plate-dial-cuisine', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-cuisine'); await h.settle(); }],
  ['plate-dial-mood', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-mood'); await h.settle(); }],
  ['plate-dial-cook', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-cook'); await h.settle(); }],
  ['plate-dial-focus', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-focus'); await h.settle(); }],
  ['plate-moved-on', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-mood'); await p.click('#mood-quick'); await h.settle(); await h.inView(p, '#remake', 'Plan my plates after a change'); }],
  ['plate-goal-toast', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-goal'); await p.click('#goal-hold'); await h.settle(250); }],
  ['plate-tune-wait', seed(), async (p, h) => { await h.plate(p); }, (p) => p.route('**/api/tune', SLOW)],
  ['plate-tune-failed', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#alc-off', { timeout: 20000 }); await h.settle(); await h.next(p, { hasNot: ['.tbtn[disabled]'] }, 'One-tap changes that are not offered'); }, (p) => p.route('**/api/tune', J(502, '{"code":"upstream_error"}'))],
  ['plate-swapped', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#adjust', { timeout: 20000 }); await p.click('#adjust'); await p.click('#swp-1'); await h.settle(); }],
  ['plate-reopened', seed(), async (p, h) => { await h.plate(p); await p.click('#have'); await h.settle(900); await p.click('#slot-change'); await h.settle(250); }],
  ['plate-last-meal', seed(), async (p, h) => { await h.plate(p); await p.click('#meal-dinner'); await h.plate(p); await p.click('#have'); await h.settle(900); }],
  ['plate-bp', seed({ p: Object.assign({}, P, { health: 'bp' }) }), async (p, h) => { await h.plate(p); }],
  ['plate-ask-wait', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', SLOW); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(600); }],
  ['plate-refer', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', J(200, { status: 'refer', read: 'This one is for your coach and doctor to plan with you.', meals: [] })); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await p.waitForSelector('.empty-card #back', { timeout: 20000 }); await h.settle(); }],
  ['plate-empty', seed(), async (p, h) => { await p.waitForSelector('#remake', { timeout: 20000 }); await h.settle(); await h.next(p, { has: ['#remake'], text: 'fit your food rules' }, 'Plate when nothing fit'); }, (p) => p.route('**/api/meals', J(200, '{"status":"empty","meals":[]}'))],
  ['plate-error-last', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-mood'); await p.click('#mood-quick'); await h.settle(); await h.failApi(p); await p.click('#remake'); await h.settle(900); await h.next(p, { has: ['#remake', '#lastplates'] }, 'Plate error with last plates'); }, () => {}],
  ['plate-offline', seed(), async (p, h) => { await p.waitForSelector('#remake', { timeout: 20000 }); await h.settle(); await h.next(p, { has: ['#remake'], text: 'Check your signal' }, 'Plate offline'); }, (p) => p.route('**/api/meals', OFF)],
  ['plate-limit-phone', seed(), async (p, h) => { await p.waitForSelector('.empty-card h2', { timeout: 20000 }); await h.settle(); await h.next(p, { hasNot: ['#remake'], text: 'on this phone' }, 'Plate at the phone limit'); }, (p) => p.route('**/api/meals', J(429, '{"code":"limit_ip"}'))],
  ['plate-not-set-up', seed(), async (p, h) => { await p.waitForSelector('.empty-card h2', { timeout: 20000 }); await h.settle(); await h.next(p, { hasNot: ['#remake'] }, 'Plate not set up'); }, (p) => p.route('**/api/meals', J(503, '{"code":"not_set_up"}'))],
  ['plate-ask-empty', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', J(200, '{"status":"empty","meals":[]}')); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(900); await h.next(p, { has: ['#ask-retry'], value: [['#askin', 'Something light with paneer']], text: 'Showing the plates from before' }, 'Ask with nothing that fit'); }],
  ['plate-ask-offline', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', OFF); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(900); await h.next(p, { has: ['#ask-retry'], text: 'Check your signal' }, 'Ask offline'); }, () => {}],
  ['plate-ask-no-code', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/meals', J(401, '{"code":"bad_key"}')); await p.fill('#askin', 'Something light with paneer'); await p.press('#askin', 'Enter'); await h.settle(900); await h.next(p, { hasNot: ['#ask-retry'], text: 'this phone remembers it' }, 'Ask without the code'); }, () => {}],
  ['sheet-log-wait', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', SLOW); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(400); }],
  ['sheet-log-not-meal', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', J(200, '{"status":"empty"}')); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(800); await h.next(p, { hasNot: ['#log-retry'], value: [['#login', '2 aloo paratha with curd']], text: "didn't read as a meal" }, 'Log not read as a meal'); }],
  ['sheet-log-limit', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', J(429, '{"code":"limit_day"}')); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(800); await h.next(p, { hasNot: ['#log-retry'] }, 'Log at the limit'); }, () => {}],
  ['sheet-log-offline', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/log', OFF); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await h.settle(800); await h.next(p, { has: ['#log-retry'], text: 'Check your signal' }, 'Log offline'); }, () => {}],
  ['plate-log-counted', seed(), async (p, h) => { await h.plate(p); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await p.waitForSelector('#log-ok', { timeout: 20000 }); await p.click('#log-ok'); await h.settle(250); }],
  ['builder-ratio-set', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); await p.click('#preset-post'); await p.click('#make-ratio'); await h.plate(p); await p.click('#tab-build'); await h.settle(); }],
  ['builder-habits', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); await p.click('#hab-veg'); await p.click('#hab-walk'); await h.settle(); }],
  ['builder-no-body', seed({ p: Object.assign({}, P, { kg: 0, cm: 0, age: 0 }) }), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); }],
  ['rescue-refer', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', J(200, '{"status":"refer","read":"This one is for your coach and doctor to plan with you."}')); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.inView(p, '#v-rescue .empty-card', 'the referral'); }],
  ['rescue-empty', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', J(200, '{"status":"empty"}')); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.next(p, { hasNot: ['#rescue-retry'], value: [['#rin', 'Masala dosa with chutney']], text: "didn't come back as a dish" }, 'Rescue not a dish'); }],
  ['rescue-offline', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', OFF); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.next(p, { has: ['#rescue-retry'], text: 'Check your signal' }, 'Rescue offline'); }, () => {}],
  ['rescue-no-code', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/rescue', J(401, '{"code":"bad_key"}')); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Masala dosa with chutney'); await p.press('#rin', 'Enter'); await h.settle(800); await h.next(p, { hasNot: ['#rescue-retry'], text: 'this phone remembers it' }, 'Rescue without the code'); }, () => {}],
  ['plate-rescued', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Mutton biryani, full handi'); await p.press('#rin', 'Enter'); await p.waitForSelector('#rescue-had', { timeout: 20000 }); await p.click('#rescue-had'); await h.settle(250); }],
  ['menu-no-grain', NOGRAIN, async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-go', { timeout: 20000 }); await h.settle(900); await h.inView(p, '#order-card', 'the order'); }],
  ['menu-other-order', NOGRAIN, async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-alt-1', { timeout: 20000 }); await p.click('#order-alt-1'); await h.settle(900); await h.inView(p, '#order-card', 'the order picked'); }],
  ['menu-closest', NOGRAIN, async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(200, { status: 'ok', place: 'North Indian restaurant', orders: [{ name: 'Paneer Butter Masala', portion: '1 bowl, ≈ 300 g', ask: '', with: '2 Butter Naan', n: { kcal: 1150, protein: 30, carbs: 110, fats: 62, fiber: 6 }, fit: 22, rise: 'Sharp', grain: '', planned: [] }], leave: [], tip: '', dropped: {}, hooks: {}, note: 'Nothing on this menu fits your lunch well. This is the closest. As served it runs ≈ 500 kcal over what this lunch should carry.', moves: [{ kind: 'portion', title: 'Eat about half and pack the rest', scale: 0.5 }, { kind: 'move', title: 'A 15-minute walk after the meal' }] }));
    await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-move-0', { timeout: 20000 }); await p.click('#order-move-0'); await h.settle(900); await h.inView(p, '#v-rescue .note', 'the closest-order note'); }],
  ['menu-refer', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(200, '{"status":"refer","read":"This one is for your coach and doctor to plan with you."}')); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.inView(p, '#v-rescue .empty-card', 'the menu referral'); }],
  ['menu-photo-order', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.setInputFiles('#mfile', path.join(ROOT, 'demo/reel/film5/assets/menu-photo.jpg')); await p.waitForSelector('#order-card', { timeout: 20000 }); await h.settle(900); await h.inView(p, '#order-card', 'the order from a photo'); }],
  ['menu-photo-error', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(502, '{"code":"upstream_error"}')); await p.click('#tab-rescue'); await h.settle(); await p.setInputFiles('#mfile', path.join(ROOT, 'demo/reel/film5/assets/menu-photo.jpg')); await h.settle(1200); await h.next(p, { has: ['#menu-retry'], hasNot: ['#mtext'] }, 'Photo menu after an upstream error'); }, () => {}],
  ['menu-photos-off', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(400, '{"code":"photos_off"}')); await p.click('#tab-rescue'); await h.settle(); await p.setInputFiles('#mfile', path.join(ROOT, 'demo/reel/film5/assets/menu-photo.jpg')); await h.settle(1200); await h.next(p, { hasNot: ['#menu-retry'] }, 'Photos off'); }, () => {}],
  ['menu-bad-image', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.setInputFiles('#mfile', { name: 'menu.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not an image') }); await h.settle(800); await h.next(p, { hasNot: ['#menu-retry'] }, 'A file that is not a photo'); }],
  ['menu-busy', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(503, '{"code":"busy"}')); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.next(p, { has: ['#menu-retry'], value: [['#mtext', fx.typed]] }, 'Menu busy'); }, () => {}],
  ['menu-limit', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(429, '{"code":"limit_day"}')); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.next(p, { hasNot: ['#menu-retry'], value: [['#mtext', fx.typed]] }, 'Menu at the limit'); }, () => {}],
  ['menu-offline', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', OFF); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.next(p, { has: ['#menu-retry'], value: [['#mtext', fx.typed]], text: 'Check your signal' }, 'Menu offline'); }, () => {}],
  ['menu-no-code', seed(), async (p, h) => { await h.plate(p); await p.route('**/api/menu', J(401, '{"code":"bad_key"}')); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await h.settle(800); await h.next(p, { hasNot: ['#menu-retry'], text: 'this phone remembers it' }, 'Menu without the code'); }, () => {}],
  ['plate-ordered', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-yes', { timeout: 20000 }); await p.click('#order-grain-yes'); await p.click('#order-go'); await h.settle(250); }],
  // ---- fixes from the screen-by-screen review (14 Nov) ----
  ['setup-2-two-conditions', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-diabetes'); await p.click('#health-kidney'); await p.click('#meds-yes'); await h.settle();
    const on = await p.evaluate(() => ['diabetes', 'kidney'].every(k => document.querySelector('#health-' + k).getAttribute('aria-checked') === 'true')); if (!on) throw new Error('two health answers cannot both be ticked'); }],
  ['plate-two-conditions-referred', seed({ p: Object.assign({}, P, { health: 'kidney', conds: ['diabetes', 'kidney'], meds: 'yes' }) }), async (p, h) => { await h.settle(800);
    const t = await p.textContent('#v-plate'); if (!/kidney condition/.test(t) || await p.$('#have')) throw new Error('diabetes with a kidney condition is not referred'); }],
  ['setup-3-feet', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-none'); await p.click('#setup-next'); await h.settle(); await p.fill('#body-cm', '5.4'); await p.press('#body-cm', 'Tab'); await h.settle(300);
    const m = await p.textContent('#body-cm-msg'); if (!/5 ft 4 in: 163 cm/.test(m)) throw new Error('5.4 is not read as feet and inches (' + m + ')'); }],
  ['plate-skipped-meds-no-body', seed({ p: Object.assign({}, P, { meds: 'yes', kg: 0, cm: 0, age: 0 }) }), async (p, h) => { await h.plate(p); await p.click('#log-skip'); await h.settle(900);
    const t = await p.textContent('#v-plate'); if (!/a skipped meal can drop your sugar/.test(t)) throw new Error('no low-sugar warning without height and weight'); }],
  ['sheet-food-closed-by-band', seed(), async (p, h) => { await h.plate(p); const ats = () => p.evaluate(() => Object.values((JSON.parse(localStorage.getItem('np6')) || {}).store.res || {}).map(r => r.at));
    const a0 = await ats(); await p.click('#myfood'); await h.settle(); await p.click('#leave-nut'); await p.keyboard.press('Escape'); await h.settle(300); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await h.settle(600);
    const a1 = await ats(); if (!a1.length || a1.some(t => a0.includes(t))) throw new Error('answers changed and the sheet closed without Done, but the old plates stay'); }],
  ['sheet-food-done-no-change', seed(), async (p, h) => { await h.plate(p); const ats = () => p.evaluate(() => Object.values((JSON.parse(localStorage.getItem('np6')) || {}).store.res || {}).map(r => r.at).join());
    const a0 = await ats(); await p.click('#myfood'); await h.settle(); await p.click('#sheet-done'); await h.settle(600); if (await ats() !== a0) throw new Error('Done with no change threw away the plates'); }],
  ['setup-2-referred', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#region-n'); await p.click('#setup-next'); await p.click('#health-diabetes'); await p.click('#health-kidney'); await h.settle();
    if ((await p.textContent('#setup-next')).trim() !== 'Done' || !(await p.$('#setup-refer'))) throw new Error('a referred answer still leads to the body step');
    await p.click('#setup-next'); await h.settle(); if (await p.$('#body-age') || !/kidney condition/.test(await p.textContent('#v-plate'))) throw new Error('Done does not end set-up on the referral'); }],
  ['setup-after-remove', seed(), async (p, h) => { await h.plate(p); await p.click('#myfood'); await h.settle(); await p.click('#wipe'); await h.settle();
    await p.evaluate(() => { const c = sessionStorage.clear.bind(sessionStorage); sessionStorage.clear = () => { c(); sessionStorage.setItem('seeded', '1'); }; });   // the review re-seeds a page whose session is cleared
    await Promise.all([p.waitForNavigation({ waitUntil: 'domcontentloaded' }), p.click('#wipe-yes')]); await h.settle(600);
    if (!/Your data was removed from this phone/.test(await p.textContent('#v-setup'))) throw new Error('set-up after removing the data says nothing'); }],
  ['plate-appetite-moved', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-appetite'); await h.settle(); await p.evaluate(() => { const r = document.getElementById('appetite'); r.value = '10'; r.dispatchEvent(new Event('change')); }); await h.settle(); await h.inView(p, '#remake', 'Plan my plates after the appetite moved'); }],
  ['plate-asked-logged', seed(), async (p, h) => { await h.plate(p); await p.fill('#askin', 'Only eggs, spinach and bread at home'); await p.press('#askin', 'Enter'); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await h.settle(600); await p.click('#have'); await h.settle(900);
    if (!(await p.$('#slot-change')) || await p.$('#have')) throw new Error('an asked plate, once eaten, does not show as eaten'); }],
  ['plate-loading-asks', seed(), async (p, h) => { await p.waitForSelector('.plate.wait', { timeout: 20000 }); await h.settle(300); if (!(await p.$eval('#askgo', b => b.disabled)) || !(await p.$('#ask-wait'))) throw new Error('asks look ready while the plate is being made'); }, (p, h) => h.slowApi(p, 60000)],
  ['menu-grain-yes-then-no', seed(), async (p, h) => { await h.plate(p); const N = (k, pr) => ({ kcal: k, protein: pr, carbs: 40, fats: 16, fiber: 6 });
    await p.route('**/api/menu', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', place: 'North Indian restaurant', orders: [
      { name: 'Dal Tadka', portion: '1 bowl, \u2248 300 g', ask: '', with: 'Steamed Rice and 1 Roti', n: N(560, 24), fit: 84, rise: 'Gentle', grain: 'steamed rice and roti', planned: [] },
      { name: 'Paneer Tikka', portion: '6 pieces, \u2248 180 g', ask: '', with: '1 Roti', n: N(500, 28), fit: 80, rise: 'Gentle', grain: 'roti', planned: [] }], leave: [], tip: '', dropped: {}, hooks: {} }) }));
    await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-q', { timeout: 20000 });
    await p.click('#order-grain-yes'); await h.settle(300); await p.click('#order-grain-no'); await h.settle(600);
    if (!/You said steamed rice is available, but roti is not available/.test(await p.textContent('#v-rescue'))) throw new Error('after Yes then No the note forgets the Yes'); }],
  // owner, 14 Nov: Yes to rice, then No to roti on one order: the order is set aside, the next one offered, and the trace line says why
  ['menu-grain-yes-then-no-next', seed(), async (p, h) => { await h.plate(p); const N = (k, pr) => ({ kcal: k, protein: pr, carbs: 40, fats: 16, fiber: 6 });
    await p.route('**/api/menu', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', place: 'North Indian restaurant', orders: [
      { name: 'Dal Tadka', portion: '1 bowl, \u2248 300 g', ask: '', with: 'Steamed Rice and 1 Roti', n: N(560, 24), fit: 84, rise: 'Gentle', grain: 'steamed rice and roti', planned: [] },
      { name: 'Rajma', portion: '1 bowl, \u2248 250 g', ask: '', with: 'Steamed Rice', n: N(520, 20), fit: 80, rise: 'Gentle', grain: 'steamed rice', planned: [] }], leave: [], tip: '', dropped: {}, hooks: {} }) }));
    await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-grain-q', { timeout: 20000 });
    await p.click('#order-grain-yes'); await h.settle(300); await p.click('#order-grain-no'); await h.settle(600);
    const r = await p.evaluate(() => ({ said: (document.getElementById('order-grain-said') || {}).textContent || '', dish: (document.querySelector('#order-card .dish') || {}).textContent || '' }));
    if (r.dish !== 'Rajma') throw new Error('after Yes then No the next order is not offered (' + r.dish + ')');
    if (!/Dal Tadka needs roti too, so it is set aside\./.test(r.said)) throw new Error('the trace line does not say why the order was set aside (' + r.said + ')'); }],
  ['plate-blocked-change', seed({ p: Object.assign({}, P, { health: 'kidney' }) }), async (p, h) => { await h.settle(800); await p.click('#v-plate .empty-card .btn'); await h.settle(600);
    const f = await p.evaluate(() => document.activeElement && document.activeElement.id); if (f !== 'health-kidney') throw new Error('Change my answers does not open at the health question (' + f + ')'); }],
  ['plate-no-body-add', seed({ p: Object.assign({}, P, { kg: 0, cm: 0, age: 0 }) }), async (p, h) => { await h.plate(p); await p.click('#add-body-top'); await h.settle(600);
    const f = await p.evaluate(() => document.activeElement && document.activeElement.id); if (f !== 'body-age') throw new Error('Add your age, height and weight does not open at the age box (' + f + ')'); }],
].filter(s => !ONLY.length || ONLY.includes(s[0]));

// ---------- servers ----------
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
async function servers() {
  const gp = await freePort(), ap = await freePort(), kids = [];
  kids.push(spawn('bun', ['test/v5/mock-gemini.ts'], { cwd: ROOT, env: Object.assign({}, process.env, { DELAY: '200', PORT: String(gp), MOCK_PORT: String(gp) }), stdio: 'ignore' }));
  kids.push(spawn('bun', ['src/v5/server.ts'], { cwd: ROOT, env: Object.assign({}, process.env, { GEMINI_BASE_URL: 'http://localhost:' + gp, GEMINI_API_KEY: 'mock', PAGE_FILE: PAGE, PORT: String(ap), ASKS_PER_PHONE: '99999', DAILY_ASKS: '99999' }), stdio: 'ignore' }));
  const base = 'http://localhost:' + ap + '/';
  for (let i = 0; i < 80; i++) { try { const r = await fetch(base); if (r.ok) return { base, kids }; } catch (e) {} await new Promise(r => setTimeout(r, 150)); }
  kids.forEach(k => k.kill()); throw new Error('server did not start');
}

// ---------- the checks, run inside the page ----------
function audit(T) {
  const out = [], W = innerWidth, VH = innerHeight;
  const vis = (e) => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; let a = e; while (a && a !== document.body) { const s = getComputedStyle(a); if (s.display === 'none' || Number(s.opacity) === 0 || a.hidden) return false; a = a.parentElement; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const decorative = (e) => !!e.closest('svg,.scribble,.sprig,.stamp,.vine,.band,.colophon');   // ornament; visible text hidden from screen readers is still measured
  const desc = (e) => { const id = e.id ? '#' + e.id : ''; const cls = typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''; const tx = (e.innerText || e.value || e.getAttribute('aria-label') || e.placeholder || '').replace(/\s+/g, ' ').trim().slice(0, 40); return e.tagName.toLowerCase() + id + cls + (tx ? ' "' + tx + '"' : ''); };
  const add = (rule, e, detail) => out.push({ rule, el: desc(e), detail });
  const scroller = (e) => { let a = e.parentElement; while (a && a !== document.body) { const s = getComputedStyle(a); if (/(auto|scroll)/.test(s.overflowX) && a.scrollWidth > a.clientWidth + 1) return a; a = a.parentElement; } return null; };
  const view = document.querySelector('.view:not([hidden]),section[id^="v-"]:not([hidden])') || document.body;
  const all = [...document.querySelectorAll('body *')].filter(e => !e.closest('script,style,template') && vis(e));
  const sheetUp = !!document.querySelector('#sheet:not([hidden])');
  const texty = all.filter(e => !decorative(e) && (!sheetUp || e.closest('#sheet') || e.closest('#toast')) && [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 0));
  const controls = all.filter(e => e.matches('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=radio],[role=checkbox],[role=tab]') && !e.closest('[aria-hidden="true"]') && (!sheetUp || e.closest('#sheet')));
  // 1 nothing wider than the phone
  const sc = document.getElementById('scroll'); if (sc && sc.scrollWidth > sc.clientWidth + 1) add('overflow-x', sc, `content ${sc.scrollWidth}px in ${sc.clientWidth}px`);
  if (document.documentElement.scrollWidth > W + 1) add('overflow-x', document.documentElement, `page ${document.documentElement.scrollWidth}px in ${W}px`);
  all.forEach(e => { if (decorative(e)) return; const r = e.getBoundingClientRect(); if ((r.right > W + 0.5 || r.left < -0.5) && !scroller(e) && getComputedStyle(e).position !== 'fixed') add('off-screen', e, `x ${Math.round(r.left)}..${Math.round(r.right)} of ${W}`); });
  // 2 no clipped text, no clipped placeholder
  texty.forEach(e => { const cs = getComputedStyle(e); if (e.clientWidth <= 2 || e.clientHeight <= 2) return; if (/(hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) { if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2) add('text-clipped', e, `${e.scrollWidth}x${e.scrollHeight} in ${e.clientWidth}x${e.clientHeight}`); } });
  all.forEach(e => { if (decorative(e) || e.closest('#toast')) return; const cs = getComputedStyle(e); if (!/^(block|flex|grid|inline-block|inline-flex|list-item|table-cell)$/.test(cs.display) || e.clientWidth < 3) return;
    if (/(auto|scroll)/.test(cs.overflowX)) return; if (!(e.innerText || '').trim()) return;
    if ([...e.children].some(c => /^(block|flex|grid|list-item|table)$/.test(getComputedStyle(c).display))) return;   // a box of boxes: its children are measured themselves
    if (e.scrollWidth > e.clientWidth + 1 && !/(hidden|clip)/.test(cs.overflowX)) add('text-overflow', e, `content ${e.scrollWidth}px in a ${e.clientWidth}px box`); });
  document.querySelectorAll('svg text').forEach(t => { if (t.closest('.thali,.stamp,.vine,.sprig,[aria-hidden="true"]')) return; const r = t.getBoundingClientRect(); if (!r.width) return;
    const svg = t.ownerSVGElement, vb = svg.viewBox && svg.viewBox.baseVal, k = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1, fs = parseFloat(getComputedStyle(t).fontSize) * k;
    if (fs < T.minText - 0.01) add('text-too-small', t, `chart text ${fs.toFixed(1)}px < ${T.minText}px`); });
  all.filter(e => e.matches('input[placeholder],textarea[placeholder]')).forEach(e => { if (e.value) return; const cs = getComputedStyle(e), ph = getComputedStyle(e, '::placeholder'), c = document.createElement('canvas').getContext('2d');
    c.font = `${ph.fontStyle} ${ph.fontWeight} ${ph.fontSize} ${ph.fontFamily}`; const room = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); const need = c.measureText(e.placeholder).width;
    if (e.tagName === 'INPUT' && need > room + 1) add('placeholder-clipped', e, `needs ${Math.round(need)}px, has ${Math.round(room)}px`); });
  // 3 text and controls do not overlap each other (decoration excluded); the fixed composer and tabs never cover the last content
  const sheetOpen = [...document.querySelectorAll('#sheet')].some(x => !x.hidden && vis(x));
  const layer = (e) => { let a = e; while (a && a !== document.body) { const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky' || a.id === 'sheet' || a.id === 'toast') return a; a = a.parentElement; } return document.body; };
  const live = (e) => !sheetOpen || !!e.closest('#sheet');
  const shown = (e) => { let r = e.getBoundingClientRect(), L = r.left, T = r.top, R = r.right, B = r.bottom, a = e.parentElement;   // the part of the box its scroll areas let through
    while (a && a !== document.body) { const s = getComputedStyle(a); if (/(auto|scroll|hidden|clip)/.test(s.overflowX + s.overflowY)) { const q = a.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); } a = a.parentElement; }
    return R - L > 0.5 && B - T > 0.5 ? { left: L, top: T, right: R, bottom: B } : null; };
  const boxes = texty.concat(controls).filter(e => !decorative(e) && live(e) && !e.closest('#toast,.said')).map(e => [e, shown(e), layer(e)]).filter(x => x[1]);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const [a, ra, fa] = boxes[i], [b, rb, fb] = boxes[j]; if (fa !== fb) continue; if (a.contains(b) || b.contains(a)) continue;
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ox > T.overlapPx && oy > T.overlapPx) add('overlap', a, `overlaps ${desc(b)} by ${Math.round(ox)}x${Math.round(oy)}px`); }
  // 4 type size and face
  texty.forEach(e => { const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize), fam = cs.fontFamily.toLowerCase();
    const isInput = e.matches('input,textarea,select');
    if (fs < T.minText - 0.01) add('text-too-small', e, `${fs}px < ${T.minText}px`);
    if (/caveat|bradley|cursive/.test(fam.split(',')[0]) && fs < T.minHand - 0.01) add('handwriting-too-small', e, `${fs}px < ${T.minHand}px in a handwriting face`);
    if (/caveat|bradley|cursive/.test(fam.split(',')[0]) && /\d/.test(e.innerText || '') && !e.closest('.scribble')) add('handwriting-figures', e, 'figures set in a handwriting face'); });
  all.filter(e => e.matches('input,textarea,select')).forEach(e => { const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 16) add('input-zoom', e, `${fs}px input: iOS zooms the page on focus below 16px`); });
  // 5 contrast (WCAG 2.2 AA: 4.5:1, 3:1 for large text)
  const rgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const mix = (top, bot) => [0, 1, 2].map(i => top[i] * top[3] + bot[i] * (1 - top[3])).concat([1]);
  const bgOf = (e) => { const stack = []; let a = e; while (a) { const cs = getComputedStyle(a); const g = cs.backgroundImage.match(/rgba?\([^)]+\)/g); if (g && /gradient/.test(cs.backgroundImage)) { stack.push({ grad: g.map(rgb) }); break; } const c = rgb(cs.backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } a = a.parentElement; }
    let base = [255, 255, 255, 1]; const last = stack[stack.length - 1]; if (last && last.grad) { return last.grad.map(g => mix(g, base)); } for (let i = stack.length - 1; i >= 0; i--) base = mix(stack[i], base); return [base]; };
  texty.forEach(e => { const cs = getComputedStyle(e); const fg = rgb(cs.color); if (!fg) return; const fs = parseFloat(cs.fontSize), wt = Number(cs.fontWeight) || 400; const large = fs >= 24 || (fs >= 18.66 && wt >= 700);
    const need = large ? T.contrastLarge : T.contrastText; const worst = Math.min(...bgOf(e).map(bg => { const f = mix(fg, bg); const L1 = lum(f), L2 = lum(bg); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); }));
    if (worst < need - 0.005) add('contrast', e, `${worst.toFixed(2)}:1 < ${need}:1 (${cs.color} at ${fs}px)`); });
  all.filter(e => e.matches('input[placeholder],textarea[placeholder]')).forEach(e => { if (e.value) return; const ph = rgb(getComputedStyle(e, '::placeholder').color); if (!ph) return; const bg = bgOf(e)[0], f = mix(ph, bg); const r = (Math.max(lum(f), lum(bg)) + 0.05) / (Math.min(lum(f), lum(bg)) + 0.05); if (r < T.contrastText - 0.005) add('contrast', e, `placeholder ${r.toFixed(2)}:1 < ${T.contrastText}:1`); });
  // 6 touch targets
  controls.forEach(e => { if (e.matches('input[type=file]')) return; const r = e.getBoundingClientRect(); const inline = e.closest('p') && e.tagName === 'A';
    if (!inline && (r.width < T.target - 0.5 || r.height < T.target - 0.5)) add('target-small', e, `${Math.round(r.width)}x${Math.round(r.height)}px < ${T.target}x${T.target}px`); });
  // 7 every control and image has a name
  controls.forEach(e => { const name = (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.innerText || e.value || e.title || (e.id && document.querySelector(`label[for="${e.id}"]`) ? 'label' : '') || (e.closest('label') ? 'label' : '')).trim(); if (!name) add('no-name', e, 'control has no accessible name'); });
  all.filter(e => e.matches('svg[role=img],img')).forEach(e => { if (!(e.getAttribute('aria-label') || e.getAttribute('alt'))) add('no-name', e, 'image has no text alternative'); });
  // 8 one palette: the journal paper, whatever the phone's dark-mode setting
  const bodyBg = rgb(getComputedStyle(document.body).backgroundColor); if (bodyBg && (Math.abs(bodyBg[0] - T.paper[0]) > 3 || Math.abs(bodyBg[1] - T.paper[1]) > 3 || Math.abs(bodyBg[2] - T.paper[2]) > 3)) add('palette', document.body, `page background ${getComputedStyle(document.body).backgroundColor}, expected the paper colour`);
  // 9 zoom is allowed
  const vm = document.querySelector('meta[name=viewport]'); if (vm && /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(vm.content)) add('zoom-blocked', vm, vm.content);
  // 10 the last thing on the page can scroll clear of the fixed composer and tabs
  if (sc) { const fixedTop = Math.min(...[...document.querySelectorAll('.composer,#tabs')].filter(vis).map(x => x.getBoundingClientRect().top), VH); const prev = sc.scrollTop; sc.scrollTop = sc.scrollHeight;
    const lastEls = [...sc.querySelectorAll('section:not([hidden]) > *')].filter(vis).filter(x => !x.matches('.composer') && !decorative(x)); const last = lastEls[lastEls.length - 1];
    if (last && last.getBoundingClientRect().bottom > fixedTop + 1) add('covered-at-end', last, `ends at ${Math.round(last.getBoundingClientRect().bottom)}px, fixed bar starts at ${Math.round(fixedTop)}px`); sc.scrollTop = prev; }
  return out;
}

// simulated Android text scaling: every font size grows by the factor, layout widths stay
function bigText(f) { const els = [...document.querySelectorAll('body *')], sz = els.map(e => { const cs = getComputedStyle(e); return [parseFloat(cs.fontSize), cs.lineHeight]; }); els.forEach((e, i) => { e.style.fontSize = sz[i][0] * f + 'px'; if (sz[i][1] !== 'normal') e.style.lineHeight = parseFloat(sz[i][1]) * f + 'px'; }); }

// A11 coverage comes from the code: every sheet, tab and setup step the app can show needs a state above (BD-93)
const COVER = { sheet: { food: 'sheet-my-food', targets: 'sheet-how-numbers', log: 'sheet-log-ask' }, confirm: ['sheet-data-confirm'], tab: { plate: 'plate-hero', build: 'builder', rescue: 'rescue-entry' } };
function coverage() {
  const app = fs.readFileSync(path.join(ROOT, 'src/v6/app.js'), 'utf8'), names = new Set(STATES.map(s => s[0])), miss = [];
  for (const m of new Set([...app.matchAll(/openSheet\("([a-z]+)"\)/g)].map(m => m[1]))) if (!COVER.sheet[m] || (!ONLY.length && !names.has(COVER.sheet[m]))) miss.push('sheet "' + m + '" has no review state');
  const markup = fs.readFileSync(path.join(ROOT, 'src/v5/markup.html'), 'utf8'), VIEW = { setup: 'setup-1-goal-food', plate: 'plate-hero', build: 'builder', rescue: 'rescue-entry' };
  for (const v of new Set([...markup.matchAll(/id="v-([a-z]+)"/g)].map(m => m[1]))) if (!VIEW[v] || (!ONLY.length && !names.has(VIEW[v]))) miss.push('view "v-' + v + '" has no review state');
  for (const t of Object.keys(COVER.tab)) if (!ONLY.length && !names.has(COVER.tab[t])) miss.push('tab "' + t + '" has no review state');
  const steps = (app.match(/UI\.step<2/g) || []).length ? 3 : 0; if (!ONLY.length && steps && !['setup-1-goal-food', 'setup-2-health', 'setup-3-body'].every(n => names.has(n))) miss.push('a setup step has no review state');
  return miss;
}
// feedback in view: the element exists, starts above the fixed bars (or the sheet bottom) and is not hidden under the masthead
// next-step (A13): after an error, Try again is there where it can help and absent where it cannot, the typed text stays, and the words fit the error
async function stepCheck(p, w) { return p.evaluate((w) => { const out = [];
  (w.has || []).forEach(s => { if (!document.querySelector(s)) out.push(s + ' missing'); });
  (w.hasNot || []).forEach(s => { if (document.querySelector(s)) out.push(s + ' offered where trying again cannot help'); });
  (w.value || []).forEach(([s, v]) => { const e = document.querySelector(s); if (!e || e.value !== v) out.push(s + ' lost what was typed (' + (e ? JSON.stringify(e.value) : 'no box') + ')'); });
  if (w.text && !document.body.innerText.toLowerCase().includes(w.text.toLowerCase())) out.push('the message does not say "' + w.text + '"');
  return out; }, w); }
async function inViewCheck(p, sel) { return p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(), bar = document.querySelector('#sheet:not([hidden])') ? innerHeight : Math.min(...[...document.querySelectorAll('#tabs,.composer')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect().top), innerHeight); return r.top < bar - 40 && r.bottom > 60; }, sel); }
// A12 drill: plant one fault per rule on a ready page and require the review to catch each one (BD-91)
async function drill(b, base) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, colorScheme: 'light' });
  await ctx.addInitScript(s => localStorage.setItem('np6', s), JSON.stringify(seed()));
  const p = await ctx.newPage(); await p.goto(base); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => {
    const v = document.getElementById('v-plate'), mk = (h) => { const d = document.createElement('div'); d.innerHTML = h; v.prepend(d.firstChild); };
    mk('<p style="font-size:10px">planted small text</p>');
    mk('<p style="width:600px;font-size:16px">planted wide box</p>');
    mk('<p style="color:#cfc6b8;background:#F2ECE1;font-size:16px">planted faint text</p>');
    mk('<button style="width:20px;height:20px;font-size:16px">x</button>');
    mk('<button id="planted-noname" style="width:48px;height:48px"></button>');
    mk('<p style="width:80px;height:20px;overflow:hidden;white-space:nowrap;font-size:16px">planted clipped text that runs on</p>');
    mk('<div style="position:relative;height:30px"><span style="font-size:16px">planted under</span><span style="position:absolute;left:0;top:0;font-size:16px">planted over</span></div>');
    mk('<p style="font-family:Caveat;font-size:26px">planted 450 kcal</p>');
    mk('<p style="font-family:Caveat;font-size:18px">planted pencil note</p>');
    mk('<input style="width:90px;font-size:16px" placeholder="planted hint far too long for this box">');
    mk('<input style="width:200px;font-size:14px" aria-label="planted small input">');
    mk('<div style="width:60px;font-size:16px;white-space:nowrap">planted run-on figure 1200 kcal</div>');
    mk('<svg viewBox="0 0 320 40" style="width:160px" role="img" aria-label="planted chart"><text x="4" y="20" style="font-size:12px">planted tiny chart label</text></svg>');
    const last = document.createElement('p'); last.style.cssText = 'font-size:16px;margin-bottom:-600px'; last.textContent = 'planted last line'; v.appendChild(last);
    const ans = document.createElement('p'); ans.id = 'planted-answer'; ans.style.cssText = 'font-size:16px;margin-top:2400px'; ans.textContent = 'planted answer'; v.insertBefore(ans, last);
    document.body.style.background = '#0B1211';
    const m = document.querySelector('meta[name=viewport]'); m.setAttribute('content', m.getAttribute('content') + ',user-scalable=no');
  });
  const res = await p.evaluate(audit, C.T); const hidden = !(await inViewCheck(p, '#planted-answer'));
  const step = await stepCheck(p, { has: ['#planted-retry'], hasNot: ['#planted-noname'], value: [['#rin', 'planted dish']], text: 'planted message' }); await ctx.close();
  const has = (rule, txt) => res.some(v => v.rule === rule && (v.el + ' ' + v.detail).includes(txt));
  const want = [['text-too-small', 'planted small text'], ['off-screen', 'planted wide box'], ['overflow-x', 'content'], ['contrast', 'planted faint text'], ['target-small', '"x"'],
    ['no-name', 'planted-noname'], ['text-clipped', 'planted clipped text'], ['overlap', 'planted over'], ['handwriting-figures', 'planted 450 kcal'], ['handwriting-too-small', 'planted pencil note'],
    ['placeholder-clipped', 'planted hint far'], ['input-zoom', 'planted small input'], ['text-overflow', 'planted run-on figure'], ['text-too-small', 'chart text'],
    ['covered-at-end', 'planted last line'], ['palette', 'body'], ['zoom-blocked', 'user-scalable']];
  const missed = want.filter(([r, t]) => !has(r, t)).map(([r, t]) => r + ' (' + t + ')');
  if (!hidden) missed.push('feedback-hidden (planted answer)');
  if (step.length !== 4) missed.push('next-step (planted missing retry, offered retry, lost text, wrong message: ' + step.length + ' of 4 caught)');
  return missed;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true }); let srv;
  if (!ONLY.length && !process.argv.includes('--drill')) fs.rmSync(path.join(OUT, 'screens'), { recursive: true, force: true });   // a full run leaves only its own screens
  const miss = coverage(); if (miss.length) { console.error('coverage gaps (A11):\n- ' + miss.join('\n- ')); }
  try { srv = await servers(); } catch (e) { console.error('review could not start:', e.message); process.exit(2); }
  const b = await chromium.launch(), results = [], pageErrors = [];
  if (process.argv.includes('--drill') || QUICK) { const missed = await drill(b, srv.base); if (missed.length) { console.error('drill (A12): planted faults not caught: ' + missed.join(', ')); b.close(); srv.kids.forEach(k => k.kill()); process.exit(2); } else console.log('drill (A12): every planted fault was caught'); if (process.argv.includes('--drill')) { await b.close(); srv.kids.forEach(k => k.kill()); process.exit(0); } }
  const h = {
    settle: async (ms) => { await new Promise(r => setTimeout(r, ms || 500)); },
    plate: async (p) => { await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await new Promise(r => setTimeout(r, 700)); },
    slowApi: async (p, ms) => { await p.route('**/api/meals', async r => { await new Promise(x => setTimeout(x, ms)); await r.continue(); }); },
    inView: async (p, sel, what) => { const ok = await inViewCheck(p, sel); if (!ok) (p.__late = p.__late || []).push({ rule: 'feedback-hidden', el: sel, detail: what + ' is not in view after the tap' }); },
    next: async (p, w, what) => { (await stepCheck(p, w)).forEach(d => (p.__late = p.__late || []).push({ rule: 'next-step', el: what, detail: d })); },
    failApi: async (p) => { await p.route('**/api/meals', r => r.fulfill({ status: 502, contentType: 'application/json', body: '{"code":"upstream_error"}' })); },
  };
  const runs = [];
  for (const [w, hgt, label] of VIEWPORTS) for (const scheme of SCHEMES) runs.push({ w, h: hgt, label, scheme, big: 1 });
  for (const [w, hgt] of BIGTEXT) runs.push({ w, h: hgt, label: 'common Android, text 130 %', scheme: 'light', big: C.T.bigText });
  const jobs = []; for (const run of runs) for (const st of STATES) jobs.push([run, st]);
  const one = async ([run, [name, sd, go, pre]]) => {
    const ctx = await b.newContext({ viewport: { width: run.w, height: run.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: run.scheme, timezoneId: 'Asia/Kolkata', locale: 'en-IN', reducedMotion: 'reduce' });
    await ctx.addInitScript(([s, now]) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('np6', s); sessionStorage.setItem('seeded', '1'); } const D0 = Date; }, [JSON.stringify(sd), NOW]);
    await ctx.clock.install({ time: new Date(NOW) }); await ctx.clock.resume();
    const p = await ctx.newPage(); p.on('pageerror', e => pageErrors.push(name + ': ' + e)); p.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text()) && !(pre && /Failed to load resource/.test(m.text()))) pageErrors.push(name + ': ' + m.text()); });
    let viol = [], err = '';
    try {
      if (pre) await pre(p, h);
      await p.goto(srv.base, { waitUntil: 'domcontentloaded' }); await p.evaluate(() => document.fonts.ready); await h.settle(400);
      await go(p, h);
      if (run.big !== 1) { await p.evaluate(bigText, run.big); await h.settle(300); }
      viol = await p.evaluate(audit, C.T); viol = viol.concat(p.__late || []);
      if (run.big !== 1) viol = viol.filter(v => C.BIGTEXT_RULES.includes(v.rule));            // at 130 % only layout breakage counts; sizes and contrast are judged at 100 %
      const dir = path.join(OUT, 'screens', `${run.w}-${run.scheme}${run.big !== 1 ? '-big' : ''}`); fs.mkdirSync(dir, { recursive: true });
      const sheetUp = await p.evaluate(() => !!document.querySelector('#sheet:not([hidden]) .sheet-card'));
      const scrollSel = sheetUp ? '#sheet .sheet-card' : '#scroll';
      const stops = await p.evaluate((sel) => { const s = document.querySelector(sel); if (!s) return [0]; if (sel === '#sheet .sheet-card' && document.activeElement && document.activeElement.id === 'wipe-keep') return [s.scrollTop]; const n = Math.min(14, Math.ceil(s.scrollHeight / (s.clientHeight * 0.9))); return [...Array(n).keys()].map(i => i * s.clientHeight * 0.9); }, scrollSel);
      for (let i = 0; i < stops.length; i++) { await p.evaluate(([sel, y]) => { const s = document.querySelector(sel); if (s) s.scrollTop = y; }, [scrollSel, stops[i]]); await h.settle(150); await p.screenshot({ path: path.join(dir, `${name}-${i + 1}.png`) }); }
    } catch (e) { err = String(e.message || e).split('\n')[0]; }
    // allowed exceptions (each with its reason) in test/ux/allow.json
    viol = viol.filter(v => !C.ALLOW.some(a => a.rule === v.rule && (!a.state || a.state === name) && v.el.includes(a.el)));
    results.push({ state: name, w: run.w, scheme: run.scheme, big: run.big, label: run.label, viol, err });
    await ctx.close();
  };
  const POOL = Number(arg('pool', '4')); let next = 0;
  await Promise.all([...Array(POOL)].map(async () => { while (next < jobs.length) await one(jobs[next++]); }));
  results.sort((a, b) => a.w - b.w || a.scheme.localeCompare(b.scheme) || a.big - b.big || a.state.localeCompare(b.state));
  await b.close(); srv.kids.forEach(k => k.kill());
  // report
  const bad = results.filter(r => r.viol.length || r.err), total = results.reduce((n, r) => n + r.viol.length, 0) + bad.filter(r => r.err).length;
  const byRule = {}; results.forEach(r => r.viol.forEach(v => { (byRule[v.rule] = byRule[v.rule] || []).push(r.state + ' @' + r.w + ' ' + r.scheme + (r.big !== 1 ? ' big' : '') + ': ' + v.el + ' — ' + v.detail); }));
  let md = `# Next Plate surface review\n\nPage: \`${PAGE}\` · ${new Date().toISOString().slice(0, 16)}Z · ${QUICK ? 'gate set' : 'full set'}\nRuns: ${runs.length} (viewport x scheme x text size) · States: ${STATES.length} · Checks: ${results.length}\n\n`;
  md += total ? `**${total} violations.**\n\n` : '**No violations.** Visual review of the screens is still required (docs/ux/UX-CRITERIA.md, part B).\n\n';
  for (const [rule, list] of Object.entries(byRule)) { const uniq = [...new Set(list)]; md += `## ${rule} (${uniq.length}) — ${C.RULES[rule] || ''}\n` + uniq.slice(0, 60).map(x => '- ' + x).join('\n') + (uniq.length > 60 ? `\n- … ${uniq.length - 60} more` : '') + '\n\n'; }
  const errs = results.filter(r => r.err); if (errs.length) md += '## states that could not be reached\n' + errs.map(r => `- ${r.state} @${r.w} ${r.scheme}: ${r.err}`).join('\n') + '\n\n';
  if (pageErrors.length) md += '## page errors\n' + [...new Set(pageErrors)].slice(0, 30).map(x => '- ' + x).join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, 'report.md'), md); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 1));
  console.log(md.split('\n').slice(0, 6).join('\n')); console.log('report:', path.relative(ROOT, path.join(OUT, 'report.md')));
  if (miss.length) md += '## coverage gaps (A11)\n' + miss.map(x => '- ' + x).join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, 'report.md'), md);
  process.exit(total || pageErrors.length || miss.length ? 1 : 0);
})();
