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
    { id: 'bb6', kind: 'number', name: 'BB(6)', special: 'bb6', label: 'BB(6)', labelAt: 'banner', glitch: 0.3,
      texture: 'tape', aura: [1.0, 0.8, 0.3], ink: ['#fff4dc', '#3d2400'],
      fact: 'Busy Beaver 6: the most steps a computer with only 6 states can run and still stop. Nobody knows it exactly, ' +
        'but in 2025 it was proven to be more than 2↑↑↑5 - a tower of 2s so tall that its height is itself a tower of 2s. ' +
        "Bigger than googolplexplex, smaller than Moser's number." },
    { id: 'moser', kind: 'number', name: "Moser's Number", special: 'moser', label: 'Moser', labelAt: 'banner',
      texture: 'moser', aura: [1.0, 0.45, 0.3], ink: ['#fff0ea', '#4a1206'],
      fact: 'Built from shapes inside shapes: triangles, squares and circles. Too tall for any tower of tens you could write.' },
    { id: 'graham', kind: 'number', name: "Graham's Number", special: 'graham', label: "Graham's", labelAt: 'banner',
      texture: 'hypercube', aura: [0.35, 0.6, 1.0], ink: ['#e8f0ff', '#081a44'],
      fact: 'Came from coloring the corners of hypercubes. Built 64 times over, each time using the last one as its number of up-arrows.' },
    { id: 'tree3', kind: 'number', name: 'TREE(3)', special: 'tree3', label: 'TREE(3)', labelAt: 'banner', k: 3,
      texture: 'tree', aura: [0.65, 0.45, 1.0], ink: ['#f3ecff', '#1c0a40'],
      fact: 'A game of growing trees with 3 colors of seeds. The game has to end... after TREE(3) moves. Graham\'s number is nothing next to it.' },
    { id: 'sscg3', kind: 'number', name: 'SSCG(3)', special: 'sscg3', label: 'SSCG(3)', labelAt: 'banner',
      texture: 'graph', aura: [0.55, 1.0, 0.35], ink: ['#efffe6', '#0d3300'],
      fact: 'From simple networks where every dot has at most 3 lines. Far bigger than TREE(3), and even than TREE applied TREE(3) times.' },
    { id: 'scg13', kind: 'number', name: 'SCG(13)', special: 'scg13', label: 'SCG(13)', labelAt: 'banner',
      texture: 'graph', aura: [0.3, 1.0, 0.7], ink: ['#e6fff3', '#03331f'],
      fact: 'Like TREE, but with networks where every dot has at most 3 lines. Even bigger than TREE(3).' },
    { id: 'loader', kind: 'number', name: "Loader's Number", special: 'loader', label: 'Loader', labelAt: 'banner',
      texture: 'lambda', aura: [1.0, 0.75, 0.25], ink: ['#fff6e0', '#3d2600'],
      fact: 'The output of a tiny computer program (about 500 characters). One of the biggest numbers a computer could ever compute.' },
    { id: 'rayo', kind: 'number', name: "Rayo's Number", special: 'rayo', label: 'RAYO', labelAt: 'banner', glitch: 1,
      texture: 'rayo', aura: [1.0, 0.2, 0.15], ink: ['#ffe8e0', '#3a0000'],
      fact: 'Bigger than any number you can describe with a googol symbols of math logic. No computer can ever compute it.' },
    { id: 'gotch', kind: 'number', name: 'Gotchrognathicus', special: 'gotch', label: 'Gotchrognathicus', labelAt: 'banner', glitch: 1,
      texture: 'gotch', aura: [0.95, 0.15, 0.4], ink: ['#ffe6ee', '#30000f'],
      fact: "Rayo's number to the power of Rayo's number, then times Rayo's number again. Bigger than Rayo's number, but Rayo(n) passes it with just a few more symbols. Rayo's number would need Rayo's number ^ Rayo's number hits to take it down." },
    { id: 'fish7', kind: 'number', name: 'Fish Number 7', special: 'fish7', label: 'Fish 7', labelAt: 'banner', glitch: 1, k: 63,
      texture: 'fish', aura: [0.3, 0.85, 1.0], ink: ['#e6faff', '#002a3d'],
      fact: "Made by the googologist Fish in 2013: a souped-up Rayo function applied 63 times to a googol. It should beat Rayo's number, but nobody has proven how they compare." },
    { id: 'bigfoot', kind: 'number', name: 'BIG FOOT', special: 'bigfoot', label: 'BIG FOOT', labelAt: 'banner', glitch: 1,
      texture: 'bigfoot', aura: [0.9, 0.6, 0.3], ink: ['#fff0e0', '#2e1500'],
      fact: "Like Rayo's number, but using an even stronger math language. Bigger than Rayo's number." },
    { id: 'lngn', kind: 'number', name: 'Large Number Garden Number', special: 'lngn', label: 'Garden Number', labelAt: 'banner',
      glitch: 1, k: 10, texture: 'garden', aura: [0.55, 1.0, 0.6], ink: ['#f0fff0', '#063300'],
      fact: 'Coined by Googology Wiki user P-adic-daisuki-bot: a function built from set theory, applied 10 times to 10↑¹⁰10. Called the largest well-defined googologism that is not a "salad number".' },
    { id: 'oblivion', kind: 'number', name: 'Oblivion', special: 'oblivion', label: 'Oblivion', labelAt: 'banner', glitch: 1,
      texture: 'void', aura: [0.6, 0.5, 1.0], ink: ['#efeaff', '#0a0020'],
      fact: 'Named by Jonathan Bowers: the biggest number any math system that fits in a googolplex symbols can make. Mathematicians argue it is not really defined.' },
    { id: 'utter', kind: 'number', name: 'Utter Oblivion', special: 'utter', label: 'Utter Oblivion', labelAt: 'banner', glitch: 1,
      texture: 'endless', aura: [0.8, 0.75, 1.0], ink: ['#ffffff', '#000000'],
      fact: 'Oblivion, but for systems of systems of systems... It sits at the very top of the famous lists, and is even less defined than Oblivion.' },

    { id: 'infinity', kind: 'number', name: 'Infinity', special: 'infinity', label: '∞', labelAt: 'banner', glitch: 0.4,
      texture: 'infinity', aura: [1.0, 1.0, 0.85], ink: ['#ffffff', '#2a1a00'],
      fact: 'Not a number you can reach by counting. No amount of hits from a real number can ever take it down.' },

    { id: 'numbers', kind: 'number', name: 'Numbers', special: 'numbers', label: 'Numbers', labelAt: 'banner', glitch: 0.5,
      texture: 'numbers', aura: [1.0, 0.95, 0.7], ink: ['#ffffff', '#1a1030'], fact: '' },
    { id: 'hagi', kind: 'number', name: 'Heavenly Angel God Infinity', special: 'hagi', label: 'Heavenly Angel God Infinity',
      labelAt: 'banner', glitch: 0.3, texture: 'hagi', aura: [1.0, 0.9, 0.55], ink: ['#fffdf0', '#4a3500'],
      fact: 'Built from Numbers. Start with a tower of Numbers that is Numbers tall, and build that tower again Numbers times. ' +
        'Add Numbers multiplied together Numbers times, raised to the power of Numbers Numbers times. ' +
        'Then do the same again with tetration (↑↑), pentation (↑↑↑) and hexation (↑↑↑↑). ' +
        'It beats Numbers and every other ball in the game.' },

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
      fact: "G(1) = 3↑↑↑↑3. Each next one uses the last as its number of arrows. G(64) is Graham's number." },
    { id: 'f_tree', kind: 'function', fn: 'tree', name: 'TREE', formula: 'TREE(n)', labelAt: 'banner', k: 1,
      texture: 'tree', aura: [0.55, 0.9, 1.0], ink: ['#eafcff', '#062a3d'],
      fact: 'TREE(1) = 1, TREE(2) = 3... then TREE(3) explodes past Graham\'s number. Each hit adds a seed color.' },
    { id: 'f_bb', kind: 'function', fn: 'bb', name: 'Busy Beaver', formula: 'BB(n)', labelAt: 'banner', glitch: 0.6,
      texture: 'tape', aura: [1.0, 0.35, 0.55], ink: ['#ffe8f0', '#3d0018'],
      fact: 'The longest an n-state computer can run and still stop. Only BB(1) to BB(5) are known (BB(5) = 47,176,870). After that the game has to guess.' },
    { id: 'f_sscg', kind: 'function', fn: 'sscg', name: 'SSCG', formula: 'SSCG(n)', labelAt: 'banner',
      texture: 'graph', aura: [0.5, 1.0, 0.4], ink: ['#efffe6', '#0d3300'],
      fact: 'Simple subcubic graphs: SSCG(1) = 5, SSCG(2) has about 10^(3.6 × 10^28) digits... and SSCG(3) is far bigger than TREE(3).' },
    { id: 'f_scg', kind: 'function', fn: 'scg', name: 'SCG', formula: 'SCG(n)', labelAt: 'banner',
      texture: 'graph', aura: [0.25, 0.95, 0.85], ink: ['#e6fff8', '#003326'],
      fact: 'Like SSCG but loops are allowed, so it is at least as big. Its exact size is unknown: the game guesses SCG(n) is about SSCG(2n+1).' },
    { id: 'f_tet', kind: 'function', fn: 'tet', name: 'Tetration', formula: '10↑↑n', labelAt: 'center',
      texture: 'fnring', aura: [0.4, 0.7, 1.0], ink: ['#e8f2ff', '#061a3d'],
      fact: "A tower of n tens: 10, 10^10, 10^10^10... Googolplex and Skewes's number are towers like this." },
    { id: 'f_arrows', kind: 'function', fn: 'arrows', name: 'Up-Arrows', formula: '3↑ⁿ3', labelAt: 'center',
      texture: 'hypercube', aura: [0.5, 0.65, 1.0], ink: ['#eef2ff', '#0c1440'],
      fact: "Knuth's up-arrows: 3↑3 = 27, 3↑↑3 = 7,625,597,484,987, then 3↑↑↑3 is a tower of 3s that tall. 3↑↑↑↑3 starts Graham's number." },
    { id: 'f_circle', kind: 'function', fn: 'circle', name: 'Steinhaus-Moser', formula: 'Circle(n)', labelAt: 'banner',
      texture: 'moser', aura: [1.0, 0.55, 0.35], ink: ['#fff2ea', '#4a1206'],
      fact: "n in a circle: n inside n squares, each one n inside n triangles (n^n). Circle(2) is called mega, about 10↑↑257. Moser's number uses a mega-sided shape." },
    { id: 'f_loader', kind: 'function', fn: 'loaderD', name: "Loader's D", formula: 'Dⁿ(99)', labelAt: 'banner',
      texture: 'lambda', aura: [1.0, 0.8, 0.3], ink: ['#fff6e0', '#3d2600'],
      fact: "Run Loader's D program n times starting from 99. D⁵(99) is Loader's number. Nobody knows how big the steps before it are." },
    { id: 'f_rayo', kind: 'function', fn: 'rayo', name: 'Rayo', formula: 'Rayo(n)', labelAt: 'banner', glitch: 0.7,
      texture: 'rayo', aura: [1.0, 0.3, 0.2], ink: ['#ffe8e0', '#3a0000'],
      fact: "Bigger than anything n symbols of math logic can describe. Tiny until n is in the thousands; nobody knows its values, so the game guesses. Rayo's number is Rayo(10^100)." },
    { id: 'f_foot', kind: 'function', fn: 'foot', name: 'FOOT', formula: 'FOOT(n)', labelAt: 'banner', glitch: 0.7,
      texture: 'bigfoot', aura: [0.95, 0.65, 0.35], ink: ['#fff0e0', '#2e1500'],
      fact: 'Like Rayo(n) but in a stronger math language. Its values are unknown, so the game guesses. BIG FOOT applies FOOT ten times to a googol.' },
    { id: 'f_fish7', kind: 'function', fn: 'fish7', name: 'Fish F₇', formula: 'F₇ⁿ(10¹⁰⁰)', labelAt: 'banner', glitch: 0.7, k: 1,
      texture: 'fish', aura: [0.35, 0.9, 1.0], ink: ['#e6faff', '#002a3d'],
      fact: "Fish's F₇ applied n times to a googol, one more fish every hit. At n = 63 it is Fish number 7." },
    { id: 'f_garden', kind: 'function', fn: 'garden', name: 'Garden f', formula: 'fⁿ(10↑¹⁰10)', labelAt: 'banner', glitch: 0.7, k: 1,
      texture: 'garden', aura: [0.6, 1.0, 0.55], ink: ['#f0fff0', '#063300'],
      fact: 'The Large Number Garden function applied n times to 10↑¹⁰10, one more flower every hit. At n = 10 it is the Large Number Garden Number. Its earlier steps are a guess.' },
    { id: 'f_rex', kind: 'function', fn: 'rex', name: 'REX', formula: 'REX(n)', labelAt: 'banner', k: 1,
      texture: 'rex', aura: [1.0, 0.75, 0.2], ink: ['#fff6dc', '#3a1a00'],
      fact: 'Climbs the operation ladder one rung every hit, through every operation that has a name (94 rungs): addition, multiplication, ' +
        'exponentiation, tetration... vigintation, trigintation, centation, chiliation, myriation (the 10,000th), then past all of them: ' +
        'megation, expansion, explosion, detonation, pentonation... megamegamegamegation, and finally gammation. ' +
        'Each rung combines the number with itself and then multiplies by 75. REX(1) = (75 + 75) × 75 = 11,250. ' +
        "It beats Moser's number on hit 25 and Graham's number on hit 26. At the top it keeps gammating." }
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
      case 'tree': return 'TREE(' + s + ')';
      case 'bb': return 'BB(' + s + ')';
      case 'sscg': return 'SSCG(' + s + ')';
      case 'tet': return '10↑↑' + s;
      case 'arrows': return n <= 4 ? '3' + '↑↑↑↑'.slice(0, n) + '3' : '3↑' + s.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; }) + '3';
      case 'circle': return 'Circle(' + s + ')';
      case 'loaderD': return 'D' + s.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; }) + '(99)';
      case 'rayo': return 'Rayo(' + s + ')';
      case 'foot': return 'FOOT(' + s + ')';
      case 'garden': return 'f' + s.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; }) + '(10↑¹⁰10)';
      case 'fish7': return 'F₇' + s.replace(/[0-9]/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]; }) + '(10¹⁰⁰)';
      case 'scg': return 'SCG(' + s + ')';
      case 'rex': return 'REX(' + s + ')';
    }
    return ball.formula;
  };
  MBF.roster.forEach(function (b) { if (b.kind === 'function') b.label = b.formula; });

  // Fictional numbers from the Fictional Googology Wiki (static/data/math_ball_fighting/fictional.json).
  // Not real maths: they all sit above Infinity, and the bigger one wins (by the wiki's size lists).
  function strHash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hsl(h, s, l) {
    var a = s * Math.min(l, 1 - l), f = function (n) {
      var k = (n + h * 12) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
  }
  MBF.shortLabel = function (name) {
    var chars = Array.from(name);
    return chars.length <= 22 ? name : chars.slice(0, 20).join('') + '…';
  };
  // Rows are [name, page id, size score, placed by], smallest first. The size score comes from
  // the wiki's own "larger / smaller / equal numbers" lists (scripts/build_mbf_fictional.py).
  var PLACED = [
    'Its size comes from the wiki\'s lists of bigger and smaller numbers.',
    'The wiki doesn\'t compare it with other numbers, so it is placed by its wiki class.',
    'The wiki says nothing about its size, so it is a guess: placed in the middle.'
  ];
  MBF.fictional = [];
  MBF.fxEqual = {};
  MBF.addFictional = function (data) {
    var list = data.numbers, out = [], rank = 0;
    for (var i = 0; i < list.length; i++) {
      var name = list[i][0], h = strHash(name), score = list[i][2] || 0;
      if (i === 0 || score !== list[i - 1][2]) rank = i;          // equal scores share a rank
      var aura = hsl((h % 360) / 360, 0.75, 0.62);
      var b = {
        id: 'fx' + list[i][1], kind: 'number', fictional: true, frank: i, fscore: score,
        fsize: list.length > 1 ? rank / (list.length - 1) : 1, name: name,
        label: MBF.shortLabel(name), labelAt: 'banner', glitch: 0.35,
        texture: 'fictional', k: (h % 100000) / 100, aura: aura, ink: ['#ffffff', '#140a24'],
        fact: 'Fictional number from the Fictional Googology Wiki, size #' + (rank + 1).toLocaleString('en-US') +
          ' of ' + list.length.toLocaleString('en-US') + ' (counting up from the smallest). ' +
          (PLACED[list[i][3]] || PLACED[2]) +
          ' Not real maths: it beats Infinity. Bigger fictional numbers beat smaller ones; close ones take several hits.'
      };
      out.push(b);
      MBF.roster.push(b);
    }
    (data.equal || []).forEach(function (p) {
      MBF.fxEqual['fx' + p[0] + '|fx' + p[1]] = MBF.fxEqual['fx' + p[1] + '|fx' + p[0]] = true;
    });
    MBF.fictional = out;
    MBF.numbersFact();
    return out;
  };

  // Numbers' fact card counts every other number ball, so it is rebuilt when the fictional list loads
  MBF.numbersFact = function () {
    var count = MBF.roster.filter(function (b) { return b.kind === 'number' && b.special !== 'numbers' && b.special !== 'hagi'; }).length;
    var nb = MBF.ballById('numbers');
    var all = MBF.fictional.length ? 'all ' + count.toLocaleString('en-US') + ' of them, ' : '';
    if (nb) nb.fact = 'Take every number in the game (' + all + 'Infinity and every fictional number too) and add them up. Add on all of them multiplied together. ' +
      'Then raise it to its own power, tetrate it (↑↑), pentate it (↑↑↑) and hexate it (↑↑↑↑). ' +
      'It beats every other ball in the game, even the biggest fictional number.';
  };

  MBF.ballById = function (id) {
    for (var i = 0; i < MBF.roster.length; i++) if (MBF.roster[i].id === id) return MBF.roster[i];
    return null;
  };

  MBF.numbersFact();

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
