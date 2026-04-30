// branch-loader.js — parent/child branch auto-inheritance
var BRANCH_MANIFEST = null;
var CURRENT_PLC_BRANCH = 'main';
var LOADED_BRANCHES = [];

async function loadBranchManifest() {
  try {
    var r = await fetch('https://raw.githubusercontent.com/teslasolar/GITPLC/main/branch-manifest.json');
    BRANCH_MANIFEST = await r.json();
    return BRANCH_MANIFEST;
  } catch { return null; }
}

function getBranchChain(name) {
  if (!BRANCH_MANIFEST) return [name];
  var chain = [];
  var cur = name;
  while (cur) {
    chain.unshift(cur);
    var b = BRANCH_MANIFEST.branches[cur];
    cur = b ? b.parent : null;
  }
  return chain;
}

async function loadBranchUDTs(branchName) {
  var chain = getBranchChain(branchName);
  LOADED_BRANCHES = chain;
  var count = 0;
  for (var i = 0; i < chain.length; i++) {
    var br = chain[i];
    var dirs = ['core','control','equipment','alarms','vendor','programs'];
    for (var d = 0; d < dirs.length; d++) {
      try {
        var url = 'https://api.github.com/repos/teslasolar/GITPLC/contents/'+dirs[d]+'?ref='+br;
        var files = await (await fetch(url)).json();
        if (!Array.isArray(files)) continue;
        for (var f = 0; f < files.length; f++) {
          if (!files[f].name.endsWith('.json')) continue;
          var raw = await (await fetch(files[f].download_url)).json();
          PLC_UDTS[dirs[d]+'/'+files[f].name.replace('.json','')] = raw;
          raw._branch = br;
          count++;
        }
      } catch {}
    }
  }
  return count;
}

function listPLCBranches() {
  if (!BRANCH_MANIFEST) return ['main'];
  return Object.keys(BRANCH_MANIFEST.branches);
}
