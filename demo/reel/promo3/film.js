// Next Plate film v3, "One decision". docs/treatment.md is the plan. A pure function of time: window.seek(t) paints frame t.
// Apple-film grammar: one idea per shot, the phone large and calm, real screens at real speed, a slow push in to the detail,
// one quiet line of type at a time. Clock: seconds. Screens are real captures at 3x (CSS px rects on the 390 x 844 viewport).
import * as M from './lib/motion.js';
import { WORDS } from './vo.js';

const { W, H, E, prog, lerp, clamp, mulberry32, TAU } = M;
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', ink2: '#4B443B', ink3: '#857967', line: '#DCD1BF', clay: '#B0613D' };
const fD = (s, w = 500) => `${w} ${Math.round(s)}px Display`;
const fI = (s, w = 500) => `italic ${w} ${Math.round(s)}px Display`;
const ease = E.inOutCubic, out = E.outCubic;
function at(w, after = 0) { const x = WORDS.find((q) => q[1] >= after - 1e-3 && q[0].toLowerCase().replace(/[^a-z']/g, '') === w); if (!x) throw new Error('word ' + w); return x[1]; }

// ------------------------------------------------------------------ the page: Raw Linen paper, very quiet grain, a soft light from above
let GRAIN = null;
function makeGrain() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'), r = mulberry32(5);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '70,50,30' : '255,252,244'},${0.02 + 0.03 * r()})`; x.beginPath(); x.arc(r() * 512, r() * 512, 0.6 + 1.2 * r(), 0, TAU); x.fill(); }
  return c;
}
function page(ctx) {
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, 'rgba(255,253,248,0.55)'); g.addColorStop(1, 'rgba(214,200,178,0.25)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(0, 0, W, H);
}

// ------------------------------------------------------------------ supers: one line, set large, fades up and holds
// [in, out, text, y, size, italic]
const SUPERS = () => [
  [1.15, 4.6, 'Three times a day,', 820, 92], [2.35, 4.6, '*you decide what to eat.*', 930, 92],
  [6.35, 10.25, 'Show it the menu.', 330, 84],
  [10.55, 15.2, '*It picks your order.*', 330, 84],
];
function supers(ctx, t) {
  for (const [a, b, raw, y, size] of SUPERS()) {
    if (t < a - 0.01 || t > b) continue;
    const it = raw.startsWith('*'), s = raw.replace(/\*/g, ''), k = out(prog(t, a, a + 0.9)), o = 1 - E.inCubic(prog(t, b - 0.5, b));
    ctx.save(); ctx.globalAlpha = k * o; ctx.font = it ? fI(size) : fD(size, 500); ctx.fillStyle = it ? C.clay : C.ink; ctx.textAlign = 'center';
    ctx.fillText(s, W / 2, y + (1 - k) * 16); ctx.restore();
  }
}

// ------------------------------------------------------------------ the phone: a quiet ink device, screen at CSS scale k
// camera keys: [time, k (canvas px per CSS px), focus x, focus y (CSS px), canvas x, canvas y where the focus sits]; eased between keys
const CAM = [
  [4.3, 2.05, 195, 422, 540, 2900],   // below frame
  [6.2, 2.05, 195, 422, 540, 1330],   // risen: the whole upper screen, super above
  [10.9, 2.05, 195, 422, 540, 1330],
  [15.0, 2.0, 195, 422, 540, 1350],   // the phone settles back while the order lifts out
  [99, 2.0, 195, 422, 540, 1350],
];
function camera(t) {
  let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], p = b === a ? 0 : ease(prog(t, a[0], b[0]));
  return { k: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), p)), fx: lerp(a[2], b[2], p), fy: lerp(a[3], b[3], p), cx: lerp(a[4], b[4], p), cy: lerp(a[5], b[5], p) };
}
// screens: [from time, shot, transition seconds]; a tap is [time, x, y] in CSS px
const SCREENS = [[0, 'p03', 0], [5.95, 'm01', 0.35], [7.95, 'm02', 0.3], [9.3, 'm03', 0.3], [10.45, 'm04', 0.45]];
const TAPS = [[7.75, 91, 217], [9.12, 195, 512]];
let TEXTBG = null;
function phone(ctx, t, IMG) {
  const c = camera(t), k = c.k, X = (x) => c.cx + (x - c.fx) * k, Y = (y) => c.cy + (y - c.fy) * k;
  const x0 = X(0), y0 = Y(0), w = 390 * k, h = 844 * k, bz = 9 * k, R = 46 * k;
  if (y0 > H) return;
  // body and shadow
  ctx.save(); ctx.shadowColor = 'rgba(45,30,14,0.28)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#16130F'; ctx.beginPath(); ctx.roundRect(x0 - bz, y0 - bz, w + 2 * bz, h + 2 * bz, R + bz); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0 - bz + 2, y0 - bz + 2, w + 2 * bz - 4, h + 2 * bz - 4, R + bz - 2); ctx.stroke();
  // screen
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, R); ctx.clip(); ctx.imageSmoothingQuality = 'high';
  let i = 0; while (i + 1 < SCREENS.length && t >= SCREENS[i + 1][0]) i++;
  const draw = (j, alpha, dy = 0) => { const s = SCREENS[j][1]; ctx.globalAlpha = alpha; ctx.drawImage(IMG[s], x0, y0 + dy, w, h); if (s === 'm02') typing(ctx, t, X, Y, k, alpha); ctx.globalAlpha = 1; };
  const cur = SCREENS[i], p = cur[2] ? ease(prog(t, cur[0], cur[0] + cur[2])) : 1;
  if (p < 1 && i > 0) { draw(i - 1, 1); draw(i, p, (1 - p) * 18 * k); } else draw(i, 1);
  // taps: a soft press, the way a finger reads on screen
  for (const [tt, x, y] of TAPS) { const a = prog(t, tt - 0.12, tt + 0.45); if (a <= 0 || a >= 1) continue;
    const r = (16 + 22 * out(a)) * k * 0.5; ctx.fillStyle = `rgba(29,26,22,${0.16 * (1 - a)})`; ctx.beginPath(); ctx.arc(X(x), Y(y), r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// the menu goes in: the typed lines appear one after another
function typing(ctx, t, X, Y, k, alpha) {
  const a = prog(t, 8.15, 8.95), lines = 8, shown = Math.floor(a * lines + 0.001), top = 297, lh = 24;
  if (a >= 1) return;
  ctx.fillStyle = TEXTBG; ctx.globalAlpha = alpha;
  for (let l = shown; l < lines; l++) ctx.fillRect(X(20), Y(top + l * lh), 350 * k, lh * k);
}

// ------------------------------------------------------------------ the detail: the order card lifts out of the screen and comes forward
const LIFT = { shot: 'm04', r: [16, 268, 358, 426], t0: 11.15, t1: 12.55, w: 940, cy: 1170 };
function lift(ctx, t, IMG) {
  const p = ease(prog(t, LIFT.t0, LIFT.t1)); if (p <= 0) return;
  const c = camera(t), k = c.k, r = LIFT.r;
  const sx = c.cx + (r[0] - c.fx) * k, sy = c.cy + (r[1] - c.fy) * k, sw = r[2] * k, sh = r[3] * k;
  const w = lerp(sw, LIFT.w, p), h = w * r[3] / r[2], x = lerp(sx, W / 2 - LIFT.w / 2, p), y = lerp(sy, LIFT.cy - LIFT.w * r[3] / r[2] / 2, p);
  ctx.fillStyle = `rgba(242,236,225,${0.9 * p})`; ctx.fillRect(0, 0, W, H);          // the phone recedes under a veil of paper
  ctx.save(); ctx.shadowColor = `rgba(45,30,14,${0.32 * p})`; ctx.shadowBlur = 80; ctx.shadowOffsetY = 36 * p; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10 * w / sw); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 10 * w / sw); ctx.clip(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(IMG[LIFT.shot], r[0] * 3, r[1] * 3, r[2] * 3, r[3] * 3, x, y, w, h); ctx.restore();
}

// ------------------------------------------------------------------ sound: soft taps only; the music carries the rest
const HITS = [[7.75, 'tap', 'tick', { gain: 0.12 }], [9.12, 'tap', 'tick', { gain: 0.12 }], [10.45, 'order arrives', 'bell', { pitch: 'A5', gain: 0.06, len: 1.2 }]];

const shots = { p03: '03-today-directive', m01: 'menu-01-entry', m02: 'menu-02-typed-menu', m03: 'menu-03-reading', m04: 'menu-04-result' };
M.film({
  fonts: [fD(78), fI(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS.map(([s, ...r]) => [s / (60 / 72), ...r]),
  samples: 10,
  init(ctx, IMG) {
    GRAIN = makeGrain();
    const c = document.createElement('canvas'); c.width = 6; c.height = 6; const x = c.getContext('2d'); x.drawImage(IMG.m02, 372 * 3 - 3, 470 * 3, 6, 6, 0, 0, 6, 6);
    const d = x.getImageData(2, 2, 1, 1).data; TEXTBG = `rgb(${d[0]},${d[1]},${d[2]})`;
  },
  draw(ctx, u, t, IMG) { page(ctx); phone(ctx, t, IMG); lift(ctx, t, IMG); supers(ctx, t); },
});
