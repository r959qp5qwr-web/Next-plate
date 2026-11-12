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
const SCHEMES = ['light', 'dark'];
const BIGTEXT = [[360, 740]];                                                                // Android text scaling, simulated at 130 %

// ---------- the day the states are seeded with ----------
const NOW = new Date('2026-11-12T13:10:00+05:30').getTime(), H = 36e5, D = 864e5;
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const week = []; for (let i = 1; i <= 5; i++) week.push({ t: NOW - i * D + 7 * H, type: 'had', meal: 'dinner', title: 'Dal, sabzi and phulka', kcal: 520, protein: 16, carbs: 80, fats: 12, fiber: 12 });
const bf = { t: NOW - 4.5 * H, type: 'had', meal: 'breakfast', title: 'Vegetable poha with peanuts and curd', kcal: 350, protein: 9, carbs: 52, fats: 11, fiber: 5 };
const seed = (o) => Object.assign({ p: P, c: {}, ev: week.concat([bf]) }, o || {});

// ---------- the surfaces and states ----------
// each: [name, seed, async (page, h) => bring the page to the state]; h has helpers
const STATES = [
  ['setup-1-goal-food', { p: {} }, async () => {}],
  ['setup-2-health', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#setup-next'); await p.click('#health-diabetes'); await h.settle(); }],
  ['setup-3-body', { p: {} }, async (p, h) => { await p.click('#goal-lose'); await p.click('#diet-veg'); await p.click('#setup-next'); await p.click('#health-none'); await p.click('#setup-next'); await h.settle(); }],
  ['plate-loading', seed(), async (p, h) => { await p.waitForSelector('.plate.wait', { timeout: 20000 }); await h.settle(300); }, (p, h) => h.slowApi(p, 60000)],
  ['plate-hero', seed(), async (p, h) => { await h.plate(p); }],
  ['plate-dial-open', seed(), async (p, h) => { await h.plate(p); await p.click('#dial-appetite'); await h.settle(); }],
  ['plate-swap-open', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#adjust', { timeout: 20000 }); await p.click('#adjust'); await h.settle(); }],
  ['plate-one-tap-on', seed(), async (p, h) => { await h.plate(p); await p.waitForSelector('#alc-glucose:not([disabled])', { timeout: 20000 }); await p.click('#alc-glucose'); await h.settle(); }],
  ['plate-logged', seed(), async (p, h) => { await h.plate(p); await p.click('#have'); await h.settle(900); }],
  ['plate-skipped-meds', seed({ p: Object.assign({}, P, { meds: 'yes' }) }), async (p, h) => { await h.plate(p); await p.click('#log-skip'); await h.settle(900); }],
  ['plate-error', seed(), async (p, h) => { await p.waitForSelector('#remake', { timeout: 20000 }); await h.settle(); }, (p, h) => h.failApi(p)],
  ['plate-blocked-kidney', seed({ p: Object.assign({}, P, { health: 'kidney' }) }), async (p, h) => { await h.settle(800); }],
  ['plate-no-body', seed({ p: Object.assign({}, P, { kg: 0, cm: 0, age: 0 }) }), async (p, h) => { await h.plate(p); }],
  ['sheet-my-food', seed(), async (p, h) => { await h.plate(p); await p.click('#myfood'); await h.settle(); }],
  ['sheet-how-numbers', seed(), async (p, h) => { await h.plate(p); await p.click('#how'); await h.settle(); }],
  ['sheet-log-ask', seed(), async (p, h) => { await h.plate(p); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd and pickle'); await h.settle(200); }],
  ['sheet-log-estimate', seed(), async (p, h) => { await h.plate(p); await p.click('#log-other'); await h.settle(); await p.fill('#login', '2 aloo paratha with curd'); await p.press('#login', 'Enter'); await p.waitForSelector('#log-ok', { timeout: 20000 }); await h.settle(); }],
  ['plate-asked', seed(), async (p, h) => { await h.plate(p); await p.fill('#askin', 'Only eggs, spinach and bread at home'); await p.press('#askin', 'Enter'); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await h.settle(900); }],
  ['toast', seed(), async (p, h) => { await h.plate(p); await p.click('#have'); await h.settle(250); }],
  ['builder', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); }],
  ['builder-adjusted', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-build'); await h.settle(); await p.click('#st-greens-p'); await p.click('#st-greens-p'); await h.settle(); }],
  ['rescue-entry', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); }],
  ['rescue-result', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.fill('#rin', 'Mutton biryani, full handi'); await p.press('#rin', 'Enter'); await p.waitForSelector('.cmp', { timeout: 20000 }); await h.settle(900); }],
  ['rescue-menu-typed', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await h.settle(300); await p.fill('#mtext', fx.typed); await h.settle(200); }],
  ['rescue-menu-order', seed(), async (p, h) => { await h.plate(p); await p.click('#tab-rescue'); await h.settle(); await p.click('#mtype'); await p.fill('#mtext', fx.typed); await p.click('#mgo'); await p.waitForSelector('#order-card', { timeout: 20000 }); await h.settle(900); }],
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
  const decorative = (e) => !!e.closest('[aria-hidden="true"],svg,.scribble,.sprig,.stamp,.vine,.band,.colophon');
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
  all.filter(e => e.matches('input[placeholder],textarea[placeholder]')).forEach(e => { if (e.value) return; const cs = getComputedStyle(e), ph = getComputedStyle(e, '::placeholder'), c = document.createElement('canvas').getContext('2d');
    c.font = `${ph.fontStyle} ${ph.fontWeight} ${ph.fontSize} ${ph.fontFamily}`; const room = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); const need = c.measureText(e.placeholder).width;
    if (e.tagName === 'INPUT' && need > room + 1) add('placeholder-clipped', e, `needs ${Math.round(need)}px, has ${Math.round(room)}px`); });
  // 3 text and controls do not overlap each other (decoration excluded); the fixed composer and tabs never cover the last content
  const sheetOpen = [...document.querySelectorAll('#sheet')].some(x => !x.hidden && vis(x));
  const layer = (e) => { let a = e; while (a && a !== document.body) { const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky' || a.id === 'sheet' || a.id === 'toast') return a; a = a.parentElement; } return document.body; };
  const live = (e) => !sheetOpen || !!e.closest('#sheet');
  const boxes = texty.concat(controls).filter(e => !decorative(e) && live(e) && !e.closest('#toast,.said')).map(e => [e, e.getBoundingClientRect(), layer(e)]);
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
function bigText(f) { document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e); e.style.fontSize = parseFloat(cs.fontSize) * f + 'px'; if (cs.lineHeight !== 'normal') e.style.lineHeight = parseFloat(cs.lineHeight) * f + 'px'; }); }

// A11 coverage comes from the code: every sheet, tab and setup step the app can show needs a state above (BD-93)
const COVER = { sheet: { food: 'sheet-my-food', targets: 'sheet-how-numbers', log: 'sheet-log-ask' }, tab: { plate: 'plate-hero', build: 'builder', rescue: 'rescue-entry' } };
function coverage() {
  const app = fs.readFileSync(path.join(ROOT, 'src/v6/app.js'), 'utf8'), names = new Set(STATES.map(s => s[0])), miss = [];
  for (const m of new Set([...app.matchAll(/openSheet\("([a-z]+)"\)/g)].map(m => m[1]))) if (!COVER.sheet[m] || (!ONLY.length && !names.has(COVER.sheet[m]))) miss.push('sheet "' + m + '" has no review state');
  for (const m of new Set([...app.matchAll(/\["(plate|build|rescue|[a-z]+)","(?:build|rescue|plate)","(?:rescue|plate|build)"\]/g)].map(m => m[0]))) {}
  for (const t of Object.keys(COVER.tab)) if (!ONLY.length && !names.has(COVER.tab[t])) miss.push('tab "' + t + '" has no review state');
  const steps = (app.match(/UI\.step<2/g) || []).length ? 3 : 0; if (!ONLY.length && steps && !['setup-1-goal-food', 'setup-2-health', 'setup-3-body'].every(n => names.has(n))) miss.push('a setup step has no review state');
  return miss;
}
// A12 drill: plant one fault per rule on a ready page and require the review to catch each one (BD-91)
async function drill(b, base) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true, colorScheme: 'light' });
  await ctx.addInitScript(s => localStorage.setItem('np6', s), JSON.stringify(seed()));
  const p = await ctx.newPage(); await p.goto(base); await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await new Promise(r => setTimeout(r, 600));
  await p.evaluate(() => {
    const v = document.getElementById('v-plate'), mk = (h) => { const d = document.createElement('div'); d.innerHTML = h; v.prepend(d.firstChild); };
    mk('<p style="font-size:10px">planted small text</p>');
    mk('<p style="width:600px;font-size:16px">planted wide box</p>');
    mk('<p style="color:#cfc6b8;font-size:16px">planted faint text</p>');
    mk('<button style="width:20px;height:20px;font-size:16px">x</button>');
    mk('<button style="width:48px;height:48px"></button>');
    mk('<p style="width:80px;height:20px;overflow:hidden;white-space:nowrap;font-size:16px">planted clipped text that runs on</p>');
    mk('<div style="position:relative;height:30px"><span style="font-size:16px">planted under</span><span style="position:absolute;left:0;top:0;font-size:16px">planted over</span></div>');
    mk('<p style="font-family:Caveat;font-size:26px">planted 450 kcal</p>');
    mk('<input style="width:90px;font-size:16px" placeholder="planted hint far too long for this box">');
    document.body.style.background = '#0B1211';
    const m = document.querySelector('meta[name=viewport]'); m.setAttribute('content', m.getAttribute('content') + ',user-scalable=no');
  });
  const got = new Set((await p.evaluate(audit, C.T)).map(v => v.rule)); await ctx.close();
  const want = ['text-too-small', 'overflow-x', 'off-screen', 'contrast', 'target-small', 'no-name', 'text-clipped', 'overlap', 'handwriting-figures', 'placeholder-clipped', 'palette', 'zoom-blocked'];
  return want.filter(r => !got.has(r));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true }); let srv;
  const miss = coverage(); if (miss.length) { console.error('coverage gaps (A11):\n- ' + miss.join('\n- ')); }
  try { srv = await servers(); } catch (e) { console.error('review could not start:', e.message); process.exit(2); }
  const b = await chromium.launch(), results = [], pageErrors = [];
  if (process.argv.includes('--drill') || QUICK) { const missed = await drill(b, srv.base); if (missed.length) { console.error('drill (A12): planted faults not caught: ' + missed.join(', ')); b.close(); srv.kids.forEach(k => k.kill()); process.exit(2); } else console.log('drill (A12): every planted fault was caught'); if (process.argv.includes('--drill')) { await b.close(); srv.kids.forEach(k => k.kill()); process.exit(0); } }
  const h = {
    settle: async (ms) => { await new Promise(r => setTimeout(r, ms || 500)); },
    plate: async (p) => { await p.waitForSelector('#plate-card:not(.wait)', { timeout: 20000 }); await new Promise(r => setTimeout(r, 700)); },
    slowApi: async (p, ms) => { await p.route('**/api/meals', async r => { await new Promise(x => setTimeout(x, ms)); await r.continue(); }); },
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
    const p = await ctx.newPage(); p.on('pageerror', e => pageErrors.push(name + ': ' + e)); p.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) pageErrors.push(name + ': ' + m.text()); });
    let viol = [], err = '';
    try {
      if (pre) await pre(p, h);
      await p.goto(srv.base, { waitUntil: 'domcontentloaded' }); await p.evaluate(() => document.fonts.ready); await h.settle(400);
      await go(p, h);
      if (run.big !== 1) { await p.evaluate(bigText, run.big); await h.settle(300); }
      viol = await p.evaluate(audit, C.T);
      if (run.big !== 1) viol = viol.filter(v => C.BIGTEXT_RULES.includes(v.rule));            // at 130 % only layout breakage counts; sizes and contrast are judged at 100 %
      const dir = path.join(OUT, 'screens', `${run.w}-${run.scheme}${run.big !== 1 ? '-big' : ''}`); fs.mkdirSync(dir, { recursive: true });
      const stops = await p.evaluate(() => { const s = document.getElementById('scroll'); if (!s) return [0]; const sh = document.querySelector('.sheet:not([hidden])'); if (sh && getComputedStyle(sh).display !== 'none') return [0]; const n = Math.min(6, Math.ceil(s.scrollHeight / s.clientHeight)); return [...Array(n).keys()].map(i => i * s.clientHeight * 0.9); });
      for (let i = 0; i < stops.length; i++) { await p.evaluate(y => { const s = document.getElementById('scroll'); if (s) s.scrollTop = y; }, stops[i]); await h.settle(150); await p.screenshot({ path: path.join(dir, `${name}-${i + 1}.png`) }); }
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
