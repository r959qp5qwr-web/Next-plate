/* ---------- voice: speak the question, hear the plate ---------- */
var dictNs=null,ttsNs=null,recog=null,listening=false,speaking=false,micBase="";
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function canSpeak(){return !!(ttsNs||(HOSTED&&window.speechSynthesis&&window.SpeechSynthesisUtterance));}
function syncVoice(){
  var m=$("micbtn");if(m){m.hidden=!(dictNs||(HOSTED&&SR));m.setAttribute("aria-pressed",listening?"true":"false");m.setAttribute("aria-label",listening?"Stop listening":"Speak your question");}
  var l=$("listen");if(l){l.setAttribute("aria-pressed",speaking?"true":"false");var sp=l.querySelector("span");if(sp)sp.textContent=speaking?"Stop":"Listen";}
}
if(!HOSTED&&window.claude&&typeof window.claude.use==="function"){
  window.claude.use("dictation").then(function(d){if(!d)return;dictNs=d;
    d.onPartial(function(e){$("askin").value=(micBase+e.text).slice(0,240);});
    d.onFinal(function(e){micBase=(micBase+e.text+" ").slice(0,240);$("askin").value=micBase;});
    d.onState(function(e){listening=e.state==="listening"||e.state==="starting";syncVoice();});syncVoice();},function(){});
  window.claude.use("tts").then(function(t){if(!t)return;ttsNs=t;t.onState(function(e){speaking=e.state==="speaking"||e.state==="starting";syncVoice();});if(M.done)render();},function(){});
}
function toggleMic(){
  if(dictNs){
    if(listening){dictNs.stop().catch(function(){});return;}
    micBase=$("askin").value?$("askin").value+" ":"";
    dictNs.start().catch(function(e){if(e&&e.code==="not_granted"){dictNs=null;syncVoice();toast("The microphone is off for this page. Typing still works.");}});return;
  }
  if(!SR)return;
  if(listening&&recog){try{recog.stop();}catch(e){}return;}
  recog=new SR();recog.lang="en-IN";recog.interimResults=true;recog.continuous=false;micBase=$("askin").value?$("askin").value+" ":"";
  recog.onresult=function(ev){var t="";for(var i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;$("askin").value=(micBase+t).slice(0,240);};
  recog.onend=function(){listening=false;syncVoice();};
  recog.onerror=function(){listening=false;syncVoice();toast("Couldn't hear that. Try again, or type it.");};
  try{recog.start();listening=true;syncVoice();}catch(e){}
}
function sayText(text){
  if(speaking){if(ttsNs)ttsNs.stop().catch(function(){});else if(window.speechSynthesis)window.speechSynthesis.cancel();speaking=false;syncVoice();return;}
  if(ttsNs){ttsNs.speak(text.slice(0,1900)).catch(function(e){if(e&&e.code==="not_granted"){ttsNs=null;render();}});return;}
  if(HOSTED&&window.speechSynthesis){var u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=.95;u.onend=u.onerror=function(){speaking=false;syncVoice();};speaking=true;syncVoice();window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
}
$("micbtn").addEventListener("click",toggleMic);
