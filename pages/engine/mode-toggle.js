// mode-toggle.js — switches between Automation view and Repo view
var VIEW_MODE='auto'; // 'auto' = automation equipment, 'repo' = git repo

// Labels for each mode
var MODE_LABELS={
  auto:{tree:LAYER_ICONS,colors:LAYER_COLORS,
    cols:{name:'Equipment',type:'Type',value:'State'},
    gaugeLabels:['OEE','Avail','Perf','Qual']},
  repo:{tree:{core:'📁',equipment:'📁',control:'📁',alarms:'📁',batch:'📁',io:'📁',comms:'📁',kpi:'📁',crosswalks:'📁',converters:'📁',programs:'📁',tags:'📁'},
    colors:{core:'#888',equipment:'#888',control:'#888',alarms:'#888',batch:'#888',io:'#888',comms:'#888',kpi:'#888',crosswalks:'#888',converters:'#888',programs:'#888',tags:'#888'},
    cols:{name:'Path',type:'Schema',value:'Size'},
    gaugeLabels:['Files','UDTs','Tags','Issues']}
};

function toggleMode(){
  VIEW_MODE=VIEW_MODE==='auto'?'repo':'auto';
  var btn=document.getElementById('mode-toggle');
  if(btn){
    btn.textContent=VIEW_MODE==='auto'?'🏭 AUTO':'📂 REPO';
    btn.style.color=VIEW_MODE==='auto'?'var(--ig)':'var(--gd)';
    btn.style.borderColor=VIEW_MODE==='auto'?'var(--b2)':'var(--gd)';
  }
  // Re-render tree
  if(typeof renderSVGTree==='function')renderSVGTree(document.getElementById('tree-panel'));
  // Re-render current view
  var activeTab=document.querySelector('.tab.active');
  if(activeTab)switchView(activeTab.dataset.tab);
}

// Override tree rendering based on mode
var _origRenderSVGTree=typeof renderSVGTree==='function'?renderSVGTree:null;
function renderSVGTreeMode(el){
  if(VIEW_MODE==='repo')renderRepoTree(el);
  else if(_origRenderSVGTree)_origRenderSVGTree(el);
}

function renderRepoTree(el){
  el.innerHTML='';
  el.innerHTML+='<div style="padding:4px 0;margin-bottom:6px;border-bottom:1px solid var(--b)">'
    +'<svg width="100%" height="24" viewBox="0 0 200 24"><text x="6" y="16" fill="#888" font-size="10" font-family="monospace" font-weight="700">📂 GITPLC repo</text></svg></div>';
  // Show dirs as git tree
  var allPaths=Object.keys(getAllUDTs());
  var dirs={};allPaths.forEach(function(p){var d=p.split('/')[0];dirs[d]=(dirs[d]||0)+1});
  Object.keys(dirs).sort().forEach(function(d){
    var n=dirs[d];
    var div=document.createElement('div');
    div.innerHTML='<svg width="100%" height="24" viewBox="0 0 200 24" style="cursor:pointer">'
      +'<text x="6" y="16" font-size="10">📁</text>'
      +'<text x="24" y="16" fill="#888" font-size="9" font-family="monospace">'+d+'/</text>'
      +'<text x="190" y="16" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="end">'+n+'</text></svg>';
    var sub=document.createElement('div');sub.style.display='none';sub.style.paddingLeft='10px';
    allPaths.filter(function(p){return p.startsWith(d+'/')}).forEach(function(p){
      var item=document.createElement('div');item.className='tree-node';item.dataset.path=p;
      item.textContent=p.split('/').slice(1).join('/').replace('.json','');
      item.onclick=function(e){selectUDT(e.currentTarget.dataset.path);
        el.querySelectorAll('.tree-node').forEach(function(n){n.classList.remove('sel')});
        e.currentTarget.classList.add('sel')};
      sub.appendChild(item)});
    div.querySelector('svg').onclick=function(){sub.style.display=sub.style.display==='none'?'block':'none'};
    el.appendChild(div);el.appendChild(sub)});
  // Git stats
  el.innerHTML+='<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--b);font-size:7px;color:#4a5a78">'
    +allPaths.length+' files · '+Object.keys(dirs).length+' dirs · main branch</div>';
}
