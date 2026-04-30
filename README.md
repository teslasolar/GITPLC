# 🔧 GitPLC

**Universal PLC Namespace UDT Transfer Layer**

One Layer to Communicate them all and in the darkness Run > 85% OEE.

[![UDTs](https://img.shields.io/badge/dynamic/json?url=https://api.github.com/repos/teslasolar/GITPLC/git/trees/main?recursive=1&query=$.tree.length&label=files&color=38b5f9)](https://github.com/teslasolar/GITPLC)
[![Tags](https://img.shields.io/github/issues/teslasolar/GITPLC/gitplc-config?label=tags&color=d4a94a)](https://github.com/teslasolar/GITPLC/issues?q=label:gitplc-config)

## 📐 Structure

```
GITPLC/                          ← this repo IS the PLC instance
├── core/           Layer 0-1    meta-UDT + primitives + vendor map
├── equipment/      Layer 2-3    ISA-88 hierarchy (7 deep)
├── control/        Layer 3      motor,valve,VFD,PID,analog/discrete
├── alarms/         Layer 4      ISA-18.2 priorities,states,metrics
├── batch/          Layer 5      ISA-88 recipes,phases,procedures
├── io/             Layer 6      cards,points,address maps
├── comms/          Layer 6-8    OPC-UA,MQTT/Sparkplug,Modbus
├── kpi/            Layer 9      OEE,downtime,quality
├── crosswalks/                  ISA-95↔88↔PackML↔OPC-UA
├── converters/                  AB,Siemens,Codesys import/export
├── programs/                    loadable PLC templates (via tags)
├── tags/                        dynamic config → GitHub Issues
├── docs/prompt/                 build prompt (original spec)
└── pages/                       GitHub Pages SCADA explorer
    ├── templates/   7-deep      enterprise→site→area→cell→unit→EM→CM
    ├── views/                   explorer,programs,alarms,kpi,tags
    ├── loaders/                 template-loader,subdir-scanner
    ├── engine/                  tag-db,udt-loader,tree
    ├── assets/                  dynamic SVGs,badges,symbols
    └── ui/                      SCADA dark theme
```

## 🎯 How It Works

**This repo is a running GitPLC instance.** The `pages/` app reads UDTs from the repo's own directories + dynamic values from GitHub Issues tagged `gitplc-config`.

1. **UDT files** define structure (static, version-controlled)
2. **GitHub Issues** provide dynamic values (runtime, editable)
3. **Programs** load via tags — edit an issue to deploy PLC logic
4. **Pages app** visualizes everything as a SCADA explorer

## 🏷 Tag Database

Create issues with label `gitplc-config` + a JSON code block:

```json
{"tag_id":"_my_tag","field":"value"}
```

## 🔧 Agents

`α` Parse · `β` Gen · `γ` Diff · `δ` Merge · `ε` Validate · `ζ` Map · `η` Sim · `θ` Sync · `ι` Convert · `κ` Doc

## 📐 Standards

ISA-88 · ISA-95 · ISA-101 · ISA-18.2 · OPC-UA · MQTT/Sparkplug · Modbus · PackML
