// gen-badge.js — generates dynamic SVG badges from repo stats
function makeBadge(label,value,color){
  var lw=label.length*7+10,vw=String(value).length*7+10,w=lw+vw;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="20">'
    +'<rect width="'+lw+'" height="20" fill="#333" rx="3"/>'
    +'<rect x="'+lw+'" width="'+vw+'" height="20" fill="'+(color||'#38b5f9')+'" rx="3"/>'
    +'<rect x="'+lw+'" width="4" height="20" fill="'+(color||'#38b5f9')+'"/>'
    +'<text x="'+(lw/2)+'" y="14" fill="#fff" font-size="11" font-family="monospace" text-anchor="middle">'+label+'</text>'
    +'<text x="'+(lw+vw/2)+'" y="14" fill="#fff" font-size="11" font-family="monospace" text-anchor="middle">'+value+'</text></svg>';
}

function makeStatsSVG(stats){
  var h=stats.length*28+20;
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="'+h+'" style="font-family:monospace;font-size:11px">'
    +'<rect width="240" height="'+h+'" fill="#0a0d15" rx="6"/>'
    +'<text x="120" y="16" fill="#d4a94a" text-anchor="middle" font-weight="bold">🔧 GitPLC Stats</text>';
  stats.forEach(function(s,i){
    var y=36+i*28;
    svg+='<text x="10" y="'+y+'" fill="#3a4860">'+s.label+'</text>'
      +'<text x="230" y="'+y+'" fill="'+(s.color||'#42e898')+'" text-anchor="end">'+s.value+'</text>'
      +'<rect x="10" y="'+(y+4)+'" width="220" height="4" fill="#161d2a" rx="2"/>'
      +'<rect x="10" y="'+(y+4)+'" width="'+Math.min(220,s.pct||0)*2.2+'" height="4" fill="'+(s.color||'#42e898')+'" rx="2"/>';
  });
  return svg+'</svg>';
}
