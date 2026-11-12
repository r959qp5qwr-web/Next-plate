// Next Plate film v3, "One decision". docs/treatment.md is the plan. A pure function of time: window.seek(t) paints frame t.
// Apple-film grammar: one idea per shot, the phone large and calm, real screens at real speed, the detail lifted out of the
// screen to full size, one quiet line of type at a time. Clock: seconds. Screens are real captures at 3x; rects are CSS px
// on the 390 x 844 viewport (assets/rects.json).
import * as M from './lib/motion.js';
import { WORDS } from './vo.js';

const { W, H, E, prog, lerp, clamp, mulberry32, TAU } = M;
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', ink2: '#4B443B', ink3: '#857967', line: '#DCD1BF', clay: '#B0613D' };
const fD = (s, w = 500) => `${w} ${Math.round(s)}px Display`;
const fI = (s, w = 500) => `italic ${w} ${Math.round(s)}px Display`;
const ease = E.inOutCubic, out = E.outCubic;
function at(w, after = 0) { const x = WORDS.find((q) => q[1] >= after - 1e-3 && q[0].toLowerCase().replace(/[^a-z']/g, '') === w); if (!x) throw new Error('word ' + w); return x[1]; }

// ------------------------------------------------------------------ the page
let GRAIN = null;
function makeGrain() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'), r = mulberry32(5);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '70,50,30' : '255,252,244'},${0.02 + 0.03 * r()})`; x.beginPath(); x.arc(r() * 512, r() * 512, 0.6 + 1.2 * r(), 0, TAU); x.fill(); }
  return c;
}
function page(ctx) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, 'rgba(255,253,248,0.55)'); g.addColorStop(1, 'rgba(214,200,178,0.25)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------------ supers: one line at a time, fades up and holds. [in, out, text, y, size]
const SUP_Y = 300;
const SUPERS = [
  [1.0, 3.75, 'Three times a day,', 860, 92], [2.3, 3.75, '*you decide what to eat.*', 970, 92],
  [3.95, 5.75, 'Most days, you wing it.', 920, 88],
  [8.2, 12.3, 'Show it the menu.', SUP_Y, 84], [12.45, 15.0, '*It picks your order.*', SUP_Y, 84],
  [15.25, 21.3, 'One plate. *In grams.*', SUP_Y, 84],
  [22.6, 28.9, 'Ate something else? *Tell it.*', SUP_Y, 80],
  [29.4, 34.6, 'With diabetes, *the grain stays.*', SUP_Y, 80],
];
function lineMixed(ctx, raw, x, y, size, alpha) {
  const parts = raw.split('*').map((s, i) => ({ s, it: i % 2 === 1 })).filter((p) => p.s);
  const ws = parts.map((p) => { ctx.font = p.it ? fI(size) : fD(size); return ctx.measureText(p.s).width; }), total = ws.reduce((a, b) => a + b, 0);
  let xx = x - total / 2; ctx.globalAlpha = alpha; ctx.textAlign = 'left';
  parts.forEach((p, i) => { ctx.font = p.it ? fI(size) : fD(size); ctx.fillStyle = p.it ? C.clay : C.ink; ctx.fillText(p.s, xx, y); xx += ws[i]; });
  ctx.globalAlpha = 1;
}
function supers(ctx, t) {
  for (const [a, b, raw, y, size] of SUPERS) {
    if (t < a - 0.01 || t > b) continue;
    const k = out(prog(t, a, a + 0.9)), o = 1 - E.inCubic(prog(t, b - 0.5, b));
    lineMixed(ctx, raw, W / 2, y + (1 - k) * 16, size, k * o);
  }
}

// ------------------------------------------------------------------ the phone. camera keys: [time, k, focus x, focus y (CSS), canvas x, canvas y]
const REST = [2.05, 195, 422, 540, 1330];
const CAM = [
  [0, 2.05, 195, 422, 540, 3000], [6.0, 2.05, 195, 422, 540, 3000],
  [8.1, ...REST], [21.3, ...REST], [22.3, 1.8, 195, 422, 540, 1190], [26.6, 1.8, 195, 422, 540, 1190], [27.3, ...REST], [34.6, 2.0, 195, 422, 540, 1350], [35.9, 2.0, 195, 422, 540, 3100], [99, 2.0, 195, 422, 540, 3100],
];
function camera(t) {
  let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], p = b === a ? 0 : ease(prog(t, a[0], b[0]));
  return { k: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), p)), fx: lerp(a[2], b[2], p), fy: lerp(a[3], b[3], p), cx: lerp(a[4], b[4], p), cy: lerp(a[5], b[5], p) };
}
// screens: [from, shot, crossfade seconds]; taps: [time, x, y]
const SCREENS = [[0, 'p03', 0], [8.0, 'm01', 0.35], [9.95, 'm02', 0.3], [11.15, 'm03', 0.3], [12.2, 'm04', 0.45],
  [15.25, 's04', 0.5], [21.4, 'sD1', 0.45], [24.55, 'sD2', 0.35], [26.95, 'sD3', 0.4], [28.95, 's05b', 0.5]];
const TAPS = [[9.75, 91, 217], [10.98, 195, 512], [24.35, 349, 745], [26.75, 286, 802]];
let TEXTBG = null, FIELDBG = null;
function phone(ctx, t, IMG) {
  const c = camera(t), k = c.k, X = (x) => c.cx + (x - c.fx) * k, Y = (y) => c.cy + (y - c.fy) * k;
  const x0 = X(0), y0 = Y(0), w = 390 * k, h = 844 * k, bz = 9 * k, R = 46 * k;
  if (y0 > H) return;
  ctx.save(); ctx.shadowColor = 'rgba(45,30,14,0.28)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#16130F'; ctx.beginPath(); ctx.roundRect(x0 - bz, y0 - bz, w + 2 * bz, h + 2 * bz, R + bz); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0 - bz + 2, y0 - bz + 2, w + 2 * bz - 4, h + 2 * bz - 4, R + bz - 2); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, R); ctx.clip(); ctx.imageSmoothingQuality = 'high';
  let i = 0; while (i + 1 < SCREENS.length && t >= SCREENS[i + 1][0]) i++;
  const draw = (j, alpha, dy = 0) => { const s = SCREENS[j][1]; ctx.globalAlpha = alpha; ctx.drawImage(IMG[s], x0, y0 + dy, w, h); live(ctx, s, t, X, Y, k, dy); ctx.globalAlpha = 1; };
  const cur = SCREENS[i], p = cur[2] ? ease(prog(t, cur[0], cur[0] + cur[2])) : 1;
  if (p < 1 && i > 0) { draw(i - 1, 1); draw(i, p, (1 - p) * 18 * k); } else draw(i, 1);
  for (const [tt, x, y] of TAPS) { const a = prog(t, tt - 0.12, tt + 0.45); if (a <= 0 || a >= 1) continue;
    const r = (16 + 22 * out(a)) * k * 0.5; ctx.fillStyle = `rgba(29,26,22,${0.16 * (1 - a)})`; ctx.beginPath(); ctx.arc(X(x), Y(y), r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// things that happen inside a screen: the menu typed in line by line; the meal typed into the field
function live(ctx, s, t, X, Y, k, dy) {
  if (s === 'm02') { const a = prog(t, 10.1, 10.85), lines = 8, shown = Math.floor(a * lines + 0.001); if (a < 1) { ctx.fillStyle = TEXTBG; for (let l = shown; l < lines; l++) ctx.fillRect(X(20), Y(297 + l * 24) + dy, 350 * k, 24 * k); } }
  if (s === 'sD1') { const a = prog(t, 23.2, 24.15), tx = 30 + Math.floor(a * 22) / 22 * 174; ctx.fillStyle = FIELDBG; ctx.fillRect(X(tx), Y(727) + dy, (206 - tx) * k, 36 * k);
    if (a > 0 && a < 1 || (a === 0 && Math.floor(t * 2.4) % 2 === 0)) { ctx.fillStyle = C.ink; ctx.fillRect(X(tx + 2), Y(733) + dy, 1.4 * k, 24 * k); } }
}

// ------------------------------------------------------------------ the detail: a part of the screen lifts out and comes forward
// [shot, rect, in, out, width, centre y]; the phone recedes under a veil of paper while a lift is up
const LIFTS = [
  ['m04', [16, 268, 358, 426], 12.85, 14.95, 940, 1180],
  ['s05b', [16, 124, 358, 330], 17.35, 19.2, 940, 1170],
  ['s04', [16, 396, 358, 192], 19.35, 21.3, 960, 1080],
  ['sD2', [2, 470, 386, 238], 25.0, 26.45, 960, 1100],
  ['sD3', [16, 52, 358, 172], 27.4, 28.9, 960, 1060],
  ['s06', [15.5, 180, 359, 105], 30.6, 34.5, 960, 860, [16, 643]],
  ['s05b', [16, 222, 358, 64], 32.75, 34.5, 960, 1290],
];
function lifts(ctx, t, IMG) {
  const c = camera(t), k = c.k; let veil = 0; const up = [];
  for (const [shot, r, a, b, tw, cy, from] of LIFTS) {
    const p = ease(prog(t, a, a + 1.0)) * (1 - ease(prog(t, b, b + 0.6))); if (p <= 0) continue;
    veil = Math.max(veil, p); up.push([shot, r, p, tw, cy, from || r]);
  }
  if (veil <= 0) return;
  ctx.fillStyle = `rgba(242,236,225,${0.9 * veil})`; ctx.fillRect(0, 0, W, H);
  for (const [shot, r, p, tw, cy, f] of up) {
    const sx = c.cx + (f[0] - c.fx) * k, sy = c.cy + (f[1] - c.fy) * k, sw = r[2] * k;
    const w = lerp(sw, tw, p), h = w * r[3] / r[2], x = lerp(sx, W / 2 - tw / 2, p), y = lerp(sy, cy - tw * r[3] / r[2] / 2, p), rad = 10 * w / r[2];
    ctx.save(); ctx.shadowColor = `rgba(45,30,14,${0.3 * p})`; ctx.shadowBlur = 80; ctx.shadowOffsetY = 34 * p; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.roundRect(x, y, w, h, rad); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, rad); ctx.clip(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG[shot], r[0] * 3, r[1] * 3, r[2] * 3, r[3] * 3, x, y, w, h); ctx.restore();
  }
}

// ------------------------------------------------------------------ the close
function close(ctx, t) {
  const t0 = at('nextplate', 30); if (t < t0 - 0.6) return;
  const a = out(prog(t, t0 - 0.4, t0 + 0.9)), title = 'NEXT PLATE', size = 118, track = 22;
  ctx.font = fD(size, 600); const ws = [...title].map((ch) => ctx.measureText(ch).width), total = ws.reduce((p, q) => p + q + track, -track);
  let x = W / 2 - total / 2; ctx.globalAlpha = a; ctx.fillStyle = C.ink; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { ctx.fillText(ch, x, 800 + (1 - a) * 18); x += ws[i] + track; });
  const r = out(prog(t, t0 + 0.3, t0 + 1.3)); ctx.fillRect(W / 2 - 430 * r, 846, 860 * r, 3); ctx.fillRect(W / 2 - 430 * r, 857, 860 * r, 1.2);
  ctx.globalAlpha = 1;
  const d = out(prog(t, at('dietitian') - 0.3, at('dietitian') + 0.7)); lineMixed(ctx, '*a dietitian in your pocket*', W / 2, 950 + (1 - d) * 12, 64, d);
  const m = out(prog(t, at('message') - 0.1, at('message') + 0.9)); lineMixed(ctx, 'Message me for your link.', W / 2, 1220 + (1 - m) * 12, 70, m);
}

// ------------------------------------------------------------------ sound: soft taps and two quiet chimes; the music carries the rest
const HITS = [...TAPS.map(([s]) => [s, 'tap', 'tick', { gain: 0.11 }]),
  [12.2, 'order arrives', 'bell', { pitch: 'A5', gain: 0.05, len: 1.2 }], [26.95, 'counted', 'bell', { pitch: 'D6', gain: 0.05, len: 1.0 }]];

const shots = { p03: '03-today-directive', m01: 'menu-01-entry', m02: 'menu-02-typed-menu', m03: 'menu-03-reading', m04: 'menu-04-result',
  s04: '04-plate', s05b: '05b-serve', s06: '06-why-today', sD1: 'D1-log-ask', sD2: 'D2-log-estimate', sD3: 'D3-day-updated' };
const px = (img, x, y) => { const c = document.createElement('canvas'); c.width = 4; c.height = 4; const g = c.getContext('2d'); g.drawImage(img, x * 3, y * 3, 4, 4, 0, 0, 4, 4); const d = g.getImageData(1, 1, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
M.film({
  fonts: [fD(78), fD(78, 600), fI(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS.map(([s, ...r]) => [s / (60 / 72), ...r]),
  samples: 10,
  init(ctx, IMG) { GRAIN = makeGrain(); TEXTBG = px(IMG.m02, 371, 470); FIELDBG = px(IMG.sD1, 214, 745); },
  draw(ctx, u, t, IMG) { page(ctx); phone(ctx, t, IMG); lifts(ctx, t, IMG); supers(ctx, t); close(ctx, t); },
});
