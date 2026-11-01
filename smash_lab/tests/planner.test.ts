import { describe, expect, it } from 'vitest';
import { CATALOG, byId, makeBody, resolveImpact } from '../src/sim';
import type { Body } from '../src/sim';
import { CRATER_RADIUS_UNITS, MIN_VISIBLE_RADIUS, PATCH_RADIUS, planShot } from '../src/scene/planner';
import type { ShotPlan } from '../src/scene/planner';

function plan(p: Body | string, t: Body | string, speed: number, angleDeg = 90): ShotPlan {
  const projectile = typeof p === 'string' ? byId(p) : p;
  const target = typeof t === 'string' ? byId(t) : t;
  const input = { projectile, target, speed, impactParameter: Math.cos((angleDeg * Math.PI) / 180) };
  return planShot(input, resolveImpact(input));
}

/** Every number a renderer will turn into a 32-bit float, except rsLocal (kept in doubles). */
function renderNumbers(s: ShotPlan): Record<string, number> {
  return {
    riLocal: s.riLocal,
    riGlobal: s.riGlobal,
    craterRadius: s.deform.radius,
    craterDepth: s.deform.depth,
    patchAngle: s.patchAngle,
    globalStart: s.global.startDistance,
    globalCut: s.global.cutDistance,
    globalCamera: s.global.cameraDistance,
    globalTargetX: s.global.cameraTarget[0],
    globalTargetY: s.global.cameraTarget[1],
    localStart: s.local.startDistance,
    focus: s.local.focus,
    camNear: s.local.cameraNear,
    camFar: s.local.cameraFar,
    peakSquash: s.peakSquash,
  };
}

describe('shot planner', () => {
  it('picks the larger body as the surface and keeps the impactor at most 1 local unit', () => {
    const s = plan('baseball', 'bowling', 40);
    expect(s.surface.id).toBe('bowling');
    expect(s.impactor.id).toBe('baseball');
    expect(s.surfaceIsProjectile).toBe(false);
    expect(s.riLocal).toBeCloseTo(1, 12);
    expect(s.rsLocal).toBeCloseTo(0.1085 / 0.0366, 9);
    expect(plan('bowling', 'baseball', 40).surfaceIsProjectile).toBe(true);
  });

  it('Meteor Crater: huge surface, crater about a few units wide, flat patch', () => {
    const s = plan('ironMeteoroid', 'earth', 12800, 45);
    expect(s.deform.kind).toBe('crater');
    expect(s.deform.radius).toBeGreaterThan(0.5);
    expect(s.deform.radius).toBeLessThanOrEqual(CRATER_RADIUS_UNITS);
    expect(s.patchIsWholeSphere).toBe(false);
    expect(s.patchAngle * s.rsLocal).toBeCloseTo(PATCH_RADIUS, 6);
    expect(s.dir[0]).toBeCloseTo(Math.SQRT1_2, 9);
    expect(s.dir[1]).toBeCloseTo(-Math.SQRT1_2, 9);
  });

  it('dust vs Earth: the impactor is tiny against Earth but not smaller than the pit it digs', () => {
    const s = plan('dust', 'earth', 20000);
    expect(s.riGlobal).toBeLessThan(1e-11);
    expect(s.riLocal).toBeGreaterThan(MIN_VISIBLE_RADIUS);
    expect(s.deform.kind).toBe('crater');
  });

  it('Moon hits Earth: the patch wraps the whole planet', () => {
    const s = plan('moon', 'earth', 30000);
    expect(s.patchIsWholeSphere).toBe(true);
    expect(s.patchAngle).toBeCloseTo(Math.PI, 12);
    expect(s.impactorFate).toBe('vaporize');
  });

  it('equal bodies that shatter report the surface body as destroyed', () => {
    const s = plan('marble', 'marble', 60);
    expect(s.surfaceDestroyed).toBe(true);
    expect(s.impactorFate).toBe('shatter');
  });

  it('rebounding bodies get a bounce vector pointing away from the surface', () => {
    const s = plan('marble', 'marble', 3);
    expect(s.impactorFate).toBe('bounce');
    expect(s.bounce).not.toBeNull();
    expect(s.bounce?.[1]).toBeGreaterThan(0);
    expect(s.deform.kind).toBe('none');
  });

  it('keeps every render number finite and small for every catalog pair, speed and angle', async () => {
    const speeds = [1, 1e3, 1e6, 1e8];
    const angles = [10, 90];
    let checked = 0;
    for (const p of CATALOG) {
      await new Promise((resolve) => setTimeout(resolve, 0)); // let the test runner breathe
      for (const t of CATALOG) {
        for (const v of speeds) {
          for (const ang of angles) {
            const s = plan(p, t, v, ang);
            const where = `${p.id}->${t.id} @${v} m/s ${ang} deg`;
            expect(Number.isFinite(s.rsLocal) && s.rsLocal >= 1 - 1e-9, `${where} rsLocal`).toBe(true);
            for (const [name, value] of Object.entries(renderNumbers(s))) {
              expect(Number.isFinite(value), `${where} ${name}`).toBe(true);
              expect(Math.abs(value), `${where} ${name}`).toBeLessThan(60);
            }
            expect(s.riLocal, where).toBeGreaterThanOrEqual(MIN_VISIBLE_RADIUS);
            expect(s.riLocal, where).toBeLessThanOrEqual(1);
            expect(s.riGlobal, where).toBeLessThanOrEqual(1);
            expect(s.patchAngle, where).toBeGreaterThan(0);
            expect(s.patchAngle, where).toBeLessThanOrEqual(Math.PI + 1e-12);
            expect(s.deform.radius, where).toBeLessThanOrEqual(CRATER_RADIUS_UNITS);
            expect(s.deform.depth, where).toBeLessThanOrEqual(s.deform.radius + 1e-12);
            checked++;
          }
        }
      }
    }
    expect(checked).toBe(CATALOG.length ** 2 * 8);
  }, 240_000);

  it('survives absurd sizes without NaN', () => {
    const huge = makeBody({ id: 'huge', name: 'Huge', emoji: '', radius: 4.7e227, mass: 6.2e233, material: 'rock', blurb: '' });
    const tiny = makeBody({ id: 'tiny', name: 'Tiny', emoji: '', radius: 5e-37, mass: 7.4e-106, material: 'ice', blurb: '' });
    for (const [a, b] of [[huge, tiny], [tiny, huge], [huge, huge], [tiny, tiny]] as const) {
      const s = plan(a, b, 1e5, 40);
      for (const value of Object.values(renderNumbers(s))) expect(Number.isFinite(value)).toBe(true);
    }
  });

  it('draws a disrupted target whole, even when the impactor is tiny', () => {
    const s = plan('rubberBall', 'boulder', 1e6, 45);
    expect(s.surfaceOutcome.regime).toBe('disrupt');
    expect(s.surfaceDestroyed).toBe(true);
    expect(s.patchIsWholeSphere).toBe(true);
    expect(s.riLocal).toBeLessThanOrEqual(1);
  });

  it('plans a merge as one body: the impactor does not survive and the surface becomes the merged body', () => {
    for (const [a, b, speed] of [['vega', 'pollux', 373e3], ['neutronStar', 'neutronStar', 1.76e8], ['sun', 'sun', 618e3], ['earth', 'mars', 10e3]] as const) {
      const s = plan(a, b, speed, 90);
      expect(s.merge, `${a}+${b}`).not.toBeNull();
      expect(s.impactorFate).toBe('merge');
      expect(s.impactorSurvives).toBe(false);
      expect(s.surfaceDestroyed).toBe(false);
      expect(s.bounce).toBeNull();
      expect(Number.isFinite(s.merge!.scale) && s.merge!.scale > 0).toBe(true);
    }
    expect(plan('neutronStar', 'neutronStar', 1.76e8, 90).merge!.blackHole).toBe(true);
  });

  it('anything that survives a hit on a cloud, star or gas giant sinks in instead of resting on top', () => {
    for (const [a, b, speed] of [['phoenixA', 'ic1101', 1.19e6], ['cygnusX1', 'orion', 12.9e3], ['stellarBH', 'jupiter', 5e4], ['neutronStar', 'orion', 2e4]] as const) {
      const s = plan(a, b, speed, 45);
      expect(s.surfaceDestroyed, `${a}->${b}`).toBe(false);
      expect(s.impactorSurvives, `${a}->${b}`).toBe(false);
      expect(s.impactorFate, `${a}->${b}`).toBe('merge');
      expect(s.merge, `${a}->${b}`).not.toBeNull();
    }
  });

  it('plans the Anti-Bubble as a wide-view-only shot and the strange orb as a spreading conversion', () => {
    const b = plan('antiBubble', 'earth', 1);
    expect(b.bubble).toBe(true);
    expect(b.strange).toBe(false);
    expect(plan('dust', 'antiBubble', 1).bubble).toBe(true);
    const o = plan('strangeOrb', 'earth', 1e3);
    expect(o.strange).toBe(true);
    expect(o.bubble).toBe(false);
    expect(o.merge).not.toBeNull();
    expect(o.merge!.impactorShare).toBe(1);
    expect(o.merge!.scale).toBeCloseTo(1, 6);
    // When the orb is the bigger body, the small thing sinks into it and the orb stays as big and green as it was.
    const small = plan('dust', 'strangeOrb', 1e3);
    expect(small.strange).toBe(false);
    expect(small.merge!.scale).toBeCloseTo(1, 6);
    for (const s of [b, o, small]) for (const [k, v] of Object.entries(renderNumbers(s))) expect(Number.isFinite(v), k).toBe(true);
  });

  it('plans explosions as wide-view shots whose fireball grows with the energy', () => {
    const sun = plan('supernova', 'earth', 1);
    expect(sun.blast).not.toBeNull();
    expect(sun.blast!.kind).toBe('supernova');
    expect(sun.blast!.removed).toBeCloseTo(2.7, 6); // Earth is wiped out
    const small = plan('supernova', 'milkyWay', 1);
    const big = plan('bigBang', 'milkyWay', 1);
    expect(small.blast!.removed).toBeLessThan(big.blast!.removed);
    expect(plan('grb', 'earth', 1, 50).blast!.kind).toBe('grb');
    for (const s of [sun, small, big, plan('hypernova', 'sun', 1)]) {
      expect(s.bubble).toBe(false);
      expect(s.blast!.fire).toBeGreaterThan(0);
      expect(s.blast!.heat).toBeGreaterThan(0);
      for (const [k, v] of Object.entries(renderNumbers(s))) expect(Number.isFinite(v), k).toBe(true);
    }
  });
});
