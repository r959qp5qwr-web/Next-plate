// The recorded replies under eval/, tested, not only diffed (fix-r12). Three audits in a row found a new gap in names the live model wrote;
// each was in recorded data that the checks only compared between builds. Two checks run over every recorded plate here, on the built
// page's np-core (the code the server runs):
//   S1-S4 replay, tags stripped: every recorded plate (reply.meals and reply.raw.meals: items, swaps, one-tap changes, the grain) with every
//     contains tag set to "plain", through the plate check for each profile that bars something. A plate shown with a word of the barred
//     class in a shown name fails. The words are test/safety/lexicon.json's "known" lists (the test's own, not the engine's); the held-out
//     names stay out of both. With diabetes, a plate shown at a main meal keeps its grain (S5).
//   S8 scan: every recorded name (plate items, titles, subtitles, swaps, one-tap items, the grain's food, and the old records' plate names
//     and item strings) through showName, and every name the plate path shows. No digit, no word of the engine's one measure list (MEASW,
//     which the count rules are built from), anywhere in the name, and no stub ("with of", a leading "To").
// Honest names that hold such a word are on the allow lists below, each with its reason.
// usage: node test/safety/recorded.js [hosted/v6/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const page = fs.readFileSync(process.argv[2] || path.join(ROOT, 'hosted/v6/index.min.html'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const LX = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8')), K = LX.known, AR = K.addedFromReports;
const J = x => JSON.parse(JSON.stringify(x));
let failN = 0; const fails = {};
const fail = (id, ex) => { failN++; (fails[id] = fails[id] || []).push(ex); };

// ---------- the recorded replies ----------
const jsons = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? jsons(path.join(d, e.name)) : /\.json$/.test(e.name) ? [path.join(d, e.name)] : []);
const plates = [], names = new Set();
const addName = s => { if (typeof s === 'string' && s.trim() && s.length < 200) names.add(s); };
const nameOf = (o) => { if (!o || typeof o !== 'object') return; addName(o.title); addName(o.subtitle); addName(o.food); addName(o.add_item); addName(o.name);
  (o.items || []).forEach(i => typeof i === 'string' ? addName(i) : nameOf(i)); if (o.grain) addName(o.grain.food);
  const sw = o.swaps || {}; ['protein', 'base'].forEach(k => (Array.isArray(sw[k]) ? sw[k] : []).forEach(nameOf)); Object.values(o.alchemy || {}).forEach(nameOf); };
for (const f of jsons(path.join(ROOT, 'eval')).sort()) {
  let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
  if (!Array.isArray(j)) continue;
  for (const r of j) { if (!r || typeof r !== 'object') continue;
    const at = path.relative(ROOT, f) + '#' + (r.id || '');
    // the old records (results-*.json at the top of eval/): plate names and item strings, from the prompt that still asked for counts
    (Array.isArray(r.plates) ? r.plates : []).forEach(nameOf);
    if (!r.reply || typeof r.reply !== 'object') continue;
    const slot = r.ctx && /^(breakfast|lunch|snack|dinner)$/.test(r.ctx.meal) ? r.ctx.meal : 'lunch';
    for (const m of [].concat(r.reply.meals || [], (r.reply.raw && r.reply.raw.meals) || [])) if (m && typeof m === 'object' && Array.isArray(m.items)) { plates.push({ m, slot, at }); nameOf(m); } } }

// ---------- S1-S4 replay, tags stripped ----------
const BASE = { goal: 'hold', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const PROFILES = [['vegan', { diet: 'vegan' }, ['meat', 'egg', 'dairy']], ['dairy left out', { leave: ['dairy'] }, ['dairy']], ['Jain', { diet: 'jain' }, ['meat', 'egg', 'jain']],
  ['vegetarian (no egg)', { diet: 'veg' }, ['meat', 'egg']], ['egg-eater', { diet: 'egg' }, ['meat']], ['wheat left out', { leave: ['wheat'] }, ['wheat']], ['nuts left out', { leave: ['nut'] }, ['nut']],
  ['soya left out', { leave: ['soya'] }, ['soya']], ['high BP', { health: 'bp' }, ['salty']], ['diabetes', { health: 'diabetes' }, ['sweet']]];
// the lexicon's words for a class, singular and plural, as whole words
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const plur = w => /[^aeiou]y$/.test(w) ? [w, w.slice(0, -1) + 'ies'] : /(s|sh|ch|x)$/.test(w) ? [w, w + 'es'] : [w, w + 's'];
const WORDS = {}; for (const c of ['meat', 'egg', 'dairy', 'jain', 'wheat', 'nut', 'soya', 'salty', 'sweet']) WORDS[c] = new RegExp('\\b(?:' + [].concat(K[c], AR[c] || []).flatMap(plur).map(esc).join('|') + ')\\b', 'i');
// A name the model wrote is offered when it passes; the plate's title, subtitle, reason line and change notes are written by the engine from
// those names. So the names read here are the item, swap and added-item names and the grain's food. S1's own rule holds: a word negated
// alone ("without ghee", "no curd") is left out. Honest names that hold a barred class's word and are not that food are listed whole (the
// shown name, not a part of it), with the reason, for the class they name only.
const MILLET = 'a millet flatbread: the flatbread rule reads a roti named after a millet as not wheat (S1-S4, 15 Nov)';
const HONEST = {
  wheat: [['Jowar roti', MILLET], ['Bajra roti', MILLET], ['Ragi roti', MILLET], ['Handmade bajra roti', MILLET], ['Toasted jowar roti', MILLET], ['Finger millet ragi roti', MILLET],
    ['Jowar roti cracker', MILLET], ['Bajra roti cracker', MILLET], ['Jowar roti (sorghum flatbread)', MILLET], ['Ragi roti with chopped onions', MILLET], ['Jowar roti alongside dal mash', MILLET]],
  dairy: [['Thin coconut milk', 'a plant milk']], meat: [], egg: [], jain: [], nut: [], soya: [], salty: [], sweet: [] };
const NEGW = /\b(?:no|without)\s+[a-z]+/gi;
const honestName = (s, cls) => HONEST[cls].some(([n]) => n.toLowerCase() === s.toLowerCase());
const stripTags = (m) => { const x = J(m); x.contains = ['plain']; (x.items || []).forEach(i => { if (i && typeof i === 'object') i.contains = ['plain']; });
  if (x.swaps && typeof x.swaps === 'object') ['protein', 'base'].forEach(k => (Array.isArray(x.swaps[k]) ? x.swaps[k] : []).forEach(s => { if (s && typeof s === 'object') s.contains = ['plain']; }));
  if (x.alchemy && typeof x.alchemy === 'object') Object.values(x.alchemy).forEach(c => { if (c && typeof c === 'object') c.contains = ['plain']; }); return x; };
const offeredNames = (m) => [...(m.items || []).map(i => i.food), m.grain && m.grain.food, ...['protein', 'base'].flatMap(k => ((m.swaps || {})[k] || []).map(s => s.food)),
  ...Object.values(m.alchemy || {}).map(c => c.item)].filter(s => typeof s === 'string' && s);
// an exemption phrase (a lemon juice dressing, a plain rice cake, a plant milk, a millet roti, ...) is honest only where its neighbours are
// in its set: test/safety/exempt.js, this test's own copy, not the engine's (fix-r13)
const { honest } = require('./exempt.js');
const barredHit = (s, cls) => honestName(s, cls) ? null : WORDS[cls].exec(honest(s, cls === 'salty' ? 'none' : cls).replace(NEGW, ' '));
const perProfile = {};
const seen = new Set(); let replayN = 0, shownN = 0, reN = 0;
for (const { m, slot, at } of plates) {
  const key = JSON.stringify([m.title, (m.items || []).map(i => i && i.food), m.swaps, m.alchemy, slot]); if (seen.has(key)) continue; seen.add(key);
  const x = stripTags(m);
  for (const [pname, o, classes] of PROFILES) { replayN++; perProfile[pname] = perProfile[pname] || 0;
    const p = Object.assign({}, BASE, o); let out;
    try { out = a.plan('meals', { profile: p, ctx: { meal: slot } }).check({ status: 'ok', refer_reason: 'none', meals: [J(x)] }); } catch (e) { fail('S1-S4 replay threw', `${at} ${pname}: ${e}`); continue; }
    for (const sm of out.meals || []) { shownN++; perProfile[pname]++;
      for (const s of offeredNames(sm)) for (const cls of classes) { const hit = barredHit(s, cls);
        if (hit) fail(`S1-S4 replay, tags stripped: ${pname} shown a ${cls} word`, `${at} "${s}" (${hit[0]}; recorded "${m.title}")`); }
      if (o.health === 'diabetes' && slot !== 'snack' && !(sm.grain && sm.grain.grams >= 30 && (sm.items || []).some(i => i.food === sm.grain.food)))
        fail('S5 replay: with diabetes the grain stays', `${at} "${sm.title}" shown with grain ${JSON.stringify(sm.grain)}`); }
    // every shown plate is accepted again by plan('tune'), which reads the engine's own output through the plate check (its title, items,
    // grain and what the grain is made of; fix-r14: a cap or a raw read must hold on what the engine writes)
    for (const sm of out.meals || []) { reN++; let ok = false; try { ok = !!a.plan('tune', { profile: p, slot, meal: J(sm) }).check; } catch (e) {}
      if (!ok) fail('a shown plate is accepted again by the tune path (fix-r14)', `${at} ${pname}: "${sm.title}" (${sm.items.length} items)`); }
    // the recorded swaps and one-tap changes, offered on the shown plate (the tune path), tags stripped
    if ((x.swaps || x.alchemy) && (out.meals || [])[0]) { const sh = out.meals[0];
      let t; try { const pl = a.plan('tune', { profile: p, slot, meal: J(sh) }); t = pl.check ? pl.check({ swaps: x.swaps, alchemy: x.alchemy }) : null; } catch (e) { t = null; }
      if (t && t.status === 'ok') for (const s of offeredNames({ swaps: t.swaps, alchemy: t.alchemy })) for (const cls of classes) { const hit = barredHit(s, cls);
        if (hit) fail(`S1-S4 replay, tags stripped: ${pname} offered a ${cls} word in a swap or change`, `${at} "${s}" (${hit[0]})`); } } } }

// ---------- S8 scan of every recorded name ----------
// The engine's one measure list: the count rules (digits, number words, Hindi numbers, a measure before "of") are built from it, and this
// detector reads it too. Its floor is the lexicon's measure words, so a word taken out of the engine's list fails here, not in silence.
const MEASW = (() => { try { return vm.runInContext('MEASW', a); } catch (e) { return null; } })();
if (!Array.isArray(MEASW)) fail('S8 the engine has one measure list (MEASW)', 'np-core has no MEASW array');
if (Array.isArray(MEASW)) { const own = new RegExp('^(?:' + MEASW.join('|') + ')$', 'i'); for (const w of K.measure || []) if (!own.test(w)) fail('S8 the measure list holds the lexicon\'s measure words', `"${w}" is not in MEASW`); }
// the detector, shared with check.js: test/safety/measure.js
const s8bad = require('./measure.js')(MEASW, K.measure);
// the food names in the engine's sentences: the grain in the reason line ("about 150 g of brown rice"), the food a change adds ("Add 80 g
// sauteed beans") and the grain it changes ("Jeera rice goes to 150 g"); the sentences' own figures (grams, kcal, minutes) are the engine's
const sentenceNames = s => { const out = []; let m; const rx = /\babout \d+\s*g of ([^.]+)\.|\bAdd \d+ g ([^.]+)\.|(?:^|\. )([^.]+?) (?:goes to \d+ g|is left out)\b/g;
  while ((m = rx.exec(s.replace(/\u00A0/g, ' ')))) out.push(m[1] || m[2] || m[3]); return out; };
let scanN = 0;
for (const raw of names) { let s; try { s = a.showName(raw); } catch (e) { fail('S8 scan threw', `"${raw}": ${e}`); continue; }
  if (!s) continue; scanN++; const why = s8bad(s); if (why) fail('S8 scan: a recorded name shown with a count, a measure or a stub', `"${raw}" shows "${s}" (${why})`); }
// the plate path: what a plate shows, from the recorded tags (or "plain" when none was recorded), for a client with no rules
let pathN = 0; const seen8 = new Set();
for (const { m, slot, at } of plates) { const key = JSON.stringify([m.title, (m.items || []).map(i => i && i.food), m.swaps, m.alchemy]); if (seen8.has(key)) continue; seen8.add(key);
  const x = J(m); if (!Array.isArray(x.contains) || !x.contains.length) x.contains = ['plain']; (x.items || []).forEach(i => { if (i && typeof i === 'object' && (!Array.isArray(i.contains) || !i.contains.length)) i.contains = ['plain']; });
  if (x.swaps && typeof x.swaps === 'object') ['protein', 'base'].forEach(k => (Array.isArray(x.swaps[k]) ? x.swaps[k] : []).forEach(sw => { if (sw && typeof sw === 'object' && !Array.isArray(sw.contains)) sw.contains = ['plain']; }));
  if (x.alchemy && typeof x.alchemy === 'object') Object.values(x.alchemy).forEach(c => { if (c && typeof c === 'object' && !Array.isArray(c.contains)) c.contains = ['plain']; });
  for (const o of [{}, { health: 'diabetes' }]) { let out; try { out = a.plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: slot } }).check({ status: 'ok', refer_reason: 'none', meals: [x] }); } catch (e) { continue; }
    for (const sm of out.meals || []) { pathN++;
      const nm = [sm.title, sm.subtitle, ...sm.items.map(i => i.food), sm.grain.food, ...['protein', 'base'].flatMap(k => sm.swaps[k].map(s => s.food)), ...Object.values(sm.alchemy).map(c => c.item)].filter(Boolean);
      for (const s of nm) { const why = s8bad(s); if (why) fail('S8 scan: a plate shows a count, a measure or a stub in a name', `${at} "${s}" (${why})`); }
      for (const s of [sm.forYou, ...Object.values(sm.alchemy).map(c => c.note)].filter(Boolean)) for (const n of sentenceNames(s)) { const why = s8bad(n);
        if (why) fail('S8 scan: a reason line or change note names a food with a count, a measure or a stub', `${at} "${s}" (${why} in "${n}")`); } } } }

// ---------- the found words of fix-r13 against every recorded string (safety audit of 9dd1b13, backlog; D1 "Fix found, then watch") ----------
// Every string under eval/ (names, notes, pairing tips, typed asks): a word fixed in this round may hit only the dishes it names. The
// supplement and urgent readings are compared whole: the strings that read as a supplement or as urgent are the ones listed here, each read.
const allStr = new Set(); const walkAll = (o) => { if (typeof o === 'string') { if (o.trim() && o.length < 400) allStr.add(o); } else if (Array.isArray(o)) o.forEach(walkAll); else if (o && typeof o === 'object') Object.values(o).forEach(walkAll); };
for (const f of jsons(path.join(ROOT, 'eval'))) { try { walkAll(JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) {} }
const NONE13 = [['the sweet drinks and sweets', /\b(?:milkshakes?|(?:banana|dates?|strawberry|chikoo|chiku|fruit|thick)\s+shakes?|thickshakes?|smoothies?|thandai|rose\s+milk|badam\s+milk|sweet\s+pongal|shakkarpara|puran\s+poli)\b/i],
  ['the supplements', /\b(?:multivitamins|complan|whey|protein\s+bars?|protein\s+isolate|electral|ors|becosules|shelcal|zincovit|biotin|folic\s+acid|pediasure|boost\s+drink|ensure\s+(?:milk|drink)|tang\s+drink)\b/i],
  ['a lettuce wrap', /\blettuce\s+wraps?\b/i]];
for (const [what, rx] of NONE13) { const hit = [...allStr].filter(x => rx.test(x));
  if (hit.length) fail(`fix-r13 found words: ${what} hit no recorded string`, hit.slice(0, 5).map(x => JSON.stringify(x)).join('; ')); }
// the egg dishes and the wraps are found in the recorded replies: each hit is that dish, read as egg or wheat
const egg13 = [...allStr].filter(x => /\bdim\s+(?:sheddo|sheddho|shorshe|poshto|dalna)\b/i.test(x)), wrap13 = [...allStr].filter(x => /\bwraps?\b/i.test(x));
const vegP = a.readProfile(Object.assign({}, BASE, { diet: 'veg' })), wheatP = a.readProfile(Object.assign({}, BASE, { leave: ['wheat'] }));
for (const x of egg13) if (!a.crosses(x, vegP)) fail('fix-r13 found words: a recorded Bengali egg dish reads as egg', JSON.stringify(x));
for (const x of wrap13) if (!a.crosses(x, wheatP)) fail('fix-r13 found words: a recorded wrap reads as wheat', JSON.stringify(x));
// "dim" with no egg dish after it is not egg
for (const x of [...allStr].filter(x => /\bdim\b/i.test(x) && !/\bdim\s+(?:sheddo|sheddho|shorshe|poshto|dalna|kosha|posto|bhuna)\b/i.test(x) && !/\begg|\bdimer\b|\banda\b/i.test(x))) if (a.crosses(x, vegP)) fail('fix-r13 found words: "dim" alone is not egg', JSON.stringify(x));
// the found words of fix-r14 (safety audit of 7eaadcf, backlog): the words with no recorded occurrence hit no recorded string; the ones with
// one are read as the food they name in each string they hit (every "wholewheat" and "multigrain" string names a wheat dish, every "yolk"
// string an egg)
const NONE14 = /\b(?:wholemeal|durum|spelt|rotiya|chapatiya|chapatiyaan|chapatiyon|puriya|puriyaan|parathon|samoson|bhaturon|kulchon|kachoriyan|kachoriyaan|kachoriyon|golgappe|golgappas?|rotliyan|rotliyaan|andey|andon)\b/i;
for (const x of [...allStr].filter(x => NONE14.test(x))) fail('fix-r14 found words: a word with no recorded occurrence hits no recorded string', JSON.stringify(x));
const wheat14 = [...allStr].filter(x => /\b(?:wholewheat|multigrain)\b/i.test(x)), yolk14 = [...allStr].filter(x => /\byolks?\b/i.test(x));
for (const x of wheat14) if (!a.crosses(x, wheatP)) fail('fix-r14 found words: a recorded wholewheat or multigrain string reads as wheat', JSON.stringify(x));
for (const x of yolk14) if (!a.crosses(x, vegP)) fail('fix-r14 found words: a recorded yolk string reads as egg', JSON.stringify(x));
// the readings ca94d43 already had: a supplement word of the old list (supplements, tablets, pills, protein powder, enzymes, zinc) in pairing
// tips that are never shown, in typed asks and in the model's referral lines; chest pain in typed asks and in the model's referral lines
const OLDSUPP = /\b(?:supplements?|tablets?|pills?|protein\s+powder|enzymes|zinc)\b|-supplements?\b/i, OLDURG = /\bchest\s+(?:pain|discomfort)/i;
const suppNow = [...allStr].filter(x => a.supp(x)), urgNow = [...allStr].filter(x => a.urgentTyped(x));
for (const x of suppNow) if (!OLDSUPP.test(x)) fail('fix-r13 found words: no new recorded string reads as a supplement (S9)', JSON.stringify(x));
for (const x of urgNow) if (!OLDURG.test(x)) fail('fix-r13 found words: no new recorded string reads as urgent (S7)', JSON.stringify(x));
console.log(`fix-r13 found words: ${allStr.size} recorded strings read; ${egg13.length} egg dishes and ${wrap13.length} wraps found (true hits), ${suppNow.length} supplement and ${urgNow.length} urgent readings, each an old word (22 and 14 on ca94d43)`);
console.log(`fix-r14 found words: ${wheat14.length} wholewheat or multigrain strings and ${yolk14.length} yolk strings (true hits)`);
console.log(`recorded: ${plates.length} plates (${seen.size} distinct), ${names.size} distinct names; ${reN} shown plates accepted again by the tune path`);
console.log(`S1-S4 replay, tags stripped: ${replayN} plate and profile checks, ${shownN} plates shown (${Object.entries(perProfile).map(([k, v]) => k + ' ' + v).join(', ')})`);
for (const [k, v] of Object.entries(perProfile)) if (v < 300) fail('recorded data read', `${k}: only ${v} plates shown, the replay is near empty for this profile`);
console.log(`S8 scan: ${scanN} recorded names shown by showName, ${pathN} plates shown on the plate path`);
if (seen.size < 1000 || shownN < 3000 || scanN < 3000 || pathN < 1000) fail('recorded data read', `only ${seen.size} plates, ${shownN} shown, ${scanN} names, ${pathN} plate-path plates: the check is not reading eval/`);
for (const [id, ex] of Object.entries(fails)) { console.log(`FAIL ${id}: ${ex.length}`); ex.slice(0, +(process.env.SHOWN || 12)).forEach(e => console.log('     ' + e)); }
console.log(failN ? `recorded: ${failN} failures` : 'recorded: all hold');
process.exit(failN ? 1 : 0);
