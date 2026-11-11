/* ---------- My food sheet ---------- */
function openSheet(){$("sheet").hidden=false;renderSheet();var d=$("sheet-done");if(d)d.focus();}
function closeSheet(){$("sheet").hidden=true;$("myfood").focus();}
function renderSheet(){
  var sh=$("sheet");sh.textContent="";
  var c=el("div","sheet-card");c.setAttribute("role","dialog");c.setAttribute("aria-modal","true");c.setAttribute("aria-label","My food");
  var hd=el("div","sheet-h");hd.appendChild(el("h2",null,"My food"));var dn=btn("goal-btn","Done",null,"sheet-done");dn.addEventListener("click",closeSheet);hd.appendChild(dn);
  add(c,el("div","grab"),hd);foodGroups(c,true);healthGroup(c,true);bodyGroup(c,true);
  c.appendChild(el("p","fine","Kept on this phone only. Plates and answers always follow these."));
  sh.appendChild(c);
}
$("sheet").addEventListener("click",function(e){if(e.target===this)closeSheet();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!$("sheet").hidden)closeSheet();});
$("myfood").addEventListener("click",openSheet);

