// app.js — boot: SVG docks → UDTs → alarms → tree → overview
(async function(){
  // North dock
  var north=document.getElementById('north-dock');
  if(north)north.innerHTML='<div style="display:flex;align-items:center;background:linear-gradient(180deg,#101520,#0c1018);border-bottom:1px solid #1a2235;padding:0 8px;min-height:36px">'
    +'<span style="color:#d4a94a;font-weight:700;font-size:12px;margin-right:8px">🔧 GitPLC</span>'
    +'<span style="color:#1a2235;margin-right:6px">│</span>'
    +'<span id="plc-state" style="color:#42e898;font-size:8px;margin-right:6px">● RUN</span>'
    +'<span id="alarm-summary" style="font-size:8px;margin-right:6px"></span>'
    +'<span id="mode-toggle" onclick="toggleMode()" style="cursor:pointer;font-size:8px;padding:2px 8px;border:1px solid #243050;border-radius:4px;color:#38b5f9;margin-right:6px">🏭 AUTO</span>'
    +'<span style="flex:1"></span>'
    +'<span id="nav-tabs-mount"></span>'
    +'<span style="color:#1a2235;margin:0 6px">│</span>'
    +'<span id="status" style="color:#42e898;font-size:8px">boot...</span></div>';
  if(typeof renderNavTabs==='function')renderNavTabs(document.getElementById('nav-tabs-mount'),'overview');

  var count=await loadUDTs();
  await fetchAlarms();

  // Alarm pills
  var as=document.getElementById('alarm-summary');
  if(as&&ALARMS.items.length){var c=[0,0,0,0,0];ALARMS.items.forEach(function(a){c[a.priority]++});
    as.innerHTML=[1,2,3,4].filter(function(p){return c[p]}).map(function(p){
      return '<span style="color:'+PRI_COLOR[p]+'">'+PRI_ICON[p]+c[p]+'</span>'}).join(' ')}

  // West dock — SVG tree
  var west=document.getElementById('west-dock');
  if(typeof renderSVGTreeMode==='function')renderSVGTreeMode(west);
  else if(typeof renderSVGTree==='function')renderSVGTree(west);

  if(typeof applyIndexTag==='function')applyIndexTag();

  // South dock — SVG footer
  var tags=Object.keys(PLC_TAGS.tags).length;
  var south=document.getElementById('south-dock');
  if(south&&typeof svgFooter==='function')south.innerHTML=svgFooter({width:1200,connected:true,stats:count+' UDTs · '+tags+' tags · '+ALARMS.items.length+' alarms'});

  document.getElementById('status').textContent='● RUN';

  var idx=getPLCTag('_index');
  var defaultView=idx&&idx.default?idx.default:'overview';

  // Wrap switchView to re-render nav tabs
  var _sv=switchView;
  switchView=function(tab){
    if(typeof renderNavTabs==='function')renderNavTabs(document.getElementById('nav-tabs-mount'),tab);
    _sv(tab)};

  switchView(defaultView);
  if(typeof applyLiveValues==='function'){applyLiveValues();setInterval(applyLiveValues,30000)}
  if(typeof initHeartbeat==='function')initHeartbeat();
})();
