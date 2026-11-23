/*
 * Math Ball Fighting - fight rules (no DOM; runs in the browser and in node).
 *
 *   var f = MBF.createFight(attackerBall, defenderBall);
 *   var r = f.hit();   // { damage, ko, level, t, input }
 *
 * RULES
 *  - The defender is always a number. Function vs function cannot fight.
 *  - Number attackers do the same damage every hit (their value).
 *  - Function attackers do f(n), where n starts at 1 and goes up by one per hit.
 *  - The defender's health is its value. It is destroyed when the total damage
 *    dealt reaches it. No timer.
 *
 * VALUES
 *  A value is { b: BigInt } while it has under EXACT_DIGITS digits, otherwise
 *  { m: magnitude } (see static/js/bignum/magnitude.js). Sums of wildly
 *  different sizes keep the larger, the way real arithmetic does.
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var BM = root.BigMag || (typeof require !== 'undefined' ? require('../bignum/magnitude.js') : null);

  var EXACT_DIGITS = 1000;
  var LN10 = Math.LN10;
  var sup = BM.sup;
  MBF.sup = sup;
  MBF.log10Big = BM.log10Big;

  // ---------------------------------------------------------------- values
  //  { b }  exact BigInt
  //  { m }  magnitude: a tower of tens (see magnitude.js)
  //  { h }  up-arrow value 10 ↑^a x, too tall for any tower we could store.
  //         h.a (the number of arrows) is itself a value, so Graham's number is
  //         64 of these nested inside each other. Compared by arrows, then x.
  //  Any value may carry a display name (e.g. "Moser's number").
  var V = MBF.V = {
    big: function (b) { return BM.log10Big(b) < EXACT_DIGITS ? { b: b } : { m: BM.fromBig(b) }; },
    lg10: function (lg) {
      if (lg < 15) return { b: BigInt(Math.round(Math.pow(10, lg))) };
      return { m: BM.fromLog10(lg) };
    },
    hyper: function (arrows, x, name) { return { h: { a: arrows, x: x }, name: name }; },
    // growth-class value: class r at input n. Anything in a higher class beats anything lower.
    //   1 TREE · 2 SCG · 3 Loader · 10 Busy Beaver · 11 Rayo · 11.5 Fish 7 · 12 BIG FOOT · 12.5 Garden
    //   13 Oblivion · 14 Utter Oblivion · 1000 Infinity · 2000 fictional numbers (beyond infinity)
    //   3000 built from every number in the game (Numbers), so beyond every fictional number
    // x (optional) breaks ties at the same r and n: "a bit more than f(n)", like Rayo's number
    // raised to its own power, which is still far below f(n + 1).
    cls: function (r, n, name, x) { var g = { r: r, n: n }; if (x) g.x = x; return { g: g, name: name }; },
    zero: function () { return { b: 0n }; },
    isExact: function (v) { return v.b !== undefined; },
    isHyper: function (v) { return v.h !== undefined; },
    log10: function (v) {
      if (v.b !== undefined) return BM.log10Big(v.b);
      if (v.m) return BM.log10(v.m);
      return Infinity;
    },
    mag: function (v) { return v.m || BM.fromBig(v.b); },
    cmp: function (a, b) {
      if (a.g || b.g) {
        if (!a.g) return -1;
        if (!b.g) return 1;
        if (a.g.r !== b.g.r) return a.g.r < b.g.r ? -1 : 1;
        return V.cmp(a.g.n, b.g.n) || ((a.g.x || 0) < (b.g.x || 0) ? -1 : (a.g.x || 0) > (b.g.x || 0) ? 1 : 0);
      }
      if (a.h || b.h) {
        if (!a.h) return -1;
        if (!b.h) return 1;
        var c = V.cmp(a.h.a, b.h.a);
        if (c) return c;
        return a.h.x < b.h.x ? -1 : a.h.x > b.h.x ? 1 : 0;
      }
      if (a.b !== undefined && b.b !== undefined) return a.b < b.b ? -1 : a.b > b.b ? 1 : 0;
      return BM.cmp(V.mag(a), V.mag(b));
    },
    add: function (a, b) {
      if (a.b === 0n) return b;
      if (b.b === 0n) return a;
      if (a.h || b.h || a.g || b.g) return V.cmp(a, b) >= 0 ? a : b;     // the smaller one vanishes
      if (a.b !== undefined && b.b !== undefined) return V.big(a.b + b.b);
      return { m: BM.add(V.mag(a), V.mag(b)) };
    },
    // one level of log10 off a huge value (for "how many hits of 10^n")
    down: function (v) {
      if (v.h || v.g) return v;
      var m = V.mag(v);
      if (m.L <= 1) return { b: BigInt(Math.ceil(BM.log10(m))) };
      return { m: { L: m.L - 1, t: m.t } };
    },
    fmt: function (v) {
      if (v.name) return v.name;
      if (v.b !== undefined) return MBF.fmt(v.b);
      if (v.m) return BM.format(v.m);
      if (v.g) return (CLASS_NAMES[v.g.r] || 'f') + '(' + V.fmt(v.g.n) + ')';
      var a = v.h.a;
      if (a.b !== undefined && a.b <= 5n) return '10' + '↑'.repeat(Number(a.b)) + v.h.x;
      return '10↑^(' + V.fmt(a) + ') ' + v.h.x;
    }
  };

  var CLASS_NAMES = { 1000: '∞', 2000: 'Fictional', 3000: 'Numbers', 1: 'TREE', 2: 'SCG-class', 3: 'Loader-class', 10: 'BB', 11: 'Rayo', 11.5: 'F₇', 12: 'FOOT', 12.5: 'Garden f', 13: 'Oblivion', 14: 'Utter Oblivion' };
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  // Infinity: no number of finite hits ever reaches it. Fictional numbers sit above it.
  MBF.INFINITY = { g: { r: 1000, n: { b: 0n } }, name: '∞' };
  // Gotchrognathicus = (Rayo's number ^ Rayo's number) × Rayo's number. Bigger than Rayo's number,
  // but a few more symbols of logic (Rayo(10^100 + a little)) already beat it, so it sits just
  // above Rayo's number in the same class. Rayo's number ^ Rayo's number sits between them.
  var GOOGOL = 10n ** 100n;
  MBF.GOTCH = V.cls(11, { b: GOOGOL }, 'Gotchrognathicus', 2);
  MBF.RAYO_POW_RAYO = V.cls(11, { b: GOOGOL }, "Rayo's number ^ Rayo's number", 1);
  // Numbers: every number ball in the game added up (Infinity and every fictional number too),
  // plus all of them multiplied together, then raised to its own power, then tetrated, pentated
  // and hexated by itself. The sum alone beats the biggest fictional number, so it gets its own
  // class above them. n counts the 6 build steps, leaving room for bigger numbers built on it.
  MBF.NUMBERS_STEPS = [
    'S = every number in the game added together',
    'P = S + every number in the game multiplied together',
    'E = P^P (exponentiate)',
    'T = E↑↑E (tetrate)',
    'Q = T↑↑↑T (pentate)',
    'Numbers = Q↑↑↑↑Q (hexate)'
  ];
  MBF.NUMBERS = V.cls(3000, { b: 6n }, 'Numbers');
  function unreachable(hp) { return hp.g && hp.g.r >= 1000; }
  function sub(n) { return String(n).replace(/[0-9]/g, function (c) { return SUB[c]; }); }
  function arrows(k) { return k <= 5 ? '↑'.repeat(k) : '↑' + sup(k); }

  // Graham's sequence: G(1) = 3↑↑↑↑3, G(n) = 3 ↑^G(n-1) 3. G(64) is Graham's number.
  var grahamCache = [];
  MBF.grahamValue = function (n) {
    if (!grahamCache[n]) {
      var a = n === 1 ? { b: 4n } : MBF.grahamValue(n - 1);
      var name = n === 64 ? "Graham's number" : 'G' + sub(n);
      grahamCache[n] = V.hyper(a, 3, name);
    }
    return grahamCache[n];
  };

  MBF.valueOf = function (ball) {
    if (ball.value !== undefined) return V.big(BigInt(ball.value));
    if (ball.mag) return { m: { L: ball.mag.L, t: ball.mag.t }, name: ball.valueName };
    if (ball.special === 'graham') return MBF.grahamValue(64);
    if (ball.special === 'tree3') return V.cls(1, { b: 3n }, 'TREE(3)');
    if (ball.special === 'scg13') return scgClass(13, true, 'SCG(13)');
    if (ball.special === 'loader') return V.cls(3, { b: 5n }, "Loader's number");   // D^5(99)
    if (ball.special === 'rayo') return V.cls(11, { b: 10n ** 100n }, "Rayo's number");
    if (ball.special === 'gotch') return MBF.GOTCH;
    if (ball.special === 'bigfoot') return V.cls(12, { b: 1n }, 'BIG FOOT');
    if (ball.special === 'sscg3') return sscg(3);
    if (ball.special === 'fish7') return fish7(63);
    if (ball.special === 'lngn') return gardenF(10);
    if (ball.special === 'infinity') return MBF.INFINITY;
    if (ball.special === 'numbers') return MBF.NUMBERS;
    if (ball.fictional) return V.cls(2000, { b: BigInt(ball.frank) }, ball.name);
    if (ball.special === 'oblivion') return V.cls(13, { b: 1n }, 'Oblivion');
    if (ball.special === 'utter') return V.cls(14, { b: 1n }, 'Utter Oblivion');
    if (ball.special === 'moser') {
      // 2 inside a mega-gon. Roughly 10 ↑^(mega) 10, with mega itself a tower about 257 tens tall.
      return V.hyper({ m: { L: 257, t: 1 } }, 10, "Moser's number");
    }
    return { m: BM.fromLog10(ball.log10) };
  };

  // 2^v for any value (used to build Ackermann towers)
  function pow2(v) {
    if (v.b !== undefined && v.b < 3000n) return V.big(2n ** v.b);
    var lgv = V.log10(v);
    if (isFinite(lgv)) {
      var lg2 = lgv + Math.log10(Math.LOG10E * Math.LN2);    // log10(log10(2^v))
      if (lg2 < 300) return { m: BM.fromLog10(Math.pow(10, lg2)) };
      return { m: BM.up(BM.fromLog10(lg2)) };
    }
    return { m: BM.up(v.m) };
  }

  // ---------------------------------------------------------------- matchups
  MBF.canFight = function (att, def) {
    if (!att || !def) return { ok: false, reason: 'Pick an attacker and a defender.' };
    if (att.kind === 'function' && def.kind === 'function')
      return { ok: false, reason: 'Two functions cannot fight each other.' };
    if (def.kind !== 'number') return { ok: false, reason: 'Functions can only attack numbers.' };
    return { ok: true, reason: '' };
  };

  // 1,234,567 up to 15 digits, then 1.23 × 10¹⁸
  MBF.fmt = function (b) {
    var s = (typeof b === 'bigint' ? b : BigInt(b)).toString();
    var neg = s[0] === '-';
    if (neg) s = s.slice(1);
    var out;
    if (s.length <= 15) out = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else out = s[0] + '.' + s.slice(1, 3) + ' × 10' + sup(s.length - 1);
    return (neg ? '-' : '') + out;
  };

  // ---------------------------------------------------------------- functions
  function lgFact(n) {                       // log10(n!) by Stirling, exact enough for n > 20
    if (n < 2) return 0;
    if (n <= 170) { var s = 0; for (var i = 2; i <= n; i++) s += Math.log10(i); return s; }
    return (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n) + 1 / (12 * n)) / LN10;
  }
  var factCache = [1n, 1n];
  function factExact(n) {
    while (factCache.length <= n) factCache.push(factCache[factCache.length - 1] * BigInt(factCache.length));
    return factCache[n];
  }
  var FACT_EXACT_MAX = 449;                  // 449! has 997 digits

  // f(n) as a value
  MBF.fnValue = function (fn, n) {
    switch (fn) {
      case 'succ': return { b: BigInt(n) + 1n };
      case 'double': return { b: 2n * BigInt(n) };
      case 'square': return { b: BigInt(n) * BigInt(n) };
      case 'fact': return n <= FACT_EXACT_MAX ? { b: factExact(n) } : { m: BM.fromLog10(lgFact(n)) };
      case 'pow10': return n < EXACT_DIGITS ? { b: 10n ** BigInt(n) } : { m: BM.fromLog10(n) };
      case 'ack': return ackermann(n);
      case 'graham': return MBF.grahamValue(n);
      case 'tree': return n === 1 ? { b: 1n } : n === 2 ? { b: 3n } : V.cls(1, { b: BigInt(n) }, 'TREE(' + n + ')');
      case 'bb': return busyBeaver(n);
      case 'sscg': return sscg(n);
      case 'arrows': return upArrows(n);
      case 'tet': return n === 1 ? { b: 10n } : n === 2 ? { b: 10000000000n } : { m: { L: n, t: 1 }, name: '10↑↑' + n };
      case 'circle': return circle(n);
      case 'loaderD': return loaderD(n);
      case 'rayo': return guessed(tower2(n / 1500), 'Rayo(' + n + ')');
      case 'foot': return guessed(tower2(n / 1000), 'FOOT(' + n + ')');
      case 'fish7': return fish7(n);
      case 'garden': return gardenF(n);
      case 'scg': return scg(n);
    }
    throw new Error('unknown function ' + fn);
  };

  // Knuth's up-arrows: 3↑3 = 27, 3↑↑3 = 7,625,597,484,987, 3↑↑↑3, 3↑↑↑↑3 (= G(1))...
  function upArrows(n) {
    if (n === 1) return { b: 27n };
    if (n === 2) return { b: 7625597484987n };
    var name = '3' + arrows(n) + '3';
    if (n === 3) return { m: { L: 7625597484986, t: 1 }, name: name };   // a tower of 3s that tall
    return V.hyper({ b: BigInt(n) }, 3, name);
  }

  // Steinhaus-Moser: n in a triangle = n^n, in a square = n inside n nested triangles,
  // in a circle = n inside n nested squares. Circle(2) is "mega", about 10↑↑257.
  // Moser's number is 2 inside a polygon with mega sides, far beyond any Circle(n).
  function circle(n) {
    if (n === 1) return { b: 1n };
    if (n === 2) return { m: { L: 257, t: 1 }, name: 'mega' };
    return V.hyper({ b: 3n }, n + 0.5, 'Circle(' + n + ')');            // rough: about 10↑↑↑(n+½)
  }

  // Loader's D program applied n times to 99. D^5(99) is Loader's number. Nobody knows
  // how big the earlier steps are, so D^1..D^4 sit in the same class below it (a guess).
  function loaderD(n) {
    var v = V.cls(3, { b: BigInt(n) }, n === 5 ? "D⁵(99), Loader's number" : 'D' + sup(n) + '(99)');
    if (n !== 5) v.estimate = true;
    return v;
  }

  // Rayo(n) and FOOT(n) stay small until n is in the thousands, and nobody knows their values.
  // The game guesses a tower of 2s that grows slowly with n (Rayo: one level per 1,500 hits).
  function guessed(v, name) {
    var w = { name: name, estimate: true };
    for (var k in v) if (k !== 'name') w[k] = v[k];
    return w;
  }
  // 2↑↑H for a real height H (smooth between whole heights)
  function tower2(H) {
    var k = Math.floor(H), lg = Math.log10(Math.pow(2, H - k)), m = null;
    for (var i = 0; i < k; i++) {
      if (m) { m = BM.up(m); continue; }
      var nl = Math.pow(10, lg) * Math.log10(2);
      if (isFinite(nl)) lg = nl;
      else m = BM.up(BM.fromLog10(lg + Math.log10(Math.log10(2))));
    }
    if (m) return { m: m };
    return lg < 15 ? { b: BigInt(Math.max(1, Math.round(Math.pow(10, lg)))) } : { m: BM.fromLog10(lg) };
  }
  // smallest n with f(n) >= hp, by bisection (the hits before it are a rounding error)
  function towerHits(fn, hp) {
    var scale = fn === 'rayo' ? 1500 : 1000, lo = 1, hi = 2;
    while (V.cmp(tower2(hi / scale), hp) < 0) { hi *= 2; if (hi > 1e12) return null; }
    while (hi - lo > 1) { var mid = Math.floor((lo + hi) / 2); if (V.cmp(tower2(mid / scale), hp) >= 0) hi = mid; else lo = mid; }
    return { b: BigInt(hi) };
  }

  // Fish number 7 = F7^63(10^100): Fish's F7 function (an extension of Rayo's) applied 63
  // times to a googol. One application already reaches at least Rayo(10^100), so the whole
  // sequence sits in its own class just above Rayo's number (11.5), counted by applications.
  function fish7(n) {
    return V.cls(11.5, { b: BigInt(n) }, n === 63 ? 'Fish number 7' : 'F₇' + sup(n) + '(10¹⁰⁰)');
  }

  // Large Number Garden Number = f^10(10↑^10 10), where f is the Large Number Garden function
  // (built from set theory). It ranks above BIG FOOT and below Oblivion. The steps before
  // f^10 are placed just below it in the same class, which is a guess.
  function gardenF(n) {
    var v = V.cls(12.5, { b: BigInt(n) },
      n === 10 ? 'Large Number Garden Number' : 'f' + sup(n) + '(10↑¹⁰10)');
    if (n < 10) v.estimate = true;
    return v;
  }

  // SSCG / SCG - Friedman's graph sequences. Both live in the "SCG" growth class (2).
  // Inside that class values are ordered by an SSCG-equivalent index, stored doubled:
  //   SSCG(n) -> 2n.   SCG(n) is only known to sit between SSCG(n) and SSCG(4n+3), so the
  //   game guesses the middle, SSCG(2n+1) -> 4n+2. That makes SCG(13) about SSCG(27).
  function scgClass(n, isScg, name) {
    return V.cls(2, { b: isScg ? BigInt(4 * n + 2) : BigInt(2 * n) }, name);
  }
  var sscgCache = [];
  function sscg(n) {
    if (sscgCache[n]) return sscgCache[n];
    var v;
    if (n === 1) v = { b: 5n };
    else if (n === 2) { v = { m: BM.fromLog10(3.5775e28) }; v.name = 'about 3 × 2^(3 × 2⁹⁵)'; }
    else v = scgClass(n, false, 'SSCG(' + n + ')');      // SSCG(3) is already far past TREE(3)
    return (sscgCache[n] = v);
  }
  var scgCache = [];
  function scg(n) {
    if (!scgCache[n]) { scgCache[n] = scgClass(n, true, 'SCG(' + n + ')'); scgCache[n].estimate = true; }
    return scgCache[n];
  }

  // Busy Beaver: the most steps an n-state Turing machine can run and still stop.
  // BB(1)-BB(5) are known exactly; BB(6) is known to be more than 2↑↑↑5.
  // Beyond that NOBODY knows - the game uses a rough guess (marked estimate) that
  // climbs through Graham, TREE, SCG and Loader territory before going uncomputable.
  var BB_EXACT = [0n, 1n, 6n, 21n, 107n, 47176870n];
  var bbCache = [];
  function busyBeaver(n) {
    if (bbCache[n]) return bbCache[n];
    var v;
    if (n <= 5) v = { b: BB_EXACT[n] };
    else if (n === 6) v = V.hyper({ b: 3n }, 5, 'more than 2↑↑↑5');
    else {
      var name = 'BB(' + n + ')';
      if (n === 7) v = V.hyper({ b: 12n }, 10, name);
      else if (n <= 16) v = V.hyper(MBF.grahamValue(Math.round((n - 7) * 64 / 9)).h.a, 3, name);
      else if (n <= 30) v = V.cls(1, { b: BigInt(n - 14) }, name);
      else if (n <= 40) v = scgClass(n - 18, true, name);        // BB(31) ~ SCG(13)
      else if (n <= 60) v = V.cls(3, { b: BigInt(n - 36) }, name);        // BB(41) ~ Loader's number
      else v = V.cls(10, { b: BigInt(n) }, name);
      v.estimate = true;
    }
    return (bbCache[n] = v);
  }

  // A(n, n) = 2 ↑^(n-2) (n+3) - 3:  3, 7, 61, 2↑↑7 - 3, 2↑↑↑8 - 3, ...
  var ackCache = [];
  function ackermann(n) {
    if (ackCache[n]) return ackCache[n];
    var v;
    if (n === 1) v = { b: 3n };
    else if (n === 2) v = { b: 7n };
    else if (n === 3) v = { b: 61n };
    else if (n === 4) {
      var t = { b: 1n };
      for (var i = 0; i < 7; i++) t = pow2(t);                 // 2↑↑7
      v = t.b !== undefined ? { b: t.b - 3n } : { m: t.m };
      v.name = '2↑↑7 − 3';
    } else {
      v = V.hyper({ b: BigInt(n - 2) }, n + 3, '2' + arrows(n - 2) + (n + 3) + ' − 3');
    }
    return (ackCache[n] = v);
  }

  // Total damage after m hits, S(m) = f(1) + ... + f(m), exact (m is a BigInt, small enough).
  function sumExact(fn, m) {
    switch (fn) {
      case 'succ': return m * (m + 3n) / 2n;
      case 'double': return m * (m + 1n);
      case 'square': return m * (m + 1n) * (2n * m + 1n) / 6n;
      case 'pow10': return (10n ** (m + 1n) - 10n) / 9n;
      case 'fact': { var s = 0n; for (var i = 1; i <= Number(m); i++) s += factExact(i); return s; }
    }
  }

  // Smallest number of hits m with S(m) >= hp, as a value.
  function hitsToDestroy(fn, hp) {
    if (fn === 'rayo' || fn === 'foot') {
      if (fn === 'rayo' && hp.g && hp.g.r === 11)                        // Rayo(n) reaches Rayo's number at n = 10^100
        return hp.g.x ? { b: hp.g.n.b + 1n } : hp.g.n;                  // and passes anything just above it one hit later
      var dealtR = V.zero();
      for (var i = 1; i <= 20000; i++) {                                 // early on, the small hits add up
        dealtR = V.add(dealtR, MBF.fnValue(fn, i));
        if (V.cmp(dealtR, hp) >= 0) return { b: BigInt(i) };
      }
      if (hp.m) { var th = towerHits(fn, hp); if (th) return th; }
      return hp;
    }
    if (fn === 'ack' || fn === 'graham' || fn === 'tree' || fn === 'bb' || fn === 'sscg' || fn === 'scg' ||
        fn === 'arrows' || fn === 'tet' || fn === 'circle' || fn === 'loaderD' || fn === 'fish7' || fn === 'garden') {
      // these explode so fast that the total is just the latest hit: walk forward
      var dealt = V.zero();
      for (var k = 1; k <= 200; k++) {
        dealt = V.add(dealt, MBF.fnValue(fn, k));
        if (V.cmp(dealt, hp) >= 0) return { b: BigInt(k) };
      }
      // Ackermann needs about as many hits as the defender has arrows
      if ((fn === 'ack' || fn === 'arrows') && hp.h) return hp.h.a;   // one more arrow per hit
      return hp;                              // stuck in a lower class: about as many hits as the number itself
    }
    if (V.isExact(hp)) {
      var target = hp.b, hi = 1n;
      while (sumExact(fn, hi) < target) hi *= 2n;
      var lo = hi / 2n + 1n;
      if (hi === 1n) return { b: 1n };
      while (lo < hi) {
        var mid = (lo + hi) / 2n;
        if (sumExact(fn, mid) >= target) hi = mid; else lo = mid + 1n;
      }
      return { b: hi };
    }
    var lg = V.log10(hp);
    if (!isFinite(lg)) {
      // beyond doubles: square roots don't dent these, but 10^n / n! need about log10(hp) hits
      if (fn === 'pow10' || fn === 'fact') return V.down(hp);
      return hp;
    }
    switch (fn) {
      case 'succ': return V.lg10((lg + Math.log10(2)) / 2);
      case 'double': return V.lg10(lg / 2);
      case 'square': return V.lg10((lg + Math.log10(3)) / 3);
      case 'pow10': return V.lg10(Math.log10(Math.ceil(lg - Math.log10(10 / 9))));
      case 'fact': {
        var a = 1, b = 2;
        while (lgFact(b) < lg) b *= 2;
        while (b - a > Math.max(1, b * 1e-12)) { var c = (a + b) / 2; if (lgFact(c) >= lg) b = c; else a = c; }
        return V.lg10(Math.log10(Math.ceil(b)));
      }
    }
  }

  // ---------------------------------------------------------------- impact levels
  // Level comes from the size of the damage, not the share of health.
  //   0: 1-9   1: 10-999   2: up to 10^15   3: up to a googol   4: up to a googolplex
  //   5+: later phases (Moser, Graham, TREE, Rayo ...)
  MBF.MAX_LEVEL = 9;
  //   5: beyond a googolplex up to Moser (taller towers, Ackermann, up-arrows)
  //   6: Graham's sequence (the number of arrows is itself an up-arrow number)
  function nesting(v) { var d = 0; while (v.h) { d++; v = v.h.a; } return d; }
  MBF.impactOf = function (damage, ko) {
    var lg = V.log10(damage), level, t;
    var edges = [0, 1, 3, 15, 100];
    if (lg < 100) {
      for (var i = 0; i < 4; i++) {
        if (lg < edges[i + 1]) { level = i; t = (lg - edges[i]) / (edges[i + 1] - edges[i]); break; }
      }
    } else if (lg <= 1e100 * (1 + 1e-12)) {
      level = 4; t = (Math.log10(lg) - 2) / 98;
    } else if (damage.g) {
      // 7: TREE / SCG / Loader (computable, far past Graham)   8: uncomputable (BB, Rayo, BIG FOOT)
      var r = damage.g.r;
      if (r < 10) { level = 7; t = Math.min(1, (r - 1) / 2.5 + 0.05 * Math.min(4, V.log10(damage.g.n))); }
      else { level = 8; t = Math.min(1, (r - 10) / 2); }
    } else if (!damage.h) {
      var m = V.mag(damage);                                 // towers: googolplexplex, Skewes, A(4,4)
      level = 5; t = Math.min(0.45, 0.12 * (m.L - 3) + 0.02 * m.t);
    } else if (nesting(damage) >= 2) {
      level = 6; t = Math.min(1, (nesting(damage) - 1) / 63);
    } else {
      var a = damage.h.a;                                    // up-arrows: Ackermann, Moser
      level = 5;
      t = a.b !== undefined ? 0.5 + 0.4 * Math.min(1, Math.log10(Number(a.b)) / 2) : 0.95;
    }
    if (ko) level += 1;
    return { level: Math.min(level, MBF.MAX_LEVEL), t: Math.max(0, Math.min(1, t)) };
  };

  // ---------------------------------------------------------------- durations
  // Human text for a wait given as log10(seconds), so astronomically long waits work.
  var YEAR = 31557600;
  MBF.describeWait = function (log10Seconds) {
    if (!isFinite(log10Seconds)) return 'forever, basically';
    if (log10Seconds < 6) {
      var s = Math.max(1, Math.round(Math.pow(10, log10Seconds)));
      if (s < 60) return s + ' s';
      if (s < 3600) return Math.floor(s / 60) + ' min ' + (s % 60) + ' s';
      if (s < 86400) return Math.floor(s / 3600) + ' h ' + Math.floor((s % 3600) / 60) + ' min';
      return Math.round(s / 86400) + ' days';
    }
    var ly = log10Seconds - Math.log10(YEAR);
    if (ly < 0) return Math.round(Math.pow(10, log10Seconds) / 86400) + ' days';
    var years;
    if (ly < 6) years = Math.round(Math.pow(10, ly)).toLocaleString('en-US') + ' years';
    else if (ly < 1e15) {
      var e = Math.floor(ly), mant = Math.round(Math.pow(10, ly - e));
      if (mant >= 10) { mant = 1; e += 1; }
      years = (mant > 1 ? mant + ' × ' : '') + '10' + sup(e) + ' years';
    } else years = BM.format(BM.fromLog10(ly)) + ' years';
    if (ly >= 100) years += ' (longer than the universe lasts before heat death, about 10¹⁰⁰ years)';
    else if (ly >= 10.14) years += ' (longer than the universe has existed)';
    return years;
  };

  // "0.000…% (97 zeros)" style text for a tiny percentage given as log10(percent)
  MBF.describePercent = function (lgPct) {
    if (lgPct >= -2) return (Math.pow(10, lgPct)).toFixed(lgPct >= 0 ? 1 : 2) + '%';
    if (lgPct >= -6) return (Math.pow(10, lgPct)).toFixed(Math.ceil(-lgPct) + 1) + '%';
    var zeros = Math.ceil(-lgPct) - 1;
    var z = zeros < 1e15 ? zeros.toLocaleString('en-US') : BM.format(BM.fromLog10(Math.log10(zeros)));
    return '0.000…% (' + z + ' zeros after the point)';
  };

  // Fictional vs fictional: the bigger size score wins. Close in size takes several hits
  // (up to FX_HITS when they are level, or when the wiki says the two are equal); a gap of
  // FX_CLOSE or more is a one-shot. 0 means the attacker is smaller and can never win.
  var FX_HITS = 10, FX_CLOSE = 1;
  MBF.fictionalHits = function (att, def) {
    if (MBF.fxEqual && MBF.fxEqual[att.id + '|' + def.id]) return FX_HITS;
    var d = att.fscore - def.fscore;
    if (d < 0) return 0;
    return Math.max(1, Math.ceil(FX_HITS * (1 - d / FX_CLOSE)));
  };

  // ---------------------------------------------------------------- the fight
  MBF.createFight = function (att, def) {
    var ok = MBF.canFight(att, def);
    if (!ok.ok) throw new Error(ok.reason);
    var maxHp = MBF.valueOf(def);
    var isFn = att.kind === 'function';
    var constDmg = isFn ? null : MBF.valueOf(att);
    var f = {
      attacker: att, defender: def, isFunction: isFn,
      maxHp: maxHp, dealt: V.zero(), hits: 0n, input: 1, over: false
    };

    // total hits needed, fixed for the whole fight
    var totalHits;
    if (isFn) totalHits = hitsToDestroy(att.fn, maxHp);
    else if (V.isExact(maxHp) && V.isExact(constDmg)) {
      totalHits = { b: (maxHp.b + constDmg.b - 1n) / constDmg.b };
    } else if (V.cmp(constDmg, maxHp) >= 0) totalHits = { b: 1n };
    else if (!isFinite(V.log10(maxHp))) totalHits = maxHp;   // dividing doesn't dent it
    else totalHits = V.lg10(V.log10(maxHp) - V.log10(constDmg));
    // (R^R × R) ÷ R = R^R: Rayo's number needs Rayo's number ^ Rayo's number hits
    if (!isFn && att.special === 'rayo' && def.special === 'gotch') totalHits = MBF.RAYO_POW_RAYO;
    if (unreachable(maxHp) && !V.isExact(totalHits)) totalHits = MBF.INFINITY;
    var fxHits = !isFn && att.fictional && def.fictional ? MBF.fictionalHits(att, def) : -1;
    if (fxHits === 0) totalHits = MBF.INFINITY;
    else if (fxHits > 0) totalHits = { b: BigInt(fxHits) };
    f.totalHits = totalHits;

    // damage the next hit will do
    f.damage = function () { return isFn ? MBF.fnValue(att.fn, f.input) : constDmg; };
    f.label = function () { return isFn ? MBF.fnLabel(att, f.input) : att.label; };

    f.hit = function () {
      if (f.over) return null;
      var dmg = f.damage(), input = f.input;
      f.dealt = V.add(f.dealt, dmg);
      f.hits += 1n;
      if (isFn) f.input += 1;
      var ko = fxHits >= 0 ? fxHits > 0 && f.hits >= BigInt(fxHits) : V.cmp(f.dealt, maxHp) >= 0;
      if (ko) f.over = true;
      var imp = MBF.impactOf(dmg, ko);
      return { damage: dmg, ko: ko, level: imp.level, t: imp.t, input: input };
    };

    // hits still needed, as a value
    f.hitsToKo = function () {
      if (f.over) return V.zero();
      if (V.isExact(totalHits)) { var r = totalHits.b - f.hits; return { b: r > 0n ? r : 1n }; }
      return totalHits;                       // astronomically many: what we have done is a rounding error
    };

    // health left as a fraction 0..1 (bars and cracks)
    f.hpFraction = function () {
      if (f.over) return 0;
      if (fxHits >= 0) return fxHits > 0 ? 1 - Number(f.hits) / fxHits : 1;
      if (V.isExact(maxHp) && V.isExact(f.dealt)) {
        var rem = maxHp.b - f.dealt.b;
        if (BM.log10Big(maxHp.b) < 15) return Number(rem) / Number(maxHp.b);
        return Number((rem * 1000000n) / maxHp.b) / 1e6;
      }
      if (!isFinite(V.log10(maxHp))) return V.cmp(f.dealt, maxHp) < 0 ? 1 : 0;
      var d = V.log10(f.dealt) - V.log10(maxHp);
      if (d < -9) return 1;
      return Math.max(0, 1 - Math.pow(10, d));
    };

    // true when the damage so far is too small to show up as a number
    f.negligible = function () {
      if (f.dealt.b === 0n || fxHits >= 0) return false;
      if (!isFinite(V.log10(maxHp))) return V.cmp(f.dealt, maxHp) < 0;
      return V.log10(f.dealt) < V.log10(maxHp) - 6;
    };

    // "HP 44 / 100", or "Googol − 37" when the damage is a rounding error
    f.hpText = function () {
      if (f.over) return 'HP 0';
      if (fxHits >= 0) {
        var left = fxHits > 0 ? Math.round(100 * f.hpFraction()) + '% left' : 'untouched';
        return 'HP: ' + def.name + (f.hits > 0n ? ' (' + left + ')' : '');
      }
      var bigHp = V.log10(maxHp) >= 15;
      if (bigHp && f.dealt.b === 0n && maxHp.name) return 'HP: ' + maxHp.name;
      if (bigHp && f.dealt.b === 0n) return 'HP: ' + def.label + ' (' + V.fmt(maxHp) + ')';
      if (f.negligible()) {
        var dealtTxt = V.fmt(f.dealt);
        if (dealtTxt.indexOf('−') >= 0) dealtTxt = '(' + dealtTxt + ')';
        return 'HP: ' + (maxHp.name && (maxHp.h || maxHp.g) ? maxHp.name : def.label) + ' − ' + dealtTxt;
      }
      if (V.isExact(maxHp) && V.isExact(f.dealt)) {
        var rem = maxHp.b - f.dealt.b;
        if (BM.log10Big(maxHp.b) < 15) return 'HP ' + MBF.fmt(rem) + ' / ' + MBF.fmt(maxHp.b);
        return 'HP ' + MBF.fmt(rem);
      }
      return 'HP ≈ ' + V.fmt({ m: BM.fromLog10(V.log10(maxHp) + Math.log10(Math.max(1e-300, f.hpFraction()))) });
    };

    // "Damage so far: 0.000…% (97 zeros after the point)" once the bar cannot show it
    f.percentText = function () {
      if (f.over || f.dealt.b === 0n || fxHits >= 0) return '';
      if (!isFinite(V.log10(maxHp))) {
        return f.negligible() ? 'Damage so far: 0.000…% (more zeros after the point than could ever be written)' : '';
      }
      var lgPct = V.log10(f.dealt) - V.log10(maxHp) + 2;
      if (lgPct > -2) return '';
      return 'Damage so far: ' + MBF.describePercent(lgPct);
    };

    // wait text for the remaining hits at hitsPerSecond
    f.waitText = function (hitsPerSecond) {
      if (!(hitsPerSecond > 0) || f.over) return '';
      var left = f.hitsToKo(), lg = V.log10(left);
      if (left === MBF.INFINITY) return 'forever: no number of hits is ever enough';
      if (!isFinite(lg)) {
        // so big that seconds, years or lifetimes of the universe make no difference
        return V.fmt(left) + ' years (far, far beyond the heat death of the universe)';
      }
      return MBF.describeWait(lg - Math.log10(hitsPerSecond));
    };

    return f;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
