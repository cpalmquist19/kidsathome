/*
 * Digit sphere renderer for Numbers VS. Operations.
 *
 *   const sphere = NVO.createSphere(canvas);
 *   sphere.setModel({ chars: ['1','0',...], hue: 190, churn: 0 }, { burst: true });
 *   sphere.pulse();           // quick bump (used while sweeping through bosses)
 *   sphere.destroy();
 *
 * A model is just an array of characters laid out on a sphere (Fibonacci
 * spiral, so a number reads in order around it) plus a colour hue and an
 * optional "churn" rate (fraction of glyphs re-rolled per second) for numbers
 * that cannot be written out.
 */
(function (root) {
  'use strict';

  var TAU = Math.PI * 2;
  var CHURN_GLYPHS = '0123456789';
  var fibCache = {};

  function fib(n) {
    if (fibCache[n]) return fibCache[n];
    var pts = new Float32Array(n * 3);
    var ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = -1 + ((i + 0.5) / n) * 2; // starts at the top
      var r = Math.sqrt(1 - y * y);
      var th = ga * i;
      pts[i * 3] = Math.cos(th) * r;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = Math.sin(th) * r;
    }
    fibCache[n] = pts;
    return pts;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function colourTable(hue, sat) {
    // 24 depth steps, back (dim) to front (bright)
    var t = [];
    for (var k = 0; k < 24; k++) {
      var d = k / 23;
      var a = 0.10 + 0.90 * Math.pow(d, 1.6);
      var l = 46 + 34 * d;
      t.push('hsla(' + hue + ',' + sat + '%,' + l + '%,' + a.toFixed(3) + ')');
    }
    return t;
  }

  function prepare(model) {
    var n = model.chars.length;
    return {
      chars: model.chars.slice(),
      n: n,
      pts: fib(n),
      hue: model.hue == null ? 190 : model.hue,
      churn: model.churn || 0,
      accent: !!model.accent,
      accentColour: 'hsla(46,95%,68%,',
      colours: colourTable(model.hue == null ? 190 : model.hue,
        model.sat == null ? 85 : model.sat),
      rnd: (function () {
        var r = new Float32Array(n);
        for (var i = 0; i < n; i++) r[i] = Math.random();
        return r;
      })(),
      glyphs: model.glyphs || CHURN_GLYPHS
    };
  }

  function createSphere(canvas) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1;
    var CY = 0.42; // sphere centre, as a fraction of the height
    var cur = null, dying = null;
    var yaw = 0.6, pitch = 0.32, spin = 0.28;
    var vyaw = 0, vpitch = 0;
    var dragging = false, lastX = 0, lastY = 0;
    var pulseAt = -1e9, flashAt = -1e9, flashHue = 190;
    var last = performance.now(), raf = 0, alive = true;
    var reduce = root.matchMedia &&
      root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) spin = 0.06;

    function resize() {
      dpr = Math.min(root.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setModel(model, opts) {
      var now = performance.now();
      var burst = !opts || opts.burst !== false;
      var next = prepare(model);
      if (cur && burst && !reduce) {
        dying = { m: cur, t0: now };
      } else {
        dying = null;
      }
      if (burst) { flashAt = now; flashHue = next.hue; }
      cur = { m: next, t0: now, burst: burst && !reduce };
    }

    function pulse() { pulseAt = performance.now(); }

    function drawModel(m, scale, alpha, explode, now) {
      var R = Math.min(W, H * 0.78) * 0.32 * scale;
      var cx = W / 2, cy = H * CY;
      var cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      var cp = Math.cos(pitch), sp = Math.sin(pitch);
      var n = m.n, pts = m.pts;
      var spacing = Math.sqrt((4 * Math.PI * R * R) / n);
      var base = clamp(spacing * 0.92, 8, R * 0.34);
      var order = new Array(n), zs = new Float32Array(n);
      var xs = new Float32Array(n), ys = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
        var x1 = x * cyaw + z * syaw;
        var z1 = -x * syaw + z * cyaw;
        var y2 = y * cp - z1 * sp;
        var z2 = y * sp + z1 * cp;
        var k = explode > 0 ? 1 + explode * (0.5 + m.rnd[i] * 1.6) : 1;
        xs[i] = x1 * k; ys[i] = y2 * k; zs[i] = z2; order[i] = i;
      }
      order.sort(function (a, b) { return zs[a] - zs[b]; });
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var fontFamily = 'ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace';
      var lastSize = -1;
      for (var j = 0; j < n; j++) {
        var q = order[j];
        var d = (zs[q] + 1) / 2;
        var persp = 1 / (1 - 0.28 * zs[q]);
        var size = Math.round(base * (0.55 + 0.6 * d) * persp *
          ((m.accent && q === 0) ? 1.3 : 1));
        if (size < 5) continue;
        if (size !== lastSize) {
          ctx.font = '600 ' + size + 'px ' + fontFamily;
          lastSize = size;
        }
        var step = Math.min(23, Math.max(0, Math.round(d * 23)));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = (m.accent && q === 0)
          ? m.accentColour + (0.35 + 0.65 * d).toFixed(3) + ')'
          : m.colours[step];
        ctx.fillText(m.chars[q], cx + xs[q] * R * persp, cy + ys[q] * R * persp);
      }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      if (!alive) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) {
        yaw += (spin + vyaw) * dt;
        pitch += vpitch * dt;
        vyaw *= Math.pow(0.04, dt);
        vpitch *= Math.pow(0.04, dt);
        pitch += (0.32 - pitch) * Math.min(1, dt * 0.8);
      }
      ctx.clearRect(0, 0, W, H);

      // soft core glow
      var hue = cur ? cur.m.hue : 190;
      var g = ctx.createRadialGradient(W / 2, H * CY, 0, W / 2, H * CY,
        Math.min(W, H) * 0.5);
      g.addColorStop(0, 'hsla(' + hue + ',80%,30%,0.16)');
      g.addColorStop(1, 'hsla(' + hue + ',80%,30%,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var bump = 1 + 0.07 * Math.max(0, 1 - (now - pulseAt) / 160);
      if (dying) {
        var td = (now - dying.t0) / 480;
        if (td >= 1) { dying = null; }
        else {
          drawModel(dying.m, bump * (1 + td * 0.25), Math.pow(1 - td, 1.3),
            easeOutCubic(td) * 1.1, now);
        }
      }
      if (cur) {
        var m = cur.m;
        if (m.churn > 0) {
          var flips = Math.round(m.churn * m.n * dt);
          for (var f = 0; f < flips; f++) {
            m.chars[(Math.random() * m.n) | 0] =
              m.glyphs.charAt((Math.random() * m.glyphs.length) | 0);
          }
        }
        var ti = clamp((now - cur.t0) / (cur.burst ? 650 : 120), 0, 1);
        var e = easeOutCubic(ti);
        var breath = 1 + 0.008 * Math.sin(now / 900);
        drawModel(m, bump * breath * (cur.burst ? 0.35 + 0.65 * e : 1),
          cur.burst ? e : 1, 0, now);
      }

      // flash on boss change
      var tf = (now - flashAt) / 380;
      if (tf >= 0 && tf < 1 && !reduce) {
        var fg = ctx.createRadialGradient(W / 2, H * CY, 0, W / 2, H * CY,
          Math.min(W, H) * (0.15 + 0.5 * tf));
        fg.addColorStop(0, 'hsla(' + flashHue + ',90%,80%,' + (0.35 * (1 - tf)).toFixed(3) + ')');
        fg.addColorStop(1, 'hsla(' + flashHue + ',90%,60%,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, W, H);
      }
      raf = root.requestAnimationFrame(frame);
    }

    function onDown(e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY; vyaw = 0; vpitch = 0;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      yaw += dx * 0.008;
      pitch = clamp(pitch + dy * 0.008, -1.2, 1.2);
      vyaw = dx * 0.35; vpitch = dy * 0.2;
    }
    function onUp() { dragging = false; }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    root.addEventListener('resize', resize);
    resize();
    raf = root.requestAnimationFrame(frame);

    return {
      setModel: setModel,
      pulse: pulse,
      resize: resize,
      wasDragged: function () { return Math.abs(vyaw) > 0.5 || dragging; },
      destroy: function () {
        alive = false;
        root.cancelAnimationFrame(raf);
        root.removeEventListener('resize', resize);
      }
    };
  }

  root.NVO = Object.assign(root.NVO || {}, { createSphere: createSphere });
})(typeof window !== 'undefined' ? window : globalThis);
