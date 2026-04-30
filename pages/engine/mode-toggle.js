// mode-toggle.js — switches between Automation and Repo view
var VIEW_MODE='auto';

function toggleMode(){
  VIEW_MODE=VIEW_MODE==='auto'?'repo':'auto';
  var btn=document.getElementById('mode-toggle');
  if(btn){btn.textContent=VIEW_MODE==='auto'?'🏭 AUTO':'📂 REPO';
    btn.style.color=VIEW_MODE==='auto'?'var(--ig)':'var(--gd)';
    btn.style.borderColor=VIEW_MODE==='auto'?'var(--b2)':'var(--gd)'}
  var treeEl=document.getElementById('west-dock')||document.getElementById('tree-panel');
  if(treeEl){if(VIEW_MODE==='repo')renderRepoTree(treeEl);else if(typeof renderSVGTree==='function')renderSVGTree(treeEl)}
  if(typeof renderEastDock==='function')renderEastDock();
  var at=document.querySelector('[data-tab].active')||document.querySelector('.tab.active');
  if(at&&at.dataset.tab)switchView(at.dataset.tab);
}

function renderSVGTreeMode(el){
  if(VIEW_MODE==='repo')renderRepoTree(el);
  else if(typeof renderSVGTree==='function')renderSVGTree(el);
}

function renderRepoTree(el){
  el.innerHTML='<div style="padding:4px 0;margin-bottom:6px;border-bottom:1px solid var(--b)">'
    +'<svg width="100%" height="24" viewBox="0 0 200 24"><text x="6" y="16" fill="#888" font-size="10" font-family="monospace" font-weight="700">📂 GITPLC repo</text></svg></div>';
  var allPaths=Object.keys(getAllUDTs());
  var dirs={};allPaths.forEach(function(p){var d=p.split('/')[0];dirs[d]=(dirs[d]||0)+1});
  var di=0;
  Object.keys(dirs).sort().forEach(function(d){
    var n=dirs[d];var subId='repo-sub-'+di;di++;
    el.innerHTML+='<div onclick="_treeToggle(\''+subId+'\')" style="cursor:pointer">'
      +'<svg width="100%" height="24" viewBox="0 0 200 24">'
      +'<text x="6" y="16" font-size="10">📁</text>'
      +'<text x="24" y="16" fill="#888" font-size="9" font-family="monospace">'+d+'/</text>'
      +'<text x="190" y="16" fill="#4a5a78" font-size="8" font-family="monospace" text-anchor="end">'+n+'</text></svg></div>';
    el.innerHTML+='<div id="'+subId+'" style="display:none;padding-left:10px">'
      +allPaths.filter(function(p){return p.startsWith(d+'/')}).map(function(p){
        return '<div class="tree-node" data-path="'+p+'" onclick="_treeSelect(\''+p+'\')" style="cursor:pointer">'
          +p.split('/').slice(1).join('/').replace('.json','')+'</div>'}).join('')+'</div>';
  });
  el.innerHTML+='<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--b);font-size:7px;color:#4a5a78">'
    +allPaths.length+' files · '+Object.keys(dirs).length+' dirs · main</div>';
}
