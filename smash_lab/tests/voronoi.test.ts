import { describe, expect, it } from 'vitest';
import { fractureSphere, icosphere, makeSeeds } from '../src/scene/voronoi';
import type { Vec3 } from '../src/scene/voronoi';
import { mulberry32 } from '../src/scene/noise';

describe('voronoi fracture', () => {
  it('icosphere has 20 * 4^detail faces on the unit sphere', () => {
    const faces = icosphere(2);
    expect(faces.length).toBe(320);
    for (const f of faces) for (const v of f) expect(Math.hypot(...v)).toBeCloseTo(1, 12);
  });

  it('the shards of a sphere add back up to the whole sphere', () => {
    const rng = mulberry32(42);
    const seeds = makeSeeds(24, [0, -1, 0], 0.5, 0.15, rng);
    expect(seeds.length).toBeGreaterThan(15);
    const shards = fractureSphere({ seeds, radius: 1, detail: 2, minVolumeFraction: 0 });
    expect(shards.length).toBe(seeds.length);
    const total = shards.reduce((s, x) => s + x.volumeFraction, 0);
    expect(total).toBeCloseTo(1, 6);
    for (const s of shards) expect(s.volumeFraction).toBeGreaterThan(0);
  });

  it('every shard is finite, has cut faces, and sits inside the unit ball', () => {
    const rng = mulberry32(7);
    const seeds = makeSeeds(40, [0, -1, 0], 0.4, 0.12, rng);
    const shards = fractureSphere({ seeds, radius: 2, detail: 2 });
    expect(shards.length).toBeGreaterThan(20);
    for (const s of shards) {
      for (const arr of [s.positions, s.normals, s.base, s.hull]) {
        for (const x of arr) expect(Number.isFinite(x)).toBe(true);
      }
      expect(s.positions.length % 9).toBe(0);
      expect(s.inner.some((x) => x > 0.5)).toBe(true);
      expect(s.hull.length).toBeGreaterThanOrEqual(12);
      for (let i = 0; i < s.base.length; i += 3) expect(Math.hypot(s.base[i] as number, s.base[i + 1] as number, s.base[i + 2] as number)).toBeLessThanOrEqual(1.0001);
    }
  });

  it('a single seed returns the whole sphere with no cut faces', () => {
    const shards = fractureSphere({ seeds: [[0, 0, 0] as Vec3], radius: 1, detail: 1 });
    expect(shards.length).toBe(1);
    expect(shards[0]?.volumeFraction).toBeCloseTo(1, 9);
    expect(shards[0]?.inner.every((x) => x === 0)).toBe(true);
  });

  it('seeds cluster near the contact point', () => {
    const rng = mulberry32(3);
    const seeds = makeSeeds(60, [0, -1, 0], 0.25, 0.08, rng);
    const near = seeds.filter((s) => Math.hypot(s[0], s[1] + 1, s[2]) < 0.6).length;
    expect(near / seeds.length).toBeGreaterThan(0.6);
  });

  it('is fast enough for 70 shards at full detail', () => {
    const rng = mulberry32(11);
    const seeds = makeSeeds(70, [0, -1, 0], 0.5, 0.1, rng);
    const t0 = performance.now();
    const shards = fractureSphere({ seeds, radius: 1, detail: 3 });
    const ms = performance.now() - t0;
    expect(shards.length).toBeGreaterThan(40);
    expect(ms).toBeLessThan(3000);
    console.log(`fractured into ${shards.length} shards in ${ms.toFixed(0)} ms`);
  });
});
