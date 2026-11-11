/* ---------- first visit ---------- */
var DIETDOT={veg:"var(--veg)",egg:"var(--grain)",nonveg:"var(--chilli)",jain:"var(--haldi)",vegan:"var(--side)"};
var HEALTHSUB={none:"",diabetes:"Grain stays, sweets and juice stay off",bp:"No pickle, papad or added salt",kidney:"Plates stay with your coach and doctor",preg:"Plates stay with your coach and doctor"};
function tiles(k,isOn,set,subs){
  var g=el("div","grid2");g.setAttribute("role","radiogroup");g.setAttribute("aria-label",LAB[k]);
  OPT[k].forEach(function(o){var b=el("button","tile");b.type="button";b.id=k+"-"+o[0];b.setAttribute("role","radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    var d=el("i");if(k==="diet")d.style.setProperty("--dot",DIETDOT[o[0]]);else d.style.setProperty("--dot",o[0]==="none"?"var(--veg)":o[0]==="kidney"||o[0]==="preg"?"var(--chilli)":"var(--haldi)");
    var t=el("span",null,o[1]);if(subs&&subs[o[0]])t.appendChild(el("small",null,subs[o[0]]));
    add(b,d,t);b.addEventListener("click",function(){set(o[0]);});g.appendChild(b);});
  return g;
}
function choiceRow(k,isOn,set,cls,multi){
  var r=el("div",cls||"choice-row");r.setAttribute("role",multi?"group":"radiogroup");r.setAttribute("aria-label",LAB[k]);
  OPT[k].forEach(function(o){var b=el("button","choice",o[1]);b.type="button";b.id=k+"-"+o[0];b.setAttribute("role",multi?"checkbox":"radio");b.setAttribute("aria-checked",isOn(o[0])?"true":"false");
    b.addEventListener("click",function(){set(o[0]);});r.appendChild(b);});
  if(OPT[k].length===4&&!cls)r.style.gridTemplateColumns="repeat(4,minmax(0,1fr))";
  return r;
}
function foodGroups(host,inSheet){
  var q1=el("div","qs");q1.appendChild(el("h2",null,"What do you eat?"));
  q1.appendChild(tiles("diet",function(v){return M.diet===v;},function(v){M.diet=v;page=0;sel=0;save();inSheet?renderSheet():render();if(inSheet)render();}));
  var q2=el("div","qs");q2.appendChild(el("p","cap","Home food"));
  q2.appendChild(choiceRow("region",function(v){return M.region===v;},function(v){M.region=v;page=0;sel=0;save();inSheet?(renderSheet(),render()):render();}));
  var q3=el("div","qs");q3.appendChild(el("p","cap","Leave out completely"));
  q3.appendChild(choiceRow("leave",function(v){return M.leave.indexOf(v)>=0;},function(v){var i=M.leave.indexOf(v);if(i>=0)M.leave.splice(i,1);else M.leave.push(v);page=0;sel=0;save();inSheet?(renderSheet(),render()):render();},null,true));
  add(host,q1,q2,q3);
}
function healthGroup(host,inSheet){
  var q=el("div","qs");q.appendChild(el("h2",null,"Anything on the health side?"));
  q.appendChild(tiles("health",function(v){return M.health===v;},function(v){M.health=v;save();if(inSheet){renderSheet();render();}else render();},HEALTHSUB));
  host.appendChild(q);
}
function renderSetup(){
  var v=$("v-setup");v.textContent="";
  var h=el("div","setup-hero"),st=el("div","steps");st.appendChild(el("i","on"));st.appendChild(el("i",STEP>0?"on":null));
  add(h,st,el("h1",null,STEP===0?"Your next plate, every meal":"One more, then your plate"),el("p",null,STEP===0?"Two questions, asked once and kept on this phone. Your coach's food rules do the rest.":"This keeps advice safe. It never leaves this phone except as a rule for the plates."));
  v.appendChild(h);
  if(STEP===0){foodGroups(v,false);var nx=btn("btn primary","Next",null,"setup-next");nx.disabled=!M.diet;if(!M.diet)nx.style.opacity=".5";
    nx.addEventListener("click",function(){if(!M.diet)return;STEP=1;render();$("scroll").scrollTop=0;});v.appendChild(nx);}
  else{healthGroup(v,false);bodyGroup(v,false);var row=el("div","choice-row");row.style.gridTemplateColumns="1fr 2fr";
    var bk=btn("btn","Back",null,"setup-back");bk.addEventListener("click",function(){STEP=0;render();});
    var go=btn("btn primary","Show my plate",null,"setup-go");go.disabled=!M.health;if(!M.health)go.style.opacity=".5";
    go.addEventListener("click",function(){if(!M.health)return;M.done=true;save();FRESH=true;show("plate");});
    add(row,bk,go);v.appendChild(row);}
  v.appendChild(el("p","fine","Demonstration meals, not yet approved by your coach. General food guidance, not medical advice."));
}

