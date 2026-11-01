import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, IcosahedronGeometry, InstancedBufferAttribute,
  InstancedBufferGeometry, Mesh, Points, ShaderMaterial, Vector3,
} from 'three';
import type { Object3D } from 'three';
import { MATERIALS, SEVERITY } from '../sim';
import { lookFor } from './looks';
import { NOISE_GLSL, mulberry32 } from './noise';
import { SUN_DIR } from './surface';
import type { ShotPlan } from './planner';

export interface DebrisQuality {
  dust: number;
  fire: number;
  chunks: number;
}

export const QUALITY_HIGH: DebrisQuality = { dust: 3500, fire: 1400, chunks: 110 };
export const QUALITY_LOW: DebrisQuality = { dust: 1200, fire: 500, chunks: 50 };

/** Gravity in local units per second squared (a presentation choice, not physical). */
export const G_LOCAL = 6;
/** Seconds the local approach takes (slow motion). */
export const APPROACH_TIME = 0.9;

interface Particle {
  p: Vector3;
  v: Vector3;
  size: number;
  delay: number;
  life: number;
  heat: number;
  tint: number; // 0 = surface colour, 1 = impactor colour
}
interface Chunk extends Particle {
  spin: Vector3;
  spinRate: number;
  seed: number;
}

const GROUND_GLSL = /* glsl */ `
uniform float uRs;
float groundAt(vec2 xz) {
  if (uRs > 1e4) return 0.0;
  return -uRs + sqrt(max(uRs * uRs - dot(xz, xz), 0.0));
}
vec3 flight(vec3 p0, vec3 v, float t, float lift, out float landed) {
  float gnd = 0.0;
  float tl = 0.0;
  for (int k = 0; k < 3; k++) {
    float y0 = p0.y - gnd - lift;
    tl = (v.y + sqrt(max(v.y * v.y + 2.0 * uG * y0, 0.0))) / uG;
    gnd = groundAt(p0.xz + v.xz * tl);
  }
  float te = min(t, tl);
  vec3 p = p0 + v * te;
  p.y = p0.y + v.y * te - 0.5 * uG * te * te;
  float slide = max(t - te, 0.0);
  p.xz += v.xz * 0.3 * (1.0 - exp(-slide / 0.4));
  p.y = max(p.y, groundAt(p.xz) + lift);
  landed = t - tl;
  return p;
}
`;

const POINT_VERT = /* glsl */ `
attribute vec3 aP0;
attribute vec3 aV;
attribute vec4 aA; // size, delay, life, heat
attribute float aTint;
uniform float uT;
uniform float uG;
uniform float uPixelScale;
varying float vHeat;
varying float vAlpha;
varying float vTint;
${GROUND_GLSL}
void main() {
  float t = uT - aA.y;
  float landed;
  vec3 p = flight(aP0, aV, max(t, 0.0), 0.0, landed);
  float alive = step(0.0, t) * (1.0 - step(aA.z, t));
  vAlpha = alive * (1.0 - smoothstep(aA.z * 0.7, aA.z, t));
  vHeat = aA.w * exp(-max(t, 0.0) / (0.5 + 1.8 * aA.w));
  vTint = aTint;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(aA.x * uPixelScale / max(-mv.z, 1e-4), 0.0, 48.0) * alive;
  gl_Position = projectionMatrix * mv;
}
`;

const POINT_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vHeat;
varying float vAlpha;
varying float vTint;
${NOISE_GLSL}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0 || vAlpha <= 0.001) discard;
  // Gaussian falloff: overlapping puffs blend into one glowing cloud instead of showing hard-edged discs.
  float soft = exp(-d * d * 4.0) * (1.0 - d * d);
  #ifdef ADDITIVE
    vec3 col = heatColor(vHeat + 0.25) * soft * 0.7;
    gl_FragColor = vec4(col * vAlpha, 1.0);
  #else
    vec3 base = mix(uColorA, uColorB, vTint) * 0.85;
    vec3 col = base + heatColor(vHeat) * 0.3;
    gl_FragColor = vec4(col, soft * vAlpha * 0.8);
  #endif
}
`;

const CHUNK_VERT = /* glsl */ `
attribute vec3 aP0;
attribute vec3 aV;
attribute vec4 aSpin;   // axis xyz, rate
attribute vec4 aInfo;   // scale, delay, heat, seed
attribute float aTint;
uniform float uT;
uniform float uG;
varying vec3 vW;
varying vec3 vObj;
varying float vHeat;
varying float vTint;
varying float vSeed;
${GROUND_GLSL}
${NOISE_GLSL}
vec3 rotate(vec3 v, vec3 axis, float ang) {
  float c = cos(ang);
  float s = sin(ang);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}
void main() {
  float t = uT - aInfo.y;
  float landed;
  float sc = aInfo.x * step(0.0, t);
  vec3 p = flight(aP0, aV, max(t, 0.0), sc * 0.55, landed);
  float onGround = max(landed, 0.0);
  float ang = aSpin.w * (max(t, 0.0) - onGround + 0.25 * (1.0 - exp(-onGround / 0.3)));
  vec3 axis = normalize(aSpin.xyz);
  vec3 lp = position * (0.72 + 0.56 * hash13(position * 3.1 + aInfo.w));
  vec3 r = rotate(lp, axis, ang) * sc;
  vec3 wp = p + r;
  vW = wp;
  vObj = lp;
  vHeat = aInfo.z * exp(-max(t, 0.0) / (0.6 + 1.6 * aInfo.z));
  vTint = aTint;
  vSeed = aInfo.w;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;

const CHUNK_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uSun;
varying vec3 vW;
varying vec3 vObj;
varying float vHeat;
varying float vTint;
varying float vSeed;
${NOISE_GLSL}
void main() {
  vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
  if (dot(N, cameraPosition - vW) < 0.0) N = -N;
  float n = fbm(vObj * 5.0 + vSeed);
  vec3 albedo = mix(uColorA, uColorB, vTint) * (0.55 + 0.7 * n);
  float ndl = max(dot(N, normalize(uSun)), 0.0);
  vec3 col = albedo * (vec3(0.05, 0.065, 0.1) + vec3(1.55, 1.5, 1.4) * ndl);
  col += heatColor(vHeat * (0.8 + 0.4 * n));
  gl_FragColor = vec4(col, 1.0);
}
`;

function rotatedRandomDir(rng: () => number): Vector3 {
  const u = rng() * 2 - 1;
  const a = rng() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return new Vector3(s * Math.cos(a), u, s * Math.sin(a));
}

/** All particles and chunks for one shot. Pure data; built once, played back analytically. */
export function buildDebris(plan: ShotPlan, quality: DebrisQuality, skipBurstChunks = false): { dust: Particle[]; fire: Particle[]; chunks: Chunk[] } {
  const rng = mulberry32(0x9e3779b9 ^ Math.floor(plan.unit * 1e9));
  const dust: Particle[] = [];
  const fire: Particle[] = [];
  const chunks: Chunk[] = [];

  const R = plan.deform.radius;
  const ri = plan.riLocal;
  const rScale = Math.max(R, ri, 0.3);
  const so = plan.surfaceOutcome;
  const io = plan.impactorOutcome;
  const cosA = Math.cos((plan.angleDeg * Math.PI) / 180);
  const downrange = new Vector3(plan.dir[0], 0, 0).normalize();
  const approachSpeed = plan.local.startDistance / APPROACH_TIME;
  const contactPoint = new Vector3(0, ri, 0);

  const pushChunk = (pos: Vector3, vel: Vector3, size: number, delay: number, heat: number, tint: number): void => {
    chunks.push({
      p: pos, v: vel, size, delay, life: 99, heat, tint,
      spin: rotatedRandomDir(rng), spinRate: (rng() - 0.5) * 14, seed: rng() * 50,
    });
  };

  // A) Ejecta thrown out of the crater (or dent).
  const ejectaShare = plan.deform.kind === 'crater' ? 1 : plan.deform.kind === 'dent' ? 0.12 : 0;
  const nEject = Math.round(quality.dust * ejectaShare);
  const rimRadius = Math.max(R, 0.25);
  for (let i = 0; i < nEject; i++) {
    let psi = 0;
    for (let tries = 0; tries < 8; tries++) {
      psi = rng() * Math.PI * 2;
      if (rng() * 1.6 < 1 + 0.6 * cosA * Math.cos(psi)) break;
    }
    const u = rng();
    const r0 = rimRadius * (0.2 + 0.7 * rng());
    const alpha = ((38 + 32 * rng()) * Math.PI) / 180;
    const range = rimRadius * (0.7 + 3.4 * Math.pow(u, 1.7));
    const speed = Math.sqrt((range * G_LOCAL) / Math.sin(2 * alpha));
    const hv = speed * Math.cos(alpha);
    const hot = rng() < so.glow * 0.8 ? so.glow * (0.4 + 0.5 * rng()) : 0;
    dust.push({
      p: new Vector3(r0 * Math.cos(psi), 0.02, r0 * Math.sin(psi)),
      v: new Vector3(hv * Math.cos(psi), speed * Math.sin(alpha), hv * Math.sin(psi)),
      size: rScale * (0.012 + 0.032 * rng()) * (0.6 + u),
      delay: 0.02 + 0.3 * rng() * (r0 / rimRadius),
      life: 9 + 3 * rng(),
      heat: hot,
      tint: 0,
    });
  }
  // Big blocks in the ejecta of a crater.
  if (plan.deform.kind === 'crater') {
    const nBlocks = Math.min(quality.chunks / 2, 10 + Math.round(8 * Math.log10(1 + so.stressRatio)));
    for (let i = 0; i < nBlocks; i++) {
      const psi = rng() * Math.PI * 2;
      const range = rimRadius * (0.9 + 1.8 * rng());
      const alpha = ((45 + 20 * rng()) * Math.PI) / 180;
      const speed = Math.sqrt((range * G_LOCAL) / Math.sin(2 * alpha));
      pushChunk(
        new Vector3(rimRadius * 0.6 * Math.cos(psi), 0.05, rimRadius * 0.6 * Math.sin(psi)),
        new Vector3(speed * Math.cos(alpha) * Math.cos(psi), speed * Math.sin(alpha), speed * Math.cos(alpha) * Math.sin(psi)),
        rScale * (0.025 + 0.06 * rng()), 0.04 + 0.2 * rng(), so.glow * rng() * 0.7, 0,
      );
    }
  }

  // Sparks / incandescent spray for hot impacts or things that catch fire.
  const hotness = Math.max(so.glow, io.glow);
  if (hotness > 0.12 || so.ignites || io.ignites) {
    const nSpark = Math.round(quality.fire * 0.35 * Math.max(hotness, io.ignites || so.ignites ? 0.5 : 0));
    for (let i = 0; i < nSpark; i++) {
      const d = rotatedRandomDir(rng);
      d.y = Math.abs(d.y) * 0.9 + 0.1;
      const speed = (3 + 11 * rng()) * (0.6 + hotness);
      fire.push({
        p: new Vector3(0, ri * 0.8, 0),
        v: d.multiplyScalar(speed),
        size: rScale * (0.015 + 0.03 * rng()),
        delay: 0.01 + 0.15 * rng(),
        life: 1.2 + 1.8 * rng(),
        heat: 0.7 + 0.7 * rng(),
        tint: 0,
      });
    }
  }

  // B) What happens to the impactor.
  const burst = (center: Vector3, radius: number, fate: 'crack' | 'shatter' | 'vaporize', fragments: number, glow: number, tint: number, outward: number): void => {
    if (fate === 'vaporize') {
      const nGas = Math.round(quality.fire * 1.1);
      for (let i = 0; i < nGas; i++) {
        const d = rotatedRandomDir(rng);
        d.y = Math.abs(d.y) * 0.8 + 0.2;
        const speed = outward * (0.3 + 1.2 * rng());
        fire.push({
          p: center.clone().addScaledVector(d, radius * 0.5 * rng()),
          v: d.multiplyScalar(speed),
          size: Math.max(radius, 0.25) * (0.07 + 0.2 * rng() * rng()),
          delay: 0.01 + 0.1 * rng(),
          life: 1.4 + 2.4 * rng(),
          heat: 0.5 + 0.9 * rng() * Math.max(glow, 0.6),
          tint,
        });
      }
      return;
    }
    const nChunks = skipBurstChunks ? 0 : fate === 'crack'
      ? Math.min(14, Math.max(5, Math.round(fragments * 0.7)))
      : Math.min(quality.chunks, Math.max(18, fragments));
    for (let i = 0; i < nChunks; i++) {
      const d = rotatedRandomDir(rng);
      d.y = Math.abs(d.y) * 0.9 + 0.1;
      const speed = outward * (0.15 + 0.85 * rng());
      const size = radius * (fate === 'crack' ? 0.16 + 0.14 * rng() : 0.07 + 0.2 * Math.pow(rng(), 2.2));
      const pos = center.clone().addScaledVector(rotatedRandomDir(rng), radius * 0.6 * rng());
      pos.y = Math.max(pos.y, 0.05 + size);
      const vel = d.multiplyScalar(speed).addScaledVector(downrange, speed * 0.35 * cosA);
      pushChunk(pos, vel, size, 0.01 + 0.05 * rng(), glow * rng(), tint);
    }
    const nDust = Math.round(quality.dust * (fate === 'crack' ? 0.08 : 0.3));
    for (let i = 0; i < nDust; i++) {
      const d = rotatedRandomDir(rng);
      d.y = Math.abs(d.y) * 0.9 + 0.1;
      dust.push({
        p: center.clone().addScaledVector(d, radius * 0.4),
        v: d.multiplyScalar(outward * (0.2 + 0.9 * rng())),
        size: Math.max(radius, 0.2) * (0.03 + 0.07 * rng()),
        delay: 0.01 + 0.1 * rng(),
        life: 6 + 3 * rng(),
        heat: glow * rng(),
        tint,
      });
    }
  };

  const impactorFate = plan.impactorFate;
  if (impactorFate === 'crack' || impactorFate === 'shatter' || impactorFate === 'vaporize') {
    const outward = Math.max(2.5, approachSpeed * (impactorFate === 'vaporize' ? 2.2 : 0.8));
    burst(contactPoint, ri, impactorFate, io.suggestedFragments, io.glow, 1, outward);
  } else if (plan.impactorFate === 'embed') {
    for (let i = 0; i < Math.round(quality.dust * 0.08); i++) {
      const psi = rng() * Math.PI * 2;
      dust.push({
        p: new Vector3(ri * 0.6 * Math.cos(psi), 0.02, ri * 0.6 * Math.sin(psi)),
        v: new Vector3(Math.cos(psi) * (1 + 3 * rng()), 1.5 + 3 * rng(), Math.sin(psi) * (1 + 3 * rng())),
        size: ri * (0.03 + 0.05 * rng()),
        delay: 0.02 + 0.1 * rng(), life: 5, heat: 0, tint: 0,
      });
    }
  }

  // Two bodies fusing throw a spray of hot gas and melt out of the contact zone.
  if (plan.merge) {
    const mg = plan.merge.glow;
    const rr = Math.max(ri, plan.patchIsWholeSphere ? 0.5 * plan.rsLocal : ri);
    burst(contactPoint, rr, 'vaporize', 40, mg, 0, Math.max(1.5, approachSpeed * 0.45));
  }

  // C) A small surface body that breaks apart or boils away.
  if (plan.surfaceDestroyed) {
    const rs = plan.rsLocal;
    const surfaceBehavior = MATERIALS[plan.surface.material].behavior;
    const fate = so.regime === 'vaporize' || surfaceBehavior === 'fluid' || surfaceBehavior === 'hole' ? 'vaporize' : 'shatter';
    burst(new Vector3(0, -rs, 0).add(new Vector3(0, 0.6 * rs, 0)), rs, fate, so.suggestedFragments, so.glow, 0, Math.max(2.5, approachSpeed * 0.7));
  } else if (!plan.merge && SEVERITY[so.regime] >= SEVERITY.fracture && plan.deform.kind !== 'crater') {
    // D) Chips flying off a cracked body.
    const nChips = Math.min(12, Math.max(4, Math.round(so.suggestedFragments * 0.6)));
    for (let i = 0; i < nChips; i++) {
      const psi = rng() * Math.PI * 2;
      const speed = 2 + 4 * rng();
      pushChunk(
        new Vector3(0.3 * ri * Math.cos(psi), 0.05, 0.3 * ri * Math.sin(psi)),
        new Vector3(speed * Math.cos(psi), 2 + 4 * rng(), speed * Math.sin(psi)),
        ri * (0.1 + 0.12 * rng()), 0.02 + 0.08 * rng(), so.glow * rng(), 0,
      );
    }
  }
  return { dust, fire, chunks };
}

function pointGeometry(list: Particle[]): BufferGeometry {
  const n = list.length;
  const p0 = new Float32Array(n * 3);
  const v = new Float32Array(n * 3);
  const a = new Float32Array(n * 4);
  const tint = new Float32Array(n);
  list.forEach((q, i) => {
    p0.set([q.p.x, q.p.y, q.p.z], i * 3);
    v.set([q.v.x, q.v.y, q.v.z], i * 3);
    a.set([q.size, q.delay, q.life, q.heat], i * 4);
    tint[i] = q.tint;
  });
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aP0', new BufferAttribute(p0, 3));
  g.setAttribute('aV', new BufferAttribute(v, 3));
  g.setAttribute('aA', new BufferAttribute(a, 4));
  g.setAttribute('aTint', new BufferAttribute(tint, 1));
  return g;
}

export class Debris {
  readonly objects: Object3D[] = [];
  private readonly materials: ShaderMaterial[] = [];
  private readonly geometries: BufferGeometry[] = [];

  constructor(plan: ShotPlan, quality: DebrisQuality, skipBurstChunks = false) {
    const { dust, fire, chunks } = buildDebris(plan, quality, skipBurstChunks);
    const surfaceLook = lookFor(plan.surface.material, plan.surface.id);
    const impactorLook = lookFor(plan.impactor.material, plan.impactor.id);
    const common = (): Record<string, { value: unknown }> => ({
      uT: { value: -1 },
      uG: { value: G_LOCAL },
      uRs: { value: plan.rsLocal < 1e4 ? plan.rsLocal : 1e9 },
      uPixelScale: { value: 600 },
      uColorA: { value: surfaceLook.colorA.clone().lerp(new Color(0x000000), 0.1) },
      uColorB: { value: impactorLook.colorA.clone() },
      uSun: { value: SUN_DIR.clone() },
    });

    const makePoints = (list: Particle[], additive: boolean): void => {
      if (list.length === 0) return;
      const geometry = pointGeometry(list);
      const material = new ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: common(),
        transparent: true,
        depthWrite: false,
        ...(additive ? { blending: AdditiveBlending } : {}),
        defines: additive ? { ADDITIVE: '' } : {},
      });
      const points = new Points(geometry, material);
      points.frustumCulled = false;
      points.renderOrder = additive ? 6 : 5;
      this.objects.push(points);
      this.materials.push(material);
      this.geometries.push(geometry);
    };
    makePoints(dust, false);
    makePoints(fire, true);

    if (chunks.length > 0) {
      const base = new IcosahedronGeometry(1, 1);
      const geometry = new InstancedBufferGeometry();
      geometry.index = base.index;
      geometry.setAttribute('position', base.getAttribute('position'));
      geometry.instanceCount = chunks.length;
      const n = chunks.length;
      const p0 = new Float32Array(n * 3);
      const v = new Float32Array(n * 3);
      const spin = new Float32Array(n * 4);
      const info = new Float32Array(n * 4);
      const tint = new Float32Array(n);
      chunks.forEach((c, i) => {
        p0.set([c.p.x, c.p.y, c.p.z], i * 3);
        v.set([c.v.x, c.v.y, c.v.z], i * 3);
        spin.set([c.spin.x, c.spin.y, c.spin.z, c.spinRate], i * 4);
        info.set([c.size, c.delay, c.heat, c.seed], i * 4);
        tint[i] = c.tint;
      });
      geometry.setAttribute('aP0', new InstancedBufferAttribute(p0, 3));
      geometry.setAttribute('aV', new InstancedBufferAttribute(v, 3));
      geometry.setAttribute('aSpin', new InstancedBufferAttribute(spin, 4));
      geometry.setAttribute('aInfo', new InstancedBufferAttribute(info, 4));
      geometry.setAttribute('aTint', new InstancedBufferAttribute(tint, 1));
      const material = new ShaderMaterial({ vertexShader: CHUNK_VERT, fragmentShader: CHUNK_FRAG, uniforms: common(), side: DoubleSide });
      const mesh = new Mesh(geometry, material);
      mesh.frustumCulled = false;
      this.objects.push(mesh);
      this.materials.push(material);
      this.geometries.push(geometry);
    }
  }

  /** `t` = seconds since contact. `pixelScale` = viewport height / (2 tan(fov/2)). */
  update(t: number, pixelScale: number): void {
    for (const m of this.materials) {
      (m.uniforms.uT as { value: number }).value = t;
      (m.uniforms.uPixelScale as { value: number }).value = pixelScale;
    }
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
