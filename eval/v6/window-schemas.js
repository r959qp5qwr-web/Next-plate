// Sample window for the schema snapshot (fix-r17): sends the example request of every snapshot entry that is still "pending" to a service
// running the candidate page, so that each response schema the page can send is tried once on the live model. Needs the owner's word and a
// temporary access code (the same conditions as the earlier windows); nothing here is run by a check.
//   node eval/v6/window-schemas.js <base-url> [--code <code> | NP_KEY in the environment] [--app-only] [--out <dir>]
//   --app-only   leave out the entries only a request without the app's "lite" flag builds (the default sends every pending entry, as
//                test/deploy/schemas-accepted.js counts every pending entry)
// Prints one line per entry: kind, the first twelve characters of the schema's sha256, the HTTP status and the reply status. A schema the
// model refused comes back as http-502 upstream_error (18 Nov: Gemini 400 "too many states for serving"). The last lines list the entries
// that were answered (HTTP 200 and a reply status of ok or refer) as ready-made --accept commands; the commit, date and how are for the
// builder to fill in from the window's own record. The results are written only with --out <dir>, never into the repository by default.
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2), val = n => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
const BASE = argv.find(x => /^https?:/.test(x)), CODE = val('--code') || process.env.NP_KEY || '', APPONLY = argv.includes('--app-only'), OUT = val('--out');
if (!BASE) { console.log('usage: node eval/v6/window-schemas.js <base-url> [--code <code>] [--app-only] [--out <dir>]'); process.exit(2); }
const KINDS = ['meals', 'tune', 'log', 'rescue'];
(async () => {
  const out = [], answered = {};
  for (const kind of KINDS) {
    const snap = JSON.parse(fs.readFileSync(path.join(__dirname, '../../test/safety/schemas', kind + '.json'), 'utf8'));
    for (const e of snap.entries) {
      if (e.accepted_by !== 'pending' || e.current === false || (!e.app_sends && APPONLY)) continue;
      let status = 0, j = {}, t0 = Date.now();
      try { const r = await fetch(BASE + '/api/' + kind, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ key: CODE }, e.example_body)) }); status = r.status; j = await r.json(); }
      catch (err) { j = { code: 'fetch ' + err }; }
      const got = status === 200 ? String(j.status) : 'http-' + status + ':' + (j.code || '');
      out.push({ kind, sha256: e.sha256, hooks: e.hooks, ms: Date.now() - t0, got, reply: j });
      if (status === 200 && (j.status === 'ok' || j.status === 'refer')) (answered[kind] = answered[kind] || []).push(e.sha256);
      console.log(`${kind.padEnd(6)} ${e.sha256.slice(0, 12)} ${got.padEnd(24)} ${Date.now() - t0} ms${e.hooks ? '  hooks ' + e.hooks.join(',') : ''}`);
      await new Promise(z => setTimeout(z, Number(process.env.GAP || 400)));
    }
  }
  console.log(`\n${out.length} schemas tried; ${Object.values(answered).reduce((n, l) => n + l.length, 0)} answered`);
  for (const k of Object.keys(answered)) answered[k].forEach(h => console.log(`node test/safety/schemas.js --accept ${k} ${h.slice(0, 16)} --commit <candidate> --date <yyyy-mm-dd> --how "<this window>"`));
  if (OUT) { fs.mkdirSync(path.resolve(OUT), { recursive: true }); fs.writeFileSync(path.join(path.resolve(OUT), 'results-window-schemas.json'), JSON.stringify(out, null, 1)); console.log('results written to ' + path.resolve(OUT)); }
})();
