#!/usr/bin/env node
const OWNER = 'teslasolar';
const REPO = 'GITPLC';

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
  console.log(r.ok ? '  ✓ branch: '+name : '  · exists: '+name);
}

async function putFile(br, fp, content, msg) {
  const existing = await api('/contents/'+fp+'?ref='+br);
  const body = { message:msg, content:Buffer.from(content).toString('base64'), branch:br };
  if (existing.ok) { const j = await existing.json(); body.sha = j.sha; }
  const r = await api('/contents/'+fp, { method:'PUT', body:JSON.stringify(body) });
  process.stdout.write(r.ok ? '.' : 'x');
}

const UDTS = {
  'equipment/room.json': {
    _udt:'Konomioke_Room', _schema:'gitplc/equipment/v1', prime:2,
    desc:'P2P karaoke room — the mesh IS the plant floor',
    fields:{
      room_id:{type:'STRING',desc:'Room hash'},
      host_peer:{type:'STRING',desc:'Host Ed25519 pubkey'},
      peer_count:{type:'INT',desc:'Connected peers'},
      state:{type:'ENUM',values:['IDLE','LOBBY','SINGING','PAUSED','ENDED']},
      track:{type:'STRING',desc:'Current track ID'},
      created:{type:'TIME'},
    }
  },
  'equipment/voice-stream.json': {
    _udt:'Konomioke_VoiceStream', _schema:'gitplc/equipment/v1', prime:3,
    desc:'WebRTC audio stream — one per singer per room',
    fields:{
      peer_id:{type:'STRING'}, stream_id:{type:'STRING'},
      active:{type:'BOOL'}, muted:{type:'BOOL'},
      volume_db:{type:'REAL',eng_lo:-60,eng_hi:0},
      latency_ms:{type:'INT'}, codec:{type:'STRING'},
    }
  },
  'equipment/audio-fabric.json': {
    _udt:'Konomioke_AudioFabric', _schema:'gitplc/equipment/v1', prime:5,
    desc:'Vagal phoneme engine — real-time voice analysis',
    fields:{
      phoneme:{type:'STRING',desc:'Current detected phoneme'},
      vagal_branch:{type:'ENUM',values:['dorsal','ventral','sympathetic']},
      coherence:{type:'REAL',eng_lo:0,eng_hi:1,desc:'Room vocal coherence'},
      hz:{type:'REAL',desc:'Fundamental frequency'},
      formant_1:{type:'REAL'}, formant_2:{type:'REAL'},
      ring_state:{type:'ARRAY',desc:'7-ring bloom exponents'},
    }
  },
  'equipment/vocal-processor.json': {
    _udt:'Konomioke_VocalProcessor', _schema:'gitplc/equipment/v1', prime:7,
    desc:'Pitch detection, harmony generation, mixing',
    fields:{
      pitch_hz:{type:'REAL'}, pitch_note:{type:'STRING'},
      harmony_enabled:{type:'BOOL'}, harmony_interval:{type:'INT'},
      reverb:{type:'REAL',eng_lo:0,eng_hi:1},
      mix_level:{type:'REAL',eng_lo:0,eng_hi:1},
    }
  },
  'equipment/track-engine.json': {
    _udt:'Konomioke_TrackEngine', _schema:'gitplc/equipment/v1', prime:11,
    desc:'Track loader, lyrics sync, queue system',
    fields:{
      track_id:{type:'STRING'}, title:{type:'STRING'}, artist:{type:'STRING'},
      duration_ms:{type:'INT'}, position_ms:{type:'INT'},
      lyrics_format:{type:'ENUM',values:['LRC','SRT','NONE']},
      queue_depth:{type:'INT'}, state:{type:'ENUM',values:['IDLE','LOADING','PLAYING','PAUSED']},
    }
  },
  'equipment/visualizer.json': {
    _udt:'Konomioke_Visualizer', _schema:'gitplc/equipment/v1', prime:13,
    desc:'127D vagal orb, per-singer particles, coherence visuals',
    fields:{
      mode:{type:'ENUM',values:['ORB','PARTICLES','WAVEFORM','SPECTRUM']},
      orb_radius:{type:'REAL'}, orb_color:{type:'STRING'},
      particle_count:{type:'INT'}, fps:{type:'REAL'},
      bloom_intensity:{type:'REAL',eng_lo:0,eng_hi:1},
    }
  },
};

const PROGRAMS = {
  'programs/konomioke-room-fsm.json': {
    _udt:'Program_RoomFSM', _schema:'gitplc/program/v1', site:'konomioke',
    desc:'Room state machine — IDLE→LOBBY→SINGING→PAUSED→ENDED',
    states:['IDLE','LOBBY','SINGING','PAUSED','ENDED'],
    transitions:[
      {from:'IDLE',to:'LOBBY',trigger:'create_room'},
      {from:'LOBBY',to:'SINGING',trigger:'start_track'},
      {from:'SINGING',to:'PAUSED',trigger:'pause'},
      {from:'PAUSED',to:'SINGING',trigger:'resume'},
      {from:'SINGING',to:'LOBBY',trigger:'track_end'},
      {from:['LOBBY','SINGING','PAUSED'],to:'ENDED',trigger:'close_room'},
    ]
  },
  'programs/konomioke-bloom-loop.json': {
    _udt:'Program_BloomLoop', _schema:'gitplc/program/v1', site:'konomioke',
    desc:'7-prime bloom loop — sample voice → gate phoneme → update ring',
    primes:[2,3,5,7,11,13,17],
    loops:[
      {prime:2,name:'L_identity',input:'peer_keypair',output:'room_membership'},
      {prime:3,name:'L_mesh',input:'webrtc_signal',output:'peer_connection'},
      {prime:5,name:'L_fabric',input:'audio_pcm',output:'vagal_state'},
      {prime:7,name:'L_vocal',input:'pitch_data',output:'harmony_mix'},
      {prime:11,name:'L_track',input:'lrc_sync',output:'lyrics_position'},
      {prime:13,name:'L_visual',input:'bloom_state',output:'render_frame'},
      {prime:17,name:'L_boot',input:'config',output:'app_ready'},
    ]
  },
  'programs/konomioke-vagal-map.json': {
    _udt:'Program_VagalPhonemeMap', _schema:'gitplc/program/v1', site:'konomioke',
    desc:'Phoneme → vagal branch mapping for therapeutic scoring',
    mappings:[
      {phonemes:['m','n','ng'],branch:'ventral',weight:0.9,desc:'Nasal hum — strong ventral vagal'},
      {phonemes:['ah','oh','oo'],branch:'ventral',weight:0.7,desc:'Open vowels — vagal tone'},
      {phonemes:['s','sh','f'],branch:'sympathetic',weight:0.4,desc:'Fricatives — mild activation'},
      {phonemes:['k','t','p'],branch:'sympathetic',weight:0.6,desc:'Plosives — sharp activation'},
      {phonemes:['th','v','z'],branch:'dorsal',weight:0.3,desc:'Voiced fricatives — grounding'},
    ]
  },
};

const ALARMS = {
  'alarms/konomioke-alarms.json': {
    _udt:'Konomioke_Alarms', _schema:'gitplc/alarms/v1', site:'konomioke',
    alarms:[
      {id:'MESH_DISCONNECT',priority:2,desc:'Peer disconnected unexpectedly',trigger:'peer_count < expected'},
      {id:'AUDIO_CLIP',priority:3,desc:'Audio clipping detected',trigger:'volume_db > -1'},
      {id:'LATENCY_HIGH',priority:3,desc:'Stream latency > 200ms',trigger:'latency_ms > 200'},
      {id:'COHERENCE_LOW',priority:4,desc:'Room coherence dropped below threshold',trigger:'coherence < 0.3'},
      {id:'TRACK_STALL',priority:2,desc:'Track playback stalled',trigger:'position_ms unchanged for 5s'},
      {id:'VAGAL_CRISIS',priority:1,desc:'Dorsal vagal shutdown detected in singer',trigger:'vagal_branch==dorsal && coherence<0.1'},
    ]
  },
};

async function main() {
  console.log('═══ GitPLC · Konomioke Branch ═══\n');

  console.log('Creating branch...');
  await branch('plc-konomioke', 'main');

  console.log('\nSeeding UDTs...');
  for (const [f,udt] of Object.entries(UDTS))
    await putFile('plc-konomioke', f, JSON.stringify(udt,null,2), 'Add '+f);

  console.log('\nSeeding programs...');
  for (const [f,prog] of Object.entries(PROGRAMS))
    await putFile('plc-konomioke', f, JSON.stringify(prog,null,2), 'Add '+f);

  console.log('\nSeeding alarms...');
  for (const [f,alarm] of Object.entries(ALARMS))
    await putFile('plc-konomioke', f, JSON.stringify(alarm,null,2), 'Add '+f);

  console.log('\n\n═══ Done! '+Object.keys(UDTS).length+' UDTs, '+Object.keys(PROGRAMS).length+' programs, '+Object.keys(ALARMS).length+' alarm set ═══');
}

main();
