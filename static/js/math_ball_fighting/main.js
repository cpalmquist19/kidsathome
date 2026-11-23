/*
 * Math Ball Fighting - the game screen.
 *
 * fight.js owns the rules, physics.js moves the balls, render.js draws them.
 * This file owns the menu, HUD, impact effects and the main loop.
 *
 * URL options (handy for testing): ?a=n1&d=n1000&mode=watch|fight&go=1&speed=4
 */
(function (root) {
  'use strict';
  var MBF = root.MBF;
  var THREE = root.THREE;
  var $ = function (id) { return document.getElementById(id); };
  var query = function (k) {
    var m = new RegExp('[?&]' + k + '=([^&]*)').exec(root.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  };
  var reduceMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------ settings
  var SAVE_KEY = 'mbf.settings.v1';
  var settings = { att: 'n1', def: 'n1', mode: 'watch', wander: 0, calm: reduceMotion ? 1 : 0, sound: 1 };
  try {
    var saved = JSON.parse(root.localStorage.getItem(SAVE_KEY) || 'null');
    if (saved) for (var k in settings) if (saved[k] !== undefined) settings[k] = saved[k];
  } catch (e) { /* storage may be blocked */ }
  function save() { try { root.localStorage.setItem(SAVE_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } }
  if (query('a') && (MBF.ballById(query('a')) || /^fx/.test(query('a')))) settings.att = query('a');
  if (query('d') && (MBF.ballById(query('d')) || /^fx/.test(query('d')))) settings.def = query('d');
  if (query('mode') === 'watch' || query('mode') === 'fight') settings.mode = query('mode');
  // fictional ids (fx...) only exist once their data file has loaded
  if (!MBF.ballById(settings.att) && !/^fx/.test(settings.att)) settings.att = 'n1';
  if (!MBF.ballById(settings.def) && !/^fx/.test(settings.def)) settings.def = 'n1';
  function pick(id) { return MBF.ballById(id) || MBF.ballById('n1'); }

  // ------------------------------------------------------------ setup
  var SND = MBF.audio;
  SND.setEnabled(!!settings.sound);
  var R = MBF.createRenderer($('stage'));
  var input = MBF.createInput({
    stickBase: $('stick-base'), stickKnob: $('stick-knob'),
    dashButton: $('dash-btn'), touchZone: $('touch-zone')
  });
  var touch = root.matchMedia && root.matchMedia('(pointer: coarse)').matches;
  function markTouch() { touch = true; document.body.classList.add('touch'); }
  if (touch) markTouch();
  root.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') markTouch(); }, true);

  // Slot previews (the two big balls at the top of the menu) are rendered one at a time;
  // every picker tile comes from a cached sprite sheet (sheets.js).
  var thumbs = {};
  function thumbUrl(ball) {
    if (!thumbs[ball.id]) thumbs[ball.id] = R.thumbnail(ball, 128);
    return thumbs[ball.id];
  }
  var sheets = MBF.createSheets(R);

  // ------------------------------------------------------------ game state
  var phase = 'menu';             // menu | intro | fight | ko | paused
  var pausedFrom = null;
  var fight = null, world = null, attV = null, defV = null;
  var attQ = new THREE.Quaternion(), defQ = new THREE.Quaternion();
  var speed = Number(query('speed')) || 1;
  var hitStop = 0, slowT = 0, introT = 0, koT = 0, defFade = 1;
  var hitTimes = [], fightStart = 0, lastFx = -1, lastShatter = -1, lastWarp = -1, lastTrip = -1, lastGlitch = -1, lastDream = -1, flashTimes = [];
  var labelDue = false, lastLabel = 0, koAt = 0;
  var hudDirty = true, waitT = 0;

  // Ball size comes from its rank among the numbers (smallest 0 .. biggest 1).
  // Function balls are a medium size whatever their current value.
  var numberRank = {};
  (function () {
    var nums = MBF.roster.filter(function (b) { return b.kind === 'number' && !b.fictional; });
    nums.sort(function (x, y) { return MBF.V.cmp(MBF.valueOf(x), MBF.valueOf(y)); });
    nums.forEach(function (b, i) { numberRank[b.id] = nums.length > 1 ? i / (nums.length - 1) : 0; });
  })();
  function sizeFrac(ball) {
    if (ball.fictional) return 0.8 + 0.2 * (ball.fsize || 0);   // beyond infinity: the biggest balls, by wiki size
    return ball.kind === 'number' ? numberRank[ball.id] : 0.55;
  }
  function radii() {
    var m = Math.min(R.W, R.H) / 800;
    return {
      a: m * 800 * (0.05 + 0.03 * sizeFrac(fight.attacker)),
      d: m * 800 * (0.13 + 0.07 * sizeFrac(fight.defender))
    };
  }

  // ------------------------------------------------------------ menu / picker
  // Two slots at the top (attacker, defender); tap one, then tap any ball below.
  var activeSlot = 'att';
  var picker = MBF.createPicker($('browser'), {
    sheets: sheets,
    onPick: function (ball) {
      if (activeSlot === 'def' && ball.kind !== 'number') return;
      settings[activeSlot] = ball.id; save(); refreshMenu();
    }
  });
  function setSlot(slot) {
    activeSlot = slot;
    picker.setSlot(slot);
    refreshMenu();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.slot'), function (b) {
    b.addEventListener('click', function () {
      if (activeSlot === b.dataset.slot) picker.reveal(settings[activeSlot]);   // tap again: jump to it
      else setSlot(b.dataset.slot);
    });
  });
  function showBalls() {
    picker.setBalls(MBF.roster);
    sheets.setBalls(MBF.roster);
    refreshMenu();
  }
  showBalls();

  Array.prototype.forEach.call(document.querySelectorAll('.opt'), function (b) {
    b.addEventListener('click', function () {
      var key = b.dataset.opt, val = b.dataset.val;
      settings[key] = key === 'mode' ? val : Number(val);
      save(); refreshMenu();
      if (key === 'wander' && world) world.wander = !!settings.wander;
      if (key === 'sound') { SND.setEnabled(!!settings.sound); if (settings.sound) SND.unlock(); refreshSoundBtn(); }
    });
  });

  function refreshMenu() {
    var a = pick(settings.att), d = pick(settings.def);
    picker.setSelected(a.id, d.id);
    $('slot-a-img').src = thumbUrl(a); $('slot-a-name').textContent = a.name; $('slot-a-fact').textContent = a.fact;
    $('slot-d-img').src = thumbUrl(d); $('slot-d-name').textContent = d.name; $('slot-d-fact').textContent = d.fact;
    Array.prototype.forEach.call(document.querySelectorAll('.slot'), function (b) {
      b.classList.toggle('on', b.dataset.slot === activeSlot);
    });
    $('pick-hint').textContent = activeSlot === 'att'
      ? 'Choosing the ATTACKER: tap any ball below. Tap the Defender box to choose the defender.'
      : 'Choosing the DEFENDER: tap any number below. Tap the Attacker box to switch back.';
    var ok = MBF.canFight(a, d);
    $('pick-error').textContent = ok.ok ? '' : ok.reason;
    $('btn-start').disabled = !ok.ok;
    Array.prototype.forEach.call(document.querySelectorAll('.opt'), function (b) {
      b.classList.toggle('on', String(settings[b.dataset.opt]) === b.dataset.val);
    });
  }

  function openMenu() {
    if (phase === 'intro' || phase === 'fight' || phase === 'ko') { pausedFrom = phase; phase = 'paused'; }
    $('btn-resume').style.display = phase === 'paused' ? '' : 'none';
    $('ko').classList.remove('on');
    $('menu').classList.add('on');
    input.setEnabled(false);
    document.body.classList.remove('fighting');
    SND.duck(true);
    refreshMenu();
  }
  function closeMenu() { $('menu').classList.remove('on'); }

  function resume() {
    if (phase !== 'paused') return;
    var mode = settings.mode;
    if (mode !== world.mode) { startFight(); return; }   // mode changed: restart
    closeMenu();
    phase = pausedFrom;
    SND.duck(false);
    setFightingUi();
  }

  function refreshSoundBtn() {
    var b = $('btn-sound');
    b.textContent = settings.sound ? '🔊' : '🔇';
    b.title = settings.sound ? 'Sound on (click to mute)' : 'Sound off (click to turn on)';
  }
  $('btn-sound').addEventListener('click', function () {
    settings.sound = settings.sound ? 0 : 1; save();
    SND.setEnabled(!!settings.sound); if (settings.sound) SND.unlock();
    refreshSoundBtn(); refreshMenu();
  });
  refreshSoundBtn();
  $('btn-start').addEventListener('click', function () { startFight(); });
  $('btn-resume').addEventListener('click', resume);
  $('btn-menu').addEventListener('click', openMenu);
  $('btn-rematch').addEventListener('click', function () { startFight(); });
  $('btn-new').addEventListener('click', function () { phase = 'menu'; SND.stopTheme(); openMenu(); });
  root.addEventListener('keydown', function (e) {
    if (e.code === 'Escape') {
      if ($('menu').classList.contains('on')) { if (phase === 'paused') resume(); }
      else openMenu();
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll('#speed .hbtn'), function (b) {
    b.addEventListener('click', function () { speed = Number(b.dataset.speed); refreshSpeed(); });
  });
  function refreshSpeed() {
    Array.prototype.forEach.call(document.querySelectorAll('#speed .hbtn'), function (b) {
      b.classList.toggle('on', Number(b.dataset.speed) === speed);
    });
  }

  function setFightingUi() {
    $('hud').classList.add('on');
    $('speed').style.display = settings.mode === 'watch' ? 'flex' : 'none';
    var fighting = settings.mode === 'fight';
    document.body.classList.toggle('fighting', fighting);
    input.setEnabled(fighting && phase !== 'ko');
  }

  // ------------------------------------------------------------ start a fight
  function startFight() {
    var a = pick(settings.att), d = pick(settings.def);
    if (!MBF.canFight(a, d).ok) return;
    if (attV) attV.dispose();
    if (defV) defV.dispose();
    fight = MBF.createFight(a, d);
    SND.unlock();
    if (SND.hasTheme(d)) SND.startTheme(d); else SND.stopTheme();   // boss music for big defenders
    world = MBF.createWorld({ W: R.W, H: R.H, mode: settings.mode, wander: !!settings.wander });
    var r = radii();
    world.place(r.a, r.d);
    defV = R.makeBall(d, r.d);
    attV = R.makeBall(a, r.a);
    attQ.setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, 0));
    defQ.setFromEuler(new THREE.Euler(0.3, -0.4, 0));
    defFade = 1; hitStop = 0; slowT = 0; koT = 0;
    hitTimes = []; lastFx = -1; hudDirty = true; waitT = 0;
    closeMenu();
    $('ko').classList.remove('on');
    phase = 'intro'; introT = 1.15;
    setFightingUi();
    refreshSpeed();
    $('def-name').textContent = d.name;
    $('att-name').textContent = a.name;
    attV.setLabel(fight.label());
    labelDue = false;
    refreshAttackerText();
    setHpBar(1, true);
    banner((a.kind === 'function' ? a.formula : a.label) + '  VS  ' + d.label, a.name + ' vs ' + d.name);
    fightStart = performance.now();
  }

  // ------------------------------------------------------------ HUD
  function setHpBar(f, instant) {
    var fill = $('hp-fill'), ghost = $('hp-ghost');
    if (instant) { fill.style.transition = ghost.style.transition = 'none'; }
    fill.style.transform = 'scaleX(' + f + ')';
    ghost.style.transform = 'scaleX(' + f + ')';
    if (instant) { void fill.offsetWidth; fill.style.transition = ghost.style.transition = ''; }
  }
  function hitsPerSecond() {
    if (hitTimes.length < 3) return 0;
    var span = (hitTimes[hitTimes.length - 1] - hitTimes[0]) / 1000;
    var sinceLast = (performance.now() - hitTimes[hitTimes.length - 1]) / 1000;
    span = Math.max(span, 0.001);
    var rate = (hitTimes.length - 1) / span;
    // if hits have stopped coming (player idle), let the estimate drift down
    var gap = span / (hitTimes.length - 1);
    if (sinceLast > gap * 2) rate = Math.min(rate, 1 / sinceLast);
    return rate;
  }
  // "Damage per hit: 1,000" for numbers, "Next hit: 7! = 5,040" for functions
  function refreshAttackerText() {
    var dmg = fight.damage(), val = MBF.V.fmt(dmg), txt;
    if (fight.isFunction) {
      txt = 'Next hit: ' + fight.label() + (val !== fight.label() ? ' = ' + val : '');
      if (dmg.estimate) txt += ' (nobody knows its real size; this is a guess)';
    } else txt = 'Damage per hit: ' + val;
    $('att-dmg').textContent = txt;
  }

  function updateHud(dt) {
    if (!fight) return;
    waitT -= dt;
    if (!hudDirty && waitT > 0) return;
    if (hudDirty) {
      $('hp-text').textContent = fight.hpText();
      $('hp-pct').textContent = fight.percentText();
      setHpBar(fight.hpFraction(), false);
      var h = fight.hits === 1n ? '1 hit' : MBF.fmt(fight.hits) + ' hits';
      $('stat-hits').textContent = fight.over ? h + ' · K.O.!'
        : h + ' · Hits to K.O.: ' + MBF.V.fmt(fight.hitsToKo());
    }
    if (hudDirty || waitT <= 0) {
      var rate = hitsPerSecond();
      $('stat-wait').textContent = fight.over ? '' :
        (rate > 0 ? (fight.totalHits === MBF.INFINITY ? 'Forever: no number of hits is ever enough'
          : 'About ' + fight.waitText(rate) + ' to go at this pace') :
          (settings.mode === 'fight' ? 'Ram into the ball in the middle!' : ''));
      waitT = 0.5;
    }
    hudDirty = false;
  }

  function banner(big, small) {
    var b = $('banner');
    b.querySelector('.big').textContent = big;
    b.querySelector('.small').textContent = small || '';
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  }

  var dmgLayer = $('dmg');
  function damageNumber(text, x, y, level, t, ko) {
    while (dmgLayer.childNodes.length > 14) dmgLayer.removeChild(dmgLayer.firstChild);
    var el = document.createElement('div');
    el.className = 'dn' + (ko ? ' ko' : '');
    el.textContent = text;
    el.style.left = (R.W / 2 + x) + 'px';
    el.style.top = (R.H / 2 - y) + 'px';
    var size = Math.min(46, 18 + level * 7 + t * 6) + (ko ? 18 : 0);
    if (text.length > 9) size *= Math.max(0.6, 9 / text.length + 0.25);   // long numbers stay on screen
    el.style.fontSize = Math.round(size) + 'px';
    dmgLayer.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1000);
  }

  // ------------------------------------------------------------ impact effects
  function canFlash(now) {
    while (flashTimes.length && now - flashTimes[0] > 1000) flashTimes.shift();
    if (flashTimes.length >= 3) return false;       // never more than 3 flashes a second
    flashTimes.push(now);
    return true;
  }

  function impact(ev, res) {
    var now = performance.now();
    var a = fight.attacker, d = fight.defender;
    var m = world.scale(), calm = !!settings.calm;
    var s = res.level + res.t;                       // effect strength, grows with damage
    var busy = speed > 1 && settings.mode === 'watch';
    var throttled = !res.ko && (now - lastFx) < (busy ? 110 : 30);

    SND.hit(res.level, res.t, { weight: sizeFrac(a), busy: busy, calm: calm });
    attV.boing(0.1 + 0.04 * s, throttled);
    defV.boing(0.03 + 0.025 * s, throttled || busy);
    if (throttled) return;
    lastFx = now;

    var tx = -ev.ny, ty = ev.nx;                     // tangent along the defender's surface
    // level 0+: spark pop thrown back toward the attacker and along the surface
    R.fx.sparks(ev.x, ev.y, ev.nx, ev.ny, Math.round(8 + 12 * s), (320 + 200 * s) * m, 1.5 + 0.35 * s, a.aura);
    R.fx.sparks(ev.x, ev.y, tx, ty, Math.round(3 + 4 * s), (260 + 120 * s) * m, 0.5, d.aura, 0.3);
    R.fx.sparks(ev.x, ev.y, -tx, -ty, Math.round(3 + 4 * s), (260 + 120 * s) * m, 0.5, d.aura, 0.3);
    damageNumber('-' + MBF.V.fmt(res.damage), ev.x + ev.nx * 26 * m, ev.y + ev.ny * 26 * m + 18 * m, res.level, res.t, false);

    // level 1+: shockwave ring + light shake
    if (res.level >= 1) {
      R.fx.ring(ev.x, ev.y, a.aura, 8 * m, (70 + 70 * res.t + 40 * (res.level - 1)) * m, 0.45, 0.07);
      R.fx.shake((calm ? 0.04 : 0.1) + (calm ? 0.02 : 0.1) * res.t);
    }
    // level 2+: flash, hit-stop, debris, a ring around the defender, camera punch
    if (res.level >= 2) {
      var dr = world.def.r;
      R.fx.ring(world.def.x, world.def.y, d.aura, dr * 1.02, dr * (1.7 + 0.5 * res.t), 0.6, 0.04);
      R.fx.debris(ev.x, ev.y, Math.round(10 + 22 * res.t), (200 + 120 * res.t) * m, 9 + 6 * res.t, d.aura);
      R.fx.shake(calm ? 0.06 : 0.2 + 0.15 * res.t);
      R.fx.punch(calm ? 0.01 : 0.02 + 0.025 * res.t);
      R.fx.pulse(0.4 + 0.4 * res.t, a.aura);
      if (!busy) hitStop = Math.max(hitStop, 0.05 + 0.05 * res.t);
      if (!busy && canFlash(now)) R.fx.flash(calm ? 0.08 : 0.22 + 0.2 * res.t, [1, 0.95, 0.85], ev.x, ev.y);
    }
    // level 3+: colour fringing and lightning crawling over the defender
    if (res.level >= 3) {
      var t3 = res.level > 3 ? 1 : res.t;
      R.fx.aberration((calm ? 0.25 : 0.7) + (calm ? 0.2 : 0.6) * t3);
      var nb = calm ? 1 + Math.round(t3) : 2 + Math.round(3 * t3);
      lightningBurst(ev, nb, a.aura, 1 + 0.5 * t3, calm);
    }
    // level 4: the screen cracks like glass and shards fly out of the hit
    if (res.level >= 4) {
      var t4 = res.level > 4 ? 1 : res.t;
      if (!busy || now - lastShatter > 350) {
        lastShatter = now;
        var crack = res.level >= 6 ? 0.45 : 1;                // let the kaleidoscope show through at level 6
        R.fx.shatter(((calm ? 0.3 : 0.6) + (calm ? 0.15 : 0.4) * t4) * crack, ev.x, ev.y);
      }
      R.fx.shards(ev.x, ev.y, ev.nx, ev.ny, Math.round((calm ? 6 : 12) + 18 * t4),
        (520 + 360 * t4) * m, (14 + 12 * t4) * m, 2.6);
      R.fx.aberration((calm ? 0.4 : 1.1) + 0.6 * t4);
      R.fx.punch(calm ? 0.015 : 0.04 + 0.03 * t4);
      // bolts that leap out across the arena
      if (!calm) for (var k = 0; k < 2 + Math.round(3 * t4); k++) {
        var ang = Math.atan2(ev.ny, ev.nx) + (Math.random() - 0.5) * 2.2, len = (180 + 260 * Math.random()) * m;
        R.fx.lightning(ev.x, ev.y, ev.x + Math.cos(ang) * len, ev.y + Math.sin(ang) * len, a.aura, 5 * m, 0.28, calm);
      }
    }
    // level 5: the whole screen twists into a whirlpool around the defender
    if (res.level >= 5) {
      var t5 = res.level > 5 ? 1 : res.t;
      var dir = Math.random() < 0.5 ? -1 : 1;
      if (!busy || now - lastWarp > 300) {
        lastWarp = now;
        R.fx.swirl(dir * ((calm ? 0.35 : 1.1) + (calm ? 0.2 : 1.3) * t5), world.def.x, world.def.y);
      }
      R.fx.vortex(world.def.x, world.def.y, world.def.r * 1.3, Math.round(((calm ? 20 : 40) + 50 * t5) * (busy ? 0.4 : 1)),
        (260 + 200 * t5) * m * dir, a.aura);
      if (!busy) R.fx.ring(world.def.x, world.def.y, a.aura, world.def.r * 0.4, world.def.r * (3 + t5), 0.8, 0.035);
    }
    // level 6: kaleidoscope mirror and echoing trails, stronger the deeper into Graham's sequence
    // level 7: datamosh - the picture breaks into jumping, smearing, checkerboard blocks
    if (res.level >= 7 && (!busy || now - lastGlitch > 300)) {
      var t7 = res.level > 7 ? 1 : res.t;
      lastGlitch = now;
      R.fx.glitch(calm ? 0.15 : 0.55 + 0.45 * t7);
      R.fx.debris(ev.x, ev.y, Math.round((calm ? 8 : 20) + 20 * t7), (300 + 200 * t7) * m, 7 * m + 6, [1, 1, 1]);
    }
    // level 8: fever dream - everything flows, drips and melts into a mirror of itself
    if (res.level >= 8 && (!busy || now - lastDream > 500)) {
      lastDream = now;
      R.fx.dream(calm ? 0.2 : 0.75 + 0.25 * res.t);
      R.fx.swirl((calm ? 0.3 : 0.9) * (Math.random() < 0.5 ? -1 : 1), world.def.x, world.def.y);
    }
    if (res.level >= 6 && (!busy || now - lastTrip > 450)) {
      var t6 = res.level > 6 ? 1 : res.t;
      lastTrip = now;
      if (!calm) R.fx.kaleido(0.5 + 0.5 * t6);
      R.fx.feedback(calm ? 0.3 : 0.55 + 0.25 * t6);
    }
  }

  // bolts from the hit point crawling over the defender's surface
  function lightningBurst(ev, count, color, widthK, calm) {
    var m = world.scale(), D = world.def, base = Math.atan2(ev.ny, ev.nx);
    for (var i = 0; i < count; i++) {
      var ang = base + (Math.random() - 0.5) * 2.6;
      var rr = D.r * (0.85 + Math.random() * 0.45);
      R.fx.lightning(ev.x, ev.y, D.x + Math.cos(ang) * rr, D.y + Math.sin(ang) * rr,
        color, (3 + 2 * Math.random()) * widthK * m, 0.2 + Math.random() * 0.12, calm);
    }
  }

  function knockout(ev, res) {
    var now = performance.now();
    var a = fight.attacker, d = fight.defender;
    var m = world.scale(), calm = !!settings.calm;
    var s = res.level + res.t;
    var dx = world.def.x, dy = world.def.y, dr = world.def.r;
    attV.boing(0.25); defV.boing(0.2);
    SND.stopTheme();
    SND.ko(res.level, { calm: calm });
    slowT = calm ? 0.4 : 0.9;
    hitStop = 0.12;
    R.fx.ring(dx, dy, d.aura, dr, dr * 3.2, 0.9, 0.05);
    R.fx.ring(dx, dy, a.aura, dr * 0.5, dr * 4.5, 1.2, 0.03);
    R.fx.ring(ev.x, ev.y, [1, 1, 1], 6 * m, dr * 2, 0.5, 0.08);
    R.fx.debris(dx, dy, Math.round(50 + 25 * s), (260 + 80 * s) * m, 10 + 3 * s, d.aura);
    R.fx.sparks(dx, dy, 1, 0, Math.round(60 + 20 * s), (500 + 120 * s) * m, Math.PI * 2, a.aura, 0.5);
    R.fx.shake(calm ? 0.15 : 0.55 + 0.1 * s);
    R.fx.punch(calm ? 0.02 : 0.06);
    R.fx.pulse(1, d.aura);
    if (canFlash(now)) R.fx.flash(calm ? 0.12 : 0.55, [1, 0.9, 0.95], dx, dy);
    // bigger K.O.s borrow the higher-level effects
    if (res.level >= 4) {
      R.fx.aberration(calm ? 0.4 : 1.2);
      lightningBurst(ev, calm ? 2 : 6, a.aura, 1.4, calm);
    }
    if (res.level >= 5) {
      R.fx.shatter(calm ? 0.45 : 1.0, dx, dy);
      R.fx.shards(dx, dy, 1, 0, calm ? 16 : 44, 700 * m, 22 * m, Math.PI * 2);
      R.fx.aberration(calm ? 0.5 : 1.8);
      if (!calm) for (var k = 0; k < 8; k++) {
        var ang = Math.random() * Math.PI * 2, len = (260 + 300 * Math.random()) * m;
        R.fx.lightning(dx, dy, dx + Math.cos(ang) * len, dy + Math.sin(ang) * len, d.aura, 6 * m, 0.4, calm);
      }
    }
    if (res.level >= 6) {
      R.fx.swirl((calm ? 0.5 : 2.2) * (Math.random() < 0.5 ? -1 : 1), dx, dy);
      R.fx.vortex(dx, dy, dr * 1.2, calm ? 40 : 120, 520 * m, a.aura);
    }
    if (res.level >= 7) {
      if (!calm) R.fx.kaleido(1);
      R.fx.feedback(calm ? 0.4 : 0.9);
    }
    if (res.level >= 8) R.fx.glitch(calm ? 0.2 : 1);
    if (res.level >= 9) R.fx.dream(calm ? 0.3 : 1.2);
    damageNumber('-' + MBF.V.fmt(res.damage), ev.x + ev.nx * 26 * m, ev.y + ev.ny * 26 * m + 18 * m, Math.min(res.level, 4), res.t, false);
    damageNumber('K.O.!', dx, dy + dr * 0.2, Math.min(res.level, 3), 1, true);
    world.defGone = true;
    koAt = now;
    $('banner').classList.remove('show');
    phase = 'ko'; koT = 1.7;
    input.setEnabled(false);
  }

  function onHit(ev) {
    var res = fight.hit();
    if (!res) return;
    hitTimes.push(performance.now());
    if (hitTimes.length > 24) hitTimes.shift();
    hudDirty = true;
    if (fight.isFunction) labelDue = true;
    defV.setHp(fight.hpFraction());
    if (res.ko) knockout(ev, res); else impact(ev, res);
  }

  function showKoCard() {
    var a = fight.attacker, d = fight.defender;
    var secs = (koAt - fightStart) / 1000;
    var hits = fight.hits === 1n ? '<b>1</b> hit' : '<b>' + MBF.fmt(fight.hits) + '</b> hits';
    var html = '<b>' + esc(a.name) + '</b> destroyed <b>' + esc(d.name) + '</b> in ' + hits +
      ' (' + MBF.describeWait(Math.log10(Math.max(1, secs))) + ').';
    var V = MBF.V;
    if (V.isExact(fight.dealt) && V.isExact(fight.maxHp)) {
      var over = fight.dealt.b - fight.maxHp.b;
      if (over > 0n) html += '<br>Overkill: <b>' + MBF.fmt(over) + '</b> extra damage.';
    } else if (V.cmp(fight.dealt, fight.maxHp) > 0 && !(V.log10(fight.dealt) < V.log10(fight.maxHp) + 0.01)) {
      html += '<br>Overkill: about <b>' + esc(V.fmt(fight.dealt)) + '</b> damage in total.';
    }
    if (fight.isFunction) html += '<br>Final hit: <b>' + esc(MBF.fnLabel(a, fight.input - 1)) + '</b>.';
    $('ko-text').innerHTML = html;
    $('ko').classList.add('on');
    document.body.classList.remove('fighting');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ------------------------------------------------------------ loop
  var axis = new THREE.Vector3(), dq = new THREE.Quaternion();
  function spin(q, b, dt) {
    var w = Math.hypot(b.wx, b.wy, b.wz);
    if (w < 1e-6) return;
    var ang = Math.min(w * dt, 0.7);
    axis.set(b.wx / w, b.wy / w, b.wz / w);
    dq.setFromAxisAngle(axis, ang);
    q.premultiply(dq);
  }

  var last = performance.now();
  function frame(now) {
    root.requestAnimationFrame(frame);
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;

    if (phase === 'intro') {
      introT -= dt;
      if (introT <= 0) { phase = 'fight'; banner('FIGHT!', ''); fightStart = performance.now(); }
    }
    if ((phase === 'fight' || phase === 'ko') && world) {
      var ts = 1;
      if (hitStop > 0) { hitStop -= dt; ts = 0; }
      if (slowT > 0) { slowT -= dt; ts *= 0.25; }
      if (settings.mode === 'watch') ts *= speed;
      var simDt = dt * ts;
      var inp = settings.mode === 'fight' && phase === 'fight' ? input.read() : null;
      var n = Math.min(400, Math.ceil(simDt * 240));
      var h = n ? simDt / n : 0;
      for (var i = 0; i < n; i++) {
        var evs = world.step(h, inp);
        if (inp) inp.dash = false;
        for (var j = 0; j < evs.length && !fight.over; j++) onHit(evs[j]);
        if (hitStop > 0) break;
      }
      if (world.dashed) {
        world.dashed = false;
        SND.dash();
        var aa = world.att;
        R.fx.sparks(aa.x, aa.y, -aa.vx, -aa.vy, 14, 260 * world.scale(), 0.9, fight.attacker.aura, 0.5);
      }
      spin(attQ, world.att, simDt);
      spin(defQ, world.def, simDt);
      if (phase === 'ko') {
        koT -= dt;
        defFade = Math.max(0, defFade - dt * 2.2);
        if (koT <= 0) { phase = 'done'; showKoCard(); }
      }
    }

    // function balls relabel after each hit: 1! -> 2! -> 3! (at most ~14 times a second)
    if (labelDue && fight && now - lastLabel > 70) {
      labelDue = false; lastLabel = now;
      if (fight.over) {
        var finalLabel = MBF.fnLabel(fight.attacker, fight.input - 1);
        attV.setLabel(finalLabel);
        $('att-dmg').textContent = 'Final hit: ' + finalLabel;
      } else {
        attV.setLabel(fight.label());
        refreshAttackerText();
      }
      var fnK = fight.attacker.fn;
      if (fnK === 'tree' || fnK === 'fish7' || fnK === 'garden') attV.setK(fight.over ? fight.input - 1 : fight.input);   // TREE seed colours / Fish count
    }

    if (world && attV) {
      // comet trail behind the attacker
      var A = world.att, sp = Math.hypot(A.vx, A.vy);
      if (sp > 60 && phase !== 'paused') {
        var c = fight.attacker.aura;
        R.fx.sparks(A.x - A.vx / sp * A.r * 0.6, A.y - A.vy / sp * A.r * 0.6, -A.vx, -A.vy,
          1, sp * 0.15, 0.6, c, 0.15);
      }
      attV.setPos(A.x, A.y);
      defV.setPos(world.def.x, world.def.y);
      attV.setOrientation(attQ);
      defV.setOrientation(defQ);
      defV.lookAt(A.x, A.y);                       // Rayo's eye follows its opponent
      attV.lookAt(world.def.x, world.def.y);
      if (phase === 'ko' || phase === 'done') {
        defV.setFade(defFade);
        defV.scale += dt * 0.6 * defFade;
      }
      attV.tick(dt, R.time);
      defV.tick(dt, R.time);
    }
    updateHud(dt);
    R.update(dt);
    R.render();
  }

  root.addEventListener('resize', function () {
    R.resize();
    if (world && fight) {
      world.resize(R.W, R.H);
      var r = radii();
      world.att.r = r.a; world.def.r = r.d;
      attV.setRadius(r.a); defV.setRadius(r.d);
    }
  });

  refreshMenu();
  refreshSpeed();
  function fictionalReady() {
    if (!MBF.ballById(settings.att)) settings.att = 'n1';
    if (!MBF.ballById(settings.def)) settings.def = 'n1';
    showBalls();
    sheets.prune();
    if (query('go') === '1') startFight();
  }
  var fxUrl = $('stage').getAttribute('data-fictional');
  function useFictional(data) { if (data && data.numbers) MBF.addFictional(data); fictionalReady(); }
  if (fxUrl && root.fetch) {
    var dataKey = 'data:' + fxUrl;                        // the URL carries a version, so updates miss the cache
    MBF.cache.get(dataKey).then(function (cached) {
      if (cached) return useFictional(cached);
      root.fetch(fxUrl).then(function (r) { return r.json(); })
        .then(function (data) {
          MBF.cache.keys().then(function (keys) {           // drop older copies of the list
            (keys || []).forEach(function (k) { if (/^data:/.test(k) && k !== dataKey) MBF.cache.del(k); });
          });
          MBF.cache.put(dataKey, data);
          useFictional(data);
        })
        .catch(function () { fictionalReady(); });
    });
  } else fictionalReady();
  root.requestAnimationFrame(frame);
})(window);
