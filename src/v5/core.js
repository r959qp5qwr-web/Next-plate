/* ===== Next Plate v5 core. Runs in the page and, unchanged, on the server (np-core).
   Spec: docs/SPEC-v5.md. Foundation: docs/foundation/ ([P] Pocket Dietitian, [S] Summit Edition). ===== */

/* ---------- option lists (validated on both sides) ---------- */
var OPT={
  diet:[["veg","Vegetarian"],["egg","Veg and egg"],["nonveg","Non-veg"],["jain","Jain"],["vegan","Vegan"]],
  health:[["none","Nothing to flag"],["diabetes","Diabetes"],["bp","High BP"],["kidney","Kidney condition"],["preg","Pregnant or nursing"]],
  region:[["n","North"],["s","South"],["w","West"],["e","East"]],
  leave:[["dairy","Dairy"],["nut","Nuts"],["wheat","Wheat"],["soya","Soya"]],
  sex:[["f","Female"],["m","Male"]],
  act:[["low","Mostly sitting"],["light","Light activity"],["mod","Exercise 3 to 5 days"],["high","Hard training most days"]],
  /* one-tap state, from [S] BIO_MODES; plain names, no invented biometrics */
  mode:[["strength","Strength day"],["trek","Trek day"],["focus","Desk day"],["rest","Wind-down"]],
  /* [P] MOOD_FILTERS */
  mood:[["best","Best fit"],["quick","Quick 15-min"],["protein","High protein"],["comfort","Comforting"],["light","Light"]],
  /* [P] CUISINES */
  cuisine:[["indian","Indian regional"],["med","Mediterranean"],["express","High-protein express"]],
  prep:[["home","Cooking at home"],["out","Ordering out"]],
  oil:[["min","Minimal oil"],["std","Standard oil"]],
  meal:[["breakfast","Breakfast"],["lunch","Lunch"],["snack","Snack"],["dinner","Dinner"]]
};
function lab(k,v){var l=OPT[k]||[];for(var i=0;i<l.length;i++)if(l[i][0]===v)return l[i][1];return "";}

/* [S] defaultPortions per mode; the plate builder starts here */
var MODEPLATE={strength:{protein:42,greens:23,carbs:25,fats:10},trek:{protein:32,greens:23,carbs:35,fats:10},focus:{protein:36,greens:40,carbs:12,fats:12},rest:{protein:34,greens:42,carbs:14,fats:10}};
/* what each mode asks of the plate, rewritten from [S] clinicalFocus in plain words */
var MODEFOCUS={
  strength:"after strength training: protein leads the plate, with enough carbohydrate to refuel",
  trek:"a long trek or endurance day: steady carbohydrate for energy, enough protein, easy to digest on the move",
  focus:"a desk day: keep the after-meal rise gentle, vegetables and protein first, a modest portion of slow carbohydrate",
  rest:"a wind-down day or evening: light and easy to digest, vegetables and protein, little heavy or fried food"
};
/* [P] builder presets */
var PRESETS={balanced:{protein:35,greens:35,carbs:20,fats:10},post:{protein:40,greens:25,carbs:25,fats:10},steady:{protein:35,greens:45,carbs:10,fats:10}};

/* ---------- targets ----------
   kcal: Mifflin-St Jeor BMR x the standard activity factor. Protein: kg x PROTEIN_G_PER_KG (default 0.83, ICMR-NIN 2020 adult RDA; the owner may change it).
   The meal split is a placeholder the owner may change. */
var ACTF={low:1.2,light:1.375,mod:1.55,high:1.725};
var PROTEIN_G_PER_KG=0.83;
var SPLIT={breakfast:.25,lunch:.35,snack:.10,dinner:.30};
function dayTargets(p){
  if(!p||!(p.kg>0)||!(p.cm>0)||!(p.age>0)||!ACTF[p.act])return null;
  var bmr=10*p.kg+6.25*p.cm-5*p.age+(p.sex==="m"?5:-161);
  return {kcal:Math.round(bmr*ACTF[p.act]/10)*10,protein:Math.round(p.kg*PROTEIN_G_PER_KG)};
}
/* [S] appetite scaling: target x (0.85 + 0.03 x appetite), appetite 1..10 */
function mealTargets(day,meal,appetite){
  if(!day)return null;var a=Math.max(1,Math.min(10,Math.round(appetite||5)));
  return {kcal:Math.round(day.kcal*SPLIT[meal]*(0.85+0.03*a)/10)*10,protein:Math.round(day.protein*SPLIT[meal])};
}

/* ---------- the after-meal curve: a model of direction, shown as a band, never a blood-sugar number ----------
   Carbs push it up; fibre, protein and fat slow it; vegetables first, a short walk and a lemon or vinegar starter lower it ([S] twin toggles).
   The size of each effect is illustrative; the direction follows published studies of meal order and light walking after meals. */
function riseOf(n,hab){
  var avail=Math.max(0,n.carbs-n.fiber);
  var raw=avail*1.35/(1+n.protein*.02+n.fiber*.035+n.fats*.012);
  var act=raw*(hab&&hab.veg?.75:1)*(hab&&hab.walk?.82:1)*(hab&&hab.lemon?.93:1);
  function band(x){return x<30?"Gentle":x<50?"Moderate":"Sharp";}
  return {raw:Math.min(100,Math.round(raw)),idx:Math.min(100,Math.round(act)),band:band(act),band0:band(raw),tp:Math.round(42+Math.min(26,n.fiber*.5+n.fats*.3))};
}

/* ---------- fit: how close a meal is to this meal's target. Computed here, never generated ---------- */
function fitOf(n,t){
  if(!t)return null;
  var k=Math.abs(n.kcal-t.kcal)/t.kcal,p=n.protein>=t.protein?0:(t.protein-n.protein)/t.protein;
  return Math.max(0,Math.min(100,Math.round(100-k*60-p*60)));
}

/* ---------- word lists: these filter, they never bend ---------- */
var NONVEG=["chicken","mutton","fish","prawn","prawns","shrimp","meat","keema","bacon","ham","tuna","salmon","rawas","surmai","pomfret","rohu","katla","bangda","sardine","mackerel","sausage","pepperoni","seafood","crab","lamb","pork","beef","salami","turkey","goat","kheema","anchovy","squid"];
var EGGW=["egg","eggs","omelette","omelet","anda","mayonnaise","mayo"];
var DAIRYW=["milk","curd","dahi","paneer","ghee","butter","cheese","chaas","lassi","raita","cream","khoya","yogurt","yoghurt","kheer","buttermilk","kadhi","chhena","labneh","feta","halloumi","tzatziki","whey","malai","kefir","skyr","cottage cheese"];
var JAINW=["onion","onions","garlic","potato","potatoes","aloo","carrot","carrots","gajar","radish","mooli","beetroot","beet","ginger","yam","sweet potato","shallot","leek","spring onion","arbi","jimikand"];
var LEAVEW={dairy:DAIRYW,nut:["nut","nuts","peanut","peanuts","almond","almonds","walnut","walnuts","cashew","cashews","pistachio","pistachios","hazelnut","pecan","groundnut","mungfali"],
  wheat:["wheat","atta","roti","phulka","chapati","naan","paratha","dalia","broken wheat","bread","toast","khakhra","semolina","suji","rava","maida","pasta","noodles","farro","freekeh","couscous","bulgur","seitan","sourdough","pita","tortilla","soba"],
  soya:["soya","soy","tofu","edamame","tempeh","miso","soybean","soy sauce"]};
var SWEETS=["juice","mithai","gulab jamun","jalebi","halwa","kheer","sugar","cola","soft drink","laddu","ladoo","barfi","ice cream","dessert","rasgulla","rosogolla","rasmalai","sandesh","payasam","shrikhand","peda","chikki","sheera","kesari","modak","malpua","basundi","rabri","syrup","sweetened","honey","jaggery","gur","tiramisu","cake","pastry","chocolate","date syrup"];
var SALTY=["pickle","achar","papad","namkeen","chips","soy sauce"];
/* D2: no supplements, powders, tablets or doses */
var SUPPW=["supplement","supplements","capsule","capsules","tablet","tablets","whey protein","whey isolate","whey powder","protein powder","protein shake","psyllium","isabgol","collagen","creatine","multivitamin","magnesium","zinc","vitamin d3","vitamin b12","omega-3 capsule","fish oil","bcaa","pre-workout","electrolyte powder","melatonin","l-theanine","coq10","peptopro","enzymes","probiotic capsule","protein scoop","scoop of protein","scoop of whey"];
/* invented precision and medical claims ([S] "+2000 % curcumin", "mTOR", "mg/dL") */
var CLAIM=/%|\bmg\s*\/\s*dl\b|\bmtor\b|\bleucine\b|\bglut4\b|\bcortisol\b|\bmelatonin\b|\binsulin\b|\bdetox|\bcures?\b|\bcured\b|\btreat(ment|ing|ed)\b|\btreats?\s+(your|the|it|this|that|diabetes|anaemia|anemia|deficienc|blood|sugar|pain|weight|pcos|thyroid)|\bguarantee|\bheal(s|ing)?\b|\bhrv\b|\bmyofibrillar\b|\binflammat|\bimmun/i;
var NEG=/\b(no|without|skip the|skip|hold the|minus|instead of|swap out|leave out)\s+(added\s+|extra\s+)?[a-z]+(\s+(or|and)\s+[a-z]+)?/g;
var EMO=/[\u2600-\u27BF\uFE0F]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/g;
var SAFETY="This one is for your coach and doctor to plan with you.";

var GRAINW=/\b(roti|rotis|phulka|phulkas|chapati|chapatis|paratha|parathas|thepla|bhakri|naan|kulcha|rice|basmati|pulao|khichdi|biryani|millet|millets|jowar|bajra|ragi|foxtail|kodo|quinoa|dalia|daliya|broken wheat|oats|oatmeal|poha|upma|idli|idlis|dosa|uttapam|bread|toast|pav|noodles|pasta|soba|farro|freekeh|couscous|rava|semolina|vermicelli|sevai|barley|amaranth|rajgira|makki|mudde|appam|puttu|pongal)\b/i;
/* A grain-free stand-in named like a grain is not a grain: cauliflower or broccoli "rice", zucchini or konjac noodles, almond- or
   coconut-flour roti, keto bread. Those words are taken out before the grain test. After a vegetable only rice, noodles, pasta, roti,
   naan and bread count, and only next to it ("broccoli fried rice" is rice; "cauliflower paratha" is a wheat paratha with a gobi filling);
   after words that are never a grain (konjac, shirataki, keto, almond flour) any grain word counts. */
var STANDIN=/\b(?:(?:cauli(?:flower)?|broccoli|zucchini|courgette|cabbage|kelp|palmini|lettuce)[\s-]+(?:rice|noodles?|pasta|spaghetti|couscous|roti|rotis|chapati|chapatis|naan|bread|tortillas?|pizza)|(?:konjac|shirataki|keto|low[\s-]?carb|carb[\s-]?free|grain[\s-]?free|no[\s-]?grain|cloud)(?:[\s-]+[a-z]+)?[\s-]+(?:roti|rotis|chapati|chapatis|paratha|parathas|phulka|phulkas|naan|bhakri|thepla|rice|noodles?|pasta|spaghetti|bread|toast|pav|couscous|upma|poha|idli|idlis|dosa|uttapam|tortillas?)|(?:almond|coconut|lupin|psyllium)[\s-]+(?:flour|meal|husk)(?:[\s-]+[a-z]+)?[\s-]+(?:roti|rotis|chapati|chapatis|paratha|parathas|phulka|phulkas|naan|bhakri|thepla|rice|noodles?|pasta|spaghetti|bread|toast|pav|couscous|upma|poha|idli|idlis|dosa|uttapam|tortillas?))\b/gi;
function isGrain(t){return GRAINW.test(String(t||"").replace(/[\u2018\u2019\u201C\u201D"']/g,"").replace(STANDIN," "));}
function wordRx(list){return new RegExp("\\b("+list.map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|")+")\\b","i");}
function badWords(p){
  var bad=[];
  if(p.diet!=="nonveg")bad=bad.concat(NONVEG);
  if(p.diet==="veg"||p.diet==="jain"||p.diet==="vegan")bad=bad.concat(EGGW);
  if(p.diet==="jain")bad=bad.concat(JAINW);
  if(p.diet==="vegan")bad=bad.concat(DAIRYW);
  (p.leave||[]).forEach(function(k){bad=bad.concat(LEAVEW[k]||[]);});
  if(p.health==="diabetes")bad=bad.concat(SWEETS);
  if(p.health==="bp")bad=bad.concat(SALTY);
  return bad;
}
var PLANT=/\b(coconut|almond|oat|soy|soya|rice|cashew|peanut)\s+(milk|curd|yogurt|yoghurt|cream|butter)\b/g;
function crosses(text,p){var b=badWords(p);return !!b.length&&wordRx(b).test(String(text).toLowerCase().replace(NEG," ").replace(PLANT,"$1 plant").replace(/\b(lemon|lime|nimbu|amla)\s+juice\b/g,"$1"));}
function supp(text){return wordRx(SUPPW).test(String(text).toLowerCase());}

/* ---------- cleaning ---------- */
/* The owner's banned words (handoff rule 13). Text the model writes in its own voice is dropped when it uses one; the prompts ask for
   none. Names the model copies from a menu or from what the person typed keep their words (quoted()). */
var BANW=["real","quiet","quietly","simply","seamlessly","effortlessly","exactly","just works","journey","unlock","empower","smart","magic","game-changer",
  "revolutionary","transform","curated","tailored","personalised","holistic","wellness journey"];
var BANRX=new RegExp("(^|[^a-z])("+BANW.concat(["seamless","effortless","journeys","unlocks","unlocking","empowers","empowering","magical","game changer",
  "transforms","transformed","transforming","transformative","personalized"]).map(function(w){return w.replace(/[\s-]/g,"[\\s-]");}).join("|")+")(?![a-z])","i");
function quoted(t,max){if(typeof t!=="string")return "";t=t.replace(EMO,"").replace(/!+/g,".").replace(/\s+/g," ").trim();return t.length>max?t.slice(0,max-1).replace(/\s+\S*$/,"")+"\u2026":t;}
function clean(t,max){t=quoted(t,max);return BANRX.test(t)?"":t;}
function voiceText(){return "- Plain, calm English in every field. Never use any of these words: "+BANW.join(", ")+".";}
function num(v,lo,hi){v=Math.round(+v);return isFinite(v)?Math.max(lo,Math.min(hi,v)):null;}
function delta(v,lo,hi){v=Math.round(+v);return isFinite(v)?Math.max(lo,Math.min(hi,v)):0;}
var GROUPS=["protein","greens","carbs","fats","other"];

/* ---------- the meal Gemini returns: [S] CURATED_MEALS + [P] MEALS_DB, in grams and kcal (D3) ---------- */
var ALCH=["protein","glucose","express","gut"];
var ALCHLABEL={protein:"More protein",glucose:"Gentler on sugar",express:"10-minute version",gut:"Easy on the gut"};
/* Validate one meal. Returns {meal} or {drop: reason}. */
function checkMeal(m,p){
  if(!m||typeof m!=="object")return {drop:"shape"};
  var title=clean(m.title,70),sub=clean(m.subtitle,120);
  if(!title)return {drop:"shape"};
  var items=(Array.isArray(m.items)?m.items:[]).slice(0,7).map(function(it){
    return {food:clean(it&&it.food,60),grams:num(it&&it.grams,1,800),group:GROUPS.indexOf(it&&it.group)>=0?it.group:"other"};
  }).filter(function(it){return it.food&&it.grams;});
  if(items.length<2)return {drop:"shape"};
  var all=title+" "+sub+" "+items.map(function(i){return i.food;}).join(" ");
  if(crosses(all,p))return {drop:"diet"};
  if(supp(all))return {drop:"supplement"};
  if(p.health==="diabetes"&&p.slot!=="snack"&&!items.some(function(i){return isGrain(i.food);}))return {drop:"diabetes-grain"};
  var n={kcal:num(m.kcal,40,2500),protein:num(m.protein,0,250),carbs:num(m.carbs,0,400),fats:num(m.fats,0,200),fiber:num(m.fiber,0,80)};
  if(n.kcal==null||n.protein==null||n.carbs==null||n.fats==null||n.fiber==null)return {drop:"numbers"};
  var est=4*n.protein+4*n.carbs+9*n.fats;
  if(Math.abs(est-n.kcal)/n.kcal>0.15)return {drop:"energy"};
  var why=(Array.isArray(m.why)?m.why:[]).slice(0,3).map(function(w){return {pair:clean(w&&w.pair,60),effect:clean(w&&w.effect,150)};})
    .filter(function(w){return w.pair&&w.effect&&!CLAIM.test(w.pair+" "+w.effect)&&!supp(w.pair+" "+w.effect);});
  function swapList(list,kind){return (Array.isArray(list)?list:[]).slice(0,3).map(function(s){
      return {food:clean(s&&s.food,60),grams:num(s&&s.grams,1,800),deltaKcal:delta(s&&s.deltaKcal,-400,400),deltaProtein:delta(s&&s.deltaProtein,-40,40),deltaCarbs:delta(s&&s.deltaCarbs,-80,80),deltaFats:delta(s&&s.deltaFats,-40,40),deltaFiber:delta(s&&s.deltaFiber,-20,20)};})
    .filter(function(s){return s.food&&!crosses(s.food,p)&&!supp(s.food)&&
      /* rule 3: with diabetes a base swap is a whole grain or millet, so no tap takes the grain off the plate */
      !(kind==="base"&&p.health==="diabetes"&&p.slot!=="snack"&&!isGrain(s.food));});}
  var sw=m.swaps||{},swaps={protein:swapList(sw.protein,"protein"),base:swapList(sw.base,"base")};
  var al={},am=m.alchemy||{};
  ALCH.forEach(function(k){var a=am[k];if(!a||typeof a!=="object")return;
    var x={suffix:clean(a.titleSuffix,50),note:clean(a.note,140),deltaKcal:delta(a.deltaKcal,-400,400),deltaProtein:delta(a.deltaProtein,-10,40),deltaCarbs:delta(a.deltaCarbs,-80,40),deltaFats:delta(a.deltaFats,-30,30),deltaFiber:delta(a.deltaFiber,-10,20),minutes:a.minutes==null?null:num(a.minutes,0,180)};
    var txt=x.suffix+" "+x.note;
    if(!x.note||!x.suffix||crosses(txt,p)||supp(txt)||CLAIM.test(txt))return;
    if(p.health==="diabetes"&&k==="glucose"&&/\b(no|skip|remove|drop|without)\b[^.]*\b(rice|roti|grain|millet|carb)/i.test(x.note))return;
    al[k]=x;});
  return {meal:{title:title,subtitle:sub,cuisine:clean(m.cuisine,40),minutes:num(m.prepMinutes,0,180)||0,items:items,
    kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,why:why,swaps:swaps,alchemy:al}};
}
/* Validate a whole reply. Returns {status, read, meals, dropped:{reason:count}} */
function checkReply(r,p){
  var out={status:"ok",read:"",meals:[],dropped:{}};
  if(!r||typeof r!=="object"){out.status="error";return out;}
  if(r.status==="refer"){out.status="refer";out.read=clean(r.refer,200)||SAFETY;if(CLAIM.test(out.read)||supp(out.read))out.read=SAFETY;return out;}
  out.read=clean(r.read,200);if(CLAIM.test(out.read)||supp(out.read)||crosses(out.read,p))out.read="";
  (Array.isArray(r.meals)?r.meals:[]).slice(0,4).forEach(function(m){var c=checkMeal(m,p);if(c.meal)out.meals.push(c.meal);else out.dropped[c.drop]=(out.dropped[c.drop]||0)+1;});
  if(!out.meals.length)out.status="empty";
  return out;
}

/* ---------- Rescue ([S] DELIVERY_DISHES) ---------- */
var HACKKIND=["sequence","portion","swap","order","move"];
function checkRescue(r,p){
  if(!r||typeof r!=="object")return {status:"error"};
  if(r.status==="refer")return {status:"refer",read:SAFETY};
  var d=r.dish||{},n={kcal:num(d.kcal,40,4000),protein:num(d.protein,0,300),carbs:num(d.carbs,0,500),fats:num(d.fats,0,300),fiber:num(d.fiber,0,80)};
  if(n.kcal==null||n.protein==null||n.carbs==null||n.fats==null||n.fiber==null||!quoted(d.name,80))return {status:"empty"};
  var hacks=(Array.isArray(r.hacks)?r.hacks:[]).slice(0,4).map(function(h){
    return {title:clean(h&&h.title,80),kind:HACKKIND.indexOf(h&&h.kind)>=0?h.kind:"portion",deltaKcal:delta(h&&h.deltaKcal,-1500,300),deltaProtein:delta(h&&h.deltaProtein,-60,40),deltaCarbs:delta(h&&h.deltaCarbs,-300,60),deltaFats:delta(h&&h.deltaFats,-150,30),deltaFiber:delta(h&&h.deltaFiber,-10,20)};})
    .filter(function(h){return h.title&&!supp(h.title)&&!CLAIM.test(h.title)&&!crosses(h.title,p);});
  if(!hacks.length)return {status:"empty"};
  var warn=clean(d.warning,80),br=clean(d.breakdown,180);if(CLAIM.test(warn)||supp(warn))warn="";if(CLAIM.test(br)||supp(br))br="";
  return {status:"ok",dish:{name:quoted(d.name,80),portion:clean(d.portion,60),kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,warning:warn,breakdown:br},hacks:hacks};
}

/* ---------- prompts. Built only from validated fields; the server builds them itself ---------- */
function rulesText(p){
  return [
"HARD RULES",
"- Diet is absolute: "+lab("diet",p.diet)+(p.diet==="jain"?" (no egg, meat, fish, onion, garlic, ginger or root vegetables)":p.diet==="vegan"?" (no dairy, egg, meat or fish)":p.diet==="veg"?" (no egg, meat or fish)":p.diet==="egg"?" (eggs allowed; no meat or fish)":"")+".",
"- Never use: "+((p.leave||[]).length?p.leave.map(function(k){return lab("leave",k).toLowerCase();}).join(", "):"(no extra exclusions)")+".",
p.health==="diabetes"?"- Diabetes: every breakfast, lunch and dinner lists a measured whole-grain or millet item of its own (roti, rice, millet, dalia, oats, poha, idli or dosa), paired with protein and fibre. If the targets pull against each other, the grain stays and protein may fall a few grams short. No sweets, juice, sugar, honey or jaggery.":null,
p.health==="bp"?"- High blood pressure: no pickle, papad, namkeen, chips or added salt.":null,
"- No supplements, powders, capsules, tablets or doses of any kind (no whey, protein powder, psyllium, collagen, creatine, magnesium). Whole food only.",
"- No percentages, no blood-sugar numbers, no mg/dL, no medical or treatment claims, no promised weight change. Do not mention mTOR, leucine, insulin, cortisol or inflammation.",
"- No exclamation marks, no emojis, no hype words.",
voiceText(),
"- All numbers are your honest estimates for the portion as served: grams of each item (cooked weight; ml for liquids written as grams), kcal, and grams of protein, carbs, fats and fibre. kcal must roughly equal 4 x protein + 4 x carbs + 9 x fats."
  ].filter(function(x){return x!==null;}).join("\n");
}
function profileText(p,c){
  return [
"THE PERSON",
"- "+(p.age?p.age+" years, ":"")+(p.sex==="m"?"male":p.sex==="f"?"female":"")+(p.kg?", "+p.kg+" kg":"")+(p.act?", "+lab("act",p.act).toLowerCase():""),
"- Eats: "+lab("diet",p.diet)+". Home food: "+lab("region",p.region)+" Indian.",
"- Health flag: "+(p.health==="none"?"none":lab("health",p.health)),
c?"- Today is "+MODEFOCUS[c.mode]+".":null
  ].filter(function(x){return x!==null;}).join("\n");
}
function buildMealPrompt(p,c){
  var t=c.target;
  return [
"You are the dietitian inside Next Plate, a pocket-dietitian app. You plan the person's next meal in everyday food, with honest numbers.",
"",
profileText(p,c),
"",
"THIS MEAL",
"- Meal: "+lab("meal",c.meal)+" (their local time "+c.time+")",
t?"- Target for this meal: about "+t.kcal+" kcal and at least "+t.protein+" g protein.":"- No calorie target set; keep portions moderate for an adult.",
"- Appetite: "+c.appetite+" of 10.",
"- Mood: "+lab("mood",c.mood)+". Cuisine: "+lab("cuisine",c.cuisine)+(c.cuisine==="indian"?" ("+lab("region",p.region)+" Indian home style first, other Indian regions welcome)":"")+".",
"- "+lab("prep",c.prep)+", "+lab("oil",c.oil).toLowerCase()+".",
c.ratio?"- Plate ratio by volume they asked for: protein "+c.ratio.protein+"%, vegetables and greens "+c.ratio.greens+"%, carbohydrate "+c.ratio.carbs+"%, fats "+c.ratio.fats+"%.":null,
c.had&&c.had.length?"- Already eaten today: "+c.had.join("; ")+". Do not repeat these; balance them.":null,
c.text?"- They wrote: \""+c.text+"\". Answer that with the meals. If it is a craving or a named dish, meal 1 is that food made to fit; meal 2 is a lighter cousin.":null,
"",
rulesText(p),
"- If they ask about symptoms, medicines, lab reports, pregnancy, kidney disease, eating disorders or a child's diet, or anything that is not what to eat, return status \"refer\" with one sentence sending them to their coach or doctor, and no meals.",
"",
"WHAT TO RETURN",
"- status \"ok\", a one-sentence \"read\" of the situation (at most 28 words), and 3 meals (no more, no fewer), best first, clearly different from each other.",
"- Each meal: title (at most 8 words), subtitle (what is in it, at most 18 words), cuisine (2 to 4 words), prepMinutes (0 if ordered or ready), 3 to 6 items each with food, grams and group (protein, greens, carbs, fats or other), kcal, protein, carbs, fats, fiber.",
"- why: 2 short food-pairing reasons, each a pair (e.g. \"Lemon + spinach\") and a plain effect (at most 20 words, no numbers).",
"- swaps.protein: 3 options for the main protein, each with its own grams; the first is the one already in the meal with all deltas 0. swaps.base: 2 or 3 options for the carbohydrate base, each with its own grams, the first being the current one with deltas 0. With diabetes every base option is a whole grain or millet, with its grams. Deltas are the change in kcal and grams versus the meal as written.",
"- alchemy: four one-tap changes to this exact meal, each with titleSuffix (at most 6 words, starting with + or a bracket), note (what changes, at most 22 words), minutes (new prep time) and deltas versus the meal as written:",
"  protein = add about 12 to 18 g protein with everyday food; glucose = gentler on blood sugar (more vegetables or legumes, less refined starch"+(p.health==="diabetes"?", but keep the grain portion":"")+"); express = a 10-minute version; gut = easier to digest (less chilli and oil, fermented or cooling sides).",
  ].filter(function(x){return x!==null;}).join("\n");
}
function buildRescuePrompt(p,c){
  return [
"You are the dietitian inside Next Plate. The person is eating out or ordering in. Take the dish as it is usually served and give the few moves that make it fit their day.",
"",
profileText(p,null),
"",
"THE DISH",
"- \""+c.text+"\""+(c.photo?" (a photo of the menu or plate is attached: use only dishes you can read or see)":""),
c.target?"- Their target for this meal: about "+c.target.kcal+" kcal and at least "+c.target.protein+" g protein.":null,
"",
rulesText(p),
"- If this is not food, or asks about symptoms or medicines, return status \"refer\".",
"",
"WHAT TO RETURN",
"- status \"ok\" and dish: name, portion (as usually served, at most 8 words), kcal, protein, carbs, fats, fiber, warning (at most 8 words: what makes it heavy), breakdown (one plain sentence, at most 26 words, no numbers).",
"- hacks: 3 or 4 practical moves, best first. Each: title (at most 12 words), kind (sequence = eat something first; portion = leave part of it; swap = trade one item; order = ask for it differently; move = a walk after), and deltas in kcal and grams versus the dish as served (0 when the move changes order, not food).",
"- Each move stands on its own and can be combined with the others: never give two moves that change the same item (not both \"eat one bhatura\" and \"swap the bhature for rotis\"). Together they must still leave a full meal.",
"- Moves are food, ordering, eating order or a walk only. Never a supplement, powder, husk or drink mix."
  ].filter(function(x){return x!==null;}).join("\n");
}

/* ---------- JSON schemas for Gemini (responseSchema, OpenAPI subset) ---------- */
var SCH=(function(){
  var I={type:"INTEGER"},S={type:"STRING"};
  function obj(props,req,order){return {type:"OBJECT",properties:props,required:req||Object.keys(props),propertyOrdering:order||Object.keys(props)};}
  var deltas={deltaKcal:I,deltaProtein:I,deltaCarbs:I,deltaFats:I,deltaFiber:I};
  function withD(extra){var o={};for(var k in extra)o[k]=extra[k];for(var d in deltas)o[d]=deltas[d];return o;}
  var alch=obj(withD({titleSuffix:S,note:S,minutes:I}));
  var meal=obj({title:S,subtitle:S,cuisine:S,prepMinutes:I,
    items:{type:"ARRAY",items:obj({food:S,grams:I,group:{type:"STRING",enum:GROUPS}})},
    kcal:I,protein:I,carbs:I,fats:I,fiber:I,
    why:{type:"ARRAY",items:obj({pair:S,effect:S})},
    swaps:obj({protein:{type:"ARRAY",items:obj(withD({food:S,grams:I}))},base:{type:"ARRAY",items:obj(withD({food:S,grams:I}))}}),
    alchemy:obj({protein:alch,glucose:alch,express:alch,gut:alch})});
  return {
    meals:obj({status:{type:"STRING",enum:["ok","refer"]},read:S,refer:S,meals:{type:"ARRAY",items:meal}},["status"],["status","read","refer","meals"]),
    rescue:obj({status:{type:"STRING",enum:["ok","refer"]},dish:obj({name:S,portion:S,kcal:I,protein:I,carbs:I,fats:I,fiber:I,warning:S,breakdown:S}),
      hacks:{type:"ARRAY",items:obj(withD({title:S,kind:{type:"STRING",enum:HACKKIND}}))}},["status"],["status","dish","hacks"])
  };
})();

/* ---------- request validation (server side; the page sends only these fields) ---------- */
function okOpt(k,v){return typeof v==="string"&&OPT[k].some(function(o){return o[0]===v;});}
function plainText(v,max){return typeof v==="string"?v.replace(/[\r\n"\\]+/g," ").replace(/\s+/g," ").trim().slice(0,max):"";}
function readProfile(x){
  if(!x||typeof x!=="object")return null;
  if(!okOpt("diet",x.diet)||!okOpt("health",x.health)||!okOpt("region",x.region))return null;
  var p={diet:x.diet,health:x.health,region:x.region,leave:Array.isArray(x.leave)?x.leave.filter(function(k){return okOpt("leave",k);}).slice(0,4):[],
    sex:okOpt("sex",x.sex)?x.sex:"",act:okOpt("act",x.act)?x.act:"",age:num(x.age,16,95)||0,cm:num(x.cm,120,215)||0,kg:num(x.kg,30,200)||0};
  return p;
}
function readCtx(x,kind){
  if(!x||typeof x!=="object")return null;
  var c={meal:okOpt("meal",x.meal)?x.meal:"lunch",time:/^\d{1,2}:\d{2} (am|pm)$/.test(x.time)?x.time:"unknown",text:plainText(x.text,240),photo:false};
  if(kind==="rescue"){if(!c.text&&!x.photo)return null;return c;}
  c.mode=okOpt("mode",x.mode)?x.mode:"focus";c.mood=okOpt("mood",x.mood)?x.mood:"best";c.cuisine=okOpt("cuisine",x.cuisine)?x.cuisine:"indian";
  c.prep=okOpt("prep",x.prep)?x.prep:"home";c.oil=okOpt("oil",x.oil)?x.oil:"min";c.appetite=num(x.appetite,1,10)||5;
  c.had=Array.isArray(x.had)?x.had.slice(0,4).map(function(t){return plainText(t,80);}).filter(Boolean):[];
  var r=x.ratio;if(r&&typeof r==="object"){var q={protein:num(r.protein,5,70),greens:num(r.greens,5,70),carbs:num(r.carbs,5,70),fats:num(r.fats,5,40)};
    if(q.protein&&q.greens&&q.carbs&&q.fats&&Math.abs(q.protein+q.greens+q.carbs+q.fats-100)<=2)c.ratio=q;}
  return c;
}

/* ---------- one entry point for the server: the server holds the key and the limits, the core holds the thinking ----------
   plan(kind, body) -> {error} | {reply} (answered without the model) | {prompt, schema, image, check(data)} */
var KINDS=["meals","rescue"];
function plan(kind,body){
  var p=readProfile(body&&body.profile),c=readCtx(body&&body.ctx,kind);
  if(!p||!c)return {error:"bad_request"};
  /* kidney condition and pregnancy never reach the model (D7) */
  if(p.health==="kidney"||p.health==="preg")return {reply:{status:"refer",read:SAFETY,meals:[]}};
  c.target=mealTargets(dayTargets(p),c.meal,c.appetite||5);
  if(kind==="meals")return {prompt:buildMealPrompt(p,c),schema:SCH.meals,image:false,check:function(d){return checkReply(d,p);}};
  if(kind==="rescue"){c.photo=!!(body&&body.image);return {prompt:buildRescuePrompt(p,c),schema:SCH.rescue,image:true,check:function(d){return checkRescue(d,p);}};}
  return {error:"bad_request"};
}
