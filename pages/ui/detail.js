// detail.js — UDT detail view + alarm/kpi/tag renderers
function selectUDT(path){
  var u=getUDT(path);if(!u)return;
  var el=document.getElementById('detail-panel');
  el.innerHTML='<h3 style="color:var(--ig);font-size:10px">'+(u._udt||path)+'</h3>'+
    (u.extends?'<div style="font-size:7px;color:var(--wr)">extends: '+u.extends+'</div>':'')+
    (u.fields?'<div style="margin-top:6px">'+u.fields.map(function(f){
      return '<div class="field-row"><span class="field-name">'+f.name+'</span><span class="field-type">'+f.type+'</span><span class="field-desc">'+(f.desc||f.unit||'')+'</span></div>'
    }).join('')+'</div>':'')+
    (u.states?'<div style="margin-top:6px">'+u.states.map(function(s,i){
      return '<span class="sm-state">'+(s.name||s)+'</span>'+(i<u.states.length-1?'<span class="sm-arrow">→</span>':'')}).join('')+'</div>':'')+
    '<pre style="margin-top:8px;background:var(--bg);padding:4px;border-radius:2px;font-size:6px;color:var(--gd);max-height:200px;overflow:auto">'+
    JSON.stringify(u,null,2).replace(/</g,'&lt;')+'</pre>';
  document.querySelectorAll('.tree-node').forEach(function(n){n.classList.toggle('sel',n.dataset.path===path)});
}

function renderAlarms(el){
  var a=getUDT('alarms/priority.json')||{};
  el.innerHTML='<h3 style="color:var(--er);font-size:10px">🚨 Alarm Management (ISA-18.2)</h3>';
  if(a.priorities)a.priorities.forEach(function(p){
    el.innerHTML+='<div class="alarm-row"><span class="p'+p.level+'" style="font-weight:700">P'+p.level+'</span><span>'+p.name+'</span><span style="color:var(--t2)">'+p.response+'</span><span style="color:var(--t2)">&lt;'+p.time+'</span></div>'});
  var s=getUDT('alarms/states.json');
  if(s&&s.states)el.innerHTML+='<div style="margin-top:8px">'+s.states.map(function(st){return '<span class="sm-state">'+st.name+'</span>'}).join('<span class="sm-arrow">→</span>')+'</div>';
}

function renderKPIs(el){
  var oee=getUDT('kpi/oee.json')||{};
  el.innerHTML='<h3 style="color:var(--ok);font-size:10px">📊 KPIs</h3>';
  ['availability','performance','quality','oee'].forEach(function(k){
    var v=oee[k]||{target:0};
    el.innerHTML+='<div style="font-size:8px;margin:4px 0"><span style="color:var(--t)">'+k+'</span> <span style="color:var(--ok)">target: '+((v.target||0)*100).toFixed(0)+'%</span><div class="kpi-bar"><div class="kpi-fill" style="width:'+((v.target||0)*100)+'%;background:var(--ok)"></div></div></div>'});
}

function renderTags(el){
  var tags=PLC_TAGS.tags;
  el.innerHTML='<h3 style="color:var(--gd);font-size:10px">🏷 Tag Database (GitHub Issues)</h3>';
  for(var k in tags){var t=tags[k];
    el.innerHTML+='<div class="udt-card"><h3>#'+(t._issue||'')+' '+k+'</h3><pre>'+JSON.stringify(t,null,1).slice(0,200)+'</pre></div>'}
  if(!Object.keys(tags).length)el.innerHTML+='<div style="color:var(--t2);font-size:8px">No tags yet. Create issues with label gitplc-config.</div>';
}
