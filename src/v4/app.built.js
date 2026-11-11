/* ===== Next Plate v4: Today, Lab, Rescue, Rhythm, Ask ===== */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var $=function(id){return document.getElementById(id);};
var NS="http://www.w3.org/2000/svg";
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function ic(name){var s=document.createElementNS(NS,"svg");s.setAttribute("class","i");s.setAttribute("aria-hidden","true");var u=document.createElementNS(NS,"use");u.setAttribute("href","#i-"+name);s.appendChild(u);return s;}
function btn(cls,label,icon,id){var b=el("button",cls);b.type="button";if(id)b.id=id;if(icon)b.appendChild(ic(icon));if(label!=null)b.appendChild(el("span",null,label));return b;}
function add(p){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c)p.appendChild(c);}return p;}
function hash01(a){a=Math.imul(a^0x9E3779B9,2654435761);a^=a>>>15;a=Math.imul(a,2246822519);a^=a>>>13;return ((a>>>0)%100003)/100003;}


/* ---------- state ---------- */
var now=new Date(),hr=now.getHours()+now.getMinutes()/60;
var CLOCK=hr<4?"dinner":hr<11?"breakfast":hr<15.5?"lunch":hr<18.5?"snack":"dinner";
var MEALS=[["breakfast","Breakfast","sunrise",7.5,9.5],["lunch","Lunch","sun",12.5,14],["snack","Snack","cup",16,17.5],["dinner","Dinner","moon",19.5,21]];
var SITICON={home:"pan",rush:"bolt",tiffin:"tiffin",out:"store"},GOALICON={lose:"down",steady:"scale",strength:"dumbbell"};
var MODES=[["desk","Desk day","Mostly sitting","desk"],["active","Active day","Gym, sport or a long walk","dumbbell"],["trek","Trek day","A long hike or climb","mountain"],["rest","Rest day","Taking it easy","moon"]];
function modeOf(k){for(var i=0;i<MODES.length;i++)if(MODES[i][0]===k)return MODES[i];return MODES[0];}
function mealName(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][1];return k;}
function mealIcon(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][2];return "sun";}
var DAY=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
var S={meal:CLOCK,sit:"home",hunger:"2",h10:5,goal:"steady",low:"none",mode:"desk"};
var M={diet:null,health:null,region:"n",leave:[],kg:0,done:false};
var LOG=[],DAYST={day:DAY,water:0,walk:{}};
try{var raw=JSON.parse(localStorage.getItem("np-peak")||"null");if(raw){
  if(lab("diet",raw.diet))M.diet=raw.diet;if(lab("health",raw.health))M.health=raw.health;if(lab("region",raw.region))M.region=raw.region;
  if(Array.isArray(raw.leave))M.leave=raw.leave.filter(function(k){return !!lab("leave",k);});
  if(+raw.kg>=30&&+raw.kg<=200)M.kg=Math.round(+raw.kg);
  M.done=!!raw.done&&!!M.diet&&!!M.health;
  if(lab("goal",raw.goal))S.goal=raw.goal;if(lab("low",raw.low))S.low=raw.low;
  if(raw.mode&&modeOf(raw.mode)[0]===raw.mode)S.mode=raw.mode;
  if(Array.isArray(raw.log))LOG=raw.log.filter(function(l){return l&&l.day===DAY&&typeof l.name==="string";}).slice(-4);
  if(raw.dayst&&raw.dayst.day===DAY)DAYST={day:DAY,water:Math.max(0,Math.min(20,+raw.dayst.water||0)),walk:raw.dayst.walk&&typeof raw.dayst.walk==="object"?raw.dayst.walk:{}};
}}catch(e){}
function save(){try{localStorage.setItem("np-peak",JSON.stringify({diet:M.diet,health:M.health,region:M.region,leave:M.leave,kg:M.kg,done:M.done,goal:S.goal,low:S.low,mode:S.mode,log:LOG,dayst:DAYST}));}catch(e){}}
var VIEW="plate",page=0,sel=0,SW={},ADJ=false,OPEN="",FRESH=true,STEP=0,LAYOUT="phone",USERLAYOUT="";
var TUNE={pro:false,gentle:false,quick:false},HAB={veg:false,walk:false,lemon:false},LABSRC="plate",RSEL="",RMOVES={};
function setHunger(v){S.h10=v;S.hunger=v<=3?"1":v<=7?"2":"3";}
function target(){return M.kg?M.kg:55;}                       /* protein for the day: 1 g per kg, a working target awaiting the coach */
function clockText(){var h=now.getHours(),m=now.getMinutes();return ((h%12)||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm");}
function hm(x){var h=Math.floor(x),m=Math.round((x-h)*60);return ((h%12)||12)+(m?":"+(m<10?"0":"")+m:"")+(h<12?" am":" pm");}
function blocked(){return M.done&&(M.health==="kidney"||M.health==="preg");}
function late(){return S.meal==="dinner"&&CLOCK==="dinner"&&hr>=21.5;}
function resetTune(){TUNE.pro=false;TUNE.gentle=false;}

/* ---------- quantities in words ---------- */
function numTxt(n){var w=Math.floor(n+1e-6),fr=Math.round((n-w)*100),g=fr===50?"½":fr===25?"¼":fr===75?"¾":"";return g?(w?w:"")+g:String(Math.round(n*100)/100);}
function plainN(n){return n===.5?"Half":n===.25?"A quarter":String(Math.round(n*100)/100);}
var PLUR={piece:"pieces",slice:"slices",glass:"glasses",bowl:"bowls",plate:"plates",teaspoon:"teaspoons",tablespoon:"tablespoons",fistful:"fistfuls"};
function unitTxt(n,u){if(u==="eggs")return n===1?"egg":"eggs";if(u==="pieces")return n===1?"piece":"pieces";return n>1&&PLUR[u]?PLUR[u]:u;}
function qShow(it){return it.label&&!it.delta?it.label.replace(" or ","–"):numTxt(it.n);}
function lineText(it){var u=unitTxt(it.n,it.u);return (it.label&&!it.delta?it.label:plainN(it.n))+(u?" "+u:"")+" "+it.t;}
function shortOf(it){return it.short||it.t.split(/,| with | or | in | as /)[0];}
function summary(items){return items.filter(function(i){return !(i.n<=.5&&i.u===""&&!i.role)&&groupOf(i)!=="garnish";}).map(function(i){var u=unitTxt(i.n,i.u);return qShow(i)+(u&&u!=="small"?" "+u:"")+" "+shortOf(i);}).join(" · ");}


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

/* ---------- rough plate shares ---------- */
function groupOf(it){
  var t=(it.t||"").toLowerCase(),u=it.u;
  if(u==="glass")return "drink";
  if(/rice mixed with|millet mixed with|khichdi|curd rice/.test(t))return "mix";
  if(it.role==="g")return "grain";if(it.role==="p")return "pro";if(it.role==="v")return "veg";
  if(/^lemon|lemon, squeezed|chutney/.test(t))return "garnish";
  if(/salad|kachumber|cucumber|tomato|capsicum|carrot|radish|sticks|greens|sabzi|poriyal|vegetable|saag|beans|bhindi|lauki|gourd|cabbage|palak|methi|corn|soup|torkari|tarkari/.test(t))return "veg";
  if(/fruit|guava|apple|orange|pear|banana|papaya/.test(t))return "veg";
  if(/dal|rajma|chole|chana|lobia|paneer|egg|chicken|fish|curd|dahi|raita|sprout|soya|tofu|sambar|bhurji|tikka|hummus|dip|peanut|almond|walnut|nut|chhena/.test(t))return "pro";
  if(/phulka|roti|rice|idli|dosa|poha|upma|dalia|chilla|cheela|millet|uttapam|mudde|toast|bread|khakhra|pulao|biryani|makhana|pav|naan|paratha|noodle|pasta|pizza/.test(t))return "grain";
  return "side";
}
var VU={katori:1,"small katori":.6,bowl:1.2,"big bowl":1.8,"small bowl":.7,plate:1.6,portion:.8,"palm-size piece":.9,fistful:.35,tablespoon:.12,teaspoon:.05,teaspoons:.05,slice:.5,eggs:.45,pieces:.25,piece:.3,small:.5};
function volOf(it){
  var t=(it.t||"").toLowerCase(),u=it.u,n=+it.n||0;
  if(u==="glass")return 0;if(VU[u]!=null)return n*VU[u];
  if(/phulka|roti|toast|bread/.test(t))return n*.55;if(/idli/.test(t))return n*.4;if(/dosa|uttapam/.test(t))return n*.9;if(/chilla|cheela/.test(t))return n*.7;
  if(/egg/.test(t))return n*.45;if(/lemon/.test(t))return 0;if(/almond|walnut|peanut|nut/.test(t))return n*.03;
  if(/fruit|guava|apple|orange|pear|banana/.test(t))return n*.6;if(/corn/.test(t))return n*.8;if(/cucumber/.test(t))return n*.5;
  return n*.5;
}
function shares(items){
  var a={veg:0,pro:0,grain:0,side:0};
  items.forEach(function(it){var g=groupOf(it),v=volOf(it);if(g==="drink"||g==="garnish")return;if(g==="mix"){a.grain+=v*.6;a.pro+=v*.4;return;}a[g]+=v;});
  var t=a.veg+a.pro+a.grain+a.side;if(!t)return {veg:0,pro:0,grain:0,side:0,t:0};
  return {veg:a.veg/t,pro:a.pro/t,grain:a.grain/t,side:a.side/t,t:t};
}
function vegWord(f){return f>=.42?"About half":f>=.28?"A third":f>=.12?"A little":"None";}
var RINGC={veg:"var(--veg)",pro:"var(--pro)",grain:"var(--grain)",side:"var(--side)"};
function ring(sh,c1,c2,dark,label){
  var s=document.createElementNS(NS,"svg");s.setAttribute("viewBox","0 0 100 100");s.setAttribute("class","ring");s.setAttribute("role","img");s.setAttribute("aria-label",label||"Rough plate shares");
  var R=40,C=2*Math.PI*R,sw=11,keys=["veg","pro","grain","side"].filter(function(k){return sh[k]>0.005;}),gap=keys.length>1?2.4:0;
  function circ(stroke,extra){var c=document.createElementNS(NS,"circle");c.setAttribute("cx","50");c.setAttribute("cy","50");c.setAttribute("r",String(R));c.setAttribute("fill","none");c.setAttribute("stroke-width",String(sw));c.style.stroke=stroke;if(extra)for(var k in extra)c.setAttribute(k,extra[k]);return c;}
  s.appendChild(circ(dark?"var(--track-dark)":"var(--track)"));
  var off=0;
  keys.forEach(function(k){var len=Math.max(.5,sh[k]*C-gap);var c=circ(RINGC[k],{"class":"seg","stroke-dasharray":len+" "+(C-len),"stroke-dashoffset":String(-off),transform:"rotate(-90 50 50)"});s.appendChild(c);off+=sh[k]*C;});
  if(c1!=null){var t1=document.createElementNS(NS,"text");t1.setAttribute("x","50");t1.setAttribute("y",c2?"52":"57");t1.setAttribute("text-anchor","middle");t1.setAttribute("class","ring-c1");
    var a=document.createElementNS(NS,"tspan");a.setAttribute("font-size","12");a.textContent="≈";var b=document.createElementNS(NS,"tspan");b.textContent=c1;t1.appendChild(a);t1.appendChild(b);s.appendChild(t1);}
  if(c2){var t2=document.createElementNS(NS,"text");t2.setAttribute("x","50");t2.setAttribute("y","65");t2.setAttribute("text-anchor","middle");t2.setAttribute("class","ring-c2");t2.textContent=c2;s.appendChild(t2);}
  return s;
}
var DOTC={veg:"var(--veg)",pro:"var(--pro)",grain:"var(--grain)",side:"var(--side)",mix:"var(--grain)",drink:"var(--side)",garnish:"transparent"};


/* ---------- boundaries: these filter, they never bend ---------- */
function leaveWords(){var out=[];M.leave.forEach(function(k){(ALIAS[k]||[]).forEach(function(w){if(out.indexOf(w)<0)out.push(w);});});return out;}
function hits(text,words){text=text.toLowerCase();for(var i=0;i<words.length;i++)if(text.indexOf(words[i])>=0)return true;return false;}
function fits(m){
  if(m.slots.indexOf(S.meal.charAt(0))<0)return false;
  if(DIETOK[M.diet].indexOf(m.d)<0)return false;
  if(M.diet==="jain"&&!m.j)return false;
  if(m.sits.indexOf(S.sit)<0)return false;
  if(hits(m.n+" "+m.items.map(function(i){return i.t;}).join(" "),leaveWords()))return false;
  return true;
}
function swapFor(m){
  var w=leaveWords();
  for(var i=0;i<m.swaps.length;i++){var s=m.swaps[i];if(DIETOK[M.diet].indexOf(s.d)<0)continue;if(M.diet==="jain"&&!s.j)continue;if(hits(s.t,w))continue;return s;}
  return null;
}


/* ---------- choosing from the coach's list ---------- */
var FOODW=["dal","rajma","chole","chana","paneer","egg","chicken","fish","soya","sprout","curd","khichdi","poha","idli","dosa","chilla","upma","dalia","palak","sambar","biryani","pulao"];
function foodWords(m){var t=(m.n+" "+m.items.map(function(i){return i.t;}).join(" ")).toLowerCase();return FOODW.filter(function(w){return t.indexOf(w)>=0;});}
function earlier(){return LOG.filter(function(l){return l.day===DAY&&l.meal!==S.meal;});}
function pick(){
  var had=earlier(),eaten=[],names=had.map(function(l){return l.name;}),lt=late(),list=CAT.filter(fits);
  if(TUNE.quick){var q=list.filter(function(m){return m.min<=15;});if(q.length)list=q;}
  had.forEach(function(l){(l.words||[]).forEach(function(w){if(eaten.indexOf(w)<0)eaten.push(w);});});
  return list.map(function(m){
    var sc=0;
    if(S.low!=="none"&&m.low.indexOf(S.low)>=0)sc+=4;
    sc+=m.r==="*"?1:m.r===M.region?2:0;
    if(S.goal==="lose"&&m.tags.indexOf("L")>=0)sc+=2;
    if(S.goal==="strength"&&m.tags.indexOf("P")>=0)sc+=2;
    if(S.mode==="active"&&m.tags.indexOf("P")>=0)sc+=1;
    if((lt||S.mode==="rest")&&m.tags.indexOf("L")>=0)sc+=2;
    sc-=2*Math.min(2,foodWords(m).filter(function(w){return eaten.indexOf(w)>=0;}).length);
    if(names.indexOf(m.n)>=0)sc-=4;
    return {m:m,sc:sc,h:hash01(m.id*7919+DAY)};
  }).sort(function(a,b){return b.sc-a.sc||a.h-b.h;}).map(function(x){return x.m;});
}
function three(){
  var all=pick(),start=all.length>3?(page*3)%all.length:0,t=all.slice(start,start+3);
  if(t.length<3&&all.length>3)t=t.concat(all.slice(0,3-t.length));
  return {list:t,all:all};
}

/* ---------- portions: hunger, goal, the day and one-tap tuning change the plate, and say so ---------- */
function stepOf(it){var u=it.u;if(u==="katori"||u==="small katori")return .5;if((u===""||u==="small"||u==="eggs"||u==="pieces")&&it.n===Math.round(it.n))return 1;return 0;}
function hasFood(items,re){for(var i=0;i<items.length;i++)if(re.test(items[i].t.toLowerCase()))return true;return false;}
function view(m){
  if(m.ai)return {items:m.items,changes:[],log:[]};
  var sw=SW[m.id]?swapFor(m):null,ch=[],log=[];
  var items=m.items.map(function(it,i){var b=sw&&sw.i===i?sw:it;return {n:b.n,u:b.u,t:b.t,role:b.role,short:b.short,label:b.label,swapped:!!(sw&&sw.i===i),delta:0,tag:""};});
  function first(r){for(var i=0;i<items.length;i++)if(items[i].role===r&&stepOf(items[i]))return items[i];return null;}
  function bump(it,d,why){if(!it)return false;var st=stepOf(it),n=it.n+d*st,max=st===1?4:2.5,min=st===1?1:.5;if(!st||n<min||n>max)return false;it.n=n;it.delta+=d;ch.push({short:it.short||shortOf(it),step:st,d:d,why:why});return true;}
  var G=first("g"),P=first("p"),V=first("v"),diab=M.health==="diabetes";
  if(S.goal==="strength")bump(P,1,"goal");
  if(S.mode==="active"&&S.goal!=="strength")bump(P,1,"mode");
  if(S.mode==="trek")bump(G,1,"mode");
  if(S.hunger==="1"&&!diab)bump(G,-1,"hunger");
  if(S.hunger==="3"){
    if(S.goal==="lose"||diab){bump(P,1,"hunger");bump(V,1,"hunger");}
    else{bump(G,1,"hunger");bump(P,1,"hunger");}
  }
  if(TUNE.pro){
    var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,egg=M.diet==="egg"||M.diet==="nonveg",ad=null;
    if(dairy&&!hasFood(items,/curd|raita|chaas|dahi|milk/))ad={n:1,u:"katori",t:"curd",role:"p",short:"curd"};
    else if(egg&&!hasFood(items,/egg|omelette/))ad={n:2,u:"",t:"boiled eggs",role:"p",short:"egg"};
    else if(M.diet!=="jain"&&!hasFood(items,/sprout/))ad={n:1,u:"katori",t:"boiled sprouted moong",role:"p",short:"sprouts"};
    else if(M.leave.indexOf("nut")<0&&!hasFood(items,/roasted chana/))ad={n:1,u:"fistful",t:"roasted chana",role:"",short:"chana"};
    if(ad&&!hits(ad.t,leaveWords())){ad.label="";ad.swapped=false;ad.delta=0;ad.tag="added";items.push(ad);log.push("Added "+lineText(ad).toLowerCase()+" for protein.");}
    else if(P&&bump(P,1,"tune"))log.push("One more helping of "+(P.short||"the protein")+".");
  }
  if(TUNE.gentle){
    if(!diab&&G&&bump(G,-1,"tune"))log.push("Less "+(G.short||"grain")+", so the rise is smaller.");
    if(V&&bump(V,1,"tune"))log.push("More "+(V.short||"vegetables")+" to slow it down.");
    else if(!hasFood(items,/salad|kachumber/)){items.push({n:1,u:"bowl",t:"salad with lemon, eaten first",role:"",short:"salad",label:"",swapped:false,delta:0,tag:"added"});log.push("Added a bowl of salad to eat first.");}
    if(diab)log.push("With diabetes the grain stays as written.");
  }
  return {items:items,changes:ch,log:log};
}
function reason(){
  var had=earlier(),w={breakfast:"breakfast",lunch:"lunch",snack:"your snack",dinner:"dinner"}[S.meal];
  if(late())return LATENOTE;
  if(had.length){var l=had[had.length-1];return "You had "+l.name.charAt(0).toLowerCase()+l.name.slice(1)+" for "+mealName(l.meal).toLowerCase()+", so "+w+" leads with something different.";}
  if(S.low!=="none")return "You're minding "+LOWNAME[S.low]+", so plates that lean on it come first.";
  if(S.mode==="trek")return "Trek day, so the plate carries more grain for fuel.";
  if(S.mode==="active")return "Active day, so protein gets an extra helping.";
  if(S.goal==="lose")return "You're losing weight, so the lighter plates lead.";
  if(S.goal==="strength")return "You're building strength, so the protein-forward plates lead.";
  return "";
}
function portionNotes(m,v){
  var out=[];if(m.ai)return out;
  var by={goal:[],hunger:[],mode:[],tune:[]};v.changes.forEach(function(c){by[c.why].push(c);});
  var ph=function(c){return c.d>0?(c.step===1?"one more "+c.short:"half a katori more "+c.short):(c.step===1?"one "+c.short+" less":"half a katori less "+c.short);};
  var join=function(a){return a.length>1?a.slice(0,-1).join(", ")+" and "+a[a.length-1]:a[0];};
  if(by.goal.length)out.push("Building strength, so this plate has "+join(by.goal.map(ph))+".");
  else if(S.goal==="strength")out.push(GOALNOTE.strength);
  if(by.mode.length)out.push(modeOf(S.mode)[1]+", so this plate has "+join(by.mode.map(ph))+".");
  if(S.goal==="lose")out.push(GOALNOTE.lose);
  if(by.hunger.length)out.push((S.hunger==="1"?"A little hungry":"Starving")+", so this plate has "+join(by.hunger.map(ph))+".");
  else if(S.hunger==="1")out.push(M.health==="diabetes"?"A little hungry: keep the grain, and take less of the rest if you need to.":HUNGERFALLBACK["1"]);
  else if(S.hunger==="3")out.push(HUNGERFALLBACK["3"]);
  return out;
}
function cautions(){var out=[];if(LOWNOTE[S.low])out.push(LOWNOTE[S.low]);if(HEALTHNOTE[M.health])out.push(HEALTHNOTE[M.health]);return out;}
function msgText(m,v,meal){
  var nu=nutPlate(v.items);
  return "*"+mealName(meal||S.meal)+": "+m.n+"*\n"+v.items.map(function(i){return "- "+lineText(i);}).join("\n")+(m.why?"\n"+m.why:"")+(m.skip?"\nLeave today: "+m.skip:"")+(m.later?"\nNext meal: "+m.later:"")+"\n(About "+nu.p+" g protein, "+nu.k+" kcal, rough estimate)";
}
function logPick(m,v){
  var nu=nutPlate(v.items);
  LOG=LOG.filter(function(l){return !(l.day===DAY&&l.meal===S.meal);});
  LOG.push({day:DAY,meal:S.meal,name:m.n,words:foodWords(m),p:nu.p,k:nu.k});LOG=LOG.slice(-4);save();
}
function picked(m){for(var i=0;i<LOG.length;i++)if(LOG[i].day===DAY&&LOG[i].meal===S.meal&&LOG[i].name===m.n)return true;return false;}
function measuresList(items){
  var ul=el("ul","measures");
  items.forEach(function(it){
    var li=el("li"),q=el("span","qty"+(it.delta||it.tag?" chg":""),qShow(it)),f=el("span","food"),u=unitTxt(it.n,it.u);
    q.style.setProperty("--dot",DOTC[groupOf(it)]||"transparent");
    if(u)f.appendChild(el("b",null,u+" "));f.appendChild(document.createTextNode(it.t));
    var tg=it.tag||(it.delta?(it.delta>0?"more":"less"):it.swapped?"swapped":"");if(tg)f.appendChild(el("span","tag",tg));
    add(li,q,f);ul.appendChild(li);
  });
  return ul;
}

/* ---------- small shared pieces ---------- */
var toastT=0;
function toast(t){var n=$("toast");$("toasttxt").textContent=t;n.hidden=false;n.style.animation="none";void n.offsetWidth;n.style.animation="";clearTimeout(toastT);toastT=setTimeout(function(){n.hidden=true;},2600);$("said").textContent=t;}
function waLink(txt){var a=el("a","mini wa");a.href="https://wa.me/?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";a.appendChild(ic("wa"));a.appendChild(el("span",null,"WhatsApp"));return a;}
function copyBtn(txt,id,onDone){var b=btn("mini","Copy","copy",id);b.addEventListener("click",function(){
  if(onDone)onDone();
  function ok(){toast("Copied. Paste it in WhatsApp.");}
  function fail(){toast("Copying is blocked here. Use the WhatsApp button instead.");}
  try{navigator.clipboard.writeText(txt).then(ok,fail);}catch(e){fail();}});return b;}
function setPressed(b,on,attr){b.setAttribute(attr||"aria-pressed",on?"true":"false");return b;}


/* ---------- first visit ---------- */
var DIETDOT={veg:"var(--veg)",egg:"var(--grain)",nonveg:"var(--chilli)",jain:"var(--haldi)",vegan:"var(--side)"};
var HEALTHSUB={none:"",diabetes:"Grain stays, sweets and juice stay off",bp:"No pickle, papad or added salt",kidney:"Plates stay with your coach and doctor",preg:"Plates stay with your coach and doctor"};
function tiles(k,isOn,set,subs){
  var g=el("div","grid2");g.setAttribute("role","radiogroup");g.setAttribute("aria-label",LAB[k]);
  OPT[k].forEach(function(o){var b=el("button","tile");b.type="button";b.id=k+"-"+o[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    var d=el("i");if(k==="diet")d.style.setProperty("--dot",DIETDOT[o[0]]);else d.style.setProperty("--dot",o[0]==="none"?"var(--veg)":o[0]==="kidney"||o[0]==="preg"?"var(--chilli)":"var(--haldi)");
    var t=el("span",null,o[1]);if(subs&&subs[o[0]])t.appendChild(el("small",null,subs[o[0]]));
    add(b,d,t);b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});
  return g;
}
function choiceRow(k,isOn,set,cls,multi){
  var r=el("div",cls||"choice-row");r.setAttribute("role",multi?"group":"radiogroup");r.setAttribute("aria-label",LAB[k]);
  OPT[k].forEach(function(o){var b=el("button","choice",o[1]);b.type="button";b.id=k+"-"+o[0];b.setAttribute("role",multi?"checkbox":"radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    b.addEventListener("click",function(){set(o[0]);});r.appendChild(b);});
  if(OPT[k].length===4&&!cls)r.style.gridTemplateColumns="repeat(4,minmax(0,1fr))";
  return r;
}
function foodGroups(host,inSheet){
  var q1=el("div","qs");q1.appendChild(el("h2",null,"What do you eat?"));
  q1.appendChild(tiles("diet",function(v){return M.diet===v;},function(v){M.diet=v;page=0;sel=0;save();inSheet?renderSheet():render();if(inSheet)render();}));
  var q2=el("div","qs");q2.appendChild(el("p","cap","Home food"));
  q2.appendChild(choiceRow("region",function(v){return M.region===v;},function(v){M.region=v;page=0;sel=0;save();inSheet?(renderSheet(),render()):render();}));
  var q3=el("div","qs");q3.appendChild(el("p","cap","Leave out completely"));
  q3.appendChild(choiceRow("leave",function(v){return M.leave.indexOf(v)>=0;},function(v){var i=M.leave.indexOf(v);if(i>=0)M.leave.splice(i,1);else M.leave.push(v);page=0;sel=0;save();inSheet?(renderSheet(),render()):render();},null,true));
  add(host,q1,q2,q3);
}
function healthGroup(host,inSheet){
  var q=el("div","qs");q.appendChild(el("h2",null,"Anything on the health side?"));
  q.appendChild(tiles("health",function(v){return M.health===v;},function(v){M.health=v;save();if(inSheet){renderSheet();render();}else render();},HEALTHSUB));
  host.appendChild(q);
}
function renderSetup(){
  var v=$("v-setup");v.textContent="";
  var h=el("div","setup-hero"),st=el("div","steps");st.appendChild(el("i","on"));st.appendChild(el("i",STEP>0?"on":null));
  add(h,st,el("h1",null,STEP===0?"Your next plate, every meal":"One more, then your plate"),el("p",null,STEP===0?"Two questions, asked once and kept on this phone. Your coach's food rules do the rest.":"This keeps advice safe. It never leaves this phone except as a rule for the plates."));
  v.appendChild(h);
  if(STEP===0){foodGroups(v,false);var nx=btn("btn primary","Next",null,"setup-next");nx.disabled=!M.diet;if(!M.diet)nx.style.opacity=".5";
    nx.addEventListener("click",function(){if(!M.diet)return;STEP=1;render();$("scroll").scrollTop=0;});v.appendChild(nx);}
  else{healthGroup(v,false);bodyGroup(v,false);var row=el("div","choice-row");row.style.gridTemplateColumns="1fr 2fr";
    var bk=btn("btn","Back",null,"setup-back");bk.addEventListener("click",function(){STEP=0;render();});
    var go=btn("btn primary","Show my plate",null,"setup-go");go.disabled=!M.health;if(!M.health)go.style.opacity=".5";
    go.addEventListener("click",function(){if(!M.health)return;M.done=true;save();FRESH=true;show("plate");});
    add(row,bk,go);v.appendChild(row);}
  v.appendChild(el("p","fine","Demonstration meals, not yet approved by your coach. General food guidance, not medical advice."));
}


/* ---------- My food sheet ---------- */
function openSheet(){$("sheet").hidden=false;renderSheet();var d=$("sheet-done");if(d)d.focus();}
function closeSheet(){$("sheet").hidden=true;$("myfood").focus();}
function renderSheet(){
  var sh=$("sheet");sh.textContent="";
  var c=el("div","sheet-card");c.setAttribute("role","dialog");c.setAttribute("aria-modal","true");c.setAttribute("aria-label","My food");
  var hd=el("div","sheet-h");hd.appendChild(el("h2",null,"My food"));var dn=btn("goal-btn","Done",null,"sheet-done");dn.addEventListener("click",closeSheet);hd.appendChild(dn);
  add(c,el("div","grab"),hd);foodGroups(c,true);healthGroup(c,true);bodyGroup(c,true);
  c.appendChild(el("p","fine","Kept on this phone only. Plates and answers always follow these."));
  sh.appendChild(c);
}
$("sheet").addEventListener("click",function(e){if(e.target===this)closeSheet();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("sheet").hidden)closeSheet();});
$("myfood").addEventListener("click",openSheet);


/* ---------- Ask ---------- */
var sampleFn=null,canImg=false,ctl=null,busy=false,aiN=0,THREAD=[];
var HOSTED=!!window.NP_HOSTED,NOPHOTO=!!window.NP_NOPHOTO,KEY="";
if(HOSTED){try{var qk=new URLSearchParams(location.search).get("k");if(qk){KEY=qk.slice(0,64);localStorage.setItem("np-key",KEY);history.replaceState(null,"",location.pathname+location.hash);}else KEY=localStorage.getItem("np-key")||"";}catch(e){}}
$("privacy").textContent=HOSTED?"Answers are written by Google Gemini inside your coach's rules. Don't type names or anything private.":"Answers are written by Claude inside your coach's rules. Don't type names or anything private.";
function shrink(file){
  return new Promise(function(res){
    var url=URL.createObjectURL(file),img=new Image();
    img.onload=function(){var k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);var d=c.toDataURL("image/jpeg",.82);res({type:"image/jpeg",data:d.slice(d.indexOf(",")+1)});};
    img.onerror=function(){URL.revokeObjectURL(url);res(null);};img.src=url;
  });
}
function hostedAsk(st,file,opts){
  return (file?shrink(file):Promise.resolve(null)).then(function(image){
    if(file&&!image)throw {code:"image_rejected"};
    return fetch("/api/ask",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key:KEY,state:st,image:image}),signal:opts.signal});
  }).then(function(r){
    if(!r.ok)return r.json().catch(function(){return {};}).then(function(j){throw {code:j.code||(r.status===429?"rate_limited":"upstream_error")};});
    var rd=r.body.getReader(),dec=new TextDecoder(),all="";
    return (function pump(){return rd.read().then(function(x){
      if(x.done)return {text:all};var d=dec.decode(x.value,{stream:true});if(d){all+=d;opts.onText({text:all,delta:d});}return pump();});})();
  },function(e){if(e&&e.name==="AbortError")throw {code:"cancelled"};throw e&&e.code?e:{code:"upstream_error"};});
}
var sampleReady=(HOSTED?Promise.resolve(hostedAsk):window.claude&&typeof window.claude.use==="function"?window.claude.use("sample"):Promise.resolve(null)).then(function(fn){
  sampleFn=typeof fn==="function"?fn:null;
  if(HOSTED){canImg=!NOPHOTO;return;}
  if(sampleFn&&typeof sampleFn.limits==="function")return sampleFn.limits().then(function(l){canImg=!!(l&&l.images);},function(){});
},function(){sampleFn=null;}).then(function(){$("cambtn").hidden=!canImg;if(M.done)render();});
var ERR={rate_limited:"Asking is busy right now. Try again in a little while.",session_expired:"You have been signed out. Sign in again to ask.",refused:"That one couldn't be answered. Try asking another way.",upstream_error:"That didn't come through. Try again.",not_granted:"Asking is switched off because Claude wasn't allowed here. Your coach's list still works.",gone:"Asking isn't connected in this view. Your coach's list on the Plate tab still works."};
ERR.bad_key="This link is missing your coach's code. Open the Next Plate link your coach sent you.";
ERR.limit_ip="That's all the asking for today on this phone. Your coach's list still works.";
ERR.limit_day="Next Plate has had a lot of questions today. Try again tomorrow; your coach's list still works.";
ERR.budget="Asking is paused for this month. Your coach's list still works.";
ERR.not_set_up="Asking isn't switched on yet. Your coach's list still works.";
ERR.image_rejected="That photo couldn't be read. Try another one.";
ERR.bad_request="That couldn't be sent. Try asking again.";
var GONE=["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"];
var AIUNITS=["","katori","glass","bowl","plate","fistful","piece","slice","teaspoon","tablespoon"];
var NONVEG=["chicken","mutton","fish","prawn","prawns","meat","keema","bacon","ham","tuna","sausage","pepperoni","seafood","crab","lamb","pork","beef","salami"],EGGW=["egg","eggs","omelette","omelet","anda"];
var DAIRYW=["milk","curd","dahi","paneer","ghee","butter","cheese","chaas","lassi","raita","cream","khoya","yogurt","yoghurt","kheer","buttermilk","kadhi"];
var JAINW=["onion","onions","garlic","potato","potatoes","aloo","carrot","carrots","gajar","radish","mooli","beetroot","beet","ginger","yam"];
var NEG=/\b(no|without|skip the|skip|hold the|minus)\s+(added\s+|extra\s+)?[a-z]+(\s+(or|and)\s+[a-z]+)?/g;
var BAN=/\b\d+(\.\d+)?\s?(kcal|calories?|cal|grams?|gms?|g|mg|mcg|iu|ml|kg)\b|%|\b(supplements?|capsules?|tablets?|whey|protein powder|multivitamins?|detox|cures?|cured|guarantee[sd]?)\b/i;
function rx(list){return new RegExp("\\b("+list.join("|")+")\\b");}
function dietBad(){var bad=[];if(M.diet!=="nonveg")bad=bad.concat(NONVEG);if(M.diet==="veg"||M.diet==="jain"||M.diet==="vegan")bad=bad.concat(EGGW);if(M.diet==="jain")bad=bad.concat(JAINW);if(M.diet==="vegan")bad=bad.concat(DAIRYW);return bad;}
function crossesDiet(text){var bad=dietBad();return !!bad.length&&rx(bad).test(text.toLowerCase().replace(NEG," "));}
function crosses(text){if(crossesDiet(text))return true;return hits(text.toLowerCase().replace(NEG," "),leaveWords());}
var SWEETS=["juice","mithai","gulab jamun","jalebi","halwa","kheer","sugar","cola","soft drink","laddu","ladoo","barfi","ice cream","dessert","rasgulla","rosogolla","rasogolla","rasmalai","sandesh","mishti","payasam","shrikhand","peda","chikki","sheera","kesari","modak","malpua","basundi","rabri","syrup","sweetened","soft drinks","honey","jaggery","gur"],SALTY=["pickle","achar","papad","namkeen","chips"];
function healthBad(text){var low=text.toLowerCase().replace(/blood sugar/g," ").replace(NEG," ");return (M.health==="diabetes"&&rx(SWEETS).test(low))||(M.health==="bp"&&rx(SALTY).test(low));}
var EMO=/[☀-➿️]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/g;
function clean(t,max){if(typeof t!=="string")return "";t=t.replace(EMO,"").replace(/!+/g,".").replace(/\s+/g," ").trim();if(BAN.test(t))return "";return t.slice(0,max);}
function unitOf(u){
  u=String(u||"").toLowerCase().trim();if(AIUNITS.indexOf(u)>=0)return u;
  if(u.indexOf("katori")>=0||u==="cup"||u==="cups")return "katori";if(u.indexOf("bowl")>=0)return "bowl";if(u.indexOf("glass")>=0)return "glass";
  if(u.indexOf("fist")>=0||u.indexOf("handful")>=0)return "fistful";if(u==="tsp"||u.indexOf("teaspoon")>=0)return "teaspoon";if(u==="tbsp"||u.indexOf("tablespoon")>=0)return "tablespoon";
  if(u.indexOf("piece")>=0)return "piece";if(u.indexOf("slice")>=0)return "slice";if(u.indexOf("plate")>=0)return "plate";return "";
}
function qtyOf(q){if(typeof q==="string"){var m=/^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(q);if(m)q=+m[1]/+m[2];else if(/half/i.test(q))q=.5;else q=parseFloat(q);}q=+q;if(!(q>0))q=1;return Math.min(6,Math.round(q*4)/4);}
function toPlate(o){
  var name=clean(o.name,60),items=[],i;if(!name||!Array.isArray(o.items))return null;
  for(i=0;i<o.items.length&&items.length<6;i++){
    var x=o.items[i];if(!x||typeof x.f!=="string")continue;
    if(BAN.test(x.f))return null;
    var q=qtyOf(x.q),u=unitOf(x.u);
    var f=x.f.replace(EMO,"").replace(/!/g,"").replace(/\s+/g," ").trim().replace(/^[\d.\/¼-¾]+\s*/,"");
    if(u&&f.toLowerCase().indexOf(u)===0)f=f.slice(u.length).replace(/^s?\s+(of\s+)?/,"");
    f=f.slice(0,72);if(!f)continue;if(BAN.test(f))return null;
    items.push({n:q,u:u,t:f,role:"",short:"",label:"",delta:0});
  }
  if(!items.length)return null;
  var all=name+" , "+items.map(function(i){return i.t;}).join(" , ");
  if(crosses(all)||healthBad(all))return null;
  return {id:1000+(aiN++),ai:true,n:name,items:items,why:clean(o.why,200),min:Math.max(0,Math.min(180,Math.round(+o.min||0))),skip:clean(o.skip,160),later:clean(o.later,160),low:[],swaps:[],tags:""};
}
function handleLine(my,line){
  var a=line.indexOf("{"),b=line.lastIndexOf("}"),o;if(a<0||b<=a)return false;
  try{o=JSON.parse(line.slice(a,b+1));}catch(e){return false;}
  if(!o||typeof o!=="object")return false;
  if(o.t==="read"){my.read=clean(o.text,240);return true;}
  if(o.t==="seen"){my.seen=clean(o.text,200);return true;}
  if(o.t==="_err"){my.err=ERR[o.code]||ERR.upstream_error;return true;}
  if(o.t==="refer"){my.refer=clean(o.text,240)||"That one is for your coach or your doctor.";return true;}
  if(o.t==="swap"){if(my.swaps.length>=3)return false;var have=clean(o.have,100),skip=clean(o.skip,90);if(!have)return false;
    if(crosses(have)||healthBad(have)||(skip&&crossesDiet(skip))){my.removed++;return true;}my.swaps.push({skip:skip,have:have});return true;}
  if(o.t==="tip"){var tp=clean(o.text,170);if(tp&&!crosses(tp)&&!healthBad(tp))my.tip=tp;return true;}
  if(o.t==="plate"||Array.isArray(o.items)){if(my.plates.length>=3)return false;var m=toPlate(o);if(m)my.plates.push(m);else my.removed++;return true;}
  return false;
}
function objectsIn(text){
  var out=[],d=0,st=-1,inS=false,esc=false,i,c;
  for(i=0;i<text.length;i++){c=text[i];
    if(inS){if(esc)esc=false;else if(c==="\\")esc=true;else if(c==='"')inS=false;continue;}
    if(c==='"')inS=true;else if(c==="{"){if(d===0)st=i;d++;}else if(c==="}"){d--;if(d===0&&st>=0){out.push(text.slice(st,i+1));st=-1;}if(d<0)d=0;}}
  return out;
}
function promptState(text,hasPhoto,prev,shown){
  return {meal:S.meal,time:clockText(),goal:S.goal,hunger:S.hunger,sit:S.sit,low:S.low,diet:M.diet,region:M.region,leave:M.leave.slice(),health:M.health,
    had:earlier().map(function(l){return mealName(l.meal)+": "+l.name;}),shown:shown||[],text:text,photo:!!hasPhoto,prev:prev||[]};
}
var rq=0;function soon(){if(rq)return;rq=requestAnimationFrame(function(){rq=0;renderThread();});}
function stopAsk(){if(ctl){try{ctl.abort();}catch(e){}ctl=null;}busy=false;}
function ask(text,file){
  if(!M.done||blocked()||busy)return;
  text=String(text||"").replace(/[\r\n"]+/g," ").trim().slice(0,240);
  if(!text&&!file)return;
  var shownOnly=!text;if(!text)text="Look at this photo and give me my next plate.";
  var last=null;for(var i=THREAD.length-1;i>=0;i--)if(THREAD[i].plates&&THREAD[i].plates.length){last=THREAD[i];break;}
  var prev=last?last.plates.map(function(p){return p.n;}):null,shown=three().list.map(function(m){return m.n;});
  var my={me:shownOnly?"You showed a photo.":text,photo:file?URL.createObjectURL(file):"",meal:S.meal,read:"",seen:"",plates:[],swaps:[],tip:"",refer:"",removed:0,status:"thinking",err:"",open:0,slow:false},pending="",whole="";
  THREAD.push(my);busy=true;ctl=new AbortController();$("askin").value="";
  render();scrollEnd();
  setTimeout(function(){if(my.status==="thinking"){my.slow=true;soon();}},7000);
  sampleReady.then(function(){
    if(!sampleFn){busy=false;ctl=null;my.status="done";my.err=ERR.gone;render();return;}
    function eat(delta){pending+=delta;whole+=delta;var lines=pending.split("\n"),ch=false;pending=lines.pop();lines.forEach(function(l){if(handleLine(my,l))ch=true;});if(ch)soon();}
    var opts={modelTier:"default",cache:false,signal:ctl.signal,onText:function(u){my.status="writing";eat(u.delta);}};
    if(file&&!HOSTED)opts.images=[file];
    var st=promptState(text,!!file,prev,shown),pr;try{pr=HOSTED?hostedAsk(st,file,opts):sampleFn(buildPrompt(st),opts);}catch(e){pr=Promise.reject(e);}
    Promise.resolve(pr).then(function(res){
      eat("\n");
      if(!my.plates.length&&!my.refer&&!my.removed)objectsIn(res&&typeof res.text==="string"?res.text:whole).forEach(function(o){handleLine(my,o);});
      busy=false;ctl=null;my.status="done";
      if(my.removed&&my.read&&(crosses(my.read)||healthBad(my.read)))my.read="";
      if(!my.plates.length&&!my.refer&&!my.err)my.err=my.removed?"Every suggestion broke one of your food rules, so none is shown. Try asking another way.":ERR.upstream_error;
      render();
    },function(e){
      var code=e&&e.code;busy=false;ctl=null;my.status="done";
      if(code==="cancelled"){if(!my.plates.length)my.err="Stopped.";render();return;}
      if(GONE.indexOf(code)>=0){sampleFn=null;my.err=code==="not_granted"?ERR.not_granted:ERR.gone;render();return;}
      my.err=ERR[code]||ERR.upstream_error;render();
    });
  });
}
function scrollEnd(){var s=LAYOUT==="studio"?$("ask-body"):$("scroll");requestAnimationFrame(function(){s.scrollTop=s.scrollHeight;});}
$("askform").addEventListener("submit",function(e){e.preventDefault();if(busy){stopAsk();render();return;}ask($("askin").value);});
$("cambtn").addEventListener("click",function(){$("camfile").click();});
$("camfile").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(f&&canImg)ask($("askin").value,f);});
function askPrompts(){
  var w={breakfast:"breakfast",lunch:"lunch",snack:"a snack",dinner:"dinner"}[S.meal];
  var have=M.diet==="veg"||M.diet==="jain"||M.diet==="vegan"?"dal, rice, onion and tomato":"eggs, bread, onion and tomato";
  return [["store","Eating out. What should I order?","I'm eating out at a restaurant for "+w+". What should I order?"],
    ["flame","I'm craving something fried","I'm craving something fried."],
    ["scale","My last meal was heavy","My last meal was heavy."],
    ["home","I only have a few things at home","At home I only have "+have+".",1],
    ["spark","I'm at a wedding or party","I'm at a function with a buffet."],
    ["walk","Just back from my walk","I've just come back from a 30 minute walk."]];
}
function answerCard(my){
  var c=el("div","ans"),h=el("div","ans-h"),d=el("span","dot");d.appendChild(ic("spark"));
  add(h,d,el("b",null,"Next Plate"),el("span",null,"· written for you just now"));c.appendChild(h);
  var waiting=my.status!=="done"&&!my.read&&!my.refer;
  var rd=el("p","ans-read"+(waiting?" wait":""),my.read||(waiting?(my.status==="thinking"?"Thinking it through":"Writing your plates"):""));
  if(rd.textContent&&!my.refer)c.appendChild(rd);
  if(my.seen)c.appendChild(el("small","meta","I can see: "+my.seen));
  if(my.slow&&my.status==="thinking")c.appendChild(el("small","meta","Still working. A careful answer can take half a minute."));
  if(my.refer){var n=el("div","note");n.appendChild(ic("shield"));n.appendChild(el("p",null,my.refer));c.appendChild(n);}
  if(my.plates.length){
    var oi=Math.min(my.open,my.plates.length-1),p=my.plates[oi],v={items:p.items,changes:[]},nu=nutPlate(p.items);
    var pk=el("div","pick"),ph=el("div","pick-h"),pt=el("div");
    pt.appendChild(el("small",null,oi===0?"Best plate":"Also good"));pt.appendChild(el("b",null,p.n));
    add(ph,ring(shares(p.items),null,null,false,"Rough plate shares"),pt);pk.appendChild(ph);
    pk.appendChild(measuresList(p.items,true));
    var meta=el("p");meta.textContent=(p.min>0?"About "+p.min+" min":"Ready or ordered")+" · ≈ "+nu.p+" g protein · ≈ "+nu.k+" kcal";pk.appendChild(meta);
    if(p.why)pk.appendChild(el("p",null,p.why));
    if(p.skip){var s1=el("p");s1.appendChild(el("b",null,"Leave today: "));s1.appendChild(document.createTextNode(p.skip));pk.appendChild(s1);}
    if(p.later){var s2=el("p");s2.appendChild(el("b",null,"Next meal: "));s2.appendChild(document.createTextNode(p.later));pk.appendChild(s2);}
    var acts=el("div","pick-acts"),txt=msgText(p,v,my.meal),idx=THREAD.indexOf(my);
    var hv=btn("mini","I'll have this","check","ai-have-"+idx);hv.addEventListener("click",function(){var keep=S.meal;S.meal=my.meal;logPick(p,v);S.meal=keep;toast("Saved for "+mealName(my.meal).toLowerCase()+".");});
    var cp=copyBtn(txt,"ai-copy-"+idx);cp.lastChild.remove();cp.setAttribute("aria-label","Copy");add(acts,hv,waLink(txt),cp);pk.appendChild(acts);c.appendChild(pk);
    if(my.plates.length>1){var ot=el("div","others");my.plates.forEach(function(q,j){if(j===oi)return;var b=el("button","other");b.type="button";b.id="ai-other-"+idx+"-"+j;b.appendChild(el("span",null,q.n));b.appendChild(ic("chev"));
      b.addEventListener("click",function(){my.open=j;renderThread();});ot.appendChild(b);});c.appendChild(ot);}
  }
  if(my.swaps.length){var sw=el("div","swaps");my.swaps.forEach(function(x){var r=el("div","swap");if(x.skip)r.appendChild(el("s",null,"Skip: "+x.skip));var hv2=el("span");hv2.appendChild(ic("check"));hv2.appendChild(el("span",null,"Have: "+x.have));r.appendChild(hv2);sw.appendChild(r);});c.appendChild(sw);}
  if(my.tip){var tp=el("p","tip");tp.appendChild(el("b",null,"Tip: "));tp.appendChild(document.createTextNode(my.tip));c.appendChild(tp);}
  if(my.removed&&my.status==="done")c.appendChild(el("small","meta",my.removed+(my.removed>1?" suggestions":" suggestion")+" left out by your food rules"));
  if(my.err)c.appendChild(el("small","meta",my.err));
  return c;
}
function renderThread(){
  var th=$("thread");if(!th)return;th.textContent="";
  THREAD.forEach(function(my,i){
    var u=el("div","bub");if(my.photo){var im=el("img");im.src=my.photo;im.alt="Your photo";im.style.cssText="display:block;width:120px;border-radius:12px;margin-bottom:6px";u.appendChild(im);}u.appendChild(document.createTextNode(my.me));th.appendChild(u);
    th.appendChild(answerCard(my));
    if(i===THREAD.length-1&&my.status==="done"&&my.plates.length){
      var f=el("div","lows");[["Lighter","Make it lighter."],["More protein","More protein, please."],["Faster","Something faster to make."],["Something else","Give me different plates."]].forEach(function(x,j){
        var b=btn("choice",x[0],null,"follow-"+j);b.addEventListener("click",function(){ask(x[1]);});f.appendChild(b);});th.appendChild(f);}
  });
  $("askicon").firstChild.setAttribute("href",busy?"#i-stop":"#i-send");$("askgo").setAttribute("aria-label",busy?"Stop":"Ask");
}
function renderAsk(){
  var v=$("ask-body");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  var hd=el("div","card ask-head"),i=el("span","ask-ic");i.appendChild(ic("spark"));
  var t=el("div");t.appendChild(el("b",null,"Ask about your "+mealName(S.meal).toLowerCase()));
  t.appendChild(el("small",null,"Keeps to "+lab("diet",M.diet).toLowerCase()+(M.leave.length?", no "+M.leave.map(function(x){return lab("leave",x).toLowerCase();}).join(", no "):"")+", "+lab("goal",S.goal).toLowerCase()+". Not from your coach's list."));
  add(hd,i,t);v.appendChild(hd);
  if(!THREAD.length){
    v.appendChild(el("p","cap","Tap one, or type below"));
    var ps=el("div","prompts");askPrompts().forEach(function(p,j){var b=el("button","prompt");b.type="button";b.id="prompt-"+j;
      var l=el("span");l.style.cssText="display:flex;gap:10px;align-items:center";l.appendChild(ic(p[0]));l.appendChild(el("span",null,p[1]));add(b,l,ic("chev"));
      b.addEventListener("click",function(){if(p[3]){var a=$("askin");a.value=p[2];a.focus();try{a.setSelectionRange(p[2].length,p[2].length);}catch(e){}}else ask(p[2]);});ps.appendChild(b);});
    v.appendChild(ps);
  }
  var th=el("div","thread");th.id="thread";v.appendChild(th);renderThread();
}


/* ---------- voice: speak the question, hear the plate ---------- */
var dictNs=null,ttsNs=null,recog=null,listening=false,speaking=false,micBase="";
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function canSpeak(){return !!(ttsNs||(HOSTED&&window.speechSynthesis&&window.SpeechSynthesisUtterance));}
function syncVoice(){
  var m=$("micbtn");if(m){m.hidden=!(dictNs||(HOSTED&&SR));m.setAttribute("aria-pressed",listening?"true":"false");m.setAttribute("aria-label",listening?"Stop listening":"Speak your question");}
  var l=$("listen");if(l){l.setAttribute("aria-pressed",speaking?"true":"false");var sp=l.querySelector("span");if(sp)sp.textContent=speaking?"Stop":"Listen";}
}
if(!HOSTED&&window.claude&&typeof window.claude.use==="function"){
  window.claude.use("dictation").then(function(d){if(!d)return;dictNs=d;
    d.onPartial(function(e){$("askin").value=(micBase+e.text).slice(0,240);});
    d.onFinal(function(e){micBase=(micBase+e.text+" ").slice(0,240);$("askin").value=micBase;});
    d.onState(function(e){listening=e.state==="listening"||e.state==="starting";syncVoice();});syncVoice();},function(){});
  window.claude.use("tts").then(function(t){if(!t)return;ttsNs=t;t.onState(function(e){speaking=e.state==="speaking"||e.state==="starting";syncVoice();});if(M.done)render();},function(){});
}
function toggleMic(){
  if(dictNs){
    if(listening){dictNs.stop().catch(function(){});return;}
    micBase=$("askin").value?$("askin").value+" ":"";
    dictNs.start().catch(function(e){if(e&&e.code==="not_granted"){dictNs=null;syncVoice();toast("The microphone is off for this page. Typing still works.");}});return;
  }
  if(!SR)return;
  if(listening&&recog){try{recog.stop();}catch(e){}return;}
  recog=new SR();recog.lang="en-IN";recog.interimResults=true;recog.continuous=false;micBase=$("askin").value?$("askin").value+" ":"";
  recog.onresult=function(ev){var t="";for(var i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;$("askin").value=(micBase+t).slice(0,240);};
  recog.onend=function(){listening=false;syncVoice();};
  recog.onerror=function(){listening=false;syncVoice();toast("Couldn't hear that. Try again, or type it.");};
  try{recog.start();listening=true;syncVoice();}catch(e){}
}
function sayText(text){
  if(speaking){if(ttsNs)ttsNs.stop().catch(function(){});else if(window.speechSynthesis)window.speechSynthesis.cancel();speaking=false;syncVoice();return;}
  if(ttsNs){ttsNs.speak(text.slice(0,1900)).catch(function(e){if(e&&e.code==="not_granted"){ttsNs=null;render();}});return;}
  if(HOSTED&&window.speechSynthesis){var u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=.95;u.onend=u.onerror=function(){speaking=false;syncVoice();};speaking=true;syncVoice();window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
}
$("micbtn").addEventListener("click",toggleMic);

/* ---------- the plate: speckled stoneware with a clay rim. The rim carries the meals; the food sits in the well ---------- */
var TID=0;
function foodKind(it){
  var t=(it.t||"").toLowerCase(),u=it.u;
  if(/^lemon|lemon, squeezed/.test(t))return "lemon";
  if(u==="glass")return /chai|tea|coffee/.test(t)?"chai":"milk";
  if(/phulka|roti|chapati|naan|khakhra|toast|bread|pav/.test(t))return "roti";
  if(/idli/.test(t))return "idli";if(/dosa|uttapam|chilla|cheela/.test(t))return "dosa";
  if(/egg|omelette/.test(t))return /bhurji|omelette/.test(t)?"bhurji":"egg";
  if(/curd rice/.test(t))return "rice";if(/khichdi|poha|upma|dalia|pulao|biryani|broken wheat|millet/.test(t))return "yrice";if(/rice/.test(t))return "rice";
  if(/salad|kachumber|cucumber|sticks|tomato/.test(t))return "salad";
  if(/curd|raita|dahi|hung|dip|chhena/.test(t))return "curd";
  if(/paneer|tofu/.test(t))return "paneer";
  if(/rajma|chole|chana|lobia/.test(t))return u==="fistful"?"nuts":"beans";
  if(/sprout|sundal/.test(t))return "sprouts";
  if(/chicken|fish|soya|mutton/.test(t))return "curry";
  if(/dal|sambar|kadhi|soup|rasam|dalma/.test(t))return "dal";
  if(/chutney/.test(t))return "chutney";
  if(/fruit|guava|apple|orange|pear|banana|papaya|corn/.test(t))return "fruit";
  if(/peanut|almond|walnut|nut|makhana/.test(t))return "nuts";
  return "sabzi";
}
/* muted, glaze-like food tones that sit with clay and olive */
var FOODC={dal:"#D6A548",beans:"#8E4A2E",sabzi:"#7C8A45",curd:"#F7F1E4",paneer:"#C9784A",curry:"#A4532F",sprouts:"#B9B07A",chutney:"#6F7F3E",bhurji:"#DDB75A",milk:"#F7F1E4",chai:"#B88A60",salad:"#9AA867",rice:"#F6F0E2",yrice:"#E2C27A",roti:"#D9B888",idli:"#F7F1E4",dosa:"#D7A75C",egg:"#F7F1E4",fruit:"#D17E45",nuts:"#A9774B"};
function thali(items,size,label,dial){
  var id="th"+(TID++),s=svgEl("svg",{viewBox:"0 0 240 240","class":"thali",role:"img","aria-label":label||"Your plate"});if(size)s.style.width=size+"px";
  function rnd(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
  var defs=svgEl("defs",{});
  function rg(gid,stops,cx,cy){var g=svgEl("radialGradient",{id:id+gid,cx:cx||"40%",cy:cy||"34%",r:"78%"});stops.forEach(function(x){var st=svgEl("stop",{offset:x[0]});st.style.stopColor=x[1];g.appendChild(st);});defs.appendChild(g);return "url(#"+id+gid+")";}
  var glaze=rg("g",[["0","#F6F0E5"],[".7","#E9DFCE"],["1","#D9CCB6"]]),clay=rg("c",[["0","#D08A63"],["1","#A65A36"]],"30%","26%"),well=rg("w",[["0","#EFE6D6"],["1","#E3D7C2"]],"50%","40%");
  var fl=svgEl("filter",{id:id+"f",x:"-20%",y:"-20%",width:"140%",height:"140%"});fl.appendChild(svgEl("feDropShadow",{dx:"0",dy:"7",stdDeviation:"7","flood-color":"#5A4632","flood-opacity":".28"}));defs.appendChild(fl);
  s.appendChild(defs);
  var base=svgEl("circle",{cx:"120",cy:"120",r:"117",filter:"url(#"+id+"f)"});base.style.fill=clay;s.appendChild(base);
  var p1=svgEl("circle",{cx:"120",cy:"120",r:"112"});p1.style.fill=glaze;s.appendChild(p1);
  var p2=svgEl("circle",{cx:"120",cy:"120",r:dial?"88":"98"});p2.style.fill=well;p2.setAttribute("class","th-well");s.appendChild(p2);
  for(var i=0;i<70;i++){var a=rnd(i)*6.283,d=Math.sqrt(rnd(i+90))*110,sp=svgEl("circle",{cx:String(120+Math.cos(a)*d),cy:String(120+Math.sin(a)*d),r:String(.35+rnd(i+200)*1.1)});sp.setAttribute("class","th-speck");s.appendChild(sp);}
  if(dial){
    var arc=svgEl("path",{id:id+"a",d:"M20,120 A100,100 0 0,1 220,120",fill:"none"});defs.appendChild(arc);
    var pos={breakfast:"13%",lunch:"38%",snack:"62%",dinner:"87%"};
    MEALS.forEach(function(m){var t=svgEl("text",{"class":"th-meal"+(m[0]===dial?" on":""),"text-anchor":"middle"}),tp=svgEl("textPath",{href:"#"+id+"a",startOffset:pos[m[0]]});tp.textContent=m[1].toUpperCase();t.appendChild(tp);s.appendChild(t);});
    var ang={breakfast:-156.6,lunch:-111.6,snack:-68.4,dinner:-23.4}[dial]*Math.PI/180,lx=120+Math.cos(ang)*78,ly=120+Math.sin(ang)*78;
    var leaf=svgEl("path",{d:"M0,-9 C5,-4 5,4 0,9 C-5,4 -5,-4 0,-9 Z","class":"th-leaf",transform:"translate("+lx.toFixed(1)+","+ly.toFixed(1)+") rotate("+(ang*180/Math.PI+90).toFixed(1)+")"});s.appendChild(leaf);
  }
  var list=items.filter(function(it){return foodKind(it)!=="lemon"&&!(/chutney/.test(it.t)&&it.u!=="katori");}).slice(0,6),n=list.length,lim=dial?.86:1;
  var R=(n<=1?0:n===2?44:n===3?48:n===4?50:54)*lim,maxr=(n<=1?54:n===2?36:n===3?33:n===4?30:26)*lim,around=n>=5?n-1:n;
  function dots(g,cx,cy,r,cols,count,sz,seed){for(var i=0;i<count;i++){var a=rnd(seed+i)*6.283,d=Math.sqrt(rnd(seed+i+50))*r*.78,c=svgEl("circle",{cx:String(cx+Math.cos(a)*d),cy:String(cy+Math.sin(a)*d),r:String(sz*(.7+rnd(seed+i+9)*.6))});c.style.fill=cols[i%cols.length];g.appendChild(c);}}
  list.forEach(function(it,i){
    var k=foodKind(it),v=Math.max(.55,Math.min(1.2,.72+volOf(it)*.22)),r=Math.round(maxr*Math.min(1,v)),cx=120,cy=120;
    if(n>1&&!(n>=5&&i===n-1)){var a=(-90+(n===2?-90:0)+i*360/around)*Math.PI/180;cx=120+Math.cos(a)*R;cy=120+Math.sin(a)*R;}else if(n>=5)r=Math.round(maxr*.85);
    var g=svgEl("g",{"class":"th-item"+(it.tag==="added"?" new":"")});g.style.transformOrigin=cx+"px "+cy+"px";g.style.animationDelay=(i*50)+"ms";
    function circ(x,y,rr,fill,cls){var c=svgEl("circle",{cx:String(x),cy:String(y),r:String(rr)});if(fill)c.style.fill=fill;if(cls)c.setAttribute("class",cls);g.appendChild(c);return c;}
    var cnt=Math.max(1,Math.min(4,Math.round(it.n))),j,fc=FOODC[k]||FOODC.sabzi;
    if(k==="roti"){for(j=0;j<cnt;j++){var ox=cx-(cnt-1)*2.5+j*5,oy=cy-(cnt-1)*2+j*4;circ(ox,oy,r,fc,"th-edge");dots(g,ox,oy,r,["#B48B5C","#C29A6A"],6,r*.06,i*10+j);}}
    else if(k==="idli"||k==="egg"){var rr=r*(cnt>1?.55:.8);for(j=0;j<cnt;j++){var aa=j*6.283/cnt-1.2,dx=cnt>1?Math.cos(aa)*r*.48:0,dy=cnt>1?Math.sin(aa)*r*.48:0;circ(cx+dx,cy+dy,rr,fc,"th-edge");if(k==="egg")circ(cx+dx,cy+dy,rr*.42,"#E3A83C");}}
    else if(k==="dosa"){circ(cx,cy,r,fc,"th-edge");dots(g,cx,cy,r,["#B9853F"],5,r*.06,i*7);}
    else if(k==="rice"||k==="yrice"||k==="salad"){circ(cx,cy,r,fc,"th-edge");dots(g,cx,cy,r,k==="rice"?["#E6DDCB"]:k==="salad"?["#6F7F3E","#C9603E","#F3ECDD"]:["#B99A55","#7C8A45"],k==="salad"?12:10,r*.08,i*13);}
    else if(k==="fruit"){circ(cx,cy,r*.78,fc,"th-edge");}
    else if(k==="nuts"){dots(g,cx,cy,r*.9,["#A9774B","#C49A6A","#8C5D36"],11,r*.15,i*19);}
    else{circ(cx,cy,r,"#F3ECDF","th-bowl");circ(cx,cy,r-4.5,fc,"th-food");
      if(k==="dal")dots(g,cx,cy,r-7,["#9A4A2A","#6F7F3E"],5,r*.05,i*23);
      if(k==="sabzi")dots(g,cx,cy,r-7,["#56632F","#A7B172","#C98C46"],9,r*.1,i*29);
      if(k==="beans")dots(g,cx,cy,r-7,["#B06A44","#6E3420"],9,r*.1,i*31);
      if(k==="paneer")for(j=0;j<4;j++){var pa=rnd(i*37+j)*6.283,pd=rnd(i*41+j)*(r-12),sq=svgEl("rect",{x:String(cx+Math.cos(pa)*pd-r*.13),y:String(cy+Math.sin(pa)*pd-r*.13),width:String(r*.26),height:String(r*.26),rx:"2"});sq.style.fill="#F7EEDC";g.appendChild(sq);}
      if(k==="curry")dots(g,cx,cy,r-8,["#7A3A1E","#C98C5A"],5,r*.15,i*43);
      if(k==="sprouts")dots(g,cx,cy,r-7,["#7C8A45","#EFE6CC"],10,r*.08,i*47);
      if(k==="bhurji")dots(g,cx,cy,r-7,["#C9603E","#7C8A45"],8,r*.09,i*53);}
    s.appendChild(g);
  });
  return s;
}
/* a pressed olive sprig, drawn in ink */
function sprig(cls){
  var s=svgEl("svg",{viewBox:"0 0 120 60","class":"sprig "+(cls||""),"aria-hidden":"true"});
  s.appendChild(svgEl("path",{d:"M4,52 C30,40 60,30 116,8","class":"sp-stem"}));
  [[18,46,-30],[30,40,150],[42,36,-35],[54,31,150],[66,27,-38],[78,22,152],[90,18,-40],[102,13,150]].forEach(function(x){
    s.appendChild(svgEl("path",{d:"M0,0 C4,-5 13,-6 18,-3 C13,1 5,2 0,0 Z","class":"sp-leaf",transform:"translate("+x[0]+","+x[1]+") rotate("+x[2]+")"}));});
  return s;
}

/* an ink vine that rises and falls like the curve it borrows from */
function vine(flip){
  var s=svgEl("svg",{viewBox:"0 0 170 110","class":"vine"+(flip?" flip":""),"aria-hidden":"true"}),pts=[],x,d="";
  for(x=0;x<=170;x+=5){var y=62-34*Math.sin((x/170)*Math.PI*1.5+.2);pts.push([x,y]);d+=(x?"L":"M")+x+","+y.toFixed(1)+" ";}
  s.appendChild(svgEl("path",{d:d,"class":"vn-stem"}));
  for(var i=2;i<pts.length-1;i+=2){var a=pts[i],b=pts[i+1],an=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,up=(i/2)%2?1:-1,sc=.8+((i*37)%5)/10;
    s.appendChild(svgEl("path",{d:"M0,0 C3,-6 12,-8 17,-4 C12,1 4,2 0,0 Z","class":"vn-leaf",transform:"translate("+a[0]+","+a[1].toFixed(1)+") rotate("+(an+up*48).toFixed(0)+") scale("+sc+")"}));
    if(i%6===0)s.appendChild(svgEl("circle",{cx:String(a[0]+up*5),cy:String(a[1]-up*9),r:"1.6","class":"vn-bud"}));}
  return s;
}
function stamp(){
  var s=svgEl("svg",{viewBox:"0 0 120 120","class":"stamp","aria-hidden":"true"});
  s.appendChild(svgEl("circle",{cx:"60",cy:"60",r:"54","class":"st-ring"}));s.appendChild(svgEl("circle",{cx:"60",cy:"60",r:"40","class":"st-ring thin"}));
  var defs=svgEl("defs",{});defs.appendChild(svgEl("path",{id:"stp",d:"M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"}));s.appendChild(defs);
  var t=svgEl("text",{"class":"st-txt"}),tp=svgEl("textPath",{href:"#stp",startOffset:"2%"});tp.textContent="DRAFT PLATES \u00B7 AWAITING YOUR COACH \u00B7 DRAFT PLATES \u00B7";t.appendChild(tp);s.appendChild(t);
  var m=svgEl("text",{x:"60",y:"57","text-anchor":"middle","class":"st-mid"});m.textContent="not yet";s.appendChild(m);
  var m2=svgEl("text",{x:"60",y:"73","text-anchor":"middle","class":"st-mid"});m2.textContent="approved";s.appendChild(m2);
  return s;
}

/* ---------- motion helpers: numbers count, rings and the curve glide ---------- */
var RM=false;try{RM=matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
var PREVN={},PREVR={},PREVC={};
function tw(id,val,fmt){
  var s=el("span","mono");s.id=id;var from=PREVN[id];PREVN[id]=val;fmt=fmt||function(x){return String(Math.round(x));};
  if(from==null||from===val||RM){s.textContent=fmt(val);return s;}
  var t0=performance.now();s.textContent=fmt(from);
  requestAnimationFrame(function step(t){var k=Math.min(1,(t-t0)/420),e=1-Math.pow(1-k,3);s.textContent=fmt(from+(val-from)*e);if(k<1)requestAnimationFrame(step);});
  return s;
}
function aring(key,sh,c1,c2,dark,label){
  var s=ring(sh,c1,c2,dark,label),segs=[].slice.call(s.querySelectorAll(".seg")),fin=segs.map(function(c){return [c.getAttribute("stroke-dasharray"),c.getAttribute("stroke-dashoffset")];}),prev=PREVR[key];
  PREVR[key]=fin;
  if(prev&&prev.length===fin.length&&!RM){
    segs.forEach(function(c,i){c.style.strokeDasharray=prev[i][0];c.style.strokeDashoffset=prev[i][1];});
    requestAnimationFrame(function(){requestAnimationFrame(function(){segs.forEach(function(c,i){c.style.strokeDasharray=fin[i][0];c.style.strokeDashoffset=fin[i][1];});});});
  }
  return s;
}
function svgEl(tag,attrs){var n=document.createElementNS(NS,tag);for(var k in attrs)n.setAttribute(k,attrs[k]);return n;}
function curveY(A,tp,t){return 104-Math.min(A,86)*1.1*Math.pow((t/tp)*Math.exp(1-t/tp),1.8);}
function curvePts(A,tp){var out=[],t;for(t=0;t<=180;t+=3)out.push([6+t/180*308,curveY(A,tp,t)]);return out;}
function pathOf(pts){return pts.map(function(p,i){return (i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");}
function curve(key,r){
  var s=svgEl("svg",{viewBox:"0 0 320 126","class":"curve",role:"img","aria-label":"After-meal curve, a model. Rise "+r.idx+" of 100, "+r.band.toLowerCase()+"."});
  var defs=svgEl("defs",{}),g=svgEl("linearGradient",{id:"cg-"+key,x1:"0",y1:"0",x2:"0",y2:"1"});
  var s1=svgEl("stop",{offset:"0"});s1.style.stopColor="var(--glow)";s1.style.stopOpacity=".34";var s2=svgEl("stop",{offset:"1"});s2.style.stopColor="var(--glow)";s2.style.stopOpacity="0";
  g.appendChild(s1);g.appendChild(s2);defs.appendChild(g);s.appendChild(defs);
  function band(y,h,cls){var b=svgEl("rect",{x:"6",y:String(y),width:"308",height:String(h),rx:"4","class":cls});s.appendChild(b);}
  band(71,33,"cb-g");band(49,22,"cb-m");
  var th=svgEl("line",{x1:"6",y1:"49",x2:"314",y2:"49","class":"c-th"});s.appendChild(th);
  [["GENTLE",99],["MODERATE",65],["SHARP",43]].forEach(function(x){var t=svgEl("text",{x:"312",y:String(x[1]),"text-anchor":"end","class":"c-lab"});t.textContent=x[0];s.appendChild(t);});
  s.appendChild(svgEl("line",{x1:"6",y1:"104",x2:"314",y2:"104","class":"c-base"}));
  [["Meal",6,"start"],["+1 h",108.7,"middle"],["+2 h",211.3,"middle"],["+3 h",314,"end"]].forEach(function(x){var t=svgEl("text",{x:String(x[1]),y:"120","text-anchor":x[2],"class":"c-ax"});t.textContent=x[0];s.appendChild(t);});
  var area=svgEl("path",{"class":"c-area",fill:"url(#cg-"+key+")"}),raw=svgEl("path",{"class":"c-raw"}),act=svgEl("path",{"class":"c-act"}),dot=svgEl("circle",{r:"4.5","class":"c-dot"});
  var lv=svgEl("g",{"class":"c-leaves"});
  s.appendChild(area);s.appendChild(raw);s.appendChild(act);s.appendChild(lv);s.appendChild(dot);
  var to={a:r.idx,b:r.raw,tp:r.tp},from=PREVC[key]||to;PREVC[key]=to;
  function draw(a,b,tp){var pa=curvePts(a,tp),pb=curvePts(b,Math.max(30,tp-8));act.setAttribute("d",pathOf(pa));raw.setAttribute("d",pathOf(pb));
    area.setAttribute("d",pathOf(pa)+" L314,104 L6,104 Z");
    while(lv.firstChild)lv.removeChild(lv.firstChild);
    for(var q=4;q<pa.length-2;q+=5){var p0=pa[q],p1=pa[q+1],an=Math.atan2(p1[1]-p0[1],p1[0]-p0[0])*180/Math.PI,up=(q/5)%2?1:-1;
      lv.appendChild(svgEl("path",{d:"M0,0 C2.5,-3.5 8,-4.5 11,-2 C8,1 3,1.5 0,0 Z",transform:"translate("+p0[0].toFixed(1)+","+p0[1].toFixed(1)+") rotate("+(an+up*38).toFixed(1)+")"}));}dot.setAttribute("cx",String(6+tp/180*308));dot.setAttribute("cy",String(curveY(a,tp,tp)));}
  if(RM||(from.a===to.a&&from.b===to.b&&from.tp===to.tp)){draw(to.a,to.b,to.tp);return s;}
  var t0=performance.now();draw(from.a,from.b,from.tp);
  requestAnimationFrame(function step(t){var k=Math.min(1,(t-t0)/460),e=1-Math.pow(1-k,3);draw(from.a+(to.a-from.a)*e,from.b+(to.b-from.b)*e,from.tp+(to.tp-from.tp)*e);if(k<1)requestAnimationFrame(step);});
  return s;
}
function panelHead(host,eyebrow,title,right){
  var h=el("div","panel-h"),l=el("div");l.appendChild(el("p","eyebrow",eyebrow));l.appendChild(el("h2",null,title));h.appendChild(l);if(right)h.appendChild(right);host.appendChild(h);
}
function liveTag(t){var s=el("span","live");s.appendChild(el("i"));s.appendChild(document.createTextNode(t));return s;}
function blockedCard(){
  var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("shield"));
  add(c,i,el("h2",null,SAFETY),el("p",null,"Your health setting asks for your coach and doctor to plan meals with you. Nothing here is suggested for now."));
  var b=btn("btn","Change My food",null,null);b.addEventListener("click",openSheet);c.appendChild(b);return c;
}
function bodyGroup(host,inSheet){
  var q=el("div","qs");q.appendChild(el("p","cap","Body weight, optional"));
  var r=el("div","kg"),inp=el("input");inp.type="number";inp.id=(inSheet?"sheet":"setup")+"-kg";inp.min="30";inp.max="200";inp.inputMode="numeric";inp.placeholder="kg";inp.setAttribute("aria-label","Body weight in kilograms");if(M.kg)inp.value=String(M.kg);
  inp.addEventListener("change",function(){var v=Math.round(+this.value);M.kg=v>=30&&v<=200?v:0;if(!M.kg)this.value="";save();if(inSheet)render();});
  add(r,inp,el("span",null,"Sets your protein target for the day at 1 g per kg. Left empty, it uses 55 g."));q.appendChild(r);host.appendChild(q);
}

/* ---------- layout: phone app, or the studio on a wide screen ---------- */
var PANELS=["plate","lab","rescue","rhythm","ask"];
function applyLayout(){LAYOUT=window.innerWidth>=1080&&USERLAYOUT!=="phone"&&M.done?"studio":"phone";$("app").setAttribute("data-layout",LAYOUT);document.body.setAttribute("data-layout",LAYOUT);}
function renderChrome(){
  var setup=!M.done;
  $("myfood").hidden=setup;$("tabs").hidden=setup;$("lswitch").hidden=setup;
  $("myfoodtxt").textContent=setup?"":lab("diet",M.diet)+" · "+lab("region",M.region)+(M.health!=="none"?" · "+lab("health",M.health):"");
  PANELS.forEach(function(v){var t=$("tab-"+v);if(VIEW===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current");});
  $("ls-studio").setAttribute("aria-pressed",LAYOUT==="studio"?"true":"false");$("ls-phone").setAttribute("aria-pressed",LAYOUT==="phone"?"true":"false");
  $("composer").hidden=blocked();syncVoice();
  var d0=new Date(now.getFullYear(),0,0),doy=Math.floor((now-d0)/864e5);$("issue").textContent="Issue No. "+doy;$("mastdate").textContent=now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
}
function show(v,noScroll){
  if(PANELS.indexOf(v)<0)v="plate";
  if(v!==VIEW){$("toast").hidden=true;clearTimeout(toastT);}
  VIEW=v;applyLayout();
  var setup=!M.done,studio=LAYOUT==="studio";
  $("v-setup").hidden=!setup;$("ctx").hidden=setup||(!studio&&v!=="plate");
  PANELS.forEach(function(k){$("v-"+k).hidden=setup||(!studio&&k!==v);});
  if(!studio||setup){var n=$(setup?"v-setup":"v-"+v);n.classList.remove("enter");void n.offsetWidth;n.classList.add("enter");}
  if(!noScroll)$("scroll").scrollTop=0;
  render();
}
function render(){
  var keep=document.activeElement&&document.activeElement.id;
  renderChrome();
  if(!M.done)renderSetup();
  else if(LAYOUT==="studio"){renderCtx();renderToday();renderLab();renderRescue();renderRhythm();renderAsk();}
  else{if(VIEW==="plate"){renderCtx();renderToday();}else if(VIEW==="lab")renderLab();else if(VIEW==="rescue")renderRescue();else if(VIEW==="rhythm")renderRhythm();else renderAsk();}
  if(keep&&$(keep)&&$(keep)!==document.activeElement&&keep!=="askin")try{$(keep).focus({preventScroll:true});}catch(e){}
}
window.addEventListener("resize",function(){var b=LAYOUT;applyLayout();if(b!==LAYOUT)show(VIEW,true);});
$("ls-studio").addEventListener("click",function(){USERLAYOUT="";show(VIEW,true);});
$("ls-phone").addEventListener("click",function(){USERLAYOUT="phone";show(VIEW,true);});

/* ---------- context: what the day already holds, and the four dials ---------- */
function dayTotals(){var mine=LOG.filter(function(l){return l.day===DAY;}),p=0,k=0;mine.forEach(function(l){p+=l.p||0;k+=l.k||0;});return {n:mine.length,p:p,k:k,list:mine};}
function nextMeal(){
  for(var i=0;i<4;i++){var m=MEALS[i];if(hr<m[4]){if(hr>=m[3]-.25)return {now:true,m:m};var d=m[3]-hr,h=Math.floor(d),mi=Math.round((d-h)*60);return {now:false,m:m,inTxt:(h?h+" h ":"")+mi+" min"};}}
  return {done:true,m:MEALS[0]};
}
function renderCtx(){
  var c=$("ctx");c.textContent="";
  var d=dayTotals(),tg=target(),tiles=el("div","tiles");
  function tile(cap,valNode,extra,id){var t=el("div","tile2");if(id)t.id=id;t.appendChild(el("p","cap",cap));var v=el("div","v");v.appendChild(valNode);t.appendChild(v);if(extra)t.appendChild(extra);return t;}
  var pv=document.createDocumentFragment();pv.appendChild(document.createTextNode("≈"));pv.appendChild(tw("t-pro",d.p));pv.appendChild(el("small",null," / "+tg+" g"));
  var bar=el("div","bar"),bi=el("i");bi.style.width=Math.min(100,Math.round(d.p/tg*100))+"%";bar.appendChild(bi);
  tiles.appendChild(tile("Protein today",pv,bar));
  var mv=document.createDocumentFragment();mv.appendChild(tw("t-meals",d.n));mv.appendChild(el("small",null," of 4 plates saved"));
  var dots=el("div","mdots");MEALS.forEach(function(m){var got=d.list.some(function(l){return l.meal===m[0];});var x=el("i",got?"on":null);x.title=m[1];dots.appendChild(x);});
  tiles.appendChild(tile("Today",mv,dots));
  var wv=document.createDocumentFragment();wv.appendChild(tw("t-water",DAYST.water));wv.appendChild(el("small",null,DAYST.water===1?" glass":" glasses"));
  var wb=el("div","wbtns"),wm=btn("wbtn",null,"minus","water-minus"),wp=btn("wbtn",null,"plus","water-plus");wm.setAttribute("aria-label","One glass less");wp.setAttribute("aria-label","Add a glass of water");
  wm.addEventListener("click",function(){DAYST.water=Math.max(0,DAYST.water-1);save();render();});wp.addEventListener("click",function(){DAYST.water=Math.min(20,DAYST.water+1);save();render();});add(wb,wm,wp);
  tiles.appendChild(tile("Water",wv,wb));
  var nm=nextMeal(),nv=document.createDocumentFragment();nv.appendChild(el("span","mono",nm.done?"Day done":nm.now?"Now":nm.inTxt));nv.appendChild(el("small",null,nm.done?"":" · "+nm.m[1].toLowerCase()));
  tiles.appendChild(tile(nm.done?"Kitchen closed":nm.now?"Time for":"Next meal",nv,el("p","tsub",nm.done?"Breakfast from "+hm(MEALS[0][3]):hm(nm.m[3])+" to "+hm(nm.m[4]))));
  c.appendChild(tiles);
  var rail=el("div","rail");
  function pill(key,icon,label,value){var b=el("button","pillsel");b.type="button";b.id="dial-"+key;b.setAttribute("aria-expanded",OPEN===key?"true":"false");b.appendChild(ic(icon));b.appendChild(el("span",null,label));b.appendChild(el("b",null,value));b.appendChild(ic("chevd"));
    b.addEventListener("click",function(){OPEN=OPEN===key?"":key;render();});return b;}
  add(rail,pill("mode",modeOf(S.mode)[3],"",modeOf(S.mode)[1]),pill("sit",SITICON[S.sit],"",lab("sit",S.sit)),pill("hunger","flame","Hunger",S.h10+"/10"),pill("goal",GOALICON[S.goal],"",lab("goal",S.goal)));
  c.appendChild(rail);
  if(OPEN==="mode"){var g=el("div","grid2");g.setAttribute("role","radiogroup");g.setAttribute("aria-label","What kind of day");
    MODES.forEach(function(m){var b=el("button","tile");b.type="button";b.id="mode-"+m[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",S.mode===m[0]?"true":"false");b.appendChild(ic(m[3]));var t=el("span",null,m[1]);t.appendChild(el("small",null,m[2]));b.appendChild(t);
      b.addEventListener("click",function(){S.mode=m[0];OPEN="";page=0;sel=0;FRESH=true;save();render();toast(m[1]+". Plates and tips follow it.");});g.appendChild(b);});c.appendChild(g);}
  if(OPEN==="sit"){var g2=el("div","grid2");g2.setAttribute("role","radiogroup");g2.setAttribute("aria-label","Today I'm");
    OPT.sit.forEach(function(o){var b=el("button","tile");b.type="button";b.id="sit-"+o[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",S.sit===o[0]?"true":"false");b.appendChild(ic(SITICON[o[0]]));b.appendChild(el("span",null,o[1]));
      b.addEventListener("click",function(){S.sit=o[0];OPEN="";page=0;sel=0;FRESH=true;render();});g2.appendChild(b);});c.appendChild(g2);}
  if(OPEN==="hunger"){var w=el("div","slide"),top=el("div","slide-h"),val=el("b","mono",S.h10+"/10"),word=el("span",null,lab("hunger",S.hunger));
    add(top,el("span",null,"Not hungry"),add(el("span","slide-v"),val,document.createTextNode(" "),word),el("span",null,"Starving"));
    var r=el("input");r.type="range";r.id="hunger-range";r.min="1";r.max="10";r.step="1";r.value=String(S.h10);r.setAttribute("aria-label","Hunger from 1 to 10");r.style.setProperty("--fill",((S.h10-1)/9*100)+"%");
    r.addEventListener("input",function(){setHunger(+this.value);val.textContent=S.h10+"/10";word.textContent=lab("hunger",S.hunger);this.style.setProperty("--fill",((S.h10-1)/9*100)+"%");});
    r.addEventListener("change",function(){render();});
    add(w,top,r,el("p","tsub","1 to 3 trims the grain. 8 to 10 adds protein and vegetables first."));c.appendChild(w);}
  if(OPEN==="goal"){var g3=el("div","choice-row");g3.setAttribute("role","radiogroup");g3.setAttribute("aria-label","Goal");
    OPT.goal.forEach(function(o){var b=btn("choice",o[1],GOALICON[o[0]],"goal-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",S.goal===o[0]?"true":"false");
      b.addEventListener("click",function(){S.goal=o[0];OPEN="";page=0;sel=0;FRESH=true;save();render();toast("Goal: "+o[1]);});g3.appendChild(b);});c.appendChild(g3);}
}

/* ---------- 01 Today: the plate engine ---------- */
function curPlate(){var t=three();if(sel>=t.list.length)sel=0;return t.list.length?{m:t.list[sel],t:t}:{m:null,t:t};}
function heroCard(m,v){
  var nu=nutPlate(v.items),sh=shares(v.items),rs=riseOf(nu,HAB),card=el("article","plate"+(FRESH?" fresh":""));card.id="plate-card";
  var h=el("div","hero"),top=el("div","hero-top");
  function chip(t,cls,icon){var c=el("span","hchip"+(cls?" "+cls:""));if(icon)c.appendChild(ic(icon));c.appendChild(el("span",null,t));return c;}
  top.appendChild(chip(lab("diet",M.diet),"fit","check"));
  M.leave.forEach(function(k){top.appendChild(chip("No "+lab("leave",k).toLowerCase(),"fit","check"));});
  if(S.goal==="lose"&&m.tags.indexOf("L")>=0)top.appendChild(chip("Light","fit","check"));
  if((S.goal==="strength"||S.mode==="active")&&m.tags.indexOf("P")>=0)top.appendChild(chip("Protein-forward","fit","check"));
  if(S.low!=="none"&&m.low.indexOf(S.low)>=0)top.appendChild(chip("Leans on "+LOWNAME[S.low],"fit","check"));
  top.appendChild(chip(m.min>0?m.min+" min":(S.sit==="out"?"Order it":"Ready"),"time","clock"));
  var main=el("div","hero-main"),txt=el("div");
  main.appendChild(thali(v.items,0,"Your "+mealName(S.meal).toLowerCase()+" plate: "+summary(v.items),S.meal));h.appendChild(sprig("hero-sprig"));var band=el("div","band");band.appendChild(vine(false));band.appendChild(vine(true));h.appendChild(band);var sc=el("span","scribble");var vw0=vegWord(sh.veg);sc.appendChild(document.createTextNode(vw0==="None"?"no veg here yet":vw0.toLowerCase()+(vw0==="A little"?" veg on":" of")+" the plate"+(vw0==="A little"?"":" is veg")));main.appendChild(sc);
  txt.appendChild(el("h2",null,m.n));txt.appendChild(el("p","sub",summary(v.items)));main.appendChild(txt);
  var rd=el("div","read4");
  function cell(cap,node,unit,cls){var d=el("div","tcard");d.appendChild(el("p","cap",cap));var x=el("span","v"+(cls?" "+cls:""));x.appendChild(node);if(unit)x.appendChild(el("small",null,unit));d.appendChild(x);return d;}
  add(rd,cell("Protein",tw("h-p",nu.p),"g"),cell("Energy",tw("h-k",nu.k),"kcal"),cell("Fibre",tw("h-f",nu.f),"g"),cell("Rise",el("span","mono",rs.band),null,bandCls(rs.band)));
  var tn=el("div","tune");tn.appendChild(el("p","cap","Tune this plate"));
  [["pro","More protein","dumbbell"],["gentle","Gentler on sugar","lab"],["quick","Under 15 min","bolt"]].forEach(function(x){
    var b=btn("tbtn",x[1],x[2],"tune-"+x[0]);setPressed(b,TUNE[x[0]]);
    b.addEventListener("click",function(){TUNE[x[0]]=!TUNE[x[0]];if(x[0]==="quick"){page=0;sel=0;FRESH=true;}render();
      if(x[0]==="quick"&&TUNE.quick&&!pick().some(function(q){return q.min<=15;}))toast("Nothing faster fits right now.");});tn.appendChild(b);});
  add(h,top,main,rd,tn);
  if(v.log.length){var ml=el("ul","modlog");v.log.forEach(function(x){ml.appendChild(el("li",null,x));});h.appendChild(ml);}
  card.appendChild(h);
  var sv=el("div","serve"),sh2=el("div","serve-h");
  sh2.appendChild(el("p","cap","What to serve"));
  var tools=el("div","serve-tools");
  if(canSpeak()){var ls=btn("linkbtn","Listen","speaker","listen");setPressed(ls,speaking);ls.addEventListener("click",function(){sayText(mealName(S.meal)+". "+m.n+". "+v.items.map(lineText).join(". ")+". "+(m.why||""));});tools.appendChild(ls);}
  var adj=el("button","linkbtn");adj.type="button";adj.id="adjust";adj.setAttribute("aria-expanded",ADJ?"true":"false");adj.appendChild(ic(ADJ?"x":"sliders"));adj.appendChild(el("span",null,ADJ?"Done":"Adjust"));
  adj.addEventListener("click",function(){ADJ=!ADJ;render();});tools.appendChild(adj);sh2.appendChild(tools);sv.appendChild(sh2);
  if(ADJ){var d=el("div","drawer"),b2=el("div");b2.appendChild(el("p","cap","Minding"));var lw=el("div","lows");lw.setAttribute("role","radiogroup");lw.setAttribute("aria-label","Running low on");
    OPT.low.forEach(function(o){var b=btn("choice",o[0]==="none"?"Nothing":o[1],null,"low-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",S.low===o[0]?"true":"false");
      b.addEventListener("click",function(){S.low=o[0];page=0;sel=0;FRESH=true;save();render();});lw.appendChild(b);});
    b2.appendChild(lw);d.appendChild(b2);
    var sw=swapFor(m);if(sw){var r=el("button","swaprow");r.type="button";r.id="swap";setPressed(r,!!SW[m.id]);r.appendChild(el("span",null,"Swap "+shortOf(m.items[sw.i])+" for "+sw.t));r.appendChild(el("span","switch"));
      r.addEventListener("click",function(){SW[m.id]=!SW[m.id];render();});d.appendChild(r);}
    sv.appendChild(d);}
  sv.appendChild(measuresList(v.items));card.appendChild(sv);
  var acts=el("div","acts");acts.style.gridTemplateColumns="1fr 1.35fr";
  var another=btn("btn","Another plate","refresh","another");another.addEventListener("click",function(){
    var t=three();if(t.all.length<2){toast("This is the only plate that fits right now.");return;}
    sel++;if(sel>=t.list.length){page++;sel=0;}FRESH=true;ADJ=false;resetTune();render();toast("Next plate for "+mealName(S.meal).toLowerCase());});
  var have=picked(m),hv=btn("btn "+(have?"done":"primary"),have?"Saved for "+mealName(S.meal).toLowerCase():"I'll have this","check","have");
  hv.addEventListener("click",function(){logPick(m,v);render();toast("Saved for "+mealName(S.meal).toLowerCase()+". The next meal will balance it.");});
  add(acts,another,hv);card.appendChild(acts);
  var shr=el("div","share"),txtm=msgText(m,v);shr.appendChild(el("p","cap","Send to coach"));
  var wa=waLink(txtm);wa.id="wa";wa.addEventListener("click",function(){logPick(m,v);setTimeout(render,0);});
  var lb=btn("mini only-phone","Lab","lab","to-lab");lb.addEventListener("click",function(){LABSRC="plate";show("lab");});
  add(shr,wa,copyBtn(txtm,"copy",function(){logPick(m,v);setTimeout(render,0);}),lb);card.appendChild(shr);
  return card;
}
function renderToday(){
  var v=$("v-plate");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());FRESH=false;return;}
  panelHead(v,"01 · Plate engine","Your next plate",liveTag("Live from your choices"));
  var ms=el("div","meals");ms.setAttribute("role","radiogroup");ms.setAttribute("aria-label","Meal");
  MEALS.forEach(function(m){var b=el("button","meal");b.type="button";b.id="meal-"+m[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",S.meal===m[0]?"true":"false");
    b.appendChild(ic(m[2]));b.appendChild(el("span",null,m[1]));if(m[0]===CLOCK){var d=el("i","now");d.setAttribute("aria-label","now");b.appendChild(d);}
    b.addEventListener("click",function(){if(S.meal===m[0])return;S.meal=m[0];page=0;sel=0;ADJ=false;FRESH=true;resetTune();render();});ms.appendChild(b);});
  v.appendChild(ms);
  var cp=curPlate(),t=cp.t;
  if(!cp.m){
    var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("info"));
    var word={breakfast:"breakfast",lunch:"lunch",snack:"a snack",dinner:"dinner"}[S.meal];
    add(c,i,el("h2",null,"No plate on your coach's list fits this yet"),el("p",null,"Nothing fits "+(M.diet==="jain"?"Jain":lab("diet",M.diet).toLowerCase())+(M.leave.length?", without "+M.leave.map(function(x){return lab("leave",x).toLowerCase();}).join(" or "):"")+", for "+word+" when you're "+lab("sit",S.sit).toLowerCase()+". Your food rules stay as they are."));
    var a=btn("btn primary","Ask for a plate instead","chat","noplate-ask");a.addEventListener("click",function(){var q="Give me a "+mealName(S.meal).toLowerCase()+" plate. I'm "+lab("sit",S.sit).toLowerCase()+".";if(LAYOUT==="phone")show("ask");$("askin").value=q;setTimeout(function(){$("askin").focus();},60);});c.appendChild(a);
    v.appendChild(c);FRESH=false;return;
  }
  var m=cp.m,vw=view(m);
  v.appendChild(heroCard(m,vw));
  var cs=cautions();if(cs.length){var n=el("div","note");n.setAttribute("role","note");n.appendChild(ic("info"));var tt=el("div");cs.forEach(function(x){tt.appendChild(el("p",null,x));});n.appendChild(tt);v.appendChild(n);}
  var wc=el("article","card why"),wi=el("span","why-ic");wi.appendChild(ic("shield"));var wt=el("div");wt.appendChild(el("h3",null,"Why this plate"));var r=reason();if(r)wt.appendChild(el("p","lead",r));
  wt.appendChild(el("p",null,m.why));portionNotes(m,vw).forEach(function(x){wt.appendChild(el("p",null,x));});add(wc,wi,wt);v.appendChild(wc);
  if(t.list.length>1){var h=el("div","sec-h");h.appendChild(el("h3",null,"Also good for "+mealName(S.meal).toLowerCase()));h.appendChild(el("p","cap",t.all.length+" fit"));v.appendChild(h);
    var wrap=el("div","alts");t.list.forEach(function(x,i){if(i===sel)return;var xv=view(x),nu=nutPlate(xv.items),b=el("button","alt");b.type="button";b.id="alt-"+i;
      var tx=el("span");tx.appendChild(el("b",null,x.n));tx.appendChild(el("small",null,summary(xv.items)+" · ≈ "+nu.p+" g protein"));
      add(b,thali(xv.items,56,"Plate"),tx,ic("chev"));
      b.addEventListener("click",function(){sel=i;ADJ=false;FRESH=true;resetTune();render();if(LAYOUT==="phone")$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});});wrap.appendChild(b);});
    v.appendChild(wrap);}
  if(t.all.length>3){var mb=btn("linkbtn morebtn","Show three more plates","refresh","more");mb.addEventListener("click",function(){page++;sel=0;FRESH=true;resetTune();render();});v.appendChild(mb);}
  var fw=el("div","colophon");fw.appendChild(stamp());fw.appendChild(sprig("colo-sprig"));v.appendChild(fw);
  v.appendChild(el("p","fine","Plates come from your coach's list: demonstration meals, not yet approved by your coach. Numbers are rough estimates from household measures; oil and katori size change them. General food guidance, not medical advice."));
  FRESH=false;
}

/* ---------- 02 Plate Lab: the plate, its curve, and what habits do to it ---------- */
var BUILD=null,PRESET="everyday";
function bfoods(){
  var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,soya=M.leave.indexOf("soya")<0,wheat=M.leave.indexOf("wheat")<0;
  var out=[["sabzi","Sabzi","Any cooked vegetable","katori",.5,3,"veg",[90,2.5,10,4],1],["salad","Salad","Cucumber, tomato, onion","bowl",.5,2,"veg",[30,1.2,6,2.4],1.2],
    ["dal","Dal or sambar","","katori",.5,2,"pro",[130,7,20,5],1],["beans","Rajma, chole or sprouts","","katori",.5,2,"pro",[160,8,24,7],1]];
  if(dairy||soya)out.push(["paneer",dairy?"Paneer dish":"Tofu dish",dairy?"Bhurji, palak paneer, tikka":"Bhurji or sabzi","katori",.5,1.5,"pro",dairy?[220,12,8,2]:[180,14,7,2.5],1]);
  if(dairy)out.push(["curd","Curd or raita","","katori",.5,1.5,"pro",[90,5,7,0],1]);
  if(M.diet==="egg"||M.diet==="nonveg")out.push(["egg","Eggs","Boiled, bhurji or curry","eggs",1,4,"pro",[85,6,.5,0],.45]);
  if(M.diet==="nonveg")out.push(["meat","Chicken or fish curry","3 to 4 pieces a katori","katori",.5,1.5,"pro",[230,22,6,1],1]);
  out.push(wheat?["roti","Phulka or roti","Without ghee","",1,5,"grain",[80,2.7,16,2.3],.55]:["roti","Millet roti","Bajra, jowar or ragi","",1,5,"grain",[100,3,20,3],.55]);
  out.push(["rice","Rice","Cooked","katori",.5,2,"grain",[190,4,42,.6],1]);
  return out.map(function(a){return {k:a[0],name:a[1],sub:a[2],u:a[3],step:a[4],max:a[5],g:a[6],n4:a[7],vol:a[8]};});
}
function presetFor(p){
  var s=M.region==="s",egg=M.diet==="egg",nv=M.diet==="nonveg",dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,soya=M.leave.indexOf("soya")<0;
  var b={sabzi:1.5,salad:1,dal:1,beans:0,paneer:0,curd:0,egg:0,meat:0,roti:s?0:2,rice:s?1:0};
  if(p==="light"){b.roti=s?0:1;b.rice=s?.5:0;}
  if(p==="protein"){b.sabzi=1;if(nv)b.meat=1;else if(egg)b.egg=2;else if(dairy||soya)b.paneer=.5;else b.beans=1;if(dairy)b.curd=.5;}
  if(p==="everyday"&&dairy)b.curd=.5;
  return b;
}
function buildText(){return bfoods().filter(function(f){return (BUILD[f.k]||0)>0;}).map(function(f){var n=BUILD[f.k];return f.u==="katori"||f.u==="bowl"?numTxt(n)+" "+(n>1&&f.u==="bowl"?"bowls":f.u)+" "+f.name.toLowerCase():f.u==="eggs"?n+(n>1?" eggs":" egg"):n+" "+f.name.toLowerCase();});}
function labData(){
  var cp=LABSRC==="plate"&&!blocked()?curPlate():{m:null};
  if(cp.m){var vw=view(cp.m),sh=shares(vw.items),gv=0;vw.items.forEach(function(it){var g=groupOf(it);if(g==="grain")gv+=volOf(it);else if(g==="mix")gv+=volOf(it)*.6;});
    return {src:"plate",name:cp.m.n,items:vw.items,nu:nutPlate(vw.items),sh:sh,gu:gv/1.05,pros:vw.items.filter(function(i){return groupOf(i)==="pro";}).map(function(i){return shortOf(i);})};}
  if(!BUILD)BUILD=presetFor(PRESET);
  var foods=bfoods(),acc={veg:0,pro:0,grain:0},k=0,p=0,c=0,f=0,pros=[];
  foods.forEach(function(x){if(BUILD[x.k]==null)BUILD[x.k]=0;var n=BUILD[x.k];if(!n)return;acc[x.g]+=n*x.vol;k+=n*x.n4[0];p+=n*x.n4[1];c+=n*x.n4[2];f+=n*x.n4[3];if(x.g==="pro")pros.push(x.name.split(" ")[0].toLowerCase());});
  var tot=acc.veg+acc.pro+acc.grain;
  return {src:"build",name:"My plate",foods:foods,nu:{k:Math.round(k/10)*10,p:Math.round(p),c:Math.round(c),f:Math.round(f),rk:k},sh:tot?{veg:acc.veg/tot,pro:acc.pro/tot,grain:acc.grain/tot,side:0,t:tot}:{veg:0,pro:0,grain:0,side:0,t:0},gu:(BUILD.roti||0)/2+(BUILD.rice||0),pros:pros};
}
var HABS=[["veg","Sabzi and salad first","Bigger effect"],["walk","Walk 10 min after","Bigger effect"],["lemon","Lemon or vinegar on salad","Small effect"]];
function instrument(key,rs,label){
  var box=el("div","inst"),h=el("div","inst-h");h.appendChild(liveTag(label||"After-meal curve · model"));
  var rv=el("span","risev "+bandCls(rs.band));rv.appendChild(document.createTextNode("Rise "));rv.appendChild(tw(key+"-rise",rs.idx));rv.appendChild(document.createTextNode(" · "+rs.band));h.appendChild(rv);
  add(box,h,curve(key,rs));
  var lg=el("div","inst-lg");var a=el("span");a.appendChild(el("i","l-act"));a.appendChild(document.createTextNode("With your habits"));var b=el("span");b.appendChild(el("i","l-raw"));b.appendChild(document.createTextNode("Same plate, no habits"));add(lg,a,b);box.appendChild(lg);
  return box;
}
function renderLab(){
  var v=$("v-lab");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  var D=labData(),rs=riseOf(D.nu,HAB);
  panelHead(v,"02 · Plate lab","See what this plate does",liveTag("Moves as you tap"));
  var seg=el("div","presets");seg.style.gridTemplateColumns="1fr 1fr";seg.setAttribute("role","radiogroup");seg.setAttribute("aria-label","Which plate");
  [["plate","Today's plate"],["build","Build my own"]].forEach(function(x){var b=el("button","preset",x[1]);b.type="button";b.id="lab-"+x[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",D.src===x[0]?"true":"false");
    b.addEventListener("click",function(){LABSRC=x[0];render();});seg.appendChild(b);});
  v.appendChild(seg);
  var grid=el("div","labgrid"),left=el("div","labcol"),right=el("div","labcol");
  var inst=instrument("lab",rs),hb=el("div","habits");
  HABS.forEach(function(x){var b=el("button","hab");b.type="button";b.id="hab-"+x[0];setPressed(b,HAB[x[0]]);b.appendChild(el("span",null,x[1]));b.appendChild(el("small",null,HAB[x[0]]?"On":x[2]));
    b.addEventListener("click",function(){HAB[x[0]]=!HAB[x[0]];render();});hb.appendChild(b);});
  inst.appendChild(hb);left.appendChild(inst);
  var say=el("p","tip");say.appendChild(el("b",null,rs.band+" rise. "));
  say.appendChild(document.createTextNode(rs.idx<rs.raw?"Your habits take it from "+rs.raw+" to "+rs.idx+" on this model.":rs.band==="Gentle"?"This plate is already easy on sugar. Habits keep it that way.":"Turn on a habit, or tap Gentler on sugar on the plate, and watch it drop."));left.appendChild(say);
  if(M.health==="diabetes"){var dn=el("div","note");dn.appendChild(ic("info"));dn.appendChild(el("p",null,"With diabetes, your meter and your doctor decide. This curve only shows direction."));left.appendChild(dn);}
  var pc=el("div","card bigplate");pc.appendChild(aring("lab",D.sh,D.nu.p+"g","protein",false,"Plate shares: "+Math.round(D.sh.veg*100)+" percent vegetables, about "+D.nu.p+" grams protein"));
  var lg=el("div","legend");
  function row(color,label,val){var d=el("div"),i=el("i");i.style.background=color;add(d,i,el("span",null,label),el("em",null,val));return d;}
  add(lg,row("var(--veg)","Vegetables",Math.round(D.sh.veg*100)+"%"),row("var(--pro)","Protein foods",Math.round(D.sh.pro*100)+"%"),row("var(--grain)","Grain",Math.round(D.sh.grain*100)+"%"));
  var nums=el("div","nums");[["Energy",D.nu.k,"kcal","lab-k"],["Carbs",D.nu.c,"g","lab-c"],["Fibre",D.nu.f,"g","lab-f"]].forEach(function(x){var d=el("div");d.appendChild(el("p","cap",x[0]));var s=el("span","v");s.appendChild(tw(x[3],x[1]));s.appendChild(el("small",null,x[2]));d.appendChild(s);nums.appendChild(d);});
  pc.appendChild(lg);pc.appendChild(nums);right.appendChild(pc);
  if(D.src==="build"){
    var pr=el("div","presets");pr.setAttribute("role","radiogroup");pr.setAttribute("aria-label","Start from");
    [["everyday","Everyday thali"],["light","Lighter"],["protein","Protein first"]].forEach(function(p){var b=el("button","preset",p[1]);b.type="button";b.id="preset-"+p[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",PRESET===p[0]?"true":"false");
      b.addEventListener("click",function(){PRESET=p[0];BUILD=presetFor(p[0]);render();});pr.appendChild(b);});
    right.appendChild(pr);
    var sc=el("div","card steppers");
    D.foods.forEach(function(f){var r=el("div","stp"),i=el("i");i.style.background=f.g==="veg"?"var(--veg)":f.g==="pro"?"var(--pro)":"var(--grain)";
      var t=el("div");t.appendChild(el("b",null,f.name));if(f.sub)t.appendChild(el("small",null,f.sub));
      var c=el("div","ctr"),n=BUILD[f.k]||0;
      var mi=el("button");mi.type="button";mi.id="minus-"+f.k;mi.setAttribute("aria-label","Less "+f.name);mi.appendChild(ic("minus"));mi.disabled=n<=0;
      var o=el("output");o.id="out-"+f.k;o.appendChild(document.createTextNode(n?numTxt(n):"0"));o.appendChild(el("small",null,f.u==="eggs"?(n===1?"egg":"eggs"):f.u==="bowl"?(n>1?"bowls":"bowl"):f.u||(f.name==="Millet roti"?"roti":"phulka")));
      var pl=el("button");pl.type="button";pl.id="plus-"+f.k;pl.setAttribute("aria-label","More "+f.name);pl.appendChild(ic("plus"));pl.disabled=n>=f.max;
      mi.addEventListener("click",function(){BUILD[f.k]=Math.max(0,Math.round((n-f.step)*2)/2);PRESET="";render();});
      pl.addEventListener("click",function(){BUILD[f.k]=Math.min(f.max,Math.round((n+f.step)*2)/2);PRESET="";render();});
      add(c,mi,o,pl);add(r,i,t,c);sc.appendChild(r);});
    right.appendChild(sc);
  }else{var mc=el("div","card");mc.appendChild(el("p","cap",D.name));mc.appendChild(measuresList(D.items));right.appendChild(mc);}
  var ck=el("div","card"),hh=el("h3","card-t","Coach's plate check");ck.appendChild(hh);var ul=el("ul","checks");
  function li(ok,strong,rest){var l=el("li",ok?"ok":"no"),i=el("i");i.appendChild(ic(ok?"check":"alert"));var t=el("span");t.appendChild(el("b",null,strong));if(rest)t.appendChild(document.createTextNode(" "+rest));add(l,i,t);ul.appendChild(l);}
  if(!D.sh.t)li(false,"The plate is empty.","Add sabzi, a protein and some grain.");
  else{
    if(D.sh.veg>=.42)li(true,"About half the plate is vegetables.","A good base for any goal.");else li(false,"Vegetables are "+(D.sh.veg<.12?"missing.":"under half the plate."),"Add sabzi or salad until they fill about half.");
    var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,eggOk=M.diet==="egg"||M.diet==="nonveg";
    if(D.nu.p>=12)li(true,"A clear protein: ≈ "+D.nu.p+" g.",D.pros.length?"From "+D.pros.slice(0,3).join(", ")+".":"");else li(false,"Protein is low: ≈ "+D.nu.p+" g.","Add a katori of dal"+(dairy?", curd":"")+(eggOk?" or 2 eggs":"")+".");
    var lim=S.goal==="lose"?1:S.goal==="steady"?1.5:2,limTxt=S.goal==="lose"?"2 phulka or 1 katori rice":S.goal==="steady"?"3 phulka or 1½ katori rice":"4 phulka or 2 katori rice";if(S.mode==="trek")lim+=.5;
    if(M.health==="diabetes"&&D.gu<.05)li(false,"No grain on the plate.","With diabetes, keep some grain. Don't skip it if you take medication.");
    else if(D.gu>lim+.06)li(false,"More grain than your goal needs.","For "+lab("goal",S.goal).toLowerCase()+", keep it to about "+limTxt+".");
    else li(true,D.gu>.05?"Grain is within your goal.":"No grain, a light plate.",D.gu>.05?"Up to "+limTxt+(S.mode==="trek"?", a little more on a trek day":"")+".":"");
  }
  ck.appendChild(ul);left.appendChild(ck);
  add(grid,left,right);v.appendChild(grid);
  if(D.src==="build"&&D.sh.t){var parts=buildText(),txt="*My "+mealName(S.meal).toLowerCase()+" plate*\n"+parts.map(function(x){return "- "+x;}).join("\n")+"\n(About "+D.nu.p+" g protein, "+D.nu.k+" kcal, rough estimate)";
    var acts=el("div","choice-row");acts.style.gridTemplateColumns="1fr 1fr";var wa=waLink(txt);wa.className="btn";wa.id="lab-wa";
    var ak=btn("btn primary","Ask about it","chat","lab-ask");ak.addEventListener("click",function(){if(LAYOUT==="phone")show("ask");var a=$("askin");a.value="Check my "+mealName(S.meal).toLowerCase()+" plate: "+parts.join(", ")+". Is it right for my goal?";setTimeout(function(){a.focus();},60);});
    add(acts,wa,ak);v.appendChild(acts);}
  v.appendChild(el("p","fine","The curve is a model of direction, not your blood sugar. Carbs lift it; fibre, protein and fat slow it; eating vegetables first and a short walk lower it. Plate rules and numbers are drafts awaiting your coach."));
}

/* ---------- 03 Rescue: eating it anyway, made better ---------- */
var WALK={id:"walk",t:"Walk 10 to 15 minutes after",d:[0,0,0,0],hab:"walk"};
var RDATA=[
 {id:"biryani-c",name:"Chicken biryani",serve:"1 full plate, about 3 katori",d:"nonveg",base:[750,32,95,4],moves:[{id:"first",t:"Start with a katori of raita or kachumber",d:[70,3,6,1.5],hab:"veg"},{id:"pack",t:"Keep 2 katori of rice and all the chicken. Pack the rest",d:[-210,-2,-32,-1]},WALK]},
 {id:"biryani-v",name:"Veg biryani",serve:"1 full plate, about 3 katori",d:"vegan",base:[650,14,100,6],moves:[{id:"first",t:"Start with a katori of kachumber or raita",d:[60,2,6,2],hab:"veg"},{id:"pack",t:"Keep 2 katori of rice. Pack the rest",d:[-215,-4,-33,-2]},{id:"dal",t:"Add a katori of dal or chana beside it",d:[130,7,20,5]},WALK]},
 {id:"chole",name:"Chole bhature",serve:"2 bhature with chole",d:"vegan",wheat:1,base:[850,22,105,14],moves:[{id:"one",t:"1 bhatura, not 2. Finish the chole",d:[-230,-4,-28,-1]},{id:"first",t:"Ask for onion and cucumber salad. Eat it first",d:[25,1,5,2],hab:"veg"},WALK]},
 {id:"butter-c",name:"Butter chicken, naan",serve:"1 katori gravy, 2 butter naan",d:"nonveg",dairy:1,wheat:1,base:[1050,45,100,5],moves:[{id:"roti",t:"1 tandoori roti in place of 2 butter naan",d:[-380,-6,-50,1]},{id:"pieces",t:"Take the pieces, leave half the gravy",d:[-150,-2,-4,0]},{id:"first",t:"Green salad first",d:[25,1,5,2],hab:"veg"},WALK]},
 {id:"pbm",name:"Paneer butter masala, naan",serve:"1 katori gravy, 2 butter naan",d:"veg",dairy:1,wheat:1,base:[1000,28,100,6],moves:[{id:"roti",t:"1 tandoori roti in place of 2 butter naan",d:[-380,-6,-50,1]},{id:"pieces",t:"Take the paneer, leave half the gravy",d:[-140,-2,-4,0]},{id:"first",t:"Green salad first",d:[25,1,5,2],hab:"veg"},WALK]},
 {id:"dosa",name:"Masala dosa",serve:"1 dosa, sambar, chutney",d:"vegan",base:[480,11,70,6],moves:[{id:"plain",t:"Plain dosa, and eat half the potato",d:[-110,-1,-18,-1]},{id:"sambar",t:"Ask for extra sambar. Have it first",d:[60,3,9,2.5],hab:"veg"},{id:"chutney",t:"One tablespoon of coconut chutney, not the bowl",d:[-60,0,-1,-1]}]},
 {id:"pizza",name:"Pizza",serve:"3 slices of a medium",d:"veg",dairy:1,wheat:1,base:[720,28,90,6],moves:[{id:"two",t:"2 slices, thin crust",d:[-300,-10,-40,-2]},{id:"first",t:"Order a salad or clear soup. Have it first",d:[60,3,9,3],hab:"veg"},WALK]},
 {id:"samosa",name:"Samosa and chai",serve:"2 samosa, sweet chai",d:"veg",dairy:1,wheat:1,base:[600,10,80,5],moves:[{id:"one",t:"1 samosa, not 2",d:[-260,-4,-30,-2]},{id:"sugar",t:"Chai with half the sugar",d:[-30,0,-8,0]},{id:"chana",t:"Add a fistful of roasted chana",d:[110,6,17,5]}]},
 {id:"pav",name:"Pav bhaji",serve:"2 buttered pav with bhaji",d:"veg",dairy:1,wheat:1,base:[700,15,95,10],moves:[{id:"one",t:"1 pav, more bhaji",d:[-120,-3,-22,-1]},{id:"butter",t:"No butter on top",d:[-90,0,0,0]},{id:"first",t:"Salad with lemon first",d:[25,1,5,2],hab:"veg"}]},
 {id:"buffet",name:"Wedding buffet",serve:"A typical full plate with one sweet",d:"veg",jain:1,dairy:1,wheat:1,base:[1150,28,145,10],moves:[{id:"half",t:"Fill half the plate with salad and dry sabzi first",d:[-200,2,-30,5],hab:"veg"},{id:"either",t:"Roti or rice, not both",d:[-180,-4,-36,-1]},{id:"tandoor",t:"Tandoori starter, skip the fried one",d:[-120,6,-10,0]},{id:"sweet",t:"Share the sweet",d:[-100,-1,-15,0],sweet:1}]},
 {id:"jamun",name:"Gulab jamun",serve:"2 pieces",d:"veg",jain:1,dairy:1,wheat:1,sweet:1,base:[300,4,50,.5],moves:[{id:"after",t:"Have it right after a meal, never on its own",d:[0,0,0,0],hab:"veg"},{id:"one",t:"1 piece, syrup squeezed out",d:[-170,-2,-30,0]},WALK]},
 {id:"noodles",name:"Instant noodles",serve:"1 pack",d:"vegan",wheat:1,base:[380,8,52,2],moves:[{id:"veg",t:"Cook it with a katori of mixed vegetables",d:[50,2,8,3]},{id:"pro",t:"",d:[0,0,0,0],pro:1},{id:"salt",t:"Use half the masala sachet: less salt",d:[0,0,0,0]}]}
];
function rescueList(){
  return RDATA.filter(function(x){
    if(DIETOK[M.diet].indexOf(x.d)<0)return false;if(M.diet==="jain"&&!x.jain)return false;
    if(x.dairy&&(M.diet==="vegan"||M.leave.indexOf("dairy")>=0))return false;if(x.wheat&&M.leave.indexOf("wheat")>=0)return false;
    if(x.sweet&&M.health==="diabetes")return false;
    if(M.diet==="nonveg"&&(x.id==="biryani-v"||x.id==="pbm"))return false;
    return true;});
}
function movesOf(x){
  var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,egg=M.diet==="egg"||M.diet==="nonveg",soya=M.leave.indexOf("soya")<0;
  return x.moves.map(function(mv){
    if(mv.pro){if(egg)return {id:mv.id,t:"Add 2 boiled eggs",d:[150,12,1,0]};if(dairy)return {id:mv.id,t:"Add half a katori of paneer cubes",d:[145,9,2,0]};if(soya)return {id:mv.id,t:"Add half a katori of tofu",d:[90,8,2.5,1]};return null;}
    if(mv.sweet&&M.health==="diabetes")return {id:mv.id,t:"Skip the sweet today. That one is for your coach",d:[-200,-3,-30,0]};
    if(mv.id==="first"&&!dairy&&/raita/.test(mv.t))return {id:mv.id,t:"Start with a katori of kachumber",d:[30,1,6,2],hab:"veg"};
    return mv;}).filter(Boolean);
}
function renderRescue(){
  var v=$("v-rescue");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  panelHead(v,"03 · Rescue","Eating it anyway",liveTag("Tap the moves"));
  var list=rescueList();
  if(!list.length){var c=el("div","empty-card");add(c,el("h2",null,"Nothing on this list fits your food rules"),el("p",null,"Tell Ask what you're about to eat and it will plan around it."));v.appendChild(c);return;}
  var cur=null;list.forEach(function(x){if(x.id===RSEL)cur=x;});if(!cur){cur=list[0];RSEL=cur.id;}
  var rail=el("div","rail");rail.setAttribute("role","radiogroup");rail.setAttribute("aria-label","Dish");
  list.forEach(function(x){var b=el("button","sit");b.type="button";b.id="dish-"+x.id;b.setAttribute("role","radio");b.setAttribute("aria-checked",x.id===cur.id?"true":"false");b.appendChild(el("span",null,x.name));
    b.addEventListener("click",function(){RSEL=x.id;render();});rail.appendChild(b);});
  v.appendChild(rail);
  var mv=movesOf(cur),on=RMOVES[cur.id]||(RMOVES[cur.id]={}),a=cur.base.slice(),hab={veg:false,walk:false,lemon:false},n=0;
  mv.forEach(function(x){if(!on[x.id])return;n++;for(var i=0;i<4;i++)a[i]+=x.d[i];if(x.hab)hab[x.hab]=true;});
  var b0={k:cur.base[0],p:cur.base[1],c:cur.base[2],f:cur.base[3],rk:cur.base[0]},b1={k:Math.max(120,a[0]),p:Math.max(2,a[1]),c:Math.max(8,a[2]),f:Math.max(0,a[3]),rk:Math.max(120,a[0])};
  var r0=riseOf(b0,null),r1=riseOf(b1,hab);
  var box=el("div","inst"),hd=el("div","inst-h"),tl=el("div");tl.appendChild(el("b","dish",cur.name));tl.appendChild(el("small","dish-s",cur.serve));hd.appendChild(tl);
  var rv=el("span","risev "+bandCls(r1.band));rv.appendChild(document.createTextNode(r1.band+" rise"));hd.appendChild(rv);box.appendChild(hd);
  var cmp=el("div","cmp");
  function crow(label,v0,v1,unit,id,max,good){var r=el("div","cmp-row"),bars=el("div","cmp-bars"),x0=el("i","b0"),x1=el("i","b1"+(good?"":" warn"));x0.style.width=Math.max(4,Math.round(v0/max*100))+"%";x1.style.width=Math.max(4,Math.round(v1/max*100))+"%";add(bars,x0,x1);
    var val=el("span","val");if(Math.round(v0)!==Math.round(v1))val.appendChild(el("s",null,String(Math.round(v0))));val.appendChild(tw(id,Math.round(v1)));val.appendChild(el("small",null,unit));add(r,el("span","lab",label),bars,val);return r;}
  add(cmp,crow("Energy",b0.k,b1.k," kcal","rs-k",Math.max(b0.k,b1.k),b1.k<=b0.k),crow("Protein",b0.p,b1.p," g","rs-p",Math.max(b0.p,b1.p,40),true),crow("Fibre",b0.f,b1.f," g","rs-f",Math.max(b0.f,b1.f,16),true),crow("Rise",r0.idx,r1.idx,"","rs-r",100,r1.idx<=r0.idx));
  box.appendChild(cmp);box.appendChild(curve("rescue",{idx:r1.idx,raw:r0.idx,tp:r1.tp,band:r1.band}));
  var lg=el("div","inst-lg"),la=el("span");la.appendChild(el("i","l-act"));la.appendChild(document.createTextNode("With your moves"));var lb=el("span");lb.appendChild(el("i","l-raw"));lb.appendChild(document.createTextNode("As served"));add(lg,la,lb);box.appendChild(lg);
  v.appendChild(box);
  var dk=b1.k-b0.k,dp=b1.p-b0.p,bits=[];if(dk<=-40)bits.push("saves about "+Math.round(-dk/10)*10+" kcal");if(dp>=3)bits.push("adds about "+Math.round(dp)+" g protein");if(r1.band!==r0.band)bits.push("takes the rise from "+r0.band.toLowerCase()+" to "+r1.band.toLowerCase());else if(r1.idx<r0.idx-3)bits.push("lowers the rise");
  var say=el("p","tip");say.appendChild(el("b",null,n?n+(n>1?" moves: ":" move: "):"As served. "));say.appendChild(document.createTextNode(n?(bits.length?"this "+bits.join(", ")+".":"a small change, still worth it."):"Tap a move below and watch the numbers change."));v.appendChild(say);
  var ml=el("div","moves");
  mv.forEach(function(x){var b=el("button","move");b.type="button";b.id="move-"+x.id;setPressed(b,!!on[x.id]);var i=el("i");i.appendChild(ic("check"));var t=el("span",null,x.t);
    var bits2=[];if(x.d[0])bits2.push((x.d[0]>0?"+":"−")+Math.abs(x.d[0])+" kcal");if(x.d[1])bits2.push((x.d[1]>0?"+":"−")+Math.abs(x.d[1])+" g protein");if(x.d[3]>0)bits2.push("+"+x.d[3]+" g fibre");if(x.hab)bits2.push("lowers the rise");if(!bits2.length)bits2.push("less salt");
    t.appendChild(el("small",null,bits2.join(" · ")));add(b,i,t);b.addEventListener("click",function(){on[x.id]=!on[x.id];render();});ml.appendChild(b);});
  v.appendChild(ml);
  var chosen=mv.filter(function(x){return on[x.id];}),txt="*Eating out: "+cur.name+"*\n"+(chosen.length?"My moves:\n"+chosen.map(function(x){return "- "+x.t;}).join("\n"):"No changes yet.")+"\n(About "+Math.round(b1.k/10)*10+" kcal, "+Math.round(b1.p)+" g protein after the moves; rough estimate)";
  var acts=el("div","choice-row");acts.style.gridTemplateColumns="1fr 1fr";var wa=waLink(txt);wa.className="btn";wa.id="rescue-wa";
  var ak=btn("btn primary","Ask about it","chat","rescue-ask");ak.addEventListener("click",function(){if(LAYOUT==="phone")show("ask");var q=$("askin");q.value="I'm about to eat "+cur.name.toLowerCase()+". How do I make it fit?";setTimeout(function(){q.focus();},60);});
  add(acts,wa,ak);v.appendChild(acts);
  v.appendChild(el("p","fine","Typical restaurant portions, estimated. Real plates vary a lot, so read these as direction. Drafts awaiting your coach."));
}

/* ---------- 04 Day rhythm ---------- */
function renderRhythm(){
  var v=$("v-rhythm");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  var d=dayTotals(),tg=target(),md=modeOf(S.mode);
  panelHead(v,"04 · Day rhythm",md[1],liveTag("From what you saved"));
  var pc=el("div","card"),ph=el("div","sec-h");ph.appendChild(el("h3","card-t","Protein through the day"));var pt=el("p","cap");pt.appendChild(document.createTextNode("≈ "+d.p+" of "+tg+" g"));ph.appendChild(pt);pc.appendChild(ph);
  var bars=el("div","pbars"),split={breakfast:.25,lunch:.3,snack:.15,dinner:.3};
  MEALS.forEach(function(m){var l=null;d.list.forEach(function(x){if(x.meal===m[0])l=x;});var want=Math.round(tg*split[m[0]]),got=l?l.p||0:0,b=el("div","pbar"),col=el("div","col"),f=el("i");
    f.style.height=Math.min(100,Math.round(got/want*100))+"%";if(got>=want)f.className="full";col.appendChild(f);
    add(b,el("span","mono pv",l?"≈"+got+"g":"–"),col,el("small",null,m[1]),el("small","want","aim "+want+"g"));bars.appendChild(b);});
  pc.appendChild(bars);v.appendChild(pc);
  var rows=[];
  function mealRow(i,tip){var m=MEALS[i],l=null;d.list.forEach(function(x){if(x.meal===m[0])l=x;});
    rows.push({t:hm(m[3]),at:m[3],end:m[4],title:m[1],sub:l?l.name+" · ≈ "+(l.p||0)+" g protein":tip,done:!!l,meal:m[0]});}
  rows.push({t:"Wake",at:6,end:7.5,title:"Water before tea",sub:"One or two glasses. "+(DAYST.water?DAYST.water+" so far today.":"None logged yet."),water:1,done:DAYST.water>0});
  mealRow(0,S.mode==="trek"?"Eat 60 to 90 minutes before you set off. Carry a snack.":"Protein in the first meal steadies the morning.");
  if(S.low==="iron")rows.push({t:"All day",at:10,end:10.2,title:"Tea and coffee an hour from meals",sub:"You're minding iron. Tea with food blocks it.",done:false});
  mealRow(1,S.mode==="desk"?"A lighter grain portion keeps the 3 pm slump away.":"Sabzi and salad first, then the rest.");
  rows.push({t:hm(14),at:14,end:14.6,title:"10-minute walk after lunch",sub:"The same walk that flattens the curve in the Lab.",walk:"lunch",done:!!DAYST.walk.lunch});
  mealRow(2,S.mode==="active"?"Within an hour of training: protein and a fruit.":S.mode==="trek"?"On the trail: small bites every hour, sips every 20 to 30 minutes.":"Something with protein, so dinner stays a dinner.");
  mealRow(3,"Finish two to three hours before bed.");
  rows.push({t:hm(21),at:21,end:21.6,title:"10-minute walk after dinner",sub:"Slow is fine. Then the kitchen is closed.",walk:"dinner",done:!!DAYST.walk.dinner});
  var cur=-1;rows.forEach(function(r,i){if(r.at!==10&&hr>=r.at-.25)cur=i;});
  var tc=el("div","card"),tl=el("div","tl");
  rows.forEach(function(r,i){var row=el("div","tl-row"+(r.done?" done":"")+(i===cur?" now":"")),dot=el("span","tl-dot"),bx=el("div");bx.appendChild(el("b",null,r.title));bx.appendChild(el("span","s",r.sub));
    var act=null;
    if(r.meal){act=btn("mini",r.done?"Change":"Choose",null,"rh-"+r.meal);act.addEventListener("click",function(){S.meal=r.meal;page=0;sel=0;FRESH=true;resetTune();if(LAYOUT==="phone")show("plate");else{render();$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});}});}
    else if(r.walk){act=btn("mini"+(r.done?" on":""),r.done?"Done":"Did it","check","walk-"+r.walk);act.addEventListener("click",function(){DAYST.walk[r.walk]=!DAYST.walk[r.walk];save();render();});}
    else if(r.water){act=btn("mini","Glass","plus","rh-water");act.addEventListener("click",function(){DAYST.water=Math.min(20,DAYST.water+1);save();render();});}
    add(row,el("span","tl-time",r.t),dot,bx,act);tl.appendChild(row);});
  tc.appendChild(tl);v.appendChild(tc);
  var tips={desk:"Stand up each hour, and keep the walk after lunch.",active:"Spread protein across all four meals, not one big dinner.",trek:"More grain is fuel today, not a slip. Salt and water matter as much as food. Turn back if you feel unwell; no plate fixes altitude.",rest:"Lighter plates, same protein. Sleep does the repair."};
  var tp=el("p","tip");tp.appendChild(el("b",null,md[1]+". "));tp.appendChild(document.createTextNode(tips[S.mode]));v.appendChild(tp);
  if(S.low==="b12"||S.low==="cal"){var n=el("div","note");n.appendChild(ic("info"));n.appendChild(el("p",null,"Tablets or injections only as your doctor prescribed. Bring the prescription to your coach and the timing goes on this page."));v.appendChild(n);}
  v.appendChild(el("p","fine","Meal windows and tips are drafts awaiting your coach. The protein target is 1 g per kg of body weight, or 55 g if no weight is set."));
}

/* ---------- navigation ---------- */
PANELS.forEach(function(k){$("tab-"+k).addEventListener("click",function(){if(VIEW===k&&!$("v-"+k).hidden&&LAYOUT==="phone"){$("scroll").scrollTo({top:0,behavior:"smooth"});return;}try{history.replaceState(null,"","#"+k);}catch(e){}show(k);});});
window.addEventListener("hashchange",function(){var h=location.hash.slice(1);if(PANELS.indexOf(h)>=0&&h!==VIEW)show(h);});
var h0=location.hash.slice(1);if(PANELS.indexOf(h0)>=0)VIEW=h0;
show(VIEW);
window.__np={state:function(){return {S:S,M:M,THREAD:THREAD,sel:sel,log:LOG,busy:busy,BUILD:BUILD,VIEW:VIEW,LAYOUT:LAYOUT,TUNE:TUNE,HAB:HAB};},nut:nutPlate,rise:riseOf,shares:shares,prompt:function(t){return buildPrompt(promptState(t||"test",false,null,three().list.map(function(m){return m.n;})));}};

})();
