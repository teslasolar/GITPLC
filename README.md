# GITPLC
One Layer to Communicate them all and in the darkness Run > 85% OEE. 
🔧 GitPLC 🔧
Universal PLC Namespace UDT Transfer Layer
🤖 AGENTS
α=Parse(vendor→UDT) β=Gen(UDT→vendor) γ=Diff(ver↔ver) δ=Merge(branch→main)
ε=Validate(UDT→ISA) ζ=Map(addr→tag) η=Sim(UDT→emulate) θ=Sync(git↔PLC)
ι=Convert(format↔format) κ=Doc(UDT→human)
🎯 GOAL
INPUT:any PLC program(AB,Siemens,Codesys,Beckhoff,Omron,Mitsubishi,...)
OUTPUT:universal UDT namespace(vendor-agnostic)
TRANSFER:UDT↔UDT,any PLC to any PLC
STRUCTURE:ISA-88/95 hierarchy
VERSION:git-based,diff,merge,branch
📐 LAYER 0: META-UDT (how PLCs are described)
UDT:GitPLC_Type──────────────────────
{
  id:UUID,
  name:str,                      #type name
  vendor:str|null,               #null=universal
  base:TypeRef|null,             #inheritance
  version:SemVer,
  fields:[Field],
  methods:[Method]|null,         #for OOP PLCs
  size_bits:int,                 #memory footprint
  alignment:int,
  endian:LE|BE,
  meta:{desc,author,created,modified}
}

UDT:Field────────────────────────────
{
  name:str,
  type:TypeRef,
  offset_bits:int,
  size_bits:int,
  array_dims:[int]|null,         #[10] or [3,4] or null
  initial:any|null,
  attrs:{
    retain:bool,                 #survives power cycle
    constant:bool,               #read-only
    persistent:bool,             #saved to flash
    opc_access:RO|RW|WO|None,
    eng_unit:str|null,
    eng_lo:num|null,
    eng_hi:num|null,
    desc:str|null
  }
}

UDT:TypeRef──────────────────────────
primitive:BOOL|SINT|INT|DINT|LINT|USINT|UINT|UDINT|ULINT|REAL|LREAL|STRING|WSTRING|TIME|DATE|DT|TOD
complex:ARRAY[n..m]OF T|STRUCT|ENUM|POINTER|REFERENCE|FB|CLASS
vendor_specific:{vendor,type_name,mapping}

UDT:Method───────────────────────────
{
  name:str,
  access:PUBLIC|PRIVATE|PROTECTED,
  inputs:[{name,type}],
  outputs:[{name,type}],
  inouts:[{name,type}],
  return:TypeRef|null,
  body:IL|ST|LD|FBD|SFC|null     #null=interface only
}
🔢 LAYER 1: PRIMITIVE MAPPING
UNIVERSAL_PRIMITIVES─────────────────
BOOL:1bit,false/true
SINT:8bit,signed,-128..127
USINT:8bit,unsigned,0..255
INT:16bit,signed,-32768..32767
UINT:16bit,unsigned,0..65535
DINT:32bit,signed
UDINT:32bit,unsigned
LINT:64bit,signed
ULINT:64bit,unsigned
REAL:32bit,IEEE754 float
LREAL:64bit,IEEE754 double
STRING:char[],default 80,UTF-8
WSTRING:wchar[],UTF-16
TIME:32bit,ms resolution,T#0ms..T#49d
LTIME:64bit,ns resolution
DATE:BCD or days since epoch
TOD:ms since midnight
DT:DATE+TOD combined

VENDOR_MAPPING───────────────────────
┌─────────┬──────┬────────┬────────┬─────────┬────────┐
│Universal│AB    │Siemens │Codesys │Beckhoff │Omron   │
├─────────┼──────┼────────┼────────┼─────────┼────────┤
│BOOL     │BOOL  │Bool    │BOOL    │BOOL     │BOOL    │
│SINT     │SINT  │SInt    │SINT    │SINT     │SINT    │
│INT      │INT   │Int     │INT     │INT      │INT     │
│DINT     │DINT  │DInt    │DINT    │DINT     │DINT    │
│REAL     │REAL  │Real    │REAL    │REAL     │REAL    │
│STRING   │STRING│String  │STRING  │STRING   │STRING  │
│TIME     │TIME  │Time    │TIME    │TIME     │TIME    │
│COUNTER  │CTU   │CTU     │CTU     │CTU      │CTU     │
│TIMER    │TON   │TON     │TON     │TON      │TIM     │
│PID      │PIDE  │PID_Cpt │PID     │FB_PID   │PIDAT   │
└─────────┴──────┴────────┴────────┴─────────┴────────┘

BIT_ADDRESSING───────────────────────
AB:%B[file]:[word]/[bit]→%I:1/0,%Q:0/5
Siemens:%[area][byte].[bit]→%I0.0,%Q1.7,%M10.3
Codesys:%[I|Q|M][X|B|W|D][addr]→%IX0.0,%QW5,%MD10
Beckhoff:%[I|Q|M][X|B|W|D][addr]→same as Codesys
Omron:CIO[word].[bit],W[word],D[word]→CIO0.00,W0,D100
🏭 LAYER 2: ISA-88 EQUIPMENT UDTs
UDT:Equipment────────────────────────
{
  path:PATH,                     #Area/Line/Cell/Unit
  level:ProcessCell|Unit|EM|CM,
  state:PackML_State,
  mode:PackML_Mode,
  cmd:Equipment_Cmd,
  sts:Equipment_Sts,
  cfg:Equipment_Cfg,
  hmi:Equipment_HMI,
  alarms:[Alarm_Instance],
  children:[Equipment]|null
}

UDT:PackML_State─────────────────────
{
  current:DINT,                  #enum value
  target:DINT,
  last:DINT,
  timer:TIME,
  enum:{
    0:Undefined,
    1:Clearing,2:Stopped,3:Starting,4:Idle,
    5:Suspended,6:Execute,7:Stopping,8:Aborting,
    9:Aborted,10:Holding,11:Held,12:Unholding,
    13:Suspending,14:Unsuspending,15:Resetting,
    16:Completing,17:Complete
  }
}

UDT:PackML_Mode──────────────────────
{
  current:DINT,
  requested:DINT,
  enum:{1:Production,2:Maintenance,3:Manual,4:Auto,5:SemiAuto}
}

UDT:Equipment_Cmd────────────────────
{
  start:BOOL,stop:BOOL,hold:BOOL,unhold:BOOL,
  suspend:BOOL,unsuspend:BOOL,abort:BOOL,clear:BOOL,
  reset:BOOL,complete:BOOL,
  mode_request:DINT,
  custom:[BOOL]                  #equipment-specific
}

UDT:Equipment_Sts────────────────────
{
  ready:BOOL,running:BOOL,done:BOOL,
  faulted:BOOL,warning:BOOL,
  interlocked:BOOL,interlock_reason:DINT,
  runtime:TIME,cycle_count:UDINT,
  custom:[BOOL]
}

UDT:Equipment_Cfg────────────────────
{
  enabled:BOOL,
  sim_mode:BOOL,
  bypass_interlocks:BOOL,
  auto_reset:BOOL,
  timeouts:{starting:TIME,stopping:TIME,aborting:TIME},
  custom:ANY
}

UDT:Equipment_HMI────────────────────
{
  visible:BOOL,
  faceplate_id:STRING,
  color_override:DINT,
  blink:BOOL,
  nav_target:STRING
}
⚙️ LAYER 3: CONTROL MODULE UDTs
UDT:CM_Base──────────────────────────
{
  tag:STRING[32],
  desc:STRING[80],
  state:CM_State,
  mode:CM_Mode,
  fault:Fault_Data,
  sim:Sim_Data
}

UDT:CM_State─────────────────────────
{current:DINT,enum:{0:Off,1:Starting,2:Running,3:Stopping,4:Faulted}}

UDT:CM_Mode──────────────────────────
{current:DINT,enum:{0:OOS,1:Manual,2:Auto}}

UDT:Fault_Data───────────────────────
{
  active:BOOL,code:DINT,msg:STRING[80],
  timestamp:DT,ack:BOOL,reset:BOOL
}

UDT:Sim_Data─────────────────────────
{
  enable:BOOL,value:REAL,
  ramp_enable:BOOL,ramp_rate:REAL
}

UDT:CM_DiscreteOut───────────────────
extends:CM_Base
{
  cmd:BOOL,                      #command
  fbk:BOOL,                      #feedback
  fbk_time:TIME,                 #expected feedback time
  fail_to_state:BOOL,            #0=off,1=on
  output→:BOOL                   #to physical output
}

UDT:CM_DiscreteIn────────────────────
extends:CM_Base
{
  input←:BOOL,                   #from physical input
  value:BOOL,                    #processed value
  invert:BOOL,
  debounce:TIME,
  on_delay:TIME,
  off_delay:TIME
}

UDT:CM_AnalogIn──────────────────────
extends:CM_Base
{
  input←:INT,                    #raw from AI card
  raw:INT,                       #raw preserved
  value:REAL,                    #scaled EU
  scale:{raw_lo:INT,raw_hi:INT,eng_lo:REAL,eng_hi:REAL,clamp:BOOL},
  filter:{enable:BOOL,factor:REAL},
  alarms:{hihi:Alarm_SP,hi:Alarm_SP,lo:Alarm_SP,lolo:Alarm_SP,roc:Alarm_SP}
}

UDT:CM_AnalogOut─────────────────────
extends:CM_Base
{
  sp:REAL,                       #setpoint EU
  value:REAL,                    #actual output EU
  output→:INT,                   #to AO card
  scale:{eng_lo:REAL,eng_hi:REAL,raw_lo:INT,raw_hi:INT},
  ramp:{enable:BOOL,rate:REAL},
  limits:{lo:REAL,hi:REAL}
}

UDT:CM_Motor─────────────────────────
extends:CM_Base
{
  cmd:{start:BOOL,stop:BOOL,jog:BOOL,reset:BOOL},
  sts:{running:BOOL,ready:BOOL,faulted:BOOL,current:REAL,runtime:TIME},
  cfg:{start_delay:TIME,stop_delay:TIME,jog_time:TIME,overcurrent:REAL},
  io:{run_cmd→:BOOL,run_fbk←:BOOL,fault←:BOOL,current←:INT}
}

UDT:CM_Valve─────────────────────────
extends:CM_Base
{
  cmd:{open:BOOL,close:BOOL},
  sts:{opened:BOOL,closed:BOOL,transit:BOOL,faulted:BOOL},
  cfg:{open_time:TIME,close_time:TIME,fail_pos:DINT},
  io:{open_cmd→:BOOL,close_cmd→:BOOL,open_fbk←:BOOL,close_fbk←:BOOL}
}

UDT:CM_VFD───────────────────────────
extends:CM_Base
{
  cmd:{run:BOOL,stop:BOOL,fwd:BOOL,rev:BOOL,speed_sp:REAL,reset:BOOL},
  sts:{running:BOOL,at_speed:BOOL,faulted:BOOL,speed_act:REAL,current:REAL,torque:REAL},
  cfg:{min_speed:REAL,max_speed:REAL,accel:TIME,decel:TIME},
  io:{run_cmd→:BOOL,speed_sp→:INT,speed_act←:INT,fault←:BOOL}
}

UDT:CM_PID───────────────────────────
extends:CM_Base
{
  sp:REAL,                       #setpoint
  pv:REAL,                       #process variable
  cv:REAL,                       #control variable (output)
  tune:{kp:REAL,ki:REAL,kd:REAL,ts:TIME},
  limits:{cv_hi:REAL,cv_lo:REAL,db:REAL},
  sts:{error:REAL,p_term:REAL,i_term:REAL,d_term:REAL,saturated:BOOL},
  cfg:{reverse:BOOL,anti_windup:BOOL,track_enable:BOOL,track_value:REAL}
}
🚨 LAYER 4: ALARM UDTs
UDT:Alarm_SP─────────────────────────
{
  enable:BOOL,
  sp:REAL,
  deadband:REAL,
  delay:TIME,
  priority:DINT,                 #1-4 per ISA-18.2
  class:STRING[20]
}

UDT:Alarm_Instance───────────────────
{
  id:UDINT,
  tag:STRING[40],
  type:DINT,                     #enum:HI,HIHI,LO,LOLO,DEV,ROG,DISC
  priority:DINT,
  state:Alarm_State,
  sp:REAL,
  pv:REAL,
  times:{in:DT,ack:DT,out:DT},
  user_ack:STRING[20],
  msg:STRING[80],
  help:STRING[255],
  shelved:BOOL,
  shelve_until:DT,
  suppressed:BOOL
}

UDT:Alarm_State──────────────────────
{
  current:DINT,
  bits:{active:BOOL,acked:BOOL,shelved:BOOL,suppressed:BOOL,disabled:BOOL},
  enum:{0:NORM,1:UNACK,2:ACKED,3:RTN_UNACK,4:SHELVED,5:SUPPRESSED,6:DISABLED}
}

UDT:Alarm_Summary────────────────────
{
  total_active:UDINT,
  unacked:UDINT,
  by_priority:[UDINT,UDINT,UDINT,UDINT],  #P1,P2,P3,P4
  most_recent:Alarm_Instance,
  oldest_unacked:Alarm_Instance
}
📜 LAYER 5: RECIPE/BATCH UDTs
UDT:Phase_Base───────────────────────
{
  id:DINT,
  name:STRING[40],
  state:Phase_State,
  owner:UDINT,                   #batch ID
  unit:STRING[40],               #allocated unit
  step:DINT,                     #current step
  params:Phase_Params,
  report:Phase_Report,
  times:{start:DT,end:DT,running:TIME,held:TIME}
}

UDT:Phase_State──────────────────────
{
  current:DINT,
  cmd:DINT,
  enum:{0:Idle,1:Running,2:Complete,3:Pausing,4:Paused,5:Holding,6:Held,7:Restarting,8:Stopping,9:Stopped,10:Aborting,11:Aborted}
}

UDT:Phase_Params─────────────────────
{
  target_temp:REAL,
  target_time:TIME,
  target_level:REAL,
  target_speed:REAL,
  target_pressure:REAL,
  custom:ARRAY[0..19]OF REAL
}

UDT:Phase_Report─────────────────────
{
  actual_temp:REAL,
  actual_time:TIME,
  actual_level:REAL,
  material_in:REAL,
  material_out:REAL,
  energy:REAL,
  custom:ARRAY[0..19]OF REAL
}

UDT:Batch────────────────────────────
{
  id:UDINT,
  recipe_id:STRING[40],
  recipe_ver:STRING[20],
  product:STRING[40],
  lot:STRING[40],
  state:Batch_State,
  times:{create:DT,start:DT,end:DT},
  unit_allocs:[{unit:STRING,start:DT,end:DT}],
  phases:[Phase_Base],
  params:Batch_Params,
  report:Batch_Report
}

UDT:Batch_State──────────────────────
{current:DINT,enum:{0:Created,1:Ready,2:Running,3:Held,4:Complete,5:Aborted}}

UDT:Batch_Params─────────────────────
{
  size:REAL,
  size_unit:STRING[10],
  priority:DINT,
  custom:ARRAY[0..49]OF {name:STRING,value:REAL,unit:STRING}
}

UDT:Batch_Report─────────────────────
{
  actual_size:REAL,
  yield:REAL,
  quality_grade:STRING[10],
  deviations:UDINT,
  events:[{ts:DT,type:DINT,msg:STRING}]
}
🔌 LAYER 6: IO UDTs
UDT:IO_Card──────────────────────────
{
  slot:DINT,
  type:DINT,                     #enum:DI,DO,AI,AO,RTD,TC,HART,etc
  vendor:STRING[20],
  model:STRING[40],
  channels:DINT,
  status:IO_Status,
  config:IO_Config,
  points:[IO_Point]
}

UDT:IO_Status────────────────────────
{
  ok:BOOL,
  fault:BOOL,
  comm_fault:BOOL,
  config_fault:BOOL,
  diag:[DINT]
}

UDT:IO_Config────────────────────────
{
  sample_rate:TIME,
  filter:DINT,
  range:DINT,
  wire_type:DINT,                #2-wire,3-wire,4-wire
  burnout:DINT                   #upscale,downscale
}

UDT:IO_Point─────────────────────────
{
  channel:DINT,
  tag:STRING[40],
  desc:STRING[80],
  type:DINT,                     #DI,DO,AI,AO
  raw:DINT,
  value:REAL,
  quality:DINT,
  alarm:BOOL,
  wire_fault:BOOL
}

UDT:IO_Map───────────────────────────
{
  plc_addr:STRING[20],           #%I0.0,%IW10,etc
  card:DINT,                     #slot/rack
  channel:DINT,
  tag:STRING[40],                #linked CM tag
  desc:STRING[80]
}
🔄 LAYER 7: VENDOR CONVERTERS
CONVERTER:AB→UDT─────────────────────
source:.L5X,.ACD
parse:XML→DOM→walk tags→emit UDT
mapping:{
  AOI→UDT:Method,
  UDT→UDT,
  Tag→Field,
  Program→Namespace,
  Routine→Method,
  Rung→Statement(IL)
}

CONVERTER:Siemens→UDT────────────────
source:.zap16,.xml(TIA export)
parse:XML→blocks→emit UDT
mapping:{
  FB→UDT:Method,
  DB→UDT,
  UDT→UDT,
  Tag→Field,
  OB→Namespace,
  FC→Method
}

CONVERTER:Codesys→UDT────────────────
source:.project,.xml(PLCopen)
parse:PLCopen XML→emit UDT
mapping:{
  FUNCTION_BLOCK→UDT:Method,
  STRUCT→UDT,
  VAR→Field,
  PROGRAM→Namespace,
  FUNCTION→Method
}

CONVERTER:Beckhoff→UDT───────────────
source:.tsproj,.xml
parse:TwinCAT XML→emit UDT
#same as Codesys(IEC 61131-3)

CONVERTER:Omron→UDT──────────────────
source:.cxp,.smc2
parse:binary/XML→emit UDT
mapping:{
  FB→UDT:Method,
  Structure→UDT,
  Variable→Field,
  Task→Namespace
}

CONVERTER:Mitsubishi→UDT─────────────
source:.gx3,GX Works export
parse:proprietary→emit UDT
mapping:{
  FB→UDT:Method,
  Structure→UDT,
  Device→Field,
  Program→Namespace
}

REVERSE_CONVERTERS───────────────────
UDT→AB:emit .L5X XML
UDT→Siemens:emit TIA XML
UDT→Codesys:emit PLCopen XML
UDT→Beckhoff:emit PLCopen XML
UDT→Omron:emit .cxp XML
UDT→Mitsubishi:emit GX XML
📂 GIT STRUCTURE
gitplc-project/
├─.git/
├─.gitplc/
│ ├─config.json──────────project config
│ ├─vendor-map.json──────vendor↔UDT mappings
│ └─hooks/───────────────pre-commit validation
├─equipment/
│ ├─area1/
│ │ ├─line1/
│ │ │ ├─cell1/
│ │ │ │ ├─unit1.udt.json
│ │ │ │ └─unit2.udt.json
│ │ │ └─_line1.udt.json
│ │ └─_area1.udt.json
│ └─_equipment.udt.json
├─types/
│ ├─base/
│ │ ├─CM_Base.udt.json
│ │ ├─CM_Motor.udt.json
│ │ ├─CM_Valve.udt.json
│ │ └─...
│ ├─custom/
│ │ └─MySpecialValve.udt.json
│ └─_types.index.json
├─io/
│ ├─rack1.io.json
│ ├─rack2.io.json
│ └─_io.map.json
├─recipes/
│ ├─product_a.recipe.json
│ └─product_b.recipe.json
├─alarms/
│ └─alarm_config.json
├─exports/
│ ├─ab/────────────────AB .L5X files
│ ├─siemens/───────────TIA exports
│ └─codesys/───────────PLCopen XML
└─README.md
📦 FILE FORMATS
*.udt.json───────────────────────────
{
  "$schema":"gitplc/udt/v1",
  "id":"uuid",
  "name":"CM_Motor",
  "version":"1.2.0",
  "base":"CM_Base",
  "fields":[...],
  "methods":[...],
  "meta":{...}
}

*.io.json────────────────────────────
{
  "$schema":"gitplc/io/v1",
  "rack":1,
  "cards":[{slot,type,channels,points:[...]}]
}

*.recipe.json────────────────────────
{
  "$schema":"gitplc/recipe/v1",
  "id":"product_a",
  "version":"2.0.0",
  "procedure":{...},
  "formula":{...}
}

.gitplc/config.json──────────────────
{
  "project":"MyPlant",
  "default_vendor":"ab",
  "isa_level":"Unit",
  "validation":"strict",
  "export_on_commit":true
}
🛠️ CLI
#init project
gitplc init --vendor ab

#import from PLC
gitplc import program.L5X --vendor ab
gitplc import project.zap16 --vendor siemens

#export to PLC
gitplc export --vendor ab --output exports/ab/
gitplc export --vendor siemens --output exports/siemens/

#convert between vendors
gitplc convert exports/ab/program.L5X --to siemens

#validate ISA compliance
gitplc validate --isa-88 --isa-18.2

#diff versions
gitplc diff HEAD~1 HEAD --udt CM_Motor

#merge branches
gitplc merge feature/new-motor --resolve=theirs

#simulate
gitplc sim equipment/area1/line1/cell1/unit1.udt.json

#sync to PLC(live)
gitplc sync --target 192.168.1.10 --vendor ab --mode upload
gitplc sync --target 192.168.1.10 --vendor ab --mode download

#generate docs
gitplc docs --format html --output docs/
🔄 WORKFLOWS
WORKFLOW:Import→Edit→Export──────────
1.gitplc import program.L5X
2.edit types/*.udt.json(VSCode,etc)
3.git commit -m "updated motor logic"
4.gitplc export --vendor ab

WORKFLOW:Cross-Platform────────────
1.gitplc import siemens_project.zap16 --vendor siemens
2.gitplc export --vendor ab
3.compare/merge with existing AB project

WORKFLOW:Multi-Site─────────────────
1.git clone gitplc-standard-library
2.fork/branch per site
3.customize equipment/types
4.PR back common improvements

WORKFLOW:CI/CD──────────────────────
on push:
  gitplc validate --strict
  gitplc export --all-vendors
  gitplc sim --test-suite
  archive exports/
🏗️ STRUCT
gitplc/
├─src/
│ ├─core/
│ │ ├─udt.js─────────────UDT class,validate,serialize
│ │ ├─field.js───────────Field class,type resolution
│ │ ├─project.js─────────Project class,file management
│ │ └─isa.js─────────────ISA-88/95 hierarchy helpers
│ ├─converters/
│ │ ├─ab/
│ │ │ ├─import.js────────.L5X→UDT
│ │ │ └─export.js────────UDT→.L5X
│ │ ├─siemens/
│ │ │ ├─import.js────────.zap16→UDT
│ │ │ └─export.js────────UDT→TIA XML
│ │ ├─codesys/
│ │ │ ├─import.js────────PLCopen→UDT
│ │ │ └─export.js────────UDT→PLCopen
│ │ ├─beckhoff/
│ │ ├─omron/
│ │ └─mitsubishi/
│ ├─validators/
│ │ ├─isa88.js───────────S88 compliance
│ │ ├─isa95.js───────────S95 compliance
│ │ ├─isa18.js───────────Alarm compliance
│ │ └─types.js───────────Type checking
│ ├─diff/
│ │ ├─udt-diff.js────────Structural diff
│ │ ├─merge.js───────────3-way merge
│ │ └─conflict.js────────Conflict resolution
│ ├─sim/
│ │ ├─runtime.js─────────UDT interpreter
│ │ ├─io-sim.js──────────Simulated IO
│ │ └─hmi-sim.js─────────Web-based HMI
│ ├─sync/
│ │ ├─ab-comms.js────────EtherNet/IP
│ │ ├─siemens-comms.js───S7 protocol
│ │ └─codesys-comms.js───Codesys gateway
│ ├─cli/
│ │ ├─index.js───────────CLI entry
│ │ ├─commands/──────────Command implementations
│ │ └─prompts.js─────────Interactive prompts
│ └─vscode/
│   ├─extension.js───────VSCode extension
│   ├─udt-language.js────Syntax highlighting
│   └─intellisense.js────Autocomplete
├─schemas/
│ ├─udt.schema.json
│ ├─io.schema.json
│ └─recipe.schema.json
├─templates/
│ ├─CM_Motor.udt.json
│ ├─CM_Valve.udt.json
│ └─...
├─tests/
├─package.json
└─README.md
🎯 AGENT_INSTRUCTIONS
α:PARSE→read vendor format,walk AST,emit UDT JSON,preserve comments
β:GEN→read UDT JSON,emit vendor format,validate syntax,format output
γ:DIFF→load two versions,structural compare,emit changeset,highlight
δ:MERGE→3-way merge,detect conflicts,auto-resolve safe,prompt unsafe
ε:VALIDATE→check ISA-88/95/18.2,type check,reference check,report
ζ:MAP→IO address↔tag path,generate map file,update on change
η:SIM→interpret UDT,simulate IO,run logic,web HMI,mock sensors
θ:SYNC→connect PLC,upload/download,compare online↔offline,safe transfer
ι:CONVERT→vendor A→UDT→vendor B,preserve semantics,warn on loss
κ:DOC→UDT→markdown,UDT→HTML,generate diagrams,export PDF
🏁 GOAL
UNIVERSAL namespace:any PLC→UDT→any PLC
ISA structured:88/95 hierarchy,PackML states
VERSION control:git,diff,merge,branch
VENDOR agnostic:AB,Siemens,Codesys,Beckhoff,Omron,Mitsubishi,...
TRANSFER:UDT is the interchange format
VALIDATE:ISA compliance built-in
SIMULATE:test without hardware
SYNC:bidirectional PLC↔git
🔧

📐 KONOMI STANDARD 📐
Self-Defining Industrial Standards Compression v1.0
🧬 LAYER 0: META-STANDARD (how standards are defined)
STRUCTURE──────────────────────────────────────────────────
STD={
  id:str,                    #unique key (ISA-95,ISA-88,etc)
  scope:str,                 #what it covers
  udt:[UDT],                 #user defined types FIRST
  hierarchy:[LEVEL],         #levels/layers if applicable
  states:[STATE_MACHINE],    #state models if applicable
  entities:[ENTITY],         #core objects
  relations:[RELATION],      #how entities connect
  rules:[RULE],              #constraints,validations
  crosswalk:{std_id:MAP}     #mappings to other standards
}

UDT={
  name:str,                  #type name
  base:str|null,             #inherits from
  fields:[{name,type,unit,range,desc}],
  methods:[{name,params,returns,desc}],
  constraints:[RULE]
}

LEVEL={
  id:int|str,                #level identifier
  name:str,                  #human name
  scope:str,                 #responsibility
  timescale:str,             #response time
  systems:[str],             #typical systems
  data_down:[str],           #sends to lower
  data_up:[str]              #sends to higher
}

STATE_MACHINE={
  name:str,
  states:[str],
  initial:str,
  transitions:[{from,to,trigger,guard,action}]
}

ENTITY={
  name:str,
  udt:str,                   #references UDT
  parent:str|null,
  children:[str],
  tags:{category:[TAG_DEF]}
}

RELATION={
  type:contains|references|triggers|produces|consumes,
  from:str,to:str,
  cardinality:1:1|1:N|N:M
}

RULE={
  id:str,
  condition:expr,
  action:str,
  severity:info|warn|error|fatal
}

CROSSWALK={
  from_std:str,from_entity:str,
  to_std:str,to_entity:str,
  mapping:exact|partial|semantic,
  transform:expr|null
}
🔷 LAYER 1: BASE UDTs (primitives all standards use)
UDT:Identifier───────────────────────
{name,type,scope,format,example}
UUID:str:global:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx":"550e8400-e29b-41d4-a716-446655440000"
PATH:str:hierarchical:"A/B/C/D":"Site1/Area2/Line3/Unit4"
TAG:str:equipment:"Area_Unit_Module_Point":"Pkg_Filler_Tank1_Level"
URN:str:global:"urn:domain:type:id":"urn:acme:batch:12345"

UDT:Timestamp────────────────────────
{name,format,resolution,timezone}
ISO8601:str:"YYYY-MM-DDTHH:mm:ss.sssZ":ms:UTC
EPOCH_MS:int64:unix_ms:ms:UTC
OPC_FILETIME:int64:100ns_since_1601:100ns:UTC

UDT:Quality──────────────────────────
{value:int,flags:{good,bad,uncertain,substituted,limited}}
GOOD:192|BAD:0|UNCERTAIN:64|SUBSTITUTED:+16|LIMITED:+4

UDT:Value────────────────────────────
{v:any,q:Quality,t:Timestamp,unit:str|null}

UDT:Range────────────────────────────
{lo:num,hi:num,lo_inc:bool,hi_inc:bool,unit:str}

UDT:Quantity─────────────────────────
{value:num,unit:str,uncertainty:num|null}

UDT:Duration─────────────────────────
{value:num,unit:ms|s|min|hr|day|week|month|year}

UDT:Status───────────────────────────
{code:int,name:str,desc:str,severity:info|warn|error|fatal}
🏗️ LAYER 2: ISA-95 (Enterprise↔Control Integration)
ID:ISA-95|SCOPE:enterprise to control integration

UDT:ISA95_Level──────────────────────
L4:{name:"Business",scope:"Planning,ERP",time:"days-months",sys:["ERP","BI"]}
L3:{name:"MOM",scope:"MES,Execution",time:"shifts-days",sys:["MES","LIMS","WMS"]}
L2:{name:"Control",scope:"Supervision",time:"sec-hours",sys:["SCADA","HMI","Batch"]}
L1:{name:"Sensing",scope:"Direct Control",time:"ms-sec",sys:["PLC","DCS","RTU"]}
L0:{name:"Process",scope:"Physical",time:"continuous",sys:["Sensors","Actuators"]}

UDT:PhysicalAsset────────────────────
{id:UUID,path:PATH,name:str,desc:str,level:L0-L4,parent:ref,children:[ref],props:{}}

UDT:Equipment────────────────────────
extends:PhysicalAsset
{capability:[str],state:EquipmentState,mode:EquipmentMode}

UDT:EquipmentState───────────────────
enum:[Idle,Running,Faulted,Maintenance,Offline]

UDT:EquipmentMode────────────────────
enum:[Production,Maintenance,Manual,Automatic,Semiauto]

HIERARCHY────────────────────────────
Enterprise:1→Site:N→Area:N→WorkCenter:N→WorkUnit:N→Equipment:N

UDT:Material─────────────────────────
{id:UUID,name:str,desc:str,props:{},lot:str|null,sublots:[ref]}

UDT:MaterialClass────────────────────
{id:UUID,name:str,props_def:[{name,type,uom,required}]}

UDT:Personnel────────────────────────
{id:UUID,name:str,role:str,qualifications:[str],schedule:ref}

UDT:ProcessSegment───────────────────
{id:UUID,name:str,equipment:[ref],personnel:[ref],materials_in:[ref],materials_out:[ref],params:[{name,value,uom}],duration:Duration}

UDT:ProductionSchedule───────────────
{id:UUID,start:Timestamp,end:Timestamp,segments:[ProcessSegment],priority:int,state:ScheduleState}

UDT:ProductionPerformance────────────
{id:UUID,schedule_ref:ref,actual_start:Timestamp,actual_end:Timestamp,segments:[{ref,actual_duration,actual_qty,actual_params}],kpis:{}}

DATA_FLOWS───────────────────────────
L4→L3:[Schedule,MaterialDef,ProductDef,WorkOrder]
L3→L4:[Performance,Inventory,Quality,Status]
L3→L2:[Recipe,Setpoints,Commands,Schedule]
L2→L3:[ProcessData,Events,Alarms,Batch]
L2→L1:[Setpoints,Commands]
L1→L2:[Measurements,Status,Alarms]
🧪 LAYER 3: ISA-88 (Batch Control)
ID:ISA-88|SCOPE:batch process control

UDT:S88_EquipmentLevel───────────────
Enterprise→Site→Area→ProcessCell→Unit→EquipmentModule→ControlModule

UDT:ProcessCell──────────────────────
extends:Equipment
{units:[Unit],coordination_control:ref}

UDT:Unit─────────────────────────────
extends:Equipment
{ems:[EquipmentModule],state:UnitState,mode:UnitMode,allocated_to:Batch|null}

UDT:EquipmentModule──────────────────
extends:Equipment
{cms:[ControlModule],type:Agitator|Heater|Pump|Valve|...}

UDT:ControlModule────────────────────
extends:Equipment
{io:[TAG],type:Analog|Discrete|Motor|Valve|PID}

UDT:S88_RecipeLevel──────────────────
GeneralRecipe→SiteRecipe→MasterRecipe→ControlRecipe

UDT:Recipe───────────────────────────
{id:UUID,name:str,version:str,level:RecipeLevel,product:str,procedure:Procedure,formula:Formula,equipment_req:[str]}

UDT:Procedure────────────────────────
{id:str,unit_procedures:[UnitProcedure],ordering:Sequential|Parallel|Mixed}

UDT:UnitProcedure────────────────────
{id:str,unit_class:str,operations:[Operation],ordering:Sequential|Parallel}

UDT:Operation────────────────────────
{id:str,phases:[Phase],ordering:Sequential|Parallel}

UDT:Phase────────────────────────────
{id:str,name:str,logic:ref,params:[{name,type,default,min,max,uom}],state:PhaseState}

UDT:Formula──────────────────────────
{inputs:[{material,qty,uom}],outputs:[{material,qty,uom}],params:[{name,value,uom}]}

UDT:Batch────────────────────────────
{id:UUID,recipe:ref,control_recipe:ref,state:BatchState,start:Timestamp,end:Timestamp|null,unit_allocs:[{unit,start,end}],params:{},events:[BatchEvent]}

STATE:PhaseState─────────────────────
IDLE→RUNNING→COMPLETE
      ↓HOLD
   HOLDING→HELD→RESTARTING
      ↓STOP
   STOPPING→STOPPED
      ↓ABORT
   ABORTING→ABORTED

STATE:BatchState─────────────────────
Created→Scheduled→Running→Complete
                     ↓
                  Held→Running
                     ↓
                  Aborted

STATE:UnitState(PackML)──────────────
STOPPED⟷IDLE⟷STARTING→EXECUTE→COMPLETING→COMPLETE→RESETTING→IDLE
            ↓         ↓
         ABORTING→ABORTED→CLEARING→STOPPED
            ↓
         HOLDING→HELD→UNHOLDING→EXECUTE
            ↓
         STOPPING→STOPPED
🖥️ LAYER 4: ISA-101 (HMI Design)
ID:ISA-101|SCOPE:human machine interface design

UDT:HMI_Principles───────────────────
SITUATIONAL_AWARENESS>aesthetics
CONSISTENCY>novelty
GRAY_BACKGROUND:reduce fatigue
COLOR=meaning:not decoration
LAYERS:progressive detail

UDT:HMI_Layer────────────────────────
L1:{name:"Overview",scope:"Plant/Site",info:"KPIs,Status,Alarms",nav:"→L2"}
L2:{name:"Area",scope:"Process Area",info:"Flows,States,Trends",nav:"→L1,→L3"}
L3:{name:"Unit",scope:"Equipment",info:"Faceplate,Control",nav:"→L2,→L4"}
L4:{name:"Detail",scope:"Diagnostic",info:"Config,Tuning",nav:"→L3,→L5"}
L5:{name:"Support",scope:"Maintenance",info:"Calibration,History",nav:"→L4"}

UDT:ColorMeaning─────────────────────
{state:color:hex:usage}
Normal:Gray:#808080:default,no action
Running:Green:#00AA00:active,operating
Stopped:DarkGray:#404040:inactive,standby
Warning:Yellow:#FFCC00:attention,non-critical
Alarm:Red:#CC0000:action required
Fault:Red:#CC0000:equipment fault
Maint:Blue:#0066CC:out of service
Disabled:Gray+X:#808080+strikethrough:not available
Manual:Orange:#FF6600:manual mode
Transition:Cyan:#00CCCC:state changing

UDT:GraphicElement───────────────────
{id:str,type:Tank|Valve|Pump|Motor|Conveyor|Pipe|Sensor|...,tags:{pv,sp,cmd,sts,mode},states:[],appearance:{shape,size,orientation}}

UDT:Faceplate────────────────────────
{equipment:ref,title:str,pv_display:[{tag,label,format,unit}],sp_input:[{tag,label,min,max,unit}],commands:[{cmd,label,confirm}],status:{state,mode,alarms},nav:[parent,children,trend]}

UDT:Trend────────────────────────────
{tags:[{path,color,scale,unit}],timespan:Duration,sample:Duration,scales:[{tag,min,max,auto}]}

RULES────────────────────────────────
R1:no hardcoded values in graphics
R2:bind to tag path,not direct address
R3:template→instance inheritance
R4:centralized style definitions
R5:alarm indication visible at all layers
R6:navigation consistent,predictable
R7:controls labeled,units shown
R8:confirmation for critical commands
🚨 LAYER 5: ISA-18.2 (Alarm Management)
ID:ISA-18.2|SCOPE:alarm management lifecycle

UDT:AlarmPriority────────────────────
P1:{name:"Emergency",response:"Immediate",time:"<1min",color:Red,sound:Continuous}
P2:{name:"High",response:"Prompt",time:"<10min",color:Orange,sound:Fast}
P3:{name:"Medium",response:"Timely",time:"<1hr",color:Yellow,sound:Slow}
P4:{name:"Low",response:"Awareness",time:"Shift",color:Cyan,sound:None}

UDT:AlarmState───────────────────────
NORM:{active:F,acked:T,suppress:F}
UNACK:{active:T,acked:F,suppress:F}→needs attention
ACKED:{active:T,acked:T,suppress:F}→aware,still active
RTN_UNACK:{active:F,acked:F,suppress:F}→cleared unacked
SHELVED:{active:any,acked:any,suppress:T}→temporarily suppressed
OUT_OF_SERVICE:{active:any,acked:any,suppress:T,oos:T}→disabled

STATE:AlarmLifecycle─────────────────
NORMAL→[condition]→UNACK_ALARM→[ack]→ACKED_ALARM→[clear]→NORMAL
                        ↓                  ↓
                    [clear]            [ack timeout]
                        ↓                  ↓
                   RTN_UNACK──────────[ack]→NORMAL

UDT:Alarm────────────────────────────
{
  id:UUID,
  tag:PATH,
  type:HI|HIHI|LO|LOLO|DEV|ROG|DISC|,
  priority:1-4,
  state:AlarmState,
  setpoint:num,
  deadband:num,
  delay:Duration,
  message:str,
  consequence:str,
  response:str,
  timestamp_in:Timestamp,
  timestamp_ack:Timestamp|null,
  timestamp_out:Timestamp|null,
  ack_user:str|null,
  shelve_until:Timestamp|null,
  shelve_reason:str|null
}

UDT:AlarmClass───────────────────────
{id:str,name:str,priority_default:1-4,sound:ref,color:ref,auto_ack:bool,log:bool}

RULES:Rationalization────────────────
R1:every alarm must be documented
R2:every alarm must have unique response
R3:every alarm must be actionable
R4:priority based on consequence+response_time
R5:no duplicate alarms for same condition
R6:review frequency:annual minimum
R7:metrics:alarms/hr<6 avg,<12 peak,no floods>10/10min

METRICS──────────────────────────────
AlarmRate:alarms/operator/hour
FloodRate:>10 alarms in 10 min
StaleAlarms:active>24hr
ChatteringAlarms:>3 transitions/min
BadActors:top 10 most frequent
PercentByPriority:P1<5%,P2<15%,P3<25%,P4<55%
📡 LAYER 6: OPC-UA (Communication)
ID:OPC-UA|SCOPE:industrial interoperability

UDT:OPC_NodeClass────────────────────
Object|ObjectType|Variable|VariableType|Method|View|DataType|ReferenceType

UDT:OPC_Node─────────────────────────
{node_id:str,browse_name:str,display_name:str,node_class:NodeClass,type_def:ref|null,parent:ref|null}

UDT:OPC_Variable─────────────────────
extends:OPC_Node
{data_type:str,value:any,source_timestamp:Timestamp,server_timestamp:Timestamp,status:uint32,access:RO|RW|WO,historizing:bool}

UDT:OPC_Method───────────────────────
extends:OPC_Node
{input_args:[{name,type}],output_args:[{name,type}],executable:bool}

UDT:OPC_Subscription─────────────────
{id:uint32,publishing_interval:Duration,lifetime:Duration,max_keepalive:int,priority:uint8,enabled:bool,monitored_items:[MonitoredItem]}

UDT:OPC_MonitoredItem────────────────
{id:uint32,node:ref,sampling_interval:Duration,queue_size:uint32,discard_oldest:bool,filter:ref|null}

ADDRESS_SPACE────────────────────────
Root→Objects→[Server,DeviceSet,Aliases]
Root→Types→[ObjectTypes,VariableTypes,DataTypes,ReferenceTypes]
Root→Views→[Engineering,Operations,Maintenance]

COMPANION_SPECS──────────────────────
ISA-95:ns=isa95;Equipment,Material,Personnel,Process
PackML:ns=packml;StateMachine,Admin,Status,Command
MDIS:ns=mdis;Subsea equipment
PLCopen:ns=plcopen;Motion control
📨 LAYER 7: MQTT/Sparkplug (Messaging)
ID:MQTT+Sparkplug|SCOPE:lightweight pub/sub

UDT:MQTT_QoS─────────────────────────
QoS0:{name:"AtMostOnce",delivery:"Fire-forget",ack:none}
QoS1:{name:"AtLeastOnce",delivery:"Guaranteed",ack:PUBACK}
QoS2:{name:"ExactlyOnce",delivery:"Exactly once",ack:PUBREC-PUBREL-PUBCOMP}

UDT:MQTT_Topic───────────────────────
format:"{namespace}/{group}/{edge}/{device}/{point}"
example:"spBv1.0/Plant1/DCMD/PLC01/Output1"

UDT:Sparkplug_Topic──────────────────
NBIRTH:spBv1.0/{group}/NBIRTH/{edge_node}→node online,metric list
NDEATH:spBv1.0/{group}/NDEATH/{edge_node}→node offline
DBIRTH:spBv1.0/{group}/DBIRTH/{edge_node}/{device}→device online
DDEATH:spBv1.0/{group}/DDEATH/{edge_node}/{device}→device offline
NDATA:spBv1.0/{group}/NDATA/{edge_node}→node data
DDATA:spBv1.0/{group}/DDATA/{edge_node}/{device}→device data
NCMD:spBv1.0/{group}/NCMD/{edge_node}→command to node
DCMD:spBv1.0/{group}/DCMD/{edge_node}/{device}→command to device

UDT:Sparkplug_Payload────────────────
{timestamp:uint64,metrics:[{name,alias,timestamp,datatype,value,properties}],seq:uint64}

UDT:Sparkplug_DataType───────────────
Int8|Int16|Int32|Int64|UInt8|UInt16|UInt32|UInt64|Float|Double|Boolean|String|DateTime|Text|UUID|DataSet|Bytes|File|Template

RULES────────────────────────────────
R1:NBIRTH before any NDATA
R2:seq increments 0-255 wrap
R3:LWT configured for NDEATH
R4:alias for bandwidth optimization
R5:store-forward on disconnect
🔧 LAYER 8: Modbus (Field Protocol)
ID:Modbus|SCOPE:simple field device communication

UDT:Modbus_Register──────────────────
Coil:{addr:0-65535,access:RW,type:bit,fc_read:1,fc_write:5,fc_multi:15}
DiscreteInput:{addr:0-65535,access:RO,type:bit,fc_read:2}
HoldingReg:{addr:0-65535,access:RW,type:uint16,fc_read:3,fc_write:6,fc_multi:16}
InputReg:{addr:0-65535,access:RO,type:uint16,fc_read:4}

UDT:Modbus_DataType──────────────────
BOOL:1 coil|1 bit
INT16:1 reg|signed
UINT16:1 reg|unsigned
INT32:2 reg|signed|byte_order:ABCD|CDAB|BADC|DCBA
UINT32:2 reg|unsigned
FLOAT32:2 reg|IEEE754
INT64:4 reg|signed
FLOAT64:4 reg|IEEE754
STRING:N reg|2 chars per reg

UDT:Modbus_Map───────────────────────
{tag:PATH,unit_id:int,register_type:Coil|DI|HR|IR,addr:int,data_type:str,scale:num,offset:num,byte_order:str}

FUNCTION_CODES───────────────────────
FC01:Read Coils|FC02:Read DI|FC03:Read HR|FC04:Read IR
FC05:Write Coil|FC06:Write HR|FC15:Write Multi Coil|FC16:Write Multi HR
FC23:Read/Write HR

EXCEPTION_CODES──────────────────────
01:Illegal Function|02:Illegal Address|03:Illegal Value|04:Device Fail|05:Ack|06:Busy|08:Parity|0A:Gateway Path|0B:Gateway Target
📊 LAYER 9: KPIs (Performance Metrics)
ID:KPI|SCOPE:operational performance metrics

UDT:OEE──────────────────────────────
{
  availability:pct=run_time/(run_time+downtime),
  performance:pct=actual_rate/ideal_rate,
  quality:pct=good_units/total_units,
  oee:pct=availability*performance*quality
}
TARGET:availability>90%,performance>95%,quality>99%,oee>85%

UDT:MTBF─────────────────────────────
{mean_time_between_failures:Duration=total_uptime/failure_count}

UDT:MTTR─────────────────────────────
{mean_time_to_repair:Duration=total_downtime/failure_count}

UDT:Downtime─────────────────────────
{
  categories:[Planned,Unplanned,Changeover,Setup,Breakdown,Idle],
  events:[{start,end,category,reason,equipment}],
  totals:{category:Duration}
}

UDT:FirstPassYield───────────────────
{fpy:pct=good_first_time/total_attempted}

UDT:CycleTime────────────────────────
{ideal:Duration,actual:Duration,efficiency:pct=ideal/actual}

UDT:Throughput───────────────────────
{value:num,unit:units/hour,period:Duration}

UDT:EnergyKPI────────────────────────
{kwh_per_unit:num,kwh_per_batch:num,peak_demand:num,power_factor:pct}

TREE─────────────────────────────────
OEE
├─Availability
│ ├─MTBF
│ ├─MTTR
│ └─Downtime
├─Performance
│ ├─CycleTime
│ └─Throughput
└─Quality
  ├─FirstPassYield
  └─DefectRate
🔀 CROSSWALKS (δ maps)
ISA-95↔ISA-88───────────────────────
ISA95.WorkCenter=ISA88.ProcessCell
ISA95.WorkUnit=ISA88.Unit
ISA95.ProcessSegment=ISA88.Operation
ISA95.ProductionSchedule→ISA88.Batch(instantiate)

ISA-95↔OPC-UA───────────────────────
ISA95.Equipment→OPCUA.Object(ns=isa95)
ISA95.Property→OPCUA.Variable
ISA95.Capability→OPCUA.Method

ISA-88↔PackML──────────────────────
ISA88.UnitState≈PackML.StateMachine(subset)
ISA88.Phase.RUNNING=PackML.EXECUTE
ISA88.Phase.HELD=PackML.HELD
ISA88.Phase.ABORTED=PackML.ABORTED

ISA-101↔ISA-18.2────────────────────
ISA101.AlarmIndicator→ISA18.AlarmState(visual)
ISA101.ColorMeaning.Alarm=ISA18.Priority(color code)
ISA101.L1-L5.AlarmSummary→ISA18.AlarmList(filter by area)

OPC-UA↔Sparkplug────────────────────
OPCUA.Variable→Sparkplug.Metric
OPCUA.Subscription→Sparkplug.NDATA/DDATA(publish)
OPCUA.Method→Sparkplug.NCMD/DCMD
OPCUA.AddressSpace↔Sparkplug.NBIRTH(metric list)
🚀 USAGE
from konomi_standard import KS

#PARSE:human std→compressed
compressed=KS.parse("ISA-95",source_doc)

#EXPAND:compressed→implementation
impl=KS.expand("ISA-95",target="python")

#VALIDATE:impl→compliant?
report=KS.validate(impl,"ISA-95")

#CROSSWALK:map between standards
mapped=KS.crosswalk(entity,"ISA-95","ISA-88")

#GENERATE:template→code
code=KS.generate("ISA-88.Batch",lang="python")
🎯 GOAL
LAYER0:defines how all layers structured(self-describing)
LAYER1:base UDTs all standards share
LAYER2+:each standard compressed,UDT-first
CROSSWALKS:map between standards
AGENTS:parse,expand,validate,crosswalk,generate
COMPRESSION:max info,min tokens
📐
