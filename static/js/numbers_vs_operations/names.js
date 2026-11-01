/*
 * Conway-Wechsler "-illion" names for Numbers VS. Operations.
 *
 *   NVO.illionName(n)   -> name of 10^(3n+3), any whole n >= 1 (BigInt, number or string)
 *   NVO.illionExponent(n) -> BigInt 3n+3
 *
 * Mirrors scripts/nvo_names.py (scripts/check_nvo_names.py cross-checks them).
 */
(function (root) {
  'use strict';
  var SPECIAL = ['million', 'billion', 'trillion', 'quadrillion', 'quintillion',
    'sextillion', 'septillion', 'octillion', 'nonillion'];
  var UNITS = [null, 'un', 'duo', 'tre', 'quattuor', 'quin', 'se', 'septe', 'octo', 'nove'];
  var TENS = [null, ['deci', 'N'], ['viginti', 'MS'], ['triginta', 'NS'],
    ['quadraginta', 'NS'], ['quinquaginta', 'NS'], ['sexaginta', 'N'],
    ['septuaginta', 'N'], ['octoginta', 'MX'], ['nonaginta', '']];
  var HUNDREDS = [null, ['centi', 'NX'], ['ducenti', 'N'], ['trecenti', 'NS'],
    ['quadringenti', 'NS'], ['quingenti', 'NS'], ['sescenti', 'N'],
    ['septingenti', 'N'], ['octingenti', 'MX'], ['nongenti', '']];
  // n -> [dictionary spelling, strict Conway-Wechsler spelling]
  var DICTIONARY = { 16: ['sexdecillion', 'sedecillion'], 19: ['novemdecillion', 'novendecillion'] };

  function groupName(g) {
    if (g <= 9) return SPECIAL[g - 1];
    var u = g % 10, t = Math.floor(g / 10) % 10, h = Math.floor(g / 100);
    var comps = [];
    if (u) comps.push([UNITS[u], '']);
    if (t) comps.push(TENS[t].slice());
    if (h) comps.push(HUNDREDS[h].slice());
    if (u) {
      var marks = comps[1][1], base = comps[0][0];
      if (base === 'tre' && (marks.indexOf('S') >= 0 || marks.indexOf('X') >= 0)) {
        comps[0][0] = 'tres';
      } else if (base === 'se') {
        if (marks.indexOf('S') >= 0) comps[0][0] = 'ses';
        else if (marks.indexOf('X') >= 0) comps[0][0] = 'sex';
      } else if (base === 'septe' || base === 'nove') {
        if (marks.indexOf('M') >= 0) comps[0][0] = base + 'm';
        else if (marks.indexOf('N') >= 0) comps[0][0] = base + 'n';
      }
    }
    var text = comps.map(function (c) { return c[0]; }).join('');
    return text.slice(0, -1) + 'illion';
  }

  function illionName(n, opts) {
    var dictionary = !opts || opts.dictionary !== false;
    var big = BigInt(n);
    if (big < 1n) throw new RangeError('n must be >= 1');
    if (big < 1000n) {
      var k = Number(big);
      if (dictionary && DICTIONARY[k]) return DICTIONARY[k][0];
      return groupName(k);
    }
    var digits = big.toString();
    var first = digits.length % 3 || 3;
    var groups = [parseInt(digits.slice(0, first), 10)];
    for (var i = first; i < digits.length; i += 3) groups.push(parseInt(digits.slice(i, i + 3), 10));
    var out = '';
    for (var j = 0; j < groups.length; j++) {
      var last = j === groups.length - 1;
      var name = groups[j] === 0 ? 'nillion' : groupName(groups[j]);
      out += last ? name : name.slice(0, -2);
    }
    return out;
  }

  function illionExponent(n) { return 3n * BigInt(n) + 3n; }

  var api = { illionName: illionName, illionExponent: illionExponent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NVO = Object.assign(root.NVO || {}, api);
})(typeof window !== 'undefined' ? window : globalThis);
