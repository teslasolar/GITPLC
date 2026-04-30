// views.js — tab views, loads HTML from views/ subdir
function switchView(tab){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab)});
  var main=document.getElementById('main-panel');
  var viewFile='views/'+tab+'.html';
  fetch(viewFile+'?v='+Date.now()).then(function(r){
    if(!r.ok)throw new Error(r.status);return r.text()
  }).then(function(html){
    main.innerHTML=html;
    if(tab==='explorer')_populateExplorer();
    else if(tab==='programs')_populatePrograms();
    else if(tab==='alarms')_populateAlarms();
    else if(tab==='kpi')_populateKPIs();
    else if(tab==='tags')_populateTags();
  }).catch(function(){
    // Fallback: render inline
    if(tab==='explorer')renderExplorerInline(main);
    else if(tab==='tags')renderTagsInline(main);
    else main.innerHTML='<div style="color:var(--t2)">view not found: '+viewFile+'</div>';
  });
}

function _populateExplorer(){
  var el=document.getElementById('explorer-stats');
  if(el){var k=Object.keys(getAllUDTs()).length;var t=Object.keys(PLC_TAGS.tags).length;
    el.innerHTML=stat(k,'UDTs','var(--ig)')+stat(t,'Tags','var(--gd)')+stat(UDT_PATHS.length,'Files','var(--wr)')}
  loadAllTemplates();
}
function _populatePrograms(){
  var el=document.getElementById('program-list');if(!el)return;
  var progs=getUDTsByDir('programs/');
  for(var k in progs)el.innerHTML+='<div class="udt-card"><h3>'+(progs[k]._udt||k)+'</h3><pre>'+JSON.stringify(progs[k],null,1).slice(0,200)+'</pre></div>';
}
function _populateAlarms(){if(typeof renderAlarms==='function')renderAlarms(document.getElementById('alarms-view')||document.getElementById('main-panel'))}
function _populateKPIs(){if(typeof renderKPIs==='function')renderKPIs(document.getElementById('kpi-view')||document.getElementById('main-panel'))}
function _populateTags(){renderTagsInline(document.getElementById('tags-view')||document.getElementById('main-panel'))}

function renderExplorerInline(el){
  var udts=getAllUDTs();el.innerHTML='<div class="stats-row">'+stat(Object.keys(udts).length,'UDTs','var(--ig)')+'</div>';
  for(var k in udts){el.innerHTML+='<div class="udt-card" onclick="selectUDT(\''+k+'\')"><h3>'+(udts[k]._udt||k)+'</h3></div>'}
}
function renderTagsInline(el){
  var tags=PLC_TAGS.tags;el.innerHTML='<h3 style="color:var(--gd);font-size:10px">🏷 Tag Database</h3>';
  for(var k in tags)el.innerHTML+='<div class="udt-card"><h3>#'+(tags[k]._issue||'')+' '+k+'</h3><pre>'+JSON.stringify(tags[k],null,1).slice(0,200)+'</pre></div>';
}
function stat(v,l,c){return '<div class="stat"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+l+'</div></div>'}
