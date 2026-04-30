// subdir-scanner.js — scans UDT directories, builds nav tree
var SCAN={dirs:['core','control','alarms','batch','io','comms','kpi','crosswalks','converters','programs','tags','equipment']};

async function scanDirs(){
  var tree={};
  for(var d of SCAN.dirs){
    tree[d]=[];
    try{
      // Try loading index or known files
      var paths=UDT_PATHS.filter(function(p){return p.startsWith(d+'/')});
      for(var p of paths){
        var name=p.split('/').pop().replace('.json','');
        tree[d].push({name:name,path:p});
      }
    }catch(e){}
  }
  return tree;
}

function renderDirNav(tree,el){
  el.innerHTML='';
  for(var d in tree){
    var dir=document.createElement('div');
    dir.className='tree-dir';dir.textContent=d+' ('+tree[d].length+')';
    var sub=document.createElement('div');sub.style.display='none';
    tree[d].forEach(function(f){
      var item=document.createElement('div');item.className='tree-node';
      item.textContent=f.name;item.dataset.path=f.path;
      item.onclick=function(e){selectUDT(e.target.dataset.path)};
      sub.appendChild(item);
    });
    dir.onclick=function(s){return function(){s.style.display=s.style.display==='none'?'block':'none';this.classList.toggle('open')}}(sub);
    el.appendChild(dir);el.appendChild(sub);
  }
}
