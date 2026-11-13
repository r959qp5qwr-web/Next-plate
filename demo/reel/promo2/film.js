// Next Plate promo v2: "Show it any menu." A pure function of time: window.seek(t) paints frame t.
// Clock: seconds (t). The narration (vo.js, the owner's voice, placed by audio/place.py) starts each group on a bar of beats.json.
// Every app screen is a capture of the app at 3x (assets/shots); rects below are CSS px in the 390 x 844 phone viewport.
// The menu card in scene 1 is set in type from the menu used to test the feature (test/v6/fixture-menu.js). docs/shotlist.md is the plan.
import * as M from './lib/motion.js';
import { WORDS } from './vo.js';

const { W, H, E, prog, lerp, clamp, spring, SPRING, wobble, mix, noise1, mulberry32, TAU, bump } = M;

// Raw Linen, pushed loud: each highlight owns a full field from the app's own tokens.
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', ink2: '#4B443B', ink3: '#857967', line: '#DCD1BF', clay: '#B0613D', olive: '#6B7A3A', kraft: '#DCC8A6' };
const fD = (s, w = 500) => `${w} ${Math.round(s)}px Display`;
const fI = (s, w = 500) => `italic ${w} ${Math.round(s)}px Display`;
const fH = (s, w = 700) => `${w} ${Math.round(s)}px UI`;
const CX = 540;
const OFF = 0.52919, PER = 60 / 112.016;
const B = (n) => OFF + n * PER;                       // beat n -> seconds
const toBeat = (s) => (s - OFF) / PER;
const sp = (t, t0, cfg = SPRING.snappy || { stiffness: 260, damping: 24 }) => spring(t - t0, cfg);
const SNAP = { stiffness: 320, damping: 26 }, SOFT = { stiffness: 140, damping: 19 }, BOUNCE = { stiffness: 260, damping: 14 };

// word time: the n-th time `w` is said at or after `after` seconds
function at(w, after = 0) { const x = WORDS.find((q) => q[1] >= after - 1e-3 && q[0].toLowerCase().replace(/[^a-z']/g, '') === w); if (!x) throw new Error('word ' + w); return x[1]; }

// ------------------------------------------------------------------ the scenes, each owns a field and lands on a downbeat
const DB = [0.52919, 2.67174, 4.81429, 6.95683, 9.09938, 11.24193, 13.38448, 15.52703, 17.66957, 19.81212, 21.95467, 24.09722, 26.23977, 28.38231, 30.52486];
const CUTS = [0, B(6), DB[3], DB[5], DB[7], DB[9], DB[11], DB[13], DB[14], 99];
const FIELD = [C.paper, C.ink, C.clay, C.kraft, C.ink, C.paper, C.olive, C.clay, C.paper];
const FG = [C.ink, C.paper, C.paper, C.ink, C.paper, C.ink, C.paper, C.paper, C.ink];
const ACC = [C.clay, C.clay, C.kraft, C.clay, C.clay, C.clay, C.kraft, C.kraft, C.clay];
const WIPE = 0.26;

// ------------------------------------------------------------------ texture
let GRAIN = null;
function makeGrain() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'), r = mulberry32(11);
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '60,40,20' : '255,250,240'},${0.035 + 0.05 * r()})`; x.beginPath(); x.arc(r() * 512, r() * 512, 0.6 + 1.4 * r(), 0, TAU); x.fill(); }
  return c;
}
function field(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(0, 0, W, H); }

// ------------------------------------------------------------------ pen
function pen(ctx, w = 7, color = C.clay) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
function handLine(ctx, x0, y0, x1, y1, p, seed = 1, amp = 3) {
  if (p <= 0) return; const n = 24; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const tt = Math.min(i / n, p); const x = lerp(x0, x1, tt), y = lerp(y0, y1, tt) + amp * noise1(tt * 3.3 + seed, seed) + amp * 0.5 * Math.sin(tt * 5 + seed); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); if (i / n >= p) break; }
  ctx.stroke();
}
function handEllipse(ctx, cx, cy, rx, ry, p, seed = 1) {
  if (p <= 0) return; const n = 80, a0 = -2.5 + 0.3 * Math.sin(seed), total = TAU * 1.08; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const tt = Math.min(i / n, p), a = a0 + total * tt, wob = 1 + 0.035 * Math.sin(a * 2 + seed) + 0.02 * noise1(tt * 4, seed), grow = 0.97 + 0.07 * tt;
    const x = cx + rx * wob * grow * Math.cos(a), y = cy + ry * wob * grow * Math.sin(a); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); if (i / n >= p) break; }
  ctx.stroke();
}
function writeOn(ctx, str, x, y, f, color, p, align = 'left') {
  if (p <= 0) return; ctx.font = f; const w = ctx.measureText(str).width, size = parseFloat(f.match(/(\d+)px/)[1]), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 14, y - size * 1.1, (w + 28) * p, size * 1.7); ctx.clip(); ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(str, x0, y); ctx.restore();
}
const tw = (ctx, s, f) => { ctx.font = f; return ctx.measureText(s).width; };

// ------------------------------------------------------------------ headline: words rise out of a mask, *accent* words in italic accent
function headline(ctx, t, t0, rows, { x = 84, y = 300, size = 132, fg, acc, gap = 0.07, lh = 1.04, align = 'left' }) {
  let i = 0;
  rows.forEach((row, r) => {
    const toks = row.split(' ').map((raw) => { let s = raw, a = false; if (s.startsWith('*')) { s = s.slice(1); a = true; } if (s.endsWith('*')) { s = s.slice(0, -1); a = true; } return { s, a }; });
    let inAcc = false; toks.forEach((k) => { if (row.includes('*')) {} });
    const ws = toks.map((k) => tw(ctx, k.s, k.a ? fI(size) : fD(size, 500))), sp_ = size * 0.24, total = ws.reduce((a, b) => a + b + sp_, -sp_);
    let xx = align === 'center' ? x - total / 2 : x; const yy = y + r * size * lh;
    toks.forEach((k, j) => {
      const q = sp(t, t0 + i * gap, SNAP); i++;
      if (q > 0.001) { ctx.save(); ctx.beginPath(); ctx.rect(xx - 20, yy - size * 1.0, ws[j] + 40, size * 1.32); ctx.clip();
        ctx.font = k.a ? fI(size) : fD(size, 500); ctx.fillStyle = k.a ? acc : fg; ctx.textAlign = 'left'; ctx.fillText(k.s, xx, yy + (1 - q) * size * 1.15); ctx.restore(); }
      xx += ws[j] + sp_;
    });
  });
}
// the chapter numeral, huge and faint behind the headline
function numeral(ctx, t, t0, n, color) {
  const q = sp(t, t0, SOFT); if (q <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.16 * clamp(q); ctx.font = fI(560); ctx.fillStyle = color; ctx.textAlign = 'right'; ctx.fillText(String(n), W - 40 + (1 - q) * 120, 560); ctx.restore();
}
// six small marks that count the highlights: filled up to n
function tally(ctx, t, t0, n, color) {
  const q = sp(t, t0 + 0.1, SNAP); if (q <= 0) return;
  for (let i = 0; i < 6; i++) { const x = 84 + i * 34, on = i < n; ctx.globalAlpha = clamp(q) * (on ? 1 : 0.28); ctx.fillStyle = color; ctx.fillRect(x, 110, 24, i === n - 1 ? 24 * clamp(q) : 6); }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ an app screen, cut out as a card with tape
// rect: CSS px [x, y, w, h] on the 390 x 844 capture; returns a mapper from CSS px to canvas px.
function card(ctx, img, rect, cx, cy, w, rot, { tape = true, shadow = 0.32, radius = 14 } = {}) {
  const k = w / rect[2], h = rect[3] * k;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2);
  ctx.save(); ctx.shadowColor = `rgba(20,12,4,${shadow})`; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.roundRect(0, 0, w, h, radius); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, radius); ctx.clip(); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, rect[0] * 3, rect[1] * 3, rect[2] * 3, rect[3] * 3, 0, 0, w, h); ctx.restore();
  if (tape) { ctx.save(); ctx.translate(w * 0.5, -6); ctx.rotate(-0.05); ctx.fillStyle = 'rgba(220,200,166,0.88)'; ctx.fillRect(-90, -22, 180, 44); ctx.restore(); }
  const m = (x, y) => [(x - rect[0]) * k, (y - rect[1]) * k];
  return { k, w, h, m, done: () => ctx.restore() };
}
function ring(ctx, c, r, p, seed, color = C.clay, wd = 8) { pen(ctx, wd, color); const [x, y] = c.m(r[0] + r[2] / 2, r[1] + r[3] / 2); handEllipse(ctx, x, y, r[2] / 2 * c.k + 18, r[3] / 2 * c.k + 14, p, seed); }
function under(ctx, c, r, p, seed, color = C.clay, wd = 7) { pen(ctx, wd, color); const [x0, y0] = c.m(r[0], r[1] + r[3] + 2), [x1] = c.m(r[0] + r[2], 0); handLine(ctx, x0, y0, x1, y0 + 1, p, seed, 2.5); }
function tap(ctx, c, xy, t, t0) { const a = prog(t, t0, t0 + 0.55); if (a <= 0 || a >= 1) return; const [x, y] = c.m(xy[0], xy[1]); ctx.globalAlpha = (1 - a) * 0.85; pen(ctx, 6, C.ink); ctx.beginPath(); ctx.arc(x, y, 14 + 54 * E.outCubic(a), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
const P = (t, t0, d = 0.5) => E.outCubic(prog(t, t0, t0 + d));

// entrance/exit for a card: slides in from a side on a spring, nudges on hits
function enter(t, t0, from = 1) { const q = sp(t, t0, { stiffness: 190, damping: 20 }); return { dx: (1 - q) * 1200 * from, rot: (1 - q) * 0.12 * from, q }; }

// ================================================================== S1  What do I order?  (0 .. 3.74)
const MENU = [['STARTERS'], ['Paneer Tikka', '320'], ['Hara Bhara Kabab', '260'], ['MAINS'], ['Dal Tadka', '240'], ['Dal Makhani', '280'], ['Palak Paneer', '300'],
  ['Kadai Paneer', '310'], ['Malai Kofta', '320'], ['Chole Bhature', '220'], ['BREADS AND SWEETS'], ['Tandoori Roti', '30'], ['Butter Naan', '60'], ['Gulab Jamun', '90']];
function s1(ctx, t) {
  const fg = C.ink;
  // the question: on the page from frame 0
  headline(ctx, t, -0.35, ['What do I', '*order?*'], { y: 268, size: 150, fg, acc: C.clay, gap: 0.06 });
  // the menu: drops in on the first hit
  const d = sp(t, -0.2, { stiffness: 170, damping: 15 }), jolt = 0.012 * wobble(t - at('menu'), 2.2, 4);
  const mw = 820, mh = 1210, cx = CX + 10, cy = 1238 + (1 - d) * 1400;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.028 + (1 - d) * 0.2 + jolt); ctx.translate(-mw / 2, -mh / 2);
  ctx.save(); ctx.shadowColor = 'rgba(40,24,8,0.32)'; ctx.shadowBlur = 64; ctx.shadowOffsetY = 30; ctx.fillStyle = '#FBF7EF'; ctx.fillRect(0, 0, mw, mh); ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(26, 26, mw - 52, mh - 52); ctx.lineWidth = 1.2; ctx.strokeRect(36, 36, mw - 72, mh - 72);
  ctx.font = fD(30, 600); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.letterSpacing = '12px'; ctx.fillText('THE MENU', mw / 2, 112); ctx.letterSpacing = '0px';
  ctx.font = fI(30); ctx.fillStyle = C.ink3; ctx.fillText('North Indian kitchen', mw / 2, 152);
  const rowsY = []; let y = 230;
  MENU.forEach((r) => {
    if (r.length === 1) { y += 18; ctx.font = fD(26, 600); ctx.fillStyle = C.clay; ctx.textAlign = 'left'; ctx.letterSpacing = '6px'; ctx.fillText(r[0], 84, y); ctx.letterSpacing = '0px'; y += 58; return; }
    ctx.font = fD(46, 500); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.fillText(r[0], 84, y); const nw = ctx.measureText(r[0]).width;
    ctx.textAlign = 'right'; ctx.font = fD(40, 500); ctx.fillStyle = C.ink2; ctx.fillText(r[1], mw - 84, y);
    ctx.fillStyle = C.line; for (let dx = 84 + nw + 18; dx < mw - 84 - 80; dx += 16) ctx.fillRect(dx, y - 8, 4, 4);
    rowsY.push([r[0], y, nw]); y += 66;
  });
  const row = (n) => rowsY.find((q) => q[0] === n);
  // reading: a scan bar, then the pen decides
  const sc = prog(t, at('tells') - 0.05, at('order') + 0.1);
  if (sc > 0 && sc < 1) { const yy = lerp(180, mh - 60, E.inOutCubic(sc)); const g = ctx.createLinearGradient(0, yy - 70, 0, yy + 6); g.addColorStop(0, 'rgba(176,97,61,0)'); g.addColorStop(1, 'rgba(176,97,61,0.28)'); ctx.fillStyle = g; ctx.fillRect(40, yy - 70, mw - 80, 76); ctx.fillStyle = C.clay; ctx.fillRect(40, yy, mw - 80, 4); }
  const o = at('order');
  pen(ctx, 7); for (const [n, d0] of [['Malai Kofta', -0.42], ['Gulab Jamun', -0.3], ['Chole Bhature', -0.18]]) { const r = row(n); handLine(ctx, 72, r[1] - 15, 96 + r[2], r[1] - 13, P(t, o + d0, 0.22), r[1], 2.5); }
  const pp = row('Palak Paneer'); pen(ctx, 9); handEllipse(ctx, 84 + pp[2] / 2, pp[1] - 15, pp[2] / 2 + 34, 44, P(t, o + 0.02, 0.45), 3);
  { const q = sp(t, o + 0.25, BOUNCE); if (q > 0) { ctx.save(); ctx.translate(84 + pp[2] + 210, pp[1] - 40); ctx.rotate(-0.08 + 0.1 * (1 - clamp(q))); ctx.scale(clamp(q, 0, 1.2), clamp(q, 0, 1.2));
    ctx.save(); ctx.shadowColor = 'rgba(40,24,8,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; ctx.fillStyle = C.kraft; ctx.fillRect(-150, -62, 330, 150); ctx.restore();
    writeOn(ctx, 'this one,', -128, -6, fH(64), C.clay, P(t, o + 0.32, 0.25)); writeOn(ctx, 'with 2 roti', -128, 60, fH(58), C.ink, P(t, o + 0.5, 0.25)); ctx.restore(); } }
  ctx.restore();
  // the viewfinder: the phone looks at the menu as "show it any menu" is said
  const v = sp(t, at('show') + 0.1, { stiffness: 300, damping: 18 });
  if (v > 0) { const s = lerp(1.18, 1, clamp(v)), hw = (mw / 2 + 40) * s, hh = (mh / 2 + 34) * s, L = 92; ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.028 + jolt); ctx.globalAlpha = clamp(v * 1.4); pen(ctx, 11, C.clay);
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(sx * hw, sy * hh + -sy * L); ctx.lineTo(sx * hw, sy * hh); ctx.lineTo(sx * hw + -sx * L, sy * hh); ctx.stroke(); }
    ctx.restore(); }
}

// ================================================================== S2  It picks  (3.74 .. 6.96)
function s2(ctx, t, t0) {
  const fg = C.paper; numeral(ctx, t, t0, 1, fg); tally(ctx, t, t0, 1, C.clay);
  headline(ctx, t, t0, ['Your order,', '*picked for you.*'], { y: 290, size: 128, fg, acc: C.clay });
  const e = enter(t, t0 + 0.05, 1), bump1 = 0.02 * bump(t, at('body'), 0.25);
  const c = card(ctx, IMG_.m04, [16, 268, 358, 426], CX + e.dx, 1190, 930 * (1 + bump1), 0.018 + e.rot);
  under(ctx, c, [30, 335, 225, 34], P(t, t0 + 0.45, 0.4), 4, C.clay, 9);
  ring(ctx, c, [124, 304, 80, 20], P(t, at('body') - 0.05, 0.45), 6);
  under(ctx, c, [32, 570, 232, 20], P(t, at('already') - 0.1, 0.35), 2); under(ctx, c, [32, 594, 142, 20], P(t, at('today') - 0.05, 0.3), 5);
  c.done();
}

// ================================================================== S3  One plate. In grams.  (6.96 .. 11.24)
function s3(ctx, t, t0) {
  const fg = C.paper; numeral(ctx, t, t0, 2, fg); tally(ctx, t, t0, 2, C.kraft);
  headline(ctx, t, t0, ['One plate.', '*In grams.*'], { y: 290, size: 150, fg, acc: C.kraft });
  const tg = at('grams') - 0.2;
  if (t < tg + 0.3) { const e = enter(t, t0 + 0.05, -1), out = E.inCubic(prog(t, tg - 0.05, tg + 0.25));
    const c = card(ctx, IMG_.s04, [16, 92, 358, 410], CX + e.dx - out * 1300, 1230, 900, -0.02 + e.rot - out * 0.15);
    under(ctx, c, [40, 338, 300, 58], P(t, at('plate') - 0.2, 0.45), 3, C.clay, 9); c.done(); }
  if (t > tg - 0.05) { const e = enter(t, tg - 0.05, 1);
    const c = card(ctx, IMG_.s05b, [16, 150, 358, 268], CX + e.dx, 1230, 960, 0.02 + e.rot);
    [173, 233, 293, 353].forEach((y, i) => ring(ctx, c, [34, y + 4, 60, 32], P(t, tg + 0.22 + i * 0.16, 0.32), 8 + i));
    c.done(); }
}

// ================================================================== S4  Ate something else?  (11.24 .. 15.53)
function s4(ctx, t, t0) {
  const fg = C.ink; numeral(ctx, t, t0, 3, fg); tally(ctx, t, t0, 3, C.clay);
  headline(ctx, t, t0, ['Ate something', '*else? Type it.*'], { y: 290, size: 124, fg, acc: C.clay });
  const tType = at('type') - 0.08, tSend = at('in', tType) + 0.12, tEst = tSend + 0.32, tDay = at('adjusts') - 0.75;
  const shot = t < tEst ? 'sD1' : t < tDay ? 'sD2' : 'sD3';
  const e = enter(t, t0 + 0.05, 1);
  const swap = (a) => sp(t, a, { stiffness: 240, damping: 22 });
  if (shot === 'sD1') { const c = card(ctx, IMG_.sD1, [0, 560, 390, 284], CX + e.dx, 1250, 940, -0.015 + e.rot);
    const ty = prog(t, tType, tSend - 0.12), tx = 30 + Math.floor(ty * 22) / 22 * 174, [fx, fy] = c.m(tx, 727), [ex] = c.m(204, 0);
    ctx.fillStyle = '#FAF6EE'; ctx.fillRect(fx, fy, ex - fx + 4, 36 * c.k);
    if (Math.floor(t * 3) % 2 === 0 || (ty > 0 && ty < 1)) { ctx.fillStyle = C.ink; ctx.fillRect(fx + 3, fy + 5 * c.k, 1.6 * c.k, 26 * c.k); }
    tap(ctx, c, [349, 745], t, tSend - 0.1); c.done(); }
  else if (shot === 'sD2') { const q = swap(tEst); const c = card(ctx, IMG_.sD2, [0, 560, 390, 284], CX, 1250 + (1 - q) * 60, 940, -0.015);
    under(ctx, c, [16, 662, 318, 21], P(t, tEst + 0.08, 0.35), 3); tap(ctx, c, [286, 802], t, tDay - 0.3); c.done(); }
  else { const q = swap(tDay); const c = card(ctx, IMG_.sD3, [16, 40, 358, 300], CX, 1210 + (1 - q) * 80, 940, 0.015);
    ring(ctx, c, [98, 62, 195, 58], P(t, tDay + 0.12, 0.45), 4, C.clay, 9); under(ctx, c, [150, 158, 205, 22], P(t, at('adjusts') + 0.2, 0.4), 6); c.done(); }
}

// ================================================================== S5  Eating out? Make it fit.  (15.53 .. 19.81)
function s5(ctx, t, t0) {
  const fg = C.paper; numeral(ctx, t, t0, 4, fg); tally(ctx, t, t0, 4, C.clay);
  headline(ctx, t, t0, ['Chole bhature?', '*Make it fit.*'], { y: 290, size: 136, fg, acc: C.clay });
  const e = enter(t, t0 + 0.05, -1), tf = at('fit');
  const c = card(ctx, IMG_.s15, [16, 104, 358, 312], CX + e.dx, 1200, 960, 0.018 + e.rot + 0.01 * bump(t, tf, 0.2));
  ring(ctx, c, [22, 350, 346, 56], P(t, at('shows') - 0.05, 0.5), 3);
  ring(ctx, c, [300, 122, 60, 24], P(t, at('make') - 0.1, 0.4), 7);
  ring(ctx, c, [134, 261, 124, 20], P(t, tf - 0.12, 0.42), 9);
  c.done();
}

// ================================================================== S6  It remembers your week.  (19.81 .. 24.10)
function s6(ctx, t, t0) {
  const fg = C.ink; numeral(ctx, t, t0, 5, fg); tally(ctx, t, t0, 5, C.clay);
  headline(ctx, t, t0, ['It remembers', '*your week.*'], { y: 290, size: 140, fg, acc: C.clay });
  // the week in the journal's hand: three nights of rajma, then no
  const days = [['Mon', 'rajma'], ['Tue', 'rajma'], ['Wed', 'rajma']], tr = at('rajma'), tWeek = at('week');
  days.forEach(([d, f], i) => { const y = 720 + i * 132, a = tWeek - 0.35 + i * 0.16;
    writeOn(ctx, d, 100, y, fD(64, 500), C.ink3, P(t, a, 0.2)); writeOn(ctx, f, 260, y, fH(118), C.ink, P(t, a + 0.08, 0.28)); });
  pen(ctx, 14); handLine(ctx, 80, 640, 600, 1000, P(t, tr - 0.25, 0.3), 2, 4); handLine(ctx, 600, 640, 90, 1000, P(t, tr - 0.05, 0.3), 5, 4);
  ctx.save(); ctx.translate(650, 900); ctx.rotate(-0.08); writeOn(ctx, 'Thu: not', 0, 0, fH(84), C.clay, P(t, tr + 0.25, 0.3)); writeOn(ctx, 'rajma', 10, 84, fH(84), C.clay, P(t, tr + 0.45, 0.3)); ctx.restore();
  const tc = at('four') - 0.1;
  if (t > tc - 0.05) { const e = enter(t, tc, 1);
    const c = card(ctx, IMG_.s18, [16, 92, 358, 206], CX + e.dx, 1500, 960, -0.012 + e.rot);
    ring(ctx, c, [226, 270, 132, 18], P(t, tc + 0.35, 0.45), 5); c.done(); }
}

// ================================================================== S7  Diabetes? Your roti stays.  (24.10 .. 28.38)
function s7(ctx, t, t0) {
  const fg = C.paper; numeral(ctx, t, t0, 6, fg); tally(ctx, t, t0, 6, C.kraft);
  headline(ctx, t, t0, ['Diabetes?', '*The roti stays.*'], { y: 290, size: 140, fg, acc: C.kraft });
  const e = enter(t, t0 + 0.05, -1);
  const c = card(ctx, IMG_.s05, [16, 92, 358, 206], CX + e.dx, 1000, 960, 0.014 + e.rot);
  ring(ctx, c, [196, 270, 164, 18], P(t, at('roti') - 0.12, 0.45), 4); c.done();
  const th = at('how', at('roti')) - 0.25;
  if (t > th - 0.05) { const e2 = enter(t, th, 1);
    const c2 = card(ctx, IMG_.s05b, [16, 222, 358, 64], CX + e2.dx, 1440, 960, -0.02 + e2.rot);
    ring(ctx, c2, [34, 237, 60, 32], P(t, th + 0.3, 0.4), 8); under(ctx, c2, [108, 242, 246, 22], P(t, th + 0.5, 0.4), 3); c2.done();
    ctx.save(); ctx.translate(140, 1640); ctx.rotate(-0.05); writeOn(ctx, 'measured, every time', 0, 0, fH(78), C.kraft, P(t, th + 0.55, 0.45)); ctx.restore(); }
}

// ================================================================== S8  The six, stamped  (28.38 .. 30.52)
const SIX = ['Reads any menu', 'One plate, in grams', 'Ate something else? Counted', 'Eating out, made to fit', 'Remembers your week', 'Diabetes: the roti stays'];
function six(ctx, t, t0, { x = 96, y = 470, size = 72, lh = 160, fg = C.paper, tick = C.kraft, step = PER / 2, num = true }) {
  SIX.forEach((s, i) => {
    const a = t0 + i * step, q = sp(t, a, BOUNCE); if (q <= 0) return;
    const yy = y + i * lh, sc = lerp(1.35, 1, clamp(q));
    ctx.save(); ctx.translate(x, yy); ctx.scale(sc, sc); ctx.globalAlpha = clamp(q * 2);
    if (num) { ctx.font = fI(size * 0.9); ctx.fillStyle = tick; ctx.textAlign = 'left'; ctx.fillText(String(i + 1), 0, 0); }
    ctx.font = fD(size, 500); ctx.fillStyle = fg; ctx.fillText(s, num ? size * 0.95 : 0, 0); ctx.restore();
    pen(ctx, size * 0.11, tick); const w = tw(ctx, s, fD(size, 500)) + (num ? size * 0.95 : 0);
    handLine(ctx, x - 6, yy + size * 0.22, x + w + 8, yy + size * 0.2, P(t, a + 0.12, 0.25), i + 3, 2.5);
  });
}
function s8(ctx, t, t0) {
  ctx.font = fD(34, 600); ctx.fillStyle = C.kraft; ctx.letterSpacing = '10px'; ctx.textAlign = 'left'; writeOn(ctx, 'WHAT IT DOES FOR YOU', 96, 300, fD(34, 600), C.kraft, P(t, t0, 0.3)); ctx.letterSpacing = '0px';
  six(ctx, t, t0 + 0.05, {});
}

// ================================================================== S9  Next Plate  (30.52 .. end)
function s9(ctx, t, t0) {
  const title = 'NEXT PLATE', size = 128, track = 20; ctx.font = fD(size, 600);
  const ws = [...title].map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b + track, -track); let x = CX - total / 2;
  const tn = at('nextplate');
  ctx.save(); ctx.beginPath(); ctx.rect(0, 380, W, 200); ctx.clip(); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { const k = sp(t, tn - 0.25 + i * 0.035, SNAP); if (k > 0) ctx.fillText(ch, x, 540 + (1 - k) * 170); x += ws[i] + track; });
  ctx.restore();
  const r = P(t, tn + 0.1, 0.5); ctx.fillStyle = C.ink; ctx.fillRect(CX - 470 * r, 580, 940 * r, 4); ctx.fillRect(CX - 470 * r, 592, 940 * r, 1.5);
  writeOn(ctx, 'a dietitian in your pocket', CX, 668, fI(58), C.clay, P(t, tn + 0.35, 0.5), 'center');
  six(ctx, t, t0 + 0.1, { x: 150, y: 830, size: 46, lh: 76, fg: C.ink2, tick: C.clay, step: 0.06 });
  // the ask, in the owner's hand, as it is spoken
  const tm = at('message'), f = fH(108);
  ctx.save(); ctx.translate(CX, 1500); ctx.rotate(-0.03); writeOn(ctx, 'Message me', 0, 0, f, C.clay, P(t, tm - 0.05, 0.45), 'center'); writeOn(ctx, 'for your link', 0, 112, f, C.clay, P(t, at('send') - 0.05, 0.5), 'center');
  pen(ctx, 8); handLine(ctx, -250, 140, 260, 132, P(t, at('link') + 0.05, 0.4), 4, 3.5); ctx.restore();
}

// ------------------------------------------------------------------ the cut machine: a full field wipes up and lands on the downbeat
const SCENES = [(c, t) => s1(c, t), s2, s3, s4, s5, s6, s7, s8, s9];
let IMG_ = null;
function drawScene(ctx, i, t) { field(ctx, FIELD[i]); SCENES[i](ctx, t, CUTS[i]); }
function frameAt(ctx, t) {
  let i = 0; while (i + 1 < SCENES.length && t >= CUTS[i + 1]) i++;
  drawScene(ctx, i, t);
  const nx = i + 1; if (nx >= SCENES.length) return;
  const p = prog(t, CUTS[nx] - WIPE, CUTS[nx]); if (p <= 0) return;
  const k = E.inQuart ? E.inQuart(p) : p * p * p * p, edge = H * (1 - k), tilt = 120 * (1 - k);
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, edge + tilt); ctx.lineTo(W, edge); ctx.lineTo(W, H + 10); ctx.lineTo(0, H + 10); ctx.closePath(); ctx.clip();
  ctx.translate(0, edge * 0.35); drawScene(ctx, nx, CUTS[nx]); ctx.restore();
  ctx.fillStyle = ACC[nx]; ctx.beginPath(); ctx.moveTo(0, edge + tilt - 14); ctx.lineTo(W, edge - 14); ctx.lineTo(W, edge); ctx.lineTo(0, edge + tilt); ctx.closePath(); ctx.fill();
}

// ------------------------------------------------------------------ sound: every accent the picture makes (beats)
const tk = { gain: 0.16 }, HIT = (s, label, sfx, o) => [toBeat(s), label, sfx, o];
let HITS = [];
function buildHits() {
  const o = at('order'), tg = at('grams') - 0.2, tType = at('type') - 0.08, tSend = at('in', tType) + 0.12, tDay = at('adjusts') - 0.75;
  HITS = [
    HIT(0.02, 'menu lands', 'thud', { gain: 0.45 }),
    HIT(at('show') + 0.1, 'viewfinder', 'click', { gain: 0.3 }),
    HIT(at('tells') - 0.05, 'scan', 'whoosh', { len: 0.7, from: 600, to: 2400, gain: 0.14 }),
    HIT(o - 0.42, 'strike', 'tick', tk), HIT(o - 0.3, 'strike', 'tick', tk), HIT(o - 0.18, 'strike', 'tick', tk), HIT(o + 0.02, 'circle', 'pop', { pitch: 'A5', gain: 0.3 }),
    ...CUTS.slice(1, 9).map((c, i) => HIT(c - WIPE, 'wipe ' + (i + 2), 'whoosh', { len: WIPE + 0.05, from: 400, to: 2600, gain: 0.2 })),
    ...CUTS.slice(1, 9).map((c, i) => HIT(c, 'field ' + (i + 2), 'thud', { gain: 0.3 })),
    HIT(at('body') - 0.05, 'fit ring', 'tick', tk), HIT(at('already') - 0.1, 'planned around', 'tick', tk),
    HIT(at('plate') - 0.2, 'plate name', 'tick', tk), HIT(tg - 0.05, 'serve card', 'whoosh', { len: 0.35, gain: 0.16 }),
    ...[0, 1, 2, 3].map((i) => HIT(tg + 0.22 + i * 0.16, 'grams', 'tok', { pitch: ['D5', 'F#5', 'A5', 'D6'][i], gain: 0.22 })),
    HIT(tType, 'typing', 'type', { len: tSend - 0.12 - tType, n: 12, gain: 0.15 }), HIT(tSend - 0.1, 'send', 'pop', { gain: 0.24 }), HIT(tDay - 0.3, 'count it', 'pop', { gain: 0.22 }), HIT(tDay + 0.12, 'counted', 'bell', { pitch: 'D6', gain: 0.14, len: 0.8 }),
    HIT(at('shows') - 0.05, 'move', 'tick', tk), HIT(at('fit') - 0.12, 'it fits', 'bell', { pitch: 'A5', gain: 0.14, len: 0.7 }),
    HIT(at('rajma') - 0.25, 'cross', 'whoosh', { len: 0.25, from: 2600, to: 900, gain: 0.18 }), HIT(at('rajma') - 0.05, 'cross', 'whoosh', { len: 0.25, from: 2600, to: 900, gain: 0.18 }), HIT(at('four') + 0.25, 'less rajma', 'tick', tk),
    HIT(at('roti') - 0.12, 'grain stays', 'tick', tk), HIT(at('how', at('roti')) + 0.05, 'grams of grain', 'tick', tk),
    ...SIX.map((_, i) => HIT(CUTS[7] + 0.05 + i * PER / 2, 'stamp ' + (i + 1), 'impact', { gain: 0.16 + 0.02 * i })),
    HIT(at('nextplate') - 0.25, 'masthead', 'thud', { gain: 0.32 }), HIT(at('link') + 0.05, 'your link', 'tick', tk),
  ];
}

const shots = { m04: 'menu-04-result', s04: '04-plate', s05: '05-planned-around', s05b: '05b-serve', sD1: 'D1-log-ask', sD2: 'D2-log-estimate', sD3: 'D3-day-updated', s15: '15-rescue-moves', s18: '18-dinner-planned-around' };
buildHits();
M.film({
  fonts: [fD(78), fD(78, 600), fI(78), fH(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS,
  samples: (t) => (CUTS.some((c) => t > c - WIPE - 0.05 && t < c + 0.5) || t < 0.6 ? 16 : 6),
  init(ctx, IMG) { GRAIN = makeGrain(); IMG_ = IMG; },
  draw(ctx, u, t) { frameAt(ctx, t); },
});
