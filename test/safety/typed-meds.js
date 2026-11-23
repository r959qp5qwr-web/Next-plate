// Typed medicine words (fix-r21; owner, 22 Nov, option survey "Ask to update (Recommended)"): "Typed insulin or sugar-tablet words hold the plate. One line asks the client to add it
// in My food, and a tap opens that step." S5 and S6 read the set-up's answers, so a client whose set-up says no medicine who types that they take insulin got plates with no grain
// rule and no usual size. The net (typedMeds, medsTypedHold, medsTypedBody in src/v6/engine.js; api() in src/v6/app.js) is tested both ways here:
//   - a generated phrasing set: first-person present use, English and Hinglish, with food words around, is held; a text that is one release shape (MEDSHAPES: a negation,
//     a qualifier, someone else, a future onset; S6) and a bare "I am diabetic" are not; round 6 (safety audit of d7702c4, B1): the auditor's grid, every shape exemplar with
//     fragments before and after it (all held), a mutant per exclusion (TM_MUTANT), the known over-holds by frame, the m2 timing and length cells;
//   - the engine's plan() on every kind (meals and Rescue answer meds_typed; the log, which counts what was eaten and which S6 does not read, and tune are not held), for a profile
//     that does not say insulin or sugar tablets and for one that does (no hold: the usual size already applies);
//   - the order: a typed referral (urgent, kidney, pregnancy) comes first, then this hold, then the body hold; in the engine and on the phone with the app's own api(), with the
//     live bodyHold (a partial body) and the live medicine hold;
//   - the phone and the engine agree on every phrasing.
// usage: node test/safety/typed-meds.js [hosted/v6/index.html | hosted/v6/index.min.html | hosted/v5/index.min.html]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '../..');
const pageFile = process.argv.filter(x => /\.html$/.test(x))[0] || path.join(ROOT, 'hosted/v6/index.html');
const page = fs.readFileSync(pageFile, 'utf8'), A = {}; vm.createContext(A); vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0], A);
const appSrc = fs.readFileSync(process.env.NP_APP || path.join(ROOT, 'src/v6/app.js'), 'utf8');
// TM_MUTANT=<a|b|c|d>-<after|before> runs every cell with that exclusion widened back (its shapes read with any text after, or before, them): the run must fail
if (process.env.TM_MUTANT) { const [k, how] = process.env.TM_MUTANT.split('-'); A.MEDSHAPES[k] = A.MEDSHAPES[k].map(rx => new RegExp(how === 'before' ? rx.source.replace(/^\^/, '') : rx.source.replace(/\$$/, ''))); console.log('mutant: ' + process.env.TM_MUTANT); }
const grab = (name) => { const i = appSrc.indexOf('function ' + name + '('); if (i < 0) return ''; let d = 0, j = appSrc.indexOf('{', i); for (; j < appSrc.length; j++) { if (appSrc[j] === '{') d++; else if (appSrc[j] === '}') { d--; if (!d) break; } } return appSrc.slice(i, j + 1); };
const J = (x) => JSON.parse(JSON.stringify(x)), safe = (f, d) => { try { return f(); } catch (e) { return d; } };
const res = {}; const add = (id, ok, ex) => { const r = res[id] = res[id] || { n: 0, bad: [] }; r.n++; if (!ok) r.bad.push(ex); };

// ---------- the phrasing set ----------
const MEDS = ['gliclazide', 'glibenclamide', 'glipizide', 'sugar pills', 'diabetes tablets', 'Lantus', 'Amaryl', 'Humulin'];
const HI = ['insulin', 'glimepiride', 'gliclazide', 'sugar ki goli', 'sugar ki dawai', 'diabetes ki dawai', 'sugar ki goliyan'];
const WRAP = [x => x, x => x + ', a light dinner please', x => 'Hi, ' + x + '. Something with paneer and a roti', x => x.toUpperCase(), x => x + ' - what should I eat after', x => 'dinner tonight? ' + x];
const HELD = [], NOT = [];
for (const m of MEDS) for (const f of ['I take M', 'I\'m on M', 'I am on M', 'I use M every day', 'after my M', 'I took my M this morning', 'I forgot my M', 'I have to take M', 'I take M twice a day', 'we both take M', 'I inject M at night', 'I’m on M', 'I also take M', 'Im on M'])
  for (const w of WRAP) HELD.push([w(f.replace('M', m)), 'en first person: ' + f]);
HELD.push(['tablets for my sugar', 'en'], ['I take insulin and glimepiride', 'en'], ['I take metformin and insulin', 'en, two medicines'], ['my mother takes insulin and I take glimepiride', 'en, two people'], ['I take sugar tablets, my father takes insulin', 'en, two people'],
  ['My insulin is at 8 pm, what dinner', 'en'], ['I forgot to take my insulin, what now for lunch', 'en']);
for (const m of HI) for (const f of ['main M leta hoon', 'main M leti hoon', 'M leta hoon', 'M leti hoon', 'M lagata hoon', 'M lagati hoon', 'mujhe M lena padta hai', 'meri M ke baad kya khaun', 'main M le raha hoon', 'main M le rahi hoon', 'mai M leti hu', 'main diabetic hoon, M leti hoon'])
  for (const w of WRAP.slice(0, 3)) HELD.push([w(f.replace('M', m)), 'hi first person: ' + f]);
const NEG = ['I don\'t take M', 'I do not take M', 'I dont take M', 'no M, just dal rice', 'not on M', 'I stopped M last year', 'I never take M', 'I\'m off M', 'without M', 'I no longer take M', 'avoid M? what dinner', 'I’m not on M', 'I do not use M'];
const THIRD = ['my mother takes M', 'my father is on M', 'my husband takes M', 'my wife uses M', 'my friend takes M and wants dinner ideas', 'he takes M', 'she is on M', 'for my grandmother who takes M', 'my son takes M', 'my mother-in-law is on M', 'my brother has to take M'];
for (const m of MEDS) { for (const f of NEG.concat(THIRD)) for (const w of WRAP.slice(0, 3)) NOT.push([w(f.replace('M', m)), f]); }
for (const m of HI) for (const f of ['M nahi leta hoon', 'M nahi leti hoon', 'main M nahi leta', 'M nahin leti hoon', 'papa M leta hai', 'mummy M leti hain', 'mera bhai M leta hai', 'uski M band ho gayi', 'maine M chhod di', 'mere pati M lete hain', 'M leta hai', 'M leti hai']) for (const w of WRAP.slice(0, 3)) NOT.push([w(f.replace('M', m)), f]);
for (const t of ['insulin resistance diet', 'I have insulin resistance, a low gi dinner', 'low insulin index foods', 'insulin sensitivity foods', 'insulin spikes after rice', 'what raises insulin levels', 'PCOS and insulin resistance, dinner',
  'diabetic dinner', 'I am diabetic, light dinner', 'main diabetic hoon, halka khana', 'sugar free dessert', 'Veg thali', 'something sweet', 'glucose tablets for lows', 'I take vitamin tablets', 'I take tablets for BP', 'sugar ki chai', 'sugar nahi chahiye',
  'tablet', 'low salt dinner', 'no sugar tablets please']) NOT.push([t, 'unrelated, bare or neutral']);
// the design of the net (Critic follow-up on 5fa7ba1): a negation counts only when it governs the medicine; a word that makes it something else counts only right after the
// medicine word; may/might/will/would/could/should before it is not present use; a clause that opens with a use verb is first person; "dependent" and "user" are use. Each pattern both ways.
const HELD2 = [
  // a word that used to cancel the whole clause now sits away from the medicine ("sugar free", "low sugar", "levels", "off", "index", "instead", "spikes", "free" after an and)
  'I take M and eat sugar free biscuits', 'I take M and want sugar free sweets', 'I take M and low sugar dessert please', 'I take M and I want a low sugar dessert', 'I take M, sugar free please',
  'I take M and my sugar levels are high at night', 'I take M and my sugar is under control', 'I take M and want to avoid sugar spikes', 'I take M and glucose index of the meal matters',
  'I take M and I am off work today', 'I take M and eat rice instead of roti', 'I take M and no sweets please', 'I take M and I don\'t eat rice', 'I take M and don\'t eat rice at night',
  'I take M and sugar free tea', 'I\'m on M and free for dinner', 'I use M and want a light, sugar free dinner', 'I take M, I\'m off sugar', 'I take M and avoid fried food',
  'I don\'t eat rice and take M', 'I do not eat sugar and I take M', 'I do not eat sweets and take M every morning', 'I stopped sweets and take M', 'I never eat out and I take M',
  // a negation of use that does not mean "no medicine": never skip, never miss, no problem
  'I never skip my M', 'I never miss M', 'I do not forget my M', 'I don\'t stop M', 'I have no problem taking M', 'no worries, I take M',
  // Indian English drops the I: a clause that opens with a use verb is first person
  'Started M this week', 'Taking M since 2019', 'Injecting M daily', 'On M', 'Prescribed M last week', 'Took M this morning', 'Start M tonight, what dinner', 'Skipped M today, what lunch',
  // dependent and user
  'I\'m M dependent', 'I am M dependent', 'Im M dependent', 'M user here', 'M dependent', 'Type 1, M dependent', 'M-dependent, light dinner', 'Type 2 and M user, what dinner',
  // Hinglish: a verb after, a negation that belongs to something else
  'main M leta hoon aur chawal nahi khata', 'main M leti hoon aur meetha nahi', 'M leta hoon, chini nahi'].map(x => [x, 'new pattern']);
const NOT2 = [
  // not a present use
  'doctor said I may need M later', 'I might start M next year', 'I could need M one day', 'doctor wants me to start M', 'I\'ll start M next week',
  'I am going to start M', 'maybe I need M', 'I may be put on M', 'I plan to start M', 'I want to avoid M',
  // a negation that governs the medicine, with a chain of medicine names
  'I don\'t take M or sugar tablets', 'I don\'t take M and glimepiride', 'no M and no sugar tablets', 'I stopped M and gliclazide', 'I never took M or glimepiride', 'I\'m not on M or any tablets',
  'I can\'t take M', 'I won\'t take M', 'I\'m allergic to M', 'I refuse M', 'instead of M, what can I eat', 'alternatives to M for dinner', 'a substitute for M',
  // a word right after the medicine that makes it something else
  'I have M resistance', 'I take supplements for M resistance', 'my M levels are high', 'I need to bring my M levels down', 'my M spikes after rice', 'low M index foods for me', 'M-free dinner please', 'I want an M free diet', 'my M sensitivity is low',
  'I am worried about M production', 'I read about the M hormone'].map(x => [x, 'new pattern']);
const RESIST = /resistance|levels|spikes|index|free|sensitivity|production|hormone/;
for (const m of ['insulin', 'glimepiride', 'sugar tablets', 'Lantus']) { for (const [f] of HELD2) for (const w of WRAP.slice(0, 4)) { if (/\bM (?:dependent|user)|\bM-dependent/.test(f) && /sugar tablets/.test(m)) continue; HELD.push([w(f.replace(/M/g, m)), 'new: ' + f]); }
  for (const [f] of NOT2) { if (RESIST.test(f) && m !== 'insulin') continue; for (const w of WRAP.slice(0, 4)) NOT.push([w(f.replace(/M/g, m)), 'new: ' + f]); } }
for (const [t] of [['I take insulin and eat sugar free biscuits'], ['I take insulin, low sugar levels at night'], ['Started insulin this week'], ['I\'m insulin dependent'], ['Insulin user here']]) HELD.push([t, 'the Critic\'s own phrase']);
for (const t of ['doctor said I may need insulin later', 'my husband is on gliclazide', 'I\'m scared of insulin']) NOT.push([t, 'the Critic\'s own phrase']);
// round 3 (coordinator, on d24b706): the default is to hold. A medicine name in the client's own typed text holds unless a narrow exclusion applies (a negation that governs it, a qualifier right
// after it, someone else is the user, a future onset). Every phrase the coordinator's probes named, literal, both ways.
const LIT_HELD = ["Insulin 10 units morning", "Insulin before dinner every day", "Glimepiride 1mg after breakfast", "Metformin 500 twice daily", "insulin morning and night", "Insulin: yes", "Medicines: insulin", "insulin 2 times", "Insulin pen use daily",
  "I am a diabetic patient on insulin", "I take insulin with my husband's help", "My husband reminds me to take insulin", "I take insulin and so does my mother", "I'll take my insulin at 8", "Should I take my insulin before this meal?", "I will eat after my insulin",
  "I was on insulin last year, now only diet", "I took insulin after surgery in 2019", "Earlier I was on glimepiride, now nothing",
  "I used to take insulin", "I take insulin, my wife cooks", "Can I eat rice? I take insulin", "I take insulin and my kids eat with me", "I take insulin and my sugar levels are fine",
  "Taking insulin twice a day, no sugar in tea", "I am on metformin and glimepiride", "I use insulin pen at night", "Been on insulin for years", "I take insulin, not on any other tablet", "I can't eat sweets because I take insulin", "I inject insulin and avoid rice",
  "Mujhe insulin lagta hai", "I take insulin daily, never skip it", "I'm on glimepiride, sugar free sweets only", "I have type 2 and take gliclazide", "on insulin and metformin both",
  "I take insulin and eat sugar free biscuits", "I'm on insulin since 2019, sugar is under control", "I take insulin before lunch, I am off work today", "Doctor put me on insulin last month", "Started insulin this week",
  "I am taking glimepiride 2mg", "insulin le rahi hoon", "Main roz insulin lagati hoon", "I take my insulin shot at 8", "Insulin user here", "Type 2, on gliclazide", "I take insulin. My husband does not", "I have to inject insulin", "I'm insulin dependent",
  "I take 2 sugar tablets daily", "I need insulin before meals", "on insulin", "I take insulin but no sweets please", "I take insulin, I don't eat rice", "I take insulin and I don't eat rice",
  "Insulin", "glimepiride", "sugar tablets", "diabetes medicine", "I take metformin", "Januvia 50 mg", "Jardiance daily", "insuline at night", "my sugar medicine", "Meds: gliclazide", "I don't take my insulin at night", "I stopped my insulin last year", "I'll need my insulin before dinner",
  "I'm scared of my insulin", "my husband and I take insulin", "mother and I are on insulin", "Hum dono insulin lete hain", "Insulin lena padta hai", "Mera insulin subah leta hoon", "dinner after insulin shot", "Lantus 20 units at night", "Humalog with meals", "Novorapid 6 units",
  "diabetic patient on insulin", "Diabetic on gliclazide"];
const LIT_NOT = ["my mother takes insulin", "papa insulin leta hai", "his insulin", "my sister is insulin dependent", "doctor said I may need insulin later", "may need insulin later", "doctor will start insulin if sugar stays high", "might need insulin", "I want to avoid insulin",
  "I'm scared of insulin", "My father uses insulin", "I am not on insulin", "I don't use insulin or tablets", "Insulin nahi leti", "I avoid insulin", "I'm worried I might need insulin", "No medicines, only diet", "insulin levels were high in my test", "my husband is on gliclazide",
  "I don't take insulin", "no insulin", "I stopped insulin", "I have insulin resistance", "I am diabetic", "my mother takes insulin and wants a light dinner", "she takes insulin", "mera bhai insulin leta hai", "mummy insulin leti hain", "insulin leta hai", "my father is on metformin",
  "my wife uses glimepiride", "for my grandmother who takes insulin", "my brother has to take insulin", "I might start insulin next year", "I'm going to start insulin soon", "I plan to start glimepiride", "I may be put on insulin", "doctor wants me to start insulin", "I'll need insulin one day",
  "I don't take insulin or sugar tablets", "no insulin and no sugar tablets", "I stopped insulin and gliclazide", "low insulin index foods", "insulin free diet", "my mother's insulin", "unki insulin band ho gayi"];
// known over-holds, held on purpose (the client retypes without the word or changes My food): past use, a bare name, a diet question, a modal alone
const OVER = ['I hope to stop insulin', 'Can I stop metformin if I eat millets?', 'foods that spike insulin', 'the insulin diet', 'a person on insulin, what dinner', 'I used to take insulin', 'I would take insulin if the doctor says', 'I will take insulin soon', 'should I take insulin?'];
// verbless, WhatsApp-style and mixed phrasings with a medicine name (held), generated over the names; and a second literal batch of mine (the Critic's phrases are above)
const VERBLESS = ['M 10 units morning', 'M before dinner every day', 'M after breakfast', 'M 500 twice daily', 'morning M night M', 'M: yes', 'Medicines: M', 'M 2 times', 'M pen use daily', 'Rx: M', 'M dose 12', 'T1D, M', 'diabetic - M', 'currently on M', 'M ke saath kya khaun', 'Taking M', 'M shot done, what should I eat', 'Forgot M today', 'continue M', 'M10units', 'M-20', '(M)', 'M/metformin', 'my M', 'before my M', 'after M', 'Dr said continue M', 'Not hungry after M', 'not feeling great after my M shot', 'No sugar and M at night', 'I\'m not well and on M', 'M ke baad meetha nahi khata', 'M free from the govt hospital', 'I get M free from the hospital', 'I\'ll need M 4 units for dinner', 'M with my husband\'s help', 'wife cooks and M at 8', 'both of us on M', 'our M is in the fridge', 'mom told me to take M', 'I may need to reduce M', 'I may need to reduce M after dinner', 'I may take M tonight', 'I will need M 4 units', 'I will eat after my M'];
const MEDLIST = ['insulin', 'glimepiride', 'gliclazide', 'metformin', 'Lantus', 'Humalog', 'Novorapid', 'Mixtard', 'Glycomet', 'Januvia', 'sugar tablets', 'diabetes medicine', 'sugar ki goli', 'insuline', 'sugar tab'];
for (const m of MEDLIST) for (const f of VERBLESS) { if (/^M ke baad meetha|^M ke saath/.test(f) && /\s/.test(m) === false && false) continue; HELD.push([f.replace(/M/g, m), 'verbless or mixed: ' + f]); }
const VNOT = ['my mother takes M', 'my mother\'s M', 'my son is on M', 'M for my mother, dinner ideas', 'papa ko M lagta hai', 'mere papa M lete hain', 'she is on M', 'he takes M', 'I do not use any M', 'I stopped taking M', 'without M', 'off M', 'afraid of taking M', 'I might need M soon', 'may need M later', 'doctor will start M if sugar stays high', 'I will start M tomorrow', 'doctor will put me on M', 'might need to start M', 'M nahi leta', 'maine M chhod di', 'M band ho gayi hai', 'no need for M', 'I plan to start M next month', 'M-free diet', 'M free dinner please', 'M resistance diet', 'low M index foods'];
for (const m of MEDLIST) for (const f of VNOT) { if (/resistance|index|-free|free dinner/.test(f) && m !== 'insulin') continue; NOT.push([f.replace(/M/g, m), 'mixed not held: ' + f]); }
HELD.push(['इंसुलिन लेती हूँ', 'Devanagari'], ['मैं इंसुलिन लेता हूँ। रात का खाना', 'Devanagari, danda'], ['x '.repeat(2500) + ' I take insulin', 'a paste past 2,000 characters']);
// my own adversarial batch (round 3): no "I" and a third-person, negation or modal word near the name, and qualifier words with a dose
const ADV_HELD = ["wife says insulin before dinner", "Husband said take insulin before meals", "my wife reminds insulin at 8", "Doctor said I should take insulin", "Dr advised glimepiride", "no breakfast insulin at 8", "no lunch, insulin at 2", "not hungry but insulin taken",
  "I do not eat out, insulin 10 units", "never late for insulin", "not allowed sweets, on insulin", "diabetes and insulin since 2015", "no sugar, I take glimepiride daily", "skipped breakfast, insulin at 8 pm", "will take insulin at 8 pm", "should take insulin soon",
  "may take glimepiride after dinner", "can I eat dosa? On insulin", "avoid sugar, insulin user", "stop sweets, insulin dependent", "Patient on insulin", "diabetic patient taking glimepiride", "client on insulin", "person on insulin", "insulin patient",
  "Mother and me both take insulin", "grandfather and I on insulin", "insulin for me and my father", "my father and I take insulin", "Insulin levels: I take 10 units", "insulin level control, on 10 units", "free insulin from govt scheme", "sugar free sweets and insulin",
  "on insulin to control sugar", "I might need to take insulin soon, currently on tablets glimepiride", "sugar medicine", "Not hungry after insulin", "not feeling great after my insulin shot", "No sugar and insulin at night", "I'm not well and on insulin",
  "Insulin ke baad meetha nahi khata", "Insulin free from govt hospital", "I'll need insulin 4 units for dinner", "Wife cooks and insulin at 8", "Insulin 12 units, I may need to reduce it", "may need to reduce insulin", "I may need to reduce insulin after dinner", "insulin10units", "Metformin500"];
const ADV_NOT = ["My mother takes insulin", "insulin for my father", "my brother is on insulin", "wife is on insulin", "my wife takes glimepiride daily", "father uses insulin pen", "she takes insulin", "he is on gliclazide", "my kids dad takes insulin", "I don't think of insulin", "insulin resistance"];
for (const t of ADV_HELD) HELD.push([t, 'adversarial']); for (const t of ADV_NOT) if (t !== "I don't think of insulin") NOT.push([t, 'adversarial']);
// round 4 (coordinator, on b00fe75): someone else is the user only when no first person shares the medicine in this clause or the clause before or after it; "me and my X", "I and my X", "main aur meri X"
// are one first-person subject; a cook, an asker or a helper next to it is not a user
const R4_HELD = ["Me and my mother both on metformin", "I and my father take insulin", "My mother takes insulin, me too", "My husband is on metformin. So am I.", "Main aur meri mummy insulin lete hain",
  "My mother takes insulin and so do I", "Mom is on insulin, same here", "papa insulin lete hain, mujhe bhi", "mother takes insulin, I take it too", "we and my parents are on insulin", "my father is on insulin, main bhi"];
const R4_NOT = ["My husband takes metformin, I don't", "My mother takes insulin, what should I cook for her?", "For my father who takes insulin, what should he eat?", "Papa ko insulin lagta hai, main kya banau", "Meri saas insulin leti hai", "My mom is on Lantus",
  "my mother takes insulin and I help her", "My mother takes insulin. I cook for her."];
for (const t of R4_HELD) HELD.push([t, 'round 4 literal']); for (const t of R4_NOT) NOT.push([t, 'round 4 literal']);
// round 5: name families by stem, brands from the sources named in S6, misspellings; and food, plate and English words that share letters stay unheld
const STEM_HELD = ['Huminsulin', 'Wosulin', 'Lupisulin N', 'Gensulin R', 'Velosulin', 'Optisulin', 'Dipisulin', 'Ryzodeg', 'Basaglar', 'Glucobay', 'Pioz', 'Volix', 'Gemer', 'Istamet', 'Zita-met', 'Zita Met', 'Zita-PioMet', 'Glynase', 'Glizid', 'Reclide', 'Ziten', 'Eurepa',
  'Insulatard', 'Insugen', 'Insuman', 'Actraphane', 'Semglee', 'Admelog', 'Chromet', 'Natiz', 'Rastinon', 'Voglistar', 'Voglibose', 'Evogliptin', 'Gemigliptin', 'Anagliptin', 'Alogliptin', 'Canagliflozin', 'Ertugliflozin', 'Mitiglinide', 'Rosiglitazone', 'Lobeglitazone', 'Exenatide', 'Dulaglutide', 'Glucovance', 'Xigduo', 'Synjardy'];
const MISSPELL = ['metformine', 'metfromin', 'metfornin', 'metphormin', 'metaformin', 'methformin', 'metfomin', 'insullin', 'insulen', 'insuline', 'inslin', 'insulyn', 'insuilin', 'insuling', 'sitaglipitin', 'sitagliptine', 'sitagleptin', 'vildagleptin', 'glimepride', 'glimeperide',
  'glimipiride', 'glimpiride', 'glicazide', 'gliclazid', 'glyclazide', 'glibenclamid', 'glyburid', 'pioglitazon', 'dapaglifozin', 'semiglutide'];
for (const m of STEM_HELD.concat(MISSPELL)) for (const f of ['I take M daily', 'Taking M since 2019', 'M 10 units morning', 'on M', 'M before dinner']) HELD.push([f.replace('M', m), 'round 5 name or stem: ' + m]);
// the Critic's probes, as given
for (const t of ['Taking Huminsulin since 2019', 'I take Wosulin daily', 'I take Glucobay daily', 'I take metformine daily']) HELD.push([t, 'round 5 literal']);
const STEM_NOT = ['Glycemic index low gi dinner', 'glutinous rice', 'Gluten free roti', 'Glucose water after the walk', 'Insulated lunch box', 'insulate the flask', 'Consuming less rice', 'Insurance card', 'Gliding home', 'Glitter on the cake', 'Triglyceride report', 'Glyceride on the label', 'Mono and diglycerides listed', 'Inulin fibre', 'Metabolism check',
  'Metallic taste', 'Metro station', 'Glucosamine tablets', 'Methi paratha', 'Metha dal', 'Gliadin free diet', 'Gloomy day', 'Capsuling machine', 'Sulphur water', 'Sugar free sweets', 'Low gi glide', 'Pioneer dal', 'Regan dal fry', 'Aliza dal', 'Glock', 'Pio', 'Dapa', 'Teneli',
  'Pomegranate raita', 'Moong dal khichdi', 'Jowar roti with lauki sabzi', 'Palak paneer', 'Idli sambar', 'Masala dosa with chutney'];
for (const t of STEM_NOT) NOT.push([t, 'round 5 shares letters, no medicine']);
// known over-holds, kept on the safe side (no release widened): a bare name, a relative word that is not on the list
for (const t of ['Is Januvia safe? asking for my mother', 'My aunt started Ozempic for weight', 'My mausi is on metformin', 'My chacha takes Glycomet']) HELD.push([t, 'known over-hold']);
// every medicine word the rule finds in the recorded strings under eval/ is one of these (a new stem or name must not hit a recorded food, plate name, note or typed ask)
{ const known = new Set(['insulin', 'diabetes medicine', 'diabetes medication', 'metformin']), found = {}; const rx = new RegExp(A.MEDRX.source, 'gi');
  const walk = (o) => { if (typeof o === 'string') { for (const m of o.match(rx) || []) found[m.toLowerCase()] = 1; } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
  const rd = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, f.name); if (f.isDirectory()) rd(q); else if (/\.json$/.test(f.name)) { try { walk(JSON.parse(fs.readFileSync(q, 'utf8'))); } catch (e) {} } } };
  rd(path.join(ROOT, 'eval')); const extra = Object.keys(found).filter(k => !known.has(k));
  add('the name rule finds only medicine words in the recorded strings under eval/ (names, notes, typed asks, prompts)', extra.length === 0, 'new hits: ' + extra.join(', ')); }
for (const t of OVER) HELD.push([t, 'known over-hold']);
// round 7 (safety audit of 41e8ac0, backlog and c1): generic phrases, Devanagari spellings and misspellings it found, held; a line break is no shape (the d7702c4 net read each line
// apart); a name phrase with "my" in it is never first of two names in a negation ("I don't take tablets for my sugar or tablets for my sugar please")
for (const t of ['sugar ka injection leti hoon', 'sugar ki injection lagti hai', 'diabetes injection at night', 'injection for sugar', 'sugar ki sui lagti hai', 'meds for sugar', 'medication for diabetes', 'medicine for diabetes',
  'I take insolin', 'insulim at night', 'metformn 500', '\u0907\u0928\u0938\u0941\u0932\u093f\u0928', 'इन्सुलीन लेती हूँ', 'इंसूलिन', 'शुगर की गोलियां', 'शुगर की गोलियाँ', 'डायबिटीज़ की दवा', 'मधुमेह की दवा', 'ग्लाइकोमेट', 'मेटफार्मिन', 'मेटफ़ॉर्मिन', 'ग्लाइक्लाजाइड',
  'no\ninsulin', 'not on\nmetformin', 'I don\'t take\ninsulin', 'my mother takes\ninsulin', 'no insulin\u2028', 'I don\'t take tablets for my sugar or tablets for my sugar please', 'Hi, I don\'t take tablets for my sugar or insulin!']) HELD.push([t, 'round 7: a name the net reads now, or a text that is no shape']);
for (const t of LIT_HELD) HELD.push([t, 'round 3 literal']); for (const t of LIT_NOT) NOT.push([t, 'round 3 literal']);

// profiles: a set-up that does not say insulin or sugar tablets (held) and one that does (no hold)
const PROF = (o) => Object.assign({ goal: 'hold', focus: 'none', diet: 'veg', health: 'none', meds: 'no', bp: false, region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' }, o);
const OPEN = [['no condition', PROF({})], ['diabetes, no medicine', PROF({ health: 'diabetes', meds: 'no' })], ['high BP', PROF({ health: 'bp' })], ['diabetes with BP, no medicine', PROF({ health: 'diabetes', meds: 'no', bp: true })], ['no body figures', PROF({ age: 0, cm: 0, kg: 0 })]];
const ON = [['diabetes, insulin', PROF({ health: 'diabetes', meds: 'yes' })], ['diabetes, not sure', PROF({ health: 'diabetes', meds: 'unsure' })]];

// ---------- round 6 (safety audit of d7702c4, B1): a release needs the whole text to be one listed shape (MEDSHAPES in src/v6/engine.js, S6) ----------
// the controls above that no shape covers now hold: known over-holds, named in S6 by frame (the client retypes without the word, or answers "not sure" in My food)
const OVER6_FRAMES = new Set(['no M, just dal rice', 'I stopped M last year', 'I\'m off M', 'without M', 'I no longer take M', 'avoid M? what dinner', 'uski M band ho gayi', 'maine M chhod di', 'M leta hai', 'M leti hai',
  'I\'ll start M next week', 'I am going to start M', 'maybe I need M', 'I plan to start M', 'I want to avoid M', 'I don\'t take M and glimepiride', 'I stopped M and gliclazide', 'I never took M or glimepiride', 'I\'m not on M or any tablets',
  'I can\'t take M', 'I won\'t take M', 'I\'m allergic to M', 'I refuse M', 'instead of M, what can I eat', 'alternatives to M for dinner', 'a substitute for M', 'I take supplements for M resistance', 'I need to bring my M levels down',
  'my M spikes after rice', 'low M index foods for me', 'I want an M free diet', 'I am worried about M production', 'I read about the M hormone', 'I stopped taking M', 'off M', 'afraid of taking M', 'I might need M soon', 'may need M later',
  'I will start M tomorrow', 'might need to start M', 'M band ho gayi hai', 'no need for M', 'M free dinner please']);
const OVER6_LIT = new Set(['insulin spikes after rice', 'I\'m scared of insulin', 'my kids dad takes insulin', 'My husband takes metformin, I don\'t', 'may need insulin later', 'might need insulin', 'I want to avoid insulin', 'I avoid insulin',
  'I\'m worried I might need insulin', 'insulin levels were high in my test', 'I stopped insulin', 'insulin leta hai', 'I\'m going to start insulin soon', 'I plan to start glimepiride', 'I stopped insulin and gliclazide', 'insulin free diet', 'unki insulin band ho gayi']);
const FOODWRAP = /, a light dinner please$|^Hi, .*\. Something with paneer and a roti$| - what should I eat after$|^dinner tonight\? /;
{ const keep = []; for (const [t, why] of NOT) { const f = why.replace(/^(?:new|mixed not held): /, ''); if (OVER6_FRAMES.has(f) || OVER6_LIT.has(t) || (FOODWRAP.test(t) && !(f === 'I have M resistance' && /, a light dinner please$/.test(t)))) HELD.push([t, 'round 6 known over-hold: ' + (FOODWRAP.test(t) ? 'a food line around a negation or a relative' : f)]); else keep.push([t, why]); }
  NOT.length = 0; NOT.push(...keep); }
// the auditor's grid (test/safety/AUDIT.md, B1), as written in the audit's frames.js: its frames times 12 names, every cell held; its 36 controls held
const AUD_NAMES = ['insulin', 'Lantus', 'Humalog', 'metformin', 'Glycomet', 'glimepiride', 'Amaryl', 'gliclazide', 'sugar tablets', 'Januvia', 'Jardiance', 'Ozempic'];
const AUD_G = {
  'double negation': ["I can't live without M", "can't manage without M", "I don't go anywhere without M", "never without M", "not a day without M", "Without M my sugar goes 400", "not off M", "I'm not off M yet", "never been off M", "not been off M since 2015", "I haven't stopped M", "never quit M", "I haven't quit M"],
  'negation scoped to a meal or time': ["I don't take M at lunch, only at night", "I don't take M in the morning", "No M at lunch, only at night", "not on M during the day", "I do not take M before breakfast, only dinner", "Don't take M on Sundays", "no M for breakfast", "dont need M for snacks"],
  'missed or not-yet dose': ["I didn't take M today, what lunch", "didn't take M this morning", "not taken M yet", "No M this morning", "did not take M yet, lunch?", "not yet taken M", "aaj M nahi liya", "abhi tak M nahi liya", "M abhi nahi liya, lunch kya"],
  'share cue not on the list': ["mother on M, same as me", "my mother takes M, me as well", "my father is on M. Even I am", "mom on M. mine too", "dad takes M, including me", "My mother takes M. I'm the same.", "mom takes M, same with me", "papa M lete hain, mere ko bhi", "papa M lete hain, mera bhi", "papa M lete hain, humko bhi"],
  'qualifier "free of charge"': ["I get M free of charge", "M free of charge from the clinic"] };
const AUD_CTRL = ["I take M", "I'm on M", "M before dinner"];
const GRID = []; for (const fr of Object.values(AUD_G)) for (const f of fr) for (const m of AUD_NAMES) { const t = f.replace(/M/g, m); if (A.MEDRX.test(t)) GRID.push(t); }
add('round 6: the auditor\'s grid has its 504 cells and 36 controls', GRID.length === 504 && AUD_CTRL.length * AUD_NAMES.length === 36, `${GRID.length} cells`);
for (const t of GRID) HELD.push([t, 'round 6, the auditor\'s grid']);
for (const f of AUD_CTRL) for (const m of AUD_NAMES) HELD.push([f.replace(/M/g, m), 'round 6, the auditor\'s controls']);
// the round-6 brief's examples, literal
const B1LIT = ["I can't live without insulin", 'never been off insulin since 2015', "I haven't stopped insulin", "I don't take insulin at lunch, only at night", 'no insulin for breakfast', "didn't take insulin today", 'aaj insulin nahi liya', 'My father is on metformin, same as me', 'Got insulin free of charge'];
for (const t of B1LIT) HELD.push([t, 'round 6, the brief\'s literal']);
// the frames.js port turns the capital M of "My" into a name too (kept above for its count); the sentence it meant, for the 12 names
for (const m of AUD_NAMES) HELD.push([`My mother takes ${m}. I'm the same.`, 'round 6, the auditor\'s frame as meant']);
// one or more exemplars of every shape, with the shape that releases it (a: negation, b: qualifier, c: someone else, d: future onset)
const SHAPE_EX = [['a', 'no insulin'], ['a', 'not on insulin'], ['a', "I don't take insulin"], ['a', 'I do not use metformin'], ['a', "I'm not on Lantus"], ['a', 'I never take glimepiride'], ['a', 'I have never taken insulin'], ['a', 'never been on insulin'],
  ['a', 'no sugar tablets, no insulin'], ['a', 'no insulin and no sugar tablets'], ['a', "I don't take insulin or sugar tablets"], ['a', "I don't use insulin or tablets"], ['a', 'insulin nahi leta hoon'], ['a', 'main insulin nahi leti'], ['a', 'Hi, no insulin.'], ['a', 'no sugar tablets please'],
  ['b', 'insulin resistance'], ['b', 'I have insulin resistance, a low gi dinner'], ['b', 'what raises insulin levels?'], ['b', 'low insulin index foods'], ['b', 'insulin sensitivity foods'], ['b', 'my insulin levels are high'], ['b', 'PCOS and insulin resistance, dinner'], ['b', 'insulin-free diet'], ['b', 'Insulin resistance diet please'],
  ['c', 'my mother takes insulin'], ['c', 'my father is on metformin'], ['c', 'she takes insulin'], ['c', 'his insulin'], ['c', "my mother's insulin"], ['c', 'my sister is insulin dependent'], ['c', 'My mother takes insulin, what should I cook for her?'], ['c', 'For my father who takes insulin, what should he eat?'],
  ['c', 'Papa ko insulin lagta hai, main kya banau'], ['c', 'Meri saas insulin leti hai'], ['c', 'My mother takes insulin and I help her'], ['c', 'insulin for my father'], ['c', 'mera bhai insulin leta hai'], ['c', 'My mother is on Lantus, I make her lunch'], ['c', 'father uses insulin pen'], ['c', 'my mother takes insulin and wants a light dinner'],
  ['d', 'doctor said I may need insulin later'], ['d', 'doctor will start insulin if sugar stays high'], ['d', 'doctor wants me to start insulin'], ['d', "I'll need insulin one day"], ['d', 'I might start insulin next year'], ['d', 'I may be put on insulin'], ['d', 'doctor will put me on insulin']];
const shapeOf = (t) => A.medsRelease(A.norm(t).toLowerCase());
for (const [k, t] of SHAPE_EX) add('round 6: each listed shape releases its exemplar, and only that shape', A.typedMeds(t) === false && shapeOf(t) === k, `"${t}": held ${A.typedMeds(t)}, shape "${shapeOf(t)}", want "${k}"`);
for (const t of ["I don't take insulin", 'my mother takes insulin']) add('round 6: the two phrasings the owner\'s decision names as not held stay not held', A.typedMeds(t) === false, t);
// anything else in the text holds: every exemplar, with a fragment from outside the shapes before or after it (time, meal, dose, a share, a negation, a first-person use, "free of charge")
const FRAG = ['today', 'at lunch', 'this morning', 'tonight', 'yet', 'abhi', 'aaj', 'only at night', 'before dinner', 'for breakfast', '10 units', '500 mg', 'twice daily', 'same as me', 'me too', 'mine too', 'including me', 'so am I', 'even I am', 'as well as me',
  'mera bhi', 'humko bhi', 'mujhe bhi', 'main bhi', 'I take it too', "I'm on it", 'I take insulin', 'but I take metformin', 'free of charge', "I can't live without it", 'never off it', 'not', 'never', 'I stopped', 'only', 'but', 'since 2015', 'what lunch', 'same', 'both of us', 'us too', 'hum dono'];
const PROPS = []; for (const [, ex] of SHAPE_EX) for (const fr of FRAG) PROPS.push(ex + ', ' + fr, ex + ' ' + fr, fr + ' ' + ex, fr + ', ' + ex);
for (const t of PROPS) add('round 6: a shape with anything outside it holds (a fragment before or after each exemplar)', A.typedMeds(t) === true, `"${t}" (shape "${shapeOf(t)}")`);
// mutants: each exclusion widened back (its shapes read with any text after them, or before them) must let a held cell through
{ const keep = {}; for (const k of Object.keys(A.MEDSHAPES)) keep[k] = A.MEDSHAPES[k];
  const heldCells = GRID.concat(B1LIT, PROPS);
  for (const k of Object.keys(keep)) for (const [how, f] of [['any text after the shape', (s) => s.replace(/\$$/, '')], ['any text before the shape', (s) => s.replace(/^\^/, '')]]) {
    A.MEDSHAPES[k] = keep[k].map(rx => new RegExp(f(rx.source))); const leak = heldCells.filter(t => !A.typedMeds(t)); A.MEDSHAPES[k] = keep[k];
    add('round 6 mutants: each exclusion widened back lets a held cell through (so these cells would fail)', leak.length > 0, `(${k}) with ${how}: no held cell is released`); } }

// ---------- the engine: the net itself ----------
for (const [t, why] of HELD) add('held: a medicine name in the typed text of the client (English, Hinglish, verbless, with food words around)', A.typedMeds(t) === true, `"${t}" (${why})`);
for (const [t, why] of NOT) add('not held: a negation, someone else is the user, a future onset, a qualifier ("insulin resistance"), a neutral phrase', A.typedMeds(t) === false, `"${t}" (${why})`);
// a phrase that also carries a typed referral word (pregnancy, a low-sugar sign) is read by the net alone: the referral answers first in plan() and on the phone
for (const t of ['I was on insulin during pregnancy years ago', 'I take insulin, low sugar levels at night']) add('held: a medicine name in the typed text of the client (English, Hinglish, verbless, with food words around)', A.typedMeds(t) === true, `"${t}" (net alone)`);
add('the phrasing set is large enough', HELD.length > 4000 && NOT.length > 500,   /* round 6: the controls that no shape covers moved to the held set as known over-holds */
   `${HELD.length} held, ${NOT.length} not held`);

// ---------- the engine: plan() on every kind ----------
const ask = (kind, p, text) => { const b = { profile: p, ctx: { meal: 'lunch', time: '1:10 pm', appetite: 5, text }, file: {}, slot: 'lunch' };
  if (kind === 'tune') { b.meal = { title: 'Moong dal with jowar roti', subtitle: 'x', cuisine: 'x', prepMinutes: 20, minutes: 20, items: [{ food: 'Moong dal', grams: 200, group: 'protein', contains: ['plain'] }, { food: 'Jowar roti', grams: 90, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber', grams: 100, group: 'greens', contains: ['plain'] }], grain: { food: 'Jowar roti', made_of: 'jowar', grams: 90 }, contains: ['grain'], kcal: 448, protein: 16, carbs: 78, fats: 8, fiber: 12, why: [] }; delete b.ctx.text; }
  return safe(() => A.plan(kind, J(b)), { error: 'threw' }); };
// the scan is linear (audit m2): 20,000 characters of each kind under 200 ms, in the net and in plan(); a longer text is refused after the referrals, which still read it whole
{ const P0f = PROF({}), LONG = ['no insulin ', 'my mother takes insulin ', 'insulin resistance ', 'x ', 'gl' + 'i'.repeat(25000), 'a'.repeat(19990) + 'sulin', 'glim' + 'a'.repeat(25000) + 'ride'];
  for (const u of LONG) { const t = (u.length > 100 ? u : u.repeat(Math.ceil(20000 / u.length))).slice(0, 20000); let t0 = Date.now(); A.typedMeds(t); const a = Date.now() - t0; t0 = Date.now(); const pl = A.plan('meals', J({ profile: P0f, ctx: { meal: 'lunch', text: t }, file: {} })); const b = Date.now() - t0;
    add('round 6 (audit m2): 20,000 characters take under 200 ms in the net and in plan()', a < 200 && b < 200 && (pl.error === 'meds_typed' || !!pl.prompt), `${JSON.stringify(u.slice(0, 14))}: net ${a} ms, plan ${b} ms, ${JSON.stringify(pl).slice(0, 40)}`); }
  for (const kind of ['meals', 'rescue', 'log']) { const over = ask(kind, P0f, 'x '.repeat(10000) + 'a'), urg = ask(kind, P0f, 'x '.repeat(15000) + 'chest pain'), at = ask(kind, P0f, 'x'.repeat(20000));
    const tall = ask(kind, P0f, '\u0130'.repeat(19990) + ' insulin'), folded = A.norm('\u0130'.repeat(19990) + ' insulin').toLowerCase().length;   // a letter that lower-cases to two code units is folded first
    add('round 6 (audit m2): no text is planned that the net did not read whole (the cap counts the string the net reads)', folded <= 20000 ? tall.error === (kind === 'log' ? undefined : 'meds_typed') || (kind === 'log' && !!tall.prompt) : tall.error === 'bad_request', `${kind}: folded ${folded}, ${JSON.stringify(tall).slice(0, 50)}`);
    add('round 6 (audit m2): typed text over 20,000 characters is refused, after the referrals', over.error === 'bad_request' && !!(urg.reply && urg.reply.urgent) && !at.error, `${kind}: over ${JSON.stringify(over)}, urgent ${JSON.stringify(urg).slice(0, 60)}, at ${JSON.stringify(at).slice(0, 40)}`); } }
const SAMPLE = HELD.filter((_, i) => i % 9 === 0), SAMPN = NOT.filter((_, i) => i % 11 === 0);
for (const [t] of SAMPLE) for (const [pn, p] of OPEN) { for (const kind of ['meals', 'rescue']) { const pl = ask(kind, p, t); add('engine: meals and Rescue answer meds_typed to typed insulin or sugar tablets when the set-up does not say so', pl.error === 'meds_typed' && Object.keys(pl).length === 1, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
  const lg = ask('log', p, t); add('engine: the log is not held (it counts what was eaten; S6 does not read it)', !lg.error && !!lg.prompt, `${pn}: "${t}": ${JSON.stringify(lg).slice(0, 70)}`); }
for (const [t] of SAMPLE) for (const [pn, p] of ON) for (const kind of ['meals', 'rescue']) { const pl = ask(kind, p, t); add('engine: no hold when the set-up already says insulin, sugar tablets or not sure', !pl.error && !!pl.prompt, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
for (const [t] of SAMPN) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('engine: a phrasing that is not held is planned', !pl.error && !!pl.prompt, `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 70)}`); }
add('engine: tune has no typed text and is not held', !ask('tune', OPEN[0][1], '').error, JSON.stringify(ask('tune', OPEN[0][1], '')).slice(0, 80));
add('engine: no text and a plain profile is planned (control)', !!ask('meals', OPEN[0][1], '').prompt && !!ask('rescue', OPEN[0][1], 'Veg thali').prompt, 'control');

// ---------- the order, in the engine ----------
const URG = ['chest pain, I take insulin', 'I take insulin and I feel shaky and sweaty', 'I am on glimepiride, trembling after lunch', 'I take insulin, my sugar is low', 'main insulin leti hoon, chakkar aa raha hai and pasina'], PREG = ['I am pregnant and I take insulin', 'I take insulin, kidney problem'];
for (const t of URG) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('order, engine: an urgent sign typed with insulin is referred, with the line to get help now, before the medicine hold', !!(pl.reply && pl.reply.status === 'refer' && pl.reply.urgent), `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 90)}`); }
for (const t of PREG) for (const [pn, p] of OPEN) for (const kind of ['meals', 'rescue', 'log']) { const pl = ask(kind, p, t); add('order, engine: typed pregnancy or a kidney condition with insulin is referred before the medicine hold', !!(pl.reply && pl.reply.status === 'refer'), `${kind}, ${pn}: "${t}": ${JSON.stringify(pl).slice(0, 90)}`); }
for (const h of ['kidney', 'preg']) for (const kind of ['meals', 'rescue', 'log']) { const plain = ask(kind, PROF({ health: h }), 'I take insulin'), urg = ask(kind, PROF({ health: h }), 'I take insulin and I have chest pain');
  add('order, engine: a kidney or pregnancy profile with insulin typed is referred (no medicine hold)', !!(plain.reply && plain.reply.status === 'refer' && !plain.reply.urgent), `${kind}, ${h}: ${JSON.stringify(plain).slice(0, 80)}`);
  add('order, engine: a kidney or pregnancy profile with an urgent sign typed gets the line to get help now first (audit watch note)', !!(urg.reply && urg.reply.status === 'refer' && urg.reply.urgent === A.URGENTLINE), `${kind}, ${h}: ${JSON.stringify(urg).slice(0, 100)}`); }
{ const partial = PROF({ age: 45, cm: 0, kg: 0 });   // a partial body with a typed medicine: the refusals that were there first answer first (body_partial), as the audit's order says
  for (const kind of ['meals', 'rescue']) add('order, engine: the existing refusals come before this hold (a partial body is body_partial)', ask(kind, partial, 'I take insulin').error === 'body_partial', `${kind}: ${JSON.stringify(ask(kind, partial, 'I take insulin'))}`);
  for (const t of URG) for (const kind of ['meals', 'rescue', 'log']) add('order, engine: an urgent sign typed from a partial body is referred, not refused', !!(ask(kind, partial, t).reply || {}).urgent, `${kind}: "${t}"`); }

// ---------- the phone: the app's own api() with the live bodyHold and the live medicine hold ----------
const FNS = ['has', 'bodyLive', 'bodyNeed', 'bodyHold', 'api', 'medsFact', 'medsSetupOK', 'medsHeld', 'medsHoldOn', 'medsHoldOff', 'medsNamed', 'medsExitB'];
const MEDSVAR = (/^var MEDSKEY=[^\n]*;$/m.exec(appSrc) || [''])[0];   // the stored hold's key (round 7)
const missing = FNS.filter(n => !grab(n)); add('the phone\'s api, bodyHold and bodyNeed are in src/v6/app.js', missing.length === 0, 'not found: ' + missing.join(', '));
const P0 = (/^var P=\{[^\n]*\};$/m.exec(appSrc) || [''])[0];
const mk = (pv, ls) => { const make = safe(() => vm.runInContext('(function(PV,LS){' + P0 + MEDSVAR + 'var localStorage=LS||{d:{},getItem:function(k){return k in this.d?this.d[k]:null;},setItem:function(k,v){this.d[k]=String(v);},removeItem:function(k){delete this.d[k];}},STORE={res:{},shown:{}},save=function(){},UI={sheet:"",bodyOpened:false},opened=[],sent=[],window={},KEYCODE="",setTimeout=function(){return 0;},clearTimeout=function(){},fetch=function(path,o){sent.push({path:path,body:JSON.parse(o.body)});return {then:function(){return {then:function(){}};}};};function openSheet(k,at){opened.push(at);}\n' +
  'for(var k in PV)P[k]=PV[k];' + FNS.map(grab).join('\n') + '\nreturn {api:api,sent:sent,opened:opened,ls:localStorage,held:medsHeld};})', A), null); return make && make(pv, ls); };
const call = (pv, p, path, text) => { const ph = mk(pv); let got = null; ph.api(path, J({ profile: p, ctx: { meal: 'lunch', time: '1:10 pm', text, photo: false, appetite: 5 }, file: {} }), (s, j) => { got = [s, j]; }); return { sent: ph.sent.length, got, opened: ph.opened.length, ph }; };
const WHOLE = { age: 47, cm: 158, kg: 72, conds: [], health: 'none', meds: 'no', done: true }, PART = { age: 45, cm: 0, kg: 0, conds: [], health: 'none', meds: 'no', done: true };
const PARTP = PROF({ age: 45, cm: 0, kg: 0 });
const PATHS = { meals: '/api/meals', rescue: '/api/rescue', log: '/api/log' };
for (const [t] of HELD.filter((_, i) => i % 6 === 0)) for (const [pn, p] of OPEN.slice(0, 4)) for (const kind of ['meals', 'rescue']) { const r = call(WHOLE, p, PATHS[kind], t);
  add('phone: api() holds plates and Rescue on typed insulin or sugar tablets: nothing is sent, the answer is meds_typed', r.sent === 0 && r.got && r.got[1].code === 'meds_typed', `${kind}, ${pn}: "${t}": sent ${r.sent}, ${JSON.stringify(r.got)}`);
  add('phone and engine agree: the phone holds if and only if the engine answers meds_typed', (r.got && r.got[1].code === 'meds_typed') === (ask(kind, p, t).error === 'meds_typed'), `${kind}, ${pn}: "${t}"`); }
for (const [t] of HELD.filter((_, i) => i % 9 === 0)) { const r = call(WHOLE, OPEN[0][1], PATHS.log, t); add('phone: the log with typed insulin is sent (not held)', r.sent === 1 && r.got === null, `"${t}": sent ${r.sent}`); }
for (const [t] of NOT.filter((_, i) => i % 7 === 0)) for (const kind of ['meals', 'rescue', 'log']) { const r = call(WHOLE, OPEN[0][1], PATHS[kind], t); add('phone: a phrasing that is not held is sent', r.sent === 1, `${kind}: "${t}": ${JSON.stringify(r.got)}`);
  add('phone and engine agree: not held by either', ask(kind, OPEN[0][1], t).error !== 'meds_typed', `${kind}: "${t}"`); }
for (const [t] of HELD.filter((_, i) => i % 13 === 0)) for (const [pn, p] of ON) { const r = call(WHOLE, p, PATHS.meals, t); add('phone: no hold when the set-up already says insulin, sugar tablets or not sure', r.sent === 1, `${pn}: "${t}"`); }
// round 6: the phone and the engine agree on every cell of the auditor's grid (held by both, nothing sent) and on every shape exemplar (released by both, sent)
for (const t of GRID) for (const kind of ['meals', 'rescue']) { const r = call(WHOLE, OPEN[0][1], PATHS[kind], t), pl = ask(kind, OPEN[0][1], t);
  add('round 6: the phone and the engine both hold every cell of the auditor\'s grid', r.sent === 0 && !!r.got && r.got[1].code === 'meds_typed' && pl.error === 'meds_typed', `${kind}: "${t}": sent ${r.sent}, phone ${JSON.stringify(r.got)}, engine ${JSON.stringify(pl).slice(0, 50)}`); }
for (const [, t] of SHAPE_EX) for (const kind of ['meals', 'rescue']) { const r = call(WHOLE, OPEN[0][1], PATHS[kind], t), pl = ask(kind, OPEN[0][1], t);
  add('round 6: the phone and the engine both release every shape exemplar', r.sent === 1 && !r.got && !!pl.prompt, `${kind}: "${t}": sent ${r.sent}, phone ${JSON.stringify(r.got)}, engine ${JSON.stringify(pl).slice(0, 50)}`); }
// the order on the phone: a typed referral first, then the medicine hold, then the body hold
for (const t of URG) for (const kind of ['meals', 'rescue', 'log']) for (const [label, pv, pp] of [['a whole body', WHOLE, OPEN[0][1]], ['a partial body held by bodyHold', PART, PARTP]]) { const r = call(pv, pp, PATHS[kind], t);
  add('order, phone: an urgent sign typed with insulin (or from a partial body) is answered as a referral with no request, ahead of both holds', r.sent === 0 && r.got && r.got[0] === 200 && r.got[1].status === 'refer' && !!r.got[1].urgent, `${kind}, ${label}: "${t}": sent ${r.sent}, ${JSON.stringify(r.got).slice(0, 90)}`); }
for (const t of PREG) for (const kind of ['meals', 'rescue', 'log']) { const r = call(PART, PARTP, PATHS[kind], t); add('order, phone: typed pregnancy or kidney text with a partial body is answered as a referral with no request', r.sent === 0 && r.got && r.got[1].status === 'refer', `${kind}: "${t}": ${JSON.stringify(r.got).slice(0, 80)}`); }
for (const kind of ['meals', 'rescue']) { const r = call(PART, PARTP, PATHS[kind], 'I take insulin'); add('order, phone: typed insulin from a partial body: the medicine hold answers first, nothing is sent, the step does not open', r.sent === 0 && r.got && r.got[1].code === 'meds_typed' && r.opened === 0, `${kind}: ${JSON.stringify(r.got)}, opened ${r.opened}`);
  const f = call(PART, PARTP, PATHS[kind], 'something light'); add('order, phone: food text from a partial body: the body hold answers, nothing is sent', f.sent === 0 && f.got && f.got[1].code === 'body_partial', `${kind}: ${JSON.stringify(f.got)}`); }
{ const r = call(PART, PARTP, PATHS.log, 'dal and roti'); add('order, phone: the log from a partial body goes without the three figures', r.sent === 1 && r.ph.sent[0].body.profile.age === 0 && r.ph.sent[0].body.profile.cm === 0 && r.ph.sent[0].body.profile.kg === 0, JSON.stringify(r.ph.sent[0] && r.ph.sent[0].body.profile)); }

// a kidney or pregnancy set-up (round 6, audit m1): the phone refers first, before the typed referral, the medicine hold and the body hold, with the reply plan() gives (the line to
// get help now when an urgent sign is typed); 2 profiles x 2 bodies x 3 texts x 3 kinds, the phone's answer deep-equal to the engine's, nothing sent
for (const h of ['kidney', 'preg']) for (const [bl, pv, extra] of [['a whole body', WHOLE, {}], ['a partial body', PART, { age: 45, cm: 0, kg: 0 }]]) for (const t of ['I take insulin', 'something light with dal', 'I take insulin and I have chest pain']) for (const kind of ['meals', 'rescue', 'log']) {
  const p = PROF(Object.assign({ health: h }, extra)), r = call(pv, p, PATHS[kind], t), pl = ask(kind, p, t);
  add('order, phone: a kidney or pregnancy set-up is referred first, with the reply plan() gives, and nothing is sent (audit m1)', r.sent === 0 && !!r.got && r.got[0] === 200 && !!pl.reply && JSON.stringify(r.got[1]) === JSON.stringify(pl.reply) && (/chest pain/.test(t) ? r.got[1].urgent === A.URGENTLINE : !r.got[1].urgent), `${h}, ${bl}, ${kind}: "${t}": sent ${r.sent}, phone ${JSON.stringify(r.got)}, engine ${JSON.stringify(pl).slice(0, 90)}`); }
{ const r = call(PART, PARTP, PATHS.log, 'I take insulin and had dal and roti for lunch'); add('order, phone: a partial body with typed insulin in the log: the log still goes, without the three figures, and the engine reads it', r.sent === 1 && r.ph.sent[0].body.profile.age === 0 && !A.plan('log', J(r.ph.sent[0].body)).error, JSON.stringify(r.got)); }

// ---------- the typed-medicine hold on screen and on the phone (owner, 23 Nov: "Hide them", "Add a line", "Keep log", "All tabs", "Until updated", "Hide all three") ----------
// A page built from the app's own load, save, refresh, api, makePlates, rescue, renders, askBlock, logRow and closeSheet, on a small fake page with a recording localStorage,
// queued timers and click handlers kept on its nodes. A reload is a second page on the same localStorage. Round 7 (safety audit of 41e8ac0, B1, m1, m2): the hold is a fact
// stored outside the day's store; while it is stored, plates and Rescue send nothing unless the set-up says insulin, sugar tablets or not sure, or the client typed the ask or
// dish (and it passed the net).
{ const PFNS = ['has', 'healthOf', 'bodyStored', 'appKept', 'profileOut', 'save', 'appetite', 'refresh', 'clockMeal', 'rules', 'answers', 'bodyLive', 'bodyNeed', 'bodyHold', 'api', 'slotOf', 'curKey',
    'medsFact', 'medsSetupOK', 'medsHeld', 'medsHoldOn', 'medsHoldOff', 'medsNamed', 'medsCard', 'medsNote', 'medsBtn', 'logRow', 'makePlates', 'rescue', 'renderPlate', 'renderBuild', 'renderRescue0', 'renderRescue',
    'askBlock', 'lockLine', 'errText', 'RETRY', 'curRes', 'lastForMeal', 'closeSheet', 'unAsk', 'onMeds',
    'composer', 'referCard', 'referCardR', 'referHead', 'medsExitB', 'boxAsk', 'boxDish', 'memNow', 'storeRaw', 'storeInit', 'storeSync'];   // round 8 (safety audit of 3ee7b41)
  const pmiss = PFNS.filter(n => !grab(n)); add('hold page: the app\'s functions are in src/v6/app.js', pmiss.length === 0, 'not found: ' + pmiss.join(', '));
  const line = (re) => (re.exec(appSrc) || [''])[0];
  const GLOB = [/^var now=new Date\(\)[^\n]*$/m, /^var CLOCK=[^\n]*$/m, /^var DAY=[^\n]*$/m, /^var P=\{[^\n]*\};$/m, /^var C=\{[^\n]*\};$/m, /^var APP=\{\};[^\n]*$/m, /^var CONDS=[^\n]*$/m, /^var EV=\[\],STORE=[^\n]*$/m,
    /^var FILE=null,PL=null,HOOKS=\[\];[^\n]*$/m, /^var MEDSKEY=[^\n]*;$/m, /^var MEDSTYPED=[^\n]*;$/m, /^var MEDSOTHER=[^\n]*;$/m, /^var NORETRY=[^\n]*;$/m, /^var PROMPTS=[^\n]*$/m, /^var DISHES=[^\n]*$/m,
    /^var REFUSED=[^\n]*$/m, /^var LOSTIT=[^\n]*$/m, /^var RAW0,MEM0;[^\n]*$/m].map(line).join('\n') + '\nvar ERRS={};';
  const li = appSrc.indexOf('(function load(){try{'), le = appSrc.indexOf('})();', li) + 5, LOAD = li < 0 ? '' : appSrc.slice(li, le);
  const STUB = `function N(tag,cls,text){var o={tag:tag,cls:cls||"",text:text==null?"":String(text),id:"",kids:[],attrs:{},style:{setProperty:function(){}},on:{},hidden:false,disabled:false,value:"",parent:null,
      appendChild:function(c){if(c&&typeof c==="object")c.parent=this;this.kids.push(c);return c;},setAttribute:function(k,v){this.attrs[k]=v;},removeAttribute:function(){},addEventListener:function(t,f){this.on[t]=f;},remove:function(){},scrollTo:function(){},focus:function(){},blur:function(){},
      querySelector:function(q){var f=function(n){for(var i=0;i<n.kids.length;i++){var k=n.kids[i];if(q[0]==="."?(" "+k.cls+" ").indexOf(" "+q.slice(1)+" ")>=0:("#"+k.id)===q)return k;var r=f(k);if(r)return r;}return null;};return f(this);}};
    Object.defineProperty(o,"textContent",{get:function(){return o.text;},set:function(x){o.kids=[];o.text=x;}});return o;}
    var document={createTextNode:function(t){return N("#text",null,t);},querySelector:function(){return null;},activeElement:null},VIEWS={},TQ=[],SENT=[],OPENED=[];
    function $(id){return VIEWS[id]||(VIEWS[id]=N("main"));}
    function el(t,c,x){return N(t,c,x);}function btn(c,l,i,id){var b=N("button",c,l);b.id=id||"";return b;}function ic(){return N("svg");}function add(p){for(var i=1;i<arguments.length;i++)if(arguments[i])p.appendChild(arguments[i]);return p;}
    var UI={view:"plate",sel:0,alc:{},swp:0,swb:0,rmoves:{},err:"",busy:"",sheet:""},KEYCODE="K",REMADE={},REMADEWHY={},FROMLINK=false,ANS0="",SAFE0="",BODY0=[0,0,0],SHEETFROM=null,RM=true,window={},TUNING={};
    function setTimeout(f){TQ.push(f);return TQ.length;}function clearTimeout(){}
    function fetch(path,o){var rec={path:path,body:JSON.parse(o.body)};SENT.push(rec);return {then:function(f1){return {then:function(f2){rec.done=f2;return {};}};}};}
    function blocked(){return false;}function blockedCard(){return N("div","blocked");}function choices(){}function loggedCard(){return N("div","logged","LOGGED");}function waitCard(t){return N("div","wait",t);}
    function mealName(m){return m;}function render(){}function referHead(){}function curMeal(){var r=curRes();return r.meals[UI.sel||0];}function plateWhy(){return "";}function viewOf(){return {};}function bodyMissing(){return {text:"",at:""};}
    function openSheet(k,at){OPENED.push(k);UI.sheet=k;ANS0=answers();SAFE0=rules();BODY0=[P.age,P.cm,P.kg];}function medsAt(){return "health-diabetes";}function behind(){}function ctxKey(){return "plates|"+C.meal;}function askedFor(){return "s";}
    function heroCard(){var h=N("article","plate","HERO PLATE");h.id="plate-card";return h;}function whyLine(){return "";}function thali(){return N("svg");}function act(a,b){return function(){if(b)b();};}function logEv(){}function tune(){}function lockOn(){}
    function directiveCard(h){var d=N("p","tip directive","Today. Lunch: about 480 kcal");d.id="directive";h.appendChild(d);}function ctxBlock(){}function stamp(){return N("i");}function sprig(){return N("i");}
    function panelHead(v,a,b){v.appendChild(N("div","panel-h",a));}function fileOut(){return {};}function ctxOut(t){return {meal:C.meal,time:"1:10 pm",text:t,photo:false,appetite:5};}function clockText(){return "1:10 pm";}function revealOut(){}
    function rescueWhy(){return "";}function riseOf(){return {band:"low"};}function fitOf(){return 50;}function bandCls(){return "";}function setPressed(){}function clearSlot(){}function pickMeal(){}function show(){}function toast(){}function resetAt(){return "";}function pruneKept(){}
    function walk(n,out){out.push((n.id?"#"+n.id+" ":"")+(n.cls?"."+n.cls.split(" ").join(".")+" ":"")+n.text);n.kids.forEach(function(k){walk(k,out);});return out;}
    function view(id,f){VIEWS[id]=N("main");try{f();}catch(e){return "threw: "+e.message;}return walk(VIEWS[id],[]).join("\\n");}
    function find(n,id){if(n.id===id)return n;for(var i=0;i<n.kids.length;i++){var r=find(n.kids[i],id);if(r)return r;}return null;}
    function flush(){for(var i=0;i<20&&TQ.length;i++){var q=TQ.splice(0);q.forEach(function(f){try{f();}catch(e){}});}}
    function findAll(id){var ks=Object.keys(VIEWS);for(var i=0;i<ks.length;i++){var r=find(VIEWS[ks[i]],id);if(r)return r;}return null;}
    function typeIn(id,t){var n=findAll(id);if(!n)return false;n.value=t;if(n.on.input)n.on.input({});return true;}   /* the client's keystrokes: the value, then the input event */
    function submitFrom(id){var n=findAll(id);while(n&&n.tag!=="form")n=n.parent;if(!n||!n.on.submit)return false;n.on.submit({preventDefault:function(){}});return true;}`;
  const make = (() => { try { return vm.runInContext('(function(LS,DAYSHIFT){var localStorage=LS;' + GLOB + '\n' + STUB + '\n' + PFNS.map(grab).join('\n') + '\n' + LOAD +
    '\nif(typeof storeInit==="function")storeInit();if(DAYSHIFT){DAY=DAY+DAYSHIFT;}refresh();\nreturn {UI:UI,P:P,C:C,ST:function(){return STORE;},SENT:SENT,LS:LS,flush:flush,held:function(){return medsHeld();},' +
    'plate:function(){return view("v-plate",function(){renderPlate();});},build:function(){return view("v-build",function(){renderBuild();});},resc:function(){return view("v-rescue",function(){renderRescue();});},' +
    'node:function(v,id){return find(VIEWS[v]||N("x"),id);},click:function(n){if(n&&n.on.click)n.on.click({preventDefault:function(){}});},ask:function(t,typed){makePlates(t,false,typed);},rescue:function(t,typed){rescue(t,typed);},' +
    'typeAsk:function(t){return typeIn("askin",t);},sendAsk:function(){return submitFrom("askin");},typeDish:function(t){return typeIn("rin",t);},sendDish:function(){return submitFrom("rin");},boxValue:function(id){var n=findAll(id);return n?n.value:null;},save:function(){save();},' +
    'refresh:function(){refresh();},setDay:function(d){DAY=d;},day:function(){return DAY;},openFood:function(){openSheet("food");},closeFood:function(){closeSheet();},MEDSTYPED:MEDSTYPED,MEDSOTHER:MEDSOTHER};})', A); } catch (e) { if (process.env.TM_DEBUG) console.log('hold page:', e.stack); return null; } })();
  add('hold page: the app\'s load and functions run on the fake page', !!make, 'the harness did not load');
  if (make) {
    const LSm = (o) => ({ d: Object.assign({}, o || {}), w: [], getItem(k) { return k in this.d ? this.d[k] : null; }, setItem(k, v) { this.d[k] = String(v); this.w.push(k); }, removeItem(k) { delete this.d[k]; this.w.push('-' + k); } });
    const PROF7 = (o) => Object.assign({ goal: 'hold', focus: 'none', meds: 'no', diet: 'veg', health: 'diabetes', conds: ['diabetes'], region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true }, o || {});
    const seedLS = (p) => LSm({ np6: JSON.stringify({ p: PROF7(p), c: {}, ev: [], k: 'K' }) });
    const page = (ls, shift) => { try { return make(ls, shift || 0); } catch (e) { if (process.env.TM_DEBUG) console.log('page:', e.stack); return null; } };
    const LINE = 'If this is about someone else, ask again without the medicine name.';
    const card = (t) => t.includes(MEDSTYPEDTXT) && t.includes(LINE) && t.includes('#add-meds');
    const MEDSTYPEDTXT = 'You mentioned insulin or sugar tablets. Add it in My food so your plates keep the safe size.';
    const noPlate = (t) => !/HERO PLATE|#plate-card|#lastplates|Showing the plates from before\.|Your plates from before are kept\.|Show my last plates/.test(t);
    const noDish = (t) => !/Kofta from before the hold|Eat about half|#rescue-had|I had this|Another dish|#move-/.test(t);
    const hidden3 = (pt, rt) => !/#directive|about 480 kcal/.test(pt) && !/\.prompts|#prompt-/.test(pt) && !/\.sitbox|#dish-cap|#dish-0/.test(rt);
    const logRowOn = (t) => t.includes('#log-other') && t.includes('#log-skip');
    const stored = (ls) => ls.getItem('np6meds') !== null;
    const savedPlates = (ls) => { try { const s = JSON.parse(ls.getItem('np6')).store; return Object.keys(s.res || {}).length + Object.keys(s.shown || {}).filter(k => s.shown[k]).length; } catch (e) { return -1; } };
    const PLATE = (pg) => ({ meal: pg.C.meal, status: 'ok', meals: [{ title: 'Paneer tikka with jowar roti', kcal: 560 }], ask: '', at: 1, rules: '' });
    const DISH = { status: 'ok', meal: 'lunch', dish: { name: 'Kofta from before the hold', portion: '1 bowl', warning: '', kcal: 600, protein: 20, carbs: 30, fats: 40, fiber: 4, breakdown: '' }, hacks: [{ title: 'Eat about half and leave the rest', deltaKcal: -300, deltaProtein: -10, deltaCarbs: -15, deltaFats: -20, deltaFiber: -2, kind: 'portion' }] };
    const withPlate = (pg) => { const r = PLATE(pg); r.rules = JSON.stringify([pg.P.diet, pg.P.leave.slice().sort(), pg.P.conds.slice().sort(), pg.P.meds, pg.P.age, pg.P.cm, pg.P.kg, pg.P.sex, pg.P.act]); pg.ST().res.k = r; pg.ST().shown[pg.C.meal] = 'k'; };
    const ex = (t) => t.replace(/\n/g, ' | ').slice(0, 260);
    // controls: no fact stored, the stored plate is drawn; a reload with no fact plans by itself (sends /api/meals)
    { const ls = seedLS(), a = page(ls); withPlate(a); const t = a.plate(); add('hold page: control, with no hold the stored plate is drawn', t.includes('HERO PLATE'), ex(t));
      const b = page(seedLS()); b.plate(); b.flush(); add('hold page: control, a page with no stored hold plans by itself (it sends /api/meals)', b.SENT.some(s => /\/api\/meals$/.test(s.path)), `sent ${JSON.stringify(b.SENT.map(s => s.path))}`); }
    // a typed ask with insulin raises the hold: the fact is stored, the saved day store keeps no plate made before it (audit m1: a mutant without save() fails here)
    const ls1 = seedLS(); const a1 = page(ls1); withPlate(a1); a1.UI.rres = DISH; a1.plate(); a1.resc(); const promptNode = a1.node('v-plate', 'prompt-0'), dishNode = a1.node('v-rescue', 'dish-0');
    a1.ask('I take insulin, a light lunch', true); const t1 = a1.plate(), r1 = a1.resc(), b1 = a1.build();
    add('hold: a typed ask with insulin stores the hold outside the day\'s store and sends nothing', stored(ls1) && a1.SENT.length === 0 && a1.held(), `stored ${stored(ls1)}, sent ${a1.SENT.length}`);
    add('hold: the saved day store keeps no plate made before the hold (safety audit of 41e8ac0, m1)', savedPlates(ls1) === 0, `saved plates ${savedPlates(ls1)}`);
    add('hold: Plate shows the card with the line and the log row ("Keep log"), and no earlier plate', card(t1) && noPlate(t1) && logRowOn(t1), ex(t1));
    add('hold: Rescue and Builder show the card ("All tabs"), no earlier dish, move or "I had this"', card(r1) && noDish(r1) && card(b1), ex(r1) + ' || ' + ex(b1));
    add('hold: the meal figure, the example asks and the dish chips are not shown ("Hide all three")', hidden3(t1, r1), ex(t1) + ' || ' + ex(r1));
    // chip and example-ask taps under the hold (a screen drawn before it): nothing is sent, still held
    a1.click(promptNode); a1.flush(); a1.click(dishNode); a1.flush();
    add('hold: an example ask or a common dish tapped under the hold sends nothing and keeps the hold (only a typed ask counts)', !!promptNode && !!dishNode && a1.SENT.length === 0 && stored(ls1) && a1.held(), `prompt ${!!promptNode}, dish ${!!dishNode}, sent ${JSON.stringify(a1.SENT.map(s => s.path))}, stored ${stored(ls1)}`);
    // round 8 (safety audit of 3ee7b41, B2 and M1): words the page put in a box are not typed. Port of p3b: an example ask whose plates are all dropped keeps its words in
    // the ask box; a hold comes up from Rescue; send the ask box. Port of p3a: a chip whose reply could not be read keeps its name in the dish box; a hold comes up from
    // Plate; send the dish box. Each goes through the box's own submit, reads what is sent and what is drawn: nothing sent, the hold stays, the card is drawn
    { const ls = seedLS(), a = page(ls); a.plate(); const pn = a.node('v-plate', 'prompt-0'), words = pn ? pn.kids.map(k => k.text).join('').replace(/[\u201C\u201D]/g, '') : ''; a.click(pn); const er = a.SENT[a.SENT.length - 1];
      if (er && er.done) er.done({ s: 200, j: { status: 'empty' } }); a.resc(); a.typeDish('Rajma chawal, I take insulin'); a.sendDish(); const n0 = a.SENT.length, t0 = a.plate(), kept = a.boxValue('askin');
      a.sendAsk(); a.flush(); const t = a.plate();
      add('hold (round 8, B2, p3b): an example ask\'s words kept in the ask box are not typed: sending the box under the hold sends nothing and the hold stays', !!pn && kept === words && !!words && a.SENT.length === n0 && stored(ls) && card(t) && noPlate(t), `prompt "${words}", box "${kept}", sent ${a.SENT.length - n0}, stored ${stored(ls)}: ${ex(t)}`); }
    { const ls = seedLS(), a = page(ls); a.plate(); a.resc(); const dn = a.node('v-rescue', 'dish-0'), name = dn ? dn.text : ''; a.click(dn); const cr = a.SENT[a.SENT.length - 1];
      if (cr && cr.done) cr.done({ s: 200, j: { status: 'fail' } }); a.plate(); a.typeAsk('I take insulin, what lunch?'); a.sendAsk(); const n0 = a.SENT.length; a.resc(); const kept = a.boxValue('rin');
      a.sendDish(); a.flush(); const r = a.resc(), t = a.plate();
      add('hold (round 8, B2, p3a): a chip\'s name kept in the dish box is not typed: sending the box under the hold sends nothing and the hold stays', !!dn && kept === name && !!name && a.SENT.length === n0 && stored(ls) && card(r) && noDish(r) && card(t), `chip "${name}", box "${kept}", sent ${a.SENT.length - n0}, stored ${stored(ls)}: ${ex(r)}`); }
    // the page's own plans, Try again and the Builder are not typed: under the hold they send nothing (read through the app's own makePlates and rescue)
    a1.ask('', false); a1.ask('something light', false); a1.rescue('Veg thali', false); a1.flush();
    add('hold: an ask or dish not typed by the client sends nothing while the hold is stored (fails closed)', a1.SENT.length === 0 && stored(ls1), `sent ${a1.SENT.length}`);
    // a reload: the hold is read back, the card shows on every tab and nothing is planned by itself
    { const a2 = page(ls1); const t = a2.plate(); a2.flush(); const r = a2.resc(), b = a2.build();
      add('hold: after a reload the card shows on every tab and the page plans nothing by itself (safety audit of 41e8ac0, B1)', card(t) && noPlate(t) && card(r) && card(b) && a2.SENT.length === 0 && hidden3(t, r), `sent ${a2.SENT.length}: ${ex(t)}`); }
    // the 4 am day change: a load with yesterday's day store, and a page left open across 4 am
    { const a3 = page(ls1, -1); const t = a3.plate(); a3.flush(); add('hold: a load after the 4 am day change keeps the hold (the day store is dropped, the hold is not)', card(t) && a3.SENT.length === 0, `sent ${a3.SENT.length}: ${ex(t)}`);
      const a4 = page(ls1); a4.setDay(a4.day() - 1); a4.refresh(); const t4 = a4.plate(); a4.flush(); add('hold: a page open across 4 am keeps the hold', card(t4) && a4.SENT.length === 0 && stored(ls1), `sent ${a4.SENT.length}: ${ex(t4)}`); }
    // the order with the hold stored: a referral first, the log is sent, a partial body with typed food is body_partial and keeps the hold
    // round 8 (safety audit of 3ee7b41, B1 and M1): a referral typed under the stored hold is drawn, ahead of the hold card, on Plate and Rescue, with the line to get help
    // now on an urgent sign, and the hold stays stored. The auditor's 24 cells: three set-ups that do not say insulin (diabetes with "No", no condition, high BP) x Plate and
    // Rescue x four typed texts, typed into the box and sent; read from the drawn page
    { const REF = 'Your coach and doctor should plan this with you.', URG = A.URGENTLINE;
      for (const [pn, pp] of [['diabetes, medicines No', {}], ['no condition', { health: 'none', conds: [], meds: '' }], ['high BP', { health: 'bp', conds: ['bp'], meds: '' }]])
        for (const surf of ['Plate', 'Rescue']) for (const text of ['my sugar is 50, feeling shaky', 'chest pain since lunch, dal rice', 'Gurda fry', 'I am pregnant']) {
          const ls = LSm({ np6: JSON.stringify({ p: PROF7(pp), c: {}, ev: [], k: 'K' }), np6meds: '{"at":1}' }), a = page(ls); if (!a) { add('hold (round 8, B1): a referral typed under the hold is drawn ahead of the hold card, and the hold stays', false, 'no page'); continue; }
          const tr = A.typedReferral(text, a.UI && JSON.parse(JSON.stringify(A.readProfile ? PROF7(pp) : {})));
          if (surf === 'Plate') { a.plate(); a.typeAsk(text); a.sendAsk(); } else { a.resc(); a.typeDish(text); a.sendDish(); } a.flush();
          const t = surf === 'Plate' ? a.plate() : a.resc(), iR = t.indexOf(REF), iU = t.indexOf(URG), iH = t.indexOf(MEDSTYPEDTXT);
          add('hold (round 8, B1): a referral typed under the hold is drawn ahead of the hold card, and the hold stays', !!tr && iR >= 0 && (!tr.urgent || (iU >= 0 && iU < iH)) && iH > iR && stored(ls) && a.SENT.length === 0,
            `${pn}, ${surf}, "${text}": referral ${iR}, urgent ${iU} (want ${!!(tr && tr.urgent)}), hold ${iH}, stored ${stored(ls)}, sent ${a.SENT.length}: ${ex(t)}`); } }
    { const lsk = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }); const pk = JSON.parse(lsk.getItem('np6')); pk.p.conds = ['kidney']; pk.p.health = 'kidney'; lsk.setItem('np6', JSON.stringify(pk)); const a6 = page(lsk); a6.ask('something light', true);
      add('hold: a kidney set-up under the hold is referred (no request)', a6.SENT.length === 0 && /refer/.test(JSON.stringify(a6.ST().res)), JSON.stringify(a6.ST().res).slice(0, 120)); }
    { const lsp = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }); const pp = JSON.parse(lsp.getItem('np6')); pp.p.cm = 0; pp.p.kg = 0; lsp.setItem('np6', JSON.stringify(pp)); const a7 = page(lsp); a7.ask('something light', true);
      add('hold: a partial body with typed food under the hold gets body_partial and keeps the hold', a7.SENT.length === 0 && a7.UI.ecode === 'body_partial' && stored(lsp), `ecode ${a7.UI.ecode}, stored ${stored(lsp)}, sent ${a7.SENT.length}`); }
    // My food: a goal change and unticking diabetes keep the hold; medicines yes or not sure clear it and the plates are made with the floor
    for (const [what, set, clears] of [['a goal change only', (P) => { P.goal = 'lose'; }, false], ['unticking diabetes', (P) => { P.conds = []; P.health = 'none'; }, false],
      ['diabetes with medicines yes', (P) => { P.meds = 'yes'; }, true], ['diabetes with medicines not sure', (P) => { P.meds = 'unsure'; }, true]]) {
      const ls = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }), a = page(ls); a.openFood(); set(a.P); a.closeFood(); const t = a.plate(); a.flush();
      const m = a.SENT.filter(s => /\/api\/meals$/.test(s.path)), floor = m.length ? /at least \d+ kcal, never below/.test((A.plan('meals', J(m[0].body)) || {}).prompt || '') : false;
      if (clears) add('hold: My food saying insulin or not sure clears the hold and the plates are made with the usual size as a minimum (D14)', !stored(ls) && !a.held() && m.length === 1 && floor, `${what}: stored ${stored(ls)}, sent ${m.length}, floor ${floor}`);
      else add('hold: a My food change that does not say insulin or not sure keeps the hold (a goal change, unticking diabetes)', stored(ls) && a.held() && card(t) && a.SENT.length === 0, `${what}: stored ${stored(ls)}, sent ${a.SENT.length}: ${ex(t)}`); }
    // a typed ask without the medicine name ends the hold and is sent
    { const ls = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }), a = page(ls); a.plate(); a.typeAsk('something light with dal'); a.sendAsk();
      add('hold: a typed ask without the medicine name is sent and ends the hold ("ask again without the medicine name")', a.SENT.length === 1 && !stored(ls) && !a.held(), `sent ${a.SENT.length}, stored ${stored(ls)}`);
      const ls2 = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }), b = page(ls2); b.resc(); b.typeDish('Veg thali'); b.sendDish();
      add('hold: a typed dish without the medicine name is sent and ends the hold', b.SENT.length === 1 && !stored(ls2), `sent ${b.SENT.length}, stored ${stored(ls2)}`);
      // round 7b (coordinator): a typed release shape that carries a name passes the net but does not end the stored hold, and nothing is sent that plans without the floor
      for (const t of ['my mother takes insulin', 'My mother takes insulin, what should I cook for her?', "I don't take insulin", 'no insulin', 'insulin resistance diet', 'doctor will start insulin if sugar stays high', 'papa ko insulin lagta hai, main kya banau', 'meri saas metformin leti hai']) {
        for (const via of ['ask', 'dish']) { const lsx = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }), c = page(lsx); if (via === 'ask') { c.plate(); c.typeAsk(t); c.sendAsk(); } else { c.resc(); c.typeDish(t); c.sendDish(); } c.flush(); const pt = c.plate();
          const noFloor = c.SENT.filter(s => /\/api\/(meals|rescue)$/.test(s.path) && !/at least \d+ kcal, never below/.test((A.plan(s.path.split('/').pop(), J(s.body)) || {}).prompt || ''));
          add('hold (round 7b): a typed release shape with a medicine name keeps the stored hold and sends nothing that plans without the floor', A.typedMeds(t) === false && stored(lsx) && c.held() && noFloor.length === 0 && c.SENT.length === 0 && card(pt), `${via} "${t}": stored ${stored(lsx)}, sent ${c.SENT.length}`); } }
      for (const t of ['something light with dal', 'Masala dosa with chutney', 'my mother wants a light dinner', 'no sugar in my tea please']) { const lsx = LSm({ np6: ls1.getItem('np6'), np6meds: ls1.getItem('np6meds') }), c = page(lsx); c.plate(); c.typeAsk(t); c.sendAsk();
        add('hold (round 7b): a typed ask with no medicine name is sent and ends the hold', c.SENT.length === 1 && !stored(lsx) && !c.held(), `"${t}": sent ${c.SENT.length}, stored ${stored(lsx)}`); } }
    // late replies (safety audit of 41e8ac0, m2): a Rescue reply and a plates reply sent before a hold came up are not kept or shown, also after the hold ends
    { const ls = seedLS(), a = page(ls); a.rescue('Veg thali', true); const rr = a.SENT[0]; a.ask('I take insulin', true); if (rr && rr.done) rr.done({ s: 200, j: JSON.parse(JSON.stringify(DISH)) });
      const kept = a.UI.rres; a.ask('something light', true); const r = a.resc();
      add('hold: a Rescue reply sent before a hold came up is not kept, and is not shown after the hold ends (safety audit of 41e8ac0, m2)', !!rr && kept === null && noDish(r), `kept ${JSON.stringify(kept).slice(0, 60)}: ${ex(r)}`); }
    { const ls = seedLS(), a = page(ls); a.ask('', false); const pr = a.SENT[0]; a.UI.busy = ''; a.rescue('Veg thali, I take insulin', true); if (pr && pr.done) pr.done({ s: 200, j: { status: 'ok', meals: [{ title: 'Late plate', kcal: 300 }] } }); const t = a.plate();
      add('hold: a plates reply sent before a hold came up is not shown', !!pr && card(t) && !/Late plate|HERO PLATE/.test(t) && savedPlates(ls) === 0, ex(t)); }
    add('hold: the line under the hold sentence is the owner\'s, word for word ("Add a line (Recommended)")', a1.MEDSOTHER === LINE, JSON.stringify(a1.MEDSOTHER));
    // round 8 (safety audit of 3ee7b41, B3; ports of p6b and p6c): two pages on one store, with no storage event delivered (a tab in the background). Page A changes My food;
    // page B, opened before, makes one Your day choice and saves. The store keeps A's answer; a reload of A plans with it; B itself reads it at its next refresh.
    for (const [what, fact, change, ok] of [
      ['medicines Yes', true, (P) => { P.meds = 'yes'; }, (p, body) => p.meds === 'yes' && /at least \d+ kcal, never below/.test((A.plan('meals', J(body)) || {}).prompt || '')],
      ['leave out dairy', false, (P) => { P.leave = ['dairy']; }, (p, body) => (p.leave || []).indexOf('dairy') >= 0 && (() => { const pl = A.plan('meals', J(body)); const r = pl.check ? pl.check({ status: 'ok', refer_reason: 'none', meals: [{ title: 'Paneer bhurji and bajra rotla', prepMinutes: 20, items: [{ food: 'Paneer bhurji', grams: 150, group: 'protein', contains: ['dairy'] }, { food: 'Bajra rotla', grams: 60, group: 'carbs', contains: ['grain'] }, { food: 'Cucumber salad', grams: 100, group: 'greens', contains: ['plain'] }], contains: ['grain', 'dairy'], grain: { food: 'Bajra rotla', made_of: 'bajra', grams: 60 }, kcal: 330, protein: 16, carbs: 45, fats: 9, fiber: 8, swaps: { protein: [], base: [] }, alchemy: {} }] }) : {}; return !(r.meals || []).some(m => /Paneer/.test(m.title)); })()]]) {
      const ls = LSm(Object.assign({ np6: JSON.stringify({ p: PROF7(), c: {}, ev: [], k: 'K' }) }, fact ? { np6meds: '{"at":1}' } : {})), A1 = page(ls), B1 = page(ls);
      A1.openFood(); change(A1.P); A1.closeFood(); B1.C.mood = B1.C.mood === 'quick' ? 'best' : 'quick'; B1.save();
      const st = JSON.parse(ls.getItem('np6')), A2 = page(ls); A2.plate(); A2.flush(); const m = A2.SENT.filter(x => /\/api\/meals$/.test(x.path));
      B1.refresh(); const bp = JSON.parse(JSON.stringify(B1.P));
      add('hold (round 8, B3): a page opened earlier does not write its old answers over a My food change made in another page; the next plan reads the change', ok(st.p, m.length ? m[0].body : { profile: st.p }) && m.length === 1 && ok(m[0].body.profile, m[0].body) && (what === 'medicines Yes' ? bp.meds === 'yes' : bp.leave.indexOf('dairy') >= 0),
        `${what}: stored ${JSON.stringify({ meds: st.p.meds, leave: st.p.leave, mood: st.c && st.c.mood })}, sent ${m.length} ${m.length ? JSON.stringify({ meds: m[0].body.profile.meds, leave: m[0].body.profile.leave }) : ''}, page B now ${JSON.stringify({ meds: bp.meds, leave: bp.leave })}`); }
    // B's own Your day choice is kept too (its change is the one written)
    { const ls = seedLS(), A1 = page(ls), B1 = page(ls); A1.openFood(); A1.P.goal = 'lose'; A1.closeFood(); B1.C.mood = 'quick'; B1.save(); const st = JSON.parse(ls.getItem('np6'));
      add('hold (round 8, B3): both pages\' changes are kept (A\'s goal and B\'s mood)', st.p.goal === 'lose' && st.c.mood === 'quick', JSON.stringify({ goal: st.p.goal, mood: st.c.mood })); } }
  // what ends the hold, read from the source: two places only (a typed ask or dish that is sent, in api(); My food saying insulin or not sure, in closeSheet())
  { const offs = (appSrc.match(/medsHoldOff\(\)(?!\{)/g) || []).length, rem = (appSrc.match(/removeItem\(MEDSKEY\)/g) || []).length, rmData = /localStorage\.removeItem\("np6"\);localStorage\.removeItem\("np5"\);localStorage\.removeItem\(MEDSKEY\);/.test(appSrc);
    // round 8 (safety audit of 3ee7b41, m2): three ends, each named: api() for a typed ask or dish with no medicine name; closeSheet() when My food says insulin or not sure;
    // "Remove my data", which removes the key with the rest of the client's data (owner question O1)
    add('hold: the hold ends in three places only (api() for a typed ask or dish with no medicine name, closeSheet() when My food says insulin or not sure, and "Remove my data")', offs === 2 && rem === 2 && rmData && /if\(exitB\)medsHoldOff\(\);/.test(grab('api')) && /if\(medsFact\(\)&&medsSetupOK\(\)\)medsHoldOff\(\);/.test(grab('closeSheet')), `${offs} medsHoldOff calls, ${rem} removals of the key (medsHoldOff and Remove my data: ${rmData})`); }
  add('hide: a meal tab does not clear the hold (the tab handler keeps UI.err while medsHeld())', /C\.meal=m\[0\];[^\n]*if\(!medsHeld\(\)\)UI\.err="";/.test(grab('choices')), 'not found in choices()');
  add('hide: a Your day choice does not clear the hold (changed() keeps UI.err while medsHeld())', /function changed\(what\)\{STORE\.shown\[C\.meal\]=null;if\(!medsHeld\(\)\)UI\.err="";/.test(appSrc), 'not found in changed()'); }

// ---------- report ----------
let fail = 0;
for (const [id, r] of Object.entries(res)) { console.log(`${r.bad.length ? 'FAIL' : 'ok  '} ${id}: ${r.n} checks, ${r.bad.length} counter-examples`); r.bad.slice(0, (process.env.ALLBAD ? 9999 : 6)).forEach(b => console.log('       ' + b)); if (r.bad.length > 6) console.log(`       ... ${r.bad.length - 6} more`); fail += r.bad.length; }
console.log(`typed medicine words: ${HELD.length} held phrasings, ${NOT.length} not held`);
console.log(fail ? `${fail} counter-example(s): the typed medicine net does not hold (${pageFile})` : `typed medicine words: the net holds, in the engine and on the phone, in the right order (${pageFile})`);
process.exit(fail ? 1 : 0);
