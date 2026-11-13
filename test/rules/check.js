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
  'Pulao masala', 'Pav bhaji masala', 'Dosa chutney', 'Rice papad', 'Bread spread',
  // round 11: where the Critic's rounds disagreed the later round stands (D7): a paneer wrap and a moong dal roti are not grains
  'Paneer wrap', 'Moong dal roti',
  // round 13: the Critic's names ("atta" after a pulse, nut or seed; grain coatings on fish and paneer; porridge, bread or rice of a fruit;
  // gluten-free with no gluten-free grain named), oat milk, and three names D7 reads the safe way (keto versions exist)
  "Peanut atta roti", "Peanut atta paratha", "Nuts atta roti", "Urad atta roti", "Chana dal atta roti", "Kathal atta roti", "Roti made from besan atta", "Roti made from almond atta", "Roti made from chana atta", "Chapati made from peanut atta", "Bread made from almond atta", "Roti made with coconut atta", "Paratha made from soya atta", "Roti made from moong atta", "Pizza made from almond atta", "Rava fish", "Rava fried fish", "Rava fried prawns", "Rava tawa fish", "Semolina fried fish", "Rava fried paneer", "Oats paneer tikki", "Oats tikki", "Rava tikki", "Kathal rice", "Kathal roti", "Banana porridge", "Milk porridge", "Avocado bread", "Coconut milk porridge", "Paneer tikka, naan if wanted", "Paneer tikka with naan on request only", "Dal makhani, roti not today", "Paneer tikka; skip the naan", "Gluten-free bread", "Gluten-free roti", "Gluten-free atta roti", "Gluten-free multigrain bread", "Chana atta thepla", "Chana atta bhakri", "Besan atta chilla", "Besan atta cheela", "Moong atta chilla", "Chana atta roti", "Rajma atta roti", "Sattu atta roti", "Soya atta roti", "Besan atta", "Peanut atta", "Oat milk", "Cucumber sandwich", "Coconut roti", "Urad dal dosa",
  // round 12: the Critic's names (a grain-dish word beside a vegetable, legume, nut, seed, cheese, egg or meat that is not a known grain dish;
  // a non-grain flour or 'made from'; 'gluten-free' with no grain named; a grain left out in menu words). Cauliflower biryani moves here (D7).
  'Cauliflower biryani', 'Cauliflower khichdi', 'Cauliflower pulao', 'Cauliflower risotto', 'Cauliflower dosa', 'Cauliflower idli', 'Broccoli biryani', 'Broccoli khichdi', 'Broccoli pulao', 'Broccoli risotto', 'Zucchini rice', 'Sweet potato rice', 'Lauki rice', 'Cabbage khichdi', 'Cabbage pulao', 'Paneer rice', 'Rice made from mushrooms', 'Rice made from zucchini and mushrooms', 'Noodles made from mushrooms', 'Peanut flour roti', 'Peanut flour chapati', 'Peanut flour paratha', 'Peanut flour bread', 'Peanut flour pizza', 'Peanut roti', 'Bread made from peanut flour', 'Roti made from peanut flour', 'Gram flour noodles', 'Gram flour pasta', 'Gram flour idli', 'Gram flour upma', 'Noodles made from gram flour', 'Coconut flour noodles', 'Coconut flour pasta', 'Coconut flour upma', 'Coconut flour idli', 'Flaxseed pasta', 'Flax pasta', 'Flaxseed noodles', 'Chickpea upma', 'Besan upma', 'Moong dal upma', 'Soya chunks roti', 'Tofu roti', 'Nuts porridge', 'Mixed nuts porridge', 'Peanut porridge', 'Warm nuts porridge', 'Cheese gnocchi', 'Paneer gnocchi', 'Paneer lasagne', 'Egg lasagne', 'Chicken crust pizza', 'Cheese crust pizza', 'Egg crust pizza', 'Omelette pizza', 'Pizza omelette', 'Thin egg wrap', 'Thin omelette wrap', 'Thin cheese wrap', 'Thin paneer wrap', 'Stuffed egg pancake', 'Thin egg pancake', 'Cheese bread', 'Egg bread', 'Burger bowl', 'Chicken burger bowl', 'Veg burger bowl', 'Pizza bowl', 'Paneer pizza bowl', 'Sandwich bowl', 'Mushroom bun', 'Mushroom buns burger', 'Paneer bun burger', 'Paneer tikka, naan not included', 'Paneer tikka, naan not served', 'Dal, rice served separately on request', 'Dal makhani, naan not part of the meal', 'Paneer tikka, no naan needed', 'Dal, rice optional', 'Chole, kulcha optional', 'Rajma, chawal later', 'Dal tadka with roti on the side optional', 'Palak paneer (without the roti)', 'Paneer bhurji, roti kept aside', 'Dal, roti set aside', 'Rajma, keep the rice aside', 'Kadhi, skip chawal', 'Kadhi minus chawal', 'Chole, leave out the bhature', 'Paneer tikka, hold off on naan', 'Paneer tikka - roti not included',
  // round 11: the Critic's names (a shape over a vegetable, legume, nut or seed; made from a non-grain; a grain left out in menu words)
  'Cauliflower gnocchi', 'Cauliflower flatbread', 'Cauliflower buns', 'Cauliflower bun', 'Cauliflower toast', 'Cauliflower crackers',
  'Cauliflower lasagne', 'Cauliflower porridge', 'Zucchini lasagne', 'Zucchini sheet lasagne', 'Zucchini flatbread', 'Zucchini buns',
  'Broccoli flatbread', 'Cabbage wrap', 'Cabbage rolls', 'Cabbage roll', 'Cabbage lasagne', 'Sweet potato toast', 'Sweet potato buns',
  'Sweet potato bun', 'Sweet potato toasts', 'Sweet potato flatbread', 'Sweet potato wrap', 'Potato crust pizza', 'Lauki lasagne', 'Spinach wrap',
  'Palak wrap', 'Carrot flatbread', 'Gobi flatbread', 'Chickpea bread', 'Chickpea flatbread', 'Chickpea flour flatbread', 'Chickpea flour tortilla',
  'Chickpea flour tortillas', 'Chickpea tortilla', 'Chickpea wrap', 'Chickpea pizza', 'Chickpea roti', 'Chickpea crackers', 'Chickpea toast',
  'Besan crackers', 'Besan flatbread', 'Besan chapati', 'Besan wrap', 'Besan chilla wrap', 'Besan chilla roll', 'Besan chilla sandwich',
  'Besan uttapam', 'Besan bhakri', 'Moong dal chilla wrap', 'Moong chilla wrap', 'Moong dal chilla roll', 'Moong chilla sandwich',
  'Moong dal uttapam', 'Moong uttapam', 'Moong dal roti', 'Moong roti', 'Moong flatbread', 'Gram flour wrap', 'Gram flour flatbread',
  'Gram flour tortilla', 'Chana roti', 'Chana flatbread', 'Soya flatbread', 'Soya wrap', 'Flax crackers', 'Flaxseed crackers', 'Flax flatbread',
  'Flaxseed bun', 'Flaxseed porridge', 'Flax porridge', 'Coconut flour tortilla', 'Coconut flour tortillas', 'Coconut flour wrap',
  'Coconut flour flatbread', 'Coconut flour crackers', 'Coconut flour bun', 'Coconut flour buns', 'Coconut flatbread', 'Paneer crust', 'Egg wrap',
  'Cheese wrap', 'Tofu wrap', 'Paneer wrap', 'Rice made from cabbage', 'Noodles made from cabbage', 'Noodles made from carrot',
  'Noodles made from radish', 'Noodles made from mooli', 'Rice made from radish', 'Pasta made from black beans', 'Pasta made from green peas',
  'Noodles made from green moong', 'Pasta made from yellow moong dal', 'Pasta made from whole moong', 'Pasta made from split chickpeas',
  'Pasta made with black beans', 'Noodles made with green moong', 'Rice made with cabbage', 'Spaghetti made from carrot',
  'Lasagne made from zucchini', 'Paneer tikka, hold the naan', 'Dal tadka, roti not needed', 'Paneer tikka (naan on request)',
  'Rajma, chawal on the side optional', 'Palak paneer, no need for roti', 'Dal, rice not included', 'Chole, minus bhature',
  'Paneer tikka without naan or rice', 'Dal tadka, but no roti', 'Paneer tikka and salad, no roti or rice', 'Rajma bowl (no chawal)',
  'Dal tadka - rice skipped', 'Grilled paneer, roti-free', 'Dal makhani, naan-less'];
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
  'Egg roti', 'Cheese roti', 'Paneer roti', 'Egg paratha', 'Paneer paratha', 'Moong dal paratha', 'Dal paratha', 'Chana dal paratha',
  'Besan paratha', 'Sattu paratha', 'Paneer stuffed roti', 'Masoor dal khichdi', 'Moong dal chilla with 1 roti',
  'Gobi pulao', 'Coconut rice',
  // round 13 (Critic): ordinary grain dishes with a vegetable, sprouts or cheese, and the Hindi words for wheat
  'Carrot upma', 'Green peas upma', 'Sprouts sandwich', 'Cheese garlic bread', 'Mushroom paratha', 'Potato rice', 'Palak idli', 'Palak sandwich',
  'Beetroot paratha', 'Pumpkin paratha', 'Brinjal rice', 'Beetroot dosa', 'Chakki atta roti', 'Gehun roti', 'Whole wheat atta roti', 'Bajra atta roti',
  // round 13: known grain dishes with a vegetable, cheese, egg or meat word, and 'gluten-free' with a grain named
  'Paneer burger', 'Egg rice', 'Chicken rice', 'Mushroom rice', 'Gobi rice', 'Peanut butter toast', 'Gluten-free oats', 'Gluten-free rice pasta',
  'Mushroom risotto', 'Methi khakhra', 'Aloo poha', 'Matar kulcha', 'Chicken chow mein', 'Mushroom fried rice', 'Paneer burger with 1 bun', 'Coconut chutney with 2 idlis', 'Egg fried rice', 'Paneer fried rice', 'Tofu fried rice',
  'Soya chunks pulao', 'Chickpea pulao', 'Sweet potato and rice khichdi', 'Sabudana with rice', 'Jeera rice, no ghee', 'Roti without butter',
  'Plain dosa, no oil', 'Brown rice, not too much', 'Not rice but quinoa', 'Quinoa instead of rice', 'Brown rice instead of white rice',
  'Bajra roti in place of wheat roti', 'Jowar roti, no maida', '2 phulka, no ghee',
  // round 11: the Critic's true grains (South Indian, Kerala and Bengali dishes, spellings, menu names); 'Ghee roast' is read the safe way
  'Mysore masala dosa', 'Set dosa', 'Paper dosa', 'Ghee roast dosa', 'Benne dosa', 'Podi dosa', 'Onion rava dosa', 'Mini idli', 'Idli vada',
  'Idli vada sambar', 'Ghee podi idli', 'Thatte idli', 'Button idli', 'Idli with chutney', 'Dosa with chutney', 'Roti with chutney', 'Poori masala',
  'Puri masala', 'Chapathi kurma', 'Parotta kurma', 'Malabar parotta', 'Porotta', 'Chilli parotta', 'Ceylon parotta', 'Chappathi', 'Chapathy',
  'Parotha', 'Uttappam', 'Oothappam', 'Ven pongal', 'Khara pongal', 'Semiya upma', 'Vada pav', 'Misal pav', 'Usal pav', 'Bread pakora',
  'Bread omelette', 'Bombay sandwich', 'Aloo tikki burger', 'Pudina paratha', 'Pyaz paratha', 'Mix veg paratha', 'Mix veg uttapam', 'Makki di roti',
  'Navratan pulao', 'Mushroom biryani', 'Mushroom fried rice', 'Mushroom rice', 'Kolkata biryani', 'Ambur biryani', 'Malabar biryani',
  'Thalassery biryani', 'Dindigul biryani', 'Donne biryani', 'Mughlai biryani', 'Awadhi biryani', 'Biriani', 'Kathal biryani', 'Veg chowmein',
  'Chicken chow mein', 'Chilli garlic noodles', 'Singapore noodles', 'Veg momos', 'Steamed momos', 'White sauce pasta', 'Red sauce pasta',
  'Pink sauce pasta', 'Pasta in red sauce', 'Veg lasagna', 'Thin crust pizza', 'Veggie pizza', 'Peanut butter toast', 'Avocado toast',
  'Overnight oats', 'Oats cooked in milk', 'Oats porridge with milk and nuts', 'Ponni rice', 'Seeraga samba rice', 'Gobindobhog rice',
  'Browntop millet', 'Khichuri', 'Kitchari', 'Bhatoora', 'Batata poha', 'Indori poha', 'Dal baati churma', 'Dal dhokli', 'Kuzhi paniyaram',
  'Rajma chawal', 'Dal chawal', 'Curd rice', 'Lemon rice', 'Jeera rice', 'Veg pulao', 'Masala dosa', 'Plain dosa', 'Rava idli', 'Aloo paratha',
  'Gobi paratha', 'Methi thepla', 'Kerala parotta', 'Butter naan', 'Garlic naan', 'Tandoori roti', 'Missi roti', 'Bajra roti', 'Jowar bhakri',
  'Ragi mudde', 'Veg biryani', 'Chicken biryani', 'Hakka noodles', 'Veg fried rice', 'Chole bhature', 'Puri bhaji', 'Pav bhaji', 'Kanda poha',
  'Rava upma', 'Masala oats', 'Brown rice', 'Foxtail millet khichdi', 'Multigrain bread', 'Whole wheat toast', 'Veg sandwich', 'Paneer kathi roll',
  'Spaghetti aglio olio', 'Penne arrabbiata', 'Margherita pizza', 'Bisi bele bath', 'Idiyappam with stew', 'Appam with stew',
  'Puttu and kadala curry', 'Litti chokha', 'Thepla', 'Khakhra', 'Veg thali'];
STANDINS.splice(0, STANDINS.length, ...new Set(STANDINS)); GRAINS.splice(0, GRAINS.length, ...new Set(GRAINS));
console.log(`fixed lists: ${STANDINS.length} names that are not a grain, ${GRAINS.length} true grains`);
{
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  // worst case: the model declares a grain (wheat) as what every swap and plate is made of; the name test must still hold
  const swapOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], { food: f, made_of: 'wheat', grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }];
    const c = checkMeal(m, p); return !!(c.meal && c.meal.swaps.base.some(s => s.food === f)); };
  const plateOf = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { food: f }) : i);
    m.grain = { food: f, made_of: 'wheat', grams: 200 }; m.title = 'Paneer tikka plate'; m.subtitle = 'With palak'; return checkMeal(m, p); };
  const offered = STANDINS.filter(swapOf), passed = STANDINS.filter(f => plateOf(f).meal);
  ok(!offered.length, 'diabetes: no grain-free stand-in is offered as a base swap' + (offered.length ? ' (offered: ' + offered.join(', ') + ')' : ''));
  ok(!passed.length, 'diabetes: a plate whose only base is a grain-free stand-in is dropped' + (passed.length ? ' (passed: ' + passed.join(', ') + ')' : ''));
  const pnv = readProfile(Object.assign({}, P, { diet: 'nonveg' })); pnv.slot = 'dinner';   // the true grains include egg and chicken dishes
  const swapNV = (f) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], { food: f, made_of: 'wheat', grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }];
    const c = checkMeal(m, pnv); return !!(c.meal && c.meal.swaps.base.some(s => s.food === f)); };
  const lost = GRAINS.filter(f => !swapNV(f));
  ok(!lost.length, 'diabetes: every true grain stays on offer as a base swap' + (lost.length ? ' (dropped: ' + lost.join(', ') + ')' : ''));
}

{ // the menu path, with diabetes: an order built on a stand-in is dropped; the same order with a roti on the side stays
  const typed = 'MAINS\nCauliflower Rice Biryani 320\nPaneer Tikka 320\nBREADS\nTandoori Roti 30';
  // worst case: every order declares a grain (wheat, 80 g); the name and wording tests must still hold
  const dish = (name, side) => Object.assign({ as_written: name, portion: '1 plate, about 300 g', kcal: 400, protein: 24, carbs: 30, fats: 20, fiber: 6, ask: '', grain_made_of: 'wheat', grain_grams: 80 },
    side ? { with: side, with_kcal: 120, with_protein: 4, with_carbs: 22, with_fats: 2, with_fiber: 3 } : { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 });
  const pl = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed } });
  const a = pl.check({ status: 'ok', place: 'Restaurant', dishes: [dish('Cauliflower Rice Biryani', '')], leave: [], tip: '' });
  ok(!(a.orders || []).some(o => /cauliflower/i.test(o.name)), 'diabetes menu: "Cauliflower Rice Biryani" alone is not offered as the order');
  const b = pl.check({ status: 'ok', place: 'Restaurant', dishes: [dish('Paneer Tikka', '1 Tandoori Roti')], leave: [], tip: '' });
  ok((b.orders || []).length === 1, 'diabetes menu: paneer tikka with a roti on the side is offered');
  // round 9: a portion or ask line that leaves the grain out, and stand-in dishes, are not the diabetes order
  const typed2 = 'MAINS\nPaneer Tikka 320\nButter Chicken 380\nDal Tadka 240\nPalak Paneer 300\nVeg Biryani with Cauliflower Rice 300\nVeg Biryani 280\nRajma Chawal 220\nCauliflower Couscous Bowl 300\nPumpkin Noodles 280\nMoong Dal Dosa 180\nLettuce Wraps 260\nChole Bhature 220\nVeg Thali (2 roti, rice, dal, sabzi) 250\nMasala Dosa 120\nBREADS\nTandoori Roti 30\nButter Naan 60\nSIDES\nGreen Salad 80';
  const pl2 = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed2 } });
  const cases = [['Paneer Tikka', '6 pieces, about 220 g, no naan', ''], ['Butter Chicken', '1 bowl, about 250 g, skip the rice', ''], ['Dal Tadka', '1 bowl, about 300 g, without roti', ''],
    ['Palak Paneer', '1 bowl, about 250 g, instead of rice', ''], ['Paneer Tikka', '6 pieces, about 220 g', 'Green Salad'], ['Veg Biryani with Cauliflower Rice', '1 plate, about 300 g', ''],
    ['Moong Dal Dosa', '2 dosas, about 200 g', ''], ['Lettuce Wraps', '3 wraps, about 220 g, in place of roti', ''], ['Dal Tadka', '1 bowl', '1 Tandoori Roti', 'Skip the roti and have more salad'],
    // round 10: the Critic's orders whose portion or ask leaves the grain out
    ['Butter Chicken', '1 bowl, about 250 g', '1 Tandoori Roti', 'Ask for extra salad, not the roti'], ['Butter Chicken', '1 bowl, about 250 g', '1 Tandoori Roti', 'Have the salad rather than the roti'],
    ['Butter Chicken', '1 bowl, about 250 g', '1 Butter Naan', 'Avoid the naan if you can'], ['Dal Tadka', '1 bowl, about 300 g; leave the roti', '1 Tandoori Roti'],
    ['Veg Biryani', 'Eat only the vegetables, about 150 g', ''], ['Veg Biryani', 'Pick out the vegetables and leave the rice, about 150 g', ''], ['Veg Biryani', '1 plate, about 300 g, minus the rice', ''],
    ['Rajma Chawal', '1 bowl rajma, about 250 g, rice not included', ''], ['Rajma Chawal', 'Rajma only, about 250 g', ''], ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask them to pack the roti for later'],
    ['Cauliflower Couscous Bowl', '1 bowl, about 300 g', ''], ['Pumpkin Noodles', '1 bowl, about 280 g', ''],
    // round 11: portions and asks in plain English (the Critic's non-veg dishes swapped for veg ones: the profile is vegetarian)
    ['Palak Paneer', '1 bowl, about 250 g', '1 Tandoori Roti', 'Ask them to hold the roti'],
    ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Ask them not to bring the naan'],
    ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Do not eat the naan; have the salad'],
    ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Don\'t order the naan'],
    ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Avoid eating the naan'],
    ['Veg Biryani', 'Eat just the vegetables, about 150 g', '', ''],
    ['Veg Biryani', 'The vegetables alone, about 150 g', '', ''],
    ['Veg Biryani', 'Vegetables only from the top, about 150 g', '', ''],
    ['Veg Biryani', 'Pick out the vegetables, about 150 g', '', ''],
    ['Rajma Chawal', 'Just the rajma, about 250 g', '', ''],
    ['Rajma Chawal', 'Rajma alone, about 250 g', '', ''],
    ['Rajma Chawal', '1 bowl rajma, about 250 g; no need for the chawal', '', ''],
    ['Rajma Chawal', '1 bowl rajma, about 250 g', '', 'Ask for the chawal to be left off'],
    ['Chole Bhature', 'The chole, about 250 g; leave off the bhature', '', ''],
    ['Chole Bhature', 'Just the chole, about 250 g', '', ''],
    ['Veg Thali (2 roti, rice, dal, sabzi)', 'Dal, sabzi and salad from the thali, about 350 g', '', ''],
    ['Veg Thali (2 roti, rice, dal, sabzi)', 'The thali, about 400 g', '', 'Ask them to hold the rice and the rotis'],
    ['Masala Dosa', 'The potato filling and sambar, about 250 g', '', ''],
    ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Give the roti a miss'],
    ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Keep the roti off the plate']];
  const keepsCases = [['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask for less butter on top'], ['Palak Paneer', '1 bowl, about 250 g', '1 Butter Naan', 'Ask for the naan without butter'],
    ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to skip the butter on the roti'], ['Veg Biriyani', '1 plate, about 300 g', ''], ['Veg Pulav', '1 plate, about 260 g', ''],
    ['Dal Tadka', '1 bowl, about 300 g', '2 Chapathi'], ['Paneer Tikka', '6 pieces, about 220 g', '1 bowl Jeera Rice']];
  const offMenu = cases.filter(([n]) => !onMenu(n, menuNorm(typed2))).map(c => c[0]);
  ok(!offMenu.length, 'diabetes menu: every case dish is on the typed menu, so the grain rule is what decides' + (offMenu.length ? ' (not on it: ' + offMenu.join(', ') + ')' : ''));
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
    'Add 50 g more paneer and avoid the khichdi.', 'Have moong soup with the paneer rather than khichdi.', 'Drop the brown rice entirely and double the sauteed zucchini portion.',
    // round 11: removals in plain English
    'Do not eat the khichdi tonight; have extra palak with the paneer.', 'Don\'t have the khichdi; double the palak.',
    'Avoid eating the khichdi and add 50 g more paneer.', 'Skip having the khichdi and fill up on palak.',
    'Try not to eat the khichdi; have more paneer.', 'Hold the khichdi and add a bowl of salad.',
    'Hold off on the khichdi tonight and double the palak.', 'Leave off the khichdi and add more paneer.',
    'Give the khichdi a miss and have extra palak.', 'No need for the khichdi; the paneer and palak are enough.',
    'The khichdi is not needed tonight; add more paneer.', 'Zero khichdi tonight; double the sauteed palak.', 'Have the paneer and palak alone.',
    'Have just the paneer and palak tonight.', 'Eat just the paneer and palak.', 'Forget the khichdi and have a big salad.',
    'Take the khichdi off the plate and add more paneer.', 'Lose the khichdi and add a cup of moong sprouts.',
    'Do away with the khichdi; have more palak.', 'Move the khichdi to tomorrow and have extra paneer now.',
    'Khichdi? Not tonight. More paneer and palak instead.', 'Choose a big salad over the khichdi.',
    'Fill the plate with palak and paneer in place of khichdi.', 'Paneer and palak make the whole dinner tonight.',
    'Keep the khichdi off the plate and add more paneer.', 'Stop before the khichdi; the paneer and palak are dinner.',
    'Replace the grain with more palak.'];
  const stays = ['More sprouted green moong in the khichdi, less millet, so the starch drops.', 'Eat the palak first, then the paneer, then the khichdi.', 'Swap white rice for brown rice and add more palak.',
    'Use leftover rice from lunch and pan-fry the paneer.', 'Skip the ghee on the khichdi and add a squeeze of lemon.', 'Use brown rice instead of white rice.', 'Cut the rice to 70 g and double the salad.',
    'Keep the roti warm in a cloth.', 'Serve the khichdi without ghee.', 'Temper with cumin only, and keep the millet as it is.', 'Add a bowl of roasted makhana on the side.',
    'Eat the palak first, then the paneer, then the khichdi.', 'Keep the khichdi and add a squeeze of lemon.', 'Swap white rice for brown rice.', 'Take the roti hot off the tawa.', 'Cook the moong dal and rice together in one pot to save time.', 'Drop half a phulka and add a bowl of salad.'];
  // worst case for removals: the model still declares 200 g of grain left after the change; the wording test must hold the change back
  const kept = notes.filter(note => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, grain_grams_after: 200, deltaKcal: -40, deltaProtein: 0, deltaCarbs: -10, deltaFats: 0, deltaFiber: 2 } };
    const c = checkMeal(m, p); return c.meal && c.meal.alchemy.glucose; });
  ok(!kept.length, 'diabetes: no one-tap change that removes the grain is offered' + (kept.length ? ' (offered: ' + kept.join(' | ') + ')' : ''));
  const lostN = stays.filter(note => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, grain_grams_after: 150, deltaKcal: -10, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 } };
    const c = checkMeal(m, p); return !(c.meal && c.meal.alchemy.glucose); });
  ok(!lostN.length, 'diabetes: a one-tap change that keeps the grain stays on offer' + (lostN.length ? ' (withheld: ' + lostN.join(' | ') + ')' : ''));
  const big = JSON.parse(JSON.stringify(meal)); big.alchemy = { glucose: { titleSuffix: '(lighter)', note: 'Half the millet, more palak.', minutes: 18, grain_grams_after: 100, deltaKcal: -120, deltaProtein: 0, deltaCarbs: -30, deltaFats: 0, deltaFiber: 2 } };
  ok(!(checkMeal(big, p).meal || { alchemy: {} }).alchemy.glucose, 'diabetes: a one-tap change that takes more than half the carbs off is not offered');
  const good = JSON.parse(JSON.stringify(meal)); good.alchemy = { glucose: { titleSuffix: '(brown basmati)', note: 'Swap the millet khichdi for hand-pounded brown basmati, and add more palak.', minutes: 20, grain_grams_after: 180, deltaKcal: -20, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 },
    gut: meal.alchemy.gut, glucose2: null };
  const gk = checkMeal(good, p); ok(!!(gk.meal && gk.meal.alchemy.glucose && gk.meal.alchemy.gut), 'diabetes: a swap from one grain to another, and the fixture\'s own changes, stay on offer');
}

{ // round 12: the grain as the model declares it, and the Critic's round 12 one-tap notes (read with a worst-case declaration)
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const plate = (g) => { const m = JSON.parse(JSON.stringify(meal)); if (g === undefined) delete m.grain; else m.grain = g; return checkMeal(m, p); };
  ok(!!plate({ food: 'Foxtail millet khichdi', made_of: 'foxtail millet', grams: 200 }).meal, 'declared grain: a plate that names its grain item and a grain material passes');
  ok(plate(undefined).drop === 'diabetes-grain', 'declared grain: a plate with no grain field is dropped with diabetes');
  ok(plate({ food: 'Foxtail millet khichdi', made_of: 'cauliflower', grams: 200 }).drop === 'diabetes-grain', 'declared grain: made of a vegetable is dropped');
  ok(plate({ food: 'Foxtail millet khichdi', made_of: 'besan', grams: 200 }).drop === 'diabetes-grain', 'declared grain: made of gram flour is dropped');
  ok(plate({ food: 'Brown rice', made_of: 'rice', grams: 200 }).drop === 'diabetes-grain', 'declared grain: an item that is not on the plate is dropped');
  ok(plate({ food: 'Foxtail millet khichdi', made_of: '', grams: 200 }).drop === 'diabetes-grain', 'declared grain: an empty material is dropped');
  { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { grams: 20 }) : i);
    ok(checkMeal(m, p).drop === 'diabetes-grain', 'declared grain: a grain item under 30 g is dropped'); }
  { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { food: 'Cauliflower rice' }) : i); m.grain = { food: 'Cauliflower rice', made_of: 'rice', grams: 200 };
    ok(checkMeal(m, p).drop === 'diabetes-grain', 'declared grain: a stand-in declared as rice is still dropped by its name'); }
  const pn = readProfile(Object.assign({}, P, { health: 'none' })); pn.slot = 'dinner';
  ok(!!checkMeal(JSON.parse(JSON.stringify(fx.meals.meals[1])), pn).meal, 'declared grain: without diabetes a plate with no grain still passes');
  const sw = (s) => { const m = JSON.parse(JSON.stringify(meal)); m.swaps.base = [m.swaps.base[0], Object.assign({ grams: 150, deltaKcal: -80, deltaProtein: 0, deltaCarbs: -20, deltaFats: 0, deltaFiber: 2 }, s)];
    const c = checkMeal(m, p); return !!(c.meal && c.meal.swaps.base.some(x => x.food === s.food)); };
  ok(sw({ food: 'Brown rice', made_of: 'brown rice' }), 'declared grain: a base swap made of a grain is offered');
  ok(!sw({ food: 'Brown rice' }), 'declared grain: a base swap with no material is not offered with diabetes');
  ok(!sw({ food: 'Brown rice', made_of: 'cauliflower' }), 'declared grain: a base swap made of a vegetable is not offered');
  ok(!sw({ food: 'Brown rice', made_of: 'rice', grams: 20 }), 'declared grain: a base swap under 30 g is not offered');
  const tap = (after, note) => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: Object.assign({ titleSuffix: '(changed)', note: note || 'Add more palak.', minutes: 18, deltaKcal: -10, deltaProtein: 0, deltaCarbs: -4, deltaFats: 0, deltaFiber: 1 }, after === undefined ? {} : { grain_grams_after: after }) };
    const c = checkMeal(m, p); return !!(c.meal && c.meal.alchemy.glucose); };
  ok(tap(200), 'declared grain: a one-tap change that leaves the grain is offered');
  ok(!tap(undefined), 'declared grain: a one-tap change with no grain-left figure is not offered with diabetes');
  ok(!tap(0), 'declared grain: a one-tap change that leaves no grain is not offered');
  ok(!tap(60), 'declared grain: a one-tap change that leaves under half the grain is not offered');
  ok(!tap(0, 'Have the paneer and palak tonight.'), 'declared grain: a removal the words do not show is held by its figure');
  // the Critic's round 12 one-tap notes, with the worst case: the model still declares 200 g left after each
  const removes = [

 'Have the paneer and palak, and save your appetite: no khichdi tonight.',
 'Let the khichdi go tonight; double the palak.',
 'Give up the khichdi tonight and have more palak.',
 'Put the khichdi back in the pot and fill up on palak.',
 'Pack the khichdi for tomorrow and eat the paneer and palak now.',
 'Keep the khichdi for breakfast; have the paneer and palak now.',
 'The khichdi can wait; have paneer and palak.',
 'Fill up on paneer and palak instead.',
 'Replace the khichdi entirely with palak.',
 'Swap the khichdi for a bowl of moong sprouts.',
 'Trade all the khichdi for sauteed palak.',
 'Have palak and paneer, and no khichdi.',
 'Paneer and palak; khichdi is not needed.',
 'Make it a khichdi-free dinner with extra palak.',
 'Go without the khichdi; double the paneer.',
 'Keep the khichdi out of tonight\'s plate.',
 'Eat the paneer and palak; the khichdi is for another day.',
 'Dinner tonight is paneer and palak, without khichdi.',
 'Serve the paneer over a bed of palak in place of the khichdi.',
 'Use cucumber ribbons where the khichdi was.',
 'Replace one-third... no: replace all the khichdi with sauteed palak.',
 'Swap khichdi with cauliflower rice.',
 'Swap the khichdi for brown rice? No, for lettuce cups.',
 'Have a large salad and skip carbs tonight.',
 'Cut out the khichdi and add more paneer.',
 'Halve the paneer and drop the khichdi.',
 'Drop the khichdi, double the palak.',
 'Eat no grain tonight; more paneer.',
 'Pass on the khichdi and have more palak.',
 'Leave the khichdi in the pot and have extra paneer.',
 'Hold back the khichdi and add palak.',
 'Push the khichdi to lunch tomorrow.',
 'Save the khichdi; more palak tonight.',
 'Have more palak and paneer, minus the khichdi.',
 'More palak, less khichdi: none at all tonight.',
 'Paneer and palak with salad, khichdi free.',
 'Low-carb version: paneer and palak with a salad.',
 'Sautéed palak and paneer as the whole plate.',
 'Paneer palak bowl, no khichdi.',
  ];
  const keeps = [

 'Replace one-third of the rice with roasted okra to slow the rise.',
 'Swap one roti for whole wheat phulka.',
 'Use brown rice in place of white rice.',
 'Eat the khichdi after the palak and paneer.',
 'Eat the khichdi last, after the palak.',
 'Have the khichdi later in the meal, after the palak and paneer.',
 'Spread the khichdi out to cool for 10 minutes before eating.',
 'Let the khichdi cool and eat it at room temperature.',
 'Add a squeeze of lemon over the khichdi.',
 'Start with the palak, then move on to the khichdi.',
 'Have one bowl of khichdi only.',
 'One bowl of khichdi is enough; add more palak.',
 'Top the khichdi with extra palak instead of ghee.',
 'Use less ghee on the khichdi; add a squeeze of lemon instead.',
 'Choose jowar roti over white rice.',
 'Prefer brown rice over white rice.',
 'Pick the millet khichdi over the rice khichdi.',
 'Request a smaller portion of khichdi with extra palak.',
 'Cook the khichdi with more moong and less rice.',
 'Cook the khichdi with extra vegetables; stop at one bowl.',
 'Take a 10-minute walk after the khichdi.',
 'Take the khichdi off the heat early so the rice stays firm.',
 'Have the khichdi with curd, not on its own.',
 'Eat the khichdi with dal, not alone.',
 'Mix the palak into the khichdi; no extra ghee.',
 'Pair the khichdi with a side of cucumber raita instead of pickle.',
 'Add 50 g sprouts to the khichdi; skip the papad.',
 'Skip the papad and pickle; keep the khichdi.',
 'Keep the khichdi, skip the ghee.',
 'Drop one spoon of ghee from the khichdi.',
 'Leave the skin on the vegetables in the khichdi.',
 'Keep the khichdi portion as it is and add 100 g cucumber on the side.',
 'Cook the khichdi with brown rice instead of white.',
 'Use foxtail millet instead of rice in the khichdi.',
  ];
  // recorded live notes the round 12 reader held (eval/; one is from a non-veg plate, so only the grain reading is checked)
  const live = ['Replace one-third of the rice with roasted okra to lower the meal carbohydrate speed.', 'Use pre-cooked millet grain tossed straight into the pan instead of rolling a roti.',
    'Request the phulkas pre-cut into strips mixed into the dry keema for rapid desk dining.', 'Select the quick-box format where curry is packed directly over rice.',
    'Use pre-made wheat phulkas and quick-cook red lentils instead of rolling millet roti.'];
  const offeredR = removes.filter(n => tap(200, n)), heldK = keeps.filter(n => !tap(200, n)).concat(live.filter(n => removesGrain(n)));
  ok(!offeredR.length, 'round 12: no one-tap note that takes the grain off is offered' + (offeredR.length ? ' (offered: ' + offeredR.join(' | ') + ')' : ''));
  ok(!heldK.length, 'round 12: one-tap notes that keep the grain stay on offer' + (heldK.length ? ' (held: ' + heldK.join(' | ') + ')' : ''));
}
{ // round 12: menu orders (the Critic's typed menu, veg profile with diabetes, worst case: every order declares wheat, 80 g)
  const typed = 'MAINS\nPaneer Tikka 320\nPaneer Butter Masala 340\nDal Tadka 240\nDal Makhani 260\nVeg Biryani 380\nRajma Chawal 300\nChole Bhature 520\nChole Kulche 300\nMasala Dosa 120\nPlain Dosa 90\nIdli Sambar 80\nVeg Thali (2 roti, rice, dal, sabzi) 450\nPav Bhaji 180\nKadhi Chawal 200\nPaneer Tikka Wrap 220\nVeg Kathi Roll 180\nBREADS\nTandoori Roti 30\nButter Naan 60\nPlain Naan 50\nLachha Paratha 60\nSIDES\nGreen Salad 80\nJeera Rice 150\nSteamed Rice 120';
  const pl = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed } });
  const order = ([n, por, side, ask], g) => { const d = Object.assign({ as_written: n, portion: por, kcal: 400, protein: 26, carbs: 30, fats: 18, fiber: 6, ask: ask || '', grain_made_of: 'wheat', grain_grams: 80 },
    side ? { with: side, with_kcal: 90, with_protein: 3, with_carbs: 18, with_fats: 1, with_fiber: 2 } : { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 }, g || {});
    return (pl.check({ status: 'ok', place: 'Restaurant', dishes: [d], leave: [], tip: '' }).orders || []).length; };
  const keeps = [

 ['Masala Dosa', '1 dosa with potato filling, about 240 g', '', '', 'live wording'],
 ['Masala Dosa', '1 masala dosa with its aloo filling and sambar, about 300 g', '', ''],
 ['Masala Dosa', '1 dosa, about 250 g', '', 'Ask for less oil on the dosa and extra sambar'],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 550 g', '', 'Please leave out the papad and pickle', 'live wording'],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 500 g', '', 'Ask them to leave the butter off the roti'],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 500 g', '', 'Ask for the sweet to be left out'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask for tandoori roti instead of naan'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Choose tandoori roti over naan'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Order tandoori roti rather than butter naan'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to take the butter off the roti'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to leave the butter off the roti'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask for the roti without butter, and the salad on the side'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Request the roti without butter'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Have the dal first and the roti after'],
 ['Dal Tadka', '1 bowl, about 300 g', '2 Tandoori Roti', 'Two rotis are enough'],
 ['Dal Tadka', '1 bowl, about 300 g', '2 Tandoori Roti', 'Have 2 rotis only'],
 ['Dal Tadka', '1 bowl dal with 1 roti only, about 330 g', '', ''],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Keep the cream out of the dal'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Steamed Rice', 'Ask them to hold the ghee on the rice'],
 ['Dal Makhani', '1 bowl, about 250 g', '1 Tandoori Roti', 'Ask them to skip the cream and butter on top'],
 ['Dal Makhani', '1 bowl, about 250 g', '1 Tandoori Roti', 'Ask for the cream to be left out'],
 ['Dal Makhani', '1 bowl, about 250 g', '1 Tandoori Roti', 'No cream on top; roti without butter'],
 ['Veg Biryani', '1 plate, about 300 g', '', 'Ask for the raita on the side and skip the fried onions'],
 ['Veg Biryani', '1 plate, about 300 g', '', 'Ask them to leave out the fried onions'],
 ['Veg Biryani', '1 plate, about 300 g', '', 'Ask for extra vegetables instead of the fried onions'],
 ['Veg Biryani', 'Half plate, about 200 g', '', 'Ask for the salan on the side instead of mixed in'],
 ['Rajma Chawal', '1 plate, about 350 g', '', 'Please give more rajma and less rice', 'live wording'],
 ['Rajma Chawal', '1 plate, about 350 g', '', 'Ask for the rice to be served on the side'],
 ['Rajma Chawal', '1 plate, about 350 g', '', 'Ask for half the usual rice, extra rajma'],
 ['Kadhi Chawal', '1 plate, about 350 g', '', 'Ask them to skip the pakoras in the kadhi'],
 ['Kadhi Chawal', '1 plate, about 350 g', '', 'Ask for the pakodas to be left out'],
 ['Pav Bhaji', '1 plate with 2 pav, about 300 g', '', 'Ask them to hold the butter on the pav'],
 ['Pav Bhaji', '1 plate with 2 pav, about 300 g', '', 'Ask for the pav without butter'],
 ['Pav Bhaji', '1 plate with 2 pav, about 300 g', '', 'Skip the extra butter on top of the bhaji'],
 ['Idli Sambar', '2 idli with sambar, about 250 g', '', 'Ask for the chutney on the side'],
 ['Idli Sambar', '2 idli with sambar, about 250 g', '', 'Ask for no coconut chutney, extra sambar'],
 ['Idli Sambar', '2 idli only, with extra sambar, about 250 g', '', ''],
 ['Chole Kulche', '1 plate, about 300 g', '', 'Ask for the kulcha without butter'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask for the mint chutney on the side'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask them to keep the butter off'],
 ['Plain Dosa', '1 dosa, about 150 g', '', 'Ask for the dosa to be made with less oil, chutney on the side'],
    // recorded live orders the round 12 reader refused (eval/v6/results-menu-live-look.json and the canteen replies)
    ['Masala Dosa', '1 dosa with potato filling, about 240 g', '', 'Cook with light oil, serve extra sambar'],
    ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali platter, about 550 g', '', 'Please leave out the papad and pickle completely']];
  const removes = [

 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Let the roti go; have the dal with salad'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to bring the roti later, if you still want it'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'The roti can wait; start with the dal and salad'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Have the dal with salad; pack the roti for tomorrow'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask them to pack the roti to go'],
 ['Rajma Chawal', '1 bowl rajma with salad, about 300 g', '', 'Ask them to serve it without the chawal'],
 ['Rajma Chawal', 'Rajma with salad, about 300 g', '', 'Ask for salad in place of the chawal'],
 ['Rajma Chawal', 'A bowl of the rajma with salad, about 300 g', '', 'Ask them to swap the chawal for salad'],
 ['Rajma Chawal', 'The rajma portion, about 250 g', '', ''],
 ['Rajma Chawal', 'Rajma part, about 250 g', '', ''],
 ['Rajma Chawal', 'A bowl of rajma, about 250 g', '', 'Ask them to put the rice in a separate box to take home'],
 ['Chole Bhature', 'Chole, about 250 g', '', 'Ask them not to fry the bhature'],
 ['Chole Bhature', '1 bowl chole, about 250 g', '', 'Ask for salad with it'],
 ['Chole Bhature', '1 bowl chole, about 250 g', '', 'Ask them to serve the bhature to someone else'],
 ['Veg Biryani', 'The vegetables from the biryani, about 150 g', '', ''],
 ['Veg Biryani', 'Vegetables and paneer picked from the biryani, about 150 g', '', ''],
 ['Veg Biryani', 'A plate of the vegetable pieces, about 150 g', '', 'Ask them to serve the vegetables without rice'],
 ['Veg Thali (2 roti, rice, dal, sabzi)', 'Dal and sabzi bowls from the thali, about 350 g', '', ''],
 ['Veg Thali (2 roti, rice, dal, sabzi)', 'Dal, sabzi and salad, about 350 g', '', ''],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 400 g', '', 'Ask them to keep the rice and rotis in the kitchen'],
 ['Masala Dosa', 'The filling and sambar, about 250 g', '', ''],
 ['Masala Dosa', '1 dosa, about 250 g', '', 'Eat the masala and sambar; leave the crepe'],
 ['Pav Bhaji', '1 bowl bhaji, about 250 g', '', 'Ask them to bring the bhaji with salad, pav not wanted'],
 ['Pav Bhaji', 'Bhaji, about 250 g', '', 'Ask for cucumber slices to scoop with'],
 ['Idli Sambar', '1 bowl sambar with vegetables, about 300 g', '', ''],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Give the roti to someone at the table'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask them to skip carbs and add a salad'],
 ['Kadhi Chawal', 'Kadhi, about 250 g', '', 'Ask for a bowl of kadhi with salad, no chawal'],
  ];
  const refused = keeps.filter(k => !order(k)), offered = removes.filter(k => order(k));
  ok(!refused.length, 'round 12: menu orders that keep their grain are offered' + (refused.length ? ' (refused: ' + refused.map(c => c.slice(0, 4).join(' | ')).join('; ') + ')' : ''));
  ok(!offered.length, 'round 12: no menu order that leaves the grain out is offered' + (offered.length ? ' (offered: ' + offered.map(c => c.join(' | ')).join('; ') + ')' : ''));
  const base = ['Veg Biryani', '1 plate, about 300 g', '', ''];
  ok(order(base) === 1, 'declared grain: a menu order that declares its grain is offered');
  ok(!order(base, { grain_made_of: '' }), 'declared grain: a menu order with no grain material is dropped with diabetes');
  ok(!order(base, { grain_made_of: 'cauliflower' }), 'declared grain: a menu order whose grain is a vegetable is dropped');
  ok(!order(base, { grain_grams: 0 }), 'declared grain: a menu order with no grain grams is dropped');
  ok(!order(['Paneer Tikka', '6 pieces, about 220 g', 'Green Salad', '']), 'declared grain: an order with no grain dish is dropped, whatever it declares');
}

{ // round 13: "atta" after a pulse, nut or seed is that flour; grain coatings; the declared material list; the Critic's round 13 orders and notes
  const p = readProfile(Object.assign({}, P)); p.slot = 'dinner';
  const pnv = readProfile(Object.assign({}, P, { diet: 'nonveg' })); pnv.slot = 'dinner';
  const NOTMAT = ["besan atta", "chana atta", "moong atta", "urad atta", "chana dal atta", "besan and atta? no", "gram flour", "chickpea flour (besan)", "besan", "almond flour", "peanut atta", "soya atta", "sattu", "sattu atta", "kathal atta", "jackfruit flour", "singhara atta", "cauliflower", "rice-shaped cauliflower", "cauliflower rice", "konjac", "moong dal", "moong dal and rice? no", "oat fibre", "oat bran", "wheat bran", "rice bran", "psyllium husk", "makhana", "sabudana", "sago pearls", "tapioca", "potato", "sweet potato", "none", "no grain", "grain-free", "rice-free", "wheat-free", "not rice", "almond and coconut flour", "coconut", "urad dal", "rice paper? no", "wheat gluten", "vital wheat gluten", "seitan (wheat gluten)", "rice milk", "oat milk", "corn starch", "cornflour", "maize starch", "rice starch", "arrowroot", "water chestnut flour", "quinoa? yes", "besan with a little atta", "mostly besan, some wheat", "lentils with a pinch of rice", "moong dal with rice flour coating", "rava coating"], ISMAT = ["whole wheat", "brown rice", "foxtail millet", "jowar", "jowar (sorghum)", "whole wheat flour (atta)", "wheat", "atta", "rice", "basmati rice", "semolina", "rava", "sooji", "broken wheat", "cracked wheat", "beaten rice", "flattened rice", "poha", "puffed rice", "rice flakes", "rolled oats", "steel-cut oats", "oats", "pearl millet", "bajra", "ragi", "finger millet", "little millet", "samai", "kodo millet", "barnyard millet", "varagu", "kambu", "thinai", "proso millet", "ragi (finger millet)", "red rice", "matta rice", "hand-pounded rice", "parboiled rice", "idli rice", "rice and urad dal", "rice, urad dal and fenugreek", "fermented rice and lentil batter", "rice and moong dal", "maida", "refined wheat flour", "refined flour (maida)", "durum wheat semolina", "whole wheat pasta", "wheat noodles", "rice noodles", "buckwheat", "barley", "pearl barley", "dalia (broken wheat)", "whole grain wheat", "whole-grain wheat", "multigrain flour", "mixed millets", "corn", "maize", "makki (maize) flour", "sourdough wheat", "whole wheat bread", "bulgur wheat", "quinoa", "amaranth", "rajgira (amaranth)", "kuttu (buckwheat)", "sorghum", "Brown rice.", "Whole wheat atta", "wheat (roti)", "rice (dosa batter)"];
  const badM = NOTMAT.filter(isGrainMaterial), lostM = ISMAT.filter(x => !isGrainMaterial(x));
  ok(!badM.length, 'round 13: no pulse, nut, seed or vegetable material passes as a declared grain' + (badM.length ? ' (passed: ' + badM.join(' | ') + ')' : ''));
  ok(!lostM.length, 'round 13: true grains in everyday words pass as a declared grain' + (lostM.length ? ' (refused: ' + lostM.join(' | ') + ')' : ''));
  const E2E = [["Besan atta chilla", "besan atta"], ["Moong atta chilla", "moong atta"], ["Roti made from chana atta", "chana atta"], ["Chana atta thepla", "chana atta"], ["Chana atta bhakri", "chana atta"], ["Urad atta roti", "urad atta"], ["Chana dal atta roti", "chana dal atta"], ["Roti made from besan atta", "besan atta"], ["Besan atta chilla", "besan"], ["Besan atta chilla", "gram flour"], ["Roti made from almond atta", "almond atta"], ["Peanut atta roti", "peanut atta"], ["Rava fried fish", "rava"], ["Semolina fried fish", "semolina"], ["Rava fried paneer", "rava"], ["Oat milk", "oats"]];
  const plateAs = (f, mo, prof) => { const m = JSON.parse(JSON.stringify(meal)); m.items = m.items.map(i => i.group === 'carbs' ? Object.assign({}, i, { food: f }) : i);
    m.grain = { food: f, made_of: mo, grams: 200 }; m.title = 'Plate'; m.subtitle = 'With palak'; return !!checkMeal(m, prof).meal; };
  const passedE = E2E.filter(([f, mo]) => plateAs(f, mo, pnv));
  ok(!passedE.length, 'round 13: plates of pulse flours or grain-coated fish and paneer are dropped, whatever they declare' + (passedE.length ? ' (accepted: ' + passedE.map(c => c.join(' as ')).join(' | ') + ')' : ''));
  // a protein swap takes the place of the first protein item: with diabetes it may not replace the grain item
  const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
  const km = { title: 'Moong dal khichdi with palak', subtitle: 'Brown rice and moong khichdi, palak, curd', cuisine: 'North Indian home', prepMinutes: 25,
    items: [{ food: 'Yellow moong dal and brown rice khichdi', grams: 250, group: 'protein' }, { food: 'Plain low-fat curd', grams: 100, group: 'protein' }, { food: 'Stir-fried palak with garlic', grams: 120, group: 'greens' }, { food: 'Ghee for tempering', grams: 5, group: 'fats' }],
    grain: { food: 'Yellow moong dal and brown rice khichdi', made_of: 'brown rice and moong dal', grams: 250 }, kcal: 470, protein: 24, carbs: 62, fats: 12, fiber: 11, why: [],
    swaps: { protein: [{ food: 'Yellow moong dal and brown rice khichdi', grams: 250, ...z }, { food: 'Paneer bhurji', grams: 150, ...z, deltaCarbs: -40, deltaKcal: -30 }], base: [] }, alchemy: {} };
  const kc = checkMeal(JSON.parse(JSON.stringify(km)), p);
  ok(!!kc.meal && !kc.meal.swaps.protein.some(s => s.food === 'Paneer bhurji'), 'round 13: with diabetes no protein swap takes the place of a grain item grouped as protein');
  const kn = checkMeal(JSON.parse(JSON.stringify(km)), (() => { const q = readProfile(Object.assign({}, P, { health: 'none' })); q.slot = 'dinner'; return q; })());
  ok(!!kn.meal && kn.meal.swaps.protein.some(s => s.food === 'Paneer bhurji'), 'round 13: without diabetes that protein swap stays on offer');
  const tap = (note, after) => { const m = JSON.parse(JSON.stringify(meal)); m.alchemy = { glucose: { titleSuffix: '(changed)', note, minutes: 18, grain_grams_after: after, deltaKcal: -10, deltaProtein: 0, deltaCarbs: -6, deltaFats: 0, deltaFiber: 1 } };
    const c = checkMeal(m, p); return !!(c.meal && c.meal.alchemy.glucose); };
  const oRemoves = [

 "Have a salad bowl in the khichdi's place.",
 'Bin the khichdi and eat the paneer and palak.',
 'Shelve the khichdi for tonight; more palak.',
 'Keep the khichdi for the family and eat the paneer.',
 'Serve the khichdi to the kids; you have paneer and palak.',
 'Khichdi off the menu tonight; extra palak.',
 "Don't bother with the khichdi tonight.",
 'Give the khichdi a rest tonight; double the palak.',
 'Take a break from the khichdi tonight.',
 'Have the khichdi another time; tonight, paneer and palak.',
 'Use lettuce cups as the base instead.',
 'Paneer and palak over a bed of greens, khichdi set aside.',
 'Replace khichdi -> sauteed palak.',
 'Khichdi out, extra paneer in.',
 'Cancel the khichdi; add a big salad.',
 'Trade the khichdi bowl for a bowl of dal.',
 'Swap in palak where the khichdi would go.',
 'The palak becomes the base, not the khichdi.',
  ];
  const oKeeps = [

 'Ask for the ghee to be kept off the khichdi.',
 'Keep the ghee off the khichdi; add lemon.',
 'Have millet khichdi, not white rice.',
 'Foxtail millet khichdi; no white rice.',
 'Use brown rice, not white rice, in the khichdi.',
 'Let the khichdi rest for 5 minutes before serving.',
 'Keep the khichdi warm while you sear the paneer.',
 'Take the khichdi off the heat early so it stays loose.',
 'Set the khichdi aside to rest while the paneer cooks.',
 'Cook the khichdi with half rice, half moong.',
 'Have half the khichdi now and half later.',
  ];
  const offO = oRemoves.filter(n => tap(n, 200)), heldO = oKeeps.filter(n => !tap(n, 150)), offO0 = oRemoves.filter(n => tap(n, 0));
  ok(!offO.length, 'round 13: no one-tap note that takes the grain off is offered, even when it declares 200 g left' + (offO.length ? ' (offered: ' + offO.join(' | ') + ')' : ''));
  ok(!offO0.length, 'round 13: with an honest 0 g left every one of those notes is held');
  ok(!heldO.length, 'round 13: one-tap notes that keep the grain stay on offer' + (heldO.length ? ' (held: ' + heldO.join(' | ') + ')' : ''));
  const typed = 'MAINS\nPaneer Tikka 320\nPaneer Butter Masala 340\nDal Tadka 240\nDal Makhani 260\nVeg Biryani 380\nRajma Chawal 300\nChole Bhature 520\nChole Kulche 300\nMasala Dosa 120\nPlain Dosa 90\nIdli Sambar 80\nVeg Thali (2 roti, rice, dal, sabzi) 450\nPav Bhaji 180\nKadhi Chawal 200\nPaneer Tikka Wrap 220\nVeg Kathi Roll 180\nBREADS\nTandoori Roti 30\nButter Naan 60\nPlain Naan 50\nLachha Paratha 60\nPhulka 20\nSIDES\nGreen Salad 80\nJeera Rice 150\nSteamed Rice 120';
  const pl = plan('menu', { profile: Object.assign({}, P), ctx: { meal: 'lunch', text: typed } });
  const order = ([n, por, side, ask], typedPl) => { const d = Object.assign({ as_written: n, portion: por, kcal: 400, protein: 26, carbs: 30, fats: 18, fiber: 6, ask: ask || '', grain_made_of: 'wheat', grain_grams: 80 },
    side ? { with: side, with_kcal: 90, with_protein: 3, with_carbs: 18, with_fats: 1, with_fiber: 2 } : { with: '', with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 });
    return ((typedPl || pl).check({ status: 'ok', place: 'Restaurant', dishes: [d], leave: [], tip: '' }).orders || []).length; };
  const mKeeps = [

 ['Pav Bhaji', '1 plate with 2 pav, about 300 g', '', 'Ask for the butter to be kept off the pav'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask for the ghee to be left off the roti'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Steamed Rice', 'Ask for the oil to be kept out of the rice'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask for the butter to be taken off the roti'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Tandoori roti, not butter naan'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Tandoori roti; no naan'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Phulka', 'Ask for phulka, not paratha'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Roti without ghee, please'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Ask for one roti instead of two'],
 ['Rajma Chawal', '1 plate, about 350 g', '', 'Ask for brown rice if they have it'],
 ['Masala Dosa', '1 dosa with the stuffing, about 250 g', '', ''],
 ['Idli Sambar', '3 idlis with sambar, about 300 g', '', ''],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 500 g', '', 'Ask them to hold the gulab jamun'],
 ['Veg Thali (2 roti, rice, dal, sabzi)', '1 thali, about 500 g', '', 'Ask for one roti instead of two'],
 ['Chole Bhature', '1 bhatura with 1 bowl chole, about 300 g', '', 'Ask for one bhatura instead of two'],
 ['Chole Bhature', '2 bhature with 1 bowl chole, about 400 g', '', 'Ask them to take the extra oil off the bhature'],
 ['Chole Kulche', '1 plate, about 300 g', '', 'Ask for the kulcha to be served without butter'],
 ['Veg Biryani', '1 plate, about 300 g', '', 'Ask for the fried onions to be left off the top'],
 ['Veg Biryani', '1 plate, about 300 g', '', 'Ask for the ghee to be kept out of the biryani'],
 ['Kadhi Chawal', '1 plate, about 350 g', '', 'Ask for the pakoras to be taken out of the kadhi'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'No butter brushed on top, extra lemon wedges and onion rings'],
  ];
  const mRemoves = [

 ['Rajma Chawal', '1 bowl, about 250 g', '', 'Rice in a separate box, please'],
 ['Masala Dosa', 'The stuffing, about 200 g', '', ''],
 ['Masala Dosa', 'The stuffing and chutneys, about 200 g', '', ''],
 ['Veg Thali (2 roti, rice, dal, sabzi)', 'The curries, about 300 g', '', ''],
 ['Pav Bhaji', 'The mash with onions, about 250 g', '', ''],
 ['Veg Biryani', '1 bowl of the salan, about 200 g', '', ''],
 ['Veg Biryani', 'The toppings, about 150 g', '', ''],
 ['Chole Bhature', '1 bowl, about 250 g', '', ''],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Roti for the table to share'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Ask them to put the roti in a doggy bag'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Have the roti boxed up'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Roti off the order; extra salad'],
 ['Paneer Tikka', '6 pieces, about 220 g', '1 Tandoori Roti', 'Cancel the roti and add a salad'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Do not bother with the roti'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Tell them you will pass on the roti tonight'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Return the roti and ask for salad'],
 ['Dal Tadka', '1 bowl, about 300 g', '1 Tandoori Roti', 'Send the roti back'],
 ['Rajma Chawal', 'The kidney bean curry, about 250 g', '', ''],
 ['Kadhi Chawal', 'A bowl of the yogurt curry, about 250 g', '', ''],
 ['Rajma Chawal', 'Rajma bowl with salad instead, about 300 g', '', ''],
  ];
  const refM = mKeeps.filter(k => !order(k)), offM = mRemoves.filter(k => order(k));
  ok(!refM.length, 'round 13: menu orders that keep their grain are offered' + (refM.length ? ' (refused: ' + refM.map(c => c.join(' | ')).join('; ') + ')' : ''));
  ok(!offM.length, 'round 13: no menu order that leaves the grain out is offered' + (offM.length ? ' (offered: ' + offM.map(c => c.join(' | ')).join('; ') + ')' : ''));
  // a grain written into the portion counts only when the place sells it
  const bare = plan('menu', { profile: Object.assign({}, P, { diet: 'nonveg' }), ctx: { meal: 'lunch', text: 'MAINS\nPaneer Tikka 320\nDal Tadka 240\nPalak Paneer 300\nChicken Tikka 360\nSIDES\nGreen Salad 80\nCucumber Raita 90' } });
  const withBread = plan('menu', { profile: Object.assign({}, P, { diet: 'nonveg' }), ctx: { meal: 'lunch', text: 'MAINS\nPaneer Tikka 320\nDal Tadka 240\nPalak Paneer 300\nChicken Tikka 360\nBREADS\nTandoori Roti 30\nButter Naan 60\nRICE\nSteamed Rice 120' } });
  const PG = [['Dal Tadka', '1 bowl dal with 1 roti, about 330 g', '', ''], ['Paneer Tikka', '6 pieces with 2 rotis, about 300 g', '', ''], ['Palak Paneer', '1 bowl with steamed rice, about 400 g', '', ''], ['Chicken Tikka', '6 pieces with 1 naan, about 300 g', '', '']];
  const offPG = PG.filter(k => order(k, bare)), refPG = PG.filter(k => !order(k, withBread));
  ok(!offPG.length, 'round 13: a grain in the portion that the menu does not sell does not count' + (offPG.length ? ' (offered: ' + offPG.map(c => c[0] + ' | ' + c[1]).join('; ') + ')' : ''));
  ok(!refPG.length, 'round 13: a grain in the portion that the menu sells counts' + (refPG.length ? ' (refused: ' + refPG.map(c => c[0] + ' | ' + c[1]).join('; ') + ')' : ''));
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
