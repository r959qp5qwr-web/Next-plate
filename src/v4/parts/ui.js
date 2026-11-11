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
  s.appendChild(area);s.appendChild(raw);s.appendChild(act);s.appendChild(dot);
  var to={a:r.idx,b:r.raw,tp:r.tp},from=PREVC[key]||to;PREVC[key]=to;
  function draw(a,b,tp){var pa=curvePts(a,tp),pb=curvePts(b,Math.max(30,tp-8));act.setAttribute("d",pathOf(pa));raw.setAttribute("d",pathOf(pb));
    area.setAttribute("d",pathOf(pa)+" L314,104 L6,104 Z");dot.setAttribute("cx",String(6+tp/180*308));dot.setAttribute("cy",String(curveY(a,tp,tp)));}
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
  main.appendChild(aring("hero",sh,nu.p+"g","protein",true,"Rough plate shares: "+Math.round(sh.veg*100)+" percent vegetables. About "+nu.p+" grams protein."));
  txt.appendChild(el("h2",null,m.n));txt.appendChild(el("p","sub",summary(v.items)));main.appendChild(txt);
  var rd=el("div","read4");
  function cell(cap,node,unit,cls){var d=el("div");d.appendChild(el("p","cap",cap));var x=el("span","v"+(cls?" "+cls:""));x.appendChild(node);if(unit)x.appendChild(el("small",null,unit));d.appendChild(x);return d;}
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
      add(b,ring(shares(xv.items),null,null,false,"Rough plate shares"),tx,ic("chev"));
      b.addEventListener("click",function(){sel=i;ADJ=false;FRESH=true;resetTune();render();if(LAYOUT==="phone")$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});});wrap.appendChild(b);});
    v.appendChild(wrap);}
  if(t.all.length>3){var mb=btn("linkbtn morebtn","Show three more plates","refresh","more");mb.addEventListener("click",function(){page++;sel=0;FRESH=true;resetTune();render();});v.appendChild(mb);}
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
