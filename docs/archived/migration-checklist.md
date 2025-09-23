## In-browser Generator Migration – Progress Tracker

Keep this checklist updated as we implement. Strike-through when completed and add dates if helpful.

### Phase 1 – Scaffolding
- [ ] Move `generator/celestial_names.txt` to `static/data/celestial_names.txt` and implement loader with caching and fallback
- [ ] Add `static/js/system_core.js` with:
  - [ ] Seedable RNG (URL param / localStorage)
  - [ ] Public API on `window.SystemGen`

### Phase 2 – Port logic
- [ ] Port `MarkovNameGenerator` with special names for `P` and `MGTR`
- [ ] Port `StarGenerator` (weights, mass/radius/temp, luminosity, overrides, giant multipliers)
- [ ] Port `PlanetGenerator` (type distributions, mass/radius by type, HZ, multipliers)
- [ ] Implement `generateSystem(params)` that assembles and formats output to match Flask

### Phase 3 – Integration
- [ ] Replace both `fetch('/generate-system', ...)` call sites in `static/js/system_generator.js`
- [ ] Remove temporary feature flag; ensure no server fallback remains

### Phase 4 – Validation
- [ ] Sanity-check star-type distributions (M common; exotics rare)
- [ ] Verify formatting edge cases (`QS` mass lines, `BH` threshold, planet two-line metrics)
- [ ] Test basic/advanced modes and AFK mode
- [ ] Test seeded reproducibility across refreshes for fixed seeds

### Phase 5 – Cleanup (separate PR after approval)
- [ ] Remove Flask `/generate-system` route
- [ ] Remove Python generator modules
- [ ] Keep DB-saving functionality for future user-initiated saves (separate ticket)

### Notes / Decisions
- No server fallback in final state.
- `celestial_names.txt` served from `/static/data/`.
- Seed support included via URL/localStorage.


