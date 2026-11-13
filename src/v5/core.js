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
var GRAINT="jau|gehun|gehu|gehoon|roti|rotis|rotti|rotla|rotlas|phulka|phulkas|chapati|chapatis|chapathi|chapathis|chappati|chapatti|paratha|parathas|parantha|paranthas|parotta|parottas|thepla|theplas|bhakri|bhakris|naan|naans|kulcha|kulchas|kulche|rice|basmati|chawal|bhaat|bhat|sadam|pulao|pulav|pulaw|khichdi|khichri|kichdi|khichadi|biryani|biriyani|briyani|millet|millets|jowar|jolada|bajra|bajre|bajri|ragi|nachni|foxtail|kodo|kutki|quinoa|dalia|daliya|oats|oat|oatmeal|poha|pohe|upma|uppittu|idli|idlis|idly|idlies|dosa|dosas|dosai|uttapam|uttapams|uthappam|uthappams|bread|breads|toast|pav|bun|buns|noodles|noodle|pasta|spaghetti|penne|macaroni|soba|farro|freekeh|bulgur|couscous|orzo|polenta|rava|sooji|suji|semolina|vermicelli|sevai|barley|amaranth|rajgira|makki|maize|corn|mudde|appam|appams|puttu|pongal|thalipeeth|puri|puris|poori|pooris|luchi|bhatura|bhature|idiyappam|bisibelebath|puliyogare|sorghum|rye|buckwheat|kuttu|samak|sama|samai|varagu|thinai|kambu|moraiyo|samvat|wholemeal|wholewheat|wheat|atta|maida|muthia|muthiya|adai|pathiri|kozhukattai|paniyaram|handvo|litti|baati|khakhra|sandwich|sandwiches|wrap|roll|frankie|muesli|granola|cornflakes|thukpa|dabeli|pizza|flatbread|pita|sourdough|cracker|crackers|porridge|malt|satva|ambli|koozh|sattu|murmura|flattened|grain|grains|multigrain|tortilla|tortillas|cereal|ravioli|lasagne|risotto|gnocchi|bath|neer|burger|burgers|sub|subs|toasts|momos|momo|chowmein|chow|mein|thali|semiya|dhokli|chappathi|kanji|khichuri|kitchari|polao|muri|chire|ruti|kochuri|kachori|porotta|parotha|chapathy|uttappam|oothappam|bhatoora|biriani|pidi|kozhukatta|palappam|ada|lasagna|flatbreads|wraps|rolls|cakes|cake|pancake|pancakes|crust";
var GRAIN_RX=new RegExp("^(?:"+GRAINT+")$");
/* the other words a grain dish is named with: amounts, kinds, ways of cooking, and the companions of Indian grain dishes */
var COMPT="beef|pork|fry|bhindi|okra|pan|poriyal|thoran|papad|almond|almonds|overnight|apple|chia|sharbati|multi|chakki|beetroot|pumpkin|brinjal|baingan|a|an|the|of|and|with|on|in|for|into|from|style|ki|ka|ke|bhaji|\\d+|one|two|three|four|five|half|small|medium|large|thin|thick|soft|single|portion|portions|cup|cups|bowl|bowls|katori|plate|g|gm|grams?|ml|pieces?|slices?|serving|servings|fingers|sheet|"+
  "brown|red|white|black|whole|hand|pounded|unpolished|parboiled|polished|sona|masoori|matta|jeera|plain|steamed|boiled|cooked|roasted|toasted|baked|tawa|tava|tandoori|missi|pearl|finger|little|barnyard|proso|broken|rolled|steel|cut|cracked|pearled|puffed|sprouted|instant|homemade|handmade|fresh|warm|hot|dry|light|lightly|minimal|oil|ghee|butter|garlic|cheese|egg|eggs|paneer|stuffed|filled|"+
  "veg|vegetable|vegetables|mixed|masala|lemon|curd|thayir|tomato|tamarind|coconut|onion|kanda|aloo|potato|gobi|cauliflower|methi|fenugreek|palak|spinach|mooli|radish|matar|peas|pea|carrot|carrots|beans|cabbage|capsicum|lauki|bottle|gourd|dudhi|sweet|corn|"+
  "dal|dhal|moong|mung|toor|tuvar|masoor|urad|chana|rajma|chole|kadhi|sambar|rasam|chutney|raita|sabzi|sabji|bhurji|chokha|maska|kathi|kerala|kothu|vangi|onion|akki|jowar|"+
  "chicken|mutton|fish|prawn|prawns|keema|soya|chunks|tofu|chickpea|chickpeas|sabudana|hyderabadi|lucknowi|dum|hakka|fried|schezwan|arrabbiata|pesto|tikka|dhaba|punjabi|south|indian|kerala|mumbai|"+
  "but|or|plus|alongside|side|only|extra|added|more|salad|besan|flax|flaxseed|flaxseeds|doodhi|zucchini|broccoli|bisi|bele|made|from|flour|green|cumin|spiced|sauteed|leaves|stewed|cubes|yellow|ajwain|roomali|rumali|fine|finely|chopped|diced|sliced|aromatic|puffs|light|low|fat|soaked|crumbled|savory|savoury|split|kernels|pocket|bed|crepe|crisps|flakes|chilla|cheela|kala|kabuli|gram|sprouts|mint|coriander|ginger|curry|unfried|blend|bhel|batter|into|nos|pcs|pre|premade|ready|store|bought|mysore|set|paper|roast|benne|podi|mini|vada|thatte|button|kurma|malabar|ceylon|ven|khara|misal|usal|pakora|omelette|bombay|tikki|pudina|pyaz|mix|di|navratan|kolkata|ambur|thalassery|dindigul|donne|mughlai|awadhi|kathal|singapore|steamed|red|pink|sauce|veggie|chilli|chili|mushroom|mushrooms|regular|cheesy|paradise|pepperoni|mayo|banana|pani|breadsticks|croissant|deluxe|special|classic|royal|house|chef|combo|platter|spicy|tangy|crispy|crunchy|loaded|double|jumbo|garden|choco|chocolate|honey|peanut|avocado|overnight|milk|nuts|ponni|seeraga|samba|gobindobhog|browntop|batata|indori|churma|dhokli|kuzhi|stew|kadala|malai|kofta|whole|grain|wholegrain|spelt|gluten|free|aglio|olio|alfredo|marinara|primavera|margherita|farmhouse|club|grilled|amritsari|kashmiri|peshawari|lachha|laccha|rumali|kadai|kadhai|makhani|jeera|tadka|butter|dal|bowl";
var COMP_RX=new RegExp("^(?:"+COMPT+")$");
/* a grain word naming a spice mix, sauce, condiment or style is not a grain ("idli podi", "biryani-spiced", "pulao-style") */
var CONDI=new RegExp("\\b(?:pav\\s+)?(?:biryani|pulao|khichdi|bhaji|chole|sambar|garam|chaat)\\s+masala\\b|\\b(?:"+GRAINT+")(?:\\s+(?!with\\b|and\\b|or\\b|in\\b|on\\b|plus\\b)[a-z]+)?[\\s-]+(?:sauce|podi|powder|seasoning|spices?|spiced|style|flavou?red|chutney|papad|spread|crust|crusted|crumbs?|crumbed|batter|vinegar|bran|paper|starch|water|wine|kanji|husk)\\b|\\b(?:"+GRAINT+")[\\s-]+milk\\b(?![\\s-]+(?:porridge|malt|kanji|kheer))","gi");
/* negation: what follows "no", "without", "instead of" ... up to the next comma, or what precedes "skipped", "optional", "-free", "-less" */
var NEGPRE=/\b(?:no|not|without|minus|sans|except|avoid|avoiding|skip|skipping|hold|omit|omitting|drop|dropping|remove|removing|exclude|excluding|instead\s+of|in\s+place\s+of|rather\s+than|swap\s+out|leave\s+out|zero)\b([^,;.()]*?)(?=\s+but\b|[,;.()]|$)/gi;
var NEGPOST=/\b([a-z]+)[\s-]+(?:skipped|avoided|omitted|removed|dropped|excluded|optional|not\s+(?:included|needed|served|part|given|provided|wanted|required|allowed|advised|recommended|eaten|taken|ordered|added|used|offered|today|tonight|now)|on\s+request|on\s+the\s+side\s+optional)\b[^,;.()]*/gi;   /* "-free" and "-less" are stand-ins (STAND), not left-out words */
var STANDF=[
  "\\briced\\s+[a-z]+",
  "\\b(?:cauli(?:flower)?|broccoli|cabbage|turnip|radish|mooli|daikon|konjac|lentil|lentils)(?:[\\s-]+as)?[\\s-]+(?:fried[\\s-]+)?rice\\b|\\bminced\\s+(?:mushrooms?|cauliflower|broccoli|cabbage)\\b",
  "\\b(?:veggie|protein|cauli(?:flower)?|broccoli|zucchini|courgette|cabbage|kelp|palmini|lettuce|lauki|doodhi|dudhi|bottle\\s+gourd|carrots?|beetroot|beets?|cucumber|daikon|mooli|radish|turnip|squash|potato|sweet\\s+potato|tofu|paneer|egg[\\s-]+white|glass|mung\\s+bean|cellophane|shirataki|konjac|kelp)[\\s-]+(?:noodles?|pasta|spaghetti|couscous|crust)\\b",
  "\\b(?:cauli(?:flower)?|broccoli|zucchini|courgette|cabbage|lauki)[\\s-]+(?:roti|rotis|chapati|chapatis|naan|bread|tortillas?|pizza|upma|poha|couscous)\\b",
  "\\b(?:gram|chana|besan|soy|soya|moong|masoor|chickpea|almond|coconut|flax(?:seed)?|lupin|psyllium|arrowroot|singhara|singhare|water\\s+chestnut)[\\s-]+(?:flour|atta|meal|ki|ka|ke)[\\s-]+(?:roti|rotis|bread|chapati|paratha|puri|naan|dosa|pizza)\\b",
  "\\b(?:besan|gram|chana|chickpea|moong|mung|masoor|soya|soy|coconut|almond|flax|flaxseed|cauliflower|broccoli|zucchini|cabbage|sweet\\s+potato|makhana|singhara|singhare|arrowroot|sabudana|lupin|psyllium)(?:[\\s-]+dal)?[\\s-]+(?:roti|rotis|rotti|chapati|chapatis|chapathi|bhakri|bhakris|uttapam|uttappam|uthappam|tortillas?)\\b",
  "\\b(?:moong|mung|masoor|chana|urad|lentil|red\\s+lentil|chickpea|besan|green\\s+pea|pea|soy(?:bean|a)?|black\\s+bean|bean|edamame|lupin[ie]?)(?:\\s+dal)?(?:[\\s-]+(?:flour|based))?[\\s-]+(?:pasta|noodles?|spaghetti|penne|fusilli|dosa|idli)\\b",
  "\\b(?:almond|coconut|chia|seed|psyllium|lupin|cloud|oopsie|fathead|keto|besan|arrowroot|singhara|singhare|water\\s+chestnut|makhana|sago|tapioca|flax(?:seed)?)[\\s-]+(?:roti|rotis|bread|pizza|toast|wraps?|tortillas?)\\b",
  "\\b(?:konjac|shirataki|keto|low[\\s-]?carb|zero[\\s-]?carb|no[\\s-]?carb|no[\\s-]?grain|miracle|singhara|singhare|water\\s+chestnut|arrowroot|vrat|glucomannan|spirali[sz]ed|sabudana|sago|tapioca|makhana)\\b",
  "\\b(?:"+GRAINT+"|carb|carbs)[\\s-]?(?:free|less)\\b|\\b(?:rice|grain|carb|wheat|atta)less\\b",
  "\\btofu[\\s-]+rice\\b|\\bsweet\\s+potato[\\s-]+(?:roti|rotis|bread|paratha|puri)\\b",
  "\\b(?:chickpea|lentil|legume|soy|soya|bean|pea|nut|almond|coconut|cauliflower|vegetable|veggie|protein|egg|paneer|tofu)[\\s-]+based\\b"
];
var STAND=new RegExp(STANDF.join("|"),"i");
/* one-tap notes keep the named non-grain materials as stand-ins; names use madeOf() below, which also reads "made with besan and whole wheat" */
var MADEF="\\bmade\\s+(?:with|from|of|using)\\s+(?:grated\\s+|riced\\s+|black\\s+|green\\s+|yellow\\s+|whole\\s+|split\\s+|red\\s+|white\\s+)*(?:cabbage|carrots?|radish|mooli|turnip|beetroot|pumpkin|spinach|palak|cauli(?:flower)?|broccoli|zucchini|konjac|shirataki|sabudana|sago|tapioca|singhara|singhare|water\\s+chestnut|almonds?|coconut|flax(?:seed)?s?|chickpeas?|lentils?|besan|chana|moong|mung|masoor|soy(?:bean|a)?s?|beans?|peas?|lupin[ie]?|psyllium|arrowroot|makhana|paneer|tofu|eggs?|cheese|potato|sweet\\s+potato|lauki|bottle\\s+gourd|nuts?|seeds?)\\b";
var STANDN=new RegExp(STANDF.concat([MADEF]).join("|").replace("|singhara|singhare|water\\s+chestnut|arrowroot|vrat|glucomannan|spirali[sz]ed|sabudana|sago|tapioca|makhana)","|glucomannan|spirali[sz]ed)"),"i");   /* for one-tap notes: makhana or sabudana named in passing is not a stand-in */
var CORE=/^(?:\d+|one|two|three|four|half|a|an|the|of|small|medium|large|thin|cup|cups|bowl|katori|g|grams?|pieces?|slices?|cooked|steamed|boiled|plain|brown|red|black|white|whole|wheat|wholemeal|multigrain|atta|hand|pounded|unpolished|parboiled|basmati|sona|masoori|matta|jeera|tawa|tandoori|missi|makki|ki|ka|jowar|bajra|bajre|ragi|nachni|foxtail|kodo|little|barnyard|proso|kutki|samak|sama|samai|varagu|thinai|kambu|rajgira|kuttu|millet|millets|broken|rolled|steel|cut|oats|oat|dalia|daliya|quinoa|amaranth|sorghum|pearl|finger|rye|barley|buckwheat|soba|roti|rotis|rotti|phulka|phulkas|chapati|chapatis|chapathi|bhakri|rice|chawal|bread|toast|thepla|paratha|parathas|naan|kulcha|couscous|farro|freekeh|bulgur)$/i;
/* "made from/with/of <x>" and "<x> flour/atta" count as a grain only when <x> is a grain; any other material marks a stand-in (round 13) */
var GRAINMATW="jau|gehun|gehu|gehoon|samai|varagu|kambu|thinai|wheat|atta|maida|semolina|rava|sooji|suji|dalia|daliya|bulgur|vermicelli|sevai|rice|basmati|poha|millets?|foxtail|kodo|barnyard|proso|browntop|kutki|samak|sama|jowar|sorghum|bajra|bajre|bajri|ragi|nachni|oats?|oatmeal|quinoa|barley|maize|corn|makki|buckwheat|kuttu|amaranth|rajgira|rye|spelt|farro|freekeh|teff|multigrain|wholewheat|wholemeal|wholegrain|durum|sourdough|polenta";
var MADE_RX=/\bmade\s+(?:with|from|of|using|out\s+of)\s+([^,;.()]*)/gi,GMATW_RX=new RegExp("\\b(?:"+GRAINMATW+")\\b","i");
var FLOUR_RX=new RegExp("\\b(?!(?:"+GRAINMATW+"|whole|fine|refined|white|plain|the|a|of|with|and|or|in)\\b)[a-z]+[\\s-]+flour\\b","i");   /* "<x> atta" is read by attaNorm() first */
var ATTAPULSE=/^(?:sattu|moong|mung|urad|chana|chane|besan|gram|chickpeas?|masoor|toor|soy|soya|lentils?|rajma|beans?|peanuts?|almonds?|cashews?|walnuts?|nuts?|coconut|flax|flaxseeds?|chia|sesame|seeds?|kathal|jackfruit|banana|singhara|singhare|makhana|kulthi|horsegram|lotus|tapioca|sabudana|arrowroot|chestnut|keto|carb|carbs|psyllium|lupin|cauliflower|cauli)$/;
function attaNorm(s){return String(s).replace(/\batta\b/gi,function(m0,off,str){var seg=str.slice(0,off).split(/[,;:.()\/\[\]]|\b(?:and|with|or|plus)\b/).pop(),w=words(seg).slice(-4);
  return w.some(function(x){return ATTAPULSE.test(x);})||/\b(?:dal|daal)\s+k[aie]\s*$/i.test(seg)||/\b(?:mixed|multi|five|panch|moong|chana|urad|masoor|toor|arhar)\s+(?:dal|daal)\s*$/i.test(seg)?"flour":m0;});}   /* "dal ka atta" is dal flour; "dal atta roti" is wheat */   /* "besan atta", "chana ka bhuna atta", "soya chunks atta" are those flours; "palak atta roti", "gehun ka atta" are wheat (rounds 13 to 15) */
function madeOf(s){var r=null;String(s).replace(MADE_RX,function(m0,o){var g=GMATW_RX.test(o)?true:(words(o).some(function(x){return MAT_RX.test(x)||/^(?:flour|atta|meal|shirataki|konjac)$/.test(x);})?false:null);
  if(g!==null)r=(r===false)?false:g;return m0;});return r;}   /* null: none, or not a material ("made with minimal oil"); false: a non-grain */
function standIn(x){var mo=madeOf(x);return STAND.test(x)||mo===false||(mo!==true&&FLOUR_RX.test(x)&&!GMATW_RX.test(x));}   /* "chana flour and whole wheat" names a grain */
function words(s){return s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(" ").filter(Boolean);}
/* Shapes: a wrap, toast, flatbread or crust can be made of anything, so it is a grain only when a grain is named with it ("whole wheat
   wrap", "oats porridge"), or, for the everyday wheat shapes (toast, bun, pizza, sandwich, bread, lasagne, gnocchi, porridge), when only
   fillings stand with it ("cheese toast", "aloo tikki burger"). A vegetable, legume, nut or seed with a shape is a stand-in (Critic round 11). */
var SHAPE_RX=/^(?:wraps?|rolls?|toasts?|buns?|burgers?|sandwich(?:es)?|pizza|flatbreads?|crackers?|cracker|porridge|tortillas?|gnocchi|lasagne|lasagna|crust|pancakes?|cakes?|bread|breads)$/;
var STRICT_RX=/^(?:wraps?|rolls?|flatbreads?|crackers?|cracker|tortillas?|crust|pancakes?|cakes?|gnocchi)$/;
/* Round 13 (Critic round 12): the material test holds for every grain word, not only for shapes. A grain named outright (PUREG: millet,
   oats, quinoa, wheat, rava ...) makes the part a grain. Otherwise a vegetable, legume, nut, seed, cheese, egg or meat word beside a grain
   word counts only when each pair is a known grain dish (ALLOWM: stuffed parathas, flavoured rice, biryanis and pulaos with their usual
   additions ...). Any other pair ("cauliflower risotto", "nuts porridge", "cheese crust") is read as a stand-in, so the list of stand-ins
   no longer has to grow. */
var PUREG=/^(?:jau|gehun|gehu|gehoon|millets?|jowar|jolada|bajra|bajre|bajri|ragi|nachni|foxtail|kodo|kutki|barnyard|proso|browntop|samak|samai|varagu|thinai|kambu|quinoa|dalia|daliya|oats?|oatmeal|barley|buckwheat|kuttu|amaranth|rajgira|sorghum|rye|spelt|bulgur|farro|freekeh|teff|semolina|rava|sooji|suji|basmati|maize|makki|polenta|wheat|wholewheat|wholemeal|wholegrain|atta|maida|multigrain|sourdough|durum)$/;
var GMAT_RX=PUREG;
var MAT_RX=/^(?:cauliflower|cauli|broccoli|zucchini|courgette|cabbage|lauki|doodhi|dudhi|gourd|pumpkin|kaddu|squash|potato|potatoes|aloo|sweetpotato|carrots?|gajar|beetroot|beets?|radish|mooli|turnip|daikon|cucumber|spinach|palak|methi|fenugreek|kale|lettuce|eggplant|brinjal|baingan|bhindi|okra|konjac|kelp|seaweed|tofu|chickpeas?|besan|gram|chana|moong|mung|masoor|urad|lentils?|dal|dhal|soy|soya|beans?|peas?|pea|matar|edamame|lupin|almonds?|cashews?|walnuts?|peanuts?|nuts?|coconut|flax|flaxseeds?|chia|sesame|seeds?|psyllium|makhana|sabudana|sago|tapioca|arrowroot|singhara|singhare|chestnut|cloud|oopsie|keto|protein|chilla|cheela|gobi|mushrooms?|cheese|cheesy|paneer|eggs?|omelette|chicken|mutton|beef|pork|fish|prawns?|keema|meat|sprouts|rajma|kathal|jackfruit|banana|avocado)$/;
var MATKEY={potato:"aloo",potatoes:"aloo",aloo:"aloo",gobi:"gobi",cauliflower:"cauliflower",methi:"methi",fenugreek:"methi",palak:"palak",spinach:"palak",
  mooli:"mooli",radish:"mooli",lauki:"lauki",doodhi:"lauki",dudhi:"lauki",gourd:"lauki",matar:"matar",peas:"matar",pea:"matar",carrot:"carrot",carrots:"carrot",
  gajar:"carrot",cabbage:"cabbage",beans:"beans",bean:"beans",mushroom:"mushroom",mushrooms:"mushroom",cheese:"cheese",cheesy:"cheese",paneer:"paneer",
  egg:"egg",eggs:"egg",omelette:"omelette",chicken:"meat",mutton:"meat",beef:"meat",pork:"meat",fish:"meat",prawn:"meat",prawns:"meat",keema:"meat",meat:"meat",dal:"dal",dhal:"dal",
  moong:"moong",mung:"moong",masoor:"masoor",urad:"urad",chana:"chana",chickpea:"chana",chickpeas:"chana",soy:"soya",soya:"soya",coconut:"coconut",
  peanut:"peanut",peanuts:"peanut",sesame:"sesame",tofu:"tofu",zucchini:"veg2",broccoli:"veg2",besan:"besan",beetroot:"beet",pumpkin:"veg2",brinjal:"brinjal",baingan:"brinjal",sprouts:"sprouts",rajma:"rajma",kathal:"kathal",banana:"banana",avocado:"avocado"};
var RICEF="rice|chawal|bhaat|bhat|sadam",BIRF="biryani|biriyani|briyani|biriani|pulao|pulav|pulaw|polao",PARF="paratha|parathas|parantha|paranthas|parotha",
  KHIF="khichdi|khichri|kichdi|khichadi|khichuri|kitchari",PURF="puri|puris|poori|pooris",ROTF="roti|rotis|rotti|chapati|chapatis|chapathi|phulka|phulkas",SANF="sandwich|sandwiches|toast|toasts|burger|burgers|bun|buns|pav|bread|breads",
  SANP="sandwich|sandwiches|toast|toasts|burger|burgers|pav",ROLF="roll|rolls|frankie",DOSF="dosa|dosas|dosai|uttapam|uttapams|uthappam|uttappam|oothappam",KULF="kulcha|kulchas|kulche|naan|naans";
function mrx(s){return new RegExp("^(?:"+s+")$");}
var ALLOWM={
  aloo:mrx(PARF+"|"+PURF+"|"+KULF+"|"+SANF+"|"+ROLF+"|"+DOSF+"|"+BIRF+"|"+ROTF+"|"+RICEF+"|poha|pohe|kachori|kochuri"),
  gobi:mrx(PARF+"|rice|"+BIRF), cauliflower:mrx(PARF),
  methi:mrx(PARF+"|thepla|theplas|"+ROTF+"|chapati|chapatis|phulka|phulkas|"+PURF+"|khakhra|muthia|muthiya|bhakri|"+BIRF+"|"+RICEF+"|"+DOSF),
  palak:mrx(PARF+"|"+ROTF+"|chapati|chapatis|"+PURF+"|thepla|theplas|"+BIRF+"|"+RICEF+"|"+KHIF+"|"+DOSF+"|idli|idlis|idly|sandwich|sandwiches|toast|toasts"),
  mooli:mrx(PARF), lauki:mrx(PARF+"|"+KHIF+"|thepla|theplas|muthia|muthiya"), veg2:mrx(PARF), besan:mrx(PARF), sprouts:mrx(KHIF+"|"+RICEF+"|"+BIRF+"|"+SANP+"|poha|pohe"), rajma:mrx(RICEF+"|"+BIRF+"|"+KHIF), kathal:mrx(BIRF), banana:mrx("bread|breads"), avocado:mrx("toast|toasts|sandwich|sandwiches"), tofu:mrx("friedrice|"+BIRF),
  matar:mrx(BIRF+"|"+PARF+"|"+KULF+"|"+KHIF+"|"+RICEF+"|poha|pohe|"+PURF+"|kachori|risotto|upma|uppittu"),
  carrot:mrx(RICEF+"|"+BIRF+"|"+PARF+"|"+DOSF+"|upma|uppittu|poha|pohe"), cabbage:mrx(PARF+"|thepla|theplas|momos|momo"), beans:mrx(RICEF+"|"+BIRF),
  mushroom:mrx(RICEF+"|friedrice|"+PARF+"|"+BIRF+"|risotto|pizza|sandwich|sandwiches|toast|toasts|pasta|noodles|noodle|momos|momo|chowmein"),
  cheese:mrx(SANP+"|garlicbread|pizza|"+PARF+"|"+DOSF+"|"+ROTF+"|"+KULF+"|pasta|macaroni|garlic"),
  paneer:mrx(BIRF+"|friedrice|poha|pohe|"+PARF+"|"+KULF+"|"+ROLF+"|"+SANP+"|pizza|"+DOSF+"|"+ROTF+"|momos|momo|pasta"),
  egg:mrx(RICEF+"|friedrice|poha|pohe|"+BIRF+"|"+PARF+"|"+ROLF+"|"+SANP+"|"+DOSF+"|"+ROTF+"|noodles|noodle|chowmein|pasta|maggi"),
  omelette:mrx("bread|breads|pav|toast|toasts|sandwich|sandwiches|bun|buns"),
  meat:mrx(RICEF+"|"+BIRF+"|friedrice|noodles|noodle|chowmein|chow|mein|"+ROLF+"|"+SANP+"|pizza|momos|momo|"+PARF+"|"+KULF+"|pasta|macaroni|lasagne|lasagna|"+DOSF+"|sub|subs"),
  dal:mrx(KHIF+"|"+RICEF+"|"+ROTF+"|chapati|chapatis|phulka|phulkas|baati|bati|"+PARF+"|"+PURF+"|kachori|kochuri|dhokli|"+BIRF),
  moong:mrx(KHIF+"|"+RICEF+"|"+PARF), masoor:mrx(KHIF+"|"+RICEF+"|"+BIRF), urad:mrx(KHIF+"|"+RICEF+"|"+BIRF+"|"+DOSF+"|idli|idlis|idly"), beet:mrx(PARF+"|"+DOSF), brinjal:mrx(RICEF+"|"+BIRF),
  chana:mrx(KHIF+"|"+RICEF+"|"+BIRF+"|"+PURF+"|bhatura|bhature|bhatoora|"+KULF+"|"+PARF),
  soya:mrx(BIRF+"|friedrice"), coconut:mrx(RICEF+"|"+BIRF+"|appam|appams|idiyappam|puttu|"+DOSF), peanut:mrx(RICEF+"|poha|pohe"), sesame:mrx(RICEF)};
function allowed(m,g){var k=MATKEY[m];return !!k&&!!ALLOWM[k]&&ALLOWM[k].test(g);}
var COATW=/^(?:fish|prawns?|chicken|mutton|meat|paneer|eggs?|tofu|keema|tikki|tikkis|cutlets?|kebabs?|kababs?|pakoras?|pakodas?|fry)$/;
var COATG=/^(?:rava|sooji|suji|semolina|maida)$/,COATV=/^(?:fried|fry|crusted|coated|crumbed|crispy|crisp|tawa|batter)$/;
var VEGW=/^(?:veg|vegetables?|veggies|corn|capsicum|tomato(?:es)?|onions?|kofta|koftas|vada|vadas|bhindi|okra|raw|bhaji)$/;
var GFREE=/^(?:rice|chawal|basmati|poha|oats?|millets?|jowar|bajra|bajri|ragi|nachni|quinoa|buckwheat|kuttu|amaranth|rajgira|sorghum|maize|makki|corn|polenta|teff|foxtail|kodo|kutki|barnyard|samak|samai|varagu|thinai|kambu)$/;
function known(part,coatCtx){var w=words(attaNorm(part).replace(/\bsweet\s+potato(e?s)?\b/gi,"sweetpotato").replace(/\b(?:peanut|almond|cashew|nut)\s+butter\b/gi,"nutbutter"));
  if(!w.length||!w.every(function(x){return GRAIN_RX.test(x)||COMP_RX.test(x)||x==="sweetpotato"||x==="nutbutter";}))return false;
  if(w.indexOf("gluten")>=0)return w.some(function(x){return GFREE.test(x);});   /* "gluten-free" counts only with a gluten-free grain named, not "multigrain" */
  if(w.some(function(x,i){return SHAPE_RX.test(x)&&/^bowls?$/.test(w[i+1]||"");}))return false;                              /* "burger bowl", "pizza bowl" */
  var flourAt=function(i){return /^(?:flour|rava|atta|powder|batter|starch|meal)$/.test(w[i+1]||"");};   /* "rice flour", "rice rava": a material */
  var g=w.filter(function(x,i){return GRAIN_RX.test(x)&&!/^(?:wheat|atta|maida|corn|grain|grains|multigrain|flattened|sattu|style|cereal|whole|wholegrain)$/.test(x)&&!(x==="rice"&&flourAt(i));});
  /* Coatings (A14, rounds 13 to 15): with no grain dish named, a frying or crusting word, or rava, sooji or semolina, beside a vegetable,
     legume, cheese, egg or meat word is a coating ("rice flour fried fish", "atta fried potato", "rava fried veg", "rava brinjal"), and oats
     with a patty, fish, meat or egg word is a coating ("oats tikki"). "Fried rice", "egg fried quinoa", a grain bowl and a chilla stay grains. */
  /* Coatings (A14, rounds 13 to 16): a food named after the last grain word is coated with that grain when a frying word stands in the name
     ("rava fried fish", "crispy rava fish", "noodle fried prawns", "rice flour fried brinjal") or the grain is rava, sooji, semolina or maida
     and the food is a vegetable, legume, cheese, egg or meat ("rava brinjal", "rava fish cakes"); oats before a patty, fish, meat or omelette
     is a coating ("oats tikki"). A grain named last is the dish ("egg fried rice", "fried paneer quinoa", "tomato rava"); a chilla or a bowl
     stays a grain. */
  var lastG=-1;w.forEach(function(x,i){if(GRAIN_RX.test(x)&&!/^(?:cakes?|pancakes?|cutlets?|bowl|bowls|thali)$/.test(x)&&!(x==="corn"&&!/^(?:roti|flour|atta|meal|tortillas?|bread)$/.test(w[i+1]||"")))lastG=i;});   /* corn alone is the vegetable */
  var after=w.slice(lastG+1),foodA=after.some(function(x){return COATW.test(x)||MAT_RX.test(x)||VEGW.test(x);}),hardA=after.some(function(x){return COATW.test(x)||MAT_RX.test(x);});
  if(lastG>=0&&!w.some(function(x){return /^(?:chilla|cheela|bowls?)$/.test(x);})){
    var pureLast=PUREG.test(w[lastG])||flourAt(lastG)||/^(?:flour|rava|atta|powder|batter|meal)$/.test(w[lastG+1]||"");
    if(foodA&&w[lastG]==="rice"&&/^(?:crispy|crisp|crunchy|puffed)$/.test(w[lastG-1]||""))return false;   /* "crispy rice fish": a rice crust */
    if(foodA&&(pureLast?w.some(function(x,i){return COATV.test(x)&&!(i<lastG&&GRAIN_RX.test(w[i+1]||"")&&!PUREG.test(w[i+1]||""));}):/^(?:fried|crusted|coated|crumbed|battered)$/.test(w[lastG+1]||"")))return false;   /* "fried rice (veg)", "rice fish fry", "tawa paratha (aloo)" are the dish; "noodle fried prawns" is coated */
    if(hardA&&w.slice(0,lastG+1).some(function(x){return COATG.test(x);})&&!g.some(function(x){return !PUREG.test(x)&&!/^(?:cakes?|pancakes?)$/.test(x);}))return false;
    if(w.slice(0,lastG+1).some(function(x){return /^(?:oats?|oatmeal)$/.test(x);})&&after.some(function(x){return /^(?:tikki|tikkis|cutlets?|kebabs?|kababs?|fish|prawns?|chicken|mutton|meat|keema|omelette|fry|pakoras?|pakodas?)$/.test(x);}))return false;}
  if(!g.length)return w.some(function(x){return /^(?:wheat|maize|atta)$/.test(x);})&&w.length>1&&!(coatCtx&&w.some(function(x){return /^(?:flour|powder|meal|rava|starch|atta)$/.test(x);}));   /* "whole wheat flour" counts; "tawa fish with wheat flour" is a coating */
  if(w.some(function(x,i){return PUREG.test(x)||(x==="flattened"&&w[i+1]==="rice")||(x==="corn"&&!/^(?:sweet|baby)$/.test(w[i-1]||"")&&g.some(function(y){return y!=="corn";}));}))return true;   /* a grain named outright: "jowar roti", "whole wheat wrap", "oats porridge" */
  var lastDish=-1;w.forEach(function(x,i){if(GRAIN_RX.test(x)&&!PUREG.test(x)&&!/^(?:wheat|atta|maida|corn|grain|grains|multigrain|style|cereal|whole|wholegrain)$/.test(x))lastDish=i;});
  var m=w.filter(function(x,i){return MAT_RX.test(x)&&!(lastDish>=0&&i>lastDish&&!SHAPE_RX.test(w[lastDish]))&&!/^(?:fry|curry|sabzi|sabji|subzi|poriyal|thoran|bhaji|masala|kurma|korma|gravy|tikka|kebab|kabab|bhurji|chokha|raita|salad)$/.test(w[i+1]||"");});   /* "rice fish fry", "chapati bhindi fry": a side dish; "hakka noodles paneer": a filling */   /* "rice fish fry", "chapati bhindi fry": a side dish */
  var gk=w.map(function(x,i){return x==="rice"&&w[i-1]==="fried"?"friedrice":x==="bread"&&w[i-1]==="garlic"?"garlicbread":x;}).filter(function(x,i){return x==="friedrice"||x==="garlicbread"||g.indexOf(w[i])>=0;});
  if(m.length&&!m.every(function(x){return gk.every(function(y){return allowed(x,y)||(y==="friedrice"&&allowed(x,"rice"));});}))return false;   /* a pair that is not a known grain dish */
  if(g.some(function(x){return !SHAPE_RX.test(x);}))return true;                  /* a grain itself: rice, roti, dosa, khichdi ... */
  if(g.every(function(x){return x==="porridge";}))return false;                     /* a porridge counts only with its grain named: "ragi porridge", not "banana porridge" */
  if(g.every(function(x){return STRICT_RX.test(x);}))return w.some(function(x){return /^(?:kathi|frankie|khakhra|thin|thick|pan|stuffed)$/.test(x);});
  return true;}                                                                   /* toast, bun, pizza, sandwich, bread with fillings only */
var DISHW=/^(?:khichdi|pulao|poha|idli|idlis|dosa|pasta|noodles)$/;
function plain(part,dish){var w=words(part);return w.length>0&&w.every(function(x){return CORE.test(x)||(dish&&DISHW.test(x));})&&w.some(function(x){return GRAIN_RX.test(x)&&!/^(?:wheat|atta|grain|grains|multigrain)$/.test(x);});}
function isGrain(t){
  var s=" "+attaNorm(String(t||"").replace(/[‘’“”"']/g,"").replace(/[()\[\]]/g," "))+" ";
  s=s.replace(CONDI," ");
  s=s.replace(/\b(fried|fry|crusted|coated|crumbed|dusted|tossed|rolled)\s+(in|with)\s+([a-z]+(?:\s+[a-z]+)?)/gi,function(m0,v,pr,o){var ow=words(o),mat=ow.some(function(x){return /^(?:flour|rava|atta|meal|powder|crumbs?|batter|sooji|suji|semolina|maida|oats?)$/.test(x);});
    return ow.length&&ow.every(function(x){return PUREG.test(x)||/^(?:rice|flour|rava|atta|meal|powder|crumbs?|batter)$/.test(x);})&&(pr.toLowerCase()==="in"||mat)?v+" ":m0;});   /* "fish fried in rava", "fish fry with rice flour": a coating */
  var lost=false,stand0=standIn(s);   /* "atta-free", "grain-free" are read before the negations are taken out */
  s=s.replace(NEGPOST,function(m,a){if(GRAIN_RX.test(a.toLowerCase()))lost=true;return " , ";});   /* "rice not included" before the single word "not" */
  s=s.replace(NEGPRE,function(m,obj){if(words(obj).some(function(x){return GRAIN_RX.test(x);}))lost=true;return " , ";});
  var stand=stand0||standIn(s);
  if(!lost&&!stand&&madeOf(s)===true)return true;
  var parts=s.split(/\s+(?:and|or|plus|but|with)\s+|[,;+&\/]/),sw=words(s);
  var coatCtx=sw.some(function(x){return COATV.test(x);})&&sw.some(function(x){return COATW.test(x)||MAT_RX.test(x)||VEGW.test(x);});   /* a frying word and a food: a flour in it is the coating */
  if(!stand&&!lost)return parts.some(function(x){return known(x,coatCtx);})||known(s,coatCtx);
  /* a stand-in is named or a grain is left out: only a plain grain on its own counts */
  var comps=s.split(/\s+(?:and|or|plus|but)\s+|[,;+&\/]/);
  return comps.some(function(c){if(!standIn(c))return plain(c,true);return c.split(/\s+with\s+/).some(function(x){return !standIn(x)&&plain(x,false);});});
}
/* What a "skip", "avoid", "not", "instead of" ... applies to: the words after it, up to a preposition, a comma or a conjunction.
   removesGrain(text) is true when such a phrase takes a grain off and nothing that is a grain takes its place. */
var STOPW=/^(?:the|a|an|any|your|all|extra|added|some|this|that|those|these|its|their|it|of)$/;
var BREAKW=/^(?:on|in|for|with|from|to|at|over|into|and|or|but|so|then|if|while|as|by|until|tonight|today|entirely|completely|altogether)$/;
var AWAYW=/\b(?:aside|away|out|for\s+later|for\s+tomorrow|for\s+lunch|for\s+dinner|for\s+another|to\s+go|on\s+the\s+side)\b/;
/* a grain word in a note, ask or portion: "thali" names the whole meal there, not its grain (Critic round 12); carbs and the dosa's crepe count */
function hasGrainWord(x){var w=words(x);return w.some(function(v,i){return (GRAIN_RX.test(v)&&v!=="thali"&&!(v==="corn"&&!/^(?:roti|flour|atta)$/.test(w[i+1]||"")))||/^(?:carbs?|starch|staples?|crepes?)$/.test(v);});}   /* sweet corn is a vegetable here */
function objectAfter(rest){var w=words(rest),out=[];for(var i=0;i<w.length&&out.length<3;i++){if(STOPW.test(w[i])&&!out.length)continue;if(BREAKW.test(w[i])||STOPW.test(w[i]))break;out.push(w[i]);}return out.join(" ");}
/* what is chosen in place of something: the words after "ask for", "use", "order" ... up to the first word that is not a food word */
var LEADV=/^(?:then|ask|asking|for|order|ordering|choose|chose|select|request|get|use|using|have|having|eat|eating|serve|take|add|pick|try|go|opt|prefer|want|them|to|bring|a|an|the|some|please|just|it|you|can|could|should|and|instead)$/;
function lastClause(x){return String(x||"").split(/,|\b(?:but|then)\b/).pop();}
function anyGrainTarget(x){return String(x||"").split(/\b(?:and|or|plus)\b/).some(grainTarget);}   /* "wheat phulkas and red lentils instead of ..." */
function grainTarget(x){var w=words(String(x||""));while(w.length&&LEADV.test(w[0]))w.shift();
  var k=0;while(k<w.length&&(GRAIN_RX.test(w[k])||COMP_RX.test(w[k])))k++;w=w.slice(0,k);return w.length>0&&isGrain(w.join(" "));}
/* the person keeps a portion of their own ("your portion is 150 g", "have one", "you keep 150 g"): sharing the rest is not a removal */
var OWNPART=new RegExp("\\byour\\s+\\d+\\s*g\\b|\\byour\\s+(?:portion|share|serving)\\s+(?:is|of)\\s+\\d+\\s*g\\b|\\byou\\s+(?:keep|have|eat|get|take)\\s+(?:\\d+\\s*g\\b|one\\s+(?:small\\s+)?(?:bowl|plate|katori|serving)(?!\\s+of\\s+(?!(?:the\\s+)?(?:"+GRAINT+")\\b)))|\\b(?:keep|have|eat|take|reheat|serve)\\s+\\d+\\s*g\\b|\\b(?:have|eat|keep|take)\\s+(?:one|\\d+)(?:\\s+(?:of\\s+)?(?:the\\s+)?(?:"+GRAINT+"))?\\s*(?:[.;,!]|$)|\\b(?:have|eat|keep|take)\\s+(?:one|half(?:\\s+(?:the|a))?|\\d+)\\s+(?:"+GRAINT+")\\b|\\b\\d+\\s*g\\s+(?:is|are)\\s+(?:plenty|enough)|\\b(?:one|two|\\d+)\\s+of\\s+them\\b");   /* round 15-17: an amount of the grain kept; not "one and a half bowls of dal" */   /* round 15: an amount of the grain kept, not "your plate is dal and salad" */
var AMTKEPT=/\b\d+\s*g\b/,AMTGONE=/\b(?:not\s+even|none\s+of(?:\s+the)?|no|drop(?:\s+the)?|skip(?:\s+all)?(?:\s+the)?|without|remove(?:\s+the)?|lose(?:\s+the)?)\s+(?:all\s+)?(?:the\s+)?\d+\s*g\b/;
function keepsAmount(t){t=String(t).replace(/(?:\u2248|~|\babout|\baround|\bapprox\w*|\broughly)\s*\d+(?:\s*(?:-|to|\u2013)\s*\d+)?\s*g\b/g," ");   /* a menu portion's weight is the dish, not a grain kept */
  return OWNPART.test(t)||(AMTKEPT.test(t)&&!AMTGONE.test(t));}
var RMVERB=/^(?:leave|left|leaving|keep|kept|keeping|hold|held|holding|take|took|taken|put|set|move|moved|pack|packed|push|pushed|save|saved|cut|send|sent|give|gave|lay|clear|throw|toss|scrape|serve|served|bring|brought|let|ask|share|sharing)$/;
function removesGrain(text){
  /* Critic rounds 10 to 12. With diabetes a one-tap note, menu portion or ask that takes the grain off holds the change or order back. The
     model also declares the grain left after each change and the grain in each order (declaredGrain, grain_grams_after, grain_made_of); this
     reader is the check on its words.
     1. A restriction leaves the grain out even when no grain is named: "just the rajma", "the chole alone", "pick out the chicken", "only".
        An amount of the grain is not a restriction: "2 rotis only", "two rotis are enough", "1 dosa with its potato filling".
     2. Where a grain is named, a removal counts only when what it applies to is a grain: "skip the roti", "leave off the khichdi", "keep the
        rice and rotis in the kitchen", "the roti can wait". "Leave the butter off the roti", "the papad left out", "tandoori roti instead of
        naan", "choose jowar roti over white rice" keep the grain. */
  var t=" "+String(text||"").toLowerCase().replace(/[‘’“”"']/g,"").replace(/\bdon\s*t\b|\bdont\b/g,"do not").replace(/\b(?:off|out\s+of)\s+(?:the\s+)?(?:tawa|tava|stove|heat|flame|fire|pan|griddle|gas|hob|cooker|pressure\s+cooker|pot|oven|tandoor|kadai|kadhai|fridge|steamer)\b/g,"from the stove")
    .replace(/\bone[\s-]+(third|quarter|fourth)\b/g,"a $1").replace(/\s*-+>\s*/g," with ").replace(/\bover\s+(?:dinner|lunch|breakfast|the\s+meal|this\s+meal)\b/g,"at dinner").replace(/\b(?:do\s+not|not)\s+bother\s+(?:with|about)\b/g,"skip")
    .replace(/\bin\s+(?:the\s+|your\s+)?([a-z]+)\s+place\b/g,function(m0,x){var y=GRAIN_RX.test(x)?x:x.replace(/s$/,"");return GRAIN_RX.test(y)?"in place of the "+y:m0;}).replace(/\bnot\s+(?:on\s+(?:its|their)\s+own|alone|by\s+(?:it|them)sel(?:f|ves)|only)\b/g," ")+" ";   /* "with curd, not on its own" */
  var SEASON="(?:season\\w*|spic\\w*|temper\\w*|flavou?r\\w*|tadka|cumin|jeera|hing|asafoetida|salt|turmeric|pepper|ginger|garlic|chilli\\w*|herbs?|masala|coriander|mint|lemon|oil|ghee|butter)";
  var AMOUNT="(?:\\d|one|two|three|a\\s+little|a\\s+few|half|lightly|mild|a\\s+pinch|a\\s+dash|a\\s+squeeze|a\\s+teaspoon|minutes?|mins?)";
  /* 1. restrictions */
  var r=t.replace(new RegExp("\\b(?:only|just)\\s+(?:with\\s+|using\\s+|of\\s+)?"+AMOUNT+"[^,.;]*","g")," ")
         .replace(new RegExp("\\b(?:\\d+|one|two|three|four|a|an|half|a\\s+single|single)\\s+(?:[a-z]+\\s+){0,2}?(?:"+GRAINT+")\\s+(?:only|(?:is|are)\\s+(?:enough|plenty|sufficient)|will\\s+do)\\b","g")," ").replace(/\b(?:one|two|three|\d+)\s+only\b/g," ")   /* "2 rotis only" */
         .replace(new RegExp("\\b"+SEASON+"\\b(?:\\s+(?:and|with|,)?\\s*[a-z]+){0,3}\\s+only\\b","g")," ")
         .replace(new RegExp("\\b(?:using|made|keeping|seasoned|spiced|tempered|flavou?red)\\s+(?:with\\s+)?only\\b","g")," ")
         .replace(new RegExp("\\bonly\\s+(?:with\\s+|using\\s+)?(?:[a-z]+\\s+){0,2}"+SEASON+"\\b","g")," ");
  if(/\b(?:only|just\s+the|just\s+(?:eat|have)|alone|on\s+(?:their|its)\s+own|by\s+(?:it|them)sel(?:f|ves)|nothing\s+else|that\s+is\s+all|thats\s+all|whole\s+(?:dinner|lunch|meal|plate|breakfast)|(?:are|is|make|makes)\s+(?:the\s+)?(?:dinner|lunch|meal|breakfast)|(?:are|is)\s+enough|pick\s+out|picked\s+out|from\s+the\s+(?:top|thali|plate))\b/.test(r))return true;
  if((/\b(?:potato|aloo|masala|bhaji)\s+(?:filling|stuffing)\b/.test(r.split(/[,.;]/)[0]+" ")||/\b(?:the|eat|just|only)\s+(?:the\s+)?(?:potato|aloo|masala|bhaji|paneer|veg|vegetable)\s+(?:filling|stuffing)\b/.test(r))&&!hasGrainWord(r))return true;   /* the filling as what is eaten; "1 piece, potato filling" describes the dish */   /* "the potato filling and sambar"; "1 dosa with potato filling" is the dish */
  /* "fill up on paneer and palak instead": "instead" with nothing named as replaced takes the plate's grain */
  if(!hasGrainWord(t))return /\binstead\b(?!\s+of)/.test(t)&&!/\b(?:skip\w*|drop\w*|no|not|without|less|swap\w*|replac\w*|remov\w*|avoid\w*|cut|reduc\w*|leave|hold|omit\w*|rather)\b/.test(t);
  /* 2. a grain named with an absence word */
  var u=t.replace(new RegExp("\\bcut\\b[^.;,]*?\\b(?:to|by|down|half|third|quarter|back)\\b","g")," ");   /* "cut the rice to 70 g" makes less, it keeps the grain */
  /* a removal of part of the grain keeps the grain ("drop half a phulka", "swap 40 g of rice for ...", "replace a third of the rice") */
  u=u.replace(/\b(?:drop\w*|swap\w*|trade|replace\w*|skip\w*|remove\w*|reduce\w*)\s+(?:down\s+)?(?:to\s+(?:one|a\s+single|1)\b|half\b|a\s+(?:third|quarter|fourth|little)\b|\d+\s*(?:g|grams?)\b|(?:ten|twenty|thirty|forty|fifty|sixty|seventy|eighty)\s+grams?\b)[^.;,]*/g," ");
  /* a swap or "instead of" whose other side is a grain keeps the grain */
  var sw=/\b(?:swap|swapping|replace|replacing|exchange|trade|switch)\b([^.;?!]*?)\b(?:for|with|to|into)\b([^.;?!]*)/.exec(u);
  var nf=/\bno\s*[,:]\s*(?:for|with|use|try|have|make\s+it)\b([^.;?!]*)/.exec(t);   /* "swap the khichdi for brown rice? no, for lettuce cups" */
  if(nf&&!anyGrainTarget(nf[1]))return true;
  if(sw){var tgt=sw[2].split(/,|\b(?:then|if|and\s+(?:skip|drop|avoid|leave))\b/)[0];if(grainTarget(tgt.split(/\b(?:and|but|then)\b/)[0])||!hasGrainWord(sw[1]))u=u.replace(sw[0]," "+sw[2].slice(tgt.length));else return true;}   /* the grain swapped for something that is not a grain */
  var io=/([^.;?!]*)\b(?:instead\s+of|in\s+place\s+of|rather\s+than)\b([^.;,?!]*)/.exec(u);
  if(io){if(anyGrainTarget(lastClause(io[1]))||!hasGrainWord(io[2]))u=u.replace(io[0]," ");else return true;}
  var ov=/\b(?:choose|chose|prefer|pick|opt\s+for|go\s+for|select)\b((?:\s+[a-z0-9-]+){1,5}?)\s+over\b([^.;,?!]*)/.exec(u);   /* "choose a salad over the khichdi" */
  if(ov){if(anyGrainTarget(lastClause(ov[1]))||!hasGrainWord(ov[2]))u=u.replace(ov[0]," ");else return true;}
  /* a removal word counts when what it applies to is a grain ("no reheating", "skip cooking the bhurji", "without black pepper" stay) */
  var OBJV=/\b(no|not|never|without|skip\w*|avoid\w*|drop\w*|remov\w*|omit\w*|ditch\w*|forgo|forget|lose|minus|sans|exclud\w*|zero|save|leave|hold|cut|pass\s+on|give\s+up|do\s+without|go\s+without|do\s+away\s+with|rule\s+out|take|bin|shelve|cancel|return|scrap|chuck|discard|none|nope|nah)\b/g,hit=false,VERB=/^(?:eat|eating|serve|serving|bring|have|having|take|add|include|order|use|put|give|cook|cooking|make|making|try|to|be|any|the|a|an|your|all|extra|added|some|this|that|it|of|on|in|too|much|more)$/;
  u.replace(OBJV,function(m0,v,off,str){var rest=str.slice(off+m0.length).split(/[.;,?!]/)[0],w=words(rest),o=[],pre=str.slice(0,off);
    if(/[,;:]\s*$/.test(pre)||/[?]\s*$/.test(pre)){var before=lastClause(pre.replace(/[,;:?]\s*$/,"").split(/[.!;]/).pop()),first=w.filter(function(x){return !/^(?:the|a|an|for|at|this|that|thanks|thank|you|please|at|all|really|more)$/.test(x);})[0]||"";
      if(hasGrainWord(before)&&/^(?:leave|cut|take|drop|skip|hold|save)$/.test(v)&&/^\s*(?:it|them)\b/.test(rest)){
        if(!/^\s*(?:it|them)\s+(?:after|last|first|next|second|with|warm|soft|into|in\s+(?:half|a\s+cloth|quarters)|on\s+the\s+side|for\s+(?:the\s+)?(?:end|last|second)|(?:aside\s+|out\s+(?:on\s+the\s+counter\s+)?)?(?:to|so\s+it)\s+(?:cool|rest|set|soak|steam|warm|cools)|aside\s+for\s+(?:an?\s+)?(?:hour|few|\d))/.test(rest)&&!keepsAmount(t)&&!/\bthen\s+(?:eat|have|reheat|serve)\b/.test(t)){hit=true;return m0;}
        return m0;}   /* "rice? leave it for now", "rice, cut it out"; not "rice: take it after the salad", "leave it to cool, then eat 150 g" */
      if(/\b(?:not\s+even|none\s+of(?:\s+the)?|no)\s+\d+\s*g\b/.test(m0+rest)&&hasGrainWord(before)){hit=true;return m0;}   /* "rice, not even 50 g" */
      if(/\b(?:more\s+than|over|beyond|above|upto|up\s+to|at\s+most|max(?:imum)?)\s+\d+|^\s*(?:only\s+)?\d+\s*g\b/.test(rest))return m0;   /* "rice, not for me more than 150 g": an amount */
      if(hasGrainWord(before)&&(!first||/^(?:tonight|today|now|time|needed|wanted|required|necessary|again|anymore|yet|dinner|lunch|breakfast|day|meal|thanks|thank|please|way|chance|more|thx|sorry|ever|me|us|myself|mine)$/.test(first))){hit=true;return m0;}   /* "khichdi, not tonight", "rice, no thanks", "roti, skip" */
      if(hasGrainWord(before)&&anyGrainTarget(before)&&(hasGrainWord(rest)||/^(?:white|brown|refined|maida|polished)$/.test(first)))return m0;}   /* "tandoori roti, not butter naan", "rice, not white": one grain for another */
    if(/^\s*(?:it|them|that|those)\b/.test(rest)&&!/^(?:take|cut|save|leave|hold)$/.test(v)){hit=true;return m0;}   /* "skip it" after a grain is named */
    for(var i=0;i<w.length&&o.length<3;i++){if(VERB.test(w[i])&&!o.length)continue;if(BREAKW.test(w[i])&&w[i]!=="for")break;if(w[i]==="for"){if(!o.length)continue;break;}o.push(w[i]);}
    if(/^(?:leave|hold|save|take|cut)$/.test(v)){if(hasGrainWord(o.join(" "))&&!/^(?:off|out|aside|away|back|in)$/.test(o[0]||"")&&v!=="take"&&
      !/\b(?:to\s+(?:rest|cool|steam|set|soak|settle|stand|thicken)|for\s+(?:\d+|a\s+few|five|ten|two|three)\s*(?:min|mins|minutes?|secs?|seconds?)\b|while\b|so\s+(?:it|they)\b|until\s+(?:it|they)\b)/.test(rest))hit=true;return m0;}   /* "leave the rice to rest for 5 minutes" is cooking */   /* their particles are read below */
    if(hasGrainWord(o.join(" "))||/^(?:need|tonight|today|now|thanks|please)$/.test(w[0]||"")||/^(?:it|them|that|those)$/.test(o[0]||""))hit=true;return m0;});
  if(hit)return true;
  if(/\b(?:drop|skip|remove|cut|lose|leave)\s+(?:all\s+)?(?:the\s+)?(?:all\s+)?\d+\s*g\b(?!\s+(?:of|more|less|extra))/.test(u)&&!/\bto\s+\d+\s*g\b/.test(u))return true;   /* "rice: drop the 150 g", "skip all 150 g" (a grain is named) */
  /* off, out, aside, away, back: what they apply to is the object between the verb and the word ("keep the khichdi off the plate", "leave the
     butter off the roti"), or after it ("leave out the papad"), or before "to be ... " ("the chawal to be left off") */
  var cl=u.split(/[.;,?!]|\b(?:but|then)\b/);
  for(var c=0;c<cl.length;c++){var w=words(cl[c]);
    for(var i=0;i<w.length;i++){if(!/^(?:off|out|aside|away|back)$/.test(w[i]))continue;
      if(/^(?:to\s+(?:rest|cool|settle|stand|soak|steam|set|warm)|while|for\s+(?:a\s+few|\d+|five|ten|two|three)\s+min)/.test(w.slice(i+1).join(" ")))continue;   /* "set the khichdi aside to rest" */
      var j=i-1,between=[];while(j>=0&&i-j<=5&&!RMVERB.test(w[j])){between.unshift(w[j]);j--;}
      if(j<0||!RMVERB.test(w[j])){                                                  /* no removal verb: "khichdi off the menu", "khichdi out, paneer in" */
        if(between.length&&hasGrainWord(between.slice(-2).join(" "))&&between.every(function(x){return GRAIN_RX.test(x)||COMP_RX.test(x)||STOPW.test(x);}))return true;
        continue;}                                                                  /* "spread the khichdi out to cool" is not a removal */
      if(!between.length&&j>0&&/^(?:be|is|are|being|been|got|get|gets|was|were)$/.test(w[j-1])){var pv0=cl[c].match(/([a-z ]+?)\s+(?:to\s+be|is|are|be|being|been|gets?|got|was|were)\s+[a-z]+\s+(?:off|out|aside|away|back)\b/);
        if(pv0&&hasGrainWord(objectAfter(pv0[1].split(/\b(?:for|ask|them|to)\b/).pop())))return true;continue;}   /* "the butter to be kept off the pav" */
      if(!between.length&&j>0&&hasGrainWord(w[j-1]))return true;                   /* "khichdi set aside" */
      between=between.filter(function(x){return !STOPW.test(x);});
      var obj=between.join(" ");
      if(!obj){var a=[];for(var k=i+1;k<w.length&&a.length<3;k++){if((STOPW.test(w[k])||/^(?:on|of)$/.test(w[k]))&&!a.length)continue;if(BREAKW.test(w[k])||/^(?:completely|please)$/.test(w[k]))break;a.push(w[k]);}obj=a.join(" ");}
      if(!obj){var pv=cl[c].match(/([a-z ]+?)\s+(?:to\s+be|is|are|be|being|gets?|got)\s+[a-z]+\s+(?:off|out|aside|away|back)\b/);obj=pv?objectAfter(pv[1].split(/\b(?:for|ask|them|to)\b/).pop()):"";}
      if(hasGrainWord(obj))return true;}}
  /* a grain kept for later, sent elsewhere or left to wait: "pack the roti for tomorrow", "the roti can wait", "let the roti go" */
  for(c=0;c<cl.length;c++){var x=cl[c];if(!hasGrainWord(x))continue;
    if(/\b(?:separate\s+box|doggy\s+bag|boxed\s+(?:up|separately|for|to)|packed\s+up|parcel(?:led|ed)?|take\s+(?:it\s+|them\s+)?home|for\s+the\s+(?:table|family|kids|children|others)|to\s+share\s+(?:at\s+the\s+table|with\s+(?:the\s+)?(?:table|family|kids|children|others))|to\s+(?:the\s+)?(?:kids|children|family|others)|someone\s+else|somebody\s+else|off\s+the\s+(?:menu|order|list|bill)|another\s+time|a\s+(?:rest|break)(?!\s+(?:for\s+(?:\d+|a\s+few|five|ten|two|three|a\s+couple\s+of)\s*(?:min|mins|minutes?|secs?|seconds?)\b|between))|take\s+a\s+break\s+from)\b/.test(x)&&!OWNPART.test(t)&&!/\b(?:cook|cooks|cooked|soak|soaked|make|made|prepare|prep|boil|steam|knead|roast|ferment|batch)\b/.test(x))return true;
    var gm=/\b(?:goes|(?:can|could|should|may|will|must)\s+go|(?:is|are)\s+(?:off|out))\b(.*)$/.exec(x)||new RegExp("\\b(?:"+GRAINT+")\\s+go\\b(.*)$").exec(x);
    if(gm&&/^\s*(?:$|completely|entirely|altogether|for\s+good|for\s+(?:now|this|tonight|today|dinner|lunch|breakfast|a\s+while|a\s+week|\d+\s+days?|(?:two|three|a\s+few|few)\s+days|the\s+(?:day|night|evening|week|weekend|meal|rest))|this\s+(?:time|meal|evening|week|morning|afternoon)|tonight|today|away|off\s*$|unserved|untouched|uneaten|back\s+(?:in|into|to)\s+(?:the\s+)?(?:pot|kitchen|box|fridge|cooker|container|tiffin|counter)|back\s+(?:unserved|untouched|uneaten)|back\s*$|(?:in|into)\s+(?:the\s+)?(?:fridge|tiffin|box|freezer|container|bin)|to\s+(?:the\s+)?(?:fridge|kitchen|box|family|kids|table|others|freezer)|to\s+(?:your|the|my|his|her)\s+(?:husband|wife|son|daughter|kids|children|family|guests?|mother|father|parents|brother|sister|maid|neighbour|neighbor|friend)|off\s+the|(?:out\s+)?of\s+(?:the|this|my|your)\s+(?:plate|order|menu|meal|table|thali|dinner|lunch|breakfast)|(?:till|until)\s+(?:tomorrow|the\s+weekend|later|next|breakfast|lunch|dinner)|the\s+(?:plate|table|menu|order))/.test(gm[1])&&
       !new RegExp("\\b(?:half|most|some|part|rest|remaining|leftover|extra|excess|remainder|second|other|one)\\s+(?:of\\s+)?(?:the\\s+)?(?:"+GRAINT+")\\b").test(x)&&!(/\bfridge\b/.test(x)&&/\b(?:reheat|cool|chill|overnight|hour|minutes?)\b/.test(t))&&!keepsAmount(t)&&
       !/^\s*for\s+(?:the\s+|a\s+|some\s+)?(?:brown|red|white|jowar|millet|ragi|bajra|multigrain|whole|tandoori|plain|end|second|first)\b/.test(gm[1])&&
       !/\b(?:once|when|after|until|till|before|soon|if)\s+(?:the\s+|your\s+)?[a-z]+\s+(?:is|are)\s+(?:off|out)\b/.test(x)&&!/\b(?:cook|cooks|cooked|soak|make|prepare|boil|steam)\b/.test(x))return true;   /* "rice is off for this meal", "the rice goes back in the pot"; not "the rice goes last", "can go down to 150 g" */
    if(/\blet\s+(?:the\s+|your\s+)?[a-z]+(?:\s+[a-z]+)?\s+go\b|\bcan\s+wait\b|\bwait\s+for\s+(?:another|later|tomorrow)|\banother\s+day\b|\bwhere\s+the\s+[a-z]+\s+(?:was|were|used\s+to\s+be|would\s+(?:be|go|sit)|goes|will\s+go|went|sits|sat)\b|\bnone\s+(?:at\s+all|tonight|today)\b|\bnot\s+(?:wanted|needed|required|necessary)\b|\bno\s+need\b|\ba\s+miss\b|\bmiss\s+out\b|\bon\s+request\b|\boptional\b|\bexcluded\b|\bnot\s+included\b|\bstop\s+before\b/.test(x))return true;
    if(/\b(?:later|tomorrow|for\s+(?:breakfast|lunch|dinner|another)|to\s+go|take\s+(?:it\s+|them\s+)?home|separate\s+box|someone\s+else|somebody\s+else|someone\s+at|at\s+the\s+table|in\s+the\s+kitchen|in\s+the\s+pot|in(?:to)?\s+the\s+(?:fridge|freezer|box|tiffin|container))\b/.test(x)&&!(/\bfridge\b/.test(x)&&/\b(?:reheat|cool|chill|overnight|hour|minutes?)\b/.test(t))&&!OWNPART.test(t)&&
       words(x).some(function(v){return RMVERB.test(v)&&v!=="ask";})&&!/\b(?:cook|cooks|cooked|soak|soaked|make|made|prepare|prep|boil|steam|knead|roast|ferment|batch|leftover|from\s+(?:lunch|dinner|breakfast))\b/.test(x))return true;}
  return false;
}

/* ---------- the grain as the model declares it (Critic rounds 9, 10, 12: "ask the model for the grain item and its grams as a field and
   check that field"). Each plate names its grain item, what it is made of and its grams; each base swap what it is made of; each one-tap
   change the grams of grain left after it; each menu order the grain it holds and its grams. What it is made of must be a true grain from a
   fixed list; the item must be on the plate with at least 30 g; and the name and wording tests above still apply on top. ---------- */
var GRAINMAT=new RegExp("^(?:"+GRAINMATW+")$");
var MATFILL=/^(?:whole|flour|cooked|white|brown|red|black|hand|pounded|unpolished|polished|parboiled|grain|grains|and|plus|mixed|refined|fine|coarse|broken|cracked|beaten|rolled|steel|cut|flattened|puffed|pearl|finger|little|small|sona|masoori|matta|ponni|samba|wholemeal|wholewheat|durum|sprouted|kernel|kernels|chakki|ka|ki|ke|fresh|organic|stone|ground|stoneground|sharbati|multi|desi|pure|homemade|bombay|thin|soft)$/;
var MATCOMP=/^(?:moong|mung|dal|urad|lentils?|chana|masoor|toor|with|vegetables?|veg|veggies|spices|herbs|water|ghee|oil|onions?|tomato(?:es)?|peas|carrots?|potato(?:es)?|curd|yogh?urt|flakes|groats|grits|meal|malt|batter|dough|blend|fermented|soaked|fenugreek|methi|seeds)$/;
var PULSEFLOUR=/\b(?:moong|mung|urad|chana|besan|gram|chickpeas?|masoor|toor|soy|soya|lentils?|dal|rajma|beans?|peas?|peanuts?|almonds?|cashews?|walnuts?|nuts?|coconut|flax(?:seed)?s?|chia|sesame|seeds?|kathal|jackfruit|banana|singhara|singhare|sattu|tapioca|sabudana|arrowroot|quinoa\s+and\s+almond)[\s-]+(?:flour|meal|powder)\b/;
function isGrainMaterial(t){var s=attaNorm(String(t||"").toLowerCase()),w=words(s);
  if(PULSEFLOUR.test(s)||/\b(?:dal|daal)\s+(?:atta|flour)\b/.test(String(t||"").toLowerCase()))return false;                                             /* "besan atta", "wheat and chickpea flour": a pulse, nut or seed flour is not the grain (round 13) */
  return w.some(function(x){return GRAINMAT.test(x);})&&w.every(function(x){return GRAINMAT.test(x)||MATFILL.test(x)||MATCOMP.test(x)||(GRAIN_RX.test(x)&&x!=="thali"&&x!=="sattu");})&&!STAND.test(s);}   /* "rice and moong dal", "rice, dal and vegetables", "whole wheat bread", "idli rice"; not "oat milk", "rice bran" */
function sameFood(a,b){a=words(a).join(" ");b=words(b).join(" ");return !!a&&!!b&&(a===b||a.indexOf(b)>=0||b.indexOf(a)>=0);}
function declaredGrain(g,items){g=g&&typeof g==="object"?g:{};var food=quoted(g.food,60),mo=quoted(g.made_of,40);
  if(!food||!isGrainMaterial(mo))return null;
  var it=items.filter(function(i){return sameFood(i.food,food);})[0];
  if(!it||!(it.grams>=30)||!isGrain(it.food))return null;
  return {food:it.food,made_of:mo,grams:it.grams};}
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
function own(t,max,typed){var q=quoted(t,max),SW=/^(?:a|an|the|of|and|or|with|to|in|on|for|is|it|this|that|one|your)$/;
  function pairs(text,w){var x=String(text||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(" "),out=[];
    for(var i=0;i<x.length;i++){if(x[i]!==w)continue;var j=i-1,k=i+1;while(j>=0&&SW.test(x[j]))j--;while(k<x.length&&SW.test(x[k]))k++;
      if(j>=0&&j>=i-2)out.push("b:"+x[j]);if(k<x.length&&k<=i+2)out.push("a:"+x[k]);}return out;}
  var re=new RegExp(BANRX.source,"ig"),m,ql=q.toLowerCase();
  /* the word stays only when the person typed it beside the same content word (a dish they named that way), at most one small word between */
  while((m=re.exec(ql))){var w=m[2].replace(/[^a-z]+/g," ").trim();if(/\s/.test(w))return "";
    var mine=pairs(typed,w),theirs=pairs(ql,w);if(!theirs.some(function(p){return mine.indexOf(p)>=0;}))return "";}
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
  var dg=declaredGrain(m.grain,items);
  if(p.health==="diabetes"&&p.slot!=="snack"&&!dg)return {drop:"diabetes-grain"};   /* rule 3: a declared grain item, made of a true grain, on the plate, 30 g or more */
  var n={kcal:num(m.kcal,40,2500),protein:num(m.protein,0,250),carbs:num(m.carbs,0,400),fats:num(m.fats,0,200),fiber:num(m.fiber,0,80)};
  if(n.kcal==null||n.protein==null||n.carbs==null||n.fats==null||n.fiber==null)return {drop:"numbers"};
  var est=4*n.protein+4*n.carbs+9*n.fats;
  if(Math.abs(est-n.kcal)/n.kcal>0.15)return {drop:"energy"};
  var why=(Array.isArray(m.why)?m.why:[]).slice(0,3).map(function(w){return {pair:clean(w&&w.pair,60),effect:clean(w&&w.effect,150)};})
    .filter(function(w){return w.pair&&w.effect&&!CLAIM.test(w.pair+" "+w.effect)&&!supp(w.pair+" "+w.effect);});
  function swapList(list,kind){return (Array.isArray(list)?list:[]).slice(0,3).map(function(s){
      return {food:clean(s&&s.food,60),made_of:quoted(s&&s.made_of,40),grams:num(s&&s.grams,1,800),deltaKcal:delta(s&&s.deltaKcal,-400,400),deltaProtein:delta(s&&s.deltaProtein,-40,40),deltaCarbs:delta(s&&s.deltaCarbs,-80,80),deltaFats:delta(s&&s.deltaFats,-40,40),deltaFiber:delta(s&&s.deltaFiber,-20,20)};})
    .filter(function(s){return s.food&&!crosses(s.food,p)&&!supp(s.food)&&
      /* rule 3: with diabetes a base swap is a whole grain or millet, so no tap takes the grain off the plate */
      !(kind==="base"&&p.health==="diabetes"&&p.slot!=="snack"&&!(isGrainMaterial(s.made_of)&&isGrain(s.food)&&s.grams>=30))&&
      /* round 13: a protein swap takes the place of the first protein item; with diabetes it may not take the place of the grain item */
      !(kind==="protein"&&p.health==="diabetes"&&p.slot!=="snack"&&dg&&firstProt&&sameFood(firstProt.food,dg.food));});}
  var firstProt=items.filter(function(i){return i.group==="protein";})[0];
  var sw=m.swaps||{},swaps={protein:swapList(sw.protein,"protein"),base:swapList(sw.base,"base")};
  var al={},am=m.alchemy||{};
  ALCH.forEach(function(k){var a=am[k];if(!a||typeof a!=="object")return;
    var x={suffix:clean(a.titleSuffix,50),note:clean(a.note,140),deltaKcal:delta(a.deltaKcal,-400,400),deltaProtein:delta(a.deltaProtein,-10,40),deltaCarbs:delta(a.deltaCarbs,-80,40),deltaFats:delta(a.deltaFats,-30,30),deltaFiber:delta(a.deltaFiber,-10,20),minutes:a.minutes==null?null:num(a.minutes,0,180)};
    var txt=x.suffix+". "+x.note,after=num(a.grain_grams_after,0,800);
    if(!x.note||!x.suffix||crosses(txt,p)||supp(txt)||CLAIM.test(txt))return;
    if(p.health==="diabetes"&&p.slot!=="snack"&&!(dg&&after!=null&&after>=Math.max(30,dg.grams*0.5)&&keepsGrain(txt,n.carbs,x.deltaCarbs)))return;   /* rule 3: the grain stays, at least half of it, and no wording takes it off */
    al[k]=x;});
  return {meal:{title:title,subtitle:sub,cuisine:clean(m.cuisine,40),minutes:num(m.prepMinutes,0,180)||0,items:items,
    kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,why:why,swaps:swaps,alchemy:al,grain:dg||{food:"",made_of:"",grams:0}}};
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
"- grain: the meal's whole-grain or millet item: food copied letter for letter from items, made_of what that grain is made of (for example \"whole wheat\", \"brown rice\", \"foxtail millet\", \"jowar\"; never a vegetable, pulse, nut or seed), and its grams. A meal with no grain gives food \"\", made_of \"\" and grams 0. Each base swap also gives made_of the same way. Each one-tap change also gives grain_grams_after: the grams of the grain item after the change (0 if it takes the grain off).",
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
  var alch=obj(withD({titleSuffix:S,note:S,minutes:I,grain_grams_after:I}));
  var meal=obj({title:S,subtitle:S,cuisine:S,prepMinutes:I,
    items:{type:"ARRAY",items:obj({food:S,grams:I,group:{type:"STRING",enum:GROUPS}})},
    grain:obj({food:S,made_of:S,grams:I}),
    kcal:I,protein:I,carbs:I,fats:I,fiber:I,
    why:{type:"ARRAY",items:obj({pair:S,effect:S})},
    swaps:obj({protein:{type:"ARRAY",items:obj(withD({food:S,grams:I}))},base:{type:"ARRAY",items:obj(withD({food:S,grams:I,made_of:S}))}}),
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
