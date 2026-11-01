# Smash Lab 3D scene

Code in `src/scene/`. Three.js (WebGL2) with custom GLSL, a bloom pass and ACES tone mapping.
Everything is a pure function of the shot plan and the time `t`, so `stage.seek(t)` always draws
the same picture (handy for screenshots and the scrub bar).

## Two frames, one flash-free cut

A 32-bit GPU cannot hold a marble and a planet in one coordinate system, so the scene uses two:

| Frame | 1 unit is | Shows |
|---|---|---|
| Global | the radius of the larger body | the approach and, for most impacts, the aftermath |
| Local | `plan.unit` metres, picked so the smaller body is at most 1 unit and the crater at most 4 | the close-up |

The impact point is the origin and the surface normal there is +Y in both. The local surface is a
patch (a polar grid around the impact point) built in double precision, so an Earth-sized surface
costs the GPU no more than a marble. `src/scene/planner.ts` does all the scale math with no
rendering and `tests/planner.test.ts` checks that every catalog pair, speed and angle keeps
every render number small and finite.

## Timeline (seconds, `TIMELINE` in `planner.ts`)

| Time | What |
|---|---|
| 0 - 2.6 | Global approach. A fixed-size beacon and trail keep a tiny impactor visible. |
| 2.6 - 2.85 | Fade through white while the scene swaps to the local frame. |
| 2.85 - 3.75 | Local approach, slow motion, camera tracks the impactor in. |
| 3.75 | Contact. Impactor squashes, flash, crater grows over about 1.1 s. |
| 3.75 - 8.25 | Debris, shock ring, fireball (hot impacts), camera pulls back. |
| 8.25 - 8.5 | Fade through white back to global (skipped when the surface body is small enough that the local view already shows all of it). |
| 8.5 - 11.5 | Global aftermath: glow, and a scar when the crater is a visible part of the planet. |

## Files

- `planner.ts` scale switching, crater size in render units, impactor fate, camera distances.
- `patch.ts` surface patch with crater height field (CPU, so normals stay right).
- `surface.ts` one GLSL material for every body: procedural albedo and bump, sun light, heat glow.
- `debris.ts` analytic particles and chunks (positions come from `t` in the vertex shader, no per-frame CPU work).
- `effects.ts` flash, shock ring, fireball. `stars.ts` starfield. `stage.ts` ties it together.

## Known limits (next steps)

- Fragments are generic low-poly chunks, not Voronoi pieces of the real object (step 5).
- Surface bodies that are destroyed are replaced by chunks and dust rather than fracturing visibly.
- Planets all look like generic rock; stars and gas giants need their own presenters (step 8).
- Debris gravity and timing are presentation choices, not physical.
- The impactor is deformed by squashing a sphere; permanent dents on it are a uniform squash.

## Step 5 — Voronoi breakup + Rapier (spike)

- `src/scene/voronoi.ts`: fractures a sphere into convex Voronoi cells (seeds clustered at the contact point; 8–14 cells for "crack", 18–64 for "shatter"). Outer faces keep the smooth sphere normals/texture coords; cut faces are flagged `aInner` and shaded as fresh fracture.
- `src/scene/fracture.ts`: `planFracture` → `FractureSim` (Rapier convex-hull bodies, CCD, crater/ball ground, radial gravity) is **baked** at 60 fps, then `FractureView` plays it back by interpolation, so `seek()` stays deterministic.
- Rapier (`@dimforge/rapier3d-compat`, ~4.3 MB, 1.6 MB gzip) is lazy-loaded only when a shot actually fractures. Playback holds just before contact ("PREPARING BREAKUP…") until the bake is ready.
- If Rapier or the bake fails, the stage falls back to the older analytic chunks.
- Known limits: ground collider uses the final crater from t=0; very large bodies still use the analytic path; shard count capped (64 high / 32 low quality).
- After pulling: run `npm install` in `smash_lab/` (new dependency) before rebuilding.
