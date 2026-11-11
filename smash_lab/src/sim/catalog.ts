import { MATERIALS } from './materials';
import type { Body, MaterialId } from './types';
import { C_LIGHT, sphereVolume } from './units';

const EV_J = 1.602176634e-19;

interface BodySpec {
  id: string;
  name: string;
  emoji: string;
  radius: number;
  material: MaterialId;
  /** Omit to use material density x sphere volume. */
  mass?: number;
  group?: string;
  /** Cosmic-ray particles: the energy it always arrives with, in eV. Fixes its speed. */
  energyEv?: number;
  /** Real size text, when the real number is too big for a double and `mass`/`radius` are stand-ins. */
  shownMass?: string;
  shownRadius?: string;
  /** Overall length in m for a long thin object (a beam); `radius` is then half its width. */
  length?: number;
  temperatureC?: number;
  shownTemperature?: string;
  shownEnergy?: string;
  antimatter?: boolean;
  special?: 'antiBubble' | 'strangeOrb' | 'blast';
  blastJ?: number;
  blastKind?: 'grb' | 'supernova' | 'hypernova' | 'bigBang';
  blurb: string;
}

export function makeBody(spec: BodySpec): Body {
  const mass = spec.mass ?? MATERIALS[spec.material].density * sphereVolume(spec.radius);
  const body: Body = { id: spec.id, name: spec.name, emoji: spec.emoji, radius: spec.radius, mass, material: spec.material, blurb: spec.blurb, group: spec.group ?? 'Custom' };
  if (spec.shownMass) body.shownMass = spec.shownMass;
  if (spec.shownRadius) body.shownRadius = spec.shownRadius;
  if (spec.length !== undefined) body.length = spec.length;
  if (spec.temperatureC !== undefined) body.temperatureC = spec.temperatureC;
  if (spec.shownTemperature) body.shownTemperature = spec.shownTemperature;
  if (spec.shownEnergy) body.shownEnergy = spec.shownEnergy;
  if (spec.antimatter) body.antimatter = true;
  if (spec.special) body.special = spec.special;
  if (spec.blastJ !== undefined) body.blastJ = spec.blastJ;
  if (spec.blastKind) body.blastKind = spec.blastKind;
  if (spec.energyEv !== undefined) {
    body.energyEv = spec.energyEv;
    body.lorentzGamma = 1 + (spec.energyEv * EV_J) / (mass * C_LIGHT * C_LIGHT);
  }
  return body;
}

/** Picker groups, in the order they are listed. */
export const GROUPS = ['Tiny', 'Cosmic-ray particles', 'Everyday', 'Heavy', 'Vehicles and buildings', 'Space rocks', 'Moons and planets', 'Bigger planets', 'Stars', 'Extreme objects', 'Nebulae and clusters', 'Galaxies', 'Giant structures', 'Monster black holes', 'Beyond the universe', 'Cosmic powers'] as const;

const CR = 'Cosmic-ray particles', T = 'Tiny', E = 'Everyday', H = 'Heavy', V = 'Vehicles and buildings', S = 'Space rocks', P = 'Moons and planets';
const B = 'Bigger planets', ST = 'Stars', X = 'Extreme objects';
const NC = 'Nebulae and clusters', GX = 'Galaxies', GS = 'Giant structures', MB = 'Monster black holes', BU = 'Beyond the universe', CP = 'Cosmic powers';
const BALL = ' (Treated as a ball with the same mass.)';

/**
 * Solid bodies from dust to planets. Sizes and masses are real values or round numbers. The
 * model treats everything as a sphere: for things that are not round (a car, the Eiffel Tower)
 * the radius is a rough "size" and the mass is the real mass. Stars, gas giants and lore
 * objects come later with their own presenters.
 */
const SPECS: BodySpec[] = [
  // --- tiny ---
  { id: 'dust', name: 'Dust grain', emoji: '✨', radius: 5e-6, material: 'rock', group: T, blurb: 'A 10-micrometre speck of rock, like the grains in a meteor shower.' },
  { id: 'sand', name: 'Sand grain', emoji: '🏖️', radius: 3e-4, material: 'rock', group: T, blurb: 'A 0.6 mm grain of sand.' },
  { id: 'bbPellet', name: 'BB pellet', emoji: '🔹', radius: 2.25e-3, material: 'iron', group: T, blurb: 'A 4.5 mm steel airgun pellet.' },
  { id: 'bullet', name: 'Lead bullet', emoji: '🔫', radius: 5e-3, mass: 8e-3, material: 'lead', group: T, blurb: 'A soft lead slug, about 8 g.' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', radius: 5e-3, material: 'diamond', group: T, blurb: 'A 1 cm diamond, the hardest thing in the list.' },
  { id: 'pebble', name: 'Pebble', emoji: '⚪', radius: 0.01, material: 'rock', group: T, blurb: 'A 2 cm pebble from a stream.' },
  { id: 'marble', name: 'Glass marble', emoji: '🔮', radius: 0.0085, material: 'glass', group: T, blurb: 'A 1.7 cm toy marble.' },

  // --- everyday ---
  { id: 'pingPong', name: 'Ping-pong ball', emoji: '🏓', radius: 0.02, mass: 0.0027, material: 'hardPlastic', group: E, blurb: 'A hollow plastic ball, only 2.7 g.' },
  { id: 'hailstone', name: 'Hailstone', emoji: '🧊', radius: 0.02, material: 'ice', group: E, blurb: 'A 4 cm chunk of ice.' },
  { id: 'golfBall', name: 'Golf ball', emoji: '⛳', radius: 0.0213, mass: 0.0459, material: 'hardPlastic', group: E, blurb: 'A 46 g golf ball.' },
  { id: 'egg', name: 'Egg', emoji: '🥚', radius: 0.025, mass: 0.06, material: 'ceramic', group: E, blurb: 'A hen\'s egg: a very thin shell around something soft.' },
  { id: 'rubberBall', name: 'Super ball', emoji: '🟠', radius: 0.03, material: 'rubber', group: E, blurb: 'A very bouncy rubber ball.' },
  { id: 'lightBulb', name: 'Light bulb', emoji: '💡', radius: 0.03, mass: 0.04, material: 'glass', group: E, blurb: 'A thin glass bulb.' },
  { id: 'tennisBall', name: 'Tennis ball', emoji: '🎾', radius: 0.0335, mass: 0.058, material: 'rubber', group: E, blurb: 'A 58 g tennis ball.' },
  { id: 'baseball', name: 'Baseball', emoji: '⚾', radius: 0.0366, mass: 0.145, material: 'leatherCork', group: E, blurb: 'A regulation baseball, 145 g.' },
  { id: 'snowball', name: 'Snowball', emoji: '☃️', radius: 0.04, mass: 0.12, material: 'ice', group: E, blurb: 'A packed snowball.' },
  { id: 'rubberDuck', name: 'Rubber duck', emoji: '🦆', radius: 0.05, mass: 0.05, material: 'rubber', group: E, blurb: 'A squeaky bath duck, as a ball.' },
  { id: 'woodBall', name: 'Wooden ball', emoji: '🪵', radius: 0.05, material: 'wood', group: E, blurb: 'A solid wooden ball.' },
  { id: 'goldBar', name: 'Gold bar', emoji: '🪙', radius: 0.0535, mass: 12.4, material: 'gold', group: E, blurb: 'A 12.4 kg gold bar.' + BALL },
  { id: 'cannonball', name: 'Cannonball', emoji: '💣', radius: 0.06, material: 'iron', group: E, blurb: 'A solid iron ball, about 7 kg.' },
  { id: 'brick', name: 'Brick', emoji: '🧱', radius: 0.07, mass: 2.5, material: 'concrete', group: E, blurb: 'A house brick.' + BALL },
  { id: 'bowling', name: 'Bowling ball', emoji: '🎳', radius: 0.1085, mass: 7, material: 'hardPlastic', group: E, blurb: 'A 7 kg bowling ball.' },
  { id: 'soccerBall', name: 'Soccer ball', emoji: '⚽', radius: 0.11, mass: 0.43, material: 'leatherCork', group: E, blurb: 'A size-5 football, 430 g.' },
  { id: 'anvil', name: 'Anvil', emoji: '⚒️', radius: 0.12, mass: 50, material: 'iron', group: E, blurb: 'A 50 kg blacksmith\'s anvil.' + BALL },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', radius: 0.12, mass: 0.62, material: 'rubber', group: E, blurb: 'A 620 g basketball.' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', radius: 0.15, mass: 6, material: 'organic', group: E, blurb: 'A 6 kg watermelon.' },
  { id: 'pumpkin', name: 'Pumpkin', emoji: '🎃', radius: 0.2, mass: 8, material: 'organic', group: E, blurb: 'An 8 kg pumpkin.' },

  // --- heavy ---
  { id: 'wreckingBall', name: 'Wrecking ball', emoji: '🏗️', radius: 0.4, material: 'iron', group: H, blurb: 'A steel demolition ball, about 2 tonnes.' },
  { id: 'piano', name: 'Grand piano', emoji: '🎹', radius: 0.7, mass: 300, material: 'wood', group: H, blurb: 'A 300 kg grand piano.' + BALL },
  { id: 'boulder', name: 'Boulder', emoji: '🪨', radius: 1, material: 'rock', group: H, blurb: 'A 2 m rock, about 11 tonnes.' },
  { id: 'car', name: 'Car', emoji: '🚗', radius: 1.3, mass: 1500, material: 'iron', group: H, blurb: 'A 1.5 tonne family car.' + BALL },

  // --- vehicles and buildings ---
  { id: 'bus', name: 'School bus', emoji: '🚌', radius: 3.5, mass: 1.2e4, material: 'iron', group: V, blurb: 'A 12 tonne school bus.' + BALL },
  { id: 'house', name: 'House', emoji: '🏠', radius: 6, mass: 8e4, material: 'wood', group: V, blurb: 'A wooden house, about 80 tonnes.' + BALL },
  { id: 'shuttle', name: 'Space Shuttle', emoji: '🚀', radius: 9, mass: 7.8e4, material: 'aluminum', group: V, blurb: 'An orbiter, about 78 tonnes.' + BALL },
  { id: 'liberty', name: 'Statue of Liberty', emoji: '🗽', radius: 10, mass: 2.04e5, material: 'copper', group: V, blurb: '204 tonnes of copper and steel.' + BALL },
  { id: 'boeing', name: 'Jumbo jet', emoji: '✈️', radius: 12, mass: 1.8e5, material: 'aluminum', group: V, blurb: 'An empty Boeing 747, 180 tonnes.' + BALL },
  { id: 'iss', name: 'Space Station', emoji: '🛰️', radius: 25, mass: 4.2e5, material: 'aluminum', group: V, blurb: 'The International Space Station, 420 tonnes.' + BALL },
  { id: 'eiffel', name: 'Eiffel Tower', emoji: '🗼', radius: 40, mass: 1.01e7, material: 'iron', group: V, blurb: '10,000 tonnes of wrought iron.' + BALL },
  { id: 'titanic', name: 'Titanic', emoji: '🚢', radius: 50, mass: 5.2e7, material: 'iron', group: V, blurb: 'A 52,000 tonne ocean liner.' + BALL },
  { id: 'pyramid', name: 'Great Pyramid', emoji: '🔺', radius: 86, mass: 5.9e9, material: 'rock', group: V, blurb: 'About 6 million tonnes of stone.' + BALL },
  { id: 'empire', name: 'Empire State Building', emoji: '🏙️', radius: 100, mass: 3.3e8, material: 'concrete', group: V, blurb: 'About 330,000 tonnes.' + BALL },

  // --- space rocks ---
  { id: 'chelyabinsk', name: 'Chelyabinsk meteor', emoji: '☄️', radius: 9.5, mass: 1.2e7, material: 'rock', group: S, blurb: 'The 2013 Russian fireball: 19 m, 12,000 tonnes.' },
  { id: 'ironMeteoroid', name: 'Iron meteoroid', emoji: '🌠', radius: 25, material: 'iron', group: S, blurb: '50 m of solid iron, like the one that dug Arizona\'s Meteor Crater.' },
  { id: 'tunguska', name: 'Tunguska rock', emoji: '🌲', radius: 30, material: 'rock', group: S, blurb: 'A 60 m stony rock like the one that flattened Siberian forest in 1908.' },
  { id: 'oumuamua', name: 'ʻOumuamua', emoji: '🥖', radius: 33, mass: 4e8, material: 'rock', group: S, blurb: 'The first interstellar visitor, a stretched rock about 230 m long.' + BALL },
  { id: 'apophis', name: 'Apophis', emoji: '🪐', radius: 170, mass: 6.1e10, material: 'rock', group: S, blurb: 'A 340 m asteroid that passes close to Earth in 2029.' },
  { id: 'bennu', name: 'Bennu', emoji: '🌑', radius: 245, mass: 7.3e10, material: 'rock', group: S, blurb: 'A loose pile of rubble about 490 m across.' },
  { id: 'ryugu', name: 'Ryugu', emoji: '🥌', radius: 435, mass: 4.5e11, material: 'rock', group: S, blurb: 'A rubble-pile asteroid, 870 m across.' },
  { id: 'comet', name: 'Comet nucleus', emoji: '💫', radius: 2000, mass: 2e13, material: 'ice', group: S, blurb: 'A 4 km ball of porous dirty ice.' },
  { id: 'asteroid', name: 'Asteroid (10 km)', emoji: '🌌', radius: 5000, mass: 1.57e15, material: 'rock', group: S, blurb: 'About the size of the object that ended the dinosaurs.' },
  { id: 'halley', name: 'Halley\'s Comet', emoji: '🌟', radius: 5500, mass: 2.2e14, material: 'ice', group: S, blurb: 'The famous 11 km comet that returns every 76 years.' },
  { id: 'phobos', name: 'Phobos', emoji: '🥔', radius: 1.1e4, mass: 1.07e16, material: 'rock', group: S, blurb: 'The larger moon of Mars, a dark rocky potato.' },
  { id: 'eros', name: 'Eros', emoji: '🌓', radius: 8400, mass: 6.7e15, material: 'rock', group: S, blurb: 'A 34 km asteroid near Earth.' },

  // --- moons and planets ---
  { id: 'enceladus', name: 'Enceladus', emoji: '🧊', radius: 2.52e5, mass: 1.08e20, material: 'ice', group: P, blurb: 'An icy moon of Saturn that sprays water into space.' },
  { id: 'vesta', name: 'Vesta', emoji: '⚪', radius: 2.63e5, mass: 2.59e20, material: 'rock', group: P, blurb: 'The second-biggest asteroid, 525 km wide.' },
  { id: 'ceres', name: 'Ceres', emoji: '⚫', radius: 4.73e5, mass: 9.38e20, material: 'rock', group: P, blurb: 'The largest asteroid, a dwarf planet.' },
  { id: 'charon', name: 'Charon', emoji: '🌘', radius: 6.06e5, mass: 1.586e21, material: 'ice', group: P, blurb: 'Pluto\'s big moon.' },
  { id: 'pluto', name: 'Pluto', emoji: '❄️', radius: 1.1883e6, mass: 1.303e22, material: 'ice', group: P, blurb: 'A dwarf planet of ice and rock.' },
  { id: 'triton', name: 'Triton', emoji: '🩵', radius: 1.3534e6, mass: 2.14e22, material: 'ice', group: P, blurb: 'Neptune\'s big frozen moon.' },
  { id: 'europa', name: 'Europa', emoji: '🥶', radius: 1.5608e6, mass: 4.8e22, material: 'ice', group: P, blurb: 'Jupiter\'s icy moon with an ocean underneath.' },
  { id: 'moon', name: 'Moon', emoji: '🌙', radius: 1.7374e6, mass: 7.346e22, material: 'rock', group: P, blurb: 'Earth\'s Moon.' },
  { id: 'io', name: 'Io', emoji: '🌋', radius: 1.8216e6, mass: 8.93e22, material: 'rock', group: P, blurb: 'Jupiter\'s volcanic yellow moon.' },
  { id: 'callisto', name: 'Callisto', emoji: '🌑', radius: 2.4103e6, mass: 1.076e23, material: 'ice', group: P, blurb: 'Jupiter\'s heavily cratered moon.' },
  { id: 'mercury', name: 'Mercury', emoji: '☿️', radius: 2.4397e6, mass: 3.301e23, material: 'rock', group: P, blurb: 'The smallest planet, closest to the Sun.' },
  { id: 'titan', name: 'Titan', emoji: '🟠', radius: 2.5747e6, mass: 1.345e23, material: 'ice', group: P, blurb: 'Saturn\'s big moon with a thick orange haze.' },
  { id: 'ganymede', name: 'Ganymede', emoji: '🪨', radius: 2.6341e6, mass: 1.482e23, material: 'ice', group: P, blurb: 'The largest moon in the Solar System.' },
  { id: 'mars', name: 'Mars', emoji: '🔴', radius: 3.3895e6, mass: 6.417e23, material: 'rock', group: P, blurb: 'The red planet.' },
  { id: 'venus', name: 'Venus', emoji: '🟡', radius: 6.0518e6, mass: 4.867e24, material: 'rock', group: P, blurb: 'Earth\'s hot, cloudy twin.' },
  { id: 'earth', name: 'Earth', emoji: '🌍', radius: 6.371e6, mass: 5.972e24, material: 'rock', group: P, blurb: 'Our home planet.' },
  // --- bigger planets (and one brown dwarf) ---
  { id: 'proximab', name: 'Proxima b', emoji: '🪐', radius: 7.0e6, mass: 6.4e24, material: 'rock', group: B, blurb: 'A rocky planet circling the nearest star to the Sun.' },
  { id: 'kepler452b', name: 'Kepler-452b', emoji: '🌱', radius: 1.0385e7, mass: 2.99e25, material: 'rock', group: B, blurb: 'Earth\'s bigger cousin, 1,800 light-years away.' },
  { id: 'cancri55e', name: '55 Cancri e', emoji: '🔥', radius: 1.198e7, mass: 4.78e25, material: 'rock', group: B, blurb: 'A scorching lava world that circles its star in 18 hours.' },
  { id: 'superEarth', name: 'Super-Earth', emoji: '🌐', radius: 1.27e7, mass: 5.97e25, material: 'rock', group: B, blurb: 'A rocky planet twice as wide as Earth and ten times as heavy.' },
  { id: 'kepler10c', name: 'Kepler-10c', emoji: '🟣', radius: 1.5e7, mass: 1.0e26, material: 'rock', group: B, blurb: 'A "mega-Earth", 17 times Earth\'s mass.' },
  { id: 'gj1214b', name: 'GJ 1214 b', emoji: '💧', radius: 1.72e7, mass: 3.9e25, material: 'ice', group: B, blurb: 'A water world wrapped in thick steamy air.' },
  { id: 'neptune', name: 'Neptune', emoji: '🔵', radius: 2.4622e7, mass: 1.024e26, material: 'gas', group: B, blurb: 'A deep-blue ice giant with the fastest winds in the Solar System.' },
  { id: 'uranus', name: 'Uranus', emoji: '🩵', radius: 2.5362e7, mass: 8.681e25, material: 'gas', group: B, blurb: 'A pale ice giant that rolls around the Sun on its side.' },
  { id: 'kepler51d', name: 'Kepler-51d', emoji: '🍬', radius: 6.03e7, mass: 4.54e25, material: 'gas', group: B, blurb: 'A "cotton-candy" planet as fluffy as foam.' },
  { id: 'saturn', name: 'Saturn', emoji: '🪐', radius: 5.8232e7, mass: 5.683e26, material: 'gas', group: B, blurb: 'The ringed gas giant. It is light enough to float in water.' },
  { id: 'jupiter', name: 'Jupiter', emoji: '🟤', radius: 6.9911e7, mass: 1.898e27, material: 'gas', group: B, blurb: 'The biggest planet: over 1,300 Earths would fit inside.' },
  { id: 'hotJupiter', name: 'HD 189733 b', emoji: '🔷', radius: 7.97e7, mass: 2.16e27, material: 'gas', group: B, blurb: 'A blue hot Jupiter where it rains molten glass sideways.' },
  { id: 'brownDwarf', name: 'Brown dwarf', emoji: '🟣', radius: 7.5e7, mass: 1.3e29, material: 'gas', group: B, blurb: 'A failed star, 70 times heavier than Jupiter but no bigger.' },
  { id: 'wasp12b', name: 'WASP-12b', emoji: '🥚', radius: 1.33e8, mass: 2.66e27, material: 'gas', group: B, blurb: 'A puffy, egg-shaped planet being eaten by its star.' },

  // --- stars ---
  { id: 'trappist1', name: 'TRAPPIST-1', emoji: '🔴', radius: 8.4e7, mass: 1.77e29, material: 'plasma', group: ST, blurb: 'A tiny red dwarf only a little bigger than Jupiter.' },
  { id: 'proximaCen', name: 'Proxima Centauri', emoji: '🟠', radius: 1.07e8, mass: 2.43e29, material: 'plasma', group: ST, blurb: 'The nearest star to the Sun.' },
  { id: 'barnard', name: 'Barnard\'s Star', emoji: '🔸', radius: 1.36e8, mass: 2.86e29, material: 'plasma', group: ST, blurb: 'A faint red dwarf that races across the sky.' },
  { id: 'sun', name: 'Sun', emoji: '☀️', radius: 6.957e8, mass: 1.989e30, material: 'plasma', group: ST, blurb: 'Our star. A million Earths would fit inside.' },
  { id: 'sirius', name: 'Sirius A', emoji: '⭐', radius: 1.19e9, mass: 4.1e30, material: 'plasma', group: ST, blurb: 'The brightest star in our night sky.' },
  { id: 'vega', name: 'Vega', emoji: '💠', radius: 1.64e9, mass: 4.26e30, material: 'plasma', group: ST, blurb: 'A fast-spinning blue-white star.' },
  { id: 'pollux', name: 'Pollux', emoji: '🌟', radius: 6.1e9, mass: 3.8e30, material: 'plasma', group: ST, blurb: 'An orange giant with a planet of its own.' },
  { id: 'arcturus', name: 'Arcturus', emoji: '🧡', radius: 1.77e10, mass: 2.15e30, material: 'plasma', group: ST, blurb: 'A swollen orange giant, 25 Suns wide.' },
  { id: 'r136a1', name: 'R136a1', emoji: '💙', radius: 2.8e10, mass: 6.3e32, material: 'plasma', group: ST, blurb: 'The heaviest known star: about 300 Suns of mass.' },
  { id: 'aldebaran', name: 'Aldebaran', emoji: '🔶', radius: 3.06e10, mass: 2.3e30, material: 'plasma', group: ST, blurb: 'The glowing eye of Taurus the bull.' },
  { id: 'rigel', name: 'Rigel', emoji: '🔵', radius: 5.49e10, mass: 4.2e31, material: 'plasma', group: ST, blurb: 'A blue supergiant 120,000 times brighter than the Sun.' },
  { id: 'antares', name: 'Antares', emoji: '❤️', radius: 4.73e11, mass: 2.39e31, material: 'plasma', group: ST, blurb: 'A red supergiant that would swallow Mars\'s orbit.' },
  { id: 'betelgeuse', name: 'Betelgeuse', emoji: '🔴', radius: 5.31e11, mass: 3.28e31, material: 'plasma', group: ST, blurb: 'The red supergiant in Orion\'s shoulder, due to explode someday.' },
  { id: 'vycma', name: 'VY Canis Majoris', emoji: '🟥', radius: 9.88e11, mass: 3.4e31, material: 'plasma', group: ST, blurb: 'A hypergiant 1,400 Suns wide.' },
  { id: 'uyScuti', name: 'UY Scuti', emoji: '🔴', radius: 1.18e12, mass: 1.8e31, material: 'plasma', group: ST, blurb: 'One of the biggest stars ever measured.' },
  { id: 'stephenson218', name: 'Stephenson 2-18', emoji: '🏆', radius: 1.5e12, mass: 4e31, material: 'plasma', group: ST, blurb: 'The largest star known, about 2,150 Suns wide.' },

  // --- extreme objects ---
  { id: 'siriusB', name: 'White dwarf', emoji: '⚪', radius: 5.8e6, mass: 2.03e30, material: 'degenerate', group: X, blurb: 'Sirius B: a Sun\'s mass squeezed into an Earth-sized ball.' },
  { id: 'neutronStar', name: 'Neutron star', emoji: '💫', radius: 1.2e4, mass: 2.78e30, material: 'degenerate', group: X, blurb: 'Heavier than the Sun but only 24 km across. A teaspoon weighs a billion tonnes.' },
  { id: 'stellarBH', name: 'Black hole (10 Suns)', emoji: '⚫', radius: 2.95e4, mass: 1.989e31, material: 'singularity', group: X, blurb: 'The remains of a star, about 59 km across. Nothing escapes it.' },
  { id: 'cygnusX1', name: 'Cygnus X-1', emoji: '🕳️', radius: 6.2e4, mass: 4.2e31, material: 'singularity', group: X, blurb: 'The first black hole ever discovered, 21 Suns of mass.' },
  { id: 'sgrA', name: 'Sagittarius A*', emoji: '🌀', radius: 1.27e10, mass: 8.55e36, material: 'singularity', group: X, blurb: 'The giant black hole at the centre of our galaxy, 4 million Suns.' },
  { id: 'm87', name: 'M87*', emoji: '🍩', radius: 1.92e13, mass: 1.29e40, material: 'singularity', group: X, blurb: 'The first black hole ever photographed: 6.5 billion Suns.' },
  { id: 'ton618', name: 'TON 618', emoji: '🌌', radius: 1.95e14, mass: 1.31e41, material: 'singularity', group: X, blurb: 'One of the heaviest black holes known: 66 billion Suns.' },

  // --- bigger than TON 618 ---
  { id: 'pillars', name: 'Pillars of Creation', emoji: '🏛️', radius: 2.4e16, mass: 4e32, material: 'gas', group: NC, blurb: 'Towers of gas and dust in the Eagle Nebula, about 4 light-years tall, where new stars are forming.' },
  { id: 'crab', name: 'Crab Nebula', emoji: '🦀', radius: 5.2e16, mass: 9.1e30, material: 'gas', group: NC, blurb: 'The glowing wreck of a star that exploded in 1054, still expanding.' },
  { id: 'orion', name: 'Orion Nebula', emoji: '🔥', radius: 1.1e17, mass: 4e33, material: 'gas', group: NC, blurb: 'A stellar nursery 24 light-years across that you can see with the naked eye.' },
  { id: 'pleiades', name: 'Pleiades cluster', emoji: '✨', radius: 2e17, mass: 1.6e33, material: 'plasma', group: NC, blurb: 'The Seven Sisters: about a thousand young blue stars.' },
  { id: 'omegaCen', name: 'Omega Centauri', emoji: '🔮', radius: 7e17, mass: 7.9e36, material: 'plasma', group: NC, blurb: 'The biggest globular cluster of the Milky Way, millions of ancient stars in one ball.' },
  { id: 'carina', name: 'Carina Nebula', emoji: '🌺', radius: 1.4e18, mass: 2e36, material: 'gas', group: NC, blurb: 'A glowing cloud of gas 300 light-years wide that is home to some of the biggest stars known.' },
  { id: 'tarantula', name: 'Tarantula Nebula', emoji: '🕷️', radius: 8.5e18, mass: 1e36, material: 'gas', group: NC, blurb: 'The brightest star-forming region around, 1,800 light-years across. If it sat where Orion does it would light up the night.' },
  { id: 'lmc', name: 'Large Magellanic Cloud', emoji: '☁️', radius: 6.6e19, mass: 2.8e40, material: 'plasma', group: GX, blurb: 'A small galaxy orbiting ours, with 30 billion stars.' },
  { id: 'smc', name: 'Small Magellanic Cloud', emoji: '🌫️', radius: 3.3e19, mass: 1.4e40, material: 'plasma', group: GX, blurb: 'A dwarf galaxy and neighbour of the Milky Way.' },
  { id: 'm33', name: 'Triangulum Galaxy', emoji: '🔺', radius: 2.8e20, mass: 8e40, material: 'plasma', group: GX, blurb: 'The third biggest galaxy in our neighbourhood, 60,000 light-years across.' },
  { id: 'm51', name: 'Whirlpool Galaxy', emoji: '🌀', radius: 3.6e20, mass: 3.2e41, material: 'plasma', group: GX, blurb: 'A grand spiral galaxy tangled up with a smaller one.' },
  { id: 'milkyWay', name: 'Milky Way', emoji: '🌌', radius: 4.7e20, mass: 3e42, material: 'plasma', group: GX, blurb: 'Our galaxy: 100,000 light-years wide, a few hundred billion stars, and a lot of dark matter.' },
  { id: 'andromeda', name: 'Andromeda Galaxy', emoji: '🪐', radius: 1.04e21, mass: 3e42, material: 'plasma', group: GX, blurb: 'The nearest big galaxy. It is falling toward the Milky Way and they will merge in about 4 billion years.' },
  { id: 'm87gal', name: 'Messier 87', emoji: '🟡', radius: 2.8e21, mass: 1.2e43, material: 'plasma', group: GX, blurb: 'A giant elliptical galaxy with a trillion stars and thousands of globular clusters.' },
  { id: 'ic1101', name: 'IC 1101', emoji: '🏔️', radius: 1.9e22, mass: 2e44, material: 'plasma', group: GX, blurb: 'One of the biggest galaxies known: 4 million light-years across, 100 times the Milky Way.' },
  { id: 'localGroup', name: 'Local Group', emoji: '👥', radius: 4.7e22, mass: 8e42, material: 'plasma', group: GS, blurb: 'The Milky Way, Andromeda and about 80 smaller galaxies, 10 million light-years wide.' },
  { id: 'virgoSC', name: 'Virgo Supercluster', emoji: '🏘️', radius: 5.2e23, mass: 3e45, material: 'plasma', group: GS, blurb: 'Our home supercluster: more than 100 groups of galaxies, 110 million light-years across.' },
  { id: 'virgoCluster', name: 'Virgo Cluster', emoji: '🌐', radius: 7e22, mass: 2.4e45, material: 'plasma', group: GS, blurb: 'About 1,300 galaxies packed together, the heart of our local supercluster.' },
  { id: 'coma', name: 'Coma Cluster', emoji: '🧲', radius: 9.3e22, mass: 3e45, material: 'plasma', group: GS, blurb: 'A rich cluster of over 1,000 galaxies, 300 million light-years away.' },
  { id: 'elGordo', name: 'El Gordo', emoji: '🦣', radius: 1.5e23, mass: 6e45, material: 'plasma', group: GS, blurb: 'The most massive galaxy cluster seen in the early universe, 3 quadrillion Suns.' },
  { id: 'laniakea', name: 'Laniakea Supercluster', emoji: '🏝️', radius: 2.5e24, mass: 2e47, material: 'plasma', group: GS, blurb: 'Our cosmic home: 100,000 galaxies bound together, 520 million light-years across.' },
  { id: 'bootes', name: 'Boötes Void', emoji: '🕳️', radius: 1.56e24, mass: 3e45, material: 'plasma', group: GS, blurb: 'A huge hole in the universe, 330 million light-years across, with almost no galaxies in it.' },
  { id: 'shapley', name: 'Shapley Supercluster', emoji: '🗻', radius: 3.1e24, mass: 2e46, material: 'plasma', group: GS, blurb: 'The biggest clump of galaxies near us, pulling the Milky Way toward it.' },
  { id: 'sloanWall', name: 'Sloan Great Wall', emoji: '🧱', radius: 6.5e24, mass: 4e47, material: 'plasma', group: GS, blurb: 'A wall of galaxies 1.4 billion light-years long.' },
  { id: 'herculesWall', name: 'Hercules–Corona Borealis Great Wall', emoji: '🏯', radius: 4.7e25, mass: 2e50, material: 'plasma', group: GS, blurb: 'The largest structure known: a sheet of galaxies about 10 billion light-years across.' },
  { id: 'universe', name: 'Observable Universe', emoji: '🔭', radius: 4.4e26, mass: 1.5e53, material: 'plasma', group: GS, blurb: 'Everything we can see: 93 billion light-years across.' },
  { id: 'phoenixA', name: 'Phoenix A*', emoji: '🔥', radius: 2.95e14, mass: 1.989e41, material: 'singularity', group: MB, blurb: 'A black hole of 100 billion Suns, about twice as heavy as TON 618, at the heart of the Phoenix Cluster.' },
  { id: 'trillionBH', name: 'Trillion-Sun black hole', emoji: '🕳️', radius: 2.95e15, mass: 1.989e42, material: 'singularity', group: MB, blurb: 'A black hole with the mass of a trillion Suns. Heavier than anything seen, but nothing in physics forbids it.' },
  { id: 'milkyWayBH', name: 'Milky Way-mass black hole', emoji: '🌌', radius: 4.4e15, mass: 3e42, material: 'singularity', group: MB, blurb: 'Squeeze our whole galaxy, stars and dark matter included, into one black hole. It would be 1 light-year wide.' },
  { id: 'groupBH', name: '100-trillion-Sun black hole', emoji: '⚫', radius: 2.95e17, mass: 1.989e44, material: 'singularity', group: MB, blurb: 'The mass of a whole group of galaxies in one black hole, 31 light-years across.' },
  { id: 'virgoBH', name: 'Virgo Cluster black hole', emoji: '💀', radius: 3.54e18, mass: 2.39e45, material: 'singularity', group: MB, blurb: 'A black hole as heavy as the Virgo Cluster: 370 light-years across.' },
  { id: 'laniakeaBH', name: 'Laniakea black hole', emoji: '🌑', radius: 2.95e20, mass: 1.989e47, material: 'singularity', group: MB, blurb: 'Our whole supercluster of 100,000 galaxies collapsed into a black hole 31,000 light-years across.' },
  { id: 'universeBH', name: 'Universe-mass black hole', emoji: '♾️', radius: 2.23e26, mass: 1.5e53, material: 'singularity', group: MB, blurb: 'All the matter in the observable universe in one black hole. Its size is close to the size of the universe itself.' },
  { id: 'ring', name: 'Ring Nebula', emoji: '💍', radius: 4.7e15, mass: 4e29, material: 'gas', group: NC, blurb: 'A dying star puffing off a glowing smoke ring about a light-year wide.' },
  { id: 'helix', name: 'Helix Nebula', emoji: '👁️', radius: 2.4e16, mass: 1.2e30, material: 'gas', group: NC, blurb: 'The Eye of God: gas thrown off by a dying Sun-like star, 2.5 light-years wide.' },
  { id: 'westerlund1', name: 'Westerlund 1', emoji: '💎', radius: 3e17, mass: 2e35, material: 'plasma', group: NC, blurb: 'The biggest young star cluster in the Milky Way, with hundreds of giant stars.' },
  { id: 'rosette', name: 'Rosette Nebula', emoji: '🌹', radius: 6.1e17, mass: 2e34, material: 'gas', group: NC, blurb: 'A rose-shaped cloud 130 light-years across, lit up from inside by a cluster of hot stars.' },
  { id: 'sombrero', name: 'Sombrero Galaxy', emoji: '👒', radius: 2.4e20, mass: 1.6e42, material: 'plasma', group: GX, blurb: 'A galaxy with a huge bright bulge and a dark ring of dust, 28 million light-years away.' },
  { id: 'cartwheel', name: 'Cartwheel Galaxy', emoji: '🎡', radius: 6.9e20, mass: 4e41, material: 'plasma', group: GX, blurb: 'A galaxy that was punched through the middle by another one and now has a giant ring.' },
  { id: 'centaurusA', name: 'Centaurus A', emoji: '⚡', radius: 5e20, mass: 2e42, material: 'plasma', group: GX, blurb: 'A galaxy with a monster black hole shooting jets that stretch a million light-years.' },
  { id: 'perseus', name: 'Perseus Cluster', emoji: '🧿', radius: 9e22, mass: 3e45, material: 'plasma', group: GS, blurb: 'One of the heaviest clusters nearby, with a huge hot-gas cloud around thousands of galaxies.' },
  { id: 'bulletCluster', name: 'Bullet Cluster', emoji: '🎯', radius: 1.5e23, mass: 3e45, material: 'plasma', group: GS, blurb: 'Two clusters of galaxies that crashed at 4,500 km/s.' },
  { id: 'greatAttractor', name: 'Great Attractor', emoji: '🧲', radius: 7e23, mass: 1e47, material: 'plasma', group: GS, blurb: 'A mysterious region 150 million light-years away that pulls our whole corner of the universe toward it.' },
  { id: 'piscesCetus', name: 'Pisces–Cetus Supercluster Complex', emoji: '🐟', radius: 4.7e24, mass: 4e48, material: 'plasma', group: GS, blurb: 'A chain of superclusters a billion light-years long.' },
  { id: 'tenTrillionBH', name: '10-trillion-Sun black hole', emoji: '🌑', radius: 2.95e16, mass: 1.989e43, material: 'singularity', group: MB, blurb: 'A black hole of ten trillion Suns, 3 light-years across.' },

  // --- cosmic-ray particles: each one always arrives at the speed it really does ---
  { id: 'omgParticle', name: 'Oh-My-God particle', emoji: '⚡', radius: 8.4e-16, mass: 1.6726e-27, material: 'iron', group: CR, energyEv: 3.2e20, blurb: 'A proton seen in 1991 carrying 51 joules, the energy of a thrown baseball in one subatomic particle. It travelled within 4 trillionths of a trillionth of the speed of light.' },
  { id: 'amaterasu', name: 'Amaterasu particle', emoji: '☀️', radius: 8.4e-16, mass: 1.6726e-27, material: 'iron', group: CR, energyEv: 2.4e20, blurb: 'A cosmic ray seen over Utah in 2021 with 40 joules, the second most energetic ever detected. Its source is still a mystery, and it came from an empty patch of space.' },
  { id: 'alarastraza', name: 'Alarastraza', emoji: '🌠', radius: 2.2233e26, mass: 5.205e52, material: 'plasma', group: BU, blurb: 'Another universe, 47 billion light-years across, with 0.347 times the mass of ours.' },

  // --- beyond the universe (from Gravity Lab) ---
  { id: 'hawkramenshon', name: 'Hawkramenshon', emoji: '🟣', radius: 4.04e10, mass: 1.005e54, material: 'plasma', group: BU, blurb: 'A purple hyper-giant only 0.27 AU wide that weighs as much as 337 billion Milky Ways.' },
  { id: 'hyperUniverse', name: 'Hyper Universe', emoji: '🌌', radius: 9.46e26, mass: 2.27e55, material: 'plasma', group: BU, blurb: 'An entire universe 100 billion light-years wide, packed with 50 trillion hyper galaxies.' },
  { id: 'theFelon', name: 'The Felon', emoji: '🦹', radius: 4.276e18, mass: 1.996e58, material: 'plasma', group: BU, blurb: 'A 452-light-year-wide object that weighs as much as 6.7 quadrillion Milky Ways. Why does this even exist?' },
  { id: 'giganaurus', name: 'Giganaurus', emoji: '🤯', radius: 4.579e24, mass: 5.431e67, material: 'plasma', group: BU, blurb: 'As heavy as 18 trillion trillion galaxies, and almost 10,000 times wider than the Milky Way.' },
  { id: 'mlti183', name: 'MLTI-183', emoji: '🌌', radius: 3.8e28, mass: 9.945e67, material: 'plasma', group: BU, blurb: 'A structure of 5 × 10³⁷ Suns, far larger than the whole observable universe.' },
  { id: 'ulturuas', name: 'Ulturuas', emoji: '🌀', radius: 7.9118e26, mass: 1.4658e93, material: 'plasma', group: BU, blurb: 'Roughly the size of the observable universe but 10⁵⁰ galaxies heavy. Why does this even exist?' },
  { id: 'tremendous1500', name: 'TREMENDOUS-1500', emoji: '🌌', radius: 1.419e34, mass: 5.967e74, material: 'plasma', group: BU, blurb: '3 × 10⁴⁴ Suns spread over 1.5 quintillion light-years.' },
  { id: 'grondeo', name: 'Grondeo-Asigion Attoverse Complex', emoji: '🌌', radius: 1.419e44, mass: 6e104, material: 'plasma', group: BU, blurb: 'A complex 15 octillion light-years wide, bigger than our universe by a factor of 10¹⁷.' },
  { id: 'mar234', name: 'MAR-234 Megacluster Complex', emoji: '🌌', radius: 2.4e60, mass: 2e154, material: 'plasma', group: BU, blurb: 'A megacluster of universes: 2 × 10¹⁵⁴ kg across 2.4 × 10⁶⁰ metres.' },
  { id: 'uuz435', name: 'UUZ-435 Ultracluster Complex', emoji: '🌌', radius: 1e90, mass: 1e160, material: 'plasma', group: BU, shownMass: '2.09 × 10⁴⁹⁷ kg', shownRadius: '5.01 × 10¹⁷⁴ m (5.3 × 10¹⁵⁸ light-years)', blurb: 'Its real size is 5.3 × 10¹⁵⁸ light-years and 2.1 × 10⁴⁹⁷ kg, too big for a computer number. Smash Lab uses stand-in numbers that keep its place in the order.' },
  { id: 'meve1', name: 'MEVE-1', emoji: '🌌', radius: 1e95, mass: 1e165, material: 'plasma', group: BU, shownMass: '10^(3 × 10¹⁰) solar masses', shownRadius: 'ω³ light-years (transfinite)', blurb: 'Its mass is 10^(3×10¹⁰) Suns and its radius is the transfinite number ω³ light-years. Smash Lab uses stand-in numbers that keep its place in the order.' },
  { id: 'phyve1', name: 'PHYVE-1-LOC', emoji: '🌌', radius: 1e100, mass: 1e170, material: 'plasma', group: BU, shownMass: '≈ 10^(3 × 10^(10¹⁰)) kg', shownRadius: '10^(10^(10¹⁰)) m', blurb: 'Its width is 10^(10^(10^10)) metres: a number with a number with ten billion digits in it. Smash Lab uses stand-in numbers that keep its place in the order.' },
  { id: 'atomicBreath', name: "Godzilla's Atomic Breath", emoji: '☢️', radius: 2.4384, mass: 0.07, material: 'plasma', group: CP, energyEv: 6.3e15 / 1.602176634e-19, length: 6437376, temperatureC: 500000, blurb: "The beam from Godzilla's 2024 film: 16 feet wide, 4,000 miles long, 500,000 °C, and only 70 grams of matter. It arrives with 6.3 petajoules, about 1.5 megatons of TNT, in one pink-white flash. Smash Lab draws the real long thin shape." },
  { id: 'lemoraBreath', name: "Lemora's Atomic Breath", emoji: '⚡', radius: 1, mass: 0.07, material: 'plasma', group: CP, energyEv: 1e150 / 1.602176634e-19, length: 1.2e7, temperatureC: 1.416e32, shownTemperature: '1.416 × 10³² K', shownEnergy: '≈ 10^(3 × 10^(10¹⁰)) W × 837.6', blurb: "A dark electric blue beam 2 metres tall and 12,000 kilometres long, with only 70 grams of matter and a temperature of 1.416 × 10³² K. Its energy is about 10^(3 × 10^(10^10)) watts × 837.6, a number far too big to store, so Smash Lab uses a stand-in that keeps its place near the top. Smash Lab draws the real long thin shape." },
  { id: 'antiGravityOrb', name: 'Anti-Gravity Orb', emoji: '🔮', radius: 70, mass: 7.346e22, material: 'plasma', group: CP, antimatter: true, shownMass: '−7.346 × 10²² kg (−1 Moon)', blurb: 'A 70 metre ball with the mass of the Moon, but negative. Everything near it is pushed away as hard as the Moon pulls things in, and it is antimatter: where it touches ordinary matter, both vanish into pure energy.' },
  { id: 'antiBubble', name: 'Anti-Bubble', emoji: '⚫', radius: 1e-18, mass: 1e-40, material: 'plasma', group: CP, special: 'antiBubble', shownMass: '0 kg', shownRadius: 'no fixed size (it grows from nothing)', blurb: 'A bubble with no mass and no size that starts growing the moment the simulation starts. It does not move, it only expands, and anything it touches is deleted.' },
  { id: 'strangeOrb', name: 'Strange Matter Orb', emoji: '🟢', radius: 70, mass: 1e-30, material: 'plasma', group: CP, special: 'strangeOrb', shownMass: '−0 kg (no mass)', blurb: 'A green 70 metre orb with no mass. Whatever it touches turns into green strange matter, and the change spreads through all of it.' },
  { id: 'grb', name: 'Gamma-Ray Burst', emoji: '💜', radius: 2e-18, mass: 1e-40, material: 'plasma', group: CP, special: 'blast', blastKind: 'grb', blastJ: 1e47, shownMass: '1.1 × 10³⁰ kg of energy (E ÷ c²)', shownRadius: 'a jet a few degrees wide', blurb: 'A narrow jet of gamma rays from a dying giant star, the brightest explosions since the Big Bang. Counting it as if it went out in every direction it equals about 10⁴⁷ joules, as much as the Sun gives off in 10 billion years, times 100,000.' },
  { id: 'supernova', name: 'Supernova', emoji: '💥', radius: 2e-18, mass: 1e-40, material: 'plasma', group: CP, special: 'blast', blastKind: 'supernova', blastJ: 1e44, shownMass: '8 Suns of ejecta (1.6 × 10³¹ kg)', shownRadius: 'a blast that grows outward', blurb: 'A massive star blows itself apart. The blast and light carry about 10⁴⁴ joules (one "foe"), as much as the Sun makes in its whole 10 billion year life.' },
  { id: 'gozdillaPulse', name: "Gozdilla's Thermonuclear Pulse", emoji: '☢️', radius: 2e-18, mass: 6.4196970838e13, material: 'plasma', group: CP, special: 'blast', blastKind: 'supernova', blastJ: 1.379e21 * 4.184e9, temperatureC: 15e6 - 273.15, shownMass: '64,196,970,838 metric tons (6.42 × 10¹³ kg)', shownRadius: 'a blast that grows outward', blurb: "Gozdilla's thermonuclear pulse. It releases 1.379 zettatons of TNT, about 5.8 × 10³⁰ joules, at 15,000,000 K, and goes off like a supernova: the fireball grows outward from the impact point." },
  { id: 'hypernova', name: 'Hypernova', emoji: '🌠', radius: 2e-18, mass: 1e-40, material: 'plasma', group: CP, special: 'blast', blastKind: 'hypernova', blastJ: 5e45, shownMass: '10 Suns of ejecta (2 × 10³¹ kg)', shownRadius: 'a blast that grows outward', blurb: 'A supernova about 50 times stronger, from a star that collapses into a black hole. The ejecta fly at about 22,000 km/s and the blast carries about 5 × 10⁴⁵ joules, like the 1998 hypernova SN 1998bw.' },
  { id: 'bigBang', name: 'Big Bang', emoji: '🌌', radius: 2e-18, mass: 1e-40, material: 'plasma', group: CP, special: 'blast', blastKind: 'bigBang', blastJ: 1.5e53 * 299792458 ** 2, shownMass: '1.5 × 10⁵³ kg of energy (the whole observable universe)', shownRadius: 'starts as a point and grows without end', blurb: 'The start of space and time. Its energy is the whole mass of the observable universe turned into energy, E = mc², about 1.3 × 10⁷⁰ joules.' },
];
/** Every launchable object, smallest first. */
export const CATALOG: readonly Body[] = SPECS.map(makeBody).sort((a, b) => a.radius - b.radius);

export function byId(id: string): Body {
  const body = CATALOG.find((b) => b.id === id);
  if (!body) throw new Error(`Unknown catalog object: ${id}`);
  return body;
}
