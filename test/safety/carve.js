// The exemption grid, generated from the lists (fix-r13; safety audit of 9dd1b13, B1). Four audits in a row failed on one shape: a rule that
// takes a listed word off, or reads it as another food, let the word next to it through ("Watermelon lime juice", "Mango rice cakes",
// "Brown rice curd rice"). The hand-picked frames of fix-r12 missed it. Here every exemption is read with every neighbour this test knows:
// each word of the lexicon's lists (test/safety/lexicon.json), the first and last word of every recorded name under eval/, the words the
// recorded names put next to each exemption, and a few words that turn a negation round, placed before and after the phrase, alone and
// with a joiner (and, with, a comma, a hyphen, a slash, "&", "+"), for the profile that bars the listed word.
// The rule (docs/SAFETY-INVARIANTS.md, S1 and S4): a cell may be shown only when the token next to the phrase is in that exemption's allowed
// set below. The sets are this test's own copy, written apart from the engine, so a set widened in the engine fails here. A comma, a full
// stop, a bracket, a question mark or the start or end of the name count as nothing; a hyphen, slash, "&" or "+" is a token no set holds.
// Control: a cell whose token is allowed and whose neighbour is not barred on its own (the same cell with the phrase replaced by a plain
// food) must be shown, so the exemption still reads its own food.
// Food exemptions run on the plate path (a plate item, tags stripped to "plain"), with a sample on the swap and one-tap path; the S7
// exemptions run on typed text through plan('meals'), where "shown" means "not referred".
// usage: node test/safety/carve.js [hosted/v6/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const page = fs.readFileSync(process.argv[2] || path.join(ROOT, 'hosted/v6/index.min.html'), 'utf8');
const a = {}; vm.createContext(a); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], a);
const LX = JSON.parse(fs.readFileSync(path.join(__dirname, 'lexicon.json'), 'utf8')), K = LX.known;
const J = x => JSON.parse(JSON.stringify(x)), cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const set = w => new RegExp('^(?:' + w + ')$');

// ---------- the exemptions and their allowed sets (this test's own copy) ----------
// each phrase holds a listed word (bhakri, rotla and thalipeeth are not on the wheat list, so they are no exemption)
const MILLETS = ['bajra roti', 'jowar roti', 'jowar rotis', 'makki ki roti', 'ragi roti', 'nachni chapati', 'rajgira paratha', 'kuttu puri', 'singhara puri', 'bajre ki roti', 'jowar atta roti', 'ragi flour roti'];
const RICEBREADS = ['rice roti', 'chawal ki roti', 'akki roti', 'rice paratha'];
const PLANTMILK = ['coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk', 'rice milk', 'cashew milk', 'soy curd', 'soya curd', 'coconut yogurt', 'coconut yoghurt', 'soy yogurt', 'soya yogurt'];
const PLANTFAT = ['coconut cream', 'cashew cream', 'peanut butter', 'almond butter'];
const NEGPRE = 'with|and|but|served|cooked|made|prepared|plain|warm|small|rotis?|phulkas?|chapatis?|parathas?|flatbread|curry|dal|sabzi|chutney|salad|raita|greens|ghugni|bhaja|paste|chana|milk|tea|coffee|dish|dry';
const D = { health: 'diabetes' }, DV = { diet: 'veg', health: 'diabetes' }, VEGAN = { diet: 'vegan' }, NODAIRY = { leave: ['dairy'] }, NOWHEAT = { leave: ['wheat'] }, VEG = { diet: 'veg' };
const FOOD = [
  { id: 'lemon or lime juice (S4)', phrases: ['lemon juice', 'lime juice', 'nimbu juice', 'amla juice'], profiles: [D, DV],
    pre: set('fresh|tangy|with|tsps?|tbsps?|teaspoons?|tablespoons?|spoons?|spoonfuls?'), post: set('and|with|squeeze|squeezed|dressing') },
  { id: 'rice cakes (S4)', phrases: ['rice cakes', 'rice cake'], profiles: [D], pre: set('plain|puffed|brown'), post: set('and|with') },
  { id: 'sugar snap peas (S4)', phrases: ['sugar snap'], tail: ' peas', profiles: [D], pre: set('with|fresh|steamed|sauteed|blanched|fried|stir'), post: set('peas?') },
  { id: 'plant milk, curd, yogurt (S1, S2)', phrases: PLANTMILK, profiles: [VEGAN, NODAIRY], pre: set('with|in|of|on|plus|or|using|a|an|the|plain|light|thin|fresh|unsweetened'),
    post: set('with|and|plain|strained|curry|rice|korma|gravy|masala|porridge|stew') },
  { id: 'plant cream, nut butter (S1, S2)', phrases: PLANTFAT, profiles: [VEGAN, NODAIRY], pre: set('with|in|of|on|plus|or|using|a|an|the|plain|light|thin|fresh|unsweetened'), post: set('with|and|toast') },
  { id: 'millet flatbread, not wheat (S1)', phrases: MILLETS, profiles: [NOWHEAT],
    pre: set('with|on|alongside|a|an|the|one|two|\\d+|millet|warm|hot|small|soft|crisp|toasted|roasted|fresh|rustic|plain|cooked|ready|handmade|hand-patted|thin|downsize|reduce'),
    post: set('and|with|without|alongside|crackers?|to|weight') },
  { id: 'rice flatbread, not wheat (S1)', phrases: RICEBREADS, profiles: [NOWHEAT], pre: set('with|on|alongside|a|an|the|one|two|\\d+'), post: set('and|with|without|alongside|crackers?|to|weight') },
  { id: 'rice and millet noodles, not wheat (S1)', phrases: ['rice noodles', 'ragi noodles', 'millet pasta', 'glass noodles', 'jowar vermicelli', 'rice sevai', 'konjac noodles', 'shirataki noodles', 'rice noodle'],
    profiles: [NOWHEAT], pre: set('with|in|plain|thin|flat'), post: set('with|and|salad|soup|bowl|stir') },
  { id: 'millet and rice bread, not wheat (S1)', phrases: ['jowar bread', 'bajra bread', 'ragi toast', 'millet bread', 'rice bread', 'gluten-free bread'], profiles: [NOWHEAT], pre: set('with|plain|soft'), post: set('with|and') },
  { id: 'plant keema, not meat (S2)', phrases: ['soya keema', 'mushroom keema', 'paneer keema', 'kathal keema', 'jackfruit keema', 'tofu kheema', 'veg keema', 'nutrela keema'], profiles: [VEG],
    pre: set('with'), post: set('matar|mutter|peas|masala|curry|with|and') },
  { id: 'sol kadhi, not dairy (S1, S2)', phrases: ['sol kadhi'], profiles: [VEGAN, NODAIRY], pre: set('with'), post: set('with|and|rice') },
  { id: 'butter beans, not dairy (S1, S2)', phrases: ['butter beans', 'butter bean'], profiles: [VEGAN, NODAIRY], pre: set('with|in|a|the'), post: set('with|and|curry|salad|sabzi|masala') },
  { id: 'negation, one word (S1)', phrases: ['no ghee', 'without ghee', 'skip ghee', 'skip the ghee', 'hold the ghee', 'minus ghee', 'instead of ghee', 'swap out ghee', 'leave out ghee', 'without butter', 'no paneer', 'without curd'],
    profiles: [NODAIRY], pre: set(NEGPRE), post: set('and|with|but') },
  { id: 'negation, one word (S2, S4)', phrases: ['no sugar', 'without sugar', 'without jaggery', 'no egg', 'without eggs'], profiles: [DV], pre: set(NEGPRE), post: set('and|with|but') },
  { id: '-free (S1)', phrases: ['ghee-free', 'butter-free'], profiles: [NODAIRY], pre: set(NEGPRE), post: set('and|with|but|cakes?|biscuits?|cookies?|bread|mayo|mayonnaise|omelettes?|chutney|version') },
  { id: '-free (S2, S4)', phrases: ['sugar-free', 'egg-free'], profiles: [DV], pre: set(NEGPRE), post: set('and|with|but|cakes?|biscuits?|cookies?|bread|mayo|mayonnaise|omelettes?|chutney|version') }];
// S7: an exemption that keeps typed text from being referred. "shown" = not referred.
const TYPED = [
  { id: 'kidney beans (S7)', phrases: ['kidney beans', 'kidney bean', 'kidney-beans', 'kidneybeans', 'kydney beans', 'kednee beans'], plain: 'rajma',
    pre: set('red|white|rajma|with|of|in|a|the|some|had|have|eat|ate|cooked|boiled|soaked|sprouted|canned'), post: set('curry|salad|masala|rice|chawal|soup|sabzi|chaat|sundal|and|with|for|in|ok|today|tonight') },
  { id: 'prego the sauce (S7)', phrases: ['prego sauce', 'prego pasta', 'prego tomato sauce'], plain: 'tomato sauce',
    // a sauce or pasta word right before "prego" makes it the sauce too ("Pasta with Prego sauce", "Penne prego")
    pre: set('with|in|of|and|or|a|the|some|use|using|buy|bought|add|sauces?|pasta|spaghetti|penne|macaroni|fusilli|lasagn\\w*|marinara|alfredo|arrabbiata|pizza|ravioli|noodles'), post: set('with|and|or|in|on|for|ok|today|tonight|traditional|italian|tomato|basil|garlic|mushroom|white|red|creamy|sauces?|pasta|spaghetti|penne|macaroni|fusilli|lasagn\\w*|marinara|alfredo|arrabbiata|pizza|ravioli|noodles') }];
// S7 exemptions written as "the word right after must be one of these" (space or hyphen between): only the post side
const NEXT = [
  { id: 'baby corn and the like (S7)', head: 'delivered a baby', plain: 'we ate', refer: true, ok: set('corn|potato\\w*|spinach|carrots?|onions?|tomato\\w*|brinjals?|eggplants?|food|marrows?|lettuce|greens|leaf|leaves') },
  { id: 'tri-colour (S7)', head: 'third tri', plain: 'third plate', refer: true, ok: set('colou?r(?:ed|s)?') },
  { id: 'low sugar food (S7 urgent)', head: 'low sugar', plain: 'low salt', refer: true, ok: set('free|desserts?|sweets?|biscuits?|cookies?|cakes?|chai|tea|coffee|version|recipes?|snacks?|juices?|drinks?') },
  { id: 'expecting guests (S7)', head: 'expecting', plain: 'having', refer: true, ok: set('guests?|company|visitors?|friends?|people|family|relatives|someone|somebody|some|my|our|his|her|their|the|to|that|this|it|food|delivery') }];

// ---------- the neighbours ----------
const words = s => String(s).toLowerCase().split(/[^a-z'-]+/).filter(w => /^[a-z][a-z'-]*[a-z]$/.test(w) || /^[a-z]$/.test(w));
const vocab = new Set();
const lists = []; const walkL = o => Array.isArray(o) ? lists.push(...o.filter(x => typeof x === 'string')) : o && typeof o === 'object' && Object.values(o).forEach(walkL);
for (const k of ['wheat', 'nut', 'dairy', 'soya', 'meat', 'egg', 'jain', 'salty', 'sweet', 'supplement', 'measure', 'notWheat', 'notNut', 'notMeat', 'notEgg', 'addedFromReports']) walkL(K[k]);
lists.forEach(s => words(s).forEach(w => vocab.add(w)));
const lexN = vocab.size;
const jsons = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? jsons(path.join(d, e.name)) : /\.json$/.test(e.name) ? [path.join(d, e.name)] : []);
const recNames = new Set(); const KEYS = new Set(['food', 'name', 'add_item', 'as_written', 'title', 'subtitle', 'item']);
const walk = (o, k) => { if (typeof o === 'string') { if (KEYS.has(k) && o.trim() && o.length < 200) recNames.add(o); return; }
  if (Array.isArray(o)) { o.forEach(x => typeof x === 'string' ? (k === 'items' && x.trim() && x.length < 200 && recNames.add(x)) : walk(x, k)); return; }
  if (o && typeof o === 'object') for (const kk of Object.keys(o)) walk(o[kk], kk); };
for (const f of jsons(path.join(ROOT, 'eval'))) { try { walk(JSON.parse(fs.readFileSync(f, 'utf8')), ''); } catch (e) {} }
for (const s of recNames) { const w = words(s); if (w.length) { vocab.add(w[0]); vocab.add(w[w.length - 1]); } }
const headN = vocab.size - lexN;
// the words the recorded names put next to each exemption phrase
const near = (rx) => { for (const s0 of recNames) { const s = s0.toLowerCase(); let m; rx.lastIndex = 0; while ((m = rx.exec(s))) {
  const b = /([a-z][a-z'-]*)\s+$/.exec(s.slice(0, m.index)), f = /^\s+([a-z][a-z'-]*)/.exec(s.slice(m.index + m[0].length)); if (b) vocab.add(b[1]); if (f) vocab.add(f[1]); } } };
for (const e of FOOD.concat(TYPED)) near(new RegExp('\\b(?:' + e.phrases.map(p => p.replace(/[-\s]+/g, '[\\s-]*')).join('|') + ')\\b', 'g'));
['not', 'never', 'dont', "don't", 'cant', "can't", 'cannot', 'must', 'always', 'extra', 'stage', 'ckd', 'weak', 'am', 'me', 'pregnant', 'sweet', 'glazed', 'candied', 'multigrain', 'khapli', 'sharbati'].forEach(w => vocab.add(w));
const VOCAB = [...vocab].sort();
// a joiner between the neighbour and the phrase, and the token the rule then reads next to the phrase
const JOIN = [['', ' ', null], ['and', ' and ', 'and'], ['with', ' with ', 'with'], [',', ', ', ''], ['-', '-', '-'], ['/', '/', '/'], ['&', ' & ', '&'], ['+', ' + ', '+']];
const SAMPLE = VOCAB.filter((w, i) => i % Math.max(1, Math.floor(VOCAB.length / 60)) === 0);

// ---------- the paths ----------
const BASE = { goal: 'lose', focus: 'none', diet: 'nonveg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
const platePlain = (name) => ({ title: name + ' with jowar roti', subtitle: 'A plate', cuisine: 'North Indian', prepMinutes: 20,
  items: [{ food: name, grams: 150, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Sliced cucumber and tomato', grams: 100, group: 'greens', contains: ['plain'] }],
  grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 500, protein: 22, carbs: 70, fats: 14, fiber: 14, why: [], swaps: { protein: [], base: [] }, alchemy: {}, planned_around: [], for_you: '', taste: [] });
const plans = new Map(); const planFor = (o) => { const k = JSON.stringify(o); if (!plans.has(k)) plans.set(k, a.plan('meals', { profile: Object.assign({}, BASE, o), ctx: { meal: 'lunch' } })); return plans.get(k); };
const memo = new Map();
const shownPlate = (o, name) => { const k = JSON.stringify(o) + '|' + name; if (memo.has(k)) return memo.get(k);
  let r; try { r = (planFor(o).check({ status: 'ok', refer_reason: 'none', read: '', meals: [platePlain(name)] }).meals || []).length > 0; } catch (e) { r = 'threw: ' + e; } memo.set(k, r); return r; };
const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
const tuneShown = (o, name) => { const p = Object.assign({}, BASE, o); const m = platePlain('Sprouted moong'); m.title = 'Sprouted moong with jowar roti';
  const pl = a.plan('tune', { profile: p, slot: 'lunch', meal: Object.assign({}, m, { minutes: 20 }) });
  const t = pl.check ? pl.check({ swaps: { protein: [{ food: name, grams: 150, contains: ['plain'], ...z }], base: [] }, alchemy: { protein: { titleSuffix: '+ a side', note: 'A side on the plate.', add_item: name, add_grams: 80, minutes: 20, grain_grams_after: 90, contains: ['plain'], deltaKcal: 60, deltaProtein: 8, deltaCarbs: 2, deltaFats: 3, deltaFiber: 0 } } }) : {};
  return { swap: ((t.swaps || {}).protein || []).length > 0, add: Object.keys(t.alchemy || {}).length > 0 }; };
const refers = (t) => { const k = 'refer|' + t; if (memo.has(k)) return memo.get(k); let r; try { const pl = a.plan('meals', { profile: BASE, ctx: { meal: 'lunch', text: t } }); r = !!(pl.reply && pl.reply.status === 'refer'); } catch (e) { r = 'threw'; } memo.set(k, r); return r; };

// ---------- the grid ----------
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };
let cells = 0, shownN = 0; const tuneCells = [];
// every cell of one phrase: the token next to it, the cell text and the same text with the phrase as a plain food
function* cellsOf(phrase, tail, plain) {
  for (const [side, nbs] of [['before', VOCAB], ['after', VOCAB]]) for (const [jn, js, tok] of JOIN) for (const w of (jn ? SAMPLE : nbs)) {
    const token = tok === null ? w : tok;
    if (side === 'before') yield { side, token, text: w + js + phrase + (tail || ''), plainText: w + js + plain };
    else yield { side, token, text: phrase + js + w, plainText: plain + js + w }; } }
for (const e of FOOD) for (const o of e.profiles) for (const ph of e.phrases) for (const c of cellsOf(ph, e.tail, 'cucumber')) {
  cells++; const name = cap(c.text), s = shownPlate(o, name);
  const allowed = c.token === '' || (c.side === 'before' ? e.pre : e.post).test(c.token);
  if (s === true) shownN++;
  add(e.id + ': a cell is shown only when the token next to the phrase is in its allowed set', !(s === true && !allowed), `${JSON.stringify(o)}: "${name}" shown, token "${c.token}" ${c.side} the phrase is not in the set`);
  if (allowed && s !== true) { const ps = shownPlate(o, cap(c.plainText));
    add(e.id + ': control, an allowed cell is shown when its neighbour is not barred on its own', ps !== true, `${JSON.stringify(o)}: "${name}" dropped, though "${c.token}" is allowed and "${cap(c.plainText)}" is shown`); }
  if (s === true || (!allowed && cells % 97 === 0)) if (tuneCells.length < 400 && cells % 7 === 0) tuneCells.push([e.id, o, name, s === true]); }
for (const e of TYPED) for (const ph of e.phrases) for (const c of cellsOf(ph, '', e.plain)) {
  cells++; const r = refers(c.text); const allowed = c.token === '' || (c.side === 'before' ? e.pre : e.post).test(c.token);
  add(e.id + ': typed text is kept from a referral only when the token next to the phrase is in its allowed set', !(r === false && !allowed), `"${c.text}" was not referred, token "${c.token}" ${c.side} the phrase is not in the set`);
  if (allowed && r !== false) add(e.id + ': control, allowed typed text is not referred when its neighbour does not refer on its own', refers(c.plainText) !== false, `"${c.text}" was referred, though "${c.token}" is allowed and "${c.plainText}" is not`); }
for (const e of NEXT) for (const [jn, js] of [['', ' '], ['-', '-'], ['and', ' and '], [',', ', '], ['/', '/']]) for (const w of VOCAB) {
  cells++; const t = e.head + js + w, r = refers(t), exempt = (jn === '' || jn === '-') && e.ok.test(w);
  add(e.id + ': kept from a referral only when the next word is in its list', !(r === false && !exempt), `"${t}" was not referred`);
  if (exempt && r !== false) add(e.id + ': control, a listed next word keeps it from a referral', refers(e.plain + js + w) !== false, `"${t}" was referred`); }
// the swap and one-tap path, on a sample of the plate cells and the audit's names
const AUDIT = [['Watermelon lime juice', D], ['Orange and lemon juice', DV], ['Carrot and amla juice', DV], ['Mango and lime juice', DV], ['Pineapple lemon juice', D], ['Mint lime juice', D], ['Ginger lemon juice', D],
  ['Coconut rice cakes', DV], ['Mango rice cakes', DV], ['Banana rice cake', D], ['Date rice cakes', D], ['Caramel rice cakes', D]];
for (const [n, o] of AUDIT) { const s = shownPlate(o, n), t = tuneShown(o, n);
  add('the audit\'s names (B1) are dropped on the plate, the swap and the one-tap add', s !== true && !t.swap && !t.add, `${JSON.stringify(o)}: "${n}" plate ${s}, swap ${t.swap}, add ${t.add}`); }
for (const [id, o, name, s] of tuneCells) { const t = tuneShown(o, name);
  add('the swap and the one-tap add read a cell as the plate does (sample)', t.swap === s && t.add === s, `${id}, ${JSON.stringify(o)}: "${name}" plate ${s}, swap ${t.swap}, add ${t.add}`); }
// the controls the recorded data needs: the dressings, the products and the millet rotis the live model wrote
for (const [n, o] of [['Lemon juice', D], ['Fresh lime juice', D], ['Cucumber with lemon juice', D], ['Amla juice', D], ['Lemon juice and chaat masala', D], ['1 teaspoon lemon juice with chaat masala', D],
  ['Rice cakes', D], ['Puffed rice cakes', D], ['Thin coconut milk', NODAIRY], ['Plain soy yogurt', VEGAN], ['Warm jowar roti', NOWHEAT], ['Bajra roti', NOWHEAT], ['Phulka without ghee', NODAIRY], ['Egg-free cake', VEG]])
  add('controls from the recorded names are shown', shownPlate(o, n) === true, `${JSON.stringify(o)}: "${n}" was dropped`);

let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} cells, ${r.bad.length} counter-examples`); r.bad.slice(0, +(process.env.SHOWN || 6)).forEach(b => console.log('       ' + b)); if (r.bad.length > (+(process.env.SHOWN || 6))) console.log(`       ... ${r.bad.length - (+(process.env.SHOWN || 6))} more`); fail += r.bad.length; }
console.log(`exemption grid: ${cells} cells (${FOOD.length} food exemptions, ${TYPED.length + NEXT.length} typed-text exemptions), ${VOCAB.length} neighbours (${lexN} from the lexicon, ${headN} recorded head words, the rest next to a phrase or added), ${shownN} plate cells shown, ${tuneCells.length} swap and one-tap cells`);
if (cells < 100000 || VOCAB.length < 1000) { console.log('FAIL the grid read too few cells or neighbours'); fail++; }
console.log(fail ? `exemption grid: ${fail} counter-examples` : 'exemption grid: every exemption holds');
process.exit(fail ? 1 : 0);
