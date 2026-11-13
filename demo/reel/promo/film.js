// Next Plate promo: "the question, answered fresh". A pure function of time: window.seek(t) paints frame t.
// The narration (vo.js, the owner's voice on the beat grid) is the clock; each spoken word lands on screen as it is said.
// Every app screen is a capture of the app (capture.js, 3x); positions below are CSS px in the 390 x 844 phone viewport,
// taken from assets/rects.json. docs/shotlist.md is the plan this file follows.
import * as M from './lib/motion.js';
import { VO } from './vo.js';

const { W, H, E, prog, lerp, clamp, spring, springU, SPRING, wobble, mix, noise1, mulberry32, TAU, bump } = M;

// Raw Linen: the app's own tokens. One accent (clay).
const C = { paper: '#F2ECE1', surface: '#FAF6EE', ink: '#1D1A16', ink2: '#4B443B', ink3: '#857967', line: '#DCD1BF', clay: '#B0613D', olive: '#6B7A3A', kraft: '#DCC8A6' };
const fD = (size, w = 500) => `${w} ${Math.round(size)}px Display`;           // EB Garamond
const fI = (size, w = 500) => `italic ${w} ${Math.round(size)}px Display`;    // EB Garamond italic
const fH = (size, w = 700) => `${w} ${Math.round(size)}px UI`;                // Caveat (the app's handwriting)

const CX = 540, RULE_Y = 772, TX = 84, TW = 890, BASE_Y = 700;
const per = () => M.GRID.period;
const sp = (u, u0, cfg) => spring((u - u0) * per(), cfg);
const CAMSPRING = { stiffness: 95, damping: 20 };

// ------------------------------------------------------------------ the spoken line, set as type
// Each block is one sentence, pre-broken into rows; *...* marks the accent words. Tokens map 1:1 to the narration's
// words (checked at load), so a word rises into place as it is spoken. Later sentences push earlier ones up and dim them.
const SEGS = [
  { out: 9.25, blocks: [
    { line: 1, from: 0, size: 78, rows: ['Three times a day,', 'the same question.'] },
    { line: 1, from: 7, size: 126, pre: -0.5, rows: ['*What should I*', '*eat now?*'] } ] },
  { out: 16.2, blocks: [
    { line: 2, from: 0, rows: ['A diet chart', 'answers it *once.*'] },
    { line: 2, from: 6, rows: ['Then your day *happens.*'] } ] },
  { out: 24.1, list: true, blocks: [
    { line: 2, from: 10, rows: ['Breakfast gets *skipped.*'] },
    { line: 2, from: 13, rows: ['Lunch is at a *wedding.*'] },
    { line: 2, from: 18, rows: ['Dinner is at *ten.*'] } ] },
  { out: 29.45, blocks: [
    { line: 3, from: 0, size: 90, rows: ['*Next Plate* answers it', 'fresh, every meal.'] } ] },
  { out: 36.45, blocks: [
    { line: 3, from: 7, rows: ['It is a *dietitian in your*', '*pocket* that knows how', 'your day is actually going.'] } ] },
  { out: 42.25, blocks: [
    { line: 4, from: 0, rows: ['So you don\'t have', 'to *decide.*'] },
    { line: 4, from: 6, rows: ['You get *one clear plate.*'] } ] },
  { out: 49.45, blocks: [
    { line: 4, from: 11, rows: ['*Real food,*', 'in *real amounts,*'] },
    { line: 4, from: 16, rows: ['and the reason it is', '*right for you today.*'] } ] },
  { out: 53.7, blocks: [
    { line: 5, from: 0, rows: ['Ate something else?'] },
    { line: 5, from: 3, rows: ['*Just tell it.*'] } ] },
  { out: 61.5, blocks: [
    { line: 5, from: 6, rows: ['It doesn\'t *scold* you.'] },
    { line: 5, from: 10, rows: ['It counts the meal,', 'and quietly adjusts', '*the rest of your day.*'] } ] },
  { out: 70.45, blocks: [
    { line: 6, from: 0, rows: ['Eating out anyway?'] },
    { line: 6, from: 3, rows: ['It shows you the two or', 'three moves that make', 'even *chole bhature* fit.'] } ] },
  { out: 77.45, blocks: [
    { line: 7, from: 0, rows: ['It *remembers your week,*', 'so dinner isn\'t', '*rajma* again.'] } ] },
  { out: 81.35, blocks: [
    { line: 8, from: 0, rows: ['Your numbers are not', 'copied from a chart.'] } ] },
  { out: 89.45, blocks: [
    { line: 8, from: 8, rows: ['They are worked out from', '*your age, your body*', '*and your goal.*'] },
    { line: 8, from: 20, rows: ['And it shows you *how.*'] } ] },
  { out: 97.15, blocks: [
    { line: 9, from: 0, rows: ['And it is *careful.*'] },
    { line: 9, from: 4, rows: ['With diabetes, the grain', '*stays on your plate.*'] } ] },
  { out: 103.4, blocks: [
    { line: 9, from: 12, rows: ['If something needs', '*your doctor,* it says so,', 'and steps back.'] } ] },
  { out: 111.0, list: true, blocks: [
    { line: 10, from: 0, size: 90, rows: ['No guesswork.'] },
    { line: 10, from: 2, size: 90, rows: ['No guilt.'] },
    { line: 10, from: 4, size: 90, rows: ['Just your next plate,', '*decided.*'] } ] },
];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function buildText(ctx) {
  for (const sg of SEGS) for (const b of sg.blocks) {
    const words = VO[b.line - 1].words; let wi = b.from, acc = false;
    b.rowsTok = b.rows.map((row) => row.split(' ').map((raw) => {
      let t = raw, a = acc;
      if (t.startsWith('*')) { t = t.slice(1); a = true; acc = true; }
      if (t.endsWith('*')) { t = t.slice(0, -1); a = true; acc = false; }
      return { t, a };
    }));
    let size = b.size || 84;
    const measure = () => { let mw = 0; for (const toks of b.rowsTok) { let x = 0; for (const t of toks) { ctx.font = t.a ? fI(size) : fD(size); t.x = x; t.w = ctx.measureText(t.t).width; x += t.w + size * 0.25; } mw = Math.max(mw, x - size * 0.25); } return mw; };
    const mw = measure(); if (mw > TW) { size = Math.floor(size * TW / mw); measure(); }
    b.size = size; b.lh = Math.round(size * 1.19); b.h = b.rowsTok.length * b.lh;
    for (const toks of b.rowsTok) for (const t of toks) { const w = words[wi++]; if (!w || norm(w[0]) !== norm(t.t)) console.error('narration mismatch', b.line, t.t, w && w[0]); t.u0 = w ? w[1] : 0; t.n = wi - 1 - b.from; }
    b.tIn = b.rowsTok[0][0].u0 - 0.42;
  }
}
function drawText(ctx, u) {
  for (const sg of SEGS) {
    const B = sg.blocks;
    if (u < Math.min(B[0].tIn, ...B.map((b) => (b.pre != null ? b.pre : 1e9))) - 0.05 || u >= sg.out) continue;
    const pout = E.inCubic(prog(u, sg.out - 0.5, sg.out));
    const en = B.map((b, i) => (i === 0 || b.pre != null ? 1 : sp(u, b.tIn, { stiffness: 210, damping: 25 })));
    B.forEach((b, i) => {
      if (i > 0 && en[i] <= 0) return;
      let up = 0, dim = 0;
      for (let j = i + 1; j < B.length; j++) { up += en[j] * (B[j].h + 26); dim = Math.max(dim, B[j].pre != null ? clamp(sp(u, B[j].tIn, { stiffness: 210, damping: 25 })) : clamp(en[j])); }
      if (sg.list) dim *= 0.35;
      const ink = mix(C.ink, C.ink3, dim * 0.92), accent = mix(C.clay, '#C7A994', dim * 0.9);
      b.rowsTok.forEach((toks, r) => {
        const y = BASE_Y - up - (b.rowsTok.length - 1 - r) * b.lh - pout * 46;
        ctx.save(); ctx.globalAlpha = 1 - pout;
        ctx.beginPath(); ctx.rect(0, y - b.size * 0.98, W, b.size * 1.3); ctx.clip();
        for (const t of toks) {
          const said = sp(u, t.u0 - 0.16, { stiffness: 330, damping: 29 });
          const k = b.pre != null ? sp(u, b.pre + t.n * 0.07, { stiffness: 300, damping: 26 }) : said;
          if (k <= 0.001) continue;
          ctx.font = t.a ? fI(b.size) : fD(b.size); ctx.fillStyle = b.pre != null ? mix('#D9C3B1', C.clay, clamp(said)) : t.a ? accent : ink; ctx.textAlign = 'left';
          ctx.fillText(t.t, TX + t.x, y + (1 - k) * b.size * 1.16);
        }
        ctx.restore();
      });
    });
  }
}

// ------------------------------------------------------------------ hand-drawn marks (the journal's pen)
function pen(ctx, width = 6, color = C.clay) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
function handLine(ctx, x0, y0, x1, y1, p, seed = 1, amp = 3) {
  if (p <= 0) return; const n = 22; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const t = Math.min(i / n, p); const x = lerp(x0, x1, t), y = lerp(y0, y1, t) + amp * noise1(t * 3.3 + seed, seed) + amp * 0.5 * Math.sin(t * 5 + seed); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); if (i / n >= p) break; }
  ctx.stroke();
}
function handEllipse(ctx, cx, cy, rx, ry, p, seed = 1) {
  if (p <= 0) return; const n = 72, a0 = -2.5 + 0.3 * Math.sin(seed), total = TAU * 1.07; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const t = Math.min(i / n, p), a = a0 + total * t, wob = 1 + 0.035 * Math.sin(a * 2 + seed) + 0.02 * noise1(t * 4, seed), grow = 0.97 + 0.07 * t;
    const x = cx + rx * wob * grow * Math.cos(a), y = cy + ry * wob * grow * Math.sin(a); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); if (i / n >= p) break; }
  ctx.stroke();
}
function writeOn(ctx, str, x, y, f, color, p, align = 'left') {
  if (p <= 0) return; ctx.font = f; const w = ctx.measureText(str).width, size = parseFloat(f.match(/(\d+)px/)[1]), x0 = align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 12, y - size * 1.05, (w + 24) * p, size * 1.6); ctx.clip();
  ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(str, x0, y); ctx.restore();
}

// ------------------------------------------------------------------ paper, rule
let PAPER = null, SHADOW = null;
function makePaper() {
  const c = document.createElement('canvas'); c.width = 540; c.height = 480; const x = c.getContext('2d'), r = mulberry32(7);
  x.fillStyle = C.paper; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 520; i++) { x.fillStyle = `rgba(90,70,45,${0.03 + 0.06 * r()})`; x.beginPath(); x.arc(r() * c.width, r() * c.height, 0.5 + 1.1 * r(), 0, TAU); x.fill(); }
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,252,244,${0.25 + 0.3 * r()})`; x.beginPath(); x.arc(r() * c.width, r() * c.height, 0.6 + 1.3 * r(), 0, TAU); x.fill(); }
  return c;
}
function makeShadow() {
  const c = document.createElement('canvas'); c.width = 390 + 240; c.height = 844 + 240; const x = c.getContext('2d');
  x.shadowColor = 'rgba(52,34,16,0.34)'; x.shadowBlur = 46; x.shadowOffsetX = 2000; x.shadowOffsetY = 20;
  x.beginPath(); x.roundRect(120 - 2000, 120, 390, 844, 30); x.fill(); return c;
}
function paper(ctx, x, y, w, h) { ctx.fillStyle = ctx.createPattern(PAPER, 'repeat'); ctx.fillRect(x, y, w, h); }
function drawRule(ctx, u) {
  const k = sp(u, 111.0, SPRING.gentle);                                      // the rule becomes the masthead's rule
  const y = lerp(RULE_Y, 980, k), x0 = lerp(TX, 150, k), x1 = lerp(W - TX, 930, k), g = 1;
  ctx.fillStyle = C.ink; ctx.fillRect(x0, y, (x1 - x0) * g, 4); ctx.fillRect(x0, y + 9, (x1 - x0) * g, 1.5);
}

// ------------------------------------------------------------------ S1: the question (an empty plate)
const P1 = { cx: 540, cy: 1300, r: 322 };
const DIAL = [['BREAKFAST', -2.725, 1.95], ['LUNCH', -1.8, 2.4], ['SNACK', -1.07, 0], ['DINNER', -0.29, 2.8]];
function arcWord(ctx, str, cx, cy, r, mid, f, color, track) {
  ctx.font = f; const ws = [...str].map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b + track, -track);
  let a = mid - total / 2 / r; ctx.fillStyle = color; ctx.textAlign = 'center';
  [...str].forEach((ch, i) => { const ang = a + ws[i] / 2 / r; ctx.save(); ctx.translate(cx + r * Math.cos(ang), cy + r * Math.sin(ang)); ctx.rotate(ang + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); a += (ws[i] + track) / r; });
}
function sceneQuestion(ctx, u) {
  if (u > 10.9) return;
  const exit = E.inCubic(prog(u, 9.35, 10.75));
  const fall = sp(u, -0.2, { stiffness: 150, damping: 15 });                   // mid-fall on frame 0, down within the first beat
  const sq = 0.05 * wobble(u - 0.15, 1.7, 3.2);
  const cx = P1.cx - exit * 260, cy = P1.cy - (1 - fall) * 1500 + exit * 1250, R = P1.r, rot = (1 - fall) * -0.5 + exit * 1.1;
  ctx.save(); ctx.translate(cx, cy + R); ctx.scale(1 + sq, 1 - sq); ctx.translate(0, -R); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(52,34,16,0.26)'; ctx.shadowBlur = 54; ctx.shadowOffsetY = 26; ctx.fillStyle = '#EADCC6'; ctx.beginPath(); ctx.arc(0, 0, R - 2, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#F7F0E4'; ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, TAU); ctx.fill();
  pen(ctx, 14); ctx.beginPath(); ctx.arc(0, 0, R - 7, 0, TAU); ctx.stroke();
  pen(ctx, 2.5, C.line); ctx.beginPath(); ctx.arc(0, 0, R * 0.7, 0, TAU); ctx.stroke();
  // the dial: the three meals light up as "three times a day" is said, then take their turns, day after day
  const turn = [[4.0, 5.4], [4.4, 5.8], [], [4.8, 6.2]];
  DIAL.forEach(([w, a, u0], i) => {
    const lit = u0 ? sp(u, u0, SPRING.bouncy) : 0, pulse = turn[i].reduce((m, t) => Math.max(m, bump(u, t + 0.12, 0.42)), 0);
    arcWord(ctx, w, 0, 0, R * 0.835, a, fD(27, 600), mix(C.ink3, C.clay, clamp(lit)), 7);
    if (lit <= 0) return;
    const rr = R + 46, x = rr * Math.cos(a), y = rr * Math.sin(a);
    ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(x, y, 14 * Math.min(lit, 1.25) * (1 + 0.5 * pulse), 0, TAU); ctx.fill();
    for (const t of turn[i]) { const q = prog(u, t, t + 1.1); if (q > 0 && q < 1) { ctx.globalAlpha = (1 - q) * 0.7; pen(ctx, 4); ctx.beginPath(); ctx.arc(x, y, 16 + 44 * E.outCubic(q), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; } }
  });
  // the question itself
  const q = sp(u, 7.5, SPRING.bouncy);
  if (q > 0) { ctx.save(); ctx.translate(0, 118); ctx.rotate(-0.07 + 0.12 * wobble(u - 7.5, 1.6, 2.2)); ctx.scale(q, q); ctx.font = fH(430); ctx.fillStyle = C.clay; ctx.textAlign = 'center'; ctx.fillText('?', 0, 0); ctx.restore(); }
  ctx.restore();
}

// ------------------------------------------------------------------ S2: the diet chart, and the day that happens to it
const CHART = { w: 830, h: 668, cx: 540, cy: 1262 };
const ROWS = [['Breakfast', '8:00 am', 'Oats, fruit, a few nuts'], ['Lunch', '1:00 pm', 'Roti, dal, sabzi, salad'], ['Snack', '5:00 pm', 'Fruit, buttermilk'], ['Dinner', '8:00 pm', 'Khichdi, vegetables']];
function sceneChart(ctx, u) {
  if (u < 9.3 || u > 25.6) return;
  const k = sp(u, 9.45, SPRING.gentle), jolt = sp(u, 13.85, { stiffness: 200, damping: 9 }), exit = E.inCubic(prog(u, 24.05, 25.35));
  const cx = CHART.cx + exit * 240, cy = CHART.cy + (1 - k) * 1300 + exit * 1350 + jolt * 14;
  const rot = -0.04 + (1 - k) * 0.14 + jolt * 0.075 + exit * 0.5;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-CHART.w / 2, -CHART.h / 2);
  ctx.save(); ctx.shadowColor = 'rgba(52,34,16,0.28)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.roundRect(0, 0, CHART.w, CHART.h, 10); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(1, 1, CHART.w - 2, CHART.h - 2, 10); ctx.stroke();
  ctx.font = fD(28, 600); ctx.fillStyle = C.ink3; ctx.textAlign = 'left'; ctx.letterSpacing = '9px'; ctx.fillText('DIET CHART', 52, 78); ctx.letterSpacing = '0px';
  ctx.font = fI(30); ctx.textAlign = 'right'; ctx.fillText('same every day', CHART.w - 52, 78);
  ctx.fillStyle = C.ink; ctx.fillRect(52, 104, CHART.w - 104, 3);
  ROWS.forEach((r, i) => {
    const y = 190 + i * 132;
    ctx.textAlign = 'left'; ctx.font = fD(50, 600); ctx.fillStyle = C.ink; ctx.fillText(r[0], 52, y);
    ctx.font = fI(36); ctx.fillStyle = C.ink2; ctx.fillText(r[2], 52, y + 50);
    ctx.textAlign = 'right'; ctx.font = fD(40, 500); ctx.fillStyle = C.ink2; ctx.fillText(r[1], CHART.w - 52, y);
    if (i < 3) { ctx.fillStyle = C.line; ctx.fillRect(52, y + 78, CHART.w - 104, 2); }
  });
  // the day happens: the pen goes through the chart as each line is spoken
  const mark = (i, u0, word, x0, x1) => {
    const y = 190 + i * 132; pen(ctx, 8);
    handLine(ctx, x0, y - 16, x1, y - 12, E.outCubic(prog(u, u0, u0 + 0.5)), i + 2, 4);
    handLine(ctx, x0 + 6, y + 36, x1 - 40, y + 40, E.outCubic(prog(u, u0 + 0.22, u0 + 0.7)), i + 5, 4);
    ctx.save(); ctx.translate(CHART.w - 60, y + 54); ctx.rotate(-0.06); writeOn(ctx, word, -ctxW(ctx, word, fH(70)), 0, fH(70), C.clay, E.outCubic(prog(u, u0 + 0.3, u0 + 1.0))); ctx.restore();
  };
  mark(0, 17.35, 'skipped', 44, 470);
  mark(1, 19.95, 'at a wedding', 44, 440);
  // dinner: only the hour is wrong
  const y3 = 190 + 3 * 132; pen(ctx, 8);
  handLine(ctx, CHART.w - 206, y3 - 14, CHART.w - 44, y3 - 18, E.outCubic(prog(u, 22.2, 22.6)), 9, 3);
  ctx.save(); ctx.translate(CHART.w - 60, y3 + 58); ctx.rotate(-0.06); writeOn(ctx, '10 pm', -ctxW(ctx, '10 pm', fH(78)), 0, fH(78), C.clay, E.outCubic(prog(u, 22.35, 22.95))); ctx.restore();
  ctx.restore();
}
const ctxW = (ctx, str, f) => { ctx.font = f; return ctx.measureText(str).width; };

// ------------------------------------------------------------------ S3 to S9: the phone (app captures only)
// screens: [beat, shot]; camera: [beat, zoom (canvas px per CSS px), focus x, focus y (CSS px), canvas y the focus sits at]
const SCREENS = [[24.3, 's03'], [36.9, 's04'], [42.6, 's05b'], [45.6, 's05'], [49.9, 'sD1'], [55.9, 'sD2'], [57.95, 'sD3'], [61.9, 's14'], [63.95, 's15'],
  [70.9, 's18'], [77.85, 's03'], [81.6, 's07']];
const SWAP = 0.36;
const CAM = [[24.3, 1.28, 195, 422, 1352], [28.0, 1.95, 195, 250, 1130], [32.0, 2.45, 195, 222, 1118],
  [36.54, 1.95, 195, 292, 1150], [39.6, 2.1, 195, 452, 1140],
  [42.24, 2.25, 195, 300, 1160], [45.24, 2.35, 195, 250, 1150],
  [49.54, 2.3, 195, 741, 1300], [55.54, 1.85, 195, 620, 1160], [57.59, 2.3, 195, 190, 1130],
  [61.54, 2.15, 195, 250, 1130], [63.59, 1.95, 195, 446, 1130], [67.0, 2.1, 195, 215, 1140],
  [70.54, 2.1, 195, 215, 1130], [72.9, 2.45, 195, 262, 1130],
  [77.49, 2.3, 195, 235, 1130], [81.24, 2.05, 195, 330, 1130], [84.5, 2.05, 195, 475, 1130], [87.4, 1.62, 195, 505, 1272]];
function camera(u) {
  let v = [Math.log(CAM[0][1]), CAM[0][2], CAM[0][3], CAM[0][4]];
  for (let i = 1; i < CAM.length; i++) {
    const k = sp(u, CAM[i][0], CAMSPRING); if (k === 0) break;
    const a = CAM[i - 1], b = CAM[i];
    v[0] += (Math.log(b[1]) - Math.log(a[1])) * k; v[1] += (b[2] - a[2]) * k; v[2] += (b[3] - a[3]) * k; v[3] += (b[4] - a[4]) * k;
  }
  return { k: Math.exp(v[0]), fx: v[1], fy: v[2], ay: v[3] };
}
// marks on a shot: u = when the pen starts. kinds: 'u' underline each line rect, 'o' ellipse round a rect, 'tap' a touch.
const MARKS = [
  ['s03', 33.0, 'u', [[279, 132, 62, 22], [36, 158, 122, 22]], 36.9],                 // So far 820 kcal and 22 g protein.
  ['s03', 34.3, 'u', [[162, 155, 170, 23], [36, 179, 228, 24]], 36.9],                // Dinner carries ..., to catch up on protein.
  ['s04', 40.5, 'o', [28, 400, 334, 88], 42.6],                                       // the plate's name
  ['s05b', 44.2, 'o', [30, 171, 70, 44], 45.6], ['s05b', 44.6, 'o', [30, 231, 70, 44], 45.6],   // 130 g, 110 g
  ['s05', 46.9, 'o', [30, 243, 330, 52], 49.9],                                       // planned around: ...
  ['sD1', 53.25, 'tap', [349, 745], 55.9],
  ['sD1', 54.1, 'u', [[196, 787, 138, 19]], 55.9],                                    // It is counted, not judged
  ['sD2', 56.5, 'u', [[16, 662, 318, 21]], 57.95],                                     // = 558 kcal . 14 g protein ...
  ['sD2', 57.3, 'tap', [286, 802], 57.95],                                            // Yes, count it
  ['sD3', 59.4, 'u', [[162, 155, 182, 23], [36, 179, 214, 24]], 61.9],                // Snack carries ..., lighter after earlier meals.
  ['s14', 62.45, 'u', [[18, 131, 246, 36]], 63.95],                                     // Eating out anyway
  ['s15', 65.4, 'o', [14, 346, 362, 64], 67.6],                                       // the first move
  ['s15', 69.0, 'o', [122, 257, 113, 27], 70.9],                                      // Fit 45 -> 68 / 100
  ['s18', 73.5, 'u', [[79, 268, 99, 22]], 77.85],                                      // dinners run late
  ['s18', 74.85, 'o', [186, 265, 130, 28], 77.85],                                     // less rajma this week
  ['s03', 78.4, 'u', [[84, 132, 190, 22]], 81.6],                                     // About 1200 kcal and 75 g protein.
  ['s03', 80.1, 'u', [[38, 211, 195, 21]], 81.6], ['s03', 80.85, 'tap', [135, 221], 81.6],       // How these numbers are worked out
  ['s07', 83.2, 'u', [[289, 270, 48, 21], [52, 292, 86, 21]], 89.85],                  // age, sex, height, weight
  ['s07', 85.0, 'u', [[52, 532, 106, 21]], 89.85],                                     // counted on 62 kg
  ['s07', 86.1, 'u', [[52, 370, 76, 21]], 89.85],                                      // Weight loss.
  ['s07', 88.3, 'o', [12, 198, 286, 32], 89.85],                                       // How these numbers are worked out
];
function scenePhone(ctx, u, IMG) {
  if (u < 24.2 || u > 90.7) return;
  const cam = camera(u), enter = sp(u, 24.3, { stiffness: 80, damping: 17 }), exit = E.inCubic(prog(u, 89.3, 90.6));
  const yOff = (1 - enter) * 1500 + exit * 1500, k = cam.k;
  const X = (x) => CX + (x - cam.fx) * k, Y = (y) => cam.ay + (y - cam.fy) * k + yOff;
  const left = X(0), top = Y(0), w = 390 * k, h = 844 * k, rad = 30 * k;
  let si = 0; while (si + 1 < SCREENS.length && u >= SCREENS[si + 1][0]) si++;
  let si2 = si; if (si + 1 < SCREENS.length && u >= SCREENS[si + 1][0] - SWAP) si2 = si + 1;      // the next screen is on its way in
  const cur = SCREENS[si], nxt = SCREENS[si2], p = si2 === si ? 1 : E.outQuint(prog(u, nxt[0] - SWAP, nxt[0]));
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(SHADOW, left - 120 * k, top - 120 * k, SHADOW.width * k, SHADOW.height * k);
  ctx.save(); ctx.beginPath(); ctx.roundRect(left, top, w, h, rad); ctx.clip();
  ctx.drawImage(IMG[cur[1]], left, top, w, h);
  // typing: the field is covered and uncovered as the meal is "said"
  if (cur[1] === 'sD1') { const ty = prog(u, 51.15, 52.95), tx = 30 + Math.floor(ty * 24) / 24 * 168; ctx.fillStyle = '#FAF6EE'; ctx.fillRect(X(tx), Y(727), (204 - tx) * k, 36 * k);
    if (ty > 0 && ty < 1 || (ty === 0 && Math.floor(u * 2) % 2 === 0)) { ctx.fillStyle = C.ink; ctx.fillRect(X(tx + 2), Y(732), 1.2 * k, 26 * k); } }
  // the pen
  for (const [shot, u0, kind, r, u1] of MARKS) {
    if (shot !== cur[1] || u < u0 || u >= u1) continue;
    if (kind === 'u') { pen(ctx, 5.5); ctx.globalAlpha = 0.92; r.forEach((q, i) => handLine(ctx, X(q[0]), Y(q[1] + q[3] + 1), X(q[0] + q[2]), Y(q[1] + q[3] + 1.5), E.outCubic(prog(u, u0 + i * 0.3, u0 + 0.45 + i * 0.3)), q[0] + i, 2.2)); ctx.globalAlpha = 1; }
    else if (kind === 'o') { pen(ctx, 5.5); ctx.globalAlpha = 0.92; handEllipse(ctx, X(r[0] + r[2] / 2), Y(r[1] + r[3] / 2), r[2] / 2 * k + 14, r[3] / 2 * k + 12, E.outCubic(prog(u, u0, u0 + 0.8)), r[0]); ctx.globalAlpha = 1; }
    else { const a = prog(u, u0, u0 + 0.7); if (a < 1) { ctx.globalAlpha = (1 - a) * 0.8; pen(ctx, 5, C.ink); ctx.beginPath(); ctx.arc(X(r[0]), Y(r[1]), (8 + 30 * E.outCubic(a)) * k, 0, TAU); ctx.stroke(); ctx.fillStyle = C.ink; ctx.globalAlpha = (1 - a) * 0.35; ctx.beginPath(); ctx.arc(X(r[0]), Y(r[1]), 12 * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; } }
  }
  if (p < 1) { const oy = (1 - p) * h; ctx.fillStyle = 'rgba(29,26,22,' + 0.22 * p + ')'; ctx.fillRect(left, top, w, h); ctx.drawImage(IMG[nxt[1]], left, top + oy, w, h);
    if (nxt[1] === 'sD1') { ctx.fillStyle = '#FAF6EE'; ctx.fillRect(X(30), Y(727) + oy, 174 * k, 36 * k); } }
  ctx.restore();
  ctx.strokeStyle = 'rgba(29,26,22,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(left, top, w, h, rad); ctx.stroke();
}

// ------------------------------------------------------------------ S9: careful (two cards cut from the captured screens)
const NOTE = { shot: 's06', r: [4, 172, 382, 115], w: 950, feather: 5 }, GRAIN = { shot: 's05b', r: [22, 226, 346, 56], w: 880 }, STEP = { shot: 's19', r: [16, 113, 358, 290], w: 880 };
const CUT = new Map();
function cutout(IMG, c) {
  if (!c.feather) return null; if (CUT.has(c)) return CUT.get(c);
  const cv = document.createElement('canvas'); cv.width = c.r[2] * 3; cv.height = c.r[3] * 3; const x = cv.getContext('2d'), f = c.feather * 3;
  x.drawImage(IMG[c.shot], c.r[0] * 3, c.r[1] * 3, cv.width, cv.height, 0, 0, cv.width, cv.height);
  x.globalCompositeOperation = 'destination-in'; x.filter = `blur(${f * 0.6}px)`; x.fillRect(f, f, cv.width - 2 * f, cv.height - 2 * f);
  CUT.set(c, cv); return cv;
}
function card(ctx, IMG, c, cx, cy, rot, zoom, marks, u, framed, rings = []) {
  const k = c.w / c.r[2] * zoom, w = c.r[2] * k, h = c.r[3] * k;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-w / 2, -h / 2); ctx.imageSmoothingQuality = 'high';
  if (framed) { ctx.save(); ctx.shadowColor = 'rgba(52,34,16,0.28)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22; ctx.fillStyle = C.surface; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 8); ctx.fill(); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, w, h, framed ? 8 : 0); ctx.clip();
  const cut = cutout(IMG, c); if (cut) ctx.drawImage(cut, 0, 0, w, h); else ctx.drawImage(IMG[c.shot], c.r[0] * 3, c.r[1] * 3, c.r[2] * 3, c.r[3] * 3, 0, 0, w, h); ctx.restore();
  pen(ctx, 6); ctx.globalAlpha = 0.92;
  for (const [u0, rs] of marks) rs.forEach((q, i) => handLine(ctx, (q[0] - c.r[0]) * k, (q[1] + q[3] + 1 - c.r[1]) * k, (q[0] + q[2] - c.r[0]) * k, (q[1] + q[3] + 1.5 - c.r[1]) * k, E.outCubic(prog(u, u0 + i * 0.3, u0 + 0.45 + i * 0.3)), q[0] + i, 2.4));
  for (const [u0, q] of rings) handEllipse(ctx, (q[0] + q[2] / 2 - c.r[0]) * k, (q[1] + q[3] / 2 - c.r[1]) * k, q[2] / 2 * k + 14, q[3] / 2 * k + 10, E.outCubic(prog(u, u0, u0 + 0.8)), q[0]);
  ctx.globalAlpha = 1; ctx.restore();
}
function sceneCareful(ctx, u, IMG) {
  if (u < 89.4 || u > 104.8) return;
  // the note: in from the right, leans in on "with diabetes", leaves upward under the rule as the second card arrives
  const a = sp(u, 89.6, SPRING.gentle), up = sp(u, 97.0, { stiffness: 110, damping: 19 });
  if (up < 0.995) card(ctx, IMG, NOTE, CX + (1 - a) * 1250, 1060 - up * 640, -0.022 + (1 - a) * 0.12, 1 + 0.04 * E.inOutCubic(prog(u, 92.4, 94.2)),
    [[94.5, [[161, 197, 180, 26]]], [96.2, [[267, 221, 84, 25], [66, 242, 115, 25]]]], u, false);
  // and there it is on the plate: the grain row of the same dinner
  const g = sp(u, 94.75, { stiffness: 130, damping: 17 });
  if (g > 0 && up < 0.995) card(ctx, IMG, GRAIN, CX - (1 - g) * 1250, 1372 - up * 900, 0.016 - (1 - g) * 0.1, 1, [], u, true, [[95.35, [32, 233, 66, 41]]]);
  // the step back
  const b = sp(u, 97.0, { stiffness: 100, damping: 17 }), out = E.inCubic(prog(u, 103.15, 104.5));
  if (b > 0) card(ctx, IMG, STEP, CX - out * 200, 1225 + (1 - b) * 1300 + out * 1400, 0.012 + (1 - b) * -0.1 - out * 0.4, 1,
    [[99.0, [[127, 188, 117, 27], [34, 214, 229, 27]]], [101.4, [[188, 276, 166, 22], [34, 300, 50, 22]]]], u, true);
}

// ------------------------------------------------------------------ S10, S11: decided, and the end card
const PLATE = { cx: 209.3, cy: 277.5, r: 117.2 };    // the app's own plate art, in shot 04
function sceneDecided(ctx, u, IMG) {
  if (u < 103.6) return;
  const inn = sp(u, 103.75, { stiffness: 90, damping: 15 }), end = sp(u, 111.0, SPRING.gentle);
  const nod = 0.03 * bump(u, 106.0, 0.5) + 0.05 * E.inOutCubic(prog(u, 107.4, 109.4)) + 0.03 * wobble(u - 109.5, 1.6, 3);
  const R = lerp(300, 168, end) * (1 + nod * (1 - end)), cx = CX, cy = lerp(lerp(2400, 1285, inn), 604, end), rot = (1 - inn) * -0.8;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(52,34,16,0.30)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; ctx.fillStyle = '#E7D9C3'; ctx.beginPath(); ctx.arc(0, 0, R - 3, 0, TAU); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R - 0.5, 0, TAU); ctx.clip(); ctx.imageSmoothingQuality = 'high';
  const s = 3, src = PLATE.r * s; ctx.drawImage(IMG.s04, PLATE.cx * s - src, PLATE.cy * s - src, src * 2, src * 2, -R, -R, R * 2, R * 2); ctx.restore();
  // decided: the pen's tick
  const c = E.outCubic(prog(u, 109.45, 110.0));
  if (c > 0) { pen(ctx, R * 0.075); ctx.beginPath(); const pts = [[0.52, 0.5], [0.72, 0.74], [1.12, 0.2]], t = c * 2;
    ctx.moveTo(pts[0][0] * R, pts[0][1] * R); const a = Math.min(t, 1); ctx.lineTo(lerp(pts[0][0], pts[1][0], a) * R, lerp(pts[0][1], pts[1][1], a) * R);
    if (t > 1) ctx.lineTo(lerp(pts[1][0], pts[2][0], t - 1) * R, lerp(pts[1][1], pts[2][1], t - 1) * R); ctx.stroke(); }
  ctx.restore();
  if (u < 111.2) return;
  // masthead, as in the app
  const title = 'NEXT PLATE', size = 104, track = 17; ctx.font = fD(size, 600);
  const ws = [...title].map((ch) => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b + track, -track); let x = CX - total / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 784, W, 176); ctx.clip(); ctx.fillStyle = C.ink; ctx.textAlign = 'left';
  [...title].forEach((ch, i) => { const k = sp(u, (i < 5 ? 111.72 : 112.2) + (i % 5) * 0.05, { stiffness: 300, damping: 24 }); if (k > 0) ctx.fillText(ch, x, 940 + (1 - k) * 150); x += ws[i] + track; });
  ctx.restore();
  const tg = E.outCubic(prog(u, 112.5, 113.2)); if (tg > 0) { ctx.save(); ctx.beginPath(); ctx.rect(0, 996, W, 90); ctx.clip(); ctx.font = fI(56); ctx.fillStyle = C.clay; ctx.textAlign = 'center'; ctx.fillText('your daily plate, journalled', CX, 1056 - (1 - tg) * 70); ctx.restore(); }
  // the ask, in the owner's hand, as it is spoken
  const ask = [['Message', 112.9], ['me', 114.07], ['for', 114.43], ['your', 114.73], ['link', 114.97]], f = fH(98);
  ctx.font = f; const gap = 26, aw = ask.map((a) => ctx.measureText(a[0]).width), tot = aw.reduce((a, b) => a + b + gap, -gap); let ax = CX - tot / 2;
  ask.forEach((a, i) => { ctx.save(); ctx.translate(ax, 1290); ctx.rotate(-0.025); writeOn(ctx, a[0], 0, 0, f, C.ink, E.outCubic(prog(u, a[1] - 0.12, a[1] + 0.45))); ctx.restore(); if (i === 3) ask.x3 = ax; ax += aw[i] + gap; });
  pen(ctx, 7); handLine(ctx, ask.x3 - 6, 1318, CX + tot / 2 + 10, 1308, E.outCubic(prog(u, 115.35, 116.0)), 4, 3.5);
}

// ------------------------------------------------------------------ sound: every accent the picture makes
const tk = { gain: 0.16 }, ck = { gain: 0.2 };
const HITS = [
  [0.15, 'plate lands', 'thud', { gain: 0.4 }],
  [1.95, 'breakfast', 'tok', { pitch: 'D5', gain: 0.3 }], [2.4, 'lunch', 'tok', { pitch: 'F#5', gain: 0.3 }], [2.8, 'dinner', 'tok', { pitch: 'A5', gain: 0.3 }],
  [4.0, 'breakfast again', 'tick', tk], [4.4, 'lunch again', 'tick', tk], [4.8, 'dinner again', 'tick', tk], [5.4, 'and again', 'tick', tk], [5.8, 'and again', 'tick', tk], [6.2, 'and again', 'tick', tk],
  [7.5, 'the question', 'pop', { pitch: 'A4', to: 'D5', gain: 0.4 }],
  [9.7, 'chart in', 'whoosh', { len: 0.5, gain: 0.22 }], [10.2, 'chart lands', 'thud', { gain: 0.3 }],
  [13.85, 'the day happens', 'thud', { gain: 0.36 }],
  [17.4, 'pen: skipped', 'whoosh', { len: 0.3, from: 2600, to: 900, gain: 0.2 }], [20.0, 'pen: wedding', 'whoosh', { len: 0.3, from: 2600, to: 900, gain: 0.2 }], [22.25, 'pen: ten', 'whoosh', { len: 0.26, from: 2600, to: 900, gain: 0.2 }],
  [24.5, 'phone in', 'whoosh', { len: 0.6, gain: 0.24 }], [25.1, 'phone lands', 'thud', { gain: 0.3 }],
  [28.0, 'push in', 'tick', tk], [33.0, 'so far', 'tick', tk], [34.3, 'dinner carries', 'tick', tk],
  [36.9, 'the plate', 'click', ck], [40.5, 'its name', 'tick', tk], [42.6, 'what to serve', 'click', ck], [44.2, 'grams', 'tick', tk], [44.6, 'grams', 'tick', tk], [45.6, 'the reasons', 'click', ck], [46.9, 'planned around', 'tick', tk],
  [49.9, 'tell it', 'click', ck], [51.15, 'typing', 'type', { len: 1.15, n: 15, gain: 0.16 }], [53.25, 'send', 'pop', { gain: 0.24 }], [54.1, 'not judged', 'tick', tk],
  [55.9, 'the estimate', 'click', ck], [57.3, 'count it', 'pop', { gain: 0.24 }], [57.95, 'counted', 'bell', { pitch: 'D6', gain: 0.14, len: 0.9 }], [59.4, 'the day adjusts', 'tick', tk],
  [61.9, 'eating out', 'click', ck], [63.95, 'the moves', 'click', ck], [65.4, 'one move', 'tick', tk], [69.0, 'it fits', 'tick', tk],
  [70.9, 'dinner', 'click', ck], [73.5, 'dinners run late', 'tick', tk], [74.85, 'less rajma', 'tick', tk],
  [77.85, 'your numbers', 'click', ck], [78.4, 'targets', 'tick', tk], [80.85, 'how', 'pop', { gain: 0.24 }], [81.6, 'worked out', 'click', ck], [83.2, 'age', 'tick', tk], [85.0, 'body', 'tick', tk], [86.1, 'goal', 'tick', tk], [88.3, 'how', 'tick', tk],
  [89.5, 'phone out', 'whoosh', { len: 0.5, from: 1800, to: 500, gain: 0.18 }], [90.2, 'the note', 'thud', { gain: 0.22 }], [94.5, 'the grain stays', 'tick', tk], [94.9, 'the grain row', 'whoosh', { len: 0.4, gain: 0.16 }], [95.35, 'grams of grain', 'tick', tk], [96.2, 'doctor first', 'tick', tk], [97.2, 'steps back', 'whoosh', { len: 0.5, gain: 0.2 }], [97.7, 'card lands', 'thud', { gain: 0.24 }], [99.0, 'coach and doctor', 'tick', tk], [101.4, 'nothing suggested', 'tick', tk],
  [103.5, 'card out', 'whoosh', { len: 0.6, from: 1800, to: 400, gain: 0.22 }], [104.2, 'the plate', 'thud', { gain: 0.3 }],
  [109.5, 'decided', 'bell', { pitch: 'A5', gain: 0.2, len: 1.4 }],
  [111.1, 'end card', 'whoosh', { len: 0.5, gain: 0.2 }], [111.75, 'masthead', 'thud', { gain: 0.26 }], [115.35, 'your link', 'tick', tk],
];

const FAST = [[-1, 1.2], [9.2, 11.2], [13.7, 14.6], [23.9, 26.2], [89.2, 91.2], [94.6, 95.6], [96.8, 98.3], [103.0, 105.4], [110.8, 112.6]].concat(SCREENS.slice(1).map(([u]) => [u - SWAP - 0.05, u + 0.6]));
const shots = { s03: '03-today-directive', s04: '04-plate', s05: '05-planned-around', s05b: '05b-serve', s06: '06-why-today', s07: '07-how-numbers',
  sD1: 'D1-log-ask', sD2: 'D2-log-estimate', sD3: 'D3-day-updated', s14: '14-rescue-fits-day', s15: '15-rescue-moves', s18: '18-dinner-planned-around', s19: '19-safety' };

M.film({
  fonts: [fD(78), fD(78, 600), fI(78), fH(78)],
  images: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, `assets/shots/${v}.png`])),
  hits: HITS,
  // more sub-frames where something travels fast (entrances, exits, screen changes); few where the frame is nearly still
  samples: (t) => { const u = M.U(t); return FAST.some(([a, b]) => u >= a && u <= b) ? 18 : 6; },
  init(ctx) { PAPER = makePaper(); SHADOW = makeShadow(); buildText(ctx); },
  draw(ctx, u, t, IMG) {
    paper(ctx, 0, 0, W, H);
    sceneQuestion(ctx, u);
    sceneChart(ctx, u);
    scenePhone(ctx, u, IMG);
    sceneCareful(ctx, u, IMG);
    if (u < 104.7) paper(ctx, 0, 0, W, RULE_Y);          // the column above the rule: the phone passes under it
    drawRule(ctx, u);
    sceneDecided(ctx, u, IMG);
    drawText(ctx, u);
  },
});
