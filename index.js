// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// PointerLockControls setup
const controls = new THREE.PointerLockControls(camera, document.body);
scene.add(controls.getObject());



document.addEventListener('click', () => {
    controls.lock();
});

const textureLoader = new THREE.TextureLoader();

// Load tree textures
const treeTextures = [
    textureLoader.load('textures/tree.png'),
    textureLoader.load('textures/tree1.png'),
    textureLoader.load('textures/tree2.png'),
    textureLoader.load('textures/tree3.png'),
    textureLoader.load('textures/tree4.png'),
    textureLoader.load('textures/tree5.png'),
    textureLoader.load('textures/tree6.png'),
    textureLoader.load('textures/tree7.png')
];

// Function to generate trees
function generateTrees(seed, numTrees) {
    function random(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    for (let i = 0; i < numTrees; i++) {
        const x = random(seed++) * 190 - 95; // Random x between -95 and 95
        const z = random(seed++) * 190 - 95; // Random z between -95 and 95

        // Randomize the size of the tree
        const scale = random(seed++) * 2 + 1; // Random scale between 1 and 3

        // Select a random tree texture
        const texture = treeTextures[Math.floor(random(seed++) * treeTextures.length)];

        // Create leaves (planes)
        const leavesGeometry = new THREE.PlaneGeometry(6 * scale, 6 * scale); // Size of leaves plane
        const leavesMaterial = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.5, // Handle transparency
            side: THREE.DoubleSide,
            color:"#40310f"
        }); // Texture for leaves

        const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves1.position.set(x, 2 * scale, z);
        leaves1.rotation.y = Math.PI / 2; // 90 degrees

        const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves2.position.set(x, 2 * scale, z);
        leaves2.rotation.y = 0; // 0 degrees

        // Add leaves to the scene
        scene.add(leaves1);
        scene.add(leaves2);
    }
}

// Generate 50 trees with a specific seed
generateTrees(42, 50);
// Ground
// Load ground texture and set it to repeat
const sidewalkTexture = textureLoader.load('textures/vereda.jpg');
sidewalkTexture.wrapS = THREE.RepeatWrapping;
sidewalkTexture.wrapT = THREE.RepeatWrapping;
sidewalkTexture.repeat.set(5, 5); // Adjust the repeat values as needed

const groundTexture = textureLoader.load('textures/muddy_ground_512.png');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(30, 30); // Adjust the repeat values as needed
const groundGeometry = new THREE.PlaneGeometry(200, 200); // Larger ground
const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture, color:"#40310f"});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = - Math.PI / 2;
scene.add(ground);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 0).normalize();
scene.add(directionalLight);

// Camera initial position
camera.position.y = 1.6; // typical height for a first-person view
camera.position.z = 10;

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Preload building textures
const texturePaths = [
    'textures/buildings/apartments1.png',
    'textures/buildings/apartments2-2.png',
    'textures/buildings/apartments2.png',
    'textures/buildings/apartments2_side.png',
    'textures/buildings/apartments4.png',
    'textures/buildings/apartments5.png',
    'textures/buildings/apartments6.png',
    'textures/buildings/apartments7.png',
    'textures/buildings/apartments8.png',
    'textures/buildings/apartments9.png',
    'textures/buildings/apartment_block5.png',
    'textures/buildings/apartment_block6.png',
    'textures/buildings/apartment_block7.png',
    'textures/buildings/apartment_block8.png',
    'textures/buildings/building_5c.png',
    'textures/buildings/building_center.png',
    'textures/buildings/building_church_side1.png',
    'textures/buildings/building_church_side_bottom1.png',
    'textures/buildings/building_church_side_bottom2.png',
    'textures/buildings/building_church_side_top.png',
    'textures/buildings/building_construction.png',
    'textures/buildings/building_derelict1.png',
    'textures/buildings/building_dks-1.png',
    'textures/buildings/building_dks-2.png',
    'textures/buildings/building_dock.png',
    'textures/buildings/building_dock2.png',
    'textures/buildings/building_dock_apartments.png',
    'textures/buildings/building_dock_apartments2.png',
    'textures/buildings/building_empty.png',
    'textures/buildings/building_factory.png',
    'textures/buildings/building_front2.png',
    'textures/buildings/building_front3.png',
    'textures/buildings/building_front4.png',
    'textures/buildings/building_front5.png',
    'textures/buildings/building_front8.png',
    'textures/buildings/building_garage.png',
    'textures/buildings/building_house1.png',
    'textures/buildings/building_hsp.png',
    'textures/buildings/building_h_windows.png',
    'textures/buildings/building_jmu.png',
    'textures/buildings/building_jmu2.png',
    'textures/buildings/building_l2.png',
    'textures/buildings/building_lb1.png',
    'textures/buildings/building_lh1.png',
    'textures/buildings/building_liver.png',
    'textures/buildings/building_mirrored.png',
    'textures/buildings/building_modern.png',
    'textures/buildings/building_modern2.png',
    'textures/buildings/building_modern3.png',
    'textures/buildings/building_modern_side.png',
    'textures/buildings/building_office.png',
    'textures/buildings/building_office10.png',
    'textures/buildings/building_office11.png',
    'textures/buildings/building_office12.png',
    'textures/buildings/building_office13-end.png',
    'textures/buildings/building_office13.png',
    'textures/buildings/building_office2.png',
    'textures/buildings/building_office3.png',
    'textures/buildings/building_office4.png',
    'textures/buildings/building_office5.png',
    'textures/buildings/building_office7.png',
    'textures/buildings/building_office8.png',
    'textures/buildings/building_office9.png',
    'textures/buildings/building_oldfirm.png',
    'textures/buildings/building_portacabin.png',
    'textures/buildings/building_pub_old.png',
    'textures/buildings/building_showroom_vacant.png',
    'textures/buildings/building_side.png',
    'textures/buildings/building_side2.png',
    'textures/buildings/building_side3.png',
    'textures/buildings/building_side4.png',
    'textures/buildings/building_side5.png'
];
const textures = texturePaths.map(path => textureLoader.load(path));
function generateBuildings(seed) {
    function random(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    const lightDirection = new THREE.Vector3(1, 1, 0).normalize(); // Example light direction

    const positions = new Set();

    while (positions.size < 100) { // Generate 100 unique positions
        const x = Math.floor(random(seed++) * 190 - 95); // Random x between -95 and 95
        const z = Math.floor(random(seed++) * 190 - 95); // Random z between -95 and 95
        positions.add(`${x},${z}`);
    }

positions.forEach((pos, index) => {
    const [i, j] = pos.split(',').map(Number);
    const height = random(seed++) * 30 + 10; // More varied building heights
    const width = random(seed++) * 10 + 5; // Wider buildings
    const depth = random(seed++) * 10 + 5; // Deeper buildings

    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const texture = textures[Math.floor(random(seed++) * textures.length)];

    // Different materials for each side of the building
    const materials = [
        new THREE.MeshBasicMaterial({ map: texture, color: "#5c2306" }), // Right
        new THREE.MeshBasicMaterial({ map: texture, color: "#5c2306" }), // Left
        new THREE.MeshBasicMaterial({ map: texture, color: 0x777777 }), // Top
        new THREE.MeshBasicMaterial({ map: texture, color: 0x444444 }), // Bottom
        new THREE.MeshBasicMaterial({ map: texture, color: "#fcbe2d" }), // Front
        new THREE.MeshBasicMaterial({ map: texture, color: 0x111111 })  // Back
    ];

    const building = new THREE.Mesh(buildingGeometry, materials);
    building.position.set(i, height / 2, j);

    building.userData = { isBuilding: true };
    scene.add(building);

    // Create sidewalk around each building
    const sidewalkGeometry = new THREE.PlaneGeometry(width + 4, depth + 4);
    const sidewalkMaterial = new THREE.MeshBasicMaterial({
        map: sidewalkTexture,
        color: "#40310f",
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });
    const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(i, 0.01, j); // Slightly above ground to avoid z-fighting
    sidewalk.renderOrder = 1; // Ensure sidewalk is rendered after the ground

    scene.add(sidewalk);
});

}

// Call the function to generate buildings with a specific seed
generateBuildings(666);

// Check for collisions
function checkCollisions() {
    const objects = scene.children.filter(obj => obj.userData.isBuilding);

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const objectBox = new THREE.Box3().setFromObject(object);
        const cameraBox = new THREE.Box3().setFromCenterAndSize(controls.getObject().position, new THREE.Vector3(0.5, 1.6, 0.5));

        if (cameraBox.intersectsBox(objectBox)) {
            return true;
        }
    }
    return false;
}

// Keyboard handlers
const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (canJump === true) velocity.y += 10;
            canJump = false;
            break;
    }
};

const onKeyUp = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Animation loop
const animate = function () {
    requestAnimationFrame(animate);

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (controls.isLocked === true) {
        let moveX = 0;
        let moveZ = 0;
        if (moveForward || moveBackward || moveLeft || moveRight) {
            moveX = direction.x * 0.1;
            moveZ = direction.z * 0.1;
        }

        // Save the current position
        const oldPosition = controls.getObject().position.clone();

        // Move the camera
        controls.moveRight(moveX);
        controls.moveForward(moveZ);

        // Check for collisions
        if (checkCollisions()) {
            // Revert to the old position if there's a collision
            controls.getObject().position.copy(oldPosition);
        }

        velocity.y -= 0.5; // gravity
        controls.getObject().position.y += velocity.y * 0.1;

        if (controls.getObject().position.y < 1.6) {
            velocity.y = 0;
            controls.getObject().position.y = 1.6;
            canJump = true;
        }
    }

    renderer.render(scene, camera);
};

animate();

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Load skybox textures
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'skybox/gloomy_lf.png',  // Right
    'skybox/gloomy_rt.png',  // Left
    'skybox/gloomy_up.png',  // Top
    'skybox/gloomy_dn.png',  // Bottom
    'skybox/gloomy_ft.png',  // Front
    'skybox/gloomy_bk.png'   // Back
]);

scene.background = texture;

