import { Color } from 'three';
import { MATERIALS } from '../sim';
import type { MaterialId } from '../sim';

/** How a material is painted. Albedo stays below ~0.6 so the sun never blows the surface out. */
export interface Look {
  colorA: Color;
  colorB: Color;
  /** Noise frequency per local unit. */
  noiseScale: number;
  /** Bump height in local units. */
  bump: number;
  spec: number;
  shine: number;
  metal: number;
  /** Colour of a fresh fracture surface (linear). */
  inner: Color;
  /** 1 = the surface shines by itself (stars). */
  emissive: number;
}

function tone(hex: string, scale: number): Color {
  const c = new Color(hex); // sRGB hex -> linear working space
  c.multiplyScalar(scale);
  return c;
}

const TUNING: Record<MaterialId, { a: number; b: number; scale: number; bump: number; spec: number; shine: number; metal: number }> = {
  rock: { a: 0.62, b: 0.34, scale: 1.4, bump: 0.05, spec: 0.08, shine: 18, metal: 0 },
  iron: { a: 0.62, b: 0.4, scale: 3.0, bump: 0.012, spec: 0.45, shine: 55, metal: 0.8 },
  ice: { a: 0.72, b: 0.5, scale: 1.8, bump: 0.02, spec: 0.3, shine: 70, metal: 0 },
  glass: { a: 0.7, b: 0.5, scale: 2.5, bump: 0.004, spec: 0.55, shine: 140, metal: 0 },
  hardPlastic: { a: 0.7, b: 0.55, scale: 3.0, bump: 0.004, spec: 0.4, shine: 120, metal: 0 },
  rubber: { a: 0.8, b: 0.6, scale: 4.0, bump: 0.012, spec: 0.15, shine: 14, metal: 0 },
  leatherCork: { a: 0.6, b: 0.5, scale: 3.5, bump: 0.008, spec: 0.08, shine: 10, metal: 0 },
  wood: { a: 0.85, b: 0.5, scale: 2.2, bump: 0.02, spec: 0.12, shine: 16, metal: 0 },
  concrete: { a: 0.7, b: 0.45, scale: 3.0, bump: 0.03, spec: 0.04, shine: 10, metal: 0 },
  ceramic: { a: 0.85, b: 0.7, scale: 2.0, bump: 0.003, spec: 0.35, shine: 90, metal: 0 },
  aluminum: { a: 0.7, b: 0.5, scale: 3.0, bump: 0.008, spec: 0.4, shine: 50, metal: 0.7 },
  copper: { a: 0.7, b: 0.45, scale: 3.0, bump: 0.01, spec: 0.45, shine: 50, metal: 0.85 },
  gold: { a: 0.85, b: 0.6, scale: 3.0, bump: 0.006, spec: 0.55, shine: 70, metal: 0.9 },
  lead: { a: 0.6, b: 0.4, scale: 3.0, bump: 0.01, spec: 0.2, shine: 30, metal: 0.6 },
  diamond: { a: 0.9, b: 0.7, scale: 2.0, bump: 0.002, spec: 0.7, shine: 200, metal: 0 },
  organic: { a: 0.8, b: 0.55, scale: 3.0, bump: 0.006, spec: 0.12, shine: 20, metal: 0 },
  gas: { a: 1.0, b: 0.8, scale: 0.7, bump: 0, spec: 0, shine: 10, metal: 0 },
  plasma: { a: 1.0, b: 0.7, scale: 1.1, bump: 0, spec: 0, shine: 10, metal: 0 },
  degenerate: { a: 1.0, b: 0.8, scale: 1.5, bump: 0, spec: 0, shine: 10, metal: 0 },
  singularity: { a: 0, b: 0, scale: 1, bump: 0, spec: 0, shine: 10, metal: 0 },
};

/** Whole-planet looks in the shader: 0 none, 1 Earth, 2 Moon, 3 Mars, 4 Pluto, 5 banded gas giant, 6 smooth ice giant, 9 black hole. */
const PLANET_MODES: Record<string, number> = {
  earth: 1, moon: 2, mars: 3, pluto: 4,
  jupiter: 5, saturn: 5, hotJupiter: 5, wasp12b: 5, brownDwarf: 5,
  neptune: 6, uranus: 6, kepler51d: 6,
  stellarBH: 9, cygnusX1: 9, sgrA: 9, m87: 9, ton618: 9,
  phoenixA: 9, trillionBH: 9, milkyWayBH: 9, groupBH: 9, virgoBH: 9, laniakeaBH: 9, universeBH: 9,
  lmc: 10, smc: 10, m33: 10, m51: 10, milkyWay: 10, andromeda: 10, m87gal: 10, ic1101: 10,
  pleiades: 11, omegaCen: 11, localGroup: 11, virgoSC: 11, virgoCluster: 11, coma: 11, elGordo: 11, laniakea: 11, bootes: 11,
  shapley: 11, sloanWall: 11, herculesWall: 11, universe: 11,
  tenTrillionBH: 9, sombrero: 10, cartwheel: 10, centaurusA: 10, westerlund1: 11, perseus: 11, bulletCluster: 11, greatAttractor: 11, piscesCetus: 11,
  alarastraza: 11, hyperUniverse: 11, theFelon: 11, giganaurus: 11, mlti183: 11, tremendous1500: 11, grondeo: 11, mar234: 11, uuz435: 11, meve1: 11, phyve1: 11, ulturuas: 10,
  ring: 12, helix: 12, rosette: 12, pillars: 12, crab: 12, orion: 12, carina: 12, tarantula: 12,
};
export function planetModeFor(bodyId: string): number {
  return PLANET_MODES[bodyId] ?? 0;
}

/** Ground colours (linear) for the flat close-up patch of a planet, where the planet shader is not used. */
const GROUND: Record<string, [[number, number, number], [number, number, number]]> = {
  earth: [[0.3, 0.24, 0.13], [0.13, 0.17, 0.07]],
  moon: [[0.3, 0.3, 0.3], [0.15, 0.15, 0.15]],
  mars: [[0.5, 0.22, 0.1], [0.24, 0.11, 0.07]],
  pluto: [[0.5, 0.42, 0.35], [0.28, 0.2, 0.16]],
};

/** Per-object colour overrides (sRGB hex: light, dark, optional fresh-fracture colour) so a car is not the same grey as a cannonball. */
const TINT: Record<string, [string, string, string?]> = {
  snowball: ['#f4f8fb', '#cfdbe6'],
  watermelon: ['#3f8a3a', '#1f5a28', '#e0354a'],
  pumpkin: ['#e8761d', '#b4510f', '#f2a53a'],
  egg: ['#f2e6cf', '#d9c7a6', '#f5c542'],
  lightBulb: ['#e8f1f4', '#c4d6dc'],
  rubberDuck: ['#ffd21f', '#e0a800', '#f7c600'],
  soccerBall: ['#f4f4f4', '#2a2a2a', '#ddd'],
  basketball: ['#d9712b', '#8a3f12', '#a84e18'],
  tennisBall: ['#d5e83a', '#a8bd1d', '#b9cc2a'],
  golfBall: ['#f6f6f2', '#d8d8d2'],
  pingPong: ['#f6f2e8', '#e2d9c0'],
  brick: ['#b4533a', '#7d3524', '#8a3a28'],
  bullet: ['#b8742f', '#7a4a1e', '#5a5f66'],
  car: ['#c4262e', '#7e151c'],
  bus: ['#f4b81c', '#c48a0c'],
  boeing: ['#ececec', '#b9c2cc'],
  shuttle: ['#efefef', '#8a8d92'],
  iss: ['#e6e6e6', '#c9a64a'],
  titanic: ['#26292e', '#14161a', '#6a2a1c'],
  eiffel: ['#7d6a52', '#4e4130'],
  liberty: ['#5fae98', '#3c7f70', '#b46a3a'],
  empire: ['#aaa9a2', '#767670'],
  pyramid: ['#cfb27a', '#8f7648'],
  house: ['#d9c9a3', '#8b6b43'],
  chelyabinsk: ['#4a443f', '#26221f'],
  tunguska: ['#6b625a', '#3a342f'],
  apophis: ['#6e6962', '#3b3834'],
  bennu: ['#3d3c3b', '#1f1e1e'],
  ryugu: ['#403f3e', '#222120'],
  oumuamua: ['#7a3d28', '#3c1c12'],
  halley: ['#2f2d2c', '#161514'],
  eros: ['#7b6a58', '#40362c'],
  enceladus: ['#f4f9fc', '#d2e2ee'],
  phobos: ['#6a5f55', '#35302b'],
  vesta: ['#9a9187', '#554f48'],
  ceres: ['#8b8a86', '#4b4a47'],
  charon: ['#8f8680', '#4d4642'],
  triton: ['#d9c9c2', '#9c8a83'],
  europa: ['#e6dfd2', '#a1704f'],
  io: ['#e6d24a', '#b44d1c'],
  titan: ['#c98a3a', '#7d4d1a'],
  callisto: ['#5c5148', '#2c2621'],
  ganymede: ['#8f8780', '#4e4843'],
  mercury: ['#8c8782', '#4a4743'],
  venus: ['#e1c58a', '#a0793a'],
  kepler452b: ['#6f8f4f', '#3a5a45'],
  cancri55e: ['#ff7a1c', '#2a0f08'],
  proximab: ['#9a5a3c', '#3f2418'],
  superEarth: ['#5d7a8a', '#2e4a52'],
  kepler10c: ['#7a5f8a', '#3c2d4a'],
  gj1214b: ['#7fb2c9', '#3d6f8a'],
  kepler51d: ['#e9c8a8', '#c99c8a'],
  neptune: ['#5b86e8', '#2e49a8'],
  uranus: ['#bfeaf0', '#8ecdd6'],
  saturn: ['#ead9a8', '#b69a64'],
  jupiter: ['#ecd9b8', '#a9693f'],
  hotJupiter: ['#3b4fb8', '#1c2260'],
  wasp12b: ['#2a2230', '#6b1d14'],
  brownDwarf: ['#a64d79', '#4a1c3a'],
  proximaCen: ['#ff7a45', '#a8260f'],
  trappist1: ['#ff8a4a', '#b53a12'],
  barnard: ['#ff8e52', '#b8421a'],
  sun: ['#ffd070', '#ff8a1c'],
  sirius: ['#cfe0ff', '#8fb2ff'],
  vega: ['#c4d6ff', '#86a8ff'],
  siriusB: ['#dfe9ff', '#a9c3ff'],
  neutronStar: ['#d8e6ff', '#8fb0ff'],
  pollux: ['#ffc067', '#d9791e'],
  arcturus: ['#ffb067', '#d3601a'],
  aldebaran: ['#ff9d52', '#c24a12'],
  rigel: ['#cfe0ff', '#7fa6ff'],
  antares: ['#ff6a3a', '#a01a0a'],
  betelgeuse: ['#ff7a3d', '#b22a0c'],
  vycma: ['#ff6a45', '#8e1408'],
  uyScuti: ['#ff6e3a', '#951a08'],
  stephenson218: ['#ff6a3a', '#7e1006'],
  r136a1: ['#b4ccff', '#6f98ff'],
  stellarBH: ['#000000', '#000000'],
  cygnusX1: ['#000000', '#000000'],
  sgrA: ['#000000', '#000000'],
  m87: ['#000000', '#000000'],
  ton618: ['#000000', '#000000'],
  phoenixA: ['#000000', '#000000'], trillionBH: ['#000000', '#000000'], milkyWayBH: ['#000000', '#000000'],
  groupBH: ['#000000', '#000000'], virgoBH: ['#000000', '#000000'], laniakeaBH: ['#000000', '#000000'], universeBH: ['#000000', '#000000'],
  // Galaxies: core colour, then arm colour.
  lmc: ['#ffe9c4', '#8fb2ff'], smc: ['#ffe0b0', '#8aa8ff'], m33: ['#ffe9c4', '#7fa6ff'], m51: ['#ffeccc', '#6f98ff'],
  milkyWay: ['#ffe2a8', '#86a8ff'], andromeda: ['#ffdca0', '#9ab4ff'], m87gal: ['#ffe3a8', '#d8b070'], ic1101: ['#ffd890', '#c89858'],
  // Clusters and structures: colour of the bright specks, then of the glow between them.
  pleiades: ['#cfe0ff', '#16264a'], omegaCen: ['#ffe8b0', '#3a2c18'], localGroup: ['#ffe9c4', '#241a3d'],
  virgoSC: ['#ffe9c4', '#2a1d4a'], virgoCluster: ['#ffe0a8', '#34224a'], coma: ['#ffd9a0', '#3a2540'], elGordo: ['#ffd098', '#46233a'],
  laniakea: ['#ffe9c4', '#241a4a'], bootes: ['#9fb4ff', '#080a1a'], shapley: ['#ffe0b0', '#3a2250'], sloanWall: ['#ffe9c4', '#2a1d4a'],
  herculesWall: ['#dfe6ff', '#1f1a4a'], universe: ['#ffffff', '#2a1a5a'],
  // Nebulae: bright gas colour, then dark dust colour.
  tenTrillionBH: ['#000000', '#000000'],
  sombrero: ['#ffe6b0', '#9ab0e8'], cartwheel: ['#fff0d0', '#7fb0ff'], centaurusA: ['#ffd9a0', '#c8a878'],
  westerlund1: ['#cfe0ff', '#1a2250'], perseus: ['#ffd9a0', '#46233a'], bulletCluster: ['#ffe0b0', '#3a1e48'],
  greatAttractor: ['#ffe9c4', '#301f50'], piscesCetus: ['#ffe9c4', '#251a4a'],
  ring: ['#8fe8ff', '#ff6a5a'], helix: ['#6fb8ff', '#ff9a5a'], rosette: ['#ff5a7a', '#4a2a6a'],
  grb: ['#c8a0ff', '#6a2fd0'], supernova: ['#ffb060', '#d04010'], hypernova: ['#a0c8ff', '#2050d0'], bigBang: ['#ffffff', '#ffd9a0'], strangeOrb: ['#7dff9a', '#0a8f3c', '#caffd8'], antiBubble: ['#101018', '#000000', '#334466'], antiGravityOrb: ['#c9b6ff', '#2a0f6e', '#e8f4ff'], atomicBreath: ['#ffd9ff', '#ff4fd8', '#ff9af0'], lemoraBreath: ['#2f6bff', '#0a1a8c', '#5aa8ff'],  gozdillaPulse: ['#ffb060', '#d04010'], alarastraza: ['#ffffff', '#2a1a5a'], hawkramenshon: ['#d9a0ff', '#7a2fd0'], hyperUniverse: ['#ffffff', '#301a6a'], theFelon: ['#ff9a6a', '#3a1550'],
  giganaurus: ['#ffd9a0', '#3a1e5a'], mlti183: ['#c8d8ff', '#1a2860'], ulturuas: ['#ffd0e8', '#a090ff'],
  tremendous1500: ['#ffe0a0', '#4a1a2a'], grondeo: ['#a8ffd8', '#143a3a'], mar234: ['#ffb0e0', '#40204a'],
  uuz435: ['#ffee99', '#4a3510'], meve1: ['#9ad8ff', '#10304f'], phyve1: ['#ffffff', '#4a0f3f'],
  pillars: ['#ffb066', '#3d1f2e'], crab: ['#6fd6ff', '#ff7a3d'], orion: ['#ff6a9a', '#3a5cff'], carina: ['#ff8a7a', '#2a4a9a'], tarantula: ['#ff5a8a', '#5a2a7a'],
};

const INNER: Record<MaterialId, [number, number, number]> = {
  rock: [0.42, 0.37, 0.33],
  iron: [0.55, 0.57, 0.6],
  ice: [0.8, 0.9, 0.95],
  glass: [0.55, 0.75, 0.8],
  hardPlastic: [0.35, 0.2, 0.6],
  rubber: [0.45, 0.12, 0.08],
  leatherCork: [0.55, 0.4, 0.25],
  wood: [0.6, 0.42, 0.22],
  concrete: [0.35, 0.35, 0.33],
  ceramic: [0.8, 0.72, 0.55],
  aluminum: [0.55, 0.57, 0.6],
  copper: [0.6, 0.38, 0.22],
  gold: [0.75, 0.55, 0.15],
  lead: [0.3, 0.32, 0.35],
  diamond: [0.7, 0.85, 0.95],
  organic: [0.7, 0.12, 0.1],
  gas: [0.8, 0.6, 0.4],
  plasma: [1, 0.7, 0.3],
  degenerate: [0.8, 0.9, 1],
  singularity: [0, 0, 0],
};

export function lookFor(id: MaterialId, bodyId?: string): Look {
  const t = TUNING[id];
  const base = MATERIALS[id].color;
  const look: Look = { colorA: tone(base, t.a), colorB: tone(base, t.b), noiseScale: t.scale, bump: t.bump, spec: t.spec, shine: t.shine, metal: t.metal, inner: new Color(...INNER[id]), emissive: id === 'plasma' || id === 'degenerate' ? 1 : 0 };
  const tint = bodyId ? TINT[bodyId] : undefined;
  if (tint) {
    look.colorA = new Color(tint[0]);
    look.colorB = new Color(tint[1]);
    if (tint[2]) look.inner = new Color(tint[2]);
  }
  const ground = bodyId ? GROUND[bodyId] : undefined;
  if (ground) {
    look.colorA = new Color(ground[0][0], ground[0][1], ground[0][2]);
    look.colorB = new Color(ground[1][0], ground[1][1], ground[1][2]);
  }
  return look;
}
