/* ===== Next Plate v3: Plate, Ask, Check ===== */
(function(){
"use strict";
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
var MEALS=[["breakfast","Breakfast","sunrise"],["lunch","Lunch","sun"],["snack","Snack","cup"],["dinner","Dinner","moon"]];
var SITICON={home:"pan",rush:"bolt",tiffin:"tiffin",out:"store"},GOALICON={lose:"down",steady:"scale",strength:"dumbbell"};
function mealName(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][1];return k;}
function mealIcon(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][2];return "sun";}
var DAY=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
var S={meal:CLOCK,sit:"home",hunger:"2",goal:"steady",low:"none"};
var M={diet:null,health:null,region:"n",leave:[],done:false};
var LOG=[];
try{var raw=JSON.parse(localStorage.getItem("np-peak")||"null");if(raw){
  if(lab("diet",raw.diet))M.diet=raw.diet;if(lab("health",raw.health))M.health=raw.health;if(lab("region",raw.region))M.region=raw.region;
  if(Array.isArray(raw.leave))M.leave=raw.leave.filter(function(k){return !!lab("leave",k);});
  M.done=!!raw.done&&!!M.diet&&!!M.health;
  if(lab("goal",raw.goal))S.goal=raw.goal;if(lab("low",raw.low))S.low=raw.low;
  if(Array.isArray(raw.log))LOG=raw.log.filter(function(l){return l&&l.day===DAY&&typeof l.name==="string";}).slice(-4);
}}catch(e){}
function save(){try{localStorage.setItem("np-peak",JSON.stringify({diet:M.diet,health:M.health,region:M.region,leave:M.leave,done:M.done,goal:S.goal,low:S.low,log:LOG}));}catch(e){}}
var VIEW="plate",page=0,sel=0,SW={},ADJ=false,GOALOPEN=false,FRESH=true,STEP=0;
function clockText(){var h=now.getHours(),m=now.getMinutes();return ((h%12)||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm");}
function blocked(){return M.done&&(M.health==="kidney"||M.health==="preg");}
function late(){return S.meal==="dinner"&&CLOCK==="dinner"&&hr>=21.5;}

/* ---------- quantities in words ---------- */
function numTxt(n){var w=Math.floor(n+1e-6),fr=Math.round((n-w)*100),g=fr===50?"½":fr===25?"¼":fr===75?"¾":"";return g?(w?w:"")+g:String(Math.round(n*100)/100);}
function plainN(n){return n===.5?"Half":n===.25?"A quarter":String(Math.round(n*100)/100);}
var PLUR={piece:"pieces",slice:"slices",glass:"glasses",bowl:"bowls",plate:"plates",teaspoon:"teaspoons",tablespoon:"tablespoons",fistful:"fistfuls"};
function unitTxt(n,u){if(u==="eggs")return n===1?"egg":"eggs";if(u==="pieces")return n===1?"piece":"pieces";return n>1&&PLUR[u]?PLUR[u]:u;}
function qShow(it){return it.label&&!it.delta?it.label.replace(" or ","–"):numTxt(it.n);}
function lineText(it){var u=unitTxt(it.n,it.u);return (it.label&&!it.delta?it.label:plainN(it.n))+(u?" "+u:"")+" "+it.t;}
function shortOf(it){return it.short||it.t.split(/,| with | or | in | as /)[0];}
function summary(items){return items.filter(function(i){return !(i.n<=.5&&i.u===""&&!i.role)&&groupOf(i)!=="garnish";}).map(function(i){var u=unitTxt(i.n,i.u);return qShow(i)+(u&&u!=="small"?" "+u:"")+" "+shortOf(i);}).join(" · ");}

/* ---------- rough nutrition from household measures (per 150 ml katori, or per piece) ---------- */
var NUT=[
 [/rice mixed with|millet mixed with/,355,11,0,0],[/curd rice/,200,5,0,0],[/khichdi/,180,6.5,0,0],[/biryani/,260,6,0,0],[/pulao|jeera rice|lemon rice/,220,4.5,0,0],
 [/hung curd/,150,12,0,0],[/hummus/,250,11,0,0],[/dal and vegetable soup|dal soup/,80,4,0,0],[/soup/,50,1.5,0,0],[/rasam/,40,1,0,0],[/sambar/,110,5,0,0],[/kadhi/,120,4,0,0],
 [/chilla|cheela/,0,0,100,5],[/palak paneer/,220,10,0,0],[/paneer bhurji/,300,17,0,0],[/paneer tikka/,0,0,55,3.5],[/paneer/,290,18,0,0],
 [/tofu bhurji/,200,16,0,0],[/palak with tofu/,160,10,0,0],[/tofu/,180,15,0,0],[/soya/,170,14,0,0],
 [/rajma|chole|lobia|chana|chickpea/,160,8,110,6],[/sprout/,110,8,0,0],
 [/chicken curry/,230,22,0,0],[/fish curry|jhol/,200,20,0,0],[/tandoori chicken|fish tikka|chicken tikka/,0,0,85,12],[/chicken/,230,22,85,12],[/fish|rohu|katla|surmai|machh/,200,20,85,12],
 [/egg|omelette/,0,0,75,6],
 [/dal|dalma/,130,7,0,0],[/raita/,80,4,0,0],[/curd|dahi|yogurt|chhena/,90,5,0,0],
 [/poha/,180,4.5,0,0],[/upma/,170,5,0,0],[/dalia|broken wheat/,160,5,0,0],[/porridge/,150,5,0,0],[/rice/,190,4,0,0],
 [/makhana/,50,1.2,0,0],[/coconut chutney/,400,4,0,0],[/chutney/,60,2,0,0],
 [/tandoori roti|naan/,0,0,120,3.5],[/bajra|jowar|millet roti|ragi roti/,0,0,100,3],[/phulka|roti|chapati|toast|bread/,0,0,80,2.7],
 [/ragi dosa/,0,0,110,3],[/uttapam/,0,0,160,4],[/dosa/,0,0,120,3],[/idli/,0,0,60,2],[/mudde/,0,0,110,2.5],[/khakhra/,0,0,60,2],[/corn/,0,0,120,4],
 [/almond|walnut/,0,0,7,.25],[/peanut/,0,0,6,.3],
 [/fruit|guava|apple|orange|pear|banana|papaya/,60,1,60,1],
 [/sabzi|poriyal|vegetable|greens|saag|beans|bhindi|lauki|tori|gourd|cabbage|methi|palak|capsicum|torkari|tarkari|chorchori|bhaji/,90,2.5,0,0],
 [/salad|kachumber|cucumber|tomato|carrot|radish|sticks|onion/,25,1,15,.5],
 [/lemon/,0,0,0,0]
];
var UK={katori:1,"small katori":.6,bowl:1.2,"big bowl":1.8,"small bowl":.7,plate:1.6,portion:.8,tablespoon:.1,teaspoon:.04,teaspoons:.04};
function nutOf(it){
  var t=(it.t||"").toLowerCase(),u=(it.u||"").toLowerCase(),n=+it.n||0,g;
  if(!n)return {k:0,p:0};
  if(u==="glass"){g=/milk|porridge/.test(t)?[120,6]:/lassi/.test(t)?[150,6]:/chaas|buttermilk/.test(t)?[40,2]:/juice/.test(t)?[110,1]:/chai|tea|coffee/.test(t)?[70,2]:[40,1.5];return {k:g[0]*n,p:g[1]*n};}
  if(u==="fistful"){g=/chana/.test(t)?[110,6]:/peanut/.test(t)?[145,6.5]:/almond|walnut|nut/.test(t)?[120,4]:/makhana/.test(t)?[40,1]:/sprout/.test(t)?[40,3]:[100,4];return {k:g[0]*n,p:g[1]*n};}
  if(u==="palm-size piece"){g=/chicken/.test(t)?[165,30]:/fish/.test(t)?[160,22]:/paneer/.test(t)?[260,16]:[150,15];return {k:g[0]*n,p:g[1]*n};}
  if(u==="eggs"){g=/bhurji|omelette|curry|fried/.test(t)?[110,6]:[75,6];return {k:g[0]*n,p:g[1]*n};}
  if(u==="slice")return {k:80*n,p:2.5*n};
  for(var i=0;i<NUT.length;i++){var e=NUT[i];if(!e[0].test(t))continue;
    if(/egg|omelette/.test(t)&&e[3]&&!UK[u]){var cooked=/bhurji|omelette|curry/.test(t);return {k:(cooked?110:75)*n,p:6*n};}
    if(UK[u]!=null&&e[1])return {k:e[1]*UK[u]*n,p:e[2]*UK[u]*n};
    if(e[3])return {k:e[3]*n,p:e[4]*n};
    if(e[1])return {k:e[1]*(UK[u]||1)*n,p:e[2]*(UK[u]||1)*n};
    return {k:0,p:0};
  }
  g=groupOf(it);var base=g==="grain"?[180,4]:g==="pro"?[140,7]:g==="veg"?[80,2.5]:[40,1];
  return {k:base[0]*(UK[u]||.6)*n,p:base[1]*(UK[u]||.6)*n};
}
function nutPlate(items){var k=0,p=0;items.forEach(function(it){var x=nutOf(it);k+=x.k;p+=x.p;});return {k:Math.round(k/10)*10,p:Math.round(p)};}

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
  var had=earlier(),eaten=[],names=had.map(function(l){return l.name;}),lt=late();
  had.forEach(function(l){(l.words||[]).forEach(function(w){if(eaten.indexOf(w)<0)eaten.push(w);});});
  return CAT.filter(fits).map(function(m){
    var sc=0;
    if(S.low!=="none"&&m.low.indexOf(S.low)>=0)sc+=4;
    sc+=m.r==="*"?1:m.r===M.region?2:0;
    if(S.goal==="lose"&&m.tags.indexOf("L")>=0)sc+=2;
    if(S.goal==="strength"&&m.tags.indexOf("P")>=0)sc+=2;
    if(lt&&m.tags.indexOf("L")>=0)sc+=2;
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

/* ---------- portions: hunger and goal change the amounts, and say so ---------- */
function stepOf(it){var u=it.u;if(u==="katori"||u==="small katori")return .5;if((u===""||u==="small"||u==="eggs"||u==="pieces")&&it.n===Math.round(it.n))return 1;return 0;}
function view(m){
  if(m.ai)return {items:m.items,changes:[]};
  var sw=SW[m.id]?swapFor(m):null,ch=[];
  var items=m.items.map(function(it,i){var b=sw&&sw.i===i?sw:it;return {n:b.n,u:b.u,t:b.t,role:b.role,short:b.short,label:b.label,swapped:!!(sw&&sw.i===i),delta:0};});
  function first(r){for(var i=0;i<items.length;i++)if(items[i].role===r&&stepOf(items[i]))return items[i];return null;}
  function bump(it,d,why){if(!it)return;var st=stepOf(it),n=it.n+d*st,max=st===1?4:2.5,min=st===1?1:.5;if(!st||n<min||n>max)return;it.n=n;it.delta+=d;ch.push({short:it.short,step:st,d:d,why:why});}
  var G=first("g"),P=first("p"),V=first("v"),diab=M.health==="diabetes";
  if(S.goal==="strength")bump(P,1,"goal");
  if(S.hunger==="1"&&!diab)bump(G,-1,"hunger");
  if(S.hunger==="3"){
    if(S.goal==="lose"||diab){bump(P,1,"hunger");bump(V,1,"hunger");}
    else{bump(G,1,"hunger");bump(P,1,"hunger");}
  }
  return {items:items,changes:ch};
}
function reason(){
  var had=earlier(),w={breakfast:"breakfast",lunch:"lunch",snack:"your snack",dinner:"dinner"}[S.meal];
  if(late())return LATENOTE;
  if(had.length){var l=had[had.length-1];return "You had "+l.name.charAt(0).toLowerCase()+l.name.slice(1)+" for "+mealName(l.meal).toLowerCase()+", so "+w+" leads with something different.";}
  if(S.low!=="none")return "You're minding "+LOWNAME[S.low]+", so plates that lean on it come first.";
  if(S.goal==="lose")return "You're losing weight, so the lighter plates lead.";
  if(S.goal==="strength")return "You're building strength, so the protein-forward plates lead.";
  return "";
}
function portionNotes(m,v){
  var out=[];if(m.ai)return out;
  var by={goal:[],hunger:[]};v.changes.forEach(function(c){by[c.why].push(c);});
  var ph=function(c){return c.d>0?(c.step===1?"one more "+c.short:"half a katori more "+c.short):(c.step===1?"one "+c.short+" less":"half a katori less "+c.short);};
  var join=function(a){return a.length>1?a.slice(0,-1).join(", ")+" and "+a[a.length-1]:a[0];};
  if(by.goal.length)out.push("Building strength, so this plate has "+join(by.goal.map(ph))+".");
  else if(S.goal==="strength")out.push(GOALNOTE.strength);
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

/* ---------- small shared pieces ---------- */
var toastT=0;
function toast(t){var n=$("toast");$("toasttxt").textContent=t;n.hidden=false;n.style.animation="none";void n.offsetWidth;n.style.animation="";clearTimeout(toastT);toastT=setTimeout(function(){n.hidden=true;},2600);$("said").textContent=t;}
function waLink(txt){var a=el("a","mini wa");a.href="https://wa.me/?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";a.appendChild(ic("wa"));a.appendChild(el("span",null,"WhatsApp"));return a;}
function copyBtn(txt,id,onDone){var b=btn("mini","Copy","copy",id);b.addEventListener("click",function(){
  if(onDone)onDone();
  function ok(){toast("Copied. Paste it in WhatsApp.");}
  function fail(){toast("Copying is blocked here. Use the WhatsApp button instead.");}
  try{navigator.clipboard.writeText(txt).then(ok,fail);}catch(e){fail();}});return b;}
function measuresList(items,compact){
  var ul=el("ul","measures");
  items.forEach(function(it){
    var li=el("li"),q=el("span","qty"+(it.delta?" chg":""),qShow(it)),f=el("span","food"),u=unitTxt(it.n,it.u);
    q.style.setProperty("--dot",DOTC[groupOf(it)]||"transparent");
    if(u)f.appendChild(el("b",null,u+" "));f.appendChild(document.createTextNode(it.t));
    if(it.delta)f.appendChild(el("span","tag",it.delta>0?"more":"less"));else if(it.swapped)f.appendChild(el("span","tag","swapped"));
    add(li,q,f);ul.appendChild(li);
  });
  return ul;
}
function setPressed(b,on,attr){b.setAttribute(attr||"aria-pressed",on?"true":"false");return b;}

/* ---------- header and tabs ---------- */
function renderChrome(){
  var setup=!M.done;
  $("myfood").hidden=setup;$("tabs").hidden=setup;
  $("myfoodtxt").textContent=setup?"":lab("diet",M.diet)+" · "+lab("region",M.region)+(M.health!=="none"?" · "+lab("health",M.health):"");
  ["plate","ask","check"].forEach(function(v){var t=$("tab-"+v);if(VIEW===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current");});
  $("composer").hidden=setup||VIEW!=="ask"||blocked();
}
function show(v,noScroll){
  if(!M.done)v="setup";
  if(v!==VIEW){$("toast").hidden=true;clearTimeout(toastT);}
  ["setup","plate","ask","check"].forEach(function(k){$("v-"+k).hidden=k!==v;});
  if(v!=="setup")VIEW=v;
  var n=$("v-"+v);n.classList.remove("enter");void n.offsetWidth;n.classList.add("enter");
  if(!noScroll)$("scroll").scrollTop=0;
  render();
}
function render(){
  var keep=document.activeElement&&document.activeElement.id;
  renderChrome();
  if(!M.done)renderSetup();
  else if(VIEW==="plate")renderPlate();
  else if(VIEW==="ask")renderAsk();
  else renderCheck();
  if(keep&&$(keep)&&$(keep)!==document.activeElement&&keep!=="askin")try{$(keep).focus({preventScroll:true});}catch(e){}
}

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
  else{healthGroup(v,false);var row=el("div","choice-row");row.style.gridTemplateColumns="1fr 2fr";
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
  add(c,el("div","grab"),hd);foodGroups(c,true);healthGroup(c,true);
  c.appendChild(el("p","fine","Kept on this phone only. Plates and answers always follow these."));
  sh.appendChild(c);
}
$("sheet").addEventListener("click",function(e){if(e.target===this)closeSheet();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("sheet").hidden)closeSheet();});
$("myfood").addEventListener("click",openSheet);

/* ---------- Plate ---------- */
function goalBlock(host){
  var g=el("div","goal"),gi=el("span","goal-ic");gi.appendChild(ic(GOALICON[S.goal]));
  var t=el("div","goal-t");t.appendChild(el("p","cap","Goal"));t.appendChild(el("b",null,lab("goal",S.goal)));
  var b=btn("goal-btn",GOALOPEN?"Close":"Change",null,"goal-btn");b.setAttribute("aria-expanded",GOALOPEN?"true":"false");
  b.addEventListener("click",function(){GOALOPEN=!GOALOPEN;render();});
  add(g,gi,t,b);host.appendChild(g);
  if(GOALOPEN){var r=el("div","choice-row");r.setAttribute("role","radiogroup");r.setAttribute("aria-label","Goal");
    OPT.goal.forEach(function(o){var c=btn("choice",o[1],GOALICON[o[0]],"goal-"+o[0]);c.setAttribute("role","radio");c.setAttribute("aria-checked",S.goal===o[0]?"true":"false");
      c.addEventListener("click",function(){S.goal=o[0];GOALOPEN=false;page=0;sel=0;FRESH=true;save();render();toast("Goal: "+o[1]);});r.appendChild(c);});
    host.appendChild(r);}
}
function contextBlock(host){
  var w=el("div","when"),l=el("span");l.appendChild(ic(mealIcon(S.meal)));l.appendChild(el("span",null,(S.meal===CLOCK?"Now · ":"")+mealName(S.meal)+" · "+clockText()));
  var saved=LOG.filter(function(x){return x.day===DAY;}).length;
  add(w,l,el("span","daychip",saved?saved+(saved>1?" meals":" meal")+" saved today":"Nothing saved yet"));host.appendChild(w);
  goalBlock(host);
  var ms=el("div","meals");ms.setAttribute("role","radiogroup");ms.setAttribute("aria-label","Meal");
  MEALS.forEach(function(m){var b=el("button","meal");b.type="button";b.id="meal-"+m[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",S.meal===m[0]?"true":"false");
    b.appendChild(ic(m[2]));b.appendChild(el("span",null,m[1]));if(m[0]===CLOCK){var d=el("i","now");d.setAttribute("aria-label","now");b.appendChild(d);}
    b.addEventListener("click",function(){if(S.meal===m[0])return;S.meal=m[0];page=0;sel=0;ADJ=false;FRESH=true;render();});ms.appendChild(b);});
  host.appendChild(ms);
  var sits=el("div","sits");sits.setAttribute("role","radiogroup");sits.setAttribute("aria-label","Today I'm");
  OPT.sit.forEach(function(o){var b=btn("sit",o[1],SITICON[o[0]],"sit-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",S.sit===o[0]?"true":"false");
    b.addEventListener("click",function(){if(S.sit===o[0])return;S.sit=o[0];page=0;sel=0;FRESH=true;render();});sits.appendChild(b);});
  host.appendChild(sits);
}
function heroCard(m,v){
  var nu=nutPlate(v.items),sh=shares(v.items),card=el("article","plate"+(FRESH?" fresh":""));card.id="plate-card";
  var h=el("div","hero"),top=el("div","hero-top");
  function chip(t,cls,icon){var c=el("span","hchip"+(cls?" "+cls:""));if(icon)c.appendChild(ic(icon));c.appendChild(el("span",null,t));return c;}
  top.appendChild(chip(lab("diet",M.diet),"fit","check"));
  M.leave.forEach(function(k){top.appendChild(chip("No "+lab("leave",k).toLowerCase(),"fit","check"));});
  if(S.goal==="lose"&&m.tags.indexOf("L")>=0)top.appendChild(chip("Light","fit","check"));
  if(S.goal==="strength"&&m.tags.indexOf("P")>=0)top.appendChild(chip("Protein-forward","fit","check"));
  if(S.low!=="none"&&m.low.indexOf(S.low)>=0)top.appendChild(chip("Leans on "+LOWNAME[S.low],"fit","check"));
  top.appendChild(chip(m.min>0?m.min+" min":(S.sit==="out"?"Order it":"Ready"),"time","clock"));
  var main=el("div","hero-main"),txt=el("div");
  main.appendChild(ring(sh,nu.p+"g","protein",true,"Rough plate shares: "+Math.round(sh.veg*100)+" percent vegetables. About "+nu.p+" grams protein."));
  txt.appendChild(el("h2",null,m.n));txt.appendChild(el("p","sub",summary(v.items)));main.appendChild(txt);
  var bal=el("div","bal");
  function stat(label,val,color){var d=el("div"),c=el("p","cap");if(color){var i=el("i");i.style.background=color;c.appendChild(i);}c.appendChild(document.createTextNode(label));add(d,c,el("b",null,val));return d;}
  var grains=v.items.filter(function(i){var g=groupOf(i);return g==="grain"||g==="mix";}).map(function(i){var u=unitTxt(i.n,i.u);return qShow(i)+(u&&u!=="small"?" "+u:"")+" "+shortOf(i);});
  add(bal,stat("Veg",vegWord(sh.veg),"var(--veg)"),stat("Grain",grains.length?grains.join(" + "):"None","var(--grain)"),stat("Energy","≈ "+nu.k+" kcal",null));
  add(h,top,main,bal);card.appendChild(h);
  var sv=el("div","serve"),sh2=el("div","serve-h");
  sh2.appendChild(el("p","cap","What to serve · "+lab("hunger",S.hunger).toLowerCase()+(S.hunger==="2"?" hunger":"")));
  var adj=el("button","linkbtn");adj.type="button";adj.id="adjust";adj.setAttribute("aria-expanded",ADJ?"true":"false");adj.appendChild(ic(ADJ?"x":"sliders"));adj.appendChild(el("span",null,ADJ?"Done":"Adjust"));
  adj.addEventListener("click",function(){ADJ=!ADJ;render();});sh2.appendChild(adj);sv.appendChild(sh2);
  if(ADJ)sv.appendChild(drawer(m));
  sv.appendChild(measuresList(v.items));card.appendChild(sv);
  var acts=el("div","acts");acts.style.gridTemplateColumns="1fr 1.35fr";
  var another=btn("btn","Another plate","refresh","another");another.addEventListener("click",function(){
    var t=three();if(t.all.length<2){toast("This is the only plate that fits right now.");return;}
    sel++;if(sel>=t.list.length){page++;sel=0;}FRESH=true;ADJ=false;render();toast("Next plate for "+mealName(S.meal).toLowerCase());});
  var have=picked(m),hv=btn("btn "+(have?"done":"primary"),have?"Saved for "+mealName(S.meal).toLowerCase():"I'll have this",have?"check":"check","have");
  hv.addEventListener("click",function(){logPick(m,v);render();toast("Saved for "+mealName(S.meal).toLowerCase()+". The next meal will balance it.");});
  add(acts,another,hv);card.appendChild(acts);
  var shr=el("div","share"),txtm=msgText(m,v);shr.appendChild(el("p","cap","Send to coach"));
  var wa=waLink(txtm);wa.id="wa";wa.addEventListener("click",function(){logPick(m,v);setTimeout(render,0);});
  add(shr,wa,copyBtn(txtm,"copy",function(){logPick(m,v);setTimeout(render,0);}));card.appendChild(shr);
  return card;
}
function drawer(m){
  var d=el("div","drawer"),a=el("div");a.appendChild(el("p","cap","Hunger"));
  var hr2=el("div","choice-row");hr2.setAttribute("role","radiogroup");hr2.setAttribute("aria-label","Hunger");
  OPT.hunger.forEach(function(o){var b=btn("choice",o[1],null,"hunger-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",S.hunger===o[0]?"true":"false");
    b.addEventListener("click",function(){S.hunger=o[0];render();});hr2.appendChild(b);});
  a.appendChild(hr2);d.appendChild(a);
  var b2=el("div");b2.appendChild(el("p","cap","Minding"));var lw=el("div","lows");lw.setAttribute("role","radiogroup");lw.setAttribute("aria-label","Running low on");
  OPT.low.forEach(function(o){var b=btn("choice",o[0]==="none"?"Nothing":o[1],null,"low-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",S.low===o[0]?"true":"false");
    b.addEventListener("click",function(){S.low=o[0];page=0;sel=0;FRESH=true;save();render();});lw.appendChild(b);});
  b2.appendChild(lw);d.appendChild(b2);
  var sw=swapFor(m);
  if(sw){var r=el("button","swaprow");r.type="button";r.id="swap";setPressed(r,!!SW[m.id]);
    r.appendChild(el("span",null,"Swap "+shortOf(m.items[sw.i])+" for "+sw.t));r.appendChild(el("span","switch"));
    r.addEventListener("click",function(){SW[m.id]=!SW[m.id];render();});d.appendChild(r);}
  return d;
}
function whyCard(m,v){
  var c=el("article","card why"),i=el("span","why-ic");i.appendChild(ic("shield"));
  var t=el("div");t.appendChild(el("h3",null,"Why this plate"));var r=reason();if(r)t.appendChild(el("p","lead",r));
  t.appendChild(el("p",null,m.why));portionNotes(m,v).forEach(function(x){t.appendChild(el("p",null,x));});
  add(c,i,t);return c;
}
function cautionCard(){var cs=cautions();if(!cs.length)return null;var n=el("div","note");n.setAttribute("role","note");n.appendChild(ic("info"));var t=el("div");cs.forEach(function(x){t.appendChild(el("p",null,x));});n.appendChild(t);return n;}
function altList(list,cur){
  var wrap=el("div","alts");
  list.forEach(function(m,i){if(i===cur)return;var v=view(m),nu=nutPlate(v.items),b=el("button","alt");b.type="button";b.id="alt-"+i;
    var t=el("span");t.appendChild(el("b",null,m.n));t.appendChild(el("small",null,summary(v.items)+" · ≈ "+nu.p+" g protein"));
    add(b,ring(shares(v.items),null,null,false,"Rough plate shares"),t,ic("chev"));
    b.addEventListener("click",function(){sel=i;ADJ=false;FRESH=true;render();$("scroll").scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});wrap.appendChild(b);});
  return wrap;
}
function dayCard(){
  var mine=LOG.filter(function(l){return l.day===DAY;}),pr=0,kc=0;mine.forEach(function(l){pr+=l.p||0;kc+=l.k||0;});
  var w=el("div"),h=el("div","sec-h");h.appendChild(el("h3",null,"Your day"));h.appendChild(el("p","cap",mine.length?"≈ "+pr+" g protein · "+kc+" kcal saved":"Saved plates show here"));
  var g=el("div","day");
  MEALS.forEach(function(m){var l=null;mine.forEach(function(x){if(x.meal===m[0])l=x;});var d=el("div","dslot"+(l?" got":"")+(m[0]===S.meal?" now":""));
    d.appendChild(ic(l?"check":m[2]));d.appendChild(el("b",null,m[1]));d.appendChild(el("span",l?null:"empty",l?l.name:(m[0]===S.meal?"Choosing":"—")));g.appendChild(d);});
  add(w,h,g);return w;
}
function blockedCard(){
  var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("shield"));
  add(c,i,el("h2",null,SAFETY),el("p",null,"Your health setting asks for your coach and doctor to plan meals with you. Nothing here is suggested for now."));
  var b=btn("btn","Change My food",null,"blocked-change");b.addEventListener("click",openSheet);c.appendChild(b);return c;
}
function renderPlate(){
  var v=$("v-plate");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());FRESH=false;return;}
  contextBlock(v);
  var t=three();if(sel>=t.list.length)sel=0;
  if(!t.list.length){
    var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("info"));
    var word={breakfast:"breakfast",lunch:"lunch",snack:"a snack",dinner:"dinner"}[S.meal];
    add(c,i,el("h2",null,"No plate on your coach's list fits this yet"),el("p",null,"Nothing fits "+(M.diet==="jain"?"Jain":lab("diet",M.diet).toLowerCase())+(M.leave.length?", without "+M.leave.map(function(x){return lab("leave",x).toLowerCase();}).join(" or "):"")+", for "+word+" when you're "+lab("sit",S.sit).toLowerCase()+". Your food rules stay as they are."));
    var a=btn("btn primary","Ask for a plate instead","chat","noplate-ask");a.addEventListener("click",function(){show("ask");setTimeout(function(){$("askin").value="Give me a "+mealName(S.meal).toLowerCase()+" plate. I'm "+lab("sit",S.sit).toLowerCase()+".";$("askin").focus();},50);});c.appendChild(a);
    v.appendChild(c);v.appendChild(dayCard());FRESH=false;return;
  }
  var m=t.list[sel],vw=view(m);
  v.appendChild(heroCard(m,vw));
  var cc=cautionCard();if(cc)v.appendChild(cc);
  v.appendChild(whyCard(m,vw));
  if(t.list.length>1){var h=el("div","sec-h");h.appendChild(el("h3",null,"Also good for "+mealName(S.meal).toLowerCase()));h.appendChild(el("p","cap",t.all.length+" fit"));v.appendChild(h);v.appendChild(altList(t.list,sel));}
  if(t.all.length>3){var mb=btn("linkbtn morebtn","Show three more plates","refresh","more");mb.addEventListener("click",function(){page++;sel=0;FRESH=true;render();$("scroll").scrollTop=0;});v.appendChild(mb);}
  v.appendChild(dayCard());
  v.appendChild(el("p","fine","Plates come from your coach's list: demonstration meals, not yet approved by your coach. The ring and numbers are rough estimates from household measures; oil and katori size change them. General food guidance, not medical advice."));
  FRESH=false;
}

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
},function(){sampleFn=null;}).then(function(){$("cambtn").hidden=!canImg;if(VIEW==="ask")render();});
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
var rq=0;function soon(){if(rq)return;rq=requestAnimationFrame(function(){rq=0;if(VIEW==="ask")renderThread();});}
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
function scrollEnd(){var s=$("scroll");requestAnimationFrame(function(){s.scrollTop=s.scrollHeight;});}
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
  var v=$("v-ask");v.textContent="";
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

/* ---------- Check my plate ---------- */
var BUILD=null,PRESET="everyday";
function bfoods(){
  var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,soya=M.leave.indexOf("soya")<0,wheat=M.leave.indexOf("wheat")<0;
  var out=[["sabzi","Sabzi","Any cooked vegetable","katori",.5,3,"veg",90,2.5,1],["salad","Salad","Cucumber, tomato, onion","bowl",.5,2,"veg",30,1.2,1.2],
    ["dal","Dal or sambar","","katori",.5,2,"pro",130,7,1],["beans","Rajma, chole or sprouts","","katori",.5,2,"pro",160,8,1]];
  if(dairy||soya)out.push(["paneer",dairy?"Paneer dish":"Tofu dish",dairy?"Bhurji, palak paneer, tikka":"Bhurji or sabzi","katori",.5,1.5,"pro",220,12,1]);
  if(dairy)out.push(["curd","Curd or raita","","katori",.5,1.5,"pro",90,5,1]);
  if(M.diet==="egg"||M.diet==="nonveg")out.push(["egg","Eggs","Boiled, bhurji or curry","eggs",1,4,"pro",85,6,.45]);
  if(M.diet==="nonveg")out.push(["meat","Chicken or fish curry","3 to 4 pieces a katori","katori",.5,1.5,"pro",230,22,1]);
  out.push(wheat?["roti","Phulka or roti","Without ghee","",1,5,"grain",80,2.7,.55]:["roti","Millet roti","Bajra, jowar or ragi","",1,5,"grain",100,3,.55]);
  out.push(["rice","Rice","Cooked","katori",.5,2,"grain",190,4,1]);
  return out.map(function(a){return {k:a[0],name:a[1],sub:a[2],u:a[3],step:a[4],max:a[5],g:a[6],kc:a[7],pr:a[8],vol:a[9]};});
}
function presetFor(p){
  var s=M.region==="s",egg=M.diet==="egg",nv=M.diet==="nonveg",dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,soya=M.leave.indexOf("soya")<0;
  var b={sabzi:1.5,salad:1,dal:1,beans:0,paneer:0,curd:0,egg:0,meat:0,roti:s?0:2,rice:s?1:0};
  if(p==="light"){b.roti=s?0:1;b.rice=s?.5:0;b.sabzi=1.5;b.salad=1;}
  if(p==="protein"){b.sabzi=1;b.salad=1;if(nv)b.meat=1;else if(egg)b.egg=2;else if(dairy||soya)b.paneer=.5;else b.beans=1;if(dairy)b.curd=.5;}
  if(p==="everyday"&&dairy)b.curd=.5;
  return b;
}
function buildItems(){var out=[];bfoods().forEach(function(f){var n=BUILD[f.k]||0;if(n>0)out.push({f:f,n:n});});return out;}
function buildText(){return buildItems().map(function(x){return x.f.u==="katori"||x.f.u==="bowl"?numTxt(x.n)+" "+(x.n>1&&x.f.u==="bowl"?"bowls":x.f.u)+" "+x.f.name.toLowerCase():x.f.u==="eggs"?x.n+(x.n>1?" eggs":" egg"):x.n+" "+x.f.name.toLowerCase();});}
function renderCheck(){
  var v=$("v-check");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  if(!BUILD)BUILD=presetFor(PRESET);
  var foods=bfoods();foods.forEach(function(f){if(BUILD[f.k]==null)BUILD[f.k]=0;});
  var intro=el("div","sec-h");intro.appendChild(el("h3",null,"Check my plate"));intro.appendChild(el("p","cap",mealName(S.meal)+" · "+lab("goal",S.goal)));v.appendChild(intro);
  var pr=el("div","presets");pr.setAttribute("role","radiogroup");pr.setAttribute("aria-label","Start from");
  [["everyday","Everyday thali"],["light","Lighter"],["protein","Protein first"]].forEach(function(p){var b=el("button","preset",p[1]);b.type="button";b.id="preset-"+p[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",PRESET===p[0]?"true":"false");
    b.addEventListener("click",function(){PRESET=p[0];BUILD=presetFor(p[0]);render();});pr.appendChild(b);});
  v.appendChild(pr);
  var acc={veg:0,pro:0,grain:0},kc=0,pt=0,pros=[];
  foods.forEach(function(f){var n=BUILD[f.k]||0;if(!n)return;acc[f.g]+=n*f.vol;kc+=n*f.kc;pt+=n*f.pr;if(f.g==="pro")pros.push(f.name.split(" ")[0].toLowerCase());});
  var tot=acc.veg+acc.pro+acc.grain,sh=tot?{veg:acc.veg/tot,pro:acc.pro/tot,grain:acc.grain/tot,side:0}:{veg:0,pro:0,grain:0,side:0};
  kc=Math.round(kc/10)*10;pt=Math.round(pt);
  var pc=el("div","card bigplate");pc.appendChild(ring(sh,pt+"g","protein",false,"Your plate: "+Math.round(sh.veg*100)+" percent vegetables, about "+pt+" grams protein"));
  var lg=el("div","legend");
  function row(color,label,val){var d=el("div"),i=el("i");i.style.background=color;add(d,i,el("span",null,label),el("em",null,val));return d;}
  add(lg,row("var(--veg)","Vegetables",Math.round(sh.veg*100)+"%"),row("var(--pro)","Protein",Math.round(sh.pro*100)+"%"),row("var(--grain)","Grain",Math.round(sh.grain*100)+"%"));
  var en=el("p","cap","≈ "+kc+" kcal on this plate");en.style.marginTop="4px";lg.appendChild(en);pc.appendChild(lg);v.appendChild(pc);
  var sc=el("div","card steppers");
  foods.forEach(function(f){var r=el("div","stp"),i=el("i");i.style.background=f.g==="veg"?"var(--veg)":f.g==="pro"?"var(--pro)":"var(--grain)";
    var t=el("div");t.appendChild(el("b",null,f.name));if(f.sub)t.appendChild(el("small",null,f.sub));
    var c=el("div","ctr"),n=BUILD[f.k]||0;
    var mi=el("button");mi.type="button";mi.id="minus-"+f.k;mi.setAttribute("aria-label","Less "+f.name);mi.appendChild(ic("minus"));mi.disabled=n<=0;
    var o=el("output");o.id="out-"+f.k;o.appendChild(document.createTextNode(n?numTxt(n):"0"));o.appendChild(el("small",null,f.u==="eggs"?(n===1?"egg":"eggs"):f.u==="bowl"?(n>1?"bowls":"bowl"):f.u||(f.name==="Millet roti"?"roti":"phulka")));
    var pl=el("button");pl.type="button";pl.id="plus-"+f.k;pl.setAttribute("aria-label","More "+f.name);pl.appendChild(ic("plus"));pl.disabled=n>=f.max;
    mi.addEventListener("click",function(){BUILD[f.k]=Math.max(0,Math.round((n-f.step)*2)/2);PRESET="";render();});
    pl.addEventListener("click",function(){BUILD[f.k]=Math.min(f.max,Math.round((n+f.step)*2)/2);PRESET="";render();});
    add(c,mi,o,pl);add(r,i,t,c);sc.appendChild(r);});
  v.appendChild(sc);
  var ck=el("div","card"),h=el("h3",null,"Coach's plate check");h.style.cssText="margin:0 0 10px;font:700 17px/22px var(--display)";ck.appendChild(h);
  var ul=el("ul","checks");
  function li(ok,strong,rest){var l=el("li",ok?"ok":"no"),i=el("i");i.appendChild(ic(ok?"check":"alert"));var t=el("span");t.appendChild(el("b",null,strong));if(rest)t.appendChild(document.createTextNode(" "+rest));add(l,i,t);ul.appendChild(l);}
  if(!tot){li(false,"The plate is empty.","Add sabzi, a protein and some grain.");}
  else{
    if(sh.veg>=.42)li(true,"About half the plate is vegetables.","Good base for any goal.");else li(false,"Vegetables are "+(sh.veg<.12?"missing.":"under half the plate."),"Add sabzi or salad until they fill about half.");
    var dairy=M.diet!=="vegan"&&M.leave.indexOf("dairy")<0,eggOk=M.diet==="egg"||M.diet==="nonveg";
    if(pt>=12)li(true,"A clear protein: ≈ "+pt+" g.","From "+pros.join(", ")+".");else li(false,"Protein is low: ≈ "+pt+" g.","Add a katori of dal"+(dairy?", curd":"")+(eggOk?" or 2 eggs":"")+".");
    var gu=(BUILD.roti||0)/2+(BUILD.rice||0),lim=S.goal==="lose"?1:S.goal==="steady"?1.5:2,limTxt=S.goal==="lose"?"2 phulka or 1 katori rice":S.goal==="steady"?"3 phulka or 1½ katori rice":"4 phulka or 2 katori rice";
    if(M.health==="diabetes"&&gu===0)li(false,"No grain on the plate.","With diabetes, keep some grain. Don't skip it if you take medication.");
    else if(gu>lim+1e-6)li(false,"More grain than your goal needs.","For "+lab("goal",S.goal).toLowerCase()+", keep it to "+limTxt+".");
    else li(true,gu?"Grain is within your goal.":"No grain, a light plate.",gu?"Up to "+limTxt+" for "+lab("goal",S.goal).toLowerCase()+".":"");
  }
  ck.appendChild(ul);v.appendChild(ck);
  var parts=buildText(),txt="*My "+mealName(S.meal).toLowerCase()+" plate*\n"+parts.map(function(x){return "- "+x;}).join("\n")+"\n(About "+pt+" g protein, "+kc+" kcal, rough estimate)";
  var acts=el("div","choice-row");acts.style.gridTemplateColumns="1fr 1fr";
  var wa=waLink(txt);wa.className="btn";wa.id="check-wa";
  var ak=btn("btn primary","Ask about it","chat","check-ask");ak.addEventListener("click",function(){show("ask");var a=$("askin");a.value="Check my "+mealName(S.meal).toLowerCase()+" plate: "+parts.join(", ")+". Is it right for my goal?";setTimeout(function(){a.focus();},60);});
  add(acts,wa,ak);if(tot)v.appendChild(acts);
  v.appendChild(el("p","fine","Plate rules are drafts, not yet approved by your coach. Shares and numbers are rough estimates from household measures."));
}

/* ---------- navigation ---------- */
["plate","ask","check"].forEach(function(k){$("tab-"+k).addEventListener("click",function(){if(VIEW===k&&!$("v-"+k).hidden){$("scroll").scrollTo({top:0,behavior:"smooth"});return;}try{history.replaceState(null,"","#"+k);}catch(e){}show(k);});});
window.addEventListener("hashchange",function(){var h=location.hash.slice(1);if(["plate","ask","check"].indexOf(h)>=0&&h!==VIEW)show(h);});
var h0=location.hash.slice(1);if(["plate","ask","check"].indexOf(h0)>=0)VIEW=h0;
show(M.done?VIEW:"setup");
window.__np={state:function(){return {S:S,M:M,THREAD:THREAD,sel:sel,log:LOG,busy:busy,BUILD:BUILD,VIEW:VIEW};},nut:nutPlate,shares:shares,prompt:function(t){return buildPrompt(promptState(t||"test",false,null,three().list.map(function(m){return m.n;})));}};
})();
