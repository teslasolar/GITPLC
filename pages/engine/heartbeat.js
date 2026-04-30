// heartbeat.js — MQTT heartbeat: publishes repo state every 5s
var HB={client:null,connected:false,topic:'gitplc/heartbeat/',count:0};

function initHeartbeat(){
  if(typeof mqtt==='undefined'){
    var s=document.createElement('script');s.src='https://unpkg.com/mqtt/dist/mqtt.min.js';
    s.onload=_hbConnect;document.head.appendChild(s);
  }else _hbConnect();
}

function _hbConnect(){
  try{
    HB.client=mqtt.connect('wss://broker.hivemq.com:8884/mqtt',{
      clientId:'gitplc-'+Date.now().toString(36),connectTimeout:5000,keepalive:30});
    HB.client.on('connect',function(){
      HB.connected=true;HB.client.subscribe(HB.topic+'#');
      _hbTick();setInterval(_hbTick,5000);
    });
    HB.client.on('message',function(topic,msg){
      try{var d=JSON.parse(msg.toString());_hbReceive(topic,d)}catch(e){}
    });
  }catch(e){}
}

function _hbTick(){
  if(!HB.client||!HB.connected)return;
  HB.count++;
  var data={
    ts:Date.now(),tick:HB.count,
    udts:Object.keys(getAllUDTs()).length,
    tags:Object.keys(PLC_TAGS.tags).length,
    alarms:ALARMS.items.length,
    state:'RUN',uptime:HB.count*5+'s'
  };
  HB.client.publish(HB.topic+'state',JSON.stringify(data),{qos:0,retain:true});
  // Update heartbeat indicator
  var dot=document.getElementById('heartbeat');
  if(dot){dot.style.background='var(--ok)';setTimeout(function(){dot.style.background='#1a2235'},200)}
  var ftr=document.getElementById('ftr-hb');
  if(ftr)ftr.textContent='tick:'+HB.count+' mqtt:'+HB.connected;
}

function _hbReceive(topic,d){
  if(topic.endsWith('/cmd')){
    if(d.type==='reload')location.reload(true);
    if(d.type==='refresh-tags'){loadPLCTags().then(function(){location.reload(true)})}
  }
}
