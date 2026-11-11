/* ---------- quantities in words ---------- */
function numTxt(n){var w=Math.floor(n+1e-6),fr=Math.round((n-w)*100),g=fr===50?"½":fr===25?"¼":fr===75?"¾":"";return g?(w?w:"")+g:String(Math.round(n*100)/100);}
function plainN(n){return n===.5?"Half":n===.25?"A quarter":String(Math.round(n*100)/100);}
var PLUR={piece:"pieces",slice:"slices",glass:"glasses",bowl:"bowls",plate:"plates",teaspoon:"teaspoons",tablespoon:"tablespoons",fistful:"fistfuls"};
function unitTxt(n,u){if(u==="eggs")return n===1?"egg":"eggs";if(u==="pieces")return n===1?"piece":"pieces";return n>1&&PLUR[u]?PLUR[u]:u;}
function qShow(it){return it.label&&!it.delta?it.label.replace(" or ","–"):numTxt(it.n);}
function lineText(it){var u=unitTxt(it.n,it.u);return (it.label&&!it.delta?it.label:plainN(it.n))+(u?" "+u:"")+" "+it.t;}
function shortOf(it){return it.short||it.t.split(/,| with | or | in | as /)[0];}
function summary(items){return items.filter(function(i){return !(i.n<=.5&&i.u===""&&!i.role)&&groupOf(i)!=="garnish";}).map(function(i){var u=unitTxt(i.n,i.u);return qShow(i)+(u&&u!=="small"?" "+u:"")+" "+shortOf(i);}).join(" · ");}

