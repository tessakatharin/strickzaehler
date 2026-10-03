var KEY="strickzaehler-v3",OLD="strickzaehler-v2",arcOpen=false,S=null;
function defC(n){return {id:uid(),name:n,secs:[{rows:0,inc:0,dec:0,incMode:"every",decMode:"every",incList:"",decList:"",first:false}],cur:0,row:0,dec:0,inc:0,tot:0,hist:[]};}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
var D={projects:[],view:{v:"i",p:null,c:null}};
try{
  var r=localStorage.getItem(KEY);
  if(r){var q=JSON.parse(r);if(q&&q.projects)D=q;}
  else{var o=localStorage.getItem(OLD);if(o){var c=JSON.parse(o);if(c&&c.secs&&c.secs.length){c.id=uid();c.name="Zähler 1";D.projects.push({id:uid(),name:"Mein Projekt",archived:false,counters:[c]});}}}
}catch(e){}
function norm(){D.projects.forEach(function(pr){pr.counters.forEach(function(x){x.secs.forEach(function(s){if(!s.incMode)s.incMode='every';if(!s.decMode)s.decMode='every';if(s.incList==null)s.incList='';if(s.decList==null)s.decList='';if(s.first==null)s.first=true;});if(!x.hist)x.hist=[];});});}
norm();
function save(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function P(id){return D.projects.filter(function(x){return x.id===id;})[0];}
function sum(c){var s=c.secs[c.cur],last=c.cur===c.secs.length-1;
  if(!(s.rows>0))return "Muster noch leer";
  if(c.row>=s.rows)return last?"fertig":"Abschnitt "+(c.cur+1)+" abgeschlossen";
  return "Abschnitt "+(c.cur+1)+" · Reihe "+(c.row+1)+" von "+s.rows;}
function show(v,p,c){D.view={v:v,p:p||null,c:c||null};save();renderAll();window.scrollTo(0,0);}
function up(){if(D.view.v==="c")show("p",D.view.p);else show("i");}
var dcb=null;
function ask(msg,def,inp,okt,cb){
  var i=document.getElementById("di");
  document.getElementById("dm").textContent=msg;i.hidden=!inp;i.value=def||"";
  document.getElementById("dok").textContent=okt||"OK";
  dcb=cb;document.getElementById("ov").hidden=false;
  if(inp)setTimeout(function(){i.focus();i.select();},50);
}
function dclose(ok){var cb=dcb,v=document.getElementById("di").value.trim();dcb=null;document.getElementById("ov").hidden=true;if(ok&&cb)cb(v);}
function newP(){ask("Name des Projekts:","",true,"Anlegen",function(n){if(!n)return;D.projects.push({id:uid(),name:n,archived:false,counters:[defC("Zähler 1")]});save();renderAll();});}
function renP(id){var pr=P(id);ask("Neuer Name:",pr.name,true,"Speichern",function(n){if(!n)return;pr.name=n;save();renderAll();});}
function arcP(id,f){P(id).archived=f;save();renderAll();}
function delP(id){var pr=P(id);ask("„"+pr.name+"“ mit allen Zählern endgültig löschen?","",false,"Löschen",function(){D.projects=D.projects.filter(function(x){return x.id!==id;});save();renderAll();});}
function newC(){var pr=P(D.view.p);ask("Name des Zählers:","",true,"Anlegen",function(n){if(!n)return;pr.counters.push(defC(n));save();renderAll();});}
function renC(id){var c=P(D.view.p).counters.filter(function(x){return x.id===id;})[0];ask("Neuer Name:",c.name,true,"Speichern",function(n){if(!n)return;c.name=n;save();renderAll();});}
function delC(id){var pr=P(D.view.p),c=pr.counters.filter(function(x){return x.id===id;})[0];ask("Zähler „"+c.name+"“ endgültig löschen?","",false,"Löschen",function(){pr.counters=pr.counters.filter(function(x){return x.id!==id;});save();renderAll();});}
function pcard(pr,arch){
  var ln=pr.counters.length?pr.counters.map(function(c){return '<div class="ln">'+esc(c.name)+': '+sum(c)+'</div>';}).join(""):'<div class="ln">Noch keine Zähler</div>';
  return '<div class="card pj"><div class="pjmain" onclick="show(\'p\',\''+pr.id+'\')"><b>'+esc(pr.name)+'</b>'+ln+'</div><div class="tools">'
   +'<button class="ghost" onclick="renP(\''+pr.id+'\')">Umbenennen</button>'
   +(arch?'<button class="ghost" onclick="arcP(\''+pr.id+'\',false)">Wiederherstellen</button>':'<button class="ghost" onclick="arcP(\''+pr.id+'\',true)">Archivieren</button>')
   +'<button class="ghost" onclick="delP(\''+pr.id+'\')">Löschen</button></div></div>';
}
var wl=null;
function reqWake(){try{navigator.wakeLock.request("screen").then(function(l){wl=l;l.addEventListener("release",function(){wl=null;});}).catch(function(){});}catch(e){}}
function relWake(){if(wl){try{wl.release();}catch(e){}wl=null;}}
function wake(on){D.wake=!!on;save();if(on)reqWake();else relWake();}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&D.wake&&D.view.v==="c"&&!wl&&"wakeLock" in navigator)reqWake();});
function bmsg(m){document.getElementById("bm").textContent=m;}
function bkShow(){document.getElementById("bt").value=JSON.stringify(D);bmsg("Text erzeugt. Zum Sichern kopieren oder als Datei speichern.");}
function bkCopy(){bkShow();var ta=document.getElementById("bt");
  function fb(){ta.focus();ta.select();try{document.execCommand("copy");bmsg("Kopiert.");}catch(e){bmsg("Bitte den markierten Text von Hand kopieren.");}}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){bmsg("Kopiert.");},fb);}else fb();}
function bkFile(){try{var b=new Blob([JSON.stringify(D)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="strickzaehler-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();bmsg("Datei erzeugt. Falls nichts passiert, „Kopieren“ nutzen.");}catch(e){bmsg("Speichern nicht möglich. Bitte „Kopieren“ nutzen.");}}
function bkLoad(inp){var f=inp.files&&inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){document.getElementById("bt").value=r.result;bmsg("Datei geladen. Zum Übernehmen „Importieren“ tippen.");};r.readAsText(f);inp.value="";}
function bkImport(){var q;try{q=JSON.parse(document.getElementById("bt").value);}catch(e){bmsg("Der Text ist kein gültiger Stand.");return;}
  if(!q||!Array.isArray(q.projects)||q.projects.some(function(p){return !p||!Array.isArray(p.counters);})){bmsg("Der Text ist kein gültiger Stand.");return;}
  ask("Den aktuellen Stand durch den importierten ersetzen?","",false,"Ersetzen",function(){D=q;if(!D.view)D.view={v:"i",p:null,c:null};D.view={v:"i",p:null,c:null};norm();save();renderAll();document.getElementById("bt").value="";bmsg("Importiert: "+D.projects.length+" Projekt(e).");});}
function renderAll(){
  var v=D.view.v,pr=D.view.p?P(D.view.p):null,c=null;
  if(pr&&v==="c")c=pr.counters.filter(function(x){return x.id===D.view.c;})[0];
  if(v==="c"&&!c)v=pr?"p":"i";
  if(v==="p"&&!pr)v="i";
  D.view.v=v;
  document.getElementById("vi").hidden=v!=="i";
  document.getElementById("vp").hidden=v!=="p";
  document.getElementById("vc").hidden=v!=="c";
  if(v==="c"&&D.wake&&"wakeLock" in navigator){if(!wl)reqWake();}else relWake();
  if(v==="i"){
    var act=D.projects.filter(function(x){return !x.archived;}),ar=D.projects.filter(function(x){return x.archived;});
    document.getElementById("pl").innerHTML=act.length?act.map(function(x){return pcard(x,false);}).join(""):'<p class="hint">Noch kein Projekt. Lege unten das erste an.</p>';
    document.getElementById("al").innerHTML=ar.length?'<details class="card"'+(arcOpen?' open':'')+' ontoggle="arcOpen=this.open"><summary>Archiv ('+ar.length+')</summary>'+ar.map(function(x){return pcard(x,true);}).join("")+'</details>':'';
  }else if(v==="p"){
    document.getElementById("pt").textContent=pr.name;
    document.getElementById("cl").innerHTML=pr.counters.length?pr.counters.map(function(x){
      return '<div class="card pj"><div class="pjmain" onclick="show(\'c\',\''+pr.id+'\',\''+x.id+'\')"><b>'+esc(x.name)+'</b><div class="ln">'+sum(x)+'</div></div><div class="tools"><button class="ghost" onclick="renC(\''+x.id+'\')">Umbenennen</button><button class="ghost" onclick="delC(\''+x.id+'\')">Löschen</button></div></div>';
    }).join(""):'<p class="hint">Noch keine Zähler in diesem Projekt.</p>';
  }else{
    S=c;
    document.getElementById("wlc").checked=!!D.wake;
    document.getElementById("ct").textContent=c.name;
    document.getElementById("cs").textContent=pr.name;
    render();
  }
}
function parseList(str){
  var o={};String(str||"").split(/[,;\s]+/).forEach(function(tok){
    var m=tok.match(/^(\d+)(?:-(\d+))?$/);if(!m)return;
    var a=+m[1],b=m[2]?+m[2]:a;for(var i=a;i<=b&&i-a<500;i++)o[i]=1;
  });return o;
}
function hit(n,s,t){
  if(s[t+"Mode"]==="list")return !!parseList(s[t+"List"])[n];
  var k=s[t];if(!(k>0))return false;
  return s.first?((n-1)%k===0):(n%k===0);
}
function sec(){return S.secs[S.cur];}
function snap(){S.hist.push({cur:S.cur,row:S.row,dec:S.dec,inc:S.inc,tot:S.tot});if(S.hist.length>200)S.hist.shift();}
function next(){
  var s=sec();if(!(s.rows>0))return;
  if(S.row>=s.rows){ if(S.cur<S.secs.length-1){snap();S.cur++;S.row=0;} save();render();return; }
  snap();
  var n=S.row+1;S.row=n;S.tot++;
  if(hit(n,s,'inc'))S.inc++;
  if(hit(n,s,'dec'))S.dec++;
  save();render();
  if(navigator.vibrate){try{navigator.vibrate(10);}catch(e){}}
}
function undo(){var h=S.hist.pop();if(!h)return;S.cur=h.cur;S.row=h.row;S.dec=h.dec;S.inc=h.inc;S.tot=h.tot;save();render();}
function man(k,d){
  if(S[k]+d<0)return;
  if(k!=="tot"&&S.tot+d<0)return;
  S[k]+=d;if(k!=="tot")S.tot+=d;save();render();
}
function addSec(){var l=S.secs[S.secs.length-1];S.secs.push(JSON.parse(JSON.stringify(l)));save();render();}
function delSec(i){
  if(S.secs.length<2)return;
  S.secs.splice(i,1);
  if(S.cur>=S.secs.length){S.cur=S.secs.length-1;}
  else if(i<S.cur){S.cur--;}
  if(S.row>sec().rows)S.row=sec().rows;
  save();render();
}
function setActive(i){if(i===S.cur)return;snap();S.cur=i;S.row=0;save();render();}
function edit(i,k,v){
  if(k==="incList"||k==="decList"||k==="incMode"||k==="decMode"){S.secs[i][k]=v;save();render(k.indexOf("Mode")>0?false:true);return;}
  if(k==="first"){S.secs[i].first=!!v;save();render(true);return;}
  v=Math.max(0,parseInt(v,10)||0);
  S.secs[i][k]=v;
  if(i===S.cur&&S.row>S.secs[i].rows)S.row=S.secs[i].rows;
  save();render(true);
}
var armT=null;
function resetAll(){
  var b=document.getElementById("reset");
  if(!b.dataset.armed){b.dataset.armed=1;b.textContent="Nochmal tippen";armT=setTimeout(dis,3000);return;}
  S.cur=0;S.row=0;S.dec=0;S.inc=0;S.tot=0;S.hist=[];save();dis();render();
}
function dis(){clearTimeout(armT);var b=document.getElementById("reset");delete b.dataset.armed;b.textContent="Alles zurücksetzen";}
function task(n,s){
  var a=[];if(hit(n,s,"inc"))a.push("Zunahme");if(hit(n,s,"dec"))a.push("Abnahme");
  return a.length?a.join(" + "):"glatt stricken";
}
function blk(i,x,k,name){
  var m=x[k+"Mode"],inp=m==="list"
   ?'<input type="text" placeholder="z. B. 3, 7, 12-14" value="'+String(x[k+"List"]).replace(/"/g,"&quot;")+'" onchange="edit('+i+',\''+k+'List\',this.value)">'
   :'<input type="number" inputmode="numeric" min="0" placeholder="0" value="'+(x[k]||"")+'" onchange="edit('+i+',\''+k+'\',this.value)">';
  return '<div class="blk"><div class="fields"><label>'+name+'<select onchange="edit('+i+',\''+k+'Mode\',this.value)"><option value="every"'+(m==="every"?" selected":"")+'>alle … Reihen</option><option value="list"'+(m==="list"?" selected":"")+'>Einzelreihen</option></select></label><label>'+(m==="list"?"Reihennummern":"Intervall (0 = keine)")+inp+'</label></div></div>';
}
function render(keepSecs){
  var s=sec(),$=function(i){return document.getElementById(i);};
  ["dec","inc","tot"].forEach(function(k){$(k).textContent=S[k];});
  var empty=!(s.rows>0),done=!empty&&S.row>=s.rows,last=S.cur===S.secs.length-1;
  $("rn").textContent="Abschnitt "+(S.cur+1)+" von "+S.secs.length+" · "+(empty?"Muster noch leer":done?"alle "+s.rows+" Reihen gestrickt":"Reihe "+(S.row+1)+" von "+s.rows);
  var t=$("task");
  if(empty){t.textContent="Reihenzahl eintragen";t.style.color="var(--muted)";}
  else if(done){t.textContent=last?"Fertig 🎉":"Abschnitt abgeschlossen";t.style.color="var(--inc)";}
  else{var tx=task(S.row+1,s);t.textContent=tx;t.style.color=tx==="glatt stricken"?"var(--muted)":(tx.indexOf("Abnahme")>=0&&tx.indexOf("Zunahme")<0?"var(--dec)":tx.indexOf("Zunahme")>=0&&tx.indexOf("Abnahme")<0?"var(--inc)":"var(--text)");}
  var g=$("go");
  g.textContent=empty?"Reihe fertig":done?(last?"Letzter Abschnitt erledigt":"Nächster Abschnitt →"):"Reihe "+(S.row+1)+" fertig";
  g.disabled=empty||(done&&last);
  $("undo").disabled=!S.hist.length;
  var h="";
  for(var n=1;n<=s.rows;n++){
    var zi=hit(n,s,'inc'),ai=hit(n,s,'dec'),m="";if(zi)m+='<i class="z">Z</i>';if(ai)m+='<i class="a" style="'+(zi?'right:auto;left:2px':'')+'">A</i>';
    h+='<div class="chip'+(n<=S.row?' done':'')+(n===S.row+1?' cur':'')+'">'+n+m+'</div>';
  }
  $("chips").innerHTML=h;
  if(keepSecs)return;
  var o="";
  S.secs.forEach(function(x,i){
    o+='<div class="sec'+(i===S.cur?' act':'')+'"><div class="sechead"><span>Abschnitt '+(i+1)+(i===S.cur?' · aktiv':'')+'</span><span>'
     +(i!==S.cur?'<button onclick="setActive('+i+')">Starten</button> ':'')
     +(S.secs.length>1?'<button class="ghost" onclick="delSec('+i+')">Löschen</button>':'')+'</span></div>'
     +'<div class="fields" style="grid-template-columns:1fr"><label>Reihen gesamt<input type="number" inputmode="numeric" min="1" placeholder="z. B. 18" value="'+(x.rows||"")+'" onchange="edit('+i+',\'rows\',this.value)"></label></div>'
     +blk(i,x,'inc','Zunahme')+blk(i,x,'dec','Abnahme')
     +'<label class="chk"><input type="checkbox"'+(x.first?' checked':'')+' onchange="edit('+i+',\'first\',this.checked)">Intervall beginnt mit Reihe 1 (1, 1+n, 1+2n …)</label>'
     +'</div></div>';
  });
  $("secs").innerHTML=o;
}
if("wakeLock" in navigator)document.getElementById("wl").hidden=false;
renderAll();
if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){});});}
