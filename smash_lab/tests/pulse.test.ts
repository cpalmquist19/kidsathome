import { describe, expect, it } from 'vitest';
import { byId } from '../src/sim/catalog';
import { resolveImpact } from '../src/sim/impact';

const hit = (p: string, t: string) => resolveImpact({ projectile: byId(p), target: byId(t), speed: 1, impactParameter: 0 });

describe("Gozdilla's Thermonuclear Pulse", () => {
  it('adds its mass to a star that survives', () => {
    expect(hit('gozdillaPulse', 'sun').merge?.mass).toBeCloseTo(byId('sun').mass + byId('gozdillaPulse').mass, -20);
  });
  it('adds nothing to a non-star, or to a star it vaporizes', () => {
    expect(hit('gozdillaPulse', 'earth').merge ?? null).toBeNull();
    expect(hit('hypernova', 'proximaCen').merge ?? null).toBeNull();
  });
});
