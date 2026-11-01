/*
 * Numbers VS. Operations - the game.
 *
 * engine.js owns the rules (operations, running value, multi-kill, unlocks).
 * This file owns the screen: the digit sphere, HUD, menu, timers and animation.
 *
 *   Active mode : every click / Space / Enter applies your operation once.
 *   Idle mode   : the operation is applied automatically, a few times a second.
 *   Easy        : no timer.
 *   Hard        : a timer per boss. If it runs out you retry the same number.
 *
 * Extra URL options (for testing): ?reset=1  ?auto=1  ?rate=N  ?budget=N  ?start=N
 */
(function (root) {
  'use strict';

  var MIN_N = 36, MAX_N = 720;
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('sphere');
  var elName = $('boss-name'), elSub = $('boss-sub'), elMeta = $('boss-meta'),
    elCount = $('boss-count'), elHint = $('hint');
  var elOp = $('hud-op'), elRule = $('hud-rule'), elV = $('hud-v'), elTick = $('hud-tick'),
    elMode = $('hud-mode'), elBar = $('timer-fill'), elTimer = $('timer'),
    elToast = $('toast'), elMenu = $('menu'), elWin = $('win');
  var reduce = root.matchMedia &&
    root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var query = function (k) {
    var m = new RegExp('[?&]' + k + '=([^&]*)').exec(root.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  };

  var sphere = root.NVO.createSphere(canvas);
  var eng = null, tierLabel = {}, tierIndex = {};

  // ------------------------------------------------------------ settings + save
  var SAVE_KEY = 'nvo.save.v1';
  var RATE = Number(query('rate')) || 4;           // idle ticks per second
  var settings = { mode: 'active', diff: 'easy' };
  var st = {
    phase: 'menu',        // menu | fight | anim | won
    ptr: null, op: 0,
    V: null, tick: 0,
    t0: 0, acc: 0, last: 0
  };

  function save() {
    try {
      root.localStorage.setItem(SAVE_KEY, JSON.stringify({
        ptr: eng.keyOf(st.ptr), op: st.op, mode: settings.mode, diff: settings.diff
      }));
    } catch (e) { /* storage can be blocked; the game still works */ }
  }
  function load() {
    try {
      var s = JSON.parse(root.localStorage.getItem(SAVE_KEY) || 'null');
      return s && typeof s.ptr === 'string' ? s : null;
    } catch (e) { return null; }
  }
  function wipe() { try { root.localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

  // ------------------------------------------------------------ formatting
  function zeros(n) { return n > 0 ? new Array(n + 1).join('0') : ''; }
  function valueText(v) {
    if (!v) return '';
    switch (v.kind) {
      case 'exact':
        return v.digits.length <= 27 ? BigInt(v.digits).toLocaleString('en-US')
          : v.digits.length + ' digits';
      case 'pow10':
        return '10^' + (typeof v.exponent === 'string' ? v.exponent : '(' + valueText(v.exponent) + ')');
      case 'approx': return v.mantissa + ' × 10^' + v.exponent;
      case 'tetration':
        return '10↑↑10^' + (typeof v.height === 'object' ? v.height.ref : v.height);
      case 'expression': return v.text + (v.approx ? ' ≈ ' + v.approx : '');
      default: return '';
    }
  }
  function subtitle(e) {
    if (e.isFinal) return 'There is nothing after this.';
    if (e.series) return e.definition;
    var parts = [], vt = valueText(e.value);
    if (vt) parts.push(vt);
    if (e.definition && (!vt || e.definition !== vt)) parts.push(e.definition);
    if (!parts.length && e.category && e.category.indexOf('tier:') === 0) {
      parts.push(tierLabel[e.category.slice(5)] || '');
    }
    if (e.longScaleName) parts.push('long scale: ' + e.longScaleName);
    return parts.join('  ·  ');
  }

  // ------------------------------------------------------------ sphere models
  function hueFor(e) {
    var c = e.category || '';
    if (c.indexOf('tier:') === 0) return 262 + (tierIndex[c.slice(5)] || 0) * 5;
    switch (c) {
      case 'everyday': return 205;
      case 'illion': return 188;
      case 'power-of-ten': case 'googol': case 'googol-family': return 170;
      case 'constant': return 140;
      default: return 45;
    }
  }
  function modelFor(e) {
    if (e.isFinal) {
      var inf = [];
      for (var k = 0; k < 220; k++) inf.push('∞');
      return { chars: inf, hue: 48, sat: 95, churn: 0 };
    }
    var v = e.value, s = null, total = Infinity;
    if (v && v.kind === 'exact') { s = v.digits; total = s.length; }
    else if (v && v.kind === 'pow10') {
      var ex = typeof v.exponent === 'string' ? Number(v.exponent) : Infinity;
      total = isFinite(ex) ? ex + 1 : Infinity;
      s = '1' + zeros(Math.min(total, MAX_N) - 1);
    } else if (v && v.kind === 'approx') {
      var mant = String(v.mantissa).replace('.', '');
      total = v.exponent + 1;
      s = mant + zeros(Math.min(total, MAX_N) - mant.length);
    }
    var n = Math.max(MIN_N, Math.min(MAX_N, isFinite(total) ? total : MAX_N));
    var chars = [];
    if (s !== null) {
      for (var i = 0; i < n; i++) chars.push(s.charAt(i % s.length));
      return { chars: chars, hue: hueFor(e), churn: 0, accent: true };
    }
    var glyphs = '0123456789';
    for (var j = 0; j < MAX_N; j++) chars.push(glyphs.charAt((Math.random() * 10) | 0));
    var ill = e.illDefined;
    return { chars: chars, hue: ill ? 0 : hueFor(e), sat: ill ? 25 : 85,
      churn: ill ? 1.4 : 0.3, glyphs: glyphs };
  }

  // ------------------------------------------------------------ labels / HUD
  function rankText(p) {
    return '№ ' + eng.fmtBig(eng.rankOf(p) + 1n) + ' of ' + eng.fmtBig(eng.totalBosses());
  }
  function setBossLabels(p) {
    var e = eng.entryOf(p);
    elName.textContent = e.name;
    elSub.textContent = subtitle(e);
    elMeta.textContent = e.isFinal ? 'final boss' : rankText(p);
    return e;
  }
  function showBoss(p, burst) {
    var e = setBossLabels(p);
    sphere.setModel(modelFor(e), { burst: burst !== false });
  }
  function hud() {
    var op = eng.OPS[st.op];
    elOp.textContent = op.sym + '  ' + op.name;
    elRule.textContent = 'each hit: ' + op.rule;
    elV.textContent = st.V ? eng.fmtV(st.V) : '1';
    elTick.textContent = st.tick ? 'hit ' + st.tick : '';
    elMode.textContent = settings.mode + ' · ' + settings.diff;
  }
  var toastTimer = 0;
  function toast(msg, ms, cls) {
    clearTimeout(toastTimer);
    elToast.textContent = msg;
    elToast.className = 'show ' + (cls || '');
    toastTimer = setTimeout(function () { elToast.className = ''; }, ms || 2200);
  }
  var countTimer = 0;
  function showCount(k) {
    clearTimeout(countTimer);
    if (k < 2n) { elCount.style.opacity = 0; return; }
    elCount.textContent = '×' + eng.fmtBig(k) + ' bosses destroyed';
    elCount.style.opacity = 1;
    countTimer = setTimeout(function () { elCount.style.opacity = 0; }, 2600);
  }

  // ------------------------------------------------------------ fight flow
  function timerMs() { return ((eng.C + 0.5) / RATE) * 1000; }

  function startFight() {
    st.phase = 'fight';
    st.V = null; st.tick = 0; st.acc = 0;
    st.t0 = performance.now(); st.last = st.t0;
    elTimer.style.display = settings.diff === 'hard' ? 'block' : 'none';
    elBar.style.transform = 'scaleX(1)';
    hud();
  }

  function applyTick() {
    if (st.phase !== 'fight') return;
    st.tick++;
    var op = eng.OPS[st.op];
    st.V = op.V[Math.min(st.tick, op.V.length - 1)];
    sphere.pulse();
    hud();
    if (eng.beats(st.V, st.ptr)) kill();
  }

  function kill() {
    var from = st.ptr, V = st.V;
    if (from.k === 'f') { win(); return; }
    var to = eng.nextAfter(V);
    var killed = eng.rankOf(to) - eng.rankOf(from);
    var oldOp = st.op;
    st.op = eng.opFor(st.op, to);
    st.ptr = to;
    st.phase = 'anim';
    save();
    var after = function () {
      if (st.op !== oldOp) {
        var o = eng.OPS[st.op];
        toast('New operation: ' + o.sym + ' ' + o.name + '  (' + o.rule + ')', 3200, 'gold');
      }
      startFight();
    };
    if (killed <= 1n || reduce) {
      showCount(killed);
      showBoss(to, true);
      setTimeout(after, 520);
    } else {
      sweep(from, to, killed, after);
    }
  }

  // Multi-kill: flash through the bosses that die, slowing down, then settle.
  function sweep(from, to, killed, done) {
    var picks = eng.sampleBetween(from, to, 26), k = 0;
    var base = eng.rankOf(from);
    elName.classList.add('flash');
    elCount.style.opacity = 1;
    clearTimeout(countTimer);
    function step() {
      if (k >= picks.length) {
        elName.classList.remove('flash');
        showBoss(to, true);
        showCount(killed);
        setTimeout(done, 700);
        return;
      }
      var p = picks[k];
      var e = eng.entryOf(p);
      elName.textContent = e.name;
      elSub.textContent = subtitle(e);
      elMeta.textContent = rankText(p);
      sphere.setModel(modelFor(e), { burst: false });
      sphere.pulse();
      elCount.textContent = '×' + eng.fmtBig(eng.rankOf(p) - base) + ' bosses destroyed';
      k++;
      var t = k / picks.length;
      setTimeout(step, 36 + 250 * t * t);
    }
    step();
  }

  function fail() {
    st.phase = 'anim';
    toast('Time is up. Try the same number again.', 1500, 'red');
    sphere.pulse();
    setTimeout(startFight, 1000);
  }

  function win() {
    st.phase = 'won';
    wipe();
    sphere.pulse();
    elWin.style.display = 'flex';
  }

  // main loop: idle ticks + hard timer
  function frame(now) {
    root.requestAnimationFrame(frame);
    if (st.phase !== 'fight') { st.last = now; return; }
    var dt = now - st.last; st.last = now;
    if (dt > 250) dt = 250;                         // tab was asleep
    if (settings.mode === 'idle') {
      st.acc += dt;
      var step = 1000 / RATE;
      while (st.acc >= step && st.phase === 'fight') { st.acc -= step; applyTick(); }
    }
    if (settings.diff === 'hard' && st.phase === 'fight') {
      var left = 1 - (now - st.t0) / timerMs();
      elBar.style.transform = 'scaleX(' + Math.max(0, left) + ')';
      if (left <= 0) fail();
    }
  }

  // ------------------------------------------------------------ menu
  function paintMenu() {
    ['active', 'idle'].forEach(function (m) {
      $('opt-' + m).classList.toggle('on', settings.mode === m);
    });
    ['easy', 'hard'].forEach(function (d) {
      $('opt-' + d).classList.toggle('on', settings.diff === d);
    });
    $('btn-go').textContent = load() ? 'Continue' : 'Start';
    $('btn-new').style.display = load() ? '' : 'none';
  }
  function openMenu() {
    st.phase = 'menu';
    elMenu.style.display = 'flex';
    paintMenu();
  }
  function begin(fresh) {
    elMenu.style.display = 'none';
    elWin.style.display = 'none';
    var s = fresh ? null : load();
    st.ptr = s ? eng.fromKey(s.ptr) : eng.first();
    st.op = s ? Math.min(s.op, eng.OPS.length - 1) : 0;
    var start = Number(query('start'));
    if (start > 0 && fresh !== 'keep') { st.ptr = eng.fromKey('x' + (start - 1)); st.op = eng.opFor(0, st.ptr); }
    if (fresh) wipe();
    showBoss(st.ptr, false);
    startFight();
    save();
  }
  $('opt-active').onclick = function () { settings.mode = 'active'; paintMenu(); };
  $('opt-idle').onclick = function () { settings.mode = 'idle'; paintMenu(); };
  $('opt-easy').onclick = function () { settings.diff = 'easy'; paintMenu(); };
  $('opt-hard').onclick = function () { settings.diff = 'hard'; paintMenu(); };
  $('btn-go').onclick = function () { begin(false); };
  $('btn-new').onclick = function () { begin(true); };
  $('btn-again').onclick = function () { begin(true); };
  $('hud-mode').onclick = function () { if (st.phase !== 'menu') openMenu(); };

  // ------------------------------------------------------------ input
  var downX = 0, downY = 0;
  canvas.addEventListener('pointerdown', function (e) { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('pointerup', function (e) {
    var dx = e.clientX - downX, dy = e.clientY - downY;
    if (dx * dx + dy * dy < 36 && settings.mode === 'active') applyTick();
  });
  root.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var key = e.key;
    if (st.phase === 'menu') {
      if (key === 'Enter') { begin(false); e.preventDefault(); }
      return;
    }
    if (key === ' ' || key === 'Enter') {
      if (settings.mode === 'active') applyTick();
      e.preventDefault();
    } else if (key === 'Escape') { openMenu(); }
    else if (key === 'h' || key === 'H') {
      elHint.style.display = elHint.style.display === 'none' ? '' : 'none';
    }
  });

  // ------------------------------------------------------------ load
  var budget = Number(query('budget')) || undefined;
  fetch(canvas.getAttribute('data-src'))
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      (data.meta.tiers || []).forEach(function (t, i) {
        tierLabel[t.id] = t.label; tierIndex[t.id] = i;
      });
      eng = root.NVO.createEngine(data, { illionName: root.NVO.illionName },
        budget ? { tickBudget: budget } : {});
      if (query('reset')) wipe();
      var s = load();
      if (s) { settings.mode = s.mode || settings.mode; settings.diff = s.diff || settings.diff; }
      if (query('mode')) settings.mode = query('mode');
      if (query('diff')) settings.diff = query('diff');
      st.ptr = s ? eng.fromKey(s.ptr) : eng.first();
      st.op = s ? s.op : 0;
      showBoss(st.ptr, false);
      hud();
      root.requestAnimationFrame(frame);
      if (query('auto')) begin(false); else openMenu();
      root.NVO.game = { engine: eng, state: st, settings: settings, tick: applyTick,
        begin: begin, openMenu: openMenu };
    })
    .catch(function (err) {
      elName.textContent = 'Numbers VS. Operations';
      elSub.textContent = 'Could not load the game (' + err.message + ').';
    });
})(window);
