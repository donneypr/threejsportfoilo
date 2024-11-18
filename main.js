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

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  torus.rotation.y += 0.01; // Rotate along the Y-axis
  controls.update();
  renderer.render(scene, camera);
}

animate();
