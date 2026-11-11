// Live quality check: sends each scenario to the hosted server, runs the page's own rails on the reply,
// and saves raw replies for review.  node eval/run.js <base-url> <access-code> [model-label]
const fs = require('fs'), path = require('path');
const [,, BASE, CODE, LABEL = 'run'] = process.argv;
const app = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8').split('\n');
const data = fs.readFileSync(path.join(__dirname, '../src/data.js'), 'utf8');
const s = app.findIndex(l => l.startsWith('var ERR=')), e = app.findIndex(l => l.startsWith('function promptState'));
const rails = app.slice(s, e).join('\n');
const M = { diet: 'veg', leave: [], health: 'none' };
const ctx = {};
new Function('M', 'ctx', data + '\n' +
  'function leaveWords(){var out=[];M.leave.forEach(function(k){(ALIAS[k]||[]).forEach(function(w){if(out.indexOf(w)<0)out.push(w);});});return out;}\n' +
  'function hits(text,words){text=text.toLowerCase();for(var i=0;i<words.length;i++)if(text.indexOf(words[i])>=0)return true;return false;}\n' +
  'var aiN=0;\n' + rails + '\nctx.handleLine=handleLine;ctx.objectsIn=objectsIn;ctx.BAN=BAN;ctx.crosses=crosses;')(M, ctx);

const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
const sc = JSON.parse(fs.readFileSync(path.join(__dirname, "scenarios.json"), "utf8")).filter(c => !ONLY.length || ONLY.includes(c.id));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const out = [];
  for (const c of sc) {
    const st = Object.assign({ meal: 'lunch', time: '1:10 pm', sit: 'home', hunger: '2', goal: 'steady', low: 'none', diet: 'veg', region: 'n', health: 'none', leave: [], had: [], shown: [], prev: [] }, c.s, { text: c.text });
    M.diet = st.diet; M.leave = st.leave; M.health = st.health;
    const t0 = Date.now();
    let raw = '', status = 0;
    try {
      const r = await fetch(BASE + '/api/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: CODE, state: st }) });
      status = r.status; raw = await r.text();
    } catch (err) { raw = 'FETCH ' + err; }
    const ms = Date.now() - t0;
    const my = { read: '', seen: '', plates: [], refer: '', removed: 0, err: '' };
    raw.split('\n').forEach(l => ctx.handleLine(my, l));
    if (!my.plates.length && !my.refer && !my.removed) ctx.objectsIn(raw).forEach(o => ctx.handleLine(my, o));
    // independent checks on the raw reply, before the page's rails
    const rawLow = raw.toLowerCase();
    const flags = [];
    if (/\b\d+\s?(kcal|calories|grams?|g|mg)\b/i.test(raw)) flags.push('raw-has-grams-or-calories');
    if (/protein powder|whey|supplement/i.test(raw)) flags.push('raw-mentions-supplement');
    if (/!/.test(raw.replace(/"[^"]*":/g, ''))) flags.push('raw-exclamation');
    let objs = 0, bad = 0; raw.split('\n').forEach(l => { if (!l.trim()) return; objs++; try { JSON.parse(l); } catch { bad++; } });
    if (bad) flags.push(`unparsed-lines:${bad}/${objs}`);
    const got = my.refer ? 'refer' : my.plates.length ? 'plates' : my.err ? 'error' : 'empty';
    const ok = c.expect === 'plates-or-refer' ? got === 'plates' || got === 'refer' : got === c.expect;
    out.push({ id: c.id, expect: c.expect, got, ok, ms, status, shown: my.plates.length, droppedByRails: my.removed, flags, read: my.read, refer: my.refer,
      plates: my.plates.map(p => ({ name: p.n, items: p.items.map(i => `${i.n} ${i.u} ${i.t}`.replace(/\s+/g, ' ')), why: p.why, skip: p.skip })), err: my.err, raw });
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.id.padEnd(20)} got=${got} plates=${my.plates.length} dropped=${my.removed} ${ms}ms ${flags.join(' ')}`);
    await sleep(Number(process.env.GAP || 7000));   // stay under the free tier's per-minute limit
  }
  fs.writeFileSync(path.join(__dirname, `results-${LABEL}.json`), JSON.stringify(out, null, 1));
  const n = out.length, pass = out.filter(x => x.ok).length;
  console.log(`\n${pass}/${n} matched the expected outcome; plates dropped by rails: ${out.reduce((a, x) => a + x.droppedByRails, 0)}; median ${out.map(x => x.ms).sort((a, b) => a - b)[n >> 1]}ms`);
})();
