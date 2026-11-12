// Layout-check fixture for "Read the menu" (docs/FEATURE-menu.md). Not AI output and never served to clients.
// A North Indian restaurant menu as a person would type it, and a reply in the shape the engine asks Gemini for.
// The reply has eight dishes: two are non-veg, and "Tawa Sabzi" is not on the typed menu, so the checks have something to drop.
// Figures are placeholders that add up (kcal is close to 4 x protein + 4 x carbs + 9 x fats); they are not measured values.
exports.typed = [
  "STARTERS", "Paneer Tikka 320", "Chicken Tikka 360", "Hara Bhara Kabab 260",
  "MAINS", "Dal Tadka 240", "Dal Makhani 280", "Palak Paneer 300", "Kadai Paneer 310", "Malai Kofta 320", "Butter Chicken 380", "Mutton Rogan Josh 420", "Chole Bhature 220",
  "RICE AND BREADS", "Veg Biryani 280", "Jeera Rice 160", "Tandoori Roti 30", "Butter Naan 60",
  "SIDES", "Cucumber Raita 90", "Green Salad 80", "Gulab Jamun 90",
].join("\n");
const none = { with: "", with_kcal: 0, with_protein: 0, with_carbs: 0, with_fats: 0, with_fiber: 0 };
const roti1 = { with: "1 Tandoori Roti", with_kcal: 120, with_protein: 4, with_carbs: 22, with_fats: 2, with_fiber: 3 };
const roti2 = { with: "2 Tandoori Roti", with_kcal: 240, with_protein: 8, with_carbs: 44, with_fats: 4, with_fiber: 6 };
exports.reply = {
  status: "ok",
  place: "North Indian restaurant",
  dishes: [
    { as_written: "Paneer Tikka", portion: "6 pieces, about 180 g", kcal: 380, protein: 24, carbs: 10, fats: 27, fiber: 2, ask: "Go easy on the butter brushed on top", ...roti1 },
    { as_written: "Chicken Tikka", portion: "6 pieces, about 200 g", kcal: 320, protein: 42, carbs: 6, fats: 14, fiber: 1, ask: "No butter on top", ...roti2 },
    { as_written: "Dal Tadka", portion: "1 bowl, about 300 g", kcal: 280, protein: 15, carbs: 34, fats: 9, fiber: 9, ask: "Tadka in less ghee", ...roti2 },
    { as_written: "Palak Paneer", portion: "1 bowl, about 250 g", kcal: 340, protein: 17, carbs: 12, fats: 25, fiber: 5, ask: "No cream on top", ...roti2 },
    { as_written: "Butter Chicken", portion: "1 bowl, about 300 g", kcal: 520, protein: 32, carbs: 14, fats: 38, fiber: 2, ask: "", with: "1 Butter Naan", with_kcal: 260, with_protein: 7, with_carbs: 40, with_fats: 8, with_fiber: 2 },
    { as_written: "Chole Bhature", portion: "2 bhature with 1 bowl of chole", kcal: 820, protein: 22, carbs: 98, fats: 38, fiber: 14, ask: "One bhatura instead of two", ...none },
    { as_written: "Veg Biryani", portion: "1 plate, about 350 g", kcal: 520, protein: 12, carbs: 78, fats: 18, fiber: 6, ask: "Raita on the side", with: "1 Cucumber Raita", with_kcal: 90, with_protein: 4, with_carbs: 7, with_fats: 5, with_fiber: 1 },
    { as_written: "Tawa Sabzi", portion: "1 bowl, about 250 g", kcal: 220, protein: 6, carbs: 20, fats: 13, fiber: 7, ask: "", ...roti2 },
  ],
  leave: [
    { as_written: "Malai Kofta", why: "Fried koftas in a cream gravy, heavy for a dinner." },
    { as_written: "Mutton Rogan Josh", why: "Rich and oily, a lot to take on late in the day." },
    { as_written: "Gulab Jamun", why: "A fried sweet, better shared on another day." },
  ],
  tip: "Start with the green salad and the dal or paneer, and keep the roti for last.",
};
