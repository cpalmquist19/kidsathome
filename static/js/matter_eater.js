// Asset versioned via Flask static_file helper (?v=mtime). Change triggers cache bust.
let scene, camera, renderer, player;
let objects = [];
let controls;
const MOVEMENT_SPEED = 0.1;
const ACCELERATION = 0.005;
const FRICTION = 0.99;
let velocity = new THREE.Vector3(0, 0, 0);

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Add skybox
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'static/images/skybox/right.png', // right
        'static/images/skybox/left.png', // left
        'static/images/skybox/top.png', // top
        'static/images/skybox/bottom.png', // bottom
        'static/images/skybox/front.png', // front
        'static/images/skybox/back.png'  // back
    ]);
    scene.background = texture;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Create player (rock)
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.7,
        roughness: 0.2,
    });
    player = new THREE.Mesh(geometry, material);
    scene.add(player);

    // Enhance lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Position camera and player
    camera.position.z = 5;

    // Add some initial collectible objects
    createCollectibles(5);

    // Add event listeners for movement
    document.addEventListener('keydown', onKeyDown);

    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.enablePan = true;
    controls.autoRotate = false;
}

function createCollectibles(count) {
    for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.5 + 0.2;
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            metalness: 0.7,
            roughness: 0.3,
            emissive: new THREE.Color(Math.random() * 0xffffff),
            emissiveIntensity: 0.2
        });
        const object = new THREE.Mesh(geometry, material);

        // Random position
        object.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );

        scene.add(object);
        objects.push(object);
    }
}

function onKeyDown(event) {
    switch(event.key) {
        case 'ArrowUp':
            velocity.y += ACCELERATION;
            break;
        case 'ArrowDown':
            velocity.y -= ACCELERATION;
            break;
        case 'ArrowLeft':
            velocity.x -= ACCELERATION;
            break;
        case 'ArrowRight':
            velocity.x += ACCELERATION;
            break;
        case 'w':
            velocity.z -= ACCELERATION;
            break;
        case 's':
            velocity.z += ACCELERATION;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Apply velocity to player position
    player.position.add(velocity);

    // Apply friction to slow down movement
    velocity.multiplyScalar(FRICTION);

    // Update controls
    controls.target.copy(player.position);
    controls.update();

    // Check collisions
    checkCollisions();

    renderer.render(scene, camera);
}

function checkCollisions() {
    const playerRadius = player.geometry.parameters.radius;

    for (let i = objects.length - 1; i >= 0; i--) {
        const object = objects[i];
        const distance = player.position.distanceTo(object.position);

        if (distance < playerRadius + object.geometry.parameters.radius) {
            // Collision detected - eat the object
            scene.remove(object);
            objects.splice(i, 1);

            // Increase player size
            const newScale = player.scale.x + 0.1;
            player.scale.set(newScale, newScale, newScale);

            // Update score
            document.getElementById('mass-value').textContent =
                (parseFloat(document.getElementById('mass-value').textContent) + 1).toFixed(1);

            // Add new collectible
            createCollectibles(1);
        }
    }
}

// Start the game
window.addEventListener('load', () => {
    init();
    animate();
});
