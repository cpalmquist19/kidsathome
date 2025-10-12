// Space Explorer 3D - Time Control System
// Manages time acceleration, pause/play, and orbital mechanics

class TimeControlSystem {
    constructor(spaceExplorer) {
        this.spaceExplorer = spaceExplorer;
        this.isPaused = false;
        this.timeSpeed = 1.0;
        this.speedLevels = [0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 50.0, 100.0, 500.0, 1000.0, 5000.0, 10000.0];
        this.currentSpeedIndex = 3; // Start at 1.0x
        
        this.orbitalObjects = new Map(); // Track objects with orbital data
        this.animationStartTime = performance.now();
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.setupEventListeners();
        console.log('Time Control System initialized');
    }
    
    setupUI() {
        // Get UI elements
        this.pausePlayBtn = document.getElementById('time-pause-play');
        this.speedDisplay = document.getElementById('time-speed-display');
        this.slowDownBtn = document.getElementById('time-slow-down');
        this.speedUpBtn = document.getElementById('time-speed-up');
        this.resetBtn = document.getElementById('time-reset');
        
        // Update initial display
        this.updateSpeedDisplay();
        this.updatePausePlayButton();
    }
    
    setupEventListeners() {
        if (this.pausePlayBtn) {
            this.pausePlayBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (this.slowDownBtn) {
            this.slowDownBtn.addEventListener('click', () => this.slowDown());
        }
        
        if (this.speedUpBtn) {
            this.speedUpBtn.addEventListener('click', () => this.speedUp());
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetToNormal());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.slowDown();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.speedUp();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.resetToNormal();
                    break;
            }
        });
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        this.updatePausePlayButton();
        console.log(`Time ${this.isPaused ? 'paused' : 'resumed'} at ${this.timeSpeed}x speed`);
    }
    
    slowDown() {
        if (this.currentSpeedIndex > 0) {
            this.currentSpeedIndex--;
            this.timeSpeed = this.speedLevels[this.currentSpeedIndex];
            this.updateSpeedDisplay();
            console.log(`Time speed decreased to ${this.timeSpeed}x`);
        }
    }
    
    speedUp() {
        if (this.currentSpeedIndex < this.speedLevels.length - 1) {
            this.currentSpeedIndex++;
            this.timeSpeed = this.speedLevels[this.currentSpeedIndex];
            this.updateSpeedDisplay();
            console.log(`Time speed increased to ${this.timeSpeed}x`);
        }
    }
    
    resetToNormal() {
        this.isPaused = false;
        this.currentSpeedIndex = 2; // 1.0x
        this.timeSpeed = 1.0;
        this.updateSpeedDisplay();
        this.updatePausePlayButton();
        console.log('Time reset to normal (1x, playing)');
    }
    
    updateSpeedDisplay() {
        if (this.speedDisplay) {
            this.speedDisplay.textContent = `${this.timeSpeed}x`;
        }
    }
    
    updatePausePlayButton() {
        if (this.pausePlayBtn) {
            if (this.isPaused) {
                this.pausePlayBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Play';
                this.pausePlayBtn.classList.remove('from-cyan-600', 'to-teal-600', 'hover:from-cyan-700', 'hover:to-teal-700');
                this.pausePlayBtn.classList.add('from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700');
            } else {
                this.pausePlayBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pause';
                this.pausePlayBtn.classList.remove('from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700');
                this.pausePlayBtn.classList.add('from-cyan-600', 'to-teal-600', 'hover:from-cyan-700', 'hover:to-teal-700');
            }
        }
    }
    
    // Register an object for orbital motion
    registerOrbitalObject(object, orbitalData) {
        this.orbitalObjects.set(object, {
            ...orbitalData,
            startTime: performance.now(),
            currentAngle: 0
        });
        console.log(`Registered orbital object: ${orbitalData.name} with period ${orbitalData.orbitalPeriod} days`);
    }
    
    // Unregister an object (when system changes)
    unregisterOrbitalObject(object) {
        this.orbitalObjects.delete(object);
    }
    
    // Clear all orbital objects
    clearOrbitalObjects() {
        this.orbitalObjects.clear();
        console.log('Cleared all orbital objects');
    }
    
    // Update orbital positions based on time
    updateOrbitalMotion(deltaTime) {
        if (this.isPaused) {
            return;
        }
        
        const effectiveDeltaTime = deltaTime * this.timeSpeed;
        
        // Only log occasionally to avoid spam
        // Reduced logging frequency
        if (Math.random() < 0.001) { // 0.1% chance
            console.log(`Orbital objects: ${this.orbitalObjects.size}`);
        }
        
        this.orbitalObjects.forEach((orbitalData, object) => {
            if (!orbitalData.orbitalPeriod) {
                return;
            }
            
            // Calculate orbital angle based on time
            const orbitalSpeed = (2 * Math.PI) / (orbitalData.orbitalPeriod * 24 * 3600); // radians per second
            orbitalData.currentAngle += orbitalSpeed * effectiveDeltaTime;
            
            // Keep angle between 0 and 2π
            orbitalData.currentAngle = orbitalData.currentAngle % (2 * Math.PI);
            
            // Debug: Log position changes for first object (reduced frequency)
            if ((orbitalData.name === 'Debug Planet' || orbitalData.name === 'Mercury') && Math.random() < 0.1) {
                const x = Math.cos(orbitalData.currentAngle) * orbitalData.distance;
                const z = Math.sin(orbitalData.currentAngle) * orbitalData.distance;
                // Orbital logging removed to reduce spam
            }
            
            // Update object position
            this.updateObjectPosition(object, orbitalData);
        });
    }
    
    updateObjectPosition(object, orbitalData) {
        if (!orbitalData.distance) {
            return;
        }
        
        // Calculate new position based on orbital angle
        const x = Math.cos(orbitalData.currentAngle) * orbitalData.distance;
        const z = Math.sin(orbitalData.currentAngle) * orbitalData.distance;
        
        // Debug: Log actual position changes (reduced frequency)
        if ((orbitalData.name === 'Debug Planet' || orbitalData.name === 'Mercury') && Math.random() < 0.05) {
            // Position logging removed to reduce spam
        }
        
        // Update object position
        object.position.set(x, 0, z);
        
        // Update moons if they exist
        if (orbitalData.moons) {
            orbitalData.moons.forEach(moonData => {
                this.updateMoonPosition(object, moonData);
            });
        }
    }
    
    updateMoonPosition(planet, moonData) {
        if (!moonData.orbitalPeriod) return;
        
        // Find the moon object
        const moon = planet.children.find(child => 
            child.userData && child.userData.name === moonData.name
        );
        
        if (!moon) return;
        
        // Calculate moon's orbital angle
        const moonOrbitalSpeed = (2 * Math.PI) / (moonData.orbitalPeriod * 24 * 3600);
        const currentTime = performance.now();
        const moonAngle = (moonOrbitalSpeed * currentTime / 1000) % (2 * Math.PI);
        
        // Position moon relative to planet
        const moonX = Math.cos(moonAngle) * moonData.distance;
        const moonZ = Math.sin(moonAngle) * moonData.distance;
        
        moon.position.set(moonX, 0, moonZ);
    }
    
    // Get current time state
    getTimeState() {
        return {
            isPaused: this.isPaused,
            timeSpeed: this.timeSpeed,
            speedLevel: this.currentSpeedIndex
        };
    }
    
    // Set time state (for persistence)
    setTimeState(state) {
        this.isPaused = state.isPaused || false;
        this.currentSpeedIndex = state.speedLevel || 2;
        this.timeSpeed = this.speedLevels[this.currentSpeedIndex];
        
        this.updateSpeedDisplay();
        this.updatePausePlayButton();
    }
    
    // Update method called from main animation loop
    update(deltaTime) {
        this.updateOrbitalMotion(deltaTime);
    }
}

// Export for use in other modules
window.TimeControlSystem = TimeControlSystem;
