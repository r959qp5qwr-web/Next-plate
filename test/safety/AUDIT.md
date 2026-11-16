VERDICT: FAIL
BUILD: ded556a7753f8c19c1137a03715f88c33c755b1c87c53b69050732501a11b0ae

Safety audit of ba4d8dc (branch claude/nice-hawking-307ljy), 16 Nov 2026, after the fix round 3cc3021..fd602ec. Whole tree, two tiers,
judged against docs/SAFETY-INVARIANTS.md with the owner's 16 Nov decisions (watch list for unknown count words; kidney: refer, as now; menu
names: remove counts, keep names; menu requests shown, marked conditional). About 2 hours of probing. The builder's summary, test counts and
mutation table were not taken on trust. The live model was not called.

Checks run. The build was run in a scratch copy of HEAD (`git archive`); the three pages it writes are byte-identical to the committed
ones. `npm run -s safety` (with the 41 Codex probes; 4 TRACKED lines) and `npm run -s rules`: pass. `npm run -s words`: pass (last
audit's c1 is closed). `node test/ux/review.js` was run this round (Playwright and Chromium were available): 50 safety states at 360 px,
light, dark and 130 % text, 150 checks, no violations at HEAD; then app mutants against their own states (see Regression).
The fingerprint was ded556a7753f8c19c1137a03715f88c33c755b1c87c53b69050732501a11b0ae at the start, mid-way and after all probing.

How each finding was reached: "engine-run" = a model reply through `plan(kind).check()` in Node on np-core from the built page
(hosted/v6/index.min.html); "app-run" = the app's own `viewOf`, `swapAt` and `plateWhy`, taken from `src/v6/app.js` and run in Node on
the engine's output; "review-run" = test/ux/review.js on a page built from a scratch copy; "mutation" = one line changed in a scratch
copy, rebuilt, and the checks run again. Every counter-example was also run on eddb00b (its page and app.js) to say whether it is new.

1 BLOCKER, 2 MAJOR, 1 MINOR, 4 COSMETIC, a BACKLOG note, and owner questions.

## BLOCKER

**B1. S7 (tier 1, a typed disclosure): "gurday", the common Roman spelling of gurde (Urdu and Punjabi; plural of gurda), is not
referred by the code net on any of the four text paths, so it goes to the model and a plate can be shown (engine-run). Carried from
eddb00b, not new.**
- `REFERTXT` (src/v6/engine.js:692) reads gurda as `gurd(?:a{1,2}|e|ey|o|on)\b`; "gurday" fails the word boundary after "gurda".
- Not referred, on ask, Rescue, menu and log alike (each run on all four): "Gurday kharab hain", "mere gurday weak hain", "Gurday ki
  bimari hai", "Mere gurday kharab hain, dinner mein kya khaun?".
- The chain to a shown plate: `plan('meals', {ctx: {text: 'Mere gurday kharab hain, dinner mein kya khaun?'}})` sends the text to the
  model; a reply with refer_reason "none" and an honest plate is shown ("Moong dal with jowar roti"). Only the model's own refer_reason
  stands between the disclosure and a plate, as in last round's B1.
- S7 now says "gurda in every form (gurda, gurde, gurdey, gurdo, gurdon) on its own". The held-out referral list in
  test/safety/lexicon.json has no "gurday", so no test can see it.
- How I graded it, so the owner can overrule: a typed word that S7 itself names as a kidney word (kidney and its forms, gurda in every
  form) and that the code net misses is a BLOCKER, as B1 was last round; a further misspelling is MINOR, as m2 was (see m1 below). If the
  owner reads "every form" as the five spellings listed, this moves to m1.
- Smallest fix: add the forms to the one clause, keeping "gurdwara" out: `gurd(?:a{1,2}|aa?y|ai|e|ey|ein|o|on)\b`. Add "gurday" phrasings to
  the held-out list.

## MAJOR

**M1. S8 (tier 1: Hindi number words, English "half", "quarter" and "one", and katori are all named by S8 or kept tier 1 by the owner):
a count or a measure written in words still shows in a name when the word after it is not in the engine's own lists, on every name path
(engine-run). Carried from eddb00b, not new. The S8 word-count test cannot fail on these cases.**
- `CNTQTY` (src/v5/core.js:585) takes a Hindi number, "half" or "quarter" off only before a measure word in `CNTMEAS` (core.js:565) or a
  piece word in `CNTPIECE` (core.js:566); the katori check is `\bkatoris?\b` (core.js:632, 774 and `countIn`, core.js:636). Shown as
  written, on a plate item:
  - on a typed menu, a measure in words before kg, kilo or litre (S8 lists "1 Kg" as a measure that goes): the menu lines "Chicken Biryani
    Half Kg 450", "Hyderabadi Biryani Quarter Kg 250", "Sweet Lassi Half Litre 90", "Chicken Biryani Ek Kilo 800" and "Mutton Biryani
    (Half Kg) 450" show as orders and "leave" entries with the measure as printed. The model copies as_written letter for letter from the
    menu, so this needs no slip by the model, only a biryani shop's ordinary menu. On a plate, "One kg biryani" shows "Kg biryani";
  - katori in its Hindi plural, which S8 names outright: "Katoriyan dal", "Do katoriyan dal", and in a kept bracket "Dal (do katoriyan)";
    also "Katoree dal" (a menu line "Katoriyan Dal 90" shows as printed too);
  - Hindi plurals of piece words the list holds only in English form: "Do parathe", "Teen parathe", "Do samose", "Do pakode",
    "Do bhature", "Chole with do bhature", "Do kulche", "Do vade", "Teen dose", "Do idliyan", "Do kachoriyan", "Teen pakodi",
    "Paanch golgappe";
  - piece words not in the list: "Do luchi", "Char luchis", "Teen litti", "Do bati", "Do baati";
  - Hindi measure words: "Ek chammach ghee", "Do chammach ghee", "Ek mutthi chana", "Do karchhi dal"; Marathi "Ek vati varan";
  - the joining word "ki", which `CNTSKIP` (core.js:568) will not step over: "Do makki ki roti", "Do bajre ki roti";
  - Hindi number spellings the list lacks: "Dus roti", "Gyarah idli", "Barah puri";
  - a lone Hindi number in a short bracket: "Idli (Do)".
- The same names show as a protein swap ("Teen samose"), a grain swap ("Do bajre ki roti", "Do parathe"), the food a one-tap change adds,
  with its note ("Add 5 g ek chammach ghee. About 45 kcal more."), a menu order ("Do Parathe Thali") and a "leave" entry ("Do Parathe
  Thali", "Katoriyan Dal", "Chicken Biryani Half Kg"). The plate title
  and subtitle are written from the items, so they carry them too.
- How often: no file under eval/ (model names and typed menus) holds a Hindi number before these words, a katori plural, or half, quarter or
  ek before kg, kilo or litre (searched with grep). None needs a reply built to break a filter: each is how a Hindi-speaking client or a
  printed menu writes a portion. Every case above was also run on eddb00b, with the same result.
- The test cannot fail: the Hindi part of `COUNTWORDS` (test/safety/check.js:334) recognises only nouns from the engine's own piece list,
  and its comment calls "kozhukattais" and "pathiris" nouns the engine does not list, though `CNTPIECE` now holds both. I added "Do
  parathe", "Ek chammach ghee", "Do samose" and "Teen litti" to `COUNTEDW` in a scratch copy of check.js: it still passes at HEAD, with all
  four shown.
- Smallest fix: in the count rule, let a Hindi number, "half" and "quarter" take off the word after it when that word is a measure
  (add kg, kilo, litre, chammach, mutthi, karchhi, vati and katori with its plurals), and add the Hindi plurals and the missing piece words
  to `CNTPIECE`, with dus, gyarah and barah to the numbers; read katori as `katori\w*|katoree`. Then make the test's detector its own: any
  Hindi number word followed by any word is flagged, with the honest names ("Paneer do pyaza", "Panch phoron dal") as its listed
  exceptions, so a word the engine does not list fails the test.
- Owner question kept apart from this finding: S8's letter keeps a Hindi number before a nut or a fruit ("Char badam", "Paanch badam",
  "Das kaju", "Do kela", "Ek seb", "Teen khajoor"), while "Fifteen almonds" goes.

**M2. S10 (tier 1 by the letter, see the note): when the grain is named by a short form of its item ("Rice" for "Jeera rice"), the plate
now has no declared grain, and a one-tap change whose figures shrink the grain is still offered; the grams shown and the figures logged
then describe different plates (app-run on engine output). New with the M3 fix (b19d542); the no-grain form of it is carried.**
- `declaredGrain` (src/v5/core.js:495) now finds the grain item by its whole name only (`sameName`, core.js:494). With items "Rajma",
  "Jeera rice" and grain food "Rice", no item matches, so `grain.food` is "" and nothing ties a change's `grain_grams_after` to the rice.
- Non-diabetic, lunch. A "gentler on sugar" change: add 80 g sauteed beans, rice to 150 g, 120 kcal and 30 g carbs less. Tap it: shown
  and logged 150 g Rajma, 200 g Jeera rice, 120 g Cucumber salad, 580 kcal; the note reads "Add 80 g sauteed beans. About 120 kcal
  less." The rice is not cut, yet the energy falls by 120 kcal. On eddb00b the same reply showed "Jeera rice goes to 150 g" with 150 g
  of rice on the list.
- The same happens on both builds when the model gives grain food "" and a change that shrinks a carbohydrate item.
- With diabetes such a plate is dropped at breakfast, lunch and dinner (no declared grain), so S5 holds; the case is for clients without
  diabetes.
- Tier note for the owner: it needs a grain name not copied letter for letter (0 of 1,170 recorded grain names; the prompt asks for a copy)
  or a no-grain plate with a grain-shrinking change (0 of 132 recorded no-grain plates). It is not a reply built to break a filter, so by
  the letter of the tiers it is tier 1, graded as last round's M3 was.
- Smallest fix: in `declaredGrain` keep the whole-name match first, then accept the one item whose name holds the grain name as whole
  words ("Jeera rice" holds "Rice"); and when no grain is declared, do not offer a change whose `grain_grams_after` is above 0
  (core.js:766).

## MINOR

- m1. S7 phrasings the code net sends to the model, all carried from eddb00b (the model is told to refer them; a missing or odd
  refer_reason fails closed, checked for 19 values on all four paths): misspellings "kedney", "kidaney", "kiney", "kdney", "gurdein",
  "guurda", "gurdy"; "CKD3" (no word boundary after "ckd"; "ckd-3" and "stage 3 CKD" refer) and "creat 2.1"; pregnancy "prego",
  "preggy", "baccha hone wala hai" ("bacha" and "bachcha" refer), "7th month chal raha hai", "delivery due next month", "due in March",
  "BF mom", "TTC", "baby bump", "mommy to be" ("mom-to-be" refers), "jachcha", "jaccha".
## Owner questions (named here, not graded)

- Menu numbers at the end of a name stay (the open question the owner holds): "Tandoori Roti 2", "Gulab Jamun 2", "Pani Puri 6",
  "Golgappe 6", "Garlic Naan 2", "Neer Dosa 3", "Ragi Mudde 2", "Thali for 2", "Roti Sabzi 1" ("Roti 2 Sabzi 1").
- Size words with no number: "Full plate thali", "Biryani Full Plate" and "Biryani Half" show as written, while "Half plate biryani" and
  "Biryani Half Plate" show "Biryani". "Double egg omelette" and "Triple egg omelette" show as written; "Single egg omelette" and
  "Two-egg omelette" show "Egg omelette".
- A Hindi number before a nut or a fruit (M1, last point).
- Still open from earlier audits, for the owner or a clinician; results on this build only:
  - Urgent symptom scope: "my sugar is 55", "sugar 60 hai", "blood sugar 400", "chest is tight", "numbness in left arm", "ghabrahat ho
    rahi hai" and "I feel very weak and shaky" (insulin in the client's answers, not in the text) go to the model. A model referral with
    refer_reason "other_urgent" shows the referral with no line to get help now.
  - Carbohydrate floors: the Codex probe still prints "a medicines plate with 1 g of carbohydrate: ok" as TRACKED.
  - Postpartum: "I just had a baby" and "I delivered last month" go to the model ("postpartum", "c-section 2 weeks ago" and "new mom"
    refer).
  - Potassium: "high potassium", "potassium high hai" and "my potassium is high" go to the model.

## COSMETIC

- c1. eval/usefulness/names-diff.txt still states its baseline as 6b5e18d. I ran its script with the baseline set to eddb00b, writing to
  scratch: 0 of the 3,452 recorded names change from eddb00b to ba4d8dc; with 6b5e18d it gives the same 21 lines as the committed file.
- c2. Name shapes from the menu position rule and the count words (none hides a food; the accepted costs aside): "Chicken 65 Half" shows
  "Chicken Half", "Chicken Biryani Half 160 Full 280" shows "Chicken Biryani Half Full", "Combo for Two" shows "Combo for", "3 In 1 Rice"
  shows "In Rice", "7 Up" shows "Up", "Sev Puri 1 Plt" shows "Sev Puri Plt", "Chole Bhature 2 Bhature" shows "Chole Bhature Bhature", "Two
  or three rotis" shows "Or rotis", "Ten-minute poha" shows "Minute poha".
- c3. The invariants table lists S8 as a check on the log title and items, with "Your meal" as the fallback, but the title is the client's
  typed text shown as typed ("2 rotis and 1 katori dal") and an item may be "katori dal" when every word was typed. The model's own
  "assumed" line is not shown (tested). The record should say the client's own words are exempt, or the code should leave out a log
  item named with katori.
- c4. This file replaces the audit of eddb00b.

## Last audit's findings, checked again on this build

| Last audit | Fix | Result on ba4d8dc |
|---|---|---|
| B1 kidney dish rewrite hid disclosures | 3cc3021, fd602ec | Closed. `KIDNEYDISH` is gone; 53 of my 55 must-refer phrasings refer (the two left are potassium, an owner question); all 8 routed phrasings refer before the model on all four paths (32 of 32; eddb00b 0 of 32). Kidney beans and rajma are not referred; kidney and gurda dishes refer, the owner's accepted cost. Mutations P3, P4, P16 fail `safety`. Carried gap: B1 above. |
| M1 menu digit counts | 2050f6d, 603f99d, 5801f1a | Closed under the owner's rule. 53 menu lines: a digit in the order name 26 on eddb00b, 10 now, all at the end of a name or "Chicken 65"-type names. 18 lines with units: 6 kept a unit, 1 now ("Half Kg", M1 above). Mutations P7, P8, P17 fail `safety`. |
| M2 brackets, numbers above twelve, other-language counts | 23e7a30, 507892f, 84c3a38 | Closed for brackets and English numbers: 11 of my 13 bracket and large-number names showed a count, 1 now ("Double egg omelette", an owner question); the bracket is taken off on all 5 other paths. "Rendu idli", "Don chapati", "Duto ruti" and the like are on the owner's watch list (tier 2). Hindi forms remain: M1 above. Mutations P5, P6, P9, P10, P11, P13, P15 fail `safety`. |
| M3 grain matched by substring | b19d542 | Closed: on the four part-name plates the grain swap lands on the grain item (eddb00b: on the earlier item); 452 recorded plates re-checked, 0 swaps on another item. Mutations P1, P2, P14 fail `safety`. Side effect: M2 above. |
| m1 composedWhy S5/S6 rest on review states | 6b4e96f | Closed: removing the S6 or the S5 clause of `composedWhy` (A2, A3) now fails `safety`; review-run, A2 fails `plate-random-combos-3` and A3 fails `plate-random-combos`, `-2` and `rescue-two-moves-grain`. |
| m2 kidney misspellings and gurdon | ebd2cac, fd602ec | Closed for the forms named ("kidni", "kindey", "kidneyy", "kidnies", "gurdon", "gurde"); others in m1 and B1 above. |
| m3 app states rest on review.js | 6b4e96f | Closed: A5, A7, A9, A10 and A11 now fail `safety`; review-run, each also fails its own state (A5 `plate-overnight-first-tap` and `-first-change`; A7 `rescue-health-changed`; A9 `rescue-two-moves-grain`; A10 `plate-tune-stale`; A11 `rescue-after-midnight`, `menu-after-midnight`). |
| m4 app text rests on review.js | 6b4e96f | Closed: N10, N12, N13, N16 and the new P12 (condition off the "Also on this menu" rows) fail `safety`; review-run, each fails its own state (`rescue-menu-request`, `sheet-log-urgent`, `plate-` and `menu-planned-diabetes`, the three urgent states). |
| m5 menu name shape unexercised | none | Closed: N7 (a menu name may open with a number) now fails `safety`. |
| c1 banned words in CRITIC.md | Critic's file | Closed: `words` passes. |
| c2 honest names changed by the count rule | 507892f | Part closed: "Chicken sixty five" stays; "Sixty five chicken" shows "Chicken". Others in c2 above. |
| c3 kidney dish over-referral | owner, 16 Nov | Accepted by the owner ("Refer, as now"); not a finding. |
| c4 record | | Replaced. |

## BACKLOG (tier 2; does not fail the audit)

- Word lists, with a wrong but non-empty tag ("plain"): of 37 words new to my lists this round, 17 have a form that passes under the
  profile that bars it: dalcha, chukka, laal maas, kakori, erachi, pandi, kebab, tikka (meat; the last two also name paneer dishes),
  kalamari, bhurji and dim (egg), mattha and mor (dairy for a vegan), bati and khari (wheat), gajak (sweet), multivitamins. My older list
  is unchanged: 94 of 389 words have such a form, as on eddb00b.
- Counts in other Indian languages ("Rendu idli", "Moonu dosa", "Randu dosa", "Don chapati", "Be rotli", "Duto ruti", "Dui ta luchi") show
  as written; the owner put them on the watch list (16 Nov). None is in the recorded names.

## Regression: my earlier probes, eddb00b against ba4d8dc

The scripts from the last two audits (scratchpad audit5/probes/, which holds the audit4 scripts and the mutation sets) were copied to
audit6/probes/ and run on the eddb00b page and app.js (`git show eddb00b:...`) and on this build in the same way. Two needed a harness
change: replay.js now finds the recorded replies inside every file under eval/ (replay2.js), and dgscan.js defines the old `sameFood` for
its own count (dgscan2.js).

| Probe | eddb00b | ba4d8dc |
|---|---|---|
| h.js (loads np-core from the built page) | loads | loads |
| tags.js: 7 tag shapes on 7 surfaces for a vegan | 49 cases, 0 shown; controls 7 of 7 shown | the same |
| replay2.js: 185 recorded replies from the 46 files under eval/ that hold a raw reply, and the window sample | 254 plates and 40 orders shown; 0 counter-examples (the known hits: "slices" read as a unit, "jowar roti" read as wheat by my own list, a request line naming the ghee it takes out, the nothing-fits line) | the same counts and the same hits |
| lexsweep.js: 389 words in 5 forms, 1,945 items tagged "plain" | 430 shown, 94 words with a gap | the same |
| kid.js: 55 phrasings that must refer, 27 kidney foods and dishes | 35 of 55 referred; 24 of 27 foods not referred | 53 of 55 referred (the 2 left: potassium); 10 of 27 not referred (the 17 kidney and gurda dishes refer, the owner's choice) |
| kidroute.js: 8 phrasings on 4 paths | 0 of 32 referred before the model | 32 of 32 |
| brk.js: 13 bracket and large-number names | 12 show a count word (11, plus "Double egg omelette") | 1 ("Double egg omelette", an owner question, on both builds) |
| brk2.js: a count bracket on menu dish, leave entry, grain and reason line, both swaps, one-tap change | kept on all 5 paths | taken off on all 5 |
| names.js: 63 honest names and 85 counted names, plate and menu forms | "Fifteen almonds", "Glass of buttermilk", "Bowl of curd", "Plate of poha" and the like show; "A bowl of dal" dropped | taken off; "Chicken sixty five" stays; the 7 other-language counts show (watch list) |
| menunames.js: 53 typed menu lines | 26 order names with a digit | 10, each at the end of the name: "Chicken 65", "Gobi 65", "Paneer 65", "Chicken 555", and "Tandoori Roti 2", "Roti Sabzi 1", "Dal Rice Roti 3", "Boiled Eggs 2", "Chicken Leg Piece 1", "Rasgulla 2" (the owner's open question) |
| menu2.js: 18 menu lines with units | 6 kept a unit (and "Chicken 65 Half", "Chicken 65 Full" kept their 65) | 1 kept a unit ("Chicken Biryani Half Kg", M1); "Chicken 65 Half" shows "Chicken Half" (c2) |
| meds.js: 64 S6 cases (plate, swap, change, Rescue) | 0 failures | 0 failures |
| s10.js: the khichdi plate, swaps and change | as last round | the same |
| s10b.js: protein swap on a plate whose grain item is its first protein item (9 profiles, 4 meals, 5 shapes); grain swap on 4 part-name plates | 0 offered on a declared grain item; the grain swap lands on the earlier item (last round's M3) | 0 offered on a declared grain item (44 offers, all on plates where the short grain name no longer declares a grain, so no base swap shares the item); the grain swap lands on the grain item; with diabetes the 4 plates are dropped |
| dgscan2.js: 452 recorded plates with a declared grain | 0 swaps on another item | 0 |
| gfscan.js: recorded grain names equal to an item name | 1,170 of 1,170 | the same (the data, not the build) |
| names-diff script, baseline set to eddb00b, output to scratch | | 0 of 3,452 recorded names change |
| refer.js (new): 109 kidney and pregnancy phrasings on 4 paths | 61 referred | 77 referred (16 more: gurda forms and dishes, "kidneyfriendly", 7 misspellings of kidney) |
| cnt.js (new): 91 count names, plate and menu | Hindi forms shown (M1) | the same Hindi forms shown; "Do rotiyan", "Roti (two)" and the like now cleaned |

Mutations. eddb00b column: last round's record (scratchpad audit5/mut-new.out, mut-new4.out). ba4d8dc column: run this round in scratch
copies (one line changed, rebuilt, `safety`, the Codex probes and `rules` run).

| Set | eddb00b | ba4d8dc |
|---|---|---|
| muts1.js (30 engine mutations) | 3 survive (M18, M20, M21) | 0 of 28 survive; M18, M20, M21 now fail `safety`. M13, M14 no longer apply (stand-ins P14, P13) |
| muts2.js (14 app mutations) | 7 survive (A2, A3, A5, A7, A9, A10, A11) | 0 of 13 survive (A14 no longer applies) |
| muts3.js (3) | 0 survive | 0 survive |
| muts4.js (17) | 7 survive (N7, N10, N11, N12, N13, N16, N17) | 0 of 10 survive; N1, N3, N4, N5, N9, N11, N17 no longer apply (N4 and N5 because `KIDNEYDISH` is gone; stand-ins for the others: P14, P13, P7, P12, P15) |
| muts5.js (17, new: one per fix of this round) | | 0 survive (P1 to P17) |
| review-run: 12 app mutants (A2, A3, A5, A7, A9, A10, A11, N10, N12, N13, N16, P12), each against its own states | not run | 12 of 12 caught, each by its own state's assertion (harness proved first on N12 with `sheet-log-urgent`) |

## Probed

- S7: 109 typed phrasings of my own (63 kidney and gurda, with kidney-bean and rajma controls; 46 pregnancy, breastfeeding and postpartum), each on ask, Rescue, menu and log (436 routes), on both builds; 19 refer_reason values on 4 paths (76); 6 typed menus with
  kidney, gurda, bheja and rajma lines; 3 gurday phrasings carried to a shown plate; 17 urgent and open-scope phrasings. Result: B1, m1.
- S8: 91 count names of my own and 38 more Hindi and measure forms, plate and menu (258 calls), on both builds; 125 typed menu lines as
  orders, and 7 more lines as orders and "leave" entries; 5 "Half Kg" menu lines; Hindi counts on the grain, both swaps, a one-tap change
  and a menu order; 4 Hindi cases added to
  a scratch copy of the S8 test. Result: M1, owner questions, c2.
- S6: 768 cases: medicines yes and not sure, 4 meals, appetite 1 and 10, with and without body figures, a day with 3,200 kcal already
  eaten and none, the hour 0, 3 and 23; the prompt's floor line, a plate 30 kcal under the usual size and one at it, a menu order under it
  with a control order 20 kcal over it (the control shown in all 192 menu cases). 0 failures. Plus the 64 cases of meds.js.
- S5: 24 base swaps, one per reply after the current grain, and 4 one-tap changes, on a diabetic plate at breakfast, lunch and dinner.
  Offered: ragi, bajra, brown rice, kodo, oats, quinoa, rajgira, kuttu, poha, daliya, jowar (the engine reads quinoa, rajgira and kuttu
  as grains by design). Not offered: cauliflower rice, moong dal and besan chilla, sweet potato, sabudana, makhana, singhara, shirataki,
  lettuce, paneer, soya and almond flour rotis, sattu paratha. A change that keeps the grain or half of it is offered; one that leaves
  30 g or takes the grain off is not. 0 counter-examples.
- S10: swaps and changes on 4 plates whose grain name is a short form or empty, 6 tap combinations each, on both builds. Result: M2.
- S1-S4, S9 tags and word lists: the tag shapes, the 185 replayed replies, 1,945 forms of my older list and 222 forms of 37 new words
  (backlog).
- App logic in the browser: 50 safety states at HEAD (150 checks) and 12 mutants against their own states.
- Recorded data: 3,452 model names (names diff), 1,302 raw plates (grain names, no-grain plates with grain-shrinking changes), 452
  declared-grain plates.
- Read: `REFERTXT`, `referTyped`, `urgentTyped`, the `plan` entry and `readCtx`; `showName`, `countIn`, `cntOff`, the count expressions,
  `MENUCOUNT`, `menuPrice`; `sameName`, `declaredGrain`, `checkMeal`'s swaps and changes, `changeNote`; `checkLog`; `checkMenu`'s condition
  lines; app.js `swapAt`, `plateWhy`, `orderView` rows, `renderSheet` (log), `stepRatio`, `renderBuild`; src/v5/server.ts (unchanged since
  eddb00b; text goes to `plan` unchanged); the S7 and S8 tests in test/safety/check.js and lexicon.json.

## Not inspected

- The live model, the Railway service and the server's security items.
- Photos (menu, Rescue, log), the v5 screens, and the full review set (only the 50 safety states at 360 px were run at HEAD).
- The Critic's screens: a screen reviewer works on test/ux/CRITIC.md at the same time.
- The urgent phrasing sweep and the S10 property sweep of earlier rounds were not rerun in full.
- src/v6/params.js, src/v6/plate.js and the figures in handoff-next-plate.md were not opened this round (unchanged since eddb00b; this
  round changed core.js, engine.js, the two app.js files and legible.css under src/). No clinical figure is judged here.
