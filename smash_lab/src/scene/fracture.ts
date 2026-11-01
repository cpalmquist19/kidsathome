import { BufferAttribute, BufferGeometry, Group, Mesh, Quaternion, ShaderMaterial } from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import { MATERIALS, SEVERITY } from '../sim';
import { APPROACH_TIME, G_LOCAL } from './debris';
import { lookFor } from './looks';
import { mulberry32 } from './noise';
import { buildCollisionMesh } from './patch';
import type { ShotPlan } from './planner';
import { makeSurfaceMaterial } from './surface';
import { fractureSphere, makeSeeds } from './voronoi';
import type { Shard, Vec3 } from './voronoi';

type Rapier = typeof RAPIER;

/** Playback and simulation rate of the baked breakup. */
export const BAKE_FPS = 60;
const SUBSTEPS = 2;

export interface FractureQuality {
  maxShards: number;
}
export const FRACTURE_HIGH: FractureQuality = { maxShards: 64 };
export const FRACTURE_LOW: FractureQuality = { maxShards: 32 };

/** True when this shot should break something into rigid shards. */
export function wantsFracture(plan: ShotPlan): boolean {
  // Gas, stars and black holes do not break into rigid pieces, and nothing can bounce off them.
  if (isFluid(plan.surface) || isFluid(plan.impactor)) return false;
  const impactorBreaks = plan.impactorFate === 'shatter' || plan.impactorFate === 'crack';
  return impactorBreaks || surfaceBreaks(plan);
}
function isFluid(body: { material: keyof typeof MATERIALS }): boolean {
  const b = MATERIALS[body.material].behavior;
  return b === 'fluid' || b === 'hole';
}
function surfaceBreaks(plan: ShotPlan): boolean {
  return plan.surfaceDestroyed && plan.surfaceOutcome.regime !== 'vaporize';
}

let rapierPromise: Promise<Rapier> | null = null;
/** Load the physics engine on first use; it is a separate download. */
export function loadRapier(): Promise<Rapier> {
  rapierPromise ??= import('@dimforge/rapier3d-compat').then(async (m) => {
    await m.default.init();
    return m.default;
  });
  return rapierPromise;
}

interface BodySpec {
  source: 'impactor' | 'surface';
  shards: Shard[];
  /** Sphere radius and centre in local render units. */
  radius: number;
  center: Vec3;
}

export interface FractureBake {
  specs: BodySpec[];
  frames: Float32Array;
  frameCount: number;
  shardCount: number;
}

function shardsFor(
  source: 'impactor' | 'surface', radius: number, center: Vec3, fate: 'crack' | 'shatter', suggested: number,
  contact: Vec3, quality: FractureQuality, seed: number,
): BodySpec {
  const n = fate === 'crack' ? Math.min(14, Math.max(8, suggested)) : Math.min(quality.maxShards, Math.max(18, suggested));
  const gap = 0.45 * Math.cbrt((4 / 3) * Math.PI / n);
  const seeds = makeSeeds(n, contact, fate === 'crack' ? 0.3 : 0.6, gap, mulberry32(seed));
  const shards = fractureSphere({ seeds, radius, detail: n <= 20 ? 3 : 2 });
  return { source, shards, radius, center };
}

/** A step-by-step rigid-body simulation of the breakup; call `step` until it returns true. */
export class FractureSim {
  private readonly world: RAPIER.World;
  private readonly bodies: RAPIER.RigidBody[] = [];
  private readonly centerOfGravity: Vec3 | null;
  private readonly frames: Float32Array;
  private readonly frameCount: number;
  private frame = 0;
  private freed = false;
  readonly bake: FractureBake;

  constructor(R: Rapier, plan: ShotPlan, specs: BodySpec[]) {
    const shardCount = specs.reduce((s, b) => s + b.shards.length, 0);
    const seconds = plan.timeline.impactEnd - plan.timeline.contact;
    this.frameCount = Math.ceil(seconds * BAKE_FPS) + 1;
    this.frames = new Float32Array(this.frameCount * shardCount * 7);

    const groundExists = !surfaceBreaks(plan);
    this.centerOfGravity = groundExists && plan.rsLocal < 50 ? [0, -plan.rsLocal, 0] : null;
    const gravity = groundExists && this.centerOfGravity === null ? { x: 0, y: -G_LOCAL, z: 0 } : { x: 0, y: 0, z: 0 };
    this.world = new R.World(gravity);
    this.world.integrationParameters.dt = 1 / (BAKE_FPS * SUBSTEPS);

    if (groundExists) {
      if (plan.patchIsWholeSphere) {
        const body = this.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(0, -plan.rsLocal, 0));
        this.world.createCollider(R.ColliderDesc.ball(plan.rsLocal).setFriction(0.8).setRestitution(0.25), body);
      } else {
        const mesh = buildCollisionMesh(plan);
        const body = this.world.createRigidBody(R.RigidBodyDesc.fixed());
        this.world.createCollider(R.ColliderDesc.trimesh(mesh.vertices, mesh.indices).setFriction(0.8).setRestitution(0.25), body);
      }
    }

    // Launch speeds in presentation units: the shards start with the impactor's motion, then
    // an outward kick that grows with how far past the breakup threshold the hit was.
    const vA = plan.local.startDistance / APPROACH_TIME;
    const ri3 = plan.riLocal ** 3;
    const rs3 = plan.rsLocal ** 3;
    const together = surfaceBreaks(plan) ? (ri3 / (ri3 + rs3)) * vA : 0.55 * vA;
    const dir = plan.dir;
    const rng = mulberry32(0xabc123 ^ shardCount);
    const kick = (energyRatio: number): number => vA * (0.12 + 0.55 * Math.min(1, Math.log10(1 + energyRatio) / 1.2));

    for (const spec of specs) {
      const outcome = spec.source === 'impactor' ? plan.impactorOutcome : plan.surfaceOutcome;
      const vOut = kick(outcome.energyRatio);
      for (const shard of spec.shards) {
        const x = spec.center[0] + shard.centroid[0] * spec.radius;
        const y = spec.center[1] + shard.centroid[1] * spec.radius;
        const z = spec.center[2] + shard.centroid[2] * spec.radius;
        const r: Vec3 = [x, y, z];
        const rl = Math.hypot(...r) || 1;
        const push = vOut * (0.4 + 0.6 * rng());
        const desc = R.RigidBodyDesc.dynamic()
          .setTranslation(x, y, z)
          .setLinvel(dir[0] * together + (r[0] / rl) * push, dir[1] * together + (r[1] / rl) * push + 0.25 * push, dir[2] * together + (r[2] / rl) * push)
          .setAngvel({ x: (rng() - 0.5) * 12, y: (rng() - 0.5) * 12, z: (rng() - 0.5) * 12 })
          .setCcdEnabled(true)
          .setAngularDamping(0.15)
          .setLinearDamping(0.02);
        const body = this.world.createRigidBody(desc);
        const collider = R.ColliderDesc.convexHull(shard.hull);
        if (collider) this.world.createCollider(collider.setDensity(1).setFriction(0.7).setRestitution(0.3), body);
        else this.world.createCollider(R.ColliderDesc.ball(spec.radius * 0.1).setDensity(1), body);
        this.bodies.push(body);
      }
    }
    this.bake = { specs, frames: this.frames, frameCount: this.frameCount, shardCount };
    this.record();
  }

  private record(): void {
    const n = this.bodies.length;
    const base = this.frame * n * 7;
    for (let i = 0; i < n; i++) {
      const b = this.bodies[i] as RAPIER.RigidBody;
      const t = b.translation();
      const q = b.rotation();
      this.frames.set([t.x, t.y, t.z, q.x, q.y, q.z, q.w], base + i * 7);
    }
  }

  /** Advance up to `frames` baked frames. Returns true when finished (and frees the engine). */
  step(frames: number): boolean {
    for (let f = 0; f < frames && this.frame < this.frameCount - 1; f++) {
      for (let s = 0; s < SUBSTEPS; s++) {
        if (this.centerOfGravity) {
          const c = this.centerOfGravity;
          for (const b of this.bodies) {
            const t = b.translation();
            const dx = c[0] - t.x;
            const dy = c[1] - t.y;
            const dz = c[2] - t.z;
            const d = Math.hypot(dx, dy, dz) || 1;
            const m = b.mass() * G_LOCAL;
            b.resetForces(true);
            b.addForce({ x: (dx / d) * m, y: (dy / d) * m, z: (dz / d) * m }, true);
          }
        }
        this.world.step();
      }
      this.frame++;
      this.record();
    }
    const done = this.frame >= this.frameCount - 1;
    if (done && !this.freed) {
      this.freed = true;
      this.world.free();
    }
    return done;
  }

  dispose(): void {
    if (!this.freed) {
      this.freed = true;
      this.world.free();
    }
  }
}

/** Build the shard geometry for a shot (CPU only; a few hundred ms for large breakups). */
export function planFracture(plan: ShotPlan, quality: FractureQuality): BodySpec[] {
  const specs: BodySpec[] = [];
  const ri = plan.riLocal;
  if (plan.impactorFate === 'shatter' || plan.impactorFate === 'crack') {
    specs.push(shardsFor('impactor', ri, [0, ri, 0], plan.impactorFate, plan.impactorOutcome.suggestedFragments, [0, -1, 0], quality, 101));
  }
  if (surfaceBreaks(plan)) {
    const rs = plan.rsLocal;
    const fate = SEVERITY[plan.surfaceOutcome.regime] >= SEVERITY.shatter ? 'shatter' : 'crack';
    specs.push(shardsFor('surface', rs, [0, -rs, 0], fate, plan.surfaceOutcome.suggestedFragments, [0, 1, 0], quality, 202));
  }
  return specs;
}

/** The visible shards, driven by the baked transforms. */
export class FractureView {
  readonly group = new Group();
  private readonly meshes: Mesh[] = [];
  private readonly materials = new Map<'impactor' | 'surface', ShaderMaterial>();
  private readonly geometries: BufferGeometry[] = [];
  private readonly qa = new Quaternion();
  private readonly qb = new Quaternion();
  /** Per frame: centre x, y, z and a radius that holds most shards. */
  private readonly cloudData: Float32Array;

  constructor(private readonly bake: FractureBake, plan: ShotPlan) {
    for (const spec of bake.specs) {
      const body = spec.source === 'impactor' ? plan.impactor : plan.surface;
      const look = lookFor(body.material, body.id);
      const material = makeSurfaceMaterial({ ...look, noiseScale: look.noiseScale * 2.5, bump: look.bump * spec.radius });
      this.materials.set(spec.source, material);
      for (const shard of spec.shards) {
        const g = new BufferGeometry();
        const n = shard.positions.length / 3;
        g.setAttribute('position', new BufferAttribute(shard.positions, 3));
        g.setAttribute('normal', new BufferAttribute(shard.normals, 3));
        g.setAttribute('aBase', new BufferAttribute(shard.base, 3));
        g.setAttribute('aInner', new BufferAttribute(shard.inner, 1));
        g.setAttribute('aHeat', new BufferAttribute(new Float32Array(n), 1));
        g.setAttribute('aAO', new BufferAttribute(new Float32Array(n).fill(1), 1));
        g.setAttribute('aRho', new BufferAttribute(new Float32Array(n), 1));
        const mesh = new Mesh(g, material);
        mesh.frustumCulled = false;
        this.group.add(mesh);
        this.meshes.push(mesh);
        this.geometries.push(g);
      }
    }
    this.group.visible = false;

    const { frames, frameCount, shardCount } = bake;
    this.cloudData = new Float32Array(frameCount * 4);
    const dist = new Float32Array(shardCount);
    for (let f = 0; f < frameCount; f++) {
      let cx = 0;
      let cy = 0;
      let cz = 0;
      for (let i = 0; i < shardCount; i++) {
        const o = (f * shardCount + i) * 7;
        cx += frames[o] as number;
        cy += frames[o + 1] as number;
        cz += frames[o + 2] as number;
      }
      cx /= shardCount;
      cy /= shardCount;
      cz /= shardCount;
      for (let i = 0; i < shardCount; i++) {
        const o = (f * shardCount + i) * 7;
        dist[i] = Math.hypot((frames[o] as number) - cx, (frames[o + 1] as number) - cy, (frames[o + 2] as number) - cz);
      }
      const sorted = Array.from(dist).sort((a, b) => a - b);
      this.cloudData.set([cx, cy, cz, sorted[Math.floor(sorted.length * 0.85)] as number], f * 4);
    }
  }

  /** Where the shards are `tau` seconds after contact: centre and a radius holding about 85% of them. */
  cloud(tau: number): { x: number; y: number; z: number; radius: number } {
    const f = Math.min(Math.max(tau, 0) * BAKE_FPS, this.bake.frameCount - 1);
    const o = Math.round(f) * 4;
    const d = this.cloudData;
    return { x: d[o] as number, y: d[o + 1] as number, z: d[o + 2] as number, radius: d[o + 3] as number };
  }

  hasSource(source: 'impactor' | 'surface'): boolean {
    return this.bake.specs.some((s) => s.source === source);
  }

  setHeat(source: 'impactor' | 'surface', heat: number): void {
    const m = this.materials.get(source);
    if (m) (m.uniforms.uHeatAdd as { value: number }).value = heat;
  }

  /** `tau` = seconds since contact. */
  update(tau: number): void {
    this.group.visible = tau >= 0;
    if (tau < 0) return;
    const { frames, frameCount, shardCount } = this.bake;
    const f = Math.min(tau * BAKE_FPS, frameCount - 1);
    const i0 = Math.floor(f);
    const i1 = Math.min(i0 + 1, frameCount - 1);
    const a = f - i0;
    for (let i = 0; i < shardCount; i++) {
      const o0 = (i0 * shardCount + i) * 7;
      const o1 = (i1 * shardCount + i) * 7;
      const mesh = this.meshes[i] as Mesh;
      const g = (k: number): number => (frames[o0 + k] as number) * (1 - a) + (frames[o1 + k] as number) * a;
      mesh.position.set(g(0), g(1), g(2));
      this.qa.set(frames[o0 + 3] as number, frames[o0 + 4] as number, frames[o0 + 5] as number, frames[o0 + 6] as number);
      this.qb.set(frames[o1 + 3] as number, frames[o1 + 4] as number, frames[o1 + 5] as number, frames[o1 + 6] as number);
      mesh.quaternion.slerpQuaternions(this.qa, this.qb, a);
    }
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials.values()) m.dispose();
    this.group.clear();
  }
}
