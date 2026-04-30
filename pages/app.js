// app.js — boot: load UDTs → scan dirs → build tree → load templates
(async function(){
  var status=document.getElementById('status');
  status.textContent='loading...';

  var count=await loadUDTs();

  // Scan + build nav tree
  var dirs=await scanDirs();
  renderDirNav(dirs,document.getElementById('tree-panel'));

  // Stats
  var tags=Object.keys(PLC_TAGS.tags).length;
  document.getElementById('stats').textContent=count+' UDTs · '+tags+' tags';
  status.textContent='✔ '+count;

  // Load enterprise hierarchy templates
  await loadAllTemplates();

  // Default view
  switchView('explorer');
  var first=Object.keys(getAllUDTs())[0];
  if(first)selectUDT(first);
})();
