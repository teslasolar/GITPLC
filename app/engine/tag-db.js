// tag-db.js — loads PLC tags from GitHub Issues (gitplc-config label)
var PLC_TAGS={tags:{},loaded:false,repo:'teslasolar/GITPLC',label:'gitplc-config'};

async function loadPLCTags(){
  if(PLC_TAGS.loaded)return PLC_TAGS.tags;
  try{
    var ctrl=new AbortController();setTimeout(function(){ctrl.abort()},4000);
    var r=await fetch('https://api.github.com/repos/'+PLC_TAGS.repo+'/issues?labels='+PLC_TAGS.label+'&state=open&per_page=50',
      {headers:{Accept:'application/vnd.github+json'},signal:ctrl.signal});
    var data=await r.json();
    if(!Array.isArray(data))return PLC_TAGS.tags;
    for(var iss of data){
      var m=iss.body?.match(/```json\s*([\s\S]*?)```/);if(!m)continue;
      try{var tag=JSON.parse(m[1]);var id=tag.tag_id||tag._udt||'issue-'+iss.number;
        tag._issue=iss.number;PLC_TAGS.tags[id]=tag}catch(e){}}
    PLC_TAGS.loaded=true;
  }catch(e){}
  return PLC_TAGS.tags;
}

function getPLCTag(id){return PLC_TAGS.tags[id]||null}
