// Space Explorer 3D - Core Three.js Setup
// Asset versioned via Flask static_file helper (?v=mtime). Change triggers cache bust.

class SpaceExplorer3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.systemData = null;
        this.objects = new Map();
        this.selectedObject = null;
        
        // New Phase 2 systems
        this.scalingSystem = null;
        this.objectRenderer = null;
        this.backgroundSystem = null;
        this.timeControlSystem = null;
        
        // Performance monitoring
        this.performance = {
            fps: 0,
            frameTime: 0,
            objectCount: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('SpaceExplorer3D: Initializing...');
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.setupPhase2Systems();
        this.animate();
        console.log('SpaceExplorer3D: Initialization complete');
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
        this.scene.fog = new THREE.Fog(0x001122, 1000, 100000);
        console.log('Scene created with', this.scene.children.length, 'children');
    }
    
    setupBackground(systemData) {
        // Use the new background system
        if (this.backgroundSystem) {
            this.backgroundSystem.loadBackground(systemData);
        } else {
            // Fallback to simple background
            if (systemData.background && systemData.background.tint) {
                this.scene.background = new THREE.Color(systemData.background.tint);
            }
        }
    }
    
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000000);
        this.camera.position.set(0, 0, 100000); // Much closer to see the system
        console.log('Camera positioned at:', this.camera.position);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        console.log('Renderer added to container:', this.container.clientWidth, 'x', this.container.clientHeight);
    }
    
    setupLighting() {
        // Enhanced ambient light for better overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8); // Increased from 0.3 to 0.8
        this.scene.add(ambientLight);
        
        // Main directional light from the star position
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Increased from 0.7 to 1.2
        directionalLight.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Additional fill light for better object visibility
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(1000000, 1000000, 1000000);
        this.scene.add(fillLight);
        
        // Store lights for dynamic updates
        this.lights = {
            ambient: ambientLight,
            directional: directionalLight,
            fill: fillLight,
            starLight: null // Will be added when star is created
        };
    }
    
    setupControls() {
        // Orbit camera controls that center on the star system
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0, 0); // Center on the star system
        this.controls.minDistance = 1000;
        this.controls.maxDistance = 1000000;
    }
    
    setupPhase2Systems() {
        // Initialize Phase 2 systems
        this.scalingSystem = new ScalingSystem(this);
        this.objectRenderer = new ObjectRenderer(this);
        this.timeControlSystem = new TimeControlSystem(this);
        // Temporarily disable background system to fix flickering
        // this.backgroundSystem = new BackgroundSystem(this);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse events for object selection
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onMouseClick(event) {
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        console.log('Mouse click at:', mouse);
        console.log('Camera position:', this.camera.position);
        console.log('Camera rotation:', this.camera.rotation);
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        console.log('Raycaster intersects:', intersects.length);
        if (intersects.length > 0) {
            console.log('Clicked object:', intersects[0].object);
            console.log('Object position:', intersects[0].object.position);
            console.log('Object userData:', intersects[0].object.userData);
            this.selectObject(intersects[0].object);
        } else {
            console.log('No objects intersected');
        }
    }
    
    selectObject(object) {
        // Clear previous selection
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        
        this.selectedObject = object;
        object.material.emissive.setHex(0x444444);
        
        // Update info panel
        this.updateInfoPanel(object);
    }
    
    updateInfoPanel(object) {
        const infoPanel = document.getElementById('system-info');
        if (infoPanel && object.userData) {
            const data = object.userData;
            infoPanel.innerHTML = `
                <div class="text-xs text-purple-300 mb-1">Selected Object</div>
                <div class="text-xs text-purple-100">
                    <strong>${data.name}</strong><br>
                    Type: ${data.type}<br>
                    Distance: ${data.distance ? (data.distance / 1000).toFixed(0) + 'k km' : 'N/A'}<br>
                    Radius: ${data.radius ? data.radius.toFixed(0) + ' km' : 'N/A'}
                </div>
            `;
        }
    }
    
    
    loadSystem(systemData) {
        this.clearScene();
        this.systemData = systemData;
        this.setupBackground(systemData);
        this.createSystemObjects();
        this.centerCameraOnStar();
    }
    
    clearScene() {
        // Clear time control system orbital objects
        if (this.timeControlSystem) {
            this.timeControlSystem.clearOrbitalObjects();
        }
        
        // Remove all objects except lights
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child !== this.scene && child.type !== 'Light') {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        
        this.objects.clear();
        this.selectedObject = null;
    }
    
    createSystemObjects() {
        if (!this.systemData) return;
        
        console.log('Creating system objects...');
        console.log('System data:', this.systemData);
        
        // Create central object (star)
        if (this.systemData.centralObject) {
            console.log('Creating central object:', this.systemData.centralObject);
            const centralObj = this.createCentralObject(this.systemData.centralObject);
            this.scene.add(centralObj);
            this.objects.set('central', centralObj);
            console.log('Central object created and added to scene');
        }
        
        // Create orbital objects
        if (this.systemData.objects) {
            console.log('Creating orbital objects:', this.systemData.objects.length);
            this.systemData.objects.forEach((objData, index) => {
                console.log(`Creating object ${index}:`, objData.name);
                const obj = this.createOrbitalObject(objData);
                this.scene.add(obj);
                this.objects.set(objData.name, obj);
                console.log(`Object ${objData.name} created and added to scene`);
            });
        }
        
        // Add some debug objects to make sure rendering works
        this.addDebugObjects();
        
        console.log('Total objects in scene:', this.scene.children.length);
    }
    
    addDebugObjects() {
        // Add a simple test cube to make sure rendering works - MUCH LARGER
        const geometry = new THREE.BoxGeometry(100000, 100000, 100000); // 100x larger
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 0);
        cube.userData = { name: 'Debug Cube', type: 'debug' };
        this.scene.add(cube);
        
        // Add a simple sphere for the star - MUCH LARGER
        const starGeometry = new THREE.SphereGeometry(200000, 32, 32); // 2.5x larger
        const starMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 2.0 // Brighter
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(0, 0, 0);
        star.userData = { name: 'Debug Star', type: 'star' };
        this.scene.add(star);
        
        // Add a point light for the debug star
        const debugStarLight = new THREE.PointLight(0xffff00, 3.0, 0, 2); // Brighter
        debugStarLight.position.set(0, 0, 0);
        this.scene.add(debugStarLight);
        
        // Add a planet that will orbit - MUCH LARGER AND CLOSER
        const planetGeometry = new THREE.SphereGeometry(50000, 16, 16); // 2x larger
        const planetMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0000ff,
            emissive: 0x0000ff,
            emissiveIntensity: 0.5 // Brighter
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.set(500000, 0, 0); // 4x closer
        planet.userData = { name: 'Debug Planet', type: 'planet' };
        this.scene.add(planet);
        
        console.log('Debug objects added');
        
        // Register the debug planet with time control system for orbital motion
        if (this.timeControlSystem) {
            this.timeControlSystem.registerOrbitalObject(planet, {
                name: 'Debug Planet',
                distance: 500000, // Updated distance
                orbitalPeriod: 0.1
            });
        }
    }
    
    createCentralObject(data) {
        // Use enhanced object renderer for stars
        const mesh = this.objectRenderer.createStar(data);
        mesh.userData = {
            name: data.name,
            type: data.type,
            distance: 0,
            radius: data.radius,
            spectralType: data.spectralType,
            temperature: data.temperature
        };
        
        // Add star-based lighting
        this.addStarLighting(mesh, data);
        
        return mesh;
    }
    
    addStarLighting(star, data) {
        // Create a point light at the star position for realistic lighting
        const starColor = this.objectRenderer.calculateStarColor(data);
        const starLight = new THREE.PointLight(starColor, 2.0, 0, 2); // High intensity, no decay
        starLight.position.set(0, 0, 0);
        starLight.castShadow = true;
        starLight.shadow.mapSize.width = 1024;
        starLight.shadow.mapSize.height = 1024;
        starLight.shadow.camera.near = 0.1;
        starLight.shadow.camera.far = 10000000;
        
        this.scene.add(starLight);
        this.lights.starLight = starLight;
        
        // Update directional light to point from star
        if (this.lights.directional) {
            this.lights.directional.position.copy(star.position);
            this.lights.directional.target = star;
        }
        
        console.log('Star lighting added');
    }
    
    createOrbitalObject(data) {
        // Use enhanced object renderer for planets
        const mesh = this.objectRenderer.createPlanet(data);
        mesh.userData = {
            name: data.name,
            type: data.type,
            subtype: data.subtype,
            distance: data.distance,
            radius: data.radius,
            orbitalPeriod: data.orbitalPeriod,
            rotationPeriod: data.rotationPeriod,
            atmosphere: data.atmosphere,
            rings: data.rings
        };
        
        // Position object at orbital distance
        if (data.distance) {
            mesh.position.x = data.distance;
        }
        
        // Register with time control system for orbital motion
        if (this.timeControlSystem && data.orbitalPeriod) {
            console.log(`Registering ${data.name} for orbital motion: period=${data.orbitalPeriod} days, distance=${data.distance}`);
            this.timeControlSystem.registerOrbitalObject(mesh, {
                name: data.name,
                distance: data.distance,
                orbitalPeriod: data.orbitalPeriod,
                moons: data.moons
            });
        } else {
            console.log(`Not registering ${data.name}: timeControlSystem=${!!this.timeControlSystem}, orbitalPeriod=${data.orbitalPeriod}`);
        }
        
        // Create moons if present
        if (data.moons && data.moons.length > 0) {
            this.createMoons(mesh, data.moons);
        }
        
        return mesh;
    }
    
    createMoons(planet, moonsData) {
        moonsData.forEach(moonData => {
            const moon = this.objectRenderer.createMoon(moonData);
            moon.userData = {
                name: moonData.name,
                type: moonData.type,
                distance: moonData.distance,
                radius: moonData.radius,
                orbitalPeriod: moonData.orbitalPeriod
            };
            
            // Position moon relative to planet
            if (moonData.distance) {
                moon.position.x = moonData.distance;
            }
            
            planet.add(moon);
        });
    }
    
    centerCameraOnStar() {
        // Position camera to orbit around the center of the system
        this.camera.position.set(0, 0, 100000); // Much closer
        this.controls.setTarget(new THREE.Vector3(0, 0, 0));
        this.controls.setDistance(100000);
        this.controls.minDistance = 1000; // Allow much closer zoom
        this.controls.maxDistance = 10000000; // Allow farther zoom
        console.log('Camera positioned at:', this.camera.position);
        console.log('Camera looking at:', new THREE.Vector3(0, 0, 0));
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const currentTime = performance.now();
        const deltaTime = this.lastFrameTime ? (currentTime - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = currentTime;
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update Phase 2 systems
        if (this.scalingSystem) {
            this.scalingSystem.update(deltaTime);
        }
        if (this.objectRenderer) {
            this.objectRenderer.update(deltaTime);
        }
        if (this.timeControlSystem) {
            this.timeControlSystem.update(deltaTime);
        } else {
            console.log('Time control system not available');
        }
        // Temporarily disabled to fix flickering
        // if (this.backgroundSystem) {
        //     this.backgroundSystem.update(deltaTime);
        // }
        
        // Update performance metrics
        this.updatePerformance();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Debug: Check if anything is being rendered
        if (this.frameCount === 0) {
            console.log('First frame rendered. Scene children:', this.scene.children.length);
        }
        
        // Debug: Log scene info occasionally
        if (Math.random() < 0.001) { // 0.1% chance - much less frequent
            console.log('Scene objects:', this.scene.children.length);
        }
    }
    
    updatePerformance() {
        // Simple FPS counter
        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.frameCount = 0;
        }
        
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.performance.fps = this.frameCount;
            this.performance.frameTime = (currentTime - this.lastTime) / this.frameCount;
            this.performance.objectCount = this.scene.children.length;
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    getPerformanceData() {
        return this.performance;
    }
}

// Export for use in other modules
window.SpaceExplorer3D = SpaceExplorer3D;
