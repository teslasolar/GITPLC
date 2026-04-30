// nav-svg.js — SVG tab buttons for header nav
function svgNavTabs(tabs,activeTab){
  var w=tabs.length*60;
  return '<svg width="'+w+'" height="28" viewBox="0 0 '+w+' 28" style="cursor:pointer" id="nav-svg">'
    +tabs.map(function(t,i){
      var x=i*60,active=t.id===activeTab;
      var c=active?'#38b5f9':'#3a4860';
      return '<g onclick="switchView(\''+t.id+'\')" style="cursor:pointer">'
        +'<rect x="'+x+'" y="0" width="58" height="26" rx="4" fill="'+(active?'rgba(56,181,249,.06)':'transparent')+'" stroke="'+(active?'#38b5f9':'transparent')+'" stroke-width="1"/>'
        +'<text x="'+(x+29)+'" y="17" fill="'+c+'" font-size="12" text-anchor="middle">'+t.icon+'</text>'
        +(active?'<rect x="'+(x+10)+'" y="24" width="38" height="2" rx="1" fill="#38b5f9"/>':'')
        +'</g>';
    }).join('')+'</svg>';
}

function renderNavTabs(el,activeTab){
  var tabs=[
    {id:'overview',icon:'🏠'},{id:'explorer',icon:'📂'},{id:'programs',icon:'⚙'},
    {id:'alarms',icon:'🚨'},{id:'kpi',icon:'📊'},{id:'tags',icon:'🏷'},{id:'stats',icon:'📡'}
  ];
  el.innerHTML=svgNavTabs(tabs,activeTab||'overview');
}
