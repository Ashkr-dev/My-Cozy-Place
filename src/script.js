import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import CoffeeSmokeMaterial from "./materials/CoffeeSmoke.js";
import FireMaterial from "./materials/Fire.js";
import CandlesMaterial from "./materials/Candles.js";
import OverlayManager from "./managers/OverlayManager.js";
import { VinylPlayerManager } from "./managers/VinylPlayerManager.js";
import Stats from "stats.js";

/**
 * Stats
 */
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/**
 * Base
 */
// Debug
const debugObject = {
  color: "#f4f3d7",
  clearColor: "#02020d",
};

const gui = new GUI({
  width: 400,
});
gui.hide();
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager();

const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("draco/");
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Managers
 */
// Overlay Manager
const overlayManager = new OverlayManager(loadingManager, gui);
overlayManager.addToScene(scene);

// Vinyl Player Manager
const vinylPlayerManager = new VinylPlayerManager();

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentIntersect = null;

// Mouse events
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", (event) => {
  if (currentIntersect) {
    const clickedObject = currentIntersect.object;

    // Check if clicked object is part of vinyl player using the manager
    if (vinylPlayerManager.isVinylObject(clickedObject)) {
      vinylPlayerManager.handleClick();
    }
  }
});

/**
 * Baked Textures & Perlin
 */
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// Baked Texture
const bakedTexture = textureLoader.load("./Baked7.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Baked Material
 */
const bakedMaterial = new THREE.MeshBasicMaterial({
  map: bakedTexture,
});

/**
 * Emissive Material
 */
const LampBulbMaterial = new THREE.MeshBasicMaterial({
  color: debugObject.color,
});
const emissiveFolder = gui.addFolder("Lamp & Fairy emissions");
emissiveFolder.addColor(debugObject, "color").onChange(() => {
  LampBulbMaterial.color.set(debugObject.color);
});

/**
 * Coffee Smoke Material
 */
const coffeeSmokeMaterial = new CoffeeSmokeMaterial(perlinTexture);

/**
 * Fire Material
 */
const fireMaterial = new FireMaterial(perlinTexture, gui);

/**
 * Candles
 */
const candleMaterial = new CandlesMaterial(perlinTexture, gui);

/**
 * Models
 */
let bakedMesh = null;

const cozy_place = gltfLoader.load("./cozy_place4.glb", (gltf) => {
  // Baked Mesh
  bakedMesh = gltf.scene.getObjectByName("baked");
  bakedMesh.material = bakedMaterial;

  /**
   * Emissions
   */
  // Lamps
  const TraditionalLampBulbEmission = gltf.scene.getObjectByName(
    "Traditional-Lamp-Bulb-Emission"
  );
  const ArcLampBulbEmission = gltf.scene.getObjectByName(
    "Arc-Lamp-Bulb-Emission"
  );
  const BuffetLampBulbEmission = gltf.scene.getObjectByName(
    "Buffet-Lamp-Bulb-Emission"
  );
  TraditionalLampBulbEmission.material = LampBulbMaterial;
  ArcLampBulbEmission.material = LampBulbMaterial;
  BuffetLampBulbEmission.material = LampBulbMaterial;

  // Fairy Lights
  const FairyLightsEmission = gltf.scene.getObjectByName("Fairy-Bulb-Emission");
  FairyLightsEmission.material = LampBulbMaterial;

  // Candles
  const candlesThread = gltf.scene.getObjectByName("Candles-Emission");
  candlesThread.material = new THREE.MeshBasicMaterial({
    color: "#000000",
  });

  // Coffee Smoke
  const coffeeSmoke = gltf.scene.getObjectByName("coffee-smoke");
  coffeeSmoke.material = coffeeSmokeMaterial;

  // FirePlace Fire
  const fire = gltf.scene.getObjectByName("fire");
  fire.material = fireMaterial;

  // Candles
  const candles = gltf.scene.getObjectByName("Candles");
  candles.material = candleMaterial;

  /**
   * Vinyl Player Setup
   */
  const vinylDisc = gltf.scene.getObjectByName("vinyl-disc");
  const vinylArm = gltf.scene.getObjectByName("vinyl-arm");
  const vinylPlayer =
    gltf.scene.getObjectByName("vinyl-player") ||
    gltf.scene.getObjectByName("vinylplayer") ||
    gltf.scene.getObjectByName("record-player");

  // Apply materials
  if (vinylDisc) vinylDisc.material = bakedMaterial;
  if (vinylArm) vinylArm.material = bakedMaterial;
  if (vinylPlayer) vinylPlayer.material = bakedMaterial;

  // Initialize vinyl player manager
  const vinylInteractiveObjects = vinylPlayerManager.initialize(
    vinylDisc,
    vinylArm,
    vinylPlayer
  );

  gltf.scene.scale.set(0.2, 0.2, 0.2);
  gltf.scene.position.set(0, -0.5, 0);
  scene.add(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(debugObject.clearColor);

// Add clear color control to GUI
gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Get interactive objects from vinyl manager
  const interactiveObjects = vinylPlayerManager.getInteractiveObjects();

  // Check for intersections
  const intersects = raycaster.intersectObjects(interactiveObjects);

  // Handle hover effects
  if (intersects.length > 0) {
    if (!currentIntersect) {
      document.body.style.cursor = "pointer";
      document.body.classList.add("hovering-vinyl");
    }
    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      document.body.style.cursor = "default";
      document.body.classList.remove("hovering-vinyl");
    }
    currentIntersect = null;
  }

  // Update materials
  coffeeSmokeMaterial.uniforms.uTime.value = elapsedTime;
  fireMaterial.uniforms.uTime.value = elapsedTime;
  candleMaterial.uniforms.uTime.value = elapsedTime;

  // Update vinyl player (for any per-frame updates)
  vinylPlayerManager.update();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
  stats.end();
};

tick();
