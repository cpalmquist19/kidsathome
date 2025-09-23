// Stellar Evolution Game - Three.js Implementation
let scene, camera, renderer, controls;
let currentStar = null;
let isPlaying = false;
let isCloudSpawned = false;
let collapseTimer = null;
let mainSequenceTimer = null;
let subGiantTimer = null;
let blueSupergiantTimer = null;
let giantTimer = null;
let whiteDwarfTimer = null;
let blackDwarfTimer = null;
let countdownInterval = null;
let countdownSeconds = 0;
let selectedType = null;
let isLocalDev = false;

// Mouse controls removed

// Initialize Three.js scene
function initThreeJS() {
    const container = document.getElementById('simulation-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Set initial cursor style
    container.style.cursor = 'default';
    
    // Enhanced Lighting System
    const ambientLight = new THREE.AmbientLight(0x404080, 0.2);
    scene.add(ambientLight);
    
    // Main star light
    const starLight = new THREE.PointLight(0xffffff, 2, 50);
    starLight.position.set(0, 0, 0);
    scene.add(starLight);
    
    // Rim lighting
    const rimLight1 = new THREE.DirectionalLight(0x4488ff, 0.5);
    rimLight1.position.set(5, 5, 5);
    scene.add(rimLight1);
    
    const rimLight2 = new THREE.DirectionalLight(0xff8844, 0.3);
    rimLight2.position.set(-5, -5, -5);
    scene.add(rimLight2);
    
    // Add fog for depth
    scene.fog = new THREE.Fog(0x000011, 10, 50);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add scroll wheel zoom
    container.addEventListener('wheel', onMouseWheel, { passive: false });
    
    // Mouse controls removed - clicking on simulation area does nothing
}

// Star class for stellar evolution
class Star {
    constructor(mass, metallicity) {
        this.mass = mass;
        this.metallicity = metallicity;
        this.phase = 'nebula';
        this.age = 0;
        this.mesh = null;
        this.particles = null;
        
        // Always spawn in center
        this.position = {
            x: 0,
            y: 0,
            z: 0
        };
        
        // Random cloud size (larger range)
        this.cloudSize = Math.random() * 3 + 2; // 2 to 5 units
    }
    
    createNebula() {
        // Create enhanced particle system for gas cloud
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Generate random positions in a cloud shape
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spherical distribution centered at origin (using cloud size)
            const radius = Math.random() * this.cloudSize;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = this.position.x + radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = this.position.y + radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = this.position.z + radius * Math.cos(phi);
            
            // Color based on metallicity with more variation
            const color = this.getMetallicityColor();
            const variation = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
            colors[i3] = color.r * variation;
            colors[i3 + 1] = color.g * variation;
            colors[i3 + 2] = color.b * variation;
            
            // Variable particle sizes
            sizes[i] = 0.02 + Math.random() * 0.08; // 0.02 to 0.1
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Enhanced particle material
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        scene.add(this.particles);
        
        // Add subtle rotation animation
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    }
    
    getMetallicityColor() {
        // Determine star type based on mass (realistic stellar masses)
        if (this.mass < 0.8) {
            // Red dwarf: 0.08 - 0.8 solar masses
            return new THREE.Color(1, 0.3, 0.2); // Red
        } else if (this.mass < 1.4) {
            // Yellow dwarf (like Sun): 0.8 - 1.4 solar masses
            return new THREE.Color(1, 0.9, 0.6); // Yellow-white
        } else {
            // Blue star: 1.4+ solar masses
            return new THREE.Color(0.6, 0.8, 1); // Blue-white
        }
    }
    
    createStar() {
        // Remove the particle cloud completely
        if (this.particles) {
            scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
        }
        
        const color = this.getMetallicityColor();
        
        // Create main star sphere with enhanced material
        const geometry = new THREE.SphereGeometry(0.4, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.95
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.mesh);
        
        // Add multiple halo layers for realistic star glow
        this.halos = [];
        
        // Inner corona
        const innerHaloGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const innerHaloMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide
        });
        const innerHalo = new THREE.Mesh(innerHaloGeometry, innerHaloMaterial);
        innerHalo.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(innerHalo);
        this.halos.push(innerHalo);
        
        // Outer corona
        const outerHaloGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const outerHaloMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const outerHalo = new THREE.Mesh(outerHaloGeometry, outerHaloMaterial);
        outerHalo.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(outerHalo);
        this.halos.push(outerHalo);
        
        // LOD system removed
        
        // Add rotation for dynamic effect
        this.rotationSpeed = 0.01;
        
        // Update phase
        this.phase = 'mainSequence';
        this.updateDataDisplay();
        updatePhaseDescription('mainSequence');
        updateEvolutionProgress(50);
        
        // Smoothly move camera to optimal viewing distance
        positionCameraForObject();
        
        // Start main sequence timer
        startMainSequenceTimer();
    }
    
    // LOD system functions removed
    
    createSubGiant() {
        // Only yellow stars can become sub-giants
        if (this.mass < 0.8 || this.mass > 1.4) {
            console.log('Only yellow stars (0.8-1.4 M☉) can become sub-giants');
            return;
        }
        
        // Store current size for expansion
        const currentScale = this.mesh.scale.x;
        const targetScale = currentScale * 5; // 5x larger
        
        // Update phase
        this.phase = 'subGiant';
        this.updateDataDisplay();
        updatePhaseDescription('subGiant');
        updateEvolutionProgress(75);
        
        // Start sub-giant timer
        startSubGiantTimer();
        
        // Position camera for larger object
        positionCameraForObject();
        
        // Animate expansion with GSAP
        gsap.to(this.mesh.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 3,
            ease: "power2.out"
        });
        
        // Expand halos too
        this.halos.forEach((halo, index) => {
            const haloScale = 1 + (index * 0.5); // Different expansion for each halo
            gsap.to(halo.scale, {
                x: targetScale * haloScale,
                y: targetScale * haloScale,
                z: targetScale * haloScale,
                duration: 3,
                ease: "power2.out"
            });
        });
        
        // Change color to redder (sub-giant characteristics)
        const redGiantColor = new THREE.Color(1, 0.6, 0.3); // Orange-red
        gsap.to(this.mesh.material.color, {
            r: redGiantColor.r,
            g: redGiantColor.g,
            b: redGiantColor.b,
            duration: 3,
            ease: "power2.out"
        });
        
        // Update halo colors
        this.halos.forEach(halo => {
            gsap.to(halo.material.color, {
                r: redGiantColor.r,
                g: redGiantColor.g,
                b: redGiantColor.b,
                duration: 3,
                ease: "power2.out"
            });
        });
        
        console.log('Star expanded to sub-giant phase - 5x larger!');
    }
    
    createBlueSupergiant() {
        // Only blue stars (mass >= 1.4) can become blue supergiants
        if (this.mass < 1.4) {
            console.log('Only blue stars (mass >= 1.4 M☉) can become blue supergiants');
            return;
        }
        
        // Store current size for massive expansion
        const currentScale = this.mesh.scale.x;
        const targetScale = currentScale * 25; // 25x larger - truly massive!
        
        // Update phase
        this.phase = 'blueSupergiant';
        this.updateDataDisplay();
        updatePhaseDescription('blueSupergiant');
        updateEvolutionProgress(85);
        
        // Start blue supergiant timer
        startBlueSupergiantTimer();
        
        // Position camera for massive object
        positionCameraForObject();
        
        // Animate massive expansion with GSAP
        gsap.to(this.mesh.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 5, // Longer duration for dramatic effect
            ease: "power2.out"
        });
        
        // Expand halos to massive proportions
        this.halos.forEach((halo, index) => {
            const haloScale = 1 + (index * 0.5); // Different expansion for each halo
            gsap.to(halo.scale, {
                x: targetScale * haloScale * 2, // Even larger halos for supergiant
                y: targetScale * haloScale * 2,
                z: targetScale * haloScale * 2,
                duration: 5,
                ease: "power2.out"
            });
        });
        
        // Keep blue supergiant color (hot blue-white)
        const blueSupergiantColor = new THREE.Color(0.6, 0.8, 1.0); // Bright blue-white
        gsap.to(this.mesh.material.color, {
            r: blueSupergiantColor.r,
            g: blueSupergiantColor.g,
            b: blueSupergiantColor.b,
            duration: 5,
            ease: "power2.out"
        });
        
        // Update halo colors to match
        this.halos.forEach(halo => {
            gsap.to(halo.material.color, {
                r: blueSupergiantColor.r,
                g: blueSupergiantColor.g,
                b: blueSupergiantColor.b,
                duration: 5,
                ease: "power2.out"
            });
        });
        
        console.log('Star expanded to blue supergiant phase - 25x larger! Massive stellar evolution!');
    }
    
    createSupernova() {
        // Only blue supergiants can become supernovae
        if (this.phase !== 'blueSupergiant') {
            console.log('Only blue supergiants can become supernovae');
            return;
        }
        
        console.log(`Blue supergiant explodes in a spectacular supernova! Mass: ${this.mass.toFixed(1)} M☉`);
        
        // Start the supernova explosion sequence, then route to correct outcome
        this.startSupernovaExplosion();
        
        // After explosion, create the appropriate remnant based on mass
        setTimeout(() => {
            if (this.mass < 10) {
                console.log('Creating neutron star remnant...');
                this.createNeutronStar();
            } else {
                console.log('Creating black hole remnant...');
                this.createBlackHole();
            }
        }, 4000); // Wait 4 seconds for explosion to settle
    }
    
    startSupernovaExplosion() {
        // Update phase immediately
        this.phase = 'supernova';
        this.updateDataDisplay();
        updatePhaseDescription('supernova');
        updateEvolutionProgress(100);
        
        // Create multiple explosion effects
        this.createSupernovaParticles();
        this.createSupernovaShockwave();
        this.createSupernovaLightFlash();
        
        // Hide the original star during explosion
        gsap.to(this.mesh.material, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.in"
        });
        
        // Hide halos
        this.halos.forEach((halo, index) => {
            gsap.to(halo.material, {
                opacity: 0,
                duration: 0.3 + index * 0.2,
                ease: "power2.in"
            });
        });
        
        // Position camera for optimal explosion viewing
        positionCameraForObject();
        
        console.log('Supernova explosion sequence initiated!');
    }
    
    createSupernovaParticles() {
        // Create thousands of explosion particles
        const particleCount = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Start all particles at star center
            positions[i3] = this.position.x;
            positions[i3 + 1] = this.position.y;
            positions[i3 + 2] = this.position.z;
            
            // Random explosion directions
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.1 + Math.random() * 0.3; // Random explosion speeds
            
            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = speed * Math.cos(phi);
            
            // Supernova colors - hot white, yellow, orange, red
            const colorChoice = Math.random();
            if (colorChoice < 0.3) {
                // Hot white
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else if (colorChoice < 0.6) {
                // Yellow
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 0.2;
            } else if (colorChoice < 0.8) {
                // Orange
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.5;
                colors[i3 + 2] = 0.1;
            } else {
                // Red
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.2;
                colors[i3 + 2] = 0.1;
            }
            
            sizes[i] = 0.05 + Math.random() * 0.15; // Random particle sizes
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.supernovaParticles = new THREE.Points(geometry, material);
        scene.add(this.supernovaParticles);
        
        // Animate particles exploding outward
        this.animateSupernovaParticles();
    }
    
    animateSupernovaParticles() {
        const startTime = Date.now();
        const duration = 8000; // 8 seconds of explosion
        
        const animate = () => {
            // Check if particles still exist (might have been cleaned up)
            if (!this.supernovaParticles || !this.supernovaParticles.geometry) {
                return; // Exit if particles were cleaned up
            }
            
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const positions = this.supernovaParticles.geometry.attributes.position.array;
                const velocities = this.supernovaParticles.geometry.attributes.velocity.array;
                
                // Update particle positions
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i] * 0.1;
                    positions[i + 1] += velocities[i + 1] * 0.1;
                    positions[i + 2] += velocities[i + 2] * 0.1;
                }
                
                this.supernovaParticles.geometry.attributes.position.needsUpdate = true;
                
                // Fade out particles over time
                const fadeProgress = Math.min(progress * 2, 1);
                this.supernovaParticles.material.opacity = 1 - fadeProgress;
                
                requestAnimationFrame(animate);
            } else {
                // Clean up particles after explosion
                if (this.supernovaParticles) {
                    scene.remove(this.supernovaParticles);
                    this.supernovaParticles.geometry.dispose();
                    this.supernovaParticles.material.dispose();
                    this.supernovaParticles = null;
                }
            }
        };
        
        animate();
    }
    
    createSupernovaShockwave() {
        // Create expanding shockwave rings
        this.shockwaves = [];
        
        for (let i = 0; i < 5; i++) {
            const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
            const shockwaveMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.8, 0.9, 1.0),
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
            shockwave.position.set(this.position.x, this.position.y, this.position.z);
            shockwave.rotation.x = Math.PI / 2; // Orient horizontally
            scene.add(shockwave);
            this.shockwaves.push(shockwave);
            
            // Animate shockwave expansion
            gsap.to(shockwave.scale, {
                x: 50,
                y: 50,
                z: 50,
                duration: 3 + i * 0.5,
                delay: i * 0.3,
                ease: "power2.out"
            });
            
            gsap.to(shockwave.material, {
                opacity: 0,
                duration: 3 + i * 0.5,
                delay: i * 0.3,
                ease: "power2.out",
                onComplete: () => {
                    scene.remove(shockwave);
                    shockwave.geometry.dispose();
                    shockwave.material.dispose();
                }
            });
        }
    }
    
    createSupernovaLightFlash() {
        // Create intense light flash
        const flashGeometry = new THREE.SphereGeometry(1, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(1, 1, 1),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.lightFlash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.lightFlash.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.lightFlash);
        
        // Animate intense flash
        gsap.to(this.lightFlash.scale, {
            x: 100,
            y: 100,
            z: 100,
            duration: 0.5,
            ease: "power2.out"
        });
        
        gsap.to(this.lightFlash.material, {
            opacity: 0,
            duration: 2,
            ease: "power2.out",
            onComplete: () => {
                scene.remove(this.lightFlash);
                this.lightFlash.geometry.dispose();
                this.lightFlash.material.dispose();
            }
        });
        
        // Add screen flash effect
        this.createScreenFlash();
    }
    
    createScreenFlash() {
        // Create full-screen white flash
        const flashDiv = document.createElement('div');
        flashDiv.style.position = 'fixed';
        flashDiv.style.top = '0';
        flashDiv.style.left = '0';
        flashDiv.style.width = '100%';
        flashDiv.style.height = '100%';
        flashDiv.style.backgroundColor = 'white';
        flashDiv.style.opacity = '0';
        flashDiv.style.pointerEvents = 'none';
        flashDiv.style.zIndex = '9999';
        document.body.appendChild(flashDiv);
        
        // Animate screen flash
        gsap.to(flashDiv, {
            opacity: 0.8,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                document.body.removeChild(flashDiv);
            }
        });
    }
    
    createNeutronStar() {
        // Clean up any remaining supernova effects first
        this.cleanupSupernovaEffects();
        
        // Update phase
        this.phase = 'neutronStar';
        this.updateDataDisplay();
        updatePhaseDescription('neutronStar');
        updateEvolutionProgress(100);
        
        // Create the neutron star core (very small and dense)
        const neutronStarGeometry = new THREE.SphereGeometry(0.05, 32, 32); // Very small
        const neutronStarMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0.9, 0.95, 1.0), // Hot white
            emissive: new THREE.Color(0.8, 0.9, 1.0),
            emissiveIntensity: 0.5,
            shininess: 100
        });
        
        this.mesh = new THREE.Mesh(neutronStarGeometry, neutronStarMaterial);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.mesh);
        
        // Create expanding gas shells
        this.createNeutronStarShells();
        
        // Create pulsar beam effect
        this.createPulsarBeam();
        
        // Position camera for neutron star viewing
        positionCameraForObject();
        
        console.log('Neutron star formed with pulsating beams and expanding gas shells!');
    }
    
    createNeutronStarShells() {
        // Create multiple expanding shells of gas
        this.neutronShells = [];
        
        for (let i = 0; i < 8; i++) {
            const shellGeometry = new THREE.SphereGeometry(1, 32, 32);
            const shellMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.8, 0.5), // Different colors
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            shell.position.set(this.position.x, this.position.y, this.position.z);
            shell.scale.setScalar(0.1); // Start small
            scene.add(shell);
            this.neutronShells.push(shell);
            
            // Animate shell expansion with different speeds
            gsap.to(shell.scale, {
                x: 3 + i * 0.5,
                y: 3 + i * 0.5,
                z: 3 + i * 0.5,
                duration: 5 + i * 1, // Different durations
                delay: i * 0.5,
                ease: "power2.out"
            });
            
            gsap.to(shell.material, {
                opacity: 0,
                duration: 8 + i * 1,
                delay: i * 0.5,
                ease: "power2.out",
                onComplete: () => {
                    scene.remove(shell);
                    shell.geometry.dispose();
                    shell.material.dispose();
                }
            });
        }
    }
    
    createPulsarBeam() {
        // Create rotating pulsar beams
        this.pulsarBeams = [];
        
        for (let i = 0; i < 2; i++) {
            const beamGeometry = new THREE.ConeGeometry(0.02, 2, 8);
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.8, 0.9, 1.0),
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(this.position.x, this.position.y, this.position.z);
            beam.rotation.x = Math.PI / 2; // Orient horizontally
            beam.rotation.z = i * Math.PI; // Opposite directions
            scene.add(beam);
            this.pulsarBeams.push(beam);
        }
        
        // Start pulsar animation
        this.startPulsarAnimation();
    }
    
    startPulsarAnimation() {
        const animate = () => {
            if (this.pulsarBeams && this.phase === 'neutronStar' && this.pulsarBeams.length > 0) {
                // Rotate beams
                this.pulsarBeams.forEach((beam, index) => {
                    if (beam && beam.material) {
                        beam.rotation.y += 0.1; // Fast rotation
                        
                        // Pulsing effect
                        const time = Date.now() * 0.01;
                        const pulse = 0.3 + Math.sin(time + index * Math.PI) * 0.7;
                        beam.material.opacity = pulse;
                    }
                });
                
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    createBlackHole() {
        // Clean up any remaining supernova effects first
        this.cleanupSupernovaEffects();
        
        // Update phase
        this.phase = 'blackHole';
        this.updateDataDisplay();
        updatePhaseDescription('blackHole');
        updateEvolutionProgress(100);
        
        // Create the black hole (invisible sphere)
        const blackHoleGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const blackHoleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0, 0, 0), // Pure black
            transparent: false
        });
        
        this.mesh = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.mesh);
        
        // Create accretion disk
        this.createAccretionDisk();
        
        // Create event horizon effect
        this.createEventHorizon();
        
        // Position camera for optimal black hole viewing
        positionCameraForBlackHole();
        
        console.log('Black hole formed with glowing accretion disk!');
    }
    
    createAccretionDisk() {
        // Create realistic Interstellar-style accretion disk
        this.accretionRings = [];

        // Main accretion disk - bright orange/red like Interstellar
        for (let i = 0; i < 12; i++) {
            const innerRadius = 0.15 + i * 0.3;
            const outerRadius = innerRadius + 0.15;
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);

            // Create Interstellar-style colors - bright orange to red
            const hue = 0.05 + i * 0.02; // Orange to red spectrum
            const saturation = 1.0 - i * 0.05; // Less saturated outer rings
            const lightness = 0.8 - i * 0.05; // Dimmer outer rings

            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(hue, saturation, lightness),
                transparent: true,
                opacity: 1.5 - i * 0.1, // High opacity for bright inner regions
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(this.position.x, this.position.y, this.position.z);
            ring.rotation.x = Math.PI / 2; // Orient horizontally

            // Add slight vertical offset for more realistic disk thickness
            ring.position.y += (Math.random() - 0.5) * 0.02;

            scene.add(ring);
            this.accretionRings.push(ring);
        }

        // Create spiral arms for more realistic appearance
        this.createSpiralArms();

        // Create bright inner disk (the photon ring)
        this.createPhotonRing();

        // Create glowing halo effect with realistic colors
        this.createAccretionDiskHalo();

        // Start accretion disk animation
        this.startAccretionDiskAnimation();
    }
    
    createSpiralArms() {
        // Create spiral arms that look like matter being pulled into the black hole
        this.spiralArms = [];

        for (let arm = 0; arm < 3; arm++) {
            for (let segment = 0; segment < 8; segment++) {
                const angle = (segment / 8) * Math.PI * 2 + arm * (Math.PI * 2 / 3);
                const radius = 0.3 + segment * 0.4;
                const width = 0.1;

                const spiralGeometry = new THREE.RingGeometry(radius, radius + width, 16);
                const spiralMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(0.08 + segment * 0.01, 0.9, 0.7),
                    transparent: true,
                    opacity: 1.2 - segment * 0.12,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending
                });

                const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
                spiral.position.set(this.position.x, this.position.y, this.position.z);
                spiral.rotation.x = Math.PI / 2;
                spiral.rotation.z = angle;
                scene.add(spiral);
                this.spiralArms.push(spiral);
            }
        }
    }

    createPhotonRing() {
        // Create the bright inner ring (photon ring) like in Interstellar
        const photonGeometry = new THREE.RingGeometry(0.12, 0.18, 32);
        const photonMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.15, 0.8, 0.9), // Bright blue-white
            transparent: true,
            opacity: 2.0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        this.photonRing = new THREE.Mesh(photonGeometry, photonMaterial);
        this.photonRing.position.set(this.position.x, this.position.y, this.position.z);
        this.photonRing.rotation.x = Math.PI / 2;
        scene.add(this.photonRing);
    }

    createBrightInnerRings() {
        // Create bright inner rings for additional luminosity
        this.brightInnerRings = [];

        for (let i = 0; i < 4; i++) {
            const ringGeometry = new THREE.RingGeometry(0.08 + i * 0.03, 0.15 + i * 0.03, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.12 + i * 0.02, 0.9, 0.8),
                transparent: true,
                opacity: 2.5 - i * 0.3,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(this.position.x, this.position.y, this.position.z);
            ring.rotation.x = Math.PI / 2;
            scene.add(ring);
            this.brightInnerRings.push(ring);
        }
    }
    
    createAccretionDiskHalo() {
        // Create a realistic glowing halo around the entire accretion disk
        this.accretionHalo = [];

        for (let i = 0; i < 4; i++) {
            const haloGeometry = new THREE.SphereGeometry(3.0 + i * 0.8, 32, 32);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.08 + i * 0.01, 0.7, 0.6), // Orange-red glow like Interstellar
                transparent: true,
                opacity: 0.2 - i * 0.04,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending
            });

            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            halo.position.set(this.position.x, this.position.y, this.position.z);
            scene.add(halo);
            this.accretionHalo.push(halo);
        }

        // Add a subtle outer glow
        const outerGlowGeometry = new THREE.SphereGeometry(6.0, 24, 24);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(0.05, 0.5, 0.3),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

        this.outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        this.outerGlow.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.outerGlow);
    }
    
    startAccretionDiskAnimation() {
        const animate = () => {
            if (this.phase === 'blackHole') {
                const time = Date.now() * 0.001;

                // Animate main accretion rings with realistic rotation speeds
                if (this.accretionRings && this.accretionRings.length > 0) {
                    this.accretionRings.forEach((ring, index) => {
                        if (ring && ring.material) {
                            // Inner rings rotate faster (Keplerian velocity)
                            const rotationSpeed = 0.02 * (12 - index);
                            ring.rotation.z += rotationSpeed;

                            // Realistic pulsing based on turbulent accretion
                            const pulse = 1.0 + Math.sin(time * 2 + index * 0.5) * 0.3 +
                                        Math.sin(time * 3.7 + index * 1.2) * 0.2;
                            ring.material.opacity = Math.max(0.5, pulse);
                        }
                    });
                }

                // Animate spiral arms with inward motion
                if (this.spiralArms && this.spiralArms.length > 0) {
                    this.spiralArms.forEach((arm, index) => {
                        if (arm && arm.material) {
                            arm.rotation.z += 0.01 + index * 0.005;

                            // Spiral arms move inward slightly over time
                            const inwardSpeed = 0.0005;
                            const currentRadius = arm.geometry.parameters.innerRadius;
                            if (currentRadius > 0.1) {
                                arm.scale.multiplyScalar(1 - inwardSpeed);
                            }

                            // Vary opacity for dynamic effect
                            const pulse = 0.8 + Math.sin(time * 1.5 + index) * 0.4;
                            arm.material.opacity = Math.max(0.3, pulse);
                        }
                    });
                }

                // Animate photon ring with fast rotation
                if (this.photonRing && this.photonRing.material) {
                    this.photonRing.rotation.z += 0.08; // Very fast rotation

                    // Intense pulsing for photon ring
                    const pulse = 1.5 + Math.sin(time * 4) * 0.8 + Math.sin(time * 6.3) * 0.4;
                    this.photonRing.material.opacity = Math.max(1.0, pulse);
                }

                // Animate bright inner rings
                if (this.brightInnerRings && this.brightInnerRings.length > 0) {
                    this.brightInnerRings.forEach((ring, index) => {
                        if (ring && ring.material) {
                            ring.rotation.z += 0.06 * (5 - index);

                            const pulse = 2.0 + Math.sin(time * 2.5 + index) * 0.5;
                            ring.material.opacity = Math.max(1.2, pulse);
                        }
                    });
                }

                // Animate accretion disk halo
                if (this.accretionHalo && this.accretionHalo.length > 0) {
                    this.accretionHalo.forEach((halo, index) => {
                        if (halo && halo.material) {
                            const pulse = 0.15 + Math.sin(time * 0.8 + index * 0.3) * 0.08;
                            halo.material.opacity = Math.max(0.05, pulse);
                        }
                    });
                }

                // Animate outer glow
                if (this.outerGlow && this.outerGlow.material) {
                    const pulse = 0.08 + Math.sin(time * 0.3) * 0.03;
                    this.outerGlow.material.opacity = Math.max(0.02, pulse);
                }

                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    createEventHorizon() {
        // Create realistic event horizon with proper black hole appearance
        const horizonGeometry = new THREE.SphereGeometry(0.12, 32, 32);
        const horizonMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.05, 0.05, 0.05), // Very dark gray, not pure black
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        this.eventHorizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
        this.eventHorizon.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.eventHorizon);

        // Create gravitational lensing effect around the event horizon
        this.createGravitationalLensing();

        // Create subtle shadow disk (the "shadow" of the black hole)
        const shadowGeometry = new THREE.RingGeometry(0.25, 0.8, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.02, 0.02, 0.02),
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            blending: THREE.MultiplyBlending
        });

        this.shadowDisk = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadowDisk.position.set(this.position.x, this.position.y, this.position.z);
        this.shadowDisk.rotation.x = Math.PI / 2;
        scene.add(this.shadowDisk);

        // Subtle pulsing effect for the event horizon
        gsap.to(this.eventHorizon.material, {
            opacity: 0.2,
            duration: 3,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1
        });

        // Animate the shadow disk
        this.startEventHorizonAnimation();
    }

    createGravitationalLensing() {
        // Create a subtle lensing effect around the black hole
        const lensGeometry = new THREE.SphereGeometry(0.3, 24, 24);
        const lensMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.1, 0.1, 0.1),
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

        this.lensingSphere = new THREE.Mesh(lensGeometry, lensMaterial);
        this.lensingSphere.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.lensingSphere);
    }

    startEventHorizonAnimation() {
        const animate = () => {
            if (this.phase === 'blackHole') {
                const time = Date.now() * 0.001;

                // Subtle rotation of shadow disk
                if (this.shadowDisk) {
                    this.shadowDisk.rotation.z += 0.005;
                }

                // Very subtle lensing effect animation
                if (this.lensingSphere) {
                    this.lensingSphere.rotation.y += 0.002;
                    this.lensingSphere.rotation.x += 0.001;
                }

                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    cleanupSupernovaEffects() {
        // Clean up supernova particles if they still exist
        if (this.supernovaParticles) {
            scene.remove(this.supernovaParticles);
            this.supernovaParticles.geometry.dispose();
            this.supernovaParticles.material.dispose();
            this.supernovaParticles = null;
        }
        
        // Clean up shockwaves
        if (this.shockwaves) {
            this.shockwaves.forEach(shockwave => {
                scene.remove(shockwave);
                shockwave.geometry.dispose();
                shockwave.material.dispose();
            });
            this.shockwaves = null;
        }
        
        // Clean up light flash
        if (this.lightFlash) {
            scene.remove(this.lightFlash);
            this.lightFlash.geometry.dispose();
            this.lightFlash.material.dispose();
            this.lightFlash = null;
        }
    }
    
    createGiant() {
        // Only sub-giants can become giants
        if (this.phase !== 'subGiant') {
            console.log('Only sub-giants can become giants');
            return;
        }
        
        // Store current scale for further expansion
        const currentScale = this.mesh.scale.x;
        const targetScale = currentScale * 2; // Giant phase: 2x larger than sub-giant (10x total from original)
        
        // Update phase
        this.phase = 'giant';
        this.updateDataDisplay();
        updatePhaseDescription('giant');
        updateEvolutionProgress(90);
        
        // Start giant timer
        startGiantTimer();
        
        // Position camera for even larger object
        positionCameraForObject();
        
        // Animate further expansion with GSAP
        gsap.to(this.mesh.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 4,
            ease: "power2.out"
        });
        
        // Expand halos even more
        this.halos.forEach((halo, index) => {
            const haloScale = 1 + (index * 0.5); // Different expansion for each halo
            gsap.to(halo.scale, {
                x: targetScale * haloScale * 1.5, // Even larger halos
                y: targetScale * haloScale * 1.5,
                z: targetScale * haloScale * 1.5,
                duration: 4,
                ease: "power2.out"
            });
        });
        
        // Change color to deeper red (giant characteristics)
        const giantColor = new THREE.Color(1, 0.4, 0.2); // Deeper red-orange
        gsap.to(this.mesh.material.color, {
            r: giantColor.r,
            g: giantColor.g,
            b: giantColor.b,
            duration: 4,
            ease: "power2.out"
        });
        
        // Update halo colors to match
        this.halos.forEach(halo => {
            gsap.to(halo.material.color, {
                r: giantColor.r,
                g: giantColor.g,
                b: giantColor.b,
                duration: 4,
                ease: "power2.out"
            });
        });
        
        console.log('Star expanded to giant phase - core now as big as sub-giant corona!');
    }
    
    createWhiteDwarf() {
        // Only giants or blue dwarfs can become white dwarfs
        if (this.phase !== 'giant' && this.phase !== 'blueDwarf') {
            console.log('Only giants or blue dwarfs can become white dwarfs');
            return;
        }
        
        // Update phase immediately to show the change
        this.phase = 'whiteDwarf';
        this.updateDataDisplay();
        updatePhaseDescription('whiteDwarf');
        updateEvolutionProgress(90);
        
        // Create planetary nebula animation first
        this.createPlanetaryNebula();
        
        // After nebula animation, create white dwarf and start timer
        setTimeout(() => {
            this.finishWhiteDwarfCreation();
            // Start white dwarf timer after transition animation completes
            startWhiteDwarfTimer();
        }, 3000); // 3 seconds for nebula animation
    }
    
    createPlanetaryNebula() {
        // Create expanding shell of gas
        const nebulaGeometry = new THREE.SphereGeometry(1, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x00aaff, // Blue-green nebula color
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        this.planetaryNebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        this.planetaryNebula.position.set(this.position.x, this.position.y, this.position.z);
        this.planetaryNebula.scale.setScalar(0.1); // Start small
        scene.add(this.planetaryNebula);
        
        // Create multiple expanding shells
        this.nebulaShells = [];
        for (let i = 0; i < 3; i++) {
            const shellGeometry = new THREE.SphereGeometry(1, 32, 32);
            const shellMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.8, 0.5), // Different colors
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            shell.position.set(this.position.x, this.position.y, this.position.z);
            shell.scale.setScalar(0.1);
            scene.add(shell);
            this.nebulaShells.push(shell);
        }
        
        // Animate nebula expansion
        gsap.to(this.planetaryNebula.scale, {
            x: 8,
            y: 8,
            z: 8,
            duration: 2,
            ease: "power2.out"
        });
        
        gsap.to(this.planetaryNebula.material, {
            opacity: 0,
            duration: 3,
            ease: "power2.out"
        });
        
        // Animate shells with different timings
        this.nebulaShells.forEach((shell, index) => {
            gsap.to(shell.scale, {
                x: 6 + index * 2,
                y: 6 + index * 2,
                z: 6 + index * 2,
                duration: 2 + index * 0.5,
                ease: "power2.out"
            });
            
            gsap.to(shell.material, {
                opacity: 0,
                duration: 3 + index * 0.3,
                ease: "power2.out"
            });
        });
        
        console.log('Planetary nebula forming...');
    }
    
    finishWhiteDwarfCreation() {
        // Remove planetary nebula
        if (this.planetaryNebula) {
            scene.remove(this.planetaryNebula);
            this.planetaryNebula.geometry.dispose();
            this.planetaryNebula.material.dispose();
        }
        
        if (this.nebulaShells) {
            this.nebulaShells.forEach(shell => {
                scene.remove(shell);
                shell.geometry.dispose();
                shell.material.dispose();
            });
        }
        
        // Shrink star dramatically to white dwarf size
        const whiteDwarfScale = 0.1; // Much smaller than original
        
        // Update evolution progress
        updateEvolutionProgress(100);
        
        // Position camera for smaller object
        positionCameraForObject();
        
        // Animate dramatic shrinking
        gsap.to(this.mesh.scale, {
            x: whiteDwarfScale,
            y: whiteDwarfScale,
            z: whiteDwarfScale,
            duration: 2,
            ease: "power2.in"
        });
        
        // Shrink halos too
        this.halos.forEach((halo, index) => {
            gsap.to(halo.scale, {
                x: whiteDwarfScale * (1 + index * 0.2),
                y: whiteDwarfScale * (1 + index * 0.2),
                z: whiteDwarfScale * (1 + index * 0.2),
                duration: 2,
                ease: "power2.in"
            });
        });
        
        // Change to white dwarf color (hot white) - ensure it's actually white
        const whiteDwarfColor = new THREE.Color(1.0, 1.0, 1.0); // Pure white
        
        // Immediately set the color to white (no animation delay)
        this.mesh.material.color.setRGB(whiteDwarfColor.r, whiteDwarfColor.g, whiteDwarfColor.b);
        this.mesh.material.emissive.setRGB(whiteDwarfColor.r * 0.3, whiteDwarfColor.g * 0.3, whiteDwarfColor.b * 0.3);
        
        // Then animate any remaining color changes
        gsap.to(this.mesh.material.color, {
            r: whiteDwarfColor.r,
            g: whiteDwarfColor.g,
            b: whiteDwarfColor.b,
            duration: 2,
            ease: "power2.in"
        });
        
        // Update emissive color to white as well
        gsap.to(this.mesh.material.emissive, {
            r: whiteDwarfColor.r * 0.3,
            g: whiteDwarfColor.g * 0.3,
            b: whiteDwarfColor.b * 0.3,
            duration: 2,
            ease: "power2.in"
        });
        
        // Update halo colors to white
        this.halos.forEach(halo => {
            gsap.to(halo.material.color, {
                r: whiteDwarfColor.r,
                g: whiteDwarfColor.g,
                b: whiteDwarfColor.b,
                duration: 2,
                ease: "power2.in"
            });
        });
        
        console.log('White dwarf formed - star has collapsed to dense core!');
    }
    
    createBlackDwarf() {
        // Only white dwarfs can become black dwarfs
        if (this.phase !== 'whiteDwarf') {
            console.log('Only white dwarfs can become black dwarfs');
            return;
        }
        
        // Update phase
        this.phase = 'blackDwarf';
        this.updateDataDisplay();
        updatePhaseDescription('blackDwarf');
        updateEvolutionProgress(100);
        
        // Start black dwarf timer
        startBlackDwarfTimer();
        
        // Position camera for small object
        positionCameraForObject();
        
        // Fade white dwarf to black over 3 seconds
        gsap.to(this.mesh.material, {
            r: 0.1,
            g: 0.1,
            b: 0.1,
            duration: 3,
            ease: "power2.out"
        });
        
        // Fade out halos completely
        this.halos.forEach((halo, index) => {
            gsap.to(halo.material, {
                opacity: 0,
                duration: 2 + index * 0.5, // Staggered fade
                ease: "power2.out"
            });
        });
        
        // Make the white dwarf itself fade to nearly black
        gsap.to(this.mesh.material, {
            opacity: 0.3, // Very dim
            duration: 3,
            ease: "power2.out"
        });
        
        console.log('White dwarf has cooled and faded to black dwarf - the end of stellar evolution');
    }
    
    // Red Dwarf Evolution Phases
    
    createBlueDwarf() {
        // Only red dwarfs (mass < 0.8) can become blue dwarfs
        if (this.mass >= 0.8) {
            console.log('Only red dwarfs (mass < 0.8 M☉) can become blue dwarfs');
            return;
        }
        
        // Update phase
        this.phase = 'blueDwarf';
        this.updateDataDisplay();
        updatePhaseDescription('blueDwarf');
        updateEvolutionProgress(50);
        
        // Start blue dwarf timer
        startBlueDwarfTimer();
        
        // Position camera for optimal viewing
        positionCameraForObject();
        
        // Change color from red to blue-white over 3 seconds
        const blueDwarfColor = new THREE.Color(0.7, 0.8, 1.0); // Blue-white
        gsap.to(this.mesh.material.color, {
            r: blueDwarfColor.r,
            g: blueDwarfColor.g,
            b: blueDwarfColor.b,
            duration: 3,
            ease: "power2.out"
        });
        
        // Update emissive color to blue-white as well
        gsap.to(this.mesh.material.emissive, {
            r: blueDwarfColor.r * 0.3,
            g: blueDwarfColor.g * 0.3,
            b: blueDwarfColor.b * 0.3,
            duration: 3,
            ease: "power2.out"
        });
        
        // Update halo colors to match
        this.halos.forEach(halo => {
            gsap.to(halo.material.color, {
                r: blueDwarfColor.r,
                g: blueDwarfColor.g,
                b: blueDwarfColor.b,
                duration: 3,
                ease: "power2.out"
            });
        });
        
        // Increase luminosity slightly (simulate getting hotter)
        gsap.to(this.mesh.material, {
            emissiveIntensity: 0.5,
            duration: 3,
            ease: "power2.out"
        });
        
        console.log('Red dwarf has evolved into a blue dwarf - hotter and more luminous!');
    }
    
    
    createIronStar() {
        // Only black dwarfs can become iron stars
        if (this.phase !== 'blackDwarf') {
            console.log('Only black dwarfs can become iron stars');
            return;
        }
        
        // Update phase
        this.phase = 'ironStar';
        this.updateDataDisplay();
        updatePhaseDescription('ironStar');
        updateEvolutionProgress(100);
        
        // Transform from black to glowing purple over 3 seconds
        const ironColor = new THREE.Color(0.8, 0.2, 1.0); // Bright purple
        
        // Update main star color to purple
        gsap.to(this.mesh.material.color, {
            r: ironColor.r,
            g: ironColor.g,
            b: ironColor.b,
            duration: 3,
            ease: "power2.out"
        });
        
        // Update emissive color to purple for proper glow
        gsap.to(this.mesh.material.emissive, {
            r: ironColor.r * 0.5, // Half intensity for emissive
            g: ironColor.g * 0.5,
            b: ironColor.b * 0.5,
            duration: 3,
            ease: "power2.out"
        });
        
        // Restore full opacity
        gsap.to(this.mesh.material, {
            opacity: 1.0,
            duration: 3,
            ease: "power2.out"
        });
        
        // Restore corona to white dwarf size with enhanced purple glow
        this.halos.forEach((halo, index) => {
            // Restore opacity with higher values for better glow
            gsap.to(halo.material, {
                opacity: 0.4 + index * 0.2, // Enhanced opacity for purple glow
                duration: 3,
                ease: "power2.out"
            });
            
            // Restore size to white dwarf corona size
            const whiteDwarfHaloScale = 0.1 * (1 + index * 0.2); // Same as white dwarf size
            gsap.to(halo.scale, {
                x: whiteDwarfHaloScale,
                y: whiteDwarfHaloScale,
                z: whiteDwarfHaloScale,
                duration: 3,
                ease: "power2.out"
            });
            
            // Change halo color to purple
            gsap.to(halo.material, {
                r: ironColor.r,
                g: ironColor.g,
                b: ironColor.b,
                duration: 3,
                ease: "power2.out"
            });
        });
        
        // Add pulsing effect for the iron star
        gsap.to(this.mesh.scale, {
            x: 0.12, // Slightly larger than white dwarf
            y: 0.12,
            z: 0.12,
            duration: 2,
            ease: "power2.out"
        });
        
        // Add additional purple glow effect
        this.createIronStarGlow();
        
        console.log('Black dwarf has transformed into a glowing purple iron star!');
        
        // Position camera at optimal distance for iron star (after animations complete)
        setTimeout(() => {
            positionCameraForObject();
        }, 3000); // After color transformation completes
    }
    
    createIronStarGlow() {
        // Create additional glowing purple aura around the iron star
        const glowGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.8, 0.2, 1.0), // Purple
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        this.ironGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.ironGlow.position.set(this.position.x, this.position.y, this.position.z);
        this.ironGlow.scale.setScalar(0.1); // Start small
        scene.add(this.ironGlow);
        
        // Animate the glow expansion
        gsap.to(this.ironGlow.scale, {
            x: 1.0,
            y: 1.0,
            z: 1.0,
            duration: 2,
            ease: "power2.out"
        });
        
        // Add pulsing effect to the glow
        gsap.to(this.ironGlow.material, {
            opacity: 0.1,
            duration: 2,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1
        });
    }
    
    updateDataDisplay() {
        document.getElementById('current-phase').textContent = this.phase;
        document.getElementById('star-mass').textContent = this.mass.toFixed(1) + ' M☉';
        document.getElementById('star-metallicity').textContent = this.metallicity.toFixed(3) + ' Z☉';
    }
}

// Show cloud selection modal
function showCloudSelection() {
    // Prevent multiple clouds
    if (isCloudSpawned) {
        console.log('A cloud already exists! Use reset to clear it first.');
        return;
    }
    
    const modal = document.getElementById('cloud-selection-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    // Reset selections
    selectedType = null;
    updateSpawnButton();
}

// Hide cloud selection modal
function hideCloudSelection() {
    const modal = document.getElementById('cloud-selection-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Update spawn button state
function updateSpawnButton() {
    const spawnBtn = document.getElementById('spawn-selected-cloud');
    if (selectedType) {
        spawnBtn.disabled = false;
    } else {
        spawnBtn.disabled = true;
    }
}

// Spawn a gas cloud with selected parameters
function spawnSelectedCloud() {
    if (!selectedType) return;
    
    // Remove existing star (if any)
    if (currentStar) {
        if (currentStar.particles) scene.remove(currentStar.particles);
        if (currentStar.mesh) scene.remove(currentStar.mesh);
    }
    
    // Determine mass, metallicity, and type based on selection
    let mass, metallicity, starTypeName;
    
    if (selectedType === 'random') {
        // Random type with realistic distribution
        const starType = Math.random();
        if (starType < 0.6) {
            // M-type Red Dwarf (most common)
            mass = 0.08 + Math.random() * 0.37; // 0.08 to 0.45 M☉
            metallicity = 0.01 + Math.random() * 0.02; // 0.01 to 0.03 Z☉
            starTypeName = 'M-Type Red Dwarf';
        } else if (starType < 0.85) {
            // K-type Orange Star
            mass = 0.45 + Math.random() * 0.35; // 0.45 to 0.8 M☉
            metallicity = 0.015 + Math.random() * 0.02; // 0.015 to 0.035 Z☉
            starTypeName = 'K-Type Orange Star';
        } else if (starType < 0.95) {
            // G-type Yellow Star (like Sun)
            mass = 0.8 + Math.random() * 0.24; // 0.8 to 1.04 M☉
            metallicity = 0.018 + Math.random() * 0.015; // 0.018 to 0.033 Z☉
            starTypeName = 'G-Type Yellow Star (Sun)';
        } else if (starType < 0.98) {
            // F-type Yellow-White Star
            mass = 1.04 + Math.random() * 0.36; // 1.04 to 1.4 M☉
            metallicity = 0.02 + Math.random() * 0.02; // 0.02 to 0.04 Z☉
            starTypeName = 'F-Type Yellow-White Star';
        } else {
            // A-type White Star
            mass = 1.4 + Math.random() * 0.7; // 1.4 to 2.1 M☉
            metallicity = 0.025 + Math.random() * 0.02; // 0.025 to 0.045 Z☉
            starTypeName = 'A-Type White Star';
        }
    } else {
        // Specific type with realistic mass and metallicity ranges
        switch(selectedType) {
            case 'O': 
                mass = 15 + Math.random() * 10; // 15 to 25 M☉
                metallicity = 0.03 + Math.random() * 0.02; // 0.03 to 0.05 Z☉
                starTypeName = 'O-Type Blue Giant'; 
                break;
            case 'B': 
                mass = 2.1 + Math.random() * 13; // 2.1 to 15 M☉
                metallicity = 0.025 + Math.random() * 0.02; // 0.025 to 0.045 Z☉
                starTypeName = 'B-Type Blue Star'; 
                break;
            case 'A': 
                mass = 1.4 + Math.random() * 0.7; // 1.4 to 2.1 M☉
                metallicity = 0.025 + Math.random() * 0.02; // 0.025 to 0.045 Z☉
                starTypeName = 'A-Type White Star'; 
                break;
            case 'F': 
                mass = 1.04 + Math.random() * 0.36; // 1.04 to 1.4 M☉
                metallicity = 0.02 + Math.random() * 0.02; // 0.02 to 0.04 Z☉
                starTypeName = 'F-Type Yellow-White Star'; 
                break;
            case 'G': 
                mass = 0.8 + Math.random() * 0.24; // 0.8 to 1.04 M☉
                metallicity = 0.018 + Math.random() * 0.015; // 0.018 to 0.033 Z☉
                starTypeName = 'G-Type Yellow Star (Sun)'; 
                break;
            case 'K': 
                mass = 0.45 + Math.random() * 0.35; // 0.45 to 0.8 M☉
                metallicity = 0.015 + Math.random() * 0.02; // 0.015 to 0.035 Z☉
                starTypeName = 'K-Type Orange Star'; 
                break;
            case 'M': 
                mass = 0.08 + Math.random() * 0.37; // 0.08 to 0.45 M☉
                metallicity = 0.01 + Math.random() * 0.02; // 0.01 to 0.03 Z☉
                starTypeName = 'M-Type Red Dwarf'; 
                break;
        }
    }
    
    currentStar = new Star(mass, metallicity);
    currentStar.createNebula();
    currentStar.updateDataDisplay();
    
    // Position camera at edge of cloud
    positionCameraAtCloudEdge();
    
    // Mark cloud as spawned and update UI
    isCloudSpawned = true;
    toggleInstructions(false);
    updatePhaseDescription('nebula');
    updateEvolutionProgress(0);
    
    // Start 20-second collapse timer
    startCollapseTimer();
    
    // Hide modal
    hideCloudSelection();
    
    console.log(`Spawned ${starTypeName} gas cloud: Mass=${mass.toFixed(2)} M☉, Metallicity=${metallicity.toFixed(3)} Z☉`);
}

// Position camera at edge of cloud
function positionCameraAtCloudEdge() {
    if (!currentStar) return;
    
    // Use a consistent camera distance that works well for all cloud sizes
    // This ensures all gas clouds appear centered regardless of their size
    const cameraDistance = 6; // Fixed distance for consistent viewing
    
    // Position camera at optimal distance, ensuring object appears centered
    camera.position.set(cameraDistance, 0, 0);
    camera.lookAt(0, 0, 0);
    
    // Force camera update to ensure proper centering
    camera.updateProjectionMatrix();
}

// Position camera for optimal star viewing
function positionCameraForStar() {
    if (!currentStar) return;
    
    // Optimal viewing distance for star
    const optimalDistance = 3;
    
    // Smoothly animate camera to optimal position
    gsap.to(camera.position, {
        x: optimalDistance,
        y: 0,
        z: 0,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            // Ensure camera always looks at center during animation
            camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
            // Final centering after animation
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
    });
}

// Position camera based on current object size
function positionCameraForObject() {
    if (!currentStar) return;

    // Calculate object radius based on current scale and phase
    let objectRadius = 0.4; // Base radius

    if (currentStar.mesh) {
        objectRadius = currentStar.mesh.scale.x * 0.4; // Scale with object
    }

    // Add some padding for optimal viewing
    const optimalDistance = objectRadius + 2;

    // Smoothly animate camera to optimal position
    gsap.to(camera.position, {
        x: optimalDistance,
        y: 0,
        z: 0,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
            camera.lookAt(0, 0, 0);
        }
    });
}

function positionCameraForBlackHole() {
    // Position camera for optimal black hole viewing (like Interstellar)
    const distance = 4.0; // Optimal viewing distance
    const angle = Math.PI / 6; // 30 degrees from the accretion disk plane

    const targetX = distance * Math.cos(angle);
    const targetY = distance * Math.sin(angle);
    const targetZ = 0;

    // Smoothly animate camera to the ideal viewing position
    gsap.to(camera.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => {
            camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
            camera.lookAt(0, 0, 0);
            console.log('Camera positioned for optimal black hole viewing');
        }
    });

    // Add some subtle camera movement for more dynamic viewing
    setTimeout(() => {
        if (currentStar && currentStar.phase === 'blackHole') {
            gsap.to(camera.position, {
                y: targetY + 0.5,
                duration: 4,
                ease: "power2.inOut",
                yoyo: true,
                repeat: -1
            });
        }
    }, 3000);
}

// Spawn a random gas cloud (legacy function)
function spawnGasCloud() {
    showCloudSelection();
}

// Start the 20-second collapse timer
function startCollapseTimer() {
    // Clear any existing timer
    if (collapseTimer) {
        clearTimeout(collapseTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 20;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 20 seconds
    collapseTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'nebula') {
            console.log('Gas cloud collapsing into star after 20 seconds...');
            currentStar.createStar();
        }
    }, 20000); // 20 seconds
    
    console.log('Started 20-second collapse timer');
}

// Start the 40-second main sequence timer
function startMainSequenceTimer() {
    // Clear any existing timer
    if (mainSequenceTimer) {
        clearTimeout(mainSequenceTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 40;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 40 seconds
    mainSequenceTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'mainSequence') {
            console.log('Main sequence phase ending after 40 seconds...');
            // Route to different phases based on star mass
            if (currentStar.mass >= 1.4) {
                // Blue stars become blue supergiants
                currentStar.createBlueSupergiant();
            } else if (currentStar.mass < 0.8) {
                // Red dwarfs become blue dwarfs
                currentStar.createBlueDwarf();
            } else {
                // Yellow and smaller stars become sub-giants
                currentStar.createSubGiant();
            }
        }
    }, 40000); // 40 seconds
    
    console.log('Started 40-second main sequence timer');
}

// Start the 10-second sub-giant timer
function startSubGiantTimer() {
    // Clear any existing timer
    if (subGiantTimer) {
        clearTimeout(subGiantTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 10;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 10 seconds
    subGiantTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'subGiant') {
            console.log('Sub-giant phase ending after 10 seconds...');
            currentStar.createGiant();
        }
    }, 10000); // 10 seconds
    
    console.log('Started 10-second sub-giant timer');
}

// Start the 15-second blue supergiant timer
function startBlueSupergiantTimer() {
    // Clear any existing timer
    if (blueSupergiantTimer) {
        clearTimeout(blueSupergiantTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 15;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 15 seconds
    blueSupergiantTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'blueSupergiant') {
            console.log('Blue supergiant phase ending after 15 seconds...');
            currentStar.createSupernova();
        }
    }, 15000); // 15 seconds
    
    console.log('Started 15-second blue supergiant timer');
}

// Start the 10-second giant timer
function startGiantTimer() {
    // Clear any existing timer
    if (giantTimer) {
        clearTimeout(giantTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 10;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 10 seconds
    giantTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'giant') {
            console.log('Giant phase ending after 10 seconds...');
            currentStar.createWhiteDwarf();
        }
    }, 10000); // 10 seconds
    
    console.log('Started 10-second giant timer');
}

// Start the 10-second white dwarf timer
function startWhiteDwarfTimer() {
    // Clear any existing timer
    if (whiteDwarfTimer) {
        clearTimeout(whiteDwarfTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 10;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 10 seconds
    whiteDwarfTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'whiteDwarf') {
            console.log('White dwarf phase ending after 10 seconds...');
            currentStar.createBlackDwarf();
        }
    }, 10000); // 10 seconds
    
    console.log('Started 10-second white dwarf timer');
}

// Start the 10-second black dwarf timer
function startBlackDwarfTimer() {
    // Clear any existing timer
    if (blackDwarfTimer) {
        clearTimeout(blackDwarfTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 10;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 10 seconds
    blackDwarfTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'blackDwarf') {
            console.log('Black dwarf phase ending after 10 seconds...');
            currentStar.createIronStar();
        }
    }, 10000); // 10 seconds
    
    console.log('Started 10-second black dwarf timer');
}

// Red Dwarf Timer Functions

// Start the 20-second blue dwarf timer
function startBlueDwarfTimer() {
    // Clear any existing timer
    if (blueSupergiantTimer) {
        clearTimeout(blueSupergiantTimer);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Show countdown UI
    showCountdown();
    countdownSeconds = 20;
    updateCountdownDisplay();
    
    // Start countdown interval
    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownInterval);
            hideCountdown();
        }
    }, 1000);
    
    // Set timer for 20 seconds
    blueSupergiantTimer = setTimeout(() => {
        if (currentStar && currentStar.phase === 'blueDwarf') {
            console.log('Blue dwarf phase ending after 20 seconds...');
            currentStar.createWhiteDwarf();
        }
    }, 20000); // 20 seconds
    
    console.log('Started 20-second blue dwarf timer');
}


// Show countdown UI
function showCountdown() {
    const countdownContainer = document.getElementById('countdown-container');
    countdownContainer.classList.remove('hidden');
}

// Hide countdown UI
function hideCountdown() {
    const countdownContainer = document.getElementById('countdown-container');
    countdownContainer.classList.add('hidden');
}

// Update countdown display
function updateCountdownDisplay() {
    const secondsElement = document.getElementById('countdown-seconds');
    const progressElement = document.getElementById('countdown-progress');
    
    if (secondsElement) {
        secondsElement.textContent = countdownSeconds;
    }
    
    if (progressElement) {
        // Determine max seconds based on current phase
        let maxSeconds = 20; // Default for nebula
        if (currentStar) {
            switch(currentStar.phase) {
                case 'mainSequence': maxSeconds = 40; break;
                case 'subGiant': maxSeconds = 10; break;
                case 'blueSupergiant': maxSeconds = 15; break;
                case 'giant': maxSeconds = 10; break;
                case 'whiteDwarf': maxSeconds = 10; break;
                case 'blackDwarf': maxSeconds = 10; break;
                // Red Dwarf Evolution Phases
                case 'blueDwarf': maxSeconds = 20; break;
                default: maxSeconds = 20; break;
            }
        }
        const progress = (countdownSeconds / maxSeconds) * 100;
        progressElement.style.width = progress + '%';
    }
}

// Reset simulation to initial state
function resetSimulation() {
    // Clear collapse timer
    if (collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
    }
    if (mainSequenceTimer) {
        clearTimeout(mainSequenceTimer);
        mainSequenceTimer = null;
    }
    if (subGiantTimer) {
        clearTimeout(subGiantTimer);
        subGiantTimer = null;
    }
    if (blueSupergiantTimer) {
        clearTimeout(blueSupergiantTimer);
        blueSupergiantTimer = null;
    }
    if (giantTimer) {
        clearTimeout(giantTimer);
        giantTimer = null;
    }
    if (whiteDwarfTimer) {
        clearTimeout(whiteDwarfTimer);
        whiteDwarfTimer = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Hide countdown
    hideCountdown();
    
    // Remove existing star
    if (currentStar) {
        if (currentStar.particles) {
            scene.remove(currentStar.particles);
            currentStar.particles.geometry.dispose();
            currentStar.particles.material.dispose();
        }
        if (currentStar.mesh) {
            scene.remove(currentStar.mesh);
            currentStar.mesh.geometry.dispose();
            currentStar.mesh.material.dispose();
        }
        if (currentStar.halos) {
            currentStar.halos.forEach(halo => {
                scene.remove(halo);
                halo.geometry.dispose();
                halo.material.dispose();
            });
        }
        
        // Clean up planetary nebula objects
        if (currentStar.planetaryNebula) {
            scene.remove(currentStar.planetaryNebula);
            currentStar.planetaryNebula.geometry.dispose();
            currentStar.planetaryNebula.material.dispose();
        }
        
        if (currentStar.nebulaShells) {
            currentStar.nebulaShells.forEach(shell => {
                scene.remove(shell);
                shell.geometry.dispose();
                shell.material.dispose();
            });
        }
        
        // Clean up iron star glow
        if (currentStar.ironGlow) {
            scene.remove(currentStar.ironGlow);
            currentStar.ironGlow.geometry.dispose();
            currentStar.ironGlow.material.dispose();
        }
        
        // Clean up supernova effects
        if (currentStar.supernovaParticles) {
            scene.remove(currentStar.supernovaParticles);
            currentStar.supernovaParticles.geometry.dispose();
            currentStar.supernovaParticles.material.dispose();
        }
        
        if (currentStar.shockwaves) {
            currentStar.shockwaves.forEach(shockwave => {
                scene.remove(shockwave);
                shockwave.geometry.dispose();
                shockwave.material.dispose();
            });
        }
        
        if (currentStar.lightFlash) {
            scene.remove(currentStar.lightFlash);
            currentStar.lightFlash.geometry.dispose();
            currentStar.lightFlash.material.dispose();
        }
        
        // Clean up neutron star effects
        if (currentStar.neutronShells) {
            currentStar.neutronShells.forEach(shell => {
                scene.remove(shell);
                shell.geometry.dispose();
                shell.material.dispose();
            });
        }
        
        if (currentStar.pulsarBeams) {
            currentStar.pulsarBeams.forEach(beam => {
                scene.remove(beam);
                beam.geometry.dispose();
                beam.material.dispose();
            });
        }
        
        // Clean up black hole effects
        if (currentStar.accretionRings) {
            currentStar.accretionRings.forEach(ring => {
                scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            });
        }

        if (currentStar.spiralArms) {
            currentStar.spiralArms.forEach(arm => {
                scene.remove(arm);
                arm.geometry.dispose();
                arm.material.dispose();
            });
        }

        if (currentStar.photonRing) {
            scene.remove(currentStar.photonRing);
            currentStar.photonRing.geometry.dispose();
            currentStar.photonRing.material.dispose();
        }

        if (currentStar.brightInnerRings) {
            currentStar.brightInnerRings.forEach(ring => {
                scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            });
        }

        if (currentStar.accretionHalo) {
            currentStar.accretionHalo.forEach(halo => {
                scene.remove(halo);
                halo.geometry.dispose();
                halo.material.dispose();
            });
        }

        if (currentStar.outerGlow) {
            scene.remove(currentStar.outerGlow);
            currentStar.outerGlow.geometry.dispose();
            currentStar.outerGlow.material.dispose();
        }

        if (currentStar.eventHorizon) {
            scene.remove(currentStar.eventHorizon);
            currentStar.eventHorizon.geometry.dispose();
            currentStar.eventHorizon.material.dispose();
        }

        if (currentStar.shadowDisk) {
            scene.remove(currentStar.shadowDisk);
            currentStar.shadowDisk.geometry.dispose();
            currentStar.shadowDisk.material.dispose();
        }

        if (currentStar.lensingSphere) {
            scene.remove(currentStar.lensingSphere);
            currentStar.lensingSphere.geometry.dispose();
            currentStar.lensingSphere.material.dispose();
        }
        
        if (currentStar.eventHorizon) {
            scene.remove(currentStar.eventHorizon);
            currentStar.eventHorizon.geometry.dispose();
            currentStar.eventHorizon.material.dispose();
        }
        
        currentStar = null;
    }
    
    // Reset cloud spawned flag
    isCloudSpawned = false;
    
    // Reset UI
    toggleInstructions(true);
    updatePhaseDescription('nebula');
    updateEvolutionProgress(0);
    
    // Reset data display
    document.getElementById('current-phase').textContent = 'Nebula';
    document.getElementById('star-mass').textContent = '1.0 M☉';
    document.getElementById('star-metallicity').textContent = '0.02 Z☉';
    
    console.log('Simulation reset to initial state');
}

// Show confirmation modal
function showResetModal() {
    const modal = document.getElementById('reset-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

// Hide confirmation modal
function hideResetModal() {
    const modal = document.getElementById('reset-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Update phase description
function updatePhaseDescription(phase) {
    const descriptions = {
        'nebula': 'A dense cloud of gas and dust begins to collapse under its own gravity...',
        'protostar': 'The cloud collapses further, heating up as gravitational energy converts to thermal energy.',
        'mainSequence': 'Nuclear fusion ignites in the core, creating a stable main sequence star.',
        'subGiant': 'The star begins to expand as it exhausts hydrogen in its core, becoming a sub-giant.',
        'blueSupergiant': 'The massive blue star expands dramatically to become a blue supergiant - 25x larger!',
        'giant': 'The star continues expanding dramatically, with its core now as large as the previous corona.',
        'redGiant': 'The star expands dramatically as it exhausts its hydrogen fuel.',
        'whiteDwarf': 'The star sheds its outer layers, leaving behind a dense white dwarf core.',
        'blackDwarf': 'The white dwarf has cooled completely and faded to black - the end of stellar evolution.',
        'ironStar': 'The black dwarf has transformed into a glowing purple iron star with restored corona!',
        'supernova': 'The massive star explodes in a spectacular supernova!',
        'neutronStar': 'The supernova leaves behind a dense neutron star with pulsating beams and expanding gas shells!',
        'blackHole': 'The supernova collapses into a black hole with a glowing accretion disk!',
        // Red Dwarf Evolution Phases
        'blueDwarf': 'After trillions of years, the red dwarf becomes hotter and more luminous, shifting to blue-white.'
    };
    
    document.getElementById('phase-description').textContent = descriptions[phase] || 'Unknown phase';
}

// Update evolution progress bar
function updateEvolutionProgress(percent) {
    document.getElementById('evolution-progress').style.width = percent + '%';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Animate current star if it exists
    if (currentStar) {
        
        // Rotate the star/cloud
        if (currentStar.mesh) {
            currentStar.mesh.rotation.y += currentStar.rotationSpeed || 0.01;
        }
        
        // Rotate halos
        if (currentStar.halos) {
            currentStar.halos.forEach((halo, index) => {
                halo.rotation.y += (currentStar.rotationSpeed || 0.01) * (index + 1) * 0.5;
            });
        }
        
        // Rotate iron star glow
        if (currentStar.ironGlow) {
            currentStar.ironGlow.rotation.y += (currentStar.rotationSpeed || 0.01) * 0.3;
        }
        
        // Rotate particles
        if (currentStar.particles) {
            currentStar.particles.rotation.y += currentStar.rotationSpeed || 0.01;
        }
        
        // Add subtle pulsing effect for stars
        if (currentStar.phase === 'mainSequence' && currentStar.mesh) {
            const time = Date.now() * 0.001;
            const pulse = 1 + Math.sin(time * 2) * 0.1;
            currentStar.mesh.scale.setScalar(pulse);
            
            // Pulse halos too
            if (currentStar.halos) {
                currentStar.halos.forEach((halo, index) => {
                    const haloPulse = 1 + Math.sin(time * 2 + index) * 0.05;
                    halo.scale.setScalar(haloPulse);
                });
            }
        }
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('simulation-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Handle mouse wheel zoom
function onMouseWheel(event) {
    event.preventDefault();
    
    const zoomSpeed = 0.5;
    const zoomDirection = event.deltaY > 0 ? 1 : -1;
    
    // Always zoom towards center (0,0,0) since objects spawn there
    const targetX = 0, targetY = 0, targetZ = 0;
    
    // Calculate direction from camera to target
    const direction = new THREE.Vector3(
        targetX - camera.position.x,
        targetY - camera.position.y,
        targetZ - camera.position.z
    );
    
    // Normalize and scale by zoom speed
    direction.normalize();
    direction.multiplyScalar(zoomDirection * zoomSpeed);
    
    // Move camera along the direction to target
    camera.position.add(direction);
    
    // Limit zoom range (distance from target)
    const distance = camera.position.distanceTo(new THREE.Vector3(targetX, targetY, targetZ));
    if (distance < 0.3) {
        // If too close, move back (reduced from 1 to 0.3 for closer zoom)
        const correction = direction.clone().multiplyScalar(-1);
        camera.position.add(correction);
    } else if (distance > 100) {
        // If too far, move closer (increased from 25 to 100 for blue supergiants)
        const correction = direction.clone().multiplyScalar(-1);
        camera.position.add(correction);
    }
    
    // Always look at the center
    camera.lookAt(targetX, targetY, targetZ);
}

// Mouse control functions removed

// Event listeners
function setupEventListeners() {
    // Spawn cloud button
    document.getElementById('spawn-cloud-btn').addEventListener('click', spawnGasCloud);
    
    // Reset button with confirmation
    document.getElementById('reset-btn').addEventListener('click', showResetModal);
    
    // Modal buttons
    document.getElementById('cancel-reset').addEventListener('click', hideResetModal);
    document.getElementById('confirm-reset').addEventListener('click', () => {
        resetSimulation();
        hideResetModal();
    });
    
    // Cloud selection modal buttons
    document.getElementById('cancel-cloud-selection').addEventListener('click', hideCloudSelection);
    document.getElementById('spawn-selected-cloud').addEventListener('click', spawnSelectedCloud);
    
    // Close modals when clicking outside
    document.getElementById('reset-modal').addEventListener('click', (e) => {
        if (e.target.id === 'reset-modal') {
            hideResetModal();
        }
    });
    
    document.getElementById('cloud-selection-modal').addEventListener('click', (e) => {
        if (e.target.id === 'cloud-selection-modal') {
            hideCloudSelection();
        }
    });
    
    // Type selection
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', () => {
            // Remove previous selection
            document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            option.classList.add('selected');
            selectedType = option.dataset.type;
            updateSpawnButton();
        });
    });
    
    // Play/Pause button
    document.getElementById('play-pause-btn').addEventListener('click', () => {
        isPlaying = !isPlaying;
        const btn = document.getElementById('play-pause-btn');
        const icon = btn.querySelector('i');
        if (isPlaying) {
            icon.className = 'fas fa-pause mr-1';
            btn.innerHTML = '<i class="fas fa-pause mr-1"></i>Pause';
        } else {
            icon.className = 'fas fa-play mr-1';
            btn.innerHTML = '<i class="fas fa-play mr-1"></i>Play';
        }
    });
    
    // Speed selector
    document.getElementById('speed-select').addEventListener('change', (e) => {
        console.log('Speed changed to:', e.target.value + 'x');
        // TODO: Implement speed control
    });
    
    // Keyboard shortcuts (development only)
    if (isLocalDev) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                skipToNextStage();
            }
        });
    }
}

// Hide/show instructions
function toggleInstructions(show) {
    const instructions = document.getElementById('instructions');
    if (show) {
        instructions.style.display = 'flex';
    } else {
        instructions.style.display = 'none';
    }
}

// Check if running in local development mode
function checkLocalDev() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    isLocalDev = hostname === '127.0.0.1' || hostname === 'localhost';
    
    if (isLocalDev) {
        console.log('Development mode detected - Press "s" to skip to next stage');
    }
}

// Skip to next stage (development only)
function skipToNextStage() {
    if (!isLocalDev || !currentStar) return;
    
    console.log(`Skipping from ${currentStar.phase} to next stage...`);
    
    // Clear all timers
    if (collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
    }
    if (mainSequenceTimer) {
        clearTimeout(mainSequenceTimer);
        mainSequenceTimer = null;
    }
    if (subGiantTimer) {
        clearTimeout(subGiantTimer);
        subGiantTimer = null;
    }
    if (blueSupergiantTimer) {
        clearTimeout(blueSupergiantTimer);
        blueSupergiantTimer = null;
    }
    if (giantTimer) {
        clearTimeout(giantTimer);
        giantTimer = null;
    }
    if (whiteDwarfTimer) {
        clearTimeout(whiteDwarfTimer);
        whiteDwarfTimer = null;
    }
    if (blackDwarfTimer) {
        clearTimeout(blackDwarfTimer);
        blackDwarfTimer = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Hide countdown
    hideCountdown();
    
    // Skip to next stage based on current phase
    switch(currentStar.phase) {
        case 'nebula':
            console.log('Skipping to main sequence...');
            currentStar.createStar();
            startMainSequenceTimer();
            break;
            
        case 'mainSequence':
            // Route to correct phase based on star mass
            if (currentStar.mass >= 1.4) {
                console.log('Skipping to blue supergiant...');
                currentStar.createBlueSupergiant();
            } else if (currentStar.mass < 0.8) {
                console.log('Skipping to blue dwarf...');
                currentStar.createBlueDwarf();
            } else {
                console.log('Skipping to sub-giant...');
                currentStar.createSubGiant();
            }
            break;
            
        case 'subGiant':
            console.log('Skipping to giant...');
            currentStar.createGiant();
            break;
            
        case 'blueSupergiant':
            console.log('Skipping to supernova...');
            currentStar.createSupernova();
            break;
            
        case 'supernova':
            // Route to correct remnant based on mass
            if (currentStar.mass < 10) {
                console.log('Skipping to neutron star...');
                currentStar.createNeutronStar();
            } else {
                console.log('Skipping to black hole...');
                currentStar.createBlackHole();
            }
            break;
            
        case 'neutronStar':
        case 'blackHole':
            console.log('Already at final stage - stellar remnant');
            break;
            
        case 'giant':
            console.log('Skipping to white dwarf...');
            currentStar.finishWhiteDwarfCreation();
            break;
            
        case 'whiteDwarf':
            console.log('Skipping to black dwarf...');
            currentStar.createBlackDwarf();
            break;
            
        case 'blackDwarf':
            console.log('Skipping to iron star...');
            currentStar.createIronStar();
            break;
            
        case 'ironStar':
            console.log('Already at final stage - iron star');
            break;
            
        // Red Dwarf Evolution Phases
        case 'blueDwarf':
            console.log('Skipping to white dwarf...');
            currentStar.createWhiteDwarf();
            break;
            
        default:
            console.log('Unknown phase, cannot skip');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLocalDev();
    initThreeJS();
    setupEventListeners();
    animate();
    
    // Show instructions initially
    toggleInstructions(true);
});
