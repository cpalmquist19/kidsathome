import {
  AdditiveBlending, CanvasTexture, Group, IcosahedronGeometry, Mesh, NoColorSpace, RingGeometry, ShaderMaterial, Sprite,
  SpriteMaterial,
} from 'three';
import { NOISE_GLSL } from './noise';
import type { ShotPlan } from './planner';

let cachedGlow: CanvasTexture | null = null;
/** Soft radial gradient used by every flash and glow sprite. */
export function glowTexture(): CanvasTexture {
  if (cachedGlow) return cachedGlow;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,235,200,0.75)');
    g.addColorStop(0.5, 'rgba(255,150,60,0.22)');
    g.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  cachedGlow = new CanvasTexture(canvas);
  cachedGlow.colorSpace = NoColorSpace;
  return cachedGlow;
}

export function makeGlowSprite(sizeAttenuation = true): Sprite {
  const material = new SpriteMaterial({
    map: glowTexture(), blending: AdditiveBlending, depthWrite: false, transparent: true, sizeAttenuation,
  });
  const sprite = new Sprite(material);
  sprite.frustumCulled = false;
  return sprite;
}

const FIREBALL_VERT = /* glsl */ `
uniform float uT;
varying vec3 vN;
varying vec3 vW;
varying float vK;
${NOISE_GLSL}
void main() {
  float n = fbm(position * 2.2 + vec3(0.0, uT * 0.7, 0.0));
  vK = n;
  vec3 p = position * (0.78 + 0.5 * n);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const FIREBALL_FRAG = /* glsl */ `
uniform float uAge;      // 0 at start, 1 when gone
uniform float uStrength;
varying vec3 vN;
varying vec3 vW;
varying float vK;
${NOISE_GLSL}
void main() {
  vec3 V = normalize(cameraPosition - vW);
  float facing = pow(abs(dot(normalize(vN), V)), 1.4);
  float heat = (1.15 - 0.95 * uAge) * (0.55 + 0.9 * vK) * facing;
  float alpha = (1.0 - smoothstep(0.55, 1.0, uAge)) * uStrength;
  gl_FragColor = vec4(heatColor(heat) * alpha * (0.35 + 0.65 * facing) * 0.4, 1.0);
}
`;

export const FLASH_PEAK_SECONDS = 0.5;

/** Flash, shock ring and fireball at the impact point, as a pure function of seconds since contact. */
export class ImpactEffects {
  readonly group = new Group();
  private readonly flash = makeGlowSprite();
  private readonly ring: Mesh;
  private readonly ringMaterial: ShaderMaterial;
  private readonly fireball: Mesh;
  private readonly fireMaterial: ShaderMaterial;
  private readonly eventScale: number;
  private readonly heatLevel: number;
  private readonly severity: number;
  private readonly riLocal: number;

  constructor(private readonly plan: ShotPlan) {
    this.riLocal = plan.riLocal;
    this.eventScale = Math.max(plan.deform.radius, plan.riLocal, 0.3);
    this.heatLevel = Math.max(plan.surfaceOutcome.glow, plan.impactorOutcome.glow, plan.merge ? plan.merge.glow : 0);
    this.severity = Math.max(
      plan.deform.kind === 'crater' ? 1 : plan.deform.kind === 'dent' ? 0.3 : 0,
      plan.impactorFate === 'shatter' || plan.impactorFate === 'vaporize' ? 1 : plan.impactorFate === 'crack' ? 0.6 : 0,
      plan.surfaceDestroyed ? 1 : 0,
      plan.merge ? 0.6 : 0,
    );

    this.flash.position.set(0, plan.riLocal * 0.8, 0);
    this.group.add(this.flash);

    this.ringMaterial = new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { uAlpha: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `uniform float uAlpha; varying vec2 vUv;
        void main(){
          float r = length(vUv - 0.5) * 2.0;
          float a = smoothstep(0.93, 0.975, r) * (1.0 - smoothstep(0.975, 1.0, r));
          gl_FragColor = vec4(vec3(1.0, 0.82, 0.6) * a * uAlpha, 1.0);
        }`,
    });
    const ringGeometry = new RingGeometry(0.93, 1, 128);
    ringGeometry.rotateX(-Math.PI / 2);
    this.ring = new Mesh(ringGeometry, this.ringMaterial);
    this.ring.position.y = 0.02;
    this.ring.visible = !plan.patchIsWholeSphere;
    this.group.add(this.ring);

    this.fireMaterial = new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending,
      uniforms: { uT: { value: 0 }, uAge: { value: 1 }, uStrength: { value: 1 } },
      vertexShader: FIREBALL_VERT,
      fragmentShader: FIREBALL_FRAG,
    });
    this.fireball = new Mesh(new IcosahedronGeometry(1, 4), this.fireMaterial);
    this.fireball.frustumCulled = false;
    this.group.add(this.fireball);
  }

  /** `tau` = seconds since contact (negative before). */
  update(tau: number): void {
    const sprite = this.flash.material;
    if (tau < 0 || this.severity <= 0) {
      sprite.opacity = 0;
      this.ring.visible = false;
      this.fireball.visible = false;
      return;
    }
    const heat = this.heatLevel;
    const strength = (0.25 + 0.75 * this.severity) * (0.3 + 0.7 * Math.min(1, heat * 1.6));
    const s = this.eventScale;

    // Flash: white-hot for a blink.
    const flashLife = Math.exp(-tau / (0.07 + 0.1 * heat));
    sprite.opacity = 1;
    sprite.color.setScalar(strength * (heat > 0.05 ? 4.5 : 1.0) * flashLife);
    const flashBase = Math.max(this.riLocal, 0.25 * this.plan.deform.radius, 0.15);
    this.flash.scale.setScalar(flashBase * (heat > 0.05 ? 4.2 : 2.2));

    // Shock ring on the ground.
    const ringR = s * (0.5 + 5 * (1 - Math.exp(-tau / 0.4)));
    this.ring.visible = tau < 2.5 && this.ringMaterial.uniforms.uAlpha !== undefined;
    this.ring.scale.set(ringR, 1, ringR);
    (this.ringMaterial.uniforms.uAlpha as { value: number }).value = 0.45 * this.severity * Math.exp(-tau / 0.45) * (tau < 2.5 ? 1 : 0);

    // Fireball for hot impacts.
    if (heat > 0.25) {
      const life = 1.4 + 2.6 * heat;
      const age = tau / life;
      this.fireball.visible = age < 1;
      const r = s * (0.3 + 0.8 * heat) * (1 - Math.exp(-tau / 0.3)) + 0.001;
      this.fireball.scale.setScalar(r);
      this.fireball.position.set(0, r * 0.4, 0);
      (this.fireMaterial.uniforms.uT as { value: number }).value = tau;
      (this.fireMaterial.uniforms.uAge as { value: number }).value = Math.min(1, age);
      (this.fireMaterial.uniforms.uStrength as { value: number }).value = Math.min(1.2, 0.5 + heat);
    } else {
      this.fireball.visible = false;
    }
  }

  dispose(): void {
    this.flash.material.dispose();
    this.ringMaterial.dispose();
    this.fireMaterial.dispose();
    this.ring.geometry.dispose();
    this.fireball.geometry.dispose();
  }
}
