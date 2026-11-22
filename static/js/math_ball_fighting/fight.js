/*
 * Math Ball Fighting - fight rules (no DOM; runs in the browser and in node).
 *
 *   var f = MBF.createFight(attackerBall, defenderBall);
 *   var r = f.hit();   // { damage, hpBefore, hpAfter, ko, overkill, level, t }
 *
 * RULES
 *  - The defender is always a number. Function vs function cannot fight.
 *  - Number attackers do the same damage every hit (their value).
 *  - Health starts at the defender's value and the fight ends at 0. No timer.
 *
 * Phase 1 values are exact BigInts. Bigger tiers (magnitudes / growth classes)
 * arrive in later phases behind the same interface.
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};

  // ---------------------------------------------------------------- matchups
  MBF.canFight = function (att, def) {
    if (!att || !def) return { ok: false, reason: 'Pick an attacker and a defender.' };
    if (att.kind === 'function' && def.kind === 'function')
      return { ok: false, reason: 'Two functions cannot fight each other.' };
    if (def.kind !== 'number') return { ok: false, reason: 'Functions can only attack numbers.' };
    return { ok: true, reason: '' };
  };

  // ---------------------------------------------------------------- big-int helpers
  // log10 of a positive BigInt, accurate to ~15 significant digits.
  function log10Big(b) {
    if (b <= 0n) return -Infinity;
    var s = b.toString();
    if (s.length <= 15) return Math.log10(Number(s));
    return (s.length - 1) + Math.log10(Number(s.slice(0, 15)) / 1e14);
  }
  MBF.log10Big = log10Big;

  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sup(n) { return String(n).replace(/[0-9-]/g, function (c) { return SUP[c]; }); }
  MBF.sup = sup;

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

  // ---------------------------------------------------------------- impact levels
  // Level comes from the size of the damage (log10), not the share of health.
  //   0: 1-9   1: 10-999   2: up to 10^15   3: up to a googol   4+: later phases
  var LEVEL_EDGES = [0, 1, 3, 15, 100];
  MBF.MAX_LEVEL = 8;
  MBF.impactOf = function (damage, ko) {
    var lg = log10Big(damage);
    var level = LEVEL_EDGES.length - 1, t = 1;
    for (var i = 0; i < LEVEL_EDGES.length - 1; i++) {
      if (lg < LEVEL_EDGES[i + 1]) {
        level = i;
        t = (lg - LEVEL_EDGES[i]) / (LEVEL_EDGES[i + 1] - LEVEL_EDGES[i]);
        break;
      }
    }
    if (ko) level += 1;
    return { level: Math.min(level, MBF.MAX_LEVEL), t: Math.max(0, Math.min(1, t)) };
  };

  // ---------------------------------------------------------------- durations
  // Human text for a duration given as log10(seconds), so astronomically long waits work.
  var YEAR = 31557600;
  var HEAT_DEATH_LOG_YEARS = 100;
  MBF.describeWait = function (log10Seconds) {
    if (!isFinite(log10Seconds)) return '';
    if (log10Seconds < 6) {
      var s = Math.max(1, Math.round(Math.pow(10, log10Seconds)));
      if (s < 60) return s + ' s';
      if (s < 3600) return Math.floor(s / 60) + ' min ' + (s % 60) + ' s';
      if (s < 86400) return Math.floor(s / 3600) + ' h ' + Math.floor((s % 3600) / 60) + ' min';
      return Math.round(s / 86400) + ' days';
    }
    var ly = log10Seconds - Math.log10(YEAR);
    if (ly < 0) return Math.round(Math.pow(10, log10Seconds) / 86400) + ' days';
    var e = Math.floor(ly), mant = Math.round(Math.pow(10, ly - e));
    if (mant >= 10) { mant = 1; e += 1; }
    var years = ly < 6 ? Math.round(Math.pow(10, ly)).toLocaleString('en-US') + ' years'
      : (mant > 1 ? mant + ' × ' : '') + '10' + sup(e) + ' years';
    if (ly >= HEAT_DEATH_LOG_YEARS) years += ' (longer than the universe lasts before heat death, about 10¹⁰⁰ years)';
    else if (ly >= 10.14) years += ' (older than the universe already is)';
    return years;
  };

  // ---------------------------------------------------------------- the fight
  MBF.createFight = function (att, def) {
    var ok = MBF.canFight(att, def);
    if (!ok.ok) throw new Error(ok.reason);
    var maxHp = BigInt(def.value);
    var f = {
      attacker: att,
      defender: def,
      maxHp: maxHp,
      hp: maxHp,
      hits: 0n,
      dealt: 0n,
      over: false
    };

    // Current damage per hit. Numbers never grow.
    f.damage = function () { return BigInt(att.value); };

    f.hit = function () {
      if (f.over) return null;
      var dmg = f.damage();
      var before = f.hp;
      var after = before - dmg;
      var ko = after <= 0n;
      f.hp = ko ? 0n : after;
      f.hits += 1n;
      f.dealt += dmg;
      if (ko) f.over = true;
      var imp = MBF.impactOf(dmg, ko);
      return {
        damage: dmg, hpBefore: before, hpAfter: f.hp, ko: ko,
        overkill: ko ? dmg - before : 0n,
        level: imp.level, t: imp.t
      };
    };

    f.hitsToKo = function () {
      if (f.over) return 0n;
      var d = f.damage();
      return (f.hp + d - 1n) / d;
    };

    // Health left as a fraction 0..1 (for bars and cracks).
    f.hpFraction = function () {
      if (f.hp <= 0n) return 0;
      if (f.hp >= f.maxHp) return 1;
      var lg = log10Big(f.maxHp);
      if (lg < 15) return Number(f.hp) / Number(f.maxHp);
      return Number((f.hp * 1000000n) / f.maxHp) / 1e6;
    };

    // Wait text for the remaining hits at `hitsPerSecond`.
    f.waitText = function (hitsPerSecond) {
      if (!(hitsPerSecond > 0) || f.over) return '';
      return MBF.describeWait(log10Big(f.hitsToKo()) - Math.log10(hitsPerSecond));
    };

    return f;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
