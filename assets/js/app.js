/* APP LOGIC */
    /* ══ UTILS ══ */
    function fixSrc(src) {
      if (!src) return '';
      if (src.startsWith('data:')) return src;
      // Handle potential double encoding or existing encoding
      try {
        const decoded = decodeURI(src);
        return encodeURI(decoded).replace(/#/g, '%23').replace(/\?/g, '%3F');
      } catch (e) {
        return encodeURI(src).replace(/#/g, '%23').replace(/\?/g, '%3F');
      }
    }

    // Sanitize all image/video paths in memory ONCE
    function sanitizeAssetPaths() {
      if (typeof PROJECT_IMGS === 'undefined') return;
      const SANITIZED = {};
      Object.keys(PROJECT_IMGS).forEach(pid => {
        SANITIZED[pid] = {};
        Object.keys(PROJECT_IMGS[pid]).forEach(key => {
          const val = PROJECT_IMGS[pid][key];
          if (val && typeof val === 'string') {
            SANITIZED[pid][key] = fixSrc(val);
          } else {
            SANITIZED[pid][key] = val;
          }
        });
      });
      window.PROJECT_IMGS = SANITIZED;
      console.log("Assets sanitized globally.");
    }
    document.addEventListener('DOMContentLoaded', sanitizeAssetPaths);

    /* ══════════════════════════════════════
       DATA
    ══════════════════════════════════════ */

    /* ══ PARTICLES ══ */
    (function () {
      const c = document.getElementById('ptcl'), x = c.getContext('2d');
      let W, H, pts = [], mx = -999, my = -999;
      function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight }
      function P() { this.x = Math.random() * W; this.y = Math.random() * H; this.vx = (Math.random() - .5) * .15; this.vy = (Math.random() - .5) * .15; this.r = Math.random() * .9 + .2 }
      P.prototype.u = function () { const dx = mx - this.x, dy = my - this.y, d = Math.hypot(dx, dy); if (d < 80 && d > 0) { const f = (80 - d) / 80 * .35; this.vx -= dx / d * f; this.vy -= dy / d * f } this.vx *= .97; this.vy *= .97; this.x += this.vx; this.y += this.vy; if (this.x < 0) this.x = W; if (this.x > W) this.x = 0; if (this.y < 0) this.y = H; if (this.y > H) this.y = 0 };
      P.prototype.d = function () { x.beginPath(); x.arc(this.x, this.y, this.r, 0, Math.PI * 2); x.fillStyle = 'rgba(26,25,22,.08)'; x.fill() };
      function init() { pts = []; for (let i = 0; i < 65; i++)pts.push(new P()) }
      function loop() { x.clearRect(0, 0, W, H); for (let i = 0; i < pts.length; i++) { pts[i].u(); pts[i].d(); for (let j = i + 1; j < pts.length; j++) { const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y); if (d < 80) { x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y); x.strokeStyle = `rgba(26,25,22,${(1 - d / 80) * .05})`; x.lineWidth = .25; x.stroke() } } } requestAnimationFrame(loop) }
      resize(); init(); loop();
      window.addEventListener('resize', resize);
      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY }, { passive: true });
    })();

    /* ══ CURSOR ══ */
    const cdot = document.getElementById('cdot'), cring = document.getElementById('cring');
    let rx = 0, ry = 0, cx2 = 0, cy2 = 0, cOn = false;
    document.addEventListener('mousemove', e => {
      cx2 = e.clientX; cy2 = e.clientY;
      if (!cOn) { cOn = true; cdot.style.display = 'block'; cring.style.display = 'block'; document.body.style.cursor = 'none' }
      cdot.style.left = cx2 + 'px'; cdot.style.top = cy2 + 'px';
    }, { passive: true });
    (function ar() { rx += (cx2 - rx) * .20; ry += (cy2 - ry) * .20; cring.style.left = rx + 'px'; cring.style.top = ry + 'px'; requestAnimationFrame(ar) })();
    function setH(v) { if (v) { cdot.style.width = '20px'; cdot.style.height = '20px'; cring.style.width = '64px'; cring.style.height = '64px'; cring.style.borderColor = 'var(--accent)' } else { cdot.style.width = '12px'; cdot.style.height = '12px'; cring.style.width = '44px'; cring.style.height = '44px'; cring.style.borderColor = 'rgba(200,169,110,.55)' } }
    function hov(el) { el.addEventListener('mouseenter', () => setH(true)); el.addEventListener('mouseleave', () => setH(false)) }
    function hovAll(sel) { document.querySelectorAll(sel).forEach(hov) }

    /* ══ CLOCK ══ */
    function tick() { const n = new Date(), h = String(n.getHours()).padStart(2, '0'), m = String(n.getMinutes()).padStart(2, '0'), s = String(n.getSeconds()).padStart(2, '0'); document.getElementById('tclock').textContent = `${h}:${m}:${s}` }
    tick(); setInterval(tick, 1000);

    /* ══ VIEW SYSTEM — BULLETPROOF ══ */
    let curV = 'home', worldReady = false;

    function showView(id) {
      try { closeWO() } catch (e) { }; try { closeLabo() } catch (e) { };
      // Deactivate all
      document.querySelectorAll('.view').forEach(v => { v.classList.remove('on') });
      document.querySelectorAll('[data-v]').forEach(b => b.classList.remove('on'));
      // Activate target
      const el = document.getElementById('v' + id.charAt(0)); // vh, vw, vl
      if (el) { el.classList.add('on') }
      document.querySelectorAll(`[data-v="${id}"]`).forEach(b => b.classList.add('on'));
      curV = id;
    }

    // Map view IDs to element IDs
    const vMap = { home: 'vh', world: 'vw', lab: 'vl' };
    function showViewById(id) {
      try { closeWO() } catch (e) { }; try { closeLabo() } catch (e) { };
      document.querySelectorAll('.view').forEach(v => v.classList.remove('on'));
      document.querySelectorAll('[data-v]').forEach(b => b.classList.remove('on'));
      const el = document.getElementById(vMap[id]);
      if (el) el.classList.add('on');
      document.querySelectorAll(`[data-v="${id}"]`).forEach(b => b.classList.add('on'));
      curV = id;
      // Lazy-load VisualLab iframe on first World tab visit
      if (id === 'world') {
        const frame = document.querySelector('#vw .vw-frame');
        if (frame && frame.dataset.src && !frame.getAttribute('src')) {
          frame.src = frame.dataset.src;
        }
      }
    }

    // Wire tab buttons + dock buttons
    document.querySelectorAll('[data-v]').forEach(btn => {
      btn.addEventListener('click', () => showViewById(btn.dataset.v));
      hov(btn);
    });

    // Start on home
    document.getElementById('vh').classList.add('on');

    /* ══ FOLDERS ══ */
    const byF = {};
    PROJECTS.forEach(p => { if (!byF[p.folder]) byF[p.folder] = []; byF[p.folder].push(p) });

    let activeMenu = null;
    function closeAllMenus() { if (activeMenu) { if (activeMenu.parentNode) activeMenu.parentNode.removeChild(activeMenu); activeMenu = null } }

    function buildFolders() {
      const wrap = document.getElementById('fwrap');
      FOLDERS.forEach(f => {
        const cnt = (byF[f.id] ? byF[f.id].length : 0);
        const el = document.createElement('div');
        el.className = 'fdr'; el.id = 'F' + f.id;
        el.style.cssText = `left:${f.x}%;top:${f.y}%;`; if (window.gsap) gsap.to(el, { y: '+=15', duration: 3 + Math.random() * 2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() }); else el.style.animation = f.an;
        el.innerHTML = `<div class="fdr-ico"><div class="fdr-tab"></div><div class="fdr-base" style="background:${f.col}"></div></div><div class="fdr-lbl">${f.id}</div><div class="fdr-ct">${cnt} project${cnt !== 1 ? 's' : ''}</div>`;
        wrap.appendChild(el);
        hov(el);
        dragFolder(el);
        // Single click = open project menu
        el.addEventListener('click', e => {
          e.stopPropagation();
          // If menu already open for this folder, close it
          if (activeMenu && activeMenu.dataset.fid === f.id) { closeAllMenus(); return }
          closeAllMenus();
          if (f.special === 'video') { openVGO(); return; }
          const ps = byF[f.id] || [];
          if (!ps.length) return;
          const menu = document.createElement('div');
          menu.className = 'fdr-menu'; menu.dataset.fid = f.id;
          menu.innerHTML = `<div class="fdr-menu-hd">${f.id} <span>${ps.length} projects</span></div>` +
            ps.map((p, i) => {
              const imgs = PROJECT_IMGS[p.id] || {};
              const imgSrc = imgs.hero || imgs.video01 || imgs.thumb || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDBwJSIgaGVpZ2h0PSIxMDBwJSI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YwRURFOCIvPjwvc3ZnPg==';
              return `<div class="fdr-mi" data-pid="${p.id}"><div class="fdr-mi-num">${p.num}</div><div><div class="fdr-mi-n">${p.name}</div><div class="fdr-mi-c">${p.client} · ${p.year}</div></div><div class="fdr-mi-img" style="background-image:url('${imgSrc}')"></div></div>`;
            }).join('');
          document.body.appendChild(menu);
          activeMenu = menu;
          // Smart position: place below folder, clamp to viewport, never under topbar
          requestAnimationFrame(() => {
            const fr = el.getBoundingClientRect();
            const mr = menu.getBoundingClientRect();
            const topbarH = document.getElementById('topbar').offsetHeight;
            const sbH = document.getElementById('sb').offsetHeight;
            const vpH = window.innerHeight;
            const vpW = window.innerWidth;
            const pad = 8;
            // Prefer below the folder
            let top = fr.bottom + 6;
            let left = fr.left + fr.width / 2 - mr.width / 2;
            // If not enough room below, open above
            if (top + mr.height > vpH - sbH - pad) top = fr.top - mr.height - 6;
            // Never above topbar
            if (top < topbarH + pad) top = topbarH + pad;
            // Clamp horizontal
            if (left < pad) left = pad;
            if (left + mr.width > vpW - pad) left = vpW - mr.width - pad;
            menu.style.top = top + 'px';
            menu.style.left = left + 'px';
          });
          menu.querySelectorAll('.fdr-mi').forEach(mi => {
            mi.addEventListener('click', e2 => { e2.stopPropagation(); closeAllMenus(); openWin(mi.dataset.pid) });
            hov(mi);
          });
        });
      });
      // Close menu on outside click
      document.addEventListener('click', closeAllMenus);
    }

    function dragFolder(el) {
      let dragging = false, ox, oy;
      el.addEventListener('mousedown', e => { dragging = true; const r = el.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top; el.style.animation = 'none'; el.style.zIndex = 50; e.preventDefault() });
      document.addEventListener('mousemove', e => { if (!dragging) return; el.style.left = (e.clientX - ox) + 'px'; el.style.top = (e.clientY - oy) + 'px' });
      document.addEventListener('mouseup', () => { if (dragging) { dragging = false; el.style.zIndex = '' } });
    }



    /* ══ PROJECT WINDOWS ══ */
    let openW = 0;

    /* compute a safe, always-visible, cascading position for each new window */
    function getWinPos() {
      const vpW  = window.innerWidth;
      const vpH  = window.innerHeight;
      const tbH  = (document.getElementById('topbar') || {offsetHeight:44}).offsetHeight;
      const pw   = 380;   /* window width */
      const ph   = 460;   /* estimated window height */
      const pad  = 20;
      const step = 28;    /* cascade step per window */
      const stagger = (openW % 7) * step;

      /* start slightly left-of-center so windows don't crowd the folders */
      let left = Math.round((vpW - pw) / 2) - 40 + stagger;
      let top  = Math.round((vpH - tbH) * 0.08) + stagger;

      /* clamp so nothing goes off-screen */
      left = Math.max(pad, Math.min(vpW - pw - pad, left));
      top  = Math.max(pad, Math.min(vpH - tbH - ph - pad, top));
      return { l: left + 'px', t: top + 'px' };
    }


    function updateDockCount() {
      const wc = document.querySelectorAll('.pw.on, #labo.on').length;
      const sbt = document.getElementById('sbt');
      if (sbt) sbt.textContent = '6 folders · ' + wc + ' windows open';
    }

    function openWin(id) {
      if (document.getElementById('pw' + id)) { document.getElementById('pw' + id).style.zIndex = 60; return }
      const p = PROJECTS.find(x => x.id === id); if (!p) return;
      const pos = getWinPos();
      const el = document.createElement('div');
      el.className = 'pw on'; el.id = 'pw' + id;
      el.style.left = pos.l; el.style.top = pos.t;
      const imgs = PROJECT_IMGS[p.id] || {};
      const imgSrc = imgs.hero || imgs.video01 || imgs.thumb || '';
      const isVid = imgSrc.toLowerCase().endsWith('.mp4');
      const heroHtml = isVid 
        ? `<video autoplay muted loop playsinline class="pw-cov-vid"><source src="${imgSrc}"></video>`
        : '';
      const heroStyle = isVid ? 'background-color: #1A1916;' : `background: url('${imgSrc}') center/cover no-repeat; background-color: #1A1916;`;
      
      el.innerHTML = `<div class="pw-bar"><div class="pw-d r" data-x="${id}"></div><div class="pw-d y"></div><div class="pw-d g"></div><div class="pw-ft">${p.id} · ${p.year}</div></div><div class="pw-sc"><div class="pw-cov" style="${heroStyle}">${heroHtml}<div class="pw-cov-g">${p.num}</div><div class="pw-cov-badge">${p.tags[0] || ''}</div><div class="pw-cov-yr">${p.year} · ${(p.folder || '').toUpperCase()}</div></div><div class="pw-in"><div class="pw-num">${p.num}/15</div><div class="pw-name">${p.name} <em>${p.ni}</em></div><div class="pw-cli">${p.client}</div><div class="pw-stmt">${p.stmt}</div><div class="pw-tags">${p.tags.slice(0, 3).map(t => `<span class="pw-tag">${t}</span>`).join('')}</div><div class="pw-mets">${p.results.slice(0, 3).map(r => `<div class="pw-met"><div class="pw-mn">${r.n}</div><div class="pw-ml">${r.l}</div></div>`).join('')}</div><button class="pw-btn" data-cs="${id}">Open Full Case Study →</button></div></div>`;
      document.getElementById('wwrap').appendChild(el);
      dragWin(el); hov(el);
      el.querySelector('[data-x]').addEventListener('click', e => { e.stopPropagation(); closeWin(id) });
      el.querySelector('[data-cs]').addEventListener('click', () => {
        if (id === 'cheeko')      { window.location.href = 'cheeko.html'; return; }
        openCS(id);
      });
      openW++; updateSB();
    }

    function closeWin(id) {
      const el = document.getElementById('pw' + id); if (!el) return;
      el.style.transition = 'opacity .22s,transform .22s'; el.style.opacity = '0'; el.style.transform = 'scale(.88)';
      setTimeout(() => { el.remove(); openW--; updateSB() }, 230);
    }

    function dragWin(el) {
      let d = false, ox, oy;
      el.querySelector('.pw-bar').addEventListener('mousedown', e => {
        d = true;
        const r  = el.getBoundingClientRect();
        const wr = document.getElementById('wwrap').getBoundingClientRect();
        /* offsets relative to the element's own top-left */
        ox = e.clientX - r.left;
        oy = e.clientY - r.top;
        /* store #wwrap origin so mousemove stays in the right coordinate space */
        el._wrLeft = wr.left;
        el._wrTop  = wr.top;
        el.style.animation = 'none'; el.style.zIndex = 60; e.preventDefault();
      });
      document.addEventListener('mousemove', e => {
        if (!d) return;
        /* subtract #wwrap origin so positions are relative to the containing block */
        el.style.left = (e.clientX - ox - el._wrLeft) + 'px';
        el.style.top  = (e.clientY - oy - el._wrTop)  + 'px';
      });
      document.addEventListener('mouseup', () => { if (d) { d = false; el.style.zIndex = '' } });
    }

    function updateSB() { const e = document.getElementById('sbt'); if (e) e.textContent = `${FOLDERS.length} folders · ${openW} window${openW !== 1 ? 's' : ''} open` }


    /* ══ VISUAL WORK RENDERER ══ */
    function renderVisualWork(p) {
      var imgs = PROJECT_IMGS[p.id] || {};
      var fMap = {
        "Enterprise": "#1A1916", "Brand & Identity": "#3D2B1F",
        "Digital & Social": "#1A2A3A", "Product & Campaign": "#2A1A3A", "Events & Experiential": "#3A1A1A"
      };
      var fCol = fMap[p.folder] || "#1A1916";

      function lbl(txt) {
        return "<div style='position:absolute;bottom:8px;left:8px;font-family:var(--fm);font-size:7px;letter-spacing:.1em;text-transform:uppercase;background:rgba(0,0,0,.5);color:#fff;padding:3px 8px'>" + txt + "</div>";
      }
      function cell(imgKey, ratio, lblTxt, pos) {
        var img = imgs[imgKey];
        if (img) {
          var isVid = img.toLowerCase().endsWith('.mp4');
          var mediaTag = isVid 
            ? `<video autoplay muted loop playsinline style='width:100%;height:auto;display:block;vertical-align:top'><source src='${img}'></video>`
            : `<img src='${img}' style='width:100%;height:auto;display:block;vertical-align:top' />`;
          
          return "<div onclick='openLightbox(\"" + imgKey + "\",\"" + p.id + "\",\"" + lblTxt + "\")' style='cursor:zoom-in;position:relative;overflow:hidden'>" +
            mediaTag +
            lbl(lblTxt) +
            "</div>";
        }
        return "<div style='background:#E8E4DE;aspect-ratio:" + ratio + ";display:flex;align-items:center;justify-content:center'><span style='font-family:var(--fm);font-size:8px;color:#8A8378'>" + lblTxt + "</span></div>";
      }

      if (p.id === "cheeko") {
        var heroDiv = imgs.hero
          ? "<div onclick='openLightbox(\"hero\",\"cheeko\",\"Product · App · Identity\")' style='cursor:zoom-in;position:relative;overflow:hidden;grid-row:span 2'>" +
          "<img src='" + imgs.hero + "' style='width:100%;height:auto;display:block' />" +
          lbl("Product · App · Identity") +
          "</div>"
          : "<div style='background:#1A1916;aspect-ratio:9/16;grid-row:span 2;display:flex;align-items:center;justify-content:center'><span style='color:rgba(255,255,255,.3);font-family:var(--fm);font-size:9px'>Cheeko</span></div>";
        return "<div style='display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:3px'>" +
          heroDiv +
          cell("extra1", "9/8", "Onboarding", "center top") +
          cell("extra2", "9/8", "Website", "center 20%") +
          "</div>" +
          "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px'>" +
          cell("detail1", "9/16", "App Home", "center top") +
          cell("detail2", "9/16", "Dashboard", "top") +
          cell("detail3", "9/16", "Setup", "center") +
          "</div>" +
          "<div style='display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:3px'>" +
          cell("orig_hero", "16/9", "Social Campaign", "center") +
          cell("extra3", "16/9", "Product Listing", "top") +
          "</div>";
      }

      if (p.id === "dell") {
        // Lightbox opener
        var lb = function (imgKey, caption) {
          var img = imgs[imgKey];
          if (!img) return "<div style='background:#E8E4DE;aspect-ratio:9/16;border:1px solid rgba(26,25,22,.08)'></div>";
          return "<div onclick='openLightbox(\"" + imgKey + "\",\"" + p.id + "\",\"" + caption + "\")' style='cursor:zoom-in;position:relative;overflow:hidden' title='Click to enlarge'>" +
            "<img src='" + img + "' style='width:100%;height:auto;display:block;vertical-align:top' />" +
            "<div style='position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,.45));opacity:0;transition:opacity .2s' class='lb-cap'>" +
            "<span style='font-family:var(--fm);font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.8)'>" + caption + "</span>" +
            "</div></div>";
        };

        // Landscape image (hero/sust) — fixed 16/9 with click
        var lbLand = function (imgKey, caption) {
          var img = imgs[imgKey];
          if (!img) return "<div style='background:#E8E4DE;aspect-ratio:16/9'></div>";
          return "<div onclick='openLightbox(\"" + imgKey + "\",\"" + p.id + "\",\"" + caption + "\")' style='cursor:zoom-in;position:relative;overflow:hidden'>" +
            "<img src='" + img + "' style='width:100%;height:auto;display:block' />" +
            "</div>";
        };

        // Section heading
        var sec = function (num, title) {
          return "<div style='margin:32px 0 14px;display:flex;align-items:center;gap:14px'>" +
            "<span style='font-family:var(--fe);font-style:italic;font-size:22px;color:var(--accent);font-weight:300;flex-shrink:0'>" + num + "</span>" +
            "<span style='font-family:var(--ff);font-size:13px;font-weight:700;color:#1A1916'>" + title + "</span>" +
            "<div style='flex:1;height:1px;background:rgba(26,25,22,.1)'></div>" +
            "</div>";
        };

        // Hero — true 16:9 landscape with gradient overlay
        var heroHtml = imgs.hero ? (
          "<div onclick='openLightbox(\"hero\",\"" + p.id + "\",\"Pedal to Light — Every minute cycled funds a solar lamp\")' style='cursor:zoom-in;position:relative;overflow:hidden;margin-bottom:4px'>" +
          "<img src='" + imgs.hero + "' style='width:100%;height:auto;display:block' />" +
          "<div style='position:absolute;inset:0;background:linear-gradient(to top,rgba(10,8,5,.78) 0%,transparent 55%);pointer-events:none'></div>" +
          "<div style='position:absolute;bottom:20px;left:24px;right:60px;pointer-events:none'>" +
          "<div style='font-family:var(--fm);font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:6px'>Pedal to Light</div>" +
          "<div style='font-family:var(--fe);font-style:italic;font-size:24px;font-weight:300;color:#fff;line-height:1.1'>Every minute cycled funds a solar lamp for a student.</div>" +
          "</div>" +
          "</div>"
        ) : "";

        // Music — 3 portrait phone screens, true aspect ratio
        var musicHtml = sec("01", "AI Music Studio") +
          "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px'>" +
          lb("music1", "Genre Selection") +
          lb("music2", "Describe Your Song") +
          lb("music4", "Your Track + QR Download") +
          "</div>";

        // Photo studio
        var photoHtml = sec("02", "AI Professional Photo Studio") +
          "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px'>" +
          lb("photo1", "Redefine What Is Real") +
          lb("photo3", "Choose Your Transformation") +
          lb("photo7", "Here Is Your New Look") +
          "</div>";

        // Bistro
        var bistroHtml = sec("03", "AI Bistro") +
          "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px'>" +
          lb("bistro4", "Welcome to the AI Cafe") +
          lb("bistro5", "How Are You Feeling?") +
          lb("bistro1", "Your Perfect Coffee") +
          "</div>";

        // Sustainability — landscape overview full width, then 2 landscape below
        var sustHtml = sec("04", "Sustainability System — Reduce · Reuse · Recycle · Regenerate") +
          lbLand("sust1", "Making a Positive Impact Together") +
          "<div style='display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px'>" +
          lbLand("cycle3", "Pedal to Light — UI") +
          lbLand("mean1", "Refill Today. Revive Tomorrow.") +
          "</div>";

        // Video — single embed full width
        var iStyle2 = "position:absolute;top:0;left:0;width:100%;height:100%;border:none";
        var iAllow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        var videoHtml = sec("05", "Watch: Activations in Motion") +
          "<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px'>" +
          "<div>" +
          "<div style='font-family:var(--fm);font-size:7px;letter-spacing:.16em;text-transform:uppercase;color:rgba(26,25,22,.4);margin-bottom:8px'>Kinetic Pulse</div>" +
          "<div style='position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#1A1916'>" +
          "<iframe src='https://www.youtube.com/embed/Afudj_Zh2u8?rel=0' style='" + iStyle2 + "' allow='" + iAllow + "' allowfullscreen></iframe>" +
          "</div>" +
          "</div>" +
          "<div>" +
          "<div style='font-family:var(--fm);font-size:7px;letter-spacing:.16em;text-transform:uppercase;color:rgba(26,25,22,.4);margin-bottom:8px'>Forum Highlights</div>" +
          "<div style='position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#1A1916'>" +
          "<iframe src='https://www.youtube.com/embed/rF2KEqNBdZ4?rel=0' style='" + iStyle2 + "' allow='" + iAllow + "' allowfullscreen></iframe>" +
          "</div>" +
          "</div>" +
          "</div>";

        return heroHtml + musicHtml + photoHtml + bistroHtml + sustHtml + videoHtml;
      }

      var heroContent = imgs.hero
        ? "<div onclick='openLightbox(\"hero\",\"" + p.id + "\",\"" + p.client + " " + p.year + "\")' style='cursor:zoom-in;overflow:hidden;position:relative'>" +
        "<img src='" + imgs.hero + "' style='width:100%;height:auto;display:block' />" +
        "<div class='cs-vb' style='background:rgba(0,0,0,.5);color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.2)'>" + p.client + " · " + p.year + "</div>" +
        "</div>"
        : "<div class='cs-vh' style='background:" + fCol + ";border-color:" + fCol + "'>" +
        "<div style='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px'>" +
        "<div style='font-family:var(--fe);font-style:italic;font-size:clamp(56px,8vw,96px);color:rgba(255,255,255,.06);line-height:1'>" + p.name.split(" ")[0] + "</div>" +
        "<div style='font-family:var(--fm);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.25)'>" + p.client + "</div></div>" +
        "<div class='cs-vb' style='background:rgba(0,0,0,.5);color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.2)'>" + p.client + " · " + p.year + "</div>" +
        "</div>";
      var details = ["detail1", "detail2", "detail3"].map(function (dk, i) {
        var dImg = imgs[dk];
        var lbTxt = ["Detail", "System", "Motion"][i];
        if (dImg) {
          return "<div class='cs-vsi' onclick='openLightbox(\"" + dk + "\",\"" + p.id + "\",\"" + lbTxt + "\")' style='cursor:zoom-in;min-height:70px;overflow:hidden'>" +
            "<img src='" + dImg + "' style='width:100%;height:auto;display:block' /></div>";
        }
        return "<div class='cs-vsi' style='background:#E8E4DE;border-color:#D0CCC4;min-height:70px'><div style='text-align:center'><div style='font-family:var(--fm);font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:#8A8378'>" + lbTxt + "</div></div></div>";
      }).join("");
      return "<div class='cs-vm'>" + heroContent + "<div class='cs-vs'>" + details + "</div></div>";
    }


    /* ══ CASE STUDY — BULLETPROOF ══ */
    let curCS = null;

    function openCS(id) {
      if (id === 'cheeko')     { window.location.href = 'cheeko.html'; return; }
      const p = PROJECTS.find(x => x.id === id); if (!p) return;
      pixelTransition(function () {
        curCS = id;
        document.getElementById('cs-ttl').textContent = p.client + ' — ' + p.name;
        buildCS(p);
        const o = document.getElementById('cso');
        o.classList.add('on'); void o.offsetHeight; o.classList.add('vis'); updateDockCount();
        document.getElementById('cs-body').scrollTop = 0;
      });
    }

    function closeCS() {
      const o = document.getElementById('cso');
      o.classList.remove('vis');
      // Wait for opacity transition then hide
      setTimeout(() => o.classList.remove('on'), 380);
    }

    function navCS(dir) {
      if (!curCS) return;
      const i = PROJECTS.findIndex(x => x.id === curCS);
      openCS(PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length].id);
    }

    document.getElementById('cs-close').addEventListener('click', closeCS);
    document.getElementById('cs-prev').addEventListener('click', () => navCS(-1));
    document.getElementById('cs-next').addEventListener('click', () => navCS(1));



    function buildVerrisCS(p, imgs, extras) {

      /* ── filmstrip 2-up ── */
      function g2(keys) {
        var items = keys.map(function (k) {
          var src = imgs[k]; if (!src) return '';
          return '<div class="dell-filmstrip-item" onclick="openLightbox(\'' + k + '\',\'' + p.id + '\',\'' + k + '\')">' +
            '<img src="' + src + '" loading="lazy" /></div>';
        }).filter(Boolean);
        if (!items.length) return '';
        return '<div class="dell-filmstrip dell-filmstrip--g2">' + items.join('') + '</div>';
      }

      /* ── INTRO ── */
      var introHTML =
        '<div class="vr-intro">' +
        '<div class="vr-intro-l">' +
        '<div>' +
        '<div class="vr-eyebrow dell-reveal-p" style="--d:0s">' + p.client + ' &nbsp;&middot;&nbsp; ' + p.year + ' &nbsp;&middot;&nbsp; Bangalore</div>' +
        '<h1 class="vr-h1 dell-reveal-title">Dell Forum<br>2025</h1>' +
        '<p class="df-subhead dell-reveal-p" style="--d:0.08s">14 activations. One visual language. Six weeks.</p>' +
        '<p class="vr-desc dell-reveal-p" style="--d:0.16s">Dell Technologies handed us a floor. 4,000 sqft. 14 activations. One brief: make sustainability and AI feel real, not corporate. We had six weeks, a team spread across five zones, and zero margin for a single activation to feel like it belonged to a different event. What followed was the largest interactive brand experience I have ever directed &#8212; and the most technically complex thing I have built.</p>' +
        '</div>' +
        '</div>' +
        '<div class="vr-intro-r">' +
        '<div class="vr-meta">' +
        '<div><div class="vr-meta-lbl">Client</div><div class="vr-meta-val">' + p.client + '</div></div>' +
        '<div><div class="vr-meta-lbl">Role</div><div class="vr-meta-val">Creative Director &amp; Experience Architect</div></div>' +
        '<div><div class="vr-meta-lbl">Timeline</div><div class="vr-meta-val">6 Weeks</div></div>' +
        '<div><div class="vr-meta-lbl">Team</div><div class="vr-meta-val">15 across 5 zones</div></div>' +
        '<div><div class="vr-meta-lbl">Location</div><div class="vr-meta-val">Bangalore</div></div>' +
        '</div>' +
        '</div>' +
        '</div>';

      /* ── STATS ROW ── */
      var statsHTML =
        '<div class="vr-stats" style="border-bottom:1px solid rgba(255,255,255,0.06)">' +
        '<div class="vr-stat dell-stat-item" style="--d:0s"><div class="vr-stat-n" style="color:#00C4CC">14</div><div class="vr-stat-l">Activations</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.07s"><div class="vr-stat-n" style="color:#00C4CC">5</div><div class="vr-stat-l">AI Experiences</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.14s"><div class="vr-stat-n" style="color:#00C4CC">3&times;</div><div class="vr-stat-l">Dwell Time</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.21s"><div class="vr-stat-n" style="color:#00C4CC">100%</div><div class="vr-stat-l">Brand Consistency</div></div>' +
        '</div>';

      /* ── HERO IMAGE ── */
      var heroHTML = imgs.hero ?
        '<div style="width:100%;max-height:680px;overflow:hidden;background:#050505">' +
        '<img src="' + imgs.hero + '" style="width:100%;height:100%;object-fit:cover;opacity:.88;display:block" loading="eager" />' +
        '</div>' : '';

      /* ── SEC 1: THE BRIEF ── */
      var briefHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">01</span><span class="vr-sec-name">The Brief</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">THE BRIEF</div>' +
        '<div class="vr-sec-title dell-reveal-title">One story.<br>Fourteen rooms.</div>' +
        '<p class="vr-sec-p dell-reveal-p">Dell\'s ask was deceptively simple: translate their global mission of sustainability and human impact into something people could touch. No slide decks. No keynote. The product had to be the experience itself.</p>' +
        '<p class="vr-sec-p dell-reveal-p">The real problem was coherence. Fourteen activations built by different vendors, running simultaneously, in different zones &#8212; every single one had to feel like the same brand. One visual language. One emotional register. One story, told fourteen ways.</p>' +
        '<p class="vr-sec-p dell-reveal-p">That is not a design problem. That is a systems problem. Nobody handed me a playbook for it.</p>' +
        '</div>' +
        '</div>';

      /* ── SEC 2: DNA PILLARS ── */
      var dnaHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">02</span><span class="vr-sec-name">DNA Pillars &amp; Kinetic Rigs</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">DNA PILLARS &amp; KINETIC RIGS</div>' +
        '<div class="vr-sec-title dell-reveal-title">Building the visual backbone.</div>' +
        '<p class="vr-sec-p dell-reveal-p">Before a single screen lit up, I had to define the design system that would govern everything. Three DNA pillars &#8212; precision, momentum, and human scale &#8212; became the filter for every creative decision.</p>' +
        '<p class="vr-sec-p dell-reveal-p">The kinetic LED rigs were the physical expression of that. Moving architecture. Designed for every state: in motion, static, with a VIP in front of them, with nobody. That constraint &#8212; design for every state &#8212; became the discipline that held the whole event together.</p>' +
        g2(['vlc02', 'vlc03']) +
        g2(['hmrs1', 'hmrs2']) +
        '</div>' +
        '</div>';

      /* ── SEC 3: HMRS PROBLEM — dark bg + typewriter ── */
      var hmrsHTML =
        '<div class="df-hmrs-sec vr-sec" id="df-hmrs-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">03</span><span class="vr-sec-name">The Real Challenge</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">THE REAL CHALLENGE</div>' +
        '<div class="vr-sec-title" id="df-hmrs-title" style="visibility:hidden;min-height:2.5em"></div>' +
        '<p class="vr-sec-p dell-reveal-p">The HMRS screens were designed to split apart mid-content &#8212; kinetic, dramatic, the signature visual of the event. The problem nobody anticipated: when the screens split during client testimonial playback, the faces and text split with them. It looked like a technical failure. In front of Dell\'s senior leadership.</p>' +
        '<p class="vr-sec-p dell-reveal-p">I rebuilt the playback logic in TouchDesigner overnight. Custom real-time patterns that kept content centred regardless of screen position. By morning it worked. Nobody in the audience ever knew there had been a problem.</p>' +
        '<p class="vr-sec-p dell-reveal-p" style="font-style:italic;color:rgba(255,255,255,0.7)">That is what creative direction actually is &#8212; the part that does not make it into the brief.</p>' +
        '</div>' +
        '</div>';

      /* ── SEC 4: ACTIVATIONS — 5 cards ── */
      var actData = [
        { title: 'Pedal to Light', metric: 'Queue never dropped below 20 people', body: 'An IoT-driven installation where attendees cycled stationary bikes to generate real energy output. The data fed live into a visualisation mapping effort directly to Dell\'s sustainability metrics. Physical effort, visible impact.' },
        { title: 'AI Music Studio', metric: '4-minute average engagement time', body: 'Attendees described their mood in a sentence. The system generated a 60-second original track in real time. At a conference where most activations got 90 seconds, this one held people for four minutes.' },
        { title: 'AI Photo Studio', metric: 'Shareable in under 30 seconds', body: 'Not a photobooth. A generative portrait studio. Attendees became characters inside visual worlds built from Dell\'s brand system. Every output unique, branded, shareable within 30 seconds.' },
        { title: 'AI Bistro', metric: 'Highest voluntary share rate of any activation', body: 'A personality-mapping activation disguised as a coffee bar. Three questions. The system matched leadership style to a coffee blend and printed a branded cup with their profile.' },
        { title: 'Sustainability System', metric: 'Most photographed installation at the event', body: 'Four-quadrant installation: Reduce, Recycle, Reuse, Regenerate. Made abstract ESG commitments tangible by tying each quadrant to real Dell product data. Designed to be photographed &#8212; and it was.' }
      ];
      var actCardsHTML = actData.map(function (c) {
        return '<div class="df-act-card">' +
          '<div class="df-act-metric">' + c.metric + '</div>' +
          '<div class="df-act-title">' + c.title + '</div>' +
          '<div class="df-act-body">' + c.body + '</div>' +
          '</div>';
      }).join('');
      var activationsHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">04</span><span class="vr-sec-name">Experience Logic</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">EXPERIENCE LOGIC</div>' +
        '<div class="vr-sec-title dell-reveal-title">Five highlights from fourteen.</div>' +
        '<div class="df-act-cards">' + actCardsHTML + '</div>' +
        '</div>' +
        '</div>';

      /* ── SEC 5: PROCESS ── */
      var processHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">05</span><span class="vr-sec-name">How I Held It Together</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">HOW I HELD IT TOGETHER</div>' +
        '<div class="vr-sec-title dell-reveal-title">I stopped being a designer.</div>' +
        '<p class="vr-sec-p dell-reveal-p">Fourteen activations means fourteen things that can go wrong at the same time. The only way to hold it was to stop solving individual problems and start building a system that made problems harder to create.</p>' +
        '<p class="vr-sec-p dell-reveal-p">Every activation got a creative brief referencing the same three pillars. Every vendor got the same design tokens. Every motion piece followed the same timing language. The system was the creative direction.</p>' +
        '<p class="vr-sec-p dell-reveal-p">The team was 15 people across five zones. I was the only person who could see the whole board. Daily briefings, real-time creative decisions, and the constant discipline of not letting any one zone solve a problem in a way that created a problem somewhere else.</p>' +
        '</div>' +
        '</div>';

      /* ── SEC 6: HURDLES — 3 cards ── */
      var hurdleData = [
        { prob: 'Vendor #3 built their activation to a different colour spec.', res: 'Caught it 48 hours before the event. Rebuilt all motion assets overnight. The audience saw nothing different.' },
        { prob: 'The LED rig supplier changed the hardware spec ten days before delivery.', res: 'The design had to flex without losing the visual language. It did.' },
        { prob: 'Two activations had simultaneous launch moments. I was needed in both.', res: 'Trained a team lead on the brief well enough that I did not have to be there. She delivered it perfectly.' }
      ];
      var hurdleCardsHTML = hurdleData.map(function (h) {
        return '<div class="df-hurdle-card">' +
          '<div class="df-hurdle-lbl">Problem</div>' +
          '<div class="df-hurdle-prob">' + h.prob + '</div>' +
          '<div class="df-hurdle-lbl">Resolution</div>' +
          '<div class="df-hurdle-res">' + h.res + '</div>' +
          '</div>';
      }).join('');
      var hurdlesHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">06</span><span class="vr-sec-name">What Nobody Plans For</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">WHAT NOBODY PLANS FOR</div>' +
        '<div class="vr-sec-title dell-reveal-title">The briefs inside the brief.</div>' +
        '<div class="df-hurdle-cards">' + hurdleCardsHTML + '</div>' +
        '</div>' +
        '</div>';

      /* ── SEC 7: VIDEO — click-to-load ── */
      var videoHTML =
        '<div class="dell-video-full" style="background:#050505;border-color:rgba(255,255,255,0.05)">' +
        '<div class="dell-video-header">' +
        '<span class="vr-sec-num">07</span>' +
        '<span class="dell-video-section-label">Watch the Forum</span>' +
        '</div>' +
        '<div class="dell-video-title dell-reveal-title">Watch the Forum.</div>' +
        '<div style="max-width:840px;margin:0 auto">' +
        '<div style="font-family:var(--fm);font-size:7px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:10px;text-align:center">Forum Highlights</div>' +
        '<div class="df-vid-wrap" data-ytid="rF2KEqNBdZ4">' +
        '<img class="df-vid-thumb" src="https://img.youtube.com/vi/rF2KEqNBdZ4/maxresdefault.jpg" alt="Forum Highlights" />' +
        '<div class="df-vid-play"></div>' +
        '</div>' +
        '</div>' +
        '</div>';

      /* ── SEC 8: CLIENT QUOTE — full-bleed dark purple ── */
      var quoteHTML =
        '<div class="df-quote-sec">' +
        '<div class="df-quote-text dell-reveal-title">&ldquo;The level of technical precision and visual consistency maintained across 12 simultaneous activations was unprecedented for our team.&rdquo;</div>' +
        '<div class="df-quote-attr dell-reveal-p">Dell Technologies</div>' +
        '<div class="vr-stats">' +
        '<div class="vr-stat dell-stat-item" style="--d:0s"><div class="vr-stat-n" style="color:#00C4CC">14</div><div class="vr-stat-l">Activations</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.07s"><div class="vr-stat-n" style="color:#00C4CC">5</div><div class="vr-stat-l">AI Experiences</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.14s"><div class="vr-stat-n" style="color:#00C4CC">3&times;</div><div class="vr-stat-l">Dwell Time</div></div>' +
        '<div class="vr-stat dell-stat-item" style="--d:0.21s"><div class="vr-stat-n" style="color:#00C4CC">100%</div><div class="vr-stat-l">Brand Consistency</div></div>' +
        '</div>' +
        '</div>';

      /* ── SEC 9: LEARNINGS ── */
      var learnHTML =
        '<div class="vr-sec">' +
        '<div class="vr-sec-lbl rev-l"><span class="vr-sec-num">08</span><span class="vr-sec-name">What This Taught Me</span></div>' +
        '<div class="vr-sec-body">' +
        '<div class="df-label">WHAT THIS TAUGHT ME</div>' +
        '<p class="vr-sec-p dell-reveal-p">Scale does not break systems. Ambiguity does. Every problem we hit came from an assumption someone made and did not document. The fix was always the same: make the decision explicit, share it, move.</p>' +
        '<p class="vr-sec-p dell-reveal-p">The best creative direction is invisible. When it works, the experience feels inevitable. Nobody thinks about the system behind it. That is the point.</p>' +
        '</div>' +
        '</div>';

      /* ── SEC 10: CTA ── */
      var ctaHTML =
        '<div class="dell-cta" id="dell-cta">' +
        '<div class="dell-cta-lbl dell-reveal-p">Let\'s work together.</div>' +
        '<h2 class="dell-cta-h dell-reveal-title">Ready to build your next brand experience?</h2>' +
        '<div class="dell-cta-links">' +
        '<a class="dell-cta-link dell-reveal-p email-reveal" data-email="abhinavdoss@gmail.com" href="javascript:void(0)" style="--d:0.2s">Email</a>' +
        '<span class="dell-cta-sep dell-reveal-p" style="--d:0.25s">/</span>' +
        '<a class="dell-cta-link dell-reveal-p" href="https://www.linkedin.com/in/abhinavdosskaushal/" target="_blank" style="--d:0.3s">LinkedIn</a>' +
        '</div>' +
        '</div>';

      /* ── NEXT PROJECT ── */
      var idx = PROJECTS.findIndex(function (x) { return x.id === p.id; });
      var nxt = PROJECTS[(idx + 1) % PROJECTS.length];
      var nextHTML =
        '<div class="vr-next" onclick="openCS(\'' + nxt.id + '\')">' +
        '<div class="vr-next-l">' +
        '<div class="vr-next-lbl">Ready to see what\'s next?</div>' +
        '<div class="vr-next-title">' + nxt.name + '</div>' +
        '</div>' +
        '<div class="vr-next-arr">&#8594;</div>' +
        '</div>';

      /* ── ASSEMBLE ── */
      document.getElementById('cs-pills').innerHTML = '';
      document.getElementById('cs-body').innerHTML =
        '<div id="df-progress" style="position:sticky;top:0;left:0;width:0;height:2px;background:#00C4CC;z-index:99;pointer-events:none;margin-bottom:-2px;transition:width .05s linear"></div>' +
        '<div class="vr">' +
        introHTML + statsHTML + heroHTML +
        briefHTML + dnaHTML + hmrsHTML +
        activationsHTML + processHTML +
        hurdlesHTML + videoHTML + quoteHTML +
        learnHTML + ctaHTML + nextHTML +
        '</div>';

      /* ── POST-RENDER ── */
      requestAnimationFrame(function () {
        var csBody = document.getElementById('cs-body');
        var prog = document.getElementById('df-progress');

        /* scroll progress bar */
        if (prog && csBody) {
          csBody.addEventListener('scroll', function () {
            var sh = csBody.scrollHeight - csBody.clientHeight;
            var pct = sh > 0 ? (csBody.scrollTop / sh) * 100 : 0;
            prog.style.width = pct + '%';
          }, { passive: true });
        }

        /* main reveal observer — bidirectional */
        var revSel = '#cs-body .rev, #cs-body .rev-l, #cs-body .dell-reveal-title, #cs-body .dell-reveal-p, #cs-body .dell-stat-item, #cs-body .df-label';
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); }
            else { e.target.classList.remove('in'); }
          });
        }, { threshold: 0.09, rootMargin: '-32px 0px -32px 0px' });
        document.querySelectorAll(revSel).forEach(function (el) { io.observe(el); });

        /* activation card stagger — one-shot */
        var actCards = document.querySelectorAll('#cs-body .df-act-card');
        var actIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              var i = Array.prototype.indexOf.call(actCards, e.target);
              var delay = i * 100;
              var target = e.target;
              setTimeout(function () { target.classList.add('in'); }, delay);
              actIO.unobserve(e.target);
            }
          });
        }, { threshold: 0.1 });
        actCards.forEach(function (el) { actIO.observe(el); });

        /* hurdle card stagger — one-shot */
        var hurdleCards = document.querySelectorAll('#cs-body .df-hurdle-card');
        var hurdleIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              var i = Array.prototype.indexOf.call(hurdleCards, e.target);
              var delay = i * 120;
              var target = e.target;
              setTimeout(function () { target.classList.add('in'); }, delay);
              hurdleIO.unobserve(e.target);
            }
          });
        }, { threshold: 0.1 });
        hurdleCards.forEach(function (el) { hurdleIO.observe(el); });

        /* HMRS: bg flash + typewriter — one-shot */
        var hmrsSec = document.getElementById('df-hmrs-sec');
        var hmrsTitle = document.getElementById('df-hmrs-title');
        if (hmrsSec && hmrsTitle) {
          var hmrsDone = false;
          var hmrsIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting && !hmrsDone) {
                hmrsDone = true;
                hmrsSec.style.transition = 'none';
                hmrsSec.style.background = '#1A0000';
                setTimeout(function () {
                  hmrsSec.style.transition = 'background 0.15s ease';
                  hmrsSec.style.background = '#111111';
                }, 16);
                var txt = 'The thing that almost broke on day one.';
                hmrsTitle.style.visibility = 'visible';
                hmrsTitle.innerHTML = '<span id="df-tw-span"></span><span class="df-cursor"></span>';
                var twEl = document.getElementById('df-tw-span');
                var ti = 0;
                function typeChar() {
                  if (ti < txt.length) {
                    twEl.textContent = txt.slice(0, ti + 1);
                    ti++;
                    setTimeout(typeChar, 40);
                  }
                }
                setTimeout(typeChar, 200);
                hmrsIO.disconnect();
              }
            });
          }, { threshold: 0.2 });
          hmrsIO.observe(hmrsSec);
        }

        /* video click-to-load — using delegation for robustness */
        var csBody = document.getElementById('cs-body');
        if (csBody && !csBody._vidWired) {
          csBody._vidWired = true;
          csBody.addEventListener('click', function (e) {
            var wrap = e.target.closest('.df-vid-wrap');
            if (wrap && !wrap.classList.contains('loaded')) {
              var ytid = wrap.getAttribute('data-ytid');
              if (!ytid) return;
              var ifr = document.createElement('iframe');
              ifr.src = 'https://www.youtube.com/embed/' + ytid + '?rel=0&autoplay=1';
              ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
              ifr.setAttribute('allowfullscreen', '');
              wrap.classList.add('loaded');
              wrap.appendChild(ifr);
              wrap.style.cursor = 'default';
            }
          });
        }

        /* filmstrip drag */
        document.querySelectorAll('#cs-body .dell-filmstrip').forEach(function (strip) {
          var isDown = false, startX = 0, sl = 0, didDrag = false;
          strip.addEventListener('mousedown', function (e) {
            isDown = true; didDrag = false;
            startX = e.pageX; sl = strip.scrollLeft;
            strip.classList.add('grabbing');
            e.preventDefault();
          });
          document.addEventListener('mouseup', function () {
            if (!isDown) return;
            isDown = false; strip.classList.remove('grabbing');
          });
          document.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var dx = e.pageX - startX;
            if (Math.abs(dx) > 4) didDrag = true;
            strip.scrollLeft = sl - dx;
          });
          strip.addEventListener('click', function (e) {
            if (didDrag) { e.stopPropagation(); didDrag = false; }
          }, true);
        });

      });
    }


    function buildTechSparksCS(p, imgs, extras) {

      var heroHTML =
        '<div class="ts-hero" id="ts-hero">' +
        '<span class="ts-hero-kicker">Craftech360 / YourStory</span>' +
        '<h1 class="ts-h1" id="ts-h1">' +
        '<span class="ts-h1-line"><span class="ts-word">TechSparks</span></span>' +
        '<span class="ts-h1-line"><span class="ts-word" style="transition-delay:0.1s">2025</span></span>' +
        '</h1>' +
        '<p class="ts-subhead" id="ts-subhead">4 activations. 96 hours. One brief to design the most memorable experience at India\'s biggest innovation summit.</p>' +
        '<div class="ts-stats">' +
        '<div class="ts-stat"><div class="ts-stat-n ts-spring-n" data-target="4">0</div><div class="ts-stat-l">Activations</div></div>' +
        '<div class="ts-stat"><div class="ts-stat-n ts-spring-n" data-target="96">0</div><div class="ts-stat-l">Hours to Build</div></div>' +
        '<div class="ts-stat"><div class="ts-stat-n ts-spring-n" data-target="5" data-suffix="x">0</div><div class="ts-stat-l">Social Shares</div></div>' +
        '<div class="ts-stat"><div class="ts-stat-n ts-spring-n" data-target="5000">0</div><div class="ts-stat-l">Attendees</div></div>' +
        '</div>' +
        '</div>';

      var diagonalHTML = '<div class="ts-diagonal-cut"></div>';

      var briefHTML =
        '<div class="ts-section ts-dark" id="ts-brief">' +
        '<span class="ts-section-label ts-reveal">The Brief</span>' +
        '<h2 class="ts-h2 ts-reveal" style="transition-delay:0.1s">YourStory called.<br>Craftech360 had four days.</h2>' +
        '<p class="ts-p ts-reveal" style="transition-delay:0.2s">TechSparks is one of India\'s most-watched startup and innovation conferences. The ask: design the entire creative identity and on-ground experience for the AI pavilion from scratch. No assets. No prep time. 96 hours from brief to live.</p>' +
        '<p class="ts-p ts-reveal" style="transition-delay:0.3s;margin-top:20px">Four activations had to feel like a single coherent vision -- a space where attendees could touch AI, not just hear about it.</p>' +
        '</div>';

      var activationsHTML =
        '<div class="ts-act-split" id="ts-act-split">' +
        '<div class="ts-act-left" id="ts-act-left">' +
        '<div class="ts-act-num" id="ts-act-left-num">01</div>' +
        '<div class="ts-act-title" id="ts-act-left-title">AI Art Installation</div>' +
        '<div class="ts-act-desc-left" id="ts-act-left-desc">Real-time AI-generated visuals responding to crowd energy and voice prompts.</div>' +
        '</div>' +
        '<div class="ts-act-right" id="ts-act-right">' +
        '<div class="ts-act-card" data-num="01" data-title="AI Art Installation" data-desc="Real-time AI-generated visuals responding to crowd energy and voice prompts.">' +
        '<div class="ts-act-card-num">Activation 01</div>' +
        '<div class="ts-act-card-title">AI Art Installation</div>' +
        '<div class="ts-act-card-body">A large-format display running a live diffusion model fed by ambient audio and visitor voice input. Each second the canvas re-generated. No two visitors saw the same frame.</div>' +
        '</div>' +
        '<div class="ts-act-card" data-num="02" data-title="Prompt Challenge Arena" data-desc="Competitive prompt engineering battles on a live leaderboard.">' +
        '<div class="ts-act-card-num">Activation 02</div>' +
        '<div class="ts-act-card-title">Prompt Challenge Arena</div>' +
        '<div class="ts-act-card-body">Visitors competed in real-time prompt engineering battles. A live leaderboard updated every 90 seconds. Winners announced from the main stage.</div>' +
        '</div>' +
        '<div class="ts-act-card" data-num="03" data-title="AI Portrait Booth" data-desc="Instant AI-stylized portraits printed and handed to attendees in 60 seconds.">' +
        '<div class="ts-act-card-num">Activation 03</div>' +
        '<div class="ts-act-card-title">AI Portrait Booth</div>' +
        '<div class="ts-act-card-body">Point a camera, wait 60 seconds. Walk away with a printed AI-stylized portrait. The booth generated over 800 portraits across two days.</div>' +
        '</div>' +
        '<div class="ts-act-card" data-num="04" data-title="Future Wall" data-desc="A collaborative AI mural co-created by 5000 attendees in real time.">' +
        '<div class="ts-act-card-num">Activation 04</div>' +
        '<div class="ts-act-card-title">Future Wall</div>' +
        '<div class="ts-act-card-body">A collaborative canvas where each attendee added one AI-generated tile. By day two, 5,000 tiles had merged into a single mural displayed at the conference exit.</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      var processHTML =
        '<div class="ts-section ts-deeper" id="ts-process">' +
        '<span class="ts-section-label ts-reveal">96-Hour Sprint</span>' +
        '<h2 class="ts-h2 ts-reveal" style="transition-delay:0.1s">How we built a conference experience in four days.</h2>' +
        '<div class="ts-tl-wrap" id="ts-tl-wrap">' +
        '<svg class="ts-tl-svg" id="ts-tl-svg" preserveAspectRatio="none" viewBox="0 0 20 600"><path class="ts-tl-path" d="M10 0 L10 600"/><path class="ts-tl-path-fill" id="ts-tl-fill" d="M10 0 L10 600"/></svg>' +
        '<div class="ts-tl-item">' +
        '<div class="ts-tl-dot"></div>' +
        '<div class="ts-tl-time">Hour 0 - 8</div>' +
        '<div class="ts-tl-title">Brief Received. Strategy Locked.</div>' +
        '<div class="ts-tl-body">One call with YourStory. Four activation formats agreed on. Creative brief written and approved in the same session. No revisions on the concept.</div>' +
        '</div>' +
        '<div class="ts-tl-item">' +
        '<div class="ts-tl-dot"></div>' +
        '<div class="ts-tl-time">Hour 8 - 36</div>' +
        '<div class="ts-tl-title">Design System Built.</div>' +
        '<div class="ts-tl-body">Full visual identity created: type, color, motion principles, and component library. Every activation asset produced in parallel by a three-person team.</div>' +
        '</div>' +
        '<div class="ts-tl-item">' +
        '<div class="ts-tl-dot"></div>' +
        '<div class="ts-tl-time">Hour 36 - 72</div>' +
        '<div class="ts-tl-title">Tech Integrated. Tested on Real Hardware.</div>' +
        '<div class="ts-tl-body">AI models connected to custom interfaces. Portrait booth calibrated. Live leaderboard stress-tested. The Future Wall backend built from scratch and load-tested at simulated 200 concurrent users.</div>' +
        '</div>' +
        '<div class="ts-tl-item">' +
        '<div class="ts-tl-dot"></div>' +
        '<div class="ts-tl-time">Hour 72 - 96</div>' +
        '<div class="ts-tl-title">Live. No Critical Failures.</div>' +
        '<div class="ts-tl-body">Setup at venue. All four activations ran without failure across two days. Zero critical downtime. Five times higher social share rate than the event benchmark.</div>' +
        '</div>' +
        '</div>' +
        '</div>';

      var quoteHTML =
        '<div class="ts-result-quote">' +
        '<p class="ts-quote-text">"They delivered a fully functioning, visually stunning AI experience in 96 hours. The crowd engagement was unlike anything we\'ve seen at TechSparks before."</p>' +
        '<p class="ts-quote-attr">YourStory / TechSparks 2025 Organizing Team</p>' +
        '</div>';

      var screensHTML =
        '<div class="ts-section ts-dark" id="ts-screens">' +
        '<span class="ts-section-label ts-reveal">Work</span>' +
        '<h2 class="ts-h2 ts-reveal" style="transition-delay:0.1s">The visual output.</h2>';
      var screenSrcs = [imgs.s01, imgs.s02, imgs.s03, imgs.s04, imgs.s05, imgs.s06];
      var validScreens = [];
      for (var ssi = 0; ssi < screenSrcs.length; ssi++) {
        if (screenSrcs[ssi]) validScreens.push(screenSrcs[ssi]);
      }
      if (validScreens.length) {
        screensHTML += '<div class="ts-screens-grid">';
        for (var vsi = 0; vsi < validScreens.length; vsi++) {
          screensHTML += '<div class="ts-screen"><img src="' + validScreens[vsi] + '" alt="TechSparks screen ' + (vsi + 1) + '" loading="lazy"></div>';
        }
        screensHTML += '</div>';
      }
      screensHTML += '</div>';

      var videoHTML =
        '<div class="ts-section ts-deeper" id="ts-video">' +
        '<span class="ts-section-label ts-reveal">Event Film</span>' +
        '<h2 class="ts-h2 ts-reveal" style="transition-delay:0.1s">See it in motion.</h2>' +
        '<div class="ts-vid-wrap" id="ts-vid-wrap" style="margin-top:40px">' +
        '<div class="ts-vid-play" id="ts-vid-play"></div>' +
        '<div class="ts-vid-label">Click to play</div>' +
        '</div>' +
        '</div>';

      var ctaHTML =
        '<div class="ts-cta" id="ts-cta">' +
        '<span class="ts-cta-label">Get in Touch</span>' +
        '<h2 class="ts-cta-h ts-magnetic">Let\'s build the next one.</h2>' +
        '<p class="ts-cta-sub">Have a brief? A deadline? A blank canvas?</p>' +
        '<div class="ts-cta-links">' +
        '<a class="ts-cta-link ts-magnetic email-reveal" data-email="abhinavdoss@gmail.com" href="javascript:void(0)">Email</a>' +
        '<a class="ts-cta-link ts-magnetic" href="https://www.linkedin.com/in/abhinavdosskaushal/" target="_blank">LinkedIn</a>' +
        '<a class="ts-cta-link ts-magnetic" href="tel:+918728987295">+91 8728987295</a>' +
        '</div>' +
        '</div>';

      document.getElementById('cs-body').innerHTML =
        '<div id="ts-progress" style="position:sticky;top:0;z-index:100;height:3px;background:rgba(0,0,0,0.08);">' +
        '<div id="ts-prog-bar" style="height:100%;width:0%;background:#C41E3A;transition:width 0.1s linear;"></div>' +
        '</div>' +
        '<div class="ts-grain-overlay"></div>' +
        '<div class="ts">' + heroHTML + diagonalHTML + briefHTML + activationsHTML + processHTML + quoteHTML + screensHTML + videoHTML + ctaHTML + '</div>';

      requestAnimationFrame(function () {
        var csBody = document.getElementById('cs-body');
        if (!csBody) return;

        /* ── TextScramble (textContent only, no innerHTML, resolves in ~400ms) ── */
        var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@!%^';
        function TextScramble(el) {
          this.el = el;
          this.req = null;
        }
        TextScramble.prototype.setText = function (newText) {
          var el = this.el;
          var self = this;
          var frame = 0;
          var len = newText.length;
          cancelAnimationFrame(self.req);
          function update() {
            var out = '';
            var complete = 0;
            for (var i = 0; i < len; i++) {
              var start = Math.floor(i * 1.0);
              var end = start + 7;
              if (frame >= end) {
                complete++;
                out += newText[i];
              } else if (frame >= start) {
                out += CHARS[Math.floor(Math.random() * CHARS.length)];
              } else {
                out += ' ';
              }
            }
            el.textContent = out;
            if (complete < len) {
              frame++;
              self.req = requestAnimationFrame(update);
            } else {
              el.textContent = newText;
            }
          }
          frame = 0;
          self.req = requestAnimationFrame(update);
        };

        /* ── hero word reveal ── */
        var words = document.querySelectorAll('.ts-word');
        for (var wi = 0; wi < words.length; wi++) {
          (function (w, delay) {
            setTimeout(function () { w.classList.add('in'); }, 150 + delay);
          })(words[wi], wi * 100);
        }
        setTimeout(function () {
          var sub = document.getElementById('ts-subhead');
          if (sub) sub.classList.add('in');
        }, 450);

        /* ── spring physics counter ── */
        function springCounter(el, target) {
          var k = 180, c = 22, pos = 0, vel = 0, last = null;
          var suffix = el.dataset.suffix || '';
          function tick(now) {
            if (!last) last = now;
            var dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            vel += (-k * (pos - target) - c * vel) * dt;
            pos += vel * dt;
            var d = Math.round(Math.abs(pos));
            el.textContent = (target >= 1000 ? d.toLocaleString() : d) + suffix;
            if (Math.abs(pos - target) > 0.3 || Math.abs(vel) > 0.3) {
              requestAnimationFrame(tick);
            } else {
              el.textContent = (target >= 1000 ? target.toLocaleString() : target) + suffix;
            }
          }
          requestAnimationFrame(tick);
        }

        /* ── pre-declare scroll state vars (used in unified handler) ── */
        var progBar = document.getElementById('ts-prog-bar');
        var tlWrap = document.getElementById('ts-tl-wrap');
        var tlFill = document.getElementById('ts-tl-fill');
        var distortEl = document.getElementById('ts-hero');
        var totalDash = 600;
        var lastScrollTop = csBody.scrollTop;
        var lastScrollTime = Date.now();
        var distortTimer = null;
        if (tlFill) {
          tlFill.setAttribute('stroke-dasharray', totalDash);
          tlFill.setAttribute('stroke-dashoffset', totalDash);
        }

        /* ── unified scroll handler (one listener, all logic) ── */
        csBody.addEventListener('scroll', function () {
          var st = csBody.scrollTop;
          var now = Date.now();

          /* progress bar */
          if (progBar) {
            var max = csBody.scrollHeight - csBody.clientHeight;
            progBar.style.width = (max > 0 ? (st / max * 100) : 0) + '%';
          }

          /* SVG timeline draw */
          if (tlWrap && tlFill) {
            var rect = tlWrap.getBoundingClientRect();
            var bRect = csBody.getBoundingClientRect();
            var s = rect.top - bRect.top;
            var e = rect.bottom - bRect.top;
            var prog = Math.max(0, Math.min(1, (-s) / (e - s + 200)));
            tlFill.setAttribute('stroke-dashoffset', totalDash * (1 - prog));
          }

          /* velocity skew distortion on hero */
          if (distortEl) {
            var dt = now - lastScrollTime || 1;
            var vel = (st - lastScrollTop) / dt * 14;
            var skew = Math.max(-2.5, Math.min(2.5, vel * 0.35));
            distortEl.style.transform = 'skewY(' + skew + 'deg)';
            clearTimeout(distortTimer);
            distortTimer = setTimeout(function () {
              if (distortEl) distortEl.style.transform = 'skewY(0deg)';
            }, 180);
          }

          lastScrollTop = st;
          lastScrollTime = now;
        }, { passive: true });

        /* ── spring counter IO (one-shot) ── */
        var springNums = document.querySelectorAll('.ts-spring-n');
        var springIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              springCounter(entries[ei].target, parseInt(entries[ei].target.dataset.target, 10));
              springIO.unobserve(entries[ei].target);
            }
          }
        }, { threshold: 0.4 });
        for (var sni = 0; sni < springNums.length; sni++) springIO.observe(springNums[sni]);

        /* ── main bidirectional IO (reveals + labels) ── */
        var ioMain = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) entries[ei].target.classList.add('in');
            else entries[ei].target.classList.remove('in');
          }
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        var revealEls = document.querySelectorAll('.ts-reveal, .ts-section-label');
        for (var ri = 0; ri < revealEls.length; ri++) ioMain.observe(revealEls[ri]);

        /* ── Fisher-Yates random stagger for activation cards ── */
        var actCards = document.querySelectorAll('.ts-act-card');
        var cardArr = [];
        for (var aci = 0; aci < actCards.length; aci++) cardArr.push(actCards[aci]);
        var shuffled = cardArr.slice();
        for (var si = shuffled.length - 1; si > 0; si--) {
          var sj = Math.floor(Math.random() * (si + 1));
          var tmp = shuffled[si]; shuffled[si] = shuffled[sj]; shuffled[sj] = tmp;
        }
        var actIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              var idx = -1;
              for (var fi = 0; fi < shuffled.length; fi++) {
                if (shuffled[fi] === entries[ei].target) { idx = fi; break; }
              }
              (function (el, d) {
                setTimeout(function () { el.classList.add('in'); }, idx >= 0 ? idx * 100 : 0);
              })(entries[ei].target, idx);
              actIO.unobserve(entries[ei].target);
            }
          }
        }, { threshold: 0.15 });
        for (var aci2 = 0; aci2 < cardArr.length; aci2++) actIO.observe(cardArr[aci2]);

        /* ── split-screen sticky left panel update ── */
        var panelIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              var t = entries[ei].target;
              var numEl = document.getElementById('ts-act-left-num');
              var titleEl = document.getElementById('ts-act-left-title');
              var descEl = document.getElementById('ts-act-left-desc');
              if (numEl) numEl.textContent = t.getAttribute('data-num') || '01';
              if (titleEl) titleEl.textContent = t.getAttribute('data-title') || '';
              if (descEl) descEl.textContent = t.getAttribute('data-desc') || '';
            }
          }
        }, { threshold: 0.4, root: csBody });
        for (var pi = 0; pi < cardArr.length; pi++) panelIO.observe(cardArr[pi]);

        /* ── timeline IO (one-shot) ── */
        var tlItems = document.querySelectorAll('.ts-tl-item');
        var tlIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              entries[ei].target.classList.add('in');
              tlIO.unobserve(entries[ei].target);
            }
          }
        }, { threshold: 0.25 });
        for (var tli = 0; tli < tlItems.length; tli++) tlIO.observe(tlItems[tli]);

        /* ── screens grid IO (one-shot) ── */
        var screens = document.querySelectorAll('.ts-screen');
        var screenIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              entries[ei].target.classList.add('in');
              screenIO.unobserve(entries[ei].target);
            }
          }
        }, { threshold: 0.1 });
        for (var sci = 0; sci < screens.length; sci++) screenIO.observe(screens[sci]);

        /* ── video click-to-load ── */
        var vidWrap = document.getElementById('ts-vid-wrap');
        if (vidWrap) {
          function handleTsVidClick() {
            vidWrap.classList.add('loaded');
            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/t5OrR2-EQQo?autoplay=1&rel=0';
            iframe.allow = 'autoplay; fullscreen';
            iframe.allowFullscreen = true;
            vidWrap.appendChild(iframe);
            vidWrap.removeEventListener('click', handleTsVidClick);
          }
          vidWrap.addEventListener('click', handleTsVidClick);
        }

        /* ── magnetic cursor (80px proximity) ── */
        var magnetics = document.querySelectorAll('.ts-magnetic');
        if (magnetics.length) {
          csBody.addEventListener('mousemove', function (e) {
            for (var mi = 0; mi < magnetics.length; mi++) {
              var mel = magnetics[mi];
              var mrect = mel.getBoundingClientRect();
              var cx = mrect.left + mrect.width / 2;
              var cy = mrect.top + mrect.height / 2;
              var dx = e.clientX - cx;
              var dy = e.clientY - cy;
              var dist = Math.sqrt(dx * dx + dy * dy);
              mel.style.transform = dist < 80
                ? 'translate(' + (dx * 0.3) + 'px,' + (dy * 0.3) + 'px)'
                : '';
            }
          });
          csBody.addEventListener('mouseleave', function () {
            for (var mi = 0; mi < magnetics.length; mi++) magnetics[mi].style.transform = '';
          });
        }

        /* ── TextScramble on single-line h2 headings (one-shot) ── */
        var scrambleEls = document.querySelectorAll('.ts-h2');
        var scrambleIO = new IntersectionObserver(function (entries) {
          for (var ei = 0; ei < entries.length; ei++) {
            if (entries[ei].isIntersecting) {
              var sel = entries[ei].target;
              var txt = (sel.textContent || '').trim();
              if (txt) {
                var sc = new TextScramble(sel);
                sel.textContent = '';
                sc.setText(txt);
              }
              scrambleIO.unobserve(sel);
            }
          }
        }, { threshold: 0.35 });
        for (var seli = 0; seli < scrambleEls.length; seli++) {
          if (!scrambleEls[seli].querySelector('br')) {
            scrambleIO.observe(scrambleEls[seli]);
          }
        }

      });
    }


    function buildCS(p) {
      console.log("Building CS for:", p.id);
      const imgs = PROJECT_IMGS[p.id] || {};
      const imgKeys = Object.keys(imgs).filter(k => imgs[k]);
      const imgVals = imgKeys.map(k => imgs[k]);
      const heroSrc = imgs.hero || imgs.video01 || imgVals[0] || '';
      const extras = PROJECT_EXTRAS[p.id] || {};
      if (p.id === 'dell') { buildVerrisCS(p, imgs, extras); return; }
      if (p.id === 'techsparks') { buildTechSparksCS(p, imgs, extras); return; }

      /* ── helper: gallery grid with cinematic reveals ── */
      function galleryGrid(images, startIndex) {
        if (!images.length) return '';
        let g = '<div class="cs3-gallery">';
        images.forEach((src, i) => {
          const idx = startIndex + i;
          // Vary layout: first one wide, every 5th wide, rest normal
          let cls = 'cs3-gitem';
          if (i === 0 && images.length > 2) cls += ' hero-item';
          else if (i % 5 === 3 && images.length > 4) cls += ' wide';
          const delay = (0.05 + (i % 6) * 0.08).toFixed(2);
          g += `<div class="${cls}" style="--d:${delay}s"
               onclick="openLightbox('${imgKeys[idx]}','${p.id}')"
               data-gallery="true">
              <div class="g-reveal-bar" style="--d:${delay}s"></div>
              ${/\.(mp4|webm|ogg)$/i.test(src)
              ? `<video autoplay muted loop playsinline
                     style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;"
                     onerror="this.closest('.cs3-gitem').style.display='none'">
                     <source src="${src}">
                   </video>`
              : `<img src="${src}" alt="Project visual ${idx + 1}" loading="lazy"
                     onerror="this.closest('.cs3-gitem').style.display='none'">`}
              <span class="g-num">${String(idx + 1).padStart(2, '0')}</span>
            </div>`;
        });
        g += '</div>';
        return g;
      }

      /* ── hero ── */
      const heroHTML = `
    <div class="cs3-hero">
      ${heroSrc
          ? /\.(mp4|webm|ogg)$/i.test(heroSrc)
            ? `<video class="cs3-hero-img" autoplay muted loop playsinline
                style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;"
                oncanplay="this.classList.add('loaded')">
                <source src="${heroSrc}">
              </video>`
            : `<img class="cs3-hero-img" src="${heroSrc}" alt="${p.name}"
              onload="this.classList.add('loaded')" loading="eager">`
          : ''}
      <div class="cs3-hero-overlay"></div>
      <div class="cs3-hero-content">
        <div class="cs3-hero-eyebrow rev-l" style="--d:0.05s">${p.client} &nbsp;·&nbsp; ${p.year}</div>
        <h1 class="cs3-hero-title rev" style="--d:0.12s">${p.name.replace('→', '<em>→</em>')}</h1>
        <div class="cs3-hero-tags">
          ${(p.tags || []).map((t, i) => `<span class="cs3-hero-tag rev-scale" style="--d:${0.2 + i * 0.06}s">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

      /* ── meta bar ── */
      const metaHTML = `
    <div class="cs3-meta rev">
      <div class="cs3-meta-cell"><div class="cs3-meta-lbl">Client</div><div class="cs3-meta-val">${p.client}</div></div>
      <div class="cs3-meta-cell"><div class="cs3-meta-lbl">Year</div><div class="cs3-meta-val">${p.year}</div></div>
      <div class="cs3-meta-cell"><div class="cs3-meta-lbl">Category</div><div class="cs3-meta-val">${p.cat || p.folder}</div></div>
      <div class="cs3-meta-cell"><div class="cs3-meta-lbl">Scope</div><div class="cs3-meta-val">${p.ni || '—'}</div></div>
    </div>
  `;

      /* ── statement section ── */
      const stmtHTML = `
    <div class="cs3-sec" style="text-align:center;">
      <div class="cs3-sec-tag"><span class="sn">00</span> Overview</div>
      <p class="cs3-pull rev">${p.stmt || ''}</p>
    </div>
  `;

      /* ── challenge section ── */
      const chalHTML = p.chal ? `
    <div class="cs3-sec">
      <div class="cs3-sec-tag rev"><span class="sn">01</span> The Challenge</div>
      <div class="cs3-2col">
        <div>
          <p class="cs3-highlight rev-l" style="--d:0s">${p.chal}</p>
        </div>
        <div>
          <p class="cs3-p rev" style="--d:.08s">${p.chalB || ''}</p>
        </div>
      </div>
    </div>
  ` : '';

      /* ── first gallery (first 6 imgs after hero) ── */
      const gallery1Imgs = imgVals.slice(1, 7);
      const gallery1HTML = gallery1Imgs.length ? `
    <div class="cs3-sec no-pad">
      <div class="cs3-sec-tag rev"><span class="sn">02</span> Visual Work</div>
      ${galleryGrid(gallery1Imgs, 1)}
    </div>
  ` : '';

      /* ── approach section ── */
      const approachHTML = p.approach && p.approach.length ? `
    <div class="cs3-sec">
      <div class="cs3-sec-tag rev"><span class="sn">03</span> Approach</div>
      <div class="cs3-approach">
        ${p.approach.map((a, i) => `
          <div class="cs3-acard rev-scale" style="--d:${i * 0.1}s">
            <div class="cs3-acard-bg">${String(i + 1).padStart(2, '0')}</div>
            <div class="cs3-acard-icon">${a.i}</div>
            <div class="cs3-acard-title">${a.t}</div>
            <div class="cs3-acard-body">${a.b}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

      /* ── second gallery (imgs 7–13) ── */
      const gallery2Imgs = imgVals.slice(7, 14);
      const gallery2HTML = gallery2Imgs.length ? `
    <div class="cs3-sec no-pad">
      <div class="cs3-sec-tag rev"><span class="sn">04</span> Process & Details</div>
      ${galleryGrid(gallery2Imgs, 7)}
    </div>
  ` : '';

      /* ── results ── */
      const resultsHTML = p.results && p.results.length ? `
    <div class="cs3-sec">
      <div class="cs3-sec-tag rev"><span class="sn">05</span> Results & Impact</div>
      <div class="cs3-results">
        ${p.results.map((r, i) => `
          <div class="cs3-rcard rev-scale" style="--d:${i * 0.1}s">
            <div class="cs3-rn">${r.n}</div>
            <div class="cs3-rl">${r.l}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

      /* ── testimonial ── */
      const testHTML = p.test && p.test.q ? `
    <div class="cs3-test rev">
      <div class="cs3-test-q">${p.test.q}</div>
      <div class="cs3-test-a">${p.test.a}</div>
    </div>
  ` : '';

      /* ── third gallery (imgs 14+) ── */
      const gallery3Imgs = imgVals.slice(14);
      const gallery3HTML = gallery3Imgs.length ? `
    <div class="cs3-sec no-pad">
      <div class="cs3-sec-tag rev"><span class="sn">06</span> More Work</div>
      ${galleryGrid(gallery3Imgs, 14)}
    </div>
  ` : '';

      /* ── learnings ── */
      const learnHTML = p.learnings && p.learnings.length ? `
    <div class="cs3-sec">
      <div class="cs3-sec-tag rev"><span class="sn">07</span> What I Learned</div>
      <div class="cs3-learnings">
        ${p.learnings.map((l, i) => `
          <div class="cs3-litem rev" style="--d:${i * 0.1}s">
            <div class="cs3-lnum">${String(i + 1).padStart(2, '0')}</div>
            <div class="cs3-lbody">${l.t}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

      /* ── context ── */
      const contextHTML = extras.context ? `
    <div class="cs3-body rev">
      <div class="cs3-body-label">Context</div>
      <p class="cs3-body-text">${extras.context}</p>
    </div>
  ` : '';

      /* ── user pain points ── */
      const painHTML = extras.pain && extras.pain.length ? `
    <div class="cs3-pain rev">
      <div class="cs3-body-label">User Pain Points</div>
      <ul class="cs3-pain-list">
        ${extras.pain.map(pt => `<li>${pt}</li>`).join('')}
      </ul>
    </div>
  ` : '';

      /* ── trade-offs & decisions ── */
      const tradeoffsHTML = extras.tradeoffs && extras.tradeoffs.length ? `
    <div class="cs3-body rev">
      <div class="cs3-body-label">Trade-offs &amp; Decisions</div>
      <div class="cs3-tradeoffs">
        ${extras.tradeoffs.map(td => `
          <div class="cs3-tradeoff-item">
            <div class="cs3-tradeoff-decision">${td.decision}</div>
            <div class="cs3-tradeoff-reasoning">${td.reasoning}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

      /* ── impact ── */
      const impactHTML = extras.impact && extras.impact.length ? `
    <div class="cs3-impact rev">
      <div class="cs3-body-label">Impact</div>
      <div class="cs3-results-grid">
        ${extras.impact.map(r => `<div class="cs3-rn"><strong>${r.n}</strong><span>${r.l}</span></div>`).join('')}
      </div>
    </div>
  ` : '';

      /* ── next project ── */
      const idx = PROJECTS.findIndex(x => x.id === p.id);
      const nxt = PROJECTS[(idx + 1) % PROJECTS.length];
      const nextHTML = `
    <div class="cs3-next rev" onclick="openCS('${nxt.id}')">
      <div class="cs3-next-lbl">Up Next</div>
      <div class="cs3-next-title">${nxt.name} &nbsp;<em>↗</em></div>
      <div class="cs3-next-arr">View Case Study →</div>
    </div>
  `;

      /* ── assemble ── */
      document.getElementById('cs-pills').innerHTML = '';
      const progBar = '<div id="cs3-prog" style="position:sticky;top:0;left:0;width:0;height:2px;background:var(--accent);z-index:99;pointer-events:none;margin-bottom:-2px;transition:width .06s linear"></div>';
      document.getElementById('cs-body').innerHTML =
        progBar +
        '<div class="cs3-wrap">' +
        heroHTML + metaHTML + contextHTML + painHTML + stmtHTML + chalHTML +
        gallery1HTML + approachHTML + gallery2HTML +
        resultsHTML + impactHTML + testHTML + gallery3HTML +
        tradeoffsHTML + learnHTML + nextHTML +
        '</div>';

      /* ── kick off animations ── */
      requestAnimationFrame(() => {
        const csBody = document.getElementById('cs-body');
        const prog = document.getElementById('cs3-prog');

        // Scroll progress bar
        if (prog && csBody) {
          csBody.addEventListener('scroll', function () {
            const sh = csBody.scrollHeight - csBody.clientHeight;
            prog.style.width = (sh > 0 ? (csBody.scrollTop / sh * 100) : 0) + '%';
          }, { passive: true });
        }

        // Hero GSAP entrance
        if (window.gsap) {
          gsap.fromTo('.cs3-hero-content > *',
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: .12, duration: .9, ease: 'power3.out', delay: .1 }
          );
        }

        // IntersectionObserver for scroll reveals
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              if (e.target.dataset.gallery) e.target.classList.add('revealed');
              io.unobserve(e.target);
            }
          });
        }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll(
          '#cs-body .rev, #cs-body .rev-l, #cs-body .rev-clip, #cs-body .rev-scale, #cs-body [data-gallery]'
        ).forEach(el => io.observe(el));

        // Hero image scale-in
        const heroImg = document.querySelector('.cs3-hero-img');
        if (heroImg) setTimeout(() => heroImg.classList.add('loaded'), 50);

        // Metric counter animation for result cards
        const rcards = document.querySelectorAll('#cs-body .cs3-rn');
        if (rcards.length) {
          const countIO = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (!e.isIntersecting) return;
              countIO.unobserve(e.target);
              const el = e.target;
              const raw = el.textContent.trim();
              const numMatch = raw.match(/^(\d+(?:\.\d+)?)/);
              if (!numMatch) return;
              const target = parseFloat(numMatch[1]);
              const suffix = raw.slice(numMatch[1].length);
              const prefix = '';
              let start = null;
              const dur = 1200;
              function step(ts) {
                if (!start) start = ts;
                const pct = Math.min((ts - start) / dur, 1);
                const ease = 1 - Math.pow(1 - pct, 3);
                const val = Math.round(target * ease);
                el.textContent = prefix + (target >= 1000 ? val.toLocaleString() : val) + suffix;
                if (pct < 1) requestAnimationFrame(step);
                else el.textContent = prefix + (target >= 1000 ? target.toLocaleString() : target) + suffix;
              }
              requestAnimationFrame(step);
            });
          }, { threshold: 0.5 });
          rcards.forEach(el => countIO.observe(el));
        }
      });
    }


    /* ══ WORLD CANVAS ══ */
    function initWorld() {
      if (worldReady) return; worldReady = true;
      const cv = document.getElementById('wcanv'), ctx = cv.getContext('2d');
      const wrap = document.getElementById('vw');
      let W, H, mx = -9999, my = -9999, panX = 0, panY = 0, isPan = false, psx, psy, pox = 0, poy = 0, hNode = null;

      // Client nodes
      const nodes = WNODES.map((n, i) => ({ ...n, px: 0, py: 0, al: 0, pulse: Math.random() * Math.PI * 2, idx: i }));

      // ── 220 SYNAPSE PARTICLES across 3 depth layers ───────────────────
      const SYN = 220;
      const syn = Array.from({ length: SYN }, (_, i) => ({
        x: Math.random(), y: Math.random(),
        vx: (Math.random() - .5) * .00035, vy: (Math.random() - .5) * .00035,
        r: Math.random() * 2 + .3,
        al: Math.random() * .7 + .2,
        phase: Math.random() * Math.PI * 2,
        depth: Math.random(), // 0=far(dim), 1=near(bright)
        layer: Math.floor(Math.random() * 4)
      }));

      // ── SIGNAL SPARKS ─────────────────────────────────────────────────
      const sparks = [];
      const spawnSpark = (f, t) => sparks.push({ f, t, p: 0, spd: .003 + Math.random() * .007 });
      for (let i = 0; i < 12; i++) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = Math.floor(Math.random() * nodes.length);
        if (a !== b) spawnSpark(a, b);
      }

      // ── WAVE RIPPLES on click ─────────────────────────────────────────
      const ripples = [];
      wrap.addEventListener('click', e => {
        ripples.push({ x: e.clientX, y: e.clientY, r: 0, al: 1 });
      });

      let orbitAngle = 0;
      const panel = document.getElementById('wpanel');

      wrap.addEventListener('mousedown', e => { isPan = true; psx = e.clientX; psy = e.clientY; e.preventDefault() });
      document.addEventListener('mouseup', () => { if (isPan) { isPan = false; pox = panX; poy = panY } });
      document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        if (isPan) { panX = pox + (e.clientX - psx); panY = poy + (e.clientY - psy) }
      });

      (function frame() {
        W = cv.width = wrap.offsetWidth || 900;
        H = cv.height = wrap.offsetHeight || 600;
        orbitAngle += .006;
        const t = Date.now();
        hNode = null;

        // ── DARK BACKGROUND with faint radial centre glow ─────────────
        ctx.fillStyle = '#0A0805';
        ctx.fillRect(0, 0, W, H);

        // Warm amber glow at centre — the "brain core"
        const cx2 = W / 2 + panX * .08, cy2 = H / 2 + panY * .08;
        const cg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.max(W, H) * .65);
        cg.addColorStop(0, 'rgba(200,150,60,.07)');
        cg.addColorStop(.4, 'rgba(200,120,40,.03)');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, W, H);

        // ── UPDATE NODES ──────────────────────────────────────────────
        nodes.forEach((n, i) => {
          n.al = Math.min(1, n.al + .007);
          n.pulse += .016 + i * .0018;
          n.px = n.x * W + panX + Math.sin(t * .00022 + i * 1.1) * 14 + Math.cos(t * .00016 + i * .7) * 7;
          n.py = n.y * H + panY + Math.cos(t * .00018 + i * 1.3) * 10 + Math.sin(t * .00013 + i * .9) * 6;
          if (Math.hypot(mx - n.px, my - n.py) < 44) hNode = n;
        });

        // ── UPDATE SYNAPSES ───────────────────────────────────────────
        syn.forEach(s => {
          s.x += s.vx + Math.sin(t * .00009 + s.phase) * .00015;
          s.y += s.vy + Math.cos(t * .00007 + s.phase) * .00013;
          if (s.x < -.02) s.x = 1.02; if (s.x > 1.02) s.x = -.02;
          if (s.y < -.02) s.y = 1.02; if (s.y > 1.02) s.y = -.02;
        });

        // ── SYNAPSE WEB — fine threads ────────────────────────────────
        for (let i = 0; i < syn.length; i++) {
          const si = syn[i];
          const sx = si.x * W + panX * .04, sy = si.y * H + panY * .04;
          for (let j = i + 1; j < syn.length; j++) {
            const sj = syn[j];
            const ex = sj.x * W + panX * .04, ey = sj.y * H + panY * .04;
            const d = Math.hypot(sx - ex, sy - ey);
            if (d < 80) {
              const al = (1 - d / 80) * .06 * si.depth * sj.depth;
              ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
              ctx.strokeStyle = `rgba(200,169,110,${al})`;
              ctx.lineWidth = .25; ctx.stroke();
            }
          }
        }

        // ── NODE AXON CONNECTIONS — bright gold gradient lines ────────
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(nodes[i].px - nodes[j].px, nodes[i].py - nodes[j].py);
            const maxD = 260;
            if (d < maxD) {
              const al = (1 - d / maxD) * .22 * Math.min(nodes[i].al, nodes[j].al);
              const lg = ctx.createLinearGradient(nodes[i].px, nodes[i].py, nodes[j].px, nodes[j].py);
              lg.addColorStop(0, `rgba(200,169,110,${al * 1.8})`);
              lg.addColorStop(.5, `rgba(255,200,100,${al * .9})`);
              lg.addColorStop(1, `rgba(200,169,110,${al * 1.8})`);
              ctx.beginPath(); ctx.moveTo(nodes[i].px, nodes[i].py); ctx.lineTo(nodes[j].px, nodes[j].py);
              ctx.strokeStyle = lg; ctx.lineWidth = .5 + al * 4; ctx.stroke();
            }
          }
        }

        // ── DENDRITE THREADS — synapse to nearest node ────────────────
        syn.forEach(s => {
          const sx = s.x * W + panX * .04, sy = s.y * H + panY * .04;
          let best = null, bestD = 9999;
          nodes.forEach(n => { const d = Math.hypot(sx - n.px, sy - n.py); if (d < bestD) { bestD = d; best = n } });
          if (best && bestD < 140) {
            const al = (1 - bestD / 140) * .09 * s.depth * best.al;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(best.px, best.py);
            ctx.strokeStyle = `rgba(255,200,130,${al})`; ctx.lineWidth = .2; ctx.stroke();
          }
        });

        // ── MOUSE PULL LINES — cursor attracts nearby nodes ───────────
        nodes.forEach(n => {
          const d = Math.hypot(mx - n.px, my - n.py);
          if (d < 220) {
            const al = (1 - d / 220) * .35 * n.al;
            ctx.beginPath(); ctx.moveTo(n.px, n.py); ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(200,169,110,${al})`; ctx.lineWidth = .9; ctx.stroke();
          }
        });

        // ── SIGNAL SPARKS ─────────────────────────────────────────────
        for (let k = sparks.length - 1; k >= 0; k--) {
          const sp = sparks[k];
          sp.p += sp.spd;
          if (sp.p >= 1) { sparks.splice(k, 1); continue }
          const fn = nodes[sp.f], tn = nodes[sp.t];
          const sx2 = fn.px + (tn.px - fn.px) * sp.p;
          const sy2 = fn.py + (tn.py - fn.py) * sp.p;
          const fade = Math.sin(sp.p * Math.PI);
          // Outer glow
          ctx.beginPath(); ctx.arc(sx2, sy2, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,200,80,${fade * .12})`; ctx.fill();
          // Mid glow
          ctx.beginPath(); ctx.arc(sx2, sy2, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,220,120,${fade * .5})`; ctx.fill();
          // Core
          ctx.beginPath(); ctx.arc(sx2, sy2, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,200,${fade * .95})`; ctx.fill();
        }
        // Spawn sparks
        if (Math.random() < .06) {
          const elig = nodes.filter(n => n.al > .4);
          if (elig.length > 1) {
            const a = elig[Math.floor(Math.random() * elig.length)].idx;
            const b = nodes[Math.floor(Math.random() * nodes.length)].idx;
            if (a !== b && sparks.length < 30) spawnSpark(a, b);
          }
        }

        // ── DRAW SYNAPSE PARTICLES ────────────────────────────────────
        syn.forEach(s => {
          const sx = s.x * W + panX * .04, sy = s.y * H + panY * .04;
          const pulse = (Math.sin(t * .0012 + s.phase) + 1) / 2;
          const brightness = .25 + s.depth * .45 + pulse * .2;
          const cols = [
            `rgba(200,169,110,${brightness * s.al})`,
            `rgba(255,200,100,${brightness * s.al * .7})`,
            `rgba(180,160,100,${brightness * s.al * .8})`,
            `rgba(240,220,160,${brightness * s.al * .5})`
          ];
          const r2 = s.r * (1 + pulse * .4 + s.depth * .4);
          ctx.beginPath(); ctx.arc(sx, sy, r2, 0, Math.PI * 2);
          ctx.fillStyle = cols[s.layer]; ctx.fill();
          // Halo on brighter particles
          if (s.depth > .65) {
            ctx.beginPath(); ctx.arc(sx, sy, r2 + 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,169,110,${brightness * s.al * .12})`; ctx.fill();
          }
        });

        // ── DRAW CLIENT NODES ─────────────────────────────────────────
        nodes.forEach(n => {
          const isH = n === hNode;
          const pf = (Math.sin(n.pulse) + 1) / 2;
          const r = isH ? n.r * 2.6 : n.r * (1 + pf * .2);

          // Deep glow halo
          if (n.al > .2) {
            const gr = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, r * 4 + pf * 6);
            gr.addColorStop(0, n.c.replace(/[\d.]+\)$/, `${n.al * .35})`));
            gr.addColorStop(.5, n.c.replace(/[\d.]+\)$/, `${n.al * .12})`));
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(n.px, n.py, r * 4 + pf * 6, 0, Math.PI * 2);
            ctx.fillStyle = gr; ctx.fill();
          }

          // Hover: 3 dashed orbit rings
          if (isH) {
            [1, 1.6, 2.3].forEach((mult, ri) => {
              const or = r + 10 * mult;
              ctx.save(); ctx.translate(n.px, n.py); ctx.rotate(orbitAngle * (1 + ri * .4));
              ctx.beginPath(); ctx.arc(0, 0, or, 0, Math.PI * 2);
              ctx.setLineDash([4, 6]);
              ctx.strokeStyle = `rgba(200,169,110,${.22 - ri * .06})`;
              ctx.lineWidth = 1; ctx.stroke();
              ctx.setLineDash([]); ctx.restore();
            });
          }

          // Core node
          ctx.beginPath(); ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
          ctx.fillStyle = n.c.replace(/[\d.]+\)$/, `${n.al * (isH ? .98 : .78)})`);
          ctx.fill();

          // Rim highlight
          ctx.beginPath(); ctx.arc(n.px, n.py, r, 0, Math.PI * 2);
          ctx.strokeStyle = n.c.replace(/[\d.]+\)$/, `${n.al * .4})`);
          ctx.lineWidth = 1.5; ctx.stroke();

          // Specular dot
          ctx.beginPath(); ctx.arc(n.px - r * .3, n.py - r * .3, r * .25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${n.al * .2})`; ctx.fill();

          // Label
          if (isH || n.al > .4) {
            const ta = isH ? n.al : Math.min(1, (n.al - .4) / .6);
            ctx.font = `${isH ? 600 : 400} ${isH ? 12 : 9}px 'DM Mono',monospace`;
            ctx.fillStyle = `rgba(255,240,210,${ta * (isH ? .95 : .65)})`;
            ctx.textAlign = 'center';
            ctx.fillText(n.l, n.px, n.py - r - 9);
            if (isH) {
              ctx.font = "8px 'DM Mono',monospace";
              ctx.fillStyle = 'rgba(200,169,110,.85)';
              ctx.fillText(n.s, n.px, n.py - r - 22);
            }
          }
        });

        // ── CLICK RIPPLES ─────────────────────────────────────────────
        for (let k = ripples.length - 1; k >= 0; k--) {
          const rp = ripples[k];
          rp.r += 4; rp.al -= .025;
          if (rp.al <= 0) { ripples.splice(k, 1); continue }
          ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,169,110,${rp.al * .5})`; ctx.lineWidth = 1; ctx.stroke();
        }

        // ── CURSOR DOT ────────────────────────────────────────────────
        if (mx > 0 && mx < W + 100) {
          ctx.beginPath(); ctx.arc(mx, my, 14 + Math.sin(t * .004) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(200,169,110,.2)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,169,110,.5)'; ctx.fill();
        }

        // Panel
        if (hNode) {
          panel.classList.add('on');
          document.getElementById('wp-nm').textContent = hNode.l;
          document.getElementById('wp-ct').textContent = hNode.s;
          document.getElementById('wp-ds').textContent = 'Part of the ADK body of work — a decade of creative direction.';
        } else panel.classList.remove('on');

        requestAnimationFrame(frame);
      })();
    }


    /* ══ LAB AI TOOLS ══ */

    /* ══ LAB OVERLAY ENGINE ══ */
    let curLabTool = null;
    let lastOutputJSON = '';

    function openLab(toolName) {
      const tool = LAB_TOOLS[toolName];
      if (!tool) return;
      curLabTool = tool;
      lastOutputJSON = '';

      // Set header
      document.getElementById('labo-ttl').textContent = toolName;
      document.getElementById('labo-g').textContent = tool.g;
      document.getElementById('labo-n').textContent = toolName;
      document.getElementById('labo-b').textContent = tool.b;
      document.getElementById('labo-d').textContent = tool.d;
      document.getElementById('labo-idle-g').textContent = tool.g;

      // Build fields
      const fieldsEl = document.getElementById('labo-fields');
      fieldsEl.innerHTML = '';
      tool.fields.forEach(f => {
        const wrap = document.createElement('div');
        if (f.type === 'ta') {
          wrap.innerHTML = `<div class="lf-lbl">${f.lbl}</div><textarea class="lf-ta" id="${f.id}" placeholder="${f.ph}" rows="3"></textarea>`;
        } else if (f.type === 'in') {
          wrap.innerHTML = `<div class="lf-lbl">${f.lbl}</div><input class="lf-in" id="${f.id}" placeholder="${f.ph}" type="text">`;
        } else if (f.type === 'sel') {
          wrap.innerHTML = `<div class="lf-lbl">${f.lbl}</div><select class="lf-sel" id="${f.id}">${f.opts.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
        }
        fieldsEl.appendChild(wrap);
        // Hover on inputs
        const inp = wrap.querySelector('input,textarea,select');
        if (inp) hov(inp);
      });

      // Run button
      const runBtn = document.createElement('button');
      runBtn.className = 'labo-run';
      runBtn.textContent = `Run ${tool.b} →`;
      runBtn.onclick = runLabTool;
      fieldsEl.appendChild(runBtn);
      hov(runBtn);

      // Reset output
      resetLabOutput();

      // Open overlay
      const o = document.getElementById('labo');
      o.classList.add('on');
      void o.offsetHeight;
      o.classList.add('vis');
    }

    function closeLabo() {
      const o = document.getElementById('labo');
      o.classList.remove('vis');
      setTimeout(() => { o.classList.remove('on'); updateDockCount(); }, 380);
    }

    function resetLabOutput() {
      document.getElementById('labo-idle').style.display = 'flex';
      document.getElementById('labo-load').classList.remove('on');
      document.getElementById('labo-out').classList.remove('on');
      document.getElementById('labo-out').innerHTML = '';
    }

    function setLabLoading(on) {
      document.getElementById('labo-idle').style.display = on ? 'none' : 'flex';
      const loadEl = document.getElementById('labo-load');
      if (on) {
        loadEl.classList.add('on');
        document.getElementById('labo-load-t').textContent = curLabTool.loadMsg || 'Processing...';
      } else {
        loadEl.classList.remove('on');
      }
    }

    async function runLabTool() {
      if (!curLabTool) return;
      const btn = document.querySelector('.labo-run');
      if (btn) btn.disabled = true;

      // Gather field values
      const fieldVals = {};
      curLabTool.fields.forEach(f => {
        const el = document.getElementById(f.id);
        fieldVals[f.id] = el ? el.value.trim() : '';
      });

      // Check required
      const empty = curLabTool.fields.filter(f => f.type !== 'sel' && !fieldVals[f.id]);
      if (empty.length) {
        const out = document.getElementById('labo-out');
        out.innerHTML = `<div class="lo-error">Fill in all fields before running.</div>`;
        out.classList.add('on');
        document.getElementById('labo-idle').style.display = 'none';
        if (btn) btn.disabled = false;
        return;
      }

      setLabLoading(true);
      const prompt = curLabTool.buildPrompt(fieldVals);

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        const _cont = data.content; const text = (_cont && _cont.find(function (b) { return b.type === 'text' })) ? _cont.find(function (b) { return b.type === 'text' }).text : '';
        // Strip any markdown fences
        const clean = text.replace(/```json|```/gi, '').trim();
        lastOutputJSON = clean;

        setLabLoading(false);
        const outEl = document.getElementById('labo-out');
        outEl.innerHTML = curLabTool.renderOutput(clean);
        outEl.classList.add('on');
        document.getElementById('labo-idle').style.display = 'none';
        // Hover output buttons
        outEl.querySelectorAll('.lo-copy-btn').forEach(hov);
      } catch (err) {
        setLabLoading(false);
        const outEl = document.getElementById('labo-out');
        outEl.innerHTML = `<div class="lo-error">API error. Check connection and try again.<br><span style="opacity:.5;font-size:9px">${err.message}</span></div>`;
        outEl.classList.add('on');
        document.getElementById('labo-idle').style.display = 'none';
      }
      if (btn) btn.disabled = false;
    }

    function copyOutput() {
      if (!lastOutputJSON) return;
      if (navigator.clipboard) navigator.clipboard.writeText(lastOutputJSON).catch(function () { });
    }

    function copyLabCSS() {
      try {
        const d = JSON.parse(lastOutputJSON);
        if (navigator.clipboard) navigator.clipboard.writeText(d.cssVariables || '').catch(function () { });
      } catch (e) { }
    }

    document.getElementById('labo-close').addEventListener('click', closeLabo);
    hov(document.getElementById('labo-close'));

    /* ══ LAB — WIRE CARDS TO TOOLS ══ */
    const lgrid = document.getElementById('lgrid');
    LAB.forEach(a => {
      const el = document.createElement('div');
      el.className = 'la';
      el.innerHTML = `<div class="la-g">${a.g}</div><div class="la-n">${a.n}</div><div class="la-b">${a.b}</div><div class="la-d">${a.d}</div><div class="la-act">Launch Tool</div>`;
      lgrid.appendChild(el);
      hov(el);
      el.addEventListener('click', () => openLab(a.n));
    });


    /* ══ WORLD OVERLAY ══ */
    const wo = document.getElementById('wo');
    let scN = 0;
    document.getElementById('wo-trigger').addEventListener('click', openWO); hov(document.getElementById('wo-trigger'));
    let kb = []; document.addEventListener('keydown', e => { kb.push(e.keyCode); if (kb.length > 10) kb.shift(); if (kb.join(',') === ([38, 38, 40, 40, 37, 39, 37, 39, 66, 65]).join(',')) openWO() });
    function openWO() { buildWOCards(); wo.classList.add('on'); void wo.offsetHeight; wo.classList.add('vis') }
    function closeWO() { wo.classList.remove('vis'); setTimeout(() => wo.classList.remove('on'), 520) }
    document.getElementById('wo-x').addEventListener('click', closeWO);
    function buildWOCards() {
      const strip = document.getElementById('wo-strip'); if (strip.children.length > 0) return;
      PROJECTS.forEach((p, i) => { 
        const c = document.createElement('div'); 
        c.className = 'wc'; 
        c.dataset.cat = p.cat; 
        const imgs = PROJECT_IMGS[p.id] || {};
        const thumb = imgs.hero || imgs.video01 || imgs.thumb || imgs.detail1 || '';
        const isVid = thumb.toLowerCase().endsWith('.mp4');
        const media = isVid 
          ? `<video autoplay muted loop playsinline class="wc-media"><source src="${thumb}"></video>`
          : (thumb ? `<img src="${thumb}" class="wc-media">` : `<div class="wc-bg">${p.folder.slice(0, 1)}</div>`);
        
        c.innerHTML = `${media}<div class="wc-n">0${i + 1}</div><div class="wc-cat">${p.cat}</div><div class="wc-nm">${p.name}</div><div class="wc-cl">${p.client}</div>`; 
        strip.appendChild(c); 
        hov(c);
        c.addEventListener('click', () => { closeWO(); openWin(p.id); });
      });
      let d = false, sx, sl = 0, cl = 0;
      if (window.gsap) gsap.fromTo('.wc', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
      strip.addEventListener('mousedown', e => { d = true; sx = e.clientX; strip.style.cursor = 'grabbing' });
      document.addEventListener('mousemove', e => { if (!d) return; cl = sl + (e.clientX - sx); strip.style.left = (44 + cl) + 'px' });
      document.addEventListener('mouseup', () => { if (d) { d = false; sl = cl; strip.style.cursor = 'grab' } });
      strip.addEventListener('touchstart', e => { d = true; sx = e.touches[0].clientX }, { passive: true });
      strip.addEventListener('touchmove', e => { if (!d) return; cl = sl + (e.touches[0].clientX - sx); strip.style.left = (44 + cl) + 'px' }, { passive: true });
      strip.addEventListener('touchend', () => { d = false; sl = cl });
    }
    document.querySelectorAll('.wf').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.wf').forEach(b => b.classList.remove('on')); btn.classList.add('on'); const f = btn.dataset.f; document.querySelectorAll('.wc').forEach(c => { const ok = f === 'all' || c.dataset.cat === f; c.style.opacity = ok ? '1' : '0.1'; c.style.pointerEvents = ok ? 'all' : 'none' }) }) });
    const TITEMS = ['Creative Director', 'Brand Strategist', 'Art Director', 'DesignOps', '10 Years Active', '100+ Clients', '300+ Projects', 'Bangalore · Open to Global', 'Dell · Siemens · Amazon · Flipkart · GAIL'];
    const TH = TITEMS.map(t => `<span class="wo-titem">${t} ·</span>`).join('');
    document.getElementById('t1').innerHTML = TH; document.getElementById('t2').innerHTML = TH;

    /* ══ INIT ══ */
    buildFolders();

    function animateHero() {
      const h1 = document.querySelector('.h-h1');
      if (!h1) return;

      // Clean up any existing split if called twice
      if (h1.dataset.split) return;
      h1.dataset.split = 'true';

      // Word & Character splitter that prevents mid-word breaks
      const traverse = (node) => {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const frag = document.createDocumentFragment();
          const words = text.split(' ');

          words.forEach((word, i) => {
            if (word.length === 0) {
              if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
              return;
            }

            // Wrap word to prevent breaking across lines
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';

            for (let j = 0; j < word.length; j++) {
              const span = document.createElement('span');
              span.textContent = word[j];
              span.style.display = 'inline-block';
              span.style.opacity = '0';
              span.style.transform = 'translateY(30px) rotate(-5deg)';
              span.className = 'char-anim';
              wordSpan.appendChild(span);
            }

            frag.appendChild(wordSpan);
            if (i < words.length - 1) {
              frag.appendChild(document.createTextNode(' '));
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.nodeName !== 'BR' && !node.classList.contains('char-anim')) {
          Array.from(node.childNodes).forEach(traverse);
        }
      };

      Array.from(h1.childNodes).forEach(traverse);

      if (window.gsap) {
        gsap.fromTo('.h-name, .h-ey', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.2 });
        gsap.to('.char-anim', { opacity: 1, y: 0, rotation: 0, duration: 0.6, stagger: 0.015, ease: 'back.out(1.2)', delay: 0.4 });
        gsap.fromTo('.h-sub', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8, delay: 1.2, ease: 'power2.out' });
        gsap.fromTo('.h-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 1.4, ease: 'power2.out' });
      }
    }
    animateHero();

    hovAll('.t-tab,.dk,.cs-nb,.wf');



    /* ══ LIGHTBOX ══ */
    var lbCurProject = null;
    var lbCurKey = null;
    var lbAllKeys = [];

    function openLightbox(imgKey, projectId, caption) {
      var imgs = PROJECT_IMGS[projectId] || {};
      lbCurProject = projectId;
      lbCurKey = imgKey;
      lbAllKeys = Object.keys(imgs).filter(function (k) { return imgs[k]; });
      var src = imgs[imgKey];
      if (!src) return;
      
      var lbImg = document.getElementById('lb-img');
      var lbVid = document.getElementById('lb-vid');
      if (!lbVid) {
        lbVid = document.createElement('video');
        lbVid.id = 'lb-vid';
        lbVid.autoplay = true;
        lbVid.controls = true;
        lbVid.loop = true;
        lbVid.style.display = 'none';
        lbVid.style.maxWidth = '90vw';
        lbVid.style.maxHeight = '80vh';
        lbImg.parentNode.insertBefore(lbVid, lbImg);
      }

      if (src.toLowerCase().endsWith('.mp4')) {
        lbImg.style.display = 'none';
        lbVid.src = src;
        lbVid.style.display = 'block';
      } else {
        lbVid.style.display = 'none';
        lbVid.pause();
        lbImg.src = src;
        lbImg.style.display = 'block';
      }
      
      document.getElementById('lb-cap').textContent = caption || '';
      var ov = document.getElementById('lb-overlay');
      ov.classList.add('on');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      document.getElementById('lb-overlay').classList.remove('on');
      document.getElementById('lb-img').src = '';
      document.body.style.overflow = '';
      lbCurKey = null;
    }

    function lbNav(dir) {
      if (!lbCurKey || !lbCurProject) return;
      var idx = lbAllKeys.indexOf(lbCurKey);
      if (idx < 0) return;
      var newIdx = (idx + dir + lbAllKeys.length) % lbAllKeys.length;
      var newKey = lbAllKeys[newIdx];
      var imgs = PROJECT_IMGS[lbCurProject] || {};
      lbCurKey = newKey;
      var src = imgs[newKey];
      
      var lbImg = document.getElementById('lb-img');
      var lbVid = document.getElementById('lb-vid');
      if (src.toLowerCase().endsWith('.mp4')) {
        lbImg.style.display = 'none';
        lbVid.src = src;
        lbVid.style.display = 'block';
        lbVid.play();
      } else {
        lbVid.style.display = 'none';
        lbVid.pause();
        lbImg.src = src;
        lbImg.style.display = 'block';
      }
      document.getElementById('lb-cap').textContent = (caption || newKey).replace(/([A-Z])/g, ' $1').replace(/(\d+)/g, ' $1').trim().toLowerCase();
    }

    document.addEventListener('keydown', function (e) {
      var ov = document.getElementById('lb-overlay');
      if (!ov.classList.contains('on')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbNav(-1);
      if (e.key === 'ArrowRight') lbNav(1);
    });


    /* ══ PIXEL PRELOADER TRANSITION — CINEMATIC SCATTER ══ */
    var _pxBusy = false;
    function pixelTransition(cb) {
      if (_pxBusy) { cb(); return; }
      _pxBusy = true;

      var pxLoad = document.getElementById('px-load');
      var cv = document.getElementById('px-cv');
      var ctx = cv.getContext('2d');
      var W = window.innerWidth, H = window.innerHeight;
      cv.width = W; cv.height = H;

      var SZ = 34;                            // block size
      var COLS = Math.ceil(W / SZ);
      var ROWS = Math.ceil(H / SZ);
      var TW = W / COLS, TH = H / ROWS;
      var COLORS = ['#1A1916', '#1E1D1A', '#242220', '#161513'];

      /* Build tiles with fully random scatter delays (no wave) */
      var tiles = [];
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          /* Scatter direction: each tile has a random outward vector */
          var nx = (c / (COLS - 1)) * 2 - 1;   // -1 … +1
          var ny = (r / (ROWS - 1)) * 2 - 1;
          var len = Math.sqrt(nx * nx + ny * ny) || 1;
          tiles.push({
            c: c, r: r,
            coverDelay: Math.random() * 420,    // fully random, not wave
            speed: 0.75 + Math.random() * 0.5,
            dx: (nx / len) + (Math.random() - 0.5) * 0.6,
            dy: (ny / len) + (Math.random() - 0.5) * 0.6,
            col: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }
      }

      var TILE_IN = 90;   // ms each tile takes to appear
      var TILE_OUT = 75;   // ms each tile takes to scatter away

      pxLoad.classList.add('on');
      var start = null;

      /* ── PHASE 1: COVER — tiles fade+scale in from random delays ── */
      function animCover(ts) {
        if (!start) start = ts;
        var t = ts - start;
        ctx.clearRect(0, 0, W, H);
        var allDone = true;

        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          var elapsed = t - tile.coverDelay;
          var raw = Math.max(0, Math.min(1, elapsed / (TILE_IN * tile.speed)));
          /* Ease-out cubic */
          var prog = 1 - Math.pow(1 - raw, 3);
          if (raw < 1) allDone = false;
          if (prog > 0.01) {
            var cx = tile.c * TW + TW * 0.5;
            var cy = tile.r * TH + TH * 0.5;
            var sz = TW * prog;
            ctx.globalAlpha = Math.min(1, prog * 1.6);
            ctx.fillStyle = tile.col;
            ctx.fillRect(cx - sz * 0.5, cy - sz * 0.5, sz, sz);
          }
        }
        ctx.globalAlpha = 1;

        if (!allDone) {
          requestAnimationFrame(animCover);
        } else {
          /* Screen fully covered — load new content NOW */
          cb();
          /* Bypass #cso's own opacity transition so page is instantly visible underneath */
          var cso = document.getElementById('cso');
          if (cso && cso.classList.contains('on')) {
            cso.style.transition = 'none';
            cso.style.opacity = '1';
            void cso.offsetHeight; // flush style
          }
          start = null;
          requestAnimationFrame(animReveal);
        }
      }

      /* ── PHASE 2: REVEAL — tiles scatter outward and fade away ── */
      function animReveal(ts) {
        if (!start) start = ts;
        var t = ts - start;
        ctx.clearRect(0, 0, W, H);
        var allDone = true;

        for (var i = 0; i < tiles.length; i++) {
          var tile = tiles[i];
          /* Stagger reveal by a fraction of the cover delay (tiles scatter in waves) */
          var elapsed = t - tile.coverDelay * 0.18;
          var raw = Math.max(0, Math.min(1, elapsed / (TILE_OUT * tile.speed)));
          /* Ease-in quad — starts slow, accelerates outward */
          var prog = raw * raw;
          var alpha = 1 - raw;
          if (raw < 1) allDone = false;
          if (alpha > 0.01) {
            var cx = tile.c * TW + TW * 0.5;
            var cy = tile.r * TH + TH * 0.5;
            /* Scatter: tiles fly outward from their position */
            var scatter = prog * 55;
            var sx = cx + tile.dx * scatter;
            var sy = cy + tile.dy * scatter;
            var sz = TW * (1 - prog * 0.4);
            ctx.globalAlpha = alpha * alpha; /* quadratic fade — crisper reveal */
            ctx.fillStyle = tile.col;
            ctx.fillRect(sx - sz * 0.5, sy - sz * 0.5, sz, sz);
          }
        }
        ctx.globalAlpha = 1;

        if (!allDone) {
          requestAnimationFrame(animReveal);
        } else {
          /* Restore #cso transition for future use */
          var cso = document.getElementById('cso');
          if (cso) cso.style.transition = '';
          pxLoad.classList.remove('on');
          ctx.clearRect(0, 0, W, H);
          _pxBusy = false;
        }
      }

      requestAnimationFrame(animCover);
    }

    /* Email Reveal Interaction */
    document.addEventListener('click', function (e) {
      var reveal = e.target.closest('.email-reveal');
      if (reveal && reveal.getAttribute('href') === 'javascript:void(0)') {
        var email = reveal.getAttribute('data-email');
        reveal.textContent = email;
        reveal.href = 'mailto:' + email;
        reveal.classList.add('revealed');
        e.preventDefault();
      }
    });


