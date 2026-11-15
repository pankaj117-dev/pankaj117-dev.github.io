(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lumos / Nox theme
  var btn = document.getElementById('theme');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    btn.textContent = t === 'nox' ? 'lumos' : 'nox';
    try { localStorage.setItem('theme2', t); } catch (e) {}
  }
  try { var s = localStorage.getItem('theme2'); if (s) setTheme(s); } catch (e) {}
  btn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'nox' ? 'lumos' : 'nox');
  });

  // Sorting Hat: the hat speaks, then lists why to read on
  var hatBtn = document.getElementById('hat-btn');
  var say = document.getElementById('hat-say');
  var hatLine = document.getElementById('hat-line');
  var hatDone = false;
  hatBtn.addEventListener('click', function () {
    var open = hatBtn.getAttribute('aria-expanded') === 'true';
    if (open) { hatBtn.setAttribute('aria-expanded', 'false'); say.hidden = true; return; }
    hatBtn.setAttribute('aria-expanded', 'true');
    say.hidden = false;
    if (hatDone) return;
    hatDone = true;
    var text = 'Hmm… difficult. Very difficult. Better be… a LEADER!';
    var items = say.querySelectorAll('.hat-why li'), cta = say.querySelector('.btn');
    function finish() {
      items.forEach(function (li, k) { setTimeout(function () { li.classList.add('show'); }, k * 450); });
      setTimeout(function () { cta.classList.add('show'); }, items.length * 450 + 200);
    }
    if (reduce) { hatLine.textContent = text; items.forEach(function (li) { li.classList.add('show'); }); cta.classList.add('show'); return; }
    var n = 0;
    (function tick() {
      hatLine.textContent = text.slice(0, ++n);
      if (n < text.length) setTimeout(tick, 45); else finish();
    })();
  });

  // trophy windows: click (or Enter) to flip and reveal the story
  document.querySelectorAll('.plaque').forEach(function (p) {
    function flip() {
      var on = p.classList.toggle('flip');
      p.setAttribute('aria-pressed', on);
    }
    p.addEventListener('click', flip);
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  // reveal on scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach(function (el) { io.observe(el); });

  // diplomas unfurl together (observe the grid: a fully clipped item never intersects)
  var dgrid = document.querySelector('.diplomas');
  if (dgrid) {
    new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        dgrid.querySelectorAll('.dip').forEach(function (d) { d.classList.add('in'); });
        o.disconnect();
      });
    }, { threshold: .25 }).observe(dgrid);
  }

  // Platform 9 3/4 board: trains are skill groups, stops are skills
  var TRAINS = [
    { n: 'Leadership', s: ['Team building', 'Coaching &amp; sponsorship', 'Hiring', 'Roadmapping &amp; OKRs', 'Cross-org influence'] },
    { n: 'Operations', s: ['On-call &amp; incident response', 'RCAs', 'Tax-peak readiness', 'Security remediation'] },
    { n: 'Languages', s: ['Scala', 'Python', 'Java', 'TypeScript', 'Swift', 'C/C++', 'SQL'] },
    { n: 'Backend &amp; data', s: ['GCP Pub/Sub', 'Dataflow', 'BigQuery', 'Spanner', 'Kafka', 'Kubernetes', 'CircleCI'] },
    { n: 'AI', s: ['Claude Agent SDK', 'MCP', 'Langfuse', 'Claude Code', 'Cursor', 'Agent skills', 'Slack agents', 'Agentic PDLC'] },
    { n: 'Mobile &amp; web', s: ['React Native', 'Expo', 'SwiftUI', 'React', 'Cloudflare Workers'] }
  ];
  var rowsEl = document.getElementById('bd-rows'), flapBound = false;
  var LET = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
  function plain(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.toUpperCase(); }
  TRAINS.forEach(function (t, k) {
    var row = document.createElement('div');
    row.className = 'bd-row' + (k === 0 ? ' open' : '');
    var word = plain(t.n);
    var flap = word.split('').map(function (ch) { return '<i class="' + (ch === ' ' ? 'sp' : '') + '" data-ch="' + ch + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</i>'; }).join('');
    row.innerHTML = '<button class="bd-btn" aria-expanded="' + (k === 0) + '"><span class="flap">' + flap + '</span><span class="bd-n">' + String(t.s.length).padStart(2, '0') + '</span><span class="bd-s' + (k === 0 ? ' go' : '') + '">' + (k === 0 ? 'BOARDING' : 'ON TIME') + '</span></button><div class="calls"><p>Calling at</p><div class="chips"></div></div>';
    rowsEl.appendChild(row);
    var btn = row.querySelector('.bd-btn');
    function fillCalls() {
      var box = row.querySelector('.chips'); box.innerHTML = '';
      t.s.forEach(function (x, n) { var c = document.createElement('span'); c.innerHTML = x; c.style.animationDelay = (n * 70) + 'ms'; box.appendChild(c); });
    }
    if (k === 0) fillCalls();
    btn.addEventListener('click', function (e) {
      var wasOpen = row.classList.contains('open');
      rowsEl.querySelectorAll('.bd-row').forEach(function (r) { r.classList.remove('open'); r.querySelector('.bd-btn').setAttribute('aria-expanded', 'false'); });
      if (!wasOpen) { row.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); fillCalls(); burst(e.clientX, e.clientY); }
    });
  });
  function flipBoard() {
    if (reduce) return;
    rowsEl.querySelectorAll('.flap').forEach(function (f, r) {
      f.querySelectorAll('i:not(.sp)').forEach(function (tile, k) {
        var final = tile.dataset.ch, end = 500 + r * 150 + k * 55, t0 = performance.now();
        var iv = setInterval(function () {
          if (performance.now() - t0 >= end) { tile.textContent = final; clearInterval(iv); }
          else tile.textContent = LET[Math.floor(Math.random() * LET.length)];
        }, 45);
      });
    });
  }
  var boardEl = document.getElementById('board');
  if (boardEl) new IntersectionObserver(function (es, o) {
    es.forEach(function (e) { if (e.isIntersecting) { flipBoard(); o.disconnect(); } });
  }, { threshold: .3 }).observe(boardEl);

  // Marauder's Map: footsteps walk between the places in my career
  var PL = [
    { n: 'London', x: 400, y: 100, yr: '2008 – 2012', t: "BSc Computer Science and MSc Computing, IT Law & Management at King's College London." },
    { n: 'Pune', x: 655, y: 225, yr: '2014', t: 'Software Engineer at KPIT Technologies: first professional role.' },
    { n: 'Cincinnati', x: 125, y: 120, yr: '2014 – 2022', t: 'MS Computer Science, then SentriLock: software engineer, engineering lead, engineering manager.' },
    { n: 'Charlotte', x: 140, y: 240, yr: '2022 – now', t: 'Engineering Manager at Credit Karma (Intuit).' },
    { n: 'Durham', x: 265, y: 180, yr: '2024', t: 'Leadership program at Duke University, Fuqua School of Business.' }
  ];
  var mm = document.getElementById('mm-svg'), mmDetail = document.getElementById('mm-detail');
  var mmStarted = false, mmTimers = [];
  function sv(n, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function showPlace(p, g) {
    mmDetail.innerHTML = '<b class="mono">' + p.n + ' · ' + p.yr + '</b><p>' + p.t + '</p>';
    mm.querySelectorAll('.place').forEach(function (x) { x.classList.toggle('sel', x === g); });
  }
  function drawMap() {
    mmTimers.forEach(clearTimeout); mmTimers = [];
    mm.innerHTML = '';
    var ttl = sv('text', { x: 400, y: 34, 'class': 'ttl' }); ttl.textContent = 'I solemnly swear that I am up to no good'; mm.appendChild(ttl);
    var legs = [[0, 1], [1, 2], [2, 3]];
    var count = 0;
    legs.forEach(function (lg) {
      var a = PL[lg[0]], b = PL[lg[1]];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy);
      var cx = mx - dy / len * 45, cy = my + dx / len * 45;
      var path = sv('path', { d: 'M' + a.x + ' ' + a.y + ' Q' + cx + ' ' + cy + ' ' + b.x + ' ' + b.y, fill: 'none', stroke: 'none' });
      mm.appendChild(path);
      var L = path.getTotalLength(), side = 1;
      for (var d = 26; d < L - 22; d += 26) {
        var p1 = path.getPointAtLength(d), p2 = path.getPointAtLength(d + 2);
        var ang = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 90;
        var nx = -(p2.y - p1.y), ny = (p2.x - p1.x), nl = Math.sqrt(nx * nx + ny * ny) || 1;
        var ox = p1.x + nx / nl * 5 * side, oy = p1.y + ny / nl * 5 * side; side = -side;
        var g = sv('g', { transform: 'translate(' + ox + ' ' + oy + ') rotate(' + ang + ') scale(.55)', 'class': 'fp' });
        g.appendChild(sv('ellipse', { cx: 0, cy: -6, rx: 5.4, ry: 8.2 })); g.appendChild(sv('ellipse', { cx: 0, cy: 8, rx: 3.7, ry: 4.4 }));
        g.style.animationDelay = (reduce ? 0 : 0.35 + count * 0.07) + 's'; count++;
        mm.appendChild(g);
      }
    });
    var spur = sv('path', { d: 'M' + PL[3].x + ' ' + PL[3].y + ' Q 215 195 ' + PL[4].x + ' ' + PL[4].y, 'class': 'spur' });
    spur.style.animationDelay = (0.35 + count * 0.07) + 's'; mm.appendChild(spur);
    PL.forEach(function (p, i) {
      var g = sv('g', { 'class': 'place', tabindex: 0, role: 'button', 'aria-label': p.n + ' ' + p.yr });
      g.appendChild(sv('circle', { 'class': 'ring', cx: p.x, cy: p.y, r: 9 })); g.appendChild(sv('circle', { 'class': 'dot', cx: p.x, cy: p.y, r: 3.4 }));
      var t = sv('text', { x: p.x, y: p.y - 18 }); t.textContent = p.n; g.appendChild(t);
      var order = i === 4 ? 4 : i;
      g.style.animationDelay = (reduce ? 0 : 0.2 + order * (count * 0.07 / 3.2)) + 's';
      function pick(e) { showPlace(p, g); if (e && e.clientX) burst(e.clientX, e.clientY); }
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      mm.appendChild(g);
    });
    var dn = sv('text', { x: 690, y: 322, 'class': 'done' }); dn.textContent = 'Mischief managed.';
    dn.style.animationDelay = (reduce ? 0 : 0.5 + count * 0.07 + 0.6) + 's'; mm.appendChild(dn);
  }
  var mapBox = document.querySelector('.mapwrap');
  if (mapBox) {
    new IntersectionObserver(function (es, o) {
      es.forEach(function (e) { if (e.isIntersecting && !mmStarted) { mmStarted = true; drawMap(); o.disconnect(); } });
    }, { threshold: .35 }).observe(mapBox);
    document.getElementById('mm-replay').addEventListener('click', function () { mmStarted = true; drawMap(); });
  }

  // house points: visitors award points (kept on their own device)
  var ptsN = document.getElementById('pts-n'), jar = document.getElementById('jar-fill'),
      ptsMsg = document.getElementById('pts-msg'), award = document.getElementById('award'), pts = 0;
  try { pts = parseInt(localStorage.getItem('pts3') || '0', 10) || 0; } catch (e) {}
  function paint(msg) {
    ptsN.textContent = pts; jar.style.height = (pts % 100 === 0 && pts > 0 ? 100 : pts % 100) + '%';
    ptsMsg.textContent = msg || '';
  }
  paint();
  var ask = document.getElementById('fab-ask'), asked = false;
  try { asked = sessionStorage.getItem('asked3') === '1'; } catch (e) {}
  document.getElementById('fab-x').addEventListener('click', function () { ask.hidden = true; });
  award.addEventListener('click', function (e) {
    pts += 10;
    if (pts >= 30 && !asked) {
      asked = true; ask.hidden = false;
      try { sessionStorage.setItem('asked3', '1'); } catch (x) {}
    }
    try { localStorage.setItem('pts3', pts); } catch (x) {}
    var msg = pts % 100 === 0 ? 'The cup is won!' : (pts === 10 ? 'thank you!' : '+10');
    paint(msg); burst(e.clientX, e.clientY);
    var fab = document.querySelector('.fab'); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
  });

  // count-up
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, n = parseFloat(el.dataset.n), dec = +el.dataset.dec || 0, suf = el.dataset.suf || '';
      so.unobserve(el);
      function put(v) { el.textContent = v.toFixed(dec) + suf; }
      if (n === 0 || reduce) { put(n); return; }
      var t0 = performance.now();
      (function step(t) {
        var k = Math.min((t - t0) / 1100, 1);
        put(n * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: .6 });
  document.querySelectorAll('.plaque .big').forEach(function (b) { so.observe(b); });

  // card spotlight follows cursor
  document.querySelectorAll('.card,.stat').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Marauder's Map footprints: walk down the trail as you scroll
  var map = document.querySelector('.map');
  var trail = document.querySelector('.trail');
  var feet = [];
  var STEP = 42;
  var FOOT = '<svg viewBox="0 0 16 30" aria-hidden="true"><ellipse cx="8" cy="9" rx="5.4" ry="8.2"/><ellipse cx="8" cy="24" rx="3.7" ry="4.4"/></svg>';
  function buildFeet() {
    trail.innerHTML = ''; feet = [];
    var n = Math.max(1, Math.floor((map.offsetHeight - 20) / STEP));
    for (var i = 0; i < n; i++) {
      var f = document.createElement('div');
      var right = i % 2 === 1;
      f.className = 'foot' + (right ? ' right' : '');
      f.style.top = (10 + i * STEP) + 'px';
      f.style.marginLeft = (right ? -1 : -13) + 'px';
      f.style.setProperty('--r', (right ? 188 : 172) + 'deg');
      f.innerHTML = FOOT;
      trail.appendChild(f); feet.push(f);
    }
  }
  buildFeet();
  addEventListener('resize', buildFeet);

  // scroll progress + footprints
  var bar = document.querySelector('.progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    var r = map.getBoundingClientRect();
    var reach = innerHeight * .65 - r.top;
    feet.forEach(function (f, i) {
      var y = 10 + i * STEP;
      var on = reduce || y < reach;
      f.classList.toggle('on', on);
      f.classList.toggle('old', on && !reduce && y < reach - 260);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // spells: each click reveals one more line, with a wand-spark burst
  function burst(x, y) {
    if (reduce) return;
    for (var n = 0; n < 16; n++) {
      var p = document.createElement('i');
      p.className = 'burst';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      document.body.appendChild(p);
      var a = Math.random() * 6.28, d = 30 + Math.random() * 50;
      var an = p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(0)', opacity: 0 }
      ], { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.2,1)' });
      an.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  var castN = document.getElementById('cast-n');
  var opened = 0;
  document.querySelectorAll('.spell').forEach(function (sp) {
    var b = sp.querySelector('.cast'), hint = sp.querySelector('.hint');
    var lines = sp.querySelectorAll('.lines li'), i = 0;
    b.addEventListener('click', function (e) {
      if (i >= lines.length) return;
      if (i === 0) { sp.classList.add('open'); b.setAttribute('aria-expanded', 'true'); castN.textContent = ++opened; }
      lines[i++].classList.add('show');
      hint.textContent = i < lines.length ? 'more ' + i + '/' + lines.length : 'cast ✓';
      var r = b.getBoundingClientRect();
      burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    });
  });

  // spell work across the whole page: drifting incantations, wand streaks,
  // a wand trail on the cursor, and click-anywhere spells
  var SPELLS = ['Lumos', 'Accio', 'Alohomora', 'Revelio', 'Geminio', 'Expecto Patronum',
    'Wingardium Leviosa', 'Expelliarmus', 'Protego', 'Reparo', 'Incendio', 'Nox'];
  function pick() { return SPELLS[Math.floor(Math.random() * SPELLS.length)]; }

  if (!reduce) {
    var layer = document.getElementById('incant');
    (function drift() {
      var w = document.createElement('span');
      w.textContent = pick();
      w.style.left = (3 + Math.random() * 82) + '%';
      w.style.top = (8 + Math.random() * 82) + '%';
      w.style.setProperty('--r', (Math.random() * 16 - 8) + 'deg');
      w.style.setProperty('--t', (11 + Math.random() * 6) + 's');
      layer.appendChild(w);
      setTimeout(function () { w.remove(); }, 18000);
      setTimeout(drift, 2200 + Math.random() * 2200);
    })();

    (function streak() {
      var s = document.createElement('i');
      s.className = 'streak';
      var y = Math.random() * innerHeight * .6, x = -200;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.transform = 'rotate(18deg)';
      document.body.appendChild(s);
      var a = s.animate([
        { transform: 'translate(0,0) rotate(18deg)', opacity: 0 },
        { opacity: .9, offset: .15 },
        { transform: 'translate(' + (innerWidth + 400) + 'px,' + ((innerWidth + 400) * .325) + 'px) rotate(18deg)', opacity: 0 }
      ], { duration: 1500, easing: 'ease-in' });
      a.onfinish = function () { s.remove(); };
      setTimeout(streak, 6000 + Math.random() * 6000);
    })();

    var last = 0;
    addEventListener('mousemove', function (e) {
      var now = performance.now();
      if (now - last < 40) return;
      last = now;
      var d = document.createElement('i');
      d.className = 'trailspark';
      d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px';
      document.body.appendChild(d);
      var an = d.animate([
        { transform: 'translate(0,0) scale(1)', opacity: .9 },
        { transform: 'translate(' + (Math.random() * 16 - 8) + 'px,' + (10 + Math.random() * 14) + 'px) scale(0)', opacity: 0 }
      ], { duration: 650, easing: 'ease-out' });
      an.onfinish = function () { d.remove(); };
    }, { passive: true });

    addEventListener('click', function (e) {
      if (e.target.closest('a,button,.cast,.theme')) return;
      burst(e.clientX, e.clientY);
      var w = document.createElement('span');
      w.className = 'spellword';
      w.textContent = pick() + '!';
      w.style.left = (e.clientX - 40) + 'px'; w.style.top = (e.clientY - 20) + 'px';
      document.body.appendChild(w);
      var an = w.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-46px)', opacity: 0 }
      ], { duration: 1300, easing: 'ease-out' });
      an.onfinish = function () { w.remove(); };
    });
  }

  // leadership badges: tilt toward the cursor, sparkle when clicked
  document.querySelectorAll('.bcard').forEach(function (c) {
    if (!reduce) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transition = 'border-color .3s, box-shadow .3s';
        c.style.transform = 'perspective(700px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 9) + 'deg)';
      });
      c.addEventListener('mouseleave', function () {
        c.style.transition = 'transform .5s, border-color .3s, box-shadow .3s';
        c.style.transform = '';
      });
    }
    c.querySelector('.crest').addEventListener('click', function (e) { burst(e.clientX, e.clientY); });
  });

  // subtle drifting sparks
  var cv = document.getElementById('sparks');
  if (!reduce && cv.getContext) {
    var ctx = cv.getContext('2d'), W, H, dots = [];
    function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    size(); addEventListener('resize', size);
    for (var k = 0; k < 28; k++) dots.push({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.4 + .4, v: Math.random() * .25 + .08, a: Math.random() * 6.28
    });
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      var c = getComputedStyle(root).getPropertyValue('--accent').trim() || '#d3a625';
      ctx.fillStyle = c;
      dots.forEach(function (d) {
        d.y -= d.v; d.a += .02; d.x += Math.sin(d.a) * .25;
        if (d.y < -5) { d.y = H + 5; d.x = Math.random() * W; }
        ctx.globalAlpha = .15 + .25 * Math.abs(Math.sin(d.a));
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
