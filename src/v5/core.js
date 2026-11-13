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

/* ---------- the grain test (owner rule 3: with diabetes the grain stays). Critic rounds 6 to 10.
   Rounds 6 to 9 listed the ways a grain-free plate can be named, and each round found another. From round 10 a grain is identified, not
   guessed: a name counts as a grain only when every word in it is a known grain or grain-dish word, an amount, a way of cooking, or a known
   companion of a grain dish (GRAINT, COMPT), with no stand-in (STAND) in it. An unknown word means "not shown to be a grain", the safe way.
   A grain named as left out ("no naan", "rice skipped", "instead of rice") leaves only a plain grain able to count; "-free" and "-less" mark
   a stand-in; a grain word naming a spice mix, sauce or style ("idli podi", "biryani-spiced") is not a grain. The word lists come from the
   recorded live replies in eval/ and the Critic's probes; on the 477 recorded live meals no plate that holds a grain serving is lost.
   removesGrain() reads what a "skip", "avoid", "not", "instead of" or "only" applies to, for one-tap changes and menu portions. ---------- */
var GRAINW=/\b(?:roti|rice|millet|jowar|bajra|ragi|oats|dalia|quinoa|bread|poha|upma|idli|dosa|naan|paratha|phulka|chapati|khichdi|pulao|biryani|pasta|noodles)\b/i;   /* kept for the prompts' wording only */
/* Round 10 candidate: a grain is identified, not guessed. Every word of the name must be a known grain or grain-dish word, an amount,
   a way of cooking, or a known companion of a grain dish; an unknown word means "not shown to be a grain". */
var GRAINT="roti|rotis|rotti|rotla|rotlas|phulka|phulkas|chapati|chapatis|chapathi|chapathis|chappati|chapatti|paratha|parathas|parantha|paranthas|parotta|parottas|thepla|theplas|bhakri|bhakris|naan|naans|kulcha|kulchas|kulche|rice|basmati|chawal|bhaat|bhat|sadam|pulao|pulav|pulaw|khichdi|khichri|kichdi|khichadi|biryani|biriyani|briyani|millet|millets|jowar|jolada|bajra|bajre|bajri|ragi|nachni|foxtail|kodo|kutki|quinoa|dalia|daliya|oats|oat|oatmeal|poha|pohe|upma|uppittu|idli|idlis|idly|idlies|dosa|dosas|dosai|uttapam|uttapams|uthappam|uthappams|bread|breads|toast|pav|bun|buns|noodles|noodle|pasta|spaghetti|penne|macaroni|soba|farro|freekeh|bulgur|couscous|orzo|polenta|rava|sooji|suji|semolina|vermicelli|sevai|barley|amaranth|rajgira|makki|maize|corn|mudde|appam|appams|puttu|pongal|thalipeeth|puri|puris|poori|pooris|luchi|bhatura|bhature|idiyappam|bisibelebath|puliyogare|sorghum|rye|buckwheat|kuttu|samak|sama|samai|varagu|thinai|kambu|moraiyo|samvat|wholemeal|wholewheat|wheat|atta|maida|muthia|muthiya|adai|pathiri|kozhukattai|paniyaram|handvo|litti|baati|khakhra|sandwich|sandwiches|wrap|roll|frankie|muesli|granola|cornflakes|thukpa|dabeli|pizza|flatbread|pita|sourdough|cracker|crackers|porridge|malt|satva|ambli|koozh|sattu|murmura|flattened|grain|grains|multigrain|tortilla|tortillas|cereal|ravioli|lasagne|risotto|gnocchi|bath|neer|burger|burgers|sub|subs|toasts";
var GRAIN_RX=new RegExp("^(?:"+GRAINT+")$");
/* the other words a grain dish is named with: amounts, kinds, ways of cooking, and the companions of Indian grain dishes */
var COMPT="a|an|the|of|and|with|on|in|for|into|from|style|ki|ka|ke|bhaji|\\d+|one|two|three|four|five|half|small|medium|large|thin|thick|soft|single|portion|portions|cup|cups|bowl|bowls|katori|plate|g|gm|grams?|ml|pieces?|slices?|serving|servings|fingers|sheet|"+
  "brown|red|white|black|whole|hand|pounded|unpolished|parboiled|polished|sona|masoori|matta|jeera|plain|steamed|boiled|cooked|roasted|toasted|baked|tawa|tava|tandoori|missi|pearl|finger|little|barnyard|proso|broken|rolled|steel|cut|cracked|pearled|puffed|sprouted|instant|homemade|handmade|fresh|warm|hot|dry|light|lightly|minimal|oil|ghee|butter|garlic|cheese|egg|eggs|paneer|stuffed|filled|"+
  "veg|vegetable|vegetables|mixed|masala|lemon|curd|thayir|tomato|tamarind|coconut|onion|kanda|aloo|potato|gobi|cauliflower|methi|fenugreek|palak|spinach|mooli|radish|matar|peas|pea|carrot|carrots|beans|cabbage|capsicum|lauki|bottle|gourd|dudhi|sweet|corn|"+
  "dal|dhal|moong|mung|toor|tuvar|masoor|urad|chana|rajma|chole|kadhi|sambar|rasam|chutney|raita|sabzi|sabji|bhurji|chokha|maska|kathi|kerala|kothu|vangi|onion|akki|jowar|"+
  "chicken|mutton|fish|prawn|prawns|keema|soya|chunks|tofu|chickpea|chickpeas|sabudana|hyderabadi|lucknowi|dum|hakka|fried|schezwan|arrabbiata|pesto|tikka|dhaba|punjabi|south|indian|kerala|mumbai|"+
  "but|or|plus|alongside|side|only|extra|added|more|salad|besan|flax|flaxseed|flaxseeds|doodhi|zucchini|broccoli|bisi|bele|made|from|flour|green|cumin|spiced|sauteed|leaves|stewed|cubes|yellow|ajwain|roomali|rumali|fine|finely|chopped|diced|sliced|aromatic|puffs|light|low|fat|soaked|crumbled|savory|savoury|split|kernels|pocket|bed|crepe|crisps|flakes|chilla|cheela|kala|kabuli|gram|sprouts|mint|coriander|ginger|curry|unfried|blend|bhel|batter|into|nos|pre|premade|ready|store|bought|aglio|olio|alfredo|marinara|primavera|margherita|farmhouse|club|grilled|amritsari|kashmiri|peshawari|lachha|laccha|rumali|kadai|kadhai|makhani|jeera|tadka|butter|dal|bowl";
var COMP_RX=new RegExp("^(?:"+COMPT+")$");
/* a grain word naming a spice mix, sauce, condiment or style is not a grain ("idli podi", "biryani-spiced", "pulao-style") */
var CONDI=new RegExp("\\b(?:"+GRAINT+")(?:\\s+[a-z]+)?[\\s-]+(?:masala|sauce|podi|powder|seasoning|spices?|spiced|style|flavou?red|chutney|papad|spread|crust|crusted|crumbs?|crumbed|batter|vinegar|bran|paper|starch|water|wine|kanji|husk)\\b","gi");
/* negation: what follows "no", "without", "instead of" ... up to the next comma, or what precedes "skipped", "optional", "-free", "-less" */
var NEGPRE=/\b(?:no|not|without|minus|sans|except|avoid|avoiding|skip|skipping|hold|omit|omitting|drop|dropping|remove|removing|exclude|excluding|instead\s+of|in\s+place\s+of|rather\s+than|swap\s+out|leave\s+out|zero)\b([^,;.()]*?)(?=\s+but\b|[,;.()]|$)/gi;
var NEGPOST=/\b([a-z]+)[\s-]+(?:skipped|avoided|omitted|removed|dropped|excluded|optional)\b/gi;   /* "-free" and "-less" are stand-ins (STAND), not left-out words */
var STANDF=[
  "\\briced\\s+[a-z]+",
  "\\b(?:cauli(?:flower)?|broccoli|cabbage|turnip|radish|mooli|daikon|konjac|mushroom|mushrooms|lentil|lentils)(?:[\\s-]+as)?[\\s-]+(?:fried[\\s-]+)?rice\\b",
  "\\b(?:cauli(?:flower)?|broccoli|zucchini|courgette|cabbage|kelp|palmini|lettuce|lauki|doodhi|dudhi|bottle\\s+gourd|carrots?|beetroot|beets?|cucumber|daikon|mooli|radish|turnip|squash|potato|sweet\\s+potato|tofu|paneer|egg[\\s-]+white|glass|mung\\s+bean|cellophane|shirataki|konjac|kelp)[\\s-]+(?:noodles?|pasta|spaghetti|couscous|crust)\\b",
  "\\b(?:cauli(?:flower)?|broccoli|zucchini|courgette|cabbage|lauki)[\\s-]+(?:roti|rotis|chapati|chapatis|naan|bread|tortillas?|pizza|upma|poha|couscous)\\b",
  "\\b(?:gram|chana|besan|soy|soya|moong|masoor|chickpea|almond|coconut|flax(?:seed)?|lupin|psyllium|arrowroot|singhara|singhare|water\\s+chestnut)[\\s-]+(?:flour|atta|meal|ki|ka|ke)[\\s-]+(?:roti|rotis|bread|chapati|paratha|puri|naan|dosa|pizza)\\b",
  "\\b(?:moong|mung|masoor|chana|urad|lentil|red\\s+lentil|chickpea|besan|green\\s+pea|pea|soy(?:bean|a)?|black\\s+bean|bean|edamame|lupin[ie]?)(?:\\s+dal)?(?:[\\s-]+(?:flour|based))?[\\s-]+(?:pasta|noodles?|spaghetti|penne|fusilli|dosa|idli)\\b",
  "\\b(?:almond|coconut|chia|seed|psyllium|lupin|cloud|oopsie|fathead|keto|besan|arrowroot|singhara|singhare|water\\s+chestnut|makhana|sago|tapioca|flax(?:seed)?)[\\s-]+(?:roti|rotis|bread|pizza|toast|wraps?|tortillas?)\\b",
  "\\b(?:konjac|shirataki|keto|low[\\s-]?carb|zero[\\s-]?carb|no[\\s-]?carb|no[\\s-]?grain|miracle|singhara|singhare|water\\s+chestnut|arrowroot|vrat|glucomannan|spirali[sz]ed|sabudana|sago|tapioca|makhana)\\b",
  "\\b(?:"+GRAINT+"|carb|carbs|gluten)[\\s-]?(?:free|less)\\b|\\b(?:rice|grain|carb|wheat|atta)less\\b",
  "\\btofu[\\s-]+rice\\b|\\bsweet\\s+potato[\\s-]+(?:roti|rotis|bread|paratha|puri)\\b",
  "\\bmade\\s+(?:with|from|of|using)\\s+(?:grated\\s+|riced\\s+)?(?:cauli(?:flower)?|broccoli|zucchini|konjac|shirataki|sabudana|sago|tapioca|singhara|singhare|water\\s+chestnut|almonds?|coconut|flax(?:seed)?s?|chickpeas?|lentils?|besan|chana|moong|mung|masoor|soy(?:bean|a)?s?|peas?|lupin[ie]?|psyllium|arrowroot|makhana|paneer|tofu|eggs?|cheese|potato|sweet\\s+potato|lauki|bottle\\s+gourd|nuts?|seeds?)\\b",
  "\\b(?:chickpea|lentil|legume|soy|soya|bean|pea|nut|almond|coconut|cauliflower|vegetable|veggie|protein|egg|paneer|tofu)[\\s-]+based\\b"
];
var STAND=new RegExp(STANDF.join("|"),"i");
var STANDN=new RegExp(STANDF.join("|").replace("|singhara|singhare|water\\s+chestnut|arrowroot|vrat|glucomannan|spirali[sz]ed|sabudana|sago|tapioca|makhana)","|glucomannan|spirali[sz]ed)"),"i");   /* for one-tap notes: makhana or sabudana named in passing is not a stand-in */
var CORE=/^(?:\d+|one|two|three|four|half|a|an|the|of|small|medium|large|thin|cup|cups|bowl|katori|g|grams?|pieces?|slices?|cooked|steamed|boiled|plain|brown|red|black|white|whole|wheat|wholemeal|multigrain|atta|hand|pounded|unpolished|parboiled|basmati|sona|masoori|matta|jeera|tawa|tandoori|missi|makki|ki|ka|jowar|bajra|bajre|ragi|nachni|foxtail|kodo|little|barnyard|proso|kutki|samak|sama|samai|varagu|thinai|kambu|rajgira|kuttu|millet|millets|broken|rolled|steel|cut|oats|oat|dalia|daliya|quinoa|amaranth|sorghum|pearl|finger|rye|barley|buckwheat|soba|roti|rotis|rotti|phulka|phulkas|chapati|chapatis|chapathi|bhakri|rice|chawal|bread|toast|thepla|paratha|parathas|naan|kulcha|couscous|farro|freekeh|bulgur)$/i;
function words(s){return s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(" ").filter(Boolean);}
function known(part){var w=words(part);return w.length>0&&w.every(function(x){return GRAIN_RX.test(x)||COMP_RX.test(x);})&&w.some(function(x){return GRAIN_RX.test(x)&&!/^(?:wheat|atta|maida|corn|grain|grains|multigrain|flattened|sattu|style|cereal)$/.test(x)||/^(?:wheat|atta|maize)$/.test(x)&&w.length>1;});}   /* corn alone is eaten as a vegetable; it counts in makki roti, polenta, cornflakes */
var DISHW=/^(?:khichdi|pulao|poha|idli|idlis|dosa|pasta|noodles)$/;
function plain(part,dish){var w=words(part);return w.length>0&&w.every(function(x){return CORE.test(x)||(dish&&DISHW.test(x));})&&w.some(function(x){return GRAIN_RX.test(x)&&!/^(?:wheat|atta|grain|grains|multigrain)$/.test(x);});}
function isGrain(t){
  var s=" "+String(t||"").replace(/[‘’“”"']/g,"").replace(/[()\[\]]/g," ")+" ";
  s=s.replace(CONDI," ");
  var lost=false,stand0=STAND.test(s);   /* "atta-free", "grain-free" are read before the negations are taken out */
  s=s.replace(NEGPRE,function(m,obj){if(words(obj).some(function(x){return GRAIN_RX.test(x);}))lost=true;return " , ";});
  s=s.replace(NEGPOST,function(m,a){if(GRAIN_RX.test(a.toLowerCase()))lost=true;return " , ";});
  var stand=stand0||STAND.test(s);
  if(!lost&&/\bmade\s+(?:with|from|of|using)\b[^.;]*\b(?:whole[\s-]+wheat|wheat|atta|jowar|bajra|ragi|nachni|makki|maize|rice\s+flour|oats?|maida|multigrain|millets?|barley|rye)\b/i.test(s))return true;
  var parts=s.split(/\s+(?:and|or|plus|but|with)\s+|[,;+&\/]/);
  if(!stand&&!lost)return parts.some(known)||known(s);
  /* a stand-in is named or a grain is left out: only a plain grain on its own counts */
  var comps=s.split(/\s+(?:and|or|plus|but)\s+|[,;+&\/]/);
  return comps.some(function(c){if(!STAND.test(c))return plain(c,true);return c.split(/\s+with\s+/).some(function(x){return !STAND.test(x)&&plain(x,false);});});
}
/* What a "skip", "avoid", "not", "instead of" ... applies to: the words after it, up to a preposition, a comma or a conjunction.
   removesGrain(text) is true when such a phrase takes a grain off and nothing that is a grain takes its place. */
var STOPW=/^(?:the|a|an|any|your|all|extra|added|some|this|that|those|these|its|their|it|of)$/;
var BREAKW=/^(?:on|in|for|with|from|to|at|over|into|and|or|but|so|then|if|while|as|by|until|tonight|today|entirely|completely|altogether)$/;
var REMV=/\b(no|not|never|without|skip|skipping|skips|avoid|avoiding|drop|dropping|remove|removing|omit|omitting|leave|ditch|forgo|minus|sans|exclude|excluding|hold|cut|cut\s+out|pass\s+on|give\s+up|do\s+without|go\s+without|set|save|pack|keep|rather\s+than|instead\s+of|in\s+place\s+of|swap|swapping|replace|replacing|exchange|trade|switch)\b/gi;
var AWAYW=/\b(?:aside|away|out|for\s+later|for\s+tomorrow|for\s+lunch|for\s+dinner|for\s+another|to\s+go|on\s+the\s+side)\b/;   /* set, save, pack, keep take a grain off only with one of these */
function hasGrainWord(x){var w=words(x);return w.some(function(v,i){return GRAIN_RX.test(v)&&!(v==="corn"&&!/^(?:roti|flour|atta)$/.test(w[i+1]||""));});}   /* sweet corn is a vegetable here */
function objectAfter(rest){var w=words(rest),out=[];for(var i=0;i<w.length&&out.length<3;i++){if(STOPW.test(w[i])&&!out.length)continue;if(BREAKW.test(w[i])||STOPW.test(w[i]))break;out.push(w[i]);}return out.join(" ");}
function grainTarget(x){x=String(x||"").replace(/^\s*(?:then\s+)?(?:use|have|eat|serve|take|add|choose|pick|try|go\s+for|opt\s+for)\b/i,"");return isGrain(x);}
function removesGrain(text){
  var t=String(text||"").toLowerCase().replace(/[\u2018\u2019\u201C\u201D"']/g,""),m,re=new RegExp(REMV.source,"gi");
  /* "paneer and palak only", "on their own", "order only paneer tikka": the grain is left out; "seasoned only with cumin", "only 1 tsp ghee" are not */
  var SEASON="(?:season\\w*|spic\\w*|temper\\w*|flavou?r\\w*|tadka|cumin|jeera|hing|asafoetida|salt|turmeric|pepper|ginger|garlic|chilli\\w*|herbs?|masala|coriander|mint|lemon|oil|ghee|butter)";
  if(/\bonly\b/.test(t)&&!new RegExp("\\bonly\\s+(?:\\d|one|a\\s+little|half|lightly|mild|of)\\b|\\b(?:using|made|keeping)\\s+only\\b|\\b"+SEASON+"\\b(?:\\s+(?:and|with|,)?\\s*[a-z]+){0,3}\\s+only\\b|\\bonly\\s+(?:with\\s+|using\\s+)?(?:[a-z]+\\s+){0,2}"+SEASON+"\\b").test(t))return true;
  if(/\bon\s+(?:their|its)\s+own\b|\bby\s+itself\b/.test(t))return true;
  /* "rice not included", "rice excluded", "rice optional", "rice on the side for later" */
  if(new RegExp("\\b(?:"+GRAINT+")\\b[^.;,]{0,20}\\b(?:not\\s+included|excluded|left\\s+out|skipped|optional|avoided|omitted)\\b").test(t))return true;
  while((m=re.exec(t))){
    var v=m[1].replace(/\s+/g," "),after=t.slice(m.index+m[0].length),clause=after.split(/[.;,]/)[0];
    var obj=objectAfter(clause.replace(/\b(?:out|aside|away)\b/," "));
    if(/^(?:it|them|that|this)$/.test(obj.split(" ")[0])&&hasGrainWord(t.slice(0,m.index))&&!/^(?:keep|set|save|pack|hold|cut)$/.test(v))return true;   /* "skip it" after a grain is named */
    if(!hasGrainWord(obj))continue;
    if(/^(?:set|save|pack|keep|hold)$/.test(v)&&!AWAYW.test(clause))continue;          /* "keep the roti warm" is not a removal */
    if(v==="cut"&&/\b(?:to|by|down|half|third|quarter|portion|serving|back)\b/.test(clause))continue;   /* "cut rice to 70 g" makes less, it does not take the grain off */
    if(/^(?:swap|swapping|replace|replacing|exchange|trade|switch)$/.test(v)){var tg=/\b(?:for|with|to|into)\b([^.;]*)/.exec(clause);if(tg&&grainTarget(tg[1].split(/\b(?:then|if)\b/)[0])&&!/\b(?:then\s+)?(?:skip|drop|avoid|leave)\s+(?:it|them)\b/.test(t))continue;return true;}
    if(/^(?:rather than|instead of|in place of)$/.test(v)){var before=t.slice(0,m.index).split(/[.;]/).pop();if(grainTarget(before))continue;return true;}
    return true;}
  return false;
}

/* a one-tap change keeps the grain: it names no stand-in, leaves at least half the plate's carbs, and takes no grain off */
function keepsGrain(txt,carbs,dc){return !STANDN.test(txt)&&!(carbs!=null&&dc!=null&&carbs+dc<carbs*0.5)&&!removesGrain(txt);}
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
   none. Dish names the model copies letter for letter from a menu keep their words (quoted(), checked against the typed menu); a name the
   model writes for what the person typed keeps a word only when the person typed it (own()). */
var BANW=["real","quiet","quietly","simply","seamlessly","effortlessly","exactly","just works","journey","unlock","empower","smart","magic","game-changer",
  "revolutionary","transform","curated","tailored","personalised","holistic","wellness journey"];
/* each of the owner's words with the forms it takes in a sentence (comparatives, adverbs, past tenses, nouns) */
var BANFORMS=["real(?:ness)?","quiet(?:er|est|ly|ness)?","simply","seamless\\w*","effortless\\w*","exactly","just[\\s-]works","journey\\w*","unlock\\w*",
  "empower\\w*","smart(?:er|est|ly|ness|s)?","magic(?:al|ally)?","game[\\s-]?chang\\w*","revolutionary","transform\\w*",
  "curat\\w*","tailor\\w*","personali[sz]\\w*","holistic\\w*","wellness[\\s-]journeys?"];
var BANRX=new RegExp("(^|[^a-z])("+BANFORMS.join("|")+")(?![a-z])","i");
function quoted(t,max){if(typeof t!=="string")return "";t=t.replace(EMO,"").replace(/!+/g,".").replace(/\s+/g," ").trim();return t.length>max?t.slice(0,max-1).replace(/\s+\S*$/,"")+"\u2026":t;}
function clean(t,max){t=quoted(t,max);return BANRX.test(t)?"":t;}
/* A name the model writes for something the person typed (the Rescue dish, the log's title and foods) keeps one of the words only when the
   person typed that word themselves (a dish they named that way); otherwise the name is dropped. */
function own(t,max,typed){var q=quoted(t,max),low=" "+String(typed||"").toLowerCase().replace(/[^a-z0-9]+/g," ")+" ",ql=q.toLowerCase(),re=new RegExp(BANRX.source,"ig"),m,
    SW=/^(?:a|an|the|of|and|or|with|to|in|on|for|is|it|this|that|one|your)$/;
  /* the word stays only when the person typed it next to the same content word (a dish they named that way); "a", "the" do not count */
  while((m=re.exec(ql))){var w=m[2].replace(/[^a-z]+/g," ").trim(),
      bw=ql.slice(0,m.index+m[1].length).replace(/[^a-z0-9]+/g," ").trim().split(" ").filter(function(x){return x&&!SW.test(x);}),
      aw=ql.slice(m.index+m[0].length).replace(/[^a-z0-9]+/g," ").trim().split(" ").filter(function(x){return x&&!SW.test(x);}),
      lw=low.trim().split(" ").filter(function(x){return x&&!SW.test(x);}),lj=" "+lw.join(" ")+" ",before=bw.pop()||"",after=aw[0]||"";
    var ok=(before&&lj.indexOf(" "+before+" "+w+" ")>=0)||(after&&lj.indexOf(" "+w+" "+after+" ")>=0);
    if(!ok)return "";}
  return q;}
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
    var txt=x.suffix+". "+x.note;
    if(!x.note||!x.suffix||crosses(txt,p)||supp(txt)||CLAIM.test(txt))return;
    if(p.health==="diabetes"&&p.slot!=="snack"&&!keepsGrain(txt,n.carbs,x.deltaCarbs))return;   /* rule 3: no one-tap change takes the grain off */
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
function checkRescue(r,p,c){
  var typed=c&&typeof c.text==="string"?c.text:"",dn=own(r&&r.dish&&r.dish.name,80,typed)||(typed&&typed.length<=40&&typed.split(/\s+/).length<=6?quoted(typed.charAt(0).toUpperCase()+typed.slice(1),80):"Your dish");
  if(!r||typeof r!=="object")return {status:"error"};
  if(r.status==="refer")return {status:"refer",read:SAFETY};
  var d=r.dish||{},n={kcal:num(d.kcal,40,4000),protein:num(d.protein,0,300),carbs:num(d.carbs,0,500),fats:num(d.fats,0,300),fiber:num(d.fiber,0,80)};
  if(n.kcal==null||n.protein==null||n.carbs==null||n.fats==null||n.fiber==null||!dn)return {status:"empty"};
  var hacks=(Array.isArray(r.hacks)?r.hacks:[]).slice(0,4).map(function(h){
    return {title:clean(h&&h.title,80),kind:HACKKIND.indexOf(h&&h.kind)>=0?h.kind:"portion",deltaKcal:delta(h&&h.deltaKcal,-1500,300),deltaProtein:delta(h&&h.deltaProtein,-60,40),deltaCarbs:delta(h&&h.deltaCarbs,-300,60),deltaFats:delta(h&&h.deltaFats,-150,30),deltaFiber:delta(h&&h.deltaFiber,-10,20)};})
    .filter(function(h){return h.title&&!supp(h.title)&&!CLAIM.test(h.title)&&!crosses(h.title,p);});
  if(!hacks.length)return {status:"empty"};
  var warn=clean(d.warning,80),br=clean(d.breakdown,180);if(CLAIM.test(warn)||supp(warn))warn="";if(CLAIM.test(br)||supp(br))br="";
  return {status:"ok",dish:{name:dn,portion:clean(d.portion,60),kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,warning:warn,breakdown:br},hacks:hacks};
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
  if(kind==="rescue"){c.photo=!!(body&&body.image);return {prompt:buildRescuePrompt(p,c),schema:SCH.rescue,image:true,check:function(d){return checkRescue(d,p,c);}};}
  return {error:"bad_request"};
}
