/*
 * Math Ball Fighting - the defender fights back (the "Defender fights back" option).
 *
 *   var d = MBF.createDefense({ R, world, ball: defenderBall, defV, mode, calm, onAnnounce });
 *   var hits = d.step(simDt);   // inside the physics sub-steps; returns hits on the attacker
 *   d.draw(realDt);             // once a frame: projectile glows, telegraphs, beam positions
 *   d.stop();                   // fight over: clear everything
 *
 * Every few seconds the defender winds up (a visible telegraph) and fires its own attack.
 * In Fight mode the aim locks a moment before firing, so a quick player can dodge; in Watch
 * mode it aims at the last moment and leads the target. One attack lands at most one hit,
 * however many beams or shots it has. Each hit is { x, y, dx, dy, name }: where on the
 * attacker it landed and which way the blow was travelling.
 *
 * Attack kinds:
 *   beam   straight beams from points on the ball (eyes) through the target to the arena edge
 *   shots  a volley of glowing projectiles, optionally homing, in a fan or all the way round
 *   ring   shockwaves expanding from the defender (limited range: far enough away is safe)
 *   bolt   lightning that strikes the target point
 *   smite  a column of light from the top of the arena onto the target point
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var TAU = Math.PI * 2;

  // eye positions (in defender radii, +y up) - match the shaders
  var RAYO_EYE = [[0, 0.1]];
  var GOTCH_EYES = [[-0.43, -0.03], [-0.06, 0.3], [0.45, -0.03]];

  // Speeds, sizes and widths are in pixels on an 800px-tall arena (scaled to the screen).
  MBF.ATTACKS = {
    n1: { name: 'Pearl Shot', kind: 'shots', count: 1, speed: 560, size: 18, colors: [[1, 0.95, 0.85]] },
    n2: { name: 'Binary Burst', kind: 'shots', count: 2, spread: 0.35, speed: 600, size: 14, colors: [[1, 1, 1], [0.3, 0.7, 1]] },
    n3: { name: 'Triangle Volley', kind: 'shots', count: 3, spread: 0.6, speed: 560, size: 14 },
    n5: { name: 'Petal Storm', kind: 'shots', count: 5, spread: 1.4, speed: 420, size: 12, homing: 2.2 },
    n7: { name: 'Rainbow Ray', kind: 'beam', eyes: [[0, 0]], width: 30, life: 0.5, rainbow: true },
    n10: { name: 'Ten-Shot Ring', kind: 'shots', count: 10, spread: TAU, speed: 460, size: 12 },
    n12: { name: 'Clock Strike', kind: 'shots', count: 12, spread: TAU, speed: 420, size: 11, colors: [[1, 0.85, 0.4]] },
    n42: { name: 'Nebula Orb', kind: 'shots', count: 1, speed: 300, size: 30, homing: 2.6, life: 5 },
    n100: { name: 'Hundred Hail', kind: 'shots', count: 10, spread: 1.0, speed: 520, size: 10 },
    n1000: { name: 'Mosaic Shards', kind: 'shots', count: 8, spread: 0.8, speed: 680, size: 10 },
    million: { name: 'Sandstorm', kind: 'shots', count: 16, spread: 1.0, speed: 640, size: 7, colors: [[1, 0.85, 0.5], [1, 0.7, 0.35]] },
    billion: { name: 'City Lightning', kind: 'bolt', count: 2 },
    googol: { name: 'Googol Wave', kind: 'ring', waves: 1, speed: 520 },
    googolplex: { name: 'Galaxy Spiral', kind: 'shots', count: 6, spread: TAU, speed: 380, size: 13, homing: 1.8, colors: [[0.75, 0.55, 1], [0.4, 0.8, 1]] },
    skewes: { name: 'Prime Spiral', kind: 'shots', count: 7, spread: TAU, speed: 420, size: 12, homing: 1.2 },
    googolplexplex: { name: 'Double Wave', kind: 'ring', waves: 2, speed: 560 },
    bb6: { name: 'Turing Tape', kind: 'shots', count: 6, spread: 0.9, speed: 560, size: 12, colors: [[1, 1, 1], [1, 0.75, 0.3]] },
    moser: { name: 'Shape Barrage', kind: 'shots', count: 3, spread: 0.5, speed: 520, size: 17, colors: [[1, 0.45, 0.3], [1, 0.8, 0.3], [0.4, 0.8, 1]] },
    graham: { name: 'Hypercube Lightning', kind: 'bolt', count: 4 },
    tree3: { name: 'Vine Lash', kind: 'bolt', count: 3, color: [0.4, 1, 0.5] },
    sscg3: { name: 'Graph Zap', kind: 'bolt', count: 3 },
    scg13: { name: 'Graph Zap', kind: 'bolt', count: 3 },
    loader: { name: 'Lambda Laser', kind: 'beam', eyes: [[0, 0]], width: 18, life: 0.45 },
    rayo: { name: 'EYE BEAM', kind: 'beam', eyes: RAYO_EYE, width: 46, life: 0.6, color: [1, 0.15, 0.1] },
    gotch: { name: 'TRIPLE EYE BEAM', kind: 'beam', eyes: GOTCH_EYES, width: 30, life: 0.65, color: [1, 0.15, 0.45] },
    fish7: { name: 'Fish Swarm', kind: 'shots', count: 7, spread: 1.6, speed: 400, size: 12, homing: 2.6, life: 4 },
    bigfoot: { name: 'BIG STOMP', kind: 'ring', waves: 1, speed: 640, width: 60, range: 420, stomp: true },
    lngn: { name: 'Petal Bloom', kind: 'shots', count: 10, spread: TAU, speed: 400, size: 12, homing: 0.8, colors: [[1, 0.5, 0.8], [1, 0.85, 0.3], [0.6, 1, 0.6]] },
    oblivion: { name: 'Void Wave', kind: 'ring', waves: 2, speed: 480, color: [0.6, 0.45, 1] },
    utter: { name: 'Endless Rings', kind: 'ring', waves: 4, speed: 520, color: [0.85, 0.8, 1] },
    infinity: { name: 'Infinity Beam', kind: 'beam', eyes: [[-0.4, 0], [0.4, 0]], width: 22, life: 0.6, color: [1, 0.95, 0.7] },
    numbers: { name: 'Digit Storm', kind: 'shots', count: 18, spread: 1.3, speed: 560, size: 10, rainbow: true },
    hagi: { name: 'HEAVENLY SMITE', kind: 'smite', width: 110, life: 0.7, color: [1, 0.9, 0.55] }
  };
  var GENERIC = [
    { name: 'Fictional Beam', kind: 'beam', eyes: [[0, 0]], width: 26, life: 0.5 },
    { name: 'Fictional Barrage', kind: 'shots', count: 5, spread: 0.9, speed: 520, size: 12, homing: 1 },
    { name: 'Fictional Wave', kind: 'ring', waves: 2, speed: 520 },
    { name: 'Fictional Lightning', kind: 'bolt', count: 3 }
  ];
  function strHash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  MBF.attackFor = function (ball) {
    return MBF.ATTACKS[ball.id] || GENERIC[strHash(ball.id) % GENERIC.length];
  };

  function hsv(h) {
    var f = function (n) { var k = (n + h * 6) % 6; return 1 - Math.max(0, Math.min(k, 4 - k, 1)) * 0.75; };
    return [f(5), f(3), f(1)];
  }
  // distance from point (px, py) to segment (x0, y0)-(x1, y1)
  function segDist(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    var u = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L2));
    return Math.hypot(px - x0 - dx * u, py - y0 - dy * u);
  }

  MBF.createDefense = function (o) {
    var R = o.R, w = o.world, ball = o.ball, spec = MBF.attackFor(ball);
    var color = spec.color || ball.aura;
    var fightMode = o.mode === 'fight';
    var WIND = spec.kind === 'smite' ? 1.1 : spec.kind === 'beam' ? 0.9 : 0.7;
    var LOCK = fightMode ? (spec.kind === 'beam' ? 0.3 : 0.35) : 0.02;   // aim stops following this long before firing
    var D = { spec: spec, name: spec.name, stopped: false };
    var clock = 1.3 + Math.random() * 0.6;          // until the next wind-up
    var cur = null;                                 // the attack in progress
    var shots = [], beams = [], rings = [], columns = [];
    var hits = [];
    var tele = null;                                // telegraph beams / marker during the wind-up

    function m() { return w.scale(); }
    function colorAt(i) {
      if (spec.rainbow) return hsv(((i * 0.13) + R.time * 0.4) % 1);
      if (spec.colors) return spec.colors[i % spec.colors.length];
      return color;
    }
    function eyePos(e) { return [w.def.x + e[0] * w.def.r, w.def.y + e[1] * w.def.r]; }

    function aim() {
      var a = w.att;
      if (fightMode) return [a.x, a.y];
      var lead = spec.kind === 'shots' ? 0.12 : 0.05;   // watch mode: lead the bouncing attacker a little
      return [a.x + a.vx * lead, a.y + a.vy * lead];
    }

    function register(atk, sx, sy) {
      if (atk.hit) return;
      atk.hit = true;
      var a = w.att, dx = a.x - sx, dy = a.y - sy, L = Math.hypot(dx, dy) || 1;
      hits.push({ x: a.x - dx / L * a.r, y: a.y - dy / L * a.r, dx: dx / L, dy: dy / L, name: spec.name });
    }

    function start() {
      var p = aim();
      cur = { phase: 'wind', t: 0, hit: false, ax: p[0], ay: p[1] };
      if (o.defV) o.defV.boing(0.06, true);
    }

    function fire() {
      cur.phase = 'fire';
      var M = m(), d = w.def, k = spec.kind;
      if (o.onAnnounce) o.onAnnounce(spec.name, d.x, d.y + d.r * 1.05);
      if (k === 'beam') {
        var reach = Math.hypot(w.W, w.H) * 1.2;
        (spec.eyes || [[0, 0]]).forEach(function (e, i) {
          var p0 = eyePos(e), dx = cur.ax - p0[0], dy = cur.ay - p0[1], L = Math.hypot(dx, dy) || 1;
          beams.push({ atk: cur, e: e, dx: dx / L, dy: dy / L, reach: reach, t: 0, life: spec.life || 0.5,
            w: (spec.width || 24) * M, i: i, h: null });
        });
      } else if (k === 'shots') {
        var n = spec.count || 1, spread = spec.spread || 0, base = Math.atan2(cur.ay - d.y, cur.ax - d.x);
        for (var i = 0; i < n; i++) {
          var ang = spread >= TAU - 1e-3 ? base + i * TAU / n : base + (n > 1 ? (i / (n - 1) - 0.5) * spread : 0);
          var sp = (spec.speed || 500) * M, sz = (spec.size || 12) * M;
          shots.push({ atk: cur, x: d.x + Math.cos(ang) * (d.r + sz), y: d.y + Math.sin(ang) * (d.r + sz),
            vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, sp: sp, r: sz, t: 0, life: spec.life || 3.5, c: colorAt(i), i: i });
        }
      } else if (k === 'ring') {
        for (var wv = 0; wv < (spec.waves || 1); wv++) {
          rings.push({ atk: cur, delay: wv * 0.28, r: d.r, x: d.x, y: d.y, sp: (spec.speed || 520) * M,
            bw: (spec.width || 30) * M, max: d.r + (spec.range || 340) * M, shown: false, wv: wv });   // out of range = safe
        }
        if (spec.stomp) { R.fx.shake(o.calm ? 0.1 : 0.45); R.fx.punch(o.calm ? 0.01 : 0.03); }
      } else if (k === 'bolt') {
        var a = w.att, nb = spec.count || 2;
        for (var b = 0; b < nb; b++) {
          var ang2 = Math.atan2(cur.ay - d.y, cur.ax - d.x) + (b - (nb - 1) / 2) * 0.5;
          var sx = d.x + Math.cos(ang2) * d.r, sy = d.y + Math.sin(ang2) * d.r;
          var jx = b ? (Math.random() - 0.5) * 30 * M : 0, jy = b ? (Math.random() - 0.5) * 30 * M : 0;
          R.fx.lightning(sx, sy, cur.ax + jx, cur.ay + jy, color, (7 + 2 * Math.random()) * M, 0.35, o.calm);
        }
        R.fx.sparks(cur.ax, cur.ay, 0, 1, 18, 260 * M, TAU, color, 0.5);
        if (Math.hypot(a.x - cur.ax, a.y - cur.ay) < a.r + 34 * M) register(cur, d.x, d.y);
      } else if (k === 'smite') {
        columns.push({ atk: cur, x: cur.ax, t: 0, life: spec.life || 0.7, w: (spec.width || 100) * M, h: null });
        R.fx.ring(cur.ax, cur.ay, color, 10 * M, 120 * M, 0.6, 0.06);
        R.fx.shake(o.calm ? 0.08 : 0.3);
      }
    }

    // ---------------------------------------------------------------- simulation (sim time)
    D.step = function (h) {
      hits = [];
      if (D.stopped) return hits;
      var a = w.att, M = m();
      if (!cur) { clock -= h; if (clock <= 0) start(); }
      if (cur && cur.phase === 'wind') {
        cur.t += h;
        var wind = WIND;
        if (cur.t < wind - LOCK) { var p = aim(); cur.ax = p[0]; cur.ay = p[1]; }
        if (cur.t >= wind) fire();
      }
      // beams: follow the defender, hit anything on the line while they last
      for (var i = beams.length - 1; i >= 0; i--) {
        var bm = beams[i];
        bm.t += h;
        if (bm.t >= bm.life) { if (bm.h) bm.h.free(); beams.splice(i, 1); continue; }
        var p0 = eyePos(bm.e);
        if (bm.t > 0.04 && segDist(a.x, a.y, p0[0], p0[1], p0[0] + bm.dx * bm.reach, p0[1] + bm.dy * bm.reach) < a.r + bm.w * 0.4)
          register(bm.atk, p0[0], p0[1]);
      }
      // projectiles
      for (var j = shots.length - 1; j >= 0; j--) {
        var s = shots[j];
        s.t += h;
        if (spec.homing && !s.atk.hit) {
          var want = Math.atan2(a.y - s.y, a.x - s.x), have = Math.atan2(s.vy, s.vx);
          var diff = Math.atan2(Math.sin(want - have), Math.cos(want - have));
          var turn = Math.max(-spec.homing * h, Math.min(spec.homing * h, diff));
          have += turn; s.vx = Math.cos(have) * s.sp; s.vy = Math.sin(have) * s.sp;
        }
        s.x += s.vx * h; s.y += s.vy * h;
        var out = Math.abs(s.x) > w.W / 2 + 60 || Math.abs(s.y) > w.H / 2 + 60;
        if (!s.atk.hit && Math.hypot(a.x - s.x, a.y - s.y) < a.r + s.r) {
          register(s.atk, s.x - s.vx * 0.02, s.y - s.vy * 0.02);
          R.fx.sparks(s.x, s.y, s.vx, s.vy, 10, 240 * M, 1.6, s.c, 0.4);
          shots.splice(j, 1); continue;
        }
        if (out || s.t > s.life) shots.splice(j, 1);
      }
      // shockwaves
      for (var k = rings.length - 1; k >= 0; k--) {
        var rg = rings[k];
        if (rg.delay > 0) { rg.delay -= h; continue; }
        rg.r += rg.sp * h;
        var dist = Math.hypot(a.x - rg.x, a.y - rg.y);
        if (Math.abs(dist - rg.r) < a.r + rg.bw * 0.5) register(rg.atk, rg.x, rg.y);
        if (rg.r > rg.max) rings.splice(k, 1);
      }
      // columns of light
      for (var c = columns.length - 1; c >= 0; c--) {
        var col = columns[c];
        col.t += h;
        if (col.t >= col.life) { if (col.h) col.h.free(); columns.splice(c, 1); continue; }
        if (col.t > 0.05 && Math.abs(a.x - col.x) < a.r + col.w * 0.4) register(col.atk, col.x, a.y + 200);
      }
      if (cur && cur.phase === 'fire' && !beams.length && !shots.length && !rings.length && !columns.length) {
        cur = null;
        clock = (fightMode ? 2.0 : 2.4) + Math.random() * 0.8;
      }
      return hits;
    };

    // ---------------------------------------------------------------- visuals (real time)
    D.draw = function (dt) {
      if (D.stopped) return;
      var M = m(), d = w.def, a = w.att;
      // wind-up telegraph
      if (cur && cur.phase === 'wind') {
        var prog = Math.min(1, cur.t / WIND), locked = cur.t >= WIND - LOCK;
        if (spec.kind === 'beam') {
          if (!tele) tele = (spec.eyes || [[0, 0]]).map(function () { return R.fx.beam(color); });
          (spec.eyes || [[0, 0]]).forEach(function (e, i) {
            var p0 = eyePos(e), dx = cur.ax - p0[0], dy = cur.ay - p0[1], L = Math.hypot(dx, dy) || 1;
            var reach = Math.hypot(w.W, w.H) * 1.2;
            if (tele[i]) {
              tele[i].set(p0[0], p0[1], p0[0] + dx / L * reach, p0[1] + dy / L * reach, (3 + 4 * prog) * M);
              tele[i].alpha((locked ? 0.55 : 0.22) * (0.7 + 0.3 * Math.sin(R.time * 30)));
            }
            // energy gathering at the eye
            var ang = Math.random() * TAU, rr = (30 + 40 * Math.random()) * M;
            R.fx.dot(p0[0] + Math.cos(ang) * rr, p0[1] + Math.sin(ang) * rr, -Math.cos(ang) * rr * 5, -Math.sin(ang) * rr * 5,
              0.18, 4 + 4 * Math.random(), color);
            R.fx.dot(p0[0], p0[1], 0, 0, 0.08, (8 + 26 * prog) * M, color);
          });
        } else if (spec.kind === 'smite') {
          if (!tele) tele = [R.fx.beam(color)];
          if (tele[0]) {
            tele[0].set(cur.ax, w.H / 2 + 40, cur.ax, -w.H / 2 - 40, (6 + 10 * prog) * M);
            tele[0].alpha(locked ? 0.35 : 0.15);
          }
          if (Math.random() < dt * 8) R.fx.ring(cur.ax, cur.ay, color, 90 * M, 30 * M, 0.35, 0.08);
        } else {
          // gathering glow around the defender
          for (var g = 0; g < 2; g++) {
            var an = Math.random() * TAU, r0 = d.r * (1.3 + 0.4 * Math.random());
            R.fx.dot(d.x + Math.cos(an) * r0, d.y + Math.sin(an) * r0, -Math.cos(an) * r0 * 3, -Math.sin(an) * r0 * 3,
              0.25, 5 + 5 * Math.random(), colorAt(g));
          }
          if (spec.kind === 'bolt' && locked) R.fx.dot(cur.ax, cur.ay, 0, 0, 0.06, 26 * M, color);
        }
      } else if (tele) {
        tele.forEach(function (t) { if (t) t.free(); });
        tele = null;
      }
      // beams
      beams.forEach(function (bm) {
        if (!bm.h) bm.h = R.fx.beam(spec.rainbow ? hsv(0) : color);
        if (!bm.h) return;
        var p0 = eyePos(bm.e), f = bm.t / bm.life;
        bm.h.set(p0[0], p0[1], p0[0] + bm.dx * bm.reach, p0[1] + bm.dy * bm.reach, bm.w * (f < 0.1 ? f / 0.1 : 1));
        bm.h.alpha(f > 0.7 ? (1 - f) / 0.3 : 1);
        if (spec.rainbow) bm.h.color(hsv((R.time * 1.5) % 1));
        R.fx.dot(p0[0], p0[1], 0, 0, 0.06, bm.w * 1.6, [1, 1, 1]);
      });
      // projectiles: a bright head and a short trail
      shots.forEach(function (s) {
        var c = spec.rainbow ? colorAt(s.i) : s.c;
        R.fx.dot(s.x, s.y, 0, 0, 0.07, s.r * 2.2, c);
        R.fx.dot(s.x, s.y, 0, 0, 0.05, s.r * 1.1, [1, 1, 1]);
        R.fx.dot(s.x, s.y, -s.vx * 0.15, -s.vy * 0.15, 0.22, s.r * 1.2, c);
      });
      // shockwaves (fire-and-forget rings, started when each wave begins)
      rings.forEach(function (rg) {
        if (rg.delay > 0 || rg.shown) return;
        rg.shown = true;
        var dur = (rg.max - rg.r) / rg.sp;
        R.fx.ring(rg.x, rg.y, spec.color || ball.aura, rg.r, rg.max, dur, 0.03);
        R.fx.ring(rg.x, rg.y, [1, 1, 1], rg.r, rg.max, dur, 0.012);
      });
      // columns of light
      columns.forEach(function (col) {
        if (!col.h) col.h = R.fx.beam(color);
        if (!col.h) return;
        var f = col.t / col.life;
        col.h.set(col.x, w.H / 2 + 40, col.x, -w.H / 2 - 40, col.w * (f < 0.1 ? f / 0.1 : 1));
        col.h.alpha(f > 0.6 ? (1 - f) / 0.4 : 1);
        if (Math.random() < 0.5) R.fx.sparks(col.x, -w.H / 2 + 10, 0, 1, 3, 300 * M, 1.2, color, 0.6);
      });
    };

    D.stop = function () {
      D.stopped = true;
      beams.forEach(function (b) { if (b.h) b.h.free(); });
      columns.forEach(function (c) { if (c.h) c.h.free(); });
      if (tele) tele.forEach(function (t) { if (t) t.free(); });
      beams = []; shots = []; rings = []; columns = []; tele = null; cur = null;
    };
    return D;
  };
})(typeof window !== 'undefined' ? window : globalThis);
