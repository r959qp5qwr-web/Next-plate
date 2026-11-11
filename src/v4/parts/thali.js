/* ---------- the plate: speckled stoneware with a clay rim. The rim carries the meals; the food sits in the well ---------- */
var TID=0;
function foodKind(it){
  var t=(it.t||"").toLowerCase(),u=it.u;
  if(/^lemon|lemon, squeezed/.test(t))return "lemon";
  if(u==="glass")return /chai|tea|coffee/.test(t)?"chai":"milk";
  if(/phulka|roti|chapati|naan|khakhra|toast|bread|pav/.test(t))return "roti";
  if(/idli/.test(t))return "idli";if(/dosa|uttapam|chilla|cheela/.test(t))return "dosa";
  if(/egg|omelette/.test(t))return /bhurji|omelette/.test(t)?"bhurji":"egg";
  if(/curd rice/.test(t))return "rice";if(/khichdi|poha|upma|dalia|pulao|biryani|broken wheat|millet/.test(t))return "yrice";if(/rice/.test(t))return "rice";
  if(/salad|kachumber|cucumber|sticks|tomato/.test(t))return "salad";
  if(/curd|raita|dahi|hung|dip|chhena/.test(t))return "curd";
  if(/paneer|tofu/.test(t))return "paneer";
  if(/rajma|chole|chana|lobia/.test(t))return u==="fistful"?"nuts":"beans";
  if(/sprout|sundal/.test(t))return "sprouts";
  if(/chicken|fish|soya|mutton/.test(t))return "curry";
  if(/dal|sambar|kadhi|soup|rasam|dalma/.test(t))return "dal";
  if(/chutney/.test(t))return "chutney";
  if(/fruit|guava|apple|orange|pear|banana|papaya|corn/.test(t))return "fruit";
  if(/peanut|almond|walnut|nut|makhana/.test(t))return "nuts";
  return "sabzi";
}
/* muted, glaze-like food tones that sit with clay and olive */
var FOODC={dal:"#D6A548",beans:"#8E4A2E",sabzi:"#7C8A45",curd:"#F7F1E4",paneer:"#C9784A",curry:"#A4532F",sprouts:"#B9B07A",chutney:"#6F7F3E",bhurji:"#DDB75A",milk:"#F7F1E4",chai:"#B88A60",salad:"#9AA867",rice:"#F6F0E2",yrice:"#E2C27A",roti:"#D9B888",idli:"#F7F1E4",dosa:"#D7A75C",egg:"#F7F1E4",fruit:"#D17E45",nuts:"#A9774B"};
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
    var leaf=svgEl("path",{d:"M0,-9 C5,-4 5,4 0,9 C-5,4 -5,-4 0,-9 Z","class":"th-leaf",transform:"translate("+lx.toFixed(1)+","+ly.toFixed(1)+") rotate("+(ang*180/Math.PI+90).toFixed(1)+")"});s.appendChild(leaf);
  }
  var list=items.filter(function(it){return foodKind(it)!=="lemon"&&!(/chutney/.test(it.t)&&it.u!=="katori");}).slice(0,6),n=list.length,lim=dial?.86:1;
  var R=(n<=1?0:n===2?44:n===3?48:n===4?50:54)*lim,maxr=(n<=1?54:n===2?36:n===3?33:n===4?30:26)*lim,around=n>=5?n-1:n;
  function dots(g,cx,cy,r,cols,count,sz,seed){for(var i=0;i<count;i++){var a=rnd(seed+i)*6.283,d=Math.sqrt(rnd(seed+i+50))*r*.78,c=svgEl("circle",{cx:String(cx+Math.cos(a)*d),cy:String(cy+Math.sin(a)*d),r:String(sz*(.7+rnd(seed+i+9)*.6))});c.style.fill=cols[i%cols.length];g.appendChild(c);}}
  list.forEach(function(it,i){
    var k=foodKind(it),v=Math.max(.55,Math.min(1.2,.72+volOf(it)*.22)),r=Math.round(maxr*Math.min(1,v)),cx=120,cy=120;
    if(n>1&&!(n>=5&&i===n-1)){var a=(-90+(n===2?-90:0)+i*360/around)*Math.PI/180;cx=120+Math.cos(a)*R;cy=120+Math.sin(a)*R;}else if(n>=5)r=Math.round(maxr*.85);
    var g=svgEl("g",{"class":"th-item"+(it.tag==="added"?" new":"")});g.style.transformOrigin=cx+"px "+cy+"px";g.style.animationDelay=(i*50)+"ms";
    function circ(x,y,rr,fill,cls){var c=svgEl("circle",{cx:String(x),cy:String(y),r:String(rr)});if(fill)c.style.fill=fill;if(cls)c.setAttribute("class",cls);g.appendChild(c);return c;}
    var cnt=Math.max(1,Math.min(4,Math.round(it.n))),j,fc=FOODC[k]||FOODC.sabzi;
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
/* a pressed olive sprig, drawn in ink */
function sprig(cls){
  var s=svgEl("svg",{viewBox:"0 0 120 60","class":"sprig "+(cls||""),"aria-hidden":"true"});
  s.appendChild(svgEl("path",{d:"M4,52 C30,40 60,30 116,8","class":"sp-stem"}));
  [[18,46,-30],[30,40,150],[42,36,-35],[54,31,150],[66,27,-38],[78,22,152],[90,18,-40],[102,13,150]].forEach(function(x){
    s.appendChild(svgEl("path",{d:"M0,0 C4,-5 13,-6 18,-3 C13,1 5,2 0,0 Z","class":"sp-leaf",transform:"translate("+x[0]+","+x[1]+") rotate("+x[2]+")"}));});
  return s;
}
