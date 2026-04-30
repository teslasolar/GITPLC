// udt-loader.js — loads UDT JSON files from the repo tree
var UDT_CACHE={};
var UDT_PATHS=[
  'core/udt.json','core/primitives.json','core/vendors.json',
  'control/base.json','control/motor.json','control/valve.json',
  'control/vfd.json','control/pid.json','control/analog-in.json',
  'control/analog-out.json','control/discrete-in.json','control/discrete-out.json',
  'alarms/priority.json','alarms/states.json','alarms/instance.json',
  'batch/recipe.json','batch/phase.json','batch/batch.json',
  'kpi/oee.json','kpi/downtime.json','kpi/quality.json',
  'programs/motor-start-stop.json','programs/pid-loop.json','programs/batch-phase.json'
];

async function loadUDTs(){
  var loaded=0;
  for(var p of UDT_PATHS){
    try{var r=await fetch('../'+p);if(!r.ok)continue;
      var j=await r.json();UDT_CACHE[p]=j;loaded++}catch(e){}}
  // Also load from GitHub tags
  var tags=await loadPLCTags();
  for(var k in tags)if(tags[k]._udt)UDT_CACHE['tag:'+k]=tags[k];
  return loaded;
}

function getUDT(path){return UDT_CACHE[path]||null}
function getAllUDTs(){return UDT_CACHE}
function getUDTsByDir(dir){var out={};for(var k in UDT_CACHE)if(k.startsWith(dir))out[k]=UDT_CACHE[k];return out}
