// tree.js — SVG-based equipment tree with repo-to-automation mapping
var LAYER_ICONS={
  core:'⬡',equipment:'🏭',control:'🔧',alarms:'🚨',batch:'⚗',
  io:'🔌',comms:'📡',kpi:'📊',crosswalks:'🔀',converters:'↔',
  programs:'⚙',tags:'🏷',tag:'🏷'
};
var LAYER_COLORS={
  core:'#d4a94a',equipment:'#42e898',control:'#38b5f9',alarms:'#ff4466',
  batch:'#a080ff',io:'#f0a030',comms:'#00cccc',kpi:'#42e898',
  crosswalks:'#ff8844',converters:'#8888cc',programs:'#38b5f9',tags:'#d4a94a'
};

function buildTree(paths){
  var root={};
  for(var p of paths){var parts=p.split('/');var node=root;
    for(var i=0;i<parts.length;i++){var k=parts[i];
      if(!node[k])node[k]=i===parts.length-1?{_leaf:true,_path:p}:{};node=node[k]}}
  return root;
}

function renderSVGTree(el){
  el.innerHTML='';
  var dirs=Object.keys(LAYER_ICONS);
  // Header
  el.innerHTML+='<div style="padding:4px 0;margin-bottom:6px;border-bottom:1px solid var(--b)">'
    +'<svg width="100%" height="24" viewBox="0 0 200 24"><text x="6" y="16" fill="#d4a94a" font-size="10" font-family="monospace" font-weight="700">🔧 GitPLC</text>'
    +'<circle cx="180" cy="12" r="4" fill="'+(typeof HB!=='undefined'&&HB.connected?'#42e898':'#2a3550')+'"><animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/></circle></svg></div>';
  // Layer nodes with SVG icons
  dirs.forEach(function(d){
    var count=UDT_PATHS.filter(function(p){return p.startsWith(d+'/')}).length;
    if(!count)return;
    var c=LAYER_COLORS[d]||'#4a5a78';
    var icon=LAYER_ICONS[d]||'📄';
    var div=document.createElement('div');
    div.innerHTML='<svg width="100%" height="28" viewBox="0 0 200 28" style="cursor:pointer">'
      +'<rect x="0" y="0" width="200" height="28" fill="transparent" rx="4"/>'
      +'<text x="6" y="18" font-size="12">'+icon+'</text>'
      +'<text x="24" y="17" fill="'+c+'" font-size="9" font-family="monospace" font-weight="600">'+d+'</text>'
      +'<text x="190" y="17" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="end">'+count+'</text>'
      +'<rect x="24" y="22" width="'+(count*8)+'" height="2" fill="'+c+'" opacity=".3" rx="1"/></svg>';
    var sub=document.createElement('div');sub.style.display='none';sub.style.paddingLeft='8px';
    // Sub-items
    UDT_PATHS.filter(function(p){return p.startsWith(d+'/')}).forEach(function(p){
      var name=p.split('/').pop().replace('.json','');
      var item=document.createElement('div');item.className='tree-node';item.dataset.path=p;
      item.innerHTML='<span style="color:'+c+';margin-right:4px">·</span>'+name;
      item.onclick=function(e){selectUDT(e.currentTarget.dataset.path);
        el.querySelectorAll('.tree-node').forEach(function(n){n.classList.remove('sel')});
        e.currentTarget.classList.add('sel')};
      sub.appendChild(item);
    });
    div.querySelector('svg').onclick=function(){sub.style.display=sub.style.display==='none'?'block':'none'};
    el.appendChild(div);el.appendChild(sub);
  });
  // Repo stats at bottom
  var total=UDT_PATHS.length;var tags=Object.keys(PLC_TAGS.tags).length;
  el.innerHTML+='<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--b)">'
    +'<svg width="100%" height="48" viewBox="0 0 200 48">'
    +'<text x="6" y="14" fill="#4a5a78" font-size="8" font-family="monospace">'+total+' UDTs · '+tags+' tags</text>'
    +'<text x="6" y="28" fill="#4a5a78" font-size="8" font-family="monospace">'+ALARMS.items.length+' alarms · '+Object.keys(LAYER_ICONS).length+' layers</text>'
    +'<text x="6" y="42" fill="#2a3550" font-size="7" font-family="monospace">teslasolar/GITPLC</text></svg></div>';
}
