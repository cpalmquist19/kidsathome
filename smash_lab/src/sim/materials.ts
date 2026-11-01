import type { Material, MaterialId } from './types';

/**
 * Gameplay-grade material properties: typical handbook values rounded to one or two figures.
 * They are tuned so the impact model reproduces known cases (see tests/impact.test.ts), not
 * to be a materials database. See MODEL.md for how each number is used.
 *
 * Energies are J/kg from room temperature (ice from ~250 K).
 */
export const MATERIALS: Record<MaterialId, Material> = {
  rock: {
    id: 'rock', name: 'Rock (basalt)', behavior: 'brittle',
    density: 2700, soundSpeed: 5000, strength: 2e7, restitution: 0.5,
    meltEnergy: 1.6e6, vaporEnergy: 1.6e7,
    disruptionFamily: 'rock', strengthFactor: 1, color: '#8b7468',
  },
  iron: {
    id: 'iron', name: 'Iron / steel', behavior: 'ductile',
    density: 7800, soundSpeed: 5000, strength: 3.5e8, restitution: 0.6,
    meltEnergy: 9.5e5, vaporEnergy: 8e6,
    disruptionFamily: 'rock', strengthFactor: 6, color: '#9aa3ad', // strength/density is ~6x basalt's
  },
  ice: {
    id: 'ice', name: 'Ice', behavior: 'brittle',
    density: 920, soundSpeed: 3500, strength: 2e6, restitution: 0.4,
    meltEnergy: 3.8e5, vaporEnergy: 3.1e6,
    disruptionFamily: 'ice', strengthFactor: 1, color: '#cfe8f5',
  },
  glass: {
    id: 'glass', name: 'Glass', behavior: 'brittle',
    density: 2500, soundSpeed: 5400, strength: 4e7, restitution: 0.8,
    meltEnergy: 1.4e6, vaporEnergy: 1.2e7,
    disruptionFamily: 'rock', strengthFactor: 0.3, color: '#b9dbe8',
  },
  hardPlastic: {
    id: 'hardPlastic', name: 'Hard plastic', behavior: 'ductile',
    density: 1400, soundSpeed: 2000, strength: 5e7, restitution: 0.6,
    meltEnergy: 5e5, vaporEnergy: 3e6, ignitionEnergy: 5e5,
    disruptionFamily: 'rock', strengthFactor: 6, color: '#814bd1',
  },
  rubber: {
    id: 'rubber', name: 'Rubber', behavior: 'elastic',
    density: 1100, soundSpeed: 1000, strength: 2e7, restitution: 0.85,
    meltEnergy: 4e5, vaporEnergy: 3e6, ignitionEnergy: 4e5,
    disruptionFamily: 'rock', strengthFactor: 10, color: '#d9482b',
  },
  leatherCork: {
    id: 'leatherCork', name: 'Leather and cork', behavior: 'soft',
    density: 700, soundSpeed: 600, strength: 5e6, restitution: 0.5,
    meltEnergy: 4e5, vaporEnergy: 3e6, ignitionEnergy: 3.5e5,
    disruptionFamily: 'rock', strengthFactor: 6, color: '#f2f1e8',
  },
  wood: {
    id: 'wood', name: 'Wood', behavior: 'brittle',
    density: 600, soundSpeed: 3500, strength: 2e7, restitution: 0.4,
    meltEnergy: 1e6, vaporEnergy: 1e7, ignitionEnergy: 4.4e5,
    disruptionFamily: 'rock', strengthFactor: 1.5, color: '#a9784a',
  },
  concrete: {
    id: 'concrete', name: 'Concrete', behavior: 'brittle',
    density: 2400, soundSpeed: 3700, strength: 1e7, restitution: 0.3,
    meltEnergy: 1.5e6, vaporEnergy: 1.5e7,
    disruptionFamily: 'rock', strengthFactor: 0.6, color: '#9a9a96',
  },
  ceramic: {
    id: 'ceramic', name: 'Eggshell / thin ceramic', behavior: 'brittle',
    density: 2400, soundSpeed: 5000, strength: 5e5, restitution: 0.3,
    meltEnergy: 1.5e6, vaporEnergy: 1.4e7,
    disruptionFamily: 'rock', strengthFactor: 0.03, color: '#f1e6d0',
  },
  aluminum: {
    id: 'aluminum', name: 'Aluminium', behavior: 'ductile',
    density: 2700, soundSpeed: 5100, strength: 2.5e8, restitution: 0.5,
    meltEnergy: 1e6, vaporEnergy: 1.1e7,
    disruptionFamily: 'rock', strengthFactor: 4, color: '#c9ced4',
  },
  copper: {
    id: 'copper', name: 'Copper', behavior: 'ductile',
    density: 8960, soundSpeed: 3900, strength: 2e8, restitution: 0.5,
    meltEnergy: 6e5, vaporEnergy: 5.3e6,
    disruptionFamily: 'rock', strengthFactor: 3, color: '#c26a3d',
  },
  gold: {
    id: 'gold', name: 'Gold', behavior: 'ductile',
    density: 19300, soundSpeed: 3200, strength: 1.2e8, restitution: 0.4,
    meltEnergy: 2.3e5, vaporEnergy: 1.7e6,
    disruptionFamily: 'rock', strengthFactor: 2, color: '#e0b43b',
  },
  lead: {
    id: 'lead', name: 'Lead', behavior: 'ductile',
    density: 11340, soundSpeed: 1200, strength: 2e7, restitution: 0.1,
    meltEnergy: 1.2e5, vaporEnergy: 9e5,
    disruptionFamily: 'rock', strengthFactor: 1.5, color: '#5d646d',
  },
  diamond: {
    id: 'diamond', name: 'Diamond', behavior: 'brittle',
    density: 3510, soundSpeed: 12000, strength: 1e9, restitution: 0.9,
    meltEnergy: 2e7, vaporEnergy: 6e7,
    disruptionFamily: 'rock', strengthFactor: 8, color: '#cfeefb',
  },
  organic: {
    id: 'organic', name: 'Fruit and other soft stuff', behavior: 'brittle',
    density: 1000, soundSpeed: 1500, strength: 3e5, restitution: 0.1,
    meltEnergy: 3e5, vaporEnergy: 2.6e6,
    disruptionFamily: 'ice', strengthFactor: 0.3, color: '#d96b2b',
  },
  gas: {
    id: 'gas', name: 'Gas and cloud', behavior: 'fluid',
    density: 1, soundSpeed: 1000, strength: 1e3, restitution: 0,
    meltEnergy: 1e7, vaporEnergy: 1e8,
    disruptionFamily: 'ice', strengthFactor: 0.01, color: '#d9b98a',
  },
  plasma: {
    id: 'plasma', name: 'Star plasma', behavior: 'fluid',
    density: 1e-3, soundSpeed: 1e4, strength: 1e3, restitution: 0,
    meltEnergy: 1e9, vaporEnergy: 1e10,
    disruptionFamily: 'ice', strengthFactor: 0.01, color: '#ffd27a',
  },
  degenerate: {
    id: 'degenerate', name: 'Ultra-dense matter', behavior: 'brittle',
    density: 1e12, soundSpeed: 1e8, strength: 1e25, restitution: 0,
    meltEnergy: 1e12, vaporEnergy: 1e13,
    disruptionFamily: 'rock', strengthFactor: 1e6, color: '#cfe0ff',
  },
  singularity: {
    id: 'singularity', name: 'Black hole', behavior: 'hole',
    density: 1e18, soundSpeed: 3e8, strength: 1e40, restitution: 0,
    meltEnergy: 1e20, vaporEnergy: 1e21,
    disruptionFamily: 'rock', strengthFactor: 1e12, color: '#000000',
  },
};
