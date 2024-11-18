import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 2); // Increase intensity to 2
pointLight.position.set(20, 20, 20);

const ambLight = new THREE.AmbientLight(0xffffff, 0.2); // Slightly dimmer ambient light
scene.add(pointLight, ambLight);

// Helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.125);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Bright white color
    emissive: 0xffffff, // Bright white glow
    emissiveIntensity: 3, // Increase emissive intensity for brightness
    metalness: 0.5, // Add some reflectivity
    roughness: 0.1, // Reduce roughness for a shinier look
  });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
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
  emissive: 0xff4500, // Add emissive to make the torus glow
  emissiveIntensity: 0.8,
  metalness: 0.7, // Add metallic effect for a shiny look
  roughness: 0.3, // Reduce roughness for a polished look
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Smile Sphere
const smileTexture = new THREE.TextureLoader().load('smile.jpg');
smileTexture.repeat.set(1, 1); // Scale down the texture
smileTexture.wrapS = THREE.RepeatWrapping; // Enable repeating horizontally
smileTexture.wrapT = THREE.RepeatWrapping; // Enable repeating vertically
const happy = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshBasicMaterial({ map: smileTexture, side: THREE.DoubleSide })
);
happy.position.z = 30;
happy.position.setX(-10);
scene.add(happy);

// Add 3D Heart
const heartShape = new THREE.Shape();

// Define the heart's 2D shape
heartShape.moveTo(0, 0);
heartShape.bezierCurveTo(0, -5, 5, -5, 5, 0);
heartShape.bezierCurveTo(5, 5, 0, 5, 0, 10);
heartShape.bezierCurveTo(0, 5, -5, 5, -5, 0);
heartShape.bezierCurveTo(-5, -5, 0, -5, 0, 0);

// Extrude the heart into 3D
const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
  depth: 2, // Thickness of the heart
  bevelEnabled: true,
  bevelThickness: 0.5,
  bevelSize: 0.5,
  bevelSegments: 10,
});

const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000, // Red color
  emissive: 0xff4444, // Bright red glow
  emissiveIntensity: 1.5, // Increase brightness of the glow
  metalness: 0.3, // Slight metallic shine
  roughness: 0.5, // Reduce roughness for a polished look
});

const heart = new THREE.Mesh(heartGeometry, heartMaterial);
heart.position.set(10, 5, 0); // Position the heart
heart.rotation.z = Math.PI; // Flip upside down on the z-axis
scene.add(heart);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  torus.rotation.y += 0.01; // Rotate along the Y-axis
  heart.rotation.y += 0.01; // Rotate the heart
  controls.update();
  renderer.render(scene, camera);
}

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  // Rotate the happy face
  happy.rotation.y += 0.1;

  // Smoothly adjust camera position and limit rotation values to prevent flipping
  camera.position.z = Math.max(10, 30 + t * -0.01); // Ensure z-position doesn't go below 10
  camera.position.x = THREE.MathUtils.clamp(t * -0.0002, -5, 5); // Limit x-position movement
  camera.rotation.y = THREE.MathUtils.clamp(t * -0.0002, -Math.PI / 4, Math.PI / 4); // Limit rotation to prevent flipping
}

document.body.onscroll = moveCamera;

animate();
