/* ===== Mock-up of the five adopted items, layered on hosted/v6 (owner: "Let's do it", items 1-5). Not in the app until approved.
   1 portion ring on the plate · 2 one colour per nutrient · 3 stoneware plate · 4 pairing tips for absorption · 5 taste notes
   Taste notes and pairing tips: Gemini does not send these fields yet, so SAMPLE holds layout text for the three fixture plates. ===== */
(function(){
var NC={protein:"pro",greens:"veg",carbs:"grain",fats:"side",other:"other"},NNAME={protein:"Protein",greens:"Greens",carbs:"Carbs",fats:"Fats",other:"Other"},ORDER=["protein","greens","carbs","fats","other"];
var SAMPLE={
  "Charred Pahadi Paneer Tikka & Foxtail Millet Khichdi":{taste:["smoky","garlicky","fresh"],pairs:[
    {pair:"Palak + a squeeze of lemon",effect:"The lemon helps the body take up the iron in the palak."},
    {pair:"Turmeric + black pepper",effect:"Pepper helps the body take up the turmeric in the marinade."},
    {pair:"Tea or coffee, an hour later",effect:"Taken with the meal, they hold back the iron."}]},
  "Smoky Kala Chana & Sweet Potato Chaat Bowl":{taste:["tangy","crunchy","sweet"],pairs:[
    {pair:"Kala chana + pomegranate and lemon",effect:"Both help the body take up the iron in the chana."}]},
  "10-Min Miso Glazed Tofu & Buckwheat Soba":{taste:["savoury","nutty","light"],pairs:[]}};
var LID=0;
function gramsBy(items){var a={protein:0,greens:0,carbs:0,fats:0,other:0};items.forEach(function(it){a[it.group in a?it.group:"other"]+=it.grams||0;});return a;}
function grad(defs,id,cx,cy,r,stops){var g=svgEl("radialGradient",{id:id,cx:cx,cy:cy,r:r,fx:cx,fy:cy});stops.forEach(function(x){var s=svgEl("stop",{offset:x[0]});s.style.stopColor=x[1];if(x[2]!=null)s.style.stopOpacity=x[2];g.appendChild(s);});defs.appendChild(g);return "url(#"+id+")";}

/* 3 stoneware plate (ceramic depth, speckle) and 1 portion ring, drawn into the existing plate */
var _thali=thali;
thali=function(items,size,label,dial){
  var s=_thali(items,size,label,dial),id="lk"+(LID++),defs=s.querySelector("defs"),cs=s.querySelectorAll(":scope > circle"),base=cs[0],glaze=cs[1],well=cs[2],wr=dial?88:98;
  base.style.fill=grad(defs,id+"r",".35",".30",".96",[["0","#EFE8DA"],[".68","#DFD5C3"],[".94","#C4B49E"],["1","#B38A6A"]]);
  glaze.style.fill="none";glaze.setAttribute("stroke","rgba(255,252,244,.55)");glaze.setAttribute("stroke-width","1");
  well.style.fill=grad(defs,id+"w",".45",".40",".62",[["0","#F7F2E7"],[".8","#E8DFCE"],["1","#D5C7B2"]]);
  var sh=svgEl("circle",{cx:"120",cy:"120",r:String(wr)});sh.style.fill=grad(defs,id+"s",".56",".60",".56",[["0","#5A4232",0],[".86","#5A4232",0],["1","#5A4232",.2]]);
  well.parentNode.insertBefore(sh,well.nextSibling);
  var hl=svgEl("path",{d:"M40,72 A93,93 0 0,1 92,24",fill:"none",stroke:"#FFFDF6","stroke-width":"2.4","stroke-linecap":"round",opacity:".55"});well.parentNode.insertBefore(hl,sh.nextSibling);
  function rnd(i){var x=Math.sin(i*91.7+17.3)*24634.6345;return x-Math.floor(x);}
  for(var i=0;i<90;i++){var a=rnd(i)*6.283,d=Math.sqrt(rnd(i+300))*116,sp=svgEl("circle",{cx:(120+Math.cos(a)*d).toFixed(1),cy:(120+Math.sin(a)*d).toFixed(1),r:(.3+rnd(i+600)*.8).toFixed(2)});
    sp.style.fill=i%4?"#4E3A2A":"#FFFBF2";sp.style.opacity=i%4?(.18+rnd(i+900)*.3).toFixed(2):".7";well.parentNode.insertBefore(sp,hl.nextSibling);}
  var g=gramsBy(items),tot=ORDER.reduce(function(t,k){return t+g[k];},0);
  if(tot>0){
    var R=wr+5,C=2*Math.PI*R,keys=ORDER.filter(function(k){return g[k]>0;}),gap=keys.length>1?3:0,off=0,ring=svgEl("g",{"class":"pr"});
    var track=svgEl("circle",{cx:"120",cy:"120",r:String(R),fill:"none",stroke:"rgba(122,90,60,.12)","stroke-width":"5"});ring.appendChild(track);
    keys.forEach(function(k){var len=Math.max(1,g[k]/tot*C-gap),c=svgEl("circle",{cx:"120",cy:"120",r:String(R),"class":"pr-arc","stroke-width":"5",transform:"rotate(-90 120 120)","stroke-dasharray":len.toFixed(1)+" "+(C-len).toFixed(1),"stroke-dashoffset":(-off-gap/2).toFixed(1)});
      c.style.stroke="var(--"+NC[k]+")";ring.appendChild(c);off+=g[k]/tot*C;});
    well.parentNode.insertBefore(ring,s.querySelector(".th-item"));
    s.setAttribute("aria-label",(label||"Your plate")+". Portions by weight: "+keys.map(function(k){return NNAME[k].toLowerCase()+" "+g[k]+" g";}).join(", ")+".");
  }
  return s;
};

/* 1 legend under the plate, 2 nutrient colours on the cards, 5 taste notes, 4 pairing tips */
var _hero=heroCard;
heroCard=function(m,v,r){
  var card=_hero(m,v,r),smp=SAMPLE[m.title]||{taste:[],pairs:[]},g=gramsBy(v.items);
  var pb=card.querySelector(".platebox"),lg=el("ul","prlegend");lg.setAttribute("aria-hidden","true");
  ORDER.forEach(function(k){if(!g[k])return;var li=el("li","n-"+NC[k]);li.appendChild(el("i"));li.appendChild(el("span",null,NNAME[k]));li.appendChild(el("b",null,g[k]+" g"));lg.appendChild(li);});
  pb.parentNode.insertBefore(lg,pb.nextSibling);
  var h2=card.querySelector(".hero-main h2");
  if(smp.taste.length){var t=el("p","taste");t.setAttribute("aria-label","Tastes "+smp.taste.join(", "));smp.taste.forEach(function(w){t.appendChild(el("span",null,w));});h2.parentNode.insertBefore(t,h2);}
  ["pro","grain","side","ink","veg","ink"].forEach(function(c,i){var tc=card.querySelectorAll(".read4 .tcard")[i];if(tc)tc.classList.add("n-"+c);});
  if(smp.pairs.length){var pr=el("div","pairs"),ph=el("p","ph");ph.appendChild(el("b",null,"Pair it"));ph.appendChild(el("small",null,"to take up more from this plate"));pr.appendChild(ph);
    var ul=el("ul");smp.pairs.forEach(function(p){var li=el("li"),pl=el("span","plus","+"),tx=el("span");pl.setAttribute("aria-hidden","true");tx.appendChild(el("b","pf",p.pair));tx.appendChild(el("span","pe",p.effect));add(li,pl,tx);ul.appendChild(li);});
    pr.appendChild(ul);var sv=card.querySelector(".serve");sv.parentNode.insertBefore(pr,sv.nextSibling);}
  return card;
};
var _render=renderPlate;
renderPlate=function(){
  _render();
  ["pro","ink","veg"].forEach(function(c,i){var t=document.querySelectorAll("#v-plate .tiles .tile2")[i];if(t)t.classList.add("n-"+c);});
  /* the pairs now live in "Pair it", so the why card keeps only its lead line */
  var m=curMeal&&curRes()?curMeal():null;if(m&&SAMPLE[m.title]&&SAMPLE[m.title].pairs.length)document.querySelectorAll("#v-plate .card.why p:not(.lead)").forEach(function(p){p.remove();});
};
render();
})();
