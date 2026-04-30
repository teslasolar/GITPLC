// views.js — tab views for explorer, programs, alarms, kpi, tags
function switchView(tab){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab)});
  var main=document.getElementById('main-panel');
  if(tab==='explorer')renderExplorer(main);
  else if(tab==='programs')renderPrograms(main);
  else if(tab==='alarms')renderAlarms(main);
  else if(tab==='kpi')renderKPIs(main);
  else if(tab==='tags')renderTags(main);
}

function renderExplorer(el){
  var udts=getAllUDTs();var keys=Object.keys(udts);
  el.innerHTML='<div class="stats-row">'+
    stat(keys.length,'UDTs','var(--ig)')+
    stat(Object.keys(PLC_TAGS.tags).length,'Tags','var(--gd)')+
    stat(UDT_PATHS.length,'Files','var(--wr)')+
    '</div>';
  keys.forEach(function(k){
    var u=udts[k];var card=document.createElement('div');card.className='udt-card';
    card.innerHTML='<h3>'+(u._udt||k)+'</h3>'+
      (u.fields?u.fields.map(function(f){return '<div class="field-row"><span class="field-name">'+f.name+'</span><span class="field-type">'+f.type+'</span><span class="field-desc">'+(f.desc||'')+'</span></div>'}).join(''):'<pre>'+JSON.stringify(u,null,1).slice(0,200)+'</pre>');
    card.onclick=function(){selectUDT(k)};el.appendChild(card)});
}

function renderPrograms(el){
  var progs=getUDTsByDir('programs/');
  el.innerHTML='<h3 style="color:var(--ig);font-size:10px;margin-bottom:8px">⚙ PLC Programs</h3>';
  for(var k in progs){var p=progs[k];
    el.innerHTML+='<div class="udt-card"><h3>'+(p._udt||k)+'</h3><pre>'+JSON.stringify(p,null,1).slice(0,300)+'</pre></div>'}
  var tagProgs=getPLCTag('_programs');
  if(tagProgs)el.innerHTML+='<div class="udt-card"><h3>📡 Tag Programs (live)</h3><pre>'+JSON.stringify(tagProgs,null,1).slice(0,400)+'</pre></div>';
}

function stat(v,l,c){return '<div class="stat"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+l+'</div></div>'}
