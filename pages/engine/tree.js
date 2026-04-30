// tree.js — SVG-based equipment tree with click handlers
var LAYER_ICONS={core:'⬡',equipment:'🏭',control:'🔧',alarms:'🚨',batch:'⚗',
  io:'🔌',comms:'📡',kpi:'📊',crosswalks:'🔀',converters:'↔',programs:'⚙',tags:'🏷'};
var LAYER_COLORS={core:'#d4a94a',equipment:'#42e898',control:'#38b5f9',alarms:'#ff4466',
  batch:'#a080ff',io:'#f0a030',comms:'#00cccc',kpi:'#42e898',
  crosswalks:'#ff8844',converters:'#8888cc',programs:'#38b5f9',tags:'#d4a94a'};

function buildTree(paths){var root={};
  for(var p of paths){var parts=p.split('/');var node=root;
    for(var i=0;i<parts.length;i++){var k=parts[i];
      if(!node[k])node[k]=i===parts.length-1?{_leaf:true,_path:p}:{};node=node[k]}}
  return root}

// Global click handlers for SVG onclick attributes
window._treeToggle=function(id){var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'};
window._treeSelect=function(path){
  if(typeof selectUDT==='function')selectUDT(path);
  document.querySelectorAll('.tree-node').forEach(function(n){n.classList.toggle('sel',n.dataset.path===path)})};

function renderSVGTree(el){
  el.innerHTML='';
  var hb=typeof HB!=='undefined'&&HB.connected;
  // Header
  el.innerHTML+='<div style="padding:4px 0;margin-bottom:6px;border-bottom:1px solid var(--b)">'
    +'<svg width="100%" height="24" viewBox="0 0 200 24"><text x="6" y="16" fill="#d4a94a" font-size="10" font-family="monospace" font-weight="700">🔧 GitPLC</text>'
    +'<circle cx="180" cy="12" r="4" fill="'+(hb?'#42e898':'#2a3550')+'"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite"/></circle></svg></div>';
  // Layers
  var dirs=Object.keys(LAYER_ICONS);
  dirs.forEach(function(d,di){
    var paths=UDT_PATHS.filter(function(p){return p.startsWith(d+'/')});
    if(!paths.length)return;
    var c=LAYER_COLORS[d]||'#4a5a78';var icon=LAYER_ICONS[d]||'📄';
    var subId='tree-sub-'+di;
    // Dir header — onclick toggles sub via global handler
    el.innerHTML+='<div onclick="_treeToggle(\''+subId+'\')" style="cursor:pointer">'
      +'<svg width="100%" height="28" viewBox="0 0 200 28">'
      +'<rect x="0" y="0" width="200" height="28" fill="transparent" rx="4"/>'
      +'<text x="6" y="18" font-size="12">'+icon+'</text>'
      +'<text x="24" y="17" fill="'+c+'" font-size="9" font-family="monospace" font-weight="600">'+d+'</text>'
      +'<text x="190" y="17" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="end">'+paths.length+'</text>'
      +'<rect x="24" y="22" width="'+Math.min(160,paths.length*12)+'" height="2" fill="'+c+'" opacity=".3" rx="1"/>'
      +'</svg></div>';
    // Sub items
    el.innerHTML+='<div id="'+subId+'" style="display:none;padding-left:10px">'
      +paths.map(function(p){var name=p.split('/').pop().replace('.json','');
        return '<div class="tree-node" data-path="'+p+'" onclick="_treeSelect(\''+p+'\')" style="cursor:pointer">'
          +'<span style="color:'+c+';margin-right:4px">·</span>'+name+'</div>'}).join('')
      +'</div>';
  });
  // Stats
  var total=UDT_PATHS.length,tags=Object.keys(PLC_TAGS.tags).length;
  el.innerHTML+='<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--b);font-size:7px;color:#4a5a78">'
    +total+' UDTs · '+tags+' tags<br>'+ALARMS.items.length+' alarms · '+dirs.length+' layers<br>'
    +'<span style="color:#2a3550">teslasolar/GITPLC</span></div>';
}
