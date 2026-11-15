VERDICT: FAIL
BUILD: 4906250fb1c5e1c1bd477b841581bdcb75dd6b7d7bdd23e31fbb1f0111701487

Draft written during the audit; the final version replaces it.

## Findings
1. BLOCKER S1-S4: foods outside the word lists pass on every path. Dal makhani (dairy left out), Chole bhature (wheat left out), Machli fry (vegetarian), Alu posto (Jain), Avakaya (high BP), Burfi (diabetes). src/v5/core.js:79-87.
2. BLOCKER S7: typed disclosures miss common spellings. "I am breast feeding", "I am on haemodialysis", "I am a kidney patient". src/v6/engine.js:589.
3. MAJOR S9: no supplement test exists, and spirulina, Protinex, ashwagandha and iron pills pass. src/v5/core.js:89.
4. MAJOR S10: three cases in viewOf. src/v6/app.js:141-143.
5. MAJOR S8: a menu portion "1 bowl" shows with no grams. src/v6/engine.js:560.
