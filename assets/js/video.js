/* ══════════════════════════════════════
   VIDEO GALLERY + PLAYER — video.js
══════════════════════════════════════ */

(function () {

  /* ── state ── */
  var vgoFilter = 'all';
  var vpmCurVid = null;
  var vpmVid = null;   // the <video> element
  var vpmScrub = false;
  var vpmVolDrag = false;

  /* ── wheel carousel state ── */
  var wheelProg = 0;
  var wheelCurr = 0;
  var wheelDrag = false;
  var wheelLastX = 0;
  var wheelGen = 0; /* generation counter — incremented to kill stale loops */

  var CAT_COLOR = {
    brand: '#C8A96E',
    social: '#6CA8D8',
    event: '#D87070',
    campaign: '#70C892'
  };
  var CAT_LABEL = {
    brand: 'Brand',
    social: 'Social',
    event: 'Event',
    campaign: 'Campaign'
  };

  /* ── helpers ── */
  function fmtTime(s) {
    if (!s || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function el(id) { return document.getElementById(id); }

  /* ──────────────────────────────────
     GALLERY
  ────────────────────────────────── */

  window.openVGO = function () {
    var wrap = el('vgo');
    if (!wrap) return;
    vgoFilter = 'all';
    wrap.querySelectorAll('.vgf').forEach(function (b) { b.classList.remove('on'); });
    var allBtn = wrap.querySelector('.vgf[data-f="all"]');
    if (allBtn) allBtn.classList.add('on');
    wheelProg = 0;
    wheelCurr = 0;
    renderGrid('all');
    wrap.classList.add('on');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add('vis'); });
    });
  };

  function closeVGO() {
    var wrap = el('vgo');
    if (!wrap) return;
    wheelGen++; /* kill running animation loop */
    wrap.classList.remove('vis');
    setTimeout(function () { wrap.classList.remove('on'); }, 360);
  }

  function renderGrid(filter) {
    var grid = el('vgo-grid');
    if (!grid || typeof VIDEOS === 'undefined') return;

    grid.classList.add('arch-mode');

    /* kill any previous animation loop by advancing the generation */
    wheelGen++;
    var myGen = wheelGen;

    /* reset scroll position so every filter starts at card 0 */
    wheelProg = 0;
    wheelCurr = 0;

    var list = filter === 'all'
      ? VIDEOS
      : VIDEOS.filter(function (v) { return v.cat === filter; });

    var countEl = el('vgo-count');
    if (countEl) countEl.textContent = list.length + ' film' + (list.length !== 1 ? 's' : '');

    grid.innerHTML = list.map(function (v, i) {
      var col = CAT_COLOR[v.cat] || '#C8A96E';
      var lbl = CAT_LABEL[v.cat] || v.cat;
      var url = (typeof VIDEO_BASE !== 'undefined' ? VIDEO_BASE : '') + v.file;

      return '<div class="vgo-card arch-item" data-vid="' + v.id + '" data-url="' + url + '" style="opacity:0">'
        + '<div class="vgo-card-thumb">'
        + '<video class="vgo-card-vid" muted loop playsinline preload="none"></video>'
        + '<div class="vgo-card-overlay">'
        + '<span class="vgo-card-cat" style="color:' + col + ';border-color:' + col + '44">' + lbl + '</span>'
        + '<div class="vgo-card-play-btn">'
        + '<svg viewBox="0 0 20 20" fill="currentColor"><polygon points="5,3 17,10 5,17"/></svg>'
        + '</div>'
        + '</div>'
        + '<div class="vgo-card-num">' + String(i + 1).padStart(2, '0') + '</div>'
        + '</div>'
        + '<div class="vgo-card-info">'
        + '<div class="vgo-card-title">' + v.title + '</div>'
        + '<div class="vgo-card-meta">' + v.year + ' \u2014 ' + lbl + '</div>'
        + '</div>'
        + '</div>';
    }).join('');

    var cards = grid.querySelectorAll('.vgo-card');
    var total = cards.length;
    var spacing = 240;
    var contentWidth = total * spacing;

    function mapRange(val, inMin, inMax, outMin, outMax) {
      if (val <= inMin) return outMin;
      if (val >= inMax) return outMax;
      return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    function update() {
      /* bail if a newer renderGrid() call has taken over */
      if (wheelGen !== myGen) return;

      /* smoother lerp: 0.09 gives fluid deceleration */
      wheelCurr += (wheelProg - wheelCurr) * 0.09;

      cards.forEach(function (card, i) {
        var rawX = wheelCurr + (i * spacing);
        var x = ((rawX + contentWidth / 2) % contentWidth + contentWidth) % contentWidth - contentWidth / 2;

        var y = Math.pow(x, 2) * 0.0012;
        var rotate = x * 0.08;

        var scale = 0.8;
        if (x < 0) scale = mapRange(x, -500, 0, 0.8, 1.15);
        else       scale = mapRange(x, 0, 500, 1.15, 0.8);

        var opacity = 0;
        var absX = Math.abs(x);
        if (absX < 600)       opacity = 1;
        else if (absX < 1000) opacity = mapRange(absX, 600, 1000, 1, 0);

        card.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + rotate + 'deg) scale(' + scale + ')';
        card.style.opacity   = opacity;
        card.style.zIndex    = Math.round((1 - absX / 2000) * 100);
        card.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';

        /* center-card glow class */
        if (absX < 80) card.classList.add('arch-center');
        else           card.classList.remove('arch-center');

        var vid = card.querySelector('video');
        if (vid) {
          /* preload metadata for cards within ±2 positions so they start faster */
          if (absX < 520 && !vid.src) {
            vid.src = card.getAttribute('data-url');
            vid.preload = 'metadata';
            vid.load();
          }
          /* play only the center card */
          if (absX < 150 && opacity > 0.9) {
            if (!vid.src) {
              vid.src = card.getAttribute('data-url');
              vid.preload = 'auto';
              vid.load();
            }
            if (vid.paused) vid.play().catch(function () {});
            if (vid.currentTime > 5) vid.currentTime = 0;
          } else {
            if (!vid.paused) vid.pause();
          }
        }
      });

      requestAnimationFrame(update);
    }

    /* one-time interaction wiring per grid element */
    if (!grid._wheelWired) {
      grid.addEventListener('wheel', function (e) {
        e.preventDefault();
        wheelProg -= e.deltaY * 0.8;
      }, { passive: false });

      grid.addEventListener('mousedown', function (e) {
        wheelDrag = true;
        wheelLastX = e.clientX;
      });

      window.addEventListener('mousemove', function (e) {
        if (!wheelDrag) return;
        wheelProg += (e.clientX - wheelLastX) * 1.5;
        wheelLastX = e.clientX;
      });

      window.addEventListener('mouseup', function () { wheelDrag = false; });

      /* touch support */
      grid.addEventListener('touchstart', function (e) {
        wheelDrag  = true;
        wheelLastX = e.touches[0].clientX;
      }, { passive: true });

      grid.addEventListener('touchmove', function (e) {
        if (!wheelDrag) return;
        wheelProg += (e.touches[0].clientX - wheelLastX) * 1.5;
        wheelLastX = e.touches[0].clientX;
      }, { passive: true });

      grid.addEventListener('touchend', function () { wheelDrag = false; });

      grid._wheelWired = true;
    }

    /* per-card mouse-spotlight and click wiring */
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
      });

      card.addEventListener('click', function () {
        var vidId = card.getAttribute('data-vid');
        var v = (typeof VIDEOS !== 'undefined')
          ? VIDEOS.find(function (x) { return x.id === vidId; })
          : null;
        if (v) openVPM(v);
      });
    });

    /* start the new loop */
    requestAnimationFrame(update);
  }

  /* ──────────────────────────────────
     PLAYER
  ────────────────────────────────── */

  window.openVPM = function (v) {
    vpmCurVid = v;
    var wrap = el('vpm');
    if (!wrap) return;

    /* info */
    var col = CAT_COLOR[v.cat] || '#C8A96E';
    var lbl = CAT_LABEL[v.cat] || v.cat;

    var catBadge = el('vpm-cat-badge');
    if (catBadge) { catBadge.textContent = lbl; catBadge.style.color = col; catBadge.style.borderColor = col + '55'; }

    var hdTitle = el('vpm-hd-title');
    if (hdTitle) hdTitle.textContent = v.title;

    var hdYear = el('vpm-hd-year');
    if (hdYear) hdYear.textContent = v.year;

    /* accent on progress */
    var progFill = el('vpm-prog-fill');
    if (progFill) progFill.style.background = col;
    var progDot = el('vpm-prog-dot');
    if (progDot) progDot.style.background = col;

    /* film counter */
    var idx = (typeof VIDEOS !== 'undefined') ? VIDEOS.indexOf(v) : 0;
    var filmN = el('vpm-film-n');
    if (filmN) filmN.textContent = idx + 1;
    var filmT = el('vpm-film-total');
    if (filmT) filmT.textContent = (typeof VIDEOS !== 'undefined') ? VIDEOS.length : 24;

    /* load + play */
    vpmVid = el('vpm-vid');
    if (vpmVid) {
      vpmVid.src = (typeof VIDEO_BASE !== 'undefined' ? VIDEO_BASE : '') + v.file;
      vpmVid.load();
      vpmVid.play().catch(function () { });
    }

    /* reset progress */
    var progFillEl = el('vpm-prog-fill');
    var progDotEl = el('vpm-prog-dot');
    var progBufEl = el('vpm-prog-buf');
    if (progFillEl) progFillEl.style.width = '0';
    if (progDotEl) progDotEl.style.left = '0';
    if (progBufEl) progBufEl.style.width = '0';
    var timeDisp = el('vpm-time-disp');
    if (timeDisp) timeDisp.textContent = '0:00 / \u2014';

    /* show */
    wrap.classList.add('on');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add('vis'); });
    });
  };

  function closeVPM() {
    var wrap = el('vpm');
    if (!wrap) return;
    if (vpmVid) { vpmVid.pause(); vpmVid.src = ''; }
    wrap.classList.remove('vis');
    setTimeout(function () { wrap.classList.remove('on'); }, 360);
    vpmCurVid = null;
  }

  function navVPM(dir) {
    if (!vpmCurVid || typeof VIDEOS === 'undefined') return;
    var idx = VIDEOS.indexOf(vpmCurVid);
    var next = VIDEOS[(idx + dir + VIDEOS.length) % VIDEOS.length];
    openVPM(next);
  }

  function setPlayIcon(paused) {
    var ico = el('vpm-play-ico');
    if (!ico) return;
    ico.innerHTML = paused
      ? '<polygon points="5,3 17,10 5,17" fill="currentColor"/>'
      : '<rect x="4" y="3" width="4.5" height="14" fill="currentColor"/><rect x="11.5" y="3" width="4.5" height="14" fill="currentColor"/>';
    var bigPlay = el('vpm-big-play');
    if (bigPlay) {
      if (paused) bigPlay.classList.add('paused');
      else bigPlay.classList.remove('paused');
    }
  }

  /* scrub helper — call with clientX */
  function scrubToX(clientX) {
    var track = el('vpm-prog-bg');
    if (!track || !vpmVid || !vpmVid.duration) return;
    var r = track.getBoundingClientRect();
    var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    vpmVid.currentTime = pct * vpmVid.duration;
    var fill = el('vpm-prog-fill');
    var dot = el('vpm-prog-dot');
    if (fill) fill.style.width = (pct * 100) + '%';
    if (dot) dot.style.left = (pct * 100) + '%';
  }

  /* volume helper — call with clientX */
  function setVolX(clientX) {
    var track = el('vpm-vol-track');
    if (!track || !vpmVid) return;
    var r = track.getBoundingClientRect();
    var pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    vpmVid.volume = pct;
    vpmVid.muted = (pct === 0);
    var fill = el('vpm-vol-fill');
    var dot = el('vpm-vol-dot');
    if (fill) fill.style.width = (pct * 100) + '%';
    if (dot) dot.style.left = (pct * 100) + '%';
  }

  /* ──────────────────────────────────
     DOM SETUP
  ────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {

    /* gallery close */
    var vgoClose = el('vgo-close');
    if (vgoClose) vgoClose.addEventListener('click', closeVGO);

    /* filter pills */
    var filters = document.querySelectorAll('.vgf');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        vgoFilter = btn.getAttribute('data-f');
        renderGrid(vgoFilter);
      });
    });

    /* player close */
    var vpmClose = el('vpm-close');
    if (vpmClose) vpmClose.addEventListener('click', closeVPM);

    /* player video element events */
    var vid = el('vpm-vid');
    if (vid) {
      vpmVid = vid;

      vid.addEventListener('play', function () { setPlayIcon(false); });
      vid.addEventListener('pause', function () { setPlayIcon(true); });
      vid.addEventListener('ended', function () { setPlayIcon(true); });

      vid.addEventListener('timeupdate', function () {
        if (vpmScrub) return;
        var pct = vid.duration ? vid.currentTime / vid.duration : 0;
        var fill = el('vpm-prog-fill');
        var dot = el('vpm-prog-dot');
        if (fill) fill.style.width = (pct * 100) + '%';
        if (dot) dot.style.left = (pct * 100) + '%';
        var td = el('vpm-time-disp');
        if (td) td.textContent = fmtTime(vid.currentTime) + ' / ' + fmtTime(vid.duration);
      });

      vid.addEventListener('progress', function () {
        if (vid.buffered.length && vid.duration) {
          var buf = vid.buffered.end(vid.buffered.length - 1) / vid.duration;
          var bufEl = el('vpm-prog-buf');
          if (bufEl) bufEl.style.width = (buf * 100) + '%';
        }
      });

      vid.addEventListener('loadedmetadata', function () {
        var td = el('vpm-time-disp');
        if (td) td.textContent = '0:00 / ' + fmtTime(vid.duration);
      });
    }

    /* play/pause button */
    var playBtn = el('vpm-btn-play');
    if (playBtn) playBtn.addEventListener('click', function () {
      if (!vpmVid) return;
      vpmVid.paused ? vpmVid.play() : vpmVid.pause();
    });

    /* big center overlay click */
    var bigPlay = el('vpm-big-play');
    if (bigPlay) bigPlay.addEventListener('click', function () {
      if (!vpmVid) return;
      vpmVid.paused ? vpmVid.play() : vpmVid.pause();
    });

    /* prev / next buttons (player bar) */
    var btnPrev = el('vpm-btn-prev');
    var btnNext = el('vpm-btn-next');
    if (btnPrev) btnPrev.addEventListener('click', function () { navVPM(-1); });
    if (btnNext) btnNext.addEventListener('click', function () { navVPM(1); });

    /* filmstrip prev / next */
    var filmPrev = el('vpm-film-prev');
    var filmNext = el('vpm-film-next');
    if (filmPrev) filmPrev.addEventListener('click', function () { navVPM(-1); });
    if (filmNext) filmNext.addEventListener('click', function () { navVPM(1); });

    /* progress bar scrubbing */
    var progBg = el('vpm-prog-bg');
    if (progBg) {
      progBg.addEventListener('mousedown', function (e) {
        vpmScrub = true;
        scrubToX(e.clientX);
      });
    }
    document.addEventListener('mousemove', function (e) {
      if (vpmScrub) scrubToX(e.clientX);
      if (vpmVolDrag) setVolX(e.clientX);
    });
    document.addEventListener('mouseup', function () {
      vpmScrub = false;
      vpmVolDrag = false;
    });

    /* volume track drag */
    var volTrack = el('vpm-vol-track');
    if (volTrack) {
      volTrack.addEventListener('mousedown', function (e) {
        vpmVolDrag = true;
        setVolX(e.clientX);
      });
    }

    /* mute toggle */
    var muteBtn = el('vpm-btn-mute');
    if (muteBtn) muteBtn.addEventListener('click', function () {
      if (!vpmVid) return;
      vpmVid.muted = !vpmVid.muted;
      var pct = vpmVid.muted ? 0 : vpmVid.volume;
      var fill = el('vpm-vol-fill');
      var dot = el('vpm-vol-dot');
      if (fill) fill.style.width = (pct * 100) + '%';
      if (dot) dot.style.left = (pct * 100) + '%';
    });

    /* fullscreen */
    var fsBtn = el('vpm-btn-fs');
    if (fsBtn) fsBtn.addEventListener('click', function () {
      var stage = el('vpm-stage');
      if (!stage) return;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        var fn = stage.requestFullscreen
          || stage.webkitRequestFullscreen
          || stage.mozRequestFullScreen;
        if (fn) fn.call(stage);
      }
    });

    /* keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      var vpmEl = el('vpm');
      var vgoEl = el('vgo');

      /* gallery: Escape closes */
      if (e.key === 'Escape' && vgoEl && vgoEl.classList.contains('on') && !(vpmEl && vpmEl.classList.contains('on'))) {
        closeVGO();
        return;
      }

      /* player shortcuts */
      if (!vpmEl || !vpmEl.classList.contains('on')) return;
      if (e.key === 'Escape') { closeVPM(); return; }
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        if (vpmVid) { vpmVid.paused ? vpmVid.play() : vpmVid.pause(); }
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) { navVPM(1); }
        else if (vpmVid) { vpmVid.currentTime = Math.min(vpmVid.duration || 0, vpmVid.currentTime + 5); }
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) { navVPM(-1); }
        else if (vpmVid) { vpmVid.currentTime = Math.max(0, vpmVid.currentTime - 5); }
      }
      if (e.key === 'm') {
        if (vpmVid) vpmVid.muted = !vpmVid.muted;
      }
      if (e.key === 'f') {
        var stage = el('vpm-stage');
        if (!stage) return;
        if (document.fullscreenElement) { document.exitFullscreen(); }
        else { var fn = stage.requestFullscreen || stage.webkitRequestFullscreen; if (fn) fn.call(stage); }
      }
    });

  }); /* end DOMContentLoaded */

})();
