/* ===== Next Plate v6 parameters. Every number that sets a target or a flag lives here, with its source.
   docs/RESEARCH-parameters.md explains each one. The owner can change any of them; nothing below is a prescription. ===== */
var PARAM={
  split:{breakfast:.25,lunch:.35,snack:.10,dinner:.30},   /* share of the day per meal; engine default, owner may change */
  catchUp:1.25,            /* engine rule: after a missed meal, no later meal grows beyond 1.25 x its usual energy */
  catchUpProtein:1.5,      /* engine rule: protein may catch up faster than energy, up to 1.5 x the meal's usual share */
  mealFloor:.6,            /* engine rule: after overeating earlier, a meal never shrinks below 0.6 x its usual size */
  lateDinnerHour:21.5,     /* dinner logged at or after 9:30 pm counts as late; owner may change */
  patternMin:3,            /* a habit is called a pattern only when seen on 3 of the last 7 days */
  hookProteinGap:6,        /* grams above the meal's usual protein before "protein to catch up" is raised */
  hookLighter:.85,         /* a meal at or under 0.85 x its usual energy is described as "lighter" */
  hookLongGap:5            /* hours since the last meal before hunger is planned for */
};
function dayTargets6(p,par){
  par=par||PARAM;var d=dayTargets(p);if(!d)return null;
  d.fiber=0;d.notes=[["Energy.","About "+d.kcal+" kcal a day."],["Protein.","About "+d.protein+" g a day."]];return d;
}
