#!/usr/bin/env node
const OWNER = 'teslasolar';
const REPO = 'GITPLC';
const fs = require('fs');
const path = require('path');

async function api(p, opts) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const r = await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO+p, {
    ...opts, headers: { 'Authorization':'token '+token, 'Content-Type':'application/json', ...(opts?.headers||{}) },
  });
  return r;
}

async function branch(name, from) {
  const ref = await (await api('/git/ref/heads/'+from)).json();
  const r = await api('/git/refs', { method:'POST', body:JSON.stringify({ ref:'refs/heads/'+name, sha:ref.object.sha }) });
  console.log(r.ok ? '  ✓ branch: '+name+' (from '+from+')' : '  · exists: '+name);
}

async function putFile(br, filePath, content, msg) {
  const existing = await api('/contents/'+filePath+'?ref='+br);
  const body = { message:msg, content:Buffer.from(content).toString('base64'), branch:br };
  if (existing.ok) { const j = await existing.json(); body.sha = j.sha; }
  const r = await api('/contents/'+filePath, { method:'PUT', body:JSON.stringify(body) });
  process.stdout.write(r.ok ? '.' : 'x');
}

const ROCKWELL_UDTS = {
  'vendor/rockwell-aoi.json': {
    _udt:'Rockwell_AOI', _schema:'gitplc/vendor/v1', vendor:'rockwell',
    desc:'Add-On Instruction wrapper for ControlLogix',
    fields:{ name:{type:'STRING'}, routine:{type:'STRING'}, scan_mode:{type:'ENUM',values:['Continuous','Periodic','Event']},
      in_params:{type:'ARRAY OF Field'}, out_params:{type:'ARRAY OF Field'}, local_tags:{type:'ARRAY OF Field'} }
  },
  'vendor/rockwell-udt-types.json': {
    _udt:'Rockwell_DataTypes', _schema:'gitplc/vendor/v1', vendor:'rockwell',
    type_map:{ BOOL:'BOOL', SINT:'SINT', INT:'INT', DINT:'DINT', LINT:'LINT', REAL:'REAL',
      LREAL:'LREAL', STRING:'STRING', TIMER:'TIMER', COUNTER:'COUNTER', CONTROL:'CONTROL',
      PID:'PID', MESSAGE:'MESSAGE', AXIS:'MOTION_INSTRUCTION' }
  },
  'programs/rockwell-motor-aoi.json': {
    _udt:'Program_RockwellMotor', _schema:'gitplc/program/v1', vendor:'rockwell',
    desc:'Rockwell AOI motor starter with interlock + permissive logic',
    aoi:'Motor_Starter_v3', inputs:['Run_Cmd','Jog_Cmd','E_Stop','Overload','Aux_Contact'],
    outputs:['Running','Faulted','Ready','RunTime_Hrs'], alarms:['Overload','Comm_Fail','RunTime_Hi']
  },
  'programs/rockwell-pid-enhanced.json': {
    _udt:'Program_RockwellPID', _schema:'gitplc/program/v1', vendor:'rockwell',
    desc:'Enhanced PID with auto-tune, tracking, anti-windup',
    block:'PIDE', inputs:['PV','SP','FF','TRK_Val','TRK_En'],
    outputs:['CV','PV_Pct','SP_Pct','Error','InAuto'], tuning:['Kp','Ki','Kd','CVHi','CVLo']
  },
};

const SIEMENS_UDTS = {
  'vendor/siemens-fb.json': {
    _udt:'Siemens_FB', _schema:'gitplc/vendor/v1', vendor:'siemens',
    desc:'Function Block wrapper for S7-1500 / TIA Portal',
    fields:{ name:{type:'STRING'}, fb_number:{type:'INT'}, instance_db:{type:'INT'},
      in_params:{type:'ARRAY OF Field'}, out_params:{type:'ARRAY OF Field'}, static:{type:'ARRAY OF Field'} }
  },
  'vendor/siemens-data-types.json': {
    _udt:'Siemens_DataTypes', _schema:'gitplc/vendor/v1', vendor:'siemens',
    type_map:{ Bool:'BOOL', SInt:'SINT', Int:'INT', DInt:'DINT', LInt:'LINT', Real:'REAL',
      LReal:'LREAL', String:'STRING', Time:'TIME', 'S5Time':'TIME', IEC_TIMER:'TIMER',
      IEC_COUNTER:'COUNTER', PID_Compact:'PID', PID_3Step:'PID' }
  },
  'programs/siemens-motor-fb.json': {
    _udt:'Program_SiemensMotor', _schema:'gitplc/program/v1', vendor:'siemens',
    desc:'S7-1500 motor control FB with safety integration',
    fb:'FB_MotorCtrl', inputs:['bStart','bStop','bReset','bEStop','bOverload'],
    outputs:['bRunning','bFault','bReady','rRunHours'], safety:'F-DI / F-DO integration'
  },
};

const CODESYS_UDTS = {
  'vendor/codesys-pou.json': {
    _udt:'Codesys_POU', _schema:'gitplc/vendor/v1', vendor:'codesys',
    desc:'IEC 61131-3 Program Organization Unit',
    fields:{ name:{type:'STRING'}, pou_type:{type:'ENUM',values:['PROGRAM','FUNCTION_BLOCK','FUNCTION']},
      language:{type:'ENUM',values:['ST','LD','FBD','SFC','IL','CFC']},
      var_input:{type:'ARRAY OF Field'}, var_output:{type:'ARRAY OF Field'}, var_local:{type:'ARRAY OF Field'} }
  },
  'vendor/codesys-data-types.json': {
    _udt:'Codesys_DataTypes', _schema:'gitplc/vendor/v1', vendor:'codesys',
    type_map:{ BOOL:'BOOL', SINT:'SINT', INT:'INT', DINT:'DINT', LINT:'LINT', REAL:'REAL',
      LREAL:'LREAL', STRING:'STRING', TIME:'TIME', TON:'TIMER', CTU:'COUNTER', PID:'PID' }
  },
};

const ASSWAY_PROGRAMS = {
  'programs/assway-tankfarm.json': {
    _udt:'Program_AsswayTankFarm', _schema:'gitplc/program/v1', site:'assway', vendor:'rockwell',
    desc:'Tank farm batch control — fill/settle/transfer sequences',
    phases:['Fill','Heat','Settle','Transfer','CIP'], tanks:['TK001','TK002','TK003'],
    interlocks:['HiHi_Level','LoLo_Level','Hi_Temp','Hi_Pressure']
  },
  'programs/assway-pump-station.json': {
    _udt:'Program_AsswayPumps', _schema:'gitplc/program/v1', site:'assway', vendor:'rockwell',
    desc:'Pump station lead/lag/standby rotation with VFD speed control',
    pumps:['P001','P002'], mode:'Lead-Lag', vfd_control:true,
    permissives:['Suction_Press_OK','Discharge_Valve_Open','Seal_Water_OK']
  },
};

async function main() {
  console.log('═══ GitPLC Branch Seeder ═══\n');

  console.log('Creating branches...');
  await branch('plc-rockwell', 'main');
  await branch('plc-siemens', 'main');
  await branch('plc-codesys', 'main');
  await branch('plc-rockwell-assway', 'plc-rockwell');

  console.log('\nPushing manifest to main...');
  const manifest = fs.readFileSync(path.join(__dirname, 'branch-manifest.json'), 'utf8');
  await putFile('main', 'branch-manifest.json', manifest, 'Add branch manifest');

  console.log('\nSeeding plc-rockwell...');
  for (const [f,udt] of Object.entries(ROCKWELL_UDTS))
    await putFile('plc-rockwell', f, JSON.stringify(udt,null,2), 'Add '+f);

  console.log('\nSeeding plc-siemens...');
  for (const [f,udt] of Object.entries(SIEMENS_UDTS))
    await putFile('plc-siemens', f, JSON.stringify(udt,null,2), 'Add '+f);

  console.log('\nSeeding plc-codesys...');
  for (const [f,udt] of Object.entries(CODESYS_UDTS))
    await putFile('plc-codesys', f, JSON.stringify(udt,null,2), 'Add '+f);

  console.log('\nSeeding plc-rockwell-assway...');
  for (const [f,udt] of Object.entries(ASSWAY_PROGRAMS))
    await putFile('plc-rockwell-assway', f, JSON.stringify(udt,null,2), 'Add '+f);

  console.log('\n\n═══ Done! 4 branches seeded ═══');
}

main();
