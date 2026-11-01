import {
  ACESFilmicToneMapping, AdditiveBlending, BufferAttribute, BufferGeometry, Group, HalfFloatType, LineBasicMaterial, LineSegments,
  BackSide, MeshBasicMaterial, Mesh, PerspectiveCamera, Points, Scene, ShaderMaterial as ShaderMat, Sprite, Vector2, Vector3, Vector4, WebGLRenderer, WebGLRenderTarget,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { LIGHT_YEAR, fmtLength } from '../sim';
import { Debris, QUALITY_HIGH, QUALITY_LOW, APPROACH_TIME } from './debris';
import { FRACTURE_HIGH, FRACTURE_LOW, FractureSim, FractureView, loadRapier, planFracture, wantsFracture } from './fracture';
import type { FractureQuality } from './fracture';
import type { DebrisQuality } from './debris';
import { ImpactEffects, makeGlowSprite } from './effects';
import { lookFor, planetModeFor } from './looks';
import type { Look } from './looks';
import { SurfacePatch, makeUnitSphere } from './patch';
import { BEAM_GLOBAL_MIN_RADIUS, BEAM_LOCAL_MAX, makeBeamGeometry } from './beam';
import type { PatchQuality } from './patch';
import { PATCH_RADIUS } from './planner';
import type { ShotPlan } from './planner';
import { Color, makeSurfaceMaterial } from './surface';
import { makeStars } from './stars';
import type { ShaderMaterial } from 'three';

const FOV = 40;
const CRATER_TIME = 1.1;
const COMPRESS_TIME = 0.14;

const clamp = (x: number, lo = 0, hi = 1): number => Math.min(hi, Math.max(lo, x));
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const BLAST_LOOK = {
  grb: { color: [0.75, 0.5, 1.0] as [number, number, number], gain: 1.5 },
  supernova: { color: [1.0, 0.5, 0.15] as [number, number, number], gain: 1.2 },
  hypernova: { color: [0.45, 0.7, 1.0] as [number, number, number], gain: 1.5 },
  bigBang: { color: [1.0, 0.95, 0.85] as [number, number, number], gain: 3.2 },
};
const BUBBLE_MAX = 2.7;
const BUBBLE_TIME = 8.5;
const easeOut = (x: number): number => 1 - Math.pow(1 - clamp(x), 3);
const mix = (a: number, b: number, k: number): number => a + (b - a) * k;
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)));

/** Heat left in a glowing object `tau` seconds after contact. */
function hotness(tau: number, glow: number): number {
  if (tau <= 0) return 0;
  const life = 2.5 + 6 * glow;
  return smooth(0, 0.05, tau) * Math.pow(clamp(1 - tau / life), 1.5);
}

function niceLength(meters: number): number {
  const exp = Math.floor(Math.log10(meters));
  const base = Math.pow(10, exp);
  const m = meters / base;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * base;
}

interface ShotObjects {
  patch: SurfacePatch;
  debris: Debris;
  effects: ImpactEffects;
  gSurface: Mesh;
  gSurfaceMat: ShaderMaterial;
  gImpactor: Mesh;
  gImpactorMat: ShaderMaterial;
  beacon: Sprite;
  trail: LineSegments;
  gGlow: Sprite;
  lFrame: Group;
  lImpactor: Mesh;
  /** Long thin impactor (an energy beam) drawn in its real shape instead of as a ball. */
  beam: boolean;
  lImpactorMat: ShaderMaterial;
  surfaceLook: Look;
  impactorLook: Look;
  /** Anti-Bubble: a black void and a glowing rim, both centred on the impact point. */
  bubbleVoid?: Mesh;
  bubbleRim?: Mesh;
  /** Explosion: a glowing fireball at the impact point, and for a gamma-ray burst a thin jet. */
  fire?: Mesh;
  jet?: Mesh;
}

export interface StageOptions {
  quality?: 'high' | 'low';
}

export class Stage {
  /** Called every rendered frame with the current time and whether the shot has ended. */
  onTime?: (t: number, ended: boolean) => void;

  private readonly renderer: WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.01, 400);
  private readonly scene = new Scene();
  private readonly stars: Points;
  private readonly globalRoot = new Group();
  private readonly localRoot = new Group();
  private readonly sphere = makeUnitSphere(96, 64);
  private readonly labelEl: HTMLElement;
  private readonly barEl: HTMLElement;
  private readonly barLabelEl: HTMLElement;
  private readonly fadeEl: HTMLElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly patchQuality: PatchQuality;
  private readonly debrisQuality: DebrisQuality;
  private readonly fractureQuality: FractureQuality;
  private fractureView: FractureView | null = null;
  private fractureReady = false;
  private fractureEligible = false;
  private bakeToken = 0;
  private holding = false;

  private plan: ShotPlan | null = null;
  private shot: ShotObjects | null = null;
  private time = 0;
  private playing = false;
  private lastStamp = 0;
  private raf = 0;
  private height = 1;

  constructor(private readonly host: HTMLElement, options: StageOptions = {}) {
    const low = options.quality === 'low';
    this.patchQuality = low ? { rings: 120, segments: 160 } : { rings: 220, segments: 256 };
    this.debrisQuality = low ? QUALITY_LOW : QUALITY_HIGH;
    this.fractureQuality = low ? FRACTURE_LOW : FRACTURE_HIGH;

    this.renderer = new WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setClearColor(0x02030a, 1);
    const canvas = this.renderer.domElement;
    canvas.className = 'stage-canvas';
    host.appendChild(canvas);

    const hud = document.createElement('div');
    hud.className = 'stage-hud';
    hud.innerHTML = `
      <div class="stage-label"></div>
      <div class="stage-scale"><div class="stage-bar"></div><span class="stage-bar-label"></span></div>
      <div class="stage-fade"></div>`;
    host.appendChild(hud);
    this.labelEl = hud.querySelector('.stage-label') as HTMLElement;
    this.barEl = hud.querySelector('.stage-bar') as HTMLElement;
    this.barLabelEl = hud.querySelector('.stage-bar-label') as HTMLElement;
    this.fadeEl = hud.querySelector('.stage-fade') as HTMLElement;

    this.scene.add(this.globalRoot, this.localRoot);
    this.stars = makeStars(2600, this.renderer.getPixelRatio());
    this.scene.add(this.stars);

    const target = new WebGLRenderTarget(2, 2, { type: HalfFloatType, samples: low ? 0 : 4 });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new Vector2(2, 2), 0.75, 0.55, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
  }

  get currentTime(): number {
    return this.time;
  }
  get isPlaying(): boolean {
    return this.playing;
  }
  /** False while a breakup simulation is still running (playback holds just before contact). */
  get breakupReady(): boolean {
    return !this.fractureEligible || this.fractureReady;
  }
  get duration(): number {
    return this.plan?.timeline.end ?? 0;
  }

  /** Replace the current shot. The stage shows its first frame, paused. */
  setShot(plan: ShotPlan): void {
    this.pause();
    this.disposeShot();
    this.plan = plan;
    this.shot = this.buildShot(plan);
    this.startFracture(plan);
    this.seek(0);
  }

  play(): void {
    if (!this.plan) return;
    if (this.time >= this.plan.timeline.end) this.time = 0;
    this.playing = true;
    this.lastStamp = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.tick);
  }

  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.raf);
  }

  replay(): void {
    this.time = 0;
    this.play();
  }

  /** Render the exact frame for time `t` (seconds). Deterministic: same `t`, same picture. */
  seek(t: number): void {
    if (!this.plan) return;
    this.time = clamp(t, 0, Math.min(this.plan.timeline.end, this.timeLimit));
    this.apply(this.time);
    this.composer.render();
    this.onTime?.(this.time, this.time >= this.plan.timeline.end);
  }

  canvasDataUrl(): string {
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose(): void {
    this.pause();
    this.resizeObserver.disconnect();
    this.disposeShot();
    this.sphere.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.host.replaceChildren();
  }

  /** Playback may not pass the moment of contact until the breakup simulation has finished. */
  private get timeLimit(): number {
    if (!this.plan) return 0;
    return this.fractureEligible && !this.fractureReady ? this.plan.timeline.contact - 0.12 : this.plan.timeline.end;
  }

  private tick = (stamp: number): void => {
    if (!this.playing || !this.plan) return;
    const dt = Math.min(0.05, Math.max(0, (stamp - this.lastStamp) / 1000));
    this.lastStamp = stamp;
    const limit = this.timeLimit;
    const next = this.time + dt;
    if (next >= this.plan.timeline.end) {
      this.seek(this.plan.timeline.end);
      this.playing = false;
      return;
    }
    this.holding = next >= limit;
    this.seek(Math.min(next, limit));
    this.raf = requestAnimationFrame(this.tick);
  };

  private resize(): void {
    const w = Math.max(2, this.host.clientWidth);
    const h = Math.max(2, this.host.clientHeight);
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.plan) this.seek(this.time);
  }

  private get pixelScale(): number {
    return this.renderer.domElement.height / (2 * Math.tan((FOV * Math.PI) / 360));
  }

  // ---- building -----------------------------------------------------------------------

  private buildShot(plan: ShotPlan): ShotObjects {
    const surfaceLook = lookFor(plan.surface.material, plan.surface.id);
    const impactorLook = lookFor(plan.impactor.material, plan.impactor.id);
    const surfacePlanet = planetModeFor(plan.surface.id);
    const impactorPlanet = planetModeFor(plan.impactor.id);

    // Global frame.
    const gSurfaceMat = makeSurfaceMaterial({ ...surfaceLook, noiseScale: surfaceLook.noiseScale * 2.5, bump: surfaceLook.bump }, { planet: surfacePlanet });
    const gSurface = new Mesh(this.sphere, gSurfaceMat);
    gSurface.position.set(0, -1, 0);
    const gImpactorMat = makeSurfaceMaterial({ ...impactorLook, noiseScale: impactorLook.noiseScale * 2.5, bump: impactorLook.bump * plan.riGlobal }, { planet: impactorPlanet });
    const beamLength = plan.impactor.length;
    const gImpactor = new Mesh(beamLength !== undefined ? makeBeamGeometry(beamLength / plan.surface.radius / Math.max(plan.riGlobal, BEAM_GLOBAL_MIN_RADIUS)) : this.sphere, gImpactorMat);
    const beacon = makeGlowSprite(false);
    beacon.scale.setScalar(0.022);
    const trailGeometry = new BufferGeometry();
    trailGeometry.setAttribute('position', new BufferAttribute(new Float32Array(6), 3));
    trailGeometry.setAttribute('color', new BufferAttribute(new Float32Array([2.5, 1.5, 0.8, 0, 0, 0]), 3));
    const trail = new LineSegments(trailGeometry, new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending, transparent: true, depthWrite: false }));
    trail.frustumCulled = false;
    const gGlow = makeGlowSprite();
    this.globalRoot.add(gSurface, gImpactor, beacon, trail, gGlow);
    let bubbleVoid: Mesh | undefined;
    let bubbleRim: Mesh | undefined;
    let fire: Mesh | undefined;
    let jet: Mesh | undefined;
    if (plan.blast) {
      fire = new Mesh(this.sphere, new ShaderMat({
        transparent: true, depthWrite: false, blending: AdditiveBlending,
        uniforms: { uColor: { value: new Vector3(1, 0.6, 0.25) }, uGain: { value: 0 } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform vec3 uColor; uniform float uGain; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(uColor * uGain * (0.35 + 1.4 * pow(f, 0.8)), 1.0); }',
      }));
      fire.visible = false;
      this.globalRoot.add(fire);
      if (plan.blast.kind === 'grb') {
        jet = new Mesh(makeBeamGeometry(4.5 / 0.02), new MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: AdditiveBlending }));
        jet.scale.setScalar(0.02);
        jet.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), new Vector3(...plan.dir));
        jet.position.set(...plan.dir).multiplyScalar(-0.02);
        jet.visible = false;
        this.globalRoot.add(jet);
      }
    }
    if (plan.bubble) {
      bubbleVoid = new Mesh(this.sphere, new MeshBasicMaterial({ color: 0x000000 }));
      bubbleRim = new Mesh(this.sphere, new ShaderMat({
        transparent: true, depthWrite: false, blending: AdditiveBlending, side: BackSide,
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); gl_FragColor = vec4(vec3(0.55, 0.8, 1.0) * (0.15 + 3.0 * f), 1.0); }',
      }));
      bubbleVoid.visible = false;
      bubbleRim.visible = false;
      this.globalRoot.add(bubbleVoid, bubbleRim);
    }

    // Local frame.
    const patch = new SurfacePatch(plan, this.patchQuality);
    const debris = new Debris(plan, this.debrisQuality, wantsFracture(plan));
    const effects = new ImpactEffects(plan);
    const lImpactorMat = makeSurfaceMaterial({ ...impactorLook, noiseScale: impactorLook.noiseScale * 2.5, bump: impactorLook.bump * plan.riLocal }, { planet: impactorPlanet });
    const lImpactor = new Mesh(beamLength !== undefined ? makeBeamGeometry(Math.min(BEAM_LOCAL_MAX, beamLength / plan.unit) / plan.riLocal) : this.sphere, lImpactorMat);
    lImpactor.scale.setScalar(plan.riLocal);
    const lFrame = new Group();
    lFrame.add(lImpactor);
    this.localRoot.add(patch.mesh, lFrame, effects.group, ...debris.objects);

    return { patch, debris, effects, gSurface, gSurfaceMat, gImpactor, gImpactorMat, beacon, trail, gGlow, lFrame, lImpactor, beam: beamLength !== undefined, lImpactorMat, surfaceLook, impactorLook, bubbleVoid, bubbleRim, fire, jet };
  }

  private disposeShot(): void {
    this.bakeToken++;
    this.fractureView?.dispose();
    this.fractureView = null;
    this.fractureReady = false;
    this.fractureEligible = false;
    this.holding = false;
    const s = this.shot;
    if (!s) return;
    s.patch.dispose();
    s.debris.dispose();
    s.effects.dispose();
    s.gSurfaceMat.dispose();
    if (s.beam) { s.gImpactor.geometry.dispose(); s.lImpactor.geometry.dispose(); }
    s.gImpactorMat.dispose();
    s.lImpactorMat.dispose();
    (s.bubbleVoid?.material as MeshBasicMaterial | undefined)?.dispose();
    (s.bubbleRim?.material as ShaderMat | undefined)?.dispose();
    (s.fire?.material as ShaderMat | undefined)?.dispose();
    if (s.jet) { s.jet.geometry.dispose(); (s.jet.material as MeshBasicMaterial).dispose(); }
    s.beacon.material.dispose();
    s.gGlow.material.dispose();
    s.trail.geometry.dispose();
    (s.trail.material as LineBasicMaterial).dispose();
    this.globalRoot.clear();
    this.localRoot.clear();
    this.shot = null;
  }

  // ---- breakup simulation ---------------------------------------------------------------

  private startFracture(plan: ShotPlan): void {
    this.bakeToken++;
    this.fractureReady = false;
    this.fractureEligible = wantsFracture(plan);
    if (!this.fractureEligible) return;
    void this.bakeFracture(plan, this.bakeToken);
  }

  private async bakeFracture(plan: ShotPlan, token: number): Promise<void> {
    // MessageChannel yields to the event loop without the 4 ms / 1 s clamping that
    // setTimeout(0) gets in nested or background-tab situations.
    const channel = new MessageChannel();
    const later = (): Promise<void> =>
      new Promise((resolve) => {
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(0);
      });
    try {
      const R = await loadRapier();
      await later();
      if (token !== this.bakeToken) return;
      const specs = planFracture(plan, this.fractureQuality);
      await later();
      if (token !== this.bakeToken) return;
      const sim = new FractureSim(R, plan, specs);
      while (!sim.step(15)) {
        await later();
        if (token !== this.bakeToken) {
          sim.dispose();
          return;
        }
      }
      if (token !== this.bakeToken) return;
      const view = new FractureView(sim.bake, plan);
      this.localRoot.add(view.group);
      this.fractureView = view;
      this.fractureReady = true;
      this.holding = false;
      this.seek(this.time);
    } catch (error) {
      if (token !== this.bakeToken) return;
      console.warn('Smash Lab: breakup simulation unavailable, using simple fragments', error);
      this.fractureEligible = false;
      this.holding = false;
      const shot = this.shot;
      if (shot) {
        this.localRoot.remove(...shot.debris.objects);
        shot.debris.dispose();
        shot.debris = new Debris(plan, this.debrisQuality, false);
        this.localRoot.add(...shot.debris.objects);
      }
      this.seek(this.time);
    }
  }

  // ---- per-frame state ------------------------------------------------------------------

  private apply(t: number): void {
    const plan = this.plan;
    const shot = this.shot;
    if (!plan || !shot) return;
    const T = plan.timeline;
    const staysLocal = plan.patchIsWholeSphere;
    const midCut = (T.approachEnd + T.cutEnd) / 2;
    const midReturn = (T.impactEnd + T.returnEnd) / 2;
    const isLocal = !(plan.bubble || plan.blast) && t >= midCut && (staysLocal || t < midReturn);
    this.globalRoot.visible = !isLocal;
    this.localRoot.visible = isLocal;
    this.fadeEl.style.opacity = String(plan.bubble || plan.blast ? 0 : Math.max(bump(t, T.approachEnd, T.cutEnd), staysLocal ? 0 : bump(t, T.impactEnd, T.returnEnd)));

    let distance: number;
    let unitMeters: number;
    if (isLocal) {
      distance = this.applyLocal(plan, shot, t);
      unitMeters = plan.unit;
    } else {
      distance = this.applyGlobal(plan, shot, t);
      unitMeters = plan.surface.radius;
    }
    this.stars.position.copy(this.camera.position);
    this.updateHud(plan, isLocal, t, distance, unitMeters);
  }

  private applyGlobal(plan: ShotPlan, shot: ShotObjects, t: number): number {
    const T = plan.timeline;
    const g = plan.global;
    const riG = plan.riGlobal;
    const aftermath = !(plan.bubble || plan.blast) && t > T.cutEnd;
    const ta = aftermath ? t - T.returnEnd : 0;
    const dir = new Vector3(...plan.dir);
    const heatS = plan.surfaceOutcome.glow;

    // Impactor position.
    const c0 = new Vector3(0, riG, 0);
    let impactorVisible = !(plan.bubble || plan.blast);
    const pos = c0.clone();
    if (!aftermath) {
      const k = clamp(t / T.approachEnd);
      const s = mix(g.startDistance, g.cutDistance, k);
      pos.addScaledVector(dir, -s);
    } else if (plan.impactorSurvives) {
      const vG = (g.startDistance - g.cutDistance) / T.approachEnd;
      if (plan.bounce) pos.add(new Vector3(...plan.bounce).multiplyScalar(vG * (Math.max(ta, 0) + 0.3)));
      else pos.y = riG * 0.4;
    } else {
      impactorVisible = false;
    }

    const meshVisible = impactorVisible && (shot.beam || riG > 2e-4);
    shot.gImpactor.visible = meshVisible;
    shot.gImpactor.position.copy(pos);
    shot.gImpactor.scale.setScalar(shot.beam ? Math.max(riG, BEAM_GLOBAL_MIN_RADIUS) : Math.max(riG, 1e-6));
    if (shot.beam) shot.gImpactor.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), dir);
    shot.gSurface.rotation.y = 0;
    shot.gSurface.scale.setScalar(plan.merge && aftermath ? plan.merge.scale : 1);

    // Anti-Bubble: grows from nothing at the impact point from the first moment, and deletes what it covers.
    const blast = plan.blast;
    const tb = Math.max(0, t - 0.3);
    const rho = plan.bubble ? BUBBLE_MAX * Math.pow(clamp(t / BUBBLE_TIME), 1.7) : blast ? blast.removed * easeOut(tb / 3.2) : 0;
    ((shot.gSurfaceMat.uniforms.uBubble as { value: Vector4 }).value).set(0, 0, 0, rho);
    if (shot.bubbleVoid && shot.bubbleRim) {
      const on = rho > 1e-5;
      shot.bubbleVoid.visible = on;
      shot.bubbleRim.visible = on;
      shot.bubbleVoid.scale.setScalar(Math.max(rho, 1e-6));
      shot.bubbleRim.scale.setScalar(Math.max(rho, 1e-6) * 1.06);
    }
    // Explosion: a fireball at the impact point that erases what it engulfs and leaves the rest scorched.
    if (blast && shot.fire) {
      const look = BLAST_LOOK[blast.kind];
      const radius = blast.fire * easeOut(tb / 3.2);
      // The fireball dims into a faint glowing remnant.
      const gain = look.gain * smooth(0, 0.25, tb) * (0.1 + 0.9 * (1 - smooth(3.5, 9, t)));
      shot.fire.visible = t >= 0.3 && gain > 0.002;
      shot.fire.scale.setScalar(Math.max(radius, 1e-5));
      const fu = (shot.fire.material as ShaderMat).uniforms;
      ((fu.uColor as { value: Vector3 }).value).set(...look.color);
      (fu.uGain as { value: number }).value = gain;
      if (shot.jet) {
        const jetGain = 4 * (1 - smooth(0.9, 1.9, t));
        shot.jet.visible = jetGain > 0.01;
        (shot.jet.material as MeshBasicMaterial).color.setRGB(0.8 * jetGain, 0.55 * jetGain, 1.4 * jetGain);
      }
      (shot.gSurfaceMat.uniforms.uHeatAdd as { value: number }).value = blast.heat * smooth(0.3, 2, t) * (1 - 0.5 * smooth(6, 11, t));
    }
    // Strange matter spreading over the whole body from the impact point.
    {
      const su = shot.gSurfaceMat.uniforms;
      const spread = plan.strange && t > T.contact;
      (su.uStrangeAmt as { value: number }).value = spread ? 1 : 0;
      (su.uStrangeFront as { value: number }).value = spread ? 2.7 * easeOut((t - T.contact) / 5) : 0;
      (su.uTime as { value: number }).value = t;
    }

    // Camera: side-on for the approach, then high above the impact site for the aftermath.
    const kAfter = aftermath ? 1 : 0;
    const az = mix(-0.4 + 0.06 * Math.sin(t * 0.35), -0.15, kAfter);
    const el = mix(0.24, 0.95, kAfter);
    const target = new Vector3(...g.cameraTarget).lerp(new Vector3(0, -0.45, 0), kAfter);
    const push = 1 - 0.07 * easeOut(t / T.end);
    const d = g.cameraDistance * push * mix(1, 0.72, kAfter);
    this.camera.position.set(
      target.x + d * Math.sin(az) * Math.cos(el), target.y + d * Math.sin(el), target.z + d * Math.cos(az) * Math.cos(el),
    );
    this.camera.near = 0.05;
    this.camera.far = 400;
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    // Beacon: a fixed-size dot so a tiny impactor is still seen.
    const camDist = this.camera.position.distanceTo(pos);
    const apparentPx = (riG * this.pixelScale) / Math.max(camDist, 1e-6) / this.renderer.getPixelRatio();
    const beaconOn = impactorVisible && !aftermath;
    shot.beacon.visible = beaconOn;
    shot.beacon.position.copy(pos);
    shot.beacon.material.opacity = clamp(1.2 - apparentPx / 10);
    shot.beacon.material.color.setScalar(2.4);

    // Trail behind the impactor.
    shot.trail.visible = beaconOn && !shot.beam;
    if (beaconOn && !shot.beam) {
      const len = 0.35 + 0.5 * (1 - clamp(t / T.approachEnd));
      const tail = pos.clone().addScaledVector(dir, -len);
      (shot.trail.geometry.getAttribute('position') as BufferAttribute).set([pos.x, pos.y, pos.z, tail.x, tail.y, tail.z]);
      shot.trail.geometry.getAttribute('position').needsUpdate = true;
    }

    // Scar and glow after the hit.
    const scarReal = plan.deform.kind === 'none' ? 0 : (plan.deform.radius * plan.unit) / plan.surface.radius;
    const scarAng = scarReal > 0.002 ? Math.min(scarReal, 1.3) : 0;
    const scarOn = aftermath && scarAng > 0;
    const u = shot.gSurfaceMat.uniforms;
    (u.uScarAng as { value: number }).value = scarOn ? scarAng * easeOut(ta / 0.5) : 0;
    (u.uScarHeat as { value: number }).value = scarOn ? heatS * 1.0 * hotness(ta + 0.05, heatS) : 0;

    const severe = plan.deform.kind === 'crater' || plan.impactorFate === 'shatter' || plan.impactorFate === 'vaporize' || plan.impactorFate === 'merge';
    const glowOn = aftermath && severe;
    shot.gGlow.visible = glowOn;
    if (glowOn) {
      const size = Math.max(0.05, 3.2 * Math.max(scarReal, riG * 1.5, 0.004)) * (0.5 + 0.5 * Math.min(1, heatS * 2));
      const life = Math.exp(-ta / (0.5 + 1.5 * heatS)) * smooth(0, 0.08, ta);
      shot.gGlow.position.set(0, 0.01, 0);
      shot.gGlow.scale.setScalar(size * (1 + 0.8 * easeOut(ta / 1.5)));
      shot.gGlow.material.opacity = 1;
      shot.gGlow.material.color.setScalar((0.6 + 5 * heatS) * life);
    }
    return d;
  }

  /** The surface body absorbs the impactor: it swells, takes on the blended colour and, if heavy enough, collapses. */
  private applyMerge(plan: ShotPlan, shot: ShotObjects, tau: number): void {
    const m = plan.merge;
    if (!m) return;
    const pu = shot.patch.material.uniforms;
    const whole = plan.patchIsWholeSphere;
    const hot = m.glow * hotness(tau, m.glow);
    (pu.uHeatAdd as { value: number }).value = hot * (whole ? 1 : 0.35);
    if (!whole) return;

    const first = m.scale >= 1 ? 0.3 : 1.9;
    const grow = easeOut((tau - first) / 2.2);
    const swell = 0.05 * bump(tau, 0.15, 1.6) * (m.blackHole ? 0 : 1);
    const s = mix(1, m.scale, grow) * (1 + swell);
    const center = -plan.rsLocal;
    shot.patch.mesh.scale.setScalar(s);
    shot.patch.mesh.position.set(0, center * (1 - s), 0);

    // Blend the two bodies' colours by how much of the new body came from each.
    const blend = smooth(0.4, 3.0, tau) * m.impactorShare;
    const cu = pu as Record<string, { value: Color }>;
    const a = shot.surfaceLook.colorA.clone().lerp(shot.impactorLook.colorA, blend);
    const b = shot.surfaceLook.colorB.clone().lerp(shot.impactorLook.colorB, blend);
    if (shot.surfaceLook.emissive > 0 && blend > 0) {
      // Averaging an orange and a blue star gives lilac. A merged star is a hotter yellow-white instead.
      const warm = new Color(1.0, 0.82, 0.55);
      for (const c of [a, b]) {
        const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
        c.lerp(warm.clone().multiplyScalar(lum * 1.15), 0.7);
      }
    }
    const dark = m.blackHole ? smooth(1.5, 2.1, tau) : 0;
    (cu.uColorA as { value: Color }).value.copy(a.multiplyScalar(1 - dark));
    (cu.uColorB as { value: Color }).value.copy(b.multiplyScalar(1 - dark));
    (pu.uEmissive as { value: number }).value = shot.surfaceLook.emissive * (1 - dark);
    if (m.blackHole) (pu.uPlanet as { value: number }).value = tau > 1.8 ? 9 : planetModeFor(plan.surface.id);
  }

  private applyLocal(plan: ShotPlan, shot: ShotObjects, t: number): number {
    const T = plan.timeline;
    const tau = t - T.contact;
    const ri = plan.riLocal;
    const dir = new Vector3(...plan.dir);
    const so = plan.surfaceOutcome;
    const io = plan.impactorOutcome;
    const vA = plan.local.startDistance / APPROACH_TIME;

    // Surface patch.
    shot.patch.setProgress(tau / CRATER_TIME);
    const fv = this.fractureReady ? this.fractureView : null;
    const impactorShards = fv?.hasSource('impactor') ?? false;
    const surfaceShards = fv?.hasSource('surface') ?? false;
    shot.patch.mesh.visible = tau < 0 || (surfaceShards ? false : !plan.surfaceDestroyed || tau < 0.012);
    const pu = shot.patch.material.uniforms;
    (pu.uHeat as { value: number }).value = hotness(tau, plan.merge ? Math.max(so.glow, plan.merge.glow) : so.glow);
    (pu.uTime as { value: number }).value = t;
    if (plan.merge) this.applyMerge(plan, shot, tau);
    if (plan.strange) {
      const reach = plan.patchIsWholeSphere ? 2 * plan.rsLocal + 2 : PATCH_RADIUS * 1.3;
      (pu.uStrangeAmt as { value: number }).value = tau > 0 ? 1 : 0;
      (pu.uStrangeFront as { value: number }).value = tau > 0 ? reach * easeOut(tau / 3) : 0;
    }

    // Impactor kinematics and squash.
    const c = new Vector3(0, ri, 0);
    let squash = 0;
    if (tau < 0 || shot.beam) {
      // A beam does not stop at the surface: it keeps going in until it is spent.
      c.addScaledVector(dir, vA * tau);
    } else {
      const k = clamp(tau / COMPRESS_TIME);
      squash = plan.permanentSquash * smooth(0, 1, k) + (plan.peakSquash - plan.permanentSquash) * Math.sin(Math.PI * k);
      c.addScaledVector(dir, ri * squash * 0.9);
      if (tau > COMPRESS_TIME && plan.merge) {
        // Gravity-bound bodies do not rest on each other: the smaller one sinks into the bigger one.
        c.y -= easeOut((tau - COMPRESS_TIME) / 1.5) * 2.6 * ri;
      } else if (tau > COMPRESS_TIME) {
        if (plan.bounce) {
          // Slow-motion rebound: leaves fast, then drifts to a stop so it stays in shot.
          const t0 = 0.9;
          const travel = 0.9 * vA * t0 * (1 - Math.exp(-(tau - COMPRESS_TIME) / t0));
          c.add(new Vector3(...plan.bounce).multiplyScalar(travel));
        } else {
          const depth = plan.deform.kind === 'none' ? 0 : plan.deform.depth;
          const yFinal = Math.min(c.y, -depth + 0.9 * ri);
          c.y = mix(c.y, yFinal, easeOut((tau - COMPRESS_TIME) / CRATER_TIME));
        }
      }
    }
    const visible = tau < 0 || (shot.beam ? tau < 0.45 : impactorShards ? false : plan.merge ? tau < 1.9 : plan.impactorSurvives || tau < 0.012);
    shot.lImpactor.visible = visible;
    shot.lFrame.visible = visible;
    shot.lFrame.position.copy(c);
    shot.lFrame.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), dir);
    const along = 1 - squash;
    const across = 1 / Math.sqrt(Math.max(along, 0.2));
    shot.lFrame.scale.set(along, across, across);
    if (!shot.beam) shot.lImpactor.rotation.set(0.6 * t, 0.9 * t, 0.2 * t);
    const um = shot.lImpactorMat.uniforms;
    (um.uHeatAdd as { value: number }).value = plan.merge ? plan.merge.glow * hotness(tau, plan.merge.glow) : plan.impactorSurvives ? io.glow * hotness(tau, io.glow) : 0;
    (um.uTime as { value: number }).value = t;

    // Rigid-body shards from the Voronoi breakup.
    if (fv) {
      fv.setHeat('impactor', io.glow * hotness(tau, io.glow));
      fv.setHeat('surface', so.glow * hotness(tau, so.glow));
      fv.update(tau);
    }

    // Debris and effects.
    shot.debris.update(tau, this.pixelScale);
    shot.effects.update(tau);

    // Camera: close-up, then a slow pull-back that shows the aftermath.
    const L = plan.local;
    const pull = smooth(0.1, 3.4, tau);
    const w = clamp(-tau / APPROACH_TIME); // 1 at the start of the close-up approach, 0 at contact
    const settle = 1 + 0.9 * w;
    const d = mix(L.cameraNear * settle, L.cameraFar, pull);
    const az = mix(0.32, 0.75, pull);
    const el = mix(0.26, 0.55, pull);
    const farTarget = plan.patchIsWholeSphere ? new Vector3(0, -plan.rsLocal * 0.55, 0) : new Vector3(0, 0.05, 0);
    const target = new Vector3(0, 0.35 * L.focus, 0).lerp(farTarget, pull).lerp(c, 0.55 * w);
    let dist = d;
    if (fv && pull > 0) {
      const cl = fv.cloud(tau);
      const w = (surfaceShards ? 0.85 : 0.35) * pull;
      target.lerp(new Vector3(cl.x, cl.y, cl.z), w);
      dist = Math.min(80, Math.max(d, pull * (cl.radius * 3.2 + 2)));
    }
    const energy = Math.min(1, Math.max(so.glow, io.glow, plan.merge ? plan.merge.glow : 0, plan.deform.kind === 'crater' ? 0.4 : 0));
    const shake = tau > 0 ? 0.03 * L.focus * energy * Math.exp(-tau / 0.3) : 0;
    this.camera.position.set(
      target.x + dist * Math.sin(az) * Math.cos(el) + shake * Math.sin(tau * 71),
      target.y + dist * Math.sin(el) + shake * Math.sin(tau * 53 + 1),
      target.z + dist * Math.cos(az) * Math.cos(el) + shake * Math.sin(tau * 47 + 2),
    );
    this.camera.near = Math.max(0.005, Math.min(0.05, L.cameraNear * 0.01));
    this.camera.far = 400;
    this.camera.lookAt(target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    return dist;
  }

  private updateHud(plan: ShotPlan, isLocal: boolean, t: number, distance: number, unitMeters: number): void {
    const T = plan.timeline;
    let label: string;
    if (plan.bubble) label = 'THE ANTI-BUBBLE EXPANDS';
    else if (plan.blast) label = { grb: 'GAMMA-RAY BURST', supernova: 'SUPERNOVA', hypernova: 'HYPERNOVA', bigBang: 'THE BIG BANG' }[plan.blast.kind];
    else if (t < T.approachEnd) label = 'APPROACH · wide view';
    else if (t < T.contact) label = 'CLOSE-UP · final approach (slow motion)';
    else if (isLocal && t < T.impactEnd) label = 'IMPACT';
    else label = 'AFTERMATH';
    this.labelEl.textContent = this.holding ? 'PREPARING BREAKUP…' : label;

    const cssPxPerUnit = this.height / (2 * Math.tan((FOV * Math.PI) / 360)) / distance;
    const metersPerPx = unitMeters / cssPxPerUnit;
    const rawMeters = 110 * metersPerPx;
    // Very long scale bars read better in whole light-years than in powers of ten of metres.
    const meters = rawMeters >= 1e16 ? niceLength(rawMeters / LIGHT_YEAR) * LIGHT_YEAR : niceLength(rawMeters);
    const widthPx = meters / metersPerPx;
    this.barEl.style.width = `${Math.round(widthPx)}px`;
    this.barLabelEl.textContent = fmtLength(meters);
  }
}
