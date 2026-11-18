// The request bodies the app sends, in one place, so the sample-window runner (eval/v6/run.js), the schema snapshot test
// (test/safety/schemas.js) and the app agree on what a request holds (fix-r17: the 18 Nov live check found that the runner and the app
// had no shared definition, and that no check read what the live model does with the schemas the bodies produce).
//   base       the profile and context the recorded scenarios start from (a scenario's "p" and "c" are laid over them)
//   body(s)    the body of a scenario's first request, as src/v6/app.js sends it to /api/meals, /api/rescue or /api/log (without the key)
//   tuneBody   the body of the follow-up src/v6/app.js sends to /api/tune for a plate it was served: the profile, the slot, and the plate
//              with its tags (items with their own tags, the grain, contains), its figures and the empty "why"; it holds no ctx and no file
const baseP = { goal: 'hold', focus: 'none', diet: 'veg', health: 'none', region: 'n', leave: [], sex: 'f', age: 46, cm: 158, kg: 68, act: 'low' };
const baseC = { lite: true, meal: 'lunch', time: '1:10 pm', mode: 'desk', mood: 'best', cuisine: 'indian', prep: 'home', oil: 'min', appetite: 5 };
const body = s => ({ profile: Object.assign({}, baseP, s.p), ctx: Object.assign({}, baseC, s.c), file: s.file || {} });
const tuneBody = (profile, slot, m) => ({ profile, slot, meal: { title: m.title, subtitle: m.subtitle, cuisine: m.cuisine, prepMinutes: m.minutes, minutes: m.minutes, items: m.items, grain: m.grain, contains: m.contains, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fats: m.fats, fiber: m.fiber, why: [] } });
module.exports = { baseP, baseC, body, tuneBody };
