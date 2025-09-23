## Browser-side Star System Generation: Migration Plan

### Goals and scope
- **Goal**: Move star/planet/name generation from Python to JavaScript to run fully in-browser.
- **Scope**: Replicate algorithms and output formatting so the UI requires no changes. Add seedable RNG for reproducibility.
- **Out of scope (for this phase)**: Persistence of saved systems to the backend/database; removal of Python code (done after validation).

### Current backend behavior (to replicate)
- Name generation: Character-level Markov model with special formats for `P` (PSR ####…) and `MGTR` (MGTR ####…). Trained from `celestial_names.txt`.
- Star generation: Weighted sampling of types (`O,B,A,F,G,K,M,D,N,P,MGTR,QS,QK,BH`), optional overrides for type/color/size, giant-type multipliers. Mass, radius, temperature, luminosity according to class with several special-case branches.
- Planet generation: Planet type by orbital distance and star type, mass/radius ranges by type, habitable zone via `(T/5778)^2` scaling, multipliers for giant-type stars.
- System assembly: Planet likelihood and caps by exotic star types; distance sampling; planet naming `StarName b (RandomName)`.
- Flask response formatting: Specific string formatting for star mass and for planet mass/radius; distances formatted with `AU`.

### Data contract (inputs/outputs)
- Inputs (from UI):
  - Basic mode: `{ starType: '' | 'O'|'B'|'A'|'F'|'G'|'K'|'M'|'D'|'N'|'P'|'MGTR'|'QS'|'QK'|'BH' }`
  - Advanced mode (adds): `{ starColor: 'default'|'custom'|#hex, starSize: 'O'..'M', giantType: 'main'|'giant'|'super'|'hyper' }`
- Output (must match current UI usage):

```json
{
  "star": {
    "name": "String",
    "type": "String",
    "temperature": 0,
    "mass": "Formatted String",
    "radius": 0,
    "luminosity": 0,
    "customColor": "String|null"
  },
  "giantType": "main|giant|super|hyper",
  "planets": [
    {
      "name": "String",
      "type": "String",
      "mass": "X.X M⊕\nY.YYY M♃",
      "radius": "X.X R⊕\nY.YYY R♃",
      "distance": "Z.ZZ AU",
      "habitable": true
    }
  ]
}
```

### Target architecture (browser)
- Add `static/js/system_core.js` (pure logic, no DOM). Expose on `window.SystemGen`:
  - `MarkovNameGenerator`, `StarGenerator`, `PlanetGenerator`
  - `generateSystem(params)` returning the exact shape above
  - Seedable RNG support
- Move `generator/celestial_names.txt` to `static/data/celestial_names.txt`. Load once via `fetch`, cache in memory, and provide a small fallback list if not available.
- Wire `static/js/system_generator.js` to call `SystemGen.generateSystem(...)` instead of POSTing to `/generate-system`.

### Algorithm parity notes
- Spectral type weights: copy 1:1 from Python.
- Size/giant overrides: accept `specified_type`, `specified_color`, `specified_size`, `giant_type` equivalents.
- Mass:
  - Ranges per class; `G` uses normal distribution; others use power-law bias to lower masses.
- Radius:
  - Mass–radius relationships by class; compact objects provide radius in km but return as solar radii after conversion; black holes use Schwarzschild radius (km → solar radii); QS large radii (converted to solar radii as in Python).
- Temperature: sample from per-class ranges.
- Luminosity:
  - Special distributions for `QS`, `QK`, `BH` (quiescent vs AGN), `P`, `MGTR`, `N`, `D`; otherwise Stefan–Boltzmann law with clamp.
- Planets:
  - Type by orbital distance with special handling for `D` and `N` (more remnants close-in).
  - Mass/radius ranges by type; apply giant-type multipliers; compute habitable zone via `(T/5778)^2` scaling.
- System assembly:
  - Planet likelihood and caps for exotic stars (`P`, `MGTR`, `QK`, `BH`), including allowing 0 planets.
  - Distances sampled, sorted, and used for planet generation.
  - Planet name format preserved: `"StarName b (RandomName)"`.

### Output formatting (must match server)
- `star.mass`:
  - `QS`: `"{mass:.1e} M☉\n{mass/milky_way:.2e} M🌌"`
  - `BH`: if `mass >= 1e9` → scientific `"{:.1e} M☉"`, else fixed `"{:.3f} M☉"`
  - Others: fixed `"{:.3f} M☉"`
- `star.radius`: numeric (solar radii; UI handles unit switching for compact/QS).
- `planets.mass`: `"{earth:.1f} M⊕\n{jupiter:.3f} M♃"` where `jupiter = earth/317.8`.
- `planets.radius`: `"{earth:.1f} R⊕\n{jupiter:.3f} R♃"` where `jupiter = earth/11.2`.
- `planets.distance`: `"{au:.2f} AU"`.

### Seeding
- Sources (precedence):
  1) URL `?seed=...` (string hashed to 32-bit)
  2) `localStorage.systemGenSeed`
  3) Unseeded (default `Math.random`)
- Deterministic PRNG (e.g., xorshift32) wrapped as `rng()` so all sampling paths use it (no stray `Math.random()` calls).

### Phased migration plan
1) Core scaffolding (behind a simple feature flag in JS)
   - Add `static/data/celestial_names.txt` and loader with caching/fallback.
   - Add `static/js/system_core.js` with RNG interface and public API.
2) Port logic
   - Port `MarkovNameGenerator` with special cases for `P`, `MGTR` and training from names file.
   - Port `StarGenerator` with all distributions and overrides.
   - Port `PlanetGenerator` with types, ranges, HZ, and multipliers.
   - Implement `generateSystem(params)` assembling and formatting response.
3) Integrate
   - Replace both `fetch('/generate-system', ...)` call sites with `SystemGen.generateSystem(...)`.
   - Keep toggle to revert during testing (no server fallback in final state).
4) Validation
   - Sanity runs to verify distributions (e.g., M dominates; exotic stars are rare).
   - Edge-case rendering checks for `QS`, compact objects (`P`, `MGTR`, `N`, `QK`), `BH` mass formatting.
5) Clean-up (separate PR)
   - Remove `/generate-system` Flask route and Python generator modules once parity is approved.

### Acceptance criteria
- UI functions unchanged when client generator is enabled.
- Output fields and formatting match server expectations precisely.
- Rarity tracking and AFK mode operate identically.
- Seeded runs are reproducible for a given seed across refreshes.

### Validation strategy
- Generate sample sets and visually confirm star-type proportions and planet counts.
- Targeted tests for formatting strings (`QS`, `BH` thresholds, two-line planet metrics).
- Manual smoke tests in basic and advanced modes with/without seeds.

### Risks and mitigations
- Distribution drift: copy constants and equations verbatim; centralize RNG; add spot checks.
- Names asset not loading: fallback names list and visible console warning.
- Extremely large numbers: ensure number-to-string formatting mirrors Python logic.

### Rollback plan
- Keep a simple flag to switch between client and server generation during testing; final phase removes server path.

### Next steps
- Implement Phase 1 scaffolding, then proceed through the checklist in `docs/migration-checklist.md`.


