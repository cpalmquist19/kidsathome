// Space Explorer 3D - Background System
// Handles custom space backgrounds, skybox, and atmospheric effects

class BackgroundSystem {
    constructor(spaceExplorer) {
        this.spaceExplorer = spaceExplorer;
        this.scene = spaceExplorer.scene;
        this.renderer = spaceExplorer.renderer;
        
        // Background elements
        this.backgroundTexture = null;
        this.skybox = null;
        this.spaceDust = null;
        this.starField = null;
        this.nebula = null;
        
        // Settings
        this.backgroundType = 'image'; // 'image', 'skybox', 'procedural'
        this.quality = 'medium';
        
        this.init();
    }
    
    init() {
        this.setupStarField();
        this.setupSpaceDust();
    }
    
    setupStarField() {
        // Create a star field background
        const starCount = 2000;
        const stars = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random positions on a sphere
            const radius = 50000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Random star colors (white to blue)
            const color = new THREE.Color();
            color.setHSL(0.6, 0.1, Math.random() * 0.5 + 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Random sizes
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        stars.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        stars.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.starField = new THREE.Points(stars, starMaterial);
        this.scene.add(this.starField);
    }
    
    setupSpaceDust() {
        // Create space dust particles
        const dustCount = 500;
        const dust = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 100000;
            positions[i3 + 1] = (Math.random() - 0.5) * 100000;
            positions[i3 + 2] = (Math.random() - 0.5) * 100000;
            
            // Dust colors (brown to gray)
            const color = new THREE.Color();
            color.setHSL(0.1, 0.1, Math.random() * 0.3 + 0.1);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        dust.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        dust.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.3
        });
        
        this.spaceDust = new THREE.Points(dust, dustMaterial);
        this.scene.add(this.spaceDust);
    }
    
    loadBackground(systemData) {
        if (!systemData.background) {
            this.setDefaultBackground();
            return;
        }
        
        const background = systemData.background;
        
        switch (background.type) {
            case 'image':
                this.loadBackgroundImage(background);
                break;
            case 'skybox':
                this.loadSkybox(background);
                break;
            case 'procedural':
                this.createProceduralBackground(background);
                break;
            default:
                this.setDefaultBackground();
        }
    }
    
    loadBackgroundImage(background) {
        if (background.url) {
            const loader = new THREE.TextureLoader();
            loader.load(background.url, (texture) => {
                this.scene.background = texture;
                this.backgroundTexture = texture;
                console.log('✅ Background image loaded:', background.url);
            }, undefined, (error) => {
                console.warn('❌ Failed to load background image:', error);
                this.setFallbackBackground(background);
            });
        } else {
            this.setFallbackBackground(background);
        }
    }
    
    setFallbackBackground(background) {
        if (background.tint) {
            this.scene.background = new THREE.Color(background.tint);
        } else {
            this.setDefaultBackground();
        }
    }
    
    loadSkybox(background) {
        if (background.skyboxUrls) {
            this.createSkybox(background.skyboxUrls);
        } else {
            this.setDefaultBackground();
        }
    }
    
    createSkybox(urls) {
        const loader = new THREE.CubeTextureLoader();
        const cubeTexture = loader.load([
            urls.right || '/static/skybox/right.png',
            urls.left || '/static/skybox/left.png',
            urls.top || '/static/skybox/top.png',
            urls.bottom || '/static/skybox/bottom.png',
            urls.front || '/static/skybox/front.png',
            urls.back || '/static/skybox/back.png'
        ]);
        
        this.scene.background = cubeTexture;
        this.skybox = cubeTexture;
    }
    
    createProceduralBackground(background) {
        // Create a procedural space background
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
        gradient.addColorStop(0, background.centerColor || '#000011');
        gradient.addColorStop(1, background.edgeColor || '#000000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2048, 2048);
        
        // Add procedural stars
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 2048;
            const size = Math.random() * 2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add nebula effects
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 2048;
            const radius = Math.random() * 200 + 100;
            
            const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            nebulaGradient.addColorStop(0, `rgba(100, 50, 150, ${Math.random() * 0.1 + 0.05})`);
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = nebulaGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        this.scene.background = texture;
        this.backgroundTexture = texture;
    }
    
    setDefaultBackground() {
        // Set a default deep space background
        this.scene.background = new THREE.Color(0x000011);
    }
    
    addNebula(nebulaData) {
        if (this.nebula) {
            this.scene.remove(this.nebula);
        }
        
        const nebulaGeometry = new THREE.SphereGeometry(nebulaData.radius || 50000, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: nebulaData.color || 0x4400aa,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        this.nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        this.scene.add(this.nebula);
    }
    
    addDepthFog() {
        // Add depth fog for atmospheric perspective
        this.scene.fog = new THREE.Fog(0x000011, 1000, 100000);
    }
    
    update(deltaTime) {
        // Animate background elements
        if (this.starField) {
            this.starField.rotation.y += deltaTime * 0.00001;
        }
        
        if (this.spaceDust) {
            this.spaceDust.rotation.y += deltaTime * 0.00002;
        }
        
        if (this.nebula) {
            this.nebula.rotation.y += deltaTime * 0.000005;
        }
    }
    
    setQuality(quality) {
        this.quality = quality;
        
        // Update particle counts based on quality
        if (this.starField) {
            const material = this.starField.material;
            switch (quality) {
                case 'low':
                    material.size = 0.5;
                    material.opacity = 0.6;
                    break;
                case 'medium':
                    material.size = 1.0;
                    material.opacity = 0.8;
                    break;
                case 'high':
                    material.size = 1.5;
                    material.opacity = 1.0;
                    break;
            }
        }
    }
    
    // Cleanup
    dispose() {
        if (this.backgroundTexture) {
            this.backgroundTexture.dispose();
        }
        
        if (this.skybox) {
            this.skybox.dispose();
        }
        
        if (this.starField) {
            this.scene.remove(this.starField);
            this.starField.geometry.dispose();
            this.starField.material.dispose();
        }
        
        if (this.spaceDust) {
            this.scene.remove(this.spaceDust);
            this.spaceDust.geometry.dispose();
            this.spaceDust.material.dispose();
        }
        
        if (this.nebula) {
            this.scene.remove(this.nebula);
            this.nebula.geometry.dispose();
            this.nebula.material.dispose();
        }
    }
}

// Export for use in other modules
window.BackgroundSystem = BackgroundSystem;
