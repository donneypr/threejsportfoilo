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

// Updated Full Code
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

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
pointLight.position.set(20, 20, 20);

const ambLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjusted for softer overall brightness
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
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);

  // Store the star and its initial Y position for the breathing effect
  stars.push({ mesh: star, initialY: y });

  scene.add(star);
}
Array(300).fill().forEach(addStar);

// Background Texture
const spaceTexture = new THREE.TextureLoader().load('background.jpg');
scene.background = spaceTexture;

// Torus
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({
  color: 0xff6347,
  emissive: 0xff4500,
  emissiveIntensity: 0.8,
  metalness: 0.7,
  roughness: 0.3,
});
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

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

// Attach hover and click event listeners
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the pivot for orbiting effect
  orbitPivot.rotation.y += 0.01;

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

  torus.rotation.y += 0.01;
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
