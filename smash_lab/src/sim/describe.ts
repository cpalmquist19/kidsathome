import { MATERIALS } from './materials';
import type { MergeResult, Body, BodyOutcome, Regime } from './types';

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number): string => String(n).split('').map((ch) => SUPERSCRIPT[ch] ?? ch).join('');

/** 3 significant figures; very large or small values switch to "1.23 × 10⁵". */
export const LIGHT_YEAR = 9.4607e15;

export function fmtNum(x: number): string {
  if (x === 0 || !Number.isFinite(x)) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e-3 && abs < 1e6) return Number(x.toPrecision(3)).toLocaleString('en-US', { maximumFractionDigits: 6 });
  const exp = Math.floor(Math.log10(abs));
  const mantissa = x / Math.pow(10, exp);
  return `${mantissa.toFixed(2)} × 10${sup(exp)}`;
}

export function fmtLength(m: number): string {
  if (m === 0) return '0 m';
  const abs = Math.abs(m);
  if (abs < 1e-6) return `${fmtNum(m * 1e9)} nm`;
  if (abs < 1e-3) return `${fmtNum(m * 1e6)} µm`;
  if (abs < 1) return `${fmtNum(m * 1e3)} mm`;
  if (abs < 1e3) return `${fmtNum(m)} m`;
  if (abs < 1e16) return `${fmtNum(m / 1e3)} km`;
  const ly = abs / LIGHT_YEAR;
  const sign = m < 0 ? '-' : '';
  if (ly < 1e6) return `${sign}${fmtNum(ly)} light-year${ly === 1 ? '' : 's'}`;
  if (ly < 1e9) return `${sign}${fmtNum(ly / 1e6)} million light-years`;
  if (ly < 1e15) return `${sign}${fmtNum(ly / 1e9)} billion light-years`;
  return `${sign}${fmtNum(ly)} light-years`;
}

export function fmtMass(kg: number): string {
  if (kg === 0) return '0 kg';
  const abs = Math.abs(kg);
  if (abs < 1e-6) return `${fmtNum(kg * 1e9)} µg`;
  if (abs < 1e-3) return `${fmtNum(kg * 1e6)} mg`;
  if (abs < 1) return `${fmtNum(kg * 1e3)} g`;
  if (abs >= 1e29) return `${fmtNum(kg)} kg (${fmtNum(kg / 1.989e30)} Suns)`;
  return `${fmtNum(kg)} kg`;
}

export function fmtSpeed(mps: number): string {
  if (mps >= 3e6) return `${fmtNum(mps / 1000)} km/s (${fmtNum((mps / 2.998e8) * 100)}% of light speed)`;
  return mps >= 1000 ? `${fmtNum(mps / 1000)} km/s` : `${fmtNum(mps)} m/s`;
}

/** Speed of a particle whose Lorentz factor is `gamma`, as how close it gets to light speed. */
export function fmtFixedSpeed(gamma: number): string {
  if (gamma < 100) {
    const beta = Math.sqrt(1 - 1 / (gamma * gamma));
    return `${fmtNum(299792.458 * beta)} km/s (${fmtNum(beta * 100)}% of the speed of light)`;
  }
  const gap = 1 / (2 * gamma * gamma); // 1 - v/c
  return `${fmtNum(299792.458)} km/s, within ${fmtNum(gap)} of the speed of light`;
}

export function fmtEnergy(joules: number, kilotons: number): string {
  if (joules >= 1e44) return `${fmtNum(joules)} J (${fmtNum(joules / 1e44)} supernovae)`;
  if (joules >= 1e26) return `${fmtNum(joules)} J (${fmtNum(joules / 3.828e26)} seconds of all the Sun's light)`;
  const tnt = kilotons >= 1e6 ? `${fmtNum(kilotons / 1e6)} gigatons TNT`
    : kilotons >= 1 ? `${fmtNum(kilotons)} kilotons TNT`
    : kilotons >= 1e-6 ? `${fmtNum(kilotons * 1e6)} kg TNT`
    : '';
  return tnt ? `${fmtNum(joules)} J (${tnt})` : `${fmtNum(joules)} J`;
}

export const REGIME_INFO: Record<Regime, { label: string; tone: 'calm' | 'warm' | 'hot' | 'extreme'; blurb: string }> = {
  rebound: { label: 'Bounces', tone: 'calm', blurb: 'Springs back with no lasting damage.' },
  dent: { label: 'Dented', tone: 'calm', blurb: 'Squashed or dented but still in one piece.' },
  crater: { label: 'Cratered', tone: 'warm', blurb: 'Digs a crater and throws out debris.' },
  fracture: { label: 'Cracks apart', tone: 'warm', blurb: 'Breaks into a few big pieces.' },
  shatter: { label: 'Shatters', tone: 'hot', blurb: 'Smashed into many fragments.' },
  disrupt: { label: 'Destroyed', tone: 'extreme', blurb: 'Blown apart; no piece keeps most of the mass.' },
  vaporize: { label: 'Vaporized', tone: 'extreme', blurb: 'Turned to hot gas in an explosion.' },
};

/**
 * Label and one-line summary for one body's outcome. Depends on the other body because the same
 * "rebound" regime means "bounces" for a ball but "swallows it" for a star.
 */
export function regimeInfoFor(body: Body, other: Body, o: BodyOutcome): { label: string; tone: 'calm' | 'warm' | 'hot' | 'extreme'; blurb: string } {
  const mine = MATERIALS[body.material].behavior;
  const theirs = MATERIALS[other.material].behavior;
  if (mine === 'hole') {
    return { label: 'Swallows it', tone: 'extreme', blurb: 'Nothing escapes the event horizon, and nothing here can hurt it.' };
  }
  if (mine === 'fluid' && o.regime === 'rebound') {
    return { label: 'Swallows it', tone: 'warm', blurb: 'No solid surface to damage: the hit heats a patch of gas that swirls away.' };
  }
  if (theirs === 'hole') {
    return { label: 'Swallowed', tone: 'extreme', blurb: 'Stretched, torn apart and pulled across the event horizon.' };
  }
  if (theirs === 'fluid') {
    if (o.regime === 'rebound') return { label: 'Sinks in', tone: 'warm', blurb: 'Plunges into the gas without breaking up.' };
    if (o.regime === 'vaporize') return { label: 'Burns up', tone: 'extreme', blurb: 'Boils away in the hot gas.' };
    if (o.regime === 'shatter' || o.regime === 'disrupt') return { label: 'Breaks up', tone: 'hot', blurb: 'Torn apart and burned as it plunges in.' };
  }
  if (o.regime === 'rebound' && body.mass > 1e4 * other.mass) {
    return { label: 'Barely notices', tone: 'calm', blurb: 'Far too big to be bothered by this hit.' };
  }
  return REGIME_INFO[o.regime];
}

/** Card text for two bodies that fuse into one, or null when they do not. */
export function mergeInfo(a: Body, b: Body, merge: MergeResult | null, supernova: boolean): { label: string; tone: 'calm' | 'warm' | 'hot' | 'extreme'; blurb: string; facts: string[] } | null {
  if (supernova) {
    return {
      label: 'Supernova',
      tone: 'extreme',
      blurb: 'Together the two white dwarfs are heavier than the 1.4 Sun limit a white dwarf can hold up, so the merger ignites and blows both apart.',
      facts: [`Combined mass: ${fmtMass(a.mass + b.mass)}.`, 'Nothing is left behind.'],
    };
  }
  if (!merge) return null;
  // Bodies too big for a double carry their true size as text; the merged body is as big as the bigger one.
  const bigger = a.mass >= b.mass ? a : b;
  const facts = [
    bigger.shownMass ? `Combined mass: about ${bigger.shownMass}.` : `Combined mass: ${fmtMass(merge.mass)}.`,
    bigger.shownRadius ? `New radius: about ${bigger.shownRadius}.` : `New radius: ${fmtLength(merge.radius)}.`,
  ];
  if (merge.blackHole) {
    return { label: 'Black hole', tone: 'extreme', blurb: 'The two merge into one object too heavy to hold itself up, and it collapses into a black hole.', facts };
  }
  if (a.length !== undefined || b.length !== undefined) {
    return { label: 'Absorbed', tone: 'hot', blurb: 'A star swallows the beam whole. It takes in the beam\'s mass and all of its energy, and carries on as before.', facts };
  }
  const holes = MATERIALS[a.material].behavior === 'hole';
  return {
    label: 'Merges',
    tone: 'hot',
    blurb: holes
      ? 'The two black holes spiral together into one bigger black hole.'
      : 'Held together by their own gravity, they do not bounce or stack: they run into each other and fuse into one new body.',
    facts,
  };
}

/** What the cosmic powers do: deleting, strange matter, or being pushed apart. Null for ordinary collisions. */
export function effectInfo(body: Body, other: Body, effect: 'none' | 'deleted' | 'strange' | 'blast', repelled: boolean): { label: string; tone: 'calm' | 'warm' | 'hot' | 'extreme'; blurb: string; facts: string[] } | null {
  if (repelled) {
    return {
      label: 'Pushed away',
      tone: 'calm',
      blurb: body.antimatter
        ? 'The orb pushes away anything lighter than itself, and any other orb, so the two can never touch.'
        : 'It is pushed away by the Anti-Gravity Orb before it can touch it, so nothing happens.',
      facts: [],
    };
  }
  if (effect === 'blast' && body.special === 'blast') {
    const blurbs = {
      grb: 'A narrow jet of gamma rays hits the impact point and everything near it is cooked by the flash.',
      supernova: 'The blast goes off at the impact point and the fireball grows outward, burning whatever it passes through.',
      hypernova: 'A far fiercer blast goes off at the impact point and the fireball grows outward at about 22,000 km/s.',
      bigBang: 'Space and time begin at the impact point and everything expands outward from it, all at once.',
    } as const;
    return { label: 'Goes off', tone: 'extreme', blurb: blurbs[body.blastKind ?? 'supernova'], facts: [`Releases ${fmtEnergy(body.blastJ ?? 0, (body.blastJ ?? 0) / 4.184e12)}.`, 'Does not move: it goes off the moment you launch.'] };
  }
  if (effect === 'deleted') {
    return body.special === 'antiBubble'
      ? { label: 'Expands', tone: 'extreme', blurb: 'It does not move. It just grows from nothing, and anything it touches is deleted: no debris, no explosion, no energy.', facts: ['No mass and no fixed size.', `${other.name} is inside it, so ${other.name} is gone.`] }
      : { label: 'Deleted', tone: 'extreme', blurb: 'The growing bubble deletes everything it touches. Nothing is left: no pieces, no heat, no explosion.', facts: [`${other.shownMass ?? fmtMass(other.mass)} deleted.`] };
  }
  if (effect === 'strange') {
    return body.special === 'strangeOrb'
      ? { label: 'Spreads', tone: 'hot', blurb: 'Whatever it touches turns into green strange matter, and the change spreads through all of it.', facts: ['No mass, so it hits with no force and no energy.'] }
      : { label: 'Strange matter', tone: 'hot', blurb: 'The change spreads from the touch point through the whole object until all of it is green strange matter.', facts: [`Same mass as before: ${body.shownMass ?? fmtMass(body.mass)}.`, 'No energy is released.'] };
  }
  return null;
}

/** Plain-language facts about what happened to one body. */
export function describeBody(body: Body, o: BodyOutcome): string[] {
  const lines: string[] = [];
  const pct = (f: number): string => (f >= 0.995 ? 'All' : f < 0.001 ? 'Under 0.1%' : `${(f * 100).toFixed(f < 0.1 ? 1 : 0)}%`);

  const behavior = MATERIALS[body.material].behavior;
  if (behavior === 'hole') {
    lines.push('Nothing that hits it can hurt it, and nothing that falls in comes back out.');
  } else if (behavior === 'fluid' && o.regime === 'rebound') {
    lines.push('No solid surface, so there is nothing to dent or crack.');
  } else if (o.regime === 'rebound') {
    lines.push('Stress stays below the material\'s strength.');
  } else if (o.craterDiameter > 0) {
    const wholeBody = o.craterDiameter >= 1.8 * body.radius;
    const noun = o.regime === 'dent' ? 'Dent' : o.craterIsComplex ? 'Impact basin' : 'Crater';
    lines.push(wholeBody
      ? `${noun} as wide as the whole body: the surface is completely reshaped.`
      : `${noun} about ${fmtLength(o.craterDiameter)} across and ${fmtLength(o.craterDepth)} deep.`);
    if (o.ejectaMass > 0 && (o.regime === 'crater' || o.regime === 'fracture')) {
      lines.push(`Throws out about ${fmtMass(o.ejectaMass)} of material.`);
    }
  }
  if (o.regime === 'fracture' || o.regime === 'shatter' || o.regime === 'disrupt') {
    const kept = o.largestRemnantFraction < 0.001 ? 'under 0.1%' : `${(o.largestRemnantFraction * 100).toFixed(o.largestRemnantFraction < 0.1 ? 1 : 0)}%`;
    lines.push(`Largest piece keeps ${kept} of the mass; about ${o.suggestedFragments} main fragments.`);
  }
  if (o.vaporFraction >= 0.01) lines.push(`${pct(o.vaporFraction)} of its mass is vaporized.`);
  const meltedOnly = o.meltFraction - o.vaporFraction; // vapor already counts as melted
  if (meltedOnly >= 0.001) lines.push(`${pct(meltedOnly)} of its mass melts into glowing liquid.`);
  if (o.ignites) lines.push('Hot enough to catch fire.');
  if (o.regime !== 'rebound' && o.regime !== 'dent' && lines.length === 0) lines.push(REGIME_INFO[o.regime].blurb);
  return lines;
}

export function fmtPressure(pa: number): string {
  if (pa >= 1e9) return `${fmtNum(pa / 1e9)} GPa`;
  if (pa >= 1e6) return `${fmtNum(pa / 1e6)} MPa`;
  if (pa >= 1e3) return `${fmtNum(pa / 1e3)} kPa`;
  return `${fmtNum(pa)} Pa`;
}
