// Layout-check fixture. Meals and numbers come from the owner's Gemini file (docs/foundation): [S] CURATED_MEALS
// "pahadi-paneer", [P] MEALS_DB "ind-3" and "exp-1", [S] DELIVERY_DISHES "andhra-biryani". Item grams are placeholders
// for the layout check only (the Gemini files do not give them); the read line says so on screen. Never served to clients.
const z = { deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 };
exports.meals = {
  status: "ok",
  read: "Layout sample from your Gemini file, not AI output. Item grams are placeholders.",
  meals: [
    { title: "Charred Pahadi Paneer Tikka & Foxtail Millet Khichdi", subtitle: "With jakhiya seeds, sauteed palak and a walnut-mint chutney", cuisine: "North Indian mountain", prepMinutes: 18,
      items: [{ food: "Paneer tikka, charred", grams: 150, group: "protein" }, { food: "Foxtail millet khichdi", grams: 200, group: "carbs" },
              { food: "Sauteed palak with garlic", grams: 120, group: "greens" }, { food: "Walnut-mint chutney", grams: 30, group: "fats" }],
      kcal: 560, protein: 38, carbs: 44, fats: 23, fiber: 14,
      why: [{ pair: "Turmeric + black pepper", effect: "Pepper helps the body take up the turmeric in the marinade." },
            { pair: "Foxtail millet + walnuts", effect: "A slow-digesting grain with walnut fats keeps you full for longer." }],
      swaps: { protein: [{ food: "Malai paneer tikka", grams: 150, ...z }, { food: "Tandoori chicken tikka", grams: 160, ...z, deltaKcal: -35, deltaProtein: 12 },
                         { food: "Sprouted moong and tofu bhurji", grams: 180, ...z, deltaKcal: -60, deltaProtein: -4 }],
               base: [{ food: "Foxtail millet khichdi", grams: 200, ...z }, { food: "Hand-pounded brown basmati", grams: 180, ...z, deltaFiber: -4 }, { food: "Cauliflower and green pea mash", grams: 200, ...z, deltaFiber: 1 }] },
      alchemy: {
        protein: { titleSuffix: "+ Hung-curd and hemp-seed crust", note: "Paneer marinated in thick hung curd, with 2 tablespoons of hemp seeds.", minutes: 18, deltaKcal: 80, deltaProtein: 15, deltaCarbs: 1, deltaFats: 2, deltaFiber: 2 },
        glucose: { titleSuffix: "(Sprouted moong and millet)", note: "More sprouted green moong in the khichdi, less millet, so the starch drops.", minutes: 20, deltaKcal: -45, deltaProtein: 4, deltaCarbs: -16, deltaFats: 0, deltaFiber: 6 },
        express: { titleSuffix: "(10-minute air-fryer bowl)", note: "Air-fried paneer cubes over quick pressure-cooked millet.", minutes: 10, deltaKcal: -30, deltaProtein: 0, deltaCarbs: 0, deltaFats: -3, deltaFiber: 0 },
        gut: { titleSuffix: "(Soft chhena, ginger and ajwain)", note: "Fresh soft chhena with roasted ajwain and grated ginger, milder on spice.", minutes: 18, deltaKcal: -25, deltaProtein: 0, deltaCarbs: -3, deltaFats: -2, deltaFiber: 2 } } },
    { title: "Smoky Kala Chana & Sweet Potato Chaat Bowl", subtitle: "Hung-curd drizzle, pomegranate and pumpkin seeds", cuisine: "Street-style Indian", prepMinutes: 12,
      items: [{ food: "Sprouted kala chana", grams: 150, group: "protein" }, { food: "Roasted sweet potato, cooled", grams: 150, group: "carbs" },
              { food: "Hung curd drizzle", grams: 60, group: "protein" }, { food: "Cucumber, onion and pomegranate", grams: 100, group: "greens" }, { food: "Pumpkin seeds", grams: 10, group: "fats" }],
      kcal: 490, protein: 28, carbs: 56, fats: 14, fiber: 16,
      why: [{ pair: "Cooled sweet potato + kala chana", effect: "Cooled potato and chana fibre digest slowly." }],
      swaps: { protein: [], base: [] }, alchemy: {} },
    { title: "10-Min Miso Glazed Tofu & Buckwheat Soba", subtitle: "Sesame, bok choy and a little chilli crisp", cuisine: "High-protein express", prepMinutes: 10,
      items: [{ food: "Firm tofu, miso glazed", grams: 150, group: "protein" }, { food: "Buckwheat soba", grams: 160, group: "carbs" }, { food: "Bok choy and edamame", grams: 120, group: "greens" }],
      kcal: 510, protein: 38, carbs: 51, fats: 16, fiber: 14, why: [], swaps: { protein: [], base: [] }, alchemy: {} },
  ],
};
exports.rescue = {
  status: "ok",
  dish: { name: "Andhra-style spicy mutton biryani", portion: "Full handi, as delivered", kcal: 1120, protein: 42, carbs: 118, fats: 52, fiber: 4,
    warning: "Heavy on rice and ghee", breakdown: "Layout sample from your Gemini file, not AI output. Polished rice and rendered fat make this a heavy plate." },
  hacks: [
    { title: "Eat a bowl of cucumber-pudina raita first", kind: "sequence", deltaKcal: 65, deltaProtein: 6, deltaCarbs: 4, deltaFats: 2, deltaFiber: 3 },
    { title: "Set aside a third of the rice, keep all the mutton", kind: "portion", deltaKcal: -310, deltaProtein: 0, deltaCarbs: -46, deltaFats: -11, deltaFiber: 0 },
    { title: "Pre-meal 5 g psyllium husk in lemon water", kind: "sequence", deltaKcal: 15, deltaProtein: 0, deltaCarbs: 1, deltaFats: 0, deltaFiber: 5 },
    { title: "A brisk 15-minute walk after the meal", kind: "move", deltaKcal: 0, deltaProtein: 0, deltaCarbs: 0, deltaFats: 0, deltaFiber: 0 },
  ],
};
exports.log = { status: "ok", title: "Aloo paratha with curd", items: [{ food: "Aloo paratha", grams: 240, group: "carbs" }, { food: "Curd", grams: 100, group: "protein" }],
  kcal: 640, protein: 17, carbs: 84, fats: 26, fiber: 8, assumed: "Layout sample, not AI output: 2 medium parathas and a small bowl of curd." };
