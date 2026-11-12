/* ===== v6 plate art (owner-approved items 1 and 3): stoneware plate with ceramic depth and speckle, and the portion ring at the well's edge.
   Wraps thali() from the v5 helpers, so every plate in v6 (hero, waiting, alternatives) gets it. ===== */
var NUTC={protein:"pro",greens:"veg",carbs:"grain",fats:"side",other:"other"},NUTNAME={protein:"Protein foods",greens:"Vegetables",carbs:"Grains and starch",fats:"Fats and seeds",other:"Other"},NUTORDER=["protein","greens","carbs","fats","other"];
function gramsBy(items){var a={protein:0,greens:0,carbs:0,fats:0,other:0};(items||[]).forEach(function(it){a[it.group in a?it.group:"other"]+=it.grams||0;});return a;}
var _thali=thali,PLID=0;
thali=function(items,size,label,dial){
  var s=_thali(items,size,label,dial),id="sw"+(PLID++),defs=s.querySelector("defs"),cs=s.querySelectorAll(":scope > circle"),base=cs[0],glaze=cs[1],well=cs[2],wr=dial?88:98;
  function grad(gid,cx,cy,r,stops){var g=svgEl("radialGradient",{id:id+gid,cx:cx,cy:cy,r:r,fx:cx,fy:cy});stops.forEach(function(x){var st=svgEl("stop",{offset:x[0]});st.style.stopColor=x[1];if(x[2]!=null)st.style.stopOpacity=x[2];g.appendChild(st);});defs.appendChild(g);return "url(#"+id+gid+")";}
  base.style.fill=grad("r",".35",".30",".96",[["0","#EFE8DA"],[".68","#DFD5C3"],[".94","#C4B49E"],["1","#B38A6A"]]);
  glaze.style.fill="none";glaze.setAttribute("stroke","rgba(255,252,244,.55)");glaze.setAttribute("stroke-width","1");
  well.style.fill=grad("w",".45",".40",".62",[["0","#F7F2E7"],[".8","#E8DFCE"],["1","#D5C7B2"]]);
  var sh=svgEl("circle",{cx:"120",cy:"120",r:String(wr)});sh.style.fill=grad("s",".56",".60",".56",[["0","#5A4232",0],[".86","#5A4232",0],["1","#5A4232",.2]]);
  well.parentNode.insertBefore(sh,well.nextSibling);
  var hl=svgEl("path",{d:"M40,72 A93,93 0 0,1 92,24",fill:"none",stroke:"#FFFDF6","stroke-width":"2.4","stroke-linecap":"round",opacity:".55"});well.parentNode.insertBefore(hl,sh.nextSibling);
  function rnd(i){var x=Math.sin(i*91.7+17.3)*24634.6345;return x-Math.floor(x);}
  for(var i=0;i<90;i++){var a=rnd(i)*6.283,d=Math.sqrt(rnd(i+300))*116,sp=svgEl("circle",{cx:(120+Math.cos(a)*d).toFixed(1),cy:(120+Math.sin(a)*d).toFixed(1),r:(.3+rnd(i+600)*.8).toFixed(2)});
    sp.style.fill=i%4?"#4E3A2A":"#FFFBF2";sp.style.opacity=i%4?(.18+rnd(i+900)*.3).toFixed(2):".7";well.parentNode.insertBefore(sp,hl.nextSibling);}
  var g=gramsBy(items),tot=NUTORDER.reduce(function(t,k){return t+g[k];},0);
  if(tot>0){
    var R=wr+5,C=2*Math.PI*R,keys=NUTORDER.filter(function(k){return g[k]>0;}),gap=keys.length>1?3:0,off=0,ring=svgEl("g",{"class":"pr"});
    ring.appendChild(svgEl("circle",{cx:"120",cy:"120",r:String(R),fill:"none",stroke:"rgba(122,90,60,.12)","stroke-width":"5"}));
    keys.forEach(function(k){var len=Math.max(1,g[k]/tot*C-gap),c=svgEl("circle",{cx:"120",cy:"120",r:String(R),"class":"pr-arc","stroke-width":"5",transform:"rotate(-90 120 120)","stroke-dasharray":len.toFixed(1)+" "+(C-len).toFixed(1),"stroke-dashoffset":(-off-gap/2).toFixed(1)});
      c.style.stroke="var(--"+NUTC[k]+")";ring.appendChild(c);off+=g[k]/tot*C;});
    well.parentNode.insertBefore(ring,s.querySelector(".th-item"));
    s.setAttribute("aria-label",(label||"Your plate")+". Portions by weight: "+keys.map(function(k){return NUTNAME[k].toLowerCase()+" "+g[k]+" g";}).join(", ")+".");
  }
  return s;
};
