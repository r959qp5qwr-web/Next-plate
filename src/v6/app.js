/* ===== Next Plate v6, Phase 1: Today is driven by the food file. Drawing helpers (plate, vines, curve) come from src/v5/app.js via build6.js ===== */

/* ---------- state ---------- */
var now=new Date(),hr=now.getHours()+now.getMinutes()/60;
var CLOCK=hr<4?"dinner":hr<11?"breakfast":hr<15.5?"lunch":hr<18.5?"snack":"dinner";
var MEALS=[["breakfast","Breakfast","sunrise"],["lunch","Lunch","sun"],["snack","Snack","cup"],["dinner","Dinner","moon"]];
var MODEICON={strength:"dumbbell",trek:"mountain",focus:"desk",rest:"moon"},MOODICON={best:"spark",quick:"bolt",protein:"dumbbell",comfort:"flame",light:"leaf"},GOALICON={lose:"down",hold:"scale",build:"dumbbell"};
var DAY=dayOf(now.getTime());
var P={goal:null,focus:"none",meds:"",diet:null,health:null,region:"n",leave:[],sex:"",age:0,cm:0,kg:0,act:"",done:false};
var C={meal:CLOCK,mode:"focus",mood:"best",cuisine:"indian",prep:"home",oil:"min",ratio:null};
var APP={};                                   /* appetite the person set by hand today, per meal; otherwise it is suggested from the day */
var EV=[],STORE={day:DAY,res:{},shown:{}},KEYCODE="";
(function load(){try{
  var raw=JSON.parse(localStorage.getItem("np6")||"null"),old=null;
  if(!raw){old=JSON.parse(localStorage.getItem("np5")||"null");if(old)raw={p:old.p,c:old.c,k:old.k};}
  if(!raw)return;var rp=raw.p||{};
  ["goal","focus","meds","diet","health","region","sex","act"].forEach(function(k){if(lab(k,rp[k]))P[k]=rp[k];});
  if(Array.isArray(rp.leave))P.leave=rp.leave.filter(function(k){return !!lab("leave",k);});
  ["age","cm","kg"].forEach(function(k){if(+rp[k]>0)P[k]=Math.round(+rp[k]);});
  P.done=!!rp.done&&!!P.diet&&!!P.health&&!!P.goal;
  var rc=raw.c||{};["mode","mood","cuisine","prep","oil"].forEach(function(k){if(lab(k,rc[k]))C[k]=rc[k];});
  if(Array.isArray(raw.ev))EV=raw.ev.filter(function(e){return e&&typeof e.t==="number"&&EVTYPES.indexOf(e.type)>=0;});
  if(raw.app&&raw.app.day===DAY)APP=raw.app.v||{};
  if(raw.store&&raw.store.day===DAY&&raw.store.res)STORE=raw.store;
  /* plates kept from before the declared grain field (Critic round 12) were checked under the old rules: drop them, so today's plates are made again */
  Object.keys(STORE.res).forEach(function(k){var r=STORE.res[k];if(r&&Array.isArray(r.meals)&&r.meals.some(function(m){return !m||!m.grain;})){delete STORE.res[k];
    Object.keys(STORE.shown).forEach(function(s){if(STORE.shown[s]===k)delete STORE.shown[s];});}});
  if(typeof raw.k==="string")KEYCODE=raw.k;
}catch(e){}})();
try{var qk=new URLSearchParams(location.search).get("k");if(qk){KEYCODE=qk.slice(0,80);history.replaceState(null,"",location.pathname);}}catch(e){}
function save(){try{
  var cut=Date.now()-90*864e5;EV=EV.filter(function(e){return e.t>=cut;}).slice(-3000);
  var keys=Object.keys(STORE.res);if(keys.length>12)keys.sort(function(a,b){return STORE.res[a].at-STORE.res[b].at;}).slice(0,keys.length-12).forEach(function(k){delete STORE.res[k];});
  localStorage.setItem("np6",JSON.stringify({p:P,c:{mode:C.mode,mood:C.mood,cuisine:C.cuisine,prep:C.prep,oil:C.oil},ev:EV,app:{day:DAY,v:APP},store:STORE,k:KEYCODE}));}catch(e){}}
function logEv(type,o,meal){var e={t:Date.now(),type:type,meal:meal||C.meal};if(o)for(var k in o)e[k]=o[k];EV.push(e);save();}
var UI={open:"",view:"plate",sel:0,alc:{},swp:0,swb:0,adj:false,busy:"",err:"",step:0,fresh:true,hab:{veg:false,walk:false,lemon:false},ratio:null,preset:"mode",
  rtext:"",rres:null,rbusy:false,rerr:"",rmoves:{},mtext:"",mopen:false,mres:null,mbusy:false,merr:"",msel:0,mmoves:{},sheet:"",ltext:"",lres:null,lbusy:false,lerr:""};
var FILE=null,PL=null,HOOKS=[];
function blocked(){return P.done&&(P.health==="kidney"||P.health==="preg");}
function clockText(){var h=now.getHours(),m=now.getMinutes();return ((h%12)||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm");}
function mealName(k){return lab("meal",k);}
function profileOut(){return {goal:P.goal,focus:P.focus,meds:P.health==="diabetes"?(P.meds||"unsure"):"no",diet:P.diet,health:P.health,region:P.region,leave:P.leave,sex:P.sex,age:P.age,cm:P.cm,kg:P.kg,act:P.act};}
function appetite(){return APP[C.meal]!=null?APP[C.meal]:suggestAppetite(FILE,C.meal).v;}
function refresh(){now=new Date();hr=now.getHours()+now.getMinutes()/60;FILE=buildFile(EV,now.getTime());PL=planDay(profileOut(),FILE,C.meal,appetite());
  HOOKS=hooksFor(profileOut(),FILE,{meal:C.meal,hour:C.meal===CLOCK?hr:null,mode:C.mode},PL);}
function slotOf(meal){for(var i=0;i<FILE.today.meals.length;i++)if(FILE.today.meals[i].meal===meal)return FILE.today.meals[i];return null;}
function daySig(){return FILE.today.meals.filter(function(m){return m.meal!==C.meal;}).map(function(m){return m.meal.charAt(0)+(m.kind==="ordered"?"m":m.kind.charAt(0))+Math.round(m.kcal/100);}).join("");}
function ctxKey(){var a=appetite();return [C.meal,P.goal,P.focus,C.mode,C.mood,C.cuisine,C.prep,C.oil,a<=3?"lo":a<=7?"mid":"hi",daySig(),C.ratio?[C.ratio.protein,C.ratio.greens,C.ratio.carbs,C.ratio.fats].join("-"):""].join("|");}
function curKey(){return STORE.shown[C.meal]||ctxKey();}
function curRes(){return STORE.res[curKey()]||null;}
function lastForMeal(){var best=null;Object.keys(STORE.res).forEach(function(k){var r=STORE.res[k];if(r.meal===C.meal&&r.meals&&r.meals.length&&(!best||r.at>best.at))best=r;});return best;}
function fileOut(){return {today:FILE.today,patterns:FILE.patterns,slotProtein:FILE.slotProtein,days:FILE.days,recent:FILE.recent};}
function dayNo(){return Math.floor((now-new Date(now.getFullYear(),0,0))/864e5);}
function ctxOut(text){var c={lite:true,dayNo:dayNo(),meal:C.meal,time:clockText(),hour:C.meal===CLOCK?Math.round(hr*100)/100:null,mode:C.mode,mood:C.mood,cuisine:C.cuisine,prep:C.prep,oil:C.oil,appetite:appetite(),text:text||""};if(C.ratio)c.ratio=C.ratio;return c;}

/* ---------- talking to the server ---------- */
var ERRS={not_set_up:"Meal planning isn't switched on yet.",bad_request:"Next Plate couldn't read that. Close it and open your link from WhatsApp again.",
  bad_key:"This link needs the code from your coach's message. Open the link they sent you.",photos_off:"Photos are switched off. Type it instead.",bad_image:"That photo didn't come through. Try a smaller one, or type it.",
  busy:"Next Plate is busy just now. Try again in a minute.",upstream_error:"Next Plate couldn't get an answer just now. Try again.",unparsed:"The answer came back cut off. Try again."};
/* Try again is offered unless trying again cannot help: a limit, the link, the set-up, photos off, a photo that did not come through, a bad request */
var NORETRY=["limit_day","limit_ip","bad_key","not_set_up","photos_off","bad_image","bad_request"];
function RETRY(code){return NORETRY.indexOf(code)<0;}
/* the daily limit resets at midnight UTC on the server; say when in the phone's own clock */
function resetAt(){var n=new Date(),r=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()+1)),h=r.getHours(),m=r.getMinutes();return (h%12||12)+(m?":"+(m<10?"0":"")+m:"")+(h<12?"\u00A0am":"\u00A0pm");}
function errText(code,where){
  if(code==="limit_day"||code==="limit_ip"){var ph=code==="limit_ip"?" on this phone":"";
    if(where==="plate")return "That's today's limit for new plates"+ph+". New plates open again at "+resetAt()+".";
    return "That's today's limit for Next Plate"+ph+". It opens again at "+resetAt()+".";}
  return ERRS[code]||"Couldn't reach Next Plate just now. Check your signal and try again.";}
function api(path,body,cb){
  body.key=KEYCODE;
  var done=false,ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort();},95000);
  fetch(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.json().then(function(j){return {s:r.status,j:j};},function(){return {s:r.status,j:{}};});})
    .then(function(x){clearTimeout(t);if(!done){done=true;cb(x.s,x.j||{});}},function(){clearTimeout(t);if(!done){done=true;cb(0,{code:"network"});}});
}
function makePlates(text){
  if(UI.busy)return;refresh();var meal=C.meal,key=text?"ask|"+meal+"|"+text.toLowerCase():ctxKey();
  UI.busy=text?"ask":"plates";UI.err="";UI.eretry=true;UI.lastAsk=text||"";render();if(text)logEv("asked",{text:text.slice(0,120)});
  api("/api/meals",{profile:profileOut(),ctx:ctxOut(text),file:fileOut()},function(s,j){
    UI.busy="";
    if(s===200&&(j.status==="ok"||j.status==="refer")){
      STORE.res[key]={meal:meal,status:j.status,read:j.read||"",meals:j.meals||[],hooks:j.hooks||{},ask:text||"",at:Date.now()};STORE.shown[meal]=key;
      UI.sel=0;UI.alc={};UI.swp=0;UI.swb=0;UI.fresh=true;UI.lastAsk="";if(j.meals&&j.meals.length)logEv("shown",{titles:j.meals.map(function(m){return m.title;})},meal);save();tune(key,0);
    }else if(s===200&&j.status==="empty"){UI.err="Nothing that came back fit your food rules. Try again, or change a choice above.";if(text)UI.askDraft=text;}
    else{UI.err=errText(j.code,"plate");UI.eretry=RETRY(j.code);if(text)UI.askDraft=text;}
    render();if(UI.view==="plate")$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});
  });
}

/* The swaps and one-tap changes for one plate arrive a few seconds after the plates themselves, so the plates never wait for them. */
var TUNING={};
function tune(key,i){
  var r=STORE.res[key],m=r&&r.meals&&r.meals[i];if(!m||m.tuned||TUNING[key+"#"+i])return;TUNING[key+"#"+i]=1;
  api("/api/tune",{profile:profileOut(),slot:r.meal,meal:{title:m.title,subtitle:m.subtitle,cuisine:m.cuisine,prepMinutes:m.minutes,minutes:m.minutes,items:m.items,grain:m.grain,kcal:m.kcal,protein:m.protein,carbs:m.carbs,fats:m.fats,fiber:m.fiber,why:[]}},function(s,j){
    delete TUNING[key+"#"+i];
    if(s===200&&j.status==="ok"){m.swaps=j.swaps;m.alchemy=j.alchemy;m.tuned=true;save();}else m.tuneFailed=true;
    if(UI.view==="plate"&&curKey()===key&&UI.sel===i&&!UI.busy)render();});
}
/* ---------- the meal after the person's taps ---------- */
function viewOf(m){
  var n={kcal:m.kcal,protein:m.protein,carbs:m.carbs,fats:m.fats,fiber:m.fiber},title=m.title,notes=[],minutes=m.minutes,items=m.items.map(function(i){return {food:i.food,grams:i.grams,group:i.group};});
  function apply(d){n.kcal+=d.deltaKcal;n.protein+=d.deltaProtein;n.carbs+=d.deltaCarbs;n.fats+=d.deltaFats;n.fiber+=d.deltaFiber;}
  function swapIn(list,idx,group){var s=list[idx];if(!s||!idx)return;apply(s);for(var i=0;i<items.length;i++)if(items[i].group===group){items[i]={food:s.food,grams:s.grams||null,group:group,tag:"swapped"};return;}}
  swapIn(m.swaps.protein,UI.swp,"protein");swapIn(m.swaps.base,UI.swb,"carbs");
  var suffix=[];ALCH.forEach(function(k){var a=m.alchemy[k];if(!a||!UI.alc[k])return;apply(a);suffix.push(a.suffix.replace(/^[(+]\s*|\)$/g,""));notes.push(a.note);if(k==="express"&&a.minutes!=null)minutes=a.minutes;});
  ["kcal","protein","carbs","fats","fiber"].forEach(function(k){n[k]=Math.max(0,Math.round(n[k]));});
  return {title:m.title+(suffix.length?", with "+suffix.join(", ").toLowerCase():""),suffix:suffix.length?"with "+suffix.join(", ").toLowerCase():"",n:n,notes:notes,minutes:minutes,items:items};
}
function curMeal(){var r=curRes();if(!r||!r.meals||!r.meals.length)return null;if(UI.sel>=r.meals.length)UI.sel=0;return r.meals[UI.sel];}
function clearSlot(meal){var d=DAY;EV=EV.filter(function(e){return !(dayOf(e.t)===d&&e.meal===meal&&(isMealEv(e)||e.type==="skipped"));});save();}
function nextOpen(){var i=SLOTS.indexOf(C.meal);for(var j=i+1;j<4;j++)if(!slotOf(SLOTS[j]))return SLOTS[j];return null;}

/* ---------- chrome ---------- */
function renderChrome(){
  $("mastdate").textContent=now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
  var start=new Date(now.getFullYear(),0,0);$("issue").textContent="Issue No. "+Math.floor((now-start)/864e5);
  $("myfood").hidden=!P.done;$("tabs").hidden=!P.done;
  if(P.done)$("myfoodtxt").textContent=lab("diet",P.diet)+" · "+lab("region",P.region);
  ["plate","build","rescue"].forEach(function(v){var t=$("tab-"+v);if(UI.view===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current");});
}
function show(v){UI.view=v;render();$("scroll").scrollTop=0;var sec=$("v-"+v);if(sec){sec.classList.remove("enter");void sec.offsetWidth;sec.classList.add("enter");}}
function render(){
  refresh();renderChrome();
  ["setup","plate","build","rescue"].forEach(function(v){$("v-"+v).hidden=true;});
  if(!P.done){$("v-setup").hidden=false;renderSetup();return;}
  var v=$("v-"+UI.view);v.hidden=false;
  if(UI.view==="plate")renderPlate();else if(UI.view==="build")renderBuild();else renderRescue();
}

/* ---------- setup: goal and food, health, body. Asked once, kept on this phone ---------- */
function tiles(host,k,isOn,set,multi,iconOf,subs){
  var g=el("div","grid2");g.setAttribute("role",multi?"group":"radiogroup");
  OPT[k].forEach(function(o){var b=el("button","tile");b.type="button";b.id=k+"-"+o[0];b.setAttribute("role",multi?"checkbox":"radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    if(iconOf)b.appendChild(ic(iconOf[o[0]]));var tx=el("span",null,o[1]);if(subs&&subs[o[0]])tx.appendChild(el("small",null,subs[o[0]]));b.appendChild(tx);
    b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});host.appendChild(g);
}
function choiceRow(host,k,isOn,set,cols){
  var g=el("div","choice-row");g.setAttribute("role","radiogroup");if(cols)g.style.gridTemplateColumns="repeat("+cols+",minmax(0,1fr))";
  OPT[k].forEach(function(o){var b=btn("choice",o[1],null,k+"-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});
  host.appendChild(g);
}
function q(host,title,small){var d=el("div","qs");d.appendChild(el(small?"p":"h2",small?"cap":null,title));host.appendChild(d);return d;}
function goalQs(host,after){var a=q(host,"What are you working towards?");tiles(a,"goal",function(v){return P.goal===v;},function(v){P.goal=v;after();},false,GOALICON);}
function foodQs(host,after){
  var a=q(host,"What do you eat?");tiles(a,"diet",function(v){return P.diet===v;},function(v){P.diet=v;after();});
  var b=q(host,"Leave out completely",true),lw=el("div","lows");
  OPT.leave.forEach(function(o){var on=P.leave.indexOf(o[0])>=0,x=btn("choice",o[1],null,"leave-"+o[0]);x.setAttribute("role","checkbox");x.setAttribute("aria-checked",on?"true":"false");
    x.addEventListener("click",function(){var i=P.leave.indexOf(o[0]);if(i>=0)P.leave.splice(i,1);else P.leave.push(o[0]);after();});lw.appendChild(x);});b.appendChild(lw);
  var c=q(host,"Home food",true);choiceRow(c,"region",function(v){return P.region===v;},function(v){P.region=v;after();},4);
}
function healthQs(host,after){
  var a=q(host,"Anything on the health side?");tiles(a,"health",function(v){return P.health===v;},function(v){P.health=v;after();});
  if(P.health==="diabetes"){var m=q(host,"Do you take insulin, or sugar tablets such as glimepiride or gliclazide?",true);m.appendChild(el("p","fine","These can cause low sugar when you eat less, so the plates stay steadier for you."));choiceRow(m,"meds",function(v){return P.meds===v;},function(v){P.meds=v;after();},3);}
  var b=q(host,"Minding any nutrient?",true),lw=el("div","lows");lw.setAttribute("role","radiogroup");
  OPT.focus.forEach(function(o){var x=btn("choice",o[0]==="none"?"Nothing":o[1],null,"focus-"+o[0]);x.setAttribute("role","radio");x.setAttribute("aria-checked",P.focus===o[0]?"true":"false");x.addEventListener("click",function(){P.focus=o[0];after();});lw.appendChild(x);});b.appendChild(lw);
}
function bodyQs(host,after){
  var a=q(host,"For your targets");a.appendChild(el("p","fine","Calories and protein for each meal are worked out from these. Kept on this phone."));
  choiceRow(a,"sex",function(v){return P.sex===v;},function(v){P.sex=v;after();},2);
  var f=el("div","fields");
  [["age","Age","years",16,95],["cm","Height","cm",120,215],["kg","Weight","kg",30,200]].forEach(function(x){
    var l=el("label");l.appendChild(el("span","cap",x[1]));var i=el("input");i.type="number";i.inputMode="numeric";i.min=String(x[3]);i.max=String(x[4]);i.id="body-"+x[0];i.placeholder=x[2];if(P[x[0]])i.value=String(P[x[0]]);
    i.addEventListener("change",function(){var v=Math.round(+i.value);P[x[0]]=v>=x[3]&&v<=x[4]?v:0;if(!P[x[0]])i.value="";after(true);});l.appendChild(i);f.appendChild(l);});
  a.appendChild(f);
  var b=el("div","qs");b.appendChild(el("p","cap","Activity"));tiles(b,"act",function(v){return P.act===v;},function(v){P.act=v;after();});a.appendChild(b);
}
function renderSetup(){
  var v=$("v-setup");v.textContent="";
  var h=el("div","setup-hero"),st=el("div","steps");for(var i=0;i<3;i++)st.appendChild(el("i",UI.step>=i?"on":null));
  var head=[["Your next plate, every meal","Three short steps, asked once and kept on this phone. The rest it learns from what you eat."],["Your health","This keeps the plates safe for you."],["Your body","The last step."]][UI.step];
  add(h,st,el("h1",null,head[0]),el("p",null,head[1]));v.appendChild(h);
  function again(){render();}
  if(UI.step===0){goalQs(v,again);foodQs(v,again);}else if(UI.step===1){healthQs(v,again);}else{bodyQs(v,function(soft){if(!soft)again();});}
  var row=el("div","choice-row");row.style.gridTemplateColumns=UI.step?"1fr 2fr":"1fr";
  if(UI.step){var bk=btn("btn","Back",null,"setup-back");bk.addEventListener("click",function(){UI.step--;render();});row.appendChild(bk);}
  var ok=UI.step===0?!!P.diet&&!!P.goal:UI.step===1?!!P.health&&(P.health!=="diabetes"||!!P.meds):true;
  if(!ok&&UI.step===1&&P.health==="diabetes"&&!P.meds)v.appendChild(el("p","fine","Answer the medicine question to go on."));
  var go=btn("btn primary",UI.step<2?"Next":"Show my plate",null,"setup-next");if(!ok){go.disabled=true;go.style.opacity=".5";}
  go.addEventListener("click",function(){if(!ok)return;if(UI.step<2){UI.step++;render();$("scroll").scrollTop=0;return;}P.done=true;save();show("plate");});
  row.appendChild(go);v.appendChild(row);
  v.appendChild(el("p","fine","Meals are planned by AI (Google Gemini) from your choices and your day. Numbers are estimates. General food guidance, not medical advice."));
}
function blockedCard(){
  var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("shield"));
  add(c,i,el("h2",null,SAFETY),el("p",null,(P.health==="preg"?"You said you are pregnant or nursing.":"You said you have a kidney condition.")+" For this, your meals are best planned with your coach and doctor, so Next Plate suggests none for now."));
  var b=btn("btn","Change my answers",null,null);b.addEventListener("click",function(){openSheet("food");});c.appendChild(b);return c;
}

/* ---------- 01 Today ---------- */
function directiveCard(host){
  if(!PL){var n=el("p","tip");n.appendChild(el("b",null,"Add your height and weight. "));n.appendChild(document.createTextNode("Then every meal gets a calorie and protein target that follows your day."));
    var b=btn("linkbtn","Add them now",null,"add-body");b.addEventListener("click",function(){openSheet("food");});n.appendChild(b);host.appendChild(n);return;}
  var meal=C.meal,pl=PL,hk=HOOKS,done=false;
  if(slotOf(meal)){var nx=nextOpen();if(nx){meal=nx;pl=planDay(profileOut(),FILE,nx,APP[nx]!=null?APP[nx]:suggestAppetite(FILE,nx).v);hk=hooksFor(profileOut(),FILE,{meal:nx,hour:null,mode:C.mode},pl);}else done=true;}
  var txt=directive(profileOut(),pl,hk,meal,done).replace(/^Today: about/,"About");
  var d=el("p","tip directive");d.id="directive";d.appendChild(el("b",null,"Today. "));d.appendChild(document.createTextNode(txt));
  var how=btn("linkbtn","How these numbers are worked out",null,"how");how.addEventListener("click",function(){openSheet("targets");});d.appendChild(how);host.appendChild(d);
}
function ctxBlock(host){
  var t=FILE.today,dt=PL?PL.day:null,tl=el("div","tiles");
  function tile(cap,val,unit,frac,nc){var d=el("div","tile2 n-"+nc);d.appendChild(el("p","cap",cap));var v=el("span","v");v.appendChild(val);if(unit)v.appendChild(el("small",null,unit));d.appendChild(v);
    if(frac!=null){var b=el("div","bar"),i=el("i");i.style.width=Math.min(100,Math.round(frac*100))+"%";b.appendChild(i);d.appendChild(b);}return d;}
  tl.appendChild(tile("Protein today",tw("t-p",Math.round(t.protein)),dt?" / "+dt.protein+" g":" g",dt?t.protein/dt.protein:null,"pro"));
  tl.appendChild(tile("Energy today",tw("t-k",Math.round(t.kcal)),dt?" / "+dt.kcal+"\u00A0kcal":" kcal",dt?t.kcal/dt.kcal:null,"ink"));
  tl.appendChild(tile("Fibre today",tw("t-f",Math.round(t.fiber)),dt&&dt.fiber?" / "+dt.fiber+" g":" g",dt&&dt.fiber?t.fiber/dt.fiber:null,"veg"));
  host.appendChild(tl);
  var rail=el("div","rail"),sg=suggestAppetite(FILE,C.meal),ap=appetite();
  function pill(key,icon,label,value){var b=el("button","pillsel");b.type="button";b.id="dial-"+key;b.setAttribute("aria-expanded",UI.open===key?"true":"false");b.appendChild(ic(icon));if(label)b.appendChild(el("span",null,label));b.appendChild(el("b",null,value));b.appendChild(ic("chevd"));
    b.addEventListener("click",function(){UI.open=UI.open===key?"":key;render();});return b;}
  add(rail,pill("goal",GOALICON[P.goal],"",lab("goal",P.goal)),pill("mode",MODEICON[C.mode],"",lab("mode",C.mode)),pill("appetite","flame","Appetite",ap+"/10"),pill("cuisine","thali","",lab("cuisine",C.cuisine)),
    pill("mood",MOODICON[C.mood],"",lab("mood",C.mood)),pill("cook",C.prep==="out"?"store":"pan","",(C.prep==="out"?"Ordering":"Cooking")+" · "+(C.oil==="min"?"less oil":"usual oil")),
    pill("focus","target","Minding",P.focus==="none"?"nothing":FOCUSNAME[P.focus]));
  host.appendChild(rail);
  function changed(){STORE.shown[C.meal]=null;UI.err="";UI.open="";save();render();}
  function radios(list,isOn,set,iconOf,cls){var g=el("div",cls||"grid2");g.setAttribute("role","radiogroup");
    list.forEach(function(o){var b=el("button",cls==="choice-row"||cls==="lows"?"choice":"tile");b.type="button";b.id=o.id;b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o.v)?"true":"false");if(iconOf)b.appendChild(ic(iconOf(o.v)));var tx=el("span",null,o.t);if(o.s)tx.appendChild(el("small",null,o.s));b.appendChild(tx);
      b.addEventListener("click",function(){set(o.v);});g.appendChild(b);});host.appendChild(g);}
  if(UI.open==="goal")radios(OPT.goal.map(function(o){return {id:"goal-"+o[0],v:o[0],t:o[1]};}),function(v){return P.goal===v;},function(v){P.goal=v;changed();toast(lab("goal",v)+". Targets and plates follow it.");},function(v){return GOALICON[v];});
  if(UI.open==="mode")radios(OPT.mode.map(function(o){return {id:"mode-"+o[0],v:o[0],t:o[1],s:{strength:"Gym or sport today",trek:"A long hike or climb",focus:"Mostly sitting",rest:"Light and easy"}[o[0]]};}),function(v){return C.mode===v;},function(v){C.mode=v;UI.ratio=null;changed();},function(v){return MODEICON[v];});
  if(UI.open==="cuisine")radios(OPT.cuisine.map(function(o){return {id:"cuisine-"+o[0],v:o[0],t:o[1]};}),function(v){return C.cuisine===v;},function(v){C.cuisine=v;changed();},null,"choice-row");
  if(UI.open==="mood")radios(OPT.mood.map(function(o){return {id:"mood-"+o[0],v:o[0],t:o[1]};}),function(v){return C.mood===v;},function(v){C.mood=v;changed();},function(v){return MOODICON[v];});
  if(UI.open==="focus")radios(OPT.focus.map(function(o){return {id:"focus-"+o[0],v:o[0],t:o[0]==="none"?"Nothing":o[1]};}),function(v){return P.focus===v;},function(v){P.focus=v;changed();},null,"lows");
  if(UI.open==="cook"){radios(OPT.prep.map(function(o){return {id:"prep-"+o[0],v:o[0],t:o[1]};}),function(v){return C.prep===v;},function(v){C.prep=v;STORE.shown[C.meal]=null;save();render();},function(v){return v==="out"?"store":"pan";});
    radios(OPT.oil.map(function(o){return {id:"oil-"+o[0],v:o[0],t:o[1]};}),function(v){return C.oil===v;},function(v){C.oil=v;changed();},function(v){return v==="min"?"leaf":"flame";});}
  if(UI.open==="appetite"){
    var sl=el("div","slide"),sh=el("div","slide-h"),sv=el("span","slide-v");sv.appendChild(el("b",null,String(ap)));sv.appendChild(document.createTextNode(" of 10"+(PL?" · about "+PL.target.kcal+"\u00A0kcal":"")));
    add(sh,el("span",null,"A little"),sv,el("span",null,"Very hungry"));
    var r=el("input");r.type="range";r.min="1";r.max="10";r.value=String(ap);r.id="appetite";r.setAttribute("aria-label","Appetite, 1 to 10");r.style.setProperty("--fill",((ap-1)/9*100)+"%");
    r.addEventListener("input",function(){r.style.setProperty("--fill",((+r.value-1)/9*100)+"%");sv.firstChild.textContent=r.value;});
    r.addEventListener("change",function(){APP[C.meal]=+r.value;save();render();});
    add(sl,sh,r,el("p","tsub",APP[C.meal]==null&&sg.why?"Set for you: "+sg.why+". Move it if that's not how you feel.":"Moves this meal's calorie target. New plates follow it."));host.appendChild(sl);}
}
function choices(host){
  var ms=el("div","meals");ms.setAttribute("role","radiogroup");ms.setAttribute("aria-label","Meal");
  MEALS.forEach(function(m){var b=el("button","meal");b.type="button";b.id="meal-"+m[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",C.meal===m[0]?"true":"false");var s=slotOf(m[0]);
    b.appendChild(ic(m[2]));b.appendChild(el("span",null,m[1]+(s?(s.kind==="skipped"?" –":" ✓"):"")));if(m[0]===CLOCK&&!s){var d=el("i","now");d.setAttribute("aria-label","now");b.appendChild(d);}
    b.addEventListener("click",function(){if(C.meal===m[0])return;C.meal=m[0];UI.sel=0;UI.alc={};UI.swp=0;UI.swb=0;UI.err="";UI.fresh=true;UI.open="";render();});ms.appendChild(b);});
  host.appendChild(ms);
}
function waitCard(text,label){
  var c=el("article","plate wait"),h=el("div","hero"),band=el("div","band");band.appendChild(vine(false));band.appendChild(vine(true));h.appendChild(band);
  var main=el("div","hero-main");main.appendChild(thali([],0,label||"Your plate is being planned",C.meal));var tx=el("div");tx.appendChild(el("p","ans-read wait",text));
  if(HOOKS.length)tx.appendChild(el("p","planned","planned around: "+HOOKS.slice(0,3).map(function(h){return h.tag;}).join(" · ")));main.appendChild(tx);h.appendChild(main);c.appendChild(h);return c;
}
function loggedCard(s){
  var c=el("article","card logged"),nm=mealName(s.meal),kind={had:"from your plates",other:"your own meal",rescued:"eaten out",ordered:"ordered from the menu",skipped:"skipped"}[s.kind];
  c.appendChild(el("p","cap",nm+" · "+kind));
  if(s.kind==="skipped"){c.appendChild(el("h3","dish","Skipped "+nm.toLowerCase()));c.appendChild(el("p","tsub","The rest of the day adjusts. No meal is asked to make up for it in one sitting."));
    if(PL&&PL.day.meds)c.appendChild(el("p","tsub","On insulin or sugar tablets such as glimepiride or gliclazide, a skipped meal can drop your sugar. Follow your doctor's advice."));}
  else{c.appendChild(el("h3","dish",s.title));var p=el("p","tsub");p.appendChild(document.createTextNode("≈\u00A0"+Math.round(s.kcal)+"\u00A0kcal · "+(s.kind==="ordered"?"≈\u00A0":"")+Math.round(s.protein)+"\u00A0g protein"));c.appendChild(p);}
  var row=el("div","pick-acts"),ch=btn("btn","Change",null,"slot-change");ch.addEventListener("click",function(){clearSlot(s.meal);STORE.shown[s.meal]=STORE.shown[s.meal]||null;render();toast(nm+" reopened.");});row.appendChild(ch);
  var nx=nextOpen();if(nx){var go=btn("btn primary","Plan "+mealName(nx).toLowerCase(),"chev","slot-next");go.addEventListener("click",function(){C.meal=nx;UI.sel=0;UI.alc={};UI.fresh=true;render();$("scroll").scrollTop=0;});row.appendChild(go);}
  c.appendChild(row);return c;
}
function heroCard(m,v,r){
  var n=v.n,rs=riseOf(n,null),tg=PL?PL.target:null,fit=fitOf(n,tg),card=el("article","plate"+(UI.fresh?" fresh":""));card.id="plate-card";
  var h=el("div","hero"),top=el("div","hero-top");
  function chip(t,cls,icon){var c=el("span","hchip"+(cls?" "+cls:""));if(icon)c.appendChild(ic(icon));c.appendChild(el("span",null,t));return c;}
  top.appendChild(chip(lab("diet",P.diet),"fit","check"));
  P.leave.forEach(function(k){top.appendChild(chip("No "+lab("leave",k).toLowerCase(),"fit","check"));});
  if(fit!=null)top.appendChild(chip("Fit\u00A0"+fit+"\u00A0/\u00A0100","fit","target"));
  top.appendChild(chip(v.minutes>0?v.minutes+"\u00A0min":(C.prep==="out"?"Order it":"Ready"),"time","clock"));
  var main=el("div","hero-main"),txt=el("div");
  var pb=el("div","platebox");pb.appendChild(thali(v.items,0,"Your "+mealName(C.meal).toLowerCase()+" plate: "+v.items.map(function(i){return i.food;}).join(", "),C.meal));main.appendChild(pb);
  h.appendChild(sprig("hero-sprig"));var band=el("div","band");band.appendChild(vine(false));band.appendChild(vine(true));h.appendChild(band);
  var vw=vegWord(shares(v.items).veg),sc=el("span","scribble");sc.textContent=vw==="None"?"no veg here yet":vw.toLowerCase()+(vw==="A little"?" veg on":" of")+" the plate"+(vw==="A little"?"":" is veg");pb.appendChild(sc);
  var gb=gramsBy(v.items),lg=el("ul","prlegend");lg.setAttribute("aria-hidden","true");
  NUTORDER.forEach(function(k){if(!gb[k])return;var li=el("li","n-"+NUTC[k]);add(li,el("i"),el("span",null,NUTNAME[k]),el("b",null,gb[k]+" g"));lg.appendChild(li);});
  if(lg.firstChild)txt.appendChild(lg);
  if(m.taste&&m.taste.length){var ts=el("p","taste");ts.setAttribute("aria-label","Tastes "+m.taste.join(", "));m.taste.forEach(function(w){ts.appendChild(el("span",null,w));});txt.appendChild(ts);}
  txt.appendChild(el("h2",m.title.length>34?"long":null,m.title));if(v.suffix)txt.appendChild(el("p","suffix",v.suffix));
  txt.appendChild(el("p","sub",m.subtitle));
  var tags=(m.planned||[]).map(function(id){return r.hooks&&r.hooks[id];}).filter(Boolean);
  if(tags.length){var pa=el("p","planned");pa.id="planned";pa.appendChild(document.createTextNode("planned around: "));tags.forEach(function(t,i){if(i)pa.appendChild(document.createTextNode(" · "));pa.appendChild(el("span",null,t));});txt.appendChild(pa);}
  main.appendChild(txt);
  var rd=el("div","read4 six");
  function cell(cap,node,unit,cls,nc){var d=el("div","tcard n-"+nc);d.appendChild(el("p","cap",cap));var x=el("span","v"+(cls?" "+cls:""));x.appendChild(node);if(unit)x.appendChild(el("small",null,unit));d.appendChild(x);return d;}
  add(rd,cell("Protein",tw("h-p",n.protein),"g",null,"pro"),cell("Carbs",tw("h-c",n.carbs),"g",null,"grain"),cell("Fats",tw("h-f",n.fats),"g",null,"side"),
    cell("Energy",tw("h-k",n.kcal),"kcal",null,"ink"),cell("Fibre",tw("h-fi",n.fiber),"g",null,"veg"),cell("Rise",el("span","mono",rs.band),null,bandCls(rs.band),"ink"));
  var waitT=!m.tuned&&!m.tuneFailed;if(waitT)tune(curKey(),UI.sel);
  var tn=el("div","tune alc");tn.appendChild(el("p","cap",waitT?"One-tap changes \u00B7 getting them ready":"One-tap changes"));
  var off=[];[["protein","dumbbell"],["glucose","lab"],["express","bolt"],["gut","leaf"]].forEach(function(x){
    var a=m.alchemy[x[0]];var b=btn("tbtn",ALCHLABEL[x[0]],x[1],"alc-"+x[0]);setPressed(b,!!UI.alc[x[0]]);if(!a)off.push(ALCHLABEL[x[0]]);
    if(!a){b.disabled=true;b.title=waitT?"Getting ready":"Not offered for this plate";}
    b.addEventListener("click",function(){if(!a)return;UI.alc[x[0]]=!UI.alc[x[0]];if(UI.alc[x[0]])logEv("tuned",{k:x[0],title:m.title});render();});tn.appendChild(b);});
  if(!waitT&&off.length){var tno=el("p","fine tnote",off.length===4?"No one-tap changes for this plate.":"Not offered for this plate: "+off.join(", ")+".");tno.id="alc-off";tn.appendChild(tno);}
  var rw=el("div","rw");rw.appendChild(rd);add(h,top,main,rw,tn);
  if(v.notes.length){var ml=el("ul","modlog");v.notes.forEach(function(x){ml.appendChild(el("li",null,x));});h.appendChild(ml);}
  card.appendChild(h);
  var sv=el("div","serve"),sh2=el("div","serve-h");sh2.appendChild(el("p","cap","What to serve"));
  var hasSw=m.swaps.protein.length>1||m.swaps.base.length>1;
  if(hasSw){var adj=el("button","linkbtn");adj.type="button";adj.id="adjust";adj.setAttribute("aria-expanded",UI.adj?"true":"false");adj.appendChild(ic(UI.adj?"x":"sliders"));adj.appendChild(el("span",null,UI.adj?"Done":"Swap"));
    adj.addEventListener("click",function(){UI.adj=!UI.adj;render();});sh2.appendChild(adj);}
  sv.appendChild(sh2);
  if(UI.adj&&hasSw){var d=el("div","drawer");
    [["protein","Main protein","swp"],["base","Base","swb"]].forEach(function(x){var list=m.swaps[x[0]];if(list.length<2)return;var g=el("div");g.appendChild(el("p","cap",x[1]));var w=el("div","lows");
      list.forEach(function(s,i){var lbl=s.food+(i&&s.deltaProtein?" ("+(s.deltaProtein>0?"+":"")+s.deltaProtein+"\u00A0g protein)":"");var b=btn("choice",lbl,null,x[2]+"-"+i);b.setAttribute("role","radio");b.setAttribute("aria-checked",UI[x[2]]===i?"true":"false");
        b.addEventListener("click",function(){UI[x[2]]=i;if(i)logEv("swapped",{from:list[0].food,to:s.food});render();});w.appendChild(b);});g.appendChild(w);d.appendChild(g);});
    sv.appendChild(d);}
  var ul=el("ul","measures");
  v.items.forEach(function(it){var li=el("li"),qy=el("span","qty g"+(it.tag?" chg":""));qy.style.setProperty("--dot",RINGC[{greens:"veg",protein:"pro",carbs:"grain"}[it.group]||"side"]);
    if(it.grams){qy.appendChild(document.createTextNode(String(it.grams)));qy.appendChild(el("small",null,"g"));}else qy.textContent="—";
    var f=el("span","food");f.appendChild(el("b",null,it.food));if(it.tag)f.appendChild(el("span","tag","swapped"));add(li,qy,f);ul.appendChild(li);});
  sv.appendChild(ul);card.appendChild(sv);
  if(m.why.length){var pr=el("div","pairs"),ph=el("p","ph");ph.id="pairs";add(ph,el("b",null,"Pair it"),el("small",null,"to take up more from this plate"));pr.appendChild(ph);
    var pu=el("ul");m.why.forEach(function(w){var li=el("li"),pl=el("span","plus","+"),tx=el("span");pl.setAttribute("aria-hidden","true");add(tx,el("b","pf",w.pair),el("span","pe",w.effect));add(li,pl,tx);pu.appendChild(li);});
    pr.appendChild(pu);card.appendChild(pr);}
  var acts=el("div","acts two");
  var total=r.meals.length,nx=btn("btn",total>1?"Next\u00A0plate ("+(UI.sel+1)+"/"+total+")":"New plates","refresh","next");
  nx.addEventListener("click",function(){if(total>1){logEv("next",{title:m.title});UI.sel=(UI.sel+1)%total;UI.alc={};UI.swp=0;UI.swb=0;UI.adj=false;UI.fresh=true;render();}else makePlates("");});
  var tr=btn("btn","Try it","lab","try");tr.addEventListener("click",function(){show("build");});
  var hv=btn("btn primary","I'll have this","check","have");
  hv.addEventListener("click",function(){clearSlot(C.meal);logEv("had",{title:v.title,kcal:n.kcal,protein:n.protein,carbs:n.carbs,fats:n.fats,fiber:n.fiber,planned:m.planned||[]});render();$("scroll").scrollTop=0;toast("Saved for "+mealName(C.meal).toLowerCase()+". The rest of the day follows it.");});
  add(acts,hv,nx,tr);card.appendChild(acts);
  var lg=el("div","logrow");var o=btn("linkbtn","I had something else","plus","log-other");o.addEventListener("click",function(){UI.ltext="";UI.lres=null;UI.lerr="";openSheet("log");});
  var sk=btn("linkbtn","Skipped it","x","log-skip");sk.addEventListener("click",function(){clearSlot(C.meal);logEv("skipped",{});render();$("scroll").scrollTop=0;if(PL&&PL.day.meds)toast("On insulin or sugar tablets such as glimepiride or gliclazide, a skipped meal can drop your sugar. Follow your doctor's advice.",true);});add(lg,o,sk);card.appendChild(lg);
  return card;
}
var PROMPTS=["Craving chaat at 6 pm","Heavy leg day: a high-protein dinner","Trek tomorrow: food to carry","What to order at a restaurant tonight","Post-workout, under 600 kcal","Only eggs, spinach and bread at home"];
function askBlock(host){
  var h=el("div","sec-h");h.appendChild(el("h3",null,"Ask for something else"));host.appendChild(h);
  var pr=el("div","prompts");PROMPTS.filter(function(t){return !crosses(t,P);}).slice(0,4).forEach(function(t,i){var b=el("button","prompt");b.type="button";b.id="prompt-"+i;b.appendChild(el("span",null,"“"+t+"”"));b.appendChild(ic("chev"));
    b.addEventListener("click",function(){makePlates(t);});pr.appendChild(b);});host.appendChild(pr);
}
function composer(host){
  var c=el("div","composer"),f=el("form");f.id="askform";f.autocomplete="off";
  var i=el("input");i.type="text";i.id="askin";i.maxLength=240;i.placeholder="Type a craving or a dish";i.setAttribute("aria-label","Ask for a meal");
  var go=el("button","send");go.type="submit";go.id="askgo";go.setAttribute("aria-label","Ask");go.appendChild(ic("send"));
  i.value=UI.askDraft||"";i.addEventListener("input",function(){UI.askDraft=i.value;});   /* what is typed stays across re-renders; a failed ask stays too */
  f.addEventListener("submit",function(e){e.preventDefault();var t=i.value.trim();if(!t||UI.busy)return;i.blur();UI.askDraft="";makePlates(t);});
  add(f,i,go);c.appendChild(f);host.appendChild(c);
}
function renderPlate(){
  var v=$("v-plate");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  choices(v);
  var s=slotOf(C.meal),r=curRes(),asked=STORE.shown[C.meal]&&STORE.shown[C.meal].indexOf("ask|")===0;
  if(s&&!asked){v.appendChild(loggedCard(s));}
  else if(UI.busy){v.appendChild(waitCard(UI.busy==="ask"?"Planning plates for what you asked":"Planning your "+mealName(C.meal).toLowerCase()+" plates"));}
  else if(!r){
    var last=lastForMeal(),auto=!STORE.shown.hasOwnProperty(C.meal)&&!UI.err;
    if(auto){STORE.shown[C.meal]=null;setTimeout(function(){makePlates("");},0);v.appendChild(waitCard("Planning your "+mealName(C.meal).toLowerCase()+" plates"));}
    else{
      var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic(UI.err?"info":"refresh"));
      add(c,i,el("h2",null,UI.err?UI.err:"Your day has moved on. Plan fresh plates?"));
      if(!UI.err||UI.eretry!==false){var b=btn(UI.err?"btn":"btn primary",UI.err?"Try again":"Plan my plates",UI.err?"refresh":"spark","remake");b.addEventListener("click",function(){makePlates(UI.lastAsk||"");});c.appendChild(b);}
      if(last){var lb=btn("linkbtn","Show my last plates",null,"lastplates");lb.addEventListener("click",function(){var k=Object.keys(STORE.res).filter(function(k){return STORE.res[k]===last;})[0];STORE.shown[C.meal]=k;UI.err="";UI.sel=0;render();});c.appendChild(lb);}
      v.appendChild(c);}
  }else if(r.status==="refer"){
    var e=el("div","empty-card"),si=el("span","safe-ic");si.appendChild(ic("shield"));add(e,si,el("h2",null,r.read||SAFETY));
    var bb=btn("btn","Back to my plates",null,"back");bb.addEventListener("click",function(){STORE.shown[C.meal]=null;render();});e.appendChild(bb);v.appendChild(e);
  }else{
    if(UI.err){var en=el("div","note");en.appendChild(ic("info"));var et=el("div");et.appendChild(el("p",null,UI.err+" Showing your last plates."));
      if(UI.eretry!==false){var ar=btn("btn","Try again","refresh","ask-retry");ar.addEventListener("click",function(){var x=UI.lastAsk||"";UI.err="";makePlates(x);});et.appendChild(ar);}
      en.appendChild(et);v.appendChild(en);}
    if(asked){var rl=el("div","readline");rl.appendChild(el("p","asked","“"+r.ask+"”"));if(r.read)rl.appendChild(el("p","ans-read",r.read));
      var back=btn("linkbtn","Back to my plates",null,"back");back.addEventListener("click",function(){STORE.shown[C.meal]=null;UI.sel=0;UI.alc={};render();});rl.appendChild(back);v.appendChild(rl);}
    var m=curMeal(),vw=viewOf(m);
    v.appendChild(heroCard(m,vw,r));
    if(P.health==="diabetes"||P.health==="bp"){var nt=el("div","note");nt.setAttribute("role","note");nt.appendChild(ic("info"));nt.appendChild(el("p",null,P.health==="diabetes"?"With diabetes the grain stays on the plate, next to protein and vegetables. Your doctor's advice comes first.":"With high BP these plates leave out pickle, papad and added salt. Your doctor's advice comes first."));v.appendChild(nt);}
    if(m.forYou){var wc=el("article","card why"),wi=el("span","why-ic");wi.appendChild(ic("shield"));var wt=el("div");wt.appendChild(el("h3",null,"Why this plate, today"));
      wt.appendChild(el("p","lead",m.forYou));add(wc,wi,wt);v.appendChild(wc);}
    if(r.meals.length>1){var hh=el("div","sec-h");hh.appendChild(el("h3",null,"Also for "+mealName(C.meal).toLowerCase()));v.appendChild(hh);
      var wrap=el("div","alts");r.meals.forEach(function(x,i){if(i===UI.sel)return;var b=el("button","alt");b.type="button";b.id="alt-"+i;
        var tx=el("span");tx.appendChild(el("b",null,x.title));tx.appendChild(el("small",null,"≈\u00A0"+x.protein+"\u00A0g protein · "+x.kcal+"\u00A0kcal"+(x.minutes?" · "+x.minutes+"\u00A0min":"")));
        add(b,thali(x.items,56,"Plate"),tx,ic("chev"));b.addEventListener("click",function(){logEv("chosen",{title:x.title});UI.sel=i;UI.alc={};UI.swp=0;UI.swb=0;UI.adj=false;UI.fresh=true;render();$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});});wrap.appendChild(b);});
      v.appendChild(wrap);}
  }
  var dh=el("div","sec-h day-h");dh.appendChild(el("h3",null,"Your day"));v.appendChild(dh);directiveCard(v);ctxBlock(v);
  askBlock(v);
  var fw=el("div","colophon");fw.appendChild(stamp());fw.appendChild(sprig("colo-sprig"));v.appendChild(fw);
  v.appendChild(el("p","fine","Plates are planned by AI (Google Gemini) from your choices and your day, and checked against your food rules on the way. What you type goes to Google Gemini; no names are sent. Numbers are estimates for the portion as served. General food guidance, not medical advice."));
  composer(v);
  UI.fresh=false;
}

/* ---------- 02 Builder ---------- */
function rebalance(r,key,d){
  var next=Math.max(5,Math.min(65,r[key]+d)),diff=next-r[key];if(!diff)return r;
  var o=Object.keys(r).filter(function(k){return k!==key;}),u={};for(var k in r)u[k]=r[k];u[key]=next;var rem=diff;
  o.forEach(function(k,i){var share=i===o.length-1?rem:Math.round(diff/o.length);u[k]=Math.max(5,r[k]-share);rem-=share;});
  var sum=u.protein+u.greens+u.carbs+u.fats;if(sum!==100)u[o[0]]+=100-sum;return u;
}
function renderBuild(){
  var v=$("v-build");v.textContent="";
  panelHead(v,"02 · Builder","Build the plate");
  if(blocked()){v.appendChild(blockedCard());return;}
  if(!UI.ratio)UI.ratio=C.ratio||MODEPLATE[C.mode];
  var pr=el("div","presets four");pr.setAttribute("role","radiogroup");
  [["mode",lab("mode",C.mode),MODEPLATE[C.mode]],["balanced","Balanced",PRESETS.balanced],["post","Post-training",PRESETS.post],["steady","Steady sugar",PRESETS.steady]].forEach(function(x){
    var b=btn("preset",x[1],null,"preset-"+x[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",UI.preset===x[0]?"true":"false");
    b.addEventListener("click",function(){UI.preset=x[0];UI.ratio=x[2];render();});pr.appendChild(b);});
  v.appendChild(pr);
  var R=UI.ratio,c=el("article","card bigplate"),sh={veg:R.greens/100,pro:R.protein/100,grain:R.carbs/100,side:R.fats/100};
  var rg=ring(sh,"Plate ratio: protein "+R.protein+"%, vegetables "+R.greens+"%, carbs "+R.carbs+"%, fats "+R.fats+"%","build");
  var t=PL?PL.target:null,mid=el("div","ringmid");if(t){mid.appendChild(el("b",null,String(t.kcal)));mid.appendChild(el("small",null,"kcal · "+t.protein+"\u00A0g protein"));}else mid.appendChild(el("small",null,"by plate"));
  var rw=el("div","ringwrap");add(rw,rg,mid);
  var stp=el("div","steppers");
  [["protein","Protein","pro"],["greens","Vegetables and greens","veg"],["carbs","Slow carbs","grain"],["fats","Fats and seeds","side"]].forEach(function(x){
    var row=el("div","stp"),sw=el("i");sw.style.background=RINGC[x[2]];var tx=el("div");tx.appendChild(el("b",null,x[1]));
    var ctr=el("div","ctr"),mn=btn(null,null,"minus","st-"+x[0]+"-m"),out=el("output",null,R[x[0]]+"%"),pl=btn(null,null,"plus","st-"+x[0]+"-p");
    mn.setAttribute("aria-label","Less "+x[1].toLowerCase());pl.setAttribute("aria-label","More "+x[1].toLowerCase());
    mn.addEventListener("click",function(){UI.ratio=rebalance(UI.ratio,x[0],-5);UI.preset="";render();});pl.addEventListener("click",function(){UI.ratio=rebalance(UI.ratio,x[0],5);UI.preset="";render();});
    add(ctr,mn,out,pl);add(row,sw,tx,ctr);stp.appendChild(row);});
  add(c,rw,stp);v.appendChild(c);
  if(t)v.appendChild(el("p","fine","Target for this "+mealName(C.meal).toLowerCase()+", after what you've eaten today: about "+t.kcal+"\u00A0kcal and "+t.protein+"\u00A0g protein. Gemini fills in the grams."));
  var mk=btn("btn primary","Plan "+mealName(C.meal).toLowerCase()+" with this plate","spark","make-ratio");
  mk.addEventListener("click",function(){C.ratio={protein:UI.ratio.protein,greens:UI.ratio.greens,carbs:UI.ratio.carbs,fats:UI.ratio.fats};STORE.shown[C.meal]=null;save();show("plate");makePlates("");});
  v.appendChild(mk);
  if(C.ratio){var cl=btn("linkbtn","Go back to plates by mode",null,"clear-ratio");cl.addEventListener("click",function(){C.ratio=null;UI.ratio=null;STORE.shown[C.meal]=null;save();render();});v.appendChild(cl);}
  var m=curMeal(),inst=el("article","inst"),ih=el("div","inst-h"),hl=el("div");hl.appendChild(el("p","cap","After-meal curve"));
  if(!m){hl.appendChild(el("p","tsub","Plan a plate first. Its curve shows here."));ih.appendChild(hl);inst.appendChild(ih);v.appendChild(inst);return;}
  var vw=viewOf(m),rs=riseOf(vw.n,UI.hab);hl.appendChild(el("p","tsub",vw.title));ih.appendChild(hl);ih.appendChild(el("span","risev "+bandCls(rs.band),rs.band));
  var cbox=el("div","curvebox"),cv=curve("b",rs);cbox.appendChild(cv);
  [["Sharp",30],["Moderate",62],["Gentle",88]].forEach(function(x){var s=el("span","cb-lab",x[0]);s.style.top=(x[1]/126*100)+"%";s.setAttribute("aria-hidden","true");cbox.appendChild(s);});
  var axl=el("div","cb-ax");axl.setAttribute("aria-hidden","true");["Meal","+1 h","+2 h","+3 h"].forEach(function(t){axl.appendChild(el("span",null,t));});
  add(inst,ih,cbox,axl);
  var lg=el("div","inst-lg"),a1=el("span"),a2=el("span");a1.appendChild(el("i","l-act"));a1.appendChild(document.createTextNode("with your habits"));a2.appendChild(el("i","l-raw"));a2.appendChild(document.createTextNode("carbs first, sitting after"));add(lg,a1,a2);inst.appendChild(lg);
  var hb=el("div","habits");
  [["veg","Vegetables first","eat them before the rest"],["walk","15-minute walk","right after the meal"],["lemon","Lemon or vinegar","in a salad, as a starter"]].forEach(function(x){
    var b=el("button","hab");b.type="button";b.id="hab-"+x[0];setPressed(b,UI.hab[x[0]]);b.appendChild(el("span",null,x[1]));b.appendChild(el("small",null,x[2]));
    b.addEventListener("click",function(){UI.hab[x[0]]=!UI.hab[x[0]];render();});hb.appendChild(b);});
  inst.appendChild(hb);v.appendChild(inst);
  v.appendChild(el("p","fine","The curve is a model of direction, not a blood-sugar reading. It moves with carbs, fibre, protein and fat, and with the habits above."));
}

/* ---------- 03 Rescue: read the menu (before ordering, docs/FEATURE-menu.md) and name the dish (already chosen) ---------- */
var DISHES=["Andhra mutton biryani","Pahadi mutton rara with 2 butter rotis","Peri-peri half chicken with spicy rice","Paneer butter masala with 2 butter naan","Chole bhature","Veg biryani with raita","Masala dosa with chutney","A slice of tiramisu after dinner"];
function shrink(file,cb,max){
  var img=new Image(),url=URL.createObjectURL(file);img.onload=function(){var s=Math.min(1,(max||1024)/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);cb(c.toDataURL("image/jpeg",.82).split(",")[1]);};img.onerror=function(){cb(null);};img.src=url;
}
/* Rescue: after a tap, what comes back is shown where the person can see it (on small phones it starts below the fold) */
function revealOut(){setTimeout(function(){var v=$("v-rescue"),s=$("scroll");if(!v||v.hidden||!s)return;var kids=[].slice.call(v.children),t=null,seen=false;
  for(var j=0;j<kids.length;j++){var k=kids[j];if(k.classList.contains("entries")){seen=true;continue;}if(!seen||k.classList.contains("sits")||k.classList.contains("menu-box"))continue;t=k;break;}
  if(!t)return;var r=t.getBoundingClientRect(),sr=s.getBoundingClientRect();if(r.top<sr.top+8||r.top>sr.top+sr.height*0.5)s.scrollTo({top:Math.max(0,s.scrollTop+r.top-sr.top-12),behavior:RM?"auto":"smooth"});},60);}
function rescue(text,image){
  if(UI.rbusy||UI.mbusy)return;UI.rbusy=true;UI.rerr="";UI.rkeep="";UI.rretry=false;UI.merr="";UI.mres=null;UI.mopen=false;UI.rtext=text||"Photo of the menu";render();revealOut();
  var body={profile:profileOut(),ctx:{meal:C.meal,time:clockText(),text:text||"",photo:!!image,appetite:appetite()},file:fileOut()};if(image)body.image=image;
  api("/api/rescue",body,function(s,j){UI.rbusy=false;setTimeout(revealOut,0);
    if(s===200&&j.status==="ok"){UI.rres=j;UI.rmoves={};(j.hacks||[]).slice(0,1).forEach(function(h,i){UI.rmoves[i]=true;});}
    else if(s===200&&j.status==="refer"){UI.rres={status:"refer",read:j.read};}
    else if(s===200){UI.rerr="That didn't come back as a dish that fits your food rules. Try naming it differently.";UI.rkeep=text||"";}
    else{UI.rerr=errText(j.code);UI.rkeep=text||"";UI.rretry=RETRY(j.code);}
    render();});
}
/* The menu, as a photo or as typed text. The server reads, checks and ranks; the page only shows what came back. */
function readMenu(text,image){
  if(UI.mbusy||UI.rbusy)return;refresh();var meal=C.meal,tg=PL?PL.target:null;
  UI.mbusy=true;UI.mlast={t:text||"",i:image||null};UI.merr="";UI.mundo=false;UI.rerr="";UI.mres=null;UI.rres=null;UI.rtext="";UI.mopen=false;UI.mtext=text||"";render();revealOut();
  var body={profile:profileOut(),ctx:{meal:meal,time:clockText(),hour:meal===CLOCK?Math.round(hr*100)/100:null,dayNo:dayNo(),mode:C.mode,appetite:appetite(),text:text||""},file:fileOut()};if(image)body.image=image;
  api("/api/menu",body,function(s,j){UI.mbusy=false;setTimeout(revealOut,0);
    if(s===200&&j.status==="ok"&&j.orders&&j.orders.length){UI.mres={meal:meal,target:tg,place:j.place||"",orders:j.orders,leave:j.leave||[],tip:j.tip||"",hooks:j.hooks||{},note:j.note||"",moves:j.moves||[],dropped:j.dropped||{}};UI.msel=0;UI.mmoves={};UI.mtext="";grainKey(meal,text,image);UI.mfull=JSON.parse(JSON.stringify(UI.mres));UI.mundo=false;grainFilter();}
    else if(s===200&&j.status==="refer")UI.mres={status:"refer",read:j.read};
    else{UI.mretry=s!==200&&RETRY(j.code);UI.merr=s!==200?errText(j.code):j.status==="unreadable"?"Next Plate couldn't read that menu. Try a clearer photo, or type the dishes.":"No dish on that menu passed the checks for you. Try another page of the menu, or name the dish you want.";UI.mopen=!!text;}
    render();});
}
/* Rounds 29-30: the grains the person said are not available, kept for this menu and this meal only (a new menu or meal starts afresh);
   a two-grain order asks about each grain in turn; "Change answer" undoes a No as well as a Yes. */
function grainParts(g){return String(g||"").split(/\s+and\s+/).filter(Boolean);}
function grainPlural(g){return / and /.test(g)||/(?:s|bhature)$/.test(g)&&!/(?:rice|dals?)$/.test(g);}
function grainGone(g){UI.mno=UI.mno||[];return grainParts(g).some(function(x){return UI.mno.indexOf(x)>=0;});}
function grainKey(meal,t,i){var si=String(i||""),hs=0;for(var q=0;q<si.length;q+=Math.max(1,Math.floor(si.length/997)))hs=(hs*31+si.charCodeAt(q))|0;var k=meal+"|"+(t||("photo:"+si.length+":"+hs));if(UI.mkey!==k){UI.mkey=k;UI.mno=[];UI.myes={};}}
function grainFilter(){var r=UI.mres;if(!r||!r.orders)return;var keep=r.orders.filter(function(x){return !x.grain||!grainGone(x.grain);});
  if(keep.length){if(keep.length<r.orders.length){r.orders=keep;UI.msel=0;}return;}
  grainNone();}
function grainNone(){var g=(UI.mno||[]).join(" and ");UI.mres=null;UI.mopen=false;UI.mundo=true;
  UI.merr="You said "+g+(grainPlural(g)?" are":" is")+" not available, and every order on this menu needs "+(UI.mno.length>1?"one of them":grainPlural(g)?"them":"it")+". Ask which roti or rice they have, then type your dish with it under \u201CAlready chosen? Name the dish\u201D.";}
function grainUndo(){UI.mno=[];UI.mundo=false;UI.merr="";if(UI.mfull){UI.mres=JSON.parse(JSON.stringify(UI.mfull));UI.msel=0;UI.mmoves={};}render();var q=$("order-grain-q")||$("order-card");if(q){if(q.id==="order-card")q.tabIndex=-1;q.focus();}}
function grainNo(g){UI.mno=UI.mno||[];if(UI.mno.indexOf(g)<0)UI.mno.push(g);var r=UI.mres;
  var keep=r.orders.filter(function(x){return !x.grain||!grainGone(x.grain);});
  if(!keep.length){grainNone();render();var n=document.querySelector("#v-rescue .note");if(n){n.tabIndex=-1;n.focus();n.scrollIntoView({block:"start",behavior:RM?"auto":"smooth"});}$("said").textContent=UI.merr;return;}
  r.orders=keep;UI.msel=0;UI.mmoves={};render();var nx=r.orders[0];$("said").textContent="Next order: "+nx.name+(nx["with"]?" with "+nx["with"]:"")+".";
  var q=$("order-grain-q")||$("order-card");if(q){if(q.id==="order-card")q.tabIndex=-1;q.focus();q.scrollIntoView({block:"start",behavior:RM?"auto":"smooth"});}}
function orderView(v,r){
  if(r.status==="refer"){var e=el("div","empty-card"),si=el("span","safe-ic");si.appendChild(ic("shield"));add(e,si,el("h2",null,r.read||SAFETY));v.appendChild(e);return;}
  if(UI.msel>=r.orders.length)UI.msel=0;
  var mn=mealName(r.meal).toLowerCase(),o=r.orders[UI.msel],a={},hab={veg:false,walk:false,lemon:false},moved=false;
  MENUK.forEach(function(k){a[k]=o.n[k];});
  r.moves.forEach(function(m,k){if(!UI.mmoves[k])return;moved=true;if(m.kind==="portion")a=scaleN(a,m.scale);if(m.kind==="sequence")hab.veg=true;if(m.kind==="move")hab.walk=true;});
  var fit=moved?fitOf(a,r.target):o.fit,band=moved?riseOf(a,hab).band:o.rise;
  if(UI.mno&&UI.mno.length){var gn0=UI.mno.join(" and "),gl=el("p","fine gno");gl.id="order-grain-said";gl.appendChild(document.createTextNode("You said "+gn0+(grainPlural(gn0)?" are":" is")+" not available. "));
    var gu0=btn("linkbtn","Change answer",null,"order-grain-redo");gu0.addEventListener("click",grainUndo);gl.appendChild(gu0);v.appendChild(gl);}   /* round 31: a No leaves a trace and can be undone */
  if(r.note){var nt=el("div","note");nt.setAttribute("role","note");nt.appendChild(ic("info"));nt.appendChild(el("p",null,r.note));v.appendChild(nt);}
  var card=el("article","card order");card.id="order-card";card.appendChild(el("p","cap",(r.note?"The closest order":"Your order")+" · "+mn));
  var top=el("div","hero-top");
  function chip(t,icon){var c=el("span","hchip fit");c.appendChild(ic(icon));c.appendChild(el("span",null,t));return c;}
  top.appendChild(chip(lab("diet",P.diet),"check"));P.leave.forEach(function(k){top.appendChild(chip("No "+lab("leave",k).toLowerCase(),"check"));});
  if(o.fit!=null)top.appendChild(chip("Fit\u00A0"+o.fit+(fit!==o.fit?"\u00A0→\u00A0"+fit:"")+"\u00A0/\u00A0100","target"));
  add(card,top,el("h3","dish",o.name));
  if(o.portion)card.appendChild(el("p","por",o.portion));
  if(o["with"]){var w=el("p","owith");w.appendChild(el("span","cap","with"));w.appendChild(document.createTextNode(" "+o["with"]));card.appendChild(w);}
  if(o.ask)card.appendChild(el("p","oask","Ask: "+o.ask));
  var rd=el("div","read4 six");
  function cell(cap,val,unit,cls){var d=el("div","tcard");d.appendChild(el("p","cap",cap));var x=el("span","v"+(cls?" "+cls:""));if(unit)x.appendChild(el("i","apx","≈"));x.appendChild(el("span","mono",val));if(unit)x.appendChild(el("small",null,unit));d.appendChild(x);return d;}
  add(rd,cell("Energy",String(a.kcal),"kcal"),cell("Protein",String(a.protein),"g"),cell("Rise",band,null,bandCls(band)));var rw=el("div","rw ord");rw.appendChild(rd);card.appendChild(rw);
  var tags=(o.planned||[]).map(function(id){return r.hooks[id];}).filter(Boolean);
  if(tags.length){var pa=el("p","planned");pa.id="order-planned";pa.appendChild(document.createTextNode("planned around: "));tags.forEach(function(t,i){if(i)pa.appendChild(document.createTextNode(" · "));pa.appendChild(el("span",null,t));});card.appendChild(pa);}
  var go=btn("btn primary","I'll order this","check","order-go");
  go.addEventListener("click",function(){clearSlot(r.meal);logEv("ordered",{title:o.name+(o["with"]?" with "+o["with"]:""),kcal:a.kcal,protein:a.protein,carbs:a.carbs,fats:a.fats,fiber:a.fiber,planned:o.planned||[]},r.meal);
    UI.mres=null;UI.mtext="";C.meal=r.meal;show("plate");toast("Counted for "+mn+". The rest of the day follows it.");});
  /* Round 28 (owner decision): with diabetes the plan keeps a grain. When the grain is a side or part of the portion, the person
     confirms it is available before ordering; "No" moves to the next order with another grain, or back to the menu. */
  /* Round 29: answers are kept by the grain's name for this session, so "Also on this menu" and a fresh read of the menu do not ask
     again or bring back a grain the person said is not there. */
  UI.myes=UI.myes||{};
  var gpend=grainParts(o.grain).filter(function(x){return !UI.myes[x];}),gnow=gpend[0];
  if(gnow){var gq=el("div","confirm gask");gq.id="order-grain";gq.setAttribute("role","group");gq.setAttribute("aria-labelledby","order-grain-q");
    var gt=el("p","gq",(grainPlural(gnow)?"Are ":"Is ")+gnow+" available now?");gt.id="order-grain-q";gt.tabIndex=-1;
    var gn=el("p","fine","Your plan keeps a grain with this meal. Ask before you order.");
    var gy=btn("btn","Yes","check","order-grain-yes"),gx=btn("btn","No","x","order-grain-no"),ga=el("div","pick-acts");add(ga,gy,gx);
    gy.addEventListener("click",function(){UI.myes[gnow]=true;render();var b=$("order-grain-q")||$("order-go");if(b)b.focus();});
    gx.addEventListener("click",function(){grainNo(gnow);});
    add(gq,gt,gn,ga);card.appendChild(gq);}
  else{if(o.grain){var gc=el("p","fine gok");gc.id="order-grain-ok";gc.appendChild(document.createTextNode(o.grain.charAt(0).toUpperCase()+o.grain.slice(1)+": available, you checked. "));
      var gu=btn("linkbtn","Change answer",null,"order-grain-undo");gu.addEventListener("click",function(){grainParts(o.grain).forEach(function(x){delete UI.myes[x];});render();var q=$("order-grain-q");if(q)q.focus();});gc.appendChild(gu);card.appendChild(gc);}
    card.appendChild(go);}
  v.appendChild(card);
  if(r.moves.length){var mh=el("div","sec-h");mh.appendChild(el("h3",null,"The two moves that help most"));v.appendChild(mh);
    var mv=el("div","moves");r.moves.forEach(function(m,k){var b=el("button","move");b.type="button";b.id="order-move-"+k;setPressed(b,!!UI.mmoves[k]);var ii=el("i");ii.appendChild(ic("check"));
      var tx=el("span"),sc=m.kind==="portion"?scaleN(o.n,m.scale):null;tx.appendChild(document.createTextNode(m.title));
      tx.appendChild(el("small",null,sc?"≈\u00A0"+sc.kcal+"\u00A0kcal · ≈\u00A0"+sc.protein+"\u00A0g protein":"softens the rise"));add(b,ii,tx);
      b.addEventListener("click",function(){UI.mmoves[k]=!UI.mmoves[k];render();});mv.appendChild(b);});
    v.appendChild(mv);}
  if(r.orders.length>1){var ah=el("div","sec-h");ah.appendChild(el("h3",null,"Also on this menu"));v.appendChild(ah);
    var wrap=el("div","alts");r.orders.forEach(function(x,i){if(i===UI.msel)return;var b=el("button","alt menu");b.type="button";b.id="order-alt-"+i;
      var tx=el("span");tx.appendChild(el("b",null,x.name));tx.appendChild(el("small",null,(x["with"]?"with "+x["with"]+" · ":"")+"≈\u00A0"+x.n.kcal+"\u00A0kcal · ≈\u00A0"+x.n.protein+"\u00A0g protein"+(x.fit!=null?" · Fit\u00A0"+x.fit+"\u00A0/\u00A0100":"")));
      add(b,tx,ic("chev"));b.addEventListener("click",function(){logEv("chosen",{title:x.name,from:"menu"},r.meal);UI.msel=i;UI.mmoves={};render();$("order-card").scrollIntoView({block:"start",behavior:RM?"auto":"smooth"});});wrap.appendChild(b);});
    v.appendChild(wrap);}
  if(r.leave.length){var lh=el("div","sec-h");lh.appendChild(el("h3",null,"Leave for another day"));v.appendChild(lh);
    var ul=el("ul","checks");ul.id="order-leave";r.leave.forEach(function(l){var li=el("li","no"),xi=el("i");xi.appendChild(ic("x"));var sp=el("span");sp.appendChild(el("b",null,l.name+". "));sp.appendChild(document.createTextNode(l.why));add(li,xi,sp);ul.appendChild(li);});v.appendChild(ul);}
  if(r.tip){var tp=el("p","tip");tp.id="order-tip";tp.appendChild(el("b",null,"How to eat it. "));tp.appendChild(document.createTextNode(r.tip));v.appendChild(tp);}
  var dn=r.dropped.diet||0;
  v.appendChild(el("p","fine",(r.place?"Read as: "+r.place+". ":"")+"Estimates for how this kind of place usually serves it. Kitchens vary."+(dn?" "+dn+(dn>1?" dishes on this menu did":" dish on this menu did")+" not pass your food rules, so "+(dn>1?"they are":"it is")+" not shown.":"")+" The menu is read by AI (Google Gemini); the checks and the ranking are done by code."));
}
function renderRescue(){
  var v=$("v-rescue");v.textContent="";
  panelHead(v,"03 · Rescue","Eating out anyway");
  if(blocked()){v.appendChild(blockedCard());return;}
  var mn=mealName(C.meal).toLowerCase(),ent=el("div","entries"),me=el("div","menu-in");me.appendChild(el("p","cap","At a restaurant or a function"));
  var mb=btn(UI.mopen?"btn":"btn primary","Read the menu","camera","mcam"),mf=el("input");mf.type="file";mf.accept="image/*";mf.hidden=true;mf.id="mfile";
  mb.addEventListener("click",function(){mf.click();});
  mf.addEventListener("change",function(){var file=mf.files&&mf.files[0];if(!file)return;shrink(file,function(b){if(!b){UI.merr=errText("bad_image");render();return;}readMenu("",b);},1600);});
  var mt=btn("linkbtn","or type the menu",null,"mtype");mt.setAttribute("aria-expanded",UI.mopen?"true":"false");
  mt.addEventListener("click",function(){UI.mopen=!UI.mopen;render();if(UI.mopen)setTimeout(function(){var x=$("mtext");if(x)x.focus();},60);});
  var pn=el("p","fine","The photo goes to Google Gemini to read the dishes.");pn.id="photo-note";
  add(me,mb,pn,mt,mf);
  var f=el("form","rin");f.autocomplete="off";var rl=el("label","cap","Already chosen? Name the dish");rl.htmlFor="rin";var i=el("input");i.type="text";i.id="rin";i.maxLength=160;i.placeholder="for example, chole bhature";
  var go=el("button","send");go.type="submit";go.setAttribute("aria-label","Rescue this dish");go.appendChild(ic("send"));
  f.addEventListener("submit",function(e){e.preventDefault();var t=i.value.trim();if(t)rescue(t,null);});
  var rrow=el("div","rin-row");add(rrow,i,go);add(f,rl,rrow,el("p","fine","What you type goes to Google Gemini."));if(UI.rerr&&UI.rkeep)i.value=UI.rkeep;add(ent,me);v.appendChild(ent);
  if(UI.mopen&&!UI.mbusy){
    var bx=el("form","menu-box"),ta=el("textarea");ta.id="mtext";ta.maxLength=2000;ta.rows=7;ta.placeholder="Paste or type the menu. One dish per line.";var tn=el("p","fine","The menu goes to Google Gemini to read the dishes.");ta.value=UI.mtext||"";ta.setAttribute("aria-label","The menu, typed or pasted");
    ta.addEventListener("input",function(){UI.mtext=ta.value;});
    var rdm=btn("btn primary","Read this menu for "+mn,"spark","mgo");rdm.type="submit";
    bx.addEventListener("submit",function(e){e.preventDefault();var t=ta.value.trim();if(t.length>2)readMenu(t,null);});
    add(bx,ta,tn,rdm);me.appendChild(bx);
  }else{
    var ch=el("div","sits");DISHES.filter(function(d){return !crosses(d,P);}).forEach(function(d,k){var b=btn("sit",d,null,"dish-"+k);b.setAttribute("aria-pressed",UI.rtext===d?"true":"false");b.addEventListener("click",function(){rescue(d,null);});ch.appendChild(b);});
    v.appendChild(ch);
  }
  ent.appendChild(f);
  if(UI.mbusy){v.appendChild(waitCard("Reading the menu for your "+mn,"The menu is being read"));return;}
  if(UI.rbusy){var w=el("article","inst");w.appendChild(el("p","ans-read wait","Taking apart "+UI.rtext.toLowerCase()));v.appendChild(w);return;}
  [UI.merr,UI.rerr].forEach(function(t,k){if(!t)return;var n=el("div","note");n.appendChild(ic("info"));var tx=el("div");tx.appendChild(el("p",null,t));
    if(k===1&&UI.rretry&&UI.rkeep){var tb=btn("btn","Try again","refresh","rescue-retry");tb.addEventListener("click",function(){var x=UI.rkeep;UI.rerr="";rescue(x,null);});tx.appendChild(tb);}
    if(k===0&&UI.mundo){var ub=btn("linkbtn","Change answer",null,"menu-grain-undo");ub.addEventListener("click",grainUndo);tx.appendChild(ub);}
    if(k===0&&UI.mlast&&UI.mretry&&(UI.mlast.t||UI.mlast.i)){var mb2=btn("btn","Try again","refresh","menu-retry");mb2.addEventListener("click",function(){var x=UI.mlast;UI.merr="";readMenu(x.t,x.i);});tx.appendChild(mb2);}
    n.appendChild(tx);v.appendChild(n);});
  if(UI.mres){orderView(v,UI.mres);return;}
  var r=UI.rres;
  if(!r){v.appendChild(el("p","fine","Before you order, read the menu: you get one order for your "+mn+", and the reason. Already chosen? Name the dish and see the two or three moves that make it fit your day"+(PL&&FILE.today.kcal>0?": "+PL.left.kcal+"\u00A0kcal and "+PL.left.protein+"\u00A0g protein are left today.":".")));return;}
  if(r.status==="refer"){var e=el("div","empty-card"),s=el("span","safe-ic");s.appendChild(ic("shield"));add(e,s,el("h2",null,r.read||SAFETY));v.appendChild(e);return;}
  var d=r.dish,a={kcal:d.kcal,protein:d.protein,carbs:d.carbs,fats:d.fats,fiber:d.fiber},hab={veg:false,walk:false,lemon:false};
  r.hacks.forEach(function(h,k){if(!UI.rmoves[k])return;a.kcal+=h.deltaKcal;a.protein+=h.deltaProtein;a.carbs+=h.deltaCarbs;a.fats+=h.deltaFats;a.fiber+=h.deltaFiber;if(h.kind==="sequence")hab.veg=true;if(h.kind==="move")hab.walk=true;});
  ["kcal","protein","carbs","fats","fiber"].forEach(function(k){a[k]=Math.max(k==="protein"||k==="fiber"?0:Math.round(d[k]*.4),Math.round(a[k]));});
  var r0=riseOf(d,null),r1=riseOf(a,hab),tg=PL?PL.target:null,f0=fitOf(d,tg),f1=fitOf(a,tg);
  var inst=el("article","inst"),ih=el("div","inst-h"),hl=el("div");
  hl.appendChild(el("span","dish",d.name));hl.appendChild(el("span","dish-s",[d.portion,d.warning].filter(Boolean).join(" · ")));ih.appendChild(hl);inst.appendChild(ih);
  if(d.breakdown)inst.appendChild(el("p","tsub",d.breakdown));
  var cmp=el("div","cmp"),mx=Math.max(d.kcal,a.kcal,1),NB={Energy:"ink",Protein:"pro",Carbs:"grain",Fats:"side"};
  function row(label,b0,b1,unit,max,warnUp){var rw=el("div","cmp-row");rw.appendChild(el("span","lab",label));var bars=el("div","cmp-bars"),i0=el("i","b0"),i1=el("i","b1 nb-"+(NB[label]||"ink"));i0.style.width=Math.round(b0/max*100)+"%";i1.style.width=Math.round(b1/max*100)+"%";add(bars,i0,i1);rw.appendChild(bars);
    var val=el("span","val");if(b0!==b1){val.appendChild(el("s",null,String(b0)));var dr=el("span","dir",b1>b0?" ↑ ":" ↓ ");dr.setAttribute("aria-hidden","true");val.appendChild(dr);val.appendChild(el("span","said",b1>b0?" up to ":" down to "));}var fu=el("span","fu");fu.appendChild(document.createTextNode(String(b1)));fu.appendChild(el("small",null,"\u00A0"+unit));val.appendChild(fu);rw.appendChild(val);cmp.appendChild(rw);}
  row("Energy",d.kcal,a.kcal,"kcal",mx,true);row("Protein",d.protein,a.protein,"g",Math.max(d.protein,a.protein,1));row("Carbs",d.carbs,a.carbs,"g",Math.max(d.carbs,a.carbs,1),true);row("Fats",d.fats,a.fats,"g",Math.max(d.fats,a.fats,1),true);
  inst.appendChild(cmp);
  var sumr=el("p","tsub");sumr.appendChild(document.createTextNode("Rise: "));sumr.appendChild(el("b",bandCls(r0.band),r0.band));if(r1.band!==r0.band){sumr.appendChild(document.createTextNode(" → "));sumr.appendChild(el("b",bandCls(r1.band),r1.band));}
  if(f0!=null){sumr.appendChild(document.createTextNode(" · Fit\u00A0"+f0+(f1!==f0?"\u00A0→\u00A0"+f1:"")+"\u00A0/\u00A0100"));}
  inst.appendChild(sumr);v.appendChild(inst);
  var mh=el("div","sec-h");mh.appendChild(el("h3",null,"Moves that make it fit"));v.appendChild(mh);
  var mv=el("div","moves");r.hacks.forEach(function(h,k){var b=el("button","move");b.type="button";b.id="move-"+k;setPressed(b,!!UI.rmoves[k]);var ii=el("i");ii.appendChild(ic("check"));
    var tx=el("span");tx.appendChild(document.createTextNode(h.title));var bits=[];if(h.deltaKcal)bits.push((h.deltaKcal>0?"+":"")+h.deltaKcal+"\u00A0kcal");if(h.deltaProtein)bits.push((h.deltaProtein>0?"+":"")+h.deltaProtein+"\u00A0g protein");if(h.kind==="sequence"||h.kind==="move")bits.push("softens the rise");
    if(bits.length)tx.appendChild(el("small",null,bits.join(" · ")));add(b,ii,tx);b.addEventListener("click",function(){UI.rmoves[k]=!UI.rmoves[k];render();});mv.appendChild(b);});
  v.appendChild(mv);
  var had=btn("btn primary","I had this, for "+mealName(C.meal).toLowerCase(),"check","rescue-had");
  had.addEventListener("click",function(){clearSlot(C.meal);logEv("rescued",{title:d.name,kcal:a.kcal,protein:a.protein,carbs:a.carbs,fats:a.fats,fiber:a.fiber});UI.rres=null;UI.rtext="";show("plate");toast("Counted for "+mealName(C.meal).toLowerCase()+". The rest of the day follows it.");});
  v.appendChild(had);
  v.appendChild(el("p","fine","Numbers are estimates for the dish as usually served. Restaurants vary."));
}

/* ---------- sheets: my food, how targets are worked out, logging another meal ---------- */
var SHEETFROM=null;
function behind(on){["scroll","tabs"].forEach(function(id){var x=$(id);if(!x)return;if(on){x.setAttribute("inert","");x.setAttribute("aria-hidden","true");}else{x.removeAttribute("inert");x.removeAttribute("aria-hidden");}});var t=document.querySelector(".top");if(t){if(on)t.setAttribute("inert","");else t.removeAttribute("inert");}}
var _toast=toast;toast=function(t,warn){var u=document.querySelector("#toast use");if(u)u.setAttribute("href",warn?"#i-info":"#i-check");_toast(t);};
function openSheet(kind){SHEETFROM=document.activeElement;UI.sheet=kind;$("sheet").hidden=false;behind(true);renderSheet();setTimeout(function(){var d=$("sheet-done");if(d)d.focus({preventScroll:true});},30);}
function closeSheet(){UI.sheet="";UI.wipe=false;$("sheet").hidden=true;behind(false);if(SHEETFROM&&SHEETFROM.focus)try{SHEETFROM.focus({preventScroll:true});}catch(e){}SHEETFROM=null;}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&UI.sheet)closeSheet();});
function sheetHead(c,title,doneLabel,onDone){c.appendChild(el("div","grab"));var h=el("div","sheet-h"),t=el("h2",null,title);t.id="sheet-title";c.setAttribute("aria-labelledby","sheet-title");h.appendChild(t);var dn=btn(doneLabel==="Close"?"btn":"btn primary",doneLabel||"Done",null,"sheet-done");dn.style.minHeight="44px";dn.style.padding="0 20px";dn.addEventListener("click",onDone);h.appendChild(dn);c.appendChild(h);}
function logOther(text,image){
  if(UI.lbusy)return;UI.lbusy=true;UI.lerr="";UI.ltext=text;renderSheet();
  var body={profile:profileOut(),ctx:{meal:C.meal,time:clockText(),text:text||"",photo:!!image}};if(image)body.image=image;
  api("/api/log",body,function(s,j){UI.lbusy=false;
    if(s===200&&j.status==="ok")UI.lres=j;else if(s===200){UI.lretry=false;UI.lerr="That didn't read as a meal. Say it the way you'd tell a friend: “2 aloo paratha with curd”.";}else{UI.lretry=RETRY(j.code);UI.lerr=errText(j.code);}
    if(UI.sheet==="log")renderSheet();});
}
function renderSheet(){
  var sh=$("sheet");sh.textContent="";var c=el("div","sheet-card");c.setAttribute("role","dialog");c.setAttribute("aria-modal","true");
  if(UI.sheet==="targets"){
    c.setAttribute("aria-label","How your targets are worked out");sheetHead(c,"How these numbers are worked out","Close",closeSheet);
    var d=PL?PL.day:null;if(d){var ul=el("ul","checks");d.notes.forEach(function(nn){var li=el("li","ok"),i=el("i");i.appendChild(ic("check"));var s=el("span");s.appendChild(el("b",null,nn[0]+" "));s.appendChild(document.createTextNode(nn[1]));add(li,i,s);ul.appendChild(li);});c.appendChild(ul);
      c.appendChild(el("p","fine","Every figure is an estimate from standard formulas and published guidelines, set for your age, body and goal. Your coach can change them. They are not a medical prescription."));}
    sh.appendChild(c);return;}
  if(UI.sheet==="log"){
    c.setAttribute("aria-label","What did you have");sheetHead(c,"What did you have for "+mealName(C.meal).toLowerCase()+"?","Close",closeSheet);
    if(!UI.lres){
      var f=el("form","rin");f.autocomplete="off";var i=el("input");i.type="text";i.id="login";i.maxLength=200;i.placeholder="2 aloo paratha with curd";i.value=UI.ltext||"";i.setAttribute("aria-label","What you ate");
      var go=el("button","send");go.type="submit";go.setAttribute("aria-label","Estimate it");go.appendChild(ic("send"));
      f.addEventListener("submit",function(e){e.preventDefault();var t=i.value.trim();if(t)logOther(t,null);});add(f,i,go);c.appendChild(f);
      if(UI.lbusy)c.appendChild(el("p","ans-read wait","Working out what that adds up to"));
      if(UI.lerr){var n=el("div","note"),nt=el("div");n.appendChild(ic("info"));nt.appendChild(el("p",null,UI.lerr));
        if(UI.ltext&&UI.lretry){var lb=btn("btn","Try again","refresh","log-retry");lb.addEventListener("click",function(){UI.lerr="";logOther(UI.ltext,null);});nt.appendChild(lb);}
        n.appendChild(nt);c.appendChild(n);}
      c.appendChild(el("p","fine","Say it the way you'd tell a friend. It is counted, not judged, and the rest of your day adjusts. What you type goes to Google Gemini."));
      sh.appendChild(c);setTimeout(function(){var x=$("login");if(x&&!UI.lbusy)x.focus();},60);return;}
    var r=UI.lres;c.appendChild(el("h3","dish",r.title));
    var ul2=el("ul","measures");r.items.forEach(function(it){var li=el("li"),qy=el("span","qty g");qy.appendChild(document.createTextNode(String(it.grams)));qy.appendChild(el("small",null,"g"));var fd=el("span","food");fd.appendChild(el("b",null,it.food));add(li,qy,fd);ul2.appendChild(li);});c.appendChild(ul2);
    c.appendChild(el("p","tsub","≈\u00A0"+r.kcal+"\u00A0kcal · "+r.protein+"\u00A0g protein · "+r.carbs+"\u00A0g carbs · "+r.fats+"\u00A0g fats · "+r.fiber+"\u00A0g fibre (an estimate)"));
    if(r.assumed)c.appendChild(el("p","fine","Assumed: "+r.assumed));
    var row=el("div","pick-acts"),fix=btn("btn","Not quite",null,"log-fix");fix.addEventListener("click",function(){UI.lres=null;renderSheet();});
    var ok=btn("btn primary","Yes, count it","check","log-ok");ok.addEventListener("click",function(){clearSlot(C.meal);logEv("other",{title:r.title,text:UI.ltext,kcal:r.kcal,protein:r.protein,carbs:r.carbs,fats:r.fats,fiber:r.fiber});UI.lres=null;closeSheet();render();$("scroll").scrollTop=0;toast("Counted. The rest of the day follows it.");});
    add(row,fix,ok);c.appendChild(row);sh.appendChild(c);return;}
  c.setAttribute("aria-label","My food");
  sheetHead(c,"My food","Done",function(){STORE.res={};STORE.shown={};UI.rres=null;UI.mres=null;save();closeSheet();render();});
  function again(soft){if(!soft)renderSheet();}
  goalQs(c,again);foodQs(c,again);healthQs(c,again);bodyQs(c,again);
  var dq=el("div","qs data");dq.appendChild(el("h2",null,"Your data"));
  dq.appendChild(el("p",null,"Your answers and your food record are kept on this phone. There is no account, and no name is sent."));
  dq.appendChild(el("p",null,"Each time Next Plate plans a plate (also when you open it), counts a meal you typed, rescues a dish or reads a menu, Google Gemini receives your answers, your meals from the last few days, what you type, and any menu photo, so it can plan for you."));
  if(!UI.wipe){var wb=btn("btn danger-link","Remove my data from this phone",null,"wipe");wb.addEventListener("click",function(){UI.wipe=true;renderSheet();var x=$("wipe-keep");if(x)x.focus({preventScroll:true});});dq.appendChild(wb);}
  else{var cf=el("div","confirm");cf.setAttribute("role","alertdialog");cf.setAttribute("aria-labelledby","wipe-q");var q=el("p",null,"Remove your answers, your food record and today's plates from this phone? This cannot be undone.");q.id="wipe-q";cf.appendChild(q);
    var kr=el("div","pick-acts"),kp=btn("btn","Keep my data",null,"wipe-keep"),rm=btn("btn danger","Remove my data",null,"wipe-yes");
    kp.addEventListener("click",function(){UI.wipe=false;renderSheet();});
    rm.addEventListener("click",function(){try{localStorage.removeItem("np6");localStorage.removeItem("np5");sessionStorage.clear();}catch(e){}location.replace(location.pathname);});
    add(kr,kp,rm);cf.appendChild(kr);dq.appendChild(cf);}
  c.appendChild(dq);sh.appendChild(c);if(UI.wipe)setTimeout(function(){var q=$("wipe-q");if(q)q.scrollIntoView({block:"center",behavior:RM?"auto":"smooth"});},40);
}
$("sheet").addEventListener("click",function(e){if(e.target===$("sheet"))closeSheet();});
$("myfood").addEventListener("click",function(){openSheet("food");});
["plate","build","rescue"].forEach(function(v){$("tab-"+v).addEventListener("click",function(){show(v);});});
window.__np6={ev:function(){return EV;},file:function(){return FILE;},plan:function(){return PL;},hooks:function(){return HOOKS;}};
render();
})();
