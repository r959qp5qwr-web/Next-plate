/* ===== Next Plate v6 parameters. Every number that sets a target or raises a flag lives here, with its source.
   docs/RESEARCH-parameters.md gives the evidence (S-numbers below refer to its source list) and says which values are
   guideline figures and which are engine conventions. The owner can change any of them. Nothing here is a prescription. ===== */
var PARAM={
  /* --- energy --- */
  /* Activity factor applied to Mifflin-St Jeor BMR. 1.3 for "mostly sitting" reproduces ICMR-NIN 2020's sedentary requirement
     (BMR x PAL 1.40 on an Indian-adjusted BMR; S1) to within about 0 to 7 % for reference adults, and sits near the measured PAL of
     1.35 in sedentary young Indian men (S3). The usual 1.2 runs about 10 % below ICMR-NIN. 1.55 and 1.725 are the conventional
     exercise multipliers (origin not verified); they stay below ICMR-NIN's figures for moderate and heavy work. */
  activity:{low:1.3,light:1.4,mod:1.55,high:1.725},
  /* --- weight loss --- */
  bmiOverweight:23,        /* Asian-Indian overweight from 23.0 (WHO 2004 S10, Misra 2009 S11, ICMR-NIN 2024 S12) */
  bmiObese:27.5,           /* ICMR-NIN 2024 and NICE use 27.5; Misra 2009 and AIIMS-DST use 25. The higher line keeps the larger deficit for fewer people */
  bmiUnder:18.5,
  deficitOverweight:300,   /* kcal/day for BMI 23 to 27.4: NHLBI's 300 to 500 for overweight (S16) */
  deficitObese:500,        /* kcal/day for BMI 27.5 and above: ICMR-NIN 2024, AIIMS-DST, ICMR T2D (S12, S13, S8) */
  deficitMaxShare:.30,     /* never more than 30 % below maintenance (AHA/ACC/TOS option, S17; ICMR-NIN's outer limit is 40 %, S12) */
  floor:{f:1200,m:1500},   /* lower ends of the AHA/ACC/TOS prescription ranges (S17); ICMR-NIN's minimum is 1000 kcal (S12) */
  olderAge:65,             /* ESPEN: weight-reducing diets are avoided in overweight older adults, and individual in obese ones (S9) */
  /* --- protein, g per kg of reference weight per day --- */
  proteinBase:1.0,         /* ICMR-NIN: 1 g/kg for the cereal-based diets most Indians eat; RDA 0.83 with high-quality protein (S1) */
  proteinOlder:1.0,proteinOlderActive:1.2,   /* 65 and over: 1.0 to 1.2, at least 1.2 if active (PROT-AGE S20, ESPEN S21) */
  proteinLose:1.2,         /* during weight loss: 1.2 to 1.6 (ISSN 2026, S22); at least 1.0 keeps more lean mass after 50 (S23) */
  proteinBuild:1.4,        /* with resistance training: 1.4 to 2.0, no further gain beyond about 1.6 (S25, S26) */
  proteinCap:1.6,proteinCapDiabetes:1.5,     /* type 2 diabetes: typically 1 to 1.5 g/kg (ADA consensus, S19) */
  proteinMaxEnergyShare:.30,                 /* protein stays within 30 % of the day's energy (upper end of AIIMS-DST's weight-loss range, S13) */
  refBmi:25,               /* engine convention: above BMI 25, protein is set on the weight at BMI 25 for the person's height.
                              No guideline for general adults was found; ICMR's diabetes guideline uses ideal body weight (S8) */
  mealProteinMax:.55,      /* g/kg in one meal: the upper figure in the per-meal review (S30) */
  /* --- fibre --- */
  fibrePer1000:15,         /* ICMR-NIN 2020: about 30 g per 2000 kcal (S2) */
  fibreDiabetesPer1000:20,fibreDiabetesMin:25,fibreDiabetesMax:40,   /* ICMR T2D: 40 g per 2000 kcal; RSSDI: 25 to 40 g/day (S8, S28) */
  /* --- the day --- */
  split:{breakfast:.27,lunch:.40,snack:.05,dinner:.28},        /* ICMR-NIN 2024 sample menu is about 27/43/28 with a small evening drink (S12); 3 points moved to a snack */
  proteinSplit:{breakfast:.31,lunch:.32,snack:.06,dinner:.31}, /* protein spread evenly over the main meals (S31; total matters more, S22) */
  bedtimeHour:23.5,dinnerGapHours:2,                           /* dinner counts as late within 2 h of bed (2 to 3 h, S38; at least 1 to 2 h, S28). Bedtime is assumed until asked */
  catchUp:1.25,            /* engine rule: after a missed meal, no later meal grows beyond 1.25 x its usual energy */
  catchUpProtein:1.5,      /* engine rule: protein may catch up faster, to 1.5 x the meal's usual share, within mealProteinMax */
  mealFloor:.6,            /* engine rule: after a heavy earlier meal, no meal shrinks below 0.6 x its usual size */
  patternMin:3,            /* a habit is called a pattern when seen on 3 of the last 7 days */
  hookProteinGap:6,hookLighter:.85,hookLongGap:5,
  /* --- flags (Phase 4 uses these; listed here so the owner sees them) --- */
  flagLowIntake:1000,      /* a fully logged day under 1000 kcal (ICMR-NIN 2024, S12; ESPEN for older adults, S9) */
  flagPaceKgPerWeek:1.0,   /* faster than the top of the 0.5 to 1 kg/week guidance (S12, S18, S9), on two weekly weights in a row */
  flagUnintendedLoss:.05,  /* 5 % of body weight in 6 to 12 months when not trying to lose (S41) */
  waterGlasses:8           /* about 2 litres a day including beverages (ICMR-NIN 2024, S12) */
};
PARAM.lateDinnerHour=PARAM.bedtimeHour-PARAM.dinnerGapHours;
OPT.meds=[["no","No, neither"],["yes","Yes"],["unsure","Not sure"]];

function bmiOf(p){return p&&p.kg>0&&p.cm>0?p.kg/Math.pow(p.cm/100,2):null;}
function refWeight(p,par){par=par||PARAM;var b=bmiOf(p);if(b==null)return null;return b>par.refBmi?par.refBmi*Math.pow(p.cm/100,2):p.kg;}
/* The day's targets, each with the reason it is what it is. notes: [label, sentence] pairs shown to the person as written. */
function dayTargets6(p,par){
  par=par||PARAM;
  if(!p||!(p.kg>0)||!(p.cm>0)||!(p.age>0)||!par.activity[p.act]||(p.sex!=="m"&&p.sex!=="f"))return null;
  var notes=[],bmr=10*p.kg+6.25*p.cm-5*p.age+(p.sex==="m"?5:-161),maint=bmr*par.activity[p.act],bmi=bmiOf(p),goal=p.goal||"hold";
  var r10=function(x){return Math.round(x/10)*10;};
  notes.push(["Maintenance.","About "+r10(maint)+" kcal a day: your resting need from the Mifflin-St Jeor formula (age, sex, height, weight), times "+par.activity[p.act]+" for "+lab("act",p.act).toLowerCase()+". For an individual this estimate can be off by a tenth or more, so your weight trend has the last word."]);
  var kcal=maint,older=p.age>=par.olderAge,meds=p.health==="diabetes"&&(p.meds==="yes"||p.meds==="unsure"),hold="";
  if(goal==="lose"){
    if(bmi<par.bmiOverweight)hold="Your BMI is about "+bmi.toFixed(1)+", inside the healthy range for Indian adults (under 23), so plates hold your weight steady instead of cutting calories.";
    else if(older)hold="After 65, weight loss is planned one person at a time with a doctor, to protect muscle. Plates hold your weight steady and raise protein.";
    else if(meds)hold="With insulin or sulfonylurea tablets, eating less can drop blood sugar too far. Plates hold steady with an even amount of grain at each meal, until your doctor adjusts the plan.";
    if(hold)notes.push(["Weight loss.",hold]);
    else{
      var def=bmi>=par.bmiObese?par.deficitObese:par.deficitOverweight,cap=maint*par.deficitMaxShare,fl=par.floor[p.sex];
      def=Math.min(def,cap);kcal=Math.max(fl,maint-def);
      notes.push(["Weight loss.","About "+r10(maint-kcal)+" kcal a day under maintenance, for a BMI of about "+bmi.toFixed(1)+" (Indian guidance: 500 kcal for obesity, less when only overweight; about half a kilo a week is considered safe). Never under "+fl+" kcal a day."]);
    }
  }
  if(goal!=="lose"&&bmi<par.bmiUnder)notes.push(["Weight.","Your BMI is about "+bmi.toFixed(1)+", under 18.5. Please show this to your coach or doctor."]);
  var rw=refWeight(p,par),gk=par.proteinBase,why="1 g per kg, the ICMR-NIN figure for the cereal-based meals most Indians eat";
  if(older){gk=p.act==="mod"||p.act==="high"?par.proteinOlderActive:par.proteinOlder;why=gk+" g per kg, the range advised from 65 to protect muscle";}
  if(goal==="lose"&&!hold||goal==="lose"&&older){if(par.proteinLose>gk){gk=par.proteinLose;why=gk+" g per kg, because more protein helps keep muscle while losing weight";}}
  if(goal==="build"&&par.proteinBuild>gk){gk=par.proteinBuild;why=gk+" g per kg, the lower end of the range used with strength training";}
  gk=Math.min(gk,p.health==="diabetes"?par.proteinCapDiabetes:par.proteinCap);
  var protein=rw*gk,pmax=kcal*par.proteinMaxEnergyShare/4;if(protein>pmax)protein=pmax;
  notes.push(["Protein.","About "+Math.round(protein)+" g a day: "+why+(rw<p.kg-0.5?", counted on "+Math.round(rw)+" kg (the weight at BMI 25 for your height) so the target stays realistic":"")+". Spread evenly over breakfast, lunch and dinner."]);
  var fibre=p.health==="diabetes"?Math.min(par.fibreDiabetesMax,Math.max(par.fibreDiabetesMin,kcal*par.fibreDiabetesPer1000/1000)):kcal*par.fibrePer1000/1000;
  notes.push(["Fibre.","About "+Math.round(fibre)+" g a day"+(p.health==="diabetes"?", the higher amount Indian diabetes guidelines advise.":", from the ICMR-NIN figure of 30 g per 2000 kcal.")]);
  notes.push(["Meals.","Lunch is the largest meal and dinner a lighter one, following the ICMR-NIN sample day. A missed meal is spread over the rest of the day; no single meal is asked to make up for it."]);
  if(meds)notes.push(["Diabetes medicine.","Keep meals regular. Skipping a meal on insulin or sulfonylurea tablets can cause low sugar; your doctor's advice comes first."]);
  return {kcal:r10(kcal),protein:Math.round(protein),fiber:Math.round(fibre),maintenance:r10(maint),bmi:bmi,refKg:rw,holds:!!hold,meds:meds,notes:notes};
}

/* The v5 screens (still the live ones until the owner deploys v6) show targets through these two v5 functions.
   Point them at the same numbers the engine plans with, so the screen and the plates agree. */
dayTargets=function(p){return dayTargets6(Object.assign({goal:"hold"},p));};
mealTargets=function(day,meal,appetite){
  if(!day)return null;var a=Math.max(1,Math.min(10,Math.round(appetite||5)));
  return {kcal:Math.round(day.kcal*PARAM.split[meal]*(0.85+0.03*a)/10)*10,protein:Math.round(day.protein*PARAM.proteinSplit[meal])};
};
