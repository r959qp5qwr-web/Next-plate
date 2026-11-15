// Preparation requests on the recorded at-risk menus (fix 2, 15 Nov): what a build shows when each dish carries honest tags as listed and as
// served after a request. Stand-in, since the live replies (6febc1a) carry a free "ask" sentence and no tags:
//   request: from the live ask: "jain" when it asks for Jain or no onion or garlic; "no_dairy_fat" when it asks for oil instead of ghee or butter,
//            or no ghee; "less_salt" when it asks for less salt; otherwise "none".
//   contains_listed: the word-list tags of the dish name, plus what the live ask said must come out (onion_garlic, and root_veg when it names
//            ginger or root vegetables, for jain; dairy for no_dairy_fat).
//   contains (as served): contains_listed less what the request takes out.
// Printed two ways: honest listed tags with no request (what a build without requests could show), and with the request.
//   node eval/atrisk/requests.js [build dir]
const fs = require('fs'), vm = require('vm'), path = require('path');
const B = process.argv[2] || '.', page = fs.readFileSync(path.join(B, 'hosted/v6/index.min.html'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const L = a.TAGLISTS(), GR = /\b(rice|roti|naan|kulcha|paratha|dosa|idli|uttapam|upma|biryani|noodles|bread|toast|sandwich|wrap|thali|vada)\b/, WH = /\b(roti|naan|kulcha|paratha|bread|toast|sandwich|wrap|upma|rava|noodles)\b/;
const tagsOf = t => { t = String(t || '').toLowerCase(); const o = Object.keys(L).filter(k => a.foodRx(L[k]).test(t)); if (GR.test(t)) o.push('grain'); if (WH.test(t) && !o.includes('wheat')) o.push('wheat'); return o.length ? [...new Set(o)] : ['plain']; };
const reqOf = (ask) => /jain|no onion|without onion/i.test(ask) ? 'jain' : /oil (?:instead of|rather than) ghee|no ghee|skip any ghee|without ghee|no ghee tadka/i.test(ask) ? 'no_dairy_fat' : /less salt|light on salt|light salt/i.test(ask) ? 'less_salt' : 'none';
const REM = { none: [], jain: ['onion_garlic', 'root_veg'], no_dairy_fat: ['dairy'], no_egg: [], less_salt: [] };
const res = JSON.parse(fs.readFileSync(path.join(__dirname, 'results-live-6febc1a.json'), 'utf8'));
console.log('menu'.padEnd(46), 'live  no-request  with-request  requests');
for (const x of res) { if (x.kind !== 'menu' || !x.reply || !x.reply.raw) continue;
  const run = (withReq) => { const raw = JSON.parse(JSON.stringify(x.reply.raw)); raw.refer_reason = raw.refer_reason || 'none'; if (raw.status === 'unreadable' && !(raw.dishes || []).length) return { n: 0, st: 'unreadable' };
    (raw.dishes || []).forEach(d => { const k = reqOf(d.ask || ''), listed = tagsOf(d.as_written + ' ' + (d.grain_made_of || ''));
      if (k === 'jain') { listed.push('onion_garlic'); if (/ginger|root/i.test(d.ask)) listed.push('root_veg'); } if (k === 'no_dairy_fat') listed.push('dairy');
      const L2 = [...new Set(listed)].filter(t => t !== 'plain' || listed.length === 1); d.contains_listed = L2.length ? L2 : ['plain'];
      d.request = withReq ? k : 'none'; const served = d.contains_listed.filter(t => !(withReq && REM[k].includes(t))); d.contains = served.length ? served : ['plain'];
      if (d.grain_made_of && !d.contains.includes('grain')) { d.contains.push('grain'); d.contains_listed.push('grain'); }
      d.with_contains = d.with ? tagsOf(d.with) : ['plain']; delete d.ask; });
    (raw.leave || []).forEach(d => { if (!d.contains) d.contains = tagsOf(d.as_written || d.name || ''); });
    const out = a.plan('menu', { profile: x.profile, ctx: x.ctx, file: {} }).check(raw); return { n: (out.orders || []).length, st: out.status, asks: (out.orders || []).filter(o => o.ask).length, read: out.read }; };
  const a0 = run(false), a1 = run(true);
  console.log(x.id.padEnd(46), String((x.reply.orders || []).length).padStart(4), String(a0.n).padStart(10), String(a1.n).padStart(13), String(a1.asks || 0).padStart(9), a1.st !== 'ok' ? '  ' + a1.st + (a1.read ? ': ' + a1.read : '') : ''); }
