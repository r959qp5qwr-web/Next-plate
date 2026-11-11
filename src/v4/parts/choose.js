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
