#!/usr/bin/env node
const O='teslasolar',R='GITPLC';
async function api(p,o){return fetch('https://api.github.com/repos/'+O+'/'+R+p,{...o,headers:{'Authorization':'token '+process.env.GH_TOKEN,'Content-Type':'application/json'}})}
async function br(n,f){var r=await(await api('/git/ref/heads/'+f)).json();await api('/git/refs',{method:'POST',body:JSON.stringify({ref:'refs/heads/'+n,sha:r.object.sha})})}
async function put(b,f,c,m){var e=await api('/contents/'+f+'?ref='+b);var body={message:m,content:Buffer.from(c).toString('base64'),branch:b};if(e.ok)body.sha=(await e.json()).sha;await api('/contents/'+f,{method:'PUT',body:JSON.stringify(body)});process.stdout.write('.')}

var files={
'equipment/survey-platform.json':{_udt:'SurveyPlatform',fields:{name:{type:'STRING'},url:{type:'STRING'},type:{type:'ENUM',values:['survey','expert','testing','micro','opinion']},pay:{type:'ENUM',values:['paypal','gift_card','direct_deposit','crypto']},avg_hourly:{type:'REAL',engUnit:'USD'},min_payout:{type:'REAL'},state:{type:'ENUM',values:['IDLE','SCANNING','ANSWERING','SUBMITTED','PAID','BLOCKED']}}},
'equipment/question-queue.json':{_udt:'QuestionQueue',fields:{platform:{type:'STRING'},topic:{type:'STRING'},difficulty:{type:'ENUM',values:['easy','medium','hard']},reward:{type:'REAL',engUnit:'USD'},time_limit:{type:'INT',engUnit:'min'},state:{type:'ENUM',values:['AVAILABLE','CLAIMED','ANSWERING','SUBMITTED','APPROVED','REJECTED']}}},
'equipment/answer-session.json':{_udt:'AnswerSession',fields:{platform:{type:'STRING'},batch:{type:'INT'},earned:{type:'REAL',engUnit:'USD'},time_min:{type:'REAL'},hourly:{type:'REAL',engUnit:'USD/hr'},quality:{type:'REAL'},state:{type:'ENUM',values:['IDLE','ACTIVE','PAUSED','COMPLETED','CASHED_OUT']}}},
'equipment/payout-tracker.json':{_udt:'PayoutTracker',fields:{platform:{type:'STRING'},earned:{type:'REAL',engUnit:'USD'},pending:{type:'REAL'},paid:{type:'REAL'},method:{type:'STRING'},next_payout:{type:'TIME'}}},
'programs/survey-scanner.json':{_udt:'Program_SurveyScanner',desc:'Scan for high-value low-effort questions',states:['IDLE','SCANNING','FILTERING','CLAIMING','ANSWERING','SUBMITTING','COOLDOWN'],filters:{min_hourly:15,max_difficulty:'medium',preferred:['tech','science','general','opinion','consumer'],skip:['medical','legal','financial']},transitions:[{from:'IDLE',to:'SCANNING',trigger:'tick'},{from:'SCANNING',to:'FILTERING',trigger:'found'},{from:'FILTERING',to:'CLAIMING',trigger:'profitable'},{from:'CLAIMING',to:'ANSWERING',trigger:'claimed'},{from:'ANSWERING',to:'SUBMITTING',trigger:'ready'},{from:'SUBMITTING',to:'COOLDOWN',trigger:'sent'},{from:'COOLDOWN',to:'SCANNING',trigger:'cooldown_done'}]},
'programs/answer-optimizer.json':{_udt:'Program_AnswerOptimizer',desc:'Max hourly rate via low-hanging fruit strategy',rules:['skip if time>2x avg','quality floor 0.85','batch similar topics','check rate every 10 answers','rotate platforms every 30min'],targets:{hourly_min:15,hourly_target:25,quality_min:0.85,daily_goal_usd:50}},
'programs/payout-harvester.json':{_udt:'Program_PayoutHarvester',desc:'Auto-collect payouts across platforms',platforms:[{name:'1Q',min:0,method:'paypal',note:'instant $0.25-$0.50 per answer'},{name:'Prolific',min:5,method:'paypal',note:'$8-12/hr academic surveys'},{name:'SurveyJunkie',min:5,method:'paypal',note:'$1-3 per survey'},{name:'Swagbucks',min:5,method:'gift_card',note:'$0.50-5 per survey'},{name:'UserTesting',min:7,method:'paypal',note:'$10-60 per test'},{name:'Respondent',min:0,method:'paypal',note:'$50-250 per interview'},{name:'JustAnswer',min:20,method:'direct_deposit',note:'expert Q&A, $5-50/answer'},{name:'UserInterviews',min:0,method:'paypal',note:'$50-200 per session'}]},
'alarms/survey-alarms.json':{_udt:'SurveyAlarms',alarms:[{id:'HIGH_VALUE',priority:1,trigger:'reward>$5 AND easy'},{id:'RATE_LOW',priority:2,trigger:'hourly<$10 for 30min'},{id:'PAYOUT_READY',priority:3,trigger:'pending>min_payout'},{id:'QUALITY_DROP',priority:2,trigger:'quality<0.85'},{id:'REJECTION_SPIKE',priority:1,trigger:'3+ rejections/hr'},{id:'DAILY_GOAL',priority:4,trigger:'earned>=daily_goal'},{id:'PLATFORM_DOWN',priority:3,trigger:'state==BLOCKED'}]},
};

(async()=>{
console.log('═══ GitPLC · Survey Auto ═══\n');
await br('plc-survey-auto','main');
console.log('Seeding...');
for(var[f,obj] of Object.entries(files)) await put('plc-survey-auto',f,JSON.stringify(obj,null,2),'Add '+f);
console.log('\nDone! '+Object.keys(files).length+' files');
})();
