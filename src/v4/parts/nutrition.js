/* ---------- rough nutrition from household measures ----------
   [pattern, per 150 ml katori [kcal, protein, carbs, fibre], per piece [kcal, protein, carbs, fibre]]
   Typical home-cooking values, drafted for this prototype and awaiting the coach's review. */
var NUT=[
 [/rice mixed with|millet mixed with/,[355,11,65,6],0],[/curd rice/,[200,5,32,1],0],[/khichdi/,[180,6.5,30,3],0],[/biryani/,[260,6,38,2],0],[/pulao|jeera rice|lemon rice|tahiri/,[220,4.5,38,2],0],
 [/hung curd/,[150,12,6,0],0],[/hummus/,[250,11,20,8],0],[/dal and vegetable soup|dal soup/,[80,4,12,3],0],[/soup/,[50,1.5,9,2],0],[/rasam/,[40,1,7,1],0],[/sambar/,[110,5,16,4],0],[/kadhi/,[120,4,10,1],0],
 [/chilla|cheela/,0,[100,5,12,2.5]],[/palak paneer/,[220,10,8,3],0],[/paneer bhurji/,[300,17,7,1.5],0],[/paneer tikka/,0,[55,3.5,1,0]],[/paneer/,[290,18,4,0],0],
 [/tofu bhurji/,[200,16,6,2],0],[/palak with tofu/,[160,10,8,3],0],[/tofu/,[180,15,5,2],0],[/soya/,[170,14,12,5],0],
 [/rajma|chole|lobia|chana|chickpea/,[160,8,24,7],[110,6,17,5]],[/sprout|sundal/,[110,8,18,6],0],
 [/chicken curry/,[230,22,6,1],0],[/fish curry|jhol/,[200,20,5,1],0],[/tandoori chicken|fish tikka|chicken tikka/,0,[85,12,1,0]],[/chicken/,[230,22,6,1],[85,12,1,0]],[/fish|rohu|katla|surmai|machh|maach/,[200,20,5,1],[85,12,1,0]],
 [/egg|omelette/,0,[75,6,.5,0]],
 [/dal|dalma|kootu/,[130,7,20,5],0],[/raita/,[80,4,7,1],0],[/curd|dahi|yogurt|chhena/,[90,5,7,0],0],
 [/poha/,[180,4.5,32,2.5],0],[/upma/,[170,5,28,3],0],[/dalia|broken wheat/,[160,5,30,5],0],[/porridge/,[150,5,24,3],0],[/rice/,[190,4,42,.6],0],
 [/makhana/,[50,1.2,9,1.5],0],[/coconut chutney/,[400,4,10,8],0],[/chutney/,[60,2,10,3],0],
 [/tandoori roti|naan/,0,[120,3.5,24,2.5]],[/bajra|jowar|millet roti|ragi roti|missi/,0,[100,3,20,3]],[/phulka|roti|chapati|toast|bread|pav/,0,[80,2.7,16,2.3]],
 [/ragi dosa/,0,[110,3,20,2.5]],[/uttapam/,0,[160,4,26,2]],[/dosa/,0,[120,3,22,1]],[/idli/,0,[60,2,12,.8]],[/mudde/,0,[110,2.5,24,3]],[/khakhra/,0,[60,2,10,1.5]],[/corn/,0,[120,4,25,3]],
 [/samosa|cutlet/,0,[150,3,18,1.5]],[/pizza/,0,[240,9,30,2]],
 [/almond|walnut/,0,[7,.25,.25,.15]],[/peanut/,0,[6,.3,.2,.1]],
 [/fruit|guava|apple|orange|pear|banana|papaya/,[60,1,15,3],[60,1,15,3]],
 [/sabzi|poriyal|vegetable|greens|saag|beans|bhindi|lauki|tori|gourd|cabbage|methi|palak|capsicum|torkari|tarkari|chorchori|bhaji/,[90,2.5,10,4],0],
 [/salad|kachumber|cucumber|tomato|carrot|radish|sticks|onion/,[25,1,5,2],[15,.5,3,1]],
 [/lemon/,[0,0,0,0],[0,0,0,0]]
];
var UK={katori:1,"small katori":.6,bowl:1.2,"big bowl":1.8,"small bowl":.7,plate:1.6,portion:.8,tablespoon:.1,teaspoon:.04,teaspoons:.04};
function nx(a,n){return {k:a[0]*n,p:a[1]*n,c:a[2]*n,f:a[3]*n};}
function nutOf(it){
  var t=(it.t||"").toLowerCase(),u=(it.u||"").toLowerCase(),n=+it.n||0,g;
  if(!n)return nx([0,0,0,0],0);
  if(u==="glass")return nx(/milk|porridge/.test(t)?[120,6,10,0]:/lassi/.test(t)?[150,6,22,0]:/chaas|buttermilk/.test(t)?[40,2,3,0]:/juice/.test(t)?[110,1,26,0]:/chai|tea|coffee/.test(t)?[70,2,10,0]:[40,1.5,4,0],n);
  if(u==="fistful")return nx(/chana/.test(t)?[110,6,17,5]:/peanut/.test(t)?[145,6.5,4,2.2]:/almond|walnut|nut/.test(t)?[120,4,4,2.5]:/makhana/.test(t)?[40,1,7,1.2]:/sprout/.test(t)?[40,3,7,2]:[100,4,10,2],n);
  if(u==="palm-size piece")return nx(/chicken/.test(t)?[165,30,0,0]:/fish/.test(t)?[160,22,0,0]:/paneer/.test(t)?[260,16,4,0]:[150,15,2,0],n);
  if(u==="eggs")return nx(/bhurji|omelette|curry|fried/.test(t)?[110,6,1,0]:[75,6,.5,0],n);
  if(u==="slice")return nx(/pizza/.test(t)?[240,9,30,2]:[80,2.5,15,1.2],n);
  for(var i=0;i<NUT.length;i++){var e=NUT[i];if(!e[0].test(t))continue;
    if(/egg|omelette/.test(t)&&e[2]&&UK[u]==null)return nx(/bhurji|omelette|curry/.test(t)?[110,6,1,0]:[75,6,.5,0],n);
    if(UK[u]!=null&&e[1])return nx(e[1],UK[u]*n);
    if(e[2])return nx(e[2],n);
    if(e[1])return nx(e[1],(UK[u]||1)*n);
  }
  g=groupOf(it);return nx(g==="grain"?[180,4,36,2]:g==="pro"?[140,7,14,3]:g==="veg"?[80,2.5,10,4]:[40,1,6,1],(UK[u]||.6)*n);
}
function nutPlate(items){var k=0,p=0,c=0,f=0;items.forEach(function(it){var x=nutOf(it);k+=x.k;p+=x.p;c+=x.c;f+=x.f;});return {k:Math.round(k/10)*10,p:Math.round(p),c:Math.round(c),f:Math.round(f),rk:k};}

/* ---------- the after-meal curve: a model of direction, not a blood sugar reading ----------
   Carbs push the curve up; fibre, protein and fat slow it. Eating vegetables first and a short walk after lower it.
   The size of each effect is illustrative; published studies of meal order and of light walking after meals show the direction. */
function riseOf(nu,hab){
  var fat=Math.max(0,(nu.rk!=null?nu.rk:nu.k)-4*nu.p-4*nu.c)/9,avail=Math.max(0,nu.c-nu.f);
  var raw=avail*1.35/(1+nu.p*.02+nu.f*.035+fat*.012);
  var act=raw*(hab&&hab.veg?.75:1)*(hab&&hab.walk?.82:1)*(hab&&hab.lemon?.93:1);
  function band(x){return x<30?"Gentle":x<50?"Moderate":"Sharp";}
  return {raw:Math.min(100,Math.round(raw)),idx:Math.min(100,Math.round(act)),band:band(act),band0:band(raw),tp:Math.round(42+Math.min(26,nu.f*.5+fat*.3))};
}
function bandCls(b){return b==="Gentle"?"band-g":b==="Moderate"?"band-m":"band-s";}
