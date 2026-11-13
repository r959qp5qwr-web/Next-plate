// Rule checks on the built page's np-core (the same code the server runs).
// node test/rules/check.js [page]  -> exit 0 when every rule holds, 1 otherwise.
// Rule 3: with diabetes the grain stays on the plate, including after any swap the app offers; a grain-free stand-in is not a grain.
// Rule 4: the owner's banned words never reach the person in text the model writes. Kidney condition and pregnancy are referred.
const fs = require('fs');
const page = fs.readFileSync(process.argv[2] || 'hosted/v6/index.html', 'utf8');
const open = '<script id="np-core">', a = page.indexOf(open) + open.length;
(0, eval)(page.slice(a, page.indexOf('</script>', a)));
const fx = require('../v5/fixture.js'), fxm = require('../v6/fixture-menu.js');
const P = { goal: 'lose', focus: 'iron', diet: 'veg', health: 'diabetes', meds: 'no', region: 'n', leave: [], sex: 'f', age: 47, cm: 158, kg: 72, act: 'low', done: true };
let bad = 0;
function ok(cond, what) { console.log((cond ? 'ok   ' : 'FAIL ') + what); if (!cond) bad++; }
const meal = fx.meals.meals[0];
for (const slot of ['lunch', 'dinner', 'breakfast']) {
  const p = readProfile(Object.assign({}, P)); p.slot = slot;
  const c = checkMeal(JSON.parse(JSON.stringify(meal)), p);
  ok(!!c.meal, `diabetes ${slot}: the fixture plate passes the check`);
  const base = c.meal ? c.meal.swaps.base.map(s => s.food) : [];
  ok(base.length > 0 && base.every(f => isGrain(f)), `diabetes ${slot}: every base swap is a grain (${base.join(' | ')})`);
  ok(!base.some(f => /cauliflower/i.test(f)), `diabetes ${slot}: the cauliflower mash swap is not offered`);
}
{ // the tune path (swaps asked for after the plate) goes through the same check
  const pl = plan('tune', { profile: Object.assign({}, P), slot: 'dinner', meal: Object.assign({}, meal, { minutes: meal.prepMinutes }) });
  ok(!!pl.check, 'tune: plan accepted');
  const r = pl.check ? pl.check({ swaps: meal.swaps, alchemy: {} }) : null;
  const base = r && r.swaps ? r.swaps.base.map(s => s.food) : [];
  ok(base.length > 0 && base.every(f => isGrain(f)), `tune, diabetes dinner: every base swap is a grain (${base.join(' | ')})`);
}
{ // without diabetes the swap stays on offer
  const p = readProfile(Object.assign({}, P, { health: 'none' })); p.slot = 'dinner';
  const c = checkMeal(JSON.parse(JSON.stringify(meal)), p);
  ok(c.meal && c.meal.swaps.base.some(s => /cauliflower/i.test(s.food)), 'no diabetes: the cauliflower mash swap stays on offer');
}
{ // a plate with no grain is dropped with diabetes
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const c = checkMeal(JSON.parse(JSON.stringify(fx.meals.meals[1])), p);
  ok(c.drop === 'diabetes-grain', 'diabetes dinner: a plate with no grain is dropped');
}
{ // kidney and pregnancy never reach the model
  for (const h of ['kidney', 'preg']) {
    const r = plan('meals', { profile: Object.assign({}, P, { health: h }), ctx: { meal: 'dinner' } });
    ok(r.reply && r.reply.status === 'refer', `${h}: referred, not planned`);
  }
}

// ---- Rule 3, the grain test itself. The oracle is this fixed list, not the page's own word list (Critic round 7).
const STANDINS = ['Cauliflower rice', 'Cauli rice', 'Broccoli rice', 'Zucchini noodles', 'Courgette noodles', 'Shirataki noodles', 'Konjac rice', 'Konjac noodles',
  'Konjac fried rice', 'Kelp noodles', 'Palmini pasta', 'Cabbage noodles', 'Cauliflower roti', 'Almond flour roti', 'Coconut flour bread', 'Coconut flour paratha',
  'Keto bread', 'Keto roti', 'Low-carb roti', 'Grain-free bread', 'Cloud bread', '\u2018Cauliflower rice\u2019 with jeera',
  // round 8: a stand-in followed by a dish word, and names the list missed
  'Cauliflower rice pulao', 'Cauliflower rice biryani', 'Cauliflower rice khichdi', 'Cauliflower rice upma', 'Broccoli rice pulao', 'Lauki noodles', 'Bottle gourd noodles',
  'Cauliflower upma', 'Zero-carb noodles', 'Miracle noodles', 'Hearts of palm pasta', 'Chickpea pasta', 'Red lentil pasta', 'Oopsie bread', 'Sabudana khichdi',
  'Sago khichdi', 'Singhare ki roti', 'Water chestnut flour roti', 'Flaxseed roti',
  // round 9: the Critic's probe names (a dish word beside a stand-in, commas and dashes, brackets, riced, legumes, more vegetables, nut and
  // seed breads, fasting dishes, grain words left out or naming a coating), plus 'cauliflower/broccoli fried rice', read the safe way
  'Moong dal chilla', 'Besan chilla cooked with minimal oil', 'Yellow moong dal cheela batter griddled',
  'Biryani with cauliflower rice', 'Paneer biryani with cauliflower rice', 'Chicken biryani made with cauliflower rice',
  'Pulao made with cauliflower rice', 'Veg pulao with cauliflower rice', 'Khichdi with sabudana', 'Upma made with sabudana',
  'Roti made with almond flour', 'Noodles made with konjac', 'Hakka noodles with zucchini noodles', 'Fried rice with cauliflower rice',
  'Khichdi made with grated cauliflower', 'Cauliflower rice, pulao style', 'Cauliflower rice, biryani-style', 'Cauliflower rice - pulao',
  'Konjac rice, jeera style', 'Sabudana, khichdi style', 'Zucchini, noodle style', 'Cauliflower (rice)', 'Cauliflower (as rice)',
  'Riced cauliflower pulao', 'Riced cauliflower biryani', 'Grated cauliflower pulao', 'Cauliflower pulao (no rice)', 'Biryani (cauliflower rice)',
  'Cauli-rice pulao', 'Moong dal pasta', 'Masoor dal pasta', 'Chana dal pasta', 'Moong dal noodles', 'Chickpea-based pasta', 'Lentil-based pasta',
  'Pasta made from chickpeas', 'Soybean noodles', 'Soybean pasta', 'Green pea pasta', 'Pea protein pasta', 'Black bean spaghetti',
  'Mung bean noodles', 'Lupini pasta', 'Moong dal dosa', 'Moong dal idli', 'Chickpea flour roti', 'Besan bread', 'Carrot noodles',
  'Beetroot noodles', 'Cucumber noodles', 'Daikon noodles', 'Mooli noodles', 'Butternut squash noodles', 'Spaghetti squash pasta', 'Turnip rice',
  'Radish rice', 'Zucchini and carrot noodles', 'Carrot and zucchini noodles', 'Tofu noodles', 'Tofu rice', 'Paneer noodles', 'Egg-white noodles',
  'Sweet potato noodles', 'Almond roti', 'Almond bread', 'Coconut roti', 'Coconut-almond roti', 'Flaxseed bread', 'Flax roti', 'Psyllium bread',
  'Chia bread', 'Seed bread', 'Fathead pizza', 'Sabudana khichdi', 'Singhara roti', 'Vrat wale chawal',
  'Arrowroot roti', 'Makhana khichdi', 'Sweet potato roti', 'Aloo ki roti (vrat)', 'Paneer tikka, no roti', 'Dal without rice', 'Rava fish fry',
  'Rava-crusted paneer', 'Bread-crumbed paneer cutlet', 'Oats-crusted chicken', 'Rice flour batter fried fish', 'Rice bran oil tadka',
  'Rice vinegar cucumber salad', 'Cucumber raita (instead of rice)', 'Palak paneer, skip the naan', 'Lettuce wrap instead of roti',
  'Cauliflower fried rice', 'Broccoli fried rice',
  // round 10: the Critic's probe names (grains named as left out in other words, made-with lists that leave the grain out, more stand-ins,
  // grain words naming a style, a spice mix or a sauce)
  'Paneer tikka, no butter naan', 'Dal tadka without the rice', 'Palak paneer, no tandoori roti', 'Salad instead of steamed rice',
  'Sauteed vegetables instead of brown rice', 'Lettuce cups instead of jowar roti', 'Extra dal in place of 2 phulkas',
  'Cucumber salad in place of the bajra roti', 'Grilled paneer minus the naan', 'Biryani, minus the rice', 'Dal, no white rice',
  'Rajma, no brown rice', 'Grilled fish, no garlic bread', 'Paneer tikka, no-naan', 'Chole, no bhature', 'Chole without kulcha',
  'Stew, skip the appam', 'Vegetable kurma, no idiyappam', 'Dal, no millet', 'Sambar without idiyappam', 'Dal, no bajra', 'Palak paneer, no puri',
  'Kadhi, no thalipeeth', 'Chole, no kulche', 'Sambar, avoid rice', 'Rajma, rice skipped', 'Dal makhani sans rice', 'Butter chicken, not with rice',
  'Dal makhani, no rice or roti', 'Dal makhani, without roti and rice', 'Paneer curry with salad rather than rice', 'Rice-less biryani',
  'Riceless pulao', 'Grainless upma', 'Atta-free roti', 'Chicken curry (rice optional)', 'Roti made with almond flour instead of wheat',
  'Pizza made with cauliflower crust, no maida', 'Pasta made from chickpeas, not wheat', 'Bread made with almond flour, zero wheat',
  'Roti made with coconut flour, no atta', 'Bread made without wheat', 'Roti made with besan, not atta', 'Cauliflower couscous', 'Broccoli couscous',
  'Pumpkin noodles', 'Kaddu noodles', 'Ridge gourd noodles', 'Raw papaya noodles', 'Kohlrabi noodles', 'Spiralised vegetable noodles',
  'Spiralized zucchini and squash pasta', 'Veggie noodles', 'Cellophane noodles', 'Bean thread noodles', 'Seaweed noodles', 'Yam noodles',
  'Glucomannan noodles', 'Potato noodles', 'Gram flour roti', 'Chana atta roti', 'Besan ki roti', 'Soy atta roti', 'Sattu roti (no wheat)',
  'Eggplant noodles', 'Cabbage couscous', 'Mushroom rice (minced mushrooms)', 'Lentil rice', 'Protein noodles', 'Biryani-spiced cauliflower',
  'Pulao-style cauliflower', 'Biryani-style paneer', 'Idli-style steamed moong cakes', 'Upma-style vegetables', 'Poha-style cauliflower',
  'Khichdi-style moong and vegetables', 'Fried-rice-style cabbage', 'Biryani masala paneer', 'Idli podi', 'Pasta sauce', 'Biryani masala',
  'Pulao masala', 'Pav bhaji masala', 'Dosa chutney', 'Rice papad', 'Bread spread'];
const GRAINS = ['Jowar roti', 'Bajra roti', 'Ragi dosa', 'Hand-pounded brown basmati', 'Foxtail millet khichdi', 'Whole wheat roti', 'Lemon rice', 'Coconut rice',
  'Gobi paratha', 'Cauliflower paratha', 'Methi thepla', 'Vegetable hakka noodles', 'Multigrain bread', 'Oats chilla with 1 phulka', 'Vegetable upma',
  'Rajma chawal', 'Chana pulao', 'Cauliflower rice with 2 roti', 'Kuttu roti', 'Rajgira roti',
  // round 9: a grain flour among the ingredients (from recorded live replies)
  'Missi roti made with whole wheat and chickpea flour', 'Missi roti made with besan and whole wheat',
  // round 9: the Critic's true grains (one with egg left out: this profile is vegetarian) and fasting grains
  'Kuttu ki puri', 'Samak rice khichdi', 'Sama ke chawal', 'Brown rice', 'Red rice', 'Matta rice', 'Hand-pounded rice', 'Bajra khichdi',
  'Ragi mudde', 'Jowar bhakri', 'Missi roti', 'Makki ki roti', 'Barley khichdi', 'Dalia', 'Broken wheat upma', 'Quinoa pulao', 'Millet dosa',
  'Thalipeeth', 'Puri', 'Bhatura', 'Akki roti', 'Neer dosa', 'Idiyappam', 'Bisi bele bath', 'Curd rice', 'Pongal', 'Little millet pulao',
  'Barnyard millet khichdi', 'Sorghum roti', 'Pearl millet roti', 'Whole wheat pasta', 'Wholemeal bread', 'Rye bread', 'Oat roti',
  'Multigrain atta roti', 'Bajra and moong khichdi', 'Rice and moong dal khichdi', 'Rice with cauliflower curry', 'Gobi aloo with 2 roti',
  'Jowar roti with lauki sabzi', 'Lauki chana dal and 2 phulka', 'Bottle gourd raita with brown rice', 'Broccoli and brown rice',
  'Zucchini and quinoa salad', 'Cauliflower rice and quinoa', 'Quinoa and cauliflower rice pulao', 'Multigrain roti (wheat, jowar, flax)',
  'Flaxseed multigrain roti', 'Ragi roti with flaxseed', 'Brown rice with flaxseeds', 'Coconut flour and whole wheat roti',
  'Brown rice or cauliflower rice', 'Cauliflower rice or brown rice', 'Brown rice pasta', 'Soba noodles', 'Buckwheat noodles', 'Chapati',
  'Two phulkas', 'Bajra roti, 2 small', 'Masala oats', 'Oats upma', 'Vegetable dalia khichdi', 'Methi paratha', 'Gobi paratha', 'Aloo paratha',
  'Paneer paratha', 'Lauki thepla', 'Doodhi thepla', 'Lauki paratha', 'Bottle gourd paratha', 'Zucchini paratha', 'Broccoli paratha',
  'Cabbage paratha', 'Cabbage thepla', 'Lauki muthia', 'Sabudana and rice khichdi', 'Tapioca with rice', 'Moong dal khichdi', 'Masoor pulao',
  'Rajma chawal', 'Kadhi chawal', 'Chole with brown rice', 'Rice noodles', 'Wheat noodles', 'Atta noodles', 'Ragi noodles', 'Millet noodles',
  'Jowar pasta', 'Quinoa',
  // round 10: a roti with a filling is a wheat roti (the Critic's round 10 reading)
  'Paneer roti', 'Cheese roti',
  // round 10: the Critic's true grains (spellings, other dishes, fillings and toppings, a left-out word that is not the grain)
  'Chapathi', 'Chappati', 'Veg biriyani', 'Chicken briyani', 'Veg pulav', 'Idly', 'Dosai', 'Onion uthappam', 'Aloo parantha', 'Dal bhaat',
  'Dal bhat', 'Thayir sadam', 'Lemon sadam', 'Bisibelebath', 'Vangi bath', 'Puliyogare', 'Khichri', 'Kichdi', 'Khichadi', 'Kanda pohe', 'Uppittu',
  'Akki rotti', 'Jolada rotti', 'Kerala parotta', 'Kothu parotta', 'Chole kulche', 'Theplas', 'Bhakris', 'Naans', 'Dosas', '2 plain dosas',
  'Uttapams', 'Kulchas', 'Appams', 'Adai', 'Pathiri', 'Kozhukattai', 'Paniyaram', 'Handvo', 'Litti chokha', 'Dal baati', 'Luchi', 'Khakhra',
  'Spaghetti', 'Penne arrabbiata', 'Macaroni', 'Veg sandwich', 'Whole wheat sandwich', 'Paneer kathi roll', 'Frankie', 'Muesli', 'Granola',
  'Cornflakes', 'Thukpa', 'Dabeli', 'Bun maska', 'Pizza', 'Wheat pizza', 'Corn roti', 'Maize roti', 'Bajre ki roti', 'Nachni satva', 'Ragi porridge',
  'Ragi malt', 'Ragi ambli', 'Kambu koozh', 'Thinai pongal', 'Varagu rice', 'Samai rice', 'Moraiyo', 'Cheese toast', 'Egg toast', 'Paneer toast',
  'Paneer wrap', 'Egg roti', 'Cheese roti', 'Paneer roti', 'Egg paratha', 'Paneer paratha', 'Moong dal paratha', 'Dal paratha', 'Chana dal paratha',
  'Besan paratha', 'Sattu paratha', 'Paneer stuffed roti', 'Moong dal roti', 'Masoor dal khichdi', 'Moong dal chilla with 1 roti',
  'Cauliflower biryani', 'Gobi pulao', 'Coconut rice', 'Coconut chutney with 2 idlis', 'Egg fried rice', 'Paneer fried rice', 'Tofu fried rice',
  'Soya chunks pulao', 'Chickpea pulao', 'Sweet potato and rice khichdi', 'Sabudana with rice', 'Jeera rice, no ghee', 'Roti without butter',
  'Plain dosa, no oil', 'Brown rice, not too much', 'Not rice but quinoa', 'Quinoa instead of rice', 'Brown rice instead of white rice',
  'Bajra roti in place of wheat roti', 'Jowar roti, no maida', '2 phulka, no ghee'];
STANDINS.splice(0, STANDINS.length, ...new Set(STANDINS)); GRAINS.splice(0, GRAINS.length, ...new Set(GRAINS));
console.log(`fixed lists: ${STANDINS.length} names that are not a grain, ${GRAINS.length} true grains`);
{
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const swapOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], { food: f, grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }];
    const c = checkMeal(m, p); return !!(c.meal && c.meal.swaps.base.some(s => s.food === f)); };
  const plateOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { food: f }) : i);
    m.title = 'Paneer tikka plate'; m.subtitle = 'With palak'; return checkMeal(m, p); };
  const offered = STANDINS.filter(swapOf), passed = STANDINS.filter(f => plateOf(f).meal);
  ok(!offered.length, 'diabetes: no grain-free stand-in is offered as a base swap' + (offered.length ? ' (offered: ' + offered.join(', ') + ')' : ''));
  ok(!passed.length, 'diabetes: a plate whose only base is a grain-free stand-in is dropped' + (passed.length ? ' (passed: ' + passed.join(', ') + ')' : ''));
  const pnv = readProfile(Object.assign({}, P, { diet: 'nonveg' })); pnv.slot = 'dinner';   // the true grains include egg and chicken dishes
  const swapNV = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], { food: f, grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }];
    const c = checkMeal(m, pnv); return !!(c.meal && c.meal.swaps.base.some(s => s.food === f)); };
  const lost = GRAINS.filter(f => !swapNV(f));
  ok(!lost.length, 'diabetes: every true grain stays on offer as a base swap' + (lost.length ? ' (dropped: ' + lost.join(', ') + ')' : ''));
}

{ // the menu path, with diabetes: an order built on a stand-in is dropped; the same order with a roti on the side stays
  const typed = 'MAINS\nCauliflower Rice Biryani 320\nPaneer Tikka 320\nBREADS\nTandoori Roti 30';
  const dish = (name, side) => Object.assign({ as_written: name, portion: '1 plate, about 300 g', kcal: 400, protein: 24, carbs: 30, fats: 20, fiber: 6, ask: '' },
    side ? { with: side, with_kcal: 120, with_protein: 4, with_carbs: 22, with_fats: 2, with_fiber: 3 } : { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 });
  const pl = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed } });
  const a = pl.check({ status: 'ok', place: 'Restaurant', dishes: [dish('Cauliflower Rice Biryani', '')], leave: [], tip: '' });
  ok(!(a.orders || []).some(o => /cauliflower/i.test(o.name)), 'diabetes menu: "Cauliflower Rice Biryani" alone is not offered as the order');
  const b = pl.check({ status: 'ok', place: 'Restaurant', dishes: [dish('Paneer Tikka', '1 Tandoori Roti')], leave: [], tip: '' });
  ok((b.orders || []).length === 1, 'diabetes menu: paneer tikka with a roti on the side is offered');
  // round 9: a portion or ask line that leaves the grain out, and stand-in dishes, are not the diabetes order
  const typed2 = 'MAINS\nPaneer Tikka 320\nButter Chicken 380\nDal Tadka 240\nPalak Paneer 300\nVeg Biryani with Cauliflower Rice 300\nVeg Biryani 280\nRajma Chawal 220\nCauliflower Couscous Bowl 300\nPumpkin Noodles 280\nMoong Dal Dosa 180\nLettuce Wraps 260\nBREADS\nTandoori Roti 30\nButter Naan 60\nSIDES\nGreen Salad 80';
  const pl2 = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed2 } });
  const cases = [['Paneer Tikka', '6 pieces, about 220 g, no naan', ''], ['Butter Chicken', '1 bowl, about 250 g, skip the rice', ''], ['Dal Tadka', '1 bowl, about 300 g, without roti', ''],
    ['Palak Paneer', '1 bowl, about 250 g, instead of rice', ''], ['Paneer Tikka', '6 pieces, about 220 g', 'Green Salad'], ['Veg Biryani with Cauliflower Rice', '1 plate, about 300 g', ''],
    ['Moong Dal Dosa', '2 dosas, about 200 g', ''], ['Lettuce Wraps', '3 wraps, about 220 g, in place of roti', ''], ['Dal Tadka', '1 bowl', '1 Tandoori Roti', 'Skip the roti and have more salad'],
    // round 10: the Critic's orders whose portion or ask leaves the grain out
    ['Butter Chicken', '1 bowl, about 250 g', '1 Tandoori Roti', 'Ask for extra salad, not the roti'], ['Butter Chicken', '1 bowl, about 250 g', '1 Tandoori Roti', 'Have the salad rather than the roti'],
    ['Butter Chicken', '1 bowl, about 250 g', '1 Butter Naan', 'Avoid the naan if you can'], ['Dal Tadka', '1 bowl, about 300 g; leave the roti', '1 Tandoori Roti'],
    ['Veg Biryani', 'Eat only the vegetables, about 150 g', ''], ['Veg Biryani', 'Pick out the vegetables and leave the rice, about 150 g', ''], ['Veg Biryani', '1 plate, about 300 g, minus the rice', ''],
    ['Rajma Chawal', '1 bowl rajma, about 250 g, rice not included', ''], ['Rajma Chawal', 'Rajma only, about 250 g', ''], ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask them to pack the roti for later'],
    ['Cauliflower Couscous Bowl', '1 bowl, about 300 g', ''], ['Pumpkin Noodles', '1 bowl, about 280 g', '']];
  const keepsCases = [['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask for less butter on top'], ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Ask for the naan without butter'],
    ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to skip the butter on the roti'], ['Veg Biriyani', '1 plate, about 300 g', ''], ['Veg Pulav', '1 plate, about 260 g', ''],
    ['Dal Tadka', '1 bowl, about 300 g', '2 Chapathi'], ['Paneer Tikka', '6 pieces, about 220 g', '1 bowl Jeera Rice']];
  const offered = cases.filter(([n, por, side, ask]) => { const d = dish(n, side); d.portion = por; d.ask = ask || ''; return (pl2.check({ status: 'ok', place: 'Restaurant', dishes: [d], leave: [], tip: '' }).orders || []).length; });
  ok(!offered.length, 'diabetes menu: no order whose grain is left out or replaced' + (offered.length ? ' (offered: ' + offered.map(c => c.join(' | ')).join('; ') + ')' : ''));
  const typed3 = typed2 + '\nVeg Biriyani 280\nVeg Pulav 260\nRICE AND BREADS\nChapathi 25\nJeera Rice 160\nTandoori Roti 30\nButter Naan 60';
  const pl3 = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed3 } });
  const refused = keepsCases.filter(([n, por, side, ask]) => { const d = dish(n, side); d.portion = por; d.ask = ask || ''; return !(pl3.check({ status: 'ok', place: 'Restaurant', dishes: [d], leave: [], tip: '' }).orders || []).length; });
  ok(!refused.length, 'diabetes menu: orders that keep their grain, in the spellings menus use, are offered' + (refused.length ? ' (refused: ' + refused.map(c => c.join(' | ')).join('; ') + ')' : ''));
}
{ // round 9: with diabetes no one-tap change takes the grain off; a change from one grain to another stays
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const notes = ['Use cauliflower rice in place of the millet khichdi, with extra palak.', 'Swap the millet khichdi for a bowl of cauliflower rice.',
    'Replace the khichdi with lettuce cups and more paneer.', 'Skip the khichdi tonight and double the palak.', 'Have sauteed vegetables instead of the khichdi.',
    'Pan-fry the paneer and skip the khichdi; eat it with the palak.', 'Leave out the khichdi and add 50 g more paneer.', 'Drop the khichdi and have a bowl of moong soup.',
    'Swap one phulka for an extra bowl of diced cucumber, carrot and onion.',
    // round 10: the Critic's notes, removals in other words
    'Avoid the khichdi tonight and have extra palak with the paneer.', 'Have the paneer and palak with salad, not the khichdi.', 'Pair the paneer with a big salad rather than the khichdi.',
    'Eat the paneer and palak on their own; save the khichdi for lunch tomorrow.', 'Leave the khichdi aside and add a bowl of moong sprouts.', 'Cut the khichdi and double the sauteed palak.',
    'Pass on the khichdi and have more paneer tikka.', 'Ditch the khichdi; fill up on palak and paneer.', 'Keep it to paneer and palak only.', 'Use lettuce cups for the paneer and set the khichdi aside.',
    'Have a large salad and the paneer, and leave the khichdi out.', 'Skip the appam and have the stew with extra vegetables.', 'Leave out the kulcha and add a bowl of salad.',
    'Skip the idiyappam and add a cup of moong sprouts.', 'Skip the thalipeeth and add more curd.', 'Drop the bhatura and have the chole with salad.', 'Skip the sevai and add more vegetables.',
    'Swap the khichdi for pumpkin noodles.', 'Swap the khichdi for cauliflower couscous.', 'Swap the khichdi for a gram flour roti.', 'Swap the khichdi for a besan ki roti.',
    'Replace the millet with a biryani-spiced cauliflower mash.', 'Swap the khichdi for brown rice, then skip it if you are full.', 'Pan-fry the paneer and serve it with palak only.',
    'Add 50 g more paneer and avoid the khichdi.', 'Have moong soup with the paneer rather than khichdi.', 'Drop the brown rice entirely and double the sauteed zucchini portion.'];
  const stays = ['More sprouted green moong in the khichdi, less millet, so the starch drops.', 'Eat the palak first, then the paneer, then the khichdi.', 'Swap white rice for brown rice and add more palak.',
    'Use leftover rice from lunch and pan-fry the paneer.', 'Skip the ghee on the khichdi and add a squeeze of lemon.', 'Use brown rice instead of white rice.', 'Cut the rice to 70 g and double the salad.',
    'Keep the roti warm in a cloth.', 'Serve the khichdi without ghee.', 'Temper with cumin only, and keep the millet as it is.', 'Add a bowl of roasted makhana on the side.'];
  const kept = notes.filter(note => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, deltaKcal: -40, deltaProtein: 0, deltaCarbs: -10, deltaFats: 0, deltaFiber: 2 } };
    const c = checkMeal(m, p); return c.meal && c.meal.alchemy.glucose; });
  ok(!kept.length, 'diabetes: no one-tap change that removes the grain is offered' + (kept.length ? ' (offered: ' + kept.join(' | ') + ')' : ''));
  const lostN = stays.filter(note => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, deltaKcal: -10, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 } };
    const c = checkMeal(m, p); return !(c.meal && c.meal.alchemy.glucose); });
  ok(!lostN.length, 'diabetes: a one-tap change that keeps the grain stays on offer' + (lostN.length ? ' (withheld: ' + lostN.join(' | ') + ')' : ''));
  const big = JSON.parse(JSON.stringify(meal)); big.alchemy = { glucose: { titleSuffix: '(lighter)', note: 'Half the millet, more palak.', minutes: 18, deltaKcal: -120, deltaProtein: 0, deltaCarbs: -30, deltaFats: 0, deltaFiber: 2 } };
  ok(!(checkMeal(big, p).meal || { alchemy: {} }).alchemy.glucose, 'diabetes: a one-tap change that takes more than half the carbs off is not offered');
  const good = JSON.parse(JSON.stringify(meal)); good.alchemy = { glucose: { titleSuffix: '(brown basmati)', note: 'Swap the millet khichdi for hand-pounded brown basmati, and add more palak.', minutes: 20, deltaKcal: -20, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 },
    gut: meal.alchemy.gut, glucose2: null };
  const gk = checkMeal(good, p); ok(!!(gk.meal && gk.meal.alchemy.glucose && gk.meal.alchemy.gut), 'diabetes: a swap from one grain to another, and the fixture\'s own changes, stay on offer');
}

// ---- Rule 4, the owner's banned words, in every field the model writes for the person to read (Critic round 7).
const WORDS = ['real', 'quiet', 'quietly', 'simply', 'seamlessly', 'effortlessly', 'exactly', 'just works', 'journey', 'unlock', 'empower', 'smart', 'magic',
  'game-changer', 'revolutionary', 'transform', 'curated', 'tailored', 'personalised', 'holistic', 'wellness journey'];
const WRX = new RegExp('(^|[^a-z])(' + WORDS.map(w => w.replace(/[-\s]/g, '[\\s-]')).join('|') + '|quieter|smartly|unlocked|empowered|magically|transformation|transformational|personalisation|curation|curating|tailor-made|tailoring|game-changing|smartness|journeying)(?![a-z])', 'i');
function texts(o, keep, path, out) { out = out || []; path = path || '';
  if (typeof o === 'string') { if (!keep.some(k => path.endsWith(k))) out.push([path, o]); }
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) texts(o[k], keep, path + '.' + k, out);
  return out; }
function clear(label, out, keep) { const hits = texts(out, keep || []).filter(([, t]) => WRX.test(t));
  ok(!hits.length, label + (hits.length ? ' (shown: ' + hits.map(([k, t]) => k + '="' + t + '"').join('; ') + ')' : '')); }
{ // plates: read, for_you, title, subtitle, items, why, taste, swaps, one-tap changes
  const m = JSON.parse(JSON.stringify(meal));
  Object.assign(m, { title: 'Quiet comfort khichdi plate', subtitle: 'A smart, tailored dinner', for_you: 'This satisfies real hunger without extra grain.', taste: ['smoky', 'real', 'fresh'] }); // planted on purpose
  m.why[1] = { pair: 'Lemon + palak', effect: 'Simply helps the iron, quietly.' }; // planted on purpose
  m.swaps.protein[2] = { food: 'Magic paneer bhurji', grams: 150, deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 }; // planted on purpose
  m.alchemy.gut.note = 'A holistic, gentle version for a quiet stomach.'; // planted on purpose

  const clean2 = JSON.parse(JSON.stringify(meal)); clean2.alchemy.express.note = 'Air-fried paneer, transformed in ten minutes.'; // planted on purpose
  clean2.why[2] = { pair: 'Curd + jeera', effect: 'Unlocked, empowered, magically quieter: a transformation.' }; clean2.subtitle = 'Smartly spiced, with palak'; // planted on purpose
  clean2.why[0] = { pair: 'Lemon + palak', effect: 'Tailor-made curation, game-changing personalisation, smartness.' }; // planted on purpose
  clean2.title = 'Paneer tikka and millet khichdi'; // a title without a banned word, so this plate is kept and its fields are tested
  const pl = plan('meals', { profile: Object.assign({}, P), ctx: { meal: 'dinner' } });
  ok(!!pl.check, 'meals: plan accepted');
  const out = pl.check({ status: 'ok', read: 'A quiet, real evening: dinner carries the protein.', meals: [m, clean2, fx.meals.meals[2]] }); // planted on purpose
  clear('plates: no banned word in any shown field', out);
  ok(out.meals.length >= 2, 'plates: the plates themselves still come through (' + out.meals.length + ')');
  const t = plan('tune', { profile: Object.assign({}, P), slot: 'dinner', meal: Object.assign({}, meal, { minutes: meal.prepMinutes }) });
  clear('swaps and one-tap changes after the plate: no banned word', t.check({ swaps: m.swaps, alchemy: Object.assign({}, m.alchemy, { express: clean2.alchemy.express }) }));
}
{ // Rescue: the dish name is the person's own; warning, breakdown and moves are the model's voice
  const r = JSON.parse(JSON.stringify(fx.rescue)); r.dish.warning = 'A real heavy plate'; r.dish.breakdown = 'Polished rice, quietly heavy.'; r.hacks[0].title = 'Simply eat the raita first'; // planted on purpose
  const pl = plan('rescue', { profile: Object.assign({}, P), ctx: { meal: 'dinner', text: 'mutton biryani' } });
  r.dish.name = 'A real Hyderabadi mutton biryani'; // planted on purpose
  clear('Rescue: no banned word in any shown field, the dish name included', pl.check(r));
  const r2 = JSON.parse(JSON.stringify(fx.rescue)); r2.dish.name = 'Magic masala dosa'; // planted on purpose: the person typed this word
  const pl2 = plan('rescue', { profile: Object.assign({}, P), ctx: { meal: 'dinner', text: 'magic masala dosa' } }); // planted on purpose
  ok(pl2.check(r2).dish.name === 'Magic masala dosa', 'Rescue: a dish name keeps a word the person typed themselves'); // planted on purpose
  const r3 = JSON.parse(JSON.stringify(fx.rescue)); r3.dish.name = 'A real treat: biryani'; // planted on purpose
  const pl3 = plan('rescue', { profile: Object.assign({}, P), ctx: { meal: 'dinner', text: 'biryani, the real one' } }); // planted on purpose
  const n3 = pl3.check(r3).dish.name; ok(n3 === 'Biryani, the real one', 'Rescue: the model\'s own use of a typed word goes; the person\'s own words stand in (' + n3 + ')'); // planted on purpose
  const r4 = JSON.parse(JSON.stringify(fx.rescue)); r4.dish.name = 'A quiet little biryani'; // planted on purpose
  const pl4 = plan('rescue', { profile: Object.assign({}, P), ctx: { meal: 'dinner', text: 'I am at a wedding and there is mutton biryani, paneer tikka, naan and gulab jamun' } });
  ok(pl4.check(r4).dish.name === 'Your dish', 'Rescue: a long typed sentence is not used as the dish heading'); // planted on purpose
}
{ // the menu: names copied from the menu keep their words; the model's portion, ask, tip and leave reasons do not carry banned words
  const r = JSON.parse(JSON.stringify(fxm.reply)); r.dishes[0].ask = 'Ask for a quiet hand with the butter'; r.dishes[2].portion = '1 bowl, exactly 300 g'; // planted on purpose
  r.tip = 'Simply start with the salad.'; r.leave[0].why = 'A real heavy gravy for a dinner.'; r.place = 'Smart casual North Indian restaurant'; // planted on purpose
  r.dishes[0].with = '1 Tandoori Roti, a real treat'; // planted on purpose: after the side's menu name
  const pl = plan('menu', { profile: Object.assign({}, P, { health: 'none' }), ctx: { meal: 'dinner', text: fxm.typed } });
  const out = pl.check(r);
  clear('menu: no banned word in the model\'s own fields, the place and the side line included', out, ['.name']);
  ok(out.orders.some(o => o.with === '1 Tandoori Roti'), 'menu: a side line keeps its menu name when the words after it go');
}
{ // the meal log: what the person ate keeps their words; the model's assumption line does not carry banned words
  const r = JSON.parse(JSON.stringify(fx.log)); r.assumed = 'Assumed a real, standard home portion.'; r.title = 'Quietly filling aloo paratha'; r.items[1].food = 'Smartly set curd'; // planted on purpose
  const pl = plan('log', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: '2 aloo paratha with curd' } });
  clear('log: no banned word in the title, the foods or the assumption line', pl.check(r));
}
{ // every prompt carries the word rule
  const ks = [['meals', { ctx: { meal: 'dinner' } }], ['rescue', { ctx: { meal: 'dinner', text: 'dosa' } }], ['menu', { ctx: { meal: 'dinner', text: fxm.typed } }],
    ['log', { ctx: { meal: 'lunch', text: 'dosa' } }], ['tune', { slot: 'dinner', meal: Object.assign({}, meal, { minutes: 18 }) }]];
  for (const [k, b] of ks) { const pl = plan(k, Object.assign({ profile: Object.assign({}, P) }, b));
    ok(pl.prompt && /Never use any of these words: real, quiet/.test(pl.prompt), k + ': the prompt asks for none of the banned words'); } // planted on purpose: checks the prompt carries the list
}
console.log(bad ? `${bad} rule check(s) failed` : 'every rule check holds');
process.exit(bad ? 1 : 0);
