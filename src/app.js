/* ===== Next Plate ===== */
(function(){
"use strict";
function $(id){return document.getElementById(id);}
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function hash01(a){a=Math.imul(a^0x9E3779B9,2654435761);a^=a>>>15;a=Math.imul(a,2246822519);a^=a>>>13;return ((a>>>0)%100003)/100003;}
var root=document.documentElement;

/* ---------- state ---------- */
var now=new Date(),hr=now.getHours()+now.getMinutes()/60;
var CLOCK=hr<4?"dinner":hr<11?"breakfast":hr<15.5?"lunch":hr<18.5?"snack":"dinner";
var MEALS=[["breakfast","Breakfast"],["lunch","Lunch"],["snack","Snack"],["dinner","Dinner"]];
function mealName(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][1];return k;}
var DAY=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
var S={meal:CLOCK,sit:"home",hunger:"2",goal:"steady",low:"none"};       /* asked each time */
var M={diet:null,health:null,region:"n",leave:[],done:false};             /* My food: asked once */
var LOG=[];                                                               /* plates picked today */
try{var raw=JSON.parse(localStorage.getItem("np-peak")||"null");if(raw){
  if(lab("diet",raw.diet))M.diet=raw.diet;if(lab("health",raw.health))M.health=raw.health;if(lab("region",raw.region))M.region=raw.region;
  if(Array.isArray(raw.leave))M.leave=raw.leave.filter(function(k){return !!lab("leave",k);});
  M.done=!!raw.done&&!!M.diet&&!!M.health;
  if(lab("goal",raw.goal))S.goal=raw.goal;if(lab("low",raw.low))S.low=raw.low;
  if(Array.isArray(raw.log))LOG=raw.log.filter(function(l){return l&&l.day===DAY&&typeof l.name==="string";}).slice(-4);
}}catch(e){}
function save(){try{localStorage.setItem("np-peak",JSON.stringify({diet:M.diet,health:M.health,region:M.region,leave:M.leave,done:M.done,goal:S.goal,low:S.low,log:LOG}));}catch(e){}}
var page=0,sel=0,SW={},ANS=null,openKey=null;
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
function summary(items){return items.filter(function(i){return !(i.n<=.5&&i.u===""&&!i.role);}).map(function(i){var u=unitTxt(i.n,i.u);return qShow(i)+(u&&u!=="small"?" "+u:"")+" "+shortOf(i);}).join(" · ");}

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
    sc-=2*Math.min(2,foodWords(m).filter(function(w){return eaten.indexOf(w)>=0;}).length);   /* don't lead with what they already had today */
    if(names.indexOf(m.n)>=0)sc-=4;
    return {m:m,sc:sc,h:hash01(m.id*7919+DAY)};    /* ties rotate by the day, so tomorrow leads differently */
  }).sort(function(a,b){return b.sc-a.sc||a.h-b.h;}).map(function(x){return x.m;});
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
  if(S.hunger==="1"&&!diab)bump(G,-1,"hunger");                      /* with diabetes the grain is never cut */
  if(S.hunger==="3"){
    if(S.goal==="lose"||diab){bump(P,1,"hunger");bump(V,1,"hunger");} /* more protein and vegetables before grain */
    else{bump(G,1,"hunger");bump(P,1,"hunger");}
  }
  return {items:items,changes:ch};
}
function reason(){
  var had=earlier(),w={breakfast:"breakfast",lunch:"lunch",snack:"your snack",dinner:"dinner"}[S.meal];
  if(late())return LATENOTE;
  if(had.length){var l=had[had.length-1];return "You picked "+l.name.charAt(0).toLowerCase()+l.name.slice(1)+" for "+mealName(l.meal).toLowerCase()+", so "+w+" leads with something different.";}
  if(S.low!=="none")return "You're minding "+LOWNAME[S.low]+", so plates that lean on it come first.";
  if(S.goal==="lose")return "You're losing weight, so the lighter plates lead.";
  if(S.goal==="strength")return "You're building strength, so the protein-forward plates lead.";
  return "";
}
function notesFor(m,v){
  var out=[];
  if(!m.ai){
    var by={goal:[],hunger:[]};v.changes.forEach(function(c){by[c.why].push(c);});
    var ph=function(c){return c.d>0?(c.step===1?"one more "+c.short:"half a katori more "+c.short):(c.step===1?"one "+c.short+" less":"half a katori less "+c.short);};
    var join=function(a){return a.length>1?a.slice(0,-1).join(", ")+" and "+a[a.length-1]:a[0];};
    if(by.goal.length)out.push("Building strength, so this plate has "+join(by.goal.map(ph))+".");
    else if(S.goal==="strength")out.push(GOALNOTE.strength);
    if(S.goal==="lose")out.push(GOALNOTE.lose);
    if(by.hunger.length)out.push((S.hunger==="1"?"A little hungry":"Starving")+", so this plate has "+join(by.hunger.map(ph))+".");
    else if(S.hunger==="1")out.push(M.health==="diabetes"?"A little hungry: keep the grain, and take less of the rest if you need to.":HUNGERFALLBACK["1"]);
    else if(S.hunger==="3")out.push(HUNGERFALLBACK["3"]);
  }
  if(LOWNOTE[S.low])out.push(LOWNOTE[S.low]);
  if(HEALTHNOTE[M.health])out.push(HEALTHNOTE[M.health]);
  return out;
}
function msgText(m,v){
  return "*"+mealName(S.meal)+": "+m.n+"*\n"+v.items.map(function(i){return "- "+lineText(i);}).join("\n")+(m.why?"\n"+m.why:"")+(m.skip?"\nLeave today: "+m.skip:"")+(m.later?"\nNext meal: "+m.later:"");
}
function logPick(m){
  LOG=LOG.filter(function(l){return !(l.day===DAY&&l.meal===S.meal);});
  LOG.push({day:DAY,meal:S.meal,name:m.n,words:foodWords(m)});LOG=LOG.slice(-4);save();
}

/* ---------- meal row ---------- */
MEALS.forEach(function(m){
  var b=el("button",m[0]===CLOCK?"now":null,m[1]);b.type="button";b.id="meal-"+m[0];b.setAttribute("role","radio");
  b.addEventListener("click",function(){setMeal(m[0]);});$("mealrow").appendChild(b);
});
function setMeal(k){
  if(S.meal===k)return;
  var bs=[].slice.call($("mealrow").children),before=bs.map(function(b){return b.getBoundingClientRect().left;});
  S.meal=k;page=0;sel=0;dropAnswer();render(true);
  bs.forEach(function(b,i){var dx=before[i]-b.getBoundingClientRect().left;if(!dx)return;b.style.transition="none";b.style.transform="translateX("+dx+"px)";});
  requestAnimationFrame(function(){requestAnimationFrame(function(){bs.forEach(function(b){b.style.transition="";b.style.transform="";});});});
}

/* ---------- the four choices ---------- */
var CELLS={};
["sit","hunger","goal","low"].forEach(function(k){
  var b=el("button","cell");b.type="button";b.id="cell-"+k;b.setAttribute("aria-haspopup","true");
  var s=el("span");s.appendChild(el("span","cap",LAB[k]));s.appendChild(el("b"));b.appendChild(s);b.appendChild(el("span","chev"));
  b.addEventListener("click",function(){openTray(k);});$("choices").appendChild(b);CELLS[k]=b;
});
function optButtons(host,k,isOn,set,multi){
  host.textContent="";host.className="optg"+(OPT[k].length===4?" two":"");
  OPT[k].forEach(function(o){var b=el("button","opt-btn",o[1]);b.type="button";b.setAttribute("role",multi?"checkbox":"radio");b.setAttribute("data-v",o[0]);b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    b.addEventListener("click",function(){set(o[0]);});host.appendChild(b);});
}
function openTray(k){
  openKey=k;$("traylab").textContent=LAB[k];
  optButtons($("opts"),k,function(v){return S[k]===v;},function(v){S[k]=v;page=0;sel=0;closeTray();dropAnswer();save();render(true);});
  $("choices").hidden=true;$("tray").hidden=false;
  var cur=$("opts").querySelector('[aria-checked="true"]');if(cur)cur.focus();
}
function closeTray(){if(!openKey)return;var k=openKey;openKey=null;$("tray").hidden=true;$("choices").hidden=false;if(CELLS[k])CELLS[k].focus();}
$("trayclose").addEventListener("click",closeTray);

/* ---------- My food ---------- */
function group(k,multi,onPick){
  var w=el("div");w.appendChild(el("p","cap",LAB[k]));var g=el("div");g.id="p-"+k;g.setAttribute("aria-label",LAB[k]);g.setAttribute("role",multi?"group":"radiogroup");
  optButtons(g,k,function(v){return multi?M.leave.indexOf(v)>=0:M[k]===v;},onPick,multi);w.appendChild(g);return w;
}
function buildPanel(){
  var p=$("mypanel");p.textContent="";
  var redo=function(){page=0;sel=0;dropAnswer();save();buildPanel();render(true);};
  ["diet","health","region"].forEach(function(k){p.appendChild(group(k,false,function(v){M[k]=v;redo();}));});
  p.appendChild(group("leave",true,function(v){var i=M.leave.indexOf(v);if(i>=0)M.leave.splice(i,1);else M.leave.push(v);redo();}));
  var d=el("button","done","Done");d.type="button";d.id="mydone";
  d.addEventListener("click",function(){p.hidden=true;$("my").setAttribute("aria-expanded","false");});p.appendChild(d);
}
$("my").addEventListener("click",function(){if(!M.done)return;var p=$("mypanel"),open=p.hidden;if(open)buildPanel();p.hidden=!open;this.setAttribute("aria-expanded",open?"true":"false");});
function buildSetup(){
  var s=$("setup"),k=M.diet?"health":"diet";s.textContent="";
  s.appendChild(group(k,false,function(v){M[k]=v;if(k==="health"){M.done=true;}save();render(true);}));
  s.appendChild(el("p","fine","Asked once and kept on this phone. You can change it later at the top right."));
}

/* ---------- asking Next Plate (Claude). Rails run before the call and again on everything that comes back. ---------- */
var sampleFn=null,canImg=false,ctl=null,busy=false,aiN=0;
var HOSTED=!!window.NP_HOSTED,NOPHOTO=!!window.NP_NOPHOTO,KEY="";
if(NOPHOTO){$("privacy").textContent="Asking is answered by Google Gemini. Don't type names or anything private.";$("privacy").hidden=false;}
if(HOSTED){try{var qk=new URLSearchParams(location.search).get("k");if(qk){KEY=qk.slice(0,64);localStorage.setItem("np-key",KEY);history.replaceState(null,"",location.pathname);}else KEY=localStorage.getItem("np-key")||"";}catch(e){}}
function shrink(file){ /* phone photos are large; send at most 1280 px as JPEG */
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
},function(){sampleFn=null;}).then(function(){syncDock();});
var CHIPS=[["Heavy last meal","My last meal was heavy."],["Skipped a meal","I skipped my last meal."],["I'm craving…","I'm craving ",1],["I only have…","At home I only have ",1],["At a function","I'm at a function with a buffet."],["After a workout","I've just finished a workout."]];
var FOLLOW=[["Lighter","Make it lighter."],["More protein","More protein, please."],["Faster","Something faster to make."],["Something else","Give me three different plates."]];
var ERR={rate_limited:"Asking is busy right now. Try again in a little while.",session_expired:"You have been signed out. Sign in again to ask.",refused:"That one couldn't be answered. Try asking another way.",upstream_error:"That didn't come through. Try again.",not_granted:"Asking is switched off because Claude wasn't allowed here. Your coach's list still works.",gone:"Asking needs Claude, which isn't connected in this view. Your coach's list still works."};
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
function crosses(text){
  text=text.toLowerCase().replace(NEG," ");
  var bad=[];if(M.diet!=="nonveg")bad=bad.concat(NONVEG);if(M.diet==="veg"||M.diet==="jain"||M.diet==="vegan")bad=bad.concat(EGGW);
  if(M.diet==="jain")bad=bad.concat(JAINW);if(M.diet==="vegan")bad=bad.concat(DAIRYW);
  if(bad.length&&rx(bad).test(text))return true;
  return hits(text,leaveWords());
}
function clean(t,max){
  if(typeof t!=="string")return "";
  t=t.replace(/[☀-➿\uD83C-􏰀-\uDFFF️]/g,"").replace(/!+/g,".").replace(/\s+/g," ").trim();
  if(BAN.test(t))return "";
  return t.slice(0,max);
}
function unitOf(u){
  u=String(u||"").toLowerCase().trim();if(AIUNITS.indexOf(u)>=0)return u;
  if(u.indexOf("katori")>=0||u==="cup"||u==="cups")return "katori";if(u.indexOf("bowl")>=0)return "bowl";if(u.indexOf("glass")>=0)return "glass";
  if(u.indexOf("fist")>=0||u.indexOf("handful")>=0)return "fistful";if(u==="tsp"||u.indexOf("teaspoon")>=0)return "teaspoon";if(u==="tbsp"||u.indexOf("tablespoon")>=0)return "tablespoon";
  if(u.indexOf("piece")>=0)return "piece";if(u.indexOf("slice")>=0)return "slice";if(u.indexOf("plate")>=0)return "plate";return "";
}
function qtyOf(q){
  if(typeof q==="string"){var m=/^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(q);if(m)q=+m[1]/+m[2];else if(/half/i.test(q))q=.5;else q=parseFloat(q);}
  q=+q;if(!(q>0))q=1;return Math.min(6,Math.round(q*4)/4);
}
var SWEETS=["juice","mithai","gulab jamun","jalebi","halwa","kheer","sugar","cola","soft drink","laddu","ladoo","barfi","ice cream","dessert","rasgulla","rosogolla","rasogolla","rasmalai","sandesh","mishti","payasam","shrikhand","peda","chikki","sheera","kesari","modak","malpua","basundi","rabri","syrup","sweetened","soft drinks","honey","jaggery","gur"],SALTY=["pickle","achar","papad","namkeen","chips"];
function toPlate(o){
  var name=clean(o.name,60),items=[],i;if(!name||!Array.isArray(o.items))return null;
  for(i=0;i<o.items.length&&items.length<6;i++){
    var x=o.items[i];if(!x||typeof x.f!=="string")continue;
    if(BAN.test(x.f))return null;                                   /* grams, calories, supplements: the whole plate goes */
    var q=qtyOf(x.q),u=unitOf(x.u);
    var f=x.f.replace(/[☀-➿\uD83C-􏰀-\uDFFF️]/g,"").replace(/!/g,"").replace(/\s+/g," ").trim().replace(/^[\d.\/\u00BC-\u00BE]+\s*/,"");
    if(u&&f.toLowerCase().indexOf(u)===0)f=f.slice(u.length).replace(/^s?\s+(of\s+)?/,"");
    f=f.slice(0,72);if(!f)continue;if(BAN.test(f))return null;
    items.push({n:q,u:u,t:f,role:"",short:"",label:"",delta:0});
  }
  if(!items.length)return null;
  var all=name+" , "+items.map(function(i){return i.t;}).join(" , ");
  if(crosses(all))return null;
  var low=all.toLowerCase().replace(NEG," ");
  if(M.health==="diabetes"&&rx(SWEETS).test(low))return null;
  if(M.health==="bp"&&rx(SALTY).test(low))return null;
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
  if(o.t==="plate"||Array.isArray(o.items)){if(my.plates.length>=3)return false;var m=toPlate(o);if(m)my.plates.push(m);else my.removed++;return true;}
  return false;
}
function objectsIn(text){ /* fallback when the reply was not one object per line */
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
function dropAnswer(){if(ctl){try{ctl.abort();}catch(e){}ctl=null;}busy=false;if(ANS&&ANS.photo)try{URL.revokeObjectURL(ANS.photo);}catch(e){}ANS=null;}
function dockNote(t){$("docknote").textContent=t||"";$("docknote").hidden=!t;}
function ask(text,file){
  if(!M.done||blocked())return;
  text=String(text||"").replace(/[\r\n"]+/g," ").trim().slice(0,240);
  if(!text&&!file)return;
  var shownOnly=!text;if(!text)text="Look at this photo and give me my next plate.";
  var prev=ANS&&ANS.plates.length?ANS.plates.map(function(p){return p.n;}):null,shown=pick().slice(0,3).map(function(m){return m.n;});
  dropAnswer();dockNote("");closeTray();
  var my=ANS={ask:text,said:shownOnly?"You showed a photo.":"You said: "+text,photo:file?URL.createObjectURL(file):"",read:"",seen:"",plates:[],refer:"",removed:0,status:"thinking",err:"",slow:false},pending="",whole="";
  ctl=new AbortController();busy=true;sel=0;$("askin").value="";$("askin").blur();
  render(true);$("frame").scrollTop=0;try{window.scrollTo(0,0);}catch(e){}
  setTimeout(function(){if(ANS===my&&my.status==="thinking"){my.slow=true;render(false);}},7000);
  sampleReady.then(function(){
    if(ANS!==my)return;
    if(!sampleFn){dropAnswer();dockNote(ERR.gone);render(false);return;}
    function eat(delta){pending+=delta;whole+=delta;var lines=pending.split("\n"),ch=false;pending=lines.pop();lines.forEach(function(l){if(handleLine(my,l))ch=true;});if(ch&&ANS===my)render(true);}
    var opts={modelTier:"default",cache:false,signal:ctl.signal,onText:function(u){if(ANS!==my)return;my.status="writing";eat(u.delta);}};
    if(file&&!HOSTED)opts.images=[file];
    var st=promptState(text,!!file,prev,shown),pr;try{pr=HOSTED?hostedAsk(st,file,opts):sampleFn(buildPrompt(st),opts);}catch(e){pr=Promise.reject(e);}
    Promise.resolve(pr).then(function(res){
      if(ANS!==my)return;eat("\n");
      if(!my.plates.length&&!my.refer&&!my.removed)objectsIn(res&&typeof res.text==="string"?res.text:whole).forEach(function(o){handleLine(my,o);});
      busy=false;ctl=null;my.status="done";
      if(my.removed&&my.read){var rl=my.read.toLowerCase().replace(/blood sugar/g," ").replace(NEG," ");if(crosses(my.read)||(M.health==="diabetes"&&rx(SWEETS).test(rl))||(M.health==="bp"&&rx(SALTY).test(rl)))my.read="";}   /* don't keep a read that names a removed food */
      if(!my.plates.length&&!my.refer&&!my.err)my.err=my.removed?"Every suggestion broke one of your rules, so none is shown. Try asking another way.":ERR.upstream_error;
      render(true);
    },function(e){
      if(ANS!==my)return;var code=e&&e.code;busy=false;ctl=null;
      if(code==="cancelled"){if(my.plates.length)my.status="done";else{dropAnswer();}render(false);return;}
      if(GONE.indexOf(code)>=0){sampleFn=null;dropAnswer();dockNote(code==="not_granted"?ERR.not_granted:ERR.gone);render(false);return;}
      my.status="done";my.err=ERR[code]||ERR.upstream_error;render(false);
    });
  });
}
$("composer").addEventListener("submit",function(e){e.preventDefault();if(busy){dropAnswer();render(false);return;}ask($("askin").value);});
$("cambtn").addEventListener("click",function(){$("camfile").click();});
$("camfile").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(f&&!NOPHOTO)ask($("askin").value,f);});
function syncDock(){
  var show=M.done&&!blocked();$("dock").hidden=!show;if(!show)return;
  $("cambtn").hidden=!canImg;
  var host=$("chips"),after=ANS&&ANS.status==="done"&&ANS.plates.length;host.textContent="";host.hidden=busy;
  if(ANS&&!busy){var bk=el("button","quiet","Back to my coach's list");bk.type="button";bk.id="chip-back";bk.addEventListener("click",function(){dropAnswer();sel=0;render(true);});host.appendChild(bk);}
  (after?FOLLOW:CHIPS).forEach(function(c){var b=el("button",null,c[0]);b.type="button";b.disabled=busy;
    b.addEventListener("click",function(){if(c[2]){var i=$("askin");i.value=c[1];i.focus();try{i.setSelectionRange(c[1].length,c[1].length);}catch(e){}}else ask(c[1]);});host.appendChild(b);});
  $("goicon").innerHTML=busy?'<rect x="7" y="7" width="10" height="10" rx="1.5"/>':'<path d="M12 19V5M6 11l6-6 6 6"/>';
  $("askgo").setAttribute("aria-label",busy?"Stop":"Ask");
}

/* ---------- drawing the screen ---------- */
function currentPlates(){
  if(ANS&&ANS.plates.length)return {list:ANS.plates,ai:true,more:false,total:ANS.plates.length};
  var all=pick(),start=all.length>3?(page*3)%all.length:0,three=all.slice(start,start+3);
  if(three.length<3&&all.length>3)three=three.concat(all.slice(0,3-three.length));
  return {list:three,ai:false,more:all.length>3,total:all.length};
}
function plateBody(m,v){
  var b=el("div","obody"),meta=[m.min>0?"About "+m.min+" min":(m.ai?"Ready or ordered":"Order it")];
  if(!m.ai&&S.low!=="none")meta.push((m.low.indexOf(S.low)>=0?"leans on ":"not strong on ")+LOWNAME[S.low]);
  b.appendChild(el("p","meta",meta.join(" · ")));
  var ul=el("ul","measures");
  v.items.forEach(function(it){
    var li=el("li"),f=el("span","f"),u=unitTxt(it.n,it.u);
    li.appendChild(el("span","q disp"+(it.delta?" chg":""),qShow(it)));
    if(u)f.appendChild(el("b",null,u+" "));f.appendChild(document.createTextNode(it.t));
    if(it.delta)f.appendChild(el("span","tag",it.delta>0?"more":"less"));else if(it.swapped)f.appendChild(el("span","tag","swapped"));
    li.appendChild(f);ul.appendChild(li);
  });
  b.appendChild(ul);
  if(m.why)b.appendChild(el("p","why",m.why));
  if(m.skip){var a=el("p","adv");a.appendChild(el("b",null,"Leave today: "));a.appendChild(document.createTextNode(m.skip));b.appendChild(a);}
  if(m.later){var a2=el("p","adv");a2.appendChild(el("b",null,"Next meal: "));a2.appendChild(document.createTextNode(m.later));b.appendChild(a2);}
  var sw=m.ai?null:swapFor(m);
  if(sw){var sb=el("button","swap",SW[m.id]?"Swapped. Go back to "+shortOf(m.items[sw.i]):"Swap "+shortOf(m.items[sw.i])+" for "+sw.t);sb.type="button";sb.id="swap";
    sb.addEventListener("click",function(){SW[m.id]=!SW[m.id];render(true);var n=$("swap");if(n)n.focus();});b.appendChild(sb);}
  var act=el("div","actions"),send=el("a","send","Send to WhatsApp"),cp=el("button","copy","Copy"),txt=msgText(m,v);
  send.id="send";send.href="https://wa.me/?text="+encodeURIComponent(txt);send.target="_blank";send.rel="noopener";
  send.addEventListener("click",function(){logPick(m);});
  cp.type="button";cp.id="copy";
  cp.addEventListener("click",function(){
    logPick(m);
    function ok(){cp.textContent="Copied";$("said").textContent="Copied. Paste it in WhatsApp.";setTimeout(function(){cp.textContent="Copy";},2000);}
    function fail(){try{var r=document.createRange();r.selectNodeContents(ul);var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}cp.textContent="Selected";$("said").textContent="Copying is blocked here. The list is selected instead.";}
    try{navigator.clipboard.writeText(txt).then(ok,fail);}catch(e){fail();}
  });
  act.appendChild(send);act.appendChild(cp);b.appendChild(act);
  return b;
}
function render(animate){
  root.setAttribute("data-meal",S.meal);
  [].forEach.call($("mealrow").children,function(b){b.setAttribute("aria-checked",b.id==="meal-"+S.meal?"true":"false");});
  var setup=!M.done,hold=blocked();
  $("mytext").textContent=setup?"":lab("diet",M.diet)+" · "+lab("region",M.region)+(M.health!=="none"?" · "+lab("health",M.health):"");
  $("my").hidden=setup;
  for(var k in CELLS)CELLS[k].querySelector("b").textContent=lab(k,S[k]);
  $("mealrow").hidden=setup;$("setup").hidden=!setup;
  if(setup||hold){
    ["ans","lead","plates","choices","tray","notes","links","fine"].forEach(function(id){$(id).hidden=true;});openKey=null;
    $("only").hidden=false;$("only").textContent=setup?(M.diet?"Anything on the health side?":"First, what do you eat?"):SAFETY;
    if(setup)buildSetup();syncDock();return;
  }
  /* what was asked, and Next Plate's read of it */
  var a=$("ans");a.hidden=!ANS;
  if(ANS){
    var as=$("asked");as.textContent="";if(ANS.photo){var im=el("img");im.src=ANS.photo;im.alt="Your photo";as.appendChild(im);}as.appendChild(el("span",null,ANS.said));
    var waiting=ANS.status!=="done"&&!ANS.read&&!ANS.refer;
    $("read").className="read"+(waiting?" wait":"");$("read").textContent=ANS.refer||ANS.read||(waiting?(ANS.status==="thinking"?"Thinking it through":"Writing your plates"):"");
    $("read").hidden=!$("read").textContent;
    $("seen").hidden=!ANS.seen;$("seen").textContent=ANS.seen?"I can see: "+ANS.seen:"";
    var note=ANS.err||(ANS.slow&&ANS.status==="thinking"?"Still working. A careful answer can take half a minute.":"");$("err").hidden=!note;$("err").textContent=note;
  }
  var P=currentPlates(),m=P.list[sel]||P.list[0],word={breakfast:"breakfast",lunch:"lunch",snack:"a snack",dinner:"dinner"}[S.meal];
  if(sel>=P.list.length)sel=0;
  $("plates").hidden=!P.list.length;$("only").hidden=!!P.list.length;$("fine").hidden=false;
  $("choices").hidden=!!openKey;$("tray").hidden=!openKey;
  if(!P.list.length){
    $("only").textContent="No plate on your coach's list fits "+(M.diet==="jain"?"Jain":lab("diet",M.diet).toLowerCase())+(M.leave.length?", without "+M.leave.map(function(x){return lab("leave",x).toLowerCase();}).join(" or ")+",":"")+" for "+word+" when you're "+lab("sit",S.sit).toLowerCase()+". Your boundaries stay as they are.";
    $("notes").hidden=true;$("lead").hidden=true;$("others").hidden=true;$("back").hidden=!ANS;syncDock();return;
  }
  $("count").textContent=P.ai?"Written for you just now · not from your coach's list"+(ANS.removed?" · "+ANS.removed+" left out by your rules":""):(["","One plate fits for ","Two plates fit for ","Three plates for "][P.list.length]+word+" · from your coach's list");
  var lead=ANS?"":reason();$("lead").hidden=!lead;$("lead").textContent=lead;
  var host=$("list");host.textContent="";host.className="list"+(ANS&&ANS.status!=="done"&&!ANS.plates.length?" dim":"");
  P.list.forEach(function(x,i){
    var v=view(x),open=i===sel,art=el("article","opt"+(open?" open":"")+(open&&animate?" fresh":"")),head=el("button","ohead");
    head.type="button";head.id="opt-"+i;head.setAttribute("aria-expanded",open?"true":"false");
    head.appendChild(el("span","oname",x.n));if(!open)head.appendChild(el("span","osum",summary(v.items)));
    head.addEventListener("click",function(){if(sel!==i){sel=i;render(true);var h=$("opt-"+i);if(h)h.focus();}});
    art.appendChild(head);if(open)art.appendChild(plateBody(x,v));host.appendChild(art);
  });
  var cur=P.list[sel],notes=notesFor(cur,view(cur)),nb=$("notes");nb.textContent="";nb.hidden=!notes.length;
  notes.forEach(function(t){nb.appendChild(el("p",null,t));});
  $("links").hidden=false;$("others").hidden=!P.more||P.ai;$("back").hidden=!ANS;
  syncDock();
}
$("others").addEventListener("click",function(){page++;sel=0;render(true);$("frame").scrollTop=0;try{window.scrollTo(0,0);}catch(e){}});
$("back").addEventListener("click",function(){dropAnswer();sel=0;render(true);});

render(false);
window.__np={state:function(){return {S:S,M:M,ANS:ANS,sel:sel,log:LOG,busy:busy};},prompt:function(t){return buildPrompt(promptState(t||"test",false,null,pick().slice(0,3).map(function(m){return m.n;})));}};
})();
