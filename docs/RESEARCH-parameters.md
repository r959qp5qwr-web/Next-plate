# Section 13 research: what the numbers depend on

**Date:** 2026-11-12. **Question from the owner:** "Do the numbers depend on something? What about current age, weight, height, other context?"

**Short answer: yes, on almost everything.** No single calorie, protein or deficit number is right for all clients. Each target depends on sex, age, height, weight, BMI band (with Indian cut-offs), goal, activity, and for people with diabetes, on their medicine. The app now computes each target from those inputs (`src/v6/params.js`) and shows the person the reasoning ("How these numbers are worked out").

**How to read this.** Every figure below carries a source tag (S1 to S42, listed at the end). Sources were opened during this session's research pass. Tags: *FT* full text read, *ABS* abstract only, *FX* seen only through a page summariser (lower confidence). "Engine convention" means no guideline number was found and the value is a design choice you can change. "Not verified" items are listed in §6.

**Two of my earlier placeholders were wrong, and the research corrected them:**
1. **Activity factor 1.2 for "mostly sitting" runs about 10 % under India's own standard.** ICMR-NIN uses BMR × 1.40 for sedentary adults [S1]. Stacking a deficit on an under-estimate would have cut clients harder than intended.
2. **Protein 0.83 g/kg assumes high-quality protein.** For the cereal-based diets most Indians eat, ICMR-NIN's own figure is 1.0 g/kg [S1], and it rises with age over 65, with weight loss and with strength training.

---

## 1. What each number depends on, and what the app now does

| Number | Depends on | What the evidence says | What the app does | Kind |
|---|---|---|---|---|
| **Maintenance energy** | sex, age, height, weight, activity | ICMR-NIN: energy = BMR × activity level; sedentary 1.40 on an Indian-adjusted BMR; 30 kcal/kg (women), 32 kcal/kg (men) at reference weights [S1]. Standard BMR equations over-estimate Indians by 10 to 12 % [S1, S2]. Measured activity level in sedentary young Indian men: 1.35 [S3 ABS]. Mifflin-St Jeor is the most reliable general equation, within 10 % for most people, less accurate with obesity [S5, S6, S7 ABS]. No validation of Mifflin in Indian adults was found. | Mifflin-St Jeor × **1.3** (sitting), 1.4 (light), 1.55 (exercise 3 to 5 days), 1.725 (hard training). 1.3 lands within about 0 to 7 % of ICMR-NIN's sedentary figure for reference adults (my arithmetic). Told to the person as an estimate that "can be off by a tenth or more". | 1.3 and 1.4: derived from S1 and S3. 1.55 and 1.725: common convention, origin not verified. |
| **Is weight loss applied at all?** | BMI (Indian cut-offs), age, diabetes medicine | Overweight from BMI 23 for Asian Indians [S10 ABS, S11, S12]. Obesity from 25 [S11, S13] or from 27.5 [S12, S14]. Over 65: "in overweight older persons weight-reducing diets shall be avoided"; in obese older persons only after individual weighing of risks [S9]. On insulin or sulfonylureas, eating less raises the risk of low blood sugar and needs monitoring [S8, S19, S28]. | Goal "lose" is honoured only when **BMI ≥ 23, age under 65, and not on insulin or sulfonylurea tablets** (the app now asks this once when diabetes is set). Otherwise plates hold steady, protein is raised where relevant, and the person is told why. | Guideline-based gates |
| **Deficit size** | BMI band, maintenance | India: typically 500 kcal/day, never beyond 40 % of needs; about half a kilo a week "is considered to be safe" [S12]; 500 kcal [S13]; change of no more than 500 kcal [S8]. Overweight (not obese): 300 to 500 kcal [S16]. Options of 500, 750 or 30 % [S17]. | **300 kcal/day at BMI 23 to 27.4; 500 kcal/day at BMI 27.5 and above; never more than 30 % under maintenance.** | Guideline values; the 27.5 split and the 30 % cap are the conservative choices among them |
| **Lowest daily energy** | sex | Not under 1000 kcal [S12]. Prescription ranges 1200 to 1500 (women), 1500 to 1800 (men); under 800 only with medical supervision [S17, S16, S14]. | **Floor 1200 kcal (women), 1500 kcal (men).** | Lower ends of S17's ranges, above ICMR-NIN's 1000 |
| **Protein per day** | weight, age, goal, training, diabetes | Adult RDA 0.83 g/kg; 1.0 g/kg on cereal-based diets [S1]. Age 65 and over: 1.0 to 1.2, at least 1.2 if active [S20 ABS, S21 FT, S9]. During weight loss: 1.2 to 1.6 [S22 ABS]; at least 1.0 g/kg keeps more lean mass after 50 [S23 ABS]. With resistance training: 1.4 to 2.0, no added gain beyond about 1.6 [S25, S26 ABS]. Type 2 diabetes: typically 1 to 1.5 g/kg [S19 FT]. | **1.0 base; 1.0 to 1.2 from 65; 1.2 when losing weight; 1.4 when building strength; capped at 1.6 (1.5 with diabetes) and at 30 % of the day's energy.** | Guideline values (S22, S25 are from a sports-nutrition society with industry ties) |
| **Which weight protein is counted on** | BMI | No guidance for general adults was found. India's diabetes guideline uses ideal body weight [S8]. | Above BMI 25, protein is counted on **the weight at BMI 25 for the person's height**, so a 90 kg client is not handed a 110 g target. | **Engine convention** |
| **Protein per meal** | weight, age | Older adults need about 0.40 g/kg per meal, younger about 0.24 [S29 ABS]. Even spread over three meals gave 25 % higher muscle protein synthesis than a dinner-heavy pattern, in 8 people [S31 ABS]. Total matters more than distribution [S22]. Upper useful figure about 0.55 g/kg per meal [S30 ABS]. | Protein split **31 / 32 / 6 / 31 %** (breakfast / lunch / snack / dinner); catch-up capped at 0.55 g/kg in one meal. | Evidence is small-sample; split is an engine choice |
| **Energy per meal** | usual pattern | ICMR-NIN's sample day is about 27 / 43 / 28 % with a small evening drink [S12]. Earlier-in-the-day eating helps weight a little; the effect is "small and of uncertain clinical importance" [S34, S35 ABS; S36 FT]. | Energy split **27 / 40 / 5 / 28 %**. | From S12, with 3 points moved to a snack |
| **Late dinner** | bedtime | Late dinner (22:00 vs 18:00) worsened night-time glucose [S37 ABS]. Leave 2 to 3 hours before bed [S38 FT]; at least 1 to 2 hours [S28]. | Dinner within **2 hours of bedtime** counts as late; bedtime is assumed 11:30 pm until the app asks. | Guideline gap; assumed bedtime is a placeholder |
| **Fibre** | energy, diabetes | About 30 g per 2000 kcal [S2]. Diabetes: 40 g per 2000 kcal [S8]; 25 to 40 g/day [S28]. | **15 g per 1000 kcal; with diabetes 20 g per 1000 kcal, kept between 25 and 40 g.** | Guideline values |
| **Carbohydrate floor** | diabetes medicine | At least 100 to 130 g carbohydrate a day [S2]. Fixed insulin doses call for "consistent carbohydrate intake" [S19]. | With diabetes the plate must list an actual grain (checked in code). On insulin or sulfonylureas, Gemini is told to keep the grain portion steady. | Guideline-based rule |
| **Salt** | high BP, diabetes | Under 5 g salt a day [S39, S2, S12]; with hypertension and diabetes under 3 g [S8] or 1500 mg sodium [S28]. | No salt number is shown (the app cannot measure salt). High BP removes pickle, papad, namkeen and added salt. | Rule, not a number |
| **Water** | body size, heat, activity | About 2 litres, roughly 8 glasses, including beverages [S12]. | 8 glasses, for the rhythm strip in Phase 3. | Guideline value |

## 2. Flags (set now, used when weekly weights arrive in Phase 4)

| Flag | Trigger | Basis |
|---|---|---|
| Low intake | a fully logged day under **1000 kcal** | S12; S9 for older adults |
| Too-fast loss | more than **1 kg a week** on two weekly weights in a row | upper end of 0.5 to 1 kg/week guidance [S12, S18, S9]. No guideline gives a "seek review" number; this threshold is an engine rule built on that range. |
| Unintended loss | **5 % of body weight** in 6 to 12 months when the goal is not weight loss | S41 (written for older adults) |
| Skipped meal on insulin or sulfonylureas | every time | S8, S28: caution shown at once |

## 3. Worked examples (from the engine as built)

| Person | Goal | Result | Why |
|---|---|---|---|
| Woman, 47, 158 cm, 72 kg, sitting | lose | 1200 kcal, 75 g protein, 18 g fibre | BMI 28.8: 500 kcal under a 1700 maintenance, held at the 1200 floor; protein 1.2 g/kg on 62 kg |
| Woman, 47, 158 cm, 60 kg, sitting | lose | 1250 kcal, 72 g protein | BMI 24.0: 300 kcal under 1550 |
| Woman, 34, 160 cm, 55 kg, sitting | lose | 1580 kcal, 55 g protein | BMI 21.5 is healthy: no deficit, and the app says so |
| Man, 52, 172 cm, 86 kg, diabetes on a sulfonylurea | lose | 2180 kcal, 74 g protein, 40 g fibre | no deficit until the doctor adjusts the plan; steady grain at each meal |
| Man, 68, 168 cm, 78 kg | lose | 1940 kcal, 85 g protein | over 65: weight held, protein raised to 1.2 g/kg |
| Man, 41, 172 cm, 74 kg, exercises 3 to 5 days | build | 2500 kcal, 104 g protein | maintenance × 1.55; protein 1.4 g/kg |

## 4. Your decisions (each has a working default; change any)

1. **The 1200 kcal floor for women.** It is the standard clinical lower end, and many of your clients will sit exactly on it (see the first example). If you want gentler, say a number (for example 1300) and the 500 kcal step softens for smaller women.
2. **Obesity line at 27.5 or 25.** I used 27.5 (ICMR-NIN 2024), so fewer people get the larger 500 kcal cut. Misra 2009 and AIIMS-DST use 25.
3. **Activity factor 1.3 for sitting.** It follows India's standard more closely than 1.2 and raises every sedentary target by about 8 %.
4. **Protein counted on the weight at BMI 25.** This is my convention; no guideline settles it.
5. **Assumed bedtime 11:30 pm** until the app asks each person.

## 5. What this changes in the product

- Targets are personal and explained on screen. The same goal gives different numbers, or no deficit at all, depending on the person.
- One new question for people with diabetes (insulin or sulfonylurea tablets: yes / no / not sure).
- The honest limit: any formula can be 10 % or more off for one person. The real fix is planned for Phase 4: **the app corrects the target from the person's own weight trend.**

## 6. What could not be verified (stated plainly)

- ICMR-NIN's activity levels for moderate and heavy work, and its BMR equations (the full 2020 report was not reachable; only the sedentary 1.40 is quoted).
- The origin of the common 1.2 / 1.375 / 1.55 / 1.725 multipliers.
- Any validation of Mifflin-St Jeor in Indian adults.
- Which body weight to use for protein and energy at high BMI in the general population.
- "1200 / 1500 kcal" as formal floors: they appear only as the lower ends of prescription ranges.
- The PROT-AGE full text (including the often-quoted 25 to 30 g per meal), the ACSM position stand, and the ADA 2026 Standards beyond a summariser view.
- A numeric "weight loss too fast, see a doctor" threshold in any guideline.
- An RSSDI or Endocrine Society of India obesity-specific deficit figure.
- I relied on the research pass's reading of each source and did not re-open them a second time. Abstract-only (ABS) and summariser-only (FX) items deserve a check by your research tool before you publish any of these numbers to clients.

## 7. Sources

S1. ICMR-NIN. Brief Note on Nutrient Requirements for Indians, RDA and EAR, 2020. https://www.nin.res.in/rdabook/brief_note.pdf
S2. ICMR-NIN. Short Report, Nutrient Requirements for Indians, 2020 (mirror copy; official links returned 404). https://drklbcollege.ac.in/wp-content/uploads/2020/03/DOC-20220614-WA0002_-1.pdf
S3. Sinha, Kurpad, Kuriyan. Total energy expenditure of young adults from urban South India. Eur J Clin Nutr 2021. https://doi.org/10.1038/s41430-020-00790-5
S4. Song et al. Lower resting energy expenditure in Asian-Indian than Chinese men. Int J Obes 2016. https://doi.org/10.1038/ijo.2015.233
S5. Frankenfield et al. Predictive equations for resting metabolic rate, systematic review. J Am Diet Assoc 2005. https://doi.org/10.1016/j.jada.2005.02.005
S6. Frankenfield. Bias and accuracy of resting metabolic rate equations. Clin Nutr 2013. https://doi.org/10.1016/j.clnu.2013.03.022
S7. Madden et al. Prediction equations in overweight and obese adults. J Hum Nutr Diet 2016. https://doi.org/10.1111/jhn.12355
S8. ICMR. Guidelines for Management of Type 2 Diabetes, 2018 (mirror). https://medbox.org/index.php/dl/5e148832db60a2044c2d5206
S9. Volkert et al. ESPEN guideline on clinical nutrition and hydration in geriatrics, 2019 (accepted manuscript). https://ueaeprints.uea.ac.uk/id/eprint/67392/1/Accepted_manuscript.pdf
S10. WHO Expert Consultation. Appropriate body-mass index for Asian populations. Lancet 2004. https://doi.org/10.1016/S0140-6736(03)15268-3
S11. Misra et al. Consensus statement for diagnosis of obesity, abdominal obesity and the metabolic syndrome for Asian Indians. JAPI 2009. PMID 19582986.
S12. ICMR-NIN. Dietary Guidelines for Indians, 2024. https://www.nin.res.in/dietaryguidelines/pdfjs/locale/DGI_2024.pdf
S13. Ranjan et al. Guidelines for management of obesity and overweight in midlife women (AIIMS-DST). J Midlife Health 2022. https://doi.org/10.4103/jmh.jmh_7_22
S14. NICE NG246. Overweight and obesity management, 2025. https://www.nice.org.uk/guidance/ng246
S16. NHLBI/NAASO. Practical Guide: Identification, Evaluation, and Treatment of Overweight and Obesity in Adults, 2000. https://www.nhlbi.nih.gov/files/docs/guidelines/prctgd_c.pdf
S17. Jensen et al. 2013 AHA/ACC/TOS guideline for the management of overweight and obesity in adults. https://doi.org/10.1161/01.cir.0000437739.71477.ee
S18. NHS. Tips to help you lose weight. https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/tips-to-help-you-lose-weight/
S19. Evert et al. Nutrition Therapy for Adults With Diabetes or Prediabetes: A Consensus Report. Diabetes Care 2019. PMID 31000505.
S20. Bauer et al. PROT-AGE position paper. JAMDA 2013. https://doi.org/10.1016/j.jamda.2013.05.021
S21. Deutz et al. Protein intake and exercise for optimal muscle function with aging (ESPEN Expert Group). Clin Nutr 2014. https://doi.org/10.1016/j.clnu.2014.04.007
S22. Aragon et al. ISSN position stand: diets for body weight reduction. JISSN 2026. https://doi.org/10.1080/15502783.2026.2740266
S23. Kim et al. Protein intake and body composition after weight loss in older adults. Nutr Rev 2016. https://doi.org/10.1093/nutrit/nuv065
S24. Wycherley et al. High-protein versus standard-protein energy-restricted diets. AJCN 2012. https://doi.org/10.3945/ajcn.112.044321
S25. Jäger et al. ISSN Position Stand: protein and exercise. JISSN 2017. https://doi.org/10.1186/s12970-017-0177-8
S26. Morton et al. Protein supplementation and resistance training, meta-analysis. BJSM 2018. https://doi.org/10.1136/bjsports-2017-097608
S27. ADA. Standards of Care in Diabetes 2026, Section 5 (FX only). https://doi.org/10.2337/dc26-S005
S28. RSSDI. Clinical Practice Recommendations 2022, summary document. https://www.rssdi.in/newwebsite/RSSDI-Clinical-Practice-Recommendations-2022%20(1).pdf
S29. Moore et al. Protein per meal in older versus younger men. J Gerontol A 2015. https://doi.org/10.1093/gerona/glu103
S30. Schoenfeld, Aragon. How much protein can the body use in a single meal. JISSN 2018. https://doi.org/10.1186/s12970-018-0215-1
S31. Mamerow et al. Dietary protein distribution and 24-h muscle protein synthesis. J Nutr 2014. https://doi.org/10.3945/jn.113.185280
S32. Jakubowicz et al. High caloric intake at breakfast vs dinner. Obesity 2013. https://doi.org/10.1002/oby.20460
S33. Garaulet et al. Timing of food intake predicts weight loss effectiveness. Int J Obes 2013. https://doi.org/10.1038/ijo.2012.229
S34. Young et al. Distribution of energy intake across the day and weight loss. Obes Rev 2023. https://doi.org/10.1111/obr.13537
S35. Liu et al. Meal timing and anthropometric and metabolic outcomes, meta-analysis. JAMA Netw Open 2024. https://doi.org/10.1001/jamanetworkopen.2024.42163
S36. St-Onge et al. Meal Timing and Frequency: AHA Scientific Statement. Circulation 2017. https://doi.org/10.1161/CIR.0000000000000476
S37. Gu et al. Metabolic effects of late dinner in healthy volunteers. JCEM 2020. https://doi.org/10.1210/clinem/dgaa354
S38. Katz et al. ACG Clinical Guideline for GERD, 2022. PMC8754510.
S39. WHO. Sodium reduction fact sheet. https://www.who.int/news-room/fact-sheets/detail/sodium-reduction
S41. Gaddey, Holder. Unintentional Weight Loss in Older Adults. Am Fam Physician 2021. https://www.aafp.org/pubs/afp/issues/2021/0700/p34.html
S42. NIDDK. Dieting and Gallstones. https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/dieting

*(S15 and S40 from the research pass are not cited above and are left out.)*
