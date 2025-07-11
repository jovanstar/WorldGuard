// Open City - GTA 5 Inspired Game
class OpenCityGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        
        this.player = {
            body: null,
            mesh: null,
            health: 100,
            money: 1000,
            wantedLevel: 0,
            inVehicle: false,
            currentVehicle: null,
            speed: 5,
            runSpeed: 8
        };
        
        this.vehicles = [];
        this.buildings = [];
        this.npcs = [];
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.camera_rotation = { x: 0, y: 0 };
        
        this.gameLoaded = false;
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        this.setupRenderer();
        this.setupPhysics();
        this.setupScene();
        this.setupLighting();
        this.setupPlayer();
        this.createCity();
        this.spawnVehicles();
        this.setupControls();
        this.setupUI();
        this.animate();
        
        // Hide loading screen after delay
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('gameCanvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            2000
        );
    }
    
    setupPhysics() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -30, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 500, 2000);
        
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x404040,
            transparent: true,
            opacity: 0.8
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        // Ground physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    setupPlayer() {
        // Player visual
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.5);
        const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0066ff });
        this.player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.mesh.position.set(0, 2, 0);
        this.player.mesh.castShadow = true;
        this.scene.add(this.player.mesh);
        
        // Player physics
        const playerShape = new CANNON.Cylinder(0.5, 0.5, 1.5, 8);
        this.player.body = new CANNON.Body({ mass: 10 });
        this.player.body.addShape(playerShape);
        this.player.body.position.set(0, 2, 0);
        this.player.body.material = new CANNON.Material();
        this.player.body.material.friction = 0.1;
        this.world.add(this.player.body);
        
        // Camera setup
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.player.mesh.position);
    }
    
    createCity() {
        // Create a grid of buildings
        for (let i = -20; i <= 20; i += 4) {
            for (let j = -20; j <= 20; j += 4) {
                if (Math.abs(i) < 6 && Math.abs(j) < 6) continue; // Leave space around spawn
                
                if (Math.random() > 0.3) {
                    this.createBuilding(i, j);
                }
            }
        }
        
        // Create roads
        this.createRoads();
    }
    
    createBuilding(x, z) {
        const height = Math.random() * 20 + 5;
        const width = Math.random() * 3 + 2;
        const depth = Math.random() * 3 + 2;
        
        // Building visual
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.5, 0.3 + Math.random() * 0.3)
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);
        
        // Building physics
        const buildingShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const buildingBody = new CANNON.Body({ mass: 0 });
        buildingBody.addShape(buildingShape);
        buildingBody.position.set(x, height / 2, z);
        this.world.add(buildingBody);
        
        this.buildings.push({ mesh: building, body: buildingBody });
    }
    
    createRoads() {
        // Main roads
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Horizontal road
        const hRoadGeometry = new THREE.PlaneGeometry(100, 4);
        const hRoad = new THREE.Mesh(hRoadGeometry, roadMaterial);
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.y = 0.01;
        this.scene.add(hRoad);
        
        // Vertical road
        const vRoadGeometry = new THREE.PlaneGeometry(4, 100);
        const vRoad = new THREE.Mesh(vRoadGeometry, roadMaterial);
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.y = 0.01;
        this.scene.add(vRoad);
    }
    
    spawnVehicles() {
        const vehiclePositions = [
            [10, 1, 5], [-8, 1, -3], [15, 1, -10], [-12, 1, 8]
        ];
        
        vehiclePositions.forEach(pos => {
            this.createVehicle(pos[0], pos[1], pos[2]);
        });
    }
    
    createVehicle(x, y, z) {
        // Vehicle visual
        const vehicleGeometry = new THREE.BoxGeometry(4, 1.5, 2);
        const vehicleMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5)
        });
        const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
        vehicleMesh.position.set(x, y, z);
        vehicleMesh.castShadow = true;
        this.scene.add(vehicleMesh);
        
        // Vehicle physics
        const vehicleShape = new CANNON.Box(new CANNON.Vec3(2, 0.75, 1));
        const vehicleBody = new CANNON.Body({ mass: 500 });
        vehicleBody.addShape(vehicleShape);
        vehicleBody.position.set(x, y, z);
        vehicleBody.material = new CANNON.Material();
        vehicleBody.material.friction = 0.3;
        this.world.add(vehicleBody);
        
        const vehicle = {
            mesh: vehicleMesh,
            body: vehicleBody,
            speed: 0,
            maxSpeed: 25,
            acceleration: 8,
            deceleration: 5
        };
        
        this.vehicles.push(vehicle);
    }
    
    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'KeyF') {
                this.toggleVehicle();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse events
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === this.renderer.domElement) {
                this.mouse.x += event.movementX * 0.002;
                this.mouse.y += event.movementY * 0.002;
                this.mouse.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.mouse.y));
            }
        });
        
        // Pointer lock
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        
        // Hide controls on click
        document.getElementById('controls').addEventListener('click', () => {
            document.getElementById('controls').style.display = 'none';
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupUI() {
        this.updateMinimap();
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.gameLoaded = true;
        }, 500);
    }
    
    toggleVehicle() {
        if (!this.player.inVehicle) {
            // Try to enter a vehicle
            const playerPos = this.player.body.position;
            let closestVehicle = null;
            let closestDistance = 5; // Max distance to enter vehicle
            
            this.vehicles.forEach(vehicle => {
                const distance = playerPos.distanceTo(vehicle.body.position);
                if (distance < closestDistance) {
                    closestVehicle = vehicle;
                    closestDistance = distance;
                }
            });
            
            if (closestVehicle) {
                this.enterVehicle(closestVehicle);
            }
        } else {
            this.exitVehicle();
        }
    }
    
    enterVehicle(vehicle) {
        this.player.inVehicle = true;
        this.player.currentVehicle = vehicle;
        this.player.mesh.visible = false;
        
        // Move player body to vehicle
        this.player.body.position.copy(vehicle.body.position);
        this.player.body.position.y += 2;
    }
    
    exitVehicle() {
        if (this.player.currentVehicle) {
            this.player.inVehicle = false;
            this.player.mesh.visible = true;
            
            // Move player next to vehicle
            const vehiclePos = this.player.currentVehicle.body.position;
            this.player.body.position.set(vehiclePos.x + 3, vehiclePos.y + 1, vehiclePos.z);
            this.player.mesh.position.copy(this.player.body.position);
            
            this.player.currentVehicle = null;
        }
    }
    
    updatePlayer(deltaTime) {
        if (!this.gameLoaded) return;
        
        const moveVector = new THREE.Vector3();
        const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = isRunning ? this.player.runSpeed : this.player.speed;
        
        if (this.keys['KeyW']) moveVector.z -= 1;
        if (this.keys['KeyS']) moveVector.z += 1;
        if (this.keys['KeyA']) moveVector.x -= 1;
        if (this.keys['KeyD']) moveVector.x += 1;
        
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(speed);
            
            // Apply movement relative to camera direction
            const direction = new THREE.Vector3();
            direction.setFromMatrixColumn(this.camera.matrix, 0);
            direction.crossVectors(this.camera.up, direction);
            direction.normalize();
            
            const right = new THREE.Vector3();
            right.setFromMatrixColumn(this.camera.matrix, 0);
            right.normalize();
            
            const movement = new THREE.Vector3();
            movement.addScaledVector(direction, -moveVector.z);
            movement.addScaledVector(right, moveVector.x);
            movement.y = 0;
            movement.normalize();
            movement.multiplyScalar(speed);
            
            this.player.body.velocity.x = movement.x;
            this.player.body.velocity.z = movement.z;
        } else {
            this.player.body.velocity.x *= 0.8;
            this.player.body.velocity.z *= 0.8;
        }
        
        // Update player mesh position
        this.player.mesh.position.copy(this.player.body.position);
    }
    
    updateVehicle(deltaTime) {
        if (!this.player.inVehicle || !this.player.currentVehicle) return;
        
        const vehicle = this.player.currentVehicle;
        let acceleration = 0;
        
        if (this.keys['KeyW']) acceleration = vehicle.acceleration;
        if (this.keys['KeyS']) acceleration = -vehicle.acceleration;
        
        // Apply acceleration
        vehicle.speed += acceleration * deltaTime;
        vehicle.speed *= 0.95; // Natural deceleration
        vehicle.speed = Math.max(-vehicle.maxSpeed/2, Math.min(vehicle.maxSpeed, vehicle.speed));
        
        // Steering
        let steering = 0;
        if (this.keys['KeyA']) steering = 0.5;
        if (this.keys['KeyD']) steering = -0.5;
        
        // Apply movement
        if (Math.abs(vehicle.speed) > 0.1) {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(vehicle.body.quaternion);
            
            vehicle.body.velocity.x = forward.x * vehicle.speed;
            vehicle.body.velocity.z = forward.z * vehicle.speed;
            
            // Apply steering
            if (steering !== 0) {
                const torque = new CANNON.Vec3(0, steering * vehicle.speed * 0.1, 0);
                vehicle.body.angularVelocity.y = steering * Math.abs(vehicle.speed) * 0.05;
            }
        }
        
        // Handbrake
        if (this.keys['Space']) {
            vehicle.body.velocity.x *= 0.5;
            vehicle.body.velocity.z *= 0.5;
            vehicle.speed *= 0.5;
        }
        
        // Update vehicle mesh position
        vehicle.mesh.position.copy(vehicle.body.position);
        vehicle.mesh.quaternion.copy(vehicle.body.quaternion);
        
        // Move player with vehicle
        this.player.body.position.copy(vehicle.body.position);
        this.player.body.position.y += 2;
        this.player.mesh.position.copy(this.player.body.position);
    }
    
    updateCamera() {
        if (!this.gameLoaded) return;
        
        let targetPosition;
        
        if (this.player.inVehicle && this.player.currentVehicle) {
            // Vehicle camera
            const vehicle = this.player.currentVehicle;
            const offset = new THREE.Vector3(0, 5, 15);
            offset.applyQuaternion(vehicle.body.quaternion);
            targetPosition = vehicle.body.position.clone().add(offset);
            
            // Look at vehicle
            const lookAt = vehicle.body.position.clone();
            lookAt.y += 1;
            
            this.camera.position.lerp(targetPosition, 0.1);
            this.camera.lookAt(lookAt);
        } else {
            // Third person camera for walking
            const offset = new THREE.Vector3(
                Math.sin(this.mouse.x) * 10,
                5 + Math.sin(this.mouse.y) * 5,
                Math.cos(this.mouse.x) * 10
            );
            
            targetPosition = this.player.body.position.clone().add(offset);
            this.camera.position.lerp(targetPosition, 0.1);
            this.camera.lookAt(this.player.body.position);
        }
    }
    
    updateUI() {
        // Update health bar
        const healthFill = document.getElementById('healthFill');
        healthFill.style.width = `${this.player.health}%`;
        
        // Update money
        document.getElementById('moneyAmount').textContent = this.player.money;
        
        // Update wanted stars
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < this.player.wantedLevel) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    updateMinimap() {
        const canvas = document.getElementById('minimapCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear minimap
        ctx.fillStyle = '#001122';
        ctx.fillRect(0, 0, 200, 200);
        
        // Draw buildings
        ctx.fillStyle = '#444444';
        this.buildings.forEach(building => {
            const x = (building.body.position.x + 50) * 2; // Scale and offset
            const z = (building.body.position.z + 50) * 2;
            if (x >= 0 && x <= 200 && z >= 0 && z <= 200) {
                ctx.fillRect(x - 2, z - 2, 4, 4);
            }
        });
        
        // Draw vehicles
        ctx.fillStyle = '#ffff00';
        this.vehicles.forEach(vehicle => {
            const x = (vehicle.body.position.x + 50) * 2;
            const z = (vehicle.body.position.z + 50) * 2;
            if (x >= 0 && x <= 200 && z >= 0 && z <= 200) {
                ctx.fillRect(x - 1, z - 1, 2, 2);
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update physics
        this.world.step(deltaTime);
        
        // Update game systems
        this.updatePlayer(deltaTime);
        this.updateVehicle(deltaTime);
        this.updateCamera();
        this.updateUI();
        this.updateMinimap();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
window.addEventListener('load', () => {
    new OpenCityGame();
});