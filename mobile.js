// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// PointerLockControls setup
const controls = new THREE.PointerLockControls(camera, document.body);
scene.add(controls.getObject());

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
        const x = random(seed++) * 190 - 95;
        const z = random(seed++) * 190 - 95;

        const scale = random(seed++) * 2 + 1;
        const texture = treeTextures[Math.floor(random(seed++) * treeTextures.length)];

        const leavesGeometry = new THREE.PlaneGeometry(6 * scale, 6 * scale);
        const leavesMaterial = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
            color:"#40310f"
        });

        const leaves1 = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves1.position.set(x, 2 * scale, z);
        leaves1.rotation.y = Math.PI / 2;

        const leaves2 = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves2.position.set(x, 2 * scale, z);
        leaves2.rotation.y = 0;

        scene.add(leaves1);
        scene.add(leaves2);
    }
}

generateTrees(42, 50);

// Ground
const sidewalkTexture = textureLoader.load('textures/vereda.jpg');
sidewalkTexture.wrapS = THREE.RepeatWrapping;
sidewalkTexture.wrapT = THREE.RepeatWrapping;
sidewalkTexture.repeat.set(5, 5);

const groundTexture = textureLoader.load('textures/muddy_ground_512.png');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(30, 30);
const groundGeometry = new THREE.PlaneGeometry(200, 200);
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

camera.position.y = 1.6;
camera.position.z = 10;

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Handle joystick movement
let joystick = document.querySelector('.joystick-inner');
let joystickContainer = document.querySelector('.joystick');
let joystickActive = false;
let startX, startY;

joystick.addEventListener('touchstart', function (e) {
    joystickActive = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

joystick.addEventListener('touchmove', function (e) {
    if (joystickActive) {
        let dx = e.touches[0].clientX - startX;
        let dy = e.touches[0].clientY - startY;
        joystick.style.transform = `translate(${dx}px, ${dy}px)`;
        
        moveForward = dy < -10;
        moveBackward = dy > 10;
        moveLeft = dx < -10;
        moveRight = dx > 10;
    }
});

joystick.addEventListener('touchend', function (e) {
    joystickActive = false;
    joystick.style.transform = `translate(-50%, -50%)`;
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
});

document.addEventListener('click', () => {
    controls.lock();
});

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

// Function to generate buildings
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
        const texture = textureLoader.load(`textures/buildings/building_${index % 7 + 1}.png`);

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

        const oldPosition = controls.getObject().position.clone();

        controls.moveRight(moveX);
        controls.moveForward(moveZ);

        if (checkCollisions()) {
            controls.getObject().position.copy(oldPosition);
        }

        velocity.y -= 0.5;
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

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Load skybox textures
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'skybox/gloomy_lf.png',
    'skybox/gloomy_rt.png',
    'skybox/gloomy_up.png',
    'skybox/gloomy_dn.png',
    'skybox/gloomy_ft.png',
    'skybox/gloomy_bk.png'
]);

scene.background = texture;

// Handling camera rotation with touch events
let initialTouch = null;
document.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
        initialTouch = e.touches[0];
    }
}, false);

document.addEventListener('touchmove', function (e) {
    if (e.touches.length === 1 && initialTouch) {
        const deltaX = e.touches[0].clientX - initialTouch.clientX;
        const deltaY = e.touches[0].clientY - initialTouch.clientY;

        controls.getObject().rotation.y -= deltaX * 0.002;
        camera.rotation.x -= deltaY * 0.002;

        initialTouch = e.touches[0];
    }
}, false);

document.addEventListener('touchend', function (e) {
    initialTouch = null;
}, false);
