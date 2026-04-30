// app.js — boot sequence for GitPLC explorer
(async function(){
  var status=document.getElementById('status');
  status.textContent='loading UDTs...';

  var count=await loadUDTs();
  status.textContent='✔ '+count+' UDTs loaded';

  // Build tree
  var tree=buildTree(Object.keys(getAllUDTs()));
  var treeEl=document.getElementById('tree-panel');
  treeEl.innerHTML='<div class="tree-dir open" style="color:var(--gd);font-size:9px">🔧 GitPLC</div>';
  renderTree(tree,treeEl,0);

  // Stats
  var tags=Object.keys(PLC_TAGS.tags).length;
  document.getElementById('stats').textContent=count+' UDTs · '+tags+' tags · '+UDT_PATHS.length+' files';

  // Default view
  switchView('explorer');

  // Select first UDT
  var first=Object.keys(getAllUDTs())[0];
  if(first)selectUDT(first);
})();
