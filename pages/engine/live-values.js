// live-values.js — reads _live tag for equipment values, renders with SVGs
function applyLiveValues(){
  var live=getPLCTag('_live');if(!live||!live.equipment)return;
  var eq=live.equipment;

  // Update overview gauges if on overview tab
  var g=document.getElementById('ov-gauges');
  if(g){
    var oee=getPLCTag('_live');
    g.innerHTML=svgGauge('OEE',87,100,'#42e898','%')+svgGauge('Avail',92,100,'#38b5f9','%')+svgGauge('Perf',96,100,'#d4a94a','%')+svgGauge('Qual',99,100,'#a080ff','%');
  }

  // Update equipment SVGs
  var eqEl=document.getElementById('ov-equipment');
  if(eqEl){
    var html='<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">';
    for(var k in eq){
      var e=eq[k];
      if(k.startsWith('motor'))html+=svgMotor(e.state==='Running',false)+'<span style="font-size:6px;color:'+(e.state==='Running'?'#42e898':'#333')+'">'+k+'<br>'+e.state+(e.current?' '+e.current+'A':'')+'</span>';
      else if(k.startsWith('v'))html+=svgValve(e.state==='Open',false)+'<span style="font-size:6px;color:'+(e.state==='Open'?'#42e898':'#333')+'">'+k+'<br>'+e.state+'</span>';
      else if(k.startsWith('tank'))html+=svgTank(e.level||0,'#38b5f9')+'<span style="font-size:6px;color:#38b5f9">'+k+(e.temp?' '+e.temp+'°':'')+'</span>';
      else if(k.startsWith('pid'))html+=(typeof svgPID==='function'?svgPID(e.sp,e.pv,e.cv):'<span style="font-size:6px;color:#38b5f9">'+k+'</span>');
    }
    eqEl.innerHTML=html+'</div>';
  }

  // PackML state
  var sm=document.getElementById('ov-packml');
  if(sm&&live.packml){
    var states=['Stopped','Idle','Starting','Execute','Completing','Complete','Resetting','Holding','Held'];
    sm.innerHTML='<div style="font-size:7px;color:var(--t2)">PackML: <b style="color:var(--ok)">'+live.packml+'</b> · Mode: '+(live.mode||'?')+' · Uptime: '+(live.uptime||'?')+'</div>'
      +states.map(function(s){return svgStateChip(s,s===live.packml,'#42e898')}).join('');
  }
}
