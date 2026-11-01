/** Physical constants and small numeric helpers. Everything in the sim is SI (m, kg, s, J, Pa). */

export const G = 6.6743e-11; // m^3 kg^-1 s^-2
export const G_EARTH = 9.80665; // m s^-2
export const J_PER_KILOTON_TNT = 4.184e12;
export const C_LIGHT = 2.998e8; // m s^-1

/** Specific gravitational binding energy of a uniform ball, J/kg: 3/5 G M / R. Unbinding a body takes at least this. */
export const bindingEnergyPerKg = (mass: number, radius: number): number => (0.6 * G * mass) / radius;

/** Speed two bodies reach at contact when they fall together from far away at rest, m/s. Capped just under light speed. */
export function minContactSpeed(m1: number, r1: number, m2: number, r2: number): number {
  return Math.min(Math.sqrt((2 * G * (m1 + m2)) / (r1 + r2)), 0.99 * C_LIGHT);
}

/**
 * The Newtonian speed v' with the same kinetic energy as relativistic speed v, so that
 * 1/2 m v'^2 = (gamma - 1) m c^2. Equals v for everyday speeds.
 */
export function energyEquivalentSpeed(v: number): number {
  const beta = Math.min(v / C_LIGHT, 0.999999);
  if (beta < 0.01) return v * (1 + 0.375 * beta * beta);
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  return C_LIGHT * Math.sqrt(2 * (gamma - 1));
}

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

/** 0 at or below `lo`, 1 at or above `hi`, linear in between. */
export const ramp = (x: number, lo: number, hi: number): number => clamp((x - lo) / (hi - lo), 0, 1);

/** Keep results finite: NaN -> 0, +/-Infinity -> +/-1e300. */
export const finite = (x: number): number => (Number.isNaN(x) ? 0 : Number.isFinite(x) ? x : x > 0 ? 1e300 : -1e300);

/**
 * Reduced mass m1*m2/(m1+m2), written so it cannot overflow for enormous masses
 * (a plain m1*m2 overflows a double once both masses exceed ~1e154 kg).
 */
export function reducedMass(m1: number, m2: number): number {
  const small = Math.min(m1, m2);
  const large = Math.max(m1, m2);
  return small / (1 + small / large);
}

export const sphereVolume = (radius: number): number => (4 / 3) * Math.PI * radius * radius * radius;

/** Bulk density from mass and radius, ordered to avoid overflowing r^3 for huge radii. */
export const bulkDensity = (mass: number, radius: number): number => mass / radius / radius / radius / ((4 / 3) * Math.PI);
