// Next Plate, 30 s film. Brief: docs/film/BRIEF-v4.md (owner's survey answers). A pure function of time: window.seek(t) paints frame t.
// Plain statements in the owner's voice; the app only; calm; one detail lifted out of the screen at a time; ends on the name.
// Screens are app captures at 3x; rects are CSS px on the 390 x 844 viewport (assets/rects.json).
import * as M from './lib/motion.js';
import { WORDS } from './vo.js';

const { W, H, E, prog, lerp, mulberry32, TAU } = M;
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', clay: '#B0613D' };
const fD = (s, w = 500) => `${w} ${Math.round(s)}px Display`;
const fI = (s, w = 500) => `italic ${w} ${Math.round(s)}px Display`;
const ease = E.inOutCubic, out = E.outCubic;
function at(w, after = 0) { const x = WORDS.find((q) => q[1] >= after - 1e-3 && q[0].toLowerCase().replace(/[^a-z']/g, '') === w); if (!x) throw new Error('word ' + w); return x[1]; }

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

// one short label per scene, in the app's own terms. [in, out, text]
const SUP_Y = 300;
const SUPERS = [
  [5.0, 10.4, 'Your daily targets, *worked out.*'],
  [11.4, 17.8, 'One plate. *In grams.*'],
  [18.2, 23.8, 'Planned around *your health.*'],
];
function lineMixed(ctx, raw, x, y, size, alpha) {
  const parts = raw.split('*').map((s, i) => ({ s, it: i % 2 === 1 })).filter((p) => p.s);
  const ws = parts.map((p) => { ctx.font = p.it ? fI(size) : fD(size); return ctx.measureText(p.s).width; }), total = ws.reduce((a, b) => a + b, 0);
  let xx = x - total / 2; ctx.globalAlpha = alpha; ctx.textAlign = 'left';
  parts.forEach((p, i) => { ctx.font = p.it ? fI(size) : fD(size); ctx.fillStyle = p.it ? C.clay : C.ink; ctx.fillText(p.s, xx, y); xx += ws[i]; });
  ctx.globalAlpha = 1;
}
function supers(ctx, t) {
  for (const [a, b, raw] of SUPERS) { if (t < a - 0.01 || t > b) continue;
    const k = out(prog(t, a, a + 0.9)), o = 1 - E.inCubic(prog(t, b - 0.5, b)); lineMixed(ctx, raw, W / 2, SUP_Y + (1 - k) * 16, 80, k * o); }
}

// the phone: on screen from the first frame. camera keys [time, k, focus x, focus y (CSS), canvas x, canvas y]
const REST = [2.05, 195, 422, 540, 1330];
const CAM = [[0, 2.12, 195, 422, 540, 1300], [4.0, ...REST], [23.6, ...REST], [24.6, 2.0, 195, 422, 540, 3100], [99, 2.0, 195, 422, 540, 3100]];
function camera(t) {
  let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], p = b === a ? 0 : ease(prog(t, a[0], b[0]));
  return { k: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), p)), fx: lerp(a[2], b[2], p), fy: lerp(a[3], b[3], p), cx: lerp(a[4], b[4], p), cy: lerp(a[5], b[5], p) };
}
const SCREENS = [[0, 's03', 0], [4.65, 's07', 0.4], [10.6, 's04', 0.5], [17.9, 's05', 0.45]];
const TAPS = [[4.45, 148, 276]];
function phone(ctx, t, IMG) {
  const c = camera(t), k = c.k, X = (x) => c.cx + (x - c.fx) * k, Y = (y) => c.cy + (y - c.fy) * k;
  const x0 = X(0), y0 = Y(0), w = 390 * k, h = 844 * k, bz = 9 * k, R = 46 * k;
  if (y0 > H) return;
  ctx.save(); ctx.shadowColor = 'rgba(45,30,14,0.28)'; ctx.shadowBlur = 90; ctx.shadowOffsetY = 40;
  ctx.fillStyle = '#16130F'; ctx.beginPath(); ctx.roundRect(x0 - bz, y0 - bz, w + 2 * bz, h + 2 * bz, R + bz); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0 - bz + 2, y0 - bz + 2, w + 2 * bz - 4, h + 2 * bz - 4, R + bz - 2); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, w, h, R); ctx.clip(); ctx.imageSmoothingQuality = 'high';
  let i = 0; while (i + 1 < SCREENS.length && t >= SCREENS[i + 1][0]) i++;
  const draw = (j, alpha, dy = 0) => { ctx.globalAlpha = alpha; ctx.drawImage(IMG[SCREENS[j][1]], x0, y0 + dy, w, h); ctx.globalAlpha = 1; };
  const cur = SCREENS[i], p = cur[2] ? ease(prog(t, cur[0], cur[0] + cur[2])) : 1;
  if (p < 1 && i > 0) { draw(i - 1, 1); draw(i, p, (1 - p) * 18 * k); } else draw(i, 1);
  for (const [tt, x, y] of TAPS) { const a = prog(t, tt - 0.12, tt + 0.45); if (a <= 0 || a >= 1) continue;
    ctx.fillStyle = `rgba(29,26,22,${0.16 * (1 - a)})`; ctx.beginPath(); ctx.arc(X(x), Y(y), (16 + 22 * out(a)) * k * 0.5, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// a detail lifts out of the screen and comes forward. [shot, rect, in, out, width, centre y, from rect on the phone's current screen]
const LIFTS = [
  ['s03', [16, 126, 358, 194], 1.3, 3.9, 960, 1150],
  ['s07', [6, 240, 378, 356], 5.9, 10.2, 980, 1130, [6, 240]],
  ['s05b', [16, 128, 358, 312], 13.2, 17.6, 960, 1160, [16, 600]],
  ['s18', [20, 266, 352, 56], 18.6, 23.6, 980, 900, [20, 266]],
  ['s05', [20, 290, 352, 76], 19.9, 23.6, 980, 1230],
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

// the close: the app's own plate settles, the name comes up under it as it is said, then "Made for you."
const PLATE = { cx: 210, cy: 297.2, r: 119 };       // the plate illustration on the 04-plate capture, CSS px
function close(ctx, t, IMG) {
  const tn = at('nextplate', 22), tm = at('made', 22); if (t < tn - 1.6) return;
  const drift = 1 + 0.025 * ease(prog(t, tn, 31.5));                       // a slow push over the hold
  ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(drift, drift); ctx.translate(-W / 2, -1000);
  // the plate: rises and turns into place
  const p = ease(prog(t, tn - 0.6, tn + 0.6)), R = 250 * lerp(0.86, 1, p), cy = lerp(740, 690, p), rot = lerp(-0.35, 0, p);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.6); ctx.translate(W / 2, cy); ctx.rotate(rot);
    ctx.save(); ctx.shadowColor = 'rgba(45,30,14,0.28)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip(); ctx.imageSmoothingQuality = 'high';
    const s = 3, src = PLATE.r * s; ctx.drawImage(IMG.s04, PLATE.cx * s - src, PLATE.cy * s - src, src * 2, src * 2, -R, -R, R * 2, R * 2);
    ctx.restore();
  }
  // the name, letter by letter as it is said
  const title = 'NEXT PLATE', size = 120, track = 24; ctx.font = fD(size, 600);
  const ws = [...title].map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b + track, -track);
  let x = W / 2 - total / 2; ctx.fillStyle = C.ink; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { const k = out(prog(t, tn - 0.15 + i * 0.045, tn + 0.55 + i * 0.045)); if (k > 0) { ctx.globalAlpha = k; ctx.fillText(ch, x, 1110 + (1 - k) * 22); } x += ws[i] + track; });
  ctx.globalAlpha = 1;
  const r = out(prog(t, tn + 0.45, tn + 1.4)); ctx.fillRect(W / 2 - 450 * r, 1156, 900 * r, 3); ctx.fillRect(W / 2 - 450 * r, 1167, 900 * r, 1.2);
  // the line, as it is said
  const m = out(prog(t, tm - 0.15, tm + 0.8)); lineMixed(ctx, '*Made for you.*', W / 2, 1290 + (1 - m) * 14, 96, m);
  ctx.restore();
}

// sound: a soft tap, and a small chime as each detail arrives
const HITS = [[4.45, 'tap', 'tick', { gain: 0.11 }], ...LIFTS.map(([, , a]) => [a + 0.15, 'card arrives', 'bell', { pitch: 'A5', gain: 0.045, len: 1.0 }]), [25.45, 'plate lands', 'bell', { pitch: 'D6', gain: 0.05, len: 1.6 }]];

const shots = { s03: '03-today-directive', s07: '07-how-numbers', s04: '04-plate', s05b: '05b-serve', s05: '05-planned-around', s18: '18-dinner-planned-around' };
M.film({
  fonts: [fD(78), fD(78, 600), fI(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS.map(([s, ...r]) => [s / (60 / 72), ...r]),
  samples: 10,
  init() { GRAIN = makeGrain(); },
  draw(ctx, u, t, IMG) { page(ctx); phone(ctx, t, IMG); lifts(ctx, t, IMG); supers(ctx, t); close(ctx, t, IMG); },
});
