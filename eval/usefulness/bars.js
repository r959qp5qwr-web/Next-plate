// The five usefulness bars (docs/review/usefulness-brief.md, coordinator brief of 15 Nov), for one unpacked build:
//   node eval/usefulness/bars.js [build dir, default .] [repo dir, default .]
// Plates, empty requests and reason lines: the clean corpus (r33 + r37). Swaps and one-tap changes: every recorded meals reply (the live
// build's own count on the same replies is the reference). Menus: the 14 recorded r33 and r37 menus. Tags come from the replay's proxy.
const { execFileSync } = require('child_process'), path = require('path');
const B = process.argv[2] || '.', R = process.argv[3] || '.', run = (s) => execFileSync('node', [path.join(__dirname, s), B, R, 'plain'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const clean = JSON.parse(run('replay-meals-clean.js')).meals, wide = JSON.parse(run('replay-meals.js')).meals, menuOut = run('replay-menu.js').trim().split('\n'), menu = JSON.parse(menuOut[0]);
const LIVE = { swaps: 153, oneTap: 106, menuOrders: 38 };   // the live build (6febc1a) on the same replies, from the brief
const OWNER = /meds-low|diabetes-grain|refer/;
const zeroOther = (clean.zeroWhy || []).filter(z => !Object.keys(JSON.parse(z.slice(z.indexOf(' ') + 1))).every(k => OWNER.test(k)));
const reason = (clean.prose || {}).reason || 0, tuneN = wide.swOut + wide.alOut, tuneLive = LIVE.swaps + LIVE.oneTap;
const emptyLiveServes = menuOut[1].split(' | ').filter(r => /\s(\d+)->0$/.test(r) && +r.match(/\s(\d+)->0$/)[1] > 0);
const rows = [
  ['Plates shown (clean, of 75)', clean.out + ' of ' + clean.raw, clean.out >= 67],
  ['Requests with no plate (of 25)', clean.zero + (clean.zero ? ' (' + (clean.zeroWhy || []).join('; ') + ')' : ''), zeroOther.length === 0],
  ['Reason line on shown plates', reason + ' of ' + clean.out + ' (' + Math.round(100 * reason / Math.max(1, clean.out)) + ' %)', reason >= 0.9 * clean.out],
  ['Swaps + one-tap (all recorded, live ' + tuneLive + ')', `${tuneN} (swaps ${wide.swOut} of ${wide.swRaw}, one-tap ${wide.alOut} of ${wide.alRaw}; ${Math.round(100 * tuneN / tuneLive)} % of live)`, tuneN >= 0.8 * tuneLive],
  ['Menu orders (14 menus, live 38)', `${menu.shown}; empty where live serves: ${emptyLiveServes.length ? emptyLiveServes.join(', ') : 'none'}`, menu.shown >= 35 && !emptyLiveServes.length],
];
for (const [k, v, ok] of rows) console.log((ok ? 'meets  ' : 'BELOW  ') + k.padEnd(48) + v);
console.log('drops (clean plates): ' + JSON.stringify(clean.reasons) + '; drops (menus): ' + JSON.stringify(menu.reasons));
