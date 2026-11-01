import type { Body, BodyOutcome, ImpactInput, ImpactOutcome, Regime } from '../sim';
import { MATERIALS, SEVERITY } from '../sim';

/**
 * Shot planner: pure math, no rendering.
 *
 * The scene shows one impact in two coordinate frames so that nothing the GPU sees is ever
 * too big or too small for a 32-bit float:
 *
 *  - GLOBAL frame: 1 unit = the radius of the larger ("surface") body. Used for the approach
 *    and the aftermath, where both bodies are in view.
 *  - LOCAL frame: 1 unit = `unit` metres, chosen so the smaller body ("impactor") is at most
 *    1 unit in radius and the finished crater is at most CRATER_RADIUS_UNITS in radius.
 *    Used for the close-up. The surface is built as a patch around the impact point with
 *    double-precision math, so even an Earth-sized surface costs the GPU nothing extra.
 *
 * In both frames the impact point is the origin, the surface normal there is +Y, and the
 * impactor flies along `dir` = (cos a, -sin a, 0), a = angle above the surface.
 */

/** Arc-length radius of the local surface patch, in local units. */
export const PATCH_RADIUS = 10;
/** The finished crater is never wider than this radius (local units). */
export const CRATER_RADIUS_UNITS = 4;
/** Smallest radius the impactor is drawn at in the local frame (keeps it findable). */
export const MIN_VISIBLE_RADIUS = 2e-3;
/** Vertical field of view of the global camera, degrees. */
export const GLOBAL_FOV_DEG = 40;
/** The global camera is framed for at least this aspect ratio (width / height). */
const FRAMING_ASPECT = 1.3;

export type Vec3 = readonly [number, number, number];

/** What the impactor does at contact. */
export type Fate = 'bounce' | 'embed' | 'crack' | 'shatter' | 'vaporize' | 'merge';

export interface Deformation {
  kind: 'none' | 'dent' | 'crater';
  /** Arc-length radius from the impact point to the rim, local units. */
  radius: number;
  /** Depth below the original surface, local units. */
  depth: number;
  complex: boolean;
}

/** Presentation times in seconds. The scene is a pure function of these and of `t`. */
export interface Timeline {
  /** Global approach runs from 0 to this. */
  approachEnd: number;
  /** Fade through white while the scene switches to the local frame. */
  cutEnd: number;
  /** The moment of contact (local frame). */
  contact: number;
  /** The close-up ends here. */
  impactEnd: number;
  /** Fade through white back to the global frame. */
  returnEnd: number;
  end: number;
}

export interface MergePlan {
  /** Radius of the merged body relative to the surface body's radius. */
  scale: number;
  /** The remnant collapses into a black hole. */
  blackHole: boolean;
  /** How hot the merger gets, 0..1. */
  glow: number;
  /** Share of the merged mass that came from the impactor, 0..1. Blends the two colours. */
  impactorShare: number;
}

export interface BlastPlan {
  kind: 'grb' | 'supernova' | 'hypernova' | 'bigBang';
  /** Share of the energy needed to vaporize the target (1 or more: all of it goes). */
  fraction: number;
  /** Final radius of the region the fireball erases, in surface radii. 0 when the target only gets scorched. */
  removed: number;
  /** Final radius of the fireball, in surface radii. */
  fire: number;
  /** How hot what is left glows, 0..1. */
  heat: number;
}

export interface ShotPlan {
  /** True when the larger body is the one the player launched. Motion is shown relative to it. */
  surfaceIsProjectile: boolean;
  surface: Body;
  impactor: Body;
  surfaceOutcome: BodyOutcome;
  impactorOutcome: BodyOutcome;

  /** Metres per local render unit. */
  unit: number;
  /** Surface radius in local units. Can be astronomically large; use only in double precision. */
  rsLocal: number;
  /** Impactor radius in local units as drawn (>= MIN_VISIBLE_RADIUS, <= 1). */
  riLocal: number;
  /** Impactor radius in local units, true to scale. */
  riLocalTrue: number;
  /** Impactor radius in global units (surface radius = 1) as drawn, true to scale. */
  riGlobal: number;

  /** Unit vector the impactor travels along (towards the surface). */
  dir: Vec3;
  angleDeg: number;

  deform: Deformation;
  /** Half-angle of the local surface patch seen from the surface centre, radians, in (0, PI]. */
  patchAngle: number;
  /** True when the patch is the whole sphere (the surface body is small in local units). */
  patchIsWholeSphere: boolean;

  impactorFate: Fate;
  /** The impactor mesh is still there after the hit (it bounces, embeds or just sheds chips). */
  impactorSurvives: boolean;
  /** Fraction of the impactor's diameter squashed at peak compression, 0..0.4. */
  peakSquash: number;
  /** Part of the squash that stays after the hit. */
  permanentSquash: number;
  /** Direction after a bounce, scaled by the fraction of speed kept. Null when it does not bounce away. */
  bounce: Vec3 | null;
  /** True when the surface body itself breaks apart (small bodies only). */
  surfaceDestroyed: boolean;
  /** Set when the two bodies fuse into one. The impactor sinks in and the surface body becomes the merged body. */
  merge: MergePlan | null;
  /** An Anti-Bubble is in the shot: it does not move, it grows from the impact point and deletes everything inside it. Only the wide view is used. */
  bubble: boolean;
  /** An explosion (gamma-ray burst, supernova, hypernova, Big Bang) goes off at the impact point. Only the wide view is used. */
  blast: BlastPlan | null;
  /** The surface body turns into green strange matter, spreading from the impact point. */
  strange: boolean;

  global: {
    /** Impactor distance from the impact point at t = 0. */
    startDistance: number;
    /** Impactor distance when the view cuts to the local frame. */
    cutDistance: number;
    cameraDistance: number;
    cameraTarget: Vec3;
  };
  local: {
    /** Impactor distance from contact when the local approach starts. */
    startDistance: number;
    /** Size the close-up camera frames. */
    focus: number;
    cameraNear: number;
    cameraFar: number;
  };
  timeline: Timeline;
}

const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

export const TIMELINE: Timeline = {
  approachEnd: 2.6,
  cutEnd: 2.85,
  contact: 3.75,
  impactEnd: 8.25,
  returnEnd: 8.5,
  end: 11.5,
};

function fateFor(regime: Regime, restitution: number): Fate {
  switch (regime) {
    case 'vaporize':
      return 'vaporize';
    case 'disrupt':
    case 'shatter':
      return 'shatter';
    case 'fracture':
      return 'crack';
    default:
      return restitution >= 0.15 ? 'bounce' : 'embed';
  }
}

function squashFor(o: BodyOutcome, body: Body): { peak: number; permanent: number } {
  const behavior = MATERIALS[body.material].behavior;
  const soft = behavior === 'elastic' || behavior === 'soft' ? 2.4 : 1;
  const peak = clamp((0.06 + 0.12 * Math.log10(1 + o.stressRatio)) * soft, 0.04, 0.4);
  const permanent = o.regime === 'dent' ? 0.5 * peak : o.regime === 'crater' ? 0.8 * peak : 0;
  return { peak, permanent };
}

export function planShot(input: ImpactInput, outcome: ImpactOutcome): ShotPlan {
  const surfaceIsProjectile = input.projectile.radius > input.target.radius;
  const surface = surfaceIsProjectile ? input.projectile : input.target;
  const impactor = surfaceIsProjectile ? input.target : input.projectile;
  const surfaceOutcome = surfaceIsProjectile ? outcome.projectile : outcome.target;
  const impactorOutcome = surfaceIsProjectile ? outcome.target : outcome.projectile;

  const angleDeg = clamp(outcome.impactAngleDeg, 1, 90);
  const a = (angleDeg * Math.PI) / 180;
  const dir: Vec3 = [Math.cos(a), -Math.sin(a), 0];

  // --- local frame scale -------------------------------------------------------------
  const merging = outcome.merge !== null;
  const holeDiameter = merging ? 0 : surfaceOutcome.regime === 'dent' || surfaceOutcome.regime === 'crater' || SEVERITY[surfaceOutcome.regime] >= SEVERITY.fracture
    ? surfaceOutcome.craterDiameter
    : 0;
  // A target the model says is blown apart ("disrupt"/"vaporize") must be drawn whole so every
  // piece of it is visible, however small the impactor is. Smaller shatters only count when the
  // impactor is comparable in size to the target.
  const surfaceDestroyed = !merging && (
    SEVERITY[surfaceOutcome.regime] >= SEVERITY.disrupt ||
    (SEVERITY[surfaceOutcome.regime] >= SEVERITY.shatter && surface.radius <= impactor.radius * 8));
  const craterUnit = Math.max(impactor.radius, holeDiameter / (2 * CRATER_RADIUS_UNITS));
  const wholeSphereRadius = (1.4 * PATCH_RADIUS) / Math.PI - 0.5; // local radius at which the patch is the whole sphere
  const unit = surfaceDestroyed ? Math.max(impactor.radius, surface.radius / wholeSphereRadius) : craterUnit;
  const rsLocal = surface.radius / unit;
  const riLocalTrue = impactor.radius / unit;
  const riLocal = clamp(riLocalTrue, MIN_VISIBLE_RADIUS, 1);
  const riGlobal = impactor.radius / surface.radius;

  // --- the hole in the surface -------------------------------------------------------
  let deform: Deformation = { kind: 'none', radius: 0, depth: 0, complex: false };
  if (holeDiameter > 0 && (surfaceOutcome.regime === 'dent' || SEVERITY[surfaceOutcome.regime] >= SEVERITY.crater)) {
    const radius = clamp(holeDiameter / (2 * unit), 0.05, CRATER_RADIUS_UNITS);
    const depth = clamp(surfaceOutcome.craterDepth / unit, 0.2 * radius * 0.25, 0.6 * radius);
    deform = {
      kind: surfaceOutcome.regime === 'dent' ? 'dent' : 'crater',
      radius,
      depth,
      complex: surfaceOutcome.craterIsComplex,
    };
  }

  // A cap wider than ~130 degrees is simply the whole sphere (nobody sees the far side).
  const wholeSphereThreshold = (1.4 * PATCH_RADIUS) / Math.PI;
  const patchIsWholeSphere = rsLocal <= wholeSphereThreshold;
  const patchAngle = patchIsWholeSphere ? Math.PI : PATCH_RADIUS / rsLocal;

  // --- the impactor ------------------------------------------------------------------
  // Something that falls into a body that is itself blowing apart is engulfed by the cloud.
  const surfaceBehavior = MATERIALS[surface.material].behavior;
  const surfaceIsFluid = surfaceBehavior === 'fluid' || surfaceBehavior === 'hole';
  let impactorFate: Fate = merging ? 'merge' : fateFor(impactorOutcome.regime, outcome.restitution);
  if (!merging && surfaceDestroyed && surfaceIsFluid && MATERIALS[impactor.material].behavior !== 'hole' && (impactorFate === 'embed' || impactorFate === 'bounce')) impactorFate = 'vaporize';
  // Nothing rests on top of a cloud, a star or a gas giant: whatever is not destroyed sinks in.
  const sinksIn = !merging && !surfaceDestroyed && surfaceBehavior === 'fluid' && (impactorFate === 'embed' || impactorFate === 'bounce' || impactorFate === 'crack');
  if (sinksIn) impactorFate = 'merge';
  const { peak, permanent } = squashFor(impactorOutcome, impactor);
  const keep = clamp(outcome.restitution, 0, 1);
  const impactorSurvives = impactorFate === 'bounce' || impactorFate === 'embed' || impactorFate === 'crack';
  const merged = outcome.merge;
  const merge: MergePlan | null = merged
    ? {
        scale: merged.radius / surface.radius,
        blackHole: merged.blackHole,
        glow: clamp(Math.max(surfaceOutcome.glow, impactorOutcome.glow, 0.4), 0.4, 1),
        impactorShare: outcome.effect === 'strange' ? (impactor.special === 'strangeOrb' ? 1 : 0) : impactor.mass / (impactor.mass + surface.mass),
      }
    : sinksIn
      ? { scale: 1, blackHole: false, glow: clamp(Math.max(surfaceOutcome.glow, impactorOutcome.glow, 0.3), 0.3, 1), impactorShare: 0 }
      : null;
  const rebounds = impactorSurvives && outcome.restitution >= 0.15;
  const bounce: Vec3 | null = rebounds ? [dir[0], -dir[1] * Math.max(keep, 0.05), 0] : null;

  // --- global camera -----------------------------------------------------------------
  const startG = 1.6 + 2 * riGlobal;
  const cutG = Math.max(0.12, 1.5 * riGlobal);
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const minX = -cosA * startG - riGlobal;
  const maxX = 1.6;
  const minY = -1.9;
  const maxY = sinA * startG + 2 * riGlobal;
  const halfW = (maxX - minX) / 2;
  const halfH = (maxY - minY) / 2;
  const tanHalf = Math.tan((GLOBAL_FOV_DEG * Math.PI) / 360);
  const bubble = outcome.effect === 'deleted';
  const blastBody = [input.projectile, input.target].filter((b) => b.special === 'blast').sort((x, y) => (y.blastJ ?? 0) - (x.blastJ ?? 0))[0];
  const blast: BlastPlan | null = outcome.effect === 'blast' && blastBody
    ? (() => {
        const f = outcome.blastFraction;
        const removed = f >= 0.5 ? 2.7 : f < 1e-9 ? 0 : Math.min(2.7, Math.cbrt(2 * f));
        return {
          kind: blastBody.blastKind ?? 'supernova',
          fraction: f,
          removed,
          fire: Math.min(3.1, Math.max(0.09, removed * 1.15 + 0.03)),
          heat: f >= 0.5 ? 1 : clamp((Math.log10(Math.max(f, 1e-9)) + 9) / 9, 0.05, 1),
        };
      })()
    : null;
  const cameraDistance = bubble || blast
    ? (() => {
        const ext = blast ? clamp(blast.fire * 1.25 + 1.3, 2.4, 3.9) : 3.9;
        return 1.2 * Math.max((0.846 * ext) / tanHalf, ext / (tanHalf * FRAMING_ASPECT));
      })()
    : 1.3 * Math.max(halfH / tanHalf, halfW / (tanHalf * FRAMING_ASPECT));
  const cameraTarget: Vec3 = bubble || blast ? [0, -0.5, 0] : [(minX + maxX) / 2, (minY + maxY) / 2, 0];

  // --- local camera ------------------------------------------------------------------
  const focus = Math.max(riLocal, 0.4 * deform.radius, 0.4);
  const cameraNear = 4.2 * focus + 1;
  const reach = patchIsWholeSphere ? 2 * rsLocal * Math.max(1, merge?.scale ?? 1) + 2 : PATCH_RADIUS;
  const cameraFar = clamp(Math.max(1.6 * cameraNear, 1.5 * reach), cameraNear, 24);

  return {
    surfaceIsProjectile,
    surface,
    impactor,
    surfaceOutcome,
    impactorOutcome,
    unit,
    rsLocal,
    riLocal,
    riLocalTrue,
    riGlobal,
    dir,
    angleDeg,
    deform,
    patchAngle,
    patchIsWholeSphere,
    impactorFate,
    impactorSurvives,
    peakSquash: peak,
    permanentSquash: permanent,
    bounce,
    surfaceDestroyed,
    merge,
    bubble,
    blast,
    strange: outcome.effect === 'strange' && impactor.special === 'strangeOrb',
    global: { startDistance: startG, cutDistance: cutG, cameraDistance, cameraTarget },
    local: { startDistance: 5 + 2 * riLocal, focus, cameraNear, cameraFar },
    timeline: TIMELINE,
  };
}
