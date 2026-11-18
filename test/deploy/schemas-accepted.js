// Run before every "Deploy." ask (fix-r17). Fails while any response schema the page can send is not on record as accepted by the live model.
// The safety suite (test/safety/schemas.js) fails when a schema changes without a deliberate snapshot update; this check fails while an
// updated schema has not been through a live sample window: each snapshot entry the page builds must carry accepted_by {commit, date, how},
// not "pending". It is not part of npm run safety, because it can only pass after a live window the owner has approved.
// Entries the served page never sends (the plate request without the app's "lite" flag, which only the server's own API and the unserved
// v5 page send) are listed but do not block; --strict makes them block.
// usage: node test/deploy/schemas-accepted.js [--strict] [page]     (default hosted/v6/index.min.html, the page the server serves)
const path = require('path');
const S = require('../safety/schemas.js');
const args = process.argv.slice(2), strict = args.includes('--strict'), file = args.filter(x => /\.html$/.test(x))[0] || path.join(__dirname, '../../hosted/v6/index.min.html');
const { got } = S.enumerate(S.loadPage(file));
let blocked = 0, listed = 0;
for (const k of S.KINDS) {
  const snap = S.readSnap(k), known = new Map(snap.entries.map(e => [e.sha256, e]));
  let ok = 0, pend = 0, soft = 0, missing = 0; const shown = [];
  for (const [h, e] of got[k]) {
    const r = known.get(h);
    if (!r) { missing++; shown.push(`  NOT IN SNAPSHOT ${h.slice(0, 12)} (${e.labels[0]})`); }
    else if (r.accepted_by === 'pending') { if (r.app_sends || strict) { pend++; shown.push(`  PENDING ${h.slice(0, 12)} ${e.bytes} bytes${e.hooks ? ' hooks ' + e.hooks.join(',') : ''} (${e.labels[0]})`); } else soft++; }
    else ok++;
  }
  blocked += pend + missing; listed += soft;
  console.log(`${k}: ${got[k].size} schemas the page can build; ${ok} accepted by the live model, ${pend} pending, ${missing} not in the snapshot${soft ? `, ${soft} pending but never sent by the served page (not blocking)` : ''}`);
  shown.slice(0, 6).forEach(x => console.log(x)); if (shown.length > 6) console.log(`  ... and ${shown.length - 6} more`);
}
console.log(blocked ? `schemas-accepted: FAIL, ${blocked} schemas the page can send have not been accepted by the live model (${file})` : `schemas-accepted: PASS, every schema the page sends is on record as accepted by the live model (${file})`);
process.exit(blocked ? 1 : 0);
