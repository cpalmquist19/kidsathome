/*
 * Math Ball Fighting - GLSL for balls, background and effects.
 *
 * A ball is a flat quad. The fragment shader treats the disc as the front of a
 * sphere: it builds the 3D surface direction, rotates it by uRot (so the ball
 * can roll), asks the ball's surface() for colour, then lights it.
 *
 * Every texture defines:
 *   void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss)
 *     d     unit direction on the sphere in the ball's own (rolling) frame
 *     q     flat disc position (-1..1), spun by uSpin - for emblem designs
 *     t     time in seconds
 *     alb   base colour (lit), emit = glow (unlit), gloss 0..1
 */
(function (root) {
  'use strict';
  var MBF = root.MBF = root.MBF || {};
  var S = MBF.shaders = {};

  S.QUAD = 1.45;   // quad half-size relative to the ball radius (room for the aura)

  S.vertex = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  var COMMON = [
    'precision highp float;',
    'varying vec2 vUv;',
    '#define PI 3.14159265',
    '#define TAU 6.28318531',
    'float hash3(vec3 p) {',
    '  p = fract(p * 0.3183099 + 0.1); p *= 17.0;',
    '  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));',
    '}',
    'float hash2(vec2 p) { return hash3(vec3(p, 3.7)); }',
    'float noise3(vec3 x) {',
    '  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x),',
    '                 mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),',
    '             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),',
    '                 mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);',
    '}',
    'float fbm3(vec3 p) {',
    '  float a = 0.5, s = 0.0;',
    '  for (int i = 0; i < 5; i++) { s += a * noise3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }',
    '  return s;',
    '}',
    // x: distance to nearest cell point, y: distance to the cell edge (approx), z: cell id
    'vec3 voronoi3(vec3 x) {',
    '  vec3 p = floor(x); vec3 f = fract(x);',
    '  float d1 = 8.0, d2 = 8.0, id = 0.0;',
    '  for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {',
    '    vec3 b = vec3(float(i), float(j), float(k));',
    '    vec3 o = vec3(hash3(p + b), hash3(p + b + 13.1), hash3(p + b + 27.7));',
    '    vec3 r = b + o - f; float d = dot(r, r);',
    '    if (d < d1) { d2 = d1; d1 = d; id = hash3(p + b + 5.3); } else if (d < d2) { d2 = d; }',
    '  }',
    '  return vec3(sqrt(d1), sqrt(d2) - sqrt(d1), id);',
    '}',
    'vec3 hsv2rgb(vec3 c) {',
    '  vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);',
    '  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);',
    '}',
    'mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }',
    'float latOf(vec3 d) { return asin(clamp(d.y, -1.0, 1.0)); }',
    'float lonOf(vec3 d) { return atan(d.z, d.x); }',
    ''
  ].join('\n');
  S.COMMON = COMMON;

  // ------------------------------------------------------------------ surfaces
  var SURF = S.surfaces = {};

  // 1 - iridescent pearl with a soft inner light
  SURF.pearl = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float n = fbm3(d * 2.2 + vec3(0.0, t * 0.05, 0.0));',
    '  vec3 iri = hsv2rgb(vec3(fract(n * 1.4 + d.y * 0.25 + t * 0.02), 0.32, 1.0));',
    '  alb = mix(vec3(0.96, 0.94, 0.9), iri, 0.45);',
    '  float core = max(1.0 - length(q), 0.0);',
    '  emit = vec3(1.0, 0.93, 0.8) * (0.14 + 0.07 * sin(t * 2.0)) * core * core;',
    '  gloss = 0.95;',
    '}'
  ].join('\n');

  // 2 - binary marble: two halves, a glowing seam, flickering bits
  SURF.binary = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float s = d.x + 0.25 * sin(d.y * 5.0 + t * 0.8) + 0.1 * sin(d.z * 7.0 - t);',
    '  vec3 A = vec3(0.04, 0.09, 0.32), B = vec3(0.55, 0.88, 1.0);',
    '  alb = s < 0.0 ? A : B;',
    '  vec2 g = vec2((lonOf(d) / TAU + 0.5) * 24.0, (latOf(d) / PI + 0.5) * 12.0);',
    '  vec2 c = floor(g); vec2 f = fract(g) - 0.5;',
    '  float bit = step(0.5, hash3(vec3(c, floor(t * 2.0))));',
    '  float dt = smoothstep(0.28, 0.16, length(f));',
    '  if (s < 0.0) emit += vec3(0.25, 0.6, 1.0) * bit * dt * 0.9;',
    '  else alb -= vec3(0.3, 0.18, 0.0) * bit * dt;',
    '  emit += vec3(0.55, 0.92, 1.0) * smoothstep(0.08, 0.0, abs(s)) * 1.6;',
    '  gloss = 0.75;',
    '}'
  ].join('\n');

  // 3 - three-colour swirl with bright edges
  SURF.trinity = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float a = atan(d.y, d.x) / TAU + 0.5;',
    '  float w = a * 3.0 + d.z * 1.3 + 0.25 * fbm3(d * 3.0) + t * 0.08;',
    '  float id = mod(floor(w), 3.0);',
    '  vec3 c0 = vec3(0.95, 0.2, 0.55), c1 = vec3(1.0, 0.78, 0.2), c2 = vec3(0.15, 0.85, 0.8);',
    '  alb = id < 0.5 ? c0 : (id < 1.5 ? c1 : c2);',
    '  float e = abs(fract(w) - 0.5);',
    '  emit = vec3(1.0, 0.95, 0.85) * smoothstep(0.43, 0.5, e) * 1.3 + alb * 0.12;',
    '  gloss = 0.6;',
    '}'
  ].join('\n');

  // 5 - emerald five-fold facets with gold veins
  SURF.petal = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float a = atan(d.y, d.x) + t * 0.15;',
    '  float pet = cos(5.0 * a) * 0.5 + 0.5;',
    '  float cap = abs(d.z);',
    '  alb = mix(vec3(0.02, 0.28, 0.18), vec3(0.12, 0.85, 0.52), pet * (0.4 + 0.6 * cap));',
    '  float vein = smoothstep(0.05, 0.0, abs(fract(5.0 * a / TAU + 0.5) - 0.5) * (0.4 + cap));',
    '  float ring = smoothstep(0.03, 0.0, abs(cap - 0.55 - 0.08 * pet));',
    '  vec3 gold = vec3(1.0, 0.8, 0.3);',
    '  alb = mix(alb, gold, max(vein, ring) * 0.8);',
    '  emit = gold * max(vein, ring) * 0.5 + vec3(0.1, 0.6, 0.35) * pet * 0.15;',
    '  gloss = 0.8;',
    '}'
  ].join('\n');

  // 7 - seven rainbow bands, candy gloss
  SURF.rainbow = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float u = (latOf(d) / PI + 0.5) * 7.0 + 0.18 * sin(lonOf(d) * 2.0 + t * 0.7);',
    '  float i = clamp(floor(u), 0.0, 6.0); float f = fract(u);',
    '  vec3 c = hsv2rgb(vec3(i / 7.0 * 0.82, 0.85, 1.0));',
    '  float stripe = smoothstep(0.07, 0.0, min(f, 1.0 - f));',
    '  alb = mix(c, vec3(1.0), stripe * 0.7);',
    '  emit = c * 0.18;',
    '  gloss = 0.92;',
    '}'
  ].join('\n');

  // 10 - bronze dial with 10 notches that light up in turn
  SURF.dial = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q); float a = atan(q.y, q.x);',
    '  vec3 bronze = vec3(0.58, 0.38, 0.17);',
    '  alb = bronze * (0.78 + 0.22 * sin(r * 60.0));',
    '  float seg = a / TAU * 10.0;',
    '  float si = floor(seg + 0.5);',
    '  float nf = abs(fract(seg + 0.5) - 0.5);',
    '  float ring = step(0.7, r) * step(r, 0.95);',
    '  float notch = ring * smoothstep(0.14, 0.07, nf) * step(0.74, r) * step(r, 0.91);',
    '  float head = mod(floor(t * 4.0), 10.0);',
    '  float age = mod(head - mod(si + 20.0, 10.0) + 10.0, 10.0);',
    '  float lit = 0.25 + 1.6 * exp(-age * 0.7);',
    '  alb = mix(alb, vec3(0.1, 0.08, 0.07), ring * 0.65);',
    '  emit = vec3(0.3, 0.9, 1.0) * notch * lit;',
    '  emit += vec3(0.3, 0.9, 1.0) * smoothstep(0.02, 0.0, abs(r - 0.68)) * 0.5;',
    '  gloss = 0.65;',
    '}'
  ].join('\n');

  // 12 - clock face: 12 ticks, moving hands, brass rim
  SURF.clock = [
    'float hand(vec2 q, float ang, float len, float w) {',
    '  vec2 v = vec2(sin(ang), cos(ang));',
    '  float along = dot(q, v); float across = abs(dot(q, vec2(v.y, -v.x)));',
    '  return step(-0.08, along) * step(along, len) * smoothstep(w, w * 0.4, across);',
    '}',
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q); float a = atan(q.x, q.y);',
    '  alb = vec3(0.94, 0.89, 0.77) * (0.92 + 0.08 * sin(r * 30.0));',
    '  alb = mix(alb, vec3(0.75, 0.56, 0.22), smoothstep(0.84, 0.88, r));',
    '  float seg = a / TAU * 12.0; float nf = abs(fract(seg + 0.5) - 0.5);',
    '  float tick = step(0.66, r) * step(r, 0.8) * smoothstep(0.07, 0.03, nf);',
    '  alb = mix(alb, vec3(0.12, 0.09, 0.06), tick);',
    '  float h = hand(q, t * 0.5, 0.42, 0.05) + hand(q, t * 6.0, 0.62, 0.032);',
    '  alb = mix(alb, vec3(0.1, 0.07, 0.04), clamp(h, 0.0, 1.0));',
    '  float sec = hand(q, t * 30.0, 0.66, 0.014);',
    '  emit = vec3(1.0, 0.35, 0.2) * sec * 1.2 + vec3(1.0, 0.7, 0.3) * smoothstep(0.06, 0.03, r);',
    '  gloss = 0.7;',
    '}'
  ].join('\n');

  // 42 - nebula orb with twinkling stars
  SURF.nebula = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec3 p = d * 1.8;',
    '  float n1 = fbm3(p + vec3(t * 0.04, 0.0, 0.0));',
    '  float n2 = fbm3(p * 2.0 + n1 * 2.5 - t * 0.03);',
    '  vec3 c = mix(vec3(0.08, 0.02, 0.25), vec3(0.62, 0.12, 0.72), n2);',
    '  c = mix(c, vec3(0.1, 0.72, 0.92), smoothstep(0.55, 0.8, n1) * 0.7);',
    '  vec3 sp = d * 40.0; vec3 cell = floor(sp); float h = hash3(cell);',
    '  float star = step(0.92, h) * smoothstep(0.22, 0.0, length(fract(sp) - 0.5)) * (0.6 + 0.4 * sin(t * 3.0 + h * 50.0));',
    '  float core = max(1.0 - length(q), 0.0);',
    '  alb = c * 0.5;',
    '  emit = c * 0.65 + vec3(star) * 1.6 + vec3(1.0, 0.8, 1.0) * core * core * core * 0.6;',
    '  gloss = 0.45;',
    '}'
  ].join('\n');

  // 100 - a 10 x 10 grid of lamps under glass
  SURF.grid100 = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  alb = vec3(0.05, 0.06, 0.09);',
    '  vec2 g = q / 0.7 * 5.0; vec2 c = floor(g); vec2 f = fract(g) - 0.5;',
    '  float inside = step(abs(g.x), 5.0) * step(abs(g.y), 5.0);',
    '  float h = hash2(c);',
    '  float on = 0.3 + 0.7 * smoothstep(0.2, 1.0, sin(t * (1.0 + h * 2.0) + h * 20.0) * 0.5 + 0.5);',
    '  float sq = smoothstep(0.38, 0.3, max(abs(f.x), abs(f.y)));',
    '  vec3 lamp = mix(vec3(1.0, 0.5, 0.12), vec3(1.0, 0.85, 0.4), h);',
    '  emit = lamp * sq * inside * on * 1.4;',
    '  alb += lamp * sq * inside * 0.12;',
    '  gloss = 1.0;',
    '}'
  ].join('\n');

  // 1,000 - 40 x 25 = 1,000 gold and silver tiles
  SURF.mosaic = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 g = vec2((lonOf(d) / TAU + 0.5) * 40.0, (latOf(d) / PI + 0.5) * 25.0);',
    '  vec2 c = floor(g); vec2 f = fract(g);',
    '  float h = hash3(vec3(c, 7.0));',
    '  float gap = smoothstep(0.0, 0.1, f.x) * smoothstep(1.0, 0.9, f.x) * smoothstep(0.0, 0.1, f.y) * smoothstep(1.0, 0.9, f.y);',
    '  vec3 tile = mix(vec3(1.0, 0.74, 0.25), vec3(0.85, 0.88, 0.95), step(0.62, h)) * (0.6 + 0.4 * h);',
    '  alb = mix(vec3(0.05), tile, gap);',
    '  float shimmer = pow(max(sin(t * 1.5 + h * 30.0 + c.x * 0.3), 0.0), 12.0);',
    '  emit = tile * gap * shimmer * 0.9;',
    '  gloss = 0.85;',
    '}'
  ].join('\n');

  // Million - a ball of sand: about a million grains, with glints
  SURF.sand = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float g = fbm3(d * 4.0);',
    '  float grain = hash3(floor(d * 70.0));',
    '  alb = mix(vec3(0.72, 0.55, 0.3), vec3(0.96, 0.83, 0.56), g) * (0.82 + 0.3 * grain);',
    '  alb *= 0.9 + 0.1 * sin((d.y + 0.35 * fbm3(d * 2.0)) * 34.0);',
    '  vec3 cell = floor(d * 110.0);',
    '  float glint = step(0.985, hash3(cell + floor(t * 2.0 + hash3(cell) * 7.0)));',
    '  emit = vec3(1.0, 0.96, 0.85) * glint * 2.2;',
    '  gloss = 0.3;',
    '}'
  ].join('\n');

  // Billion - a night-side planet glittering with city lights (about 8 billion people)
  SURF.citylights = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float land = smoothstep(0.47, 0.53, fbm3(d * 2.4 + 3.0));',
    '  alb = mix(vec3(0.01, 0.03, 0.09), vec3(0.05, 0.05, 0.04), land);',
    '  float cl = smoothstep(0.5, 0.75, fbm3(d * 9.0));',
    '  float pts = step(0.72, hash3(floor(d * 140.0)));',
    '  float tw = 0.75 + 0.25 * sin(t * 4.0 + hash3(floor(d * 140.0)) * 40.0);',
    '  emit = vec3(1.0, 0.72, 0.32) * land * (cl * 0.5 + pts * cl * 1.8) * tw;',
    '  float clouds = smoothstep(0.55, 0.8, fbm3(d * 3.0 + vec3(t * 0.02, 0.0, 0.0)));',
    '  alb = mix(alb, vec3(0.12, 0.14, 0.2), clouds * 0.6);',
    '  emit *= 1.0 - clouds * 0.7;',
    '  gloss = mix(0.75, 0.2, land);',
    '}'
  ].join('\n');

  // Googol - a 1 surrounded by exactly 100 glowing zeros in a sunflower spiral
  SURF.googol = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  alb = vec3(0.01, 0.06, 0.07) + vec3(0.0, 0.1, 0.12) * fbm3(d * 3.0);',
    '  vec2 qq = rot2(t * 0.12) * q;',
    '  float glow = 0.0;',
    '  for (int i = 0; i < 100; i++) {',
    '    float fi = float(i);',
    '    float rr = 0.17 + 0.72 * sqrt((fi + 0.5) / 100.0);',
    '    float th = fi * 2.39996;',
    '    vec2 dd = qq - rr * vec2(cos(th), sin(th));',
    '    float sz = 0.026 + 0.016 * (fi / 100.0);',
    '    float e = length(dd * vec2(1.0, 0.72));',
    '    float ring = smoothstep(sz * 0.42, 0.0, abs(e - sz));',
    '    glow = max(glow, ring * (0.55 + 0.45 * sin(t * 3.0 + fi * 0.7)));',
    '  }',
    '  float one = smoothstep(0.03, 0.012, abs(q.x)) * step(abs(q.y + 0.01), 0.1);',
    '  one = max(one, smoothstep(0.025, 0.01, abs(q.y - 0.07 + q.x * 0.9)) * step(-0.05, q.x) * step(q.x, 0.0));',
    '  emit = vec3(0.3, 1.0, 0.9) * glow * 1.5 + vec3(1.0, 1.0, 0.85) * one * 2.0;',
    '  gloss = 0.9;',
    '}'
  ].join('\n');

  // Googolplex - a whole spiral galaxy inside a glass ball
  SURF.galaxy = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 p = rot2(t * 0.07) * q * 1.12;',
    '  float r = length(p); float a = atan(p.y, p.x);',
    '  float s = sin(2.0 * (a - 2.4 * log(r + 0.02)));',
    '  float dust = fbm3(vec3(p * 6.0, t * 0.02));',
    '  float arm = smoothstep(0.1, 1.0, s) * smoothstep(1.0, 0.15, r);',
    '  vec3 armCol = mix(vec3(0.3, 0.5, 1.0), vec3(1.0, 0.55, 0.85), dust) * arm * (0.35 + dust);',
    '  float lane = smoothstep(0.55, 0.8, fbm3(vec3(p * 11.0, 1.0))) * arm;',
    '  vec3 core = vec3(1.0, 0.88, 0.7) * (exp(-r * r * 22.0) * 2.2 + exp(-r * 5.0) * 0.3);',
    '  vec2 sg = q * 70.0; float h = hash2(floor(sg));',
    '  float star = step(0.955, h) * smoothstep(0.32, 0.0, length(fract(sg) - 0.5)) * (0.6 + 0.4 * sin(t * 2.0 + h * 60.0));',
    '  alb = vec3(0.012, 0.005, 0.03);',
    '  emit = core + armCol * 1.3 * (1.0 - lane * 0.7) + vec3(star) * 1.4;',
    '  gloss = 0.95;',
    '}'
  ].join('\n');

  // Functions - a knurled metal ring around a dark core with glowing circuit traces
  SURF.fnring = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q); float a = atan(q.y, q.x);',
    '  float band = smoothstep(0.74, 0.77, r);',
    '  vec3 metal = vec3(0.55, 0.57, 0.63) * (0.72 + 0.28 * sin(a * 48.0));',
    '  float notch = smoothstep(0.05, 0.0, abs(fract(a / TAU * 12.0 + t * 0.05) - 0.5) - 0.42) * band;',
    '  vec2 g = q * 6.0; vec2 c = floor(g); vec2 f = fract(g) - 0.5; float h = hash2(c);',
    '  float trace = smoothstep(0.07, 0.0, abs(h < 0.5 ? f.y : f.x)) * step(0.25, fract(h * 7.0));',
    '  float node = smoothstep(0.14, 0.08, length(f)) * step(0.8, h);',
    '  float pulse = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 3.0 - length(c) * 0.9), 3.0);',
    '  alb = mix(vec3(0.02, 0.02, 0.04), metal, band);',
    '  emit = uAura * (trace * 0.8 + node * 1.5) * pulse * (1.0 - band);',
    '  emit += uAura * smoothstep(0.025, 0.0, abs(r - 0.755)) * 1.6 + uAura * notch * 1.2;',
    '  gloss = mix(0.75, 0.9, band);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ ball wrapper
  var BALL_UNIFORMS = [
    'uniform float uTime, uHit, uHp, uPx, uSeed, uSpin, uFade;',
    'uniform mat3 uRot;',
    'uniform vec3 uAura;',
    ''
  ].join('\n');
  var BALL_MAIN = [
    'void main() {',
    '  vec2 p = (vUv * 2.0 - 1.0) * ' + S.QUAD.toFixed(3) + ';',
    '  float r = length(p);',
    '  vec3 col = vec3(0.0); float a = 0.0;',
    '  if (r < 1.0) {',
    '    float z = sqrt(max(0.0, 1.0 - r * r));',
    '    vec3 n = vec3(p, z);',
    '    vec3 d = uRot * n;',
    '    vec2 q = rot2(uSpin) * p;',
    '    vec3 alb = vec3(0.5); vec3 emit = vec3(0.0); float gloss = 0.5;',
    '    surface(d, q, uTime, alb, emit, gloss);',
    '    vec3 L = normalize(vec3(-0.45, 0.55, 0.7));',
    '    float dif = max(dot(n, L), 0.0);',
    '    vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));',
    '    float sp = pow(max(dot(n, hv), 0.0), mix(8.0, 90.0, gloss)) * gloss * 1.2;',
    '    float fr = pow(1.0 - z, 2.5);',
    '    col = alb * (0.3 + dif * 0.85) + emit + vec3(sp) + uAura * fr * 0.6;',
    // glowing cracks as health drops
    '    float dmg = 1.0 - uHp;',
    '    if (dmg > 0.001) {',
    '      vec3 v = voronoi3(d * 3.2 + uSeed);',
    '      float w = 0.015 + 0.05 * dmg;',
    '      float crack = (1.0 - smoothstep(0.0, w, v.y)) * step(v.z, dmg * 1.25);',
    '      col = mix(col, vec3(1.0, 0.85, 0.6) * 1.7, crack * 0.9);',
    '    }',
    '    col += vec3(1.0) * uHit * 0.6;',
    '    a = smoothstep(1.0, 1.0 - uPx * 1.5, r);',
    '  }',
    '  float ag = r > 0.97 ? exp(-max(r - 1.0, 0.0) * 6.5) * (0.32 + uHit * 0.9) : 0.0;',
    '  ag *= smoothstep(' + S.QUAD.toFixed(3) + ', ' + (S.QUAD - 0.25).toFixed(3) + ', r);',   // no hard edge at the quad border
    '  vec3 outc = col * a + uAura * ag * (1.0 - a);',
    '  gl_FragColor = vec4(outc * uFade, a * uFade);',   // premultiplied
    '}'
  ].join('\n');

  S.ballFragment = function (textureId) {
    var surf = SURF[textureId] || SURF.pearl;
    return COMMON + BALL_UNIFORMS + surf + '\n' + BALL_MAIN;
  };

  // ------------------------------------------------------------------ background
  S.backgroundFragment = COMMON + [
    'uniform vec2 uRes;',
    'uniform float uTime, uPulse;',
    'uniform vec3 uTint;',
    'void main() {',
    '  vec2 px = vUv * uRes;',
    '  vec2 c = px - uRes * 0.5;',
    '  vec2 g = abs(fract(px / 48.0) - 0.5) * 48.0;',
    '  float line = smoothstep(1.2, 0.0, min(g.x, g.y));',
    '  vec2 g2 = abs(fract(px / 240.0) - 0.5) * 240.0;',
    '  float major = smoothstep(1.4, 0.0, min(g2.x, g2.y));',
    '  float vig = 1.0 - smoothstep(0.25, 1.1, length(c / uRes.yy));',
    '  float neb = fbm3(vec3(px / 420.0, uTime * 0.03));',
    '  vec3 col = vec3(0.02, 0.022, 0.05) + uTint * neb * 0.08;',
    '  col += vec3(0.12, 0.16, 0.3) * line * 0.35 + vec3(0.2, 0.25, 0.45) * major * 0.3;',
    '  col *= 0.35 + 0.65 * vig;',
    '  col += uTint * uPulse * 0.25 * vig;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ shockwave ring
  S.ringFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform float uProg, uWidth;',
    'uniform vec3 uColor;',
    'void main() {',
    '  float r = length(vUv * 2.0 - 1.0);',
    '  float k = (r - 0.9) / uWidth;',
    '  float band = exp(-k * k);',
    '  float inner = smoothstep(0.9, 0.0, r) * 0.12;',
    '  float fade = 1.0 - uProg;',
    '  vec3 c = uColor * (band * 1.4 + inner) * fade * fade;',
    '  gl_FragColor = vec4(c, 0.0);',   // additive (premultiplied, alpha 0)
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ particles
  S.particleVertex = [
    'attribute float aSize;',
    'attribute float aAlpha;',
    'attribute vec3 aColor;',
    'uniform float uDpr;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'void main() {',
    '  vColor = aColor; vAlpha = aAlpha;',
    '  gl_PointSize = aSize * uDpr;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');
  S.particleFragment = [
    'precision highp float;',
    'varying vec3 vColor;',
    'varying float vAlpha;',
    'void main() {',
    '  vec2 c = gl_PointCoord * 2.0 - 1.0;',
    '  float r = dot(c, c);',
    '  if (r > 1.0) discard;',
    '  float core = exp(-r * 3.0);',
    '  gl_FragColor = vec4(vColor * core * vAlpha * 1.5 + vec3(core * core * vAlpha * 0.4), 0.0);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ flash
  S.flashFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform vec3 uColor;',
    'uniform float uAmount;',
    'uniform vec2 uCenter;',
    'void main() {',
    '  float d = length(vUv - uCenter);',
    '  float k = uAmount * (0.55 + 0.45 * exp(-d * 2.5));',
    '  gl_FragColor = vec4(uColor * k, 0.0);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ post-processing
  // The scene is drawn into tScene, then this pass adds the screen-wide effects:
  //   uShatter  (level 4) the screen breaks into glass panes around uCenter that
  //             slide and tilt apart, with rainbow edges and dark seams
  //   uCA       (level 3+) chromatic aberration: red and blue pulled apart
  S.postFragment = COMMON + [
    'uniform sampler2D tScene;',
    'uniform vec2 uRes, uCenter;',
    'uniform float uCA, uShatter, uSeed, uTime;',
    'vec2 hash22(vec2 p) {',
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
    '  return fract(sin(p) * 43758.5453);',
    '}',
    'void main() {',
    '  vec2 uv = vUv;',
    '  vec2 asp = vec2(uRes.x / uRes.y, 1.0);',
    '  vec3 edgeCol = vec3(0.0); float seam = 0.0;',
    '  if (uShatter > 0.002) {',
    '    vec2 p = (uv - uCenter) * asp;',
    // cells get smaller near the impact, like real cracked glass
    '    float warp = 1.0 + 1.6 * exp(-length(p) * 3.0);',
    '    vec2 g = p * 4.2 * warp;',
    '    vec2 ip = floor(g), fp = fract(g);',
    '    float d1 = 8.0, d2 = 8.0; vec2 cid = vec2(0.0); vec2 cpos = vec2(0.0);',
    '    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {',
    '      vec2 b = vec2(float(i), float(j));',
    '      vec2 o = hash22(ip + b + uSeed);',
    '      vec2 r = b + o - fp; float d = dot(r, r);',
    '      if (d < d1) { d2 = d1; d1 = d; cid = ip + b; cpos = (ip + b + o) / (4.2 * warp); }',
    '      else if (d < d2) { d2 = d; }',
    '    }',
    '    float edge = sqrt(d2) - sqrt(d1);',
    '    vec2 h = hash22(cid * 1.37 + uSeed * 3.1);',
    '    vec2 dir = cpos / (length(cpos) + 1e-3);',
    '    float push = uShatter * (0.015 + 0.05 * h.x) * (1.0 + 1.2 * length(cpos));',
    '    float ang = (h.y - 0.5) * uShatter * 0.22;',
    '    vec2 local = rot2(ang) * (p - cpos);',
    '    vec2 np = cpos + local - dir * push * 0.6 - (h - 0.5) * uShatter * 0.02;',
    '    uv = np / asp + uCenter;',
    '    float w = 0.02 + 0.04 * uShatter;',
    '    float e = 1.0 - smoothstep(0.0, w, edge);',
    '    vec3 rainbow = hsv2rgb(vec3(fract(h.x + edge * 3.0 + uTime * 0.2), 0.7, 1.0));',
    '    edgeCol = (rainbow * 1.2 + vec3(0.8)) * e * uShatter;',
    '    seam = e * uShatter * 0.5;',
    // each pane catches the light a little differently
    '    edgeCol += vec3(0.6, 0.7, 1.0) * pow(h.y, 6.0) * uShatter * 0.25;',
    '  }',
    '  vec2 cd = uv - 0.5;',
    '  float k = uCA * 0.014;',
    '  vec3 col;',
    '  col.r = texture2D(tScene, uv + cd * k).r;',
    '  col.g = texture2D(tScene, uv).g;',
    '  col.b = texture2D(tScene, uv - cd * k).b;',
    '  col = col * (1.0 - seam) + edgeCol;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ lightning
  // A bolt is a strip of quads; uv.y runs across the strip (0..1).
  S.boltFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform vec3 uColor;',
    'uniform float uAlpha;',
    'void main() {',
    '  float x = (vUv.y - 0.5) * 2.0;',
    '  float core = exp(-x * x * 18.0);',
    '  float glow = exp(-x * x * 2.5) * 0.5;',
    '  vec3 c = (vec3(1.0) * core + uColor * glow) * uAlpha;',
    '  gl_FragColor = vec4(c, 0.0);',
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ glass shards
  // uv holds barycentric-style coordinates so edges can glow.
  S.shardFragment = COMMON + [
    'uniform float uAlpha, uHue, uGlint;',
    'void main() {',
    '  float e = min(min(vUv.x, vUv.y), 1.0 - vUv.x - vUv.y);',
    '  float edge = smoothstep(0.09, 0.0, e);',
    '  vec3 rainbow = hsv2rgb(vec3(fract(uHue + vUv.x * 0.6 + vUv.y * 0.3), 0.55, 1.0));',
    '  vec3 c = rainbow * (0.12 + 0.25 * uGlint) + (vec3(1.0) * 0.8 + rainbow * 0.6) * edge;',
    '  gl_FragColor = vec4(c * uAlpha, 0.0);',
    '}'
  ].join('\n');

  if (typeof module !== 'undefined' && module.exports) module.exports = MBF;
})(typeof window !== 'undefined' ? window : globalThis);
