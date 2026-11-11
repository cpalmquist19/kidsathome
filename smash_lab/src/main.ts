import './style.css';
import {
  CATALOG, GROUPS, SEVERITY, byId, describeBody, effectInfo, mergeInfo, fmtEnergy, fmtLength, fmtMass, fmtNum, fmtPressure, fmtSpeed, fmtFixedSpeed, fixedLorentzGamma, minContactSpeed, regimeInfoFor, resolveImpact,
} from './sim';
import type { Body, BodyOutcome, ImpactOutcome, Regime } from './sim';
import { C_LIGHT } from './sim/units';
import { planShot } from './scene/planner';
import { Stage } from './scene/stage';

/**
 * Smash Lab page: pick two objects, a speed and an angle. The impact model (src/sim) decides
 * what happens to each; the stage (src/scene) shows it in 3D and the cards explain it.
 */

interface Preset {
  label: string;
  projectile: string;
  target: string;
  speed: number;
  angle: number;
}

const PRESETS: Preset[] = [
  { label: 'Baseball vs bowling ball', projectile: 'baseball', target: 'bowling', speed: 40, angle: 90 },
  { label: 'Marble crash', projectile: 'marble', target: 'marble', speed: 45, angle: 90 },
  { label: 'Meteor Crater', projectile: 'ironMeteoroid', target: 'earth', speed: 12800, angle: 45 },
  { label: 'Dinosaur-killer asteroid', projectile: 'asteroid', target: 'earth', speed: 20000, angle: 45 },
  { label: 'Moon hits Earth', projectile: 'moon', target: 'earth', speed: 30000, angle: 90 },
  { label: 'Dust grain vs Earth', projectile: 'dust', target: 'earth', speed: 20000, angle: 90 },
  { label: 'Egg drop', projectile: 'egg', target: 'boulder', speed: 6, angle: 90 },
  { label: 'Watermelon splat', projectile: 'watermelon', target: 'boulder', speed: 12, angle: 90 },
  { label: 'Head-on car crash', projectile: 'car', target: 'car', speed: 30, angle: 90 },
  { label: 'Snowball vs house', projectile: 'snowball', target: 'house', speed: 20, angle: 60 },
  { label: 'Diamond vs gold', projectile: 'diamond', target: 'goldBar', speed: 300, angle: 90 },
  { label: 'Jumbo jet vs Empire State', projectile: 'boeing', target: 'empire', speed: 250, angle: 90 },
  { label: 'Liberty vs Eiffel Tower', projectile: 'liberty', target: 'eiffel', speed: 80, angle: 90 },
  { label: 'Chelyabinsk meteor', projectile: 'chelyabinsk', target: 'earth', speed: 19000, angle: 18 },
  { label: 'Halley\'s Comet hits Venus', projectile: 'halley', target: 'venus', speed: 70000, angle: 45 },
  { label: 'Vesta hits Mars', projectile: 'vesta', target: 'mars', speed: 10000, angle: 45 },
  { label: 'Io vs Europa', projectile: 'io', target: 'europa', speed: 20000, angle: 90 },
  { label: 'Comet hits Jupiter', projectile: 'comet', target: 'jupiter', speed: 60000, angle: 45 },
  { label: 'Asteroid falls into the Sun', projectile: 'asteroid', target: 'sun', speed: 617000, angle: 60 },
  { label: 'Jupiter vs the Sun', projectile: 'jupiter', target: 'sun', speed: 617000, angle: 90 },
  { label: 'Earth meets a black hole', projectile: 'earth', target: 'stellarBH', speed: 2e7, angle: 90 },
  { label: 'Neutron star hits Earth', projectile: 'neutronStar', target: 'earth', speed: 7.6e6, angle: 90 },
  { label: 'The Sun hits Betelgeuse', projectile: 'sun', target: 'betelgeuse', speed: 1e6, angle: 90 },
  { label: "Godzilla's atomic breath hits Earth", projectile: 'atomicBreath', target: 'earth', speed: 2.998e8, angle: 60 },
  { label: 'Anti-Gravity Orb hits Earth', projectile: 'antiGravityOrb', target: 'earth', speed: 4e5, angle: 90 },
  { label: 'Supernova next to Earth', projectile: 'supernova', target: 'earth', speed: 1, angle: 60 },
  { label: 'Hypernova vs the Sun', projectile: 'hypernova', target: 'sun', speed: 1, angle: 60 },
  { label: 'Gamma-ray burst hits Earth', projectile: 'grb', target: 'earth', speed: 1, angle: 50 },
  { label: 'Big Bang vs the Milky Way', projectile: 'bigBang', target: 'milkyWay', speed: 1, angle: 60 },
  { label: 'Oh-My-God particle hits Earth', projectile: 'omgParticle', target: 'earth', speed: 2.998e8, angle: 90 },
  { label: 'Amaterasu particle hits Earth', projectile: 'amaterasu', target: 'earth', speed: 2.998e8, angle: 45 },
  { label: 'Planet into TON 618', projectile: 'jupiter', target: 'ton618', speed: 1e8, angle: 90 },
  { label: 'Milky Way meets Andromeda', projectile: 'milkyWay', target: 'andromeda', speed: 1.1e5, angle: 90 },
  { label: 'Two galaxy clusters collide', projectile: 'virgoCluster', target: 'coma', speed: 4.5e6, angle: 90 },
  { label: 'Milky Way falls into a black hole', projectile: 'milkyWay', target: 'trillionBH', speed: 3e7, angle: 90 },
  { label: 'The Sun crosses the Orion Nebula', projectile: 'sun', target: 'orion', speed: 2e4, angle: 90 },
  { label: 'Our universe hits the Hyper Universe', projectile: 'universe', target: 'hyperUniverse', speed: 2e8, angle: 90 },
  { label: 'MEVE-1 meets PHYVE-1-LOC', projectile: 'meve1', target: 'phyve1', speed: 2e8, angle: 90 },
  { label: 'Universe-mass black hole eats the universe', projectile: 'universe', target: 'universeBH', speed: 2e8, angle: 90 },
];

const MIN_LOG_SPEED = 0; // 1 m/s
const MAX_LOG_SPEED = 8.4; // 250,000 km/s, about 0.84 times light speed

const app = document.getElementById('app');
if (!app) throw new Error('Smash Lab: #app element missing');

const options = GROUPS.map((g) => {
  const items = CATALOG.filter((b) => b.group === g)
    .map((b) => `<option value="${b.id}">${b.emoji} ${b.name}</option>`)
    .join('');
  return `<optgroup label="${g}">${items}</optgroup>`;
}).join('');
app.innerHTML = `
  <header class="top">
    <a href="/" class="back">← Kids at Home</a>
    <span class="tag">EXPERIMENT 01 / SMASH LAB</span>
  </header>
  <main>
    <section class="intro">
      <h1>Smash Lab</h1>
      <p>Pick two objects, choose how fast one hits the other, and see what the energy does to each.</p>
    </section>
    <div class="layout">
      <section class="panel controls" aria-label="Setup">
        <h2>Setup</h2>
        <label for="projectile">Launched object</label>
        <select id="projectile">${options}</select>
        <p class="blurb" id="projectile-blurb"></p>
        <label for="target">Target object</label>
        <select id="target">${options}</select>
        <p class="blurb" id="target-blurb"></p>
        <div class="row"><label for="speed">Speed</label><output id="speed-out" for="speed"></output></div>
        <input id="speed" type="range" min="${MIN_LOG_SPEED}" max="${MAX_LOG_SPEED}" step="0.01">
        <p class="hint" id="speed-hint" hidden></p>
        <div class="row"><label for="angle">Impact angle</label><output id="angle-out" for="angle"></output></div>
        <input id="angle" type="range" min="10" max="90" step="1">
        <p class="hint">90° is head-on; low angles graze the surface.</p>
        <h3>Try one</h3>
        <div class="presets" id="presets"></div>
      </section>
      <section class="panel stagebox" aria-label="3D view">
        <div class="stage" id="stage"></div>
        <div class="stage-controls">
          <button type="button" id="launch" class="launch">▶ Launch</button>
          <input id="scrub" type="range" min="0" max="1000" value="0" aria-label="Playback position">
        </div>
        <p class="stage-note" id="stage-note" hidden></p>
      </section>
      <section class="panel results" aria-label="Result">
        <div id="energy" class="energy" aria-live="polite"></div>
        <div class="cards" id="cards" aria-live="polite"></div>
        <p class="footnote">Estimates from standard impact physics (crater scaling, catastrophic-disruption
          thresholds, shock heating), tuned to match Meteor Crater and the Chicxulub impact. Real craters
          vary; expect answers within a factor of two or so for big impacts.</p>
      </section>
    </div>
  </main>`;

const el = <T extends HTMLElement>(id: string): T => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Smash Lab: #${id} missing`);
  return node as T;
};
const projectileSel = el<HTMLSelectElement>('projectile');
const targetSel = el<HTMLSelectElement>('target');
const speedIn = el<HTMLInputElement>('speed');
const angleIn = el<HTMLInputElement>('angle');

const speedFromSlider = (): number => Math.pow(10, Number(speedIn.value));

/**
 * Speed at contact. Two bodies that fall together from far away already hit at their mutual
 * escape speed, so a heavy pair can never meet more slowly than that.
 */
function contactSpeed(projectile: Body, target: Body): { speed: number; floor: number; raised: boolean; fixedGamma?: number; stationary?: boolean } {
  // The Anti-Bubble never moves, so there is no speed to choose.
  if ([projectile, target].some((b) => b.special === 'antiBubble' || b.special === 'blast')) return { speed: 1, floor: 0, raised: false, stationary: true };
  // Cosmic-ray particles only ever arrive at one speed, so the slider does not apply to them.
  const fixedGamma = fixedLorentzGamma(projectile, target);
  if (fixedGamma !== undefined) return { speed: C_LIGHT, floor: 0, raised: false, fixedGamma };
  const floor = minContactSpeed(projectile.mass, projectile.radius, target.mass, target.radius);
  const asked = speedFromSlider();
  return { speed: Math.max(asked, floor), floor, raised: floor > asked };
}
const sliderFromSpeed = (v: number): string => String(Math.log10(v));

function card(body: Body, other: Body, o: BodyOutcome, result: ImpactOutcome, launched = false): string {
  const power = effectInfo(body, other, result.effect, result.repelled);
  const fused = power ? null : mergeInfo(body, other, result.merge, result.supernova);
  const info = power ?? fused ?? regimeInfoFor(body, other, o);
  const steps = (Object.keys(SEVERITY) as Regime[]).map((r) => `<i class="${SEVERITY[r] <= SEVERITY[o.regime] ? 'on' : ''}"></i>`).join('');
  const factLines = [...(power ? power.facts : fused ? fused.facts : describeBody(body, o))];
  if (result.effect === 'blast' && body.special !== 'blast') factLines.unshift(result.blastFraction >= 1 ? `The blast is ${fmtNum(result.blastFraction)} times the energy needed to vaporize it` : `The blast is ${fmtNum(result.blastFraction * 100)}% of the energy needed to vaporize it`);
  if (body.special === 'antiBubble') factLines.unshift('Mass: none. Size: none, it grows from a point from the moment you launch.', 'Never moves. Deletes everything it touches.');
  if (body.special === 'strangeOrb') factLines.unshift('Mass: −0 (none). Radius: 70 m.', 'Turns whatever it touches into green strange matter.');
  if (body.antimatter) {
    const push = (6.6743e-11 * body.mass) / (body.radius * body.radius);
    factLines.unshift(
      `Pushes everything away exactly as hard as the Moon pulls it in (the Moon pulls 1.62 m/s² at its surface; at the orb's own surface the push is ${fmtNum(push)} m/s²)`,
      `Antimatter: every kilogram that touches ordinary matter turns both into ${fmtNum(2 * 8.98755e16)} J (E = 2mc²)`,
    );
  }
  if (body.shownTemperature) factLines.unshift(`Temperature: ${body.shownTemperature}`);
  else if (body.temperatureC !== undefined) factLines.unshift(`Temperature: ${body.temperatureC.toLocaleString('en-US')} °C`);
  if (launched && body.energyEv !== undefined && body.length !== undefined) factLines.unshift(body.shownEnergy ? `Carries ${body.shownEnergy} whatever it hits` : `Carries ${fmtEnergy(body.energyEv * 1.602176634e-19, body.energyEv * 1.602176634e-19 / 4.184e12)} whatever it hits`);
  const facts = factLines.map((line) => `<li>${line}</li>`).join('');
  const size = body.special === 'blast' ? `releases ${fmtEnergy(body.blastJ ?? 0, (body.blastJ ?? 0) / 4.184e12)}` : body.special === 'antiBubble' ? 'no mass · no fixed size, it grows' : body.length !== undefined
    ? `${fmtLength(body.radius * 2)} wide · ${fmtLength(body.length)} long · ${fmtMass(body.mass)}`
    : `${body.shownRadius ?? fmtLength(body.radius)} radius · ${body.shownMass ?? fmtMass(body.mass)}`;
  return `
    <article class="card tone-${info.tone}">
      <header><span class="emoji" aria-hidden="true">${body.emoji}</span>
        <div><h3>${body.name}</h3><small>${size}</small></div></header>
      <div class="badge">${info.label}</div>
      <div class="meter" role="img" aria-label="Damage level ${SEVERITY[o.regime] + 1} of 7">${steps}</div>
      <p class="blurb">${info.blurb}</p>
      <ul>${facts}</ul>
    </article>`;
}

// ---- 3D stage -------------------------------------------------------------------------

const params = new URLSearchParams(location.search);
const launchBtn = el<HTMLButtonElement>('launch');
const scrub = el<HTMLInputElement>('scrub');
let stage: Stage | null = null;
try {
  const small = window.matchMedia('(max-width: 700px)').matches;
  stage = new Stage(el('stage'), { quality: params.get('q') === 'low' || small ? 'low' : 'high' });
  if (params.has('debug')) (window as unknown as { __smashStage: Stage }).__smashStage = stage;
} catch (error) {
  console.error('Smash Lab: 3D view unavailable', error);
  const note = el('stage-note');
  note.hidden = false;
  note.textContent = 'The 3D view needs WebGL2, which this browser could not start. The numbers below still work.';
  el('stage').hidden = true;
  launchBtn.disabled = true;
  scrub.disabled = true;
}

let shotTimer = 0;
let pendingAutoplay = false;

function buildShot(autoplay: boolean): void {
  if (!stage) return;
  const projectile = byId(projectileSel.value);
  const target = byId(targetSel.value);
  const input = { projectile, target, speed: contactSpeed(projectile, target).speed, impactParameter: Math.cos((Number(angleIn.value) * Math.PI) / 180) };
  const outcome = resolveImpact(input);
  if (outcome.repelled) return;
  stage.setShot(planShot(input, outcome));
  launchBtn.textContent = '▶ Launch';
  if (autoplay) stage.play();
}

/** Rebuild the 3D shot shortly after the last change (sliders fire many events). */
function scheduleShot(autoplay = false): void {
  pendingAutoplay = pendingAutoplay || autoplay;
  window.clearTimeout(shotTimer);
  shotTimer = window.setTimeout(() => {
    buildShot(pendingAutoplay);
    pendingAutoplay = false;
  }, autoplay ? 0 : 160);
}

if (stage) {
  stage.onTime = (t, ended) => {
    const duration = stage?.duration ?? 1;
    scrub.value = String(Math.round((t / duration) * 1000));
    if (ended) launchBtn.textContent = '↺ Replay';
  };
  launchBtn.addEventListener('click', () => {
    stage?.replay();
    launchBtn.textContent = '↺ Replay';
  });
  scrub.addEventListener('input', () => {
    if (!stage) return;
    stage.pause();
    stage.seek((Number(scrub.value) / 1000) * stage.duration);
  });
}

function render(): void {
  const projectile = byId(projectileSel.value);
  const target = byId(targetSel.value);
  const contact = contactSpeed(projectile, target);
  const speed = contact.speed;
  const angle = Number(angleIn.value);

  el('projectile-blurb').textContent = projectile.blurb;
  el('target-blurb').textContent = target.blurb;
  speedIn.disabled = contact.fixedGamma !== undefined || contact.stationary === true;
  el('speed-out').textContent = contact.stationary ? 'It does not move' : contact.fixedGamma !== undefined ? fmtFixedSpeed(contact.fixedGamma) : fmtSpeed(speed);
  const hint = el('speed-hint');
  hint.hidden = contact.stationary !== true && contact.fixedGamma === undefined && !contact.raised && contact.floor < speedFromSlider() * 0.3;
  if (contact.stationary) hint.textContent = [projectile, target].some((b) => b.special === 'blast') ? 'An explosion does not fly anywhere: it goes off the moment you launch, so the speed slider is switched off.' : 'The Anti-Bubble never moves. It starts growing the moment you launch, so the speed slider is switched off.';
  else if (contact.fixedGamma !== undefined) hint.textContent = 'Locked: this particle (or beam) always arrives at the speed real ones do, so the speed slider is switched off.';
  else if (projectile.antimatter || target.antimatter) hint.textContent = `The orb pushes everything away, so to touch it anything has to arrive at ${fmtSpeed(contact.floor)} or faster.`;
  else hint.textContent = contact.raised
    ? `Gravity alone pulls these two together at ${fmtSpeed(contact.floor)}, so they cannot meet any slower.`
    : `Gravity already pulls these two together at ${fmtSpeed(contact.floor)}; the speed above is the speed at impact.`;
  el('angle-out').textContent = `${angle}°`;

  const result = resolveImpact({ projectile, target, speed, impactParameter: Math.cos((angle * Math.PI) / 180) });
  const bigger = projectile.mass >= target.mass ? projectile : target;
  const joined = result.merge !== null && result.merge !== undefined;
  const combinedMass = bigger.shownMass ? `about ${bigger.shownMass}` : fmtMass(joined && result.merge ? result.merge.mass : projectile.mass + target.mass);
  const combinedSize = joined && result.merge ? ` · radius ${bigger.shownRadius ? `about ${bigger.shownRadius}` : fmtLength(result.merge.radius)}` : '';
  const annihilated = result.annihilatedMass > 0;
  const orb = projectile.antimatter ? projectile : target.antimatter ? target : undefined;
  const orbLeft = orb ? orb.mass - result.annihilatedMass : 0;
  const ordinary = projectile.special !== undefined ? target : projectile;
  const ordinaryMass = ordinary.shownMass ? `about ${ordinary.shownMass}` : fmtMass(ordinary.mass);
  const blasted = result.effect === 'blast';
  const share = result.blastFraction >= 1 ? `Enough to vaporize it ${fmtNum(result.blastFraction)} times over` : `${fmtNum(result.blastFraction * 100)}% of what it takes to vaporize it`;
  if (blasted) {
    el('energy').innerHTML = `<span>Energy released</span><strong>${fmtEnergy(result.energyJ, result.energyKilotons)}</strong>
    <span class="combined-label">Damage</span><strong class="combined">${share}</strong>
    <small>${projectile.special === 'blast' ? target.name : projectile.name} takes all of it.${joined && result.merge ? ` The star survives and takes in the blast's mass, so it now weighs ${fmtMass(result.merge.mass)}.` : ''}</small>`;
  } else if (result.repelled || result.effect !== 'none') {
    const [head, label, value, note] = result.repelled
      ? ['They never touch', 'Result', 'No collision', 'The Anti-Gravity Orb pushes away anything lighter than itself, and other orbs.']
      : result.effect === 'deleted'
        ? ['No energy: nothing explodes', 'Deleted', `${ordinaryMass} of matter`, 'The bubble grows past the whole object and deletes it.']
        : ['No energy: it weighs nothing', 'Turned to strange matter', ordinaryMass, 'Same mass as before, now green strange matter all the way through.'];
    el('energy').innerHTML = `<span>Impact energy</span><strong>${head}</strong>
    <span class="combined-label">${label}</span><strong class="combined">${value}</strong>
    <small>${note}</small>`;
  } else el('energy').innerHTML = `<span>Impact energy</span><strong>${fmtEnergy(result.energyJ, result.energyKilotons)}</strong>
    <small>Peak contact pressure ${fmtPressure(result.peakStressPa)} · bounce ${(result.restitution * 100).toFixed(0)}%</small>
    <span class="combined-label">${annihilated ? 'Annihilated' : joined ? 'Combined object' : 'Mass of both together'}</span><strong class="combined">${annihilated ? `${fmtMass(result.annihilatedMass)} of matter + ${fmtMass(result.annihilatedMass)} of antimatter` : combinedMass}</strong>
    <small>${annihilated ? (orbLeft > 0.001 * (orb?.mass ?? 1) ? `${fmtMass(orbLeft)} of the orb is left over` : 'The whole orb is used up') : joined ? `The two fuse into one body${combinedSize}` : result.supernova ? 'Nothing is left after the explosion' : `${projectile.name} + ${target.name}`}</small>`;
  el('cards').innerHTML = card(projectile, target, result.projectile, result, true) + card(target, projectile, result.target, result);
  if (stage) {
    // A pair the orb pushes apart can never touch, so there is nothing to launch.
    const note = el('stage-note');
    note.hidden = !result.repelled;
    note.textContent = 'The Anti-Gravity Orb pushes this one away, so they can never touch. Pick something heavier than the orb (the Moon or bigger).';
    launchBtn.disabled = result.repelled;
    scrub.disabled = result.repelled;
  }
}

function applyPreset(p: Preset, autoplay = true): void {
  projectileSel.value = p.projectile;
  targetSel.value = p.target;
  speedIn.value = sliderFromSpeed(p.speed);
  angleIn.value = String(p.angle);
  render();
  scheduleShot(autoplay);
}

const presetBox = el('presets');
for (const p of PRESETS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = p.label;
  button.addEventListener('click', () => applyPreset(p, true));
  presetBox.appendChild(button);
}
for (const input of [projectileSel, targetSel, speedIn, angleIn]) {
  input.addEventListener('input', () => {
    render();
    scheduleShot();
  });
}

applyPreset(PRESETS[2] as Preset, false);
