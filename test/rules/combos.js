// Combinatorial probes for owner rule 3 (Critic round 17's process note): grain x separator x verb x continuation for one-tap notes and
// menu asks, dish x filling x bracket for grain names, coating grain x frying word x food for coatings. Each case has the verdict a reader
// of the sentence would give; the rule check fails on any case the page gets wrong. Used by test/rules/check.js.
module.exports = function (N, meal) {

const P = { goal: 'lose', focus: 'iron', diet: 'nonveg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
function tapOK(C, note, after) { const p = C.readProfile(Object.assign({}, P)); p.slot = 'dinner'; const m = JSON.parse(JSON.stringify(meal));
  m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, grain_grams_after: after, deltaKcal: -10, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 } };
  const c = C.checkMeal(m, p); return !!(c.meal && c.meal.alchemy.glucose); }
const typed = 'MAINS\nDal Tadka 240\nPaneer Tikka 320\nBREADS\nTandoori Roti 30\nRICE\nSteamed Rice 120';
function askOK(C, side, ask, keepAsk) { const pl = C.plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed } });
  const d = { as_written: 'Dal Tadka', portion: '1 bowl, about 300 g', kcal: 400, protein: 26, carbs: 30, fats: 18, fiber: 6, ask, grain_made_of: 'wheat', grain_grams: 80, with: side, with_kcal: 90, with_protein: 3, with_carbs: 18, with_fats: 1, with_fiber: 2 };
  const o = (pl.check({ status: 'ok', place: 'R', dishes: [d], leave: [], tip: '' }).orders || [])[0];
  return !!o && (keepAsk || !!o.ask); }   /* an ask the engine drops (a figure in it) never reaches the person: the order keeps its grain */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// ---------- one-tap notes and menu asks ----------
const G = ['rice', 'roti', 'khichdi'];
const removes = [], keeps = [];
for (const g of G) {
  for (const sep of [',', ':', '?', ';']) {
    for (const neg of ['not', 'no', 'never', 'none', 'nope', 'skip', 'skip it', 'leave it', 'cut it out', 'drop it', 'without', 'nah', 'not for me', 'not even 50 g', 'drop the 150 g', 'none of the 150 g', 'leave it for now', 'leave it this time', 'leave it untouched', 'save it for tomorrow', 'save it for the kids'])
      for (const tail of ['', ' tonight', ' today', ' this time', ' thanks', ' at dinner'])
        removes.push(cap(g) + sep + ' ' + neg + tail + '; double the dal.');
    for (const k of ['take it after the salad', 'take it last', 'save it for the end', 'leave it to cool, then eat 150 g', 'no ghee on top', 'not too much: 150 g', 'cut it into quarters', 'hold it in a cloth so it stays soft', 'eat it slowly, 150 g', 'have it with the dal', 'keep it to 150 g'])
      keeps.push(cap(g) + sep + ' ' + k + '.');
  }
  for (const v of ['goes', 'can go', 'is off', 'is out', 'should go', 'will go'])
    for (const c of ['', ' completely', ' entirely', ' altogether', ' for this meal', ' this time', ' tonight', ' back in the pot', ' to the fridge', ' into the box', ' off the plate', ' out of the meal', ' to the kids', ' untouched', ' till tomorrow', ' for 2 days', ' for good', ' for now'])
      removes.push('The ' + g + ' ' + v + c + '; double the dal.');
  for (const c of [' last', ' after the salad', ' down to 150 g', ' with the dal', ' at the end of the meal']) keeps.push('The ' + g + ' goes' + c + '; 150 g.');
  for (const v of ['Keep', 'Pack', 'Save', 'Leave', 'Put', 'Send', 'Move', 'Set', 'Push', 'Hold', 'Give', 'Serve', 'Bring'])
    for (const c of ['for tomorrow', 'for later', 'for the kids', 'for the family', 'aside', 'away', 'back in the pot', 'in the fridge', 'to the kids', 'for breakfast', 'off the plate'])
      removes.push(v + ' the ' + g + ' ' + c + '; double the dal.');
  for (const v of ['Skip', 'Drop', 'Remove', 'Avoid', 'Omit', 'Ditch', 'Bin', 'Cancel', 'Cut out', 'Leave out', 'Forget', 'Lose', 'Pass on', 'Give up', 'Do without', 'Go without'])
    removes.push(v + ' the ' + g + '; double the dal.');
  removes.push('No ' + g + ' tonight; double the dal.', 'Have the dal without the ' + g + '.', 'Swap the ' + g + ' for salad.', 'Replace the ' + g + ' with salad.', 'Salad instead of the ' + g + '.', 'Have salad in place of the ' + g + '.', 'Have a salad in the ' + g + "'s place.");
  keeps.push('Eat the ' + g + ' after the salad.', 'Have 150 g of ' + g + '.', 'Keep the ' + g + ' warm.', 'Serve the ' + g + ' without ghee.', 'Skip the ghee on the ' + g + '.', 'Swap the ' + g + ' for brown rice.',
    'Use brown rice instead of the ' + g + '.', 'Half the ' + g + ' goes back in the pot; eat 150 g.', 'Share the ' + g + ' at the table; you take 150 g.', 'The ' + g + ' goes to the fridge for an hour; reheat 150 g.', 'Leave the butter off the ' + g + '.', 'Take the ' + g + ' off the heat early.');
}
for (const g of G) { const Gc = cap(g);
  keeps.push('Take the ' + g + ' off the heat after 2 whistles.', 'Take the ' + g + ' off the tawa and eat it hot.', 'Keep the ' + g + ' covered so it stays warm.',
    'Leave the ' + g + ' in the pot for 5 minutes to steam.', 'Leave the ' + g + ' to rest for 5 minutes.', 'The ' + g + ' goes well with the dal.', 'The ' + g + ' can go in the pressure cooker for 3 whistles.',
    'Have the ' + g + ' with the family at the table.', 'Serve the ' + g + ' to everyone; 150 g for you.', 'Share the ' + g + ' with the family; you take 150 g.', 'Make extra ' + g + ' for the kids; you have 150 g.',
    Gc + ': keep it to 150 g.', 'Put the ' + g + ' in a bowl and eat it after the salad.', 'Keep the ' + g + ' in a casserole so it stays hot.', 'Eat the ' + g + ' last, after the dal.',
    'Cook the ' + g + ' with less water so it stays firm.', 'Leave the ghee out of the ' + g + '.', 'Keep the oil off the ' + g + '.', 'The ' + g + ' is out of the cooker; add lemon.',
    'Once the ' + g + ' is off the stove, rest it 5 minutes.', 'Serve the ' + g + ' on the side, 150 g.', 'Keep 150 g of ' + g + ' and add more dal.', 'Halve the ' + g + ' to 150 g.',
    'Swap half the ' + g + ' for salad; keep 150 g.', 'Replace a third of the ' + g + ' with salad.', 'Have the ' + g + ' first, then the dal.', 'Reheat the ' + g + ' from the fridge, 150 g.'); }
keeps.push('Have one roti and give the rest to the family.', 'Eat one roti and send the other to the kids.', 'You can go for the brown rice, 150 g.', 'Roti goes with the dal, one only after the sabzi.');
// ---------- names ----------
const dishes = ['Fried Rice', 'Tawa Pulao', 'Tawa Paratha', 'Crispy Dosa', 'Schezwan Fried Rice', 'Egg Fried Rice', 'Fried Noodles', 'Masala Dosa', 'Rava Dosa', 'Jeera Rice', 'Lemon Rice', 'Veg Biryani', 'Chicken Biryani', 'Hakka Noodles', 'Plain Rice', 'Kerala Parotta', 'Chapati'];
const fill = ['Veg', 'Chicken', 'Paneer', 'Egg', 'Aloo', 'Fish Fry', 'Dal Fry', 'Raita', 'Bhindi Fry', 'Chilli Chicken'];
const grainNames = [], coatNames = [];
for (const d of dishes) for (const sp of [' (X)', ' - X', ' X', ' with X', ', X']) for (const f of fill) grainNames.push(d + sp.replace('X', f));
for (const v of ['Tomato', 'Vegetable', 'Carrot', 'Paneer', 'Egg', 'Onion', 'Masala']) for (const g of ['rava', 'oats', 'dalia', 'poha', 'rava upma', 'sooji upma', 'quinoa', 'millet khichdi']) grainNames.push(v + ' ' + g);
for (const g of ['Rava', 'Sooji', 'Semolina', 'Rice flour', 'Atta', 'Wheat flour', 'Oats', 'Maida', 'Rice rava', 'Ragi', 'Jowar', 'Millet'])
  for (const f of ['fish', 'prawns', 'paneer', 'brinjal', 'potato', 'bhindi', 'mushrooms', 'gobi', 'chicken'])
    for (const form of ['G fried F', 'crispy G F', 'tawa G F', 'G crusted F', 'G coated F', 'G F fry', 'F fry in G', 'F fried in G', 'crispy G fried F', 'golden G fried F'])
      coatNames.push(cap(form.replace('G', g.toLowerCase()).replace('F', f)));
  // round 18 (Critic): a figure for another food, "then eat", a stand-in after the grain dish, crusts that are not pure grains, fillings
  for (const g of G) { const Gc = cap(g);
    for (const f of ['have 100 g extra paneer', 'have 150 g of dal', 'eat 200 g salad', 'add 100 g paneer', 'then eat more dal', 'then have double salad', 'then eat the paneer with salad'])
      for (const r of [Gc + ': skip it; ', Gc + ': leave it tonight, ', 'Rice for the kids; '.replace('Rice', Gc), 'Box the ' + g + ' for tomorrow lunch; ', Gc + ': save it with the leftovers; '])
        removes.push(r + f + '.');
    keeps.push('Send half the ' + g + ' to the family; you keep half.', 'Cut 50 g ' + g + ' from the plate; 150 g is plenty.', 'Drop the ' + g + ' by 50 g; more dal.', 'Leave 50 g ' + g + ' for the family; eat 150 g.',
      Gc + ': keep 150 g for yourself.', 'Serve 150 g and the rest of the ' + g + ' goes back in the pot.'); }
  for (const d of ['Rice', 'Noodles', 'Pasta', 'Roti', 'Fried Rice', 'Masala Rice'])
    for (const st of ['Cauliflower', 'Zucchini', 'Broccoli', 'Cabbage', 'Konjac'])
      for (const sp of [' (X)', ' - X', ' X']) coatNames.push(d + sp.replace('X', st));
  for (const st of ['Cauliflower', 'Zucchini', 'Broccoli']) for (const mid of ['masala', 'tikka', 'manchurian', 'fried']) coatNames.push(st + ' ' + mid + ' rice');
  for (const c of ['poha', 'cornflakes', 'vermicelli', 'sevai', 'noodle', 'rice']) for (const f of ['fish', 'prawns', 'chicken', 'paneer']) for (const fr of ['Crispy', 'Crunchy', 'Puffed'])
    coatNames.push(fr + ' ' + c + ' ' + f);
  for (const d of ['Masala Dosa', 'Aloo Paratha', 'Paneer Paratha']) for (const v of ['with the potato filling', 'with the aloo stuffing', 'with the paneer stuffing', 'stuffed with the aloo filling'])
    grainNames.push(d + ' ' + v);
  const wrong = [];
  const judge = (kind, text, want, got) => { if (got !== want) wrong.push(kind + ': ' + text); };
  for (const r of removes) judge('one-tap removal offered', r, false, tapOK(N, r, 200));
  for (const k of keeps) judge('one-tap keep held', k, true, tapOK(N, k, 150));
  for (const r of removes.filter(x => /\b(?:rice|roti)\b/i.test(x))) judge('menu ask removal offered', r, false, askOK(N, /rice/i.test(r) ? '1 Steamed Rice' : '1 Tandoori Roti', r));
  for (const k of keeps.filter(x => /\b(?:rice|roti)\b/i.test(x))) judge('menu ask keep refused', k, true, askOK(N, /rice/i.test(k) ? '1 Steamed Rice' : '1 Tandoori Roti', k, true));
  for (const n of grainNames) judge('grain name refused', n, true, N.isGrain(n));
  for (const n of coatNames) judge('coating counted', n, false, N.isGrain(n));
  return { cases: removes.length + keeps.length + grainNames.length + coatNames.length, wrong };
};
