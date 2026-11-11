/* ---------- state ---------- */
var now=new Date(),hr=now.getHours()+now.getMinutes()/60;
var CLOCK=hr<4?"dinner":hr<11?"breakfast":hr<15.5?"lunch":hr<18.5?"snack":"dinner";
var MEALS=[["breakfast","Breakfast","sunrise",7.5,9.5],["lunch","Lunch","sun",12.5,14],["snack","Snack","cup",16,17.5],["dinner","Dinner","moon",19.5,21]];
var SITICON={home:"pan",rush:"bolt",tiffin:"tiffin",out:"store"},GOALICON={lose:"down",steady:"scale",strength:"dumbbell"};
var MODES=[["desk","Desk day","Mostly sitting","desk"],["active","Active day","Gym, sport or a long walk","dumbbell"],["trek","Trek day","A long hike or climb","mountain"],["rest","Rest day","Taking it easy","moon"]];
function modeOf(k){for(var i=0;i<MODES.length;i++)if(MODES[i][0]===k)return MODES[i];return MODES[0];}
function mealName(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][1];return k;}
function mealIcon(k){for(var i=0;i<4;i++)if(MEALS[i][0]===k)return MEALS[i][2];return "sun";}
var DAY=now.getFullYear()*10000+(now.getMonth()+1)*100+now.getDate();
var S={meal:CLOCK,sit:"home",hunger:"2",h10:5,goal:"steady",low:"none",mode:"desk"};
var M={diet:null,health:null,region:"n",leave:[],kg:0,done:false};
var LOG=[],DAYST={day:DAY,water:0,walk:{}};
try{var raw=JSON.parse(localStorage.getItem("np-peak")||"null");if(raw){
  if(lab("diet",raw.diet))M.diet=raw.diet;if(lab("health",raw.health))M.health=raw.health;if(lab("region",raw.region))M.region=raw.region;
  if(Array.isArray(raw.leave))M.leave=raw.leave.filter(function(k){return !!lab("leave",k);});
  if(+raw.kg>=30&&+raw.kg<=200)M.kg=Math.round(+raw.kg);
  M.done=!!raw.done&&!!M.diet&&!!M.health;
  if(lab("goal",raw.goal))S.goal=raw.goal;if(lab("low",raw.low))S.low=raw.low;
  if(raw.mode&&modeOf(raw.mode)[0]===raw.mode)S.mode=raw.mode;
  if(Array.isArray(raw.log))LOG=raw.log.filter(function(l){return l&&l.day===DAY&&typeof l.name==="string";}).slice(-4);
  if(raw.dayst&&raw.dayst.day===DAY)DAYST={day:DAY,water:Math.max(0,Math.min(20,+raw.dayst.water||0)),walk:raw.dayst.walk&&typeof raw.dayst.walk==="object"?raw.dayst.walk:{}};
}}catch(e){}
function save(){try{localStorage.setItem("np-peak",JSON.stringify({diet:M.diet,health:M.health,region:M.region,leave:M.leave,kg:M.kg,done:M.done,goal:S.goal,low:S.low,mode:S.mode,log:LOG,dayst:DAYST}));}catch(e){}}
var VIEW="plate",page=0,sel=0,SW={},ADJ=false,OPEN="",FRESH=true,STEP=0,LAYOUT="phone",USERLAYOUT="";
var TUNE={pro:false,gentle:false,quick:false},HAB={veg:false,walk:false,lemon:false},LABSRC="plate",RSEL="",RMOVES={};
function setHunger(v){S.h10=v;S.hunger=v<=3?"1":v<=7?"2":"3";}
function target(){return M.kg?M.kg:55;}                       /* protein for the day: 1 g per kg, a working target awaiting the coach */
function clockText(){var h=now.getHours(),m=now.getMinutes();return ((h%12)||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm");}
function hm(x){var h=Math.floor(x),m=Math.round((x-h)*60);return ((h%12)||12)+(m?":"+(m<10?"0":"")+m:"")+(h<12?" am":" pm");}
function blocked(){return M.done&&(M.health==="kidney"||M.health==="preg");}
function late(){return S.meal==="dinner"&&CLOCK==="dinner"&&hr>=21.5;}
function resetTune(){TUNE.pro=false;TUNE.gentle=false;}
