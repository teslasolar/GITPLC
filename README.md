# GITPLC · plc-state branch

Isolated audit log for the live PLC layer. **No shared history with main.**

## Layout

\\\
equipment/         YAML defs (source of truth, hand-edited or webhook-hydrated)
  <machine_id>.yaml
machines/          Current state snapshot per machine (one file = one machine)
  <machine_id>.json    { type_id, state, prev_state, fold, updated_at }
history/           Append-only transition log, sharded by machine
  <machine_id>.ndjson  { ts, from, to, trigger, operator, cause_fold }
alarms/            Open alarm pointers (closed alarms live in issue history only)
  <alarm_id>.json      { machine_id, tag, pv, sp, priority, raised_at, issue }
\\\

## Conventions

- One commit = one state transition. Subject: \<machine_id>: <FROM> -> <TO> [trigger]\
- Alarm raise/ack/clear also create commits AND mirror to GitHub Issues with the \plc-alarm\ label.
- Branch is **orphan** \u2014 \git log plc-state ^main\ shows the full PLC timeline with no docs/code noise.

## Bridge

Written by \konomi/kernel/engine/state/gitplc.py\ (ASS-OS) on every \StateDB.transition()\.
Reads back via the GH webhook \u2192 hydrates equipment/ into TagDB at boot.
