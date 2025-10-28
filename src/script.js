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
import { FireParticlesManager } from "./managers/FireParticlesManager.js";
import { SnowManager } from "./managers/SnowManager.js";
import { PostProcessingManager } from "./managers/PostProcessingManager.js";
import Stats from "stats.js";
import themeVertexShader from "./shaders/theme/vertex.glsl";
import themeFragmentShader from "./shaders/theme/fragment.glsl";
import { DarkModeManager } from "./managers/DarkModeManager.js";

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
  clearColor1: "#60451f",
  clearColor2: "#030407",
};

const gui = new GUI({
  title: "Debug",
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
 * Baked Textures & Perlin
 */
const perlinTexture = textureLoader.load("./perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

/**
 * Managers
 */
// Overlay Manager
const overlayManager = new OverlayManager(loadingManager, gui);
overlayManager.addToScene(scene);

// Vinyl Player Manager
const vinylPlayerManager = new VinylPlayerManager();

// Fire Particles Manager
const fireParticlesManager = new FireParticlesManager(perlinTexture, gui);
fireParticlesManager.addToScene(scene);

// Snow Manager
const snowManager = new SnowManager(gui);
snowManager.addToScene(scene);

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

// Baked Texture
const bakedDayTexture = textureLoader.load("./Baked-Day.webp");
bakedDayTexture.flipY = false;
bakedDayTexture.colorSpace = THREE.SRGBColorSpace;

const bakedNightTexture = textureLoader.load("./Baked-Night.webp");
bakedNightTexture.flipY = false;
bakedNightTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Baked Material
 */
const bakedMaterial = new THREE.ShaderMaterial({
  vertexShader: themeVertexShader,
  fragmentShader: themeFragmentShader,
  uniforms: {
    uDayTexture: new THREE.Uniform(bakedDayTexture),
    uNightTexture: new THREE.Uniform(bakedNightTexture),
    uNightMix: new THREE.Uniform(0),
  },
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

  // Update managers on resize
  snowManager.handleResize();
  postProcessingManager.resize(sizes.width, sizes.height);
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

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;
controls.minDistance = 1.5;
controls.maxDistance = 20;
controls.update();

if (window.innerWidth < 786) {
  gui.width = window.innerWidth - 100;

  controls.enablePan = false;

  // Mobile
  camera.position.set(8.221521463083404, 7.027146726208887, 10.037595818238497);
  controls.target.set(
    0.2749239606428338,
    0.26336440652327575,
    -0.14446226482608052
  );
} else {
  camera.position.set(
    3.1508910824642298,
    1.8780255390554759,
    3.3923576481199045
  );
  controls.target.set(
    0.2749239606428338,
    0.26336440652327575,
    -0.14446226482608052
  );
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// // Add clear color control to GUI
// const rendererFolder = gui.addFolder("Renderer");
// rendererFolder.addColor(debugObject, "clearColor").onChange(() => {
//   renderer.setClearColor(debugObject.clearColor);
// });

// Darkmode button
const darkModeManager = new DarkModeManager(
  bakedMaterial,
  gui,
  renderer,
  debugObject
);

/**
 * Post Processing Manager
 */
const postProcessingManager = new PostProcessingManager(
  renderer,
  scene,
  camera,
  gui
);

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

  // Update managers
  fireParticlesManager.update(elapsedTime);
  snowManager.update(elapsedTime);
  postProcessingManager.update(elapsedTime);

  // Update vinyl player
  vinylPlayerManager.update();

  // Update controls
  controls.update();

  // Render with post-processing
  postProcessingManager.render();

  window.requestAnimationFrame(tick);
  stats.end();
};

tick();
