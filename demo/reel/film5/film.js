// Next Plate features film, 60 s. Brief docs/film/BRIEF-features.md; script docs/film/SCRIPT-features.md (concept B, owner-approved).
// The day says, the plate answers: a paper card names what the day did, then the app answers on its own screen. A pure function of time.
// Screens are app captures at 3x; rects are CSS px on the 390 x 844 viewport (assets/rects.json).
import * as M from './lib/motion.js';
import { WORDS } from './vo.js';

const { W, H, E, prog, lerp, mulberry32, TAU } = M;
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', clay: '#B0613D' };
const fD = (s, w = 500) => `${w} ${Math.round(s)}px Display`;
const fI = (s, w = 500) => `italic ${w} ${Math.round(s)}px Display`;
const ease = E.inOutCubic, out = E.outCubic;

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

function lineMixed(ctx, raw, x, y, size, alpha) {
  const parts = raw.split('*').map((s, i) => ({ s, it: i % 2 === 1 })).filter((p) => p.s);
  const ws = parts.map((p) => { ctx.font = p.it ? fI(size) : fD(size); return ctx.measureText(p.s).width; }), total = ws.reduce((a, b) => a + b, 0);
  let xx = x - total / 2; ctx.globalAlpha = alpha; ctx.textAlign = 'left';
  parts.forEach((p, i) => { ctx.font = p.it ? fI(size) : fD(size); ctx.fillStyle = p.it ? C.clay : C.ink; ctx.fillText(p.s, xx, y); xx += ws[i]; });
  ctx.globalAlpha = 1;
}
// the phone: on screen from the first frame. camera keys [time, k, focus x, focus y (CSS), canvas x, canvas y]
const REST = [2.05, 195, 422, 540, 1330];
const CAM = [[0, 2.12, 195, 422, 540, 1300], [3.0, ...REST], [44.1, ...REST], [45.3, 2.0, 195, 422, 540, 3100], [99, 2.0, 195, 422, 540, 3100]];
function camera(t) {
  let i = 0; while (i + 1 < CAM.length && t >= CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)], p = b === a ? 0 : ease(prog(t, a[0], b[0]));
  return { k: Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), p)), fx: lerp(a[2], b[2], p), fy: lerp(a[3], b[3], p), cx: lerp(a[4], b[4], p), cy: lerp(a[5], b[5], p) };
}

// the day, beat by beat. [start, card text ('*' marks the clay italic part)]
// first cut's beat starts -> tightened beat starts (each beat = 0.6 s card lead + its line + 0.7 s); every time inside a beat is mapped across
const OLD = [0, 6.5, 15, 22, 29.5, 37, 46, 52], NEW = [0, 5.98, 12.43, 18.13, 24.48, 32.3, 39.71, 44.69];
function T(x) { let i = 0; while (i + 2 < OLD.length && x >= OLD[i + 1]) i++; return NEW[i] + (x - OLD[i]) * (NEW[i + 1] - NEW[i]) / (OLD[i + 1] - OLD[i]); }
const BEATS = [[0.0, 'Heavy *lunch.*'], [6.5, 'Lunch *out.*'], [15.0, 'Had something *else.*'], [22.0, 'Craving *at six.*'], [29.5, 'Make it *gentler.*'], [37.0, 'More *vegetables.*'], [46.0, 'Whatever your *day does.*']].map(([a, x]) => [T(a), x]);
const END = NEW[NEW.length - 1];
// the card: comes up over the dimmed phone as each beat opens, then settles to the top as the beat's label
function cards(ctx, t) {
  BEATS.forEach(([a, raw], i) => {
    const b = i + 1 < BEATS.length ? BEATS[i + 1][0] : END; if (t < a - 0.01 || t > b) return;
    const big = E.outCubic(prog(t, a, a + 0.6)) * (1 - ease(prog(t, a + 1.5, a + 2.2)));
    const lab = out(prog(t, a + 1.8, a + 2.6)) * (1 - E.inCubic(prog(t, b - 0.5, b)));
    if (big > 0) {
      ctx.fillStyle = `rgba(242,236,225,${0.88 * big})`; ctx.fillRect(0, 0, W, H);
      const cw = 900, ch = 300, cy = 900 + (1 - big) * 24;
      ctx.save(); ctx.globalAlpha = big; ctx.translate(W / 2, cy); ctx.rotate(-0.012);
      ctx.shadowColor = 'rgba(45,30,14,0.3)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 28; ctx.fillStyle = C.surface; ctx.fillRect(-cw / 2, -ch / 2, cw, ch); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(29,26,22,0.18)'; ctx.lineWidth = 2; ctx.strokeRect(-cw / 2 + 22, -ch / 2 + 22, cw - 44, ch - 44);
      ctx.restore(); lineMixed(ctx, raw, W / 2, cy + 30, 92, big);
    }
    if (lab > 0) lineMixed(ctx, raw, W / 2, 300 + (1 - lab) * 16, 80, lab);
  });
}
// what the phone shows. [time, shot, cross-fade seconds]
const SCREENS = [[0, 's03', 0], [6.5, 'm1', 0.4], [10.2, 'm3', 0.45], [15.0, 'd1', 0.4], [17.2, 'd2', 0.4], [19.4, 'd3', 0.4], [22.0, 'k1', 0.4], [24.2, 'k2', 0.5],
  [29.5, 'k4', 0.4], [32.6, 'k5', 0.3], [37.0, 'v1', 0.4], [39.0, 'v2', 0.3], [42.0, 'v3', 0.45], [46.0, 't1', 0.45]].map(([a, k, f]) => [T(a), k, f]);
const TAPS = [[16.9, 340, 745], [32.45, 278, 427], [38.4, 342, 515], [38.8, 342, 515]].map(([a, x, y]) => [T(a), x, y]);
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


// a detail lifts out of the screen and comes forward. [shot, rect (CSS px), in, out, width, centre y]
const LIFTS = [
  ['s03', [17, 112, 356, 142], 2.4, 5.8, 980, 1130],
  ['m3', [16, 123, 358, 452], 10.7, 14.4, 900, 1180],
  ['d2', [0, 399, 390, 336], 17.6, 19.0, 980, 1150],
  ['d3', [0, 262, 390, 76], 19.8, 21.6, 1000, 1100],
  ['k2', [16, 150, 358, 284], 24.7, 28.6, 960, 1150],
  ['k4', [32, 368, 326, 152], 30.7, 32.3, 980, 1120],
  ['k5', [32, 394, 326, 202], 33.0, 36.6, 980, 1150],
  ['v2', [16, 258, 358, 401], 39.4, 41.7, 900, 1160],
  ['v3', [16, 353, 358, 340], 42.5, 45.6, 940, 1150],
  ['t1', [16, 384, 358, 52], 47.0, 51.2, 1000, 1080],
].map(([k, r, a, b, w, y]) => [k, r, T(a), Math.min(T(b), END - 0.5), w, y]);
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


// the close, as in the 30 s film: the plate settles, the name comes up as it is said, then 'Made for you.'; the reply line sits under it, on screen only
const PLATE = { cx: 210, cy: 278, r: 119 };       // the plate illustration on the k2 capture, CSS px (same layout as the 30 s film's)
function close(ctx, t, IMG) {
  const tn = END + 1.0, tm = END + 2.42; if (t < tn - 1.6) return;
  const drift = 1 + 0.025 * ease(prog(t, tn, END + 6.3));
  ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(drift, drift); ctx.translate(-W / 2, -1000);
  const p = ease(prog(t, tn - 0.6, tn + 0.6)), R = 250 * lerp(0.86, 1, p), cy = lerp(740, 690, p), rot = lerp(-0.35, 0, p);
  if (p > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.6); ctx.translate(W / 2, cy); ctx.rotate(rot);
    ctx.save(); ctx.shadowColor = 'rgba(45,30,14,0.28)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip(); ctx.imageSmoothingQuality = 'high';
    const s = 3, src = PLATE.r * s; ctx.drawImage(IMG.k2, PLATE.cx * s - src, PLATE.cy * s - src, src * 2, src * 2, -R, -R, R * 2, R * 2);
    ctx.restore();
  }
  const title = 'NEXT PLATE', size = 120, track = 24; ctx.font = fD(size, 600);
  const ws = [...title].map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b + track, -track);
  let x = W / 2 - total / 2; ctx.fillStyle = C.ink; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { const k = out(prog(t, tn - 0.15 + i * 0.045, tn + 0.55 + i * 0.045)); if (k > 0) { ctx.globalAlpha = k; ctx.fillText(ch, x, 1110 + (1 - k) * 22); } x += ws[i] + track; });
  ctx.globalAlpha = 1;
  const r = out(prog(t, tn + 0.45, tn + 1.4)); ctx.fillRect(W / 2 - 450 * r, 1156, 900 * r, 3); ctx.fillRect(W / 2 - 450 * r, 1167, 900 * r, 1.2);
  const m = out(prog(t, tm - 0.15, tm + 0.8)); lineMixed(ctx, '*Made for you.*', W / 2, 1290 + (1 - m) * 14, 96, m);
  const c = out(prog(t, tm + 1.3, tm + 2.1)); ctx.save(); ctx.globalAlpha = c; ctx.font = fD(52); ctx.fillStyle = '#6A6052'; ctx.textAlign = 'center'; ctx.fillText('Reply \u201Cplate\u201D for your link.', W / 2, 1450 + (1 - c) * 10); ctx.restore();
  ctx.restore();
}

// sound: a soft tap on each tap, a small chime as each card and each detail arrives, a low bell as the plate lands
const HITS = [...TAPS.map(([tt]) => [tt, 'tap', 'tick', { gain: 0.11 }]), ...BEATS.map(([a]) => [a + 0.1, 'card', 'bell', { pitch: 'E5', gain: 0.04, len: 1.0 }]),
  ...LIFTS.map(([, , a]) => [a + 0.15, 'detail arrives', 'bell', { pitch: 'A5', gain: 0.04, len: 1.0 }]), [END + 1.45, 'plate lands', 'bell', { pitch: 'D6', gain: 0.05, len: 1.6 }]];

const shots = { s03: '03-today-directive', m1: 'M1-rescue-entry', m3: 'M3-order', d1: 'D1-log-ask', d2: 'D2-log-estimate', d3: 'D3-day-updated', k1: 'K1-ask', k2: 'K2-plate',
  k4: 'K4-taps', k5: 'K5-gentler', v1: 'V1-builder', v2: 'V2-more-veg', v3: 'V3-curve', t1: 'T1-day-done' };
M.film({
  fonts: [fD(78), fD(78, 600), fI(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS.map(([s, ...r]) => [s / (60 / 72), ...r]),
  samples: 10,
  init() { GRAIN = makeGrain(); },
  draw(ctx, u, t, IMG) { page(ctx); phone(ctx, t, IMG); lifts(ctx, t, IMG); cards(ctx, t); close(ctx, t, IMG); },
});
