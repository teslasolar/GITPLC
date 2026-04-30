// plc-svg.js — dynamic inline SVG components for PLC visualization
function svgGauge(label,value,max,color,unit){
  var pct=Math.min(100,value/max*100),a=pct*2.7-135;
  return '<svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" fill="none" stroke="#161d2a" stroke-width="6"/>'
    +'<circle cx="40" cy="40" r="32" fill="none" stroke="'+(color||'#42e898')+'" stroke-width="6" stroke-dasharray="'+(pct*2)+' 200" stroke-linecap="round" transform="rotate(-90 40 40)"/>'
    +'<text x="40" y="38" fill="'+(color||'#42e898')+'" font-size="14" font-family="monospace" text-anchor="middle" font-weight="bold">'+value+'</text>'
    +'<text x="40" y="50" fill="#3a4860" font-size="7" font-family="monospace" text-anchor="middle">'+(unit||'%')+'</text>'
    +'<text x="40" y="72" fill="#555" font-size="7" font-family="monospace" text-anchor="middle">'+label+'</text></svg>';
}

function svgStateChip(name,active,color){
  var bg=active?'rgba('+(color==='#42e898'?'66,232,152':color==='#ff0000'?'255,0,0':'56,181,249')+',.15)':'transparent';
  return '<span style="display:inline-block;padding:2px 6px;border-radius:3px;font-size:7px;border:1px solid '+(active?color:'#222')+';color:'+(active?color:'#333')+';background:'+bg+';margin:1px">'+name+'</span>';
}

function svgMotor(running,faulted){
  var c=faulted?'#ff0000':running?'#42e898':'#333';
  return '<svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="'+c+'" stroke-width="2"/>'
    +'<text x="20" y="24" fill="'+c+'" font-size="14" font-family="monospace" text-anchor="middle">M</text></svg>';
}

function svgValve(open,faulted){
  var c=faulted?'#ff0000':open?'#42e898':'#333';
  return '<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="6,8 20,20 6,32" fill="'+(open?c:'none')+'" stroke="'+c+'" stroke-width="2"/>'
    +'<polygon points="34,8 20,20 34,32" fill="'+(open?c:'none')+'" stroke="'+c+'" stroke-width="2"/></svg>';
}

function svgTank(level,color){
  var h=Math.min(30,level*0.3);
  return '<svg width="40" height="40" viewBox="0 0 40 40"><rect x="8" y="4" width="24" height="32" fill="none" stroke="#555" stroke-width="1.5" rx="2"/>'
    +'<rect x="9" y="'+(36-h)+'" width="22" height="'+h+'" fill="'+(color||'#38b5f9')+'" opacity=".5" rx="1"/>'
    +'<text x="20" y="24" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">'+level+'%</text></svg>';
}
