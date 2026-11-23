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

  // Skewes - an Ulam spiral: count 1, 2, 3... in a square spiral and light up the primes
  SURF.ulam = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 g = (rot2(t * 0.05) * q) * 15.5;',
    '  vec2 c = floor(g + 0.5); vec2 f = g - c;',
    '  float k = max(abs(c.x), abs(c.y));',
    '  float side = 2.0 * k, start = (2.0 * k - 1.0) * (2.0 * k - 1.0);',
    '  float n;',
    '  if (k < 0.5) n = 1.0;',
    '  else if (c.x > k - 0.5 && c.y > -k + 0.5) n = start + c.y + k;',
    '  else if (c.y > k - 0.5) n = start + side + (k - c.x);',
    '  else if (c.x < -k + 0.5) n = start + 2.0 * side + (k - c.y);',
    '  else n = start + 3.0 * side + (c.x + k);',
    '  float prime = n < 1.5 ? 0.0 : 1.0;',
    '  for (int i = 2; i < 40; i++) {',
    '    float fi = float(i);',
    '    if (fi * fi > n + 0.5) break;',
    '    if (mod(n + 0.5, fi) < 1.0) { prime = 0.0; break; }',
    '  }',
    '  float sq = smoothstep(0.44, 0.32, max(abs(f.x), abs(f.y)));',
    '  alb = vec3(0.06, 0.035, 0.1) + vec3(0.12, 0.07, 0.18) * sq * (1.0 - prime);',
    '  float pulse = 0.65 + 0.35 * sin(t * 2.0 - k * 0.5);',
    '  emit = vec3(1.0, 0.74, 0.28) * sq * prime * 1.6 * pulse;',
    '  emit += vec3(1.0, 0.9, 0.6) * sq * step(n, 1.5) * 1.5;',
    '  gloss = 0.8;',
    '}'
  ].join('\n');

  // Googolplexplex - a galaxy made of galaxies
  SURF.galaxies = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 p = rot2(t * 0.04) * q * 3.4;',
    '  vec2 ip = floor(p), fp = fract(p);',
    '  vec3 col = vec3(0.0);',
    '  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {',
    '    vec2 b = vec2(float(i), float(j)); vec2 id = ip + b; float h = hash2(id);',
    '    vec2 o = vec2(hash2(id + 3.1), hash2(id + 7.7)) * 0.6 + 0.2;',
    '    float sz = 0.16 + 0.24 * h;',
    '    vec2 lp = rot2(t * (0.25 + h * 0.4) + h * 6.0) * (b + o - fp) / sz;',
    '    float r = length(lp);',
    '    if (r < 1.0) {',
    '      float a = atan(lp.y, lp.x);',
    '      float arm = smoothstep(0.15, 1.0, sin(2.0 * (a - 2.3 * log(r + 0.03)))) * (1.0 - r);',
    '      vec3 gc = hsv2rgb(vec3(fract(h * 3.0 + 0.55), 0.55, 1.0));',
    '      col += gc * arm * 0.9 + vec3(1.0, 0.9, 0.8) * exp(-r * r * 30.0) * 1.2;',
    '    }',
    '  }',
    '  vec2 sg = q * 80.0; float sh = hash2(floor(sg));',
    '  float star = step(0.965, sh) * smoothstep(0.3, 0.0, length(fract(sg) - 0.5));',
    '  alb = vec3(0.01, 0.01, 0.03);',
    '  emit = col + vec3(star) * 0.9;',
    '  gloss = 0.95;',
    '}'
  ].join('\n');

  // Moser - shapes inside shapes: circle, square, triangle, again and again
  SURF.moser = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q), a = atan(q.y, q.x);',
    '  vec3 col = vec3(0.0);',
    '  float s = 0.93;',
    '  for (int i = 0; i < 9; i++) {',
    '    float fi = float(i), kind = mod(fi, 3.0);',
    '    float n = kind < 0.5 ? 64.0 : (kind < 1.5 ? 4.0 : 3.0);',
    '    float seg = TAU / n;',
    '    float aa = a + t * 0.35 * (mod(fi, 2.0) * 2.0 - 1.0) + fi * 0.5;',
    '    float pr = s * cos(PI / n) / cos(mod(aa, seg) - seg * 0.5);',
    '    float w = 0.007 + 0.009 * s;',
    '    float line = smoothstep(w, 0.0, abs(r - pr));',
    '    col += hsv2rgb(vec3(0.02 + fi * 0.06, 0.75, 1.0)) * line * (1.0 + 0.3 * sin(t * 3.0 + fi));',
    '    s *= cos(PI / n);',
    '  }',
    '  alb = vec3(0.12, 0.03, 0.03) * (0.6 + 0.4 * fbm3(d * 3.0));',
    '  emit = col * 1.5 + vec3(1.0, 0.6, 0.3) * exp(-r * r * 400.0) * 2.0;',
    '  gloss = 0.7;',
    '}'
  ].join('\n');

  // Graham's - a spinning 4D hypercube (tesseract) over rising up-arrow runes
  SURF.hypercube = [
    'vec2 proj4(vec4 v, float t) {',
    '  float c1 = cos(t * 0.5), s1 = sin(t * 0.5), c2 = cos(t * 0.37), s2 = sin(t * 0.37);',
    '  v = vec4(v.x * c1 - v.w * s1, v.y * c2 - v.z * s2, v.y * s2 + v.z * c2, v.x * s1 + v.w * c1);',
    '  vec3 p = v.xyz / (2.8 - v.w);',
    '  float c3 = cos(0.5), s3 = sin(0.5);',
    '  p = vec3(p.x * c3 + p.z * s3, p.y, -p.x * s3 + p.z * c3);',
    '  return p.xy / (2.4 - p.z) * 2.1;',
    '}',
    'float segd(vec2 p, vec2 a, vec2 b) {',
    '  vec2 pa = p - a, ba = b - a;',
    '  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));',
    '}',
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float dl = 9.0, dv = 9.0;',
    '  for (int i = 0; i < 16; i++) {',
    '    float fi = float(i);',
    '    vec4 v = vec4(mod(fi, 2.0), mod(floor(fi / 2.0), 2.0), mod(floor(fi / 4.0), 2.0), mod(floor(fi / 8.0), 2.0)) * 2.0 - 1.0;',
    '    vec2 pv = proj4(v, t);',
    '    dv = min(dv, length(q - pv));',
    '    if (v.x < 0.0) dl = min(dl, segd(q, pv, proj4(vec4(1.0, v.yzw), t)));',
    '    if (v.y < 0.0) dl = min(dl, segd(q, pv, proj4(vec4(v.x, 1.0, v.zw), t)));',
    '    if (v.z < 0.0) dl = min(dl, segd(q, pv, proj4(vec4(v.xy, 1.0, v.w), t)));',
    '    if (v.w < 0.0) dl = min(dl, segd(q, pv, proj4(vec4(v.xyz, 1.0), t)));',
    '  }',
    // faint up-arrow runes drifting upward
    '  vec2 g = q * 9.0 + vec2(0.0, -t * 0.6);',
    '  vec2 cf = fract(g) - 0.5; float h = hash2(floor(g));',
    '  float chev = smoothstep(0.06, 0.02, abs(cf.y - 0.12 + abs(cf.x) * 0.9)) * step(abs(cf.x), 0.28) * step(0.55, h);',
    '  alb = vec3(0.02, 0.04, 0.12) + vec3(0.05, 0.1, 0.25) * chev;',
    '  emit = vec3(0.4, 0.75, 1.0) * (exp(-dl * 90.0) * 1.5 + exp(-dl * 22.0) * 0.35)',
    '       + vec3(1.0) * exp(-dv * 60.0) * 1.2 + vec3(0.25, 0.45, 1.0) * chev * 0.35;',
    '  gloss = 0.85;',
    '}'
  ].join('\n');

  var SEGD = [
    'float segd(vec2 p, vec2 a, vec2 b) {',
    '  vec2 pa = p - a, ba = b - a;',
    '  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));',
    '}'
  ].join('\n');

  // TREE - a crystal orb with a glowing branching tree inside. Its seeds come in uK colours
  // (TREE(3) has 3), and a purple-teal swirl runs round the rim.
  SURF.tree = SEGD + '\n' + [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q), ang0 = atan(q.y, q.x);',
    '  vec3 v = voronoi3(d * 3.0 + 7.0);',
    '  alb = vec3(0.04, 0.03, 0.1) + vec3(0.05, 0.04, 0.12) * v.z;',
    '  float facet = 1.0 - smoothstep(0.0, 0.03, v.y);',
    '  float k = max(1.0, min(uK, 9.0));',
    '  float dl = 9.0; vec3 nodes = vec3(0.0);',
    '  for (int lvl = 0; lvl < 5; lvl++) {',
    '    float cnt = pow(2.0, float(lvl));',
    '    for (int j = 0; j < 16; j++) {',
    '      if (float(j) >= cnt) break;',
    '      vec2 p0 = vec2(0.0, -0.66); float a = PI * 0.5 + 0.06 * sin(t * 0.7); float len = 0.3;',
    '      vec2 p1 = p0 + vec2(cos(a), sin(a)) * len;',
    '      for (int b = 1; b < 5; b++) {',
    '        if (b > lvl) break;',
    '        float bit = mod(floor(float(j) / pow(2.0, float(lvl - b))), 2.0);',
    '        a += (bit * 2.0 - 1.0) * (0.42 + 0.08 * sin(t * 0.9 + float(b) * 1.7));',
    '        len *= 0.74; p0 = p1; p1 = p0 + vec2(cos(a), sin(a)) * len;',
    '      }',
    '      dl = min(dl, segd(q, p0, p1) / (1.0 - float(lvl) * 0.15));',
    '      float hc = hash2(vec2(float(lvl), float(j)) + 1.3);',
    '      vec3 seed = hsv2rgb(vec3(fract(0.08 + floor(hc * k) * 0.618), 0.75, 1.0));',
    '      nodes += seed * exp(-length(q - p1) * 55.0) * 1.6;',
    '    }',
    '  }',
    '  float swirl = 0.5 + 0.5 * sin(ang0 * 3.0 + t * 2.0 - r * 18.0);',
    '  vec3 rimCol = mix(vec3(0.6, 0.25, 1.0), vec3(0.15, 0.95, 0.9), swirl);',
    '  float rim = smoothstep(0.78, 0.95, r);',
    '  emit = vec3(0.75, 1.0, 0.85) * (exp(-dl * 110.0) * 1.3 + exp(-dl * 30.0) * 0.25) + nodes;',
    '  emit += rimCol * rim * 1.2 + vec3(0.5, 0.4, 1.0) * facet * 0.25;',
    '  gloss = 1.0;',
    '}'
  ].join('\n');

  // SCG(13) - a glowing network where each dot has at most three lines
  SURF.graph = SEGD + '\n' + [
    'vec2 node(vec2 c) { return c + 0.5 + (vec2(hash2(c), hash2(c + 9.1)) - 0.5) * 0.6; }',
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 g = rot2(t * 0.05) * q * 4.5; vec2 ip = floor(g);',
    '  float dl = 9.0, dn = 9.0, pulse = 0.0;',
    '  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {',
    '    vec2 c = ip + vec2(float(i), float(j)); vec2 pc = node(c);',
    '    dn = min(dn, length(g - pc));',
    '    if (hash2(c + 2.3) > 0.3) { float e = segd(g, pc, node(c + vec2(1.0, 0.0))); if (e < dl) { dl = e; pulse = fract(t * 0.8 + hash2(c)); } }',
    '    if (hash2(c + 5.7) > 0.45) { float e = segd(g, pc, node(c + vec2(0.0, 1.0))); if (e < dl) { dl = e; pulse = fract(t * 0.8 + hash2(c + 1.0)); } }',
    '  }',
    '  alb = vec3(0.02, 0.06, 0.05);',
    '  emit = vec3(0.2, 1.0, 0.65) * (exp(-dl * 22.0) * (0.6 + 0.6 * pulse) + exp(-dl * 6.0) * 0.12)',
    '       + vec3(0.85, 1.0, 0.9) * exp(-dn * 9.0) * 1.3;',
    '  gloss = 0.85;',
    '}'
  ].join('\n');

  // Loader's - columns of lambda-calculus symbols raining down
  SURF.lambda = SEGD + '\n' + [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec2 g = q * 7.0;',
    '  float col = floor(g.x);',
    '  float sp = 0.6 + hash2(vec2(col, 1.0)) * 1.4;',
    '  float y = g.y + t * sp * 2.5 + hash2(vec2(col, 2.0)) * 10.0;',
    '  vec2 cell = vec2(col, floor(y)); vec2 f = vec2(fract(g.x), fract(y)) - 0.5;',
    '  float h = hash2(cell);',
    '  float gd;',
    '  if (h < 0.6) gd = min(segd(f, vec2(-0.2, 0.33), vec2(0.22, -0.33)), segd(f, vec2(0.0, 0.0), vec2(-0.22, -0.33)));',
    '  else if (h < 0.8) gd = abs(length(f - vec2(0.22, 0.0)) - 0.32) + step(0.0, f.x) * 9.0;',
    '  else gd = length(f) - 0.06;',
    '  float glyph = smoothstep(0.07, 0.03, gd);',
    '  float trail = pow(fract(h * 7.0 + t * 0.4 * sp), 3.0);',
    '  alb = vec3(0.05, 0.035, 0.01);',
    '  emit = vec3(1.0, 0.72, 0.25) * glyph * (0.25 + 1.4 * trail);',
    '  gloss = 0.7;',
    '}'
  ].join('\n');

  // Rayo - dark crimson scales engraved with logic symbols (∀ ∃ ∈ ¬, the language
  // Rayo's number is defined in) and one slit eye that follows its opponent
  SURF.rayo = SEGD + '\n' + [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec3 v = voronoi3(d * 7.0);',
    '  float edge = smoothstep(0.0, 0.07, v.y);',
    '  float dome = clamp(1.0 - v.x * 1.3, 0.0, 1.0);',
    '  alb = mix(vec3(0.22, 0.0, 0.02), vec3(0.78, 0.06, 0.05), dome) * (0.65 + 0.5 * v.z) * edge;',
    '  vec2 g = q * 6.0; vec2 c = floor(g); vec2 f = fract(g) - 0.5; float h = hash2(c + 4.4);',
    '  float gd;',
    '  if (h < 0.25) gd = min(min(segd(f, vec2(-0.25, 0.3), vec2(0.0, -0.3)), segd(f, vec2(0.25, 0.3), vec2(0.0, -0.3))), segd(f, vec2(-0.13, 0.03), vec2(0.13, 0.03)));',
    '  else if (h < 0.5) gd = min(segd(f, vec2(0.2, 0.3), vec2(0.2, -0.3)), min(segd(f, vec2(-0.2, 0.3), vec2(0.2, 0.3)), min(segd(f, vec2(-0.14, 0.0), vec2(0.2, 0.0)), segd(f, vec2(-0.2, -0.3), vec2(0.2, -0.3)))));',
    '  else if (h < 0.75) gd = min(min(f.x < 0.05 ? abs(length(f - vec2(0.05, 0.0)) - 0.25) : 9.0, segd(f, vec2(-0.2, 0.0), vec2(0.28, 0.0))), min(segd(f, vec2(0.05, 0.25), vec2(0.28, 0.25)), segd(f, vec2(0.05, -0.25), vec2(0.28, -0.25))));',
    '  else gd = min(segd(f, vec2(-0.25, 0.08), vec2(0.25, 0.08)), segd(f, vec2(0.25, 0.08), vec2(0.25, -0.16)));',
    '  float glyph = smoothstep(0.05, 0.02, gd) * step(0.3, hash2(c + 8.8));',
    '  emit = vec3(1.0, 0.25, 0.1) * glyph * (0.35 + 0.35 * sin(t * 2.0 + h * 20.0));',
    // the eye: a pointed lens shape, blinking now and then
    '  vec2 e = q - vec2(0.0, 0.1);',
    '  float ph = fract(t * 0.15);',
    '  float openK = ph > 0.95 ? abs(ph - 0.975) / 0.025 : 1.0;',
    '  vec2 ee = e / vec2(0.55, 0.26 * openK + 0.01);',
    '  float lens = 1.0 - ee.x * ee.x - abs(ee.y);',
    '  float inside = smoothstep(0.0, 0.06, lens);',
    '  vec2 ip = e - uLook * vec2(0.2, 0.08);',
    '  float ir = length(ip);',
    '  float iris = smoothstep(0.21, 0.19, ir);',
    '  float stri = 0.65 + 0.35 * sin(atan(ip.y, ip.x) * 26.0 + ir * 30.0);',
    '  vec3 irisCol = mix(vec3(1.0, 0.8, 0.15), vec3(1.0, 0.12, 0.0), smoothstep(0.0, 0.2, ir)) * stri;',
    '  float pupil = smoothstep(0.035, 0.02, abs(ip.x) + ip.y * ip.y * 0.8) * step(abs(ip.y), 0.18);',
    '  vec3 eyeCol = mix(vec3(0.3, 0.12, 0.02), irisCol, iris);',
    '  eyeCol = mix(eyeCol, vec3(0.0), pupil);',
    '  eyeCol += vec3(1.0) * exp(-length(ip - vec2(-0.07, 0.07)) * 60.0) * iris;',   // glint
    '  alb = mix(alb, vec3(0.0), inside);',
    '  emit = mix(emit, eyeCol * 1.7, inside);',
    '  alb = mix(alb, vec3(0.02, 0.0, 0.0), smoothstep(0.07, 0.0, abs(lens)));',
    '  gloss = 0.85;',
    '}'
  ].join('\n');

  // Gotchrognathicus = (Rayo's number ^ Rayo's number) × Rayo's number - black-crimson
  // scales with three of Rayo's slit eyes written like the formula: R^R × R (a big eye, a
  // small raised "exponent" eye, a glowing ×, then another big eye). All three track the opponent.
  SURF.gotch = SEGD + '\n' + [
    'void gEye(vec2 e, float s, float off, float t, inout vec3 alb, inout vec3 emit) {',
    '  e /= s;',
    '  float ph = fract(t * 0.15 + off);',
    '  float openK = ph > 0.95 ? abs(ph - 0.975) / 0.025 : 1.0;',
    '  vec2 ee = e / vec2(0.55, 0.26 * openK + 0.01);',
    '  float lens = 1.0 - ee.x * ee.x - abs(ee.y);',
    '  float inside = smoothstep(0.0, 0.06, lens);',
    '  vec2 ip = e - uLook * vec2(0.2, 0.08);',
    '  float ir = length(ip);',
    '  float iris = smoothstep(0.21, 0.19, ir);',
    '  float stri = 0.65 + 0.35 * sin(atan(ip.y, ip.x) * 26.0 + ir * 30.0);',
    '  vec3 irisCol = mix(vec3(1.0, 0.85, 0.3), vec3(0.95, 0.1, 0.35), smoothstep(0.0, 0.2, ir)) * stri;',
    '  float pupil = smoothstep(0.035, 0.02, abs(ip.x) + ip.y * ip.y * 0.8) * step(abs(ip.y), 0.18);',
    '  vec3 eyeCol = mix(vec3(0.25, 0.05, 0.08), irisCol, iris);',
    '  eyeCol = mix(eyeCol, vec3(0.0), pupil);',
    '  eyeCol += vec3(1.0) * exp(-length(ip - vec2(-0.07, 0.07)) * 60.0) * iris;',
    '  alb = mix(alb, vec3(0.0), inside);',
    '  emit = mix(emit, eyeCol * 1.7, inside);',
    '  alb = mix(alb, vec3(0.02, 0.0, 0.0), smoothstep(0.07, 0.0, abs(lens)));',
    '}',
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  vec3 v = voronoi3(d * 9.0);',
    '  float edge = smoothstep(0.0, 0.06, v.y);',
    '  float dome = clamp(1.0 - v.x * 1.3, 0.0, 1.0);',
    '  alb = mix(vec3(0.08, 0.0, 0.03), vec3(0.5, 0.02, 0.12), dome) * (0.6 + 0.5 * v.z) * edge;',
    '  emit = vec3(1.0, 0.15, 0.3) * (1.0 - edge) * (0.25 + 0.25 * sin(t * 1.5 + v.z * 12.0));',
    '  vec2 g = q * 7.0; vec2 c = floor(g); vec2 f = fract(g) - 0.5; float h = hash2(c + 2.7);',
    '  float gd;',
    '  if (h < 0.33) gd = min(min(segd(f, vec2(-0.25, 0.3), vec2(0.0, -0.3)), segd(f, vec2(0.25, 0.3), vec2(0.0, -0.3))), segd(f, vec2(-0.13, 0.03), vec2(0.13, 0.03)));',
    '  else if (h < 0.66) gd = min(segd(f, vec2(0.2, 0.3), vec2(0.2, -0.3)), min(segd(f, vec2(-0.2, 0.3), vec2(0.2, 0.3)), min(segd(f, vec2(-0.14, 0.0), vec2(0.2, 0.0)), segd(f, vec2(-0.2, -0.3), vec2(0.2, -0.3)))));',
    '  else gd = min(segd(f, vec2(-0.25, 0.08), vec2(0.25, 0.08)), segd(f, vec2(0.25, 0.08), vec2(0.25, -0.16)));',
    '  emit += vec3(1.0, 0.3, 0.45) * smoothstep(0.05, 0.02, gd) * step(0.55, hash2(c + 6.1)) * (0.3 + 0.3 * sin(t * 2.0 + h * 20.0));',
    '  gEye(q - vec2(-0.43, -0.03), 0.5, 0.0, t, alb, emit);',     // R
    '  gEye(q - vec2(-0.06, 0.3), 0.4, 0.31, t, alb, emit);',     // ^R
    '  float x = min(segd(q, vec2(0.04, -0.09), vec2(0.16, 0.03)), segd(q, vec2(0.04, 0.03), vec2(0.16, -0.09)));',
    '  float xg = smoothstep(0.03, 0.012, x);',
    '  alb = mix(alb, vec3(0.0), xg);',
    '  emit = mix(emit, vec3(1.0, 0.8, 0.5) * (1.3 + 0.3 * sin(t * 3.0)), xg);',   // ×
    '  gEye(q - vec2(0.45, -0.03), 0.5, 0.63, t, alb, emit);',     // R
    '  gloss = 0.85;',
    '}'
  ].join('\n');

  // BIG FOOT - a giant glowing footprint stamped into rough, furry stone
  SURF.bigfoot = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  alb = mix(vec3(0.22, 0.13, 0.07), vec3(0.45, 0.3, 0.17), fbm3(d * 6.0)) * (0.7 + 0.3 * noise3(d * 45.0));',
    '  vec2 f = rot2(-0.25) * (q - vec2(0.0, -0.08));',
    '  float sole = smoothstep(1.0, 0.9, length(f / vec2(0.26 - 0.06 * smoothstep(0.1, -0.3, f.y), 0.44)));',
    '  float toes = 0.0;',
    '  for (int i = 0; i < 5; i++) {',
    '    float fi = float(i);',
    '    vec2 c = vec2(-0.2 + fi * 0.1, 0.5 - abs(fi - 1.0) * 0.035);',
    '    float rr = 0.075 - fi * 0.008;',
    '    toes = max(toes, smoothstep(rr, rr - 0.015, length(f - c)));',
    '  }',
    '  float fp = max(sole, toes);',
    '  alb = mix(alb, vec3(0.08, 0.04, 0.02), fp);',
    '  emit = vec3(1.0, 0.55, 0.2) * fp * (0.7 + 0.3 * sin(t * 2.0)) * (0.7 + 0.3 * fbm3(vec3(q * 6.0, t * 0.5)));',
    '  gloss = 0.3;',
    '}'
  ].join('\n');

  // Busy Beaver - a Turing machine tape of 0s and 1s running past the read head
  SURF.tape = SEGD + '\n' + [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q);',
    '  alb = vec3(0.12, 0.12, 0.14) * (0.8 + 0.2 * sin(r * 50.0));',
    '  float band = step(abs(q.y), 0.17);',
    '  float x = q.x * 6.0 + t * 1.6;',
    '  float cell = floor(x); vec2 f = vec2(fract(x) - 0.5, q.y / 0.34 * 2.0);',
    '  float bit = step(0.5, hash2(vec2(cell, floor(t * 0.5 + hash2(vec2(cell, 3.0)) * 4.0))));',
    '  float gd = bit > 0.5 ? segd(f, vec2(0.0, -0.45), vec2(0.0, 0.45)) : abs(length(f * vec2(1.4, 1.0)) - 0.32);',
    '  float glyph = smoothstep(0.08, 0.04, gd) * band;',
    '  float sep = smoothstep(0.04, 0.0, abs(fract(x) - 0.0)) * band;',
    '  alb = mix(alb, vec3(0.9, 0.88, 0.8), band * 0.85);',
    '  alb = mix(alb, vec3(0.05), max(glyph, sep * 0.6));',
    '  float head = smoothstep(0.02, 0.0, max(abs(q.x) * 1.2 + (q.y - 0.36), -(q.y - 0.2)));',
    '  emit = vec3(1.0, 0.3, 0.55) * (head * 1.8 + smoothstep(0.03, 0.0, abs(abs(q.y) - 0.18)) * 0.9);',
    '  gloss = 0.7;',
    '}'
  ].join('\n');

  // Oblivion - a black hole: a lightless core, a blazing ring at the edge of the horizon,
  // and starlight bent and spiralling inward
  SURF.void = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q), a = atan(q.y, q.x);',
    '  vec2 lq = q * (1.0 + 0.12 / max(r, 0.05));',
    '  vec2 sg = rot2(t * 0.03 + 0.4 / (r + 0.2)) * lq * 38.0; float sh = hash2(floor(sg));',
    '  float star = step(0.95, sh) * smoothstep(0.3, 0.0, length(fract(sg) - 0.5));',
    '  float sw = a + 3.0 / (r + 0.15) - t * 0.7;',
    '  float streak = pow(0.5 + 0.5 * sin(sw * 6.0), 8.0) * smoothstep(0.25, 0.6, r);',
    '  float horizon = smoothstep(0.27, 0.25, r);',
    '  float ring = exp(-pow((r - 0.3) / 0.025, 2.0)) * (0.8 + 0.2 * sin(a * 3.0 - t * 4.0));',
    '  alb = vec3(0.0);',
    '  emit = (vec3(star) * 0.8 + vec3(0.6, 0.5, 1.0) * streak * 0.55) * (1.0 - horizon) + vec3(1.0, 0.85, 0.6) * ring * 2.2;',
    '  gloss = 0.4;',
    '}'
  ].join('\n');

  // Utter Oblivion - a tunnel of tunnels: rings fall inward forever toward a white nothing
  SURF.endless = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q), a = atan(q.y, q.x);',
    '  float z = log(r + 1e-3) * 4.5 + t * 1.2;',
    '  float ring = fract(z), k = floor(z);',
    '  float spokes = 0.5 + 0.5 * sin(a * 6.0 + k * 1.7 + t * 0.3);',
    '  vec3 c = hsv2rgb(vec3(fract(k * 0.13 + t * 0.05), 0.55, 1.0));',
    '  float line = smoothstep(0.42, 0.5, abs(ring - 0.5));',
    '  alb = vec3(0.0);',
    '  emit = c * (line * 1.2 + spokes * pow(ring, 6.0) * 0.25) * smoothstep(0.0, 0.15, r);',
    '  emit += vec3(1.0) * smoothstep(0.1, 0.0, r) * 1.3;',
    '  gloss = 0.6;',
    '}'
  ].join('\n');

  // Fish number 7 - a deep-ocean orb with uK glowing fish circling in a spiral (63 for Fish 7:
  // one per application of F7)
  SURF.fish = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q);',
    '  float caust = fbm3(vec3(q * 4.0, t * 0.3));',
    '  alb = mix(vec3(0.0, 0.03, 0.08), vec3(0.0, 0.12, 0.2), caust) * (1.0 - 0.5 * r);',
    '  vec3 glow = vec3(0.0);',
    '  float k = clamp(uK, 1.0, 63.0);',
    '  for (int i = 0; i < 63; i++) {',
    '    float fi = float(i);',
    '    if (fi >= k) break;',
    '    float rr = 0.15 + 0.72 * sqrt((fi + 0.5) / 63.0);',
    '    float th = fi * 2.39996 + t * (0.9 - rr * 0.5);',
    '    vec2 c = rr * vec2(cos(th), sin(th));',
    '    vec2 dir = vec2(-sin(th), cos(th));',   // swimming along the orbit
    '    vec2 lp = q - c;',
    '    vec2 f = vec2(dot(lp, dir), dot(lp, vec2(dir.y, -dir.x)));',
    '    float body = length(f / vec2(0.068, 0.03));',
    '    float tail = max(max(abs(f.y) - (-f.x - 0.05) * 0.9, f.x + 0.05), -(f.x + 0.11));',
    '    float fish = max(smoothstep(1.0, 0.75, body), smoothstep(0.006, 0.0, tail));',
    '    fish *= 1.0 - smoothstep(0.012, 0.004, length(f - vec2(0.035, 0.008)));',
    '    vec3 fc = hsv2rgb(vec3(fract(0.5 + fi * 0.037), 0.6, 1.0));',
    '    glow += fc * fish * (0.7 + 0.3 * sin(t * 4.0 + fi));',
    '  }',
    '  emit = glow * 1.4 + vec3(0.2, 0.7, 1.0) * pow(caust, 4.0) * 0.4;',
    '  gloss = 0.9;',
    '}'
  ].join('\n');

  // Large Number Garden - a glowing night garden: uK big flowers bloom in a ring (10 for the
  // number, one per application of f), with small blossoms and drifting vines around them
  SURF.garden = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float r = length(q);',
    '  float grass = fbm3(vec3(q * 5.0, t * 0.1));',
    '  alb = mix(vec3(0.01, 0.06, 0.03), vec3(0.04, 0.16, 0.07), grass);',
    '  float vine = smoothstep(0.03, 0.0, abs(sin(q.x * 7.0 + sin(q.y * 5.0 + t * 0.4) * 1.5) * 0.12 - q.y * 0.3 + 0.05 * sin(t)));',
    '  vec3 col = vec3(0.25, 0.9, 0.4) * vine * 0.5;',
    '  vec2 sg = rot2(t * 0.05) * q * 9.0; vec2 sc = floor(sg); vec2 sf = fract(sg) - 0.5; float sh = hash2(sc);',
    '  float small = step(0.72, sh) * smoothstep(0.16, 0.08, length(sf) * (0.8 + 0.4 * cos(5.0 * atan(sf.y, sf.x) + sh * 9.0)));',
    '  col += hsv2rgb(vec3(fract(sh * 3.7), 0.5, 1.0)) * small * 0.7;',
    '  float k = clamp(uK, 1.0, 10.0);',
    '  for (int i = 0; i < 10; i++) {',
    '    float fi = float(i);',
    '    if (fi >= k) break;',
    '    float ang = fi / k * TAU + t * 0.12;',
    '    vec2 c = (k < 1.5 ? 0.0 : 0.5) * vec2(cos(ang), sin(ang));',
    '    vec2 lp = rot2(t * 0.3 + fi) * (q - c);',
    '    float pr = length(lp), pa = atan(lp.y, lp.x);',
    '    float bloom = 0.17 * (0.5 + 0.5 * cos(5.0 * pa)) * (0.85 + 0.15 * sin(t * 2.0 + fi));',
    '    float petal = smoothstep(0.012, 0.0, pr - bloom - 0.03);',
    '    float centre = smoothstep(0.045, 0.035, pr);',
    '    vec3 pc = hsv2rgb(vec3(fract(0.85 + fi * 0.1), 0.6, 1.0));',
    '    col = mix(col, pc * (0.6 + 0.6 * (1.0 - pr / 0.2)), petal);',
    '    col = mix(col, vec3(1.0, 0.85, 0.3) * 1.4, centre);',
    '  }',
    '  emit = col;',
    '  gloss = 0.7;',
    '}'
  ].join('\n');

  // Infinity - a glowing figure-eight (lemniscate) with a bright spark racing round it forever
  SURF.infinity = SEGD + '\n' + [
    'vec2 lem(float s) { float den = 1.0 + sin(s) * sin(s); return 0.8 * vec2(cos(s), sin(s) * cos(s)) / den; }',
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float dl = 9.0;',
    '  vec2 prev = lem(0.0);',
    '  for (int i = 1; i <= 64; i++) {',
    '    vec2 cur = lem(float(i) / 64.0 * TAU);',
    '    dl = min(dl, segd(q, prev, cur));',
    '    prev = cur;',
    '  }',
    '  float head = min(length(q - lem(t * 1.3)), length(q - lem(t * 1.3 + PI)));',
    '  vec3 hue = hsv2rgb(vec3(fract(t * 0.05 + atan(q.y, q.x) / TAU), 0.45, 1.0));',
    '  vec2 sg = q * 60.0; float sh = hash2(floor(sg));',
    '  float star = step(0.96, sh) * smoothstep(0.3, 0.0, length(fract(sg) - 0.5)) * (0.6 + 0.4 * sin(t * 3.0 + sh * 40.0));',
    '  alb = vec3(0.01, 0.01, 0.03);',
    '  emit = hue * (exp(-dl * 50.0) * 1.7 + exp(-dl * 9.0) * 0.4) + vec3(1.0, 0.95, 0.8) * exp(-head * 22.0) * 2.6 + vec3(star) * 0.7;',
    '  gloss = 1.0;',
    '}'
  ].join('\n');

  // Fictional numbers - one shader, eight looks. uK (0-999) comes from a hash of the
  // number's name: it picks the template and seeds its shape, so every name looks different
  // and always the same.
  SURF.fictional = [
    'void surface(vec3 d, vec2 q, float t, inout vec3 alb, inout vec3 emit, inout float gloss) {',
    '  float tmpl = mod(floor(uK), 8.0);',
    '  float s1 = hash2(vec2(uK, 1.3)), s2 = hash2(vec2(uK, 7.1)), s3 = hash2(vec2(uK, 3.7));',
    '  vec3 c1 = uAura, c2 = hsv2rgb(vec3(fract(s1 + 0.45), 0.7, 1.0));',
    '  float r = length(q), a = atan(q.y, q.x);',
    '  vec2 qq = rot2(t * (s2 - 0.5) * 0.6) * q;',
    '  float v;',
    '  if (tmpl < 0.5) {',
    '    float n = 3.0 + floor(s2 * 7.0);',
    '    float aa = abs(mod(atan(qq.y, qq.x), TAU / n) - PI / n);',
    '    vec2 kp = vec2(cos(aa), sin(aa)) * r;',
    '    v = smoothstep(0.035, 0.0, abs(kp.y - 0.15 * sin(kp.x * 12.0 + t))) + 0.5 * smoothstep(0.05, 0.0, abs(fract(r * 6.0 - t * 0.3) - 0.5) - 0.45);',
    '  } else if (tmpl < 1.5) {',
    '    float n1 = fbm3(vec3(qq * 2.5 + s1 * 10.0, t * 0.1));',
    '    v = smoothstep(0.35, 0.85, fbm3(vec3(qq * 5.0 + n1 * 2.0, t * 0.07)));',
    '  } else if (tmpl < 2.5) {',
    '    v = pow(0.5 + 0.5 * sin(r * (20.0 + s2 * 30.0) - t * 2.0 + sin(a * (2.0 + floor(s3 * 5.0))) * 1.5), 6.0);',
    '  } else if (tmpl < 3.5) {',
    '    vec3 vo = voronoi3(d * (3.0 + s2 * 5.0) + s1 * 20.0);',
    '    v = smoothstep(0.08, 0.0, vo.y) + vo.z * 0.4;',
    '  } else if (tmpl < 4.5) {',
    '    v = 0.5 + 0.5 * sin(qq.x * 9.0 * (0.6 + s2) + t) * sin(qq.y * 7.0 * (0.6 + s3) - t * 1.3) + 0.25 * sin(r * 14.0 - t * 2.0);',
    '  } else if (tmpl < 5.5) {',
    '    float arms = 2.0 + floor(s2 * 4.0);',
    '    v = smoothstep(0.2, 1.0, sin(arms * (a - 2.5 * log(r + 0.03)) - t * 0.6)) * (1.0 - r) + exp(-r * r * 25.0);',
    '  } else if (tmpl < 6.5) {',
    '    vec2 w = qq * (5.0 + s2 * 6.0) + vec2(sin(qq.y * 4.0 + t), cos(qq.x * 4.0 - t)) * 0.6;',
    '    v = step(0.0, sin(w.x * PI) * sin(w.y * PI));',
    '  } else {',
    '    float rays = 8.0 + floor(s2 * 16.0);',
    '    v = pow(abs(cos(a * rays * 0.5 + t * 0.4)), 12.0) * (1.2 - r) + exp(-r * 8.0) * 0.8;',
    '  }',
    '  v = clamp(v, 0.0, 1.5);',
    '  vec3 col = mix(c1 * 0.12, mix(c1, c2, smoothstep(0.0, 1.0, r)), clamp(v, 0.0, 1.0));',
    '  alb = col * 0.45;',
    '  emit = col * 0.9 * v + c1 * 0.05;',
    '  gloss = 0.8;',
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
    'uniform float uK;',
    'uniform float uGlitch;',
    'uniform vec2 uLook;',
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
    '    if (uGlitch > 0.0) {',
    '      float gh = hash2(vec2(floor(p.y * 14.0), floor(uTime * 7.0)));',
    '      float off = step(0.9, gh) * (gh - 0.9) * 4.0 * uGlitch;',
    '      q.x += off; d = uRot * vec3(n.x + off, n.y, n.z);',
    '    }',
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
    'uniform sampler2D tScene, tPrev;',
    'uniform vec2 uRes, uCenter, uSwirlC;',
    'uniform float uCA, uShatter, uSeed, uTime, uSwirl, uKaleido, uFeedback, uGlitch, uDream;',
    'vec3 hueRot(vec3 c, float a) {',
    '  vec3 y = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;',
    '  float h = atan(y.z, y.y) + a, ch = length(y.yz);',
    '  y.y = ch * cos(h); y.z = ch * sin(h);',
    '  return mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * y;',
    '}',
    'vec2 hash22(vec2 p) {',
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
    '  return fract(sin(p) * 43758.5453);',
    '}',
    'vec3 sampleCA(vec2 uv) {',
    '  vec2 cd = uv - 0.5; float k = uCA * 0.014;',
    '  return vec3(texture2D(tScene, uv + cd * k).r, texture2D(tScene, uv).g, texture2D(tScene, uv - cd * k).b);',
    '}',
    'void main() {',
    '  vec2 uv = vUv;',
    '  vec2 asp = vec2(uRes.x / uRes.y, 1.0);',
    // level 5: the screen twists into a whirlpool around the hit
    '  if (uSwirl > 0.001) {',
    '    vec2 p = (uv - uSwirlC) * asp;',
    '    float r = length(p);',
    '    float ang = uSwirl * exp(-r * 2.0) * (1.0 + 0.25 * sin(uTime * 5.0 - r * 12.0));',
    '    uv = rot2(ang) * p / asp + uSwirlC;',
    '  }',
    '  if (uDream > 0.001) {',
    '    vec2 p = uv * asp * 2.5;',
    '    float n1 = fbm3(vec3(p, uTime * 0.25)), n2 = fbm3(vec3(p + 5.2, uTime * 0.25));',
    '    uv += (vec2(n1, n2) - 0.5) * 0.16 * uDream;',
    '    uv.y += pow(fbm3(vec3(uv.x * 7.0, 1.0, uTime * 0.15)), 2.0) * 0.12 * uDream;',
    '  }',
    '  float checker = 0.0, shuffle = 0.0;',
    '  if (uGlitch > 0.001) {',
    '    float seed = floor(uTime * 12.0);',
    '    float bandY = floor(uv.y * 28.0);',
    '    if (hash2(vec2(bandY, seed)) < 0.3 * uGlitch) uv.x += (hash2(vec2(bandY, seed + 1.0)) - 0.5) * 0.3 * uGlitch;',
    '    vec2 bs = vec2(16.0, 9.0) * (1.0 + floor(hash2(vec2(seed, 2.0)) * 3.0));',
    '    vec2 bid = floor(uv * bs);',
    '    float hb = hash2(bid + seed * 1.7);',
    '    if (hb < 0.22 * uGlitch) uv += (vec2(hash2(bid + seed + 3.0), hash2(bid + seed + 5.0)) - 0.5) * 0.25 * uGlitch;',
    '    else if (hb < 0.3 * uGlitch) uv.y = (bid.y + 0.5) / bs.y + (uv.y - (bid.y + 0.5) / bs.y) * 0.05;',
    '    else if (hb < 0.36 * uGlitch) checker = 1.0;',
    '    else if (hb < 0.42 * uGlitch) shuffle = 1.0;',
    '  }',
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
    '  vec3 col = sampleCA(uv);',
    // level 6: six-way kaleidoscope mirror, slowly turning
    '  if (uKaleido > 0.001) {',
    '    vec2 p = (uv - 0.5) * asp;',
    '    float r = length(p), a = atan(p.y, p.x) + uTime * 0.4;',
    '    float seg = TAU / 6.0;',
    '    a = abs(mod(a, seg) - seg * 0.5);',
    '    vec2 kuv = vec2(cos(a), sin(a)) * r / asp + 0.5;',
    '    col = mix(col, sampleCA(kuv), clamp(uKaleido, 0.0, 1.0));',
    '  }',
    '  col = col * (1.0 - seam) + edgeCol;',
    '  if (checker > 0.5) {',
    '    vec2 px = vUv * uRes;',
    '    float ck = mod(floor(px.x / 7.0) + floor(px.y / 7.0), 2.0);',
    '    col = mix(col, vec3(ck) * vec3(1.0, 0.9, 0.95), 0.8);',
    '  }',
    '  if (shuffle > 0.5) col = col.brg;',
    '  if (uDream > 0.001) {',
    '    vec3 ghost = sampleCA(2.0 * uSwirlC - uv);',
    '    col = mix(col, max(col, ghost), 0.5 * uDream);',
    '    col = mix(col, hueRot(col, uTime * 1.3), 0.6 * min(1.0, uDream));',
    '  }',
    // level 6: feedback - the last frame echoes back, zoomed, turned and hue-shifted
    '  if (uFeedback > 0.001) {',
    '    vec2 p = (vUv - 0.5) * asp;',
    '    p = rot2(0.03) * p * 0.965;',
    '    vec3 prev = texture2D(tPrev, p / asp + 0.5).rgb;',
    '    prev = mix(prev, prev.gbr, 0.12);',
    '    col = max(col, prev * uFeedback * 0.9);',
    '  }',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  S.copyFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D tSrc;',
    'void main() { gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0); }'
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
