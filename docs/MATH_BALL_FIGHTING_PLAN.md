# Math Ball Fighting Game — Plan

Big numbers and functions are balls. The **defender** (a number) sits in the middle of the arena.
The **attacker** (a number or a function) bounces off it, and every hit does the attacker's current
value as damage. Inspired by the "number vs number" Shorts genre, with our own look.

Route: `/math_ball_fighting` · Template: `templates/math_ball_fighting.html` ·
Code: `static/js/math_ball_fighting/`

## Matchup rules
- **Defender** is always a **number**. Functions can never defend.
- **Attacker** is a number or a function. Function vs function is not allowed.
- Any valid pairing can be picked freely. No ladder, nothing to unlock.
- A bigger (or equal) attacker one-shots: 1 vs 1 is a one-hit KO.
- **Number attackers do fixed damage** every hit and never grow.
- **Function attackers** start at input 1 and go up by one each hit: TREE(1) → TREE(2) → TREE(3).
  The label animates when it changes.
- **No timer.** A fight lasts until the defender reaches 0 health or the player leaves.
  1 vs Googol is legal and really takes 10¹⁰⁰ hits. Up to the player.

## Long fights
- HUD shows the hit counter and remaining health (exact while it fits, then a formula such as
  `Googolplex − 37`).
- **Hits to KO** plus a time estimate at the current pace, with a heat-death comparison
  when it gets silly (the universe has about 10¹⁰⁰ years before heat death).
- Watch mode has a speed control: 1×, 4×, 16×, 64×.

## Modes
- **Watch:** both balls run themselves. The attacker falls toward the defender, bounces off
  it and the walls with a little random deflection. Every touch is a hit.
- **Fight:** the player controls the attacker.
  - PC: WASD / arrow keys move with momentum, Space dashes.
  - Mobile: virtual joystick (bottom-left, appears where you touch) and a dash button (bottom-right).
  - Hit speed changes the feel (shake, size of effects) but never the damage.
- **Defender** is passive and stays in the center by default. Option **"Defender wanders"** makes it
  drift randomly and bounce off walls, in both modes. It never attacks.

## Roster
- Phase 1 numbers: 1, 2, 3, 5, 7, 10, 12, 42, 100, 1,000
- Phase 2 numbers: Million, Billion, Googol, Googolplex
- Later numbers: Skewes, Googolplexplex, Moser, Graham's, TREE(3), SCG(13), Loader's, Rayo's, BIG FOOT
  (Skewes's number, about 10^10^10^34, is bigger than a googolplex, so it lands in Phase 3)
- Functions (added over time): n+1, 2n, n², n!, 10ⁿ, Ackermann A(n,n), Graham G(n), TREE(n),
  BB(n), Rayo(n)
- Values are exact BigInts under 1,000 digits, then magnitudes from the shared
  `static/js/bignum/magnitude.js` (same {L, t} convention as Numbers VS. Operations' engine;
  that game still uses its own copy). Ball size comes from rank among the numbers.
- Later phases can pull extra names and ordering from `static/data/numbers_vs_operations/named_numbers.json`.

## Textures — our own designs, drawn from each number's math
Shader-drawn (animated, react to hits, no art files). Painted art can override any ball later.

| Ball | Design |
|---|---|
| 1 | Glowing iridescent pearl |
| 2 | Two-tone binary marble with a glowing seam and flickering bits |
| 3 | Three-color swirl |
| 5 | Emerald five-petal facets with gold veins |
| 7 | Seven rainbow bands |
| 10 | Bronze dial with 10 glowing notches |
| 12 | Clock face with 12 ticks and moving hands |
| 42 | Nebula orb with stars |
| 100 | 10×10 grid of lamps |
| 1,000 | Mosaic of 1,000 gold and silver tiles |
| Googol | Spiral of 100 glowing zeros |
| Googolplex | A galaxy inside the ball |
| Skewes | Ulam prime spiral |
| Moser | Nested triangles / squares / circles (Steinhaus–Moser notation) |
| Graham's | Spinning wireframe hypercube with ↑↑↑ runes |
| TREE(n) | Crystal orb with branching trees inside, **n node colors**, purple-teal swirl rim, banner label |
| Rayo | Dark crimson scales engraved with ∀ ∃ ∈ ¬, one slit eye that tracks the attacker, scales crack to light |
| SCG / Loader / BB | Graph network / lambda-calculus glyphs / Turing tape |
| Functions | Metallic ring with the formula engraved and a live input label |

Defenders show glowing cracks as health drops.

## Impact visuals
Level is driven by **damage size**, not percent of health. The KO hit adds one level and slow motion.
Effects stack.

| Level | Damage | Effect |
|---|---|---|
| 0 | 1–9 | Spark pop, squash |
| 1 | 10–999 | Shockwave ring, light shake, floating damage number |
| 2 | up to 10¹⁵ | Flash, hit-stop, debris |
| 3 | up to Googol | Color fringing, lightning arcs |
| 4 | up to Googolplex | Glass shatter (rainbow-edged screen shards) |
| 5 | Moser / up-arrows | Spiral warp |
| 6 | Graham's | Kaleidoscope + frame-feedback trails |
| 7 | TREE / SCG | Datamosh glitch blocks, checkerboard fragments, screen tearing |
| 8 | Uncomputable | Fever-dream merge: textures melt into each other, color-flip flashes, reality tears |

- Tech: three.js r128 (same CDN as the other games), orthographic camera, 2D shader-drawn balls,
  full-screen shader passes for levels 3+.
- **Calm effects** toggle (default on with `prefers-reduced-motion`). Flashes capped at 3 per second.
- At high Watch speeds, effects are throttled.

## Build order
1. ✅ **Phase 1:** numbers 1–1,000 with exact BigInt math, Watch + Fight modes, matchup picker,
   joystick, wander option, speed control, hits-to-KO estimate, impact levels 0–2,
   textures for the starting balls. 1 vs 1 one-shot works.
2. ✅ **Phase 2:** Million, Billion, Googol, Googolplex, functions n+1, 2n, n², n!, 10ⁿ with live labels,
   shared magnitude module, exact hits-to-K.O. solver for functions, "Googol − 37" / "0.000…%" health text,
   post-processing pass, levels 3 (colour fringing, lightning) and 4 (glass shatter, flying shards).
3. ✅ **Phase 3:** Skewes (Ulam prime spiral), Googolplexplex (galaxy of galaxies), Moser (nested shapes),
   Graham's (spinning tesseract), functions Ackermann A(n,n) and Graham's sequence G(n).
   New "up-arrow" value kind 10↑^a x where the arrow count is itself a value, so Graham's number is
   G(64) nested 64 deep and G(n) vs Graham's number really takes 64 hits.
   Levels 5 (spiral warp + vortex) and 6 (kaleidoscope + frame-feedback trails).
4. ✅ **Phase 4:** TREE(3), SCG(13), Loader's number, Rayo's number, BIG FOOT; functions TREE(n) and BB(n).
   Growth-class values (TREE < SCG < Loader < Busy Beaver < Rayo < BIG FOOT) for numbers past any
   up-arrow description. Showcase designs: TREE (crystal orb, glowing tree with n seed colours, purple-teal
   rim) and Rayo (crimson scales engraved with ∀ ∃ ∈ ¬, a slit eye that tracks its opponent).
   Uncomputable balls flicker and tear. Levels 7 (datamosh: jumping, smearing and checkerboard blocks,
   tearing) and 8 (fever dream: the screen flows, drips, mirrors into itself and shifts hue); K.O.s reach 9.
   - BB(1)–BB(5) are exact and BB(6) > 2↑↑↑5; from BB(7) on the game uses a labelled guess.
   - Rayo(n) was left out: its values are unknown and it stays tiny for thousands of hits.
   - Added after: Oblivion (black hole) and Utter Oblivion (endless tunnel of rings), Jonathan Bowers'
     numbers ranked above BIG FOOT. Their fact cards say they are not precisely defined.
   - Added after: functions SSCG(n) (SSCG(1) = 5, SSCG(2) ≈ 3 × 2^(3 × 2⁹⁵), SSCG(3) past TREE(3)) and SCG(n).
     SCG(n) is only known to lie between SSCG(n) and SSCG(4n+3); the game guesses SSCG(2n+1) and labels it.
   - Added after: the functions behind the existing numbers - Tetration 10↑↑n (towers like googolplex and
     Skewes), up-arrows 3↑ⁿ3 (3↑↑↑↑3 = G(1)), Steinhaus-Moser Circle(n) (Circle(2) = mega), Loader's Dⁿ(99)
     (D⁵(99) = Loader's number), Rayo(n) and FOOT(n). Rayo(n), FOOT(n) and D¹–D⁴(99) are labelled guesses;
     Rayo(n) vs Rayo's number really takes a googol hits.
   - Added after: SSCG(3) as a number, and Fish number 7 (= F₇⁶³(10¹⁰⁰), a school of 63 glowing fish) with its
     function F₇ⁿ(10¹⁰⁰), which wins on hit 63. Fish 7 is placed above Rayo's number (one F₇ application already
     reaches Rayo(10¹⁰⁰)) and below BIG FOOT; the fact card says the comparison isn't proven.
   - Added after: the Large Number Garden Number (= f¹⁰(10↑¹⁰10), a night garden with 10 blooming flowers),
     ranked above BIG FOOT and below Oblivion, with its function fⁿ(10↑¹⁰10) that wins on hit 10.
     f¹ to f⁹ are placed just below it, a labelled guess.
5. Sound, Shorts (9:16) layout, Calm-effects tuning, polish.
