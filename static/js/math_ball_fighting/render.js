/*
 * Math Ball Fighting - three.js view.
 *
 * World units are CSS pixels, origin at the centre of the screen, +y up.
 * Everything is drawn without depth testing; renderOrder sets the layers:
 *   0 background · 1 rings · 2 balls · 3 labels · 4 particles · 5 flash
 *
 *   var R = MBF.createRenderer(hostElement);
 *   var v = R.makeBall(ballDef, radius);   // v.setPos, v.setRadius, v.setOrientation ...
 *   R.fx.sparks(...) / R.fx.ring(...) / R.fx.flash(...) / R.fx.shake(...)
 *   R.update(dtReal); R.render();
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var S = MBF.shaders;

  MBF.createRenderer = function (host) {
    var THREE = root.THREE;
    var dpr = Math.min(root.devicePixelRatio || 1, 2);
    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    var R = { renderer: renderer, scene: scene, camera: camera, W: 1, H: 1, dpr: dpr, time: 0, balls: [] };

    // ------------------------------------------------------------ background
    var bgU = {
      uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uPulse: { value: 0 },
      uTint: { value: new THREE.Color(0.35, 0.45, 1.0) }
    };
    var bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      uniforms: bgU, vertexShader: S.vertex, fragmentShader: S.backgroundFragment,
      depthTest: false, depthWrite: false
    }));
    bg.renderOrder = 0;
    scene.add(bg);

    // ------------------------------------------------------------ flash
    var flashU = { uColor: { value: new THREE.Color(1, 1, 1) }, uAmount: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) } };
    var flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      uniforms: flashU, vertexShader: S.vertex, fragmentShader: S.flashFragment,
      transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
      depthTest: false, depthWrite: false
    }));
    flash.renderOrder = 5;
    scene.add(flash);

    // ------------------------------------------------------------ post-processing
    // The scene renders into rt; a full-screen pass adds aberration and shatter.
    // The post pass writes into one of two "out" targets (ping-pong) so the next
    // frame can read the last one back for feedback trails; a copy pass shows it.
    var rtOpts = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    var rt = new THREE.WebGLRenderTarget(4, 4, rtOpts);
    var outA = new THREE.WebGLRenderTarget(4, 4, rtOpts), outB = new THREE.WebGLRenderTarget(4, 4, rtOpts);
    var postU = {
      tScene: { value: rt.texture }, tPrev: { value: outB.texture }, uRes: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uCA: { value: 0 }, uShatter: { value: 0 },
      uSeed: { value: 0 }, uTime: { value: 0 },
      uSwirl: { value: 0 }, uSwirlC: { value: new THREE.Vector2(0.5, 0.5) }, uKaleido: { value: 0 }, uFeedback: { value: 0 },
      uGlitch: { value: 0 }, uDream: { value: 0 }
    };
    var postScene = new THREE.Scene();
    var postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: postU, vertexShader: S.vertex, fragmentShader: S.postFragment,
      depthTest: false, depthWrite: false
    })));
    var copyU = { tSrc: { value: outA.texture } };
    var copyScene = new THREE.Scene();
    copyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: copyU, vertexShader: S.vertex, fragmentShader: S.copyFragment,
      depthTest: false, depthWrite: false
    })));

    R.resize = function () {
      var W = host.clientWidth || root.innerWidth, H = host.clientHeight || root.innerHeight;
      R.W = W; R.H = H;
      renderer.setSize(W, H);
      rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
      outA.setSize(Math.round(W * dpr), Math.round(H * dpr));
      outB.setSize(Math.round(W * dpr), Math.round(H * dpr));
      postU.uRes.value.set(W, H);
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      bg.scale.set(W + 80, H + 80, 1);
      bgU.uRes.value.set(W + 80, H + 80);
      flash.scale.set(W + 80, H + 80, 1);
      for (var i = 0; i < R.balls.length; i++) R.balls[i].refreshPx();
    };

    // ------------------------------------------------------------ labels
    // Draws a ball's label into a canvas texture; redraw(text) updates it in place.
    function labelTexture(ball) {
      var c = document.createElement('canvas');
      c.width = c.height = 512;
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = 4;
      tex.redraw = function (text) { drawLabel(c, ball, text); tex.needsUpdate = true; };
      tex.redraw(ball.label);
      return tex;
    }
    function drawLabel(c, ball, text) {
      var g = c.getContext('2d');
      g.clearRect(0, 0, 512, 512);
      g.save();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      if (ball.labelAt === 'banner') {
        var bw = 360, bh = 92, bx = 256 - bw / 2, by = 372;
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 18;
        var grad = g.createLinearGradient(0, by, 0, by + bh);
        grad.addColorStop(0, '#2a1a3a'); grad.addColorStop(1, '#0d0816');
        g.fillStyle = grad;
        roundRect(g, bx, by, bw, bh, 40); g.fill();
        g.restore();
        g.lineWidth = 7; g.strokeStyle = '#e8b44a';
        roundRect(g, bx, by, bw, bh, 40); g.stroke();
        var fs = fitFont(g, text, bw - 70, 70);
        g.font = '900 ' + fs + 'px "Segoe UI", system-ui, sans-serif';
        g.lineWidth = 10; g.strokeStyle = ball.ink[1]; g.strokeText(text, 256, by + bh / 2 + 3);
        g.fillStyle = ball.ink[0]; g.fillText(text, 256, by + bh / 2 + 3);
      } else {
        var size = fitFont(g, text, 380, 300);
        g.font = '900 ' + size + 'px "Segoe UI", system-ui, sans-serif';
        g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 24;
        g.lineWidth = Math.max(10, size * 0.09); g.strokeStyle = ball.ink[1];
        g.strokeText(text, 256, 268);
        g.shadowBlur = 0;
        var fill = g.createLinearGradient(0, 268 - size / 2, 0, 268 + size / 2);
        fill.addColorStop(0, '#ffffff'); fill.addColorStop(1, ball.ink[0]);
        g.fillStyle = fill;
        g.fillText(text, 256, 268);
      }
      g.restore();
    }
    function fitFont(g, text, maxW, start) {
      var s = start;
      for (; s > 20; s -= 6) {
        g.font = '900 ' + s + 'px "Segoe UI", system-ui, sans-serif';
        if (g.measureText(text).width <= maxW) break;
      }
      return s;
    }
    function roundRect(g, x, y, w, h, r) {
      g.beginPath();
      g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
      g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
      g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
      g.closePath();
    }

    // ------------------------------------------------------------ balls
    var materialCache = {};
    function ballMaterial(ball) {
      var u = {
        uTime: { value: 0 }, uHit: { value: 0 }, uHp: { value: 1 }, uPx: { value: 0.01 },
        uSeed: { value: Math.random() * 10 }, uSpin: { value: 0 }, uFade: { value: 1 },
        uRot: { value: new THREE.Matrix3() },
        uK: { value: ball.k || 1 }, uGlitch: { value: ball.glitch || 0 }, uLook: { value: new THREE.Vector2(0, 0) },
        uAura: { value: new THREE.Color(ball.aura[0], ball.aura[1], ball.aura[2]) }
      };
      var src = materialCache[ball.texture] || (materialCache[ball.texture] = S.ballFragment(ball.texture));
      var m = new THREE.ShaderMaterial({
        uniforms: u, vertexShader: S.vertex, fragmentShader: src,
        transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false
      });
      return m;
    }

    var tmpM4 = new THREE.Matrix4(), tmpQ = new THREE.Quaternion();
    R.makeBall = function (ball, radius, opts) {
      opts = opts || {};
      var group = new THREE.Group();
      var mat = ballMaterial(ball);
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2 * S.QUAD, 2 * S.QUAD), mat);
      mesh.renderOrder = 2;
      group.add(mesh);
      var lmat = opts.noLabel ? null : new THREE.MeshBasicMaterial({ map: labelTexture(ball), transparent: true,
        depthTest: false, depthWrite: false });
      var label = null;
      if (lmat) {
        label = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lmat);
        label.renderOrder = 3;
        group.add(label);
      }
      (opts.scene || scene).add(group);

      var v = {
        ball: ball, group: group, mesh: mesh, label: label, u: mat.uniforms,
        r: radius, scale: 1, scaleV: 0, hit: 0, pxScale: opts.pxScale || 1, labelText: ball.label
      };
      v.setRadius = function (r) { v.r = r; v.refreshPx(); };
      v.refreshPx = function () { v.u.uPx.value = 1 / Math.max(4, v.r * v.scale * v.pxScale); };
      v.setPos = function (x, y) { group.position.set(x, y, 0); };
      // q = the ball's orientation (THREE.Quaternion). The shader needs body-from-view.
      v.setOrientation = function (q) {
        tmpQ.copy(q).invert();
        tmpM4.makeRotationFromQuaternion(tmpQ);
        v.u.uRot.value.setFromMatrix4(tmpM4);
      };
      // squash the ball; flash it white unless noFlash (used when hits come very fast)
      v.boing = function (amount, noFlash) {
        v.scaleV -= amount;
        if (!noFlash) v.hit = Math.min(0.85, Math.max(v.hit, 0.45 + amount * 2));
      };
      v.tick = function (dt, t) {
        // spring the scale back to 1
        var k = 260, c = 14;
        v.scaleV += (-(v.scale - 1) * k - v.scaleV * c) * dt;
        v.scale += v.scaleV * dt;
        var s = v.r * v.scale;
        group.scale.set(s, s, 1);
        v.hit = Math.max(0, v.hit - dt * 6);
        v.u.uHit.value = v.hit;
        v.u.uTime.value = t;
        v.refreshPx();
      };
      v.setHp = function (f) { v.u.uHp.value = f; };
      v.setK = function (k) { v.u.uK.value = k; };
      // eyes (Rayo) look toward world point (x, y)
      v.lookAt = function (x, y) {
        var dx = x - group.position.x, dy = y - group.position.y, L = Math.hypot(dx, dy) || 1;
        v.u.uLook.value.set(dx / L, dy / L);
      };
      v.setLabel = function (text) {
        if (text === v.labelText || !lmat) return;
        v.labelText = text;
        lmat.map.redraw(text);
      };
      v.setFade = function (f) { v.u.uFade.value = f; if (lmat) lmat.opacity = f; };
      v.dispose = function () {
        (opts.scene || scene).remove(group);
        mesh.geometry.dispose(); mat.dispose();
        if (label) { label.geometry.dispose(); lmat.map.dispose(); lmat.dispose(); }
        var i = R.balls.indexOf(v); if (i >= 0) R.balls.splice(i, 1);
      };
      if (!opts.scene) R.balls.push(v);
      v.setRadius(radius);
      return v;
    };

    // ------------------------------------------------------------ particles
    var NP = 4000;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3),
      pSize = new Float32Array(NP), pAlpha = new Float32Array(NP);
    var pVel = new Float32Array(NP * 2), pLife = new Float32Array(NP), pMax = new Float32Array(NP),
      pDrag = new Float32Array(NP), pBase = new Float32Array(NP), pGrow = new Float32Array(NP);
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
    pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pAlpha, 1));
    var pMat = new THREE.ShaderMaterial({
      uniforms: { uDpr: { value: dpr } }, vertexShader: S.particleVertex, fragmentShader: S.particleFragment,
      transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
      depthTest: false, depthWrite: false
    });
    var points = new THREE.Points(pGeo, pMat);
    points.frustumCulled = false;
    points.renderOrder = 4;
    scene.add(points);
    var pNext = 0, pAlive = 0;

    function spawn(x, y, vx, vy, life, size, grow, drag, r, g, b) {
      var i = pNext; pNext = (pNext + 1) % NP;
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = 0;
      pVel[i * 2] = vx; pVel[i * 2 + 1] = vy;
      pLife[i] = life; pMax[i] = life; pBase[i] = size; pGrow[i] = grow; pDrag[i] = drag;
      pCol[i * 3] = r; pCol[i * 3 + 1] = g; pCol[i * 3 + 2] = b;
      pAlive = NP;
    }

    function updateParticles(dt) {
      if (!pAlive) return;
      var any = 0;
      for (var i = 0; i < NP; i++) {
        if (pLife[i] <= 0) { pAlpha[i] = 0; pSize[i] = 0; continue; }
        any++;
        pLife[i] -= dt;
        var k = Math.exp(-pDrag[i] * dt);
        pVel[i * 2] *= k; pVel[i * 2 + 1] *= k;
        pPos[i * 3] += pVel[i * 2] * dt; pPos[i * 3 + 1] += pVel[i * 2 + 1] * dt;
        var f = Math.max(0, pLife[i] / pMax[i]);
        pAlpha[i] = f * f;
        pSize[i] = pBase[i] * (1 + pGrow[i] * (1 - f));
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.aColor.needsUpdate = true;
      pGeo.attributes.aSize.needsUpdate = true;
      pGeo.attributes.aAlpha.needsUpdate = true;
      if (!any) pAlive = 0;
    }

    // ------------------------------------------------------------ rings
    var rings = [];
    for (var ri = 0; ri < 24; ri++) {
      var ru = { uProg: { value: 0 }, uWidth: { value: 0.05 }, uColor: { value: new THREE.Color(1, 1, 1) } };
      var rm = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
        uniforms: ru, vertexShader: S.vertex, fragmentShader: S.ringFragment,
        transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
        depthTest: false, depthWrite: false
      }));
      rm.renderOrder = 1; rm.visible = false;
      scene.add(rm);
      rings.push({ mesh: rm, u: ru, age: 0, dur: 1, r0: 0, r1: 1 });
    }
    var ringNext = 0;
    function updateRings(dt) {
      for (var i = 0; i < rings.length; i++) {
        var g = rings[i];
        if (!g.mesh.visible) continue;
        g.age += dt;
        var p = g.age / g.dur;
        if (p >= 1) { g.mesh.visible = false; continue; }
        var e = 1 - Math.pow(1 - p, 3);
        var r = g.r0 + (g.r1 - g.r0) * e;
        g.mesh.scale.set(r, r, 1);
        g.u.uProg.value = p;
      }
    }

    // ------------------------------------------------------------ lightning
    // Each bolt is a jagged strip re-randomised a few times a frame so it crackles.
    var SEG = 22;
    var bolts = [];
    for (var bi = 0; bi < 14; bi++) {
      var bg2 = new THREE.BufferGeometry();
      var bpos = new Float32Array((SEG + 1) * 2 * 3), buv = new Float32Array((SEG + 1) * 2 * 2), bidx = [];
      for (var s2 = 0; s2 <= SEG; s2++) {
        buv[s2 * 4] = s2 / SEG; buv[s2 * 4 + 1] = 0; buv[s2 * 4 + 2] = s2 / SEG; buv[s2 * 4 + 3] = 1;
        if (s2 < SEG) { var o = s2 * 2; bidx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
      }
      bg2.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
      bg2.setAttribute('uv', new THREE.BufferAttribute(buv, 2));
      bg2.setIndex(bidx);
      var bu = { uColor: { value: new THREE.Color(1, 1, 1) }, uAlpha: { value: 0 } };
      var bm = new THREE.Mesh(bg2, new THREE.ShaderMaterial({
        uniforms: bu, vertexShader: S.vertex, fragmentShader: S.boltFragment,
        transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
        depthTest: false, depthWrite: false, side: THREE.DoubleSide
      }));
      bm.renderOrder = 4; bm.visible = false; bm.frustumCulled = false;
      scene.add(bm);
      bolts.push({ mesh: bm, u: bu, pos: bpos, age: 0, life: 0, x0: 0, y0: 0, x1: 0, y1: 0, w: 4, jag: 0.15, rejit: 0 });
    }
    var boltNext = 0;
    function shapeBolt(b) {
      var dx = b.x1 - b.x0, dy = b.y1 - b.y0, L = Math.hypot(dx, dy) || 1;
      var nx = -dy / L, ny = dx / L, off = 0, pts = [];
      for (var i = 0; i <= SEG; i++) {
        var f = i / SEG;
        off += (Math.random() - 0.5) * L * b.jag * 0.5;
        off *= 0.85;
        var env = Math.sin(f * Math.PI);                  // pinned at both ends
        pts.push([b.x0 + dx * f + nx * off * env, b.y0 + dy * f + ny * off * env]);
      }
      for (var k = 0; k <= SEG; k++) {
        var a = pts[Math.max(0, k - 1)], c = pts[Math.min(SEG, k + 1)];
        var tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty) || 1;
        var w = b.w * (0.4 + 0.6 * Math.sin((k / SEG) * Math.PI));
        var px = -ty / tl * w, py = tx / tl * w;
        b.pos[k * 6] = pts[k][0] + px; b.pos[k * 6 + 1] = pts[k][1] + py; b.pos[k * 6 + 2] = 0;
        b.pos[k * 6 + 3] = pts[k][0] - px; b.pos[k * 6 + 4] = pts[k][1] - py; b.pos[k * 6 + 5] = 0;
      }
      b.mesh.geometry.attributes.position.needsUpdate = true;
    }
    function updateBolts(dt) {
      for (var i = 0; i < bolts.length; i++) {
        var b = bolts[i];
        if (!b.mesh.visible) continue;
        b.age += dt;
        if (b.age >= b.life) { b.mesh.visible = false; continue; }
        b.rejit -= dt;
        if (b.rejit <= 0) { shapeBolt(b); b.rejit = 0.035; }
        var f = 1 - b.age / b.life;
        b.u.uAlpha.value = f * (b.calm ? 0.8 : (0.55 + 0.45 * Math.random()));
      }
    }

    // ------------------------------------------------------------ glass shards
    var shardGeo = new THREE.BufferGeometry();
    shardGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 1, 0, -0.32, -0.7, 0, 0.42, -0.45, 0]), 3));
    shardGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0]), 2));
    var shards = [];
    for (var si2 = 0; si2 < 64; si2++) {
      var su = { uAlpha: { value: 0 }, uHue: { value: Math.random() }, uGlint: { value: 0 } };
      var sm = new THREE.Mesh(shardGeo, new THREE.ShaderMaterial({
        uniforms: su, vertexShader: S.vertex, fragmentShader: S.shardFragment,
        transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
        depthTest: false, depthWrite: false, side: THREE.DoubleSide
      }));
      sm.renderOrder = 4; sm.visible = false;
      scene.add(sm);
      shards.push({ mesh: sm, u: su, vx: 0, vy: 0, spin: 0, flip: 0, flipV: 0, age: 0, life: 1, sx: 1, sy: 1 });
    }
    var shardNext = 0;
    function updateShards(dt) {
      for (var i = 0; i < shards.length; i++) {
        var s = shards[i];
        if (!s.mesh.visible) continue;
        s.age += dt;
        if (s.age >= s.life) { s.mesh.visible = false; continue; }
        var k = Math.exp(-dt * 0.8);
        s.vx *= k; s.vy *= k;
        s.mesh.position.x += s.vx * dt; s.mesh.position.y += s.vy * dt;
        s.mesh.rotation.z += s.spin * dt;
        s.flip += s.flipV * dt;
        var c = Math.cos(s.flip);
        s.mesh.scale.set(s.sx * (0.15 + 0.85 * Math.abs(c)), s.sy, 1);   // fake 3D tumble
        s.u.uGlint.value = Math.pow(Math.abs(Math.sin(s.flip)), 8);
        var f = 1 - s.age / s.life;
        s.u.uAlpha.value = Math.min(1, f * 1.6);
      }
    }

    // ------------------------------------------------------------ beams
    // Held beams for defender attacks: R.fx.beam() hands out a strip that the caller moves each
    // frame with set(x0, y0, x1, y1, width), fades with alpha(a) and gives back with free().
    var beams = [];
    for (var bmi = 0; bmi < 16; bmi++) {
      var beu = { uColor: { value: new THREE.Color(1, 1, 1) }, uAlpha: { value: 0 }, uTime: { value: 0 }, uLen: { value: 100 } };
      var bem = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
        uniforms: beu, vertexShader: S.vertex, fragmentShader: S.beamFragment,
        transparent: true, premultipliedAlpha: true, blending: THREE.AdditiveBlending,
        depthTest: false, depthWrite: false, side: THREE.DoubleSide
      }));
      bem.renderOrder = 4; bem.visible = false; bem.frustumCulled = false;
      scene.add(bem);
      beams.push({ mesh: bem, u: beu, used: false });
    }
    function beamHandle(b) {
      return {
        set: function (x0, y0, x1, y1, width) {
          var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
          b.mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
          b.mesh.rotation.z = Math.atan2(dy, dx);
          b.mesh.scale.set(L, Math.max(1, width), 1);
          b.u.uLen.value = L;
          b.mesh.visible = true;
        },
        alpha: function (a) { b.u.uAlpha.value = a; },
        color: function (c) { b.u.uColor.value.setRGB(c[0], c[1], c[2]); },
        free: function () { b.used = false; b.mesh.visible = false; }
      };
    }
    function updateBeams() { for (var i = 0; i < beams.length; i++) beams[i].u.uTime.value = R.time; }

    // ------------------------------------------------------------ shake / punch / flash
    var trauma = 0, punch = 0, flashAmt = 0, pulse = 0, ca = 0, shatter = 0;
    var swirl = 0, kaleido = 0, feedback = 0, glitch = 0, dream = 0;
    var shakeSeed = Math.random() * 100;

    R.fx = {
      // a burst of sparks thrown along (nx, ny) with spread (radians)
      sparks: function (x, y, nx, ny, count, speed, spread, color, white) {
        var base = Math.atan2(ny, nx);
        for (var i = 0; i < count; i++) {
          var a = base + (Math.random() - 0.5) * spread;
          var s = speed * (0.35 + Math.random() * 0.9);
          var w = Math.random() < (white == null ? 0.4 : white);
          spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.25 + Math.random() * 0.55,
            3 + Math.random() * 6, -0.6, 3.5,
            w ? 1 : color[0], w ? 1 : color[1], w ? 1 : color[2]);
        }
      },
      // heavier chunks with a darker tint, slower and longer lived
      debris: function (x, y, count, speed, size, color) {
        for (var i = 0; i < count; i++) {
          var a = Math.random() * Math.PI * 2;
          var s = speed * (0.2 + Math.random());
          var k = 0.55 + Math.random() * 0.45;
          spawn(x, y, Math.cos(a) * s, Math.sin(a) * s, 0.7 + Math.random() * 0.9,
            size * (0.5 + Math.random()), 0.4, 1.6, color[0] * k, color[1] * k, color[2] * k);
        }
      },
      ring: function (x, y, color, r0, r1, dur, width) {
        var g = rings[ringNext]; ringNext = (ringNext + 1) % rings.length;
        g.mesh.position.set(x, y, 0);
        g.mesh.visible = true;
        g.age = 0; g.dur = dur; g.r0 = r0; g.r1 = r1;
        g.u.uWidth.value = width || 0.05;
        g.u.uColor.value.setRGB(color[0], color[1], color[2]);
        g.mesh.scale.set(r0, r0, 1);
      },
      // screen-space flash centred on world (x, y)
      flash: function (amount, color, x, y) {
        flashAmt = Math.max(flashAmt, amount);
        flashU.uColor.value.setRGB(color[0], color[1], color[2]);
        flashU.uCenter.value.set(0.5 + (x || 0) / R.W, 0.5 + (y || 0) / R.H);
      },
      shake: function (amount) { trauma = Math.min(1, trauma + amount); },
      punch: function (amount) { punch = Math.max(punch, amount); },
      pulse: function (amount, color) {
        pulse = Math.max(pulse, amount);
        if (color) bgU.uTint.value.setRGB(color[0], color[1], color[2]);
      },
      // level 3+: red / blue split across the screen
      aberration: function (amount) { ca = Math.max(ca, amount); },
      // level 4: the screen cracks into glass panes around world (x, y)
      shatter: function (amount, x, y) {
        if (amount > shatter * 0.6) {
          postU.uSeed.value = Math.random() * 50;
          postU.uCenter.value.set(0.5 + x / R.W, 0.5 + y / R.H);
        }
        shatter = Math.max(shatter, amount);
      },
      // level 5: twist the screen into a whirlpool around world (x, y); sign picks the direction
      swirl: function (amount, x, y) {
        if (Math.abs(amount) > Math.abs(swirl) * 0.5) postU.uSwirlC.value.set(0.5 + x / R.W, 0.5 + y / R.H);
        swirl = Math.abs(amount) > Math.abs(swirl) ? amount : swirl;
      },
      // level 6: kaleidoscope mirror and echoing trails
      kaleido: function (amount) { kaleido = Math.max(kaleido, amount); },
      // level 7: datamosh - blocks jump, smear, tear and turn to checkerboard
      glitch: function (amount) { glitch = Math.max(glitch, amount); },
      // level 8: fever dream - the screen flows, drips, mirrors into itself and shifts colour
      dream: function (amount) { dream = Math.max(dream, Math.min(1.2, amount)); },
      feedback: function (amount) { feedback = Math.max(feedback, Math.min(0.85, amount)); },
      // sparks circling (x, y) at radius r, like water down a drain
      vortex: function (x, y, r, count, speed, color) {
        for (var i = 0; i < count; i++) {
          var a = Math.random() * Math.PI * 2, rr = r * (0.8 + Math.random() * 0.8);
          var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          var s = speed * (0.6 + Math.random() * 0.7);
          spawn(px, py, -Math.sin(a) * s - Math.cos(a) * s * 0.35, Math.cos(a) * s - Math.sin(a) * s * 0.35,
            0.6 + Math.random() * 0.6, 3 + Math.random() * 5, 0.3, 1.2,
            Math.random() < 0.3 ? 1 : color[0], Math.random() < 0.3 ? 1 : color[1], Math.random() < 0.3 ? 1 : color[2]);
        }
      },
      // a crackling bolt from (x0, y0) to (x1, y1)
      lightning: function (x0, y0, x1, y1, color, width, life, calm) {
        var b = bolts[boltNext]; boltNext = (boltNext + 1) % bolts.length;
        b.x0 = x0; b.y0 = y0; b.x1 = x1; b.y1 = y1;
        b.w = width; b.life = life; b.age = 0; b.rejit = 0; b.calm = !!calm;
        b.jag = 0.22 + Math.random() * 0.12;
        b.u.uColor.value.setRGB(color[0], color[1], color[2]);
        b.mesh.visible = true;
        shapeBolt(b);
      },
      // one glowing dot (projectile heads, charge-up glows)
      dot: function (x, y, vx, vy, life, size, color, grow) {
        spawn(x, y, vx, vy, life, size, grow || 0, 0, color[0], color[1], color[2]);
      },
      // a held beam (see beamHandle); null if all are in use
      beam: function (color) {
        for (var i = 0; i < beams.length; i++) {
          if (beams[i].used) continue;
          beams[i].used = true;
          var h = beamHandle(beams[i]);
          h.color(color); h.alpha(0);
          return h;
        }
        return null;
      },
      // glass shards flying out from (x, y) along (nx, ny) with spread
      shards: function (x, y, nx, ny, count, speed, size, spread) {
        var base = Math.atan2(ny, nx);
        for (var i = 0; i < count; i++) {
          var s = shards[shardNext]; shardNext = (shardNext + 1) % shards.length;
          var a = base + (Math.random() - 0.5) * (spread == null ? Math.PI * 2 : spread);
          var v = speed * (0.3 + Math.random());
          s.mesh.position.set(x, y, 0);
          s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v;
          s.mesh.rotation.z = Math.random() * Math.PI * 2;
          s.spin = (Math.random() - 0.5) * 8;
          s.flip = Math.random() * 6; s.flipV = (Math.random() - 0.5) * 14;
          s.sx = size * (0.5 + Math.random()); s.sy = size * (0.7 + Math.random() * 1.1);
          s.age = 0; s.life = 0.8 + Math.random() * 0.9;
          s.u.uHue.value = Math.random();
          s.mesh.visible = true;
        }
      }
    };

    R.update = function (dt) {
      R.time += dt;
      bgU.uTime.value = R.time;
      updateParticles(dt);
      updateRings(dt);
      updateBolts(dt);
      updateShards(dt);
      updateBeams();
      ca *= Math.exp(-dt * 4);
      shatter *= Math.exp(-dt * 2.6);
      if (shatter < 0.002) shatter = 0;
      swirl *= Math.exp(-dt * 1.8);
      kaleido *= Math.exp(-dt * 1.3);
      feedback *= Math.exp(-dt * 0.8);
      if (Math.abs(swirl) < 0.002) swirl = 0;
      if (kaleido < 0.002) kaleido = 0;
      if (feedback < 0.01) feedback = 0;
      glitch *= Math.exp(-dt * 2.2);
      dream *= Math.exp(-dt * 0.55);
      if (glitch < 0.005) glitch = 0;
      if (dream < 0.005) dream = 0;
      postU.uGlitch.value = glitch;
      postU.uDream.value = dream;
      postU.uSwirl.value = swirl;
      postU.uKaleido.value = kaleido;
      postU.uFeedback.value = feedback;
      postU.uCA.value = ca;
      postU.uShatter.value = shatter;
      postU.uTime.value = R.time;
      flashAmt *= Math.exp(-dt * 9);
      flashU.uAmount.value = flashAmt;
      pulse *= Math.exp(-dt * 3);
      bgU.uPulse.value = pulse;
      trauma = Math.max(0, trauma - dt * 1.6);
      punch *= Math.exp(-dt * 7);
      var sh = trauma * trauma, m = Math.min(R.W, R.H);
      var t = R.time * 40 + shakeSeed;
      camera.position.x = sh * m * 0.035 * (Math.sin(t * 1.13) + Math.sin(t * 2.71) * 0.5);
      camera.position.y = sh * m * 0.035 * (Math.sin(t * 1.37 + 2.0) + Math.sin(t * 3.11) * 0.5);
      camera.rotation.z = sh * 0.03 * Math.sin(t * 0.91);
      camera.zoom = 1 + punch;
      camera.updateProjectionMatrix();
    };

    R.render = function () {
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      var write = outA, read = outB;
      postU.tPrev.value = read.texture;
      renderer.setRenderTarget(write);
      renderer.render(postScene, postCam);
      renderer.setRenderTarget(null);
      copyU.tSrc.value = write.texture;
      renderer.render(copyScene, postCam);
      outA = read; outB = write;                         // swap for next frame
    };

    // ------------------------------------------------------------ thumbnails
    // Render a ball once into an image (data URL) for the picker.
    // Draw many balls into one image (a sprite sheet): cols x rows cells of `cell` pixels.
    // One render and one read-back for the whole sheet, instead of one per ball.
    // Returns a canvas with transparent background.
    R.renderSheet = function (balls, cell, cols) {
      var rows = Math.max(1, Math.ceil(balls.length / cols));
      var W = cols * cell, H = rows * cell;
      var sheet = new THREE.Scene();
      var cam = new THREE.OrthographicCamera(0, cols, 0, -rows, -10, 10);
      var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, -0.5, 0));
      var rad = 0.38, views = [];
      for (var i = 0; i < balls.length; i++) {
        var v = R.makeBall(balls[i], rad, { scene: sheet, pxScale: cell, noLabel: !!balls[i].fictional });
        v.group.position.set(i % cols + 0.5, -(Math.floor(i / cols) + 0.5), 0);
        v.group.scale.set(rad, rad, 1);
        v.u.uTime.value = 1.7;
        v.setOrientation(q);
        v.refreshPx();
        views.push(v);
      }
      var target = new THREE.WebGLRenderTarget(W, H);
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(sheet, cam);
      var px = new Uint8Array(W * H * 4);
      renderer.readRenderTargetPixels(target, 0, 0, W, H, px);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 1);
      target.dispose();
      for (var k = 0; k < views.length; k++) views[k].dispose();
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var g = c.getContext('2d');
      var img = g.createImageData(W, H), out = img.data;
      for (var y = 0; y < H; y++) {
        var si = (H - 1 - y) * W * 4, di = y * W * 4;      // WebGL rows are bottom-up
        for (var x = 0; x < W * 4; x += 4) {
          var a = px[si + x + 3], kk = a > 0 ? 255 / a : 0;  // un-premultiply
          out[di + x] = Math.min(255, px[si + x] * kk);
          out[di + x + 1] = Math.min(255, px[si + x + 1] * kk);
          out[di + x + 2] = Math.min(255, px[si + x + 2] * kk);
          out[di + x + 3] = a;
        }
      }
      g.putImageData(img, 0, 0);
      return c;
    };

    R.thumbnail = function (ball, size, time) {
      size = size || 160;
      var tscene = new THREE.Scene();
      var cam = new THREE.OrthographicCamera(-1.08, 1.08, 1.08, -1.08, -10, 10);
      var v = R.makeBall(ball, 1, { scene: tscene, pxScale: size / 2.16 });
      v.u.uTime.value = time == null ? 1.7 : time;
      var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, -0.5, 0));
      v.setOrientation(q);
      v.refreshPx();
      var rt = new THREE.WebGLRenderTarget(size, size);
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(tscene, cam);
      var px = new Uint8Array(size * size * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, size, size, px);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 1);
      rt.dispose();
      v.dispose();
      var c = document.createElement('canvas');
      c.width = c.height = size;
      var g = c.getContext('2d');
      var img = g.createImageData(size, size);
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          var si = ((size - 1 - y) * size + x) * 4, di = (y * size + x) * 4;
          var a = px[si + 3];
          var k = a > 0 ? 255 / a : 0;
          img.data[di] = Math.min(255, px[si] * k);
          img.data[di + 1] = Math.min(255, px[si + 1] * k);
          img.data[di + 2] = Math.min(255, px[si + 2] * k);
          img.data[di + 3] = a;
        }
      }
      g.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    };

    R.resize();
    return R;
  };
})(typeof window !== 'undefined' ? window : globalThis);
