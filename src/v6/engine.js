/* ===== Next Plate v6 engine. Loaded after the v5 core, in the page and on the server (np-core).
   docs/ARCHITECTURE-v6.md: event log -> food file -> day plan -> context brief with hooks -> Gemini -> checks.
   Code counts, Gemini cooks: every target, pattern and hook below is computed here; the model only plans food. ===== */

OPT.goal=[["lose","Lose weight gently"],["hold","Hold steady"],["build","Build strength"]];
OPT.focus=[["none","Nothing in particular"],["iron","Iron"],["b12","B12"],["cal","Calcium and D"],["pro","Protein"],["fib","Fibre"]];
var SLOTS=["breakfast","lunch","snack","dinner"];
var SLOTHOUR={breakfast:8.5,lunch:13.25,snack:16.75,dinner:20.25};          /* middle of each window, used until the person's own timing is learned */

/* ---------- the event log: append-only, on the phone, 90 days ---------- */
var EVTYPES=["had","other","skipped","rescued","shown","chosen","swapped","tuned","next","asked","water","walk","weight"];
function dayOf(ms){var d=new Date(ms);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function hourOf(ms){var d=new Date(ms);return d.getHours()+d.getMinutes()/60;}
function daysBack(ms,n){var d=new Date(ms);d.setHours(12,0,0,0);var out=[];for(var i=0;i<n;i++){out.push(dayOf(d.getTime()));d.setDate(d.getDate()-1);}return out;}
function mainWord(title){
  var t=String(title||"").toLowerCase().replace(/[^a-z\s]/g," ");
  var m=/\b(rajma|chole|chana|paneer|tofu|egg|eggs|chicken|fish|mutton|prawn|dal|sambar|khichdi|biryani|pulao|poha|upma|idli|dosa|paratha|chilla|oats|dalia|soya|sprouts|curd rice|rice|roti|millet|quinoa|soba|salad|soup|sandwich|wrap)\b/.exec(t);
  return m?m[1].replace(/^eggs$/,"egg"):"";
}
/* An eating event carries its estimates: {t, type, meal, title, kcal, protein, carbs, fats, fiber} */
function slotGroup(m){return m==="breakfast"?"b":m==="snack"?"s":"m";}
function isMealEv(e){return e.type==="had"||e.type==="other"||e.type==="rescued";}

/* ---------- the food file: everything below is derived from the log, nothing is stored twice ---------- */
function buildFile(events,nowMs,par){
  par=par||PARAM;
  var today=dayOf(nowMs),last7=daysBack(nowMs,8).slice(1),f={today:{kcal:0,protein:0,carbs:0,fats:0,fiber:0,meals:[],lastHoursAgo:null,lastKcal:0,water:0,walks:0},patterns:[],days:0};
  var byDay={},lastT=0;
  events.forEach(function(e){var d=dayOf(e.t);(byDay[d]=byDay[d]||[]).push(e);});
  /* today: the latest answer for each slot wins (a person can change "had" to "something else") */
  var slot={};(byDay[today]||[]).forEach(function(e){if(isMealEv(e)||e.type==="skipped")slot[e.meal]=e;if(e.type==="water")f.today.water+=1;if(e.type==="walk")f.today.walks+=1;});
  SLOTS.forEach(function(m){var e=slot[m];if(!e)return;
    f.today.meals.push({meal:m,kind:e.type,title:e.title||"",kcal:e.kcal||0,protein:e.protein||0});
    if(isMealEv(e)){["kcal","protein","carbs","fats","fiber"].forEach(function(k){f.today[k]+=e[k]||0;});if(e.t>lastT){lastT=e.t;f.today.lastKcal=e.kcal||0;}}});
  if(lastT)f.today.lastHoursAgo=Math.max(0,Math.round((nowMs-lastT)/36e5*10)/10);
  /* the last seven days before today */
  var lateN=0,dinN=0,skip={},words={},slotP={},slotN={},logged=0;
  last7.forEach(function(d){var evs=byDay[d]||[],s={},any=false;
    evs.forEach(function(e){if(isMealEv(e)||e.type==="skipped")s[e.meal]=e;});
    SLOTS.forEach(function(m){var e=s[m];if(!e)return;any=true;
      if(e.type==="skipped"){skip[m]=(skip[m]||0)+1;return;}
      slotP[m]=(slotP[m]||0)+(e.protein||0);slotN[m]=(slotN[m]||0)+1;
      var w=mainWord(e.title);if(w){var gk=slotGroup(m)+":"+w;words[gk]=(words[gk]||0)+1;}
      if(m==="dinner"){dinN++;if(hourOf(e.t)>=par.lateDinnerHour||hourOf(e.t)<4)lateN++;}});
    if(any)logged++;});
  f.days=logged;
  if(lateN>=par.patternMin)f.patterns.push({id:"late_dinner",n:lateN,of:dinN});
  SLOTS.forEach(function(m){if((skip[m]||0)>=par.patternMin)f.patterns.push({id:"skips_meal",meal:m,n:skip[m],of:logged});});
  Object.keys(words).sort(function(a,b){return words[b]-words[a];}).forEach(function(k){if(words[k]>=par.patternMin)f.patterns.push({id:"repeat",slot:k.charAt(0),food:k.slice(2),n:words[k]});});
  var rec=[],seen={};events.slice().reverse().forEach(function(e){if(nowMs-e.t>3*864e5||rec.length>=10)return;var ts=e.type==="shown"?(e.titles||[]):(isMealEv(e)||e.type==="next")?[e.title]:[];
    ts.forEach(function(t){if(t&&!seen[t]&&rec.length<10){seen[t]=1;rec.push(String(t).slice(0,60));}});});f.recent=rec;
  f.slotProtein={};SLOTS.forEach(function(m){if(slotN[m]>=par.patternMin)f.slotProtein[m]=Math.round(slotP[m]/slotN[m]);});
  return f;
}

/* ---------- the day planner ---------- */
/* What each remaining meal should carry, given what has been eaten. A missed meal is spread over the rest of the day,
   but no meal grows beyond catchUp x its usual size: the app never asks anyone to "make up" a meal in one sitting. */
function planDay(p,file,meal,appetite,par){
  par=par||PARAM;var day=dayTargets6(p,par);if(!day)return null;
  var by={};file.today.meals.forEach(function(m){by[m.meal]=m;});
  var idx=SLOTS.indexOf(meal),ek=0,ep=0,ak=0,apr=0;                       /* e = logged, a = assumed for earlier meals nobody logged */
  SLOTS.forEach(function(s,i){var m=by[s];if(s===meal)return;
    if(m){if(m.kind!=="skipped"){ek+=m.kcal;ep+=m.protein;}}
    else if(i<idx){ak+=day.kcal*par.split[s];apr+=day.protein*par.proteinSplit[s];}});       /* not logged is not the same as not eaten */
  var left=SLOTS.filter(function(s,i){return i>=idx&&(s===meal||!by[s]);}),wk=0,wp=0;left.forEach(function(s){wk+=par.split[s];wp+=par.proteinSplit[s];});
  var remK=Math.max(0,day.kcal-ek-ak),remP=Math.max(0,day.protein-ep-apr);
  var usualK=day.kcal*par.split[meal],usualP=day.protein*par.proteinSplit[meal];
  var k=remK*par.split[meal]/wk,pr=remP*par.proteinSplit[meal]/wp;
  k=Math.max(usualK*par.mealFloor,Math.min(k,usualK*par.catchUp));
  pr=Math.max(usualP*par.mealFloor,Math.min(pr,usualP*par.catchUpProtein,Math.max(usualP,par.mealProteinMax*day.refKg)));
  var a=Math.max(1,Math.min(10,Math.round(appetite||5)));k=k*(0.85+0.03*a);                 /* [S] appetite scaling */
  var t=file.today,mine=by[meal]&&by[meal].kind!=="skipped"?by[meal]:null;
  return {day:day,eaten:{kcal:Math.round(ek+(mine?mine.kcal:0)),protein:Math.round(ep+(mine?mine.protein:0)),fiber:Math.round(t.fiber)},left:{kcal:Math.round(remK),protein:Math.round(remP)},
    target:{kcal:Math.round(k/10)*10,protein:Math.round(pr)},usual:{kcal:Math.round(usualK/10)*10,protein:Math.round(usualP)},mealsLeft:left.length,assumed:ak>0};
}
/* Appetite, suggested from the day so far instead of asked ([S] "zero-input"): the person can always move it. */
function suggestAppetite(file,meal){
  var h=file.today.lastHoursAgo;if(h==null)return {v:5,why:""};
  if(h>=6)return {v:8,why:Math.round(h)+" h since you last ate"};
  if(h>=4)return {v:6,why:Math.round(h)+" h since you last ate"};
  if(h<2&&file.today.lastKcal>=400)return {v:3,why:"you ate not long ago"};
  return {v:5,why:""};
}

/* ---------- hooks: the only reasons Gemini may cite. Each is true by construction, because code derived it ---------- */
var FOCUSRULE={iron:"an iron-rich food together with a vitamin C food (lemon, amla, tomato, guava)",b12:"a B12 source the diet allows: dairy, egg, fish or meat",cal:"calcium foods: curd, milk, paneer, ragi, sesame or greens",pro:"a clear protein food at the centre of the plate",fib:"whole grain, legumes and vegetables for fibre"};
var FOCUSNAME={iron:"iron",b12:"B12",cal:"calcium and D",pro:"protein",fib:"fibre"};
function hooksFor(p,file,c,pl,par){
  par=par||PARAM;var H=[],t=file.today,meal=c.meal,mn=lab("meal",meal).toLowerCase();
  function add(id,tag,brief){H.push({id:id,tag:tag,brief:brief});}
  if(p.goal==="lose")add("goal_lose","gentle weight loss","Goal: lose weight gently. Vegetables fill about half the plate, the grain is measured, nothing fried, no sugary drinks.");
  if(p.goal==="build")add("goal_build","building strength","Goal: build strength. Protein leads the plate and the meal is not undersized.");
  if(p.focus&&p.focus!=="none"&&FOCUSRULE[p.focus])add("focus_"+p.focus,"minding "+FOCUSNAME[p.focus],"They are minding "+FOCUSNAME[p.focus]+": include "+FOCUSRULE[p.focus]+".");
  if(pl){
    var gap=pl.target.protein-pl.usual.protein;
    if(gap>=par.hookProteinGap)add("protein_gap","protein to catch up","They are behind on protein today: "+pl.left.protein+" g still to go with "+pl.mealsLeft+" meal"+(pl.mealsLeft>1?"s":"")+" left. This meal should carry about "+pl.target.protein+" g.");
    if(pl.target.kcal<=pl.usual.kcal*par.hookLighter&&t.kcal>0)add("lighter_now","lighter after earlier meals","They have eaten more than planned so far today, so this meal is lighter than usual: about "+pl.target.kcal+" kcal. Keep volume with vegetables.");
  }
  t.meals.forEach(function(m){if(m.meal===meal)return;var nm=lab("meal",m.meal).toLowerCase();
    if(m.kind==="skipped")add("skipped_"+m.meal,"skipped "+nm,"They skipped "+nm+" today. Do not make up for it with an oversized plate; a normal, protein-led meal.");
    else if(m.kind==="rescued")add("ate_out","after eating out","They ate out earlier today ("+m.title+"). Balance it: a simple home plate, more vegetables, less oil and salt.");
    else if(m.title)add("had_"+m.meal,"different from "+nm,"For "+nm+" they had "+m.title+". Lead with a different main ingredient now.");});
  if(t.lastHoursAgo!=null&&t.lastHoursAgo>=par.hookLongGap)add("long_gap",Math.round(t.lastHoursAgo)+" h since the last meal","It is "+Math.round(t.lastHoursAgo)+" hours since they last ate. Expect real hunger: give volume from vegetables and protein, not extra grain.");
  var rep=0,lateNow=meal==="dinner"&&c.hour!=null&&(c.hour>=par.lateDinnerHour||c.hour<4);
  file.patterns.forEach(function(x){
    if(x.id==="late_dinner"&&meal==="dinner"&&!lateNow)add("late_dinner","dinners run late","Their dinner was late on "+x.n+" of the last "+x.of+" dinners logged. Keep dinner lighter and easy to digest.");
    if(x.id==="skips_meal"&&x.meal===meal)add("easy_"+meal,"an easy "+mn,"They often skip "+mn+" ("+x.n+" of the last "+x.of+" days). Make it quick and simple enough to actually happen.");
    if(x.id==="repeat"&&x.slot===slotGroup(meal)&&!rep&&(rep=1))add("repeat_"+x.food.replace(/\s+/g,"_"),"less "+x.food+" this week",x.food+" was the main food "+x.n+" times in the last week. Choose a different main.");});
  if(lateNow)add("late_now","a late dinner","It is late for dinner. Keep it light and easy to digest, with a smaller grain portion"+(p.health==="diabetes"?" (but keep the grain)":"")+".");
  if(file.slotProtein){var low=null;SLOTS.forEach(function(m){var v=file.slotProtein[m];if(v!=null&&(low==null||v<file.slotProtein[low]))low=m;});
    if(low===meal&&Object.keys(file.slotProtein).length>=2)add("low_protein_meal","protein at "+mn,mn.charAt(0).toUpperCase()+mn.slice(1)+" has been their lowest-protein meal this week (about "+file.slotProtein[low]+" g). Lead with protein.");}
  if(c.mode==="strength")add("mode_strength","strength day","Today is a strength-training day: protein leads, with enough carbohydrate to refuel.");
  if(c.mode==="trek")add("mode_trek","trek day","Today is a trek or long endurance day: steady carbohydrate, enough salt and fluid with the meal, easy to digest.");
  if(p.health==="diabetes"&&(p.meds==="yes"||p.meds==="unsure"))add("steady_carbs","steady grain (diabetes medicine)","They take insulin or sulfonylurea tablets, or are not sure. Keep the carbohydrate portion steady and never very low: a normal measured grain serving at this meal.");
  if(p.health==="diabetes")add("diabetes_grain","the grain stays (diabetes)","Diabetes: the whole-grain or millet portion stays on the plate, paired with protein and fibre.");
  if(p.health==="bp")add("bp_salt","easy on salt (BP)","High blood pressure: no pickle, papad, namkeen or added salt.");
  return H.slice(0,9);
}
/* Variety is decided by code, not left to the model's habits: the lead ingredient rotates through the week, skips anything
   repeated lately or eaten today, and respects the diet. Gemini decides the dish. */
var ANCHORS=[["rajma, chole or lobia","veg","pulse",/rajma|chole|lobia|chana/],["paneer","veg","dairy",/paneer/],["moong or masoor dal","veg","",/dal|moong|masoor/],["soya chunks or tofu","veg","soya",/soya|tofu/],
  ["sprouts or kala chana","veg","",/sprout|kala chana/],["besan or moong chilla","veg","",/chilla|besan/],["curd with legumes (kadhi, dahi-based)","veg","dairy",/kadhi|curd|dahi/],
  ["eggs","egg","",/egg/],["chicken","nonveg","",/chicken/],["fish","nonveg","",/fish|rohu|surmai/]];
function anchorFor(p,file,c){
  if(c.text||c.dayNo==null)return "";
  var ok=ANCHORS.filter(function(a){
    if(a[1]==="egg"&&["egg","nonveg"].indexOf(p.diet)<0)return false;if(a[1]==="nonveg"&&p.diet!=="nonveg")return false;
    if(a[2]==="dairy"&&(p.diet==="vegan"||(p.leave||[]).indexOf("dairy")>=0))return false;if(a[2]==="soya"&&(p.leave||[]).indexOf("soya")>=0)return false;
    return !crosses(a[0],p);});
  var avoid=(file.recent||[]).concat(file.today.meals.map(function(m){return m.title;})).concat(file.patterns.filter(function(x){return x.id==="repeat";}).map(function(x){return x.food;})).join(" ").toLowerCase();
  var fresh=ok.filter(function(a){return !a[3].test(avoid);});if(fresh.length)ok=fresh;
  if(!ok.length)return "";
  return ok[(c.dayNo*4+SLOTS.indexOf(c.meal))%ok.length][0];
}
/* One plain sentence for the top of Today, written by code from the plan and the strongest hook ([S] "Live Dietitian Directive") */
function directive(p,pl,hooks,meal,done){
  if(!pl)return "";
  var s="Today: about "+pl.day.kcal+" kcal and "+pl.day.protein+" g protein. ";
  if(done)return s+"So far "+pl.eaten.kcal+" kcal and "+pl.eaten.protein+" g protein. That is every meal for today.";
  if(pl.eaten.kcal>0)s+="So far "+pl.eaten.kcal+" kcal and "+pl.eaten.protein+" g protein. ";
  s+=lab("meal",meal)+" carries about "+pl.target.kcal+" kcal and "+pl.target.protein+" g protein";
  var pri=["late_now","protein_gap","lighter_now","ate_out","long_gap","late_dinner"],pick=null;
  pri.some(function(id){return hooks.some(function(h){if(h.id===id){pick=h;return true;}return false;});});
  var tail={late_now:"; it's late, so keep it light",protein_gap:", to catch up on protein",lighter_now:", lighter after earlier meals",ate_out:"; simple and home-style after eating out",long_gap:"; you've gone a while without food, so vegetables and protein first",late_dinner:"; a lighter, earlier dinner helps"};
  return s+(pick?tail[pick.id]:"")+".";
}

/* ---------- request validation for the food file (the phone sends numbers and short words, never prompt text) ---------- */
function readFile(x,par){
  var f={today:{kcal:0,protein:0,carbs:0,fats:0,fiber:0,meals:[],lastHoursAgo:null,lastKcal:0},patterns:[],slotProtein:{},days:0,recent:[]};
  if(!x||typeof x!=="object")return f;var t=x.today||{};
  ["kcal","protein","carbs","fats","fiber"].forEach(function(k){f.today[k]=num(t[k],0,k==="kcal"?9000:900)||0;});
  f.today.lastHoursAgo=t.lastHoursAgo==null?null:Math.max(0,Math.min(48,+t.lastHoursAgo||0));f.today.lastKcal=num(t.lastKcal,0,4000)||0;
  (Array.isArray(t.meals)?t.meals:[]).slice(0,4).forEach(function(m){if(!m||!okOpt("meal",m.meal)||["had","other","skipped","rescued"].indexOf(m.kind)<0)return;
    f.today.meals.push({meal:m.meal,kind:m.kind,title:plainText(m.title,70),kcal:num(m.kcal,0,4000)||0,protein:num(m.protein,0,300)||0});});
  (Array.isArray(x.patterns)?x.patterns:[]).slice(0,8).forEach(function(q){if(!q)return;
    if(q.id==="late_dinner")f.patterns.push({id:q.id,n:num(q.n,0,7)||0,of:num(q.of,0,7)||0});
    else if(q.id==="skips_meal"&&okOpt("meal",q.meal))f.patterns.push({id:q.id,meal:q.meal,n:num(q.n,0,7)||0,of:num(q.of,0,7)||0});
    else if(q.id==="repeat"){var w=mainWord(q.food);if(w&&/^[bsm]$/.test(q.slot))f.patterns.push({id:q.id,slot:q.slot,food:w,n:num(q.n,0,21)||0});}});
  var sp=x.slotProtein||{};SLOTS.forEach(function(m){var v=num(sp[m],0,200);if(v!=null)f.slotProtein[m]=v;});
  f.days=num(x.days,0,7)||0;
  f.recent=(Array.isArray(x.recent)?x.recent:[]).slice(0,10).map(function(t){return plainText(t,60);}).filter(Boolean);
  return f;
}
readProfile=(function(base){return function(x){var p=base(x);if(!p)return p;p.goal=okOpt("goal",x.goal)?x.goal:"hold";p.focus=okOpt("focus",x.focus)?x.focus:"none";p.meds=okOpt("meds",x.meds)?x.meds:"unsure";if(p.age&&p.age<18)p.age=0;return p;};})(readProfile);
readCtx=(function(base){return function(x,kind){var c=base(x,kind==="log"?"rescue":kind);if(!c)return c;var h=+((x||{}).hour);c.hour=isFinite(h)&&h>=0&&h<24?h:null;var dn=num((x||{}).dayNo,1,366);c.dayNo=dn;return c;};})(readCtx);

/* ---------- prompts ---------- */
function briefText(p,c,file,pl,hooks){
  var t=file.today,L=[];
  L.push("TODAY SO FAR");
  if(pl)L.push("- Day target: about "+pl.day.kcal+" kcal and "+pl.day.protein+" g protein."+(t.meals.length?" Logged so far: "+pl.eaten.kcal+" kcal, "+pl.eaten.protein+" g protein.":"")+" Left to plan from this meal on: about "+pl.left.kcal+" kcal, "+pl.left.protein+" g protein."+(pl.assumed?" (Earlier meals that were not logged are assumed eaten as usual.)":""));
  if(t.meals.length)L.push("- Logged today: "+t.meals.map(function(m){return lab("meal",m.meal)+": "+(m.kind==="skipped"?"skipped":m.title+(m.kind==="rescued"?" (eaten out)":""));}).join("; ")+".");
  else L.push("- Nothing logged today.");
  L.push("");L.push("WHAT TO PLAN AROUND (each line has an id; these are the only reasons you may cite)");
  hooks.forEach(function(h){L.push("- ["+h.id+"] "+h.brief);});
  if(!hooks.length)L.push("- [plain_day] Nothing unusual today: a balanced plate at the target.");
  var an=anchorFor(p,file,c);
  L.push("");L.push("VARIETY");
  if(an)L.push("- Plate 1 is built on "+an+" (today's turn in the rotation). Plates 2 and 3 each use a different main ingredient.");
  if(file.recent&&file.recent.length)L.push("- Eaten or offered in the last three days, so do not offer these again: "+file.recent.join("; ")+".");
  L.push("- Vary the cooking style across the three plates (not three bhurjis or three curries).");
  return L.join("\n");
}
/* lite = the three plates only (fast). The swaps and one-tap changes for a plate are asked for separately (kind "tune"). */
function buildPlatesPrompt(p,c,file,pl,hooks,lite){
  var t=c.target;
  return [
"You are the dietitian inside Next Plate, a pocket-dietitian app. You plan the person's next meal in real food, with honest numbers, around how their day is actually going.",
"",
profileText(p,c),
"",
"THIS MEAL",
"- Meal: "+lab("meal",c.meal)+" (their local time "+c.time+")",
t?"- Target for this meal: about "+t.kcal+" kcal and at least "+t.protein+" g protein. The first plate should land within 10 percent of the kcal target.":"- No calorie target set; keep portions moderate for an adult.",
"- Appetite: "+c.appetite+" of 10.",
"- Mood: "+lab("mood",c.mood)+". Cuisine: "+lab("cuisine",c.cuisine)+(c.cuisine==="indian"?" ("+lab("region",p.region)+" Indian home style first, other Indian regions welcome)":"")+".",
"- "+lab("prep",c.prep)+", "+lab("oil",c.oil).toLowerCase()+".",
c.ratio?"- Plate ratio by volume they asked for: protein "+c.ratio.protein+"%, vegetables and greens "+c.ratio.greens+"%, carbohydrate "+c.ratio.carbs+"%, fats "+c.ratio.fats+"%.":null,
c.text?"- They wrote: \""+c.text+"\". Answer that with the meals. If it is a craving or a named dish, meal 1 is that food made to fit; meal 2 is a lighter cousin.":null,
"",
briefText(p,c,file,pl,hooks),
"",
rulesText(p),
"- If they ask about symptoms, medicines, lab reports, pregnancy, kidney disease, eating disorders or a child's diet, or anything that is not what to eat, return status \"refer\" with one sentence sending them to their coach or doctor, and no meals.",
"",
"WHAT TO RETURN",
"- status \"ok\", a one-sentence \"read\" of the situation (at most 28 words), and exactly 3 meals, best first, clearly different from each other (different main ingredient in each).",
"- Each meal: title (at most 8 words), subtitle (what is in it, at most 18 words), cuisine (2 to 4 words), prepMinutes (0 if ordered or ready), 3 to 6 items each with food, grams and group (protein, greens, carbs, fats or other), kcal, protein, carbs, fats, fiber.",
"- why: 2 short food-pairing reasons, each a pair (e.g. \"Lemon + spinach\") and a plain effect (at most 20 words, no numbers).",
"- planned_around: the ids from WHAT TO PLAN AROUND that this meal really acts on (1 to 4 ids; only ids listed there).",
"- for_you: one sentence (at most 24 words) telling the person why this plate suits them today, built on those reasons. Speak to them as \"you\". No percentages.",
lite?null:TUNETEXT(p)
  ].filter(function(x){return x!==null;}).join("\n");
}
function TUNETEXT(p){return [
"- swaps.protein: 3 options for the main protein, each with its own grams; the first is the one already in the meal with all deltas 0. swaps.base: 2 or 3 options for the carbohydrate base, each with its own grams, the first being the current one with deltas 0. Deltas are the change in kcal and grams versus the meal as written.",
"- alchemy: four one-tap changes to this exact meal, each with titleSuffix (at most 6 words, starting with + or a bracket), note (what changes, at most 22 words), minutes (new prep time) and deltas versus the meal as written:",
"  protein = add about 12 to 18 g protein with real food; glucose = gentler on blood sugar (more vegetables or legumes, less refined starch"+(p.health==="diabetes"?", but keep the grain portion":"")+"); express = a 10-minute version; gut = easier to digest (less chilli and oil, fermented or cooling sides)."].join("\n");}
function buildTunePrompt(p,m){
  return [
"You are the dietitian inside Next Plate. Here is a plate you planned. Give the ways it can be changed, keeping the person's rules.",
"",
profileText(p,null),
"",
"THE PLATE: "+m.title+" ("+m.subtitle+")",
"- "+m.items.map(function(i){return i.grams+" g "+i.food+" ["+i.group+"]";}).join("; "),
"- As written: "+m.kcal+" kcal, "+m.protein+" g protein, "+m.carbs+" g carbs, "+m.fats+" g fats, "+m.fiber+" g fibre. Prep "+m.minutes+" minutes.",
"",
rulesText(p),
"",
"WHAT TO RETURN",
TUNETEXT(p)
  ].join("\n");
}
function buildLogPrompt(p,c){
  return [
"You are the dietitian inside Next Plate. The person is telling you what they actually ate, so it can be counted in their day. Do not judge it and do not change it.",
"",
profileText(p,null),
"",
"WHAT THEY ATE for "+lab("meal",c.meal).toLowerCase()+": \""+c.text+"\""+(c.photo?" (a photo of the plate is attached: describe only what you can see)":""),
"",
"WHAT TO RETURN",
"- status \"ok\"; title (the meal in at most 7 words); items, each with food, grams and group (protein, greens, carbs, fats or other), using typical Indian home or restaurant portions when they gave none; kcal, protein, carbs, fats, fiber for the whole meal. kcal must roughly equal 4 x protein + 4 x carbs + 9 x fats.",
"- assumed: one short sentence (at most 18 words) naming the portion sizes you assumed, so they can correct you.",
"- If this is not something a person ate, return status \"refer\".",
"- Plain words. No advice, no warnings, no percentages, no exclamation marks."
  ].join("\n");
}
function platesSchema(ids,lite){
  var s=JSON.parse(JSON.stringify(SCH.meals)),m=s.properties.meals.items;
  if(lite){delete m.properties.swaps;delete m.properties.alchemy;m.required=m.required.filter(function(k){return k!=="swaps"&&k!=="alchemy";});m.propertyOrdering=m.propertyOrdering.filter(function(k){return k!=="swaps"&&k!=="alchemy";});}
  m.properties.planned_around={type:"ARRAY",items:{type:"STRING",enum:ids.length?ids:["plain_day"]}};m.properties.for_you={type:"STRING"};
  m.required=m.required.concat(["planned_around","for_you"]);m.propertyOrdering=m.propertyOrdering.concat(["planned_around","for_you"]);return s;
}
SCH.tune=(function(){var m=SCH.meals.properties.meals.items.properties;return {type:"OBJECT",properties:{swaps:m.swaps,alchemy:m.alchemy},required:["swaps","alchemy"],propertyOrdering:["swaps","alchemy"]};})();
SCH.log={type:"OBJECT",properties:{status:{type:"STRING",enum:["ok","refer"]},title:{type:"STRING"},
  items:{type:"ARRAY",items:{type:"OBJECT",properties:{food:{type:"STRING"},grams:{type:"INTEGER"},group:{type:"STRING",enum:GROUPS}},required:["food","grams","group"]}},
  kcal:{type:"INTEGER"},protein:{type:"INTEGER"},carbs:{type:"INTEGER"},fats:{type:"INTEGER"},fiber:{type:"INTEGER"},assumed:{type:"STRING"}},required:["status"],
  propertyOrdering:["status","title","items","kcal","protein","carbs","fats","fiber","assumed"]};

/* ---------- checks ---------- */
function checkReply6(r,p,hooks){
  var out=checkReply(r,p),ids={},tags={};hooks.forEach(function(h){ids[h.id]=1;tags[h.id]=h.tag;});
  var raw=(r&&Array.isArray(r.meals))?r.meals:[],byTitle={};raw.forEach(function(m){if(m&&typeof m.title==="string")byTitle[clean(m.title,70)]=m;});
  out.meals.forEach(function(m){var src=byTitle[m.title]||{};
    m.planned=(Array.isArray(src.planned_around)?src.planned_around:[]).filter(function(id,i,a){return ids[id]&&a.indexOf(id)===i;}).slice(0,4);   /* a hook that was not offered is dropped */
    var fy=clean(src.for_you,170);m.forYou=fy&&!CLAIM.test(fy)&&!supp(fy)&&!crosses(fy,p)?fy:"";
    m.tuned=Object.keys(m.alchemy).length>0||m.swaps.protein.length>0;});
  out.hooks=tags;return out;
}
function checkTune(r,p,meal){
  var m={};for(var k in meal)m[k]=meal[k];m.prepMinutes=meal.minutes;m.swaps=r&&r.swaps;m.alchemy=r&&r.alchemy;
  var c=checkMeal(m,p);if(!c.meal)return {status:"empty"};
  return {status:"ok",swaps:c.meal.swaps,alchemy:c.meal.alchemy};
}
function checkLog(r){
  if(!r||typeof r!=="object")return {status:"error"};
  if(r.status==="refer")return {status:"refer"};
  var n={kcal:num(r.kcal,1,5000),protein:num(r.protein,0,300),carbs:num(r.carbs,0,600),fats:num(r.fats,0,300),fiber:num(r.fiber,0,100)};
  if(n.kcal==null||n.protein==null||n.carbs==null||n.fats==null||n.fiber==null)return {status:"empty"};
  var est=4*n.protein+4*n.carbs+9*n.fats;if(Math.abs(est-n.kcal)/n.kcal>0.2)n.kcal=Math.round(est/10)*10;      /* the log trusts the macros and recomputes energy rather than refusing a real meal */
  var items=(Array.isArray(r.items)?r.items:[]).slice(0,8).map(function(it){return {food:clean(it&&it.food,60),grams:num(it&&it.grams,1,1500),group:GROUPS.indexOf(it&&it.group)>=0?it.group:"other"};}).filter(function(i){return i.food&&i.grams;});
  var as=clean(r.assumed,140).replace(/^assum(ed|ing|es)[:,]?\s+(that\s+)?/i,"");if(CLAIM.test(as))as="";else if(as)as=as.charAt(0).toUpperCase()+as.slice(1);
  return {status:"ok",title:clean(r.title,60)||"Meal",items:items,kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,assumed:as};
}

/* ---------- the entry point, replacing v5's. A request without a food file still works (it is simply a day with nothing logged).
   weight = how much of the daily allowance a call uses: a set of plates is 1, the small follow-ups are a quarter ---------- */
KINDS=["meals","rescue","log","tune"];
plan=function(kind,body){
  var p=readProfile(body&&body.profile);if(!p)return {error:"bad_request"};
  if(p.health==="kidney"||p.health==="preg")return {reply:{status:"refer",read:SAFETY,meals:[]}};
  if(kind==="tune"){p.slot=okOpt("meal",body&&body.slot)?body.slot:"";var cm=checkMeal(body&&body.meal,p);if(!cm.meal)return {error:"bad_request"};
    return {prompt:buildTunePrompt(p,cm.meal),schema:SCH.tune,image:false,weight:.25,check:function(d){return checkTune(d,p,cm.meal);}};}
  var c=readCtx(body&&body.ctx,kind);if(!c)return {error:"bad_request"};
  var file=readFile(body&&body.file),pl=planDay(p,file,c.meal,c.appetite||5);
  c.target=pl?pl.target:null;p.slot=c.meal;
  if(kind==="meals"){var hooks=hooksFor(p,file,c,pl),lite=!!(body.ctx&&body.ctx.lite);
    return {prompt:buildPlatesPrompt(p,c,file,pl,hooks,lite),schema:platesSchema(hooks.map(function(h){return h.id;}),lite),image:false,weight:1,check:function(d){return checkReply6(d,p,hooks);}};}
  if(kind==="rescue"){c.photo=!!(body&&body.image);
    var pr=buildRescuePrompt(p,c);if(pl&&file.today.kcal>0)pr=pr.replace("\nHARD RULES","- Logged so far today: "+pl.eaten.kcal+" kcal, "+pl.eaten.protein+" g protein. Left for the day: about "+pl.left.kcal+" kcal, "+pl.left.protein+" g protein.\n\nHARD RULES");
    return {prompt:pr,schema:SCH.rescue,image:true,weight:1,check:function(d){return checkRescue(d,p);}};}
  if(kind==="log"){c.photo=!!(body&&body.image);if(!c.text&&!c.photo)return {error:"bad_request"};
    return {prompt:buildLogPrompt(p,c),schema:SCH.log,image:true,weight:.25,check:checkLog};}
  return {error:"bad_request"};
};
