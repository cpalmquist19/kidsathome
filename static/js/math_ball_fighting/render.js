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

    R.resize = function () {
      var W = host.clientWidth || root.innerWidth, H = host.clientHeight || root.innerHeight;
      R.W = W; R.H = H;
      renderer.setSize(W, H);
      camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      bg.scale.set(W + 80, H + 80, 1);
      bgU.uRes.value.set(W + 80, H + 80);
      flash.scale.set(W + 80, H + 80, 1);
      for (var i = 0; i < R.balls.length; i++) R.balls[i].refreshPx();
    };

    // ------------------------------------------------------------ labels
    function labelTexture(ball) {
      var c = document.createElement('canvas');
      c.width = c.height = 512;
      var g = c.getContext('2d');
      var text = ball.label;
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
      var tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = 4;
      return tex;
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
      var lmat = new THREE.MeshBasicMaterial({ map: labelTexture(ball), transparent: true,
        depthTest: false, depthWrite: false });
      var label = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lmat);
      label.renderOrder = 3;
      group.add(label);
      (opts.scene || scene).add(group);

      var v = {
        ball: ball, group: group, mesh: mesh, label: label, u: mat.uniforms,
        r: radius, scale: 1, scaleV: 0, hit: 0, pxScale: opts.pxScale || 1
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
      v.setFade = function (f) { v.u.uFade.value = f; lmat.opacity = f; };
      v.dispose = function () {
        (opts.scene || scene).remove(group);
        mesh.geometry.dispose(); mat.dispose();
        label.geometry.dispose(); lmat.map.dispose(); lmat.dispose();
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

    // ------------------------------------------------------------ shake / punch / flash
    var trauma = 0, punch = 0, flashAmt = 0, pulse = 0;
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
      }
    };

    R.update = function (dt) {
      R.time += dt;
      bgU.uTime.value = R.time;
      updateParticles(dt);
      updateRings(dt);
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

    R.render = function () { renderer.render(scene, camera); };

    // ------------------------------------------------------------ thumbnails
    // Render a ball once into an image (data URL) for the picker.
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
