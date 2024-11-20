
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

// Handle mouse clicks for objects
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersections for clicks
  const intersects = raycaster.intersectObjects(orbitPivot.children); // Check orbitPivot's children
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Display a popup message with the object's name
    alert(`Clicked on ${clickedObject.name}`);
  }
}

// Attach click event listener
window.addEventListener('click', onMouseClick);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 5); // Adjusted for more brightness
pointLight.position.set(40, 40, 40);

const ambLight = new THREE.AmbientLight(0xffffff, 5); // Adjusted for softer overall brightness
scene.add(pointLight, ambLight);

// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Array to store stars and their initial positions
const stars = [];
function addStar() {
  const geometry = new THREE.SphereGeometry(0.125);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3,
    metalness: 0.5,
    roughness: 0.1,
  });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(350));
  star.position.set(x, y, z);

  stars.push({ mesh: star, initialY: y });

  scene.add(star);
}
Array(1000).fill().forEach(addStar);

// Background Texture
const spaceTexture = new THREE.TextureLoader().load('background.jpg');
scene.background = spaceTexture;

const sunTexture = new THREE.TextureLoader().load('sun.jpg');

const sunGeometry = new THREE.SphereGeometry(10, 64, 64); // Sphere with radius 10 and high resolution
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture, // Apply the sun texture
  emissive: 0xffa500, // Add an emissive glow (orange-like)
  emissiveIntensity: 1.5, // Increase glow intensity
  metalness: 0.5, // Slight metallic effect
  roughness: 0.3, // Moderate roughness
});
const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunSphere);

// Create a pivot for orbiting objects
const orbitPivot = new THREE.Object3D();
scene.add(orbitPivot);

// Smile Sphere
const smileTexture = new THREE.TextureLoader().load('smile.jpg');
const happy = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshBasicMaterial({ map: smileTexture, side: THREE.DoubleSide })
);
happy.name = 'Happy';
happy.position.set(30, 0, 0);
orbitPivot.add(happy);

// Add 3D Heart
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0);
heartShape.bezierCurveTo(0, -5, 5, -5, 5, 0);
heartShape.bezierCurveTo(5, 5, 0, 5, 0, 10);
heartShape.bezierCurveTo(0, 5, -5, 5, -5, 0);
heartShape.bezierCurveTo(-5, -5, 0, -5, 0, 0);

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
  depth: 2,
  bevelEnabled: true,
  bevelThickness: 0.5,
  bevelSize: 0.5,
  bevelSegments: 10,
});

const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff4444,
  emissiveIntensity: 1.5,
  metalness: 0.3,
  roughness: 0.5,
});

const heart = new THREE.Mesh(heartGeometry, heartMaterial);
heart.name = 'Heart';
heart.position.set(0, 0, 30);
heart.rotation.x = Math.PI;
orbitPivot.add(heart);

// Add Crown
const crownShape = new THREE.Shape();
crownShape.moveTo(-6, 0);
crownShape.lineTo(-5, 5);
crownShape.lineTo(-2, 2);
crownShape.lineTo(0, 7);
crownShape.lineTo(2, 2);
crownShape.lineTo(5, 5);
crownShape.lineTo(6, 0);
crownShape.lineTo(-6, 0);

const crownGeometry = new THREE.ExtrudeGeometry(crownShape, {
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.2,
  bevelSegments: 2,
});

const crownMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd700,
  emissive: 0xffaa00,
  emissiveIntensity: 1.2,
  metalness: 0.6,
  roughness: 0.3,
});

const crown = new THREE.Mesh(crownGeometry, crownMaterial);
crown.name = 'Crown';
crown.position.set(-30, -2.5, 0);
orbitPivot.add(crown);

// Add Spade
const spadeShape = new THREE.Shape();
spadeShape.moveTo(0, -5);
spadeShape.quadraticCurveTo(-6, -3, 0, 5);
spadeShape.quadraticCurveTo(6, -3, 0, -5);
spadeShape.moveTo(-2, -5);
spadeShape.lineTo(-1, -7);
spadeShape.lineTo(1, -7);
spadeShape.lineTo(2, -5);

const spadeGeometry = new THREE.ExtrudeGeometry(spadeShape, {
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.2,
  bevelSegments: 2,
});

const spadeMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x333333,
  emissiveIntensity: 1.2,
  metalness: 0.2,
  roughness: 0.7,
});

const spade = new THREE.Mesh(spadeGeometry, spadeMaterial);
spade.name = 'Spade';
spade.position.set(0, 0, -30);
orbitPivot.add(spade);

// Composer and OutlinePass setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
composer.addPass(outlinePass);

outlinePass.edgeStrength = 10; // Outline thickness
outlinePass.edgeGlow = 0.5;    // Glow effect
outlinePass.edgeThickness = 1.0; // Edge thickness
outlinePass.pulsePeriod = 0;    // No pulsing
outlinePass.visibleEdgeColor.set('#ffff00'); // Yellow outline
outlinePass.hiddenEdgeColor.set('#000000'); // Black outline

// Handle mouse movement for hover highlighting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersections for hover
  const intersects = raycaster.intersectObjects([...orbitPivot.children, ...stars.map(s => s.mesh)]);
  if (intersects.length > 0) {
    const object = intersects[0].object;

    // Highlight the object only if it's a new hover
    if (hoveredObject !== object) {
      hoveredObject = object;
      outlinePass.selectedObjects = [hoveredObject];
    }
  } else {
    hoveredObject = null;
    outlinePass.selectedObjects = [];
  }
}


const textureLoader = new THREE.TextureLoader();
const planetTextures = [
  textureLoader.load('mercury.jpg'), // Mercury
  textureLoader.load('venus.jpg'),   // Venus
  textureLoader.load('earth.jpg'),   // Earth
  textureLoader.load('mars.jpg'),    // Mars
  textureLoader.load('jupiter.jpg'), // Jupiter
  textureLoader.load('saturn.jpg'),  // Saturn
  textureLoader.load('uranus.jpg'),  // Uranus
  textureLoader.load('neptune.jpg'), // Neptune
];

// Load the ring texture for Saturn
const saturnRingTexture = textureLoader.load('saturn_ring.jpg');

// Add planets
const planets = [];
function addPlanet(distance, size, speed, texture, hasRing = false) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);

  const material = new THREE.MeshStandardMaterial({
    map: texture, // Apply the texture
    emissive: 0x333333, // Add slight emissive glow
    emissiveIntensity: 0.7,
    metalness: 0.5,
    roughness: 0.8,
  });

  const planet = new THREE.Mesh(geometry, material);

  // Set the planet's initial position
  const angle = Math.random() * Math.PI * 2; // Random angle for initial position
  planet.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
  planet.userData = { angle: angle, speed: speed, distance: distance + 35};

  // If the planet has a ring, add it
  if (hasRing) {
    addRealisticRing(planet, size + 2, size + 4, saturnRingTexture); // Add realistic textured ring
  }

  // Add the planet to the orbitPivot
  orbitPivot.add(planet);
  planets.push(planet);
}

// Function to add a textured ring around a planet
function addRealisticRing(planet, innerRadius, outerRadius, texture) {
  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  
  // Rotate UV mapping for proper alignment
  const uvMapping = ringGeometry.attributes.uv;
  for (let i = 0; i < uvMapping.count; i++) {
    uvMapping.setXY(i, uvMapping.getX(i), uvMapping.getY(i) - 0.5);
  }

  const ringMaterial = new THREE.MeshBasicMaterial({
    map: texture, // Apply the texture
    transparent: true, // Ensure transparency
    opacity: 0.8, // Adjust for subtle blending
    side: THREE.DoubleSide, // Visible from both sides
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2; // Rotate the ring to align with the planet's axis
  planet.add(ring); // Attach the ring to the planet
}

// Add planets with textures in the correct solar system order
addPlanet(15, 0.4, 0.0025, planetTextures[0]); // Mercury
addPlanet(25, 0.95, 0.002, planetTextures[1]); // Venus
addPlanet(35, 1.0, 0.0018, planetTextures[2]); // Earth
addPlanet(45, 0.53, 0.0015, planetTextures[3]); // Mars
addPlanet(60, 11.0, 0.0012, planetTextures[4]); // Jupiter
addPlanet(80, 9.5, 0.001, planetTextures[5], true); // Saturn with a realistic ring
addPlanet(100, 4.0, 0.0008, planetTextures[6]); // Uranus
addPlanet(120, 3.9, 0.0007, planetTextures[7]); // Neptune


// Attach hover and click event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);

// Comet
const cometGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Small comet
const cometMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 2,
  metalness: 0.3,
  roughness: 0.2,
});
const comet = new THREE.Mesh(cometGeometry, cometMaterial);
scene.add(comet);

// Create the comet trail
const trailGeometry = new THREE.BufferGeometry();
const trailParticles = 50; // Number of particles in the trail
const trailPositions = new Float32Array(trailParticles * 3); // x, y, z for each particle
trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

// Use PointsMaterial with blending for a glowing effect
const trailMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.3,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending, // Additive blending for glow
  depthWrite: false, // Prevent depth conflicts for blending
});
const trail = new THREE.Points(trailGeometry, trailMaterial);
scene.add(trail);

// Define the comet's elliptical orbital path
let cometAngle = 0; // Angle for its elliptical path
const cometSemiMajorAxis = 80; // Semi-major axis of the ellipse
const cometSemiMinorAxis = 50; // Semi-minor axis of the ellipse
const cometSpeed = 0.005; // Speed of movement

function updateComet() {
  // Update comet's position along an elliptical orbit
  cometAngle += cometSpeed;
  comet.position.set(
    cometSemiMajorAxis * Math.cos(cometAngle), // Elliptical x-coordinate
    15, // Height above the sun
    cometSemiMinorAxis * Math.sin(cometAngle) // Elliptical z-coordinate
  );

  // Update the trail to follow the comet
  const trailPositions = trail.geometry.attributes.position.array;
  for (let i = trailParticles - 1; i > 0; i--) {
    // Shift each particle's position back to the previous one
    trailPositions[i * 3] = trailPositions[(i - 1) * 3];
    trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
    trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
  }

  // Set the trail's leading particle to the comet's position
  trailPositions[0] = comet.position.x;
  trailPositions[1] = comet.position.y;
  trailPositions[2] = comet.position.z;

  // Mark the trail geometry for update
  trail.geometry.attributes.position.needsUpdate = true;
}

// Second Comet
const tiltedCometGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Small comet
const tiltedCometMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // A different color for the second comet
  emissive: 0xffffff,
  emissiveIntensity: 2,
  metalness: 0.3,
  roughness: 0.2,
});
const tiltedComet = new THREE.Mesh(tiltedCometGeometry, tiltedCometMaterial);
scene.add(tiltedComet);

// Create the tilted comet trail
const tiltedTrailGeometry = new THREE.BufferGeometry();
const tiltedTrailParticles = 50; // Number of particles in the trail
const tiltedTrailPositions = new Float32Array(tiltedTrailParticles * 3); // x, y, z for each particle
tiltedTrailGeometry.setAttribute('position', new THREE.BufferAttribute(tiltedTrailPositions, 3));

// Use PointsMaterial with blending for a glowing effect
const tiltedTrailMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.3,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending, // Additive blending for glow
  depthWrite: false, // Prevent depth conflicts for blending
});
const tiltedTrail = new THREE.Points(tiltedTrailGeometry, tiltedTrailMaterial);
scene.add(tiltedTrail);

// Define the tilted comet's elliptical orbital path
let tiltedCometAngle = 0; // Angle for its elliptical path
const tiltedCometSemiMajorAxis = 90; // Semi-major axis of the ellipse
const tiltedCometSemiMinorAxis = 60; // Semi-minor axis of the ellipse
const tiltedCometSpeed = 0.004; // Speed of movement
const tiltAngle = Math.PI / 6; // Tilt angle (30 degrees)

// Function to update the tilted comet and its trail
function updateTiltedComet() {
  // Update tilted comet's position along an elliptical orbit with tilt
  tiltedCometAngle += tiltedCometSpeed;
  tiltedComet.position.set(
    tiltedCometSemiMajorAxis * Math.cos(tiltedCometAngle), // Elliptical x-coordinate
    15 + tiltedCometSemiMinorAxis * Math.sin(tiltedCometAngle) * Math.sin(tiltAngle), // Add tilt in y-coordinate
    tiltedCometSemiMinorAxis * Math.sin(tiltedCometAngle) * Math.cos(tiltAngle) // Tilted z-coordinate
  );

  // Update the tilted trail to follow the comet
  const tiltedTrailPositions = tiltedTrail.geometry.attributes.position.array;
  for (let i = tiltedTrailParticles - 1; i > 0; i--) {
    // Shift each particle's position back to the previous one
    tiltedTrailPositions[i * 3] = tiltedTrailPositions[(i - 1) * 3];
    tiltedTrailPositions[i * 3 + 1] = tiltedTrailPositions[(i - 1) * 3 + 1];
    tiltedTrailPositions[i * 3 + 2] = tiltedTrailPositions[(i - 1) * 3 + 2];
  }

  // Set the trail's leading particle to the comet's position
  tiltedTrailPositions[0] = tiltedComet.position.x;
  tiltedTrailPositions[1] = tiltedComet.position.y;
  tiltedTrailPositions[2] = tiltedComet.position.z;

  // Mark the tilted trail geometry for update
  tiltedTrail.geometry.attributes.position.needsUpdate = true;
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the pivot for orbiting effect
  // orbitPivot.rotation.y += 0.0005;

  // Rotate individual planets around the pivot
  planets.forEach((planet) => {
    const { angle, speed, distance } = planet.userData;

    // Update angle
    planet.userData.angle += speed;

    // Update position based on updated angle
    planet.position.set(
      distance * Math.cos(planet.userData.angle),
      0,
      distance * Math.sin(planet.userData.angle)
    );
  });

  // Update the comet and its trail
  updateComet();
  updateTiltedComet();


  // Individual rotations
  happy.rotation.y += 0.025;
  heart.rotation.y += 0.025;
  crown.rotation.y += 0.025;
  spade.rotation.y += 0.025;

  // Stars breathing effect
  const time = Date.now() * 0.001;
  stars.forEach(({ mesh, initialY }, index) => {
    const amplitude = 0.5;
    const frequency = 1;
    mesh.position.y = initialY + Math.sin(time * frequency + index * 0.1) * amplitude;
  });

  sunSphere.rotation.y += 0.01;
  controls.update();
  composer.render();
}


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  orbitPivot.rotation.y += t * -0.0001;
  camera.position.z = Math.max(10, 30 + t * -0.01);
  camera.position.x = THREE.MathUtils.clamp(t * -0.0002, -5, 5);
  camera.rotation.y = THREE.MathUtils.clamp(t * -0.0002, -Math.PI / 4, Math.PI / 4);
}

document.body.onscroll = moveCamera;

animate();
