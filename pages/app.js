// app.js — boot: UDTs → alarms → tree → overview (PLC running)
(async function(){
  var status=document.getElementById('status');
  status.textContent='loading...';

  var count=await loadUDTs();
  await fetchAlarms();

  // Alarm summary in header
  var alarmSum=document.getElementById('alarm-summary');
  if(alarmSum&&ALARMS.items.length){
    var c=[0,0,0,0,0];ALARMS.items.forEach(function(a){c[a.priority]++});
    alarmSum.innerHTML=[1,2,3,4].filter(function(p){return c[p]}).map(function(p){
      return '<span style="color:'+PRI_COLOR[p]+'">'+PRI_ICON[p]+c[p]+'</span>'}).join(' ');
  }

  // Nav tree
  var dirs=await scanDirs();
  renderDirNav(dirs,document.getElementById('tree-panel'));

  // Footer stats
  var tags=Object.keys(PLC_TAGS.tags).length;
  document.getElementById('ftr-stats').textContent=count+' UDTs · '+tags+' tags · '+ALARMS.items.length+' alarms';
  status.textContent='● RUN';

  switchView('overview');
})();
