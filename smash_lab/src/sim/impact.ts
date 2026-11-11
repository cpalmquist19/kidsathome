import { MATERIALS } from './materials';
import type { Body, BodyOutcome, ImpactInput, ImpactOutcome, MergeResult, Regime } from './types';
import { C_LIGHT, G, G_EARTH, J_PER_KILOTON_TNT, bindingEnergyPerKg, bulkDensity, clamp, energyEquivalentSpeed, finite, ramp, reducedMass } from './units';

/**
 * Impact model. Pure functions, SI units, no rendering. See MODEL.md for the physics behind each step.
 *
 * Design rules that keep it correct from dust grains to planets:
 *  - Work with energy PER KILOGRAM and with ratios, never with m^2 or r^3 of huge numbers.
 *  - Treat both bodies the same way. "Projectile" and "target" only name who was launched.
 *  - Mechanical outcome (regime) and thermal outcome (melt, vapor, glow) are separate results.
 */

export const SEVERITY: Record<Regime, number> = {
  rebound: 0, dent: 1, crater: 2, fracture: 3, shatter: 4, disrupt: 5, vaporize: 6,
};

// ---- Tunable constants (calibrated against the reference cases in tests/impact.test.ts) ----
/** Fraction of dissipated energy that goes into excavating material in the strength regime. */
const EXCAVATION_EFFICIENCY = 0.2;
/** Shocked mass that can melt, as a multiple of the other body's mass. */
const MELT_MASS_MULTIPLE = 10;
/** Shocked mass that can vaporize, as a multiple of the other body's mass. */
const VAPOR_MASS_MULTIPLE = 3;
/** Complex-crater transition on Earth (m); scales as 1/g elsewhere. */
const EARTH_COMPLEX_TRANSITION = 3200;

/** Benz & Asphaug (1999) Table III fits, CGS units (erg/g, R in cm): basalt at 5 km/s, ice at 3 km/s. */
const DISRUPTION_FIT = {
  rock: { Q0: 9.0e7, B: 0.5, a: -0.36, b: 1.36 },
  ice: { Q0: 1.6e7, B: 1.2, a: -0.39, b: 1.26 },
} as const;

/** ln of the catastrophic-disruption threshold Q*_D in J/kg, computed in log space so it cannot overflow. */
function lnDisruptionThreshold(body: Body): number {
  const mat = MATERIALS[body.material];
  const fit = DISRUPTION_FIT[mat.disruptionFamily];
  const lnR = Math.log(body.radius * 100); // cm
  const rhoGcc = bulkDensity(body.mass, body.radius) / 1000;
  const strengthTerm = Math.log(fit.Q0 * mat.strengthFactor) + fit.a * lnR;
  const gravityTerm = Math.log(fit.B * rhoGcc) + fit.b * lnR;
  const hi = Math.max(strengthTerm, gravityTerm);
  const lo = Math.min(strengthTerm, gravityTerm);
  const fit_q = hi + Math.log1p(Math.exp(lo - hi)) + Math.log(1e-4); // erg/g -> J/kg
  // The Benz & Asphaug fits stop being valid for huge, fluffy bodies (red giants): scattering a
  // body for good always costs at least what holds it together.
  return Math.max(fit_q, Math.log(bindingEnergyPerKg(body.mass, body.radius)));
}

/** Largest-remnant mass fraction versus Q/Q*_D, after Leinhardt & Stewart (2012). */
function largestRemnant(x: number): number {
  if (x < 1.8) return clamp(1 - 0.5 * x, 0, 1);
  return clamp(0.1 * Math.pow(x / 1.8, -1.5), 0, 1);
}

interface Contact {
  speed: number;
  cosPhi: number;
  normalSpeed: number;
  mu: number;
  peakStress: number;
  dissipated: number;
}

/** Beams and antimatter are energy, not lumps of ordinary matter: they couple into whatever they meet. */
const energyLike = (b: Body): boolean => b.length !== undefined || b.antimatter === true || b.special !== undefined;

function bodyOutcome(self: Body, other: Body, c: Contact): BodyOutcome {
  const ms = MATERIALS[self.material];
  const mo = MATERIALS[other.material];

  // Gas giants, stars and black holes have no solid surface. Whatever hits them is slowed down
  // inside them, so all of its kinetic energy per kg turns into heat, and they cannot be dented.
  const selfFluid = ms.behavior === 'fluid' || ms.behavior === 'hole';
  // A beam is energy, not a cloud of gas, so what it hits is not "falling into" it.
  const otherBeam = energyLike(other);
  const otherFluid = (mo.behavior === 'fluid' && !otherBeam) || mo.behavior === 'hole';

  // ---- Shock heating: split of the closing speed by acoustic impedance ----
  const zs = ms.density * ms.soundSpeed;
  // A beam is energy, not a lump of matter: it couples into whatever it hits as if matched to it.
  const zo = energyLike(other) ? zs : mo.density * mo.soundSpeed;
  // Something crossing a very thin cloud (a nebula, a galaxy) meets far less mass than its own
  // and keeps going: only the share of its column that the cloud can stop is heated.
  const stopped = mo.behavior === 'fluid' && !otherBeam
    ? Math.min(1, (bulkDensity(other.mass, other.radius) * other.radius) / (bulkDensity(self.mass, self.radius) * self.radius))
    : 1;
  const particleSpeed = otherFluid ? c.normalSpeed * Math.sqrt(stopped) : (c.normalSpeed * zo) / (zs + zo);
  const shockEnergy = 0.5 * particleSpeed * particleSpeed; // J/kg

  const stressRatio = c.peakStress / ms.strength;

  // ---- Global energy test: energy per kg versus the disruption threshold ----
  const lnQ = Math.log(0.5 * c.mu) + 2 * Math.log(c.normalSpeed) - Math.log(self.mass) + Math.log(stopped);
  const energyRatio = clamp(Math.exp(lnQ - lnDisruptionThreshold(self)), 0, 1e300);

  // ---- Local damage: crater size from strength and gravity limits, blended ----
  const share = otherBeam ? 1 : 1 / ms.strength / (1 / ms.strength + 1 / mo.strength); // the weaker body takes more (a beam puts it all into what it hits)
  const excavated = (EXCAVATION_EFFICIENCY * share * c.dissipated) / ms.strength; // m^3 (hemisphere)
  const dStrength = Math.cbrt((12 * excavated) / Math.PI);
  const g = Math.max((G * self.mass) / self.radius / self.radius, 1e-12);
  const dGravity =
    1.161 * Math.cbrt(mo.density / ms.density) * Math.pow(2 * other.radius, 0.78) *
    Math.pow(c.speed, 0.44) * Math.pow(g, -0.22) * Math.cbrt(Math.max(c.cosPhi, 1e-3));
  // A beam's crater follows its energy, like an explosion on the ground (Sedan: 104 kt made a 390 m crater).
  const dBlast = 312 * Math.pow(Math.max(0.5 * c.mu * c.speed * c.speed, 1) / 4.184e12 / 104, 1 / 3.4) * Math.pow(G_EARTH / g, 0.17) * Math.cbrt(Math.max(c.cosPhi, 1e-3));
  const dGravityEff = otherBeam ? dBlast : dGravity;
  const yielded = !selfFluid && stressRatio >= 1 && dStrength > 0;
  const dTransient = yielded ? 1 / Math.sqrt(1 / (dStrength * dStrength) + 1 / (dGravityEff * dGravityEff)) : 0;
  // Hemisphere volume / sphere volume = (1/16) (D/R)^3
  const ratio = dTransient / self.radius;
  const damagedFraction = finite(ratio * ratio * ratio) / 16;

  // ---- Thermal outcome ----
  // Turning something to gas that can escape needs at least its binding energy as well.
  const vaporEnergy = Math.max(ms.vaporEnergy, bindingEnergyPerKg(self.mass, self.radius));
  const meltRamp = ramp(shockEnergy, 0.25 * ms.meltEnergy, ms.meltEnergy);
  const vaporRamp = ramp(shockEnergy, 0.5 * vaporEnergy, vaporEnergy);
  // Only the part of a body near the contact is shocked hard. A much lighter body is shocked
  // through and through, but the heavier of two similar bodies keeps most of its mass cool.
  const shockedCap = 1 - 0.75 * ramp(Math.log10(self.mass / other.mass), -1, 0.3);
  const meltFraction = meltRamp * Math.min(shockedCap, (MELT_MASS_MULTIPLE * other.mass) / self.mass);
  const vaporFraction = vaporRamp * Math.min(shockedCap, (VAPOR_MASS_MULTIPLE * other.mass) / self.mass);
  const ignites = ms.ignitionEnergy !== undefined && shockEnergy >= ms.ignitionEnergy;
  const glow = clamp(Math.log10(Math.max(shockEnergy, 1e-9) / (0.1 * ms.meltEnergy)) / 2, 0, 1);

  // ---- Classify ----
  // Big bodies are held together by their own gravity, not by material strength, so they
  // crater and melt instead of cracking along fault lines.
  const gravityDominated = bulkDensity(self.mass, self.radius) * g * self.radius > 5 * ms.strength;
  const soft = ms.behavior === 'elastic' || ms.behavior === 'soft';
  const brittle = ms.behavior === 'brittle';
  let regime: Regime;
  if (ms.behavior === 'hole') regime = 'rebound';
  else if (selfFluid) regime = vaporFraction >= 0.5 ? 'vaporize' : energyRatio >= 1 ? 'disrupt' : 'rebound';
  else if (mo.behavior === 'hole') regime = 'vaporize'; // anything that meets a black hole is torn apart and swallowed
  else if (otherFluid) {
    // Falling into a gas giant or a star: it either boils away, breaks up, or sinks in whole.
    if (vaporFraction >= 0.5) regime = 'vaporize';
    else if (meltFraction >= 0.5 || energyRatio >= 1) regime = 'disrupt';
    else if (energyRatio >= 0.2) regime = 'shatter';
    else regime = 'rebound';
  }
  else if (vaporFraction >= 0.5) regime = 'vaporize';
  else if (energyRatio >= 1 || damagedFraction >= 1) regime = 'disrupt';
  // Ductile, elastic and soft things flow and tear instead of fragmenting: they only break up
  // early when a large share of their volume is excavated.
  else if ((brittle && energyRatio >= 0.2) || damagedFraction >= 0.3) regime = 'shatter';
  else if (brittle && !gravityDominated && (energyRatio >= 0.05 || damagedFraction >= 0.05)) regime = 'fracture';
  else if (stressRatio >= 1) {
    if (soft) regime = damagedFraction >= 0.05 ? 'crater' : 'dent';
    else regime = stressRatio >= 3 || damagedFraction >= 1e-4 ? 'crater' : 'dent';
  } else regime = 'rebound';

  // ---- Crater geometry (only meaningful when the body stays in one piece) ----
  const intact = SEVERITY[regime] <= SEVERITY.fracture;
  const complexLimit = 0.8 * EARTH_COMPLEX_TRANSITION * (G_EARTH / g);
  const craterIsComplex = intact && ms.behavior === 'brittle' && dTransient > complexLimit;
  let craterDiameter = 0;
  let craterDepth = 0;
  if (intact && dTransient > 0) {
    const transitionDiameter = EARTH_COMPLEX_TRANSITION * (G_EARTH / g);
    craterDiameter = craterIsComplex
      ? 1.17 * Math.pow(dTransient, 1.13) * Math.pow(transitionDiameter, -0.13)
      : 1.25 * dTransient;
    craterDiameter = Math.min(craterDiameter, 2 * self.radius);
    craterDepth = craterDiameter * (craterIsComplex ? 0.07 : ms.behavior === 'ductile' ? 0.4 : 0.2);
  }

  // ---- Fragments ----
  let remnant = largestRemnant(energyRatio);
  if (regime === 'vaporize') remnant = 0;
  else if (regime === 'disrupt') remnant = Math.min(remnant, 0.5);
  else if (regime === 'shatter') remnant = Math.min(remnant, 0.8);
  const breakup = Math.max(energyRatio, damagedFraction);
  let suggestedFragments = 0;
  if (regime === 'fracture') suggestedFragments = clamp(Math.round(4 + 40 * breakup), 4, 12);
  else if (regime === 'shatter') suggestedFragments = clamp(Math.round(16 + 40 * Math.min(1, breakup)), 16, 56);
  else if (regime === 'disrupt' || regime === 'vaporize') suggestedFragments = 64;

  const ejectaMass = intact ? 0.5 * self.mass * Math.min(damagedFraction, 1) : self.mass * (1 - remnant);

  return {
    bodyId: self.id,
    regime,
    stressRatio: finite(stressRatio),
    energyRatio: finite(energyRatio),
    damagedVolumeFraction: finite(Math.min(damagedFraction, 1e6)),
    craterDiameter: finite(craterDiameter),
    craterDepth: finite(craterDepth),
    craterIsComplex,
    ejectaMass: finite(ejectaMass),
    largestRemnantFraction: remnant,
    suggestedFragments,
    shockSpecificEnergy: finite(shockEnergy),
    meltFraction,
    vaporFraction,
    meltMass: finite(meltFraction * self.mass),
    vaporMass: finite(vaporFraction * self.mass),
    ignites,
    glow,
  };
}

const M_SUN = 1.989e30;
const CHANDRASEKHAR = 1.4 * M_SUN;
const MAX_NEUTRON_STAR = 2.3 * M_SUN;

/** Held together by its own gravity rather than by material strength (planets, moons over a few hundred km, stars, ...). */
/**
 * An Anti-Gravity Orb pushes away anything lighter than itself, and other orbs, so those pairs can never
 * touch. The Anti-Bubble does not move, so it is never pushed away: it just grows into the orb.
 */
export function repels(a: Body, b: Body): boolean {
  if (a.special === 'antiBubble' || b.special === 'antiBubble' || a.special === 'blast' || b.special === 'blast') return false;
  const pushes = (x: Body, y: Body): boolean => x.antimatter === true && (y.antimatter === true || y.mass < x.mass);
  return pushes(a, b) || pushes(b, a);
}

/**
 * The Lorentz factor a collision is locked to, if any. A cosmic-ray particle always arrives at its
 * real speed, whichever side it is on. A beam is only locked when it is the thing launched: something
 * that runs into a beam is not forced to any particular speed.
 */
export function fixedLorentzGamma(projectile: Body, target: Body): number | undefined {
  if (projectile.lorentzGamma !== undefined) return projectile.lorentzGamma;
  return target.length === undefined ? target.lorentzGamma : undefined;
}

function selfBound(body: Body): boolean {
  if (energyLike(body)) return false; // a beam or antimatter is not held together by gravity
  const ms = MATERIALS[body.material];
  if (ms.behavior === 'fluid' || ms.behavior === 'hole') return true;
  const g = (G * body.mass) / body.radius / body.radius;
  return bulkDensity(body.mass, body.radius) * g * body.radius > 5 * ms.strength;
}

/** Mass and size of the single body two merging bodies make. Rough scaling laws, not stellar evolution. */
function mergedBody(a: Body, b: Body): MergeResult {
  const big = a.mass >= b.mass ? a : b;
  const mass = a.mass + b.mass;
  const bothHoles = MATERIALS[a.material].behavior === 'hole' && MATERIALS[b.material].behavior === 'hole';
  if (bothHoles) {
    // The event horizon grows in step with the mass.
    return { mass, radius: a.radius + b.radius, blackHole: false };
  }
  if (a.material === 'degenerate' && b.material === 'degenerate') {
    if (a.radius < 1e5 && b.radius < 1e5) {
      // Two neutron stars: past about 2.3 Suns the remnant cannot hold itself up and collapses.
      if (mass > MAX_NEUTRON_STAR) return { mass, radius: (2 * G * mass) / (C_LIGHT * C_LIGHT), blackHole: true };
      return { mass, radius: big.radius, blackHole: false };
    }
    // White dwarfs shrink as they gain mass.
    return { mass, radius: big.radius * Math.pow(big.mass / mass, 1 / 3), blackHole: false };
  }
  // Everything else pools its volume (a dense star sinking into a bigger one just ends up inside it).
  return { mass, radius: Math.cbrt(a.radius ** 3 + b.radius ** 3), blackHole: false };
}

export function resolveImpact(input: ImpactInput): ImpactOutcome {
  const { projectile, target, speed } = input;
  if (!(speed > 0) || !Number.isFinite(speed)) throw new RangeError('speed must be a positive, finite number of m/s');
  for (const body of [projectile, target]) {
    if (!(body.mass > 0) || !(body.radius > 0)) throw new RangeError(`${body.id}: mass and radius must be positive`);
  }

  const offset = clamp(input.impactParameter ?? 0, 0, 0.999);
  // Near light speed use the Newtonian speed with the same kinetic energy; identical for everyday speeds.
  // Cosmic-ray particles carry their own Lorentz factor, because their speed rounds to exactly c.
  const gamma = fixedLorentzGamma(projectile, target);
  let speedEff = gamma !== undefined ? C_LIGHT * Math.sqrt(2 * (gamma - 1)) : energyEquivalentSpeed(speed);
  // Antimatter annihilates with an equal mass of ordinary matter: both turn entirely into energy,
  // E = 2 m c². That adds to the kinetic energy (shown as the speed that gives the same total).
  const bubbled = projectile.special === 'antiBubble' || target.special === 'antiBubble';
  // An explosion (the stronger one, if both are) releases its energy into the other body.
  const blast = bubbled ? undefined : [projectile, target].filter((b) => b.special === 'blast').sort((x, y) => (y.blastJ ?? 0) - (x.blastJ ?? 0))[0];
  const strange = !bubbled && !blast && (projectile.special === 'strangeOrb' || target.special === 'strangeOrb');
  const anti = !bubbled && !strange && !blast ? (projectile.antimatter ? projectile : target.antimatter ? target : undefined) : undefined;
  const annihilatedMass = anti && !(projectile.antimatter && target.antimatter) ? Math.min(anti.mass, anti === projectile ? target.mass : projectile.mass) : 0;
  const annihilationJ = 2 * annihilatedMass * C_LIGHT * C_LIGHT;
  const cosPhi = Math.sqrt(1 - offset * offset);
  const mu = reducedMass(projectile.mass, target.mass);
  if (annihilationJ > 0) speedEff = Math.sqrt(speedEff * speedEff + (2 * annihilationJ) / mu);
  // An explosion has no speed: its whole energy goes into the other body (shown as the speed that carries the same energy).
  if (blast) speedEff = Math.sqrt((2 * (blast.blastJ ?? 0)) / mu);
  const normalSpeed = speedEff * cosPhi;

  const mp = MATERIALS[projectile.material];
  const mt = MATERIALS[target.material];
  const zt0 = mt.density * mt.soundSpeed;
  const zp0 = mp.density * mp.soundSpeed;
  const zp = energyLike(projectile) ? zt0 : zp0;
  const zt = energyLike(target) ? zp0 : zt0;
  const peakStress = (normalSpeed * zp * zt) / (zp + zt);

  // Restitution falls off as hits get harder than the weaker material's strength (Johnson).
  const weakest = Math.min(mp.strength, mt.strength);
  const e0 = Math.sqrt(mp.restitution * mt.restitution);
  const restitution = peakStress > 0 ? e0 * Math.min(1, Math.pow(weakest / peakStress, 0.25)) : e0;
  const dissipated = (1 - restitution * restitution) * 0.5 * mu * normalSpeed * normalSpeed;

  const contact: Contact = { speed: speedEff, cosPhi, normalSpeed, mu, peakStress, dissipated };
  const energyJ = 0.5 * mu * speedEff * speedEff;

  const projectileOutcome = bodyOutcome(projectile, target, contact);
  const targetOutcome = bodyOutcome(target, projectile, contact);

  // Two white dwarfs that together weigh more than the Chandrasekhar limit explode completely.
  const bothWhiteDwarfs = projectile.material === 'degenerate' && target.material === 'degenerate' && projectile.radius > 1e5 && target.radius > 1e5;
  const supernova = bothWhiteDwarfs && projectile.mass + target.mass >= CHANDRASEKHAR;
  if (supernova) {
    for (const o of [projectileOutcome, targetOutcome]) {
      o.regime = 'vaporize';
      o.largestRemnantFraction = 0;
      o.suggestedFragments = 64;
      o.vaporFraction = 1;
      o.glow = 1;
    }
  }

  // The Anti-Bubble deletes what it touches. The Strange Matter Orb turns it into strange matter.
  let effect: 'none' | 'deleted' | 'strange' | 'blast' = 'none';
  let blastFraction = 0;
  if (bubbled) {
    effect = 'deleted';
    for (const [o, body] of [[projectileOutcome, projectile], [targetOutcome, target]] as const) {
      Object.assign(o, body.special === 'antiBubble'
        ? { regime: 'rebound', glow: 0, suggestedFragments: 0, vaporFraction: 0, meltFraction: 0 }
        : { regime: 'vaporize', largestRemnantFraction: 0, suggestedFragments: 0, vaporFraction: 1, meltFraction: 0, glow: 0, craterDiameter: 0, craterDepth: 0 });
    }
  } else if (blast) {
    effect = 'blast';
    const joules = blast.blastJ ?? 0;
    for (const [o, body] of [[projectileOutcome, projectile], [targetOutcome, target]] as const) {
      if (body === blast) {
        Object.assign(o, { regime: 'vaporize', glow: 1, largestRemnantFraction: 0, suggestedFragments: 0, vaporFraction: 1, meltFraction: 1 });
        continue;
      }
      // How much of the body the energy could vaporize: all of it needs its vaporization energy or its binding energy, whichever is more.
      const ms = MATERIALS[body.material];
      const need = body.mass * Math.max(ms.vaporEnergy, bindingEnergyPerKg(body.mass, body.radius));
      const frac = joules / need;
      blastFraction = Math.max(blastFraction, frac);
      const f = Math.min(1, frac);
      const regime: Regime = frac >= 0.5 ? 'vaporize' : frac >= 0.3 ? 'disrupt' : frac >= 0.1 ? 'shatter' : frac >= 1e-3 ? 'crater' : frac >= 1e-6 ? 'dent' : 'rebound';
      const bite = 2 * body.radius * Math.cbrt(2 * f);
      Object.assign(o, {
        regime, vaporFraction: f, meltFraction: Math.min(1, 2 * f), largestRemnantFraction: Math.max(0, 1 - f),
        glow: clamp((Math.log10(Math.max(frac, 1e-12)) + 9) / 9, 0.05, 1), suggestedFragments: 0,
        craterDiameter: regime === 'dent' || regime === 'crater' ? bite : 0, craterDepth: regime === 'dent' || regime === 'crater' ? bite / 2 : 0,
      });
    }
  } else if (strange) {
    effect = 'strange';
    for (const [o, body] of [[projectileOutcome, projectile], [targetOutcome, target]] as const) {
      Object.assign(o, { regime: 'rebound', glow: body.special === 'strangeOrb' ? 0 : 0.35, suggestedFragments: 0, vaporFraction: 0, meltFraction: 0, craterDiameter: 0, craterDepth: 0, largestRemnantFraction: 1 });
    }
  }

  // Annihilation: the energy goes into whatever the antimatter touched, and uses up the antimatter.
  if (annihilationJ > 0 && anti) {
    const totalJ = 0.5 * mu * speedEff * speedEff;
    for (const [o, body] of [[projectileOutcome, projectile], [targetOutcome, target]] as const) {
      const ms = MATERIALS[body.material];
      if (body === anti) {
        const eaten = annihilatedMass / anti.mass;
        o.glow = 1;
        if (eaten >= 0.5) {
          Object.assign(o, { regime: 'vaporize', largestRemnantFraction: 0, suggestedFragments: 64, vaporFraction: 1, meltFraction: 1 });
        } else {
          o.largestRemnantFraction = 1 - eaten;
        }
      } else {
        const need = body.mass * Math.max(ms.vaporEnergy, bindingEnergyPerKg(body.mass, body.radius));
        const frac = Math.min(1, totalJ / need);
        o.glow = 1;
        o.vaporFraction = Math.max(o.vaporFraction, frac);
        o.meltFraction = Math.max(o.meltFraction, frac);
        if (frac >= 0.5) {
          Object.assign(o, { regime: 'vaporize', largestRemnantFraction: 0, suggestedFragments: 64 });
        } else if (frac >= 0.3 && SEVERITY[o.regime] < SEVERITY.disrupt) {
          Object.assign(o, { regime: 'disrupt', largestRemnantFraction: Math.min(o.largestRemnantFraction, 0.5), suggestedFragments: 64 });
        }
      }
    }
  }

  // Bodies held together by their own gravity do not stack like billiard balls, and they do not
  // simply rebound: if the energy of the collision is smaller than the gravitational binding
  // energy of the pair, the two run into each other and fuse into one body. That is true even
  // head-on. Only much faster collisions (or small, strong bodies) break things apart instead.
  const holeInvolved = [projectile, target].some((b) => MATERIALS[b.material].behavior === 'hole');
  const bothHoles = MATERIALS[projectile.material].behavior === 'hole' && MATERIALS[target.material].behavior === 'hole';
  let merge: MergeResult | null = null;
  // Godzilla's beam is absorbed by any star it meets, whatever the speed or angle: the star takes in
  // the beam's mass and its energy and stays the same size.
  const beamIntoStar = [[projectile, target], [target, projectile]].some(([beam, star]) => beam!.length !== undefined && star!.group === 'Stars');
  if (effect === 'strange') {
    // The bigger of the two stays the same size and becomes strange matter (the orb weighs nothing).
    merge = { mass: projectile.mass + target.mass, radius: Math.max(projectile.radius, target.radius), blackHole: false };
  } else if (effect === 'blast') {
    // The explosion's mass joins a star that survives it (less than half vaporized); the star stays the same size, like the beam.
    const star = [projectile, target].find((b) => b !== blast && b.group === 'Stars');
    merge = star && blastFraction < 0.5 && blast ? { mass: projectile.mass + target.mass, radius: star.radius, blackHole: false } : null;
  } else if (effect === 'deleted') {
    merge = null;
  } else if (beamIntoStar) {
    const star = projectile.length !== undefined ? target : projectile;
    merge = { mass: projectile.mass + target.mass, radius: star.radius, blackHole: false };
  } else if (!supernova && (!holeInvolved || bothHoles) && selfBound(projectile) && selfBound(target)) {
    const candidate = mergedBody(projectile, target);
    const reduced = reducedMass(projectile.mass, target.mass);
    const collisionEnergy = 0.5 * reduced * speedEff * speedEff;
    const bindingEnergy = bothHoles ? Infinity : 0.6 * G * candidate.mass * (candidate.mass / candidate.radius);
    const fluidPair = [projectile, target].some((b) => MATERIALS[b.material].behavior === 'fluid');
    // Gas and plasma bodies absorb each other. Two rocky worlds fuse when they are of comparable
    // size (a giant impact); a small moon hitting a planet still makes a crater instead.
    const comparable = Math.min(projectile.mass, target.mass) >= 0.02 * Math.max(projectile.mass, target.mass);
    if (fluidPair) {
      if (collisionEnergy <= 1.5 * bindingEnergy) merge = candidate;
    } else if (comparable && collisionEnergy <= 0.5 * bindingEnergy) {
      merge = candidate;
    }
  }

  return {
    speed,
    normalSpeed,
    impactAngleDeg: (Math.acos(offset) * 180) / Math.PI,
    energyJ: effect === 'deleted' || effect === 'strange' ? 0 : finite(energyJ),
    energyKilotons: effect === 'deleted' || effect === 'strange' ? 0 : finite(energyJ / J_PER_KILOTON_TNT),
    peakStressPa: finite(peakStress),
    restitution,
    projectile: projectileOutcome,
    target: targetOutcome,
    merge,
    effect,
    blastFraction: finite(blastFraction),
    repelled: repels(projectile, target),
    annihilatedMass,
    supernova,
  };
}
