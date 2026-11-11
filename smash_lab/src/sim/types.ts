export type MaterialId =
  | 'rock' | 'iron' | 'ice' | 'glass' | 'hardPlastic' | 'rubber' | 'leatherCork' | 'wood'
  | 'concrete' | 'ceramic' | 'aluminum' | 'copper' | 'gold' | 'lead' | 'diamond' | 'organic'
  | 'gas' | 'plasma' | 'degenerate' | 'singularity';

/**
 * How a material fails: brittle = cracks and shatters, ductile = dents and flows, elastic = bounces,
 * soft = squashes, fluid = no solid surface (gas giants, stars), hole = black hole.
 */
export type Behavior = 'brittle' | 'ductile' | 'elastic' | 'soft' | 'fluid' | 'hole';

export interface Material {
  id: MaterialId;
  name: string;
  behavior: Behavior;
  /** Typical solid density, kg/m^3. */
  density: number;
  /** Bulk stress-wave speed, m/s. Density x this = acoustic impedance. */
  soundSpeed: number;
  /** Tensile strength (brittle) or yield strength (everything else), Pa. */
  strength: number;
  /** Low-speed coefficient of restitution for a hit on a similar object. */
  restitution: number;
  /** Specific energy to fully melt from room temperature, J/kg. */
  meltEnergy: number;
  /** Specific energy to vaporize from room temperature, J/kg. */
  vaporEnergy: number;
  /** Specific heat needed to reach ignition temperature, J/kg. Absent = does not burn. */
  ignitionEnergy?: number;
  /** Which Benz & Asphaug (1999) disruption fit this material borrows. */
  disruptionFamily: 'rock' | 'ice';
  /** Scales the strength-dominated disruption threshold relative to basalt (=1). */
  strengthFactor: number;
  /** CSS color used by the UI (and later the renderer). */
  color: string;
}

/** A sphere with a material. Mass can differ from material density x volume (planets, porous comets). */
export interface Body {
  id: string;
  name: string;
  emoji: string;
  /** m */
  radius: number;
  /** kg */
  mass: number;
  material: MaterialId;
  blurb: string;
  /** Picker group, e.g. 'Everyday'. */
  group: string;
  /**
   * Set for things that always arrive at the same speed (cosmic-ray particles): the Lorentz
   * factor, 1 / sqrt(1 - v^2/c^2). The speed is far too close to c to store, so the factor is kept.
   */
  lorentzGamma?: number;
  /** Shown instead of `mass` when the true value is too big for a double (the number used is a stand-in). */
  shownMass?: string;
  /** Shown instead of `radius` when the true value is too big for a double. */
  shownRadius?: string;
  /** Energy the particle arrives with, in electron volts (for display). */
  energyEv?: number;
  /** Overall length in m, for long thin things such as a beam (radius is then half the width). */
  length?: number;
  /** Antimatter: annihilates itself and an equal mass of ordinary matter on contact. `mass` is then the size of the orb (positive). */
  antimatter?: boolean;
  /**
   * Cosmic powers that are not ordinary matter. 'antiBubble' sits still, grows from nothing and deletes
   * whatever it touches. 'strangeOrb' turns whatever it touches into strange matter. Their mass and
   * radius are tiny or stand-in numbers.
   */
  special?: 'antiBubble' | 'strangeOrb' | 'blast';
  /** For 'blast': the energy it releases, J, and which kind of explosion it is. */
  blastJ?: number;
  blastKind?: 'grb' | 'supernova' | 'hypernova' | 'bigBang';
  /** Temperature in °C, shown on the card. */
  temperatureC?: number;
  /** Shown instead of the temperature or energy when the true value is too big for a double. */
  shownTemperature?: string;
  shownEnergy?: string;
}

/** Mechanical outcome for one body, ordered from mildest to most violent. */
export type Regime = 'rebound' | 'dent' | 'crater' | 'fracture' | 'shatter' | 'disrupt' | 'vaporize';

export interface ImpactInput {
  projectile: Body;
  target: Body;
  /** Relative speed at contact, m/s. */
  speed: number;
  /**
   * Offset of the two centers perpendicular to the approach direction, as a fraction of the
   * sum of the radii: 0 = head-on, near 1 = grazing. Impact angle above the surface = acos(offset).
   */
  impactParameter?: number;
}

export interface BodyOutcome {
  bodyId: string;
  regime: Regime;
  /** Peak contact stress divided by this body's strength. */
  stressRatio: number;
  /** Energy delivered per kg divided by the catastrophic-disruption threshold (Q / Q*_D). */
  energyRatio: number;
  /** Share of this body's volume that the impact damages or excavates (0..1+; >=1 means destroyed). */
  damagedVolumeFraction: number;
  /** Final rim-to-rim crater (or dent) diameter, m. 0 when the body is shattered or destroyed. */
  craterDiameter: number;
  craterDepth: number;
  craterIsComplex: boolean;
  /** Mass thrown out of the crater, or of fragments when the body breaks up, kg. */
  ejectaMass: number;
  /** Largest surviving piece as a fraction of the original mass (0..1). */
  largestRemnantFraction: number;
  /** How many chunks the renderer should split the body into (0 = keep whole). */
  suggestedFragments: number;
  /** Specific internal energy of the shocked material, J/kg. */
  shockSpecificEnergy: number;
  meltFraction: number;
  vaporFraction: number;
  meltMass: number;
  vaporMass: number;
  /** Heat reaches the material's ignition point. */
  ignites: boolean;
  /** 0..1 glow level for effects (0 = cold, 1 = white-hot). */
  glow: number;
}

/** Two bodies that fuse into one instead of breaking each other apart. */
export interface MergeResult {
  /** Mass of the single new body, kg. */
  mass: number;
  /** Radius of the single new body, m. */
  radius: number;
  /** The merged remnant is heavy enough to collapse into a black hole. */
  blackHole: boolean;
}

export interface ImpactOutcome {
  speed: number;
  /** Speed component along the contact normal that does the damage, m/s. */
  normalSpeed: number;
  /** Impact angle above the surface in degrees (90 = head-on). */
  impactAngleDeg: number;
  /** Kinetic energy available in the center-of-mass frame, J. */
  energyJ: number;
  /** Kilotons of TNT with the same energy. */
  energyKilotons: number;
  /** Peak contact stress between the two bodies, Pa. */
  peakStressPa: number;
  /** Effective coefficient of restitution at this speed (drops toward 0 as hits get harder). */
  restitution: number;
  projectile: BodyOutcome;
  target: BodyOutcome;
  /** Set when the two bodies fuse into one; null when they break, bounce or just dent each other. */
  merge: MergeResult | null;
  /** Something special happened to the bodies: one was deleted, or turned to strange matter. */
  effect: 'none' | 'deleted' | 'strange' | 'blast';
  /** For 'blast': the energy it released as a share of the energy needed to vaporize the other body (1 or more = vaporized). */
  blastFraction: number;
  /** An Anti-Gravity Orb pushes this pair apart, so they can never touch. */
  repelled: boolean;
  /** Mass of ordinary matter an antimatter body annihilated with an equal mass of itself, kg (0 if none). */
  annihilatedMass: number;
  /** Two white dwarfs that together pass the Chandrasekhar limit blow up completely. */
  supernova: boolean;
}
