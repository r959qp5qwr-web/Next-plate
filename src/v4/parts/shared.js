/* ---------- small shared pieces ---------- */
var toastT=0;
function toast(t){var n=$("toast");$("toasttxt").textContent=t;n.hidden=false;n.style.animation="none";void n.offsetWidth;n.style.animation="";clearTimeout(toastT);toastT=setTimeout(function(){n.hidden=true;},2600);$("said").textContent=t;}
function waLink(txt){var a=el("a","mini wa");a.href="https://wa.me/?text="+encodeURIComponent(txt);a.target="_blank";a.rel="noopener";a.appendChild(ic("wa"));a.appendChild(el("span",null,"WhatsApp"));return a;}
function copyBtn(txt,id,onDone){var b=btn("mini","Copy","copy",id);b.addEventListener("click",function(){
  if(onDone)onDone();
  function ok(){toast("Copied. Paste it in WhatsApp.");}
  function fail(){toast("Copying is blocked here. Use the WhatsApp button instead.");}
  try{navigator.clipboard.writeText(txt).then(ok,fail);}catch(e){fail();}});return b;}
function setPressed(b,on,attr){b.setAttribute(attr||"aria-pressed",on?"true":"false");return b;}

