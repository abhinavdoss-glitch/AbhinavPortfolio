/* =============================================
   ADK.OS — Video Tracker — tracker.js
   Tracks video plays + estimates Supabase egress
   Dashboard: press T T T anywhere on the site
============================================= */

(function () {

   var STORAGE_KEY = 'adk_tracker';
    var SIZE_MAP = {
          'v01': 23.07, 'v02': 37.19, 'v03': 8.28,  'v04': 25.44,
          'v05': 13.40, 'v06': 4.05,  'v07': 13.17, 'v08': 12.08,
          'v09': 0.67,  'v10': 0.52,  'v11': 32.49, 'v12': 15.06,
          'v13': 16.82, 'v14': 0.27,  'v15': 37.45, 'v16': 13.85,
          'v17': 10.11, 'v18': 12.86, 'v19': 17.93, 'v20': 14.61,
          'v21': 4.96,  'v22': 28.06, 'v23': 16.01, 'v24': 11.36
    };

   /* --- Data helpers --- */
   function getData() {
         try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
         catch(e) { return {}; }
   }
    function saveData(d) {
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
          catch(e) {}
    }
    function recordPlay(videoId, title) {
          var d = getData();
          if (!d.plays) d.plays = {};
          if (!d.plays[videoId]) d.plays[videoId] = { title: title, count: 0, firstSeen: Date.now() };
          d.plays[videoId].count++;
          d.plays[videoId].lastSeen = Date.now();
          if (!d.totalPlays) d.totalPlays = 0;
          d.totalPlays++;
          saveData(d);
    }
    function clearData() {
          localStorage.removeItem(STORAGE_KEY);
    }

   /* --- Hook into video play events --- */
   function hookVideos() {
         document.addEventListener('play', function(e) {
                 var el = e.target;
                 if (el.tagName !== 'VIDEO') return;
                 var card = el.closest('[data-vid]');
                 if (!card) return;
                 var vid = card.getAttribute('data-vid');
                 // Find title from VIDEOS array if available
                                         var title = vid;
                 if (typeof VIDEOS !== 'undefined') {
                           var found = VIDEOS.find(function(v) { return v.id === vid; });
                           if (found) title = found.title;
                 }
                 recordPlay(vid, title);
         }, true);
   }

   /* --- Egress estimate --- */
   function calcEgress(plays) {
         var total = 0;
         Object.keys(plays).forEach(function(id) {
                 var sizeMB = SIZE_MAP[id] || 15;
                 // Each play streams roughly the full file (conservative estimate)
                                          total += sizeMB * plays[id].count;
         });
         return total;
   }

   /* --- Build tracker UI --- */
   function buildUI() {
         var existing = document.getElementById('adk-tracker-panel');
         if (existing) { existing.remove(); return; }

      var d = getData();
         var plays = d.plays || {};
         var totalPlays = d.totalPlays || 0;
         var egressMB = calcEgress(plays);
         var egressGB = (egressMB / 1024).toFixed(3);
         var egressPct = Math.min(100, ((egressMB / 1024) / 5 * 100)).toFixed(1);
         var limitGB = 5;
         var remainGB = Math.max(0, limitGB - egressMB / 1024).toFixed(2);

      var rows = Object.keys(plays).map(function(id) {
              var p = plays[id];
              var sz = SIZE_MAP[id] || 15;
              var eg = (sz * p.count / 1024).toFixed(3);
              var last = p.lastSeen ? new Date(p.lastSeen).toLocaleDateString() : '-';
              return '<tr>' +
                        '<td>' + p.title + '</td>' +
                        '<td style="text-align:center">' + p.count + '</td>' +
                        '<td style="text-align:center">' + sz + ' MB</td>' +
                        '<td style="text-align:center">' + eg + ' GB</td>' +
                        '<td style="text-align:center">' + last + '</td>' +
                        '</tr>';
      }).join('');

      if (!rows) rows = '<tr><td colspan="5" style="text-align:center;opacity:.5">No plays recorded yet.<br>Play a video to start tracking.</td></tr>';

      var barColor = egressPct > 80 ? '#ff4444' : egressPct > 50 ? '#ffaa00' : '#44cc88';

      var panel = document.createElement('div');
         panel.id = 'adk-tracker-panel';
         panel.innerHTML =
                 '<div id="adk-tr-overlay"></div>' +
                 '<div id="adk-tr-box">' +
                   '<div id="adk-tr-head">' +
                     '<span>ADK.OS / Egress Tracker</span>' +
                     '<div id="adk-tr-actions">' +
                       '<button id="adk-tr-clear">Clear Data</button>' +
                       '<button id="adk-tr-close">✕</button>' +
                     '</div>' +
                   '</div>' +
                   '<div id="adk-tr-stats">' +
                     '<div class="adk-stat">' +
                       '<div class="adk-stat-val">' + totalPlays + '</div>' +
                       '<div class="adk-stat-lbl">Total Plays</div>' +
                     '</div>' +
                     '<div class="adk-stat">' +
                       '<div class="adk-stat-val">' + egressGB + ' GB</div>' +
                       '<div class="adk-stat-lbl">Est. Egress Used</div>' +
                     '</div>' +
                     '<div class="adk-stat">' +
                       '<div class="adk-stat-val">' + remainGB + ' GB</div>' +
                       '<div class="adk-stat-lbl">Remaining (Free Tier)</div>' +
                     '</div>' +
                     '<div class="adk-stat">' +
                       '<div class="adk-stat-val">' + egressPct + '%</div>' +
                       '<div class="adk-stat-lbl">of 5 GB Limit</div>' +
                     '</div>' +
                   '</div>' +
                   '<div id="adk-tr-bar-wrap">' +
                     '<div id="adk-tr-bar-label">Supabase Free Tier Usage</div>' +
                     '<div id="adk-tr-bar-track">' +
                       '<div id="adk-tr-bar-fill" style="width:' + egressPct + '%;background:' + barColor + '"></div>' +
                     '</div>' +
                     '<div id="adk-tr-bar-legend"><span>0 GB</span><span>2.5 GB</span><span>5 GB</span></div>' +
                   '</div>' +
                   '<div id="adk-tr-note">⚡ Estimates based on average file size per play. Actual Supabase egress may vary.</div>' +
                   '<table id="adk-tr-table">' +
                     '<thead><tr>' +
                       '<th>Video</th><th>Plays</th><th>File Size</th><th>Est. Egress</th><th>Last Played</th>' +
                     '</tr></thead>' +
                     '<tbody>' + rows + '</tbody>' +
                   '</table>' +
                 '</div>';

      document.body.appendChild(panel);

      document.getElementById('adk-tr-close').onclick = function() { panel.remove(); };
         document.getElementById('adk-tr-overlay').onclick = function() { panel.remove(); };
         document.getElementById('adk-tr-clear').onclick = function() {
                 if (confirm('Clear all tracking data?')) { clearData(); panel.remove(); }
         };
   }

   /* --- Inject styles --- */
   function injectStyles() {
         var s = document.createElement('style');
         s.textContent = [
                 '#adk-tracker-panel { position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center; }',
                 '#adk-tr-overlay { position:absolute; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(4px); }',
                 '#adk-tr-box { position:relative; background:#0f0f0f; border:1px solid #2a2a2a; border-radius:12px; width:min(860px,95vw); max-height:85vh; overflow-y:auto; padding:0; font-family:monospace; color:#e0e0e0; }',
                 '#adk-tr-head { display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid #1e1e1e; font-size:13px; font-weight:bold; letter-spacing:.08em; color:#888; text-transform:uppercase; }',
                 '#adk-tr-actions { display:flex; gap:8px; }',
                 '#adk-tr-actions button { background:transparent; border:1px solid #333; color:#888; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-family:monospace; }',
                 '#adk-tr-actions button:hover { border-color:#666; color:#ccc; }',
                 '#adk-tr-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#1a1a1a; border-bottom:1px solid #1e1e1e; }',
                 '.adk-stat { padding:20px 24px; background:#0f0f0f; }',
                 '.adk-stat-val { font-size:22px; font-weight:bold; color:#fff; margin-bottom:4px; }',
                 '.adk-stat-lbl { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:.06em; }',
                 '#adk-tr-bar-wrap { padding:20px 24px; border-bottom:1px solid #1a1a1a; }',
                 '#adk-tr-bar-label { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; }',
                 '#adk-tr-bar-track { height:8px; background:#1e1e1e; border-radius:4px; overflow:hidden; margin-bottom:6px; }',
                 '#adk-tr-bar-fill { height:100%; border-radius:4px; transition:width .4s; }',
                 '#adk-tr-bar-legend { display:flex; justify-content:space-between; font-size:10px; color:#444; }',
                 '#adk-tr-note { padding:10px 24px; font-size:11px; color:#444; border-bottom:1px solid #1a1a1a; }',
                 '#adk-tr-table { width:100%; border-collapse:collapse; font-size:12px; }',
                 '#adk-tr-table th { padding:10px 16px; text-align:left; color:#444; font-size:10px; text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid #1a1a1a; }',
                 '#adk-tr-table td { padding:11px 16px; border-bottom:1px solid #141414; color:#bbb; }',
                 '#adk-tr-table tr:last-child td { border-bottom:none; }',
                 '#adk-tr-table tr:hover td { background:#141414; }'
               ].join('');
         document.head.appendChild(s);
   }

   /* --- Secret key combo: press T three times --- */
   var tCount = 0;
    var tTimer = null;
    document.addEventListener('keydown', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          if (e.key === 't' || e.key === 'T') {
                  tCount++;
                  clearTimeout(tTimer);
                  tTimer = setTimeout(function() { tCount = 0; }, 800);
                  if (tCount >= 3) {
                            tCount = 0;
                            buildUI();
                  }
          }
    });

   /* --- Init --- */
   injectStyles();
    hookVideos();

   /* Expose globally so video.js can call window.ADK_TRACK.record() if needed */
   window.ADK_TRACK = { record: recordPlay, open: buildUI };

})();
