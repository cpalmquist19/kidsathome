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
      fact: 'Ten hundreds. This ball is tiled with 1,000 tiles.' }
  ];

  MBF.ballById = function (id) {
    for (var i = 0; i < MBF.roster.length; i++) if (MBF.roster[i].id === id) return MBF.roster[i];
    return null;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
