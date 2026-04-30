// template-loader.js — auto-loads enterprise templates from UDT directories
var TPL={base:'../'}; // relative to pages/

async function loadTemplate(dir,mountId){
  try{
    var r=await fetch('templates/'+dir+'/index.html?v='+Date.now());
    if(!r.ok)return;
    var el=document.getElementById(mountId);
    if(el)el.innerHTML=await r.text();
    // Load UDT for this template
    var tpl=el?.querySelector('[data-udt]');
    if(tpl){
      var udtPath=tpl.dataset.udt;
      var ur=await fetch(TPL.base+udtPath);
      if(ur.ok){var udt=await ur.json();_renderTplFields(tpl,udt)}
    }
  }catch(e){}
}

function _renderTplFields(tpl,udt){
  var el=tpl.querySelector('.tpl-fields');if(!el)return;
  if(!udt.fields){el.innerHTML='<pre style="font-size:7px;color:#d4a94a">'+JSON.stringify(udt,null,1).slice(0,300)+'</pre>';return}
  el.innerHTML=udt.fields.map(function(f){
    return '<div style="display:flex;gap:6px;padding:1px 0;font-size:7px;border-bottom:1px solid #161d2a"><span style="color:#38b5f9;min-width:80px">'+f.name+'</span><span style="color:#f0a030;min-width:60px">'+f.type+'</span><span style="color:#3a4860">'+(f.desc||f.unit||'')+'</span></div>';
  }).join('');
}

async function loadAllTemplates(){
  var levels=['enterprise','site','area','cell','unit','em','cm'];
  for(var l of levels){
    var mount=document.getElementById('tpl-'+l);
    if(mount)await loadTemplate(l,'tpl-'+l);
  }
}
