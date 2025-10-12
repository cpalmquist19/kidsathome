// Space Explorer 3D - Orbit Controls
// Camera controls that orbit around a target point (the star system)

class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Orbit settings
        this.target = new THREE.Vector3(0, 0, 0); // Center of the star system
        this.minDistance = 1000;
        this.maxDistance = 1000000;
        this.zoomSpeed = 0.1;
        this.rotateSpeed = 1.0;
        this.panSpeed = 0.5;
        
        // Current orbit state
        this.spherical = new THREE.Spherical();
        this.sphericalDelta = new THREE.Spherical();
        this.panOffset = new THREE.Vector3();
        this.zoomChanged = false;
        
        // Mouse state
        this.mouseButtons = {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2
        };
        
        this.state = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_PAN: 4,
            TOUCH_DOLLY_PAN: 5,
            TOUCH_DOLLY_ROTATE: 6
        };
        
        this.currentState = this.state.NONE;
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.setupEventListeners();
        this.update();
    }
    
    setupEventListeners() {
        // Mouse events
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('wheel', this.onWheel.bind(this));
        
        // Prevent context menu
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onMouseDown(event) {
        if (event.button === this.mouseButtons.LEFT) {
            this.currentState = this.state.ROTATE;
        } else if (event.button === this.mouseButtons.RIGHT) {
            this.currentState = this.state.PAN;
        }
        
        this.isMouseDown = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    
    onMouseMove(event) {
        if (!this.isMouseDown) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        
        if (this.currentState === this.state.ROTATE) {
            this.rotate(deltaX, deltaY);
        } else if (this.currentState === this.state.PAN) {
            this.pan(deltaX, deltaY);
        }
        
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
        this.currentState = this.state.NONE;
    }
    
    onWheel(event) {
        event.preventDefault();
        
        const delta = event.deltaY;
        this.dolly(delta);
    }
    
    rotate(deltaX, deltaY) {
        // Convert to spherical coordinates
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        this.spherical.setFromVector3(offset);
        
        // Apply rotation
        this.spherical.theta -= deltaX * this.rotateSpeed * 0.01;
        this.spherical.phi += deltaY * this.rotateSpeed * 0.01;
        
        // Clamp phi to prevent camera flipping
        this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
        
        // Update camera position
        offset.setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
    }
    
    pan(deltaX, deltaY) {
        // Pan the target point
        const panVector = new THREE.Vector3();
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        // Calculate pan direction
        const panLeft = new THREE.Vector3();
        panLeft.crossVectors(this.camera.up, offset).normalize();
        
        const panUp = new THREE.Vector3();
        panUp.copy(this.camera.up);
        
        // Apply pan
        panLeft.multiplyScalar(-deltaX * this.panSpeed);
        panUp.multiplyScalar(deltaY * this.panSpeed);
        
        this.target.add(panLeft);
        this.target.add(panUp);
    }
    
    dolly(delta) {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        const distance = offset.length();
        const scale = delta > 0 ? 1 + this.zoomSpeed : 1 - this.zoomSpeed;
        
        const newDistance = distance * scale;
        
        // Clamp distance
        if (newDistance < this.minDistance) {
            scale = this.minDistance / distance;
        } else if (newDistance > this.maxDistance) {
            scale = this.maxDistance / distance;
        }
        
        offset.multiplyScalar(scale);
        this.camera.position.copy(this.target).add(offset);
    }
    
    update() {
        // Update camera to look at target
        this.camera.lookAt(this.target);
    }
    
    // Public methods for external control
    setTarget(target) {
        this.target.copy(target);
        this.update();
    }
    
    setDistance(distance) {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target).normalize();
        offset.multiplyScalar(distance);
        this.camera.position.copy(this.target).add(offset);
        this.update();
    }
    
    // Cleanup
    dispose() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('wheel', this.onWheel);
    }
}

// Export for use in other modules
window.OrbitControls = OrbitControls;
