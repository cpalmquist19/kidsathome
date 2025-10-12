// Space Explorer 3D - Main Integration
// Connects UI to Three.js scene and system loading

class SpaceExplorer3DMain {
    constructor() {
        this.spaceExplorer = null;
        this.systemLoader = null;
        this.currentSystem = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.setupSystemLoader();
        this.setupSpaceExplorer();
        this.setupUI();
        this.isInitialized = true;
    }
    
    setupSystemLoader() {
        this.systemLoader = new SystemLoader();
    }
    
    setupSpaceExplorer() {
        const container = document.getElementById('simulation-container');
        if (!container) {
            console.error('Simulation container not found');
            return;
        }
        
        console.log('Creating SpaceExplorer3D...');
        this.spaceExplorer = new SpaceExplorer3D('simulation-container');
        console.log('SpaceExplorer3D created successfully');
    }
    
    setupUI() {
        // System selection dropdown
        const systemSelect = document.getElementById('systemSelect');
        if (systemSelect) {
            systemSelect.addEventListener('change', (event) => {
                this.onSystemSelect(event.target.value);
            });
        } else {
            console.error('systemSelect element not found!');
        }
        
        // Teleport button
        const teleportBtn = document.getElementById('teleportBtn');
        if (teleportBtn) {
            teleportBtn.addEventListener('click', () => {
                this.onTeleport();
            });
        }
        
        // Time control system integration
        this.setupTimeControls();
        
        // Quality settings (if available)
        this.setupQualitySettings();
    }
    
    setupTimeControls() {
        // Time controls are handled by the TimeControlSystem class
        // This method can be used for additional UI integration if needed
        console.log('Time controls setup completed');
    }
    
    setupQualitySettings() {
        // Create quality settings dropdown if it doesn't exist
        const qualitySelect = document.getElementById('qualitySelect');
        if (qualitySelect) {
            qualitySelect.addEventListener('change', (event) => {
                this.onQualityChange(event.target.value);
            });
        }
    }
    
    async onSystemSelect(systemName) {
        if (!systemName) {
            this.updateTeleportButton(false);
            this.updateCurrentSystemDisplay('None Selected');
            return;
        }
        
        this.updateTeleportButton(true);
        this.updateCurrentSystemDisplay(systemName);
    }
    
    async onTeleport() {
        const systemSelect = document.getElementById('systemSelect');
        const selectedSystem = systemSelect.value;
        
        if (!selectedSystem) {
            console.warn('No system selected');
            return;
        }
        
        try {
            this.showLoadingState(true);
            
            // Load system data
            const systemData = await this.systemLoader.loadSystem(selectedSystem);
            
            // Load system into 3D scene
            this.spaceExplorer.loadSystem(systemData);
            
            // Update UI
            this.updateSystemInfo(systemData);
            this.hideInstructions();
            
            this.currentSystem = selectedSystem;
            
        } catch (error) {
            console.error('Error loading system:', error);
            this.showError(`Failed to load system: ${error.message}`);
        } finally {
            this.showLoadingState(false);
        }
    }
    
    onQualityChange(quality) {
        if (this.spaceExplorer) {
            // Update renderer settings based on quality
            this.updateRendererQuality(quality);
        }
    }
    
    updateRendererQuality(quality) {
        const renderer = this.spaceExplorer.renderer;
        
        switch(quality) {
            case 'low':
                renderer.antialias = false;
                renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                renderer.antialias = true;
                renderer.shadowMap.enabled = true;
                break;
            case 'high':
                renderer.antialias = true;
                renderer.shadowMap.enabled = true;
                break;
        }
    }
    
    updateTeleportButton(enabled) {
        const teleportBtn = document.getElementById('teleportBtn');
        if (teleportBtn) {
            teleportBtn.disabled = !enabled;
            if (enabled) {
                teleportBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                teleportBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            console.error('teleportBtn element not found!');
        }
    }
    
    updateCurrentSystemDisplay(systemName) {
        const currentSystemDisplay = document.getElementById('current-system');
        if (currentSystemDisplay) {
            currentSystemDisplay.textContent = systemName;
        } else {
            console.error('current-system element not found!');
        }
    }
    
    updateSystemInfo(systemData) {
        const systemInfo = document.getElementById('system-info');
        if (systemInfo) {
            systemInfo.innerHTML = `
                <div class="space-y-2">
                    <div class="flex items-center">
                        <i class="fas fa-star text-yellow-400 mr-2"></i>
                        <span class="font-bold text-purple-200">${systemData.systemName}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-sun text-orange-400 mr-2"></i>
                        <span class="text-purple-100">Central: ${systemData.centralObject.name}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-globe text-blue-400 mr-2"></i>
                        <span class="text-purple-100">Objects: ${systemData.objects ? systemData.objects.length : 0}</span>
                    </div>
                    <div class="mt-3 p-2 bg-purple-800/30 rounded-lg border border-purple-600/30">
                        <div class="text-cyan-300 text-center text-xs">
                            <i class="fas fa-mouse-pointer mr-1"></i>
                            Click on objects to explore them
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    hideInstructions() {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.style.display = 'none';
        }
    }
    
    showLoadingState(loading) {
        const teleportBtn = document.getElementById('teleportBtn');
        if (teleportBtn) {
            if (loading) {
                teleportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
                teleportBtn.disabled = true;
            } else {
                teleportBtn.innerHTML = '<i class="fas fa-rocket mr-2"></i>Teleport to System';
                teleportBtn.disabled = false;
            }
        }
    }
    
    showError(message) {
        const systemInfo = document.getElementById('system-info');
        if (systemInfo) {
            systemInfo.innerHTML = `
                <div class="text-xs text-red-300 mb-1">Error</div>
                <div class="text-xs text-red-100">${message}</div>
            `;
        }
    }
    
    
    // Public API methods
    getCurrentSystem() {
        return this.currentSystem;
    }
    
    getPerformanceData() {
        return this.spaceExplorer ? this.spaceExplorer.getPerformanceData() : null;
    }
    
    // Cleanup method
    destroy() {
        if (this.spaceExplorer) {
            // Clean up Three.js resources
            this.spaceExplorer.clearScene();
        }
    }
}

// Initialize when DOM is ready
let spaceExplorerMain = null;

document.addEventListener('DOMContentLoaded', function() {
    spaceExplorerMain = new SpaceExplorer3DMain();
});

// Export for global access
window.SpaceExplorer3DMain = SpaceExplorer3DMain;
