import { BufferAttribute, BufferGeometry, Mesh, SphereGeometry, Vector3 } from 'three';
import type { ShaderMaterial } from 'three';
import { PATCH_RADIUS } from './planner';
import type { ShotPlan } from './planner';
import { mulberry32 } from './noise';
import { lookFor, planetModeFor } from './looks';
import { makeSurfaceMaterial } from './surface';

/** Give a plain sphere the extra attributes the surface shader expects. */
export function decorateSphere(geometry: BufferGeometry): BufferGeometry {
  const pos = geometry.getAttribute('position');
  const n = pos.count;
  geometry.setAttribute('aBase', new BufferAttribute(new Float32Array(pos.array), 3));
  geometry.setAttribute('aHeat', new BufferAttribute(new Float32Array(n), 1));
  geometry.setAttribute('aAO', new BufferAttribute(new Float32Array(n).fill(1), 1));
  geometry.setAttribute('aRho', new BufferAttribute(new Float32Array(n), 1));
  return geometry;
}

export function makeUnitSphere(widthSegments = 96, heightSegments = 64): BufferGeometry {
  return decorateSphere(new SphereGeometry(1, widthSegments, heightSegments));
}

const easeOutCubic = (x: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export interface PatchQuality {
  rings: number;
  segments: number;
}

/**
 * The part of the surface body near the impact point: a polar grid around the impact point,
 * built in double precision so an Earth-sized surface is just as exact as a marble.
 * Crater formation is a CPU height field (progress 0..1) so normals stay correct.
 */
export class SurfacePatch {
  readonly mesh: Mesh;
  readonly material: ShaderMaterial;
  private readonly geometry = new BufferGeometry();
  private readonly rings: number;
  private readonly segs: number;
  private readonly rho: Float64Array; // arc distance per ring
  private readonly sinPhi: Float64Array;
  private readonly cosPhi: Float64Array;
  private readonly yBase: Float64Array; // y offset of the undeformed surface per ring
  private readonly cosPsi: Float64Array;
  private readonly sinPsi: Float64Array;
  private readonly wobble: Float64Array; // crater outline wobble per segment
  private readonly rubble: Float64Array;
  private readonly positions: Float32Array;
  private readonly ao: Float32Array;
  private lastProgress = -1;

  constructor(private readonly plan: ShotPlan, quality: PatchQuality) {
    this.rings = quality.rings;
    this.segs = quality.segments;
    const { rings, segs } = this;
    const nVerts = (rings + 1) * segs;
    const rs = plan.rsLocal;
    const maxAngle = plan.patchAngle;

    this.rho = new Float64Array(rings + 1);
    this.sinPhi = new Float64Array(rings + 1);
    this.cosPhi = new Float64Array(rings + 1);
    this.yBase = new Float64Array(rings + 1);
    for (let i = 0; i <= rings; i++) {
      const phi = maxAngle * Math.pow(i / rings, 1.6);
      this.rho[i] = rs * phi;
      this.sinPhi[i] = Math.sin(phi);
      this.cosPhi[i] = Math.cos(phi);
      this.yBase[i] = -2 * rs * Math.pow(Math.sin(phi / 2), 2); // = rs * (cos(phi) - 1), exact for tiny phi
    }
    this.cosPsi = new Float64Array(segs);
    this.sinPsi = new Float64Array(segs);
    for (let j = 0; j < segs; j++) {
      const psi = (2 * Math.PI * j) / segs;
      this.cosPsi[j] = Math.cos(psi);
      this.sinPsi[j] = Math.sin(psi);
    }

    // A few low-frequency lobes make the rim irregular; the seed is fixed per shot.
    const rng = mulberry32(Math.floor(plan.unit * 1e6) ^ 0x51ed);
    const lobes = [2, 3, 5].map((k) => ({ k, a: 0.05 + 0.04 * rng(), p: rng() * 6.283 }));
    this.wobble = new Float64Array(segs);
    this.rubble = new Float64Array(segs);
    for (let j = 0; j < segs; j++) {
      const psi = (2 * Math.PI * j) / segs;
      let w = 0;
      for (const l of lobes) w += l.a * Math.sin(l.k * psi + l.p);
      this.wobble[j] = w;
      this.rubble[j] = rng();
    }

    const base = new Float32Array(nVerts * 3);
    const heat = new Float32Array(nVerts);
    const rhoAttr = new Float32Array(nVerts);
    this.positions = new Float32Array(nVerts * 3);
    this.ao = new Float32Array(nVerts).fill(1);

    const heatRadius = Math.max(plan.deform.radius * 1.2, plan.riLocal * 1.3, 0.3);
    const glow = plan.surfaceOutcome.glow;
    for (let i = 0; i <= rings; i++) {
      for (let j = 0; j < segs; j++) {
        const v = i * segs + j;
        const sp = this.sinPhi[i] as number;
        const x = rs * sp * (this.cosPsi[j] as number);
        const z = rs * sp * (this.sinPsi[j] as number);
        const y = this.yBase[i] as number;
        base[v * 3] = x;
        base[v * 3 + 1] = y;
        base[v * 3 + 2] = z;
        this.positions[v * 3] = x;
        this.positions[v * 3 + 1] = y;
        this.positions[v * 3 + 2] = z;
        const r = this.rho[i] as number;
        rhoAttr[v] = r;
        heat[v] = glow * Math.exp(-Math.pow(r / heatRadius, 2) * 1.4);
      }
    }

    const index: number[] = [];
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segs; j++) {
        const j2 = (j + 1) % segs;
        const a = i * segs + j;
        const b = i * segs + j2;
        const c = (i + 1) * segs + j;
        const d = (i + 1) * segs + j2;
        index.push(a, b, c, b, d, c);
      }
    }
    this.geometry.setIndex(index);
    this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aBase', new BufferAttribute(base, 3));
    this.geometry.setAttribute('aHeat', new BufferAttribute(heat, 1));
    this.geometry.setAttribute('aAO', new BufferAttribute(this.ao, 1));
    this.geometry.setAttribute('aRho', new BufferAttribute(rhoAttr, 1));
    this.geometry.setAttribute('normal', new BufferAttribute(new Float32Array(nVerts * 3), 3));

    const edge = plan.patchIsWholeSphere ? 1e9 : PATCH_RADIUS;
    this.material = makeSurfaceMaterial(lookFor(plan.surface.material, plan.surface.id), {
      edge,
      planet: plan.patchIsWholeSphere ? planetModeFor(plan.surface.id) : 0,
      center: new Vector3(0, -plan.rsLocal, 0),
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.setProgress(0, true);
  }

  /** Height of the surface above the undeformed sphere at arc distance `rho`, azimuth index `j`. */
  private height(rho: number, j: number, p: number): number {
    const d = this.plan.deform;
    if (d.kind === 'none' || p <= 0) return 0;
    const g = easeOutCubic(p);
    const wob = 1 + (this.wobble[j] as number) * (d.kind === 'crater' ? 1 : 0.3);
    const R = d.radius * g * wob;
    const D = d.depth * g;
    if (R <= 1e-9) return 0;
    const x = rho / R;
    if (d.kind === 'dent') {
      return -D * Math.exp(-2.4 * x * x) + 0.08 * D * Math.exp(-Math.pow((x - 1.35) / 0.35, 2));
    }
    const rimH = (d.complex ? 0.07 : 0.14) * D;
    const rubble = 1 + 0.35 * ((this.rubble[j] as number) - 0.5);
    let h: number;
    if (x < 1) {
      h = d.complex ? -D * (1 - Math.pow(x, 4)) + 0.3 * D * Math.exp(-Math.pow(x / 0.16, 2)) : -D * (1 - x * x);
    } else {
      h = 0;
    }
    h += rimH * rubble * Math.exp(-Math.pow((x - 1) / 0.2, 2));
    if (x > 1) h += 0.45 * rimH * rubble * Math.pow(1 / x, 3);
    return h;
  }

  /** Update the crater to formation progress 0..1. Cheap no-op when nothing changed. */
  setProgress(p: number, force = false): void {
    const q = Math.round(Math.min(1, Math.max(0, p)) * 400) / 400;
    if (!force && q === this.lastProgress) return;
    this.lastProgress = q;
    const { rings, segs } = this;
    const pos = this.positions;
    const deformed = this.plan.deform.kind !== 'none';
    for (let i = 0; i <= rings; i++) {
      const rho = this.rho[i] as number;
      const sp = this.sinPhi[i] as number;
      const cp = this.cosPhi[i] as number;
      const y0 = this.yBase[i] as number;
      const rs = this.plan.rsLocal;
      for (let j = 0; j < segs; j++) {
        const v = i * segs + j;
        const h = deformed ? this.height(rho, j, q) : 0;
        pos[v * 3] = rs * sp * (this.cosPsi[j] as number) + h * sp * (this.cosPsi[j] as number);
        pos[v * 3 + 1] = y0 + h * cp;
        pos[v * 3 + 2] = rs * sp * (this.sinPsi[j] as number) + h * sp * (this.sinPsi[j] as number);
        const depth = this.plan.deform.depth;
        this.ao[v] = deformed && depth > 0 ? 1 - 0.55 * Math.min(1, Math.max(0, -h) / depth) : 1;
      }
    }
    this.geometry.getAttribute('position').needsUpdate = true;
    this.geometry.getAttribute('aAO').needsUpdate = true;
    this.computeNormals();
  }

  private computeNormals(): void {
    this.geometry.computeVertexNormals();
    const normal = this.geometry.getAttribute('normal');
    const n = normal.array as Float32Array;
    const segs = this.segs;
    // The two ends of the grid collapse to a point; give every vertex of that ring one shared normal.
    for (const ring of [0, this.rings]) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (let j = 0; j < segs; j++) {
        const v = ring * segs + j;
        x += n[v * 3] as number;
        y += n[v * 3 + 1] as number;
        z += n[v * 3 + 2] as number;
      }
      const len = Math.hypot(x, y, z) || 1;
      for (let j = 0; j < segs; j++) {
        const v = ring * segs + j;
        n[v * 3] = x / len;
        n[v * 3 + 1] = y / len;
        n[v * 3 + 2] = z / len;
      }
    }
    normal.needsUpdate = true;
  }

  /** Copy of the current surface for a physics collider (degenerate triangles removed). */
  collisionSnapshot(): { vertices: Float32Array; indices: Uint32Array } {
    const pos = this.positions;
    const index = this.geometry.getIndex();
    const src = index ? (index.array as ArrayLike<number>) : [];
    const keep: number[] = [];
    for (let i = 0; i + 2 < src.length; i += 3) {
      const a = (src[i] as number) * 3;
      const b = (src[i + 1] as number) * 3;
      const c = (src[i + 2] as number) * 3;
      const ux = (pos[b] as number) - (pos[a] as number);
      const uy = (pos[b + 1] as number) - (pos[a + 1] as number);
      const uz = (pos[b + 2] as number) - (pos[a + 2] as number);
      const vx = (pos[c] as number) - (pos[a] as number);
      const vy = (pos[c + 1] as number) - (pos[a + 1] as number);
      const vz = (pos[c + 2] as number) - (pos[a + 2] as number);
      const area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
      if (area > 1e-9) keep.push(src[i] as number, src[i + 1] as number, src[i + 2] as number);
    }
    return { vertices: new Float32Array(pos), indices: new Uint32Array(keep) };
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/** A coarse copy of the finished crater surface, for rigid-body debris to land on. */
export function buildCollisionMesh(plan: ShotPlan): { vertices: Float32Array; indices: Uint32Array } {
  const proxy = new SurfacePatch(plan, { rings: 56, segments: 80 });
  proxy.setProgress(1, true);
  const snapshot = proxy.collisionSnapshot();
  proxy.dispose();
  return snapshot;
}
