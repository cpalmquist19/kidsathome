/*
 * Math Ball Fighting - sound. Everything is synthesised live with Web Audio: no sound files.
 *
 *   MBF.audio.unlock()                      call from any tap / key (browsers need a gesture)
 *   MBF.audio.hit(level, t, opts)           impact sound; layers build up with the effect level
 *   MBF.audio.ko(level, opts)               knockout boom + victory jingle
 *   MBF.audio.startTheme(ball) / stopTheme()   looping "boss music" for big defenders
 *   MBF.audio.setEnabled(on), duck(on), dash()
 *
 * Hit sounds: small attackers are light and high, huge ones deep and heavy. Levels add layers
 * that match the screen effects (zaps, glass, whoosh, shimmer, glitch, melting chord).
 * Themes: every number from a googol up has music built from what it is (primes for Skewes,
 * a 3:4:5 rhythm for Moser, an endlessly falling tone for Utter Oblivion...). Fictional
 * numbers share one generator seeded by their name, so each sounds different but always the same.
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var A = MBF.audio = { enabled: true };
  var ctx = null, master, sfx, music, verb, noiseBuf, analyser;
  var theme = null, schedTimer = null, nextTime = 0, step = 0;
  var lastHit = 0, rng = Math.random;

  // ------------------------------------------------------------ setup
  function impulse(seconds, decay) {
    var len = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (rng() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }
  function ensure() {
    if (ctx) return ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.25;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    master = ctx.createGain(); master.gain.value = A.enabled ? 0.8 : 0;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
    music = ctx.createGain(); music.gain.value = 0.42; music.connect(master);
    verb = ctx.createConvolver(); verb.buffer = impulse(2.6, 2.4);
    var wet = ctx.createGain(); wet.gain.value = 0.4; verb.connect(wet); wet.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = rng() * 2 - 1;
    return ctx;
  }
  function ready() { return ctx && ctx.state === 'running' && A.enabled; }

  A.unlock = function () {
    var c = ensure();
    if (c && c.state === 'suspended') c.resume();
  };
  A.setEnabled = function (on) {
    A.enabled = !!on;
    if (master) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.05);
  };
  A.duck = function (on) {
    if (music) music.gain.setTargetAtTime(on ? 0.08 : 0.42, ctx.currentTime, 0.2);
  };
  // loudness meter (used by tests)
  A.level = function () {
    if (!analyser) return 0;
    var d = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(d);
    var s = 0;
    for (var i = 0; i < d.length; i++) s += d[i] * d[i];
    return Math.sqrt(s / d.length);
  };

  // ------------------------------------------------------------ building blocks
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function shape(g, t, a, v, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function out(node, o) {
    node.connect(o.dest || sfx);
    if (o.wet) { var w = ctx.createGain(); w.gain.value = o.wet; node.connect(w); w.connect(verb); }
  }
  // one oscillator note: {f, f2, type, t, a, d, v, dest, wet, detune, lp}
  function tone(o) {
    var osc = ctx.createOscillator(), g = ctx.createGain(), a = o.a || 0.005, d = o.d || 0.2;
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, o.t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, o.t + (o.glide || a + d));
    if (o.detune) osc.detune.value = o.detune;
    shape(g, o.t, a, o.v || 0.2, d);
    var last = osc;
    if (o.lp) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; osc.connect(f); last = f; }
    last.connect(g); out(g, o);
    osc.start(o.t); osc.stop(o.t + a + d + 0.05);
  }
  // filtered noise burst: {t, a, d, v, type, f, f2, q, dest, wet}
  function noise(o) {
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), a = o.a || 0.003, d = o.d || 0.2;
    src.buffer = noiseBuf; src.loop = true;
    f.type = o.type || 'lowpass'; f.Q.value = o.q || 0.8;
    f.frequency.setValueAtTime(o.f || 1000, o.t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, o.t + a + d);
    shape(g, o.t, a, o.v || 0.2, d);
    src.connect(f); f.connect(g); out(g, o);
    src.start(o.t, rng() * 1.5); src.stop(o.t + a + d + 0.05);
  }
  // a held note for drones/pads; returns a stopper
  function hold(o) {
    var osc = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    osc.type = o.type || 'sine'; osc.frequency.value = o.f; if (o.detune) osc.detune.value = o.detune;
    f.type = 'lowpass'; f.frequency.value = o.lp || 2000;
    g.gain.setValueAtTime(0.0001, o.t); g.gain.exponentialRampToValueAtTime(o.v || 0.1, o.t + (o.a || 1.5));
    if (o.lfo) {                                           // slow wobble on the filter
      var l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = o.lfo; lg.gain.value = (o.lp || 2000) * 0.5; l.connect(lg); lg.connect(f.frequency); l.start(o.t);
    }
    osc.connect(f); f.connect(g); out(g, o);
    osc.start(o.t);
    return function (t) {
      g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0.0001, t, 0.4);
      osc.stop(t + 2.5); if (l) l.stop(t + 2.5);
    };
  }

  // ------------------------------------------------------------ hit sounds
  // opts: { weight 0..1 (attacker size), busy (fast watch speed), calm }
  A.hit = function (level, t, opts) {
    if (!ready()) return;
    opts = opts || {};
    var now = ctx.currentTime;
    if (now - lastHit < (opts.busy ? 0.11 : 0.05)) return;    // never a wall of noise
    lastHit = now;
    var T = now + 0.01, w = opts.weight || 0, p = 700 * Math.pow(0.22, w);
    var lite = opts.busy;
    // body: a pitched "thock" that drops - light for small attackers, deep for big ones
    tone({ f: p * 1.7, f2: p * 0.6, type: 'triangle', t: T, d: 0.1 + 0.03 * level, v: 0.28 });
    noise({ t: T, d: 0.035, type: 'highpass', f: 2500, v: 0.12 });
    if (level >= 1) tone({ f: 170, f2: 55, t: T, d: 0.22, v: 0.3 + 0.05 * t });
    if (lite) return;
    if (level >= 2) noise({ t: T, d: 0.35, f: 1100, f2: 110, v: 0.32, wet: 0.25 });
    if (level >= 3) for (var z = 0; z < 2 + Math.round(t * 2); z++)               // electric zaps
      tone({ f: 1600 + rng() * 1600, f2: 180, type: 'sawtooth', t: T + z * 0.035, d: 0.07, v: 0.06, lp: 5000 });
    if (level >= 4) {                                                             // glass
      noise({ t: T, d: 0.3, type: 'highpass', f: 4500, v: 0.14, wet: 0.3 });
      for (var gl = 0; gl < 8 + Math.round(10 * t); gl++)
        tone({ f: 2400 + rng() * 4200, t: T + rng() * 0.3, a: 0.001, d: 0.05 + rng() * 0.25, v: 0.045, wet: 0.5 });
    }
    if (level >= 5) {                                                             // whoosh into the swirl
      noise({ t: T, a: 0.08, d: 0.7, type: 'bandpass', f: 250, f2: 3200, q: 4, v: 0.25, wet: 0.4 });
      tone({ f: 55, f2: 33, t: T, a: 0.02, d: 0.8, v: 0.3 });
    }
    if (level >= 6) [0, 4, 7, 11, 14, 19].forEach(function (n, i) {               // kaleidoscope shimmer
      tone({ f: mtof(72 + n), t: T + i * 0.045, a: 0.01, d: 0.6, v: 0.05, wet: 0.7, detune: (rng() - 0.5) * 18 });
    });
    if (level >= 7 && !opts.calm) {                                               // datamosh blips
      for (var b = 0; b < 8; b++)
        tone({ f: mtof(60 + Math.floor(rng() * 36)), type: 'square', t: T + b * 0.03, a: 0.001, d: 0.028, v: 0.05, lp: 3500 });
      tone({ f: 55, type: 'square', t: T, d: 0.18, v: 0.06, lp: 900 });
    }
    if (level >= 8 && !opts.calm) [0, 3, 6, 10].forEach(function (n) {           // melting chord (tape stop)
      var f = mtof(57 + n);
      tone({ f: f, f2: f * 0.45, glide: 1.3, type: 'sawtooth', t: T, a: 0.02, d: 1.3, v: 0.045, wet: 0.8, lp: 2200 });
    });
  };

  A.ko = function (level, opts) {
    if (!ready()) return;
    opts = opts || {};
    var T = ctx.currentTime + 0.01;
    tone({ f: 130, f2: 26, t: T, a: 0.005, d: 1.3, v: 0.6 });
    noise({ t: T, d: 1.1, f: 1400, f2: 60, v: 0.45, wet: 0.45 });
    if (level >= 4) noise({ t: T, d: 0.6, type: 'highpass', f: 5000, v: 0.16, wet: 0.5 });
    // victory jingle, brighter for bigger knockouts
    var root = 60 + Math.min(level, 8);
    [0, 4, 7, 12, 16].forEach(function (n, i) {
      tone({ f: mtof(root + n), type: 'triangle', t: T + 0.55 + i * 0.09, a: 0.005, d: 0.35 + (i === 4 ? 0.6 : 0), v: 0.11, wet: 0.35 });
    });
  };

  A.dash = function () {
    if (!ready()) return;
    var T = ctx.currentTime + 0.01;
    noise({ t: T, a: 0.03, d: 0.22, type: 'bandpass', f: 600, f2: 2400, q: 2, v: 0.16 });
  };

  // ------------------------------------------------------------ themes
  // A theme: { bpm, start(t), step(t, i, e) called every eighth note, stop(t) }
  var PENTA = [0, 2, 4, 7, 9], MINOR = [0, 2, 3, 5, 7, 8, 10], MAJOR = [0, 2, 4, 5, 7, 9, 11];
  function isPrime(n) { if (n < 2) return false; for (var k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; }
  function bell(f, t, v, d) { tone({ f: f, t: t, a: 0.003, d: d || 0.9, v: v || 0.08, wet: 0.6, dest: music }); tone({ f: f * 2.76, t: t, a: 0.002, d: (d || 0.9) * 0.4, v: (v || 0.08) * 0.35, dest: music }); }
  function kick(t, v) { tone({ f: 120, f2: 38, t: t, a: 0.002, d: 0.32, v: v || 0.35, dest: music }); }
  function hat(t, v) { noise({ t: t, d: 0.04, type: 'highpass', f: 7000, v: v || 0.05, dest: music }); }
  function pluck(f, t, v, type) { tone({ f: f, type: type || 'triangle', t: t, a: 0.003, d: 0.25, v: v || 0.08, dest: music, lp: 3500 }); }
  function pad(notes, t, v, type, lp, lfo) {
    return notes.map(function (m, i) { return hold({ f: mtof(m), t: t, v: v, type: type || 'sawtooth', lp: lp || 900, lfo: lfo, detune: (i % 2 ? 7 : -7), dest: music, wet: 0.5, a: 2 }); });
  }
  function stopAll(list, t) { list.forEach(function (s) { s(t); }); }

  // Shepard tone: octave-spaced voices that glide forever up (dir 1) or down (-1); the
  // loudness follows a bell curve over pitch, so no voice ever pops in or out.
  function shepard(dir, base, period) {
    var voices = [], N = 7;
    return {
      bpm: 60,
      start: function (t) {
        for (var i = 0; i < N; i++) {
          var osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = 'sine'; osc.connect(g); out(g, { dest: music, wet: 0.5 }); g.gain.value = 0;
          osc.start(t); voices.push({ osc: osc, g: g, k: i });
        }
        this.cycle(t);
      },
      cycle: function (t) {                                  // schedule one full octave glide
        voices.forEach(function (v) {
          var STEPS = 24;
          for (var s = 0; s <= STEPS; s++) {
            var ph = s / STEPS, oct = (v.k + (dir > 0 ? ph : 1 - ph)) % N;
            var f = base * Math.pow(2, oct), loud = Math.exp(-Math.pow((oct - N / 2) / 1.6, 2)) * 0.07;
            var at = t + ph * period;
            if (s === 0) { v.osc.frequency.setValueAtTime(f, at); v.g.gain.setValueAtTime(Math.max(0.0001, loud), at); }
            else { v.osc.frequency.exponentialRampToValueAtTime(f, at); v.g.gain.linearRampToValueAtTime(loud, at); }
          }
        });
        this.until = t + period;
      },
      step: function (t) { if (t > this.until - 0.3) this.cycle(this.until); },
      stop: function (t) { voices.forEach(function (v) { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.3); v.osc.stop(t + 2); }); }
    };
  }

  var THEMES = {
    // 1 followed by 100 zeros: a bright bell counts up through 100 steps
    googol: function () {
      var drones;
      return { bpm: 118,
        start: function (t) { drones = pad([45, 52, 57], t, 0.03, 'triangle', 1400); },
        step: function (t, i) {
          var k = i % 100;
          bell(mtof(69 + PENTA[k % 5] + 12 * Math.floor((k % 15) / 5)), t, 0.05, 0.5);
          if (i % 4 === 0) kick(t, 0.22);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // a galaxy: a wide, slow pad with stars twinkling
    googolplex: function (deep) {
      var drones;
      return { bpm: 66,
        start: function (t) { drones = pad(deep ? [33, 40, 45, 52] : [38, 45, 50, 57], t, 0.06, 'sawtooth', 900, 0.07); },
        step: function (t) { if (rng() < 0.45) bell(mtof(81 + PENTA[Math.floor(rng() * 5)] + (rng() < 0.3 ? 12 : 0)), t + rng() * 0.2, 0.075, 1.4); },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Skewes: from prime numbers - the drum only hits on prime-numbered beats
    skewes: function () {
      var drones;
      return { bpm: 132,
        start: function (t) { drones = pad([40, 47], t, 0.03, 'sawtooth', 600); },
        step: function (t, i) {
          var n = i % 64 + 1;
          if (isPrime(n)) { kick(t, 0.3); pluck(mtof(52 + MINOR[n % 7]), t, 0.07); }
          if (i % 2 === 1) hat(t, 0.03);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Moser: triangles, squares and circles - three voices in a 3 : 4 : 5 rhythm
    moser: function () {
      var drones;
      return { bpm: 150,
        start: function (t) { drones = pad([41, 48], t, 0.03, 'sawtooth', 500); },
        step: function (t, i) {
          if (i % 3 === 0) pluck(mtof(65), t, 0.07, 'triangle');
          if (i % 4 === 0) pluck(mtof(68), t, 0.06, 'square');
          if (i % 5 === 0) pluck(mtof(72), t, 0.06, 'sine');
          if (i % 8 === 0) kick(t, 0.28);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Graham's: arpeggios that keep climbing, like stacking more and more up-arrows
    graham: function () {
      var drones;
      return { bpm: 156,
        start: function (t) { drones = pad([38, 45], t, 0.035, 'sawtooth', 800, 0.1); },
        step: function (t, i) {
          var bar = Math.floor(i / 8) % 8, arp = [0, 3, 7, 10, 12, 15, 19, 22];
          pluck(mtof(50 + bar * 2 + arp[i % 8]), t, 0.07, 'sawtooth');
          tone({ f: mtof(26 + bar * 2), type: 'square', t: t, d: 0.12, v: 0.08, lp: 400, dest: music });
          if (i % 2 === 0) kick(t, 0.3);
          hat(t, 0.025);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // TREE: a melody that branches like a tree (bits of the beat pick left/right),
    // in 3 bell tones - one for each colour of seed
    tree: function () {
      var drones;
      return { bpm: 108,
        start: function (t) { drones = pad([43, 50, 55], t, 0.028, 'triangle', 1200); },
        step: function (t, i) {
          var depth = i % 6, path = Math.floor(i / 6), node = 0;
          for (var b = 0; b < depth; b++) node = node * 2 + ((path >> b) & 1);
          var color = node % 3, f = mtof(67 + PENTA[node % 5] + 12 * (depth > 3 ? 1 : 0));
          if (color === 0) bell(f, t, 0.06, 0.8);
          else if (color === 1) pluck(f, t, 0.06, 'sine');
          else tone({ f: f, type: 'triangle', t: t, a: 0.02, d: 0.5, v: 0.05, wet: 0.5, dest: music });
          if (i % 6 === 0) kick(t, 0.2);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // SSCG / SCG: blips hopping around a network
    graph: function () {
      var drones, at = 0;
      return { bpm: 128,
        start: function (t) { drones = pad([45, 52], t, 0.028, 'sawtooth', 700); },
        step: function (t, i) {
          at = (at + [1, 2, 3][Math.floor(rng() * 3)]) % 7;
          tone({ f: mtof(69 + MINOR[at]), type: 'square', t: t, a: 0.002, d: 0.07, v: 0.05, lp: 2500, dest: music });
          if (i % 4 === 0) kick(t, 0.25);
          if (i % 2) hat(t, 0.03);
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Loader's: a computer program - fast chiptune arpeggios
    loader: function () {
      return { bpm: 168,
        start: function () {},
        step: function (t, i) {
          var chord = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [3, 7, 10]][Math.floor(i / 16) % 4];
          tone({ f: mtof(64 + chord[i % 3] + (i % 6 > 2 ? 12 : 0)), type: 'square', t: t, a: 0.002, d: 0.08, v: 0.085, lp: 3000, dest: music });
          if (i % 4 === 0) tone({ f: mtof(40 + chord[0]), type: 'triangle', t: t, d: 0.2, v: 0.17, dest: music });
          if (i % 4 === 2) noise({ t: t, d: 0.05, type: 'highpass', f: 5000, v: 0.05, dest: music });
        },
        stop: function () {} };
    },
    // Rayo: the boss. A deep drone, a heartbeat, a creeping bass and a chime when the eye blinks.
    rayo: function () {
      var drones;
      return { bpm: 92,
        start: function (t) { drones = pad([26, 27], t, 0.05, 'sawtooth', 220, 0.05); },
        step: function (t, i) {
          if (i % 8 === 0) { kick(t, 0.4); kick(t + 0.18, 0.26); }               // heartbeat
          if (i % 2 === 0) tone({ f: mtof(38 + [0, 3, 6, 3][Math.floor(i / 2) % 4]), type: 'sawtooth', t: t, a: 0.01, d: 0.3, v: 0.09, lp: 500, dest: music });
          if (i % 32 === 28) { bell(mtof(74), t, 0.05, 2.0); bell(mtof(80), t + 0.15, 0.04, 2.0); }   // the eye
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Fish 7: under the sea - bubbles and a gliding whale-like voice
    fish: function () {
      var drones;
      return { bpm: 88,
        start: function (t) { drones = pad([38, 45, 50], t, 0.05, 'triangle', 700, 0.06); },
        step: function (t, i) {
          if (rng() < 0.6) { var f = 400 + rng() * 900; tone({ f: f, f2: f * 2.2, t: t + rng() * 0.2, a: 0.002, d: 0.08, v: 0.07, dest: music }); }
          if (i % 16 === 0) { var w = mtof(62 + PENTA[Math.floor(rng() * 5)]); tone({ f: w, f2: w * 0.75, glide: 2.2, type: 'sine', t: t, a: 0.4, d: 2.0, v: 0.1, wet: 0.8, dest: music }); }
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // BIG FOOT: giant stomps and a growl
    bigfoot: function () {
      var drones;
      return { bpm: 80,
        start: function (t) { drones = pad([24, 31], t, 0.05, 'sawtooth', 180, 0.3); },
        step: function (t, i) {
          if (i % 4 === 0) { tone({ f: 80, f2: 24, t: t, a: 0.002, d: 0.6, v: 0.32, dest: music }); noise({ t: t, d: 0.25, f: 300, f2: 60, v: 0.16, dest: music }); }
          if (i % 16 === 10) tone({ f: 70, f2: 50, type: 'sawtooth', t: t, a: 0.1, d: 0.8, v: 0.08, lp: 300, dest: music });
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    // the Large Number Garden: wind chimes over a soft pad
    garden: function () {
      var drones;
      return { bpm: 76,
        start: function (t) { drones = pad([50, 57, 62, 66], t, 0.04, 'triangle', 1600); },
        step: function (t) { if (rng() < 0.55) bell(mtof(74 + PENTA[Math.floor(rng() * 5)] + (rng() < 0.4 ? 12 : 0)), t + rng() * 0.25, 0.08, 1.6); },
        stop: function (t) { stopAll(drones, t); } };
    },
    // Oblivion: a black hole - sinking sub-bass and swells that get sucked away
    oblivion: function () {
      var drones;
      return { bpm: 60,
        start: function (t) { drones = pad([21, 28], t, 0.05, 'sine', 300); },
        step: function (t, i) {
          if (i % 8 === 0) { tone({ f: 70, f2: 22, glide: 3, t: t, a: 0.3, d: 3.0, v: 0.3, dest: music }); }
          if (i % 8 === 4) noise({ t: t, a: 1.4, d: 0.08, type: 'bandpass', f: 200, f2: 2000, q: 3, v: 0.12, wet: 0.6, dest: music });
        },
        stop: function (t) { stopAll(drones, t); } };
    },
    utter: function () { return shepard(-1, 55, 10); },     // falling forever
    infinity: function () { return shepard(1, 55, 8); }      // rising forever
  };

  // Fictional numbers: one generator, four styles, seeded by the name
  function fictionalTheme(ball) {
    var h = Math.floor(ball.k * 100) || 1;
    var style = h % 4, rootNote = 45 + (h >> 3) % 12, scale = [PENTA, MINOR, MAJOR][(h >> 5) % 3];
    var bpm = 84 + (h >> 7) % 70, drones, pattern = [];
    for (var i = 0; i < 16; i++) pattern.push(Math.abs((h >> (i % 20)) ^ ((i * 2654435761) >>> 7)) % 7);
    function n(k) { return mtof(rootNote + 12 + scale[k % scale.length] + 12 * Math.floor(k / scale.length)); }
    return { bpm: bpm,
      start: function (t) { drones = pad([rootNote - 12, rootNote - 5], t, 0.028, style === 2 ? 'triangle' : 'sawtooth', 700, 0.05 + (h % 5) * 0.02); },
      step: function (t, i) {
        var k = pattern[i % 16];
        if (style === 0) { pluck(n(k + (i % 8 > 3 ? 2 : 0)), t, 0.06); if (i % 4 === 0) kick(t, 0.25); }
        else if (style === 1) { if (rng() < 0.6) bell(n(k + 5), t, 0.08, 1.2); if (i % 8 === 0) kick(t, 0.18); }
        else if (style === 2) { if (i % 2 === 0) tone({ f: n(k), type: 'square', t: t, a: 0.002, d: 0.09, v: 0.04, lp: 2500, dest: music }); if (i % 4 === 0) kick(t, 0.22); hat(t, 0.02); }
        else { if (i % 8 === 0) { kick(t, 0.32); kick(t + 0.2, 0.2); } if (i % 2 === 0) tone({ f: n(k) / 2, type: 'sawtooth', t: t, a: 0.01, d: 0.25, v: 0.07, lp: 600, dest: music }); }
      },
      stop: function (t) { stopAll(drones, t); } };
  }

  // which theme a defender gets (none below a googol)
  var BY_ID = {
    googol: 'googol', googolplex: 'googolplex', skewes: 'skewes', googolplexplex: ['googolplex', true],
    moser: 'moser', graham: 'graham', tree3: 'tree', sscg3: 'graph', scg13: 'graph', loader: 'loader',
    rayo: 'rayo', fish7: 'fish', bigfoot: 'bigfoot', lngn: 'garden', oblivion: 'oblivion', utter: 'utter', infinity: 'infinity'
  };
  A.hasTheme = function (ball) { return !!(ball && (ball.fictional || BY_ID[ball.id])); };

  A.startTheme = function (ball) {
    A.stopTheme();
    if (!ball || !ensure()) return;
    var spec = BY_ID[ball.id];
    if (ball.fictional) theme = fictionalTheme(ball);
    else if (spec) theme = Array.isArray(spec) ? THEMES[spec[0]](spec[1]) : THEMES[spec]();
    else return;
    var t = ctx.currentTime + 0.1;
    theme.start(t);
    nextTime = t; step = 0;
    var th = theme;
    schedTimer = setInterval(function () {                  // look-ahead scheduler
      if (theme !== th || !ctx) return;
      var e = 30 / th.bpm;
      while (nextTime < ctx.currentTime + 0.15) {
        try { th.step(nextTime, step, e); } catch (err) { /* never let music break the game */ }
        nextTime += e; step++;
      }
    }, 30);
    A.duck(false);
  };
  A.stopTheme = function () {
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    if (theme && ctx) { try { theme.stop(ctx.currentTime); } catch (e) { /* ignore */ } }
    theme = null;
  };

  // browsers only allow sound after a tap or key press
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    root.addEventListener(ev, function () { if (A.enabled) A.unlock(); }, { passive: true, capture: true });
  });
})(window);
