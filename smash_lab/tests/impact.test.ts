import { describe, expect, it } from 'vitest';
import { fixedLorentzGamma } from '../src/sim/impact';
import { CATALOG, SEVERITY, byId, describeBody, fmtFixedSpeed, fmtLength, regimeInfoFor, makeBody, resolveImpact } from '../src/sim';
import { bindingEnergyPerKg, minContactSpeed } from '../src/sim';
import { C_LIGHT, energyEquivalentSpeed } from '../src/sim/units';
import type { Body, ImpactOutcome } from '../src/sim';

/** Hit `projectile` into `target`. `angleDeg` is the angle above the surface (90 = head-on). */
function hit(projectile: Body | string, target: Body | string, speed: number, angleDeg = 90): ImpactOutcome {
  const p = typeof projectile === 'string' ? byId(projectile) : projectile;
  const t = typeof target === 'string' ? byId(target) : target;
  return resolveImpact({ projectile: p, target: t, speed, impactParameter: Math.cos((angleDeg * Math.PI) / 180) });
}

describe('everyday collisions', () => {
  it('a baseball dents against a bowling ball, which just bounces', () => {
    const r = hit('baseball', 'bowling', 40);
    expect(r.projectile.regime).toBe('dent');
    expect(r.target.regime).toBe('rebound');
  });

  it('two marbles bounce gently, crack at medium speed, shatter when fast', () => {
    const marble = byId('marble');
    expect(hit(marble, marble, 3).projectile.regime).toBe('rebound');
    expect(hit(marble, marble, 30).projectile.regime).toBe('fracture');
    expect(hit(marble, marble, 60).projectile.regime).toBe('shatter');
  });

  it('an iron cannonball does not break against a boulder, but cracks it', () => {
    const r = hit('cannonball', 'boulder', 100);
    expect(['crater', 'dent']).toContain(r.projectile.regime);
    expect(SEVERITY[r.target.regime]).toBeGreaterThanOrEqual(SEVERITY.crater);
  });

  it('a grazing hit digs a much smaller crater than a head-on hit', () => {
    const head = hit('cannonball', 'boulder', 300, 90);
    const graze = hit('cannonball', 'boulder', 300, 8);
    expect(graze.target.craterDiameter).toBeGreaterThan(0);
    expect(graze.target.craterDiameter).toBeLessThan(0.5 * head.target.craterDiameter);
    expect(graze.impactAngleDeg).toBeCloseTo(8, 5);
  });
});

describe('real impacts (order-of-magnitude checks)', () => {
  it('Meteor Crater: 50 m iron at 12.8 km/s, 45 degrees, makes a crater about 1.2 km wide', () => {
    const r = hit('ironMeteoroid', 'earth', 12800, 45);
    expect(r.target.regime).toBe('crater');
    expect(r.target.craterIsComplex).toBe(false);
    expect(r.target.craterDiameter).toBeGreaterThan(600);
    expect(r.target.craterDiameter).toBeLessThan(2400);
    expect(['disrupt', 'vaporize']).toContain(r.projectile.regime);
    expect(r.projectile.meltFraction).toBeGreaterThan(0.9);
  });

  it('Chicxulub: 10 km asteroid at 20 km/s makes a complex basin roughly 100-200 km wide', () => {
    const r = hit('asteroid', 'earth', 20000, 45);
    expect(r.target.regime).toBe('crater');
    expect(r.target.craterIsComplex).toBe(true);
    expect(r.target.craterDiameter).toBeGreaterThan(70e3);
    expect(r.target.craterDiameter).toBeLessThan(300e3);
    expect(r.energyJ).toBeGreaterThan(1e22);
    expect(r.energyJ).toBeLessThan(1e24);
  });

  it('a 2 cm iron ball at 7 km/s digs a crater a few times its own width in solid iron', () => {
    const ball = makeBody({ id: 'ball', name: 'Ball', emoji: '', radius: 0.01, material: 'iron', blurb: '' });
    const slab = makeBody({ id: 'slab', name: 'Slab', emoji: '', radius: 10, material: 'iron', blurb: '' });
    const r = hit(ball, slab, 7000);
    const ratio = r.target.craterDiameter / (2 * ball.radius);
    expect(ratio).toBeGreaterThan(2);
    expect(ratio).toBeLessThan(10);
  });

  it('the Moon hitting Earth at 30 km/s vaporizes the Moon and melts a large share of Earth', () => {
    const r = hit('moon', 'earth', 30000);
    expect(r.projectile.regime).toBe('vaporize');
    expect(r.target.meltFraction).toBeGreaterThan(0.05);
    expect(SEVERITY[r.target.regime]).toBeGreaterThanOrEqual(SEVERITY.crater);
  });

  it('a dust grain at 20 km/s is vaporized and leaves a microscopic pit', () => {
    const r = hit('dust', 'earth', 20000);
    expect(r.projectile.regime).toBe('vaporize');
    expect(r.target.regime).toBe('crater');
    expect(r.target.craterDiameter).toBeLessThan(0.01);
  });

  it('a big asteroid hitting a small one destroys the small one', () => {
    const r = hit('asteroid', 'comet', 15000);
    expect(['disrupt', 'vaporize']).toContain(r.target.regime);
  });
});

describe('model invariants', () => {
  const pairs: Array<[string, string]> = [
    ['baseball', 'bowling'], ['marble', 'marble'], ['boulder', 'earth'], ['cannonball', 'boulder'],
    ['moon', 'earth'], ['dust', 'earth'], ['comet', 'moon'], ['hailstone', 'wreckingBall'], ['pluto', 'mars'],
  ];
  const speeds = Array.from({ length: 61 }, (_, i) => Math.pow(10, i / 10)); // 1 m/s .. 1e6 m/s

  it.each(pairs)('%s into %s never gets milder as speed rises', (a, b) => {
    let prevP = -1;
    let prevT = -1;
    for (const v of speeds) {
      const r = hit(a, b, v);
      expect(SEVERITY[r.projectile.regime]).toBeGreaterThanOrEqual(prevP);
      expect(SEVERITY[r.target.regime]).toBeGreaterThanOrEqual(prevT);
      prevP = SEVERITY[r.projectile.regime];
      prevT = SEVERITY[r.target.regime];
    }
  });

  it('treats both bodies identically: swapping roles swaps the outcomes', () => {
    // Numbers may differ in the last floating-point digit because operations run in a different order.
    const same = (x: object, y: object): void => {
      for (const [key, xv] of Object.entries(x)) {
        const yv = (y as Record<string, unknown>)[key];
        if (typeof xv === 'number' && typeof yv === 'number') {
          expect(Math.abs(xv - yv), key).toBeLessThanOrEqual(1e-9 * Math.max(Math.abs(xv), Math.abs(yv), 1e-300));
        } else expect(yv, key).toEqual(xv);
      }
    };
    for (const [a, b] of pairs) {
      const ab = hit(a, b, 5000, 60);
      const ba = hit(b, a, 5000, 60);
      same(ab.projectile, ba.target);
      same(ab.target, ba.projectile);
    }
  });

  it('every catalog pair gives finite numbers at every speed', async () => {
    for (const p of CATALOG) {
      await new Promise((resolve) => setTimeout(resolve, 0)); // let the test runner breathe
      for (const t of CATALOG) {
        for (const v of [1, 1e3, 1e6, 1e8]) {
          const r = hit(p, t, v, 45);
          for (const o of [r.projectile, r.target]) {
            for (const [key, value] of Object.entries(o)) {
              if (typeof value === 'number') expect(Number.isFinite(value), `${p.id}->${t.id} @${v}: ${key}`).toBe(true);
            }
          }
          expect(Number.isFinite(r.energyJ)).toBe(true);
        }
      }
    }
  }, 240_000);

  it('stays finite for absurd masses and sizes (the old formula overflowed here)', () => {
    const huge = makeBody({ id: 'huge', name: 'Huge', emoji: '', radius: 4.7e227, mass: 6.2e233, material: 'rock', blurb: '' });
    const tiny = makeBody({ id: 'tiny', name: 'Tiny', emoji: '', radius: 5e-37, mass: 7.4e-106, material: 'ice', blurb: '' });
    for (const [a, b] of [[huge, huge], [huge, tiny], [tiny, huge], [tiny, tiny]] as const) {
      const r = hit(a, b, 1e6, 70);
      expect(Number.isFinite(r.energyJ)).toBe(true);
      for (const o of [r.projectile, r.target]) {
        for (const [key, value] of Object.entries(o)) {
          if (typeof value === 'number') expect(Number.isFinite(value), `${a.id}->${b.id}: ${key}`).toBe(true);
        }
      }
    }
  });

  it('the descriptive text never contains NaN, undefined or empty results', () => {
    for (const p of CATALOG) {
      for (const t of CATALOG) {
        for (const v of [3, 300, 3e4]) {
          const r = hit(p, t, v, 50);
          for (const [body, o] of [[p, r.projectile], [t, r.target]] as const) {
            const lines = describeBody(body, o);
            expect(lines.length, `${p.id}->${t.id} @${v}`).toBeGreaterThan(0);
            for (const line of lines) expect(line).not.toMatch(/NaN|undefined|Infinity/);
            const info = regimeInfoFor(body, body === p ? t : p, o);
            expect(`${info.label} ${info.blurb}`).not.toMatch(/NaN|undefined|Infinity/);
          }
        }
      }
    }
  }, 240_000);

  it('rejects nonsense input', () => {
    expect(() => hit('baseball', 'bowling', 0)).toThrow(RangeError);
    expect(() => hit('baseball', 'bowling', Number.NaN)).toThrow(RangeError);
    expect(() => hit('baseball', 'bowling', -5)).toThrow(RangeError);
  });

  it('reports energy consistent with the reduced mass', () => {
    const r = hit('baseball', 'bowling', 40);
    const mu = (0.145 * 7) / (0.145 + 7);
    expect(r.energyJ).toBeCloseTo(0.5 * mu * 1600, 6);
  });

  describe('very big bodies', () => {
    it('the slowest two bodies can meet is their mutual escape speed', () => {
      const e = byId('earth');
      const m = byId('moon');
      const v = minContactSpeed(e.mass, e.radius, m.mass, m.radius);
      expect(v).toBeGreaterThan(9500);
      expect(v).toBeLessThan(10500);
      const sun = byId('sun');
      const j = byId('jupiter');
      expect(minContactSpeed(sun.mass, sun.radius, j.mass, j.radius)).toBeGreaterThan(5.5e5);
      // Pebbles barely pull on each other at all.
      const a = byId('marble');
      expect(minContactSpeed(a.mass, a.radius, a.mass, a.radius)).toBeLessThan(1e-3);
      // Black holes are capped just under light speed.
      const bh = byId('sgrA');
      expect(minContactSpeed(bh.mass, bh.radius, e.mass, e.radius)).toBeLessThan(C_LIGHT);
    });

    it('relativistic speeds carry more energy than the Newtonian formula, everyday speeds are unchanged', () => {
      expect(energyEquivalentSpeed(30)).toBeCloseTo(30, 6);
      expect(energyEquivalentSpeed(1e4) / 1e4).toBeCloseTo(1, 6);
      const half = 0.5 * C_LIGHT;
      expect(energyEquivalentSpeed(half)).toBeGreaterThan(half);
      expect(Number.isFinite(energyEquivalentSpeed(0.99 * C_LIGHT))).toBe(true);
    });

    it('two similar planets do not both turn to vapour, but a pebble-sized hit on Earth still can', () => {
      const r = hit('earth', 'earth', 20e3, 45);
      expect(r.projectile.regime).not.toBe('vaporize');
      expect(r.target.regime).not.toBe('vaporize');
      expect(SEVERITY[r.target.regime]).toBeGreaterThanOrEqual(SEVERITY.shatter);
      expect(hit('dust', 'earth', 20e3, 45).projectile.regime).toBe('vaporize');
    });

    it('a star is not unbound by a hit that carries less energy than holds it together', () => {
      const sun = byId('sun');
      const r = hit('jupiter', 'sun', 617e3, 45);
      expect(bindingEnergyPerKg(sun.mass, sun.radius)).toBeGreaterThan(1e11);
      expect(r.target.regime).toBe('rebound');
      expect(r.projectile.regime).toBe('vaporize');
    });

    it('stars merge instead of vaporising when two Suns meet at their escape speed', () => {
      const r = hit('sun', 'sun', 6e5, 45);
      expect(SEVERITY[r.target.regime]).toBeLessThanOrEqual(SEVERITY.disrupt);
      expect(r.target.regime).not.toBe('vaporize');
    });

    it('anything that meets a black hole is swallowed, and the hole is unharmed', () => {
      const r = hit('earth', 'stellarBH', 2e7, 90);
      expect(r.projectile.regime).toBe('vaporize');
      expect(r.target.regime).toBe('rebound');
    });
  });

  describe('merging', () => {
    const floorHit = (a: string, b: string, angle = 90): ImpactOutcome => {
      const A = byId(a);
      const B = byId(b);
      return hit(a, b, minContactSpeed(A.mass, A.radius, B.mass, B.radius), angle);
    };

    it('Pollux and Vega at 373 km/s fuse into one star, however they meet', () => {
      for (const angle of [90, 45, 20]) {
        const r = hit('vega', 'pollux', 373e3, angle);
        expect(r.merge).not.toBeNull();
        const m = r.merge!;
        expect(m.mass).toBeCloseTo(byId('vega').mass + byId('pollux').mass, -20);
        expect(m.radius).toBeGreaterThanOrEqual(byId('pollux').radius);
        expect(m.blackHole).toBe(false);
      }
    });

    it('two neutron stars merge, and a heavy enough pair collapses into a black hole', () => {
      const r = floorHit('neutronStar', 'neutronStar');
      expect(r.merge).not.toBeNull();
      expect(r.merge!.blackHole).toBe(true);
      expect(r.merge!.radius).toBeLessThan(byId('neutronStar').radius);
    });

    it('two black holes become one bigger black hole', () => {
      const r = floorHit('stellarBH', 'stellarBH');
      expect(r.merge).not.toBeNull();
      expect(r.merge!.radius).toBeCloseTo(2 * byId('stellarBH').radius, 5);
    });

    it('two heavy white dwarfs explode as a supernova instead of merging', () => {
      const r = floorHit('siriusB', 'siriusB');
      expect(r.supernova).toBe(true);
      expect(r.merge).toBeNull();
      expect(r.target.regime).toBe('vaporize');
    });

    it('comparable planets fuse at their escape speed, but not when they hit much faster', () => {
      expect(floorHit('earth', 'mars').merge).not.toBeNull();
      expect(hit('earth', 'earth', 60e3, 90).merge).toBeNull();
    });

    it('small rocks and everyday things never merge', () => {
      expect(hit('boulder', 'earth', 20e3, 45).merge).toBeNull();
      expect(hit('baseball', 'car', 30, 45).merge).toBeNull();
      expect(floorHit('moon', 'earth').merge).toBeNull();
    });

    it('a pair at much more than escape speed is torn apart, not merged', () => {
      expect(hit('sun', 'sun', 8e6, 90).merge).toBeNull();
    });
  });

  describe('bigger than TON 618', () => {
    it('the catalog has plenty of objects bigger than TON 618, all with finite numbers', () => {
      const ton = byId('ton618');
      const bigger = CATALOG.filter((b) => b.radius > ton.radius || b.mass > ton.mass);
      expect(bigger.length).toBeGreaterThanOrEqual(44);
      for (const b of bigger) {
        expect(Number.isFinite(b.radius) && Number.isFinite(b.mass) && b.radius > 0 && b.mass > 0, b.id).toBe(true);
      }
    });

    it('every catalog id is unique', () => {
      expect(new Set(CATALOG.map((b) => b.id)).size).toBe(CATALOG.length);
    });

    it('galaxies merge at the speed they fall together, and a star crossing a thin nebula is not burned up', () => {
      expect(hit('milkyWay', 'andromeda', 1.1e5, 90).merge).not.toBeNull();
      expect(hit('sun', 'orion', 2e4, 90).projectile.regime).not.toBe('vaporize');
    });

    it('lengths beyond a few light-years are written in light-years', () => {
      expect(fmtLength(byId('universe').radius)).toMatch(/billion light-years/);
      expect(fmtLength(byId('milkyWay').radius)).toMatch(/light-years/);
      expect(fmtLength(1.5e11)).toMatch(/km$/);
    });
  });

  describe('cosmic-ray particles', () => {
    const EV = 1.602176634e-19;

    it('arrive with the energy they were measured at, whatever speed is passed in', () => {
      for (const [id, ev] of [['omgParticle', 3.2e20], ['amaterasu', 2.4e20]] as const) {
        const slow = hit(id, 'earth', 1, 90);
        const fast = hit(id, 'earth', 2.99e8, 90);
        expect(slow.energyJ).toBeCloseTo(ev * EV, -1);
        expect(fast.energyJ).toBeCloseTo(slow.energyJ, 6);
      }
      expect(byId('omgParticle').energyEv! * EV).toBeCloseTo(51.3, 0);
    });

    it('have a huge Lorentz factor, and the same result whichever body is the particle', () => {
      expect(byId('omgParticle').lorentzGamma!).toBeGreaterThan(3e11);
      expect(byId('omgParticle').lorentzGamma!).toBeGreaterThan(byId('amaterasu').lorentzGamma!);
      const a = hit('omgParticle', 'earth', 1, 90);
      const b = hit('earth', 'omgParticle', 1, 90);
      expect(b.energyJ).toBeCloseTo(a.energyJ, 6);
    });

    it('destroy themselves and leave only a microscopic mark on Earth', () => {
      const r = hit('omgParticle', 'earth', 1, 90);
      expect(r.projectile.regime).toBe('vaporize');
      expect(r.target.craterDiameter).toBeLessThan(1e-3);
    });

    it('are written as a gap from light speed', () => {
      expect(fmtFixedSpeed(byId('omgParticle').lorentzGamma!)).toMatch(/within 4\.\d+ × 10⁻²⁴ of the speed of light/);
    });
  });

  describe('beyond the universe', () => {
    it('has the Gravity Lab objects bigger than the observable universe, all with finite numbers', () => {
      const group = CATALOG.filter((b) => b.group === 'Beyond the universe');
      expect(group.length).toBeGreaterThanOrEqual(12);
      const universe = byId('universe');
      for (const b of group) {
        // Alarastraza is another universe, so it belongs here even though it is a little smaller than ours.
        expect(b.id === 'alarastraza' || b.mass > universe.mass || b.radius > universe.radius, b.id).toBe(true);
        expect(Number.isFinite(b.mass) && Number.isFinite(b.radius) && Number.isFinite(b.radius ** 3), b.id).toBe(true);
      }
    });

    it('bodies too big for a number keep their true size as text and the right order', () => {
      expect(byId('uuz435').shownMass).toMatch(/10⁴⁹⁷/);
      expect(byId('meve1').shownRadius).toMatch(/ω³/);
      expect(byId('phyve1').radius).toBeGreaterThan(byId('meve1').radius);
      expect(byId('meve1').radius).toBeGreaterThan(byId('uuz435').radius);
      expect(byId('uuz435').radius).toBeGreaterThan(byId('mar234').radius);
    });

    it('two of them merge into one with finite numbers', () => {
      const r = hit('phyve1', 'meve1', 2e8, 90);
      expect(r.merge).not.toBeNull();
      expect(Number.isFinite(r.energyJ)).toBe(true);
    });
  });

  it('Alarastraza is 47 billion light-years across and 0.347 universes in mass', () => {
    const a = byId('alarastraza');
    expect((2 * a.radius) / 9.4607e15 / 1e9).toBeCloseTo(47, 1);
    expect(a.mass / byId('universe').mass).toBeCloseTo(0.347, 3);
    expect(a.material).toBe('plasma');
    expect(a.group).toBe('Beyond the universe');
  });

  it("Godzilla's atomic breath is a 16 ft by 4,000 mile beam that always delivers 6.3 petajoules", () => {
    const b = byId('atomicBreath');
    expect(b.group).toBe('Cosmic powers');
    expect(b.radius * 2).toBeCloseTo(16 * 0.3048, 3);
    expect(b.length!).toBeCloseTo(4000 * 1609.344, 0);
    expect(b.mass).toBeCloseTo(0.07, 6);
    expect(b.temperatureC).toBe(500000);
    expect(b.lorentzGamma!).toBeCloseTo(2.0013, 3);
    for (const target of ['earth', 'moon', 'sun']) {
      expect(hit('atomicBreath', target, 1, 90).energyJ).toBeCloseTo(6.3e15, -10);
    }
    // Only the beam's own launch is locked: a dust grain hitting it picks its own speed.
    expect(fixedLorentzGamma(byId('atomicBreath'), byId('dust'))).toBeCloseTo(2.0013, 3);
    expect(fixedLorentzGamma(byId('dust'), byId('atomicBreath'))).toBeUndefined();
    expect(fixedLorentzGamma(byId('dust'), byId('omgParticle'))).toBeGreaterThan(3e11);
    const slowDust = hit('dust', 'atomicBreath', 100, 90);
    const fastDust = hit('dust', 'atomicBreath', 1e4, 90);
    expect(fastDust.energyJ).toBeGreaterThan(slowDust.energyJ * 1000);
    // It is always absorbed by a star, from either side, at any speed and angle.
    for (const star of CATALOG.filter((x) => x.group === 'Stars')) {
      for (const angle of [10, 90]) {
        const r = hit('atomicBreath', star, 1, angle);
        expect(r.merge, star.id).not.toBeNull();
        expect(r.merge!.radius).toBe(star.radius);
        expect(r.merge!.blackHole).toBe(false);
      }
      expect(hit(star, 'atomicBreath', 3e5, 90).merge, star.id).not.toBeNull();
    }
    expect(hit('atomicBreath', 'earth', 1, 90).merge ?? null).toBeNull();
    const onEarth = hit('atomicBreath', 'earth', 1, 90);
    expect(onEarth.merge ?? null).toBeNull();
    expect(onEarth.target.regime).toBe('crater');
    expect(onEarth.target.craterDiameter).toBeGreaterThan(300);
    expect(onEarth.target.craterDiameter).toBeLessThan(1500);
    expect(fmtFixedSpeed(b.lorentzGamma!)).toMatch(/86\.\d+% of the speed of light/);
  });

  it('the Anti-Gravity Orb annihilates itself and ordinary matter, releasing E = 2mc²', () => {
    const o = byId('antiGravityOrb');
    const C2 = 299792458 ** 2;
    expect(o.group).toBe('Cosmic powers');
    expect(o.radius).toBe(70);
    expect(o.mass / byId('moon').mass).toBeCloseTo(1, 3);
    expect(o.shownMass).toMatch(/^−/);
    // Something heavier than the orb uses the whole orb up.
    for (const other of ['earth', 'jupiter', 'sun']) {
      const r = hit('antiGravityOrb', other, 4e5, 90);
      expect(r.annihilatedMass).toBeCloseTo(o.mass, -15);
      expect(r.energyJ / (2 * o.mass * C2)).toBeGreaterThan(0.999);
      expect(r.energyJ / (2 * o.mass * C2)).toBeLessThan(1.001);
      expect(r.projectile.regime).toBe('vaporize');
      expect(r.merge ?? null).toBeNull();
    }
    expect(hit('antiGravityOrb', 'earth', 4e5, 90).target.regime).toBe('vaporize');
    // Anything lighter than the orb, and any other orb, is pushed away and can never touch it.
    expect(hit('car', 'antiGravityOrb', 4e5, 90).repelled).toBe(true);
    expect(hit('antiGravityOrb', 'car', 4e5, 90).repelled).toBe(true);
    expect(hit('antiGravityOrb', 'antiGravityOrb', 4e5, 90).repelled).toBe(true);
    expect(hit('antiGravityOrb', 'strangeOrb', 4e5, 90).repelled).toBe(true);
    expect(hit('earth', 'antiGravityOrb', 4e5, 90).repelled).toBe(false);
    expect(hit('moon', 'antiGravityOrb', 4e5, 90).repelled).toBe(false); // as heavy as the orb is heavy enough
    expect(hit('antiBubble', 'antiGravityOrb', 1, 90).repelled).toBe(false); // the bubble does not move, nothing pushes it
  });

  it('the Anti-Bubble has no mass or size, never moves, and deletes whatever it touches', () => {
    const b = byId('antiBubble');
    expect(b.group).toBe('Cosmic powers');
    expect(b.shownMass).toBe('0 kg');
    expect(b.radius).toBeLessThan(1e-17);
    expect(b.radius).toBeLessThan(Math.min(...CATALOG.filter((x) => x.id !== 'antiBubble').map((x) => x.radius)));
    for (const other of ['dust', 'earth', 'sun', 'antiGravityOrb', 'strangeOrb', 'universe']) {
      for (const r of [hit('antiBubble', other, 1, 90), hit(other, 'antiBubble', 1, 90)]) {
        expect(r.effect, other).toBe('deleted');
        expect(r.energyJ).toBe(0);
        expect(r.merge ?? null).toBeNull();
        expect(r.repelled).toBe(false);
      }
    }
    const e = hit('antiBubble', 'earth', 1, 90);
    expect(e.target.regime).toBe('vaporize');
    expect(e.target.largestRemnantFraction).toBe(0);
    expect(e.target.suggestedFragments).toBe(0);
    expect(e.target.glow).toBe(0);
  });

  it('the Strange Matter Orb has no mass, 70 m radius, and turns whatever it touches into strange matter', () => {
    const o = byId('strangeOrb');
    expect(o.group).toBe('Cosmic powers');
    expect(o.radius).toBe(70);
    expect(o.mass).toBeLessThan(1e-20);
    expect(o.shownMass).toMatch(/^−0/);
    for (const other of ['dust', 'earth', 'sun', 'milkyWay']) {
      for (const r of [hit('strangeOrb', other, 1e3, 90), hit(other, 'strangeOrb', 1e3, 90)]) {
        expect(r.effect, other).toBe('strange');
        expect(r.energyJ).toBe(0);
        expect(r.merge).not.toBeNull();
        expect(r.merge!.blackHole).toBe(false);
        expect(r.merge!.radius).toBe(Math.max(o.radius, byId(other).radius));
      }
    }
    expect(hit('strangeOrb', 'earth', 1e3, 90).target.regime).toBe('rebound'); // nothing breaks: it just changes
  });

  it('the gamma-ray burst, supernova, hypernova and Big Bang release their own energy and damage by how much it is', () => {
    const energies: Record<string, number> = { supernova: 1e44, hypernova: 5e45, grb: 1e47, bigBang: 1.5e53 * 299792458 ** 2 };
    for (const [id, joules] of Object.entries(energies)) {
      const b = byId(id);
      expect(b.group).toBe('Cosmic powers');
      expect(b.blastJ).toBeCloseTo(joules, -Math.floor(Math.log10(joules)) + 8);
      expect(b.radius).toBeLessThan(Math.min(...CATALOG.filter((x) => x.special === undefined).map((x) => x.radius)));
      for (const target of ['earth', 'moon', 'sun', 'milkyWay']) {
        for (const r of [hit(id, target, 1, 90), hit(target, id, 1e6, 30)]) {
          expect(r.effect).toBe('blast');
          expect(r.energyJ / joules, `${id} on ${target}`).toBeGreaterThan(0.999999);
          expect(r.energyJ / joules, `${id} on ${target}`).toBeLessThan(1.000001);
          expect(r.merge ?? null).toBeNull();
          expect(r.repelled).toBe(false);
        }
      }
      // It does not matter what speed is passed in.
      expect(hit(id, 'earth', 1, 90).energyJ).toBe(hit(id, 'earth', 1e7, 90).energyJ);
    }
    // More energy, more damage, on the same target.
    const f = (id: string) => hit(id, 'milkyWay', 1, 90).blastFraction;
    expect(f('supernova')).toBeLessThan(f('hypernova'));
    expect(f('hypernova')).toBeLessThan(f('grb'));
    expect(f('grb')).toBeLessThan(f('bigBang'));
    expect(f('bigBang') / f('supernova')).toBeCloseTo(energies.bigBang! / 1e44, -20);
    // Small things are wiped out, enormous things barely notice.
    for (const id of Object.keys(energies)) expect(hit(id, 'earth', 1, 90).target.regime, id).toBe('vaporize');
    expect(hit('supernova', 'milkyWay', 1, 90).target.regime).toBe('rebound');
    expect(hit('bigBang', 'milkyWay', 1, 90).target.regime).toBe('vaporize');
    expect(hit('bigBang', 'hyperUniverse', 1, 90).target.regime).toBe('dent');
    // The Anti-Bubble still deletes an explosion, and an orb is not pushed away by one.
    expect(hit('antiBubble', 'supernova', 1, 90).effect).toBe('deleted');
    expect(hit('supernova', 'antiGravityOrb', 1, 90).repelled).toBe(false);
  });
});
