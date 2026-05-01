#!/usr/bin/env node
const OWNER='teslasolar',REPO='GITPLC';
async function api(p,opts){const t=process.env.GH_TOKEN;return fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+p,{...opts,headers:{'Authorization':'token '+t,'Content-Type':'application/json'}})}
async function branch(n,f){const r=await(await api('/git/ref/heads/'+f)).json();const x=await api('/git/refs',{method:'POST',body:JSON.stringify({ref:'refs/heads/'+n,sha:r.object.sha})});console.log(x.ok?'✓ '+n:'· exists')}
async function put(b,f,c,m){const e=await api('/contents/'+f+'?ref='+b);const body={message:m,content:Buffer.from(c).toString('base64'),branch:b};if(e.ok){body.sha=(await e.json()).sha}await api('/contents/'+f,{method:'PUT',body:JSON.stringify(body)});process.stdout.write('.')}

const UDTS={
'equipment/wearer.json':{_udt:'Wearass_Wearer',fields:{name:{type:'STRING'},role:{type:'ENUM',values:['primary','secondary']},watch_serial:{type:'STRING'},adb_mode:{type:'ENUM',values:['tcp','tls_mdns','usb','offline']},state:{type:'ENUM',values:['ONLINE','SYNCING','OFFLINE','CHARGING','SLEEPING']}}},
'equipment/watch.json':{_udt:'Wearass_Watch',fields:{serial:{type:'STRING'},model:{type:'STRING'},battery_pct:{type:'INT'},temp_c:{type:'REAL'},adb_state:{type:'ENUM',values:['connected','disconnected','unauthorized']},sensor_count:{type:'INT'}}},
'equipment/biosensor.json':{_udt:'Wearass_Biosensor',fields:{sensor_id:{type:'STRING'},type:{type:'ENUM',values:['hr','hrv','spo2','stress','accel','baro','temp','steps']},value:{type:'REAL'},quality:{type:'ENUM',values:['GOOD','BAD','STALE']},sample_rate_ms:{type:'INT'}}},
'equipment/biomarker.json':{_udt:'Wearass_Biomarker',fields:{name:{type:'STRING'},value:{type:'REAL'},unit:{type:'STRING'},source:{type:'ENUM',values:['twrecks','samsung_health','computed']},confidence:{type:'REAL'}}},
'equipment/comms-channel.json':{_udt:'Wearass_CommsChannel',fields:{channel_id:{type:'STRING'},type:{type:'ENUM',values:['adb_wifi','adb_tls','bluetooth','mqtt']},state:{type:'ENUM',values:['IDLE','CONNECTING','CONNECTED','STREAMING','ERROR']},latency_ms:{type:'INT'},error_count:{type:'INT'}}},
};

const PROGRAMS={
'programs/wearass-connect.json':{_udt:'Program_WearassConnect',desc:'ADB connection FSM',states:['OFFLINE','DISCOVERING','CONNECTING','CONNECTED','STREAMING','ERROR'],transitions:[{from:'OFFLINE',to:'DISCOVERING',trigger:'scan'},{from:'DISCOVERING',to:'CONNECTING',trigger:'found'},{from:'CONNECTING',to:'CONNECTED',trigger:'authorized'},{from:'CONNECTED',to:'STREAMING',trigger:'subscribe'},{from:'*',to:'ERROR',trigger:'timeout'},{from:'ERROR',to:'DISCOVERING',trigger:'retry'}]},
'programs/wearass-bioloop.json':{_udt:'Program_WearassBioLoop',desc:'Sensor → TWrecks → biomarker loop',loops:[{name:'L_hr',input:'heart_rate',output:'CRA,K',rate_ms:1000},{name:'L_hrv',input:'hrv',output:'Mg,Ca',rate_ms:5000},{name:'L_stress',input:'stress',output:'cortisol',rate_ms:10000},{name:'L_accel',input:'accel',output:'activity',rate_ms:200},{name:'L_spo2',input:'spo2',output:'oxygen',rate_ms:30000}]},
'programs/wearass-keepalive.json':{_udt:'Program_WearassKeepalive',desc:'Heartbeat + reconnect',heartbeat_ms:10000,max_missed:3,reconnect_ms:5000,port_range:[5555,5585]},
};

const ALARMS={
'alarms/wearass-alarms.json':{_udt:'Wearass_Alarms',alarms:[
{id:'WATCH_OFFLINE',priority:2,trigger:'disconnected > 60s'},
{id:'BATTERY_LOW',priority:3,trigger:'battery < 15%'},
{id:'BATTERY_CRITICAL',priority:1,trigger:'battery < 5%'},
{id:'HR_ANOMALY',priority:2,trigger:'hr < 40 or hr > 180'},
{id:'SPO2_LOW',priority:1,trigger:'spo2 < 90'},
{id:'SENSOR_STALE',priority:3,trigger:'no data > 30s'},
{id:'COMMS_ERROR',priority:2,trigger:'errors > 5/min'},
{id:'APP_CRASH',priority:2,trigger:'megazord not running'},
]},
};

async function main(){
console.log('═══ GitPLC · Wearass ═══\n');
await branch('plc-wearass','main');
console.log('\nUDTs...');for(var[f,u] of Object.entries(UDTS))await put('plc-wearass',f,JSON.stringify(u,null,2),'Add '+f);
console.log('\nPrograms...');for(var[f,p] of Object.entries(PROGRAMS))await put('plc-wearass',f,JSON.stringify(p,null,2),'Add '+f);
console.log('\nAlarms...');for(var[f,a] of Object.entries(ALARMS))await put('plc-wearass',f,JSON.stringify(a,null,2),'Add '+f);
console.log('\n\nDone! '+Object.keys(UDTS).length+' UDTs, '+Object.keys(PROGRAMS).length+' programs, '+Object.keys(ALARMS).length+' alarm set');
}
main();
