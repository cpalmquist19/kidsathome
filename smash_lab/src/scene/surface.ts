import { Color, DoubleSide, ShaderMaterial, Vector3, Vector4 } from 'three';
import type { Look } from './looks';
import { NOISE_GLSL } from './noise';

/** Direction TO the sun, shared by every shader. Low elevation so craters read as relief. */
export const SUN_DIR = new Vector3(-0.78, 0.38, 0.5).normalize();

const VERT = /* glsl */ `
attribute vec3 aBase;
attribute float aHeat;
attribute float aAO;
attribute float aRho;
attribute float aInner;
varying float vInner;
varying vec3 vW;
varying vec3 vN;
varying vec3 vBase;
varying float vHeat;
varying float vAO;
varying float vRho;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
  vBase = aBase;
  vHeat = aHeat;
  vAO = aAO;
  vRho = aRho;
  vInner = aInner;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uSun;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uNoiseScale;
uniform float uBump;
uniform float uSpec;
uniform float uShine;
uniform float uMetal;
uniform float uHeat;      // global multiplier on the heat attribute (cooling over time)
uniform float uHeatAdd;   // extra uniform heat (for whole bodies)
uniform float uTime;
uniform float uEdge;      // fade the patch out towards this arc radius
uniform vec3 uScarDir;
uniform float uScarAng;
uniform float uScarHeat;
uniform float uCharMix;
uniform int uPlanet;       // 0 generic, 1 Earth, 2 Moon, 3 Mars, 4 Pluto, 5 gas giant, 6 ice giant, 9 black hole
uniform float uEmissive;   // 1 = shines by itself (stars)
uniform vec3 uCenter;      // body centre in the same space as aBase
varying vec3 vW;
varying vec3 vN;
varying vec3 vBase;
varying float vHeat;
varying float vAO;
varying float vRho;
varying float vInner;
uniform vec3 uInner;
uniform vec4 uBubble;         // Anti-Bubble: xyz centre, w radius. Everything inside is deleted.
uniform float uStrangeAmt;    // 0..1, strange matter on or off
uniform vec3 uStrangeOrigin;  // where the change starts
uniform float uStrangeFront;  // how far it has spread
${NOISE_GLSL}
void main() {
  if (uBubble.w > 0.0 && distance(vW, uBubble.xyz) < uBubble.w) discard;
  vec3 p = vBase * uNoiseScale;
  float n1 = fbm(p);
  float n2 = fbm(p * 3.7 + 11.0);
  float h = n1 * 0.7 + n2 * 0.3;
  float nIn = 0.0;
  if (vInner > 0.5) nIn = fbm(vBase * 14.0);
  h = mix(h, nIn, step(0.5, vInner));
  vec3 albedo = mix(uColorA, uColorB, smoothstep(0.3, 0.7, n1 * 0.65 + n2 * 0.35));

  float oceanMask = 0.0;
  float bumpK = 1.0;
  vec3 atmo = vec3(0.0);
  if (uPlanet > 0) {
    vec3 d = normalize(vBase - uCenter);
    float lat = abs(d.y);
    float rough = fbm(d * 9.0);
    if (uPlanet == 1) {
      float warp = fbm(d * 3.0 + vec3(3.1, 1.7, 5.3));
      float n = fbm(d * 2.4 + warp * 0.9 + 4.0);
      float land = smoothstep(0.50, 0.53, n);
      float moist = fbm(d * 3.0 + 9.0);
      vec3 desert = vec3(0.30, 0.22, 0.10);
      vec3 forest = vec3(0.025, 0.10, 0.025);
      vec3 grass = vec3(0.08, 0.17, 0.04);
      float wet = smoothstep(0.38, 0.55, moist + 0.25 * (1.0 - lat * 1.4));
      vec3 landC = mix(desert, mix(grass, forest, smoothstep(0.45, 0.7, moist)), wet);
      landC = mix(landC, vec3(0.2, 0.18, 0.15), smoothstep(0.58, 0.7, n) * smoothstep(0.4, 0.7, rough));
      vec3 ocean = mix(vec3(0.02, 0.11, 0.22), vec3(0.004, 0.02, 0.09), 1.0 - smoothstep(0.38, 0.5, n));
      albedo = mix(ocean, landC, land);
      float ice = smoothstep(0.80, 0.88, lat + 0.07 * (rough - 0.5));
      albedo = mix(albedo, vec3(0.75, 0.78, 0.8), ice);
      float cloud = smoothstep(0.52, 0.72, fbm(d * 3.2 + vec3(7.0, 2.0, 1.0) + warp)) * (1.0 - 0.3 * ice);
      albedo = mix(albedo, vec3(0.8), cloud * 0.85);
      oceanMask = (1.0 - land) * (1.0 - ice) * (1.0 - cloud);
      bumpK = land * (1.0 - cloud) * 0.25;
      atmo = vec3(0.18, 0.4, 1.0);
    } else if (uPlanet == 2) {
      float maria = smoothstep(0.52, 0.6, fbm(d * 1.7 + 2.0));
      albedo = vec3(0.30) * (0.75 + 0.5 * rough) * mix(1.0, 0.5, maria);
      albedo *= 0.85 + 0.3 * fbm(d * 24.0);
      bumpK = 0.6;
    } else if (uPlanet == 3) {
      float dark = smoothstep(0.45, 0.62, fbm(d * 2.0 + 5.0));
      albedo = mix(vec3(0.5, 0.22, 0.10), vec3(0.22, 0.11, 0.07), dark) * (0.8 + 0.4 * rough);
      albedo = mix(albedo, vec3(0.8), smoothstep(0.9, 0.95, lat));
      bumpK = 0.4;
      atmo = vec3(0.5, 0.25, 0.15) * 0.35;
    } else if (uPlanet == 5) {
      // Banded gas giant: latitude stripes wobbled by noise, plus one big storm.
      float warp = fbm(d * vec3(2.0, 5.0, 2.0) + 3.0);
      float band = sin((d.y + 0.10 * warp) * 17.0 + 3.5 * fbm(d * vec3(2.5, 1.2, 2.5)));
      float fine = fbm(d * vec3(4.0, 22.0, 4.0));
      float t = smoothstep(-0.7, 0.7, band + 0.9 * (fine - 0.5));
      albedo = mix(uColorB, uColorA, t) * (0.85 + 0.3 * rough);
      vec3 spot = normalize(vec3(0.62, -0.28, 0.73));
      float storm = smoothstep(0.2, 0.06, length(d - spot) * (1.0 + 0.5 * abs(d.y + 0.28)));
      albedo = mix(albedo, uColorB * vec3(1.25, 0.75, 0.65), storm * 0.85);
      bumpK = 0.0;
      atmo = uColorA * 0.3;
    } else if (uPlanet == 6) {
      // Smooth ice giant: faint broad bands and a hazy limb.
      float band = 0.5 + 0.35 * sin(d.y * 7.0 + 2.0 * fbm(d * 2.0 + 1.0)) + 0.25 * (fbm(d * vec3(3.0, 9.0, 3.0)) - 0.5);
      albedo = mix(uColorB, uColorA, smoothstep(0.2, 0.85, band));
      bumpK = 0.0;
      atmo = uColorA * 0.55;
    } else if (uPlanet >= 9) {
      albedo = vec3(0.0);
      bumpK = 0.0;
    } else {
      float heart = smoothstep(0.5, 0.62, fbm(d * 1.5 + 8.0));
      albedo = mix(vec3(0.42, 0.30, 0.22), vec3(0.8, 0.74, 0.66), heart) * (0.8 + 0.4 * rough);
      albedo = mix(albedo, vec3(0.2, 0.12, 0.09), smoothstep(0.16, 0.0, lat) * 0.6);
      bumpK = 0.3;
    }
  }

  if (vInner > 0.5) albedo = uInner * (0.45 + 0.5 * nIn) * 0.8;

  float scar = 0.0;
  if (uScarAng > 0.0) {
    float ang = acos(clamp(dot(normalize(vBase), uScarDir), -1.0, 1.0));
    scar = 1.0 - smoothstep(uScarAng * 0.75, uScarAng * 1.2, ang);
    albedo *= 1.0 - 0.6 * scar;
  }

  vec3 N = normalize(vN);
  vec3 sx = dFdx(vW);
  vec3 sy = dFdy(vW);
  vec3 r1 = cross(sy, N);
  vec3 r2 = cross(N, sx);
  float det = dot(sx, r1);
  float limb = smoothstep(0.02, 0.4, dot(N, normalize(cameraPosition - vW)));
  vec3 grad = sign(det) * limb * bumpK * (uBump * dFdx(h) * r1 + uBump * dFdy(h) * r2);
  vec3 Np = normalize(abs(det) * N - grad);

  vec3 L = normalize(uSun);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = max(dot(Np, L), 0.0);
  float terminator = smoothstep(0.0, 0.12, dot(N, L));
  vec3 H = normalize(L + V);
  float specAmt = mix(uSpec, 0.9, oceanMask) * mix(1.0, 0.3, step(0.5, vInner));
  float shineV = mix(uShine, 120.0, oceanMask);
  float spec = pow(max(dot(Np, H), 0.0), shineV) * specAmt * ndl * terminator;

  float ndv = max(dot(N, V), 0.0);
  float heat = vHeat * uHeat + uHeatAdd + uScarHeat * scar;
  albedo *= 1.0 - 0.55 * clamp(heat, 0.0, 1.0) * uCharMix;

  vec3 sky = vec3(0.09, 0.11, 0.16) * (0.55 + 0.45 * N.y);
  vec3 col = albedo * (sky + vec3(1.55, 1.5, 1.4) * ndl * terminator) * vAO;
  col += spec * mix(vec3(1.0), albedo * 2.0, uMetal) * vec3(1.55, 1.5, 1.4);

  col += atmo * pow(1.0 - ndv, 3.0) * (0.1 + 1.2 * smoothstep(-0.15, 0.4, dot(N, L)));

  if (heat > 0.001) {
    float flicker = 0.75 + 0.5 * fbm(p * 1.3 + vec3(0.0, uTime * 0.35, 0.0));
    col += heatColor(heat * flicker);
  }

  if (uEmissive > 0.5) {
    // A star shines by itself: churning granulation, darker towards the edge of the disc.
    float gran = fbm(vBase * uNoiseScale * 2.5 + vec3(0.0, uTime * 0.05, 0.0));
    float cells = smoothstep(0.3, 0.75, n1 * 0.45 + gran * 0.55);
    vec3 e = mix(uColorB, uColorA, cells);
    col = e * (0.45 + 0.75 * pow(max(ndv, 0.0), 0.6)) * 1.1;
  }
  if (uPlanet == 9) {
    // Black hole: nothing but the bent light of a hot ring hugging the edge of the disc.
    float rim = pow(1.0 - ndv, 6.0);
    col = vec3(1.0, 0.55, 0.18) * rim * 3.5 + vec3(1.0, 0.85, 0.6) * pow(1.0 - ndv, 18.0) * 3.0;
  }

  if (uPlanet >= 10) {
    // Things made of light: galaxies, star clusters, whole superclusters and nebulae, drawn as glowing discs.
    vec3 d = normalize(vBase - uCenter);
    float rim = smoothstep(0.0, 0.5, ndv);
    vec3 g = vec3(0.0);
    if (uPlanet == 10) {
      vec3 ax = normalize(vec3(0.0, 0.3, 0.95));
      vec3 u = normalize(cross(ax, vec3(0.0, 1.0, 0.0)));
      vec3 w = cross(ax, u);
      float x = dot(d, u);
      float y = dot(d, w);
      float r = length(vec2(x, y));
      float th = atan(y, x);
      float arms = pow(0.5 + 0.5 * cos(2.0 * (th - 5.5 * log(r + 0.08))), 1.4);
      float dust = fbm(vec3(x, y, 0.0) * 7.0 + 1.0);
      float disc = 1.0 - smoothstep(0.5, 0.95, r);
      float bulge = exp(-r * r * 20.0);
      float field = pow(fbm(d * 70.0), 5.0) * 6.0 * disc;
      g = uColorB * arms * disc * (0.35 + 1.0 * dust) + uColorA * bulge * 2.2 + uColorA * field;
    } else if (uPlanet == 11) {
      float web = fbm(d * 5.0 + 3.0);
      float specks = smoothstep(0.66, 0.74, fbm(d * 28.0)) + 0.6 * smoothstep(0.7, 0.78, fbm(d * 55.0 + 4.0));
      g = uColorB * (0.5 + 2.2 * web) + uColorA * specks * (0.4 + 1.6 * web);
    } else {
      vec3 q = d * 3.2;
      float wisp = fbm(q + fbm(q * 2.0 + 3.0) * 1.6);
      float gas = smoothstep(0.25, 0.75, wisp);
      float stars = smoothstep(0.78, 0.84, fbm(d * 45.0)) * 1.5;
      g = mix(uColorB, uColorA, gas) * (0.25 + 1.5 * gas) + vec3(1.0, 0.95, 0.9) * stars;
    }
    col = g * rim;
    if (heat > 0.001) col += heatColor(heat * 0.7);
  }

  if (uStrangeAmt > 0.0) {
    float f = max(uStrangeFront, 1e-6);
    float dd = distance(vW, uStrangeOrigin);
    float inside = uStrangeAmt * (1.0 - smoothstep(0.85 * f, f, dd));
    float web = fbm(vBase * uNoiseScale * 3.0 + vec3(0.0, uTime * 0.15, 0.0));
    vec3 green = vec3(0.04, 0.95, 0.28) * (0.5 + 1.2 * web) + vec3(0.2, 0.5, 0.25) * pow(web, 3.0);
    float front = exp(-pow((dd - f) / (0.04 * f + 1e-5), 2.0)) * uStrangeAmt * step(0.0001, uStrangeFront);
    col = mix(col, green, clamp(inside, 0.0, 1.0)) + vec3(0.3, 1.2, 0.5) * front;
  }
  float edge = 1.0 - smoothstep(uEdge * 0.7, uEdge, vRho);
  col *= edge;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface SurfaceOptions {
  /** 0 generic rock, 1 Earth, 2 Moon, 3 Mars, 4 Pluto. */
  planet?: number;
  /** Body centre in the geometry's aBase space (default: origin). */
  center?: Vector3;
  /** Arc radius at which the patch fades to black. Huge disables the fade. */
  edge?: number;
}

export function makeSurfaceMaterial(look: Look, options: SurfaceOptions = {}): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    side: DoubleSide,
    uniforms: {
      uSun: { value: SUN_DIR.clone() },
      uColorA: { value: look.colorA.clone() },
      uColorB: { value: look.colorB.clone() },
      uNoiseScale: { value: look.noiseScale },
      uBump: { value: look.bump },
      uSpec: { value: look.spec },
      uShine: { value: look.shine },
      uMetal: { value: look.metal },
      uHeat: { value: 0 },
      uHeatAdd: { value: 0 },
      uTime: { value: 0 },
      uEdge: { value: options.edge ?? 1e9 },
      uScarDir: { value: new Vector3(0, 1, 0) },
      uScarAng: { value: 0 },
      uScarHeat: { value: 0 },
      uCharMix: { value: 1 },
      uPlanet: { value: options.planet ?? 0 },
      uEmissive: { value: look.emissive },
      uInner: { value: look.inner.clone() },
      uCenter: { value: options.center?.clone() ?? new Vector3() },
      uBubble: { value: new Vector4(0, 0, 0, 0) },
      uStrangeAmt: { value: 0 },
      uStrangeOrigin: { value: new Vector3() },
      uStrangeFront: { value: 0 },
    },
  });
}

export { Color };
