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
      if (a.h || b.h) return V.cmp(a, b) >= 0 ? a : b;     // the smaller one vanishes
      if (a.b !== undefined && b.b !== undefined) return V.big(a.b + b.b);
      return { m: BM.add(V.mag(a), V.mag(b)) };
    },
    // one level of log10 off a huge value (for "how many hits of 10^n")
    down: function (v) {
      if (v.h) return v;
      var m = V.mag(v);
      if (m.L <= 1) return { b: BigInt(Math.ceil(BM.log10(m))) };
      return { m: { L: m.L - 1, t: m.t } };
    },
    fmt: function (v) {
      if (v.name) return v.name;
      if (v.b !== undefined) return MBF.fmt(v.b);
      if (v.m) return BM.format(v.m);
      var a = v.h.a;
      if (a.b !== undefined && a.b <= 5n) return '10' + '↑'.repeat(Number(a.b)) + v.h.x;
      return '10↑^(' + V.fmt(a) + ') ' + v.h.x;
    }
  };

  var SUB = '₀₁₂₃₄₅₆₇₈₉';
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
    }
    throw new Error('unknown function ' + fn);
  };

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
    if (fn === 'ack' || fn === 'graham') {
      // these explode so fast that the total is just the latest hit: walk forward
      var dealt = V.zero();
      for (var k = 1; k <= 80; k++) {
        dealt = V.add(dealt, MBF.fnValue(fn, k));
        if (V.cmp(dealt, hp) >= 0) return { b: BigInt(k) };
      }
      // Ackermann needs about as many hits as the defender has arrows
      if (hp.h) return hp.h.a;
      return hp;
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
  MBF.MAX_LEVEL = 8;
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
      var ko = V.cmp(f.dealt, maxHp) >= 0;
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
      if (f.dealt.b === 0n) return false;
      if (!isFinite(V.log10(maxHp))) return V.cmp(f.dealt, maxHp) < 0;
      return V.log10(f.dealt) < V.log10(maxHp) - 6;
    };

    // "HP 44 / 100", or "Googol − 37" when the damage is a rounding error
    f.hpText = function () {
      if (f.over) return 'HP 0';
      var bigHp = V.log10(maxHp) >= 15;
      if (bigHp && f.dealt.b === 0n && maxHp.name) return 'HP: ' + maxHp.name;
      if (bigHp && f.dealt.b === 0n) return 'HP: ' + def.label + ' (' + V.fmt(maxHp) + ')';
      if (f.negligible()) {
        var dealtTxt = V.fmt(f.dealt);
        if (dealtTxt.indexOf('−') >= 0) dealtTxt = '(' + dealtTxt + ')';
        return 'HP: ' + (maxHp.name && maxHp.h ? maxHp.name : def.label) + ' − ' + dealtTxt;
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
      if (f.over || f.dealt.b === 0n) return '';
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
