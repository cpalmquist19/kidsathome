// Space Explorer 3D - Enhanced Object Renderer
// Handles advanced rendering of stars, planets, and other celestial objects

class ObjectRenderer {
    constructor(spaceExplorer) {
        this.spaceExplorer = spaceExplorer;
        this.scene = spaceExplorer.scene;
        this.renderer = spaceExplorer.renderer;
        
        // Material caches
        this.starMaterials = new Map();
        this.planetMaterials = new Map();
        this.atmosphereMaterials = new Map();
        
        // Effect objects
        this.starGlow = null;
        this.particleSystems = new Map();
        
        this.init();
    }
    
    init() {
        this.setupStarEffects();
        this.setupParticleSystems();
    }
    
    setupStarEffects() {
        // Create star glow effect
        this.createStarGlow();
    }
    
    setupParticleSystems() {
        // Initialize particle systems for various effects
        this.createSpaceDust();
    }
    
    createStarGlow() {
        // Create a large sphere for star glow effect
        const glowGeometry = new THREE.SphereGeometry(1, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.starGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.starGlow.visible = false;
        this.scene.add(this.starGlow);
    }
    
    createSpaceDust() {
        // Create space dust particle system
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a large sphere
            positions[i3] = (Math.random() - 0.5) * 200000;
            positions[i3 + 1] = (Math.random() - 0.5) * 200000;
            positions[i3 + 2] = (Math.random() - 0.5) * 200000;
            
            // Random colors (white to blue)
            const color = new THREE.Color();
            color.setHSL(0.6, 0.1, Math.random() * 0.5 + 0.1);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.particleSystems.set('spaceDust', particleSystem);
        this.scene.add(particleSystem);
    }
    
    // Star rendering methods
    createStar(data) {
        const radius = this.calculateStarRadius(data);
        const color = this.calculateStarColor(data);
        
        // Create star geometry
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        
        // Create star material with emissive properties
        const material = this.createStarMaterial(data, color);
        
        const star = new THREE.Mesh(geometry, material);
        
        // Add star glow
        this.addStarGlow(star, radius, color);
        
        // Add star corona effect
        this.addStarCorona(star, radius, color);
        
        return star;
    }
    
    calculateStarRadius(data) {
        // Base radius calculation with MASSIVE scaling for visibility
        let baseRadius = data.radius || 1000;
        
        // Scale based on spectral type with MUCH larger multipliers for visibility
        const spectralType = data.spectralType || 'G';
        const typeMultipliers = {
            'O': 200.0, 'B': 150.0, 'A': 120.0, 'F': 100.0, 'G': 80.0, 'K': 60.0, 'M': 40.0
        };
        
        const multiplier = typeMultipliers[spectralType] || 80.0;
        return baseRadius * multiplier;
    }
    
    calculateStarColor(data) {
        // Use provided color or calculate from temperature
        if (data.color) {
            return new THREE.Color(data.color);
        }
        
        // Calculate color from temperature (simplified)
        const temp = data.temperature || 5778;
        const color = new THREE.Color();
        
        if (temp > 10000) {
            color.setHex(0x9BB5FF); // Blue-white
        } else if (temp > 7500) {
            color.setHex(0xAABFFF); // Blue-white
        } else if (temp > 6000) {
            color.setHex(0xCAD7FF); // White
        } else if (temp > 5000) {
            color.setHex(0xFFF4E6); // Yellow-white
        } else if (temp > 3500) {
            color.setHex(0xFFF2CC); // Yellow
        } else if (temp > 2000) {
            color.setHex(0xFF6B47); // Orange
        } else {
            color.setHex(0xFF2D00); // Red
        }
        
        return color;
    }
    
    createStarMaterial(data, color) {
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.2, // Increased from 0.3 to 1.2 for much brighter stars
            roughness: 0.1,
            metalness: 0.0
        });
        
        // Add surface texture if available
        if (data.texture) {
            const loader = new THREE.TextureLoader();
            loader.load(data.texture, (texture) => {
                material.map = texture;
                material.needsUpdate = true;
            });
        }
        
        return material;
    }
    
    addStarGlow(star, radius, color) {
        // Create glow effect around star
        const glowGeometry = new THREE.SphereGeometry(radius * 2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3, // Increased from 0.1 to 0.3 for more visible glow
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        star.add(glow);
    }
    
    addStarCorona(star, radius, color) {
        // Create corona effect
        const coronaGeometry = new THREE.SphereGeometry(radius * 1.5, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15, // Increased from 0.05 to 0.15 for more visible corona
            side: THREE.BackSide
        });
        
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        star.add(corona);
    }
    
    // Planet rendering methods
    createPlanet(data) {
        const radius = this.calculatePlanetRadius(data);
        const color = this.calculatePlanetColor(data);
        
        // Create planet geometry
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        
        // Create planet material
        const material = this.createPlanetMaterial(data, color);
        
        const planet = new THREE.Mesh(geometry, material);
        
        // Add atmosphere if present
        if (data.atmosphere) {
            this.addPlanetAtmosphere(planet, radius, data);
        }
        
        // Add rings if present
        if (data.rings) {
            this.addPlanetRings(planet, radius, data);
        }
        
        return planet;
    }
    
    calculatePlanetRadius(data) {
        // Base radius with significant scaling for visibility
        let baseRadius = data.radius || 100;
        
        // Scale based on planet type with much larger multipliers for visibility
        const typeMultipliers = {
            'terrestrial': 1000.0,     // Much larger for visibility
            'gas_giant': 3000.0,       // Even larger for gas giants
            'ice_giant': 2000.0,       // Large for ice giants
            'dwarf_planet': 500.0      // Smaller but still visible
        };
        
        const multiplier = typeMultipliers[data.subtype] || 100.0;
        return baseRadius * multiplier;
    }
    
    calculatePlanetColor(data) {
        if (data.color) {
            return new THREE.Color(data.color);
        }
        
        // Default colors based on type
        const defaultColors = {
            'terrestrial': 0x8B7355,
            'gas_giant': 0xD8CA9D,
            'ice_giant': 0x4FD0E7,
            'dwarf_planet': 0x8B7355
        };
        
        return new THREE.Color(defaultColors[data.subtype] || 0x888888);
    }
    
    createPlanetMaterial(data, color) {
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.1, // Add slight self-illumination for better visibility
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Add surface texture if available
        if (data.texture) {
            const loader = new THREE.TextureLoader();
            loader.load(data.texture, (texture) => {
                material.map = texture;
                material.needsUpdate = true;
            });
        }
        
        return material;
    }
    
    addPlanetAtmosphere(planet, radius, data) {
        const atmosphereRadius = radius * 1.1;
        const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        
        const atmosphereColor = data.atmosphereColor ? 
            new THREE.Color(data.atmosphereColor) : 
            new THREE.Color(0x87CEEB);
            
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: atmosphereColor,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    }
    
    addPlanetRings(planet, radius, data) {
        const ringGeometry = new THREE.RingGeometry(radius * 1.5, radius * 2.5, 32);
        const ringColor = data.ringColor ? 
            new THREE.Color(data.ringColor) : 
            new THREE.Color(0xDAA520);
            
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: ringColor,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2; // Rotate to be horizontal
        planet.add(rings);
    }
    
    // Moon rendering
    createMoon(data) {
        const radius = (data.radius || 50) * 0.3; // Moons are smaller
        const color = data.color ? new THREE.Color(data.color) : new THREE.Color(0xC0C0C0);
        
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.05 // Add slight self-illumination
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    // Asteroid belt rendering
    createAsteroidBelt(data) {
        const particleCount = data.particleCount || 1000;
        const innerRadius = data.innerRadius || 200000;
        const outerRadius = data.outerRadius || 320000;
        
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random position in ring
            const angle = Math.random() * Math.PI * 2;
            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            
            positions[i3] = Math.cos(angle) * distance;
            positions[i3 + 1] = (Math.random() - 0.5) * 10000; // Random height
            positions[i3 + 2] = Math.sin(angle) * distance;
            
            // Random colors
            const color = new THREE.Color(data.color || 0x8B7355);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(particles, particleMaterial);
    }
    
    // Update methods
    update(deltaTime) {
        // Update particle systems
        this.particleSystems.forEach((system, name) => {
            if (name === 'spaceDust') {
                system.rotation.y += deltaTime * 0.0001;
            }
        });
    }
    
    // Cleanup
    dispose() {
        // Dispose of materials
        this.starMaterials.forEach(material => material.dispose());
        this.planetMaterials.forEach(material => material.dispose());
        this.atmosphereMaterials.forEach(material => material.dispose());
        
        // Clear maps
        this.starMaterials.clear();
        this.planetMaterials.clear();
        this.atmosphereMaterials.clear();
        
        // Remove particle systems
        this.particleSystems.forEach(system => {
            this.scene.remove(system);
            system.geometry.dispose();
            system.material.dispose();
        });
        this.particleSystems.clear();
    }
}

// Export for use in other modules
window.ObjectRenderer = ObjectRenderer;
