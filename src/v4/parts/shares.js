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

