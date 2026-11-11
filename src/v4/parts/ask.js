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

