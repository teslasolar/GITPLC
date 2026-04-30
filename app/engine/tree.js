// tree.js — builds navigable tree from UDT paths
function buildTree(paths){
  var root={};
  for(var p of paths){
    var parts=p.split('/');var node=root;
    for(var i=0;i<parts.length;i++){
      var k=parts[i];
      if(!node[k])node[k]=i===parts.length-1?{_leaf:true,_path:p}:{};
      node=node[k];
    }
  }
  return root;
}

function renderTree(node,el,depth){
  depth=depth||0;
  var keys=Object.keys(node).filter(function(k){return k[0]!=='_'}).sort();
  for(var k of keys){
    var child=node[k];
    var div=document.createElement('div');
    if(child._leaf){
      div.className='tree-node';div.dataset.path=child._path;
      div.textContent=k.replace('.json','');
      div.onclick=function(e){selectUDT(e.target.dataset.path)};
    }else{
      div.className='tree-dir';div.textContent=k;
      div.style.paddingLeft=(depth*8)+'px';
      var sub=document.createElement('div');sub.style.display='none';
      renderTree(child,sub,depth+1);
      div.onclick=function(s){return function(){
        s.style.display=s.style.display==='none'?'block':'none';
        this.classList.toggle('open')}}(sub);
      div.appendChild(sub);
    }
    el.appendChild(div);
  }
}
