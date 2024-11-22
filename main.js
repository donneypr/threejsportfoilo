
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersections for clicks
  const intersects = raycaster.intersectObjects([...orbitPivot.children, distantPlanet, ufo]); // Include distantPlanet and UFO in objects
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Check if the clicked object is the "Happy" object
    if (clickedObject.name === 'Happy') {
      moveToDistantPlanet(); // Move to the distant planet
    } 
    // Check if the clicked object is the "Heart" object
    else if (clickedObject.name === 'Heart') {
      moveToUFO(); // Move to the UFO
    }
  }
}

function moveToUFO() {
  const duration = 2; // Duration of the camera transition

  // Get the position of the UFO
  const targetPosition = new THREE.Vector3();
  ufo.getWorldPosition(targetPosition);

  // Offset for the camera's final position (adjusted for a perfect view of the UFO)
  const offset = new THREE.Vector3(50, 2.5, 25);
  const newCameraPosition = targetPosition.clone().add(offset);

  // Create the star tunnel geometry
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000; // Number of stars in the tunnel
  const starPositions = new Float32Array(starCount * 3);

  // Calculate the direction vector from the current camera position to the UFO
  const startPosition = camera.position.clone();
  const direction = newCameraPosition.clone().sub(startPosition).normalize();

  const tunnelRadius = 600; // Reduce the radius for a more focused tunnel

  // Distribute stars more uniformly along the camera path
  for (let i = 0; i < starCount; i++) {
    const t = Math.random(); // Random factor for distance along the path
    const pointOnPath = startPosition
      .clone()
      .add(direction.clone().multiplyScalar(t * newCameraPosition.distanceTo(startPosition)));

    // Spread stars around the path in a circular distribution
    const angle = Math.random() * Math.PI * 2; // Random angle around the path
    const radius = Math.random() * tunnelRadius; // Random radius for circular spread
    starPositions[i * 3] = pointOnPath.x + Math.cos(angle) * radius; // X position
    starPositions[i * 3 + 1] = pointOnPath.y + Math.sin(angle) * radius; // Y position
    starPositions[i * 3 + 2] = pointOnPath.z; // Z position aligned with the path
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5, // Slightly smaller stars for better aesthetics
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const starEffect = new THREE.Points(starGeometry, starMaterial);
  scene.add(starEffect);

  // Smooth camera animation to the UFO
  gsap.to(camera.position, {
    x: newCameraPosition.x,
    y: newCameraPosition.y,
    z: newCameraPosition.z,
    duration: duration,
    onUpdate: () => {
      camera.lookAt(targetPosition); // Ensure the camera always looks at the UFO
    },
    onComplete: () => {
      camera.lookAt(targetPosition); // Final adjustment to face the UFO
      scene.remove(starEffect); // Remove the stars once the animation is complete
    },
  });

  // Animate stars moving more fluidly past the camera
  gsap.to(starEffect.geometry.attributes.position.array, {
    duration: duration,
    onUpdate: () => {
      const positions = starEffect.geometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        // Smoothly move stars along the direction of the camera path
        positions[i * 3] -= direction.x * 20; // Slower movement for better fluidity
        positions[i * 3 + 1] -= direction.y * 20;
        positions[i * 3 + 2] -= direction.z * 20;

        // Recycle stars when they move behind the camera
        if (positions[i * 3 + 2] < startPosition.z) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * tunnelRadius;
          positions[i * 3] = startPosition.x + Math.cos(angle) * radius; // X position
          positions[i * 3 + 1] = startPosition.y + Math.sin(angle) * radius; // Y position
          positions[i * 3 + 2] = startPosition.z + Math.random() * 500; // Z position in front of the camera
        }
      }
      starEffect.geometry.attributes.position.needsUpdate = true;
    },
    repeat: -1, // Repeat continuously for the effect duration
  });
}








function moveToDistantPlanet() {
  const duration = 2; // Duration of the camera transition

  // Get the position of the distant planet
  const targetPosition = new THREE.Vector3();
  distantPlanet.getWorldPosition(targetPosition);

  // Offset for the camera's final position (adjusted for a perfect face-on view of the planet)
  const offset = new THREE.Vector3(37.5, 25, -87.5);
  const newCameraPosition = targetPosition.clone().add(offset);

  // Create the star tunnel geometry
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000; // Number of stars in the tunnel
  const starPositions = new Float32Array(starCount * 3);

  // Calculate the direction vector from the current camera position to the distant planet
  const startPosition = camera.position.clone();
  const direction = newCameraPosition.clone().sub(startPosition).normalize();

  const tunnelRadius = 300; // Radius of the star tunnel

  // Distribute stars along the camera path
  for (let i = 0; i < starCount; i++) {
    const t = Math.random(); // Random factor for distance along the path
    const pointOnPath = startPosition
      .clone()
      .add(direction.clone().multiplyScalar(t * newCameraPosition.distanceTo(startPosition)));

    // Spread stars around the path (wider cylindrical distribution)
    starPositions[i * 3] = pointOnPath.x + THREE.MathUtils.randFloatSpread(tunnelRadius); // Spread in x
    starPositions[i * 3 + 1] = pointOnPath.y + THREE.MathUtils.randFloatSpread(tunnelRadius); // Spread in y
    starPositions[i * 3 + 2] = pointOnPath.z + THREE.MathUtils.randFloatSpread(tunnelRadius); // Spread in z
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2, // Slightly increase star size for better visibility
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const starEffect = new THREE.Points(starGeometry, starMaterial);
  scene.add(starEffect);

  // Smooth camera animation
  gsap.to(camera.position, {
    x: newCameraPosition.x,
    y: newCameraPosition.y,
    z: newCameraPosition.z,
    duration: duration,
    onUpdate: () => {
      camera.lookAt(targetPosition); // Ensure the camera always looks at the planet
    },
    onComplete: () => {
      showRetroPanel(); // Display the retro panel

      camera.lookAt(targetPosition); // Final adjustment to face the planet
      scene.remove(starEffect); // Remove the stars once the animation is complete
    },
  });

  // Animate stars moving past the camera
  gsap.to(starEffect.geometry.attributes.position.array, {
    duration: duration,
    onUpdate: () => {
      const positions = starEffect.geometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        // Move stars along the direction of the camera path
        positions[i * 3] -= direction.x * 30; // Adjust based on desired speed
        positions[i * 3 + 1] -= direction.y * 30;
        positions[i * 3 + 2] -= direction.z * 30;

        // Recycle stars when they move past the camera
        if (positions[i * 3 + 2] < startPosition.z) {
          positions[i * 3] = startPosition.x + THREE.MathUtils.randFloatSpread(tunnelRadius);
          positions[i * 3 + 1] = startPosition.y + THREE.MathUtils.randFloatSpread(tunnelRadius);
          positions[i * 3 + 2] = startPosition.z + THREE.MathUtils.randFloat(-500, 0);
        }
      }
      starEffect.geometry.attributes.position.needsUpdate = true;
    },
    repeat: -1, // Repeat continuously for the effect duration
  });
}



function showRetroPanel() {
  const retroPanel = document.getElementById("retro-panel");
  retroPanel.classList.remove("hidden");
  retroPanel.classList.add("show");
}



// Add click event listener
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
//scene.add(lightHelper, gridHelper);

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
Array(4000).fill().forEach(addStar);

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

///////

function createUFO() {
  const ufo = new THREE.Group(); // Create a group for the UFO

  // Saucer (Disk)
  const saucerGeometry = new THREE.CylinderGeometry(20, 15, 3, 64); // Flatter shape
  const saucerMaterial = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.8,
    roughness: 0.3,
  });
  const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial);
  saucer.rotation.x = Math.PI*2; // Horizontal alignment
  ufo.add(saucer);

  const domeGeometry = new THREE.SphereGeometry(8, 32, 32, 0, Math.PI); // Semi-circle
  const domeMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffcc,
    metalness: 0.6,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
  });
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);
  
  // Rotate dome to make it upright
  dome.rotation.x = -Math.PI/2; // Flip the dome vertically
  
  // Position the dome on top of the saucer
  dome.position.set(0, 1, 0); // Adjust the height based on saucer size
  ufo.add(dome);

  // Lights (Around the Perimeter)
  const lightGeometry = new THREE.SphereGeometry(1, 16, 16);
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  for (let i = 0; i < 12; i++) {
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    const angle = (i / 12) * Math.PI * 2; // Spread lights evenly around the saucer
    light.position.set(
      Math.cos(angle) * 17, // Radius slightly larger than the saucer
      -1.5, // Slightly below the saucer
      Math.sin(angle) * 17
    );
    ufo.add(light);
  }

  // Beam (Optional Glow Below UFO)
  const beamGeometry = new THREE.ConeGeometry(7, 25, 32); // Narrower base and height
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
  });
  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.position.set(0, -15, 0); // Centered below the saucer
  beam.rotation.x = Math.PI; // Pointing downward
  ufo.add(beam);

  // Position UFO
  ufo.position.set(400, 20, 200);

  // Add UFO to the scene
  scene.add(ufo);

  // Add hovering animation
  ufo.tick = () => {
    ufo.position.y += Math.sin(Date.now() * 0.005) * 0.2; // Hovering effect
    ufo.rotation.y += 0.01; // Slow rotation
  };

  return ufo;
}

// Create the UFO
const ufo = createUFO();



///////////////////


//distantplanet1
const distantPlanetTexture = new THREE.TextureLoader().load('distant_planet1.jpg');
const distantPlanetGeometry = new THREE.SphereGeometry(15, 64, 64); // Adjust size as needed
const distantPlanetMaterial = new THREE.MeshStandardMaterial({
  map: distantPlanetTexture, // Use the loaded texture
  emissive: 0x111111, // Add a slight glow
  emissiveIntensity: 0.3,
  metalness: 0.6,
  roughness: 0.8,
});

const distantPlanet = new THREE.Mesh(distantPlanetGeometry, distantPlanetMaterial);
distantPlanet.position.set(300, 200, -700); // Place it far from the origin
scene.add(distantPlanet);


//////////////////

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

document.getElementById('close-panel').addEventListener('click', () => {
  const retroPanel = document.getElementById('retro-panel');
  retroPanel.classList.remove('show'); // Hide the panel
  retroPanel.classList.add('hidden'); // Add the hidden class for styling

  // Zoom back into the solar system
  zoomToSolarSystem();
});

// Function to zoom back to the solar system
function zoomToSolarSystem() {
  const endPosition = new THREE.Vector3(40, 30, 30); // Final position closer to heart, crown, spade, and happy
  const duration = 3; // Duration of the camera animation in seconds

  // Smoothly animate the camera back to the endPosition
  gsap.to(camera.position, {
    x: endPosition.x,
    y: endPosition.y,
    z: endPosition.z,
    duration: duration,
    onUpdate: () => {
      camera.lookAt(orbitPivot.position); // Ensure the camera looks at the solar system
    },
    onComplete: () => {
      camera.lookAt(orbitPivot.position); // Final adjustment after animation
    },
  });
}


// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the pivot for orbiting effect
  // orbitPivot.rotation.y += 0.0005;
  if (ufo.tick) ufo.tick();

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

  // Fade out black overlay
  const fadeOutFactor = Math.max(0, Math.min(1, -t / 500)); // Normalize between 0 and 1
  const overlay = document.getElementById('black-overlay');
  overlay.style.opacity = 1 - fadeOutFactor; // Reduce opacity as you scroll

  // Define key points
  const startPosition = new THREE.Vector3(0, 200, 400); // Start far away
  const midPosition = new THREE.Vector3(50, 100, 150);  // Mid-zoom closer, slightly to the right
  const endPosition = new THREE.Vector3(50, 30, 30);  

  const centerOfSolarSystem = new THREE.Vector3(0, 0, 30); // Sun's position

  if (fadeOutFactor < 0.5) {
    // Phase 1: Smooth zoom-in to mid-position
    const progress = fadeOutFactor / 0.5; // Scale to [0, 1]
    camera.position.lerpVectors(startPosition, midPosition, progress);
  } else {
    // Phase 2: Transition to end position with slight orbital effect
    const progress = (fadeOutFactor - 0.5) / 0.5; // Scale to [0, 1] for the second phase
    camera.position.lerpVectors(midPosition, endPosition, progress);

    // Add a slight orbital motion around the sun for dynamic effect
    const angle = progress * Math.PI; // Semi-circle orbit effect
    const radius = 20; // Distance to orbit around the sun
    camera.position.x += radius * Math.sin(angle); // Offset to the right
    camera.position.z += radius * Math.cos(angle);
    camera.position.y += 10 * Math.sin(angle); // Add vertical oscillation
  }

  // Ensure the camera always looks at the sun
  camera.lookAt(centerOfSolarSystem);
}

document.body.onscroll = moveCamera;




animate();
