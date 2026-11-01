import { LatheGeometry, Vector2 } from 'three';
import type { BufferGeometry } from 'three';
import { decorateSphere } from './patch';

/**
 * A long thin beam: a cylinder of radius 1 with a rounded head, lying along the x axis.
 * The head's tip is at x = +1 and the tail at x = -tailLength, so the beam flies head first
 * along +x, the same way the impactor frame points.
 */
export function makeBeamGeometry(tailLength: number): BufferGeometry {
  const profile: Vector2[] = [];
  const steps = Math.min(48, Math.max(2, Math.ceil(tailLength / 4)));
  for (let i = 0; i <= steps; i++) profile.push(new Vector2(1, -tailLength * (1 - i / steps)));
  const cap = 14;
  for (let i = 1; i <= cap; i++) {
    const a = (i / cap) * (Math.PI / 2);
    profile.push(new Vector2(Math.cos(a), Math.sin(a)));
  }
  const g = new LatheGeometry(profile, 40);
  g.rotateZ(-Math.PI / 2); // lathe axis y -> beam axis +x
  g.computeVertexNormals();
  return decorateSphere(g);
}

/** Longest stretch of beam drawn in the close-up frame, in the frame's own units (the camera far plane is 400). */
export const BEAM_LOCAL_MAX = 240;
/** Thinnest the beam is drawn in the wide view, in surface radii, so a 5 m wide beam can still be seen. */
export const BEAM_GLOBAL_MIN_RADIUS = 0.0035;
