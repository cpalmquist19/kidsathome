// Space Explorer 3D - Scaling System
// Handles hybrid scaling, time controls, and zoom level management

class ScalingSystem {
    constructor(spaceExplorer) {
        this.spaceExplorer = spaceExplorer;
        this.scene = spaceExplorer.scene;
        this.camera = spaceExplorer.camera;
        this.controls = spaceExplorer.controls;
        
        // Scaling settings
        this.scaleMode = 'compressed'; // 'realistic' or 'compressed'
        this.logarithmicBase = 10;
        this.scaleFactor = 1;
        
        // Time controls
        this.timeAcceleration = 1.0;
        this.isPaused = false;
        this.timeSpeed = 1.0;
        
        // Zoom levels - adjusted for better visibility
        this.zoomLevels = {
            'realistic': {
                'close': 10000,
                'medium': 50000,
                'far': 200000,
                'system': 1000000
            },
            'compressed': {
                'close': 1000,
                'medium': 10000,
                'far': 50000,
                'system': 200000
            }
        };
        
        this.currentZoomLevel = 'medium';
        this.originalPositions = new Map();
        this.scaledObjects = new Map();
        
        this.init();
    }
    
    init() {
        // UI controls are now handled by the HTML template
        // Just setup the event listeners for the existing UI elements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Zoom level controls
        const zoomClose = document.getElementById('zoomClose');
        const zoomMedium = document.getElementById('zoomMedium');
        const zoomFar = document.getElementById('zoomFar');
        const zoomSystem = document.getElementById('zoomSystem');
        
        if (zoomClose) zoomClose.addEventListener('click', () => this.setZoomLevel('close'));
        if (zoomMedium) zoomMedium.addEventListener('click', () => this.setZoomLevel('medium'));
        if (zoomFar) zoomFar.addEventListener('click', () => this.setZoomLevel('far'));
        if (zoomSystem) zoomSystem.addEventListener('click', () => this.setZoomLevel('system'));
        
        // Scale mode controls
        const realisticScale = document.getElementById('realisticScale');
        const compressedScale = document.getElementById('compressedScale');
        
        if (realisticScale) realisticScale.addEventListener('click', () => this.setScaleMode('realistic'));
        if (compressedScale) compressedScale.addEventListener('click', () => this.setScaleMode('compressed'));
        
        // Initialize UI state
        this.updateZoomDisplay();
        this.updateScaleDisplay();
    }
    
    // UI creation methods removed - now handled by HTML template
    
    // Old event attachment methods removed - now handled by setupEventListeners()
    
    // Time control methods removed - now handled by TimeControlSystem
    
    // Scale control methods
    setScaleMode(mode) {
        this.scaleMode = mode;
        this.updateScaleDisplay();
        this.applyScaling();
    }
    
    updateScaleDisplay() {
        const currentScale = document.getElementById('current-scale-mode');
        const realisticBtn = document.getElementById('realisticScale');
        const compressedBtn = document.getElementById('compressedScale');
        
        if (currentScale) {
            currentScale.textContent = this.scaleMode === 'realistic' ? 'Realistic' : 'Compressed';
        }
        
        // Update button states
        if (realisticBtn && compressedBtn) {
            if (this.scaleMode === 'realistic') {
                realisticBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                realisticBtn.classList.add('bg-purple-800');
                compressedBtn.classList.remove('bg-purple-800');
                compressedBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
            } else {
                compressedBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                compressedBtn.classList.add('bg-purple-800');
                realisticBtn.classList.remove('bg-purple-800');
                realisticBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
            }
        }
    }
    
    // Zoom control methods
    setZoomLevel(level) {
        this.currentZoomLevel = level;
        this.updateZoomDisplay();
        this.applyZoom();
    }
    
    updateZoomDisplay() {
        // Update button states
        const buttons = ['zoomClose', 'zoomMedium', 'zoomFar', 'zoomSystem'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('bg-teal-800');
                btn.classList.add('bg-teal-600', 'hover:bg-teal-700');
            }
        });
        
        const activeBtn = document.getElementById(`zoom${this.currentZoomLevel.charAt(0).toUpperCase() + this.currentZoomLevel.slice(1)}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-teal-600', 'hover:bg-teal-700');
            activeBtn.classList.add('bg-teal-800');
        }
    }
    
    // Scaling calculations
    calculateLogarithmicScale(distance) {
        if (this.scaleMode === 'realistic') {
            return distance;
        }
        
        // Logarithmic scaling for compressed view
        const logDistance = Math.log10(Math.max(1, distance));
        const maxLogDistance = Math.log10(1000000000); // 1 billion km
        const normalizedLog = logDistance / maxLogDistance;
        const compressedDistance = normalizedLog * 100000; // Max 100k units
        
        return compressedDistance;
    }
    
    applyScaling() {
        // Store original positions if not already stored
        if (this.originalPositions.size === 0) {
            this.scene.traverse((child) => {
                if (child.userData && child.userData.distance !== undefined) {
                    this.originalPositions.set(child.userData.name, child.position.clone());
                }
            });
        }
        
        // Apply scaling to all objects
        this.scene.traverse((child) => {
            if (child.userData && child.userData.distance !== undefined) {
                const originalPos = this.originalPositions.get(child.userData.name);
                if (originalPos) {
                    const scaledDistance = this.calculateLogarithmicScale(child.userData.distance);
                    const direction = originalPos.clone().normalize();
                    child.position.copy(direction.multiplyScalar(scaledDistance));
                }
            }
        });
    }
    
    applyZoom() {
        const zoomDistance = this.zoomLevels[this.scaleMode][this.currentZoomLevel];
        
        // Move camera to appropriate distance from the center
        const currentDirection = this.camera.position.clone().normalize();
        const targetPosition = currentDirection.multiplyScalar(zoomDistance);
        this.camera.position.copy(targetPosition);
        
        // Update controls movement speed based on zoom level
        if (this.controls) {
            this.controls.movementSpeed = zoomDistance * 0.1;
            this.controls.minDistance = zoomDistance * 0.1;
            this.controls.maxDistance = zoomDistance * 10;
        }
        
        console.log(`Applied zoom level ${this.currentZoomLevel}: distance=${zoomDistance}, camera position=`, this.camera.position);
    }
    
    // Update method called from main animation loop
    update(deltaTime) {
        if (!this.isPaused) {
            // Apply time acceleration to any animations
            const adjustedDeltaTime = deltaTime * this.timeAcceleration;
            
            // Update orbital positions if needed
            this.updateOrbitalPositions(adjustedDeltaTime);
        }
    }
    
    updateOrbitalPositions(deltaTime) {
        // Simple orbital motion (can be enhanced later)
        this.scene.traverse((child) => {
            if (child.userData && child.userData.orbitalPeriod) {
                const rotationSpeed = (2 * Math.PI) / (child.userData.orbitalPeriod * 24 * 3600); // Convert days to seconds
                child.rotation.y += rotationSpeed * deltaTime;
            }
        });
    }
    
    // Public API
    getTimeAcceleration() {
        return this.timeAcceleration;
    }
    
    getScaleMode() {
        return this.scaleMode;
    }
    
    getCurrentZoomLevel() {
        return this.currentZoomLevel;
    }
    
    // Cleanup
    dispose() {
        // UI elements are now part of the HTML template, no cleanup needed
        console.log('ScalingSystem disposed');
    }
}

// Export for use in other modules
window.ScalingSystem = ScalingSystem;
