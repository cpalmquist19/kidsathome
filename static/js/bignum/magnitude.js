/*
 * BigMag - sizes of numbers far too large to store.
 *
 * A magnitude is { L, t }: apply log10 L times to the number to land on t.
 *   L = 0  ->  value = t                (t < 10)
 *   L = 1  ->  value = 10^t             (t < 10)
 *   L = 2  ->  value = 10^10^t          (a googol is {2, 2})
 *   L = 3  ->  value = 10^10^10^t       (a googolplex is {3, 2})
 * Compare by L, then t. Same convention as Numbers VS. Operations' engine.
 *
 * Shared by games under static/js. Works in the browser and in node.
 */
(function (root) {
  'use strict';
  var BM = root.BigMag = {};

  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '' };
  function sup(n) { return String(n).replace(/[0-9+-]/g, function (c) { return SUP[c]; }); }
  BM.sup = sup;

  function norm(x) {
    var L = 0;
    while (x >= 10) { x = Math.log10(x); L++; }
    return { L: L, t: x };
  }
  BM.norm = norm;

  // log10 of a positive BigInt, ~15 significant digits.
  BM.log10Big = function (b) {
    if (b <= 0n) return -Infinity;
    var s = b.toString();
    if (s.length <= 15) return Math.log10(Number(s));
    return (s.length - 1) + Math.log10(Number(s.slice(0, 15)) / 1e14);
  };

  // magnitude of the number whose log10 is lg (lg may be up to ~1.8e308)
  BM.fromLog10 = function (lg) {
    if (lg === Infinity) return { L: Infinity, t: 1 };
    if (lg < 1) return { L: 0, t: Math.pow(10, lg) };
    var m = norm(lg);
    return { L: m.L + 1, t: m.t };
  };
  BM.fromBig = function (b) { return BM.fromLog10(BM.log10Big(b)); };
  BM.up = function (m) { return { L: m.L + 1, t: m.t }; };   // 10^value

  // log10 of the value as a double; Infinity when it does not fit
  BM.log10 = function (m) {
    if (m.L === 0) return Math.log10(m.t);
    var x = m.t;
    for (var i = 1; i < m.L; i++) {
      x = Math.pow(10, x);
      if (!isFinite(x)) return Infinity;
    }
    return x;
  };

  function r9(x) { return Math.round(x * 1e9) / 1e9; }
  BM.cmp = function (a, b) {
    if (a.L !== b.L) return a.L < b.L ? -1 : 1;
    var x = r9(a.t), y = r9(b.t);
    return x < y ? -1 : x > y ? 1 : 0;
  };

  // a + b. Exact enough for display and comparisons: when the sizes are far
  // apart the smaller one simply vanishes, as it does in real arithmetic.
  BM.add = function (a, b) {
    var la = BM.log10(a), lb = BM.log10(b);
    if (!isFinite(la) || !isFinite(lb)) return BM.cmp(a, b) >= 0 ? a : b;
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return BM.fromLog10(hi + Math.log10(1 + Math.pow(10, lo - hi)));
  };

  // short human text: 1,234,567 · 4.02 × 10¹²³⁴⁵ · 10^(1.00 × 10¹⁰⁰) · 10^10^10^2.00
  BM.format = function (m) {
    var lg = BM.log10(m);
    if (lg < 15) return Math.round(Math.pow(10, lg)).toLocaleString('en-US');
    if (lg < 1e15) {
      var e = Math.floor(lg), mant = Math.pow(10, lg - e);
      if (mant >= 9.995) { mant = 1; e += 1; }
      return mant.toFixed(2) + ' × 10' + sup(e);
    }
    if (isFinite(lg)) return '10^(' + BM.format(BM.fromLog10(Math.log10(lg))) + ')';
    if (m.L > 5) return '10↑↑' + Math.round(m.L).toLocaleString('en-US');   // a tower of L tens
    var s = '';
    for (var i = 0; i < m.L - 1; i++) s += '10^';
    return s + Math.round(Math.pow(10, m.t)).toLocaleString('en-US');   // 10^10^10^100
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = BM;
})(typeof window !== 'undefined' ? window : globalThis);
