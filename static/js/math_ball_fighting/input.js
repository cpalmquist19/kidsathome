/*
 * Math Ball Fighting - player input.
 *
 *   PC:     WASD / arrow keys move, Space dashes.
 *   Touch:  a floating virtual joystick appears wherever the left part of the
 *           screen is touched; the dash button sits bottom-right.
 *
 *   var input = MBF.createInput({ stickBase, stickKnob, dashButton, touchZone });
 *   input.read()  -> { x, y, dash }   (+y is up; dash is true once per press)
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};

  MBF.createInput = function (el) {
    var keys = {};
    var dashQueued = false;
    var stick = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
    var RADIUS = 60;
    var enabled = false;

    var MOVE = {
      KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1],
      KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0]
    };

    root.addEventListener('keydown', function (e) {
      if (!enabled) return;
      if (MOVE[e.code]) { keys[e.code] = true; e.preventDefault(); }
      if (e.code === 'Space') { if (!e.repeat) dashQueued = true; e.preventDefault(); }
    });
    root.addEventListener('keyup', function (e) { if (MOVE[e.code]) keys[e.code] = false; });
    root.addEventListener('blur', function () { keys = {}; });

    // ------------------------------------------------------------ joystick
    function showStick(on) {
      el.stickBase.style.display = on ? 'block' : 'none';
    }
    function placeKnob() {
      el.stickBase.style.left = stick.ox + 'px';
      el.stickBase.style.top = stick.oy + 'px';
      el.stickKnob.style.transform = 'translate(' + (stick.x * RADIUS) + 'px,' + (stick.y * RADIUS) + 'px)';
    }
    el.touchZone.addEventListener('pointerdown', function (e) {
      if (!enabled || e.pointerType === 'mouse' || stick.id !== null) return;
      if (e.clientX > root.innerWidth * 0.6) return;   // right side belongs to the dash button
      stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.x = 0; stick.y = 0;
      try { el.touchZone.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      showStick(true); placeKnob();
      e.preventDefault();
    });
    el.touchZone.addEventListener('pointermove', function (e) {
      if (e.pointerId !== stick.id) return;
      var dx = (e.clientX - stick.ox) / RADIUS, dy = (e.clientY - stick.oy) / RADIUS;
      var L = Math.hypot(dx, dy);
      if (L > 1) { dx /= L; dy /= L; }
      stick.x = dx; stick.y = dy;
      placeKnob();
      e.preventDefault();
    });
    function endStick(e) {
      if (e.pointerId !== stick.id) return;
      stick.id = null; stick.x = 0; stick.y = 0;
      showStick(false);
    }
    el.touchZone.addEventListener('pointerup', endStick);
    el.touchZone.addEventListener('pointercancel', endStick);

    el.dashButton.addEventListener('pointerdown', function (e) {
      if (!enabled) return;
      dashQueued = true;
      el.dashButton.classList.add('down');
      e.preventDefault();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      el.dashButton.addEventListener(ev, function () { el.dashButton.classList.remove('down'); });
    });

    return {
      setEnabled: function (on) {
        enabled = on;
        if (!on) { keys = {}; dashQueued = false; stick.id = null; stick.x = stick.y = 0; showStick(false); }
      },
      read: function () {
        var x = 0, y = 0;
        for (var k in keys) if (keys[k] && MOVE[k]) { x += MOVE[k][0]; y += MOVE[k][1]; }
        if (stick.id !== null) { x += stick.x; y -= stick.y; }
        var dash = dashQueued; dashQueued = false;
        return { x: x, y: y, dash: dash };
      }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
