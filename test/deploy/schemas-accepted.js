// Run before every "Deploy." ask (fix-r17, hardened in fix-r18). Fails while any response schema the page can send is not on record as accepted by the live model.
// The safety suite (test/safety/schemas.js) fails when a schema changes without a deliberate snapshot update; this check fails while an
// updated schema has not been through a live sample window. It is not part of npm run safety, because it can only pass after a live window the owner has approved.
//
// An entry counts as accepted only with all of these (safety audit of 21a04a3, m6: the first version took any value but "pending", so
// accepted_by true, {} or null passed, and a kind that built no schema printed "0 schemas" and passed):
//   - accepted_by is an object with a commit (7 to 40 hex characters), a date (yyyy-mm-dd, a valid calendar day) and a how (text);
//   - the record behind it exists: a window directory test/safety/schemas/window-<commit>-<date>/ is committed for that commit and date, and the entry's
//     kind and the first 12 characters of its sha256 are on an answered ("ok") line of that window's schemas.log. There is no other way to be accepted: the list
//     of acceptances recorded elsewhere (the 17 Nov referral window, the 18 Nov live check of log and Rescue) was retired in fix-r19 and those entries are pending
//     again, so the next window re-sends them;
//   - every kind builds at least one schema, and the enumeration reports no problem (a plan that returned an error is a failure here too).
// Every pending entry blocks, the plate request without the app's "lite" flag included (the server's own API and the v5 screens send it, and
// whether the v5 page is served depends on PAGE_PATH). --app-only is the narrower view for a first look: it leaves out the entries only
// a request without "lite" builds. A PASS is about the schemas the test enumerates (test/safety/schemas.js: the recorded bodies and a grid);
// the space of meals schemas is open (the order and the combination of the day's hooks, and a "repeat_" hook that carries a word from the
// client's own log), so a PASS does not say that no other schema can be built. It is a sample. Two things it does not cover at all:
// hook lists of length 6 to 8 beyond the ten of each length the grid holds (the audit of 21a04a3, m8, drew 576 such lists in a random sample), and the rest of the
// request: src/v5/server.ts sends maxOutputTokens, temperature, the model list and the thinking level, which no check reads.
// usage: node test/deploy/schemas-accepted.js [--app-only] [--all] [page]     (default hosted/v6/index.min.html, the page the server serves)
const fs = require('fs'), path = require('path');
const S = require('../safety/schemas.js');
const SCHEMAS = path.join(__dirname, '../safety/schemas');

// the committed window records: window-<commit>-<date>/schemas.log, one line per request format: kind, 12 characters of the hash, the live model's answer
const windows = [];
if (fs.existsSync(SCHEMAS)) for (const d of fs.readdirSync(SCHEMAS)) {
  const m = /^window-([0-9a-f]{7,40})-(\d{4}-\d{2}-\d{2})$/.exec(d); if (!m) continue;
  const log = path.join(SCHEMAS, d, 'schemas.log'), answered = new Set();
  if (fs.existsSync(log)) for (const line of fs.readFileSync(log, 'utf8').split('\n')) { const x = /^(meals|tune|log|rescue)\s+([0-9a-f]{12})\s+ok\b/.exec(line); if (x) answered.add(x[1] + ' ' + x[2]); }
  windows.push({ dir: d, commit: m[1], date: m[2], answered, hasLog: fs.existsSync(log) }); }

const validDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
const sameCommit = (a, b) => { const n = Math.min(a.length, b.length, 7); return n >= 7 && a.slice(0, n) === b.slice(0, n); };
// why an entry is not accepted, or '' when it is
function whyNot(kind, e) {
  const a = e.accepted_by;
  if (a === 'pending') return 'pending';
  if (!a || typeof a !== 'object' || Array.isArray(a)) return `accepted_by is ${JSON.stringify(a)}, not {commit, date, how}`;
  if (typeof a.commit !== 'string' || !/^[0-9a-f]{7,40}$/.test(a.commit)) return `accepted_by has no commit (${JSON.stringify(a.commit)})`;
  if (!validDate(a.date)) return `accepted_by has no date (${JSON.stringify(a.date)})`;
  if (typeof a.how !== 'string' || !a.how.trim()) return 'accepted_by says nothing of how';
  const sha12 = e.sha256.slice(0, 12), win = windows.find(w => sameCommit(w.commit, a.commit));
  if (win) {
    if (win.date !== a.date) return `accepted at ${a.commit} on ${a.date}, but the window record ${win.dir} is dated ${win.date}`;
    if (!win.hasLog) return `the window record ${win.dir} has no schemas.log`;
    return win.answered.has(kind + ' ' + sha12) ? '' : `accepted at ${a.commit}, but ${win.dir}/schemas.log has no answered line for ${kind} ${sha12}`; }
  return `accepted at ${a.commit} (${a.date}), but no window record for that commit is committed`;
}

const args = process.argv.slice(2), appOnly = args.includes('--app-only'), file = args.filter(x => /\.html$/.test(x))[0] || path.join(__dirname, '../../hosted/v6/index.min.html');
const { got, problems } = S.enumerate(S.loadPage(file));
let blocked = 0, listed = 0;
for (const p of problems) { console.log('PROBLEM ' + p); blocked++; }
for (const k of S.KINDS) {
  const snap = S.readSnap(k), known = new Map(snap.entries.map(e => [e.sha256, e]));
  let ok = 0, pend = 0, soft = 0, missing = 0, bad = 0; const shown = [];
  if (got[k].size === 0) { blocked++; shown.push(`  NO SCHEMA: the page builds no schema for ${k}`); }
  for (const [h, e] of got[k]) {
    const r = known.get(h);
    if (!r) { missing++; shown.push(`  NOT IN SNAPSHOT ${h.slice(0, 12)} (${e.labels[0]})`); continue; }
    const why = whyNot(k, r);
    if (why === 'pending') { if (r.app_sends || !appOnly) { pend++; shown.push(`  PENDING ${h.slice(0, 12)} ${e.bytes} bytes${e.hooks ? ' hooks ' + e.hooks.join(',') : ''} (${e.labels[0]})`); } else soft++; }
    else if (why) { bad++; shown.push(`  NOT ACCEPTED ${h.slice(0, 12)}: ${why}`); }
    else ok++;
  }
  blocked += pend + missing + bad; listed += soft;
  console.log(`${k}: ${got[k].size} schemas the page can build; ${ok} accepted by the live model (on record), ${pend} pending, ${bad} with a record that does not hold, ${missing} not in the snapshot${soft ? `, ${soft} pending, only a request without lite builds them (left out by --app-only)` : ''}`);
  const lim = args.includes('--all') ? shown.length : 6; shown.slice(0, lim).forEach(x => console.log(x)); if (shown.length > lim) console.log(`  ... and ${shown.length - lim} more (--all lists them)`);
}
console.log(`records: ${windows.map(w => `${w.dir} (${w.answered.size} answered lines)`).join(', ') || 'no window directory'}`);
console.log('not covered: the enumeration is a sample (ten hook lists of each length 6, 7 and 8, not every list), and src/v5/server.ts (maxOutputTokens, temperature, the model list, the thinking level) is read by no check');
console.log(blocked ? `schemas-accepted: FAIL, ${blocked} problems: schemas not accepted by the live model, a kind with no schema, or a record that does not hold (${file})` : `schemas-accepted: PASS, every enumerated schema is on record as accepted by the live model (the enumeration is a sample; see the header) (${file})`);
process.exit(blocked ? 1 : 0);
