// dock-svg.js — dynamic SVG renderers for header, footer, status bar
function svgHeader(opts){
  var w=opts.width||800,mode=opts.mode||'auto';
  var modeColor=mode==='auto'?'#42e898':'#888';
  var modeLabel=mode==='auto'?'🏭 AUTO':'📂 REPO';
  var alarms=opts.alarms||[0,0,0,0,0];
  return '<svg width="100%" height="36" viewBox="0 0 '+w+' 36" style="display:block">'
    +'<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101520"/><stop offset="1" stop-color="#0c1018"/></linearGradient></defs>'
    +'<rect width="'+w+'" height="36" fill="url(#hg)"/>'
    +'<line x1="0" y1="35.5" x2="'+w+'" y2="35.5" stroke="#1a2235" stroke-width="1"/>'
    +'<text x="12" y="23" fill="#d4a94a" font-size="13" font-family="monospace" font-weight="700">🔧 GitPLC</text>'
    +'<circle cx="110" cy="18" r="4" fill="'+(opts.connected?'#42e898':'#2a3550')+'"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite"/></circle>'
    +'<text x="120" y="22" fill="'+modeColor+'" font-size="9" font-family="monospace">'+modeLabel+'</text>'
    // Alarm summary
    +(alarms[1]?'<circle cx="200" cy="18" r="5" fill="#ff0000" opacity=".8"/><text x="200" y="21" fill="#fff" font-size="7" text-anchor="middle">'+alarms[1]+'</text>':'')
    +(alarms[2]?'<circle cx="216" cy="18" r="5" fill="#ff8800" opacity=".8"/><text x="216" y="21" fill="#fff" font-size="7" text-anchor="middle">'+alarms[2]+'</text>':'')
    +(alarms[3]?'<circle cx="232" cy="18" r="5" fill="#ffcc00" opacity=".8"/><text x="232" y="21" fill="#000" font-size="7" text-anchor="middle">'+alarms[3]+'</text>':'')
    +(alarms[4]?'<circle cx="248" cy="18" r="5" fill="#00cccc" opacity=".6"/><text x="248" y="21" fill="#fff" font-size="7" text-anchor="middle">'+alarms[4]+'</text>':'')
    +'</svg>';
}

function svgFooter(opts){
  var w=opts.width||800;
  return '<svg width="100%" height="24" viewBox="0 0 '+w+' 24" style="display:block">'
    +'<defs><linearGradient id="fg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#030508"/><stop offset="1" stop-color="#0c1018"/></linearGradient></defs>'
    +'<rect width="'+w+'" height="24" fill="url(#fg)"/>'
    +'<line x1="0" y1="0.5" x2="'+w+'" y2="0.5" stroke="#1a2235"/>'
    +'<circle cx="12" cy="12" r="3" fill="'+(opts.connected?'#42e898':'#2a3550')+'"><animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/></circle>'
    +'<text x="22" y="15" fill="#4a5a78" font-size="7" font-family="monospace">🔧 GitPLC · ISA-88/95 · OPC-UA · MQTT</text>'
    +'<text x="'+(w-10)+'" y="15" fill="#2a3550" font-size="7" font-family="monospace" text-anchor="end">'+(opts.stats||'')+'</text></svg>';
}

function svgStatusBar(items){
  var w=items.length*100;
  return '<svg width="100%" height="20" viewBox="0 0 '+w+' 20">'
    +items.map(function(it,i){
      return '<text x="'+(i*100+4)+'" y="14" fill="'+(it.color||'#4a5a78')+'" font-size="8" font-family="monospace">'+(it.icon||'')+' '+it.label+': <tspan fill="'+(it.valueColor||'#42e898')+'">'+it.value+'</tspan></text>';
    }).join('')+'</svg>';
}
