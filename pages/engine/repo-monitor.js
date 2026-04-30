// repo-monitor.js — self-monitors the GITPLC repo via GitHub API
var REPO_STATS={files:0,dirs:0,udts:0,tags:0,programs:0,layers:{}};

async function fetchRepoStats(){
  try{
    var ctrl=new AbortController();setTimeout(function(){ctrl.abort()},5000);
    var r=await fetch('https://api.github.com/repos/teslasolar/GITPLC/git/trees/main?recursive=1',
      {headers:{Accept:'application/vnd.github+json'},signal:ctrl.signal});
    var data=await r.json();
    if(!data.tree)return REPO_STATS;
    var t=data.tree;
    REPO_STATS.files=t.filter(function(f){return f.type==='blob'}).length;
    REPO_STATS.dirs=t.filter(function(f){return f.type==='tree'}).length;
    REPO_STATS.udts=t.filter(function(f){return f.path.endsWith('.json')&&!f.path.startsWith('pages/')&&!f.path.startsWith('docs/')}).length;
    REPO_STATS.programs=t.filter(function(f){return f.path.startsWith('programs/')}).length;
    // Count by layer
    ['core','equipment','control','alarms','batch','io','comms','kpi','crosswalks','converters'].forEach(function(d){
      REPO_STATS.layers[d]=t.filter(function(f){return f.path.startsWith(d+'/')&&f.type==='blob'}).length;
    });
    REPO_STATS.tags=Object.keys(PLC_TAGS.tags).length;
  }catch(e){}
  return REPO_STATS;
}

function renderRepoStats(el){
  if(!el)return;
  el.innerHTML=stat(REPO_STATS.files,'Files','var(--ig)')
    +stat(REPO_STATS.dirs,'Dirs','var(--wr)')
    +stat(REPO_STATS.udts,'UDTs','var(--gd)')
    +stat(REPO_STATS.tags,'Tags','#38b5f9')
    +stat(REPO_STATS.programs,'Programs','var(--ok)')
    +stat(Object.keys(REPO_STATS.layers).length,'Layers','#a080ff');
}

function renderLayerBreakdown(el){
  if(!el)return;
  el.innerHTML='<div style="font-size:8px;color:var(--ig);margin-bottom:4px">Files by layer:</div>';
  for(var k in REPO_STATS.layers){
    var n=REPO_STATS.layers[k];
    el.innerHTML+='<div style="display:flex;gap:4px;font-size:7px;padding:1px 0"><span style="color:var(--t2);min-width:80px">'+k+'</span><div class="kpi-bar" style="flex:1"><div class="kpi-fill" style="width:'+Math.min(100,n*10)+'%;background:var(--ig)"></div></div><span style="color:var(--ok)">'+n+'</span></div>';
  }
}
