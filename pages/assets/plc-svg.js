// plc-svg.js — hi-fi inline SVG components for PLC visualization
function svgGauge(label,value,max,color,unit){
  var pct=Math.min(100,value/max*100),r=34,circ=2*Math.PI*r,dash=pct/100*circ;
  return '<svg width="90" height="90" viewBox="0 0 90 90">'
    +'<circle cx="45" cy="45" r="'+r+'" fill="none" stroke="#1a2235" stroke-width="5"/>'
    +'<circle cx="45" cy="45" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="5" stroke-dasharray="'+dash+' '+circ+'" stroke-linecap="round" transform="rotate(-90 45 45)" opacity=".9"/>'
    +'<circle cx="45" cy="45" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="1" stroke-dasharray="'+dash+' '+circ+'" stroke-linecap="round" transform="rotate(-90 45 45)" opacity=".2" filter="url(#glow)"/>'
    +'<defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
    +'<text x="45" y="42" fill="'+color+'" font-size="16" font-family="monospace" text-anchor="middle" font-weight="700">'+value+'</text>'
    +'<text x="45" y="54" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="middle">'+(unit||'%')+'</text>'
    +'<text x="45" y="80" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="middle">'+label+'</text></svg>';
}

function svgMotor(running,faulted){
  var c=faulted?'#ff4466':running?'#42e898':'#2a3550';
  return '<svg width="44" height="44" viewBox="0 0 44 44">'
    +'<circle cx="22" cy="22" r="18" fill="none" stroke="'+c+'" stroke-width="2"/>'
    +'<circle cx="22" cy="22" r="14" fill="none" stroke="'+c+'" stroke-width="1" opacity=".3"/>'
    +(running?'<circle cx="22" cy="22" r="20" fill="none" stroke="'+c+'" stroke-width="1" opacity=".15"><animate attributeName="r" values="18;22;18" dur="1.5s" repeatCount="indefinite"/></circle>':'')
    +'<text x="22" y="26" fill="'+c+'" font-size="14" font-family="monospace" text-anchor="middle" font-weight="600">M</text></svg>';
}

function svgValve(open,faulted){
  var c=faulted?'#ff4466':open?'#42e898':'#2a3550';
  return '<svg width="44" height="44" viewBox="0 0 44 44">'
    +'<polygon points="6,10 22,22 6,34" fill="'+(open?c:'none')+'" stroke="'+c+'" stroke-width="2" opacity="'+(open?'.6':'1')+'"/>'
    +'<polygon points="38,10 22,22 38,34" fill="'+(open?c:'none')+'" stroke="'+c+'" stroke-width="2" opacity="'+(open?'.6':'1')+'"/>'
    +'<line x1="22" y1="4" x2="22" y2="10" stroke="'+c+'" stroke-width="2"/>'
    +'<rect x="16" y="2" width="12" height="4" fill="'+c+'" rx="1" opacity=".5"/></svg>';
}

function svgTank(level,color){
  var c=color||'#38b5f9',h=Math.min(32,level*0.32);
  return '<svg width="44" height="48" viewBox="0 0 44 48">'
    +'<rect x="8" y="4" width="28" height="38" fill="none" stroke="#2a3550" stroke-width="1.5" rx="3"/>'
    +'<rect x="9" y="'+(42-h)+'" width="26" height="'+h+'" fill="'+c+'" opacity=".35" rx="2"/>'
    +'<rect x="9" y="'+(42-h)+'" width="26" height="2" fill="'+c+'" opacity=".6" rx="1"/>'
    +'<text x="22" y="28" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="600">'+level+'%</text></svg>';
}

function svgStateChip(name,active,color){
  var c=color||'#42e898';
  return '<span class="sm-state'+(active?' active':'')+'" style="'+(active?'border-color:'+c+';color:'+c+';background:rgba('+(c==='#42e898'?'66,232,152':c==='#ff4466'?'255,68,102':'56,181,249')+',.1);box-shadow:0 0 6px '+c+'33':'')+'">'+name+'</span>';
}

function svgPID(sp,pv,cv){
  var err=Math.abs(sp-pv),c=err<1?'#42e898':err<3?'#f0a030':'#ff4466';
  return '<svg width="120" height="40" viewBox="0 0 120 40">'
    +'<rect x="1" y="1" width="118" height="38" fill="none" stroke="'+c+'" stroke-width="1" rx="4" opacity=".5"/>'
    +'<text x="6" y="14" fill="#4a5a78" font-size="7" font-family="monospace">SP:'+sp+'</text>'
    +'<text x="6" y="25" fill="'+c+'" font-size="9" font-family="monospace" font-weight="600">PV:'+pv+'</text>'
    +'<text x="6" y="35" fill="#38b5f9" font-size="7" font-family="monospace">CV:'+cv+'%</text>'
    +'<rect x="70" y="6" width="44" height="28" fill="none" stroke="#1a2235" stroke-width="1" rx="2"/>'
    +'<rect x="71" y="'+(34-cv*0.28)+'" width="42" height="'+(cv*0.28)+'" fill="'+c+'" opacity=".3" rx="1"/></svg>';
}
