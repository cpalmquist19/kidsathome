# Smash Lab impact model

Pure functions in `src/sim/`. No rendering, no DOM. Everything is SI units. The model is a
**gameplay-grade estimate** built from published impact scaling laws and checked against known
collisions; it is not a hydrocode. Run the checks with `npm test`.

## Inputs and outputs

`resolveImpact({ projectile, target, speed, impactParameter })` returns, for **each** body, a
mechanical `regime` (rebound, dent, crater, fracture, shatter, disrupt, vaporize) plus numbers the
renderer needs: crater size, fragment count, largest-remnant fraction, melt and vapor fractions,
ignition, glow. Both bodies go through the same code, so "projectile" and "target" only say who was
launched.

## Steps (per body, `self` hit by `other`)

1. **Contact stress.** Normal speed `vN = v * cos(phi)` where `sin(phi)` is the impact parameter.
   Peak stress `P = vN * Z1 * Z2 / (Z1 + Z2)` with acoustic impedance `Z = density * soundSpeed`.
   `P / strength` decides rebound (<1), dent, or crater.
2. **Restitution.** `e = sqrt(e1 e2) * min(1, (sigma_min / P)^0.25)` (Johnson): bounciness drops as
   hits exceed the weaker material's strength. Dissipated energy = `(1 - e^2) * 1/2 mu vN^2`.
3. **Crater size.** Strength limit: `V = 0.2 * share * E_dissipated / strength` (hemisphere); the
   weaker body takes the larger `share`. Gravity limit: Collins, Melosh & Marcus (2005),
   `D = 1.161 (rho_i/rho_t)^(1/3) L^0.78 v^0.44 g^-0.22 sin(theta)^(1/3)`. The two are blended with
   `1/D^2 = 1/Ds^2 + 1/Dg^2`. Final diameter: `1.25 D` (simple) or `1.17 D^1.13 / Dc^0.13`
   (complex, `Dc = 3.2 km * g_earth / g`), capped at the body's diameter.
4. **Global breakup.** `Q = (1/2 mu vN^2) / m_self` against the catastrophic-disruption threshold
   `Q*_D = Q0 sf R^a + B rho R^b` (Benz & Asphaug 1999, Table III; basalt 5 km/s and ice 3 km/s
   fits, `R` in cm). `x = Q / Q*_D`. Largest remnant after Leinhardt & Stewart (2012):
   `1 - x/2` for `x < 1.8`, then `0.1 (x/1.8)^-1.5`.
5. **Thermal.** Shock energy per kg `e = (vN * Z_other / (Z_self + Z_other))^2 / 2`. Melting ramps
   in from 0.25x to 1x the material's melt energy; vaporizing from 0.5x to 1x its vapor energy. The
   mass affected is capped at 10x (melt) or 3x (vapor) the other body's mass. Material with an
   `ignitionEnergy` below `e` catches fire.
6. **Classify.** `vaporize` if half or more is vapor; `disrupt` if `x >= 1` or the damaged volume
   is the whole body; `shatter` if (brittle and `x >= 0.2`) or damaged volume >= 30%; `fracture`
   if brittle, not gravity-dominated, and (`x >= 0.05` or damaged volume >= 5%); else by stress.
   Ductile, elastic and soft materials flow instead of fragmenting, so they skip early shatter.

## Why it cannot overflow

Masses in the object list can reach 1e233 kg. A plain `m1*m2` or `R^3` overflows a double long
before that. The code uses reduced mass `m_small / (1 + m_small/m_large)`, energy per kilogram,
ratios such as `D/R`, and works in logarithms for `Q*_D`. `tests/impact.test.ts` runs absurd sizes
and checks every output stays finite.

## Calibration and known limits

| Case | Model | Observed |
|---|---|---|
| Meteor Crater (50 m iron, 12.8 km/s, 45 degrees) | about 0.9 km | 1.2 km |
| Chicxulub (10 km rock, 20 km/s, 45 degrees) | about 100 km | roughly 150-180 km |
| 2 cm iron ball at 7 km/s into iron | about 6 ball diameters | no reference yet; the test only requires 2-10 |

Both real craters come out 25-40% small. Raising `EXCAVATION_EFFICIENCY` would close the gap but
widen the error on small strength-regime impacts, so it stays until we have lab data to fit both.

- Tuned constants: `EXCAVATION_EFFICIENCY` (0.2), `MELT_MASS_MULTIPLE` (10), `VAPOR_MASS_MULTIPLE`
  (3), and each material's `strengthFactor`. Change them only with the reference cases open.
- The disruption fits were measured at 0.5-5 km/s. Below that, stress tests (step 1) decide the
  outcome and the energy test only adds to it.
- There is no atmosphere, so no air burst, drag, or ablation; this is a space-only model for now.
- Bodies are solid, uniform spheres. No layers, rubble piles, or porosity beyond a lower mass.
- Stars, gas giants, and anything below a micron or above a planet need their own presenters.

## Sources

- Benz & Asphaug (1999), "Catastrophic Disruptions Revisited", Icarus 142, Table III.
- Leinhardt & Stewart (2012), "Collisions between gravity-dominated bodies. I", ApJ 745, 79.
- Collins, Melosh & Marcus (2005), "Earth Impact Effects Program", Meteoritics & Planetary Science 40, 817.
- Johnson (1985), *Contact Mechanics*: restitution falling with impact speed.

## Very big bodies (planets, stars, black holes)

- **Minimum impact speed.** Two bodies that fall together from far away already meet at their mutual escape speed, `sqrt(2G(m1+m2)/(r1+r2))`, capped at 0.99 c. The page never lets the speed go below it and says so. Everyday objects have a negligible floor, so nothing changes for them.
- **Binding energy.** Scattering or vaporising a body for good costs at least its gravitational binding energy, `0.6 G M / R` per kg. It sets a floor for the disruption threshold `Q*_D` (the Benz & Asphaug fits are not valid for puffy red giants) and for the vaporisation energy (a star is "vaporised" only when it is unbound).
- **Shocked mass.** Only the part of a body near the contact is shocked hard. A much lighter body is shocked through and through; the heavier of two similar bodies keeps most of its mass cool, so two Earths do not both turn to gas.
- **Relativistic speeds.** The model works with the Newtonian speed that has the same kinetic energy as the relativistic one, `1/2 v'^2 = (gamma - 1) c^2`, so energies stay honest near light speed.
- **No solid surface.** Gas giants and stars (behaviour `fluid`) cannot be dented or cratered. Whatever hits them is stopped inside them and all of its kinetic energy per kg turns to heat. Black holes (behaviour `hole`) swallow anything.


## Merging

Bodies held together by their own gravity (planets, moons beyond a few hundred km, stars, white dwarfs, neutron stars, black holes) do not bounce off each other or stack. `resolveImpact` returns `merge` when:

- both bodies are self-bound (gravity stress `rho*g*R` is at least 5x the material strength; gas, plasma and black holes always are),
- neither is a black hole unless both are (anything else meeting a hole is swallowed),
- the collision energy `0.5 * mu * v^2` (mu = reduced mass, v relativistic-corrected) is below the binding energy of the merged body `0.6 G M^2 / R`: 1.5x for gas and plasma bodies, 0.5x for rocky bodies, which must also be within 50:1 in mass (a small moon hitting a planet still makes a crater).

At the gravity floor speed (the slowest two bodies can meet) a pair always fuses, head-on or not. Merged radius is the volume sum, except: black holes add radii; two neutron stars keep the larger radius, or collapse to a black hole (radius `2GM/c^2`) above 2.3 solar masses; white dwarfs shrink as `M^(-1/3)`.

Two white dwarfs with a combined mass above 1.4 solar masses (Chandrasekhar) are a `supernova`: both are vaporized and nothing merges.

In the scene (`planner.ts` `MergePlan`) the impactor fate is `merge`: the impactor sinks into the surface body, which swells to the merged radius, blends both colours (stars go yellow-white), glows and sheds hot puffs. A black-hole remnant fades to black and switches to the black-hole shader.

## Bigger than TON 618

The catalog goes on past the biggest black holes: nebulae and star clusters, galaxies, clusters and superclusters, giant black holes up to one with the mass of the observable universe, and the observable universe itself (radius 4.4e26 m, 1.5e53 kg). Gas, galaxies and structures use the `gas` and `plasma` materials, so they behave as fluid bodies (nothing solid to dent, they merge or blow apart).

A thin cloud cannot stop what crosses it. When something hits a fluid body, only the share of its column density that the cloud can stop turns into heat: `stopped = min(1, rho_cloud * R_cloud / (rho_object * r_object))`. A star crossing the Orion Nebula keeps going; a star hitting another star still deposits everything.

Lengths over about 1e16 m are shown in light-years. Energies over 1e44 J are shown in supernovae. Galaxies, clusters and nebulae are drawn by shader modes 10, 11 and 12 in `surface.ts` (glowing spiral disc, field of bright specks, wispy gas).

## Cosmic-ray particles

The Oh-My-God particle (3.2e20 eV, 1991) and the Amaterasu particle (2.4e20 eV, 2021) are protons whose speed is too close to c to store in a double (1 - v/c is about 4e-24). `Body.lorentzGamma` keeps the Lorentz factor instead, and `resolveImpact` uses `c * sqrt(2 (gamma - 1))`, the Newtonian speed with the same kinetic energy, ignoring the `speed` input. The UI locks the speed slider and shows the gap from light speed. Either body of a pair can be the particle.

## Cosmic powers: Godzilla's atomic breath

The 2024 film's beam: 16 ft (4.88 m) wide, 4,000 miles (6,437 km) long, 70 g, 500,000 °C, 6.3 PJ. It is a body with `length` set (so it is drawn as a rounded-head cylinder, `scene/beam.ts`) and `energyEv` set (so it always delivers 6.3 PJ, at β ≈ 0.866 c).
- A beam is energy, not matter. It never counts as self-bound (no merging), and it couples into what it hits as if impedance-matched (`zp = zt`, `share = 1`).
- Craters from a beam follow its yield like a surface explosion: `D ≈ 312 m × (kt/104)^(1/3.4)` (Sedan scaling). 6.3 PJ is 1.5 Mt, so about 0.5 to 0.9 km across on Earth.
- Limit: the sim uses the beam's half-width (2.44 m) as its contact radius. Against a target smaller than that the beam is the bigger body and is drawn as a ball.

## Cosmic powers: Anti-Gravity Orb

70 m radius, mass −1 Moon (stored as the positive stand-in 7.346e22 kg with `antimatter: true`; the card shows the minus sign).
- Push: it repels with the same strength as the Moon attracts. Anything has to arrive at `sqrt(2G(m1+m2)/(r1+r2))` or faster to touch it, the same floor as gravity gives for attraction (the repulsive barrier works out to the same number).
- Annihilation: on contact it destroys itself and an equal mass of ordinary matter, `m = min(orb, other)`, releasing `E = 2 m c²` (1.32e40 J when the other body is at least a Moon heavy), on top of the kinetic energy. The energy is passed through the speed (`speedEff`) so all the usual code sees it.
- Outcomes: the other body vaporizes if E is at least half of what it takes to vaporize it (`max(vaporEnergy, binding)` per kg), is disrupted above 30%, and otherwise keeps its normal outcome with maximum glow. The orb vaporizes if at least half of it is used up; a lighter object (a car) is annihilated and the orb survives, smaller.
- Like the beam, it is "energy-like": never self-bound (no merging), and impedance-matched to what it hits.

## Cosmic powers: orbs that cannot touch, the Anti-Bubble and the Strange Matter Orb

- **Repulsion.** The Anti-Gravity Orb pushes away anything lighter than itself and any other orb, so those pairs can never touch (`repels()` in `impact.ts`; `ImpactOutcome.repelled`). The page shows "Pushed away" and the Launch button is off. A body at least as heavy as the orb (the Moon, Earth, ...) can still reach it. The Anti-Bubble is never pushed away, because it does not move.
- **Anti-Bubble** (`special: 'antiBubble'`). Stand-in mass 1e-40 kg and radius 1e-18 m (smaller than every other object, so it is always the "impactor"); the card shows "0 kg" and "no fixed size". `effect: 'deleted'`: the other body ends up `vaporize` with no glow, no fragments and no energy (`energyJ = 0`). The speed slider is off. In 3D only the wide view is used (`plan.bubble`): a black void with a glowing rim grows from the impact point from t = 0 (radius `2.7 × (t/8.5)^1.7` surface radii), and the surface shader discards every fragment inside it (`uBubble`).
- **Strange Matter Orb** (`special: 'strangeOrb'`). Stand-in mass 1e-30 kg, radius 70 m; the card shows "−0 kg". `effect: 'strange'`: the pair is given a merge result (same size as the bigger body, so nothing swells), no energy is released and nothing breaks. In 3D the orb sinks in and a green front spreads over the surface body from the impact point (`uStrangeAmt`, `uStrangeFront`; the wide view keys the front to the same clock so the two views agree).
- Both are "energy-like" (never self-bound, impedance matched), like the beam and the orb.

## Cosmic powers: explosions (gamma-ray burst, supernova, hypernova, Big Bang)

Each is a body with `special: 'blast'`, a fixed energy `blastJ`, and tiny stand-in mass and radius (1e-40 kg, 2e-18 m: smaller than every ordinary object, so the other body is always the one drawn). They do not move (the speed slider is off) and go off at the impact point the moment you launch.

| Explosion | Energy | Notes |
| --- | --- | --- |
| Supernova | 1e44 J | 1 "foe", about 8 Suns of ejecta |
| Hypernova | 5e45 J | like SN 1998bw, 10 Suns of ejecta at about 22,000 km/s |
| Gamma-ray burst | 1e47 J | isotropic-equivalent energy of a bright burst, drawn with a thin jet |
| Big Bang | 1.5e53 kg × c² ≈ 1.3e70 J | the observable universe's whole mass as energy |

Damage depends only on the energy: `fraction = E / (mass × max(vaporEnergy, bindingEnergyPerKg))` is the share of the other body that the energy could vaporize. At 0.5 or more it is vaporized, 0.3 disrupted, 0.1 shattered, 1e-3 cratered, 1e-6 dented, and below that it only glows (`ImpactOutcome.blastFraction`, regime). Energy goes through `speedEff = sqrt(2E/mu)`, so `energyJ` is exactly E whatever speed is passed. In 3D only the wide view is used (`plan.blast`): a fireball grows from the impact point, the surface shader deletes everything inside the part of it that matters (`removed = cbrt(2 × fraction)` surface radii, all of the body at 0.5 or more), what is left glows, and the fireball dims into a faint remnant.
