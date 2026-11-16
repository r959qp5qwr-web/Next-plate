const fs=require('fs');const page=fs.readFileSync(''+require('path').join(__dirname,'../../hosted')+'/v6/index.min.html','utf8');
const o='<script id="np-core">',a=page.indexOf(o)+o.length;(0,eval)(page.slice(a,page.indexOf('</script>',a)));
const C=[
// kidney: misspellings and unlisted terms
['k','kydney stone last year, what should I eat'],['k','my kideney report came back weak'],['k','gurrda kharab hai doctor ne bola'],
['k','renel problem, low salt please'],['k','on dialisis twice a week'],['k','I do dyalisis on mondays'],['k','hemodialisis patient, lunch ideas'],
['k','creatinin is 2.4 this month'],['k','nefrologist told me less protein'],['k','mutrapind ki bimari hai'],['k','vrukka problem undu, lunch'],
['k','urine mein protien aata hai'],['k','my kidnee function is low'],['k','kidnes not working well'],['k','KD stage 3, light dinner'],
['k','one of my kindeys was removed'],['k','gurdey mein pathri thi'],['k','doctor says my GFR dropped'],
// pregnancy and breastfeeding
['p','I am 8 mnths along, lunch idea'],['p','baby on the way, what should I eat'],['p','bun in the oven, need dinner'],['p','in my third tri now'],
['p','pumping milk for my baby'],['p','I am lactacting, need more food'],['p','pet mein baccha hai, khana batao'],['p','doctor said I am gravid'],
['p','expectant mother here, breakfast please'],['p','brestfeeding my son'],['p','brest feed my daughter, need snacks'],['p','delivered a baby 6 weeks ago'],
['p','pregnet 5 months'],['p','preganant, lunch please'],['p','first baby coming in april'],['p','I am in my 2nd trimster'],['p','we are expecting in june'],
['p','im prego with twins'],['p','junior arriving soon, light dinner'],['p','dudh pilati hoon baby ko'],['p','bacche ko feed karti hoon'],['p','kuch mahine mein maa banne wali hoon'],
];
const miss=C.filter(([g,t])=>!referTyped(t)), hit=C.filter(([g,t])=>referTyped(t));
console.log('caught by engine (dropped):');hit.forEach(x=>console.log('  ',x[1]));
console.log('missed ('+miss.length+'):');miss.forEach(x=>console.log('  ',x[0],x[1]));
fs.writeFileSync('missed.json',JSON.stringify(miss));
