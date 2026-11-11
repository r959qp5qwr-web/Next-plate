/* ===== Options ===== */
var OPT={
  sit:[["home","Cooking"],["rush","In a rush"],["tiffin","Packing tiffin"],["out","Eating out"]],
  hunger:[["1","A little"],["2","Normal"],["3","Starving"]],
  goal:[["lose","Lose weight"],["steady","Hold steady"],["strength","Build strength"]],
  low:[["none","Nothing"],["iron","Iron"],["b12","B12"],["cal","Calcium and D"],["pro","Protein"],["fib","Fibre"]],
  diet:[["veg","Vegetarian"],["egg","Veg and egg"],["nonveg","Non-veg"],["jain","Jain"],["vegan","Vegan"]],
  health:[["none","Nothing to flag"],["diabetes","Diabetes"],["bp","High BP"],["kidney","Kidney condition"],["preg","Pregnant or nursing"]],
  region:[["n","North"],["s","South"],["w","West"],["e","East"]],
  leave:[["dairy","Dairy"],["nut","Nuts"],["wheat","Wheat"],["soya","Soya"]]
};
var LAB={sit:"Today I'm",hunger:"Hunger",goal:"Goal",low:"Running low on",diet:"I eat",health:"Health",region:"Home food",leave:"Leave out"};

/* ===== DEMONSTRATION CATALOGUE. Drafted for this prototype; not coach-approved. =====
   [name, meals, diet, jainOk, region, situations, leansOn, minutes(0=order), form(p plate|s snack), tags(P protein-forward, L lean), items, why, swaps]
   item: "amount|unit|food||role|short|label"   role: g grain, p protein, v vegetables (only these change with hunger and goal)
   swap: "itemIndex|amount|unit|food||role|short|dietLevel|jainOk" */
var RAW=[
["Moong dal chilla with curd","b","veg",1,"n","home","pro fib",15,"p","P",["2||thin moong dal chilla||g|chilla","1|katori|curd||p|curd","1|small bowl|cucumber and tomato|||"],"Dal batter gives protein first thing, so the morning stays steady.",["0|2||thin besan chilla||g|chilla|vegan|1"]],
["Vegetable poha with sprouts","b","vegan",0,"w","home tiffin","iron fib",15,"p","",["1.5|katori|poha with peas and peanuts||g|poha","1|small katori|sprouted moong||p|sprouts","0.5||lemon, squeezed over|||"],"Poha and sprouts carry iron, and the lemon helps the body take it up.",["0|1.5|katori|vegetable upma||g|upma|vegan|0"]],
["Idli with vegetable sambar","b","vegan",0,"s","home rush out","pro fib",10,"p","",["3||idli||g|idli","1.5|katori|sambar, heavy on vegetables||p|sambar","1|tablespoon|coconut chutney|||"],"Steamed, not fried, and the sambar brings dal and vegetables together.",["0|2||plain dosa, little oil||g|dosa|vegan|0"]],
["Ragi dosa with sambar","b","vegan",0,"s","home","cal iron fib",20,"p","",["2||ragi dosa||g|dosa","1|katori|sambar||p|sambar","1|small bowl|sauteed greens||v|greens"],"Ragi is one of the richest everyday sources of calcium.",["0|1|bowl|ragi porridge with milk||||veg|0"]],
["Egg bhurji with phulka","b","egg",0,"*","home rush","pro b12",10,"p","P",["2|eggs|as bhurji with tomato and capsicum||p|egg","1||phulka or slice of whole wheat toast||g|phulka","1||guava or orange|||"],"Eggs give protein and B12 in ten minutes.",["0|2||boiled eggs||p|egg|egg|0"]],
["Paneer besan chilla","b","veg",1,"n","home","pro cal b12",20,"p","P",["2||besan chilla filled with crumbled paneer||g|chilla","2|teaspoons|mint chutney|||","1|small bowl|cucumber|||"],"Paneer adds calcium and B12 to a plain chilla.",["0|2||besan chilla filled with tofu||g|chilla|vegan|1"]],
["Vegetable oats upma with curd","b","veg",0,"*","home rush","fib",10,"p","",["1.5|katori|oats upma with carrot, beans and peas||g|upma","1|katori|curd||p|curd"],"Oats and vegetables bring fibre that keeps you full till lunch.",["0|1.5|katori|vegetable dalia||g|dalia|vegan|0"]],
["Curd bowl with fruit and chana","b","veg",1,"*","rush tiffin","cal b12 pro",5,"s","P",["1|katori|curd||p|curd","1||seasonal fruit, chopped|||","1|fistful|roasted chana|||","5||almonds or peanuts||||5 or 6"],"No cooking. Curd covers calcium and B12, chana adds protein.",["0|1|glass|milk||||veg|1"]],
["Vegetable dalia with peanuts","b","vegan",0,"n","home tiffin","fib iron",20,"p","",["1.5|katori|broken wheat cooked with vegetables||g|dalia","1|fistful|roasted peanuts|||","0.5||lemon, squeezed over|||"],"Broken wheat digests slowly and holds hunger for hours.",["0|1.5|katori|millet upma with vegetables||g|upma|vegan|0"]],
["Plain dosa with sambar","b","vegan",0,"*","out","fib pro",0,"p","",["1||plain dosa, ask for less oil||g|dosa","1|katori|sambar||p|sambar","1|tablespoon|chutney|||"],"A plain dosa skips the potato filling and the butter.",["0|3||idli||g|idli|vegan|0"]],
["Poha and a glass of chaas","b","veg",0,"w","out","iron",0,"p","",["1|plate|poha|||","1|glass|plain chaas|||","0.5||lemon, squeezed over|||"],"Poha is the lightest thing on most breakfast counters, and chaas adds the protein it lacks.",["1|1|katori|curd||p|curd|veg|0"]],
["Dal, sabzi and phulka","l","vegan",1,"n","home tiffin","iron fib pro",30,"p","L",["2||phulka without ghee||g|phulka","1|katori|masoor or moong dal||p|dal","1.5|katori|seasonal sabzi||v|sabzi","1|bowl|salad with lemon|||"],"The everyday thali, with sabzi taking the most room on the plate.",["0|1|katori|rice||g|rice|vegan|1"]],
["Rajma, rice and kachumber","l","vegan",0,"n","home tiffin out","iron fib pro",40,"p","L",["1|katori|rajma||p|rajma","1|katori|rice||g|rice","1|big bowl|kachumber with lemon|||"],"Rajma gives protein, iron and fibre in one bowl.",["0|1|katori|chole or lobia||p|chole|vegan|0"]],
["Sambar rice, poriyal and curd","l","veg",0,"s","home tiffin","cal fib",30,"p","",["1|katori|rice mixed with 1.5 katori sambar|||","1|katori|beans or cabbage poriyal||v|poriyal","1|katori|curd||p|curd"],"Rice stays measured while sambar, poriyal and curd fill the plate.",["0|1|katori|millet mixed with 1.5 katori sambar||||vegan|0"]],
["Palak paneer with phulka","l d","veg",0,"n","home out","cal iron pro b12",30,"p","L",["1|katori|palak paneer||p|palak paneer","2||phulka||g|phulka","1|bowl|salad with lemon|||"],"Paneer brings protein and calcium, palak brings greens.",["0|1|katori|palak with tofu||p|palak|vegan|0"]],
["Chole with phulka and salad","l","vegan",0,"n","home out tiffin","iron fib pro",40,"p","L",["1|katori|chole, light on oil||p|chole","2||phulka||g|phulka","1|big bowl|onion, cucumber and tomato salad with lemon|||"],"Chickpeas give protein and fibre that last through the afternoon.",["0|1|katori|black chana||p|chana|vegan|0"]],
["Home-style chicken curry","l","nonveg",0,"*","home","pro b12 iron",40,"p","P",["1|katori|chicken curry, 3 or 4 pieces, thin gravy||p|curry","2||phulka||g|phulka","1|katori|sabzi or a big salad||v|sabzi"],"Chicken is lean protein with B12 and iron the body takes up easily.",["0|1|katori|fish curry, 2 pieces||p|curry|nonveg|0"]],
["Fish curry with rice and greens","l","nonveg",0,"e","home","pro b12 cal",35,"p","P",["1|katori|fish curry, 2 pieces||p|curry","1|katori|rice||g|rice","1|katori|saag or sauteed greens||v|greens"],"Fish gives protein and B12, and small fish add calcium and some vitamin D.",["0|2|eggs|as curry||p|egg|egg|0"]],
["Egg curry with phulka","l","egg",0,"*","home tiffin","pro b12",25,"p","P",["2|eggs|as curry in thin gravy||p|egg","2||phulka||g|phulka","1|big bowl|salad with lemon|||"],"Two eggs cover the protein, the salad covers the volume.",["0|2|eggs|as bhurji||p|egg|egg|0"]],
["Curd rice with sprout salad","l","veg",0,"s","tiffin rush","cal b12",10,"p","",["1.5|katori|curd rice||g|curd rice","1|katori|sprouted moong salad with cucumber||p|sprouts","0.5||lemon, squeezed over the sprouts|||"],"Travels well, eats cold, and the sprouts add the protein curd rice lacks.",["0|1.5|katori|lemon rice with peanuts||g|rice|vegan|0"]],
["Bajra roti, dal and methi","l","vegan",1,"w","home","iron fib cal",35,"p","L",["2|small|bajra or jowar roti||g|roti","1|katori|dal||p|dal","1|katori|methi or other green sabzi||v|sabzi","1|bowl|salad with lemon|||"],"Millet roti and greens bring iron and fibre a wheat roti does not.",["0|2||phulka||g|phulka|vegan|1"]],
["Dal tadka, veg and roti","l d","vegan",0,"*","out","fib pro iron",0,"p","L",["1||tandoori roti, ask for no butter||g|roti","1|katori|dal tadka||p|dal","1|katori|mixed vegetable||v|vegetable","1|plate|green salad with lemon|||"],"The simplest order on any menu: one roti, dal, a vegetable, a salad.",["0|0.5|portion|jeera rice||||vegan|0"]],
["Tandoori chicken, roti, salad","l d","nonveg",0,"*","out","pro b12",0,"p","PL",["2|pieces|tandoori chicken or fish tikka||p|chicken","1||tandoori roti, no butter||g|roti","1|plate|green salad with lemon|||"],"Tandoor cooking needs no gravy, so the protein comes without the oil.",["0|4|pieces|paneer tikka||p|tikka|veg|0"]],
["Besan chilla with curd","l d","veg",1,"n","rush","pro",10,"p","P",["2||besan chilla||g|chilla","1|katori|curd||p|curd","1|bowl|cucumber and tomato salad|||"],"Ten minutes from flour to plate, and besan is a dal, so the protein is covered.",["1|1|glass|chaas||||veg|1"]],
["Paneer bhurji roti roll","l","veg",0,"*","rush tiffin","pro cal b12",10,"p","P",["2||phulka, rolled||g|phulka","0.5|katori|paneer bhurji with capsicum||p|bhurji","1||cucumber, sliced, with lemon|||"],"Rolls in ten minutes, eats with one hand, and paneer carries the protein.",["1|0.5|katori|tofu bhurji with capsicum||p|bhurji|vegan|0"]],
["Roasted chana and a fruit","s","vegan",1,"*","rush tiffin out","pro fib iron",1,"s","",["1|fistful|roasted chana|||","1||guava, apple or orange|||"],"Protein and fibre in the pocket, so dinner does not turn into a second lunch.",["0|1|fistful|roasted peanuts||||vegan|1"]],
["Sprout chaat with lemon","s","vegan",0,"*","home rush","iron pro fib",10,"s","PL",["1|katori|boiled sprouted moong||p|sprouts","0.5|katori|chopped tomato, cucumber and coriander|||","0.5||lemon, squeezed over|||"],"Sprouts and lemon together are a good everyday iron pairing.",["0|1|katori|boiled black chana||p|chana|vegan|0"]],
["Chaas and peanuts","s","veg",1,"*","home rush tiffin","cal b12",2,"s","P",["1|glass|thin chaas with roasted jeera|||","1|fistful|roasted peanuts|||"],"Chaas brings calcium and B12 with very little fat.",["0|1|glass|milk, no sugar||||veg|1"]],
["Boiled eggs with cucumber","s","egg",0,"*","home rush tiffin","pro b12",10,"s","PL",["2||boiled eggs||p|egg","1||cucumber, sliced, with lemon and pepper|||"],"Two eggs hold hunger for about three hours.",["0|1|katori|sprouted moong||p|sprouts|vegan|0"]],
["Roasted makhana with milk","s","veg",1,"*","home rush","cal b12",8,"s","",["1.5|katori|makhana roasted in half a teaspoon of ghee|||","1|glass|milk, no sugar|||"],"Milk and makhana cover calcium in a light evening bite.",["1|1|glass|chaas||||veg|1"]],
["Hung curd dip and veg sticks","s","veg",1,"*","home rush","pro cal",5,"s","PL",["0.5|katori|hung curd with mint and jeera||p|dip","1|plate|cucumber and capsicum sticks|||","1|small|khakhra|||"],"Thick curd is mostly protein, and the vegetables add crunch without the fry.",["0|0.5|katori|hummus||p|hummus|vegan|0"]],
["Roasted corn with lemon","s","vegan",1,"*","out","fib",0,"s","",["1||roasted corn cob with lemon, light on salt|||"],"Roasted, not fried, and slow to eat.",["0|1|plate|bhel with extra sprouts, no sev||||vegan|0"]],
["Idli plate at the canteen","s","vegan",0,"*","out","pro",0,"s","",["2||idli||g|idli","1|katori|sambar||p|sambar"],"Steamed, filling, and on almost every canteen counter.",["0|1||plain uttapam, less oil||g|uttapam|vegan|0"]],
["Fruit and a fistful of nuts","s","vegan",1,"*","rush tiffin out","fib",1,"s","",["1||apple, pear or guava|||","1|fistful|almonds, walnuts or peanuts|||"],"Fruit for now, nuts so it lasts till dinner.",["1|1|fistful|roasted chana||||vegan|1"]],
["Moong dal khichdi","d","veg",1,"*","home","pro fib",30,"p","",["1.5|katori|moong dal khichdi with lauki or beans||g|khichdi","1|katori|curd||p|curd","1|small bowl|salad|||"],"Soft, light on the stomach, and dal and rice together make complete protein.",["0|1.5|katori|vegetable dalia khichdi||g|khichdi|vegan|1"]],
["Dal soup with paneer bhurji","d","veg",0,"n","home","pro cal b12",25,"p","PL",["1|big bowl|thin dal and vegetable soup|||","0.5|katori|paneer bhurji||p|bhurji","1||phulka||g|phulka"],"Protein leads at night and the grain stays small.",["1|0.5|katori|tofu bhurji||p|bhurji|vegan|0"]],
["Lauki sabzi, dal and phulka","d","vegan",1,"n","home tiffin","fib pro",25,"p","L",["1.5|katori|lauki or tori sabzi||v|sabzi","1|katori|moong dal||p|dal","1||phulka||g|phulka"],"A light dinner that digests well before sleep.",["0|1.5|katori|any gourd or green sabzi in season||v|sabzi|vegan|1"]],
["Grilled fish and vegetables","d","nonveg",0,"*","home","pro b12 cal",25,"p","PL",["1|palm-size piece|fish, grilled or pan-seared in 1 teaspoon oil|||","1.5|katori|sauteed beans, carrot and capsicum||v|vegetables","1||phulka||g|phulka"],"A protein-first dinner with little grain and little oil.",["0|1|palm-size piece|chicken breast, grilled||||nonveg|0"]],
["Masala omelette and vegetables","d","egg",0,"*","home rush","pro b12",10,"p","PL",["2|eggs|as omelette with onion, tomato and coriander||p|egg","1|katori|sauteed vegetables||v|vegetables","1||phulka||g|phulka"],"Ten minutes on the stove and the protein is covered.",["0|2|eggs|as bhurji||p|egg|egg|0"]],
["Soya chunk sabzi with phulka","d l","vegan",0,"*","home tiffin","pro iron cal",25,"p","P",["1|katori|soya chunk and capsicum sabzi||p|soya","2||phulka||g|phulka","1|bowl|salad with lemon|||"],"Soya is the cheapest strong protein in a vegetarian kitchen.",["0|1|katori|tofu and capsicum sabzi||p|tofu|vegan|0"]],
["Millet upma with sambar","d","vegan",0,"s","home","cal iron fib",25,"p","",["1.5|katori|foxtail millet upma with vegetables||g|upma","1|katori|sambar||p|sambar","1|small bowl|sauteed greens||v|greens"],"Millets bring more fibre and minerals than polished rice.",["0|2|small|ragi mudde||g|mudde|vegan|0"]],
["Soup, paneer tikka, roti","d","veg",0,"*","out","pro cal",0,"p","PL",["1|bowl|clear vegetable or tomato soup, no cream|||","4|pieces|paneer tikka||p|tikka","1||tandoori roti, no butter||g|roti","1|plate|green salad|||"],"Starting with soup slows the meal, and tikka keeps the oil low.",["1|1|katori|dal tadka||p|dal|vegan|0"]],
["Sprout and paneer bowl","d l","veg",0,"*","rush tiffin","pro cal iron",10,"p","PL",["1|katori|boiled sprouted moong||p|sprouts","0.5|katori|paneer cubes|||","1|katori|cucumber, tomato and capsicum||v|vegetables","0.5||lemon, squeezed over|||"],"No stove beyond boiling the sprouts, and two proteins in one bowl.",["1|0.5|katori|tofu cubes||||vegan|0"]]
];
function parseItem(s){var a=s.split("|");return {n:+a[0],u:a[1],t:a[2],role:a[4]||"",short:a[5]||"",label:a[6]||""};}
var CAT=RAW.map(function(r,id){
  return {id:id,n:r[0],slots:r[1].split(" "),d:r[2],j:!!r[3],r:r[4],sits:r[5].split(" "),low:r[6].split(" "),min:r[7],form:r[8],tags:r[9],
    items:r[10].map(parseItem),why:r[11],
    swaps:r[12].map(function(s){var a=s.split("|"),it=parseItem(a.slice(1,7).join("|"));it.i=+a[0];it.d=a[7];it.j=a[8]==="1";return it;})};
});

/* ===== FIXED WORDING. Drafted for this prototype; every line awaits the coach's review. ===== */
var LOWNOTE={
  iron:"You picked iron: squeeze lemon on the plate, and keep tea and coffee an hour away from this meal.",
  b12:"You picked B12: food helps only through dairy, eggs, fish or meat. Food alone does not fix a low B12. That is for your doctor.",
  cal:"You picked calcium and D: these plates lean on calcium. Food alone does not fix a low vitamin D. That is for your doctor.",
  pro:"You picked protein: a palm of protein at every meal works better than one big serving at dinner.",
  fib:"You picked fibre: raise it slowly over two weeks and drink water with it."
};
var HEALTHNOTE={
  diabetes:"With diabetes the grain stays as written. Don't skip it if you take medication, and no juice.",
  bp:"With high BP: no pickle, papad or salt added at the table."
};
var GOALNOTE={
  lose:"Losing weight: the grain stays as written. Second helpings come from sabzi, salad or dal.",
  strength:"Building strength: don't skip the protein on this plate."
};
var HUNGERFALLBACK={"1":"A little hungry: a smaller serving of the same things is fine.","3":"Starving: add dal, curd or sabzi before adding anything else."};
var SAFETY="This one goes back to your coach and your doctor. No plate today.";
var LATENOTE="It's late, so lighter plates come first tonight.";
var ALIAS={dairy:["milk","curd","paneer","chaas","ghee","raita","lassi","butter"],nut:["nut","peanut","almond","walnut"],wheat:["phulka","wheat","dalia","toast","khakhra","tandoori roti","vegetable upma"],soya:["soya","tofu"]};
var DIETOK={vegan:["vegan"],veg:["vegan","veg"],jain:["vegan","veg"],egg:["vegan","veg","egg"],nonveg:["vegan","veg","egg","nonveg"]};

var LOWNAME={iron:"iron",b12:"B12",cal:"calcium and D",pro:"protein",fib:"fibre"};
var MEALNAME={breakfast:"Breakfast",lunch:"Lunch",snack:"Snack",dinner:"Dinner"};
function lab(k,v){var o=OPT[k];for(var i=0;i<o.length;i++)if(o[i][0]===v)return o[i][1];return "";}
