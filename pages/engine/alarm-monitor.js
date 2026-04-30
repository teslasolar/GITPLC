// alarm-monitor.js — fetches plc-alarm issues, comments = active instances
var ALARMS={items:[],loaded:false};
var PRI_COLOR={1:'#ff0000',2:'#ff8800',3:'#ffcc00',4:'#00cccc'};
var PRI_ICON={1:'🔴',2:'🟠',3:'🟡',4:'🔵'};

async function fetchAlarms(){
  try{
    var ctrl=new AbortController();setTimeout(function(){ctrl.abort()},5000);
    var r=await fetch('https://api.github.com/repos/teslasolar/GITPLC/issues?labels=plc-alarm&state=open&per_page=20',
      {headers:{Accept:'application/vnd.github+json'},signal:ctrl.signal});
    var data=await r.json();if(!Array.isArray(data))return;
    ALARMS.items=[];
    for(var iss of data){
      var m=iss.body?.match(/```json\s*([\s\S]*?)```/);
      var tag=m?JSON.parse(m[1]):{};
      ALARMS.items.push({
        id:iss.number,title:iss.title,priority:tag.priority||4,
        tag:tag.tag||'',type:tag.type||'',sp:tag.sp||0,unit:tag.unit||'',
        response:tag.response||'',consequence:tag.consequence||'',
        comments:iss.comments,created:iss.created_at,
        state:iss.state
      });
    }
    ALARMS.items.sort(function(a,b){return a.priority-b.priority});
    ALARMS.loaded=true;
  }catch(e){}
}

function renderAlarmPanel(el){
  if(!el)return;
  var counts=[0,0,0,0,0];
  ALARMS.items.forEach(function(a){counts[a.priority]=(counts[a.priority]||0)+1});
  el.innerHTML='<div style="display:flex;gap:4px;margin-bottom:6px">'
    +[1,2,3,4].map(function(p){return '<div style="padding:2px 6px;border-radius:3px;font-size:8px;border:1px solid '+PRI_COLOR[p]+';color:'+PRI_COLOR[p]+'">P'+p+': '+counts[p]+'</div>'}).join('')
    +'<div style="padding:2px 6px;border-radius:3px;font-size:8px;border:1px solid #42e898;color:#42e898">Total: '+ALARMS.items.length+'</div></div>';
  ALARMS.items.forEach(function(a){
    el.innerHTML+='<div class="alarm-row" onclick="window.open(\'https://github.com/teslasolar/GITPLC/issues/'+a.id+'\')" style="cursor:pointer">'
      +'<span style="font-size:10px">'+PRI_ICON[a.priority]+'</span>'
      +'<span style="color:'+PRI_COLOR[a.priority]+';font-weight:600;min-width:20px">P'+a.priority+'</span>'
      +'<span style="color:var(--ig);min-width:60px">'+a.type+'</span>'
      +'<span style="flex:1;color:var(--t)">'+a.tag+'</span>'
      +'<span style="color:var(--t2)">'+a.comments+' 💬</span></div>';
  });
}
