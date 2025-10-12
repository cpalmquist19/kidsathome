// Space Auto Clicker Game - Basic Setup
// This file handles the game UI and basic interactions

// Number formatting system for large numbers (like Roblox)
function formatNumber(num) {
    // Handle very small numbers with precision control
    if (num < 1) {
        return num.toFixed(2);
    }
    
    // For numbers under 1000, show up to 2 decimal places but trim trailing zeros
    if (num < 1000) {
        return parseFloat(num.toFixed(2)).toString();
    }
    
    const suffixes = [
        '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Novg'
    ];
    
    const magnitude = Math.floor(Math.log10(num) / 3);
    const scaled = num / Math.pow(1000, magnitude);
    
    if (magnitude >= suffixes.length) {
        return '∞';
    }
    
    if (scaled >= 100) {
        return scaled.toFixed(0) + suffixes[magnitude];
    } else if (scaled >= 10) {
        return scaled.toFixed(1) + suffixes[magnitude];
    } else {
        return scaled.toFixed(2) + suffixes[magnitude];
    }
}

// Safe number addition to prevent overflow
function safeAdd(a, b) {
    const maxSafe = Number.MAX_SAFE_INTEGER;
    if (a > maxSafe || b > maxSafe) {
        // For very large numbers, use string manipulation or BigInt
        return Number(a) + Number(b);
    }
    return a + b;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the game
    initGame();
});

function initGame() {
    // Check if this is a page refresh (game state exists)
    const savedState = localStorage.getItem('spaceAutoClicker');
    
    if (savedState) {
        // Skip loading screen entirely on subsequent visits
        hideLoadingScreen();
        initModals();
        initUI();
        initGameState();
    } else {
        // Show loading screen only on first visit
        showLoadingScreen();
        simulateLoading();
        initModals();
        initUI();
        initGameState();
    }
}

// Loading Screen Functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function simulateLoading() {
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    
    const loadingSteps = [
        { progress: 20, text: 'Initializing game engine...' },
        { progress: 40, text: 'Loading star database...' },
        { progress: 60, text: 'Setting up UI components...' },
        { progress: 80, text: 'Preparing game world...' },
        { progress: 100, text: 'Ready to play!' }
    ];
    
    let currentStep = 0;
    
    const loadingInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            loadingProgress.style.width = step.progress + '%';
            loadingText.textContent = step.text;
            currentStep++;
        } else {
            clearInterval(loadingInterval);
            // Hide loading screen after a short delay
            setTimeout(() => {
                hideLoadingScreen();
            }, 500);
        }
    }, 800);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Add a small delay to prevent layout shift
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Force a reflow to ensure layout is stable
            document.body.offsetHeight;
        }, 50);
    }
}

// Modal Functions
function initModals() {
    // Settings Modal
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            showModal(settingsModal);
        });
    }
    
    if (closeSettings && settingsModal) {
        closeSettings.addEventListener('click', () => {
            hideModal(settingsModal);
        });
    }
    
    // Save Modal
    const saveBtn = document.getElementById('saveBtn');
    const saveModal = document.getElementById('saveModal');
    const closeSave = document.getElementById('closeSave');
    
    if (saveBtn && saveModal) {
        saveBtn.addEventListener('click', () => {
            showSaveModal();
        });
    }
    
    if (closeSave && saveModal) {
        closeSave.addEventListener('click', () => {
            hideModal(saveModal);
        });
    }
    
    // Upgrade Modal
    const upgradeModal = document.getElementById('upgradeModal');
    const closeUpgrade = document.getElementById('closeUpgrade');
    const confirmPurchase = document.getElementById('confirmPurchase');
    const cancelPurchase = document.getElementById('cancelPurchase');
    
    if (closeUpgrade && upgradeModal) {
        closeUpgrade.addEventListener('click', () => {
            hideModal(upgradeModal);
        });
    }
    
    if (cancelPurchase && upgradeModal) {
        cancelPurchase.addEventListener('click', () => {
            hideModal(upgradeModal);
        });
    }
    
    if (confirmPurchase) {
        confirmPurchase.addEventListener('click', () => {
            purchaseUpgrade();
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });
}

function showModal(modal) {
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

function hideModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function showSaveModal() {
    const saveModal = document.getElementById('saveModal');
    if (saveModal) {
        // Update save info with current game state
        updateSaveInfo();
        showModal(saveModal);
    }
}

function updateSaveInfo() {
    // Update save modal with current game state
    const saveStardust = document.getElementById('saveStardust');
    const saveStars = document.getElementById('saveStars');
    const saveClicks = document.getElementById('saveClicks');
    
    if (saveStardust) saveStardust.textContent = formatNumber(gameState.stardust);
    if (saveStars) saveStars.textContent = gameState.starsUnlocked;
    if (saveClicks) saveClicks.textContent = formatNumber(gameState.totalClicks);
}

// UI Initialization
function initUI() {
    // Initialize star collection
    initStarCollection();
    // Bind delegated click handler for upgrades
    initUpgradeDelegation();
    
    // Initialize central star click functionality
    initCentralStarClick();
    
    // Set initial star selection
    updateStarSelectionVisual();

    // Render system objects for the current system
    renderSystemObjects();
    
    // Initialize auto-clicker
    initAutoClicker();
}

function initStarCollection() {
    const starCollection = document.getElementById('starCollection');
    if (!starCollection) return;
    
    // Add initial stars
    // IMPORTANT: When adding new star systems, you MUST update BOTH:
    // 1. The stars array in this initStarCollection() function (around line 248)
    // 2. The stars array in getCurrentStar() function (around line 619)
    // If you only update one, clicking on new systems will redirect to the first system
    const stars = [
        { 
            id: 1, 
            name: 'Nmininix', 
            type: 'Brown Dwarf',
            description: 'A small, cool brown dwarf star. Generates 1 stardust per click.', 
            cost: 0, 
            unlocked: true, 
            icon: 'fas fa-star', 
            color: '#8B4513',
            image: '/static/images/NASA-BrownDwarf.jpg',
            stardustPerClick: 1,
            upgrades: [
                {
                    name: 'Nuclear Fusion',
                    description: 'Unlocks the next star',
                    cost: 100,
                    unlocked: false
                }
            ]
        },
        { 
            id: 2, 
            name: 'Phaenueanry', 
            type: 'Red Dwarf',
            description: 'A red dwarf star with higher energy output. Generates 1k stardust per click.', 
            cost: 100, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#DC143C',
            image: '/static/images/proxima-centauri.png',
            stardustPerClick: 1000,
            upgrades: [
                {
                    name: 'Add Mass',
                    description: 'Increases stellar mass and energy output',
                    cost: 250000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 3, 
            name: 'Bininc', 
            type: 'Orange Dwarf',
            description: 'A massive orange dwarf star with incredible energy output. Generates 1M stardust per click.', 
            cost: 250000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#FF8C00',
            image: '/static/images/orange-dwarf.png',
            stardustPerClick: 1000000,
            upgrades: [
                {
                    name: 'Add Mass',
                    description: 'Increases stellar mass and energy output',
                    cost: 500000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 4, 
            name: 'Nmorath', 
            type: 'Yellow Dwarf',
            description: 'A brilliant yellow dwarf star with massive energy output. Generates 1B stardust per click.', 
            cost: 500000000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#FFD700',
            image: '/static/images/yellow-dwarf.png',
            stardustPerClick: 1000000000,
            upgrades: [
                {
                    name: 'Add Mass',
                    description: 'Advances the star to the next evolutionary stage',
                    cost: 500000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 5, 
            name: 'Vonodrath', 
            type: 'White Star',
            description: 'A brilliant white star with incredible energy output. Generates 1T stardust per click.', 
            cost: 500000000000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#FFFFFF',
            image: '/static/images/white-star.png',
            stardustPerClick: 1000000000000,
            upgrades: [
                {
                    name: 'Add Mass',
                    description: 'Increases stellar mass and energy output',
                    cost: 500000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 6, 
            name: 'Organtoroth', 
            type: 'Blue Star',
            description: 'A massive blue star with extreme energy output. Generates 1Qa stardust per click.', 
            cost: 500000000000000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#3B82F6',
            image: '/static/images/blue-star.png',
            stardustPerClick: 1000000000000000,
            upgrades: [
                {
                    name: 'Unlock Extreme Objects',
                    description: 'Unlocks access to extreme stellar objects',
                    cost: 1000000000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 7, 
            name: 'Zxrion', 
            type: 'White Dwarf',
            description: 'A dense white dwarf star with incredible gravitational energy. Generates 1Qi stardust per click.', 
            cost: 1000000000000000000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#F8FAFC',
            image: '/static/images/white-dwarf.png',
            stardustPerClick: 1000000000000000000,
            upgrades: [
                {
                    name: 'Densify',
                    description: 'Increases stellar density and gravitational energy output',
                    cost: 1000000000000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 8, 
            name: 'Zyacrate', 
            type: 'Pulsar',
            description: 'A rapidly rotating pulsar with extreme magnetic fields. Generates 1Sx stardust per click.', 
            cost: 1000000000000000000000, 
            unlocked: false, 
            icon: 'fas fa-star', 
            color: '#8B5CF6',
            image: '/static/images/pulsar.png',
            stardustPerClick: 1000000000000000000000,
            upgrades: [
                {
                    name: 'Black Hole Collision',
                    description: 'Unlocks primordial black hole objects',
                    cost: 1000000000000000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 9, 
            name: 'Janix', 
            type: 'Black Hole',
            description: 'A massive black hole with incredible gravitational energy. Generates 1 Sp stardust per click.', 
            cost: 1000000000000000000000000, 
            unlocked: false, 
            icon: 'fas fa-circle', 
            color: '#000000',
            image: '/static/images/black_hole.jpg',
            stardustPerClick: 1000000000000000000000000,
            upgrades: [
                {
                    name: 'Add Mass',
                    description: 'Unlocks quasar objects',
                    cost: 1000000000000000000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 10, 
            name: 'Krakendith', 
            type: 'Super Massive Blackhole',
            description: 'A supermassive black hole with incredible gravitational energy. Generates 1 Oc stardust per click.', 
            cost: 1000000000000000000000000000, 
            unlocked: false, 
            icon: 'fas fa-circle', 
            color: '#000000',
            image: '/static/images/super_massive_black_hole.jpg',
            stardustPerClick: 1000000000000000000000000000,
            upgrades: [
                {
                    name: 'Activate Quasar',
                    description: 'Unlocks quasar objects',
                    cost: 1000000000000000000000000000000,
                    unlocked: false
                }
            ]
        },
        { 
            id: 11, 
            name: 'Gironix', 
            type: 'Quasar',
            description: 'A powerful quasar with extreme energy output. Generates 1 No stardust per click.', 
            cost: 1000000000000000000000000000000, 
            unlocked: false, 
            icon: 'fas fa-bolt', 
            color: '#8b5cf6',
            image: '/static/images/quasar.png',
            stardustPerClick: 1000000000000000000000000000000,
            upgrades: [
                {
                    name: 'Unlock Fictional Objects',
                    description: 'Unlocks fictional cosmic objects',
                    cost: 1e33,
                    unlocked: false
                }
            ]
        }
    ];
    
    stars.forEach(star => {
        const starElement = createStarElement(star);
        starCollection.appendChild(starElement);
    });
}

function createStarElement(star) {
    const starDiv = document.createElement('div');
    starDiv.className = `star-item ${star.unlocked ? '' : 'locked'}`;
    // Tag with star id for reliable event delegation
    starDiv.dataset.starId = String(star.id);
    
    // Create star image or icon
    const starImage = star.image ? 
        `<img src="${star.image}" alt="${star.name}" class="star-image" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
        `<div class="star-icon" style="color: ${star.color}"><i class="${star.icon}"></i></div>`;
    
    // Create upgrades section
    const upgradesHtml = star.upgrades && star.upgrades.length > 0 ? 
        `<div class="star-upgrades">
            ${star.upgrades.map(upgrade => `
                <div class="upgrade-item-small ${upgrade.unlocked ? 'unlocked' : 'locked'}" data-upgrade-name="${upgrade.name}" data-upgrade-cost="${upgrade.cost}" data-upgrade-description="${upgrade.description}">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-cost">${formatNumber(upgrade.cost)} stardust required</span>
                </div>
            `).join('')}
        </div>` : '';
    
    starDiv.innerHTML = `
        ${starImage}
        <div class="star-info">
            <div class="star-name">${star.name}</div>
            <div class="star-type">${star.type}</div>
            <div class="star-description">${star.description}</div>
            <div class="star-production">${formatNumber(star.stardustPerClick)} stardust per click</div>
            ${!star.unlocked ? `<div class="star-cost">Requires: ${formatNumber(star.cost)} stardust</div>` : ''}
            ${upgradesHtml}
        </div>
    `;
    
    if (star.unlocked) {
        starDiv.addEventListener('click', (e) => {
            selectStar(star.id);
        });
        
        // Add click handlers for upgrades
        const upgradeItems = starDiv.querySelectorAll('.upgrade-item-small');
        upgradeItems.forEach(upgradeItem => {
            upgradeItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent star selection
                const upgradeName = upgradeItem.dataset.upgradeName;
                const upgradeCost = upgradeItem.dataset.upgradeCost;
                const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
            });
        });
    }
    
    return starDiv;
}

// Robust upgrade click handling via event delegation
function initUpgradeDelegation() {
    const starCollection = document.getElementById('starCollection');
    if (!starCollection || starCollection.dataset.delegationBound) {
        return;
    }
    starCollection.addEventListener('click', (e) => {
        const upgradeItem = e.target && e.target.closest ? e.target.closest('.upgrade-item-small') : null;
        if (!upgradeItem || !starCollection.contains(upgradeItem)) {
            return;
        }
        e.stopPropagation();
        const starElement = upgradeItem.closest('.star-item');
        const starId = starElement && starElement.dataset && starElement.dataset.starId ? parseInt(starElement.dataset.starId, 10) : null;
        const upgradeName = upgradeItem.dataset.upgradeName;
        if (!upgradeName) {
            return;
        }
        // Prevent modal if already unlocked
        if (starId && gameState.starSystems[starId] && gameState.starSystems[starId].upgrades && gameState.starSystems[starId].upgrades[upgradeName]) {
            return;
        }
        const upgradeCost = upgradeItem.dataset.upgradeCost;
        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
        console.log('Delegated handler: showing upgrade modal for', upgradeName);
        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
    });
    starCollection.dataset.delegationBound = 'true';
}

// Central Star Click Functionality
function initCentralStarClick() {
    const centralStar = document.getElementById('centralStar');
    const starImage = document.getElementById('starImage');
    
    if (centralStar && starImage) {
        // Add click event to the star image
        starImage.addEventListener('click', function(e) {
            e.preventDefault();
            clickStar();
        });
        
        // Add touch events for mobile/iPad
        starImage.addEventListener('touchstart', function(e) {
            e.preventDefault();
            // Add visual feedback for touch
            this.style.transform = 'scale(0.95)';
        });
        
        starImage.addEventListener('touchend', function(e) {
            e.preventDefault();
            clickStar();
            // Reset visual feedback
            this.style.transform = 'scale(1)';
        });
        
        starImage.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            // Reset visual feedback if touch is cancelled
            this.style.transform = 'scale(1)';
        });
        
        // Add hover effects (desktop only)
        starImage.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) { // Only on desktop
                this.style.cursor = 'pointer';
            }
        });
        
        starImage.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) { // Only on desktop
                this.style.cursor = 'default';
            }
        });
    }
}

function clickStar() {
    // Get current star data
    const currentStar = getCurrentStar();
    if (!currentStar) return;
    
    // Calculate stardust gained
    const stardustGained = currentStar.stardustPerClick;
    
    // Update game state
    gameState.stardust += stardustGained;
    gameState.totalClicks++;
    gameState.totalStardustEarned += stardustGained;
    
    // Update UI
    updateUI();
    
    // Create visual feedback
    createClickEffect(stardustGained);
    
    // Play click sound (placeholder)
    playClickSound();
    
    // Auto-save every 10 clicks
    if (gameState.totalClicks % 10 === 0) {
        saveGame();
    }
}

function getCurrentStar() {
    // Return the currently selected star
    // IMPORTANT: When adding new star systems, you MUST update BOTH:
    // 1. The stars array in initStarCollection() function (around line 248)
    // 2. The stars array in this getCurrentStar() function (around line 619)
    // If you only update one, clicking on new systems will redirect to the first system
    const stars = [
        { 
            id: 1, 
            name: 'Nmininix', 
            type: 'Brown Dwarf',
            stardustPerClick: 1,
            image: '/static/images/NASA-BrownDwarf.jpg'
        },
        { 
            id: 2, 
            name: 'Phaenueanry', 
            type: 'Red Dwarf',
            stardustPerClick: 1000,
            image: '/static/images/proxima-centauri.png'
        },
        { 
            id: 3, 
            name: 'Bininc', 
            type: 'Orange Dwarf',
            stardustPerClick: 1000000,
            image: '/static/images/orange-dwarf.png'
        },
        { 
            id: 4, 
            name: 'Nmorath', 
            type: 'Yellow Dwarf',
            stardustPerClick: 1000000000,
            image: '/static/images/yellow-dwarf.png'
        },
        { 
            id: 5, 
            name: 'Vonodrath', 
            type: 'White Star',
            stardustPerClick: 1000000000000,
            image: '/static/images/white-star.png'
        },
        { 
            id: 6, 
            name: 'Organtoroth', 
            type: 'Blue Star',
            stardustPerClick: 1000000000000000,
            image: '/static/images/blue-star.png'
        },
        { 
            id: 7, 
            name: 'Zxrion', 
            type: 'White Dwarf',
            stardustPerClick: 1000000000000000000,
            image: '/static/images/white-dwarf.png'
        },
        { 
            id: 8, 
            name: 'Zyacrate', 
            type: 'Pulsar',
            stardustPerClick: 1000000000000000000000,
            image: '/static/images/pulsar.png'
        },
        { 
            id: 9, 
            name: 'Janix', 
            type: 'Black Hole',
            stardustPerClick: 1000000000000000000000000,
            image: '/static/images/black_hole.jpg'
        },
        { 
            id: 10, 
            name: 'Krakendith', 
            type: 'Super Massive Blackhole',
            stardustPerClick: 1000000000000000000000000000,
            image: '/static/images/super_massive_black_hole.jpg'
        },
        { 
            id: 11, 
            name: 'Gironix', 
            type: 'Quasar',
            stardustPerClick: 1000000000000000000000000000000,
            image: '/static/images/quasar.png'
        }
    ];
    
    // Find the selected star
    const selectedStar = stars.find(star => star.id === gameState.selectedStar);
    
    // Check if the selected star is unlocked
    if (selectedStar && gameState.starSystems[selectedStar.id] && gameState.starSystems[selectedStar.id].unlocked) {
        return selectedStar;
    }
    
    // Fallback to the first unlocked star
    for (const star of stars) {
        if (gameState.starSystems[star.id] && gameState.starSystems[star.id].unlocked) {
            // Update selected star to the first unlocked one
            gameState.selectedStar = star.id;
            return star;
        }
    }
    
    // Ultimate fallback
    return stars[0];
}

function createClickEffect(stardustGained) {
    const starImage = document.getElementById('starImage');
    if (!starImage) return;
    
    // Create floating text effect
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${formatNumber(stardustGained)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fbbf24;
        font-size: 2.5rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
        animation: floatUp 1s ease-out forwards;
    `;
    
    // Add to star container
    const starContainer = starImage.parentElement;
    starContainer.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
    
    // Add star click animation
    starImage.style.transform = 'scale(0.95)';
    setTimeout(() => {
        starImage.style.transform = 'scale(1)';
    }, 100);
}

function createAsteroidTickEffect(asteroidElement, amount) {
    if (!asteroidElement) {
        return;
    }
    
    // Create floating text effect for asteroid
    const effect = document.createElement('div');
    effect.className = 'asteroid-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fbbf24;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
        animation: asteroidFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(251, 191, 36, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to asteroid element
    asteroidElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createCometTickEffect(cometElement, amount) {
    if (!cometElement) {
        return;
    }
    
    // Create floating text effect for comet
    const effect = document.createElement('div');
    effect.className = 'comet-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #60a5fa;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(96, 165, 250, 0.8);
        animation: cometFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(96, 165, 250, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to comet element
    cometElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createDwarfPlanetTickEffect(dwarfPlanetElement, amount) {
    if (!dwarfPlanetElement) {
        return;
    }
    
    // Create floating text effect for dwarf planet
    const effect = document.createElement('div');
    effect.className = 'dwarf-planet-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #8B5CF6;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
        animation: dwarfPlanetFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(139, 92, 246, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to dwarf planet element
    dwarfPlanetElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createHabitablePlanetTickEffect(habitablePlanetElement, amount) {
    if (!habitablePlanetElement) {
        return;
    }
    
    // Create floating text effect for habitable planet
    const effect = document.createElement('div');
    effect.className = 'habitable-planet-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #10B981;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        animation: habitablePlanetFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(16, 185, 129, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to habitable planet element
    habitablePlanetElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createBinaryIceGiantTickEffect(binaryIceGiantElement, amount) {
    if (!binaryIceGiantElement) {
        return;
    }
    
    // Create floating text effect for Binary Ice Giant
    const effect = document.createElement('div');
    effect.className = 'binary-ice-giant-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #60A5FA;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(96, 165, 250, 0.8);
        animation: binaryIceGiantFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(96, 165, 250, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Binary Ice Giant element
    binaryIceGiantElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createGasGiantTickEffect(gasGiantElement, amount) {
    if (!gasGiantElement) {
        return;
    }
    
    // Create floating text effect for Gas Giant
    const effect = document.createElement('div');
    effect.className = 'gas-giant-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #F59E0B;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
        animation: gasGiantFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(245, 158, 11, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Gas Giant element
    gasGiantElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createNeutronStarTickEffect(neutronStarElement, amount) {
    if (!neutronStarElement) {
        return;
    }
    
    // Create floating text effect for Neutron Star
    const effect = document.createElement('div');
    effect.className = 'neutron-star-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #8B5CF6;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
        animation: neutronStarFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(139, 92, 246, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Neutron Star element
    neutronStarElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createBinaryGasGiantTickEffect(binaryGasGiantElement, amount) {
    if (!binaryGasGiantElement) {
        return;
    }
    
    // Create floating text effect for Binary Gas Giant
    const effect = document.createElement('div');
    effect.className = 'binary-gas-giant-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #F59E0B;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
        animation: binaryGasGiantFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(245, 158, 11, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Binary Gas Giant element
    binaryGasGiantElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createPrimordialBlackHoleTickEffect(primordialBlackHoleElement, amount) {
    if (!primordialBlackHoleElement) {
        return;
    }
    
    // Create floating text effect for Primordial Black Hole
    const effect = document.createElement('div');
    effect.className = 'primordial-black-hole-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #000000;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(139, 69, 19, 0.8);
        animation: primordialBlackHoleFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(139, 69, 19, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Primordial Black Hole element
    primordialBlackHoleElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createElement118AtomTickEffect(element118AtomElement, amount) {
    if (!element118AtomElement) {
        return;
    }
    
    // Create floating text effect for Element 118 Atom
    const effect = document.createElement('div');
    effect.className = 'element118-atom-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #FF00FF;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(255, 0, 255, 0.8);
        animation: element118AtomFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 0, 255, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Element 118 Atom element
    element118AtomElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createWolfRayetStarTickEffect(wolfRayetStarElement, amount) {
    if (!wolfRayetStarElement) {
        return;
    }
    
    // Create floating text effect for Wolf-Rayet Star
    const effect = document.createElement('div');
    effect.className = 'wolf-rayet-star-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #FFA500;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(255, 165, 0, 0.8);
        animation: wolfRayetStarFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 165, 0, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Wolf-Rayet Star element
    wolfRayetStarElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function createElement118PlanetTickEffect(element118PlanetElement, amount) {
    if (!element118PlanetElement) {
        return;
    }
    
    // Create floating text effect for Element 118 Planet
    const effect = document.createElement('div');
    effect.className = 'element118-planet-tick-effect';
    effect.textContent = `+${formatNumber(amount)}`;
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00FFFF;
        font-size: 1.2rem;
        font-weight: bold;
        pointer-events: none;
        z-index: 1000;
        text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
        animation: element118PlanetFloatUp 1s ease-out forwards;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(0, 255, 255, 0.5);
        border-radius: 4px;
        padding: 2px 6px;
    `;
    
    // Add to Element 118 Planet element
    element118PlanetElement.appendChild(effect);
    
    // Remove after animation
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 1000);
}

function playClickSound() {
    // Placeholder for click sound
}

// Game State Management
let gameState = {
    // Player Resources
    stardust: 0,
    totalClicks: 0,
    clicksPerSecond: 0,
    
    // Star Systems
    starsUnlocked: 1,
    selectedStar: 1,
    starSystems: {
        1: { // Nmininix
            unlocked: true,
            upgrades: {
                'Nuclear Fusion': false
            },
            objects: {
                asteroids: 5,
                asteroidRatePerSecond: 0.01
            }
        },
        2: { // Phaenueanry
            unlocked: false,
            upgrades: {
                'Add Mass': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 5,
                cometRatePerSecond: 10
            }
        },
        3: { // Bininc
            unlocked: false,
            upgrades: {
                'Add Mass': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 1,
                dwarfPlanetRatePerSecond: 250
            }
        },
        4: { // Nmorath
            unlocked: false,
            upgrades: {
                'Add Mass': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 1,
                habitablePlanetRatePerSecond: 50000000
            }
        },
        5: { // Vonodrath
            unlocked: false,
            upgrades: {
                'Add Mass': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 1,
                binaryIceGiantRatePerSecond: 250000000000
            }
        },
        6: { // Organtoroth
            unlocked: false,
            upgrades: {
                'Unlock Extreme Objects': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 1,
                gasGiantRatePerSecond: 500000000000000
            }
        },
        7: { // Zxrion
            unlocked: false,
            upgrades: {
                'Densify': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 0,
                gasGiantRatePerSecond: 10,
                neutronStars: 0,
                neutronStarRatePerSecond: 10,
                binaryGasGiants: 4,
                binaryGasGiantRatePerSecond: 50000000000000000
            }
        },
        8: { // Zyacrate
            unlocked: false,
            upgrades: {
                'Black Hole Collision': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 0,
                gasGiantRatePerSecond: 10,
                neutronStars: 0,
                neutronStarRatePerSecond: 10,
                binaryGasGiants: 0,
                binaryGasGiantRatePerSecond: 10,
                primordialBlackHoles: 1,
                primordialBlackHoleRatePerSecond: 500000000000000000000
            }
        },
        9: { // Janix
            unlocked: false,
            upgrades: {
                'Add Mass': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 0,
                gasGiantRatePerSecond: 10,
                neutronStars: 0,
                neutronStarRatePerSecond: 10,
                binaryGasGiants: 0,
                binaryGasGiantRatePerSecond: 10,
                primordialBlackHoles: 0,
                primordialBlackHoleRatePerSecond: 10,
                element118Atoms: 1,
                element118AtomRatePerSecond: 1000000000000000000000000000
            }
        },
        10: { // Krakendith
            unlocked: false,
            upgrades: {
                'Activate Quasar': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 0,
                gasGiantRatePerSecond: 10,
                neutronStars: 0,
                neutronStarRatePerSecond: 10,
                binaryGasGiants: 0,
                binaryGasGiantRatePerSecond: 10,
                primordialBlackHoles: 0,
                primordialBlackHoleRatePerSecond: 10,
                element118Atoms: 0,
                element118AtomRatePerSecond: 10,
                wolfRayetStars: 1,
                wolfRayetStarRatePerSecond: 500000000000000000000000000
            }
        },
        11: { // Gironix
            unlocked: false,
            upgrades: {
                'Unlock Fictional Objects': false
            },
            objects: {
                asteroids: 0,
                asteroidRatePerSecond: 1,
                comets: 0,
                cometRatePerSecond: 10,
                dwarfPlanets: 0,
                dwarfPlanetRatePerSecond: 10,
                habitablePlanets: 0,
                habitablePlanetRatePerSecond: 10,
                binaryIceGiants: 0,
                binaryIceGiantRatePerSecond: 10,
                gasGiants: 0,
                gasGiantRatePerSecond: 10,
                neutronStars: 0,
                neutronStarRatePerSecond: 10,
                binaryGasGiants: 0,
                binaryGasGiantRatePerSecond: 10,
                primordialBlackHoles: 0,
                primordialBlackHoleRatePerSecond: 10,
                element118Atoms: 0,
                element118AtomRatePerSecond: 10,
                wolfRayetStars: 0,
                wolfRayetStarRatePerSecond: 10,
                element118Planets: 1,
                element118PlanetRatePerSecond: 500000000000000000000000000000
            }
        }
    },
    
    // Game Settings
    autoClickerActive: false,
    autoClickerInterval: null,
    autoClickerRate: 'ultra', // 'slow', 'normal', 'fast', 'ultra', 'insane', 'ludicrous'
    autoClickerClicksPerMinute: 0,
    totalAutoClicks: 0,
    soundEnabled: true,
    particlesEnabled: true,
    autoSaveEnabled: true,
    
    // Game Statistics
    totalStardustEarned: 0,
    timePlayed: 0,
    lastSaveTime: Date.now(),
    
    // Version for save compatibility
    saveVersion: '1.0'
};

function initGameState() {
    // Load saved game state if available
    loadGame();
    
    // Start the game loop
    startGameLoop();

    // Start auto-generation loop for system objects
    startAutoGenerators();
}

function startGameLoop() {
    // Update UI every second
    setInterval(() => {
        updateUI();
    }, 1000);
    
    // Auto-save every 30 seconds
    setInterval(() => {
        saveGame();
    }, 30000);
}

// Auto-generators (e.g., asteroids) loop
let autoGeneratorInterval = null;
function startAutoGenerators() {
    if (autoGeneratorInterval) {
        clearInterval(autoGeneratorInterval);
    }
    autoGeneratorInterval = setInterval(() => {
        applyAutoGeneration();
    }, 1000);
}

function applyAutoGeneration() {
    const currentSystem = gameState.starSystems[gameState.selectedStar];
    if (!currentSystem) return;
    
    let totalGenerated = 0;
    const panel = document.getElementById('systemObjectsPanel');
    
    // Asteroids generate stardust per second
    const numAsteroids = (currentSystem.objects && currentSystem.objects.asteroids) ? currentSystem.objects.asteroids : 0;
    const asteroidRatePerSecond = (currentSystem.objects && currentSystem.objects.asteroidRatePerSecond) ? currentSystem.objects.asteroidRatePerSecond : 0;
    const asteroidGenerated = numAsteroids * asteroidRatePerSecond;
    
    if (asteroidGenerated > 0) {
        totalGenerated += asteroidGenerated;
        
        // Trigger floating effect for each asteroid
        if (panel) {
            for (let i = 0; i < numAsteroids; i++) {
                const asteroidElement = panel.querySelector(`[data-asteroid-index="${i}"]`);
                if (asteroidElement) {
                    createAsteroidTickEffect(asteroidElement, asteroidRatePerSecond);
                }
            }
        }
    }
    
    // Comets generate stardust per second
    const numComets = (currentSystem.objects && currentSystem.objects.comets) ? currentSystem.objects.comets : 0;
    const cometRatePerSecond = (currentSystem.objects && currentSystem.objects.cometRatePerSecond) ? currentSystem.objects.cometRatePerSecond : 0;
    const cometGenerated = numComets * cometRatePerSecond;
    
    if (cometGenerated > 0) {
        totalGenerated += cometGenerated;
        
        // Trigger floating effect for each comet
        if (panel) {
            for (let i = 0; i < numComets; i++) {
                const cometElement = panel.querySelector(`[data-comet-index="${i}"]`);
                if (cometElement) {
                    createCometTickEffect(cometElement, cometRatePerSecond);
                }
            }
        }
    }
    
    // Dwarf planets generate stardust per second
    const numDwarfPlanets = (currentSystem.objects && currentSystem.objects.dwarfPlanets) ? currentSystem.objects.dwarfPlanets : 0;
    const dwarfPlanetRatePerSecond = (currentSystem.objects && currentSystem.objects.dwarfPlanetRatePerSecond) ? currentSystem.objects.dwarfPlanetRatePerSecond : 0;
    const dwarfPlanetGenerated = numDwarfPlanets * dwarfPlanetRatePerSecond;
    
    if (dwarfPlanetGenerated > 0) {
        totalGenerated += dwarfPlanetGenerated;
        
        // Trigger floating effect for each dwarf planet
        if (panel) {
            for (let i = 0; i < numDwarfPlanets; i++) {
                const dwarfPlanetElement = panel.querySelector(`[data-dwarf-planet-index="${i}"]`);
                if (dwarfPlanetElement) {
                    createDwarfPlanetTickEffect(dwarfPlanetElement, dwarfPlanetRatePerSecond);
                }
            }
        }
    }
    
    // Habitable planets generate stardust per second
    const numHabitablePlanets = (currentSystem.objects && currentSystem.objects.habitablePlanets) ? currentSystem.objects.habitablePlanets : 0;
    const habitablePlanetRatePerSecond = (currentSystem.objects && currentSystem.objects.habitablePlanetRatePerSecond) ? currentSystem.objects.habitablePlanetRatePerSecond : 0;
    const habitablePlanetGenerated = numHabitablePlanets * habitablePlanetRatePerSecond;
    
    if (habitablePlanetGenerated > 0) {
        totalGenerated += habitablePlanetGenerated;
        
        // Trigger floating effect for each habitable planet
        if (panel) {
            for (let i = 0; i < numHabitablePlanets; i++) {
                const habitablePlanetElement = panel.querySelector(`[data-habitable-planet-index="${i}"]`);
                if (habitablePlanetElement) {
                    createHabitablePlanetTickEffect(habitablePlanetElement, habitablePlanetRatePerSecond);
                }
            }
        }
    }
    
    // Binary Ice Giants generate stardust per second
    const numBinaryIceGiants = (currentSystem.objects && currentSystem.objects.binaryIceGiants) ? currentSystem.objects.binaryIceGiants : 0;
    const binaryIceGiantRatePerSecond = (currentSystem.objects && currentSystem.objects.binaryIceGiantRatePerSecond) ? currentSystem.objects.binaryIceGiantRatePerSecond : 0;
    const binaryIceGiantGenerated = numBinaryIceGiants * binaryIceGiantRatePerSecond;
    
    if (binaryIceGiantGenerated > 0) {
        totalGenerated += binaryIceGiantGenerated;
        
        // Trigger floating effect for each Binary Ice Giant
        if (panel) {
            for (let i = 0; i < numBinaryIceGiants; i++) {
                const binaryIceGiantElement = panel.querySelector(`[data-binary-ice-giant-index="${i}"]`);
                if (binaryIceGiantElement) {
                    createBinaryIceGiantTickEffect(binaryIceGiantElement, binaryIceGiantRatePerSecond);
                }
            }
        }
    }
    
    // Gas Giants generate stardust per second
    const numGasGiants = (currentSystem.objects && currentSystem.objects.gasGiants) ? currentSystem.objects.gasGiants : 0;
    const gasGiantRatePerSecond = (currentSystem.objects && currentSystem.objects.gasGiantRatePerSecond) ? currentSystem.objects.gasGiantRatePerSecond : 0;
    const gasGiantGenerated = numGasGiants * gasGiantRatePerSecond;
    
    if (gasGiantGenerated > 0) {
        totalGenerated += gasGiantGenerated;
        
        // Trigger floating effect for each Gas Giant
        if (panel) {
            for (let i = 0; i < numGasGiants; i++) {
                const gasGiantElement = panel.querySelector(`[data-gas-giant-index="${i}"]`);
                if (gasGiantElement) {
                    createGasGiantTickEffect(gasGiantElement, gasGiantRatePerSecond);
                }
            }
        }
    }
    
    // Neutron Stars generate stardust per second
    const numNeutronStars = (currentSystem.objects && currentSystem.objects.neutronStars) ? currentSystem.objects.neutronStars : 0;
    const neutronStarRatePerSecond = (currentSystem.objects && currentSystem.objects.neutronStarRatePerSecond) ? currentSystem.objects.neutronStarRatePerSecond : 0;
    const neutronStarGenerated = numNeutronStars * neutronStarRatePerSecond;
    
    if (neutronStarGenerated > 0) {
        totalGenerated += neutronStarGenerated;
        
        // Trigger floating effect for each Neutron Star
        if (panel) {
            for (let i = 0; i < numNeutronStars; i++) {
                const neutronStarElement = panel.querySelector(`[data-neutron-star-index="${i}"]`);
                if (neutronStarElement) {
                    createNeutronStarTickEffect(neutronStarElement, neutronStarRatePerSecond);
                }
            }
        }
    }
    
    // Binary Gas Giants generate stardust per second
    const numBinaryGasGiants = (currentSystem.objects && currentSystem.objects.binaryGasGiants) ? currentSystem.objects.binaryGasGiants : 0;
    const binaryGasGiantRatePerSecond = (currentSystem.objects && currentSystem.objects.binaryGasGiantRatePerSecond) ? currentSystem.objects.binaryGasGiantRatePerSecond : 0;
    const binaryGasGiantGenerated = numBinaryGasGiants * binaryGasGiantRatePerSecond;
    
    if (binaryGasGiantGenerated > 0) {
        totalGenerated += binaryGasGiantGenerated;
        
        // Trigger floating effect for each Binary Gas Giant
        if (panel) {
            for (let i = 0; i < numBinaryGasGiants; i++) {
                const binaryGasGiantElement = panel.querySelector(`[data-binary-gas-giant-index="${i}"]`);
                if (binaryGasGiantElement) {
                    createBinaryGasGiantTickEffect(binaryGasGiantElement, binaryGasGiantRatePerSecond);
                }
            }
        }
    }
    
    // Primordial Black Holes generate stardust per second
    const numPrimordialBlackHoles = (currentSystem.objects && currentSystem.objects.primordialBlackHoles) ? currentSystem.objects.primordialBlackHoles : 0;
    const primordialBlackHoleRatePerSecond = (currentSystem.objects && currentSystem.objects.primordialBlackHoleRatePerSecond) ? currentSystem.objects.primordialBlackHoleRatePerSecond : 0;
    const primordialBlackHoleGenerated = numPrimordialBlackHoles * primordialBlackHoleRatePerSecond;
    
    if (primordialBlackHoleGenerated > 0) {
        totalGenerated += primordialBlackHoleGenerated;
        
        // Trigger floating effect for each Primordial Black Hole
        if (panel) {
            for (let i = 0; i < numPrimordialBlackHoles; i++) {
                const primordialBlackHoleElement = panel.querySelector(`[data-primordial-black-hole-index="${i}"]`);
                if (primordialBlackHoleElement) {
                    createPrimordialBlackHoleTickEffect(primordialBlackHoleElement, primordialBlackHoleRatePerSecond);
                }
            }
        }
    }
    
    // Element 118 Atoms generate stardust per second
    const numElement118Atoms = (currentSystem.objects && currentSystem.objects.element118Atoms) ? currentSystem.objects.element118Atoms : 0;
    const element118AtomRatePerSecond = (currentSystem.objects && currentSystem.objects.element118AtomRatePerSecond) ? currentSystem.objects.element118AtomRatePerSecond : 0;
    const element118AtomGenerated = numElement118Atoms * element118AtomRatePerSecond;
    
    if (element118AtomGenerated > 0) {
        totalGenerated += element118AtomGenerated;
        
        // Trigger floating effect for each Element 118 Atom
        if (panel) {
            for (let i = 0; i < numElement118Atoms; i++) {
                const element118AtomElement = panel.querySelector(`[data-element118-atom-index="${i}"]`);
                if (element118AtomElement) {
                    createElement118AtomTickEffect(element118AtomElement, element118AtomRatePerSecond);
                }
            }
        }
    }
    
    // Wolf-Rayet Stars generate stardust per second
    const numWolfRayetStars = (currentSystem.objects && currentSystem.objects.wolfRayetStars) ? currentSystem.objects.wolfRayetStars : 0;
    const wolfRayetStarRatePerSecond = (currentSystem.objects && currentSystem.objects.wolfRayetStarRatePerSecond) ? currentSystem.objects.wolfRayetStarRatePerSecond : 0;
    const wolfRayetStarGenerated = numWolfRayetStars * wolfRayetStarRatePerSecond;
    
    if (wolfRayetStarGenerated > 0) {
        totalGenerated += wolfRayetStarGenerated;
        
        // Trigger floating effect for each Wolf-Rayet Star
        if (panel) {
            for (let i = 0; i < numWolfRayetStars; i++) {
                const wolfRayetStarElement = panel.querySelector(`[data-wolf-rayet-star-index="${i}"]`);
                if (wolfRayetStarElement) {
                    createWolfRayetStarTickEffect(wolfRayetStarElement, wolfRayetStarRatePerSecond);
                }
            }
        }
    }
    
    // Element 118 Planets generate stardust per second
    const numElement118Planets = (currentSystem.objects && currentSystem.objects.element118Planets) ? currentSystem.objects.element118Planets : 0;
    const element118PlanetRatePerSecond = (currentSystem.objects && currentSystem.objects.element118PlanetRatePerSecond) ? currentSystem.objects.element118PlanetRatePerSecond : 0;
    const element118PlanetGenerated = numElement118Planets * element118PlanetRatePerSecond;
    
    if (element118PlanetGenerated > 0) {
        totalGenerated += element118PlanetGenerated;
        
        // Trigger floating effect for each Element 118 Planet
        if (panel) {
            for (let i = 0; i < numElement118Planets; i++) {
                const element118PlanetElement = panel.querySelector(`[data-element118-planet-index="${i}"]`);
                if (element118PlanetElement) {
                    createElement118PlanetTickEffect(element118PlanetElement, element118PlanetRatePerSecond);
                }
            }
        }
    }
    
    if (totalGenerated > 0) {
        gameState.stardust += totalGenerated;
        gameState.totalStardustEarned += totalGenerated;
        updateUI();
    }
}

function updateUI() {
    // Update navigation stats
    const stardustDisplay = document.getElementById('stardustDisplay');
    const starsUnlocked = document.getElementById('starsUnlocked');
    const clicksPerSecond = document.getElementById('clicksPerSecond');
    
    // Update stardust display with spinner replacement
    const stardustAmount = document.getElementById('stardustAmount');
    
    if (stardustDisplay) stardustDisplay.textContent = formatNumber(gameState.stardust);
    if (starsUnlocked) starsUnlocked.textContent = gameState.starsUnlocked;
    if (clicksPerSecond) clicksPerSecond.textContent = gameState.clicksPerSecond;
    if (stardustAmount) {
        // Replace spinner with actual stardust count
        stardustAmount.innerHTML = formatNumber(gameState.stardust);
    }

    // Optionally reflect auto-generators in the UI later
}

// Game Actions
function selectStar(starId) {
    // Check if the star is unlocked
    if (!gameState.starSystems[starId] || !gameState.starSystems[starId].unlocked) {
        return;
    }
    
    gameState.selectedStar = starId;
    
    // Update the central star display
    updateCentralStarDisplay();
    
    // Update visual selection in star collection
    updateStarSelectionVisual();
    
    // Save game after star selection
    saveGame();
}

function updateCentralStarDisplay() {
    const currentStar = getCurrentStar();
    
    // Update star image
    const starImage = document.getElementById('starImage');
    if (starImage) {
        starImage.src = currentStar.image;
        starImage.alt = currentStar.name;
    }
    
    // Update star info
    const starNameCentral = document.getElementById('starNameCentral');
    const starTypeCentral = document.getElementById('starTypeCentral');
    const starProductionCentral = document.getElementById('starProductionCentral');
    
    if (starNameCentral) {
        starNameCentral.textContent = currentStar.name;
    }
    if (starTypeCentral) {
        starTypeCentral.textContent = currentStar.type;
    }
    if (starProductionCentral) {
        starProductionCentral.textContent = `${formatNumber(currentStar.stardustPerClick)} stardust per click`;
    }

    // Re-render system objects panel when switching systems
    renderSystemObjects();
}

function updateStarSelectionVisual() {
    // Remove selection from all stars
    const starElements = document.querySelectorAll('.star-item');
    starElements.forEach(element => {
        element.classList.remove('selected');
    });
    
    // Add selection to current star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        
        // Use a more robust way to find the selected star element
        const selectedStarElement = Array.from(starElements).find((element, index) => {
            // Check if this is the selected star by looking at the star data
            const starId = index + 1; // Star IDs are 1-based
            return starId === gameState.selectedStar;
        });
        
        if (selectedStarElement) {
            selectedStarElement.classList.add('selected');
            
            // Scroll the selected star to the top of the panel
            scrollStarToTop(selectedStarElement);
        }
    }
}

// Render the right panel with system objects
function renderSystemObjects() {
    const panel = document.getElementById('systemObjectsPanel');
    if (!panel) {
        console.log('System objects panel not found');
        return;
    }
    panel.innerHTML = '';
    const currentSystem = gameState.starSystems[gameState.selectedStar];
    if (!currentSystem) {
        console.log('Current system not found for star:', gameState.selectedStar);
        return;
    }
    
    console.log('Rendering system objects for star:', gameState.selectedStar);
    console.log('Current system objects:', currentSystem.objects);
    
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    
    // Show each asteroid as a separate item
    const numAsteroids = currentSystem.objects && typeof currentSystem.objects.asteroids === 'number' ? currentSystem.objects.asteroids : 0;
    const asteroidRate = currentSystem.objects && typeof currentSystem.objects.asteroidRatePerSecond === 'number' ? currentSystem.objects.asteroidRatePerSecond : 0;
    
    for (let i = 0; i < numAsteroids; i++) {
        const asteroidRow = document.createElement('div');
        asteroidRow.setAttribute('data-asteroid-index', i);
        asteroidRow.style.display = 'flex';
        asteroidRow.style.justifyContent = 'space-between';
        asteroidRow.style.alignItems = 'center';
        asteroidRow.style.padding = '0.5rem 0.75rem';
        asteroidRow.style.background = 'rgba(255, 255, 255, 0.05)';
        asteroidRow.style.border = '1px solid rgba(251, 191, 36, 0.2)';
        asteroidRow.style.borderRadius = '8px';
        asteroidRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<i class="fas fa-meteor" style="color:#fbbf24; font-size: 1.2rem;"></i><span>Asteroid ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#fbbf24;font-weight:700">${formatNumber(asteroidRate)}/sec</span>`;
        
        asteroidRow.appendChild(left);
        asteroidRow.appendChild(right);
        container.appendChild(asteroidRow);
    }
    
    // Show each comet as a separate item
    const numComets = currentSystem.objects && typeof currentSystem.objects.comets === 'number' ? currentSystem.objects.comets : 0;
    const cometRate = currentSystem.objects && typeof currentSystem.objects.cometRatePerSecond === 'number' ? currentSystem.objects.cometRatePerSecond : 0;
    
    for (let i = 0; i < numComets; i++) {
        const cometRow = document.createElement('div');
        cometRow.setAttribute('data-comet-index', i);
        cometRow.style.display = 'flex';
        cometRow.style.justifyContent = 'space-between';
        cometRow.style.alignItems = 'center';
        cometRow.style.padding = '0.5rem 0.75rem';
        cometRow.style.background = 'rgba(255, 255, 255, 0.05)';
        cometRow.style.border = '1px solid rgba(96, 165, 250, 0.2)';
        cometRow.style.borderRadius = '8px';
        cometRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#60a5fa; font-size: 1.2rem; margin-right: 8px;">☄️</span><span>Comet ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#60a5fa;font-weight:700">${formatNumber(cometRate)}/sec</span>`;
        
        cometRow.appendChild(left);
        cometRow.appendChild(right);
        container.appendChild(cometRow);
    }
    
    // Show each dwarf planet as a separate item
    const numDwarfPlanets = currentSystem.objects && typeof currentSystem.objects.dwarfPlanets === 'number' ? currentSystem.objects.dwarfPlanets : 0;
    const dwarfPlanetRate = currentSystem.objects && typeof currentSystem.objects.dwarfPlanetRatePerSecond === 'number' ? currentSystem.objects.dwarfPlanetRatePerSecond : 0;
    
    for (let i = 0; i < numDwarfPlanets; i++) {
        const dwarfPlanetRow = document.createElement('div');
        dwarfPlanetRow.setAttribute('data-dwarf-planet-index', i);
        dwarfPlanetRow.style.display = 'flex';
        dwarfPlanetRow.style.justifyContent = 'space-between';
        dwarfPlanetRow.style.alignItems = 'center';
        dwarfPlanetRow.style.padding = '0.5rem 0.75rem';
        dwarfPlanetRow.style.background = 'rgba(255, 255, 255, 0.05)';
        dwarfPlanetRow.style.border = '1px solid rgba(139, 92, 246, 0.2)';
        dwarfPlanetRow.style.borderRadius = '8px';
        dwarfPlanetRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#8B5CF6; font-size: 1.2rem; margin-right: 8px;">🪐</span><span>Dwarf Planet ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#8B5CF6;font-weight:700">${formatNumber(dwarfPlanetRate)}/sec</span>`;
        
        dwarfPlanetRow.appendChild(left);
        dwarfPlanetRow.appendChild(right);
        container.appendChild(dwarfPlanetRow);
    }
    
    // Show each habitable planet as a separate item
    const numHabitablePlanets = currentSystem.objects && typeof currentSystem.objects.habitablePlanets === 'number' ? currentSystem.objects.habitablePlanets : 0;
    const habitablePlanetRate = currentSystem.objects && typeof currentSystem.objects.habitablePlanetRatePerSecond === 'number' ? currentSystem.objects.habitablePlanetRatePerSecond : 0;
    
    for (let i = 0; i < numHabitablePlanets; i++) {
        const habitablePlanetRow = document.createElement('div');
        habitablePlanetRow.setAttribute('data-habitable-planet-index', i);
        habitablePlanetRow.style.display = 'flex';
        habitablePlanetRow.style.justifyContent = 'space-between';
        habitablePlanetRow.style.alignItems = 'center';
        habitablePlanetRow.style.padding = '0.5rem 0.75rem';
        habitablePlanetRow.style.background = 'rgba(255, 255, 255, 0.05)';
        habitablePlanetRow.style.border = '1px solid rgba(16, 185, 129, 0.2)';
        habitablePlanetRow.style.borderRadius = '8px';
        habitablePlanetRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#10B981; font-size: 1.2rem; margin-right: 8px;">🌍</span><span>Habitable Planet ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#10B981;font-weight:700">${formatNumber(habitablePlanetRate)}/sec</span>`;
        
        habitablePlanetRow.appendChild(left);
        habitablePlanetRow.appendChild(right);
        container.appendChild(habitablePlanetRow);
    }
    
    // Show each Binary Ice Giant as a separate item
    const numBinaryIceGiants = currentSystem.objects && typeof currentSystem.objects.binaryIceGiants === 'number' ? currentSystem.objects.binaryIceGiants : 0;
    const binaryIceGiantRate = currentSystem.objects && typeof currentSystem.objects.binaryIceGiantRatePerSecond === 'number' ? currentSystem.objects.binaryIceGiantRatePerSecond : 0;
    
    console.log('Binary Ice Giants - count:', numBinaryIceGiants, 'rate:', binaryIceGiantRate);
    
    for (let i = 0; i < numBinaryIceGiants; i++) {
        const binaryIceGiantRow = document.createElement('div');
        binaryIceGiantRow.setAttribute('data-binary-ice-giant-index', i);
        binaryIceGiantRow.style.display = 'flex';
        binaryIceGiantRow.style.justifyContent = 'space-between';
        binaryIceGiantRow.style.alignItems = 'center';
        binaryIceGiantRow.style.padding = '0.5rem 0.75rem';
        binaryIceGiantRow.style.background = 'rgba(255, 255, 255, 0.05)';
        binaryIceGiantRow.style.border = '1px solid rgba(96, 165, 250, 0.2)';
        binaryIceGiantRow.style.borderRadius = '8px';
        binaryIceGiantRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#60A5FA; font-size: 1.2rem; margin-right: 8px;">❄️</span><span>Binary Ice Giant ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#60A5FA;font-weight:700">${formatNumber(binaryIceGiantRate)}/sec</span>`;
        
        binaryIceGiantRow.appendChild(left);
        binaryIceGiantRow.appendChild(right);
        container.appendChild(binaryIceGiantRow);
    }
    
    // Show each Gas Giant as a separate item
    const numGasGiants = currentSystem.objects && typeof currentSystem.objects.gasGiants === 'number' ? currentSystem.objects.gasGiants : 0;
    const gasGiantRate = currentSystem.objects && typeof currentSystem.objects.gasGiantRatePerSecond === 'number' ? currentSystem.objects.gasGiantRatePerSecond : 0;
    
    console.log('Gas Giants - count:', numGasGiants, 'rate:', gasGiantRate);
    
    for (let i = 0; i < numGasGiants; i++) {
        const gasGiantRow = document.createElement('div');
        gasGiantRow.setAttribute('data-gas-giant-index', i);
        gasGiantRow.style.display = 'flex';
        gasGiantRow.style.justifyContent = 'space-between';
        gasGiantRow.style.alignItems = 'center';
        gasGiantRow.style.padding = '0.5rem 0.75rem';
        gasGiantRow.style.background = 'rgba(255, 255, 255, 0.05)';
        gasGiantRow.style.border = '1px solid rgba(245, 158, 11, 0.2)';
        gasGiantRow.style.borderRadius = '8px';
        gasGiantRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#F59E0B; font-size: 1.2rem; margin-right: 8px;">🪐</span><span>Gas Giant (Ringed) ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#F59E0B;font-weight:700">${formatNumber(gasGiantRate)}/sec</span>`;
        
        gasGiantRow.appendChild(left);
        gasGiantRow.appendChild(right);
        container.appendChild(gasGiantRow);
    }
    
    // Show each Neutron Star as a separate item
    const numNeutronStars = currentSystem.objects && typeof currentSystem.objects.neutronStars === 'number' ? currentSystem.objects.neutronStars : 0;
    const neutronStarRate = currentSystem.objects && typeof currentSystem.objects.neutronStarRatePerSecond === 'number' ? currentSystem.objects.neutronStarRatePerSecond : 0;
    
    console.log('Neutron Stars - count:', numNeutronStars, 'rate:', neutronStarRate);
    
    for (let i = 0; i < numNeutronStars; i++) {
        const neutronStarRow = document.createElement('div');
        neutronStarRow.setAttribute('data-neutron-star-index', i);
        neutronStarRow.style.display = 'flex';
        neutronStarRow.style.justifyContent = 'space-between';
        neutronStarRow.style.alignItems = 'center';
        neutronStarRow.style.padding = '0.5rem 0.75rem';
        neutronStarRow.style.background = 'rgba(255, 255, 255, 0.05)';
        neutronStarRow.style.border = '1px solid rgba(139, 92, 246, 0.2)';
        neutronStarRow.style.borderRadius = '8px';
        neutronStarRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#8B5CF6; font-size: 1.2rem; margin-right: 8px;">⭐</span><span>Neutron Star ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#8B5CF6;font-weight:700">${formatNumber(neutronStarRate)}/sec</span>`;
        
        neutronStarRow.appendChild(left);
        neutronStarRow.appendChild(right);
        container.appendChild(neutronStarRow);
    }
    
    // Show each Binary Gas Giant as a separate item
    const numBinaryGasGiants = currentSystem.objects && typeof currentSystem.objects.binaryGasGiants === 'number' ? currentSystem.objects.binaryGasGiants : 0;
    const binaryGasGiantRate = currentSystem.objects && typeof currentSystem.objects.binaryGasGiantRatePerSecond === 'number' ? currentSystem.objects.binaryGasGiantRatePerSecond : 0;
    
    console.log('Binary Gas Giants - count:', numBinaryGasGiants, 'rate:', binaryGasGiantRate);
    
    for (let i = 0; i < numBinaryGasGiants; i++) {
        const binaryGasGiantRow = document.createElement('div');
        binaryGasGiantRow.setAttribute('data-binary-gas-giant-index', i);
        binaryGasGiantRow.style.display = 'flex';
        binaryGasGiantRow.style.justifyContent = 'space-between';
        binaryGasGiantRow.style.alignItems = 'center';
        binaryGasGiantRow.style.padding = '0.5rem 0.75rem';
        binaryGasGiantRow.style.background = 'rgba(255, 255, 255, 0.05)';
        binaryGasGiantRow.style.border = '1px solid rgba(245, 158, 11, 0.2)';
        binaryGasGiantRow.style.borderRadius = '8px';
        binaryGasGiantRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#F59E0B; font-size: 1.2rem; margin-right: 8px;">🪐</span><span>Gas Giant Binary ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#F59E0B;font-weight:700">${formatNumber(binaryGasGiantRate)}/sec</span>`;
        
        binaryGasGiantRow.appendChild(left);
        binaryGasGiantRow.appendChild(right);
        container.appendChild(binaryGasGiantRow);
    }
    
    // Show each Primordial Black Hole as a separate item
    const numPrimordialBlackHoles = currentSystem.objects && typeof currentSystem.objects.primordialBlackHoles === 'number' ? currentSystem.objects.primordialBlackHoles : 0;
    const primordialBlackHoleRate = currentSystem.objects && typeof currentSystem.objects.primordialBlackHoleRatePerSecond === 'number' ? currentSystem.objects.primordialBlackHoleRatePerSecond : 0;
    
    console.log('Primordial Black Holes - count:', numPrimordialBlackHoles, 'rate:', primordialBlackHoleRate);
    
    for (let i = 0; i < numPrimordialBlackHoles; i++) {
        const primordialBlackHoleRow = document.createElement('div');
        primordialBlackHoleRow.setAttribute('data-primordial-black-hole-index', i);
        primordialBlackHoleRow.style.display = 'flex';
        primordialBlackHoleRow.style.justifyContent = 'space-between';
        primordialBlackHoleRow.style.alignItems = 'center';
        primordialBlackHoleRow.style.padding = '0.5rem 0.75rem';
        primordialBlackHoleRow.style.background = 'rgba(255, 255, 255, 0.05)';
        primordialBlackHoleRow.style.border = '1px solid rgba(139, 69, 19, 0.2)';
        primordialBlackHoleRow.style.borderRadius = '8px';
        primordialBlackHoleRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#8B4513; font-size: 1.2rem; margin-right: 8px;">🕳️</span><span>Primordial Black Hole ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#8B4513;font-weight:700">${formatNumber(primordialBlackHoleRate)}/sec</span>`;
        
        primordialBlackHoleRow.appendChild(left);
        primordialBlackHoleRow.appendChild(right);
        container.appendChild(primordialBlackHoleRow);
    }
    
    // Show each Element 118 Atom as a separate item
    const numElement118Atoms = currentSystem.objects && typeof currentSystem.objects.element118Atoms === 'number' ? currentSystem.objects.element118Atoms : 0;
    const element118AtomRate = currentSystem.objects && typeof currentSystem.objects.element118AtomRatePerSecond === 'number' ? currentSystem.objects.element118AtomRatePerSecond : 0;
    
    console.log('Element 118 Atoms - count:', numElement118Atoms, 'rate:', element118AtomRate);
    
    for (let i = 0; i < numElement118Atoms; i++) {
        const element118AtomRow = document.createElement('div');
        element118AtomRow.setAttribute('data-element118-atom-index', i);
        element118AtomRow.style.display = 'flex';
        element118AtomRow.style.justifyContent = 'space-between';
        element118AtomRow.style.alignItems = 'center';
        element118AtomRow.style.padding = '0.5rem 0.75rem';
        element118AtomRow.style.background = 'rgba(255, 255, 255, 0.05)';
        element118AtomRow.style.border = '1px solid rgba(255, 0, 255, 0.2)';
        element118AtomRow.style.borderRadius = '8px';
        element118AtomRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#FF00FF; font-size: 1.2rem; margin-right: 8px;">⚛️</span><span>Element 118 Atom ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#FF00FF;font-weight:700">${formatNumber(element118AtomRate)}/sec</span>`;
        
        element118AtomRow.appendChild(left);
        element118AtomRow.appendChild(right);
        container.appendChild(element118AtomRow);
    }
    
    // Show each Wolf-Rayet Star as a separate item
    const numWolfRayetStars = currentSystem.objects && typeof currentSystem.objects.wolfRayetStars === 'number' ? currentSystem.objects.wolfRayetStars : 0;
    const wolfRayetStarRate = currentSystem.objects && typeof currentSystem.objects.wolfRayetStarRatePerSecond === 'number' ? currentSystem.objects.wolfRayetStarRatePerSecond : 0;
    
    console.log('Wolf-Rayet Stars - count:', numWolfRayetStars, 'rate:', wolfRayetStarRate);
    
    for (let i = 0; i < numWolfRayetStars; i++) {
        const wolfRayetStarRow = document.createElement('div');
        wolfRayetStarRow.setAttribute('data-wolf-rayet-star-index', i);
        wolfRayetStarRow.style.display = 'flex';
        wolfRayetStarRow.style.justifyContent = 'space-between';
        wolfRayetStarRow.style.alignItems = 'center';
        wolfRayetStarRow.style.padding = '0.5rem 0.75rem';
        wolfRayetStarRow.style.background = 'rgba(255, 255, 255, 0.05)';
        wolfRayetStarRow.style.border = '1px solid rgba(255, 165, 0, 0.2)';
        wolfRayetStarRow.style.borderRadius = '8px';
        wolfRayetStarRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#FFA500; font-size: 1.2rem; margin-right: 8px;">⭐</span><span>Wolf-Rayet Star ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#FFA500;font-weight:700">${formatNumber(wolfRayetStarRate)}/sec</span>`;
        
        wolfRayetStarRow.appendChild(left);
        wolfRayetStarRow.appendChild(right);
        container.appendChild(wolfRayetStarRow);
    }
    
    // Show each Element 118 Planet as a separate item
    const numElement118Planets = currentSystem.objects && typeof currentSystem.objects.element118Planets === 'number' ? currentSystem.objects.element118Planets : 0;
    const element118PlanetRate = currentSystem.objects && typeof currentSystem.objects.element118PlanetRatePerSecond === 'number' ? currentSystem.objects.element118PlanetRatePerSecond : 0;
    
    console.log('Element 118 Planets - count:', numElement118Planets, 'rate:', element118PlanetRate);
    
    for (let i = 0; i < numElement118Planets; i++) {
        const element118PlanetRow = document.createElement('div');
        element118PlanetRow.setAttribute('data-element118-planet-index', i);
        element118PlanetRow.style.display = 'flex';
        element118PlanetRow.style.justifyContent = 'space-between';
        element118PlanetRow.style.alignItems = 'center';
        element118PlanetRow.style.padding = '0.5rem 0.75rem';
        element118PlanetRow.style.background = 'rgba(255, 255, 255, 0.05)';
        element118PlanetRow.style.border = '1px solid rgba(0, 255, 255, 0.2)';
        element118PlanetRow.style.borderRadius = '8px';
        element118PlanetRow.style.position = 'relative';
        
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        left.innerHTML = `<span style="color:#00FFFF; font-size: 1.2rem; margin-right: 8px;">🪐</span><span>Element 118 Planet ${i + 1}</span>`;
        
        const right = document.createElement('div');
        right.innerHTML = `<span style="color:#00FFFF;font-weight:700">${formatNumber(element118PlanetRate)}/sec</span>`;
        
        element118PlanetRow.appendChild(left);
        element118PlanetRow.appendChild(right);
        container.appendChild(element118PlanetRow);
    }
    
    panel.appendChild(container);
}

function scrollStarToTop(starElement) {
    const panelContent = document.querySelector('.left-panel .panel-content');
    if (!panelContent || !starElement) return;
    
    // Compute target scroll using geometry relative to the scrolling container
    // Use bounding rects to avoid offsetParent quirks that placed the item mid-panel
    const panelRect = panelContent.getBoundingClientRect();
    const starRect = starElement.getBoundingClientRect();
    
    // Respect the actual top padding of the scroll container
    const computed = window.getComputedStyle(panelContent);
    const paddingTop = parseFloat(computed.paddingTop) || 0;
    
    // Distance from the top of the scrolling area to the star
    const deltaFromTop = starRect.top - panelRect.top;
    let target = panelContent.scrollTop + deltaFromTop - paddingTop;
    
    // Clamp to valid scroll range so we never overshoot
    const maxScroll = panelContent.scrollHeight - panelContent.clientHeight;
    target = Math.max(0, Math.min(target, maxScroll));
    
    panelContent.scrollTo({
        top: target,
        behavior: 'smooth'
    });
}

// Upgrade Purchase Functions
let currentUpgrade = null;

function showUpgradeModal(upgradeName, upgradeCost, upgradeDescription) {
    console.log('=== SHOW UPGRADE MODAL CALLED ===');
    console.log('Upgrade name:', upgradeName);
    console.log('Upgrade cost:', upgradeCost);
    console.log('Upgrade description:', upgradeDescription);
    
    const upgradeModal = document.getElementById('upgradeModal');
    const upgradeIcon = document.getElementById('upgradeIcon');
    const upgradeNameEl = document.getElementById('upgradeName');
    const upgradeDescriptionEl = document.getElementById('upgradeDescription');
    const stardustProgressEl = document.getElementById('stardustProgress');
    const confirmPurchase = document.getElementById('confirmPurchase');
    
    console.log('Upgrade modal element:', upgradeModal);
    
    if (upgradeModal) {
        // Store current upgrade info
        currentUpgrade = {
            name: upgradeName,
            cost: upgradeCost,
            description: upgradeDescription
        };
        
        // Update modal content
        if (upgradeNameEl) upgradeNameEl.textContent = upgradeName;
        if (upgradeDescriptionEl) upgradeDescriptionEl.textContent = upgradeDescription;
        // Parse upgrade cost once for consistent numeric formatting
        const upgradeCostNum = Number(upgradeCost);
        if (stardustProgressEl) {
            stardustProgressEl.textContent = `${formatNumber(gameState.stardust)} / ${formatNumber(upgradeCostNum)} stardust collected`;
        }
        
        // Enable/disable advance button based on stardust requirement
        if (confirmPurchase) {
            if (gameState.stardust >= upgradeCostNum) {
                confirmPurchase.disabled = false;
                confirmPurchase.style.opacity = '1';
                confirmPurchase.style.cursor = 'pointer';
            } else {
                confirmPurchase.disabled = true;
                confirmPurchase.style.opacity = '0.5';
                confirmPurchase.style.cursor = 'not-allowed';
            }
        }
        
        console.log('About to show modal...');
        showModal(upgradeModal);
        console.log('Modal should now be visible');
    } else {
        console.log('ERROR: Upgrade modal element not found!');
    }
}

function purchaseUpgrade() {
    if (!currentUpgrade) return;
    
    const upgradeCost = Number(currentUpgrade.cost);
    
    // Check if player has enough stardust
    if (gameState.stardust >= upgradeCost) {
        // Consume stardust
        gameState.stardust -= upgradeCost;
        
        // Mark upgrade as unlocked
        markUpgradeAsPurchased(currentUpgrade.name);
        
        // Update UI
        updateUI();
        
        // Hide modal
        hideModal(document.getElementById('upgradeModal'));
        
        // Show success message
        showPurchaseSuccess(currentUpgrade.name);
        
        // Save game
        saveGame();
        
        // Clear current upgrade
        currentUpgrade = null;
    } else {
        // Show error message
        alert('Insufficient stardust to advance!');
    }
}

function markUpgradeAsPurchased(upgradeName) {
    console.log(`Unlocked upgrade: ${upgradeName} for system ${gameState.selectedStar}`);
    
    // Mark upgrade as purchased in game state
    const currentStarId = gameState.selectedStar;
    if (gameState.starSystems[currentStarId]) {
        gameState.starSystems[currentStarId].upgrades[upgradeName] = true;
    }
    
    // Handle system-specific upgrade gates
    if (upgradeName === 'Nuclear Fusion' && currentStarId === 1) {
        // Unlock the next star system (Phaenueanry) when Nmininix's Nuclear Fusion is purchased
        unlockNextStarSystem();
        console.log('Nuclear Fusion unlocked - Phaenueanry star system available!');
    }
    
    if (upgradeName === 'Add Mass' && currentStarId === 2) {
        // Unlock the next star system (Bininc) when Phaenueanry's Add Mass is purchased
        unlockThirdStarSystem();
        console.log('Add Mass unlocked - Bininc star system available!');
    }
    
    if (upgradeName === 'Add Mass' && currentStarId === 3) {
        // Unlock the next star system (Nmorath) when Bininc's Add Mass is purchased
        unlockFourthStarSystem();
        console.log('Add Mass unlocked - Nmorath star system available!');
    }
    
    if (upgradeName === 'Add Mass' && currentStarId === 4) {
        // Unlock the next star system (Vonodrath) when Nmorath's Add Mass is purchased
        unlockFifthStarSystem();
        console.log('Add Mass unlocked - Vonodrath star system available!');
    }
    
    if (upgradeName === 'Add Mass' && currentStarId === 5) {
        // Unlock the next star system (Organtoroth) when Vonodrath's Add Mass is purchased
        unlockSixthStarSystem();
        console.log('Add Mass unlocked - Organtoroth star system available!');
    }
    
    if (upgradeName === 'Unlock Extreme Objects' && currentStarId === 6) {
        // Unlock the next star system (Zxrion) when Organtoroth's Unlock Extreme Objects is purchased
        unlockSeventhStarSystem();
        console.log('Unlock Extreme Objects - Zxrion star system available!');
    }
    
    if (upgradeName === 'Densify' && currentStarId === 7) {
        // Unlock the next star system (Zyacrate) when Zxrion's Densify is purchased
        unlockEighthStarSystem();
        console.log('Densify - Zyacrate star system available!');
    }
    
    if (upgradeName === 'Black Hole Collision' && currentStarId === 8) {
        // Unlock the next star system (Janix) when Zyacrate's Black Hole Collision is purchased
        unlockNinthStarSystem();
        console.log('Black Hole Collision - Janix star system available!');
    }
    
    if (upgradeName === 'Add Mass' && currentStarId === 9) {
        // Unlock the next star system (Krakendith) when Janix's Add Mass is purchased
        unlockTenthStarSystem();
        console.log('Add Mass - Krakendith star system available!');
    }
    
    if (upgradeName === 'Activate Quasar' && currentStarId === 10) {
        // Unlock the next star system (Gironix) when Krakendith's Quasar is activated
        unlockEleventhStarSystem();
        console.log('Activate Quasar - Gironix star system available!');
    }
    
    if (upgradeName === 'Unlock Fictional Objects' && currentStarId === 11) {
        // Unlock fictional objects when Gironix's Unlock Fictional Objects is purchased
        console.log('Fictional Objects unlocked on Gironix!');
        // Future: Add fictional objects or next system here
    }
    
    // Refresh the star collection UI so unlocked upgrades are non-clickable
    updateStarCollectionFromState();
    
    // Save game after upgrade purchase
    saveGame();
}

function unlockNextStarSystem() {
    console.log('Unlocking next star system...');
    
    // Update game state to unlock the next star
    gameState.starsUnlocked = 2;
    gameState.starSystems[2].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Phaenueanry star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 1) {
            const phaenueanryElement = starElements[1]; // Second star element
            console.log('Unlocking Phaenueanry element:', phaenueanryElement);
            console.log('Element classes before unlock:', phaenueanryElement.className);
            
            phaenueanryElement.classList.remove('locked');
            console.log('Element classes after removing locked:', phaenueanryElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = phaenueanryElement.cloneNode(true);
            phaenueanryElement.parentNode.replaceChild(newElement, phaenueanryElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Phaenueanry star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(2)');
                selectStar(2); // Select Phaenueanry
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[2].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Phaenueanry');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockThirdStarSystem() {
    console.log('Unlocking third star system...');
    
    // Update game state to unlock the third star
    gameState.starsUnlocked = 3;
    gameState.starSystems[3].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Bininc star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 2) {
            const binincElement = starElements[2]; // Third star element
            console.log('Unlocking Bininc element:', binincElement);
            console.log('Element classes before unlock:', binincElement.className);
            
            binincElement.classList.remove('locked');
            console.log('Element classes after removing locked:', binincElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = binincElement.cloneNode(true);
            binincElement.parentNode.replaceChild(newElement, binincElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Bininc star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(3)');
                selectStar(3); // Select Bininc
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[3].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Bininc');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockFourthStarSystem() {
    console.log('Unlocking fourth star system...');
    
    // Update game state to unlock the fourth star
    gameState.starsUnlocked = 4;
    gameState.starSystems[4].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Nmorath star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 3) {
            const nmorathElement = starElements[3]; // Fourth star element
            console.log('Unlocking Nmorath element:', nmorathElement);
            console.log('Element classes before unlock:', nmorathElement.className);
            
            nmorathElement.classList.remove('locked');
            console.log('Element classes after removing locked:', nmorathElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = nmorathElement.cloneNode(true);
            nmorathElement.parentNode.replaceChild(newElement, nmorathElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Nmorath star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(4)');
                selectStar(4); // Select Nmorath
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[4].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Nmorath');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockFifthStarSystem() {
    console.log('Unlocking fifth star system...');
    
    // Update game state to unlock the fifth star
    gameState.starsUnlocked = 5;
    gameState.starSystems[5].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Vonodrath star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 4) {
            const vonodrathElement = starElements[4]; // Fifth star element
            console.log('Unlocking Vonodrath element:', vonodrathElement);
            console.log('Element classes before unlock:', vonodrathElement.className);
            
            vonodrathElement.classList.remove('locked');
            console.log('Element classes after removing locked:', vonodrathElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = vonodrathElement.cloneNode(true);
            vonodrathElement.parentNode.replaceChild(newElement, vonodrathElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Vonodrath star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(5)');
                selectStar(5); // Select Vonodrath
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[5].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Vonodrath');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockSixthStarSystem() {
    console.log('Unlocking sixth star system...');
    
    // Update game state to unlock the sixth star
    gameState.starsUnlocked = 6;
    gameState.starSystems[6].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Organtoroth star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 5) {
            const organtorothElement = starElements[5]; // Sixth star element
            console.log('Unlocking Organtoroth element:', organtorothElement);
            console.log('Element classes before unlock:', organtorothElement.className);
            
            organtorothElement.classList.remove('locked');
            console.log('Element classes after removing locked:', organtorothElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = organtorothElement.cloneNode(true);
            organtorothElement.parentNode.replaceChild(newElement, organtorothElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Organtoroth star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(6)');
                selectStar(6); // Select Organtoroth
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[6].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Organtoroth');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockSeventhStarSystem() {
    console.log('Unlocking seventh star system...');
    
    // Update game state to unlock the seventh star
    gameState.starsUnlocked = 7;
    gameState.starSystems[7].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Zxrion star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 6) {
            const zxrionElement = starElements[6]; // Seventh star element
            console.log('Unlocking Zxrion element:', zxrionElement);
            console.log('Element classes before unlock:', zxrionElement.className);
            
            zxrionElement.classList.remove('locked');
            console.log('Element classes after removing locked:', zxrionElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = zxrionElement.cloneNode(true);
            zxrionElement.parentNode.replaceChild(newElement, zxrionElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Zxrion star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(7)');
                selectStar(7); // Select Zxrion
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[7].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Zxrion');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockEighthStarSystem() {
    console.log('Unlocking eighth star system...');
    
    // Update game state to unlock the eighth star
    gameState.starsUnlocked = 8;
    gameState.starSystems[8].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Zyacrate star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 7) {
            const zyacrateElement = starElements[7]; // Eighth star element
            console.log('Unlocking Zyacrate element:', zyacrateElement);
            console.log('Element classes before unlock:', zyacrateElement.className);
            
            zyacrateElement.classList.remove('locked');
            console.log('Element classes after removing locked:', zyacrateElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = zyacrateElement.cloneNode(true);
            zyacrateElement.parentNode.replaceChild(newElement, zyacrateElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Zyacrate star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(8)');
                selectStar(8); // Select Zyacrate
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[8].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Zyacrate');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockNinthStarSystem() {
    console.log('Unlocking ninth star system...');
    
    // Update game state to unlock the ninth star
    gameState.starsUnlocked = 9;
    gameState.starSystems[9].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Janix star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 8) {
            const janixElement = starElements[8]; // Ninth star element
            console.log('Unlocking Janix element:', janixElement);
            console.log('Element classes before unlock:', janixElement.className);
            
            janixElement.classList.remove('locked');
            console.log('Element classes after removing locked:', janixElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = janixElement.cloneNode(true);
            janixElement.parentNode.replaceChild(newElement, janixElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Janix star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(9)');
                selectStar(9); // Select Janix
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[9].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Janix');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockTenthStarSystem() {
    console.log('Unlocking tenth star system...');
    
    // Update game state to unlock the tenth star
    gameState.starsUnlocked = 10;
    gameState.starSystems[10].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Krakendith star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 9) {
            const krakendithElement = starElements[9]; // Tenth star element
            console.log('Unlocking Krakendith element:', krakendithElement);
            console.log('Element classes before unlock:', krakendithElement.className);
            
            krakendithElement.classList.remove('locked');
            console.log('Element classes after removing locked:', krakendithElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = krakendithElement.cloneNode(true);
            krakendithElement.parentNode.replaceChild(newElement, krakendithElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Krakendith star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(10)');
                selectStar(10); // Select Krakendith
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[10].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Krakendith');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function unlockEleventhStarSystem() {
    console.log('Unlocking eleventh star system...');
    
    // Update game state to unlock the eleventh star
    gameState.starsUnlocked = 11;
    gameState.starSystems[11].unlocked = true;
    
    console.log('Updated game state:', gameState.starSystems);
    
    // Find and unlock the Gironix star
    const starCollection = document.getElementById('starCollection');
    if (starCollection) {
        const starElements = starCollection.querySelectorAll('.star-item');
        console.log(`Found ${starElements.length} star elements`);
        
        if (starElements.length > 10) {
            const gironixElement = starElements[10]; // Eleventh star element
            console.log('Unlocking Gironix element:', gironixElement);
            console.log('Element classes before unlock:', gironixElement.className);
            
            gironixElement.classList.remove('locked');
            console.log('Element classes after removing locked:', gironixElement.className);
            
            // Remove any existing click handlers to avoid duplicates
            const newElement = gironixElement.cloneNode(true);
            gironixElement.parentNode.replaceChild(newElement, gironixElement);
            console.log('New element classes:', newElement.className);
            
            // Add click handler for the newly unlocked star
            newElement.addEventListener('click', (e) => {
                console.log('=== CLICK EVENT TRIGGERED ===');
                console.log('Clicked on unlocked Gironix star');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                console.log('About to call selectStar(11)');
                selectStar(11); // Select Gironix
                console.log('=== CLICK EVENT COMPLETED ===');
            });
            
            // Add click handlers for its upgrades (none for Gironix currently)
            const upgradeItems = newElement.querySelectorAll('.upgrade-item-small');
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                // Only bind click if this upgrade is not purchased
                if (!gameState.starSystems[11].upgrades[upgradeName]) {
                    upgradeItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                    });
                } else {
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                }
            });
            
            console.log('Successfully unlocked and added click handlers for Gironix');
            console.log('Final element classes:', newElement.className);
            console.log('Element is clickable:', !newElement.classList.contains('locked'));
        }
    }
    
    // Update UI to reflect the new star count
    updateUI();
    
    // Save game after unlocking new star
    saveGame();
}

function showPurchaseSuccess(upgradeName) {
    // Create a temporary success message
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 2000;
        animation: fadeInOut 2s ease-in-out forwards;
    `;
    successMsg.textContent = `Level advanced! ${upgradeName} unlocked!`;
    
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 2000);
}

// Save/Load Functions
function saveGame() {
    if (!gameState.autoSaveEnabled) return;
    
    try {
        // Update last save time
        gameState.lastSaveTime = Date.now();
        
        // Save to localStorage
        localStorage.setItem('spaceAutoClicker', JSON.stringify(gameState));
        console.log('Game saved successfully');
        
        // Show save indicator (optional)
        showSaveIndicator();
    } catch (e) {
        console.error('Failed to save game:', e);
        showSaveError();
    }
}

function loadGame() {
    try {
        const savedState = localStorage.getItem('spaceAutoClicker');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Merge with default state to handle new properties
            gameState = { ...gameState, ...parsedState };
            
            // Ensure star systems structure exists
            if (!gameState.starSystems) {
                gameState.starSystems = {
                    1: { unlocked: true, upgrades: { 'Nuclear Fusion': false } },
                    2: { unlocked: false, upgrades: { 'Add Mass': false } }
                };
            }

            // Ensure objects exist for systems
            if (!gameState.starSystems[1].objects) {
                gameState.starSystems[1].objects = { asteroids: 5, asteroidRatePerSecond: 0.01 };
            }
            if (!gameState.starSystems[2].objects) {
                gameState.starSystems[2].objects = { asteroids: 0, asteroidRatePerSecond: 1, comets: 5, cometRatePerSecond: 10 };
            }
            
            // Migration: Update asteroid rate for system 1 if it's still the old value
            if (gameState.starSystems[1].objects && gameState.starSystems[1].objects.asteroidRatePerSecond === 1) {
                gameState.starSystems[1].objects.asteroidRatePerSecond = 0.01;
                console.log('Migrated asteroid rate for system 1 from 1 to 0.01');
            }
            
            // Migration: Add comets to system 2 if they don't exist
            if (gameState.starSystems[2].objects && !gameState.starSystems[2].objects.comets) {
                gameState.starSystems[2].objects.comets = 5;
                gameState.starSystems[2].objects.cometRatePerSecond = 10;
                console.log('Added comets to system 2: 5 comets at 10 stardust/sec each');
            }
            
            // Migration: Add system 3 if it doesn't exist
            if (!gameState.starSystems[3]) {
                gameState.starSystems[3] = {
                    unlocked: false,
                    upgrades: {
                        'Add Mass': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 1,
                        dwarfPlanetRatePerSecond: 250
                    }
                };
                console.log('Added system 3 (Bininc) with dwarf planet');
            }
            
            // Migration: Add system 4 if it doesn't exist
            if (!gameState.starSystems[4]) {
                gameState.starSystems[4] = {
                    unlocked: false,
                    upgrades: {
                        'Add Mass': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 1,
                        habitablePlanetRatePerSecond: 50000000
                    }
                };
                console.log('Added system 4 (Nmorath) with habitable planet');
            }
            
            // Migration: Add system 5 if it doesn't exist
            if (!gameState.starSystems[5]) {
                gameState.starSystems[5] = {
                    unlocked: false,
                    upgrades: {
                        'Add Mass': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 1,
                        binaryIceGiantRatePerSecond: 250000000000
                    }
                };
                console.log('Added system 5 (Vonodrath) with Binary Ice Giant pair');
            }
            
            // Migration: Check if system 2's Add Mass is purchased but system 3 isn't unlocked
            if (gameState.starSystems[2] && gameState.starSystems[2].upgrades && gameState.starSystems[2].upgrades['Add Mass'] && 
                gameState.starSystems[3] && !gameState.starSystems[3].unlocked) {
                console.log('Migration: System 2 Add Mass is purchased but system 3 is not unlocked. Fixing...');
                gameState.starsUnlocked = 3;
                gameState.starSystems[3].unlocked = true;
                console.log('System 3 (Bininc) unlocked via migration');
            }
            
            // Migration: Check if system 3's Add Mass is purchased but system 4 isn't unlocked
            if (gameState.starSystems[3] && gameState.starSystems[3].upgrades && gameState.starSystems[3].upgrades['Add Mass'] && 
                gameState.starSystems[4] && !gameState.starSystems[4].unlocked) {
                console.log('Migration: System 3 Add Mass is purchased but system 4 is not unlocked. Fixing...');
                gameState.starsUnlocked = 4;
                gameState.starSystems[4].unlocked = true;
                console.log('System 4 (Nmorath) unlocked via migration');
            }
            
            // Migration: Check if system 4's Add Mass is purchased but system 5 isn't unlocked
            if (gameState.starSystems[4] && gameState.starSystems[4].upgrades && gameState.starSystems[4].upgrades['Add Mass'] && 
                gameState.starSystems[5] && !gameState.starSystems[5].unlocked) {
                console.log('Migration: System 4 Add Mass is purchased but system 5 is not unlocked. Fixing...');
                gameState.starsUnlocked = 5;
                gameState.starSystems[5].unlocked = true;
                console.log('System 5 (Vonodrath) unlocked via migration');
            }
            
            // Migration: Add habitable planet to system 4 if it doesn't exist
            if (gameState.starSystems[4] && (!gameState.starSystems[4].objects || !gameState.starSystems[4].objects.habitablePlanets)) {
                if (!gameState.starSystems[4].objects) {
                    gameState.starSystems[4].objects = {};
                }
                gameState.starSystems[4].objects.habitablePlanets = 1;
                gameState.starSystems[4].objects.habitablePlanetRatePerSecond = 50000000;
                console.log('Added habitable planet to system 4 (Nmorath) via migration');
            }
            
            // Migration: Add Binary Ice Giants to system 5 if they don't exist
            if (gameState.starSystems[5] && (!gameState.starSystems[5].objects || !gameState.starSystems[5].objects.binaryIceGiants)) {
                if (!gameState.starSystems[5].objects) {
                    gameState.starSystems[5].objects = {};
                }
                gameState.starSystems[5].objects.binaryIceGiants = 1;
                gameState.starSystems[5].objects.binaryIceGiantRatePerSecond = 250000000000;
                console.log('Added Binary Ice Giants to system 5 (Vonodrath) via migration');
            }
            
            // Migration: Add system 6 if it doesn't exist
            if (!gameState.starSystems[6]) {
                gameState.starSystems[6] = {
                    unlocked: false,
                    upgrades: {
                        'Unlock Extreme Objects': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 1,
                        gasGiantRatePerSecond: 500000000000000
                    }
                };
                console.log('Added system 6 (Organtoroth) with Gas Giant');
            }
            
            // Migration: Add system 7 if it doesn't exist
            if (!gameState.starSystems[7]) {
                gameState.starSystems[7] = {
                    unlocked: false,
                    upgrades: {
                        'Densify': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 0,
                        gasGiantRatePerSecond: 10,
                        neutronStars: 0,
                        neutronStarRatePerSecond: 10,
                        binaryGasGiants: 4,
                        binaryGasGiantRatePerSecond: 50000000000000000
                    }
                };
                console.log('Added system 7 (Zxrion) with Binary Gas Giants');
            }
            
            // Migration: Update system 7 to have binary Gas Giants instead of neutron stars
            if (gameState.starSystems[7] && gameState.starSystems[7].objects && gameState.starSystems[7].objects.neutronStars) {
                gameState.starSystems[7].objects.neutronStars = 0;
                gameState.starSystems[7].objects.neutronStarRatePerSecond = 10;
                gameState.starSystems[7].objects.binaryGasGiants = 4;
                gameState.starSystems[7].objects.binaryGasGiantRatePerSecond = 50000000000000000;
                console.log('Updated system 7 (Zxrion) to use Binary Gas Giants instead of Neutron Stars');
            }
            
            // Migration: Add system 8 if it doesn't exist
            if (!gameState.starSystems[8]) {
                gameState.starSystems[8] = {
                    unlocked: false,
                    upgrades: {
                        'Black Hole Collision': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 0,
                        gasGiantRatePerSecond: 10,
                        neutronStars: 0,
                        neutronStarRatePerSecond: 10,
                        binaryGasGiants: 0,
                        binaryGasGiantRatePerSecond: 10,
                        primordialBlackHoles: 1,
                        primordialBlackHoleRatePerSecond: 500000000000000000000
                    }
                };
                console.log('Added system 8 (Zyacrate) with Primordial Black Hole');
            }
            
            // Migration: Add system 9 if it doesn't exist
            if (!gameState.starSystems[9]) {
                gameState.starSystems[9] = {
                    unlocked: false,
                    upgrades: {
                        'Add Mass': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 0,
                        gasGiantRatePerSecond: 10,
                        neutronStars: 0,
                        neutronStarRatePerSecond: 10,
                        binaryGasGiants: 0,
                        binaryGasGiantRatePerSecond: 10,
                        primordialBlackHoles: 0,
                        primordialBlackHoleRatePerSecond: 10,
                        element118Atoms: 1,
                        element118AtomRatePerSecond: 500000000000000000000000
                    }
                };
                console.log('Added system 9 (Janix) with Element 118 Atom');
            }
            
            // Migration: Add system 10 if it doesn't exist
            if (!gameState.starSystems[10]) {
                gameState.starSystems[10] = {
                    unlocked: false,
                    upgrades: {
                        'Activate Quasar': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 0,
                        gasGiantRatePerSecond: 10,
                        neutronStars: 0,
                        neutronStarRatePerSecond: 10,
                        binaryGasGiants: 0,
                        binaryGasGiantRatePerSecond: 10,
                        primordialBlackHoles: 0,
                        primordialBlackHoleRatePerSecond: 10,
                        element118Atoms: 0,
                        element118AtomRatePerSecond: 10,
                        wolfRayetStars: 1,
                        wolfRayetStarRatePerSecond: 500000000000000000000000000
                    }
                };
                console.log('Added system 10 (Krakendith) with Wolf-Rayet Star');
            }
            
            // Migration: Fix system 9 upgrade name from "Activate Quasar" to "Add Mass"
            if (gameState.starSystems[9] && gameState.starSystems[9].upgrades && gameState.starSystems[9].upgrades['Activate Quasar'] !== undefined) {
                console.log('Migration: Fixing system 9 upgrade name from "Activate Quasar" to "Add Mass"');
                const wasPurchased = gameState.starSystems[9].upgrades['Activate Quasar'];
                delete gameState.starSystems[9].upgrades['Activate Quasar'];
                gameState.starSystems[9].upgrades['Add Mass'] = wasPurchased;
                console.log('System 9 upgrade name migrated, was purchased:', wasPurchased);
            }
            
            // Migration: Check if system 9's Add Mass is purchased but system 10 isn't unlocked
            if (gameState.starSystems[9] && gameState.starSystems[9].upgrades && gameState.starSystems[9].upgrades['Add Mass'] && 
                gameState.starSystems[10] && !gameState.starSystems[10].unlocked) {
                console.log('Migration: System 9 Add Mass is purchased but system 10 is not unlocked. Fixing...');
                gameState.starsUnlocked = 10;
                gameState.starSystems[10].unlocked = true;
                console.log('System 10 (Krakendith) unlocked via migration');
            }
            
            // Migration: Fix Wolf-Rayet Star rate if it's still the old value (500)
            if (gameState.starSystems[10] && gameState.starSystems[10].objects && 
                gameState.starSystems[10].objects.wolfRayetStarRatePerSecond === 500) {
                console.log('Migration: Fixing Wolf-Rayet Star rate from 500 to 500 Sp/sec');
                gameState.starSystems[10].objects.wolfRayetStarRatePerSecond = 500000000000000000000000000;
                console.log('Wolf-Rayet Star rate updated to 500 Sp/sec');
            }
            
            // Migration: Remove deprecated "Unlock Quasar System" and unlock system 11 if it was purchased
            if (gameState.starSystems[10] && gameState.starSystems[10].upgrades &&
                Object.prototype.hasOwnProperty.call(gameState.starSystems[10].upgrades, 'Unlock Quasar System')) {
                const wasPurchased = !!gameState.starSystems[10].upgrades['Unlock Quasar System'];
                delete gameState.starSystems[10].upgrades['Unlock Quasar System'];
                if (wasPurchased) {
                    console.log('Migration: "Unlock Quasar System" was purchased. Unlocking system 11.');
                    gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 11);
                    if (gameState.starSystems[11]) {
                        gameState.starSystems[11].unlocked = true;
                    }
                    // Ensure Activate Quasar is marked purchased
                    if (gameState.starSystems[10].upgrades) {
                        gameState.starSystems[10].upgrades['Activate Quasar'] = true;
                    }
                }
            }
            
            // Migration: Add system 11 if it doesn't exist
            if (!gameState.starSystems[11]) {
                gameState.starSystems[11] = {
                    unlocked: false,
                    upgrades: {
                        'Unlock Fictional Objects': false
                    },
                    objects: {
                        asteroids: 0,
                        asteroidRatePerSecond: 1,
                        comets: 0,
                        cometRatePerSecond: 10,
                        dwarfPlanets: 0,
                        dwarfPlanetRatePerSecond: 10,
                        habitablePlanets: 0,
                        habitablePlanetRatePerSecond: 10,
                        binaryIceGiants: 0,
                        binaryIceGiantRatePerSecond: 10,
                        gasGiants: 0,
                        gasGiantRatePerSecond: 10,
                        neutronStars: 0,
                        neutronStarRatePerSecond: 10,
                        binaryGasGiants: 0,
                        binaryGasGiantRatePerSecond: 10,
                        primordialBlackHoles: 0,
                        primordialBlackHoleRatePerSecond: 10,
                        element118Atoms: 0,
                        element118AtomRatePerSecond: 10,
                        wolfRayetStars: 0,
                        wolfRayetStarRatePerSecond: 10,
                        element118Planets: 1,
                        element118PlanetRatePerSecond: 500000000000000000000000000000
                    }
                };
                console.log('Added system 11 (Gironix) with Element 118 Planet');
            }
            
            // Migration: Check if system 11 exists but doesn't have the upgrade
            if (gameState.starSystems[11] && (!gameState.starSystems[11].upgrades || !gameState.starSystems[11].upgrades.hasOwnProperty('Unlock Fictional Objects'))) {
                if (!gameState.starSystems[11].upgrades) {
                    gameState.starSystems[11].upgrades = {};
                }
                gameState.starSystems[11].upgrades['Unlock Fictional Objects'] = false;
                console.log('Added "Unlock Fictional Objects" upgrade to system 11');
            }
            
            // Update UI to reflect loaded state
            updateStarCollectionFromState();
            updateCentralStarDisplay();
            updateStarSelectionVisual();
            // Now that state is loaded, replace spinner with actual value immediately
            updateUI();
            
            // Final check: Ensure all systems are unlocked based on their prerequisites
            checkAndUnlockSystems();
            
            // Initialize auto-clicker UI after loading
            updateAutoClickerUI();
            
            console.log('Game loaded successfully');
        } else {
            console.log('No saved game found, starting fresh');
        }
    } catch (e) {
        console.error('Failed to load game:', e);
        // Continue with default state
    }
}

function updateStarCollectionFromState() {
    const starCollection = document.getElementById('starCollection');
    if (!starCollection) return;
    
    const starElements = starCollection.querySelectorAll('.star-item');
    starElements.forEach((element, index) => {
        const starId = index + 1;
        const starSystem = gameState.starSystems[starId];
        
        if (starSystem) {
            if (starSystem.unlocked) {
                element.classList.remove('locked');
                if (!element.dataset.clickBound) {
                    element.addEventListener('click', () => {
                        selectStar(starId);
                    });
                    element.dataset.clickBound = 'true';
                }
            } else {
                element.classList.add('locked');
            }
            
            // Update upgrade states
            const upgradeItems = element.querySelectorAll('.upgrade-item-small');
            console.log(`Found ${upgradeItems.length} upgrade items for star ${starId}`);
            
            upgradeItems.forEach(upgradeItem => {
                const upgradeName = upgradeItem.dataset.upgradeName;
                console.log(`Processing upgrade: ${upgradeName}, unlocked: ${starSystem.upgrades[upgradeName]}`);
                
                if (starSystem.upgrades[upgradeName]) {
                    upgradeItem.classList.add('unlocked');
                    upgradeItem.classList.remove('locked');
                    // Disable pointer/clicks when already unlocked
                    upgradeItem.style.pointerEvents = 'none';
                    upgradeItem.style.cursor = 'default';
                } else {
                    upgradeItem.classList.add('locked');
                    upgradeItem.classList.remove('unlocked');
                    upgradeItem.style.pointerEvents = 'auto';
                    upgradeItem.style.cursor = 'pointer';
                }
                
                // Bind click handler only if not unlocked
                if (!starSystem.upgrades[upgradeName] && !upgradeItem.dataset.clickBound) {
                    console.log(`Binding click handler for upgrade: ${upgradeName}`);
                    upgradeItem.addEventListener('click', (e) => {
                        console.log('=== UPGRADE CLICKED ===');
                        console.log('Upgrade clicked:', upgradeName);
                        console.log('Event target:', e.target);
                        console.log('Event currentTarget:', e.currentTarget);
                        console.log('Upgrade cost:', upgradeItem.dataset.upgradeCost);
                        console.log('Upgrade description:', upgradeItem.dataset.upgradeDescription);
                        e.stopPropagation();
                        const upgradeCost = upgradeItem.dataset.upgradeCost;
                        const upgradeDescription = upgradeItem.dataset.upgradeDescription;
                        console.log('About to show upgrade modal...');
                        showUpgradeModal(upgradeName, upgradeCost, upgradeDescription);
                        console.log('=== UPGRADE CLICK COMPLETED ===');
                    });
                    upgradeItem.dataset.clickBound = 'true';
                } else if (starSystem.upgrades[upgradeName]) {
                    console.log(`Upgrade ${upgradeName} is already unlocked - no click handler bound`);
                }
            });
        }
    });
}

function showSaveIndicator() {
    // Create a temporary save indicator
    const saveIndicator = document.createElement('div');
    saveIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        font-size: 0.875rem;
        z-index: 2000;
        animation: fadeInOut 1s ease-in-out forwards;
    `;
    saveIndicator.textContent = 'Game Saved';
    
    document.body.appendChild(saveIndicator);
    
    setTimeout(() => {
        if (saveIndicator.parentNode) {
            saveIndicator.parentNode.removeChild(saveIndicator);
        }
    }, 1000);
}

function showSaveError() {
    // Create a temporary error indicator
    const errorIndicator = document.createElement('div');
    errorIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        font-size: 0.875rem;
        z-index: 2000;
        animation: fadeInOut 2s ease-in-out forwards;
    `;
    errorIndicator.textContent = 'Save Failed';
    
    document.body.appendChild(errorIndicator);
    
    setTimeout(() => {
        if (errorIndicator.parentNode) {
            errorIndicator.parentNode.removeChild(errorIndicator);
        }
    }, 2000);
}

function checkAndUnlockSystems() {
    console.log('Checking system unlock prerequisites...');
    
    // Check if system 2 should be unlocked (system 1's Nuclear Fusion)
    if (gameState.starSystems[1] && gameState.starSystems[1].upgrades && gameState.starSystems[1].upgrades['Nuclear Fusion'] && 
        gameState.starSystems[2] && !gameState.starSystems[2].unlocked) {
        console.log('System 2 should be unlocked - Nuclear Fusion is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 2);
        gameState.starSystems[2].unlocked = true;
    }
    
    // Check if system 3 should be unlocked (system 2's Add Mass)
    if (gameState.starSystems[2] && gameState.starSystems[2].upgrades && gameState.starSystems[2].upgrades['Add Mass'] && 
        gameState.starSystems[3] && !gameState.starSystems[3].unlocked) {
        console.log('System 3 should be unlocked - System 2 Add Mass is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 3);
        gameState.starSystems[3].unlocked = true;
    }
    
    // Check if system 4 should be unlocked (system 3's Add Mass)
    if (gameState.starSystems[3] && gameState.starSystems[3].upgrades && gameState.starSystems[3].upgrades['Add Mass'] && 
        gameState.starSystems[4] && !gameState.starSystems[4].unlocked) {
        console.log('System 4 should be unlocked - System 3 Add Mass is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 4);
        gameState.starSystems[4].unlocked = true;
    }
    
    // Check if system 5 should be unlocked (system 4's Add Mass)
    if (gameState.starSystems[4] && gameState.starSystems[4].upgrades && gameState.starSystems[4].upgrades['Add Mass'] && 
        gameState.starSystems[5] && !gameState.starSystems[5].unlocked) {
        console.log('System 5 should be unlocked - System 4 Add Mass is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 5);
        gameState.starSystems[5].unlocked = true;
    }
    
    // Check if system 6 should be unlocked (system 5's Add Mass)
    if (gameState.starSystems[5] && gameState.starSystems[5].upgrades && gameState.starSystems[5].upgrades['Add Mass'] && 
        gameState.starSystems[6] && !gameState.starSystems[6].unlocked) {
        console.log('System 6 should be unlocked - System 5 Add Mass is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 6);
        gameState.starSystems[6].unlocked = true;
    }
    
    // Check if system 7 should be unlocked (system 6's Unlock Extreme Objects)
    if (gameState.starSystems[6] && gameState.starSystems[6].upgrades && gameState.starSystems[6].upgrades['Unlock Extreme Objects'] && 
        gameState.starSystems[7] && !gameState.starSystems[7].unlocked) {
        console.log('System 7 should be unlocked - System 6 Unlock Extreme Objects is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 7);
        gameState.starSystems[7].unlocked = true;
    }
    
    // Check if system 8 should be unlocked (system 7's Densify)
    if (gameState.starSystems[7] && gameState.starSystems[7].upgrades && gameState.starSystems[7].upgrades['Densify'] && 
        gameState.starSystems[8] && !gameState.starSystems[8].unlocked) {
        console.log('System 8 should be unlocked - System 7 Densify is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 8);
        gameState.starSystems[8].unlocked = true;
    }
    
    // Check if system 11 should be unlocked (system 10's Activate Quasar)
    if (gameState.starSystems[10] && gameState.starSystems[10].upgrades && gameState.starSystems[10].upgrades['Activate Quasar'] &&
        gameState.starSystems[11] && !gameState.starSystems[11].unlocked) {
        console.log('System 11 should be unlocked - System 10 Activate Quasar is purchased');
        gameState.starsUnlocked = Math.max(gameState.starsUnlocked, 11);
        gameState.starSystems[11].unlocked = true;
    }
    
    // Update UI to reflect any newly unlocked systems
    if (gameState.starsUnlocked > 1) {
        updateStarCollectionFromState();
        updateUI();
        saveGame();
    }
}

// Auto-Clicker Functions
function initAutoClicker() {
    const toggleButton = document.getElementById('toggleAutoClicker');
    const clickRateSelect = document.getElementById('clickRate');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleAutoClicker);
    }
    
    if (clickRateSelect) {
        clickRateSelect.addEventListener('change', (e) => {
            gameState.autoClickerRate = e.target.value;
            if (gameState.autoClickerActive) {
                // Restart auto-clicker with new rate
                stopAutoClicker();
                startAutoClicker();
            }
            saveGame();
        });
    }
    
    // Update UI with current state
    updateAutoClickerUI();
}

function toggleAutoClicker() {
    console.log('Auto-clicker toggle clicked. Current state:', gameState.autoClickerActive);
    if (gameState.autoClickerActive) {
        console.log('Stopping auto-clicker...');
        stopAutoClicker();
    } else {
        console.log('Starting auto-clicker...');
        startAutoClicker();
    }
}

function startAutoClicker() {
    if (gameState.autoClickerActive) return;
    
    gameState.autoClickerActive = true;
    
    // Get click rate settings
    const rateSettings = {
        'slow': { interval: 2000, clicksPerMinute: 30 }, // 2 seconds between clicks
        'normal': { interval: 1000, clicksPerMinute: 60 }, // 1 second between clicks
        'fast': { interval: 667, clicksPerMinute: 90 }, // ~0.67 seconds between clicks
        'ultra': { interval: 200, clicksPerMinute: 300 }, // 0.2 seconds between clicks
        'insane': { interval: 100, clicksPerMinute: 600 }, // 0.1 seconds between clicks
        'ludicrous': { interval: 50, clicksPerMinute: 1200 } // 0.05 seconds between clicks
    };
    
    const settings = rateSettings[gameState.autoClickerRate] || rateSettings.ultra;
    gameState.autoClickerClicksPerMinute = settings.clicksPerMinute;
    
    // Add some human-like randomness to the interval (reduced for faster speeds)
    const baseInterval = settings.interval;
    const randomVariation = () => {
        // Reduce randomness for faster speeds to maintain performance
        if (baseInterval <= 100) {
            return Math.random() * 20 - 10; // ±10ms for ultra-fast speeds
        } else if (baseInterval <= 200) {
            return Math.random() * 40 - 20; // ±20ms for fast speeds
        } else {
            return Math.random() * 400 - 200; // ±200ms for normal speeds
        }
    };
    
    const performAutoClick = () => {
        if (!gameState.autoClickerActive) return;
        
        // Perform the click
        clickStar();
        gameState.totalAutoClicks++;
        
        // Schedule next click with human-like variation
        const nextInterval = Math.max(25, baseInterval + randomVariation()); // Minimum 25ms for ultra-fast speeds
        gameState.autoClickerInterval = setTimeout(performAutoClick, nextInterval);
    };
    
    // Start the auto-clicker
    performAutoClick();
    
    updateAutoClickerUI();
    saveGame();
}

function stopAutoClicker() {
    if (!gameState.autoClickerActive) return;
    
    gameState.autoClickerActive = false;
    
    if (gameState.autoClickerInterval) {
        clearTimeout(gameState.autoClickerInterval);
        gameState.autoClickerInterval = null;
    }
    
    updateAutoClickerUI();
    saveGame();
}

function updateAutoClickerUI() {
    console.log('Updating auto-clicker UI. Active state:', gameState.autoClickerActive);
    const statusIndicator = document.getElementById('autoClickerStatus');
    const toggleButton = document.getElementById('toggleAutoClicker');
    const clicksPerMinute = document.getElementById('clicksPerMinute');
    const totalAutoClicks = document.getElementById('totalAutoClicks');
    
    console.log('Found elements:', {
        statusIndicator: !!statusIndicator,
        toggleButton: !!toggleButton,
        clicksPerMinute: !!clicksPerMinute,
        totalAutoClicks: !!totalAutoClicks
    });
    
    if (statusIndicator) {
        if (gameState.autoClickerActive) {
            console.log('Setting status to active');
            statusIndicator.className = 'status-indicator active';
            statusIndicator.innerHTML = '<i class="fas fa-circle text-green-500"></i><span>Active</span>';
        } else {
            console.log('Setting status to inactive');
            statusIndicator.className = 'status-indicator inactive';
            statusIndicator.innerHTML = '<i class="fas fa-circle text-red-500"></i><span>Inactive</span>';
        }
    }
    
    if (toggleButton) {
        if (gameState.autoClickerActive) {
            console.log('Setting button to stop state');
            toggleButton.className = 'btn-auto-clicker active';
            toggleButton.innerHTML = '<i class="fas fa-stop mr-2"></i><span>Stop Auto-Clicker</span>';
        } else {
            console.log('Setting button to start state');
            toggleButton.className = 'btn-auto-clicker';
            toggleButton.innerHTML = '<i class="fas fa-play mr-2"></i><span>Start Auto-Clicker</span>';
        }
    }
    
    if (clicksPerMinute) {
        clicksPerMinute.textContent = gameState.autoClickerClicksPerMinute;
    }
    
    if (totalAutoClicks) {
        totalAutoClicks.textContent = formatNumber(gameState.totalAutoClicks);
    }
}

// Export for potential use by game engine
window.gameState = gameState;
window.saveGame = saveGame;
