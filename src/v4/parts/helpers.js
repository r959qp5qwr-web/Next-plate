var $=function(id){return document.getElementById(id);};
var NS="http://www.w3.org/2000/svg";
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function ic(name){var s=document.createElementNS(NS,"svg");s.setAttribute("class","i");s.setAttribute("aria-hidden","true");var u=document.createElementNS(NS,"use");u.setAttribute("href","#i-"+name);s.appendChild(u);return s;}
function btn(cls,label,icon,id){var b=el("button",cls);b.type="button";if(id)b.id=id;if(icon)b.appendChild(ic(icon));if(label!=null)b.appendChild(el("span",null,label));return b;}
function add(p){for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c)p.appendChild(c);}return p;}
function hash01(a){a=Math.imul(a^0x9E3779B9,2654435761);a^=a>>>15;a=Math.imul(a,2246822519);a^=a>>>13;return ((a>>>0)%100003)/100003;}

