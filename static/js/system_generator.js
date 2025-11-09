// Asset versioned via Flask static_file helper (?v=mtime). Change triggers cache bust.
document.addEventListener('DOMContentLoaded', function() {
    // Helper function to format luminosity values
    function formatLuminosity(value) {
        if (value === Infinity || value === '∞ L☉') return '∞';
        const num = Number(value);
        if (isNaN(num)) return value;
        
        // Use exponential notation for very large (>= 1e6) or very small (<= 1e-3) values
        if (Math.abs(num) >= 1e6 || (Math.abs(num) <= 1e-3 && num !== 0)) {
            return num.toExponential(2);
        }
        
        // Use regular formatting for normal range values
        return num.toLocaleString(undefined, {maximumFractionDigits: 5});
    }
    
    // Rarity tracking system
    const RARITY_WEIGHTS = {
        'O': 1,          // 0.001%
        'B': 13,         // 0.13%
        'A': 60,         // 0.6%
        'F': 300,        // 3%
        'G': 700,        // 7%
        'K': 1200,       // 12%
        'M': 7600,       // 76%
        'D': 120,        // 1.2%
        'N': 30,          // 0.03%
        'P': 20,          // 0.02%
        'MGTR': 10,      // 0.01%
        'QS': 0.1,       // 0.001% - Extremely rare Quasi Stars
        'QK': 0.0001,    // 0.00001% - 1 in a million Quark Stars
        'BH': 0.05,      // 0.0005% - Extremely rare Black Holes
        'WH': 0.0001,    // 0.00001% - 1 in a million White Holes
        'WORM': 0.0001,  // 0.00001% - 1 in a million Wormholes
        'SC': 0.00002,   // 0.000002% - 1 in 5 million Star Clusters
        'NEB': 0.00002,  // 0.000002% - 1 in 5 million Nebulae
        'GAL': 0.000004, // 0.0000004% - 1 in 25 million Galaxies
        'GF': 0.000000001, // 0.000000001% - 1 in 1 billion Galactic Filaments
        'SV': 0.000000001, // 0.000000001% - 1 in 1 billion Supervoids
        'BD': 900, // 9% - Brown Dwarfs
        'HP': 0.1, // 0.001% - Hyper Planet (1% of planets, but planets are rare)
        'HS': 0.0001, // 0.00001% - 1 in a million Hyper Stars
        'IGVPO': 0.0000001 // 0.0000001% - 1 in 10 million Infinite Galactic Voided Plasma Orbs
    };

    // Rarity levels for display
    const RARITY_LEVELS = {
        'GF': { name: 'Godly', color: 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FF4500, #DC143C, #8B0000, #4B0082, #000080)', emoji: '⚡' },
        'SV': { name: 'Godly', color: 'linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FF4500, #DC143C, #8B0000, #4B0082, #000080)', emoji: '⚡' },
        'GAL': { name: 'Secret', color: 'linear-gradient(45deg, #FF1493, #8B008B, #4B0082, #000080)', emoji: '🌌' },
        'NEB': { name: 'Secret', color: 'linear-gradient(45deg, #FF1493, #8B008B, #4B0082, #000080)', emoji: '🌌' },
        'SC': { name: 'Secret', color: 'linear-gradient(45deg, #FF1493, #8B008B, #4B0082, #000080)', emoji: '✨' },
        'QK': { name: 'Mythical', color: 'linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', emoji: '🌈' },
        'WH': { name: 'Mythical', color: 'linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', emoji: '⚪' },
        'WORM': { name: 'Mythical', color: 'linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', emoji: '🌀' },
        'HS': { name: 'Mythical', color: 'linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)', emoji: '🌟' },
        'IGVPO': { name: 'Secret', color: 'linear-gradient(45deg, #FF1493, #8B008B, #4B0082, #000080)', emoji: '🌀' },
        'QS': { name: 'Legendary', color: 'linear-gradient(45deg, #FFD700, #FFA500)', emoji: '🌟' },
        'BH': { name: 'Legendary', color: 'linear-gradient(45deg, #FFD700, #FFA500)', emoji: '🕳️' },
        'O': { name: 'Legendary', color: 'linear-gradient(45deg, #FFD700, #FFA500)', emoji: '⚡' },
        'MGTR': { name: 'Epic', color: 'linear-gradient(45deg, #FF00FF, #8B008B)', emoji: '⚡' },
        'P': { name: 'Epic', color: 'linear-gradient(45deg, #FF00FF, #8B008B)', emoji: '💫' },
        'N': { name: 'Epic', color: 'linear-gradient(45deg, #FF00FF, #8B008B)', emoji: '💫' },
        'HP': { name: 'Epic', color: 'linear-gradient(45deg, #FF00FF, #8B008B)', emoji: '🪐' },
        'A': { name: 'Rare', color: 'linear-gradient(45deg, #87CEEB, #000080)', emoji: '⭐' },
        'B': { name: 'Epic', color: 'linear-gradient(45deg, #FF00FF, #8B008B)', emoji: '💫' },
        'D': { name: 'Uncommon', color: 'linear-gradient(45deg, #32CD32, #006400)', emoji: '⭐' },
        'F': { name: 'Uncommon', color: 'linear-gradient(45deg, #32CD32, #006400)', emoji: '⭐' },
        'K': { name: 'Common', color: '#808080', emoji: '⭐' },
        'G': { name: 'Common', color: '#808080', emoji: '⭐' },
        'BD': { name: 'Common', color: '#808080', emoji: '⭐' },
        'M': { name: 'Very Common', color: '#000000', emoji: '🔸' }
    };

    // Initialize rarity tracking
    function initializeRarityTracking() {
        if (!localStorage.getItem('spaceExplorerRarity')) {
            localStorage.setItem('spaceExplorerRarity', JSON.stringify({
                rarestObject: null,
                totalGenerated: 0,
                discoveries: [],
                savedSystems: [] // Array to store legendary+ systems (Legendary, Mythical, Secret, Godly)
            }));
        }
    }

    // =============================================
    // PLANET GRID HELPER FUNCTIONS
    // =============================================
    
    // Generate planet HTML with empty placeholder for odd numbers
    function generatePlanetGrid(planets) {
        if (!planets || planets.length === 0) return '';
        
        const planetHTML = planets.map(planet => {
            const [earthMass, jupiterMass] = planet.mass.split('\n');
            const [earthRadius, jupiterRadius] = planet.radius.split('\n');

            return `
                <div class="planet-orbit">
                    <div class="planet-visual ${planet.type.toLowerCase().replace(/\s+/g, '-')}${planet.isEggShapedPlanet ? ' egg-shaped-planet' : ''}" 
                         ${planet.isEggShapedPlanet ? 'data-egg-planet="true" data-explosion-timer="' + planet.explosionTimer + '"' : ''}></div>
                    <div class="celestial-info">
                        <h4>${planet.name.split('(')[1].split(')')[0]} (${planet.name.split('(')[0].trim()} ${planet.name.split(')')[1].trim()})</h4>
                        <p>Type: ${planet.type} ${planet.isHyperPlanet ? '<span class="rarity-indicator" style="background: linear-gradient(45deg, #FF00FF, #8B008B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"><span class="rarity-emoji">🪐</span> Epic</span>' : ''} ${planet.isEggShapedPlanet ? '<span class="rarity-indicator" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"><span class="rarity-emoji">🥚</span> Unstable</span>' : ''}</p>
                        <p><span class="label">Earth Mass:</span> <span class="measurement">${earthMass}</span></p>
                        <p><span class="label">Jupiter Mass:</span> <span class="measurement">${jupiterMass}</span></p>
                        <p><span class="label">Earth Radius:</span> <span class="measurement">${earthRadius}</span></p>
                        <p><span class="label">Jupiter Radius:</span> <span class="measurement">${jupiterRadius}</span></p>
                        <p><span class="label">Distance:</span> <span class="measurement">${planet.distance}</span></p>
                        ${planet.isHyperPlanet ? `
                            <p><span class="label">Temperature:</span> <span class="measurement">${planet.temperature}</span></p>
                            <p><span class="label">Luminosity:</span> <span class="measurement">${planet.luminosity}</span></p>
                        ` : ''}
                        ${planet.isEggShapedPlanet ? `
                            <p class="egg-warning-tag">⚠️ Unstable - Will explode in 5 seconds!</p>
                        ` : ''}
                        ${planet.habitable ? '<p class="habitable-tag">✨ Potentially Habitable!</p>' : ''}
                        ${planet.destroyedByHyperPlanet ? '<p class="destroyed-habitable-tag">💀 Life Destroyed by Hyper Planet</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // If odd number of planets, add empty placeholder
        if (planets.length % 2 !== 0) {
            return planetHTML + `
                <div class="planet-orbit planet-placeholder">
                    <div class="planet-visual"></div>
                    <div class="celestial-info">
                        <h4>Empty Space</h4>
                        <p>Type: No planet in this orbit</p>
                        <p><span class="label">Mass:</span> <span class="measurement">N/A</span></p>
                        <p><span class="label">Radius:</span> <span class="measurement">N/A</span></p>
                        <p><span class="label">Distance:</span> <span class="measurement">N/A</span></p>
                    </div>
                </div>
            `;
        }
        
        return planetHTML;
    }
    

    // Physical constants for calculations
    const STEFAN_BOLTZMANN = 5.67e-8; // W/m^2/K^4
    const GRAVITATIONAL_CONSTANT = 6.674e-11; // m^3/kg/s^2
    const SPEED_OF_LIGHT = 2.998e8; // m/s
    const SOLAR_MASS_KG = 1.989e30; // kg
    

    // Stats tracking system for server synchronization
    let statsBatch = {
        systems_generated: 0,
        habitable_worlds: 0,
        legendary_systems: 0,
        rarest_discovery: null,
        pending_updates: false
    };
    
    let statsUpdateTimeout = null;
    const STATS_UPDATE_DELAY = 2000; // 2 seconds debounce
    const MAX_BATCH_SIZE = 50; // Maximum systems to batch before forcing update
    
    // Initialize stats tracking
    function initializeStatsTracking() {
        // Check if user is logged in
        const isLoggedIn = document.body.classList.contains('logged-in') || 
                          document.querySelector('[data-user-id]') !== null;
        
        if (!isLoggedIn) {
            console.log('User not logged in - stats tracking disabled');
            return;
        }
        
        // Reset stats to start fresh each session
        statsBatch = {
            systems_generated: 0,
            habitable_worlds: 0,
            legendary_systems: 0,
            rarest_discovery: null,
            pending_updates: false
        };
        
        // Update display to show reset stats
        updateLocalStatsDisplay();
        
        // Show stats controls for logged-in users
        const statsControls = document.getElementById('stats-controls');
        if (statsControls) {
            statsControls.style.display = 'block';
            console.log('Stats controls shown for logged-in user');
        } else {
            console.log('Stats controls element not found');
        }
        
        // Load existing stats from server
        loadUserStats();
    }
    
    // Load user stats from server
    async function loadUserStats() {
        try {
            const response = await fetch('/api/space-stats');
            if (response.ok) {
                const data = await response.json();
                console.log('Loaded user stats:', data.stats);
                updateStatsDisplay(data.stats);
            }
        } catch (error) {
            console.log('Could not load user stats:', error);
        }
    }
    
    // Update stats display in UI
    function updateStatsDisplay(stats) {
        // HYPER STAR STATS UPDATE (COMMENTED OUT - Using Hyper Planets instead)
        // Update hyper stars display from server data
        // const hyperStarsElement = document.getElementById('hyper-stars-total');
        // if (hyperStarsElement && stats.hyper_stars_found !== undefined) {
        //     hyperStarsElement.textContent = stats.hyper_stars_found;
        // }
        // 
        // console.log('Updated hyper stars from server:', stats.hyper_stars_found);
        
        // Update hyper planets display from server data
        const hyperPlanetsElement = document.getElementById('hyper-planets-total');
        if (hyperPlanetsElement && stats.hyper_planets_found !== undefined) {
            hyperPlanetsElement.textContent = stats.hyper_planets_found;
        }
        
        console.log('Updated hyper planets from server:', stats.hyper_planets_found);
    }
    
    // Update local stats display (for immediate feedback)
    function updateLocalStatsDisplay() {
        const systemsElement = document.getElementById('systems-count');
        const habitableElement = document.getElementById('habitable-count');
        const legendaryElement = document.getElementById('legendary-count');
        
        if (systemsElement) {
            systemsElement.textContent = statsBatch.systems_generated;
            animateStatUpdate(systemsElement);
        }
        if (habitableElement) {
            habitableElement.textContent = statsBatch.habitable_worlds;
            animateStatUpdate(habitableElement);
        }
        if (legendaryElement) {
            legendaryElement.textContent = statsBatch.legendary_systems;
            animateStatUpdate(legendaryElement);
        }
        
        console.log('Updated local stats:', {
            systems: statsBatch.systems_generated,
            habitable: statsBatch.habitable_worlds,
            legendary: statsBatch.legendary_systems
        });
    }
    
    // Animate stat updates with pulse effect
    function animateStatUpdate(element) {
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, 600);
    }
    
    // Track a system generation for stats
    function trackSystemGeneration(systemData, isRandomGeneration = true) {
        // Only track for logged-in users
        const isLoggedIn = document.body.classList.contains('logged-in') || 
                          document.querySelector('[data-user-id]') !== null;
        
        if (!isLoggedIn) {
            console.log('Not logged in - skipping stats tracking');
            return;
        }
        
        console.log('Tracking system generation:', systemData.star.name, 'Random:', isRandomGeneration);
        
        // Update local batch
        statsBatch.systems_generated += 1;
        
        // Count habitable worlds
        const habitableCount = systemData.planets ? 
            systemData.planets.filter(planet => planet.habitable).length : 0;
        statsBatch.habitable_worlds += habitableCount;
        
        // Update local display immediately
        updateLocalStatsDisplay();
        
        // Check for legendary+ systems
        if (isRandomGeneration) {
            const starType = systemData.star.type;
            const rarityLevel = RARITY_LEVELS[starType] || RARITY_LEVELS['M'];
            
            if (['Legendary', 'Mythical', 'Secret', 'Godly'].includes(rarityLevel.name)) {
                statsBatch.legendary_systems += 1;
                
                // Immediately save legendary+ discoveries
                saveLegendaryDiscovery(systemData, rarityLevel);
            }
            
            // Check if this is a new rarest discovery
            const rarityScore = calculateRarityScore(starType, systemData.giantType);
            if (!statsBatch.rarest_discovery || rarityScore < statsBatch.rarest_discovery.rarity_score) {
                statsBatch.rarest_discovery = {
                    name: systemData.star.name,
                    type: starType,
                    rarity_class: rarityLevel.name,
                    rarity_score: rarityScore
                };
            }
        }
        
        // Schedule batch update
        scheduleStatsUpdate();
    }
    
    // Save legendary discovery immediately
    async function saveLegendaryDiscovery(systemData, rarityLevel) {
        try {
            const discoveryData = {
                systems_generated: 1,
                legendary_systems: 1,
                rarest_discovery: {
                    name: systemData.star.name,
                    type: systemData.star.type,
                    rarity_class: rarityLevel.name,
                    rarity_score: calculateRarityScore(systemData.star.type, systemData.giantType)
                }
            };
            
            const response = await fetch('/api/update-space-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(discoveryData)
            });
            
            if (response.ok) {
                console.log('Legendary discovery saved immediately');
            }
        } catch (error) {
            console.error('Failed to save legendary discovery:', error);
        }
    }
    
    // Schedule stats update with debouncing
    function scheduleStatsUpdate() {
        // Clear existing timeout
        if (statsUpdateTimeout) {
            clearTimeout(statsUpdateTimeout);
        }
        
        // Set new timeout
        statsUpdateTimeout = setTimeout(() => {
            sendStatsUpdate();
        }, STATS_UPDATE_DELAY);
        
        // Force update if batch is getting too large
        if (statsBatch.systems_generated >= MAX_BATCH_SIZE) {
            clearTimeout(statsUpdateTimeout);
            sendStatsUpdate();
        }
    }
    
    // Send stats update to server
    async function sendStatsUpdate() {
        if (statsBatch.pending_updates || statsBatch.systems_generated === 0) {
            return;
        }
        
        statsBatch.pending_updates = true;
        
        try {
            const response = await fetch('/api/update-space-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(statsBatch)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Stats updated successfully:', data.message);
                
                // Reset batch
                statsBatch = {
                    systems_generated: 0,
                    habitable_worlds: 0,
                    legendary_systems: 0,
                    rarest_discovery: null,
                    pending_updates: false
                };
                
                // Update display to show reset stats
                updateLocalStatsDisplay();
                
                // Update rarity display to reflect new totals
                displayRarityInfo();
            } else {
                console.error('Failed to update stats:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        } finally {
            statsBatch.pending_updates = false;
        }
    }
    
    // Manual stats save function (for "Save Stats" button)
    async function saveStatsManually() {
        if (statsBatch.systems_generated > 0) {
            // Clear any pending timeout
            if (statsUpdateTimeout) {
                clearTimeout(statsUpdateTimeout);
            }
            
            await sendStatsUpdate();
            console.log('Stats saved manually');
        } else {
            console.log('No stats to save');
        }
    }

    // Calculate rarity score (lower weight = rarer)
    function calculateRarityScore(starType, giantType = 'main') {
        const baseWeight = RARITY_WEIGHTS[starType] || 1000;
        
        // Giant types make stars rarer
        const giantMultipliers = {
            'main': 1.0,
            'giant': 0.1,      // 10x rarer
            'super': 0.01,     // 100x rarer
            'hyper': 0.001     // 1000x rarer
        };
        
        const multiplier = giantMultipliers[giantType] || 1.0;
        return baseWeight * multiplier;
    }

    // Check if a system should be saved (legendary+ systems only)
    function shouldSaveSystem(starType, giantType = 'main') {
        const rarityLevel = RARITY_LEVELS[starType] || RARITY_LEVELS['M'];
        return rarityLevel.name === 'Legendary' || rarityLevel.name === 'Mythical' || rarityLevel.name === 'Secret' || rarityLevel.name === 'Godly';
    }

    // Check if new discovery is rarer than current rarest
    function checkRarity(starData, isRandomGeneration = true) {
        const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
        let newRarityScore = calculateRarityScore(starData.star.type, starData.giantType);
        let isNewRarest = false;
        let rarityLevel = RARITY_LEVELS[starData.star.type] || RARITY_LEVELS['M'];
        
        // Debug logging for rarity tracking
        console.log('Rarity Check Debug:', {
            currentStar: {
                name: starData.star.name,
                type: starData.star.type,
                rarityScore: newRarityScore,
                rarityLevel: rarityLevel.name
            },
            currentRarest: rarityData.rarestObject ? {
                name: rarityData.rarestObject.name,
                type: rarityData.rarestObject.type,
                rarityScore: rarityData.rarestObject.rarityScore,
                rarityLevel: rarityData.rarestObject.rarityLevel.name
            } : null,
            isNewRarest: !rarityData.rarestObject || newRarityScore < rarityData.rarestObject.rarityScore,
            isRandomGeneration: isRandomGeneration
        });
        
        // Additional debugging: log rarity weights for comparison
        console.log('Rarity Weights for debugging:', {
            'M-class': RARITY_WEIGHTS['M'],
            'G-class': RARITY_WEIGHTS['G'], 
            'F-class': RARITY_WEIGHTS['F'],
            'A-class': RARITY_WEIGHTS['A'],
            'B-class': RARITY_WEIGHTS['B'],
            'O-class': RARITY_WEIGHTS['O']
        });
        
        // Debug: Test the calculateRarityScore function directly
        const testScore = calculateRarityScore(starData.star.type, starData.giantType);
        console.log('Direct calculateRarityScore test:', {
            starType: starData.star.type,
            giantType: starData.giantType,
            calculatedScore: testScore,
            matchesNewRarityScore: testScore === newRarityScore
        });
        
        // Check if this is a new rarest discovery (only for random generations)
        if (isRandomGeneration && (!rarityData.rarestObject || newRarityScore < rarityData.rarestObject.rarityScore)) {
            isNewRarest = true;
            rarityData.rarestObject = {
                name: starData.star.name,
                type: starData.star.type,
                giantType: starData.giantType,
                rarityScore: newRarityScore,
                rarityLevel: rarityLevel,
                discoveredAt: new Date().toISOString(),
                temperature: starData.star.temperature,
                mass: starData.star.mass,
                radius: starData.star.radius,
                luminosity: starData.star.luminosity,
                customColor: starData.star.customColor,
                // Save complete system data for teleporting
                completeSystemData: {
                    star: {
                        name: starData.star.name,
                        type: starData.star.type,
                        temperature: starData.star.temperature,
                        mass: starData.star.mass,
                        radius: starData.star.radius,
                        luminosity: starData.star.luminosity,
                        customColor: starData.star.customColor
                    },
                    giantType: starData.giantType,
                    planets: starData.planets.map(planet => ({
                        name: planet.name,
                        type: planet.type,
                        mass: planet.mass,
                        radius: planet.radius,
                        distance: planet.distance,
                        habitable: planet.habitable,
                        isHyperPlanet: planet.isHyperPlanet,
                        luminosity: planet.luminosity,
                        temperature: planet.temperature
                    }))
                }
            };
        } else if (!isRandomGeneration && (!rarityData.rarestObject || newRarityScore < rarityData.rarestObject.rarityScore)) {
            console.log('Rarer system detected, but NOT updating rarest discovery (manually selected):', starData.star.name, starData.star.type, 'Score:', newRarityScore);
        }
        
        // Add to discoveries
        rarityData.discoveries.push({
            name: starData.star.name,
            type: starData.star.type,
            giantType: starData.giantType,
            rarityScore: newRarityScore,
            rarityLevel: rarityLevel,
            discoveredAt: new Date().toISOString()
        });
        
        rarityData.totalGenerated++;
        
        // HYPER STAR TRACKING (COMMENTED OUT - Using Hyper Planets instead for world boss)
        // Count Hyper Stars in this system
        // const hyperStarsInSystem = starData.star && starData.star.type === 'HS' ? 1 : 0;
        // console.log('Hyper Stars found in system:', hyperStarsInSystem);
        // 
        // if (hyperStarsInSystem > 0) {
        //     console.log('Hyper Star detected! Checking for first discovery...');
        //     rarityData.hyperStarsFound = (rarityData.hyperStarsFound || 0) + hyperStarsInSystem;
        //     
        //     // Check if this is the user's first Hyper Star discovery and show achievement modal
        //     console.log('checkFirstHyperStarDiscovery function exists:', typeof checkFirstHyperStarDiscovery === 'function');
        //     if (typeof checkFirstHyperStarDiscovery === 'function' && checkFirstHyperStarDiscovery()) {
        //         console.log('First Hyper Star discovery confirmed! Showing modal...');
        //         // Mark achievement as seen immediately to prevent multiple modals
        //         markHyperStarAchievementSeen();
        //         
        //         // Stop AFK mode if it's running so player can read the achievement modal
        //         if (typeof afkModeActive !== 'undefined' && afkModeActive) {
        //             console.log('Stopping AFK mode for Hyper Star modal...');
        //             stopAFKMode(false); // Don't clear session time, just pause for the modal
        //         }
        //         
        //         // Show the achievement modal after a short delay to let the system display first
        //         setTimeout(() => {
        //             console.log('Showing Hyper Star modal...');
        //             showHyperStarModal();
        //         }, 1500);
        //     } else {
        //         console.log('Not first Hyper Star discovery or function not available');
        //     }
        // }
        
        // Count Hyper Planets in this system (for world boss combat)
        const hyperPlanetsInSystem = starData.planets ? starData.planets.filter(planet => planet.type === 'Hyper Planet' || planet.isHyperPlanet).length : 0;
        console.log('Hyper Planets found in system:', hyperPlanetsInSystem);
        
        if (hyperPlanetsInSystem > 0) {
            console.log('Hyper Planet detected! Adding to world boss combat count...');
            rarityData.hyperPlanetsFound = (rarityData.hyperPlanetsFound || 0) + hyperPlanetsInSystem;
        }
        
        // Keep only last 100 discoveries to prevent localStorage bloat
        if (rarityData.discoveries.length > 100) {
            rarityData.discoveries = rarityData.discoveries.slice(-100);
        }

        // Auto-save legendary+ systems (Legendary, Mythical, Secret, Godly)
        // Only auto-save if this was a random generation (not manually selected)
        if (shouldSaveSystem(starData.star.type, starData.giantType)) {
            if (!isRandomGeneration) {
                console.log('Legendary+ system detected, but NOT auto-saving (manually selected):', starData.star.name, starData.star.type);
            } else {
                console.log('Legendary+ system detected, auto-saving:', starData.star.name, starData.star.type);
            }
        }
        
        if (isRandomGeneration && shouldSaveSystem(starData.star.type, starData.giantType)) {
            const systemToSave = {
                name: starData.star.name,
                type: starData.star.type,
                giantType: starData.giantType,
                rarityScore: newRarityScore,
                rarityLevel: rarityLevel,
                discoveredAt: new Date().toISOString(),
                temperature: starData.star.temperature,
                mass: starData.star.mass,
                radius: starData.star.radius,
                luminosity: starData.star.luminosity,
                customColor: starData.star.customColor,
                // Save complete system data for teleporting
                completeSystemData: {
                    star: {
                        name: starData.star.name,
                        type: starData.star.type,
                        temperature: starData.star.temperature,
                        mass: starData.star.mass,
                        radius: starData.star.radius,
                        luminosity: starData.star.luminosity,
                        customColor: starData.star.customColor
                    },
                    giantType: starData.giantType,
                    planets: starData.planets.map(planet => ({
                        name: planet.name,
                        type: planet.type,
                        mass: planet.mass,
                        radius: planet.radius,
                        distance: planet.distance,
                        habitable: planet.habitable,
                        isHyperPlanet: planet.isHyperPlanet,
                        luminosity: planet.luminosity,
                        temperature: planet.temperature
                    }))
                }
            };

            // Check if this system is already saved (avoid duplicates)
            const existingIndex = rarityData.savedSystems.findIndex(
                sys => sys.name === systemToSave.name && sys.type === systemToSave.type
            );

            if (existingIndex === -1) {
                rarityData.savedSystems.push(systemToSave);
                
                // Keep only the 100 most recent legendary+ systems
                if (rarityData.savedSystems.length > 100) {
                    rarityData.savedSystems = rarityData.savedSystems.slice(-100);
                }
            }
        }
        
        localStorage.setItem('spaceExplorerRarity', JSON.stringify(rarityData));
        
        return { isNewRarest, rarityLevel };
    }

    // Teleport to rarest system
    function teleportToRarestSystem() {
        const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
        if (!rarityData.rarestObject || !rarityData.rarestObject.completeSystemData) {
            alert('No rarest system data available to teleport to!');
            return;
        }

        const systemData = rarityData.rarestObject.completeSystemData;
        const rarityLevel = rarityData.rarestObject.rarityLevel;
        
        // Display the saved system
        const resultDiv = document.getElementById('result');
        let html = `
            <div class="system-name">
                <span class="star-emoji">🌟</span> The ${systemData.star.name} System
                <span class="teleport-badge">🚀 TELEPORTED TO RAREST DISCOVERY!</span>
                <span class="random-discovery-badge">🎲 Random Discovery</span>
            </div>
            <div class="system-summary">
                <div class="summary-card">
                    <h4>Star</h4>
                    <p>${systemData.star.name} (${systemData.star.type}-class)</p>
                </div>
                <div class="summary-card">
                    <h4>Planets</h4>
                    <p>${systemData.planets.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Habitable Worlds</h4>
                    <p>${systemData.planets.filter(p => p.habitable).length}</p>
                </div>
            </div>
            <div class="star-system-visual">
                <div class="star-header">
                    <span class="star-emoji">⭐</span>
                    <div class="star-classification">
                        ${systemData.giantType && systemData.giantType !== 'main'
                            ? `${systemData.giantType.charAt(0).toUpperCase() + systemData.giantType.slice(1)} Star`
                            : systemData.star.type === 'QS'
                                ? 'Quasi Star'
                                : systemData.star.type === 'QK'
                                    ? 'Quark Star'
                                    : systemData.star.type === 'WH'
                                        ? 'White Hole'
                                        : systemData.star.type === 'WORM'
                                            ? 'Wormhole'
                                            : systemData.star.type === 'SC'
                                                ? 'Star Cluster'
                                                : systemData.star.type === 'NEB'
                                                    ? 'Nebula'
                                                    : systemData.star.type === 'MGTR'
                                            ? 'Magnetar Star'
                                            : systemData.star.type === 'BD'
                                                ? 'Brown Dwarf'
                                                : ['P', 'N'].includes(systemData.star.type)
                                                    ? 'Degenerate Star'
                                                    : systemData.star.type === 'D'
                                                        ? 'White Dwarf Star'
                                                        : 'Main Sequence Star'}
                    </div>
                </div>
                <div class="celestial-object">
                    <div class="star type-${systemData.star.type.replace('MGTR', 'magnetar')}"
                        ${systemData.star.customColor ? `style="background-color: ${systemData.star.customColor};"` : ''}>
                    </div>
                    <div class="celestial-info">
                        <h4>${systemData.star.name}</h4>
                        <p>${systemData.star.type === 'QS' ? 'Quasi Star' : systemData.star.type === 'QK' ? 'Quark Star' : systemData.star.type === 'WH' ? 'White Hole' : systemData.star.type === 'WORM' ? 'Wormhole' : systemData.star.type === 'SC' ? 'Star Cluster' : systemData.star.type === 'NEB' ? 'Nebula' : systemData.star.type === 'MGTR' ? 'Magnetar' : `${systemData.star.type}-class star`} 
                        <span class="rarity-indicator ${systemData.star.type === 'M' ? 'very-common' : ''}" 
                              style="${systemData.star.type === 'M' ? '' : `background: ${rarityLevel.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`}"><span class="rarity-emoji">${rarityLevel.emoji}</span> ${rarityLevel.name}</span></p>
                        <p><span class="label">Temperature:</span> <span class="measurement">${Number(systemData.star.temperature).toLocaleString(undefined, {maximumFractionDigits: 0})} K</span></p>
                        <p><span class="label">Mass:</span> <span class="measurement">${systemData.star.mass}</span></p>
                        <p><span class="label">Radius:</span> <span class="measurement">
                            ${systemData.star.type === 'QS'
                                ? `${(Number(systemData.star.radius) * 695700 / 149597870.7).toLocaleString(undefined, {maximumFractionDigits: 1})} AU`
                                : systemData.star.type === 'SC'
                                    ? (() => {
                                        const radiusAu = Number(systemData.star.radius) * 695700 / 149597870.7;
                                        const lightYearAu = 63241.1;
                                        if (radiusAu >= lightYearAu) {
                                            return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                        } else {
                                            return `${radiusAu.toLocaleString(undefined, {maximumFractionDigits: 0})} AU`;
                                        }
                                    })()
                                : systemData.star.type === 'NEB'
                                    ? (() => {
                                        const radiusAu = Number(systemData.star.radius) * 695700 / 149597870.7;
                                        const lightYearAu = 63241.1;
                                        return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 1})} ly`;
                                    })()
                                : systemData.star.type === 'WORM'
                                    ? (() => {
                                        const radiusKm = Number(systemData.star.radius) * 695700;
                                        const lightYearKm = 9.461e12;
                                        if (radiusKm >= lightYearKm) {
                                            return `${(radiusKm / lightYearKm).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                        } else if (radiusKm >= 1000) {
                                            return `${(radiusKm / 1000).toLocaleString(undefined, {maximumFractionDigits: 2})} km`;
                                        } else {
                                            return `${(radiusKm * 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} m`;
                                        }
                                    })()
                                : ['P', 'N', 'MGTR', 'QK', 'WH'].includes(systemData.star.type)
                                    ? `${(Number(systemData.star.radius) * 695700).toLocaleString(undefined, {maximumFractionDigits: 2})} km`
                                    : `${Number(systemData.star.radius).toLocaleString(undefined, {maximumFractionDigits: 2})} R☉`}
                        </span></p>
                        <p><span class="label">Luminosity:</span> <span class="measurement">${formatLuminosity(systemData.star.luminosity)} L☉</span></p>
                    </div>
                </div>
                <div class="planets-header">
                    <span class="planet-emoji">🪐</span> Planets
                </div>
                ${generatePlanetGrid(systemData.planets)}
            </div>
        `;
        resultDiv.innerHTML = html;
        
        
        // Check for Egg Shaped Planets and handle special behavior
        const eggPlanets = document.querySelectorAll('[data-egg-planet="true"]');
        if (eggPlanets.length > 0) {
            // Start explosion timers for Egg Shaped Planets after a short delay to ensure DOM is ready
            setTimeout(() => {
                startEggPlanetExplosionTimers();
            }, 100);
        }
    }

    // Teleport to a specific saved system
    function teleportToSystem(systemData) {
        const rarityLevel = systemData.rarityLevel;
        
        // Display the saved system
        const resultDiv = document.getElementById('result');
        let html = `
            <div class="system-name">
                <span class="star-emoji">🌟</span> The ${systemData.completeSystemData.star.name} System
                <span class="teleport-badge">🚀 TELEPORTED TO SAVED SYSTEM!</span>
                <span class="random-discovery-badge">🎲 Random Discovery</span>
            </div>
            <div class="system-summary">
                <div class="summary-card">
                    <h4>Star</h4>
                    <p>${systemData.completeSystemData.star.name} (${systemData.completeSystemData.star.type}-class)</p>
                </div>
                <div class="summary-card">
                    <h4>Planets</h4>
                    <p>${systemData.completeSystemData.planets.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Habitable Worlds</h4>
                    <p>${systemData.completeSystemData.planets.filter(p => p.habitable).length}</p>
                </div>
            </div>
            <div class="star-system-visual">
                <div class="star-header">
                    <span class="star-emoji">⭐</span>
                    <div class="star-classification">
                        ${systemData.completeSystemData.giantType && systemData.completeSystemData.giantType !== 'main'
                            ? `${systemData.completeSystemData.giantType.charAt(0).toUpperCase() + systemData.completeSystemData.giantType.slice(1)} Star`
                            : systemData.completeSystemData.star.type === 'QS'
                                ? 'Quasi Star'
                                : systemData.completeSystemData.star.type === 'QK'
                                    ? 'Quark Star'
                                    : systemData.completeSystemData.star.type === 'WH'
                                        ? 'White Hole'
                                        : systemData.completeSystemData.star.type === 'WORM'
                                            ? 'Wormhole'
                                            : systemData.completeSystemData.star.type === 'SC'
                                                ? 'Star Cluster'
                                                : systemData.completeSystemData.star.type === 'MGTR'
                                            ? 'Magnetar Star'
                                            : systemData.completeSystemData.star.type === 'BD'
                                                ? 'Brown Dwarf'
                                                : ['P', 'N'].includes(systemData.completeSystemData.star.type)
                                                    ? 'Degenerate Star'
                                                    : systemData.completeSystemData.star.type === 'D'
                                                        ? 'White Dwarf Star'
                                                        : 'Main Sequence Star'}
                    </div>
                </div>
                <div class="celestial-object">
                    <div class="star type-${systemData.completeSystemData.star.type.replace('MGTR', 'magnetar')}"
                        ${systemData.completeSystemData.star.customColor ? `style="background-color: ${systemData.completeSystemData.star.customColor};"` : ''}>
                    </div>
                    <div class="celestial-info">
                        <h4>${systemData.completeSystemData.star.name}</h4>
                        <p>${systemData.completeSystemData.star.type === 'QS' ? 'Quasi Star' : systemData.completeSystemData.star.type === 'QK' ? 'Quark Star' : systemData.completeSystemData.star.type === 'WH' ? 'White Hole' : systemData.completeSystemData.star.type === 'WORM' ? 'Wormhole' : systemData.completeSystemData.star.type === 'SC' ? 'Star Cluster' : systemData.completeSystemData.star.type === 'MGTR' ? 'Magnetar' : `${systemData.completeSystemData.star.type}-class star`} 
                        <span class="rarity-indicator ${systemData.completeSystemData.star.type === 'M' ? 'very-common' : ''}" 
                              style="${systemData.completeSystemData.star.type === 'M' ? '' : `background: ${rarityLevel.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`}"><span class="rarity-emoji">${rarityLevel.emoji}</span> ${rarityLevel.name}</span></p>
                        <p><span class="label">Temperature:</span> <span class="measurement">${Number(systemData.completeSystemData.star.temperature).toLocaleString(undefined, {maximumFractionDigits: 0})} K</span></p>
                        <p><span class="label">Mass:</span> <span class="measurement">${systemData.completeSystemData.star.mass}</span></p>
                        <p><span class="label">Radius:</span> <span class="measurement">
                            ${systemData.completeSystemData.star.type === 'QS'
                                ? `${(Number(systemData.completeSystemData.star.radius) * 695700 / 149597870.7).toLocaleString(undefined, {maximumFractionDigits: 1})} AU`
                                : systemData.completeSystemData.star.type === 'SC'
                                    ? (() => {
                                        const radiusAu = Number(systemData.completeSystemData.star.radius) * 695700 / 149597870.7;
                                        const lightYearAu = 63241.1;
                                        if (radiusAu >= lightYearAu) {
                                            return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                        } else {
                                            return `${radiusAu.toLocaleString(undefined, {maximumFractionDigits: 0})} AU`;
                                        }
                                    })()
                                : systemData.completeSystemData.star.type === 'WORM'
                                    ? (() => {
                                        const radiusKm = Number(systemData.completeSystemData.star.radius) * 695700;
                                        const lightYearKm = 9.461e12;
                                        if (radiusKm >= lightYearKm) {
                                            return `${(radiusKm / lightYearKm).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                        } else if (radiusKm >= 1000) {
                                            return `${(radiusKm / 1000).toLocaleString(undefined, {maximumFractionDigits: 2})} km`;
                                        } else {
                                            return `${(radiusKm * 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} m`;
                                        }
                                    })()
                                : ['P', 'N', 'MGTR', 'QK', 'WH'].includes(systemData.completeSystemData.star.type)
                                    ? `${(Number(systemData.completeSystemData.star.radius) * 695700).toLocaleString(undefined, {maximumFractionDigits: 2})} km`
                                    : `${Number(systemData.completeSystemData.star.radius).toLocaleString(undefined, {maximumFractionDigits: 2})} R☉`}
                        </span></p>
                        <p><span class="label">Luminosity:</span> <span class="measurement">${formatLuminosity(systemData.completeSystemData.star.luminosity)} L☉</span></p>
                    </div>
                </div>
                <div class="planets-header">
                    <span class="planet-emoji">🪐</span> Planets
                </div>
                ${generatePlanetGrid(systemData.completeSystemData.planets)}
            </div>
        `;
        resultDiv.innerHTML = html;
        
        
        
        // Check for Egg Shaped Planets and handle special behavior
        const eggPlanets = document.querySelectorAll('[data-egg-planet="true"]');
        if (eggPlanets.length > 0) {
            // Start explosion timers for Egg Shaped Planets after a short delay to ensure DOM is ready
            setTimeout(() => {
                startEggPlanetExplosionTimers();
            }, 100);
        }
    }

    // Display rarity information
    function displayRarityInfo() {
        const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
        const rarityDisplay = document.getElementById('rarity-display');
        
        // Debug logging for display
        console.log('Display Rarity Debug:', {
            rarestObject: rarityData.rarestObject,
            totalGenerated: rarityData.totalGenerated,
            discoveries: rarityData.discoveries.length
        });
        
        let savedSystemsHtml = '';
        if (rarityData.savedSystems && rarityData.savedSystems.length > 0) {
            const showAll = rarityDisplay.getAttribute('data-show-all') === 'true';
            const systemsToShow = showAll ? rarityData.savedSystems : rarityData.savedSystems.slice(-5);
            const hasMore = rarityData.savedSystems.length > 5;
            
            savedSystemsHtml = `
                <div class="saved-systems-section">
                    <h4 class="saved-systems-title">🌟 Saved Legendary+ Systems (${rarityData.savedSystems.length})</h4>
                    <div class="saved-systems-list">
                        ${systemsToShow.reverse().map((system, displayIndex) => {
                            const originalIndex = rarityData.savedSystems.indexOf(system);
                            return `
                            <div class="saved-system-item" data-system-index="${originalIndex}">
                                <span class="saved-system-rarity">${system.rarityLevel.emoji} ${system.rarityLevel.name}</span>
                                <span class="saved-system-name">${system.name}</span>
                                <button class="saved-system-teleport-btn" data-action="teleport-saved" data-system-index="${originalIndex}">
                                    🚀
                                </button>
                            </div>
                        `;
                        }).join('')}
                        ${hasMore ? `
                            <div class="saved-systems-toggle">
                                <button class="saved-systems-toggle-btn" data-action="toggle-saved-systems">
                                    ${showAll ? 'Show Less' : `Show All (${rarityData.savedSystems.length - 5} more)`}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // HYPER STAR INDICATOR SECTION (COMMENTED OUT - Using Hyper Planets instead for world boss)
        // const hyperStarCount = rarityData.hyperStarsFound || 0;
        // const hyperStarIndicatorHtml = hyperStarCount > 0 ? `
        //     <div class="hyper-star-indicator" style="margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2)); border: 2px solid #A855F7; border-radius: 10px; text-align: center;">
        //         <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
        //             <img src="/static/images/ChatGPT-Hyper-Star.png" alt="Hyper Star" style="width: 32px; height: 32px; margin-right: 0.5rem; border-radius: 50%; object-fit: cover; box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);">
        //             <span style="color: #A855F7; font-weight: bold; font-size: 1.1rem;">Hyper Stars Found</span>
        //         </div>
        //         <div style="color: #FFD700; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${hyperStarCount}</div>
        //         <div style="color: #ccc; font-size: 0.9rem; margin-bottom: 1rem;">Each Hyper Star does 1 HP damage to the Global Boss</div>
        //         <button id="submit-hyper-stars-btn" class="cosmic-btn" style="background: linear-gradient(45deg, #A855F7, #EC4899); font-size: 0.9rem; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto; margin-bottom: 0.5rem;" title="Each Hyper Star does 1 HP damage to the world boss">
        //             <img src="/static/images/ChatGPT-Hyper-Star.png" alt="Hyper Star" style="width: 20px; height: 20px; margin-right: 0.5rem; border-radius: 50%; object-fit: cover; box-shadow: 0 0 6px rgba(168, 85, 247, 0.6);"> Submit Hyper Stars to Global Boss
        //         </button>
        //         <button id="view-global-boss-btn" class="cosmic-btn" style="background: linear-gradient(45deg, #8E44AD, #9B59B6); font-size: 0.9rem; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;" title="View the Global Boss status and health">
        //             <i class="fas fa-skull" style="margin-right: 0.5rem; color: #E74C3C;"></i> View the Global Boss
        //         </button>
        //     </div>
        // ` : '';
        
        // Hyper Planet indicator section (for world boss combat)
        const hyperPlanetCount = rarityData.hyperPlanetsFound || 0;
        const hyperPlanetIndicatorHtml = hyperPlanetCount > 0 ? `
            <div class="hyper-planet-indicator" style="margin-top: 1rem; padding: 1rem; background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2)); border: 2px solid #A855F7; border-radius: 10px; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;">
                    <img src="/static/images/Gemini-HyperPlanet.png" alt="Hyper Planet" style="width: 32px; height: 32px; margin-right: 0.5rem; border-radius: 50%; object-fit: cover; box-shadow: 0 0 12px rgba(168, 85, 247, 0.8);">
                    <span style="color: #A855F7; font-weight: bold; font-size: 1.1rem;">Hyper Planets Found</span>
                </div>
                <div style="color: #FFD700; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${hyperPlanetCount}</div>
                <div style="color: #ccc; font-size: 0.9rem; margin-bottom: 1rem;">Each Hyper Planet does 1 HP damage to the Global Boss</div>
                <button id="submit-hyper-planets-btn" class="cosmic-btn" style="background: linear-gradient(45deg, #A855F7, #EC4899); font-size: 0.9rem; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto; margin-bottom: 0.5rem;" title="Each Hyper Planet does 1 HP damage to the world boss">
                    <img src="/static/images/Gemini-HyperPlanet.png" alt="Hyper Planet" style="width: 20px; height: 20px; margin-right: 0.5rem; border-radius: 50%; object-fit: cover; box-shadow: 0 0 6px rgba(168, 85, 247, 0.6);"> Submit Hyper Planets to Global Boss
                </button>
                <button id="view-global-boss-btn" class="cosmic-btn" style="background: linear-gradient(45deg, #8E44AD, #9B59B6); font-size: 0.9rem; padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;" title="View the Global Boss status and health">
                    <i class="fas fa-skull" style="margin-right: 0.5rem; color: #E74C3C;"></i> View the Global Boss
                </button>
            </div>
        ` : '';
        
        // Use Hyper Planet indicator (comment out to switch back to Hyper Stars)
        const hyperStarIndicatorHtml = ''; // Placeholder for commented code above
        
        // Check if there are any discoveries to show reset button
        const hasDiscoveries = rarityData.rarestObject || (rarityData.savedSystems && rarityData.savedSystems.length > 0);
        const resetButtonHtml = hasDiscoveries ? `
            <div style="margin-top: 1rem; text-align: center; padding-top: 1rem; border-top: 1px solid rgba(107, 75, 163, 0.3);">
                <button id="reset-discoveries-btn" class="reset-btn" style="background: #c0392b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: bold; opacity: 0.8; transition: opacity 0.2s;">
                    🗑️ Reset Discoveries
                </button>
            </div>
        ` : '';
        
        if (rarityData.rarestObject) {
            const obj = rarityData.rarestObject;
            const rarityLevel = obj.rarityLevel;
            
            rarityDisplay.innerHTML = `
                <div class="rarity-card">
                    <div class="rarity-header">
                        <span class="rarity-emoji">${rarityLevel.emoji}</span>
                        <span class="rarity-title">Rarest Discovery</span>
                    </div>
                    <div class="rarity-content">
                        <div class="rarity-level ${obj.type === 'M' ? 'very-common' : ''}" 
                             style="${obj.type === 'M' ? '' : `background: ${rarityLevel.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`}">
                            ${rarityLevel.name}
                        </div>
                        <div class="rarity-object">
                            ${obj.name} (${obj.type}-class)
                            ${obj.giantType !== 'main' ? ` - ${obj.giantType.charAt(0).toUpperCase() + obj.giantType.slice(1)}` : ''}
                        </div>
                        <div class="rarity-stats">
                            <span>Total Objects Generated: ${statsBatch.systems_generated}</span>
                        </div>
                        ${obj.completeSystemData ? `
                            <div class="teleport-section">
                                <button id="teleport-btn" class="teleport-btn" data-action="teleport">
                                    🚀 Teleport to ${obj.name} System
                                </button>
                            </div>
                        ` : ''}
                        ${savedSystemsHtml}
                        ${hyperPlanetIndicatorHtml}
                        ${resetButtonHtml}
                    </div>
                </div>
            `;
        } else {
            rarityDisplay.innerHTML = `
                <div class="rarity-card">
                    <div class="rarity-header">
                        <span class="rarity-emoji">🔍</span>
                        <span class="rarity-title">Start Exploring!</span>
                    </div>
                    <div class="rarity-content">
                        <div class="rarity-level">Generate your first RANDOM star system to begin tracking discoveries!</div>
                        ${savedSystemsHtml}
                        ${hyperPlanetIndicatorHtml}
                        ${resetButtonHtml}
                    </div>
                </div>
            `;
        }
        
        // Re-attach event listener for the reset button if it exists
        const resetBtn = document.getElementById('reset-discoveries-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetDiscoveries);
            // Add hover effect
            resetBtn.addEventListener('mouseenter', () => resetBtn.style.opacity = '1');
            resetBtn.addEventListener('mouseleave', () => resetBtn.style.opacity = '0.8');
        }
    }

    // Initialize rarity tracking on page load
    initializeRarityTracking();
    displayRarityInfo();
    
    // Debug helper function - can be called from browser console
    window.debugRarityTracking = function() {
        const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
        console.log('Current Rarity Data:', rarityData);
        console.log('Rarity Weights:', RARITY_WEIGHTS);
        console.log('Rarity Levels:', RARITY_LEVELS);
        return rarityData;
    };
    
    // Debug helper function to reset rarity tracking
    window.resetRarityTracking = function() {
        localStorage.removeItem('spaceExplorerRarity');
        initializeRarityTracking();
        displayRarityInfo();
        console.log('Rarity tracking reset!');
    };
    
    // Debug helper function to fix corrupted rarity scores
    window.fixRarityScores = function() {
        const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
        let fixed = false;
        
        // Fix rarestObject if it has incorrect score
        if (rarityData.rarestObject) {
            const correctScore = calculateRarityScore(rarityData.rarestObject.type, rarityData.rarestObject.giantType);
            if (rarityData.rarestObject.rarityScore !== correctScore) {
                console.log(`Fixing rarestObject score: ${rarityData.rarestObject.rarityScore} -> ${correctScore}`);
                rarityData.rarestObject.rarityScore = correctScore;
                fixed = true;
            }
        }
        
        // Fix all discoveries
        if (rarityData.discoveries) {
            rarityData.discoveries.forEach((discovery, index) => {
                const correctScore = calculateRarityScore(discovery.type, discovery.giantType);
                if (discovery.rarityScore !== correctScore) {
                    console.log(`Fixing discovery ${index} score: ${discovery.rarityScore} -> ${correctScore}`);
                    discovery.rarityScore = correctScore;
                    fixed = true;
                }
            });
        }
        
        if (fixed) {
            localStorage.setItem('spaceExplorerRarity', JSON.stringify(rarityData));
            displayRarityInfo();
            console.log('Rarity scores fixed!');
        } else {
            console.log('No corrupted scores found.');
        }
        
        return rarityData;
    };
    
    
    // Initialize stats tracking for logged-in users
    initializeStatsTracking();
    
    // Set up save stats button
    const saveStatsBtn = document.getElementById('save-stats-btn');
    if (saveStatsBtn) {
        saveStatsBtn.addEventListener('click', async () => {
            saveStatsBtn.textContent = '💾 Saving...';
            saveStatsBtn.disabled = true;
            
            try {
                await saveStatsManually();
                saveStatsBtn.textContent = '✅ Stats Saved!';
                setTimeout(() => {
                    saveStatsBtn.textContent = '💾 Save Stats';
                    saveStatsBtn.disabled = false;
                }, 2000);
            } catch (error) {
                saveStatsBtn.textContent = '❌ Save Failed';
                setTimeout(() => {
                    saveStatsBtn.textContent = '💾 Save Stats';
                    saveStatsBtn.disabled = false;
                }, 2000);
            }
        });
    }
    
    // Reset stats button handler
    const resetStatsBtn = document.getElementById('reset-stats-btn');
    if (resetStatsBtn) {
        resetStatsBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset your statistics? This action cannot be undone.')) {
                resetStatsBtn.textContent = '🗑️ Resetting...';
                resetStatsBtn.disabled = true;
                
                try {
                    // Reset local stats
                    statsBatch = {
                        systems_generated: 0,
                        habitable_worlds: 0,
                        legendary_systems: 0,
                        rarest_discovery: null
                    };
                    
                    // Reset server stats
                    const response = await fetch('/api/reset-space-stats', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        resetStatsBtn.textContent = '✅ Stats Reset!';
                        updateLocalStatsDisplay();
                        setTimeout(() => {
                            resetStatsBtn.textContent = '🗑️ Reset Stats';
                            resetStatsBtn.disabled = false;
                        }, 2000);
                    } else {
                        throw new Error('Failed to reset stats on server');
                    }
                } catch (error) {
                    console.error('Failed to reset stats:', error);
                    resetStatsBtn.textContent = '❌ Reset Failed';
                    setTimeout(() => {
                        resetStatsBtn.textContent = '🗑️ Reset Stats';
                        resetStatsBtn.disabled = false;
                    }, 2000);
                }
            }
        });
    }

    // AFK Mode functionality - declare variables first
    let afkModeInterval = null;
    let afkModeActive = false;
    let afkCooldownEndTime = null;
    let afkSessionStartTime = null;
    let afkGenerationCountdown = 0;
    let afkGenerationInterval = null;
    let afkPausedTime = 0; // Track total time AFK mode has been paused
    let afkPauseStartTime = null; // Track when the current pause started

    // Initialize AFK cooldown from localStorage
    const savedCooldownEndTime = localStorage.getItem('afkCooldownEndTime');
    if (savedCooldownEndTime) {
        afkCooldownEndTime = parseInt(savedCooldownEndTime);
        // Check if cooldown has expired
        if (Date.now() >= afkCooldownEndTime) {
            clearAFKCooldown();
        }
    }

    // Initialize AFK session start time from localStorage
    const savedSessionStartTime = localStorage.getItem('afkSessionStartTime');
    if (savedSessionStartTime) {
        afkSessionStartTime = parseInt(savedSessionStartTime);
        // Check if session has expired (5 minutes have passed)
        if (Date.now() - afkSessionStartTime >= 300000) {
            afkSessionStartTime = null;
            localStorage.removeItem('afkSessionStartTime');
            localStorage.removeItem('afkPausedTime');
        } else {
            // Load paused time if available
            const savedPausedTime = localStorage.getItem('afkPausedTime');
            if (savedPausedTime) {
                afkPausedTime = parseInt(savedPausedTime);
            }
        }
    }

    // Get AFK mode elements
    const afkModeCheckbox = document.getElementById('afk-mode');
    const afkModeStatus = document.getElementById('afk-mode-status');
    const afkSessionTimer = document.getElementById('afk-session-timer');
    const afkNextGeneration = document.getElementById('afk-next-generation');
    const generateBtn = document.getElementById('generate-btn');
    // Seed UI elements
    const seedCheckbox = document.getElementById('seed-lock');
    const seedInput = document.getElementById('seed-input');

    // Initialize seed settings from localStorage
    try {
        const savedUseSeed = localStorage.getItem('useSystemGenSeed');
        const savedSeed = localStorage.getItem('systemGenSeed');
        if (seedCheckbox && savedUseSeed === 'true') {
            seedCheckbox.checked = true;
        }
        if (seedInput && savedSeed) {
            seedInput.value = savedSeed;
        }
    } catch (e) {}

    if (seedCheckbox) {
        seedCheckbox.addEventListener('change', () => {
            try { localStorage.setItem('useSystemGenSeed', seedCheckbox.checked ? 'true' : 'false'); } catch (e) {}
        });
    }
    if (seedInput) {
        seedInput.addEventListener('change', () => {
            try { localStorage.setItem('systemGenSeed', seedInput.value || ''); } catch (e) {}
        });
    }

    // Function to check if AFK mode is on cooldown
    function isAFKOnCooldown() {
        if (!afkCooldownEndTime) return false;
        return Date.now() < afkCooldownEndTime;
    }

    // Function to get remaining cooldown time
    function getRemainingCooldownTime() {
        if (!afkCooldownEndTime) return 0;
        return Math.max(0, afkCooldownEndTime - Date.now());
    }

    // Function to format time remaining
    function formatTimeRemaining(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Function to start AFK mode (called when checkbox is checked)
    function prepareAFKMode() {
        // Check if we're in advanced mode - AFK mode is not available in advanced mode
        const isAdvancedView = document.querySelector('.view-btn[data-view="advanced"]').classList.contains('active');
        if (isAdvancedView) {
            alert('AFK Mode is not available in Advanced mode. Switch to Basic mode to use AFK Mode.');
            afkModeCheckbox.checked = false;
            return;
        }
        
        if (isAFKOnCooldown()) {
            alert(`AFK Mode is on cooldown! Find an Epic or better system through random generation to reset the cooldown.\n\nTime remaining: ${formatTimeRemaining(getRemainingCooldownTime())}`);
            afkModeCheckbox.checked = false;
            return;
        }
        
        // Load session start time from localStorage if available
        const savedSessionStartTime = localStorage.getItem('afkSessionStartTime');
        if (savedSessionStartTime && !afkSessionStartTime) {
            afkSessionStartTime = parseInt(savedSessionStartTime);
        }
        
        // Update button text and styling
        updateGenerateButtonState();
    }

    // Function to actually start AFK mode (called when generate button is clicked)
    function startAFKMode() {
        if (afkModeInterval) return; // Already running
        
        // Double-check we're not in advanced mode
        const isAdvancedView = document.querySelector('.view-btn[data-view="advanced"]').classList.contains('active');
        if (isAdvancedView) {
            afkModeCheckbox.checked = false;
            updateGenerateButtonState();
            return;
        }
        
        afkModeActive = true;
        
        // Only set session start time if not already set (preserve timer across stops/starts)
        if (!afkSessionStartTime) {
            afkSessionStartTime = Date.now();
            localStorage.setItem('afkSessionStartTime', afkSessionStartTime.toString());
        } else if (afkPauseStartTime) {
            // Resume from pause - add the paused time to total paused time
            afkPausedTime += Date.now() - afkPauseStartTime;
            afkPauseStartTime = null;
            localStorage.setItem('afkPausedTime', afkPausedTime.toString());
        }
        
        afkModeStatus.classList.add('active');
        updateGenerateButtonState();
        
        // Start the generation countdown
        startGenerationCountdown();
        
        // Start session timer update every second
        afkModeInterval = setInterval(() => {
            if (!afkModeActive) return;
            updateAFKStatusDisplay();
            
            // Check if 5 minutes have passed (accounting for paused time)
            const totalElapsed = Date.now() - afkSessionStartTime;
            const actualElapsed = totalElapsed - afkPausedTime;
            if (actualElapsed >= 300000) { // 5 minutes = 300000ms
                stopAFKMode(true); // Clear session time when session completes
                startAFKCooldown();
                showAFKCooldownNotification();
                return;
            }
        }, 1000); // Update every second
    }

    // Function to start generation countdown
    function startGenerationCountdown() {
        afkGenerationCountdown = 0.25; // Start with 0.25 seconds (4 times per second)
        updateGenerationCountdown();
        
        afkGenerationInterval = setInterval(() => {
            if (!afkModeActive) return;
            
            afkGenerationCountdown -= 0.25;
            updateGenerationCountdown();
            
            if (afkGenerationCountdown <= 0) {
                generateAFKSystem();
                afkGenerationCountdown = 0.25; // Reset to 0.25 seconds
            }
        }, 250); // Update every 250ms (4 times per second)
    }

    // Function to update generation countdown display
    function updateGenerationCountdown() {
        if (afkGenerationCountdown > 0) {
            const timeStr = afkGenerationCountdown < 1 ? `${Math.round(afkGenerationCountdown * 1000)}ms` : `${afkGenerationCountdown.toFixed(1)}s`;
            afkNextGeneration.textContent = `Auto Generating New System in ${timeStr}...`;
        } else {
            afkNextGeneration.textContent = 'Generating new system...';
        }
    }

    // Function to generate a system in AFK mode
    async function generateAFKSystem() {
        try {
            // Generate a random system (no specific star type)
            const useSeed = seedCheckbox ? seedCheckbox.checked : false;
            const manualSeed = seedInput ? seedInput.value.trim() : '';
            
            // If checked but no value, uncheck and generate random
            if (useSeed && !manualSeed) {
                seedCheckbox.checked = false;
                localStorage.setItem('useSystemGenSeed', 'false');
            }
            
            let data = await SystemGen.generateSystem({ starType: '', seed: useSeed && manualSeed ? manualSeed : undefined });
            
            // Check for Hyper Star + Hyper Planet conflict
            const hasHyperStar = data.star.type === 'HS';
            const hasHyperPlanet = data.planets.some(planet => planet.type === 'Hyper Planet');
            
            if (hasHyperStar && hasHyperPlanet) {
                // Replace with Infinite Galactic Voided Plasma Orb
                data = await SystemGen.generateSystem({ starType: 'IGVPO', seed: useSeed && manualSeed ? manualSeed : undefined });
            }
            
            // AFK mode generates random systems, so pass true for isRandomGeneration
            const rarityResult = checkRarity(data, true);
            
            // Track system generation for stats in AFK mode
            trackSystemGeneration(data, true);
            
            displaySystem(data, rarityResult, true);
        } catch (error) {
            console.error('AFK Mode generation error:', error);
        }
    }

    // Function to stop AFK mode
    function stopAFKMode(clearSessionTime = false) {
        afkModeActive = false;
        afkModeStatus.classList.remove('active');
        
        // Track when AFK mode was paused (if not clearing session time)
        if (!clearSessionTime && afkSessionStartTime) {
            afkPauseStartTime = Date.now();
        }
        
        if (afkModeInterval) {
            clearInterval(afkModeInterval);
            afkModeInterval = null;
        }
        
        if (afkGenerationInterval) {
            clearInterval(afkGenerationInterval);
            afkGenerationInterval = null;
        }
        
        // Clear countdown display
        afkNextGeneration.textContent = '';
        
        // Only clear session time if explicitly requested (session complete) or if manually stopped
        if (clearSessionTime) {
            afkSessionStartTime = null;
            afkPausedTime = 0;
            afkPauseStartTime = null;
            localStorage.removeItem('afkSessionStartTime');
            localStorage.removeItem('afkPausedTime');
        }
        
        // Uncheck the checkbox and update button
        afkModeCheckbox.checked = false;
        updateGenerateButtonState();
    }

    // Function to update generate button state
    function updateGenerateButtonState() {
        if (afkModeCheckbox.checked && !afkModeActive) {
            // AFK mode is checked but not running - show "Generate in AFK Mode!"
            generateBtn.textContent = 'Generate in AFK Mode!';
            generateBtn.classList.remove('afk-active');
        } else if (afkModeActive) {
            // AFK mode is running - show "STOP AFK MODE"
            generateBtn.textContent = 'STOP AFK MODE';
            generateBtn.classList.add('afk-active');
        } else {
            // Normal mode - show default text
            generateBtn.textContent = 'Generate New Star System!';
            generateBtn.classList.remove('afk-active');
        }
    }

    // Function to start AFK cooldown
    function startAFKCooldown() {
        afkCooldownEndTime = Date.now() + 3600000; // 1 hour cooldown from now
        localStorage.setItem('afkCooldownEndTime', afkCooldownEndTime.toString());
    }

    // Function to clear AFK cooldown
    function clearAFKCooldown() {
        afkCooldownEndTime = null;
        localStorage.removeItem('afkCooldownEndTime');
    }

    // Function to update AFK status display
    function updateAFKStatusDisplay() {
        if (!afkModeActive) {
            afkSessionTimer.textContent = '';
            return;
        }

        const totalElapsed = Date.now() - afkSessionStartTime;
        const actualElapsed = totalElapsed - afkPausedTime; // Subtract paused time
        const remaining = 300000 - actualElapsed; // 5 minutes - actual elapsed time
        
        if (remaining <= 0) {
            afkSessionTimer.textContent = '🤖 AFK Mode - Session Complete!';
        } else {
            const timeStr = formatTimeRemaining(remaining);
            afkSessionTimer.textContent = `🤖 AFK Mode Active - ${timeStr} remaining`;
        }
    }

    // Function to check if a system is Epic or better
    function isEpicOrBetter(starType) {
        const epicTypes = ['MGTR', 'P', 'N', 'O', 'QS', 'QK', 'BH', 'WH', 'WORM', 'SC', 'NEB', 'GAL', 'GF', 'SV'];
        return epicTypes.includes(starType);
    }

    // Function to show AFK cooldown notification
    function showAFKCooldownNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(255, 107, 107, 0.8);
            animation: afkCooldownPulse 0.5s ease-in-out infinite alternate;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
            <div>AFK Mode Session Complete!</div>
            <div style="font-size: 1.2rem; margin-top: 0.5rem;">Find an Epic or better system to reset cooldown</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Function to show cooldown reset notification
    function showCooldownResetNotification(starName, rarityLevel) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            padding: 2rem 3rem;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            animation: cooldownResetPulse 0.5s ease-in-out infinite alternate;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">${rarityLevel.emoji}</div>
            <div>AFK Mode Cooldown Reset!</div>
            <div style="font-size: 1.2rem; margin-top: 0.5rem;">${starName} - ${rarityLevel.name}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Function to display system (extracted from existing code)
    function displaySystem(data, rarityResult, isAFKMode = false) {
        const resultDiv = document.getElementById('result');
        let html = `
            <div class="system-name">
                <span class="star-emoji">🌟</span> The ${data.star.name} System
                ${rarityResult.isNewRarest ? `<span class="new-discovery-badge">${rarityResult.rarityLevel.emoji} NEW RAREST DISCOVERY!</span>` : ''}
                ${data.star.type === 'HS' && data.planets.length > 0 ? `<span class="hyper-star-planets-badge">⚛️ HYPER STAR WITH PLANETS!</span>` : ''}
                ${isAFKMode ? `<span class="random-discovery-badge">🤖 AFK Discovery</span>` : `<span class="random-discovery-badge">🎲 Random Discovery</span>`}
            </div>
            <div class="system-summary">
                <div class="summary-card">
                    <h4>Star</h4>
                    <p>${data.star.name} (${data.star.type}-class)</p>
                </div>
                <div class="summary-card">
                    <h4>Planets</h4>
                    <p>${data.planets.length}</p>
                </div>
                <div class="summary-card">
                    <h4>Habitable Worlds</h4>
                    <p>${data.planets.filter(p => p.habitable).length}</p>
                </div>
            </div>
            <div class="star-system-visual">
                <div class="star-header">
                    <span class="star-emoji">⭐</span>
                    <div class="star-classification">
                        ${data.giantType && data.giantType !== 'main'
                            ? `${data.giantType.charAt(0).toUpperCase() + data.giantType.slice(1)} Star`
                            : data.star.type === 'QS'
                                ? 'Quasi Star'
                                : data.star.type === 'QK'
                                    ? 'Quark Star'
                                    : data.star.type === 'WH'
                                        ? 'White Hole'
                                        : data.star.type === 'WORM'
                                            ? 'Wormhole'
                                            : data.star.type === 'SC'
                                                ? 'Star Cluster'
                                                : data.star.type === 'NEB'
                                                    ? 'Nebula'
                                                    : data.star.type === 'GAL'
                                                        ? 'Galaxy'
                                                        : data.star.type === 'GF'
                                                            ? 'Galactic Filament'
                                                            : data.star.type === 'SV'
                                                                ? 'Supervoid'
                                                                : data.star.type === 'MGTR'
                                            ? 'Magnetar Star'
                                            : data.star.type === 'BD'
                                                ? 'Brown Dwarf'
                                                : data.star.type === 'HS'
                                                    ? 'Hyper Star'
                                                    : data.star.type === 'IGVPO'
                                                        ? 'Infinite Galactic Voided Plasma Orb'
                                                        : ['P', 'N'].includes(data.star.type)
                                                            ? 'Degenerate Star'
                                                            : data.star.type === 'D'
                                                                ? 'White Dwarf Star'
                                                                : 'Main Sequence Star'}
                    </div>
                </div>
                <div class="celestial-object">
                    <div class="star type-${data.star.type.replace('MGTR', 'magnetar')}"
                        ${data.star.customColor ? `style="background-color: ${data.star.customColor};"` : ''}>
                    </div>
                    <div class="celestial-info">
                        <h4>${data.star.name}</h4>
                        <p>${data.star.type === 'QS' ? 'Quasi Star' : data.star.type === 'QK' ? 'Quark Star' : data.star.type === 'WH' ? 'White Hole' : data.star.type === 'WORM' ? 'Wormhole' : data.star.type === 'MGTR' ? 'Magnetar' : data.star.type === 'BD' ? 'Brown Dwarf' : data.star.type === 'HS' ? 'Hyper Star' : data.star.type === 'IGVPO' ? 'Infinite Galactic Voided Plasma Orb' : `${data.star.type}-class star`} 
                        <span class="rarity-indicator ${data.star.type === 'M' ? 'very-common' : ''}" 
                              style="${data.star.type === 'M' ? '' : `background: ${rarityResult.rarityLevel.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`}"><span class="rarity-emoji">${rarityResult.rarityLevel.emoji}</span> ${rarityResult.rarityLevel.name}</span></p>
                        <p><span class="label">Temperature:</span> <span class="measurement">${data.star.type === 'IGVPO' ? '∞ K' : Number(data.star.temperature).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' K'}</span></p>
                        <p><span class="label">Mass:</span> <span class="measurement">${data.star.mass}</span></p>
                        <p><span class="label">Radius:</span> <span class="measurement">
                            ${data.star.type === 'QS'
                                ? `${(Number(data.star.radius) * 695700 / 149597870.7).toLocaleString(undefined, {maximumFractionDigits: 1})} AU`
                                : data.star.type === 'BD'
                                    ? `${(Number(data.star.radius) * 695700 / 71492).toLocaleString(undefined, {maximumFractionDigits: 2})} R♃`
                                    : data.star.type === 'HS'
                                        ? `${(Number(data.star.radius) * 695700 * 100).toLocaleString(undefined, {maximumFractionDigits: 2})} cm`
                                        : data.star.type === 'IGVPO'
                                            ? '∞ R☉'
                                            : ['P', 'N', 'MGTR', 'QK', 'WH', 'WORM'].includes(data.star.type)
                                                ? `${(Number(data.star.radius) * 695700).toLocaleString(undefined, {maximumFractionDigits: 2})} km`
                                                : `${Number(data.star.radius).toLocaleString(undefined, {maximumFractionDigits: 2})} R☉`}
                        </span></p>
                        <p><span class="label">Luminosity:</span> <span class="measurement">${data.star.type === 'IGVPO' ? '∞ L☉' : formatLuminosity(data.star.luminosity) + ' L☉'}</span></p>
                    </div>
                </div>
                <div class="planets-header">
                    <span class="planet-emoji">🪐</span> Planets
                </div>
                ${generatePlanetGrid(data.planets)}
            </div>
        `;
        resultDiv.innerHTML = html;
        
        
        
        // Check for Egg Shaped Planets and handle special behavior
        const eggPlanets = document.querySelectorAll('[data-egg-planet="true"]');
        if (eggPlanets.length > 0) {
            // Start explosion timers for Egg Shaped Planets after a short delay to ensure DOM is ready
            setTimeout(() => {
                startEggPlanetExplosionTimers();
            }, 100);
        }
        
        // Update rarity display
        displayRarityInfo();
    }

    // Function to handle Egg Shaped Planet spawn
    function handleEggPlanetSpawn(eggPlanetElement) {
        // Explosion timers are now handled in the display functions
    }


    // Function to start explosion timers for Egg Shaped Planets
    function startEggPlanetExplosionTimers() {
        const eggPlanets = document.querySelectorAll('[data-egg-planet="true"]');
        
        eggPlanets.forEach((planetElement, index) => {
            const explosionTimer = parseInt(planetElement.getAttribute('data-explosion-timer'));
            const planetOrbit = planetElement.closest('.planet-orbit');
            const planetInfo = planetOrbit.querySelector('.celestial-info');
            const startTime = Date.now();
            
            // Start countdown
            const countdownInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remainingTime = explosionTimer - elapsed;
                
                if (remainingTime <= 0) {
                    clearInterval(countdownInterval);
                    explodeEggPlanet(planetElement, planetOrbit, planetInfo);
                } else {
                    updateEggPlanetCountdown(planetInfo, remainingTime);
                }
            }, 100);
        });
    }

    // Function to update countdown display
    function updateEggPlanetCountdown(planetInfo, remainingTime) {
        const seconds = Math.ceil(remainingTime / 1000);
        let countdownElement = planetInfo.querySelector('.egg-countdown');
        if (!countdownElement) {
            countdownElement = document.createElement('p');
            countdownElement.className = 'egg-countdown';
            countdownElement.style.color = '#FF6B6B';
            countdownElement.style.fontWeight = 'bold';
            countdownElement.style.animation = 'pulse 1s ease-in-out infinite alternate';
            planetInfo.appendChild(countdownElement);
        }
        countdownElement.textContent = `⏰ Exploding in ${seconds} seconds!`;
    }

    // Function to explode the Egg Shaped Planet
    function explodeEggPlanet(planetElement, planetOrbit, planetInfo) {
        
        // Add explosion animation
        planetElement.style.animation = 'eggShapedPlanetExplosion 2s ease-out forwards';
        
        // Update the planet info to show it's exploding
        const countdownElement = planetInfo.querySelector('.egg-countdown');
        if (countdownElement) {
            countdownElement.textContent = '💥 EXPLODING!';
            countdownElement.style.color = '#FF0000';
            countdownElement.style.animation = 'pulse 0.5s ease-in-out infinite alternate';
        }
        
        // After explosion animation, transform to Destroyed Planet
        setTimeout(() => {
            
            // Change the planet type to Destroyed Planet
            planetElement.className = 'planet-visual destroyed-planet';
            planetElement.removeAttribute('data-egg-planet');
            planetElement.removeAttribute('data-explosion-timer');
            
            // Ensure the image is properly set with debugging
            console.log('Setting destroyed planet image...');
            const imageUrl = '/static/images/Gemini-TornApartPlanet.png';
            console.log('Image URL:', imageUrl);
            
            planetElement.style.backgroundImage = `url("${imageUrl}")`;
            planetElement.style.backgroundSize = 'cover';
            planetElement.style.backgroundPosition = 'center';
            planetElement.style.backgroundRepeat = 'no-repeat';
            planetElement.style.backgroundColor = 'transparent';
            
            // Force the background to override any conflicting styles
            planetElement.style.setProperty('background', `url("${imageUrl}") center/cover no-repeat transparent`, 'important');
            
            // Try alternative approach - create a new element with the image
            const testImg = new Image();
            testImg.onload = function() {
                console.log('Image loaded successfully');
                planetElement.style.backgroundImage = `url("${imageUrl}")`;
            };
            testImg.onerror = function() {
                console.error('Failed to load image:', imageUrl);
            };
            testImg.src = imageUrl;
            
            // Clear any animations that might interfere and set size for destroyed planet
            planetElement.style.animation = 'none';
            planetElement.style.opacity = '1';
            planetElement.style.transform = 'none';
            planetElement.style.width = '60px';
            planetElement.style.height = '60px';
            
            console.log('Destroyed planet element:', planetElement);
            console.log('Background image set to:', planetElement.style.backgroundImage);
            console.log('Final computed background:', window.getComputedStyle(planetElement).backgroundImage);
            
            // Force a reflow to ensure the class change takes effect
            planetElement.offsetHeight;
            
            // Set the destroyed planet animation after a brief delay
            setTimeout(() => {
                planetElement.style.animation = 'destroyedPlanetFade 4s ease-in-out infinite alternate';
            }, 50);
            
            // Update the planet info
            const typeElement = planetInfo.querySelector('p');
            if (typeElement) {
                typeElement.innerHTML = typeElement.innerHTML.replace('Egg Shaped Planet', 'Destroyed Planet');
                typeElement.innerHTML = typeElement.innerHTML.replace('<span class="rarity-indicator" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"><span class="rarity-emoji">🥚</span> Unstable</span>', '<span class="rarity-indicator" style="background: linear-gradient(45deg, #8B4513, #654321); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"><span class="rarity-emoji">💀</span> Destroyed</span>');
            }
            
            // Remove warning and countdown
            const warningElement = planetInfo.querySelector('.egg-warning-tag');
            if (warningElement) {
                warningElement.remove();
            }
            if (countdownElement) {
                countdownElement.remove();
            }
            
            // Remove "Potentially Habitable" text since the planet is destroyed
            const habitableElement = planetInfo.querySelector('.habitable-tag');
            if (habitableElement) {
                habitableElement.remove();
            }
            
            // Add destroyed planet message
            const destroyedMessage = document.createElement('p');
            destroyedMessage.className = 'destroyed-planet-tag';
            destroyedMessage.style.color = '#8B4513';
            destroyedMessage.style.fontWeight = 'bold';
            destroyedMessage.textContent = '💀 Planet destroyed by rapid rotation!';
            planetInfo.appendChild(destroyedMessage);
            
            
            // Remove the highlight effect
            planetOrbit.style.animation = '';
            planetOrbit.style.border = '';
            planetOrbit.style.boxShadow = '';
            
        }, 2000); // Wait for explosion animation to complete
    }

    // Function to show AFK discovery notification
    function showAFKDiscoveryNotification(starName, rarityLevel) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            padding: 2rem 3rem;
            border-radius: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            animation: afkDiscoveryPulse 0.5s ease-in-out infinite alternate;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">${rarityLevel.emoji}</div>
            <div>AFK Mode Found New Rarest Discovery!</div>
            <div style="font-size: 1.2rem; margin-top: 0.5rem;">${starName} - ${rarityLevel.name}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Add CSS for the notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes afkDiscoveryPulse {
            from {
                transform: translate(-50%, -50%) scale(1);
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            }
            to {
                transform: translate(-50%, -50%) scale(1.05);
                box-shadow: 0 0 70px rgba(255, 215, 0, 1);
            }
        }
        
        @keyframes afkCooldownPulse {
            from {
                transform: translate(-50%, -50%) scale(1);
                box-shadow: 0 0 50px rgba(255, 107, 107, 0.8);
            }
            to {
                transform: translate(-50%, -50%) scale(1.05);
                box-shadow: 0 0 70px rgba(255, 107, 107, 1);
            }
        }
        
        @keyframes cooldownResetPulse {
            from {
                transform: translate(-50%, -50%) scale(1);
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
            }
            to {
                transform: translate(-50%, -50%) scale(1.05);
                box-shadow: 0 0 70px rgba(255, 215, 0, 1);
            }
        }
    `;
    document.head.appendChild(style);

    // AFK Mode checkbox event listener
    afkModeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            prepareAFKMode();
        } else {
            // If AFK mode is running, stop it
            if (afkModeActive) {
                stopAFKMode(false); // Don't clear session time when manually stopped - preserve timer
            } else {
                // Just update button state
                updateGenerateButtonState();
            }
        }
    });

    // Update AFK mode checkbox state based on cooldown
    function updateAFKCheckboxState() {
        if (isAFKOnCooldown()) {
            afkModeCheckbox.disabled = true;
            afkModeCheckbox.checked = false;
            const label = document.querySelector('.afk-mode-label');
            if (label) {
                label.textContent = `🤖 AFK Mode (Cooldown: ${formatTimeRemaining(getRemainingCooldownTime())})`;
                label.style.opacity = '0.6';
            }
        } else {
            afkModeCheckbox.disabled = false;
            const label = document.querySelector('.afk-mode-label');
            if (label) {
                label.textContent = '🤖 AFK Mode';
                label.style.opacity = '1';
            }
        }
        
        // Also update button state
        updateGenerateButtonState();
    }

    // Update cooldown display every second
    setInterval(() => {
        if (isAFKOnCooldown()) {
            updateAFKCheckboxState();
        }
    }, 1000);

    // Initial update
    updateAFKCheckboxState();

    // Stop AFK mode when page is about to unload
    window.addEventListener('beforeunload', function() {
        stopAFKMode();
    });

    // Get the color select and custom color picker elements
    const colorSelect = document.getElementById('star-color-type');
    const customColorPicker = document.getElementById('custom-color-picker');

    // Add event listener to the color select
    colorSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customColorPicker.classList.remove('hidden');
        } else {
            customColorPicker.classList.add('hidden');
        }
    });

    // Ensure color picker is hidden on page load
    customColorPicker.classList.add('hidden');

    generateBtn.addEventListener('click', async () => {
        // Check if AFK mode is active - if so, stop it
        if (afkModeActive) {
            stopAFKMode(false); // Don't clear session time when manually stopped - preserve timer
            return;
        }
        
        // Check if AFK mode is checked but not active - if so, start AFK mode
        if (afkModeCheckbox.checked && !afkModeActive) {
            startAFKMode();
            return;
        }
        
        // Normal generation
        try {
            const starType = document.getElementById('star-type').value;
            const isAdvancedView = document.querySelector('.view-btn[data-view="advanced"]').classList.contains('active');

            let requestData = { starType };

            // Add advanced parameters if in advanced view
            if (isAdvancedView) {
                const colorSelect = document.getElementById('star-color-type');
                const starColor = document.getElementById('star-color');
                requestData.starColor = colorSelect.value === 'custom'
                    ? starColor.value  // Send the actual color value from the color picker
                    : colorSelect.value;
                requestData.starSize = document.getElementById('star-size').value;
                requestData.giantType = document.getElementById('giant-type').value;
            }

            // Determine if this is a random generation
            // Random generation = basic mode with no specific star type selected
            const isRandomGeneration = !isAdvancedView && (!starType || starType === '');

            const useSeed = seedCheckbox ? seedCheckbox.checked : false;
            const manualSeed = seedInput ? seedInput.value.trim() : '';
            
            // If checked but no value, uncheck and generate random
            if (useSeed && !manualSeed) {
                seedCheckbox.checked = false;
                localStorage.setItem('useSystemGenSeed', 'false');
            }
            
            let data = await SystemGen.generateSystem({ ...requestData, seed: useSeed && manualSeed ? manualSeed : undefined });
            
            // Check for Hyper Star + Hyper Planet conflict (only for random generation)
            if (isRandomGeneration) {
                const hasHyperStar = data.star.type === 'HS';
                const hasHyperPlanet = data.planets.some(planet => planet.type === 'Hyper Planet');
                
                if (hasHyperStar && hasHyperPlanet) {
                    // Replace with Infinite Galactic Voided Plasma Orb
                    data = await SystemGen.generateSystem({ starType: 'IGVPO', seed: useSeed && manualSeed ? manualSeed : undefined });
                }
            }
            
            {
                // Check rarity for all generations; only show 'new rarest' badge for random generations
                const rarityResult = checkRarity(data, isRandomGeneration);
                
                // Track system generation for stats (only for random generation)
                if (isRandomGeneration) {
                    trackSystemGeneration(data, true);
                }
                
                // Use the displaySystem function with appropriate badge
                const isAFKMode = false; // Manual generation
                const badgeType = isRandomGeneration ? 'random' : (isAdvancedView ? 'advanced' : 'manual');
                
                // Create a modified displaySystem call for manual generation
                const resultDiv = document.getElementById('result');
                let html = `
                    <div class="system-name">
                        <span class="star-emoji">🌟</span> The ${data.star.name} System
                        ${(isRandomGeneration && rarityResult.isNewRarest) ? `<span class="new-discovery-badge">${rarityResult.rarityLevel.emoji} NEW RAREST DISCOVERY!</span>` : ''}
                        ${data.star.type === 'HS' && data.planets.length > 0 ? `<span class="hyper-star-planets-badge">⚛️ HYPER STAR WITH PLANETS!</span>` : ''}
                        ${isRandomGeneration ? `<span class="random-discovery-badge">🎲 Random Discovery</span>` : (isAdvancedView ? `<span class="advanced-selection-badge">⚙️ Advanced Selection</span>` : `<span class="manual-selection-badge">🎯 Manual Selection</span>`)}
                    </div>
                    <div class="system-summary">
                        <div class="summary-card">
                            <h4>Star</h4>
                            <p>${data.star.name} (${data.star.type}-class)</p>
                        </div>
                        <div class="summary-card">
                            <h4>Planets</h4>
                            <p>${data.planets.length}</p>
                        </div>
                        <div class="summary-card">
                            <h4>Habitable Worlds</h4>
                            <p>${data.planets.filter(p => p.habitable).length}</p>
                        </div>
                    </div>
                    <div class="star-system-visual">
                        <div class="star-header">
                            <span class="star-emoji">⭐</span>
                            <div class="star-classification">
                        ${data.giantType && data.giantType !== 'main'
                            ? `${data.giantType.charAt(0).toUpperCase() + data.giantType.slice(1)} Star`
                            : data.star.type === 'QS'
                                ? 'Quasi Star'
                                : data.star.type === 'QK'
                                    ? 'Quark Star'
                                    : data.star.type === 'WH'
                                        ? 'White Hole'
                                        : data.star.type === 'WORM'
                                            ? 'Wormhole'
                                            : data.star.type === 'SC'
                                                ? 'Star Cluster'
                                                : data.star.type === 'NEB'
                                                    ? 'Nebula'
                                                    : data.star.type === 'GAL'
                                                        ? 'Galaxy'
                                                        : data.star.type === 'GF'
                                                            ? 'Galactic Filament'
                                                            : data.star.type === 'SV'
                                                                ? 'Supervoid'
                                                                : data.star.type === 'MGTR'
                                            ? 'Magnetar Star'
                                            : data.star.type === 'BD'
                                                ? 'Brown Dwarf'
                                                : data.star.type === 'HS'
                                                    ? 'Hyper Star'
                                                    : data.star.type === 'IGVPO'
                                                        ? 'Infinite Galactic Voided Plasma Orb'
                                                        : ['P', 'N'].includes(data.star.type)
                                                            ? 'Degenerate Star'
                                                            : data.star.type === 'D'
                                                                ? 'White Dwarf Star'
                                                                : 'Main Sequence Star'}
                            </div>
                        </div>
                        <div class="celestial-object">
                            <div class="star type-${data.star.type.replace('MGTR', 'magnetar')}"
                                ${data.star.customColor ? `style="background-color: ${data.star.customColor};"` : ''}>
                            </div>
                            <div class="celestial-info">
                                <h4>${data.star.name}</h4>
                                <p>${data.star.type === 'QS' ? 'Quasi Star' : data.star.type === 'QK' ? 'Quark Star' : data.star.type === 'WH' ? 'White Hole' : data.star.type === 'WORM' ? 'Wormhole' : data.star.type === 'SC' ? 'Star Cluster' : data.star.type === 'NEB' ? 'Nebula' : data.star.type === 'GAL' ? 'Galaxy' : data.star.type === 'GF' ? 'Galactic Filament' : data.star.type === 'SV' ? 'Supervoid' : data.star.type === 'MGTR' ? 'Magnetar' : data.star.type === 'BD' ? 'Brown Dwarf' : data.star.type === 'HS' ? 'Hyper Star' : data.star.type === 'IGVPO' ? 'Infinite Galactic Voided Plasma Orb' : `${data.star.type}-class star`} 
                                <span class="rarity-indicator ${data.star.type === 'M' ? 'very-common' : ''}" 
                                      style="${data.star.type === 'M' ? '' : `background: ${rarityResult.rarityLevel.color}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`}"><span class="rarity-emoji">${rarityResult.rarityLevel.emoji}</span> ${rarityResult.rarityLevel.name}</span></p>
                                <p><span class="label">Temperature:</span> <span class="measurement">${data.star.type === 'IGVPO' ? '∞ K' : Number(data.star.temperature).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' K'}</span></p>
                                <p><span class="label">Mass:</span> <span class="measurement">${data.star.mass}</span></p>
                                <p><span class="label">Radius:</span> <span class="measurement">
                                    ${data.star.type === 'QS'
                                        ? `${(Number(data.star.radius) * 695700 / 149597870.7).toLocaleString(undefined, {maximumFractionDigits: 1})} AU`
                                        : data.star.type === 'SC'
                                            ? (() => {
                                                const radiusAu = Number(data.star.radius) * 695700 / 149597870.7;
                                                const lightYearAu = 63241.1;
                                                if (radiusAu >= lightYearAu) {
                                                    return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                                } else {
                                                    return `${radiusAu.toLocaleString(undefined, {maximumFractionDigits: 0})} AU`;
                                                }
                                            })()
                                        : data.star.type === 'NEB'
                                            ? (() => {
                                                const radiusAu = Number(data.star.radius) * 695700 / 149597870.7;
                                                const lightYearAu = 63241.1;
                                                return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 1})} ly`;
                                            })()
                                        : data.star.type === 'GAL'
                                            ? (() => {
                                                const radiusAu = Number(data.star.radius) * 695700 / 149597870.7;
                                                const lightYearAu = 63241.1;
                                                return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 1})} ly`;
                                            })()
                                        : data.star.type === 'GF'
                                            ? (() => {
                                                const radiusAu = Number(data.star.radius) * 695700 / 149597870.7;
                                                const lightYearAu = 63241.1;
                                                return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 1})} ly`;
                                            })()
                                        : data.star.type === 'SV'
                                            ? (() => {
                                                const radiusAu = Number(data.star.radius) * 695700 / 149597870.7;
                                                const lightYearAu = 63241.1;
                                                return `${(radiusAu / lightYearAu).toLocaleString(undefined, {maximumFractionDigits: 1})} ly`;
                                            })()
                                        : data.star.type === 'WORM'
                                            ? (() => {
                                                const radiusKm = Number(data.star.radius) * 695700;
                                                const lightYearKm = 9.461e12;
                                                if (radiusKm >= lightYearKm) {
                                                    return `${(radiusKm / lightYearKm).toLocaleString(undefined, {maximumFractionDigits: 2})} ly`;
                                                } else if (radiusKm >= 1000) {
                                                    return `${(radiusKm / 1000).toLocaleString(undefined, {maximumFractionDigits: 2})} km`;
                                                } else {
                                                    return `${(radiusKm * 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} m`;
                                                }
                                            })()
                                        : data.star.type === 'BD'
                                            ? `${(Number(data.star.radius) * 695700 / 71492).toLocaleString(undefined, {maximumFractionDigits: 2})} R♃`
                                            : data.star.type === 'HS'
                                                ? `${(Number(data.star.radius) * 695700 * 100).toLocaleString(undefined, {maximumFractionDigits: 2})} cm`
                                                : data.star.type === 'IGVPO'
                                                    ? '∞ R☉'
                                                    : ['P', 'N', 'MGTR', 'QK', 'WH'].includes(data.star.type)
                                                        ? `${(Number(data.star.radius) * 695700).toLocaleString(undefined, {maximumFractionDigits: 2})} km`
                                                        : `${Number(data.star.radius).toLocaleString(undefined, {maximumFractionDigits: 2})} R☉`}
                                </span></p>
                                <p><span class="label">Luminosity:</span> <span class="measurement">${data.star.type === 'IGVPO' ? '∞ L☉' : formatLuminosity(data.star.luminosity) + ' L☉'}</span></p>
                            </div>
                        </div>
                        <div class="planets-header">
                            <span class="planet-emoji">🪐</span> Planets
                        </div>
                        ${generatePlanetGrid(data.planets)}
                    </div>
                `;
                resultDiv.innerHTML = html;
                
                
                
                // Check for Egg Shaped Planets and handle special behavior
                const eggPlanets = document.querySelectorAll('[data-egg-planet="true"]');
                if (eggPlanets.length > 0) {
                    // Start explosion timers for Egg Shaped Planets after a short delay to ensure DOM is ready
                    setTimeout(() => {
                        startEggPlanetExplosionTimers();
                    }, 100);
                }
                
                // Always update rarity display, but keep cooldown reset for random generations only
                displayRarityInfo();
                
                if (isRandomGeneration) {
                    // Check if this is an Epic or better system and reset AFK cooldown
                    if (isEpicOrBetter(data.star.type) && isAFKOnCooldown()) {
                        clearAFKCooldown();
                        showCooldownResetNotification(data.star.name, rarityResult.rarityLevel);
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = `
                <p class="error">Failed to generate star system. Please try again.</p>
            `;
        }
    });

    document.getElementById('releases-btn').addEventListener('click', () => {
        const content = document.getElementById('releases-content');
        content.classList.toggle('hidden');
    });

    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const advancedElements = document.querySelectorAll('.advanced-only');
            const basicElements = document.querySelectorAll('.basic-only');
            const starTypeSelect = document.getElementById('star-type');

            if (button.dataset.view === 'advanced') {
                advancedElements.forEach(el => el.classList.remove('hidden'));
                basicElements.forEach(el => el.classList.add('hidden'));
                starTypeSelect.classList.add('hidden');
            } else {
                advancedElements.forEach(el => el.classList.add('hidden'));
                basicElements.forEach(el => el.classList.remove('hidden'));
                starTypeSelect.classList.remove('hidden');
            }
        });
    });

    // Color picker toggle logic
    document.getElementById('star-color-type').addEventListener('change', (e) => {
        const customColorPicker = document.getElementById('custom-color-picker');
        const starColor = document.getElementById('star-color');

        if (e.target.value === 'custom') {
            customColorPicker.classList.remove('hidden');
        } else {
            customColorPicker.classList.add('hidden');
            starColor.value = e.target.value;
        }
    });

    // Ensure correct initial state on page load
    const starTypeSelect = document.getElementById('star-type');
    starTypeSelect.classList.remove('hidden');

    // Reset discoveries function
    function resetDiscoveries() {
        const confirmation = prompt('⚠️ WARNING: This will permanently delete ALL your discoveries and saved systems!\n\nType "RESET" to confirm:');
        
        if (confirmation === 'RESET') {
            // Clear all discovery-related localStorage data
            localStorage.removeItem('spaceExplorerRarity');
            localStorage.removeItem('useSystemGenSeed');
            localStorage.removeItem('systemGenSeed');
            localStorage.removeItem('afkCooldownEndTime');
            localStorage.removeItem('afkSessionStartTime');
            localStorage.removeItem('afkPausedTime');
            
            // Reinitialize with fresh data
            initializeRarityTracking();
            displayRarityInfo();
            
            // Show confirmation message
            alert('✅ All discoveries and settings have been reset!');
        } else if (confirmation !== null) {
            alert('❌ Reset cancelled. You must type "RESET" exactly to confirm.');
        }
    }


    // Add event listener for teleport buttons using event delegation
    document.addEventListener('click', function(e) {
        if (e.target && e.target.getAttribute('data-action') === 'teleport') {
            teleportToRarestSystem();
        } else if (e.target && e.target.getAttribute('data-action') === 'teleport-saved') {
            const systemIndex = parseInt(e.target.getAttribute('data-system-index'));
            const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity'));
            if (rarityData.savedSystems && rarityData.savedSystems[systemIndex]) {
                teleportToSystem(rarityData.savedSystems[systemIndex]);
            }
        } else if (e.target && e.target.getAttribute('data-action') === 'toggle-saved-systems') {
            const rarityDisplay = document.getElementById('rarity-display');
            const currentShowAll = rarityDisplay.getAttribute('data-show-all') === 'true';
            rarityDisplay.setAttribute('data-show-all', (!currentShowAll).toString());
            displayRarityInfo();
        }
        // HYPER STAR SUBMIT BUTTON (COMMENTED OUT - Using Hyper Planets instead)
        // else if (e.target && e.target.id === 'submit-hyper-stars-btn') {
        //     submitHyperStars();
        // }
        // Submit Hyper Planets button (for world boss combat)
        else if (e.target && e.target.id === 'submit-hyper-planets-btn') {
            submitHyperPlanets();
        }
        // View Global Boss button
        else if (e.target && e.target.id === 'view-global-boss-btn') {
            window.location.href = '/world-boss';
        }
    });
});

// HYPER STAR SUBMIT FUNCTION (COMMENTED OUT - Using Hyper Planets instead for world boss)
// Function to handle submitting Hyper Stars to Global Boss
// async function submitHyperStars() {
//     const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity') || '{}');
//     const hyperStarCount = rarityData.hyperStarsFound || 0;
//     if (hyperStarCount === 0) {
//         alert('You need to find Hyper Stars first! Generate more systems to discover them.');
//         return;
//     }
//     
//     try {
//         console.log(`Submitting ${hyperStarCount} Hyper Stars to database!`);
//         
//         const response = await fetch('/api/hyper-stars/submit', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 hyper_stars_count: hyperStarCount
//             })
//         });
//         
//         if (response.ok) {
//             const result = await response.json();
//             console.log('Hyper stars submitted successfully:', result);
//             
//             // Reset the local count since they've been submitted
//             rarityData.hyperStarsFound = 0;
//             localStorage.setItem('spaceExplorerRarity', JSON.stringify(rarityData));
//             
//             // Update the display
//             updateLocalStatsDisplay();
//             
//             alert(`Successfully submitted ${hyperStarCount} Hyper Stars to your stats! Total: ${result.total_hyper_stars}`);
//         } else {
//             const error = await response.json();
//             console.error('Failed to submit hyper stars:', error);
//             alert(`Failed to submit hyper stars: ${error.error}`);
//         }
//     } catch (error) {
//         console.error('Error submitting hyper stars:', error);
//         alert('Failed to submit hyper stars. Please try again.');
//     }
// }

// Function to handle submitting Hyper Planets to Global Boss
async function submitHyperPlanets() {
    const rarityData = JSON.parse(localStorage.getItem('spaceExplorerRarity') || '{}');
    const hyperPlanetCount = rarityData.hyperPlanetsFound || 0;
    if (hyperPlanetCount === 0) {
        alert('You need to find Hyper Planets first! Generate more systems to discover them.');
        return;
    }
    
    try {
        console.log(`Submitting ${hyperPlanetCount} Hyper Planets to database!`);
        
        // Note: This endpoint may need to be updated on the backend to handle hyper_planets_count
        // For now, using the same endpoint but with different parameter name
        const response = await fetch('/api/hyper-planets/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hyper_planets_count: hyperPlanetCount
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Hyper planets submitted successfully:', result);
            
            // Reset the local count since they've been submitted
            rarityData.hyperPlanetsFound = 0;
            localStorage.setItem('spaceExplorerRarity', JSON.stringify(rarityData));
            
            // Update the display
            displayRarityInfo();
            
            alert(`Successfully submitted ${hyperPlanetCount} Hyper Planets to your stats! Total: ${result.total_hyper_planets || result.total}`);
        } else {
            const error = await response.json();
            console.error('Failed to submit hyper planets:', error);
            alert(`Failed to submit hyper planets: ${error.error}`);
        }
    } catch (error) {
        console.error('Error submitting hyper planets:', error);
        alert('Failed to submit hyper planets. Please try again.');
    }
}