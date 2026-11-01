/**
 * Voronoi fracture of a sphere, pure geometry (no rendering, no physics).
 *
 * The sphere is a fine convex polytope (a subdivided icosahedron). Each seed point owns the
 * part of the polytope closer to it than to any other seed, found by clipping the polytope with
 * the bisector plane of every neighbouring seed. Outer faces keep a smooth sphere normal, so the
 * shard's outside looks like the intact object; the new cut faces are flagged `inner` so the
 * shader can paint fresh fracture surface on them.
 *
 * Everything is computed on the unit sphere and scaled at the end.
 */

export type Vec3 = [number, number, number];

const EPS = 1e-9;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

interface Face {
  v: Vec3[];
  inner: boolean;
}

export interface Shard {
  /** Centre of mass on the unit sphere. */
  centroid: Vec3;
  /** Volume as a fraction of the polytope's volume (sums to 1 over all shards). */
  volumeFraction: number;
  /** Non-indexed triangles, relative to the centroid, scaled by `radius`. */
  positions: Float32Array;
  normals: Float32Array;
  /** 1 on freshly cut faces, 0 on the original outside. */
  inner: Float32Array;
  /** Unit-sphere coordinates of each vertex (keeps surface texture continuous across shards). */
  base: Float32Array;
  /** Distinct vertices relative to the centroid, scaled by `radius`, for a convex collider. */
  hull: Float32Array;
}

/** A subdivided icosahedron on the unit sphere; counter-clockwise faces seen from outside. */
export function icosphere(detail: number): Vec3[][] {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const verts = raw.map(norm);
  const idx: Array<[number, number, number]> = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  let tris: Vec3[][] = idx.map(([a, b, c]) => [verts[a] as Vec3, verts[b] as Vec3, verts[c] as Vec3]);
  for (let d = 0; d < detail; d++) {
    const next: Vec3[][] = [];
    for (const [a, b, c] of tris as [Vec3, Vec3, Vec3][]) {
      const ab = norm(lerp(a, b, 0.5));
      const bc = norm(lerp(b, c, 0.5));
      const ca = norm(lerp(c, a, 0.5));
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    tris = next;
  }
  return tris;
}

/** Clip a convex polyhedron (list of polygons) to the half-space n.x <= d and close the cut. */
function clipCell(faces: Face[], n: Vec3, d: number): Face[] {
  const out: Face[] = [];
  const cut: Vec3[] = [];
  for (const f of faces) {
    const vs = f.v;
    const m = vs.length;
    const nv: Vec3[] = [];
    for (let i = 0; i < m; i++) {
      const a = vs[i] as Vec3;
      const b = vs[(i + 1) % m] as Vec3;
      const da = dot(n, a) - d;
      const db = dot(n, b) - d;
      const ina = da <= EPS;
      const inb = db <= EPS;
      if (ina) nv.push(a);
      if (ina !== inb) {
        const p = lerp(a, b, da / (da - db));
        nv.push(p);
        cut.push(p);
      }
    }
    const clean: Vec3[] = [];
    for (const p of nv) {
      const last = clean[clean.length - 1];
      if (!last || len(sub(p, last)) > 1e-9) clean.push(p);
    }
    const first = clean[0];
    const last = clean[clean.length - 1];
    if (clean.length > 1 && first && last && len(sub(first, last)) <= 1e-9) clean.pop();
    if (clean.length >= 3) out.push({ v: clean, inner: f.inner });
  }
  // Cap: distinct cut points, ordered counter-clockwise seen from outside (along +n).
  const pts: Vec3[] = [];
  for (const p of cut) if (!pts.some((q) => len(sub(p, q)) < 1e-7)) pts.push(p);
  if (pts.length >= 3) {
    let c: Vec3 = [0, 0, 0];
    for (const p of pts) c = add(c, p);
    c = scale(c, 1 / pts.length);
    const helper: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(helper, n));
    const w = cross(n, u);
    pts.sort((p, q) => Math.atan2(dot(sub(p, c), w), dot(sub(p, c), u)) - Math.atan2(dot(sub(q, c), w), dot(sub(q, c), u)));
    out.push({ v: pts, inner: true });
  }
  return out;
}

function polygonNormal(v: Vec3[]): Vec3 {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < v.length; i++) {
    const a = v[i] as Vec3;
    const b = v[(i + 1) % v.length] as Vec3;
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return norm([nx, ny, nz]);
}

/** Distribute seeds inside the unit ball, dense near `contact` (a point on the sphere). */
export function makeSeeds(count: number, contact: Vec3, spread: number, minGap: number, rng: () => number): Vec3[] {
  const seeds: Vec3[] = [];
  let guard = 0;
  while (seeds.length < count && guard++ < count * 200) {
    // Random direction, distance from the contact point drawn from an exponential.
    const z = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - z * z);
    const dir: Vec3 = [s * Math.cos(a), z, s * Math.sin(a)];
    const dist = -Math.log(1 - rng() * 0.999) * spread;
    const p = add(contact, scale(dir, dist));
    if (len(p) > 0.97) continue;
    if (seeds.some((q) => len(sub(p, q)) < minGap)) continue;
    seeds.push(p);
  }
  return seeds;
}

export interface FractureOptions {
  seeds: Vec3[];
  /** Sphere radius in render units. */
  radius: number;
  /** Icosphere subdivisions for the outer surface (3 = 1280 faces). */
  detail?: number;
  /** Drop shards smaller than this fraction of the sphere's volume. */
  minVolumeFraction?: number;
}

export function fractureSphere(options: FractureOptions): Shard[] {
  const { seeds, radius } = options;
  const polytope: Face[] = icosphere(options.detail ?? 3).map((v) => ({ v: v.map((p) => [...p] as Vec3), inner: false }));
  const minFraction = options.minVolumeFraction ?? 2e-4;

  const cells: Array<{ faces: Face[] }> = [];
  seeds.forEach((si, i) => {
    let faces = polytope;
    const others = seeds
      .map((sj, j) => ({ j, d: len(sub(sj, si)) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d);
    let maxR = 2;
    for (const o of others) {
      if (o.d / 2 >= maxR) break;
      const sj = seeds[o.j] as Vec3;
      const n = sub(sj, si);
      const d = dot(n, scale(add(si, sj), 0.5));
      faces = clipCell(faces, n, d);
      let m = 0;
      for (const f of faces) for (const p of f.v) m = Math.max(m, len(sub(p, si)));
      maxR = m;
    }
    cells.push({ faces });
  });

  // Total polytope volume (for fractions).
  let polyVolume = 0;
  for (const f of polytope) {
    const a = f.v[0] as Vec3;
    for (let k = 1; k + 1 < f.v.length; k++) polyVolume += dot(a, cross(f.v[k] as Vec3, f.v[k + 1] as Vec3)) / 6;
  }

  const shards: Shard[] = [];
  for (const { faces } of cells) {
    let vol = 0;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const f of faces) {
      const a = f.v[0] as Vec3;
      for (let k = 1; k + 1 < f.v.length; k++) {
        const b = f.v[k] as Vec3;
        const c = f.v[k + 1] as Vec3;
        const tv = dot(a, cross(b, c)) / 6;
        vol += tv;
        cx += ((a[0] + b[0] + c[0]) / 4) * tv;
        cy += ((a[1] + b[1] + c[1]) / 4) * tv;
        cz += ((a[2] + b[2] + c[2]) / 4) * tv;
      }
    }
    if (vol / polyVolume < minFraction) continue;
    const centroid: Vec3 = [cx / vol, cy / vol, cz / vol];

    const pos: number[] = [];
    const nor: number[] = [];
    const inn: number[] = [];
    const base: number[] = [];
    const hullKeys = new Set<string>();
    const hull: number[] = [];
    const pushVertex = (p: Vec3, n: Vec3, inner: number): void => {
      const rel = sub(p, centroid);
      pos.push(rel[0] * radius, rel[1] * radius, rel[2] * radius);
      nor.push(n[0], n[1], n[2]);
      inn.push(inner);
      base.push(p[0], p[1], p[2]);
      const key = `${Math.round(rel[0] * 1e6)},${Math.round(rel[1] * 1e6)},${Math.round(rel[2] * 1e6)}`;
      if (!hullKeys.has(key)) {
        hullKeys.add(key);
        hull.push(rel[0] * radius, rel[1] * radius, rel[2] * radius);
      }
    };
    for (const f of faces) {
      const flat = polygonNormal(f.v);
      const a = f.v[0] as Vec3;
      for (let k = 1; k + 1 < f.v.length; k++) {
        const tri = [a, f.v[k] as Vec3, f.v[k + 1] as Vec3];
        for (const p of tri) pushVertex(p, f.inner ? flat : norm(p), f.inner ? 1 : 0);
      }
    }
    shards.push({
      centroid,
      volumeFraction: vol / polyVolume,
      positions: new Float32Array(pos),
      normals: new Float32Array(nor),
      inner: new Float32Array(inn),
      base: new Float32Array(base),
      hull: new Float32Array(hull),
    });
  }
  return shards;
}
