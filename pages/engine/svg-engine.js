// svg-engine.js — load/configure/bind SVG templates from assets/
// Pattern: mcp(api(cli(cmd(params)))) with logger wrapper
var SVG_CACHE={};
var SVG_LOG=[];

function svgLog(op,path,params,result){
  var entry={ts:Date.now(),op:op,path:path,params:params,ok:!!result};
  SVG_LOG.push(entry);if(SVG_LOG.length>100)SVG_LOG=SVG_LOG.slice(-100);
}

// CLI layer: load SVG from path
async function svgLoad(path){
  if(SVG_CACHE[path])return SVG_CACHE[path];
  try{
    var r=await fetch('assets/'+path+'?v='+Date.now());
    if(!r.ok){svgLog('load',path,null,false);return null}
    var text=await r.text();SVG_CACHE[path]=text;
    svgLog('load',path,null,true);return text;
  }catch(e){svgLog('load',path,{err:e.message},false);return null}
}

// CMD layer: configure SVG with params
function svgConfigure(svgText,params){
  if(!svgText||!params)return svgText;
  var s=svgText;
  for(var k in params){
    s=s.replace(new RegExp('data-field="'+k+'"[^>]*>[^<]*<','g'),
      'data-field="'+k+'">'+params[k]+'<');
    s=s.replace(new RegExp('var\\(--'+k+',[^)]*\\)','g'),params[k]);
  }
  if(params.color)s=s.replace(/var\(--color,[^)]*\)/g,params.color);
  svgLog('configure',null,params,true);
  return s;
}

// API layer: load + configure + mount
async function svgMount(path,mountId,params){
  var svg=await svgLoad(path);
  if(!svg){svgLog('mount',path,{mount:mountId},false);return false}
  var configured=svgConfigure(svg,params||{});
  var el=document.getElementById(mountId);
  if(!el){svgLog('mount',path,{mount:mountId,err:'no element'},false);return false}
  el.innerHTML=configured;
  svgLog('mount',path,{mount:mountId},true);
  return true;
}

// MCP layer: batch mount from config tag
async function svgMCP(configTagId){
  var tag=typeof getPLCTag==='function'?getPLCTag(configTagId):null;
  if(!tag||!tag.svgs){svgLog('mcp',configTagId,null,false);return 0}
  var count=0;
  for(var s of tag.svgs){
    var ok=await svgMount(s.path,s.mount,s.params||{});
    if(ok)count++;
  }
  svgLog('mcp',configTagId,{count:count},true);
  // Report to tag issues if configured
  if(tag.report&&typeof mqttPublish==='function'){
    mqttPublish('svg-report',{tag:configTagId,loaded:count,total:tag.svgs.length,log:SVG_LOG.slice(-5)})}
  return count;
}

function getSVGLog(){return SVG_LOG}
