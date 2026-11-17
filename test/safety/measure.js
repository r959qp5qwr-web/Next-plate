// The S8 name detector, shared by test/safety/check.js and test/safety/recorded.js (fix-r12; safety audit of 530a503, M1: the digit
// counts, the word counts and this test each had their own measure list, and the shortest one let "with 1 teaspoon butter" through).
// It reads the engine's one measure list (MEASW in np-core, the list every count rule is built from) and the lexicon's floor
// (test/safety/lexicon.json, known.measure), so a word dropped from the engine's list is still read here.
//   const bad = require('./measure.js')(MEASW, LX.known.measure);   bad(name) -> '' or why the name shows a count or a measure
// What it reads as a household count or measure in a shown name:
//   - any digit, anywhere;
//   - a measure word that never names a food's form (teaspoon, tsp, handful, pinch, ladle, scoop, serving, portion, katori in every form,
//     chammach, kg, litre, ml and the rest), anywhere: start, middle or end;
//   - a measure word that can also name a food's form or the dish it is served in (bowl, plate, cup, slice, piece, glass, mug, gram) only
//     where it measures: before "of", opening the name, or after a joining word, an article or a size ("Rice with bowl dal", "Glass
//     buttermilk", "Dal with a cup curd"); after a food word it names the form or the dish ("Cucumber slices", "Chicken breast pieces",
//     "Kala chana chaat bowl", "Green gram") and is not read. This is narrower than "anywhere" for these eight words only, and on purpose;
//   - a stub a count can leave: "with of", "and of", a joining word at either end ("To idlis", "Dal with").
// Honest names that would still read as one are listed with their reason.
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FORMW = ['bowl', 'bowls', 'plate', 'plates', 'cup', 'cups', 'slice', 'slices', 'piece', 'pieces', 'glass', 'glasses', 'mug', 'mugs', 'gram', 'grams'];
const HONEST = [['cup cake', 'a cake'], ['cupcake', 'a cake'], ['mug cake', 'a cake'], ['glass noodles', 'a noodle'], ['gram flour', 'besan'], ['gram dal', 'a dal']];
module.exports = function measureDetector(MEASW, floor) {
  // "no" is the negation word (S1), and a measure only after a digit, which fails on its own
  const list = [].concat(Array.isArray(MEASW) ? MEASW.filter(w => w !== 'no' && w !== 'nos?') : [], Array.isArray(MEASW) && MEASW.indexOf('nos?') >= 0 ? ['nos'] : [], (floor || []).map(esc));
  const isForm = w => FORMW.some(f => new RegExp('^(?:' + w + ')$', 'i').test(f));
  const strict = list.filter(w => !isForm(w)), form = list.filter(isForm);
  const STRICT = new RegExp('\\b(?:' + strict.join('|') + ')\\b', 'i');
  const FORM = new RegExp('\\b(?:' + form.join('|') + ')\\s+of\\b|(?:^|\\b(?:with|and|in|on|of|for|plus|over|topped|or|a|an|small|medium|large|big|heaped|level|full|half)\\s+)(?:' + form.join('|') + ')\\b', 'i');
  const STUB = /\b(?:with|and|in|on|of|for|plus)\s+(?:of|and|with)\b|^(?:to|of|and|or|with|for|in)\b|\b(?:of|and|with|or|for|to|x)$/i;
  const honest = s => HONEST.reduce((t, [ph]) => t.replace(new RegExp('\\b' + esc(ph) + '\\b', 'gi'), ' '), s);
  const bad = (s) => { if (typeof s !== 'string' || !s) return ''; const t = honest(s); let m;
    if (/\d/.test(s)) return 'a digit'; if ((m = STRICT.exec(t))) return 'the measure "' + m[0] + '"'; if ((m = FORM.exec(t))) return 'the measure "' + m[0].trim() + '"';
    return STUB.test(s) ? 'a stub' : ''; };
  bad.words = list; return bad;
};
module.exports.FORMW = FORMW; module.exports.HONEST = HONEST;
