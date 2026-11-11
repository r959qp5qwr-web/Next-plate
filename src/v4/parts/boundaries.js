/* ---------- boundaries: these filter, they never bend ---------- */
function leaveWords(){var out=[];M.leave.forEach(function(k){(ALIAS[k]||[]).forEach(function(w){if(out.indexOf(w)<0)out.push(w);});});return out;}
function hits(text,words){text=text.toLowerCase();for(var i=0;i<words.length;i++)if(text.indexOf(words[i])>=0)return true;return false;}
function fits(m){
  if(m.slots.indexOf(S.meal.charAt(0))<0)return false;
  if(DIETOK[M.diet].indexOf(m.d)<0)return false;
  if(M.diet==="jain"&&!m.j)return false;
  if(m.sits.indexOf(S.sit)<0)return false;
  if(hits(m.n+" "+m.items.map(function(i){return i.t;}).join(" "),leaveWords()))return false;
  return true;
}
function swapFor(m){
  var w=leaveWords();
  for(var i=0;i<m.swaps.length;i++){var s=m.swaps[i];if(DIETOK[M.diet].indexOf(s.d)<0)continue;if(M.diet==="jain"&&!s.j)continue;if(hits(s.t,w))continue;return s;}
  return null;
}

