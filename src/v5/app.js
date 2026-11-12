/* ===== Next Plate v5: Plate, Builder, Rescue. Every meal is planned by Gemini (spec D1); the look is Raw Linen (D6a) ===== */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var $=function(id){return document.getElementById(id);};
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function ic(name){var s=document.createElementNS(NS,"svg");s.setAttribute("class","i");s.setAttribute("aria-hidden","true");var u=document.createElementNS(NS,"use");u.setAttribute("href","#i-"+name);s.appendChild(u);return s;}
function btn(cls,label,icon,id){var b=el("button",cls);b.type="button";if(id)b.id=id;if(icon)b.appendChild(ic(icon));if(label!=null)b.appendChild(el("span",null,label));return b;}
function add(p){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c)p.appendChild(c);}return p;}
function svgEl(tag,attrs){var n=document.createElementNS(NS,tag);for(var k in attrs)n.setAttribute(k,attrs[k]);return n;}
function setPressed(b,on,attr){b.setAttribute(attr||"aria-pressed",on?"true":"false");return b;}
var RM=false;try{RM=matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}

/* ---------- state ---------- */
var now=new Date(),hr=now.getHours()+now.getMinutes()/60;
var CLOCK=hr<4?"dinner":hr<11?"breakfast":hr<15.5?"lunch":hr<18.5?"snack":"dinner";
var MEALS=[["breakfast","Breakfast","sunrise"],["lunch","Lunch","sun"],["snack","Snack","cup"],["dinner","Dinner","moon"]];
var MODEICON={strength:"dumbbell",trek:"mountain",focus:"desk",rest:"moon"},MOODICON={best:"spark",quick:"bolt",protein:"dumbbell",comfort:"flame",light:"leaf"};
var DAY=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
var P={diet:null,health:null,region:"n",leave:[],sex:"",age:0,cm:0,kg:0,act:"",done:false};
var C={meal:CLOCK,mode:"focus",mood:"best",cuisine:"indian",prep:"home",oil:"min",appetite:5,ratio:null};
var LOG=[],STORE={day:DAY,res:{},shown:{}},KEYCODE="";
try{var raw=JSON.parse(localStorage.getItem("np5")||"null");if(raw){
  var rp=raw.p||{};["diet","health","region","sex","act"].forEach(function(k){if(lab(k,rp[k]))P[k]=rp[k];});
  if(Array.isArray(rp.leave))P.leave=rp.leave.filter(function(k){return !!lab("leave",k);});
  ["age","cm","kg"].forEach(function(k){if(+rp[k]>0)P[k]=Math.round(+rp[k]);});
  P.done=!!rp.done&&!!P.diet&&!!P.health;
  var rc=raw.c||{};["mode","mood","cuisine","prep","oil"].forEach(function(k){if(lab(k,rc[k]))C[k]=rc[k];});if(+rc.appetite>=1&&+rc.appetite<=10)C.appetite=+rc.appetite;
  if(Array.isArray(raw.log))LOG=raw.log.filter(function(l){return l&&l.day===DAY&&typeof l.title==="string";});
  if(raw.store&&raw.store.day===DAY&&raw.store.res)STORE=raw.store;
  if(typeof raw.k==="string")KEYCODE=raw.k;
}}catch(e){}
try{var qk=new URLSearchParams(location.search).get("k");if(qk){KEYCODE=qk.slice(0,80);history.replaceState(null,"",location.pathname);}}catch(e){}
function save(){try{
  var keys=Object.keys(STORE.res);if(keys.length>10)keys.sort(function(a,b){return STORE.res[a].at-STORE.res[b].at;}).slice(0,keys.length-10).forEach(function(k){delete STORE.res[k];});
  localStorage.setItem("np5",JSON.stringify({p:P,c:{mode:C.mode,mood:C.mood,cuisine:C.cuisine,prep:C.prep,oil:C.oil,appetite:C.appetite},log:LOG,store:STORE,k:KEYCODE}));}catch(e){}}
var UI={open:"",view:"plate",sel:0,alc:{},swp:0,swb:0,adj:false,busy:"",err:"",step:0,fresh:true,hab:{veg:false,walk:false,lemon:false},ratio:null,preset:"mode",
  rtext:"",rres:null,rbusy:false,rerr:"",rmoves:{}};
function blocked(){return P.done&&(P.health==="kidney"||P.health==="preg");}
function day(){return dayTargets(P);}
function target(){return mealTargets(day(),C.meal,C.appetite);}
function clockText(){var h=now.getHours(),m=now.getMinutes();return ((h%12)||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm");}
function mealName(k){return lab("meal",k);}
function profileOut(){return {diet:P.diet,health:P.health,region:P.region,leave:P.leave,sex:P.sex,age:P.age,cm:P.cm,kg:P.kg,act:P.act};}
function had(){return LOG.filter(function(l){return l.meal!==C.meal;}).map(function(l){return mealName(l.meal)+": "+l.title;});}
function ctxKey(){return [C.meal,C.mode,C.mood,C.cuisine,C.prep,C.oil,C.appetite<=3?"lo":C.appetite<=7?"mid":"hi",C.ratio?[C.ratio.protein,C.ratio.greens,C.ratio.carbs,C.ratio.fats].join("-"):""].join("|");}
function curKey(){return STORE.shown[C.meal]||ctxKey();}
function curRes(){return STORE.res[curKey()]||null;}
function lastForMeal(){var best=null;Object.keys(STORE.res).forEach(function(k){var r=STORE.res[k];if(r.meal===C.meal&&r.meals&&r.meals.length&&(!best||r.at>best.at))best=r;});return best;}

/* ---------- talking to the server ---------- */
var ERRS={not_set_up:"Meal planning isn't switched on yet.",limit_day:"That's today's limit for new plates. Your plates so far stay here.",limit_ip:"That's today's limit for new plates on this phone. Your plates so far stay here.",
  bad_key:"This link needs the code from your coach's message. Open the link they sent you.",photos_off:"Photos are switched off. Type the dish instead.",bad_image:"That photo didn't come through. Try a smaller one, or type the dish."};
function errText(code){return ERRS[code]||"Couldn't reach Next Plate just now.";}
function api(path,body,cb){
  body.key=KEYCODE;
  var done=false,ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort();},95000);
  fetch(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.json().then(function(j){return {s:r.status,j:j};},function(){return {s:r.status,j:{}};});})
    .then(function(x){clearTimeout(t);if(!done){done=true;cb(x.s,x.j||{});}},function(){clearTimeout(t);if(!done){done=true;cb(0,{code:"network"});}});
}
function makePlates(text){
  if(UI.busy)return;var key=text?"ask|"+C.meal+"|"+text.toLowerCase():ctxKey();
  UI.busy=text?"ask":"plates";UI.err="";render();
  var ctx={meal:C.meal,time:clockText(),mode:C.mode,mood:C.mood,cuisine:C.cuisine,prep:C.prep,oil:C.oil,appetite:C.appetite,had:had(),text:text||""};
  if(C.ratio)ctx.ratio=C.ratio;
  api("/api/meals",{profile:profileOut(),ctx:ctx},function(s,j){
    UI.busy="";
    if(s===200&&(j.status==="ok"||j.status==="refer")){
      STORE.res[key]={meal:C.meal,status:j.status,read:j.read||"",meals:j.meals||[],ask:text||"",at:Date.now()};STORE.shown[C.meal]=key;
      UI.sel=0;UI.alc={};UI.swp=0;UI.swb=0;UI.fresh=true;save();
    }else if(s===200&&j.status==="empty"){UI.err="Nothing that came back fit your food rules. Try again, or change a choice above.";}
    else UI.err=errText(j.code);
    render();if(UI.view==="plate"&&$("v-plate"))$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});
  });
}

/* ---------- motion helpers (from v4) ---------- */
var PREVN={},PREVR={},PREVC={};
function tw(id,val){var s=el("span","mono");s.id=id;var from=PREVN[id];PREVN[id]=val;
  if(from==null||from===val||RM){s.textContent=String(Math.round(val));return s;}
  var t0=performance.now();s.textContent=String(Math.round(from));
  requestAnimationFrame(function step(t){var k=Math.min(1,(t-t0)/420),e=1-Math.pow(1-k,3);s.textContent=String(Math.round(from+(val-from)*e));if(k<1)requestAnimationFrame(step);});return s;}

/* ---------- the plate: speckled stoneware with a clay rim (v4 thali, sized by grams) ---------- */
var TID=0;
function foodKind(t){
  t=(t||"").toLowerCase();
  if(/^lemon|lemon wedge/.test(t))return "lemon";
  if(/\b(milk|lassi|chaas|buttermilk|smoothie|shake)\b/.test(t))return "milk";if(/\b(chai|tea|coffee|kadha|broth|soup|rasam|kadhi)\b/.test(t))return /soup|rasam|broth|kadhi/.test(t)?"dal":"chai";
  if(/phulka|roti|chapati|naan|khakhra|toast|bread|pav|paratha|thepla|bhakri|pita|tortilla/.test(t))return "roti";
  if(/idli/.test(t))return "idli";if(/dosa|uttapam|chilla|cheela|pesarattu|crepe/.test(t))return "dosa";
  if(/egg|omelette/.test(t))return /bhurji|omelette|scramble/.test(t)?"bhurji":"egg";
  if(/curd rice/.test(t))return "rice";if(/khichdi|poha|upma|dalia|pulao|biryani|broken wheat|millet|quinoa|farro|freekeh|oats|porridge|tabbouleh|couscous/.test(t))return "yrice";if(/rice|noodle|soba|pasta/.test(t))return "rice";
  if(/salad|kachumber|cucumber|sticks|tomato|slaw|arugula/.test(t))return "salad";
  if(/curd|raita|dahi|hung|dip|chhena|yogurt|yoghurt|tzatziki|labneh|hummus/.test(t))return "curd";
  if(/paneer|tofu|halloumi|tempeh/.test(t))return "paneer";
  if(/rajma|chole|chana|lobia|chickpea|bean|lentil|edamame/.test(t))return "beans";
  if(/sprout|sundal/.test(t))return "sprouts";
  if(/chicken|fish|soya|mutton|prawn|rawas|surmai|salmon|kebab|tikka|keema|turkey/.test(t))return "curry";
  if(/dal|sambar|moong/.test(t))return "dal";
  if(/chutney|pesto|tadka|drizzle|dressing/.test(t))return "chutney";
  if(/fruit|guava|apple|orange|pear|banana|papaya|pomegranate|berries|mango/.test(t))return "fruit";
  if(/peanut|almond|walnut|nut|makhana|seed/.test(t))return "nuts";
  return "sabzi";
}
var FOODC={dal:"#D6A548",beans:"#8E4A2E",sabzi:"#7C8A45",curd:"#F7F1E4",paneer:"#C9784A",curry:"#A4532F",sprouts:"#B9B07A",chutney:"#6F7F3E",bhurji:"#DDB75A",milk:"#F7F1E4",chai:"#B88A60",salad:"#9AA867",rice:"#F6F0E2",yrice:"#E2C27A",roti:"#D9B888",idli:"#F7F1E4",dosa:"#D7A75C",egg:"#F7F1E4",fruit:"#D17E45",nuts:"#A9774B"};
function countOf(t){var m=/^(\d)\s/.exec(t||"")||/\((\d)\)/.exec(t||"")||/\b(\d)\s*(pieces|phulka|roti|rotis|idli|idlis|eggs|dosa)\b/i.exec(t||"");return m?Math.min(4,+m[1]):1;}
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
    s.appendChild(svgEl("path",{d:"M0,-9 C5,-4 5,4 0,9 C-5,4 -5,-4 0,-9 Z","class":"th-leaf",transform:"translate("+lx.toFixed(1)+","+ly.toFixed(1)+") rotate("+(ang*180/Math.PI+90).toFixed(1)+")"}));
  }
  var list=items.filter(function(it){var k=foodKind(it.food);return k!=="lemon"&&k!=="milk"&&k!=="chai";}).slice(0,6),n=list.length,lim=dial?.86:1;
  var R=(n<=1?0:n===2?44:n===3?48:n===4?50:54)*lim,maxr=(n<=1?54:n===2?36:n===3?33:n===4?30:26)*lim,around=n>=5?n-1:n;
  function dots(g,cx,cy,r,cols,count,sz,seed){for(var i=0;i<count;i++){var a=rnd(seed+i)*6.283,d=Math.sqrt(rnd(seed+i+50))*r*.78,c=svgEl("circle",{cx:String(cx+Math.cos(a)*d),cy:String(cy+Math.sin(a)*d),r:String(sz*(.7+rnd(seed+i+9)*.6))});c.style.fill=cols[i%cols.length];g.appendChild(c);}}
  list.forEach(function(it,i){
    var k=foodKind(it.food),v=Math.max(.55,Math.min(1.2,.72+(it.grams||120)/160*.22)),r=Math.round(maxr*Math.min(1,v)),cx=120,cy=120;
    if(n>1&&!(n>=5&&i===n-1)){var a=(-90+(n===2?-90:0)+i*360/around)*Math.PI/180;cx=120+Math.cos(a)*R;cy=120+Math.sin(a)*R;}else if(n>=5)r=Math.round(maxr*.85);
    var g=svgEl("g",{"class":"th-item"+(it.tag?" new":"")});g.style.transformOrigin=cx+"px "+cy+"px";g.style.animationDelay=(i*50)+"ms";
    function circ(x,y,rr,fill,cls){var c=svgEl("circle",{cx:String(x),cy:String(y),r:String(rr)});if(fill)c.style.fill=fill;if(cls)c.setAttribute("class",cls);g.appendChild(c);return c;}
    var cnt=countOf(it.food),j,fc=FOODC[k]||FOODC.sabzi;
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
function sprig(cls){
  var s=svgEl("svg",{viewBox:"0 0 120 60","class":"sprig "+(cls||""),"aria-hidden":"true"});
  s.appendChild(svgEl("path",{d:"M4,52 C30,40 60,30 116,8","class":"sp-stem"}));
  [[18,46,-30],[30,40,150],[42,36,-35],[54,31,150],[66,27,-38],[78,22,152],[90,18,-40],[102,13,150]].forEach(function(x){
    s.appendChild(svgEl("path",{d:"M0,0 C4,-5 13,-6 18,-3 C13,1 5,2 0,0 Z","class":"sp-leaf",transform:"translate("+x[0]+","+x[1]+") rotate("+x[2]+")"}));});
  return s;
}
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
  var t=svgEl("text",{"class":"st-txt"}),tp=svgEl("textPath",{href:"#stp",startOffset:"2%"});tp.textContent="NEXT PLATE · MADE FOR YOU · NEXT PLATE · MADE FOR YOU ·";t.appendChild(tp);s.appendChild(t);
  var m=svgEl("text",{x:"60",y:"57","text-anchor":"middle","class":"st-mid"});m.textContent="made";s.appendChild(m);
  var m2=svgEl("text",{x:"60",y:"73","text-anchor":"middle","class":"st-mid"});m2.textContent="today";s.appendChild(m2);
  return s;
}
/* rough plate shares, by grams and group */
function shares(items){var a={greens:0,protein:0,carbs:0,fats:0,other:0};items.forEach(function(it){a[it.group]+=it.grams||0;});var t=a.greens+a.protein+a.carbs+a.fats+a.other;
  if(!t)return {veg:0,pro:0,grain:0,side:0};return {veg:a.greens/t,pro:a.protein/t,grain:a.carbs/t,side:(a.fats+a.other)/t};}
function vegWord(f){return f>=.42?"About half":f>=.28?"A third":f>=.12?"A little":"None";}
var RINGC={veg:"var(--veg)",pro:"var(--pro)",grain:"var(--grain)",side:"var(--side)"};
function ring(sh,label,key){
  var s=svgEl("svg",{viewBox:"0 0 100 100","class":"ring",role:"img","aria-label":label||"Plate shares"});
  var R=40,Cc=2*Math.PI*R,sw=11,keys=["veg","pro","grain","side"].filter(function(k){return sh[k]>0.005;}),gap=keys.length>1?2.4:0;
  function circ(stroke,extra){var c=svgEl("circle",{cx:"50",cy:"50",r:String(R),fill:"none","stroke-width":String(sw)});c.style.stroke=stroke;if(extra)for(var k in extra)c.setAttribute(k,extra[k]);return c;}
  s.appendChild(circ("var(--track)"));var off=0,fin=[];
  keys.forEach(function(k){var len=Math.max(.5,sh[k]*Cc-gap);var c=circ(RINGC[k],{"class":"seg","stroke-dasharray":len+" "+(Cc-len),"stroke-dashoffset":String(-off),transform:"rotate(-90 50 50)"});s.appendChild(c);fin.push([c,len+" "+(Cc-len),String(-off)]);off+=sh[k]*Cc;});
  if(key){var prev=PREVR[key];PREVR[key]=fin.map(function(f){return [f[1],f[2]];});
    if(prev&&prev.length===fin.length&&!RM){fin.forEach(function(f,i){f[0].style.strokeDasharray=prev[i][0];f[0].style.strokeDashoffset=prev[i][1];});
      requestAnimationFrame(function(){requestAnimationFrame(function(){fin.forEach(function(f){f[0].style.strokeDasharray=f[1];f[0].style.strokeDashoffset=f[2];});});});}}
  return s;
}
/* the after-meal curve (v4), a band, never a number */
function curveY(A,tp,t){return 104-Math.min(A,86)*1.1*Math.pow((t/tp)*Math.exp(1-t/tp),1.8);}
function curvePts(A,tp){var out=[],t;for(t=0;t<=180;t+=3)out.push([6+t/180*308,curveY(A,tp,t)]);return out;}
function pathOf(pts){return pts.map(function(p,i){return (i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");}
function curve(key,r){
  var s=svgEl("svg",{viewBox:"0 0 320 126","class":"curve",role:"img","aria-label":"After-meal curve, a model of direction: "+r.band.toLowerCase()+"."});
  function band(y,h,cls){s.appendChild(svgEl("rect",{x:"6",y:String(y),width:"308",height:String(h),rx:"4","class":cls}));}
  band(71,33,"cb-g");band(49,22,"cb-m");
  s.appendChild(svgEl("line",{x1:"6",y1:"49",x2:"314",y2:"49","class":"c-th"}));
  [["GENTLE",99],["MODERATE",65],["SHARP",43]].forEach(function(x){var t=svgEl("text",{x:"312",y:String(x[1]),"text-anchor":"end","class":"c-lab"});t.textContent=x[0];s.appendChild(t);});
  s.appendChild(svgEl("line",{x1:"6",y1:"104",x2:"314",y2:"104","class":"c-base"}));
  [["Meal",6,"start"],["+1 h",108.7,"middle"],["+2 h",211.3,"middle"],["+3 h",314,"end"]].forEach(function(x){var t=svgEl("text",{x:String(x[1]),y:"120","text-anchor":x[2],"class":"c-ax"});t.textContent=x[0];s.appendChild(t);});
  var raw=svgEl("path",{"class":"c-raw"}),act=svgEl("path",{"class":"c-act"}),dot=svgEl("circle",{r:"4.5","class":"c-dot"}),lv=svgEl("g",{"class":"c-leaves"});
  add(s,raw,act,lv,dot);
  var to={a:r.idx,b:r.raw,tp:r.tp},from=PREVC[key]||to;PREVC[key]=to;
  function draw(a,b,tp){var pa=curvePts(a,tp),pb=curvePts(b,Math.max(30,tp-8));act.setAttribute("d",pathOf(pa));raw.setAttribute("d",pathOf(pb));
    while(lv.firstChild)lv.removeChild(lv.firstChild);
    for(var q=4;q<pa.length-2;q+=5){var p0=pa[q],p1=pa[q+1],an=Math.atan2(p1[1]-p0[1],p1[0]-p0[0])*180/Math.PI,up=(q/5)%2?1:-1;
      lv.appendChild(svgEl("path",{d:"M0,0 C2.5,-3.5 8,-4.5 11,-2 C8,1 3,1.5 0,0 Z",transform:"translate("+p0[0].toFixed(1)+","+p0[1].toFixed(1)+") rotate("+(an+up*38).toFixed(1)+")"}));}
    dot.setAttribute("cx",String(6+tp/180*308));dot.setAttribute("cy",String(curveY(a,tp,tp)));}
  if(RM||(from.a===to.a&&from.b===to.b&&from.tp===to.tp)){draw(to.a,to.b,to.tp);return s;}
  var t0=performance.now();draw(from.a,from.b,from.tp);
  requestAnimationFrame(function step(t){var k=Math.min(1,(t-t0)/460),e=1-Math.pow(1-k,3);draw(from.a+(to.a-from.a)*e,from.b+(to.b-from.b)*e,from.tp+(to.tp-from.tp)*e);if(k<1)requestAnimationFrame(step);});
  return s;
}
function bandCls(b){return b==="Gentle"?"band-g":b==="Moderate"?"band-m":"band-s";}
function toast(t){var n=$("toast");$("toasttxt").textContent=t;n.hidden=false;n.style.animation="none";void n.offsetWidth;n.style.animation="";clearTimeout(toast.t);toast.t=setTimeout(function(){n.hidden=true;},2800);$("said").textContent=t;}
function panelHead(host,eyebrow,title,right){var h=el("div","panel-h"),l=el("div");l.appendChild(el("p","eyebrow",eyebrow));l.appendChild(el("h2",null,title));h.appendChild(l);if(right)h.appendChild(right);host.appendChild(h);}

/* ---------- the meal after the person's taps: swaps ([P]) and 1-tap changes ([S]) ---------- */
function viewOf(m){
  var n={kcal:m.kcal,protein:m.protein,carbs:m.carbs,fats:m.fats,fiber:m.fiber},title=m.title,notes=[],minutes=m.minutes,items=m.items.map(function(i){return {food:i.food,grams:i.grams,group:i.group};});
  function apply(d){n.kcal+=d.deltaKcal;n.protein+=d.deltaProtein;n.carbs+=d.deltaCarbs;n.fats+=d.deltaFats;n.fiber+=d.deltaFiber;}
  function swapIn(list,idx,group){var s=list[idx];if(!s||!idx)return;apply(s);for(var i=0;i<items.length;i++)if(items[i].group===group){items[i]={food:s.food,grams:s.grams||null,group:group,tag:"swapped"};return;}}
  swapIn(m.swaps.protein,UI.swp,"protein");swapIn(m.swaps.base,UI.swb,"carbs");
  var suffix=[];ALCH.forEach(function(k){var a=m.alchemy[k];if(!a||!UI.alc[k])return;apply(a);title+=" "+a.suffix;suffix.push(a.suffix.replace(/^[(+]\s*|\)$/g,""));notes.push(a.note);if(k==="express"&&a.minutes!=null)minutes=a.minutes;});
  ["kcal","protein","carbs","fats","fiber"].forEach(function(k){n[k]=Math.max(0,Math.round(n[k]));});
  return {title:title.replace(/\s+/g," ").trim(),suffix:suffix.length?"with "+suffix.join(", ").toLowerCase():"",n:n,notes:notes,minutes:minutes,items:items};
}
function curMeal(){var r=curRes();if(!r||!r.meals||!r.meals.length)return null;if(UI.sel>=r.meals.length)UI.sel=0;return r.meals[UI.sel];}
function dayTotals(){var p=0,k=0;LOG.forEach(function(l){p+=l.protein||0;k+=l.kcal||0;});return {n:LOG.length,p:p,k:k};}
function logged(m){for(var i=0;i<LOG.length;i++)if(LOG[i].meal===C.meal&&LOG[i].title===m.title)return true;return false;}

/* ---------- chrome ---------- */
function renderChrome(){
  var d=now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});$("mastdate").textContent=d;
  var start=new Date(now.getFullYear(),0,0);$("issue").textContent="Issue No. "+Math.floor((now-start)/864e5);
  $("myfood").hidden=!P.done;$("tabs").hidden=!P.done;
  if(P.done)$("myfoodtxt").textContent=lab("diet",P.diet)+" · "+lab("region",P.region);
  ["plate","build","rescue"].forEach(function(v){var t=$("tab-"+v);if(UI.view===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current");});
}
function show(v){UI.view=v;render();$("scroll").scrollTop=0;var sec=$("v-"+v);if(sec){sec.classList.remove("enter");void sec.offsetWidth;sec.classList.add("enter");}}
function render(){
  renderChrome();
  ["setup","plate","build","rescue"].forEach(function(v){$("v-"+v).hidden=true;});
  if(!P.done){$("v-setup").hidden=false;renderSetup();return;}
  var v=$("v-"+UI.view);v.hidden=false;
  if(UI.view==="plate")renderPlate();else if(UI.view==="build")renderBuild();else renderRescue();
}

/* ---------- setup: food, health, body. Asked once, kept on this phone ---------- */
function tiles(host,k,isOn,set,multi){
  var g=el("div","grid2");g.setAttribute("role",multi?"group":"radiogroup");
  OPT[k].forEach(function(o){var b=btn("tile",o[1],null,k+"-"+o[0]);b.setAttribute("role",multi?"checkbox":"radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});host.appendChild(g);
}
function choiceRow(host,k,isOn,set,cols){
  var g=el("div","choice-row");g.setAttribute("role","radiogroup");if(cols)g.style.gridTemplateColumns="repeat("+cols+",minmax(0,1fr))";
  OPT[k].forEach(function(o){var b=btn("choice",o[1],null,k+"-"+o[0]);b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});
  host.appendChild(g);
}
function q(host,title){var d=el("div","qs");d.appendChild(el("h2",null,title));host.appendChild(d);return d;}
function foodQs(host,after){
  var a=q(host,"What do you eat?");tiles(a,"diet",function(v){return P.diet===v;},function(v){P.diet=v;after();});
  var b=q(host,"Leave out completely");b.firstChild.className="cap";
  var lw=el("div","lows");OPT.leave.forEach(function(o){var on=P.leave.indexOf(o[0])>=0,x=btn("choice",o[1],null,"leave-"+o[0]);x.setAttribute("role","checkbox");x.setAttribute("aria-checked",on?"true":"false");
    x.addEventListener("click",function(){var i=P.leave.indexOf(o[0]);if(i>=0)P.leave.splice(i,1);else P.leave.push(o[0]);after();});lw.appendChild(x);});b.appendChild(lw);
  var c=q(host,"Home food");c.firstChild.className="cap";choiceRow(c,"region",function(v){return P.region===v;},function(v){P.region=v;after();},4);
}
function healthQs(host,after){var a=q(host,"Anything on the health side?");tiles(a,"health",function(v){return P.health===v;},function(v){P.health=v;after();});}
function bodyQs(host,after){
  var a=q(host,"For your targets");a.appendChild(el("p","fine","Used to work out calories and protein for each meal. Kept on this phone."));
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
  var head=[["Your next plate, every meal","Three short questions, asked once and kept on this phone."],["Anything on the health side?","This keeps the plates safe for you."],["For your targets","Calories and protein for each meal come from these. You can skip this."]][UI.step];
  add(h,st,el("h1",null,head[0]),el("p",null,head[1]));v.appendChild(h);
  function again(){render();}
  if(UI.step===0){foodQs(v,again);}else if(UI.step===1){healthQs(v,again);}else{bodyQs(v,function(soft){if(!soft)again();});}
  var row=el("div","choice-row");row.style.gridTemplateColumns=UI.step?"1fr 2fr":"1fr";
  if(UI.step){var bk=btn("btn","Back",null,"setup-back");bk.addEventListener("click",function(){UI.step--;render();});row.appendChild(bk);}
  var ok=UI.step===0?!!P.diet:UI.step===1?!!P.health:true;
  var go=btn("btn primary",UI.step<2?"Next":"Show my plate",null,"setup-next");if(!ok){go.disabled=true;go.style.opacity=".5";}
  go.addEventListener("click",function(){if(!ok)return;if(UI.step<2){UI.step++;render();$("scroll").scrollTop=0;return;}P.done=true;save();show("plate");});
  row.appendChild(go);v.appendChild(row);
  v.appendChild(el("p","fine","Meals are planned by AI (Google Gemini) from your choices. Numbers are estimates. General food guidance, not medical advice."));
}
function blockedCard(){
  var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic("shield"));
  add(c,i,el("h2",null,SAFETY),el("p",null,"Your health setting asks for your coach and doctor to plan meals with you. Nothing here is suggested for now."));
  var b=btn("btn","Change my food",null,null);b.addEventListener("click",openSheet);c.appendChild(b);return c;
}

/* ---------- 01 Plate: the meal engine ---------- */
function ctxBlock(host){
  var dt=day(),t=dayTotals(),tl=el("div","tiles");
  function tile(cap,val,unit,frac){var d=el("div","tile2");d.appendChild(el("p","cap",cap));var v=el("span","v");v.appendChild(val);if(unit)v.appendChild(el("small",null,unit));d.appendChild(v);
    if(frac!=null){var b=el("div","bar"),i=el("i");i.style.width=Math.min(100,Math.round(frac*100))+"%";b.appendChild(i);d.appendChild(b);}return d;}
  tl.appendChild(tile("Protein today",tw("t-p",t.p),dt?" / "+dt.protein+" g":" g",dt?t.p/dt.protein:null));
  tl.appendChild(tile("Energy today",tw("t-k",t.k),dt?" / "+dt.kcal+" kcal":" kcal",dt?t.k/dt.kcal:null));
  var md=el("div","tile2");md.appendChild(el("p","cap","Plates today"));var mv=el("span","v");mv.appendChild(el("span","mono",String(t.n)));mv.appendChild(el("small",null," of 4 saved"));md.appendChild(mv);
  var dots=el("div","mdots");MEALS.forEach(function(m){var on=LOG.some(function(l){return l.meal===m[0];});dots.appendChild(el("i",on?"on":null));});md.appendChild(dots);tl.appendChild(md);
  host.appendChild(tl);
  /* the choices that steer Gemini, as the confirmed v4 pill row: [S] state and appetite, [P] cuisine, mood, cooking */
  var rail=el("div","rail");
  function pill(key,icon,label,value){var b=el("button","pillsel");b.type="button";b.id="dial-"+key;b.setAttribute("aria-expanded",UI.open===key?"true":"false");b.appendChild(ic(icon));if(label)b.appendChild(el("span",null,label));b.appendChild(el("b",null,value));b.appendChild(ic("chevd"));
    b.addEventListener("click",function(){UI.open=UI.open===key?"":key;render();});return b;}
  add(rail,pill("mode",MODEICON[C.mode],"",lab("mode",C.mode)),pill("appetite","flame","Appetite",C.appetite+"/10"),pill("cuisine","thali","",lab("cuisine",C.cuisine)),
    pill("mood",MOODICON[C.mood],"",lab("mood",C.mood)),pill("cook",C.prep==="out"?"store":"pan","",(C.prep==="out"?"Ordering":"Cooking")+" · "+(C.oil==="min"?"less oil":"usual oil")));
  host.appendChild(rail);
  function changed(){STORE.shown[C.meal]=null;UI.err="";UI.open="";save();render();}
  function radios(list,isOn,set,iconOf,cls){var g=el("div",cls||"grid2");g.setAttribute("role","radiogroup");
    list.forEach(function(o){var b=el("button",cls==="choice-row"?"choice":"tile");b.type="button";b.id=o.id;b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o.v)?"true":"false");if(iconOf)b.appendChild(ic(iconOf(o.v)));var tx=el("span",null,o.t);if(o.s)tx.appendChild(el("small",null,o.s));b.appendChild(tx);
      b.addEventListener("click",function(){set(o.v);});g.appendChild(b);});host.appendChild(g);}
  if(UI.open==="mode")radios(OPT.mode.map(function(o){return {id:"mode-"+o[0],v:o[0],t:o[1],s:{strength:"Gym or sport today",trek:"A long hike or climb",focus:"Mostly sitting",rest:"Light and easy"}[o[0]]};}),function(v){return C.mode===v;},function(v){C.mode=v;UI.ratio=null;changed();toast(lab("mode",v)+". Plates follow it.");},function(v){return MODEICON[v];});
  if(UI.open==="cuisine")radios(OPT.cuisine.map(function(o){return {id:"cuisine-"+o[0],v:o[0],t:o[1]};}),function(v){return C.cuisine===v;},function(v){C.cuisine=v;changed();},null,"choice-row");
  if(UI.open==="mood")radios(OPT.mood.map(function(o){return {id:"mood-"+o[0],v:o[0],t:o[1]};}),function(v){return C.mood===v;},function(v){C.mood=v;changed();},function(v){return MOODICON[v];});
  if(UI.open==="cook"){radios(OPT.prep.map(function(o){return {id:"prep-"+o[0],v:o[0],t:o[1]};}),function(v){return C.prep===v;},function(v){C.prep=v;STORE.shown[C.meal]=null;save();render();},function(v){return v==="out"?"store":"pan";});
    radios(OPT.oil.map(function(o){return {id:"oil-"+o[0],v:o[0],t:o[1]};}),function(v){return C.oil===v;},function(v){C.oil=v;changed();},function(v){return v==="min"?"leaf":"flame";});}
  if(UI.open==="appetite"){
    var sl=el("div","slide"),sh=el("div","slide-h"),tg=target(),sv=el("span","slide-v");sv.appendChild(el("b",null,String(C.appetite)));sv.appendChild(document.createTextNode(" of 10"+(tg?" · about "+tg.kcal+" kcal":"")));
    add(sh,el("span",null,"A little"),sv,el("span",null,"Very hungry"));
    var r=el("input");r.type="range";r.min="1";r.max="10";r.value=String(C.appetite);r.id="appetite";r.setAttribute("aria-label","Appetite, 1 to 10");r.style.setProperty("--fill",((C.appetite-1)/9*100)+"%");
    r.addEventListener("input",function(){C.appetite=+r.value;r.style.setProperty("--fill",((C.appetite-1)/9*100)+"%");sv.firstChild.textContent=String(C.appetite);var t2=target();sv.lastChild.textContent=" of 10"+(t2?" · about "+t2.kcal+" kcal":"");});
    r.addEventListener("change",function(){save();render();});
    add(sl,sh,r,el("p","tsub","Moves this meal's calorie target. New plates follow it."));host.appendChild(sl);}
}
function choices(host){
  var ms=el("div","meals");ms.setAttribute("role","radiogroup");ms.setAttribute("aria-label","Meal");
  MEALS.forEach(function(m){var b=el("button","meal");b.type="button";b.id="meal-"+m[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",C.meal===m[0]?"true":"false");
    b.appendChild(ic(m[2]));b.appendChild(el("span",null,m[1]));if(m[0]===CLOCK){var d=el("i","now");d.setAttribute("aria-label","now");b.appendChild(d);}
    b.addEventListener("click",function(){if(C.meal===m[0])return;C.meal=m[0];UI.sel=0;UI.alc={};UI.swp=0;UI.swb=0;UI.err="";UI.fresh=true;UI.open="";render();});ms.appendChild(b);});
  host.appendChild(ms);
}
function waitCard(text){
  var c=el("article","plate wait"),h=el("div","hero"),band=el("div","band");band.appendChild(vine(false));band.appendChild(vine(true));h.appendChild(band);
  var main=el("div","hero-main");main.appendChild(thali([],0,"Your plate is being planned",C.meal));var tx=el("div");tx.appendChild(el("p","ans-read wait",text));main.appendChild(tx);h.appendChild(main);c.appendChild(h);return c;
}
function heroCard(m,v,r){
  var n=v.n,rs=riseOf(n,null),tg=target(),fit=fitOf(n,tg),card=el("article","plate"+(UI.fresh?" fresh":""));card.id="plate-card";
  var h=el("div","hero"),top=el("div","hero-top");
  function chip(t,cls,icon){var c=el("span","hchip"+(cls?" "+cls:""));if(icon)c.appendChild(ic(icon));c.appendChild(el("span",null,t));return c;}
  top.appendChild(chip(lab("diet",P.diet),"fit","check"));
  P.leave.forEach(function(k){top.appendChild(chip("No "+lab("leave",k).toLowerCase(),"fit","check"));});
  if(fit!=null)top.appendChild(chip("Fit "+fit+" / 100","fit","target"));
  top.appendChild(chip(v.minutes>0?v.minutes+" min":(C.prep==="out"?"Order it":"Ready"),"time","clock"));
  var main=el("div","hero-main"),txt=el("div");
  var pb=el("div","platebox");pb.appendChild(thali(v.items,0,"Your "+mealName(C.meal).toLowerCase()+" plate: "+v.items.map(function(i){return i.food;}).join(", "),C.meal));main.appendChild(pb);
  h.appendChild(sprig("hero-sprig"));var band=el("div","band");band.appendChild(vine(false));band.appendChild(vine(true));h.appendChild(band);
  var vw=vegWord(shares(v.items).veg),sc=el("span","scribble");sc.textContent=vw==="None"?"no veg here yet":vw.toLowerCase()+(vw==="A little"?" veg on":" of")+" the plate"+(vw==="A little"?"":" is veg");pb.appendChild(sc);
  var h2=el("h2",m.title.length>34?"long":null,m.title);txt.appendChild(h2);if(v.suffix)txt.appendChild(el("p","suffix",v.suffix));txt.appendChild(el("p","sub",m.subtitle));if(m.cuisine)txt.appendChild(el("p","cuis",m.cuisine));main.appendChild(txt);
  var rd=el("div","read4 six");
  function cell(cap,node,unit,cls){var d=el("div","tcard");d.appendChild(el("p","cap",cap));var x=el("span","v"+(cls?" "+cls:""));x.appendChild(node);if(unit)x.appendChild(el("small",null,unit));d.appendChild(x);return d;}
  add(rd,cell("Protein",tw("h-p",n.protein),"g"),cell("Carbs",tw("h-c",n.carbs),"g"),cell("Fats",tw("h-f",n.fats),"g"),
    cell("Energy",tw("h-k",n.kcal),"kcal"),cell("Fibre",tw("h-fi",n.fiber),"g"),cell("Rise",el("span","mono",rs.band),null,bandCls(rs.band)));
  var tn=el("div","tune alc");tn.appendChild(el("p","cap","One-tap changes"));
  [["protein","dumbbell"],["glucose","lab"],["express","bolt"],["gut","leaf"]].forEach(function(x){
    var a=m.alchemy[x[0]];var b=btn("tbtn",ALCHLABEL[x[0]],x[1],"alc-"+x[0]);setPressed(b,!!UI.alc[x[0]]);
    if(!a){b.disabled=true;b.title="Not offered for this plate";}
    b.addEventListener("click",function(){if(!a)return;UI.alc[x[0]]=!UI.alc[x[0]];render();});tn.appendChild(b);});
  add(h,top,main,rd,tn);
  if(v.notes.length){var ml=el("ul","modlog");v.notes.forEach(function(x){ml.appendChild(el("li",null,x));});h.appendChild(ml);}
  card.appendChild(h);
  /* what to serve, in grams (D3) */
  var sv=el("div","serve"),sh2=el("div","serve-h");sh2.appendChild(el("p","cap","What to serve"));
  var hasSw=m.swaps.protein.length>1||m.swaps.base.length>1;
  if(hasSw){var adj=el("button","linkbtn");adj.type="button";adj.id="adjust";adj.setAttribute("aria-expanded",UI.adj?"true":"false");adj.appendChild(ic(UI.adj?"x":"sliders"));adj.appendChild(el("span",null,UI.adj?"Done":"Swap"));
    adj.addEventListener("click",function(){UI.adj=!UI.adj;render();});sh2.appendChild(adj);}
  sv.appendChild(sh2);
  if(UI.adj&&hasSw){var d=el("div","drawer");
    [["protein","Main protein","swp"],["base","Base","swb"]].forEach(function(x){var list=m.swaps[x[0]];if(list.length<2)return;var g=el("div");g.appendChild(el("p","cap",x[1]));var w=el("div","lows");
      list.forEach(function(s,i){var lbl=s.food+(i&&s.deltaProtein?" ("+(s.deltaProtein>0?"+":"")+s.deltaProtein+" g protein)":"");var b=btn("choice",lbl,null,x[2]+"-"+i);b.setAttribute("role","radio");b.setAttribute("aria-checked",UI[x[2]]===i?"true":"false");
        b.addEventListener("click",function(){UI[x[2]]=i;render();});w.appendChild(b);});g.appendChild(w);d.appendChild(g);});
    sv.appendChild(d);}
  var ul=el("ul","measures");
  v.items.forEach(function(it){var li=el("li"),qy=el("span","qty g"+(it.tag?" chg":""));qy.style.setProperty("--dot",RINGC[{greens:"veg",protein:"pro",carbs:"grain"}[it.group]||"side"]);
    if(it.grams){qy.appendChild(document.createTextNode(String(it.grams)));qy.appendChild(el("small",null,"g"));}else qy.textContent="—";
    var f=el("span","food");f.appendChild(el("b",null,it.food));if(it.tag)f.appendChild(el("span","tag","swapped"));add(li,qy,f);ul.appendChild(li);});
  sv.appendChild(ul);card.appendChild(sv);
  var acts=el("div","acts");acts.style.gridTemplateColumns="1fr 1fr 1.25fr";
  var total=r.meals.length,nx=btn("btn",total>1?"Next ("+(UI.sel+1)+"/"+total+")":"New plates","refresh","next");
  nx.addEventListener("click",function(){if(total>1){UI.sel=(UI.sel+1)%total;UI.alc={};UI.swp=0;UI.swb=0;UI.adj=false;UI.fresh=true;render();toast("Next plate for "+mealName(C.meal).toLowerCase());}else makePlates("");});
  var tr=btn("btn","Try it","lab","try");tr.addEventListener("click",function(){show("build");});
  var have=logged(v),hv=btn("btn "+(have?"done":"primary"),have?"Saved":"I'll have this","check","have");
  hv.addEventListener("click",function(){LOG=LOG.filter(function(l){return l.meal!==C.meal;});LOG.push({day:DAY,meal:C.meal,title:v.title,kcal:n.kcal,protein:n.protein});save();render();toast("Saved for "+mealName(C.meal).toLowerCase()+". The next meal will balance it.");});
  add(acts,nx,tr,hv);card.appendChild(acts);
  card.appendChild(el("div","share"));
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
  var i=el("input");i.type="text";i.id="askin";i.maxLength=240;i.placeholder="A craving, a dish, what's in the fridge";i.setAttribute("aria-label","Ask for a meal");
  var go=el("button","send");go.type="submit";go.id="askgo";go.setAttribute("aria-label","Ask");go.appendChild(ic("send"));
  f.addEventListener("submit",function(e){e.preventDefault();var t=i.value.trim();if(!t||UI.busy)return;i.blur();makePlates(t);});
  add(f,i,go);c.appendChild(f);host.appendChild(c);
}
function renderPlate(){
  var v=$("v-plate");v.textContent="";
  if(blocked()){v.appendChild(blockedCard());return;}
  ctxBlock(v);choices(v);
  var r=curRes(),asked=STORE.shown[C.meal]&&STORE.shown[C.meal].indexOf("ask|")===0;
  if(UI.busy){v.appendChild(waitCard(UI.busy==="ask"?"Planning plates for what you asked":"Planning your "+mealName(C.meal).toLowerCase()+" plates"));}
  else if(!r){
    var last=lastForMeal(),auto=!STORE.shown.hasOwnProperty(C.meal)&&!UI.err;
    if(auto){STORE.shown[C.meal]=null;setTimeout(function(){makePlates("");},0);v.appendChild(waitCard("Planning your "+mealName(C.meal).toLowerCase()+" plates"));}
    else{
      var c=el("div","empty-card"),i=el("span","safe-ic");i.appendChild(ic(UI.err?"info":"refresh"));
      add(c,i,el("h2",null,UI.err?UI.err:"New choices. Plan plates for them?"));
      var b=btn("btn primary",UI.err?"Try again":"Plan my plates","spark","remake");b.addEventListener("click",function(){makePlates("");});c.appendChild(b);
      if(last){var lb=btn("linkbtn","Show my last plates",null,"lastplates");lb.addEventListener("click",function(){var k=Object.keys(STORE.res).filter(function(k){return STORE.res[k]===last;})[0];STORE.shown[C.meal]=k;UI.err="";UI.sel=0;render();});c.appendChild(lb);}
      v.appendChild(c);}
  }else if(r.status==="refer"){
    var e=el("div","empty-card"),s=el("span","safe-ic");s.appendChild(ic("shield"));add(e,s,el("h2",null,r.read||SAFETY));
    var bb=btn("btn","Back to my plates",null,"back");bb.addEventListener("click",function(){STORE.shown[C.meal]=null;render();});e.appendChild(bb);v.appendChild(e);
  }else{
    if(UI.err){var en=el("div","note");en.appendChild(ic("info"));en.appendChild(el("p",null,UI.err+" Showing your last plates."));v.appendChild(en);}
    if(r.read||asked){var rl=el("div","readline");if(asked)rl.appendChild(el("p","asked","“"+r.ask+"”"));if(r.read)rl.appendChild(el("p","ans-read",r.read));
      if(asked){var back=btn("linkbtn","Back to my plates",null,"back");back.addEventListener("click",function(){STORE.shown[C.meal]=null;UI.sel=0;UI.alc={};render();});rl.appendChild(back);}v.appendChild(rl);}
    var m=curMeal(),vw=viewOf(m);
    v.appendChild(heroCard(m,vw,r));
    if(P.health==="diabetes"||P.health==="bp"){var nt=el("div","note");nt.setAttribute("role","note");nt.appendChild(ic("info"));nt.appendChild(el("p",null,P.health==="diabetes"?"With diabetes the grain stays on the plate, next to protein and vegetables. Your doctor's advice comes first.":"With high BP these plates leave out pickle, papad and added salt. Your doctor's advice comes first."));v.appendChild(nt);}
    if(m.why.length){var wc=el("article","card why"),wi=el("span","why-ic");wi.appendChild(ic("shield"));var wt=el("div");wt.appendChild(el("h3",null,"Why this plate"));
      m.why.forEach(function(w){var p=el("p");p.appendChild(el("b",null,w.pair+". "));p.appendChild(document.createTextNode(w.effect));wt.appendChild(p);});add(wc,wi,wt);v.appendChild(wc);}
    if(r.meals.length>1){var hh=el("div","sec-h");hh.appendChild(el("h3",null,"Also for "+mealName(C.meal).toLowerCase()));v.appendChild(hh);
      var wrap=el("div","alts");r.meals.forEach(function(x,i){if(i===UI.sel)return;var b=el("button","alt");b.type="button";b.id="alt-"+i;
        var tx=el("span");tx.appendChild(el("b",null,x.title));tx.appendChild(el("small",null,"≈ "+x.protein+" g protein · "+x.kcal+" kcal"+(x.minutes?" · "+x.minutes+" min":"")));
        add(b,thali(x.items,56,"Plate"),tx,ic("chev"));b.addEventListener("click",function(){UI.sel=i;UI.alc={};UI.swp=0;UI.swb=0;UI.adj=false;UI.fresh=true;render();$("scroll").scrollTo({top:0,behavior:RM?"auto":"smooth"});});wrap.appendChild(b);});
      v.appendChild(wrap);}
  }
  askBlock(v);
  var fw=el("div","colophon");fw.appendChild(stamp());fw.appendChild(sprig("colo-sprig"));v.appendChild(fw);
  v.appendChild(el("p","fine","Plates are planned by AI (Google Gemini) from your choices and checked against your food rules on the way. What you type goes to Google Gemini; no names are sent. Numbers are estimates for the portion as served. General food guidance, not medical advice."));
  composer(v);
  UI.fresh=false;
}

/* ---------- 02 Builder: [P] plate builder + [S] tactile plate and after-meal curve ---------- */
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
  var t=target(),mid=el("div","ringmid");if(t){mid.appendChild(el("b",null,String(t.kcal)));mid.appendChild(el("small",null,"kcal · "+t.protein+" g protein"));}else mid.appendChild(el("small",null,"by plate"));
  var rw=el("div","ringwrap");add(rw,rg,mid);
  var stp=el("div","steppers");
  [["protein","Protein","pro"],["greens","Vegetables and greens","veg"],["carbs","Slow carbs","grain"],["fats","Fats and seeds","side"]].forEach(function(x){
    var row=el("div","stp"),sw=el("i");sw.style.background=RINGC[x[2]];var tx=el("div");tx.appendChild(el("b",null,x[1]));
    var ctr=el("div","ctr"),mn=btn(null,null,"minus","st-"+x[0]+"-m"),out=el("output",null,R[x[0]]+"%"),pl=btn(null,null,"plus","st-"+x[0]+"-p");
    mn.setAttribute("aria-label","Less "+x[1].toLowerCase());pl.setAttribute("aria-label","More "+x[1].toLowerCase());
    mn.addEventListener("click",function(){UI.ratio=rebalance(UI.ratio,x[0],-5);UI.preset="";render();});pl.addEventListener("click",function(){UI.ratio=rebalance(UI.ratio,x[0],5);UI.preset="";render();});
    add(ctr,mn,out,pl);add(row,sw,tx,ctr);stp.appendChild(row);});
  add(c,rw,stp);v.appendChild(c);
  if(t)v.appendChild(el("p","fine","Target for this "+mealName(C.meal).toLowerCase()+": about "+t.kcal+" kcal and "+t.protein+" g protein. Gemini fills in the grams."));
  var mk=btn("btn primary","Plan "+mealName(C.meal).toLowerCase()+" with this plate","spark","make-ratio");
  mk.addEventListener("click",function(){C.ratio={protein:UI.ratio.protein,greens:UI.ratio.greens,carbs:UI.ratio.carbs,fats:UI.ratio.fats};STORE.shown[C.meal]=null;save();show("plate");makePlates("");});
  v.appendChild(mk);
  if(C.ratio){var cl=btn("linkbtn","Go back to plates by mode",null,"clear-ratio");cl.addEventListener("click",function(){C.ratio=null;UI.ratio=null;STORE.shown[C.meal]=null;save();render();});v.appendChild(cl);}
  /* [S] after-meal curve for the plate on the Plate tab */
  var m=curMeal();
  var inst=el("article","inst"),ih=el("div","inst-h"),hl=el("div");hl.appendChild(el("p","cap","After-meal curve"));
  if(!m){hl.appendChild(el("p","tsub","Plan a plate first. Its curve shows here."));ih.appendChild(hl);inst.appendChild(ih);v.appendChild(inst);return;}
  var vw=viewOf(m),rs=riseOf(vw.n,UI.hab);hl.appendChild(el("p","tsub",vw.title));ih.appendChild(hl);ih.appendChild(el("span","risev "+bandCls(rs.band),rs.band));
  add(inst,ih,curve("b",rs));
  var lg=el("div","inst-lg"),a1=el("span"),a2=el("span");a1.appendChild(el("i","l-act"));a1.appendChild(document.createTextNode("with your habits"));a2.appendChild(el("i","l-raw"));a2.appendChild(document.createTextNode("carbs first, sitting after"));add(lg,a1,a2);inst.appendChild(lg);
  var hb=el("div","habits");
  [["veg","Vegetables first","eat them before the rest"],["walk","15-minute walk","right after the meal"],["lemon","Lemon or vinegar","in a salad, as a starter"]].forEach(function(x){
    var b=el("button","hab");b.type="button";b.id="hab-"+x[0];setPressed(b,UI.hab[x[0]]);b.appendChild(el("span",null,x[1]));b.appendChild(el("small",null,x[2]));
    b.addEventListener("click",function(){UI.hab[x[0]]=!UI.hab[x[0]];render();});hb.appendChild(b);});
  inst.appendChild(hb);v.appendChild(inst);
  v.appendChild(el("p","fine","The curve is a model of direction, not a blood-sugar reading. It moves with carbs, fibre, protein and fat, and with the habits above."));
}

/* ---------- 03 Rescue: [S] menu deconstructor ---------- */
var DISHES=["Andhra mutton biryani","Pahadi mutton rara with 2 butter rotis","Peri-peri half chicken with spicy rice","Paneer butter masala with 2 butter naan","Chole bhature","Veg biryani with raita","Masala dosa with chutney","A slice of tiramisu after dinner"];
function shrink(file,cb){
  var img=new Image(),url=URL.createObjectURL(file);img.onload=function(){var s=Math.min(1,1024/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
    c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);cb(c.toDataURL("image/jpeg",.82).split(",")[1]);};img.onerror=function(){cb(null);};img.src=url;
}
function rescue(text,image){
  if(UI.rbusy)return;UI.rbusy=true;UI.rerr="";UI.rtext=text||"Photo of the menu";render();
  var body={profile:profileOut(),ctx:{meal:C.meal,time:clockText(),text:text||"",photo:!!image}};if(image)body.image=image;
  api("/api/rescue",body,function(s,j){UI.rbusy=false;
    if(s===200&&j.status==="ok"){UI.rres=j;UI.rmoves={};(j.hacks||[]).slice(0,1).forEach(function(h,i){UI.rmoves[i]=true;});}
    else if(s===200&&j.status==="refer"){UI.rres={status:"refer",read:j.read};}
    else if(s===200)UI.rerr="That didn't come back as a dish that fits your food rules. Try naming it differently.";
    else UI.rerr=errText(j.code);
    render();});
}
function renderRescue(){
  var v=$("v-rescue");v.textContent="";
  panelHead(v,"03 · Rescue","Eating out anyway");
  if(blocked()){v.appendChild(blockedCard());return;}
  var f=el("form","rin");f.autocomplete="off";var i=el("input");i.type="text";i.id="rin";i.maxLength=160;i.placeholder="Name the dish or the order";i.setAttribute("aria-label","Dish or order");
  var cam=el("button","send cam");cam.type="button";cam.id="rcam";cam.setAttribute("aria-label","Photo of the menu");cam.appendChild(ic("camera"));
  var fi=el("input");fi.type="file";fi.accept="image/*";fi.hidden=true;fi.id="rfile";
  cam.addEventListener("click",function(){fi.click();});fi.addEventListener("change",function(){var file=fi.files&&fi.files[0];if(!file)return;shrink(file,function(b){if(!b){UI.rerr=errText("bad_image");render();return;}rescue("",b);});});
  var go=el("button","send");go.type="submit";go.setAttribute("aria-label","Rescue this dish");go.appendChild(ic("send"));
  f.addEventListener("submit",function(e){e.preventDefault();var t=i.value.trim();if(t)rescue(t,null);});
  add(f,cam,i,go,fi);v.appendChild(f);
  var ch=el("div","sits");DISHES.filter(function(d){return !crosses(d,P);}).forEach(function(d,k){var b=btn("sit",d,null,"dish-"+k);b.setAttribute("aria-pressed",UI.rtext===d?"true":"false");b.addEventListener("click",function(){rescue(d,null);});ch.appendChild(b);});
  v.appendChild(ch);
  if(UI.rbusy){var w=el("article","inst");w.appendChild(el("p","ans-read wait","Taking apart "+UI.rtext.toLowerCase()));v.appendChild(w);return;}
  if(UI.rerr){var n=el("div","note");n.appendChild(ic("info"));n.appendChild(el("p",null,UI.rerr));v.appendChild(n);}
  var r=UI.rres;
  if(!r){v.appendChild(el("p","fine","Pick a dish or type the order. You'll see it as usually served and the two or three moves that make it fit your day."));return;}
  if(r.status==="refer"){var e=el("div","empty-card"),s=el("span","safe-ic");s.appendChild(ic("shield"));add(e,s,el("h2",null,r.read||SAFETY));v.appendChild(e);return;}
  var d=r.dish,a={kcal:d.kcal,protein:d.protein,carbs:d.carbs,fats:d.fats,fiber:d.fiber},hab={veg:false,walk:false,lemon:false};
  r.hacks.forEach(function(h,k){if(!UI.rmoves[k])return;a.kcal+=h.deltaKcal;a.protein+=h.deltaProtein;a.carbs+=h.deltaCarbs;a.fats+=h.deltaFats;a.fiber+=h.deltaFiber;if(h.kind==="sequence")hab.veg=true;if(h.kind==="move")hab.walk=true;});
  ["kcal","protein","carbs","fats","fiber"].forEach(function(k){a[k]=Math.max(k==="protein"||k==="fiber"?0:Math.round(d[k]*.4),Math.round(a[k]));});
  var r0=riseOf(d,null),r1=riseOf(a,hab),tg=target(),f0=fitOf(d,tg),f1=fitOf(a,tg);
  var inst=el("article","inst"),ih=el("div","inst-h"),hl=el("div");
  hl.appendChild(el("span","dish",d.name));hl.appendChild(el("span","dish-s",[d.portion,d.warning].filter(Boolean).join(" · ")));ih.appendChild(hl);inst.appendChild(ih);
  if(d.breakdown)inst.appendChild(el("p","tsub",d.breakdown));
  var cmp=el("div","cmp"),mx=Math.max(d.kcal,a.kcal,1);
  function row(label,b0,b1,unit,max,warnUp){var rw=el("div","cmp-row");rw.appendChild(el("span","lab",label));var bars=el("div","cmp-bars"),i0=el("i","b0"),i1=el("i","b1"+(warnUp&&b1>b0?" warn":""));i0.style.width=Math.round(b0/max*100)+"%";i1.style.width=Math.round(b1/max*100)+"%";add(bars,i0,i1);rw.appendChild(bars);
    var val=el("span","val");if(b0!==b1)val.appendChild(el("s",null,String(b0)));val.appendChild(document.createTextNode(String(b1)));val.appendChild(el("small",null," "+unit));rw.appendChild(val);cmp.appendChild(rw);}
  row("Energy",d.kcal,a.kcal,"kcal",mx,true);row("Protein",d.protein,a.protein,"g",Math.max(d.protein,a.protein,1));row("Carbs",d.carbs,a.carbs,"g",Math.max(d.carbs,a.carbs,1),true);row("Fats",d.fats,a.fats,"g",Math.max(d.fats,a.fats,1),true);
  inst.appendChild(cmp);
  var sumr=el("p","tsub");sumr.appendChild(document.createTextNode("Rise: "));sumr.appendChild(el("b",bandCls(r0.band),r0.band));if(r1.band!==r0.band){sumr.appendChild(document.createTextNode(" → "));sumr.appendChild(el("b",bandCls(r1.band),r1.band));}
  if(f0!=null){sumr.appendChild(document.createTextNode(" · Fit "+f0+(f1!==f0?" → "+f1:"")+" / 100"));}
  inst.appendChild(sumr);v.appendChild(inst);
  var mh=el("div","sec-h");mh.appendChild(el("h3",null,"Moves that make it fit"));v.appendChild(mh);
  var mv=el("div","moves");r.hacks.forEach(function(h,k){var b=el("button","move");b.type="button";b.id="move-"+k;setPressed(b,!!UI.rmoves[k]);var ii=el("i");ii.appendChild(ic("check"));
    var tx=el("span");tx.appendChild(document.createTextNode(h.title));var bits=[];if(h.deltaKcal)bits.push((h.deltaKcal>0?"+":"")+h.deltaKcal+" kcal");if(h.deltaProtein)bits.push((h.deltaProtein>0?"+":"")+h.deltaProtein+" g protein");if(h.kind==="sequence"||h.kind==="move")bits.push("softens the rise");
    if(bits.length)tx.appendChild(el("small",null,bits.join(" · ")));add(b,ii,tx);b.addEventListener("click",function(){UI.rmoves[k]=!UI.rmoves[k];render();});mv.appendChild(b);});
  v.appendChild(mv);
  v.appendChild(el("p","fine","Numbers are estimates for the dish as usually served. Restaurants vary."));
}

/* ---------- My food sheet ---------- */
function openSheet(){$("sheet").hidden=false;renderSheet();}
function closeSheet(){$("sheet").hidden=true;$("myfood").focus();}
function renderSheet(){
  var sh=$("sheet");sh.textContent="";var c=el("div","sheet-card");c.setAttribute("role","dialog");c.setAttribute("aria-label","My food");
  c.appendChild(el("div","grab"));var h=el("div","sheet-h");h.appendChild(el("h2",null,"My food"));var dn=btn("btn primary","Done",null,"sheet-done");dn.style.minHeight="40px";dn.style.padding="0 18px";
  dn.addEventListener("click",function(){STORE.res={};STORE.shown={};UI.rres=null;save();closeSheet();render();});h.appendChild(dn);c.appendChild(h);
  function again(soft){if(!soft)renderSheet();}
  foodQs(c,again);healthQs(c,again);bodyQs(c,again);sh.appendChild(c);
}
$("sheet").addEventListener("click",function(e){if(e.target===$("sheet"))closeSheet();});
$("myfood").addEventListener("click",openSheet);
["plate","build","rescue"].forEach(function(v){$("tab-"+v).addEventListener("click",function(){show(v);});});
render();
})();
