// east-dock.js — right status dashboard, auto-refreshes
function renderEastDock(){
  var el=document.getElementById('east-dock');if(!el)return;
  var udts=Object.keys(getAllUDTs()).length;
  var tags=Object.keys(PLC_TAGS.tags).length;
  var alarms=ALARMS.items;
  var ac=[0,0,0,0,0];alarms.forEach(function(a){ac[a.priority]++});
  var live=typeof getPLCTag==='function'?getPLCTag('_live'):null;
  var hb=typeof HB!=='undefined'?HB:{connected:false,count:0};

  el.innerHTML=
    // Connection status
    '<div class="view-panel" style="margin-bottom:6px"><div class="view-panel-head" style="color:var(--ok)">💓 Status</div>'
    +svgStatusBar([
      {icon:'●',label:'MQTT',value:hb.connected?'ON':'OFF',color:'#4a5a78',valueColor:hb.connected?'#42e898':'#ff4466'},
      {icon:'⏱',label:'tick',value:hb.count,color:'#4a5a78',valueColor:'#38b5f9'}
    ])
    +'<div style="font-size:7px;color:var(--t2);padding:2px 0">Mode: <span style="color:'+(VIEW_MODE==='auto'?'var(--ig)':'var(--gd)')+'">'+VIEW_MODE.toUpperCase()+'</span></div>'
    +'<div style="font-size:7px;color:var(--t2)">State: <span style="color:var(--ok)">RUN</span></div></div>'

    // Alarm summary
    +'<div class="view-panel" style="margin-bottom:6px"><div class="view-panel-head" style="color:var(--er)">🚨 Alarms</div>'
    +'<div style="display:flex;gap:4px;margin-bottom:4px">'
    +[1,2,3,4].map(function(p){return '<div style="flex:1;text-align:center;padding:3px;border-radius:3px;font-size:8px;border:1px solid '+PRI_COLOR[p]+';color:'+PRI_COLOR[p]+'">P'+p+'<br><b>'+ac[p]+'</b></div>'}).join('')
    +'</div>'
    +alarms.slice(0,4).map(function(a){return '<div style="font-size:6px;padding:1px 0;color:'+PRI_COLOR[a.priority]+';overflow:hidden;white-space:nowrap;text-overflow:ellipsis">'+PRI_ICON[a.priority]+' '+a.tag+'</div>'}).join('')
    +'</div>'

    // Repo stats
    +'<div class="view-panel" style="margin-bottom:6px"><div class="view-panel-head" style="color:var(--gd)">📂 Repo</div>'
    +'<div style="font-size:7px;display:grid;grid-template-columns:1fr 1fr;gap:2px">'
    +'<div style="color:var(--t2)">UDTs</div><div style="color:var(--ig);text-align:right">'+udts+'</div>'
    +'<div style="color:var(--t2)">Tags</div><div style="color:var(--gd);text-align:right">'+tags+'</div>'
    +'<div style="color:var(--t2)">Alarms</div><div style="color:var(--er);text-align:right">'+alarms.length+'</div>'
    +'<div style="color:var(--t2)">Programs</div><div style="color:var(--ig);text-align:right">'+Object.keys(getUDTsByDir('programs/')).length+'</div>'
    +'<div style="color:var(--t2)">Layers</div><div style="color:var(--lav);text-align:right">10</div>'
    +'</div></div>'

    // Live equipment mini
    +'<div class="view-panel" style="margin-bottom:6px"><div class="view-panel-head" style="color:var(--ig)">🏭 Equipment</div>'
    +(live&&live.equipment?Object.keys(live.equipment).map(function(k){
      var e=live.equipment[k];var c=e.state==='Running'||e.state==='Open'?'#42e898':'#2a3550';
      return '<div style="display:flex;justify-content:space-between;font-size:7px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,.02)"><span style="color:var(--t2)">'+k+'</span><span style="color:'+c+'">'+e.state+(e.current?' '+e.current+'A':'')+(e.level?e.level+'%':'')+'</span></div>'
    }).join(''):'<div style="font-size:7px;color:var(--t2)">no live data</div>')
    +'</div>'

    // PackML mini
    +'<div class="view-panel"><div class="view-panel-head" style="color:var(--ok)">◉ PackML</div>'
    +'<div style="font-size:7px;color:var(--ok)">'+(live&&live.packml?live.packml:'Execute')+'</div>'
    +'<div style="font-size:6px;color:var(--t2)">Mode: '+(live&&live.mode?live.mode:'Auto')+'</div>'
    +'<div style="font-size:6px;color:var(--t2)">Up: '+(live&&live.uptime?live.uptime:'—')+'</div></div>';
}
