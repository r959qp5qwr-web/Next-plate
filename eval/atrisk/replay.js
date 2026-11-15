// Replay the at-risk live sample (results-live-6febc1a.json) through a build's checks, paired with what the live build showed.
//   node eval/atrisk/replay.js [build dir, default .]
// Tags come from the same stand-in as eval/usefulness (the engine's word lists, a fixed grain list, "plain" when nothing is found).
const fs = require('fs'), vm = require('vm'), path = require('path');
const B = process.argv[2] || '.', page = fs.readFileSync(path.join(B, 'hosted/v6/index.min.html'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const L = a.TAGLISTS ? a.TAGLISTS() : {};
const GR = /\b(rice|roti|rotis|phulka|phulkas|chapati|paratha|millet|millets|jowar|bajra|ragi|oats|dalia|poha|upma|idli|dosa|khichdi|khichuri|bread|toast|quinoa|wheat|atta|naan|kulcha|thepla|bhakri|barley|maize|makki|chilla|samai|puttu|adai|pesarattu|uttapam|noodles|biryani|thali|sandwich)\b/;
const WH = /\b(roti|rotis|phulka|phulkas|chapati|paratha|bread|toast|wheat|atta|naan|kulcha|thepla|dalia|upma|sooji|rava|pasta|noodles|sandwich)\b/;
const tagsOf = t => { t = String(t || '').toLowerCase(); const o = a.foodRx ? Object.keys(L).filter(k => a.foodRx(L[k]).test(t)) : [];
  if (GR.test(t) && !o.includes('grain')) o.push('grain'); if (WH.test(t) && !o.includes('wheat')) o.push('wheat'); if (!o.length) o.push('plain'); return o; };
const res = JSON.parse(fs.readFileSync(path.join(__dirname, 'results-live-6febc1a.json'), 'utf8'));
const by = {}, add = (o, k, n = 1) => o[k] = (o[k] || 0) + n, T = { live: 0, now: 0, liveEmpty: 0, nowEmpty: 0, reasons: {}, reason: 0 };
for (const x of res) {
  if (x.got !== 'ok' || !x.reply.raw) continue;
  const raw = JSON.parse(JSON.stringify(x.reply.raw)); if (!raw.refer_reason) raw.refer_reason = 'none';
  if (x.kind === 'meals') (raw.meals || []).forEach(m => { (m.items || []).forEach(i => { if (!i.contains) i.contains = tagsOf(i.food); });
    if (m.grain && m.grain.food) { const it = (m.items || []).find(i => i.food === m.grain.food); if (it && !it.contains.includes('grain')) it.contains.push('grain'); }
    m.contains = [...new Set((m.items || []).flatMap(i => i.contains))]; });
  else { (raw.dishes || []).forEach(d => { if (!d.contains) d.contains = tagsOf(d.as_written + ' ' + (d.grain_made_of || '')); if (d.grain_made_of && !d.contains.includes('grain')) d.contains.push('grain'); if (!d.with_contains) d.with_contains = d.with ? tagsOf(d.with) : []; });
    (raw.leave || []).forEach(d => { if (!d.contains) d.contains = tagsOf(d.name || ''); }); }
  let out; try { out = a.plan(x.kind, { profile: x.profile, ctx: x.ctx, file: {} }).check(raw); } catch (e) { out = { error: String(e).slice(0, 80) }; }
  const live = x.kind === 'meals' ? (x.reply.meals || []).length : (x.reply.orders || []).length, now = x.kind === 'meals' ? (out.meals || []).length : (out.orders || []).length;
  const g = x.id.replace(/-(breakfast|lunch|dinner)$/, ''); by[g] = by[g] || { live: 0, now: 0, calls: 0 }; by[g].live += live; by[g].now += now; by[g].calls++;
  T.live += live; T.now += now; if (!live) T.liveEmpty++; if (!now) T.nowEmpty++;
  if (x.kind === 'meals') (out.meals || []).forEach(m => { if (m.reason || m.forYou) T.reason++; });
  Object.entries(out.dropped || {}).forEach(([k, v]) => add(T.reasons, k, typeof v === 'number' ? v : 1));
}
console.log(JSON.stringify(T));
for (const [g, v] of Object.entries(by)) console.log(g.padEnd(40), 'live', String(v.live).padStart(3), ' now', String(v.now).padStart(3), ' calls', v.calls);
