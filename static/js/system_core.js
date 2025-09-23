// Asset versioned via Flask static_file helper (?v=mtime). Change triggers cache bust.
// Pure logic module for in-browser system generation.
// Exposes window.SystemGen with seedable RNG, names loader, and placeholder API.

(function() {
    'use strict';

    // -----------------------------
    // Seedable RNG (xorshift32)
    // -----------------------------
    function hashStringToSeed(input) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < input.length; i++) {
            h ^= input.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function createRng(seed) {
        let state = (typeof seed === 'number' ? seed >>> 0 : hashStringToSeed(String(seed))) || 0x9e3779b9;
        return function rng() {
            // xorshift32
            state ^= state << 13; state >>>= 0;
            state ^= state >>> 17; state >>>= 0;
            state ^= state << 5; state >>>= 0;
            return (state >>> 0) / 0x100000000;
        };
    }

    function pickSeed() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('seed')) return urlParams.get('seed');
        const stored = window.localStorage.getItem('systemGenSeed');
        if (stored) return stored;
        return Math.floor(Math.random() * 0xffffffff) >>> 0;
    }

    // -----------------------------
    // Weighted choice helper
    // -----------------------------
    function weightedChoice(entries, rng) {
        // entries: Array<[value, weight]>
        const total = entries.reduce((sum, e) => sum + e[1], 0);
        let r = rng() * total;
        for (let i = 0; i < entries.length; i++) {
            r -= entries[i][1];
            if (r <= 0) return entries[i][0];
        }
        return entries[entries.length - 1][0];
    }

    // -----------------------------
    // Names loader (cached)
    // -----------------------------
    let cachedNames = null;
    async function loadCelestialNames() {
        if (cachedNames) return cachedNames;
        if (Array.isArray(window.CELESTIAL_NAMES) && window.CELESTIAL_NAMES.length) {
            cachedNames = window.CELESTIAL_NAMES;
            return cachedNames;
        }
        console.warn('CELESTIAL_NAMES not found; using minimal defaults. Include static/js/celestial_names_data.js before system_core.js');
        cachedNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
        return cachedNames;
    }

    // -----------------------------
    // Placeholder API (to be filled in phases 2+)
    // -----------------------------
    // -----------------------------
    // Markov Name Generator (order-k)
    // -----------------------------
    class MarkovNameGenerator {
        constructor(order = 2, rng) {
            this.order = order;
            this.rng = rng || Math.random;
            this.transitions = new Map(); // key -> Map(char -> count)
            this.starts = [];
        }

        train(names) {
            for (const raw of names) {
                const name = String(raw || '').toUpperCase();
                if (name.length < this.order) continue;
                this.starts.push(name.slice(0, this.order));
                for (let i = 0; i < name.length - this.order; i++) {
                    const current = name.slice(i, i + this.order);
                    const nextChar = name[i + this.order];
                    if (!this.transitions.has(current)) this.transitions.set(current, new Map());
                    const bucket = this.transitions.get(current);
                    bucket.set(nextChar, (bucket.get(nextChar) || 0) + 1);
                }
            }
        }

        static generateSpecial(prefix, length, rng) {
            const digits = Array.from({ length }, () => Math.floor((rng || Math.random)() * 10)).join('');
            return `${prefix} ${digits}`;
        }

        generate({ minLength = 4, maxLength = 10, starType = null } = {}) {
            // Special formats for Pulsar and Magnetar
            if (starType === 'P') {
                const len = Math.floor((this.rng() * 8)) + 5; // 5-12
                return MarkovNameGenerator.generateSpecial('PSR', len, this.rng);
            } else if (starType === 'MGTR') {
                const len = Math.floor((this.rng() * 8)) + 5; // 5-12
                return MarkovNameGenerator.generateSpecial('MGTR', len, this.rng);
            }

            if (this.starts.length === 0) throw new Error('Markov generator not trained');
            
            // Try multiple times to get a diverse name
            for (let attempt = 0; attempt < 10; attempt++) {
                let current = this.starts[Math.floor(this.rng() * this.starts.length)];
                let name = current;
                
                // Continue generating until we hit maxLength or no more transitions
                while (name.length < maxLength) {
                    const bucket = this.transitions.get(current);
                    if (!bucket) break;
                    
                    // Add some randomness - 30% chance to stop even if we could continue
                    if (name.length >= minLength && this.rng() < 0.3) break;
                    
                    // weighted pick
                    const entries = Array.from(bucket.entries()); // [char, count]
                    const next = weightedChoice(entries.map(([c, w]) => [c, w]), this.rng);
                    name += next;
                    current = name.slice(-this.order);
                }
                
                // Only return if we got a reasonable length name
                if (name.length >= minLength && name.length <= maxLength) {
                    return name.charAt(0) + name.slice(1).toLowerCase();
                }
            }
            
            // Fallback: return a random start if all attempts failed
            const fallback = this.starts[Math.floor(this.rng() * this.starts.length)];
            return fallback.charAt(0) + fallback.slice(1).toLowerCase();
        }
    }

    // -----------------------------
    // Star Generator
    // -----------------------------
    class StarGenerator {
        constructor(rng) {
            this.rng = rng || Math.random;
            this.spectralWeights = {
                'O': 1,
                'B': 13,
                'A': 60,
                'F': 300,
                'G': 700,
                'K': 1200,
                'M': 7600,
                'D': 120,
                'N': 3,
                'P': 2,
                'MGTR': 1,
                'QS': 0.1,
                'QK': 0.0001,
                'BH': 0.05,
                'WH': 0.0001,
                'WORM': 0.0001,
                'SC': 0.00002,  // 1 in 5 million = 0.00002% = Secret rarity
                'NEB': 0.00002,  // 1 in 5 million = 0.00002% = Secret rarity
                'GAL': 0.000004,  // 1 in 25 million = 0.000004% = Secret rarity
                'GF': 0.000000001,  // 1 in 1 billion = 0.000000001% = Godly rarity
                'SV': 0.000000001,  // 1 in 1 billion = 0.000000001% = Godly rarity
                'BD': 9000,  // 9% = 9000 weight = Common rarity
                'HS': 0.0001,  // 1 in a million = 0.0001% = Mythical rarity
                'IGVPO': 0.0000001  // 1 in 10 million = 0.0000001% = Secret rarity
            };
        }

        randomUniform(min, max) { return min + (max - min) * this.rng(); }

        randomGaussian(mean, stddev) {
            // Box-Muller
            let u = 0, v = 0;
            while (u === 0) u = this.rng();
            while (v === 0) v = this.rng();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            return mean + z * stddev;
        }

        _calculateMass(sType) {
            const ranges = {
                'O': [20.0, 100.0],
                'B': [3.0, 20.0],
                'A': [1.4, 3.0],
                'F': [1.04, 1.4],
                'G': [0.8, 1.04],
                'K': [0.45, 0.8],
                'M': [0.08, 0.45],
                'D': [0.17, 1.33],
                'N': [1.4, 3.0],
                'P': [1.4, 2.0],
                'MGTR': [1.4, 2.5],
                'QK': [1.4, 3.0],
                'QS': [550000, 1e11],
                'BH': [1.0, 1e11],
                'WH': [-1e11, -1],  // -100 billion to -1 solar masses
                'WORM': [0, 0],     // 0 solar masses
                'SC': [100, 500000], // 100 to 500,000 solar masses
                'NEB': [3, 10000],   // 3 to 10,000 solar masses
                'GAL': [10000, 1e12], // 10k to 1 trillion solar masses
                'GF': [1e9 * 1.5e12, 1e12 * 1.5e12],    // 1 billion to 1 trillion Milky Way Galaxy masses (1.5e21 to 1.5e24 solar masses)
                'SV': [0, 0],        // 0 solar masses (voids are empty)
                'BD': [13 * 0.00095, 80 * 0.00095],  // 13 to 80 Jupiter masses (converted to solar masses: 0.0124 to 0.076 M☉)
                'HS': [1e6, 1e12],   // 1 million to 1 trillion solar masses
                'IGVPO': [Infinity, Infinity]  // Infinite mass
            };
            const [minV, maxV] = ranges[sType];
            if (sType === 'G') {
                // clamp to range
                const val = Math.max(minV, Math.min(maxV, this.randomGaussian(0.92, 0.06)));
                return val;
            } else {
                const rf = Math.pow(this.rng(), 1.5);
                return minV + (maxV - minV) * rf;
            }
        }

        _calculateRadius(mass, sType) {
            // Returns solar radii (km conversions applied inside when needed)
            if (sType === 'BH') {
                const schwarzschildKm = 2.95 * mass; // km
                return schwarzschildKm / 695700.0; // solar radii
            } else if (sType === 'WH') {
                // White hole: 1km per -1 solar mass
                const radiusKm = Math.abs(mass); // Convert negative mass to positive radius
                return radiusKm / 695700.0; // solar radii
            } else if (sType === 'WORM') {
                // Wormhole: 1 meter to 100 light years
                const minRadiusM = 1; // 1 meter
                const maxRadiusLy = 100; // 100 light years
                const lightYearKm = 9.461e12; // km per light year
                const maxRadiusKm = maxRadiusLy * lightYearKm;
                
                // Use power distribution to favor smaller sizes (more realistic for wormholes)
                const randomFactor = Math.pow(this.rng(), 3); // Cube to heavily favor smaller sizes
                const radiusKm = minRadiusM / 1000 + (maxRadiusKm - minRadiusM / 1000) * randomFactor;
                return radiusKm / 695700.0; // solar radii
            } else if (sType === 'QS') {
                // Convert AU to solar radii
                const baseRadiusAu = this.randomUniform(632411, 63240000000); // replicate python
                return baseRadiusAu * 149597870.7 / 695700.0;
            } else if (sType === 'SC') {
                // Star Cluster: 1k AU to 10 ly
                const minRadiusAu = 1000; // 1k AU
                const maxRadiusLy = 10; // 10 light years
                const lightYearAu = 63241.1; // AU per light year
                const maxRadiusAu = maxRadiusLy * lightYearAu;
                
                // Use power distribution to favor smaller clusters
                const randomFactor = Math.pow(this.rng(), 2); // Square to favor smaller sizes
                const radiusAu = minRadiusAu + (maxRadiusAu - minRadiusAu) * randomFactor;
                return radiusAu * 149597870.7 / 695700.0; // Convert AU to solar radii
            } else if (sType === 'NEB') {
                // Nebula: 1 ly to 500 ly
                const minRadiusLy = 1; // 1 light year
                const maxRadiusLy = 500; // 500 light years
                const lightYearAu = 63241.1; // AU per light year
                const minRadiusAu = minRadiusLy * lightYearAu;
                const maxRadiusAu = maxRadiusLy * lightYearAu;
                
                // Use power distribution to favor smaller nebulae
                const randomFactor = Math.pow(this.rng(), 1.5); // Favor smaller sizes
                const radiusAu = minRadiusAu + (maxRadiusAu - minRadiusAu) * randomFactor;
                return radiusAu * 149597870.7 / 695700.0; // Convert AU to solar radii
            } else if (sType === 'GAL') {
                // Galaxy: 200 ly to 20 million ly
                const minRadiusLy = 200; // 200 light years
                const maxRadiusLy = 20000000; // 20 million light years
                const lightYearAu = 63241.1; // AU per light year
                const minRadiusAu = minRadiusLy * lightYearAu;
                const maxRadiusAu = maxRadiusLy * lightYearAu;
                
                // Use power distribution to favor smaller galaxies
                const randomFactor = Math.pow(this.rng(), 2); // Square to heavily favor smaller sizes
                const radiusAu = minRadiusAu + (maxRadiusAu - minRadiusAu) * randomFactor;
                return radiusAu * 149597870.7 / 695700.0; // Convert AU to solar radii
            } else if (sType === 'GF') {
                // Galactic Filament: 500 million ly to 20 billion ly
                const minRadiusLy = 500000000; // 500 million light years
                const maxRadiusLy = 20000000000; // 20 billion light years
                const lightYearAu = 63241.1; // AU per light year
                const minRadiusAu = minRadiusLy * lightYearAu;
                const maxRadiusAu = maxRadiusLy * lightYearAu;
                
                // Use power distribution to favor smaller filaments
                const randomFactor = Math.pow(this.rng(), 2); // Square to heavily favor smaller sizes
                const radiusAu = minRadiusAu + (maxRadiusAu - minRadiusAu) * randomFactor;
                return radiusAu * 149597870.7 / 695700.0; // Convert AU to solar radii
            } else if (sType === 'SV') {
                // Supervoid: 500 million ly to 20 billion ly
                const minRadiusLy = 500000000; // 500 million light years
                const maxRadiusLy = 20000000000; // 20 billion light years
                const lightYearAu = 63241.1; // AU per light year
                const minRadiusAu = minRadiusLy * lightYearAu;
                const maxRadiusAu = maxRadiusLy * lightYearAu;
                
                // Use power distribution to favor smaller voids
                const randomFactor = Math.pow(this.rng(), 2); // Square to heavily favor smaller sizes
                const radiusAu = minRadiusAu + (maxRadiusAu - minRadiusAu) * randomFactor;
                return radiusAu * 149597870.7 / 695700.0; // Convert AU to solar radii
            } else if (sType === 'P' || sType === 'N' || sType === 'MGTR') {
                let baseKm = this.randomUniform(10, 16);
                if (sType === 'MGTR') baseKm *= 1.1;
                return baseKm / 695700.0;
            } else if (sType === 'QK') {
                const baseKm = this.randomUniform(1, 3);
                return baseKm / 695700.0;
            } else if (sType === 'BD') {
                // Brown Dwarf: 0.9 to 1.1 Jupiter radii (converted to solar radii)
                const jupiterRadius = this.randomUniform(0.9, 1.1);
                const jupiterRadiusKm = jupiterRadius * 71492; // Jupiter radius in km
                return jupiterRadiusKm / 695700.0; // Convert to solar radii
            } else if (sType === 'HS') {
                // Hyper Star: 1cm to 1m radius
                const minRadiusCm = 1; // 1 cm
                const maxRadiusCm = 100; // 1 m = 100 cm
                const radiusCm = this.randomUniform(minRadiusCm, maxRadiusCm);
                const radiusKm = radiusCm / 100000; // Convert cm to km
                return radiusKm / 695700.0; // Convert to solar radii
            } else if (sType === 'IGVPO') {
                // Infinite Galactic Voided Plasma Orb: Infinite radius
                return Infinity;
            }

            const jitter = () => this.randomUniform(0.95, 1.05);
            if (sType === 'M') return Math.max(0.1, Math.pow(mass, 0.8)) * jitter();
            if (sType === 'G') return Math.pow(mass, 0.8) * this.randomUniform(0.95, 1.15);
            return Math.pow(mass, 0.8) * jitter();
        }

        _calculateLuminosity(temp, radius, sType) {
            const solarTemp = 5778;
            if (sType === 'QS') {
                return this.randomUniform(800, 1000000000000);
            } else if (sType === 'QK') {
                return this.randomUniform(0.05, 1.0);
            } else if (sType === 'BH') {
                const isAGN = this.rng() < 0.1;
                return isAGN ? this.randomUniform(1e6, 1e12) : this.randomUniform(1e-10, 1e-6);
            } else if (sType === 'WH') {
                return this.randomUniform(1e11, 1e12); // 100 billion to 1 trillion solar L
            } else if (sType === 'WORM') {
                return 0; // 0 luminosity
            } else if (sType === 'SC') {
                return 0; // 0 luminosity
            } else if (sType === 'NEB') {
                return 0; // 0 luminosity
            } else if (sType === 'GAL') {
                return 0; // 0 luminosity
            } else if (sType === 'GF') {
                return 0; // 0 luminosity
            } else if (sType === 'SV') {
                return 0; // 0 luminosity
            } else if (sType === 'BD') {
                // Brown Dwarf: 10^-4 to 10^-6 solar luminosities
                const minLum = 1e-6;
                const maxLum = 1e-4;
                return this.randomUniform(minLum, maxLum);
            } else if (sType === 'HS') {
                // Hyper Star: 1 quadrillion to 1 octillion solar luminosities
                const minLum = 1e15; // 1 quadrillion
                const maxLum = 1e27; // 1 octillion
                return this.randomUniform(minLum, maxLum);
            } else if (sType === 'IGVPO') {
                // Infinite Galactic Voided Plasma Orb: Infinite luminosity
                return Infinity;
            } else if (sType === 'P') {
                return this.randomUniform(1e-6, 1e-1);
            } else if (sType === 'MGTR') {
                return this.randomUniform(1e-2, 1e4);
            } else if (sType === 'N') {
                const kind = weightedChoice([['young', 0.2], ['old', 0.7], ['accreting', 0.1]], this.rng);
                if (kind === 'young') return this.randomUniform(0.1, 2.0);
                if (kind === 'old') return this.randomUniform(1e-4, 1e-2);
                return this.randomUniform(100, 1e4);
            } else if (sType === 'D') {
                return this.randomUniform(0.0001, 100);
            }
            // Stefan-Boltzmann approx
            const L = (radius * radius) * Math.pow(temp / solarTemp, 4);
            return Math.max(Math.min(L, 9.95e6), 0.00001);
        }

        generate({ specifiedType = null, specifiedColor = null, specifiedSize = null, giantType = 'main' } = {}) {
            const entries = Object.entries(this.spectralWeights);
            const types = entries.map(([t, w]) => [t, w]);
            const spectralType = (specifiedType && this.spectralWeights.hasOwnProperty(specifiedType))
                ? specifiedType
                : weightedChoice(types, this.rng);

            const sizeClass = (specifiedSize && 'OBAFGKM'.includes(specifiedSize)) ? specifiedSize : spectralType;

            const radiusMultiplier = ({
                'main': 1.0,
                'giant': 10.0,
                'super': 100.0,
                'hyper': 1000.0
            })[giantType] ?? 1.0;

            const mass = this._calculateMass(sizeClass);
            const baseRadius = this._calculateRadius(mass, sizeClass);
            const radius = baseRadius * radiusMultiplier;

            const tempRanges = {
                'O': [30000, 50000],
                'B': [10000, 30000],
                'A': [8750, 15000],
                'F': [6000, 7500],
                'G': [5200, 6000],
                'K': [3700, 5200],
                'M': [2400, 3700],
                'MGTR': [100000, 500000],
                'D': [4000, 150000],
                'N': [100000, 1000000],
                'P': [100000, 1000000],
                'QS': [4000, 10000],
                'QK': [100000, 1000000],
                'BH': [1e-8, 1e-6],
                'WH': [1e11, 1e12],  // 100 billion to 1 trillion Kelvin
                'WORM': [0, 0],      // 0 Kelvin
                'SC': [0, 0],        // 0 Kelvin
                'NEB': [0, 0],       // 0 Kelvin
                'GAL': [0, 0],       // 0 Kelvin
                'GF': [0, 0],        // 0 Kelvin
                'SV': [0, 0],        // 0 Kelvin
                'BD': [250, 2800],   // 250 K to 2,800 K
                'HS': [1e15, 1e27],  // 1 quadrillion to 1 octillion Kelvin
                'IGVPO': [Infinity, Infinity]  // Infinite temperature
            };
            const [tMin, tMax] = tempRanges[sizeClass] || tempRanges['G'];
            const temperature = this.randomUniform(tMin, tMax);

            const customColor = (specifiedColor && specifiedColor !== 'default') ? specifiedColor : null;

            return {
                type: spectralType,
                temperature,
                mass,
                radius,
                luminosity: this._calculateLuminosity(temperature, radius, spectralType),
                customColor,
                sizeClass,
                giantType
            };
        }
    }

    // -----------------------------
    // Planet Generator
    // -----------------------------
    class PlanetGenerator {
        constructor(rng) {
            this.rng = rng || Math.random;
        }

        weightedPick(pairs) { return weightedChoice(pairs, this.rng); }

        determineType(distance, starType) {
            if (starType === 'D' || starType === 'N') {
                if (distance < 0.1) return 'Remnant';
                if (distance < 0.5) return this.weightedPick([[ 'Rocky', 80 ], [ 'Remnant', 20 ]]);
                return this.weightedPick([[ 'Rocky', 60 ], [ 'Ice Giant', 40 ]]);
            }
            if (distance < 0.3) return this.weightedPick([[ 'Rocky', 60 ], [ 'Super-Earth', 35 ], [ 'Desert', 5 ]]);
            if (distance < 0.7) return this.weightedPick([[ 'Rocky', 25 ], [ 'Super-Earth', 45 ], [ 'Desert', 20 ], [ 'Terrestrial', 10 ]]);
            if (distance < 1.5) return this.weightedPick([[ 'Terrestrial', 35 ], [ 'Super-Earth', 35 ], [ 'Ocean', 20 ], [ 'Gas Giant', 10 ]]);
            if (distance < 5.0) return this.weightedPick([[ 'Gas Giant', 70 ], [ 'Ice Giant', 30 ]]);
            return this.weightedPick([[ 'Ice Giant', 70 ], [ 'Gas Giant', 30 ]]);
        }

        // Check for Hyper Planet mutation (1% chance)
        checkHyperPlanetMutation() {
            return this.rng() < 0.01; // 1% chance
        }

        // Check for Egg Shaped Planet mutation (13% chance)
        checkEggShapedPlanetMutation() {
            return this.rng() < 0.13; // 13% chance
        }

        checkHabitableZone(star, distance) {
            const base = star.temperature || 5778;
            const ratio = base / 5778.0;
            const inner = 0.95 * (ratio * ratio);
            const outer = 1.4 * (ratio * ratio);
            return distance >= inner && distance <= outer;
        }

        calcMass(type) {
            const ranges = {
                'Rocky': [0.1, 0.5],
                'Super-Earth': [2, 10],
                'Gas Giant': [50, 1000],
                'Ice Giant': [10, 50],
                'Desert': [0.3, 2],
                'Ocean': [0.8, 3],
                'Terrestrial': [0.5, 2],
                'Remnant': [0.01, 0.3],
                'Hyper Planet': [0.5, 10], // 0.5 to 10 Jupiter masses
                'Egg Shaped Planet': [0.1, 5], // 0.1 to 5 Earth masses
                'Destroyed Planet': [0.01, 0.5] // 0.01 to 0.5 Earth masses
            };
            const [minV, maxV] = ranges[type] || [0.1, 0.5];
            return minV + (maxV - minV) * this.rng();
        }

        calcRadius(type) {
            const ranges = {
                'Rocky': [0.3, 0.8],
                'Super-Earth': [1.2, 2.0],
                'Gas Giant': [3.0, 11.0],
                'Ice Giant': [2.5, 4.0],
                'Desert': [0.7, 1.3],
                'Ocean': [0.8, 1.5],
                'Terrestrial': [0.8, 1.2],
                'Remnant': [0.1, 0.4],
                'Hyper Planet': [0.5, 10], // 0.5 to 10 Jupiter radii
                'Egg Shaped Planet': [0.5, 1.5], // 0.5 to 1.5 Earth radii
                'Destroyed Planet': [0.2, 0.8] // 0.2 to 0.8 Earth radii
            };
            const [minV, maxV] = ranges[type] || [0.3, 0.8];
            return minV + (maxV - minV) * this.rng();
        }

        // Calculate Hyper Planet luminosity (0.3 to 8 Solar L)
        calcHyperPlanetLuminosity() {
            return 0.3 + (8 - 0.3) * this.rng();
        }

        // Calculate Hyper Planet temperature (3000 to 4500 K)
        calcHyperPlanetTemperature() {
            return 3000 + (4500 - 3000) * this.rng();
        }

        generate(star, distance) {
            const giantType = star.giantType || 'main';
            const sizeMult = ({ 'main': 1.0, 'giant': 1.5, 'super': 2.0, 'hyper': 3.0 })[giantType] || 1.0;
            let type = this.determineType(distance, star.type);
            
            // Check for Hyper Planet mutation (1% chance)
            let isHyperPlanet = false;
            if (this.checkHyperPlanetMutation()) {
                type = 'Hyper Planet';
                isHyperPlanet = true;
            }
            
            // Check for Egg Shaped Planet mutation (13% chance) - only if not already a Hyper Planet
            let isEggShapedPlanet = false;
            if (!isHyperPlanet && this.checkEggShapedPlanetMutation()) {
                type = 'Egg Shaped Planet';
                isEggShapedPlanet = true;
            }
            
            const baseMass = this.calcMass(type);
            const baseRadius = this.calcRadius(type);
            const mass = baseMass * sizeMult;
            const radius = baseRadius * sizeMult;
            const habitable = this.checkHabitableZone(star, distance);
            
            // Add planet specific properties
            const result = { type, mass, radius, distance, habitable };
            if (isHyperPlanet) {
                result.luminosity = this.calcHyperPlanetLuminosity();
                result.temperature = this.calcHyperPlanetTemperature();
                result.isHyperPlanet = true;
            } else if (isEggShapedPlanet) {
                result.isEggShapedPlanet = true;
                result.explosionTimer = 5000; // 5 seconds in milliseconds for testing
            }
            
            return result;
        }
    }

    // -----------------------------
    // Full generateSystem implementation
    // -----------------------------
    async function generateSystem(params = {}) {
        // Use non-seeded randomness to match backend behavior
        const rng = Math.random;

        const names = await loadCelestialNames();
        // Use default randomness for name generation
        const nameRng = Math.random;
        const nameGen = new MarkovNameGenerator(2, nameRng);
        nameGen.train(names);

        const starGen = new StarGenerator(rng);
        const planetGen = new PlanetGenerator(rng);

        const specifiedType = params.starType && params.starType !== '' ? params.starType : null;
        const star = starGen.generate({
            specifiedType: specifiedType,
            specifiedColor: params.starColor,
            specifiedSize: params.starSize || null,
            giantType: params.giantType || 'main'
        });
        const starName = nameGen.generate({ starType: star.type });

        // Planet rules by star type
        let canHavePlanets = true;
        let maxPlanets = 8;
        const roll = () => rng();
        if (star.type === 'P') { canHavePlanets = roll() < 0.2; maxPlanets = 3; }
        else if (star.type === 'MGTR') { canHavePlanets = roll() < 0.05; maxPlanets = 2; }
        else if (star.type === 'QK') { canHavePlanets = roll() < 0.01; maxPlanets = 1; }
        else if (star.type === 'BH') { canHavePlanets = roll() < 0.01; maxPlanets = 1; }
        else if (star.type === 'WH') { canHavePlanets = false; maxPlanets = 0; } // White holes never have planets
        else if (star.type === 'WORM') { canHavePlanets = false; maxPlanets = 0; } // Wormholes never have planets
        else if (star.type === 'SC') { canHavePlanets = false; maxPlanets = 0; } // Star clusters never have planets
        else if (star.type === 'NEB') { canHavePlanets = false; maxPlanets = 0; } // Nebulae never have planets
        else if (star.type === 'GAL') { canHavePlanets = false; maxPlanets = 0; } // Galaxies never have planets
        else if (star.type === 'GF') { canHavePlanets = false; maxPlanets = 0; } // Galactic Filaments never have planets
        else if (star.type === 'SV') { canHavePlanets = false; maxPlanets = 0; } // Supervoids never have planets
        else if (star.type === 'BD') { canHavePlanets = roll() < 0.3; maxPlanets = 4; } // Brown Dwarfs rarely have planets
        else if (star.type === 'HS') { canHavePlanets = roll() < 0.05; maxPlanets = 2; } // Hyper Stars rarely have planets (5% chance, max 2)
        else if (star.type === 'IGVPO') { canHavePlanets = false; maxPlanets = 0; } // Infinite Galactic Voided Plasma Orbs never have planets

        const planets = [];
        if (canHavePlanets) {
            const num = Math.floor(rng() * (maxPlanets + 1)); // 0..max
            if (num > 0) {
                const minDist = (star.type === 'P' || star.type === 'MGTR' || star.type === 'QK') ? 0.5 : 0.1;
                const distances = Array.from({ length: num }, () => minDist + Math.pow(rng(), 3) * 29.9).sort((a, b) => a - b);
                let hasHyperPlanet = false;
                
                for (let i = 0; i < num; i++) {
                    const planet = planetGen.generate(star, distances[i]);
                    const randomName = nameGen.generate({ minLength: 4, maxLength: 8 });
                    const letter = String.fromCharCode(98 + i); // b, c, ...
                    planet.name = `${starName} ${letter} (${randomName})`;
                    
                    // Check if this is a Hyper Planet
                    if (planet.isHyperPlanet) {
                        hasHyperPlanet = true;
                    }
                    
                    planets.push(planet);
                }
                
                // If a Hyper Planet exists, mark all habitable planets as destroyed
                if (hasHyperPlanet) {
                    planets.forEach(planet => {
                        if (planet.habitable) {
                            planet.habitable = false;
                            planet.destroyedByHyperPlanet = true;
                        }
                    });
                }
            }
        }

        // Format response exactly like the Flask route
        const starMass = star.mass;
        let massDisplay = '';
        if (star.type === 'QS') {
            const milkyWayMass = 1.5e12;
            const ratio = starMass / milkyWayMass;
            massDisplay = `${starMass.toExponential(1)} M☉\n${ratio.toExponential(2)} M🌌`;
        } else if (star.type === 'GF') {
            const milkyWayMass = 1.5e12;
            const ratio = starMass / milkyWayMass;
            massDisplay = `${starMass.toExponential(1)} M☉\n${ratio.toExponential(2)} M🌌`;
        } else if (star.type === 'SV') {
            massDisplay = `0 M☉`; // Supervoids have no mass
        } else if (star.type === 'BH') {
            if (starMass >= 1e9) massDisplay = `${starMass.toExponential(1)} M☉`;
            else massDisplay = `${starMass.toFixed(3)} M☉`;
        } else if (star.type === 'BD') {
            // Brown Dwarf: Show both solar masses and Jupiter masses
            const jupiterMass = starMass / 0.00095; // Convert solar masses to Jupiter masses
            massDisplay = `${starMass.toFixed(4)} M☉\n${jupiterMass.toFixed(1)} M♃`;
        } else if (star.type === 'HS') {
            // Hyper Star: Show in scientific notation
            massDisplay = `${starMass.toExponential(1)} M☉`;
        } else if (star.type === 'IGVPO') {
            // Infinite Galactic Voided Plasma Orb: Show infinite mass
            massDisplay = `∞ M☉`;
        } else {
            massDisplay = `${starMass.toFixed(3)} M☉`;
        }

        const formattedPlanets = planets.map(p => {
            const earthMass = p.mass;
            const jupiterMass = earthMass / 317.8;
            const earthRadius = p.radius;
            const jupiterRadius = earthRadius / 11.2;
            
            const result = {
                name: p.name,
                type: p.type,
                mass: `${earthMass.toFixed(1)} M⊕\n${jupiterMass.toFixed(3)} M♃`,
                radius: `${earthRadius.toFixed(1)} R⊕\n${jupiterRadius.toFixed(3)} R♃`,
                distance: `${p.distance.toFixed(2)} AU`,
                habitable: p.habitable,
                destroyedByHyperPlanet: p.destroyedByHyperPlanet || false
            };
            
            // Add Hyper Planet specific properties
            if (p.isHyperPlanet) {
                result.luminosity = `${p.luminosity.toFixed(3)} L☉`;
                result.temperature = `${p.temperature.toFixed(0)} K`;
                result.isHyperPlanet = true;
            }
            
            // Add Egg Shaped Planet specific properties
            if (p.isEggShapedPlanet) {
                result.isEggShapedPlanet = true;
                result.explosionTimer = p.explosionTimer;
            }
            
            return result;
        });

        return {
            star: {
                name: starName,
                type: star.type,
                temperature: star.type === 'IGVPO' ? '∞ K' : star.temperature,
                mass: massDisplay,
                radius: star.type === 'IGVPO' ? '∞ R☉' : star.radius,
                luminosity: star.type === 'IGVPO' ? '∞ L☉' : star.luminosity,
                customColor: (params.starColor && params.starColor !== 'default') ? params.starColor : null
            },
            giantType: star.giantType,
            planets: formattedPlanets
        };
    }

    // Expose public API
    window.SystemGen = {
        createRng,
        pickSeed,
        weightedChoice,
        loadCelestialNames,
        MarkovNameGenerator,
        StarGenerator,
        PlanetGenerator,
        generateSystem
    };
})();


