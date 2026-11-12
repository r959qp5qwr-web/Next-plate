// Unit checks for taste notes and Pair it (owner-approved items 4 and 5). No Gemini, no network.
//   node eval/v6/look-checks.js [built page ...]     default: hosted/v5/index.min.html and hosted/v6/index.min.html
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..');
const pages = process.argv.length > 2 ? process.argv.slice(2) : ['hosted/v5/index.min.html', 'hosted/v6/index.min.html'];
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'none', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low' };
const meal = (taste, why) => ({ title: 'Palak dal with millet roti', subtitle: 'Dal, palak, one millet roti', cuisine: 'North Indian home', prepMinutes: 20,
  items: [{ food: 'Moong dal with palak', grams: 220, group: 'protein' }, { food: 'Millet roti', grams: 60, group: 'carbs' }, { food: 'Cucumber salad', grams: 100, group: 'greens' }],
  kcal: 420, protein: 22, carbs: 62, fats: 9, fiber: 12, why, planned_around: [], for_you: 'This plate keeps your iron in mind.', taste });
let failed = 0;
for (const page of pages) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8'), open = '<script id="np-core">', at = html.indexOf(open), E = vm.createContext({});
  vm.runInContext(html.slice(at + open.length, html.indexOf('</script>', at)), E); console.log('\n' + page);
  const run = (taste, why, p) => vm.runInContext('checkReply6', E)({ status: 'ok', read: 'r', meals: [meal(taste, why)] }, p || P, []).meals[0];
  const check = (name, fn) => { let w = ''; try { w = fn() || ''; } catch (e) { w = 'threw: ' + e.message; } if (w) failed++; console.log(`${w ? 'FAIL' : 'ok  '} ${name}${w ? '  -> ' + w : ''}`); };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b) ? '' : JSON.stringify(a) + ' != ' + JSON.stringify(b);
  const lemon = { pair: 'Palak + a squeeze of lemon', effect: 'The lemon helps the body take up the iron in the palak.' };
  check('schema asks for taste', () => eq(vm.runInContext('platesSchema([],true)', E).properties.meals.items.required.includes('taste'), true));
  check('prompt asks for absorption pairings and taste words', () => { const t = vm.runInContext('buildPlatesPrompt.toString()+""', E); return /take up a nutrient/.test(t) && /taste: 2 or 3 single words/.test(t) ? '' : 'prompt lines missing'; });
  check('three taste words kept, lower case', () => eq(run(['Smoky', 'Tangy', 'Fresh'], [lemon]).taste, ['smoky', 'tangy', 'fresh']));
  check('health words dropped', () => eq(run(['healthy', 'tangy', 'nutritious'], []).taste, []));
  check('fewer than two words shows none', () => eq(run(['smoky'], []).taste, []));
  check('phrases and figures dropped', () => eq(run(['very spicy food', '200 kcal', 'warm', 'nutty'], []).taste, ['warm', 'nutty']));
  check('missing taste is empty, not an error', () => eq(run(undefined, []).taste, []));
  check('a good pairing is kept', () => eq(run([], [lemon]).why, [lemon]));
  check('a pairing with a figure is dropped', () => eq(run([], [lemon, { pair: 'Dal + amla', effect: 'Amla adds 40 g of vitamin C to the meal.' }]).why, [lemon]));
  check('a supplement pairing is dropped', () => eq(run([], [{ pair: 'Palak + iron tablet', effect: 'The tablet tops up your iron.' }]).why, []));
  check('a claim is dropped', () => eq(run([], [{ pair: 'Turmeric + pepper', effect: 'Together they heal inflammation.' }]).why, []));
  check('a food the person leaves out is dropped', () => eq(run([], [{ pair: 'Palak + egg', effect: 'Egg helps the body use the iron.' }], Object.assign({}, P, { diet: 'veg' })).why, []));
}
console.log(failed ? `\n${failed} failed` : '\nall checks passed'); process.exit(failed ? 1 : 0);
