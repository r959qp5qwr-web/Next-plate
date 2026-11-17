// The usefulness bars (docs/review/usefulness-brief.md, coordinator brief of 15 Nov), for one unpacked build: four now. The menu-orders bar
// is dropped (owner, 17 Nov, option survey, "Remove menu reading (Recommended)": "... The menu-orders bar is dropped, and both gates run
// again on the smaller build."); eval/usefulness/replay-menu.js stays in the repository, dormant, and is not run here.
//   node eval/usefulness/bars.js [build dir, default .] [repo dir, default .]
// Plates, empty requests and reason lines: the clean corpus (r33 + r37). Swaps and one-tap changes: every recorded meals reply (the live
// build's own count on the same replies is the reference). Tags come from the replay's proxy.
const { execFileSync } = require('child_process'), path = require('path');
const B = process.argv[2] || '.', R = process.argv[3] || '.', run = (s) => execFileSync('node', [path.join(__dirname, s), B, R, 'plain'], { encoding: 'utf8', maxBuffer: 1 << 26 });
const clean = JSON.parse(run('replay-meals-clean.js')).meals, wide = JSON.parse(run('replay-meals.js')).meals;
const LIVE = { swaps: 153, oneTap: 106 };   // the live build (6febc1a) on the same replies, from the brief
const OWNER = /meds-low|diabetes-grain|refer/;
const zeroOther = (clean.zeroWhy || []).filter(z => !Object.keys(JSON.parse(z.slice(z.indexOf(' ') + 1))).every(k => OWNER.test(k)));
const reason = (clean.prose || {}).reason || (clean.prose || {}).for_you || 0, tuneN = wide.swOut + wide.alOut, tuneLive = LIVE.swaps + LIVE.oneTap;
const rows = [
  ['Plates shown (clean, of 75)', clean.out + ' of ' + clean.raw, clean.out >= 67],
  ['Requests with no plate (of 25)', clean.zero + (clean.zero ? ' (' + (clean.zeroWhy || []).join('; ') + ')' : ''), zeroOther.length === 0],
  ['Reason line on shown plates', reason + ' of ' + clean.out + ' (' + Math.round(100 * reason / Math.max(1, clean.out)) + ' %)', reason >= 0.9 * clean.out],
  ['Swaps + one-tap (all recorded, live ' + tuneLive + ')', `${tuneN} (swaps ${wide.swOut} of ${wide.swRaw}, one-tap ${wide.alOut} of ${wide.alRaw}; ${Math.round(100 * tuneN / tuneLive)} % of live)`, tuneN >= 0.8 * tuneLive],
];
for (const [k, v, ok] of rows) console.log((ok ? 'meets  ' : 'BELOW  ') + k.padEnd(48) + v);
console.log('drops (clean plates): ' + JSON.stringify(clean.reasons));
console.log('menu orders: no bar (menu reading removed, owner 17 Nov; the menu path is unreachable)');
