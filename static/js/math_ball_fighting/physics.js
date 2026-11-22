/*
 * Math Ball Fighting - arena physics (no DOM, no three.js).
 *
 *   var w = MBF.createWorld({ W, H, mode: 'watch'|'fight', wander: false });
 *   w.place(attackerRadius, defenderRadius);
 *   var hits = w.step(dt, input);   // input = { x, y, dash } for fight mode
 *
 * World units are CSS pixels, origin at the centre, +y up. Each hit event is
 * { x, y, nx, ny, speed } where (nx, ny) points from the defender to the attacker.
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};

  function body(r) {
    return { x: 0, y: 0, vx: 0, vy: 0, r: r, wx: 0, wy: 0, wz: 0 };
  }

  MBF.createWorld = function (opts) {
    var w = {
      W: opts.W, H: opts.H, mode: opts.mode || 'watch', wander: !!opts.wander,
      att: body(20), def: body(100),
      cooldown: 0, dashCd: 0, wanderT: 0, wanderVx: 0, wanderVy: 0, launch: 600
    };

    function scale() { return Math.min(w.W, w.H) / 800; }
    w.scale = scale;

    w.resize = function (W, H) {
      w.W = W; w.H = H;
      clampInside(w.att); clampInside(w.def);
    };

    w.place = function (ra, rd) {
      var m = scale();
      w.att.r = ra; w.def.r = rd;
      w.def.x = 0; w.def.y = 0; w.def.vx = 0; w.def.vy = 0;
      var side = Math.random() < 0.5 ? -1 : 1;
      w.att.x = side * Math.min(w.W * 0.34, rd * 2.6 + ra);
      w.att.y = w.H * 0.18;
      clampInside(w.att);
      w.att.vx = 0; w.att.vy = 0;
      if (w.mode === 'watch') {
        // aim roughly at the defender with a sideways kick so the first bounce is not head-on
        var dx = -w.att.x, dy = -w.att.y, L = Math.hypot(dx, dy) || 1;
        var s = 420 * m;
        w.att.vx = dx / L * s + (-dy / L) * s * 0.35 * side;
        w.att.vy = dy / L * s + (dx / L) * s * 0.35 * side;
      }
      w.cooldown = 0; w.dashCd = 0; w.wanderT = 0; w.defGone = false;
    };

    function clampInside(b) {
      var hx = w.W / 2 - b.r - 4, hy = w.H / 2 - b.r - 4;
      if (hx < 0) hx = 0; if (hy < 0) hy = 0;
      b.x = Math.max(-hx, Math.min(hx, b.x));
      b.y = Math.max(-hy, Math.min(hy, b.y));
    }

    // bounce off the arena edges; returns true if it hit one
    function walls(b, e) {
      var hx = w.W / 2 - b.r - 4, hy = w.H / 2 - b.r - 4, hit = false;
      if (b.x < -hx) { b.x = -hx; if (b.vx < 0) b.vx = -b.vx * e; hit = true; }
      if (b.x > hx) { b.x = hx; if (b.vx > 0) b.vx = -b.vx * e; hit = true; }
      if (b.y < -hy) { b.y = -hy; if (b.vy < 0) b.vy = -b.vy * e; hit = true; }
      if (b.y > hy) { b.y = hy; if (b.vy > 0) b.vy = -b.vy * e; hit = true; }
      return hit;
    }

    // rolling: spin axis = z x v, rate = |v| / r  (rad/s)
    function roll(b) { b.wx = -b.vy / b.r; b.wy = b.vx / b.r; }

    w.step = function (dt, input) {
      var m = scale(), a = w.att, d = w.def, hits = [];
      w.cooldown -= dt; w.dashCd -= dt;

      // ---- defender
      if (w.wander) {
        w.wanderT -= dt;
        if (w.wanderT <= 0) {
          w.wanderT = 1.2 + Math.random() * 2;
          var ang = Math.random() * Math.PI * 2, sp = (60 + Math.random() * 90) * m;
          w.wanderVx = Math.cos(ang) * sp; w.wanderVy = Math.sin(ang) * sp;
        }
        var k = 1 - Math.exp(-dt * 1.5);
        d.vx += (w.wanderVx - d.vx) * k; d.vy += (w.wanderVy - d.vy) * k;
        d.x += d.vx * dt; d.y += d.vy * dt;
        if (walls(d, 1)) { w.wanderVx = d.vx; w.wanderVy = d.vy; }
      } else {
        // drift home if wandering was switched off mid-fight
        var h = 1 - Math.exp(-dt * 3);
        d.x -= d.x * h; d.y -= d.y * h; d.vx = 0; d.vy = 0;
      }
      roll(d);
      if (!w.wander) { d.wx = 0.12; d.wy = 0.35; d.wz = 0.05; }   // slow idle turn

      // ---- attacker
      if (w.mode === 'watch') {
        var gx = d.x - a.x, gy = d.y - a.y, gl = Math.hypot(gx, gy) || 1;
        var g = 1400 * m;
        a.vx += gx / gl * g * dt; a.vy += gy / gl * g * dt;
        var s = Math.hypot(a.vx, a.vy), vmin = 260 * m, vmax = 980 * m;
        if (s < vmin && s > 0) { a.vx *= vmin / s; a.vy *= vmin / s; }
        if (s > vmax) { a.vx *= vmax / s; a.vy *= vmax / s; }
      } else {
        var ix = input ? input.x : 0, iy = input ? input.y : 0;
        var il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
        var acc = 2300 * m;
        a.vx += ix * acc * dt; a.vy += iy * acc * dt;
        var damp = Math.exp(-dt * 2.4);
        a.vx *= damp; a.vy *= damp;
        if (input && input.dash && w.dashCd <= 0) {
          var dx = ix, dy = iy;
          if (!dx && !dy) { var vs = Math.hypot(a.vx, a.vy); if (vs > 1) { dx = a.vx / vs; dy = a.vy / vs; } }
          if (!dx && !dy) { var tx = d.x - a.x, ty = d.y - a.y, tl = Math.hypot(tx, ty) || 1; dx = tx / tl; dy = ty / tl; }
          var dl = Math.hypot(dx, dy) || 1;
          a.vx += dx / dl * 950 * m; a.vy += dy / dl * 950 * m;
          w.dashCd = 0.45;
          w.dashed = true;
        }
        var sp2 = Math.hypot(a.vx, a.vy), cap = 760 * m;
        if (sp2 > cap) { var kk = Math.max(cap / sp2, Math.exp(-dt * 3)); a.vx *= kk; a.vy *= kk; }
      }
      a.x += a.vx * dt; a.y += a.vy * dt;
      walls(a, w.mode === 'watch' ? 1 : 0.75);

      // ---- attacker vs defender
      var cx = a.x - d.x, cy = a.y - d.y, dist = Math.hypot(cx, cy), minD = a.r + d.r;
      if (!w.defGone && dist < minD) {
        var nx = dist > 1e-6 ? cx / dist : 1, ny = dist > 1e-6 ? cy / dist : 0;
        var ma = a.r * a.r, md = w.wander ? Math.max(ma * 8, d.r * d.r) : Infinity;
        var over = minD - dist;
        if (md === Infinity) { a.x += nx * over; a.y += ny * over; }
        else {
          var fa = md / (ma + md);
          a.x += nx * over * fa; a.y += ny * over * fa;
          d.x -= nx * over * (1 - fa); d.y -= ny * over * (1 - fa);
        }
        var rvx = a.vx - d.vx, rvy = a.vy - d.vy, vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          var e = w.mode === 'watch' ? 1 : 0.9;
          var j = -(1 + e) * vn / (1 / ma + (md === Infinity ? 0 : 1 / md));
          a.vx += j / ma * nx; a.vy += j / ma * ny;
          if (md !== Infinity) { d.vx -= j / md * nx; d.vy -= j / md * ny; }
          if (w.mode === 'watch') {
            // a little random deflection keeps every bounce different
            var rot = (Math.random() - 0.5) * 0.6, c = Math.cos(rot), sn = Math.sin(rot);
            var ox = a.vx, oy = a.vy;
            a.vx = ox * c - oy * sn; a.vy = ox * sn + oy * c;
            if (a.vx * nx + a.vy * ny < 0) { a.vx = -a.vx; a.vy = -a.vy; }
            // relaunch at a set speed so gravity pulls it back for the next hit
            var ls = w.launch * m * (0.85 + Math.random() * 0.3), cs = Math.hypot(a.vx, a.vy) || 1;
            a.vx *= ls / cs; a.vy *= ls / cs;
          }
          var minHit = w.mode === 'watch' ? 0 : 90 * m;
          if (-vn >= minHit && w.cooldown <= 0) {
            w.cooldown = 0.04;
            hits.push({ x: d.x + nx * d.r, y: d.y + ny * d.r, nx: nx, ny: ny, speed: -vn });
          }
        }
      }
      roll(a);
      return hits;
    };

    return w;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
