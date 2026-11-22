/*
 * Math Ball Fighting - the roster of balls.
 *
 * Each ball:
 *   id       stable key (used in URLs and saved picks)
 *   kind     'number' (can attack or defend) | 'function' (attack only; added in a later phase)
 *   name     display name
 *   value    exact value as a string (parsed to BigInt by fight.js)
 *   label    text drawn on the ball
 *   labelAt  'center' (big numeral) | 'banner' (ribbon at the bottom, for emblem textures)
 *   texture  surface shader id (see shaders.js)
 *   aura     glow / rim / debris colour [r, g, b] 0..1
 *   ink      label colour, outline colour
 *   fact     one line shown in the picker
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};

  MBF.roster = [
    { id: 'n1', kind: 'number', name: 'One', value: '1', label: '1', labelAt: 'center',
      texture: 'pearl', aura: [1.0, 0.92, 0.78], ink: ['#fff7e8', '#6b4f2a'],
      fact: 'Where every count begins.' },
    { id: 'n2', kind: 'number', name: 'Two', value: '2', label: '2', labelAt: 'center',
      texture: 'binary', aura: [0.45, 0.85, 1.0], ink: ['#eaf9ff', '#0b2a66'],
      fact: 'The smallest prime, and the base of binary: 0 and 1.' },
    { id: 'n3', kind: 'number', name: 'Three', value: '3', label: '3', labelAt: 'center',
      texture: 'trinity', aura: [1.0, 0.55, 0.75], ink: ['#fff1f8', '#5a1038'],
      fact: 'Three points make the simplest shape: a triangle.' },
    { id: 'n5', kind: 'number', name: 'Five', value: '5', label: '5', labelAt: 'center',
      texture: 'petal', aura: [0.35, 1.0, 0.65], ink: ['#effff6', '#0a3d27'],
      fact: 'Most flowers with five petals hide a golden ratio.' },
    { id: 'n7', kind: 'number', name: 'Seven', value: '7', label: '7', labelAt: 'center',
      texture: 'rainbow', aura: [0.85, 0.6, 1.0], ink: ['#ffffff', '#2a1150'],
      fact: 'Seven colours in the rainbow, seven days in a week.' },
    { id: 'n10', kind: 'number', name: 'Ten', value: '10', label: '10', labelAt: 'center',
      texture: 'dial', aura: [0.4, 0.9, 1.0], ink: ['#e9fbff', '#3a2208'],
      fact: 'We count in tens because we have ten fingers.' },
    { id: 'n12', kind: 'number', name: 'Twelve', value: '12', label: '12', labelAt: 'banner',
      texture: 'clock', aura: [1.0, 0.8, 0.4], ink: ['#fff5dc', '#4a3208'],
      fact: 'A dozen. Twelve hours go around a clock.' },
    { id: 'n42', kind: 'number', name: 'Forty-Two', value: '42', label: '42', labelAt: 'center',
      texture: 'nebula', aura: [0.7, 0.4, 1.0], ink: ['#f6ecff', '#25084a'],
      fact: 'A famous joke answer to life, the universe and everything.' },
    { id: 'n100', kind: 'number', name: 'One Hundred', value: '100', label: '100', labelAt: 'banner',
      texture: 'grid100', aura: [1.0, 0.65, 0.25], ink: ['#fff3e0', '#4a2400'],
      fact: 'Ten tens: a 10 by 10 square has 100 cells.' },
    { id: 'n1000', kind: 'number', name: 'One Thousand', value: '1000', label: '1,000', labelAt: 'center',
      texture: 'mosaic', aura: [1.0, 0.82, 0.45], ink: ['#fffaf0', '#3d2a05'],
      fact: 'Ten hundreds. This ball is tiled with 1,000 tiles.' },
    { id: 'million', kind: 'number', name: 'One Million', value: '1000000', label: 'Million', labelAt: 'center',
      texture: 'sand', aura: [1.0, 0.85, 0.5], ink: ['#fff6e0', '#4a3000'],
      fact: 'A million seconds is about 11 and a half days.' },
    { id: 'billion', kind: 'number', name: 'One Billion', value: '1000000000', label: 'Billion', labelAt: 'center',
      texture: 'citylights', aura: [0.45, 0.7, 1.0], ink: ['#fff3d6', '#071a3a'],
      fact: 'A billion seconds is almost 32 years. About 8 billion people live on Earth.' },
    { id: 'googol', kind: 'number', name: 'Googol', value: '1' + '0'.repeat(100), label: 'Googol', labelAt: 'banner',
      texture: 'googol', aura: [0.3, 1.0, 0.9], ink: ['#e6fffb', '#00332c'],
      fact: '1 followed by 100 zeros. More than all the atoms in the universe.' },
    { id: 'googolplex', kind: 'number', name: 'Googolplex', log10: 1e100, label: 'Googolplex', labelAt: 'banner',
      texture: 'galaxy', aura: [0.75, 0.55, 1.0], ink: ['#f3eaff', '#1c0640'],
      fact: '1 followed by a googol zeros. There is not enough room in the universe to write it out.' },
    { id: 'skewes', kind: 'number', name: "Skewes's Number", mag: { L: 4, t: 1.5308 }, valueName: '10^10^10^34',
      label: 'Skewes', labelAt: 'banner',
      texture: 'ulam', aura: [1.0, 0.78, 0.3], ink: ['#fff3d0', '#3d2600'],
      fact: 'Came from a question about prime numbers. About 10^10^10^34: bigger than a googolplex.' },
    { id: 'googolplexplex', kind: 'number', name: 'Googolplexplex', mag: { L: 4, t: 2 }, valueName: '10^10^10^100',
      label: 'Googolplexplex', labelAt: 'banner',
      texture: 'galaxies', aura: [0.45, 0.75, 1.0], ink: ['#e6f2ff', '#061a3d'],
      fact: '1 followed by a googolplex zeros. Like a galaxy made of galaxies.' },
    { id: 'moser', kind: 'number', name: "Moser's Number", special: 'moser', label: 'Moser', labelAt: 'banner',
      texture: 'moser', aura: [1.0, 0.45, 0.3], ink: ['#fff0ea', '#4a1206'],
      fact: 'Built from shapes inside shapes: triangles, squares and circles. Too tall for any tower of tens you could write.' },
    { id: 'graham', kind: 'number', name: "Graham's Number", special: 'graham', label: "Graham's", labelAt: 'banner',
      texture: 'hypercube', aura: [0.35, 0.6, 1.0], ink: ['#e8f0ff', '#081a44'],
      fact: 'Came from coloring the corners of hypercubes. Built 64 times over, each time using the last one as its number of up-arrows.' },

    // ---- functions: attack only. Input starts at 1 and goes up by one every hit.
    { id: 'f_succ', kind: 'function', fn: 'succ', name: 'Plus One', formula: 'n+1', labelAt: 'center',
      texture: 'fnring', aura: [0.4, 1.0, 0.5], ink: ['#eaffef', '#06351a'],
      fact: 'Adds one: 2, 3, 4, 5... Slow and steady.' },
    { id: 'f_double', kind: 'function', fn: 'double', name: 'Doubler', formula: '2n', labelAt: 'center',
      texture: 'fnring', aura: [0.35, 0.8, 1.0], ink: ['#e8f7ff', '#062a45'],
      fact: 'Two times the input: 2, 4, 6, 8...' },
    { id: 'f_square', kind: 'function', fn: 'square', name: 'Squarer', formula: 'n²', labelAt: 'center',
      texture: 'fnring', aura: [1.0, 0.75, 0.3], ink: ['#fff4e0', '#3d2400'],
      fact: 'The input times itself: 1, 4, 9, 16, 25...' },
    { id: 'f_fact', kind: 'function', fn: 'fact', name: 'Factorial', formula: 'n!', labelAt: 'center',
      texture: 'fnring', aura: [1.0, 0.4, 0.6], ink: ['#ffeef4', '#40081e'],
      fact: 'Multiply every number up to n: 1, 2, 6, 24, 120... It explodes fast.' },
    { id: 'f_pow10', kind: 'function', fn: 'pow10', name: 'Power of Ten', formula: '10ⁿ', labelAt: 'center',
      texture: 'fnring', aura: [0.8, 0.5, 1.0], ink: ['#f6eeff', '#24083f'],
      fact: 'A 1 with n zeros: 10, 100, 1,000... Adds a zero every hit.' },
    { id: 'f_ack', kind: 'function', fn: 'ack', name: 'Ackermann', formula: 'A(n,n)', labelAt: 'center',
      texture: 'fnring', aura: [1.0, 0.55, 0.2], ink: ['#fff1e0', '#3d1800'],
      fact: 'A(1,1) = 3, A(2,2) = 7, A(3,3) = 61... and A(4,4) already has more than 10^19727 digits.' },
    { id: 'f_graham', kind: 'function', fn: 'graham', name: 'Graham Sequence', formula: 'G(n)', labelAt: 'center',
      texture: 'hypercube', aura: [0.4, 0.85, 1.0], ink: ['#e8f8ff', '#062a44'],
      fact: "G(1) = 3↑↑↑↑3. Each next one uses the last as its number of arrows. G(64) is Graham's number." }
  ];

  // what a function ball shows for input n
  MBF.fnLabel = function (ball, n) {
    var s = String(n);
    switch (ball.fn) {
      case 'succ': return s + '+1';
      case 'double': return '2×' + s;
      case 'square': return s + '²';
      case 'fact': return s + '!';
      case 'pow10': return '10' + s.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; });
      case 'ack': return 'A(' + s + ',' + s + ')';
      case 'graham': return 'G(' + s + ')';
    }
    return ball.formula;
  };
  MBF.roster.forEach(function (b) { if (b.kind === 'function') b.label = b.formula; });

  MBF.ballById = function (id) {
    for (var i = 0; i < MBF.roster.length; i++) if (MBF.roster[i].id === id) return MBF.roster[i];
    return null;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
