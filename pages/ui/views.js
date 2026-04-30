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
  var k=Object.keys(getAllUDTs()).length,t=Object.keys(PLC_TAGS.tags).length;
  if(el){
    if(VIEW_MODE==='repo')el.innerHTML=stat(k,'files','#888')+stat(t,'issues','#888')+stat(UDT_PATHS.length,'JSON','#888');
    else el.innerHTML=stat(k,'UDTs','var(--ig)')+stat(t,'Tags','var(--gd)')+stat(UDT_PATHS.length,'Types','var(--wr)');
  }
  loadAllTemplates();
}
function _populatePrograms(){
  var el=document.getElementById('program-list');if(!el)return;
  var progs=getUDTsByDir('programs/');
  for(var k in progs)el.innerHTML+='<div class="udt-card"><h3>'+(progs[k]._udt||k)+'</h3><pre>'+JSON.stringify(progs[k],null,1).slice(0,200)+'</pre></div>';
}
function _populateAlarms(){
  renderAlarmPanel(document.getElementById('alarm-live-list'));
  // Priority summary
  var ps=document.getElementById('alarm-priority-summary');
  if(ps&&ALARMS.items.length){var c=[0,0,0,0,0];ALARMS.items.forEach(function(a){c[a.priority]++});
    ps.innerHTML=[1,2,3,4].map(function(p){return '<div style="padding:3px 8px;border-radius:3px;font-size:8px;border:1px solid '+PRI_COLOR[p]+';color:'+PRI_COLOR[p]+'">P'+p+': '+(c[p]||0)+'</div>'}).join('')}
  // Alarm state machine SVG
  var sm=document.getElementById('alarm-sm');
  if(sm)sm.innerHTML=['NORMAL','UNACK','ACKED','RTN_UNACK','SHELVED','DISABLED'].map(function(s){return svgStateChip(s,s==='UNACK','#ff4466')}).join('<span class="sm-arrow">→</span>');
  // Config from UDTs
  var ac=document.getElementById('alarm-config');
  var pri=getUDT('alarms/priority.json');
  if(ac&&pri&&pri.priorities)ac.innerHTML=pri.priorities.map(function(p){
    return '<div class="alarm-row"><span style="color:'+PRI_COLOR[p.level]+';font-weight:700">P'+p.level+'</span><span>'+p.name+'</span><span style="color:var(--t2)">&lt;'+p.time+'</span></div>'}).join('');
  // Metrics
  var am=document.getElementById('alarm-metrics-data');
  var met=getUDT('alarms/metrics.json');
  if(am&&met)am.innerHTML='<pre style="font-size:6px;color:#d4a94a">'+JSON.stringify(met,null,1).slice(0,300)+'</pre>';
}
function _populateKPIs(){
  var g=document.getElementById('kpi-gauges');
  if(g)g.innerHTML=svgGauge('OEE',87,100,'#42e898','%')+svgGauge('MTBF',342,500,'#38b5f9','hr')+svgGauge('MTTR',1.2,4,'#f0a030','hr')+svgGauge('FPY',98,100,'#a080ff','%');
  var oee=document.getElementById('kpi-oee-detail');
  if(oee)oee.innerHTML=['Availability 92%','Performance 96%','Quality 99%'].map(function(k){
    var v=parseInt(k.match(/\d+/)[0]);return '<div style="font-size:7px;padding:2px 0">'+k+'<div class="kpi-bar"><div class="kpi-fill" style="width:'+v+'%;background:var(--ok)"></div></div></div>'}).join('');
  var dt=document.getElementById('kpi-downtime-detail');
  if(dt)dt.innerHTML=['Planned 2.1h','Unplanned 0.8h','Changeover 1.4h','Breakdown 0.3h'].map(function(k){
    return '<div style="font-size:7px;padding:1px 0;display:flex;justify-content:space-between"><span style="color:var(--t2)">'+k.split(' ')[0]+'</span><span style="color:var(--wr)">'+k.split(' ')[1]+'</span></div>'}).join('');
  var q=document.getElementById('kpi-quality-detail');if(q)q.innerHTML='<div style="font-size:7px">FPY: 98.2% · Defect: 0.4% · Scrap: 0.2% · Rework: 1.2%</div>';
  var r=document.getElementById('kpi-reliability');if(r)r.innerHTML='<div style="font-size:7px">MTBF: 342h · MTTR: 1.2h · Failures: 3 this month</div>';
}
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
  if(typeof applyLiveValues==='function')applyLiveValues();
  // Gauges — automation vs repo mode
  var g=document.getElementById('ov-gauges');
  if(g){
    if(VIEW_MODE==='repo'){var u=Object.keys(getAllUDTs()).length,t=Object.keys(PLC_TAGS.tags).length;
      g.innerHTML=svgGauge('Files',u,100,'#888','ct')+svgGauge('UDTs',UDT_PATHS.length,60,'#888','ct')+svgGauge('Tags',t,20,'#888','ct')+svgGauge('Issues',ALARMS.items.length+t,30,'#888','ct')}
    else g.innerHTML=svgGauge('OEE',87,100,'#42e898','%')+svgGauge('Avail',92,100,'#38b5f9','%')+svgGauge('Perf',96,100,'#d4a94a','%')+svgGauge('Qual',99,100,'#a080ff','%')}

  // Translation layer: automation concept ↔ repo structure
  var tr=document.getElementById('ov-translation');
  if(tr){
    var maps=[
      ['PLC Program','programs/*.json','⚙'],['UDT/AOI','core/ + control/','⬡'],
      ['Tag Database','GitHub Issues','🏷'],['Alarm Config','plc-alarm issues','🚨'],
      ['IO Map','io/*.json','🔌'],['Recipe','batch/*.json','⚗'],
      ['HMI Screen','pages/views/*.html','🖥'],['OPC-UA Node','comms/opcua/','📡'],
      ['Historian','kpi/*.json','📊'],['Heartbeat','MQTT 5s','💓']
    ];
    tr.innerHTML='<svg width="100%" height="'+(maps.length*22+8)+'" viewBox="0 0 500 '+(maps.length*22+8)+'">'
      +maps.map(function(m,i){var y=12+i*22;
        return '<text x="6" y="'+y+'" fill="#f0a030" font-size="9" font-family="monospace">'+m[2]+' '+m[0]+'</text>'
          +'<line x1="180" y1="'+(y-4)+'" x2="260" y2="'+(y-4)+'" stroke="#243050" stroke-width="1" stroke-dasharray="3"/>'
          +'<text x="248" y="'+y+'" fill="#4a5a78" font-size="8" font-family="monospace">→</text>'
          +'<text x="268" y="'+y+'" fill="#38b5f9" font-size="9" font-family="monospace">'+m[1]+'</text>'
      }).join('')+'</svg>';
  }

  // Equipment
  var eq=document.getElementById('ov-equipment');
  if(eq&&!eq.innerHTML)eq.innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+svgMotor(true,false)+'<span style="font-size:7px;color:#42e898">Motor1</span>'+svgMotor(false,false)+'<span style="font-size:7px;color:#2a3550">Motor2</span>'+svgValve(true,false)+'<span style="font-size:7px;color:#42e898">V101</span>'+svgValve(false,false)+'<span style="font-size:7px;color:#2a3550">V102</span>'+svgTank(72)+'<span style="font-size:7px;color:#38b5f9">Tank1</span>'+svgTank(31,'#42e898')+'<span style="font-size:7px;color:#42e898">Tank2</span>'+(typeof svgPID==='function'?svgPID(75,74.8,62):'')+'</div>';

  // PackML
  var sm=document.getElementById('ov-packml');
  if(sm&&!sm.innerHTML){
    var states=['Stopped','Idle','Starting','Execute','Completing','Complete','Resetting','Holding','Held','Aborting','Aborted'];
    sm.innerHTML=states.map(function(s){return svgStateChip(s,s==='Execute','#42e898')}).join('')}

  // Alarms
  renderAlarmPanel(document.getElementById('ov-alarm-list'));

  // Programs
  var pl=document.getElementById('ov-program-list');
  if(pl){var progs=getUDTsByDir('programs/');
    pl.innerHTML=Object.keys(progs).map(function(k){var p=progs[k];
      return '<div style="font-size:7px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.03);display:flex;gap:6px;align-items:center"><span style="color:#42e898">●</span><span style="color:var(--ig);font-weight:500">'+(p._udt||k.split('/').pop().replace('.json',''))+'</span></div>'}).join('')}

  // Repo heartbeat stats
  var rs=document.getElementById('ov-repo-stats');
  if(rs){var u=Object.keys(getAllUDTs()).length,t=Object.keys(PLC_TAGS.tags).length;
    rs.innerHTML='<svg width="100%" height="32" viewBox="0 0 500 32">'
      +'<text x="6" y="14" fill="#42e898" font-size="9" font-family="monospace">'+u+' UDTs</text>'
      +'<text x="80" y="14" fill="#d4a94a" font-size="9" font-family="monospace">'+t+' tags</text>'
      +'<text x="140" y="14" fill="#ff4466" font-size="9" font-family="monospace">'+ALARMS.items.length+' alarms</text>'
      +'<text x="220" y="14" fill="#38b5f9" font-size="9" font-family="monospace">MQTT: '+(typeof HB!=='undefined'&&HB.connected?'connected':'offline')+'</text>'
      +'<text x="6" y="28" fill="#2a3550" font-size="7" font-family="monospace">teslasolar/GITPLC · github.com/teslasolar/GITPLC</text></svg>'}
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
