// Space Explorer 3D - System Loader
// Handles loading and caching of star system JSON data

class SystemLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.baseUrl = '/static/data/systems/';
    }
    
    async loadSystem(systemName) {
        // Return cached data if available
        if (this.cache.has(systemName)) {
            return this.cache.get(systemName);
        }
        
        // Return existing loading promise if already loading
        if (this.loadingPromises.has(systemName)) {
            return this.loadingPromises.get(systemName);
        }
        
        // Start loading
        const promise = this.loadSystemData(systemName);
        this.loadingPromises.set(systemName, promise);
        
        try {
            const systemData = await promise;
            this.cache.set(systemName, systemData);
            return systemData;
        } finally {
            this.loadingPromises.delete(systemName);
        }
    }
    
    async loadSystemData(systemName) {
        const url = `${this.baseUrl}${systemName}.json`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load system: ${systemName} (${response.status})`);
            }
            
            const data = await response.json();
            this.validateSystemData(data);
            return data;
        } catch (error) {
            console.error(`Error loading system ${systemName}:`, error);
            throw error;
        }
    }
    
    validateSystemData(data) {
        // Basic validation
        if (!data.systemName) {
            throw new Error('System data missing systemName');
        }
        
        if (!data.centralObject) {
            throw new Error('System data missing centralObject');
        }
        
        if (!data.centralObject.name) {
            throw new Error('Central object missing name');
        }
        
        if (!data.centralObject.type) {
            throw new Error('Central object missing type');
        }
        
        // Validate objects array if present
        if (data.objects && Array.isArray(data.objects)) {
            data.objects.forEach((obj, index) => {
                if (!obj.name) {
                    throw new Error(`Object ${index} missing name`);
                }
                if (!obj.type) {
                    throw new Error(`Object ${index} missing type`);
                }
            });
        }
    }
    
    getCachedSystem(systemName) {
        return this.cache.get(systemName);
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    getCacheSize() {
        return this.cache.size;
    }
    
    // Preload systems for better performance
    async preloadSystems(systemNames) {
        const promises = systemNames.map(name => this.loadSystem(name));
        return Promise.all(promises);
    }
}

// Export for use in other modules
window.SystemLoader = SystemLoader;
