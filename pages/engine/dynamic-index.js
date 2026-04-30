// dynamic-index.js — builds index from _index + _pages + _live tags
function applyIndexTag(){
  var idx=getPLCTag('_index');if(!idx)return;
  // Header
  var logo=document.querySelector('.logo');if(logo&&idx.header?.logo)logo.textContent=idx.header.logo;
  var state=document.getElementById('plc-state');if(state&&idx.header?.state)state.textContent=idx.header.state;
  // Tabs
  if(idx.tabs){
    var icons={overview:'🏠',explorer:'📂',programs:'⚙',alarms:'🚨',kpi:'📊',tags:'🏷',stats:'📡'};
    var tabEl=document.querySelectorAll('.tab[data-tab]');
    // Rebuild tabs from tag
    var hdr=tabEl[0]?.parentNode;if(!hdr)return;
    tabEl.forEach(function(t){t.remove()});
    var sep=hdr.querySelector('[style*="flex:1"]');
    idx.tabs.forEach(function(t){
      var span=document.createElement('span');span.className='tab'+(t===idx.default?' active':'');
      span.dataset.tab=t;span.textContent=icons[t]||t;
      span.onclick=function(){switchView(t)};
      hdr.insertBefore(span,sep);
    });
  }
  // Theme
  if(idx.theme){var r=document.documentElement.style;
    if(idx.theme.bg)r.setProperty('--bg',idx.theme.bg);
    if(idx.theme.accent)r.setProperty('--ig',idx.theme.accent);
    if(idx.theme.ok)r.setProperty('--ok',idx.theme.ok);
    if(idx.theme.er)r.setProperty('--er',idx.theme.er);
    if(idx.theme.gd)r.setProperty('--gd',idx.theme.gd)}
  // Footer
  var ftr=document.querySelector('.ftr span');if(ftr&&idx.footer)ftr.textContent=idx.footer;
}
