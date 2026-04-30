// views.js — tab views, loads HTML from views/ subdir
function switchView(tab){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab)});
  var main=document.getElementById('main-panel');
  var viewFile='views/'+tab+'.html';
  fetch(viewFile+'?v='+Date.now()).then(function(r){
    if(!r.ok)throw new Error(r.status);return r.text()
  }).then(function(html){
    main.innerHTML=html;
    if(tab==='overview')_populateOverview();
    else if(tab==='explorer')_populateExplorer();
    else if(tab==='programs')_populatePrograms();
    else if(tab==='alarms')_populateAlarms();
    else if(tab==='kpi')_populateKPIs();
    else if(tab==='tags')_populateTags();
    else if(tab==='stats')_populateStats();
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
function _populateOverview(){
  // Gauges
  var g=document.getElementById('ov-gauges');
  if(g)g.innerHTML=svgGauge('OEE',87,100,'#42e898','%')+svgGauge('Avail',92,100,'#38b5f9','%')+svgGauge('Perf',96,100,'#d4a94a','%')+svgGauge('Qual',99,100,'#a080ff','%');
  // Equipment
  var eq=document.getElementById('ov-equipment');
  if(eq)eq.innerHTML='<div style="display:flex;gap:6px;align-items:center">'
    +svgMotor(true,false)+'<span style="font-size:7px;color:#42e898">Motor1 RUN</span>'
    +svgMotor(false,false)+'<span style="font-size:7px;color:#333">Motor2 OFF</span>'
    +svgValve(true,false)+'<span style="font-size:7px;color:#42e898">V101 OPEN</span>'
    +svgValve(false,false)+'<span style="font-size:7px;color:#333">V102 CLOSED</span>'
    +svgTank(72,'#38b5f9')+'<span style="font-size:7px;color:#38b5f9">Tank1</span>'
    +svgTank(31,'#42e898')+'<span style="font-size:7px;color:#42e898">Tank2</span></div>';
  // PackML state
  var sm=document.getElementById('ov-packml');
  if(sm){var states=['Stopped','Idle','Starting','Execute','Completing','Complete','Resetting'];
    sm.innerHTML='<div style="font-size:8px;color:var(--t2);margin-bottom:2px">PackML:</div>'+states.map(function(s){return svgStateChip(s,s==='Execute','#42e898')}).join('')}
  // Alarms
  renderAlarmPanel(document.getElementById('ov-alarm-list'));
  // Programs
  var pl=document.getElementById('ov-program-list');
  if(pl){var progs=getUDTsByDir('programs/');
    pl.innerHTML=Object.keys(progs).map(function(k){var p=progs[k];
      return '<div style="font-size:7px;padding:2px 0;border-bottom:1px solid #111;display:flex;gap:6px"><span style="color:#42e898">●</span><span style="color:var(--ig)">'+(p._udt||k)+'</span><span style="color:var(--t2)">'+(p.desc||'')+'</span></div>'}).join('')}
}

async function _populateStats(){
  await fetchRepoStats();
  renderRepoStats(document.getElementById('repo-stats'));
  renderLayerBreakdown(document.getElementById('repo-tree'));
  // Dynamic badges
  var bEl=document.getElementById('repo-badges');
  if(bEl)bEl.innerHTML=makeBadge('UDTs',REPO_STATS.udts,'#38b5f9')+makeBadge('tags',REPO_STATS.tags,'#d4a94a')+makeBadge('programs',REPO_STATS.programs,'#42e898')+makeBadge('files',REPO_STATS.files,'#a080ff');
  // Embed SVG assets
  var svgEl=document.getElementById('repo-svg');
  if(svgEl){svgEl.innerHTML='<div style="display:flex;gap:6px;flex-wrap:wrap">';
    ['topology','dataflow','watchface','konomi'].forEach(function(s){
      svgEl.innerHTML+='<img src="assets/'+s+'.svg" style="max-width:200px;max-height:120px;border:1px solid #161d2a;border-radius:4px;background:#050810" onerror="this.style.display=\'none\'" title="'+s+'">'});
    svgEl.innerHTML+='</div>'}
}
function stat(v,l,c){return '<div class="stat"><div class="v" style="color:'+c+'">'+v+'</div><div class="l">'+l+'</div></div>'}
