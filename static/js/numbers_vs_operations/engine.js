/*
 * Numbers VS. Operations - game engine (no DOM; runs in the browser and in node).
 *
 *   var eng = NVO.createEngine(data, { illionName: NVO.illionName });
 *
 * RULES
 *  - Every fight the running value V starts at 1. One "tick" applies the
 *    current operation once. The moment V >= the boss, the boss dies, and so
 *    does every other boss <= V (multi-kill). The next boss is the smallest
 *    one above V.
 *  - Operations: Addition (V+1), Multiplication (V*2), Exponentiation (2^V),
 *    Tetration (2^^V), then one operation per googology growth class.
 *  - You always use your newest operation. A new operation arrives right
 *    before the first boss the current one cannot kill within TICK_BUDGET ticks.
 *
 * NUMBERS
 *  - Bosses = the explicit list (data.numbers) merged with the endless
 *    "-illion" series from n = 1000 up to a googolplex, which is computed from
 *    arithmetic and never listed. Infinity is the last boss.
 *  - V is a magnitude {L, t}: apply log10 L times to get t in [1,10). Compare
 *    by L, then t (t rounded to 6 places, like the data file).
 *  - Past the last boss that has a magnitude, only the order is known, so V
 *    becomes a rank {r}: it kills every explicit boss with index <= r.
 */
(function (root) {
  'use strict';

  var LOG2 = Math.log10(2);
  var DEFAULTS = { tickBudget: 30, zonePower: 1.5, infinityTicks: 30 };

  // ---------------------------------------------------------------- magnitudes
  function norm(x) {
    var L = 0;
    while (x >= 10) { x = Math.log10(x); L++; }
    return { L: L, t: x };
  }
  function up(m) { return { L: m.L + 1, t: m.t }; }
  function realOf(m) {
    if (m.L === 0) return m.t;
    if (m.L === 1) return Math.pow(10, m.t);
    if (m.L === 2 && m.t < 2.4886) return Math.pow(10, Math.pow(10, m.t));
    return Infinity;
  }
  function r6(x) { return Math.round(x * 1e6) / 1e6; }
  function cmp(a, b) {
    if (a.L !== b.L) return a.L < b.L ? -1 : 1;
    var x = r6(a.t), y = r6(b.t);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  // m * c for 0 < c < 1, used by 2^V = 10^(V * log10 2) when V > 1000.
  function mulC(m, c) {
    var lc = Math.log10(c);
    if (m.L === 1) return { L: 1, t: m.t + lc };
    if (m.L === 2) return { L: 2, t: Math.log10(Math.pow(10, m.t) + lc) };
    return m;
  }
  function pow2(m) {
    var r = realOf(m);
    if (r <= 1000) return norm(Math.pow(2, r));
    return up(mulC(m, LOG2));
  }
  // 2^^h for a whole number h >= 1
  function tower2(h) {
    var x = { L: 0, t: 1 }, steps = Math.min(h, 12);
    for (var k = 0; k < steps; k++) x = pow2(x);
    if (h > 12) x = { L: x.L + (h - 12), t: x.t };
    return x;
  }
  // magnitude of a positive BigInt
  function magBig(E) {
    var s = E.toString();
    if (s.length <= 15) return norm(Number(s));
    var lead = Number(s.slice(0, 15)) / 1e14;
    return up(norm((s.length - 1) + Math.log10(lead)));
  }
  function seriesMagOfExp(E) { return up(magBig(E)); }       // 10^E

  // ---------------------------------------------------------------- formatting
  function fmtBig(b) {
    var s = (typeof b === 'bigint' ? b : BigInt(b)).toString();
    if (s.length <= 15) return Number(s).toLocaleString('en-US');
    return s.charAt(0) + '.' + s.slice(1, 3) + ' x 10^' + (s.length - 1);
  }
  function fmtMag(m) {
    if (m.L === 0) return String(Math.round(m.t * 1e6) / 1e6).replace(/\.0+$/, '');
    var r = realOf(m);
    if (m.L === 1 && r < 1e12) return Math.round(r).toLocaleString('en-US');
    if (m.L === 1) {
      var e = Math.floor(m.t);
      return (Math.pow(10, m.t - e)).toFixed(2) + ' x 10^' + e;
    }
    if (m.L === 2) {
      var x = Math.pow(10, m.t);
      return '10^' + (x < 1e7 ? Math.round(x).toLocaleString('en-US')
        : (Math.pow(10, Math.log10(x) % 1)).toFixed(2) + ' x 10^' + Math.floor(Math.log10(x)));
    }
    var pre = '';
    for (var k = 0; k < Math.min(m.L, 3); k++) pre += '10^';
    return pre + (m.L > 3 ? '...(' + m.L.toLocaleString('en-US') + ' levels)...' : '') +
      m.t.toFixed(3);
  }

  // ---------------------------------------------------------------- engine
  function createEngine(data, deps, options) {
    var opt = Object.assign({}, DEFAULTS, options || {});
    var C = opt.tickBudget;
    var illionName = deps.illionName;
    var ladder = data.numbers;
    var NX = ladder.length;
    var series = data.meta.series;
    var SER_FIRST = 1000n;
    var SER_LAST = BigInt(series.lastN);
    var SER_COUNT = SER_LAST - SER_FIRST + 1n;
    var tiers = data.meta.tiers;

    // zone start: first explicit entry without a magnitude that is a tier entry
    var Z0 = NX;
    for (var zi = 0; zi < NX; zi++) {
      if (!ladder[zi].mag && String(ladder[zi].category).indexOf('tier:') === 0) { Z0 = zi; break; }
    }
    // effective magnitude of every entry before the zone (unmagged ones inherit)
    var emag = [];
    for (var i = 0; i < Z0; i++) {
      var g = ladder[i].mag;
      emag.push(g ? { L: Number(g.levels), t: g.top } : (i ? emag[i - 1] : { L: 0, t: 1 }));
    }
    // tier spans in the zone
    var span = {};
    for (var j = Z0; j < NX; j++) {
      var tid = String(ladder[j].category).replace('tier:', '');
      if (ladder[j].category.indexOf('tier:') !== 0) continue;
      if (!span[tid]) span[tid] = { s: j, e: j };
      span[tid].e = j;
    }
    // bowers entries sit between tier entries: stretch each span up to the next one's start
    var order = tiers.map(function (t) { return t.id; }).filter(function (id) { return span[id]; });
    for (var q = 0; q < order.length; q++) {
      var cur = span[order[q]];
      cur.e = q + 1 < order.length ? span[order[q + 1]].s - 1 : NX - 1;
    }

    // ------------------------------------------------------------- operations
    function seq(f) {            // V[1..C+20]
      var out = [null], v = { L: 0, t: 1 };
      for (var n = 1; n <= C + 20; n++) { v = f(v, n); out.push(v); }
      return out;
    }
    function zoneSeq(s, e) {
      var size = e - s + 1, out = [null];
      for (var n = 1; n <= C + 20; n++) {
        var k = Math.min(size, Math.ceil(size * Math.pow(Math.min(n, C) / C, opt.zonePower)));
        out.push({ r: s - 1 + k });
      }
      return out;
    }
    var OPS = [];
    OPS.push({ id: 'add', name: 'Addition', sym: '+', rule: 'V + 1',
      V: seq(function (v, n) { return norm(n + 1); }) });
    OPS.push({ id: 'mul', name: 'Multiplication', sym: '×', rule: 'V × 2',
      V: seq(function (v, n) { return norm(Math.pow(2, n)); }) });
    OPS.push({ id: 'pow', name: 'Exponentiation', sym: '^', rule: '2 ^ V',
      V: seq(function (v) { return pow2(v); }) });
    var th = span['tetration-heights'];
    var tetV = [null], tv = null;
    for (var n2 = 1; n2 <= C + 20; n2++) {
      if (n2 === 1) tv = norm(2);
      else {
        var h = tv.r === undefined ? realOf(tv) : Infinity;
        if (isFinite(h) && h <= 1e6) tv = tower2(Math.round(h));
        else tv = { r: th ? Math.min(th.e, th.s + (n2 - 5)) : Z0 };
      }
      tetV.push(tv);
    }
    OPS.push({ id: 'tet', name: 'Tetration', sym: '↑↑', rule: '2 ↑↑ V', V: tetV });

    var TIER_OPS = [
      ['up-arrow', 'Pentation', '↑↑↑'],
      ['linear-omega', 'Ackermann', 'fω'],
      ['quadratic-omega', 'Double diagonal', 'fω²'],
      ['polynomial-omega', 'Triple diagonal', 'fω³'],
      ['exp-linear-omega', 'Omega to the omega', 'fω^ω'],
      ['exp-polynomial-omega', 'Omega tower', 'fω^ω²'],
      ['double-exp-omega', 'Double exponent', 'fω^ω^ω'],
      ['triple-exp-omega', 'Triple exponent', 'fω^ω^ω^ω'],
      ['iterated-cantor', 'Cantor tower', 'fε₀⁻'],
      ['epsilon', 'Epsilon', 'fε'],
      ['binary-phi', 'Veblen phi', 'fφ'],
      ['bachmann', 'Collapsing', 'fψ'],
      ['higher-computable', 'Beyond TREE(3)', 'fΩ'],
      ['uncomputable', 'Busy Beaver', 'BB']
    ];
    TIER_OPS.forEach(function (d) {
      var sp = span[d[0]];
      if (!sp) return;
      OPS.push({ id: d[0], name: d[1], sym: d[2], rule: 'grows like ' + d[2],
        tier: d[0], V: zoneSeq(sp.s, sp.e) });
    });
    var limV = [null];
    for (var n3 = 1; n3 <= C + 20; n3++) limV.push({ lim: n3 });
    OPS.push({ id: 'limit', name: 'Limit', sym: '∞', rule: 'lim n → ∞', V: limV });

    // ------------------------------------------------------------- series maths
    function seriesMag(n) { return seriesMagOfExp(3n * n + 3n); }
    function bigFromReal(x) {      // floor(x) as BigInt for x up to ~1e101 (15 digits kept)
      if (x < 1e15) return BigInt(Math.floor(x));
      var k = Math.floor(Math.log10(x)) - 14;
      return BigInt(Math.floor(x / Math.pow(10, k))) * (10n ** BigInt(k));
    }
    // smallest series index n whose term is strictly above V (SER_LAST+1 if none)
    function seriesAbove(V) {
      if (V.r !== undefined || V.lim !== undefined || V.L >= 4) return SER_LAST + 1n;
      if (V.L <= 1) return SER_FIRST;
      var E;                                  // floor(log10 V)
      if (V.L === 2) E = BigInt(Math.floor(Math.pow(10, V.t) + 1e-9));
      else {
        var x = Math.pow(10, V.t);            // log10(log10 V)
        if (x >= 101) return SER_LAST + 1n;
        var k = Math.floor(x), f = x - k;
        var mant = Math.pow(10, f);
        E = k <= 14 ? BigInt(Math.floor(Math.pow(10, x)))
          : BigInt(Math.floor(mant * 1e14)) * (10n ** BigInt(k - 14));
      }
      var nMax = (E - 3n) / 3n;               // largest n with 3n+3 <= E
      var nxt = nMax + 1n;
      if (nxt < SER_FIRST) nxt = SER_FIRST;
      if (nxt > SER_LAST + 1n) nxt = SER_LAST + 1n;
      return nxt;
    }
    function explicitAbove(V) {              // first index (< Z0) with emag > V, else Z0
      var lo = 0, hi = Z0;
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        if (cmp(emag[mid], V) > 0) hi = mid; else lo = mid + 1;
      }
      return lo;
    }

    // ------------------------------------------------------------- pointers
    // {k:'x', i} explicit boss | {k:'s', n:BigInt} series boss | {k:'f'} Infinity
    function px(i) { return i >= NX ? { k: 'f' } : { k: 'x', i: i }; }
    function ps(n) { return { k: 's', n: n }; }
    function same(a, b) { return a.k === b.k && a.i === b.i && a.n === b.n; }

    function bossMag(p) {
      if (p.k === 'x') return p.i < Z0 ? emag[p.i] : null;
      if (p.k === 's') return seriesMag(p.n);
      return null;
    }
    function beats(V, p) {
      if (V.lim !== undefined) return p.k === 'f' ? V.lim >= opt.infinityTicks : true;
      if (V.r !== undefined) return p.k === 'f' ? false : p.k === 's' ? true : p.i <= V.r;
      if (p.k === 'f') return false;
      if (p.k === 'x' && p.i >= Z0) return false;
      return cmp(V, bossMag(p)) >= 0;
    }
    function ticksNeeded(op, p) {
      var a = 1, b = C;                     // only the first C ticks count
      if (!beats(op.V[b], p)) return Infinity;
      while (a < b) {
        var mid = (a + b) >> 1;
        if (beats(op.V[mid], p)) b = mid; else a = mid + 1;
      }
      return a;
    }
    // number of bosses strictly before p (BigInt)
    function rankOf(p) {
      if (p.k === 'f') return BigInt(NX) + SER_COUNT;
      if (p.k === 's') {
        var m = seriesMag(p.n), lo = 0, hi = Z0;
        while (lo < hi) { var md = (lo + hi) >> 1; if (cmp(emag[md], m) < 0) lo = md + 1; else hi = md; }
        return BigInt(lo) + (p.n - SER_FIRST);
      }
      if (p.i >= Z0) return BigInt(p.i) + SER_COUNT;
      return BigInt(p.i) + (seriesAbove(emag[p.i]) - SER_FIRST);
    }
    // the boss after a kill with V
    function nextAfter(V) {
      if (V.lim !== undefined) return { k: 'f' };
      if (V.r !== undefined) return px(Math.floor(V.r) + 1);
      var e = explicitAbove(V), sN = seriesAbove(V);
      if (sN > SER_LAST) return e >= Z0 ? px(Z0) : px(e);
      if (e >= Z0) return ps(sN);
      return cmp(seriesMag(sN), emag[e]) < 0 ? ps(sN) : px(e);
    }

    // ------------------------------------------------------------- entries
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function entryOf(p) {
      if (p.k === 'x') return ladder[p.i];
      if (p.k === 'f') return { name: data.meta.finalBoss.name, isFinal: true };
      var E = 3n * p.n + 3n;
      return {
        name: cap(illionName(p.n)), category: 'illion', series: true,
        value: { kind: 'pow10', exponent: E.toString() },
        definition: '10^' + fmtBig(E).replace(' x ', ' × ')
      };
    }
    function keyOf(p) { return p.k === 'x' ? 'x' + p.i : p.k === 's' ? 's' + p.n : 'f'; }
    function fromKey(s) {
      if (s === 'f') return { k: 'f' };
      return s.charAt(0) === 'x' ? px(Number(s.slice(1))) : ps(BigInt(s.slice(1)));
    }
    function totalBosses() { return BigInt(NX) + SER_COUNT + 1n; }

    // bosses to flash through between two pointers (for the multi-kill animation)
    function sampleBetween(from, to, maxN) {
      var out = [], i, k;
      var xi0 = from.k === 'x' ? from.i : -1;
      var xi1 = to.k === 'x' ? to.i : (to.k === 'f' ? NX : Z0);
      var span2 = xi1 - xi0 - 1;
      var nx = Math.min(span2 > 0 ? span2 : 0, Math.ceil(maxN / 2));
      for (k = 1; k <= nx; k++) out.push({ p: px(xi0 + Math.round(k * span2 / (nx + 1))), m: null });
      // series terms in between (log-spaced)
      var sLo = from.k === 's' ? from.n : SER_FIRST;
      var sHi = to.k === 's' ? to.n - 1n : SER_LAST;
      if (sHi >= sLo && !(from.k === 'x' && from.i >= Z0)) {
        var cnt = maxN - nx, lo = Number(sLo), hi = Number(sHi > 1000000000000000n ? 1000000000000000n : sHi);
        for (k = 1; k <= cnt; k++) {
          var f = k / (cnt + 1);
          var nn = sHi > 1000000000000000n
            ? (sLo + (sHi - sLo) * BigInt(Math.round(f * f * 1e6)) / 1000000n)
            : BigInt(Math.round(lo * Math.pow(hi / lo, f)));
          if (nn < sLo) nn = sLo;
          if (nn > sHi) nn = sHi;
          out.push({ p: ps(nn), m: null });
        }
      }
      out.forEach(function (o) { o.r = rankOf(o.p); });
      out.sort(function (a, b) { return a.r < b.r ? -1 : a.r > b.r ? 1 : 0; });
      return out.map(function (o) { return o.p; });
    }

    // Which operation do we have once the next boss is p? (unlock rule)
    function opFor(opIdx, p) {
      while (opIdx < OPS.length - 1 && ticksNeeded(OPS[opIdx], p) === Infinity) opIdx++;
      return opIdx;
    }

    return {
      OPS: OPS, C: C, Z0: Z0, ladder: ladder, tierSpan: span,
      first: function () { return px(0); },
      beats: beats, nextAfter: nextAfter, ticksNeeded: ticksNeeded, opFor: opFor,
      rankOf: rankOf, entryOf: entryOf, keyOf: keyOf, fromKey: fromKey,
      totalBosses: totalBosses, sampleBetween: sampleBetween, same: same,
      seriesFirst: SER_FIRST, seriesLast: SER_LAST,
      fmtV: function (V) {
        if (V.lim !== undefined) return 'lim ' + V.lim;
        if (V.r !== undefined) return 'up to ' + ladder[Math.min(NX - 1, V.r)].name;
        return fmtMag(V);
      },
      fmtBig: fmtBig
    };
  }

  var api = {
    createEngine: createEngine,
    _mag: { norm: norm, cmp: cmp, pow2: pow2, tower2: tower2, realOf: realOf, magBig: magBig, fmtMag: fmtMag }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NVO = Object.assign(root.NVO || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
