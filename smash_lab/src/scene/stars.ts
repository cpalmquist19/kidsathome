import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';
import { mulberry32 } from './noise';

/** A fixed starfield that follows the camera, so it never parallaxes. */
export function makeStars(count = 2600, pixelRatio = 1): Points {
  const rng = mulberry32(1234567);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = rng() * 2 - 1;
    const a = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    pos.set([s * Math.cos(a) * 80, u * 80, s * Math.sin(a) * 80], i * 3);
    const warm = rng();
    const bright = 0.25 + 0.75 * Math.pow(rng(), 3);
    col.set([bright * (0.8 + 0.3 * warm), bright * (0.85 + 0.1 * warm), bright * (1.1 - 0.3 * warm)], i * 3);
    size[i] = 1 + 1.6 * Math.pow(rng(), 6);
  }
  const g = new BufferAttribute(pos, 3);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', g);
  geometry.setAttribute('aColor', new BufferAttribute(col, 3));
  geometry.setAttribute('aSize', new BufferAttribute(size, 1));
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: { uPx: { value: pixelRatio } },
    vertexShader: `
      attribute vec3 aColor; attribute float aSize; uniform float uPx; varying vec3 vC;
      void main() {
        vC = aColor;
        gl_PointSize = aSize * uPx;
        gl_Position = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vC;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        gl_FragColor = vec4(vC * (1.0 - d * 0.5) * 0.9, 1.0);
      }`,
  });
  const stars = new Points(geometry, material);
  stars.frustumCulled = false;
  stars.renderOrder = -10;
  return stars;
}
